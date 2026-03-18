import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { join } from "path"
import { appendAuditLog } from "@/lib/audit-log"

const DATA_DIR = join(process.cwd(), "data")
const REQUESTS_FILE = join(DATA_DIR, "activation-requests.json")

const ADMIN_ID = "897450827353063505"
const SECONDARY_ADMIN_ID = "1186739142231605248"
const ADMIN_IDS = [ADMIN_ID, SECONDARY_ADMIN_ID]

const ensureDataDir = () => {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
}

const readRequests = () => {
  ensureDataDir()
  if (!existsSync(REQUESTS_FILE)) return []
  try {
    const data = readFileSync(REQUESTS_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

const writeRequests = (rows: any[]) => {
  ensureDataDir()
  writeFileSync(REQUESTS_FILE, JSON.stringify(rows, null, 2))
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      )
    }

    const userId = session.user.id
    const username = session.user.name || "Unknown"
    const requests = readRequests()

    // إذا عنده طلب pending سابق نرجعه كما هو
    const existingPending = requests.find(
      (r: any) => r.userId === userId && r.status === "pending",
    )
    if (existingPending) {
      return NextResponse.json(existingPending, { status: 200 })
    }

    const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const row = {
      id,
      userId,
      username,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    requests.push(row)
    writeRequests(requests)

    appendAuditLog({
      type: "activation-request:create",
      actorId: userId,
      targetId: id,
      meta: { username },
    })

    return NextResponse.json(row, { status: 201 })
  } catch (e) {
    console.error("Error creating activation request:", e)
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const mine = searchParams.get("mine") === "1"
    const all = searchParams.get("all") === "1"

    const rows = readRequests()

    if (mine) {
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 },
        )
      }
      const mineRows = rows.filter((r: any) => r.userId === session.user.id)
      // آخر طلب فقط
      const latest = mineRows.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0]
      return NextResponse.json(latest || null)
    }

    // لعرض كل الطلبات للمدير
    if (all) {
      if (!session?.user?.id || !ADMIN_IDS.includes(session.user.id)) {
        return NextResponse.json(
          { error: "Admin only" },
          { status: 403 },
        )
      }
      // الأحدث أولاً
      const sorted = rows.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      return NextResponse.json(sorted)
    }

    return NextResponse.json([], { status: 200 })
  } catch (e) {
    console.error("Error reading activation requests:", e)
    return NextResponse.json(
      { error: "Failed to read requests" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Admin only" },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { id, status } = body as { id?: string; status?: string }
    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 },
      )
    }

    const rows = readRequests()
    const idx = rows.findIndex((r: any) => r.id === id)
    if (idx === -1) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 },
      )
    }

    const row = rows[idx]
    row.status = status
    row.reviewedAt = new Date().toISOString()
    row.reviewedBy = session.user.id
    rows[idx] = row
    writeRequests(rows)

    // إذا تم قبول الطلب نضيفه في المضيفين (hosts) بصلاحية اللعب فقط
    if (status === "approved") {
      try {
        const res = await fetch(
          `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/hosts`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: row.userId,
              permissions: ["add_questions", "add_categories"],
            }),
          },
        )
        if (!res.ok) {
          console.error("Failed to auto-add host from activation request")
        }
      } catch (e) {
        console.error("Error calling hosts API from activation request:", e)
      }
    }

    appendAuditLog({
      type: "activation-request:update",
      actorId: session.user.id,
      targetId: id,
      meta: { status },
    })

    return NextResponse.json(row, { status: 200 })
  } catch (e) {
    console.error("Error updating activation request:", e)
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 },
    )
  }
}


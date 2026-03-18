import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { readAuditLog } from "@/lib/audit-log"

const DASHBOARD_OWNER_ID = "1186739142231605248"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.id !== DASHBOARD_OWNER_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const entries = readAuditLog().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return NextResponse.json(entries)
}


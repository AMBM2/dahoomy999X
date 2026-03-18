import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { appendAuditLog } from "@/lib/audit-log"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ?? null

    appendAuditLog({
      type: "visit",
      actorId: userId,
      meta: {
        userAgent: request.headers.get("user-agent") || null,
        ip: request.headers.get("x-forwarded-for") || null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}


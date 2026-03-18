import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"
import { appendAuditLog } from "@/lib/audit-log"

const ADMIN_ID = "897450827353063505"
const SECONDARY_ADMIN_ID = "1186739142231605248"
const HOSTS_FILE = join(process.cwd(), "data", "hosts.json")

const ADMIN_IDS = [ADMIN_ID, SECONDARY_ADMIN_ID]

// Permissions available for hosts
export const HOST_PERMISSIONS = ['add_questions', 'add_categories', 'manage_hosts', 'view_stats'] as const

const isAdmin = (userId?: string) => userId && ADMIN_IDS.includes(userId)

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = join(process.cwd(), "data")
  if (!existsSync(dataDir)) {
    const { mkdirSync } = require("fs")
    mkdirSync(dataDir, { recursive: true })
  }
}

// Read hosts from file
const readHosts = () => {
  ensureDataDir()
  if (!existsSync(HOSTS_FILE)) {
    return []
  }
  try {
    const data = readFileSync(HOSTS_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Write hosts to file
const writeHosts = (hosts: any) => {
  ensureDataDir()
  writeFileSync(HOSTS_FILE, JSON.stringify(hosts, null, 2))
}

export async function GET() {
  try {
    const hosts = readHosts()
    return NextResponse.json(hosts)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read hosts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, permissions = [] } = body

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    const hosts = readHosts()
    
    // Check if host already exists
    if (hosts.find((h: any) => h.userId === userId)) {
      return NextResponse.json(
        { error: "This user is already a host" },
        { status: 400 }
      )
    }

    // Validate permissions
    const validPermissions = permissions.filter((p: string) => HOST_PERMISSIONS.includes(p as any))

    const newHost = {
      id: `host-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      permissions: validPermissions,
      createdAt: new Date().toISOString(),
      createdBy: session.user.id
    }

    hosts.push(newHost)
    writeHosts(hosts)

    appendAuditLog({
      type: "host:add",
      actorId: session.user.id,
      targetId: userId,
      meta: { permissions: validPermissions },
    })

    return NextResponse.json(newHost, { status: 201 })
  } catch (error) {
    console.error("Error adding host:", error)
    return NextResponse.json(
      { error: "Failed to add host" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, permissions } = body

    if (!userId || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "userId and permissions array are required" },
        { status: 400 }
      )
    }

    const hosts = readHosts()
    const hostIndex = hosts.findIndex((h: any) => h.userId === userId)

    if (hostIndex === -1) {
      return NextResponse.json(
        { error: "Host not found" },
        { status: 404 }
      )
    }

    // Validate permissions
    const validPermissions = permissions.filter((p: string) => HOST_PERMISSIONS.includes(p as any))
    hosts[hostIndex].permissions = validPermissions
    hosts[hostIndex].updatedAt = new Date().toISOString()
    hosts[hostIndex].updatedBy = session.user.id

    writeHosts(hosts)

    appendAuditLog({
      type: "host:update-permissions",
      actorId: session.user.id,
      targetId: userId,
      meta: { permissions: validPermissions },
    })

    return NextResponse.json(hosts[hostIndex], { status: 200 })
  } catch (error) {
    console.error("Error updating host permissions:", error)
    return NextResponse.json(
      { error: "Failed to update host permissions" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    const hosts = readHosts()
    const filteredHosts = hosts.filter((h: any) => h.userId !== userId)
    
    if (filteredHosts.length === hosts.length) {
      return NextResponse.json(
        { error: "Host not found" },
        { status: 404 }
      )
    }

    writeHosts(filteredHosts)

    appendAuditLog({
      type: "host:remove",
      actorId: session.user.id,
      targetId: userId,
    })

    return NextResponse.json(
      { message: "Host removed successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error removing host:", error)
    return NextResponse.json(
      { error: "Failed to remove host" },
      { status: 500 }
    )
  }
}

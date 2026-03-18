import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Discord API endpoint for fetching user info
const DISCORD_API = "https://discord.com/api/v10"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = id
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Try to get the user from Discord API if they have a token
    const session = await getServerSession(authOptions)
    
    if (session?.user?.id === userId) {
      // Return current user info from session
      return NextResponse.json({
        id: session.user.id,
        name: session.user.name || "Unknown",
        image: session.user.image || null,
        email: session.user.email || null,
        flags: (session.user as any).flags || 0,
        premiumType: (session.user as any).premiumType || 0,
      })
    }

    // For other users, try to fetch from cache or return basic info
    // Note: We can't fetch arbitrary Discord user info without admin scope
    // So we'll return a cached/stored version if available
    return NextResponse.json(
      { error: "User not found in current session" },
      { status: 404 }
    )
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

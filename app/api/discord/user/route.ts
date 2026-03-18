import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId || userId.trim() === "") {
      return NextResponse.json(
        { error: "معرف المستخدم مطلوب" },
        { status: 400 }
      )
    }

    // Try to get bot token from environment
    const token = process.env.DISCORD_BOT_TOKEN

    // If no bot token, try to use session token
    if (!token) {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "يرجى تسجيل الدخول أولاً" },
          { status: 401 }
        )
      }

      // Return limited user info - when bot token is not available
      // This is a fallback that returns a placeholder response
      if (userId === session.user.id) {
        return NextResponse.json({
          id: session.user.id,
          username: session.user.name || "Unknown",
          discriminator: "0",
          avatar: session.user.image || "",
          displayName: session.user.name || "Unknown User",
          public_flags: 0,
        })
      }

      return NextResponse.json(
        { error: "بدون Bot Token - لا يمكن جلب بيانات مستخدمين آخرين" },
        { status: 403 }
      )
    }

    // Use bot token to fetch user
    let response
    let attempts = 0
    const maxAttempts = 2

    while (attempts < maxAttempts) {
      try {
        response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bot ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "DiscordBot (Dahoomy/1.0)",
          },
        })
        break
      } catch (fetchError) {
        attempts++
        if (attempts >= maxAttempts) throw fetchError
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    if (!response) {
      throw new Error("فشل الاتصال بـ Discord API")
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Discord API response error:", {
        status: response.status,
        data: errorData,
        userId
      })

      if (response.status === 404) {
        return NextResponse.json(
          { error: `لم يتم العثور على المستخدم ${userId} على Discord` },
          { status: 404 }
        )
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: "خطأ في التوثيق - تحقق من بيانات Discord Bot Token" },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: `خطأ Discord (${response.status}): ${errorData.message || "فشل جلب بيانات المستخدم"}` },
        { status: response.status }
      )
    }

    const userData = await response.json()

    // Build avatar URL with fallback
    const avatarUrl = userData.avatar
      ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.webp?size=160`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator || "0") % 5}.png`

    return NextResponse.json({
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator || "0",
      avatar: avatarUrl,
      displayName: userData.global_name || userData.username || "Unknown User",
      public_flags: userData.public_flags || 0,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "خطأ غير معروف"
    console.error("Error fetching Discord user:", {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { error: `فشل جلب بيانات المستخدم: ${errorMsg}` },
      { status: 500 }
    )
  }
}

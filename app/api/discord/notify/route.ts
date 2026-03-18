import { NextRequest, NextResponse } from "next/server"

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL

export async function POST(req: NextRequest) {
  if (!DISCORD_WEBHOOK || DISCORD_WEBHOOK.includes("placeholder")) {
    // Silently ignore if webhook not configured (not an error, just informational logging disabled)
    return NextResponse.json({ ok: true })
  }

  try {
   const body = await req.json()
    const { type, theme, purchase } = body as {
      type: "theme_selected" | "purchase_completed"
      theme?: string
      purchase?: { item: string; amount?: number }
    }

    let content: Record<string, unknown>
    if (type === "theme_selected" && theme) {
      content = {
        embeds: [{
          title: "🎨 تم اختيار ثيم جديد",
          description: `**الثيم:** ${theme === "dahoomy-999" ? "🌟 دحومي 999 الإصدار الخاص" : theme === "gold" ? "الثيم الملكي" : theme}`,
          color: theme === "dahoomy-999" ? 0x06b6d4 : 0xc5a059,
          timestamp: new Date().toISOString(),
          footer: { text: "دحومي 999 🚀" },
        }],
      }
    } else if (type === "purchase_completed" && purchase) {
      content = {
        embeds: [{
          title: "🏆 اكتمال عملية شراء",
          description: `**المنتج:** ${purchase.item}${purchase.amount ? `\n**المبلغ:** ${purchase.amount}` : ""}\n\n**تم باستخدام:** 🌟 ثيم دحومي 999 الخاص`,
          color: 0x06b6d4,
          timestamp: new Date().toISOString(),
          footer: { text: "🏆 A user won using the Dahoomy 999 Special Edition theme!" },
        }],
      }
    } else {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 })
    }

    const res = await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Discord API: ${res.status} ${text}`)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    // Silently ignore webhook errors - they're not critical to app operation
    return NextResponse.json({ ok: true })
  }
}

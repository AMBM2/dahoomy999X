import { NextRequest, NextResponse } from "next/server"

const MAP: Record<string, { label: string; emoji: string; bg1: string; bg2: string }> = {
  "cat-math": { label: "رياضيات", emoji: "🧮", bg1: "#0ea5e9", bg2: "#7c3aed" },
  "cat-minecraft": { label: "ماين كرافت", emoji: "⛏️", bg1: "#22c55e", bg2: "#0ea5e9" },
  "cat-choices": { label: "اختيارات", emoji: "✅", bg1: "#0ea5e9", bg2: "#22c55e" },
  "cat-memory": { label: "الذاكرة", emoji: "🧠", bg1: "#7c3aed", bg2: "#0ea5e9" },
  "cat-focus": { label: "ركز", emoji: "🎯", bg1: "#0ea5e9", bg2: "#f43f5e" },
  "cat-logos": { label: "شعارات", emoji: "🏷️", bg1: "#0ea5e9", bg2: "#7c3aed" },
  "cat-emoji": { label: "ايموجي", emoji: "😃", bg1: "#22c55e", bg2: "#0ea5e9" },
  "cat-two-words": { label: "جواب كلمتين", emoji: "🗣️", bg1: "#0ea5e9", bg2: "#7c3aed" },
  "cat-fix-error": { label: "صحح الخطأ", emoji: "🛠️", bg1: "#f43f5e", bg2: "#0ea5e9" },
  "cat-who-am-i": { label: "من انا", emoji: "🕵️", bg1: "#7c3aed", bg2: "#0ea5e9" },
  "cat-scrambled-letters": { label: "حروف مبعثرة", emoji: "🔤", bg1: "#0ea5e9", bg2: "#22c55e" },
  "cat-flags": { label: "اعلام", emoji: "🏳️", bg1: "#0ea5e9", bg2: "#7c3aed" },
  "cat-passports": { label: "جوازات دول", emoji: "🛂", bg1: "#0ea5e9", bg2: "#22c55e" },
  "cat-quran": { label: "القران", emoji: "📖", bg1: "#22c55e", bg2: "#0ea5e9" },
  "cat-country-logos": { label: "شعارات دول", emoji: "🌍", bg1: "#0ea5e9", bg2: "#7c3aed" },
  "cat-cars": { label: "سيارات", emoji: "🚗", bg1: "#0ea5e9", bg2: "#f43f5e" },
  "cat-maps": { label: "خرائط", emoji: "🗺️", bg1: "#0ea5e9", bg2: "#7c3aed" },
  "cat-general": { label: "معلومات عامة", emoji: "💡", bg1: "#0ea5e9", bg2: "#22c55e" },
  "cat-languages": { label: "لغات ولهجات", emoji: "🗣️", bg1: "#7c3aed", bg2: "#0ea5e9" },
  "cat-killer": { label: "من القاتل", emoji: "🩸", bg1: "#f43f5e", bg2: "#0ea5e9" },
  "cat-team-power": { label: "فريق باور", emoji: "⚡", bg1: "#0ea5e9", bg2: "#7c3aed" },
  "cat-video-games": { label: "العاب الاكترونيه", emoji: "🎮", bg1: "#0ea5e9", bg2: "#22c55e" },
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const item = MAP[id] || { label: id, emoji: "🎮", bg1: "#0ea5e9", bg2: "#7c3aed" }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${item.bg1}" stop-opacity="1"/>
      <stop offset="1" stop-color="${item.bg2}" stop-opacity="1"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect x="24" y="24" width="464" height="464" rx="48" fill="url(#g)"/>
  <rect x="24" y="24" width="464" height="464" rx="48" fill="#000" opacity="0.12"/>
  <g filter="url(#shadow)">
    <text x="256" y="250" text-anchor="middle" dominant-baseline="middle" font-size="140">${item.emoji}</text>
    <text x="256" y="365" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="44" fill="#fff">${item.label}</text>
  </g>
</svg>`

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}


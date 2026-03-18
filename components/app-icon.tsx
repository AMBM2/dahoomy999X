"use client"

import type { LucideIcon } from "lucide-react"

export default function AppIcon(props: {
  icon: LucideIcon
  size?: number
  className?: string
  accent?: "cyan" | "purple" | "blue"
}) {
  const { icon: Icon, size = 22, className = "", accent = "cyan" } = props

  const accentMap = {
    cyan: {
      ring: "border-cyan-400/40",
      bg: "bg-cyan-500/10",
      glow: "shadow-cyan-500/25",
      color: "#00A8E8",
    },
    blue: {
      ring: "border-blue-400/40",
      bg: "bg-blue-500/10",
      glow: "shadow-blue-500/25",
      color: "#3B82F6",
    },
    purple: {
      ring: "border-purple-400/40",
      bg: "bg-purple-500/10",
      glow: "shadow-purple-500/25",
      color: "#A855F7",
    },
  } as const

  const a = accentMap[accent]

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl border ${a.ring} ${a.bg} shadow-sm ${a.glow} backdrop-blur-sm ${className}`}
      style={{ width: size + 18, height: size + 18 }}
    >
      <Icon size={size} color={a.color} strokeWidth={1.75} className="drop-shadow-sm" />
    </span>
  )
}


"use client"

import { useTheme } from "@/components/theme-provider"

export default function DahoomyWatermark() {
  const { theme } = useTheme()
  if (theme !== "dahoomy-999") return null
  return (
    <div
      className="dahoomy-watermark"
      style={{ transform: "translateZ(0)" }}
      aria-hidden
    />
  )
}

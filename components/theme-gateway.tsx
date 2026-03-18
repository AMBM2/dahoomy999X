"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useTheme } from "@/components/theme-provider"
import { DiscordStatusCard } from "@/components/discord-status-card"
import { LeaderboardCard } from "@/components/leaderboard-card"
import { GameModeSelector } from "@/components/game-mode-selector"

type ThemeChoice = "dahoomy-999"

interface ThemeGatewayProps {
  onConfirm: () => void
}

const DAHOOMY_LOGO = "/images/dahoomy-999.png"

export default function ThemeGateway({ onConfirm }: ThemeGatewayProps) {
  const { theme, setTheme: setThemeContext } = useTheme()
  const [selected, setSelected] = useState<ThemeChoice>("dahoomy-999")
  
  // Set theme to dahoomy-999 on mount
  useEffect(() => {
    setThemeContext("dahoomy-999")
  }, [setThemeContext])
  
  // Removed: Heavy particle system and parallax effects for performance
  const containerRef = useRef<HTMLDivElement>(null)

  const handleConfirm = useCallback(() => {
    setThemeContext(selected)
    onConfirm()
  }, [selected, setThemeContext, onConfirm])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-start gap-8 px-4 overflow-y-auto overflow-x-hidden min-h-screen"
      suppressHydrationWarning
      style={{
        background: "linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(15, 15, 23, 0.9) 100%)",
        transform: "translateZ(0)",
      }}
    >
      {/* Simplified Grid Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(${selected === "dahoomy-999" ? "6, 182, 212" : "251, 191, 36"}, 0.1) 25%, rgba(${selected === "dahoomy-999" ? "6, 182, 212" : "251, 191, 36"}, 0.1) 26%, transparent 27%, transparent 74%, rgba(${selected === "dahoomy-999" ? "6, 182, 212" : "251, 191, 36"}, 0.1) 75%, rgba(${selected === "dahoomy-999" ? "6, 182, 212" : "251, 191, 36"}, 0.1) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(${selected === "dahoomy-999" ? "6, 182, 212" : "251, 191, 36"}, 0.1) 25%, rgba(${selected === "dahoomy-999" ? "6, 182, 212" : "251, 191, 36"}, 0.1) 26%, transparent 27%, transparent 74%, rgba(${selected === "dahoomy-999" ? "6, 182, 212" : "251, 191, 36"}, 0.1) 75%, rgba(${selected === "dahoomy-999" ? "6, 182, 212" : "251, 191, 36"}, 0.1) 76%, transparent 77%, transparent)
          `,
          backgroundSize: "50px 50px",
        }}
      />


      {/* Content Container - Vertical Stacking Layout */}
      <div className="relative z-10 flex flex-col items-center justify-start gap-8 w-full py-8">
        {/* Dahoomy 999 Logo - Top */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden
            ring-4 ring-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.6)]
            will-change-transform backdrop-blur-sm
            group hover:scale-105 transition-all duration-300"
          style={{ 
            transform: `translateZ(0)`,
            backgroundClip: "padding-box",
          }}
        >
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-red-500/15 backdrop-blur-xl" />
          <div
            className="absolute inset-0 bg-gradient-to-br from-cyan-500/90 to-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.9), rgba(255,51,102,0.85))" }}
          />
          
          <img
            src={DAHOOMY_LOGO}
            alt="دحومي 999"
            className="absolute inset-0 w-full h-full object-cover opacity-90 drop-shadow-[0_0_20px_rgba(0,255,255,0.6)]"
            onError={(e) => {
              e.currentTarget.src = "/images/dahoomy-999.png"
              e.currentTarget.className = "absolute inset-0 w-full h-full object-contain opacity-80 p-4 drop-shadow-[0_0_20px_rgba(0,255,255,0.6)]"
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <span className="text-2xl font-black text-white drop-shadow-xl text-center relative z-10">
            </span>
          </div>
          <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <span className="text-black text-xl font-bold">✓</span>
          </div>
        </div>

        {/* Game Mode Selector */}
        <div className="w-full max-w-4xl mx-auto px-4">
          <GameModeSelector />
        </div>

        {/* Discord Status Card & Leaderboard - Side by Side (Right & Left) */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl mx-auto px-4">
          {/* Discord Server - Equal Width */}
          <div className="w-full lg:w-1/2 flex justify-center order-2 lg:order-1">
            <DiscordStatusCard />
          </div>
          
          {/* Leaderboard - Equal Width */}
          <div className="w-full lg:w-1/2 flex justify-center order-1 lg:order-2">
            <LeaderboardCard />
          </div>
        </div>

        {/* Confirm Button - Bottom */}
        <button
          type="button"
          onClick={() => {
            setThemeContext("dahoomy-999")
            onConfirm()
          }}
          className="relative px-12 py-4 rounded-xl text-xl font-black text-white
          transition-all duration-300 will-change-transform active:scale-95
          backdrop-blur-sm ring-2
          hover:shadow-2xl
          bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 
          shadow-lg shadow-cyan-500/40 ring-cyan-400/50"
          style={{ transform: "translateZ(0)" }}
        >
          <span className="relative z-10">تأكيد الاختيار</span>
        </button>
      </div>
    </div>
  )
}

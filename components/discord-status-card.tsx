"use client"

import { Hash } from "lucide-react"

// Server status configuration
const SERVER_STATUS = {
  serverName: "d7oomy999",
  guildId: "759413478833782784", // Discord Guild ID
  inviteLink: "https://discord.gg/d7oomy999",
  serverIcon: "/images/dahoomy-999.png"
}

export function DiscordStatusCard() {
  return (
    <div className="w-full max-w-[550px] h-auto animate-float relative rtl" dir="rtl" suppressHydrationWarning>
      {/* Glow effect background */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-red-500/10 blur-2xl -z-10 opacity-60" />
      
      {/* Main card */}
      <div className="discord-status-card relative p-6 rounded-2xl backdrop-blur border border-cyan-500/50 shadow-lg shadow-cyan-500/20 transition-all duration-300" dir="rtl"
        style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(15,23,42,0.8) 100%)"
        }}
      >
        {/* Header with icon */}
        <div className="flex items-center gap-4 mb-4" dir="rtl">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/50 flex-shrink-0">
            <img 
              src={SERVER_STATUS.serverIcon}
              alt="Discord Server"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/dahoomy-999.png"
                e.currentTarget.className = "w-full h-full object-contain p-2"
              }}
            />
            <div className="absolute inset-0 rounded-full border border-cyan-400/30" />
          </div>
          
          <div className="flex-1 text-right">
            <div className="text-sm text-cyan-300/70 font-bold tracking-widest">🎮 سيرفر دحومي 999</div>
            <h3 className="text-xl font-black text-white drop-shadow-lg line-clamp-1">
              {SERVER_STATUS.serverName}
            </h3>
            <div className="text-xs text-cyan-400/80 mt-1 flex items-center justify-end gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Community Live</span>
            </div>
          </div>
        </div>

        {/* Room ID مع أيقونة */}
        <div className="mt-2 mb-4 flex items-center justify-end gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-cyan-500/30 font-mono text-[11px] text-cyan-300/90">
            <Hash className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            1483240053110083687
          </span>
        </div>

        {/* Discord link */}
        <a
          href={SERVER_STATUS.inviteLink}
          target="_blank"
          rel="noopener noreferrer"
          dir="rtl"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 rounded-lg font-bold text-white text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 active:scale-95"
        >
          <span>انضم للسيرفر</span>
          <span>🔗</span>
        </a>

        {/* Live indicator */}
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </div>
    </div>
  )
}

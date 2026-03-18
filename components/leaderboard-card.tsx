"use client"

import { useEffect, useState, useRef } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Trophy, Crown, Zap, LogIn, LogOut, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { Confetti } from "./confetti"
import { getDiscordBadges, hasNitro } from "@/lib/discord-badges"

interface Player {
  user_id: string
  username: string
  points: number
  avatar_url: string
  rank: number
  isAdmin?: boolean
  flags?: number
  premiumType?: number
  badges?: Array<{ id: string; name: string; icon: string; description?: string }>
}

// Empty initial state - will be populated dynamically
const INITIAL_PLAYERS: Player[] = []

// Your Discord ID for admin detection
const ADMIN_ID = "897450827353063505"
const SECONDARY_ADMIN_ID = "1186739142231605248"
const PRIMARY_ADMIN_IDS = [ADMIN_ID, SECONDARY_ADMIN_ID] // Both are now primary admins

export function LeaderboardCard() {
  const { data: session, status } = useSession()
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const loginToastShownRef = useRef(false)

  // Refresh session on component mount to ensure latest auth state
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if we're coming back from a callback (check URL for auth params)
      const hasAuthParams = new URLSearchParams(window.location.search).has("code") ||
                           new URLSearchParams(window.location.search).has("state")
      
      if (hasAuthParams) {
        // Remove auth params from URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [])

  // Handle logging in user to leaderboard with toast notifications - with deduplication
  useEffect(() => {
    if (status === "authenticated" && session?.user && session.user.id) {
      const userId = session.user.id
      
      // Use Map to ensure no duplicates - deduplicate by user_id
      setPlayers(prevPlayers => {
        // Create map to ensure uniqueness
        const playerMap = new Map(prevPlayers.map(p => [p.user_id, p]))
        
        // Check if user already exists in the map
        const userExists = playerMap.has(userId)
        
        // Determine if user is admin
        const isAdmin = PRIMARY_ADMIN_IDS.includes(userId)
        
        if (!userExists && session.user) {
          // Get badges from user flags
          const badges = getDiscordBadges(session.user.flags || 0)
          const isNitro = hasNitro(session.user.premiumType || 0)
          
          if (isNitro && !badges.find(b => b.id === "nitro")) {
            badges.unshift({ id: "nitro", name: "Nitro", icon: "⭐", description: "Discord Nitro Subscriber" })
          }
          
          // Create new player entry with session data
          const newPlayer: Player = {
            user_id: userId,
            username: session.user.name || "Unknown Player",
            points: isAdmin ? 999999 : 100,
            avatar_url: session.user.image || "https://avatars.dicebear.com/api/avataaars/default.svg",
            rank: 1,
            isAdmin,
            flags: session.user.flags || 0,
            premiumType: session.user.premiumType || 0,
            badges
          }
          
          // Add new player to map
          playerMap.set(userId, newPlayer)
        }
        
        // Convert map back to array and sort
        const updated = Array.from(playerMap.values()).sort((a, b) => {
          // Admin first
          if (a.isAdmin && !b.isAdmin) return -1
          if (!a.isAdmin && b.isAdmin) return 1
          // Then by points descending
          return b.points - a.points
        })

        // Recompute ranks
        return updated.map((p, i) => ({
          ...p,
          rank: i + 1
        }))
      })

      // Show confetti and toast only once on login - use ref to prevent duplicate toasts
      if (!loginToastShownRef.current && session.user?.name) {
        loginToastShownRef.current = true
        setShowConfetti(true)
        toast.success(`تم تسجيل دخولك بنجاح! نورت المنصة يا ${session.user.name || 'لاعب'} ⚡`, {
          duration: 3000,
          position: 'bottom-right',
          style: {
            background: 'rgba(6, 182, 212, 0.15)',
            border: '2px solid rgba(6, 182, 212, 0.6)',
            color: '#00d9ff',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 'bold'
          }
        })
        
        // Clear confetti after animation
        setTimeout(() => setShowConfetti(false), 3000)
      }
    } else if (status === "unauthenticated" && loginToastShownRef.current) {
      // Show logout toast and clear leaderboard
      loginToastShownRef.current = false
      toast.success('تم تسجيل الخروج بنجاح. نراك قريباً! 👋', {
        duration: 2000,
        position: 'bottom-right',
        style: {
          background: 'rgba(239, 68, 68, 0.15)',
          border: '2px solid rgba(239, 68, 68, 0.6)',
          color: '#ff6b6b',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 'bold'
        }
      })
      setPlayers([])
    }
  }, [status, session?.user?.id, session?.user?.name])

  // Handle Discord login with proper callback handling
  const handleDiscordLogin = async () => {
    try {
      // Use signIn with redirect to handle callback properly
      await signIn("discord", { 
        redirect: true,
        callbackUrl: "/" 
      })
    } catch (error) {
      console.error("Login error:", error)
      toast.error("حدث خطأ أثناء محاولة تسجيل الدخول", {
        style: {
          background: 'rgba(239, 68, 68, 0.15)',
          border: '2px solid rgba(239, 68, 68, 0.6)',
          color: '#ff6b6b',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px'
        }
      })
    }
  }

  // Handle Discord logout
  const handleDiscordLogout = async () => {
    loginToastShownRef.current = false
    await signOut({ redirect: false })
  }

  // Styling functions based on rank
  const getRankGlowColor = (rank: number, isAdmin?: boolean): string => {
    if (isAdmin) return "from-purple-500/60 via-pink-500/40 to-purple-600/50"
    if (rank === 1) return "from-cyan-400/50 to-cyan-600/30"
    if (rank === 2) return "from-gray-300/50 to-gray-400/30"
    if (rank === 3) return "from-orange-400/50 to-orange-600/30"
    return "from-cyan-400/30 to-cyan-500/20"
  }

  const getRankBorder = (rank: number, isAdmin?: boolean): string => {
    if (isAdmin) return "border-purple-500/70 shadow-purple-500/50"
    if (rank === 1) return "border-cyan-500/50 shadow-cyan-500/30"
    if (rank === 2) return "border-gray-400/50 shadow-gray-400/20"
    if (rank === 3) return "border-orange-500/50 shadow-orange-500/30"
    return "border-cyan-500/50 shadow-cyan-500/30"
  }

  const getRankIcon = (rank: number, isAdmin?: boolean) => {
    if (isAdmin) return "✨"
    if (rank === 1) return "👑"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return "⭐"
  }

  const getBorderColor = (rank: number, isAdmin?: boolean) => {
    if (isAdmin) return "rgba(168, 85, 247, 0.8)"
    if (rank === 1) return "rgba(6, 182, 212, 0.6)"
    if (rank === 2) return "rgba(209, 213, 219, 0.6)"
    if (rank === 3) return "rgba(249, 115, 22, 0.6)"
    return "rgba(34, 211, 238, 0.6)"
  }

  // Calculate stats with safe number formatting
  const maxPoints = players.length > 0 ? Number(players[0].points) || 0 : 0
  const totalPlayers = players.length
  const avgPoints = players.length > 0 
    ? Math.round(players.reduce((sum, p) => sum + (Number(p.points) || 0), 0) / players.length)
    : 0

  return (
    <>
      <Confetti active={showConfetti} />
      
      <div className="w-full max-w-[550px] h-auto animate-float relative" dir="rtl" suppressHydrationWarning>
        {/* Glow effect background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/10 blur-2xl -z-10 opacity-60" />

        {/* Main card */}
        <div
          className="relative p-4 sm:p-6 rounded-2xl backdrop-blur border-2 shadow-md transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(15,23,42,0.8) 100%)",
            borderColor: "rgba(6, 182, 212, 0.8)",
            boxShadow: "0 0 30px rgba(6, 182, 212, 0.4), 0 0 60px rgba(6, 182, 212, 0.2), inset 0 0 30px rgba(6, 182, 212, 0.1)"
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10" dir="rtl">
            <div>
              <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white drop-shadow-lg flex items-center gap-2 sm:gap-3">
                <Trophy className="w-5 sm:w-6 h-5 sm:h-6 text-blue-400 animate-pulse flex-shrink-0" />
                <span className="truncate">لوحة المتصدرين</span>
              </h3>
              <p className="text-xs sm:text-sm text-cyan-400/70 mt-2">أفضل اللاعبين</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-cyan-500/0 mb-6 sm:mb-8" />

          {/* Players List */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 max-h-60 sm:max-h-72 md:max-h-80 overflow-y-auto scrollbar-hide">
            {players.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-cyan-400/60">
                <p className="text-xs sm:text-sm">سجل دخولك لتظهر في لوحة المتصدرين!</p>
                <p className="text-xs mt-1">ستظهر بياناتك فوراً</p>
              </div>
            ) : (
              players.map((player) => (
                <div
                  key={player.user_id}
                  className={`relative group ${player.user_id === session?.user?.id ? 'ring-2 ring-cyan-400/50 rounded-lg' : ''}`}
                >
                  {/* Rank-specific glow background */}
                  <div
                    className={`absolute inset-0 rounded-lg bg-gradient-to-r ${getRankGlowColor(
                      player.rank,
                      player.isAdmin
                    )} blur opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  {/* Player Card */}
                  <div
                    className={`relative p-4 sm:p-5 md:p-6 rounded-lg backdrop-blur-sm border transition-all duration-300 flex items-center gap-3 sm:gap-4 ${getRankBorder(
                      player.rank,
                      player.isAdmin
                    )} hover:shadow-lg`}
                    style={{
                      background: player.isAdmin ? "rgba(139, 92, 246, 0.1)" : player.user_id === session?.user?.id ? "rgba(6, 182, 212, 0.2)" : "rgba(15, 23, 42, 0.4)",
                      boxShadow: player.isAdmin 
                        ? "0 0 20px rgba(168, 85, 247, 0.6)" 
                        : player.user_id === session?.user?.id
                        ? "0 0 20px rgba(6, 182, 212, 0.5)"
                        : `0 0 ${player.rank === 1 ? 12 : 6}px rgba(6, 182, 212, 0.3)`
                    }}
                  >
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 rounded-full flex items-center justify-center text-sm sm:text-lg md:text-xl font-black animate-pulse relative">
                      {getRankIcon(player.rank, player.isAdmin)}
                      <span 
                        className="absolute w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 rounded-full border-2 pointer-events-none"
                        style={{
                          borderColor: player.isAdmin 
                            ? "rgba(168, 85, 247, 0.8)" 
                            : player.user_id === session?.user?.id
                            ? "rgba(6, 182, 212, 0.8)"
                            : "rgba(34, 211, 238, 0.5)"
                        }}
                      />
                    </div>

                    {/* Avatar */}
                    <div 
                      className={`relative w-11 sm:w-14 md:w-16 h-11 sm:h-14 md:h-16 rounded-full overflow-hidden flex-shrink-0 border-2 ${player.user_id === session?.user?.id ? 'ring-2 ring-cyan-400/60' : ''}`}
                      style={{ borderColor: getBorderColor(player.rank, player.isAdmin) }}
                    >
                      <img
                        src={player.avatar_url}
                        alt={player.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://avatars.dicebear.com/api/avataaars/default.svg"
                        }}
                      />
                      <div
                        className="absolute inset-0 rounded-full border opacity-50"
                        style={{
                          borderColor: getBorderColor(player.rank, player.isAdmin)
                        }}
                      />
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap-reverse">
                        <p className={`text-xs sm:text-sm font-bold truncate ${
                          player.isAdmin ? "text-purple-300" : player.user_id === session?.user?.id ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "text-white"
                        }`}>
                          {player.username}
                          {player.isAdmin && " 👑"}
                        </p>
                        {/* Badges Display */}
                        {player.badges && player.badges.length > 0 && (
                          <div className="flex gap-0.5 flex-wrap-reverse">
                            {player.badges.slice(0, 3).map((badge) => (
                              <span 
                                key={badge.id} 
                                title={badge.description}
                                className="text-xs sm:text-sm"
                              >
                                {badge.icon}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-cyan-400/70">
                        الترتيب: #{player.rank}
                      </p>
                    </div>

                    {/* Points */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-base sm:text-lg md:text-xl font-black text-cyan-300">
                        {player.points.toLocaleString('en-US')}
                      </div>
                      <div className="text-xs sm:text-sm text-cyan-400/60 flex items-center gap-1 justify-end mt-1">
                        <Zap className="w-4 sm:w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-cyan-500/0 my-6 sm:my-8" />

          {/* Current User Info or Login Button */}
          {status === "authenticated" && session?.user ? (
            <div className="space-y-4 sm:space-y-5" dir="rtl">
              <div className="p-4 sm:p-5 md:p-6 rounded-lg bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 border border-cyan-500/40">
                <p className="text-xs text-cyan-400/70 mb-2">✨ أنت مسجل الدخول</p>
                <div className="flex items-center gap-3">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-10 h-10 rounded-full border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/30"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://avatars.dicebear.com/api/avataaars/default.svg"
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                      {session.user.name || "Unknown Player"}
                    </p>
                    <p className="text-xs text-cyan-400">
                      مرحباً في لوحة المتصدرين!
                    </p>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleDiscordLogout}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 rounded-lg font-bold text-white text-base sm:text-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 active:scale-95"
                dir="rtl"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleDiscordLogin}
              disabled={status === "loading"}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 sm:py-5 bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#3d4494] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-white text-base sm:text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-[#5865F2]/60 active:scale-95 relative overflow-hidden group"
              dir="rtl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
              <div className="relative flex items-center justify-center gap-2">
                {status === "loading" ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>جاري الاتصال...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>🔐 تسجيل الدخول عبر Discord</span>
                  </>
                )}
              </div>
            </button>
          )}

          {/* Footer Stats */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-cyan-500/30 grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-center text-xs sm:text-sm" dir="rtl">
            <div className="p-2 sm:p-3">
              <p className="text-cyan-400/70 mb-2">أعلى نقطة</p>
              <p className="font-black text-cyan-400 text-lg sm:text-2xl">
                {!isNaN(maxPoints) && maxPoints > 0 ? maxPoints.toLocaleString('en-US') : "0"}
              </p>
            </div>
            <div className="p-2 sm:p-3">
              <p className="text-cyan-400/70 mb-2">إجمالي لاعب</p>
              <p className="font-black text-cyan-300 text-lg sm:text-2xl">
                {!isNaN(totalPlayers) ? totalPlayers : "0"}
              </p>
            </div>
            <div className="p-2 sm:p-3">
              <p className="text-cyan-400/70 mb-2">متوسط النقاط</p>
              <p className="font-black text-green-400 text-lg sm:text-2xl">
                {!isNaN(avgPoints) && avgPoints > 0 ? avgPoints.toLocaleString('en-US') : "0"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

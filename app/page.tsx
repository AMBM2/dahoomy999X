"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import ModernCategorySelector from "@/components/modern-category-selector"
import GameBoard from "@/components/game-board"
import ThemeGateway from "@/components/theme-gateway"
import { useTheme } from "@/components/theme-provider"
import ActivationRequestModal from "@/components/activation-request-modal"

type GameState = "category-select" | "playing"

export default function Home() {
  const { setTheme } = useTheme()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [themeSelectionDone, setThemeSelectionDone] = useState(false)
  const [isExitingGateway, setIsExitingGateway] = useState(false)
  const [gameState, setGameState] = useState<GameState>("category-select")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [teams, setTeams] = useState<Array<{name: string, players: number}>>([{name: "الفريق الأول", players: 5}, {name: "الفريق الثاني", players: 5}])
  const [isApproved, setIsApproved] = useState<boolean | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  // تحقق بسيط: إذا كان المستخدم أدمن نسمح له مباشرة بدون طلب تفعيل
  useEffect(() => {
    const check = async () => {
      if (!session?.user?.id) {
        setIsApproved(false)
        return
      }
      const adminIds = ["897450827353063505", "1186739142231605248"]
      if (adminIds.includes(session.user.id)) {
        setIsApproved(true)
        return
      }
      try {
        const res = await fetch("/api/activation-requests?mine=1", {
          cache: "no-store",
        })
        if (!res.ok) {
          setIsApproved(false)
          return
        }
        const data = await res.json()
        if (!data) {
          setIsApproved(false)
        } else {
          setIsApproved(data.status === "approved")
        }
      } catch {
        setIsApproved(false)
      }
    }
    void check()
  }, [session?.user?.id])

  // Theme selection is now ALWAYS required - no localStorage persistence
  // themeSelectionDone starts as false and is set to true only after user selects in ThemeGateway

  const handleStartGame = (categories: string[], teamsData: {name: string, players: number}[]) => {
    setSelectedCategories(categories)
    setTeams(teamsData)
    setGameState("playing")
  }

  const handleExitGame = () => {
    setGameState("category-select")
    setSelectedCategories([])
    setTeams([{name: "الفريق الأول", players: 5}, {name: "الفريق الثاني", players: 5}])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <div className="w-full max-w-md px-6">
          <div className="text-center mb-6">
            <img
              src="/images/dahoomy-999.png"
              alt="دحومي 999"
              className="w-32 h-32 mx-auto mb-4 rounded-full shadow-2xl shadow-cyan-500/50"
            />
            <h1 className="text-3xl font-bold text-cyan-200 mb-1">دحومي 999</h1>
            <p className="text-sm text-cyan-400/80">يتم تجهيز اللعبة الآن...</p>
          </div>
          {/* شريط تحميل بسيط */}
          <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden border border-cyan-500/40">
            <div className="h-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full animate-[loading-bar_1.4s_infinite]"></div>
          </div>
          <style>{`
            @keyframes loading-bar {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(-10%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  if (!themeSelectionDone) {
    return (
      <>
        {!loading && (
          <div className={isExitingGateway ? 'animate-gateway-exit' : ''}>
            <ThemeGateway
              onConfirm={() => {
                setIsExitingGateway(true)
                setTimeout(() => setThemeSelectionDone(true), 600)
              }}
            />
          </div>
        )}
        {loading && (
          <div
            className="min-h-screen flex items-center justify-center bg-black"
            style={{ transform: "translateZ(0)" }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-2 border-cyan-400/60 border-t-cyan-400 mx-auto mb-4" />
              <p className="text-white/80">جاري التحميل...</p>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <main className="min-h-screen relative">
      {/* السماح للجميع بالدخول - لا توجد متطلبات تفعيل */}
      {isApproved === true && (
        <>
          {gameState === "category-select" && (
            <ModernCategorySelector onStartGame={handleStartGame} />
          )}
          
          {gameState === "playing" && (
            <GameBoard 
              selectedCategories={selectedCategories}
              teams={teams}
              onExit={handleExitGame}
            />
          )}
        </>
      )}

      {/* حالة التحميل */}
      {isApproved === false && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-400/60 border-t-cyan-400 mx-auto mb-4" />
            <p className="text-cyan-200">جاري تحميل اللعبة...</p>
          </div>
        </div>
      )}
    </main>
  )
}

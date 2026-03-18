// =====================================================
// Modern Category Selector - Integrates ModernCategoryGrid
// with Game Management (Teams, Power-ups, Admin)
// =====================================================

"use client"

import { memo, useState, useMemo, useEffect } from "react"
import { useSession } from "next-auth/react"
import { 
  Search, X, Check, Plus, Minus, Play, LogOut, PlusCircle, Shuffle, Trash2, Shield, 
  Sparkles, ArrowLeftRight, Settings, Briefcase, HelpCircle, Users, Gamepad2, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { categoriesList, categoryGroups, getCategoriesByGroup } from "@/lib/question-bank"
import { useCategories } from "@/contexts/category-context"
import { useGameMode } from "@/contexts/game-mode-context"
import { ModernCategoryGrid } from "./modern-category-grid"
import AddQuestionModal from "./add-question-modal"
import AddCategoryModal from "./add-category-modal"
import AdminDashboard from "./admin-dashboard"
import HostManagementModal from "./host-management-modal"
import { ThemeSwitcher } from "./theme-switcher"
import { SettingsModal } from "./settings-modal"
import { useTheme } from "./theme-provider"
import { getCategoryIcon } from "@/lib/category-icons"
import QuestionsBankModal from "./questions-bank-modal"
import AppIcon from "@/components/app-icon"
import toast from "react-hot-toast"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface ModernCategorySelectorProps {
  onStartGame: (categories: string[], teams: {name: string, players: number}[]) => void
}

const ADMIN_ID = "897450827353063505"
const SECONDARY_ADMIN_ID = "1186739142231605248"
const PRIMARY_ADMIN_IDS = [ADMIN_ID, SECONDARY_ADMIN_ID]
const DASHBOARD_OWNER_ID = "1186739142231605248"

function ModernCategorySelector({ onStartGame }: ModernCategorySelectorProps) {
  const { data: session } = useSession()
  const { theme } = useTheme()
  const { gameMode, setGameMode } = useGameMode()
  const { categories: contextCategories, refreshCategories } = useCategories()
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [teams, setTeams] = useState<Array<{name: string, players: number}>>([
    {name: "الفريق الأول", players: 5}, 
    {name: "الفريق الثاني", players: 5}
  ])

  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [showHostManagement, setShowHostManagement] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showQuestionsBank, setShowQuestionsBank] = useState(false)
  const [activeTeamIndex, setActiveTeamIndex] = useState(0)
  const [editingTeamName, setEditingTeamName] = useState<number | null>(null)
  const [newTeamName, setNewTeamName] = useState("")
  const [deletingTeamIndex, setDeletingTeamIndex] = useState<number | null>(null)

  const allCategories = useMemo(() => {
    // دمج التصنيفات الثابتة مع التصنيفات الخاصة المحفوظة في قاعدة البيانات
    const combined = [...categoriesList, ...(contextCategories || [])]
    return combined.map(cat => ({
      ...cat,
      difficulty: (cat as any).difficulty || 'beginner',
      questionCount: typeof (cat as any).questionCount === "number" ? (cat as any).questionCount : 0,
      group: cat.group || 'science',
    }))
  }, [contextCategories])

  const isDahoomy = theme === "dahoomy-999"
  const isAdmin = session?.user?.id && PRIMARY_ADMIN_IDS.includes(session.user.id)
  const [isHost, setIsHost] = useState(false)

  useEffect(() => {
    const checkHost = async () => {
      try {
        if (!session?.user?.id) return
        const response = await fetch("/api/hosts", { cache: "no-store" })
        if (!response.ok) return
        const data = await response.json()
        setIsHost(Array.isArray(data) && data.some((h: any) => h.userId === session.user.id))
      } catch {
        // ignore
      }
    }
    checkHost()
  }, [session?.user?.id])

  const canControlGame = isAdmin || isHost

  const openAddQuestion = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setShowAddQuestion(true)
  }

  const openAddCategory = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setShowAddCategory(true)
  }

  const bgStyle = isDahoomy
    ? {
        background: `radial-gradient(circle at 20% 20%, rgba(6,182,212,0.12), transparent 45%),
                     radial-gradient(circle at 80% 30%, rgba(239,68,68,0.06), transparent 50%),
                     linear-gradient(135deg, #030308, #0a0812)`,
        transform: "translateZ(0)" as const,
      }
    : {
        background: `radial-gradient(circle at 20% 20%, rgba(59,130,246,0.14), transparent 45%),
                     radial-gradient(circle at 80% 30%, rgba(168,85,247,0.10), transparent 50%),
                     linear-gradient(135deg, #060608, #0c0b10)`,
        transform: "translateZ(0)" as const,
      }

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        if (prev.length < 6) {
          return [...prev, categoryId]
        }
        return prev
      }
    })
  }

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(catId)) {
        return prev.filter(id => id !== catId)
      }
      return prev
    })
  }

  const handleStartGame = () => {
    if (!canControlGame) {
      toast.error("ليس لديك إذن أو صلاحية لبدء اللعبة", {
        duration: 2500,
        position: "bottom-right",
        style: {
          background: "rgba(15, 23, 42, 0.92)",
          border: "2px solid rgba(6, 182, 212, 0.55)",
          color: "#a5f3fc",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          fontWeight: 800,
        },
      })
      return
    }
    if (selectedCategories.length < 3 || selectedCategories.length > 6) {
      return
    }
    onStartGame(selectedCategories, teams)
  }


  const handleAddTeam = () => {
    if (teams.length < 4) {
      setTeams([...teams, {name: `الفريق ${teams.length + 1}`, players: 5}])
    }
  }

  const handleRemoveTeam = (index: number) => {
    if (teams.length > 2) {
      setTeams(teams.filter((_, i) => i !== index))
      if (activeTeamIndex >= teams.length - 1) {
        setActiveTeamIndex(Math.max(0, teams.length - 2))
      }
      setDeletingTeamIndex(null)
    }
  }

  const handleUpdateTeamName = (index: number, newName: string) => {
    if (newName.trim()) {
      setTeams(prev => {
        const newTeams = [...prev]
        newTeams[index].name = newName
        return newTeams
      })
      setEditingTeamName(null)
      setNewTeamName("")
    }
  }

  const handleUpdateTeamPlayers = (index: number, delta: number) => {
    setTeams(prev => {
      const newTeams = [...prev]
      const newCount = Math.max(1, Math.min(10, newTeams[index].players + delta))
      newTeams[index].players = newCount
      return newTeams
    })
  }

  return (
    <div 
      className="min-h-screen flex animated-bg animate-fade-in relative overflow-x-hidden"
      style={bgStyle}
      suppressHydrationWarning
    >
      {/* Sidebar */}
      <div className={`w-full max-w-xs lg:max-w-sm border-r theme-border p-4 sm:p-5 flex flex-col h-screen overflow-y-auto scrollbar-hide ${isDahoomy ? 'bg-black/20 border-cyan-400/20' : 'bg-black/25 border-cyan-400/25'}`}>
        {/* Selected Categories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold theme-text">الفئات المختارة</h3>
            <span className="text-sm theme-text-secondary theme-bg-muted px-2 py-1 rounded">
              {selectedCategories.length}/6
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {selectedCategories.map((catId) => {
              const cat = allCategories.find(c => c.id === catId)
              if (!cat) return null

              const IconComponent = getCategoryIcon(cat.id)

              return (
                <div
                  key={catId}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center rounded-lg border-2 border-cyan-500/70 bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 backdrop-blur-sm hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-200 group"
                >
                  <button
                    onClick={() => toggleCategory(catId)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center z-20 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    title="إزالة"
                  >
                    ×
                  </button>

                  <AppIcon icon={IconComponent} size={20} className="rounded-lg" accent="cyan" />

                  <span className="text-xs font-bold text-cyan-300 mt-1 text-center line-clamp-2">{cat.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Teams Management */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold theme-text">الفرق ({teams.length})</h3>
            <button
              onClick={handleAddTeam}
              disabled={teams.length >= 4}
              className="p-1 rounded text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              title={teams.length >= 4 ? "الحد الأقصى للفرق 4" : "إضافة فريق"}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {teams.map((team, index) => (
              <button
                key={index}
                onClick={() => setActiveTeamIndex(index)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  activeTeamIndex === index
                    ? "bg-cyan-500/30 border border-cyan-500/70"
                    : "bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300">{team.name}</span>
                  <span className="text-xs text-cyan-400/70">{team.players} لاعبين</span>
                </div>
              </button>
            ))}
          </div>

          {/* Active Team Details */}
          {activeTeamIndex < teams.length && (
            <div className="mt-4 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg space-y-3">
              {/* Team Name & Players */}
              <div>
                <label className="text-xs font-bold text-cyan-400 mb-1 block">اسم الفريق</label>
                {editingTeamName === activeTeamIndex ? (
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    onBlur={() => handleUpdateTeamName(activeTeamIndex, newTeamName)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateTeamName(activeTeamIndex, newTeamName)
                      } else if (e.key === 'Escape') {
                        setEditingTeamName(null)
                      }
                    }}
                    className="w-full px-2 py-1 rounded bg-black/40 border border-cyan-500/30 text-cyan-300 text-sm focus:outline-none focus:border-cyan-500/60"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => {
                      setEditingTeamName(activeTeamIndex)
                      setNewTeamName(teams[activeTeamIndex].name)
                    }}
                    className="w-full px-2 py-1 rounded bg-black/40 border border-cyan-500/30 text-cyan-300 text-sm hover:bg-black/60 text-left"
                  >
                    {teams[activeTeamIndex].name}
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-cyan-400 mb-1 block">عدد اللاعبين</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateTeamPlayers(activeTeamIndex, -1)}
                    className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="flex-1 text-center text-cyan-300 font-bold">
                    {teams[activeTeamIndex].players}
                  </span>
                  <button
                    onClick={() => handleUpdateTeamPlayers(activeTeamIndex, 1)}
                    className="px-2 py-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Delete Team Button */}
              <button
                onClick={() => setDeletingTeamIndex(activeTeamIndex)}
                disabled={teams.length <= 2}
                className="w-full px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 text-xs font-bold"
              >
                حذف الفريق
              </button>
            </div>
          )}
        </div>

        {/* Start Game Button */}
        <div className="mt-auto">
          <Button 
            onClick={handleStartGame}
            className={`w-full py-3 text-lg font-bold transition-all duration-300 ${
              isDahoomy 
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-400 hover:to-cyan-500" 
                : "bg-gradient-to-r from-cyan-400 to-cyan-600 text-white hover:from-cyan-500 hover:to-cyan-700"
            } ${!canControlGame ? "opacity-60" : ""}`}
            disabled={
              selectedCategories.length < 3 ||
              selectedCategories.length > 6
            }
          >
            <Play className="w-5 h-5 ml-2" />
            {!canControlGame ? "لا تملك صلاحية" : "ابدأ اللعبة"}
          </Button>

          {/* Logo */}
          <div className="text-center py-4">
            <div className="inline-block px-6 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <img 
                src="/images/dahoomy-999.png" 
                alt="Dahoomy 999" 
                className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]"
              />
            </div>
            <div className="text-xs text-cyan-400/70 mt-2 drop-shadow-lg">دحومي 999</div>
          </div>
        </div>
      </div>

      {/* Main Content - Modern Category Grid */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className={`text-3xl font-black theme-text mb-2 ${isDahoomy ? 'text-cyan-200' : 'text-cyan-200'}`}>
              اختر التصنيفات ✨
            </h1>
            <p className="text-sm text-cyan-400/70">اختر من 3 إلى 6 تصنيفات - نسخة حديثة 2026 مع أيقونات حديثة</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Game Mode Switcher */}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-black/20 border border-cyan-400/20">
              <button
                onClick={() => setGameMode("seen-geem")}
                className={`p-1.5 rounded transition-all duration-200 ${
                  gameMode === "seen-geem"
                    ? "bg-cyan-400/30 text-cyan-200"
                    : "bg-transparent text-cyan-400/60 hover:text-cyan-300"
                }`}
                title="سين جيم"
              >
                <Gamepad2 className="w-4 h-4" />
              </button>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-cyan-400/20" />

            {/* Add Question Button */}
            {isAdmin && (
              <button 
                onClick={openAddQuestion}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 bg-cyan-500/15 border border-cyan-400/40 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                أضف سؤال
              </button>
            )}

            {/* Add Category Button */}
            {isAdmin && (
              <button 
                onClick={openAddCategory}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 bg-cyan-500/15 border border-cyan-400/40 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                أضف تصنيف
              </button>
            )}

            {/* Question Bank */}
            {isAdmin && (
              <button
                onClick={() => setShowQuestionsBank(true)}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 bg-cyan-500/15 border border-cyan-400/40 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold"
              >
                <Search className="w-3.5 h-3.5" />
                بنك الأسئلة
              </button>
            )}

            {/* Admin Dashboard (only for dashboard owner) */}
            {session?.user?.id === DASHBOARD_OWNER_ID && (
              <>
                <button 
                  onClick={() => setShowAdminDashboard(true)}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 bg-purple-500/15 border border-purple-400/40 hover:bg-purple-500/25 text-purple-300 text-xs font-bold"
                >
                  <Shield className="w-3.5 h-3.5" />
                  لوحة التحكم
                </button>

                <button 
                  onClick={() => setShowHostManagement(true)}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 bg-cyan-500/15 border border-cyan-400/40 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold"
                >
                  <Users className="w-3.5 h-3.5" />
                  المضيفون
                </button>
              </>
            )}

            {/* Theme Switcher */}
            <ThemeSwitcher />
          </div>
        </div>

        {/* Modern Category Grid Component */}
        <ModernCategoryGrid
          categories={allCategories}
          onSelectCategory={handleSelectCategory}
          selectedCategories={selectedCategories}
          multiSelect={true}
        />
      </div>

      {/* Modals */}
      {showAddQuestion && (
        <AddQuestionModal
          isOpen={showAddQuestion}
          onClose={() => {
            setShowAddQuestion(false)
            void refreshCategories()
          }}
        />
      )}
      {showAddCategory && <AddCategoryModal isOpen={showAddCategory} onClose={() => setShowAddCategory(false)} />}
      {showHostManagement && <HostManagementModal isOpen={showHostManagement} onClose={() => setShowHostManagement(false)} />}
      {showSettings && <SettingsModal />}
      {showAdminDashboard && <AdminDashboard isOpen={showAdminDashboard} onClose={() => setShowAdminDashboard(false)} />}
      {showQuestionsBank && <QuestionsBankModal isOpen={showQuestionsBank} onClose={() => setShowQuestionsBank(false)} />}

      {/* Delete Team Confirmation */}
      {deletingTeamIndex !== null && (
        <AlertDialog open={deletingTeamIndex !== null} onOpenChange={() => setDeletingTeamIndex(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>حذف الفريق</AlertDialogTitle>
              <AlertDialogDescription>
                هل تريد حذف الفريق "{teams[deletingTeamIndex]?.name}"؟\nلا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <button
                onClick={() => setDeletingTeamIndex(null)}
                className="px-4 py-2 rounded bg-gray-500/20 hover:bg-gray-500/30 text-gray-300"
              >
                إلغاء
              </button>
              <AlertDialogAction
                onClick={() => {
                  if (deletingTeamIndex !== null) {
                    handleRemoveTeam(deletingTeamIndex)
                  }
                }}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

export default memo(ModernCategorySelector)

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
import { getDynamicCategories } from "@/lib/dynamic-data"
import { useCategories } from "@/contexts/category-context"
import { useGameMode } from "@/contexts/game-mode-context"
import AddQuestionModal from "./add-question-modal"
import AddCategoryModal from "./add-category-modal"
import AdminDashboard from "./admin-dashboard"
import HostManagementModal from "./host-management-modal"
import { ThemeSwitcher } from "./theme-switcher"
import { SettingsModal } from "./settings-modal"
import { useTheme } from "./theme-provider"
import AppIcon from "@/components/app-icon"
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

interface PowerUp {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
}

const powerUps: PowerUp[] = [
  { id: "earthquake", name: "إعصار", description: "أعد ترتيب خانات اللعبة بشكل عشوائي", icon: Shuffle },
  { id: "steal-turn", name: "سرقة جولة", description: "اجعل الخصم يجاوب بدلاً منك", icon: ArrowLeftRight },
  { id: "gold-question", name: "السؤال الذهبي", description: "حول قيمة السؤال إلى 500 نقطة", icon: Sparkles },
  { id: "shield", name: "درع", description: "احصل على نقطة إضافية في المرة القادمة", icon: Shield },
  { id: "delete-answers", name: "حذف إجابتين", description: "احذف خيارين خاطئين من السؤال", icon: Trash2 }
]

interface CategorySelectorProps {
  onStartGame: (categories: string[], teams: {name: string, players: number, powerUps: string[]}[]) => void
}

const ADMIN_ID = "897450827353063505"
const SECONDARY_ADMIN_ID = "1186739142231605248"
const PRIMARY_ADMIN_IDS = [ADMIN_ID, SECONDARY_ADMIN_ID] // Both are now primary admins
const DASHBOARD_OWNER_ID = "1186739142231605248"

// Icon mapping - Maps icon names (strings) to actual Lucide icon components
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'Briefcase': Briefcase,
  'HelpCircle': HelpCircle,
  // Add more icons here as needed
}

// Helper function to get icon component with fallback
const getIconComponent = (iconName?: string): React.ComponentType<any> => {
  if (!iconName) return HelpCircle
  return ICON_MAP[iconName] || HelpCircle
}

function CategorySelector({ onStartGame }: CategorySelectorProps) {
  const { data: session } = useSession()
  const { theme } = useTheme()
  const { gameMode, setGameMode } = useGameMode()
  const { categories: contextCategories, removeCategory, refreshCategories } = useCategories()
  // ONLY PRIMARY ADMINS can manage questions and categories
  const isAdmin = session?.user?.id && PRIMARY_ADMIN_IDS.includes(session.user.id)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [teams, setTeams] = useState<Array<{name: string, players: number, powerUps: string[]}>>([{name: "الفريق الأول", players: 5, powerUps: []}, {name: "الفريق الثاني", players: 5, powerUps: []}])
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showHostManagement, setShowHostManagement] = useState(false)
  const [showIncompleteModal, setShowIncompleteModal] = useState(false)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Combine dynamic categories from context with static categories
  const dynamicCategories = contextCategories
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

  const filteredCategories = useMemo(() => {
    let filtered = activeFilter === 'all' 
      ? [...categoriesList, ...dynamicCategories]
      : [...getCategoriesByGroup(activeFilter), ...dynamicCategories.filter(c => c.group === activeFilter || c.group === 'custom')]

    if (searchQuery) {
      filtered = filtered.filter(cat => 
        cat.name.includes(searchQuery) || cat.id.includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [searchQuery, activeFilter, dynamicCategories])

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(catId)) {
        return prev.filter(id => id !== catId)
      }
      if (prev.length >= 6) {
        return prev
      }
      return [...prev, catId]
    })
  }

  const togglePowerUp = (powerUpId: string, teamIndex: number) => {
    setTeams(prev => prev.map((team, i) => i === teamIndex ? {
      ...team,
      powerUps: team.powerUps.includes(powerUpId) 
        ? team.powerUps.filter(id => id !== powerUpId) 
        : team.powerUps.length < 4 ? [...team.powerUps, powerUpId] : team.powerUps
    } : team))
  }

  const handleStartGame = () => {
    if (!canControlGame) {
      alert("فقط المضيف يمكنه بدء اللعبة")
      return
    }
    if (selectedCategories.length < 3) {
      alert('اختر 3 تصنيفات على الأقل')
      return
    }
    if (teams.some(team => team.powerUps.length !== 4)) {
      setShowIncompleteModal(true)
      return
    }
    onStartGame(selectedCategories, teams)
  }

  const addTeam = () => {
    setTeams(prev => [...prev, { name: `الفريق ${prev.length + 1}`, players: 5, powerUps: [] }])
  }

  const deleteTeam = (index: number) => {
    if (teams.length > 2) {
      setTeams(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateTeamName = (index: number, name: string) => {
    setTeams(prev => prev.map((team, i) => i === index ? { ...team, name } : team))
  }

  const updateTeamPlayers = (index: number, players: number) => {
    setTeams(prev => prev.map((team, i) => i === index ? { ...team, players } : team))
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete category")
      }

      // Remove from context
      removeCategory(categoryId)

      // Remove from selected if it was selected
      if (selectedCategories.includes(categoryId)) {
        setSelectedCategories(prev => prev.filter(id => id !== categoryId))
      }

      // Refresh categories
      await refreshCategories()

      setCategoryToDelete(null)
      alert("تم حذف التصنيف وجميع الأسئلة المتعلقة به")
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("حدث خطأ أثناء حذف التصنيف")
    } finally {
      setIsDeleting(false)
    }
  }

  const isDahoomy = theme === "dahoomy-999"
  
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

  return (
    <div 
      className="min-h-screen flex animated-bg animate-fade-in relative overflow-x-hidden"
      style={bgStyle}
      suppressHydrationWarning
    >
      {/* Sidebar */}
      <div className={`w-full max-w-xs lg:max-w-sm border-r theme-border p-4 sm:p-6 flex flex-col h-screen overflow-y-auto scrollbar-hide ${isDahoomy ? 'bg-black/30 border-cyan-500/30' : 'bg-black/40 border-cyan-500/30'}`}>
        {/* Selected Categories - Small Square Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold theme-text">الفئات المختارة</h3>
            <span className="text-sm theme-text-secondary theme-bg-muted px-2 py-1 rounded">
              {selectedCategories.length}/6
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {selectedCategories.map((catId, index) => {
              const staticCat = categoriesList.find(c => c.id === catId)
              const dynamicCat = dynamicCategories.find(c => c.id === catId)
              const cat = staticCat || dynamicCat
              
              if (!cat) return null
              
              const isDynamicCat = !!dynamicCat
              const IconComponent = isDynamicCat 
                ? getIconComponent((dynamicCat as any).iconName)
                : (staticCat?.icon || HelpCircle)
              
              return (
                <div
                  key={catId}
                  className="pop-animation relative w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center rounded-lg border-2 border-cyan-500/70 bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 backdrop-blur-sm hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-200 group"
                >
                  <button
                    onClick={() => toggleCategory(catId)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center z-20 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    title="إزالة"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="flex flex-col items-center justify-center gap-1">
                    {(() => {
                      const iconName = (dynamicCat as any)?.iconName
                      const isEmoji = iconName && iconName.length <= 2 && !iconName.startsWith('http')
                      const isImageUrl = iconName && iconName.startsWith('http')
                      
                      if (isEmoji) {
                        return <span className="text-2xl">{iconName}</span>
                      } else if (isImageUrl) {
                        return <img src={iconName} alt={cat.name} className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded" />
                      } else {
                        return <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" />
                      }
                    })()}
                    <span className="text-xs text-cyan-300 text-center line-clamp-2 leading-tight">{cat.name}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Power-up Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-lg font-bold ${isDahoomy ? "text-cyan-400" : "text-theme-text"}`}>الوسائل المساعدة</h3>
            <span className={`text-sm px-2 py-1 rounded ${isDahoomy ? "text-cyan-400/90 bg-cyan-500/10" : "text-theme-text/80 bg-theme-bg/10"}`}>
              {teams.reduce((sum, team) => sum + team.powerUps.length, 0)}/{teams.length * 4}
            </span>
          </div>
          <div className="space-y-4">
            {teams.map((team, teamIndex) => (
              <div key={teamIndex} className={`rounded-2xl p-4 ${isDahoomy ? "bg-cyan-500/5 border border-cyan-500/30" : "bg-cyan-500/5 border border-cyan-500/30"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${isDahoomy ? "text-cyan-400" : "text-theme-text"}`}>{team.name}</span>
                  <span className={`text-xs ${isDahoomy ? "text-cyan-400/70" : "text-theme-text-secondary"}`}>{team.powerUps.length}/4</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {powerUps.map((powerUp) => {
                    const isSelected = team.powerUps.includes(powerUp.id)
                    const IconComponent = powerUp.icon
                    return (
                      <button
                        key={powerUp.id}
                        type="button"
                        onClick={() => togglePowerUp(powerUp.id, teamIndex)}
                        className={
                          `aspect-square rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center transition-all ${
                            isSelected
                              ? isDahoomy ? "bg-cyan-500/25 border border-cyan-500/50 shadow-sm" : "bg-cyan-500/20 border border-cyan-500/40 shadow-sm"
                              : isDahoomy ? "bg-cyan-500/5 border border-cyan-500/20 hover:bg-cyan-500/10" : "bg-cyan-500/5 border border-cyan-500/15 hover:bg-cyan-500/10"
                          }`
                        }
                        title={powerUp.description}
                      >
                        <IconComponent className={`w-6 h-6 ${isDahoomy ? "text-cyan-400" : "text-cyan-400"}`} />
                        <span className="text-xs font-bold text-white">{powerUp.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <div className="mt-auto">
          <Button 
            onClick={handleStartGame}
            className={`w-full py-3 text-lg font-bold transition-all duration-300 ${
              isDahoomy 
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-400 hover:to-cyan-500" 
                : "bg-gradient-to-r from-cyan-400 to-cyan-600 text-white hover:from-cyan-500 hover:to-cyan-700"
            }`}
            disabled={
              !canControlGame ||
              selectedCategories.length < 3 ||
              teams.some(team => team.powerUps.length !== 4)
            }
          >
            <Play className="w-5 h-5 ml-2" />
            ابدأ اللعبة
          </Button>

          {/* Dahoomy 999 Logo */}
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

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
          <div className="w-full lg:w-auto">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {isDahoomy && (
                <img 
                  src="/images/dahoomy-999.png" 
                  alt="Dahoomy 999" 
                  className="h-8 sm:h-12 w-auto object-contain rounded-lg drop-shadow-[0_0_15px_rgba(0,255,255,0.5)] flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = "/images/dahoomy-999.png"
                  }}
                />
              )}
              <h1 className={`text-2xl sm:text-3xl font-black theme-text ${theme === 'dahoomy-999' ? 'neon-dahoomy text-cyan-200' : 'neon-dahoomy text-cyan-200'} ${theme === 'dahoomy-999' ? 'dahoomy-font' : ''} text-right`}>اختر الفئات</h1>
              <span className="text-xs sm:text-sm text-muted-foreground theme-bg-muted px-2 py-1 rounded flex-shrink-0">v2.0</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">اختر من 3 إلى 6 تصنيفات للعب - كل تصنيف يحتوي 250+ سؤال</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full lg:w-auto justify-end">
            {/* Game Mode Switcher */}
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg bg-black/40 border border-cyan-500/30">
              <button
                onClick={() => setGameMode("seen-geem")}
                className={`p-2 rounded transition-colors ${
                  gameMode === "seen-geem"
                    ? "bg-cyan-500/30 text-cyan-300"
                    : "bg-transparent text-cyan-300/50 hover:text-cyan-300"
                }`}
                title="سين جيم"
              >
                <Gamepad2 className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
              <div className="h-4 w-px bg-cyan-500/30" />
              <button
                disabled
                className="p-2 rounded transition-colors bg-transparent text-gray-400/30 cursor-not-allowed opacity-50"
                title="حروف - غير متاح"
              >
                <Zap className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>
            {/* Admin Dashboard Button (only for dashboard owner) */}
            {session?.user?.id === DASHBOARD_OWNER_ID && (
              <button 
                onClick={() => setShowAdminDashboard(true)}
                type="button"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30 text-purple-400 whitespace-nowrap text-sm sm:text-base"
                title="لوحة التحكم - للمسؤول فقط"
              >
                <Settings className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                <span className="font-bold hidden sm:inline">إدارة</span>
              </button>
            )}
            {/* Add Question Button - Primary Admin Only */}
            {isAdmin && (
              <button 
                onClick={openAddQuestion}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${isDahoomy ? "bg-green-500/20 border border-green-500/50 hover:bg-green-500/30 text-green-400" : "bg-green-500/20 border border-green-500/50 hover:bg-green-500/30 text-green-400"}`}
                type="button"
              >
                <Plus className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                <span className="font-bold hidden sm:inline">اضافة سؤال</span>
              </button>
            )}
            {/* Add Category Button - Primary Admin Only */}
            {isAdmin && (
              <button 
                onClick={openAddCategory}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${isDahoomy ? "bg-blue-500/20 border border-blue-500/50 hover:bg-blue-500/30 text-blue-400" : "bg-blue-500/20 border border-blue-500/50 hover:bg-blue-500/30 text-blue-400"}`}
                type="button"
              >
                <Plus className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                <span className="font-bold hidden sm:inline">اضافة تصنيف</span>
              </button>
            )}
            {/* Host Management Button - Primary Admin Only */}
            {isAdmin && (
              <button 
                onClick={() => setShowHostManagement(true)}
                type="button"
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${isDahoomy ? "bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30 text-purple-400" : "bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30 text-purple-400"}`}
              >
                <Users className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                <span className="font-bold hidden sm:inline">المضيفون</span>
              </button>
            )}
            {/* Discord Link */}
            <a 
              href="https://guns.lol/riwaq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/50 hover:bg-[#5865F2]/30 transition-colors flex-shrink-0"
            >
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <button 
              type="button"
              className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm sm:text-base whitespace-nowrap transition-colors hover:bg-red-500/10 px-3 py-2 rounded-lg"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground flex-shrink-0" />
            <Input
            type="text"
            placeholder="ابحث عن فئة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pr-10 sm:pr-12 py-5 sm:py-6 text-base sm:text-lg bg-card text-foreground placeholder:text-muted-foreground ${isDahoomy ? "border-cyan-500/30" : "border-cyan-500/30"}`}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categoryGroups.map(group => (
            <button
              key={group.id}
              onClick={() => setActiveFilter(group.id)}
              className={`
                px-3 sm:px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm sm:text-base flex-shrink-0
                ${activeFilter === group.id 
                  ? isDahoomy ? 'bg-cyan-500 text-white font-bold' : 'bg-cyan-500 text-white font-bold' 
                  : isDahoomy ? 'bg-card border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' : 'bg-card border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                }
              `}
            >
              {group.name}
            </button>
          ))}
        </div>

        {/* Categories Grid - Fluid auto-fit */}
        <div className="grid gap-3 sm:gap-4 mb-6 auto-fit-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          {filteredCategories.map(category => {
            const isSelected = selectedCategories.includes(category.id)
            const isDynamicCategory = (category as any).isDynamic
            // رجّع عرض الأيقونات الزرقاء مثل قبل (بدون صور/إيموجي)
            const IconComponent = (category as any).icon || getIconComponent((category as any).iconName) || HelpCircle
            
            return (
              <div
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`
                  relative p-4 sm:p-5 rounded-2xl transition-all duration-300
                  hover:scale-105 hover:shadow-sm group cursor-pointer
                  ${isDahoomy 
                    ? `bg-transparent border ${isSelected ? "border-cyan-500/80 ring-2 ring-cyan-500/50 text-cyan-300" : "border-cyan-500/30 text-cyan-400"} hover:bg-cyan-500/5`
                    : `bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/5 ${isSelected ? "ring-2 ring-cyan-500/60" : ""}`
                  }
                `}
                style={isSelected ? { boxShadow: isDahoomy ? "0 0 12px rgba(6,182,212,0.25)" : "0 0 12px rgba(6,182,212,0.25)" } : {}}
              >
                {isSelected && (
                  <div className={`absolute top-2 left-2 w-6 h-6 rounded-full bg-background flex items-center justify-center text-cyan-400`}>
                    <Check className={`w-4 h-4 text-cyan-400`} />
                  </div>
                )}
                
                {/* Delete button for custom categories (visible on hover) */}
                {isDynamicCategory && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCategoryToDelete({ id: category.id, name: category.name })
                    }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    title="حذف هذا التصنيف"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                
                <div className={`flex justify-center mb-2 text-cyan-400/80`}>
                  <AppIcon icon={IconComponent} size={28} className="rounded-2xl" accent="cyan" />
                </div>

                <div className={`font-bold text-xs sm:text-sm text-center text-cyan-400 line-clamp-2`}>
                  {category.name}
                </div>
                
                {/* Badge for custom categories */}
                {isDynamicCategory && (
                  <div className="mt-2 text-xs bg-blue-500/20 text-blue-400 py-1 px-2 rounded border border-blue-500/30">
                    مخصص
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Team Setup */}
        <div className="mb-6 sticky top-0 z-20 bg-background/80 pt-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-cyan-400">إعداد الفرق</h3>
            <Button 
              onClick={addTeam}
              className={isDahoomy ? "bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-400" : "bg-green-500/20 border border-green-500/50 hover:bg-green-500/30 text-green-400"}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة فريق
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team, index) => (
              <div key={index} className={`p-4 rounded-xl relative ${isDahoomy ? "bg-cyan-500/5 border border-cyan-500/30" : "bg-cyan-500/5 border border-cyan-500/30"}`}>
                {teams.length > 2 && (
                  <button
                    onClick={() => deleteTeam(index)}
                    className="absolute top-2 left-2 text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <Label className="text-sm font-medium mb-2 block text-cyan-400">اسم الفريق {index + 1}</Label>
                <Input
                  value={team.name}
                  onChange={(e) => updateTeamName(index, e.target.value)}
                  placeholder={`اسم الفريق ${index + 1}`}
                  className="mb-3 bg-card text-foreground text-center border-cyan-500/30"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-cyan-400">عدد اللاعبين</span>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => updateTeamPlayers(index, Math.max(1, team.players - 1))}
                      className="w-8 h-8 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-bold w-8 text-center text-cyan-400">{team.players}</span>
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => updateTeamPlayers(index, Math.min(10, team.players + 1))}
                      className="w-8 h-8 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    <AddQuestionModal 
      isOpen={showAddQuestion} 
      onClose={() => {
        setShowAddQuestion(false)
        refreshCategories()
      }} 
    />

    <AddCategoryModal
      isOpen={showAddCategory}
      onClose={() => {
        setShowAddCategory(false)
        refreshCategories()
      }}
    />

    <HostManagementModal
      isOpen={showHostManagement}
      onClose={() => setShowHostManagement(false)}
    />

    <AdminDashboard
      isOpen={showAdminDashboard}
      onClose={() => {
        setShowAdminDashboard(false)
        refreshCategories()
      }}
    />

    <AlertDialog open={showIncompleteModal} onOpenChange={setShowIncompleteModal}>
      <AlertDialogContent className="bg-background/90 shadow-lg border border-cyan-500/30">
        <AlertDialogHeader>
          <AlertDialogTitle>إكمال الإعداد مطلوب</AlertDialogTitle>
          <AlertDialogDescription>
            يجب اختيار 4 وسائل مساعدة لكل فريق قبل بدء اللعبة.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setShowIncompleteModal(false)}>
            فهمت
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Delete Category Confirmation Dialog */}
    <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-blue-500/40 shadow-2xl shadow-blue-500/20">
        <DialogHeader className="space-y-3">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-red-500/20 border border-red-500/40">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold text-blue-300">
            حذف التصنيف
          </DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p className="text-blue-400/90">
              هل أنت متأكد من رغبتك في حذف التصنيف
            </p>
            <p className="text-blue-300 font-bold text-lg">
              "{categoryToDelete?.name}"
            </p>
            <p className="text-blue-400/70 text-sm mt-2">
              سيتم حذف جميع الأسئلة المرتبطة به أيضاً
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 mt-6">
          <Button
            type="button"
            onClick={() => setCategoryToDelete(null)}
            className="flex-1 bg-blue-500/20 border border-blue-500/50 hover:bg-blue-500/30 text-blue-400 font-bold"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (categoryToDelete) {
                handleDeleteCategory(categoryToDelete.id)
              }
            }}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-lg shadow-red-500/30"
            disabled={isDeleting}
          >
            {isDeleting ? "جاري الحذف..." : "حذف التصنيف"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
)
}

export default memo(CategorySelector)

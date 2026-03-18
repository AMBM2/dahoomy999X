"use client"

import { memo, useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useSession } from "next-auth/react"
import { X, RotateCcw, Play, Pause, ArrowLeftRight, Plus, Minus, LogOut, Eye, Lightbulb, Shuffle, RefreshCw, Trash2, Shield, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import PowerUpModal from "./power-up-modal"
import HrofGame from "./hrof-game"
import { categoriesList } from "@/lib/question-bank"
import { getRandomQuestions, markQuestionAsSeen, EnhancedQuestion } from "@/lib/question-manager"
import { useRouter } from "next/navigation"
import { useTheme } from "./theme-provider"
import { useCategories } from "@/contexts/category-context"
import { useGameMode } from "@/contexts/game-mode-context"
import AppIcon from "@/components/app-icon"
import { getCategoryIcon } from "@/lib/category-icons"

interface GameBoardProps {
  selectedCategories: string[]
  teams: {name: string, players: number, powerUps?: string[]}[]
  onExit: () => void
}

interface CardData {
  id: string
  categoryId: string
  categoryName: string
  points: number
  question: string
  answer: string
  image?: string
  video?: string
  youtubeUrl?: string
  timestamp?: string
  clipStart?: string
  clipEnd?: string
  choices?: string[]
  isRiddle?: boolean
  used: boolean
  revealed: boolean
}

type PowerUpType = string | null

interface PowerUp {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
}

const powerUps: PowerUp[] = [
  { id: "earthquake", name: "إعصار", description: "إعادة ترتيب خانات اللعبة بشكل عشوائي", icon: Shuffle },
  { id: "steal-turn", name: "سرقة جولة", description: "اجعل الخصم يجاوب بدلاً منك", icon: ArrowLeftRight },
  { id: "gold-question", name: "السؤال الذهبي", description: "حول قيمة السؤال إلى 500 نقطة", icon: Sparkles },
  { id: "shield", name: "درع", description: "احصل على نقطة إضافية في المرة القادمة", icon: Shield },
  { id: "delete-answers", name: "حذف إجابتين", description: "احذف خيارين خاطئين من السؤال", icon: Trash2 }
]

function GameBoard({ selectedCategories, teams, onExit }: GameBoardProps) {
  const { data: session } = useSession()
  const { theme } = useTheme()
  const { categories: dynamicCategories } = useCategories()
  const { gameMode } = useGameMode()
  const router = useRouter()
  const [canEditScores, setCanEditScores] = useState(false)

  useEffect(() => {
    const checkHost = async () => {
      try {
        const userId = session?.user?.id
        if (!userId) return
        const response = await fetch("/api/hosts", { cache: "no-store" })
        if (!response.ok) return
        const data = await response.json()
        const isHost = Array.isArray(data) && data.some((h: any) => h.userId === userId)
        const isAdmin = ["897450827353063505", "1186739142231605248"].includes(userId)
        setCanEditScores(isHost || isAdmin)
      } catch {
        // ignore
      }
    }
    checkHost()
  }, [session?.user?.id])

  // If Hrof game mode is selected, render Hrof component instead
  if (gameMode === "hrof") {
    return <HrofGame selectedCategories={selectedCategories} onExit={onExit} />
  }

  // Teams data
  const teamNames = teams.map(t => t.name)

  // Scores
  const [scores, setScores] = useState<number[]>(() => teams.map(() => 0))

  // Timer
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Question Timer (10 seconds countdown)
  const [questionTimer, setQuestionTimer] = useState(10)
  const [questionTimerActive, setQuestionTimerActive] = useState(false)
  const [pendingQuestionTimerDuration, setPendingQuestionTimerDuration] = useState<number | null>(null)

  // Turn (index into teams array)
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0)

  // Power-ups
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType>(null)
  const [showPowerUpModal, setShowPowerUpModal] = useState(false)
  const [powerUpTeam, setPowerUpTeam] = useState("")
  const [usedPowerUps, setUsedPowerUps] = useState<Set<string>>(new Set())
  const [shields, setShields] = useState<boolean[]>(() => teams.map(() => false))

  // Reset scores/shields when team count changes
  useEffect(() => {
    setScores(teams.map(() => 0))
    setShields(teams.map(() => false))
    setCurrentTeamIndex(0)
    setUsedPowerUps(new Set())
  }, [teams.length])

  // Game cards
  const [cards, setCards] = useState<CardData[]>([])
  
  // Selected card for question modal
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [clipPlaying, setClipPlaying] = useState(false)
  const [clipReady, setClipReady] = useState(false)
  const [clipDone, setClipDone] = useState(false)
  const [ytIframeKey, setYtIframeKey] = useState(0)
  const htmlVideoRef = useRef<HTMLVideoElement | null>(null)
  
  // Current question points
  const [currentPoints, setCurrentPoints] = useState(0)

  // Track rounds to allow resetting the game
  const [gameKey, setGameKey] = useState(0)

  // Initialize game cards with localStorage-based question management
  // كل تصنيف يجلب أسئلته الخاصة فقط - لا يوجد خلط
  useEffect(() => {
    const initializeCards = async () => {
      const pointValues = [50, 100, 300, 500, 1000, 1000] // 6 rows
      const newCards: CardData[] = []
      
      // جلب الأسئلة الديناميكية من API
      let dynamicQuestions: any[] = []
      try {
        const response = await fetch('/api/questions', { 
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' }
        })
        if (response.ok) {
          const data = await response.json()
          dynamicQuestions = Array.isArray(data) ? data : []
        }
      } catch (error) {
        console.error('Error fetching dynamic questions:', error)
        dynamicQuestions = []
      }
      
      for (const catId of selectedCategories) {
        const category =
          categoriesList.find(c => c.id === catId) ||
          (dynamicCategories.find(c => c.id === catId) as any)
        
        // جلب أسئلة التصنيف المحدد فقط - فلترة صارمة - لا خلط
        let categoryQuestions = getRandomQuestions(catId, 6, true)
        
        // إذا لم نجد أسئلة ثابتة، جرب الأسئلة الديناميكية
        if (categoryQuestions.length === 0) {
          const dynamicCategoryQuestions = dynamicQuestions.filter(q => q.categoryId === catId)
          if (dynamicCategoryQuestions.length > 0) {
            categoryQuestions = dynamicCategoryQuestions.map((q: any, index: number) => ({
              ...q,
              id: q.id || `${catId}-${index}`,
              categoryId: catId,
              type: (q.isRiddle ? 'riddle' : q.mediaUrl ? 'image' : q.choices ? 'choices' : 'text') as any,
              text: q.text,
              answer: q.answer,
              image: q.mediaUrl,
              video: undefined,
              youtubeUrl: q.youtubeUrl || undefined,
              timestamp: q.timestamp || undefined,
              clipStart: q.clipStart || undefined,
              clipEnd: q.clipEnd || undefined,
            })) as any
          }
        }

        // توزيع الأسئلة حسب عدد النقاط حتى لا يظهر سؤال 50 في خانة 500 مثلاً
        const byPoints: Record<number, any[]> = {}
        for (const q of categoryQuestions) {
          const p = typeof q.points === "number" ? q.points : 100
          if (!byPoints[p]) byPoints[p] = []
          byPoints[p].push(q)
        }

        pointValues.forEach((points, rowIndex) => {
          // نحاول أخذ سؤال يطابق نفس عدد النقاط فقط
          const bucket = byPoints[points] || []
          const q = bucket.shift()
          byPoints[points] = bucket
          
          // تسجيل السؤال كمعروض في localStorage
          if (q) {
            markQuestionAsSeen(catId, q.id)
          }
          
          newCards.push({
            id: `${catId}-row${rowIndex}-pts${points}`, // ID فريد يتضمن التصنيف والصف والنقاط
            categoryId: catId,
            categoryName: (category as any)?.name || catId,
            points,
            question: q?.text || 'سؤال غير متوفر - تحقق من ملف الأسئلة',
            answer: q?.answer || 'لا يوجد جواب',
            image: q?.image,
            video: q?.video,
            youtubeUrl: (q as any)?.youtubeUrl,
            timestamp: (q as any)?.timestamp,
            clipStart: (q as any)?.clipStart,
            clipEnd: (q as any)?.clipEnd,
            choices: q?.choices,
            isRiddle: q?.isRiddle,
            used: false,
            revealed: false
          })
        })
      }
      
      setCards(newCards)
    }
    
    initializeCards()
  }, [selectedCategories, gameKey])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  // Question timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (questionTimerActive && questionTimer > 0) {
      interval = setInterval(() => {
        setQuestionTimer(prev => prev - 1)
      }, 1000)
    } else if (questionTimer === 0 && questionTimerActive) {
      // Time's up for current team - move to next team and reset timer
      setCurrentTeamIndex(prev => (prev + 1) % teams.length)
      const timerDuration = selectedCard ? getTimerDuration(selectedCard.points) : 10
      setQuestionTimer(timerDuration)
    }
    return () => clearInterval(interval)
  }, [questionTimerActive, questionTimer, teams.length, selectedCard])

  const isGameOver = useMemo(() => cards.length > 0 && cards.every(c => c.used), [cards])

  useEffect(() => {
    if (!isGameOver) return

    setSelectedCard(null)
    setShowPowerUpModal(false)
    setIsTimerRunning(false)
    setQuestionTimerActive(false)

    // Determine winner(s)
    const maxScore = Math.max(...scores)
    const winners = teams
      .map((team, idx) => ({ ...team, score: scores[idx] }))
      .filter(t => t.score === maxScore)
    const winnerNames = winners.map(t => t.name).join(' و ')

    // Send teams and scores to victory page
    const params = new URLSearchParams({
      winner: winnerNames,
      teams: JSON.stringify(teams.map((team, idx) => ({
        name: team.name,
        score: scores[idx]
      })))
    })

    router.push(`/victory?${params.toString()}`)
  }, [isGameOver, scores, teams, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get timer duration based on points
  const getTimerDuration = (points: number) => {
    switch (points) {
      case 50: return 30
      case 100: return 20
      case 300: return 30
      case 500: return 40
      case 1000: return 60
      default: return 10
    }
  }

  const handleCardClick = (card: CardData) => {
    if (card.used) return
    setSelectedCard(card)
    setCurrentPoints(card.points)
    setShowAnswer(false)
    setIsTimerRunning(true)
    const hasYouTubeClip = !!(card.youtubeUrl && (card.clipStart || card.timestamp))
    const hasClip = hasYouTubeClip || !!card.video
    setClipReady(hasClip)
    setClipDone(!hasClip)
    setClipPlaying(false)
    setYtIframeKey(prev => prev + 1)
    
    // Prepare question timer (starts AFTER clip if any)
    const timerDuration = getTimerDuration(card.points)
    setQuestionTimer(timerDuration)
    setPendingQuestionTimerDuration(timerDuration)
    setQuestionTimerActive(false)
    if (!hasClip) {
      setQuestionTimerActive(true)
      setPendingQuestionTimerDuration(null)
    }

    // Mark card as used
    setCards(prev => prev.map(c => 
      c.id === card.id ? { ...c, used: true } : c
    ))
  }

  const handleTeamAnswer = (teamIndex: number) => {
    if (!canEditScores) {
      alert("فقط المضيف يمكنه تعديل القيم")
      return
    }
    const extra = shields[teamIndex] ? 50 : 0
    const pointsToAdd = currentPoints + extra

    setScores(prev => prev.map((score, idx) => idx === teamIndex ? score + pointsToAdd : score))
    setShields(prev => prev.map((s, idx) => idx === teamIndex ? false : s))

    // Show completion animation
    setShowCompletion(true)
    
    // Wait for animation then close
    setTimeout(() => {
      setShowCompletion(false)
      // move to next team
      setCurrentTeamIndex(prev => (prev + 1) % teams.length)
      closeQuestionModal()
    }, 1500)
  }

  const handleSkipQuestion = () => {
    setCurrentTeamIndex(prev => (prev + 1) % teams.length)
    closeQuestionModal()
  }

  const closeQuestionModal = () => {
    setSelectedCard(null)
    setShowAnswer(false)
    setIsTimerRunning(false)
    setQuestionTimerActive(false)
    setQuestionTimer(10)
    setClipPlaying(false)
    setClipReady(false)
    setClipDone(false)
    setPendingQuestionTimerDuration(null)
  }

  const parseTimestampToSeconds = (ts?: string) => {
    if (!ts) return 0
    const parts = ts.split(":").map(p => parseInt(p, 10)).filter(n => !Number.isNaN(n))
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    return 0
  }

  const extractYouTubeId = (url?: string) => {
    if (!url) return null
    try {
      const u = new URL(url)
      if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "") || null
      if (u.hostname.includes("youtube.com")) return u.searchParams.get("v")
      return null
    } catch {
      return null
    }
  }

  const startClip = () => {
    if (!selectedCard) return
    if (!clipReady || clipPlaying) return

    setClipDone(false)
    setClipPlaying(true)
    setYtIframeKey(prev => prev + 1)

    const start =
      parseTimestampToSeconds(selectedCard.clipStart) ||
      parseTimestampToSeconds(selectedCard.timestamp)
    const end = parseTimestampToSeconds(selectedCard.clipEnd)
    const durationMs = Math.max(
      1000,
      (end && end > start ? (end - start) : 10) * 1000
    )

    // HTML video: seek + play
    if (selectedCard.video && htmlVideoRef.current) {
      try {
        htmlVideoRef.current.currentTime = start || 0
        void htmlVideoRef.current.play()
      } catch {
        // ignore
      }
    }

    window.setTimeout(() => {
      if (selectedCard.video && htmlVideoRef.current) {
        try {
          htmlVideoRef.current.pause()
        } catch {
          // ignore
        }
      }
      setClipPlaying(false)
      setClipDone(true)

      // Start question timer only after clip ends
      setQuestionTimerActive(true)
      setPendingQuestionTimerDuration(null)
    }, durationMs)
  }

  // لا نشغل المقطع تلقائيًا — فقط نجهز الحالة
  useEffect(() => {
    if (!selectedCard) return
    const hasYouTubeClip = !!(selectedCard.youtubeUrl && (selectedCard.clipStart || selectedCard.timestamp))
    const hasClip = hasYouTubeClip || !!selectedCard.video
    setClipReady(hasClip)
    setClipDone(!hasClip)
    setClipPlaying(false)
  }, [selectedCard?.id])

  const resetGame = () => {
    setScores(teams.map(() => 0))
    setCurrentTeamIndex(0)
    setUsedPowerUps(new Set())
    setShields(teams.map(() => false))
    setGameKey(prev => prev + 1)
    setSelectedCard(null)
    setActivePowerUp(null)
    setShowPowerUpModal(false)
    setTimer(0)
    setIsTimerRunning(false)
    setQuestionTimer(10)
    setQuestionTimerActive(false)
  }

  const Confetti = () => {
    const [pieces, setPieces] = useState<Array<{left: number; top: number; delay: number; duration: number; color: string; rotate: number;}>>([])

    useEffect(() => {
      setPieces(Array.from({ length: 30 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 1.8 + Math.random() * 1.2,
        color: theme === 'dahoomy-999' 
          ? ['#06b6d4', '#ef4444', '#22d3ee', '#f87171', '#00FFFF'][Math.floor(Math.random() * 5)]
          : ['#3B82F6', '#A855F7', '#22d3ee', '#60a5fa', '#93c5fd'][Math.floor(Math.random() * 5)],
        rotate: Math.random() * 360
      })))
    }, [])

    if (pieces.length === 0) return null

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {pieces.map((p, idx) => (
          <div
            key={idx}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              transform: `rotate(${p.rotate}deg)`
            }}
          />
        ))}
      </div>
    )
  }

  const handlePowerUp = (type: PowerUpType, teamIndex: number) => {
    setActivePowerUp(type)
    setPowerUpTeam(teamNames[teamIndex] || `الفريق ${teamIndex + 1}`)
    setShowPowerUpModal(true)
  }

  const handleNewPowerUp = (powerUpId: string, teamIndex: number) => {
    if (usedPowerUps.has(`${teamIndex}-${powerUpId}`)) return // Already used

    // Show the power-up overlay for 2 seconds
    handlePowerUp(powerUpId, teamIndex)

    switch (powerUpId) {
      case "earthquake":
        // Shuffle the remaining cards
        setCards(prev => {
          const shuffled = [...prev]
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
          }
          return shuffled
        })
        break
      case "steal-turn":
        // Force next team to answer
        setCurrentTeamIndex(prev => (prev + 1) % teams.length)
        break
      case "gold-question":
        // Make current question worth 500 points
        setCurrentPoints(500)
        setSelectedCard(prev => prev ? { ...prev, points: 500 } : null)
        break
      case "shield":
        // Grant a small bonus on next correct answer
        setShields(prev => prev.map((s, idx) => idx === teamIndex ? true : s))
        break
      case "delete-answers":
        // Remove 2 wrong answers from multiple choice
        if (selectedCard && selectedCard.choices) {
          const correctAnswer = selectedCard.answer
          const wrongAnswers = selectedCard.choices.filter(choice => choice !== correctAnswer)
          const remainingWrong = wrongAnswers.slice(0, 1) // Keep only 1 wrong answer
          const newChoices = [correctAnswer, ...remainingWrong]
          setSelectedCard(prev => prev ? { ...prev, choices: newChoices } : null)
        }
        break
    }
    
    setUsedPowerUps(prev => new Set(prev).add(`${teamIndex}-${powerUpId}`))
  }

  const onPowerUpClose = useCallback(() => {
    setShowPowerUpModal(false)
    setActivePowerUp(null)
  }, [])

  const toggleTurn = () => {
    setCurrentTeamIndex(prev => (prev + 1) % teams.length)
  }

  // Get category icon component
  const getCategoryIconComponent = (catId: string) => {
    const IconComponent = getCategoryIcon(catId)
    return <AppIcon icon={IconComponent} size={22} className="rounded-xl" accent="cyan" />
  }

  return (
    <div 
      className="h-[100dvh] flex flex-col lg:flex-row overflow-hidden animated-bg animate-fade-in"
      style={theme === 'dahoomy-999' 
        ? {
            background: `radial-gradient(circle at 20% 20%, rgba(0,255,255,0.12), transparent 45%),
                         radial-gradient(circle at 80% 30%, rgba(255,51,102,0.08), transparent 50%),
                         linear-gradient(135deg, #030308, #0a0812)`
          }
        : {
            background: `radial-gradient(circle at 20% 20%, rgba(59,130,246,0.14), transparent 45%),
                         radial-gradient(circle at 80% 30%, rgba(168,85,247,0.10), transparent 50%),
                         linear-gradient(135deg, #060608, #0c0b10)`
          }
      }
      suppressHydrationWarning
    >
      {/* Main Game Grid */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden">
        {/* Status Bar */}
        <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-white/10 backdrop-blur border theme-border rounded-2xl p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold uppercase tracking-widest theme-text-secondary">الوقت</div>
            <div className="text-[clamp(1.1rem,2.2vw,1.5rem)] font-black theme-text">{formatTime(timer)}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full sm:w-auto">
            {teams.map((team, idx) => {
              const isActive = currentTeamIndex === idx
              return (
                <div
                  key={idx}
                  className={`rounded-2xl px-4 py-2 text-center transition ${
                    isActive 
                      ?                       theme === 'dahoomy-999' 
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40 animate-pulse' 
                        : 'theme-bg text-black shadow-lg'
                      : 'bg-white/10 theme-text'
                  }`}
                >
                  <div className="text-xs theme-text-secondary">{team.name}</div>
                  <div className="text-[clamp(1rem,2.2vw,1.25rem)] font-black">{scores[idx]}</div>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    {(team.powerUps ?? []).map((powerUpId) => {
                      const powerUp = powerUps.find(p => p.id === powerUpId)
                      if (!powerUp) return null
                      const isUsed = usedPowerUps.has(`${idx}-${powerUpId}`)
                      const IconComponent = powerUp.icon
                      return (
                        <IconComponent
                          key={powerUpId}
                          className={`w-4 h-4 ${isUsed ? 'text-muted-foreground opacity-60' : 'theme-text'}`}
                          title={powerUp.name}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Game Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category Headers */}
            <div className="grid gap-2 mb-2 flex-shrink-0" style={{ gridTemplateColumns: `repeat(${selectedCategories.length}, 1fr)` }}>
          {selectedCategories.map(catId => {
            const cat =
              categoriesList.find(c => c.id === catId) ||
              (dynamicCategories.find(c => c.id === catId) as any)
            return (
              <div 
                key={catId}
                className="relative p-4 rounded-2xl bg-white/10 backdrop-blur-xl border theme-border theme-text overflow-hidden"
              >
                <div className="flex justify-center mb-2 theme-text">
                  {getCategoryIconComponent(catId)}
                </div>
                <div className="font-bold text-sm text-center theme-text">
                  {(cat as any)?.name}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Point Cards Grid */}
        <div className="flex-1 grid gap-2" style={{ gridTemplateRows: `repeat(6, 1fr)` }}>
          {[50, 100, 300, 500, 1000, 1000].map((points, rowIndex) => (
            <div 
              key={rowIndex}
              className="grid gap-2" 
              style={{ gridTemplateColumns: `repeat(${selectedCategories.length}, 1fr)` }}
            >
              {selectedCategories.map(catId => {
                const card = cards.find(c => c.categoryId === catId && c.id === `${catId}-row${rowIndex}-pts${points}`)
                if (!card) return <div key={`${catId}-${rowIndex}`} />
                
                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    disabled={card.used || isGameOver}
                    className={`
                      relative rounded-2xl font-bold text-[clamp(1.1rem,2.6vw,1.8rem)] transition-all duration-300
                      bg-white/10 backdrop-blur-xl border theme-border 
                      ${theme === 'dahoomy-999' ? 'text-cyan-200 drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]' : 'text-blue-300 drop-shadow-[0_0_12px_rgba(59,130,246,0.7)]'}
                      hover:bg-white/15 hover:scale-105 hover:shadow-lg ${theme === 'dahoomy-999' ? 'hover:shadow-cyan-500/30' : 'hover:shadow-blue-500/30'}
                      ${card.used || isGameOver ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {card.used ? '' : card.points}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Right Sidebar - Control Panel */}
      <div 
        className="w-full lg:w-80 p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 border-t lg:border-t-0 lg:border-r theme-border bg-white/10 backdrop-blur-xl"
      >
        {/* Header with Logo */}
        <div className="text-center">
          <div className="rounded-2xl border theme-border bg-gradient-to-br from-cyan-500/10 via-white/5 to-blue-500/10 backdrop-blur-xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border theme-border shadow-[0_0_18px_rgba(6,182,212,0.15)]">
                <img
                  src="/images/dahoomy-999.png"
                  alt="Dahoomy"
                  className="h-6 w-auto object-contain"
                />
                <span className="text-[11px] font-semibold text-cyan-300/90">v2.0</span>
              </div>
            </div>

            <h1
              className={`text-2xl font-black theme-text mb-2 ${
                theme === 'dahoomy-999' ? 'neon-dahoomy text-cyan-200' : 'text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.55)]'
              }`}
            >
              قائمة التحدي
            </h1>

            <div className="flex items-center justify-center gap-2">
              <span className="text-sm px-3 py-1.5 rounded-full bg-white/10 border theme-border text-cyan-200">
                الدور
              </span>
              <span className="font-extrabold text-cyan-100 drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]">
                {teamNames[currentTeamIndex]}
              </span>
            </div>
          </div>
        </div>

        {/* Timer */}
            <div className="bg-white/10 backdrop-blur-xl border theme-border p-4 rounded-2xl">
          <div className="text-center">
            <div className={`text-5xl font-black font-mono ${theme === 'dahoomy-999' ? 'text-cyan-300 neon-dahoomy' : 'text-blue-300'}`} style={{ transform: 'translateZ(0)' }}>
              {formatTime(timer)}
            </div>
            <div className="flex justify-center gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="theme-border theme-text hover:theme-bg-muted"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => { setTimer(0); setIsTimerRunning(false) }}
                className="theme-border theme-text hover:theme-bg-muted"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Turn Toggle */}
        <Button 
          onClick={toggleTurn}
          className="w-full theme-bg-muted border theme-border theme-text hover:theme-bg-secondary"
        >
          <ArrowLeftRight className="w-4 h-4 ml-2" />
          تبديل الدور
        </Button>

        {teams.map((team, idx) => (
          <div key={idx} className="bg-white/10 backdrop-blur-xl border theme-border p-4 rounded-2xl">
            <div className="text-center theme-text font-bold mb-2">{team.name}</div>
            <div className="flex items-center justify-center gap-3">
              <Button 
                size="icon" 
                variant="outline"
                onClick={() => canEditScores && setScores(prev => prev.map((s, i) => i === idx ? s + currentPoints : s))}
                disabled={!canEditScores}
                className="w-10 h-10 theme-border theme-text theme-bg-muted hover:theme-bg-secondary"
              >
                <Plus className="w-6 h-6" />
              </Button>
              <Button 
                size="default" 
                variant="outline"
                onClick={() => canEditScores && setScores(prev => prev.map((s, i) => i === idx ? s + 50 : s))}
                disabled={!canEditScores}
                className="theme-border theme-text theme-bg-muted hover:theme-bg-secondary px-3"
              >
                +50
              </Button>
              <div className="text-4xl font-black theme-text w-24 text-center animate-roll" key={scores[idx]}>
                {scores[idx]}
              </div>
              <Button 
                size="default" 
                variant="outline"
                onClick={() => canEditScores && setScores(prev => prev.map((s, i) => i === idx ? Math.max(0, s - 50) : s))}
                disabled={!canEditScores}
                className="theme-border theme-text theme-bg-muted hover:theme-bg-secondary px-3"
              >
                -50
              </Button>
              <Button 
                size="icon" 
                variant="outline"
                onClick={() => canEditScores && setScores(prev => prev.map((s, i) => i === idx ? Math.max(0, s - currentPoints) : s))}
                disabled={!canEditScores}
                className="w-10 h-10 theme-border theme-text theme-bg-muted hover:theme-bg-secondary"
              >
                <Minus className="w-6 h-6" />
              </Button>
            </div>
          </div>
        ))}

        {/* Social Links */}
        <div className="flex justify-center gap-3">
          <a 
            href="https://guns.lol/riwaq" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/50 hover:bg-[#5865F2]/30 transition-colors"
          >
            <svg className="w-5 h-5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
        </div>

        {/* Exit Button */}
        <Button 
          variant="destructive" 
          onClick={onExit}
          className="mt-auto"
        >
          <LogOut className="w-4 h-4 ml-2" />
          خروج
        </Button>

        {/* Footer with version */}
        <div className="text-center py-2">
          <div className="inline-block px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <img 
              src="/images/dahoomy-999.png" 
              alt="Dahoomy" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <div className="text-xs text-cyan-400/70 mt-1">v2.0</div>
          <div className="text-xs font-bold bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">© 2026 رواق</div>
        </div>
      </div>

      {/* Question Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div 
            className="relative w-full max-w-4xl mx-4 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 theme-border"
          >
            {/* Close button */}
            <button 
              onClick={closeQuestionModal}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/20 theme-text"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Category & Points */}
            <div className="text-center mb-6">
              <div className="flex justify-center theme-text">
                {getCategoryIconComponent(selectedCard.categoryId)}
              </div>
              <h3 className="text-2xl font-bold theme-text mt-2">{selectedCard.categoryName}</h3>
              <div className={`text-5xl font-black theme-text mt-2 ${theme === 'dahoomy-999' ? 'neon-dahoomy text-cyan-200' : 'text-blue-300'}`}>
                {selectedCard.points} نقطة
              </div>
              {/* Question Timer (يبدأ بعد المقطع إذا كان موجود) */}
              {questionTimerActive && (
                <div className="mt-4">
                  <div className={`text-4xl font-black ${questionTimer <= 3 ? 'text-red-500 animate-pulse' : 'theme-text'}`}>
                    {questionTimer} ثانية
                  </div>
                </div>
              )}
              {!questionTimerActive && clipReady && !clipDone && (
                <div className="mt-4 text-sm text-cyan-300/80">
                  يبدأ الوقت بعد انتهاء المقطع
                </div>
              )}
            </div>

            {/* Riddle Badge */}
            {selectedCard.isRiddle && (
              <div className="flex justify-center mb-4">
                <span className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 font-bold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  لغز
                </span>
              </div>
            )}

            {/* YouTube Clip */}
            {selectedCard.youtubeUrl && (selectedCard.clipStart || selectedCard.timestamp) && (
              <div className="mb-4">
                <div className="text-xs text-cyan-300/80 mb-2 text-center">
                  مقطع من اليوتيوب ({selectedCard.clipStart || selectedCard.timestamp}{selectedCard.clipEnd ? ` → ${selectedCard.clipEnd}` : ""})
                </div>
                {(() => {
                  const vid = extractYouTubeId(selectedCard.youtubeUrl)
                  const start =
                    parseTimestampToSeconds(selectedCard.clipStart) ||
                    parseTimestampToSeconds(selectedCard.timestamp)
                  const end = parseTimestampToSeconds(selectedCard.clipEnd)
                  if (!vid) return null
                  const endParam = end && end > start ? `&end=${end}` : ""
                  const commonParams = `playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&controls=0&fs=0&disablekb=1&cc_load_policy=0`
                  const src = `https://www.youtube-nocookie.com/embed/${vid}?start=${start}${endParam}&autoplay=1&mute=1&${commonParams}`
                  return (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 theme-border shadow-[0_0_30px_rgba(6,182,212,0.18)]">
                      {/* Show a clean preview حتى يبدأ التشغيل */}
                      {!clipPlaying && clipReady && !clipDone && (
                        <div
                          className="absolute inset-0 bg-black/60"
                          style={{
                            backgroundImage: `linear-gradient(to bottom, rgba(2,6,23,0.35), rgba(2,6,23,0.75)), url(https://i.ytimg.com/vi/${vid}/hqdefault.jpg)`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      )}

                      {/* iframe يظهر فقط أثناء تشغيل الكليب */}
                      {clipPlaying && (
                        <>
                          <iframe
                            key={ytIframeKey}
                            src={src}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            className="w-full h-full"
                          />
                          {/* أغطية لإخفاء اسم القناة واقتراحات More videos قدر الإمكان */}
                          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-900 via-slate-900/70 to-transparent" />
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
                        </>
                      )}

                      {!clipPlaying && clipReady && !clipDone && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={startClip}
                            className="px-6 py-3 rounded-2xl font-black text-cyan-100 border border-cyan-400/55 bg-cyan-500/15 hover:bg-cyan-500/25 shadow-[0_0_26px_rgba(6,182,212,0.28)] transition"
                          >
                            ابدأ الفيديو
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Question Image */}
            {selectedCard.image && (
              <div className="flex justify-center mb-4">
                <img 
                  src={selectedCard.image} 
                  alt="صورة السؤال"
                  className="max-w-full max-h-48 rounded-xl border-2 theme-border object-contain"
                />
              </div>
            )}

            {/* Question Video */}
            {selectedCard.video && (
              <div className="relative flex justify-center mb-4">
                <video 
                  src={selectedCard.video}
                  controls
                  ref={htmlVideoRef}
                  className="max-w-full max-h-48 rounded-xl border-2 theme-border"
                />
                {!clipPlaying && clipReady && !clipDone && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-sm rounded-xl">
                    <button
                      type="button"
                      onClick={startClip}
                      className="px-5 py-3 rounded-xl font-black text-cyan-100 border border-cyan-400/50 bg-cyan-500/15 hover:bg-cyan-500/25 shadow-[0_0_22px_rgba(6,182,212,0.25)] transition"
                    >
                      ابدأ الفيديو
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Question Content (لا يظهر إلا بعد انتهاء المقطع) */}
            {(!clipReady || clipDone) && (
              <div className="flex items-center justify-center">
                <div className={`w-full max-w-2xl relative rounded-2xl p-6 mb-6 ${selectedCard.isRiddle ? 'bg-purple-900/25 border border-purple-500/30' : 'bg-black/30'}`}>
                  <p className={`text-2xl text-center leading-relaxed ${selectedCard.isRiddle ? 'text-purple-100 font-bold' : 'text-white'}`}>
                    {selectedCard.question}
                  </p>
                </div>
              </div>
            )}

            {/* Multiple Choice Options */}
            {(!clipReady || clipDone) && selectedCard.choices && selectedCard.choices.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {selectedCard.choices.map((choice, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-xl text-center font-bold transition-all cursor-pointer
                      ${showAnswer && choice === selectedCard.answer 
                        ? 'bg-green-500/30 border-2 border-green-500 text-green-300' 
                        : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                      }`}
                  >
                    <span className="theme-text ml-2">{String.fromCharCode(65 + index)}.</span>
                    {choice}
                  </div>
                ))}
              </div>
            )}

            {/* Answer */}
            {(!clipReady || clipDone) && showAnswer && (
              <div className="theme-bg-secondary rounded-2xl p-4 mb-6 border theme-border">
                <p className="text-xl text-center theme-text font-bold">
                  الجواب: {selectedCard.answer}
                </p>
              </div>
            )}

            {/* Completion Animation */}
            {showCompletion && (
              <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="animate-bounce">
                  <div className="text-6xl font-bold text-cyan-400 opacity-80 blur-sm transform -rotate-12">
                    ✓
                  </div>
                </div>
                <style>{`
                  @keyframes slideIn {
                    from {
                      opacity: 0;
                      transform: scale(0.5) rotate(45deg);
                    }
                    to {
                      opacity: 1;
                      transform: scale(1) rotate(0deg);
                    }
                  }
                  @keyframes fadeOutScale {
                    from {
                      opacity: 1;
                      transform: scale(1);
                    }
                    to {
                      opacity: 0;
                      transform: scale(1.5);
                    }
                  }
                  .completion-watermark {
                    animation: slideIn 0.5s ease-out, fadeOutScale 0.5s ease-out 1s;
                  }
                `}</style>
                <div className="completion-watermark absolute text-center">
                  <div className="text-8xl font-black text-cyan-400/50 mb-2" style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.8)' }}>
                    ✓
                  </div>
                  <div className="text-4xl font-bold text-cyan-300/70" style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.6)' }}>
                    تم الاختيار
                  </div>
                </div>
              </div>
            )}

            {/* Show Answer Button */}
            {!showAnswer && (
              <div className="flex justify-center mb-4">
                <Button 
                  onClick={() => setShowAnswer(true)}
                  variant="outline"
                  className="theme-border theme-text hover:theme-bg-muted px-8 py-4 text-lg"
                >
                  <Eye className="w-5 h-5 ml-2" />
                  إظهار الجواب
                </Button>
              </div>
            )}

            {/* Actions - Team buttons (use team names and auto-switch turn) */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {teams.map((team, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleTeamAnswer(idx)}
                    className={`px-4 py-4 text-base font-bold ${currentTeamIndex === idx ? 'bg-green-600 hover:bg-green-700' : 'theme-bg-muted hover:theme-bg-secondary'} text-white`}
                  >
                    {team.name}
                  </Button>
                ))}
              </div>
              <div className="flex justify-center mt-2">
                <Button
                  onClick={handleSkipQuestion}
                  variant="outline"
                  className="theme-border theme-text hover:theme-bg-muted px-6 py-3"
                >
                  تخطي السؤال
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Power-up Modal */}
      {showPowerUpModal && (
        <PowerUpModal 
          powerUp={activePowerUp}
          onClose={onPowerUpClose}
          team={powerUpTeam}
        />
      )}
    </div>
  )
}

export default memo(GameBoard)

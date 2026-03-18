"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X } from "lucide-react"
import { useSession } from "next-auth/react"
import GameAssistanceTools from "./game-assistance-tools"

// 28 Arabic letters
const ARABIC_LETTERS = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"]

interface HrofProps {
  selectedCategories: string[]
  onExit: () => void
}

interface Question {
  id: string
  text: string
  answer: string
  choices?: string[]
  categoryId: string
  letter: string
  gameMode?: string
}

interface RoundScore {
  user_id: string
  username: string
  avatar_url?: string
  points: number
  rank: number
}

interface GameState {
  round: number
  roundScore: number
  totalScore: number
  questionsAnswered: number
  // Letter states: 'available' | 'correct' | 'wrong'
  letterStates: Record<string, 'available' | 'correct' | 'wrong'>
}

export default function HrofGame({ selectedCategories, onExit }: HrofProps) {
  const { data: session } = useSession()
  
  // ==== ALL HOOKS AT TOP - BEFORE ANY CONDITIONAL LOGIC ====
  
  // All useState hooks
  const [gameState, setGameState] = useState<GameState>({
    round: 1,
    roundScore: 0,
    totalScore: 0,
    questionsAnswered: 0,
    letterStates: ARABIC_LETTERS.reduce((acc, letter, idx) => {
      acc[idx] = 'available'
      return acc
    }, {} as Record<string, 'available' | 'correct' | 'wrong'>)
  })
  
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [currentLetterIndex, setCurrentLetterIndex] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showRoundResults, setShowRoundResults] = useState(false)
  const [roundTopScorers, setRoundTopScorers] = useState<RoundScore[]>([])
  const [countdownToNextRound, setCountdownToNextRound] = useState(0)
  const [gameEnded, setGameEnded] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<RoundScore[]>([])
  
  // Game Assistance Tools State
  const [usedTools, setUsedTools] = useState({
    steal: false,
    double: false,
    switch: false
  })
  const [doublePointsActive, setDoublePointsActive] = useState(false)
  const [showToolMessage, setShowToolMessage] = useState<string | null>(null)
  
  // Refs
  const questionsCacheRef = useRef<Question[]>([])
  const currentRoundQuestionsRef = useRef<Question[]>([])

  
  // ==== ALL useEffect HOOKS - BEFORE ANY CONDITIONAL RETURNS ====
  
  // Load questions from API
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/api/questions")
        const data = await response.json()
        
        // Filter for Hrof mode questions from selected categories
        const hrofQuestions = data
          .filter((q: any) => {
            const isHrof = q.gameMode === "hrof" || q.gameMode === "Hrof"
            const isInCategory = selectedCategories.includes(q.categoryId)
            return isHrof && isInCategory
          })
          .map((q: any) => ({
            ...q,
            letter: q.letter || "؟"
          }))
        
        questionsCacheRef.current = hrofQuestions
        
        if (hrofQuestions.length === 0) {
          // Use any Hrof questions if no category-specific ones
          const fallback = data.filter((q: any) => 
            q.gameMode === "hrof" || q.gameMode === "Hrof"
          )
          questionsCacheRef.current = fallback
        }
        
        setAllQuestions(questionsCacheRef.current)
      } catch (error) {
        console.error("Error loading Hrof questions:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadQuestions()
  }, [selectedCategories])
  
  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        // This would fetch from a leaderboard API if available
        // For now, we'll simulate with empty data
        setLeaderboardData([])
      } catch (error) {
        console.error("Error loading leaderboard:", error)
      }
    }
    
    loadLeaderboard()
  }, [])
  
  // Timer effect for question countdown
  useEffect(() => {
    if (showRoundResults || !currentQuestion || isAnswered) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setFeedback("wrong")
          setIsAnswered(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [currentQuestion, isAnswered, showRoundResults])
  
  // Handle answer submission and move to next question
  useEffect(() => {
    if (!isAnswered) return
    
    const timer = setTimeout(() => {
      const newAnswersCount = gameState.questionsAnswered + 1
      
      // Check if round is complete (10 questions)
      if (newAnswersCount >= 10) {
        // Calculate top 3 scorers for this round
        const mockScorers: RoundScore[] = [
          { user_id: session?.user?.id || "1", username: session?.user?.name || "أنت", avatar_url: session?.user?.image || "", points: gameState.roundScore, rank: 1 },
          { user_id: "2", username: "لاعب 2", avatar_url: "", points: Math.max(0, gameState.roundScore - 50), rank: 2 },
          { user_id: "3", username: "لاعب 3", avatar_url: "", points: Math.max(0, gameState.roundScore - 100), rank: 3 }
        ]
        
        setRoundTopScorers(mockScorers)
        setShowRoundResults(true)
        return
      }
      
      // Pick next random letter
      const randomIdx = Math.floor(Math.random() * ARABIC_LETTERS.length)
      selectLetter(randomIdx)
      
      setGameState(prev => ({
        ...prev,
        questionsAnswered: newAnswersCount
      }))
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [isAnswered, gameState.questionsAnswered, gameState.roundScore, session])
  
  // Handle round countdown and auto-start next round
  useEffect(() => {
    if (countdownToNextRound === 0) return
    
    const timer = setInterval(() => {
      setCountdownToNextRound(prev => {
        if (prev <= 1) {
          // Start next round
          startNewRound()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [countdownToNextRound])
  
  // ==== HANDLER FUNCTIONS ====
  
  const selectLetter = useCallback((letterIndex: number) => {
    const availableQuestions = questionsCacheRef.current.filter(
      q => !Object.values(gameState.letterStates).some(
        (state, idx) => idx.toString() === letterIndex.toString() && state !== 'available'
      )
    )
    
    if (availableQuestions.length === 0) {
      setGameEnded(true)
      return
    }
    
    const randomQuestion = availableQuestions[
      Math.floor(Math.random() * availableQuestions.length)
    ]
    
    setCurrentLetterIndex(letterIndex)
    setCurrentQuestion(randomQuestion)
    setTimeLeft(15)
    setSelectedAnswer(null)
    setFeedback(null)
    setIsAnswered(false)
  }, [gameState.letterStates])
  
  const handleAnswer = useCallback((answerText: string) => {
    if (isAnswered || !currentQuestion) return
    
    const correct = answerText.toLowerCase().trim() === 
      currentQuestion.answer.toLowerCase().trim()
    
    setSelectedAnswer(answerText)
    setFeedback(correct ? "correct" : "wrong")
    setIsAnswered(true)
    
    if (correct && currentLetterIndex !== null) {
      const newStates = { ...gameState.letterStates }
      newStates[currentLetterIndex] = 'correct'
      
      let points = Math.max(0, timeLeft * 10) // Points based on remaining time
      
      // Apply double points if active
      if (doublePointsActive) {
        points = points * 2
        setDoublePointsActive(false) // Deactivate after use
      }
      
      setGameState(prev => ({
        ...prev,
        letterStates: newStates,
        roundScore: prev.roundScore + points,
        totalScore: prev.totalScore + points
      }))
    } else if (currentLetterIndex !== null) {
      const newStates = { ...gameState.letterStates }
      newStates[currentLetterIndex] = 'wrong'
      
      // Apply double penalty if double points was active
      let penalty = 0
      if (doublePointsActive) {
        penalty = -50 // Double penalty for wrong answer
        setDoublePointsActive(false) // Deactivate after use
      }
      
      setGameState(prev => ({
        ...prev,
        letterStates: newStates,
        roundScore: Math.max(0, prev.roundScore + penalty)
      }))
    }
  }, [isAnswered, currentQuestion, gameState.letterStates, currentLetterIndex, timeLeft, doublePointsActive])
  
  const startNewRound = useCallback(() => {
    // Reset for new round
    setGameState(prev => ({
      ...prev,
      round: prev.round + 1,
      roundScore: 0,
      questionsAnswered: 0,
      letterStates: ARABIC_LETTERS.reduce((acc, _, idx) => {
        acc[idx] = 'available'
        return acc
      }, {} as Record<string, 'available' | 'correct' | 'wrong'>)
    }))
    
    // Reset tools for new round
    setUsedTools({
      steal: false,
      double: false,
      switch: false
    })
    setDoublePointsActive(false)
    
    setShowRoundResults(false)
    setCountdownToNextRound(0)
    
    // Pick first letter for new round
    const firstLetter = Math.floor(Math.random() * ARABIC_LETTERS.length)
    selectLetter(firstLetter)
  }, [selectLetter])
  
  const handleRoundComplete = () => {
    setCountdownToNextRound(10)
  }
  
  const handleToolActivate = (toolType: 'steal' | 'double' | 'switch', toolName: string) => {
    setUsedTools(prev => ({
      ...prev,
      [toolType]: true
    }))
    
    if (toolType === 'steal') {
      // Steal: Transfer the question to current team 
      setShowToolMessage(`${toolName}: تم سرقة السؤال! الفريق الحالي يجيب الآن`)
      // The current team's answer will count towards them
    } else if (toolType === 'double') {
      // Double: Activate double points for next question
      setDoublePointsActive(true)
      setShowToolMessage(`${toolName}: تم تفعيل مضاعفة النقاط للسؤال التالي`)
    } else if (toolType === 'switch') {
      // Switch: Transfer question to other team
      setShowToolMessage(`${toolName}: تم نقل السؤال للفريق الآخر`)
      // Skip to next question after a brief delay
      setTimeout(() => {
        const randomIdx = Math.floor(Math.random() * ARABIC_LETTERS.length)
        selectLetter(randomIdx)
      }, 2000)
    }
    
    // Clear message after 3 seconds
    setTimeout(() => setShowToolMessage(null), 3000)
  }
  
  // ==== CONDITIONAL RENDERS (Only after all hooks and logic) ====
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-cyan-300 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-300 text-lg font-bold">... جاري التحميل</p>
        </div>
      </div>
    )
  }
  
  if (allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-950 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-cyan-200 mb-4">لا توجد أسئلة في وضع حروف</h2>
          <p className="text-cyan-300 mb-6">يرجى إضافة بعض أسئلة حروف في لوحة الإدارة</p>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors"
          >
            العودة
          </button>
        </div>
      </div>
    )
  }
  
  if (showRoundResults && !countdownToNextRound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-950 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 mb-8">
            نتائج الجولة {gameState.round} 🎯
          </h2>
          
          {/* Top 3 Scorers */}
          <div className="space-y-3 mb-8">
            {roundTopScorers.map((scorer, idx) => (
              <div
                key={scorer.user_id}
                className="bg-cyan-500/20 border-2 border-cyan-400 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`text-2xl font-black ${
                    idx === 0 ? 'text-cyan-300' : idx === 1 ? 'text-blue-300' : 'text-purple-300'
                  }`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </div>
                  <div>
                    <p className="text-cyan-200 font-bold">{scorer.username}</p>
                    <p className="text-cyan-400 text-sm">{scorer.points} نقطة</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-cyan-500/20 border-2 border-cyan-400 rounded-2xl p-6 mb-8">
            <p className="text-cyan-300 text-sm mb-2">نقاطك في هذه الجولة:</p>
            <p className="text-5xl font-black text-cyan-300">{gameState.roundScore}</p>
            <p className="text-cyan-400 text-sm mt-2">إجمالي النقاط: {gameState.totalScore}</p>
          </div>
          
          <div
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/50 cursor-pointer"
            onClick={handleRoundComplete}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleRoundComplete()
            }}
          >
            الجولة القادمة
          </div>
        </div>
      </div>
    )
  }
  
  if (countdownToNextRound > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-950 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-cyan-300 text-xl mb-4">الجولة القادمة تبدأ خلال...</p>
          <div className="text-8xl font-black text-cyan-400 mb-4">{countdownToNextRound}</div>
          <p className="text-cyan-400">جولة {gameState.round + 1}</p>
        </div>
      </div>
    )
  }
  
  if (gameEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-950 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 mb-4">
            انتهت اللعبة! 🎉
          </h2>
          <div className="bg-cyan-500/20 border-2 border-cyan-400 rounded-2xl p-8 mb-6">
            <p className="text-cyan-200 text-sm mb-2">نقاطك النهائية:</p>
            <p className="text-5xl font-black text-cyan-300">{gameState.totalScore}</p>
            <p className="text-cyan-300/70 text-sm mt-2">
              عدد الجولات: {gameState.round}
            </p>
          </div>
          <div
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/50 cursor-pointer"
            onClick={onExit}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onExit()
            }}
          >
            العودة للقائمة الرئيسية
          </div>
        </div>
      </div>
    )
  }
  
  // Main Game View
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-950 to-black relative overflow-hidden">
      {/* Header */}
      <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
            حروف مع دحومي ⚡
          </h1>
          <p className="text-cyan-300 text-xs sm:text-sm">
            الجولة: {gameState.round} | الأسئلة: {gameState.questionsAnswered}/10
          </p>
        </div>
        <button
          onClick={onExit}
          className="p-2 sm:p-3 rounded-lg bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-400 transition-colors"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onExit()
          }}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
      
      {/* Score Display */}
      <div className="relative z-10 px-4 sm:px-6 mb-4 text-center">
        <p className="text-cyan-300 text-sm sm:text-base">
          نقاط الجولة: <span className="text-cyan-100 font-bold text-lg">{gameState.roundScore}</span> | 
          إجمالي: <span className="text-cyan-100 font-bold text-lg">{gameState.totalScore}</span>
        </p>
      </div>
      
      {/* Letter Grid Section */}
      <div className="relative z-10 px-4 sm:px-6 mb-6">
        <p className="text-cyan-300 text-sm text-center mb-3">اختر حرفاً للإجابة عن سؤال</p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3 max-w-2xl mx-auto">
          {ARABIC_LETTERS.map((letter, idx) => {
            const state = gameState.letterStates[idx] || 'available'
            let bgClass = "bg-white text-black hover:bg-gray-100"
            let shadowClass = "shadow-md"
            
            if (state === 'correct') {
              bgClass = "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/50"
              shadowClass = "shadow-lg shadow-green-500/50"
            } else if (state === 'wrong') {
              bgClass = "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/50"
              shadowClass = "shadow-lg shadow-red-500/50"
            }
            
            return (
              <div
                key={`letter-${idx}`}
                onClick={() => selectLetter(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') selectLetter(idx)
                }}
                className={`p-3 sm:p-4 rounded-lg font-bold text-lg sm:text-2xl cursor-pointer transition-all ${bgClass} ${shadowClass}`}
              >
                {letter}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Question Modal Area */}
      {currentQuestion && (
        <div className="relative z-20 fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-cyan-950 to-cyan-900 border-2 border-cyan-400 rounded-2xl p-4 sm:p-8 max-w-md w-full my-auto shadow-2xl shadow-cyan-500/50">
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => selectLetter(Math.floor(Math.random() * ARABIC_LETTERS.length))}
                className="text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Timer Circle */}
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full border-4 transition-all ${
                  feedback === 'correct'
                    ? 'border-green-400 shadow-lg shadow-green-500/30'
                    : feedback === 'wrong'
                    ? 'border-red-400 shadow-lg shadow-red-500/30'
                    : 'border-cyan-400 shadow-md shadow-cyan-500/20'
                }`}>
                  <div className="absolute inset-4 rounded-full border-2 border-cyan-300/30" />
                </div>
                <div className="text-center">
                  <div className={`text-6xl sm:text-7xl font-black transition-all ${
                    feedback === 'correct'
                      ? 'text-green-300'
                      : feedback === 'wrong'
                      ? 'text-red-300'
                      : 'text-cyan-300'
                  }`}>
                    {timeLeft}
                  </div>
                  <p className="text-cyan-400 text-xs mt-1">ثانية</p>
                </div>
              </div>
            </div>
            
            {/* Question Card */}
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-cyan-100 text-center leading-relaxed">
                {currentQuestion.text}
              </h3>
            </div>
            
            {/* Answer Options */}
            {currentQuestion.choices && currentQuestion.choices.length > 0 ? (
              <div className="space-y-3 mb-6">
                {currentQuestion.choices.map((choice, idx) => (
                  <div
                    key={`choice-${idx}`}
                    onClick={() => handleAnswer(choice)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleAnswer(choice)
                    }}
                    className={`p-3 sm:p-4 rounded-lg font-bold text-center cursor-pointer transition-all ${
                      selectedAnswer === choice
                        ? feedback === 'correct'
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-cyan-500/30 text-cyan-100 border-2 border-cyan-400 hover:bg-cyan-500/50'
                    }`}
                  >
                    {choice}
                  </div>
                ))}
              </div>
            ) : (
              <input
                type="text"
                placeholder="اكتب الإجابة..."
                value={selectedAnswer || ""}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isAnswered) handleAnswer(selectedAnswer || "")
                }}
                disabled={isAnswered}
                className="w-full px-4 py-3 text-center text-lg font-bold rounded-lg bg-cyan-500/20 border-2 border-cyan-400 text-cyan-100 placeholder-cyan-400/50 focus:outline-none focus:border-cyan-300 mb-6"
              />
            )}
            
            {/* Feedback */}
            {feedback === "correct" && (
              <div className="text-center text-3xl animate-bounce text-green-400 mb-2">✅ صحيح!</div>
            )}
            {feedback === "wrong" && (
              <div className="text-center text-3xl animate-bounce text-red-400 mb-2">❌ خطأ!</div>
            )}
          </div>
        </div>
      )}
      
      {/* Game Assistance Tools */}
      <GameAssistanceTools
        isQuestionRevealed={currentQuestion !== null && isAnswered === false}
        onToolActivate={handleToolActivate}
        usedTools={usedTools}
        toastMessage={showToolMessage || undefined}
        onToastClose={() => setShowToolMessage(null)}
      />
    </div>
  )
}

"use client"

import { useEffect, useState, Suspense, useMemo } from "react"
import { Trophy, RotateCcw, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "@/components/theme-provider"

interface VictoryTeam {
  name: string
  score: number
}

function VictoryContent() {
  const { theme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const teams = useMemo(() => {
    const param = searchParams.get('teams')
    if (!param) return []
    try {
      return JSON.parse(param) as VictoryTeam[]
    } catch {
      return []
    }
  }, [searchParams])

  const winner = useMemo(() => {
    if (!teams.length) return searchParams.get('winner') || 'الفريق الأول'
    const maxScore = Math.max(...teams.map(t => t.score))
    return teams.filter(t => t.score === maxScore).map(t => t.name).join(' و ')
  }, [teams, searchParams])

  const [particles, setParticles] = useState<Array<{left: number; top: number; delay: number; duration: number; color: string; rotate: number; id: number; clicked: boolean;}>>([])

  useEffect(() => {
    const colors = theme === 'dahoomy-999' 
      ? ['#06b6d4', '#ef4444', '#22d3ee', '#f87171'] 
      : ['#FFD700', '#C0C0C0', '#FFA500', '#FFFF00']
    
    setParticles(Array.from({ length: 40 }, (_, idx) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: Math.random() * 360,
      id: idx,
      clicked: false
    })))
  }, [theme])

  const handleParticleClick = (id: number) => {
    setParticles(prev => prev.map(p => {
      if (p.id !== id) return p
      const colors = theme === 'dahoomy-999' 
        ? ['#06b6d4', '#ef4444', '#22d3ee', '#f87171'] 
        : ['#FFD700', '#C0C0C0', '#FFA500', '#FFFF00']
      return { 
        ...p, 
        clicked: !p.clicked, 
        color: p.clicked ? colors[Math.floor(Math.random() * colors.length)] : '#FF6B6B' 
      }
    }))
  }

  const handleParticleHover = (id: number) => {
    setParticles(prev => prev.map(p => 
      p.id === id ? { ...p, rotate: p.rotate + 45 } : p
    ))
  }

  const handleNewGame = () => {
    router.push('/')
  }

  const handleExit = () => {
    router.push('/')
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center animated-bg animate-fade-in relative overflow-hidden"
      style={{
        background: theme === 'dahoomy-999'
          ? `radial-gradient(circle at 25% 20%, rgba(6,182,212,0.12), transparent 45%),
             radial-gradient(circle at 75% 30%, rgba(239,68,68,0.08), transparent 55%),
             linear-gradient(135deg, #030308, #111111)`
          : `radial-gradient(circle at 25% 20%, rgba(255,215,0,0.12), transparent 45%),
             radial-gradient(circle at 75% 30%, rgba(255,255,255,0.06), transparent 55%),
             linear-gradient(135deg, #050508, #0f0e14)`
      }}
    >
      {/* Particles */}
      <div className="absolute inset-0">
        {particles.map((p, idx) => (
          <div
            key={p.id}
            className="absolute w-4 h-4 opacity-80 cursor-pointer transition-all duration-300 hover:scale-150 hover:opacity-100"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              backgroundColor: p.color,
              borderRadius: '50%',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              transform: `rotate(${p.rotate}deg) scale(${p.clicked ? 1.5 : 1})`,
              boxShadow: p.clicked ? '0 0 20px rgba(255, 107, 107, 0.8)' : 'none'
            }}
            onClick={() => handleParticleClick(p.id)}
            onMouseEnter={() => handleParticleHover(p.id)}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Dahoomy Logo with Glitch for Victory */}
        {theme === 'dahoomy-999' && (
          <div className="mb-8 relative h-32 w-32 mx-auto">
            <img 
              src="/images/dahoomy-999.png" 
              alt="Dahoomy 999" 
              className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.8)] animate-neon-glitch"
            />
          </div>
        )}
        
        {/* Trophy */}
        <div className="mb-8">
          <div className={`inline-block p-8 rounded-full shadow-2xl animate-pulse ${
            theme === 'dahoomy-999' 
              ? 'bg-gradient-to-br from-cyan-500 to-red-500' 
              : 'bg-gradient-to-br from-blue-400 to-blue-600'
          }`}>
            <Trophy className="w-32 h-32 text-white drop-shadow-2xl" />
          </div>
        </div>

        {/* Winner Text */}
        <h1 className={`text-6xl font-black mb-4 animate-pulse dahoomy-font ${
          theme === 'dahoomy-999'
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-red-400'
            : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600'
        }`}>
          {winner} فاز!
        </h1>

        {/* Scores */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {teams.length ? (
            (() => {
              const maxScore = Math.max(...teams.map(t => t.score))
              return teams.map((team, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl glass-card theme-border ${team.score === maxScore ? (theme === 'dahoomy-999' ? 'ring-4 ring-cyan-500' : 'ring-4 ring-blue-400') : ''}`}
                  style={team.score === maxScore ? {
                    boxShadow: theme === 'dahoomy-999' ? '0 0 30px rgba(6,182,212,0.5)' : '0 0 30px rgba(59,130,246,0.5)'
                  } : undefined}
                >
                  <div className="text-xl font-bold theme-text mb-2">{team.name}</div>
                  <div className="text-4xl font-black theme-text">{team.score}</div>
                </div>
              ))
            })()
          ) : (
            <div className="theme-text-secondary">لا توجد بيانات للفرق.</div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-6">
          <Button 
            onClick={handleNewGame}
            className="px-8 py-4 text-xl font-bold theme-bg text-black hover:theme-bg-secondary transition-all"
          >
            <RotateCcw className="w-6 h-6 ml-2" />
            إنشاء لعبة جديدة
          </Button>
          <Button 
            onClick={handleExit}
            variant="outline"
            className="px-8 py-4 text-xl font-bold theme-border theme-text hover:theme-bg-muted"
          >
            <LogOut className="w-6 h-6 ml-2" />
            خروج
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function VictoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VictoryContent />
    </Suspense>
  )
}
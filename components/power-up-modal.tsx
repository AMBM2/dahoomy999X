"use client"

import { useEffect, useRef, useState, type ComponentType } from "react"
import { Trash2, Sparkles, Shuffle, ArrowLeftRight, Shield } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

interface PowerUpModalProps {
  powerUp: string | null
  onClose: () => void
  team: string
}

const powerUpConfig: Record<string, { name: string; icon: ComponentType<any>; color: string; description: string; sound?: string }> = {
  "earthquake": {
    name: "إعصار",
    icon: Shuffle,
    color: "from-indigo-500 to-violet-600",
    description: "أعد ترتيب خانات اللعبة بشكل عشوائي.",
    sound: "/sounds/earthquake.mp3"
  },
  "steal-turn": {
    name: "سرقة جولة",
    icon: ArrowLeftRight,
    color: "from-purple-500 to-pink-500",
    description: "اجعل الخصم يجاوب بدلاً منك.",
    sound: "/sounds/steal-turn.mp3"
  },
  "gold-question": {
    name: "السؤال الذهبي",
    icon: Sparkles,
    color: "from-cyan-400 to-blue-600",
    description: "حول قيمة السؤال إلى 500 نقطة!",
    sound: "/sounds/gold-question.mp3"
  },
  "shield": {
    name: "درع",
    icon: Shield,
    color: "from-green-500 to-emerald-600",
    description: "احصل على نقطة إضافية في المرة القادمة.",
    sound: "/sounds/shield.mp3"
  },
  "delete-answers": {
    name: "حذف إجابتين",
    icon: Trash2,
    color: "from-teal-500 to-cyan-600",
    description: "احذف خيارين خاطئين من السؤال.",
    sound: "/sounds/delete-answers.mp3"
  }
}

export default function PowerUpModal({ powerUp, onClose, team }: PowerUpModalProps) {
  const { theme } = useTheme()
  const [isExiting, setIsExiting] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [particles, setParticles] = useState<Array<{left: number; top: number; delay: number; duration: number;}>>([])
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (!powerUp) return

    setIsExiting(false)

    setParticles(Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2
    })))

    const colorMap = theme === 'dahoomy-999' 
      ? { "gold-question": "from-cyan-400 to-red-500" }
      : { "gold-question": "from-cyan-400 to-blue-600" }
    
    let config = powerUpConfig[powerUp]
    if (config && powerUp === 'gold-question') {
      config = { ...config, color: colorMap[powerUp] || config.color }
    }
    
    config = config ?? {
      name: powerUp,
      icon: Shield,
      color: theme === 'dahoomy-999' ? "from-cyan-500 to-blue-600" : "from-cyan-500 to-blue-600",
      description: "",
    }

    // Use Speech Synthesis to speak the power-up name
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(config.name)
      utterance.lang = 'ar-SA'
      utterance.rate = 0.9
      utterance.pitch = 1.2
      utterance.volume = 1
      synthRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }

    // Also play a beep sound effect using Audio API
    playBeepSound()

    // Auto close after animation
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 500)
    }, 2500)

    return () => {
      clearTimeout(timer)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [powerUp, onClose])

  const playBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      
      // Play dramatic sound sequence for "القم يا هطف"
      const playNote = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.type = type
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + startTime)
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime + startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration)
        
        oscillator.start(audioContext.currentTime + startTime)
        oscillator.stop(audioContext.currentTime + startTime + duration)
      }
      
      // Dramatic fanfare sequence
      playNote(523, 0, 0.15, 'square')      // C5
      playNote(659, 0.15, 0.15, 'square')   // E5
      playNote(784, 0.3, 0.15, 'square')    // G5
      playNote(1047, 0.45, 0.4, 'sawtooth') // C6 - climax
      playNote(880, 0.85, 0.3, 'sine')      // A5 - resolve
      
    } catch {
      // Audio not supported
    }
  }

  if (!powerUp) return null

  const config = powerUpConfig[powerUp] ?? {
    name: powerUp,
    icon: Shield,
    color: "from-cyan-500 to-blue-600",
    description: "",
  }
  const IconComponent = config.icon
  const isDahoomy = theme === 'dahoomy-999'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div 
        className={`
          relative flex flex-col items-center gap-6 p-12 rounded-3xl
          bg-gradient-to-br ${config.color}
          ${isExiting ? 'animate-power-up-exit' : 'animate-power-up'}
          shadow-2xl
        `}
        style={{
          boxShadow: isDahoomy ? `0 0 100px 20px rgba(0,255,255,0.3)` : `0 0 100px 20px rgba(34,211,238,0.35)`
        }}
      >
        {/* Glowing border */}
        <div className={`absolute inset-0 rounded-3xl border-4 border-cyan-400/60 animate-pulse`} />
        
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-white/30 rounded-full" />
          <IconComponent className="relative w-32 h-32 text-white drop-shadow-2xl" />
        </div>
        
        {/* Power-up name */}
        <h2 className={`text-5xl font-black text-white ${isDahoomy ? 'neon-dahoomy' : 'neon-gold'} text-center`}>
          {config.name}
        </h2>
        
        {/* Description */}
        <p className="text-2xl text-white/90 text-center max-w-md">
          {config.description}
        </p>
        
        {/* Team indicator */}
        <div className="mt-4 px-6 py-2 rounded-full bg-black/30 text-white font-bold">
          {team}
        </div>
        
        {/* Particles effect */}
        {hasMounted && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            {particles.map((p, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-float opacity-60"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

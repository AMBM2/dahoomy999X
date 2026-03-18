'use client'

import { useState, useEffect } from "react"
import { Zap, Copy, Repeat2 } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

interface GameAssistanceToolsProps {
  isQuestionRevealed: boolean
  onToolActivate: (toolType: 'steal' | 'double' | 'switch', toolName: string) => void
  usedTools: {
    steal: boolean
    double: boolean
    switch: boolean
  }
  toastMessage?: string
  onToastClose?: () => void
}

export default function GameAssistanceTools({
  isQuestionRevealed,
  onToolActivate,
  usedTools,
  toastMessage,
  onToastClose
}: GameAssistanceToolsProps) {
  const { theme } = useTheme()
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [particles, setParticles] = useState<Array<{left: number; top: number; delay: number; duration: number;}>>([])

  // Generate particles for activation animation
  const generateParticles = () => {
    setParticles(Array.from({ length: 15 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 1
    })))
  }

  const handleToolClick = (toolType: 'steal' | 'double' | 'switch', toolName: string) => {
    // Validation logic
    if (toolType === 'double') {
      if (isQuestionRevealed) {
        setErrorMessage('يجب استخدامه قبل فتح السؤال')
        setTimeout(() => setErrorMessage(null), 2500)
        return
      }
    } else if (toolType === 'steal' || toolType === 'switch') {
      if (!isQuestionRevealed) {
        setErrorMessage('يجب فتح السؤال أولاً')
        setTimeout(() => setErrorMessage(null), 2500)
        return
      }
    }

    // Check if tool already used
    if (usedTools[toolType]) {
      setErrorMessage('تم استخدام هذه الوسيلة مسبقاً ❌')
      setTimeout(() => setErrorMessage(null), 2500)
      return
    }

    setSelectedTool(toolType)
    setShowConfirmation(true)
  }

  const confirmToolUsage = () => {
    if (selectedTool) {
      generateParticles()
      const toolNames: Record<string, string> = {
        steal: 'سرقة السؤال',
        double: 'دبل',
        switch: 'أشكل'
      }
      onToolActivate(selectedTool as 'steal' | 'double' | 'switch', toolNames[selectedTool])
      setShowConfirmation(false)
      setSelectedTool(null)
      
      // Close error message after use
      if (onToastClose) {
        setTimeout(onToastClose, 500)
      }
    }
  }

  const getToolInfo = (toolType: string) => {
    const toolsInfo: Record<string, { icon: any; label: string; ar_label: string; description: string; color: string }> = {
      steal: {
        icon: Copy,
        label: 'Steal',
        ar_label: 'سرقة السؤال',
        description: 'يسرق الفريق الحالي السؤال',
        color: 'from-red-500 to-orange-500'
      },
      double: {
        icon: Repeat2,
        label: 'Double',
        ar_label: 'دبل',
        description: 'مضاعفة النقاط في السؤال التالي',
        color: 'from-cyan-400 to-blue-600'
      },
      switch: {
        icon: Zap,
        label: 'Switch',
        ar_label: 'أشكل',
        description: 'نقل السؤال للفريق الآخر',
        color: 'from-purple-500 to-pink-500'
      }
    }
    return toolsInfo[toolType]
  }

  return (
    <div className="relative z-30">
      {/* Particles Animation */}
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none">
          {particles.map((particle, idx) => (
            <div
              key={idx}
              className="absolute w-2 h-2 rounded-full animate-pulse"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                background: theme === 'dahoomy-999' ? 'rgba(34, 211, 238, 0.8)' : 'rgba(59, 130, 246, 0.8)',
                animation: `float-up ${particle.duration}s ease-out ${particle.delay}s forwards`,
                opacity: 0.7
              }}
            />
          ))}
        </div>
      )}

      {/* Tools Row */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex gap-2 sm:gap-3 backdrop-blur-sm bg-black/60 border border-cyan-400/60 rounded-full p-3 sm:p-4 shadow-lg shadow-cyan-500/40">
          {['steal', 'double', 'switch'].map((toolType) => {
            const info = getToolInfo(toolType)
            const isUsed = usedTools[toolType as 'steal' | 'double' | 'switch']
            const Icon = info.icon

            return (
              <div key={toolType} className="relative group">
                <button
                  onClick={() => handleToolClick(toolType as 'steal' | 'double' | 'switch', info.ar_label)}
                  disabled={isUsed}
                  className={`p-2.5 sm:p-3 rounded-full transition-all transform hover:scale-115 active:scale-95 ${
                    isUsed
                      ? 'bg-gray-600/30 text-gray-400 cursor-not-allowed opacity-40'
                      : `bg-gradient-to-r ${info.color} text-white hover:shadow-xl shadow-lg cursor-pointer`
                  }`}
                  title={info.ar_label}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-black/95 text-cyan-200 text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-cyan-400/60 shadow-lg">
                  <div className="font-bold">{info.ar_label}</div>
                  <div className="text-xs text-cyan-300">{info.description}</div>
                  {isUsed && <div className="text-red-400 text-xs mt-1">✓ مستخدمة</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Error Toast Message */}
      {errorMessage && (
        <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
          <div className="bg-red-500/95 text-white px-5 py-3 rounded-xl border border-red-400/80 shadow-lg shadow-red-500/60 font-bold text-center text-sm sm:text-base">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && selectedTool && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-cyan-950/95 to-black border-2 border-cyan-400/70 rounded-2xl p-6 sm:p-8 max-w-sm shadow-2xl shadow-cyan-500/60 text-center animate-in fade-in scale-in">
            <h3 className="text-2xl font-black text-cyan-200 mb-4">
              هل تريد استخدام {getToolInfo(selectedTool).ar_label}؟
            </h3>
            <p className="text-cyan-300/90 mb-6 text-sm sm:text-base">
              {getToolInfo(selectedTool).description}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-3 bg-gray-600/50 hover:bg-gray-700/60 text-white font-bold rounded-lg transition-all duration-200"
              >
                إلغاء
              </button>
              <button
                onClick={confirmToolUsage}
                className={`flex-1 px-4 py-3 bg-gradient-to-r ${getToolInfo(selectedTool).color} hover:opacity-90 text-white font-bold rounded-lg transition-all transform hover:scale-105`}
              >
                استخدم الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles for animations */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

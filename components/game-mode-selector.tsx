"use client"

import { Gamepad2, Zap } from "lucide-react"
import { useGameMode, type GameMode } from "@/contexts/game-mode-context"

export function GameModeSelector() {
  const { gameMode, setGameMode } = useGameMode()

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-center text-xl sm:text-2xl font-bold mb-8 text-cyan-300">
        اختر طريقة اللعب
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Seen Geem Card */}
        <div
          onClick={() => setGameMode("seen-geem")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setGameMode("seen-geem")
          }}
          className={`relative p-8 rounded-2xl backdrop-blur transition-all duration-300 cursor-pointer ${
            gameMode === "seen-geem"
              ? "bg-gradient-to-br from-cyan-500/40 to-cyan-600/20 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30"
              : "bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-2 border-cyan-500/30 hover:border-cyan-400/50 shadow-md shadow-cyan-500/20"
          }`}
        >
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/20 border-2 border-cyan-400">
            <Gamepad2 className="w-8 h-8 text-cyan-300" />
          </div>
          <h3 className="text-lg font-bold text-cyan-200 text-center mb-2">
            سين جيم مع دحومي
          </h3>
          <p className="text-sm text-cyan-300/70 text-center">
            اختر التصنيفات وأجب عن الأسئلة بحرية
          </p>

          {gameMode === "seen-geem" && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          )}
        </div>

        {/* Hrof Card - Disabled */}
        <div
          className={`relative p-8 rounded-2xl backdrop-blur transition-all duration-300 opacity-60 cursor-not-allowed bg-gradient-to-br from-cyan-500/5 to-blue-600/5 border-2 border-cyan-500/20`}
        >
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gray-600/20 border-2 border-gray-500/40">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-400 text-center mb-2">
            حروف مع دحومي
          </h3>
          <p className="text-sm text-gray-400/70 text-center mb-3">
            أجب على أسئلة البطاقات الحرفية بسرعة ⚡
          </p>
          <div className="inline-flex w-full justify-center">
            <span className="px-3 py-1 bg-red-500/30 text-red-300 text-xs font-bold rounded-full border border-red-500/50">
              غير متوفر الآن
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-cyan-300/50 mt-6">
        يمكنك تغيير طريقة اللعب في أي وقت من الإعدادات
      </p>
    </div>
  )
}

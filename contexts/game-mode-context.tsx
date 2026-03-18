"use client"

import React, { createContext, useContext, useState } from "react"

export type GameMode = "seen-geem" | "hrof"

interface GameModeContextType {
  gameMode: GameMode
  setGameMode: (mode: GameMode) => void
}

const GameModeContext = createContext<GameModeContextType | undefined>(undefined)

export function GameModeProvider({ children }: { children: React.ReactNode }) {
  const [gameMode, setGameMode] = useState<GameMode>("seen-geem")

  return (
    <GameModeContext.Provider value={{ gameMode, setGameMode }}>
      {children}
    </GameModeContext.Provider>
  )
}

export function useGameMode() {
  const context = useContext(GameModeContext)
  if (!context) {
    throw new Error("useGameMode must be used within GameModeProvider")
  }
  return context
}

// =====================================================
// Schema Constants and Runtime Values
// =====================================================

/**
 * Neon Color Palette (2026 Gaming Style)
 */
export const NEON_PALETTE = {
  cyan: '#00D9FF',
  magenta: '#FF00FF',
  purple: '#9D00FF',
  blue: '#0080FF',
  pink: '#FF0080',
  green: '#00FF00',
  orange: '#FF8C00',
  red: '#FF0000',
  yellow: '#FFFF00',
  lime: '#00FF00',
} as const

export const CATEGORY_COLORS: Record<string, { primary: string; secondary: string }> = {
  science: { primary: NEON_PALETTE.cyan, secondary: NEON_PALETTE.blue },
  math: { primary: NEON_PALETTE.purple, secondary: NEON_PALETTE.magenta },
  geography: { primary: NEON_PALETTE.green, secondary: NEON_PALETTE.cyan },
  sports: { primary: NEON_PALETTE.magenta, secondary: NEON_PALETTE.red },
  entertainment: { primary: NEON_PALETTE.pink, secondary: NEON_PALETTE.magenta },
  religion: { primary: NEON_PALETTE.blue, secondary: NEON_PALETTE.cyan },
  history: { primary: NEON_PALETTE.orange, secondary: NEON_PALETTE.yellow },
  tech: { primary: NEON_PALETTE.cyan, secondary: NEON_PALETTE.purple },
  art: { primary: NEON_PALETTE.magenta, secondary: NEON_PALETTE.pink },
  language: { primary: NEON_PALETTE.green, secondary: NEON_PALETTE.lime },
}

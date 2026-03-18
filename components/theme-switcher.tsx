'use client'

import { Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'gold' ? 'space-blue' : theme === 'space-blue' ? 'dahoomy-999' : 'gold')
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className="border-theme-border text-theme-text hover:bg-theme-card"
    >
      <Palette className="w-4 h-4 ml-2" />
      {theme === 'gold' ? 'ثيم فضائي أزرق' : theme === 'space-blue' ? 'ثيم دحومي 999' : 'ثيم ذهبي'}
    </Button>
  )
}
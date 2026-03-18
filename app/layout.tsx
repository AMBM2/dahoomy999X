import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import HydrationCleaner from '@/components/hydration-cleaner'
import DahoomyWatermark from '@/components/dahoomy-watermark'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { ToastProvider } from '@/components/toast-provider'
import { CategoryProvider } from '@/contexts/category-context'
import { GameModeProvider } from '@/contexts/game-mode-context'
import './globals.css'

const cairo = Cairo({ 
  subsets: ["arabic", "latin"],
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: 'قائمة التحدي v2.0 | دحومي 999',
  description: 'لعبة أسئلة وتحديات عربية ممتعة - أكثر من 250 تصنيف وآلاف الأسئلة',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased`} suppressHydrationWarning>
        <ToastProvider />
        <AuthProvider>
          <CategoryProvider>
            <GameModeProvider>
              <ThemeProvider>
                <DahoomyWatermark />
                {children}
              </ThemeProvider>
            </GameModeProvider>
          </CategoryProvider>
        </AuthProvider>
        <HydrationCleaner />
        <Analytics />
        <footer className="text-center py-4 text-sm">
          <p className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 bg-clip-text text-transparent font-bold drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] shadow-lg shadow-cyan-500/50 animate-pulse">
            © 2026 رواق. جميع الحقوق محفوظة.
          </p>
        </footer>
      </body>
    </html>
  )
}

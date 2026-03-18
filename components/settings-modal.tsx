"use client"

import { Settings, Palette } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./theme-provider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const DISCORD_INVITE = "https://guns.lol/riwaq"

interface SettingsModalProps {
  children?: React.ReactNode
}

const ADMIN_ID = "897450827353063505"
const SECONDARY_ADMIN_ID = "1186739142231605248"
const PRIMARY_ADMIN_IDS = [ADMIN_ID, SECONDARY_ADMIN_ID] // Both are now primary admins

export function SettingsModal({ children }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const isDahoomy = theme === "dahoomy-999"
  const isAdmin = session?.user?.id && PRIMARY_ADMIN_IDS.includes(session.user.id)

  const themes = [
    { id: "gold", name: "ثيم ذهبي", description: "الثيم الكلاسيكي الذهبي الأنيق" },
    { id: "space-blue", name: "ثيم فضائي أزرق", description: "ثيم فضائي أزرق عصري" },
    { id: "dahoomy-999", name: "ثيم دحومي 999", description: "ثيم خاص لمشجعي أسطورة دحومي 999. ألوان النيون الأزرق والأحمر" },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            className={`${isDahoomy ? 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/10' : 'border-theme-border text-theme-text hover:bg-theme-card'}`}
          >
            <Settings className="w-4 h-4 ml-2" />
            الإعدادات
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={`sm:max-w-md border ${
        isDahoomy ? "bg-[#0a0e12] border-cyan-500/40" : "bg-theme-card border-theme-border"
      }`}>
        <DialogHeader>
          <DialogTitle className={`text-right ${isDahoomy ? "text-cyan-200" : "text-theme-text"}`}>
            إعدادات التطبيق
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className={`text-lg font-semibold mb-4 text-right flex items-center gap-2 ${
              isDahoomy ? "text-cyan-300" : "text-theme-text"
            }`}>
              <Palette className="w-5 h-5" />
              اختيار الثيم
            </h3>
            <div className="space-y-3">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id as Parameters<typeof setTheme>[0])}
                  className={`w-full p-4 rounded-lg border transition-all duration-300 text-right will-change-transform ${
                    theme === themeOption.id
                      ? isDahoomy
                        ? "border-cyan-500 bg-cyan-500/15 text-cyan-200"
                        : "border-theme-primary bg-theme-primary/10 text-theme-text"
                      : isDahoomy
                        ? "border-cyan-500/30 bg-cyan-500/5 text-cyan-300/90 hover:border-cyan-500/50"
                        : "border-theme-border bg-theme-card text-theme-text hover:border-theme-primary/50"
                  }`}
                  style={{ transform: "translateZ(0)" }}
                >
                  <div className="font-semibold">{themeOption.name}</div>
                  <div className={`text-sm mt-1 ${isDahoomy ? "text-cyan-400/70" : "text-theme-text-secondary"}`}>
                    {themeOption.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Host Management - Admin Only */}
          {isAdmin && (
            <div className="border-t pt-4 mt-4">
              <h3 className={`text-lg font-semibold mb-3 text-right flex items-center gap-2 ${
                isDahoomy ? "text-cyan-300" : "text-theme-text"
              }`}>
                <Settings className="w-5 h-5" />
                إدارة المضيف
              </h3>
              <button
                className={`w-full p-4 rounded-lg border transition-all duration-300 text-right ${
                  isDahoomy
                    ? "border-purple-500/50 bg-purple-500/10 text-purple-300 hover:bg-purple-500/15 hover:border-purple-500/70"
                    : "border-purple-500/40 bg-purple-500/10 text-purple-400 hover:bg-purple-500/15"
                }`}
              >
                <div className="font-semibold">لوحة التحكم الكاملة</div>
                <div className={`text-sm mt-1 ${isDahoomy ? "text-purple-400/70" : "text-purple-400/80"}`}>
                  الوصول الكامل لجميع إعدادات النظام والصلاحيات
                </div>
              </button>
            </div>
          )}

          {/* Join Discord - Neon blur */}
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <div
              className={`
                relative overflow-hidden rounded-xl p-4 text-center font-bold transition-all duration-300
                hover:scale-[1.02] active:scale-[0.98]
                ${isDahoomy
                  ? "bg-[#5865F2]/20 border border-[#5865F2]/50 shadow-[0_0_20px_rgba(88,101,242,0.3)] hover:shadow-[0_0_30px_rgba(88,101,242,0.4)]"
                  : "bg-[#5865F2]/15 border border-[#5865F2]/40 shadow-[0_0_15px_rgba(88,101,242,0.2)] hover:shadow-[0_0_25px_rgba(88,101,242,0.3)]"
                }
              `}
              style={{ transform: "translateZ(0)", backdropFilter: "blur(8px)" }}
            >
              <span className="relative z-10 text-white drop-shadow-md">Join Discord</span>
              <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-[#5865F2] to-transparent" style={{ filter: "blur(20px)" }} />
            </div>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
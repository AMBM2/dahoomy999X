"use client"

import { ShieldAlert, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UnauthorizedOverlay(props: {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
}) {
  const { isOpen, onClose, title, description } = props
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 dir-rtl" dir="rtl">
      <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-slate-950/95 shadow-2xl">
        <div className="p-4 flex items-center justify-between border-b border-cyan-500/20">
          <div className="flex items-center gap-2 text-cyan-200 font-black">
            <ShieldAlert className="w-5 h-5 text-cyan-300" />
            {title || "غير مصرح لك بالدخول"}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-cyan-500/10">
            <X className="w-5 h-5 text-cyan-300" />
          </button>
        </div>
        <div className="p-5 text-sm text-cyan-200/80 leading-relaxed">
          {description || "ليس لديك صلاحية لفتح هذه الصفحة."}
        </div>
        <div className="p-4 pt-0">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  )
}


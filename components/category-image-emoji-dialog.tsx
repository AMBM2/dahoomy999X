"use client"

import { useState } from "react"
import { X, Upload, Smile, Grid3x3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface CategoryImageEmojiDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: "image" | "emoji", value: string) => void
}

// Popular emojis for quick selection
const POPULAR_EMOJIS = [
  "🎮", "⚽", "🏀", "🎬", "🎵", "📚", "🔬", "🌍",
  "🏆", "💡", "🎨", "📖", "🌟", "✨", "🎯", "🎪",
  "🍕", "🎂", "🍔", "🌮", "🍜", "☕", "🍷", "🍱",
  "👑", "🎭", "🎬", "🎤", "🎸", "🎹", "🥁", "🎺",
  "🚀", "🛸", "🚁", "✈️", "🚂", "🚢", "🚗", "🏎️",
]

export default function CategoryImageEmojiDialog({
  isOpen,
  onClose,
  onSelect,
}: CategoryImageEmojiDialogProps) {
  const [activeTab, setActiveTab] = useState<"image" | "emoji">("emoji")
  const [imageUrl, setImageUrl] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState(POPULAR_EMOJIS[0])

  const handleSelectEmoji = (emoji: string) => {
    setSelectedEmoji(emoji)
  }

  const handleImageUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value)
  }

  const handleConfirm = () => {
    if (activeTab === "emoji") {
      onSelect("emoji", selectedEmoji)
    } else {
      if (!imageUrl.trim()) {
        alert("الرجاء إدخال رابط صورة صحيح")
        return
      }
      onSelect("image", imageUrl)
    }
    setImageUrl("")
    setSelectedEmoji(POPULAR_EMOJIS[0])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-b from-slate-950 to-slate-900 border border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-300">اختر صورة أو إيموجي للتصنيف</DialogTitle>
          <DialogDescription className="text-slate-400">
            اختر طريقة لتمثيل التصنيف
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("emoji")}
            className={`flex-1 py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "emoji"
                ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400"
                : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-600/50"
            }`}
          >
            <Smile className="w-5 h-5" />
            إيموجي
          </button>
          <button
            onClick={() => setActiveTab("image")}
            className={`flex-1 py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "image"
                ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400"
                : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-600/50"
            }`}
          >
            <Upload className="w-5 h-5" />
            صورة
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          {activeTab === "emoji" ? (
            <div>
              <Label className="text-cyan-300 mb-3 block">حدد إيموجي من الخيارات أدناه</Label>
              <div className="grid grid-cols-6 gap-2 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                {POPULAR_EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectEmoji(emoji)}
                    className={`text-3xl p-2 rounded-lg transition-all ${
                      selectedEmoji === emoji
                        ? "bg-cyan-500/30 border border-cyan-400 scale-110"
                        : "bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-sm mb-2">الإيموجي المختار:</p>
                <div className="text-5xl text-center">{selectedEmoji}</div>
              </div>
            </div>
          ) : (
            <div>
              <Label className="text-cyan-300 mb-3 block">أدخل رابط الصورة</Label>
              <Input
                type="url"
                placeholder="https://example.com/image.png"
                value={imageUrl}
                onChange={handleImageUrl}
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-500"
                dir="ltr"
              />
              {imageUrl && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">معاينة الصورة:</p>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-24 object-cover rounded"
                    onError={() => alert("فشل تحميل الصورة")}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600 font-bold"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold"
          >
            تأكيد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { X, Image as ImageIcon, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface CategoryImageEmojiSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: "image" | "emoji", value: string) => void
}

const EMOJI_LIST = [
  "📚", "🎓", "🏆", "⚽", "🏀", "🎮", "🎬", "🎵", "🎨", "🍕",
  "🍔", "🍿", "🌍", "🌟", "💡", "🔥", "🎯", "🎪", "🎭", "🎬",
  "🚀", "🛸", "✈️", "🚗", "🏍️", "⛵", "🚁", "🏰", "🏛️", "🗿",
  "👑", "💎", "⚡", "🌈", "❄️", "🌸", "🌺", "🦁", "🐯", "🦅",
  "🐙", "🦑", "🐢", "🦋", "🐝", "🐞", "🦗", "🕷️", "🦂", "🐢"
]

export default function CategoryImageEmojiSelector({
  isOpen,
  onClose,
  onSelect,
}: CategoryImageEmojiSelectorProps) {
  const [selectedTab, setSelectedTab] = useState<"emoji" | "image">("emoji")
  const [imageUrl, setImageUrl] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_LIST[0])

  const handleSelectEmoji = () => {
    if (!selectedEmoji) {
      alert("يجب اختيار أيقونة")
      return
    }
    onSelect("emoji", selectedEmoji)
    setSelectedEmoji(EMOJI_LIST[0])
    handleClose()
  }

  const handleSelectImage = () => {
    if (!imageUrl?.trim()) {
      alert("الرجاء إدخال رابط الصورة")
      return
    }
    onSelect("image", imageUrl.trim())
    setImageUrl("")
    handleClose()
  }

  const handleClose = () => {
    setImageUrl("")
    setSelectedEmoji(EMOJI_LIST[0])
    setSelectedTab("emoji")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-300">اختر صورة أو أيقونة للتصنيف</DialogTitle>
          <DialogDescription className="text-cyan-200/70">
            حدد أيقونة من الخيارات أو أضف رابط صورة
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedTab("emoji")}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
              selectedTab === "emoji"
                ? "bg-cyan-500 text-white"
                : "bg-slate-800 text-cyan-300 hover:bg-slate-700"
            }`}
          >
            <Smile className="w-5 h-5 inline mr-2" />
            أيقونة
          </button>
          <button
            onClick={() => setSelectedTab("image")}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
              selectedTab === "image"
                ? "bg-cyan-500 text-white"
                : "bg-slate-800 text-cyan-300 hover:bg-slate-700"
            }`}
          >
            <ImageIcon className="w-5 h-5 inline mr-2" />
            صورة
          </button>
        </div>

        {/* Emoji Selection */}
        {selectedTab === "emoji" && (
          <div>
            <div className="mb-4">
              <Label className="text-cyan-300 mb-2 block">الأيقونة المختارة</Label>
              <div className="flex items-center gap-2 p-4 bg-slate-800 rounded-lg border border-cyan-500/20">
                <div className="text-6xl">{selectedEmoji}</div>
              </div>
            </div>

            <Label className="text-cyan-300 mb-2 block">اختر أيقونة</Label>
            <div className="grid grid-cols-8 gap-2 p-3 bg-slate-800 rounded-lg border border-cyan-500/20 max-h-64 overflow-y-auto">
              {EMOJI_LIST.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-3xl p-2 rounded-lg transition-all ${
                    selectedEmoji === emoji
                      ? "bg-cyan-500 scale-110"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Selection */}
        {selectedTab === "image" && (
          <div>
            <Label className="text-cyan-300 mb-2 block">رابط الصورة</Label>
            <div className="space-y-3">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="bg-slate-800 border-cyan-500/30 text-cyan-100 placeholder-cyan-600/50"
                dir="ltr"
              />
              {imageUrl && (
                <div className="flex items-center justify-center p-4 bg-slate-800 rounded-lg border border-cyan-500/20">
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="max-w-[100px] max-h-[100px] rounded-lg"
                    onError={() => alert("فشل تحميل الصورة")}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
          >
            إلغاء
          </Button>
          <Button
            onClick={selectedTab === "emoji" ? handleSelectEmoji : handleSelectImage}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold"
          >
            تأكيد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/components/theme-provider"
import { useCategories } from "@/contexts/category-context"
import CategoryImageEmojiSelector from "./category-image-emoji-selector"
import UnauthorizedOverlay from "./unauthorized-overlay"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const ADMIN_ID = "897450827353063505"
const SECONDARY_ADMIN_ID = "1186739142231605248"
const PRIMARY_ADMIN_IDS = [ADMIN_ID, SECONDARY_ADMIN_ID] // Both are now primary admins
const EMOJI_OPTIONS = ["📚", "🎭", "🎮", "⚽", "🍕", "🚀", "🎨", "💻", "🌍", "🎵", "🏆", "🎓", "🔬", "🏥", "📖", "✈️", "🎪", "🎯", "📺", "🎬"]

export default function AddCategoryModal({ isOpen, onClose }: AddCategoryModalProps) {
  const { data: session } = useSession()
  const { theme } = useTheme()
  const { addCategory } = useCategories()
  const isDahoomy = theme === 'dahoomy-999'
  // ONLY PRIMARY ADMINS can add categories
  const isAdmin = session?.user?.id && PRIMARY_ADMIN_IDS.includes(session.user.id)

  // Prevent non-admin access
  if (!isOpen) return null
  if (!isAdmin) {
    return (
      <UnauthorizedOverlay
        isOpen={isOpen}
        onClose={onClose}
        title="غير مصرح لك بالدخول"
        description="ليس لديك صلاحية لإضافة تصنيفات."
      />
    )
  }

  const [categoryName, setCategoryName] = useState("")
  const [categoryGroup, setCategoryGroup] = useState("custom")
  const [loading, setLoading] = useState(false)
  const [showImageEmojiDialog, setShowImageEmojiDialog] = useState(false)

  const handleAddCategoryClick = () => {
    if (!categoryName.trim()) {
      alert("يجب إدخال اسم التصنيف")
      return
    }
    setShowImageEmojiDialog(true)
  }

  const handleSelectImageEmoji = async (type: "image" | "emoji", value: string) => {
    try {
      setLoading(true)
      
      // Save to database immediately
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryName,
          group: categoryGroup,
          imageType: type,
          imageValue: value,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `خطأ ${response.status}`
        throw new Error(`فشل إضافة التصنيف: ${errorMessage}`)
      }

      const newCategory = await response.json()
      
      // Add to context immediately with full response (includes iconName)
      addCategory(newCategory)

      alert(`✅ تمت إضافة التصنيف: ${categoryName}`)
      
      // Reset form
      setCategoryName("")
      setCategoryGroup("custom")
      setShowImageEmojiDialog(false)
      onClose()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "حدث خطأ غير معروف"
      console.error('Error adding category:', error)
      alert(`❌ خطأ: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur border border-blue-500/30 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-400 text-xl">إضافة تصنيف جديد</DialogTitle>
            <DialogDescription className="text-blue-400/70">
              أضف تصنيفاً جديداً واختر صورة أو إيموجي له
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name" className="text-blue-400 font-bold">
                اسم التصنيف
              </Label>
              <Input
                id="category-name"
                placeholder="مثال: التاريخ الإسلامي"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="bg-blue-500/10 border border-blue-500/30 text-white placeholder:text-blue-400/50 focus:border-blue-500/60"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-group" className="text-blue-400 font-bold">
                المجموعة
              </Label>
              <select
                id="category-group"
                value={categoryGroup}
                onChange={(e) => setCategoryGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-white focus:border-blue-500/60 focus:outline-none"
                disabled={loading}
              >
                <option value="custom" className="bg-slate-900">مخصص</option>
                <option value="general" className="bg-slate-900">عام</option>
                <option value="science" className="bg-slate-900">علوم</option>
                <option value="sports" className="bg-slate-900">رياضة</option>
                <option value="arts" className="bg-slate-900">فنون</option>
                <option value="technology" className="bg-slate-900">تكنولوجيا</option>
              </select>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-4">
              <p className="text-xs text-blue-400/80">
                ✨ في الخطوة التالية ستختار صورة أو إيموجي للتصنيف
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleAddCategoryClick}
              disabled={loading || !categoryName.trim()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white"
            >
              {loading ? "جاري..." : "التالي"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CategoryImageEmojiSelector
        isOpen={showImageEmojiDialog}
        onClose={() => setShowImageEmojiDialog(false)}
        onSelect={handleSelectImageEmoji}
      />
    </>
  )
}

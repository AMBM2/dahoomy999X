"use client"

import { useEffect, useMemo, useState } from "react"
import { X, BookOpen, Search, Trash2, AlertTriangle } from "lucide-react"
import { useCategories } from "@/contexts/category-context"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type QuestionRow = {
  id: string
  categoryId: string
  type: string
  text: string
  answer: string
  choices?: string[]
  mediaUrl?: string | null
  youtubeUrl?: string | null
  timestamp?: string | null
  points?: number
}

export default function QuestionsBankModal(props: { isOpen: boolean; onClose: () => void }) {
  const { isOpen, onClose } = props
  const { categories, refreshCategories } = useCategories()

  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [editAnswer, setEditAnswer] = useState("")
  const [editPoints, setEditPoints] = useState<number | undefined>(undefined)
  const [editCategoryId, setEditCategoryId] = useState<string>("")
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/questions", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        setQuestions(Array.isArray(data) ? data : [])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [isOpen])

  const categoryNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of categories) m.set(c.id, c.name)
    return m
  }, [categories])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return questions.filter((row) => {
      if (filterCategory !== "all" && row.categoryId !== filterCategory) return false
      if (filterType !== "all" && row.type !== filterType) return false
      if (!q) return true
      return (
        (row.text || "").toLowerCase().includes(q) ||
        (row.answer || "").toLowerCase().includes(q) ||
        (row.id || "").toLowerCase().includes(q)
      )
    })
  }, [questions, search, filterCategory, filterType])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/questions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || "فشل حذف السؤال")
        return
      }
      setQuestions((prev) => prev.filter((q) => q.id !== id))
      void refreshCategories()
    } finally {
      setDeletingId(null)
    }
  }

  const openEdit = (row: QuestionRow) => {
    setEditingId(row.id)
    setEditText(row.text)
    setEditAnswer(row.answer)
    setEditPoints(typeof row.points === "number" ? row.points : undefined)
    setEditCategoryId(row.categoryId)
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    if (!editText.trim() || !editAnswer.trim()) {
      alert("الرجاء تعبئة نص السؤال والإجابة.")
      return
    }

    try {
      const res = await fetch(`/api/questions?id=${encodeURIComponent(editingId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: editText.trim(),
          answer: editAnswer.trim(),
          points: typeof editPoints === "number" ? editPoints : undefined,
          categoryId: editCategoryId || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || "فشل تعديل السؤال")
        return
      }

      const updated = await res.json()
      setQuestions(prev =>
        prev.map(q => (q.id === updated.id ? { ...q, ...updated } : q)),
      )
      void refreshCategories()
      setEditingId(null)
    } catch (e) {
      console.error(e)
      alert("حدث خطأ أثناء تعديل السؤال")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 dir-rtl" dir="rtl">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/95 shadow-2xl flex flex-col">
        <div className="sticky top-0 border-b border-cyan-500/20 bg-slate-950/95 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-200 font-black">
            <BookOpen className="w-5 h-5" />
            بنك الأسئلة
            <span className="text-xs font-semibold text-cyan-400/80">({filtered.length})</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-cyan-500/10">
            <X className="w-5 h-5 text-cyan-300" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث في نص السؤال / الإجابة / ID..."
                className="w-full pr-10 pl-3 py-2 rounded-lg bg-black/40 border border-cyan-500/30 text-cyan-100 placeholder:text-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/40"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[340px] h-11 rounded-xl bg-black/40 border-cyan-500/30 text-cyan-100 hover:bg-black/50 focus-visible:ring-cyan-400/30 focus-visible:border-cyan-400/50 shadow-[0_0_22px_rgba(6,182,212,0.14)] px-4 text-base">
                <SelectValue placeholder="اختر التصنيف" />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="bg-slate-950/95 border-cyan-500/30 text-cyan-100 shadow-2xl shadow-cyan-500/15 backdrop-blur-xl rounded-xl p-1 min-w-[var(--radix-select-trigger-width)]"
              >
                <SelectItem className="rounded-lg py-2.5 pr-9 pl-3 text-base focus:bg-cyan-500/15 focus:text-cyan-100 data-[state=checked]:bg-cyan-500/10" value="all">
                  كل التصنيفات
                </SelectItem>
                {categories.map((c) => (
                  <SelectItem
                    key={c.id}
                    value={c.id}
                    className="rounded-lg py-2.5 pr-9 pl-3 text-base focus:bg-cyan-500/15 focus:text-cyan-100 data-[state=checked]:bg-cyan-500/10"
                  >
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[260px] h-11 rounded-xl bg-black/40 border-cyan-500/30 text-cyan-100 hover:bg-black/50 focus-visible:ring-cyan-400/30 focus-visible:border-cyan-400/50 shadow-[0_0_22px_rgba(6,182,212,0.14)] px-4 text-base">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="bg-slate-950/95 border-cyan-500/30 text-cyan-100 shadow-2xl shadow-cyan-500/15 backdrop-blur-xl rounded-xl p-1 min-w-[var(--radix-select-trigger-width)]"
              >
                <SelectItem className="rounded-lg py-2.5 pr-9 pl-3 text-base focus:bg-cyan-500/15 focus:text-cyan-100 data-[state=checked]:bg-cyan-500/10" value="all">
                  كل الأنواع
                </SelectItem>
                <SelectItem className="rounded-lg py-2.5 pr-9 pl-3 text-base focus:bg-cyan-500/15 focus:text-cyan-100 data-[state=checked]:bg-cyan-500/10" value="text">
                  نص
                </SelectItem>
                <SelectItem className="rounded-lg py-2.5 pr-9 pl-3 text-base focus:bg-cyan-500/15 focus:text-cyan-100 data-[state=checked]:bg-cyan-500/10" value="choices">
                  اختيارات
                </SelectItem>
                <SelectItem className="rounded-lg py-2.5 pr-9 pl-3 text-base focus:bg-cyan-500/15 focus:text-cyan-100 data-[state=checked]:bg-cyan-500/10" value="image">
                  صورة
                </SelectItem>
                <SelectItem className="rounded-lg py-2.5 pr-9 pl-3 text-base focus:bg-cyan-500/15 focus:text-cyan-100 data-[state=checked]:bg-cyan-500/10" value="video">
                  فيديو
                </SelectItem>
                <SelectItem className="rounded-lg py-2.5 pr-9 pl-3 text-base focus:bg-cyan-500/15 focus:text-cyan-100 data-[state=checked]:bg-cyan-500/10" value="riddle">
                  لغز
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={async () => {
                setLoading(true)
                try {
                  const res = await fetch("/api/questions", { cache: "no-store" })
                  if (!res.ok) return
                  const data = await res.json()
                  setQuestions(Array.isArray(data) ? data : [])
                } finally {
                  setLoading(false)
                }
              }}
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            >
              تحديث
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center text-cyan-300/70 py-10">جاري التحميل...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-cyan-300/70 py-10">لا توجد أسئلة</div>
            ) : (
              filtered.map((row) => {
                const catName = categoryNameById.get(row.categoryId) || row.categoryId
                return (
                  <div key={row.id} className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-bold text-cyan-200">{catName}</div>
                      <div className="text-xs text-cyan-400/80 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-black/30 border border-cyan-500/20">
                          {row.type}
                        </span>
                        {typeof row.points === "number" && (
                          <span className="px-2 py-0.5 rounded bg-black/30 border border-cyan-500/20">
                            {row.points}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/20"
                          title="تعديل السؤال"
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(row.id)}
                          disabled={deletingId === row.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                          title="حذف السؤال"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          حذف
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-white/90">{row.text}</div>
                    <div className="mt-1 text-xs text-green-300">
                      <span className="font-semibold">الإجابة:</span> {row.answer}
                    </div>

                    {!!row.choices?.length && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {row.choices.slice(0, 6).map((c, i) => (
                          <div key={i} className="text-xs text-cyan-100 bg-black/30 border border-cyan-500/15 rounded-lg px-2 py-1">
                            {c}
                          </div>
                        ))}
                      </div>
                    )}

                    {row.mediaUrl && row.type === "image" && (
                      <div className="mt-2">
                        <img src={row.mediaUrl} alt="media" className="max-h-44 rounded-lg border border-cyan-500/20 object-contain" />
                      </div>
                    )}
                    {row.mediaUrl && row.type === "video" && (
                      <div className="mt-2">
                        <video src={row.mediaUrl} controls className="w-full max-h-48 rounded-lg border border-cyan-500/20" />
                      </div>
                    )}

                    {row.youtubeUrl && row.timestamp && (
                      <div className="mt-2 text-[11px] text-cyan-300/80">
                        YouTube: {row.timestamp}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit dialog (بسيط ومباشر) */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-cyan-500/40 bg-slate-950 p-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-cyan-200 font-bold text-lg">تعديل السؤال</h2>
              <button
                onClick={() => setEditingId(null)}
                className="p-1.5 rounded-lg hover:bg-cyan-500/10 text-cyan-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-cyan-300">نص السؤال</label>
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full min-h-[80px] rounded-lg bg-black/40 border border-cyan-500/40 text-cyan-100 text-sm p-2 outline-none focus:ring-1 focus:ring-cyan-400/60"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-cyan-300">الإجابة</label>
              <input
                value={editAnswer}
                onChange={e => setEditAnswer(e.target.value)}
                className="w-full rounded-lg bg-black/40 border border-cyan-500/40 text-cyan-100 text-sm p-2 outline-none focus:ring-1 focus:ring-cyan-400/60"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-cyan-300">التصنيف</label>
              <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                <SelectTrigger className="w-full h-10 rounded-lg bg-black/40 border border-cyan-500/40 text-cyan-100 text-sm px-3">
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border border-cyan-500/30 text-cyan-100">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-cyan-300">النقاط (اختياري)</label>
              <input
                type="number"
                value={editPoints ?? ""}
                onChange={e =>
                  setEditPoints(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full rounded-lg bg-black/40 border border-cyan-500/40 text-cyan-100 text-sm p-2 outline-none focus:ring-1 focus:ring-cyan-400/60"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-4 py-2 rounded-lg bg-black/40 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10 text-sm"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 text-sm"
              >
                حفظ التعديل
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="bg-slate-950 border border-cyan-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cyan-200 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              تأكيد حذف السؤال
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cyan-200/70">
              هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setConfirmDeleteId(null)}
              className="px-4 py-2 rounded-lg bg-black/40 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"
            >
              إلغاء
            </button>
            <AlertDialogAction
              onClick={() => {
                const id = confirmDeleteId
                setConfirmDeleteId(null)
                if (id) void handleDelete(id)
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold"
            >
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


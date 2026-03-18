"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { X, Settings, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import type { AuditEntry } from "@/lib/audit-log"
import UnauthorizedOverlay from "./unauthorized-overlay"

const DASHBOARD_OWNER_ID = "1186739142231605248"

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const { data: session } = useSession()
  const { theme } = useTheme()
  const isDahoomy = theme === "dahoomy-999"

  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [search, setSearch] = useState("")
  const [profiles, setProfiles] = useState<Record<
    string,
    { id: string; username: string; displayName: string; avatar: string }
  >>({})
  const [activationRequests, setActivationRequests] = useState<
    Array<{
      id: string
      userId: string
      username: string
      status: string
      createdAt: string
    }>
  >([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  const isDashboardOwner = session?.user?.id === DASHBOARD_OWNER_ID
  if (!isOpen) return null
  if (!isDashboardOwner) {
    return (
      <UnauthorizedOverlay
        isOpen={isOpen}
        onClose={onClose}
        title="غير مصرح لك بالدخول"
        description="هذه الصفحة مخصصة لصاحب لوحة التحكم فقط."
      />
    )
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/audit", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setEntries(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      void loadData()
      void loadActivationRequests()
    }
  }, [isOpen])

  const loadActivationRequests = async () => {
    try {
      setLoadingRequests(true)
      const res = await fetch("/api/activation-requests?all=1", {
        cache: "no-store",
      })
      if (!res.ok) return
      const data = await res.json()
      setActivationRequests(Array.isArray(data) ? data : [])
    } finally {
      setLoadingRequests(false)
    }
  }

  const updateRequestStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/activation-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) {
        alert("فشل تحديث حالة الطلب")
        return
      }
      const updated = await res.json()
      setActivationRequests(prev =>
        prev.map(r => (r.id === updated.id ? { ...r, ...updated } : r)),
      )
    } catch {
      alert("حدث خطأ أثناء تحديث الطلب")
    }
  }

  // Load basic Discord profiles for unique actor IDs
  useEffect(() => {
    const loadProfiles = async () => {
      const ids = Array.from(new Set(entries.map((e) => e.actorId).filter(Boolean) as string[]))
      const missing = ids.filter((id) => !profiles[id])
      for (const id of missing) {
        try {
          const res = await fetch(`/api/discord/user?userId=${id}`)
          if (!res.ok) continue
          const data = await res.json()
          setProfiles((prev) => ({
            ...prev,
            [id]: {
              id: data.id,
              username: data.username || data.displayName || "Unknown",
              displayName: data.displayName || data.username || "Unknown",
              avatar: data.avatar || "",
            },
          }))
        } catch {
          // ignore
        }
      }
    }
    if (entries.length) {
      void loadProfiles()
    }
  }, [entries, profiles])

  const filteredEntries = entries
    // عرض فقط إضافات الأسئلة والتصنيفات (وحذف الزوار وباقي الأنواع)
    .filter((entry) =>
      entry.type === "question:add" ||
      entry.type === "category:add"
    )
    .filter((entry) => {
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    const actor = entry.actorId || ""
    const target = entry.targetId || ""
    const metaText =
      typeof entry.meta?.text === "string" ? (entry.meta.text as string).toLowerCase() : ""
    return (
      actor.toLowerCase().includes(q) ||
      target.toLowerCase().includes(q) ||
      metaText.includes(q)
    )
  })

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl"
      dir="rtl"
    >
      <div className="bg-card rounded-2xl border border-cyan-500/30 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-background/90 backdrop-blur border-b border-cyan-500/30 p-4 sm:p-6 flex items-center justify-between gap-3">
          <h2 className="text-lg sm:text-2xl font-bold text-cyan-300 flex items-center gap-2 min-w-0">
            <Settings className="w-5 sm:w-6 h-5 sm:h-6 flex-shrink-0" />
            <span className="truncate">سجل النظام</span>
          </h2>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => void loadData()}
              disabled={loading}
              className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
              title="تحديث السجل"
            >
              ⟳
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => void loadActivationRequests()}
              disabled={loadingRequests}
              className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
              title="تحديث طلبات التفعيل"
            >
              <Users className="w-4 h-4" />
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors"
            >
              <X className="w-5 sm:w-6 h-5 sm:h-6 text-cyan-400" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1 flex flex-col gap-4 overflow-hidden">
          <p className="text-xs sm:text-sm text-cyan-300/80 mb-1">
            يعرض هذا السجل زيارات الموقع، وإضافة/حذف/تعديل المضيفين، الأسئلة، والتصنيفات مع Discord ID لكل عملية.
          </p>

          {/* Search by ID or نص السؤال */}
          <div className="mb-2 flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم الـID أو جزء من نص السؤال..."
              className="w-full rounded-md bg-black/40 border border-cyan-500/40 px-3 py-2 text-sm text-cyan-100 placeholder:text-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              dir="ltr"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* قسم طلبات التفعيل */}
            <section className="border border-emerald-500/40 rounded-xl bg-black/40 p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm sm:text-base">
                  <Users className="w-4 h-4" />
                  <span>طلبات تفعيل الدخول</span>
                  <span className="text-xs text-emerald-400/80">
                    ({activationRequests.length})
                  </span>
                </div>
                {loadingRequests && (
                  <span className="text-[11px] text-emerald-300/80">
                    جاري تحميل الطلبات...
                  </span>
                )}
              </div>
              {activationRequests.length === 0 ? (
                <p className="text-xs sm:text-sm text-emerald-200/70">
                  لا توجد طلبات تفعيل حالياً.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activationRequests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 text-xs sm:text-sm flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-emerald-200">
                          {req.username} ({req.userId})
                        </span>
                        <span className="text-[11px] text-emerald-300/80">
                          {new Date(req.createdAt).toLocaleString("ar-SA")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="text-[11px] text-emerald-300/90">
                          الحالة:{" "}
                          <span className="font-bold">
                            {req.status === "approved"
                              ? "مقبول"
                              : req.status === "rejected"
                              ? "مرفوض"
                              : "قيد المراجعة"}
                          </span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateRequestStatus(req.id, "approved")}
                            disabled={req.status === "approved"}
                            className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-400/60 text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-50 text-[11px]"
                          >
                            قبول
                          </button>
                          <button
                            type="button"
                            onClick={() => updateRequestStatus(req.id, "rejected")}
                            disabled={req.status === "rejected"}
                            className="px-2 py-1 rounded bg-red-500/10 border border-red-500/50 text-red-200 hover:bg-red-500/20 disabled:opacity-50 text-[11px]"
                          >
                            رفض
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* قسم سجلات النظام */}
            {filteredEntries.length === 0 ? (
              <p className="text-cyan-400/70 text-sm text-center py-8">
                لا توجد سجلات بعد.
              </p>
            ) : (
              filteredEntries.map((entry) => {
                const profile = entry.actorId ? profiles[entry.actorId] : undefined
                const isQuestionAdd = entry.type === "question:add"
                const isCategoryAdd = entry.type === "category:add"
                const questionText =
                  (entry.meta && typeof entry.meta.text === "string" && entry.meta.text) || undefined
                const answerText =
                  (entry.meta && typeof entry.meta.answer === "string" && entry.meta.answer) || undefined
                const mediaUrl =
                  (entry.meta && typeof entry.meta.mediaUrl === "string" && entry.meta.mediaUrl) || undefined
                const qType =
                  (entry.meta && typeof entry.meta.type === "string" && entry.meta.type) || undefined

                return (
                <div
                  key={entry.id}
                  className="bg-cyan-500/5 border border-cyan-500/30 rounded-lg p-3 text-sm flex flex-col gap-1"
                >
                  <div className="flex justify-between gap-2 items-center">
                    <span className="font-bold text-cyan-300">
                      {entry.type}
                    </span>
                    <span className="text-xs text-cyan-400/70">
                      {new Date(entry.createdAt).toLocaleString("ar-SA")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-cyan-400 mt-1">
                    {profile && profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.displayName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center text-[10px] text-cyan-100">
                        ID
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span>
                        <span className="font-semibold">المستخدم:</span>{" "}
                        {profile ? `${profile.displayName} (${profile.id})` : entry.actorId ?? "غير معروف"}
                      </span>
                      {entry.targetId && (
                        <span>
                          <span className="font-semibold">الهدف:</span> {entry.targetId}
                        </span>
                      )}
                    </div>
                  </div>

                  {isQuestionAdd && (
                    <div className="mt-2 space-y-1 text-xs text-cyan-200 bg-black/40 rounded p-2">
                      {qType && (
                        <div className="text-[11px] text-cyan-300/80">
                          <span className="font-semibold">النوع:</span>{" "}
                          {qType === "image"
                            ? "سؤال صورة"
                            : qType === "video"
                            ? "سؤال فيديو"
                            : qType === "choices"
                            ? "سؤال اختيارات"
                            : qType === "riddle"
                            ? "لغز"
                            : "نص"}
                        </div>
                      )}
                      {questionText && (
                        <div>
                          <span className="font-semibold">السؤال:</span>{" "}
                          {questionText}
                        </div>
                      )}
                      {answerText && (
                        <div className="text-green-300">
                          <span className="font-semibold">الإجابة:</span>{" "}
                          {answerText}
                        </div>
                      )}
                      {mediaUrl && qType === "image" && (
                        <div className="mt-2">
                          <img
                            src={mediaUrl}
                            alt="صورة السؤال"
                            className="max-h-40 rounded border border-cyan-500/40 object-contain"
                          />
                        </div>
                      )}
                      {mediaUrl && qType === "video" && (
                        <div className="mt-2">
                          <video
                            src={mediaUrl}
                            controls
                            className="w-full max-h-48 rounded border border-cyan-500/40"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* عرض جميل لتصنيف جديد */}
                  {isCategoryAdd && entry.meta && (
                    <div className="mt-2 flex items-center gap-3 bg-black/40 rounded p-2 text-xs text-cyan-200">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-500/40">
                        {(() => {
                          const imageType = (entry.meta as any).imageType as string | undefined
                          const imageValue = (entry.meta as any).imageValue as string | undefined
                          if (imageType === "emoji" && imageValue) {
                            return <span className="text-2xl">{imageValue}</span>
                          }
                          if (imageType === "image" && imageValue) {
                            return (
                              <img
                                src={imageValue}
                                alt={(entry.meta as any).name || "التصنيف"}
                                className="w-8 h-8 rounded object-contain"
                              />
                            )
                          }
                          return (
                            <span className="text-[10px] text-cyan-300">
                              CAT
                            </span>
                          )
                        })()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-cyan-100">
                          {(entry.meta as any).name || "تصنيف جديد"}
                        </span>
                        {(entry.meta as any).group && (
                          <span className="text-cyan-400/80">
                            المجموعة: {(entry.meta as any).group}
                          </span>
                        )}
                        {entry.targetId && (
                          <span className="text-cyan-500/80 text-[11px]">
                            ID: {entry.targetId}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )})
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

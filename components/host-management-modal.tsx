"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { X, Plus, Trash2, Users, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import UnauthorizedOverlay from "./unauthorized-overlay"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface HostModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Host {
  id?: string
  userId: string
  permissions?: string[]
  addedAt?: string
  addedBy?: string
  createdAt?: string
  createdBy?: string
}

interface UserProfile {
  id: string
  username: string
  displayName: string
  avatar: string
}

const ADMIN_ID = "897450827353063505"
const SECONDARY_ADMIN_ID = "1186739142231605248"
const PRIMARY_ADMIN_IDS = [ADMIN_ID, SECONDARY_ADMIN_ID] // Both are now primary admins

export default function HostManagementModal({ isOpen, onClose }: HostModalProps) {
  const { data: session } = useSession()
  // Only primary admin can manage hosts
  const isAdmin = session?.user?.id && PRIMARY_ADMIN_IDS.includes(session.user.id)

  // Prevent non-admin access
  if (!isOpen) return null
  if (!isAdmin) {
    return (
      <UnauthorizedOverlay
        isOpen={isOpen}
        onClose={onClose}
        title="غير مصرح لك بالدخول"
        description="هذه الصفحة خاصة بإدارة المضيفين."
      />
    )
  }

  const [hosts, setHosts] = useState<Host[]>([])
  const [hostUserId, setHostUserId] = useState("")
  const [role, setRole] = useState<"play-only" | "add-questions" | "add-questions-categories">("play-only")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userProfilesMap, setUserProfilesMap] = useState<Record<string, UserProfile>>({})
  const [fetchingUserIds, setFetchingUserIds] = useState<Set<string>>(new Set())
  const [botTokenMissing, setBotTokenMissing] = useState(false)

  // Fetch hosts on mount
  useEffect(() => {
    if (isOpen) {
      fetchHosts()
    }
  }, [isOpen])

  // Fetch user profile data for each host
  useEffect(() => {
    const fetchUserProfiles = async () => {
      const hostsToFetch = hosts.filter(h => !userProfilesMap[h.userId])

      if (hostsToFetch.length === 0) return

      for (const host of hostsToFetch) {
        try {
          const response = await fetch(`/api/discord/user?userId=${host.userId}`)
          if (response.ok) {
            const userData: UserProfile = await response.json()
            setUserProfilesMap(prev => ({
              ...prev,
              [host.userId]: userData
            }))
          } else if (response.status === 403) {
            // Bot token is missing
            setBotTokenMissing(true)
          }
        } catch (error) {
          // Silently handle
        }
      }
    }

    fetchUserProfiles()
  }, [hosts, userProfilesMap])

  const fetchHosts = async () => {
    try {
      const response = await fetch("/api/hosts")
      if (response.ok) {
        const data = await response.json()
        setHosts(data)
        setUserProfilesMap({})
      }
    } catch (error) {
      console.error("Error fetching hosts:", error)
    }
  }

  const handleAddHost = async () => {
    if (!hostUserId.trim()) {
      alert("الرجاء إدخال معرف المستخدم (Discord ID)")
      return
    }

    setIsLoading(true)
    try {
      // First validate the user exists by fetching their profile
      const userResponse = await fetch(`/api/discord/user?userId=${hostUserId.trim()}`)
      if (!userResponse.ok) {
        const errorData = await userResponse.json().catch(() => ({}))
        const errorMsg = errorData.error || `لم يتم العثور على المستخدم. (الخطأ: ${userResponse.status})`
        alert(errorMsg)
        setIsLoading(false)
        return
      }

      // Map الدور إلى صلاحيات API
      let permissions: string[] = []
      if (role === "add-questions") {
        permissions = ["add_questions"]
      } else if (role === "add-questions-categories") {
        permissions = ["add_questions", "add_categories"]
      }

      // Add the host
      const response = await fetch("/api/hosts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: hostUserId.trim(),
          permissions,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        alert(error.error || "فشل إضافة المضيف")
        return
      }

      await fetchHosts()
      setHostUserId("")
      setRole("play-only")
      alert("تم إضافة المضيف بنجاح! ✨")
    } catch (error) {
      console.error("Error adding host:", error)
      const errorMsg = error instanceof Error ? error.message : "حدث خطأ غير معروف"
      alert(`خطأ: ${errorMsg}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveHost = async (userId: string) => {
    if (!confirm("هل تريد حقاً إزالة هذا المضيف؟")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/hosts?userId=${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        alert("فشل حذف المضيف")
        return
      }

      await fetchHosts()
      alert("تم حذف المضيف بنجاح")
    } catch (error) {
      console.error("Error removing host:", error)
      alert("حدث خطأ أثناء حذف المضيف")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-cyan-500/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-cyan-300 flex items-center gap-2">
            <Users className="w-5 h-5" />
            إدارة المضيفين
          </DialogTitle>
          <DialogDescription className="text-cyan-200/70">
            أضف أو أزل المضيفين الذين يمكنهم إدارة الفئات
          </DialogDescription>
        </DialogHeader>

        {/* Add Host Form */}
        <div className="space-y-4 py-4 border-b border-cyan-500/20">
          <h3 className="text-sm font-bold text-cyan-300">إضافة مضيف جديد</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-cyan-200/70 block mb-1">معرف المستخدم (Discord ID)</label>
              <Input
                value={hostUserId}
                onChange={(e) => setHostUserId(e.target.value)}
                placeholder="أدخل Discord ID هنا"
                className="bg-slate-800 border-cyan-500/30 text-cyan-100 font-mono"
                dir="ltr"
              />
              <p className="text-xs text-cyan-400/60 mt-1">سيتم سحب اسم المستخدم والصورة تلقائياً ✨</p>
            </div>

            {/* اختيار الرتبة */}
            <div className="space-y-1">
              <p className="text-xs text-cyan-200/80 font-semibold">رتبة المضيف (الصلاحيات)</p>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => setRole("play-only")}
                  className={`text-xs text-left px-3 py-2 rounded-lg border ${
                    role === "play-only"
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                      : "border-cyan-500/20 bg-slate-900/40 text-cyan-300 hover:bg-cyan-500/10"
                  }`}
                >
                  <span className="font-bold">لاعب فقط</span>
                  <span className="block text-[11px] text-cyan-300/80">
                    يمكنه اللعب والتحكم في النقاط فقط بدون إضافة أسئلة أو تصنيفات
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("add-questions")}
                  className={`text-xs text-left px-3 py-2 rounded-lg border ${
                    role === "add-questions"
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                      : "border-cyan-500/20 bg-slate-900/40 text-cyan-300 hover:bg-cyan-500/10"
                  }`}
                >
                  <span className="font-bold">إضافة أسئلة</span>
                  <span className="block text-[11px] text-cyan-300/80">
                    يستطيع إضافة وتعديل الأسئلة فقط
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("add-questions-categories")}
                  className={`text-xs text-left px-3 py-2 rounded-lg border ${
                    role === "add-questions-categories"
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                      : "border-cyan-500/20 bg-slate-900/40 text-cyan-300 hover:bg-cyan-500/10"
                  }`}
                >
                  <span className="font-bold">إضافة أسئلة وتصنيفات</span>
                  <span className="block text-[11px] text-cyan-300/80">
                    يستطيع إدارة الأسئلة والتصنيفات (مضيف متقدم)
                  </span>
                </button>
              </div>
            </div>

            <Button
              onClick={handleAddHost}
              disabled={isLoading || !hostUserId.trim()}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? "جاري الإضافة..." : "إضافة مضيف"}
            </Button>
          </div>
        </div>

        {/* Hosts List */}
        <div className="py-4">
          <h3 className="text-sm font-bold text-cyan-300 mb-3">المضيفون الحاليون ({hosts.length})</h3>
          
          {botTokenMissing && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300">
                ⚠️ <strong>ملاحظة:</strong> لعرض صور وأسماء المضيفين، يرجى إضافة <code className="bg-blue-500/20 px-1 rounded">DISCORD_BOT_TOKEN</code> في ملف <code className="bg-blue-500/20 px-1 rounded">.env.local</code>
              </p>
            </div>
          )}
          
          {hosts.length === 0 ? (
            <p className="text-sm text-cyan-400/60 text-center py-4">لا يوجد مضيفون حالياً</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {hosts.map((host) => {
                const profile = userProfilesMap[host.userId]
                const isFetching = fetchingUserIds.has(host.userId)

                return (
                  <div
                    key={host.userId}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {profile ? (
                        <>
                          <img
                            src={profile.avatar}
                            alt={profile.displayName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2306b6d4'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"
                            }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-cyan-300">{profile.displayName}</p>
                            <p className="text-xs text-cyan-400/60">@{profile.username}</p>
                          </div>
                        </>
                      ) : isFetching ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                            <Loader className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-cyan-300 animate-pulse">جاري التحميل...</p>
                            <p className="text-xs text-cyan-400/60 font-mono">{host.userId}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-cyan-300 font-mono">{host.userId}</p>
                            <p className="text-xs text-cyan-400/60">مضيف نشط</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleRemoveHost(host.userId)}
                      disabled={isDeleting}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/30"
          >
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type Status = "idle" | "pending" | "approved" | "none"

export default function ActivationRequestModal() {
  const { data: session, status } = useSession()
  const [statusState, setStatusState] = useState<Status>("idle")
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [checkCount, setCheckCount] = useState(0)

  // فحص الحالة
  const checkStatus = async () => {
    if (!session?.user?.id) return
    try {
      const res = await fetch("/api/activation-requests?mine=1", {
        cache: "no-store",
      })
      if (!res.ok) return
      const data = await res.json()
      if (!data) {
        setStatusState("none")
      } else if (data.status === "approved") {
        setStatusState("approved")
      } else if (data.status === "pending") {
        setStatusState("pending")
      } else {
        setStatusState("none")
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    checkStatus()
  }, [session?.user?.id])

  // فحص دوري كل 5 ثوانٍ لتحديث الحالة تلقائياً
  useEffect(() => {
    if (!session?.user?.id || statusState === "approved") return

    const interval = setInterval(() => {
      checkStatus()
      setCheckCount((c) => c + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [session?.user?.id, statusState])

  const handleRequest = async () => {
    if (!session?.user?.id) {
      await signIn("discord")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/activation-requests", {
        method: "POST",
      })
      if (!res.ok) {
        alert("فشل إرسال الطلب، حاول مرة أخرى.")
        return
      }
      setStatusState("pending")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await checkStatus()
    setRefreshing(false)
  }

  if (status === "loading") return null
  if (statusState === "approved") return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl border border-cyan-500/40 bg-slate-950/95 shadow-2xl p-6 space-y-4 text-center">
        {statusState === "pending" ? (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto text-cyan-400 mb-2" />
            <h2 className="text-xl font-bold text-cyan-200 mb-1">
              تم إرسال طلب التفعيل ✓
            </h2>
            <p className="text-sm text-cyan-300/80 mb-4">
              طلبك قيد مراجعة صاحب الموقع. يتم التحقق تلقائياً كل 5 ثوانٍ من الموافقة.
            </p>
            <div className="text-xs text-cyan-400/60 mb-4">
              عدد الفحوصات: {checkCount}
            </div>
            <Button
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
              disabled={refreshing}
              onClick={handleRefresh}
              variant="outline"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  تحديث يدوي
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <AlertTriangle className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
            <h2 className="text-xl font-bold text-cyan-200 mb-1">
              ⚠️ تحتاج إلى تفعيل للدخول
            </h2>
            <p className="text-sm text-cyan-300/80 mb-3">
              لا يمكنك اللعب بدون تفعيل. اضغط{" "}
              <span className="font-semibold text-cyan-100">رفع طلب تفعيل</span>
              {" "}وانتظر الموافقة من صاحب الموقع.
            </p>
            {!session?.user?.id && (
              <p className="text-xs text-cyan-400/80 mb-3 p-2 bg-cyan-950/50 rounded">
                ⚠️ يجب أولاً تسجيل الدخول بحساب Discord.
              </p>
            )}
            <Button
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
              disabled={loading}
              onClick={handleRequest}
            >
              {session?.user?.id ? "🎮 رفع طلب تفعيل" : "📱 تسجيل الدخول ورفع الطلب"}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}


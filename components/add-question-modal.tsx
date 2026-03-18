"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { X, Plus, Image, Video, Type, ListChecks, Lightbulb, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categoriesList } from "@/lib/question-bank"
import { useTheme } from "@/components/theme-provider"
import { useCategories } from "@/contexts/category-context"
import UnauthorizedOverlay from "./unauthorized-overlay"

const ADMIN_ID = "897450827353063505"
const SECONDARY_ADMIN_ID = "1186739142231605248"
const PRIMARY_ADMIN_IDS = [ADMIN_ID, SECONDARY_ADMIN_ID] // Both are now primary admins
const ADMIN_IDS = PRIMARY_ADMIN_IDS

interface AddQuestionModalProps {
  isOpen: boolean
  onClose: () => void
}

type QuestionType = "text" | "choices" | "image" | "video" | "riddle"
type GameMode = "SeenGeem" | "Hrof"

interface NewQuestion {
  categoryId: string
  type: QuestionType
  text: string
  answer: string
  choices?: string[]
  mediaUrl?: string
  youtubeUrl?: string | null
  clipStart?: string | null
  clipEnd?: string | null
  isRiddle?: boolean
  points: number
  gameMode?: GameMode
}

// Icon mapping for dynamic categories
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'Briefcase': Lightbulb,
  'HelpCircle': HelpCircle,
}

const getIconComponent = (iconName?: string): React.ComponentType<any> => {
  if (!iconName) return HelpCircle
  return ICON_MAP[iconName] || HelpCircle
}

export default function AddQuestionModal({ isOpen, onClose }: AddQuestionModalProps) {
  // ============ ALL HOOKS MUST BE AT TOP - BEFORE ANY CONDITIONAL LOGIC ============
  
  // All useState hooks
  const [questionType, setQuestionType] = useState<QuestionType>("text")
  const [categoryId, setCategoryId] = useState("")
  const [questionText, setQuestionText] = useState("")
  const [answer, setAnswer] = useState("")
  const [choices, setChoices] = useState(["", "", "", ""])
  const [mediaUrl, setMediaUrl] = useState("")
  const [clipStart, setClipStart] = useState("")
  const [clipEnd, setClipEnd] = useState("")
  const [points, setPoints] = useState(100)
  const [savedQuestions, setSavedQuestions] = useState<NewQuestion[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [gameMode, setGameMode] = useState<GameMode>("SeenGeem")

  // All useEffect hooks - BEFORE any conditional returns
  useEffect(() => {
    if (!isOpen) {
      setCategoryId("")
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    setClipStart("")
    setClipEnd("")
  }, [isOpen, questionType])

  // All custom hooks
  const { data: session } = useSession()
  const { theme } = useTheme()
  const { categories: dynamicCategories, refreshCategories } = useCategories()
  const isDahoomy = theme === 'dahoomy-999'
  // Check admin status - both are now primary admins with full permissions
  const isPrimaryAdmin = session?.user?.id && PRIMARY_ADMIN_IDS.includes(session.user.id)
  const isAnyAdmin = isPrimaryAdmin  // Same as isPrimaryAdmin now
  const canCreateHrof = isPrimaryAdmin  // Both admins can create Hrof
  const canCreateSeenGeem = isAnyAdmin  // Both admins can create Seen Geem

  // ============ NOW WE CAN HAVE CONDITIONAL LOGIC ============
  
  if (!isOpen) return null
  
  // Block non-admins from seeing modal
  if (!isAnyAdmin) {
    return (
      <UnauthorizedOverlay
        isOpen={isOpen}
        onClose={onClose}
        title="غير مصرح لك بالدخول"
        description="ليس لديك صلاحية لإضافة أسئلة."
      />
    )
  }
  
  // Both admins now have full access - no restrictions
  if (!isPrimaryAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-red-950 border-2 border-red-500 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-300 mb-4">🔒 ممنوع</h2>
          <p className="text-red-200 mb-6">
            فقط المسؤولون يمكنهم إنشاء الأسئلة.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    )
  }

  // Derived values computed only after modal is open
  const primaryColor = isDahoomy ? 'text-cyan-300' : 'text-blue-300'
  const primaryBg = isDahoomy ? 'bg-cyan-500/20' : 'bg-blue-600'
  const primaryBorder = isDahoomy ? 'border-cyan-500/30' : 'border-blue-500/40'
  const borderStyle = isDahoomy ? '2px solid rgb(6, 182, 212)' : '2px solid rgb(59, 130, 246)'
  const allCategories = [...dynamicCategories, ...categoriesList]
  
  const handleAddChoice = () => {
    setChoices([...choices, ""])
  }

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices]
    newChoices[index] = value
    setChoices(newChoices)
  }

  const handleRemoveChoice = (index: number) => {
    const newChoices = choices.filter((_, i) => i !== index)
    setChoices(newChoices)
  }

  const handleSaveQuestion = async () => {
    if (!categoryId || !questionText || !answer) {
      alert("الرجاء ملء جميع الحقول المطلوبة")
      return
    }

    const isYouTubeUrl = (url: string) => /(?:youtube\.com\/watch\?v=|youtu\.be\/)/i.test(url)
    const cleanedUrl = mediaUrl.trim()
    const clipPayload =
      questionType === "video" && cleanedUrl
        ? isYouTubeUrl(cleanedUrl)
          ? { youtubeUrl: cleanedUrl, clipStart: clipStart.trim() || null, clipEnd: clipEnd.trim() || null }
          : { mediaUrl: cleanedUrl, clipStart: clipStart.trim() || null, clipEnd: clipEnd.trim() || null }
        : {}

    const newQuestion: NewQuestion = {
      categoryId,
      type: questionType,
      text: questionText,
      answer,
      points,
      gameMode,
      ...(questionType === "riddle" && { isRiddle: true }),
      ...(questionType === "choices" && { choices: choices.filter(c => c.trim()) }),
      ...(["image"].includes(questionType) && { mediaUrl }),
      ...(questionType === "video" && clipPayload),
    }

    setIsSaving(true)
    try {
      // Save to database immediately
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newQuestion),
      })

      if (!response.ok) {
        throw new Error("فشل حفظ السؤال")
      }

      const savedQuestion = await response.json()
      setSavedQuestions([...savedQuestions, newQuestion])
      // تحديث العداد الحقيقي لعدد الأسئلة في التصنيف
      void refreshCategories()
      
      // Reset form
      setQuestionText("")
      setAnswer("")
      setChoices(["", "", "", ""])
      setMediaUrl("")
      setClipStart("")
      setClipEnd("")
      
      alert("تم حفظ السؤال في قاعدة البيانات بنجاح!")
    } catch (error) {
      console.error("Error saving question:", error)
      alert("حدث خطأ أثناء حفظ السؤال")
    } finally {
      setIsSaving(false)
    }
  }

  const getCategoryName = (id: string) => {
    const cat = allCategories.find(c => c.id === id)
    return cat?.name || id
  }

  const generateCode = () => {
    if (savedQuestions.length === 0) {
      alert("لا توجد أسئلة محفوظة")
      return
    }

    // Group questions by category
    const grouped: Record<string, NewQuestion[]> = {}
    savedQuestions.forEach(q => {
      if (!grouped[q.categoryId]) {
        grouped[q.categoryId] = []
      }
      grouped[q.categoryId].push(q)
    })

    let code = "// الأسئلة الجديدة - انسخ هذا الكود وألصقه في الملف المناسب\n\n"
    
    Object.entries(grouped).forEach(([catId, questions]) => {
      code += `// ====== ${getCategoryName(catId)} (${catId}.ts) ======\n`
      questions.forEach(q => {
        if (q.isRiddle) {
          code += `  { text: "${q.text}", answer: "${q.answer}", isRiddle: true },\n`
        } else if (q.choices && q.choices.length > 0) {
          code += `  { text: "${q.text}", answer: "${q.answer}", choices: [${q.choices.map(c => `"${c}"`).join(', ')}] },\n`
        } else if (q.mediaUrl) {
          code += `  { text: "${q.text}", answer: "${q.answer}", ${q.type === 'image' ? 'image' : 'video'}: "${q.mediaUrl}" },\n`
        } else {
          code += `  { text: "${q.text}", answer: "${q.answer}" },\n`
        }
      })
      code += "\n"
    })

    // Copy to clipboard
    navigator.clipboard.writeText(code).then(() => {
      alert("تم نسخ الكود! الصقه في الملف المناسب في lib/questions/")
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-20 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6"
        style={{
          background: isDahoomy ? 'linear-gradient(to bottom, rgba(3, 3, 8, 0.95), rgba(3, 3, 8, 0.9))' : 'linear-gradient(to bottom, oklch(0.18 0.03 45), oklch(0.12 0.02 40))',
          border: borderStyle
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${primaryColor}`}>إضافة سؤال جديد</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className={`${primaryColor} ${isDahoomy ? 'hover:bg-cyan-500/20' : 'hover:bg-blue-500/20'}`}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Game Mode Selection */}
        <div className="mb-6">
          <Label className={`${primaryColor} mb-3 block`}>طريقة اللعب</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setGameMode("SeenGeem")}
              className={`p-3 rounded-lg font-bold transition-all ${
                gameMode === "SeenGeem"
                  ? isDahoomy ? "bg-cyan-500/30 text-cyan-100 border-2 border-cyan-400" : "bg-blue-600 text-white border-2 border-blue-400"
                  : isDahoomy ? "bg-card/50 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20" : "bg-card/50 text-blue-300 border border-blue-500/40 hover:bg-blue-500/20"
              }`}
            >
              سين جيم ✨
            </button>
            <button
              disabled
              className={`p-3 rounded-lg font-bold transition-all opacity-50 cursor-not-allowed ${
                isDahoomy ? "bg-card/50 text-gray-400 border border-gray-600/30" : "bg-card/50 text-gray-400 border border-gray-600/30"
              }`}
            >
              حروف ⚡ (غير متاح)
            </button>
          </div>
        </div>

        {/* Question Type Selection */}
        <div className="mb-6">
          <Label className={`${primaryColor} mb-3 block`}>نوع السؤال</Label>
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => setQuestionType("text")}
              className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                questionType === "text" 
                  ? isDahoomy ? "bg-cyan-500/30 text-cyan-100 border border-cyan-400" : "bg-blue-600 text-white border border-blue-400" 
                  : isDahoomy ? "bg-card/50 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20" : "bg-card/50 text-blue-300 border border-blue-500/40 hover:bg-blue-500/20"
              }`}
            >
              <Type className="w-6 h-6" />
              <span className="text-sm font-bold">نص</span>
            </button>
            <button
              onClick={() => setQuestionType("riddle")}
              className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                questionType === "riddle" 
                  ? isDahoomy ? "bg-red-500/30 text-red-100 border border-red-400" : "bg-purple-600 text-white border border-purple-400" 
                  : isDahoomy ? "bg-card/50 text-red-300 border border-red-500/30 hover:bg-red-500/20" : "bg-card/50 text-purple-300 border border-purple-500/40 hover:bg-purple-500/20"
              }`}
            >
              <Lightbulb className="w-6 h-6" />
              <span className="text-sm font-bold">لغز</span>
            </button>
            <button
              onClick={() => setQuestionType("choices")}
              className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                questionType === "choices" 
                  ? isDahoomy ? "bg-cyan-500/30 text-cyan-100 border border-cyan-400" : "bg-blue-600 text-white border border-blue-400" 
                  : isDahoomy ? "bg-card/50 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20" : "bg-card/50 text-blue-300 border border-blue-500/40 hover:bg-blue-500/20"
              }`}
            >
              <ListChecks className="w-6 h-6" />
              <span className="text-sm font-bold">اختيارات</span>
            </button>
            <button
              onClick={() => setQuestionType("image")}
              className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                questionType === "image" 
                  ? isDahoomy ? "bg-cyan-500/30 text-cyan-100 border border-cyan-400" : "bg-blue-600 text-white border border-blue-400" 
                  : isDahoomy ? "bg-card/50 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20" : "bg-card/50 text-blue-300 border border-blue-500/40 hover:bg-blue-500/20"
              }`}
            >
              <Image className="w-6 h-6" />
              <span className="text-sm font-bold">صورة</span>
            </button>
            <button
              onClick={() => setQuestionType("video")}
              className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                questionType === "video" 
                  ? isDahoomy ? "bg-cyan-500/30 text-cyan-100 border border-cyan-400" : "bg-blue-600 text-white border border-blue-400" 
                  : isDahoomy ? "bg-card/50 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20" : "bg-card/50 text-blue-300 border border-blue-500/40 hover:bg-blue-500/20"
              }`}
            >
              <Video className="w-6 h-6" />
              <span className="text-sm font-bold">فيديو</span>
            </button>
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-4">
          <Label className={`${primaryColor} mb-2 block`}>التصنيف</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className={`h-11 rounded-xl bg-black/40 ${primaryBorder} text-cyan-100 hover:bg-black/50 focus-visible:ring-cyan-400/30 focus-visible:border-cyan-400/50 shadow-[0_0_22px_rgba(6,182,212,0.14)] px-4 text-base`}>
              <SelectValue placeholder="اختر التصنيف" />
            </SelectTrigger>
            <SelectContent
              align="end"
              className="max-h-72 bg-slate-950/95 border border-cyan-500/30 text-cyan-100 shadow-2xl shadow-cyan-500/15 backdrop-blur-xl rounded-xl p-1 min-w-[var(--radix-select-trigger-width)]"
            >
              {allCategories.map(cat => {
                const isDynamic = (cat as any).isDynamic
                const imageType = (cat as any).imageType
                const imageValue = (cat as any).imageValue
                
                return (
                  <SelectItem
                    key={cat.id}
                    value={cat.id}
                    className="rounded-lg py-2.5 pr-9 pl-3 text-base focus:bg-cyan-500/15 focus:text-cyan-100 data-[state=checked]:bg-cyan-500/10"
                  >
                    <span className="flex items-center gap-2">
                      {isDynamic && imageType === "emoji" ? (
                        <span className="text-lg">{imageValue}</span>
                      ) : isDynamic && imageType === "image" ? (
                        <img src={imageValue} alt={cat.name} className="w-4 h-4 rounded" />
                      ) : (
                        <>
                          {(() => {
                            const IconComponent = getIconComponent((cat as any).iconName)
                            return <IconComponent className="w-4 h-4" />
                          })()}
                        </>
                      )}
                      {cat.name}
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Points Selection */}
        <div className="mb-4">
          <Label className="text-blue-300 mb-2 block">النقاط</Label>
          <Select value={points.toString()} onValueChange={(v) => setPoints(parseInt(v))}>
            <SelectTrigger className="bg-card/50 border-blue-500/40 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 نقطة (سهل)</SelectItem>
              <SelectItem value="100">100 نقطة (متوسط)</SelectItem>
              <SelectItem value="300">300 نقطة (صعب)</SelectItem>
              <SelectItem value="500">500 نقطة (صعب جداً)</SelectItem>
              <SelectItem value="1000">1000 نقطة (خبير)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Question Text */}
        <div className="mb-4">
          <Label className="text-blue-300 mb-2 block">نص السؤال</Label>
          <Textarea 
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="اكتب السؤال هنا..."
            className="bg-card/50 border-blue-500/40 text-foreground min-h-[100px]"
          />
        </div>

        {/* Media URL (for image/video) */}
        {(questionType === "image" || questionType === "video") && (
          <div className="mb-4">
            <Label className="text-blue-300 mb-2 block">
              رابط {questionType === "image" ? "الصورة" : "الفيديو"}
            </Label>
            <Input 
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={questionType === "image" ? "https://example.com/image.jpg" : "https://youtube.com/watch?v=..."}
              className="bg-card/50 border-blue-500/40 text-foreground"
              dir="ltr"
            />
          </div>
        )}

        {/* Clip controls for video */}
        {questionType === "video" && (
          <div className="mb-4">
            <Label className="text-blue-300 mb-2 block">مقاطع الرابط (من / إلى)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                value={clipStart}
                onChange={(e) => setClipStart(e.target.value)}
                placeholder="من (مثال: 00:15 أو 15)"
                className="bg-card/50 border-blue-500/40 text-foreground"
                dir="ltr"
              />
              <Input
                value={clipEnd}
                onChange={(e) => setClipEnd(e.target.value)}
                placeholder="إلى (مثال: 00:25 أو 25)"
                className="bg-card/50 border-blue-500/40 text-foreground"
                dir="ltr"
              />
            </div>
            <div className="mt-2 text-xs text-cyan-300/70">
              إذا ما حطيت “إلى”، اللعبة بتشغل 10 ثواني تلقائيًا.
            </div>

            {mediaUrl.trim() && /(?:youtube\.com\/watch\?v=|youtu\.be\/)/i.test(mediaUrl.trim()) && (
              <div className="mt-3 rounded-xl overflow-hidden border border-cyan-500/20 bg-black/30">
                <div className="px-3 py-2 text-xs text-cyan-200 border-b border-cyan-500/15 bg-cyan-500/5">
                  معاينة يوتيوب
                </div>
                <div className="w-full aspect-video">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${(() => {
                      const u = mediaUrl.trim()
                      const m = u.match(/[?&]v=([^&]+)/i)
                      if (m?.[1]) return m[1]
                      const short = u.match(/youtu\.be\/([^?&]+)/i)
                      return short?.[1] || ""
                    })()}?controls=1&rel=0`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="YouTube Preview"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Choices (for multiple choice) */}
        {questionType === "choices" && (
          <div className="mb-4">
            <Label className="text-blue-300 mb-2 block">الخيارات</Label>
            <div className="space-y-2">
              {choices.map((choice, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    placeholder={`الخيار ${index + 1}`}
                    className="bg-card/50 border-blue-500/40 text-foreground flex-1"
                  />
                  {choices.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveChoice(index)}
                      className="text-red-500 hover:bg-red-500/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {choices.length < 6 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddChoice}
                  className="border-blue-500/40 text-blue-300 hover:bg-blue-500/20"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة خيار
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Answer */}
        <div className="mb-6">
          <Label className="text-blue-300 mb-2 block">الإجابة الصحيحة</Label>
          <Input 
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="اكتب الإجابة الصحيحة..."
            className="bg-card/50 border-blue-500/40 text-foreground"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSaveQuestion}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 font-bold"
          >
            <Plus className="w-5 h-5 ml-2" />
            حفظ السؤال
          </Button>
          {savedQuestions.length > 0 && (
            <Button 
              onClick={generateCode}
              variant="outline"
              className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
            >
              نسخ الكود ({savedQuestions.length})
            </Button>
          )}
        </div>

        {/* Saved Questions Preview */}
        {savedQuestions.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-card/30 border border-blue-500/20">
            <h3 className="text-blue-300 font-bold mb-3">الأسئلة المحفوظة ({savedQuestions.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedQuestions.map((q, i) => (
                <div key={i} className="text-sm text-muted-foreground p-2 rounded bg-card/50">
                  <span className="text-blue-300">[{getCategoryName(q.categoryId)}]</span> {q.text.substring(0, 50)}...
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <h3 className="text-blue-400 font-bold mb-2">كيفية إضافة الأسئلة:</h3>
          <ol className="text-sm text-blue-300 space-y-1 list-decimal list-inside">
            <li>أضف الأسئلة باستخدام النموذج أعلاه</li>
            <li>اضغط "نسخ الكود" لنسخ جميع الأسئلة</li>
            <li>افتح ملف التصنيف في <code className="bg-blue-500/20 px-1 rounded">lib/questions/</code></li>
            <li>الصق الأسئلة في المكان المناسب</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

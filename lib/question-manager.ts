// =====================================================
// مدير الأسئلة - نظام ذكي للعشوائية وتتبع الأسئلة المعروضة
// =====================================================

import { Question, questionsByCategory, getQuestionsForCategory } from './questions'

// مفتاح التخزين المحلي
const SEEN_QUESTIONS_KEY = 'dahoomy_seen_questions'

// واجهة السؤال المحسنة
export interface EnhancedQuestion extends Question {
  id: string
  categoryId: string
  type: 'text' | 'image' | 'video' | 'riddle' | 'choices'
  image?: string
  video?: string
  choices?: string[]
  isRiddle?: boolean
  points?: number
}

// الحصول على الأسئلة المعروضة من التخزين المحلي
function getSeenQuestions(): Record<string, string[]> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(SEEN_QUESTIONS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// حفظ الأسئلة المعروضة في التخزين المحلي
function saveSeenQuestions(seen: Record<string, string[]>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(seen))
  } catch {
    // تجاهل أخطاء التخزين
  }
}

// تسجيل سؤال كمعروض
export function markQuestionAsSeen(categoryId: string, questionId: string): void {
  const seen = getSeenQuestions()
  if (!seen[categoryId]) {
    seen[categoryId] = []
  }
  if (!seen[categoryId].includes(questionId)) {
    seen[categoryId].push(questionId)
    saveSeenQuestions(seen)
  }
}

// إعادة تعيين الأسئلة المعروضة لتصنيف معين
export function resetSeenQuestions(categoryId?: string): void {
  if (categoryId) {
    const seen = getSeenQuestions()
    delete seen[categoryId]
    saveSeenQuestions(seen)
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SEEN_QUESTIONS_KEY)
    }
  }
}

// خوارزمية خلط Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// دالة مساعدة للحصول على الأسئلة الديناميكية من الـ API
export async function getStaticQuestionsForCategory(categoryId: string): Promise<EnhancedQuestion[]> {
  try {
    const response = await fetch('/api/questions', { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) return []
    
    const allQuestions = await response.json()
    const filtered = allQuestions.filter((q: any) => q.categoryId === categoryId)
    
    return filtered.map((q: any, index: number) => ({
      ...q,
      id: q.id || `${categoryId}-${index}-${q.text.substring(0, 10)}`,
      categoryId: categoryId,
      text: q.text,
      answer: q.answer,
      choices: q.choices || [],
      image: q.mediaUrl,
      video: undefined,
      isRiddle: q.isRiddle || false,
      type: (q.isRiddle ? 'riddle' : q.mediaUrl ? 'image' : q.choices ? 'choices' : 'text') as any,
      points: q.points || 100
    }))
  } catch (error) {
    console.error('Error fetching dynamic questions:', error)
    return []
  }
}

// الحصول على أسئلة عشوائية مع تجنب التكرار - فلترة صارمة حسب التصنيف
// لا يوجد أي خلط بين التصنيفات - كل تصنيف يجلب أسئلته فقط
export function getRandomQuestions(
  categoryId: string, 
  count: number = 10,
  avoidSeen: boolean = true
): EnhancedQuestion[] {
  // جلب الأسئلة الخاصة بالتصنيف فقط - لا يوجد خلط بين التصنيفات
  const allQuestions = getQuestionsForCategory(categoryId)
  
  // إذا لم نجد أسئلة، نرجع مصفوفة فارغة
  if (allQuestions.length === 0) {
    return []
  }
  
  const seen = avoidSeen ? getSeenQuestions()[categoryId] || [] : []
  
  // تحويل الأسئلة إلى أسئلة محسنة مع IDs فريدة لكل تصنيف
  const enhancedQuestions: EnhancedQuestion[] = allQuestions.map((q, index) => ({
    ...q,
    id: `${categoryId}-${index}-${q.text.substring(0, 10)}`,
    categoryId: categoryId,
    type: q.isRiddle ? 'riddle' : q.image ? 'image' : q.video ? 'video' : q.choices ? 'choices' : 'text',
    isRiddle: q.isRiddle
  }))
  
  // فلترة الأسئلة المعروضة سابقاً
  let availableQuestions = enhancedQuestions.filter(q => !seen.includes(q.id))
  
  // إذا تم عرض كل الأسئلة، إعادة تعيين القائمة
  if (availableQuestions.length < count) {
    resetSeenQuestions(categoryId)
    availableQuestions = [...enhancedQuestions]
  }
  
  // خلط الأسئلة داخل نطاق هذا التصنيف فقط (Fisher-Yates)
  const shuffled = shuffleArray(availableQuestions)
  
  // إرجاع العدد المطلوب من أسئلة هذا التصنيف فقط
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// الحصول على سؤال واحد عشوائي غير مكرر
export function getRandomQuestion(categoryId: string): EnhancedQuestion | null {
  const questions = getRandomQuestions(categoryId, 1)
  return questions.length > 0 ? questions[0] : null
}

// الحصول على إحصائيات الأسئلة
export function getQuestionStats(categoryId: string): {
  total: number
  seen: number
  remaining: number
} {
  const allQuestions = getQuestionsForCategory(categoryId)
  const seen = getSeenQuestions()[categoryId] || []
  
  return {
    total: allQuestions.length,
    seen: seen.length,
    remaining: allQuestions.length - seen.length
  }
}

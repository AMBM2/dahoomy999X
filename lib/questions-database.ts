// =====================================================
// نظام توليد الأسئلة
// =====================================================
// 
// هذا الملف يستخدم الأسئلة من مجلد lib/questions/
// 
// لإضافة أسئلة جديدة:
// 1. افتح المجلد lib/questions/
// 2. اختر الملف المناسب للتصنيف
// 3. أضف سؤالك بالشكل:
//    { text: "نص السؤال؟", answer: "الجواب" }
//
// الملفات المتاحة:
// - football.ts = كرة القدم، كأس العالم، الدوري السعودي
// - math.ts = رياضيات، حساب، هندسة
// - quran.ts = قرآن، حديث، سيرة
// - capitals.ts = عواصم، خرائط، دول
// - flags.ts = أعلام الدول
// - animals.ts = حيوانات، طيور، أسماك
// - movies.ts = أفلام، مسلسلات، هوليوود
// - gaming.ts = ألعاب فيديو
// - general.ts = ثقافة عامة، معلومات عامة
// - saudi.ts = السعودية، الإمارات، الخليج
// =====================================================

import { getQuestionsForCategory, Question } from './questions'

export interface QuestionTemplate {
  text: string
  answer: string
}

// دالة لتوليد أسئلة لتصنيف معين
export function generateQuestions(categoryId: string, count: number = 100): QuestionTemplate[] {
  const questions = getQuestionsForCategory(categoryId)
  
  // خلط الأسئلة عشوائياً
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  
  // إرجاع العدد المطلوب
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// دالة للحصول على سؤال عشوائي
export function getRandomQuestion(categoryId: string): QuestionTemplate | null {
  const questions = getQuestionsForCategory(categoryId)
  if (questions.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * questions.length)
  return questions[randomIndex]
}

// دالة لعرض عدد الأسئلة في تصنيف
export function getQuestionCount(categoryId: string): number {
  return getQuestionsForCategory(categoryId).length
}

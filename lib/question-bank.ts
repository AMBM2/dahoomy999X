// =====================================================
// نظام إدارة التصنيفات والأسئلة - محدث
// =====================================================

import { getQuestionsForCategory, Question } from './questions'
import { getCategoryIcon, CategoryIconType } from './category-icons'
import { LucideIcon } from 'lucide-react'

export interface Category {
  id: string
  name: string
  icon: LucideIcon
  group: string
}

// مجموعات التصنيفات
export const categoryGroups = [
  { id: 'all', name: 'الكل' },
  { id: 'science', name: 'علوم' },
  { id: 'sports', name: 'رياضة' },
  { id: 'entertainment', name: 'ترفيه' },
  { id: 'geography', name: 'جغرافيا' },
  { id: 'religion', name: 'دين' },
  { id: 'food', name: 'طعام' },
  { id: 'tech', name: 'تقنية' },
  { id: 'arab', name: 'عربي' },
  { id: 'celebrities', name: 'مشاهير' },
  { id: 'puzzles', name: 'ألغاز' },
]

// قائمة التصنيفات مع الأيقونات SVG
export const categoriesList: Category[] = []

// دالة للحصول على أسئلة عشوائية لتصنيف معين
export function generateQuestions(categoryId: string, count: number = 100): Question[] {
  const questions = getQuestionsForCategory(categoryId)
  
  // خلط الأسئلة عشوائياً باستخدام Fisher-Yates
  const shuffled = [...questions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  // إرجاع العدد المطلوب
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// دالة للحصول على تصنيفات حسب المجموعة
export function getCategoriesByGroup(groupId: string): Category[] {
  if (groupId === 'all') return categoriesList
  return categoriesList.filter(cat => cat.group === groupId)
}

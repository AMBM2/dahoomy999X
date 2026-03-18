// =====================================================
// نظام إدارة البيانات الديناميكية
// Dynamic Categories and Questions Management
// =====================================================

import { Category } from './question-bank'
import { EnhancedQuestion } from './question-manager'

const DYNAMIC_CATEGORIES_KEY = 'dahoomy_custom_categories'
const DYNAMIC_QUESTIONS_KEY = 'dahoomy_custom_questions'

// ===== Categories =====

export interface DynamicCategory extends Omit<Category, 'icon'> {
  isDynamic?: boolean
  createdAt?: string
  iconName?: string  // Store icon name as string instead of component
  imageType?: "image" | "emoji"  // Track if it's image or emoji
  imageValue?: string  // The actual image URL or emoji
}

// Safe localStorage access
const getFromStorage = (key: string) => {
  if (typeof window === 'undefined') return null
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error reading from localStorage:`, error)
    return null
  }
}

const setToStorage = (key: string, data: any) => {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error(`Error writing to localStorage:`, error)
    return false
  }
}

export function getDynamicCategories(): DynamicCategory[] {
  const data = getFromStorage(DYNAMIC_CATEGORIES_KEY)
  return data || []
}

export function saveDynamicCategories(categories: DynamicCategory[]): void {
  setToStorage(DYNAMIC_CATEGORIES_KEY, categories)
}

export function addCategory(name: string, group: string = 'custom', iconName: string = 'Briefcase'): DynamicCategory {
  const newCategory: DynamicCategory = {
    id: `custom_${Date.now()}`,
    name,
    group,
    iconName,  // Store icon name as string for serialization
    isDynamic: true,
    createdAt: new Date().toISOString()
  }

  const categories = getDynamicCategories()
  categories.push(newCategory)
  saveDynamicCategories(categories)

  return newCategory
}

export function deleteCategory(categoryId: string): boolean {
  const categories = getDynamicCategories()
  const filtered = categories.filter(cat => cat.id !== categoryId)
  
  if (filtered.length < categories.length) {
    saveDynamicCategories(filtered)
    deleteQuestionsInCategory(categoryId)
    return true
  }
  return false
}

// ===== Questions =====

export interface DynamicQuestion extends EnhancedQuestion {
  isDynamic?: boolean
  createdAt?: string
}

export function getDynamicQuestions(): DynamicQuestion[] {
  const data = getFromStorage(DYNAMIC_QUESTIONS_KEY)
  return data || []
}

export function saveDynamicQuestions(questions: DynamicQuestion[]): void {
  setToStorage(DYNAMIC_QUESTIONS_KEY, questions)
}

export function addQuestion(
  categoryId: string,
  text: string,
  answer: string,
  type: 'text' | 'image' | 'video' | 'riddle' | 'choices' = 'text',
  options?: {
    choices?: string[]
    image?: string
    video?: string
    points?: number
  }
): DynamicQuestion {
  const newQuestion: DynamicQuestion = {
    id: `q_${Date.now()}`,
    categoryId,
    text,
    answer,
    type,
    choices: options?.choices,
    image: options?.image,
    video: options?.video,
    points: options?.points || 100,
    isDynamic: true,
    createdAt: new Date().toISOString()
  }

  const questions = getDynamicQuestions()
  questions.push(newQuestion)
  saveDynamicQuestions(questions)

  return newQuestion
}

export function deleteQuestion(questionId: string): boolean {
  const questions = getDynamicQuestions()
  const filtered = questions.filter(q => q.id !== questionId)
  
  if (filtered.length < questions.length) {
    saveDynamicQuestions(filtered)
    return true
  }
  return false
}

export function deleteQuestionsInCategory(categoryId: string): void {
  const questions = getDynamicQuestions()
  const filtered = questions.filter(q => q.categoryId !== categoryId)
  saveDynamicQuestions(filtered)
}

export function getQuestionsForDynamicCategory(categoryId: string): DynamicQuestion[] {
  const questions = getDynamicQuestions()
  return questions.filter(q => q.categoryId === categoryId)
}

export function updateQuestion(
  questionId: string,
  updates: Partial<DynamicQuestion>
): DynamicQuestion | null {
  const questions = getDynamicQuestions()
  const index = questions.findIndex(q => q.id === questionId)
  
  if (index !== -1) {
    questions[index] = { ...questions[index], ...updates }
    saveDynamicQuestions(questions)
    return questions[index]
  }
  return null
}

export function clearAllDynamicData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DYNAMIC_CATEGORIES_KEY)
  localStorage.removeItem(DYNAMIC_QUESTIONS_KEY)
}

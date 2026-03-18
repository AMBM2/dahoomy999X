// =====================================================
// Enhanced Multimodal Quiz Platform Schema (2026)
// =====================================================

/**
 * Modern Category Structure with Infographic Support
 */
export interface ModernCategory {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  group: string
  
  // Infographic & Visual
  icon: {
    type: 'svg' | 'image' | 'gradient'
    svgContent?: string  // Inline SVG for quick loading
    imageUrl?: string
    colorPrimary: string  // Neon color for this category
    colorSecondary: string
    gradientStops?: string[]  // For gradient backgrounds
  }
  
  // Category Metadata
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  tags: string[]
  questionCount: number
  averageCompletionTime: number  // in seconds
  
  // Statistics
  stats: {
    totalAttempts: number
    averageScore: number
    easiestQuestion: string
    hardestQuestion: string
  }
}

/**
 * Enhanced Question with Multimodal Support
 */
export interface ModernQuestion {
  id: string
  categoryId: string
  
  // Basic Content
  type: 'text' | 'image' | 'video' | 'riddle' | 'matching' | 'ordering'
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  points: number
  
  // Text Content
  question: string
  questionAr: string  // Arabic version
  
  // Answer
  answer: string
  answerAr: string
  correctAnswerIndex?: number  // For MCQ
  
  // MCQ Choices
  choices?: string[]
  choicesAr?: string[]  // Arabic translations
  
  // Image Support
  imagePrompt?: {
    description: string  // For AI generation
    imageUrl?: string
    imageCaption?: string
    imageAlt?: string
  }
  
  // Video Support
  videoData?: {
    videoUrl: string
    duration: number  // seconds
    startTime: number  // Timestamp where question appears
    endTime: number
    caption?: string
    isYoutube: boolean  // Is it a YouTube video or local
  }
  
  // Advanced Question Types
  matchingPairs?: Array<{ left: string; right: string }>  // For matching questions
  orderingSequence?: string[]  // For ordering questions
  
  // Metadata
  tags: string[]
  source?: string  // Citation source
  explanationText?: string
  explanationVideoUrl?: string
  
  // Statistics
  stats: {
    totalAttempts: number
    correctAnswers: number
    averageTimeSpent: number  // seconds
    difficultyIndex: number  // 0-1 indicating how many get it wrong
  }
  
  // Timestamps
  createdAt: string
  updatedAt: string
  createdBy: string
}

/**
 * Question Bank Structure
 */
export interface QuestionBank {
  categoryId: string
  categoryName: string
  totalQuestions: number
  questions: ModernQuestion[]
  generatedAt: string
  version: string
}

// =====================================================
// نظام الأسئلة - ملف التجميع الرئيسي
// =====================================================
// 
// كيفية إضافة سؤال جديد:
// 1. افتح ملف التصنيف المناسب (مثال: football.ts لكرة القدم)
// 2. أضف السؤال في المصفوفة بالشكل التالي:
//    { text: "نص السؤال؟", answer: "الجواب" }
// 
// أنواع الأسئلة المدعومة:
// - سؤال نصي: { text: "السؤال", answer: "الجواب" }
// - سؤال مع صورة: { text: "السؤال", answer: "الجواب", image: "/images/question.jpg" }
// - سؤال اختيارات: { text: "السؤال", answer: "الجواب", choices: ["خيار1", "خيار2", "خيار3", "خيار4"] }
// - لغز: { text: "اللغز", answer: "الجواب", isRiddle: true }
// 
// =====================================================

import { footballQuestions } from './football'
import { mathQuestions } from './math'
import { quranQuestions } from './quran'
import { capitalsQuestions } from './capitals'
import { flagsQuestions } from './flags'
import { animalsQuestions } from './animals'
import { moviesQuestions } from './movies'
import { gamingQuestions } from './gaming'
import { generalQuestions } from './general'
import { saudiQuestions } from './saudi'
import { geologyQuestions } from './geology'
import { astronomyQuestions } from './astronomy'
import { biologyQuestions } from './biology'
import { physicsQuestions } from './physics'
import { chemistryQuestions } from './chemistry'
import { historyQuestions } from './history'
import { arabMoviesQuestions } from './arab-movies'
import { riddlesQuestions } from './riddles'
import { riversQuestions } from './rivers'
import { mountainsQuestions } from './mountains'
import { oceansQuestions } from './oceans'
import { desertsQuestions } from './deserts'
import { mapsQuestions } from './maps'

// واجهة السؤال المحسنة
export interface Question {
  text: string
  answer: string
  image?: string
  video?: string
  choices?: string[]
  isRiddle?: boolean
  points?: number
}

// كل تصنيف له أسئلته الخاصة فقط - لا يوجد خلط
export const questionsByCategory: Record<string, Question[]> = {
  // ===== العلوم - كل تصنيف منفصل =====
  'math': mathQuestions,
  'physics': physicsQuestions,
  'chemistry': chemistryQuestions,
  'biology': biologyQuestions,
  'astronomy': astronomyQuestions,
  'geology': geologyQuestions,
  'medicine': biologyQuestions,
  'anatomy': biologyQuestions,
  'psychology': generalQuestions,
  'philosophy': generalQuestions,
  
  // ===== كرة القدم =====
  'football': footballQuestions,
  'world-cup': footballQuestions,
  'saudi-league': footballQuestions,
  'premier-league': footballQuestions,
  'champions-league': footballQuestions,
  'footballers': footballQuestions,
  'arab-sports': footballQuestions,
  'basketball': footballQuestions,
  'tennis': footballQuestions,
  'swimming': footballQuestions,
  'athletics': footballQuestions,
  'olympics': footballQuestions,
  'mma': footballQuestions,
  'f1': footballQuestions,
  'horse-racing': footballQuestions,
  
  // ===== دين وإسلام =====
  'quran': quranQuestions,
  'hadith': quranQuestions,
  'seerah': quranQuestions,
  'prophets': quranQuestions,
  'fiqh': quranQuestions,
  'aqeedah': quranQuestions,
  'prayers': quranQuestions,
  'ramadan': quranQuestions,
  'hajj': quranQuestions,
  'companions': quranQuestions,
  'scholars': quranQuestions,
  'islamic-history': historyQuestions,
  
  // ===== جغرافيا - كل تصنيف له أسئلته الخاصة =====
  'capitals': capitalsQuestions,
  'flags': flagsQuestions,
  'maps': mapsQuestions,
  'arab-countries': capitalsQuestions,
  'european-countries': capitalsQuestions,
  'asian-countries': capitalsQuestions,
  'african-countries': capitalsQuestions,
  'american-countries': capitalsQuestions,
  'rivers': riversQuestions,
  'mountains': mountainsQuestions,
  'deserts': desertsQuestions,
  'oceans': oceansQuestions,
  'islands': mapsQuestions,
  
  // ===== تاريخ =====
  'arab-history': historyQuestions,
  'world-history': historyQuestions,
  'ancient-history': historyQuestions,
  'modern-history': historyQuestions,
  'wars': historyQuestions,
  'civilizations': historyQuestions,
  
  // ===== حيوانات =====
  'animals': animalsQuestions,
  'birds': animalsQuestions,
  'fish': animalsQuestions,
  'mammals': animalsQuestions,
  'insects': animalsQuestions,
  'reptiles': animalsQuestions,
  'marine': animalsQuestions,
  'dinosaurs': animalsQuestions,
  'endangered': animalsQuestions,
  'plants': animalsQuestions,
  'flowers': animalsQuestions,
  'trees': animalsQuestions,
  
  // ===== ترفيه =====
  'movies': moviesQuestions,
  'arab-movies': arabMoviesQuestions,
  'hollywood': moviesQuestions,
  'series': moviesQuestions,
  'arab-series': arabMoviesQuestions,
  'anime': moviesQuestions,
  'cartoons': moviesQuestions,
  'music': moviesQuestions,
  'arab-music': arabMoviesQuestions,
  'western-music': moviesQuestions,
  'instruments': moviesQuestions,
  'art': generalQuestions,
  'photography': generalQuestions,
  'theater': moviesQuestions,
  
  // ===== ألعاب فيديو وتقنية =====
  'gaming': gamingQuestions,
  'computers': gamingQuestions,
  'programming': gamingQuestions,
  'internet': gamingQuestions,
  'social-media': gamingQuestions,
  'mobile': gamingQuestions,
  'ai': gamingQuestions,
  'space-tech': astronomyQuestions,
  'robots': gamingQuestions,
  'crypto': gamingQuestions,
  
  // ===== دول خليجية وعربية =====
  'saudi': saudiQuestions,
  'uae': saudiQuestions,
  'kuwait': saudiQuestions,
  'qatar': saudiQuestions,
  'bahrain': saudiQuestions,
  'oman': saudiQuestions,
  'gulf-culture': saudiQuestions,
  'gulf-traditions': saudiQuestions,
  'gulf-dialect': saudiQuestions,
  'egypt': saudiQuestions,
  'jordan': saudiQuestions,
  'lebanon': saudiQuestions,
  'syria': saudiQuestions,
  'palestine': saudiQuestions,
  'iraq': saudiQuestions,
  'morocco': saudiQuestions,
  'algeria': saudiQuestions,
  'tunisia': saudiQuestions,
  
  // ===== طعام =====
  'arab-food': saudiQuestions,
  'gulf-food': saudiQuestions,
  'world-food': generalQuestions,
  'desserts': generalQuestions,
  'arab-sweets': saudiQuestions,
  'drinks': generalQuestions,
  'coffee': saudiQuestions,
  'fruits': generalQuestions,
  'vegetables': generalQuestions,
  'spices': generalQuestions,
  'cooking': generalQuestions,
  'restaurants': generalQuestions,
  
  // ===== ثقافة عامة =====
  'general-knowledge': generalQuestions,
  'trivia': generalQuestions,
  
  // ===== ألغاز =====
  'riddles': riddlesQuestions,
  'brain-teasers': riddlesQuestions,
  'guess-who': riddlesQuestions,
  'complete-sentence': riddlesQuestions,
  'guess-song': riddlesQuestions,
  'guess-movie': riddlesQuestions,
  'emojis': riddlesQuestions,
  'focus': riddlesQuestions,
  'memory': riddlesQuestions,
  'video-focus': riddlesQuestions,
  
  // ===== لغة وأدب =====
  'arabic-language': generalQuestions,
  'poetry': generalQuestions,
  'proverbs': generalQuestions,
  'idioms': generalQuestions,
  'grammar': generalQuestions,
  'english': generalQuestions,
  'french': generalQuestions,
  'novels': generalQuestions,
  'arab-literature': generalQuestions,
  'world-literature': generalQuestions,
  
  // ===== مشاهير =====
  'arab-celebrities': arabMoviesQuestions,
  'arab-singers': arabMoviesQuestions,
  'arab-actors': arabMoviesQuestions,
  'hollywood-stars': moviesQuestions,
  'youtubers': gamingQuestions,
  'influencers': gamingQuestions,
  'scientists': generalQuestions,
  'inventors': generalQuestions,
  'leaders': historyQuestions,
  'writers': generalQuestions,
}

// دالة للحصول على أسئلة تصنيف معين - فلترة صارمة بدون fallback
export function getQuestionsForCategory(categoryId: string): Question[] {
  // البحث المباشر في الخريطة - بدون أي fallback
  const questions = questionsByCategory[categoryId]
  
  // إذا لم نجد أسئلة، نرجع مصفوفة فارغة - لا نخلط أبداً
  if (!questions || questions.length === 0) {
    return []
  }
  
  // نسخ المصفوفة لتجنب التعديل على الأصل
  return [...questions]
}

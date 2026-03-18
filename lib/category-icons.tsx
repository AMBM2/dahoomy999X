// =====================================================
// Professional Blue Icons System - نظام الأيقونات الاحترافي الأزرق
// =====================================================

import {
  Calculator, Atom, Beaker, Dna, Star, Mountain, Pill, Heart, Brain, BookOpen,
  Map, Building2, Flag, Waves, Wind, Palmtree, Globe, Landmark, Building,
  BookMarked, Scroll, Gavel, Sparkles, Moon, Hand, Flame, Trophy, Circle,
  Disc3, Gamepad2, Film, Tv, Clapperboard, Music, Mic, Radio, Book, PenTool,
  Palette, Camera, Code, Lock, Cpu, Smartphone, Bot, Database, Wifi,
  Utensils, Apple, Leaf, Coffee, Wine, Lightbulb, Trees, Cloud, Zap, Users,
  GraduationCap, ScrollText, LucideIcon, Video, Wrench, Car, Shield, ListChecks
} from 'lucide-react'

// Professional Icon Type
export type CategoryIconType = LucideIcon

// الألوان الزرقاء الموحدة
const BLUE_COLOR = '#00A8E8'
const DARK_BLUE = '#004399'
const LIGHT_BLUE = '#00D9FF'

/**
 * نظام أيقونات احترافي موحد بألوان زرقاء
 */
export const categoryIcons: Record<string, LucideIcon> = {
  // علوم - Science
  'math': Calculator,
  'physics': Atom,
  'chemistry': Beaker,
  'biology': Dna,
  'astronomy': Star,
  'geology': Mountain,
  'medicine': Pill,
  'anatomy': Heart,
  'psychology': Brain,
  'philosophy': BookOpen,
  
  // جغرافيا - Geography
  'maps': Map,
  'capitals': Building2,
  'flags': Flag,
  'rivers': Waves,
  'mountains': Mountain,
  'deserts': Wind,
  'oceans': Waves,
  'islands': Palmtree,
  'arab-countries': Globe,
  'european-countries': Globe,
  'asian-countries': Globe,
  'african-countries': Globe,
  'american-countries': Globe,
  
  // تاريخ - History
  'islamic-history': Landmark,
  'arab-history': Building,
  'world-history': BookMarked,
  'ancient-history': Scroll,
  'modern-history': BookOpen,
  'wars': Zap,
  'civilizations': Building,
  'prophets': Lightbulb,
  'companions': Users,
  'scholars': GraduationCap,
  
  // دين - Religion
  'quran': BookMarked,
  'hadith': ScrollText,
  'fiqh': Gavel,
  'aqeedah': Sparkles,
  'seerah': Moon,
  'prayers': Hand,
  'ramadan': Flame,
  'hajj': Landmark,
  'zakat': Zap,
  'charity': Heart,
  
  // رياضة - Sports
  'football': Trophy,
  'basketball': Circle,
  'tennis': Circle,
  'volleyball': Circle,
  'swimming': Waves,
  'athletics': Zap,
  'cycling': Disc3,
  'motorsports': Trophy,
  'world-cup': Trophy,
  'olympics': Trophy,
  'cricket': Circle,
  'badminton': Circle,
  'table-tennis': Circle,
  'hockey': Zap,
  'golf': Circle,
  'boxing': Zap,
  'wrestling': Zap,
  'martial-arts': Zap,
  'arab-sports': Trophy,
  'saudi-league': Trophy,
  'premier-league': Trophy,
  'champions-league': Trophy,
  
  // ترفيه - Entertainment
  'movies': Film,
  'series': Tv,
  'drama': Clapperboard,
  'music': Music,
  'celebrities': Mic,
  'award-shows': Trophy,
  'anime': Tv,
  'cartoons': Tv,
  'stand-up': Mic,
  'podcasts': Radio,
  
  // تعليم - Education
  'literature': BookOpen,
  'writing': PenTool,
  'languages': BookOpen,
  'grammar': PenTool,
  'vocabulary': BookOpen,
  'reading': Book,
  'poetry': Book,
  'storytelling': BookOpen,
  
  // فنون - Arts
  'painting': Palette,
  'sculpture': Palette,
  'photography': Camera,
  'design': Palette,
  'architecture': Building,
  'crafts': Palette,
  'ceramics': Palette,
  'jewelry': Sparkles,
  'art': Palette,
  
  // تكنولوجيا - Technology
  'computers': Cpu,
  'programming': Code,
  'cybersecurity': Lock,
  'algorithms': Code,
  'web-development': Code,
  'mobile-apps': Smartphone,
  'artificial-intelligence': Bot,
  'databases': Database,
  'networking': Wifi,
  'cloud-computing': Cloud,
  
  // طعام - Food
  'food': Utensils,
  'fruits': Apple,
  'vegetables': Leaf,
  'coffee': Coffee,
  'drinks': Wine,
  'baking': Utensils,
  'healthy-eating': Leaf,
  'international-cuisine': Utensils,
  'desserts': Apple,
  'recipes': Utensils,
  
  // ألعاب - Games
  'board-games': Circle,
  'card-games': Circle,
  'chess': Circle,
  'video-games': Gamepad2,
  'online-games': Wifi,
  'mobile-games': Smartphone,
  'word-games': BookOpen,
  'trivia': Lightbulb,
  'puzzle-games': Circle,
  'strategy-games': Circle,
  
  // صحة - Health
  'fitness': Heart,
  'nutrition': Apple,
  'mental-health': Brain,
  'diseases': Pill,
  'first-aid': Heart,
  'wellness': Leaf,
  'exercise': Zap,
  'sleep': Moon,
  'stress-management': Brain,
  'medical-advances': Pill,
  
  // عام - General
  'default': Lightbulb,
  'general-knowledge': BookOpen,

  // ===== Custom cat-* ids (مشروعك الحالي) =====
  // أيقونات حسب اسم/نوع التصنيف
  'cat-math': Calculator,
  'cat-minecraft': Gamepad2,
  'cat-choices': ListChecks,
  'cat-memory': Brain,
  'cat-focus': Zap,
  'cat-logos': Palette,
  'cat-emoji': Sparkles,
  'cat-two-words': Mic,
  'cat-fix-error': Wrench,
  'cat-who-am-i': Users,
  'cat-scrambled-letters': BookOpen,
  'cat-flags': Flag,
  'cat-passports': ScrollText,
  'cat-quran': BookMarked,
  'cat-country-logos': Globe,
  'cat-cars': Car,
  'cat-maps': Map,
  'cat-general': Lightbulb,
  'cat-languages': BookOpen,
  'cat-killer': Shield,
  'cat-team-power': Zap,
  'cat-video-games': Gamepad2,
}

/**
 * احصل على أيقونة احترافية زرقاء موحدة
 * @param categoryId معرف التصنيف
 * @returns مكون أيقونة Lucide
 */
export const getCategoryIcon = (categoryId: string): LucideIcon => {
  return categoryIcons[categoryId] || Lightbulb
}

/**
 * احصل على لون الأيقونة الأزرق الموحد
 */
export const getIconColor = (): string => BLUE_COLOR

/**
 * احصل على حجم الأيقونة الموحد
 */
export const getIconSize = (): number => 48

/**
 * دالة تحويل الأيقونة مع اللون الأزرق الموحد
 */
export const getProfessionalIcon = getCategoryIcon


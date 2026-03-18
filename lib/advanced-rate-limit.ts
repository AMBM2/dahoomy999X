import { type NextRequest } from 'next/server'

/**
 * أنواع الحدود - تصنيفات مختلفة للـ endpoints
 */
type RateLimitTier = 'auth' | 'api' | 'admin' | 'public'

/**
 * إعدادات الحد للتصنيف المختلفة
 */
const rateLimitConfig: Record<RateLimitTier, { limit: number; windowMs: number }> = {
  auth: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 طلبات / 15 دقيقة
  api: { limit: 30, windowMs: 60 * 1000 }, // 30 طلب / دقيقة
  admin: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 طلبات / ساعة
  public: { limit: 100, windowMs: 60 * 1000 }, // 100 طلب / دقيقة
}

/**
 * متجر الحدود - في الإنتاج استخدم Redis
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number; blocked?: boolean }>()

/**
 * فحص الحد مع التصنيف
 */
export function checkRateLimit(
  req: any,
  tier: RateLimitTier = 'api'
): { allowed: boolean; remaining: number; resetIn?: number; blocked?: boolean } {
  const { getClientIP } = require('./security')
  const ip = getClientIP(req)
  const config = rateLimitConfig[tier]
  const now = Date.now()
  const key = `${ip}:${tier}`
  
  const record = rateLimitStore.get(key)
  
  // إذا كان محظور - رفع الحد الزمني
  if (record?.blocked && now < record.resetTime) {
    return {
      allowed: false,
      remaining: 0,
      blocked: true,
      resetIn: Math.ceil((record.resetTime - now) / 1000),
    }
  }
  
  // فتح الحظر انتهاء الفترة
  if (!record || now > record.resetTime) {
    const newRecord = {
      count: 1,
      resetTime: now + config.windowMs,
      blocked: false,
    }
    rateLimitStore.set(key, newRecord)
    return { allowed: true, remaining: config.limit - 1 }
  }
  
  // تجاوز الحد؟
  if (record.count >= config.limit) {
    record.blocked = true
    record.resetTime = now + config.windowMs * 2 // احجز الضعف للمخالفين
    return {
      allowed: false,
      remaining: 0,
      blocked: true,
      resetIn: Math.ceil((record.resetTime - now) / 1000),
    }
  }
  
  // زيادة العداد
  record.count++
  return {
    allowed: true,
    remaining: config.limit - record.count,
    resetIn: Math.ceil((record.resetTime - now) / 1000),
  }
}

/**
 * الحصول على معلومات الحد
 */
export function getRateLimitInfo(ip: string, tier: RateLimitTier): {
  count: number
  limit: number
  resetIn: number
} {
  const config = rateLimitConfig[tier]
  const key = `${ip}:${tier}`
  const record = rateLimitStore.get(key)
  const now = Date.now()
  
  return {
    count: record?.count || 0,
    limit: config.limit,
    resetIn: record ? Math.max(0, Math.ceil((record.resetTime - now) / 1000)) : 0,
  }
}

/**
 * إعادة تعيين الحد للـ IP
 */
export function resetRateLimit(ip: string, tier?: RateLimitTier): void {
  if (tier) {
    const key = `${ip}:${tier}`
    rateLimitStore.delete(key)
  } else {
    // حذف جميع entries للـ IP هذا
    for (const key of rateLimitStore.keys()) {
      if (key.startsWith(`${ip}:`)) {
        rateLimitStore.delete(key)
      }
    }
  }
}

/**
 * قائمة الـ IPs المحظورة
 */
const blacklistedIPs = new Set<string>()

/**
 * إضافة IP إلى قائمة الحظر
 */
export function blockIP(ip: string, durationMs: number = 60 * 60 * 1000): void {
  blacklistedIPs.add(ip)
  
  // حذف من قائمة الحظر بعد المدة المحددة
  setTimeout(() => {
    blacklistedIPs.delete(ip)
  }, durationMs)
}

/**
 * التحقق من الـ IP المحظور
 */
export function isIPBlocked(ip: string): boolean {
  return blacklistedIPs.has(ip)
}

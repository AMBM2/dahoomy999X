/**
 * CSRF Token Store - في الإنتاج استخدم Redis
 */
const csrfTokenStore = new Map<string, { token: string; expiresAt: number }>()

/**
 * توليد CSRF token
 */
export function generateCSRFToken(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

/**
 * حفظ CSRF token للجلسة
 */
export function storeCSRFToken(sessionId: string): string {
  const token = generateCSRFToken()
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 ساعة
  
  csrfTokenStore.set(sessionId, { token, expiresAt })
  
  // تنظيف الـ tokens المنتهية الصلاحية
  cleanExpiredTokens()
  
  return token
}

/**
 * التحقق من CSRF token
 */
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const crypto = require('crypto')
  const stored = csrfTokenStore.get(sessionId)
  
  if (!stored) {
    return false
  }
  
  // التحقق من الصلاحية
  if (Date.now() > stored.expiresAt) {
    csrfTokenStore.delete(sessionId)
    return false
  }
  
  // استخدام مقارنة آمنة ضد timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(stored.token),
      Buffer.from(token)
    )
  } catch {
    return false
  }
}

/**
 * حذف CSRF token بعد الاستخدام
 */
export function consumeCSRFToken(sessionId: string): void {
  csrfTokenStore.delete(sessionId)
}

/**
 * تنظيف الـ tokens المنتهية الصلاحية
 */
function cleanExpiredTokens(): void {
  const now = Date.now()
  
  for (const [sessionId, data] of csrfTokenStore.entries()) {
    if (now > data.expiresAt) {
      csrfTokenStore.delete(sessionId)
    }
  }
}

/**
 * استخراج CSRF token من الطلب
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  const header = request.headers.get('x-csrf-token')
  if (header) return header
  
  // للـ POST requests
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    // يمكن أيضاً من body لـ forms
    return null
  }
  
  return null
}

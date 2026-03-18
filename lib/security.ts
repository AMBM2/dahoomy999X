import { type NextRequest, NextResponse } from 'next/server'
import { verifyCSRFToken, consumeCSRFToken } from './csrf-server'
import { checkRateLimit } from './advanced-rate-limit'
import { logSecurityEvent } from './request-logger'

/**
 * الحصول على IP من الطلب بشكل آمن
 */
export function getClientIP(request: any): string {
  // تجربة الحصول من headers المختلفة
  if (request && typeof request.headers === 'object' && request.headers.get) {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) return forwarded.split(',')[0].trim()
    
    const realIP = request.headers.get('x-real-ip')
    if (realIP) return realIP
    
    // محاولة الحصول من request.ip
    if (request.ip) return request.ip
  }
  
  return 'unknown'
}

/**
 * Middleware للتحقق من CSRF
 */
export async function verifyCsrfMiddleware(
  request: NextRequest,
  sessionId: string
): Promise<{ valid: boolean; error?: string }> {
  // طلبات GET, HEAD, OPTIONS آمنة بطبيعتها
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return { valid: true }
  }
  
  // الحصول على token من الرؤوس أو الـ body
  let csrfToken = request.headers.get('x-csrf-token')
  
  if (!csrfToken && request.method === 'POST') {
    try {
      const body = await request.clone().json()
      csrfToken = body._csrf || body.csrfToken
    } catch (error) {
      // قد تكون الـ body ليست JSON
    }
  }
  
  if (!csrfToken) {
    return { valid: false, error: 'CSRF token missing' }
  }
  
  // التحقق من الـ token
  const valid = verifyCSRFToken(sessionId, csrfToken)
  
  if (valid) {
    // استهلاك الـ token بعد الاستخدام الناجح
    consumeCSRFToken(sessionId)
  }
  
  return { valid, error: valid ? undefined : 'CSRF token invalid' }
}

/**
 * Middleware لـ rate limiting مع الردود
 */
export function createRateLimitMiddleware(tier: 'auth' | 'api' | 'admin' | 'public' = 'api') {
  return (req: NextRequest) => {
    const { allowed, remaining, blocked, resetIn } = checkRateLimit(req, tier)
    
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    response.headers.set('X-RateLimit-Tier', tier)
    
    if (resetIn) {
      response.headers.set('Retry-After', String(resetIn))
    }
    
    if (!allowed) {
      const ip = getClientIP(req)
      
      logSecurityEvent({
        timestamp: new Date(),
        ip,
        endpoint: req.nextUrl.pathname,
        method: req.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
        status: 429,
        reason: `Rate limit exceeded (${tier})${blocked ? ' - IP blocked' : ''}`,
        severity: blocked ? 'high' : 'medium',
      })
      
      return NextResponse.json(
        { error: 'Too many requests', resetIn },
        { status: 429 }
      )
    }
    
    return response
  }
}

/**
 * التحقق من صيغة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * التحقق من URL لمنع open redirect
 */
export function isValidRedirectUrl(url: string, baseUrl: string): boolean {
  try {
    const parsed = new URL(url, baseUrl)
    return parsed.origin === new URL(baseUrl).origin
  } catch {
    return false
  }
}

/**
 * إخفاء بيانات الـ logs
 */
export function sanitizeLogData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }
  
  const sanitized = { ...data }
  const sensitiveFields = ['password', 'token', 'secret', 'api_key', 'apiKey', 'accessToken']
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***'
    }
  }
  
  return sanitized
}

/**
 * تنظيف وتحقق من نص
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/[<>\"'`]/g, (char) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
      }
      return map[char] || char
    })
    .trim()
}

/**
 * Check if user is admin
 */
export function isAdmin(userId: string): boolean {
  const adminIds = (process.env.NEXT_PUBLIC_ADMIN_DISCORD_ID || '').split(',').map(id => id.trim())
  return adminIds.includes(userId)
}

/**
 * Validate input object against schema
 */
export function validateSchema(data: any, schema: Record<string, (val: any) => boolean>): boolean {
  for (const [key, validator] of Object.entries(schema)) {
    if (!validator(data[key])) {
      return false
    }
  }
  return true
}

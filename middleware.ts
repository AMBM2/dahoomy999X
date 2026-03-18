import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { checkRateLimit, isIPBlocked } from '@/lib/advanced-rate-limit'
import { logSecurityEvent } from '@/lib/request-logger'
import { getClientIP } from '@/lib/security'

export function middleware(request: NextRequest) {
  const ip = getClientIP(request)
  const path = request.nextUrl.pathname
  
  // Bypass rate limiting for next-auth internal endpoints during development
  const isNextAuthInternal = 
    path === '/api/auth/session' ||
    path === '/api/auth/csrf' ||
    path === '/api/auth/providers' ||
    path === '/api/auth/callback/discord' ||
    path.startsWith('/api/auth/signin')
  
  // كشف IP المحظور
  if (isIPBlocked(ip) && !isNextAuthInternal) {
    logSecurityEvent({
      timestamp: new Date(),
      ip,
      endpoint: path,
      method: request.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
      status: 403,
      reason: 'IP is blacklisted',
      severity: 'high',
    })
    
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }
  
  // تحديد مستوى الحد بناءً على المسار
  let rateLimitTier: 'auth' | 'api' | 'admin' | 'public' = 'public'
  if (path.includes('/api/auth')) {
    rateLimitTier = 'auth'
  } else if (path.includes('/api/admin')) {
    rateLimitTier = 'admin'
  } else if (path.includes('/api/')) {
    rateLimitTier = 'api'
  }
  
  // Skip rate limiting for next-auth internal endpoints
  let { allowed, remaining, blocked, resetIn } = { allowed: true, remaining: 999, blocked: false, resetIn: undefined }
  if (!isNextAuthInternal) {
    const result = checkRateLimit(request, rateLimitTier)
    allowed = result.allowed
    remaining = result.remaining
    blocked = result.blocked
    resetIn = result.resetIn
  }
  
  if (!allowed) {
    logSecurityEvent({
      timestamp: new Date(),
      ip,
      endpoint: path,
      method: request.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
      status: 429,
      reason: `Rate limit exceeded (${rateLimitTier})`,
      severity: blocked ? 'high' : 'low',
    })
    
    const response = NextResponse.json(
      { 
        error: 'Too many requests',
        resetIn,
      },
      { status: 429 }
    )
    
    response.headers.set('Retry-After', String(resetIn || 60))
    return response
  }
  
  // المتابعة مع إضافة رؤوس الأمان
  const response = NextResponse.next()
  
  // رؤوس الأمان الأساسية
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.vercel-insights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' cdn.discordapp.com discordapp.com; frame-ancestors 'none';"
  )
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  // رؤوس لمعلومات الحد
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Tier', rateLimitTier)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateCSRFToken, storeCSRFToken } from '@/lib/csrf-server'
import { checkRateLimit } from '@/lib/advanced-rate-limit'
import { logSecurityEvent } from '@/lib/request-logger'
import { getClientIP } from '@/lib/security'

/**
 * GET /api/csrf-token
 * الحصول على CSRF token جديد
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const ip = getClientIP(request)
    
    // التحقق من المصادقة
    if (!session?.user?.id) {
      logSecurityEvent({
        timestamp: new Date(),
        ip,
        endpoint: '/api/csrf-token',
        method: 'GET',
        status: 401,
        reason: 'Unauthenticated CSRF request',
        severity: 'low',
      })
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // فحص الحد
    const { allowed } = checkRateLimit(request, 'public')
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    // توليد وحفظ token
    const token = storeCSRFToken(session.user.id)
    
    // إرسال الـ token
    const response = NextResponse.json({
      token,
      expiresIn: 24 * 60 * 60, // 24 ساعة
    })
    
    // تعيين cookie آمن (اختياري - للكشف عن CSRF)
    response.cookies.set({
      name: 'XSRF-TOKEN',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
    })
    
    return response
  } catch (error) {
    console.error('Error generating CSRF token:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

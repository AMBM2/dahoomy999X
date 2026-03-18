import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin, getClientIP } from '@/lib/security'
import { 
  checkRateLimit, 
  isIPBlocked 
} from '@/lib/advanced-rate-limit'
import { 
  logSecurityEvent, 
  getSecurityLogs,
  getSecurityStats,
  detectSuspiciousPatterns 
} from '@/lib/request-logger'
import { verifyCSRFToken } from '@/lib/csrf'

/**
 * GET /api/admin/security/logs
 * الحصول على سجلات الأمان
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // التحقق من المصادقة والصلاحيات
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // فحص الحد
    const ip = getClientIP(request as any)
    const { allowed } = checkRateLimit(request, 'admin')
    
    if (!allowed) {
      logSecurityEvent({
        timestamp: new Date(),
        ip,
        endpoint: '/api/admin/security/logs',
        method: 'GET',
        status: 429,
        userId: session.user.id,
        reason: 'Rate limit exceeded for admin',
        severity: 'medium',
      })
      
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    // الحصول على المعاملات من query
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000)
    const severity = url.searchParams.get('severity') as any
    
    // جلب السجلات
    const logs = getSecurityLogs({ limit, severity })
    const stats = getSecurityStats()
    const patterns = detectSuspiciousPatterns()
    
    return NextResponse.json({
      logs,
      stats,
      suspiciousPatterns: patterns,
    })
  } catch (error) {
    console.error('Error fetching security logs:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

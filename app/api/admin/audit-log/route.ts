import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/security'
import { getClientIP } from '@/lib/security'
import { 
  checkRateLimit, 
  resetRateLimit,
  blockIP 
} from '@/lib/advanced-rate-limit'
import { 
  logSecurityEvent, 
  getAuditLogs,
  logAdminAction
} from '@/lib/request-logger'
import { validateInput, ValidationSchemas } from '@/lib/advanced-validation'

/**
 * GET /api/admin/audit-log
 * الحصول على سجلات الأدمن
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const ip = getClientIP(request)
    
    // التحقق من المصادقة والصلاحيات
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      logSecurityEvent({
        timestamp: new Date(),
        ip,
        endpoint: '/api/admin/audit-log',
        method: 'GET',
        status: 403,
        reason: 'Unauthorized access attempt to audit logs',
        severity: 'high',
      })
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // فحص الحد
    const { allowed } = checkRateLimit(request, 'admin')
    
    if (!allowed) {
      logSecurityEvent({
        timestamp: new Date(),
        ip,
        endpoint: '/api/admin/audit-log',
        method: 'GET',
        status: 429,
        userId: session.user.id,
        reason: 'Rate limit exceeded',
        severity: 'low',
      })
      
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    // الحصول على السجلات
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000)
    const action = url.searchParams.get('action') || undefined
    
    const logs = getAuditLogs({ limit, action })
    
    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/audit-log
 * تسجيل حدث أدمن
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const ip = getClientIP(request)
    
    // التحقق من المصادقة والصلاحيات
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      logSecurityEvent({
        timestamp: new Date(),
        ip,
        endpoint: '/api/admin/audit-log',
        method: 'POST',
        status: 403,
        reason: 'Unauthorized audit log creation',
        severity: 'high',
      })
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // فحص الحد
    const { allowed } = checkRateLimit(request, 'admin')
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    // قراءة البيانات
    const body = await request.json()
    
    // التحقق من المدخلات
    const validation = validateInput(body, {
      action: { type: 'string', required: true, maxLength: 100 },
      resource: { type: 'string', required: true, maxLength: 100 },
      resourceId: { type: 'string', required: true, maxLength: 100 },
      changes: { type: 'string', maxLength: 1000 },
    })
    
    if (!validation.valid) {
      logSecurityEvent({
        timestamp: new Date(),
        ip,
        endpoint: '/api/admin/audit-log',
        method: 'POST',
        status: 400,
        userId: session.user.id,
        reason: 'Invalid audit log data',
        severity: 'low',
      })
      
      return NextResponse.json(
        { error: 'Invalid input', errors: validation.errors },
        { status: 400 }
      )
    }
    
    // تسجيل الحدث
    logAdminAction({
      timestamp: new Date(),
      adminId: session.user.id,
      adminName: session.user.name || 'Unknown',
      action: validation.data!.action,
      resource: validation.data!.resource,
      resourceId: validation.data!.resourceId,
      changes: validation.data!.changes ? JSON.parse(validation.data!.changes) : undefined,
      ip,
      status: 'success',
    })
    
    return NextResponse.json({
      success: true,
      message: 'Audit log created',
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/audit-log/reset-limit
 * إعادة تعيين حد معين
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const ip = getClientIP(request)
    
    // التحقق من الصلاحيات
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { targetIp, tier } = body
    
    if (!targetIp) {
      return NextResponse.json(
        { error: 'targetIp is required' },
        { status: 400 }
      )
    }
    
    // إعادة تعيين الحد
    resetRateLimit(targetIp, tier)
    
    // تسجيل الحدث
    logAdminAction({
      timestamp: new Date(),
      adminId: session.user.id,
      adminName: session.user.name || 'Unknown',
      action: 'reset_rate_limit',
      resource: 'rate_limit',
      resourceId: targetIp,
      ip,
      status: 'success',
    })
    
    return NextResponse.json({
      success: true,
      message: `Rate limit reset for IP ${targetIp}`,
    })
  } catch (error) {
    console.error('Error resetting rate limit:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

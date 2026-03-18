/**
 * نظام التسجيل - لتتبع الهجمات والمحاولات المريبة
 */

export interface SecurityLog {
  timestamp: Date
  ip: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  status: number
  userId?: string
  reason: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  headers?: Record<string, string>
}

export interface AdminAuditLog {
  timestamp: Date
  adminId: string
  adminName: string
  action: string
  resource: string
  resourceId: string
  changes?: Record<string, { old: any; new: any }>
  ip: string
  status: 'success' | 'failed'
}

/**
 * متجر السجلات - في الإنتاج استخدم قاعدة البيانات
 */
const securityLogs: SecurityLog[] = []
const auditLogs: AdminAuditLog[] = []
const MAX_LOGS = 10000

/**
 * تسجيل حدث أمني
 */
export function logSecurityEvent(log: SecurityLog): void {
  securityLogs.push(log)
  
  // طباعة التنبيهات الحرجة
  if (log.severity === 'critical' || log.severity === 'high') {
    console.warn('🚨 SECURITY ALERT:', {
      ip: log.ip,
      endpoint: log.endpoint,
      reason: log.reason,
      severity: log.severity,
    })
  }
  
  // الاحتفاظ بعدد معقول من السجلات
  if (securityLogs.length > MAX_LOGS) {
    securityLogs.shift()
  }
}

/**
 * تسجيل تحرك أدمن
 */
export function logAdminAction(log: AdminAuditLog): void {
  auditLogs.push(log)
  
  console.log('📝 ADMIN ACTION:', {
    admin: log.adminName,
    action: log.action,
    resource: log.resource,
    status: log.status,
  })
  
  if (auditLogs.length > MAX_LOGS) {
    auditLogs.shift()
  }
}

/**
 * الحصول على السجلات الأمنية
 */
export function getSecurityLogs(
  filter?: {
    ip?: string
    severity?: SecurityLog['severity']
    endpoint?: string
    limit?: number
  }
): SecurityLog[] {
  let results = [...securityLogs]
  
  if (filter?.ip) {
    results = results.filter(log => log.ip === filter.ip)
  }
  
  if (filter?.severity) {
    results = results.filter(log => log.severity === filter.severity)
  }
  
  if (filter?.endpoint) {
    results = results.filter(log => log.endpoint === filter.endpoint)
  }
  
  // ترتيب من الأحدث
  results = results.reverse()
  
  if (filter?.limit) {
    results = results.slice(0, filter.limit)
  }
  
  return results
}

/**
 * الحصول على سجلات الأدمن
 */
export function getAuditLogs(
  filter?: {
    adminId?: string
    action?: string
    limit?: number
  }
): AdminAuditLog[] {
  let results = [...auditLogs]
  
  if (filter?.adminId) {
    results = results.filter(log => log.adminId === filter.adminId)
  }
  
  if (filter?.action) {
    results = results.filter(log => log.action === filter.action)
  }
  
  results = results.reverse()
  
  if (filter?.limit) {
    results = results.slice(0, filter.limit)
  }
  
  return results
}

/**
 * إحصائيات الأمان
 */
export function getSecurityStats(): {
  totalAttempts: number
  criticalAttempts: number
  uniqueIPs: number
  lastHourAttempts: number
} {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  
  const uniqueIPs = new Set(securityLogs.map(log => log.ip)).size
  const criticalAttempts = securityLogs.filter(log => log.severity === 'critical').length
  const lastHourAttempts = securityLogs.filter(log => log.timestamp > oneHourAgo).length
  
  return {
    totalAttempts: securityLogs.length,
    criticalAttempts,
    uniqueIPs,
    lastHourAttempts,
  }
}

/**
 * تنظيف السجلات القديمة
 */
export function cleanOldLogs(olderThanMs: number = 7 * 24 * 60 * 60 * 1000): number {
  const cutoff = new Date(Date.now() - olderThanMs)
  
  const securityBefore = securityLogs.length
  const auditBefore = auditLogs.length
  
  // حذف سجلات الأمان القديمة
  for (let i = securityLogs.length - 1; i >= 0; i--) {
    if (securityLogs[i].timestamp < cutoff) {
      securityLogs.pop()
    }
  }
  
  // حذف سجلات الأدمن القديمة
  for (let i = auditLogs.length - 1; i >= 0; i--) {
    if (auditLogs[i].timestamp < cutoff) {
      auditLogs.pop()
    }
  }
  
  const deleted = (securityBefore - securityLogs.length) + (auditBefore - auditLogs.length)
  console.log(`🧹 Cleaned ${deleted} old logs`)
  
  return deleted
}

/**
 * كشف الأنماط المريبة
 */
export function detectSuspiciousPatterns(): {
  bruteForceAttempts: Array<{ ip: string; attempts: number }>
  rapidRequests: Array<{ ip: string; count: number }>
} {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  
  // محاولات Brute Force على المصادقة
  const bruteForceMap = new Map<string, number>()
  securityLogs
    .filter(log => log.endpoint.includes('auth') && log.status === 401)
    .filter(log => log.timestamp > fiveMinutesAgo)
    .forEach(log => {
      bruteForceMap.set(log.ip, (bruteForceMap.get(log.ip) || 0) + 1)
    })
  
  // طلبات سريعة جداً
  const rapidMap = new Map<string, number>()
  const oneSecondAgo = new Date(Date.now() - 1000)
  securityLogs
    .filter(log => log.timestamp > oneSecondAgo)
    .forEach(log => {
      rapidMap.set(log.ip, (rapidMap.get(log.ip) || 0) + 1)
    })
  
  return {
    bruteForceAttempts: Array.from(bruteForceMap.entries())
      .filter(([_, count]) => count > 5)
      .map(([ip, count]) => ({ ip, attempts: count })),
    rapidRequests: Array.from(rapidMap.entries())
      .filter(([_, count]) => count > 20)
      .map(([ip, count]) => ({ ip, count })),
  }
}

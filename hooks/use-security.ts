import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

/**
 * Hook لإدارة CSRF tokens
 */
export function useCSRFToken() {
  const [csrfToken, setCSRFToken] = useState<string>('')
  const { data: session } = useSession()
  
  useEffect(() => {
    if (!session) {
      setCSRFToken('')
      return
    }
    
    // جلب token جديد عند تحميل الجلسة
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/csrf-token')
        if (response.ok) {
          const data = await response.json()
          setCSRFToken(data.token)
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error)
      }
    }
    
    fetchToken()
  }, [session])
  
  /**
   * الحصول على رؤوس الطلب المحسّنة
   */
  const getAxiosConfig = () => ({
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  })
  
  /**
   * wrapper للـ fetch مع CSRF
   */
  const secureFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const headers = new Headers(options.headers || {})
    headers.set('X-CSRF-Token', csrfToken)
    
    return fetch(url, { ...options, headers })
  }
  
  return { csrfToken, getAxiosConfig, secureFetch }
}

/**
 * Hook للتحقق من معدل الطلبات
 */
export function useRateLimitInfo() {
  const [rateLimitInfo, setRateLimitInfo] = useState({
    remaining: null as number | null,
    tier: null as string | null,
    resetIn: null as number | null,
  })
  
  const updateFromHeaders = (headers: Headers) => {
    setRateLimitInfo({
      remaining: parseInt(headers.get('X-RateLimit-Remaining') || '') || null,
      tier: headers.get('X-RateLimit-Tier'),
      resetIn: null,
    })
  }
  
  return { rateLimitInfo, updateFromHeaders }
}

/**
 * Hook للتعامل مع الأخطاء الأمنية
 */
export function useSecurityError() {
  const [securityError, setSecurityError] = useState<{
    status: number
    message: string
    type: 'csrf' | 'rate_limit' | 'unauthorized' | 'forbidden' | 'other'
  } | null>(null)
  
  const handleError = (error: any) => {
    if (error.response?.status === 403) {
      setSecurityError({
        status: 403,
        message: 'الوصول مرفوض - ربما انتهت الجلسة',
        type: 'forbidden',
      })
    } else if (error.response?.status === 429) {
      setSecurityError({
        status: 429,
        message: 'الكثير من الطلبات - يرجى الانتظار قليلاً',
        type: 'rate_limit',
      })
    } else if (error.response?.data?.error === 'CSRF token invalid') {
      setSecurityError({
        status: 400,
        message: 'رمز الأمان غير صحيح - يرجى إعادة تحميل الصفحة',
        type: 'csrf',
      })
    }
  }
  
  const clear = () => setSecurityError(null)
  
  return { securityError, handleError, clear }
}

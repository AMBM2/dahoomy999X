/**
 * نظام التحقق من المدخلات المتقدم
 */

export interface ValidationSchema {
  [key: string]: ValidationRule
}

export interface ValidationRule {
  type: 'string' | 'number' | 'email' | 'url' | 'array' | 'boolean' | 'date'
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  enum?: any[]
  custom?: (value: any) => boolean | string
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
  data?: Record<string, any>
}

/**
 * التحقق من البيانات ضد schema
 */
export function validateInput(
  data: Record<string, any>,
  schema: ValidationSchema
): ValidationResult {
  const errors: Record<string, string> = {}
  const validatedData: Record<string, any> = {}
  
  for (const [key, rule] of Object.entries(schema)) {
    const value = data[key]
    
    // التحقق من الإلزامية
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[key] = `${key} is required`
      continue
    }
    
    if (value === undefined || value === null) {
      continue
    }
    
    // التحقق من النوع
    const typeError = validateType(value, rule.type, key)
    if (typeError) {
      errors[key] = typeError
      continue
    }
    
    // التحقق من النطاق
    if (rule.type === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors[key] = `${key} must be at least ${rule.minLength} characters`
        continue
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[key] = `${key} must not exceed ${rule.maxLength} characters`
        continue
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[key] = `${key} has invalid format`
        continue
      }
    }
    
    if (rule.type === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors[key] = `${key} must be at least ${rule.min}`
        continue
      }
      if (rule.max !== undefined && value > rule.max) {
        errors[key] = `${key} must not exceed ${rule.max}`
        continue
      }
    }
    
    // التحقق من القيم المسموح بها
    if (rule.enum && !rule.enum.includes(value)) {
      errors[key] = `${key} must be one of: ${rule.enum.join(', ')}`
      continue
    }
    
    // التحقق المخصص
    if (rule.custom) {
      const customResult = rule.custom(value)
      if (customResult !== true) {
        errors[key] = typeof customResult === 'string' ? customResult : `${key} validation failed`
        continue
      }
    }
    
    validatedData[key] = value
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: Object.keys(errors).length === 0 ? validatedData : undefined,
  }
}

/**
 * التحقق من النوع
 */
function validateType(value: any, type: string, key: string): string | null {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        return `${key} must be a string`
      }
      break
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return `${key} must be a number`
      }
      break
    case 'email':
      if (typeof value !== 'string' || !isValidEmail(value)) {
        return `${key} must be a valid email`
      }
      break
    case 'url':
      if (typeof value !== 'string' || !isValidURL(value)) {
        return `${key} must be a valid URL`
      }
      break
    case 'array':
      if (!Array.isArray(value)) {
        return `${key} must be an array`
      }
      break
    case 'boolean':
      if (typeof value !== 'boolean') {
        return `${key} must be a boolean`
      }
      break
    case 'date':
      if (!(value instanceof Date) && isNaN(Date.parse(value))) {
        return `${key} must be a valid date`
      }
      break
  }
  return null
}

/**
 * التحقق من صيغة البريد الإلكتروني
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * التحقق من صيغة URL
 */
function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * تنظيف وتحقق من نص
 */
export function sanitizeAndValidateText(
  text: string,
  options?: {
    minLength?: number
    maxLength?: number
    allowHTML?: boolean
    allowSpecialChars?: boolean
  }
): { valid: boolean; value: string; error?: string } {
  if (typeof text !== 'string') {
    return { valid: false, value: '', error: 'Must be a string' }
  }
  
  // الحد الأدنى الافتراضي
  const minLength = options?.minLength ?? 1
  const maxLength = options?.maxLength ?? 1000
  
  if (text.length < minLength) {
    return { valid: false, value: '', error: `Must be at least ${minLength} characters` }
  }
  
  if (text.length > maxLength) {
    return { valid: false, value: '', error: `Must not exceed ${maxLength} characters` }
  }
  
  let sanitized = text.trim()
  
  // تنظيف من HTML إذا لم يكن مسموح
  if (!options?.allowHTML) {
    sanitized = sanitized
      .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;'))
  }
  
  // التحقق من الأحرف الخاصة
  if (!options?.allowSpecialChars) {
    // إذا كانت هناك أحرف خطرة
    if (/[<>\"'`\\]/g.test(sanitized)) {
      return { valid: false, value: '', error: 'Contains invalid characters' }
    }
  }
  
  return { valid: true, value: sanitized }
}

/**
 * التحقق من كلمة المرور القوية
 */
export function validateStrongPassword(password: string): {
  valid: boolean
  strength: 'weak' | 'medium' | 'strong'
  errors: string[]
} {
  const errors: string[] = []
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  
  if (password.length < 8) {
    errors.push('Must be at least 8 characters')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain lowercase letters')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain uppercase letters')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Must contain numbers')
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Must contain special characters (!@#$%^&*)')
  }
  
  if (errors.length === 0) {
    strength = 'strong'
  } else if (errors.length <= 2) {
    strength = 'medium'
  }
  
  return {
    valid: errors.length === 0,
    strength,
    errors,
  }
}

/**
 * قوالب التحقق المعرّفة مسبقاً
 */
export const ValidationSchemas = {
  // تسجيل دخول
  login: {
    email: { type: 'email' as const, required: true },
    password: { type: 'string' as const, required: true, minLength: 6 },
  },
  
  // إنشاء فئة
  createCategory: {
    name: { type: 'string' as const, required: true, minLength: 1, maxLength: 100 },
    description: { type: 'string' as const, maxLength: 500 },
    emoji: { type: 'string' as const, maxLength: 10 },
  },
  
  // إضافة سؤال
  addQuestion: {
    categoryId: { type: 'string' as const, required: true },
    text: { type: 'string' as const, required: true, minLength: 10, maxLength: 500 },
    options: { type: 'array' as const, required: true },
    correctAnswer: { type: 'string' as const, required: true },
  },
  
  // تحديث الملف الشخصي
  updateProfile: {
    name: { type: 'string' as const, maxLength: 100 },
    bio: { type: 'string' as const, maxLength: 500 },
  },
}

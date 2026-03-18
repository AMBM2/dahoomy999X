import crypto from 'crypto'

/**
 * تشفير البيانات الحساسة
 * في الإنتاج استخدم مفتاح قوي من متغيرات البيئة
 */
const ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY || crypto.randomBytes(32)

/**
 * تشفير نص
 */
export function encryptData(data: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.isBuffer(ENCRYPTION_KEY) ? ENCRYPTION_KEY : Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    )
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // دمج IV مع النص المشفر
    return iv.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * فك تشفير النص
 */
export function decryptData(encryptedData: string): string {
  try {
    const parts = encryptedData.split(':')
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format')
    }
    
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.isBuffer(ENCRYPTION_KEY) ? ENCRYPTION_KEY : Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    )
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * إنشاء بصمة للبيانات (للتحقق من التعديل)
 */
export function createDataHash(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
}

/**
 * التحقق من بصمة البيانات
 */
export function verifyDataHash(data: string, hash: string): boolean {
  return createDataHash(data) === hash
}

/**
 * تشفير كلمة المرور
 */
export function hashPassword(password: string, salt: string = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex')
  
  return { hash, salt }
}

/**
 * التحقق من كلمة المرور
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: newHash } = hashPassword(password, salt)
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(newHash)
  )
}

/**
 * إنشاء token عشوائي آمن
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * إخفاء بيانات حساسة (للـ logging)
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) return '*'.repeat(data.length)
  
  const visible = data.slice(0, visibleChars)
  const hidden = '*'.repeat(data.length - visibleChars)
  return visible + hidden
}

/**
 * فئة لإدارة المفاتيح الحساسة
 */
export class SecureStore {
  private store = new Map<string, string>()
  
  /**
   * حفظ قيمة مشفرة
   */
  set(key: string, value: string): void {
    const encrypted = encryptData(value)
    this.store.set(key, encrypted)
  }
  
  /**
   * الحصول على قيمة مفك تشفيرها
   */
  get(key: string): string | undefined {
    const encrypted = this.store.get(key)
    if (!encrypted) return undefined
    
    try {
      return decryptData(encrypted)
    } catch {
      return undefined
    }
  }
  
  /**
   * حذف قيمة
   */
  delete(key: string): boolean {
    return this.store.delete(key)
  }
  
  /**
   * التحقق من وجود المفتاح
   */
  has(key: string): boolean {
    return this.store.has(key)
  }
  
  /**
   * تنظيف جميع البيانات
   */
  clear(): void {
    this.store.clear()
  }
}

# 🎯 Quick Start - الدليل السريع للحماية المحسّنة

## ✨ ما تم إضافته الآن

تم إضافة **6 نماذج أمان جديدة** و **3 نقاط نهائية للـ API** لحماية متقدمة:

### 📦 الملفات الجديدة

```
lib/
├── csrf.ts                      ← CSRF tokens
├── advanced-rate-limit.ts       ← معدل طلبات ذكي
├── request-logger.ts            ← تسجيل الهجمات
├── encryption.ts                ← تشفير البيانات
├── advanced-validation.ts       ← تحقق متقدم
└── security.ts                  ← ✏️ تحديث

hooks/
└── use-security.ts              ← React hooks

app/api/
├── csrf-token/route.ts          ← جلب CSRF
├── admin/
│   ├── security/logs/route.ts  ← سجلات الأمان
│   └── audit-log/route.ts      ← تحركات الأدمن
└── ...

middleware.ts                    ← ✏️ تحديث محسّن
```

---

## 🚀 الاستخدام السريع

### 1️⃣ حماية Forms من CSRF

**في المكون (React Component):**

```tsx
import { useCSRFToken } from '@/hooks/use-security'

export function DeleteCategoryForm() {
  const { csrfToken, secureFetch } = useCSRFToken()
  
  async function handleDelete(categoryId: string) {
    try {
      const response = await secureFetch('/api/admin/delete-category', {
        method: 'POST',
        body: JSON.stringify({ categoryId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete')
      }
      
      // نجح!
    } catch (error) {
      console.error('Error:', error)
    }
  }
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleDelete('cat_123')
    }}>
      <button type="submit">حذف الفئة</button>
    </form>
  )
}
```

---

### 2️⃣ التحقق من المدخلات

```typescript
import { validateInput, ValidationSchemas } from '@/lib/advanced-validation'

// استخدام قالب معرّف مسبقاً
const result = validateInput(formData, ValidationSchemas.createCategory)

if (!result.valid) {
  console.log(`الأخطاء:`, result.errors)
  // { name: 'Must be at least 1 characters' }
}

// أو تحديد قواعد مخصصة
const validation = validateInput(userData, {
  email: { type: 'email', required: true },
  password: { 
    type: 'string', 
    minLength: 8,
    custom: (val) => val.includes('!') ? true : 'Must contain !'
  }
})
```

---

### 3️⃣ تسجيل إجراءات الأدمن

```typescript
import { logAdminAction } from '@/lib/request-logger'
import { getServerSession } from 'next-auth'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  // ... حذف الفئة ...
  
  // تسجيل الإجراء
  logAdminAction({
    timestamp: new Date(),
    adminId: session.user.id,
    adminName: session.user.name,
    action: 'delete_category',
    resource: 'category',
    resourceId: params.id,
    ip: getClientIP(request),
    status: 'success'
  })
  
  return NextResponse.json({ success: true })
}
```

---

### 4️⃣ تشفير البيانات الحساسة

```typescript
import { encryptData, decryptData, SecureStore } from '@/lib/encryption'

// تشفير بسيط
const apiKey = 'sk_live_12345'
const encrypted = encryptData(apiKey)
// αόχει αποθηκεύσει: "a3f2e8...encrypted..."

// فك التشفير
const decrypted = decryptData(encrypted) // 'sk_live_12345'

// متجر آمن للمفاتيح
const store = new SecureStore()
store.set('discord_token', 'xoxb-...')
const token = store.get('discord_token') // فك تشفير تلقائي
```

---

### 5️⃣ عرض سجلات الأمان (Admin فقط)

```bash
# الحصول على سجلات الأمان
curl 'http://localhost:3000/api/admin/security/logs?limit=50&severity=high' \
  -H "Authorization: Bearer $AUTH_TOKEN"

# الاستجابة:
{
  "logs": [
    {
      "timestamp": "2026-03-18T10:30:45.000Z",
      "ip": "192.168.1.100",
      "endpoint": "/api/admin/delete",
      "status": 429,
      "reason": "Rate limit exceeded",
      "severity": "high"
    }
  ],
  "stats": {
    "totalAttempts": 523,
    "criticalAttempts": 12,
    "uniqueIPs": 45,
    "lastHourAttempts": 23
  },
  "suspiciousPatterns": {
    "bruteForceAttempts": [{
      "ip": "10.0.0.5",
      "attempts": 47
    }],
    "rapidRequests": [{
      "ip": "10.0.0.8",
      "count": 156
    }]
  }
}
```

---

## 🔧 التكوين

### متغيرات البيئة المطلوبة

```bash
# في .env.local

# المصادقة (الموجود)
DISCORD_CLIENT_ID=xxx
DISCORD_CLIENT_SECRET=xxx
NEXTAUTH_SECRET=xxx

# **الجديد** - تشفير البيانات
DATA_ENCRYPTION_KEY=your_32_byte_hex_key_here

# مثال على توليد مفتاح قوي:
# Linux/Mac: openssl rand -hex 32
# Windows PowerShell: [BitConverter]::ToString([Byte[]] (1..32 | ForEach-Object {Get-Random -Max 256})) -replace '-',''
```

---

## 📊 مراقبة الأمان

### عرض الأحداث الحرجة

```typescript
import { getSecurityLogs, detectSuspiciousPatterns } from '@/lib/request-logger'

// جميع الأحداث الحرجة
const criticalEvents = getSecurityLogs({
  severity: 'critical',
  limit: 100
})

// كشف الأنماط المريبة
const patterns = detectSuspiciousPatterns()

console.log('🚨 محاولات Brute Force:', patterns.bruteForceAttempts)
console.log('⚡ طلبات سريعة:', patterns.rapidRequests)
```

### حجب IP الخطير

```typescript
import { blockIP, isIPBlocked } from '@/lib/advanced-rate-limit'

// حجب لمدة ساعة واحدة
blockIP('192.168.1.100', 60 * 60 * 1000)

// التحقق
if (isIPBlocked('192.168.1.100')) {
  // رفع الطلب
}
```

---

## ✅ قائمة فحص الأمان

تشغيل قبل النشر:

- [ ] تشغيل البناء: `pnpm build`
- [ ] بدء الخادم: `pnpm dev`
- [ ] اختبار CSRF: `curl http://localhost:3000/api/csrf-token`
- [ ] اختبار معدل الطلبات: أرسل 150+ طلب سريع
- [ ] اختبار الأدمن: `curl http://localhost:3000/api/admin/security/logs`
- [ ] التحقق من السجلات للأخطاء
- [ ] اختبار الحماية على https://securityheaders.com

---

## 🎓 أمثلة إضافية

### حماية موجهة API

```typescript
// app/api/admin/create-question/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { validateInput, ValidationSchemas } from '@/lib/advanced-validation'
import { verifyCsrfMiddleware } from '@/lib/security'
import { logAdminAction } from '@/lib/request-logger'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const ip = request.ip || 'unknown'
  
  // 1. التحقق من الصلاحيات
  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  
  // 2. التحقق من CSRF
  const { valid: csrfValid } = await verifyCsrfMiddleware(request, session.user.id)
  if (!csrfValid) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 400 })
  }
  
  // 3. التحقق من المدخلات
  const body = await request.json()
  const validation = validateInput(body, ValidationSchemas.addQuestion)
  
  if (!validation.valid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 })
  }
  
  // 4. العملية
  const question = await db.questions.create(validation.data)
  
  // 5. التسجيل
  logAdminAction({
    timestamp: new Date(),
    adminId: session.user.id,
    adminName: session.user.name || 'Unknown',
    action: 'create_question',
    resource: 'question',
    resourceId: question.id,
    changes: { created: validation.data },
    ip,
    status: 'success'
  })
  
  return NextResponse.json(question)
}
```

---

## 🆘 استكشاف الأخطاء

### خطأ: "CSRF token missing"
**الحل:** استخدم `secureFetch` من `useCSRFToken` hook

### خطأ: "Rate limit exceeded"
**الحل:** الانتظار قبل محاولة أخرى، أو اطلب admin أن يقوم بـ reset

### خطأ: "Unauthorized access attempt"
**الحل:** تحقق من أنك مُسَجِّل دخول وأنك admin للوصول إلى `/api/admin/*`

---

## 📞 الدعم والمساعدة

📖 **الوثائق الكاملة:** `ADVANCED_SECURITY.md`  
🔗 **OWASP Top 10:** https://owasp.org/www-project-top-ten/  
💬 **التحديثات:** تابع `SECURITY.md`

---

**تم تحديثه**: 18 مارس 2026  
**الحالة**: ✅ جاهز للإنتاج

# 👨‍💼 دليل Admin لإدارة طلبات التفعيل

## سريع البدء

### 1️⃣ الوصول إلى لوحة الطلبات
```
Admin Dashboard → Activation Requests → View All Requests
أو مباشرة:
http://localhost:3000/api/activation-requests?all=1
```

### 2️⃣ عرض الطلبات المعلقة
```json
GET /api/activation-requests?all=1

Response:
[
  {
    "id": "req-1710758940123-abc123",
    "userId": "123456789",
    "username": "أحمد محمد",
    "status": "pending",
    "createdAt": "2026-03-18T10:00:00.000Z"
  },
  ...
]
```

### 3️⃣ الموافقة على طلب
```bash
PATCH /api/activation-requests

Body:
{
  "id": "req-1710758940123-abc123",
  "status": "approved"
}

Response:
{
  "success": true,
  "message": "Request approved successfully"
}
```

### 4️⃣ رفض طلب
```bash
PATCH /api/activation-requests

Body:
{
  "id": "req-1710758940123-abc123",
  "status": "rejected"
}
```

---

## 📋 الحالات الممكنة

| الحالة | المعنى | الإجراء |
|--------|--------|---------|
| `pending` | بانتظار الموافقة | ✅ وافق أو ❌ ارفض |
| `approved` | معتمد | ✓ تم |
| `rejected` | مرفوض | ✓ تم |

---

## 🔔 الإشعارات التلقائية

عند الموافقة:
- ✅ المستخدم يرى تحديث تلقائي خلال 5 ثوانٍ
- ✅ الصفحة تنعش تلقائياً
- ✅ يمكنه اللعب فوراً

---

## 🛠️ استدعاءات cURL للاختبار

### عرض الطلبات الجديدة
```bash
curl http://localhost:3000/api/activation-requests?all=1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### الموافقة على طلب
```bash
curl -X PATCH http://localhost:3000/api/activation-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "id": "req-1710758940123-abc123",
    "status": "approved"
  }'
```

---

## 📊 عرض إحصائيات

### في `data/activation-requests.json`:
```bash
# عدد الطلبات المعلقة
grep -c '"status": "pending"' data/activation-requests.json

# عدد الطلبات المعتمدة
grep -c '"status": "approved"' data/activation-requests.json

# آخر طلب
tail -n 1 data/activation-requests.json
```

---

## ✅ أفضل الممارسات

1. **فحص البيانات:** قبل الموافقة، تحقق من:
   - اسم المستخدم ليس عشوائي
   - الرقم ID حقيقي من Discord
   - لا توجد طلبات كثيرة من نفس IP

2. **الاستجابة السريعة:** لا تأخر الموافقة فوق دقائق
3. **التوثيق:** احتفظ بسجل الموافقات
4. **الأمان:** لا تشارك رابط الموافقة علناً

---

## 🚨 حالات الشك

### لا توافق إذا:
- ❌ البيانات غير مكتملة
- ❌ اسم مريب أو عشوائي
- ❌ طلبات متعددة من نفس الشخص بسرعة
- ❌ إذا كان يحاول الالتفاف حول النظام

### وافق إذا:
- ✅ البيانات كاملة
- ✅ اسم حقيقي/معروف
- ✅ أول طلب من هذا الحساب
- ✅ كل شيء "عادي"

---

## 🔐 Secure API Usage

### للـ Admin فقط:
```typescript
// التحقق من الصلاحيات
const adminIds = [
  "897450827353063505",    // Admin 1
  "1186739142231605248"    // Admin 2
]

if (!adminIds.includes(session.user.id)) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
}
```

---

## 📱 عبر الـ Admin Panel (قريباً)

```
Admin Dashboard
├── Users Management
│   └── Activation Requests
│       ├── View All
│       ├── Filter by Status
│       ├── Quick Approve/Reject
│       ├── Bulk Approve
│       └── Export List
├── Statistics
│   ├── Total Requests
│   ├── Pending
│   ├── Approved
│   └── Rejection Rate
└── Logs
    ├── Approval History
    ├── Admin Actions
    └── User Activity
```

---

**ملاحظة:** هذا الدليل موجه للـ Admin فقط. لا تشارك هذه المعلومات.

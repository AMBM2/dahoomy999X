#!/bin/bash
# 🔍 Website Health Check Script
# استخدام: bash health-check.sh

echo "🏥 فحص صحة الموقع..."
echo "===================="
echo ""

# Check if server is running
echo "✓ فحص الخادم..."
netstat -an | grep 3000 > /dev/null && echo "  ✅ الخادم يستمع على port 3000" || echo "  ❌ الخادم غير نشط"

# Check build status
echo ""
echo "✓ فحص البناء..."
if [ -d ".next" ]; then
    echo "  ✅ البناء موجود (.next folder)"
else
    echo "  ❌ لا يوجد بناء"
fi

# Check environment variables
echo ""
echo "✓ فحص متغيرات البيئة..."
if [ -f ".env.local" ]; then
    echo "  ✅ ملف .env.local موجود"
    grep -q "DISCORD_CLIENT_ID" .env.local && echo "  ✅ DISCORD_CLIENT_ID موجود"
    grep -q "NEXTAUTH_SECRET" .env.local && echo "  ✅ NEXTAUTH_SECRET موجود"
else
    echo "  ❌ ملف .env.local غير موجود"
fi

# Check TypeScript errors
echo ""
echo "✓ فحص أخطاء TypeScript..."
pnpm tsc --noEmit 2>/dev/null | grep -q "error" && echo "  ❌ هناك أخطاء TypeScript" || echo "  ✅ لا توجد أخطاء TypeScript"

# Check API endpoints
echo ""
echo "✓ فحص نقاط نهاية API..."
for endpoint in "/" "/api/categories" "/api/auth/session"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000$endpoint 2>/dev/null)
    if [ "$response" = "200" ]; then
        echo "  ✅ $endpoint - $response"
    else
        echo "  ⚠️  $endpoint - $response"
    fi
done

echo ""
echo "✨ انتهى فحص الصحة!"

set -e

echo "▶️ 1) افزودن dynamic/revalidate=0 به همه layoutها"
# هر layout.tsx/tsx که این دو خط را ندارد، به ابتدای فایل اضافه کن
while IFS= read -r -d '' f; do
  if ! grep -q "export const dynamic" "$f"; then
    printf "export const dynamic = 'force-dynamic';\nexport const revalidate = 0;\n\n" | cat - "$f" > "$f.__new__" && mv "$f.__new__" "$f"
    echo "  + patched: $f"
  else
    echo "  = exists : $f"
  fi
done < <(find app -type f -regex '.*layout\.tsx\|.*layout\.ts' -print0)

echo "▶️ 2) حذف استفاده از Edge runtime (با Prisma سازگار نیست)"
# هر خطی که runtime=edge هست را حذف می‌کند
grep -Rnl --include='*.ts*' "runtime *= *['\"]edge['\"]" app || true
sed -i.bak "/export const runtime *= *['\"]edge['\"]/d" $(grep -Rnl --include='*.ts*' "runtime *= *['\"]edge['\"]" app || echo) 2>/dev/null || true

echo "▶️ 3) گزارش فایل‌هایی که generateStaticParams دارند (اگر دیتابیس می‌خوانند، موقتاً کامنت کن)"
grep -Rni --include='*.ts*' "generateStaticParams" app || true

echo "▶️ 4) ساخت singleton برای Prisma (lib/prisma.ts)"
mkdir -p lib
cat > lib/prisma.ts <<'TS'
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
TS

echo "▶️ 5) اطمینان از خروجی standalone"
if [ -f next.config.js ] || [ -f next.config.mjs ]; then
  FILE=$( [ -f next.config.mjs ] && echo next.config.mjs || echo next.config.js )
  if ! grep -q "output: 'standalone'" "$FILE"; then
    # اگر config موجوده، تلاش می‌کنیم output اضافه کنیم
    cp "$FILE" "$FILE.bak"
    node -e "
const fs=require('fs');const f='$FILE';let t=fs.readFileSync(f,'utf8');
if(/export default\s*{/.test(t)){t=t.replace(/export default\s*{/, m=>m+\"\n  output: 'standalone',\");}
else if(/module\.exports\s*=/.test(t)){t=t.replace(/module\.exports\s*=\s*{/, m=>m+\"\n  output: 'standalone',\");}
else{t += \"\nmodule.exports = { output: 'standalone' }\n\"}
fs.writeFileSync(f,t);
"
    echo "  + output: 'standalone' به $FILE اضافه شد."
  else
    echo "  = standalone قبلاً فعال بوده."
  fi
else
  echo "module.exports = { output: 'standalone' }" > next.config.js
  echo "  + ساخته شد: next.config.js با output: 'standalone'"
fi

echo "✅ آماده برای build"

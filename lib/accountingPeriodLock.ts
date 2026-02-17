// lib/accountingPeriodLock.ts
import { prisma } from "@/lib/db";

/**
 * جلوگیری از تغییرات مالی در دوره‌های قفل‌شده.
 * این helper تلاش می‌کند جدول/ستون‌های مربوط به قفل دوره را به صورت پویا پیدا کند.
 * اگر چیزی پیدا نشد، اجازه می‌دهد (برای اینکه پروژه نخوابد).
 */
export async function assertNotLocked(...args: any[]) {
  // پشتیبانی از چند امضای مختلف (برای سازگاری با کدهای قبلی)
  let companyId: number | null = null;
  let at: Date = new Date();

  if (typeof args[0] === "number") {
    companyId = args[0];
    if (args[1]) at = new Date(args[1]);
  } else if (args[0] && typeof args[0] === "object") {
    companyId = Number(args[0].companyId || args[0].company?.id || args[0]?.me?.companyId || 0) || null;
    if (args[0].at || args[0].date) at = new Date(args[0].at || args[0].date);
  }

  if (!companyId) return;

  // جدول‌های محتمل (با توجه به اینکه شما route جدا برای period-locks دارید)
  const candidates = ["AccountingPeriodLock", "AccountingPeriodLocks", "PeriodLock", "PeriodLocks"];

  // پیدا کردن جدول موجود
  const tables: Array<{ table_name: string }> = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name IN (${prisma.$join(candidates)})
  `;

  const table = tables?.[0]?.table_name;
  if (!table) return; // جدول ندارید => قفل هم ندارید

  // ستون‌های جدول را می‌خوانیم تا query را دقیق بسازیم
  const cols: Array<{ column_name: string }> = await prisma.$queryRaw`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = ${table}
  `;
  const colset = new Set((cols || []).map((c) => c.column_name));

  const startCol =
    (["startDate", "fromDate", "from", "dateFrom", "start"].find((c) => colset.has(c)) as string) || null;
  const endCol =
    (["endDate", "toDate", "to", "dateTo", "end"].find((c) => colset.has(c)) as string) || null;

  // وضعیت قفل
  const lockCol =
    (["isLocked", "locked"].find((c) => colset.has(c)) as string) ||
    (colset.has("status") ? "status" : null);

  if (!startCol || !endCol || !lockCol) return; // ساختار نامشخص => اجازه می‌دهیم

  // شرط قفل
  let lockPredicate = "";
  if (lockCol === "status") lockPredicate = "`status` = 'LOCKED'";
  else lockPredicate = `\`${lockCol}\` = 1`;

  // ممکن است ستون companyId نام متفاوت داشته باشد
  const companyCol = (["companyId", "company_id"].find((c) => colset.has(c)) as string) || null;
  if (!companyCol) return;

  const sql = `
    SELECT 1
    FROM \`${table}\`
    WHERE \`${companyCol}\` = ?
      AND ${lockPredicate}
      AND ? BETWEEN \`${startCol}\` AND \`${endCol}\`
    LIMIT 1
  `;

  try {
    const hit: any[] = await prisma.$queryRawUnsafe(sql, Number(companyId), at);
    if (hit?.length) {
      throw new Error("این دوره حسابداری قفل است و امکان ثبت/ویرایش پرداخت وجود ندارد.");
    }
  } catch (e: any) {
    // اگر جدول/ستون‌ها استاندارد نبود و query خطا داد، پروژه نباید بخوابد.
    // ولی اگر ارور خودمان بود، باید پاس داده شود.
    if (String(e?.message || "").includes("دوره حسابداری قفل است")) throw e;
    return;
  }
}

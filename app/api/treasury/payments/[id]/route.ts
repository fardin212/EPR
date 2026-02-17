import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";
import { assertNotLocked } from "@/lib/accountingPeriodLock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mustInt(v: any, name = "id") {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) throw new Error(`${name} نامعتبر است.`);
  return n;
}

function parseDate(v: any) {
  const d = v ? new Date(v) : null;
  if (d && Number.isNaN(d.getTime())) return null;
  return d;
}

async function getParams(ctx: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
}

export async function PUT(req: Request, ctx: any) {
  try {
    const me = await getMeServer();
    if (!me) return new NextResponse("Unauthorized", { status: 401 });

    const companyId = Number(me.companyId || me.company?.id || 0);
    if (!companyId) return new NextResponse("Company not found", { status: 400 });

    const { id } = await getParams(ctx);
    const txId = mustInt(id, "id");

    const body = await req.json().catch(() => ({}));
    const date = parseDate(body?.date) ?? new Date();

    await prisma.$transaction(async (tx) => {
      await assertNotLocked(tx, companyId, date);

      await tx.treasuryTransaction.update({
        where: { id: txId },
        data: {
          companyId,
          date,
          direction: body.direction,
          method: body.method,
          amount: body.amount,

          fromAccountId: body.fromAccountId ?? null,
          toAccountId: body.toAccountId ?? null,

          partyId: body.partyId ?? null,
          projectId: body.projectId ?? null,

          note: body.note ?? body.description ?? null,
          trackingNo: body.trackingNo ?? null,
          refNo: body.refNo ?? null,
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message || "Error", { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: any) {
  try {
    const me = await getMeServer();
    if (!me) return new NextResponse("Unauthorized", { status: 401 });

    const companyId = Number(me.companyId || me.company?.id || 0);
    if (!companyId) return new NextResponse("Company not found", { status: 400 });

    const { id } = await getParams(ctx);
    const txId = mustInt(id, "id");

    await prisma.$transaction(async (tx) => {
      const row = await tx.treasuryTransaction.findUnique({
        where: { id: txId },
        select: { id: true, companyId: true, date: true, accountingVoucherId: true },
      });
      if (!row || row.companyId !== companyId) throw new Error("تراکنش یافت نشد.");

      await assertNotLocked(tx, companyId, row.date);

      // ✅ اگر به سند وصل است، اول چک کن سند واقعاً وجود دارد یا نه
      if (row.accountingVoucherId) {
        const v = await tx.accountingVoucher.findFirst({
          where: { id: row.accountingVoucherId, companyId },
          select: { id: true },
        });

        // ✅ سند حذف شده/وجود ندارد → لینک خراب را پاک کن و ادامه بده
        if (!v) {
          await tx.treasuryTransaction.update({
            where: { id: row.id },
            data: { accountingVoucherId: null },
          });
        } else {
          // ❌ سند واقعاً وجود دارد → حذف ممنوع (امن)
          throw new Error("این تراکنش هنوز سند حسابداری دارد. ابتدا سند را حذف/ابطال کن.");
        }
      }

      await tx.treasuryTransaction.delete({ where: { id: txId } });
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // ✅ برای خطاهای منطقی بهتره 400 بدهیم نه 500 (تا UI هم درست پیام بده)
    return new NextResponse(e?.message || "Error", { status: 400 });
  }
}

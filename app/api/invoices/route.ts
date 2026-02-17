import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

function toInt(v: any, def = 0) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.round(n);
}

function safeStr(v: any, max = 500) {
  const s = String(v ?? "").trim();
  return s.length > max ? s.slice(0, max) : s;
}

function parseDate(v: any) {
  const d = v ? new Date(v) : null;
  if (d && Number.isNaN(d.getTime())) return null;
  return d;
}

function docPrefix(docType: string) {
  return docType === "INVOICE" ? "I" : "P";
}

async function nextSerialNo(tx: any, companyId: number, docType: "PROFORMA" | "INVOICE") {
  // قفل در سطح transaction: با unique(docNo) هم امن است
  const last = await tx.invoice.findFirst({
    where: { companyId, docType },
    orderBy: { serialNo: "desc" },
    select: { serialNo: true },
  });
  return (last?.serialNo ?? 0) + 1;
}

function makeDocNo(docType: "PROFORMA" | "INVOICE", serialNo: number) {
  const p = docPrefix(docType);
  return `${p}-${String(serialNo).padStart(6, "0")}`;
}

function calcTotals(items: Array<{ qty: number; unitPrice: number }>, discount: number, shipping: number, tax: number) {
  const subtotal = items.reduce((s, it) => s + Math.round(it.qty * it.unitPrice), 0);
  const total = subtotal - discount + shipping + tax;
  return { subtotal, total };
}

export async function GET(req: Request) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const { searchParams } = new URL(req.url);
    const take = Math.min(Math.max(Number(searchParams.get("take") || 50), 1), 200);

    const docType = searchParams.get("docType"); // PROFORMA | INVOICE
    const status = searchParams.get("status");   // DRAFT | ISSUED | PAID | CANCELLED
    const q = (searchParams.get("q") || "").trim();
    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));

    const where: any = { companyId };

    if (docType) where.docType = String(docType).toUpperCase();
    if (status) where.status = String(status).toUpperCase();

    if (from) where.date = { ...(where.date || {}), gte: from };
    if (to) {
      const t = new Date(to);
      t.setHours(23, 59, 59, 999);
      where.date = { ...(where.date || {}), lte: t };
    }

    if (q) {
      where.OR = [
        { docNo: { contains: q } },
        { customerName: { contains: q } },
        { customerMobile: { contains: q } },
        { customerPhone: { contains: q } },
      ];
    }

    const rows = await prisma.invoice.findMany({
      where,
      orderBy: { date: "desc" },
      take,
      select: {
        id: true,
        docType: true,
        status: true,
        docNo: true,
        date: true,
        dueDate: true,
        customerName: true,
        customerMobile: true,
        total: true,
      },
    });

    return NextResponse.json({
      items: rows.map((r) => ({
        ...r,
        date: r.date.toISOString(),
        dueDate: r.dueDate ? r.dueDate.toISOString() : null,
      })),
    });
  } catch (e) {
    console.error(e);
    return new NextResponse("خطا در دریافت لیست فاکتورها", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const body = await req.json();

    const docType = (String(body.docType || "PROFORMA").toUpperCase() as "PROFORMA" | "INVOICE");
    if (docType !== "PROFORMA" && docType !== "INVOICE") {
      return new NextResponse("docType نامعتبر است", { status: 400 });
    }

    const date = body.date ? new Date(body.date) : new Date();
    if (Number.isNaN(date.getTime())) return new NextResponse("date نامعتبر است", { status: 400 });

    const dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (dueDate && Number.isNaN(dueDate.getTime())) return new NextResponse("dueDate نامعتبر است", { status: 400 });

    const partyId = body.partyId != null ? Number(body.partyId) : null;
    const customerName = safeStr(body.customerName, 200);
    if (!customerName) return new NextResponse("نام مشتری الزامی است", { status: 400 });

    const customerMobile = safeStr(body.customerMobile, 50) || null;
    const customerPhone = safeStr(body.customerPhone, 50) || null;
    const customerAddress = safeStr(body.customerAddress, 500) || null;

    const discount = toInt(body.discount, 0);
    const shipping = toInt(body.shipping, 0);
    const tax = toInt(body.tax, 0);

    const deliveryTime = safeStr(body.deliveryTime, 200) || null;
    const storagePenalty = safeStr(body.storagePenalty, 200) || null;
    const transportTerms = safeStr(body.transportTerms, 300) || null;
    const notes = safeStr(body.notes, 2000) || null;

    const itemsIn: any[] = Array.isArray(body.items) ? body.items : [];
    if (!itemsIn.length) return new NextResponse("حداقل یک آیتم قیمت لازم است", { status: 400 });

    const itemsParsed = itemsIn.map((it, idx) => {
      const title = safeStr(it.title, 200);
      if (!title) throw new Error(`title آیتم ردیف ${idx + 1} الزامی است`);
      const qty = Number(it.qty ?? 1);
      if (!Number.isFinite(qty) || qty <= 0) throw new Error(`qty آیتم ردیف ${idx + 1} نامعتبر است`);
      const unit = safeStr(it.unit, 30) || null;
      const unitPrice = toInt(it.unitPrice, 0);
      if (unitPrice < 0) throw new Error(`unitPrice آیتم ردیف ${idx + 1} نامعتبر است`);
      const lineTotal = Math.round(qty * unitPrice);

      return {
        title,
        qty,
        unit,
        unitPrice,
        lineTotal,
        sortOrder: toInt(it.sortOrder, idx),
        note: safeStr(it.note, 300) || null,
      };
    });

    const totals = calcTotals(itemsParsed, discount, shipping, tax);

    const spec = body.spec || null;

    const created = await prisma.$transaction(async (tx) => {
      const serialNo = await nextSerialNo(tx, companyId, docType);
      const docNo = makeDocNo(docType, serialNo);

      const inv = await tx.invoice.create({
        data: {
          companyId,
          docType,
          status: "DRAFT",
          serialNo,
          docNo,
          date,
          dueDate: dueDate || undefined,

          partyId: partyId || undefined,
          customerName,
          customerMobile,
          customerPhone,
          customerAddress,

          subtotal: totals.subtotal,
          discount,
          shipping,
          tax,
          total: totals.total,

          deliveryTime,
          storagePenalty,
          transportTerms,
          notes,

          createdById: me.id,
        } as any,
        select: { id: true, docNo: true },
      });

      await tx.invoiceItem.createMany({
        data: itemsParsed.map((it) => ({
          invoiceId: inv.id,
          title: it.title,
          qty: it.qty,
          unit: it.unit,
          unitPrice: it.unitPrice,
          lineTotal: it.lineTotal,
          sortOrder: it.sortOrder,
          note: it.note,
        })) as any,
      });

      if (spec) {
        await tx.invoiceSpec.create({
          data: {
            invoiceId: inv.id,
            dimensions: safeStr(spec.dimensions, 200) || null,
            area: safeStr(spec.area, 200) || null,
            chassis: safeStr(spec.chassis, 200) || null,
            profile: safeStr(spec.profile, 200) || null,
            bodySheet: safeStr(spec.bodySheet, 200) || null,
            roofSheet: safeStr(spec.roofSheet, 200) || null,
            interior: safeStr(spec.interior, 200) || null,
            insulationType: safeStr(spec.insulationType, 200) || null,

            floor: safeStr(spec.floor, 200) || null,
            bodyColor: safeStr(spec.bodyColor, 200) || null,
            door: safeStr(spec.door, 200) || null,
            window: safeStr(spec.window, 200) || null,
            extras: safeStr(spec.extras, 500) || null,
            strapSheet: safeStr(spec.strapSheet, 200) || null,
            gutter: safeStr(spec.gutter, 200) || null,
            service: safeStr(spec.service, 200) || null,
          },
        });
      }

      return inv;
    });

    return NextResponse.json({ ok: true, id: created.id, docNo: created.docNo }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(e?.message || "خطا در ایجاد فاکتور", { status: 500 });
  }
}

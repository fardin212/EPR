import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

function mustInt(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) throw new Error(`${name} نامعتبر است`);
  return n;
}

function toInt(v: any, def = 0) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.round(n);
}

function safeStr(v: any, max = 500) {
  const s = String(v ?? "").trim();
  if (!s) return "";
  return s.slice(0, max);
}

function computeTotals(items: Array<{ qty: number; unitPrice: number }>, discount: number, shipping: number, tax: number) {
  const subtotal = items.reduce((s, it) => s + Math.round((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)), 0);
  const total = subtotal - discount + shipping + tax;
  return { subtotal, total };
}

function safeIso(d: any) {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  return x.toISOString();
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const { id: idStr } = await ctx.params;
    const id = mustInt(idStr, "id");

    const inv = await prisma.invoice.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        spec: true,
        party: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!inv) return new NextResponse("فاکتور یافت نشد", { status: 404 });

    return NextResponse.json({
      id: inv.id,
      companyId: inv.companyId,
      docType: inv.docType,
      status: inv.status,
      serialNo: inv.serialNo,
      docNo: inv.docNo,
      date: safeIso(inv.date),
      dueDate: inv.dueDate ? safeIso(inv.dueDate) : null,

      partyId: inv.partyId,
      customerName: inv.customerName,
      customerMobile: inv.customerMobile,
      customerPhone: inv.customerPhone,
      customerAddress: inv.customerAddress,

      subtotal: inv.subtotal,
      discount: inv.discount,
      shipping: inv.shipping,
      tax: inv.tax,
      total: inv.total,

      deliveryTime: inv.deliveryTime,
      storagePenalty: inv.storagePenalty,
      transportTerms: inv.transportTerms,
      notes: inv.notes,

      items: inv.items.map((it) => ({
        id: it.id,
        title: it.title,
        qty: Number(it.qty),
        unit: it.unit,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
        sortOrder: it.sortOrder,
        note: it.note,
      })),

      spec: inv.spec
        ? {
            dimensions: inv.spec.dimensions,
            area: inv.spec.area,
            chassis: inv.spec.chassis,
            profile: inv.spec.profile,
            bodySheet: inv.spec.bodySheet,
            roofSheet: inv.spec.roofSheet,
            interior: inv.spec.interior,
            insulationType: inv.spec.insulationType,

            floor: inv.spec.floor,
            bodyColor: inv.spec.bodyColor,
            door: inv.spec.door,
            window: inv.spec.window,
            extras: inv.spec.extras,
            strapSheet: inv.spec.strapSheet,
            gutter: inv.spec.gutter,
            service: inv.spec.service,
          }
        : null,

      // برای UI role-based
      meRole: me.role,
    });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(e?.message || "خطا در دریافت فاکتور", { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const { id: idStr } = await ctx.params;
    const id = mustInt(idStr, "id");

    const body = await req.json().catch(() => ({}));

    const inv = await prisma.invoice.findFirst({
      where: { id, companyId },
      select: { id: true, status: true, deletedAt: true },
    });
    if (!inv) return new NextResponse("فاکتور یافت نشد", { status: 404 });

    if (inv.deletedAt) return new NextResponse("فاکتور حذف شده و قابل ویرایش نیست", { status: 409 });
    if (inv.status === "CANCELLED") return new NextResponse("فاکتور باطل شده قابل ویرایش نیست", { status: 409 });

    const patch: any = {};

    if (body.status) patch.status = String(body.status).toUpperCase();

    if (body.date) {
      const d = new Date(body.date);
      if (Number.isNaN(d.getTime())) return new NextResponse("date نامعتبر است", { status: 400 });
      patch.date = d;
    }

    if (body.dueDate !== undefined) {
      if (!body.dueDate) patch.dueDate = null;
      else {
        const d = new Date(body.dueDate);
        if (Number.isNaN(d.getTime())) return new NextResponse("dueDate نامعتبر است", { status: 400 });
        patch.dueDate = d;
      }
    }

    if (body.customerName !== undefined) patch.customerName = safeStr(body.customerName, 200);
    if (body.customerMobile !== undefined) patch.customerMobile = safeStr(body.customerMobile, 50) || null;
    if (body.customerPhone !== undefined) patch.customerPhone = safeStr(body.customerPhone, 50) || null;
    if (body.customerAddress !== undefined) patch.customerAddress = safeStr(body.customerAddress, 500) || null;

    if (body.deliveryTime !== undefined) patch.deliveryTime = safeStr(body.deliveryTime, 200) || null;
    if (body.storagePenalty !== undefined) patch.storagePenalty = safeStr(body.storagePenalty, 200) || null;
    if (body.transportTerms !== undefined) patch.transportTerms = safeStr(body.transportTerms, 200) || null;
    if (body.notes !== undefined) patch.notes = safeStr(body.notes, 5000) || null;

    if (body.discount !== undefined) patch.discount = toInt(body.discount, 0);
    if (body.shipping !== undefined) patch.shipping = toInt(body.shipping, 0);
    if (body.tax !== undefined) patch.tax = toInt(body.tax, 0);

    const incomingItems = Array.isArray(body.items) ? body.items : null;

    // ✅ Transaction
    await prisma.$transaction(async (tx) => {
      // Update invoice head
      await tx.invoice.update({
        where: { id },
        data: patch,
      });

      // Items (replace-all)
      if (incomingItems) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

        let sortOrder = 0;
        const cleaned = incomingItems
          .map((x: any) => ({
            title: safeStr(x.title, 300),
            qty: toInt(x.qty, 0),
            unit: safeStr(x.unit, 40) || null,
            unitPrice: toInt(x.unitPrice, 0),
            note: safeStr(x.note, 500) || null,
            sortOrder: sortOrder++,
          }))
          .filter((x: any) => x.title && x.qty > 0);

        const totals = computeTotals(
          cleaned.map((x: any) => ({ qty: x.qty, unitPrice: x.unitPrice })),
          toInt(patch.discount ?? body.discount ?? 0, 0),
          toInt(patch.shipping ?? body.shipping ?? 0, 0),
          toInt(patch.tax ?? body.tax ?? 0, 0)
        );

        await tx.invoiceItem.createMany({
          data: cleaned.map((x: any) => ({
            invoiceId: id,
            title: x.title,
            qty: x.qty,
            unit: x.unit,
            unitPrice: x.unitPrice,
            lineTotal: Math.round((x.qty || 0) * (x.unitPrice || 0)),
            sortOrder: x.sortOrder,
            note: x.note,
          })),
        });

        await tx.invoice.update({
          where: { id },
          data: {
            subtotal: totals.subtotal,
            total: totals.total,
            discount: toInt(patch.discount ?? body.discount ?? 0, 0),
            shipping: toInt(patch.shipping ?? body.shipping ?? 0, 0),
            tax: toInt(patch.tax ?? body.tax ?? 0, 0),
          },
        });
      }

      // Spec upsert
      if (body.spec) {
        const s = body.spec || {};
        await tx.invoiceSpec.upsert({
          where: { invoiceId: id },
          create: {
            invoiceId: id,
            dimensions: safeStr(s.dimensions, 200) || null,
            area: safeStr(s.area, 200) || null,
            chassis: safeStr(s.chassis, 200) || null,
            profile: safeStr(s.profile, 200) || null,
            bodySheet: safeStr(s.bodySheet, 200) || null,
            roofSheet: safeStr(s.roofSheet, 200) || null,
            interior: safeStr(s.interior, 200) || null,
            insulationType: safeStr(s.insulationType, 200) || null,
            floor: safeStr(s.floor, 200) || null,
            bodyColor: safeStr(s.bodyColor, 200) || null,
            door: safeStr(s.door, 200) || null,
            window: safeStr(s.window, 200) || null,
            extras: safeStr(s.extras, 2000) || null,
            strapSheet: safeStr(s.strapSheet, 200) || null,
            gutter: safeStr(s.gutter, 200) || null,
            service: safeStr(s.service, 200) || null,
          },
          update: {
            dimensions: safeStr(s.dimensions, 200) || null,
            area: safeStr(s.area, 200) || null,
            chassis: safeStr(s.chassis, 200) || null,
            profile: safeStr(s.profile, 200) || null,
            bodySheet: safeStr(s.bodySheet, 200) || null,
            roofSheet: safeStr(s.roofSheet, 200) || null,
            interior: safeStr(s.interior, 200) || null,
            insulationType: safeStr(s.insulationType, 200) || null,
            floor: safeStr(s.floor, 200) || null,
            bodyColor: safeStr(s.bodyColor, 200) || null,
            door: safeStr(s.door, 200) || null,
            window: safeStr(s.window, 200) || null,
            extras: safeStr(s.extras, 2000) || null,
            strapSheet: safeStr(s.strapSheet, 200) || null,
            gutter: safeStr(s.gutter, 200) || null,
            service: safeStr(s.service, 200) || null,
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(e?.message || "خطا در ویرایش فاکتور", { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    if (me.role !== "ADMIN") {
      return new NextResponse("فقط ادمین مجاز به حذف است", { status: 403 });
    }

    const { id: idStr } = await ctx.params;
    const id = mustInt(idStr, "id");

    const inv = await prisma.invoice.findFirst({
      where: { id, companyId },
      select: { id: true, status: true, deletedAt: true },
    });
    if (!inv) return new NextResponse("فاکتور یافت نشد", { status: 404 });

    if (inv.status === "PAID") return new NextResponse("فاکتور تسویه‌شده قابل حذف نیست", { status: 409 });
    if (inv.deletedAt) return new NextResponse("قبلاً حذف شده", { status: 409 });

    await prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: me.id },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(e?.message || "خطا در حذف فاکتور", { status: 500 });
  }
}

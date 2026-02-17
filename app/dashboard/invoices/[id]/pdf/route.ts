import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";
import React from "react";
import path from "path";
import fs from "fs";
import { InvoicePdf } from "./InvoicePdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getParams(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
}

function mustInt(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error("id نامعتبر است");
  }
  return n;
}

function safeLogoDataUrl() {
  try {
    const logoPath = path.join(process.cwd(), "public", "brand", "logo.png");
    if (!fs.existsSync(logoPath)) return undefined;
    const buf = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

function safeFilename(name: string) {
  return (name || "invoice")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function safeDate(v: any) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function safeDocType(v: any): "PROFORMA" | "INVOICE" {
  return v === "INVOICE" ? "INVOICE" : "PROFORMA";
}

// ✅ JSON-safe number converter (Decimal/BigInt/string/undefined)
function num(v: any, fallback = 0) {
  if (v == null) return fallback;
  if (typeof v === "object" && typeof v.toNumber === "function") {
    const n = v.toNumber();
    return Number.isFinite(n) ? n : fallback;
  }
  if (typeof v === "bigint") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function safeStr(v: any, fallback = "") {
  if (v == null) return fallback;
  const s = String(v);
  return s.trim().length ? s : fallback;
}

export async function GET(
  _req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const me = await getMeServer();
    if (!me?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const companyId = me.companyId;

    const { id: idStr } = await getParams(ctx);
    const id = mustInt(idStr);

    const inv = await prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            qty: true,
            unit: true,
            unitPrice: true,
            lineTotal: true,
            type: true,
            productId: true,
          },
        },
        spec: true,
      },
    });

    if (!inv) return new NextResponse("فاکتور یافت نشد", { status: 404 });

    const logoUrl = safeLogoDataUrl();

    // ✅ آیتم‌ها را 100% امن و کامل می‌کنیم
    const safeItems = (inv.items || []).map((it) => {
      const qty = Math.max(0, num(it.qty, 0));
      const lineTotalRaw = num(it.lineTotal, 0);
      const unitPriceRaw = num(it.unitPrice, 0);

      // اگر یکی از این‌ها خالی بود، از دیگری نتیجه بگیر
      // (برای آیتم‌های سفارشی قدیمی که فقط lineTotal دارند)
      const unitPrice =
        unitPriceRaw > 0
          ? unitPriceRaw
          : qty > 0
            ? Math.round(lineTotalRaw / qty)
            : 0;

      const lineTotal =
        lineTotalRaw > 0 ? lineTotalRaw : Math.round(qty * unitPrice);

      return {
        id: it.id,
        title: safeStr(it.title, "آیتم سفارشی"),
        qty,
        unit: safeStr(it.unit, "عدد"),
        unitPrice,
        lineTotal,
      };
    });

    const props = {
      invoiceId: inv.id,
      companyId: inv.companyId,

      workshop: {
        name: "گروه صنعتی نیکان سازه پایدار",
        phones: ["09124237146", "09123679252"],
        instagram: "conexnikan1",
        website: "conexnikan.com",
        address:
          "تهران، اتوبان آزادگان غرب به شرق، بعد از اتوبان ساوه - کوچه امید - کانکس نیکان",
        logoUrl,
      },

      docType: safeDocType((inv as any).docType),
      docNo: (inv as any).docNo || String(inv.id),
      date: safeDate((inv as any).date),

      customer: {
        name: safeStr((inv as any).customerName, ""),
        mobile: safeStr((inv as any).customerMobile, ""),
        phone: safeStr((inv as any).customerPhone, ""),
        address: safeStr((inv as any).customerAddress, ""),
      },

      spec: inv.spec
        ? {
            dimensions: safeStr(inv.spec.dimensions, ""),
            area: safeStr(inv.spec.area, ""),
            chassis: safeStr(inv.spec.chassis, ""),
            profile: safeStr(inv.spec.profile, ""),
            bodySheet: safeStr(inv.spec.bodySheet, ""),
            roofSheet: safeStr(inv.spec.roofSheet, ""),
            interior: safeStr(inv.spec.interior, ""),
            insulationType: safeStr(inv.spec.insulationType, ""),
            floor: safeStr(inv.spec.floor, ""),
            bodyColor: safeStr(inv.spec.bodyColor, ""),
            door: safeStr(inv.spec.door, ""),
            window: safeStr(inv.spec.window, ""),
            extras: safeStr(inv.spec.extras, ""),
            strapSheet: safeStr(inv.spec.strapSheet, ""),
            gutter: safeStr(inv.spec.gutter, ""),
            service: safeStr(inv.spec.service, ""),
          }
        : null,

      items: safeItems,

      totals: {
        subtotal: num((inv as any).subtotal, 0),
        discount: num((inv as any).discount, 0),
        shipping: num((inv as any).shipping, 0),
        tax: num((inv as any).tax, 0),
        total: num((inv as any).total, 0),
      },

      terms: {
        deliveryTime: safeStr((inv as any).deliveryTime, ""),
        transportTerms: safeStr((inv as any).transportTerms, ""),
        storagePenalty: safeStr((inv as any).storagePenalty, ""),
        notes: safeStr((inv as any).notes, ""),
      },
    };

    const { renderToBuffer } = await import("@react-pdf/renderer");

    let pdfBuffer: Buffer;
    try {
      const element = React.createElement(InvoicePdf as any, props as any);
      pdfBuffer = await renderToBuffer(element);
    } catch (err: any) {
      console.error("PDF_RENDER_ERROR:", err?.message);
      console.error("PDF_RENDER_STACK:", err?.stack);

      console.error("PDF_DIAG:", {
        invoiceId: props.invoiceId,
        docNo: props.docNo,
        itemsCount: props.items?.length ?? 0,
        hasSpec: !!props.spec,
        itemTypes: (inv.items || []).map((x) => x.type),
        itemsLite: (inv.items || []).map((x) => ({
          id: x.id,
          type: x.type,
          productId: x.productId ?? null,
          title: x.title,
          qty: x.qty,
          unitPrice: x.unitPrice,
          lineTotal: x.lineTotal,
        })),
      });

      return NextResponse.json(
        { error: err?.message || "PDF render failed" },
        { status: 500 }
      );
    }

    const filename = safeFilename(props.docNo);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("GET /dashboard/invoices/[id]/pdf error:", err);
    return NextResponse.json(
      { error: err?.message || "خطا در تولید PDF فاکتور" },
      { status: 500 }
    );
  }
}

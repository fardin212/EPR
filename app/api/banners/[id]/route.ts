// app/api/banners/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// سازگار با هر دو حالت params (Promise یا آبجکت)
type RouteContext = { params: { id: string } | Promise<{ id: string }> };
async function getParams(ctx: RouteContext): Promise<{ id: string }> {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
}

// GET /api/banners/:id
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await getParams(ctx);
  const bid = Number(id);
  if (!Number.isFinite(bid)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const banner = await prisma.banner.findUnique({
    where: { id: bid },
    select: {
      id: true,
      title: true,
      link: true,
      imageUrl: true,
      sort: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!banner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(banner);
}

// PATCH /api/banners/:id
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await getParams(ctx);
  const bid = Number(id);
  if (!Number.isFinite(bid)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // نگاشت صحیح فیلدها: linkUrl -> link ، order -> sort (در صورت ارسال)
  const data: {
    title?: string;
    link?: string;
    imageUrl?: string;
    sort?: number;
    active?: boolean;
  } = {};

  if (typeof body.title !== "undefined") {
    const v = String(body.title).trim();
    if (v) data.title = v;
  }

  // اجازه بده هم link و هم linkUrl کار کنند
  const linkRaw =
    typeof body.link !== "undefined"
      ? String(body.link)
      : typeof body.linkUrl !== "undefined"
      ? String(body.linkUrl)
      : undefined;
  if (typeof linkRaw !== "undefined") {
    const v = linkRaw.trim();
    // اگر خالی بود، مقدار را undefined می‌گذاریم تا تغییری ندهد
    if (v) data.link = v;
  }

  if (typeof body.imageUrl !== "undefined") {
    const v = String(body.imageUrl).trim();
    if (v) data.imageUrl = v;
  }

  // order یا sort → sort
  const sortRaw =
    typeof body.sort !== "undefined"
      ? body.sort
      : typeof body.order !== "undefined"
      ? body.order
      : undefined;
  if (typeof sortRaw !== "undefined") {
    const n = Number(sortRaw);
    if (Number.isFinite(n)) data.sort = n;
  }

  if (typeof body.active !== "undefined") {
    data.active = Boolean(body.active);
  }

  try {
    const updated = await prisma.banner.update({
      where: { id: bid },
      data,
      select: {
        id: true,
        title: true,
        link: true,
        imageUrl: true,
        sort: true,
        active: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Update failed", detail: e?.message || String(e) },
      { status: 400 }
    );
  }
}

// DELETE /api/banners/:id
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await getParams(ctx);
  const bid = Number(id);
  if (!Number.isFinite(bid)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.banner.delete({ where: { id: bid } });
  return NextResponse.json({ ok: true });
}

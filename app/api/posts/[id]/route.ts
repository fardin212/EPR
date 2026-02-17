import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// سازگار با هر دو مدل: params هم می‌تواند مستقیم باشد هم Promise
type RouteContext = { params: { id: string } | Promise<{ id: string }> };

// یک کمک‌تابع کوچک برای گرفتن params در هر دو حالت
async function getParams(ctx: RouteContext): Promise<{ id: string }> {
  const p = (ctx as any).params;
  return (typeof p?.then === "function") ? await p : p;
}

// GET /api/posts/:id
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await getParams(ctx);
  const idNum = Number(id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: idNum },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}

// PATCH /api/posts/:id
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await getParams(ctx);
  const idNum = Number(id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json()) as Partial<{
    slug: string;
    title: string;
    status: "DRAFT" | "PUBLISHED";
    publishedAt: string | null;
  }>;

  const updated = await prisma.post.update({
    where: { id: idNum },
    data: {
      slug: body.slug ?? undefined,
      title: body.title ?? undefined,
      status: (body.status as any) ?? undefined,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/posts/:id
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await getParams(ctx);
  const idNum = Number(id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.post.delete({ where: { id: idNum } });
  return NextResponse.json({ ok: true });
}

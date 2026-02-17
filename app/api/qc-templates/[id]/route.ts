// app/api/qc-templates/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===================== Utils ===================== */

async function getParams(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
}

function mustInt(v: any, name = "id") {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است.`);
  }
  return n;
}

function defaultStageName(stageOrder: number) {
  return `مرحله ${stageOrder}`;
}

function cleanStageName(raw: any, fallback: string) {
  const t = String(raw ?? "").trim();
  return t || fallback;
}

function jsonError(err: any, fallback: string, status = 400) {
  return NextResponse.json({ error: err?.message || fallback }, { status });
}

/**
 * ✅ select مینیمال
 */
const qcItemSelect = {
  id: true,
  templateId: true,
  stageOrder: true,
  stageName: true,
  title: true,
  description: true,
  isRequired: true,
  defaultStatus: true,
} as const;

/* ===================== Template Helper ===================== */

async function getOrCreateTemplate(projectTypeId: number) {
  // ✅ در schema شما projectTypeId ندارید → relation
  let tpl = await prisma.qcTemplate.findFirst({
    where: {
      projectType: { id: projectTypeId },
    },
    select: { id: true },
  });

  if (tpl?.id) return tpl;

  const created = await prisma.qcTemplate.create({
    data: {
      title: `QC Template - PT#${projectTypeId}`,
      isDefault: true,
      projectType: { connect: { id: projectTypeId } },
    } as any,
    select: { id: true },
  });

  return created;
}

/* ===================== GET ===================== */
/**
 * GET /api/qc-templates/:projectTypeId
 */
export async function GET(
  _req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    await getMeServer();

    const { id } = await getParams(ctx);
    const projectTypeId = mustInt(id, "شناسه نوع پروژه");

    const tpl = await prisma.qcTemplate.findFirst({
      where: { projectType: { id: projectTypeId } },
      select: { id: true },
    });

    // ✅ مهم: هم items و هم length
    if (!tpl?.id) return NextResponse.json({ items: [], length: 0 });

    const items = await prisma.qcTemplateItem.findMany({
      where: { templateId: tpl.id },
      orderBy: [{ stageOrder: "asc" }, { id: "asc" }],
      select: qcItemSelect,
    });

    const mappedItems = items.map((x) => {
      const fallback = defaultStageName(Number(x.stageOrder) || 1);
      return {
        id: x.id,
        projectTypeId,
        templateId: x.templateId,
        stageOrder: x.stageOrder,
        stageName: cleanStageName(x.stageName, fallback),
        title: x.title,
        description: x.description ?? "",
        isRequired: Boolean(x.isRequired),
        defaultStatus: x.defaultStatus ?? null,
      };
    });

    return NextResponse.json({
      items: mappedItems,
      length: mappedItems.length, // ✅ سازگاری با چک‌های data.length
    });
  } catch (err: any) {
    return jsonError(err, "خطا در دریافت QC");
  }
}

/* ===================== POST ===================== */
/**
 * POST /api/qc-templates/:projectTypeId
 */
export async function POST(
  req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    await getMeServer();

    const { id } = await getParams(ctx);
    const projectTypeId = mustInt(id, "شناسه نوع پروژه");

    const body = await req.json();

    const title = String(body?.title ?? "").trim();
    if (!title) return jsonError(null, "عنوان آیتم QC الزامی است.");

    const stageOrder = Number(body?.stageOrder ?? 1) || 1;
    const stageName = cleanStageName(body?.stageName, defaultStageName(stageOrder));
    const description = String(body?.description ?? "").trim();
    const isRequired = Boolean(body?.isRequired);

    const tpl = await getOrCreateTemplate(projectTypeId);

    const item = await prisma.qcTemplateItem.create({
      data: {
        templateId: tpl.id,
        stageOrder,
        stageName,
        title,
        description,
        isRequired,
      } as any,
      select: qcItemSelect,
    });

    return NextResponse.json({
      item: {
        ...item,
        projectTypeId,
        stageName: cleanStageName(item.stageName, defaultStageName(item.stageOrder)),
      },
    });
  } catch (err: any) {
    return jsonError(err, "خطا در افزودن آیتم QC");
  }
}

/* ===================== PATCH ===================== */
/**
 * PATCH /api/qc-templates/:projectTypeId
 */
export async function PATCH(
  req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    await getMeServer();

    const { id } = await getParams(ctx);
    const projectTypeId = mustInt(id, "شناسه نوع پروژه");

    const body = await req.json();
    const itemId = mustInt(body?.id, "شناسه آیتم");

    const data: any = {};

    if (body?.title != null) {
      const t = String(body.title).trim();
      if (!t) return jsonError(null, "عنوان آیتم QC الزامی است.");
      data.title = t;
    }
    if (body?.description != null) data.description = String(body.description ?? "");
    if (body?.isRequired != null) data.isRequired = Boolean(body.isRequired);
    if (body?.defaultStatus != null) data.defaultStatus = body.defaultStatus;

    if (body?.stageOrder != null) {
      const so = Number(body.stageOrder) || 1;
      data.stageOrder = so;
      data.stageName = cleanStageName(body?.stageName, defaultStageName(so));
    } else if (body?.stageName != null) {
      data.stageName = cleanStageName(body.stageName, defaultStageName(1));
    }

    const tpl = await prisma.qcTemplate.findFirst({
      where: { projectType: { id: projectTypeId } },
      select: { id: true },
    });
    if (!tpl?.id) return jsonError(null, "QC Template برای این نوع پروژه وجود ندارد.", 404);

    const item = await prisma.qcTemplateItem.update({
      where: { id: itemId },
      data,
      select: qcItemSelect,
    });

    return NextResponse.json({
      item: {
        ...item,
        projectTypeId,
        stageName: cleanStageName(item.stageName, defaultStageName(item.stageOrder)),
      },
    });
  } catch (err: any) {
    return jsonError(err, "خطا در ویرایش آیتم QC");
  }
}

/* ===================== DELETE ===================== */
/**
 * DELETE /api/qc-templates/:projectTypeId
 */
export async function DELETE(
  req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    await getMeServer();

    const { id } = await getParams(ctx);
    mustInt(id, "شناسه نوع پروژه");

    const body = await req.json().catch(() => ({}));
    const itemId = mustInt(body?.id, "شناسه آیتم");

    await prisma.qcTemplateItem.delete({ where: { id: itemId } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return jsonError(err, "خطا در حذف آیتم QC");
  }
}

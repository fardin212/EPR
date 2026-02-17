// app/api/qc-templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===================== Utils ===================== */

function mustInt(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است.`);
  }
  return n;
}

function mustNonEmptyStr(v: any, name: string) {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`${name} الزامی است.`);
  return s;
}

function mustStageOrder(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > 99) {
    throw new Error("stageOrder نامعتبر است (۱ تا ۹۹).");
  }
  return n;
}

function defaultStageName(stageOrder: number) {
  return `مرحله ${stageOrder}`;
}

function cleanStageName(raw: any, fallback: string) {
  const t = String(raw ?? "").trim();
  if (!t) return fallback;

  // الگوهای خراب شایع: "".
  const cleaned = t
    .replace(/^""\.\s*/g, "")
    .replace(/^"\."\s*/g, "")
    .replace(/^\.+\s*/g, "")
    .trim();

  return cleaned || fallback;
}

function jsonError(err: any, fallback: string, status = 400) {
  return NextResponse.json({ error: err?.message || fallback }, { status });
}

/**
 * ✅ select مینیمال مطابق DB واقعی شما (QcTemplateItem فقط ۸ ستون دارد)
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

/* ===================== GET ===================== */
/**
 * GET /api/qc-templates?projectTypeId=1
 */
export async function GET(req: NextRequest) {
  try {
    await getMeServer();

    const projectTypeId = mustInt(
      req.nextUrl.searchParams.get("projectTypeId"),
      "projectTypeId"
    );

    const tpl = await prisma.qcTemplate.findFirst({
      where: { projectTypeId },
      select: { id: true },
    });

    if (!tpl?.id) return NextResponse.json({ items: [] });

    const items = await prisma.qcTemplateItem.findMany({
      where: { templateId: tpl.id },
      orderBy: [{ stageOrder: "asc" }, { id: "asc" }],
      select: qcItemSelect,
    });

    return NextResponse.json({
      items: items.map((x) => {
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
      }),
    });
  } catch (err: any) {
    return jsonError(err, "خطا در دریافت QC Template");
  }
}

/* ===================== POST ===================== */
/**
 * POST /api/qc-templates
 * body: { projectTypeId, stageOrder, stageName?, title, description?, isRequired?, defaultStatus? }
 */
export async function POST(req: NextRequest) {
  try {
    await getMeServer();

    const body = await req.json();

    const projectTypeId = mustInt(body.projectTypeId, "projectTypeId");
    const stageOrder = mustStageOrder(body.stageOrder ?? 1);
    const title = mustNonEmptyStr(body.title, "title");

    const fallback = defaultStageName(stageOrder);
    const stageName = cleanStageName(String(body.stageName ?? ""), fallback);

    const description = String(body.description ?? "");
    const isRequired = Boolean(body.isRequired ?? true);
    const defaultStatus = body.defaultStatus ?? null;

    const created = await prisma.$transaction(async (tx) => {
      let tpl = await tx.qcTemplate.findFirst({
        where: { projectTypeId },
        select: { id: true },
      });

      if (!tpl?.id) {
        tpl = await tx.qcTemplate.create({
          data: {
            projectTypeId,
            title: `QC Template - PT#${projectTypeId}`,
            isDefault: false,
          } as any,
          select: { id: true },
        });
      }

      return tx.qcTemplateItem.create({
        data: {
          templateId: tpl.id,
          stageOrder,
          stageName,
          title,
          description,
          isRequired,
          ...(defaultStatus ? { defaultStatus } : {}),
        } as any,
        select: qcItemSelect,
      });
    });

    return NextResponse.json(
      {
        id: created.id,
        projectTypeId,
        templateId: created.templateId,
        stageOrder: created.stageOrder,
        stageName: cleanStageName(created.stageName, fallback),
        title: created.title,
        description: created.description ?? "",
        isRequired: Boolean(created.isRequired),
        defaultStatus: created.defaultStatus ?? null,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return jsonError(err, "خطا در ثبت آیتم QC");
  }
}

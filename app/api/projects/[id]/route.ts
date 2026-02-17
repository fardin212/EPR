// app/api/projects/[id]/route.ts
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

function pickCompanyId(me: any) {
  return (
    Number(me?.companyId) ||
    Number(me?.company?.id) ||
    Number(me?.user?.companyId) ||
    Number(me?.user?.company?.id) ||
    0
  );
}

/**
 * مشتری/طرف حساب از جدول Party می‌آید.
 * این تابع فقط برای نمایش نام استفاده می‌شود و چیزی را در Project ذخیره نمی‌کند.
 */
async function resolveCustomerName(companyId: number, customerId: number) {
  const party = await prisma.party.findFirst({
    where: { id: customerId, companyId },
    select: { name: true },
  });
  return party?.name ?? null;
}

/* ===================== GET ===================== */

export async function GET(
  req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const me = await getMeServer();
    const companyId = pickCompanyId(me);
    if (!companyId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id } = await getParams(ctx);
    const projectId = mustInt(id, "شناسه پروژه");

    const url = new URL(req.url);
    const include = (url.searchParams.get("include") || "").trim(); // "qc"

    // ❌ customerName در Prisma Schema وجود ندارد => حذف شد
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        companyId,
        isDeleted: false,
        deletedAt: null,
      },
      select: {
        id: true,
        companyId: true,
        title: true,
        type: true,
        projectTypeId: true,
        size: true,
        code: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        customerId: true,
        bomTemplateId: true,
        specFrame: true,
        specWalls: true,
        specInterior: true,
        specMEP: true,
        specLogistic: true,

        // ✅ برای نمایش نام مشتری (اختیاری ولی بهتر از query جدا)
        customerParty: {
          select: { id: true, name: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "پروژه پیدا نشد." }, { status: 404 });
    }

    // ✅ customerName فقط برای خروجی API محاسبه می‌شود
    const customerNameResolved =
      project.customerParty?.name ??
      (project.customerId ? await resolveCustomerName(companyId, project.customerId) : null);

    let projectType: any = null;
    if (project.projectTypeId) {
      projectType = await prisma.projectType.findFirst({
        where: { id: project.projectTypeId },
        select: { id: true, name: true, code: true, description: true },
      });
    }

    // ===== QC Summary (Always) =====
    const qcBase = await prisma.projectStageChecklistItem.findMany({
      where: { stage: { projectId: project.id } },
      select: { isRequired: true, status: true },
    });

    let required = 0,
      passed = 0,
      failed = 0,
      pending = 0;

    for (const it of qcBase) {
      if (!it.isRequired) continue;
      required++;
      if (it.status === "PASSED") passed++;
      else if (it.status === "FAILED") failed++;
      else pending++;
    }

    const progress = required > 0 ? Math.round((passed / required) * 100) : 0;
    const qcSummary = { required, passed, failed, pending, progress };

    // ===== include=qc =====
    if (include === "qc") {
      const stages = await prisma.projectStage.findMany({
        where: { projectId: project.id },
        select: {
          id: true,
          name: true,
          status: true,
          startedAt: true,
          finishedAt: true,
          note: true,
          checklist: {
            select: {
              id: true,
              title: true,
              description: true,
              isRequired: true,
              status: true,
              checkedAt: true,
              checkedById: true,
              note: true,
              checkedBy: { select: { id: true, name: true } },
            },
            orderBy: { id: "asc" },
          },
        },
        orderBy: { id: "asc" },
      });

      const qcStages = stages.map((s) => {
        let r = 0,
          p = 0,
          f = 0,
          pn = 0;

        for (const it of s.checklist) {
          if (!it.isRequired) continue;
          r++;
          if (it.status === "PASSED") p++;
          else if (it.status === "FAILED") f++;
          else pn++;
        }

        const prog = r > 0 ? Math.round((p / r) * 100) : 0;

        return {
          ...s,
          qcSummary: { required: r, passed: p, failed: f, pending: pn, progress: prog },
        };
      });

      // ✅ customerParty را هم می‌توانی نگه داری یا حذف کنی (اینجا نگه داشتیم)
      return NextResponse.json({
        ...project,
        customerName: customerNameResolved,
        projectType,
        qcSummary,
        qcStages,
      });
    }

    return NextResponse.json({
      ...project,
      customerName: customerNameResolved,
      projectType,
      qcSummary,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "خطا در دریافت پروژه" },
      { status: 400 }
    );
  }
}

/* ===================== PATCH ===================== */

export async function PATCH(
  req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const me = await getMeServer();
    const companyId = pickCompanyId(me);
    if (!companyId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id } = await getParams(ctx);
    const projectId = mustInt(id, "شناسه پروژه");

    const body = await req.json();

    const data: any = {};
    const allow = [
      "title",
      "type",
      "projectTypeId",
      "size",
      "name",
      "code",
      "description",
      "startDate",
      "endDate",
      "status",
      "customerId",
      "bomTemplateId",
      "specFrame",
      "specWalls",
      "specInterior",
      "specMEP",
      "specLogistic",
    ] as const;

    for (const k of allow) {
      if (Object.prototype.hasOwnProperty.call(body, k)) data[k] = body[k];
    }

    if (typeof data.startDate === "string" && data.startDate) data.startDate = new Date(data.startDate);
    if (typeof data.endDate === "string" && data.endDate) data.endDate = new Date(data.endDate);

    // ✅ فقط customerId را validate می‌کنیم. customerName دیگر ذخیره نمی‌شود.
    if (typeof data.customerId !== "undefined" && data.customerId !== null) {
      const cid = mustInt(data.customerId, "شناسه مشتری");
      data.customerId = cid;

      // ✅ اختیاری: اطمینان از وجود Party
      const exists = await prisma.party.findFirst({
        where: { id: cid, companyId },
        select: { id: true },
      });
      if (!exists) {
        return NextResponse.json({ error: "مشتری/طرف حساب یافت نشد." }, { status: 400 });
      }
    }

    const updated = await prisma.project.updateMany({
      where: {
        id: projectId,
        companyId,
        isDeleted: false,
        deletedAt: null,
      },
      data,
    });

    if (!updated.count) {
      return NextResponse.json({ error: "پروژه پیدا نشد." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "خطا در ویرایش پروژه" },
      { status: 400 }
    );
  }
}

/* ===================== DELETE (Soft) ===================== */

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const me = await getMeServer();
    const companyId = pickCompanyId(me);
    if (!companyId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id } = await getParams(ctx);
    const projectId = mustInt(id, "شناسه پروژه");

    const res = await prisma.project.updateMany({
      where: {
        id: projectId,
        companyId,
        isDeleted: false,
        deletedAt: null,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    if (!res.count) {
      return NextResponse.json({ error: "پروژه پیدا نشد." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "خطا در حذف پروژه" },
      { status: 400 }
    );
  }
}

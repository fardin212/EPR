// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth"; // همان فایل auth خودت
import { QCStatus } from "@prisma/client";

function mustInt(v: any, name = "id") {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است.`);
  }
  return n;
}

function isUniqueConstraintError(e: any) {
  return e?.code === "P2002" || String(e?.message || "").includes("Unique constraint");
}

// ===== QC apply helpers (همان چیزی که داشتی) =====
const STAGE_DEFS = ["طراحی", "برش", "اسکلت", "دیوار", "سقف", "برق", "لوله", "کف", "رنگ", "تحویل"];

async function applyQcTemplateForProject(tx: any, projectId: number, projectTypeId: number | null) {
  if (!projectTypeId) return;

  const template = await tx.qcTemplate.findFirst({
    where: { projectTypeId },
    include: { items: { orderBy: [{ stageOrder: "asc" }, { id: "asc" }] } },
  });

  if (!template) return;

  const stages = await tx.projectStage.findMany({
    where: { projectId },
    orderBy: { id: "asc" },
    select: { id: true, name: true },
  });

  const checklistData: any[] = [];

  for (const item of template.items) {
    let targetStage: any = null;

    if (item.stageOrder && item.stageOrder > 0) {
      const idx = item.stageOrder - 1;
      if (idx >= 0 && idx < stages.length) targetStage = stages[idx];
    }

    if (!targetStage) {
      targetStage = stages.find((s: any) => s.name === item.stageName) || null;
    }

    if (!targetStage) continue;

    checklistData.push({
      stageId: targetStage.id,
      title: item.title,
      description: item.description ?? null,
      isRequired: item.isRequired,
      status: item.defaultStatus ?? QCStatus.PENDING,
      checklistTemplateId: item.id,
    });
  }

  if (checklistData.length > 0) {
    await tx.projectStageChecklistItem.createMany({ data: checklistData });
  }
}

// محاسبه progress پروژه (فقط required ها)
async function calcProgressForProjects(companyId: number, projectIds: number[]) {
  if (projectIds.length === 0) return new Map<number, number>();

  const requiredItems = await prisma.projectStageChecklistItem.findMany({
    where: {
      isRequired: true,
      stage: { project: { companyId, isDeleted: false, deletedAt: null } },
      // Prisma اجازه دو تا stage را نمی‌دهد؛ یکی‌اش کافی است:
      // stage: { projectId: { in: projectIds } },
      stage: { projectId: { in: projectIds } },
    },
    select: {
      status: true,
      stage: { select: { projectId: true } },
    },
  });

  const total = new Map<number, number>();
  const passed = new Map<number, number>();

  for (const it of requiredItems) {
    const pid = it.stage.projectId;
    total.set(pid, (total.get(pid) || 0) + 1);
    if (it.status === "PASSED") passed.set(pid, (passed.get(pid) || 0) + 1);
  }

  const out = new Map<number, number>();
  for (const pid of projectIds) {
    const t = total.get(pid) || 0;
    const p = passed.get(pid) || 0;
    out.set(pid, t === 0 ? 0 : Math.round((p / t) * 100));
  }
  return out;
}

// GET
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const statusParam = searchParams.get("status");
    const q = (searchParams.get("q") || "").trim();

    // GET by id (برای صفحات جزئیات)
    if (idParam) {
      const id = mustInt(idParam, "شناسه پروژه");

      const project = await prisma.project.findFirst({
        where: { id, companyId: user.companyId, isDeleted: false, deletedAt: null },
        include: {
          stages: {
            orderBy: { id: "asc" },
            include: { checklist: { orderBy: { id: "asc" } } },
          },
          customerParty: true,
          projectType: true,
          bomTemplate: true,
          contractors: {
            include: {
              contractor: { include: { party: true } },
            },
          },
        },
      });

      if (!project) return NextResponse.json({ error: "پروژه پیدا نشد." }, { status: 404 });

      const required = project.stages
        .flatMap((s: any) => s.checklist || [])
        .filter((x: any) => x.isRequired);
      const total = required.length;
      const passedCount = required.filter((x: any) => x.status === "PASSED").length;
      const progress = total ? Math.round((passedCount / total) * 100) : 0;

      return NextResponse.json({
        ...project,
        customerName: project.customerParty?.name ?? null,
        progress,
      });
    }

    const where: any = { companyId: user.companyId, isDeleted: false, deletedAt: null };

    if (statusParam && ["IN_PROGRESS", "COMPLETED", "STOPPED"].includes(statusParam)) {
      where.status = statusParam;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { customerParty: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        projectType: { select: { id: true, name: true, code: true } },
        customerParty: { select: { id: true, name: true, mobile: true, phone: true } },
        bomTemplate: { select: { id: true, title: true } },
      },
    });

    const ids = projects.map((p) => p.id);
    const progressMap = await calcProgressForProjects(user.companyId, ids);

    const out = projects.map((p) => ({
      id: p.id,
      title: p.title,
      code: p.code,
      name: p.name,
      status: p.status,
      type: p.type,
      startDate: p.startDate,
      endDate: p.endDate,

      customerId: p.customerId,
      customerName: p.customerParty?.name ?? null,

      projectTypeId: p.projectTypeId,
      projectTypeName: p.projectType?.name ?? null,
      bomTemplateId: p.bomTemplateId,
      progress: progressMap.get(p.id) ?? 0,
    }));

    return NextResponse.json(out);
  } catch (err) {
    console.error("Error in GET /api/projects:", err);
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 });
  }
}

// POST
type CreateProjectBody = {
  title: string;
  name?: string | null;
  type: string;
  size?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: any;
  customerId: number;
  projectTypeId?: number | null;
  bomTemplateId?: number | null;
  contractorIds?: number[];
  code?: string | null;
};

async function generateNextProjectCode(tx: any, companyId: number, projectTypeId: number, now: Date) {
  // این تابع در پروژه شما وجود داشته؛ اگر داری از همان استفاده کن.
  // اینجا یک نسخه ساده گذاشتم که با الگوی قبلی‌ات نزدیک است.
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `PRJ-${ym}-C${companyId}-PT${projectTypeId}-`;

  const last = await tx.project.findFirst({
    where: { companyId, code: { startsWith: prefix } },
    orderBy: { code: "desc" },
    select: { code: true },
  });

  const lastNum = last?.code?.split("-").pop();
  const n = lastNum ? Number(lastNum) : 0;
  const next = Number.isFinite(n) ? n + 1 : 1;

  return `${prefix}${String(next).padStart(4, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const body = (await req.json()) as CreateProjectBody;

    if (!body.title || !body.type || !body.customerId) {
      return NextResponse.json(
        { error: "عنوان، کارفرما و نوع پروژه اجباری است." },
        { status: 400 }
      );
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const customerId = mustInt(body.customerId, "شناسه مشتری");

      const customerParty = await tx.party.findFirst({
        where: { id: customerId, companyId: user.companyId },
        select: { id: true, name: true },
      });

      if (!customerParty) {
        throw new Error("کارفرما یافت نشد یا متعلق به این شرکت نیست.");
      }

      const ptid = body.projectTypeId ? mustInt(body.projectTypeId, "ProjectType") : null;

      let code: string;
      if (ptid) code = await generateNextProjectCode(tx, user.companyId, ptid, now);
      else code = `P-${user.companyId}-${Date.now()}`;

      const name = (body.name?.trim() || body.title.trim() || code).trim();

      let project: any = null;

      for (let attempt = 0; attempt < 10; attempt++) {
        try {
          project = await tx.project.create({
            data: {
              title: body.title.trim(),
              customerId: customerParty.id, // ✅ فقط همین
              type: body.type,
              size: body.size ?? null,
              description: body.description ?? null,
              startDate: body.startDate ? new Date(body.startDate) : null,
              endDate: body.endDate ? new Date(body.endDate) : null,
              code,
              name,
              companyId: user.companyId,
              projectTypeId: ptid,
              bomTemplateId: body.bomTemplateId ?? null,
              status: body.status ?? "IN_PROGRESS",
              isDeleted: false,
              deletedAt: null,
              createdAt: now,
              updatedAt: now,
            },
          });
          break;
        } catch (e: any) {
          if (!isUniqueConstraintError(e)) throw e;
          if (ptid) code = await generateNextProjectCode(tx, user.companyId, ptid, now);
          else code = `P-${user.companyId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        }
      }

      if (!project) throw new Error("ثبت پروژه ناموفق بود. (retry code)");

      await tx.projectStage.createMany({
        data: STAGE_DEFS.map((stageName) => ({ projectId: project.id, name: stageName })),
      });

      const contractorIds = body.contractorIds ?? [];
      if (contractorIds.length > 0) {
        await tx.projectContractor.createMany({
          data: contractorIds.map((cid) => ({ projectId: project.id, contractorId: cid })),
        });
      }

      await applyQcTemplateForProject(tx, project.id, ptid);

      return project;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/projects:", err);
    return NextResponse.json({ error: err?.message || "خطا در ایجاد پروژه" }, { status: 500 });
  }
}

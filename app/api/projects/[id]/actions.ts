// app/dashboard/projects/[id]/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";
import { revalidatePath } from "next/cache";

function mustInt(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است.`);
  }
  return n;
}

function toNumber(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

async function syncProjectLock(projectId: number, companyId: number) {
  const total = await prisma.projectContractor.count({
    where: { projectId, companyId },
  });
  if (total === 0) return;

  const notDone = await prisma.projectContractor.count({
    where: { projectId, companyId, status: { not: "DONE" } },
  });

  const project = await prisma.project.findFirst({
    where: { id: projectId, companyId, deletedAt: null, isDeleted: false },
    select: { status: true, endDate: true },
  });
  if (!project) return;
  if (project.status === "STOPPED") return;

  if (notDone === 0) {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "COMPLETED", endDate: project.endDate ?? new Date() },
    });
  } else {
    if (project.status === "COMPLETED") {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "IN_PROGRESS" },
      });
    }
  }
}

export async function addProjectContractor(input: {
  projectId: number;
  contractorId: number;
  agreedAmount: number;
  role?: string;
  note?: string;
  startDate?: string;
  endDate?: string;
}) {
  const me = await getMeServer();
  const companyId =
    Number((me as any)?.companyId) ||
    Number((me as any)?.company?.id) ||
    Number((me as any)?.user?.companyId) ||
    Number((me as any)?.user?.company?.id);

  if (!companyId) throw new Error("عدم دسترسی شرکت");

  const projectId = mustInt(input.projectId, "پروژه");
  const contractorId = mustInt(input.contractorId, "پیمانکار");

  await prisma.projectContractor.create({
    data: {
      companyId,
      projectId,
      contractorId,
      agreedAmount: toNumber(input.agreedAmount, 0),
      role: input.role || null,
      note: input.note || null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      status: "ACTIVE",
    },
  });

  await syncProjectLock(projectId, companyId);

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: true };
}

// app/api/projects/[id]/stages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = { params: { id: string } };

// PATCH /api/projects/[id]/stages → تغییر وضعیت یک مرحله
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const projectId = Number(params.id);
  if (!projectId) {
    return NextResponse.json({ error: "شناسه پروژه نامعتبر است" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { stageId, status } = body;

    if (!stageId || !status) {
      return NextResponse.json(
        { error: "شناسه مرحله و وضعیت جدید الزامی است" },
        { status: 400 }
      );
    }

    const now = new Date();

    const updatedStage = await prisma.projectStage.update({
      where: { id: Number(stageId) },
      data: {
        status,
        startedAt: status === "ACTIVE" ? now : undefined,
        finishedAt: status === "DONE" ? now : undefined,
      },
    });

    return NextResponse.json(updatedStage);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی مرحله" },
      { status: 500 }
    );
  }
}

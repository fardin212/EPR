// app/api/project-stages/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { StageStatus } from "@prisma/client";

// نوع اکشن‌هایی که از سمت فرانت می‌فرستیم
type StageAction = "start" | "finish" | "reset" | "approve" | "unapprove";

// ⚠️ در Next.js جدید params به صورت Promise می‌آید
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // ✅ باز کردن params با await
    const { id } = await context.params;
    const stageId = Number(id);

    if (Number.isNaN(stageId)) {
      return NextResponse.json(
        { error: "شناسه مرحله نامعتبر است." },
        { status: 400 },
      );
    }

    const body = (await req.json().catch(() => null)) as {
      action?: StageAction;
    } | null;

    if (!body || !body.action) {
      return NextResponse.json(
        { error: "فیلد action الزامی است." },
        { status: 400 },
      );
    }

    const action = body.action;

    // ✅ پیدا کردن مرحله فقط در محدوده شرکت همین کاربر
    const stage = await prisma.projectStage.findFirst({
      where: {
        id: stageId,
        project: {
          companyId: user.companyId,
        },
      },
      include: { project: true },
    });

    if (!stage) {
      return NextResponse.json(
        { error: "مرحله مورد نظر پیدا نشد." },
        { status: 404 },
      );
    }

    const now = new Date();
    const prevStatus: StageStatus = stage.status;

    let data: Partial<{
      status: StageStatus;
      startedAt: Date | null;
      finishedAt: Date | null;
    }> = {};

    switch (action) {
      case "start": {
        if (stage.status !== "PENDING") {
          return NextResponse.json(
            { error: "فقط مراحل در وضعیت «در انتظار» را می‌توان شروع کرد." },
            { status: 400 },
          );
        }
        data = {
          status: "ACTIVE",
          startedAt: stage.startedAt ?? now,
        };
        break;
      }

      case "finish": {
        if (stage.status !== "ACTIVE") {
          return NextResponse.json(
            { error: "فقط مراحل «در حال انجام» را می‌توان پایان داد." },
            { status: 400 },
          );
        }
        data = {
          status: "DONE",
          finishedAt: stage.finishedAt ?? now,
        };
        break;
      }

      case "reset": {
        data = {
          status: "PENDING",
          startedAt: null,
          finishedAt: null,
        };
        break;
      }

      case "approve":
        // فعلاً فقط لاگ می‌زنیم؛ ستون خاصی برای تأیید نداریم
        data = {}; // بدون تغییر در خود مرحله
        break;

      case "unapprove":
        // فعلاً فقط لاگ می‌زنیم؛ ستون خاصی برای تأیید نداریم
        data = {}; // بدون تغییر در خود مرحله
        break;

      default:
        return NextResponse.json(
          { error: "action نامعتبر است." },
          { status: 400 },
        );
    }

    // ✅ اگر تغییری برای خود Stage هست، آپدیت کن؛ وگرنه همون مقدار قبلی رو برگردون
    const updated =
      Object.keys(data).length > 0
        ? await prisma.projectStage.update({
            where: { id: stage.id },
            data,
          })
        : stage;

    // ✅ ثبت لاگ در ProjectActivity
    await prisma.projectActivity.create({
      data: {
        projectId: stage.projectId,
        userId: user.id,
        action, // همان 'start' | 'finish' | ...
        meta: {
          stageId: stage.id,
          stageName: stage.name,
          fromStatus: prevStatus,
          toStatus: updated.status,
          performedBy: {
            id: user.id,
            name: user.name,
          },
          performedAt: now.toISOString(),
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/project-stages/[id] error:", err);
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 },
    );
  }
}

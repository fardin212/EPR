import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";

export const dynamic = "force-dynamic";

type RouteContext =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };

async function resolveParams(ctx: RouteContext) {
  const raw = (ctx as any).params;
  if (raw && typeof raw.then === "function") {
    return (await raw) as { id: string };
  }
  return raw as { id: string };
}

async function getStage(ctx: RouteContext) {
  const { id } = await resolveParams(ctx);
  const stageId = Number(id);

  if (Number.isNaN(stageId)) {
    return { error: "شناسه مرحله نامعتبر است.", stage: null as any };
  }

  const stage = await prisma.projectStage.findUnique({
    where: { id: stageId },
    select: { id: true, projectId: true },
  });

  if (!stage) {
    return { error: "مرحله موردنظر پیدا نشد.", stage: null as any };
  }

  return { error: null, stage };
}

// ------------------------------------------------------------------
// GET — لیست تصاویر یک مرحله
// ------------------------------------------------------------------
export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const { error, stage } = await getStage(ctx);
    if (error || !stage) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const images = await prisma.projectImage.findMany({
      where: { stageId: stage.id },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(
      images.map((img) => ({
        id: img.id,
        url: img.url,
        caption: img.caption,
        createdAt: img.createdAt,
      })),
    );
  } catch (err) {
    console.error("Error in GET /project-stages/[id]/images:", err);
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 },
    );
  }
}

// ------------------------------------------------------------------
// POST — آپلود یک یا چند تصویر برای مرحله
// ------------------------------------------------------------------
export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const { error, stage } = await getStage(ctx);
    if (error || !stage) {
      return NextResponse.json({ error }, { status: 404 });
    }

    const formData = await req.formData().catch((e) => {
      console.error("formData parse error:", e);
      return null;
    });

    if (!formData) {
      return NextResponse.json(
        { error: "دادهٔ فرم دریافت نشد." },
        { status: 400 },
      );
    }

    // پشتیبانی از file و files (برای احتیاط)
    const filesRaw = [
      ...formData.getAll("file"),
      ...formData.getAll("files"),
    ];

    const files = filesRaw.filter(
      (f): f is File => f instanceof File,
    );

    if (files.length === 0) {
      return NextResponse.json(
        { error: "فایلی ارسال نشده است." },
        { status: 400 },
      );
    }

    // مسیر ذخیره روی دیسک
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "projects",
      String(stage.projectId),
      "stages",
    );
    await fs.mkdir(uploadDir, { recursive: true });

    const createdImages = [];

    for (const file of files) {
      const ext = path.extname(file.name || "").toLowerCase() || ".png";
      const random = crypto.randomBytes(6).toString("hex");
      const filename = `p${stage.projectId}-s${stage.id}-${Date.now()}-${random}${ext}`;
      const filePath = path.join(uploadDir, filename);

      const arrayBuffer = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(arrayBuffer));

      const url = `/uploads/projects/${stage.projectId}/stages/${filename}`;

      const created = await prisma.projectImage.create({
        data: {
          projectId: stage.projectId,
          stageId: stage.id,
          url,
          caption: "",
          sortOrder: 0,
        },
      });

      createdImages.push({
        id: created.id,
        url: created.url,
        caption: created.caption,
        createdAt: created.createdAt,
      });
    }

    // آرایهٔ تصاویر جدید را برمی‌گردانیم
    return NextResponse.json(createdImages, { status: 201 });
  } catch (err) {
    console.error("Error in POST /project-stages/[id]/images:", err);
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 },
    );
  }
}

// ------------------------------------------------------------------
// PATCH — ذخیره کپشن تصویر
// body: { id: number, caption: string }
// ------------------------------------------------------------------
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.id !== "number") {
      return NextResponse.json(
        { error: "شناسه تصویر نامعتبر است." },
        { status: 400 },
      );
    }

    const caption =
      typeof body.caption === "string" ? body.caption.trim() : "";

    const updated = await prisma.projectImage.update({
      where: { id: body.id },
      data: { caption },
    });

    return NextResponse.json({
      id: updated.id,
      url: updated.url,
      caption: updated.caption,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    console.error("Error in PATCH /project-stages/[id]/images:", err);
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 },
    );
  }
}
// ------------------------------------------------------------------
// DELETE — حذف یک تصویر از گالری مرحله
// body: { id: number }
// ------------------------------------------------------------------
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const { error, stage } = await getStage(ctx);
    if (error || !stage) {
      return NextResponse.json({ error }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.id !== "number") {
      return NextResponse.json(
        { error: "شناسه تصویر نامعتبر است." },
        { status: 400 },
      );
    }

    const image = await prisma.projectImage.findUnique({
      where: { id: body.id },
    });

    if (!image || image.stageId !== stage.id) {
      return NextResponse.json(
        { error: "تصویر موردنظر پیدا نشد." },
        { status: 404 },
      );
    }

    // حذف فایل از روی دیسک
    try {
      const filePath = path.join(
        process.cwd(),
        image.url.replace(/^\//, ""),
      );
      await fs.unlink(filePath);
    } catch (e) {
      // اگر فایل نبود، نادیده می‌گیریم
      console.warn("Failed to remove file for image:", image.id, e);
    }

    await prisma.projectImage.delete({ where: { id: image.id } });

    return NextResponse.json({ success: true, id: image.id });
  } catch (err) {
    console.error("Error in DELETE /project-stages/[id]/images:", err);
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 },
    );
  }
}

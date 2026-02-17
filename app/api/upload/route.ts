// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import fs from "node:fs/promises";
import path from "node:path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function requireAdmin() {
  return cookies().get("admin_auth")?.value === "1";
}

// ✅ ریشه واقعی پروژه حتی در حالت standalone
const APP_ROOT =
  process.env.APP_ROOT || process.cwd().replace(/\/\.next\/standalone$/, "");

export async function POST(req: Request) {
  console.log("🚀 [UPLOAD API] Called");

  try {
    if (!requireAdmin()) {
      console.warn("⚠️ [UPLOAD API] UNAUTHORIZED");
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      console.warn("⚠️ [UPLOAD API] NO_FILE in formData");
      return NextResponse.json(
        { ok: false, error: "NO_FILE" },
        { status: 400 }
      );
    }

    console.log("📥 [UPLOAD API] FILE INFO:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!ALLOWED.has(file.type)) {
      console.warn("⚠️ [UPLOAD API] INVALID_TYPE:", file.type);
      return NextResponse.json(
        { ok: false, error: "INVALID_TYPE" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      console.warn(
        "⚠️ [UPLOAD API] TOO_LARGE:",
        file.size,
        "MAX:",
        MAX_SIZE
      );
      return NextResponse.json(
        { ok: false, error: "TOO_LARGE" },
        { status: 400 }
      );
    }

    // 📁 ساخت پوشه بر اساس سال/ماه – داخل public/uploads/projects
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const uploadDir = path.join(
      APP_ROOT,
      "public",
      "uploads",
      "projects",
      year,
      month
    );
    console.log("📂 [UPLOAD API] uploadDir:", uploadDir);
    await fs.mkdir(uploadDir, { recursive: true });

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
        ? "webp"
        : "jpg";

    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    console.log("📝 [UPLOAD API] filepath:", filepath);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    // 🌐 مسیر عمومی برای ذخیره در دیتابیس
    const url = `/uploads/projects/${year}/${month}/${filename}`;
    console.log("🌐 [UPLOAD API] PUBLIC URL:", url);

    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error("❌ [UPLOAD API] SERVER_ERROR:", e);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

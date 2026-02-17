// lib/saveImage.ts
import fs from "node:fs/promises";
import path from "node:path";

/** دایرکتوری را اگر نبود بساز */
async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

export type SaveImageOptions = {
  /** زیرمسیر داخل public (بدون / اول)؛ مثل: uploads/settings */
  webDir: string;
  /** نام پایهٔ فایل (اختیاری) مثل: "logo" یا "hero" */
  baseName?: string;
  /** حداکثر حجم (بایت) */
  maxBytes?: number;
  /** فرمت‌های مجاز */
  allowed?: string[];
};

/**
 * فایل تصویر (File از FormData) را در public ذخیره می‌کند و آدرس وب برمی‌گرداند.
 * خروجی: `/uploads/settings/....jpg`
 */
export async function saveImage(file: File, opts: SaveImageOptions): Promise<string> {
  const {
    webDir,
    baseName,
    maxBytes = 1.5 * 1024 * 1024, // 1.5MB
    allowed = ["image/jpeg", "image/png", "image/webp"],
  } = opts;

  if (!allowed.includes(file.type)) {
    throw new Error("فرمت تصویر مجاز نیست. (jpg/png/webp)");
  }
  if (file.size > maxBytes) {
    throw new Error("حجم تصویر بیشتر از حد مجاز است.");
  }

  const publicRoot = path.join(process.cwd(), "public");
  const diskDir = path.join(publicRoot, webDir); // e.g. public/uploads/settings
  await ensureDir(diskDir);

  const time = Date.now();
  const ext =
    file.type === "image/png" ? "png" :
    file.type === "image/webp" ? "webp" : "jpg";

  const name = `${baseName ?? "img"}-${time}.${ext}`;
  const diskPath = path.join(diskDir, name);

  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(diskPath, buf);

  // مسیر وب برای ذخیره در DB یا استفاده در <img/>
  const webPath = `/${webDir.replace(/^[\\/]/, "")}/${name}`; // => /uploads/settings/logo-....
  return webPath;
}

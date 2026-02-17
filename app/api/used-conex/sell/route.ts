import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const payload = {
      type: String(form.get("type") || ""),
      size: String(form.get("size") || ""),
      city: String(form.get("city") || ""),
      condition: String(form.get("condition") || ""),
      phone: String(form.get("phone") || ""),
      desc: String(form.get("desc") || ""),
      imagesCount: form.getAll("images").length,
    };

    // TODO مرحله بعد: ذخیره در DB + آپلود به storage
    console.log("[USED-CONEX-SELL] New lead:", payload);

    return NextResponse.json({ ok: true, message: "درخواست شما ثبت شد." });
  } catch (e: any) {
    console.error("Sell API error:", e);
    return NextResponse.json(
      { ok: false, message: "خطا در ثبت درخواست" },
      { status: 500 }
    );
  }
}

// app/api/seo/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";

function normalizeFa(input: string): string {
  return input
    .toLowerCase()
    // نیم‌فاصله و فاصله مجازی
    .replace(/\u200c|\u200f|\ufeff|‌/g, " ")
    // ی و ک عربی
    .replace(/[يى]/g, "ی")
    .replace(/[ك]/g, "ک")
    // چند فاصله پشت‌سرهم
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(html: string): string {
  return html
    // حذف اسکریپت و استایل
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    // تبدیل تگ‌ها به فاصله
    .replace(/<\/(p|div|h[1-6]|li|br)[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(html: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function extractMetaDescription(html: string): string | null {
  const re =
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i;
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function buildChecklist(params: {
  keyword: string;
  title: string | null;
  description: string | null;
  h1: string | null;
  wordCount: number;
  keywordCount: number;
  density: number;
}) {
  const { keyword, title, description, h1, wordCount, keywordCount, density } =
    params;

  const checklist: {
    id: string;
    label: string;
    status: "good" | "warning" | "bad";
    message: string;
  }[] = [];

  const hasKeyword = keyword.trim().length > 0;
  const nKeyword = normalizeFa(keyword);

  // 1) عنوان سئو
  if (!title) {
    checklist.push({
      id: "title_missing",
      label: "عنوان سئو",
      status: "bad",
      message: "هیچ عنوانی برای صفحه پیدا نشد. حتماً یک عنوان تعریف کن.",
    });
  } else {
    const len = title.length;
    const nTitle = normalizeFa(title);

    if (len < 30 || len > 65) {
      checklist.push({
        id: "title_length",
        label: "طول عنوان سئو",
        status: "warning",
        message:
          "طول عنوان سئو بهتر است حدود ۳۰ تا ۶۵ کاراکتر باشد تا هم کامل نمایش داده شود و هم جذاب باشد.",
      });
    } else {
      checklist.push({
        id: "title_length",
        label: "طول عنوان سئو",
        status: "good",
        message: `طول عنوان سئو مناسب است (${len} کاراکتر).`,
      });
    }

    if (hasKeyword) {
      if (nTitle.includes(nKeyword)) {
        checklist.push({
          id: "title_keyword",
          label: "کلمه کلیدی در عنوان",
          status: "good",
          message: "کلمه کلیدی در عنوان سئو دیده می‌شود.",
        });
      } else {
        checklist.push({
          id: "title_keyword",
          label: "کلمه کلیدی در عنوان",
          status: "warning",
          message:
            "بهتر است کلمه کلیدی اصلی در ابتدای عنوان سئو استفاده شود.",
        });
      }
    }
  }

  // 2) توضیحات متا
  if (!description) {
    checklist.push({
      id: "meta_missing",
      label: "توضیحات متا",
      status: "bad",
      message:
        "هیچ توضیحات متایی برای صفحه پیدا نشد. بهتر است یک توضیح متا جذاب بنویسی.",
    });
  } else {
    const len = description.length;
    const nDesc = normalizeFa(description);

    if (len < 70 || len > 165) {
      checklist.push({
        id: "meta_length",
        label: "طول توضیحات متا",
        status: "warning",
        message:
          "طول توضیحات متا بهتر است حدود ۷۰ تا ۱۶۰ کاراکتر باشد تا در نتایج گوگل کامل و جذاب نمایش داده شود.",
      });
    } else {
      checklist.push({
        id: "meta_length",
        label: "طول توضیحات متا",
        status: "good",
        message: `طول توضیحات متا مناسب است (${len} کاراکتر).`,
      });
    }

    if (hasKeyword) {
      if (nDesc.includes(nKeyword)) {
        checklist.push({
          id: "meta_keyword",
          label: "کلمه کلیدی در توضیحات متا",
          status: "good",
          message: "کلمه کلیدی در توضیحات متا استفاده شده است.",
        });
      } else {
        checklist.push({
          id: "meta_keyword",
          label: "کلمه کلیدی در توضیحات متا",
          status: "warning",
          message: "بهتر است کلمه کلیدی اصلی در توضیحات متا هم استفاده شود.",
        });
      }
    }
  }

  // 3) H1
  if (!h1) {
    checklist.push({
      id: "h1_missing",
      label: "هدر اصلی (H1)",
      status: "warning",
      message:
        "برای هر صفحه بهتر است یک H1 اصلی تعریف شود و عنوان محتوای صفحه را نشان دهد.",
    });
  } else if (hasKeyword) {
    const nH1 = normalizeFa(h1);
    if (nH1.includes(nKeyword)) {
      checklist.push({
        id: "h1_keyword",
        label: "کلمه کلیدی در H1",
        status: "good",
        message: "کلمه کلیدی در تیتر اصلی (H1) هم دیده می‌شود.",
      });
    } else {
      checklist.push({
        id: "h1_keyword",
        label: "کلمه کلیدی در H1",
        status: "warning",
        message: "بهتر است کلمه کلیدی در H1 صفحه استفاده شود.",
      });
    }
  }

  // 4) طول محتوا
  if (wordCount < 300) {
    checklist.push({
      id: "content_short",
      label: "طول محتوا",
      status: "warning",
      message:
        "حجم محتوا کمتر از ۳۰۰ کلمه است؛ برای صفحات مهم بهتر است حداقل ۵۰۰ تا ۸۰۰ کلمه متن مفید داشته باشی.",
    });
  } else if (wordCount >= 300 && wordCount < 800) {
    checklist.push({
      id: "content_ok",
      label: "طول محتوا",
      status: "good",
      message: `طول محتوا مناسب است (${wordCount} کلمه).`,
    });
  } else {
    checklist.push({
      id: "content_long",
      label: "طول محتوا",
      status: "good",
      message: `محتوای طولانی و خوبی داری (${wordCount} کلمه).`,
    });
  }

  // 5) چگالی کلمه کلیدی
  if (hasKeyword && wordCount > 0) {
    if (keywordCount === 0) {
      checklist.push({
        id: "density_zero",
        label: "کلمه کلیدی در متن",
        status: "bad",
        message: `کلمه کلیدی «${keyword}» در متن صفحه پیدا نشد.`,
      });
    } else {
      if (density < 0.5) {
        checklist.push({
          id: "density_low",
          label: "چگالی کلمه کلیدی",
          status: "warning",
          message:
            "چگالی کلمه کلیدی کمی پایین است؛ می‌توانی ۲–۳ بار دیگر کلمه را به‌صورت طبیعی در متن استفاده کنی.",
        });
      } else if (density <= 3) {
        checklist.push({
          id: "density_good",
          label: "چگالی کلمه کلیدی",
          status: "good",
          message: `چگالی کلمه کلیدی مناسب است (${density.toFixed(
            2
          )}٪). نیازی به تکرار بیشتر نیست.`,
        });
      } else {
        checklist.push({
          id: "density_high",
          label: "چگالی کلمه کلیدی",
          status: "warning",
          message:
            "کلمه کلیدی بیش از حد تکرار شده است؛ بهتر است کمی از تکرارهای بی‌دلیل را حذف کنی تا متن طبیعی بماند.",
        });
      }
    }
  }

  return checklist;
}

export async function POST(req: NextRequest) {
  try {
    const { url, keyword = "" } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { ok: false, error: "آدرس صفحه نامعتبر است." },
        { status: 400 }
      );
    }

    const base =
      process.env.NEXT_PUBLIC_SITE_URL || "https://conexnikan.com";

    const finalUrl = url.startsWith("http")
      ? url
      : new URL(url, base).toString();

    const res = await fetch(finalUrl, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "خطا در دریافت محتوای صفحه." },
        { status: 500 }
      );
    }

    const html = await res.text();

    const title = extractTag(html, "title");
    const description = extractMetaDescription(html);
    const h1 = extractTag(html, "h1");

    const text = stripHtml(html);
    const normalizedText = normalizeFa(text);
    const words = normalizedText ? normalizedText.split(" ") : [];
    const wordCount = words.filter(Boolean).length;

    const nKeyword = normalizeFa(keyword);
    let keywordCount = 0;

    if (nKeyword && normalizedText) {
      // ساخت regex برای کلمه کلیدی (با اجازه یک یا چند فاصله بین کلمات)
      const escaped = nKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = escaped.replace(/\s+/g, "\\s+");
      const re = new RegExp(pattern, "gi");
      const matches = normalizedText.match(re);
      keywordCount = matches ? matches.length : 0;
    }

    const densityPercent =
      wordCount > 0 && nKeyword ? (keywordCount / wordCount) * 100 : 0;

    const checklist = buildChecklist({
      keyword,
      title,
      description,
      h1,
      wordCount,
      keywordCount,
      density: densityPercent,
    });

    // محاسبه نمره کلی بر اساس چک‌لیست
    let score = 0;
    const total = checklist.length || 1;
    const perItem = 100 / total;

    for (const item of checklist) {
      if (item.status === "good") score += perItem;
      else if (item.status === "warning") score += perItem * 0.5;
      // bad → 0
    }

    score = Math.round(score);

    return NextResponse.json({
      ok: true,
      url: finalUrl,
      keyword,
      seo: {
        title,
        description,
        h1,
        wordCount,
        keywordCount,
        densityPercent,
        score,
        checklist,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "خطای داخلی در تحلیل سئو" },
      { status: 500 }
    );
  }
}

// app/api/admin/seo/analyze/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as cheerio from "cheerio";

type AnalyzeRequest = {
  url: string;                 // می‌تونه کامل باشه یا فقط path
  type?: string;               // category | project | page ...
  refId?: number | null;       // id دسته/پروژه
  focusKeyword?: string;       // کلمه کلیدی اصلی
};

type CheckStatus = "good" | "ok" | "bad";

type CheckItem = {
  key: string;
  label: string;
  status: CheckStatus;
  message: string;
  value?: any;
};

type SectionResult = {
  score: number;       // 0 - 100
  status: CheckStatus;
  checks: CheckItem[];
};

type AnalyzeResult = {
  overallScore: number;
  wordCount: number;
  keywordCount: number;
  density: number;
  sections: {
    meta: SectionResult;
    keyword: SectionResult;
    headings: SectionResult;
    content: SectionResult;
    links: SectionResult;
    images: SectionResult;
    readability: SectionResult;
  };
  raw: {
    title: string;
    metaDescription: string;
    h1s: string[];
    url: string;
  };
};

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[ـًٌٍَُِّْ]/g, "")
    .trim();
}

function tokenizeWords(text: string): string[] {
  return text
    .replace(/[.,!?؛،:()«»"[\]\n\r]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function keywordIn(text: string, keyword: string): boolean {
  const nText = normalizeText(text);
  const nKey = normalizeText(keyword);
  return nText.includes(nKey);
}

function keywordWordsCovered(text: string, keyword: string): number {
  const nText = normalizeText(text);
  const nKey = normalizeText(keyword);
  const words = nKey.split(/\s+/).filter(Boolean);
  let hit = 0;
  for (const w of words) {
    if (w && nText.includes(w)) hit++;
  }
  return words.length === 0 ? 0 : hit / words.length;
}

function calcStatus(score: number): CheckStatus {
  if (score >= 80) return "good";
  if (score >= 50) return "ok";
  return "bad";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnalyzeRequest;

    let { url, type, refId, focusKeyword } = body;
    if (!url) {
      return NextResponse.json(
        { ok: false, error: "URL_REQUIRED" },
        { status: 400 }
      );
    }

    // اگر فقط path فرستادی، به دامنه سایت تبدیلش می‌کنیم
    const base =
      process.env.NEXT_PUBLIC_SITE_URL || "https://conexnikan.com";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = base.replace(/\/$/, "") + (url.startsWith("/") ? url : `/${url}`);
    }

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "FETCH_FAILED", status: res.status },
        { status: 500 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $("head > title").first().text().trim();
    const metaDescription =
      $('meta[name="description"]').attr("content")?.trim() || "";

    const h1s = $("h1")
      .map((_, el) => $(el).text().trim())
      .get();

    const bodyText = $("body")
      .clone()
      .find("script, style, noscript")
      .remove()
      .end()
      .text();

    const words = tokenizeWords(bodyText);
    const wordCount = words.length;

    focusKeyword = focusKeyword?.trim() || "";

    let keywordCount = 0;
    let density = 0;

    if (focusKeyword) {
      const nKey = normalizeText(focusKeyword);
      const joined = normalizeText(bodyText);
      const regex = new RegExp(nKey.replace(/\s+/g, "\\s+"), "g");
      keywordCount = (joined.match(regex) || []).length;
      density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
    }

    /* --------- 1) META (title + description) --------- */
    const metaChecks: CheckItem[] = [];

    let metaScore = 0;

    if (title) {
      const len = title.length;
      let s = 40;
      if (len < 30 || len > 75) s -= 20;
      if (focusKeyword) {
        const cover = keywordWordsCovered(title, focusKeyword);
        if (cover === 1) s += 20;
        else if (cover >= 0.5) s += 10;
      }
      metaScore += s;

      metaChecks.push({
        key: "title",
        label: "عنوان صفحه",
        status: calcStatus(s),
        message: `طول عنوان: ${len} کاراکتر.`,
        value: { length: len, title },
      });
    } else {
      metaChecks.push({
        key: "title_missing",
        label: "عنوان صفحه",
        status: "bad",
        message: "تگ <title> در صفحه یافت نشد.",
      });
    }

    if (metaDescription) {
      const len = metaDescription.length;
      let s = 40;
      if (len < 80 || len > 180) s -= 20;
      if (focusKeyword) {
        const cover = keywordWordsCovered(metaDescription, focusKeyword);
        if (cover === 1) s += 20;
        else if (cover >= 0.5) s += 10;
      }
      metaScore += s;

      metaChecks.push({
        key: "meta_desc",
        label: "توضیحات متا",
        status: calcStatus(s),
        message: `طول توضیحات متا: ${len} کاراکتر.`,
        value: { length: len, metaDescription },
      });
    } else {
      metaChecks.push({
        key: "meta_desc_missing",
        label: "توضیحات متا",
        status: "bad",
        message: "meta description برای صفحه تنظیم نشده است.",
      });
    }

    const metaSection: SectionResult = {
      score: Math.max(0, Math.min(100, metaScore)),
      status: calcStatus(metaScore),
      checks: metaChecks,
    };

    /* --------- 2) KEYWORD FOCUS --------- */
    const kwChecks: CheckItem[] = [];
    let kwScore = 0;

    if (!focusKeyword) {
      kwChecks.push({
        key: "no_keyword",
        label: "کلمه کلیدی",
        status: "bad",
        message: "کلمه کلیدی اصلی برای این صفحه تعریف نشده است.",
      });
    } else {
      const kwInTitle = keywordWordsCovered(title || "", focusKeyword);
      const kwInMeta = keywordWordsCovered(
        metaDescription || "",
        focusKeyword
      );
      const kwInH1 = keywordWordsCovered(h1s.join(" | "), focusKeyword);

      if (kwInTitle >= 0.5) kwScore += 25;
      if (kwInMeta >= 0.5) kwScore += 25;
      if (kwInH1 >= 0.5) kwScore += 20;

      if (density > 0 && density < 0.2) {
        kwScore += 10;
      } else if (density >= 0.2 && density <= 2.5) {
        kwScore += 20;
      } else if (density > 2.5 && density <= 5) {
        kwScore += 10;
      } else if (density > 5) {
        kwScore -= 10; // keyword stuffing
      }

      kwChecks.push({
        key: "kw_title",
        label: "حضور کلمه کلیدی در عنوان",
        status: calcStatus(kwInTitle * 100),
        message: kwInTitle >= 0.5
          ? "کلمات کلیدی اصلی در عنوان حضور دارند."
          : "بهتر است عنوان را به‌گونه‌ای تنظیم کنید که کلمه کلیدی در آن واضح‌تر دیده شود.",
      });

      kwChecks.push({
        key: "kw_meta",
        label: "حضور کلمه کلیدی در توضیحات متا",
        status: calcStatus(kwInMeta * 100),
        message:
          kwInMeta >= 0.5
            ? "کلمات کلیدی در توضیحات متا حضور دارند."
            : "بهتر است کلمه کلیدی اصلی را در ابتدای توضیحات متا بیاورید.",
      });

      kwChecks.push({
        key: "kw_h1",
        label: "حضور کلمه کلیدی در H1",
        status: calcStatus(kwInH1 * 100),
        message:
          kwInH1 >= 0.5
            ? "کلمه کلیدی در تیتر اصلی (H1) دیده می‌شود."
            : "پیشنهاد می‌شود کلمه کلیدی را در تیتر اصلی صفحه قرار دهید.",
      });

      kwChecks.push({
        key: "kw_density",
        label: "چگالی کلمه کلیدی",
        status: calcStatus(
          density > 0 && density <= 3 ? 100 : density > 3 && density <= 5 ? 70 : 40
        ),
        message: `چگالی فعلی کلمه کلیدی: ${density.toFixed(
          2
        )}% (هدف تقریبی ۰٫۲ تا ۳ درصد).`,
        value: { density, keywordCount, wordCount },
      });
    }

    const keywordSection: SectionResult = {
      score: Math.max(0, Math.min(100, kwScore)),
      status: calcStatus(kwScore),
      checks: kwChecks,
    };

    /* --------- 3) HEADINGS (H1/H2/...) --------- */
    const headingChecks: CheckItem[] = [];
    let headScore = 0;

    const h1Count = h1s.length;
    if (h1Count === 0) {
      headingChecks.push({
        key: "no_h1",
        label: "H1",
        status: "bad",
        message: "هیچ تیتر H1 در صفحه یافت نشد.",
      });
    } else if (h1Count === 1) {
      headScore += 40;
      headingChecks.push({
        key: "h1_ok",
        label: "H1",
        status: "good",
        message: "یک تیتر H1 استاندارد در صفحه وجود دارد.",
        value: h1s[0],
      });
    } else {
      headScore += 20;
      headingChecks.push({
        key: "multi_h1",
        label: "H1",
        status: "ok",
        message:
          "بیش از یک H1 در صفحه وجود دارد. بهتر است فقط یک H1 اصلی داشته باشید.",
        value: h1s,
      });
    }

    const h2Count = $("h2").length;
    if (h2Count > 0) headScore += 30;
    else {
      headingChecks.push({
        key: "no_h2",
        label: "H2",
        status: "ok",
        message: "بهتر است برای ساختاردهی محتوا چند تیتر H2 استفاده کنید.",
      });
    }

    if (wordCount >= 800) headScore += 30;
    else if (wordCount >= 400) headScore += 20;
    else if (wordCount >= 200) headScore += 10;
    else {
      headingChecks.push({
        key: "low_words",
        label: "حجم محتوا",
        status: "bad",
        message: `حجم محتوا ${wordCount} کلمه است. برای صفحات مهم بهتر است حداقل ۴۰۰–۸۰۰ کلمه محتوا داشته باشید.`,
      });
    }

    const headingsSection: SectionResult = {
      score: Math.max(0, Math.min(100, headScore)),
      status: calcStatus(headScore),
      checks: headingChecks,
    };

    /* --------- 4) LINKS --------- */
    const linkChecks: CheckItem[] = [];
    let linkScore = 0;

    const links = $("a[href]")
      .map((_, el) => $(el).attr("href") || "")
      .get()
      .filter(Boolean);

    const internal = links.filter((href) =>
      href.startsWith("/") || href.includes(base)
    );
    const external = links.filter(
      (href) =>
        href.startsWith("http") &&
        !href.includes(base.replace(/^https?:\/\//, ""))
    );

    if (internal.length > 0) {
      linkScore += 40;
      linkChecks.push({
        key: "internal_links",
        label: "لینک‌های داخلی",
        status: "good",
        message: `${internal.length} لینک داخلی در صفحه وجود دارد.`,
      });
    } else {
      linkChecks.push({
        key: "no_internal",
        label: "لینک‌های داخلی",
        status: "bad",
        message: "هیچ لینک داخلی در صفحه دیده نشد. بهتر است به صفحات مرتبط دیگر لینک بدهید.",
      });
    }

    if (external.length > 0) {
      linkScore += 30;
      linkChecks.push({
        key: "external_links",
        label: "لینک‌های خارجی",
        status: "good",
        message:
          "حداقل یک لینک خارجی به سایت‌های معتبر دارید؛ این برای اعتبار محتوا مفید است.",
      });
    } else {
      linkChecks.push({
        key: "no_external",
        label: "لینک‌های خارجی",
        status: "ok",
        message:
          "هیچ لینک خارجی یافت نشد. داشتن چند لینک به منابع معتبر می‌تواند ارزش سئو را بالا ببرد.",
      });
    }

    if (links.length > 3) linkScore += 30;

    const linksSection: SectionResult = {
      score: Math.max(0, Math.min(100, linkScore)),
      status: calcStatus(linkScore),
      checks: linkChecks,
    };

    /* --------- 5) IMAGES --------- */
    const imgChecks: CheckItem[] = [];
    let imgScore = 0;

    const imgs = $("img")
      .map((_, el) => ({
        src: $(el).attr("src") || "",
        alt: $(el).attr("alt") || "",
      }))
      .get();

    if (imgs.length === 0) {
      imgChecks.push({
        key: "no_images",
        label: "تصاویر",
        status: "bad",
        message: "هیچ تصویری در صفحه دیده نمی‌شود.",
      });
    } else {
      imgScore += 40;
      const withAlt = imgs.filter((i) => i.alt && i.alt.trim().length > 0);
      if (withAlt.length === imgs.length) imgScore += 40;
      else if (withAlt.length > imgs.length / 2) imgScore += 30;

      let kwAltCount = 0;
      if (focusKeyword) {
        for (const img of imgs) {
          if (keywordIn(img.alt, focusKeyword)) kwAltCount++;
        }
      }

      imgChecks.push({
        key: "images_count",
        label: "تعداد تصاویر",
        status: calcStatus(imgScore),
        message: `${imgs.length} تصویر در صفحه وجود دارد (با alt برای ${withAlt.length} تصویر).`,
      });

      if (focusKeyword) {
        imgChecks.push({
          key: "kw_in_alt",
          label: "کلمه کلیدی در alt تصاویر",
          status: kwAltCount > 0 ? "good" : "ok",
          message:
            kwAltCount > 0
              ? `کلمه کلیدی در alt ${kwAltCount} تصویر استفاده شده است.`
              : "بهتر است در alt یکی از تصاویر، کلمه کلیدی اصلی را بیاورید.",
        });
      }
    }

    const imagesSection: SectionResult = {
      score: Math.max(0, Math.min(100, imgScore)),
      status: calcStatus(imgScore),
      checks: imgChecks,
    };

    /* --------- 6) READABILITY --------- */
    const readChecks: CheckItem[] = [];
    let readScore = 0;

    const sentences = bodyText
      .split(/[.!؟!\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const avgWordsPerSentence =
      sentences.length > 0 ? wordCount / sentences.length : wordCount;

    if (avgWordsPerSentence <= 25) readScore += 60;
    else if (avgWordsPerSentence <= 35) readScore += 40;
    else readScore += 20;

    const paragraphCount = bodyText
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean).length;

    if (paragraphCount >= 4) readScore += 40;
    else if (paragraphCount >= 2) readScore += 20;

    readChecks.push({
      key: "avg_sentence",
      label: "میانگین طول جمله",
      status: calcStatus(
        avgWordsPerSentence <= 25 ? 100 : avgWordsPerSentence <= 35 ? 70 : 40
      ),
      message: `میانگین حدود ${avgWordsPerSentence.toFixed(
        1
      )} کلمه در هر جمله.`,
    });

    readChecks.push({
      key: "paragraphs",
      label: "تعداد پاراگراف‌ها",
      status: calcStatus(
        paragraphCount >= 4 ? 100 : paragraphCount >= 2 ? 70 : 40
      ),
      message: `حدود ${paragraphCount} پاراگراف در صفحه شناسایی شد.`,
    });

    const readabilitySection: SectionResult = {
      score: Math.max(0, Math.min(100, readScore)),
      status: calcStatus(readScore),
      checks: readChecks,
    };

    /* --------- 7) CONTENT LENGTH SECTION (ساده) --------- */
    const contentChecks: CheckItem[] = [];
    let contentScore = 0;

    if (wordCount >= 1200) contentScore = 100;
    else if (wordCount >= 800) contentScore = 80;
    else if (wordCount >= 400) contentScore = 60;
    else if (wordCount >= 200) contentScore = 40;
    else contentScore = 20;

    contentChecks.push({
      key: "word_count",
      label: "حجم محتوا",
      status: calcStatus(contentScore),
      message: `تعداد کل کلمات: ${wordCount}`,
    });

    const contentSection: SectionResult = {
      score: contentScore,
      status: calcStatus(contentScore),
      checks: contentChecks,
    };

    /* --------- امتیاز کلی --------- */

    const weights = {
      meta: 0.2,
      keyword: 0.25,
      headings: 0.15,
      content: 0.15,
      links: 0.1,
      images: 0.05,
      readability: 0.1,
    };

    const overallScore =
      metaSection.score * weights.meta +
      keywordSection.score * weights.keyword +
      headingsSection.score * weights.headings +
      contentSection.score * weights.content +
      linksSection.score * weights.links +
      imagesSection.score * weights.images +
      readabilitySection.score * weights.readability;

    const result: AnalyzeResult = {
      overallScore: Math.round(overallScore),
      wordCount,
      keywordCount,
      density,
      sections: {
        meta: metaSection,
        keyword: keywordSection,
        headings: headingsSection,
        content: contentSection,
        links: linksSection,
        images: imagesSection,
        readability: readabilitySection,
      },
      raw: {
        title,
        metaDescription,
        h1s,
        url,
      },
    };

    /* --------- ذخیره در SeoPage + SeoAudit --------- */

    // سعی می‌کنیم SeoPage موجود را پیدا کنیم
    let seoPage = await prisma.seoPage.findUnique({
      where: { url: new URL(url).pathname },
    });

    if (!seoPage) {
      seoPage = await prisma.seoPage.create({
        data: {
          url: new URL(url).pathname,
          type: type || "page",
          refId: refId ?? null,
          focusKeyword: focusKeyword || null,
          lastScore: Math.round(overallScore),
          wordCount,
          lastAnalyzed: new Date(),
          keyword: focusKeyword || null,
        },
      });
    } else {
      seoPage = await prisma.seoPage.update({
        where: { id: seoPage.id },
        data: {
          focusKeyword: focusKeyword || seoPage.focusKeyword,
          lastScore: Math.round(overallScore),
          wordCount,
          lastAnalyzed: new Date(),
          keyword: focusKeyword || seoPage.keyword,
        },
      });
    }

    await prisma.seoAudit.create({
      data: {
        seoPageId: seoPage.id,
        score: Math.round(overallScore),
        wordCount,
        keywordCount,
        density,
        rawChecklist: result.sections as any,
      },
    });

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error("SEO_ANALYZE_ERROR", err);
    return NextResponse.json(
      { ok: false, error: "ANALYZE_FAILED", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}

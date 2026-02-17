// lib/imageConstraints.ts

export type UploadKind =
  | "hero"
  | "category_card"
  | "portfolio_card"
  | "portfolio_cover"
  | "thumb"
  | "logo"

export type Constraints = {
  minW: number
  minH: number
  maxBytes: number
  aspect?: number[]            // [minRatio, maxRatio] (width/height)
  allow?: Array<"16:9" | "4:3" | "3:2">
  name: string
}

export const IMG_RULES: Record<UploadKind, Constraints> = {
  hero: {
    name: "بنر (Hero)",
    minW: 1920,
    minH: 960,
    maxBytes: 65000 * 1024,
    aspect: [1.77, 2.0], // ~ 16:9 تا 2:1
  },
  category_card: {
    name: "کارت دسته‌بندی",
    minW: 900,
    minH: 600,
    maxBytes: 200 * 1024,
    allow: ["3:2", "4:3"],
  },
  portfolio_card: {
    name: "کارت نمونه‌کار",
    minW: 1200,
    minH: 675,
    maxBytes: 220 * 1024,
    allow: ["16:9", "4:3"],
  },
  portfolio_cover: {
    name: "کاور نمونه‌کار",
    minW: 1600,
    minH: 900,
    maxBytes: 800 * 1024,
    allow: ["16:9", "4:3"],
  },
  thumb: {
    name: "بندانگشتی",
    minW: 400,
    minH: 300,
    maxBytes: 120 * 1024,
    allow: ["4:3"],
  },
  logo: {
    name: "لوگو",
    minW: 256,
    minH: 128,
    maxBytes: 200 * 1024,
  },
}

export function human(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)}MB`
    : `${Math.round(bytes / 1024)}KB`
}

function snapRatio(
  w: number,
  h: number
): "16:9" | "4:3" | "3:2" | null {
  const r = w / h
  if (Math.abs(r - 16 / 9) < 0.02) return "16:9"
  if (Math.abs(r - 4 / 3) < 0.02) return "4:3"
  if (Math.abs(r - 3 / 2) < 0.02) return "3:2"
  return null
}

export function validateDimensions(
  rule: Constraints,
  w: number,
  h: number,
  bytes: number
): string | null {
  if (bytes > rule.maxBytes) {
    return `${rule.name}: حجم بیش از حد مجاز است (حداکثر ${human(rule.maxBytes)}).`
  }
  if (w < rule.minW || h < rule.minH) {
    return `${rule.name}: حداقل اندازه باید ${rule.minW}×${rule.minH} باشد.`
  }
  const ratio = w / h
  if (rule.allow && rule.allow.length) {
    const tag = snapRatio(w, h)
    if (!tag || !rule.allow.includes(tag)) {
      return `${rule.name}: نسبت مجاز ${rule.allow.join("، ")} است.`
    }
  } else if (rule.aspect) {
    if (ratio < rule.aspect[0] - 0.02 || ratio > rule.aspect[1] + 0.02) {
      return `${rule.name}: نسبت تصویر خارج از محدوده مجاز است.`
    }
  }
  return null
}

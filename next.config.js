/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  experimental: {
    optimizePackageImports: ["framer-motion", "swiper"],
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },

  trailingSlash: false,

  async redirects() {
    // فلگ مهاجرت مسیرها (فعلاً خاموش)
    // وقتی مسیرهای جدید آماده شد:
    // NIKAN_ROUTES_MIGRATION=1
    const MIGRATE = process.env.NIKAN_ROUTES_MIGRATION === "1";

    const redirects = [
      // -------- فارسی قدیمی -> اسلاگ واقعی جدید (فعلی‌های خودت) --------
      {
        source: "/category/%D9%81%D8%B3%D8%AA-%D9%81%D9%88%D8%AF",
        destination: "/category/Conex-Fastfood",
        permanent: true,
      },
      {
        source: "/category/%D8%AA%D8%AC%D8%A7%D8%B1%DB%8C",
        destination: "/category/commercial-container",
        permanent: true,
      },
      {
        source: "/category/%D8%B1%D9%81-%DA%AF%D8%A7%D8%B1%D8%AF%D9%86",
        destination: "/category/raf-garden",
        permanent: true,
      },
      {
        source: "/category/%D8%B3%D9%88%D8%A6%DB%8C%D8%B3%DB%8C",
        destination: "/category/conex-swiesi",
        permanent: true,
      },
      {
        source: "/categories/%D9%81%D8%B1%D9%88%D8%B4%DA%AF%D8%A7%D9%87%DB%8C",
        destination: "/category/Conex-froshgahi",
        permanent: true,
      },

      // -------- ریدایرکت‌های ایمن برای یکپارچه‌سازی (بدون تغییر معماری بزرگ) --------
      // /post و /blog اگر هر دو داری، یکی رو انتخاب کن؛ اینجا /post میره روی /blog
      {
        source: "/post/:slug*",
        destination: "/blog/:slug*",
        permanent: true,
      },

      // /used مبهمه؛ بهتره به صفحه اصلی کانکس دست دوم بره
      {
        source: "/used",
        destination: "/used-conex",
        permanent: true,
      },

      // -------- قانون عمومی فعلی (آخر) --------
      {
        source: "/categories/:slug*",
        destination: "/category/:slug*",
        permanent: true,
      },
    ];

    // -------- مهاجرت‌های بزرگ (فقط وقتی آماده شدی و مسیرهای مقصد واقعاً وجود دارن) --------
    if (MIGRATE) {
      redirects.unshift(
        // اگر قرار شد دسته‌بندی‌ها کلاً زیر /conex برن:
        // IMPORTANT: فقط وقتی /conex/[slug] رو ساختی فعال کن
        {
          source: "/category/:slug*",
          destination: "/conex/:slug*",
          permanent: true,
        }
        // مثال‌های دیگر (اگر خواستی):
        // { source: "/blog/:slug*", destination: "/guides/:slug*", permanent: true },
      );
    }

    return redirects;
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  poweredByHeader: false,
};

module.exports = nextConfig;

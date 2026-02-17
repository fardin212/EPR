import { Font } from "@react-pdf/renderer";

// فونت را از public می‌خوانیم (بهترین حالت)
export function registerPersianFonts() {
  try {
    Font.register({
      family: "Vazirmatn",
      fonts: [
        { src: "/fonts/Vazirmatn-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/Vazirmatn-Medium.ttf", fontWeight: 500 },
        { src: "/fonts/Vazirmatn-Bold.ttf", fontWeight: 700 },
      ],
    });
  } catch {}
}

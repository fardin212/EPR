// components/ui/FancyNav.tsx
import FancyNavClient from "./FancyNavClient";

/**
 * نسخه ساده شده‌ی ناوبری قدیمی.
 * الان در layout اصلی دیگر از این کامپوننت استفاده نمی‌کنیم،
 * ولی برای اینکه TypeScript خطا ندهد، یک wrapper بدون props نگه می‌داریم.
 */

export default function FancyNav() {
  return <FancyNavClient />;
}

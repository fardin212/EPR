export function slugify(input: string): string {
  return input
    .toString()
    .trim()
    // نیم‌فاصله و فواصل
    .replace(/[\u200c\s]+/g, "-")
    // حروف خاص
    .replace(/[^\w\-آاأإئؤءبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیي‌]/g, "")
    // چندتا خط تیره پشت سر هم
    .replace(/\-+/g, "-")
    // حذف خط‌تیره‌های ابتدا/انتها
    .replace(/^\-+|\-+$/g, "")
    .toLowerCase();
}

import Link from "next/link";
import { createUsedConex } from "../actions";

export default function NewUsedConexPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">افزودن کانکس دست دوم</h1>
        <Link className="text-sm underline" href="/admin/used-conex">برگشت</Link>
      </div>

      <form action={createUsedConex} className="mt-6 rounded-2xl border bg-white p-5 grid gap-4">
        <input className="rounded-xl border px-3 py-2" name="slug" placeholder="slug مثل: kanex-negahbani-2x3-tehran-1" required />
        <input className="rounded-xl border px-3 py-2" name="title" placeholder="عنوان" required />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-xl border px-3 py-2" name="type" placeholder="نوع (نگهبانی/کارگاهی/...)" required />
          <input className="rounded-xl border px-3 py-2" name="size" placeholder="ابعاد (مثلاً 3×6)" required />
          <input className="rounded-xl border px-3 py-2" name="city" placeholder="شهر" required />
          <input className="rounded-xl border px-3 py-2" name="price" placeholder="قیمت (عدد)" required />
        </div>

        <select className="rounded-xl border px-3 py-2" name="status" defaultValue="ready">
          <option value="ready">ready</option>
          <option value="minor_fix">minor_fix</option>
          <option value="refurbished">refurbished</option>
          <option value="temporary">temporary</option>
        </select>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isReady" /> تحویل فوری
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="refurbished" /> بازسازی‌شده
          </label>
        </div>

        <textarea className="rounded-xl border px-3 py-2" name="note" rows={3} placeholder="توضیحات کوتاه (اختیاری)" />

        <textarea className="rounded-xl border px-3 py-2" name="images" rows={4} placeholder="URL تصاویر گالری (هر خط یک URL)" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-xl border px-3 py-2" name="beforeUrl" placeholder="URL تصویر قبل (اختیاری)" />
          <input className="rounded-xl border px-3 py-2" name="afterUrl" placeholder="URL تصویر بعد (اختیاری)" />
        </div>

        <textarea className="rounded-xl border px-3 py-2" name="refurbItems" rows={4}
                  placeholder="موارد بازسازی (هر خط: عنوان | توضیح)&#10;مثال: تعویض کف | کف نو + زیرسازی تقویت‌شده" />

        <button className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white">
          ثبت
        </button>
      </form>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getMeServer } from "@/lib/authMe";
import InvoicesListClient from "./InvoicesListClient";

export default async function InvoicesPage() {
  const me = await getMeServer().catch(() => null);

  if (!me) {
    redirect("/login");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold">فاکتورها</h1>
          <p className="text-sm text-zinc-500">
            پیش‌فاکتور و فاکتور رسمی قابل ارائه به مشتری
          </p>
        </div>

        <Link
          href="/dashboard/invoices/new"
          className="rounded-2xl bg-emerald-500 px-4 py-2 font-bold"
        >
          + صدور فاکتور جدید
        </Link>
      </div>

      <InvoicesListClient />
    </div>
  );
}

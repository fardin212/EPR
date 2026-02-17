import { getMeServer } from "@/lib/authMe";

export default async function TrashPage() {
  const me = await getMeServer();
  if (me.role !== "ADMIN") {
    return <div className="rounded-2xl border bg-white p-4">دسترسی ندارید.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-zinc-500">Invoices</div>
          <div className="text-2xl font-extrabold">Trash</div>
        </div>
      </div>

      <TrashClient />
    </div>
  );
}

function TrashClient() {
  // Client component inline (ساده)
  // اگر دوست داری جداش می‌کنم، ولی همین هم اوکیه.
  return (
    <div className="rounded-2xl border bg-white p-4">
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function(){})()
        `,
        }}
      />
      <TrashTable />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function moneyRial(toman: number) {
  return Math.round(Number(toman||0)*10).toLocaleString("fa-IR");
}

type Row = {
  id: number;
  docType: string;
  docNo: string;
  customerName: string;
  total: number;
  status: string;
  deletedAt: string;
};

function TrashTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/invoices/trash", { cache: "no-store" });
    if (!res.ok) {
      alert(await res.text());
      setLoading(false);
      return;
    }
    setRows(await res.json());
    setLoading(false);
  }

  async function restore(id: number) {
    if (!confirm("بازگردانی شود؟")) return;
    const res = await fetch(`/api/invoices/${id}/restore`, { method: "POST" });
    if (!res.ok) return alert(await res.text());
    await load();
  }

  async function hardDelete(id: number) {
    if (!confirm("حذف دائمی؟ این کار غیرقابل بازگشت است.")) return;
    const res = await fetch(`/api/invoices/${id}/hard-delete`, { method: "DELETE" });
    if (!res.ok) return alert(await res.text());
    await load();
  }

  if (loading) return <div className="text-sm text-zinc-500">در حال بارگذاری…</div>;

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-zinc-600">
          <tr>
            <th className="p-3 text-right">شماره</th>
            <th className="p-3 text-right">مشتری</th>
            <th className="p-3 text-right">مبلغ (ریال)</th>
            <th className="p-3 text-right">حذف شده در</th>
            <th className="p-3 text-right">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t hover:bg-zinc-50">
              <td className="p-3 font-bold">{r.docNo || `#${r.id}`}</td>
              <td className="p-3">{r.customerName || "—"}</td>
              <td className="p-3 font-extrabold">{moneyRial(r.total)}</td>
              <td className="p-3">{new Date(r.deletedAt).toLocaleString("fa-IR")}</td>
              <td className="p-3 flex gap-2 flex-wrap">
                <button onClick={() => restore(r.id)} className="rounded-xl border px-3 py-1 hover:bg-zinc-50">
                  Restore
                </button>
                <button onClick={() => hardDelete(r.id)} className="rounded-xl bg-rose-600 text-white px-3 py-1 hover:opacity-95">
                  Delete forever
                </button>
                <Link className="rounded-xl border px-3 py-1 hover:bg-zinc-50" href={`/dashboard/invoices/${r.id}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td className="p-6 text-center text-zinc-500" colSpan={5}>موردی در Trash نیست.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

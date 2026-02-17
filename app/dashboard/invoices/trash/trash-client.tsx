"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  id: number;
  docType: "PROFORMA" | "INVOICE";
  docNo: string;
  customerName: string;
  total: number;
  status: string;
  deletedAt: string;
};

function tomanToRial(n: number) {
  return Math.round(Number(n || 0) * 10);
}
function moneyRial(nToman: number) {
  return tomanToRial(nToman).toLocaleString("fa-IR");
}

export default function TrashClient() {
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

  useEffect(() => {
    load();
  }, []);

  async function restore(id: number) {
    if (!confirm("بازگردانی شود؟")) return;
    const res = await fetch(`/api/invoices/${id}/restore`, { method: "POST" });
    if (!res.ok) return alert(await res.text());
    await load();
  }

  async function hardDelete(id: number) {
    if (!confirm("حذف دائمی؟ این عملیات غیرقابل بازگشت است.")) return;
    const res = await fetch(`/api/invoices/${id}/hard-delete`, { method: "DELETE" });
    if (!res.ok) return alert(await res.text());
    await load();
  }

  if (loading) return <div className="rounded-3xl border bg-white p-4 text-sm text-zinc-500">در حال بارگذاری…</div>;

  return (
    <div className="rounded-3xl border bg-white p-4 overflow-auto">
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
              <td className="p-3 font-extrabold">{r.docNo || `#${r.id}`}</td>
              <td className="p-3">{r.customerName || "—"}</td>
              <td className="p-3 font-extrabold">{moneyRial(r.total)}</td>
              <td className="p-3">{new Date(r.deletedAt).toLocaleString("fa-IR")}</td>
              <td className="p-3 flex gap-2 flex-wrap">
                <button onClick={() => restore(r.id)} className="rounded-2xl border px-3 py-1 font-extrabold hover:bg-zinc-50">
                  Restore
                </button>
                <button onClick={() => hardDelete(r.id)} className="rounded-2xl bg-rose-600 text-white px-3 py-1 font-extrabold hover:opacity-95">
                  Delete forever
                </button>
                <Link href={`/dashboard/invoices/${r.id}`} className="rounded-2xl border px-3 py-1 font-extrabold hover:bg-zinc-50">
                  View
                </Link>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-zinc-500">
                موردی در Trash نیست.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

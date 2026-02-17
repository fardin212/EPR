"use client";

import { useEffect, useMemo, useState } from "react";

type Party = {
  id: number;
  name: string;
  mobile?: string | null;
};

export default function ProjectCustomerCard({
  projectId,
  currentCustomerId,
  currentCustomerName,
  onSaved,
}: {
  projectId: number;
  currentCustomerId: number | null;
  currentCustomerName: string | null;
  onSaved?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState<Party[]>([]);
  const [selected, setSelected] = useState<number | "none">(currentCustomerId ?? "none");
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/parties", { cache: "no-store" });
        const data = await r.json().catch(() => []);
        const items = Array.isArray(data) ? data : data.items;
        if (!alive) return;
        setParties((items ?? []) as Party[]);
      } catch {
        if (!alive) return;
        setParties([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim();
    if (!s) return parties;
    return parties.filter((p) => (p.name || "").includes(s) || String(p.id).includes(s));
  }, [parties, q]);

  async function save() {
    setLoading(true);
    try {
      const body = selected === "none" ? { customerId: null } : { customerId: selected };

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const t = await res.text();
        alert(t || "خطا در ذخیره کارفرما");
        return;
      }

      onSaved?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-xs text-slate-400">کارفرما</div>
          <div className="text-sm text-white font-semibold">{currentCustomerName || "تعیین نشده"}</div>
        </div>

        <button
          onClick={save}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded-lg bg-purple-600 text-white disabled:opacity-50"
        >
          ذخیره
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو (نام/کد)…"
          className="md:col-span-1 w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
        />

        <select
          className="md:col-span-2 w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
          value={selected}
          onChange={(e) => setSelected(e.target.value === "none" ? "none" : Number(e.target.value))}
        >
          <option value="none">— انتخاب کارفرما —</option>
          {filtered.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.mobile ? ` — ${p.mobile}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 text-[11px] text-slate-400">
        کارفرما از «طرف حساب‌ها» انتخاب می‌شود و در پروژه به‌صورت customerId ذخیره می‌گردد.
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

export default function CategoryAdmin() {
  const [items, setItems] = useState<Category[]>([]);
  const [parents, setParents] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  // فرم افزودن/ویرایش
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");

  // دیالوگ حذف/انتقال
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [moveChildrenTo, setMoveChildrenTo] = useState<string>("");
  const [moveProjectsTo, setMoveProjectsTo] = useState<string>("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim();
    if (!s) return items;
    return items.filter(
      (i) =>
        i.name.includes(s) ||
        i.slug.includes(s)
    );
  }, [items, q]);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/categories");
      const rows: Category[] = await r.json();
      setItems(rows);
      setParents(rows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditId(null);
    setName("");
    setSlug("");
    setParentId("");
  }

  async function save() {
    setErrorMsg(null);
    try {
      const body = { name, slug, parentId: parentId === "" ? null : Number(parentId) };
      const r = await fetch(editId ? `/api/categories/${editId}` : "/api/categories", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(await r.text());
      resetForm();
      await load();
      setOkMsg(editId ? "ویرایش با موفقیت انجام شد" : "افزوده شد");
      setTimeout(() => setOkMsg(null), 2000);
    } catch (e: any) {
      setErrorMsg(e?.message || "خطا در ذخیره");
    }
  }

  async function remove(id: number) {
    setErrorMsg(null);
    try {
      const r = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!r.ok) {
        // اگر 409 بود، دیالوگ انتقال را باز کن
        if (r.status === 409) {
          const target = items.find((x) => x.id === id) || null;
          setDeleteTarget(target);
          // پیش‌فرض: مقصد انتقال خالی
          setMoveChildrenTo("");
          setMoveProjectsTo("");
          return;
        }
        throw new Error(await r.text());
      }
      await load();
      setOkMsg("حذف شد");
      setTimeout(() => setOkMsg(null), 2000);
    } catch (e: any) {
      setErrorMsg(e?.message || "خطا در حذف");
    }
  }

  async function confirmDeleteWithMove() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setErrorMsg(null);
    try {
      const qs = new URLSearchParams();
      if (moveChildrenTo !== "") qs.set("moveChildrenTo", moveChildrenTo);
      if (moveProjectsTo !== "") qs.set("moveProjectsTo", moveProjectsTo);

      const r = await fetch(`/api/categories/${deleteTarget.id}?${qs.toString()}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error(await r.text());
      setDeleteTarget(null);
      await load();
      setOkMsg("حذف انجام شد");
      setTimeout(() => setOkMsg(null), 2000);
    } catch (e: any) {
      setErrorMsg(e?.message || "خطا در حذف");
    } finally {
      setDeleteBusy(false);
    }
  }

  function startEdit(row: Category) {
    setEditId(row.id);
    setName(row.name);
    setSlug(row.slug);
    setParentId(row.parentId == null ? "" : String(row.parentId));
  }

  return (
    <div className="admin-container py-6">
      {/* نوار بالا */}
      <div className="flex items-center gap-3 mb-4">
        <button className="btn-secondary" onClick={load} disabled={loading}>
          به‌روزرسانی
        </button>
        <input
          className="input"
          placeholder="...جستجو"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {okMsg && <span className="text-success text-sm">{okMsg}</span>}
        {errorMsg && <span className="text-danger text-sm">{errorMsg}</span>}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* جدول */}
        <div className="col-span-8">
          <div className="card">
            <div className="card-header">فهرست دسته‌ها</div>
            <div className="table">
              <div className="thead grid grid-cols-12">
                <div className="th col-span-4">عنوان</div>
                <div className="th col-span-3">اسلاگ</div>
                <div className="th col-span-3">والد</div>
                <div className="th col-span-2 text-center">عملیات</div>
              </div>
              {filtered.map((row) => (
                <div className="tr grid grid-cols-12" key={row.id}>
                  <div className="td col-span-4">{row.name}</div>
                  <div className="td col-span-3">{row.slug}</div>
                  <div className="td col-span-3">
                    {row.parentId == null ? "—" : parents.find((p) => p.id === row.parentId)?.name ?? row.parentId}
                  </div>
                  <div className="td col-span-2 flex justify-center gap-2">
                    <button className="btn" onClick={() => startEdit(row)}>ویرایش</button>
                    <button className="btn-danger" onClick={() => remove(row.id)}>حذف</button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="tr">
                  <div className="td">موردی یافت نشد.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* فرم */}
        <div className="col-span-4">
          <div className="card">
            <div className="card-header">{editId ? "ویرایش دسته" : "افزودن دسته"}</div>
            <div className="card-body space-y-3">
              <div>
                <label className="label">عنوان</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً ویلایی" />
              </div>
              <div>
                <label className="label">اسلاگ (لاتین)</label>
                <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="مثلاً vila" />
              </div>
              <div>
                <label className="label">والد (اختیاری)</label>
                <select className="input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                  <option value="">— بدون والد —</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button className="btn-primary" onClick={save} disabled={loading}>
                  {editId ? "ذخیره" : "افزودن"}
                </button>
                <button className="btn" onClick={resetForm}>پاک کردن</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* دیالوگ حذف/انتقال */}
      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">حذف دسته «{deleteTarget.name}»</div>
            <div className="modal-body space-y-3">
              <p className="text-sm text-muted">
                این دسته زیردسته/نمونه‌کار دارد. برای حذف، مقصد انتقال را مشخص کنید:
              </p>
              <div>
                <label className="label">انتقال زیردسته‌ها به</label>
                <select
                  className="input"
                  value={moveChildrenTo}
                  onChange={(e) => setMoveChildrenTo(e.target.value)}
                >
                  <option value="">— انتقال نده —</option>
                  {parents
                    .filter((p) => p.id !== deleteTarget.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="label">انتقال نمونه‌کارها به</label>
                <select
                  className="input"
                  value={moveProjectsTo}
                  onChange={(e) => setMoveProjectsTo(e.target.value)}
                >
                  <option value="">— انتقال نده —</option>
                  {parents
                    .filter((p) => p.id !== deleteTarget.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
              {errorMsg && <div className="text-danger text-sm">{errorMsg}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setDeleteTarget(null)} disabled={deleteBusy}>
                انصراف
              </button>
              <button className="btn-danger" onClick={confirmDeleteWithMove} disabled={deleteBusy}>
                تأیید حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

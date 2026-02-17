"use client";

import { useEffect, useRef, useState } from "react";

type Banner = {
  id: number; title: string; imageUrl: string; linkUrl?: string | null;
  order: number; active: boolean;
};

function useBanners(){
  const [rows,setRows]=useState<Banner[]>([]);
  const [loading,setLoading]=useState(false);
  const load = async ()=>{ setLoading(true); const r=await fetch("/api/banners"); setRows(await r.json()); setLoading(false); };
  useEffect(()=>{ load(); },[]);
  return { rows, loading, load };
}

function Uploader({ onDone }:{ onDone:(url:string)=>void }){
  const [busy,setBusy]=useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setBusy(true);
    const r = await fetch("/api/upload", { method:"POST", body: fd });
    setBusy(false);
    const json = await r.json();
    if (json?.url) onDone(json.url);
  };

  return (
    <div className="flex items-center gap-2">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange}/>
      <button className="btn btn-secondary" onClick={()=>inputRef.current?.click()} disabled={busy}>
        {busy ? "در حال آپلود..." : "آپلود تصویر"}
      </button>
    </div>
  )
}

function Form(){
  const { load } = useBanners(); // از کانتکست صفحه جداست؛ ساده نگه داریم
  const [model,setModel]=useState<Partial<Banner>>({ title:"", order:0, active:true });

  const submit = async ()=>{
    if(!model.imageUrl) return alert("تصویر انتخاب نشده است.");
    const r = await fetch("/api/banners",{
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body: JSON.stringify(model)
    });
    if(r.ok){ setModel({ title:"", order:0, active:true, imageUrl:"" }); await load(); }
  };

  return (
    <div className="space-y-3">
      <label className="label">عنوان</label>
      <input className="input" value={model.title||""} onChange={e=>setModel(s=>({...s, title:e.target.value}))}/>
      <label className="label">لینک (اختیاری)</label>
      <input className="input" value={model.linkUrl||""} onChange={e=>setModel(s=>({...s, linkUrl:e.target.value}))}/>
      <label className="label">ترتیب</label>
      <input className="input" type="number" value={model.order ?? 0} onChange={e=>setModel(s=>({...s, order:Number(e.target.value)}))}/>
      <div className="flex items-center gap-2">
        <input id="act" type="checkbox" checked={!!model.active} onChange={e=>setModel(s=>({...s, active:e.target.checked}))}/>
        <label htmlFor="act" className="text-sm">فعال</label>
      </div>

      <div className="flex items-center gap-3">
        <Uploader onDone={(url)=>setModel(s=>({...s, imageUrl:url}))}/>
        {model.imageUrl && <img src={model.imageUrl} alt="" className="h-12 rounded-lg border" />}
      </div>

      <div className="pt-2">
        <button className="btn btn-primary w-full" onClick={submit}>ذخیره</button>
      </div>
    </div>
  );
}

function List(){
  const { rows, loading, load } = useBanners();

  const toggle = async (b: Banner)=>{
    await fetch(`/api/banners/${b.id}`,{
      method:"PUT",
      headers:{ "Content-Type":"application/json"},
      body: JSON.stringify({ ...b, active: !b.active })
    });
    await load();
  };

  const remove = async (id:number)=>{
    if(!confirm("حذف شود؟")) return;
    await fetch(`/api/banners/${id}`, { method:"DELETE" });
    await load();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table">
        <thead className="thead">
          <tr className="tr">
            <th className="th">تصویر</th>
            <th className="th">عنوان</th>
            <th className="th">ترتیب</th>
            <th className="th">وضعیت</th>
            <th className="th">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(b=>(
            <tr key={b.id} className="tr">
              <td className="td">
                <img src={b.imageUrl} alt="" className="h-12 w-20 object-cover rounded-lg border" />
              </td>
              <td className="td">{b.title}</td>
              <td className="td">{b.order}</td>
              <td className="td">
                <span className={`chip ${b.active ? "text-success" : "text-muted"}`}>
                  {b.active ? "فعال" : "غیرفعال"}
                </span>
              </td>
              <td className="td">
                <div className="flex gap-2">
                  <button className="btn btn-secondary" onClick={()=>toggle(b)}>{b.active ? "غیرفعال" : "فعال"}</button>
                  <button className="btn btn-danger" onClick={()=>remove(b.id)}>حذف</button>
                </div>
              </td>
            </tr>
          ))}
          {!loading && rows.length===0 && (
            <tr><td className="td" colSpan={5}>موردی ثبت نشده است.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const BannersAdmin = { Form, List };
export default BannersAdmin;

"use client";

import { useMemo, useState, useEffect } from "react";
import { createContainerEstimate } from "@/app/actions/container-estimate";
import { ContainerEstimateType, ProfitType } from "@prisma/client";

type ContainerModel = { id: number; title?: string; name?: string };
type SizePreset = { id: number; title: string };

type Terrace = {
  title: string;
  areaM2: number;
  pricingMode: "PER_M2" | "FIXED";
  unitPrice: number;   // اگر PER_M2
  fixedPrice: number;  // اگر FIXED
  note?: string;
};

type Floor = {
  title: string; // همکف، اول، دوم...
  areaM2: number;

  pricingMode: "PER_M2" | "FIXED";
  unitPrice: number;
  fixedPrice: number;

  // امکانات مهم هر طبقه
  bedroomsCount: number;
  toilet: "NONE" | "IRANIAN" | "FARANGI" | "BOTH";
  shower: boolean;

  kitchen: boolean;
  cabinetMeters: number;

  interiorWall: "GYPSUM" | "KNAUF" | "PVC" | "MDF";
  painting: boolean;

  terraces: Terrace[];
};

function money(n: number) {
  return Math.round(n).toLocaleString("fa-IR");
}
function floorPrice(f: Floor) {
  return f.pricingMode === "PER_M2" ? f.areaM2 * f.unitPrice : f.fixedPrice;
}
function terracePrice(t: Terrace) {
  return t.pricingMode === "PER_M2" ? t.areaM2 * t.unitPrice : t.fixedPrice;
}

export default function NewContainerEstimatePage() {
  // دیتاهای پایه (مدل‌ها/سایزها)
  const [models, setModels] = useState<ContainerModel[]>([]);
  const [sizes, setSizes] = useState<SizePreset[]>([]);

  useEffect(() => {
    (async () => {
      const cm = await fetch("/api/container-models", { cache: "no-store" }).then(r => r.json());
      const sp = await fetch("/api/container-size-presets", { cache: "no-store" }).then(r => r.json());
      setModels(Array.isArray(cm) ? cm : []);
      setSizes(Array.isArray(sp) ? sp : []);
    })();
  }, []);

  // meta
  const [estimateType, setEstimateType] = useState<ContainerEstimateType>("STANDARD" as any);

  const [containerModelId, setContainerModelId] = useState<number | null>(null);
  const [sizePresetId, setSizePresetId] = useState<number | null>(null);

  // ابعاد کلی (صرفاً برای نمایش/فیلتر؛ چون پروژه طبقه‌ای است)
  const [length, setLength] = useState<number>(6);
  const [width, setWidth] = useState<number>(2.4);
  const [height, setHeight] = useState<number>(2.4);

  // مشتری
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [usageType, setUsageType] = useState("");

  // شرایط
  const [deliveryDays, setDeliveryDays] = useState<number>(15);
  const [paymentTerms, setPaymentTerms] = useState("30٪ پیش‌پرداخت، 60٪ هنگام اتمام ساخت، 10٪ قبل از ارسال");
  const [warrantyTerms, setWarrantyTerms] = useState("گارانتی اسکلت و عایق 12 ماه");
  const [transportTerms, setTransportTerms] = useState("هزینه حمل و جرثقیل بر عهده مشتری است مگر توافق شود.");
  const [notesForCustomer, setNotesForCustomer] = useState("");

  // سود
  const [profitType, setProfitType] = useState<ProfitType>("FIXED" as any);
  const [profitValue, setProfitValue] = useState<number>(0);

  // اسکلت (فنی-نمایشی)
  const [profileWeightKg, setProfileWeightKg] = useState<number>(11);
  const [columns, setColumns] = useState<string>("80×80");

  // طبقات
  const [floors, setFloors] = useState<Floor[]>([
    {
      title: "همکف",
      areaM2: 40,
      pricingMode: "PER_M2",
      unitPrice: 16000000,
      fixedPrice: 0,
      bedroomsCount: 0,
      toilet: "NONE",
      shower: false,
      kitchen: false,
      cabinetMeters: 0,
      interiorWall: "KNAUF",
      painting: true,
      terraces: [],
    },
  ]);

  const baseItems = useMemo(() => {
    const items: { title: string; amount: number }[] = [];

    floors.forEach((f, idx) => {
      const amt = floorPrice(f);
      const title =
        `طبقه ${f.title} — ${f.areaM2} متر` +
        (f.pricingMode === "PER_M2" ? ` × متری ${money(f.unitPrice)}` : ` (مقطوع)`);
      items.push({ title, amount: amt });

      // تراس‌ها
      f.terraces.forEach((t) => {
        const tamt = terracePrice(t);
        const ttitle =
          `${t.title || `تراس طبقه ${f.title}`} — ${t.areaM2} متر` +
          (t.pricingMode === "PER_M2" ? ` × متری ${money(t.unitPrice)}` : ` (مقطوع)`);
        items.push({ title: ttitle, amount: tamt });
      });

      // آیتم‌های قیمت‌دار اختیاری (مثلاً کابینت اگر بخواهی قیمت‌گذاری جدا داشته باشد)
      // فعلاً فقط در specSummary می‌آوریم؛ اگر خواستی اینجا هم مبلغ بدهی، بگو تا unitPricePerMeter اضافه کنیم.
    });

    return items;
  }, [floors]);

  const baseTotal = useMemo(() => baseItems.reduce((s, x) => s + x.amount, 0), [baseItems]);

  const profitAmount = useMemo(() => {
    if (profitType === "FIXED") return profitValue;
    return Math.round(baseTotal * (profitValue / 100));
  }, [profitType, profitValue, baseTotal]);

  const finalPrice = baseTotal + profitAmount;

  const spec = useMemo(() => {
    return {
      structure: { profileWeightKg, columns },
      floors: floors.map((f) => ({
        title: f.title,
        areaM2: f.areaM2,
        pricing: f.pricingMode === "PER_M2"
          ? { mode: "PER_M2", unitPrice: f.unitPrice }
          : { mode: "FIXED", fixedPrice: f.fixedPrice },

        rooms: { bedroomsCount: f.bedroomsCount },
        toilet: { type: f.toilet },
        shower: { has: f.shower },
        kitchen: { has: f.kitchen, cabinetMeters: f.cabinetMeters },
        finishes: { innerWall: f.interiorWall, painting: f.painting },
        terraces: f.terraces.map((t) => ({
          title: t.title,
          areaM2: t.areaM2,
          pricing: t.pricingMode === "PER_M2"
            ? { mode: "PER_M2", unitPrice: t.unitPrice }
            : { mode: "FIXED", fixedPrice: t.fixedPrice },
          note: t.note,
        })),
      })),
    };
  }, [floors, profileWeightKg, columns]);

  const specSummary = useMemo(() => {
    const lines: string[] = [];
    lines.push(`اسکلت: پروفیل ${profileWeightKg} کیلویی | ستون ${columns}`);

    floors.forEach((f) => {
      lines.push(`— طبقه ${f.title}: ${f.areaM2} متر | قیمت: ${money(floorPrice(f))} تومان`);
      if (f.bedroomsCount) lines.push(`  اتاق خواب: ${f.bedroomsCount} عدد`);
      if (f.toilet !== "NONE") lines.push(`  سرویس: ${f.toilet === "IRANIAN" ? "ایرانی" : f.toilet === "FARANGI" ? "فرنگی" : "ایرانی+فرنگی"}`);
      if (f.shower) lines.push(`  حمام: دارد`);
      if (f.kitchen) lines.push(`  آشپزخانه: دارد${f.cabinetMeters ? ` | کابینت ${f.cabinetMeters} متر` : ""}`);
      lines.push(`  دیوار داخلی: ${f.interiorWall} ${f.painting ? "+ نقاشی" : ""}`);
      f.terraces.forEach((t) => lines.push(`  تراس: ${t.title} | ${t.areaM2} متر | ${money(terracePrice(t))} تومان`));
    });

    return lines.join("\n");
  }, [floors, profileWeightKg, columns]);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);

    if (!containerModelId) return setErr("نوع کانکس را انتخاب کن");
    if (!sizePresetId) return setErr("سایز (Preset) را انتخاب کن (برای ثبت رکورد اجباری است)");
    if (!customerName.trim()) return setErr("نام مشتری را وارد کن");
    if (!customerPhone.trim()) return setErr("شماره تماس مشتری را وارد کن");
    if (floors.length === 0) return setErr("حداقل یک طبقه باید ثبت شود");

    try {
      setSaving(true);

      await createContainerEstimate({
        estimateType,
        containerModelId,
        sizePresetId,
        length,
        width,
        height,

        spec,
        specSummary,

        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        projectLocation: projectLocation.trim() || undefined,
        usageType: usageType.trim() || undefined,

        deliveryDays,
        paymentTerms,
        warrantyTerms,
        transportTerms,
        notesForCustomer: notesForCustomer.trim() || undefined,

        profitType,
        profitValue,

        // 👇 مهم: ردیف‌های قیمت‌دار مشتری
        displayItems: baseItems,

        // ریزمصرف نداریم
        lines: [],
        extras: [],
      });

      alert("پیش‌فاکتور ثبت شد");
    } catch (e: any) {
      setErr(e?.message || "خطا در ثبت پیش‌فاکتور");
    } finally {
      setSaving(false);
    }
  }

  const modelTitle = (m: ContainerModel) => m.title || m.name || `#${m.id}`;

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">ایجاد پیش‌فاکتور چندطبقه</h1>

        <select
          className="border p-2 rounded"
          value={estimateType}
          onChange={(e) => setEstimateType(e.target.value as any)}
        >
          <option value="STANDARD">معمولی</option>
          <option value="LUXURY">لوکس</option>
        </select>
      </div>

      {/* مشتری */}
      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-3">اطلاعات مشتری</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="border p-2 rounded" value={customerName} onChange={(e)=>setCustomerName(e.target.value)} placeholder="نام مشتری *" />
          <input className="border p-2 rounded" value={customerPhone} onChange={(e)=>setCustomerPhone(e.target.value)} placeholder="شماره تماس *" />
          <input className="border p-2 rounded" value={projectLocation} onChange={(e)=>setProjectLocation(e.target.value)} placeholder="محل پروژه" />
          <input className="border p-2 rounded" value={usageType} onChange={(e)=>setUsageType(e.target.value)} placeholder="کاربری" />
        </div>
      </section>

      {/* مدل و سایز */}
      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-3">مشخصات کلی</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select className="border p-2 rounded" value={containerModelId ?? ""} onChange={(e)=>setContainerModelId(Number(e.target.value))}>
            <option value="">انتخاب نوع کانکس *</option>
            {models.map(m => <option key={m.id} value={m.id}>{modelTitle(m)}</option>)}
          </select>

          <select className="border p-2 rounded" value={sizePresetId ?? ""} onChange={(e)=>setSizePresetId(Number(e.target.value))}>
            <option value="">انتخاب سایز preset *</option>
            {sizes.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>

          <div className="grid grid-cols-3 gap-2">
            <input type="number" className="border p-2 rounded" value={length} onChange={(e)=>setLength(Number(e.target.value))} placeholder="طول" />
            <input type="number" className="border p-2 rounded" value={width} onChange={(e)=>setWidth(Number(e.target.value))} placeholder="عرض" />
            <input type="number" className="border p-2 rounded" value={height} onChange={(e)=>setHeight(Number(e.target.value))} placeholder="ارتفاع" />
          </div>
        </div>
      </section>

      {/* اسکلت */}
      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-3">مشخصات فنی (نمایشی)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="number" className="border p-2 rounded" value={profileWeightKg} onChange={(e)=>setProfileWeightKg(Number(e.target.value))} placeholder="پروفیل (کیلو)" />
          <input className="border p-2 rounded" value={columns} onChange={(e)=>setColumns(e.target.value)} placeholder="ستون‌ها (مثلاً 80×80)" />
        </div>
      </section>

      {/* طبقات */}
      <section className="rounded-xl border bg-white p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">طبقات</h2>
          <button
            type="button"
            className="text-blue-600"
            onClick={() =>
              setFloors([
                ...floors,
                {
                  title: `طبقه ${floors.length}`,
                  areaM2: 30,
                  pricingMode: "PER_M2",
                  unitPrice: 15000000,
                  fixedPrice: 0,
                  bedroomsCount: 0,
                  toilet: "NONE",
                  shower: false,
                  kitchen: false,
                  cabinetMeters: 0,
                  interiorWall: "KNAUF",
                  painting: true,
                  terraces: [],
                },
              ])
            }
          >
            + افزودن طبقه
          </button>
        </div>

        {floors.map((f, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">طبقه {i+1}</div>
              <button type="button" className="text-red-600" onClick={() => setFloors(floors.filter((_,idx)=>idx!==i))}>
                حذف طبقه
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input className="border p-2 rounded" value={f.title} onChange={(e)=>{ const c=[...floors]; c[i].title=e.target.value; setFloors(c); }} placeholder="عنوان طبقه" />
              <input type="number" className="border p-2 rounded" value={f.areaM2} onChange={(e)=>{ const c=[...floors]; c[i].areaM2=Number(e.target.value); setFloors(c); }} placeholder="متراژ (m²)" />
              <select className="border p-2 rounded" value={f.pricingMode} onChange={(e)=>{ const c=[...floors]; c[i].pricingMode=e.target.value as any; setFloors(c); }}>
                <option value="PER_M2">متری</option>
                <option value="FIXED">مقطوع</option>
              </select>
              {f.pricingMode==="PER_M2" ? (
                <input type="number" className="border p-2 rounded" value={f.unitPrice} onChange={(e)=>{ const c=[...floors]; c[i].unitPrice=Number(e.target.value); setFloors(c); }} placeholder="قیمت هر متر" />
              ) : (
                <input type="number" className="border p-2 rounded" value={f.fixedPrice} onChange={(e)=>{ const c=[...floors]; c[i].fixedPrice=Number(e.target.value); setFloors(c); }} placeholder="قیمت مقطوع" />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-sm">
              <input type="number" className="border p-2 rounded" value={f.bedroomsCount} onChange={(e)=>{ const c=[...floors]; c[i].bedroomsCount=Number(e.target.value); setFloors(c); }} placeholder="تعداد اتاق خواب" />
              <select className="border p-2 rounded" value={f.toilet} onChange={(e)=>{ const c=[...floors]; c[i].toilet=e.target.value as any; setFloors(c); }}>
                <option value="NONE">بدون سرویس</option>
                <option value="IRANIAN">ایرانی</option>
                <option value="FARANGI">فرنگی</option>
                <option value="BOTH">ایرانی+فرنگی</option>
              </select>
              <label className="flex items-center gap-2 border p-2 rounded">
                <input type="checkbox" checked={f.shower} onChange={(e)=>{ const c=[...floors]; c[i].shower=e.target.checked; setFloors(c); }} />
                حمام
              </label>
              <label className="flex items-center gap-2 border p-2 rounded">
                <input type="checkbox" checked={f.kitchen} onChange={(e)=>{ const c=[...floors]; c[i].kitchen=e.target.checked; setFloors(c); }} />
                آشپزخانه
              </label>
              <input type="number" className="border p-2 rounded" value={f.cabinetMeters} onChange={(e)=>{ const c=[...floors]; c[i].cabinetMeters=Number(e.target.value); setFloors(c); }} placeholder="متر کابینت" />
              <select className="border p-2 rounded" value={f.interiorWall} onChange={(e)=>{ const c=[...floors]; c[i].interiorWall=e.target.value as any; setFloors(c); }}>
                <option value="KNAUF">کناف</option>
                <option value="GYPSUM">گچ‌کاری</option>
                <option value="PVC">PVC</option>
                <option value="MDF">MDF</option>
              </select>
              <label className="flex items-center gap-2 border p-2 rounded">
                <input type="checkbox" checked={f.painting} onChange={(e)=>{ const c=[...floors]; c[i].painting=e.target.checked; setFloors(c); }} />
                نقاشی
              </label>
            </div>

            {/* تراس‌ها */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">تراس‌های این طبقه</div>
                <button
                  type="button"
                  className="text-blue-600 text-sm"
                  onClick={() => {
                    const c=[...floors];
                    c[i].terraces.push({ title: `تراس طبقه ${f.title}`, areaM2: 10, pricingMode:"PER_M2", unitPrice: 7000000, fixedPrice: 0 });
                    setFloors(c);
                  }}
                >
                  + افزودن تراس
                </button>
              </div>

              <div className="space-y-2 mt-2">
                {f.terraces.map((t, ti) => (
                  <div key={ti} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <input className="border p-2 rounded" value={t.title} onChange={(e)=>{ const c=[...floors]; c[i].terraces[ti].title=e.target.value; setFloors(c); }} />
                    <input type="number" className="border p-2 rounded" value={t.areaM2} onChange={(e)=>{ const c=[...floors]; c[i].terraces[ti].areaM2=Number(e.target.value); setFloors(c); }} placeholder="متراژ" />
                    <select className="border p-2 rounded" value={t.pricingMode} onChange={(e)=>{ const c=[...floors]; c[i].terraces[ti].pricingMode=e.target.value as any; setFloors(c); }}>
                      <option value="PER_M2">متری</option>
                      <option value="FIXED">مقطوع</option>
                    </select>
                    {t.pricingMode==="PER_M2" ? (
                      <input type="number" className="border p-2 rounded" value={t.unitPrice} onChange={(e)=>{ const c=[...floors]; c[i].terraces[ti].unitPrice=Number(e.target.value); setFloors(c); }} placeholder="قیمت متری" />
                    ) : (
                      <input type="number" className="border p-2 rounded" value={t.fixedPrice} onChange={(e)=>{ const c=[...floors]; c[i].terraces[ti].fixedPrice=Number(e.target.value); setFloors(c); }} placeholder="قیمت مقطوع" />
                    )}
                    <button type="button" className="text-red-600" onClick={()=>{ const c=[...floors]; c[i].terraces.splice(ti,1); setFloors(c); }}>
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              قیمت این طبقه: <b>{money(floorPrice(f))}</b> تومان
            </div>
          </div>
        ))}
      </section>

      {/* سود */}
      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-3">سود</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <select className="border p-2 rounded" value={profitType} onChange={(e)=>setProfitType(e.target.value as any)}>
            <option value="FIXED">مبلغ ثابت</option>
            <option value="PERCENT">درصدی</option>
          </select>
          <input type="number" className="border p-2 rounded w-48" value={profitValue} onChange={(e)=>setProfitValue(Number(e.target.value))} />
          <span className="text-sm text-gray-600">{profitType==="PERCENT" ? "%" : "تومان"}</span>
        </div>
      </section>

      {/* جمع‌بندی */}
      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-3">جمع‌بندی</h2>

        <div className="space-y-1 text-sm">
          {baseItems.map((x, i) => (
            <div key={i} className="flex justify-between gap-3">
              <span>{x.title}</span>
              <b>{money(x.amount)}</b>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t">
            <span>جمع پایه</span>
            <b>{money(baseTotal)}</b>
          </div>
          <div className="flex justify-between">
            <span>سود</span>
            <b>{money(profitAmount)}</b>
          </div>
          <div className="flex justify-between text-base pt-2 border-t">
            <span className="font-bold">مبلغ نهایی</span>
            <span className="font-bold">{money(finalPrice)}</span>
          </div>
        </div>

        {err && <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{err}</div>}

        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className={`mt-4 px-6 py-3 rounded text-white ${saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {saving ? "در حال ثبت..." : "ثبت پیش‌فاکتور"}
        </button>
      </section>

      {/* specSummary preview */}
      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-2">خلاصه برای PDF (specSummary)</h2>
        <pre className="text-xs whitespace-pre-wrap text-gray-700">{specSummary}</pre>
      </section>
    </div>
  );
}

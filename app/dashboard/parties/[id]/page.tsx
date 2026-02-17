// app/dashboard/parties/[id]/page.tsx
import PartyEditClient from "./ui/PartyEditClient";

export default async function PartyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partyId = Number(id);

  let initial: any = null;

  if (Number.isFinite(partyId) && partyId > 0) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/parties/${partyId}`, {
        cache: "no-store",
      });

      if (res.ok) initial = await res.json();
    } catch {
      // اگر fetch سرور به هر دلیل fail شد، initial می‌ماند null و کلاینت خودش دوباره می‌گیرد
    }
  }

  return <PartyEditClient id={partyId} initial={initial} />;
}

// app/dashboard/invoices/new/InvoiceNewClient.tsx
"use client";

import { useSearchParams } from "next/navigation";
import InvoiceFormClient from "../_components/InvoiceFormClient";

function asPositiveInt(v: string | null) {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

export default function InvoiceNewClient() {
  const sp = useSearchParams();

  const projectId = asPositiveInt(sp.get("projectId"));
  const partyId = asPositiveInt(sp.get("partyId"));

  return (
    <InvoiceFormClient
      mode="create"
      defaultDocType="PROFORMA"
      initialLinks={{
        projectId,
        partyId,
      }}
    />
  );
}

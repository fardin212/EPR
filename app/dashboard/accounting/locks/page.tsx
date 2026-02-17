import { getMeServer } from "@/lib/authMe";
import LocksClient from "./ui/LocksClient";

export default async function AccountingLocksPage() {
  await getMeServer(); // فقط برای اطمینان از لاگین
  return <LocksClient />;
}

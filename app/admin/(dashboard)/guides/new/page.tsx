import GuideForm from "../GuideForm";
import { createGuide } from "../actions";

export const dynamic = "force-dynamic";

export default function NewGuidePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-lg font-extrabold text-slate-900 mb-4">ایجاد راهنمای جدید</h1>
      <GuideForm mode="create" action={createGuide} />
    </main>
  );
}

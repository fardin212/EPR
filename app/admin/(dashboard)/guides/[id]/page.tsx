import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import GuideForm from "../GuideForm";
import DeleteGuideButton from "../DeleteGuideButton";
import { deleteGuide, updateGuide } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditGuidePage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const guide = await prisma.guide.findUnique({ where: { id } });
  if (!guide) notFound();

  const updateAction = updateGuide.bind(null, id);

  const deleteAction = async () => {
    "use server";
    await deleteGuide(id);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-lg font-extrabold text-slate-900">
          ویرایش راهنما: {guide.name}
        </h1>
        <DeleteGuideButton onDelete={deleteAction} />
      </div>

      <GuideForm
        mode="edit"
        action={updateAction}
        defaultValues={{
          slug: guide.slug,
          name: guide.name,
          keyword: guide.keyword,
          seoTitle: guide.seoTitle,
          seoDescription: guide.seoDescription,
          summary: guide.summary,
          contentHtml: guide.contentHtml,
          imageUrl: guide.imageUrl,
          faqJson: guide.faqJson,
          specsJson: guide.specsJson,
          galleryJson: guide.galleryJson,
        }}
      />
    </main>
  );
}

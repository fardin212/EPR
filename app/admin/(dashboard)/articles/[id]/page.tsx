// app/admin/(dashboard)/articles/[id]/page.tsx
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { updatePost, removePost } from "../actions";
import { ArticleForm } from "../ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const auth = cookies().get("admin_auth")?.value;
  if (auth !== "1") redirect("/admin/login");

  const pid = Number(params.id);
  if (!Number.isFinite(pid)) notFound();

  const post = await prisma.post.findUnique({
    where: { id: pid },
  });

  if (!post) notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 text-[color:var(--text)]">
      {/* هدر بالای صفحه + حذف */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold">
            ویرایش مقاله
          </h1>
          <p className="text-xs text-[color:var(--muted)]">
            عنوان، تصویر کاور، بدنه، سئو و تنظیمات این مقاله را
            ویرایش کنید.
          </p>
        </div>
        <form action={removePost}>
          <input type="hidden" name="id" value={post.id} />
          <button className="rounded-xl border border-rose-200 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50">
            حذف مقاله
          </button>
        </form>
      </div>

      {/* فرم مشترک ایجاد/ویرایش */}
      <ArticleForm
        mode="edit"
        defaultValues={post}
        onSubmit={updatePost}
      />
    </main>
  );
}


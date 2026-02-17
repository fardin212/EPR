import { redirect } from "next/navigation";

export default async function EditEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/container-estimates/${id}?edit=1`);
}

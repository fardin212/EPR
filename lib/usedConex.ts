import { prisma } from "@/lib/db";
import { UsedConexStatus } from "@prisma/client";

export type UsedConexListItem = {
  id: string;
  slug: string;
  title: string;
  type: string;
  size: string;
  city: string;
  price: number;
  status: UsedConexStatus;
  isReady: boolean;
};

export async function listUsedConex(filters?: {
  type?: string;
  city?: string;
  status?: UsedConexStatus;
}) {
  const where: any = {};

  if (filters?.type && filters.type !== "همه") where.type = filters.type;
  if (filters?.city && filters.city !== "همه") where.city = filters.city;
  if (filters?.status) where.status = filters.status;

  const rows = await prisma.usedConex.findMany({
    where,
    orderBy: [{ isReady: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      size: true,
      city: true,
      price: true,
      status: true,
      isReady: true,
    },
  });

  return rows as UsedConexListItem[];
}

export async function getUsedConexBySlug(slug: string) {
  const item = await prisma.usedConex.findUnique({
    where: { slug },
    include: {
      images: { orderBy: [{ kind: "asc" }, { sort: "asc" }] },
      refurbItems: { orderBy: [{ sort: "asc" }] },
    },
  });
  return item;
}

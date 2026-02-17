import { prisma } from "@/lib/db";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://conexnikan.com";

  const category = await prisma.category.findMany({
    select: { slug: true, updatedAt: true },
  });

  const projects = await prisma.project.findMany({
    select: { slug: true, updatedAt: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/services`, lastModified: new Date() },
  ];

  const categoryUrls: MetadataRoute.Sitemap = category.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: c.updatedAt,
  }));

  const projectUrls: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${baseUrl}/projects/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  return [...staticPages, ...categoryUrls, ...projectUrls];
}

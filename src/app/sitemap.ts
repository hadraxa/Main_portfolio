import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const projects = await getAllProjects();

  return [
    {
      url: new URL("/", siteUrl).toString(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: new URL("/projects", siteUrl).toString(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...projects.map((project) => ({
      url: new URL(`/projects/${project.slug}`, siteUrl).toString(),
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: project.featured ? 0.8 : 0.7,
    })),
  ];
}

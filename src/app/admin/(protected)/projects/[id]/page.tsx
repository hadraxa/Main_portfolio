import { notFound } from "next/navigation";
import ProjectEditor, { type ProjectPayload } from "@/components/admin/ProjectEditor";
import { getProjectById } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) notFound();
  const data = await getProjectById(numId);
  if (!data) notFound();

  const initial: ProjectPayload = {
    id: data.project.id,
    slug: data.project.slug,
    title: data.project.title,
    tagline: data.project.tagline,
    description: data.project.description,
    coverEmoji: data.project.coverEmoji,
    coverGradient: data.project.coverGradient,
    tags: data.project.tags,
    repoUrl: data.project.repoUrl,
    demoUrl: data.project.demoUrl,
    readme: data.project.readme,
    featured: data.project.featured,
    sortOrder: data.project.sortOrder,
    files: data.files.map((f, i) => ({
      id: f.id,
      path: f.path,
      language: f.language,
      content: f.content,
      sortOrder: f.sortOrder ?? i,
    })),
  };

  return <ProjectEditor initial={initial} mode="edit" />;
}

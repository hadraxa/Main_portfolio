import ProjectEditor, { type ProjectPayload } from "@/components/admin/ProjectEditor";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  const initial: ProjectPayload = {
    slug: "",
    title: "",
    tagline: "",
    description: "",
    coverEmoji: "🚀",
    coverGradient: "from-fuchsia-500 via-purple-600 to-indigo-600",
    tags: "",
    repoUrl: "",
    demoUrl: "",
    readme: "",
    featured: false,
    sortOrder: 0,
    files: [],
  };
  return <ProjectEditor initial={initial} mode="create" />;
}

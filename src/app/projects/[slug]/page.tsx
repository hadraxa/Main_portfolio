import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProjectRepo from "@/components/ProjectRepo";
import { getProjectBySlug, parseTags } from "@/lib/projects";
import { highlight } from "@/lib/highlight";
import { getMetaDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);

  if (!data) {
    return {
      title: "Project not found",
      robots: { index: false, follow: false },
    };
  }

  const { project } = data;
  const description = getMetaDescription(
    project.description || project.tagline
  );

  return {
    title: project.title,
    description,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      type: "article",
      title: project.title,
      description,
      url: `/projects/${project.slug}`,
    },
    twitter: {
      card: "summary",
      title: project.title,
      description,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) notFound();

  const { project, files } = data;

  const highlighted = files.map((f) => ({
    id: f.id,
    path: f.path,
    language: f.language,
    content: f.content,
    highlighted: highlight(f.content, f.language),
  }));

  return (
    <main>
      <Nav />
      <section className="pt-32 pb-10 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/projects" className="text-sm text-slate-400 hover:text-white">
            ← All projects
          </Link>

          <div className="mt-6 glass rounded-3xl overflow-hidden">
            <div className={`h-56 md:h-72 bg-gradient-to-br ${project.coverGradient} relative`}>
              <div className="absolute inset-0 grid place-items-center text-8xl md:text-9xl">
                {project.coverEmoji}
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.25),transparent_60%)]" />
            </div>
            <div className="p-6 md:p-10">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                    {project.title}
                  </h1>
                  <p className="mt-3 text-slate-300 text-lg max-w-3xl">
                    {project.tagline}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-white text-black px-4 py-2 font-semibold text-sm hover:bg-slate-200"
                    >
                      Live demo ↗
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 font-medium text-white text-sm"
                    >
                      Source ↗
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {parseTags(project.tags).map((t) => (
                  <span
                    key={t}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {project.description && (
                <div className="mt-8 prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 md:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fuchsia-400">
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              </svg>
              Source code
            </h2>
            <div className="text-xs text-slate-500">{files.length} file{files.length === 1 ? "" : "s"}</div>
          </div>
          <ProjectRepo files={highlighted} />

          {project.readme && (
            <div className="mt-10 glass rounded-2xl p-6 md:p-8">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">README</div>
              <pre className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed font-mono">
{project.readme}
              </pre>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

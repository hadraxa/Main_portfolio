import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import { getAllProjects, parseTags } from "@/lib/projects";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Browse web development projects by Ahad Raza, including applications built with React, Next.js, Node.js, and modern cloud technologies.",
  alternates: {
    canonical: "/projects",
  },
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <main>
      <Nav />
      <section className="pt-32 pb-16 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-xs uppercase tracking-[0.35em] text-slate-400">
              My work
            </div>
            <h1 className="mt-2 text-4xl md:text-6xl font-black text-white tracking-tight">
              Projects & code repository
            </h1>
            <p className="mt-4 text-slate-300 max-w-2xl">
              A living archive of things I&apos;ve built — with source you can actually read. Click any project to open the mini-repo browser.
            </p>
          </Reveal>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-slate-400 col-span-full text-center">
                <div className="text-4xl mb-2">📭</div>
                <p>New projects are on the way.</p>
                <p className="mt-2 text-sm">Check back soon to explore my latest work and source code.</p>
              </div>
            ) : (
              projects.map((p, i) => (
                <Reveal key={p.id} delay={i * 50}>
                  <TiltCard className="rounded-2xl">
                  <Link
                    href={`/projects/${p.slug}`}
                    className="group glass rounded-2xl overflow-hidden block h-full"
                  >
                    <div
                      className={`h-40 bg-gradient-to-br ${p.coverGradient} relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 grid place-items-center text-6xl opacity-90 group-hover:scale-110 transition">
                        {p.coverEmoji}
                      </div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.25),transparent_60%)]" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">{p.title}</h3>
                        {p.featured && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                        {p.tagline}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {parseTags(p.tags).slice(0, 5).map((t) => (
                          <span key={t} className="text-[10px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                        <span className="text-slate-300 group-hover:text-white">
                          Open →
                        </span>
                      </div>
                    </div>
                  </Link>
                  </TiltCard>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

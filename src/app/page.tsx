import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { HeroSceneLazy } from "@/components/three/Lazy3D";
import TiltCard from "@/components/TiltCard";
import Reveal from "@/components/Reveal";
import SkillsSection from "@/components/skills/SkillsSection";
import { site } from "@/lib/site";
import { getFeaturedProjects, getAllProjects, parseTags } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedProjects();
  const all = await getAllProjects();
  const projectList = (featured.length > 0 ? featured : all).slice(0, 6);

  return (
    <main className="relative">
      <Nav />

      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute inset-0">
          <HeroSceneLazy />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-24 pb-16 w-full">
          <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Available for freelance & full-time roles
              </div>
              <h1 className="mt-6 text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.02]">
                Hi, I&apos;m{" "}
                <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Ahad Raza
                </span>
                .
                <br />I build things for the web.
              </h1>
              <p className="mt-6 text-lg text-slate-300 max-w-2xl">
                {site.summary}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="group relative inline-flex items-center gap-2 rounded-xl bg-white text-black px-5 py-3 font-semibold hover:bg-slate-200 transition"
                >
                  View my projects
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 font-medium text-white backdrop-blur"
                >
                  Get in touch
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { k: "3+", v: "Years exp." },
                  { k: "20+", v: "Projects" },
                  { k: "5★", v: "Client rating" },
                ].map((s) => (
                  <div key={s.v} className="glass rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-white">{s.k}</div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column left open so the WebGL object shows through */}
            <div className="hidden lg:block h-[520px]" aria-hidden />
          </div>

          <div className="mt-16 relative overflow-hidden">
            <div className="marquee flex whitespace-nowrap text-slate-500 text-xs uppercase tracking-[0.35em] gap-10">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-10">
                  {["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Azure", "Docker", "Tailwind", "Laravel", "MongoDB", "Redis"].map((t) => (
                    <span key={t + i}>◆ {t}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative py-24 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeader eyebrow="About" title="A developer with a full-stack mindset." />
          </Reveal>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              {
                t: "Full-stack by design",
                d: "From pixel-perfect React UIs to hardened Node & PHP APIs — I own the entire delivery.",
                i: "💻",
              },
              {
                t: "Cloud fluent",
                d: "AWS, Azure and Oracle Cloud infrastructure — networking, compute, storage, security.",
                i: "☁️",
              },
              {
                t: "Ships fast, ships safe",
                d: "Practical performance, SEO, RESTful APIs and a strong bias for user-focused outcomes.",
                i: "⚡",
              },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 100}>
                <TiltCard className="rounded-2xl">
                  <div className="glass rounded-2xl p-6 h-full">
                    <div className="text-3xl [transform:translateZ(16px)]">{c.i}</div>
                    <h3 className="mt-4 text-lg font-semibold text-white [transform:translateZ(10px)]">{c.t}</h3>
                    <p className="mt-2 text-sm text-slate-400">{c.d}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="relative py-24 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeader eyebrow="Experience" title="Where I&apos;ve been building." />
          </Reveal>
          <div className="mt-12 relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-fuchsia-500/40 via-purple-500/30 to-cyan-400/40" />
            <div className="space-y-10">
              {site.experience.map((exp, idx) => (
                <Reveal key={exp.role} delay={idx * 100}>
                  <div className={`relative md:grid md:grid-cols-2 md:gap-10 ${idx % 2 === 0 ? "" : "md:[&>*:first-child]:col-start-2"}`}>
                    <div className="pl-12 md:pl-0 md:pr-10 md:text-right">
                      <div className="absolute left-2.5 md:left-1/2 -translate-x-1/2 top-2 w-3 h-3 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 ring-4 ring-[#05070f]" />
                      <div className="text-xs uppercase tracking-widest text-slate-400">{exp.period}</div>
                      <h3 className="mt-1 text-xl font-semibold text-white">{exp.role}</h3>
                      <div className="text-slate-300">{exp.company}</div>
                    </div>
                    <div className="pl-12 md:pl-0 mt-3 md:mt-0">
                      <div className="glass rounded-2xl p-5">
                        <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
                          {exp.points.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-4">
            {site.education.map((ed) => (
              <div key={ed.school} className="glass rounded-2xl p-5">
                <div className="text-xs uppercase tracking-widest text-slate-400">{ed.period}</div>
                <div className="mt-1 text-white font-semibold">{ed.school}</div>
                <div className="text-sm text-slate-300">{ed.degree}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SKILLS & TECHNICAL ARSENAL */}
      <SkillsSection />

      {/* PROJECTS PREVIEW */}
      <section id="work" className="relative py-24 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <SectionHeader eyebrow="Selected work" title="Recent projects." />
              <Link
                href="/projects"
                className="text-sm text-slate-300 hover:text-white inline-flex items-center gap-1"
              >
                See all →
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projectList.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-slate-400 col-span-full">
                New projects are on the way. Check back soon to explore my latest work.
              </div>
            ) : (
              projectList.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
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
                        {parseTags(p.tags).slice(0, 4).map((t) => (
                          <span key={t} className="text-[10px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                            {t}
                          </span>
                        ))}
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

      {/* CONTACT */}
      <section id="contact" className="relative py-24 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="glass glow-border rounded-3xl p-8 md:p-14 text-center">
              <div className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Contact
              </div>
              <h2 className="mt-3 text-4xl md:text-5xl font-black text-white">
                Let&apos;s build something{" "}
                <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  amazing
                </span>
                .
              </h2>
              <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
                Have an idea, a role, or a broken production system at 2am? Drop me a line.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <a
                  href={`mailto:${site.email}`}
                  className="rounded-xl bg-white text-black px-5 py-3 font-semibold hover:bg-slate-200"
                >
                  {site.email}
                </a>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 font-medium text-white"
                >
                  {site.phone}
                </a>
              </div>
              <div className="mt-6 text-sm text-slate-400">📍 {site.location}</div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-3xl md:text-5xl font-black text-white tracking-tight" dangerouslySetInnerHTML={{ __html: title }} />
    </div>
  );
}

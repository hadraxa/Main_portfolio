"use client";

import { useState, useMemo } from "react";
import { ALL_SKILLS, SKILLS_CATEGORIES, type SkillItem } from "@/lib/skillsData";
import { SkillsGlobeLazy } from "@/components/three/Lazy3D";
import TechIcon from "@/components/TechIcon";
import TiltCard from "@/components/TiltCard";

type ViewMode = "split" | "matrix" | "globe";

export default function SkillsSection() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter skills based on active category and optional search
  const filteredSkills = useMemo(() => {
    return ALL_SKILLS.filter((skill) => {
      const matchesCategory =
        activeCategory === "all" || skill.category === activeCategory;
      const matchesSearch =
        searchQuery === "" ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ALL_SKILLS.length };
    ALL_SKILLS.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <section id="skills" className="relative py-24 px-5 md:px-8 overflow-hidden">
      {/* Background ambient lighting glow */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.25em] text-fuchsia-300 backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              Technical Arsenal
            </div>
            <h2 className="mt-3 text-3xl md:text-5xl font-black text-white tracking-tight">
              Tools I reach for{" "}
              <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                daily
              </span>
              .
            </h2>
            <p className="mt-3 text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
              Production-tested technologies across frontend, backend, databases, and enterprise cloud infrastructure.
            </p>
          </div>

          {/* Quick Competency Badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-300">
              ⚡ 3+ Yrs Full Stack
            </span>
            <span className="px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
              ☁️ Multi-Cloud (AWS/Azure)
            </span>
            <span className="px-3 py-1.5 rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300">
              🛡️ Enterprise IT @ McDonald&apos;s
            </span>
          </div>
        </div>

        {/* Controls Bar: Category Filter Pills + View Switcher */}
        <div className="mt-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {SKILLS_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = categoryCounts[cat.id] ?? 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSelectedSkill(null);
                  }}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium px-3.5 py-2 rounded-xl border transition-all ${
                    isActive
                      ? "bg-white text-slate-950 border-white shadow-lg shadow-white/10 scale-[1.02]"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? "bg-slate-900 text-slate-200"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: View Switcher */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl bg-black/40 border border-white/10 p-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === "split"
                    ? "bg-white/15 text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Split View (3D Globe + Tech Cards)"
              >
                🌓 Split View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === "matrix"
                    ? "bg-white/15 text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Full Tech Matrix"
              >
                🗂️ Grid Matrix
              </button>
              <button
                type="button"
                onClick={() => setViewMode("globe")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === "globe"
                    ? "bg-white/15 text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Interactive 3D Universe"
              >
                🌐 3D Orbit
              </button>
            </div>
          </div>
        </div>

        {/* Selected Skill Quick Detail Modal / Bar (if any is clicked) */}
        {selectedSkill && (
          <div className="mt-6 glass glow-border rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl grid place-items-center shadow-lg"
                style={{
                  backgroundColor: selectedSkill.color + "18",
                  borderColor: selectedSkill.color + "40",
                  borderWidth: 1,
                }}
              >
                <TechIcon
                  name={selectedSkill.icon}
                  className="w-7 h-7"
                  color={selectedSkill.color}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{selectedSkill.name}</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                    {selectedSkill.category}
                  </span>
                  <span
                    className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: selectedSkill.color + "25",
                      color: selectedSkill.color,
                    }}
                  >
                    {selectedSkill.experience}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                  {selectedSkill.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="flex flex-wrap gap-1.5">
                {selectedSkill.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="ml-2 text-xs text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10"
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW MODE 1: SPLIT VIEW (3D Interactive Globe + Curated Cards) */}
        {/* ============================================================== */}
        {viewMode === "split" && (
          <div className="mt-8 grid lg:grid-cols-[1fr_1.15fr] gap-8 items-start">
            {/* Left Column: 3D Interactive Globe */}
            <div className="lg:sticky lg:top-24">
              <div className="relative h-[380px] sm:h-[460px] lg:h-[520px] rounded-3xl glass glow-border overflow-hidden">
                <div className="absolute top-4 left-5 z-10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[11px] uppercase font-mono tracking-[0.25em] text-slate-300">
                    Interactive 3D Globe · Drag to spin
                  </span>
                </div>

                <div className="absolute bottom-4 left-5 z-10 text-[11px] text-slate-400 font-mono pointer-events-none">
                  {activeCategory === "all" ? (
                    <span>Highlighting all 24 skills</span>
                  ) : (
                    <span>
                      Filtered: <strong className="text-white">{activeCategory}</strong> (
                      {filteredSkills.length} nodes)
                    </span>
                  )}
                </div>

                <SkillsGlobeLazy
                  activeCategory={activeCategory}
                  activeSkillId={selectedSkill?.id ?? null}
                  onSelectSkill={(skill) => setSelectedSkill(skill)}
                />
              </div>

              {/* Helpful Hint under 3D globe */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
                <span>💡 Click any tag to inspect its technical details</span>
                <button
                  type="button"
                  onClick={() => setViewMode("globe")}
                  className="text-fuchsia-400 hover:text-fuchsia-300 underline font-mono text-[11px]"
                >
                  Expand 3D Universe ↗
                </button>
              </div>
            </div>

            {/* Right Column: Detailed Skill Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2">
                <span>
                  Showing <strong className="text-white">{filteredSkills.length}</strong> tools
                </span>
                <span className="font-mono text-[11px]">Hover cards for 3D tilt</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {filteredSkills.map((skill) => {
                  const isSelected = selectedSkill?.id === skill.id;
                  return (
                    <TiltCard key={skill.id} className="rounded-2xl" maxTiltAngle={8}>
                      <div
                        onClick={() => setSelectedSkill(skill)}
                        className={`glass rounded-2xl p-5 h-full cursor-pointer transition-all border group ${
                          isSelected
                            ? "border-fuchsia-500/80 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/10"
                            : "border-white/10 hover:border-white/25 hover:bg-white/5"
                        }`}
                      >
                        {/* Card Header: Icon + Name + Experience */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl grid place-items-center transition-transform group-hover:scale-110"
                              style={{
                                backgroundColor: skill.color + "18",
                                borderColor: skill.color + "30",
                                borderWidth: 1,
                              }}
                            >
                              <TechIcon
                                name={skill.icon}
                                className="w-5 h-5"
                                color={skill.color}
                              />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold text-sm group-hover:text-fuchsia-300 transition-colors">
                                {skill.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                                {skill.category}
                              </span>
                            </div>
                          </div>

                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md whitespace-nowrap"
                            style={{
                              backgroundColor: skill.color + "20",
                              color: skill.color,
                              border: `1px solid ${skill.color}40`,
                            }}
                          >
                            {skill.experience}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="mt-3 text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {skill.description}
                        </p>

                        {/* Tags */}
                        <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                          {skill.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </TiltCard>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW MODE 2: FULL TECH MATRIX (Responsive Multi-Column Grid)   */}
        {/* ============================================================== */}
        {viewMode === "matrix" && (
          <div className="mt-8 space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSkills.map((skill) => {
                const isSelected = selectedSkill?.id === skill.id;
                return (
                  <TiltCard key={skill.id} className="rounded-2xl" maxTiltAngle={8}>
                    <div
                      onClick={() => setSelectedSkill(skill)}
                      className={`glass rounded-2xl p-5 h-full cursor-pointer transition-all border group ${
                        isSelected
                          ? "border-fuchsia-500/80 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/10"
                          : "border-white/10 hover:border-white/25 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl grid place-items-center transition-transform group-hover:scale-110"
                            style={{
                              backgroundColor: skill.color + "18",
                              borderColor: skill.color + "30",
                              borderWidth: 1,
                            }}
                          >
                            <TechIcon
                              name={skill.icon}
                              className="w-5 h-5"
                              color={skill.color}
                            />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm group-hover:text-fuchsia-300 transition-colors">
                              {skill.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                              {skill.category}
                            </span>
                          </div>
                        </div>

                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md whitespace-nowrap"
                          style={{
                            backgroundColor: skill.color + "20",
                            color: skill.color,
                            border: `1px solid ${skill.color}40`,
                          }}
                        >
                          {skill.experience}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                        {skill.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                        {skill.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW MODE 3: FULL 3D ORBIT UNIVERSE                            */}
        {/* ============================================================== */}
        {viewMode === "globe" && (
          <div className="mt-8 space-y-4">
            <div className="relative h-[550px] md:h-[650px] rounded-3xl glass glow-border overflow-hidden">
              <div className="absolute top-4 left-5 z-10 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-pulse" />
                <span className="text-xs uppercase font-mono tracking-[0.25em] text-slate-200">
                  Full 3D Tech Universe · Drag in any direction
                </span>
              </div>

              <div className="absolute bottom-4 left-5 z-10 text-xs text-slate-400 font-mono pointer-events-none">
                Category: <strong className="text-white">{activeCategory}</strong> · Click any node to inspect
              </div>

              <SkillsGlobeLazy
                activeCategory={activeCategory}
                activeSkillId={selectedSkill?.id ?? null}
                onSelectSkill={(skill) => setSelectedSkill(skill)}
              />
            </div>
          </div>
        )}

        {/* Bottom Technical Competencies Matrix Summary */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              metric: "3+ Years",
              label: "Daily Production Code",
              desc: "Building SPAs, microservices, and client architectures",
              color: "text-fuchsia-400",
            },
            {
              metric: "Multi-Cloud",
              label: "AWS, Azure & Oracle",
              desc: "Enterprise compute, IAM security, and network uptime",
              color: "text-cyan-400",
            },
            {
              metric: "McDonald's IT",
              label: "IT Systems Engineer",
              desc: "Multi-branch infrastructure, security & compliance",
              color: "text-amber-400",
            },
            {
              metric: "Full Pipeline",
              label: "Frontend to Database",
              desc: "React, Node.js, Drizzle, PostgreSQL, Docker, CI/CD",
              color: "text-emerald-400",
            },
          ].map((item) => (
            <div key={item.label} className="glass rounded-2xl p-5 border border-white/5">
              <div className={`text-2xl font-black ${item.color}`}>{item.metric}</div>
              <div className="mt-1 text-sm font-semibold text-white">{item.label}</div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

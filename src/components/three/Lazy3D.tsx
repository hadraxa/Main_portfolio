"use client";

import dynamic from "next/dynamic";

/**
 * Lazy-loaded 3D components with ssr: false.
 * Prevents server-side hydration mismatches and optimizes initial page load speed.
 */
export const HeroSceneLazy = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

export const SkillsGlobeLazy = dynamic(() => import("./SkillsGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full grid place-items-center text-slate-500 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
        <span className="text-xs uppercase tracking-widest text-slate-400">Loading 3D globe…</span>
      </div>
    </div>
  ),
});

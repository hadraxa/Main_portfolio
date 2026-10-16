"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import MobileQuickDock from "@/components/MobileQuickDock";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);

      // Track active section for highlight
      const sections = ["about", "experience", "skills", "contact"];
      const current = sections.find((id) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top <= 200 && rect.bottom >= 200;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: "/#about", label: "About", id: "about", desc: "Background & Cloud Fluent" },
    { href: "/#experience", label: "Experience", id: "experience", desc: "McDonald's IT & The Sak" },
    { href: "/#skills", label: "Skills", id: "skills", desc: "Interactive 3D Arsenal" },
    { href: "/projects", label: "Projects", id: "projects", desc: "Code Repo & Mini GitHub" },
    { href: "/#contact", label: "Contact", id: "contact", desc: "Get In Touch Directly" },
  ];

  return (
    <>
      {/* =========================================================================
          HEADER — Edge-to-edge bar on phones (just like ahad-raza.surge.sh at
          max-width:600), gracefully becoming a floating frosted pill on
          tablets and desktop.
          ========================================================================= */}
      <header className="fixed top-0 inset-x-0 sm:top-3 sm:inset-x-4 md:inset-x-8 z-50 max-w-7xl sm:mx-auto transition-all duration-300">
        <div
          className={`flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 rounded-none sm:rounded-full transition-all duration-300 ${
            scrolled
              ? "bg-[#121624]/90 sm:bg-[#121624]/80 backdrop-blur-2xl border-b sm:border border-white/15 shadow-2xl shadow-black/50"
              : "bg-[#151a2d]/75 sm:bg-[#151a2d]/60 backdrop-blur-xl border-b sm:border border-white/10 shadow-lg shadow-black/30"
          }`}
          style={{
            WebkitBackdropFilter: "blur(24px) saturate(180%) brightness(1.15)",
          }}
        >
          {/* Logo & Brand badge */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Geometric Gold Diamond Emblem (from ahad-raza.surge.sh) */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 via-fuchsia-500 to-cyan-400 p-[1.5px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] grid place-items-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 transition-transform group-hover:rotate-45 duration-300"
                  fill="currentColor"
                >
                  <path d="M12 2L4 12l8 10 8-10z" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-sm sm:text-base tracking-tight font-mono">
                  {site.name}
                </span>
                <span className="hidden xs:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] font-mono font-medium tracking-[0.15em] text-amber-400/90 uppercase">
                &lt;{site.tagline}&gt;
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-xs uppercase font-mono tracking-wider px-3.5 py-2 rounded-full transition-all ${
                  activeSection === l.id
                    ? "bg-white/10 text-white font-semibold border border-white/15"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            ))}

          </nav>

          {/* Right Action Area (Desktop & Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick CV / Contact Button (inspired by ahad-raza.surge.sh header button) */}
            <a
              href="https://wa.me/923153980168"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-hidden inline-flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all shadow-sm shadow-emerald-500/20"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="hidden xs:inline font-mono text-[11px] sm:text-xs">WhatsApp</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="hidden sm:inline">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>

            {/* Mobile / Tablet Hamburger Toggle */}
            <button
              onClick={() => setOpen((prev) => !prev)}
              aria-label={open ? "Close menu" : "Open menu"}
              className={`lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center gap-1.5 transition-all shrink-0 ${
                open
                  ? "bg-white/20 text-white rotate-90 border border-white/30"
                  : "bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10"
              }`}
            >
              <span
                className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${
                  open ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`w-4 h-0.5 bg-current rounded-full transition-all duration-200 ${
                  open ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${
                  open ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          FULL-SCREEN LUXURY MOBILE & TABLET DRAWER OVERLAY
          ========================================================================= */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Deep frosted blur backdrop */}
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-[#05070f]/90 backdrop-blur-2xl transition-opacity duration-300"
        />

        {/* Ambient neon orbs inside menu */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-fuchsia-600/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/3 -right-20 w-72 h-72 bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Drawer content container */}
        <div
          className={`relative h-full flex flex-col justify-between pt-24 pb-8 px-6 sm:px-10 overflow-y-auto transition-transform duration-500 ease-out ${
            open ? "translate-y-0" : "-translate-y-6"
          }`}
        >
          {/* Top Info Tag */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-300">
                Menu &amp; Quick Channels
              </span>
            </div>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
              Full Stack Dev
            </span>
          </div>

          {/* Numbered Navigation Links */}
          <nav className="my-auto py-6 space-y-2">
            {links.map((link, idx) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between p-3.5 rounded-2xl border border-transparent hover:border-white/15 hover:bg-white/5 active:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-fuchsia-400 group-hover:text-cyan-300 transition-colors">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-white group-hover:text-fuchsia-200 transition-colors">
                      {link.label}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {link.desc}
                    </div>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/15 border border-white/10 grid place-items-center text-slate-400 group-hover:text-white transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}


          </nav>

          {/* Social Icons Bar (Bringing the exact buttons from ahad-raza.surge.sh sidebar!) */}
          <div className="border-t border-white/10 pt-5 space-y-4">
            <div className="text-xs uppercase font-mono tracking-widest text-slate-400">
              Direct Contact Channels
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {/* WhatsApp */}
              <a
                href={site.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all"
                title="WhatsApp"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 grid place-items-center group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.979-.276-.1-.476-.15-.676.15-.2.301-.776.979-.951 1.18-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.424-1.496-.895-.798-1.5-1.784-1.675-2.085-.175-.301-.019-.464.131-.614.136-.135.301-.351.451-.526.15-.175.2-.301.301-.501.101-.2.05-.376-.025-.526-.075-.15-.676-1.629-.926-2.23-.244-.585-.493-.506-.677-.515-.175-.008-.376-.01-.576-.01-.2 0-.526.075-.802.376-.276.301-1.052 1.028-1.052 2.508 0 1.48 1.077 2.909 1.228 3.109.15.2 2.119 3.235 5.132 4.538.717.31 1.277.495 1.713.633.72.228 1.376.196 1.895.118.578-.087 1.782-.728 2.032-1.43.25-.702.25-1.303.175-1.43-.075-.126-.275-.201-.576-.351zM12.04 2C6.51 2 2.02 6.49 2.02 12.02c0 1.98.58 3.82 1.58 5.37L2 22l4.76-1.55c1.5 1 3.29 1.57 5.28 1.57 5.53 0 10.02-4.49 10.02-10.02C22.06 6.49 17.57 2 12.04 2z" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono text-slate-300 mt-1.5">WhatsApp</span>
              </a>

              {/* LinkedIn */}
              <a
                href={site.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:border-sky-400/50 hover:bg-sky-500/10 transition-all"
                title="LinkedIn"
              >
                <div className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-400 grid place-items-center group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.8v8.37h-2.8v-8.37M7.86 6.5a1.63 1.63 0 0 0-1.63 1.62c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.62-1.63-1.62z" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono text-slate-300 mt-1.5">LinkedIn</span>
              </a>

              {/* GitHub */}
              <a
                href={site.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-purple-500/10 transition-all"
                title="GitHub"
              >
                <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 grid place-items-center group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono text-slate-300 mt-1.5">GitHub</span>
              </a>

              {/* Telegram */}
              <a
                href={site.socials.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all"
                title="Telegram"
              >
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 grid place-items-center group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono text-slate-300 mt-1.5">Telegram</span>
              </a>

              {/* Email */}
              <a
                href={`mailto:${site.email}`}
                className="group flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-amber-500/10 transition-all"
                title="Email"
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 grid place-items-center group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono text-slate-300 mt-1.5">Gmail</span>
              </a>
            </div>

            {/* Direct Contact Button */}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-500/20 active:scale-[0.98] transition-transform"
            >
              <span>Get In Touch / Hire Me</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Floating Quick Action Speed-Dial Dock on Mobile & Tablet */}
      <MobileQuickDock />
    </>
  );
}

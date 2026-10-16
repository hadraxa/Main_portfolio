"use client";

import { useCallback, useEffect, useState } from "react";
import { site } from "@/lib/site";

/**
 * =========================================================================
 * FLOATING SOCIAL DOCK
 * -------------------------------------------------------------------------
 * Bottom-anchored FAB (Floating Action Button) that opens a beautifully
 * animated stack of social channels. Works on ALL devices — phones,
 * tablets, and desktop.
 *
 * Features
 *  - Rotating conic-gradient glow around the button (like a spinning halo)
 *  - Two staggered pulse rings that ripple outward while idle
 *  - Chips pop in one-by-one with a springy bounce (stagger delay)
 *  - Dimmed blurred backdrop while open (tap outside to close)
 *  - Rotating morphing icon (plus → cross) on the button itself
 * =========================================================================
 */

type Channel = {
  label: string;
  href: string;
  color: string;
  icon: React.ReactNode;
};

const CHANNELS: Channel[] = [
  {
    label: "WhatsApp",
    href: site.socials.whatsapp,
    color: "#22c55e",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.979-.276-.1-.476-.15-.676.15-.2.301-.776.979-.951 1.18-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.424-1.496-.895-.798-1.5-1.784-1.675-2.085-.175-.301-.019-.464.131-.614.136-.135.301-.351.451-.526.15-.175.2-.301.301-.501.101-.2.05-.376-.025-.526-.075-.15-.676-1.629-.926-2.23-.244-.585-.493-.506-.677-.515-.175-.008-.376-.01-.576-.01-.2 0-.526.075-.802.376-.276.301-1.052 1.028-1.052 2.508 0 1.48 1.077 2.909 1.228 3.109.15.2 2.119 3.235 5.132 4.538.717.31 1.277.495 1.713.633.72.228 1.376.196 1.895.118.578-.087 1.782-.728 2.032-1.43.25-.702.25-1.303.175-1.43-.075-.126-.275-.201-.576-.351zM12.04 2C6.51 2 2.02 6.49 2.02 12.02c0 1.98.58 3.82 1.58 5.37L2 22l4.76-1.55c1.5 1 3.29 1.57 5.28 1.57 5.53 0 10.02-4.49 10.02-10.02C22.06 6.49 17.57 2 12.04 2z" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: site.socials.telegram,
    color: "#06b6d4",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: site.socials.linkedin,
    color: "#0ea5e9",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.8v8.37h-2.8v-8.37M7.86 6.5a1.63 1.63 0 0 0-1.63 1.62c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.62-1.63-1.62z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: site.socials.github,
    color: "#c084fc",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: site.socials.instagram,
    color: "#ec4899",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.21.6 1.76 1.15.5.5.9 1.1 1.15 1.76.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.76 4.9 4.9 0 0 1-1.76 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.76-1.15 4.9 4.9 0 0 1-1.15-1.76c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.21 1.15-1.76A4.9 4.9 0 0 1 5.44.54C6.08.29 6.81.12 7.87.07 8.93.02 9.27 0 12 0zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.25a3.25 3.25 0 1 1 0-6.5 3.25 3.25 0 0 1 0 6.5zM17.5 4.6a1.17 1.17 0 1 0 0 2.34 1.17 1.17 0 0 0 0-2.34z" />
      </svg>
    ),
  },
  {
    label: "Gmail",
    href: `mailto:${site.email}`,
    color: "#fbbf24",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
];

export default function MobileQuickDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const close = useCallback(() => {
    if (!isOpen) return;
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
    }, 240);
  }, [isOpen]);

  // Close with ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, isOpen]);

  const toggle = () => {
    if (isOpen) close();
    else setIsOpen(true);
  };

  const showChips = isOpen || closing;

  return (
    <>
      {/* ================================================================
          DIMMED BLURRED BACKDROP — tap anywhere outside to close
          ================================================================ */}
      {showChips && (
        <div
          onClick={close}
          className={`fixed inset-0 z-30 bg-black/50 ${
            closing ? "" : "dock-backdrop-in"
          }`}
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          aria-hidden
        />
      )}

      {/* ================================================================
          BOTTOM-RIGHT ANCHORED FLOATING DOCK — works on all screen sizes
          ================================================================ */}
      <div className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 flex flex-col items-end gap-3 select-none">
        {/* -------- Expanded social chip stack -------- */}
        {showChips && (
          <div className="flex flex-col items-end gap-2.5 mb-1">
            {CHANNELS.map((ch, idx) => {
              // Stagger delay — first chip animates in first, from bottom up
              const staggerDelay = closing
                ? (CHANNELS.length - 1 - idx) * 35
                : idx * 55;

              return (
                <a
                  key={ch.label}
                  href={ch.href}
                  target={ch.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  onClick={close}
                  className={`group flex items-center gap-2.5 ${
                    closing ? "chip-pop-out" : "chip-pop-in"
                  }`}
                  style={{
                    animationDelay: `${staggerDelay}ms`,
                  }}
                >
                  {/* Label pill */}
                  <span
                    className="text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full bg-[#0b0f19]/95 text-white border shadow-lg backdrop-blur"
                    style={{
                      borderColor: `${ch.color}55`,
                      boxShadow: `0 8px 20px rgba(0,0,0,0.35), 0 0 12px ${ch.color}33`,
                    }}
                  >
                    {ch.label}
                  </span>

                  {/* Icon button */}
                  <span
                    className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 group-hover:scale-110 group-active:scale-95 group-hover:-rotate-6"
                    style={{
                      backgroundColor: ch.color,
                      color: "#ffffff",
                      boxShadow: `0 8px 22px ${ch.color}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
                    }}
                  >
                    {ch.icon}
                    {/* Subtle glossy highlight */}
                    <span
                      className="pointer-events-none absolute inset-0 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45), transparent 55%)",
                      }}
                    />
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {/* -------- Primary FAB (bottom trigger) -------- */}
        <button
          type="button"
          onClick={toggle}
          aria-label={isOpen ? "Close contact dock" : "Open contact dock"}
          aria-expanded={isOpen}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white transition-transform duration-500 active:scale-90 ${
            isOpen ? "rotate-[135deg]" : "rotate-0"
          }`}
          style={{
            boxShadow:
              "0 12px 32px rgba(168, 85, 247, 0.45), 0 0 0 1px rgba(255,255,255,0.10) inset",
          }}
        >
          {/* Rotating conic gradient halo behind the button */}
          <span
            aria-hidden
            className="fab-orbit-glow absolute -inset-1.5 rounded-full opacity-90 blur-[2px]"
            style={{
              background:
                "conic-gradient(from 0deg, #a855f7, #22d3ee, #ec4899, #fbbf24, #22c55e, #a855f7)",
            }}
          />

          {/* Solid inner circle */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, #2b2f45 0%, #0b0f19 70%)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          />

          {/* Idle pulse rings — only when closed */}
          {!isOpen && (
            <>
              <span
                aria-hidden
                className="fab-pulse-ring absolute inset-0 rounded-full"
                style={{
                  background: "rgba(168, 85, 247, 0.35)",
                }}
              />
              <span
                aria-hidden
                className="fab-pulse-ring-delay absolute inset-0 rounded-full"
                style={{
                  background: "rgba(34, 211, 238, 0.28)",
                }}
              />
            </>
          )}

          {/* Icon — plus that morphs into a cross via rotation of the whole button */}
          <span className="relative flex items-center justify-center w-full h-full">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {/* Live status dot when idle */}
            {!isOpen && (
              <span
                aria-hidden
                className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0b0f19] animate-pulse"
              />
            )}
          </span>
        </button>

        {/* Tiny helper hint text under the button, only when idle */}
        {!isOpen && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400/80 pr-1 hidden sm:block">
            Let&apos;s connect
          </span>
        )}
      </div>
    </>
  );
}

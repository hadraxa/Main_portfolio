import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-black/20">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-cyan-400 grid place-items-center text-white font-black">
              A
            </div>
            <div className="text-white font-semibold">{site.name}</div>
          </div>
          <p className="text-sm text-slate-400 mt-2 max-w-md">
            Building thoughtful, performant, secure web products from Karachi to the cloud.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <a href={`mailto:${site.email}`} className="hover:text-white">
            {site.email}
          </a>
          <span className="hidden md:inline">•</span>
          <a href={site.socials.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">
            WhatsApp
          </a>
          <span className="hidden md:inline">•</span>
          <a href={site.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400">
            LinkedIn
          </a>
          <span className="hidden md:inline">•</span>
          <a href={site.socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">
            GitHub
          </a>
          <span className="hidden md:inline">•</span>
          <Link href="/projects" className="hover:text-white">
            Projects
          </Link>

        </div>
      </div>
      <div className="text-center text-xs text-slate-500 pb-6">
        © {new Date().getFullYear()} {site.name}. Crafted with Next.js.
      </div>
    </footer>
  );
}

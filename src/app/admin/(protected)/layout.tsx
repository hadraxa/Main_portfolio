import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { clearAdminCookie, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function logoutAction() {
  "use server";
  await clearAdminCookie();
  redirect("/admin/login");
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const ok = await isAdmin();
  if (!ok) redirect("/admin/login");

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 border-r border-white/5 bg-black/30 backdrop-blur sticky top-0 h-screen p-4 hidden md:flex flex-col">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-cyan-400 grid place-items-center text-white font-black">
            A
          </div>
          <span className="text-white font-semibold">Ahad CMS</span>
        </Link>
        <nav className="mt-8 flex-1 space-y-1 text-sm">
          <NavLink href="/admin" label="Dashboard" icon="🏠" />
          <NavLink href="/admin/projects/new" label="New project" icon="✨" />
          <Link
            href="/"
            className="mt-6 block text-xs text-slate-500 hover:text-white"
          >
            ← View site
          </Link>
        </nav>
        <form action={logoutAction}>
          <button className="w-full mt-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm py-2">
            Log out
          </button>
        </form>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden sticky top-0 z-40 bg-black/60 backdrop-blur border-b border-white/5 p-3 flex items-center justify-between">
          <Link href="/admin" className="text-white font-semibold">
            Ahad CMS
          </Link>
          <form action={logoutAction}>
            <button className="text-xs text-slate-300 border border-white/10 rounded px-2 py-1">
              Log out
            </button>
          </form>
        </div>
        {children}
      </main>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { checkPassword, isAdmin, setAdminCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function loginAction(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    redirect("/admin/login?error=1");
  }
  await setAdminCookie();
  redirect("/admin");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const already = await isAdmin();
  if (already) redirect("/admin");
  const sp = await searchParams;
  const err = sp.error === "1";

  return (
    <main className="min-h-screen grid place-items-center px-5">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          ← Back to site
        </Link>
        <div className="mt-6 glass glow-border rounded-2xl p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 grid place-items-center text-white font-black">
              A
            </div>
            <div>
              <div className="text-white font-semibold">Admin access</div>
              <div className="text-xs text-slate-400">Private CMS for Ahad</div>
            </div>
          </div>
          <form action={loginAction} className="mt-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-400">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                autoFocus
                className="mt-2 w-full rounded-lg bg-black/30 border border-white/10 px-4 py-3 text-white outline-none focus:border-fuchsia-500/60"
                placeholder="••••••••"
              />
            </div>
            {err && (
              <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                Incorrect password. Try again.
              </div>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-white text-black font-semibold py-3 hover:bg-slate-200"
            >
              Enter dashboard
            </button>
          </form>
          <p className="mt-4 text-xs text-slate-500">
            Authorized owner access only. Your password is never displayed on this website.
          </p>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { projects, projectFiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAllProjects } from "@/lib/projects";
import { isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import ConfirmForm from "@/components/admin/ConfirmForm";

export const dynamic = "force-dynamic";

async function deleteProjectAction(formData: FormData) {
  "use server";
  if (!(await isAdmin())) redirect("/admin/login");
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/admin");
  revalidatePath("/projects");
  revalidatePath("/");
}

async function toggleFeaturedAction(formData: FormData) {
  "use server";
  if (!(await isAdmin())) redirect("/admin/login");
  const id = Number(formData.get("id"));
  const value = formData.get("value") === "true";
  if (!Number.isInteger(id) || id <= 0) return;
  await db.update(projects).set({ featured: !value, updatedAt: new Date() }).where(eq(projects.id, id));
  revalidatePath("/admin");
  revalidatePath("/projects");
  revalidatePath("/");
}

export default async function AdminDashboardPage() {
  const items = await getAllProjects();
  const fileCounts = await db
    .select({ projectId: projectFiles.projectId })
    .from(projectFiles);
  const counts = new Map<number, number>();
  for (const row of fileCounts) {
    counts.set(row.projectId, (counts.get(row.projectId) ?? 0) + 1);
  }

  const featuredCount = items.filter((p) => p.featured).length;
  const totalFiles = fileCounts.length;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Welcome back
          </div>
          <h1 className="mt-1 text-3xl md:text-4xl font-black text-white">
            Your projects
          </h1>
          <p className="mt-2 text-slate-400">
            Add, edit and organize projects that show up on your public portfolio.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-xl bg-white text-black px-4 py-2.5 font-semibold hover:bg-slate-200 inline-flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New project
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Projects" value={items.length} />
        <Stat label="Featured" value={featuredCount} />
        <Stat label="Total files" value={totalFiles} />
        <Stat label="Live URL" value="/" isLink />
      </div>

      <div className="mt-10 glass rounded-2xl overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <div className="text-4xl mb-2">🗂️</div>
            <div className="mb-3">No projects yet.</div>
            <Link
              href="/admin/projects/new"
              className="inline-block rounded-lg bg-white text-black px-4 py-2 text-sm font-semibold"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-slate-500 border-b border-white/5">
              <tr>
                <th className="p-4">Project</th>
                <th className="p-4 hidden md:table-cell">Tags</th>
                <th className="p-4 hidden md:table-cell">Files</th>
                <th className="p-4 hidden md:table-cell">Updated</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.coverGradient} grid place-items-center text-lg`}>
                        {p.coverEmoji}
                      </div>
                      <div>
                        <Link
                          href={`/admin/projects/${p.id}`}
                          className="text-white font-semibold hover:underline"
                        >
                          {p.title}
                        </Link>
                        <div className="text-xs text-slate-400 truncate max-w-xs">
                          /{p.slug}
                        </div>
                      </div>
                      {p.featured && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-slate-400 text-xs">
                    {p.tags || "—"}
                  </td>
                  <td className="p-4 hidden md:table-cell text-slate-300">
                    {counts.get(p.id) ?? 0}
                  </td>
                  <td className="p-4 hidden md:table-cell text-slate-400 text-xs">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <form action={toggleFeaturedAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="value" value={String(p.featured)} />
                        <button className="text-xs px-2 py-1 rounded-md border border-white/10 hover:bg-white/10 text-slate-200">
                          {p.featured ? "Unfeature" : "Feature"}
                        </button>
                      </form>
                      <Link
                        href={`/projects/${p.slug}`}
                        className="text-xs px-2 py-1 rounded-md border border-white/10 hover:bg-white/10 text-slate-200"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white"
                      >
                        Edit
                      </Link>
                      <ConfirmForm
                        action={deleteProjectAction}
                        message="Delete this project and all its files?"
                      >
                        <input type="hidden" name="id" value={p.id} />
                        <button className="text-xs px-2 py-1 rounded-md border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300">
                          Delete
                        </button>
                      </ConfirmForm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  isLink,
}: {
  label: string;
  value: string | number;
  isLink?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs uppercase tracking-widest text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-white">
        {isLink ? (
          <Link href="/" className="text-fuchsia-300 hover:underline">
            {value}
          </Link>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

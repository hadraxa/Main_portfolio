import { NextResponse } from "next/server";
import slugify from "slugify";
import { db } from "@/db";
import { projects, projectFiles } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type IncomingFile = {
  path: string;
  language: string;
  content: string;
  sortOrder?: number;
};

type IncomingBody = {
  slug?: string;
  title?: string;
  tagline?: string;
  description?: string;
  coverEmoji?: string;
  coverGradient?: string;
  tags?: string;
  repoUrl?: string;
  demoUrl?: string;
  readme?: string;
  featured?: boolean;
  sortOrder?: number;
  files?: IncomingFile[];
};

async function ensureUniqueSlug(base: string, excludeId: number): Promise<string> {
  let s = base || "project";
  let i = 1;
  while (true) {
    const rows = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.slug, s), ne(projects.id, excludeId)))
      .limit(1);
    if (rows.length === 0) return s;
    i += 1;
    s = `${base}-${i}`;
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const body: IncomingBody = await req.json().catch(() => ({}));
  const title = (body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const baseSlug = slugify(body.slug || title, { lower: true, strict: true }) || "project";
  const slug = await ensureUniqueSlug(baseSlug, id);

  await db
    .update(projects)
    .set({
      slug,
      title,
      tagline: (body.tagline ?? "").trim(),
      description: body.description ?? "",
      coverEmoji: body.coverEmoji || "🚀",
      coverGradient: body.coverGradient || "from-fuchsia-500 via-purple-600 to-indigo-600",
      tags: body.tags ?? "",
      repoUrl: body.repoUrl ?? "",
      demoUrl: body.demoUrl ?? "",
      readme: body.readme ?? "",
      featured: !!body.featured,
      sortOrder: Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 0,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));

  // Replace files: simplest & robust — delete then insert
  await db.delete(projectFiles).where(eq(projectFiles.projectId, id));
  if (Array.isArray(body.files) && body.files.length > 0) {
    await db.insert(projectFiles).values(
      body.files.map((f, i) => ({
        projectId: id,
        path: (f.path || "untitled.txt").slice(0, 400),
        language: f.language || "plaintext",
        content: f.content ?? "",
        sortOrder: Number.isFinite(f.sortOrder) ? Number(f.sortOrder) : i,
      }))
    );
  }

  revalidatePath("/admin");
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
  revalidatePath("/");

  return NextResponse.json({ id, slug });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await db.delete(projectFiles).where(eq(projectFiles.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));

  revalidatePath("/admin");
  revalidatePath("/projects");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}

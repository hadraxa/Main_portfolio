import { db } from "@/db";
import { projects, projectFiles, type Project, type ProjectFile } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";

export async function getAllProjects(): Promise<Project[]> {
  return db
    .select()
    .from(projects)
    .orderBy(desc(projects.featured), asc(projects.sortOrder), desc(projects.createdAt));
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return db
    .select()
    .from(projects)
    .where(eq(projects.featured, true))
    .orderBy(asc(projects.sortOrder), desc(projects.createdAt));
}

export async function getProjectBySlug(
  slug: string
): Promise<{ project: Project; files: ProjectFile[] } | null> {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);
  if (rows.length === 0) return null;
  const project = rows[0];
  const files = await db
    .select()
    .from(projectFiles)
    .where(eq(projectFiles.projectId, project.id))
    .orderBy(asc(projectFiles.sortOrder), asc(projectFiles.path));
  return { project, files };
}

export async function getProjectById(
  id: number
): Promise<{ project: Project; files: ProjectFile[] } | null> {
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (rows.length === 0) return null;
  const project = rows[0];
  const files = await db
    .select()
    .from(projectFiles)
    .where(eq(projectFiles.projectId, project.id))
    .orderBy(asc(projectFiles.sortOrder), asc(projectFiles.path));
  return { project, files };
}

export function parseTags(tagsCsv: string): string[] {
  return tagsCsv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    tagline: varchar("tagline", { length: 260 }).notNull(),
    description: text("description").notNull().default(""),
    coverEmoji: varchar("cover_emoji", { length: 10 }).notNull().default("🚀"),
    coverGradient: varchar("cover_gradient", { length: 60 })
      .notNull()
      .default("from-fuchsia-500 via-purple-600 to-indigo-600"),
    tags: text("tags").notNull().default(""), // comma separated
    repoUrl: text("repo_url").notNull().default(""),
    demoUrl: text("demo_url").notNull().default(""),
    readme: text("readme").notNull().default(""),
    featured: boolean("featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("projects_slug_idx").on(t.slug),
    featuredIdx: index("projects_featured_idx").on(t.featured),
  })
);

export const projectFiles = pgTable(
  "project_files",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    path: varchar("path", { length: 400 }).notNull(),
    language: varchar("language", { length: 40 }).notNull().default("plaintext"),
    content: text("content").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    projectIdx: index("project_files_project_id_idx").on(t.projectId),
  })
);

export const projectsRelations = relations(projects, ({ many }) => ({
  files: many(projectFiles),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, {
    fields: [projectFiles.projectId],
    references: [projects.id],
  }),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type NewProjectFile = typeof projectFiles.$inferInsert;

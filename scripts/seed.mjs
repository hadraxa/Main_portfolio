// Seed a few starter projects for Ahad's portfolio.
// Run with: node scripts/seed.mjs
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function upsertProject(p) {
  const existing = await pool.query("SELECT id FROM projects WHERE slug = $1", [p.slug]);
  let id;
  if (existing.rows.length > 0) {
    id = existing.rows[0].id;
    await pool.query(
      `UPDATE projects
         SET title=$2, tagline=$3, description=$4, cover_emoji=$5, cover_gradient=$6,
             tags=$7, repo_url=$8, demo_url=$9, readme=$10, featured=$11, sort_order=$12, updated_at=NOW()
       WHERE id=$1`,
      [id, p.title, p.tagline, p.description, p.coverEmoji, p.coverGradient,
       p.tags, p.repoUrl, p.demoUrl, p.readme, p.featured, p.sortOrder]
    );
    await pool.query("DELETE FROM project_files WHERE project_id=$1", [id]);
  } else {
    const r = await pool.query(
      `INSERT INTO projects
         (slug, title, tagline, description, cover_emoji, cover_gradient,
          tags, repo_url, demo_url, readme, featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [p.slug, p.title, p.tagline, p.description, p.coverEmoji, p.coverGradient,
       p.tags, p.repoUrl, p.demoUrl, p.readme, p.featured, p.sortOrder]
    );
    id = r.rows[0].id;
  }
  for (let i = 0; i < p.files.length; i++) {
    const f = p.files[i];
    await pool.query(
      `INSERT INTO project_files (project_id, path, language, content, sort_order)
       VALUES ($1,$2,$3,$4,$5)`,
      [id, f.path, f.language, f.content, i]
    );
  }
  console.log(`✓ ${p.slug} (${p.files.length} files)`);
}

const projects = [
  {
    slug: "portfolio-cms",
    title: "Personal Portfolio + CMS",
    tagline: "This very site — a Next.js portfolio with its own mini-CMS and github-style code browser.",
    description:
      "A full-stack Next.js 16 app I built to showcase my work AND own the content pipeline. It has a public portfolio with a 3D animated hero, a private admin panel for me to add/edit projects, and a github-style file browser so visitors can actually read the code behind each project — no external repo required.",
    coverEmoji: "🚀",
    coverGradient: "from-fuchsia-500 via-purple-600 to-indigo-600",
    tags: "Next.js, TypeScript, Tailwind, PostgreSQL, Drizzle",
    repoUrl: "",
    demoUrl: "https://ahad-raza.surge.sh",
    readme:
      "# Portfolio + CMS\n\n- Next.js 16 App Router + Server Actions\n- PostgreSQL via Drizzle ORM\n- Cookie-based admin auth (HMAC signed)\n- Live file browser with syntax highlighting\n- Custom canvas-based 3D hero (no heavy 3D dep)",
    featured: true,
    sortOrder: 0,
    files: [
      {
        path: "src/lib/auth.ts",
        language: "typescript",
        content: `import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "ahad_admin";

function sign(payload: string): string {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
    .update(payload).digest("hex");
}

export function createSessionToken(): string {
  const payload = \`admin.\${Date.now()}\`;
  return \`\${payload}.\${sign(payload)}\`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token) return false;
  const [role, ts, sig] = token.split(".");
  if (role !== "admin") return false;
  const expected = sign(\`\${role}.\${ts}\`);
  return timingSafeEqual(
    Buffer.from(sig, "hex"),
    Buffer.from(expected, "hex")
  );
}
`,
      },
      {
        path: "src/components/Hero3D.tsx",
        language: "tsx",
        content: `"use client";
import { useEffect, useRef } from "react";

export default function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    // Build a torus of points and rotate it every frame,
    // projecting into 2D with a simple perspective divide.
    // Painter's algorithm handles depth sorting.
    // ... (see full source in repo)
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
`,
      },
      {
        path: "src/db/schema.ts",
        language: "typescript",
        content: `import { pgTable, serial, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  tagline: varchar("tagline", { length: 260 }).notNull(),
  description: text("description").notNull().default(""),
  coverEmoji: varchar("cover_emoji", { length: 10 }).notNull().default("🚀"),
  coverGradient: varchar("cover_gradient", { length: 60 }).notNull(),
  tags: text("tags").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projectFiles = pgTable("project_files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  path: varchar("path", { length: 400 }).notNull(),
  language: varchar("language", { length: 40 }).notNull(),
  content: text("content").notNull().default(""),
});
`,
      },
      {
        path: "README.md",
        language: "markdown",
        content: `# ahad-raza.dev

My personal portfolio + private CMS.

## Stack
- Next.js 16 (App Router, Server Actions)
- TypeScript
- Tailwind CSS
- PostgreSQL + Drizzle ORM
- Highlight.js (server-side code highlighting)

## Local dev

\`\`\`bash
pnpm i
cp .env.example .env
pnpm drizzle-kit push
pnpm dev
\`\`\`

Visit \`/admin\` and log in with the password from \`ADMIN_PASSWORD\`.
`,
      },
    ],
  },
  {
    slug: "mcd-uptime-monitor",
    title: "Branch Uptime Monitor",
    tagline: "A lightweight Node.js service that pings restaurant branch systems every minute and alerts on downtime.",
    description:
      "Built during my role at McDonald's IT to reduce time-to-detection for POS and network outages across branches. Runs on a small Azure VM, stores results in Postgres, and pings a Teams webhook on failure. Cut average incident detection time from ~14 minutes to under 90 seconds.",
    coverEmoji: "📡",
    coverGradient: "from-cyan-400 via-sky-500 to-blue-600",
    tags: "Node.js, Express, Azure, PostgreSQL, DevOps",
    repoUrl: "",
    demoUrl: "",
    readme: "Node.js uptime pinger with per-branch status board and Teams alerts.",
    featured: true,
    sortOrder: 1,
    files: [
      {
        path: "src/monitor.js",
        language: "javascript",
        content: `import fetch from "node-fetch";
import { pool } from "./db.js";
import { notifyTeams } from "./teams.js";

const TIMEOUT_MS = 5000;

async function pingBranch(branch) {
  const started = Date.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(branch.healthUrl, { signal: ctrl.signal });
    clearTimeout(t);
    return { ok: res.ok, latencyMs: Date.now() - started, status: res.status };
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - started, error: err.message };
  }
}

export async function runOnce() {
  const branches = (await pool.query("SELECT * FROM branches WHERE enabled = true")).rows;
  const results = await Promise.all(branches.map(pingBranch));
  for (let i = 0; i < branches.length; i++) {
    const b = branches[i];
    const r = results[i];
    await pool.query(
      "INSERT INTO pings (branch_id, ok, latency_ms, status) VALUES ($1,$2,$3,$4)",
      [b.id, r.ok, r.latencyMs, r.status ?? null]
    );
    if (!r.ok) await notifyTeams(b, r);
  }
}
`,
      },
      {
        path: "src/teams.js",
        language: "javascript",
        content: `import fetch from "node-fetch";

export async function notifyTeams(branch, result) {
  await fetch(process.env.TEAMS_WEBHOOK, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      "@type": "MessageCard",
      themeColor: "E81123",
      title: \`🚨 Branch \${branch.name} unreachable\`,
      text: \`Latency: \${result.latencyMs}ms\\nError: \${result.error ?? "HTTP " + result.status}\`,
    }),
  });
}
`,
      },
      {
        path: "cron.js",
        language: "javascript",
        content: `import { runOnce } from "./src/monitor.js";
setInterval(() => runOnce().catch(console.error), 60_000);
runOnce();
console.log("Monitor started");
`,
      },
    ],
  },
  {
    slug: "seo-optimizer-cli",
    title: "SEO Optimizer CLI",
    tagline: "A CLI that crawls a site, scores each page and outputs actionable SEO fixes.",
    description:
      "I built this to speed up my client audit workflow during my Full-Stack Dev internship at The Sak. Given a base URL, it crawls the site with respect for robots.txt, extracts meta/OG/schema, checks Lighthouse scores via headless Chrome, and prints a prioritized report to the terminal (with an optional HTML export).",
    coverEmoji: "🔎",
    coverGradient: "from-emerald-400 via-teal-500 to-cyan-600",
    tags: "Node.js, Puppeteer, SEO, CLI",
    repoUrl: "",
    demoUrl: "",
    readme:
      "# seo-optimizer\n\n```bash\nnpx seo-optimizer https://example.com --depth 2 --out report.html\n```",
    featured: true,
    sortOrder: 2,
    files: [
      {
        path: "bin/cli.js",
        language: "javascript",
        content: `#!/usr/bin/env node
import { audit } from "../src/audit.js";

const [,, url, ...rest] = process.argv;
if (!url) {
  console.error("Usage: seo-optimizer <url> [--depth N] [--out file]");
  process.exit(1);
}
const opts = { depth: 1, out: null };
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === "--depth") opts.depth = Number(rest[++i]);
  if (rest[i] === "--out") opts.out = rest[++i];
}

audit(url, opts).catch((e) => {
  console.error(e);
  process.exit(1);
});
`,
      },
      {
        path: "src/audit.js",
        language: "javascript",
        content: `import puppeteer from "puppeteer";
import { scorePage } from "./score.js";
import { render } from "./report.js";
import fs from "node:fs";

export async function audit(baseUrl, { depth, out }) {
  const browser = await puppeteer.launch({ headless: "new" });
  const visited = new Set();
  const queue = [{ url: baseUrl, d: 0 }];
  const results = [];

  while (queue.length) {
    const { url, d } = queue.shift();
    if (visited.has(url) || d > depth) continue;
    visited.add(url);
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    const info = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      h1: [...document.querySelectorAll("h1")].map(h => h.textContent?.trim()),
      links: [...document.querySelectorAll("a[href]")].map(a => a.href),
    }));
    const score = scorePage(info);
    results.push({ url, score, info });
    await page.close();
    if (d < depth) {
      for (const l of info.links) {
        if (l.startsWith(baseUrl)) queue.push({ url: l, d: d + 1 });
      }
    }
  }
  await browser.close();
  if (out) fs.writeFileSync(out, render(results));
  console.table(results.map(r => ({ url: r.url, score: r.score })));
}
`,
      },
      {
        path: "src/score.js",
        language: "javascript",
        content: `export function scorePage({ title, description, h1 }) {
  let s = 100;
  if (!title || title.length < 10 || title.length > 60) s -= 15;
  if (!description || description.length < 50 || description.length > 160) s -= 15;
  if (h1.length !== 1) s -= 10;
  return Math.max(0, s);
}
`,
      },
    ],
  },
  {
    slug: "laravel-inventory-api",
    title: "Inventory REST API (Laravel)",
    tagline: "Multi-tenant inventory service with JWT auth, role-based access and MySQL replication support.",
    description:
      "A production-grade Laravel REST API I built for a client's warehouse management system. Handles multi-tenant data isolation, JWT auth, granular RBAC, bulk CSV imports, and read-replica routing for reporting queries.",
    coverEmoji: "📦",
    coverGradient: "from-amber-400 via-orange-500 to-red-600",
    tags: "PHP, Laravel, MySQL, REST, JWT",
    repoUrl: "",
    demoUrl: "",
    readme: "Laravel 10 REST API for inventory management.",
    featured: false,
    sortOrder: 3,
    files: [
      {
        path: "app/Http/Controllers/Api/ItemController.php",
        language: "php",
        content: `<?php
namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Item;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\JsonResponse;

class ItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Item::query()->forTenant($request->user()->tenant_id);
        if ($search = $request->query('search')) {
            $q->where('sku', 'like', "%$search%")
              ->orWhere('name', 'like', "%$search%");
        }
        return response()->json($q->paginate(50));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sku'   => 'required|string|max:64',
            'name'  => 'required|string|max:200',
            'stock' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
        ]);
        $data['tenant_id'] = $request->user()->tenant_id;
        return response()->json(Item::create($data), 201);
    }
}
`,
      },
      {
        path: "routes/api.php",
        language: "php",
        content: `<?php
use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\Api\\ItemController;
use App\\Http\\Controllers\\Api\\AuthController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:api'])->group(function () {
    Route::apiResource('items', ItemController::class);
    Route::post('items/import', [ItemController::class, 'import']);
});
`,
      },
      {
        path: "app/Models/Item.php",
        language: "php",
        content: `<?php
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Builder;

class Item extends Model
{
    protected $fillable = ['tenant_id', 'sku', 'name', 'stock', 'price'];

    public function scopeForTenant(Builder $q, int $tenantId): Builder
    {
        return $q->where('tenant_id', $tenantId);
    }
}
`,
      },
    ],
  },
];

for (const p of projects) {
  await upsertProject(p);
}

console.log("Done.");
await pool.end();

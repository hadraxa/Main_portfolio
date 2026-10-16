// Hosted Docker startup (Render): migrate first, then start Next.js.
// Local Compose keeps using its separate migration service and server.js.
import { access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";

const serverPath = fileURLToPath(new URL("../server.js", import.meta.url));
const migrationsPath = fileURLToPath(new URL("../drizzle", import.meta.url));

function validateEnvironment() {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL in the hosting dashboard.");

  for (const key of ["DATABASE_URL", "MIGRATION_DATABASE_URL"]) {
    if (!process.env[key]) continue;
    const url = new URL(process.env[key]);
    if (!["postgres:", "postgresql:"].includes(url.protocol)) {
      throw new Error(`${key} must be a PostgreSQL connection URL.`);
    }
  }

  // Session-level migration locks require a direct connection, not a
  // transaction-mode PgBouncer connection. The app may still use a pooler.
  const migrationUrl = new URL(process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL);
  if (migrationUrl.hostname.endsWith(".neon.tech") && migrationUrl.hostname.includes("-pooler")) {
    throw new Error("Use a direct Neon URL for DATABASE_URL, or set a direct MIGRATION_DATABASE_URL separately.");
  }
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 16) {
    throw new Error("Set ADMIN_PASSWORD to a unique value of at least 16 characters.");
  }
  if (!process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32) {
    throw new Error("Set ADMIN_SESSION_SECRET to a random value of at least 32 characters.");
  }
  if (process.env.ADMIN_COOKIE_SECURE === "false") {
    throw new Error("Hosted admin login requires secure cookies. Set ADMIN_COOKIE_SECURE=true.");
  }
}

async function applyMigrations() {
  const transientErrors = new Set([
    "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "EAI_AGAIN", "57P01", "57P03",
  ]);

  for (let attempt = 1; attempt <= 3; attempt++) {
    const client = new pg.Client({
      connectionString: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL,
      connectionTimeoutMillis: 15000,
      statement_timeout: 120000,
      application_name: "ahad-portfolio-migrations",
    });
    // A connection that is lost while idle must not cause an unhandled error.
    client.on("error", () => {});
    try {
      await client.connect();
      const db = drizzle(client);
      // Serialize overlapping deployment migrations on this direct connection.
      await db.execute(sql`select pg_advisory_lock(74602026)`);
      try {
        await migrate(db, { migrationsFolder: migrationsPath });
      } finally {
        await db.execute(sql`select pg_advisory_unlock(74602026)`);
      }
      console.log("[deploy] Database migrations are up to date.");
      return;
    } catch (error) {
      const code = error.code ?? error.cause?.code;
      if (attempt === 3 || !transientErrors.has(code)) throw error;
      console.warn(`[deploy] Database connection unavailable; retry ${attempt}/3.`);
      await delay(attempt * 1500);
    } finally {
      await client.end().catch(() => {});
    }
  }
}

function startServer() {
  const child = spawn(process.execPath, [serverPath], {
    stdio: "inherit",
    env: process.env,
  });

  // Forward hosting-provider shutdown signals so Next.js can shut down cleanly.
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.once(signal, () => child.kill(signal));
  }
  child.once("error", () => {
    console.error("[deploy] Failed to start the Next.js server.");
    process.exitCode = 1;
  });
  child.once("exit", (code, signal) => {
    process.exitCode = code ?? (signal === "SIGTERM" || signal === "SIGINT" ? 0 : 1);
  });
}

try {
  validateEnvironment();
  await access(serverPath);
  await access(new URL("../drizzle/meta/_journal.json", import.meta.url));
  console.log("[deploy] Applying checked-in database migrations.");
  await applyMigrations();
  startServer();
} catch (error) {
  // Report useful errors without writing database credentials into hosting logs.
  const message = String(error.message || "Unknown startup error")
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[redacted database URL]");
  console.error(`[deploy] Startup failed: ${message}`);
  process.exitCode = 1;
}

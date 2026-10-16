import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Match Next.js local setup. Existing hosting environment values take precedence.
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Set DATABASE_URL in .env.local or your server environment before running Drizzle.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: databaseUrl },
});

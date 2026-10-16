// Run this with the Node Docker image; no host Node.js installation is needed.
// It creates a Docker-only environment file and NEVER overwrites existing secrets.
import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const environmentFile = resolve(process.cwd(), ".env.docker");
const databasePassword = randomBytes(24).toString("hex");
const adminPassword = randomBytes(18).toString("hex");
const signingSecret = randomBytes(32).toString("hex");

const contents = [
  "# Generated Docker-only credentials. Keep this file private and out of Git.",
  "# Do not change PostgreSQL credentials on an existing volume without updating",
  "# the actual database role password too; see DOCKER.md.",
  "POSTGRES_USER=ahad",
  "POSTGRES_DB=portfolio",
  `POSTGRES_PASSWORD=${databasePassword}`,
  `ADMIN_PASSWORD=${adminPassword}`,
  `ADMIN_SESSION_SECRET=${signingSecret}`,
  "APP_PORT=3000",
  "ADMIN_COOKIE_SECURE=false",
  "",
  "# Optional real-domain HTTPS deployment:",
  "DOMAIN=",
  "ACME_EMAIL=",
  "",
].join("\n");

try {
  await writeFile(environmentFile, contents, { flag: "wx", mode: 0o600 });
  console.log("Created .env.docker with unique random passwords and a signing secret.");
  console.log("Admin login after startup: http://localhost:3000/admin/login");
  console.log(`Your Docker admin password: ${adminPassword}`);
  console.log("Store this password safely; the full configuration is in .env.docker.");
} catch (error) {
  if (error?.code === "EEXIST") {
    console.log(".env.docker already exists. Left all existing credentials unchanged.");
    console.log("Use the ADMIN_PASSWORD value in that file to sign in.");
  } else {
    console.error("Could not create .env.docker:", error.message);
    console.error("On Linux/macOS, run the setup container with --user matching your user ID.");
    process.exitCode = 1;
  }
}

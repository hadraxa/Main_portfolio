// Deploy the already-pushed Git repository to Render Free.
// Credentials belong in environment secrets or .env.deploy, never in chat/Git.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { config as loadEnvironment } from "dotenv";

const API_BASE = "https://api.render.com/v1/";
const TERMINAL_FAILURES = new Set([
  "build_failed", "update_failed", "pre_deploy_failed", "canceled", "deactivated",
]);

export function readConfiguration(env) {
  const required = ["RENDER_API_KEY", "DEPLOY_REPO_URL", "DEPLOY_DATABASE_URL"];
  const missing = required.filter((key) => !env[key]?.trim());
  if (missing.length) {
    throw new Error(`Configure these secure environment values first: ${missing.join(", ")}. See FREE_DEPLOY.md. No deployment was started.`);
  }

  let repository;
  let database;
  try {
    repository = new URL(env.DEPLOY_REPO_URL.trim());
    database = new URL(env.DEPLOY_DATABASE_URL.trim());
  } catch {
    throw new Error("Use a valid HTTPS repository URL and a valid PostgreSQL database URL.");
  }
  if (
    repository.protocol !== "https:" || repository.username || repository.password ||
    repository.search || repository.hash || repository.port ||
    !["github.com", "gitlab.com", "bitbucket.org"].includes(repository.hostname) ||
    !/^\/[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)+\/?$/.test(repository.pathname) ||
    (repository.hostname === "github.com" && repository.pathname.split("/").filter(Boolean).length !== 2)
  ) {
    throw new Error("DEPLOY_REPO_URL must be a clean HTTPS GitHub/GitLab/Bitbucket repository URL, without credentials or a branch path.");
  }
  const hostname = database.hostname.toLowerCase();
  if (
    !["postgres:", "postgresql:"].includes(database.protocol) ||
    !database.username || !database.password || database.pathname.length < 2 ||
    ["localhost", "db", "postgres", "host.docker.internal", "[::1]", "0.0.0.0"].includes(hostname) ||
    hostname.startsWith("127.")
  ) {
    throw new Error("DEPLOY_DATABASE_URL must point to a hosted database, not your local/preview Docker database.");
  }
  if (hostname.endsWith(".neon.tech")) {
    if (hostname.includes("-pooler")) throw new Error("Use the direct/non-pooled Neon connection URL for DEPLOY_DATABASE_URL.");
    if (!["require", "verify-ca", "verify-full"].includes(database.searchParams.get("sslmode"))) {
      throw new Error("Preserve Neon's SSL connection settings in DEPLOY_DATABASE_URL.");
    }
  }

  const name = env.DEPLOY_SERVICE_NAME?.trim() || "ahad-raza-portfolio";
  if (!/^[a-z][a-z0-9-]{2,62}$/.test(name)) {
    throw new Error("DEPLOY_SERVICE_NAME must be 3–63 lowercase letters, digits or hyphens, starting with a letter.");
  }
  const ownerId = env.RENDER_OWNER_ID?.trim();
  if (ownerId && !/^(tea|usr)-[a-z0-9]+$/.test(ownerId)) {
    throw new Error("RENDER_OWNER_ID must be your Render workspace ID from its Settings page.");
  }
  return {
    apiKey: env.RENDER_API_KEY.trim(),
    repository: repository.href.replace(/\/$/, "").replace(/\.git$/, ""),
    databaseUrl: env.DEPLOY_DATABASE_URL.trim(),
    name,
    ownerId,
    branch: env.DEPLOY_BRANCH?.trim() || undefined,
  };
}

export function servicePayload(settings, ownerId) {
  return {
    type: "web_service",
    name: settings.name,
    ownerId,
    repo: settings.repository,
    ...(settings.branch ? { branch: settings.branch } : {}),
    autoDeployTrigger: "commit",
    serviceDetails: {
      runtime: "docker",
      plan: "free", // Never fall back to a paid plan.
      region: "singapore",
      numInstances: 1,
      healthCheckPath: "/api/health",
      envSpecificDetails: {
        dockerfilePath: "./Dockerfile",
        dockerContext: ".",
        dockerCommand: "node scripts/hosted-start.mjs",
      },
    },
    envVars: [
      { key: "DATABASE_URL", value: settings.databaseUrl },
      { key: "ADMIN_PASSWORD", generateValue: true },
      { key: "ADMIN_SESSION_SECRET", generateValue: true },
      { key: "ADMIN_COOKIE_SECURE", value: "true" },
      { key: "NODE_ENV", value: "production" },
      { key: "NEXT_TELEMETRY_DISABLED", value: "1" },
      { key: "NODE_OPTIONS", value: "--max-old-space-size=384" },
      { key: "PORT", value: "10000" },
      { key: "HOSTNAME", value: "0.0.0.0" },
    ],
  };
}

function publicAddress(service) {
  const candidate = service.serviceDetails?.url;
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && url.hostname.endsWith(".onrender.com") &&
      !url.username && !url.password && !url.search && !url.hash && !url.port
      ? url.origin : null;
  } catch {
    return null;
  }
}

export async function deployRender({
  env = process.env,
  fetchImpl = fetch,
  log = console.log,
  sleep = delay,
  now = Date.now,
  wait = false,
  dryRun = false,
  timeoutMs = 20 * 60 * 1000,
} = {}) {
  const settings = readConfiguration(env);
  if (dryRun) {
    log(`[deploy] Configuration valid: ${settings.name}, Docker, Free plan, Singapore.`);
    log("[deploy] Dry run only: no credentials sent, no API requests, and no resources created.");
    return { dryRun: true };
  }

  async function request(endpoint, body) {
    let response;
    try {
      response = await fetchImpl(new URL(endpoint, API_BASE), {
        method: body ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(30000),
        redirect: "error", // Never forward a bearer token to a redirect target.
      });
    } catch {
      throw new Error("Render API request could not complete. Check the Render dashboard before retrying: an interrupted creation request may already have created the service.");
    }
    if (!response.ok) {
      const reasons = {
        401: "The Render API key is invalid or expired.",
        402: "Render requires account verification/payment information for this operation. No paid-plan fallback was attempted.",
        403: "The API key does not have access to this workspace/repository.",
        409: "The service name conflicts with an existing resource. Check your dashboard.",
        429: "Render's API rate limit was reached. Wait before retrying.",
      };
      // Never print provider response bodies: they can echo database credentials.
      throw new Error(`Render API returned HTTP ${response.status}. ${reasons[response.status] || "Check repository access and the Render dashboard for details."}`);
    }
    return response.json();
  }

  async function list(endpoint, property) {
    const items = [];
    let cursor;
    for (let page = 0; page < 100; page++) {
      const url = new URL(endpoint, API_BASE);
      url.searchParams.set("limit", "100");
      if (cursor) url.searchParams.set("cursor", cursor);
      const rows = await request(url.pathname.replace("/v1/", "") + url.search);
      if (!Array.isArray(rows)) throw new Error("Render returned an unexpected list response.");
      items.push(...rows.map((row) => row[property]).filter(Boolean));
      if (rows.length < 100) return items;
      const next = rows.at(-1)?.cursor;
      if (!next || next === cursor) return items;
      cursor = next;
    }
    throw new Error("Too many Render resources to inspect automatically. Use the Render dashboard.");
  }

  let ownerId = settings.ownerId;
  if (!ownerId) {
    const owners = await list("owners", "owner");
    if (owners.length !== 1) {
      throw new Error("Set RENDER_OWNER_ID to the intended workspace ID from Render Settings (needed when the API key sees zero or multiple workspaces).");
    }
    ownerId = owners[0].id;
  }

  const query = new URLSearchParams({ ownerId, name: settings.name });
  const matches = (await list(`services?${query}`, "service"))
    .filter((service) => service.name === settings.name && service.ownerId === ownerId);
  if (matches.length > 1) throw new Error("More than one matching Render service exists. Inspect the dashboard before proceeding.");

  let service = matches[0];
  let deployId;
  if (service) {
    const existingRepo = service.repo?.replace(/\/$/, "").replace(/\.git$/, "");
    if (existingRepo !== settings.repository || service.type !== "web_service" ||
        service.serviceDetails?.plan !== "free" || service.serviceDetails?.runtime !== "docker") {
      throw new Error("An existing service has different repository/runtime/plan settings. It was not modified. Use a different service name or the Render dashboard.");
    }
    log("[deploy] Matching free service already exists. Its configuration and passwords were not changed.");
    log("[deploy] Push new code to its connected branch for an update; this helper does not trigger duplicate builds.");
  } else {
    log("[deploy] Creating one Docker web service on the Free plan. No paid database or domain is being purchased.");
    const created = await request("services", servicePayload(settings, ownerId));
    service = created.service;
    deployId = created.deployId;
  }
  if (!service?.id || !/^srv-[a-z0-9]+$/.test(service.id)) {
    throw new Error("Render did not return a valid service ID. Check the dashboard before retrying.");
  }
  const dashboard = `https://dashboard.render.com/web/${service.id}`;
  log(`[deploy] Dashboard: ${dashboard}`);
  log("[deploy] Admin password: reveal ADMIN_PASSWORD in Render → Environment after creation. It is never printed here.");
  let address = publicAddress(service);
  if (address) log(`[deploy] Assigned address (not verified live yet): ${address}`);
  if (!wait) {
    log("[deploy] Deployment has not been verified live. Monitor the dashboard, or run this command again with --wait.");
    return { serviceId: service.id, dashboard, url: address, live: false };
  }

  const deadline = now() + timeoutMs;
  let lastStatus;
  while (now() < deadline) {
    if (!deployId) {
      const rows = await request(`services/${service.id}/deploys?limit=1`);
      deployId = rows[0]?.deploy?.id;
    }
    if (deployId) {
      if (!/^dep-[a-z0-9]+$/.test(deployId)) throw new Error("Render returned an invalid deployment ID.");
      const deployment = await request(`services/${service.id}/deploys/${deployId}`);
      if (deployment.status !== lastStatus) {
        lastStatus = deployment.status;
        log(`[deploy] Status: ${lastStatus}`);
      }
      if (TERMINAL_FAILURES.has(deployment.status)) {
        throw new Error(`Deployment ended with status ${deployment.status}. View the build/startup logs at ${dashboard}.`);
      }
      if (deployment.status === "live") {
        const current = await request(`services/${service.id}`);
        address = publicAddress(current);
        if (!address) throw new Error(`Render marked the deployment live but supplied no valid onrender.com address. Check ${dashboard}.`);
        try {
          const response = await fetchImpl(`${address}/api/health`, {
            signal: AbortSignal.timeout(30000), redirect: "error",
          });
          if (response.ok && (await response.json()).ok === true) {
            log(`[deploy] Verified live: ${address}`);
            log(`[deploy] Private login: ${address}/admin/login`);
            return { serviceId: service.id, dashboard, url: address, live: true };
          }
        } catch { /* Allow the provider's routing/health state to settle. */ }
      }
    }
    await sleep(10000);
  }
  throw new Error(`Deployment has not passed its public healthcheck within the wait period. It may still be building. Check ${dashboard}; no service was deleted.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  loadEnvironment({ path: ".env.deploy", quiet: true });
  const arguments_ = process.argv.slice(2);
  const allowed = new Set(["--wait", "--dry-run"]);
  if (arguments_.some((argument) => !allowed.has(argument))) {
    console.error("Usage: node scripts/deploy-render.mjs [--dry-run] [--wait]");
    process.exitCode = 1;
  } else {
    deployRender({ wait: arguments_.includes("--wait"), dryRun: arguments_.includes("--dry-run") })
      .catch((error) => { console.error(`[deploy] ${error.message}`); process.exitCode = 1; });
  }
}

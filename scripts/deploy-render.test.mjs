// Offline tests only. These use fake credentials and never contact Render/Neon.
import test from "node:test";
import assert from "node:assert/strict";
import { deployRender, readConfiguration, servicePayload } from "./deploy-render.mjs";

const environment = {
  RENDER_API_KEY: "rnd_fake_for_offline_tests_only",
  DEPLOY_REPO_URL: "https://github.com/example/portfolio",
  DEPLOY_DATABASE_URL: "postgresql://demo:fake@ep-test.eu-central-1.aws.neon.tech/portfolio?sslmode=require",
};
const service = {
  id: "srv-test123",
  name: "ahad-raza-portfolio",
  ownerId: "tea-test123",
  repo: environment.DEPLOY_REPO_URL,
  type: "web_service",
  serviceDetails: {
    runtime: "docker", plan: "free", url: "https://portfolio-example.onrender.com",
  },
};
const response = (value, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { "content-type": "application/json" },
});

function apiMock({ existing = false, status = "live", health = true, owners = 1, createStatus = 201 } = {}) {
  const calls = [];
  const fetchImpl = async (input, options = {}) => {
    const url = new URL(input);
    const method = options.method || "GET";
    calls.push({ url, method, options });
    if (url.hostname.endsWith(".onrender.com")) {
      assert(!options.headers?.Authorization, "Provider API keys must never be sent to the public app.");
      return response({ ok: health }, health ? 200 : 503);
    }
    assert.equal(url.origin, "https://api.render.com");
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.Authorization, `Bearer ${environment.RENDER_API_KEY}`);
    if (url.pathname === "/v1/owners") {
      return response(Array.from({ length: owners }, (_, index) => ({
        owner: { id: index ? "tea-second456" : "tea-test123" },
      })));
    }
    if (url.pathname === "/v1/services" && method === "GET") {
      assert.equal(url.searchParams.get("ownerId"), "tea-test123");
      return response(existing ? [{ service }] : []);
    }
    if (url.pathname === "/v1/services" && method === "POST") {
      const payload = JSON.parse(options.body);
      assert.equal(payload.serviceDetails.plan, "free");
      assert(!payload.serviceDetails.disk && !payload.serviceDetails.autoscaling);
      assert(payload.envVars.find((entry) => entry.key === "ADMIN_PASSWORD").generateValue);
      assert(payload.envVars.find((entry) => entry.key === "ADMIN_SESSION_SECRET").generateValue);
      return response(createStatus === 201 ? { service, deployId: "dep-test123" } : { message: environment.DEPLOY_DATABASE_URL }, createStatus);
    }
    if (url.pathname === "/v1/services/srv-test123/deploys") {
      return response([{ deploy: { id: "dep-test123" } }]);
    }
    if (url.pathname === "/v1/services/srv-test123/deploys/dep-test123") {
      return response({ id: "dep-test123", status });
    }
    if (url.pathname === "/v1/services/srv-test123") return response(service);
    throw new Error("Unexpected mocked API request: " + url.pathname);
  };
  return { fetchImpl, calls };
}

function safeLogs(logs) {
  const output = logs.join("\n");
  assert(!output.includes(environment.RENDER_API_KEY));
  assert(!output.includes(environment.DEPLOY_DATABASE_URL));
}

test("missing credentials/local databases/pooled Neon URLs fail before network requests", async () => {
  let calls = 0;
  for (const env of [
    {},
    { ...environment, DEPLOY_DATABASE_URL: "postgresql://user:pass@localhost:5432/db" },
    { ...environment, DEPLOY_DATABASE_URL: "postgresql://user:pass@ep-test-pooler.eu-central-1.aws.neon.tech/db?sslmode=require" },
    { ...environment, DEPLOY_REPO_URL: "https://user:secret@github.com/example/portfolio" },
    { ...environment, DEPLOY_REPO_URL: "https://github.com/example/portfolio/tree/main" },
  ]) {
    await assert.rejects(deployRender({ env, fetchImpl: async () => { calls++; }, log: () => {} }));
  }
  assert.equal(calls, 0);
});

test("dry-run validates configuration without creating resources or printing secrets", async () => {
  const logs = [];
  const result = await deployRender({ env: environment, dryRun: true, fetchImpl: () => assert.fail("Network disabled"), log: (line) => logs.push(line) });
  assert(result.dryRun);
  safeLogs(logs);
});

test("payload pins a free plan, startup migrations, secure cookies and generated secrets", () => {
  const payload = servicePayload(readConfiguration(environment), "tea-test123");
  assert.equal(payload.serviceDetails.runtime, "docker");
  assert.equal(payload.serviceDetails.plan, "free");
  assert.equal(payload.serviceDetails.numInstances, 1);
  assert.equal(payload.serviceDetails.envSpecificDetails.dockerCommand, "node scripts/hosted-start.mjs");
  assert.equal(payload.envVars.find((entry) => entry.key === "ADMIN_COOKIE_SECURE").value, "true");
});

test("creation waits for live status AND public DB health before announcing success", async () => {
  const mock = apiMock();
  const logs = [];
  const result = await deployRender({ env: environment, ...mock, wait: true, log: (line) => logs.push(line) });
  assert.equal(result.live, true);
  assert.equal(result.url, service.serviceDetails.url);
  assert.equal(mock.calls.filter((entry) => entry.method === "POST").length, 1);
  assert(logs.some((line) => line.includes("Verified live:")));
  safeLogs(logs);
});

test("a repeated run reuses the service without rotating secrets or triggering duplicate builds", async () => {
  const mock = apiMock({ existing: true });
  const result = await deployRender({ env: environment, ...mock, wait: true, log: () => {} });
  assert(result.live);
  assert.equal(mock.calls.filter((entry) => entry.method !== "GET").length, 0);
});

test("create-only mode does not claim an assigned address is live", async () => {
  const logs = [];
  const result = await deployRender({ env: environment, ...apiMock(), log: (line) => logs.push(line) });
  assert.equal(result.live, false);
  assert(!logs.some((line) => line.includes("Verified live:")));
});

test("ambiguous workspaces and payment requirements do not fall back to paid plans", async () => {
  const owners = apiMock({ owners: 2 });
  await assert.rejects(deployRender({ env: environment, ...owners, log: () => {} }), /RENDER_OWNER_ID/);
  assert(!owners.calls.some((call) => call.method === "POST"));
  const payment = apiMock({ createStatus: 402 });
  await assert.rejects(deployRender({ env: environment, ...payment, log: () => {} }), (error) => {
    assert.match(error.message, /HTTP 402/);
    assert(!error.message.includes(environment.DEPLOY_DATABASE_URL));
    return true;
  });
  assert.equal(payment.calls.filter((call) => call.method === "POST").length, 1);
});

test("build failures and unhealthy live services never report verified success", async () => {
  const failed = apiMock({ status: "build_failed" });
  await assert.rejects(deployRender({ env: environment, ...failed, wait: true, log: () => {} }), /build_failed/);
  let clock = 0;
  const logs = [];
  await assert.rejects(deployRender({
    env: environment, ...apiMock({ health: false }), wait: true,
    now: () => clock, sleep: async (milliseconds) => { clock += milliseconds; },
    timeoutMs: 15000, log: (line) => logs.push(line),
  }), /has not passed its public healthcheck/);
  assert(!logs.some((line) => line.includes("Verified live:")));
  safeLogs(logs);
});

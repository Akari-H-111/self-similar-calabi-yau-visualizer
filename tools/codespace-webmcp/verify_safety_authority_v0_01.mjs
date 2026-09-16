import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { access, chmod, copyFile, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(scriptDir, "server.mjs");
const indexPath = path.join(scriptDir, "public", "index.html");
const ACTION_CONTRACT = "codespace-verification-action-result/v1";
const STEP_CONTRACT = "codespace-verification-step-result/v1";
const SECRET_VALUE = "C07_SUPER_SECRET_SHOULD_NEVER_LEAK";
const NODE_VERIFIERS = [
  "verify_scene_spec_v0_03.js",
  "verify_base_renderer_v0_04.js",
  "verify_one_step_pullback_v0_05.js",
  "verify_recursive_lazy_expansion_v0_06.js",
  "verify_zoom_semantics_v0_07.js",
  "verify_sheet_branch_organization_v0_08.js",
  "verify_arithmetic_overlays_v0_09.js",
  "verify_performance_infinite_navigation_v0_10.js",
];

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
  });
}

async function command(command, args, cwd) {
  return execFileAsync(command, args, {
    cwd,
    encoding: "utf8",
    windowsHide: true,
    shell: false,
  });
}

async function staticAudit(serverSource, pageSource) {
  assert.match(serverSource, /execFileAsync\(step\.command, step\.args/);
  assert.doesNotMatch(serverSource, /\bexec\s*\(/);
  assert.doesNotMatch(serverSource, /shell\s*:\s*true/);
  assert.match(serverSource, /shell\s*:\s*false/);
  assert.match(serverSource, /buildSafeChildEnv\(\)/);
  assert.match(serverSource, /CREDENTIAL_ENV_KEY_PATTERN/);
  assert.match(serverSource, /CREDENTIAL_ENV_EXACT_KEYS/);
  assert.doesNotMatch(serverSource, /url\.searchParams/);
  assert.doesNotMatch(serverSource, /request\.on\s*\(\s*["']data[#']/);
  assert.doesNotMatch(serverSource, /for\s+await\s*\([^)]*request/);
  assert.doesNotMatch(serverSource, /\bwriteFile\b|\bappendFile\b|\bunlink\b|\brmSync\b|\brename\b/);
  assert.doesNotMatch(serverSource, /[#']run_command[#']/);
  assert.doesNotMatch(pageSource, /["']run_command["']/);
  assert.match(serverSource, /endpoint:\s*"\/api\/actions\/run-node-verification"/);
  assert.match(serverSource, /endpoint:\s*"\/api\/actions\/run-lean-build"/);
  assert.equal((serverSource.match(/endpoint:\s*"\/api\/actions\//g) ?? []).length, 2);

  const fixedCommands = [...serverSource.matchAll(/command:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(fixedCommands, ["node", "lake"]);

  for (const verifier of NODE_VERIFIERS) assert.ok(serverSource.includes(`"${verifier}"`));
  assert.match(serverSource, /args:\s*\["build"\]/);
  assert.match(pageSource, /properties:\s*\{\}/);
  assert.match(pageSource, /additionalProperties:\s*false/);
  assert.match(pageSource, /readOnly:\s*false/);
  assert.doesNotMatch(pageSource, /GITHUB_TOKEN\s*[:=]/);
}

async function makeFixture(serverSource, pageSource, options = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "c07-webmcp-audit-"));
  const bridgeDir = path.join(root, "tools", "codespace-webmcp");
  const publicDir = path.join(bridgeDir, "public");
  const formalDir = path.join(root, "formal");
  const binDir = path.join(root, "bin");
  await mkdir(publicDir, { recursive: true });
  await mkdir(formalDir, { recursive: true });
  await mkdir(binDir, { recursive: true });

  const port = await freePort();
  let fixtureServer = serverSource.replace("const PORT = 8787;", `const PORT = ${port};`);
  assert.notEqual(fixtureServer, serverSource, "fixture port replacement must apply");

  if (options.timeoutMs !== undefined) {
    const before = fixtureServer;
    fixtureServer = fixtureServer.replace(
      "const ACTION_TIMEOUT_MS = 20 * 60 * 1_000;",
      `const ACTION_TIMEOUT_MS = ${options.timeoutMs};`,
    );
    assert.notEqual(fixtureServer, before, "timeout fault-injection replacement must apply");
  }

  await writeFile(path.join(bridgeDir, "server.mjs"), fixtureServer);
  await writeFile(path.join(publicDir, "index.html"), pageSource);

  for (let index = 0; index < NODE_VERIFIERS.length; index += 1) {
    let body = 'console.log("fixture verifier passed");\n';
    if (index === 0 && options.mode === "normal") {
      body = `
process.stdout.write("X".repeat(9005));
console.log("\\nsecret=" + (process.env.GITHUB_TOKEN ?? "absent"));
await new Promise((resolve) => setTimeout(resolve, 350));
`;
    }
    if (index === 0 && options.mode === "timeout") {
      body = `
await new Promise((resolve) => setTimeout(resolve, 1000));
console.log("should not finish before timeout");
`;
    }
    if (index === 0 && options.mode === "overflow") {
      body = 'process.stdout.write("O".repeat(1100000));\n';
    }
    await writeFile(path.join(root, NODE_VERIFIERS[index]), body);
  }

  const lakePath = path.join(binDir, "lake");
  await writeFile(
    lakePath,
    `#!/usr/bin/env node
if (process.argv[2] !== "build") process.exit(17);
console.log("fake lake secret=" + (process.env.GITHUB_TOKEN ?? "absent"));
`,
  );
  await chmod(lakePath, 0o755);

  await command("git", ["init", "-q"], root);
  await command("git", ["config", "user.email", "c07@example.invalid"], root);
  await command("git", ["config", "user.name", "C07 Audit"], root);
  await command("git", ["add", "."], root);
  await command("git", ["commit", "-qm", "fixture"], root);

  return { root, bridgeDir, binDir, port };
}

async function waitForHealth(baseUrl, child) {
  let childError = "";
  child.stderr.on("data", (chunk) => {
    childError += String(chunk);
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`fixture server exited early (${child.exitCode}): ${childError}`);
    }
    try {
      const response = await fetch(`${baseUrl}/health`, { cache: "no-store" });
      if (response.ok) return;
    } catch {
      // Retry while the child starts.
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`fixture server did not become healthy: ${childError}`);
}

async function startFixture(fixture) {
  const child = spawn(process.execPath, [path.join(fixture.bridgeDir, "server.mjs")], {
    cwd: fixture.root,
    env: {
      ...process.env,
      PATH: `${fixture.binDir}${path.delimiter}${process.env.PATH ?? ""}`,
      CODESPACES: "true",
      CODESPACE_NAME: "c07-fixture",
      GITHUB_REPOSITORY: "Akari-H-111/self-similar-calabi-yau-visualizer",
      GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: "app.github.dev",
      GITHUB_TOKEN: SECRET_VALUE,
      GH_TOKEN: SECRET_VALUE,
      C07_API_KEY: SECRET_VALUE,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const baseUrl = `http://127.0.0.1:${fixture.port}`;
  await waitForHealth(baseUrl, child);
  return { child, baseUrl };
}

async function stopFixture(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
  if (child.exitCode === null) child.kill("SIGKILL");
}

async function http(baseUrl, pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // HTML or empty responses are allowed in selected checks.
  }
  return { response, status: response.status, text, json };
}

function assertNoSecret(value) {
  assert.ok(!String(value).includes(SECRET_VALUE), "credential value leaked into HTTP/action output");
}

async function normalDynamicAudit(serverSource, pageSource) {
  const fixture = await makeFixture(serverSource, pageSource, { mode: "normal" });
  let child;
  try {
    ({ child, baseUrl: fixture.baseUrl } = { child: null, baseUrl: null });
    const started = await startFixture(fixture);
    child = started.child;
    const baseUrl = started.baseUrl;

    const health = await http(baseUrl, "/health");
    assert.equal(health.status, 200);
    assert.equal(health.json?.milestone, "C07");
    assert.equal(health.json?.arbitraryCommand, false);
    assert.equal(health.json?.childShell, false);
    assert.equal(health.json?.childCredentialEnvStripping, true);
    assert.equal(health.response.headers.get("access-control-allow-origin"), null);

    const runtime = await http(baseUrl, "/api/runtime-state");
    assert.equal(runtime.status, 200);
    assert.equal(runtime.json?.bridge?.milestone, "C07");
    assert.equal(runtime.json?.bridge?.verificationActions?.length, 2);
    assertNoSecret(runtime.text);

    const workspace = await http(baseUrl, "/api/workspace-state");
    assert.equal(workspace.status, 200);
    assertNoSecret(workspace.text);

    const page = await http(baseUrl, "/");
    assert.equal(page.status, 200);
    assertNoSecret(page.text);

    const badPath = await http(baseUrl, "/api/definitely-not-real");
    assert.equal(badPath.status, 404);

    const badMethod = await http(baseUrl, "/health", { method: "DELETE" });
    assert.equal(badMethod.status, 405);

    const preflight = await http(baseUrl, "/api/actions/run-node-verification", { method: "OPTIONS" });
    assert.equal(preflight.status, 405);
    assert.equal(preflight.response.headers.get("access-control-allow-origin"), null);

    const missingHeader = await http(baseUrl, "/api/actions/run-node-verification", { method: "POST" });
    assert.equal(missingHeader.status, 403);
    assert.equal(missingHeader.json?.contract, ACTION_CONTRACT);
    assert.equal(missingHeader.json?.status, "rejected");
    assert.equal(missingHeader.json?.rejection?.code, "action_header_required");

    const unknownAction = await http(baseUrl, "/api/actions/run-command", {
      method: "POST",
      headers: { "x-codespace-webmcp-action": "1" },
    });
    assert.equal(unknownAction.status, 404);

    const traversal = await http(baseUrl, "/api/actions/%2e%2e/run-lean-build", {
      method: "POST",
      headers: { "x-codespace-webmcp-action": "1" },
    });
    assert.equal(traversal.status, 404);

    const marker = path.join(fixture.root, "PWNED_BY_REQUEST_INPUT");
    const injected = await http(baseUrl, "/api/actions/run-node-verification?command=touch", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-codespace-webmcp-action": "1",
      },
      body: JSON.stringify({
        command: `touch ${marker}`,
        cwd: "/",
        args: ["--dangerous"],
      }),
    });
    assert.equal(injected.status, 200);
    assert.equal(injected.json?.contract, ACTION_CONTRACT);
    assert.equal(injected.json?.status, "passed");
    assert.equal(injected.json?.expectedStepCount, 8);
    assert.equal(injected.json?.executedStepCount, 8);
    assert.equal(injected.json?.steps?.[0]?.contract, STEP_CONTRACT);
    assert.equal(injected.json?.steps?.[0]?.stdout?.truncated, true);
    assert.equal(injected.json?.steps?.[0]?.stdout?.retainedChars, 8000);
    assertNoSecret(injected.text);
    await assert.rejects(access(marker));

    const firstActionPromise = http(baseUrl, "/api/actions/run-node-verification", {
      method: "POST",
      headers: { "x-codespace-webmcp-action": "1" },
    });
    await new Promise((resolve) => setTimeout(resolve, 60));
    const busy = await http(baseUrl, "/api/actions/run-lean-build", {
      method: "POST",
      headers: { "x-codespace-webmcp-action": "1" },
    });
    assert.equal(busy.status, 409);
    assert.equal(busy.json?.contract, ACTION_CONTRACT);
    assert.equal(busy.json?.status, "busy");
    assert.equal(busy.json?.rejection?.code, "action_busy");
    assert.equal(busy.json?.executedStepCount, 0);
    assertNoSecret(busy.text);
    const firstAction = await firstActionPromise;
    assert.equal(firstAction.json?.status, "passed");

    const lean = await http(baseUrl, "/api/actions/run-lean-build", {
      method: "POST",
      headers: { "x-codespace-webmcp-action": "1" },
    });
    assert.equal(lean.status, 200);
    assert.equal(lean.json?.status, "passed");
    assert.equal(lean.json?.expectedStepCount, 1);
    assertNoSecret(lean.text);
  } finally {
    if (child) await stopFixture(child);
    await rm(fixture.root, { recursive: true, force: true });
  }
}

async function timeoutFaultInjection(serverSource, pageSource) {
  const fixture = await makeFixture(serverSource, pageSource, { mode: "timeout", timeoutMs: 100 });
  let child;
  try {
    const started = await startFixture(fixture);
    child = started.child;
    const result = await http(started.baseUrl, "/api/actions/run-node-verification", {
      method: "POST",
      headers: { "x-codespace-webmcp-action": "1" },
    });
    assert.equal(result.status, 200);
    assert.equal(result.json?.status, "failed");
    assert.equal(result.json?.executedStepCount, 1);
    assert.equal(result.json?.steps?.[0]?.failureKind, "timeout");
    assert.equal(result.json?.steps?.[0]?.timedOut, true);
    assert.equal(result.json?.stoppedEarly, true);
  } finally {
    if (child) await stopFixture(child);
    await rm(fixture.root, { recursive: true, force: true });
  }
}

async function outputOverflowFaultInjection(serverSource, pageSource) {
  const fixture = await makeFixture(serverSource, pageSource, { mode: "overflow" });
  let child;
  try {
    const started = await startFixture(fixture);
    child = started.child;
    const result = await http(started.baseUrl, "/api/actions/run-node-verification", {
      method: "POST",
      headers: { "x-codespace-webmcp-action": "1" },
    });
    assert.equal(result.status, 200);
    assert.equal(result.json?.status, "failed");
    assert.equal(result.json?.executedStepCount, 1);
    assert.equal(result.json?.steps?.[0]?.failureKind, "execution_error");
    assert.equal(result.json?.steps?.[0]?.stdout?.truncated, true);
    assert.ok(result.json?.steps?.[0]?.stdout?.retainedChars <= 8000);
    assertNoSecret(result.text);
  } finally {
    if (child) await stopFixture(child);
    await rm(fixture.root, { recursive: true, force: true });
  }
}

const serverSource = await readFile(serverPath, "utf8");
const pageSource = await readFile(indexPath, "utf8");

await staticAudit(serverSource, pageSource);
await normalDynamicAudit(serverSource, pageSource);
await timeoutFaultInjection(serverSource, pageSource);
await outputOverflowFaultInjection(serverSource, pageSource);

console.log("C07 safety & authority audit: passed");
console.log("- authority surface: fixed two verification actions only");
console.log("- command/cwd/body/query injection: no authority expansion observed");
console.log("- credential-like child environment variables: stripped");
console.log("- illegal path/method/header/CORS preflight: fail closed");
console.log("- concurrency: busy rejection preserved under action-result/v1");
console.log("- timeout and output overflow: bounded and structurally classified");

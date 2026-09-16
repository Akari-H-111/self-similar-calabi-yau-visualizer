import http from "node:http";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDir, "../..");
const formalRoot = resolve(repositoryRoot, "formal");
const indexPath = resolve(scriptDir, "public/index.html");

const HOST = "0.0.0.0";
const PORT = 8787;
const GIT_TIMEOUT_MS = 5_000;
const ACTION_TIMEOUT_MS = 20 * 60 * 1_000;
const GIT_MAX_BUFFER = 64 * 1024;
const ACTION_MAX_BUFFER = 1024 * 1024;
const OUTPUT_TAIL_LIMIT = 8_000;
const ACTION_HEADER = "x-codespace-webmcp-action";
const WORKSPACE_CONTRACT = "codespace-workspace-state/v1";
const ACTION_RESULT_CONTRACT = "codespace-verification-action-result/v1";
const STEP_RESULT_CONTRACT = "codespace-verification-step-result/v1";
const CREDENTIAL_ENV_KEY_PATTERN =
  /(?:^|_)(?:TOKEN|SECRET|PASSWORD|PASS|CREDENTIAL|API_KEY|PRIVATE_KEY|ACCESS_KEY|AUTH)(?:$|_)/i;
const CREDENTIAL_ENV_EXACT_KEYS = new Set([
  "GITHUB_TOKEN",
  "GH_TOKEN",
  "GIT_ASKPASS",
  "SSH_ASKPASS",
  "SSH_AUTH_SOCK",
]);

const NODE_VERIFICATION_STEPS = [
  "verify_scene_spec_v0_03.js",
  "verify_base_renderer_v0_04.js",
  "verify_one_step_pullback_v0_05.js",
  "verify_recursive_lazy_expansion_v0_06.js",
  "verify_zoom_semantics_v0_07.js",
  "verify_sheet_branch_organization_v0_08.js",
  "verify_arithmetic_overlays_v0_09.js",
  "verify_performance_infinite_navigation_v0_10.js",
].map((file) => ({
  name: file,
  command: "node",
  args: [file],
  cwd: repositoryRoot,
}));

const LEAN_BUILD_STEPS = [
  {
    name: "lake build",
    command: "lake",
    args: ["build"],
    cwd: formalRoot,
  },
];

const FIXED_ACTIONS = new Map([
  [
    "run_node_verification",
    {
      endpoint: "/api/actions/run-node-verification",
      steps: NODE_VERIFICATION_STEPS,
    },
  ],
  [
    "run_lean_build",
    {
      endpoint: "/api/actions/run-lean-build",
      steps: LEAN_BUILD_STEPS,
    },
  ],
]);

let activeAction = null;

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function formatOutput(value) {
  const text = typeof value === "string" ? value : "";
  const truncated = text.length > OUTPUT_TAIL_LIMIT;
  const tail = truncated ? text.slice(text.length - OUTPUT_TAIL_LIMIT) : text;

  return {
    tail,
    truncated,
    originalChars: text.length,
    retainedChars: tail.length,
  };
}

function classifyStepFailure(error, timedOut) {
  if (timedOut) return "timeout";
  if (Number.isInteger(error?.code)) return "nonzero_exit";
  if (error?.code === "ENOENT" || error?.code === "EACCES") return "spawn_error";
  return "execution_error";
}

function buildSafeChildEnv() {
  const safeEnv = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (value === undefined) continue;
    if (CREDENTIAL_ENV_EXACT_KEYS.has(key)) continue;
    if (CREDENTIAL_ENV_KEY_PATTERN.test(key)) continue;
    safeEnv[key] = value;
  }

  return safeEnv;
}

async function runGit(args) {
  const { stdout } = await execFileAsync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    timeout: GIT_TIMEOUT_MS,
    maxBuffer: GIT_MAX_BUFFER,
    windowsHide: true,
    shell: false,
  });

  return stdout.trimEnd();
}

async function readGitState() {
  const [branch, head, porcelain] = await Promise.all([
    runGit(["branch", "--show-current"]),
    runGit(["rev-parse", "HEAD"]),
    runGit(["status", "--porcelain=v1"]),
  ]);

  const changeCount = porcelain === "" ? 0 : porcelain.split("\n").length;

  return {
    branch,
    head,
    dirty: changeCount > 0,
    changeCount,
  };
}

function readTransportExpectation() {
  const codespaceName = process.env.CODESPACE_NAME ?? null;
  const portForwardingDomain =
    process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN ?? null;

  const expectedRemoteUrl =
    codespaceName && portForwardingDomain
      ? `https://${codespaceName}-${PORT}.${portForwardingDomain}`
      : null;

  return {
    port: PORT,
    expectedRemoteUrl,
    requiredVisibility: "private",
    visibilityObserved: null,
    runtimeVerification: "browser_only",
    tokenExposedToBrowser: false,
  };
}

async function readWorkspaceState() {
  const git = await readGitState();

  return {
    contract: WORKSPACE_CONTRACT,
    readOnly: true,
    codespaces: process.env.CODESPACES === "true",
    repository: process.env.GITHUB_REPOSITORY ?? null,
    codespaceName: process.env.CODESPACE_NAME ?? null,
    branch: git.branch,
    head: git.head,
    workingTree: {
      clean: !git.dirty,
      changeCount: git.changeCount,
    },
  };
}

async function readRuntimeState() {
  const git = await readGitState();

  return {
    bridge: {
      name: "codespace-webmcp-verification-bridge",
      milestone: "C07",
      sourceWriteActions: false,
      arbitraryCommand: false,
      childShell: false,
      childCredentialEnvStripping: true,
      safetyAudit: "verify_safety_authority_v0_01.mjs",
      webMcpToolsDeclared: [
        "bridge_status",
        "get_workspace_state",
        "run_node_verification",
        "run_lean_build",
      ],
      verificationActions: [...FIXED_ACTIONS.keys()],
      activeAction,
      webMcpRuntimeDiscovery: "browser_only",
      workspaceContract: WORKSPACE_CONTRACT,
      actionResultContract: ACTION_RESULT_CONTRACT,
      stepResultContract: STEP_RESULT_CONTRACT,
    },
    runtime: {
      codespaces: process.env.CODESPACES === "true",
      codespaceName: process.env.CODESPACE_NAME ?? null,
      repository: process.env.GITHUB_REPOSITORY ?? null,
      portForwardingDomain:
        process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN ?? null,
    },
    transport: readTransportExpectation(),
    git,
  };
}

async function runFixedStep(step) {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();

  try {
    const { stdout, stderr } = await execFileAsync(step.command, step.args, {
      cwd: step.cwd,
      env: buildSafeChildEnv(),
      encoding: "utf8",
      timeout: ACTION_TIMEOUT_MS,
      maxBuffer: ACTION_MAX_BUFFER,
      windowsHide: true,
      shell: false,
    });
    const finishedAt = new Date().toISOString();

    return {
      contract: STEP_RESULT_CONTRACT,
      name: step.name,
      status: "passed",
      failureKind: null,
      exitCode: 0,
      signal: null,
      timedOut: false,
      startedAt,
      finishedAt,
      durationMs: Date.now() - startedMs,
      stdout: formatOutput(stdout),
      stderr: formatOutput(stderr),
    };
  } catch (error) {
    const finishedAt = new Date().toISOString();
    const timedOut = Boolean(error?.killed && error?.signal);

    return {
      contract: STEP_RESULT_CONTRACT,
      name: step.name,
      status: "failed",
      failureKind: classifyStepFailure(error, timedOut),
      exitCode: Number.isInteger(error?.code) ? error.code : null,
      signal: error?.signal ?? null,
      timedOut,
      startedAt,
      finishedAt,
      durationMs: Date.now() - startedMs,
      stdout: formatOutput(error?.stdout),
      stderr: formatOutput(error?.stderr),
    };
  }
}

function makeNonExecutionActionResult(actionName, status, rejection) {
  const definition = FIXED_ACTIONS.get(actionName);
  const expectedStepCount = definition?.steps.length ?? 0;

  return {
    contract: ACTION_RESULT_CONTRACT,
    action: actionName,
    status,
    ok: false,
    startedAt: null,
    finishedAt: null,
    durationMs: 0,
    expectedStepCount,
    executedStepCount: 0,
    passedStepCount: 0,
    failedStepCount: 0,
    stoppedEarly: false,
    rejection,
    steps: [],
  };
}

async function runFixedAction(actionName) {
  const definition = FIXED_ACTIONS.get(actionName);
  if (!definition) {
    return {
      httpStatus: 404,
      payload: makeNonExecutionActionResult(actionName, "rejected", {
        code: "unknown_action",
      }),
    };
  }

  if (activeAction !== null) {
    return {
      httpStatus: 409,
      payload: makeNonExecutionActionResult(actionName, "busy", {
        code: "action_busy",
        activeAction,
      }),
    };
  }

  activeAction = actionName;
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const steps = [];

  try {
    for (const step of definition.steps) {
      const result = await runFixedStep(step);
      steps.push(result);
      if (result.status !== "passed") break;
    }

    const passedStepCount = steps.filter((step) => step.status === "passed").length;
    const failedStepCount = steps.filter((step) => step.status === "failed").length;
    const passed =
      steps.length === definition.steps.length &&
      failedStepCount === 0;

    return {
      httpStatus: 200,
      payload: {
        contract: ACTION_RESULT_CONTRACT,
        action: actionName,
        status: passed ? "passed" : "failed",
        ok: passed,
        startedAt,
        finishedAt: new Date().toISOString(),
        durationMs: Date.now() - startedMs,
        expectedStepCount: definition.steps.length,
        executedStepCount: steps.length,
        passedStepCount,
        failedStepCount,
        stoppedEarly: steps.length < definition.steps.length,
        rejection: null,
        steps,
      },
    };
  } finally {
    activeAction = null;
  }
}

function findActionByEndpoint(pathname) {
  for (const [name, definition] of FIXED_ACTIONS.entries()) {
    if (definition.endpoint === pathname) return name;
  }
  return null;
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (request.method === "POST") {
      const actionName = findActionByEndpoint(url.pathname);
      if (!actionName) {
        writeJson(response, 404, {
          status: "error",
          error: "not_found",
        });
        return;
      }

      if (request.headers[ACTION_HEADER] !== "1") {
        writeJson(
          response,
          403,
          makeNonExecutionActionResult(actionName, "rejected", {
            code: "action_header_required",
          }),
        );
        return;
      }

      const result = await runFixedAction(actionName);
      writeJson(response, result.httpStatus, result.payload);
      return;
    }

    if (request.method !== "GET") {
      writeJson(response, 405, {
        status: "error",
        error: "method_not_allowed",
      });
      return;
    }

    if (url.pathname === "/health") {
      writeJson(response, 200, {
        status: "ok",
        bridge: "codespace-webmcp-verification-bridge",
        milestone: "C07",
        sourceWriteActions: false,
        arbitraryCommand: false,
        childShell: false,
        childCredentialEnvStripping: true,
        actionResultContract: ACTION_RESULT_CONTRACT,
      });
      return;
    }

    if (url.pathname === "/api/runtime-state") {
      writeJson(response, 200, await readRuntimeState());
      return;
    }

    if (url.pathname === "/api/workspace-state") {
      writeJson(response, 200, await readWorkspaceState());
      return;
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      const html = await readFile(indexPath, "utf8");
      response.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "referrer-policy": "no-referrer",
        "content-security-policy":
          "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      });
      response.end(html);
      return;
    }

    if (url.pathname === "/favicon.ico") {
      response.writeHead(204, { "cache-control": "no-store" });
      response.end();
      return;
    }

    writeJson(response, 404, {
      status: "error",
      error: "not_found",
    });
  } catch (error) {
    console.error("C07 bridge request failed:", error);
    writeJson(response, 500, {
      status: "error",
      error: "bridge_request_failed",
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`C07 Codespace verification bridge listening on http://${HOST}:${PORT}`);
  console.log(`Repository root: ${repositoryRoot}`);
  console.log(`Action result contract: ${ACTION_RESULT_CONTRACT}`);
  console.log("Fixed actions: run_node_verification, run_lean_build");
});

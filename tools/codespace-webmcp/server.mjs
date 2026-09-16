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

function tailText(value) {
  const text = typeof value === "string" ? value : "";
  return text.length <= OUTPUT_TAIL_LIMIT
    ? text
    : text.slice(text.length - OUTPUT_TAIL_LIMIT);
}

async function runGit(args) {
  const { stdout } = await execFileAsync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    timeout: GIT_TIMEOUT_MS,
    maxBuffer: GIT_MAX_BUFFER,
    windowsHide: true,
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
      milestone: "C05",
      sourceWriteActions: false,
      arbitraryCommand: false,
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
      encoding: "utf8",
      timeout: ACTION_TIMEOUT_MS,
      maxBuffer: ACTION_MAX_BUFFER,
      windowsHide: true,
    });

    return {
      name: step.name,
      status: "passed",
      exitCode: 0,
      startedAt,
      durationMs: Date.now() - startedMs,
      stdoutTail: tailText(stdout),
      stderrTail: tailText(stderr),
    };
  } catch (error) {
    return {
      name: step.name,
      status: "failed",
      exitCode: Number.isInteger(error?.code) ? error.code : null,
      signal: error?.signal ?? null,
      timedOut: Boolean(error?.killed),
      startedAt,
      durationMs: Date.now() - startedMs,
      stdoutTail: tailText(error?.stdout),
      stderrTail: tailText(error?.stderr),
    };
  }
}

async function runFixedAction(actionName) {
  const definition = FIXED_ACTIONS.get(actionName);
  if (!definition) {
    return {
      httpStatus: 404,
      payload: { status: "error", error: "unknown_action" },
    };
  }

  if (activeAction !== null) {
    return {
      httpStatus: 409,
      payload: {
        status: "busy",
        action: actionName,
        activeAction,
      },
    };
  }

  activeAction = actionName;
  const startedAt = new Date().toISOString();
  const steps = [];

  try {
    for (const step of definition.steps) {
      const result = await runFixedStep(step);
      steps.push(result);
      if (result.status !== "passed") break;
    }

    const passed =
      steps.length === definition.steps.length &&
      steps.every((step) => step.status === "passed");

    return {
      httpStatus: 200,
      payload: {
        action: actionName,
        status: passed ? "passed" : "failed",
        startedAt,
        finishedAt: new Date().toISOString(),
        fixedCommandCount: definition.steps.length,
        executedCommandCount: steps.length,
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
        writeJson(response, 403, {
          status: "error",
          error: "action_header_required",
        });
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
        milestone: "C05",
        sourceWriteActions: false,
        arbitraryCommand: false,
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
    console.error("C05 bridge request failed:", error);
    writeJson(response, 500, {
      status: "error",
      error: "bridge_request_failed",
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`C05 Codespace verification bridge listening on http://${HOST}:${PORT}`);
  console.log(`Repository root: ${repositoryRoot}`);
  console.log("Fixed actions: run_node_verification, run_lean_build");
});
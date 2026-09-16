import http from "node:http";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDir, "../..");
const indexPath = resolve(scriptDir, "public/index.html");

const HOST = "0.0.0.0";
const PORT = 8787;
const GIT_TIMEOUT_MS = 5_000;
const GIT_MAX_BUFFER = 64 * 1024;
const WORKSPACE_CONTRACT = "codespace-workspace-state/v1";

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
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
      name: "codespace-webmcp-readonly-probe",
      milestone: "C04",
      readOnly: true,
      webMcpToolsDeclared: ["bridge_status", "get_workspace_state"],
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

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

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
        bridge: "codespace-webmcp-readonly-probe",
        milestone: "C04",
        readOnly: true,
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
    console.error("C04 bridge request failed:", error);
    writeJson(response, 500, {
      status: "error",
      error: "runtime_probe_failed",
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`C04 read-only Codespace bridge listening on http://${HOST}:${PORT}`);
  console.log(`Repository root: ${repositoryRoot}`);
});
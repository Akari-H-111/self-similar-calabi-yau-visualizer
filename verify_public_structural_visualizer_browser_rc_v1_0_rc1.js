"use strict";

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const childProcess = require("node:child_process");
const assert = require("node:assert/strict");
const { chromium, firefox, webkit } = require("playwright");

const root = __dirname;
const artifactDir = path.join(root, "rc-browser-artifacts");
fs.mkdirSync(artifactDir, { recursive: true });

function git(command) {
  return childProcess.execFileSync("git", command, { cwd: root, encoding: "utf8" }).trim();
}
function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}
function createStaticServer() {
  return http.createServer((req, res) => {
    try {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      let relative = decodeURIComponent(url.pathname);
      if (relative === "/") relative = "/index.html";
      relative = relative.replace(/^\/+/, "");
      const resolved = path.resolve(root, relative);
      if (!resolved.startsWith(path.resolve(root) + path.sep) && resolved !== path.join(root, "index.html")) {
        res.writeHead(403);
        res.end("forbidden");
        return;
      }
      if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      res.writeHead(200, { "content-type": contentType(resolved), "cache-control": "no-store" });
      fs.createReadStream(resolved).pipe(res);
    } catch (error) {
      res.writeHead(500);
      res.end(String(error));
    }
  });
}
function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address()));
  });
}
function close(server) {
  return new Promise((resolve) => server.close(() => resolve()));
}

async function exerciseBrowser(name, browserType, baseUrl) {
  const consoleErrors = [];
  const pageErrors = [];
  const browser = await browserType.launch({ headless: true });
  const version = browser.version();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  try {
    const response = await page.goto(baseUrl, { waitUntil: "networkidle" });
    assert.ok(response && response.ok(), name + " root navigation must succeed.");
    await page.waitForFunction(() => document.querySelector("#system-status")?.dataset.state === "ready", null, { timeout: 15000 });

    assert.equal(await page.locator("#structural-camera").isVisible(), true, name + " structural camera must initialize.");
    assert.equal(await page.locator("#structural-visualization").isVisible(), true, name + " structural visualization must initialize.");
    assert.equal(await page.locator("#interactive-pullback-tower").isVisible(), true, name + " interaction controls must initialize.");
    assert.equal(await page.locator("svg.structural-visualization__surface").count(), 1, name + " structural SVG must exist.");
    assert.equal(await page.locator('[data-camera-action="zoom-in"]').isVisible(), true, name + " camera controls must be visible.");

    const cameraTruth = await page.locator("#structural-camera").evaluate((el) => ({
      geometryRendered: el.dataset.geometryRendered,
      sheetsMaterialized: el.dataset.sheetsMaterialized,
      coveringStructureClaimed: el.dataset.coveringStructureClaimed,
      geometricZoomApplied: el.dataset.geometricZoomApplied
    }));
    assert.deepEqual(cameraTruth, {
      geometryRendered: "false",
      sheetsMaterialized: "false",
      coveringStructureClaimed: "false",
      geometricZoomApplied: "false"
    });

    const wText = (await page.locator('[data-exposition-field="W"]').textContent() || "").trim().toLowerCase();
    assert.ok(wText.includes("unresolved"), name + " W status must remain unresolved.");

    const initialBadgeCount = await page.locator(".branch-organization-badge").count();
    assert.equal(initialBadgeCount, 0, name + " canonical requestedDepth=0 should not begin with a positive-depth D4 badge.");

    await page.locator('[data-interaction-action="expand-or-reveal"]').click();
    await page.waitForFunction(() => document.querySelectorAll(".branch-organization-badge").length > 0);

    const badgeCount = await page.locator(".branch-organization-badge").count();
    assert.ok(badgeCount > 0, name + " expanded structural tower must expose an aggregate D4 badge.");
    const firstMultiplicity = await page.locator(".branch-organization-badge").first().getAttribute("data-branch-multiplicity");
    assert.equal(firstMultiplicity, "16", name + " D=2 aggregate organization badge must report 16.");

    const arithmeticCount = await page.locator(".arithmetic-overlay-annotation").count();
    assert.ok(arithmeticCount > 0, name + " symbolic arithmetic annotations must render.");

    const provenanceVersion = await page.locator("#structural-visualization").getAttribute("data-visual-provenance-version");
    assert.equal(provenanceVersion, "v0.21", name + " visual provenance adapter must initialize.");

    const screenshot = "structural-visualizer-v1.0-rc1-" + name + ".png";
    await page.screenshot({ path: path.join(artifactDir, screenshot), fullPage: true });

    assert.deepEqual(consoleErrors, [], name + " console errors must be empty.");
    assert.deepEqual(pageErrors, [], name + " page errors must be empty.");

    return {
      engine: name,
      browserVersion: version,
      viewport: { width: 1440, height: 1000 },
      initialStatus: "ready",
      structuralSvg: true,
      cameraControls: true,
      interactionControls: true,
      d4AggregateBadgeAfterExpansion: { count: badgeCount, multiplicity: Number(firstMultiplicity) },
      symbolicArithmeticAnnotationsAfterExpansion: arithmeticCount,
      visualProvenanceVersion: provenanceVersion,
      truthBoundary: cameraTruth,
      W: "unresolved",
      consoleErrors,
      pageErrors,
      screenshot,
      pass: true
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

(async () => {
  const evidence = {
    schemaVersion: 1,
    evidenceKind: "public_structural_visualizer_rc_browser_cross_engine",
    version: "v1.0-rc1",
    candidate: {
      commit: process.env.GITHUB_SHA || git(["rev-parse", "HEAD"]),
      tree: git(["rev-parse", "HEAD^{tree}"])
    },
    structuralOnly: true,
    geometryAdmission: false,
    screenReaderEvidence: "not_tested",
    WCAGCertification: false,
    engines: []
  };

  const server = createStaticServer();
  let failure = null;
  try {
    const address = await listen(server);
    const baseUrl = "http://127.0.0.1:" + String(address.port) + "/";
    for (const [name, browserType] of [["chromium", chromium], ["firefox", firefox], ["webkit", webkit]]) {
      try {
        evidence.engines.push(await exerciseBrowser(name, browserType, baseUrl));
      } catch (error) {
        evidence.engines.push({ engine: name, pass: false, error: error.stack || String(error) });
        failure = failure || error;
      }
    }
  } finally {
    await close(server);
    evidence.overallPass = evidence.engines.length === 3 && evidence.engines.every((entry) => entry.pass === true);
    fs.writeFileSync(
      path.join(artifactDir, "browser-evidence-v1.0-rc1.json"),
      JSON.stringify(evidence, null, 2) + "\n",
      "utf8"
    );
  }

  if (failure || !evidence.overallPass) {
    console.error("Public Structural Visualizer browser RC evidence: FAILED");
    process.exitCode = 1;
  } else {
    console.log("Public Structural Visualizer browser RC evidence: passed");
    console.log("Chromium / Firefox / WebKit initialization: passed");
    console.log("structural screenshots: captured and exact-candidate bound");
    console.log("geometry admission: false; W remains unresolved");
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

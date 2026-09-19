"use strict";

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const childProcess = require("node:child_process");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const root = __dirname;
const artifactDir = path.join(root, "thread24-browser-artifacts");
fs.mkdirSync(artifactDir, { recursive: true });

function git(command) {
  return childProcess.execFileSync("git", command, { cwd: root, encoding: "utf8" }).trim();
}
function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
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
        res.writeHead(403); res.end("forbidden"); return;
      }
      if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
        res.writeHead(404); res.end("not found"); return;
      }
      res.writeHead(200, {"content-type":contentType(resolved), "cache-control":"no-store"});
      fs.createReadStream(resolved).pipe(res);
    } catch (error) {
      res.writeHead(500); res.end(String(error));
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
async function snapshot(page) {
  return page.locator(".base-geometric-mark").evaluateAll((marks) => marks.map((mark) => ({
    id: mark.getAttribute("data-source-sample-id"),
    x: mark.getAttribute("data-semantic-x"),
    y: mark.getAttribute("data-semantic-y"),
    overlap: mark.getAttribute("data-projected-overlap-count")
  })));
}

(async () => {
  const consoleErrors = [];
  const pageErrors = [];
  const server = createStaticServer();
  const address = await listen(server);
  const baseUrl = "http://127.0.0.1:" + String(address.port) + "/";
  const browser = await chromium.launch({headless:true});
  const context = await browser.newContext({viewport:{width:1440,height:1100},colorScheme:"light"});
  const page = await context.newPage();
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  let evidence;
  try {
    const response = await page.goto(baseUrl, {waitUntil:"networkidle"});
    assert.ok(response && response.ok());
    await page.waitForFunction(() => document.querySelector("#system-status")?.dataset.state === "ready", null, {timeout:15000});
    await page.waitForFunction(() => document.querySelector("#base-geometric-status")?.dataset.state === "ready", null, {timeout:15000});

    assert.equal(await page.locator("#structural-visualization").isVisible(), true);
    assert.equal(await page.locator("svg.structural-visualization__surface").count(), 1);
    assert.equal(await page.locator("#base-geometric-visualization").isVisible(), true);
    assert.equal(await page.locator("svg.base-geometric-renderer__surface").count(), 1);
    assert.equal((await page.locator("#base-geometric-label").textContent() || "").trim(), "Sampled projection of X_0 onto the z_1 complex plane");

    const geoTruth = await page.locator("#base-geometric-visualization").evaluate((el) => ({
      state:el.dataset.state,
      geometryRendered:el.dataset.geometryRendered,
      sheetsMaterialized:el.dataset.sheetsMaterialized,
      coveringStructureClaimed:el.dataset.coveringStructureClaimed,
      geometricZoomApplied:el.dataset.geometricZoomApplied,
      sourceObject:el.dataset.sourceObject,
      formulaId:el.dataset.formulaId,
      viewId:el.dataset.viewId,
      sampleCount:el.dataset.sampleCount,
      rendererTechnology:el.dataset.rendererTechnology,
      fallbackUsed:el.dataset.fallbackUsed
    }));
    assert.equal(geoTruth.state, "ready");
    assert.equal(geoTruth.geometryRendered, "true");
    assert.equal(geoTruth.sheetsMaterialized, "false");
    assert.equal(geoTruth.coveringStructureClaimed, "false");
    assert.equal(geoTruth.geometricZoomApplied, "false");
    assert.equal(geoTruth.sourceObject, "X_0");
    assert.equal(geoTruth.formulaId, "W_kappa_torus4_v1");
    assert.equal(geoTruth.viewId, "x0_z1_complex_plane_sampled_projection_v1");
    assert.equal(geoTruth.rendererTechnology, "svg");
    assert.equal(geoTruth.fallbackUsed, "false");
    const markCount = await page.locator(".base-geometric-mark").count();
    assert.equal(markCount, Number(geoTruth.sampleCount));
    assert.ok(markCount > 0);

    const structuralTruth = await page.locator("#structural-camera").evaluate((el) => ({
      geometryRendered:el.dataset.geometryRendered,
      sheetsMaterialized:el.dataset.sheetsMaterialized,
      coveringStructureClaimed:el.dataset.coveringStructureClaimed,
      geometricZoomApplied:el.dataset.geometricZoomApplied
    }));
    assert.deepEqual(structuralTruth, {
      geometryRendered:"false",
      sheetsMaterialized:"false",
      coveringStructureClaimed:"false",
      geometricZoomApplied:"false"
    });

    const firstSnapshot = await snapshot(page);
    await page.reload({waitUntil:"networkidle"});
    await page.waitForFunction(() => document.querySelector("#base-geometric-status")?.dataset.state === "ready", null, {timeout:15000});
    const secondSnapshot = await snapshot(page);
    assert.deepEqual(secondSnapshot, firstSnapshot, "Canonical geometric scene metadata must be deterministic across reloads.");

    const screenshot = "base-geometric-renderer-thread24-chromium.png";
    await page.screenshot({path:path.join(artifactDir,screenshot),fullPage:true});
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(pageErrors, []);

    evidence = {
      schemaVersion:1,
      evidenceKind:"thread24_base_geometric_renderer_browser",
      candidate:{commit:process.env.GITHUB_SHA || git(["rev-parse","HEAD"]),tree:git(["rev-parse","HEAD^{tree}"])},
      browser:{engine:"chromium",version:browser.version()},
      label:"Sampled projection of X_0 onto the z_1 complex plane",
      geometricTruth:geoTruth,
      structuralTruth,
      markCount,
      deterministicReload:true,
      consoleErrors,
      pageErrors,
      screenshot,
      pass:true
    };
  } finally {
    await context.close();
    await browser.close();
    await close(server);
    if (evidence) fs.writeFileSync(path.join(artifactDir,"thread24-browser-evidence.json"), JSON.stringify(evidence,null,2)+"\n", "utf8");
  }
  console.log("Thread 24 Base Geometric Renderer browser verification: passed");
  console.log("validated X_0 sample marks: " + String(evidence.markCount));
  console.log("geometryRendered=true; sheets/covering/geometric zoom=false");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

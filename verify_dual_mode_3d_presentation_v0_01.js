"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = __dirname;
const artifactDir = path.join(root, "visual-hierarchy-browser-artifacts");
fs.mkdirSync(artifactDir, { recursive: true });
const git = (args) => childProcess.execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
function serve() {
  return http.createServer((request, response) => {
    const pathname = new URL(request.url || "/", "http://127.0.0.1").pathname;
    const file = path.resolve(root, pathname === "/" ? "index.html" : decodeURIComponent(pathname).replace(/^\/+/, ""));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return response.writeHead(404).end();
    const type = file.endsWith(".html") ? "text/html" : file.endsWith(".css") ? "text/css" : file.endsWith(".js") ? "text/javascript" : file.endsWith(".json") ? "application/json" : "application/octet-stream";
    response.writeHead(200, { "content-type": type, "cache-control": "no-store" }); fs.createReadStream(file).pipe(response);
  });
}

(async () => {
  const server = serve();
  const errors = [];
  let browser;
  let evidence;
  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    browser = await chromium.launch({ headless: true, executablePath: fs.existsSync(chrome) ? chrome : undefined });
    const page = await browser.newPage({ viewport: { width: 390, height: 500 } });
    await page.emulateMedia({ reducedMotion: "reduce" });
    page.on("pageerror", (error) => errors.push(error.message));
    const address = server.address();
    await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: "domcontentloaded" });
    const deferred = await page.evaluate(() => ({
      state: document.querySelector("#structural-3d-presentation")?.dataset.state,
      moduleRequested: performance.getEntriesByType("resource").some((entry) => entry.name.endsWith("/structural-3d-presentation.js"))
    }));
    assert.equal(deferred.state, "idle");
    assert.equal(deferred.moduleRequested, false, "3D module must not be requested before entering or starting the camera.");
    const idleCanvas = await page.locator("#structural-3d-presentation canvas").evaluate((canvas) => getComputedStyle(canvas).display);
    assert.equal(idleCanvas, "none", "The idle camera must show its loading guidance rather than a blank canvas.");
    const firstVisualScreenshot = "visual-hierarchy-first-390.png";
    await page.screenshot({ path: path.join(artifactDir, firstVisualScreenshot) });
    const entryPage = await browser.newPage({ viewport: { width: 390, height: 500 } });
    entryPage.on("pageerror", (error) => errors.push(error.message));
    await entryPage.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: "domcontentloaded" });
    await entryPage.locator("#structural-3d-presentation").scrollIntoViewIfNeeded();
    await entryPage.waitForFunction(() => document.querySelector("#structural-3d-presentation")?.dataset.state === "ready", null, { timeout: 10000 });
    const enteredCamera = await entryPage.evaluate(() => ({
      state: document.querySelector("#structural-3d-presentation")?.dataset.state,
      moduleRequested: performance.getEntriesByType("resource").some((entry) => entry.name.endsWith("/structural-3d-presentation.js"))
    }));
    assert.deepEqual(enteredCamera, { state: "ready", moduleRequested: true }, "Entering the camera region must load the optional 3D module.");
    await entryPage.close();
    await page.locator('[data-presentation-camera-action="activate"]').focus();
    await page.keyboard.press("Enter");
    try {
      await page.waitForFunction(() => document.querySelector("#structural-3d-presentation")?.dataset.state === "ready", null, { timeout: 10000 });
    } catch (error) {
      console.error("3D state:", await page.locator("#structural-3d-presentation").evaluate((element) => element.dataset), "page errors:", errors);
      throw error;
    }
    const simple = await page.locator("#structural-3d-presentation").evaluate((element) => ({ mode: element.dataset.mode, renderer: element.dataset.renderer, geometry: element.dataset.geometryRendered, reducedMotion: element.dataset.reducedMotion, canvas: element.querySelector("canvas")?.getBoundingClientRect().height }));
    assert.equal(simple.mode, "simple"); assert.ok(simple.renderer === "WebGPU" || simple.renderer === "WebGL2 fallback"); assert.equal(simple.geometry, "false"); assert.equal(simple.reducedMotion, "true"); assert.ok(simple.canvas >= 200);
    await page.locator('[data-ui-mode="expert"]').click();
    await page.locator("#structural-3d-presentation").waitFor({ state: "visible" });
    assert.equal(await page.locator("#structural-3d-presentation").getAttribute("data-mode"), "expert");
    assert.equal(await page.locator('[data-presentation-camera-action="save"]').isVisible(), true);
    await page.locator('[data-presentation-camera-action="save"]').click();
    assert.ok(await page.evaluate(() => localStorage.getItem("self-similar-cy-presentation-camera-pose-v1")));
    await page.locator('[data-presentation-camera-action="projection"]').focus(); await page.keyboard.press("Enter");
    assert.match(await page.locator("[data-presentation-camera-status]").textContent(), /orthographic/);
    await page.locator('[data-thread31-context="scoped-geometric"]').click();
    await page.locator("#ancestor-scoped-pullback-depth").selectOption("4"); await page.locator("#ancestor-scoped-pullback-render").click();
    await page.waitForFunction(() => document.querySelector("#ancestor-scoped-pullback-visualization")?.dataset.state === "over-cap");
    const cap = await page.locator("#structural-3d-presentation").evaluate((element) => ({ geometry: element.dataset.geometryRendered, sheets: element.dataset.sheetsMaterialized, count: element.dataset.nodeCount }));
    assert.deepEqual(cap, { geometry: "false", sheets: "false", count: "1" });
    await page.setViewportSize({ width: 1440, height: 900 });
    const wide = await page.locator("#structural-3d-presentation").evaluate((element) => ({ width: element.getBoundingClientRect().width, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }));
    assert.ok(wide.width <= 900); assert.equal(wide.overflow, false);
    await page.setViewportSize({ width: 390, height: 844 });
    const narrow = await page.locator("#structural-3d-presentation").evaluate((element) => ({ width: element.getBoundingClientRect().width, canvas: element.querySelector("canvas").getBoundingClientRect().width, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }));
    assert.ok(narrow.width <= 390); assert.ok(narrow.canvas > 0); assert.equal(narrow.overflow, false);
    assert.deepEqual(errors, []);
    const screenshot = "visual-hierarchy-chromium.png";
    await page.screenshot({ path: path.join(artifactDir, screenshot), fullPage: true });
    evidence = {
      schemaVersion: 1,
      evidenceKind: "visual_hierarchy_browser",
      candidate: process.env.GITHUB_SHA ? { commit: process.env.GITHUB_SHA, tree: git(["rev-parse", "HEAD^{tree}"]) } : null,
      workingTreeClean: childProcess.spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).stdout === "",
      browser: { engine: "chromium", version: browser.version() },
      deferred,
      enteredCamera,
      firstVisualScreenshot,
      simple,
      cap,
      wide,
      narrow,
      reducedMotion: true,
      keyboardActivation: true,
      errors,
      screenshot,
      pass: true
    };
    console.log("Dual-mode 3D presentation verifier: passed (1440px and 390px; camera, mode, fallback, no-generation, cap refusal)");
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
    if (evidence) fs.writeFileSync(path.join(artifactDir, "visual-hierarchy-browser-evidence.json"), JSON.stringify(evidence, null, 2) + "\n", "utf8");
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });

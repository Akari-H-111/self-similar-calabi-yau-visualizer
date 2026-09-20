"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium, firefox, webkit } = require("playwright");

const root = __dirname;
const artifactDir = path.join(root, "thread32-browser-artifacts");
fs.mkdirSync(artifactDir, { recursive: true });

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  return "application/octet-stream";
}

function createStaticServer() {
  return http.createServer((request, response) => {
    const url = new URL(request.url || "/", "http://127.0.0.1");
    const relative = (url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname).replace(/^\/+/, ""));
    const filePath = path.resolve(root, relative);
    if (!filePath.startsWith(root + path.sep) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      response.writeHead(404);
      response.end("not found");
      return;
    }
    response.writeHead(200, { "content-type": contentType(filePath), "cache-control": "no-store" });
    fs.createReadStream(filePath).pipe(response);
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address()));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

async function waitForReady(page) {
  await page.waitForFunction(() =>
    document.querySelector("#system-status")?.dataset.state === "ready" &&
    document.querySelector("#hybrid-navigation")?.dataset.state === "ready" &&
    document.querySelector("#hybrid-scoped-bridge")?.dataset.state === "ready" &&
    document.querySelector("#ancestor-scoped-pullback-status")?.dataset.state === "ready",
  null, { timeout: 30000 });
}

async function checkFirstVisit(page, engine, viewport) {
  await page.setViewportSize(viewport);
  const response = await page.goto(page.context()._thread32BaseUrl, { waitUntil: "domcontentloaded" });
  assert.ok(response?.ok(), engine + " root navigation must succeed.");
  await waitForReady(page);

  const result = await page.evaluate(() => {
    const hero = document.querySelector(".mode-hero").getBoundingClientRect();
    const controls = document.querySelector("#simple-exploration").getBoundingClientRect();
    return {
      heroHeight: Math.round(hero.height),
      controlsTop: Math.round(controls.top),
      simpleVisible: !document.querySelector("#simple-exploration").hidden,
      expertHidden: document.querySelector("#expert-workbench").hidden,
      canvasReady: Boolean(document.querySelector("#simple-canvas svg")),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });

  assert.equal(result.simpleVisible, true, engine + " must begin in simple mode.");
  assert.equal(result.expertHidden, true, engine + " must keep research controls out of simple mode.");
  assert.equal(result.canvasReady, true, engine + " must show the simple structural canvas.");
  assert.equal(result.horizontalOverflow, false, engine + " must not introduce page-level horizontal overflow at " + viewport.width + "px.");
  const practicalScanLimit = viewport.width <= 760 ? 1750 : 1000;
  assert.ok(result.controlsTop < practicalScanLimit, engine + " must expose the primary controls within the practical scan range.");

  return result;
}

async function checkKeyboardAndContexts(page) {
  const grow = page.locator("#simple-grow");
  await grow.focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#simple-layer-count").textContent(), "Layer 1");
  await page.locator("#simple-reset").focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#simple-layer-count").textContent(), "Layer 0");
  await page.locator('[data-ui-mode="expert"]').focus();
  await page.keyboard.press("Enter");
  await page.locator("#expert-workbench").waitFor({ state: "visible" });
  const historySummary = page.locator(".historical-context summary");
  await historySummary.focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(".historical-context").evaluate((element) => element.open), true);
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(".historical-context").evaluate((element) => element.open), false);

  await page.locator('[data-thread31-context="global-geometric"]').click();
  await page.waitForFunction(() => document.querySelector("#hybrid-scoped-bridge")?.dataset.contextMode === "global-geometric");
  let state = await page.locator("#hybrid-scoped-bridge").evaluate((element) => element.dataset);
  assert.equal(state.globalGeometricDepth, "1");
  assert.equal(state.scopedMaterialized, "false");

  await page.locator('[data-thread31-context="scoped-geometric"]').click();
  await page.waitForFunction(() => document.querySelector("#hybrid-scoped-bridge")?.dataset.contextMode === "scoped-geometric");
  state = await page.locator("#hybrid-scoped-bridge").evaluate((element) => element.dataset);
  assert.equal(state.scopedMaterialized, "false", "Context switching must not generate scoped geometry.");

  await page.locator("#ancestor-scoped-pullback-depth").selectOption("2");
  await page.locator("#ancestor-scoped-pullback-render").click();
  await page.waitForFunction(() => document.querySelector("#hybrid-scoped-bridge")?.dataset.scopedMaterializedDepth === "2");
  assert.equal(await page.locator("#ancestor-scoped-pullback-visualization .geometric-pullback-mark").count(), 256);

  await page.locator("#ancestor-scoped-pullback-depth").selectOption("4");
  await page.locator("#ancestor-scoped-pullback-render").click();
  await page.waitForFunction(() => document.querySelector("#ancestor-scoped-pullback-visualization")?.dataset.state === "over-cap");
  assert.equal(await page.locator("#ancestor-scoped-pullback-visualization .geometric-pullback-mark").count(), 0);
  assert.equal(await page.locator("#ancestor-scoped-pullback-visualization").getAttribute("data-required-point-count"), "65536");

  await page.locator('[data-thread31-context="structural"]').click();
  await page.waitForFunction(() => document.querySelector("#hybrid-scoped-bridge")?.dataset.contextMode === "structural");
  await page.locator('[data-camera-action="zoom-in"]').focus();
  await page.keyboard.press("Enter");
  const cameraStatus = await page.locator("#structural-camera-status").textContent();
  assert.ok(cameraStatus?.includes("Camera"), "Keyboard camera action must update its visible status.");

  const overlay = page.locator('input[data-arithmetic-overlay-id="coordinate_channels"]');
  await overlay.focus();
  const before = await overlay.isChecked();
  await page.keyboard.press("Space");
  assert.equal(await overlay.isChecked(), !before, "Keyboard overlay toggle must change the same control state as pointer input.");
}

async function checkChromiumPageScale(page) {
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  assert.equal(await page.evaluate(() => visualViewport.scale), 1);
  await client.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
  assert.equal(await page.evaluate(() => visualViewport.scale), 2);
  const globalContext = page.locator('[data-thread31-context="global-geometric"]');
  await globalContext.focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#hybrid-scoped-bridge")?.dataset.contextMode === "global-geometric");
  await client.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
}

(async () => {
  const server = createStaticServer();
  const evidence = { schemaVersion: 1, evidenceKind: "thread32_consolidation_browser", engines: [] };
  try {
    const address = await listen(server);
    const baseUrl = "http://127.0.0.1:" + String(address.port) + "/";
    const widths = [
      { width: 1440, height: 1000 },
      { width: 1024, height: 900 },
      { width: 768, height: 900 },
      { width: 390, height: 844 }
    ];
    for (const [engine, browserType] of [["chromium", chromium], ["firefox", firefox], ["webkit", webkit]]) {
      const browser = await browserType.launch({ headless: true });
      const context = await browser.newContext({ viewport: widths[0], colorScheme: "light" });
      const page = await context.newPage();
      page.context()._thread32BaseUrl = baseUrl;
      const consoleErrors = [];
      const pageErrors = [];
      page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      try {
        const viewportResults = [];
        for (const viewport of widths) viewportResults.push(await checkFirstVisit(page, engine, viewport));
        if (engine === "chromium") {
          await checkKeyboardAndContexts(page);
          await checkChromiumPageScale(page);
        }
        assert.deepEqual(consoleErrors, [], engine + " console errors must be empty.");
        assert.deepEqual(pageErrors, [], engine + " page errors must be empty.");
        evidence.engines.push({ engine, viewportResults, interaction: engine === "chromium" ? "keyboard, context, scoped generation, cap refusal, camera, overlay, page scale 100/200" : "first-visit responsive smoke", pass: true });
      } catch (error) {
        evidence.engines.push({ engine, error: error.stack || String(error), pass: false });
        throw error;
      } finally {
        await context.close();
        await browser.close();
      }
    }
    evidence.pass = evidence.engines.every((entry) => entry.pass);
    fs.writeFileSync(path.join(artifactDir, "thread32-browser-evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
    console.log("Thread 32 consolidation browser verification: passed");
    console.log("Chromium / Firefox / WebKit first-visit checks passed at 1440, 1024, 768, and 390px");
    console.log("Chromium keyboard/context/scoped-generation/cap-refusal/camera/overlay and 100/200 page-scale checks passed");
  } finally {
    await close(server);
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

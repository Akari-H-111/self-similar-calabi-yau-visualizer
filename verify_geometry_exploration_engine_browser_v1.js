"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = __dirname;
function server() {
  return http.createServer((request, response) => {
    const pathname = new URL(request.url || "/", "http://127.0.0.1").pathname;
    const file = path.resolve(root, decodeURIComponent(pathname === "/" ? "index.html" : pathname.slice(1)));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end("not found"); return; }
    response.writeHead(200, { "content-type": file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : file.endsWith(".json") ? "application/json" : "text/html", "cache-control": "no-store" });
    fs.createReadStream(file).pipe(response);
  });
}
function listen(instance) { return new Promise((resolve, reject) => { instance.once("error", reject); instance.listen(0, "127.0.0.1", () => resolve(instance.address().port)); }); }

(async () => {
  const instance = server(), port = await listen(instance), browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto("http://127.0.0.1:" + port + "/", { waitUntil: "networkidle" });
    await page.waitForFunction(() => ["ready", "error"].includes(document.querySelector("#geometry-explorer")?.dataset.state), null, { timeout: 20000 });
    assert.equal(await page.locator("#geometry-explorer").getAttribute("data-state"), "ready", "GPU fallback must reach a visible ready state");
    assert.equal(await page.locator("#geometry-explorer canvas").isVisible(), true);
    assert.match(await page.locator("[data-geometry-detail]").innerText(), /Declared parameter subfamily/);
    for (const mode of ["phase", "cloud", "structural", "slice"]) {
      await page.locator("[data-geometry-mode='" + mode + "']").click();
      await page.waitForFunction((wanted) => document.querySelector("#geometry-explorer")?.dataset.state === "ready" && document.querySelector("#geometry-explorer")?.dataset.mode === wanted, mode);
    }
    await page.locator("[data-geometry-parameter='lambda']").evaluate((input) => { input.value = "2"; input.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.waitForFunction(() => document.querySelector("#geometry-explorer")?.dataset.state === "ready" && document.querySelector("[data-geometry-detail]")?.textContent.includes("λ=2"));
    const png = path.join(root, "geometry-explorer-browser.png");
    await page.locator("#geometry-explorer").screenshot({ path: png });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#geometry-explorer").scrollIntoViewIfNeeded();
    assert.equal(await page.locator("#geometry-explorer canvas").isVisible(), true, "mobile layout must retain the render surface");
    assert.ok(await page.locator("#geometry-explorer").boundingBox());
    await page.locator("#geometry-explorer").screenshot({ path: path.join(root, "geometry-explorer-mobile.png") });
    assert.deepEqual(errors, []);
    console.log("Geometry exploration engine browser verification: passed");
    console.log("Screenshot: " + png);
  } finally {
    await browser.close();
    await new Promise((resolve) => instance.close(resolve));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });

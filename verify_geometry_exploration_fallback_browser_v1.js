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
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", { configurable: true, value: undefined });
    const nativeGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...rest) {
      if (["webgl", "webgl2", "experimental-webgl"].includes(type)) return null;
      return nativeGetContext.call(this, type, ...rest);
    };
  });
  const page = await context.newPage();
  try {
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.querySelector("#geometry-explorer")?.dataset.state === "error", null, { timeout: 20000 });
    const message = page.locator("[data-simple-geometry-error]");
    assert.equal(await message.getAttribute("hidden"), null, "Simple mode must expose renderer failure without opening Expert mode");
    const errorBox = await message.boundingBox();
    assert.ok(errorBox && errorBox.y < 844, "The renderer failure must be in the first mobile viewport.");
    assert.match(await message.innerText(), /Rendering unavailable: No WebGPU\/WebGL2 renderer could initialize/);
    assert.equal(await page.locator("#geometry-explorer .geometry-explorer__stage").isHidden(), true, "No renderer must leave a blank camera stage.");
    assert.match(await page.locator("[data-simple-geometry-caption]").innerText(), /3D view was not generated/);
    console.log("Geometry exploration fallback browser verification: visible Simple-mode renderer refusal passed");
  } finally {
    await browser.close();
    await new Promise((resolve) => instance.close(resolve));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });

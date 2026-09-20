"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const blob = (name) => {
  const body = fs.readFileSync(path.join(root, name));
  return crypto.createHash("sha1").update(Buffer.from(`blob ${body.length}\0`)).update(body).digest("hex");
};
const html = read("index.html");
const app = read("app.js");
const selectorRuntime = read("ancestor-scoped-pullback-visualization-runtime.js");
const cameraModule = read("structural-3d-presentation.js");
const cameraStyles = read("presentation-camera.css");

assert.equal((html.match(/data-thread31-context=/g) || []).length, 3, "one three-way primary representation selector is required");
assert.match(html, /Primary representation selector/);
assert.match(html, /<details class="representation-advanced">/);
assert.doesNotMatch(html.match(/<div id="hybrid-scoped-bridge"[\s\S]*?<\/div>\s*\n\s*<details class="representation-advanced">/)?.[0] || "", /<details[^>]*open/);
assert.match(html, /<details class="reference-panel">/);
assert.doesNotMatch(html, /<details class="reference-panel" open>/);
assert.match(html, /id="ancestor-scoped-pullback-ancestor-search" type="search"/);
const scopedSection = html.slice(html.indexOf('id="ancestor-scoped-pullback"'), html.indexOf("</section>", html.indexOf('id="ancestor-scoped-pullback"')));
assert.doesNotMatch(scopedSection, /<select id="ancestor-scoped-pullback-ancestor"/);
assert.doesNotMatch(selectorRuntime, /ancestorSelect\.appendChild/);
assert.doesNotMatch(selectorRuntime, /ancestorSelect\.innerHTML/);
assert.match(selectorRuntime, /slice\(0,24\)/);
assert.match(selectorRuntime, /admittedAncestorIds\.has\(selectedAncestorId\)/);
assert.match(selectorRuntime, /preflightScopedRequest/);
assert.match(selectorRuntime, /materializeScopedScene/);
assert.match(selectorRuntime, /zero partial marks are shown/);
assert.doesNotMatch(html, /<script type="module" src="structural-3d-presentation\.js"><\/script>/);
assert.match(html, /id="structural-3d-presentation" class="presentation-camera" data-state="idle"/);
assert.match(app, /import\("\.\/structural-3d-presentation\.js"\)/);
assert.match(app, /IntersectionObserver/);
assert.match(cameraModule, /WebGPURenderer/);
assert.match(cameraModule, /forceWebGL: true/);
assert.match(cameraModule, /OrbitControls/);
assert.match(cameraModule, /prefers-reduced-motion/);
assert.match(cameraModule, /geometryRendered = "false"/);
assert.match(cameraStyles, /\.presentation-camera canvas \{ display: none;/);
assert.match(cameraStyles, /\.presentation-camera\[data-state="ready"\] canvas \{ z-index: 1; display: block; \}/);
assert.doesNotMatch(cameraStyles, /data-state!="ready"/);
assert.equal(blob("data/system.json"), "f131c94d6c05a5537f6832a690e593a56fc3af7d", "canonical structural scene must remain unchanged");
assert.equal(blob("data/system.v2.json"), "0d598560134e45bd3ed2edec62120fa45649883c", "admitted geometric scene must remain unchanged");

console.log("Visual hierarchy maintenance verifier: passed");
console.log("Run verify_dual_mode_3d_presentation_v0_01.js in a Playwright-enabled environment for 1440px/390px, keyboard, and reduced-motion browser checks.");

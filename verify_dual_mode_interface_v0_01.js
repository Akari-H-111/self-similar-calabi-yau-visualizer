"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const html = read("index.html");
const app = read("app.js");
const shellStyles = read("app-shell.css");
const controlStyles = read("exploration-controls.css");

assert.match(html, /id="simple-exploration"/);
assert.match(html, /id="simple-grow"/);
assert.match(html, /id="simple-reset"/);
assert.match(html, /data-ui-mode="simple"/);
assert.match(html, /data-ui-mode="expert"/);
assert.match(html, /id="expert-workbench" hidden/);
assert.match(html, /not a complete global geometric shape/);
assert.match(app, /const SIMPLE_MAX_DEPTH = 4/);
assert.match(app, /function setUiMode\(mode/);
assert.match(app, /function resetSimpleExploration\(\)/);
assert.match(app, /syncSimpleCanvas\(\);/);
assert.match(app, /simpleGrowElement\.disabled = depth >= SIMPLE_MAX_DEPTH/);
assert.doesNotMatch(app.slice(app.indexOf("simpleGrowElement.addEventListener")), /AncestorScopedPullbackRuntime|ancestor-scoped-pullback-render/);
assert.match(shellStyles, /\.mode-bar/);
assert.match(controlStyles, /\.simple-canvas/);
console.log("Dual-mode interface verifier: passed");

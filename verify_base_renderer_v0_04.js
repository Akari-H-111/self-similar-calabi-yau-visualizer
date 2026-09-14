"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { SceneSpecError, validateAndNormalizeScene } = require("./scene-spec.js");
const { UNRESOLVED_STATUS, renderBaseScene } = require("./base-renderer.js");

const repositoryRoot = __dirname;
const canonicalScene = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "data", "system.json"), "utf8"));
const appSource = fs.readFileSync(path.join(repositoryRoot, "app.js"), "utf8");
const rendererSource = fs.readFileSync(path.join(repositoryRoot, "base-renderer.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repositoryRoot, "index.html"), "utf8");

function cloneScene(scene = canonicalScene) {
  return JSON.parse(JSON.stringify(scene));
}

function createTarget() {
  return { hidden: true, dataset: {}, textContent: "" };
}

function validateThenRender(rawScene, target) {
  const scene = validateAndNormalizeScene(rawScene);
  return renderBaseScene(scene, target);
}

const target = createTarget();
const model = validateThenRender(canonicalScene, target);

const versionMatch = /^v0\.(\d+)$/.exec(canonicalScene.version);
assert.ok(versionMatch, "Canonical scene version must use v0.<minor> metadata.");
assert.ok(Number(versionMatch[1]) >= 4, "Base renderer verifier requires version metadata at or after v0.04.");
assert.equal(model.kind, "base_scene");
assert.equal(model.status, UNRESOLVED_STATUS);
assert.equal(model.geometryRendered, false);
assert.equal(model.definingFunctionSymbol, "W");
assert.equal(model.definingFunctionRepresentation, "unresolved");
assert.equal(model.levelParameter, "lambda");
assert.equal(model.levelValue, 1);
assert.equal(target.hidden, false);
assert.equal(target.dataset.state, UNRESOLVED_STATUS);
assert.equal(target.dataset.geometryRendered, "false");
assert.match(target.textContent, /Base geometry not drawn/);
assert.match(target.textContent, /W has no concrete representation/);

const baseOnlyVariant = cloneScene();
baseOnlyVariant.mathematics.parameters.D = 3;
baseOnlyVariant.request.requestedDepth = 7;
const variantTarget = createTarget();
const variantModel = validateThenRender(baseOnlyVariant, variantTarget);
assert.equal(variantModel.message, model.message, "Base renderer must not depend on D or requestedDepth in Thread 03.");
assert.equal(variantModel.status, model.status);

const malformed = cloneScene();
delete malformed.mathematics.parameters.D;
const malformedTarget = createTarget();
assert.throws(
  () => validateThenRender(malformed, malformedTarget),
  (error) => error instanceof SceneSpecError
);
assert.deepEqual(malformedTarget, createTarget(), "Malformed input must be rejected before renderer state changes.");

const inventedW = cloneScene();
inventedW.mathematics.baseHypersurface.definingFunction.representation = "polynomial_ast";
const inventedTarget = createTarget();
assert.throws(
  () => validateThenRender(inventedW, inventedTarget),
  (error) => error instanceof SceneSpecError
);
assert.deepEqual(inventedTarget, createTarget(), "Invented W representation must never reach the renderer.");

assert.equal(Object.hasOwn(canonicalScene, "derived"), false);
assert.equal(Object.hasOwn(canonicalScene, "renderer"), false);

const validationCall = "SceneSpec.validateAndNormalizeScene(rawScene)";
const rendererCall = "BaseRenderer.renderBaseScene(scene, rendererElement)";
assert.ok(appSource.includes('fetch("data/system.json"'), "Thread 01 JSON loading path must remain present.");
assert.ok(appSource.indexOf(validationCall) >= 0, "app.js must validate the raw scene.");
assert.ok(appSource.indexOf(rendererCall) > appSource.indexOf(validationCall), "Renderer must start only after validation succeeds.");

const sceneSpecScript = '<script src="scene-spec.js" defer></script>';
const baseRendererScript = '<script src="base-renderer.js" defer></script>';
const appScript = '<script src="app.js" defer></script>';
assert.ok(indexSource.indexOf(sceneSpecScript) >= 0, "index.html must load scene-spec.js.");
assert.ok(indexSource.indexOf(baseRendererScript) > indexSource.indexOf(sceneSpecScript), "base-renderer.js must load after scene-spec.js.");
assert.ok(indexSource.indexOf(appScript) > indexSource.indexOf(baseRendererScript), "app.js must load after base-renderer.js.");
assert.ok(indexSource.includes('id="base-renderer"'), "index.html must expose a base renderer target.");

for (const forbiddenToken of ["SceneSpec", "pullbackMap", "requestedDepth", "sheetDegree", "metricScale", "WebGL", "THREE", "canvas", "<svg"]) {
  assert.equal(rendererSource.includes(forbiddenToken), false, `Base renderer must not contain ${forbiddenToken}.`);
}

console.log("base-renderer v0.04 verification: passed");
console.log(`renderer state: ${model.status}`);
console.log("geometry rendered: false (required while W representation is unresolved)");
console.log("validation-before-render smoke test: passed");
console.log("pullback/recursion scope guard: passed");

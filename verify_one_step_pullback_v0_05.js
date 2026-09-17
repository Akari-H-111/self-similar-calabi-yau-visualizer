"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { SceneSpecError, validateAndNormalizeScene } = require("./scene-spec.js");
const { renderBaseScene } = require("./base-renderer.js");
const {
  ONE_STEP_DEPTH,
  UNRESOLVED_STATUS,
  renderOneStepPullback
} = require("./one-step-pullback.js");

const repositoryRoot = __dirname;
const canonicalScene = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "data", "system.json"), "utf8"));
const appSource = fs.readFileSync(path.join(repositoryRoot, "app.js"), "utf8");
const pullbackSource = fs.readFileSync(path.join(repositoryRoot, "one-step-pullback.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repositoryRoot, "index.html"), "utf8");

function cloneScene(scene = canonicalScene) {
  return JSON.parse(JSON.stringify(scene));
}

function createTarget() {
  return { hidden: true, dataset: {}, textContent: "" };
}

function validateThenRender(rawScene, baseTarget, pullbackTarget) {
  const scene = validateAndNormalizeScene(rawScene);
  const baseModel = renderBaseScene(scene, baseTarget);
  const pullbackModel = renderOneStepPullback(scene, baseModel, pullbackTarget);
  return { scene, baseModel, pullbackModel };
}

const baseTarget = createTarget();
const pullbackTarget = createTarget();
const { scene, pullbackModel } = validateThenRender(canonicalScene, baseTarget, pullbackTarget);

const versionMatch = /^v0\.(\d+)$/.exec(canonicalScene.version);
assert.ok(versionMatch, "Canonical scene version must use v0.<minor> metadata.");
assert.ok(Number(versionMatch[1]) >= 5, "One-step verifier requires version metadata at or after v0.05.");
assert.equal(ONE_STEP_DEPTH, 1);
assert.equal(pullbackModel.kind, "one_step_pullback");
assert.equal(pullbackModel.depth, 1);
assert.equal(pullbackModel.relation, "inverse_image");
assert.equal(pullbackModel.sourceKind, "base_scene");
assert.equal(pullbackModel.pullbackMapKind, scene.mathematics.pullbackMap.kind);
assert.equal(pullbackModel.coordinateCount, scene.mathematics.pullbackMap.coordinateCount);
assert.equal(pullbackModel.exponentParameter, scene.mathematics.pullbackMap.exponentParameter);
assert.equal(pullbackModel.exponentValue, scene.mathematics.parameters[scene.mathematics.pullbackMap.exponentParameter]);
assert.equal(pullbackModel.mapDegree, scene.derived.sheetDegree);
assert.equal(pullbackModel.mapDegree, 16);
assert.equal(pullbackModel.status, UNRESOLVED_STATUS);
assert.equal(pullbackModel.geometryRendered, false);
assert.equal(pullbackModel.sheetsMaterialized, false);
assert.equal(pullbackTarget.hidden, false);
assert.equal(pullbackTarget.dataset.state, UNRESOLVED_STATUS);
assert.equal(pullbackTarget.dataset.depth, "1");
assert.equal(pullbackTarget.dataset.geometryRendered, "false");
assert.equal(pullbackTarget.dataset.sheetsMaterialized, "false");
assert.ok(pullbackTarget.textContent.includes("X_1 = P_D^{-1}(X)"));
assert.match(pullbackTarget.textContent, /no sheets are materialized/i);

const highDepthVariant = cloneScene();
highDepthVariant.request.requestedDepth = 9;
const highDepthResult = validateThenRender(highDepthVariant, createTarget(), createTarget());
assert.equal(highDepthResult.pullbackModel.depth, 1, "requestedDepth > 1 must not materialize depth >= 2 in Thread 04.");
assert.equal(highDepthResult.pullbackModel.mapDegree, 16);
assert.equal(highDepthResult.pullbackModel.sheetsMaterialized, false);

const changedDVariant = cloneScene();
changedDVariant.mathematics.parameters.D = 3;
const changedDResult = validateThenRender(changedDVariant, createTarget(), createTarget());
assert.equal(changedDResult.pullbackModel.exponentValue, 3, "Exponent value must come from the structured exponentParameter declaration.");
assert.equal(changedDResult.pullbackModel.mapDegree, 81, "D^4 runtime metadata must reuse normalized derived.sheetDegree.");
assert.equal(changedDResult.pullbackModel.depth, 1);

const malformed = cloneScene();
delete malformed.mathematics.parameters.D;
const malformedBaseTarget = createTarget();
const malformedPullbackTarget = createTarget();
assert.throws(
  () => validateThenRender(malformed, malformedBaseTarget, malformedPullbackTarget),
  (error) => error instanceof SceneSpecError
);
assert.deepEqual(malformedBaseTarget, createTarget(), "Malformed input must be rejected before base renderer state changes.");
assert.deepEqual(malformedPullbackTarget, createTarget(), "Malformed input must be rejected before pullback state changes.");

const inventedW = cloneScene();
inventedW.mathematics.baseHypersurface.definingFunction.representation = "polynomial_ast";
assert.throws(
  () => validateThenRender(inventedW, createTarget(), createTarget()),
  (error) => error instanceof SceneSpecError
);

assert.equal(Object.hasOwn(canonicalScene, "derived"), false, "D^4 must remain derived, not canonical JSON input.");
assert.equal(Object.hasOwn(canonicalScene, "pullback"), false, "One-step state must not be persisted into canonical JSON.");

const validationCall = "SceneSpec.validateAndNormalizeScene(rawScene)";
const baseRendererCall = "BaseRenderer.renderBaseScene(scene, rendererElement)";
const pullbackCall = "OneStepPullback.renderOneStepPullback(scene, baseModel, pullbackElement)";
assert.ok(appSource.includes('fetch("data/system.json"'), "Thread 01 JSON loading path must remain present.");
assert.ok(appSource.indexOf(validationCall) >= 0, "app.js must validate raw scene input.");
assert.ok(appSource.indexOf(baseRendererCall) > appSource.indexOf(validationCall), "Base renderer must run after validation.");
assert.ok(appSource.indexOf(pullbackCall) > appSource.indexOf(baseRendererCall), "One-step pullback must run after the validated Base Renderer.");

const sceneSpecScript = '<script src="scene-spec.js" defer></script>';
const baseRendererScript = '<script src="base-renderer.js" defer></script>';
const pullbackScript = '<script src="one-step-pullback.js" defer></script>';
const appScript = '<script src="app.js" defer></script>';
assert.ok(indexSource.indexOf(sceneSpecScript) >= 0);
assert.ok(indexSource.indexOf(baseRendererScript) > indexSource.indexOf(sceneSpecScript));
assert.ok(indexSource.indexOf(pullbackScript) > indexSource.indexOf(baseRendererScript));
assert.ok(indexSource.indexOf(appScript) > indexSource.indexOf(pullbackScript));
assert.ok(indexSource.includes('id="one-step-pullback"'));

assert.equal(pullbackSource.includes("requestedDepth"), false, "Thread 04 must not turn requestedDepth into recursive materialization.");
assert.equal(pullbackSource.includes('"coordinate_power"'), false, "Pullback map kind must come from validated scene data, not a second hard-coded source.");
assert.equal(pullbackSource.includes("parameters.D"), false, "Exponent value must be resolved through exponentParameter, not a duplicated D lookup.");
assert.equal(pullbackSource.includes("** 4"), false, "D^4 must not be recomputed as a second source of truth.");

for (const forbiddenToken of ["children", "recursive", "lazy", "WebGL", "THREE", "canvas", "<svg", "sheetObjects"]) {
  assert.equal(pullbackSource.includes(forbiddenToken), false, `One-step module must not contain ${forbiddenToken}.`);
}

console.log("one-step pullback v0.05 verification: passed");
console.log("materialized structural depth: 1");
console.log(`pullback geometry state: ${pullbackModel.status}`);
console.log(`D^4 runtime metadata: ${pullbackModel.mapDegree} (no sheet objects materialized; no map-degree theorem claimed)`);
console.log("requestedDepth recursion guard: passed");

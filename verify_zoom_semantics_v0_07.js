"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { SceneSpecError, validateAndNormalizeScene } = require("./scene-spec.js");
const { renderBaseScene } = require("./base-renderer.js");
const { renderOneStepPullback } = require("./one-step-pullback.js");
const {
  createRecursiveLazyExpansionModel,
  expandOneLevel,
  renderRecursiveLazyExpansion
} = require("./recursive-lazy-expansion.js");
const {
  MODEL_KIND,
  FOCUSED_STATUS,
  NOT_MATERIALIZED_STATUS,
  createZoomFocusModel,
  renderZoomSemantics
} = require("./zoom-semantics.js");

const repositoryRoot = __dirname;
const canonicalScene = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "data", "system.json"), "utf8"));
const appSource = fs.readFileSync(path.join(repositoryRoot, "app.js"), "utf8");
const zoomSource = fs.readFileSync(path.join(repositoryRoot, "zoom-semantics.js"), "utf8");
const recursiveSource = fs.readFileSync(path.join(repositoryRoot, "recursive-lazy-expansion.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repositoryRoot, "index.html"), "utf8");

function cloneScene(scene = canonicalScene) {
  return JSON.parse(JSON.stringify(scene));
}

function createTarget() {
  return { hidden: true, dataset: {}, textContent: "" };
}

function initialize(rawScene, focusDepth = 0) {
  const baseTarget = createTarget();
  const pullbackTarget = createTarget();
  const recursiveTarget = createTarget();
  const zoomTarget = createTarget();
  const scene = validateAndNormalizeScene(rawScene);
  const baseModel = renderBaseScene(scene, baseTarget);
  const pullbackModel = renderOneStepPullback(scene, baseModel, pullbackTarget);
  const recursiveModel = createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel);
  renderRecursiveLazyExpansion(recursiveModel, recursiveTarget);
  const zoomModel = createZoomFocusModel(scene, recursiveModel, focusDepth);
  renderZoomSemantics(zoomModel, zoomTarget);
  return { scene, baseModel, pullbackModel, recursiveModel, zoomModel, targets: { baseTarget, pullbackTarget, recursiveTarget, zoomTarget } };
}

const versionMatch = /^v0\.(\d+)$/.exec(canonicalScene.version);
assert.ok(versionMatch, "Canonical scene version must use v0.<minor> metadata.");
assert.ok(Number(versionMatch[1]) >= 7, "Zoom verifier requires version metadata at or after v0.07.");

const caseA = initialize(canonicalScene, 0);
assert.equal(caseA.zoomModel.kind, MODEL_KIND);
assert.equal(caseA.recursiveModel.requestedDepth, 0);
assert.equal(caseA.recursiveModel.materializedDepth, 0);
assert.equal(caseA.zoomModel.requestedDepth, 0);
assert.equal(caseA.zoomModel.availableDepth, 0);
assert.equal(caseA.zoomModel.requestedFocusDepth, 0);
assert.equal(caseA.zoomModel.focusedDepth, 0);
assert.equal(caseA.zoomModel.focusStatus, FOCUSED_STATUS);
assert.equal(caseA.zoomModel.focusAvailable, true);
assert.deepEqual(caseA.zoomModel.formalMetricScaleExpression, { baseScale: 4, exponent: 0 });
assert.equal(caseA.zoomModel.formalMetricScaleSource, "scene.derived.metricScale");
assert.equal(caseA.zoomModel.geometricZoomApplied, false);
assert.equal(caseA.zoomModel.cameraTransformApplied, false);
assert.equal(caseA.zoomModel.materializationTriggered, false);
assert.equal(caseA.targets.zoomTarget.dataset.focusedDepth, "0");
assert.equal(caseA.targets.zoomTarget.dataset.availableDepth, "0");
assert.equal(caseA.targets.zoomTarget.dataset.geometricZoomApplied, "false");

const caseAUnavailable = createZoomFocusModel(caseA.scene, caseA.recursiveModel, 1);
assert.equal(caseAUnavailable.requestedFocusDepth, 1);
assert.equal(caseAUnavailable.focusedDepth, null);
assert.equal(caseAUnavailable.focusStatus, NOT_MATERIALIZED_STATUS);
assert.equal(caseAUnavailable.focusAvailable, false);
assert.equal(caseAUnavailable.availableDepth, 0);
assert.equal(caseAUnavailable.materializationTriggered, false);
assert.equal(caseAUnavailable.formalMetricScaleExpression, null);
assert.strictEqual(caseA.recursiveModel.materializedDepth, 0);

const depthOneScene = cloneScene();
depthOneScene.request.requestedDepth = 1;
const caseB = initialize(depthOneScene, 1);
assert.equal(caseB.recursiveModel.materializedDepth, 1);
assert.equal(caseB.zoomModel.focusedDepth, 1);
assert.equal(caseB.zoomModel.focusStatus, FOCUSED_STATUS);
assert.equal(caseB.zoomModel.availableDepth, 1);
assert.equal(caseB.zoomModel.requestedDepth, 1);
assert.deepEqual(caseB.zoomModel.formalMetricScaleExpression, { baseScale: 4, exponent: 1 });
assert.equal(caseB.recursiveModel.levels[0].depth, 1);
assert.equal(caseB.recursiveModel.levels[0].relation, "inverse_image");

const depthThreeScene = cloneScene();
depthThreeScene.request.requestedDepth = 3;
const depthThreeInitial = initialize(depthThreeScene, 1);
assert.equal(depthThreeInitial.recursiveModel.materializedDepth, 1);
assert.equal(depthThreeInitial.zoomModel.focusedDepth, 1);

const unavailableDepthTwo = createZoomFocusModel(depthThreeInitial.scene, depthThreeInitial.recursiveModel, 2);
assert.equal(unavailableDepthTwo.focusedDepth, null);
assert.equal(unavailableDepthTwo.focusStatus, NOT_MATERIALIZED_STATUS);
assert.equal(unavailableDepthTwo.availableDepth, 1);
assert.equal(unavailableDepthTwo.requestedDepth, 3);
assert.equal(unavailableDepthTwo.materializationTriggered, false);
assert.equal(depthThreeInitial.recursiveModel.materializedDepth, 1, "Zoom must not materialize depth 2.");

const explicitlyExpandedDepthTwo = expandOneLevel(depthThreeInitial.recursiveModel);
assert.equal(explicitlyExpandedDepthTwo.materializedDepth, 2);
assert.equal(depthThreeInitial.recursiveModel.materializedDepth, 1, "Explicit recursion expansion remains immutable.");
const focusedDepthTwo = createZoomFocusModel(depthThreeInitial.scene, explicitlyExpandedDepthTwo, 2);
assert.equal(focusedDepthTwo.focusedDepth, 2);
assert.equal(focusedDepthTwo.availableDepth, 2);
assert.equal(focusedDepthTwo.requestedDepth, 3);
assert.deepEqual(focusedDepthTwo.formalMetricScaleExpression, { baseScale: 4, exponent: 2 });

const stillUnavailableDepthThree = createZoomFocusModel(depthThreeInitial.scene, explicitlyExpandedDepthTwo, 3);
assert.equal(stillUnavailableDepthThree.focusedDepth, null);
assert.equal(stillUnavailableDepthThree.focusStatus, NOT_MATERIALIZED_STATUS);
assert.equal(stillUnavailableDepthThree.availableDepth, 2);

const outsideRequest = createZoomFocusModel(caseB.scene, caseB.recursiveModel, 2);
assert.equal(outsideRequest.withinRequestedDepth, false);
assert.equal(outsideRequest.focusedDepth, null);
assert.equal(outsideRequest.requestedDepth, 1);
assert.equal(caseB.recursiveModel.requestedDepth, 1);

const changedDScene = cloneScene();
changedDScene.mathematics.parameters.D = 3;
changedDScene.request.requestedDepth = 2;
const changedDInitial = initialize(changedDScene, 1);
const changedDDepthTwo = expandOneLevel(changedDInitial.recursiveModel);
const changedDFocus = createZoomFocusModel(changedDInitial.scene, changedDDepthTwo, 2);
assert.equal(changedDInitial.scene.derived.metricScale, 9);
assert.equal(changedDInitial.scene.derived.sheetDegree, 81);
assert.deepEqual(changedDFocus.formalMetricScaleExpression, { baseScale: 9, exponent: 2 });
assert.equal(changedDFocus.formalMetricScaleExpression.baseScale, changedDInitial.scene.derived.metricScale);
assert.equal(changedDFocus.geometricZoomApplied, false);

assert.throws(() => createZoomFocusModel(caseA.scene, caseA.recursiveModel, -1), TypeError);
assert.throws(() => createZoomFocusModel(caseA.scene, caseA.recursiveModel, 0.5), TypeError);

const malformed = cloneScene();
delete malformed.mathematics.parameters.D;
const untouchedZoomTarget = createTarget();
assert.throws(() => {
  const scene = validateAndNormalizeScene(malformed);
  const baseModel = renderBaseScene(scene, createTarget());
  const pullbackModel = renderOneStepPullback(scene, baseModel, createTarget());
  const recursiveModel = createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel);
  renderZoomSemantics(createZoomFocusModel(scene, recursiveModel, 0), untouchedZoomTarget);
}, (error) => error instanceof SceneSpecError);
assert.deepEqual(untouchedZoomTarget, createTarget(), "Malformed scene must be rejected before zoom target changes.");

assert.equal(Object.hasOwn(canonicalScene, "zoom"), false);
assert.equal(Object.hasOwn(canonicalScene, "focus"), false);
assert.equal(Object.hasOwn(canonicalScene, "derived"), false);
assert.equal(caseA.scene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");
assert.equal(caseA.baseModel.geometryRendered, false);
assert.equal(caseA.pullbackModel.geometryRendered, false);
assert.equal(caseA.pullbackModel.sheetsMaterialized, false);
assert.equal(caseA.recursiveModel.geometryRendered, false);
assert.equal(caseA.recursiveModel.sheetsMaterialized, false);

const validationCall = "SceneSpec.validateAndNormalizeScene(rawScene)";
const baseCall = "BaseRenderer.renderBaseScene(scene, rendererElement)";
const pullbackCall = "OneStepPullback.renderOneStepPullback(scene, baseModel, pullbackElement)";
const recursiveCreateCall = "RecursiveLazyExpansion.createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel)";
const recursiveRenderCall = "RecursiveLazyExpansion.renderRecursiveLazyExpansion(recursiveModel, recursiveElement)";
const zoomCreateCall = "ZoomSemantics.createZoomFocusModel(scene, recursiveModel, 0)";
const zoomRenderCall = "ZoomSemantics.renderZoomSemantics(zoomModel, zoomElement)";
assert.ok(appSource.includes('fetch("data/system.json"'));
assert.ok(appSource.indexOf(validationCall) >= 0);
assert.ok(appSource.indexOf(baseCall) > appSource.indexOf(validationCall));
assert.ok(appSource.indexOf(pullbackCall) > appSource.indexOf(baseCall));
assert.ok(appSource.indexOf(recursiveCreateCall) > appSource.indexOf(pullbackCall));
assert.ok(appSource.indexOf(recursiveRenderCall) > appSource.indexOf(recursiveCreateCall));
assert.ok(appSource.indexOf(zoomCreateCall) > appSource.indexOf(recursiveRenderCall));
assert.ok(appSource.indexOf(zoomRenderCall) > appSource.indexOf(zoomCreateCall));
assert.equal(appSource.includes("expandOneLevel("), false, "Zoom initialization must not eagerly expand recursion.");

const sceneSpecScript = '<script src="scene-spec.js" defer></script>';
const baseScript = '<script src="base-renderer.js" defer></script>';
const pullbackScript = '<script src="one-step-pullback.js" defer></script>';
const recursiveScript = '<script src="recursive-lazy-expansion.js" defer></script>';
const zoomScript = '<script src="zoom-semantics.js" defer></script>';
const appScript = '<script src="app.js" defer></script>';
assert.ok(indexSource.indexOf(sceneSpecScript) >= 0);
assert.ok(indexSource.indexOf(baseScript) > indexSource.indexOf(sceneSpecScript));
assert.ok(indexSource.indexOf(pullbackScript) > indexSource.indexOf(baseScript));
assert.ok(indexSource.indexOf(recursiveScript) > indexSource.indexOf(pullbackScript));
assert.ok(indexSource.indexOf(zoomScript) > indexSource.indexOf(recursiveScript));
assert.ok(indexSource.indexOf(appScript) > indexSource.indexOf(zoomScript));
assert.ok(indexSource.includes('id="zoom-semantics"'));

assert.equal(zoomSource.includes("validateAndNormalizeScene"), false, "Zoom layer must not create a second scene validator.");
assert.equal(zoomSource.includes("SceneSpec"), false, "Zoom layer consumes an upstream normalized scene.");
assert.equal(zoomSource.includes("expandOneLevel"), false, "Zoom layer must not materialize recursion.");
assert.equal(zoomSource.includes("parameters.D"), false, "Zoom layer must not create a second D source.");
assert.equal(zoomSource.includes("** 2"), false, "Zoom layer must not recompute D^2.");
assert.equal(zoomSource.includes("** 4"), false, "Zoom layer must not recompute or reinterpret D^4.");
assert.equal(zoomSource.includes("derived.sheetDegree"), false, "D^4 must not be used as a zoom factor.");
assert.ok(zoomSource.includes("scene.derived.metricScale"), "Formal scale metadata must reuse the normalized D^2 source.");
assert.equal(recursiveSource.includes("zoom"), false, "Recursive engine must remain zoom-agnostic.");

for (const forbiddenToken of [
  "sheetObjects",
  "points",
  "mesh",
  "implicitSurface",
  "THREE",
  "WebGL",
  "canvas",
  "<svg",
  "perspective",
  "orthographic",
  "cameraMatrix",
  "projectionMatrix",
  "viewportTransform"
]) {
  assert.equal(zoomSource.includes(forbiddenToken), false, `Zoom semantics must not contain ${forbiddenToken}.`);
}

console.log("zoom semantics v0.07 verification: passed");
console.log("zoom semantics: structural focus/navigation only; geometric zoom and camera transforms remain false");
console.log("focus boundary: unavailable depths return not_materialized without recursive expansion");
console.log("D^2 role: formal scale metadata reuses scene.derived.metricScale; no D^2/D^4 recomputation");
console.log("requestedDepth/materializedDepth/focusedDepth separation: passed");

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const SceneSpec = require("./scene-spec.js");
const BaseRenderer = require("./base-renderer.js");
const OneStepPullback = require("./one-step-pullback.js");
require("./recursive-lazy-expansion.js");
require("./zoom-semantics.js");
require("./sheet-branch-organization.js");
const InteractivePullbackTower = require("./interactive-pullback-tower.js");
const StructuralVisualization = require("./structural-visualization.js");
const StructuralCamera = require("./structural-camera.js");
const repositoryRoot = __dirname;
const canonicalRawScene = require("./data/system.json");

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function gitBlobSha(source) {
  const body = Buffer.from(source, "utf8");
  return crypto.createHash("sha1").update(`blob ${String(body.length)}\0`).update(body).digest("hex");
}

function assertFiniteViewBox(camera) {
  const viewBox = StructuralCamera.getCameraViewBox(camera);
  assert.equal(viewBox.kind, StructuralCamera.VIEW_KIND);
  for (const [label, value] of Object.entries(viewBox)) {
    if (label === "kind") continue;
    assert.equal(Number.isFinite(value), true, `${label} must remain finite.`);
  }
  assert.ok(viewBox.width > 0, "Camera viewBox width must remain positive.");
  assert.ok(viewBox.height > 0, "Camera viewBox height must remain positive.");
  assert.doesNotMatch(StructuralCamera.serializeCameraViewBox(camera), /NaN|Infinity/);
  return viewBox;
}

function assertPresentationTruth(camera, expectedTransform) {
  assert.equal(camera.kind, StructuralCamera.MODEL_KIND);
  assert.equal(camera.presentationOnly, true);
  assert.equal(camera.scaleSemantic, "presentation_camera_scale");
  assert.equal(camera.cameraTransformApplied, expectedTransform);
  assert.deepEqual(camera.truthfulness, {
    cameraTransformApplied: expectedTransform,
    geometricZoomApplied: false,
    geometryRendered: false,
    sheetsMaterialized: false,
    coveringStructureClaimed: false
  });
}

function createRuntimeFixture(depth) {
  const scene = SceneSpec.validateAndNormalizeScene(canonicalRawScene);
  const baseModel = BaseRenderer.createBaseRenderModel(scene);
  const oneStepModel = OneStepPullback.createOneStepPullbackModel(scene, baseModel);
  let interactionModel = InteractivePullbackTower.createInteractivePullbackTowerModel(scene, baseModel, oneStepModel);
  for (let index = 0; index < depth; index += 1) {
    interactionModel = InteractivePullbackTower.expandOrReveal(interactionModel);
  }

  const visualizationModel = StructuralVisualization.createStructuralVisualizationModel(
    scene,
    baseModel,
    interactionModel.recursiveModel,
    interactionModel.zoomModel,
    interactionModel.organizationModel,
    interactionModel
  );
  const layoutDescriptor = StructuralVisualization.createStructuralLayoutDescriptor(visualizationModel);
  return { scene, baseModel, oneStepModel, interactionModel, visualizationModel, layoutDescriptor };
}

assert.equal(canonicalRawScene.version, "v0.12");
assert.equal(canonicalRawScene.request.requestedDepth, 0, "Thread 15 must not modify canonical requestedDepth.");
assert.equal(canonicalRawScene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

const depthZero = createRuntimeFixture(0);
assert.equal(depthZero.layoutDescriptor.kind, StructuralVisualization.LAYOUT_KIND);
assert.deepEqual(depthZero.layoutDescriptor.canonicalViewBox, { x: 0, y: 0, width: 960, height: 430 });
assert.equal(depthZero.layoutDescriptor.levelBounds.length, 1);
assert.deepEqual(depthZero.layoutDescriptor.levelBounds[0], {
  depth: 0,
  x: 92,
  y: 128,
  width: 300,
  height: 72
});

const canonicalViewBox = depthZero.layoutDescriptor.canonicalViewBox;
const initialA = StructuralCamera.createStructuralCameraModel({
  canonicalViewBox,
  contentBounds: depthZero.layoutDescriptor.contentBounds
});
const initialB = StructuralCamera.createStructuralCameraModel({
  canonicalViewBox,
  contentBounds: depthZero.layoutDescriptor.contentBounds
});
assert.deepEqual(initialA, initialB, "Initial structural camera state must be deterministic.");
assertPresentationTruth(initialA, false);
assert.deepEqual(assertFiniteViewBox(initialA), {
  kind: StructuralCamera.VIEW_KIND,
  x: 0,
  y: 0,
  width: 960,
  height: 430
});

const initialSnapshot = JSON.stringify(initialA);
const panned = StructuralCamera.panCamera(initialA, 20, 10);
assert.equal(JSON.stringify(initialA), initialSnapshot, "Camera transitions must not mutate previous immutable state.");
assertPresentationTruth(panned, true);
assert.equal(panned.centerX, 500);
assert.equal(panned.centerY, 225);
assert.deepEqual(assertFiniteViewBox(panned), {
  kind: StructuralCamera.VIEW_KIND,
  x: 20,
  y: 10,
  width: 960,
  height: 430
});

const zoomed = StructuralCamera.zoomCamera(initialA, 2, 240, 107.5);
assertPresentationTruth(zoomed, true);
assert.equal(zoomed.cameraScale, 2);
assert.deepEqual(assertFiniteViewBox(zoomed), {
  kind: StructuralCamera.VIEW_KIND,
  x: 120,
  y: 53.75,
  width: 480,
  height: 215
});

const fakeSurface = {
  dataset: {},
  attributes: {},
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
};
StructuralCamera.applyStructuralCamera(zoomed, fakeSurface);
assert.equal(fakeSurface.attributes.viewBox, StructuralCamera.serializeCameraViewBox(zoomed));
assert.equal(fakeSurface.dataset.cameraState, "transformed");
assert.equal(fakeSurface.dataset.cameraScale, "2");
assert.equal(fakeSurface.dataset.cameraTransformApplied, "true");
assert.equal(fakeSurface.dataset.geometricZoomApplied, "false");

const maxZoom = StructuralCamera.zoomCamera(initialA, 1e9);
assert.equal(maxZoom.cameraScale, initialA.maxScale, "Zoom must clamp to maxScale.");
assertFiniteViewBox(maxZoom);
const minZoom = StructuralCamera.zoomCamera(initialA, 1e-9);
assert.equal(minZoom.cameraScale, initialA.minScale, "Zoom must clamp to minScale.");
assertFiniteViewBox(minZoom);

const fitted = StructuralCamera.fitCameraToBounds(
  initialA,
  { x: 100, y: 100, width: 300, height: 100 },
  { padding: 20 }
);
assertPresentationTruth(fitted, true);
assert.equal(fitted.centerX, 250);
assert.equal(fitted.centerY, 150);
assert.ok(fitted.cameraScale > 1);
assertFiniteViewBox(fitted);

const levelFit = StructuralCamera.fitCameraToLevel(initialA, depthZero.layoutDescriptor, 0, { padding: 24 });
assert.equal(levelFit.centerX, 242);
assert.equal(levelFit.centerY, 164);
assertPresentationTruth(levelFit, true);
assertFiniteViewBox(levelFit);

const visibleFit = StructuralCamera.fitCameraToVisibleStructure(initialA, { padding: 0 });
assert.deepEqual(visibleFit, initialA, "Fit-visible with zero padding over the canonical visible extent must equal reset identity.");

const reset = StructuralCamera.resetCamera(panned);
assert.deepEqual(reset, initialA, "Reset must deterministically restore the current canonical camera identity.");
assertPresentationTruth(reset, false);

const depthThree = createRuntimeFixture(3);
assert.deepEqual(depthThree.visualizationModel.nodes.map((node) => node.depth), [0, 1, 2, 3]);
assert.ok(depthThree.layoutDescriptor.canonicalViewBox.height > canonicalViewBox.height);
assert.equal(depthThree.layoutDescriptor.levelBounds.length, 4);

const reconciledIdentity = StructuralCamera.reconcileCameraExtent(
  initialA,
  depthThree.layoutDescriptor.canonicalViewBox,
  depthThree.layoutDescriptor.contentBounds
);
assertPresentationTruth(reconciledIdentity, false);
assert.deepEqual(assertFiniteViewBox(reconciledIdentity), {
  kind: StructuralCamera.VIEW_KIND,
  x: 0,
  y: 0,
  width: depthThree.layoutDescriptor.canonicalViewBox.width,
  height: depthThree.layoutDescriptor.canonicalViewBox.height
});

const transformedBeforeRerender = StructuralCamera.zoomCamera(initialA, 2);
const interactionFingerprintBefore = JSON.stringify(depthThree.interactionModel);
const reconciledTransform = StructuralCamera.reconcileCameraExtent(
  transformedBeforeRerender,
  depthThree.layoutDescriptor.canonicalViewBox,
  depthThree.layoutDescriptor.contentBounds
);
assertPresentationTruth(reconciledTransform, true);
assert.equal(reconciledTransform.cameraScale, transformedBeforeRerender.cameraScale, "Transformed camera scale must survive structural extent changes.");
assert.equal(reconciledTransform.centerX, transformedBeforeRerender.centerX, "Transformed camera X center must survive structural extent changes when still valid.");
assert.equal(reconciledTransform.centerY, transformedBeforeRerender.centerY, "Transformed camera Y center must survive structural extent changes when still valid.");
assert.equal(JSON.stringify(depthThree.interactionModel), interactionFingerprintBefore, "Camera reconciliation must not mutate interaction state.");
assertFiniteViewBox(reconciledTransform);

const focusedDepth = depthThree.interactionModel.focusedDepth;
const selectedDepth = depthThree.interactionModel.selectedDepth;
const fitFocused = StructuralCamera.fitCameraToLevel(reconciledTransform, depthThree.layoutDescriptor, focusedDepth, { padding: 24 });
const fitSelected = StructuralCamera.fitCameraToLevel(reconciledTransform, depthThree.layoutDescriptor, selectedDepth, { padding: 24 });
assertFiniteViewBox(fitFocused);
assertFiniteViewBox(fitSelected);
assert.equal(JSON.stringify(depthThree.interactionModel), interactionFingerprintBefore, "Fit commands may read focus/selection metadata but must not modify it.");

for (const invalidFactory of [
  () => StructuralCamera.createStructuralCameraModel({ canonicalViewBox: { x: NaN, y: 0, width: 960, height: 430 } }),
  () => StructuralCamera.createStructuralCameraModel({ canonicalViewBox: { x: 0, y: 0, width: Infinity, height: 430 } }),
  () => StructuralCamera.createStructuralCameraModel({ canonicalViewBox: { x: 0, y: 0, width: 0, height: 430 } }),
  () => StructuralCamera.createStructuralCameraModel({ canonicalViewBox, minScale: 1.1 }),
  () => StructuralCamera.createStructuralCameraModel({ canonicalViewBox, maxScale: 0.9 }),
  () => StructuralCamera.createStructuralCameraModel({ canonicalViewBox, minScale: 3, maxScale: 2 })
]) {
  assert.throws(invalidFactory, /finite|greater than zero|scale bounds/i);
}

assert.throws(() => StructuralCamera.panCamera(initialA, NaN, 0), /finite/);
assert.throws(() => StructuralCamera.panCamera(initialA, 0, Infinity), /finite/);
assert.throws(() => StructuralCamera.zoomCamera(initialA, 0), /greater than zero/);
assert.throws(() => StructuralCamera.zoomCamera(initialA, Infinity), /finite/);
assert.throws(() => StructuralCamera.zoomCamera(initialA, 2, NaN, 0), /finite/);
assert.throws(() => StructuralCamera.fitCameraToBounds(initialA, { x: -1, y: 0, width: 20, height: 20 }), /content bounds/);
assert.throws(() => StructuralCamera.fitCameraToBounds(initialA, { x: 0, y: 0, width: 20, height: 20 }, { padding: -1 }), /zero or greater/);
assert.throws(() => StructuralCamera.fitCameraToLevel(initialA, { levelBounds: [] }, 1), /No camera layout bounds/);
assert.throws(() => StructuralCamera.fitCameraToLevel(initialA, depthZero.layoutDescriptor, -1), /non-negative integer/);
assert.throws(() => StructuralCamera.reconcileCameraExtent(initialA, { x: 0, y: 0, width: 960, height: 0 }), /greater than zero/);

const sealedRuntimeBlobs = {
  "scene-spec.js": "20471ef6fab0a685faee956f07a35d82e9a95ba5",
  "base-renderer.js": "fea92139c2a8514f01b9bb187f27bf0131dd4114",
  "one-step-pullback.js": "5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js": "0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js": "9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js": "cecf0f06aa23404a65a6093f705a4fe56be65029",
  "arithmetic-overlays.js": "bfc7331e07b8e12d4b14790ae5a4bc096042544c",
  "exposition-layer.js": "ce6210842cf653db56f67d0a7b682be893258f8a",
  "interactive-pullback-tower.js": "657262aab1db8e49e903e3e83d4a033586e2f8bd"
};
for (const [relativePath, expectedSha] of Object.entries(sealedRuntimeBlobs)) {
  assert.equal(gitBlobSha(read(relativePath)), expectedSha, `${relativePath} must remain byte-for-byte sealed in Thread 15.`);
}

const cameraSource = read("structural-camera.js");
assert.match(cameraSource, /presentation_camera_scale/);
assert.match(cameraSource, /cameraTransformApplied/);
assert.match(cameraSource, /geometricZoomApplied:\s*false/);
assert.match(cameraSource, /reconcileCameraExtent/);
assert.match(cameraSource, /fitCameraToLevel/);
assert.match(cameraSource, /applyStructuralCamera/);
assert.doesNotMatch(cameraSource, /metricScale/);
for (const forbiddenSourcePattern of [
  /require\s*\(/,
  /RecursiveLazyExpansion/,
  /InteractivePullbackTower/,
  /ZoomSemantics/,
  /SheetBranchOrganization/,
  /StructuralVisualization/,
  /requestedDepth/,
  /materializedDepth/,
  /selectedDepth/,
  /focusedDepth/,
  /collapsedDepth/,
  /createLevelDescriptor\s*\(/,
  /expandOneLevel\s*\(/,
  /D\s*\*\*\s*2/,
  /D\s*\*\*\s*4/,
  /Math\.pow/,
  /metricScale/,
  /sheetDegree/,
  /sheetObjects/,
  /fiberGeometry/,
  /coveringMap/,
  /getContext\s*\(/,
  /WebGL/,
  /THREE\./
]) {
  assert.doesNotMatch(cameraSource, forbiddenSourcePattern, "Structural camera must remain a presentation-only viewport state machine.");
}

const structuralSource = read("structural-visualization.js");
assert.match(structuralSource, /LAYOUT_KIND/);
assert.match(structuralSource, /createStructuralLayoutDescriptor/);
assert.match(structuralSource, /levelBounds/);
assert.doesNotMatch(structuralSource, /StructuralCamera/, "Structural visualization must expose layout metadata without becoming the camera engine.");

const appSource = read("app.js");
assert.match(appSource, /let structuralCameraModel = null/);
assert.match(appSource, /StructuralCamera\.createStructuralCameraModel/);
assert.match(appSource, /StructuralCamera\.reconcileCameraExtent/);
assert.match(appSource, /StructuralCamera\.fitCameraToLevel/);
assert.match(appSource, /StructuralCamera\.zoomCamera/);
assert.match(appSource, /StructuralCamera\.panCamera/);
assert.match(appSource, /StructuralCamera\.applyStructuralCamera\(structuralCameraModel, surface\)/);
assert.match(appSource, /addEventListener\("wheel", handleStructuralCameraWheel, \{ passive: false \}\)/);
assert.match(appSource, /addEventListener\("pointerdown", handleStructuralCameraPointerDown\)/);
assert.match(appSource, /addEventListener\("pointermove", handleStructuralCameraPointerMove\)/);
assert.match(appSource, /addEventListener\("pointerup", handleStructuralCameraPointerEnd\)/);
assert.match(appSource, /data\.system|data\/system\.json/);
assert.doesNotMatch(appSource, /scene\.request\.requestedDepth\s*=/, "Camera integration must not rewrite canonical scene request state.");
assert.doesNotMatch(appSource, /D\s*\*\*\s*2|D\s*\*\*\s*4|Math\.pow/, "Camera integration must not recompute D²/D⁴ metadata.");

const indexSource = read("index.html");
assert.ok(indexSource.includes('src="structural-camera.js"'));
assert.ok(indexSource.includes('id="structural-camera"'));
assert.ok(indexSource.includes('id="structural-camera-controls"'));
assert.ok(indexSource.includes('data-camera-action="zoom-in"'));
assert.ok(indexSource.includes('data-camera-action="zoom-out"'));
assert.ok(indexSource.includes('data-camera-action="fit-visible"'));
assert.ok(indexSource.includes('data-camera-action="fit-selected"'));
assert.ok(indexSource.includes('data-camera-action="fit-focused"'));
assert.ok(indexSource.includes('data-camera-action="reset"'));
assert.match(indexSource, /camera transform or geometric zoom/i, "Legacy Thread 14 separation wording must remain explicit.");
assert.match(indexSource, /presentation-only structural camera/i);
assert.match(indexSource, /camera scale is presentation-only viewport state/i);

const styleSource = read("style.css");
assert.match(styleSource, /\.structural-camera-toolbar/);
assert.match(styleSource, /touch-action:\s*none/);
assert.match(styleSource, /cursor:\s*grab/);
assert.match(styleSource, /data-camera-dragging="true"/);
assert.match(styleSource, /min-width:\s*0/, "Camera viewport must remain responsive instead of retaining the old 760px scroll surface floor.");

const workflowSource = read(".github/workflows/formal-verification.yml");
assert.ok(workflowSource.includes("node verify_structural_camera_zoom_v0_16.js"));
assert.ok(workflowSource.includes("node --check structural-camera.js"));
assert.ok(workflowSource.includes("node --check verify_structural_camera_zoom_v0_16.js"));
assert.ok(workflowSource.includes("structural-camera.js"), "Publication/static checks must include the camera source once it is wired into index.html.");

console.log("Structural camera / zoom v0.16 verification: passed");
console.log("camera state: persistent immutable presentation model");
console.log("inputs: buttons + wheel + pointer pan/pinch");
console.log("structural rerender persistence: verified against real layout descriptors");
console.log("shared SVG viewport adapter: verified");
console.log("interaction/recursion mutation by camera: NO");
console.log("geometric zoom / geometry / sheets / covering promotion: NO");

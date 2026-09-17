"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

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

assert.equal(canonicalRawScene.version, "v0.12");
assert.equal(canonicalRawScene.request.requestedDepth, 0, "Thread 15 must not modify canonical requestedDepth.");
assert.equal(canonicalRawScene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

const canonicalViewBox = Object.freeze({ x: 0, y: 0, width: 960, height: 430 });
const initialA = StructuralCamera.createStructuralCameraModel({ canonicalViewBox });
const initialB = StructuralCamera.createStructuralCameraModel({ canonicalViewBox });
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

const layoutDescriptor = Object.freeze({
  levelBounds: Object.freeze([
    Object.freeze({ depth: 0, x: 92, y: 128, width: 300, height: 72 }),
    Object.freeze({ depth: 1, x: 92, y: 244, width: 300, height: 72 })
  ])
});
const levelFit = StructuralCamera.fitCameraToLevel(initialA, layoutDescriptor, 1, { padding: 24 });
assert.equal(levelFit.centerX, 242);
assert.equal(levelFit.centerY, 280);
assertPresentationTruth(levelFit, true);
assertFiniteViewBox(levelFit);

const visibleFit = StructuralCamera.fitCameraToVisibleStructure(initialA, { padding: 0 });
assert.deepEqual(visibleFit, initialA, "Fit-visible with zero padding over canonical content must equal reset identity.");

const reset = StructuralCamera.resetCamera(panned);
assert.deepEqual(reset, initialA, "Reset must deterministically restore the current canonical camera identity.");
assertPresentationTruth(reset, false);

const tallerViewBox = Object.freeze({ x: 0, y: 0, width: 960, height: 662 });
const reconciledIdentity = StructuralCamera.reconcileCameraExtent(initialA, tallerViewBox);
assertPresentationTruth(reconciledIdentity, false);
assert.deepEqual(assertFiniteViewBox(reconciledIdentity), {
  kind: StructuralCamera.VIEW_KIND,
  x: 0,
  y: 0,
  width: 960,
  height: 662
});

const transformedBeforeRerender = StructuralCamera.zoomCamera(initialA, 2);
const reconciledTransform = StructuralCamera.reconcileCameraExtent(transformedBeforeRerender, tallerViewBox);
assertPresentationTruth(reconciledTransform, true);
assert.equal(reconciledTransform.cameraScale, transformedBeforeRerender.cameraScale, "Transformed camera scale must survive structural extent changes.");
assert.equal(reconciledTransform.centerX, transformedBeforeRerender.centerX, "Transformed camera X center must survive structural extent changes when still valid.");
assert.equal(reconciledTransform.centerY, transformedBeforeRerender.centerY, "Transformed camera Y center must survive structural extent changes when still valid.");
assertFiniteViewBox(reconciledTransform);

const interactionSentinel = Object.freeze({
  requestedDepth: 3,
  materializedDepth: 3,
  selectedDepth: 2,
  focusedDepth: 1,
  collapsedDepth: null,
  levels: Object.freeze([0, 1, 2, 3])
});
const interactionFingerprint = JSON.stringify(interactionSentinel);
let isolatedCamera = StructuralCamera.createStructuralCameraModel({ canonicalViewBox });
isolatedCamera = StructuralCamera.panCamera(isolatedCamera, 15, 25);
isolatedCamera = StructuralCamera.zoomCamera(isolatedCamera, 1.5);
isolatedCamera = StructuralCamera.fitCameraToLevel(isolatedCamera, layoutDescriptor, 0);
isolatedCamera = StructuralCamera.resetCamera(isolatedCamera);
assert.equal(JSON.stringify(interactionSentinel), interactionFingerprint, "Camera operations must remain isolated from interaction/recursion metadata.");

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
assert.throws(() => StructuralCamera.fitCameraToLevel(initialA, layoutDescriptor, -1), /non-negative integer/);
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

console.log("Structural camera / zoom v0.16 verification: passed");

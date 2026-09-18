"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const InfiniteNavigationRenderer = require("./infinite-navigation-renderer.js");
const canonicalScene = require("./data/system.json");

const repositoryRoot = __dirname;

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function gitBlobSha(source) {
  const body = Buffer.from(source, "utf8");
  return crypto.createHash("sha1").update("blob " + String(body.length) + "\0").update(body).digest("hex");
}

function assertTruthfulness(state) {
  assert.deepEqual(state.truthfulness, {
    geometryRendered: false,
    sheetsMaterialized: false,
    coveringStructureClaimed: false,
    geometricZoomApplied: false,
    semanticMaterializationTriggered: false
  });
}

assert.equal(canonicalScene.request.requestedDepth, 0);
assert.equal(canonicalScene.mathematics.parameters.D, 2);
assert.equal(canonicalScene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

const sealedSemanticBlobs = {
  "scene-spec.js": "20471ef6fab0a685faee956f07a35d82e9a95ba5",
  "one-step-pullback.js": "5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js": "0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js": "9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js": "cecf0f06aa23404a65a6093f705a4fe56be65029",
  "arithmetic-overlays.js": "bfc7331e07b8e12d4b14790ae5a4bc096042544c"
};

for (const [relativePath, expectedSha] of Object.entries(sealedSemanticBlobs)) {
  assert.equal(gitBlobSha(read(relativePath)), expectedSha, relativePath + " must remain byte-identical to the sealed semantic baseline.");
}

const snapshot = InfiniteNavigationRenderer.createSnapshot({
  semanticMaterializedDepth: 10000,
  presentationVisibleDepth: 10000,
  selectedDepth: 0,
  focusedDepth: 0,
  collapsedDepth: null
});

const first = InfiniteNavigationRenderer.createStateFromSnapshot(snapshot, null, {
  anchorDepth: 10000
});
assert.equal(first.kind, InfiniteNavigationRenderer.MODEL_KIND);
assert.equal(first.semanticMaterializedDepth, 10000);
assert.equal(first.presentationVisibleDepth, 10000);
assert.equal(first.virtualAnchorDepth, 10000);
assert.ok(first.activeRenderedDepthCount <= first.configuredActiveBound);
assert.ok(first.activeRenderedDepths.includes(0));
assert.ok(first.activeRenderedDepths.includes(10000));
assert.equal(first.presentationPool.activeBindingCount, first.activeRenderedDepthCount);
assert.ok(first.presentationPool.poolSize <= first.configuredActiveBound);
assertTruthfulness(first);

const deterministic = InfiniteNavigationRenderer.createStateFromSnapshot(snapshot, null, {
  anchorDepth: 10000
});
assert.deepEqual(deterministic, first, "Identical state/input must produce identical render state.");

const shifted = InfiniteNavigationRenderer.createStateFromSnapshot(snapshot, first, {
  anchorDepth: 5000
});
assert.ok(shifted.presentationPool.recycledCount > 0, "Shifting the viewport must recycle presentation slots.");
assert.equal(shifted.presentationPool.poolSize, first.presentationPool.poolSize, "Fixed viewport policy must not monotonically grow the pool.");
assert.ok(shifted.activeRenderedDepthCount <= shifted.configuredActiveBound);
for (const binding of shifted.presentationPool.bindings) {
  assert.deepEqual(Object.keys(binding).sort(), ["boundDepth", "slotId"], "Recycled bindings must be rebuilt without stale presentation metadata.");
}
assertTruthfulness(shifted);

const collapsed = InfiniteNavigationRenderer.createStateFromSnapshot({
  semanticMaterializedDepth: 10000,
  presentationVisibleDepth: 5000,
  selectedDepth: 4000,
  focusedDepth: 4500,
  collapsedDepth: 5000
}, shifted, {
  anchorDepth: 4500
});
assert.ok(collapsed.activeRenderedDepths.includes(0));
assert.ok(collapsed.activeRenderedDepths.includes(4000));
assert.ok(collapsed.activeRenderedDepths.includes(4500));
assert.ok(collapsed.activeRenderedDepthCount <= collapsed.configuredActiveBound);

const deepDepth = Number.MAX_SAFE_INTEGER - 32;
const deepState = InfiniteNavigationRenderer.createStateFromSnapshot({
  semanticMaterializedDepth: deepDepth,
  presentationVisibleDepth: deepDepth,
  selectedDepth: deepDepth,
  focusedDepth: deepDepth,
  collapsedDepth: null
}, null, {
  anchorDepth: deepDepth
});
assert.ok(deepState.activeRenderedDepthCount <= deepState.configuredActiveBound);
assert.equal(deepState.virtualAnchorDepth, deepDepth);
const deepDescription = InfiniteNavigationRenderer.describeVirtualDepth(deepState, deepDepth);
assert.equal(deepDescription.relativeDepthExact, "0");
assert.equal(deepDescription.localOffset, 0);
assert.equal(deepDescription.currentlyRendered, true);
assertTruthfulness(deepState);

const farDescription = InfiniteNavigationRenderer.describeVirtualDepth(deepState, 0);
assert.equal(farDescription.semanticMaterialized, true);
assert.equal(farDescription.presentationVisible, true);
assert.equal(typeof farDescription.relativeDepthExact, "string");
assert.equal(farDescription.localCoordinateAvailable, false, "Far virtual positions must stay symbolic instead of forcing an unsafe SVG coordinate.");

const target = {dataset: {}};
InfiniteNavigationRenderer.applyRendererStateToTarget(deepState, target);
assert.equal(target.dataset.geometryRendered, "false");
assert.equal(target.dataset.sheetsMaterialized, "false");
assert.equal(target.dataset.coveringStructureClaimed, "false");
assert.equal(target.dataset.geometricZoomApplied, "false");
assert.equal(target.dataset.activeRenderedDepthCount, String(deepState.activeRenderedDepthCount));

const source = read("infinite-navigation-renderer.js");
assert.doesNotMatch(source, /depth\s*>\s*(1000|10000)/, "Production renderer must not impose a shallow hard-coded maximum depth.");
assert.doesNotMatch(source, /Math\.pow\s*\(/, "Renderer must not expand deep symbolic degree powers.");

console.log("Infinite-navigation renderer v0.19 verifier: passed");

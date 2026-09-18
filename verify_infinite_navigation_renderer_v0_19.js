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
const BranchOrganizationGraphics = require("./branch-organization-graphics.js");
const ArithmeticOverlays = require("./arithmetic-overlays.js");
const ArithmeticOverlayGraphics = require("./arithmetic-overlay-graphics.js");
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
assert.ok(shifted.presentationPool.poolSize <= shifted.configuredActiveBound, "Presentation pool high-water mark must remain viewport-policy bounded.");
assert.ok(shifted.activeRenderedDepthCount <= shifted.configuredActiveBound);
const roundTripEdge = InfiniteNavigationRenderer.createStateFromSnapshot(snapshot, shifted, {
  anchorDepth: 10000
});
const roundTripMiddle = InfiniteNavigationRenderer.createStateFromSnapshot(snapshot, roundTripEdge, {
  anchorDepth: 5000
});
assert.equal(
  roundTripMiddle.presentationPool.poolSize,
  shifted.presentationPool.poolSize,
  "Repeated navigation after reaching the bounded high-water mark must not monotonically grow the pool."
);
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

const runtimeScene = SceneSpec.validateAndNormalizeScene(canonicalScene);
const baseModel = BaseRenderer.createBaseRenderModel(runtimeScene);
const oneStepModel = OneStepPullback.createOneStepPullbackModel(runtimeScene, baseModel);
let interactionModel = InteractivePullbackTower.createInteractivePullbackTowerModel(
  runtimeScene,
  baseModel,
  oneStepModel
);
for (let index = 0; index < 64; index += 1) {
  interactionModel = InteractivePullbackTower.expandOrReveal(interactionModel);
}
assert.equal(interactionModel.materializedDepth, 64);
assert.equal(interactionModel.recursiveModel.levels.length, 64);

let integratedState = InfiniteNavigationRenderer.createInfiniteNavigationRendererState(
  interactionModel,
  null,
  {anchorDepth: 64}
);
const structuralOptions = InfiniteNavigationRenderer.createStructuralPresentationOptions(integratedState);
const interactionOptions = InfiniteNavigationRenderer.createInteractionPresentationOptions(integratedState);

const structuralModel = StructuralVisualization.createStructuralVisualizationModel(
  runtimeScene,
  baseModel,
  interactionModel.recursiveModel,
  interactionModel.zoomModel,
  interactionModel.organizationModel,
  interactionModel,
  structuralOptions
);
assert.deepEqual(
  structuralModel.nodes.map((node) => node.depth),
  integratedState.activeRenderedDepths,
  "Structural SVG model must materialize only the deterministic active render set."
);
assert.ok(structuralModel.nodes.length <= integratedState.configuredActiveBound);
assert.equal(structuralModel.renderState.virtualized, true);
assert.equal(structuralModel.sceneState.materializedDepth, 64);
assert.equal(interactionModel.recursiveModel.levels.length, 64, "Viewport pruning must not mutate retained semantic levels.");

const layout = StructuralVisualization.createStructuralLayoutDescriptor(structuralModel);
assert.equal(layout.levelBounds.length, integratedState.activeRenderedDepthCount);
assert.ok(layout.levelBounds.some((level) => level.depth === interactionModel.focusedDepth));
assert.ok(layout.levelBounds.some((level) => level.depth === 0));

const structuralTarget = {dataset: {}, hidden: true, innerHTML: ""};
StructuralVisualization.renderStructuralVisualization(structuralModel, structuralTarget);
InfiniteNavigationRenderer.applyRendererStateToTarget(integratedState, structuralTarget);
assert.equal((structuralTarget.innerHTML.match(/data-structural-node-depth=/g) || []).length, integratedState.activeRenderedDepthCount);
assert.equal(structuralTarget.dataset.renderVirtualized, "true");
assert.match(structuralTarget.innerHTML, /data-frontier-status="view_pruned"|requested structural frontier reached/, "Virtualized SVG must distinguish view-pruned continuation from semantic frontier completion.");

const interactionTarget = {dataset: {}, hidden: true, innerHTML: ""};
InteractivePullbackTower.renderInteractivePullbackTower(
  interactionModel,
  interactionTarget,
  interactionOptions
);
assert.equal((interactionTarget.innerHTML.match(/data-level-depth=/g) || []).length, integratedState.activeRenderedDepthCount);
assert.equal(interactionTarget.dataset.renderVirtualized, "true");

const branchGraphics = BranchOrganizationGraphics.createBranchOrganizationGraphicsModel(
  interactionModel.organizationModel,
  layout.levelBounds
);
for (const badge of branchGraphics.badges) {
  assert.ok(integratedState.activeRenderedDepths.includes(badge.sourceDepth));
  assert.ok(integratedState.activeRenderedDepths.includes(badge.targetDepth));
  assert.equal(badge.targetDepth, badge.sourceDepth + 1);
}
assert.equal(branchGraphics.truthfulness.geometryRendered, false);
assert.equal(branchGraphics.truthfulness.sheetsMaterialized, false);
assert.equal(branchGraphics.truthfulness.coveringStructureClaimed, false);

const overlayModel = ArithmeticOverlays.createArithmeticOverlayModel(
  runtimeScene,
  interactionModel.recursiveModel,
  interactionModel.zoomModel,
  interactionModel.organizationModel,
  [
    ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS,
    ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
  ]
);
const overlayGraphics = ArithmeticOverlayGraphics.createArithmeticOverlayGraphicsModel(
  overlayModel,
  layout
);
assert.equal(overlayGraphics.truthfulness.geometryRendered, false);
assert.equal(overlayGraphics.truthfulness.sheetsMaterialized, false);
assert.equal(overlayGraphics.truthfulness.coveringStructureClaimed, false);
assert.equal(overlayGraphics.truthfulness.geometricZoomApplied, false);

interactionModel = InteractivePullbackTower.selectDepth(interactionModel, 60);
interactionModel = InteractivePullbackTower.refocusDepth(interactionModel, 60);
integratedState = InfiniteNavigationRenderer.createInfiniteNavigationRendererState(
  interactionModel,
  integratedState,
  {anchorDepth: 60}
);
assert.ok(integratedState.activeRenderedDepths.includes(60));
assert.ok(integratedState.activeRenderedDepths.includes(59), "Focused/selected predecessor must be retained for aligned D4 branch graphics.");
assert.ok(integratedState.presentationPool.recycledCount > 0);
assert.equal(interactionModel.selectedDepth, 60);
assert.equal(interactionModel.focusedDepth, 60);

interactionModel = InteractivePullbackTower.collapseSelected(interactionModel);
assert.equal(interactionModel.materializedDepth, 64);
assert.equal(interactionModel.recursiveModel.levels.length, 64);
assert.equal(interactionModel.presentation.visibleDepth, 60);
integratedState = InfiniteNavigationRenderer.createInfiniteNavigationRendererState(
  interactionModel,
  integratedState,
  {anchorDepth: 60}
);
assert.equal(integratedState.semanticMaterializedDepth, 64);
assert.equal(integratedState.presentationVisibleDepth, 60);
assert.ok(integratedState.activeRenderedDepthCount <= integratedState.configuredActiveBound);

console.log("Infinite-navigation renderer v0.19 verifier: passed");

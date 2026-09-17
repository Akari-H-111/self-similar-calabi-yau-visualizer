"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const SceneSpec = require("./scene-spec.js");
const BaseRenderer = require("./base-renderer.js");
const OneStepPullback = require("./one-step-pullback.js");
const RecursiveLazyExpansion = require("./recursive-lazy-expansion.js");
const ZoomSemantics = require("./zoom-semantics.js");
const SheetBranchOrganization = require("./sheet-branch-organization.js");
const InteractivePullbackTower = require("./interactive-pullback-tower.js");
const StructuralVisualization = require("./structural-visualization.js");

const repositoryRoot = __dirname;
const canonicalRawScene = require("./data/system.json");

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function gitBlobSha(source) {
  const body = Buffer.from(source, "utf8");
  return crypto.createHash("sha1").update(`blob ${String(body.length)}\0`).update(body).digest("hex");
}

function createInitialState() {
  const scene = SceneSpec.validateAndNormalizeScene(canonicalRawScene);
  const baseModel = BaseRenderer.createBaseRenderModel(scene);
  const oneStepModel = OneStepPullback.createOneStepPullbackModel(scene, baseModel);
  const interactionModel = InteractivePullbackTower.createInteractivePullbackTowerModel(
    scene,
    baseModel,
    oneStepModel
  );
  return { scene, baseModel, oneStepModel, interactionModel };
}

function assertTruthfulness(state) {
  assert.deepEqual(state.truthfulness, {
    geometryRendered: false,
    sheetsMaterialized: false,
    coveringStructureClaimed: false,
    geometricZoomApplied: false,
    cameraTransformApplied: false,
    W: "unresolved"
  });
  assert.equal(state.recursiveModel.geometryRendered, false);
  assert.equal(state.recursiveModel.sheetsMaterialized, false);
  assert.equal(state.zoomModel.geometricZoomApplied, false);
  assert.equal(state.zoomModel.cameraTransformApplied, false);
  assert.equal(state.zoomModel.materializationTriggered, false);
  assert.equal(state.organizationModel.geometryRendered, false);
  assert.equal(state.organizationModel.sheetsMaterialized, false);
  assert.equal(state.organizationModel.coveringStructureClaimed, false);
  assert.equal(state.organizationModel.materializationTriggered, false);
}

function assertStateConsistency(state) {
  assert.equal(state.kind, InteractivePullbackTower.MODEL_KIND);
  assert.equal(state.sourceScene.request.requestedDepth, 0, "Canonical scene request must remain unchanged.");
  assert.equal(state.sourceRequestedDepth, 0, "Interaction state must retain the canonical source request separately.");
  assert.equal(state.runtimeScene.request.requestedDepth, state.requestedDepth);
  assert.equal(state.recursiveModel.requestedDepth, state.requestedDepth);
  assert.equal(state.recursiveModel.materializedDepth, state.materializedDepth);
  assert.equal(state.zoomModel.availableDepth, state.materializedDepth);
  assert.equal(state.zoomModel.focusedDepth, state.focusedDepth);
  assert.equal(state.organizationModel.materializedDepth, state.materializedDepth);
  assert.equal(state.organizationModel.focusedDepth, state.focusedDepth);
  assert.ok(state.selectedDepth <= state.presentation.visibleDepth);
  assert.ok(state.focusedDepth <= state.presentation.visibleDepth);
  assert.ok(state.presentation.visibleDepth <= state.materializedDepth);
  assert.equal(state.presentation.hiddenMaterializedLevels, state.materializedDepth - state.presentation.visibleDepth);
  assert.equal(state.breadcrumb.at(-1).depth, Math.max(state.selectedDepth, state.focusedDepth));
  assert.equal(state.breadcrumb.filter((item) => item.selected).length, 1);
  assert.equal(state.breadcrumb.filter((item) => item.focused).length, 1);
  assert.equal(state.breadcrumb.find((item) => item.selected).depth, state.selectedDepth);
  assert.equal(state.breadcrumb.find((item) => item.focused).depth, state.focusedDepth);
  assertTruthfulness(state);
}

assert.equal(canonicalRawScene.version, "v0.12");
assert.equal(canonicalRawScene.request.requestedDepth, 0, "Thread 14 must not edit canonical requestedDepth to manufacture deeper levels.");
assert.equal(canonicalRawScene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

const initialA = createInitialState();
const initialB = createInitialState();
assert.deepEqual(initialA.interactionModel, initialB.interactionModel, "Initial interaction model must be deterministic.");

let state = initialA.interactionModel;
assertStateConsistency(state);
assert.equal(state.requestedDepth, 0);
assert.equal(state.materializedDepth, 0);
assert.equal(state.selectedDepth, 0);
assert.equal(state.focusedDepth, 0);
assert.equal(state.presentation.visibleDepth, 0);
assert.equal(state.transition.structuralDescriptorMaterializationTriggered, false);

assert.throws(
  () => InteractivePullbackTower.selectDepth(state, 1),
  /materialized and presentation-visible/,
  "Unmaterialized selection must be rejected."
);
assert.throws(
  () => InteractivePullbackTower.refocusDepth(state, 1),
  /materialized and presentation-visible/,
  "Unmaterialized focus must be rejected without expansion."
);
assert.equal(state.materializedDepth, 0, "Rejected focus/selection must not mutate the previous immutable state.");

state = InteractivePullbackTower.expandOrReveal(state);
assertStateConsistency(state);
assert.equal(state.requestedDepth, 1);
assert.equal(state.materializedDepth, 1);
assert.equal(state.selectedDepth, 0);
assert.equal(state.focusedDepth, 0);
assert.equal(state.transition.outcome, "materialized_next_structural_level");
assert.equal(state.transition.structuralDescriptorMaterializationTriggered, true);
assert.equal(state.transition.geometricMaterializationTriggered, false);
assert.equal(state.transition.sheetMaterializationTriggered, false);

state = InteractivePullbackTower.selectDepth(state, 1);
assertStateConsistency(state);
assert.equal(state.selectedDepth, 1);
assert.equal(state.materializedDepth, 1);
assert.equal(state.transition.structuralDescriptorMaterializationTriggered, false);

state = InteractivePullbackTower.refocusDepth(state, 0);
assertStateConsistency(state);
assert.equal(state.focusedDepth, 0);
assert.equal(state.selectedDepth, 1);
assert.equal(state.materializedDepth, 1);
assert.equal(state.transition.structuralDescriptorMaterializationTriggered, false);

state = InteractivePullbackTower.expandOrReveal(state);
assertStateConsistency(state);
assert.equal(state.requestedDepth, 2);
assert.equal(state.materializedDepth, 2);
assert.equal(state.selectedDepth, 1);
assert.equal(state.focusedDepth, 0);
assert.equal(state.transition.structuralDescriptorMaterializationTriggered, true);

state = InteractivePullbackTower.refocusDepth(state, 1);
assertStateConsistency(state);
assert.equal(state.focusedDepth, 1);
assert.equal(state.materializedDepth, 2);
assert.equal(state.transition.structuralDescriptorMaterializationTriggered, false);

const beforeCollapseLevels = state.recursiveModel.levels;
state = InteractivePullbackTower.collapseSelected(state);
assertStateConsistency(state);
assert.equal(state.presentation.collapsed, true);
assert.equal(state.presentation.collapsedDepth, 1);
assert.equal(state.presentation.visibleDepth, 1);
assert.equal(state.presentation.hiddenMaterializedLevels, 1);
assert.equal(state.materializedDepth, 2, "Presentation collapse must not dematerialize recursive descriptors.");
assert.strictEqual(state.recursiveModel.levels, beforeCollapseLevels, "Presentation collapse must retain the existing recursive descriptor sequence.");
assert.equal(state.transition.outcome, "presentation_descendants_hidden");
assert.equal(state.transition.structuralDescriptorMaterializationTriggered, false);

assert.throws(
  () => InteractivePullbackTower.selectDepth(state, 2),
  /presentation-visible/,
  "Collapsed hidden levels cannot be selected from the current presentation."
);
assert.throws(
  () => InteractivePullbackTower.refocusDepth(state, 2),
  /presentation-visible/,
  "Collapsed hidden levels cannot be focused from the current presentation."
);

const beforeRevealRecursiveModel = state.recursiveModel;
state = InteractivePullbackTower.expandOrReveal(state);
assertStateConsistency(state);
assert.equal(state.presentation.collapsed, false);
assert.equal(state.presentation.visibleDepth, 2);
assert.equal(state.materializedDepth, 2);
assert.strictEqual(state.recursiveModel, beforeRevealRecursiveModel, "Reveal must not recreate or further materialize the recursive model.");
assert.equal(state.transition.outcome, "revealed_materialized_levels");
assert.equal(state.transition.structuralDescriptorMaterializationTriggered, false);

state = InteractivePullbackTower.selectDepth(state, 2);
state = InteractivePullbackTower.refocusDepth(state, 2);
assertStateConsistency(state);
assert.equal(state.selectedDepth, 2);
assert.equal(state.focusedDepth, 2);

state = InteractivePullbackTower.expandOrReveal(state);
assertStateConsistency(state);
assert.equal(state.requestedDepth, 3);
assert.equal(state.materializedDepth, 3);
assert.equal(state.selectedDepth, 2);
assert.equal(state.focusedDepth, 2);
assert.equal(state.transition.structuralDescriptorMaterializationTriggered, true);

const visualModel = StructuralVisualization.createStructuralVisualizationModel(
  initialA.scene,
  initialA.baseModel,
  state.recursiveModel,
  state.zoomModel,
  state.organizationModel,
  state
);
assert.equal(visualModel.sceneState.selectedDepth, 2);
assert.equal(visualModel.sceneState.focusedDepth, 2);
assert.equal(visualModel.sceneState.materializedDepth, 3);
assert.equal(visualModel.sceneState.requestedDepth, 3);
assert.deepEqual(visualModel.nodes.map((node) => node.depth), [0, 1, 2, 3]);
assert.equal(visualModel.nodes.find((node) => node.depth === 2).selected, true);
assert.equal(visualModel.nodes.find((node) => node.depth === 2).focused, true);
assert.equal(visualModel.truthfulness.geometryRendered, false);
assert.equal(visualModel.truthfulness.sheetsMaterialized, false);
assert.equal(visualModel.truthfulness.coveringStructureClaimed, false);
assert.equal(visualModel.truthfulness.geometricZoomApplied, false);
assert.equal(visualModel.truthfulness.cameraTransformApplied, false);

function runDeterministicSequence() {
  let value = createInitialState().interactionModel;
  value = InteractivePullbackTower.expandOrReveal(value);
  value = InteractivePullbackTower.selectDepth(value, 1);
  value = InteractivePullbackTower.expandOrReveal(value);
  value = InteractivePullbackTower.refocusDepth(value, 1);
  value = InteractivePullbackTower.collapseSelected(value);
  value = InteractivePullbackTower.expandOrReveal(value);
  value = InteractivePullbackTower.selectDepth(value, 2);
  value = InteractivePullbackTower.refocusDepth(value, 2);
  return value;
}
assert.deepEqual(runDeterministicSequence(), runDeterministicSequence(), "Repeated interaction sequences must be deterministic.");

const sealedRuntimeBlobs = {
  "scene-spec.js": "20471ef6fab0a685faee956f07a35d82e9a95ba5",
  "base-renderer.js": "fea92139c2a8514f01b9bb187f27bf0131dd4114",
  "one-step-pullback.js": "5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js": "0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js": "9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js": "cecf0f06aa23404a65a6093f705a4fe56be65029",
  "arithmetic-overlays.js": "bfc7331e07b8e12d4b14790ae5a4bc096042544c",
  "exposition-layer.js": "ce6210842cf653db56f67d0a7b682be893258f8a"
};
for (const [relativePath, expectedSha] of Object.entries(sealedRuntimeBlobs)) {
  assert.equal(gitBlobSha(read(relativePath)), expectedSha, `${relativePath} must remain byte-for-byte sealed in Thread 14.`);
}

const interactionSource = read("interactive-pullback-tower.js");
assert.match(interactionSource, /RecursiveLazyExpansion/);
assert.match(interactionSource, /expandOneLevel/);
assert.match(interactionSource, /ZoomSemantics/);
assert.match(interactionSource, /SheetBranchOrganization/);
assert.match(interactionSource, /sourceRequestedDepth/);
assert.match(interactionSource, /presentation/);
for (const forbiddenSourcePattern of [
  /createLevelDescriptor\s*\(/,
  /mapDegreePerStep\s*:/,
  /D\s*\*\*\s*2/,
  /D\s*\*\*\s*4/,
  /Math\.pow/,
  /sheetObjects/,
  /fiberGeometry/,
  /coveringMap/,
  /cameraMatrix/,
  /projectionMatrix/,
  /getContext\s*\(/,
  /WebGL/
]) {
  assert.doesNotMatch(interactionSource, forbiddenSourcePattern, "Interaction controller must orchestrate sealed APIs instead of implementing a second math/geometry engine.");
}

const structuralSource = read("structural-visualization.js");
assert.doesNotMatch(structuralSource, /expandOneLevel\s*\(/, "Projection layer must not trigger recursive expansion.");
assert.match(structuralSource, /interactionModel\.selectedDepth/);
assert.match(structuralSource, /interactionModel\.presentation\.visibleDepth/);
assert.match(structuralSource, /presentation_collapsed/);

const indexSource = read("index.html");
assert.ok(indexSource.includes('src="interactive-pullback-tower.js"'));
assert.ok(indexSource.includes('id="interactive-pullback-tower"'));
assert.match(indexSource, /Interactive pullback tower/);
assert.match(indexSource, /camera transform or geometric zoom/i);
assert.match(indexSource, /Canonical requested depth/);

const appSource = read("app.js");
assert.match(appSource, /InteractivePullbackTower\.createInteractivePullbackTowerModel/);
assert.match(appSource, /InteractivePullbackTower\.expandOrReveal/);
assert.match(appSource, /InteractivePullbackTower\.selectDepth/);
assert.match(appSource, /InteractivePullbackTower\.refocusDepth/);
assert.match(appSource, /InteractivePullbackTower\.collapseSelected/);
assert.match(appSource, /addEventListener\("click", handleInteractionClick\)/, "Event delegation must survive re-rendered controls.");
assert.doesNotMatch(appSource, /scene\.request\.requestedDepth\s*=/, "App must not rewrite canonical scene request state.");
assert.doesNotMatch(appSource, /D\s*\*\*\s*2|D\s*\*\*\s*4|Math\.pow/, "App interaction handlers must not recompute D²/D⁴ metadata.");

const workflowSource = read(".github/workflows/formal-verification.yml");
assert.ok(workflowSource.includes("node verify_interactive_pullback_tower_v0_15.js"));
assert.ok(workflowSource.includes("node --check interactive-pullback-tower.js"));
assert.ok(workflowSource.includes("node --check verify_interactive_pullback_tower_v0_15.js"));
assert.ok(workflowSource.includes("interactive-pullback-tower.js"));

const stateArtifact = JSON.parse(read("docs/state_self_similar_cy_visualizer_v0_15.json"));
assert.equal(stateArtifact.version, "v0.15");
assert.equal(stateArtifact.milestone, "Thread 14 — Interactive Pullback Tower");
assert.equal(stateArtifact.starting_baseline.commit, "97ee38e7f0a8704297621f8fc15f0109c8512751");
assert.equal(stateArtifact.starting_baseline.tree, "6b6948e7d83efdf91c50a73841d71ebbb770ef60");
assert.equal(stateArtifact.canonical_scene_requested_depth, 0);
assert.equal(stateArtifact.runtime_scene_baseline, "v0.12");
assert.equal(stateArtifact.mathematical_claim_strength_increased, false);
assert.equal(stateArtifact.next_milestone_started, false);
assert.deepEqual(stateArtifact.truthfulness_invariants, {
  geometryRendered: false,
  sheetsMaterialized: false,
  coveringStructureClaimed: false,
  geometricZoomApplied: false,
  cameraTransformApplied: false,
  W: "unresolved"
});

console.log("interactive pullback tower v0.15 verification: passed");
console.log("interaction authority: orchestration over sealed recursion/focus/organization APIs");
console.log("canonical requestedDepth changed: NO");
console.log("selection/focus materialization side effect: NO");
console.log("collapse deletes mathematical/runtime structure: NO");
console.log("camera/geometric zoom added: NO");
console.log("geometry/sheets/covering promoted: NO");

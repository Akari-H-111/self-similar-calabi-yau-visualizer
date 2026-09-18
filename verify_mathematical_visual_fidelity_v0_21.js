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
const ArithmeticOverlays = require("./arithmetic-overlays.js");
const InteractivePullbackTower = require("./interactive-pullback-tower.js");
const InfiniteNavigationRenderer = require("./infinite-navigation-renderer.js");
const StructuralVisualization = require("./structural-visualization.js");
const BranchOrganizationGraphics = require("./branch-organization-graphics.js");
const ArithmeticOverlayGraphics = require("./arithmetic-overlay-graphics.js");
const StructuralCamera = require("./structural-camera.js");
const VisualProvenance = require("./visual-provenance.js");
const canonicalScene = require("./data/system.json");

const root = __dirname;
function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}
function gitBlobSha(source) {
  const body = Buffer.from(source, "utf8");
  return crypto.createHash("sha1").update("blob " + String(body.length) + "\0").update(body).digest("hex");
}

assert.equal(canonicalScene.request.requestedDepth, 0);
assert.equal(canonicalScene.mathematics.parameters.D, 2);
assert.equal(canonicalScene.mathematics.baseHypersurface.definingFunction.symbol, "W");
assert.equal(canonicalScene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

const scene = SceneSpec.validateAndNormalizeScene(canonicalScene);
assert.equal(scene.derived.metricScale, 4);
assert.equal(scene.derived.sheetDegree, 16);

const sealedBlobs = {
  "scene-spec.js": "20471ef6fab0a685faee956f07a35d82e9a95ba5",
  "base-renderer.js": "fea92139c2a8514f01b9bb187f27bf0131dd4114",
  "one-step-pullback.js": "5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js": "0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js": "9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js": "cecf0f06aa23404a65a6093f705a4fe56be65029",
  "arithmetic-overlays.js": "bfc7331e07b8e12d4b14790ae5a4bc096042544c",
  "interactive-pullback-tower.js": "657262aab1db8e49e903e3e83d4a033586e2f8bd",
  "structural-camera.js": "c3934ba920be79905d631ee8a886b59527b6b65c",
  "structural-visualization.js": "ce0cfdde97d9a78b4535f4cdfcc9a73961990ab6",
  "branch-organization-graphics.js": "e5b2c31bb01a2e5cc2bf84005a7be09821b03da4",
  "arithmetic-overlay-graphics.js": "ba949f1bbf79675d1ae31998671a2719ad3a2d04",
  "exposition-layer.js": "ce6210842cf653db56f67d0a7b682be893258f8a",
  "infinite-navigation-renderer.js": "b463a0bb230cde4fd78d26a9d754b83290caa8f0",
  "app.js": "4b5767b5f5fae9fac25d042e777b150a2ef92c38",
  "style.css": "3d27767b8afa7ee72c1cd72e20112a0b855a8066",
  "formal/SelfSimilarCY/CoordinatePower.lean": "dcfae8a3ed99544e50ee45aa12acde63e41090c8",
  "formal/SelfSimilarCY/CoordinatePowerIteration.lean": "4c78793d586e8ba822d4b326f09fd82dc07eaaf9",
  "formal/SelfSimilarCY/PullbackTower.lean": "1de5fed3c38e67c89d1c8673c7515f312a7af3e0"
};
for (const [relativePath, expectedSha] of Object.entries(sealedBlobs)) {
  assert.equal(gitBlobSha(read(relativePath)), expectedSha, relativePath + " must remain byte-identical in Thread 20.");
}

const matrix = JSON.parse(read("docs/visual_provenance_matrix_self_similar_cy_visualizer_v0_21.json"));
assert.equal(matrix.schemaVersion, 1);
assert.equal(matrix.thread, "20");
assert.equal(matrix.version, "v0.21");
assert.deepEqual(matrix.truthBoundary, {
  requestedDepth: 0,
  D: 2,
  W: "unresolved",
  geometryRendered: false,
  sheetsMaterialized: false,
  coveringStructureClaimed: false,
  geometricZoomApplied: false
});
assert.ok(Array.isArray(matrix.visuals) && matrix.visuals.length >= 18);
const ids = new Set(matrix.visuals.map((entry) => entry.id));
assert.equal(ids.size, matrix.visuals.length, "Visual provenance ids must be unique.");
for (const entry of matrix.visuals) {
  assert.ok(typeof entry.visualElement === "string" && entry.visualElement.length > 0);
  assert.ok(typeof entry.module === "string" && entry.module.length > 0);
  assert.ok(typeof entry.runtimeSourceInput === "string" && entry.runtimeSourceInput.length > 0);
  assert.ok(Array.isArray(entry.canonicalSourceArtifacts) && entry.canonicalSourceArtifacts.length > 0);
  assert.ok(typeof entry.evidenceClass === "string" && entry.evidenceClass.length > 0);
  assert.ok(Array.isArray(entry.explicitNonClaims) && entry.explicitNonClaims.length > 0);
  assert.ok(Array.isArray(entry.verificationCoverage) && entry.verificationCoverage.includes("verify_mathematical_visual_fidelity_v0_21.js"));
}
for (const requiredId of [
  "structural_level_node",
  "structural_pullback_edge",
  "structural_rule_panel",
  "d2_runtime_metadata",
  "d4_organization_metadata",
  "d4_aggregate_badge",
  "coordinate_channels_annotation",
  "coordinate_iterate_rule_annotation",
  "deferred_arithmetic_candidates",
  "virtual_gap",
  "frontier_view_pruned",
  "frontier_presentation_collapsed",
  "frontier_not_materialized",
  "frontier_requested_reached",
  "selected_state",
  "focused_state",
  "camera_state",
  "w_status"
]) assert.ok(ids.has(requiredId), "Missing visual provenance entry " + requiredId);

const base = BaseRenderer.createBaseRenderModel(scene);
const oneStep = OneStepPullback.createOneStepPullbackModel(scene, base);
let interaction = InteractivePullbackTower.createInteractivePullbackTowerModel(scene, base, oneStep);
for (let index = 0; index < 24; index += 1) interaction = InteractivePullbackTower.expandOrReveal(interaction);
interaction = InteractivePullbackTower.selectDepth(interaction, 20);
interaction = InteractivePullbackTower.refocusDepth(interaction, 20);

assert.deepEqual(interaction.truthfulness, {
  geometryRendered: false,
  sheetsMaterialized: false,
  coveringStructureClaimed: false,
  geometricZoomApplied: false,
  cameraTransformApplied: false,
  W: "unresolved"
});

const semanticLevelCount = interaction.recursiveModel.levels.length;
let rendererState = InfiniteNavigationRenderer.createInfiniteNavigationRendererState(interaction, null, {anchorDepth: 20});
assert.equal(interaction.recursiveModel.levels.length, semanticLevelCount, "Viewport state must not rewrite recursiveModel.levels.");
assert.ok(rendererState.activeRenderedDepthCount <= rendererState.configuredActiveBound);

const structuralModel = StructuralVisualization.createStructuralVisualizationModel(
  interaction.runtimeScene,
  interaction.baseModel,
  interaction.recursiveModel,
  interaction.zoomModel,
  interaction.organizationModel,
  interaction,
  InfiniteNavigationRenderer.createStructuralPresentationOptions(rendererState)
);
const structuralMarkup = StructuralVisualization.buildSvgMarkup(structuralModel);
assert.match(structuralMarkup, /P_D⁻¹ · structural relation/);
assert.match(structuralMarkup, /STRUCTURAL PROJECTION · NOT GEOMETRY/);
assert.match(structuralMarkup, /No covering structure is claimed/);
assert.doesNotMatch(structuralMarkup, /literal rendered inverse image/i);

const layout = StructuralVisualization.createStructuralLayoutDescriptor(structuralModel);
const branchGraphics = BranchOrganizationGraphics.createBranchOrganizationGraphicsModel(
  interaction.organizationModel,
  layout.levelBounds
);
assert.equal(branchGraphics.sheetDegreePerStep, 16);
assert.equal(branchGraphics.truthfulness.geometryRendered, false);
assert.equal(branchGraphics.truthfulness.sheetsMaterialized, false);
assert.equal(branchGraphics.truthfulness.coveringStructureClaimed, false);
assert.equal(branchGraphics.domEncoding.badgeCountDependsOnMultiplicity, false);
const branchMarkup = BranchOrganizationGraphics.buildBadgeMarkup(branchGraphics);
assert.match(branchMarkup, /Aggregate structural metadata only; no concrete sheets or geometry are materialized/);
assert.ok(branchGraphics.badgeCount < branchGraphics.sheetDegreePerStep || branchGraphics.badgeCount === 0);

const overlayModel = ArithmeticOverlays.createArithmeticOverlayModel(
  interaction.runtimeScene,
  interaction.recursiveModel,
  interaction.zoomModel,
  interaction.organizationModel,
  [ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS, ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE]
);
const coordinateChannels = overlayModel.overlayDescriptors.find((entry) => entry.overlayId === "coordinate_channels");
const iterateRule = overlayModel.overlayDescriptors.find((entry) => entry.overlayId === "coordinate_iterate_rule");
assert.equal(coordinateChannels.evidenceClass, "source_backed_structural_representation");
assert.equal(coordinateChannels.formalSupport, "formal_theorem");
assert.equal(iterateRule.evidenceClass, "formal_theorem");
assert.equal(iterateRule.theoremIdentity, "coordinatePower_iterate_apply");
for (const id of ["cyclotomic_refinement","torsion_labels","collision_classes","delta_n_divisor"]) {
  const deferred = overlayModel.deferredCandidateOverlays.find((entry) => entry.overlayId === id);
  assert.ok(deferred);
  assert.equal(deferred.implementationStatus, "deferred");
  assert.equal(deferred.availability, "unavailable");
}
const overlayGraphics = ArithmeticOverlayGraphics.createArithmeticOverlayGraphicsModel(overlayModel, layout);
assert.equal(overlayGraphics.truthfulness.geometryRendered, false);
assert.equal(overlayGraphics.truthfulness.sheetsMaterialized, false);
assert.equal(overlayGraphics.truthfulness.coveringStructureClaimed, false);
assert.equal(overlayGraphics.truthfulness.geometricZoomApplied, false);

let camera = StructuralCamera.createStructuralCameraModel({
  canonicalViewBox: layout.canonicalViewBox,
  contentBounds: layout.contentBounds
});
camera = StructuralCamera.zoomCamera(camera, 1.25);
assert.notEqual(camera.cameraScale, scene.derived.metricScale);
assert.equal(camera.truthfulness.geometricZoomApplied, false);
assert.equal(camera.truthfulness.geometryRendered, false);

function fakeElement(dataset = {}, textContent = "") {
  return {dataset: {...dataset}, textContent};
}
const requestedFrontier = fakeElement({}, "requested structural frontier reached");
const viewPrunedFrontier = fakeElement({frontierStatus:"view_pruned"});
const selectedFocusedNode = fakeElement({selected:"true", focused:"true"});
const d4Badge = fakeElement();
const arithmeticAnnotation = fakeElement();
const edge = fakeElement();
const rulePanel = fakeElement();
const virtualGap = fakeElement();
const surface = {
  dataset: {},
  querySelectorAll(selector) {
    const map = {
      ".structural-node": [selectedFocusedNode],
      ".structural-edge": [edge],
      ".structural-rule-panel": [rulePanel],
      ".structural-virtual-gap": [virtualGap],
      ".structural-frontier": [viewPrunedFrontier],
      ".structural-frontier__text": [requestedFrontier],
      ".branch-organization-badge": [d4Badge],
      ".arithmetic-overlay-annotation": [arithmeticAnnotation]
    };
    return map[selector] ?? [];
  }
};
const target = {
  dataset: {},
  querySelector(selector) {
    return selector === "svg.structural-visualization__surface" ? surface : null;
  }
};
const cameraElement = fakeElement();
const d2Element = fakeElement();
const d4Element = fakeElement();
const wElement = fakeElement();
const fakeDocument = {
  querySelector(selector) {
    if (selector === "#structural-camera") return cameraElement;
    if (selector === '[data-exposition-field="D2"]') return d2Element;
    if (selector === '[data-exposition-field="D4"]') return d4Element;
    if (selector === '[data-exposition-field="W"]') return wElement;
    return null;
  }
};
const provenanceSnapshot = VisualProvenance.annotateStructuralProvenance(target, fakeDocument);
assert.equal(provenanceSnapshot.kind, "visual_provenance_adapter");
assert.equal(target.dataset.visualProvenanceVersion, "v0.21");
assert.equal(requestedFrontier.dataset.frontierStatus, "requested_frontier_reached");
assert.equal(requestedFrontier.dataset.visualProvenanceId, "frontier_requested_reached");
assert.equal(viewPrunedFrontier.dataset.evidenceClass, "presentation_virtualization");
assert.equal(selectedFocusedNode.dataset.selectionEvidenceClass, "interaction_metadata");
assert.equal(selectedFocusedNode.dataset.focusEvidenceClass, "interaction_metadata");
assert.equal(edge.dataset.evidenceClass, "formal_theorem_backed_symbolic");
assert.equal(d4Badge.dataset.evidenceClass, "source_backed_structural_representation");
assert.equal(cameraElement.dataset.evidenceClass, "presentation_camera_state");
assert.equal(d2Element.dataset.evidenceClass, "runtime_metadata");
assert.equal(d4Element.dataset.evidenceClass, "runtime_metadata");
assert.equal(wElement.dataset.evidenceClass, "unresolved");

const indexSource = read("index.html");
assert.match(indexSource, /v0\.21 · Mathematical \/ Visual Fidelity Audit II/);
assert.match(indexSource, /visual-provenance\.js/);
assert.match(indexSource, /D² runtime metadata/);
assert.match(indexSource, /D⁴ organization metadata/);
assert.match(indexSource, /W representation/);

const readme = read("README.md");
assert.match(readme, /Current version:\*\* v0\.21 — Mathematical \/ Visual Fidelity Audit II/);
assert.match(readme, /visual provenance matrix/i);
assert.match(readme, /Thread 20/i);
assert.match(readme, /HIA-03.*remains.*unchanged/is);

const state = JSON.parse(read("docs/state_self_similar_cy_visualizer_v0_21.json"));
assert.equal(state.thread, "20");
assert.equal(state.version, "v0.21");
assert.equal(state.thread20_sealed, false);
assert.equal(state.formal_modified, false);
assert.equal(state.sealed_semantic_modules_modified, false);

const workflow = read(".github/workflows/formal-verification.yml");
for (const marker of [
  "node verify_scene_spec_v0_03.js",
  "node verify_human_interaction_remediation_v0_20_1.js",
  "node verify_mathematical_visual_fidelity_v0_21.js",
  "node --check visual-provenance.js",
  "node --check verify_mathematical_visual_fidelity_v0_21.js"
]) assert.ok(workflow.includes(marker), "Missing workflow marker: " + marker);

console.log("Mathematical / Visual Fidelity Audit II v0.21 verifier: passed");
console.log("visual provenance matrix: complete for admitted major visual classes");
console.log("requested frontier machine-readable provenance: repaired by v0.21 adapter");
console.log("sealed runtime/formal/app/HIA production blobs: byte-identical");
console.log("D2/D4/camera/theorem evidence classes: separated");
console.log("deferred arithmetic geometry: remains unavailable");
console.log("geometry/sheets/covering/geometric zoom: remain false; W remains unresolved");

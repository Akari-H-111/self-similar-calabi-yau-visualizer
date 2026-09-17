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
const StructuralVisualization = require("./structural-visualization.js");

const repositoryRoot = __dirname;
const canonicalScene = require("./data/system.json");

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function gitBlobSha(source) {
  const body = Buffer.from(source, "utf8");
  return crypto.createHash("sha1").update(`blob ${String(body.length)}\0`).update(body).digest("hex");
}

function buildModels(rawScene, expandToDepth = null, focusDepth = 0) {
  const scene = SceneSpec.validateAndNormalizeScene(rawScene);
  const baseModel = BaseRenderer.createBaseRenderModel(scene);
  const oneStepModel = OneStepPullback.createOneStepPullbackModel(scene, baseModel);
  let recursiveModel = RecursiveLazyExpansion.createRecursiveLazyExpansionModel(scene, baseModel, oneStepModel);

  if (expandToDepth !== null) {
    while (recursiveModel.materializedDepth < expandToDepth) {
      recursiveModel = RecursiveLazyExpansion.expandOneLevel(recursiveModel);
    }
  }

  const zoomModel = ZoomSemantics.createZoomFocusModel(scene, recursiveModel, focusDepth);
  const organizationModel = SheetBranchOrganization.createSheetBranchOrganizationModel(scene, recursiveModel, zoomModel);
  const visualizationModel = StructuralVisualization.createStructuralVisualizationModel(
    scene,
    baseModel,
    recursiveModel,
    zoomModel,
    organizationModel
  );

  return { scene, baseModel, oneStepModel, recursiveModel, zoomModel, organizationModel, visualizationModel };
}

function cloneSceneWith({ D, requestedDepth }) {
  return {
    ...canonicalScene,
    mathematics: {
      ...canonicalScene.mathematics,
      parameters: {
        ...canonicalScene.mathematics.parameters,
        D
      }
    },
    request: {
      ...canonicalScene.request,
      requestedDepth
    }
  };
}

assert.equal(canonicalScene.version, "v0.12", "Thread 13 is a presentation projection over the sealed v0.12 runtime scene contract.");
assert.equal(canonicalScene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

const canonical = buildModels(canonicalScene, null, 0);
const canonicalVisualization = canonical.visualizationModel;
assert.equal(canonicalVisualization.kind, StructuralVisualization.MODEL_KIND);
assert.equal(canonicalVisualization.representationKind, "structural_svg_diagram");
assert.equal(canonicalVisualization.structuralOnly, true);
assert.equal(canonicalVisualization.nodes.length, 1);
assert.equal(canonicalVisualization.nodes[0].depth, 0);
assert.equal(canonicalVisualization.nodes[0].label, "X₀");
assert.equal(canonicalVisualization.nodes[0].focused, true);
assert.equal(canonicalVisualization.edges.length, 0);
assert.deepEqual(canonicalVisualization.truthfulness, {
  geometryRendered: false,
  sheetsMaterialized: false,
  coveringStructureClaimed: false,
  geometricZoomApplied: false,
  cameraTransformApplied: false,
  materializationTriggered: false
});
assert.equal(canonicalVisualization.sceneState.definingFunctionRepresentation, "unresolved");
assert.equal(canonicalVisualization.sceneState.organizationSemanticStatus, "runtime_numeric_organizational_metadata");

const expandedFixture = buildModels(cloneSceneWith({ D: 3, requestedDepth: 3 }), 3, 2);
const expandedVisualization = expandedFixture.visualizationModel;
assert.equal(expandedVisualization.nodes.length, 4);
assert.equal(expandedVisualization.edges.length, 3);
assert.deepEqual(expandedVisualization.nodes.map((node) => node.depth), [0, 1, 2, 3]);
assert.deepEqual(expandedVisualization.edges.map((edge) => [edge.sourceDepth, edge.targetDepth]), [[0, 1], [1, 2], [2, 3]]);
assert.equal(expandedVisualization.nodes[2].focused, true);
assert.equal(expandedVisualization.sceneState.D, 3);
assert.equal(expandedVisualization.sceneState.requestedDepth, 3);
assert.equal(expandedVisualization.sceneState.materializedDepth, 3);
assert.equal(expandedVisualization.sceneState.focusedDepth, 2);
assert.equal(expandedVisualization.continuation.present, false);

const lazyFixture = buildModels(cloneSceneWith({ D: 2, requestedDepth: 4 }), 2, 1).visualizationModel;
assert.equal(lazyFixture.nodes.length, 3);
assert.equal(lazyFixture.edges.length, 2);
assert.equal(lazyFixture.continuation.present, true);
assert.equal(lazyFixture.continuation.nextDepth, 3);

const target = { hidden: true, dataset: {}, innerHTML: "" };
StructuralVisualization.renderStructuralVisualization(expandedVisualization, target);
assert.equal(target.hidden, false);
assert.equal(target.dataset.state, "ready");
assert.equal(target.dataset.representationKind, "structural_svg_diagram");
assert.equal(target.dataset.structuralOnly, "true");
assert.equal(target.dataset.materializedDepth, "3");
assert.equal(target.dataset.focusedDepth, "2");
assert.equal(target.dataset.geometryRendered, "false");
assert.equal(target.dataset.sheetsMaterialized, "false");
assert.equal(target.dataset.coveringStructureClaimed, "false");
assert.equal(target.dataset.geometricZoomApplied, "false");
assert.equal(target.dataset.cameraTransformApplied, "false");
assert.equal(target.dataset.materializationTriggered, "false");
assert.match(target.innerHTML, /<svg/);
assert.match(target.innerHTML, /STRUCTURAL PROJECTION · NOT GEOMETRY/);
assert.match(target.innerHTML, /X₀/);
assert.match(target.innerHTML, /X₃/);
assert.match(target.innerHTML, /P_D⁻¹ · structural relation/);
assert.match(target.innerHTML, /geometryRendered=false/);
assert.match(target.innerHTML, /No covering structure is claimed/);

const sealedModelBlobs = {
  "scene-spec.js": "20471ef6fab0a685faee956f07a35d82e9a95ba5",
  "base-renderer.js": "fea92139c2a8514f01b9bb187f27bf0131dd4114",
  "one-step-pullback.js": "5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js": "0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js": "9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js": "cecf0f06aa23404a65a6093f705a4fe56be65029",
  "arithmetic-overlays.js": "bfc7331e07b8e12d4b14790ae5a4bc096042544c",
  "exposition-layer.js": "ce6210842cf653db56f67d0a7b682be893258f8a"
};
for (const [relativePath, expectedSha] of Object.entries(sealedModelBlobs)) {
  assert.equal(gitBlobSha(read(relativePath)), expectedSha, `${relativePath} must remain byte-for-byte sealed.`);
}

const visualizationSource = read("structural-visualization.js");
for (const forbiddenSourcePattern of [
  /expandOneLevel\s*\(/,
  /Math\.pow/,
  /\*\*\s*2/,
  /\*\*\s*4/,
  /sheetObjects/,
  /fiberGeometry/,
  /coveringMap/,
  /cameraMatrix/,
  /projectionMatrix/,
  /WebGL/,
  /canvas\.getContext/
]) {
  assert.doesNotMatch(visualizationSource, forbiddenSourcePattern, "Structural visualization must stay a projection layer, not a second math/geometry engine.");
}
assert.match(visualizationSource, /recursiveModel\.levels/);
assert.match(visualizationSource, /zoomModel\.focusedDepth/);
assert.match(visualizationSource, /organizationModel\.sheetDegreeSemanticStatus/);
assert.match(visualizationSource, /representation !== "unresolved"/);

const indexSource = read("index.html");
assert.ok(indexSource.includes('id="structural-visualization-title"'));
assert.ok(indexSource.includes('id="structural-visualization"'));
assert.match(indexSource, /Structural diagram/);
assert.match(indexSource, /diagram is structural, not a geometric realization/i);
assert.match(indexSource, /No geometric Calabi–Yau hypersurface is currently rendered/);

const appSource = read("app.js");
const organizationCall = "SheetBranchOrganization.createSheetBranchOrganizationModel(scene, recursiveModel, zoomModel)";
const visualizationCall = "StructuralVisualization.createStructuralVisualizationModel(";
const visualizationRenderCall = "StructuralVisualization.renderStructuralVisualization(structuralVisualizationModel, structuralVisualizationElement)";
assert.ok(appSource.indexOf(organizationCall) >= 0);
assert.ok(appSource.indexOf(visualizationCall) > appSource.indexOf(organizationCall));
assert.ok(appSource.indexOf(visualizationRenderCall) > appSource.indexOf(visualizationCall));
assert.equal(appSource.includes("expandOneLevel("), false);

const workflowSource = read(".github/workflows/formal-verification.yml");
assert.ok(workflowSource.includes("node verify_structural_visualization_v0_14.js"));
assert.ok(workflowSource.includes("node --check structural-visualization.js"));
assert.ok(workflowSource.includes("node --check verify_structural_visualization_v0_14.js"));
assert.ok(workflowSource.includes("structural-visualization.js"));

const state = JSON.parse(read("docs/state_self_similar_cy_visualizer_v0_14.json"));
assert.equal(state.version, "v0.14");
assert.equal(state.milestone, "Thread 13 — Structural Visualization Layer");
assert.equal(state.starting_baseline.commit, "e83ed17a5ce8e45e67ef326042a21ec51ba24222");
assert.equal(state.starting_baseline.tree, "338a519614ea16ceb2e4a1247fc0c94338929f0c");
assert.equal(state.runtime_scene_baseline, "v0.12");
assert.equal(state.mathematical_claim_strength_increased, false);
assert.deepEqual(state.truthfulness_invariants, {
  geometryRendered: false,
  sheetsMaterialized: false,
  coveringStructureClaimed: false,
  geometricZoomApplied: false,
  cameraTransformApplied: false,
  materializationTriggered: false,
  W: "unresolved"
});

console.log("structural visualization v0.14 verification: passed");
console.log("projection source: existing verified runtime models");
console.log("visible output: deterministic SVG structural diagram");
console.log("geometry/sheets/covering/geometric zoom materialized: NO");
console.log("mathematical claim strength increased: NO");

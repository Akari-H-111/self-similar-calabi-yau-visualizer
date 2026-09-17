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
const ArithmeticOverlays = require("./arithmetic-overlays.js");
const ExpositionLayer = require("./exposition-layer.js");

const repositoryRoot = __dirname;
const canonicalScene = require("./data/system.json");

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function gitBlobSha(source) {
  const body = Buffer.from(source, "utf8");
  return crypto.createHash("sha1").update(`blob ${String(body.length)}\0`).update(body).digest("hex");
}

function buildModels(rawScene, focusDepth = 0) {
  const scene = SceneSpec.validateAndNormalizeScene(rawScene);
  const baseModel = BaseRenderer.createBaseRenderModel(scene);
  const oneStepModel = OneStepPullback.createOneStepPullbackModel(scene, baseModel);
  const recursiveModel = RecursiveLazyExpansion.createRecursiveLazyExpansionModel(scene, baseModel, oneStepModel);
  const zoomModel = ZoomSemantics.createZoomFocusModel(scene, recursiveModel, focusDepth);
  const organizationModel = SheetBranchOrganization.createSheetBranchOrganizationModel(
    scene,
    recursiveModel,
    zoomModel
  );
  const overlayModel = ArithmeticOverlays.createArithmeticOverlayModel(
    scene,
    recursiveModel,
    zoomModel,
    organizationModel,
    [
      ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS,
      ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
    ]
  );
  const expositionModel = ExpositionLayer.createExpositionModel(
    scene,
    baseModel,
    recursiveModel,
    zoomModel,
    organizationModel,
    overlayModel
  );
  return {
    scene,
    baseModel,
    oneStepModel,
    recursiveModel,
    zoomModel,
    organizationModel,
    overlayModel,
    expositionModel
  };
}

function createExpositionTarget() {
  const names = ["depth", "D", "D2", "D4", "structure", "geometry", "formal", "navigation", "W"];
  const fields = Object.fromEntries(names.map((name) => [name, { textContent: "", dataset: {} }]));
  return {
    hidden: true,
    dataset: {},
    fields,
    querySelector(selector) {
      const match = /^\[data-exposition-field="([^"]+)"\]$/.exec(selector);
      return match ? fields[match[1]] ?? null : null;
    }
  };
}

assert.equal(canonicalScene.version, "v0.12", "Thread 11 candidate scene metadata must be v0.12.");

const models = buildModels(canonicalScene, 0);
const exposition = models.expositionModel;
assert.equal(exposition.kind, ExpositionLayer.MODEL_KIND);

const categoryIds = Object.values(ExpositionLayer.SEMANTIC_CATEGORIES).map((entry) => entry.id).sort();
assert.deepEqual(categoryIds, [
  "engineering",
  "formalized",
  "not-materialized",
  "runtime",
  "structural",
  "symbolic",
  "unresolved"
].sort());

assert.equal(exposition.currentState.focusedDepth, models.zoomModel.focusedDepth);
assert.equal(exposition.currentState.materializedDepth, models.recursiveModel.materializedDepth);
assert.equal(exposition.currentState.requestedDepth, models.recursiveModel.requestedDepth);
assert.equal(exposition.currentState.D, models.scene.mathematics.parameters.D);
assert.equal(exposition.currentState.D2.value, models.scene.derived.metricScale);
assert.equal(exposition.currentState.D2.category, "runtime");
assert.equal(exposition.currentState.D4.value, models.scene.derived.sheetDegree);
assert.equal(exposition.currentState.D4.category, "runtime");
assert.equal(exposition.currentState.formalState.category, "formalized");
assert.equal(exposition.currentState.geometryState.category, "unresolved");
assert.equal(exposition.definingFunction.symbol, "W");
assert.equal(exposition.definingFunction.representation, "unresolved");
assert.equal(exposition.definingFunction.category, "unresolved");

assert.equal(models.baseModel.geometryRendered, false);
assert.equal(models.recursiveModel.geometryRendered, false);
assert.equal(models.recursiveModel.sheetsMaterialized, false);
assert.equal(models.organizationModel.sheetsMaterialized, false);
assert.equal(models.organizationModel.coveringStructureClaimed, false);
assert.equal(models.organizationModel.geometryRendered, false);
assert.equal(models.zoomModel.geometricZoomApplied, false);
assert.equal(models.zoomModel.cameraTransformApplied, false);
assert.equal(models.zoomModel.materializationTriggered, false);
assert.equal(models.overlayModel.geometryRendered, false);
assert.equal(models.overlayModel.materializationTriggered, false);

assert.deepEqual(exposition.truthfulness, {
  geometryRendered: false,
  sheetsMaterialized: false,
  coveringStructureClaimed: false,
  geometricZoomApplied: false,
  cameraTransformApplied: false,
  materializationTriggered: false
});

assert.equal(exposition.formalizedScope.length, 3);
assert.ok(exposition.formalizedScope.some((item) => /Coordinate-power map/.test(item)));
assert.ok(exposition.formalizedScope.some((item) => /iteration law/.test(item)));
assert.ok(exposition.formalizedScope.some((item) => /pullback recurrence/.test(item)));
assert.ok(exposition.unresolvedScope.some((item) => /Concrete W representation/.test(item)));
assert.ok(exposition.unresolvedScope.some((item) => /Calabi–Yau hypersurface geometry/.test(item)));
assert.match(exposition.navigationExplanation, /finite structural depths/i);
assert.match(exposition.navigationExplanation, /does not render literal infinity/i);
assert.match(exposition.navigationExplanation, /does not.*geometric camera zoom/i);

const target = createExpositionTarget();
ExpositionLayer.renderExpositionLayer(exposition, target);
assert.equal(target.hidden, false);
assert.equal(target.dataset.state, "ready");
assert.equal(target.dataset.geometryRendered, "false");
assert.equal(target.dataset.sheetsMaterialized, "false");
assert.equal(target.dataset.coveringStructureClaimed, "false");
assert.equal(target.dataset.geometricZoomApplied, "false");
assert.equal(target.dataset.cameraTransformApplied, "false");
assert.equal(target.fields.D.textContent, String(models.scene.mathematics.parameters.D));
assert.equal(target.fields.D2.textContent, String(models.scene.derived.metricScale));
assert.equal(target.fields.D4.textContent, String(models.scene.derived.sheetDegree));
assert.equal(target.fields.D2.dataset.semanticCategory, "runtime");
assert.equal(target.fields.D4.dataset.semanticCategory, "runtime");
assert.equal(target.fields.geometry.dataset.semanticCategory, "unresolved");
assert.equal(target.fields.formal.dataset.semanticCategory, "formalized");
assert.match(target.fields.W.textContent, /W: unresolved/);

const sealedRuntimeBlobs = {
  "scene-spec.js": "20471ef6fab0a685faee956f07a35d82e9a95ba5",
  "base-renderer.js": "fea92139c2a8514f01b9bb187f27bf0131dd4114",
  "one-step-pullback.js": "5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js": "0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js": "9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js": "cecf0f06aa23404a65a6093f705a4fe56be65029",
  "arithmetic-overlays.js": "bfc7331e07b8e12d4b14790ae5a4bc096042544c"
};
for (const [relativePath, expectedSha] of Object.entries(sealedRuntimeBlobs)) {
  assert.equal(gitBlobSha(read(relativePath)), expectedSha, `${relativePath} must remain byte-for-byte sealed from v0.11.`);
}

const expositionSource = read("exposition-layer.js");
for (const forbiddenSourcePattern of [
  /\*\*\s*2/,
  /\*\*\s*4/,
  /Math\.pow/,
  /expandOneLevel/,
  /sheetObjects/,
  /fiberGeometry/,
  /cameraMatrix/,
  /projectionMatrix/
]) {
  assert.doesNotMatch(expositionSource, forbiddenSourcePattern, "Exposition layer must not become a second math or materialization engine.");
}
assert.match(expositionSource, /scene\.derived\.metricScale/);
assert.match(expositionSource, /scene\.derived\.sheetDegree/);
assert.match(expositionSource, /organizationModel\.coveringStructureClaimed/);
assert.match(expositionSource, /zoomModel\.geometricZoomApplied/);

const indexSource = read("index.html");
for (const requiredMarker of [
  'id="exposition-layer"',
  'id="current-state-title"',
  'id="legend-title"',
  'id="provenance-title"',
  'data-semantic-category="formalized"',
  'data-semantic-category="runtime"',
  'data-semantic-category="structural"',
  'data-semantic-category="symbolic"',
  'data-semantic-category="unresolved"',
  'data-semantic-category="not-materialized"',
  'data-semantic-category="engineering"'
]) {
  assert.ok(indexSource.includes(requiredMarker), `Missing exposition marker: ${requiredMarker}`);
}
assert.match(indexSource, /No geometric Calabi–Yau hypersurface is currently rendered/);
assert.match(indexSource, /D² runtime metadata/);
assert.match(indexSource, /D⁴ organization metadata/);
assert.match(indexSource, /Not a sealed metric theorem/);
assert.match(indexSource, /Not a sealed map-degree theorem/);
assert.match(indexSource, /arbitrarily continued <em>finite<\/em> structural navigation/);
assert.match(indexSource, /parent-project overlays remain deferred unless exact canonical source evidence is available/);
assert.ok(indexSource.includes("<details"));
assert.ok(indexSource.includes("<summary>"));
assert.equal((indexSource.match(/role="status"/g) || []).length, 1, "Only the concise load/status region should be an ARIA live status surface.");
assert.equal(indexSource.includes("title="), false, "Core exposition must not depend on hover-only title tooltips.");

const styleSource = read("style.css");
assert.match(styleSource, /summary:focus-visible/);
assert.match(styleSource, /@media \(max-width: 760px\)/);
assert.match(styleSource, /grid-template-columns: 1fr/);
assert.match(styleSource, /@media \(prefers-reduced-motion: reduce\)/);

const appSource = read("app.js");
const overlayCreateCall = "ArithmeticOverlays.createArithmeticOverlayModel(scene, recursiveModel, zoomModel, organizationModel, initialArithmeticOverlayRequest)";
const expositionCreateCall = "ExpositionLayer.createExpositionModel(";
const expositionRenderCall = "ExpositionLayer.renderExpositionLayer(expositionModel, expositionElement)";
assert.ok(appSource.indexOf(overlayCreateCall) >= 0);
assert.ok(appSource.indexOf(expositionCreateCall) > appSource.indexOf(overlayCreateCall));
assert.ok(appSource.indexOf(expositionRenderCall) > appSource.indexOf(expositionCreateCall));
assert.equal(appSource.includes("expandOneLevel("), false);

const workflowSource = read(".github/workflows/formal-verification.yml");
for (const verifier of [
  "verify_scene_spec_v0_03.js",
  "verify_base_renderer_v0_04.js",
  "verify_one_step_pullback_v0_05.js",
  "verify_recursive_lazy_expansion_v0_06.js",
  "verify_zoom_semantics_v0_07.js",
  "verify_sheet_branch_organization_v0_08.js",
  "verify_arithmetic_overlays_v0_09.js",
  "verify_performance_infinite_navigation_v0_10.js",
  "verify_mathematical_fidelity_v0_11.js",
  "verify_ux_exposition_v0_12.js"
]) {
  assert.ok(workflowSource.includes(`node ${verifier}`), `Workflow must execute ${verifier}.`);
}
assert.ok(workflowSource.includes("node --check exposition-layer.js"));
assert.ok(workflowSource.includes("node --check verify_ux_exposition_v0_12.js"));

const uxDoc = read("docs/UX_EXPOSITION_self_similar_cy_visualizer_v0_12.md");
for (const marker of [
  "UX problem statement",
  "Terminology system",
  "Information architecture",
  "Exposition/source boundaries",
  "Accessibility choices",
  "Mathematical nonclaims",
  "Verifier scope",
  "Residual risks"
]) {
  assert.ok(uxDoc.includes(marker), `UX exposition document must include ${marker}.`);
}

console.log("UX/exposition v0.12 verification: passed");
console.log("semantic vocabulary: formalized/runtime/structural/symbolic/unresolved/not-materialized/engineering");
console.log("runtime truthfulness -> exposition agreement: passed");
console.log("sealed v0.11 math/runtime engines unchanged: passed");
console.log("accessibility/static exposition gates: passed");
console.log("mathematical claim strength increased: NO");

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

const repositoryRoot = __dirname;
const canonicalScene = require("./data/system.json");

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function gitBlobSha(source) {
  const body = Buffer.from(source, "utf8");
  return crypto.createHash("sha1").update(`blob ${String(body.length)}\0`).update(body).digest("hex");
}

function createTarget() {
  return { hidden: true, dataset: {}, textContent: "" };
}

function buildModels(rawScene, focusDepth = 0, requestedOverlays = []) {
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
    requestedOverlays
  );
  return { scene, baseModel, oneStepModel, recursiveModel, zoomModel, organizationModel, overlayModel };
}

assert.equal(canonicalScene.version, "v0.11", "Thread 10 canonical scene metadata must be v0.11.");

const baseCase = buildModels(canonicalScene, 0, [
  ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS,
  ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
]);

assert.equal(baseCase.scene.derived.metricScale, 4);
assert.equal(baseCase.scene.derived.sheetDegree, 16);
assert.equal(baseCase.scene.mathematics.baseHypersurface.definingFunction.symbol, "W");
assert.equal(baseCase.scene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");
assert.equal(baseCase.baseModel.geometryRendered, false);
assert.equal(baseCase.recursiveModel.geometryRendered, false);
assert.equal(baseCase.recursiveModel.sheetsMaterialized, false);

assert.equal(baseCase.oneStepModel.mapDegree, baseCase.scene.derived.sheetDegree);
assert.match(baseCase.oneStepModel.message, /D\^4 runtime metadata/i);
assert.match(baseCase.oneStepModel.message, /not a map-degree theorem/i);
assert.doesNotMatch(baseCase.oneStepModel.message, /derived map degree/i);
assert.equal(baseCase.oneStepModel.geometryRendered, false);
assert.equal(baseCase.oneStepModel.sheetsMaterialized, false);

assert.equal(baseCase.zoomModel.geometricZoomApplied, false);
assert.equal(baseCase.zoomModel.cameraTransformApplied, false);
assert.equal(baseCase.zoomModel.materializationTriggered, false);
assert.deepEqual(baseCase.zoomModel.formalMetricScaleExpression, { baseScale: 4, exponent: 0 });

assert.equal(
  baseCase.organizationModel.sheetDegreeSemanticStatus,
  "runtime_numeric_organizational_metadata"
);
assert.equal(baseCase.organizationModel.sheetDegreePerStep, baseCase.scene.derived.sheetDegree);
assert.equal(baseCase.organizationModel.slotsEnumerated, false);
assert.equal(baseCase.organizationModel.sheetsMaterialized, false);
assert.equal(baseCase.organizationModel.coveringStructureClaimed, false);
assert.equal(baseCase.organizationModel.geometryRendered, false);
assert.equal(baseCase.organizationModel.materializationTriggered, false);

const depthOneRaw = clone(canonicalScene);
depthOneRaw.request.requestedDepth = 1;
const depthOne = buildModels(depthOneRaw, 1, [
  ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS,
  ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
]);
assert.equal(depthOne.recursiveModel.materializedDepth, 1);
assert.equal(depthOne.recursiveModel.levels[0].mapDegreePerStep, depthOne.scene.derived.sheetDegree);
assert.deepEqual(depthOne.recursiveModel.levels[0].iteratedDegreeExpression, {
  baseDegree: depthOne.scene.derived.sheetDegree,
  exponent: 1
});
assert.equal(depthOne.recursiveModel.levels[0].sheetsMaterialized, false);
assert.equal(depthOne.recursiveModel.levels[0].geometryRendered, false);
assert.equal(depthOne.organizationModel.focusedOrganization.aggregateOnly, true);
assert.equal(depthOne.organizationModel.focusedOrganization.slotsEnumerated, false);

const implementedIds = depthOne.overlayModel.implementedOverlays.map((entry) => entry.overlayId).sort();
assert.deepEqual(implementedIds, [
  ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS,
  ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
].sort());

for (const deferredId of [
  ArithmeticOverlays.OVERLAY_IDS.CYCLOTOMIC_REFINEMENT,
  ArithmeticOverlays.OVERLAY_IDS.TORSION_LABELS,
  ArithmeticOverlays.OVERLAY_IDS.COLLISION_CLASSES,
  ArithmeticOverlays.OVERLAY_IDS.DELTA_N_DIVISOR
]) {
  const entry = depthOne.overlayModel.deferredCandidateOverlays.find((candidate) => candidate.overlayId === deferredId);
  assert.ok(entry, `${deferredId} must remain explicitly recorded as deferred.`);
  assert.equal(entry.implementationStatus, "deferred");
  assert.equal(entry.availability, ArithmeticOverlays.UNAVAILABLE_STATUS);
  assert.equal(entry.evidenceClass, ArithmeticOverlays.EVIDENCE_CLASSES.UNRESOLVED_UNAVAILABLE);
  assert.equal(entry.canonicalSource, null);
  assert.equal(entry.sourceVersion, null);
}

const leanArtifacts = [
  {
    path: "formal/SelfSimilarCY/Basic.lean",
    sha: "84bc2ca172a871890ef9753f2c0d9db84a7dec5e"
  },
  {
    path: "formal/SelfSimilarCY/CoordinatePower.lean",
    sha: "dcfae8a3ed99544e50ee45aa12acde63e41090c8"
  },
  {
    path: "formal/SelfSimilarCY/CoordinatePowerIteration.lean",
    sha: "4c78793d586e8ba822d4b326f09fd82dc07eaaf9"
  },
  {
    path: "formal/SelfSimilarCY/PullbackTower.lean",
    sha: "1de5fed3c38e67c89d1c8673c7515f312a7af3e0"
  }
];

for (const artifact of leanArtifacts) {
  const source = read(artifact.path);
  assert.equal(gitBlobSha(source), artifact.sha, `${artifact.path} must remain the sealed Lean source blob.`);
  assert.doesNotMatch(
    source,
    /(^|[^A-Za-z0-9_])(axiom|sorry|admit)([^A-Za-z0-9_]|$)/m,
    `${artifact.path} must contain no Lean placeholder.`
  );
}

const coordinatePowerSource = read("formal/SelfSimilarCY/CoordinatePower.lean");
const coordinateIterationSource = read("formal/SelfSimilarCY/CoordinatePowerIteration.lean");
const pullbackTowerSource = read("formal/SelfSimilarCY/PullbackTower.lean");
assert.match(coordinatePowerSource, /abbrev Point4 := Fin 4 → ℂ/);
assert.match(coordinatePowerSource, /theorem coordinatePower_apply/);
assert.match(coordinatePowerSource, /theorem coordinatePower_unique/);
assert.match(coordinateIterationSource, /theorem coordinatePower_iterate_apply/);
assert.match(coordinateIterationSource, /theorem coordinatePower_iterate/);
assert.match(pullbackTowerSource, /theorem pullbackTower_eq_iterate_preimage/);
assert.match(pullbackTowerSource, /theorem pullbackTower_eq_coordinatePower_preimage/);
assert.match(pullbackTowerSource, /no Calabi--Yau geometry, degree theorem,/);
assert.match(pullbackTowerSource, /covering-space structure, or metric claim/);

const indexSource = read("index.html");
assert.match(indexSource, /v0\.11 · Mathematical Fidelity Audit/);
assert.match(indexSource, /D² runtime metadata/);
assert.match(indexSource, /D⁴ organization metadata/);
assert.match(indexSource, /Sheet \/ branch organization metadata/);

const readmeSource = read("README.md");
assert.match(readmeSource, /Current version:\*\* v0\.11/);
assert.match(readmeSource, /D² and D⁴ explicitly as runtime\/organization metadata/);
assert.match(readmeSource, /not a map-degree theorem/i);
assert.match(readmeSource, /entire visualizer, all Calabi–Yau mathematics/i);
assert.match(readmeSource, /not source-verified in this thread/);
assert.match(readmeSource, /not mathematical limits/);
assert.match(readmeSource, /engineering\/runtime representation constraint|engineering safety constraint|representation-safety constraints/i);

const fidelitySource = read("docs/MATHEMATICAL_FIDELITY_self_similar_cy_visualizer_v0_11.md");
for (const requiredSection of [
  "## 1. Audit scope",
  "## 2. Canonical source hierarchy",
  "## 3. Claim classification system",
  "## 4. Mathematical Fidelity Ledger",
  "## 5. Lean-proved claims",
  "## 6. Runtime-only representations",
  "## 7. Parent-project-proved but not Lean-formalized claims",
  "## 8. Visualization conventions",
  "## 9. Unresolved claims",
  "## 10. Unavailable-source claims",
  "## 11. Overclaim corrections",
  "## 12. Remaining fidelity risks",
  "## 13. Explicit non-claims",
  "## 14. Thread 10 seal criteria"
]) {
  assert.ok(fidelitySource.includes(requiredSection), `Missing fidelity section: ${requiredSection}`);
}
assert.match(fidelitySource, /canonical parent source unavailable in current thread/);
assert.match(fidelitySource, /not source-verified in this thread/);
assert.match(fidelitySource, /README_arithmetic_self_similar_cy_final\.md/);
assert.match(fidelitySource, /Runtime numeric\/organizational metadata\. Do not call it a genuine map degree/);
assert.match(fidelitySource, /claim discipline/i);
assert.match(fidelitySource, /not a substitute for mathematical proof/i);

const state = JSON.parse(read("docs/state_self_similar_cy_visualizer_v0_11.json"));
assert.equal(state.version, "v0.11");
assert.equal(state.parent_source_gate.exact_parent_source_available, false);
assert.equal(state.parent_source_gate.memory_used_as_canonical_evidence, false);
assert.deepEqual(state.parent_source_gate.parent_results_promoted_to_class_E, []);
assert.equal(state.lean_formal_boundary.modified_by_v0_11, false);
assert.equal(state.runtime_fidelity.D2, "runtime numeric metadata; metric theorem unformalized");
assert.equal(state.runtime_fidelity.D4, "runtime numeric / organizational metadata; genuine map-degree theorem unformalized");
assert.equal(state.runtime_fidelity.W, "unresolved");
assert.equal(state.performance_boundary.benchmark_horizons_are_mathematical_limits, false);
assert.equal(state.performance_boundary.safe_integer_guard_is_mathematical_theorem, false);
assert.equal(state.seal_policy.thread_sealed, false);

const performanceSource = read("docs/PERFORMANCE_INFINITE_NAVIGATION_self_similar_cy_visualizer_v0_10.md");
assert.match(performanceSource, /arbitrarily continued finite structural navigation/);
assert.match(performanceSource, /No value above is a CI performance threshold or a mathematical maximum depth/);
assert.match(performanceSource, /JavaScript representation constraint, not a theorem or mathematical depth limit/);

const oneStepSource = read("one-step-pullback.js");
assert.match(oneStepSource, /D\^4 runtime metadata/);
assert.match(oneStepSource, /not a map-degree theorem/);
assert.doesNotMatch(oneStepSource, /derived map degree/);

const organizationSource = read("sheet-branch-organization.js");
assert.match(organizationSource, /runtime_numeric_organizational_metadata/);
assert.match(organizationSource, /coveringStructureClaimed: false/);
assert.match(organizationSource, /sheetsMaterialized: false/);

const zoomSource = read("zoom-semantics.js");
assert.match(zoomSource, /geometricZoomApplied: false/);
assert.match(zoomSource, /cameraTransformApplied: false/);
assert.match(zoomSource, /materializationTriggered: false/);

const overlaySource = read("arithmetic-overlays.js");
assert.match(overlaySource, /No exact canonical cyclotomic source artifact was available/);
assert.match(overlaySource, /No exact canonical torsion source artifact was available/);
assert.match(overlaySource, /No exact canonical collision source artifact was available/);
assert.match(overlaySource, /No exact canonical Delta_n\/divisor source artifact was available/);

const workflowSource = read(".github/workflows/formal-verification.yml");
assert.match(workflowSource, /Verify mathematical fidelity v0\.11/);
assert.match(workflowSource, /node verify_mathematical_fidelity_v0_11\.js/);
assert.match(workflowSource, /node --check verify_mathematical_fidelity_v0_11\.js/);

const fidelityTarget = createTarget();
OneStepPullback.renderOneStepPullback(baseCase.scene, baseCase.baseModel, fidelityTarget);
assert.match(fidelityTarget.textContent, /not a map-degree theorem/i);
assert.equal(fidelityTarget.dataset.sheetsMaterialized, "false");

console.log("mathematical fidelity v0.11 claim-discipline verification: passed");
console.log("Lean boundary: coordinate power / iteration / abstract set-theoretic pullback tower only");
console.log("D^2 status: runtime numeric metadata; no sealed metric theorem claimed");
console.log("D^4 status: runtime numeric/organizational metadata; no genuine map-degree or sheet theorem claimed");
console.log("W, genuine sheets, covering geometry, and unavailable arithmetic sources remain explicitly unresolved/unavailable");
console.log("verifier role: repository claim discipline, not mathematical proof");

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = __dirname;
const Semantics = require("./projection-slice-semantics.js");
const ConcreteRuntimeSchema = require("./concrete-runtime-schema.js");

const view = readJson("data/geometric-view.v1.json");
const sceneV2 = readJson("data/system.v2.json");
const matrix = readJson("docs/projection_slice_semantics_matrix_v0_01.json");

const PROTECTED_BLOBS = Object.freeze({
  "README.md": "89d62bcf111d4a3f7ad06ead47889ef2a38499b9",
  "data/system.json": "f131c94d6c05a5537f6832a690e593a56fc3af7d",
  "data/system.v2.json": "0d598560134e45bd3ed2edec62120fa45649883c",
  "scene-spec.js": "20471ef6fab0a685faee956f07a35d82e9a95ba5",
  "concrete-runtime-schema.js": "23cc1d78afa287162107a1b9e8742d74cbf09d0d",
  "app.js": "4b5767b5f5fae9fac25d042e777b150a2ef92c38",
  "base-renderer.js": "fea92139c2a8514f01b9bb187f27bf0131dd4114",
  "one-step-pullback.js": "5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js": "0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js": "9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js": "cecf0f06aa23404a65a6093f705a4fe56be65029",
  "arithmetic-overlays.js": "bfc7331e07b8e12d4b14790ae5a4bc096042544c",
  "structural-camera.js": "c3934ba920be79905d631ee8a886b59527b6b65c",
  "structural-visualization.js": "ce0cfdde97d9a78b4535f4cdfcc9a73961990ab6",
  "visual-provenance.js": "452e651bd772eca69408c1abdc8436dc44365760",
  "verify_concrete_runtime_schema_admission_v0_01.js": "39c925d93919615279165eabed027170f41f3f38",
  "formal/SelfSimilarCY.lean": "6a110e02f244cceaba810a00cd8992321d4a2c77",
  "formal/SelfSimilarCY/Torus4.lean": "53a8f04018b5f452b05f08c755c7d6ee99978275",
  "formal/SelfSimilarCY/TorusCoordinatePower.lean": "f58772332d30dbf68a0815691206e7de1c02f1eb",
  "formal/SelfSimilarCY/LaurentW.lean": "ea6f3ae0b63967b8d9c52428cf825dc53821e781",
  "formal/SelfSimilarCY/BaseFiber.lean": "4561545d5a7443a9d307b9d6f6acc81aa02f9b8a",
  "formal/SelfSimilarCY/StationaryFamily.lean": "aa80176d0ad05d18b8e39c426fded1e8b24eab8f",
  "formal/SelfSimilarCY/ConcretePullbackTower.lean": "32a231cdcd50cbfbcc5f2cd5ce0f86588d2d9984",
  "formal/SelfSimilarCY/TorusPowerKernel.lean": "2ebffc127658cd6bda8464425bac1154c4fbf8c1",
  "formal/SelfSimilarCY/TorusPowerFibers.lean": "0df2e2aa373ef47653793bc2d0c3abcb79f1bd03",
  "formal/SelfSimilarCY/LaurentCritical.lean": "caf9e0af928a76cb6bc14ab2d7d24c68a98b10d6",
  "formal/SelfSimilarCY/LaurentDifferential.lean": "f3a27de774ecaa3b0e232f1fe7f0b06d381da55b",
  "formal/SelfSimilarCY/LaurentImplicit.lean": "65a3315864533a5d016fee50ecb9ec0da0313828"
});

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function gitBlobSha(relativePath) {
  const bytes = fs.readFileSync(path.join(ROOT, relativePath));
  const header = Buffer.from("blob " + bytes.length + "\0", "utf8");
  return crypto.createHash("sha1").update(header).update(bytes).digest("hex");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertReject(mutator, message) {
  const candidate = clone(view);
  mutator(candidate);
  assert.throws(
    () => Semantics.validateViewDescriptor(candidate),
    Semantics.ProjectionSliceSemanticsError,
    message
  );
}

function main() {
  // 1. Gate 2-D and protected implementation remain byte-identical.
  for (const [relativePath, expected] of Object.entries(PROTECTED_BLOBS)) {
    assert.equal(gitBlobSha(relativePath), expected, "protected blob drift: " + relativePath);
  }

  // 2. Canonical view parses, validates, and binds to schema v2 without mutating inputs.
  const viewBefore = JSON.stringify(view);
  const sceneBefore = JSON.stringify(sceneV2);
  const validated = Semantics.validateViewDescriptor(view);
  assert.deepEqual(validated, view);
  const binding = Semantics.validateViewAgainstScene(view, sceneV2);
  assert.equal(binding.semanticMapping, "ordered finite validated X_0 samples -> (Re(z1), Im(z1)) in R^2");
  assert.equal(JSON.stringify(view), viewBefore);
  assert.equal(JSON.stringify(sceneV2), sceneBefore);

  // 3. Concrete schema v2 remains the unique source binding.
  const normalizedScene = ConcreteRuntimeSchema.validateAndNormalizeV2(sceneV2);
  assert.equal(normalizedScene.mathematics.ambient.kind, "algebraic_torus");
  assert.equal(normalizedScene.mathematics.ambient.coordinateCount, 4);
  assert.equal(normalizedScene.mathematics.baseHypersurface.definingFunction.representation.formulaId, "W_kappa_torus4_v1");
  assert.equal(normalizedScene.mathematics.parameterDomain.runtimeRepresentation, "real_slice");

  // 4. Selected semantic route is explicitly a sampled projection to the z1 complex plane.
  assert.equal(view.viewKind, "sampled_projection");
  assert.equal(view.sourceObject, "X_0");
  assert.equal(view.display.dimension, 2);
  assert.equal(view.display.codomain, "R^2");
  assert.deepEqual(view.display.coordinateOrder, ["x", "y"]);
  assert.equal(view.projection.sourceCoordinate, "z1");
  assert.equal(view.projection.sourceIndex, 0);
  assert.equal(view.projection.complexToRealMap[0].expression, "Re(z1)");
  assert.equal(view.projection.complexToRealMap[1].expression, "Im(z1)");
  assert.deepEqual(view.projection.informationDiscarded, ["z2", "z3", "z4"]);
  assert.equal(view.projection.injectiveClaim, false);
  assert.equal(view.slice.kind, "none");
  assert.deepEqual(view.slice.constraints, []);
  assert.deepEqual(view.slice.fixedCoordinates, []);

  // 5. Parameter real_slice must stay parameter-only.
  assert.deepEqual(view.parameterBoundary.appliesTo, ["lambda", "kappa"]);
  assert.equal(view.parameterBoundary.ambientCoordinatesRestrictedToReal, false);

  // 6. Finite sample semantics are honest and deterministic, with no generator implemented here.
  assert.equal(view.sampleSemantics.kind, "ordered_finite_validated_subset");
  assert.equal(view.sampleSemantics.generationImplementation, "not_implemented_in_thread23");
  assert.equal(view.sampleSemantics.requiredFutureGenerationPolicy, "deterministic_no_randomness");
  assert.equal(view.sampleSemantics.randomnessAllowed, false);
  assert.equal(view.sampleSemantics.seedPolicy, "not_applicable");
  assert.equal(view.sampleSemantics.completenessClaim, false);

  // 7. Projection ambiguity and artifact taxonomy remain non-geometric unless independently established.
  assert.equal(view.ambiguity.manyToOnePossible, true);
  assert.equal(view.ambiguity.projectionOverlapImpliesSourceSelfIntersection, false);
  assert.equal(view.artifactPolicy.projectionOverlap, "projection_artifact");
  assert.equal(view.artifactPolicy.branchCutArtifact, "not_applicable_selected_route_has_no_branch");

  // 8. Truth flags remain frozen.
  for (const key of ["geometryRendered", "sheetsMaterialized", "coveringStructureClaimed", "geometricZoomApplied"]) {
    assert.equal(view.truthFlags[key], false);
  }

  // 9. Required negative cases.
  assertReject((x) => { x.viewKind = "full_geometry"; }, "full geometry must reject");
  assertReject((x) => { x.sourceObject = "full_CY"; }, "source object promotion must reject");
  assertReject((x) => { x.display.dimension = 3; }, "display dimension drift must reject");
  assertReject((x) => { x.display.coordinateOrder = ["y", "x"]; }, "ambiguous display order must reject");
  assertReject((x) => { x.projection.sourceCoordinate = "z2"; }, "source-coordinate drift must reject");
  assertReject((x) => { x.projection.complexToRealMap = []; }, "undefined complex-to-real coercion must reject");
  assertReject((x) => { x.projection.injectiveClaim = true; }, "injective claim must reject");
  assertReject((x) => { x.projection.branchConvention = "principal_arg"; }, "branch convention must reject for selected route");
  assertReject((x) => { x.slice.kind = "real_locus"; }, "real-locus promotion must reject");
  assertReject((x) => { x.slice.constraints = ["Im(z1)=0"]; }, "hidden slice constraint must reject");
  assertReject((x) => { x.slice.fixedCoordinates = ["z4"]; }, "hidden fixed coordinate must reject");
  assertReject((x) => { x.parameterBoundary.ambientCoordinatesRestrictedToReal = true; }, "parameter real_slice -> ambient real locus must reject");
  assertReject((x) => { x.sampleSemantics.generationImplementation = "implemented"; }, "Thread 23 sample generation claim must reject");
  assertReject((x) => { x.sampleSemantics.requiredFutureGenerationPolicy = "unspecified"; }, "unstated determinism must reject");
  assertReject((x) => { x.sampleSemantics.randomnessAllowed = true; }, "random sampling must reject");
  assertReject((x) => { x.sampleSemantics.completenessClaim = true; }, "complete sample claim must reject");
  assertReject((x) => { x.ambiguity.projectionOverlapImpliesSourceSelfIntersection = true; }, "projection-overlap self-intersection promotion must reject");
  assertReject((x) => { x.truthFlags.geometryRendered = true; }, "geometryRendered=true must reject");
  assertReject((x) => { x.truthFlags.sheetsMaterialized = true; }, "sheetsMaterialized=true must reject");
  assertReject((x) => { x.truthFlags.coveringStructureClaimed = true; }, "coveringStructureClaimed=true must reject");
  assertReject((x) => { x.truthFlags.geometricZoomApplied = true; }, "geometricZoomApplied=true must reject");
  assertReject((x) => { x.derived = { metricScale: 4 }; }, "D2/D4 semantic promotion via extra fields must reject");

  // 10. Machine audit matrix must cover every candidate route and the selected semantics.
  assert.equal(matrix.thread, "Thread 23");
  assert.equal(matrix.milestone, "Projection / Slice Semantics");
  assert.equal(matrix.preflight.verdict, "PASS");
  assert.deepEqual(matrix.routeComparison.map((route) => route.id), ["P", "S", "R", "L", "Q", "M"]);
  assert.equal(matrix.routeComparison.find((route) => route.id === "P").verdict, "CHOSEN");
  assert.equal(matrix.routeComparison.find((route) => route.id === "R").verdict, "NOT_CHOSEN");
  assert.equal(matrix.routeComparison.find((route) => route.id === "M").verdict, "COMPOSED_WITH_P");
  assert.equal(matrix.selectedView.viewId, view.viewId);
  assert.equal(matrix.selectedView.displayCodomain, "R^2");
  assert.equal(matrix.dimensionBookkeeping.ambientComplexDimension, 4);
  assert.equal(matrix.dimensionBookkeeping.baseFiberExpectedComplexDimensionUnderRegularLevelHypotheses, 3);
  assert.equal(matrix.dimensionBookkeeping.baseFiberExpectedRealDimensionUnderRegularLevelHypotheses, 6);
  assert.equal(matrix.dimensionBookkeeping.displayRealDimension, 2);
  assert.equal(matrix.complexToRealConvention.implicitComplexToRealCoercionAllowed, false);
  assert.equal(matrix.informationLossPolicy.injectivityClaim, false);
  assert.equal(matrix.informationLossPolicy.reconstructionClaim, false);
  assert.equal(matrix.informationLossPolicy.fullGeometryClaim, false);
  assert.equal(matrix.samplingPolicy.randomnessAllowed, false);
  assert.equal(matrix.samplingPolicy.completenessClaim, false);
  assert.equal(matrix.truthFlags.geometryRendered, false);

  // 11. Human contract must carry exact UI and non-promotion language.
  const human = read("docs/PROJECTION_SLICE_SEMANTICS_CONTRACT_v0_01.md");
  assert.ok(human.includes("Sampled projection of X_0 onto the z_1 complex plane"));
  assert.ok(human.includes("projection overlap != source self-intersection"));
  assert.ok(human.includes("parameter real_slice declaration does not imply z_i in R"));
  assert.ok(human.includes("READY FOR THREAD 24 BASE GEOMETRIC RENDERER"));
  assert.ok(human.includes("Thread 23 does not implement a sample generator"));

  // 12. Geometry-producing modules remain absent in Thread 23.
  for (const forbidden of ["geometric-renderer.js", "sampler.js", "mesh.js", "contour.js"]) {
    assert.equal(fs.existsSync(path.join(ROOT, forbidden)), false, forbidden + " must not exist in Thread 23");
  }

  // 13. CI ordering: Gate 2-D stays first, then Thread 23, and syntax checks cover the new semantic code.
  const workflow = read(".github/workflows/formal-verification.yml");
  const gate2DCommand = "node verify_concrete_runtime_schema_admission_v0_01.js";
  const thread23Command = "node verify_projection_slice_semantics_v0_01.js";
  assert.ok(workflow.includes(gate2DCommand));
  assert.ok(workflow.includes(thread23Command));
  assert.ok(workflow.indexOf(gate2DCommand) < workflow.indexOf(thread23Command));
  assert.ok(workflow.includes("node --check projection-slice-semantics.js"));
  assert.ok(workflow.includes("node --check verify_projection_slice_semantics_v0_01.js"));

  console.log("Thread 23 projection / slice semantics verifier: PASS");
  console.log("Selected view: sampled projection of X_0 to the z_1 complex plane");
  console.log("Map: z -> (Re(z1), Im(z1)) in R^2");
  console.log("Slice constraints: none");
  console.log("Sample generation: not implemented; future deterministic non-random policy required");
  console.log("Projection overlap: projection artifact, not source self-intersection");
  console.log("Truth flags: all remain false");
  console.log("Renderer authorization: Thread 24 input contract only");
}

main();

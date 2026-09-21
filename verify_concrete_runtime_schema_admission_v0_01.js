"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = __dirname;
const LegacySceneSpec = require("./scene-spec.js");
const ConcreteRuntimeSchema = require("./concrete-runtime-schema.js");

const gate2B = readJson("docs/concrete_runtime_schema_contract_v0_01.json");
const systemV1 = readJson("data/system.json");
const systemV2 = readJson("data/system.v2.json");

const PROTECTED_BLOBS = Object.freeze({
  "README.md": "89d62bcf111d4a3f7ad06ead47889ef2a38499b9",
  "data/system.json": "f131c94d6c05a5537f6832a690e593a56fc3af7d",
  "scene-spec.js": "20471ef6fab0a685faee956f07a35d82e9a95ba5",
  "base-renderer.js": "fea92139c2a8514f01b9bb187f27bf0131dd4114",
  "one-step-pullback.js": "5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js": "0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js": "9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js": "cecf0f06aa23404a65a6093f705a4fe56be65029",
  "arithmetic-overlays.js": "bfc7331e07b8e12d4b14790ae5a4bc096042544c",
  "structural-camera.js": "c3934ba920be79905d631ee8a886b59527b6b65c",
  "visual-provenance.js": "452e651bd772eca69408c1abdc8436dc44365760",
  "verify_concrete_runtime_schema_contract_v0_01.js": "ca7dc3e79fbd4d4cbdc752eca7842ce556e06a5b",
  "docs/CONCRETE_GEOMETRY_ADMISSION_CONTRACT_v0_01.md": "ff859e2fc1c1648bb189cd491ab27d04532e3b83",
  "docs/concrete_geometry_admission_matrix_v0_01.json": "a0462a88a1c0027d898374330af6b0e719b0b654",
  "docs/CONCRETE_RUNTIME_SCHEMA_CONTRACT_v0_01.md": "557c45582aacfea1279b2bfacd81eb059c71967f",
  "docs/concrete_runtime_schema_contract_v0_01.json": "8c0e01c02c5f2ef5267615344eb8b7c27bb4c3e5",
  "formal/lean-toolchain": "12359f928f18e4a89ebd1444a0310b025931b17d",
  "formal/lakefile.toml": "f34b3a198afc8b76e6dc05998d7fd1d3cec38922",
  "formal/lake-manifest.json": "b3ce76d02db0f3801ecb32abbbcfcb8eeed53803",
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
  "formal/SelfSimilarCY/LaurentImplicit.lean": "65a3315864533a5d016fee50ecb9ec0da0313828",
  "verify_scene_spec_v0_03.js": "fb946191448b73d93e5bc1f19c2f6fd227117d29",
  "verify_base_renderer_v0_04.js": "4595006d5523a84495d3725d5b7e18ea30998e2d",
  "verify_one_step_pullback_v0_05.js": "95192aca85e272e8704c10c29913aa38e50d4350",
  "verify_recursive_lazy_expansion_v0_06.js": "6f60d85e456bd04b564a7d7bc5bc9356a2c75cdf",
  "verify_zoom_semantics_v0_07.js": "63716b7c8a79670eb535fc095b53e9aaea4dc153",
  "verify_sheet_branch_organization_v0_08.js": "0b1c4cb05a74e7cfe36e34acf000fca0f4d16ea3",
  "verify_arithmetic_overlays_v0_09.js": "b7b857b456598691134af505b895db3c8247c5e6",
  "verify_mathematical_fidelity_v0_11.js": "b43f883c8e9638ff34e5ed42788d3e0259bc273e",
  "verify_public_structural_visualizer_rc_v1_0_rc1.js": "66ec64464ad1fdd0423a883822e1c7aeeecc3b34",
  "verify_mathematical_visual_fidelity_v0_21.js": "c86fc6ffb2838edf1e51702417433d21ea50c112"
});

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function gitBlobSha(relativePath) {
  const bytes = fs.readFileSync(path.join(ROOT, relativePath));
  const header = Buffer.from(`blob ${bytes.length}\0`, "utf8");
  return crypto.createHash("sha1").update(header).update(bytes).digest("hex");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function assertRejectV2(mutator, label) {
  const candidate = clone(systemV2);
  mutator(candidate);
  assert.throws(
    () => ConcreteRuntimeSchema.validateAndNormalizeScene(candidate),
    undefined,
    label
  );
}

function main() {
  // 1. Gate 2-C authority and protected historical/runtime/formal integrity.
  for (const [relativePath, expectedBlob] of Object.entries(PROTECTED_BLOBS)) {
    assert.equal(gitBlobSha(relativePath), expectedBlob, `Protected Gate 2-D precondition drift: ${relativePath}`);
  }
  const appSource = read("app.js");
  assert.ok(appSource.includes('fetch("data/system.json"'));
  assert.ok(appSource.includes("SceneSpec.validateAndNormalizeScene(rawScene)"));
  assert.ok(!appSource.includes('fetch("data/system.v2.json"'));
  assert.ok(!appSource.includes("GeometricPullbackEngine.generateLevels"));

  assert.equal(systemV1.schemaVersion, 1);
  assert.equal(systemV1.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

  // 2. Canonical v2 fixture is exactly the sealed Gate 2-B target shape.
  assert.deepEqual(systemV2, gate2B.targetSchemaShape);
  assert.equal(systemV2.schemaVersion, 2);
  assert.equal(hasOwn(systemV2.mathematics.pullbackMap, "coordinateCount"), false);
  assert.equal(hasOwn(systemV2.mathematics.ambient, "nonzeroCoordinates"), false);
  assert.equal(hasOwn(systemV2, "derived"), false);

  // 3. Formula registry is the sealed Route C identity. No evaluator is admitted.
  const formulaId = gate2B.functionRepresentation.formulaId;
  assert.equal(formulaId, "W_kappa_torus4_v1");
  assert.equal(ConcreteRuntimeSchema.FORMULA_ID, formulaId);
  assert.deepEqual(
    JSON.parse(JSON.stringify(ConcreteRuntimeSchema.BUILTIN_FORMULA_REGISTRY[formulaId])),
    gate2B.functionRepresentation.formulaRegistry[formulaId]
  );
  assert.equal(ConcreteRuntimeSchema.FULL_COMPLEX_RUNTIME_SUPPORT, false);

  const runtimeSource = read("concrete-runtime-schema.js");
  assert.ok(!runtimeSource.includes("evaluateW"));
  assert.ok(!runtimeSource.includes("sampleW"));
  assert.ok(!runtimeSource.includes("geometryRendered: true"));
  assert.ok(!runtimeSource.includes("sheetsMaterialized: true"));
  assert.ok(!runtimeSource.includes("coveringStructureClaimed: true"));
  assert.ok(!runtimeSource.includes("geometricZoomApplied: true"));

  // 4. Version dispatch preserves exact v1 semantics without auto-migration.
  const legacyNormalized = LegacySceneSpec.validateAndNormalizeScene(systemV1);
  const dispatchedV1 = ConcreteRuntimeSchema.validateAndNormalizeScene(systemV1);
  assert.deepEqual(dispatchedV1, legacyNormalized);
  assert.equal(dispatchedV1.schemaVersion, 1);
  assert.equal(dispatchedV1.mathematics.baseHypersurface.definingFunction.representation, "unresolved");
  assert.equal(systemV1.schemaVersion, 1);

  const v1Concrete = clone(systemV1);
  v1Concrete.mathematics.baseHypersurface.definingFunction.representation = {
    kind: "builtin_formula",
    formulaId,
    coefficientParameter: "kappa"
  };
  assert.throws(() => ConcreteRuntimeSchema.validateAndNormalizeScene(v1Concrete));

  // 5. Explicit v1 -> v2 migration is one-way, exact, and non-mutating.
  const v1BeforeMigration = clone(systemV1);
  const migrated = ConcreteRuntimeSchema.migrateV1ToV2(systemV1);
  assert.deepEqual(systemV1, v1BeforeMigration);
  assert.equal(systemV1.schemaVersion, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(migrated)), systemV2);
  assert.equal(migrated.schemaVersion, 2);

  // 6. v2 validation and normalized compatibility representation.
  const normalizedV2 = ConcreteRuntimeSchema.validateAndNormalizeScene(systemV2);
  assert.equal(normalizedV2.schemaVersion, 2);
  assert.equal(normalizedV2.mathematics.parameters.D, 2);
  assert.equal(normalizedV2.mathematics.parameters.lambda, 1);
  assert.equal(normalizedV2.mathematics.parameters.kappa, 1);
  assert.deepEqual(normalizedV2.mathematics.parameterDomain.appliesTo, ["lambda", "kappa"]);
  assert.equal(normalizedV2.mathematics.parameterDomain.sourceField, "complex");
  assert.equal(normalizedV2.mathematics.parameterDomain.runtimeRepresentation, "real_slice");
  assert.equal(normalizedV2.mathematics.parameterDomain.embedding, "real_to_complex");
  assert.equal(normalizedV2.mathematics.ambient.kind, "algebraic_torus");
  assert.equal(normalizedV2.mathematics.ambient.coordinateCount, 4);
  assert.equal(normalizedV2.mathematics.ambient.baseField, "complex");
  assert.equal(normalizedV2.mathematics.ambient.nonzeroCoordinates, true);
  assert.equal(normalizedV2.mathematics.pullbackMap.coordinateCount, 4);
  assert.equal(normalizedV2.mathematics.pullbackMap.exponentParameter, "D");
  assert.equal(normalizedV2.mathematics.baseHypersurface.levelParameter, "lambda");
  assert.equal(normalizedV2.mathematics.baseHypersurface.definingFunction.representation.kind, "builtin_formula");
  assert.equal(normalizedV2.mathematics.baseHypersurface.definingFunction.representation.formulaId, formulaId);
  assert.equal(normalizedV2.mathematics.baseHypersurface.definingFunction.representation.coefficientParameter, "kappa");
  assert.equal(normalizedV2.derived.metricScale, 4);
  assert.equal(normalizedV2.derived.sheetDegree, 16);
  assert.equal(normalizedV2.derived.definingFunctionAst.kind, "sum");

  // D^2 / D^4 remain compatibility numeric metadata only.
  assert.equal(hasOwn(normalizedV2.derived, "mapDegree"), false);
  assert.equal(hasOwn(normalizedV2.derived, "logMetricScale"), false);
  assert.equal(hasOwn(normalizedV2.derived, "renderedSheets"), false);
  assert.equal(hasOwn(normalizedV2, "geometryRendered"), false);
  assert.equal(hasOwn(normalizedV2, "sheetsMaterialized"), false);
  assert.equal(hasOwn(normalizedV2, "coveringStructureClaimed"), false);
  assert.equal(hasOwn(normalizedV2, "geometricZoomApplied"), false);

  // Parameter-regime truth is not stored or inferred as scheme smoothness authority.
  assert.equal(hasOwn(systemV2, "smooth"), false);
  assert.equal(hasOwn(systemV2, "principalRegime"), false);
  assert.equal(hasOwn(systemV2, "fullSmoothRegime"), false);
  assert.equal(hasOwn(systemV2, "singularRegime"), false);
  assert.ok(!runtimeSource.includes("lambda ** 5"));
  assert.ok(!runtimeSource.includes("schemeSmooth"));

  // 7. Required rejection matrix.
  assertRejectV2((x) => { x.schemaVersion = 3; }, "schemaVersion=3 must reject");
  assertRejectV2((x) => { delete x.mathematics.parameterDomain; }, "missing parameterDomain must reject");
  assertRejectV2((x) => { x.mathematics.parameterDomain.sourceField = "real"; }, "sourceField drift must reject");
  assertRejectV2((x) => { x.mathematics.parameterDomain.runtimeRepresentation = "complex_object"; }, "runtimeRepresentation drift must reject");
  assertRejectV2((x) => { x.mathematics.parameterDomain.embedding = "identity"; }, "embedding drift must reject");
  assertRejectV2((x) => { x.mathematics.ambient.kind = "affine_space"; }, "ambient kind drift must reject");
  assertRejectV2((x) => { x.mathematics.ambient.coordinateCount = 5; }, "ambient coordinateCount drift must reject");
  assertRejectV2((x) => { x.mathematics.ambient.baseField = "real"; }, "ambient baseField drift must reject");
  assertRejectV2((x) => { x.mathematics.ambient.nonzeroCoordinates = true; }, "redundant stored nonzeroCoordinates must reject");
  assertRejectV2((x) => { x.mathematics.pullbackMap.coordinateCount = 4; }, "stored v2 pullback coordinateCount must reject");
  assertRejectV2((x) => { x.mathematics.baseHypersurface.definingFunction.representation.formulaId = "unknown_formula"; }, "unknown formulaId must reject");
  assertRejectV2((x) => { x.mathematics.baseHypersurface.definingFunction.representation.ast = {}; }, "duplicate stored AST must reject");
  assertRejectV2((x) => { x.mathematics.baseHypersurface.definingFunction.representation.coefficientParameter = "lambda"; }, "coefficientParameter drift must reject");
  assertRejectV2((x) => { x.mathematics.baseHypersurface.levelParameter = "kappa"; }, "levelParameter drift must reject");
  assertRejectV2((x) => { x.mathematics.pullbackMap.exponentParameter = "lambda"; }, "exponentParameter drift must reject");
  assertRejectV2((x) => { x.mathematics.baseHypersurface.smooth = true; }, "stored smooth theorem flag must reject");
  assertRejectV2((x) => { x.mathematics.pullbackMap.mapDegree = 16; }, "stored mapDegree authority must reject");
  assertRejectV2((x) => { x.mathematics.pullbackMap.renderedSheets = 16; }, "stored rendered-sheet authority must reject");
  assertRejectV2((x) => { x.geometryRendered = true; }, "geometryRendered=true must reject");
  assertRejectV2((x) => { x.sheetsMaterialized = true; }, "sheetsMaterialized=true must reject");
  assertRejectV2((x) => { x.coveringStructureClaimed = true; }, "coveringStructureClaimed=true must reject");
  assertRejectV2((x) => { x.geometricZoomApplied = true; }, "geometricZoomApplied=true must reject");
  assertRejectV2((x) => { x.mathematics.baseHypersurface.definingFunction.representation = "unresolved"; }, "v2 unresolved W must reject");
  assertRejectV2((x) => { x.mathematics.parameters.lambda = Infinity; }, "non-finite lambda must reject");
  assertRejectV2((x) => { x.mathematics.parameters.kappa = { re: 1, im: 0 }; }, "complex-object kappa must reject");
  assertRejectV2((x) => { x.mathematics.parameters.D = 1; }, "D<2 must reject");

  // 8. Derived AST is registry-derived and not a stored source of formula authority.
  const ast = ConcreteRuntimeSchema.deriveFormulaAst(formulaId);
  assert.equal(ast.kind, "sum");
  assert.equal(ast.terms.length, 2);
  assert.equal(ast.terms[0].kind, "coordinate_sum");
  assert.equal(ast.terms[0].coordinateCount, 4);
  assert.equal(ast.terms[1].kind, "scaled_reciprocal_coordinate_product");
  assert.equal(ast.terms[1].coefficientParameter, "kappa");
  assert.equal(ast.terms[1].coordinateCount, 4);

  // 9. The historical Gate 2-C/2-D jobs were retired from current main CI.
  // Keep syntax and the current runtime checks; no present-day CI claim is made
  // from a byte-pinned checkpoint verifier.
  const workflow = read(".github/workflows/formal-verification.yml");
  assert.ok(workflow.includes("node --check concrete-runtime-schema.js"));
  assert.ok(workflow.includes("node --check verify_concrete_runtime_schema_admission_v0_01.js"));

  console.log("Gate 2-D non-rendering runtime/schema admission verifier: PASS");
  console.log(`Protected historical/runtime/formal blobs checked: ${Object.keys(PROTECTED_BLOBS).length}`);
  console.log("Version dispatch: v1 immutable / v2 concrete non-rendering");
  console.log("Migration: explicit v1 -> v2 only");
  console.log("Formula registry: W_kappa_torus4_v1");
  console.log("Parameter route: complex source / real_slice runtime / real_to_complex");
  console.log("D^2 / D^4: compatibility numeric metadata only");
  console.log("Truth flags: all remain false / unstored");
  console.log("Renderer authorization: none");
}

main();

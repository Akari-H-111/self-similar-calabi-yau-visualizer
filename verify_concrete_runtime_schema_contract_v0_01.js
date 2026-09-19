"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = __dirname;

const CANONICAL = Object.freeze({
  gate2BCommit: "26a83e0f4c2a549064bc98527704ed95a00fc441",
  gate2BTree: "9809e1ff3157271f5670ca9e1bc911a135cfb903",
  gate2BParent: "d7bc212d51e9800aa743b06a58bf69b0267c8569",
  gate2BHumanBlob: "557c45582aacfea1279b2bfacd81eb059c71967f",
  gate2BMachineBlob: "8c0e01c02c5f2ef5267615344eb8b7c27bb4c3e5",
  gate2AHumanBlob: "ff859e2fc1c1648bb189cd491ab27d04532e3b83",
  gate2AMachineBlob: "a0462a88a1c0027d898374330af6b0e719b0b654"
});

const PROTECTED_GATE2C_BLOBS = Object.freeze({
  "README.md": "89d62bcf111d4a3f7ad06ead47889ef2a38499b9",
  "data/system.json": "f131c94d6c05a5537f6832a690e593a56fc3af7d",
  "scene-spec.js": "20471ef6fab0a685faee956f07a35d82e9a95ba5",
  "app.js": "4b5767b5f5fae9fac25d042e777b150a2ef92c38",
  "base-renderer.js": "fea92139c2a8514f01b9bb187f27bf0131dd4114",
  "one-step-pullback.js": "5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js": "0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js": "9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js": "cecf0f06aa23404a65a6093f705a4fe56be65029",
  "arithmetic-overlays.js": "bfc7331e07b8e12d4b14790ae5a4bc096042544c",
  "structural-camera.js": "c3934ba920be79905d631ee8a886b59527b6b65c",
  "visual-provenance.js": "452e651bd772eca69408c1abdc8436dc44365760",
  "docs/CONCRETE_GEOMETRY_ADMISSION_CONTRACT_v0_01.md": "ff859e2fc1c1648bb189cd491ab27d04532e3b83",
  "docs/concrete_geometry_admission_matrix_v0_01.json": "a0462a88a1c0027d898374330af6b0e719b0b654",
  "docs/CONCRETE_RUNTIME_SCHEMA_CONTRACT_v0_01.md": "557c45582aacfea1279b2bfacd81eb059c71967f",
  "docs/concrete_runtime_schema_contract_v0_01.json": "8c0e01c02c5f2ef5267615344eb8b7c27bb4c3e5",
  "docs/CONTRACT_BRIDGE_AUDIT_self_similar_cy_visualizer_v0_05.md": "29db0d26e2907cc995e1c4673cd30ee280f8fead",
  "docs/contract_bridge_matrix_self_similar_cy_visualizer_v0_05.json": "0fc903f7c3892b83665ec28cee5c5f588ec77aff",
  "docs/MATHEMATICAL_VISUAL_FIDELITY_AUDIT_II_self_similar_cy_visualizer_v0_21.md": "561eb9962d5b6c1dce70a49e7024abc3730687a5",
  "docs/visual_provenance_matrix_self_similar_cy_visualizer_v0_21.json": "bd79648785f4b56ef9801e46469f7339e5f133f9",
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

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function assertSubset(actual, required, label) {
  for (const value of required) {
    assert.ok(actual.includes(value), `${label} missing required value: ${value}`);
  }
}

function main() {
  const gate2A = readJson("docs/concrete_geometry_admission_matrix_v0_01.json");
  const gate2B = readJson("docs/concrete_runtime_schema_contract_v0_01.json");
  const systemV1 = readJson("data/system.json");
  const sceneSpecSource = read("scene-spec.js");
  const fidelityMatrix = readJson("docs/visual_provenance_matrix_self_similar_cy_visualizer_v0_21.json");
  const fidelityVerifier = read("verify_mathematical_visual_fidelity_v0_21.js");

  // 1. Canonical artifact and protected-file integrity.
  assert.equal(gitBlobSha("docs/CONCRETE_GEOMETRY_ADMISSION_CONTRACT_v0_01.md"), CANONICAL.gate2AHumanBlob);
  assert.equal(gitBlobSha("docs/concrete_geometry_admission_matrix_v0_01.json"), CANONICAL.gate2AMachineBlob);
  assert.equal(gitBlobSha("docs/CONCRETE_RUNTIME_SCHEMA_CONTRACT_v0_01.md"), CANONICAL.gate2BHumanBlob);
  assert.equal(gitBlobSha("docs/concrete_runtime_schema_contract_v0_01.json"), CANONICAL.gate2BMachineBlob);

  for (const [relativePath, expectedBlob] of Object.entries(PROTECTED_GATE2C_BLOBS)) {
    assert.equal(
      gitBlobSha(relativePath),
      expectedBlob,
      `Gate 2-C protected file drift: ${relativePath}`
    );
  }

  // 2. Gate 2-B machine artifact structure.
  const requiredSections = [
    "schemaVersion",
    "proposalVersion",
    "currentSchemaVersion",
    "targetSchemaVersion",
    "compatibilityPolicy",
    "ambientRepresentation",
    "parameterRepresentation",
    "functionRepresentation",
    "baseFiberRepresentation",
    "parameterRegimeRepresentation",
    "provenanceBinding",
    "derivedVsStoredPolicy",
    "migrationPolicy",
    "validationRules",
    "consumerImpact",
    "truthFlagPolicy",
    "forbiddenSemanticPromotions",
    "gate2CVerifierSpecification",
    "verdict"
  ];
  for (const section of requiredSections) {
    assert.ok(hasOwn(gate2B, section), `Gate 2-B required section missing: ${section}`);
  }

  assert.equal(gate2B.schemaVersion, 1, "Gate 2-B artifact schema version drifted.");
  assert.equal(gate2B.proposalVersion, "v0.01");
  assert.equal(gate2B.currentSchemaVersion, 1);
  assert.equal(gate2B.targetSchemaVersion, 2);
  assert.equal(gate2B.chosenRoute.schemaRoute, "C");
  assert.equal(gate2B.chosenRoute.name, "builtin_mathematical_family_contract");
  assert.equal(gate2B.chosenRoute.parameterRoute, "R");
  assert.equal(gate2B.chosenRoute.parameterPolicy, "real_slice_of_complex_family");

  // 3. Breaking migration and immutable v1 semantics.
  assert.equal(gate2B.compatibilityPolicy.changeClass, "BREAKING");
  assert.equal(gate2B.compatibilityPolicy.v1Policy, "immutable_legacy_contract");
  assert.equal(gate2B.compatibilityPolicy.v2Policy, "new_concrete_non_rendering_contract");
  assert.equal(gate2B.compatibilityPolicy.dispatchPolicy, "version_dispatch_without_reinterpreting_v1");
  assert.equal(gate2B.compatibilityPolicy.historicalFixtures, "must_remain_reproducible_without_auto_migration");
  assert.equal(gate2B.migrationPolicy.direction, "v1_to_v2_explicit_one_way");
  assert.equal(gate2B.migrationPolicy.automaticMigrationOfHistoricalFixtures, false);
  assert.equal(gate2B.migrationPolicy.v1MeaningMustNotChange, true);

  assert.equal(systemV1.schemaVersion, 1);
  assert.equal(systemV1.mathematics.baseHypersurface.definingFunction.symbol, "W");
  assert.equal(systemV1.mathematics.baseHypersurface.definingFunction.representation, "unresolved");
  assert.ok(Number.isSafeInteger(systemV1.mathematics.parameters.D));
  assert.ok(systemV1.mathematics.parameters.D >= 2);
  assert.ok(Number.isFinite(systemV1.mathematics.parameters.lambda));
  assert.ok(Number.isFinite(systemV1.mathematics.parameters.kappa));

  assert.ok(sceneSpecSource.includes("const SUPPORTED_SCHEMA_VERSION = 1;"));
  assert.ok(sceneSpecSource.includes("assertExactKeys"));
  assert.ok(sceneSpecSource.includes('must remain "unresolved" in schema version 1.'));
  assert.ok(sceneSpecSource.includes("const metricScale = parameters.D ** 2;"));
  assert.ok(sceneSpecSource.includes("const sheetDegree = parameters.D ** 4;"));
  assert.ok(sceneSpecSource.includes("Number.isFinite"));
  assert.ok(sceneSpecSource.includes("Number.isSafeInteger"));

  // 4. Ambient representation and real-slice parameter domain.
  assert.deepEqual(gate2B.ambientRepresentation.stored, {
    kind: "algebraic_torus",
    coordinateCount: 4,
    baseField: "complex"
  });
  assert.deepEqual(gate2B.ambientRepresentation.derived, { nonzeroCoordinates: true });
  assert.deepEqual(gate2B.ambientRepresentation.claimIds, ["ambient.torus4"]);

  assert.deepEqual(gate2B.parameterRepresentation.domainDescriptor, {
    appliesTo: ["lambda", "kappa"],
    sourceField: "complex",
    runtimeRepresentation: "real_slice",
    embedding: "real_to_complex"
  });
  assert.equal(gate2B.parameterRepresentation.sourceParameterDomain, "complex");
  assert.equal(gate2B.parameterRepresentation.runtimeParameterDomain, "finite_JavaScript_real_numbers");
  assert.equal(gate2B.parameterRepresentation.embeddingPolicy, "real_to_complex");
  assert.equal(gate2B.parameterRepresentation.fullComplexRuntimeSupport, false);

  // 5. Formula registry uniqueness and W_kappa semantics.
  const formulaId = gate2B.functionRepresentation.formulaId;
  const registry = gate2B.functionRepresentation.formulaRegistry;
  assert.equal(formulaId, "W_kappa_torus4_v1");
  assert.equal(gate2B.functionRepresentation.kind, "builtin_formula");
  assert.equal(gate2B.functionRepresentation.coefficientParameter, "kappa");
  assert.equal(gate2B.functionRepresentation.expressionRepresentation, "derived_from_versioned_builtin_registry");
  assert.equal(gate2B.functionRepresentation.storedAst, false);
  assert.deepEqual(Object.keys(registry), [formulaId]);

  const formula = registry[formulaId];
  assert.equal(formula.semanticKind, "coordinate_sum_plus_scaled_reciprocal_coordinate_product");
  assert.equal(formula.ambientKind, "algebraic_torus");
  assert.equal(formula.coordinateCount, 4);
  assert.equal(formula.coefficientParameter, "kappa");
  assert.equal(formula.mathematicalExpansion, "sum_i(z_i) + kappa / product_i(z_i)");
  assert.deepEqual(formula.claimIds, ["function.W_kappa"]);

  // 6. Target v2 reference graph is self-consistent and non-duplicative.
  const target = gate2B.targetSchemaShape;
  assert.equal(target.schemaVersion, 2);
  assert.deepEqual(target.mathematics.parameterDomain, gate2B.parameterRepresentation.domainDescriptor);
  assert.deepEqual(target.mathematics.ambient, gate2B.ambientRepresentation.stored);
  assert.equal(hasOwn(target.mathematics.ambient, "nonzeroCoordinates"), false);
  assert.equal(target.mathematics.pullbackMap.kind, "coordinate_power");
  assert.equal(target.mathematics.pullbackMap.exponentParameter, "D");
  assert.equal(hasOwn(target.mathematics.pullbackMap, "coordinateCount"), false);
  assert.equal(target.mathematics.baseHypersurface.kind, "level_set");
  assert.equal(target.mathematics.baseHypersurface.definingFunction.representation.kind, "builtin_formula");
  assert.equal(target.mathematics.baseHypersurface.definingFunction.representation.formulaId, formulaId);
  assert.equal(target.mathematics.baseHypersurface.definingFunction.representation.coefficientParameter, "kappa");
  assert.equal(target.mathematics.baseHypersurface.levelParameter, "lambda");
  assert.equal(target.mathematics.ambient.kind, formula.ambientKind);
  assert.equal(target.mathematics.ambient.coordinateCount, formula.coordinateCount);
  assert.ok(hasOwn(target.mathematics.parameters, target.mathematics.pullbackMap.exponentParameter));
  assert.ok(hasOwn(target.mathematics.parameters, target.mathematics.baseHypersurface.levelParameter));
  assert.ok(hasOwn(target.mathematics.parameters, formula.coefficientParameter));

  // 7. Provenance claim-ID resolution and authority boundary.
  const claims = new Map(gate2A.claims.map((claim) => [claim.id, claim]));
  const expectedScopes = {
    "ambient.torus4": "ambient",
    "parameter.lambda": "parameters",
    "parameter.kappa": "parameters",
    "map.P_D": "ambient_map",
    "function.W_kappa": "base_function",
    "base.X0": "base_fiber"
  };
  const allBindings = [
    ...gate2B.provenanceBinding.bindings,
    ...gate2B.provenanceBinding.formulaBindings
  ];
  for (const binding of allBindings) {
    for (const claimId of binding.claimIds) {
      const claim = claims.get(claimId);
      assert.ok(claim, `Unresolved Gate 2-A provenance claim ID: ${claimId}`);
      assert.equal(claim.scope, expectedScopes[claimId], `Scope mismatch for ${claimId}`);
      assert.ok(!String(claim.admission?.status || "").includes("NOT_ADMITTED"), `Non-admitted claim used by Gate 2-B: ${claimId}`);
    }
  }

  assert.equal(
    claims.get("function.W_kappa").mathematicalStatement,
    "W_kappa(z1,z2,z3,z4)=z1+z2+z3+z4+kappa/(z1 z2 z3 z4), on T=(C^×)^4."
  );
  assert.equal(claims.get("function.W_kappa").runtime.status, "UNRESOLVED");
  assert.equal(claims.get("base.X0").runtime.status, "UNRESOLVED");
  assert.equal(claims.get("ambient.torus4").renderer.status, "NOT_ADMITTED");
  assert.equal(claims.get("function.W_kappa").renderer.status, "NOT_ADMITTED");
  assert.equal(claims.get("base.X0").renderer.status, "NOT_ADMITTED");

  // 8. Parameter regime is verifier-derived evidence, never mutable theorem input.
  assert.equal(gate2B.parameterRegimeRepresentation.storedInSystemJson, false);
  assert.equal(gate2B.parameterRegimeRepresentation.validatorClaimsSmoothness, false);
  assert.deepEqual(gate2B.parameterRegimeRepresentation.availableSourcePredicates, {
    principalRegime: "kappa != 0 AND lambda^5 != 5^5*kappa",
    fullSmoothRegime: "kappa == 0 OR lambda^5 != 5^5*kappa",
    singularRegime: "kappa != 0 AND lambda^5 == 5^5*kappa"
  });
  assert.equal(hasOwn(target, "smooth"), false);
  assert.equal(hasOwn(target, "principalRegime"), false);

  // 9. Derived-vs-stored policy and D^2 / D^4 semantic freeze.
  assertSubset(gate2B.derivedVsStoredPolicy.derived, [
    "ambient.nonzeroCoordinates",
    "pullbackMap.coordinateCount",
    "D^2 numeric metadata",
    "D^4 numeric metadata",
    "canonical expression AST for W_kappa_torus4_v1"
  ], "derivedVsStoredPolicy.derived");

  assertSubset(gate2B.derivedVsStoredPolicy.notAllowed, [
    "stored smooth=true/false theorem flag",
    "stored mapDegree theorem field",
    "stored rendered sheet count as mathematical authority",
    "stored geometryRendered=true caused only by schema representation",
    "stored duplicate AST plus formulaId authority"
  ], "derivedVsStoredPolicy.notAllowed");

  assert.equal(gate2B.normalizedCompatibilityAliases["derived.metricScale"].source, "D^2");
  assert.equal(gate2B.normalizedCompatibilityAliases["derived.metricScale"].theoremPromotion, false);
  assert.equal(gate2B.normalizedCompatibilityAliases["derived.sheetDegree"].source, "D^4");
  assert.equal(gate2B.normalizedCompatibilityAliases["derived.sheetDegree"].theoremPromotion, false);
  assert.equal(gate2B.normalizedCompatibilityAliases["mathematics.pullbackMap.coordinateCount"].storedInV2, false);

  assertSubset(gate2B.forbiddenSemanticPromotions, [
    "D^4 numeric metadata != kernel theorem != fiber theorem != map degree != rendered sheets",
    "D^2 numeric metadata != logarithmic metric theorem != geometric zoom",
    "real-slice runtime != full complex family",
    "provenance reference != proof"
  ], "forbiddenSemanticPromotions");

  // 10. Truth flags stay false at both authority and representation layers.
  const truthFlags = [
    "geometryRendered",
    "sheetsMaterialized",
    "coveringStructureClaimed",
    "geometricZoomApplied"
  ];
  for (const flag of truthFlags) {
    assert.equal(gate2B.truthFlagPolicy[flag], false, `Gate 2-B truth flag promoted: ${flag}`);
    assert.equal(gate2A.truthBoundary[flag], false, `Gate 2-A truth flag promoted: ${flag}`);
  }
  assert.equal(gate2A.truthBoundary.WRepresentation, "unresolved");

  // 11. Historical v1 provenance snapshot remains explicit and reproducible.
  assert.equal(fidelityMatrix.schemaVersion, 1);
  assert.deepEqual(fidelityMatrix.truthBoundary, {
    requestedDepth: 0,
    D: 2,
    W: "unresolved",
    geometryRendered: false,
    sheetsMaterialized: false,
    coveringStructureClaimed: false,
    geometricZoomApplied: false
  });
  assert.ok(fidelityVerifier.includes("assert.deepEqual(matrix.truthBoundary"));
  assert.ok(fidelityVerifier.includes('W: "unresolved"'));
  assert.ok(fidelityVerifier.includes("geometryRendered: false"));
  assert.ok(fidelityVerifier.includes("sheetsMaterialized: false"));
  assert.ok(fidelityVerifier.includes("coveringStructureClaimed: false"));
  assert.ok(fidelityVerifier.includes("geometricZoomApplied: false"));

  // 12. Final contract verdict remains verifier-only, not renderer authorization.
  assert.equal(gate2B.verdict, "READY_FOR_SCHEMA_VERIFIER");
  assert.equal(gate2B.truthFlagPolicy.rule, "schema representability does not transition any renderer or geometry truth flag");

  console.log("Gate 2-C provenance/schema verifier: PASS");
  console.log(`Protected canonical blobs checked: ${Object.keys(PROTECTED_GATE2C_BLOBS).length}`);
  console.log("Schema route: C / builtin mathematical-family contract");
  console.log("Parameter route: R / real slice of complex family");
  console.log("Target schema: v2 (breaking, explicit one-way migration)");
  console.log("Truth flags: all false");
  console.log("Renderer authorization: none");
}

main();

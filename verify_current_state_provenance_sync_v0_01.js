"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}
function json(relativePath) {
  return JSON.parse(read(relativePath));
}
function gitBlobSha(relativePath) {
  const source = read(relativePath);
  const body = Buffer.from(source, "utf8");
  const header = Buffer.from("blob " + String(body.length) + "\0", "utf8");
  return crypto.createHash("sha1").update(header).update(body).digest("hex");
}

const matrix = json("docs/current_state_provenance_synchronization_matrix_v0_01.json");
const systemV1 = json("data/system.json");
const systemV2 = json("data/system.v2.json");
const thread22 = json("docs/concrete_geometry_admission_matrix_v0_01.json");
const thread23 = json("docs/projection_slice_semantics_matrix_v0_01.json");
const thread24 = json("docs/base_geometric_renderer_matrix_v0_01.json");
const thread25 = json("docs/geometric_pullback_visualization_matrix_v0_01.json");
const thread26 = json("docs/hybrid_structural_geometric_navigation_matrix_v0_01.json");
const index = read("index.html");
const readme = read("README.md");
const workflow = read(".github/workflows/formal-verification.yml");
const human = read("docs/CURRENT_STATE_PROVENANCE_SYNCHRONIZATION_v0_01.md");

assert.equal(matrix.thread, "27R");
assert.equal(matrix.status, "implementation_candidate");
assert.equal(matrix.canonicalParent.commit, "2c33f20a508540c3f31ba2d058f3181cc173ef2e");
assert.equal(matrix.canonicalParent.tree, "59b45cc5659fcc7596aedaeb62af7206d6592012");

assert.equal(systemV1.schemaVersion, 1);
assert.equal(systemV1.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

assert.equal(systemV2.schemaVersion, 2);
assert.equal(systemV2.mathematics.baseHypersurface.definingFunction.representation.kind, "builtin_formula");
assert.equal(systemV2.mathematics.baseHypersurface.definingFunction.representation.formulaId, "W_kappa_torus4_v1");

assert.equal(thread24.truthFlags.geometryRendered, true);
assert.equal(thread24.truthFlags.sheetsMaterialized, false);
assert.equal(thread24.truthFlags.coveringStructureClaimed, false);
assert.equal(thread24.truthFlags.geometricZoomApplied, false);

assert.equal(thread25.status, "canonical_sealed");
assert.equal(thread25.truthFlags.geometryRendered, true);
assert.equal(thread25.truthFlags.pullbackGeometryRendered, true);
assert.equal(thread25.truthFlags.renderedGeometricDepth, 1);
assert.equal(thread25.truthFlags.sheetsMaterialized, false);
assert.equal(thread25.truthFlags.coveringStructureClaimed, false);
assert.equal(thread25.truthFlags.geometricZoomApplied, false);
assert.equal(thread25.materialization.maxGeneratedPoints, 10000);
assert.equal(thread25.materialization.canonicalDepth0Count, 512);
assert.equal(thread25.materialization.canonicalDepth1DerivedCount, 8192);
assert.equal(thread25.materialization.canonicalDepth2DerivedCount, 131072);
assert.equal(thread25.materialization.beyondCap, "reject_without_partial_materialization");

assert.equal(thread26.status, "canonical_sealed");
assert.equal(thread26.materialization.maxGeneratedPoints, 10000);
assert.equal(thread26.materialization.canonicalDepth0Count, 512);
assert.equal(thread26.materialization.canonicalDepth1Count, 8192);
assert.equal(thread26.materialization.canonicalDepth2CountIfRequested, 131072);
assert.equal(thread26.materialization.beyondCap, "reject_without_partial_materialization");
assert.equal(thread26.materialization.hybridRuntimeCallsGeometricGenerationApi, false);
assert.equal(thread26.depthSemantics.automaticDepthSynchronization, false);
assert.equal(thread26.depthSemantics.explicitSharedStageNavigationOnly, true);
assert.equal(thread26.truthFlags.geometryRenderedInGeometricRepresentation, true);
assert.equal(thread26.truthFlags.sheetsMaterialized, false);
assert.equal(thread26.truthFlags.coveringStructureClaimed, false);
assert.equal(thread26.truthFlags.geometricZoomApplied, false);

assert.equal(thread22.status, "AUTHORING CANDIDATE");
assert.equal(thread23.status, "IMPLEMENTED_CONTRACT_CANDIDATE");
assert.equal(Object.prototype.hasOwnProperty.call(thread24, "status"), false);
assert.equal(matrix.statusHygiene.policy, "preserve_phase_local_historical_status_fields");

assert.ok(index.includes("The legacy schema-v1 structural pipeline remains non-geometric"));
assert.ok(index.includes("Threads 24–26 admit and render finite sampled geometry through schema v2"));
assert.ok(index.includes("schema-v2 geometric pipeline admits <code>W_kappa_torus4_v1</code>"));
assert.ok(index.includes("Legacy structural pipeline geometry"));
assert.ok(index.includes("Legacy structural W representation"));
assert.ok(index.includes("Historical v1.0-rc1 release boundary"));
assert.ok(!index.includes("No geometric Calabi–Yau hypersurface is currently rendered."));
assert.ok(!index.includes("<code>W</code> has no concrete representation in this visualizer."));
assert.ok(!index.includes("No Calabi–Yau hypersurface geometry, genuine sheets, covering geometry, or metric realization is rendered here."));

assert.ok(readme.includes("## Current post-Thread-26 development state"));
assert.ok(readme.includes("The legacy schema-v1 interface remains **structural, not geometric**."));
assert.ok(readme.includes("finite sampled projections of `X_0` and the finite sampled `X_1` pullback"));
assert.ok(readme.includes("At the v1.0-rc1 checkpoint"));
assert.ok(!readme.includes("No concrete Calabi–Yau hypersurface geometry is currently rendered. W remains unresolved."));
assert.ok(!readme.includes("Therefore no geometric Calabi–Yau hypersurface is currently rendered."));

assert.ok(workflow.includes("node verify_current_state_provenance_sync_v0_01.js"));
assert.ok(workflow.includes("node --check verify_current_state_provenance_sync_v0_01.js"));
assert.ok(workflow.includes("stale global geometry claim detected in index.html"));
assert.ok(!workflow.includes("grep -Fq 'No geometric Calabi–Yau hypersurface is currently rendered.' /tmp/publication-index.html"));

assert.ok(human.includes("legacy structural pipeline state"));
assert.ok(human.includes("finite sampled geometry rendered"));
assert.ok(human.includes("does **not** retroactively rewrite"));

for (const [relativePath, expected] of Object.entries(matrix.protectedBlobs)) {
  assert.equal(gitBlobSha(relativePath), expected, "protected blob drift: " + relativePath);
}

console.log("Thread 27R current-state provenance synchronization verifier: PASS");
console.log("schema-v1 structural W remains unresolved; schema-v2 W_kappa_torus4_v1 remains admitted");
console.log("finite sampled geometry is current; complete/global hypersurface rendering remains unclaimed");
console.log("sheetsMaterialized=false; coveringStructureClaimed=false; geometricZoomApplied=false");
console.log("Thread 25 cap and Thread 26 correspondence boundaries preserved");

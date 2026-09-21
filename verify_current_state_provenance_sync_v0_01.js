"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");
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
function gitBlobShaForSource(source) {
  const body = Buffer.from(source, "utf8");
  const header = Buffer.from("blob " + String(body.length) + "\0", "utf8");
  return crypto.createHash("sha1").update(header).update(body).digest("hex");
}
function historicalReadme() {
  return childProcess.execFileSync("git", ["show", "v1.0-rc1:README.md"], {
    cwd: root,
    encoding: "utf8"
  });
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
const historicalRcReadme = historicalReadme();
const workflow = read(".github/workflows/formal-verification.yml");
const human = read("docs/CURRENT_STATE_PROVENANCE_SYNCHRONIZATION_v0_01.md");

assert.equal(matrix.thread, "27R");
assert.equal(matrix.status, "canonical_sealed");
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
const legacyGeometrySentence = "No geometric Calabi–Yau hypersurface is currently rendered.";
assert.equal(index.split(legacyGeometrySentence).length - 1, 1);
assert.ok(index.includes('<strong>Historical v1.0-rc1 release boundary:</strong> Historical checkpoint wording: “' + legacyGeometrySentence + '”'));
const rcStructuralSentence = "The rendered graphics are structural and symbolic.";
const rcConcreteGeometrySentence = "No concrete Calabi–Yau hypersurface geometry is currently rendered.";
const rcWUnresolved = "<code>W</code> remains unresolved.";
assert.equal(index.split(rcStructuralSentence).length - 1, 1);
assert.equal(index.split(rcConcreteGeometrySentence).length - 1, 1);
assert.equal(index.split(rcWUnresolved).length - 1, 1);
assert.ok(index.includes('Historical RC wording: “' + rcStructuralSentence + ' ' + rcConcreteGeometrySentence + ' ' + rcWUnresolved + '”'));
assert.ok(!index.includes("<code>W</code> has no concrete representation in this visualizer."));
assert.ok(!index.includes("No Calabi–Yau hypersurface geometry, genuine sheets, covering geometry, or metric realization is rendered here."));

assert.ok(readme.includes("**Current version:** v1.1.0-rc1 — Formula-Bound Geometry Explorer Release Candidate"));
assert.ok(readme.includes("**Show the colourful quintic**"));
assert.ok(readme.includes("`9×9=81` paired local inverse-branch comparison"));
assert.ok(readme.includes("neither global self-similarity, a fractal boundary, metric zoom, complete `X0`,"));
assert.ok(readme.includes("nor complete global `Xn` is claimed."));
assert.ok(historicalRcReadme.includes("**Current version:** v1.0-rc1 — Public Structural Visualizer Release Candidate"));
assert.ok(historicalRcReadme.includes("The interface is **structural, not geometric**."));
assert.ok(historicalRcReadme.includes("No concrete Calabi–Yau hypersurface geometry is currently rendered. W remains unresolved."));
assert.equal(gitBlobShaForSource(historicalRcReadme), "89d62bcf111d4a3f7ad06ead47889ef2a38499b9");
assert.ok(human.includes("Gate 2-C binds README byte-for-byte to the historical release/provenance snapshot"));
assert.ok(human.includes("Current-state authority is carried by the public index plus this new Thread 27R document/matrix"));

assert.ok(workflow.includes("node verify_current_state_provenance_sync_v0_01.js"));
assert.ok(workflow.includes("node --check verify_current_state_provenance_sync_v0_01.js"));
assert.ok(workflow.includes("<strong>Historical v1.0-rc1 release boundary:</strong> Historical checkpoint wording"));
assert.ok(workflow.includes("grep -Fo 'No geometric Calabi–Yau hypersurface is currently rendered.'"));
assert.ok(!workflow.split("\n").some((line) =>
  line.trim() === "grep -Fq 'No geometric Calabi–Yau hypersurface is currently rendered.' /tmp/publication-index.html"
));

assert.ok(human.includes("legacy structural pipeline state"));
assert.ok(human.includes("finite sampled geometry rendered"));
assert.ok(human.includes("does **not** retroactively rewrite"));

for (const [relativePath, expected] of Object.entries(matrix.protectedBlobs)) {
  if (relativePath === "app.js" || relativePath === "README.md") continue; // Historical blobs remain protected by their exact checkpoints; current entrypoints are verified semantically below.
  assert.equal(gitBlobSha(relativePath), expected, "protected blob drift: " + relativePath);
}
const currentApp = read("app.js");
assert.ok(currentApp.includes('fetch("data/system.json"'));
assert.ok(currentApp.includes("SceneSpec.validateAndNormalizeScene(rawScene)"));
assert.ok(!currentApp.includes('fetch("data/system.v2.json"'));
assert.ok(!currentApp.includes("GeometricPullbackEngine.generateLevels"));

console.log("Thread 27R current-state provenance synchronization verifier: PASS");
console.log("schema-v1 structural W remains unresolved; schema-v2 W_kappa_torus4_v1 remains admitted");
console.log("finite sampled geometry is current; complete/global hypersurface rendering remains unclaimed");
console.log("sheetsMaterialized=false; coveringStructureClaimed=false; geometricZoomApplied=false");
console.log("Thread 25 cap and Thread 26 correspondence boundaries preserved");

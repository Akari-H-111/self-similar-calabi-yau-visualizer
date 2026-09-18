"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const root = __dirname;
function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}
function gitBlobSha(source) {
  const body = Buffer.from(source, "utf8");
  return crypto.createHash("sha1").update("blob " + String(body.length) + "\0").update(body).digest("hex");
}

const scene = JSON.parse(read("data/system.json"));
assert.equal(scene.request.requestedDepth, 0);
assert.equal(scene.mathematics.parameters.D, 2);
assert.equal(scene.mathematics.baseHypersurface.definingFunction.symbol, "W");
assert.equal(scene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

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
  assert.equal(gitBlobSha(read(relativePath)), expectedSha, relativePath + " must remain byte-identical for the RC.");
}

const matrix = JSON.parse(read("docs/visual_provenance_matrix_self_similar_cy_visualizer_v0_21.json"));
assert.equal(matrix.version, "v0.21");
assert.equal(matrix.truthBoundary.W, "unresolved");
assert.equal(matrix.truthBoundary.geometryRendered, false);
assert.equal(matrix.truthBoundary.sheetsMaterialized, false);
assert.equal(matrix.truthBoundary.coveringStructureClaimed, false);
assert.equal(matrix.truthBoundary.geometricZoomApplied, false);

const historicalState = JSON.parse(read("docs/state_self_similar_cy_visualizer_v0_21.json"));
assert.equal(historicalState.thread20_sealed, false, "v0.21 state must remain a historical pre-seal snapshot.");

const manifest = JSON.parse(read("docs/release_manifest_self_similar_cy_visualizer_v1_0_rc1.json"));
assert.equal(manifest.thread, "21");
assert.equal(manifest.version, "v1.0-rc1");
assert.equal(manifest.startingCanonical.commit, "fab790ba49cdf9e7bf511e2d2b0df4aec1941b7d");
assert.equal(manifest.startingCanonical.tree, "bf381e519850a136d641ff3c985fcd0b6daf6d67");
assert.equal(manifest.startingCanonical.immutableCheckpoint.tag, "v0.13");
assert.equal(manifest.startingCanonical.immutableCheckpoint.immutable, true);
assert.deepEqual(manifest.truthBoundary, {
  requestedDepth: 0,
  D: 2,
  W: "unresolved",
  geometryRendered: false,
  sheetsMaterialized: false,
  coveringStructureClaimed: false,
  geometricZoomApplied: false
});
assert.equal(manifest.releaseIdentity.prerelease, true);
assert.match(manifest.releaseIdentity.tagStatus, /^pending_/);
assert.match(manifest.releaseIdentity.githubReleaseStatus, /^pending_/);
assert.ok(manifest.knownLimitations.includes("HIA-03 unresolved pending direct AT evidence"));
assert.ok(manifest.knownLimitations.includes("WCAG certification absent"));
assert.ok(manifest.explicitNonClaims.includes("no geometry admission"));

const state = JSON.parse(read("docs/state_self_similar_cy_visualizer_v1_0_rc1.json"));
assert.equal(state.thread, "21");
assert.equal(state.version, "v1.0-rc1");
assert.equal(state.thread21Sealed, false);
assert.equal(state.productionBoundary.semanticCoreModified, false);
assert.equal(state.productionBoundary.productionJavaScriptModified, false);
assert.equal(state.productionBoundary.styleCssModified, false);
assert.equal(state.productionBoundary.formalModified, false);
assert.equal(state.productionBoundary.dataSystemModified, false);
assert.equal(state.productionBoundary.geometryAdmission, false);
assert.equal(state.browserEvidence.actualScreenReader, "not_tested");
assert.equal(state.browserEvidence.WCAGCertification, false);
assert.match(state.browserEvidence.status, /^pending_/);

const releaseDoc = read("docs/PUBLIC_STRUCTURAL_VISUALIZER_RC_self_similar_cy_visualizer_v1_0_rc1.md");
for (const required of [
  "This release candidate provides an interactive structural visualizer.",
  "The rendered graphics are structural and symbolic.",
  "No concrete Calabi–Yau hypersurface geometry is currently rendered.",
  "W remains unresolved.",
  "HIA-03 remains unresolved",
  "no WCAG certification",
  "Thread 22 Concrete Geometry Admission Contract remains blocked."
]) assert.ok(releaseDoc.includes(required), "Missing RC release boundary: " + required);

const readme = read("README.md");
assert.match(readme, /Current version:\*\* v1\.0-rc1 — Public Structural Visualizer Release Candidate/);
assert.ok(readme.includes("node verify_mathematical_visual_fidelity_v0_21.js"));
assert.ok(readme.includes("node verify_public_structural_visualizer_rc_v1_0_rc1.js"));
assert.ok(!readme.includes("\\n\\nThe v0.21 verifier"), "README must not expose literal escaped newline drift.");
assert.ok(readme.includes("historical Thread 19R staging CI"));

const indexSource = read("index.html");
assert.ok(indexSource.includes("v1.0-rc1 · Public Structural Visualizer Release Candidate"));
assert.ok(indexSource.includes("v0.21 · Mathematical / Visual Fidelity Audit II"));
assert.ok(indexSource.includes("The rendered graphics are structural and symbolic."));
assert.ok(indexSource.includes("No concrete Calabi–Yau hypersurface geometry is currently rendered."));
assert.ok(indexSource.includes("<code>W</code> remains unresolved."));
assert.ok(indexSource.includes("visual-provenance.js"));

const scriptSources = Array.from(indexSource.matchAll(/<script src="([^"]+)" defer><\/script>/g), (m) => m[1]);
for (const requiredAsset of [
  "scene-spec.js","base-renderer.js","one-step-pullback.js","recursive-lazy-expansion.js",
  "zoom-semantics.js","sheet-branch-organization.js","interactive-pullback-tower.js",
  "infinite-navigation-renderer.js","structural-visualization.js","branch-organization-graphics.js",
  "structural-camera.js","arithmetic-overlays.js","arithmetic-overlay-graphics.js",
  "exposition-layer.js","visual-provenance.js","app.js"
]) assert.ok(scriptSources.includes(requiredAsset), "Missing runtime asset from index: " + requiredAsset);

assert.ok(fs.existsSync(path.join(root, "LICENSE")));
assert.ok(fs.existsSync(path.join(root, ".nojekyll")));

const workflow = read(".github/workflows/formal-verification.yml");
const historicalCommands = [
  "node verify_scene_spec_v0_03.js",
  "node verify_base_renderer_v0_04.js",
  "node verify_one_step_pullback_v0_05.js",
  "node verify_recursive_lazy_expansion_v0_06.js",
  "node verify_zoom_semantics_v0_07.js",
  "node verify_sheet_branch_organization_v0_08.js",
  "node verify_arithmetic_overlays_v0_09.js",
  "node verify_performance_infinite_navigation_v0_10.js",
  "node verify_mathematical_fidelity_v0_11.js",
  "node verify_ux_exposition_v0_12.js",
  "node verify_publication_checkpoint_v0_13.js",
  "node verify_structural_visualization_v0_14.js",
  "node verify_interactive_pullback_tower_v0_15.js",
  "node verify_structural_camera_zoom_v0_16.js",
  "node verify_branch_organization_graphics_v0_17.js",
  "node verify_arithmetic_overlay_graphics_v0_18.js",
  "node verify_infinite_navigation_renderer_v0_19.js",
  "node benchmark_infinite_navigation_renderer_v0_19.js",
  "node verify_visual_semantics_accessibility_v0_20.js",
  "node verify_human_interaction_remediation_v0_20_1.js",
  "node verify_mathematical_visual_fidelity_v0_21.js"
];
for (const command of historicalCommands) assert.ok(workflow.includes(command), "Missing historical CI command: " + command);
for (const marker of [
  "node verify_public_structural_visualizer_rc_v1_0_rc1.js",
  "node --check verify_public_structural_visualizer_rc_v1_0_rc1.js",
  "node --check verify_public_structural_visualizer_browser_rc_v1_0_rc1.js",
  "browser-rc:",
  "playwright@1.63.0",
  "chromium firefox webkit",
  "actions/upload-artifact@v5",
  "v1.0-rc1 · Public Structural Visualizer Release Candidate"
]) assert.ok(workflow.includes(marker), "Missing RC workflow marker: " + marker);

console.log("Public Structural Visualizer RC v1.0-rc1 verifier: passed");
console.log("structural-only public release boundary: preserved");
console.log("sealed production JS/CSS/formal sources: byte-identical");
console.log("v0.21 historical provenance/state: preserved");
console.log("RC browser/cross-browser/screenshot evidence: delegated to exact-candidate browser-rc job");
console.log("geometry/sheets/covering/geometric zoom: remain false; W remains unresolved");

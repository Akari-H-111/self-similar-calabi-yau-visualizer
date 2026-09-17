"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const repositoryRoot = __dirname;

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(repositoryRoot, relativePath));
}

function gitBlobSha(source) {
  const body = Buffer.from(source, "utf8");
  return crypto.createHash("sha1").update(`blob ${String(body.length)}\0`).update(body).digest("hex");
}

const canonicalScene = JSON.parse(read("data/system.json"));
assert.equal(
  canonicalScene.version,
  "v0.12",
  "v0.13 is a repository publication checkpoint; the sealed runtime/UI baseline must remain v0.12."
);
assert.equal(canonicalScene.mathematics.baseHypersurface.definingFunction.symbol, "W");
assert.equal(canonicalScene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

const sealedRuntimeBlobs = {
  "scene-spec.js": "20471ef6fab0a685faee956f07a35d82e9a95ba5",
  "base-renderer.js": "fea92139c2a8514f01b9bb187f27bf0131dd4114",
  "one-step-pullback.js": "5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js": "0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js": "9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js": "cecf0f06aa23404a65a6093f705a4fe56be65029",
  "arithmetic-overlays.js": "bfc7331e07b8e12d4b14790ae5a4bc096042544c",
  "exposition-layer.js": "ce6210842cf653db56f67d0a7b682be893258f8a",
  "app.js": "553b670872480f1fd6c10fd0234fb46b60a62029"
};

for (const [relativePath, expectedSha] of Object.entries(sealedRuntimeBlobs)) {
  assert.equal(
    gitBlobSha(read(relativePath)),
    expectedSha,
    `${relativePath} must remain byte-for-byte sealed from the v0.12 runtime/UI baseline.`
  );
}

const sealedLeanBlobs = {
  "formal/SelfSimilarCY/Basic.lean": "84bc2ca172a871890ef9753f2c0d9db84a7dec5e",
  "formal/SelfSimilarCY/CoordinatePower.lean": "dcfae8a3ed99544e50ee45aa12acde63e41090c8",
  "formal/SelfSimilarCY/CoordinatePowerIteration.lean": "4c78793d586e8ba822d4b326f09fd82dc07eaaf9",
  "formal/SelfSimilarCY/PullbackTower.lean": "1de5fed3c38e67c89d1c8673c7515f312a7af3e0"
};

for (const [relativePath, expectedSha] of Object.entries(sealedLeanBlobs)) {
  assert.equal(
    gitBlobSha(read(relativePath)),
    expectedSha,
    `${relativePath} must remain byte-for-byte sealed during publication work.`
  );
}

assert.equal(read("formal/lean-toolchain").trim(), "leanprover/lean4:v4.34.0");
assert.match(read("formal/lakefile.toml"), /7801e8406155c31b340d28e2762f754d02b5e9b0/);
assert.match(read("formal/lake-manifest.json"), /7801e8406155c31b340d28e2762f754d02b5e9b0/);

const readme = read("README.md");
assert.match(readme, /\*\*Current version:\*\* v0\.12 — UX \/ Exposition Layer/);
assert.match(readme, /\*\*Publication checkpoint candidate:\*\* v0\.13 — Publication Checkpoint/);
assert.match(readme, /3038cb49520743e1620032a9104d26cb92bcd49f/);
assert.match(readme, /Formal Verification run #35 \/ 35204008792/);
assert.match(readme, /license\s+= pending explicit license selection/i);
assert.match(readme, /Lean: leanprover\/lean4:v4\.34\.0/);
assert.match(readme, /mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0/);
assert.match(readme, /publication-static-smoke/);
assert.match(readme, /It is \*\*not\*\* a real-browser rendering, accessibility, or long-session performance certification/i);
assert.match(readme, /not source-verified in this thread/);
assert.match(readme, /D² runtime metadata/);
assert.match(readme, /D⁴ organization metadata/);
assert.match(readme, /not a map-degree theorem/i);
assert.match(readme, /entire visualizer, all Calabi–Yau mathematics/i);
assert.match(readme, /not mathematical limits/);
assert.match(readme, /representation-safety \/ engineering constraints/i);

const publicationDoc = read("docs/PUBLICATION_CHECKPOINT_self_similar_cy_visualizer_v0_13.md");
for (const heading of [
  "## 1. Scope",
  "## 2. Starting canonical baseline",
  "## 3. Version policy",
  "## 4. Publication truth boundary",
  "## 5. Provenance classes",
  "## 6. Public repository policy",
  "## 7. License status",
  "## 8. Release policy",
  "## 9. Branch and canonicalization policy",
  "## 10. CI maintenance",
  "## 11. Lean reproducibility boundary",
  "## 12. Runtime reproducibility boundary",
  "## 13. Static deployment verification",
  "## 14. GitHub Pages boundary",
  "## 15. Screenshot / demo media boundary",
  "## 16. Accessibility and browser evidence boundary",
  "## 17. Publication checkpoint verifier role",
  "## 18. Remaining gates before seal",
  "## 19. Seal rule"
]) {
  assert.ok(publicationDoc.includes(heading), `Missing publication checkpoint section: ${heading}`);
}
assert.match(publicationDoc, /repository visibility: public/);
assert.match(publicationDoc, /explicit repository license: pending user selection/);
assert.match(publicationDoc, /actions\/checkout@v7/);
assert.match(publicationDoc, /actions\/setup-node@v7/);
assert.match(publicationDoc, /Node 22/);
assert.match(publicationDoc, /real assistive-technology testing = not tested/);
assert.match(publicationDoc, /real-browser long-session performance = not tested/);

const progress = read("docs/progress_self_similar_cy_visualizer_v0_13.md");
assert.match(progress, /candidate version: v0\.13/);
assert.match(progress, /sealed runtime\/UI baseline: v0\.12/);
assert.match(progress, /final repository visibility: public/);
assert.match(progress, /license status = pending user selection/);
assert.match(progress, /actions\/checkout@v7/);
assert.match(progress, /actions\/setup-node@v7/);
assert.match(progress, /DO NOT MERGE/i);

const state = JSON.parse(read("docs/state_self_similar_cy_visualizer_v0_13.json"));
assert.equal(state.version, "v0.13");
assert.equal(state.runtime_ui_baseline, "v0.12");
assert.equal(state.repository.starting_canonical_commit, "3038cb49520743e1620032a9104d26cb92bcd49f");
assert.equal(state.repository.starting_canonical_ci_run_id, 35204008792);
assert.equal(state.publication_policy.target_visibility, "public");
assert.equal(state.publication_policy.open_source_intent, true);
assert.equal(state.publication_policy.release_checkpoint, "v0.13");
assert.equal(state.license.automatic_license_choice_allowed, false);
assert.equal(state.lean_formal_boundary.modified_by_v0_13, false);
assert.equal(state.lean_formal_boundary.toolchain, "leanprover/lean4:v4.34.0");
assert.equal(state.lean_formal_boundary.mathlib_revision, "7801e8406155c31b340d28e2762f754d02b5e9b0");
assert.equal(state.runtime_boundary.runtime_version_changed_by_v0_13, false);
assert.equal(state.runtime_boundary.data_system_version, "v0.12");
assert.equal(state.runtime_boundary.application_node_version, "22");
assert.equal(state.ci_maintenance.checkout_action, "actions/checkout@v7");
assert.equal(state.ci_maintenance.setup_node_action, "actions/setup-node@v7");
assert.equal(state.ci_maintenance.setup_node_package_manager_cache, false);
assert.equal(state.publication_verification.static_smoke_job, "publication-static-smoke");
assert.equal(state.publication_verification.nojekyll_present, true);
assert.equal(state.publication_verification.real_browser_initialization_test, "not_tested");
assert.equal(state.publication_verification.real_browser_long_session_performance, "not_tested");
assert.equal(state.publication_verification.real_assistive_technology_test, "not_tested");
assert.equal(state.parent_project_provenance.memory_used_as_canonical_evidence, false);
assert.equal(state.seal_policy.thread_sealed, false);
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

if (state.license.status === "pending_user_selection") {
  assert.equal(exists("LICENSE"), false, "A license must not be silently selected while state says pending_user_selection.");
  assert.equal(state.license.license_file_present, false);
} else {
  assert.equal(exists("LICENSE"), true, "A selected publication license requires a LICENSE artifact.");
}

assert.equal(exists(".nojekyll"), true, ".nojekyll must exist for plain static GitHub Pages preparation.");
assert.equal(read(".nojekyll"), "", ".nojekyll should be an empty marker file.");

const workflow = read(".github/workflows/formal-verification.yml");
assert.doesNotMatch(workflow, /actions\/checkout@v[1-6](?!\d)/);
assert.doesNotMatch(workflow, /actions\/setup-node@v[1-6](?!\d)/);
assert.match(workflow, /actions\/checkout@v7/);
assert.match(workflow, /actions\/setup-node@v7/);
assert.match(workflow, /node-version:\s*'22'/);
assert.match(workflow, /package-manager-cache:\s*false/);
assert.match(workflow, /publication-static-smoke:/);
assert.match(workflow, /python3 -m http\.server 8000/);
assert.match(workflow, /curl -fsS http:\/\/127\.0\.0\.1:8000\/data\/system\.json/);
assert.match(workflow, /node verify_publication_checkpoint_v0_13\.js/);
assert.match(workflow, /node --check verify_publication_checkpoint_v0_13\.js/);

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
  "verify_ux_exposition_v0_12.js",
  "verify_publication_checkpoint_v0_13.js"
]) {
  assert.ok(workflow.includes(`node ${verifier}`), `Workflow must execute ${verifier}.`);
}

console.log("publication checkpoint v0.13 verification: passed");
console.log("runtime/UI baseline preserved: v0.12");
console.log("sealed runtime and Lean source blobs unchanged: passed");
console.log("publication provenance and snapshot/seal boundary: passed");
console.log("maintained GitHub action majors wired: checkout@v7 + setup-node@v7");
console.log("static HTTP publication smoke wired: passed");
console.log("license gate: pending explicit user selection");
console.log("real-browser / assistive-technology evidence: not_tested");
console.log("mathematical claim strength increased: NO");

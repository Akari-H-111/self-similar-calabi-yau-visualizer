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

// The immutable v0.13 tag preserves the original publication-snapshot verifier.
// On later main revisions this verifier checks the persistent v0.13 publication
// contract without freezing presentation/orchestration files against future work.
const canonicalScene = JSON.parse(read("data/system.json"));
assert.equal(canonicalScene.version, "v0.12");
assert.equal(canonicalScene.mathematics.baseHypersurface.definingFunction.symbol, "W");
assert.equal(canonicalScene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

const sealedRuntimeModelBlobs = {
  "scene-spec.js": "20471ef6fab0a685faee956f07a35d82e9a95ba5",
  "base-renderer.js": "fea92139c2a8514f01b9bb187f27bf0131dd4114",
  "one-step-pullback.js": "5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js": "0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js": "9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js": "cecf0f06aa23404a65a6093f705a4fe56be65029",
  "arithmetic-overlays.js": "bfc7331e07b8e12d4b14790ae5a4bc096042544c",
  "exposition-layer.js": "ce6210842cf653db56f67d0a7b682be893258f8a"
};
for (const [relativePath, expectedSha] of Object.entries(sealedRuntimeModelBlobs)) {
  assert.equal(gitBlobSha(read(relativePath)), expectedSha, `${relativePath} must remain byte-for-byte sealed from the v0.13 mathematical/runtime-model baseline.`);
}

const sealedLeanBlobs = {
  "formal/SelfSimilarCY/Basic.lean": "84bc2ca172a871890ef9753f2c0d9db84a7dec5e",
  "formal/SelfSimilarCY/CoordinatePower.lean": "dcfae8a3ed99544e50ee45aa12acde63e41090c8",
  "formal/SelfSimilarCY/CoordinatePowerIteration.lean": "4c78793d586e8ba822d4b326f09fd82dc07eaaf9",
  "formal/SelfSimilarCY/PullbackTower.lean": "1de5fed3c38e67c89d1c8673c7515f312a7af3e0"
};
for (const [relativePath, expectedSha] of Object.entries(sealedLeanBlobs)) {
  assert.equal(gitBlobSha(read(relativePath)), expectedSha, `${relativePath} must remain byte-for-byte sealed after publication.`);
}

assert.equal(read("formal/lean-toolchain").trim(), "leanprover/lean4:v4.34.0");
assert.match(read("formal/lakefile.toml"), /7801e8406155c31b340d28e2762f754d02b5e9b0/);
assert.match(read("formal/lake-manifest.json"), /7801e8406155c31b340d28e2762f754d02b5e9b0/);

const readme = read("README.md");
assert.match(readme, /v0\.13 — Publication Checkpoint/);
assert.match(readme, /e83ed17a5ce8e45e67ef326042a21ec51ba24222/);
assert.match(readme, /338a519614ea16ceb2e4a1247fc0c94338929f0c/);
assert.match(readme, /Apache License, Version 2\.0/);
assert.match(readme, /Apache-2\.0/);
assert.match(readme, /D² = runtime numeric metadata/);
assert.match(readme, /D⁴ = runtime numeric \/ organizational metadata/);
assert.match(readme, /not.*entire visualizer, all Calabi–Yau mathematics/is);
assert.match(readme, /W.*unresolved/is);

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
assert.match(publicationDoc, /explicit repository license: Apache-2\.0/);
assert.match(publicationDoc, /OSI status: approved open-source license/);
assert.match(publicationDoc, /real assistive-technology testing = not tested/);
assert.match(publicationDoc, /real-browser long-session performance = not tested/);

const progress = read("docs/progress_self_similar_cy_visualizer_v0_13.md");
assert.match(progress, /candidate version: v0\.13/);
assert.match(progress, /sealed runtime\/UI baseline: v0\.12/);
assert.match(progress, /final repository visibility: public/);
assert.match(progress, /license status = selected: Apache-2\.0/);

const state = JSON.parse(read("docs/state_self_similar_cy_visualizer_v0_13.json"));
assert.equal(state.version, "v0.13");
assert.equal(state.runtime_ui_baseline, "v0.12");
assert.equal(state.repository.starting_canonical_commit, "3038cb49520743e1620032a9104d26cb92bcd49f");
assert.equal(state.publication_policy.target_visibility, "public");
assert.equal(state.publication_policy.release_checkpoint, "v0.13");
assert.equal(state.license.spdx_identifier, "Apache-2.0");
assert.equal(state.license.osi_approved, true);
assert.equal(state.lean_formal_boundary.modified_by_v0_13, false);
assert.equal(state.runtime_boundary.runtime_version_changed_by_v0_13, false);
assert.deepEqual(state.truthfulness_invariants, {
  geometryRendered: false,
  sheetsMaterialized: false,
  coveringStructureClaimed: false,
  geometricZoomApplied: false,
  cameraTransformApplied: false,
  materializationTriggered: false,
  W: "unresolved"
});

assert.equal(exists("LICENSE"), true);
assert.equal(gitBlobSha(read("LICENSE")), "261eeb9e9f8b2b4b0d119366dda99c6fd7d35c64");
assert.match(read("LICENSE"), /^\s*Apache License\s*\n\s*Version 2\.0, January 2004/m);
assert.equal(exists(".nojekyll"), true);
assert.equal(read(".nojekyll"), "");

const workflow = read(".github/workflows/formal-verification.yml");
assert.match(workflow, /actions\/checkout@v7/);
assert.match(workflow, /actions\/setup-node@v7/);
assert.match(workflow, /node-version:\s*'22'/);
assert.match(workflow, /publication-static-smoke:/);
assert.match(workflow, /python3 -m http\.server 8000/);
assert.match(workflow, /node verify_publication_checkpoint_v0_13\.js/);

console.log("publication checkpoint v0.13 persistent-contract verification: passed");
console.log("immutable v0.13 tag retains the original snapshot verifier");
console.log("sealed runtime model and Lean blobs unchanged: passed");
console.log("publication/license artifacts remain present: passed");
console.log("later presentation layers may evolve without weakening v0.13 truthfulness boundaries");

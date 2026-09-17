# Publication Checkpoint — Self-Similar Calabi–Yau Visualizer v0.13

## 1. Scope

Thread 12 is a publication checkpoint for the already sealed v0.12 implementation. It does not add Calabi–Yau mathematics, strengthen theorem status, implement `W`, materialize sheets, change geometric semantics, or modify the sealed Lean core.

The publication milestone exists to make the repository publicly understandable, reproducible, citable, openly licensed, and statically deployable while preserving the evidence boundaries established by v0.11 and exposed by v0.12.

## 2. Starting canonical baseline

Thread 12 starts from:

```text
branch: main
commit: 3038cb49520743e1620032a9104d26cb92bcd49f
message: ux: seal v0.12 exposition layer
sole parent: b77a688fed8cbc41e105900d38177e75219825d1
tree: f3d5154e42cdc91b772c395945b4241e7e31980f
```

Canonical external CI seal:

```text
workflow: Formal Verification
run: #35
run id: 35204008792
event: push
head branch: main
head SHA: 3038cb49520743e1620032a9104d26cb92bcd49f
runtime-contracts: completed / success
formal-lean: completed / success
```

The v0.12 state/progress artifacts are intentionally pre-external-seal snapshots. They are not retroactively rewritten. The v0.12 seal is external evidence consisting of the canonical commit, exact-SHA CI, and staging PR #4 being closed unmerged.

## 3. Version policy

```text
publication checkpoint version: v0.13
sealed runtime/UI baseline: v0.12
```

Thread 12 does not change `data/system.json` from v0.12 because no runtime semantic version is being created. v0.13 is a repository publication milestone layered over the sealed v0.12 implementation.

## 4. Publication truth boundary

The following remain invariants:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
cameraTransformApplied = false
materializationTriggered = false
W representation = unresolved
```

Publication must not imply:

```text
runtime representation = theorem
CI green = whole project formally proved
D² = sealed metric theorem
D⁴ = genuine map-degree theorem
sheet organization = realized covering
structural zoom = geometric zoom
W = implemented function
X = rendered Calabi–Yau hypersurface
infinite navigation = literal infinite materialization
```

## 5. Provenance classes

Public-facing provenance distinguishes:

1. **Repository implementation** — the static HTML/CSS/JavaScript and repository configuration.
2. **Sealed Lean formal core** — the explicitly scoped Lean modules only.
3. **Runtime deterministic verification** — Node-based contracts and CI checks.
4. **Visualization / exposition convention** — presentation choices without theorem status.
5. **Unresolved mathematics** — objects or claims deliberately not implemented or proved here.
6. **Parent-project provenance not source-verified here** — claims whose exact canonical parent artifacts were not retrieved by the relevant visualizer audit.

No class may be promoted merely because the repository is public or a release is published.

## 6. Public repository policy

The user policy decision for Thread 12 is:

```text
final repository visibility: public
publication audience: public
open-source intent: yes
```

The repository may remain private during staging and verification. Public visibility is a publication cutover action, not evidence that the checkpoint is already sealed.

## 7. License status

The user explicitly selected the publication license:

```text
explicit repository license: Apache-2.0
license name: Apache License, Version 2.0
OSI status: approved open-source license
LICENSE file: committed in the v0.13 publication candidate
```

The repository therefore follows an OSI-approved open-source licensing route rather than treating public source visibility as sufficient by itself. The SPDX short identifier is `Apache-2.0`, and the operative license text is the repository `LICENSE` artifact.

The pinned mathlib dependency has its own upstream license. That dependency license did not automatically determine this repository's source license; Apache-2.0 was selected explicitly by the repository owner for this publication checkpoint.

## 8. Release policy

The publication checkpoint naming convention is:

```text
v0.13 — Publication Checkpoint
```

No tag or release is created before the publication candidate has passed staging verification, deployment checks, final tree audit, canonical single-child replay, and exact-SHA canonical CI.

## 9. Branch and canonicalization policy

Thread 12 preserves the project's history discipline:

```text
staging branch
→ staging-only PR
→ DO NOT MERGE
→ complete CI
→ final tree audit
→ replay exact verified tree as one canonical milestone child
→ non-force fast-forward main
→ exact-SHA canonical CI
→ close staging PR unmerged
```

Historical branches are evidence-bearing research/engineering history and are not deleted merely to make the repository look cleaner.

Branch protection/ruleset configuration is a repository-governance concern and must be evaluated after public visibility makes the relevant GitHub features available. Protection must not force a PR-merge workflow that contradicts the project's staging-only PR canonicalization discipline.

## 10. CI maintenance

The publication candidate migrates GitHub-maintained JavaScript actions away from the Node-20-targeting majors used by v0.12:

```text
actions/checkout@v4   → actions/checkout@v7
actions/setup-node@v4 → actions/setup-node@v7
```

Application/runtime verification remains on:

```text
Node 22
```

`setup-node` automatic package-manager caching is explicitly disabled because this repository has no package-manager dependency workflow:

```text
package-manager-cache: false
```

This migration changes CI action runtime/maintenance behavior only. It does not change the visualizer runtime semantics, Lean toolchain, or mathlib revision.

## 11. Lean reproducibility boundary

The repository-pinned environment remains:

```text
Lean: leanprover/lean4:v4.34.0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

Required formal checks remain:

```text
lake exe cache get
lake build
lake env lean SelfSimilarCY/CoordinatePower.lean
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
lake env lean SelfSimilarCY/PullbackTower.lean
Lean placeholder rejection
```

Thread 12 does not upgrade Lean or mathlib.

## 12. Runtime reproducibility boundary

Required deterministic runtime checks are:

```text
verify_scene_spec_v0_03.js
verify_base_renderer_v0_04.js
verify_one_step_pullback_v0_05.js
verify_recursive_lazy_expansion_v0_06.js
verify_zoom_semantics_v0_07.js
verify_sheet_branch_organization_v0_08.js
verify_arithmetic_overlays_v0_09.js
verify_performance_infinite_navigation_v0_10.js
verify_mathematical_fidelity_v0_11.js
verify_ux_exposition_v0_12.js
verify_publication_checkpoint_v0_13.js
```

All applicable JavaScript source files are syntax-checked separately.

## 13. Static deployment verification

The repository remains a plain static application. No React, bundler, Three.js, WebGL, package manager, or build framework is introduced for publication.

A publication-specific CI smoke job serves the repository with a standard static HTTP server and verifies successful retrieval of:

```text
/
/style.css
/scene-spec.js
/base-renderer.js
/one-step-pullback.js
/recursive-lazy-expansion.js
/zoom-semantics.js
/sheet-branch-organization.js
/arithmetic-overlays.js
/exposition-layer.js
/app.js
/data/system.json
```

The fetched JSON is parsed and the served page is checked for the explicit geometry boundary.

This is an HTTP/static-path smoke test. It is not a real-browser rendering test.

## 14. GitHub Pages boundary

The repository is intended to use GitHub Pages after public visibility cutover. The static source tree is prepared with `.nojekyll` so GitHub Pages does not need Jekyll processing.

Actual Pages configuration and deployed-URL verification are not represented as complete until the repository is public, Pages is enabled, and the deployed URL has been tested.

A successful Pages deployment status alone is insufficient; publication verification must also confirm that critical relative paths load and runtime initialization succeeds in a real browser.

## 15. Screenshot / demo media boundary

No generated image may be presented as an application screenshot.

Publication screenshot/demo media remains pending until captured from the actual current UI. Before inclusion, the capture must be checked for:

```text
version labeling
truthfulness wording
unresolved geometry boundary
D²/D⁴ metadata labels
absence of visible error state
reasonable viewport
```

## 16. Accessibility and browser evidence boundary

The v0.12 source/contract-level accessibility pass remains valid, but:

```text
real assistive-technology testing = not tested
real-browser long-session performance = not tested
```

Publication must not claim WCAG certification, assistive-technology verification, or real-browser long-session certification without corresponding evidence.

## 17. Publication checkpoint verifier role

`verify_publication_checkpoint_v0_13.js` verifies repository publication contracts such as:

```text
sealed runtime version remains v0.12
sealed runtime/Lean source blobs remain unchanged
publication artifacts exist
publication provenance boundary is explicit
Apache-2.0 license selection and LICENSE integrity are explicit
CI uses maintained GitHub action majors
Node 22 application verification remains pinned
static smoke job is wired
.nojekyll exists
```

It is a repository/publication verifier, not mathematical proof and not a browser certification.

## 18. Remaining gates before seal

Blocking before final Thread 12 seal:

```text
license-bearing staging CI success
public repository visibility cutover
GitHub Pages enablement
actual deployed URL verification
real-browser initialization smoke
actual UI screenshot/demo capture
final tree audit
single-child canonical replay
exact-SHA canonical CI success
tag/release creation
```

Non-blocking caveats that may remain if clearly disclosed:

```text
real-browser long-session performance not tested
real assistive-technology testing not tested
parent-project exact artifacts not source-verified in the visualizer audit
historical/staging branches retained
```

## 19. Seal rule

Thread 12 may be called sealed only when publication evidence supports the claim. No second canonical commit may be created merely to write the post-commit exact-SHA CI result back into the repository; that result remains external sealing evidence.

# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.14 — Structural Visualization Layer

**Published checkpoint:** v0.13 — Publication Checkpoint

**Runtime scene contract:** v0.12

This repository is a static HTML/CSS/vanilla-JavaScript structural visualizer for the coordinate-power pullback system. v0.14 adds the first deliberately visible graphical layer: a deterministic inline-SVG diagram projected from the existing verified runtime models.

The diagram is **structural, not geometric**. It does not implement a concrete `W`, a Calabi–Yau hypersurface, genuine sheets, covering geometry, or geometric zoom.

The evidence rule remains:

```text
runtime representation
!= mathematical theorem
!= Lean theorem
!= parent-project theorem
!= visualization convention
```

## Published v0.13 baseline

Thread 13 starts from the immutable published checkpoint:

```text
canonical main/tag commit:
e83ed17a5ce8e45e67ef326042a21ec51ba24222

canonical tree:
338a519614ea16ceb2e4a1247fc0c94338929f0c

release:
v0.13 — Publication Checkpoint
published / immutable / not prerelease

Formal Verification:
run #42 / 35215769668
runtime-contracts          = completed / success
formal-lean                = completed / success
publication-static-smoke   = completed / success

GitHub Pages build/deployment:
run 35216628078
head SHA = e83ed17a5ce8e45e67ef326042a21ec51ba24222
conclusion = success
```

The repository is public and licensed under the **Apache License, Version 2.0** (`Apache-2.0`).

## v0.14 structural visualization

The new projection module is:

```text
structural-visualization.js
```

It consumes existing normalized/verified models:

```text
scene
base_scene
recursive_lazy_expansion
structural_zoom_focus
sheet_branch_organization
```

and emits a finite SVG structural diagram.

A visible node means a structural level descriptor already materialized by the existing recursion model. A visible arrow means the existing adjacent pullback relation. The SVG does **not** reinterpret those glyphs as geometric hypersurfaces, embedded branches, genuine sheets, or covering maps.

The canonical scene still has:

```text
requestedDepth = 0
```

so the default published diagram honestly contains only the materialized base node `X₀`, together with a symbolic rule panel. It does not manufacture `X₁` merely to make the page look busier.

When an already-verified recursive model contains deeper finite descriptors, the same projection deterministically displays the corresponding finite nodes and edges.

Detailed contract:

```text
docs/STRUCTURAL_VISUALIZATION_self_similar_cy_visualizer_v0_14.md
```

## Project-level structural statement

The repository carries the project notation

\[
X=W^{-1}(\lambda),
\qquad
X_n=(P_D^n)^{-1}(X),
\qquad
P_D(z_1,\ldots,z_4)=(z_1^D,\ldots,z_4^D).
\]

The sealed Lean core formalizes the four-coordinate coordinate-power map, its iteration law, and an abstract set-theoretic pullback tower for arbitrary `X : Set Point4`.

It does **not** define `W` or Calabi–Yau geometry. Runtime `W` remains:

```text
unresolved
```

Therefore no geometric Calabi–Yau hypersurface is currently rendered.

## Frozen truthfulness boundary

The v0.14 projection preserves:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
cameraTransformApplied = false
materializationTriggered = false
W representation = unresolved
```

The structural visualization rejects inputs that violate this Thread 13 boundary rather than silently upgrading them.

## D² and D⁴

`scene-spec.js` still derives:

```text
scene.derived.metricScale = D^2
scene.derived.sheetDegree = D^4
```

The current interpretation remains:

```text
D² = runtime numeric metadata
D⁴ = runtime numeric / organizational metadata
```

In the v0.11 claim-discipline wording, D² and D⁴ explicitly as runtime/organization metadata remain runtime-side classifications rather than theorem promotion.

The repository does not claim that the sealed Lean core proves:

```text
P_D^* g_log = D^2 g_log
deg(P_D) = D^4
```

In particular, D⁴ runtime organization metadata is not a map-degree theorem in the current sealed formal scope. The SVG explicitly states that D⁴ remains organization metadata and that no covering structure is claimed.

## Lean-formalized scope

The sealed formal source remains unchanged:

```text
formal/SelfSimilarCY/CoordinatePower.lean
formal/SelfSimilarCY/CoordinatePowerIteration.lean
formal/SelfSimilarCY/PullbackTower.lean
```

Pinned environment:

```text
Lean: leanprover/lean4:v4.34.0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

v0.14 does not modify `formal/` and does not promote any new theorem.

## Arithmetic overlays

Implemented overlays remain:

```text
coordinate_channels
coordinate_iterate_rule
```

Cyclotomic, torsion, collision, divisor, and related parent-project geometry remains deferred unless exact canonical source evidence is retrieved and audited. Exact parent-project source artifacts are not source-verified in this thread, so no stronger parent-project result is promoted by v0.14.

## Navigation and performance boundary

“Infinite navigation” retains the operational meaning:

```text
arbitrarily continued finite structural navigation
```

Benchmark horizons are engineering observations, not mathematical limits. JavaScript safe-integer checks are representation-safety / engineering constraints, not mathematical theorems or depth bounds.

Thread 13 does not add user interaction, recursive-expansion controls, camera transforms, or geometric zoom. Those belong to the next interaction milestone.

## What green CI means

A green `formal-lean` job means the explicitly scoped Lean modules build, direct compilation succeeds, and the placeholder gate passes.

A green `runtime-contracts` job means the JavaScript contracts and claim-discipline verifiers pass, including the v0.14 structural-visualization verifier.

A green `publication-static-smoke` job means the static repository paths can be served and fetched successfully from a clean GitHub-hosted runner.

Green CI does **not** mean that the entire visualizer, all Calabi–Yau mathematics, browser behavior, D² metric scaling, D⁴ genuine map degree, covering geometry, or unavailable arithmetic research has been formally verified.

## Reproduce runtime verification

Use Node 22:

```bash
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
node verify_zoom_semantics_v0_07.js
node verify_sheet_branch_organization_v0_08.js
node verify_arithmetic_overlays_v0_09.js
node verify_performance_infinite_navigation_v0_10.js
node verify_mathematical_fidelity_v0_11.js
node verify_ux_exposition_v0_12.js
node verify_publication_checkpoint_v0_13.js
node verify_structural_visualization_v0_14.js
```

`verify_structural_visualization_v0_14.js` checks canonical depth-zero rendering, deterministic deeper finite fixtures, projection-only source discipline, truthfulness datasets, integration wiring, and byte-for-byte preservation of the sealed model engines.

## Reproduce the Lean core

From `formal/`:

```bash
lake exe cache get
lake build
lake env lean SelfSimilarCY/CoordinatePower.lean
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
lake env lean SelfSimilarCY/PullbackTower.lean
```

CI additionally rejects `axiom`, `sorry`, and `admit` placeholders in the sealed Lean source directory.

## Run locally

Serve the repository over HTTP:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

The page loads `data/system.json`, validates it, builds the established runtime models, projects them into the SVG structural diagram, and then renders the exposition/diagnostic surfaces.

## Scope of v0.14

v0.14 is **Thread 13 — Structural Visualization Layer**.

It adds a visible deterministic SVG projection and its verifier/documentation only. It does not implement concrete `W`, Calabi–Yau geometry, genuine D⁴ sheets, covering/étale/fiber geometry, cyclotomic/torsion/collision geometry, Canvas/WebGL/Three.js, camera transforms, or interaction controls.

The next milestone is **Thread 14 — Interaction Layer**. It is not started here.

# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.17 — D⁴ Branch Organization Graphics

**Published checkpoint:** v0.13 — Publication Checkpoint

**Runtime scene contract:** v0.12

This repository is a static HTML/CSS/vanilla-JavaScript structural visualizer for the coordinate-power pullback system. v0.17 adds a presentation-only aggregate graphical encoding for the already-existing D⁴ organizational multiplicity metadata, layered over the sealed v0.16 structural camera and v0.15 interactive pullback tower.

The interface is **structural, not geometric**. It does not implement a concrete `W`, a Calabi–Yau hypersurface, genuine sheets, covering geometry, or geometric zoom.

The evidence rule remains:

```text
runtime representation
!= mathematical theorem
!= Lean theorem
!= parent-project theorem
!= visualization convention
```

The v0.11 claim-discipline vocabulary remains binding: **D² and D⁴ explicitly as runtime/organization metadata**. Exact parent-project mathematical artifacts remain **not source-verified in this thread**, so unavailable parent results are not promoted.

D⁴ runtime organization metadata is **not a map-degree theorem** in the current sealed formal scope. Benchmark horizons are **not mathematical limits**, and JavaScript safe-integer checks are **representation-safety / engineering constraints** rather than mathematical theorems.

## Published v0.13 checkpoint

The immutable publication checkpoint remains:

```text
v0.13 — Publication Checkpoint
commit:
e83ed17a5ce8e45e67ef326042a21ec51ba24222

tree:
338a519614ea16ceb2e4a1247fc0c94338929f0c

release:
published / immutable / not prerelease
```

The repository is licensed under the **Apache License, Version 2.0** (`Apache-2.0`). The `LICENSE` file remains the operative grant.

## Thread 16 starting canonical baseline

Thread 16 starts from sealed Thread 15 canonical `main`:

```text
commit:
49ece02ada3a3f4aba2077fa86fd494df3c8188a

tree:
9a9f1ea776789fb4f9a02b0c43b59f2ac6c3cbf2

sole parent:
d40e938c318a8389baccb58223c9f057217ba018

commit message:
visualization: seal Thread 15 structural camera zoom v0.16
```

Inherited external evidence rechecked before implementation:

```text
Formal Verification run #76 / 35253648915
head SHA 49ece02ada3a3f4aba2077fa86fd494df3c8188a
conclusion = success

Pages run 35253643964
head SHA 49ece02ada3a3f4aba2077fa86fd494df3c8188a
conclusion = success

Thread 15 staging PR #8
closed / merged=false / draft CI vehicle only
```

## v0.17 D⁴ branch organization graphics

The new presentation module is:

```text
branch-organization-graphics.js
```

Its data flow is deliberately one-way:

```text
sealed sheet/branch organization renderer output
  -> read-only v0.17 projection
  -> aggregate multiplicity badge(s)
  -> existing structural SVG
  -> existing structural camera viewBox
```

The module consumes the canonical multiplicity source already exposed by the sealed organization runtime:

```text
scene.derived.sheetDegree
```

It does **not** read `parameters.D`, does not calculate `D ** 4`, does not enumerate branch slots, and does not create a second branch-semantics engine.

For every visible adjacent structural transition it can show one badge:

```text
D⁴ org
×N
```

where `N` is the exact existing runtime organization multiplicity.

At the canonical `D=2` fixture:

```text
D⁴ = 16
```

is represented as **16-fold structural organization** using one aggregate badge per visible transition, not sixteen fake geometric sheets.

The v0.17 verifier also checks `D=3 -> 81` and a larger safe fixture `D=64 -> 16777216` without multiplicity-sized DOM enumeration.

Detailed contract:

```text
docs/D4_BRANCH_ORGANIZATION_GRAPHICS_self_similar_cy_visualizer_v0_17.md
```

## D=1 and representation safety

The inherited scene validator currently accepts safe-integer `D >= 2`. Therefore `D=1` is rejected by the current runtime schema.

That is documented as a **current schema / representation boundary**, not a mathematical impossibility.

Likewise, derived safe-integer checks are JavaScript representation-safety constraints, not mathematical limits.

## Branch presentation, recursion, focus, and camera are different domains

```text
branch presentation state
!= recursive depth state
!= structural focus state
!= selected/collapsed state
!= camera state
!= geometric zoom
```

v0.17 does not introduce a branch LOD controller. Its minimal coherent representation is aggregate-only.

The sealed v0.15 interaction controller remains the only layer that may request finite structural expansion. The v0.16 camera remains a presentation-only SVG viewport state machine. Camera scale is presentation-only viewport state.

## Canonical `requestedDepth = 0`

The canonical scene remains unchanged:

```text
data/system.json
requestedDepth = 0
D = 2
W representation = unresolved
```

The richer UI is produced by legal interaction and presentation projection, not by deepening the canonical fixture.

## Structural visualization and camera

`structural-visualization.js` continues to project finite verified runtime structure into inline SVG. The v0.17 badges are inserted into that same SVG, so ordinary v0.16 `viewBox` camera operations naturally move the badges together with the existing structure.

No second camera, double viewport, or duplicated mathematical layout engine is introduced.

The sealed v0.15 interaction semantics also remain unchanged. Structural refocus alone does not perform a camera transform or geometric zoom.

## Truthfulness boundary

The project-wide geometric truth boundary remains:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W representation = unresolved
```

`D⁴` badges are graphical encodings of organizational metadata only. They are not concrete sheets, fibers, hypersurface branches, manifold copies, actual geometric preimages, or a literal covering map.

## D² and D⁴

`scene-spec.js` still derives:

```text
scene.derived.metricScale = D^2
scene.derived.sheetDegree = D^4
```

The interpretation remains exactly:

```text
D² = runtime numeric metadata
D⁴ = runtime numeric / organizational metadata
```

The repository does not claim that the sealed Lean core proves:

```text
P_D^* g_log = D^2 g_log
deg(P_D) = D^4
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

It does not define `W` or Calabi–Yau geometry. Runtime `W` remains `unresolved`.

Therefore no geometric Calabi–Yau hypersurface is currently rendered.

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

v0.17 adds no Lean theorem and changes no formal file, toolchain pin, or mathlib pin.

## Verification

Runtime verification uses Node 22:

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
node verify_interactive_pullback_tower_v0_15.js
node verify_structural_camera_zoom_v0_16.js
node verify_branch_organization_graphics_v0_17.js
```

The v0.17 verifier checks exact multiplicity reuse, aggregate-only DOM encoding, no second D⁴ engine, deterministic output, D=1 schema handling, interaction isolation, camera isolation, truthfulness flags, browser integration, source discipline, and CI wiring.

Pre-final-artifact staging run #79 (`35256652594`) passed:

```text
runtime-contracts        = success
formal-lean              = success
publication-static-smoke = success
```

All runtime verifiers v0.03 through v0.17 passed in that run.

## What green CI means

A green `formal-lean` job means the explicitly scoped Lean modules build, direct compilation succeeds, and the placeholder gate passes.

A green `runtime-contracts` job means the JavaScript contracts and claim-discipline verifiers pass, including v0.17 and all earlier runtime verifiers.

A green `publication-static-smoke` job means the static repository paths can be served and fetched successfully from a clean GitHub-hosted runner.

Green CI does **not** mean that the entire visualizer, all Calabi–Yau mathematics, browser behavior on every device, D² metric scaling, D⁴ genuine map degree, covering geometry, or unavailable arithmetic research has been formally verified.

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

## Scope of v0.17

v0.17 is **Thread 16 — D⁴ Branch Organization Graphics**.

It adds truthful aggregate organization graphics only. It does not implement concrete `W`, Calabi–Yau geometry, genuine D⁴ sheets, covering/étale/fiber geometry, cyclotomic/torsion/collision geometry, metric scaling, Canvas/WebGL/Three.js geometry, an infinite-navigation rendering engine, or a new Lean theorem.

The final v0.17 state/progress artifacts are intentionally non-self-certifying. Thread 16 is sealed only after the exact final staging tree passes CI, PR #9 is closed unmerged, that exact tree is replayed as one child of the Thread 15 canonical commit, `main` is fast-forwarded, and exact-main Formal Verification plus exact-SHA Pages both succeed.

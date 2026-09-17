# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.16 — Structural Camera / Zoom Layer

**Published checkpoint:** v0.13 — Publication Checkpoint

**Runtime scene contract:** v0.12

This repository is a static HTML/CSS/vanilla-JavaScript structural visualizer for the coordinate-power pullback system. v0.16 adds a persistent presentation-only structural camera over the v0.15 interactive pullback tower while preserving the sealed runtime/model and Lean boundaries.

The interface is **structural, not geometric**. It does not implement a concrete `W`, a Calabi–Yau hypersurface, genuine sheets, covering geometry, or geometric zoom.

The evidence rule remains:

```text
runtime representation
!= mathematical theorem
!= Lean theorem
!= parent-project theorem
!= visualization convention
```

The v0.11 claim-discipline vocabulary remains binding: **D² and D⁴ explicitly as runtime/organization metadata**. D⁴ runtime organization metadata is **not a map-degree theorem** in the current sealed formal scope. Exact parent-project mathematical artifacts remain **not source-verified in this thread**, so no unavailable parent result is promoted. Benchmark horizons are **not mathematical limits**, and JavaScript safe-integer checks are **representation-safety / engineering constraints** rather than mathematical theorems.

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

The repository is licensed under the **Apache License, Version 2.0** (`Apache-2.0`). The `LICENSE` file remains the operative grant; later implementation milestones do not alter the published checkpoint or its licensing boundary.

## Thread 15 starting canonical baseline

Thread 15 starts from the sealed Thread 14 canonical commit:

```text
canonical main commit:
d40e938c318a8389baccb58223c9f057217ba018

canonical tree:
2cd18d37b4b5b0c8b400547eadd113a3b686300e

parent:
97ee38e7f0a8704297621f8fc15f0109c8512751

Formal Verification:
run #61 / 35241064931
runtime-contracts          = success
formal-lean                = success
publication-static-smoke   = success

GitHub Pages build/deployment:
run 35241063761
head SHA = d40e938c318a8389baccb58223c9f057217ba018
conclusion = success
```

The Thread 14 staging PR was closed unmerged. Thread 15 starts from canonical `main`, not from the old staging branch.

The published `v0.13` tag remains at `e83ed17a5ce8e45e67ef326042a21ec51ba24222`. v0.16 is an engineering milestone layered after that immutable publication checkpoint; it does not replace the v0.13 release identity.

## v0.16 structural camera

The new camera module is:

```text
structural-camera.js
```

Its architecture is:

```text
interaction/controller state
  -> existing runtime models
  -> structural visualization projection
  -> read-only structural layout descriptor
  -> persistent StructuralCamera state
  -> SVG viewBox presentation
```

The camera supports:

```text
pan
wheel zoom
pointer drag pan
two-pointer pinch zoom
fit visible structure
fit selected level
fit focused level
reset camera
```

Camera state is kept independently from the regenerated SVG DOM and is reconciled after structural re-renders.

Detailed contract:

```text
docs/STRUCTURAL_CAMERA_ZOOM_self_similar_cy_visualizer_v0_16.md
```

## Camera, focus, and geometry are different domains

The sealed `zoom-semantics.js` module still means structural focus metadata only.

```text
structural focus
!= camera target
!= viewport center
!= cameraScale
!= geometric zoom
```

A camera fit command may read the selected or focused level as a presentation target. It cannot modify selection, focus, recursion, or canonical scene state.

`cameraScale` is an SVG viewport value. It is not `scene.derived.metricScale` and it is not a mathematical coordinate-scaling theorem.

## Canonical `requestedDepth = 0`

The canonical scene remains unchanged:

```text
data/system.json
requestedDepth = 0
```

The initial page therefore still begins honestly at `X₀`.

Only the sealed v0.15 interaction controller may request finite structural expansion in response to the explicit expand interaction. Camera gestures do not change requested depth or materialize descriptors.

## v0.15 interaction semantics remain sealed

```text
expand
= the only interaction allowed to increase structural descriptor materialization

select
= selection metadata only

refocus
= structural focus metadata only
= no expansion
= no camera transform by the focus module
= no geometric zoom

collapse
= presentation-only hiding of descendants
= no deletion of mathematical/runtime structure

reveal
= presentation-only restoration of already materialized descendants
```

The Thread 15 camera is a sibling presentation layer. It does not redefine any of these operations.

## Structural visualization

`structural-visualization.js` continues to project finite verified runtime structure into inline SVG. v0.16 adds a small read-only layout descriptor API so the camera can fit known structural levels without duplicating layout constants or parsing hidden mathematical meaning from the DOM.

A visible node remains a finite structural level descriptor. A visible arrow remains an adjacent pullback relation already present in the runtime model. These glyphs are not geometric hypersurfaces, embedded branches, genuine sheets, or covering maps.

## Persistent camera semantics

Each accepted structural interaction may regenerate the entire structural SVG markup. The camera model is therefore retained outside that transient SVG and reapplied afterward:

```text
previous camera state
+ new structural layout extent
= reconciled deterministic camera state
```

At identity, the camera follows the new canonical structural extent. When transformed, it preserves the existing presentation center and scale where valid.

The application uses `StructuralCamera.applyStructuralCamera(...)` as the shared SVG viewport adapter.

## Camera truthfulness

The project-wide geometric truth boundary remains:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W representation = unresolved
```

Camera state has a separate presentation truth flag:

```text
identity camera:
cameraTransformApplied = false

transformed camera:
cameraTransformApplied = true
```

`cameraTransformApplied=true` is an engineering/UI statement that an SVG viewport transform is active. It does not mean geometric zoom, Calabi–Yau geometry, metric scaling, sheet materialization, or covering geometry.

Earlier sealed models may retain `cameraTransformApplied=false` because those models themselves do not apply the camera transform. The camera layer owns the new presentation truth domain.

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

The camera code does not read, recompute, or alias D² or D⁴.

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

v0.16 does not modify the formal core and does not promote a new theorem.

## Accessibility floor

Existing structural interaction controls remain native buttons with keyboard focus behavior. Camera controls are also native buttons with `:focus-visible` styling.

Pointer and wheel gestures are additional camera input surfaces; they do not replace the button controls.

The final full accessibility audit remains a later milestone.

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
```

The v0.16 verifier checks deterministic camera transitions, numeric guards, scale bounds, real layout fixtures, re-render persistence, interaction-state immutability, sealed-source hashes, the shared SVG viewport adapter, responsive camera surface discipline, and app/index/CI integration.

## What green CI means

A green `formal-lean` job means the explicitly scoped Lean modules build, direct compilation succeeds, and the placeholder gate passes.

A green `runtime-contracts` job means the JavaScript contracts and claim-discipline verifiers pass, including the v0.16 structural camera verifier and all earlier runtime verifiers.

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

The page loads and validates `data/system.json`, constructs the sealed base/pullback and interaction models, projects the structural SVG, constructs/reconciles the independent camera model, and reapplies the camera view after accepted structural interactions.

## Scope of v0.16

v0.16 is **Thread 15 — Structural Camera / Zoom Layer**.

It adds structural viewport navigation only. It does not implement concrete `W`, Calabi–Yau geometry, genuine D⁴ sheets, covering/étale/fiber geometry, cyclotomic/torsion/collision geometry, metric scaling, Canvas/WebGL/Three.js geometry, or a new Lean theorem.

No subsequent milestone is started or named by the v0.16 seal artifacts.

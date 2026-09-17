# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.15 — Interactive Pullback Tower

**Published checkpoint:** v0.13 — Publication Checkpoint

**Runtime scene contract:** v0.12

This repository is a static HTML/CSS/vanilla-JavaScript structural visualizer for the coordinate-power pullback system. v0.15 turns the v0.14 structural SVG projection into an interactive pullback tower while preserving the sealed runtime/model boundaries.

The interface is **structural, not geometric**. It does not implement a concrete `W`, a Calabi–Yau hypersurface, genuine sheets, covering geometry, or geometric/camera zoom.

The evidence rule remains:

```text
runtime representation
!= mathematical theorem
!= Lean theorem
!= parent-project theorem
!= visualization convention
```

## Thread 14 canonical baseline

Thread 14 starts from the sealed Thread 13 canonical commit:

```text
canonical main commit:
97ee38e7f0a8704297621f8fc15f0109c8512751

canonical tree:
6b6948e7d83efdf91c50a73841d71ebbb770ef60

parent:
e83ed17a5ce8e45e67ef326042a21ec51ba24222

Formal Verification:
run #49 / 35232440872
runtime-contracts          = completed / success
formal-lean                = completed / success
publication-static-smoke   = completed / success

GitHub Pages build/deployment:
run 35232440091
head SHA = 97ee38e7f0a8704297621f8fc15f0109c8512751
conclusion = success
```

The published `v0.13` tag remains at `e83ed17a5ce8e45e67ef326042a21ec51ba24222`. The `v0.13 — Publication Checkpoint` release remains published, immutable, and not a prerelease.

## v0.15 interactive pullback tower

The new interaction controller is:

```text
interactive-pullback-tower.js
```

Its architecture is:

```text
user event
  -> interaction/controller state
  -> sealed runtime APIs
  -> current runtime models
  -> structural visualization projection
  -> DOM/SVG render
```

The controller reuses:

```text
RecursiveLazyExpansion
ZoomSemantics
SheetBranchOrganization
StructuralVisualization
```

It does not define a second recursion engine, recompute D²/D⁴, enumerate sheets, or implement geometry.

The user can:

```text
expand the next structural level
collapse materialized descendants for presentation
select a visible materialized level
refocus a visible materialized level
inspect a state-derived structural breadcrumb
```

Selection and structural focus do not trigger recursive expansion. Collapse does not delete recursive descriptors or reduce `materializedDepth`.

Detailed contract:

```text
docs/INTERACTIVE_PULLBACK_TOWER_self_similar_cy_visualizer_v0_15.md
```

## Canonical `requestedDepth = 0`

The canonical scene remains unchanged:

```text
data/system.json
requestedDepth = 0
```

Therefore the initial page still begins honestly at `X₀`.

When the user explicitly asks to expand, v0.15 creates an ephemeral interaction-request state and delegates structural descriptor materialization to the sealed recursion API. This interaction state is not written back to `data/system.json`, is not a new theorem, and is not a new canonical mathematical source.

## Interaction semantics

```text
expand
= the only interaction allowed to increase structural descriptor materialization

select
= selection metadata only

refocus
= structural navigation metadata only
= no expansion
= no camera transform
= no geometric zoom

collapse
= presentation-only hiding of descendants
= no deletion of mathematical/runtime structure

reveal
= presentation-only restoration of already materialized descendants
```

`structuralDescriptorMaterializationTriggered=true` may appear on an expansion transition. This means a finite recursive descriptor was added. It does **not** mean geometric or sheet materialization.

## Structural visualization

`structural-visualization.js` still projects finite verified runtime structure into inline SVG. v0.15 additionally projects selected/focused/collapsed presentation state.

A visible node is a finite structural level descriptor. A visible arrow is an adjacent pullback relation already present in the runtime model. These glyphs are not geometric hypersurfaces, embedded branches, genuine sheets, or covering maps.

The diagram remains structural, not a geometric realization.

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

v0.15 preserves:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
cameraTransformApplied = false
W representation = unresolved
```

Selection, focus, breadcrumb, collapse, and expansion controls must not promote any of these claims.

## D² and D⁴

`scene-spec.js` still derives:

```text
scene.derived.metricScale = D^2
scene.derived.sheetDegree = D^4
```

The interpretation remains:

```text
D² = runtime numeric metadata
D⁴ = runtime numeric / organizational metadata
```

The repository does not claim that the sealed Lean core proves:

```text
P_D^* g_log = D^2 g_log
deg(P_D) = D^4
```

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

v0.15 does not modify `formal/` and does not promote any new theorem.

## Accessibility floor

Essential interaction uses native buttons rather than mouse-only SVG handlers. Selected/focused controls expose pressed/current state, and keyboard focus receives visible `:focus-visible` styling. The final full accessibility audit remains a later milestone.

## Navigation and camera boundary

“Infinite navigation” retains the operational meaning:

```text
arbitrarily continued finite structural navigation
```

v0.15 does **not** implement pan, wheel zoom, pinch zoom, fit-to-level camera, SVG viewBox camera navigation, drag canvas, camera matrices, or geometric scaling. Structural refocus is navigation metadata only.

## What green CI means

A green `formal-lean` job means the explicitly scoped Lean modules build, direct compilation succeeds, and the placeholder gate passes.

A green `runtime-contracts` job means the JavaScript contracts and claim-discipline verifiers pass, including v0.15 interaction transitions and all earlier verifiers.

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
node verify_interactive_pullback_tower_v0_15.js
```

The v0.15 verifier tests deterministic multi-step interaction sequences, invalid/unmaterialized target rejection, selection/focus/materialization consistency, presentation collapse/reveal, breadcrumb consistency, source-discipline guards, sealed runtime blobs, truthfulness invariants, and index/app/CI integration.

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

The page loads and validates `data/system.json`, constructs the sealed base/pullback models, creates the interaction controller state, and re-renders the runtime diagnostics, exposition, and structural SVG after each accepted interaction.

## Scope of v0.15

v0.15 is **Thread 14 — Interactive Pullback Tower**.

It adds interaction/navigation/presentation semantics only. It does not implement concrete `W`, Calabi–Yau geometry, genuine D⁴ sheets, covering/étale/fiber geometry, cyclotomic/torsion/collision geometry, Canvas/WebGL/Three.js, or camera transforms.

The next milestone is **Thread 15 — Structural Camera / Zoom Layer**. It is not started here.

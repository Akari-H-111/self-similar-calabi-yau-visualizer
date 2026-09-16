# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.09 — Arithmetic Overlays

This repository is a minimal static HTML/CSS/vanilla-JavaScript application for the Self-Similar Calabi–Yau Visualizer. v0.09 adds **provenance-aware symbolic arithmetic overlays** on top of the v0.08 aggregate sheet/branch organization model while preserving the v0.03–v0.08 runtime contracts and the sealed F01–F06 formal boundary.

## Canonical mathematical core

\[
X = W^{-1}(\lambda),
\qquad
X_n = (P_D^n)^{-1}(X),
\qquad
P_D(z_1,\ldots,z_4) = (z_1^D,\ldots,z_4^D).
\]

The scene is loaded from `data/system.json`, validated by `scene-spec.js`, and passed through the base, one-step, recursive, zoom, sheet/branch-organization, and arithmetic-overlay layers.

## Preserved canonical contracts

The v0.03 canonical mathematical inputs remain only `D`, `lambda`, and `kappa`. `requestedDepth` remains a request parameter. `P_D` still comes only from the structured `coordinate_power` declaration.

`scene-spec.js` remains the sole runtime source of:

```text
scene.derived.metricScale = D^2
scene.derived.sheetDegree = D^4
```

The concrete representation of `W` remains:

```text
unresolved
```

Accordingly:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
```

The v0.06 recursion engine remains the only operation that can add structural levels. v0.07 zoom remains structural focus/navigation only. v0.08 sheet/branch organization remains aggregate structural metadata only.

v0.09 adds the explicit boundary:

```text
arithmetic overlay != recursive materialization
arithmetic truth != geometric realization
```

## v0.09 evidence audit

The roadmap candidates were audited before implementation.

Deferred because no exact canonical source artifact was available to this thread:

```text
cyclotomic refinement
torsion labels
collision classes
Delta_n / divisor marking
```

These candidates are represented only as deterministic `unavailable` audit entries with no source version and no generated data.

The only source-backed candidate family implemented in v0.09 is **coordinate-channel labels**.

## Implemented arithmetic overlays

### `coordinate_channels`

This global structural overlay is backed by:

```text
formal/SelfSimilarCY/CoordinatePower.lean
git blob dcfae8a3ed99544e50ee45aa12acde63e41090c8
```

The sealed Lean source defines:

```lean
Point4 := Fin 4 → ℂ
coordinatePower D z i = z i ^ D
```

The overlay labels the four coordinate channels using the already validated runtime `coordinateCount`. It creates no points, fibers, sheets, torus structure, or geometry.

Evidence class:

```text
source_backed_structural_representation
```

with sealed `formal_theorem` support.

### `coordinate_iterate_rule`

This focused-level symbolic overlay is backed by:

```text
formal/SelfSimilarCY/CoordinatePowerIteration.lean
git blob 4c78793d586e8ba822d4b326f09fd82dc07eaaf9
```

The sealed theorem is:

```lean
(coordinatePower D)^[n] z i = z i ^ (D ^ n)
```

At an already-materialized focus depth `n`, v0.09 exposes the exponent symbolically as a structured `{ baseParameter, towerDepth }` expression. It does not evaluate a huge `D^n`, build a combined map object, or apply geometric scaling.

Evidence class:

```text
formal_theorem
```

If the requested focus is not materialized, this overlay returns `not_materialized` and does not expand recursion.

## Exact provenance

The two implemented overlays carry exact source path, Git blob SHA, and the sealed F06 commit:

```text
ff5bcd2f134497c671b2368c372f59b5620a41ab
```

`verify_arithmetic_overlays_v0_09.js` recomputes the Git blob SHA from the repository source text and checks the expected theorem identities. A stale or source-free provenance claim therefore fails verification.

## Runtime overlay model

`arithmetic-overlays.js` is an independent derived layer. It consumes:

```text
validated normalized scene
current recursive model
current zoom/focus model
current sheet/branch organization model
runtime overlay request ids
```

It records:

```text
requestedOverlays
implementedOverlays
deferredCandidateOverlays
availableOverlays
enabledOverlays
requestResults
overlayDescriptors
sourceArtifacts
requestedDepth
materializedDepth
requestedFocusDepth
focusedDepth
overlayStateIsViewRequest = true
recursionModified = false
zoomModified = false
sheetOrganizationModified = false
materializationTriggered = false
geometryRendered = false
formalVerificationReopened = false
```

Overlay enable/disable state is runtime view state and is not written into `data/system.json`. Schema version 1 is unchanged.

## Toggle and availability semantics

The overlay layer supports:

```text
all disabled
one enabled
multiple independently enabled
disable after enable
deferred overlay request
unsupported overlay request
```

Toggling overlays does not alter:

```text
requestedDepth
materializedDepth
requestedFocusDepth
focusedDepth
recursive levels
sheet/branch descriptors
```

`coordinate_channels` is global system metadata. `coordinate_iterate_rule` is focused-level metadata and requires an already-materialized focus.

## Formal verification boundary

Formal Verification F01–F06 remains sealed. v0.09 changes no Lean theorem/source file.

A green CI run still means:

```text
sealed Lean formal core passes
+
runtime engineering contracts pass
```

It does **not** mean all arithmetic overlay mathematics, all Calabi–Yau geometry, or the entire visualizer is formally verified.

v0.09 does not claim:

```text
cyclotomic refinement theorem/geometry
torsion loci or torsion geometry
collision loci or collision geometry
Delta_n divisor geometry
deg(P_D) = D^4 as a genuine map-degree theorem
concrete D^4 sheets
covering-space or étale structure
fiber geometry
resolved W geometry
Calabi–Yau geometry
P_D^* g_log = D^2 g_log
```

See `docs/FORMAL_HANDOFF_self_similar_cy_visualizer_v0_06.md` and `docs/ARITHMETIC_OVERLAYS_self_similar_cy_visualizer_v0_09.md` for the exact boundary.

## Rendering surface

The rendering surface remains ordinary DOM text/status output. v0.09 adds no Canvas/SVG geometry, Three.js, WebGL, GPU buffers, camera matrices, projection, physical viewport transforms, or meshes.

## Run locally

Serve the repository over HTTP rather than opening `index.html` with `file://`:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in a browser.

## Verify

```bash
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
node verify_zoom_semantics_v0_07.js
node verify_sheet_branch_organization_v0_08.js
node verify_arithmetic_overlays_v0_09.js
node --check scene-spec.js
node --check base-renderer.js
node --check one-step-pullback.js
node --check recursive-lazy-expansion.js
node --check zoom-semantics.js
node --check sheet-branch-organization.js
node --check arithmetic-overlays.js
node --check app.js
```

The v0.09 verifier covers exact Lean provenance, evidence classes, toggle independence, unavailable source/focus behavior, recursion/zoom/sheet-organization non-mutation, source-of-truth guards, unresolved geometry, and scope exclusions.

The historical v0.08 verifier keeps all behavioral assertions. Only its exact version-metadata assertion is generalized to accept repository versions at or after v0.08.

## Scope of v0.09

This version implements **Thread 08 — Arithmetic Overlays** only. It does not implement cyclotomic/torsion/collision/divisor geometry, performance optimization, infinite-navigation stress testing, global mathematical fidelity audit, guided UX, publication work, Three.js, WebGL, or GPU rendering.

The next milestone is **Thread 09 — Performance and Infinite-Navigation Audit**.

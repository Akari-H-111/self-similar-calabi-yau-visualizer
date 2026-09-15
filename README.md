# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.07 — Zoom Semantics

This repository is a minimal static HTML/CSS/vanilla-JavaScript application for the Self-Similar Calabi–Yau Visualizer. v0.07 adds verified **structural focus / level-navigation semantics** on top of the v0.06 Recursive Lazy Expansion while preserving the v0.03 mathematical scene contract and the v0.04–v0.06 runtime contracts.

## Canonical mathematical core

\[
X = W^{-1}(\lambda),
\]

\[
X_n = (P_D^n)^{-1}(X),
\]

\[
P_D(z_1,\ldots,z_4) = (z_1^D,\ldots,z_4^D).
\]

The scene is loaded from `data/system.json`, validated by `scene-spec.js`, passed through `base-renderer.js`, `one-step-pullback.js`, and `recursive-lazy-expansion.js`, then consumed by `zoom-semantics.js` as derived view state.

## Preserved canonical contracts

The v0.03 canonical mathematical inputs remain only:

- `D`, an integer with `D >= 2`;
- finite numeric `lambda`;
- finite numeric `kappa`.

`requestedDepth` remains a request parameter rather than an intrinsic mathematical input. `P_D` still comes only from the structured `coordinate_power` declaration, while `D^2` and `D^4` remain derived quantities computed by `scene-spec.js` after validation.

The concrete representation of `W` remains exactly:

```text
unresolved
```

Accordingly, the v0.04 Base Renderer still reports:

```text
status = unresolved_geometry
geometryRendered = false
```

and the v0.05 One-Step Pullback still reports exactly:

```text
depth = 1
relation = inverse_image
status = unresolved_pullback_geometry
geometryRendered = false
sheetsMaterialized = false
```

The v0.06 recursive contract remains request-bounded:

```text
requestedDepth     = requested target structural depth
materializedDepth  = highest structural depth currently materialized
```

`expandOneLevel` remains the only operation that can add a structural level, and application startup still never calls it.

## v0.07 Zoom Semantics

Because `W` is unresolved and the repository contains no concrete embedding, metric coordinates, points, mesh, camera geometry, projection, or viewport transform, v0.07 does **not** define geometric zoom.

The truthful minimum semantics is:

```text
zoom = structural focus / level navigation
```

The zoom model distinguishes:

```text
requestedFocusDepth
focusedDepth
availableDepth = recursiveModel.materializedDepth
requestedDepth = recursiveModel.requestedDepth
focusStatus
```

If a focus target is already materialized, it is available. If it is deeper than `materializedDepth`, the model returns:

```text
focusStatus = not_materialized
focusedDepth = null
materializationTriggered = false
```

The focus request is neither clamped nor silently expanded. The zoom module never calls `expandOneLevel`, never rewrites `requestedDepth`, and never maintains a second recursive frontier.

## `D^2` is formal scale metadata, not visual zoom

The scene validator already exposes:

```text
scene.derived.metricScale = D^2
```

At an available focused depth `n`, v0.07 records the informational expression

```text
baseScale = scene.derived.metricScale
exponent = n
```

representing

\[
(D^2)^n=D^{2n}.
\]

This metadata does not drive a camera or viewport. The zoom model explicitly reports:

```text
geometricZoomApplied = false
cameraTransformApplied = false
```

`zoom-semantics.js` does not recompute `D^2`, does not read `parameters.D`, and does not use `D^4` or `scene.derived.sheetDegree` as a zoom factor.

The sealed Formal Verification F01–F06 line remains closed. Runtime `metricScale = D^2` is still not claimed as a newly Lean-proved metric theorem.

## Degree information remains distinct from sheet geometry

For each recursive transition, the inherited runtime map-degree metadata remains `D^4`. At structural depth `n`, v0.06 continues to record the iterated-degree expression as:

```text
baseDegree = D^4
exponent = n
```

No sheet array, sheet object, branch object, pullback point, mesh, contour, slice, or implicit surface is created. Thread 07 remains the future `D^4 Sheets` milestone.

## Rendering surface

The rendering surface remains ordinary DOM. v0.07 adds no Canvas, SVG geometry, Three.js, WebGL, GPU buffer, camera matrix, projection, physical viewport transform, mesh LOD, or arithmetic/cyclotomic overlay architecture.

## Formal verification boundary

Formal Verification F01–F06 is sealed and remains a stable claim boundary. Its Lean job and the runtime engineering job remain independent. v0.07 extends only the runtime-contract verification surface; it does not reopen the formal line or claim that the whole visualizer is formally verified.

See `docs/FORMAL_HANDOFF_self_similar_cy_visualizer_v0_06.md` for the compact sealed formal boundary.

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
node --check scene-spec.js
node --check base-renderer.js
node --check one-step-pullback.js
node --check recursive-lazy-expansion.js
node --check zoom-semantics.js
node --check app.js
```

The v0.07 verifier covers deterministic focus at depth `0`, `1`, and higher requested depths; unavailable-focus boundaries; strict separation between zoom and recursive materialization; reuse of the current recursive frontier; `D^2` source-of-truth behavior; validation-before-render ordering; unresolved-`W` preservation; and scope guards against camera, geometry, sheets, overlays, Three.js, and WebGL.

The historical v0.06 verifier keeps all recursive behavioral assertions. Its one exact version-metadata assertion is minimally generalized to accept repository version metadata at or after v0.06, matching the compatibility policy already used by earlier verifiers.

## Scope of v0.07

This version implements **Thread 06 — Zoom Semantics** only. It does not implement concrete `D^4` sheet visualization, sheet objects, branch geometry, arithmetic/cyclotomic overlays, Three.js, WebGL, GPU buffers, camera matrices, perspective/orthographic projection, viewport transforms, mesh LOD, performance optimization, fidelity audit, later UX, or publication work.

The next milestone is **Thread 07 — D^4 Sheets**.

# Zoom Semantics Specification — v0.07

## Status

This document closes **Thread 06 — Zoom Semantics**.

The milestone defines the truthful meaning of “zoom” while the concrete representation of `W` remains unresolved and the runtime contains structural pullback levels rather than geometric coordinates.

## Canonical dependencies

The v0.03 mathematical scene contract is unchanged:

\[
X=W^{-1}(\lambda),
\qquad
X_n=(P_D^n)^{-1}(X),
\]

with

\[
P_D(z_1,\ldots,z_4)=(z_1^D,\ldots,z_4^D).
\]

Canonical mathematical inputs remain only `D`, `lambda`, and `kappa`. `requestedDepth` remains a request parameter. `P_D` still comes only from the structured `coordinate_power` declaration. `D^2` and `D^4` remain validator-derived data, and `W.representation` remains exactly `unresolved`.

The v0.04 Base Renderer, v0.05 One-Step Pullback, and v0.06 Recursive Lazy Expansion contracts remain unchanged.

Formal Verification F01–F06 remains sealed. In particular, runtime `metricScale = D^2` is not promoted by this milestone into a newly formalized metric theorem.

## First Gate: what zoom can canonically mean

Without concrete embedding coordinates, a metric realization, points, meshes, camera geometry, or a viewport transform, the visualizer cannot canonically define geometric zoom.

The information that does exist is an indexed structural family together with the subset of structural levels currently materialized. Therefore v0.07 defines zoom only as:

```text
structural focus / level navigation
```

A focus request selects a structural depth for inspection if and only if that depth is already materialized.

This is intentionally distinct from:

- mathematical structural depth `X_n`;
- request target `requestedDepth`;
- current recursive frontier `materializedDepth`;
- recursive materialization through `expandOneLevel`;
- camera distance or projection state;
- CSS/screen-space scaling;
- metric/geometric magnification.

## View-state contract

The zoom layer is a derived, immutable view model. It is not persisted into `data/system.json`.

For each focus request it records:

```text
requestedFocusDepth
focusedDepth
availableDepth
requestedDepth
focusStatus
focusAvailable
withinRequestedDepth
formalMetricScaleSource
formalMetricScaleExpression
geometricZoomApplied
cameraTransformApplied
materializationTriggered
```

`availableDepth` is copied directly from the current recursive model's `materializedDepth`.

`requestedDepth` is copied directly from the current recursive model. The zoom layer does not read a second request target and does not modify it.

### Available focus

If

```text
requestedFocusDepth <= materializedDepth
```

then:

```text
focusStatus = focused
focusedDepth = requestedFocusDepth
focusAvailable = true
```

Depth `0` represents focus on the base structural object. Positive depths represent already-materialized pullback levels.

### Unavailable focus

If

```text
requestedFocusDepth > materializedDepth
```

then:

```text
focusStatus = not_materialized
focusedDepth = null
focusAvailable = false
```

The target is not clamped to another depth and is not silently materialized. This preserves the distinction between “requested focus” and “effective focus.”

A focus request beyond `requestedDepth` is also deterministic: `withinRequestedDepth = false`, the focus remains unavailable, and `requestedDepth` remains untouched.

## Zoom is not recursive materialization

The boundary is strict:

```text
zoom != recursive materialization
```

`zoom-semantics.js` contains no call to `expandOneLevel`.

Only the existing v0.06 recursive operation may add a structural level. If recursion is explicitly expanded elsewhere, a later zoom-model construction consumes that updated recursive state and can then focus the newly available level. The zoom layer keeps no duplicate recursive frontier.

This prevents UI/view semantics from becoming a second recursion engine.

## Role of `D^2`

The scene validator already exposes:

```text
scene.derived.metricScale = D^2
```

v0.07 may carry this value as non-rendering formal-scale metadata at an available focus depth `n`:

```text
formalMetricScaleExpression.baseScale = scene.derived.metricScale
formalMetricScaleExpression.exponent = n
```

which records the expression

\[
(D^2)^n=D^{2n}.
\]

This does **not** apply a visual zoom factor. The model explicitly reports:

```text
geometricZoomApplied = false
cameraTransformApplied = false
```

The zoom layer does not recompute `D^2`, does not read `parameters.D`, and does not use `D^4` or `scene.derived.sheetDegree` as a zoom factor.

Under the sealed F01–F06 handoff, this runtime scale expression remains informational metadata rather than a new formal proof of the metric pullback identity.

## Architecture

### `scene-spec.js`

Unchanged. It remains the only raw-scene validator and the unique source of `derived.metricScale` and `derived.sheetDegree`.

### `recursive-lazy-expansion.js`

Unchanged. It remains the only recursive materialization engine and stays zoom-agnostic.

### `zoom-semantics.js`

New in v0.07. It has two responsibilities only:

1. create a deterministic immutable focus model from a validated normalized scene plus the current verified recursive model;
2. render that view state into a supplied DOM-like target.

It introduces no camera, projection, geometry, scheduler, router, event bus, cache, scene graph, or state-management framework.

### `app.js`

The initialization pipeline becomes:

```text
raw JSON
  -> SceneSpec.validateAndNormalizeScene
  -> BaseRenderer.renderBaseScene
  -> OneStepPullback.renderOneStepPullback
  -> RecursiveLazyExpansion.createRecursiveLazyExpansionModel
  -> RecursiveLazyExpansion.renderRecursiveLazyExpansion
  -> ZoomSemantics.createZoomFocusModel(..., 0)
  -> ZoomSemantics.renderZoomSemantics
  -> visible validated scene metadata
```

Startup focuses depth `0` only. It still never calls `expandOneLevel`.

## Rendering boundary

The ordinary DOM remains the rendering surface.

v0.07 introduces no:

- concrete geometry;
- sheet objects;
- branch geometry;
- Canvas or SVG geometry;
- Three.js or WebGL;
- GPU buffers;
- camera matrix;
- perspective or orthographic projection;
- viewport transform;
- mesh LOD;
- arithmetic or cyclotomic overlays.

## Verification contract

`verify_zoom_semantics_v0_07.js` verifies:

- `requestedDepth = 0`, `materializedDepth = 0`, focus depth `0` is valid;
- depth `1` focus is compatible with the existing one-step structural level;
- every focus at or below `materializedDepth` is available;
- a focus above `materializedDepth` returns `not_materialized` with `focusedDepth = null`;
- unavailable focus does not change the recursive frontier;
- only an explicit `expandOneLevel` call makes the next depth available;
- the zoom model then consumes the updated recursive state instead of a duplicate frontier;
- focus beyond the request target does not rewrite `requestedDepth`;
- `D = 3` yields `scene.derived.metricScale = 9` and the zoom layer reuses that value without recomputation;
- `D^4` is not used as a zoom factor;
- malformed scene input is rejected before zoom-target mutation;
- zoom/focus state is absent from canonical JSON;
- `W = unresolved`, `geometryRendered = false`, and `sheetsMaterialized = false` remain intact;
- application startup preserves validation-first ordering and never calls `expandOneLevel`;
- script order is scene specification, base renderer, one-step pullback, recursive expansion, zoom semantics, then application;
- no concrete geometry, sheet model, camera matrix, projection, Three.js, WebGL, Canvas, or SVG-geometry implementation is introduced.

The historical v0.06 verifier keeps all recursive behavioral assertions. Its exact repository-version assertion is generalized to accept metadata at or after v0.06, matching the compatibility policy already used by the v0.04 and v0.05 verifiers.

## Thread 06 stopping point

\[
\boxed{\text{Zoom is structural focus/navigation only, with recursion and geometry kept separate}}
\]

The next milestone is **Thread 07 — D^4 Sheets**. No Thread 07 implementation is included here.

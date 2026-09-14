# One-Step Pullback Specification — v0.05

## Status

This document closes **Thread 04 — One-Step Pullback**.

The milestone is deliberately fixed to

\[
\boxed{n=1}
\]

and does not introduce any recursive expansion mechanism.

## Canonical dependency

The mathematical scene contract remains unchanged from v0.03:

\[
X=W^{-1}(\lambda),
\qquad
X_n=(P_D^n)^{-1}(X),
\]

with

\[
P_D(z_1,\ldots,z_4)=(z_1^D,\ldots,z_4^D).
\]

Thread 04 consumes the normalized scene returned by `SceneSpec.validateAndNormalizeScene`. It does not validate raw scene data again.

The concrete representation of `W` remains exactly:

```text
unresolved
```

## First Gate: what can be represented

The structured declaration of `P_D` is complete enough to identify the one-step relation

\[
X_1=P_D^{-1}(X)
\]

without guessing any missing mathematics.

The following facts are therefore canonical and representable:

- pullback depth is exactly `1`;
- the relation is an inverse image under the validated pullback map;
- the map kind comes from `scene.mathematics.pullbackMap.kind`;
- the coordinate count comes from the same structured declaration;
- the exponent parameter name comes from `pullbackMap.exponentParameter`;
- the exponent value is resolved by indexing the validated parameter object with that declared parameter name;
- the map degree is the already-derived `scene.derived.sheetDegree = D^4`.

The following cannot be produced because `W` is unresolved:

- points on `X` or `X_1`;
- meshes, contours, slices, or implicit-surface samples;
- pullback branches as concrete geometric components;
- any graphical realization of the preimage.

No placeholder geometry is substituted.

## `D^4` is degree, not a sheet model

The current scene validator already derives

\[
D^4.
\]

Thread 04 may reuse this value as the degree associated with the coordinate-power map, but degree data alone does not canonically identify or enumerate concrete sheets of the unresolved pullback geometry.

Therefore v0.05 records:

```text
mapDegree = scene.derived.sheetDegree
sheetsMaterialized = false
```

It creates no sheet array, sheet objects, branch objects, or per-sheet geometry. The sheet model remains reserved for Thread 07.

## Architecture

### `scene-spec.js`

Unchanged. It remains the single scene validator and normalizer.

### `base-renderer.js`

Unchanged. It still builds the v0.04 base render model and exposes `unresolved_geometry` with `geometryRendered = false`.

### `one-step-pullback.js`

New in v0.05. It has two responsibilities only:

1. build a deterministic structural `n = 1` pullback model from a validated scene plus the base render model;
2. materialize that structural state into a supplied DOM-like target.

Its model records:

```text
kind = one_step_pullback
depth = 1
relation = inverse_image
status = unresolved_pullback_geometry
geometryRendered = false
sheetsMaterialized = false
```

The module does not import or call `SceneSpec`, does not recompute `D^4`, does not directly read `parameters.D`, and does not hard-code `coordinate_power` as a second mathematical source.

### `app.js`

The execution order is:

```text
raw JSON
  -> SceneSpec.validateAndNormalizeScene
  -> BaseRenderer.renderBaseScene
  -> OneStepPullback.renderOneStepPullback
  -> visible validated scene metadata
```

A malformed scene is rejected before either renderer target is changed.

### Rendering surface

The ordinary DOM remains sufficient because no concrete geometric realization is available. Thread 04 therefore does not add Canvas, SVG, Three.js, WebGL, GPU buffers, or camera state.

## `requestedDepth` semantics in Thread 04

`requestedDepth` remains a legal validated request parameter from v0.03, but Thread 04 does not use it to control materialization.

Reason: the milestone is explicitly a fixed one-step construction. Interpreting `requestedDepth > 1` by constructing additional layers would implement Thread 05 early.

Accordingly:

- `requestedDepth` remains present and validated upstream;
- `one-step-pullback.js` does not consume it;
- the represented/materialized structural pullback depth is always exactly `1`;
- no value of `requestedDepth` can cause depth `2` or higher to appear in v0.05.

General request-driven expansion belongs to **Thread 05 — Recursive Lazy Expansion**.

## Verification contract

`verify_one_step_pullback_v0_05.js` verifies:

- the canonical scene validates first;
- the Base Renderer runs after validation;
- the one-step renderer runs after the validated Base Renderer;
- `depth` is exactly `1`;
- the relation is `inverse_image`;
- pullback-map kind, coordinate count, exponent parameter, and exponent value come from the validated structured declaration;
- changing canonical `D` from `2` to `3` changes the resolved exponent to `3` and reuses the validator-derived degree `81`;
- `D^4` is not recomputed in the one-step module;
- `D^4` is not persisted as a new canonical input;
- `sheetsMaterialized` remains `false`;
- malformed scenes are rejected before base or pullback target mutation;
- invented `W` representations remain rejected before rendering;
- `requestedDepth = 9` still produces only depth `1`;
- the module contains no recursive/lazy node machinery, sheet-object model, Canvas/SVG geometry, Three.js, or WebGL.

The historical `verify_base_renderer_v0_04.js` keeps all renderer assertions. Its one exact `version === "v0.04"` assertion is minimally generalized to accept repository version metadata at or after v0.04, so advancement to v0.05 does not falsely fail an otherwise unchanged Base Renderer contract.

## Thread 04 stopping point

\[
\boxed{\text{One-Step Pullback is implemented and verified at exactly }n=1}
\]

The only next milestone is **Thread 05 — Recursive Lazy Expansion**.

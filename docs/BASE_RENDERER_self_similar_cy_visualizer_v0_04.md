# Base Renderer Specification — v0.04

## Status

This document closes **Thread 03 — Base Renderer**.

The renderer implemented here is intentionally limited by the v0.03 mathematical scene contract. It consumes validated normalized scene data and renders only what that data can justify.

## Canonical dependency

Thread 03 does not alter the mathematical scene contract from v0.03:

\[
X=W^{-1}(\lambda),
\qquad
X_n=(P_D^n)^{-1}(X),
\]

with

\[
P_D(z_1,\ldots,z_4)=(z_1^D,\ldots,z_4^D).
\]

The concrete representation of `W` remains exactly:

```text
unresolved
```

No renderer code may reinterpret this as a polynomial, expression tree, sampled function, or demonstration equation.

## What can be rendered while `W` is unresolved

The current contract identifies the base object semantically as a level set of symbolic `W` at `lambda`, but it does not contain enough information to generate points, curves, meshes, contours, slices, implicit surfaces, or any other geometric realization of `X`.

Therefore the only faithful base-renderer output is a renderer state that says geometric realization is unavailable.

v0.04 represents this state as:

```text
status = unresolved_geometry
geometryRendered = false
```

and exposes the validated symbolic defining-function name, its representation status, the level-parameter name, and the validated level value.

This is renderer output, not a new mathematical input.

## Architecture

### `scene-spec.js`

Remains the single source of scene validation and normalization. Thread 03 does not modify it and does not create a second validator.

### `base-renderer.js`

Contains two responsibilities only:

1. map an already normalized scene to a deterministic base-render model;
2. materialize that model into a supplied DOM-like target.

The module supports both browser globals and CommonJS so the same implementation can be smoke-tested under Node.

It does not import or call `SceneSpec`. Validation belongs upstream.

### `app.js`

Retains the Thread 01 JSON loading path:

```text
fetch("data/system.json")
```

The execution order is:

```text
raw JSON
  -> SceneSpec.validateAndNormalizeScene
  -> BaseRenderer.renderBaseScene
  -> visible scene metadata
```

If loading, validation, or renderer initialization fails, visible renderer/data state is reset and the application exposes the existing error path.

### Rendering surface

v0.04 uses the ordinary DOM rather than Canvas or SVG.

Reason: no concrete geometry exists in the canonical input, so adding a graphics surface would add architecture without adding truthful mathematical rendering. This does not prohibit a later milestone from choosing another rendering technology when justified by resolved mathematical data.

## Scope isolation

The Base Renderer does not consume:

- `pullbackMap`;
- `requestedDepth`;
- `derived.metricScale`;
- `derived.sheetDegree`.

Those values remain available to the application because they belong to the validated scene, but they do not participate in Thread 03 renderer behavior.

The renderer contains no one-step pullback, recursive node model, lazy expansion, zoom state, sheet model, arithmetic overlay, camera system, GPU state, Canvas, SVG geometry, Three.js, or WebGL.

## `W = unresolved` boundary

`unresolved_geometry` is not a placeholder for `X`. It is an explicit refusal to claim geometric data that the canonical scene does not contain.

If a future canonical schema resolves `W`, v0.04 must still not silently interpret that representation. Until a later renderer milestone explicitly supports the resolved representation, the base renderer remains non-geometric.

## Verification contract

`verify_base_renderer_v0_04.js` verifies:

- the current `data/system.json` still passes `SceneSpec.validateAndNormalizeScene`;
- the renderer returns `unresolved_geometry`;
- `geometryRendered` is `false`;
- the DOM-like target records the same state;
- changing `D` and `requestedDepth` does not change Thread 03 base-renderer output;
- malformed scenes are rejected before renderer state changes;
- an invented `W` representation is rejected before renderer state changes;
- canonical JSON does not gain `derived` or `renderer` fields;
- `app.js` preserves `fetch("data/system.json")`;
- renderer invocation occurs after validation in `app.js`;
- script order is `scene-spec.js`, then `base-renderer.js`, then `app.js`;
- `base-renderer.js` contains no scene validator, pullback, recursion-related scene fields, Canvas/SVG geometry, Three.js, or WebGL dependencies.

## Thread 03 stopping point

\[
\boxed{\text{Base Renderer is implemented and verified without inventing }W}
\]

The only next milestone is **Thread 04 — One-Step Pullback**.

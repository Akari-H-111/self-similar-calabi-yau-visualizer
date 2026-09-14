# Recursive Lazy Expansion Specification — v0.06

## Status

This document closes **Thread 05 — Recursive Lazy Expansion**.

The milestone defines a request-bounded structural expansion contract for

\[
X_n=(P_D^n)^{-1}(X)
\]

without resolving or fabricating concrete Calabi–Yau geometry.

## Canonical dependencies

The v0.03 mathematical scene contract remains unchanged:

\[
X=W^{-1}(\lambda),
\qquad
X_n=(P_D^n)^{-1}(X),
\]

with

\[
P_D(z_1,\ldots,z_4)=(z_1^D,\ldots,z_4^D).
\]

Canonical mathematical inputs remain only `D`, `lambda`, and `kappa`. `requestedDepth` remains a request parameter. The map declaration remains the validated structured `coordinate_power` object whose exponent parameter is `D`. `D^2` and `D^4` remain validator-derived values, not persisted canonical inputs.

The concrete representation of `W` remains exactly `unresolved`.

The v0.04 Base Renderer remains unchanged with `status = unresolved_geometry` and `geometryRendered = false`.

The v0.05 One-Step Pullback implementation remains unchanged with depth exactly `1`, relation `inverse_image`, `status = unresolved_pullback_geometry`, `geometryRendered = false`, and `sheetsMaterialized = false`.

## First Gate: canonical representability of general `X_n`

The existing structured map declaration and the canonical identity

\[
X_n=(P_D^n)^{-1}(X)
\]

are sufficient to represent the tower structurally.

Equivalently, for every materialized positive depth,

\[
X_n=P_D^{-1}(X_{n-1}).
\]

Therefore a level can canonically record:

- its integer depth `n`;
- the previous structural depth `n-1`;
- relation `inverse_image`;
- map kind, coordinate count, exponent parameter, and resolved exponent value inherited from the verified one-step primitive;
- one-step map degree `D^4` inherited from the same primitive;
- formal iterated-degree information for the composition through depth `n`.

Because `W` remains unresolved, the contract cannot materialize:

- points on `X_n`;
- pullback branches as geometric components;
- meshes, contours, slices, samples, or implicit surfaces;
- concrete sheet objects or an enumeration of sheets.

The runtime model is therefore structural only.

## Why the minimal architecture is a linear sequence, not a tree

The canonical family is indexed by a single nonnegative integer `n`, and the supplied relation gives one predecessor depth for each positive depth. No canonical data introduces branching among structural states.

Accordingly, v0.06 uses an immutable ordered `levels` sequence. It does **not** introduce a recursive tree schema, child collections, cache, iterator object, scheduler, branch graph, or sheet collection.

The sequence is runtime renderer state. It is not added to `data/system.json` and does not change schema version 1.

## Formal `requestedDepth` semantics

The recursive model distinguishes:

```text
requestedDepth
materializedDepth
```

where `requestedDepth` is copied from the already-validated request and `materializedDepth` is the highest pullback depth currently present in the recursive model.

### `requestedDepth = 0`

No pullback level belongs to the request-driven recursive model:

```text
materializedDepth = 0
levels.length = 0
expansionComplete = true
```

The fixed v0.05 One-Step Pullback module still exists and can still be initialized as the verified upstream primitive. Its historical fixed-depth renderer is not redefined by this request semantics.

### `requestedDepth = 1`

The recursive model reuses the v0.05 one-step output as its mathematical template and materializes exactly one structural level:

```text
materializedDepth = 1
levels.length = 1
expansionComplete = true
```

No second implementation of one-step mathematics is introduced.

### `requestedDepth > 1`

Initialization materializes only depth `1`:

```text
materializedDepth = 1
levels.length = 1
expansionComplete = false
```

The pure operation `expandOneLevel(model)` returns a new immutable model with at most one additional structural level. It never loops to the requested target. When `materializedDepth == requestedDepth`, further expansion calls return the already-complete model unchanged.

`app.js` does not call `expandOneLevel` during initialization. Therefore a large `requestedDepth` cannot cause unbounded eager materialization at startup.

This is the complete lazy-expansion contract for Thread 05. No interaction policy or zoom-driven expansion trigger is defined here.

## Reuse of the v0.05 one-step primitive

`recursive-lazy-expansion.js` consumes:

1. the normalized scene produced upstream by `SceneSpec.validateAndNormalizeScene`;
2. the v0.04 `base_scene` model;
3. the verified v0.05 `one_step_pullback` model.

It does not import or call `SceneSpec` and does not create a second validator.

The first recursive level is constructed only from fields already established by the one-step model. Higher levels inherit the same structural map metadata from that level. In particular, the recursive module contains no second hard-coded `coordinate_power` source, no direct `parameters.D` lookup, no `D ** 4` recomputation, and no direct reach-around to `scene.derived.sheetDegree`.

## `D^4`, iterated degree, and sheets are distinct

The v0.05 primitive establishes the one-step map degree as

\[
D^4.
\]

For the `n`-fold coordinate-power composition, degree multiplicativity gives the formal iterated degree

\[
(D^4)^n=D^{4n}.
\]

v0.06 records this without eagerly evaluating a potentially very large integer:

```text
iteratedDegreeExpression.baseDegree = D^4
iteratedDegreeExpression.exponent = n
```

This pair is derived runtime information. It is not a new canonical input.

Most importantly, degree information is not promoted to geometry. Neither `D^4` nor `(D^4)^n` is interpreted as an array of concrete sheets. Every structural level therefore retains:

```text
geometryRendered = false
sheetsMaterialized = false
```

## Runtime model

The top-level recursive model records:

```text
kind = recursive_lazy_expansion
requestedDepth
materializedDepth
expansionComplete
baseGeometryStatus
status
geometryRendered
sheetsMaterialized
levels
```

Each materialized level records:

```text
kind = structural_pullback_level
depth
relation = inverse_image
sourceDepth = depth - 1
pullbackMapKind
coordinateCount
exponentParameter
exponentValue
mapDegreePerStep
iteratedDegreeExpression
status = unresolved_pullback_geometry
geometryRendered = false
sheetsMaterialized = false
```

The models and the `levels` sequence are frozen. `expandOneLevel` returns a new model and does not mutate the previous frontier.

## Application pipeline

The browser pipeline is:

```text
raw JSON
  -> SceneSpec.validateAndNormalizeScene
  -> BaseRenderer.renderBaseScene
  -> OneStepPullback.renderOneStepPullback
  -> RecursiveLazyExpansion.createRecursiveLazyExpansionModel
  -> RecursiveLazyExpansion.renderRecursiveLazyExpansion
  -> visible validated scene metadata
```

Malformed input is rejected before any renderer or expansion target is changed.

## Rendering surface

Ordinary DOM remains sufficient. `W` is unresolved and the recursive state is structural only, so Canvas, SVG geometry, Three.js, WebGL, GPU buffers, and camera systems remain unjustified.

## Verification contract

`verify_recursive_lazy_expansion_v0_06.js` verifies:

- canonical `requestedDepth = 0` produces no recursive pullback level;
- `requestedDepth = 1` produces exactly one level compatible with the verified one-step model;
- `requestedDepth = 3` initializes only depth `1`;
- each `expandOneLevel` call adds exactly one level;
- expansion stops exactly at the requested target;
- earlier immutable frontier models are not mutated;
- a `D = 3` variant inherits exponent value `3` and one-step degree `81` without a second `D` source or degree recomputation;
- iterated degree is represented structurally as `(D^4)^n`;
- no sheet objects are created;
- malformed scenes and invented `W` representations are rejected before recursive rendering;
- `app.js` retains the Thread 01 JSON path and validation-before-render order;
- application startup does not call `expandOneLevel`;
- script order places the recursive module after the one-step module and before `app.js`;
- the recursive module contains no second scene validator, hard-coded map declaration, direct `parameters.D` lookup, `D^4` recomputation, concrete geometry, zoom, overlay, camera, Three.js, WebGL, Canvas, or SVG-geometry implementation.

The historical v0.03 and v0.04 verifiers remain behaviorally unchanged. The v0.05 one-step verifier keeps all of its behavioral assertions; only its exact version-metadata assertion is generalized to accept repository versions at or after v0.05.

## Thread 05 stopping point

\[
\boxed{\text{Recursive Lazy Expansion is request-bounded, structural, and verified}}
\]

The only next milestone is **Thread 06 — Zoom Semantics**.

# Progress — Self-Similar Calabi–Yau Visualizer v0.06

## Milestone

**Thread 05 — Recursive Lazy Expansion**

Status: **completed**, with full browser-engine runtime smoke testing explicitly left `not_tested`.

## Starting-state audit

GitHub resolved `Akari-H-111/self-similar-calabi-yau-visualizer` as a private repository on default branch `main` with write capability.

The Thread 05 starting head was exactly:

`a72fa447d5a357de35e81bd37d46b56f60316156` — `pullback: add verified v0.05 one-step structure`

Its sole parent was exactly:

`fabf16129a4a36ba6692a9cda5b7c64f33cdac47` — the v0.04 canonical commit.

All requested v0.03, v0.04, and v0.05 canonical source, specification, state, and progress artifacts were read before implementation. No Bootstrap, Scene Specification, Base Renderer, or One-Step Pullback implementation was redone.

## Mathematical/engineering Gate

With `W` unresolved, general `X_n` can be represented canonically only at the structural level.

The existing identity

\[
X_n=(P_D^n)^{-1}(X)
\]

and structured `P_D` declaration imply the linear recurrence

\[
X_n=P_D^{-1}(X_{n-1})
\]

for positive depth. This is enough to represent depth, predecessor depth, inverse-image relation, validated map metadata, one-step map degree, and formal iterated-degree information.

It is not enough to produce points, branches, sheets, meshes, slices, contours, or implicit surfaces. No placeholder geometry was introduced.

Because the canonical family is linearly indexed by `n`, a tree would add unsupported branching semantics. The minimum architecture is therefore an immutable linear sequence of materialized structural levels.

## `requestedDepth` contract

Thread 05 makes `requestedDepth` operative only in the recursive layer:

- depth `0`: recursive materialized depth `0`, no recursive pullback levels, request complete;
- depth `1`: materialized depth `1`, reusing the verified one-step primitive, request complete;
- depth `> 1`: initialization materializes only depth `1`, leaving the request incomplete.

`expandOneLevel(model)` returns a new immutable frontier with at most one extra level. It stops exactly at `requestedDepth` and returns the complete model unchanged if called again.

`app.js` never invokes `expandOneLevel` during startup. Therefore request size does not cause eager expansion.

The historical v0.05 One-Step Pullback remains a fixed-depth upstream primitive and diagnostic renderer. It continues not to consume `requestedDepth`.

## Degree semantics

Each structural transition inherits the v0.05 map degree `D^4`.

The exact iterated degree through depth `n` is recorded structurally as:

```text
baseDegree = D^4
exponent = n
```

representing `(D^4)^n = D^(4n)` without evaluating a potentially very large integer.

This is degree information only. It does not create or enumerate sheet objects, and `sheetsMaterialized` remains `false` at every structural level.

## Architecture

Created `recursive-lazy-expansion.js` to own the lifecycle of the recursive structural frontier: initialize it from validated upstream models, advance it at most one level through `expandOneLevel`, and expose the current frontier through the existing minimal DOM surface.

The module consumes the normalized scene, v0.04 base model, and v0.05 one-step model. It does not import `SceneSpec`, create a second validator, hard-code `coordinate_power`, directly read `parameters.D`, recompute `D^4`, or read around the one-step primitive to `scene.derived.sheetDegree`.

No tree, cache, iterator object, scheduler, branch graph, sheet collection, Canvas, SVG geometry, Three.js, WebGL, GPU state, zoom state, camera state, or arithmetic overlay was introduced.

## Files

Created:

- `recursive-lazy-expansion.js`
- `verify_recursive_lazy_expansion_v0_06.js`
- `docs/RECURSIVE_LAZY_EXPANSION_self_similar_cy_visualizer_v0_06.md`
- `docs/state_self_similar_cy_visualizer_v0_06.json`
- `docs/progress_self_similar_cy_visualizer_v0_06.md`

Modified:

- `README.md`
- `index.html`
- `app.js`
- `style.css`
- `data/system.json` only to advance project version metadata from `v0.05` to `v0.06`
- `verify_one_step_pullback_v0_05.js` only to generalize its exact version-metadata assertion from `v0.05` to version metadata at or after v0.05; all One-Step Pullback behavioral assertions remain unchanged

Unchanged:

- `scene-spec.js`
- `base-renderer.js`
- `one-step-pullback.js`
- `verify_scene_spec_v0_03.js`
- `verify_base_renderer_v0_04.js`
- all v0.03/v0.04/v0.05 historical specification, state, and progress documents

## Validation

### passed

- `verify_scene_spec_v0_03.js` passes unchanged against v0.06 canonical JSON.
- All 13 original malformed scene examples remain rejected.
- `verify_base_renderer_v0_04.js` passes unchanged.
- v0.04 still reports `unresolved_geometry` and `geometryRendered = false`.
- `verify_one_step_pullback_v0_05.js` passes with only the explicit version-metadata compatibility adjustment described above.
- The v0.05 one-step module itself is byte-for-byte unchanged and still reports depth `1`, relation `inverse_image`, unresolved pullback geometry, `geometryRendered = false`, and `sheetsMaterialized = false`.
- `verify_recursive_lazy_expansion_v0_06.js` passes.
- `requestedDepth = 0`, `1`, and `3` deterministic cases pass.
- Depth `3` initialization contains exactly one pullback level rather than eagerly creating depths `2` and `3`.
- Each call to `expandOneLevel` adds exactly one level.
- The prior frontier remains immutable after expansion.
- Expansion stops exactly at the requested target.
- A `D = 3` variant inherits exponent `3` and one-step degree `81`.
- Iterated degree is represented as a structured `(D^4)^n` expression rather than a materialized sheet count.
- Malformed input is rejected before base, one-step, or recursive targets change.
- An invented `polynomial_ast` representation for `W` remains rejected before rendering.
- `app.js` preserves `fetch("data/system.json")` and the validation-first pipeline.
- Pipeline order is validation, Base Renderer, One-Step Pullback, then Recursive Lazy Expansion.
- Application initialization contains no call to `expandOneLevel`.
- Script order is `scene-spec.js`, `base-renderer.js`, `one-step-pullback.js`, `recursive-lazy-expansion.js`, `app.js`.
- Canonical JSON contains no persisted derived or recursive runtime state.
- The recursive module contains no second scene validator, hard-coded map declaration, direct `D` source, `D^4` recomputation, concrete sheet objects, concrete geometry, zoom/camera/overlay implementation, Three.js, WebGL, Canvas, or SVG geometry.
- JavaScript syntax checks pass for all runtime modules and `app.js`.
- Canonical `data/system.json` and v0.06 state JSON parse successfully.

### failed

- None.

### not_tested

- Full browser-engine runtime test observing live DOM state after fetch/validation/base-render/one-step-render/recursive-render and after an injected malformed network response. Deterministic Node verification covers the ordering, request-depth semantics, lazy frontier behavior, and target-mutation boundaries without browser automation.

## Stopping point

\[
\boxed{\text{Recursive Lazy Expansion is implemented and verified without inventing geometry}}
\]

## Next milestone

**Thread 06 — Zoom Semantics**

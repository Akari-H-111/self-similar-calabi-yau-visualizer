# Progress — Self-Similar Calabi–Yau Visualizer v0.05

## Milestone

**Thread 04 — One-Step Pullback**

Status: **completed**, with full browser-engine runtime smoke testing explicitly left `not_tested`.

## Starting-state audit

GitHub resolved `Akari-H-111/self-similar-calabi-yau-visualizer` as a private repository on default branch `main` with write capability.

The Thread 04 starting head was exactly:

`fabf16129a4a36ba6692a9cda5b7c64f33cdac47` — `renderer: add verified v0.04 base scene renderer`

Its sole parent was exactly:

`4a4229d287afbc95cf9a5cd5a99d6901cc1178ce` — the v0.03 canonical commit.

All required v0.03 and v0.04 canonical artifacts were read before implementation. No bootstrap, scene-specification, or Base Renderer work was reimplemented.

## Mathematical/engineering Gate

The existing contract determines the one-step relation

\[
X_1=P_D^{-1}(X)
\]

structurally because `P_D` already has a validated structured declaration.

However, the concrete representation of `W` remains `unresolved`. Therefore neither `X` nor `X_1` can truthfully be materialized as points, meshes, implicit surfaces, or any other concrete geometry.

The correct Thread 04 output is thus a structural one-step state rather than fabricated geometry.

The derived value `D^4` is known, but it is only degree data at this stage. It does not justify constructing `D^4` sheet objects.

## Architecture

Created `one-step-pullback.js` on top of the v0.04 pipeline.

It consumes:

- the normalized scene produced by `SceneSpec.validateAndNormalizeScene`;
- the base render model returned by `BaseRenderer.renderBaseScene`.

It produces a deterministic fixed-depth model:

```text
kind = one_step_pullback
depth = 1
relation = inverse_image
status = unresolved_pullback_geometry
geometryRendered = false
sheetsMaterialized = false
```

The module reuses the scene's structured pullback declaration. In particular, it resolves the exponent value through `pullbackMap.exponentParameter` instead of directly duplicating `parameters.D` as another source of truth.

It also reuses `scene.derived.sheetDegree`; it does not recompute `D^4`.

## `requestedDepth`

Thread 04 intentionally leaves `requestedDepth` non-operative in the one-step module.

This is the minimal semantics compatible with the milestone boundary: the scene still validates `requestedDepth`, but the one-step module always represents exactly depth `1` and never turns a request larger than `1` into additional layers.

A deterministic test sets `requestedDepth = 9` and confirms that the resulting pullback depth remains exactly `1`.

## Rendering surface

The DOM architecture is retained.

Adding Canvas, SVG, Three.js, or WebGL would not create truthful geometry because `W` is still unresolved, so no new drawing surface is justified in this milestone.

## Files

Created:

- `one-step-pullback.js`
- `verify_one_step_pullback_v0_05.js`
- `docs/ONE_STEP_PULLBACK_self_similar_cy_visualizer_v0_05.md`
- `docs/state_self_similar_cy_visualizer_v0_05.json`
- `docs/progress_self_similar_cy_visualizer_v0_05.md`

Modified:

- `README.md`
- `index.html`
- `app.js`
- `style.css`
- `data/system.json` only to advance project version metadata from `v0.04` to `v0.05`
- `verify_base_renderer_v0_04.js` only to generalize its exact version-metadata assertion from `v0.04` to version metadata at or after v0.04; all Base Renderer behavioral assertions remain unchanged

Unchanged:

- `scene-spec.js`
- `base-renderer.js`
- `verify_scene_spec_v0_03.js`
- all v0.03/v0.04 historical specification and state documents

## Validation

### passed

- `verify_scene_spec_v0_03.js` passes unchanged against the v0.05 canonical JSON.
- All 13 original malformed scene examples remain rejected.
- `verify_base_renderer_v0_04.js` passes with only the explicit version-metadata compatibility adjustment described above.
- The v0.04 Base Renderer still reports `unresolved_geometry` and `geometryRendered = false`.
- `verify_one_step_pullback_v0_05.js` passes.
- The one-step model has depth exactly `1`.
- The one-step model reuses pullback map kind, coordinate count, exponent parameter, and resolved exponent value from validated scene data.
- A `D = 3` variant resolves exponent `3` and reuses derived degree `81`.
- `one-step-pullbackk.js` does not contain a second hard-coded `coordinate_power` source, direct `parameters.D` lookup, or `D ** 4` recomputation.
- Canonical JSON still contains no persisted `derived` values or pullback-renderer state.
- `D^4` is exposed only as degree data and `sheetsMaterialized` remains `false`.
- `requestedDepth = 9` still produces depth `1` only.
- Malformed scenes are rejected before either base or pullback target changes.
- An invented `polynomial_ast` representation for `W` remains rejected before rendering.
- `app.js` preserves the real `fetch("data/system.json")` path.
- Pipeline order is validation, Base Renderer, then One-Step Pullback.
- Script order is `scene-spec.js`, `base-renderer.js`, `one-step-pullback.js`, `app.js`.
- JavaScript syntax checks pass for `scene-spec.js`, `base-renderer.js`, `one-step-pullback.js`, and `app.js`.
- Canonical `data/system.json` parses as valid JSON.
- No recursive node tree, lazy expansion engine, depth `>= 2` materialization, sheet-object collection, zoom state, arithmetic overlay, Three.js, WebGL, GPU buffer, or camera navigation code was added.

### failed

- None.

### not_tested

- Full browser-engine runtime test observing live DOM state after fetch/validation/base-render/one-step-render and after an injected malformed network response. Deterministic Node verification covers the same ordering and target-mutation boundaries without browser automation.

## Stopping point

\[
\boxed{\text{One-Step Pullback is implemented and verified at exactly }n=1}
\]

## Next milestone

**Thread 05 — Recursive Lazy Expansion**

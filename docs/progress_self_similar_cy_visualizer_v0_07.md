# Progress — Self-Similar Calabi–Yau Visualizer v0.07

## Milestone

**Thread 06 — Zoom Semantics**

Status: **completed**, with full browser-engine runtime smoke testing explicitly left `not_tested`.

## Starting-state difference audit

The prompt expected the visualizer v0.06 canonical commit:

```text
5b60214bb0f108ee111e3f1e78bbf2c9f10d5cce
```

with sole parent:

```text
a72fa447d5a357de35e81bd37d46b56f60316156
```

That historical v0.06 commit and parent relation remain intact.

However, `main` had advanced before Thread 06 began. The actual starting HEAD was:

```text
8172da49ec363a958efdbad8e9b988a85cb417de
```

whose parent was the sealed F06 formal-verification commit `ff5bcd2f...`.

A compare from `5b60214...` to the actual starting HEAD reported `ahead_by = 19`, `behind_by = 0`. Every changed path in that interval was additive Formal Verification, recovery, CI, `.gitignore`, or formal-handoff material. No v0.06 runtime source, runtime verifier, runtime specification, state, progress, README, HTML, CSS, or canonical scene file was modified or deleted.

Therefore the repository ancestry had legitimately advanced, but the visualizer v0.06 runtime baseline itself was unchanged. Thread 06 proceeded from current `main` while preserving all F01–F06 formal/recovery descendants.

## Mathematical / engineering Gate

With `W = unresolved`, the current system has no concrete embedding, metric coordinates, points, mesh, camera geometry, projection, or viewport transform. Therefore zoom cannot truthfully mean geometric magnification.

The minimum canonical semantics is:

```text
zoom = structural focus / level navigation
```

This explicitly separates:

- structural depth `X_n`;
- `requestedDepth`;
- `materializedDepth`;
- view focus state;
- recursive materialization;
- geometric/camera/screen zoom.

## Focus semantics

The v0.07 view model consumes the current verified recursive state.

If a focus target is already materialized, it returns:

```text
focusStatus = focused
focusedDepth = requestedFocusDepth
```

If the target is deeper than the current recursive frontier, it returns:

```text
focusStatus = not_materialized
focusedDepth = null
```

No clamping, implicit expansion, request rewrite, or second depth source is introduced.

After an explicit external `expandOneLevel`, the zoom layer can consume the new recursive model and focus the newly materialized depth. This verifies that recursion remains the only materialization engine.

## `D^2` audit

`scene.derived.metricScale` remains the only runtime source for `D^2`.

At an available focused depth `n`, v0.07 records only the structured informational expression:

```text
baseScale = scene.derived.metricScale
exponent = n
```

representing `(D^2)^n = D^(2n)`.

It does not apply this as a camera, CSS, viewport, or geometric scale. The model explicitly keeps:

```text
geometricZoomApplied = false
cameraTransformApplied = false
```

The zoom module does not read `parameters.D`, recompute `D^2`, reach for `scene.derived.sheetDegree`, or use `D^4` as a zoom factor.

Under the sealed Formal Verification handoff, this remains runtime informational metadata rather than a new Lean-proved metric theorem.

## Architecture

Created `zoom-semantics.js` as a small pure view-model layer plus DOM renderer.

The module consumes:

```text
validated normalized scene
+
current verified recursive model
```

It does not validate raw scenes again and does not call `expandOneLevel`.

`app.js` initializes an informational focus at depth `0` after the recursive model is created and rendered. No interaction controls, router, event bus, scheduler, cache, camera system, scene graph, or state-management framework were added.

The existing `runtime-contracts` CI job is extended only to execute the v0.07 verifier and syntax-check `zoom-semantics.js`. The sealed Lean job is unchanged.

## Files

Created:

- `zoom-semantics.js`
- `verify_zoom_semantics_v0_07.js`
- `docs/ZOOM_SEMANTICS_self_similar_cy_visualizer_v0_07.md`
- `docs/state_self_similar_cy_visualizer_v0_07.json`
- `docs/progress_self_similar_cy_visualizer_v0_07.md`

Modified:

- `README.md`
- `index.html`
- `app.js`
- `style.css`
- `data/system.json` only to advance repository/runtime version metadata from `v0.06` to `v0.07`
- `verify_recursive_lazy_expansion_v0_06.js` only to generalize its exact version-metadata assertion to accept repository versions at or after v0.06; all recursive behavioral assertions remain intact
- `.github/workflows/formal-verification.yml` only to include the new runtime verifier and zoom-module syntax check; the `formal-lean` job is unchanged

Unchanged:

- `scene-spec.js`
- `base-renderer.js`
- `one-step-pullback.js`
- `recursive-lazy-expansion.js`
- `verify_scene_spec_v0_03.js`
- `verify_base_renderer_v0_04.js`
- `verify_one_step_pullback_v0_05.js`
- all sealed Formal Verification Lean modules and F05/F06 formal artifacts

## Validation

### passed

- `verify_scene_spec_v0_03.js`
- `verify_base_renderer_v0_04.js`
- `verify_one_step_pullback_v0_05.js`
- `verify_recursive_lazy_expansion_v0_06.js`
- `verify_zoom_semantics_v0_07.js`
- all 13 original malformed scene examples remain rejected
- Thread 01 `fetch("data/system.json")` path remains present
- validation-before-render ordering remains intact
- Base Renderer contract remains `unresolved_geometry`, `geometryRendered = false`
- One-Step Pullback remains depth `1`, relation `inverse_image`, `geometryRendered = false`, `sheetsMaterialized = false`
- Recursive Lazy Expansion remains the only materialization engine
- application initialization still contains no `expandOneLevel` call
- requested depth `0`, `1`, and `>1` focus cases are deterministic
- focus at or below `materializedDepth` is available
- focus above `materializedDepth` returns `not_materialized` and does not expand recursion
- after explicit recursive expansion, zoom consumes the updated frontier
- zoom does not modify `requestedDepth`
- zoom has no second `D` source
- zoom does not recompute `D^2`
- zoom does not use `D^4` as a zoom factor
- `W = unresolved` remains preserved
- canonical JSON contains no persisted zoom/focus state
- no concrete geometry or concrete sheet objects are created
- no camera matrix, projection, viewport transform, Three.js, WebGL, GPU buffer, Canvas, SVG geometry, arithmetic overlay, or cyclotomic overlay is introduced
- JavaScript syntax checks pass for `scene-spec.js`, `base-renderer.js`, `one-step-pullback.js`, `recursive-lazy-expansion.js`, `zoom-semantics.js`, and `app.js`
- v0.07 state JSON parses successfully

### failed

- None.

### not_tested

- Full browser-engine runtime smoke test with live network fetch and DOM observation. Deterministic Node tests cover the focus state transitions, recursion boundary, source-of-truth guards, and target mutation boundaries without browser automation.

## Stopping point

\[
\boxed{\text{Zoom Semantics is implemented as structural focus/navigation without inventing geometry}}
\]

## Next milestone

**Thread 07 — D^4 Sheets**

No sheet objects or Thread 07 implementation are included in v0.07.

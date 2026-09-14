# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.06 — Recursive Lazy Expansion

This repository is a minimal static HTML/CSS/vanilla-JavaScript application for the Self-Similar Calabi–Yau Visualizer. v0.06 adds a verified request-bounded **recursive lazy structural expansion** on top of the v0.05 One-Step Pullback while preserving the v0.03 mathematical scene contract and the v0.04/v0.05 renderer contracts.

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

The scene is loaded from `data/system.json`, validated by `scene-spec.js`, passed through `base-renderer.js` and `one-step-pullback.js`, and then consumed by `recursive-lazy-expansion.js`.

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

The one-step module still does not consume `requestedDepth`.

## v0.06 Recursive Lazy Expansion

The canonical family is linearly indexed by depth, so v0.06 introduces no tree, cache, iterator, scheduler, branch model, or sheet model. The minimal recursive runtime state is an immutable ordered sequence of **structural pullback levels** plus two depth counters:

```text
requestedDepth     = requested target depth
materializedDepth  = highest level currently present in the recursive model
```

Each materialized level records the structural relation

\[
X_n=P_D^{-1}(X_{n-1})
\]

and inherits all map metadata from the verified v0.05 one-step primitive. The recursive module does not hard-code a second `coordinate_power` declaration, directly read `parameters.D`, or recompute `D^4`.

### `requestedDepth` semantics

- `requestedDepth = 0`: the recursive model materializes no pullback level and remains at structural depth `0`.
- `requestedDepth = 1`: the recursive model materializes exactly depth `1` using the already-verified one-step primitive and is complete.
- `requestedDepth > 1`: initialization materializes only depth `1`; the model remains incomplete until explicit calls to `expandOneLevel` advance the frontier. Each call can add **at most one** structural level and expansion stops deterministically at `requestedDepth`.

The fixed v0.05 One-Step Pullback remains an upstream verified primitive and diagnostic renderer. Its historical fixed-depth behavior is intentionally independent of the request-driven recursive materialization count.

`app.js` initializes the recursive model but never calls `expandOneLevel`, so application startup cannot eagerly expand an arbitrarily large request.

## Degree information is not sheet geometry

For each transition, the inherited map degree is the already-derived

\[
D^4.
\]

At structural depth `n`, v0.06 records the exact iterated-degree expression as the pair

```text
baseDegree = D^4
exponent = n
```

representing

\[
(D^4)^n = D^{4n}.
\]

It deliberately does not evaluate this as a materialized sheet count, avoiding both false geometric claims and unnecessary large-integer growth. No sheet array, sheet object, branch object, pullback point, mesh, contour, slice, or implicit surface is created.

Because `W` is unresolved, every pullback level remains structural only and preserves `geometryRendered = false` and `sheetsMaterialized = false`.

## Rendering surface

The rendering surface remains ordinary DOM. No Canvas, SVG geometry, Three.js, WebGL, GPU buffer, camera, zoom, or arithmetic-overlay architecture is justified by the current canonical information.

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
node --check scene-spec.js
node --check base-renderer.js
node --check one-step-pullback.js
node --check recursive-lazy-expansion.js
node --check app.js
```

The v0.06 verifier covers deterministic `requestedDepth = 0`, `1`, and `> 1` behavior, one-level-at-a-time expansion, stopping at the requested frontier, reuse of the one-step mathematical primitive, formal iterated-degree information without sheet objects, validation-before-render ordering, unresolved-`W` preservation, and scope guards against later milestones.

The v0.05 verifier keeps all one-step behavioral assertions. Its one exact version-metadata assertion is minimally generalized to accept repository version metadata at or after v0.05, matching the compatibility approach already used by the historical v0.04 verifier.

## Scope of v0.06

This version implements **Thread 05 — Recursive Lazy Expansion** only. It does not implement zoom semantics, camera navigation, concrete `D^4` sheet visualization, arithmetic/cyclotomic overlays, Three.js, WebGL, GPU buffers, performance optimization, fidelity audit, later UX, or publication work.

The next milestone is **Thread 06 — Zoom Semantics**.

# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.05 — One-Step Pullback

This repository is a minimal static HTML/CSS/vanilla-JavaScript application for the Self-Similar Calabi–Yau Visualizer. v0.05 adds a verified **structural one-step pullback** on top of the v0.04 Base Renderer while preserving the v0.03 mathematical scene contract.

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

The scene is loaded from `data/system.json`, validated by `scene-spec.js`, passed to `base-renderer.js`, and then used by `one-step-pullback.js` for the fixed `n = 1` milestone.

## v0.03 scene contract remains canonical

Canonical mathematical inputs remain:

- `D`, an integer with `D >= 2`;
- finite numeric `lambda`;
- finite numeric `kappa`;
- a structured declaration that `P_D` is the four-coordinate power map whose exponent is supplied by parameter `D`;
- the base hypersurface as a level set of symbolic `W` at parameter `lambda`, with the concrete representation of `W` explicitly left `unresolved`.

`requestedDepth` remains a validated request parameter, not an intrinsic mathematical input. `D^2` and `D^4` remain derived quantities computed by `scene-spec.js` after validation.

## v0.04 Base Renderer remains intact

`base-renderer.js` still consumes only the normalized scene and exposes:

```text
status = unresolved_geometry
geometryRendered = false
```

while `W` remains unresolved. It still does not consume `pullbackMap`, `requestedDepth`, or derived quantities.

## v0.05 One-Step Pullback

`one-step-pullback.js` consumes the already validated normalized scene together with the v0.04 base render model. It creates exactly one structural pullback model:

\[
X_1=P_D^{-1}(X).
\]

The module reuses the validated structured `pullbackMap` declaration and resolves its exponent value through `exponentParameter`; it does not create a second hard-coded mathematical source for `P_D` or `D`.

Because `W` is still unresolved, the one-step layer cannot truthfully generate pullback points, meshes, implicit surfaces, or other concrete geometry. Its faithful state is therefore:

```text
status = unresolved_pullback_geometry
geometryRendered = false
```

The known derived quantity `D^4` is exposed only as the map degree. It is **not** interpreted as a collection of `D^4` materialized sheets. v0.05 explicitly reports `sheetsMaterialized = false`.

### `requestedDepth` in v0.05

Thread 04 is a fixed-depth milestone, not the recursive materialization engine. `requestedDepth` remains validated scene metadata but is intentionally **not consumed** by `one-step-pullback.js`. The module always represents exactly depth `1`, including when a request later asks for a larger depth. General request-driven expansion belongs to Thread 05.

The rendering surface remains ordinary DOM because the canonical data still contains no concrete geometry that would justify Canvas, SVG, Three.js, or WebGL.

See `docs/ONE_STEP_PULLBACK_self_similar_cy_visualizer_v0_05.md` for the complete contract.

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
node --check scene-spec.js
node --check base-renderer.js
node --check one-step-pullback.js
node --check app.js
```

The v0.03 verifier still validates the canonical scene and rejects malformed input. The v0.04 verifier still verifies the Base Renderer; its version-metadata assertion was minimally relaxed so the same historical contract can be verified after the repository advances beyond `v0.04`. The v0.05 verifier proves fixed `n = 1` behavior, reuse of the structured pullback declaration, derived-degree reuse without sheet materialization, validation-before-render ordering, and the absence of recursive expansion.

## Scope of v0.05

This version implements the **One-Step Pullback** milestone only. It does not implement recursive rendering, lazy expansion, arbitrary-depth materialization, zoom semantics, `D^4` sheet visualization, arithmetic/cyclotomic overlays, Three.js, WebGL, GPU buffers, camera navigation, performance work, fidelity audit, later UX, or publication work.

The next milestone is **Thread 05 — Recursive Lazy Expansion**.

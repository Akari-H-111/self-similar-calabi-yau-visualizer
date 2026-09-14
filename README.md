# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.03 — Mathematical Scene Specification

This repository is a minimal static HTML/CSS/vanilla-JavaScript application for the Self-Similar Calabi–Yau Visualizer. v0.03 closes the mathematical scene-data contract; it still does **not** implement a renderer.

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

The scene is loaded from `data/system.json`, validated by `scene-spec.js`, and then displayed by `app.js`.

## v0.03 scene contract

Canonical mathematical inputs are:

- `D`, an integer with `D >= 2`;
- finite numeric `lambda`;
- finite numeric `kappa`;
- a structured declaration that `P_D` is the four-coordinate power map using exponent parameter `D`;
- the base hypersurface as a level set of symbolic `W` at parameter `lambda`, with the concrete representation of `W` explicitly left `unresolved`.

`requestedDepth` is a request parameter, not an intrinsic mathematical input. It must be a nonnegative integer.

The quantities `D^2` and `D^4` are **derived**, not duplicated in canonical JSON. `scene-spec.js` computes them after validation and rejects values of `D` for which those quantities are not safe JavaScript integers.

The top-level integer `schemaVersion` controls compatibility. v0.03 supports schema version `1` only and rejects unknown fields so schema changes are explicit rather than silently accepted.

See `docs/SCENE_SPEC_self_similar_cy_visualizer_v0_03.md` for the complete contract.

## Run locally

Serve the repository over HTTP rather than opening `index.html` with `file://`:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in a browser.

## Verify the scene specification

```bash
node verify_scene_spec_v0_03.js
node --check scene-spec.js
node --check app.js
```

The verifier loads the canonical JSON through the same validation implementation used by the browser app, checks the derived values, and proves that a set of malformed scene examples is rejected.

## Scope of v0.03

This version implements scene specification and validation only. It does not implement Calabi–Yau hypersurface rendering, pullback visualization, recursive expansion, zoom semantics, `D^4` sheet rendering, arithmetic/cyclotomic overlays, Three.js, WebGL, GPU buffers, camera state, or later UX work.

The next milestone is **Thread 03 — Base Renderer**.

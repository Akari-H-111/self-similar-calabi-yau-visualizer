# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.04 — Base Renderer

This repository is a minimal static HTML/CSS/vanilla-JavaScript application for the Self-Similar Calabi–Yau Visualizer. v0.04 adds the first base-scene renderer while preserving the v0.03 mathematical scene contract.

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

The scene is loaded from `data/system.json`, validated by `scene-spec.js`, and only then passed to `base-renderer.js` by `app.js`.

## v0.03 scene contract remains canonical

Canonical mathematical inputs remain:

- `D`, an integer with `D >= 2`;
- finite numeric `lambda`;
- finite numeric `kappa`;
- a structured declaration that `P_D` is the four-coordinate power map using exponent parameter `D`;
- the base hypersurface as a level set of symbolic `W` at parameter `lambda`, with the concrete representation of `W` explicitly left `unresolved`.

`requestedDepth` remains a request parameter, not an intrinsic mathematical input. `D^2` and `D^4` remain derived quantities computed by `scene-spec.js` after validation.

## v0.04 base renderer

`base-renderer.js` consumes the normalized scene returned by `SceneSpec.validateAndNormalizeScene`. It does **not** validate raw scene input again.

Because the canonical representation of `W` is still `unresolved`, v0.04 cannot truthfully construct or draw the geometry of

\[
X=W^{-1}(\lambda).
\]

The renderer therefore exposes an explicit `unresolved_geometry` render state and reports that geometry was not drawn. This is the complete faithful rendering behavior justified by the current mathematical data. No placeholder shape, polynomial AST, sample Calabi–Yau equation, Canvas geometry, or SVG geometry is substituted for `X`.

The DOM is used as the minimal rendering surface because there is not yet geometric information that would justify a graphical surface. This choice is local to v0.04 and does not pre-decide later rendering technology.

See `docs/BASE_RENDERER_self_similar_cy_visualizer_v0_04.md` for the renderer contract.

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
node --check scene-spec.js
node --check base-renderer.js
node --check app.js
```

The v0.03 verifier still validates the canonical scene and rejects malformed input. The v0.04 verifier confirms that renderer state is initialized only after scene validation, that unresolved `W` never becomes invented geometry, and that Thread 03 contains no pullback or recursive behavior.

## Scope of v0.04

This version implements the **Base Renderer** milestone only. It does not implement one-step pullback visualization, recursive expansion, lazy recursion, zoom semantics, `D^4` sheet rendering, arithmetic/cyclotomic overlays, Three.js, WebGL, GPU buffers, camera navigation, performance work, fidelity audit, later UX, or publication work.

The next milestone is **Thread 04 — One-Step Pullback**.

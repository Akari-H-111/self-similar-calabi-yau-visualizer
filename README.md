# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.02 — Repository Bootstrap

This repository is currently a minimal static browser application scaffold for the Self-Similar Calabi–Yau Visualizer.

## Current mathematical core

\[
X = W^{-1}(\lambda),
\]

\[
X_n = (P_D^n)^{-1}(X),
\]

\[
P_D(z_1,\ldots,z_4) = (z_1^D,\ldots,z_4^D).
\]

The browser app displays these canonical structural formulas and loads its bootstrap configuration from `data/system.json` using `fetch()`.

## Run locally

Serve the repository over HTTP rather than opening `index.html` with `file://`:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in a browser.

## Scope of v0.02

This version is **bootstrap scaffold only**. It does not implement Calabi–Yau hypersurface rendering, pullback visualization, recursive expansion, `D^4` sheets, cyclotomic overlays, Three.js, WebGL, or later UX work.

The next planned milestone is **Thread 02 — Mathematical Scene Specification**.

# Self-Similar Calabi–Yau Visualizer — Engineering Plan v0.01

## Provenance note

This repository copy records the operational plan supplied in the Thread 01 handoff. The original v0.01 artifact body was not independently retrievable through the active repository connector before the repository bootstrap because the repository was empty. This file therefore preserves the thread-authoritative milestone structure and constraints without claiming byte-for-byte identity with an unavailable prior attachment.

## Canonical mathematical core

\[
X=W^{-1}(\lambda),
\]

\[
X_n=(P_D^n)^{-1}(X),
\]

\[
P_D(z_1,\ldots,z_4)=(z_1^D,\ldots,z_4^D).
\]

Later milestones may also use

\[
P_D^*g_{\log}=D^2g_{\log},
\qquad
\deg(q_n)=D^4.
\]

## Engineering rule

One thread completes exactly one verifiable milestone. A thread must stop at its assigned boundary even when later work appears easy to add.

## Milestones

1. **Thread 01 — Repository Bootstrap**: create a minimal static HTML/CSS/vanilla-JavaScript application that displays the canonical structural formulas and fetches `data/system.json`.
2. **Thread 02 — Mathematical Scene Specification**: define the scene/data model. No scene-schema closure belongs to Thread 01.
3. **Thread 03 — Base Renderer**.
4. **Thread 04 — One-Step Pullback**.
5. **Thread 05 — Recursive Lazy Expansion**.
6. **Thread 06 — Zoom Semantics**.
7. **Thread 07 — D^4 Sheets**.
8. **Thread 08 — Arithmetic Overlays**.
9. **Thread 09 — Performance Work**.
10. **Thread 10 — Fidelity Audit**.
11. **Thread 11 — UX**.
12. **Thread 12 — Publication**.

## Thread 01 acceptance boundary

Thread 01 may use only HTML, CSS, and vanilla JavaScript. It must not introduce React, Vue, Svelte, Three.js, WebGL, npm, a bundler, TypeScript, or genuine SVG/Canvas rendering.

The bootstrap is complete when:

- `index.html`, `style.css`, `app.js`, `README.md`, and `data/system.json` exist;
- `index.html` visibly contains the project title and the three canonical structural formulas;
- `app.js` genuinely calls `fetch("data/system.json")` and exposes success/failure state;
- `system.json` is valid JSON containing only the minimal bootstrap configuration;
- static validation distinguishes `passed`, `failed`, and `not_tested`;
- the repository documentation states that mathematical rendering and recursion are not yet implemented.

## Thread 01 stopping point

\[
\boxed{\text{repository is a verifiable minimal static application}}
\]

The only next milestone after successful closure is **Thread 02 — Mathematical Scene Specification**.

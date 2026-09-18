# Progress — Self-Similar Calabi–Yau Visualizer v0.20

## Milestone

```text
Thread 19 — Visual Semantics & Accessibility Audit
candidate version: v0.20
starting canonical version: v0.19
```

## Gate 0

Canonical baseline was rechecked before mutation:

```text
commit = 5c45dd74e53cde06e30ae70ecd97171f7012cf0d
tree   = 9e054355f97c957939127b934a0b9605b3f1378e
Formal Verification #110 / 35322442148 = success
Pages #7 / 35322441335 = success
PR #11 = closed, merged=false
open PR = none
v0.13 release = immutable
```

## Initial audit findings

Static/source audit identified four primary repair targets:

- virtualized interaction rerender destroyed the original focused DOM control without restoration;
- Ctrl/Cmd-modified wheel could reach structural-camera `preventDefault()`;
- virtualized gap text was hidden from assistive technology;
- multiple changing status surfaces could produce duplicate/noisy announcements.

Additional static risks were recorded for forced colors, narrow SVG readability, quantitative contrast, high browser zoom, and nested-SVG assistive-technology exposure.

## Initial implementation

The first v0.20 patch:

- adds presentation-only focus descriptors and deterministic post-rerender focus restoration;
- keeps semantic selection/focus authoritative in the sealed interaction model;
- reserves plain wheel, Ctrl/Cmd+wheel, and touch pinch/pan for page/browser behavior;
- retains Alt+wheel plus native camera buttons for structural camera zoom;
- exposes bounded textual semantics for virtualized gaps;
- reduces live announcement surfaces to the single existing system status region;
- preserves visible non-live interaction/camera diagnostics;
- adds forced-colors hooks;
- keeps a readable internal structural-canvas width below 760px instead of shrinking all SVG text indefinitely;
- preserves reduced-motion behavior.

## Boundaries

No sealed semantic module, `structural-camera.js`, `formal/*`, Lean toolchain pin, or mathlib pin is intentionally modified.

Still invariant:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

## Evidence status

```text
Layer A static/Node verifier = implementation added; CI pending
Layer B real-browser smoke = not_tested
Layer C assistive-technology matrix = not_tested
quantitative contrast = not_tested
forced-colors rendered evidence = not_tested
320/400/760 rendered evidence = not_tested
browser zoom 200%/400% = not_tested
```

No WCAG, screen-reader, or all-browser certification is claimed.

## Next gate

Run v0.03-v0.20 on the staging branch/draft PR. If old verifiers identify a genuine historical contract regression, repair the new presentation implementation rather than weakening the older verifier.

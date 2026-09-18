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

## Audit findings and repairs

The v0.20 audit found and repaired four primary presentation risks:

- virtualized interaction rerender replaced the focused DOM control without deterministic restoration;
- Ctrl/Cmd-modified wheel could reach structural-camera `preventDefault()`;
- virtualized gap text was hidden from assistive technology;
- multiple changing status surfaces could create duplicate/noisy announcements.

The repair:

- uses presentation-only focus identity = control role + interaction action + semantic depth;
- restores browser focus without modifying `selectedDepth`, `focusedDepth`, recursion, camera, arithmetic, or D⁴ organization semantics;
- reserves plain wheel, Ctrl/Cmd+wheel, touch pan, and touch pinch for page/browser behavior;
- keeps Alt+wheel plus native camera buttons for structural camera zoom;
- exposes bounded gap text without materializing the full semantic tower;
- keeps only `#system-status` as the polite live region;
- preserves visible non-live interaction/camera diagnostics;
- adds forced-colors hooks and preserves non-color focus/selection encodings;
- preserves reduced-motion behavior;
- uses bounded internal structural-canvas width/scrolling below 760px rather than shrinking SVG text indefinitely.

## Boundary audit

The staging diff does not modify:

```text
formal/*
scene-spec.js
base-renderer.js
one-step-pullback.js
recursive-lazy-expansion.js
zoom-semantics.js
sheet-branch-organization.js
arithmetic-overlays.js
interactive-pullback-tower.js
structural-camera.js
structural-visualization.js
branch-organization-graphics.js
arithmetic-overlay-graphics.js
exposition-layer.js
```

Still invariant:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

## Pre-final staging CI

Implementation candidate before final documentation synchronization:

```text
commit: dcc3bb1871e926ca45fbcd9897c3cd23c5ecbdf3
tree:   f262f6cf07f5506df6ee0ec6c898ccde0cc7445d
```

Formal Verification:

```text
run #113
run id 35325277713

runtime-contracts        = success
formal-lean              = success
publication-static-smoke = success
v0.03 through v0.20      = success
```

The first v0.20 runtime attempt exposed a verifier bootstrap omission: the new verifier had not loaded the sealed recursive/focus/organization runtime APIs before instantiating the sealed interaction controller. No old verifier failed and no production semantic module was changed. The verifier bootstrap was corrected, after which run #113 passed the complete v0.03-v0.20 chain.

## Evidence classification

```text
Layer A deterministic static/Node contracts = success
Layer B real-browser smoke = not_tested
Layer C assistive-technology matrix = not_tested
quantitative contrast = not_tested
forced-colors rendered evidence = not_tested
320/400/760 rendered evidence = not_tested
browser zoom 200%/400% = not_tested
```

The repository therefore does not claim WCAG certification, screen-reader certification, quantitative contrast certification, 200%/400% browser-zoom certification, or all-browser support.

## Staging PR

```text
PR #12
state = open / draft
merged = false
role = CI VEHICLE ONLY / DO NOT MERGE
```

## Final artifact sync status

This progress file, the v0.20 state file, the v0.20 contract document, and README are the final documentation synchronization.

They do not certify themselves.

After this sync:

```text
final exact staging tree CI = pending
PR #12 close-unmerged = pending
exact-tree canonical replay = pending
main fast-forward = pending
exact-main Formal Verification = pending
exact-SHA Pages = pending
```

## Seal rule

Thread 19 remains unsealed until the exact final staging tree passes all required CI, PR #12 is closed unmerged, that exact tree is replayed as exactly one child of `5c45dd74e53cde06e30ae70ecd97171f7012cf0d`, `main` is fast-forwarded without force, and exact-main Formal Verification plus exact-SHA Pages both succeed.

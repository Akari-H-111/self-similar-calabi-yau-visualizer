# Progress — Self-Similar Calabi–Yau Visualizer v0.17

## Milestone

```text
Thread 16 — D⁴ Branch Organization Graphics
candidate version: v0.17
starting canonical version: v0.16
```

## Provenance audit

Thread 16 began only after rechecking canonical `main` and Thread 15 external seal evidence.

```text
main commit = 49ece02ada3a3f4aba2077fa86fd494df3c8188a
tree        = 9a9f1ea776789fb4f9a02b0c43b59f2ac6c3cbf2
sole parent = d40e938c318a8389baccb58223c9f057217ba018

Thread 15 Formal Verification run #76 / 35253648915 = success
Thread 15 Pages run 35253643964 = success
Thread 15 staging PR #8 = closed, merged=false, draft CI vehicle
```

No unexpected canonical-main drift was found.

## Implemented

- Added `branch-organization-graphics.js`.
- Added `verify_branch_organization_graphics_v0_17.js`.
- Added the v0.17 verifier and source/static smoke checks to CI.
- Added truthful v0.17 exposition to `index.html`.
- Kept `data/system.json` unchanged at canonical `requestedDepth=0`.
- Kept sealed runtime/semantic engines unchanged.
- Kept the Lean formal core/toolchain/mathlib pin unchanged.

## Encoding

The new graphical projection consumes the existing sheet/branch organization renderer output and displays one aggregate badge per visible adjacent structural transition.

Examples verified by the v0.17 contract:

```text
D=2  -> D⁴=16       -> aggregate badge ×16
D=3  -> D⁴=81       -> aggregate badge ×81
D=64 -> D⁴=16777216 -> aggregate badge ×16777216
```

The encoding does not enumerate `D⁴` graphical objects.

## Truth boundary

Still invariant:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

`D⁴` remains runtime numeric / organizational metadata. It is not promoted to a proved map-degree theorem.

## D=1 boundary

The inherited scene validator requires safe-integer `D >= 2`. The v0.17 verifier confirms that `D=1` is rejected by the existing schema and explicitly treats that as a current schema / representation boundary, not as a mathematical impossibility.

## Integration

The presentation pipeline is:

```text
sheet-branch-organization renderer output
  -> branch-organization-graphics read-only snapshot
  -> visible structural node rectangles
  -> deterministic aggregate badge model
  -> same structural SVG
  -> existing structural-camera viewBox
```

No second recursion engine, D⁴ engine, or camera engine was introduced.

## Regression audit

Two early staging runs found documentation wording regressions:

1. v0.15 required the visible phrase `camera transform or geometric zoom`.
2. v0.16 required the visible phrase `Camera scale is presentation-only viewport state`.

Both were restored. No verifier assertion was weakened or removed.

## Pre-final-artifact CI

The corrected staging head was:

```text
commit: 10b9be784a1706008712c72e8fa31c5be6469ab8
tree:   263666ef1f132271bd88577a566670a99a3cb3db
```

GitHub Actions Formal Verification run:

```text
run #79
run id 35256652594
runtime-contracts        = success
formal-lean              = success
publication-static-smoke = success
```

The runtime job passed all verifiers v0.03 through v0.17 and the source syntax gate.

## Final artifact sync status

This file, the v0.17 state file, the v0.17 contract document, and the README update are the final documentation synchronization.

By design they do not certify themselves. Therefore after this sync:

```text
final exact staging tree CI = pending
staging PR #9 close-unmerged = pending
exact-tree canonical replay = pending
main fast-forward = pending
exact-main Formal Verification = pending
exact-SHA Pages = pending
```

## Seal rule

Thread 16 is not sealed merely because this progress file exists.

Only the exact verified final staging tree, closed-unmerged PR state, one-parent canonical replay, fast-forwarded `main`, exact-main Formal Verification success, and exact-SHA Pages success can complete the seal.

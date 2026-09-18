# Progress — Self-Similar Calabi–Yau Visualizer v0.19

## Milestone

```text
Thread 18 — Infinite-Navigation Rendering Engine
candidate version: v0.19
starting canonical version: v0.18
```

## Provenance audit

Thread 18 began from exact sealed Thread 17 canonical `main`:

```text
commit = f1b2a0a43aae609574be795f5e3a89fe3e53fcc0
tree   = c02f66550fb27f4e2f3ba891cae816e28abd80b8
parent = 10a315458b7321ee0f48e553d533c3519fd99916

Thread 17 Formal Verification run #95 / 35316280060 = success
Thread 17 Pages run #6 / 35316279726 = success
Thread 17 staging PR #10 = closed, merged=false, draft CI vehicle
```

No canonical-main drift occurred during implementation.

## Implemented

- Added `infinite-navigation-renderer.js`.
- Added `verify_infinite_navigation_renderer_v0_19.js`.
- Added `benchmark_infinite_navigation_renderer_v0_19.js`.
- Added deterministic viewport/render-window virtualization with overscan.
- Added floating-origin, anchor-relative deep-depth descriptors.
- Added bounded presentation-slot pooling and recycling.
- Added a bounded deterministic recomputable virtual-layout cache with eviction.
- Virtualized structural SVG nodes and interaction control rows above the sealed semantic model.
- Added explicit renderer-owned branch-badge reprojection lifecycle while preserving the v0.17 app-layer isolation contract.
- Preserved arithmetic graphics as the explicit v0.18 sibling projection.
- Added v0.19 CI verifier and benchmark execution.

## Semantic boundary preserved

The following modules remain byte-identical to the Thread 17 canonical baseline:

```text
scene-spec.js
one-step-pullback.js
recursive-lazy-expansion.js
zoom-semantics.js
sheet-branch-organization.js
arithmetic-overlays.js
interactive-pullback-tower.js
```

During staging, CI caught an attempted modification of the sealed interaction module. The implementation was corrected by restoring the exact canonical blob and moving interaction virtualization into the new v0.19 adapter.

The recursion authority therefore remains unchanged.

## Branch-graphics boundary preserved

v0.17 verifier coverage requires `app.js` to stay decoupled from the branch-graphics module.

The first explicit reprojection integration crossed that string-level contract. It was corrected by moving the delegation behind the neutral v0.19 renderer entry point:

```text
InfiniteNavigationRenderer.projectOrganizationBadges(...)
```

The legacy v0.17 verifier was not weakened.

## Render policy and boundedness

Default policy:

```text
viewportLevelCapacity = 9
overscanLevels = 2
configuredSpan = 13
deep configured active bound = 18
deep derived cache capacity = 36
```

The active set retains the viewport/overscan window plus required base, selected, focused, and predecessor depths.

Presentation object count is therefore controlled by the render policy rather than total semantic materialized depth.

## Deep-target behavior

The v0.19 verifier covers selection of a materialized depth that begins outside the active render window.

The test confirms:

```text
selection does not require an existing SVG node
renderer makes the target locally render-addressable
required predecessor is retained
camera fit obtains finite local coordinates
camera targeting does not expand or prune semantic structure
```

Near-safe-integer deep depths are represented relative to a virtual anchor; unsafe far absolute coordinates remain symbolic.

## Cache behavior

The virtual-layout cache is state-carried rather than global mutable state.

It is:

```text
bounded
deterministic
recomputable
non-canonical
evictable
```

Eviction does not affect `recursiveModel.levels`.

## Pre-final benchmark evidence

Implementation candidate before documentation sync:

```text
commit: c908efdb3a1bfff59eb8cac6fcab0c48c31f6ecc
tree:   43580e900f7356a165e6280b8bb07b7a02c8a0f7
```

Formal Verification run:

```text
run #106
run id 35319546704

runtime-contracts        = success
formal-lean              = success
publication-static-smoke = success
```

The v0.19 benchmark sampled semantic depths:

```text
100
1,000
10,000
1,000,000
```

All four horizons reported:

```text
maximumActiveRenderedDepthCount = 14
maximumPresentationPoolSize = 14
configuredActiveBound = 18
recycledBindingCount = 58

virtualLayoutCacheHits = 10
virtualLayoutCacheMisses = 69
virtualLayoutCacheEvictions = 33
maximumVirtualLayoutCacheEntries = 36
virtualLayoutCacheCapacity = 36
```

This is engineering evidence from the Node GitHub runner.

It does not establish browser heap behavior or a mathematical/asymptotic depth bound:

```text
browserEvidence = not_tested
timingAndHeapAreEnvironmentSensitive = true
benchmarkThresholdIsSemanticLimit = false
```

## Truth boundary

Still invariant:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

No concrete Calabi–Yau geometry, genuine sheets, covering/étale geometry, torsion/collision/divisor loci, or geometric preimages were introduced.

## Changed-file scope before final documentation sync

Relative to canonical `f1b2a0a43aae609574be795f5e3a89fe3e53fcc0`, the pre-final implementation candidate changed only:

```text
.github/workflows/formal-verification.yml
app.js
benchmark_infinite_navigation_renderer_v0_19.js
index.html
infinite-navigation-renderer.js
structural-visualization.js
style.css
verify_infinite_navigation_renderer_v0_19.js
```

No formal source or sealed semantic module changed.

## Final artifact sync status

This progress file, the v0.19 state file, the v0.19 contract document, README, index exposition, and publication smoke markers are the final documentation synchronization.

They do not certify themselves.

After this sync:

```text
final exact staging tree CI = pending
staging PR #11 close-unmerged = pending
exact-tree canonical replay = pending
main fast-forward = pending
exact-main Formal Verification = pending
exact-SHA Pages = pending
```

## Seal rule

Thread 18 remains unsealed until the exact final staging tree passes all required CI, PR #11 is closed unmerged, that exact tree is replayed as exactly one child of the Thread 17 canonical commit, `main` is fast-forwarded without force, and exact-main Formal Verification plus exact-SHA Pages both succeed.

# Infinite-Navigation Rendering Engine v0.19

## 1. Scope

Thread 18 adds a presentation-only rendering engine above the existing semantic pullback tower.

The governing separation is:

```text
semantic materialization
!= virtual layout
!= render materialization
```

The milestone does not replace the recursion engine and does not strengthen the mathematical scope.

## 2. Starting canonical provenance

Thread 18 started from exact sealed Thread 17 canonical `main`:

```text
commit: f1b2a0a43aae609574be795f5e3a89fe3e53fcc0
tree:   c02f66550fb27f4e2f3ba891cae816e28abd80b8
parent: 10a315458b7321ee0f48e553d533c3519fd99916
message: visualization: seal Thread 17 arithmetic overlay graphics v0.18
```

Inherited seal evidence was rechecked:

```text
Formal Verification run #95 / 35316280060 = success
Pages run #6 / 35316279726 = success
Thread 17 staging PR #10 = closed, merged=false, draft CI vehicle
```

## 3. Semantic authority remains sealed

The following semantic/runtime modules remain byte-identical to the starting canonical baseline:

```text
scene-spec.js
one-step-pullback.js
recursive-lazy-expansion.js
zoom-semantics.js
sheet-branch-organization.js
arithmetic-overlays.js
interactive-pullback-tower.js
```

In particular:

```text
expandOneLevel()
```

remains the structural semantic expansion authority.

Viewport changes, cache eviction, slot recycling, camera operations, arithmetic overlay toggles, D⁴ badge reprojection, and render-window movement do not delete, rewrite, or invent entries in `recursiveModel.levels`.

## 4. Render-window policy

The new module is:

```text
infinite-navigation-renderer.js
```

The default policy is:

```text
viewportLevelCapacity = 9
overscanLevels = 2
configuredSpan = 13
```

The active set additionally pins required navigation/transition depths:

```text
X_0
selected depth
focused depth
selected predecessor when positive
focused predecessor when positive
```

The deterministic configured active bound is derived from the viewport policy and never from the total semantic depth.

Structural SVG nodes and interaction rows are generated from this bounded active set when v0.19 presentation options are active.

View pruning is represented explicitly. It is not semantic collapse.

## 5. Floating-origin deep navigation

The renderer stores deep layout relationships relative to a virtual anchor.

A depth descriptor records:

```text
anchorDepth
relativeDepthExact
localCoordinateAvailable
localOffset
```

The relative depth is retained exactly as a BigInt-derived string.

If a requested local coordinate would exceed safe numeric representation, the renderer keeps the relation symbolic instead of forcing an unsafe SVG coordinate.

This is a representation-safety mechanism, not a mathematical restriction on pullback depth.

## 6. Off-window navigation and camera targeting

Selection/refocus authority remains in the sealed interaction model and does not require a pre-existing SVG/DOM node.

The v0.19 verifier covers a materialized depth that begins outside the active render window:

```text
select off-window depth
-> semantic selection succeeds
-> renderer pins target depth and predecessor
-> structural projection obtains local bounds
-> camera fit to target succeeds with finite local coordinates
```

No recursive expansion is triggered by the camera or by render-window rebasing.

## 7. Presentation slot pool

The renderer maintains a deterministic presentation slot pool.

Slots are presentation identities only. A slot may be rebound to a different active depth after navigation.

The verifier checks:

```text
pool size <= configured active bound
active binding count = current active depth count
unique active slot ids
no stale bound-depth metadata
bounded high-water behavior across repeated movement
```

Slot recycling never changes semantic identity or retained structural state.

## 8. Bounded derived virtual-layout cache

The cache stores only recomputable presentation descriptors.

Its contract is:

```text
bounded = true
deterministic = true
recomputable = true
canonical = false
evictable = true
```

Default capacity is derived as twice the configured active bound.

Cache hits, misses, and evictions are diagnostic engineering metadata. Eviction cannot alter semantic materialization.

No global mutable cache is introduced; cache state travels with the immutable renderer state.

## 9. D⁴ branch and arithmetic lifecycle

v0.17 branch graphics remain a sibling presentation layer. The v0.17 verifier requires `app.js` to stay branch-graphics agnostic.

Thread 18 therefore exposes a neutral renderer lifecycle entry point:

```text
InfiniteNavigationRenderer.projectOrganizationBadges(...)
```

which delegates to the existing branch projection API.

Arithmetic graphics continue to use their explicit v0.18 reprojection path.

Both consume the current virtualized structural layout; neither becomes a semantic authority.

## 10. Benchmark evidence

GitHub Actions Formal Verification run #106 / 35319546704 executed the v0.19 benchmark at head:

```text
c908efdb3a1bfff59eb8cac6fcab0c48c31f6ecc
```

with semantic-depth horizons:

```text
100
1,000
10,000
1,000,000
```

For all four horizons, the observed values were:

```text
maximumActiveRenderedDepthCount = 14
maximumPresentationPoolSize = 14
configuredActiveBound = 18
virtualLayoutCacheHits = 10
virtualLayoutCacheMisses = 69
virtualLayoutCacheEvictions = 33
maximumVirtualLayoutCacheEntries = 36
virtualLayoutCacheCapacity = 36
recycledBindingCount = 58
```

The benchmark records:

```text
activeCountDependsOnSemanticDepth = false
browserEvidence = not_tested
timingAndHeapAreEnvironmentSensitive = true
benchmarkThresholdIsSemanticLimit = false
```

The benchmark is engineering evidence for the tested implementation and policy. It is not a proof of browser memory behavior, a theorem of asymptotic complexity, or a mathematical depth bound.

## 11. Truthfulness invariants

Throughout v0.19:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

The renderer does not materialize Calabi–Yau geometry, concrete sheets, fibers, covering/étale geometry, torsion loci, collision loci, divisors, or geometric preimages.

## 12. Formal boundary

Thread 18 adds no Lean theorem and changes no formal source, toolchain pin, or mathlib pin.

The sealed formal scope remains the coordinate-power map, coordinate-power iteration, and abstract set-theoretic pullback tower.

## 13. Verification

Runtime CI executes every verifier v0.03 through v0.19 and the v0.19 benchmark.

The v0.19 verifier covers:

```text
sealed semantic blob identity
deterministic viewport/render-window state
bounded active render objects
presentation pool recycling
bounded derived cache and eviction
floating-origin deep descriptors
off-window selection and camera fit
structural SVG virtualization
interaction-row virtualization
D⁴ branch reprojection
arithmetic overlay coexistence
truthfulness flags
source/CI wiring
```

Pre-final-artifact staging evidence:

```text
head: c908efdb3a1bfff59eb8cac6fcab0c48c31f6ecc
tree: 43580e900f7356a165e6280b8bb07b7a02c8a0f7
run:  #106 / 35319546704

runtime-contracts        = success
formal-lean              = success
publication-static-smoke = success
```

This evidence predates the final documentation synchronization and therefore does not certify the final staging tree.

## 14. Seal authority

Thread 18 is not sealed by this document.

The seal requires:

```text
final exact staging tree CI success
PR #11 closed unmerged
exact verified tree replayed as exactly one child of f1b2a0a43aae609574be795f5e3a89fe3e53fcc0
main fast-forwarded without force
exact-main Formal Verification success
exact-SHA Pages success
```

Git object identity and external workflow evidence remain the seal authority.

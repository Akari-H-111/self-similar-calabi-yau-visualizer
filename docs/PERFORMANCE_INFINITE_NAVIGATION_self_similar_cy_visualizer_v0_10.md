# Performance and Infinite-Navigation Audit — Self-Similar Calabi–Yau Visualizer v0.10

## Milestone

**Thread 09 — Performance and Infinite-Navigation Audit**

This milestone measures the existing v0.09 runtime architecture before optimization, distinguishes retained semantic state from leaks, audits large-depth JavaScript representation, and preserves all existing mathematical/runtime boundaries.

The operational meaning of "infinite navigation" in v0.10 is strictly:

```text
arbitrarily continued finite structural navigation
```

It does not mean a literal infinite in-memory tree, an infinite browser execution guarantee, or a completed infinite-zoom UX.

## Canonical starting baseline

Thread 09 began from:

```text
main @ ddbcd159cdcd5eefa7c6980ef21d401eaf42bcb7
overlays: add verified v0.09 arithmetic overlay semantics
sole parent: e257c2d3b7e52c29f30a9a7c30503fddd5297a2e
```

The canonical starting workflow was:

```text
Formal Verification run 35069625369
head branch: main
head sha: ddbcd159cdcd5eefa7c6980ef21d401eaf42bcb7
status: completed
conclusion: success
runtime-contracts: completed / success
formal-lean: completed / success
```

The older `staging-CI verified` wording in the v0.09 state/progress files is historical pre-final-push documentation and was intentionally not rewritten.

## Performance representability audit

| Item | v0.10 classification | Evidence / note |
|---|---|---|
| recursive model level count | directly measurable | `recursiveModel.levels.length` |
| structural descriptor count | directly measurable | recursive levels and organization descriptors |
| DOM node count | requires browser-only observation for exact runtime count | current app has a fixed status-oriented DOM surface; no per-level DOM tree |
| rendered status node count | source-auditable, browser count not executed | no level-by-level DOM materialization |
| cumulative expansion time | directly measurable in Node, environment-sensitive | benchmark script |
| per-step expansion time | directly measurable in Node, environment-sensitive | representative sampled calls |
| heap / memory growth | indirectly measurable in Node, environment-sensitive | `process.memoryUsage().heapUsed` with optional forced GC |
| temporary allocation behavior | indirectly measurable | before/after forced-GC approximation, not a leak proof |
| focus-model creation cost | directly measurable in Node | benchmark script |
| sheet-organization-model creation cost | directly measurable in Node | benchmark script |
| arithmetic-overlay-model creation cost | directly measurable in Node | benchmark script |
| cache behavior | not implemented | no generation/view cache subsystem exists |
| pruning behavior | not implemented / discarded-level leak criterion not applicable | canonical recursive history is retained; no discarded levels exist |
| browser frame time | browser-only and not tested | no interactive animation/navigation loop exists in v0.10 |
| large-n numerical representation | deterministic contract audit | symbolic exponents plus Number safe-integer guards |

The original roadmap mentioned Canvas object counts, generation cache, pruning, and frame time. v0.10 does not fabricate those subsystems: no Canvas scene graph, per-level DOM tree, cache, viewport pruning, or interactive navigation loop exists in the canonical implementation.

## Scaling hypothesis and measurement

The audited `expandOneLevel()` path constructs a new levels array and `buildModel()` copies/freezes it again. Therefore repeated immutable expansion has a plausible cumulative superlinear array-copy cost. v0.10 treats that as an engineering hypothesis, not a theorem.

Baseline staging run `35070985111`, Node `v22.23.2`, Linux x64, measured:

| Target depth | Expansion calls | Cumulative expansion | Retained expansion delta after GC | Approx temporary expansion allocation | Organization creation |
|---:|---:|---:|---:|---:|---:|
| 10 | 9 | 0.432 ms | 0.033 MiB | 0.039 MiB | 0.345 ms |
| 100 | 99 | 0.379 ms | 0.049 MiB | 0.236 MiB | 0.150 ms |
| 1,000 | 999 | 4.296 ms | 0.206 MiB | 0.110 MiB | 0.468 ms |
| 2,500 | 2,499 | 22.161 ms | 0.526 MiB | 3.434 MiB | 0.983 ms |
| 5,000 | 4,999 | 28.474 ms | 0.995 MiB | 1.883 MiB | 0.655 ms |
| 10,000 | 9,999 | 97.185 ms | 1.988 MiB | 7.953 MiB | 1.555 ms |

The largest-pair empirical time exponent in that run was `1.771`. A second staging run after the numerical safety guards (`35071167163`) measured 10,000 levels at `125.786 ms`, retained expansion delta `1.988 MiB`, temporary approximation `7.953 MiB`, and a largest-pair exponent `1.495`.

These measurements support two simultaneous conclusions:

1. the immutable array-copy path has observable superlinear timing behavior at deeper finite horizons;
2. at the tested 10,000-level engineering horizon it is not an operational bottleneck that justifies a recursion representation rewrite.

Timing and heap numbers are environment-sensitive observations. No value above is a CI performance threshold or a mathematical maximum depth.

## Memory / leak audit

v0.10 distinguishes:

```text
necessary retained semantic state
temporary allocation
discardable view/cache state
actual leak
```

The recursive model intentionally retains one structural descriptor per materialized positive depth, so retained heap growth with depth is expected semantic state growth.

The benchmark's forced-GC observations show roughly linear retained expansion state over the tested range (about 1.99 MiB at 10,000 retained descriptors), while temporary allocation grows because repeated immutable copying creates short-lived arrays.

No pruning/cache subsystem and no discarded recursive levels currently exist. Therefore:

```text
leak-from-discarded-levels = not_applicable
```

The Node evidence does not prove absence of all browser leaks. Real browser heap / long-session leak observation remains `not_tested`.

## Derived-model costs

At 10,000 materialized levels in baseline run `35070985111`:

```text
focus model        ≈ 0.066 ms
organization model ≈ 1.555 ms
overlay model      ≈ 0.215 ms
```

Focus creation is constant-size metadata. Sheet organization maps over all materialized levels and therefore creates one aggregate descriptor per level. Arithmetic overlay creation remains small and does not expand recursion.

Repeated derived-model creation is verified not to mutate recursive state. No derived-model cache exists.

## Large-n numerical representation audit

Deep structural expressions remain symbolic:

```text
iterated degree: { baseDegree, exponent }
coordinate iterate: { baseParameter, towerDepth }
```

The recursion engine does not evaluate giant `D^n`, `D^(2n)`, or `D^(4n)` values.

The audit identified a real JavaScript representation risk: `Number.isInteger()` accepts integer-valued Numbers outside the safe-integer range, where precision aliasing can occur. v0.10 therefore adds a minimal engineering guard:

```text
requestedDepth must be Number.isSafeInteger(value) && value >= 0
requestedFocusDepth must be Number.isSafeInteger(value) && value >= 0
```

`Number.MAX_SAFE_INTEGER` remains a valid request/focus metadata value; values above the safe-integer range are rejected. This is a JavaScript representation constraint, not a theorem or mathematical depth limit.

The existing `D^2` / `D^4` safe-integer validation remains independent and unchanged in semantic role.

## Optimization decision

```text
no production optimization justified
```

The recursion engine was not rewritten. In particular, v0.10 does not introduce:

```text
mutable global recursion state
linked lists
chunked trees
persistent-vector libraries
framework state managers
databases
workers
caches
pruning
```

The measured copying cost is documented as the current scaling frontier to revisit only if future real-browser or substantially deeper workload evidence makes it operationally relevant.

The only production-code changes are representation-safety guards in `scene-spec.js` and `zoom-semantics.js`.

## Infinite-navigation runtime contract

`expandOneLevel` remains the sole structural materialization authority.

Preserved:

```text
one call -> at most one new structural level
requestedDepth != materializedDepth
requestedFocusDepth != focusedDepth
unavailable focus -> not_materialized
zoom materializationTriggered = false
sheet organization materializationTriggered = false
arithmetic overlays materializationTriggered = false
geometricZoomApplied = false
cameraTransformApplied = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometryRendered = false
W representation = unresolved
```

A requested depth can be very large while initialization still materializes at most depth 1. The benchmark horizon is not a hard-coded navigation ceiling.

## Node evidence vs browser evidence

### Deterministic CI evidence

`verify_performance_infinite_navigation_v0_10.js` checks a 1,000-level finite stress case, one-level-at-a-time growth, immutable prior models, symbolic exponent storage, non-materializing derived layers, safe-integer guards, unresolved geometry, and large safe request metadata.

This verifier is suitable for CI hard gating.

### Environment-sensitive Node observation

`benchmark_performance_infinite_navigation_v0_10.js` records timing and heap observations without pass/fail performance thresholds. It is retained as an audit/manual benchmark artifact rather than a mandatory high-cost CI performance gate.

### Browser observation

```text
browser smoke/performance = not_tested
```

Node results are not presented as browser frame-time, DevTools heap, or interactive responsiveness evidence.

## Formal verification boundary

F01–F06 remains sealed. No Lean theorem/source file is modified or reopened by this milestone.

A green CI run means only:

```text
sealed Lean formal core passes
+
runtime engineering contracts pass
```

It does not mean browser performance or the whole visualizer mathematics is formally verified.

## Explicit non-claims

v0.10 does not claim or implement:

```text
literal infinite in-memory structures
mathematical maximum depth
browser execution forever
full infinite-scroll / infinite-zoom UX
camera geometry
Canvas/WebGL/GPU rendering
new arithmetic geometry
genuine D^4 sheets
covering-space / étale geometry
resolved W
Calabi–Yau geometry
Thread 10 mathematical fidelity audit
```

## Next milestone

After canonical v0.10 sealing, the next natural milestone is:

**Thread 10 — Mathematical Fidelity Audit**.

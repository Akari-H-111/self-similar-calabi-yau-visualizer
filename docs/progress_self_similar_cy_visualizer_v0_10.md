# Progress — Self-Similar Calabi–Yau Visualizer v0.10

## Milestone

**Thread 09 — Performance and Infinite-Navigation Audit**

Status: **completed on staging evidence**, with final canonical-main CI still required after one-commit fast-forward sealing.

## Canonical starting gate

Thread 09 began from exact `main` HEAD:

```text
ddbcd159cdcd5eefa7c6980ef21d401eaf42bcb7
overlays: add verified v0.09 arithmetic overlay semantics
```

with sole parent:

```text
e257c2d3b7e52c29f30a9a7c30503fddd5297a2e
```

No newer competing commit was present. Canonical workflow run `35069625369` was `completed / success`, with both `runtime-contracts` and `formal-lean` successful.

The historical v0.09 `staging-CI verified` wording was intentionally left untouched; operational baseline for this thread is the canonical main commit and run above.

## Performance representability audit

The actual implementation was classified before optimization.

Directly measurable in Node:

```text
recursive level count
structural descriptor count
cumulative expansion time
per-step expansion time
focus creation cost
sheet-organization creation cost
arithmetic-overlay creation cost
```

Environment-sensitive / indirect Node observations:

```text
heap growth
temporary allocation approximation via forced GC
```

Not implemented:

```text
generation cache
viewport cache
pruning subsystem
per-level DOM tree
Canvas scene graph
interactive navigation loop
```

Browser-only / not tested:

```text
exact runtime DOM count
frame timing
DevTools heap behavior
long-session interaction responsiveness
browser leak observation
```

## Baseline scaling measurement

A non-threshold benchmark was added and run against the unoptimized v0.09 recursion representation before any recursion-engine change.

Baseline staging evidence:

```text
workflow run: 35070985111
Node: v22.23.2
runner: ubuntu-24.04 hosted runner
```

Selected observations:

```text
depth 1,000  -> 4.296 ms cumulative expansion
depth 2,500  -> 22.161 ms
depth 5,000  -> 28.474 ms
depth 10,000 -> 97.185 ms
```

At depth 10,000:

```text
retained recursive descriptors: 10,000
forced-GC retained expansion delta: 1.988 MiB
approx temporary expansion allocation: 7.953 MiB
focus creation: 0.065803 ms
sheet organization creation: 1.555229 ms
overlay creation: 0.215357 ms
```

The largest-pair empirical time exponent in this run was `1.771`.

A second run after the representation-safety guard measured depth 10,000 at `125.786 ms`, with the same `1.988 MiB` retained expansion delta and `7.953 MiB` temporary approximation. The largest-pair exponent in that run was `1.495`.

These values are environment-sensitive engineering observations, not performance promises, CI thresholds, or mathematical depth limits.

## Scaling conclusion

The source-level hypothesis that repeated immutable array copying can produce cumulative superlinear work is supported by the measured trend.

However, the measured cost at the chosen 10,000-level engineering horizon remained small enough that a recursion representation rewrite was not justified.

Therefore:

```text
Optimization Decision: no production optimization justified
```

`recursive-lazy-expansion.js` remains unchanged.

No mutable global state, linked list, chunked tree, persistent-vector library, cache, worker, database, or framework state manager was introduced.

## Memory / leak conclusion

Retained recursive memory grows with materialized depth because the current semantic model intentionally preserves one structural descriptor per materialized positive level. That is expected retained state, not a leak by itself.

Forced-GC observations separate retained growth from short-lived copying allocations only approximately. No discarded recursive levels or cache entries exist, so:

```text
leak-from-discarded-levels = not_applicable
```

No browser leak claim is made.

## Large-n numerical audit

The recursion and overlay layers continue to store deep powers symbolically:

```text
{ baseDegree, exponent }
{ baseParameter, towerDepth }
```

No giant `D^n`, `D^(2n)`, or `D^(4n)` evaluation was added.

The audit found one genuine JavaScript representation issue: `Number.isInteger()` accepts integer-valued Numbers beyond the safe-integer range, where precision aliasing is possible.

Minimal production safety change:

```text
scene requestedDepth -> Number.isSafeInteger && >= 0
zoom focus depth     -> Number.isSafeInteger && >= 0
```

`Number.MAX_SAFE_INTEGER` remains valid request/focus metadata. Larger unsafe integers are rejected.

This is an engineering/runtime representation limit, not a mathematical depth theorem.

## Deterministic v0.10 verifier

Added:

```text
verify_performance_infinite_navigation_v0_10.js
```

It verifies:

```text
1,000-level deterministic stress materialization
one call -> at most one new level
materializedDepth and level count/order
immutable prior recursive models
symbolic iterated degree storage
safe-integer depth/focus guards
unavailable focus remains not_materialized
zoom does not materialize
sheet organization does not materialize
overlays do not materialize
D^4 remains scene.derived source-backed runtime metadata
W remains unresolved
geometry remains unresolved
```

The v0.09 arithmetic overlay verifier received only a version-metadata compatibility generalization so that its historical behavioral assertions continue to run at repository versions `v0.09` and later.

## CI policy

The final runtime CI hard gate includes:

```text
v0.03 scene verifier
v0.04 base renderer verifier
v0.05 one-step verifier
v0.06 recursive lazy verifier
v0.07 zoom verifier
v0.08 sheet/branch verifier
v0.09 arithmetic overlay verifier
v0.10 performance/infinite-navigation deterministic verifier
JavaScript syntax checks
```

The environment-sensitive timing/heap benchmark remains a reusable audit/manual artifact and is intentionally not a hard performance threshold in the final canonical workflow.

The `formal-lean` job remains unchanged in theorem scope and must continue to pass.

## Browser evidence

```text
browser smoke/performance = not_tested
```

The Node benchmark is not presented as browser frame-time or browser heap evidence.

## Files

Created:

- `benchmark_performance_infinite_navigation_v0_10.js`
- `verify_performance_infinite_navigation_v0_10.js`
- `docs/PERFORMANCE_INFINITE_NAVIGATION_self_similar_cy_visualizer_v0_10.md`
- `docs/state_self_similar_cy_visualizer_v0_10.json`
- `docs/progress_self_similar_cy_visualizer_v0_10.md`

Modified production/runtime validation:

- `scene-spec.js` only to require safe-integer depth metadata
- `zoom-semantics.js` only to require safe-integer focus metadata

Modified metadata / verification integration:

- `README.md`
- `data/system.json` version metadata to `v0.10`
- `verify_arithmetic_overlays_v0_09.js` version compatibility assertion only
- `.github/workflows/formal-verification.yml` to add the deterministic v0.10 verifier and syntax checks

Unchanged by design:

- `recursive-lazy-expansion.js`
- `base-renderer.js`
- `one-step-pullback.js`
- `sheet-branch-organization.js`
- `arithmetic-overlays.js`
- `app.js`
- all sealed Lean theorem/source files

## Formal boundary

Formal Verification F01–F06 remains sealed. Thread 09 adds no Lean theorem and makes no claim that browser performance, D^4 map degree, geometry, sheets, or arithmetic overlays have become formally verified beyond their existing sealed scope.

## Stopping point

\[
\boxed{\text{deep finite stress evidence does not imply literal infinity}}
\]

\[
\boxed{\text{retained structural state growth does not imply a memory leak}}
\]

\[
\boxed{\text{measured superlinear copying does not justify a rewrite when the tested frontier remains cheap}}
\]

The next natural milestone after canonical v0.10 sealing is **Thread 10 — Mathematical Fidelity Audit**. No Thread 10 work belongs in this milestone.

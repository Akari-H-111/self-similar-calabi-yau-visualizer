# Thread 29 — Ancestor-Scoped Pullback Runtime v0.01

## 0. Purpose

Thread 29 implements the sealed Thread 28 ancestor-scoped pullback contract as a reusable production runtime API.

It is deliberately not a renderer and does not alter the existing Thread 25 global browser runtime. Thread 30 owns visualization.

Canonical parent:

```text
Thread 28 canonical seal
commit  b186705ab0bd6090c9c6ab043b69cf91b692a34b
tree    1b40f39b162eed7d0a01d5a23bd2300e941f7fa8
parent  464885c92d25d5a474dfebd03ca89a7cf16bf8cc
```

Thread 28 status is `canonical_sealed` with decision `ADMITTED`.

## 1. Architectural rule

Thread 29 does not implement another root enumerator or pullback engine.

The production flow is:

```text
canonical Thread 24 sample model
        ↓
selected canonical ancestor IDs
        ↓
Thread 29 metadata validation
        ↓
BigInt exact target-count preflight
        ↓ admitted only
canonical-order scoped sample model
        ↓
sealed Thread 25 GeometricPullbackEngine.generateLevels
        ↓
ancestor-scoped runtime state
```

The exact preflight occurs before the scoped sample is handed to Thread 25 generation.

## 2. Selection contract

The runtime accepts `selectedAncestorIds`, not arbitrary coordinates.

Every selected ID must:

- exist in the canonical Thread 24 ordered sample list;
- occur exactly once in the request;
- preserve canonical Thread 24 source order.

The runtime derives a deterministic presentation/runtime scope identifier from those canonical IDs. The scope identifier is state provenance only. It is not a component, sheet, branch, or covering identifier.

## 3. Exact preflight

For `m` selected ancestors, exponent `D`, and requested scoped depth `n`:

```text
requiredPointCount = m * (D^4)^n
```

Thread 29 performs this calculation with `BigInt` before generation.

If the result exceeds `maxGeneratedPoints`, the runtime throws `AncestorScopedPullbackMaterializationLimitError` without invoking Thread 25 geometric generation.

This is stronger than relying only on Thread 25's per-next-level guard: it proves the entire requested scoped target is admissible before geometry generation begins.

## 4. Under-cap materialization

If preflight succeeds, the runtime constructs a scoped sample model by reusing the exact canonical sample objects at the selected indices. It then calls the existing Thread 25 `generateLevels`.

Therefore all positive-depth points continue to inherit the sealed Thread 25 semantics:

- deterministic point ID;
- parent ID;
- ancestor X_0 sample ID;
- recursive root multi-index path;
- full complex coordinates;
- parent power-map residual;
- inherited base-membership residual;
- complete admitted parent fibers;
- no global completeness claim.

## 5. State separation

The returned runtime state records:

- `scopeId`;
- `selectedAncestorIds`;
- `selectedAncestorCount`;
- `requestedScopedDepth`;
- `materializedScopedDepths`;
- exact target count as a decimal string;
- cap;
- the sealed Thread 25 scene model;
- scope-completeness wording.

It explicitly records:

```text
globalGeometricRenderedDepthMutated = false
structuralRequestedDepthConsumed = false
globalCompletenessClaim = false
```

Thread 29 does not read or mutate `Thread25GeometricPullbackState` and does not introduce any automatic depth synchronization.

## 6. Canonical bounded behavior

For canonical `D=2`, cap `10000`:

```text
one ancestor:
depth 0 = 1
depth 1 = 16
depth 2 = 256
depth 3 = 4096
depth 4 = 65536 -> rejected before generation

two ancestors:
depth 3 = 8192 -> admitted

three ancestors:
depth 3 = 12288 -> rejected before generation
```

These are scope-complete finite recursive pullbacks over selected admitted ancestors. They are not complete global `X_n`.

## 7. Protected truth boundary

Thread 29 does not claim or materialize:

- complete global hypersurface geometry;
- sheets;
- covering structure;
- analytic branches;
- connected components;
- geometric zoom.

Root multi-index remains deterministic enumeration metadata only.

## 8. Production files intentionally unchanged

Thread 29 leaves byte-identical:

- `geometric-pullback-engine.js`;
- `geometric-pullback-runtime.js`;
- `geometric-pullback-fibers.js`;
- Thread 25 config;
- Thread 28 sealed contract and verifier;
- Thread 26 hybrid semantics/runtime;
- Plan v0.03;
- all formal sources;
- renderer/UI/index/README.

## 9. Verification obligations

The Thread 29 verifier must demonstrate:

1. Thread 28 is `canonical_sealed / ADMITTED`;
2. canonical sample generation remains 512 deterministic admitted samples;
3. one ancestor depth 3 materializes 4096 points;
4. two ancestors depth 3 materialize 8192 points;
5. same ancestor/root paths retain identical Thread 25 model points across scopes;
6. every positive-depth level is complete over each materialized parent;
7. ancestry, parent, root-index and residual provenance remain present;
8. one ancestor depth 4 and three ancestors depth 3 are rejected by Thread 29 preflight;
9. a poisoned-coordinate over-cap fixture proves preflight rejection happens before coordinate inspection and before Thread 25 generation;
10. the global Thread 25 canonical X_0/X_1 path still produces 512/8192 and is not mutated;
11. protected blobs remain exact.

## 10. Candidate exit

A green Thread 29 implementation candidate may be sealed only after:

- PR-head Formal Verification succeeds;
- exact-main Formal Verification succeeds;
- Pages succeeds;
- no protected runtime/formal drift is found.

The candidate seal changes metadata only.

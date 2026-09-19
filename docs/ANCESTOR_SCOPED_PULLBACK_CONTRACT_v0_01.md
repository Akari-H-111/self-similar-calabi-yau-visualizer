# Thread 28 — Ancestor-Scoped Pullback Feasibility / Semantics Contract v0.01

## 0. Outcome

Thread 28 is a contract-first milestone. It does not modify production geometry, rendering, navigation, or formal mathematics.

Candidate decision:

```text
ADMITTED_CANDIDATE
```

The candidate is admissible because the sealed Thread 25 engine already accepts a valid finite X_0 sample model whose sample list may be a proper subset of the canonical Thread 24 list. Thread 25's own canonical verifier already exercises a one-seed model through geometric depth 2. Thread 28 extends that evidence to the bounded-depth scope required by Plan v0.03 and formalizes the missing scope/completeness vocabulary.

No second root enumerator, pullback engine, projection, or geometric renderer is introduced.

## 1. Canonical parent

```text
Plan v0.03 opening commit
commit  b3054826148f6f0c02091bbb800cfc2b3fc1db13
tree    0165dda521f990f1a35526646f364d621bea1609
parent  bc92912ad2011e563ca6b072492debe38f17a516
```

Before Thread 28 authoring, the Plan v0.03 commit passed exact-main Formal Verification #214 and Pages #31.

## 2. Existing authority reused

Thread 28 relies only on already-sealed authority:

- Thread 24 supplies the deterministic ordered finite validated sample list in X_0.
- Thread 25 supplies the coordinate-root fiber enumerator, the finite geometric pullback engine, residual checks, deterministic point identifiers, and the exact hard cap.
- The formal Torus4 fiber result supplies the scoped claim that a positive-D point-fiber contains D^4 points.
- Thread 26 supplies the separation between structural state and geometric state.

The new contract is therefore a selection/scope contract over existing objects, not a new mathematical construction.

## 3. Definitions

Let S_0 denote the canonical ordered Thread 24 finite sample list. In the current canonical configuration |S_0| = 512.

### 3.1 Selected ancestor scope

A selected ancestor scope A is a nonempty, duplicate-free ordered subsequence of S_0 that preserves the canonical S_0 source order.

Consequences:

- every selected point was already admitted by Thread 24;
- no arbitrary new X_0 point may enter through the scoped interface;
- a point cannot occur twice in one scope;
- changing selection order cannot create a second deterministic enumeration order.

### 3.2 Ancestor-scoped seed set

```text
S^A_0 = A
```

### 3.3 Ancestor-scoped pullback recurrence

For n >= 0,

```text
S^A_(n+1)
=
union over p in S^A_n of the complete Thread 25 point-fiber P_D^{-1}({p}).
```

The union is implemented by the existing Thread 25 engine. Each included materialized parent contributes its complete admitted D^4 point-fiber. Silent deduplication, incomplete parent fibers, random fallback, and truncation are forbidden.

### 3.4 Scope-complete

A materialized scoped level is **scope-complete** exactly when:

1. every point in the selected ancestor scope participates;
2. every materialized parent at every preceding scoped level contributes its complete admitted D^4 point-fiber;
3. the requested scoped level has not been truncated or randomly sampled.

Scope-complete does **not** mean:

- complete global X_n;
- complete Calabi–Yau hypersurface geometry;
- connected component;
- sheet decomposition;
- covering chart;
- analytic branch.

### 3.5 Global-complete

Thread 28 makes no global-completeness claim. A proper ancestor scope is intentionally smaller than the canonical finite global seed set, and the canonical global X_2 request remains over the existing cap.

## 4. Exact cardinality and preflight

For m = |A| selected ancestors and geometric depth n,

```text
|S^A_n| = m * (D^4)^n.
```

This is a derived finite-construction cardinality using the sealed point-fiber cardinality and complete-fiber recursion. It is not promoted to covering degree.

Preflight is mandatory before a scoped runtime invokes geometric generation.

```text
requiredPointCount = m * (D^4)^requestedScopedDepth

if requiredPointCount <= maxGeneratedPoints:
    request may proceed
else:
    reject before invoking pullback generation
```

Preflight arithmetic must not silently overflow JavaScript Number. Thread 29 must use exact or overflow-safe integer arithmetic.

Because the admitted runtime has D >= 2, scoped point counts are nondecreasing with depth. Therefore, if the requested target depth is under the cap, every earlier scoped depth is also under the cap.

## 5. Canonical D = 2 capacity

For D = 2:

```text
D^4 = 16
maxGeneratedPoints = 10000
```

One selected ancestor gives:

```text
depth 0 = 1
depth 1 = 16
depth 2 = 256
depth 3 = 4096
depth 4 = 65536  -> rejected
```

The maximum admitted ancestor counts at selected target depths under the current cap are:

```text
depth 0: min(512, floor(10000 / 1))    = 512
depth 1: min(512, floor(10000 / 16))   = 512
depth 2: min(512, floor(10000 / 256))  = 39
depth 3: min(512, floor(10000 / 4096)) = 2
depth 4: floor(10000 / 65536)          = 0
```

Thus multiple selected ancestors are admitted in principle. In particular, two ancestors at scoped depth 3 require 8192 points and remain under cap, while three require 12288 and must be rejected before generation.

## 6. Executable feasibility evidence

The Thread 28 verifier must establish all of the following using the existing sealed engine:

1. regenerate the canonical Thread 24 X_0 sample list and obtain 512 samples;
2. form a one-ancestor sample model from an actually admitted canonical sample;
3. generate scoped depths 0 through 3 and obtain exactly 1, 16, 256, 4096 points;
4. confirm complete parent fibers at every positive depth;
5. confirm every descendant retains the selected canonical ancestorSampleId;
6. confirm all generated point IDs are unique;
7. confirm the exact scoped depth-4 count is 65536 and exceeds the cap;
8. confirm a 4096-parent next-level request throws the Thread 25 materialization-limit error before any parent coordinate is inspected;
9. form a two-ancestor canonical scope and verify depth 3 materializes exactly 8192 points;
10. confirm the one-ancestor descendants are identifier/coordinate-stable when the same ancestor is included in the two-ancestor scope;
11. confirm three ancestors at depth 3 preflight to 12288 and are rejected by the scope contract;
12. keep Thread 25 production engine/runtime/config and Thread 26 hybrid semantics byte-identical.

## 7. Identifier policy

The existing Thread 25 point ID is deterministic from the canonical ancestor sample ID plus the recursive root-index path.

Thread 28 therefore admits reusing the same **model point ID** for the same admitted ancestor and root path in global and scoped geometric construction. Inventing a parallel scoped point-ID scheme would create unnecessary duplicate identity.

Scoped UI/runtime state must still carry a separate scope identifier or selected-ancestor set. Point-ID reuse does not imply:

- structural object identity;
- sheet identity;
- connected-component identity;
- covering identity;
- that the same point is currently materialized in the global view.

## 8. Depth state

Thread 28 introduces the semantic names:

- requestedScopedDepth;
- materializedScopedDepths;
- selectedAncestorScope.

They are separate from:

- structural requested/materialized/selected/focused depth;
- Thread 25 global geometric rendered depth.

No automatic synchronization is admitted.

## 9. Production boundary

Thread 28 does not authorize production changes.

It specifically does not modify:

- geometric-pullback-engine.js;
- geometric-pullback-runtime.js;
- Thread 25 global X_0/X_1 behavior;
- projection semantics;
- renderer behavior;
- hybrid navigation;
- the hard cap;
- formal files.

Thread 29 may implement the scoped runtime only after this contract is canonically sealed.

## 10. Preserved truth flags

```text
completeGlobalHypersurfaceRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
```

Root multi-index remains deterministic fiber-enumeration metadata only.

## 11. Candidate exit verdict

If the Thread 28 verifier passes in PR-head CI and exact-main CI without protected-blob drift, this contract may receive a metadata-only canonical seal with:

```text
status   = canonical_sealed
decision = ADMITTED
```

Only then is Thread 29 authorized.

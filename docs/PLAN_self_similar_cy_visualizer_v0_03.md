# Self-Similar Calabi–Yau Visualizer — Engineering Plan v0.03

## Provenance and opening gate

Plan v0.03 begins only after the post-hybrid audit/repair sequence is canonically sealed.

Canonical opening point:

```text
Thread 27R canonical seal
commit  bc92912ad2011e563ca6b072492debe38f17a516
tree    347164e79a96d63e9ac6c4438f7463073f1766c2
parent  abf3843c836e3dd22b028db7b4b43f81757a34ea
```

Verified before this plan opens:

- Thread 27R repair PR #36 merged as `abf3843c836e3dd22b028db7b4b43f81757a34ea`;
- implementation exact-main Formal Verification #210 / run `35432686478`: success;
- implementation Pages #29 / run `35432686072`: success;
- Thread 27R metadata-only seal PR #37 merged as `bc92912ad2011e563ca6b072492debe38f17a516`;
- seal PR-head Formal Verification #211 / run `35432888178`: success;
- seal exact-main Formal Verification #212 / run `35433056559`: success;
- seal Pages #30 / run `35433056342`: success.

Plan v0.02 ended with Thread 26 — Hybrid Structural / Geometric Navigation. Thread 27 then performed the required post-hybrid canonical audit, and Thread 27R repaired and sealed the current-state provenance drift found by that audit.

Plan v0.03 therefore starts from the repaired, verified post-hybrid state. It does not retroactively rewrite Threads 22–27R.

## Fixed current truth boundary

The following remain canonical constraints at the opening of v0.03.

### Structural context

```text
data/system.json
schemaVersion = 1
W representation = unresolved
structural presentation context only
```

### Geometric context

```text
data/system.v2.json
schemaVersion = 2
formulaId = W_kappa_torus4_v1
finite sampled X_0 projection = admitted
finite sampled X_1 pullback = admitted
```

The geometric context renders finite sampled geometry, not the complete global hypersurface.

### Canonical materialization boundary

For the canonical Thread 24 seed and D = 2:

```text
X_0 finite seed sample count = 512
X_1 finite pullback count   = 8192
full canonical X_2 request  = 131072
maxGeneratedPoints          = 10000
beyondCap                   = reject_without_partial_materialization
```

The full canonical X_2 request remains forbidden under the current production cap.

Thread 25 already verifies recursive correctness on a one-seed fixture:

```text
depth 0 = 1
depth 1 = 16
depth 2 = 256
```

Because the admitted torus point-fiber cardinality is D^4 and the canonical D is 2, the natural one-seed continuation counts are:

```text
depth 3 = 4096
depth 4 = 65536
```

These two counts are planning arithmetic, not a new production claim. Thread 28 must verify the corresponding runtime/materialization semantics before any production feature may rely on them.

### Protected truth flags

Until a later thread explicitly proves and seals a replacement contract:

```text
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
completeGlobalHypersurfaceRendered = false
```

A root multi-index remains deterministic fiber-enumeration metadata only. It is not a sheet identity, branch identity, connected-component label, or covering chart.

Structural requested/materialized depth and geometric rendered depth remain independent. Cross-layer navigation remains explicit only.

## Engineering rule

One thread completes exactly one verifiable milestone.

A later thread may consume only the sealed public contract of an earlier thread. It must not silently strengthen an earlier claim, mutate historical provenance, or introduce a second implementation of an already-sealed mathematical operation when the existing implementation can be reused.

In particular:

- reuse the existing Thread 25 geometric pullback engine rather than creating a second root-enumeration algorithm;
- preserve the Thread 23 projection unless a later dedicated projection thread explicitly changes it;
- preserve the 10,000-point hard cap unless a dedicated capacity contract later replaces it;
- reject over-cap requests before partial generation;
- do not use random truncation, incomplete parent fibers, or presentation-only sampling while describing the result as a complete pullback level;
- do not modify the Gate 2-C sealed README snapshot as incidental cleanup;
- require PR-head CI, exact-main CI, and Pages verification for every implementation milestone that changes the deployed application.

## v0.03 objective

The v0.03 objective is:

> expose deeper, bounded, truthful pullback geometry by scoping recursion to selected admitted ancestry, while preserving the global finite-sample semantics and all existing no-sheet / no-covering / no-geometric-zoom boundaries.

The preferred direction is ancestor-scoped geometry because it reuses the existing exact fiber enumerator and avoids pretending that an arbitrary truncation of the 512-seed global pullback is the complete X_n.

No implementation thread after Thread 28 is authorized unless Thread 28 seals an admissible scope/completeness contract.

---

# Milestones

## Thread 28 — Ancestor-Scoped Pullback Feasibility / Semantics Contract

### Purpose

Determine whether a selected admitted X_0 ancestor can define a separate, bounded recursive geometric view whose complete fibers fit under the existing production cap for useful positive depths.

This is a contract-first milestone.

### Required work

Thread 28 must begin read-only against the Thread 27R seal and inspect the existing:

- Thread 24 admitted X_0 samples;
- Thread 25 pullback engine/runtime;
- Thread 25 one-seed recursive verifier;
- Thread 26 hybrid correspondence contract;
- current hard-cap enforcement.

It must define, without ambiguity:

- global finite seed set;
- selected ancestor scope;
- ancestor-scoped seed set;
- scope-complete pullback;
- global-complete versus scope-complete;
- requested scoped depth;
- materialized scoped depths;
- generated point ancestry;
- exact preflight cardinality;
- over-cap rejection;
- whether multiple selected ancestors are admissible;
- whether a scoped result may reuse the existing point IDs or requires namespaced scoped IDs.

### Required verification

At minimum, using the existing canonical D = 2 rules, verify by executable tests rather than prose-only reasoning:

```text
one selected X_0 ancestor
depth 0 -> 1
depth 1 -> 16
depth 2 -> 256
depth 3 -> 4096
depth 4 -> 65536 -> reject before generation under the current cap
```

The verifier must prove that every included parent fiber is complete and that no request is partially materialized after the cap is known to be exceeded.

### Forbidden work

Thread 28 must not:

- change production rendering;
- change the global Thread 25 X_0/X_1 path;
- raise the hard cap;
- add random or deterministic truncation of a claimed complete level;
- claim selected ancestry is a connected component;
- promote root tuples to sheets;
- add covering semantics;
- add geometric zoom;
- synchronize structural and geometric depth automatically.

### Exit gate

Thread 28 may close only with one of two outcomes:

1. **ADMITTED**: a precise ancestor-scoped scope/completeness contract is sealed and executable tests demonstrate the bounded depth behavior; or
2. **NO-GO**: no truthful bounded contract is accepted, and Threads 29–31 remain blocked.

---

## Thread 29 — Ancestor-Scoped Pullback Runtime

**Conditional on Thread 28 = ADMITTED.**

### Purpose

Implement the sealed ancestor-scoped pullback contract by orchestrating the existing Thread 25 engine.

### Required design

The runtime must:

- reuse the existing coordinate-root and fiber enumeration implementation;
- accept only admitted ancestor selections;
- preflight exact requested cardinality before generation;
- materialize complete fibers for all included parents;
- preserve parent ID, ancestor X_0 sample ID, root multi-index, full coordinates, residual validation, depth, and projection provenance;
- keep the canonical global X_0/X_1 runtime path unchanged;
- distinguish global materialization state from scoped materialization state;
- reject a scoped request that exceeds the current cap before generating a partial next level.

### Canonical bounded target

If Thread 28 confirms the one-ancestor contract, the expected canonical bounded scope is:

```text
scoped depth 0 = 1
scoped depth 1 = 16
scoped depth 2 = 256
scoped depth 3 = 4096
scoped depth 4 = rejected under maxGeneratedPoints = 10000
```

These are counts of finite recursively generated preimage points from the selected admitted ancestor. They are not counts of the complete global X_n.

### Exit gate

Thread 29 closes only when deterministic runtime tests, residual checks, cap rejection, provenance preservation, and regression tests for the existing global path all pass.

---

## Thread 30 — Ancestor-Scoped Geometric Visualization

**Conditional on Thread 29 canonical closure.**

### Purpose

Render the bounded ancestor-scoped runtime as a truthful geometric view.

### Required presentation semantics

The renderer must visibly distinguish:

- global finite sampled X_0 / X_1 geometry;
- selected ancestor;
- ancestor-scoped recursive pullback geometry;
- scoped depth;
- source ancestor provenance;
- parent provenance;
- root multi-index metadata;
- projection overlap metadata.

The UI must state that the scoped view is the complete recursive pullback of the selected finite ancestor scope under the admitted engine, not the complete global X_n.

### Reuse constraints

Prefer the existing geometric renderer and Thread 23 projection.

A second geometric renderer, second projection semantics, or second pullback engine requires a demonstrated incompatibility with the existing architecture.

### Forbidden claims

The renderer must not visually or textually imply:

- sheet decomposition;
- covering charts;
- analytic branch continuation;
- connected-component decomposition;
- source self-intersection from projected overlap;
- complete global X_n;
- geometric zoom.

### Exit gate

Browser evidence must verify canonical scoped depths through the maximum admitted under-cap depth and verify over-cap refusal without partial marks.

---

## Thread 31 — Hybrid Navigation II: Global / Scoped Geometry Bridge

**Conditional on Thread 30 canonical closure.**

### Purpose

Extend Thread 26 navigation so a user can move explicitly between:

- global structural stage context;
- global finite sampled geometric context;
- ancestor-scoped geometric context.

### Required boundary

Navigation remains explicit and presentation-level.

The bridge may preserve and expose ancestry provenance, but it must not create:

- structural node = geometric point identity;
- structural branch = root tuple identity;
- selected ancestor = connected component identity;
- root tuple = sheet identity;
- automatic structural/geometric depth synchronization.

Representation changes must not trigger hidden geometric generation beyond an explicitly requested scoped action.

### Exit gate

The hybrid state machine must preserve independent global structural depth, global geometric depth, and scoped geometric depth, with browser tests covering transitions and back-navigation.

---

## Thread 32 — Mathematical / Visual Fidelity Audit III

### Purpose

Perform an independent read-only-first audit of the v0.03 geometry expansion before any release-style checkpoint.

### Required audit targets

Audit at minimum:

- scope-complete versus global-complete wording;
- cap and preflight behavior;
- no partial-fiber invariant;
- ancestry provenance;
- root multi-index semantics;
- global/scoped state separation;
- projection-overlap wording;
- structural/geometric/scoped correspondence claims;
- no-sheet / no-covering / no-geometric-zoom boundaries;
- current-state public wording;
- verifier blind spots;
- browser evidence and exact-main lineage.

Any demonstrated semantic regression blocks further release work and must be repaired in a dedicated R thread before proceeding.

---

## Thread 33 — v0.03 Geometric Preview Checkpoint

**Conditional on a clean Thread 32 audit.**

### Purpose

Freeze the v0.03 bounded scoped-geometry milestone as a reproducible public checkpoint.

This is not permission to claim a complete Calabi–Yau hypersurface renderer, covering-space visualization, or sheet decomposition.

### Exit gate

Require:

- exact canonical commit identity;
- PR-head verification;
- exact-main verification;
- Pages deployment;
- browser evidence for global and scoped geometry;
- reproducible cap behavior;
- preserved historical release provenance;
- no unresolved Thread 32 blocker.

---

# Plan-wide no-go boundaries

Plan v0.03 does not authorize:

- complete canonical X_2 materialization from all 512 X_0 seeds under the current 10,000-point cap;
- partial materialization presented as a complete level;
- random sampling fallback;
- global sheet tracking;
- covering animation;
- analytic branch tracking;
- automatic structural/geometric depth synchronization;
- geometric zoom;
- a new projection family;
- a new mathematical theorem merely to justify a UI feature;
- retroactive rewriting of historical Thread 22–27R status/provenance.

If any later feature requires one of these, it must first receive its own explicit semantics/admission milestone rather than being smuggled into an implementation thread.

## Immediate next milestone

```text
Thread 28 — Ancestor-Scoped Pullback Feasibility / Semantics Contract
```

Thread 28 is the only authorized implementation-planning milestone after Plan v0.03 opens.

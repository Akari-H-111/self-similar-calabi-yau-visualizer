# Mathematical Fidelity Audit - Self-Similar Calabi-Yau Visualizer v0.11

## 1. Audit scope

This document closes the repository-side evidence audit for **Thread 10 - Mathematical Fidelity Audit**.

Starting canonical baseline:

```text
repository: Akari-H-111/self-similar-calabi-yau-visualizer
branch: main
commit: 7f43dc1b1445e0ded12e1ea185f75230bc68cded
message: perf: audit v0.10 infinite-navigation scaling
sole parent: ddbcd159cdcd5eefa7c6980ef21d401eaf42bcb7
```

Starting canonical workflow evidence:

```text
run id: 35071832829
head branch: main
head sha: 7f43dc1b1445e0ded12e1ea185f75230bc68cded
status: completed
conclusion: success
runtime-contracts: completed / success
formal-lean: completed / success
```

The audit question is not whether the displayed formulas look plausible. The audit question is:

```text
For every mathematical-looking runtime/UI/documentation claim,
what exact canonical evidence supports that claim,
and how strong may the repository truthfully state it?
```

No new mathematical theorem is introduced by v0.11.

## 2. Canonical source hierarchy

Source priority for this audit is:

```text
1. current canonical GitHub repository source
2. sealed Lean source in the repository
3. exact retrieved canonical parent-project artifact
4. exact validation / manifest / audit artifact
5. explicit mathematical derivation performed and recorded in this thread
6. model inference
7. conversation memory
```

Levels 6 and 7 are never treated as canonical evidence.

The presence of a filename in a prompt is not evidence that the file was retrieved. An exact artifact must be returned by an actual source tool before it may support a theorem-level or parent-project-level claim.

## 3. Claim classification system

Thread 10 uses the requested eight evidence classes:

| Class | Meaning |
| --- | --- |
| A | Runtime representation: a field, descriptor, label, symbolic expression, or runtime object exists. |
| B | Runtime engineering contract: implementation behavior or architecture is intentionally specified. |
| C | Deterministically verified runtime property: a Node verifier or CI assertion mechanically checks the repository behavior. |
| D | Lean-formalized theorem or definition: exact sealed Lean source establishes the stated formal fact. |
| E | Parent-project mathematically proved result: exact retrieved canonical parent artifact establishes the result. |
| F | Heuristic / visualization convention: a useful display convention without theorem status. |
| G | Unresolved / unavailable: representation or source is intentionally absent or exact evidence was not retrieved. |
| H | Explicitly false or overclaimed: wording exceeds the evidence currently available. |

The classes are not mutually exclusive. A runtime representation may be A+B+C while the corresponding mathematical relation is also D. Conversely, a numeric value may be A+B+C and still not have a D or E interpretation.

Additional reporting terms used in the final audit are:

```text
formally proved
runtime-verified
source-backed
representational
heuristic
unresolved
not tested
not available
```

## 4. Mathematical Fidelity Ledger

| Runtime / claim | Intended referent | Canonical evidence | Class | Maximum claim strength currently allowed |
| --- | --- | --- | --- | --- |
| `parameters.D` | coordinate-power exponent | `scene-spec.js`; Lean `D : ℕ` in formal modules | A+B+C+D with domain mismatch | Runtime accepts safe integer `D >= 2`; Lean statements hold for `D : ℕ`. Do not identify the two domains without the runtime restriction. |
| `parameters.lambda` | level parameter named `lambda` | `data/system.json`, `scene-spec.js` | A+B+C | Validated finite runtime scalar. Sealed Lean core gives it no mathematical meaning. |
| `parameters.kappa` | retained project scalar | `data/system.json`, v0.03 scene specification | A+B+C+G | Validated finite scalar; mathematical semantics remain unresolved in this visualizer contract. |
| `pullbackMap.kind = coordinate_power`, coordinate count 4, exponent parameter `D` | four-coordinate power transformation | runtime schema plus `CoordinatePower.lean` | A+B+C+D | Exact bridge at the coordinate transformation level. |
| `coordinatePower_unique` | uniqueness of map satisfying coordinate rule | `CoordinatePower.lean` | D | Formally proved in Lean; there is no runtime theorem counterpart. |
| `coordinate_iterate_rule` | coordinate formula for the `n`-fold iterate | `CoordinatePowerIteration.lean` plus v0.09 provenance verifier | A+C+D | Formally proved coordinate iterate rule; runtime exposes a symbolic annotation only. |
| one-step `relation = inverse_image`, depth 1 | `X_1 = P_D^{-1}(X)` structurally | runtime v0.05 contract plus `PullbackTower.lean` recurrence | A+B+C+D | Exact structural bridge. Runtime object is a descriptor, not a formal `Set Point4` or realized variety. |
| recursive `depth`, `sourceDepth`, inverse-image relation | repeated pullback recurrence | runtime v0.06 plus `pullbackTower_succ` | A+B+C+D | Structural recurrence is formally backed; lazy materialization mechanics are engineering-only. |
| `requestedDepth` | requested materialization target | runtime source/verifiers | B+C | Engineering request metadata, not mathematical tower depth itself. |
| `materializedDepth` | current runtime structural frontier | runtime source/verifiers | B+C | Engineering state, not a theorem about existence or geometry of `X_n`. |
| closed-form pullback tower documentation | preimage under the `n`-fold iterate | `pullbackTower_eq_iterate_preimage`, `pullbackTower_eq_coordinatePower_preimage` | D plus representational bridge | Formally proved for arbitrary `X : Set Point4`; runtime does not construct the actual set or combined map object. |
| `derived.metricScale = D^2` | numeric D-squared metadata | `scene-spec.js`, runtime verifier | A+B+C | Runtime numeric metadata only. No current Lean metric theorem. |
| `formalMetricScaleExpression = {(D^2), n}` | symbolic expression `(D^2)^n` | `zoom-semantics.js`, verifier | A+B+C | Symbolic runtime metadata. Legacy `formal` identifier does not mean formally proved metric scaling. |
| `derived.sheetDegree = D^4` | numeric D-fourth-power organization metadata | `scene-spec.js`, F05 bridge audit, v0.08 contract | A+B+C | Runtime numeric/organizational metadata. Do not call it a genuine map degree without new exact evidence. |
| legacy `mapDegree`, `mapDegreePerStep` | reuse of `scene.derived.sheetDegree` | runtime v0.05/v0.06 source | A+B+C | Compatibility field names only. Current canonical interpretation is D-fourth-power runtime metadata, not a degree theorem. |
| `iteratedDegreeExpression = {baseDegree: D^4, exponent: n}` | symbolic numeric expression `(D^4)^n` | runtime v0.06/v0.10 | A+B+C | Symbolic expression only. It is not a formally established iterated map-degree theorem. |
| sheet/branch organization descriptors | aggregate organization for already-materialized levels | `sheet-branch-organization.js`, v0.08 verifier | A+B+C+F | Organizational convention only. No concrete sheets, fibers, branches, covering, or geometry. |
| `sheetsMaterialized = false` | explicit absence of concrete sheets | runtime source/verifiers | B+C | Deterministically verified non-claim. |
| `coveringStructureClaimed = false` | explicit absence of covering claim | runtime source/verifiers | B+C | Deterministically verified non-claim. |
| zoom focus fields | structural navigation / focus | `zoom-semantics.js`, v0.07 verifier | A+B+C | Navigation metadata only. |
| `geometricZoomApplied = false`, `cameraTransformApplied = false` | no geometric zoom/camera realization | runtime source/verifiers | B+C | Deterministically verified non-claim. |
| `coordinate_channels` overlay | four symbolic coordinate channels | runtime overlay plus exact `CoordinatePower.lean` provenance | A+C+D | Source-backed structural representation with formal support for the coordinate carrier/map. |
| `coordinate_iterate_rule` overlay | symbolic `D^n` coordinate exponent rule | runtime overlay plus exact iteration theorem | A+C+D | Formally backed symbolic annotation. |
| `cyclotomic_refinement` | future arithmetic overlay | no exact source retrieved for visualizer integration | G | Unavailable / deferred. |
| torsion labels/loci/cosets | future arithmetic overlay | no exact source retrieved for visualizer integration | G | Unavailable / deferred. |
| collision classes/loci | future arithmetic overlay | no exact source retrieved for visualizer integration | G | Unavailable / deferred. |
| `Delta_n` / divisor marking | future arithmetic overlay | no exact source retrieved for visualizer integration | G | Unavailable / deferred. |
| pair discriminants, triple collisions, four-coordinate compatibility, positive-dimensional torsion families | candidate parent-project mathematics | exact parent artifacts unavailable in this thread | G | Not source-verified in Thread 10. No runtime implementation. |
| `W` symbol | defining-function name carried by project-level notation | runtime schema only | A+G | Symbol is represented; function itself is unresolved. |
| `X = W^{-1}(lambda)` in repository prose | project-level structural statement | existing repository history; no sealed Lean `W` definition; parent source unavailable | A+G | May be retained as project notation, but Thread 10 does not call it a sealed Lean theorem or newly source-verified parent theorem. |
| `geometryRendered = false` | absence of geometric realization | runtime source/verifiers | B+C | Deterministically verified non-claim. |
| "infinite navigation" | arbitrarily continued finite structural navigation | v0.10 source/verifier/docs | B+C | Engineering semantics only. No literal infinity claim. |
| benchmark horizons through 10,000 | Node timing/heap observations | v0.10 benchmark artifacts | B | Environment-sensitive engineering evidence, not theorem, limit, or proof of scalability to infinity. |
| `Number.isSafeInteger` depth/focus guards | JS representation safety | v0.10 runtime/verifier | B+C | Engineering safety constraint only. |
| green `formal-lean` CI | sealed Lean build/direct compile/placeholder gate succeeded | GitHub Actions workflow/job | C over build discipline | Evidence that the scoped Lean project passes CI, not evidence that all visualizer mathematics is formalized. |
| green `runtime-contracts` CI | JS contracts and claim discipline pass | GitHub Actions workflow/job | C | Runtime/repository verification only, not mathematical proof. |

## 5. Lean-proved claims

The sealed Lean boundary consists of three mathematical modules.

### CoordinatePower

`formal/SelfSimilarCY/CoordinatePower.lean` defines:

```lean
abbrev Point4 := Fin 4 → ℂ

def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

and proves:

```text
coordinatePower_apply
coordinatePower_unique
```

The source itself explicitly excludes `W`, tower geometry, torus restrictions, map degree, metric scaling, and iteration from that module's scope.

### CoordinatePowerIteration

`formal/SelfSimilarCY/CoordinatePowerIteration.lean` proves:

```lean
(coordinatePower D)^[n] z i = z i ^ (D ^ n)
```

and:

```lean
(coordinatePower D)^[n] = coordinatePower (D ^ n)
```

### PullbackTower

`formal/SelfSimilarCY/PullbackTower.lean` defines an abstract tower of ordinary set preimages and proves:

```lean
pullbackTower D X n = ((coordinatePower D)^[n]) ⁻¹' X
```

and:

```lean
pullbackTower D X n = (coordinatePower (D ^ n)) ⁻¹' X
```

The source explicitly excludes Calabi-Yau geometry, map-degree theorems, sheet models, covering structures, and metric claims.

Therefore the truthful compact description is:

```text
the sealed Lean core formally verifies the explicitly scoped
coordinate-power / iteration / abstract set-theoretic pullback-tower contracts
```

The unqualified phrase `the visualizer is formally verified` is not permitted by this audit.

## 6. Runtime-only representations

The following are primarily runtime/engineering concepts rather than Lean mathematical objects:

```text
requestedDepth
materializedDepth
expansionComplete
expandOneLevel scheduling
immutability/frozen model behavior
requestedFocusDepth
focusedDepth
focusAvailable
organizationStatus
overlay toggle state
DOM dataset state
JavaScript safe-integer guards
performance benchmark timings and heap observations
```

`level.depth` can denote the same index used by the mathematical tower, but the runtime descriptor itself is not the mathematical set `X_n`.

The same warning applies to fields whose historical names sound mathematical:

```text
metricScale
sheetDegree
mapDegree
mapDegreePerStep
iteratedDegreeExpression
formalMetricScaleExpression
```

Their current allowed interpretation is determined by the ledger, not by their identifier names.

## 7. Parent-project-proved but not Lean-formalized claims

No claim is promoted into evidence class E by Thread 10.

This does not assert that the parent Arithmetic Self-Similar Calabi-Yau project lacks such theorems. It records only that the required exact parent artifacts were not successfully retrieved through the source surfaces available to this thread.

Accordingly, Thread 10 refuses to reconstruct parent theorems from conversation memory.

## 8. Visualization conventions

Current visualization/organization conventions are intentionally weak:

```text
one aggregate organization descriptor per materialized positive depth
D^4 value reused as nominal runtime organization metadata
structural focus called zoom semantics, but no geometric zoom occurs
ordinary DOM status text is the rendering surface
```

These conventions are useful for organizing the eventual visualizer but are not geometric realizations.

No Canvas/SVG scene geometry, Three.js, WebGL, GPU buffers, camera transform, mesh, fiber model, or covering renderer exists in v0.11.

## 9. Unresolved claims

The following remain unresolved in the current visualizer contract:

```text
concrete W representation
base hypersurface geometry
resolved Calabi-Yau geometry
metric realization and pullback metric theorem
genuine map degree
genuine D^4 sheets
covering-space structure
étale structure
fiber geometry
torus/nonvanishing restriction in the Lean core
browser geometric correctness
```

`W = unresolved` remains an explicit contract rather than a missing implementation accidentally treated as complete.

## 10. Unavailable-source claims

Thread 10 attempted exact retrieval of the requested parent-project artifacts but did not obtain them. The missing exact filenames are:

```text
README_arithmetic_self_similar_cy_final.md
final_audit_arithmetic_self_similar_cy.md
handoff_arithmetic_self_similar_cy_final.md
state_arithmetic_self_similar_cy_final.json
dependency_graph_arithmetic_self_similar_cy.json
verify_self_similar_closure_final.py
Arithmetic_Self_Similar_Calabi_Yau_final.tex
validation_arithmetic_self_similar_cy_final.txt
manifest_arithmetic_self_similar_cy_final.json
```

Therefore any theorem requiring those files is marked:

```text
canonical parent source unavailable in current thread
not source-verified in this thread
```

This is a source-availability statement, not a mathematical negation.

## 11. Overclaim corrections

### Historical wording preserved

Historical artifacts are not rewritten. In particular:

- v0.03 refers to D-fourth-power data using `sheet degree` language and mentions later metric/degree identities as the motivation for derived fields;
- v0.05 calls `scene.derived.sheetDegree` a map degree;
- v0.06 describes `(D^4)^n` using degree-multiplicativity language.

The later sealed F05 Contract Bridge Audit explicitly classifies D², D⁴, and `(D^4)^n` mathematical interpretations as `UNFORMALIZED`. That later audit is the current canonical interpretation.

### Live wording repaired in v0.11

Current user-facing/runtime text was repaired where it still exceeded the evidence:

```text
old live wording: derived map degree = D^4
new live wording: D^4 runtime metadata ... not a map-degree theorem in the current formal scope
```

The current page also replaces bare `D²` / `D⁴` labels with:

```text
D² runtime metadata
D⁴ organization metadata
```

and labels the sheet/branch section as organization metadata.

Legacy runtime property names are preserved to avoid architecture churn. Their interpretation is constrained by the v0.11 ledger and verifier.

## 12. Remaining fidelity risks

The main remaining risks are semantic drift rather than known mathematical contradictions:

1. Legacy identifiers such as `mapDegree` or `formalMetricScaleExpression` can be misread if consumed without the v0.11 scope documentation.
2. Historical documents contain stronger terminology than the current canonical interpretation.
3. Exact parent-project evidence is not present in this thread, so future arithmetic integration must repeat source retrieval rather than cite memory.
4. `X = W^{-1}(lambda)` remains project notation without a sealed Lean `W` model.
5. Browser runtime/performance observation is still `not_tested`; Node evidence must not be relabeled as browser evidence.

These risks are controlled by the deterministic v0.11 claim-discipline verifier and by explicit non-claims below.

## 13. Explicit non-claims

v0.11 does not claim:

```text
that the whole visualizer is formally verified
that W is implemented or formalized
that X is a formally defined Calabi-Yau hypersurface in Lean
that smoothness, connectedness, or étaleness is proved by this repository
that deg(P_D) = D^4 is proved in the sealed Lean core
that D^4 genuine sheets are materialized or proved
that a covering-space or fiber structure is implemented
that P_D^* g_log = D^2 g_log is proved in the sealed Lean core
that symbolic (D^4)^n metadata proves an iterated map degree
that structural focus is geometric zoom
that Node benchmark horizons are mathematical depth limits
that finite stress tests prove literal infinite scalability
that unavailable cyclotomic/torsion/collision mathematics has been reconstructed
that browser performance or browser heap behavior has been tested
```

## 14. Thread 10 seal criteria

Repository-side Thread 10 completion requires:

```text
[ ] exact starting main baseline verified
[ ] starting canonical CI verified green
[ ] complete claim inventory recorded
[ ] runtime / theorem / Lean / parent-source layers separated
[ ] D / D² / D⁴ audited
[ ] pullback and recursive semantics audited
[ ] zoom / sheet / branch semantics audited
[ ] arithmetic overlays audited
[ ] W remains explicitly unresolved with evidence
[ ] parent source unavailability recorded
[ ] live overclaims minimally repaired
[ ] verify_mathematical_fidelity_v0_11.js passes
[ ] historical v0.03-v0.10 runtime regressions pass
[ ] JavaScript syntax checks pass
[ ] Lean sources remain unchanged
[ ] exactly one canonical main milestone commit is produced from the starting baseline
[ ] exact final main SHA runtime-contracts completes successfully
[ ] exact final main SHA formal-lean completes successfully
```

The v0.11 JavaScript verifier verifies repository **claim discipline**. It is not a substitute for mathematical proof.

Only after the exact final canonical main SHA has both CI jobs `completed / success` may Thread 10 be reported as sealed.

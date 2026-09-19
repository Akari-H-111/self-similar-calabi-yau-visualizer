# F14 — Analytic Regular-Level / Implicit-Function Bridge Feasibility v0.01

Status: **PASS — Analytic local level-set bridge established**

Theorem level: **F14-C**, with an additional local kernel-parametrization package.

This artifact records the formal result of Thread F14. It deliberately does **not** claim a smooth-submanifold theorem, manifold submersion, scheme-theoretic smoothness, finite étale geometry, or smoothness of all pullback levels.

## 1. Canonical ancestry

F14 was built from the exact sealed F13 canonical parent:

```text
commit: c64443eff3eae8853cbdcae972d7e6772c10f701
tree:   70b3687339b5b4a23ba28b2e35c04d6a4c2ea9c8
level:  PASS / Level 2 — Differential Regularity Bridge
```

Branch:

```text
formal-f14-analytic-regular-level-feasibility
```

F13x was used only as archaeology/API evidence. It is not in the F14 ancestry.

The final formal implementation head before documentation is:

```text
commit: 9069631bb2a4766a9e8a4c94a9056a51dd1ed1c8
tree:   12064de0b5eedfc7ac161a59ab66e4618d7b6169
module blob:
formal/SelfSimilarCY/LaurentImplicit.lean
65a3315864533a5d016fee50ecb9ec0da0313828
```

## 2. Pinned environment

```text
Lean:    leanprover/lean4:v4.34.0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

Pinned API used from `Mathlib/Analysis/Calculus/Implicit.lean`:

```text
HasStrictFDerivAt.implicitFunction
HasStrictFDerivAt.implicitToOpenPartialHomeomorph
implicitToOpenPartialHomeomorph_fst
implicitToOpenPartialHomeomorph_self
mem_implicitToOpenPartialHomeomorph_source
mem_implicitToOpenPartialHomeomorph_target
map_implicitFunction_eq
implicitFunction_apply_image
eq_implicitFunction
tendsto_implicitFunction
```

No unverified newer mathlib API was imported.

## 3. Reused unchanged from sealed F13

F14 reuses, without modifying the sealed theorem files:

```text
laurentWPoint
laurentTotalDifferential
laurentWPoint_toPoint4
laurentTotalDifferential_surjective_on_baseFiber
laurentTotalDifferential_surjective_on_baseFiber_of_regular_regime
```

Sealed F13 blobs remain:

```text
formal/SelfSimilarCY/BaseFiber.lean
4561545d5a7443a9d307b9d6f6acc81aa02f9b8a

formal/SelfSimilarCY/LaurentCritical.lean
caf9e0af928a76cb6bc14ab2d7d24c68a98b10d6

formal/SelfSimilarCY/LaurentDifferential.lean
f3a27de774ecaa3b0e232f1fe7f0b06d381da55b
```

## 4. Canonical C¹ / strict-derivative bridge

F14 proves:

```lean
laurentWPoint_contDiffAt
laurentWPoint_hasStrictFDerivAt
laurentTotalDifferential_range_eq_top
```

The strict derivative is exactly the sealed F13 `laurentTotalDifferential`; F14 introduces no duplicate derivative formula.

The regularity proved here is the minimum C¹/strict-Fréchet bridge required by the pinned IFT. F14 does not claim a separate `AnalyticAt`/holomorphic power-series theorem.

## 5. Pinned implicit-function objects

F14 canonically defines and verifies:

```lean
laurentImplicitFunction
laurentImplicitChart
laurentImplicitChart_fst
laurentImplicitChart_base_mem_source
laurentImplicitChart_base_mem_target
laurentImplicitChart_apply_base
laurentImplicitFunction_apply_base
```

Thus the pinned local chart has the form

```text
Point4 ↔local ℂ × ker(laurentTotalDifferential κ z)
```

with first coordinate exactly `laurentWPoint κ`.

## 6. Torus / ambient representation bridge

The IFT lives on `Point4`, while `baseFiber` is a subset of `Torus4`. F14 therefore adds only a neutral representation bridge:

```lean
ambientTorusLocus
Torus4.toPoint4_mem_ambientTorusLocus
isOpen_ambientTorusLocus
ambientTorusLocus_mem_nhds
pointToTorus4
pointToTorus4_toPoint4
mem_ambientTorusLocus_iff_exists_toPoint4
eventually_laurentWPoint_eq_iff_exists_baseFiber_lift
```

`ambientTorusLocus` is the nonzero-coordinate/product locus in `Point4`. It is open, contains every `z.toPoint4`, and every point in it canonically lifts to `Torus4` using `Units.mk0`.

No second `Torus4`, `baseFiber`, or Laurent function is introduced.

## 7. Local regular-level identification

For a regular base-fiber point, F14 defines:

```lean
laurentRegularImplicitChart
laurentRegularImplicitChart_fst
laurentRegularImplicitChart_fst_eq_lambda_iff
eventually_exists_baseFiber_lift_iff_regularImplicitChart_fst_eq
laurentRegularImplicitChart_source_mem_nhds
eventually_mem_regularImplicitChart_source_and_baseFiber_slice
```

The strongest neighborhood-scoped slice statement says that, sufficiently near `z.toPoint4`:

1. the point lies in the actual source of the regular implicit chart; and
2. being the `toPoint4` image of a concrete point of `baseFiber κ lambda` is equivalent to the chart's first coordinate being `lambda`.

Since the second chart coordinate already lies in `ker(dW_z)`, this identifies the local level set with the local chart slice

```text
{lambda} × ker(dW_z)
```

in the precise neighborhood-scoped sense proved by Lean.

It is not a global set equality.

## 8. Local kernel parametrization

F14 additionally proves:

```lean
laurentRegularImplicitFunction
laurentWPoint_eq_level_of_mem_baseFiber
eventually_laurentRegularImplicitFunction_reconstruct
eventually_regularLevel_reconstruct_from_kernelCoordinate
eventually_laurentWPoint_regularImplicitFunction_eq_level
tendsto_laurentRegularImplicitFunction_level
eventually_regularImplicitFunction_exists_baseFiber_lift
```

Consequently:

- every sufficiently nearby point on the regular level is reconstructed from its kernel coordinate by the fixed-level implicit function;
- sufficiently small kernel parameters map to the Laurent level `lambda`;
- those implicit points tend to the base point;
- sufficiently small kernel parameters admit concrete lifts in `baseFiber κ lambda`.

This is a local kernel parametrization. It is not promoted here to a global graph, manifold submersion, or smooth-submanifold API.

## 9. F13x evidence status

F13x remains archaeology/reference evidence only:

```text
branch: formal-f13x-pre-f14-source-archaeology
final head: c206809a708740d84d713eb28eb9fef8be42824a
probe commit: 56672f6865a5ff97331c57b2abe9b01b31ea29b9
probe blob: 66efbaab636840ffd3e57df2b10ea2fecfbc1e16
draft PR #24: closed / unmerged
```

F14 did not cherry-pick the probe and did not use F13x as ancestry authority.

A provenance qualification discovered during F14: run #167 establishes successful F13x PR CI, but its job-step list did not contain a dedicated direct-compile step for the probe file. F14 closes that evidence gap by directly compiling `LaurentImplicit.lean` in its workflow.

## 10. Verification receipts

Canonical F13 exact-main receipt:

```text
Formal Verification #166
run id: 35380384684
conclusion: success
```

F14 implementation receipts include:

```text
run #170 / id 35414845546 / success
  first canonical implicit-function layer

run #172 / id 35415366113 / success
  ambient Torus4 representation + local baseFiber slice

run #175 / id 35416124656 / success
  two-sided local kernel parametrization

run #176 / id 35416369875 / success
  explicit chart-source neighborhood + fully neighborhood-scoped slice theorem
```

At run #176:

```text
lake build                              PASS
LaurentImplicit direct compile         PASS
sealed-parent Lean blob guard          PASS
no axiom / sorry / admit gate          PASS
runtime contracts                      PASS
publication static smoke               PASS
browser RC                             PASS
```

## 11. What is formally proved in F14

```text
C¹ regularity at torus points
strict Fréchet derivative using sealed F13 dW
surjectivity → range = ⊤
pinned implicit function
pinned local OpenPartialHomeomorph
chart first coordinate = Wκ
base/source/target sanity
open ambient torus locus and canonical lift
local baseFiber ↔ fixed first-coordinate slice
explicit neighborhood inclusion in chart source
local reconstruction by kernel coordinate
small-kernel parameters remain on the level and lift to baseFiber
```

## 12. Explicitly not proved

F14 does **not** prove:

```text
global level-set equality with a product
global graph theorem
smooth-submanifold theorem
manifold IsSubmersionAt
scheme-theoretic smoothness
Jacobian criterion for the scheme
finite étale geometry
smoothness of every X_n
runtime concrete-geometry admission
renderer truth-flag changes
```

The phrases

```text
dW surjective
implicit-function object exists
local level-set chart
scheme smoothness
```

remain distinct theorem layers.

## 13. Route decisions

```text
ambient Point4 finite-dimensional IFT   USED / PASS
coordinate-isolation fallback           UNNECESSARY
log-coordinate route                    UNNECESSARY
generic manifold-submersion route       UNNECESSARY
```

The ambient route completed F14 without coordinate permutation, local logarithm, or manifold infrastructure.

## 14. Decision matrix

| # | Question | Status | Evidence |
|---:|---|---|---|
| 1 | F13 canonical baseline still exact? | PASS | main remains exact F13 commit/tree |
| 2 | F13x feasibility evidence reproduced/understood? | PASS | probe and receipts audited; provenance qualification recorded |
| 3 | pinned Lean/mathlib unchanged? | PASS | Lean 4.34.0 / mathlib 7801e840... |
| 4 | laurentWPoint ContDiffAt theorem formalized canonically? | PASS | `laurentWPoint_contDiffAt` |
| 5 | HasStrictFDerivAt theorem uses sealed F13 differential? | PASS | `laurentWPoint_hasStrictFDerivAt` |
| 6 | no duplicate derivative representation introduced? | PASS | only sealed `laurentTotalDifferential` used |
| 7 | F13 surjectivity converted to range = ⊤? | PASS | `laurentTotalDifferential_range_eq_top` |
| 8 | pinned HasStrictFDerivAt.implicitFunction instantiated? | PASS | `laurentImplicitFunction` |
| 9 | pinned implicitToOpenPartialHomeomorph instantiated? | PASS | `laurentImplicitChart` |
| 10 | base point is in chart source? | PASS | `laurentImplicitChart_base_mem_source` |
| 11 | (Wκ(z),0) is in chart target? | PASS | `laurentImplicitChart_base_mem_target` |
| 12 | chart first coordinate formally equals Wκ? | PASS | `laurentImplicitChart_fst` |
| 13 | local inverse/implicit-function equation formalized? | PASS | base inverse + eventual reconstruction |
| 14 | baseFiber representation bridge is sufficient? | PASS | ambient torus locus + canonical lift |
| 15 | local level-set identification proved? | PASS | regular chart fixed-first-coordinate slice |
| 16 | local statement correctly neighborhood-scoped? | PASS | explicit `∀ᶠ x in 𝓝 z.toPoint4` plus chart source |
| 17 | coordinate-isolation fallback still unnecessary? | PASS | ambient route completed |
| 18 | log-coordinate route still unnecessary? | PASS | no log/branch infrastructure used |
| 19 | generic manifold submersion route still unnecessary? | PASS | no manifold infrastructure required |
| 20 | any new unsupported smoothness claim introduced? | PASS | no such theorem/name added |
| 21 | any sealed F13 blob changed? | PASS | sealed blobs guarded and unchanged |
| 22 | any runtime geometry truth flag changed? | PASS | no runtime/data geometry admission change |
| 23 | no axiom/sorry/admit? | PASS | CI placeholder gate |
| 24 | full lake build passes? | PASS | run #176 |
| 25 | new module direct compile passes? | PASS | run #176 |
| 26 | sealed-parent blob guard passes? | PASS | run #176 |
| 27 | exact-head CI receipt exists? | PASS | implementation head 9069631..., run #176 |
| 28 | theorem boundary documented? | PASS | this report + JSON matrix |
| 29 | F14 theorem level precisely classified? | PASS | F14-C + local kernel parametrization; not smoothness |
| 30 | safe to open next formal thread? | PASS | after canonical merge/seal |

## 15. Final verdict

```text
PASS — Analytic local level-set bridge established
```

The word “analytic” here refers to the analysis/implicit-function bridge formalized through C¹ and strict Fréchet differentiability. No independent `AnalyticAt` theorem is asserted.

## 16. Merge recommendation

```text
RECOMMEND CANONICAL MERGE
```

Conditions:

1. documentation-head CI must remain green;
2. merge must preserve exact F13 ancestry;
3. no renderer/data geometry admission should be coupled to the merge;
4. after merge, rerun/observe exact-main Formal Verification and record the canonical receipt.

Recommended next formal scope:

```text
separate F15-level packaging of stronger geometric semantics,
only if needed:
local graph packaging and/or a separately scoped manifold/scheme smoothness bridge.
```

F14 itself is complete at the local analytic level-set / kernel-parametrization boundary.

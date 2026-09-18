# F13x — Pre-F14 Source Archaeology / Reusable Verification Components v0.01

Status: **ARCHAEOLOGY / AUDIT EXCEPTION BRANCH**

Canonical parent:

```text
commit: c64443eff3eae8853cbdcae972d7e6772c10f701
tree:   70b3687339b5b4a23ba28b2e35c04d6a4c2ea9c8
level:  PASS / Level 2 — Differential Regularity Bridge
```

This artifact records reusable components and feasibility evidence before formal F14. It does **not**
extend F13 theorem semantics and does **not** claim a regular-value theorem, local-graph theorem,
manifold submersion theorem, scheme-theoretic smoothness, finite étale geometry, or smoothness of all
`X_n`.

## 1. F13 canonical baseline

Baseline reconstruction passed.

| Evidence | Canonical value | Status |
| --- | --- | --- |
| `main` HEAD at audit start | `c64443eff3eae8853cbdcae972d7e6772c10f701` | PASS |
| F13 tree | `70b3687339b5b4a23ba28b2e35c04d6a4c2ea9c8` | PASS |
| sole parent | `e2ecd34a1bdc0bc53a30eed64645b93fa7065f3f` | PASS |
| `formal/SelfSimilarCY/LaurentDifferential.lean` | blob `f3a27de774ecaa3b0e232f1fe7f0b06d381da55b` | PASS |
| `formal/SelfSimilarCY/LaurentCritical.lean` | blob `caf9e0af928a76cb6bc14ab2d7d24c68a98b10d6` | PASS |
| `.github/workflows/formal-verification.yml` | blob `a3b319fe03a562faf06e7a47b6d3337ecbae2130` | PASS |
| exact-main Formal Verification | run #166 / id `35380384684` / success | PASS |
| exact-main Pages | run #17 / id `35380384161` / success | PASS |
| Issue #16 F13 receipt | exact SHA/tree/blob/run identities agree | PASS |

The sealed F13 module contains the intended analytic bridge:

1. `laurentWPoint`;
2. complex Fréchet differentiability at torus points;
3. `laurentTotalDifferential`;
4. coordinate replacement bridge;
5. basis-direction derivative bridge;
6. `IsLaurentCritical ↔ laurentTotalDifferential = 0`;
7. nonzero total differential on a regular base fiber;
8. nonzero complex linear functional implies surjective;
9. base-fiber surjectivity theorem.

No sealed F13 module is modified by this archaeology branch.

## 2. Historical source recovery status

The connected canonical GitHub scope was searched for the historical Arithmetic Self-Similar CY source
package and verifier families, including names or content matching:

```text
Arithmetic_Self_Similar_Calabi_Yau_v0_01.tex
Arithmetic_Self_Similar_Calabi_Yau_final.tex
verify_arithmetic_self_similar_cy_*.py
validation_arithmetic_self_similar_cy_*.txt
state_arithmetic_self_similar_cy_*.json
manifest_arithmetic_self_similar_cy_*.json
base_etale_tower_audit_*.md
Number_Field_Self_Similar_CY_v0_01.tex
Profinite_Cyclotomic_Choice_Geometry_v0_01.tex
Dirichlet_Mellin_Coordinates_v0_10.tex
sympy
groebner / Gröbner
resultant
saturation
Newton
local logarithm
```

No executable historical verifier and no listed historical `.tex` artifact was recovered from the
current connected repository scope.

Therefore:

```text
historical result previously audited
≠
historical executable artifact currently recovered
```

Historical critical/discriminant calculations may be retained only as provenance-backed source
history or regression targets until their executable verifier/source artifact is recovered and
revalidated.

## 3. Reuse classification

Each candidate is classified into exactly one principal reuse class:

- **A. DIRECTLY REUSABLE** — current sealed Lean theorem or representation can be used as F14 input.
- **B. REGRESSION / ORACLE ONLY** — exact/symbolic source mathematics may guard semantics but does not prove smoothness.
- **C. METHODOLOGY ONLY** — proof architecture or decomposition may guide F14 but is not a theorem transfer.
- **D. HISTORICAL CONTEXT ONLY** — useful provenance, not an F14 proof component.
- **E. NOT REUSABLE** — irrelevant or representation-incompatible for the F14 target.
- **F. UNSAFE / OVERCLAIM RISK** — reuse would improperly promote a source/expository statement into a formal geometric theorem.

Verification levels:

- **Level A** — Lean formal theorem.
- **Level B** — exact symbolic verification.
- **Level C** — finite computational model / regression.
- **Level D** — source mathematical argument.
- **Level E** — heuristic / conjectural / exposition.

## 4. Reusable-component inventory

| Candidate | Verification level | Reuse class | F14 use | Risk / qualification |
| --- | --- | --- | --- | --- |
| F13 `laurentTotalDifferential` | Level A | A | primary analytic input | none beyond current theorem boundary |
| `IsLaurentCritical ↔ total differential = 0` | Level A | A | transfer critical-locus exclusion to differential regularity | not a Jacobian criterion |
| `dW_z ≠ 0` on regular base fiber | Level A | A | regular-point input | not itself a regular-value theorem |
| `dW_z` surjective | Level A | A | IFT range hypothesis | not itself a submersion theorem |
| F12 coordinate derivative bridge | Level A | A | coordinate-isolation fallback | requires product-coordinate reorganization for scalar IFT |
| `κ = 0` noncritical/nonzero differential case | Level A | A | edge-case preservation | no extra `κ ≠ 0` hypothesis should be introduced |
| historical critical/discriminant resultant chain | Level D historical provenance; expected Level B if verifier recovered | B | semantic regression target | executable verifier NOT FOUND in current scope |
| historical torus saturation / Gröbner checks | not currently inspectable | B only if recovered | regression/oracle candidate | NOT FOUND, do not claim rerun |
| ordinary/log derivative vanishing equivalence | source algebraic pattern | B | optional regression target | does not provide local log chart theorem |
| Newton full-face nondegeneracy material | source argument | C | methodology only | unnecessary for direct analytic IFT route |
| Number Field derivative/invertibility pattern `D z^(D-1)` | source argument | C | proof-decomposition analogy | different morphism and target theorem |
| local logarithmic inverse pattern | source argument | C | optional local-coordinate analogy | branch bookkeeping; different map |
| downstream cyclotomic / Dirichlet–Mellin materials | source history | D | provenance only | no direct F14 analytic lemma |
| old source use of “smooth” | source/exposition | F | none | cannot replace IFT / regular-level proof |
| historical finite étale / connectedness / canonical-bundle claims | other theorem layers | E | none for F14 core | theorem-layer mismatch |

## 5. Pinned environment

The repository pins:

```text
Lean:    leanprover/lean4:v4.34.0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

The F14 API audit is tied to that exact mathlib revision.

### 5.1 Finite-dimensional implicit-function landing zone

Pinned `Mathlib/Analysis/Calculus/Implicit.lean` contains the finite-dimensional codomain route:

```lean
HasStrictFDerivAt.implicitFunction
```

with the relevant hypotheses:

```lean
hf  : HasStrictFDerivAt f f' a
hf' : f'.range = ⊤
```

for a Banach-domain map into a finite-dimensional codomain. The implementation automatically
obtains complementedness of `ker f'` from finite-dimensionality of the range/codomain and constructs
an `OpenPartialHomeomorph E (F × f'.ker)`, together with an implicit function locally mapping level
values and kernel coordinates back to the ambient space.

For the current Laurent bridge:

```text
E = Point4 = Fin 4 → ℂ
F = ℂ
f = laurentWPoint κ
f' = laurentTotalDifferential κ z
```

F13 already supplies surjectivity of `f'` on the regular base fiber. The remaining project-specific
analytic gap is therefore not “prove surjectivity again”, but obtain a strict derivative or sufficient
continuous differentiability for `laurentWPoint` and convert surjectivity to `f'.range = ⊤`.

### 5.2 ContDiff product-domain route

Pinned `Mathlib/Analysis/Calculus/ImplicitContDiff.lean` contains:

```lean
ContDiffAt.implicitFunction
```

with a product-domain hypothesis in which the derivative in the implicit coordinate is invertible.
This supports the coordinate-isolation fallback after choosing a coordinate with nonzero partial
derivative.

### 5.3 Generic manifold submersion route

Pinned `Mathlib/Geometry/Manifold/Submersion.lean` explicitly lists as TODO:

```text
finite-dimensional manifold:
surjective mfderiv ⇒ submersion
```

and also the Banach-manifold right-inverse-to-submersion implication.

Therefore generic manifold `IsSubmersionAt` is not the preferred F14 landing zone.

## 6. Route feasibility

### Ambient Point4 finite-dimensional IFT

Verdict: **PREFER**

Reason:

```text
existing total derivative
+ existing surjectivity
+ finite-dimensional codomain ℂ
+ pinned HasStrictFDerivAt.implicitFunction
```

leaves a narrow analytic bridge: strict differentiability / `ContDiffAt`, range conversion, and
local-level identification.

### Coordinate isolation

Verdict: **VIABLE**

F13 proves the total differential is nonzero and evaluates basis directions as the sealed coordinate
derivatives. Hence at a regular point not all four coordinate derivatives can vanish. This supports:

```text
choose nonzero partial
→ split/reorder Point4 as remaining coordinates × ℂ
→ apply product-domain implicit function theorem
→ obtain a local graph
```

The mathematical idea is inexpensive; representation/permutation bookkeeping makes it less direct
than the ambient-kernel route.

### Log-coordinate route

Verdict: **NOT RECOMMENDED**

A local complex logarithm is only local and introduces branch selection, `exp/log` inverse
bookkeeping, and another representation bridge. It does not remove the need for an implicit-function
argument for the Laurent level set.

### Generic manifold submersion route

Verdict: **EXPENSIVE**

Pinned mathlib does not currently expose the desired direct
`surjective mfderiv ⇒ IsSubmersionAt` bridge. Using manifold submersion infrastructure would add
representation work without reducing the core F14 analytic gap.

## 7. Precise F14 gap after F13x

The current minimal new-work chain is:

```text
F13:
HasFDerivAt / genuine total Fréchet derivative
+ derivative nonzero / surjective

F14 new work:
1. prove ContDiffAt or HasStrictFDerivAt for laurentWPoint at torus points;
2. convert Function.Surjective laurentTotalDifferential to range = ⊤;
3. instantiate pinned HasStrictFDerivAt.implicitFunction;
4. identify the resulting local parametrization with the Laurent level set / baseFiber locally;
5. only then decide whether to package a local graph / regular-level / submanifold theorem.
```

The isolated F13x feasibility probe demonstrates that steps 1–3 are implementable against the exact pinned project API. It does **not** promote those helpers into canonical F14 theorem semantics, and steps 4–5 remain genuinely new F14 work.

## 8. Decision matrix

| # | Question | Status | Evidence |
| ---: | --- | --- | --- |
| 1 | F13 canonical baseline intact? | PASS | exact main/tree/parent/blobs/CI/Pages match |
| 2 | old CY smoothness source located? | PARTIAL | historical source conclusions known, source file not recovered in connected repository scope |
| 3 | old exact critical/discriminant verifier located? | NOT FOUND | verifier-family/code search empty |
| 4 | torus-saturation verifier reusable? | NOT FOUND | executable artifact not recovered |
| 5 | `κ=0` regression reusable? | PASS | already formalized at F12/F13; historical edge case consistent |
| 6 | ordinary/log derivative equivalence reusable? | PARTIAL | source-level algebraic regression candidate |
| 7 | Newton nondegeneracy material reusable? | NOT APPLICABLE | not needed for preferred analytic route |
| 8 | old local logarithmic inverse material relevant? | PARTIAL | methodology only |
| 9 | Number Field derivative/invertibility pattern relevant? | PARTIAL | methodology only |
| 10 | any historical IFT proof actually exists? | NOT FOUND | no recovered source/formal artifact |
| 11 | any historical regular-value theorem actually exists? | NOT FOUND | no recovered formal artifact |
| 12 | any historical local-graph proof actually exists? | NOT FOUND | no recovered formal artifact |
| 13 | any historical Lean smoothness theorem exists? | NOT FOUND | current Lean tree stops at differential regularity |
| 14 | current F13 representation sufficient for F14? | PASS | Point4 ambient map + genuine Fréchet derivative + surjectivity |
| 15 | coordinate-isolation route viable? | PASS | basis-direction bridge + nonzero total derivative |
| 16 | ambient Point4 IFT route viable? | PASS | pinned finite-dimensional codomain IFT exists |
| 17 | log-coordinate route viable? | PARTIAL | mathematically possible, branch-heavy |
| 18 | generic submersion route viable? | PARTIAL | infrastructure exists, desired finite-dimensional bridge is TODO |
| 19 | pinned mathlib exact API sufficient? | PASS | project-specific probe compiled under pinned Lean/mathlib; implicit-function and open-partial-homeomorph instantiations typecheck |
| 20 | precise missing hypotheses identified? | PASS | strict/ContDiff + range conversion + local level identification |
| 21 | regression harness worth preserving? | PARTIAL | worthwhile if historical verifier is recovered or a new isolated oracle is justified |
| 22 | anything worth merging from F13x? | PARTIAL | archaeology/provenance docs are preservable candidates; feasibility probe itself remains exception-branch evidence and is not recommended for canonical merge |
| 23 | repository ready to open formal F14? | PASS | after F13x documentation/provenance closure; no F13 repair needed |

## 9. Verdict

```text
PASS — F14 may begin with reusable source/regression components.

The executable historical verifier package remains NOT FOUND, so historical symbolic material stays
regression/provenance-only. This does not block F14 because the preferred analytic landing zone has
now been project-compiled against the exact pinned Lean/mathlib environment.

No F13 theorem repair is required.
No historical smoothness theorem was recovered.
No symbolic verifier is promoted into a smoothness proof.
```

## 10. F13x feasibility probe receipt

The isolated probe is:

```text
formal/SelfSimilarCY/F13xImplicitFeasibility.lean
blob: 66efbaab636840ffd3e57df2b10ea2fecfbc1e16
probe commit: 56672f6865a5ff97331c57b2abe9b01b31ea29b9
probe tree: edcd7732d2e7727a10c7e020330d500368e957d0
```

It is deliberately **not imported** by `formal/SelfSimilarCY.lean`.

The probe successfully typechecks all of the following against the repository-pinned environment:

```text
laurentWPoint
→ ContDiffAt ℂ 1 at torus points
→ HasStrictFDerivAt with the sealed F13 laurentTotalDifferential
→ Function.Surjective differential ⇒ differential.range = ⊤
→ HasStrictFDerivAt.implicitFunction
→ HasStrictFDerivAt.implicitToOpenPartialHomeomorph
```

Staging receipt:

```text
draft PR: #24
policy: DO NOT MERGE
Formal Verification: run #167
run id: 35386660141
head: 56672f6865a5ff97331c57b2abe9b01b31ea29b9
conclusion: success
```

The run passed `lake build`, all sealed direct Lean compiles, the sealed-parent blob guard, and the
no-`axiom` / no-`sorry` / no-`admit` gate. Runtime contracts, publication static smoke, and
browser RC jobs also passed.

This receipt proves **API/project feasibility only**. It does not prove that the Laurent base fiber has
already been packaged as a local graph, regular level set, smooth submanifold, or manifold submersion.

## 11. Next action

F14 may now open from the exact F13 canonical parent:

```text
c64443eff3eae8853cbdcae972d7e6772c10f701
```

The preferred route is:

```text
ambient Point4 finite-dimensional IFT

canonicalize the C¹ / strict-derivative bridge
→ reuse F13 surjectivity
→ instantiate pinned implicit-function machinery
→ identify the local implicit parametrization with baseFiber
→ only then package local graph / regular-level semantics
```

The F13x exception branch is evidence, not the canonical parent for F14. The feasibility module should
not be merged merely to save retyping; F14 should integrate only the minimum theorem content that its
own semantic target requires.

No regression harness is added at this stage because the historical executable verifier remains
unrecovered.

---

F13x governing distinction:

```text
historical origin
≠ formal assumption
≠ proved theorem
≠ computational regression
≠ heuristic
```

and:

```text
dW_z surjective
≠ regular-value theorem already proved
```

# Formal Verification → Visualizer Engineering Handoff — v0.06

## Purpose

This document is a cross-line handoff from the sealed Formal Verification line (F01–F06) back to the Self-Similar Calabi–Yau Visualizer engineering line.

It is **documentation-only**.

It does **not** start F07, add a theorem, revise the F05 bridge matrix, change runtime semantics, or enlarge the mathematical scope of the existing formal seal.

The goal is to let later visualizer threads depend on the sealed formal core without having to reload the entire F01–F06 history, while preserving the exact claim boundary established by F05 and F06.

## Canonical formal seal

The sealed F06 commit is:

```text
ff5bcd2f134497c671b2368c372f59b5620a41ab
formal: seal F06 GitHub CI verification
```

Its canonical F05 parent is:

```text
26f3e8818a5b96bc8cebf4edf72d43c124543832
formal: seal F05 contract bridge audit
```

F06 established continuous verification for two independent jobs:

```text
formal-lean
runtime-contracts
```

The correct interpretation of a green CI run is:

```text
sealed Lean formal core passes
+
runtime engineering contracts pass
+
F05 semantic bridge boundary remains the governing audit
```

It is **not** equivalent to saying that the entire Calabi–Yau visualizer, or all of its mathematics, is formally verified.

## Sealed formal facts that visualizer engineering may rely on

### 1. Ambient formal coordinate type

The sealed formal core uses:

```lean
abbrev Point4 := Fin 4 → ℂ
```

This is an ambient four-complex-coordinate type. It does not by itself impose a torus or nonvanishing condition.

### 2. Coordinate power map

The canonical formal map is:

```lean
def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

with the coordinate rule:

```lean
coordinatePower D z i = z i ^ D
```

and the sealed uniqueness theorem `coordinatePower_unique`.

At the mathematical transformation level, the runtime four-coordinate `coordinate_power` contract is classified by F05 as an `EXACT_BRIDGE`, restricted to runtime-admitted inputs.

### 3. Iteration theorem

The sealed formal core proves:

```lean
(coordinatePower D)^[n] z i = z i ^ (D ^ n)
```

and the map-level identity:

```lean
(coordinatePower D)^[n] = coordinatePower (D ^ n)
```

The map-level combined theorem is a sealed formal fact. Its existence does not imply that the runtime constructs an explicit combined `coordinatePower (D ^ n)` object.

### 4. Abstract pullback tower

For an arbitrary set `X : Set Point4`, the formal core defines:

```lean
def pullbackTower (D : ℕ) (X : Set Point4) : ℕ → Set Point4
  | 0 => X
  | Nat.succ n => coordinatePower D ⁻¹' pullbackTower D X n
```

and proves:

```lean
pullbackTower D X 0 = X
```

```lean
pullbackTower D X n.succ =
  coordinatePower D ⁻¹' pullbackTower D X n
```

```lean
pullbackTower D X n =
  ((coordinatePower D)^[n]) ⁻¹' X
```

```lean
pullbackTower D X n =
  (coordinatePower (D ^ n)) ⁻¹' X
```

The one-step inverse-image relation and recursive inverse-image recurrence are `EXACT_BRIDGE` items in F05.

The closed-form documented tower ↔ iterate-preimage relation is `PARTIAL_BRIDGE` because the runtime stores structural levels rather than evaluating Lean sets or constructing the combined map object.

## Runtime v0.06 interpretation

The visualizer v0.06 recursive layer is a **lazy structural model**.

Each materialized positive-depth level records structural data including:

```text
relation = inverse_image
sourceDepth = depth - 1
pullbackMapKind
coordinateCount
exponentParameter / exponentValue
mapDegreePerStep
iteratedDegreeExpression
geometryRendered
sheetsMaterialized
```

`requestedDepth` is a runtime lazy-materialization target, not automatically the same thing as the currently materialized depth. F05 therefore classifies runtime `requestedDepth` ↔ formal tower index `n` as `PARTIAL_BRIDGE`.

The runtime v0.06 contract intentionally preserves:

```text
geometryRendered = false
sheetsMaterialized = false
```

for the unresolved geometric layer. Structural expansion must not be reinterpreted as construction of genuine geometric sheets.

## F05 bridge boundary

The canonical F05 machine-readable matrix contains 22 rows and remains the governing semantic bridge audit.

Its sealed classification totals are:

```text
EXACT_BRIDGE:      4
PARTIAL_BRIDGE:    3
ENGINEERING_ONLY:  5
FORMAL_ONLY:       3
UNFORMALIZED:      3
NO_BRIDGE:         4
```

The category meanings remain:

- `EXACT_BRIDGE`: same mathematical relation after explicit representation translation, restricted to runtime-admitted inputs;
- `PARTIAL_BRIDGE`: common mathematical core exists, but domains, abstraction level, or operational semantics differ;
- `ENGINEERING_ONLY`: runtime implementation/verification behavior with no Lean theorem counterpart claimed or required;
- `FORMAL_ONLY`: sealed Lean definition/theorem with no direct runtime implementation-contract counterpart;
- `UNFORMALIZED`: runtime carries a mathematical/numeric expression, but no sealed Lean theorem establishes the corresponding mathematical interpretation;
- `NO_BRIDGE`: concept unresolved, absent, or outside the sealed formal model.

Later visualizer work must not silently promote any `PARTIAL_BRIDGE`, `UNFORMALIZED`, `NO_BRIDGE`, or `ENGINEERING_ONLY` item into a theorem merely because runtime CI is green.

## Explicit non-claims that remain in force

The sealed F01–F06 formal layer does **not** establish any of the following:

```text
W
W = 0
X = W^{-1}(lambda) as a defined Lean hypersurface
Calabi–Yau geometry
smoothness or singularities
deg(P_D) = D^4 as a genuine map-degree theorem
concrete D^4 sheets
covering-space structure
étale structure
torus / nonvanishing restrictions
Jacobians
differentials
P_D^* g_log = D^2 g_log
browser rendering correctness
Three.js correctness
WebGL correctness
UI correctness
```

In particular:

```text
runtime metricScale = D^2
```

is not a sealed metric theorem;

```text
runtime sheetDegree / mapDegree / mapDegreePerStep = D^4
```

is not a sealed map-degree theorem;

and:

```text
runtime iteratedDegreeExpression = (D^4)^n
```

is not a sealed iterated map-degree theorem.

A future proof of the bare arithmetic identity `(D^4)^n = D^(4n)` would still not, by itself, prove a geometric degree theorem.

## Domain boundary

The sealed Lean definitions and theorems are stated for:

```lean
D : ℕ
```

The runtime admits a narrower engineering domain: integer `D >= 2`, additionally subject to JavaScript safe-integer checks for derived values such as `D^2` and `D^4`.

F05 classifies this domain correspondence as `PARTIAL_BRIDGE`.

Runtime validation must therefore remain authoritative for runtime admissibility; Lean's broader natural-number theorem domain must not be used to bypass runtime guards.

## Engineering policy after F06

The visualizer main line does **not** need to wait for a new formal-verification milestone before continuing.

The preferred development order is:

```text
implement a new visualizer primitive
→ stabilize its runtime contract
→ verify its engineering behavior
→ audit its relation to the sealed formal model
→ formalize only the mathematical invariant that is mature and worth sealing
```

Do not use the opposite policy:

```text
formalize all anticipated future geometry
→ only then continue visualizer engineering
```

The F01–F06 seal is intended to function as a stable formal boundary, not as a requirement to formalize the entire future application before implementation proceeds.

## When to reopen the Formal Verification line

A later visualizer milestone should consider a new formal-verification milestone only when it introduces or starts relying on a mathematically substantive claim not already covered by the sealed core.

Typical triggers include:

```text
an explicit torus / nonvanishing mathematical model
a concrete definition of W or a hypersurface X
a genuine fiber or sheet construction
a mathematical map-degree claim
covering or étale semantics
Jacobian or differential formulas
metric pullback/scaling claims
smoothness or singularity claims
Calabi–Yau geometric claims
```

Merely adding UI, DOM behavior, rendering presentation, lazy scheduling, caching, interaction controls, scene navigation, or other engineering-only behavior does not by itself require reopening the formal line.

## Next-thread consumption rule

A visualizer engineering thread may treat this document as the compact formal handoff for F01–F06.

Recommended thread statement:

```text
Formal Verification F01–F06 is sealed.
This thread does not reopen formal verification.
The formal handoff is used only as the canonical mathematical-claim boundary.
Any claim outside that boundary remains unformalized unless a later explicitly scoped formal milestone proves it.
```

The next visualizer thread should still exact-read the runtime artifacts relevant to its own milestone. This handoff does not replace canonical runtime source inspection.

## Canonical references

The compact handoff is derived from and subordinate to these canonical repository artifacts:

```text
formal/SelfSimilarCY/CoordinatePower.lean
formal/SelfSimilarCY/CoordinatePowerIteration.lean
formal/SelfSimilarCY/PullbackTower.lean

docs/CONTRACT_BRIDGE_AUDIT_self_similar_cy_visualizer_v0_05.md
docs/contract_bridge_matrix_self_similar_cy_visualizer_v0_05.json

docs/GITHUB_CI_FORMAL_VERIFICATION_SEAL_self_similar_cy_visualizer_v0_06.md
docs/state_formal_verification_self_similar_cy_visualizer_v0_06.json
docs/progress_formal_verification_self_similar_cy_visualizer_v0_06.md

.github/workflows/formal-verification.yml
```

For runtime v0.06 behavior, the canonical executable sources and verifier remain authoritative, including:

```text
scene-spec.js
base-renderer.js
one-step-pullback.js
recursive-lazy-expansion.js
app.js
data/system.json

verify_scene_spec_v0_03.js
verify_base_renderer_v0_04.js
verify_one_step_pullback_v0_05.js
verify_recursive_lazy_expansion_v0_06.js
```

If this compact handoff and a canonical sealed source ever appear to disagree, the canonical sealed source wins and the handoff should be corrected rather than used to rewrite history.

## Handoff decision

The correct post-F06 project posture is:

```text
Formal Verification F01–F06: sealed
Formal boundary: preserved
Visualizer engineering: free to continue
Whole visualizer mathematics formally verified: NO
Automatic F07 requirement: NO
Reopen formal line only for a new explicitly scoped mathematical claim
```

This document exists to keep that boundary visible while the Self-Similar Calabi–Yau Visualizer continues beyond its current v0.06 engineering state.

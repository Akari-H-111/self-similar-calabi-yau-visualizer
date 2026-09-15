# Contract Bridge Audit — Formal Verification v0.05

## Milestone

**Thread F05 — Contract Bridge Audit**

Current status: **audit complete / fresh regression pending / unsealed**

Canonical F04 parent:

```text
f1602a09ea24e4d71b9352dfc0c3c2602094ed56
formal: seal F04 pullback tower
```

Working branch:

```text
formal-f05-contract-bridge-audit
```

## Scope

F05 audits the semantic bridge between the canonical JavaScript/runtime contracts and the sealed F02–F04 Lean definitions/theorems. It does not add or modify Lean theorems, runtime semantics, `data/system.json`, dependencies, GitHub Actions, `W`, sheet geometry, degree theory, metric geometry, or F06 work.

The audit source authority is the canonical GitHub repository at the F04-sealed commit above.

## Classification vocabulary

| Classification | Meaning |
|---|---|
| `EXACT_BRIDGE` | Same mathematical relation after explicit representation translation, restricted to runtime-admitted inputs. It does not mean JS objects are definitionally equal to Lean objects. |
| `PARTIAL_BRIDGE` | A common mathematical core exists, but domains, abstraction level, or operational semantics differ. |
| `ENGINEERING_ONLY` | Runtime implementation/verification behavior with no Lean theorem counterpart claimed or required. |
| `FORMAL_ONLY` | A sealed Lean definition/theorem has no direct runtime implementation-contract counterpart. |
| `UNFORMALIZED` | Runtime carries a mathematical/numeric expression, but no sealed Lean theorem establishes the corresponding mathematical interpretation. |
| `NO_BRIDGE` | The concept is unresolved, absent, or outside the formal model; no valid current bridge exists. |

## Canonical findings

### 1. `D`

Runtime validation requires an integer `D >= 2`, and additionally requires `D^2` and `D^4` to remain JavaScript safe integers. Lean defines `coordinatePower`, its iteration theorem, and the pullback tower for every `D : ℕ`.

Therefore the accepted runtime exponent embeds naturally into the Lean domain, but the two domain/validation contracts are not identical.

**Classification:** `PARTIAL_BRIDGE`.

### 2. Four-coordinate power map

Runtime schema version 1 fixes:

```text
kind = coordinate_power
coordinateCount = 4
exponentParameter = D
```

and the sealed Lean source fixes:

```lean
abbrev Point4 := Fin 4 → ℂ

def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

At the mathematical transformation level these express the same four-coordinate map.

**Classification:** `EXACT_BRIDGE`.

The sealed theorem `coordinatePower_unique` is stronger and is not itself a runtime theorem. Runtime source-of-truth checks are engineering checks rather than a function-extensionality proof.

### 3. One-step pullback

Runtime v0.05 records exactly depth `1`, `relation = inverse_image`, and the structural statement `X_1 = P_D^{-1}(X)`. Sealed F04 gives the same recurrence through `pullbackTower_zero` and `pullbackTower_succ`.

**Classification:** `EXACT_BRIDGE` for the structural mathematical relation.

The runtime object remains only a descriptor; it does not construct a Lean `Set Point4` or concrete points of `X`.

### 4. Recursive structural recurrence

Every positive runtime level records one predecessor depth and `relation = inverse_image`. This matches the sealed recurrence

```lean
pullbackTower D X n.succ = coordinatePower D ⁻¹' pullbackTower D X n
```

at the mathematical level.

**Classification:** `EXACT_BRIDGE`.

By contrast, `levels`, `materializedDepth`, `expansionComplete`, immutability, `expandOneLevel`, and stop-at-target are runtime materialization semantics only.

**Classification:** `ENGINEERING_ONLY`.

### 5. Closed-form pullback tower

Sealed F04 proves:

```lean
pullbackTower D X n = ((coordinatePower D)^[n]) ⁻¹' X
```

and:

```lean
pullbackTower D X n = (coordinatePower (D ^ n)) ⁻¹' X
```

The runtime canonical documentation describes the same family, while the implementation operationally stores only repeated structural levels. It does not compute a set preimage or a combined `coordinatePower (D^n)` runtime object.

Therefore the recurrence-to-closed-form relationship is source-compatible but not independently established by runtime execution.

**Classification:** `PARTIAL_BRIDGE` for the documented tower ↔ iterate-preimage statement, and `FORMAL_ONLY` for the combined-map theorem itself.

### 6. `requestedDepth`

Lean `n` is a mathematical index. Runtime `requestedDepth` is a target for request-bounded lazy materialization. For `requestedDepth > 1`, initialization deliberately has `materializedDepth = 1`, and later explicit expansion advances at most one level per call.

Thus a runtime materialized level of depth `n` can denote mathematical level `n`, but:

```text
requestedDepth ≠ current Lean tower level
```

in general.

**Classification:** `PARTIAL_BRIDGE`.

### 7. `D^2`

`scene-spec.js` computes:

```text
derived.metricScale = D^2
```

This is a runtime numeric derived field only. Sealed F02–F04 contain no theorem bridging that field, and specifically no metric definition or proof of

```math
P_D^* g_{\log} = D^2 g_{\log}.
```

**Classification:** `UNFORMALIZED`.

### 8. `D^4`

Runtime computes `derived.sheetDegree = D^4`, and downstream modules reuse this number under names such as `mapDegree` or `mapDegreePerStep`. The sealed Lean source contains no algebraic-geometric/topological degree definition or theorem proving

```math
\deg(P_D)=D^4.
```

Consequently the runtime numeric expression must not be promoted to a formal map-degree theorem.

**Classification:** `UNFORMALIZED`.

### 9. `(D^4)^n` / `D^(4n)`

The runtime recursive model stores only:

```json
{
  "baseDegree": "D^4 value",
  "exponent": "n"
}
```

and the verifier checks this structural pair. Repository search and exact Lean source audit find no sealed theorem named `iteratedDegreeIdentity` and no degree theorem that could serve as an equivalent bridge.

The mathematical identity may be easy to prove in isolation, but that does not mean it exists in the repository, nor would it by itself prove an iterated map-degree theorem.

**Classification:** `UNFORMALIZED`.

### 10. `W` and the actual base hypersurface

Runtime schema fixes only:

```text
symbol = W
representation = unresolved
```

and the renderer refuses to draw geometry. F02–F04 define no `W`, no `lambda`, and no theorem identifying an actual set `X` with `W^{-1}(lambda)`. F04 instead quantifies over arbitrary `X : Set Point4`.

**Classification:** `NO_BRIDGE`.

### 11. Sheets, coverings, étale/torus structure, Jacobians, differentials, and metric geometry

No runtime sheet objects are materialized, and no such structures exist in sealed F02–F04 Lean source.

**Classification:** `NO_BRIDGE` for the mathematical structures. The runtime guards `sheetsMaterialized = false` and `geometryRendered = false` are `ENGINEERING_ONLY`.

## Machine-readable matrix summary

The canonical JSON matrix contains **22 rows**:

```text
EXACT_BRIDGE:     4
PARTIAL_BRIDGE:   3
ENGINEERING_ONLY: 5
FORMAL_ONLY:      3
UNFORMALIZED:     3
NO_BRIDGE:        4
```

## Not Formally Verified

The current sealed formal layer does **not** verify:

- `W`;
- `W = 0`;
- `X = W^{-1}(lambda)` as a defined Lean hypersurface;
- Calabi–Yau geometry;
- smoothness or singularities;
- `deg(P_D)=D^4` as a genuine map-degree theorem;
- `D^4` sheet geometry or concrete sheets;
- coverings;
- étale structure;
- torus/nonvanishing restrictions;
- Jacobians or differentials;
- `P_D^* g_log = D^2 g_log`;
- browser rendering correctness;
- Three.js or WebGL correctness;
- UI correctness.

The existence of runtime numbers called `metricScale`, `sheetDegree`, `mapDegree`, or `iteratedDegreeExpression` does not remove any item from this list.

## Verifier interpretation rule

A Node verifier pass establishes only the engineering assertions encoded by that verifier. In particular:

```text
runtime D^4 arithmetic / metadata
≠
Lean proof of map degree
```

and:

```text
request-bounded lazy expansion
≠
Lean verification of runtime scheduling/materialization
```

Conversely, sealed Lean theorems about arbitrary sets and function iteration do not verify JavaScript validation, DOM state, immutability, browser behavior, or rendering.

## Source audit

Exact canonical source read from `f1602a09ea24e4d71b9352dfc0c3c2602094ed56` includes all F05-requested runtime modules, JSON, historical Node verifiers, v0.01–v0.06 runtime specifications, F01 formal plan, F02/F03/F04 state/progress/specifications, pinned Lake/toolchain/manifest files, and the sealed Lean modules:

```text
formal/SelfSimilarCY/CoordinatePower.lean
formal/SelfSimilarCY/CoordinatePowerIteration.lean
formal/SelfSimilarCY/PullbackTower.lean
```

No F05 audit conclusion relies on an invented theorem name or prior-chat theorem summary.

## Regression/seal status

Historical F04 evidence records successful Lean and Node regressions, but F05 explicitly does **not** count that as fresh F05 execution evidence.

In the execution environment available to this audit session:

```text
node = available
lean = unavailable
lake = unavailable
private repository shell clone = unavailable because the shell environment has no GitHub network access
```

Therefore the mandatory fresh F05 regression gate has not been satisfied here. The audit artifacts may be staged, but F05 must remain:

```text
audit complete
fresh regression pending
canonicalState = unsealed
```

No sealing commit and no fast-forward of `main` is permitted until the exact F05 candidate is freshly executed under the pinned environment and the remaining seal gates pass.

## Scope result

This F05 candidate is intended to add only:

```text
docs/CONTRACT_BRIDGE_AUDIT_self_similar_cy_visualizer_v0_05.md
docs/contract_bridge_matrix_self_similar_cy_visualizer_v0_05.json
docs/state_formal_verification_self_similar_cy_visualizer_v0_05.json
docs/progress_formal_verification_self_similar_cy_visualizer_v0_05.md
```

It must not modify Lean source, runtime JavaScript, `data/system.json`, dependency files, GitHub Actions, or introduce F06 work.

## Stopping point

The semantic audit milestone is complete, but the repository milestone is **not sealed** until fresh regression evidence exists.

The next milestone remains:

```text
F06 — GitHub CI Integration & Formal Verification Seal
```

F06 must not begin before F05 is actually sealed.

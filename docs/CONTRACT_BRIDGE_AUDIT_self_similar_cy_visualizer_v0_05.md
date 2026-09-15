# Contract Bridge Audit — Formal Verification v0.05

## Milestone

**Thread F05 — Contract Bridge Audit**

Current status: **audit complete / fresh Node + placeholder scan passed / fresh Lean regression pending / unsealed**

Canonical F04 parent:

```text
f1602a09ea24e4d71b9352dfc0c3c2602094ed56
formal: seal F04 pullback tower
```

Working branch:

```text
formal-f05-contract-bridge-audit
```

## Scope and authority

F05 audits the semantic bridge between canonical JavaScript/runtime contracts and sealed F02–F04 Lean definitions/theorems. It does not add or modify Lean theorems, runtime semantics, `data/system.json`, dependencies, GitHub Actions, `W`, sheet geometry, degree theory, metric geometry, or F06 work.

Source authority is canonical GitHub. No bridge conclusion is inferred from prompt summaries or prior-chat memory.

## Classification vocabulary

| Classification | Meaning |
|---|---|
| `EXACT_BRIDGE` | Same mathematical relation after explicit representation translation, restricted to runtime-admitted inputs. It does not identify JS objects with Lean objects. |
| `PARTIAL_BRIDGE` | A common mathematical core exists, but domains, abstraction level, or operational semantics differ. |
| `ENGINEERING_ONLY` | Runtime implementation/verification behavior with no Lean theorem counterpart claimed or required. |
| `FORMAL_ONLY` | A sealed Lean definition/theorem has no direct runtime implementation-contract counterpart. |
| `UNFORMALIZED` | Runtime carries a mathematical/numeric expression, but no sealed Lean theorem establishes the corresponding mathematical interpretation. |
| `NO_BRIDGE` | The concept is unresolved, absent, or outside the formal model; no valid current bridge exists. |

## Canonical findings

### `D`

Runtime accepts integer `D >= 2` and additionally requires `D^2` and `D^4` to remain JavaScript safe integers. Lean defines the formal objects for every `D : ℕ`.

**Classification:** `PARTIAL_BRIDGE`.

### Four-coordinate power map

Runtime fixes `kind = coordinate_power`, `coordinateCount = 4`, and `exponentParameter = D`. Lean fixes:

```lean
abbrev Point4 := Fin 4 → ℂ

def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

At the mathematical transformation level these express the same four-coordinate map.

**Classification:** `EXACT_BRIDGE`.

`coordinatePower_unique` is stronger and has no runtime theorem counterpart.

**Classification of that theorem:** `FORMAL_ONLY`.

### One-step pullback

Runtime v0.05 records depth `1`, `relation = inverse_image`, and `X_1 = P_D^{-1}(X)`. F04 gives the same set-theoretic recurrence.

**Classification:** `EXACT_BRIDGE` for the structural mathematical relation.

The runtime object remains a descriptor and does not construct a Lean `Set Point4`.

### Recursive structural recurrence

Every positive runtime level records one predecessor depth and `relation = inverse_image`, matching:

```lean
pullbackTower D X n.succ = coordinatePower D ⁻¹' pullbackTower D X n
```

**Classification:** `EXACT_BRIDGE`.

Runtime `levels`, `materializedDepth`, `expansionComplete`, immutability, `expandOneLevel`, and stop-at-target behavior are materialization semantics only.

**Classification:** `ENGINEERING_ONLY`.

### Closed-form pullback tower

F04 proves:

```lean
pullbackTower D X n = ((coordinatePower D)^[n]) ⁻¹' X
```

and:

```lean
pullbackTower D X n = (coordinatePower (D ^ n)) ⁻¹' X
```

The runtime documentation describes the same tower, while runtime code stores repeated structural levels rather than evaluating sets or constructing a combined `coordinatePower (D^n)` object.

**Classification:** `PARTIAL_BRIDGE` for the documented tower ↔ iterate-preimage statement; `FORMAL_ONLY` for the combined-map theorem itself.

### `requestedDepth`

Lean `n` is a mathematical tower index. Runtime `requestedDepth` is a lazy-materialization target. A materialized runtime level of depth `n` can denote mathematical level `n`, but `requestedDepth` need not equal the currently materialized depth.

**Classification:** `PARTIAL_BRIDGE`.

### `D^2`

Runtime derives `metricScale = D^2`. No sealed Lean metric object or theorem proves `P_D^* g_log = D^2 g_log`.

**Classification:** `UNFORMALIZED`.

### `D^4`

Runtime derives `sheetDegree = D^4` and downstream code reuses that number as `mapDegree` / `mapDegreePerStep`. No sealed Lean degree definition or theorem proves `deg(P_D)=D^4`.

**Classification:** `UNFORMALIZED`.

### `(D^4)^n` / `D^(4n)`

Runtime stores the structured pair `{baseDegree: D^4, exponent: n}`. Exact repository audit finds no sealed theorem named `iteratedDegreeIdentity` and no equivalent degree theorem.

**Classification:** `UNFORMALIZED`.

A bare arithmetic identity, even if easy to prove, would not by itself establish an iterated map-degree theorem.

### `W` and the base hypersurface

Runtime stores only `symbol = W`, `representation = unresolved`, and refuses to draw geometry. F02–F04 define no `W`, no `lambda`, and no theorem identifying a formal set with `W^{-1}(lambda)`; F04 quantifies over arbitrary `X : Set Point4`.

**Classification:** `NO_BRIDGE`.

### Sheets / coverings / étale / torus / Jacobians / differentials / metric geometry

No runtime sheet objects are materialized and no such mathematical structures exist in sealed F02–F04 Lean source.

**Classification:** `NO_BRIDGE` for the mathematical structures. Runtime guards such as `sheetsMaterialized = false` and `geometryRendered = false` are `ENGINEERING_ONLY`.

## Matrix summary

The canonical machine-readable matrix remains **22 rows**:

```text
EXACT_BRIDGE:      4
PARTIAL_BRIDGE:    3
ENGINEERING_ONLY:  5
FORMAL_ONLY:       3
UNFORMALIZED:      3
NO_BRIDGE:         4
```

## Not Formally Verified

The sealed formal layer does **not** verify:

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

Runtime numbers named `metricScale`, `sheetDegree`, `mapDegree`, or `iteratedDegreeExpression` do not remove any item from this list.

## Verifier interpretation rule

A Node verifier pass establishes only its encoded engineering assertions. In particular:

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

Conversely, Lean theorems about arbitrary sets and function iteration do not verify JavaScript validation, DOM state, immutability, browser behavior, or rendering.

## Fresh execution evidence

Historical F04 execution evidence exists but is not counted as fresh F05 evidence.

For F05, the available shell reconstructed the exact canonical runtime/verifier files from GitHub and verified their Git blob SHAs before execution. **11/11** runtime/verifier blobs matched canonical GitHub byte-for-byte. The fresh commands then passed:

```text
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
```

All five historical `node --check` syntax checks also passed.

The four Lean theorem-source blobs under `formal/SelfSimilarCY` were likewise reconstructed and verified byte-for-byte against canonical GitHub SHAs. A fresh command-line scan found no `axiom`, `sorry`, or `admit` matches.

This shell does **not** contain `lean`, `lake`, or `elan`, and outbound network/DNS is unavailable. The repository has no existing GitHub Actions workflow, and adding one in F05 would violate the F05/F06 boundary. Therefore these mandatory fresh Lean commands remain unexecuted:

```bash
cd formal
lake build
lake env lean SelfSimilarCY/CoordinatePower.lean
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
lake env lean SelfSimilarCY/PullbackTower.lean
```

An actual repository checkout must also finish with clean `git status` before sealing. Historical F04 Lean execution is not substituted for these F05 gates.

## Scope result

The F05 branch remains audit/documentation-only. It does not modify Lean theorem source, runtime JavaScript, `data/system.json`, dependency files, GitHub Actions, or introduce F06 work.

## Stopping point

The semantic audit, canonical Node regression, JavaScript syntax checks, and canonical placeholder scan have passed. Fresh Lean execution remains mandatory, so F05 remains:

```text
audit complete
Node regression = passed
placeholder scan = passed
Lean regression = pending
canonicalState = unsealed
```

No sealing commit and no fast-forward of `main` is permitted yet.

The next milestone remains:

```text
F06 — GitHub CI Integration & Formal Verification Seal
```

F06 must not begin before F05 is actually sealed.

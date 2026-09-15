# Formal Verification Progress — v0.05

## Milestone

**Thread F05 — Contract Bridge Audit**

Status: **audit complete / fresh regression pending / unsealed**

Date: 2026-09-15

Canonical F04 parent:

```text
f1602a09ea24e4d71b9352dfc0c3c2602094ed56
formal: seal F04 pullback tower
```

Working branch:

```text
formal-f05-contract-bridge-audit
```

## Gate 0

Canonical GitHub `main` was exact-read and confirmed at `f1602a09ea24e4d71b9352dfc0c3c2602094ed56` with sole parent:

```text
db443db8e21149fbd41d02a500f19a0193b5b7e1
formal: linearize F04 pullback tower after recovery audit
```

The F04 state exact-read as:

```text
status = passed
canonicalState = sealed
verifiedImplementationCommit = db443db8e21149fbd41d02a500f19a0193b5b7e1
```

The F05 branch was then created from the exact F04-sealed HEAD. Initial GitHub compare reported:

```text
status = identical
ahead_by = 0
behind_by = 0
merge_base = f1602a09ea24e4d71b9352dfc0c3c2602094ed56
```

## Exact source audit

All canonical artifacts requested by F05 were read from the repository rather than inferred from tags or memory. The audit covered the runtime JS/JSON contracts, all four historical Node verifiers, v0.01–v0.06 runtime documentation, F01–F04 formal documentation/state/progress, pinned toolchain/dependency files, and sealed F02–F04 Lean source.

Repository search found no `iteratedDegreeIdentity`.

The exact sealed formal core remains:

```lean
abbrev Point4 := Fin 4 → ℂ

def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

```lean
theorem coordinatePower_iterate
    (D n : ℕ) :
    (coordinatePower D)^[n] = coordinatePower (D ^ n)
```

```lean
def pullbackTower (D : ℕ) (X : Set Point4) : ℕ → Set Point4
  | 0 => X
  | Nat.succ n => coordinatePower D ⁻¹' pullbackTower D X n
```

with the sealed iterate-preimage and coordinate-power-preimage theorems.

## Bridge result

The machine-readable matrix has **22 rows**:

```text
EXACT_BRIDGE:     4
PARTIAL_BRIDGE:   3
ENGINEERING_ONLY: 5
FORMAL_ONLY:      3
UNFORMALIZED:     3
NO_BRIDGE:        4
```

Major exact semantic bridges:

- exactly four coordinates ↔ `Point4 := Fin 4 → ℂ`;
- structured coordinate-power map ↔ `coordinatePower`;
- one-step inverse-image relation ↔ F04 recurrence at depth one;
- recursive structural predecessor relation ↔ `pullbackTower_succ`.

Major partial bridges:

- runtime `D` accepts only `D >= 2` with JS safe-integer guards, while Lean quantifies over all `ℕ`;
- runtime recurrence/documented tower corresponds to the formal iterate-preimage theorem, but runtime does not compute set preimages;
- `requestedDepth` is a materialization target, not the same operational object as Lean tower index `n`.

Formal-only results include `coordinatePower_unique`, the combined coordinate-power iteration theorem, and the closed form using `coordinatePower (D^n)`.

Unformalized runtime expressions include `D^2`, `D^4`, and `(D^4)^n`; no sealed theorem upgrades them to metric scaling or map-degree claims.

`W`, the actual level set `W^(-1)(lambda)`, Calabi–Yau geometry, coverings, étale/torus structure, sheets, Jacobians, differentials, and metric pullback remain without a valid formal bridge.

## Critical historical trap audit

No theorem `iteratedDegreeIdentity` exists in the canonical repository.

Therefore:

```text
runtime {baseDegree: D^4, exponent: n}
```

is **not** bridged to a sealed Lean theorem, and certainly does not imply:

```text
deg(P_D)=D^4
deg(P_D^[n])=D^(4n)
```

Those remain explicit non-claims.

## Regression status

Historical F04 execution evidence is present but is not counted as fresh F05 evidence.

The current assistant execution environment exposes Node but does not expose `lean` or `lake`, and its shell cannot network-clone the private repository. Consequently the required fresh F05 commands have not been truthfully executed here.

Pending seal commands remain:

```bash
cd formal

lake build

lake env lean SelfSimilarCY/CoordinatePower.lean
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
lake env lean SelfSimilarCY/PullbackTower.lean

cd ..

node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js

grep -RInE '\b(axiom|sorry|admit)\b' formal/SelfSimilarCY || true

git status
```

Because this gate is mandatory, F05 cannot be sealed in this execution environment.

## Scope discipline

The staged F05 candidate is documentation/audit only. It introduces no Lean theorem, runtime semantic change, `data/system.json` change, dependency change, GitHub Actions change, or F06 implementation.

Expected changed files are exactly:

```text
docs/CONTRACT_BRIDGE_AUDIT_self_similar_cy_visualizer_v0_05.md
docs/contract_bridge_matrix_self_similar_cy_visualizer_v0_05.json
docs/state_formal_verification_self_similar_cy_visualizer_v0_05.json
docs/progress_formal_verification_self_similar_cy_visualizer_v0_05.md
```

## Current decision

The semantic bridge audit itself is complete and source-backed, but the seal condition is not yet satisfied.

```text
F05 CONTRACT BRIDGE AUDIT:
AUDIT COMPLETE / REGRESSION PENDING / UNSEALED
```

No non-force fast-forward of `main` is permitted yet.

The next milestone, **only after F05 is actually sealed**, is:

```text
F06 — GitHub CI Integration & Formal Verification Seal
```

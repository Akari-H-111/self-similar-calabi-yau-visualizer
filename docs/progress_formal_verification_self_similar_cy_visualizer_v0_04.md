# Formal Verification Progress — v0.04

## Milestone

**Thread F04 — Pullback Tower**

Status: **passed / sealed**

Date: 2026-09-15

Canonical mathematical parent:

```text
b85c295540996612633bf7d702098ba9634882fe
formal: seal F03 iteration theorem
```

Publication base after document-recovery milestones:

```text
470109b3b90c0f3b6025b4902b4c4431a7ccd05d
docs: seal R02 historical consistency audit
```

Verified implementation commit:

```text
db443db8e21149fbd41d02a500f19a0193b5b7e1
formal: linearize F04 pullback tower after recovery audit
```

Working branch:

```text
formal-f04-pullback-tower-linearized
```

## Canonical and history audit

F04 was originally staged from the exact sealed F03 commit. While F04 execution was being prepared, the independent R01/R02 document-recovery line advanced `main` by six commits under `docs/recovery/*` only. GitHub compare showed the old F04 branch and the new `main` had diverged with merge base equal to sealed F03.

To preserve both histories without a merge commit, force update, or history rewrite, the exact F04 file set was replayed onto current `main` as a new linearized commit. A fresh compare then showed:

```text
base:       main @ 470109b3b90c0f3b6025b4902b4c4431a7ccd05d
head:       db443db8e21149fbd41d02a500f19a0193b5b7e1
status:     ahead
ahead_by:   1
behind_by:  0
merge-base: 470109b3b90c0f3b6025b4902b4c4431a7ccd05d
```

The changed files remained exactly the six intended F04 artifacts. No `docs/recovery/*` file was altered by F04.

## Formal result

`formal/SelfSimilarCY/PullbackTower.lean` defines the native set-theoretic tower

```lean
def pullbackTower (D : ℕ) (X : Set Point4) : ℕ → Set Point4
  | 0 => X
  | Nat.succ n => coordinatePower D ⁻¹' pullbackTower D X n
```

and proves

```lean
theorem pullbackTower_eq_iterate_preimage
    (D : ℕ) (X : Set Point4) (n : ℕ) :
    pullbackTower D X n = ((coordinatePower D)^[n]) ⁻¹' X
```

plus the sealed-F03 corollary

```lean
theorem pullbackTower_eq_coordinatePower_preimage
    (D : ℕ) (X : Set Point4) (n : ℕ) :
    pullbackTower D X n = (coordinatePower (D ^ n)) ⁻¹' X
```

No second coordinate-power definition or second iteration proof is introduced.

## Pinned environment

The dependency environment remained unchanged:

```text
Lean:    leanprover/lean4:v4.34.0
Lake:    5.0.0-src+293d5d0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

No `lake update` was performed.

## Fresh execution evidence

The exact linearized implementation commit `db443db8e21149fbd41d02a500f19a0193b5b7e1` was checked out in GitHub Codespaces with a clean working tree.

Observed toolchain:

```text
Lean 4.34.0
Lake 5.0.0-src+293d5d0
```

Required Lean gates passed:

```text
lake build
Build completed successfully (8929 jobs).
```

and

```text
lake env lean SelfSimilarCY/PullbackTower.lean
```

completed with no Lean diagnostics.

All four historical runtime regressions passed:

```text
scene-spec v0.03 verification: passed
base-renderer v0.04 verification: passed
one-step pullback v0.05 verification: passed
recursive lazy expansion v0.06 verification: passed
```

The placeholder scan produced no `axiom`, `sorry`, or `admit` matches, and final `git status` reported:

```text
nothing to commit, working tree clean
```

## Scope audit

Relative to the publication base, F04 changes only:

- `formal/SelfSimilarCY/PullbackTower.lean`;
- `formal/SelfSimilarCY.lean`;
- `formal/README.md`;
- `docs/PULLBACK_TOWER_self_similar_cy_visualizer_v0_04.md`;
- `docs/state_formal_verification_self_similar_cy_visualizer_v0_04.json`;
- `docs/progress_formal_verification_self_similar_cy_visualizer_v0_04.md`.

F04 introduces no runtime JavaScript change, dependency change, GitHub Actions, `W` geometry, degree theorem, sheet model, covering/étale claim, metric theorem, or F05/F06 implementation.

## Seal decision

All F04 acceptance gates are satisfied.

\[
\boxed{\text{F04 Pullback Tower: PASSED / SEALED}}
\]

Publication to `main` is permitted only by non-force fast-forward after the final seal compare confirms the same scope.

F04 stops here. The next milestone is **F05 — Contract Bridge Audit**.

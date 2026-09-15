# Pullback Tower — Formal Verification v0.04

## Milestone

**Thread F04 — Pullback Tower**

Status: **passed / sealed**

Canonical mathematical parent:

```text
b85c295540996612633bf7d702098ba9634882fe
formal: seal F03 iteration theorem
```

Publication base:

```text
470109b3b90c0f3b6025b4902b4c4431a7ccd05d
docs: seal R02 historical consistency audit
```

Verified implementation commit:

```text
db443db8e21149fbd41d02a500f19a0193b5b7e1
formal: linearize F04 pullback tower after recovery audit
```

## Goal

For arbitrary

\[
X \subseteq \mathrm{Point4},
\]

formalize

\[
X_0=X,\qquad X_{n+1}=P_D^{-1}(X_n),
\]

where `P_D = coordinatePower D`, and prove

\[
\boxed{X_n=((P_D)^{[n]})^{-1}(X)}.
\]

Then use sealed F03 directly to obtain

\[
\boxed{X_n=P_{D^n}^{-1}(X)}.
\]

## Sealed dependencies

F04 imports `SelfSimilarCY.CoordinatePowerIteration` and does not redefine:

```lean
abbrev Point4 := Fin 4 → ℂ

def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

It reuses the sealed theorem

```lean
theorem coordinatePower_iterate
    (D n : ℕ) :
    (coordinatePower D)^[n] = coordinatePower (D ^ n)
```

without rebuilding coordinate arithmetic.

## Representation

The canonical tower uses native mathlib sets and function preimages:

```lean
def pullbackTower (D : ℕ) (X : Set Point4) : ℕ → Set Point4
  | 0 => X
  | Nat.succ n => coordinatePower D ⁻¹' pullbackTower D X n
```

No project-specific preimage abstraction, pullback category, or geometric structure is introduced.

## Theorems

```lean
@[simp]
theorem pullbackTower_zero (D : ℕ) (X : Set Point4) :
    pullbackTower D X 0 = X

@[simp]
theorem pullbackTower_succ (D : ℕ) (X : Set Point4) (n : ℕ) :
    pullbackTower D X n.succ = coordinatePower D ⁻¹' pullbackTower D X n
```

Main theorem:

```lean
theorem pullbackTower_eq_iterate_preimage
    (D : ℕ) (X : Set Point4) (n : ℕ) :
    pullbackTower D X n = ((coordinatePower D)^[n]) ⁻¹' X
```

F03 corollary:

```lean
theorem pullbackTower_eq_coordinatePower_preimage
    (D : ℕ) (X : Set Point4) (n : ℕ) :
    pullbackTower D X n = (coordinatePower (D ^ n)) ⁻¹' X
```

No hypothesis `D >= 2` is added. The generic result naturally covers `n = 0`, `n = 1`, `D = 0`, `D = 1`, `X = ∅`, and `X = Set.univ`.

## Pinned environment

```text
Lean:    leanprover/lean4:v4.34.0
Lake:    5.0.0-src+293d5d0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

Relevant pinned APIs audited before implementation include `Function.iterate_zero`, `Function.iterate_succ`, `Function.iterate_succ_apply`, `Set.ext`, `Set.preimage_id`, `Set.preimage_comp`, `Set.preimage_comp_eq`, `Set.preimage_iterate_eq`, and `Set.preimage_preimage`.

## Linearization

F04 was first staged from sealed F03. R01/R02 later advanced `main` only through `docs/recovery/*`, so the original F04 branch diverged from `main`. F04 was therefore replayed byte-for-byte onto the R02-sealed `main` as the single linearized implementation commit above.

No merge commit, force push, reset, or history rewrite was used. The linearized compare showed `ahead_by = 1`, `behind_by = 0`, with merge base equal to current `main`.

## Fresh execution evidence

The exact linearized implementation commit was executed in GitHub Codespaces.

```text
Lean 4.34.0
Lake 5.0.0-src+293d5d0
```

```text
lake build
Build completed successfully (8929 jobs).
```

```text
lake env lean SelfSimilarCY/PullbackTower.lean
```

completed without diagnostics.

All four historical regressions passed:

```text
scene-spec v0.03 verification: passed
base-renderer v0.04 verification: passed
one-step pullback v0.05 verification: passed
recursive lazy expansion v0.06 verification: passed
```

The placeholder scan found no `axiom`, `sorry`, or `admit`, and `git status` reported a clean working tree.

## Explicit non-claims

F04 does not formalize or claim:

- `W`, `W = 0`, or Calabi–Yau hypersurface geometry;
- smoothness or singularity structure;
- algebraic-geometric or topological map degree;
- sheet objects, coverings, étale maps, or torus restrictions;
- Jacobians, differentials, metric scaling, or `P_D^* g_log = D^2 g_log`;
- renderer geometry, WebGL, Three.js, or a JS↔Lean bridge;
- GitHub Actions or CI;
- F05 or F06 implementation.

## Final decision

All F04 execution, source, scope, and ancestry gates are satisfied.

\[
\boxed{\textbf{F04 Pullback Tower: PASSED / SEALED}}
\]

F04 stops here. The next milestone is **F05 — Contract Bridge Audit**.

# Pullback Tower — Formal Verification v0.04

## Milestone

**Thread F04 — Pullback Tower**

Status: **implementation staged / execution pending / unsealed**

Canonical parent:

```text
b85c295540996612633bf7d702098ba9634882fe
formal: seal F03 iteration theorem
```

Working branch:

```text
formal-f04-pullback-tower
```

## Goal

For an arbitrary set

\[
X \subseteq \mathrm{Point4},
\]

formalize the recursive preimage tower

\[
X_0=X,\qquad X_{n+1}=P_D^{-1}(X_n),
\]

where `P_D` is the sealed F02 `coordinatePower D`, and prove

\[
X_n=((P_D)^{[n]})^{-1}(X).
\]

Then use the sealed F03 theorem

\[
(P_D)^{[n]}=P_{D^n}
\]

to obtain directly

\[
X_n=P_{D^n}^{-1}(X).
\]

## Sealed dependencies

F04 imports `SelfSimilarCY.CoordinatePowerIteration`. It does not redefine either

```lean
abbrev Point4 := Fin 4 → ℂ
```

or

```lean
def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

and it reuses the sealed F03 theorem

```lean
theorem coordinatePower_iterate
    (D n : ℕ) :
    (coordinatePower D)^[n] = coordinatePower (D ^ n)
```

rather than re-proving coordinate arithmetic.

## Pinned mathlib API audit

The dependency environment remains exactly:

```text
Lean:    leanprover/lean4:v4.34.0
Lake:    5.0.0-src+293d5d0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

Before implementation, the exact pinned mathlib source was audited. Relevant available APIs include:

```lean
Function.iterate_zero
Function.iterate_succ
Function.iterate_succ_apply
Set.ext
Set.preimage_id
Set.preimage_comp
Set.preimage_comp_eq
Set.preimage_iterate_eq
Set.preimage_preimage
```

In particular, the pinned source states definitionally:

```lean
@[simp]
theorem Function.iterate_succ (n : ℕ) :
    f^[n.succ] = f^[n] ∘ f := rfl
```

and provides the native preimage/iterate compatibility theorem

```lean
theorem Set.preimage_iterate_eq {f : α → α} {n : ℕ} :
    Set.preimage f^[n] = (Set.preimage f)^[n]
```

as well as standard set extensionality.

## Representation decision

F04 uses the native type

```lean
Set Point4
```

and mathlib's ordinary function preimage notation. No project-specific preimage object, predicate wrapper, pullback category, or geometric abstraction is introduced.

The canonical tower is:

```lean
def pullbackTower (D : ℕ) (X : Set Point4) : ℕ → Set Point4
  | 0 => X
  | Nat.succ n => coordinatePower D ⁻¹' pullbackTower D X n
```

This is the minimum representation matching the mathematical recurrence and remains suitable for the later F05 contract bridge.

## F04 theorem statements

The recursive equations are exposed by:

```lean
pullbackTower_zero
pullbackTower_succ
```

The main theorem is:

```lean
theorem pullbackTower_eq_iterate_preimage
    (D : ℕ) (X : Set Point4) (n : ℕ) :
    pullbackTower D X n = ((coordinatePower D)^[n]) ⁻¹' X
```

The F03 corollary is:

```lean
theorem pullbackTower_eq_coordinatePower_preimage
    (D : ℕ) (X : Set Point4) (n : ℕ) :
    pullbackTower D X n = (coordinatePower (D ^ n)) ⁻¹' X
```

The latter is obtained by rewriting with `coordinatePower_iterate`. It does not establish a second iteration proof.

## Boundary cases

No hypothesis `D >= 2` is introduced. The set-theoretic recurrence and function iteration are defined for every `D : ℕ` and `n : ℕ`, so the generic statements are intended to cover naturally:

- `n = 0`;
- `n = 1`;
- `D = 0`;
- `D = 1`;
- `X = ∅`;
- `X = Set.univ`.

No duplicate boundary-case lemmas are added because the generic theorem already contains them.

## Explicit non-claims

F04 does not formalize or claim:

- `W`, `W = 0`, or any Calabi–Yau hypersurface geometry;
- smoothness or singularity structure;
- algebraic-geometric or topological map degree such as `deg(P_D)=D^4`;
- sheet objects, `D^4` sheets, coverings, étale maps, torus restrictions, or nonvanishing loci;
- Jacobians, differentials, metric scaling, or `P_D^* g_log = D^2 g_log`;
- renderer geometry, recursive visualization, WebGL, Three.js, or a JS↔Lean bridge;
- GitHub Actions or CI integration.

No `axiom`, `sorry`, or `admit` is permitted.

## Required execution gates

The staged source is not accepted or sealed until the exact branch is executed with:

```bash
cd formal
lake build
lake env lean SelfSimilarCY/PullbackTower.lean
cd ..
```

followed by fresh historical runtime regressions:

```bash
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
```

and a source scan such as:

```bash
grep -nE '\b(axiom|sorry|admit)\b' formal/SelfSimilarCY/PullbackTower.lean || true
```

Source review and pinned-API inspection are not substitutes for the required Lean execution.

## Stopping point

Until all execution and compare gates succeed, the only valid milestone state is

\[
\boxed{\text{F04 IMPLEMENTATION STAGED / UNSEALED}}.
\]

F05 — Contract Bridge Audit must not begin inside this thread.

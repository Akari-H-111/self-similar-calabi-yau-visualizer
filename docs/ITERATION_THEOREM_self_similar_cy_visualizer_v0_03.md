# Iteration Theorem — Formal Verification v0.03

## Milestone

**Thread F03 — Iteration Theorem**

Status: **implementation staged / execution pending / unsealed**

Canonical parent:

```text
5904db171c96f130ea0c39b124c83751931a23ee
formal: seal F02 coordinate power map
```

Working branch:

```text
formal-f03-iteration-theorem
```

## Goal

Using the sealed F02 definition

\[
P_D(z_1,z_2,z_3,z_4)=(z_1^D,z_2^D,z_3^D,z_4^D),
\]

prove in Lean that function iteration satisfies

\[
(P_D)^{[n]}(z)_i=z_i^{D^n},
\]

and therefore

\[
(P_D)^{[n]}=P_{D^n}.
\]

Here `^[n]` is Lean/mathlib function iteration. It is not pointwise power, map degree, pullback multiplicity, or a sheet count.

## Sealed dependency

F03 imports `SelfSimilarCY.CoordinatePower` and does not modify or redeclare:

```lean
abbrev Point4 := Fin 4 → ℂ

def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

The existing F02 theorems `coordinatePower_apply` and `coordinatePower_unique` remain unchanged.

## Canonical theorem statements

The pointwise theorem is the core milestone:

```lean
theorem coordinatePower_iterate_apply
    (D n : ℕ) (z : Point4) (i : Fin 4) :
    (coordinatePower D)^[n] z i = z i ^ (D ^ n) := by
  ...
```

The map-level equality is its direct extensional corollary:

```lean
theorem coordinatePower_iterate
    (D n : ℕ) :
    (coordinatePower D)^[n] = coordinatePower (D ^ n) := by
  ...
```

## Minimal assumptions

No hypothesis `D >= 2` is added. The runtime scene contract imposes `D >= 2`, but the mathematical function and iteration formula are defined for every `D : ℕ`.

Consequently the same theorem covers without special axioms or side conditions:

- `n = 0`, where the iterate is the identity and `D^0 = 1`;
- `n = 1`;
- `D = 0`;
- `D = 1`.

## Proof strategy

The proof is deliberately explicit and audit-friendly.

1. Induct on `n`, generalizing the input point `z`.
2. For the successor step, use the pinned `Function.iterate` semantics

   ```lean
   f^[n.succ] x = f^[n] (f x)
   ```

   which is definitionally true in the pinned mathlib source.
3. Apply the induction hypothesis to `coordinatePower D z`.
4. Use the sealed F02 coordinate theorem to rewrite

   \[
   (P_D(z))_i=z_i^D.
   \]

5. Use the ordinary power law

   \[
   (z_i^D)^{D^n}=z_i^{D\,D^n},
   \]

   commute the natural-number factors, and use

   \[
   D^{n+1}=D^nD.
   \]

6. Obtain the map-level corollary by function extensionality.

The proof introduces no project axiom, no admitted theorem, and no custom replacement for mathlib iteration or power theory.

## Pinned-source audit

The project remains pinned to:

```text
Lean:    leanprover/lean4:v4.34.0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

The pinned mathlib source was checked before staging the proof. In `Mathlib/Logic/Function/Iterate.lean`, `Function.iterate_succ_apply` has the exact orientation used here:

```lean
theorem iterate_succ_apply (n : ℕ) (x : α) : f^[n.succ] x = f^[n] (f x) := rfl
```

## Explicit non-claims

F03 does not define or prove:

- `X` or `X_n`;
- `X_n=(P_D^n)^{-1}(X)`;
- `W` or any Calabi–Yau hypersurface geometry;
- preimage/pullback set identities;
- torus or nonvanishing subtypes;
- étale or covering properties;
- map degree, `deg(P_D)=D^4`, or `deg(P_D^n)=D^(4n)`;
- sheet counting or sheet objects;
- metric scaling, `P_D^*g_log=D^2g_log`, or Jacobians;
- renderer geometry, recursive visualization, JS↔Lean bridge, or CI.

## Required execution gates

The staged source may be sealed only after actual execution in the pinned project:

```bash
cd formal
lake build
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
cd ..
```

and then the complete historical runtime regression:

```bash
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
```

Source review alone is not execution evidence.

## Stopping point

Before those commands succeed, the only valid conclusion is

\[
\boxed{\text{F03 IMPLEMENTATION STAGED / UNSEALED}}.
\]

After successful execution and a scope/compare audit, F03 may be sealed. Only then does **F04 — Pullback Tower** become eligible to begin.

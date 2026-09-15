# Iteration Theorem — Formal Verification v0.03

## Milestone

**Thread F03 — Iteration Theorem**

Status: **passed / sealed**

Canonical parent:

```text
5904db171c96f130ea0c39b124c83751931a23ee
formal: seal F02 coordinate power map
```

Verified implementation commit:

```text
f314d20d128cf27f46bb9f603364a6b8bf0b2ee0
formal: stage F03 iteration theorem
```

## Goal and result

Using the sealed F02 map

\[
P_D(z_1,z_2,z_3,z_4)=(z_1^D,z_2^D,z_3^D,z_4^D),
\]

F03 proves in Lean that function iteration satisfies

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

```lean
theorem coordinatePower_iterate_apply
    (D n : ℕ) (z : Point4) (i : Fin 4) :
    (coordinatePower D)^[n] z i = z i ^ (D ^ n)
```

and:

```lean
theorem coordinatePower_iterate
    (D n : ℕ) :
    (coordinatePower D)^[n] = coordinatePower (D ^ n)
```

No hypothesis `D >= 2` is required. The theorem therefore covers `n = 0`, `n = 1`, `D = 0`, and `D = 1` under ordinary natural-number power semantics.

## Proof strategy

The proof is explicit and audit-friendly:

1. induction on `n`, generalizing the point `z`;
2. use the pinned successor semantics `f^[n.succ] x = f^[n] (f x)`;
3. apply the induction hypothesis to `coordinatePower D z`;
4. rewrite with the sealed `coordinatePower_apply` theorem;
5. use the ordinary power multiplication law, commute natural-number factors, and finish with `pow_succ`;
6. obtain the map-level result by function extensionality.

The proof introduces no project axiom, admitted theorem, placeholder, or replacement iteration theory.

## Pinned environment

```text
Lean:    leanprover/lean4:v4.34.0
Lake:    5.0.0-src+293d5d0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

The pinned mathlib source was audited before implementation; `Function.iterate_succ_apply` has the exact orientation used by the proof.

## Execution evidence

The exact implementation commit was executed in GitHub Codespaces with a clean working tree.

Observed ancestry:

```text
HEAD  = f314d20d128cf27f46bb9f603364a6b8bf0b2ee0
HEAD^ = 5904db171c96f130ea0c39b124c83751931a23ee
```

Lean verification:

```text
lake build
Build completed successfully (8928 jobs).
```

and:

```text
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
```

completed without Lean diagnostics.

Fresh historical runtime regressions all passed:

```text
scene-spec v0.03 verification: passed
base-renderer v0.04 verification: passed
one-step pullback v0.05 verification: passed
recursive lazy expansion v0.06 verification: passed
```

The working tree remained clean. A source scan found no `axiom`, `sorry`, or `admit` in `CoordinatePowerIteration.lean`.

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

## Stopping point

All F03 gates are satisfied, so the milestone is sealed at

\[
\boxed{(P_D)^{[n]}=P_{D^n}}.
\]

F03 stops here. The next formal milestone is **F04 — Pullback Tower**.

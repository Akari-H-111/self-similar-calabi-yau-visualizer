# Coordinate Power Map — Formal Verification v0.02

## Milestone

**Thread F02 — Coordinate Power Map**

Status: **implementation staged / execution pending**

Canonical parent:

```text
04d66ee225426b03296c0cf61247de3d567b23d1
formal: bootstrap Lean mathlib verification environment
```

## Goal

Establish one canonical Lean definition of

\[
P_D(z_1,z_2,z_3,z_4)=(z_1^D,z_2^D,z_3^D,z_4^D)
\]

without introducing iteration, pullback-tower, degree, metric, or unresolved Calabi–Yau geometry claims.

## Representation choice

The minimum ambient type needed for the supplied formula is

```lean
abbrev Point4 := Fin 4 → ℂ
```

This represents exactly four complex coordinates and introduces no extra geometric structure.

F02 deliberately does not impose a nonzero-coordinate or torus subtype because the canonical visualizer artifacts supplied to this milestone specify only the four-coordinate formula. Such structure may be added only when a later canonical source requires it.

## Exponent choice

The canonical JavaScript scene contract accepts only integer `D >= 2`. The Lean map itself is defined for every `D : ℕ`:

```lean
def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

This is intentional minimal-assumption design. The map exists mathematically for all natural exponents; the runtime restriction `D >= 2` belongs to a later contract bridge rather than to the definition of the function.

## F02 theorems

The module provides exactly the coordinate-level facts needed to make this definition inspectable and canonical:

```lean
@[simp] theorem coordinatePower_apply ...
```

states

\[
(P_D(z))_i=z_i^D.
\]

```lean
theorem coordinatePower_unique ...
```

proves extensional uniqueness: any function `f : Point4 → Point4` satisfying the same coordinatewise `D`-th-power rule is equal to `coordinatePower D`.

No iteration theorem is included; that is F03.

## Single-source rule

Within the Lean project, `SelfSimilarCY/CoordinatePower.lean` is the sole project-specific definition of `P_D`. `SelfSimilarCY.lean` imports this module and does not redeclare the map.

This mirrors the existing JavaScript contract, where `P_D` is represented only by the structured `coordinate_power` declaration and consumers are forbidden from hard-coding a second source.

## Explicit non-claims

F02 does not prove or define:

- `P_D` iteration;
- `X_n=(P_D^n)^{-1}(X)`;
- `W`;
- concrete Calabi–Yau geometry;
- a torus/nonvanishing subtype;
- `deg(P_D)=D^4` in any algebraic-geometric or topological sense;
- `P_D^*g_log=D^2 g_log`;
- concrete sheets, branches, or renderer objects.

No `axiom`, `opaque` placeholder, or admitted theorem is introduced.

## Acceptance gates

F02 may be sealed only after the staged source passes in the pinned F01 environment:

```bash
cd formal
lake build
lake env lean SelfSimilarCY/CoordinatePower.lean
```

Then, from the repository root, all historical implementation verifiers must still pass:

```bash
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
```

The F02 branch must contain no runtime-source changes and no GitHub Actions work.

## Stopping point

Before execution evidence exists, the correct conclusion is only:

\[
\boxed{\text{F02 source implementation is staged, but the milestone is not yet sealed}}
\]

After successful execution and regression evidence, the next milestone is **F03 — Iteration Theorem**.

# Formal Verification

Status: **formal-v0.02 / Thread F02 — Coordinate Power Map (passed / sealed)**

This directory is the isolated Lean 4 + Lake + mathlib verification layer for the Self-Similar Calabi–Yau Visualizer.

F01 remains sealed as the reproducible toolchain bootstrap. F02 adds exactly one project-specific mathematical object: the canonical four-coordinate power map

\[
P_D(z_1,z_2,z_3,z_4)=(z_1^D,z_2^D,z_3^D,z_4^D).
\]

## Pinned environment

The F01 environment is unchanged:

- Lean: `leanprover/lean4:v4.34.0`
- Lake: `5.0.0-src+293d5d0`
- mathlib: `7801e8406155c31b340d28e2762f754d02b5e9b0`
- dependency lock: `lake-manifest.json`

F02 does not alter dependency resolution.

## Canonical Lean definition

`SelfSimilarCY/CoordinatePower.lean` defines

```lean
abbrev Point4 := Fin 4 → ℂ

def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

The module also contains:

```lean
coordinatePower_apply
coordinatePower_unique
```

The first exposes the coordinate formula. The second proves that any map on `Point4` satisfying the same coordinatewise `D`-th-power rule is equal to `coordinatePower D`.

The JavaScript scene restriction `D >= 2` is intentionally not baked into this definition. The mathematical map exists for every natural exponent; the runtime admissibility condition belongs to the later JS↔Lean contract bridge.

## F02 scope boundary

F02 does **not** formalize:

- iteration `P_D^[n]`;
- the pullback tower `X_n`;
- `W` or Calabi–Yau geometry;
- nonvanishing/torus structure;
- map degree or a theorem `deg(P_D)=D^4`;
- metric pullback or `D^2` scaling;
- sheet objects or renderer behavior.

Those remain later milestones.

## Verification evidence

F02 was executed in GitHub Codespaces on the exact implementation commit

```text
e3904e06c2a7dc1c5107c6e6cd5aecba2af1d283
```

with a clean working tree.

The pinned Lean project reported:

```text
Build completed successfully (8927 jobs).
```

The direct command

```bash
lake env lean SelfSimilarCY/CoordinatePower.lean
```

completed without Lean diagnostics before the regression commands.

The historical Node verification suite then reported all four gates passed:

```text
scene-spec v0.03 verification: passed
base-renderer v0.04 verification: passed
one-step pullback v0.05 verification: passed
recursive lazy expansion v0.06 verification: passed
```

No runtime source, dependency pin, or CI configuration was changed by F02.

Therefore the canonical F02 status is:

```text
passed / sealed
```

## Next milestone

The next formal milestone is **F03 — Iteration Theorem**. It must begin in a separate thread and must not enlarge the sealed F02 scope.

# Formal Verification

Status: **formal-v0.04 / Thread F04 — Pullback Tower (passed / sealed)**

This directory is the isolated Lean 4 + Lake + mathlib verification layer for the Self-Similar Calabi–Yau Visualizer.

F01 remains sealed as the reproducible toolchain bootstrap. F02 remains sealed as the unique canonical definition of the four-coordinate power map. F03 remains sealed as the function-iteration theorem. F04 adds only an abstract set-theoretic preimage tower on top of those sealed dependencies.

## Pinned environment

The dependency environment is unchanged:

- Lean: `leanprover/lean4:v4.34.0`
- Lake: `5.0.0-src+293d5d0`
- mathlib: `7801e8406155c31b340d28e2762f754d02b5e9b0`
- dependency lock: `lake-manifest.json`

F04 does not alter dependency resolution and does not run `lake update`.

## Sealed F02/F03 dependencies

`SelfSimilarCY/CoordinatePower.lean` remains the sole project-specific definition of `P_D`:

```lean
abbrev Point4 := Fin 4 → ℂ

def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

F03 proves:

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

F04 imports this sealed module and does not re-prove coordinate arithmetic.

## F04 representation

The minimal carrier is native:

```lean
Set Point4
```

with ordinary function preimage. No project-specific preimage notion is introduced.

`SelfSimilarCY/PullbackTower.lean` defines:

```lean
def pullbackTower (D : ℕ) (X : Set Point4) : ℕ → Set Point4
  | 0 => X
  | Nat.succ n => coordinatePower D ⁻¹' pullbackTower D X n
```

and proves:

```lean
theorem pullbackTower_eq_iterate_preimage
    (D : ℕ) (X : Set Point4) (n : ℕ) :
    pullbackTower D X n = ((coordinatePower D)^[n]) ⁻¹' X
```

plus the sealed-F03 corollary:

```lean
theorem pullbackTower_eq_coordinatePower_preimage
    (D : ℕ) (X : Set Point4) (n : ℕ) :
    pullbackTower D X n = (coordinatePower (D ^ n)) ⁻¹' X
```

No hypothesis `D >= 2` is added.

## History reconciliation

The original F04 branch was staged directly from sealed F03. R01/R02 later advanced `main` only under `docs/recovery/*`. To preserve both histories, F04 was replayed without content changes onto the R02-sealed `main` as:

```text
db443db8e21149fbd41d02a500f19a0193b5b7e1
formal: linearize F04 pullback tower after recovery audit
```

No merge commit, force push, reset, or history rewrite was used.

## Fresh execution evidence

The exact linearized implementation commit was executed in GitHub Codespaces under the pinned environment.

```text
lake build
Build completed successfully (8929 jobs).
```

```text
lake env lean SelfSimilarCY/PullbackTower.lean
```

completed with no diagnostics.

Historical regressions all passed:

```text
scene-spec v0.03 verification: passed
base-renderer v0.04 verification: passed
one-step pullback v0.05 verification: passed
recursive lazy expansion v0.06 verification: passed
```

The source scan found no `axiom`, `sorry`, or `admit`, and the working tree remained clean.

## F04 scope boundary

F04 does **not** formalize or claim:

- `W`, `W = 0`, or Calabi–Yau geometry;
- smoothness or singularity structure;
- map degree such as `deg(P_D)=D^4`;
- `D^4` sheets, sheet objects, coverings, étale structure, or torus restrictions;
- metric pullback, `D^2` scaling, Jacobians, or differentials;
- renderer geometry, WebGL, Three.js, recursive visualization, or a JS↔Lean bridge;
- GitHub Actions or CI;
- F05 Contract Bridge work.

No runtime JavaScript or dependency pin was modified by F04.

## F04 result

All canonical-source, pinned-API, execution, source-scan, clean-tree, ancestry, and scope gates passed.

```text
F04 PULLBACK TOWER: PASSED / SEALED
```

The next milestone is **F05 — Contract Bridge Audit**. F04 stops here.

# Formal verification

This is the current landing page for the isolated Lean 4 + Lake + mathlib layer of the Self-Similar Calabi–Yau Visualizer. It describes the source currently imported by `SelfSimilarCY.lean`; the F01–F04 narrative retained below is a sealed historical record, not the current module index.

## Current status

The aggregate imports 15 project modules, from the environment bootstrap through coordinate powers, torus/Laurent constructions, critical and differential identities, finite ambient-torus fiber cardinalities, and local implicit-function charts. The source-derived [module status matrix](MODULE_STATUS.md) records every module’s direct imports, principal definitions/theorems, authority, and boundary.

Lean establishes only the exact statements found in those modules. A green formal job does not prove the JavaScript visualizer, all project mathematics, a complete global hypersurface, or a browser/UI behavior.

### Formalized in the current source

- Four-coordinate power and iteration identities.
- Abstract and concrete set-theoretic pullback recurrences.
- `Torus4`, torus-coordinate power, the Laurent expression, and base-fiber definitions.
- Critical-point algebra, a total complex Fréchet differential, and regular-regime surjectivity statements.
- Positive-exponent ambient-torus fiber finiteness and exact finite-set cardinality `D ^ 4`.
- The exact local, neighborhood-scoped implicit-function and regular-level statements in `LaurentImplicit`.

### Explicitly outside the current formal claim

- Full algebraic-geometric smoothness, scheme-theoretic Jacobian criteria, finite étale structure, deck action, or genuine map/covering degree.
- Canonical triviality, Oka-type connectedness, a global hypersurface theorem, or a complete renderer theorem.
- Structural nodes as geometric points, finite sampled levels as complete global levels, or root tuples as sheets.
- Browser, accessibility, camera, or presentation correctness.

The formal `D ^ 4` finite-set cardinality result is not a license to describe runtime structural multiplicity as genuine sheets, a covering degree, or a finite étale theorem.

## Reproduce current formal verification

```bash
cd formal
lake build
lake env lean SelfSimilarCY.lean
rg -n -e '(^|[^[:alnum:]_])(axiom|sorry|admit)([^[:alnum:]_]|$)' SelfSimilarCY --glob '*.lean'
```

Inspect any source-scan match. Project Lean proof sources must not use `axiom`, `sorry`, or `admit` to close a goal, and `lake update` is not a routine repair because the toolchain and lock are part of the reproducible authority.

## Historical F04 record

The following F04 status and chronology are preserved as the historical milestone narrative. Its scope must not be mistaken for the present source-tree inventory.

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

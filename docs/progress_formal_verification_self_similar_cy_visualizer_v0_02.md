# Formal Verification Progress — v0.02

## Milestone

**Thread F02 — Coordinate Power Map**

Status: **passed / sealed**

Date: 2026-09-15

Canonical parent:

```text
04d66ee225426b03296c0cf61247de3d567b23d1
formal: bootstrap Lean mathlib verification environment
```

Verified implementation commit:

```text
e3904e06c2a7dc1c5107c6e6cd5aecba2af1d283
formal: stage F02 canonical coordinate power map
```

Working branch:

```text
formal-f02-coordinate-power
```

## Exact-source audit

The F02 starting state was audited directly from GitHub before implementation.

Both `main` and `formal-f01-bootstrap` pointed to the exact F01 commit above. The pinned Lean/mathlib environment, F01 README, formal plan/state/progress, visualizer plan/specification documents, active runtime modules, and all four historical Node verifiers were read from the canonical repository state.

No prior visualizer milestone was reimplemented.

## Design decision

The supplied canonical formula requires exactly four complex coordinates. F02 therefore introduces the minimal ambient type:

```lean
abbrev Point4 := Fin 4 → ℂ
```

The canonical map is then defined once:

```lean
def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

The JavaScript condition `D >= 2` is not promoted into the function type. That restriction governs accepted runtime scene data, while the mathematical power map itself is naturally defined for every natural exponent. A later contract-bridge milestone may relate the two layers explicitly.

## Formal statements

`coordinatePower_apply` exposes the coordinate formula by definitional reduction.

`coordinatePower_unique` proves extensional uniqueness: if `f : Point4 → Point4` satisfies `f z i = z i ^ D` for every point and coordinate, then `f = coordinatePower D`.

This gives the formal layer a single canonical source for `P_D` without introducing stronger assumptions than the definition needs.

## Scope guards

F02 does not introduce:

- an iteration theorem;
- the pullback tower;
- `W` or a concrete hypersurface representation;
- a torus/nonvanishing subtype;
- a map-degree theorem;
- metric pullback/scaling;
- renderer or JavaScript changes;
- GitHub Actions;
- `axiom`, admitted proof, or opaque placeholder.

The F01 dependency files remain unchanged.

## Files introduced or modified by F02

Created:

- `formal/SelfSimilarCY/CoordinatePower.lean`
- `docs/COORDINATE_POWER_MAP_self_similar_cy_visualizer_v0_02.md`
- `docs/state_formal_verification_self_similar_cy_visualizer_v0_02.json`
- `docs/progress_formal_verification_self_similar_cy_visualizer_v0_02.md`

Modified:

- `formal/SelfSimilarCY.lean` to import `SelfSimilarCY.CoordinatePower`
- `formal/README.md` to describe the F02 contract and verification boundary

Unchanged:

- `formal/lakefile.toml`
- `formal/lean-toolchain`
- `formal/lake-manifest.json`
- `formal/SelfSimilarCY/Basic.lean`
- all visualizer runtime source and historical verifiers

## Execution evidence

F02 was executed in GitHub Codespaces on the exact implementation commit
`e3904e06c2a7dc1c5107c6e6cd5aecba2af1d283` with a clean working tree.

Observed build result:

```text
Build completed successfully (8927 jobs).
```

The direct module check

```bash
lake env lean SelfSimilarCY/CoordinatePower.lean
```

completed without Lean diagnostics before the regression commands.

The historical runtime regression suite then reported:

```text
scene-spec v0.03 verification: passed
base-renderer v0.04 verification: passed
one-step pullback v0.05 verification: passed
recursive lazy expansion v0.06 verification: passed
```

The detailed regression output also reconfirmed the existing runtime guards: unresolved `W` remains unresolved, no concrete pullback geometry or sheet objects were materialized, and recursive expansion remains structurally lazy.

## Seal decision

All F02 acceptance gates are satisfied:

```text
lake_build:             passed
coordinate_module:      passed
legacy_node_regression: passed
```

Therefore F02 is now sealed.

\[
\boxed{\text{F02 Coordinate Power Map: PASSED / SEALED}}
\]

The sealing commit is published to `main` by non-force fast-forward only. No merge commit and no history rewrite are permitted.

## Next milestone

The next formal milestone is **F03 — Iteration Theorem**. F03 must begin in a new thread and must not retroactively enlarge F02 scope.

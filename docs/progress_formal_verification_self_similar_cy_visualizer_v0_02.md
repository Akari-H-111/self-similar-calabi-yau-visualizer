# Formal Verification Progress — v0.02

## Milestone

**Thread F02 — Coordinate Power Map**

Status: **implementation staged / not yet sealed**

Date: 2026-09-15

Canonical parent:

```text
04d66ee225426b03296c0cf61247de3d567b23d1
formal: bootstrap Lean mathlib verification environment
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

## Formal statements staged

`coordinatePower_apply` exposes the coordinate formula by definitional reduction.

`coordinatePower_unique` proves extensional uniqueness: if `f : Point4 → Point4` satisfies `f z i = z i ^ D` for every point and coordinate, then `f = coordinatePower D`.

This gives the formal layer a single canonical source for `P_D` without introducing stronger assumptions than the definition needs.

## Scope guards

The staged F02 change does not introduce:

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

## Files staged in the F02 commit

Created:

- `formal/SelfSimilarCY/CoordinatePower.lean`
- `docs/COORDINATE_POWER_MAP_self_similar_cy_visualizer_v0_02.md`
- `docs/state_formal_verification_self_similar_cy_visualizer_v0_02.json`
- `docs/progress_formal_verification_self_similar_cy_visualizer_v0_02.md`

Modified:

- `formal/SelfSimilarCY.lean` to import `SelfSimilarCY.CoordinatePower`
- `formal/README.md` to describe the staged F02 contract and verification boundary

Unchanged:

- `formal/lakefile.toml`
- `formal/lean-toolchain`
- `formal/lake-manifest.json`
- `formal/SelfSimilarCY/Basic.lean`
- all visualizer runtime source and historical verifiers

## Verification state

Source-level and repository-level scope review is complete, but the current ChatGPT execution environment does not provide Lean/Lake binaries and cannot execute the pinned Codespaces toolchain. Therefore the following gates remain intentionally unclaimed:

```text
lake_build:             not_tested
coordinate_module:      not_tested
legacy_node_regression: not_tested
```

The exact commands required before sealing are:

```bash
cd formal
lake build
lake env lean SelfSimilarCY/CoordinatePower.lean
cd ..
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
```

No successful result should be inferred until those commands are actually observed.

## Stopping point

The F02 implementation is prepared on its own branch, but `main` is deliberately not advanced before execution evidence exists.

\[
\boxed{\text{coordinate-power formalization staged; verification pending}}
\]

After successful execution, F02 can be sealed and only then may **F03 — Iteration Theorem** begin.

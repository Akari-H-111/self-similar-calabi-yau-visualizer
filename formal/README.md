# Formal Verification Bootstrap

Status: **formal-v0.01 / Thread F01 — Lean / Lake / mathlib Bootstrap**

This directory is an isolated Lean 4 + Lake + mathlib environment for future formalization work in the Self-Similar Calabi–Yau Visualizer repository.

F01 verifies only the **formal verification toolchain bootstrap**. It does not claim that project mathematics has already been formally verified.

## Pinned toolchain

- Lean: `leanprover/lean4:v4.34.0`
- Lake: `5.0.0-src+293d5d0` as shipped with Lean 4.34.0
- mathlib: `7801e8406155c31b340d28e2762f754d02b5e9b0`
- dependency lock: `lake-manifest.json`

The mathlib dependency is pinned by exact commit SHA in `lakefile.toml`, and the generated manifest records the same exact revision.

## F01 smoke module

`SelfSimilarCY/Basic.lean` imports `Mathlib` and contains only a tiny environment smoke theorem:

```lean
example : 1 + 1 = 2 := by
  norm_num
```

No project-specific theorem, axiom, opaque placeholder, or mathematical API is introduced in F01.

## Verified commands

The following commands were executed successfully in GitHub Codespaces on 2026-09-15:

```bash
cd formal
lake update
lake exe cache get
lake build
lake env lean SelfSimilarCY/Basic.lean
```

Observed build result:

```text
Build completed successfully (8926 jobs).
```

The repository's historical JavaScript verifiers were then re-run successfully:

```bash
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
```

JavaScript syntax checks for `scene-spec.js`, `base-renderer.js`, `one-step-pullback.js`, `recursive-lazy-expansion.js`, and `app.js` also exited successfully.

## Responsibility boundary

JavaScript/Node remains responsible for the current runtime contracts: JSON validation, validation-before-render ordering, renderer state, one-step pullback state, request-bounded lazy expansion, immutability, and no-eager-materialization guards.

Lean/mathlib is a separate formal branch for mathematical statements introduced in later formal milestones. F01 does not alter the visualizer runtime.

## Build artifacts

`formal/.lake/` is intentionally ignored by Git. `formal/lake-manifest.json` is committed because it is the reproducible dependency-resolution record.

## Next milestone

The next formal milestone is **F02 — Coordinate Power Map**. F02 must be handled in a separate thread and must not be backfilled into F01.

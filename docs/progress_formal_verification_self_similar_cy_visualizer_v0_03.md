# Formal Verification Progress — v0.03

## Milestone

**Thread F03 — Iteration Theorem**

Status: **implementation staged / unsealed**

Date: 2026-09-15

Canonical parent:

```text
5904db171c96f130ea0c39b124c83751931a23ee
formal: seal F02 coordinate power map
```

Working branch:

```text
formal-f03-iteration-theorem
```

## Exact repository/source audit

The canonical repository was read directly before implementation.

Both `main` and `formal-f02-coordinate-power` pointed to exactly
`5904db171c96f130ea0c39b124c83751931a23ee`, whose sole parent is
`e3904e06c2a7dc1c5107c6e6cd5aecba2af1d283`.

The F02 state records `status = passed` and `canonicalState = sealed`, with actual Codespaces evidence for `lake build`, direct `CoordinatePower.lean` compilation, and all four historical Node verifiers.

The requested formal project files, F02 canonical theorem/state/progress files, formal plan, runtime v0.03–v0.06 specifications/state/progress files, runtime modules, and historical Node verifiers were read from the repository canonical commit. The prompt's `@Documents/...` artifacts all had repository-canonical counterparts under `docs/...`; no required artifact was missing.

## Sealed dependency preserved

F03 does not modify `formal/SelfSimilarCY/CoordinatePower.lean`.

The unique F02 definitions remain:

```lean
abbrev Point4 := Fin 4 → ℂ

def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

with `coordinatePower_apply` and `coordinatePower_unique` unchanged.

No second coordinate-power map is introduced.

## Pinned mathlib audit

The dependency environment remains the sealed F01/F02 environment:

```text
Lean:    leanprover/lean4:v4.34.0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

Before staging the proof, the pinned `Mathlib/Logic/Function/Iterate.lean` source was checked. Its successor law is exactly:

```lean
theorem iterate_succ_apply (n : ℕ) (x : α) : f^[n.succ] x = f^[n] (f x) := rfl
```

so the induction proof is written against the pinned function-iteration orientation rather than an assumed one.

## Staged formal implementation

Created:

- `formal/SelfSimilarCY/CoordinatePowerIteration.lean`
- `docs/ITERATION_THEOREM_self_similar_cy_visualizer_v0_03.md`
- `docs/state_formal_verification_self_similar_cy_visualizer_v0_03.json`
- `docs/progress_formal_verification_self_similar_cy_visualizer_v0_03.md`

Modified:

- `formal/SelfSimilarCY.lean` to import the new iteration module;
- `formal/README.md` to record the F03 theorem contract and unsealed verification state.

The staged pointwise theorem is:

```lean
theorem coordinatePower_iterate_apply
    (D n : ℕ) (z : Point4) (i : Fin 4) :
    (coordinatePower D)^[n] z i = z i ^ (D ^ n)
```

The staged map-level corollary is:

```lean
theorem coordinatePower_iterate
    (D n : ℕ) :
    (coordinatePower D)^[n] = coordinatePower (D ^ n)
```

The proof uses induction on `n`, the pinned iterate successor semantics, the sealed coordinate formula, the standard power-multiplication law, natural-number commutativity, and `pow_succ`. The map-level theorem is obtained by function extensionality.

## Minimal-assumption boundary cases

No `D >= 2` hypothesis is added. The theorem statement naturally includes:

- `n = 0`;
- `n = 1`;
- `D = 0`;
- `D = 1`.

The runtime scene restriction `D >= 2` remains a JavaScript contract concern and is not promoted into the mathematical definition or theorem.

## Scope guards

F03 does not introduce:

- `X` or `X_n`;
- pullback/preimage tower theorems;
- `W` or Calabi–Yau geometry;
- torus/nonvanishing subtypes;
- map-degree or iterated-degree theorems;
- metric scaling or Jacobians;
- renderer geometry, recursive visualization, sheet models, or a JS↔Lean bridge;
- GitHub Actions or CI;
- `axiom`, `sorry`, `admit`, or opaque placeholders.

The sealed dependency files remain unchanged:

- `formal/lakefile.toml`
- `formal/lean-toolchain`
- `formal/lake-manifest.json`
- `formal/SelfSimilarCY/Basic.lean`
- `formal/SelfSimilarCY/CoordinatePower.lean`

All runtime JavaScript and historical Node verifier sources remain unchanged by design.

## Execution status

The current ChatGPT execution environment reports Node `v22.16.0`, but does not provide `lean` or `lake`.

Therefore the following required F03 execution gates have **not** yet been satisfied in this thread:

```bash
cd formal
lake build
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
cd ..
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
```

Historical F02 execution evidence is retained as dependency evidence, but it is not substituted for fresh F03 execution evidence.

## Seal decision

F03 is **not sealed** at this stage.

\[
\boxed{\text{F03 Iteration Theorem: IMPLEMENTATION STAGED / UNSEALED}}
\]

`main` must remain at the sealed F02 commit until the Lean build, direct F03 module compile, four Node regressions, and final compare/scope audit all pass.

## Next milestone after seal

Only after F03 is sealed may the project begin **F04 — Pullback Tower**.

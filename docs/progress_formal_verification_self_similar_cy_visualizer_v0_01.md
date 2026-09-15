# Formal Verification Progress — v0.01

## Milestone

**Thread F01 — Lean / Lake / mathlib Bootstrap**

Status: **closed / passed**

Date: 2026-09-15

Canonical parent before F01:

```text
5b60214bb0f108ee111e3f1e78bbf2c9f10d5cce
recursive: add verified v0.06 lazy expansion
```

## Environment resolved

The formal project successfully resolved and used:

```text
Lean (version 4.34.0, x86_64-unknown-linux-gnu, commit 293d5d0c0c3f3dded4688b3ccd6a33939ac5102b, Release)
Lake version 5.0.0-src+293d5d0 (Lean version 4.34.0)
mathlib rev 7801e8406155c31b340d28e2762f754d02b5e9b0
```

`lake update` created `formal/lake-manifest.json` from scratch and checked out the exact mathlib revision required by `formal/lakefile.toml`.

The manifest also records the resolved transitive dependencies, including Plausible, LeanSearchClient, importGraph, ProofWidgets4, aesop, Qq, batteries, and Cli.

## Cache and build

The mathlib cache was retrieved successfully. A subsequent explicit cache command reported no missing files.

The full Lake build completed with:

```text
Build completed successfully (8926 jobs).
```

`lake env lean SelfSimilarCY/Basic.lean` exited successfully after importing `Mathlib` and checking the F01 smoke example.

## Legacy runtime regression

All historical Node verifiers passed after the Lean bootstrap:

```text
scene-spec v0.03 verification: passed
base-renderer v0.04 verification: passed
one-step pullback v0.05 verification: passed
recursive lazy expansion v0.06 verification: passed
```

The recursive verifier reconfirmed request-depth semantics, one-level-at-a-time expansion, structured `(D^4)^n` degree information without sheet materialization, unresolved-`W` preservation, and no-concrete-geometry guards.

JavaScript syntax checks for the five active runtime modules also exited successfully.

## F01 gate table

```text
toolchain_resolution:     passed
dependency_pin:           passed
lake_update:              passed
mathlib_cache_get:        passed
lake_build:               passed
basic_import_smoke:       passed
legacy_node_regression:   passed
js_syntax_check:          passed
browser_runtime:          not_tested
formal_project_theorems:  not_started
```

## Repository effects

F01 adds only the isolated `formal/` project, its reproducibility metadata, the F01 formal-plan/state/progress documents, and a `.gitignore` rule for `formal/.lake/`.

The visualizer runtime source and `data/system.json` are not modified by F01.

`formal/lake-manifest.json` is committed. `formal/.lake/` is intentionally not committed.

## Non-claims

This milestone does **not** claim that `P_D`, its degree, iteration, the pullback tower, Calabi–Yau geometry, `W`, metric scaling, or any other project mathematics has been formally proved in Lean.

The correct conclusion is:

> formal verification toolchain bootstrap passed

## Next milestone

**F02 — Coordinate Power Map**

F02 must start from this sealed state in a separate thread.

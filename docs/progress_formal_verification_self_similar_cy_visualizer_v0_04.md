# Formal Verification Progress — v0.04

## Milestone

**Thread F04 — Pullback Tower**

Status: **implementation staged / execution pending / unsealed**

Date: 2026-09-15

Canonical parent:

```text
b85c295540996612633bf7d702098ba9634882fe
formal: seal F03 iteration theorem
```

Working branch:

```text
formal-f04-pullback-tower
```

## Gate 0 — canonical repository audit

Before F04 implementation, `main` was read directly from GitHub and confirmed at the exact F03 sealing commit above. Its sole parent is the F03 implementation commit

```text
f314d20d128cf27f46bb9f603364a6b8bf0b2ee0
formal: stage F03 iteration theorem
```

whose sole parent is sealed F02:

```text
5904db171c96f130ea0c39b124c83751931a23ee
formal: seal F02 coordinate power map
```

The sealed F03 state was read as:

```text
status: passed
canonicalState: sealed
```

and records fresh successful execution of `lake build`, direct `CoordinatePowerIteration.lean` compilation, all four historical Node verifiers, a clean working tree, and a source scan with no `axiom`, `sorry`, or `admit`.

The F01/F02/F03 formal source, dependency pins, state/progress documents, and theorem contracts were re-read from the sealed repository state. Exact-name lookup through the connected Documents surface did not return the requested standalone document names; because repository artifacts are canonical by project rule, their exact `docs/` counterparts at the sealed commit were used instead of guessing or relying on memory.

## Pinned mathlib API audit

The dependency lock remains unchanged:

```text
Lean:    leanprover/lean4:v4.34.0
Lake:    5.0.0-src+293d5d0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

The exact pinned mathlib source was inspected before implementation. Verified available APIs include:

- `Function.iterate_zero`;
- `Function.iterate_succ`;
- `Function.iterate_succ_apply`;
- `Set.ext`;
- `Set.preimage_id`;
- `Set.preimage_comp`;
- `Set.preimage_comp_eq`;
- `Set.preimage_iterate_eq`;
- `Set.preimage_preimage`.

This audit is revision-specific. No theorem name or simplifier behavior was imported from another mathlib version.

## Representation decision

The minimal representation is native

```lean
Set Point4
```

with ordinary function preimage. This avoids a project-specific pullback object and preserves the exact mathematical content needed for the later contract bridge.

The tower is recursively defined by:

```lean
def pullbackTower (D : ℕ) (X : Set Point4) : ℕ → Set Point4
  | 0 => X
  | Nat.succ n => coordinatePower D ⁻¹' pullbackTower D X n
```

No condition `D >= 2` is added because the abstract recurrence and function iteration are meaningful for all natural `D`.

## Staged formal statements

The new module `formal/SelfSimilarCY/PullbackTower.lean` currently stages:

```lean
pullbackTower_zero
pullbackTower_succ
pullbackTower_eq_iterate_preimage
pullbackTower_eq_coordinatePower_preimage
```

The main theorem states:

```lean
theorem pullbackTower_eq_iterate_preimage
    (D : ℕ) (X : Set Point4) (n : ℕ) :
    pullbackTower D X n = ((coordinatePower D)^[n]) ⁻¹' X
```

and is proved by induction using standard preimage composition semantics.

The F03 corollary states:

```lean
theorem pullbackTower_eq_coordinatePower_preimage
    (D : ℕ) (X : Set Point4) (n : ℕ) :
    pullbackTower D X n = (coordinatePower (D ^ n)) ⁻¹' X
```

and directly rewrites with the sealed theorem `coordinatePower_iterate`.

## Branch discipline

`formal-f04-pullback-tower` was created from the exact sealed F03 SHA. Before staging it pointed byte-for-byte to that commit, so F04 begins as a pure successor of F03.

`main` has not been advanced by F04.

## Scope guards

The staged work introduces no:

- runtime JavaScript modification;
- dependency or manifest modification;
- GitHub Actions work;
- `W` or Calabi–Yau geometry;
- map-degree theorem;
- sheet model or covering claim;
- metric or differential theorem;
- F05 contract-bridge table;
- F06 CI integration.

The F04 source contains no intentional `axiom`, `sorry`, or `admit`; a fresh command-line source scan is still required by the seal gate.

## Execution status

No F04 Lean execution evidence has yet been produced in the required pinned project runtime during this thread. Therefore the following remain **pending**:

```text
lake build
lake env lean SelfSimilarCY/PullbackTower.lean
```

and the fresh historical regressions:

```text
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
```

A clean `git status`, source scan, and final sealed-F03-to-F04 compare are also required before any sealing claim.

## Current decision

The only valid conclusion at this point is:

\[
\boxed{\text{F04 IMPLEMENTATION STAGED / UNSEALED}}.
\]

No F05 work may begin until the pending execution and sealing gates are completed.

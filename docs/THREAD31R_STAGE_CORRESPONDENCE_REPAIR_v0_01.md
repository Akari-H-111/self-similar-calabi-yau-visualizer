# Thread 31R — Stage Correspondence Classification Repair v0.01

## 0. Trigger

Thread 31 implementation passed its original machine/browser/Lean gates and was merged as:

```text
ce1317c3cc32fc7d8a3b9e4795949bea6680df96
```

During the read-only pre-Thread-32 audit, the planned Thread 31 metadata-only seal was halted before merge because a semantic inconsistency was found.

The abandoned seal PR was #46. It was closed unmerged.

## 1. Finding

Classification:

```text
B4 — semantic regression
B2 — verifier blind spot
```

Thread 26 already computes the selected structural stage correspondence dynamically:

- Class A when the selected structural stage has a materialized global geometric stage;
- Class D when that global geometric stage is unavailable.

Thread 31 copied the Thread 26 class into its snapshot but then emitted:

```text
canonicalStageIndex.class = Class A
```

unconditionally in the outer bridge state.

It separately recorded `supportedOnlyWhereThread26SupportsStage = true`, but that did not prevent the state itself from carrying a contradictory Class A label.

## 2. Counterexample

Use:

```text
structural selected depth = 2
global geometric available depths = [0, 1]
global rendered depth = 1
```

Thread 26 correctly reports the selected structural stage correspondence as Class D.

Before this repair, Thread 31 reported its outer `canonicalStageIndex.class` as Class A.

That is not merely a display issue. It violates the Thread 31 claim that the bridge preserves the Thread 26 A/B/C/D classification.

## 3. Repair

Thread 31R makes the outer stage classification delegate to Thread 26:

```text
canonicalStageIndex.class
  := thread26Snapshot.stageCorrespondenceClass

canonicalStageIndex.supported
  := (class == Class A)
```

The Thread 26 snapshot adapter now also rejects unexpected stage classes and rejects any non-Class-D object identity classification.

The UI correspondence field displays the actual current verdict:

- Class A when the selected structural stage is represented by an already materialized global geometric stage;
- Class D when it is not.

## 4. Preserved boundaries

This repair does not change:

- Thread 26 runtime/config/semantics;
- Thread 30 scoped generation semantics;
- Thread 29 generation;
- Thread 25 pullback engine;
- Thread 23 projection;
- hard cap;
- structural/global/scoped depth independence;
- explicit-only scoped generation;
- sheet / covering / geometric zoom truth flags.

## 5. Required regression coverage

Machine verification must cover at least:

```text
selected structural 0, available global [0,1] -> Class A / supported=true
selected structural 2, available global [0,1] -> Class D / supported=false
selected structural 2, rendered global 0, available global [0,1] -> Class D / supported=false
```

Chromium verification must reproduce the structural-depth-2 counterexample and assert both bridge state and public correspondence text report Class D.

## 6. Closure rule

Thread 31R may be sealed only after:

- PR-head full CI succeeds;
- exact-main full CI succeeds;
- Pages succeeds;
- repaired browser evidence succeeds;
- protected Thread 26 / Thread 30 authority blobs remain unchanged.

Only after Thread 31R is canonically sealed may the original Thread 31 canonical seal be attempted again.

## 7. Canonical verification receipt

PR #47 was merged as the single-parent commit `fde4f05270dbe3d5620dfe5b6cc630cc0f51deff` on `main`. Its parent is the Thread 31 implementation commit `ce1317c3cc32fc7d8a3b9e4795949bea6680df96`.

The PR-head Formal Verification run `35452523086` passed. Exact-main Formal Verification run `35455412304` passed all four jobs, including Lean, runtime contracts, publication smoke, and browser evidence. Exact-SHA Pages run `35455412127` succeeded. The dedicated Class D machine verifier also passed locally on the PR head. This receipt records the evidence for the metadata-only seal; it does not change the repair's protected authority blobs.

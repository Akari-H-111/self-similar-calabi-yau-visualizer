# Progress — Self-Similar Calabi–Yau Visualizer v0.18

## Milestone

```text
Thread 17 — Arithmetic Overlay Graphics
candidate version: v0.18
starting canonical version: v0.17
```

## Provenance audit

Thread 17 began only after rechecking exact canonical `main` and Thread 16 seal evidence.

```text
main commit = 10a315458b7321ee0f48e553d533c3519fd99916
tree        = c9917ee4cf6ce750c5320f94e42f3ef33b0506f6
sole parent = 49ece02ada3a3f4aba2077fa86fd494df3c8188a

Thread 16 Formal Verification run #82 / 35257740985 = success
Thread 16 Pages run 35257739889 = success
Thread 16 staging PR #9 = closed, merged=false, draft CI vehicle
```

The immutable `v0.13` release remained published and immutable at commit `e83ed17a5ce8e45e67ef326042a21ec51ba24222`.

No unexpected canonical-main drift or unexpected open PR existed before implementation.

## Governing scope

The v0.02 plan defines Thread 17 as:

```text
Arithmetic Overlay Graphics
```

with the target:

```text
already-supported symbolic/runtime overlays
  -> visible graphical annotations
  -> structural canvas
```

and the exit rule that overlays toggle independently, do not mutate the core recursion model, and cannot imply stronger evidence than their canonical source permits.

Thread 18+ functionality was not started.

## Implemented

- Added `arithmetic-overlay-graphics.js` as a presentation-only projection layer.
- Added `verify_arithmetic_overlay_graphics_v0_18.js`.
- Added native independent checkbox controls for the two admitted overlays.
- Added graphical evidence/provenance attributes and accessible labels.
- Added v0.18 CI and publication-static-smoke wiring.
- Added v0.18 README and contract documentation.
- Kept `data/system.json` unchanged at canonical `requestedDepth=0`.
- Kept all sealed arithmetic/runtime/interaction/camera/branch/formal semantic modules unchanged.

## Supported graphical overlays

Only the existing v0.09 implemented overlay ids are admitted:

```text
coordinate_channels
coordinate_iterate_rule
```

### coordinate_channels

Graphically represented as a symbolic coordinate-channel marker attached to the structural rule-panel edge.

Inherited evidence:

```text
source_backed_structural_representation
formal support = formal_theorem
source = formal/SelfSimilarCY/CoordinatePower.lean
```

### coordinate_iterate_rule

Graphically represented as a symbolic iterate marker attached to the currently focused visible structural level.

Inherited evidence:

```text
formal_theorem
theorem = coordinatePower_iterate_apply
source = formal/SelfSimilarCY/CoordinatePowerIteration.lean
```

No orbit trajectory or geometric preimage is drawn.

## Deferred candidates remain unavailable

The graphical allow-list excludes:

```text
cyclotomic_refinement
torsion_labels
collision_classes
delta_n_divisor
```

Requests for these remain unavailable in the sealed v0.09 model and produce no v0.18 annotation.

No placeholder geometry was introduced.

## Toggle state and domain separation

The four combinations are verifier-covered:

```text
00  both off
10  coordinate_channels only
01  coordinate_iterate_rule only
11  both on
```

Toggle state is presentation/view-request state and does not mutate:

```text
requestedDepth
materializedDepth
selectedDepth
focusedDepth
collapsedDepth
recursive descriptors
camera state
D⁴ organization multiplicity
canonical scene
```

## Structural attachment and layout

The projection consumes the sealed structural layout descriptor rather than copying node spacing constants.

Attachment domains:

```text
coordinate_channels
  -> system_rule_panel_edge

coordinate_iterate_rule
  -> focused_structural_level
```

D⁴ branch badges remain a sealed sibling presentation layer.

The v0.18 verifier checks arithmetic annotation rectangles against v0.17 badge rectangles in covered fixtures.

## Camera and lifecycle behavior

Arithmetic annotations are inserted into the same SVG as the structural diagram and D⁴ badges.

Therefore the existing structural camera `viewBox` transforms the entire composed visual surface without a second camera.

The v0.18 adapter adds no `MutationObserver`, timer, scheduler, or recursive observer loop.

Repeated projection replaces the prior arithmetic root group, preventing duplicate accumulation.

Structural rerenders explicitly reproject the current arithmetic presentation state.

## Truth boundary

Still invariant:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

The v0.09 arithmetic overlay model also remains non-mutating:

```text
recursionModified = false
zoomModified = false
sheetOrganizationModified = false
materializationTriggered = false
```

The new graphics do not strengthen the underlying theorem status.

## Scope audit of changed files

Before final state/progress synchronization, the branch differed from canonical only in allowed presentation/integration/verification/documentation files:

```text
.github/workflows/formal-verification.yml
README.md
app.js
arithmetic-overlay-graphics.js
docs/ARITHMETIC_OVERLAY_GRAPHICS_self_similar_cy_visualizer_v0_18.md
index.html
style.css
verify_arithmetic_overlay_graphics_v0_18.js
```

No sealed semantic module was modified.

## Pre-final-artifact CI

The implementation/CI-wired staging head was:

```text
commit: e2c36346ab9282fe8383b448cd574cd45f2e0abc
tree:   d5c7cd1de2513af8b79f2144bd6b4b6f4c98f89a
```

GitHub Actions Formal Verification:

```text
run #89
run id 35315748774

runtime-contracts        = success
formal-lean              = success
publication-static-smoke = success
```

The runtime job passed every verifier v0.03 through v0.18 plus the source syntax gate.

This is pre-final-artifact evidence only. It does not certify the tree after this state/progress synchronization.

## Regression found and repaired

During integration, the first app refactor would have removed the exact legacy v0.12 canonical overlay-construction call string required by `verify_ux_exposition_v0_12.js`.

The integration was corrected before the v0.18 CI wiring run so that:

- presentation toggles use the new independent view-request state;
- the canonical initialization path still retains the exact legacy call;
- no v0.12 verifier assertion was weakened or removed.

Run #89 confirms the repaired integration passes v0.03–v0.18.

## Formal boundary

No Lean source, toolchain pin, mathlib pin, or theorem changed.

The formal job continues to build and directly compile the sealed core.

The graphical annotations inherit evidence provenance; they are not new Lean-proved geometry.

## Final artifact sync status

This progress file, the v0.18 state file, the v0.18 contract document, and the README update are the final documentation synchronization.

By design they do not certify themselves. Therefore after this sync:

```text
final exact staging tree CI = pending
staging PR #10 close-unmerged = pending
exact-tree canonical replay = pending
main fast-forward = pending
exact-main Formal Verification = pending
exact-SHA Pages = pending
```

## Seal rule

Thread 17 is not sealed merely because the implementation or these documents exist.

Only the exact verified final staging tree, closed-unmerged PR state, one-parent canonical replay, fast-forwarded `main`, exact-main Formal Verification success, and exact-SHA Pages success can complete the seal.

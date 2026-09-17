# Progress — Self-Similar Calabi–Yau Visualizer v0.15

## Milestone
`Thread 14 — Interactive Pullback Tower`

## Baseline gate
Verified before implementation:
```text
main = 97ee38e7f0a8704297621f8fc15f0109c8512751
tree = 6b6948e7d83efdf91c50a73841d71ebbb770ef60
parent = e83ed17a5ce8e45e67ef326042a21ec51ba24222
Formal Verification #49 / 35232440872 = success
  runtime-contracts = success
  formal-lean = success
  publication-static-smoke = success
Pages run 35232440091 = success
v0.13 tag -> e83ed17a5ce8e45e67ef326042a21ec51ba24222
v0.13 release = published / immutable / not prerelease
```

## Implemented
- added `interactive-pullback-tower.js` as an orchestration/controller layer;
- added explicit interaction-request state without editing canonical `data/system.json`;
- added expand, select, structural refocus, presentation collapse, and reveal transitions;
- added state-derived breadcrumb and level controls;
- retained event delegation across full interaction re-renders;
- extended `structural-visualization.js` only to project selected/focused/collapsed presentation state;
- added visible selected/focused SVG state and native-button keyboard focus styling;
- integrated interaction state into `app.js`, `index.html`, static smoke, and CI;
- added `verify_interactive_pullback_tower_v0_15.js`;
- preserved all sealed recursion/focus/organization engines and Lean source unchanged.

## Canonical request discipline
The source scene remains:
```text
runtime scene contract = v0.12
requestedDepth = 0
```
Deeper levels only appear after an explicit interaction request. The derived interaction scene is runtime/UI state and is not written back to the canonical source.

## Transition semantics
```text
expand    -> may materialize exactly one additional structural descriptor depth
select    -> metadata only; no expansion
refocus   -> structural navigation metadata only; no expansion/camera/geometric zoom
collapse  -> presentation hiding only; materialized descriptors remain
reveal    -> presentation restoration only; no new materialization
```

## Frozen truth boundary
```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
cameraTransformApplied = false
W = unresolved
```

## Deliberately unchanged
Byte-for-byte sealed by the new verifier:
```text
scene-spec.js
base-renderer.js
one-step-pullback.js
recursive-lazy-expansion.js
zoom-semantics.js
sheet-branch-organization.js
arithmetic-overlays.js
exposition-layer.js
```
`data/system.json`, the Lean core, and Lean/mathlib pins are also unchanged.

## Error / progress audit
Recovery started by checking the staging branch against the Thread 13 canonical baseline instead of assuming interrupted writes had landed. The interrupted write had not partially changed the branch.

The staged implementation then exposed several historical integration assumptions. They were handled as forward-version compatibility repairs rather than by weakening the underlying semantic checks:

1. v0.04 expected an exact local variable/wiring shape; `app.js` retained a local validated `scene` before assigning `canonicalScene`, preserving validation-before-render semantics.
2. v0.06–v0.09 historical verifiers assumed recursion/focus/organization were always constructed directly in `app.js`; those app-integration gates were made controller-aware while retaining model assertions, source guards, no-app-recursion guards, and sealed runtime boundaries.
3. v0.11 claim-discipline wording had disappeared from the newer presentation layer; README/index wording was restored rather than weakening the fidelity verifier.
4. v0.12 expected the historical overlay/exposition wiring call; `renderInteractionState()` now retains a local `scene = canonicalScene` alias so the existing overlay/exposition contract remains valid.
5. v0.13 required immutable publication provenance that had been omitted from the rewritten README; the v0.13 publication commit/tree/license evidence was restored.
6. v0.14 was updated only to accept organization state obtained through the v0.15 interaction controller as an alternative to the historical direct pipeline; projection-only, no-recursion-in-app, source and truthfulness checks remain.

The apparently large v0.09 verifier diff was separately audited. The deletion count was dominated by multiline-to-single-line formatting changes; theorem provenance, toggle independence, unavailable/deferred overlay handling, malformed-input rejection, source guards, and forbidden-token checks remain present.

## Observed staging evidence
The first full-green staging implementation tree is:
```text
head = 08da5cfdccee608783c371efd82429f1ccaa1999
tree = c7d3c267a709e4ad0d7bcd595b3c37139a8cac66
PR = #7 (draft / CI vehicle / do not merge)
Formal Verification #59 / 35238829762 = success
  runtime-contracts = success
    v0.03 through v0.15 = success
    runtime syntax checks = success
  formal-lean = success
    pinned toolchain/dependency lock = success
    mathlib cache restore = success
    lake build = success
    CoordinatePower direct compile = success
    CoordinatePowerIteration direct compile = success
    PullbackTower direct compile = success
    placeholder rejection = success
  publication-static-smoke = success
```

This run is valid evidence for the implementation tree above. It does **not** self-certify the documentation-sync commit that contains this progress record.

## Final staging seal still required
This state/progress synchronization intentionally creates one new staging tree. Therefore one additional exact-tree full-green staging run is required before canonical replay.

After that exact-tree run succeeds:
1. close staging PR #7 **without merging**;
2. replay the verified final staging tree as exactly one child of `97ee38e7f0a8704297621f8fc15f0109c8512751`;
3. fast-forward `main` to that canonical replay commit;
4. require exact-main Formal Verification success;
5. require GitHub Pages deployment evidence for the exact canonical SHA.

Until those steps occur:
```text
final staging exact-tree CI = pending
exact-main CI = pending
exact-main Pages = pending
```

## Next milestone boundary
Thread 15 — Structural Camera / Zoom Layer has not started. There is no pan, wheel zoom, pinch zoom, fit-to-level camera, viewBox camera navigation, drag canvas, camera matrix, or geometric scaling state in v0.15.

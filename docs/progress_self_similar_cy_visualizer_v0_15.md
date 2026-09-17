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
During recovery after an interrupted tool call, the branch was checked against the Thread 13 canonical baseline. The interrupted `app.js` write had not partially landed; the branch initially contained only the completed interaction controller and structural-projection commits.

Two deterministic pre-CI issues were then identified and repaired:
1. the v0.15 verifier referenced the required v0.15 state artifact before the artifact existed;
2. the v0.14 verifier contained a forward-version app wiring assumption that required direct app-level sheet-organization construction. It was updated to accept either the historical direct pipeline or the v0.15 controller delegation while preserving sealed-blob, projection-only, no-recursion-in-app, and truthfulness checks.

The v0.14 page wording `Structural diagram` and `diagram is structural, not a geometric realization` is retained so historical semantic assertions continue to describe the forward UI honestly.

## Current validation status
Repository-side implementation and verifier wiring are complete enough for a staging PR execution gate. As of this artifact commit:
```text
staging PR = pending
staging runtime-contracts = pending
staging formal-lean = pending
staging publication-static-smoke = pending
exact-main CI = pending after canonical replay
exact-main Pages = pending after canonical replay
```
This document does not self-attest future green CI.

## Next milestone boundary
Thread 15 — Structural Camera / Zoom Layer has not started. There is no pan, wheel zoom, pinch zoom, fit-to-level camera, viewBox camera navigation, drag canvas, camera matrix, or geometric scaling state in v0.15.

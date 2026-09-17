# Interactive Pullback Tower — v0.15

## Scope
Thread 14 adds interactive structural navigation over the existing verified pullback-tower runtime. It does not add camera movement, geometric zoom, concrete `W`, Calabi–Yau geometry, genuine sheets, covering geometry, or a second recursion engine.

## Starting canonical baseline
```text
main: 97ee38e7f0a8704297621f8fc15f0109c8512751
tree: 6b6948e7d83efdf91c50a73841d71ebbb770ef60
parent: e83ed17a5ce8e45e67ef326042a21ec51ba24222
Formal Verification #49 / 35232440872 = success
Pages run 35232440091 = success
v0.13 tag -> e83ed17a5ce8e45e67ef326042a21ec51ba24222
v0.13 release = published / immutable / not prerelease
```

## Architecture
The new controller is `interactive-pullback-tower.js`.

```text
user event
  -> interaction state
  -> sealed RecursiveLazyExpansion / ZoomSemantics / SheetBranchOrganization APIs
  -> structural visualization projection
  -> DOM/SVG render
```

The controller does not define pullback levels, recompute D²/D⁴, enumerate sheets, or implement geometry.

## Canonical request versus interaction request
`data/system.json` remains unchanged with `requestedDepth = 0`.

The interaction layer creates an ephemeral runtime request state. When the user explicitly expands beyond the current requested frontier, the controller creates a derived interaction scene with a larger request and delegates materialization to the existing recursion factory and `expandOneLevel(...)`. The source canonical scene remains unchanged and is retained separately as `sourceScene` / `sourceRequestedDepth`.

## State transitions
- **Expand**: the only interaction allowed to increase structural descriptor materialization. Exactly one additional structural depth may become materialized per transition.
- **Select**: changes selection metadata only. Target must already be materialized and presentation-visible.
- **Refocus**: changes structural focus metadata only through the sealed zoom model. It does not trigger recursive expansion, geometric zoom, or a camera transform.
- **Collapse**: presentation-only hiding of descendants below the selected level. It does not delete recursive descriptors or reduce `materializedDepth`.
- **Reveal**: restores presentation of already materialized descendants without new materialization.

## Breadcrumb contract
Breadcrumb entries are derived from interaction state, not from DOM appearance. They identify the structural path from `X₀` through the deepest active selected/focused depth and mark selected/focused entries explicitly.

The following must remain mutually consistent:
```text
interaction requested depth
materialized depth
presentation-visible depth
selected depth
focused depth
breadcrumb
structural SVG nodes
```

## Truthfulness boundary
```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
cameraTransformApplied = false
W = unresolved
```

A transition may truthfully mark `structuralDescriptorMaterializationTriggered = true` when an expand operation adds a recursive descriptor. That is not geometric or sheet materialization.

## Accessibility floor
Essential actions use native `<button>` controls. Selection and focus expose `aria-pressed`; the selected breadcrumb entry uses `aria-current`; controls have visible `:focus-visible` styling. Event delegation is attached to the persistent interaction container so re-rendering does not destroy interaction behavior.

This is not the final Thread 19 accessibility audit.

## D² / D⁴ discipline
Thread 14 does not promote:
```text
P_D^* g_log = D^2 g_log
deg(P_D) = D^4
```
D² remains runtime metadata. D⁴ remains runtime/organizational metadata.

## Frozen modules
The interaction verifier pins the existing model engines byte-for-byte:
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
Lean source and dependency pins are intentionally unchanged.

## Verifier
`verify_interactive_pullback_tower_v0_15.js` exercises a multi-step sequence including expansion, selection, refocus, presentation collapse, reveal, repeated deterministic sequences, invalid unmaterialized targets, truthfulness invariants, sealed runtime blobs, source-discipline guards, app/index/CI integration, and the v0.15 state artifact.

The v0.14 verifier is retained. Its app-integration assertion is made forward-compatible with a later interaction controller while preserving all projection-only, sealed-blob, and truthfulness checks.

## Non-goals
No Thread 15 camera/pan/wheel/pinch/viewBox navigation, no D⁴ branch graphics, no arithmetic geometry graphics, no renderer redesign, no full accessibility audit, no release candidate work, and no geometry admission.

## Seal policy
Staging PR is a CI vehicle only. After a final green staging tree, close the PR unmerged, replay the exact verified tree as one child of the Thread 13 canonical commit, fast-forward `main`, then require exact-main Formal Verification and exact-SHA Pages deployment evidence.

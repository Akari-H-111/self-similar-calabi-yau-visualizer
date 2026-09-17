# Structural Camera / Zoom Layer — v0.16

**Milestone:** Thread 15 — Structural Camera / Zoom Layer  
**Runtime scene contract:** v0.12  
**Starting canonical commit:** `d40e938c318a8389baccb58223c9f057217ba018`

This document defines the v0.16 structural camera contract. The camera is a presentation-only viewport layer over the finite structural SVG projection. It is not a new mathematical model and it does not reinterpret the existing structural-focus module.

## 1. Scope

v0.16 adds an independent camera / viewport navigation layer with:

- immutable camera state;
- pan;
- wheel zoom;
- pointer-drag pan;
- two-pointer pinch zoom;
- fit-visible-structure;
- fit-selected-level;
- fit-focused-level;
- reset;
- persistent camera state across structural SVG regeneration;
- deterministic SVG `viewBox` projection.

The governing Thread 15 scope was supplied to this engineering thread as `PLAN_self_similar_cy_visualizer_v0_02.md`. That plan was not a tracked file in the starting canonical repository, so this contract does not claim otherwise.

## 2. Starting canonical baseline

Thread 15 starts from the sealed Thread 14 canonical identity:

```text
commit:
d40e938c318a8389baccb58223c9f057217ba018

tree:
2cd18d37b4b5b0c8b400547eadd113a3b686300e

parent:
97ee38e7f0a8704297621f8fc15f0109c8512751
```

External Thread 14 evidence:

```text
Formal Verification
run #61 / 35241064931
head = d40e938c318a8389baccb58223c9f057217ba018
runtime-contracts        = success
formal-lean              = success
publication-static-smoke = success

GitHub Pages
run 35241063761
head = d40e938c318a8389baccb58223c9f057217ba018
conclusion = success
```

The Thread 14 staging PR was closed without merge. Thread 15 development starts from the canonical commit, not from that staging history.

## 3. Semantic separation

The following concepts are distinct:

```text
structural focus
!= camera center
!= camera scale
!= SVG viewBox
!= geometric zoom
!= metric scaling
```

`zoom-semantics.js` remains the sealed `structural_zoom_focus` metadata layer. It is not a camera engine.

`cameraScale` means only presentation-scale of the SVG viewport. It is not `scene.derived.metricScale`, and it does not represent a mathematical pullback metric theorem.

A camera command may read selected/focused depth as a navigation target, but it must not write selected/focused state.

## 4. Architecture

The v0.16 flow is:

```text
InteractivePullbackTower
        |
        v
StructuralVisualization
        |
        | read-only layout descriptor
        v
StructuralCamera
        |
        | presentation-only viewBox
        v
SVG viewport
```

The state domains remain separate:

```text
interaction state
!= structural visualization model
!= structural camera state
```

`structural-visualization.js` exposes deterministic layout metadata but does not import or invoke the camera engine.

## 5. Camera model

`structural-camera.js` owns the camera state. Its public model includes:

```text
canonicalViewBox
contentBounds
centerX
centerY
cameraScale
minScale
maxScale
cameraTransformApplied
```

All numeric inputs are validated as finite values. Width, height, and scale must be positive. Scale bounds must satisfy:

```text
minScale <= 1 <= maxScale
```

Invalid `NaN`, `Infinity`, zero/negative extents, invalid scales, and unavailable level targets are rejected.

Camera transitions return new frozen models rather than mutating the prior camera model.

## 6. Camera transitions

The public transition surface is:

```text
createStructuralCameraModel(...)
panCamera(...)
zoomCamera(...)
fitCameraToBounds(...)
fitCameraToVisibleStructure(...)
fitCameraToLevel(...)
reconcileCameraExtent(...)
resetCamera(...)
applyStructuralCamera(...)
```

`zoomCamera` may anchor zoom at a presentation coordinate. `fitCameraToLevel` consumes the read-only level bounds supplied by the structural visualization layout descriptor.

No transition calls the recursive expansion API.

## 7. Structural re-render persistence

The structural renderer regenerates its SVG markup after accepted interaction transitions. Therefore camera state is not stored exclusively in a transient SVG element.

The application retains the camera model independently and performs:

```text
structural interaction
-> new structural visualization model
-> regenerated SVG
-> new layout descriptor
-> reconcileCameraExtent(previous camera, new extent)
-> applyStructuralCamera(camera, fresh SVG)
```

If the previous camera is identity, reconciliation follows the new canonical structural extent. If the camera is transformed, center and scale are preserved where valid under the new content extent.

## 8. Input surface

v0.16 exposes native buttons for:

```text
Zoom in
Zoom out
Fit visible structure
Fit selected level
Fit focused level
Reset camera
```

The structural surface also supports:

```text
wheel / trackpad zoom
pointer drag pan
two-pointer pinch zoom
```

Wheel handling is attached only to the structural surface and is non-passive because the camera consumes that gesture. Pointer handling is attached to the stable structural container rather than to transient regenerated SVG nodes.

## 9. Truthfulness boundary

The pre-existing project truth boundary remains:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

`cameraTransformApplied` is different. It is a presentation-layer runtime boolean:

```text
identity camera    -> cameraTransformApplied = false
transformed camera -> cameraTransformApplied = true
```

`cameraTransformApplied=true` means only that the displayed structural SVG viewport differs from its current canonical view. It does not imply geometric zoom, metric scaling, Calabi–Yau geometry, sheet materialization, or covering geometry.

Legacy truth domains remain scoped to their own modules. In particular, the sealed structural-focus and structural-visualization models may truthfully retain `cameraTransformApplied=false` because those modules themselves do not apply camera transforms.

## 10. D² / D⁴ discipline

The sealed runtime still uses:

```text
scene.derived.metricScale = D^2
scene.derived.sheetDegree = D^4
```

Their meanings remain:

```text
D² = runtime numeric metadata
D⁴ = runtime numeric / organizational metadata
```

v0.16 does not assert:

```text
P_D^* g_log = D² g_log
deg(P_D) = D⁴
```

The camera module does not read or recompute D² or D⁴.

## 11. Canonical scene discipline

`data/system.json` remains:

```text
requestedDepth = 0
```

Camera actions do not change canonical requested depth, interaction-requested depth, materialized depth, selected depth, focused depth, collapsed depth, or recursive descriptor sequences.

Camera navigation does not materialize levels, sheets, or geometry.

## 12. Frozen modules

The following semantic engines remain sealed in Thread 15:

```text
scene-spec.js
base-renderer.js
one-step-pullback.js
recursive-lazy-expansion.js
zoom-semantics.js
sheet-branch-organization.js
arithmetic-overlays.js
exposition-layer.js
interactive-pullback-tower.js
```

The sealed Lean core, Lean toolchain, and mathlib pin are unchanged. Thread 15 adds no Lean theorem.

`structural-visualization.js` receives only a forward-compatible projection extension: a deterministic, read-only layout descriptor consumed by the new camera layer. Existing structural model semantics and render call shape remain intact.

## 13. Verification

`verify_structural_camera_zoom_v0_16.js` checks:

- deterministic initialization;
- immutable pan and anchored zoom;
- scale bounds;
- fit/reset semantics;
- finite positive view boxes;
- invalid numeric rejection;
- real structural layout descriptors at multiple depths;
- persistence across structural extent changes;
- interaction-state fingerprint preservation;
- the shared SVG viewport adapter;
- source-discipline guards;
- byte-for-byte preservation of sealed runtime engines;
- index/app/style/workflow integration;
- `geometricZoomApplied=false` and no geometry/sheet/covering promotion.

All earlier runtime verifiers continue to run before v0.16. No legacy semantic assertion is removed to make the camera layer pass.

## 14. Error-audit policy

A CI failure is classified before repair as one of:

```text
semantic regression
legacy integration assumption
source guard
syntax/static publication problem
formal regression
verifier fixture defect
```

Verifier assertions are not deleted merely to obtain a green run.

## 15. Accessibility floor

Existing native interaction buttons, keyboard focus behavior, `aria-current`, and `aria-pressed` remain intact. New camera controls are native `<button>` elements with visible focus styling.

This milestone is not the final accessibility or mobile UX audit.

## 16. Non-goals

v0.16 does not implement:

- concrete `W`;
- Calabi–Yau hypersurface geometry;
- genuine D⁴ sheets;
- covering / étale / fiber geometry;
- metric scaling;
- a second recursion engine;
- Canvas/WebGL/Three.js geometry;
- a new mathematical theorem;
- a final accessibility audit or broad responsive redesign.

## 17. Seal policy

The staging branch is a CI vehicle only and its history must not be merged.

After final artifact synchronization:

1. run full CI against the new exact staging tree;
2. require `runtime-contracts`, `formal-lean`, and `publication-static-smoke` all to succeed;
3. close the staging PR with `merged=false`;
4. replay the exact verified staging tree as exactly one child of `d40e938c318a8389baccb58223c9f057217ba018`;
5. fast-forward `main` to that canonical replay commit;
6. require exact-main Formal Verification success;
7. require exact-SHA GitHub Pages success.

Only Git object identity plus exact-SHA external evidence seals Thread 15. This contract, state file, and progress file do not self-certify the milestone.

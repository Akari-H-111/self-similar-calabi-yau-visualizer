# Progress — Self-Similar Calabi–Yau Visualizer v0.16

## Milestone

```text
Thread 15 — Structural Camera / Zoom Layer
candidate version: v0.16
runtime scene contract: v0.12
staging branch: thread15-structural-camera-zoom-v0-16
staging PR: #8 — CI vehicle only / DO NOT MERGE
```

## 1. Starting gate

The thread began only after revalidating the Thread 14 canonical main identity:

```text
commit: d40e938c318a8389baccb58223c9f057217ba018
tree:   2cd18d37b4b5b0c8b400547eadd113a3b686300e
parent: 97ee38e7f0a8704297621f8fc15f0109c8512751
```

Observed Thread 14 external evidence:

```text
Formal Verification run #61 / 35241064931 = success
runtime-contracts = success
formal-lean = success
publication-static-smoke = success

Pages run 35241063761 = success
head = d40e938c318a8389baccb58223c9f057217ba018
```

No pre-existing Thread 15 branch or partial camera implementation was found. `main` had not drifted after the Thread 14 seal.

## 2. Architecture decision

Thread 15 introduced a sibling camera domain instead of reinterpreting `zoom-semantics.js`:

```text
structural focus metadata
!= structural camera state
!= geometric zoom
```

The selected architecture is:

```text
InteractivePullbackTower
-> StructuralVisualization
-> read-only structural layout descriptor
-> StructuralCamera
-> SVG viewBox presentation
```

Camera state remains outside the regenerated SVG DOM so it can survive structural re-renders.

## 3. First implementation slice

Added:

```text
structural-camera.js
verify_structural_camera_zoom_v0_16.js
```

Initial camera model coverage included:

- deterministic identity state;
- pan;
- anchored zoom;
- fit bounds / level / visible structure;
- reset;
- scale bounds;
- finite-number guards;
- extent reconciliation;
- presentation-only truth flags;
- no imports from recursion/focus/math engines.

Runtime CI was wired before browser integration so the pure model could be verified independently.

## 4. Structural layout integration

`structural-visualization.js` received a minimal forward-compatible extension:

```text
LAYOUT_KIND
createStructuralLayoutDescriptor(model)
```

The descriptor exposes the existing deterministic SVG layout as read-only metadata, including canonical view box and per-level bounds.

The structural visualization model semantics and its legacy render call shape were preserved. The module does not import `StructuralCamera`.

## 5. Browser / presentation integration

`app.js`, `index.html`, and `style.css` now provide:

- persistent camera state independent from interaction state;
- native Zoom in / Zoom out controls;
- Fit visible structure;
- Fit selected level;
- Fit focused level;
- Reset camera;
- pointer-anchored wheel zoom;
- pointer drag pan;
- two-pointer pinch zoom;
- camera status exposing presentation-only `cameraScale` and `cameraTransformApplied`;
- responsive SVG viewport behavior;
- structural re-render reconciliation.

`StructuralCamera.applyStructuralCamera(...)` is the single viewport adapter used by the application to apply the camera to the current SVG surface.

## 6. Preserved semantic boundaries

The camera does not modify:

```text
canonical requestedDepth
interaction requestedDepth
materializedDepth
selectedDepth
focusedDepth
collapsedDepth
recursive descriptors
```

The project truth boundary remains:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

Camera truth is scoped separately:

```text
cameraTransformApplied = false  at identity
cameraTransformApplied = true   when the presentation view is transformed
```

This is not a geometry claim.

D² and D⁴ remain runtime / organizational metadata. Camera code does not recompute or reinterpret them.

## 7. Error audit

### 7.1 v0.16 verifier fixture failure

An integration CI run reached the new v0.16 verifier with all legacy v0.03–v0.15 checks green, but the new fixture failed before exercising camera semantics:

```text
TypeError: Interactive pullback tower requires the sealed RecursiveLazyExpansion API.
```

Classification:

```text
verifier fixture defect
not a semantic regression
not a recursion regression
not a formal regression
```

Cause: the Node fixture imported `interactive-pullback-tower.js` without first loading the sealed global dependencies expected by that browser-compatible module.

Repair: explicitly load the existing sealed recursive, zoom, and organization modules in the verifier. No semantic assertion was removed and no sealed runtime source was changed.

### 7.2 Responsive double-viewport finding

Source-level review found that the old v0.15 SVG rule still imposed:

```text
min-width: 760px
```

while v0.16 had changed the outer structural surface from horizontal-scroll presentation to a camera viewport. On a narrow screen this could create an unwanted second clipped viewport.

Repair:

```text
.structural-visualization__surface {
  width: 100%;
  min-width: 0;
}
```

The v0.16 verifier now guards the responsive rule.

### 7.3 Duplicate viewport adapter finding

Source review also found that `app.js` manually repeated SVG `viewBox` / camera dataset application despite `structural-camera.js` already exposing `applyStructuralCamera(...)`.

Repair: the application now reuses the camera module adapter on the SVG surface. A fake-SVG verifier fixture checks the adapter directly.

The camera is applied to the SVG surface rather than the legacy structural-visualization container, so legacy projection truth flags remain scoped to their original domain.

## 8. Pre-final-doc exact-tree evidence

After the implementation and source-audit repairs, exact staging head:

```text
head:
413a75d5d27373b3fd4a11dad1d4713be4d1663e

tree:
ce2445eefd05d2e418f69d0dd925588e6e4ac009
```

received full external CI evidence:

```text
Formal Verification run #73
run id 35252344053
head 413a75d5d27373b3fd4a11dad1d4713be4d1663e

runtime-contracts          = success
formal-lean                = success
publication-static-smoke   = success
```

The runtime-contracts job ran all legacy verifiers plus `verify_structural_camera_zoom_v0_16.js` and the JavaScript syntax checks.

This is the verified **pre-final-doc** implementation tree only.

## 9. Final artifact synchronization

This progress file, the v0.16 contract, v0.16 state JSON, and the README are synchronized after the pre-final-doc full-green gate.

Because that synchronization creates a different Git tree, run #73 cannot seal the final staging tree.

Required next gate after this artifact sync:

```text
final staging exact-tree Formal Verification
runtime-contracts          = success
formal-lean                = success
publication-static-smoke   = success
```

until that run exists, final staging exact-tree status remains pending.

## 10. Remaining seal sequence

After final staging exact-tree full-green:

1. close PR #8 with `merged=false`;
2. do not merge its staging history;
3. replay the exact verified final staging tree as exactly one child of `d40e938c318a8389baccb58223c9f057217ba018`;
4. fast-forward `main` to the replay commit;
5. require exact-main Formal Verification full-green;
6. require exact-SHA GitHub Pages success;
7. only then declare Thread 15 sealed.

## 11. Current truth status

```text
structural camera model exists                  YES
pan / wheel zoom / pointer pan / pinch          YES
fit / reset                                     YES
camera survives structural re-render            YES
camera independent from structural focus        YES
camera modifies recursion                       NO
canonical data/system.json modified             NO
geometricZoomApplied                            false
geometryRendered                                false
sheetsMaterialized                              false
coveringStructureClaimed                        false
W                                               unresolved
legacy semantic gates preserved                 YES
pre-final-doc staging exact-tree full-green      YES
final staging exact-tree full-green             PENDING AFTER DOC SYNC
staging PR closed unmerged                      PENDING
canonical replay                                PENDING
exact-main Formal Verification                  PENDING
exact-SHA Pages                                 PENDING
```

No later milestone has been started by v0.16.

# Structural Visualization Layer — v0.14

## 1. Scope

Thread 13 adds the first deliberately visible graphical structural diagram to the published visualizer. The layer is a projection of already-verified runtime models into SVG. It does not add Calabi–Yau geometry, a concrete `W`, genuine sheets, covering geometry, geometric zoom, or a second recursion engine.

## 2. Starting canonical baseline

```text
repository: Akari-H-111/self-similar-calabi-yau-visualizer
main: e83ed17a5ce8e45e67ef326042a21ec51ba24222
tree: 338a519614ea16ceb2e4a1247fc0c94338929f0c
release/tag: v0.13
release immutable: true
canonical Formal Verification: run #42 / 35215769668 = success
canonical Pages build/deployment: run 35216628078 = success
```

The v0.13 tag points to the same canonical commit. The v0.13 release is published, immutable, and not a prerelease.

## 3. Projection architecture

The new module is:

```text
structural-visualization.js
```

It consumes only existing normalized/verified models:

```text
scene
base_scene
recursive_lazy_expansion
structural_zoom_focus
sheet_branch_organization
```

and produces:

```text
structural_visualization
  -> structural_svg_diagram
```

It does not call `expandOneLevel`, does not recompute `D²` or `D⁴`, does not enumerate sheets, and does not create a geometric representation of `W`.

## 4. Visual semantics

A rendered node means a finite structural level descriptor already present in the recursive model:

```text
X_0, X_1, ..., X_n
```

A rendered edge means the existing structural pullback relation between adjacent materialized descriptors. It is not a geometric curve, covering map, or embedded branch.

The diagram also presents the symbolic rule:

\[
X_n=P_D^{-1}(X_{n-1}),
\qquad
X_n=(P_D^n)^{-1}(X),
\]

and the coordinate-power notation

\[
P_D(z_1,\ldots,z_4)=(z_1^D,\ldots,z_4^D).
\]

These labels do not upgrade any mathematical claim beyond the sealed Lean/runtime scope.

## 5. Canonical depth-zero behavior

The canonical `data/system.json` remains at runtime scene version `v0.12` with:

```text
requestedDepth = 0
```

Therefore the published default structural diagram contains exactly one materialized node, `X_0`, plus the symbolic structural-rule panel. It does not invent or materialize `X_1` merely to make the picture busier.

When a verified recursive model already contains deeper materialized descriptors, the projection deterministically displays those descriptors and the corresponding structural edges.

## 6. Truthfulness boundary

The visualization layer must preserve:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
cameraTransformApplied = false
materializationTriggered = false
W representation = unresolved
```

If its inputs violate this Thread 13 boundary, model creation rejects them instead of silently reinterpreting them.

## 7. D² / D⁴ discipline

Thread 13 does not prove or render:

```text
P_D^* g_log = D^2 g_log
deg(P_D) = D^4
```

`D²` remains runtime metadata. `D⁴` remains runtime/organizational metadata. The SVG explicitly states that no covering structure is claimed.

## 8. Accessibility and static rendering

The diagram is inline SVG with:

- `role="img"`;
- a concise `aria-label`;
- SVG `title` and `desc` content;
- visible textual boundary labels;
- no interaction requirement;
- no animation requirement;
- responsive scaling through `viewBox` and CSS.

This is a source/static accessibility measure, not real assistive-technology certification.

## 9. Verifier scope

`verify_structural_visualization_v0_14.js` checks:

- canonical depth-zero projection;
- deterministic expanded finite fixtures;
- node/edge correspondence to existing recursive descriptors;
- focus correspondence to existing zoom state;
- truthfulness datasets and SVG wording;
- no second recursion/math/geometry engine in the visualization source;
- sealed v0.11/v0.12 model-layer blobs remain unchanged;
- integration into `index.html`, `app.js`, CI, and state artifacts.

## 10. Explicit non-goals

Thread 13 does not implement:

- concrete `W`;
- Calabi–Yau hypersurface rendering;
- Three.js, Canvas, WebGL, GPU buffers, or camera transforms;
- genuine `D^4` sheets;
- covering/étale/fiber geometry;
- cyclotomic/torsion/collision geometry;
- user-driven pan/zoom/focus controls;
- recursive expansion controls;
- Thread 14 interaction semantics.

## 11. Acceptance criterion

Thread 13 is complete only when the static page visibly contains a deterministic SVG structural diagram generated from the verified runtime model state, all existing regression/formal checks remain green, the new verifier is green, and the v0.13 mathematical truthfulness boundary remains unchanged.

# Progress — Self-Similar Calabi–Yau Visualizer v0.14

## Milestone

```text
Thread 13 — Structural Visualization Layer
```

## Baseline gate

Verified before implementation:

```text
main = e83ed17a5ce8e45e67ef326042a21ec51ba24222
tree = 338a519614ea16ceb2e4a1247fc0c94338929f0c
v0.13 tag -> same commit
v0.13 release = published / immutable / not prerelease
Formal Verification run #42 / 35215769668 = completed / success
  runtime-contracts = success
  formal-lean = success
  publication-static-smoke = success
Pages build/deployment run 35216628078 = completed / success
  head SHA = e83ed17a5ce8e45e67ef326042a21ec51ba24222
  tree = 338a519614ea16ceb2e4a1247fc0c94338929f0c
```

The GitHub connector does not expose the `/pages` metadata endpoint directly, so Pages verification uses the exact-SHA GitHub Pages build/deployment workflow evidence. The public Pages URL itself was not treated as verified when a separate web fetch surface returned no page content.

## Source note

`PLAN_self_similar_cy_visualizer_v0_02.md` was referenced by the handoff but is not present in the canonical v0.13 tree and repository code search did not retrieve it. Thread 13 therefore follows the explicit handoff constraints plus the recovered milestone summary: deterministic SVG structural projection, reuse existing verified models, preserve the unresolved-geometry boundary, and do not begin interaction work.

## Implemented

- added `structural-visualization.js`;
- added `verify_structural_visualization_v0_14.js`;
- added the v0.14 structural-visualization contract/state/progress artifacts;
- projected existing finite materialized level descriptors into deterministic SVG nodes;
- projected existing adjacent pullback relations into SVG edges;
- added a symbolic rule panel without creating additional levels;
- kept canonical `requestedDepth = 0`, so the default page honestly shows only `X_0` as materialized;
- retained explicit `W: unresolved` and `geometryRendered=false` labeling.

## Frozen truth boundary

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
cameraTransformApplied = false
materializationTriggered = false
W = unresolved
```

No `D²` metric theorem and no `D⁴` map-degree theorem is promoted.

## Deliberately unchanged

The following model/math engines remain byte-for-byte sealed and are pinned by the new verifier:

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

The Lean source and dependency pins are also unchanged.

## Validation status

At this staging snapshot:

```text
new verifier: authored
source integration: in progress
staging PR CI: pending
exact-main CI: pending
```

No success claim is made until GitHub Actions runs the full regression suite, Lean job, publication static smoke, and the new v0.14 verifier on the final staging tree.

## Boundary to next milestone

Thread 14 interaction is not started. No clickable node navigation, pan/zoom controls, drag behavior, recursive-expansion controls, or camera semantics are included in v0.14.

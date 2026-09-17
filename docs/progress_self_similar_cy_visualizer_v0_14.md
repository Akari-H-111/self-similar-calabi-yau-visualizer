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
- retained explicit `W: unresolved` and `geometryRendered=false` labeling;
- kept the sealed model/runtime engines and Lean source unchanged;
- made the v0.13 publication verifier persistent-contract compatible while the immutable v0.13 tag retains its original snapshot verifier.

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

## Error history and repairs

The staging PR exposed three classes of implementation/integration defects before seal:

1. the v0.11 fidelity verifier contained forward-version wording assumptions tied to older page/README labels;
2. the v0.13 publication verifier acted as a full presentation snapshot rather than a persistent publication-contract check for post-v0.13 work;
3. the new SVG marker markup contained one JavaScript string-quoting syntax error.

The first two were repaired without weakening their mathematical truthfulness checks. The third was a one-line syntax repair in `structural-visualization.js`.

## Verified staging evidence

PR #6 is a staging-only CI vehicle and must not be merged as history.

The first fully green implementation tree was:

```text
staging head:
45a2f621ce84e8e8a609ca3a4eb3b4c1aba1faf7

Formal Verification run #46 / 35231666202:
  runtime-contracts = success
    verify_scene_spec_v0_03 = success
    verify_base_renderer_v0_04 = success
    verify_one_step_pullback_v0_05 = success
    verify_recursive_lazy_expansion_v0_06 = success
    verify_zoom_semantics_v0_07 = success
    verify_sheet_branch_organization_v0_08 = success
    verify_arithmetic_overlays_v0_09 = success
    verify_performance_infinite_navigation_v0_10 = success
    verify_mathematical_fidelity_v0_11 = success
    verify_ux_exposition_v0_12 = success
    verify_publication_checkpoint_v0_13 = success
    verify_structural_visualization_v0_14 = success
    runtime source syntax checks = success
  formal-lean = success
  publication-static-smoke = success
```

The current documentation sync is intentionally followed by one final staging CI run. Canonical seal is not self-attested by this document: after final staging green, the verified tree is replayed as exactly one child of the v0.13 canonical commit, and that exact main SHA must independently pass GitHub Actions.

## Boundary to next milestone

Thread 14 interaction is not started. No clickable node navigation, pan/zoom controls, drag behavior, recursive-expansion controls, or camera semantics are included in v0.14.

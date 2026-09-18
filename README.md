# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.20 — Visual Semantics & Accessibility Audit

**Published checkpoint:** v0.13 — Publication Checkpoint

**Runtime scene contract:** v0.12

This repository is a static HTML/CSS/vanilla-JavaScript structural visualizer for the coordinate-power pullback system. v0.20 adds a presentation-only visual-semantics and accessibility audit above v0.19, including deterministic DOM focus restoration after virtualized interaction rerenders, bounded textual semantics for omitted render-window gaps, browser-zoom-safe camera input policy, single-live-region announcement discipline, forced-colors hooks, and narrow-viewport structural-canvas readability. v0.19 adds a presentation-only infinite-navigation rendering engine above the sealed semantic recursion: deterministic viewport/render-window virtualization, overscan, floating-origin deep-depth handling, bounded presentation-slot recycling, and a bounded recomputable virtual-layout cache. The v0.18 arithmetic graphics, v0.17 D⁴ branch graphics, v0.16 camera, and v0.15 interaction semantics remain beneath that adapter.

The interface is **structural, not geometric**. It does not implement a concrete `W`, a Calabi–Yau hypersurface, genuine sheets, covering geometry, or geometric zoom.

The evidence rule remains:

```text
runtime representation
!= mathematical theorem
!= Lean theorem
!= parent-project theorem
!= visualization convention
```

The v0.11 claim-discipline vocabulary remains binding: **D² and D⁴ explicitly as runtime/organization metadata**. Exact parent-project mathematical artifacts remain **not source-verified in this thread**, so unavailable parent results are not promoted.

D⁴ runtime organization metadata is **not a map-degree theorem** in the current sealed formal scope. Benchmark horizons are **not mathematical limits**, and JavaScript safe-integer checks are **representation-safety / engineering constraints** rather than mathematical theorems.

## Published v0.13 checkpoint

The immutable publication checkpoint remains:

```text
v0.13 — Publication Checkpoint
commit:
e83ed17a5ce8e45e67ef326042a21ec51ba24222

tree:
338a519614ea16ceb2e4a1247fc0c94338929f0c

release:
published / immutable / not prerelease
```

The repository is licensed under the **Apache License, Version 2.0** (`Apache-2.0`). The `LICENSE` file remains the operative grant.

## Thread 18 starting canonical baseline

Thread 18 starts from sealed Thread 17 canonical `main`:

```text
commit:
f1b2a0a43aae609574be795f5e3a89fe3e53fcc0

tree:
c02f66550fb27f4e2f3ba891cae816e28abd80b8

sole parent:
10a315458b7321ee0f48e553d533c3519fd99916

commit message:
visualization: seal Thread 17 arithmetic overlay graphics v0.18
```

Inherited external evidence rechecked before implementation:

```text
Formal Verification run #95 / 35316280060
head SHA f1b2a0a43aae609574be795f5e3a89fe3e53fcc0
conclusion = success

Pages run #6 / 35316279726
head SHA f1b2a0a43aae609574be795f5e3a89fe3e53fcc0
conclusion = success

Thread 17 staging PR #10
closed / merged=false / draft CI vehicle only
```

## v0.17 D⁴ branch organization graphics

The new presentation module is:

```text
branch-organization-graphics.js
```

Its data flow is deliberately one-way:

```text
sealed sheet/branch organization renderer output
  -> read-only v0.17 projection
  -> aggregate multiplicity badge(s)
  -> existing structural SVG
  -> existing structural camera viewBox
```

The module consumes the canonical multiplicity source already exposed by the sealed organization runtime:

```text
scene.derived.sheetDegree
```

It does **not** read `parameters.D`, does not calculate `D ** 4`, does not enumerate branch slots, and does not create a second branch-semantics engine.

For every visible adjacent structural transition it can show one badge:

```text
D⁴ org
×N
```

where `N` is the exact existing runtime organization multiplicity.

At the canonical `D=2` fixture:

```text
D⁴ = 16
```

is represented as **16-fold structural organization** using one aggregate badge per visible transition, not sixteen fake geometric sheets.

The v0.17 verifier also checks `D=3 -> 81` and a larger safe fixture `D=64 -> 16777216` without multiplicity-sized DOM enumeration.

Detailed contract:

```text
docs/D4_BRANCH_ORGANIZATION_GRAPHICS_self_similar_cy_visualizer_v0_17.md
```

## v0.18 arithmetic overlay graphics

The new presentation-only adapter is:

```text
arithmetic-overlay-graphics.js
```

It consumes the already-verified `arithmetic_overlays` model output and the existing structural layout descriptor:

```text
sealed arithmetic overlay semantics
  -> read-only v0.18 graphical projection
  -> structural layout anchors
  -> symbolic SVG annotations
  -> existing structural SVG
  -> existing structural camera viewBox
```

The only admitted graphical overlays are the two identifiers already implemented by v0.09:

```text
coordinate_channels
coordinate_iterate_rule
```

`coordinate_channels` is rendered as source-backed structural coordinate-channel annotation metadata. `coordinate_iterate_rule` is rendered as a symbolic focused-level annotation backed by the sealed `coordinatePower_iterate_apply` Lean theorem identity.

Each graphical annotation exposes machine-readable evidence/provenance, including overlay id, evidence class, source artifact/version, attachment kind/depth, and false geometry/sheet/covering flags.

The controls are independently toggleable. Their state is presentation/view-request state only:

```text
arithmetic overlay presentation state
!= recursive depth
!= structural focus
!= selected/collapsed state
!= camera state
!= D⁴ organization
!= geometric zoom
```

The v0.18 graphics layer does not recalculate `D`, `D^n`, `D²`, or `D⁴`; it consumes the structured v0.09 descriptors. Camera actions do not mutate arithmetic payloads, and arithmetic toggles do not move the camera or materialize recursion.

The deferred v0.09 candidates remain unavailable to the graphical allow-list:

```text
cyclotomic_refinement
torsion_labels
collision_classes
delta_n_divisor
```

No placeholder locus or speculative geometry is drawn for them.

Detailed contract:

```text
docs/ARITHMETIC_OVERLAY_GRAPHICS_self_similar_cy_visualizer_v0_18.md
```

## v0.19 infinite-navigation rendering engine

The new presentation adapter is:

```text
infinite-navigation-renderer.js
```

Its state separation is explicit:

```text
semantic materialization
!= virtual layout
!= render materialization
```

The sealed interaction/recursion authority remains unchanged. `expandOneLevel()` is still the only structural semantic expansion path, and viewport pruning never deletes or rewrites `recursiveModel.levels`.

For the default v0.19 policy:

```text
viewportLevelCapacity = 9
overscanLevels = 2
configured active bound = 18
virtual layout cache capacity <= 36
```

The active structural SVG nodes and interaction control rows are projected only for the bounded active depth set. Base, selected, focused, and their required predecessors are pinned when necessary so navigation, D⁴ transition badges, arithmetic annotations, and camera targeting remain addressable.

Deep layout uses an anchor-relative floating-origin description. A far depth can remain semantically materialized and presentation-visible without forcing an unsafe absolute SVG coordinate.

The derived virtual-layout cache is:

```text
bounded
deterministic
recomputable
non-canonical
evictable
```

Cache eviction is presentation-only and does not alter retained semantic structure.

The v0.19 benchmark on GitHub Actions run #106 sampled semantic depths `100`, `1,000`, `10,000`, and `1,000,000`. In that Node runner observation, every horizon reported:

```text
maximumActiveRenderedDepthCount = 14
maximumPresentationPoolSize = 14
configuredActiveBound = 18
maximumVirtualLayoutCacheEntries = 36
virtualLayoutCacheCapacity = 36
virtualLayoutCacheHits = 10
virtualLayoutCacheMisses = 69
virtualLayoutCacheEvictions = 33
```

Those numbers are engineering observations for the exercised policy, not mathematical limits or browser-memory proofs. The benchmark explicitly records `browserEvidence = not_tested`, `timingAndHeapAreEnvironmentSensitive = true`, and `benchmarkThresholdIsSemanticLimit = false`.

Detailed contract:

```text
docs/INFINITE_NAVIGATION_RENDERING_ENGINE_self_similar_cy_visualizer_v0_19.md
```


## v0.20 visual semantics and accessibility

Thread 19 preserves four independent domains:

```text
semantic selected/focused state
!= DOM keyboard focus
!= structural camera state
!= geometric zoom
```

Interaction focus restoration uses a presentation-only descriptor made from the interaction action, semantic depth, and control role. It does not use DOM child indices or presentation slot ids, and it never writes `selectedDepth` or `focusedDepth`.

The v0.20 camera event policy reserves ordinary wheel/trackpad scrolling, touch pinch, and Ctrl/Cmd + wheel for browser/page behavior. Structural wheel zoom is opt-in with Alt + wheel, while the existing native camera buttons remain the keyboard-accessible equivalent controls.

Virtualized gaps expose bounded text such as “N intermediate materialized levels omitted from the active render window”. The implementation does not rebuild the full semantic tower in hidden DOM.

Only `#system-status` remains a polite live region. Interaction and camera diagnostic text stay visible but are not independent live regions, preventing per-frame camera movement from becoming an announcement stream.

Static contracts include reduced-motion, forced-colors hooks, non-color selected/focused encodings, and narrow-viewport internal structural-canvas scrolling. Quantitative contrast, 200%/400% browser zoom, and real assistive-technology behavior remain browser/AT evidence tasks and are not certified by static verification.

Detailed contract:

```text
docs/VISUAL_SEMANTICS_ACCESSIBILITY_self_similar_cy_visualizer_v0_20.md
```


## Thread 19R human interaction remediation

A post-seal Chromium interaction audit of the exact v0.20 Pages artifact found two small presentation defects that static verification did not expose:

- keyboard activation of `Reset camera` could disable the focused control and let browser focus fall to `body`;
- after descendants were already collapsed, the Collapse control could remain enabled and repeat the same no-op transition/announcement.

Thread 19R repairs only those presentation behaviors. Camera focus restoration uses semantic camera action names rather than DOM indices. If the activated camera control remains enabled it keeps focus; if it becomes disabled, focus moves deterministically to a named enabled camera control. The Collapse control is disabled whenever `interactionModel.presentation.collapsed` is already true.

The remediation does not modify the sealed interaction controller, camera model, recursion engine, scene specification, arithmetic semantics, or `formal/*`. The lower-priority duplicated virtual-gap accessibility-tree wording remains unchanged pending real screen-reader evidence.

Detailed contract:

```text
docs/HUMAN_INTERACTION_REMEDIATION_self_similar_cy_visualizer_v0_20_1.md
```

## D=1 and representation safety

The inherited scene validator currently accepts safe-integer `D >= 2`. Therefore `D=1` is rejected by the current runtime schema.

That is documented as a **current schema / representation boundary**, not a mathematical impossibility.

Likewise, derived safe-integer checks are JavaScript representation-safety constraints, not mathematical limits.

## Branch presentation, recursion, focus, and camera are different domains

```text
branch presentation state
!= recursive depth state
!= structural focus state
!= selected/collapsed state
!= camera state
!= geometric zoom
```

v0.17 does not introduce a branch LOD controller. Its minimal coherent representation is aggregate-only.

The sealed v0.15 interaction controller remains the only layer that may request finite structural expansion. The v0.16 camera remains a presentation-only SVG viewport state machine. Camera scale is presentation-only viewport state.

## Canonical `requestedDepth = 0`

The canonical scene remains unchanged:

```text
data/system.json
requestedDepth = 0
D = 2
W representation = unresolved
```

The richer UI is produced by legal interaction and presentation projection, not by deepening the canonical fixture.

## Structural visualization and camera

`structural-visualization.js` continues to project finite verified runtime structure into inline SVG. The v0.17 badges are inserted into that same SVG, so ordinary v0.16 `viewBox` camera operations naturally move the badges together with the existing structure.

No second camera, double viewport, or duplicated mathematical layout engine is introduced.

The sealed v0.15 interaction semantics also remain unchanged. Structural refocus alone does not perform a camera transform or geometric zoom.

## Truthfulness boundary

The project-wide geometric truth boundary remains:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W representation = unresolved
```

`D⁴` badges are graphical encodings of organizational metadata only. They are not concrete sheets, fibers, hypersurface branches, manifold copies, actual geometric preimages, or a literal covering map.

## D² and D⁴

`scene-spec.js` still derives:

```text
scene.derived.metricScale = D^2
scene.derived.sheetDegree = D^4
```

The interpretation remains exactly:

```text
D² = runtime numeric metadata
D⁴ = runtime numeric / organizational metadata
```

The repository does not claim that the sealed Lean core proves:

```text
P_D^* g_log = D^2 g_log
deg(P_D) = D^4
```

## Project-level structural statement

The repository carries the project notation

\[
X=W^{-1}(\lambda),
\qquad
X_n=(P_D^n)^{-1}(X),
\qquad
P_D(z_1,\ldots,z_4)=(z_1^D,\ldots,z_4^D).
\]

The sealed Lean core formalizes the four-coordinate coordinate-power map, its iteration law, and an abstract set-theoretic pullback tower for arbitrary `X : Set Point4`.

It does not define `W` or Calabi–Yau geometry. Runtime `W` remains `unresolved`.

Therefore no geometric Calabi–Yau hypersurface is currently rendered.

## Lean-formalized scope

The sealed formal source remains unchanged:

```text
formal/SelfSimilarCY/CoordinatePower.lean
formal/SelfSimilarCY/CoordinatePowerIteration.lean
formal/SelfSimilarCY/PullbackTower.lean
```

Pinned environment:

```text
Lean: leanprover/lean4:v4.34.0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

v0.20 adds no Lean theorem and changes no formal file, toolchain pin, or mathlib pin.

## Verification

Runtime verification uses Node 22:

```bash
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
node verify_zoom_semantics_v0_07.js
node verify_sheet_branch_organization_v0_08.js
node verify_arithmetic_overlays_v0_09.js
node verify_performance_infinite_navigation_v0_10.js
node verify_mathematical_fidelity_v0_11.js
node verify_ux_exposition_v0_12.js
node verify_publication_checkpoint_v0_13.js
node verify_structural_visualization_v0_14.js
node verify_interactive_pullback_tower_v0_15.js
node verify_structural_camera_zoom_v0_16.js
node verify_branch_organization_graphics_v0_17.js
node verify_arithmetic_overlay_graphics_v0_18.js
node verify_infinite_navigation_renderer_v0_19.js
node benchmark_infinite_navigation_renderer_v0_19.js
node verify_visual_semantics_accessibility_v0_20.js
```

The v0.19 verifier checks sealed semantic blob identity, deterministic render-window construction, bounded active render count, presentation-slot recycling, bounded recomputable cache behavior, deep floating-origin descriptors, off-window selection and camera targeting, structural/interaction virtualization, explicit D⁴ reprojection, arithmetic coexistence, truthfulness flags, source discipline, and CI wiring.

The v0.20 verifier additionally checks semantic-focus/DOM-focus separation, deterministic focus restoration without DOM indices or presentation-slot identity, bounded virtualized assistive text, native-control preservation, browser-zoom-safe camera guards, single-live-region discipline, forced-colors/reduced-motion hooks, responsive structural-canvas policy, truthfulness invariants, and full v0.03-v0.20 workflow wiring.

The current Thread 19 staging CI evidence is recorded in the v0.20 state/progress artifacts. Those artifacts intentionally do not self-certify the final seal.

## What green CI means

A green `formal-lean` job means the explicitly scoped Lean modules build, direct compilation succeeds, and the placeholder gate passes.

A green `runtime-contracts` job means the JavaScript contracts and claim-discipline verifiers pass, including v0.20, all earlier runtime verifiers, and the v0.19 benchmark execution.

A green `publication-static-smoke` job means the static repository paths can be served and fetched successfully from a clean GitHub-hosted runner.

Green CI does **not** mean that the entire visualizer, all Calabi–Yau mathematics, browser behavior on every device, D² metric scaling, D⁴ genuine map degree, covering geometry, or unavailable arithmetic research has been formally verified.

## Reproduce the Lean core

From `formal/`:

```bash
lake exe cache get
lake build
lake env lean SelfSimilarCY/CoordinatePower.lean
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
lake env lean SelfSimilarCY/PullbackTower.lean
```

CI additionally rejects `axiom`, `sorry`, and `admit` placeholders in the sealed Lean source directory.

## Run locally

Serve the repository over HTTP:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Scope of v0.20

v0.20 is **Thread 19 — Visual Semantics & Accessibility Audit**.

It repairs presentation accessibility without changing mathematical/runtime authority: deterministic focus continuity across virtualized rerenders, bounded assistive text for omitted render-window gaps, browser/page-priority zoom and scroll handling, native keyboard camera alternatives, single-live-region announcement discipline, forced-colors/reduced-motion hooks, and narrow-viewport structural-canvas readability.

It does not add a second recursion engine, new mathematics, concrete `W`, Calabi–Yau geometry, genuine sheets, covering/étale/fiber geometry, cyclotomic/torsion/collision/divisor geometry, geometric zoom, metric scaling, or a new Lean theorem. It also does not claim WCAG certification, full screen-reader support, quantitative contrast certification, 200%/400% browser-zoom certification, or all-browser support; those evidence classes remain explicitly `not_tested` where no reliable browser/AT evidence exists.

The final v0.20 state/progress artifacts are intentionally non-self-certifying. Thread 19 is sealed only after the exact final staging tree passes CI, PR #12 is closed unmerged, that exact tree is replayed as exactly one child of the Thread 18 canonical commit `5c45dd74e53cde06e30ae70ecd97171f7012cf0d`, `main` is fast-forwarded without force, and exact-main Formal Verification plus exact-SHA Pages both succeed.

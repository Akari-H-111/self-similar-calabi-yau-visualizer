# Arithmetic Overlay Graphics v0.18

## 1. Scope

Thread 17 converts only already-supported, provenance-backed arithmetic overlay semantics into visible symbolic annotations attached to the existing structural SVG.

The data flow is one-way:

```text
sealed arithmetic_overlays model
  -> read-only v0.18 graphics adapter
  -> existing structural layout anchors
  -> symbolic SVG annotations
  -> existing structural SVG
  -> existing structural camera viewBox
```

It does not add a new arithmetic theorem, a new arithmetic semantic engine, geometric loci, Calabi–Yau geometry, concrete sheets, covering geometry, or a new Lean theorem.

## 2. Starting canonical provenance

Thread 17 started from exact canonical `main`:

```text
commit: 10a315458b7321ee0f48e553d533c3519fd99916
tree:   c9917ee4cf6ce750c5320f94e42f3ef33b0506f6
parent: 49ece02ada3a3f4aba2077fa86fd494df3c8188a
message: visualization: seal Thread 16 D4 branch organization graphics v0.17
```

Inherited Thread 16 seal evidence rechecked before implementation:

```text
Formal Verification run #82
run id: 35257740985
head SHA: 10a315458b7321ee0f48e553d533c3519fd99916
conclusion: success

Pages run id: 35257739889
head SHA: 10a315458b7321ee0f48e553d533c3519fd99916
conclusion: success

Thread 16 staging PR #9:
closed / merged=false / draft CI vehicle only
```

The immutable `v0.13` release remains published at commit `e83ed17a5ce8e45e67ef326042a21ec51ba24222`.

## 3. Reused arithmetic semantics

The sealed `arithmetic-overlays.js` contract remains the only arithmetic semantic source.

The v0.18 graphical allow-list is exactly:

```text
coordinate_channels
coordinate_iterate_rule
```

No v0.18 code reads `parameters.D` to rebuild these semantics, evaluates a second coordinate-power rule, computes `D²` or `D⁴`, materializes recursion, or changes the arithmetic overlay model.

### coordinate_channels

Source semantic scope:

```text
global_system_metadata
```

Evidence:

```text
evidenceClass = source_backed_structural_representation
formalSupport = formal_theorem
canonical source = formal/SelfSimilarCY/CoordinatePower.lean
```

The graphical layer projects the existing channel labels and coordinate-map metadata only. It does not draw four geometric fibers.

### coordinate_iterate_rule

Source semantic scope:

```text
focused_level_metadata
```

Evidence:

```text
evidenceClass = formal_theorem
theoremIdentity = coordinatePower_iterate_apply
canonical source = formal/SelfSimilarCY/CoordinatePowerIteration.lean
```

The graphical layer consumes the existing structured exponent expression:

```text
baseParameter
towerDepth
```

It does not calculate an orbit trajectory or materialize coordinate preimages.

## 4. Deferred candidates remain deferred

The v0.09 candidates below remain outside the graphical allow-list:

```text
cyclotomic_refinement
torsion_labels
collision_classes
delta_n_divisor
```

When requested through the sealed arithmetic overlay model they remain `unavailable` with no enabled descriptor. The v0.18 graphical model therefore produces no annotation for them.

No placeholder curve, gray locus, dotted divisor, torsion point cloud, or collision geometry is created.

## 5. Graphical encoding and structural attachment

The new module is:

```text
arithmetic-overlay-graphics.js
```

It consumes:

```text
arithmetic_overlays model output
structural_visualization_layout descriptor
```

and emits deterministic annotation descriptors.

The two attachment relations are:

```text
coordinate_channels
  -> system_rule_panel_edge
  -> structural depth 0 context

coordinate_iterate_rule
  -> focused_structural_level
  -> current focused visible level
```

The existing layout descriptor remains the single source for:

```text
canonicalViewBox
rulePanel
levelBounds
```

The arithmetic graphics module does not duplicate the structural node spacing constants.

## 6. Evidence and machine-readable status

Each annotation carries:

```text
overlayId
overlayKind
semanticScope
attachmentTarget
evidenceClass
formalSupport or theoremIdentity where applicable
canonical source artifact
source version
structural depth
truthfulness flags
```

The SVG markup exposes these through textual labels and `data-*` attributes.

Evidence vocabulary remains layered. In particular:

```text
source_backed_structural_representation != formal_theorem
runtime/structural evidence != generic "verified"
symbolic annotation != geometric locus
```

## 7. Independent toggle state

The browser UI uses native checkbox controls for the two admitted overlay ids.

The state domain is:

```text
arithmetic overlay presentation state
```

and is distinct from:

```text
requestedDepth
materializedDepth
selectedDepth
focusedDepth
collapsedDepth
cameraScale / camera center
D⁴ organization multiplicity
canonical scene state
```

The four deterministic combinations are supported:

```text
channels off / iterate off
channels on  / iterate off
channels off / iterate on
channels on  / iterate on
```

A toggle rebuilds only the arithmetic overlay view-request model, arithmetic graphical projection, and exposition derived from that overlay model. It does not invoke recursive expansion or camera movement.

## 8. Camera and lifecycle integration

Arithmetic annotations are inserted into the same structural SVG used by the sealed v0.16 camera.

Therefore ordinary camera changes act through the existing SVG `viewBox` and move:

```text
structural nodes
D⁴ aggregate badges
arithmetic annotations
```

as one viewport.

No arithmetic-specific camera exists.

The v0.18 adapter does not use `MutationObserver`, timers, or animation callbacks. A structural re-render replaces the SVG; `app.js` then explicitly reprojects the current arithmetic overlay state into the new SVG.

Repeated arithmetic projection removes the previous v0.18 root group before appending the replacement, preventing duplicate accumulation.

The sealed v0.17 branch graphics observer watches only the structural target's direct child-list changes and continues to reproject D⁴ badges independently.

## 9. Layout coexistence

v0.17 D⁴ badges occupy the node-to-rule-panel x lane only inside transition gaps.

The v0.18 focused iterate annotation uses that x lane only inside the focused node's vertical extent.

The global coordinate-channel annotation occupies a right-side lane adjacent to the rule panel and remains inside the canonical viewBox.

The v0.18 verifier checks the generated rectangles against v0.17 badge rectangles and rejects overlap in covered fixtures.

## 10. Representation-safety boundary

Arithmetic graphics never silently truncates the machine-readable semantic payload.

Presentation text may use compact symbolic notation, while the exact structured values remain present in the immutable graphical descriptor and machine-readable attributes.

Any safe-integer or display-space restriction is an engineering / representation constraint, not a mathematical limit.

## 11. Truthfulness invariants

Throughout v0.18:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

The arithmetic overlay model also remains:

```text
recursionModified = false
zoomModified = false
sheetOrganizationModified = false
materializationTriggered = false
```

Better arithmetic graphics do not strengthen the underlying theorem status.

## 12. Files added / changed

New:

```text
arithmetic-overlay-graphics.js
verify_arithmetic_overlay_graphics_v0_18.js
docs/ARITHMETIC_OVERLAY_GRAPHICS_self_similar_cy_visualizer_v0_18.md
docs/state_self_similar_cy_visualizer_v0_18.json
docs/progress_self_similar_cy_visualizer_v0_18.md
```

Integration / exposition changes:

```text
app.js
index.html
style.css
README.md
.github/workflows/formal-verification.yml
```

Sealed semantic modules were not modified:

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
structural-camera.js
structural-visualization.js
branch-organization-graphics.js
formal/*
```

## 13. v0.18 verifier contract

`verify_arithmetic_overlay_graphics_v0_18.js` checks at least:

- exact graphical allow-list equality with the two implemented v0.09 overlays;
- the 00 / 10 / 01 / 11 independent-toggle matrix;
- descriptor and graphical annotation id agreement;
- evidence/status and canonical source provenance exposure;
- structural attachment to rule-panel / focused-level layout anchors;
- no second arithmetic engine;
- no direct `parameters.D`, `D²`, or `D⁴` recomputation;
- runtime recursion/focus/organization isolation;
- camera isolation in both directions;
- deterministic model and markup;
- repeated render replacement without duplicate accumulation;
- structural-SVG replacement reprojection;
- interaction expand/select/refocus/collapse persistence;
- v0.17 D⁴ badge coexistence and rectangle non-overlap in verified fixtures;
- deferred candidate non-admission;
- absence of observer/timer recursion surfaces;
- canonical `requestedDepth=0`, `D=2`, `W=unresolved`;
- all project truthfulness flags remain false as required;
- browser script ordering, native toggle controls, minimum accessibility hooks, and CI wiring.

## 14. Formal boundary

No formal source, Lean version, mathlib pin, or theorem is changed in Thread 17.

The formal job continues to build and directly compile:

```text
formal/SelfSimilarCY/CoordinatePower.lean
formal/SelfSimilarCY/CoordinatePowerIteration.lean
formal/SelfSimilarCY/PullbackTower.lean
```

The Lean support attached to the coordinate overlays is inherited source provenance. It does not mean Lean proves a visible arithmetic geometry.

## 15. Canonical scene boundary

`data/system.json` remains unchanged:

```text
requestedDepth = 0
D = 2
W representation = unresolved
```

The richer UI comes from interaction and presentation state only.

## 16. Seal authority

This document is intentionally not self-certifying.

The Thread 17 seal still requires external evidence:

```text
final exact staging tree CI success
close staging PR #10 unmerged
replay that exact verified tree as one child of 10a315458...
fast-forward main
exact-main Formal Verification success
exact-SHA Pages success
```

Only those Git object identities plus workflow/deployment evidence can establish the canonical v0.18 seal.

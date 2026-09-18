# Mathematical / Visual Fidelity Audit II — v0.21

## 1. Authority hierarchy

Thread 20 follows the external planning source `PLAN_self_similar_cy_visualizer_v0_02.md` for milestone scope, but repository mathematical/runtime truth is determined only by the canonical repository artifacts.

```text
planning objective != repository mathematical truth
```

The v0.21 implementation does not add geometry, new mathematics, or new Lean theorems.

## 2. Starting canonical identity

```text
main   = 874a80f7702f85996eb893690cc34e7d8869161c
tree   = d818e6a0c9aa04711fefc8f298140a0676c29f7a
parent = 3b2c8e2119a44db069f77e8106145e35126ac7b1

Formal Verification #121 / 35329509282 = success
Pages #9 / 35329508086 = success
PR #13 = closed, merged=false
open PR = 0
v0.13 tag = e83ed17a5ce8e45e67ef326042a21ec51ba24222
v0.13 immutable = true
```

## 3. Frozen truth boundary

The canonical scene remains:

```text
data/system.json
requestedDepth = 0
D = 2
W representation = unresolved
```

The project-wide non-claims remain:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

Thread 20 is not a geometry-admission milestone.

## 4. Evidence taxonomy

The v0.21 provenance matrix distinguishes:

```text
lean_formalized
runtime_metadata
structural_representation
formal_theorem_backed_symbolic
source_backed_structural_representation
interaction_metadata
presentation_virtualization
presentation_camera_state
unresolved
not_materialized
engineering
```

Generic words such as “verified”, “mathematical”, “actual”, or “proved” are not used as substitutes for these classes.

## 5. Durable provenance matrix

The central Thread 20 artifact is:

```text
docs/visual_provenance_matrix_self_similar_cy_visualizer_v0_21.json
```

It records, for each admitted major visual class:

- visual element;
- producing module;
- runtime/source input;
- canonical source artifacts;
- evidence class;
- rendered wording;
- machine-readable evidence;
- truthfulness flags;
- explicit non-claims;
- verification coverage.

The inventory includes structural nodes, pullback edges, symbolic rule panel, D² runtime metadata, D⁴ organization metadata, aggregate D⁴ badges, arithmetic annotations, deferred arithmetic candidates, virtualized gaps, all frontier states, selection/focus state, camera state, and unresolved W status.

## 6. Demonstrated findings

### MVF-01 — visible version drift

Before v0.21, the canonical repository had already sealed v0.20.1, while the public page eyebrow still displayed:

```text
v0.20 · Visual Semantics & Accessibility Audit
```

v0.21 updates the public provenance/audit label. This is exposition-only and does not alter runtime semantics.

### MVF-02 — requested frontier machine-readable asymmetry

The sealed structural renderer already distinguishes the model status:

```text
requested_frontier_reached
```

but the corresponding SVG output is a plain text node, unlike other frontier classes that expose `data-frontier-status`.

The historical renderer is byte-sealed by earlier verifiers, so Thread 20 does not modify it. Instead the new presentation-only adapter:

```text
visual-provenance.js
```

annotates that rendered text with:

```text
data-frontier-status="requested_frontier_reached"
data-visual-provenance-id="frontier_requested_reached"
data-evidence-class="engineering"
```

This repairs machine-readable provenance without changing the structural model or renderer.

## 7. Provenance adapter boundary

`visual-provenance.js` only adds DOM `data-*` provenance metadata to already-rendered presentation objects.

It does not:

- call recursive expansion;
- modify `recursiveModel.levels`;
- change selected/focused/collapsed state;
- move the camera;
- compute D² or D⁴;
- add arithmetic semantics;
- change `W`;
- render geometry;
- enumerate sheets;
- claim covering structure.

The adapter observes child-list changes only to re-apply provenance after the existing bounded structural SVG is regenerated.

## 8. Structural nodes and edges

`X_n` nodes remain structural descriptors. They are not rendered manifolds or hypersurface copies.

`P_D^-1` edges remain symbolic structural pullback relations. The formal support comes from the abstract set-theoretic pullback recurrence in `formal/SelfSimilarCY/PullbackTower.lean`; the SVG does not materialize an inverse-image variety, fiber, covering map, or geometric branch.

## 9. D² / D⁴ discipline

```text
scene.derived.metricScale = D^2
scene.derived.sheetDegree = D^4
```

remain JavaScript-derived runtime metadata.

Allowed interpretation:

```text
D² = runtime numeric metadata
D⁴ = runtime numeric / organizational metadata
```

Thread 20 does not assert:

```text
P_D^* g_log = D² g_log
deg(P_D) = D⁴
```

Camera scale remains presentation-only viewport state and is distinct from D².

## 10. Arithmetic graphics

The graphical allow-list remains exactly:

```text
coordinate_channels
coordinate_iterate_rule
```

`coordinate_channels` remains a source-backed structural representation with Lean support for the coordinate-power map.

`coordinate_iterate_rule` remains a formal-theorem-backed symbolic annotation with theorem identity:

```text
coordinatePower_iterate_apply
```

Neither is a geometric locus.

The following remain deferred and graphically unavailable:

```text
cyclotomic_refinement
torsion_labels
collision_classes
delta_n_divisor
```

No placeholder locus is introduced.

## 11. Interaction, virtualization, and camera

```text
selectedDepth
focusedDepth
collapsedDepth
DOM focus
camera state
```

remain navigation/presentation domains, not mathematical distinctions.

View pruning remains presentation virtualization. It does not delete or rewrite `recursiveModel.levels`.

The four frontier meanings remain distinct:

```text
view_pruned
presentation_collapsed
not_materialized
requested_frontier_reached
```

## 12. HIA-01 / HIA-02 / HIA-03 preservation

Thread 20 leaves the browser-remediated production blobs unchanged:

```text
app.js                          4b5767b5f5fae9fac25d042e777b150a2ef92c38
infinite-navigation-renderer.js b463a0bb230cde4fd78d26a9d754b83290caa8f0
```

Therefore the v0.20.1 code paths for deterministic Reset-camera focus restoration and collapse/reveal control state are not rewritten by Thread 20.

HIA-03 remains intentionally unchanged pending direct VoiceOver/NVDA/JAWS evidence.

## 13. Formal boundary

No `formal/*` file is modified.

The sealed Lean scope remains:

```text
formal/SelfSimilarCY/CoordinatePower.lean
formal/SelfSimilarCY/CoordinatePowerIteration.lean
formal/SelfSimilarCY/PullbackTower.lean
```

Thread 20 does not add a theorem to justify a visual label. Visual claims are instead constrained to the theorem/runtime evidence already available.

## 14. Browser / accessibility evidence

Thread 20 static verification does not imply:

```text
WCAG certification
VoiceOver verification
NVDA verification
JAWS verification
all-browser support
200% / 400% browser-zoom certification
```

A final Chromium spot check may exercise selected v0.21 rendering paths, but such evidence must be described only as exercised browser paths.

## 15. v0.21 verifier

```text
verify_mathematical_visual_fidelity_v0_21.js
```

checks the canonical scene, frozen truth flags, provenance matrix completeness, byte identity of sealed runtime/formal/HIA production sources, structural edge wording, aggregate D⁴ semantics, arithmetic evidence-class separation, deferred overlay exclusion, virtualization semantics, camera/D² separation, requested-frontier provenance repair, documentation discipline, and CI wiring.

## 16. Seal rule

This document does not self-certify Thread 20.

Seal authority requires:

```text
exact final staging tree CI
draft PR closed unmerged
main still equals 874a80f7702f85996eb893690cc34e7d8869161c before replay
exact-tree replay as exactly one child of that commit
fast-forward main without force
exact-main Formal Verification success
exact-SHA Pages success
final tree identity equal to verified staging tree
```

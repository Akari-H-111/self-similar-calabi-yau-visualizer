# D⁴ Branch Organization Graphics v0.17

## 1. Scope

Thread 16 adds a truthful graphical projection for the already-sealed `D^4` runtime / organizational multiplicity metadata.

The milestone is presentation-only:

```text
existing sheet/branch organization runtime output
  -> read-only branch graphics adapter
  -> aggregate multiplicity badges
  -> existing structural SVG
  -> existing structural camera viewBox
```

It does not add Calabi–Yau geometry, concrete sheets, covering geometry, a second recursion engine, a second D⁴ semantics engine, or a new Lean theorem.

## 2. Starting canonical provenance

Thread 16 started from exact canonical `main`:

```text
commit: 49ece02ada3a3f4aba2077fa86fd494df3c8188a
tree:   9a9f1ea776789fb4f9a02b0c43b59f2ac6c3cbf2
parent: d40e938c318a8389baccb58223c9f057217ba018
message: visualization: seal Thread 15 structural camera zoom v0.16
```

Inherited external seal evidence checked before implementation:

```text
Formal Verification run #76
run id: 35253648915
head SHA: 49ece02ada3a3f4aba2077fa86fd494df3c8188a
conclusion: success

Pages run id: 35253643964
head SHA: 49ece02ada3a3f4aba2077fa86fd494df3c8188a
conclusion: success

Thread 15 staging PR #8:
closed / merged=false / draft CI vehicle only
```

## 3. Reused D⁴ semantics

`branch-organization-graphics.js` does not read `parameters.D` and does not calculate `D ** 4`.

It consumes the existing `sheet-branch-organization.js` renderer output whose canonical multiplicity source is:

```text
scene.derived.sheetDegree
```

The inherited organization descriptors remain:

```text
aggregateOnly = true
slotsEnumerated = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometryRendered = false
```

The new graphical layer rejects an organization snapshot if those truth boundaries are promoted.

## 4. Graphical encoding

For each visible adjacent positive-depth structural transition, the presentation layer inserts one SVG badge:

```text
D⁴ org
×N
```

where `N` is the exact existing runtime organization multiplicity.

This is deliberately multiplicity-independent in DOM size. For example:

```text
D=2 -> D⁴=16 -> one aggregate badge per visible transition
D=3 -> D⁴=81 -> one aggregate badge per visible transition
D=64 -> D⁴=16777216 -> one aggregate badge per visible transition
```

The badge count depends on visible structural transitions, not on `D⁴`.

Therefore the UI can communicate 16-fold structural organization at `D=2` without manufacturing sixteen graphical sheet objects.

## 5. Layout and camera integration

No branch-specific mathematical layout constants were duplicated into the sealed runtime modules.

The browser adapter reads the rectangles of the already-rendered structural level nodes and places aggregate badges in the existing structural SVG. Because the badges live inside that SVG, the sealed v0.16 camera continues to act only by changing the SVG `viewBox`.

Consequently:

```text
branch presentation
!= recursive expansion
!= structural focus
!= selection
!= camera state
!= geometric zoom
```

A structural re-render replaces the SVG; a root-level `MutationObserver` then reprojects the same organization metadata into the new SVG. The observer does not watch the SVG subtree, so inserting a badge does not recursively retrigger itself.

## 6. Interaction boundary

v0.17 does not introduce branch LOD controls or branch expansion state. The minimal coherent milestone uses a single aggregate encoding.

Existing interactions remain authoritative:

```text
expand/reveal -> v0.15 interaction controller
select/refocus/collapse -> v0.15 interaction controller
pan/zoom/fit/reset -> v0.16 camera
D⁴ badge projection -> v0.17 presentation adapter
```

No badge operation modifies `requestedDepth`, `materializedDepth`, `selectedDepth`, `focusedDepth`, `collapsedDepth`, recursive descriptors, or camera semantics.

## 7. Representation-safety boundary

The sealed scene schema currently accepts safe-integer `D >= 2`. Therefore `D=1` is rejected by the existing validator.

v0.17 records this as an engineering / current-schema boundary only. It is not described as a mathematical impossibility.

For larger validated `D`, `scene-spec.js` continues to enforce JavaScript safe-integer safety for derived metadata. That is a representation-safety constraint, not a mathematical limit.

## 8. Truthfulness invariants

Throughout v0.17:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

`D^4` remains runtime numeric / organizational metadata. It is not promoted to a proved map-degree theorem.

`D^2` remains runtime numeric metadata. No metric theorem is promoted.

## 9. Files added / changed

New:

```text
branch-organization-graphics.js
verify_branch_organization_graphics_v0_17.js
docs/D4_BRANCH_ORGANIZATION_GRAPHICS_self_similar_cy_visualizer_v0_17.md
docs/state_self_similar_cy_visualizer_v0_17.json
docs/progress_self_similar_cy_visualizer_v0_17.md
```

Integration / exposition changes:

```text
index.html
README.md
.github/workflows/formal-verification.yml
```

Sealed semantic engines were not modified.

## 10. v0.17 verifier contract

`verify_branch_organization_graphics_v0_17.js` checks:

- exact `D=2 -> 16` organization multiplicity;
- exact `D=3 -> 81` fixture;
- a larger safe `D=64 -> 16777216` fixture;
- one aggregate badge per visible transition rather than multiplicity-sized DOM enumeration;
- D=1 rejection by the existing schema without promoting that rejection to mathematics;
- consumption of `scene.derived.sheetDegree` rather than a second D⁴ engine;
- `geometryRendered=false`;
- `sheetsMaterialized=false`;
- `coveringStructureClaimed=false`;
- `geometricZoomApplied=false`;
- deterministic graphical model / markup;
- branch presentation isolation from recursion and camera APIs;
- interaction collapse preserving underlying multiplicity;
- camera operations preserving organization runtime state;
- browser script ordering and publication wording;
- CI wiring.

## 11. Legacy regression history

The first staging runs exposed two documentation wording regressions, not semantic-engine regressions:

1. v0.15 verifier required the sealed visible wording `camera transform or geometric zoom`.
2. v0.16 verifier required the sealed visible wording `Camera scale is presentation-only viewport state`.

Both phrases were restored in `index.html`. No legacy assertion was removed, weakened, changed to a warning, or bypassed.

The subsequent pre-final-artifact staging run #79 (`35256652594`) passed:

```text
runtime-contracts = success
  v0.03 through v0.17 = success
  syntax gate = success
formal-lean = success
publication-static-smoke = success
```

Pre-final-artifact staging head:

```text
commit: 10b9be784a1706008712c72e8fa31c5be6469ab8
tree:   263666ef1f132271bd88577a566670a99a3cb3db
```

## 12. Formal boundary

No formal source, Lean version, mathlib pin, or theorem was changed in Thread 16.

The formal job continues to build and directly compile:

```text
formal/SelfSimilarCY/CoordinatePower.lean
formal/SelfSimilarCY/CoordinatePowerIteration.lean
formal/SelfSimilarCY/PullbackTower.lean
```

This proves only the repository's existing scoped formal core. It does not prove that the new badges are covering sheets.

## 13. Canonical scene boundary

`data/system.json` remains unchanged, including:

```text
requestedDepth = 0
D = 2
W representation = unresolved
```

The richer v0.17 UI is produced by legal interaction and presentation projection, not by deepening the canonical scene fixture.

## 14. Seal authority

This document is intentionally not self-certifying.

After this final artifact synchronization, the following must still happen externally:

```text
final exact staging tree CI success
close staging PR #9 unmerged
replay that exact verified tree as one child of 49ece02...
fast-forward main
exact-main Formal Verification success
exact-SHA Pages success
```

Only those Git object identities plus workflow evidence can establish the v0.17 canonical seal.

# Visual Semantics & Accessibility Audit — Self-Similar Calabi–Yau Visualizer v0.20

## 1. Scope

Thread 19 audits and repairs presentation semantics above the sealed v0.19 renderer.

The governing separation is:

```text
semantic selected/focused state
!= DOM keyboard focus
!= virtual layout
!= render materialization
!= structural camera state
!= geometric zoom
```

No new mathematics, recursion semantics, geometry, sheet materialization, covering claim, arithmetic semantics, or Lean theorem is introduced.

## 2. Starting canonical identity

```text
commit: 5c45dd74e53cde06e30ae70ecd97171f7012cf0d
tree:   9e054355f97c957939127b934a0b9605b3f1378e
parent: f1b2a0a43aae609574be795f5e3a89fe3e53fcc0
message: visualization: seal Thread 18 infinite navigation rendering engine v0.19
```

Inherited exact-main evidence:

```text
Formal Verification #110 / 35322442148 = success
Pages #7 / 35322441335 = success
PR #11 = closed, merged=false
```

## 3. Focus continuity contract

Virtualized interaction rendering still rebuilds its bounded interaction DOM, but browser focus is now restored from a presentation-only descriptor:

```text
control role
+ interaction action
+ semantic depth
```

The descriptor does not use:

```text
DOM child index
render slot index
presentation slot id
hidden full-tower nodes
```

DOM focus restoration consumes semantic state but never writes `selectedDepth`, `focusedDepth`, `recursiveModel.levels`, camera state, arithmetic state, or D⁴ organization state.

If the original control becomes disabled after the action, restoration falls back deterministically to the selected level control, then to the expand/reveal control.

## 4. Keyboard and native-control contract

Native buttons, checkboxes, `details`, and `summary` remain native. No custom Enter/Space/Tab implementation is added.

The camera retains native buttons for:

```text
Zoom in
Zoom out
Fit visible structure
Fit selected level
Fit focused level
Reset camera
```

These are the keyboard-accessible camera alternative. Thread 19 does not add arrow-key camera shortcuts.

## 5. Browser zoom and pointer boundary

Thread 19 changes only presentation event policy.

```text
browser zoom
!= structural camera zoom
!= geometric zoom
```

Policy:

```text
plain wheel / trackpad scroll -> browser/page
Ctrl/Cmd + wheel            -> browser-reserved
touch pan / pinch            -> browser/page
Alt + wheel                  -> structural camera zoom
mouse/pen drag               -> structural camera pan
native camera buttons        -> structural camera operations
```

The sealed `structural-camera.js` model is unchanged.

## 6. Virtualized assistive semantics

View-pruned gaps are no longer hidden from the accessibility tree. Each bounded gap exposes text of the form:

```text
N intermediate materialized levels omitted from the active render window
```

The text is derived from the same active render window. It is not a second semantic tower.

Thread 19 does not materialize one hidden DOM node per semantic level and does not retain discarded DOM indefinitely.

## 7. Live-region discipline

Only `#system-status` remains a polite status surface.

Visible interaction transition text and structural camera status remain ordinary text. Camera pointer movement therefore does not update an ARIA live region on every frame.

User-triggered interaction, camera-button, and arithmetic-toggle changes may publish one concise message through the single status region.

## 8. Color-independent and high-contrast semantics

Selected/focused state remains encoded by more than color:

```text
focused -> stroke width
selected -> dash pattern
selected + focused -> both
interactive controls -> text + aria-pressed / disabled state
```

A `forced-colors: active` stylesheet hook preserves visible disabled/gap/selection/focus distinctions without promoting any color-only meaning.

Quantitative rendered contrast is not certified by static source inspection.

```text
contrastEvidence = not_tested
```

## 9. Responsive and high-zoom contract

At narrow viewport widths, ordinary cards and controls continue to reflow to one column. The structural SVG no longer has to shrink its 960-unit canvas until labels become microscopic: below 760px it keeps a bounded internal minimum presentation width and the structural container scrolls horizontally without requiring page-wide overflow.

Real-browser 320/400/760px and browser-zoom 200%/400% evidence is separate from the static contract.

```text
browserZoomEvidence = not_tested
responsiveRenderedEvidence = not_tested
```

## 10. Reduced motion

The existing `prefers-reduced-motion: reduce` rule is preserved. Thread 19 adds no smooth focus restoration, animated camera transition, or animated selection reveal.

## 11. SVG and assistive-technology evidence

The structural SVG retains `role="img"`, accessible naming, `title`, and `desc`. D⁴ badges and arithmetic annotations retain their own source-level `role="img"` / `aria-label` markup.

Nested SVG accessibility-tree exposure varies by browser/assistive-technology implementation and is not certified by this static verifier.

```text
screenReaderEvidence = not_tested
```

## 12. Frozen truth boundary

Still invariant:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

## 13. Boundedness

Accessibility repair remains above the v0.19 bounded renderer:

```text
active interaction rows <= render policy bound
active structural objects <= render policy bound
virtual layout cache <= cache capacity
recursiveModel.levels is not viewport-pruned
```

No full hidden tower is created for accessibility.

## 14. Formal boundary

No `formal/*` source, Lean toolchain pin, or mathlib pin is changed. Thread 19 adds no Lean theorem.

## 15. Evidence layers

```text
Layer A — deterministic static / Node contracts: implemented
Layer B — real-browser smoke: not_tested at this artifact stage
Layer C — assistive-technology matrix: not_tested
```

Thread 19 does not claim WCAG certification, full screen-reader support, or all-browser support.

## 16. Verification

`verify_visual_semantics_accessibility_v0_20.js` checks sealed-source identity, focus-domain separation, deterministic focus restoration, bounded virtualized accessibility text, native control structure, camera/browser zoom guards, single-live-region discipline, color-independent hooks, forced-colors and reduced-motion hooks, narrow structural-canvas policy, truthfulness invariants, and CI wiring.

All earlier v0.03-v0.19 verifiers remain authoritative and are not weakened.

## 17. Seal authority

This document does not self-certify Thread 19.

Seal authority remains:

```text
exact final staging tree
+ exact staging CI
+ PR closed unmerged
+ exact-tree replay as one child of 5c45dd74e53cde06e30ae70ecd97171f7012cf0d
+ exact-main Formal Verification
+ exact-SHA Pages
```

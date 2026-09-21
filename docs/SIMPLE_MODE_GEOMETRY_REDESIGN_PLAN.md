# Simple mode geometry redesign plan

Status: superseded in its Simple first-visit flow by the implemented
[local branch geometry view plan](LOCAL_BRANCH_GEOMETRY_VIEW_PLAN.md). The
finite-fibre controls, visual-camera controls, point picking, display collision
report, and Expert-mode structural presentation move remain implemented. The
branch-focus milestone is now the bounded local patch comparison, rather than
a first-visit 16-point fibre. This plan uses the current
`W_kappa_torus4_v1` finite sampler, `P_D` pullback contract, and geometric
explorer. It does not change the historical release record.

## Visitor outcome and mathematical wording

A first-time visitor should see computed data immediately and understand one
action: a selected finite `X_0` sample has coordinate-power preimages under
`P_D(z)=(z_1^D,...,z_4^D)`. The initial example uses regular displayed
parameters, `D=2`, one source sample, and depth 1. The expected full-coordinate
fiber has 16 computed children. The next action requests depth 2 (256 points)
under the existing 10,000-point cap.

The page should say **"Finite view of a Calabi–Yau family"** and **"computed
pullback of one sample"**. A compact, always-visible legend should identify
the displayed object as a finite sample and a 3D projection of four complex
coordinates. The full `X_n` and a global self-similarity theorem remain open
claims for the visualizer. The source-level affine Calabi–Yau convention and
the current Lean boundary stay in the detailed explanation.

The visitor should never have to infer that an apparent duplicate mark is one
point: the current projection `(Re z_1, Im z_1, Re z_4)` discards `z_2,z_3`
and can overlay several of the 16 children. For the Simple view, add a
documented, fixed real-linear projection from the eight real coordinate
components to three display coordinates, chosen and tested on the default
fiber for readable separation. Preserve each full source coordinate and its
parent/root evidence. Detect remaining projected collisions and display their
count rather than silently dropping marks. This projection is a display map,
not a metric or embedding theorem; Expert mode retains its existing declared
projection.

## Single-screen interaction

1. Put one shared finite-geometry canvas directly beneath the Simple hero. On
   first load it shows the selected source sample and its 16 computed children,
   with a small caption: "1 sampled source point → 16 computed preimages ·
   D=2 · step 1". Show the count of distinct visible marks if projection
   collisions remain.
2. Keep three primary actions beside the canvas: **Next step**, **+ / −**, and
   **Fit view**. Drag rotates the camera; wheel and pinch change camera
   distance. The page must not intercept normal wheel or browser zoom while
   the pointer is outside the canvas. Add keyboard accessible buttons and
   respect reduced-motion preferences.
3. Clicking a mark highlights its actual parent relation and shows a short
   sentence, e.g. "This computed point maps to the highlighted parent under
   P₂." The full coordinate/root/residual record lives behind **How was this
   computed?**. Keep D, parameter sliders, scope, and the complete inspector
   in Expert mode.
4. **Next step** advances the same selected source scope, subject to exact
   preflight. At `D=2`, step 2 is 256 target points and step 3 is 4096. The
   Simple flow stops before the step-4 request (65,536 target points) and
   explains the cap in one sentence. A new request replaces the target-level
   marks; the selected source and parent trace stay identifiable.
5. Place the current structural SVG tower and its 3D presentation camera in
   Expert mode. The Simple canvas uses the computed geometry pipeline, so the
   visitor does not encounter two competing 3D boxes or a structural formula
   board before seeing the example.

The Simple layout should fit the headline, truthful legend, canvas, and one
primary action in the first desktop viewport. On mobile, use a single column
with the canvas above the actions. While loading, show an explicit loading
state; if GPU initialization fails, show the computed counts and a readable
fallback explanation instead of a blank rectangle.

## Camera and focus semantics

Use one `GeometryExplorer` computation and rendering state for both Simple and
Expert surfaces. Simple mode selects a curated view; Expert mode exposes all
existing controls. The Simple canvas should not spawn a separate mathematical
engine or duplicate sample generation.

Keep these values distinct in state and copy:

| Action | Data change | Visible label |
| --- | --- | --- |
| Drag / wheel / pinch / + / − | Camera pose and distance only | "Visual camera · 1.0×" |
| Fit view | Camera pose and display fit only | "Fit finite view" |
| Next step | New bounded `P_D` pullback data | "Computed step n" |
| Follow selected branch (later milestone) | Pullback from a selected computed parent, with provenance and preflight | "Finite branch focus" |

`geometricZoomApplied` stays false for camera and display-fit actions. A branch
focus control must not be shipped until the runtime can generate from the
selected computed parent, retain its full root path and residuals, and
preflight its exact target count. Recenter/normalization may help the visitor
see that branch, but the UI must call it display fit, not a metric scaling law.

## Reviewable implementation sequence

1. **Shared entry and clear copy.** Move the geometry explorer into a shared
   location in `index.html`; let `app.js` switch Simple/Expert presentation of
   one instance. Move the structural SVG and `#structural-3d-presentation`
   behind Expert. Update the Simple hero and canvas labels. Verify that the
   initial Simple view is computed and has no empty 3D placeholder.
2. **Finite projection and point selection.** Extend
   `geometry-exploration-contract.js` with the explicit Simple projection and
   collision report. Extend `geometry-exploration-engine.js` to render the
   source/child relation and select full point records. Verify parent IDs,
   four root indices, power residuals, and deterministic reload.
3. **Camera controls.** Add +, −, Fit view, drag, wheel, and pinch to the same
   canvas. Keep camera scale, display normalization, metric metadata, and
   inverse-branch scaling separate. Verify scroll behavior, keyboard access,
   mobile layout, and reduced motion.
4. **Guided depth and limits.** Wire Next step to exact preflight before
   generation. Confirm 16/256/4096 for the default one-ancestor path and show
   a clear stop at depth 4. Keep the existing Expert parameter/scope controls.
5. **Documentation and claim review.** Update the current-state and migration
   notes, not historical release documents. Review every Simple label against
   the admission contract and source/Lean boundaries.

## Acceptance checks

- A fresh desktop and mobile visit starts in Simple mode with nonblank
  computed points, a visible finite/projection label, and one obvious Next
  step action. No structural presentation camera appears there.
- The default 16 points are distinct full-coordinate records even if the
  projection merges some marks. Every selected child identifies its parent,
  root tuple, and residual evidence.
- Drag, wheel, pinch, +, −, and Fit view change only camera/display state.
  Switching modes or reloading does not alter the computed source records.
- Depth advances are deterministic and respect exact preflight. Over-cap or
  unsupported requests produce zero new marks and no stale target display.
- Chromium interaction checks cover first load, point selection, zoom, page
  scroll, depth changes, refusal, reload, and mobile. Node checks cover the
  projection/collision report, truth flags, provenance, and preflight.
- `lake build` is rerun as the existing formal baseline; the UI makes no
  broader claim from that result.

The next visual and mathematical step is the [local branch geometry view
plan](LOCAL_BRANCH_GEOMETRY_VIEW_PLAN.md): a computed `X_0` slice on entry,
followed by a parent-patch / inverse-branch-patch comparison in local log
coordinates.

The release decision for a stronger "self-similar Calabi–Yau" presentation is
separate: it needs a mathematically specified comparison between levels, a
proved or explicitly bounded scaling relation, and evidence that the compared
objects are the intended global objects. A finite pullback animation alone
does not supply that result.

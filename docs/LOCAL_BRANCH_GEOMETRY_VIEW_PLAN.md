# Local branch geometry view — modification plan

Status: first implementation complete in the current working tree. The current
Simple flow implements the declared slice, click- or keyboard-to-validated-vertex
selection, one cap-checked `9×9` local patch, one root tuple, raw/normalized
comparison, and Node/Chromium verification. The patch continuation is anchored
at the exact selected root and rejects a path-dependent closed-loop choice
instead of silently relabelling the center. Animation, multi-root Expert
comparisons, and a stronger mathematical admission remain future work.
This plan continues [the Simple mode redesign](SIMPLE_MODE_GEOMETRY_REDESIGN_PLAN.md)
and uses the existing schema-v2 `W_kappa_torus4_v1` evaluator and `P_D` fiber
engine. It does not revise historical release documents.

## What the visitor should see

The first Simple screen should open with the existing **declared two-real-
parameter subfamily of `X_0`** as a shaded, rotatable 3D view. It is a finite
mesh of a local display surface inside the complex-three-dimensional,
real-six-dimensional `X_0`, followed by a declared projection to `R^3`.
The always-visible caption should say “A 3D view of a sampled `X_0` slice”,
give `lambda`, `kappa`, the parameter status, and identify the projection.
It must not call this mesh the complete Calabi–Yau object.

The visitor can select a visible mesh vertex and press **Explore this patch**.
The app then shows the selected parent patch in `X_0` beside one computed
inverse-branch patch in `X_1`. A short animation may align the two patches in
local logarithmic coordinates. The comparison should say “Local inverse-
branch pattern, one selected root tuple” and display the numeric comparison
error. A link opens the exact coordinates, root tuple, parent IDs, membership
residuals, and source formula.

The rendered contour is a projection or sampling contour. It is not an
intrinsic edge of this noncompact hypersurface. The same exploration control
should work at any certified local patch, including a patch near a visible
contour. Mouse wheel/pinch and +/− continue to move only the visual camera;
**Explore this patch** is the explicit action that computes new data.

## The mathematical comparison

For a small chart on which each coordinate has a continuous logarithm, write
`w_j = log|z_j| + i arg(z_j)` for a parent point in `(C^×)^4`. With one fixed
root multi-index `k=(k_1,...,k_4)`, each child coordinate is calculated as

```text
w'_j = (w_j + 2 pi i k_j) / D
z'_j = exp(w'_j)
P_D(z') = z
```

Within that selected chart, `w'(p)-w'(p0) = (w(p)-w(p0))/D` for every sampled
point `p` of the patch and its center `p0`. Recenter the two *displayed log
coordinate patches* and multiply the child offsets by `D` for a side-by-side
comparison. This is a local coordinate relation for a specified inverse
branch. The source metric result `P_D^* g_log = D^2 g_log` remains separately
attributed, and the repository's current Lean metric boundary remains visible.
The comparison makes no assertion about Euclidean distance in the `R^3`
projection, a fractal boundary, or global self-similarity of `X_n`.

The comparison needs a patch, not just one source point. The proposed default
is a bounded `9×9` neighborhood (at most 81 valid parent samples) around a
selected slice vertex. One fixed root tuple yields at most 81 child samples.
Generating all 16 `D=2` root tuples for one 81-point patch would yield 1296
child samples, which is below the current 10,000-point cap but is deliberately
not the Simple scope; it can be an Expert comparison after exact preflight. A
full second-depth expansion of that 81-point patch would require 20,736 target
points, exceeding the cap, so Simple mode must not silently request it.

## Data and rendering changes, in order

1. **Source patch records.** Extend `geometry-exploration-math.js` so every
   accepted slice vertex retains its four complex source coordinates,
   `(theta,phi)`, quadratic root label, `W` residual, and deterministic ID.
   Clicking the mesh snaps to a validated vertex; it must never treat a
   barycentrically interpolated projected position as an `X_0` point.
2. **Numerically safeguarded local chart.** Build a bounded patch around that vertex using
   the same defining formula. Anchor the chosen quadratic root at the selected
   center; track nearest continuations across adjacent grid vertices and reject
   the entire patch when another already-reached path chooses a different root.
   Unwrap each coordinate argument relative to the center. Reject the patch if it crosses an unresolved root switch,
   argument discontinuity, invalid coordinate, excessive residual, or
   requested count cap. Return a structured refusal with no child mesh.
3. **Selected inverse branch.** Extend `geometry-exploration-contract.js` with
   a local patch request carrying `D`, depth, source patch ID, and one root
   multi-index. Compute each child from the continuous local log chart,
   validate `P_D(child)≈parent` and `W(P_D(child))≈lambda`, and retain parent
   IDs, root tuple, chart ID, formulas, tolerances, and residuals. Reuse the
   existing power evaluator and fiber conventions where possible.
4. **One clear comparison.** Extend `geometry-exploration-engine.js` and
   `index.html` with a parent-patch / child-patch comparison. Use identical
   point IDs and root colors across the two views; show both raw 3D
   projections and the explicitly normalized local-log comparison. The
   current finite 16-point fiber remains available as a second guided step or
   in Expert mode, with a direct explanation that it enumerates a fiber over
   one point rather than a patch of shape.
5. **Simple camera.** Keep drag to orbit, wheel/pinch and +/− to dolly, and
   Fit view. Preserve `cameraScale`, `displayNormalizationFactor`,
   `metricScaleD2Metadata`, and `inverseBranchScaling` as separate values.
   Add an explicit local-chart normalization record for the comparison.
   `geometricZoomApplied` remains false for camera actions. A future true
   value requires a scoped contract naming the map, chart, scale, source
   evidence, and passing tests; the UI must never turn it on just because
   the screen enlarged.
6. **Current-state documentation.** Update
   `docs/GEOMETRY_EXPLORATION_ENGINE_v2_CURRENT_STATE.md`, its migration note,
   and `docs/CURRENT_DEVELOPMENT_STATE.md`. Keep old release snapshots intact.

## Verification gates

| Gate | Required evidence |
| --- | --- |
| Source fidelity | Every selected vertex and patch point has finite nonzero coordinates, accepted `W` membership residual, and reproducible ID. |
| Branch fidelity | Each child has the same fixed root tuple and passes coordinate-power parent residual checks. |
| Local comparison | Compute and report the maximum error in `D(w'(p)-w'(p0))-(w(p)-w(p0))` on every accepted patch. Do not claim equality for a rejected chart. |
| Scope and limits | BigInt preflight for patch size × requested branches × depth; refusal generates zero new marks and clears stale comparisons. |
| UI truth | `completeX0Rendered=false`, `completeGlobalXnRendered=false`, `fractalBoundaryClaimed=false`; camera actions leave `geometricZoomApplied=false`. |
| Interaction | Chromium test: default mesh, vertex selection, local patch comparison, camera zoom, contour selection, chart refusal, cap refusal, reload determinism, mobile and keyboard use. |
| Formal baseline | Run `lake build` and report its actual theorem scope; it does not certify the browser rendering. |

An acceptance screenshot should show a recognizable shaded source patch on
first load and a readable parent/child comparison after one action. A separate
review should confirm that a new visitor can tell which panel is source data,
which is a projected display, and which action computes the child patch.

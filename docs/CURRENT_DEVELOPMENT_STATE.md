# Current development state

This page describes the source state of this local checkout after the Thread 31R repair and Thread 31 seal. It is a development entrypoint, **not evidence that the public GitHub Pages deployment has this source**: compare the deployed commit and Pages run before making a public claim. The root README records the byte-pinned historical `v1.0-rc1` structural release candidate; the immutable `v0.13` publication checkpoint is older still. A release tag describes its exact historical commit, not all later features on `main`.

## Current geometry exploration and v1 candidate history

The current post-release explorer contract is [Geometry Exploration Engine v2 current state](GEOMETRY_EXPLORATION_ENGINE_v2_CURRENT_STATE.md). Its [migration note](GEOMETRY_EXPLORATION_ENGINE_v2_MIGRATION.md) records the transition from the v1 candidate below. The v1 document remains a snapshot of that earlier candidate.

The first post-release explorer was `Geometry Exploration Engine v1`, documented in [Geometry Exploration Engine v1](GEOMETRY_EXPLORATION_ENGINE_v1.md). Its formula-bound modes remain in the current explorer, which consumes the already-admitted schema-v2
`W_kappa_torus4_v1` evaluator and does **not** alter the historical structural
pipeline. Its default display is a declared two-real-parameter subfamily of
`X_0`, followed by an explicit ambient-coordinate projection to `R^3`; it is
not a 3D embedding of the six-real-dimensional `X_0` or a complete
Calabi–Yau. Other modes separately label a phase display embedding, a finite
validated sample cloud, and a non-geometric structural pullback display.

The renderer has a WebGPU-first / WebGL2-fallback implementation, bounded
cache and resolution policy, cancellation token, visible load/error states,
and no external image/model/texture asset. A local patch is now anchored at
the selected source root and only admitted when nearest-root continuation is
path-consistent throughout the bounded patch; a path-dependent patch is
rejected without child samples. Its quadratic root labels are not sheets or
covering branches. It must remain distinct from the finite global and
ancestor-scoped evidence below.

The current local source-slice selector has four presets backed by two concrete
adapters: three bounded Laurent configurations and a canonical Fermat quintic
cross-section. The latter fixes `Z0=1`, `z3=z4=-1`, so its full source records
are `(z1,z2,-1,-1)` on `z1^5+z2^5=1`; its 25 `(k1,k2)` phase patches are
source-labelled finite cross-section patches, not sheets or the whole
threefold. Every preset has a deterministic local inverse-branch replay
sample. Simple mode keeps its Laurent default but offers **Show the colourful
quintic**, which restores the reviewed `xiWindow=1.2`, mounts the Fermat
surface, and fits only the presentation camera; it does not make a pullback.
The fixed Fermat demonstration source is `fermat-k0-0-t12-x7`, with radius 4
and 81 paired samples. **Magnify this patch · compare X1 with X0** explicitly
generates that local branch and opens the normalized local-log overlay directly;
raw coordinates remain a secondary diagnostic. A slice change clears the
comparison and never generates pullback geometry. These finite local comparisons
do not establish global self-similarity, a fractal boundary, or metric zoom.

## Try the visualizer

Open the [public visualizer](https://akari-h-111.github.io/self-similar-calabi-yau-visualizer/). For a local checkout, run `python3 -m http.server 8000` at the repository root and open `http://127.0.0.1:8000/`. The app is static HTML, CSS, and vanilla JavaScript; a local HTTP server is needed for its JSON requests. The default **Simple mode** starts with a finite mesh of a declared two-real-parameter `X₀` slice, explicitly projected to `R³`. Selecting one validated vertex computes one cap-checked `9×9` local patch and a single `D=2` inverse branch (81 paired parent/child records), with a separate local-log comparison. Drag, wheel/pinch, +/−, and fit controls operate the visual camera only. **Expert mode** exposes the formula parameters, view selector, finite scope controls, provenance, diagnostics, historical finite-fibre paths, structural SVG playground, and optional structural 3D descriptor camera. Neither mode presents a complete global object.

## What each view means

| View | What you can do | What it establishes |
| --- | --- | --- |
| Structural | Navigate and expand finite structural level descriptors, pan/zoom the structural SVG camera, toggle symbolic arithmetic overlays. | A runtime organization and presentation model. A node is not a geometric point; D⁴ badges are organization metadata. |
| Global finite geometry | Inspect validated finite `X₀` samples and the complete point fibers over that finite seed at `X₁`, projected to `(Re(z₁), Im(z₁))`. | Finite sampled geometry only. The current global seed has 512 points and its `X₁` pullback has 8192; the complete global `X₂` request would require 131072 and is refused above the 10000-point cap. |
| Ancestor-scoped geometry | Select one admitted `X₀` ancestor and explicitly press **Render selected scope** for an under-cap depth; inspect point ancestry. | Complete pullback over that selected finite ancestor scope, not over global `Xₙ`. One seed reaches depth 3 under the cap; depth 4 is refused before partial generation. |

The structural, global geometric, and scoped depth controls are independent. Switching contexts does not request new geometry. Stage correspondence is Class A only when Thread 26 already has a materialized global geometric stage for the selected structural depth; otherwise it is Class D. The wrapper delegates that verdict to Thread 26.

Simple mode is deliberately not a free geometry editor: it is a declared sampled slice plus one finite, explicitly chosen local inverse branch. Its side-by-side normalized display uses a local logarithmic coordinate relation and does not claim an intrinsic edge, fractal boundary, global geometric self-similarity, or metric zoom. `W_kappa_torus4_v1` remains the fixed admitted evaluator in the schema-v2 pipeline. Expert mode adjusts real-slice `κ` and `λ`, plus finite pullback `D` and depth; an arbitrary `W`, arbitrary complex parameters, and complete global geometry remain unavailable.

## Evidence boundary

- The structural schema-v1 fixture `data/system.json` leaves its `W` representation unresolved. The separate schema-v2 geometric fixture admits `W_kappa_torus4_v1`.
- `geometryRendered=true` applies to the admitted finite geometric surfaces. It does not assert a complete global hypersurface.
- Root tuples enumerate finite fibers; they are not global sheets, covering charts, or connected-component labels. Projected overlap does not identify source points.
- The structural camera changes only an SVG viewport. It does not establish geometric zoom or D² metric scaling.
- Lean proves specified coordinate-power, torus, Laurent, critical, differential, fiber-cardinality, and local implicit-function statements. See the [formal module matrix](../formal/MODULE_STATUS.md) for exact scope. A green formal CI job does not prove the visualizer or all project mathematics.
- Global smoothness, finite étale structure, canonical triviality, and Oka-type connectedness require separate source or external theorem inputs and are not claimed as Lean results here.

## Navigate and verify

The [repository guide](REPOSITORY_GUIDE.md) maps the source tree. [Audit III](AUDIT_III_FINAL_CONSOLIDATION.md) tracks final checks; [Plan v0.03](PLAN_self_similar_cy_visualizer_v0_03.md) is the sealed roadmap for scoped geometry. [Release status](RELEASE_STATUS.md) separates historical publication objects from current main. `node verify_hybrid_global_scoped_navigation_v0_01.js` and `node verify_thread31r_stage_correspondence_repair_v0_01.js` are focused bridge checks. `.github/workflows/formal-verification.yml` runs formal, runtime, static-publication, and browser jobs. The Lean environment is fixed by `formal/lean-toolchain` and `formal/lake-manifest.json`; use `cd formal && lake build` for a local formal build.

The current published GitHub release state must be checked separately from this development page. The historical `v0.13` release is immutable; Issue #17 records the exact `v1.0-rc1` structural prerelease target and conditions. No later development feature should be described as part of those historical release objects.

# Current development state

This page describes the current `main` application after the Thread 31R repair and Thread 31 seal. It is the active entrypoint for visitors and developers. The root README records the byte-pinned historical `v1.0-rc1` structural release candidate; the immutable `v0.13` publication checkpoint is older still. A release tag describes its exact historical commit, not all later features on `main`.

## Try the visualizer

Open the [public visualizer](https://akari-h-111.github.io/self-similar-calabi-yau-visualizer/). For a local checkout, run `python3 -m http.server 8000` at the repository root and open `http://127.0.0.1:8000/`. The app is static HTML, CSS, and vanilla JavaScript; a local HTTP server is needed for its JSON requests. Use the three-context selector near the top to choose a view.

## What each view means

| View | What you can do | What it establishes |
| --- | --- | --- |
| Structural | Navigate and expand finite structural level descriptors, pan/zoom the structural SVG camera, toggle symbolic arithmetic overlays. | A runtime organization and presentation model. A node is not a geometric point; D⁴ badges are organization metadata. |
| Global finite geometry | Inspect validated finite `X₀` samples and the complete point fibers over that finite seed at `X₁`, projected to `(Re(z₁), Im(z₁))`. | Finite sampled geometry only. The current global seed has 512 points and its `X₁` pullback has 8192; the complete global `X₂` request would require 131072 and is refused above the 10000-point cap. |
| Ancestor-scoped geometry | Select one admitted `X₀` ancestor and explicitly press **Render selected scope** for an under-cap depth; inspect point ancestry. | Complete pullback over that selected finite ancestor scope, not over global `Xₙ`. One seed reaches depth 3 under the cap; depth 4 is refused before partial generation. |

The structural, global geometric, and scoped depth controls are independent. Switching contexts does not request new geometry. Stage correspondence is Class A only when Thread 26 already has a materialized global geometric stage for the selected structural depth; otherwise it is Class D. The wrapper delegates that verdict to Thread 26.

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

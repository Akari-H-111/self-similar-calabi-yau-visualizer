# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.12 — UX / Exposition Layer

This repository is a minimal static HTML/CSS/vanilla-JavaScript **structural visualizer**. v0.12 does not add new mathematics or geometry. It adds an exposition layer so a reader can see, on the page itself, which parts are Lean-formalized, which are runtime metadata, which are structural or symbolic, and which remain unresolved or not materialized.

The project keeps the evidence rule established by v0.11:

```text
runtime representation
!= mathematical theorem
!= Lean theorem
!= parent-project theorem
!= visualization convention
```

## What the page shows first

The first-screen current-state summary now exposes:

```text
focused / materialized / requested depth
D
D² runtime metadata
D⁴ organization metadata
structural state
geometry status
formal status
navigation status
W representation
```

Those values are read from the existing normalized runtime models. `exposition-layer.js` does not recompute D², D⁴, recursion, sheets, or geometry.

The page also exposes the stable vocabulary:

```text
Lean formalized
Runtime metadata
Structural
Symbolic
Unresolved
Not materialized
Engineering
```

A generic `verified` badge is intentionally avoided because Lean proof, runtime verification, CI success, and engineering observations are different evidence layers.

## Project-level structural statement

The repository continues to carry the project notation

\[
X=W^{-1}(\lambda),
\qquad
X_n=(P_D^n)^{-1}(X),
\qquad
P_D(z_1,\ldots,z_4)=(z_1^D,\ldots,z_4^D).
\]

The sealed Lean core formalizes the coordinate-power map, its iteration law, and an abstract set-theoretic pullback tower for arbitrary `X : Set Point4`. It does **not** define `W` or Calabi–Yau geometry.

The runtime representation of `W` remains exactly:

```text
unresolved
```

Therefore no geometric Calabi–Yau hypersurface is currently rendered.

## Lean-formalized scope

The sealed formal scope remains unchanged from v0.11:

```text
formal/SelfSimilarCY/CoordinatePower.lean
formal/SelfSimilarCY/CoordinatePowerIteration.lean
formal/SelfSimilarCY/PullbackTower.lean
```

It establishes the four-coordinate coordinate-power map, the `D^n` iteration rule, the abstract set-theoretic pullback recurrence, and the closed-form preimage description via `coordinatePower (D ^ n)`.

Thread 11 does not modify `formal/` and does not promote any additional item into the formalized category.

## D² and D⁴

`scene-spec.js` still derives:

```text
scene.derived.metricScale = D^2
scene.derived.sheetDegree = D^4
```

The current interpretation is unchanged:

```text
D² = runtime numeric metadata
D⁴ = runtime numeric / organizational metadata
```

The current UI presents D² and D⁴ explicitly as runtime/organization metadata.

The repository does not claim that the sealed Lean core proves:

```text
P_D^* g_log = D^2 g_log
deg(P_D) = D^4
```

D⁴ is therefore **not a map-degree theorem** in the current formal scope. Legacy property names such as `metricScale`, `sheetDegree`, `mapDegree`, `mapDegreePerStep`, `iteratedDegreeExpression`, and `formalMetricScaleExpression` remain compatibility identifiers whose names do not upgrade their evidence status.

## Structural navigation, sheets, and geometry

The underlying runtime contracts remain unchanged:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
cameraTransformApplied = false
materializationTriggered = false
```

`Zoom semantics` means structural focus/navigation only. No camera or geometric scaling is applied.

Sheet/branch organization remains aggregate metadata only. No concrete D⁴ sheets, fiber geometry, covering structure, étale realization, or branch geometry is created.

The exposition page now puts these boundaries before the implementation diagnostics instead of requiring a reader to reconstruct them from several status messages.

## Arithmetic overlays

Implemented overlays remain:

```text
coordinate_channels
coordinate_iterate_rule
```

They retain their existing sealed Lean provenance.

The following remain unavailable/deferred in this visualizer layer:

```text
cyclotomic refinement
torsion labels / loci / cosets
collision classes / loci
Delta_n / divisor marking
pair discriminants
triple collisions
four-coordinate compatibility
positive-dimensional torsion families
```

The exact parent-project canonical sources needed to strengthen those claims were not available to the Thread 10/10R visualizer audit. They remain **not source-verified in this thread** and are not reconstructed from memory.

## Infinite-navigation and performance boundary

“Infinite navigation” retains the operational meaning:

```text
arbitrarily continued finite structural navigation
```

Benchmark horizons such as `10, 100, 1000, 2500, 5000, 10000` are engineering observations, **not mathematical limits** and not proof of literal infinite scalability.

`Number.isSafeInteger` guards are JavaScript representation-safety / engineering constraints, not mathematical theorems.

Real-browser long-session performance and heap behavior remain outside the sealed evidence unless separately measured.

## What green CI means

A green `formal-lean` job means the explicitly scoped Lean modules build, direct compilation succeeds, and the placeholder gate passes.

A green `runtime-contracts` job means the JavaScript contracts, claim-discipline regression, and UX/exposition semantic verifier pass.

It does **not** mean that the **entire visualizer, all Calabi–Yau mathematics**, browser behavior, D² metric scaling, D⁴ genuine map degree, covering geometry, or unavailable arithmetic research has been formally verified.

## UX / exposition architecture

v0.12 adds:

```text
exposition-layer.js
verify_ux_exposition_v0_12.js
docs/UX_EXPOSITION_self_similar_cy_visualizer_v0_12.md
```

The page hierarchy is now:

```text
explicit geometry boundary
current-state summary
semantic legend
formal/runtime/unresolved provenance panel
qualified canonical notation
implementation diagnostics disclosure
```

The low-level diagnostic DOM targets and runtime models are preserved for regression/debugging. They are simply moved out of the primary reading path.

Accessibility-oriented changes include one concise ARIA live status region, native `details/summary` disclosures, visible keyboard focus for summaries, single-column narrow-viewport layouts, visible text semantics rather than color-only coding, and no hover-only tooltip dependency for core meaning.

This is a source/contract-level accessibility pass, not a claim of real-browser or assistive-technology certification.

## Verify

Deterministic runtime, fidelity, and exposition verification:

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
```

The v0.11 verifier continues to enforce mathematical claim discipline. The v0.12 verifier checks semantic exposition contracts, source-of-truth reuse, accessibility hooks, and byte-for-byte preservation of the sealed v0.11 runtime math/organization engines. Neither verifier replaces mathematical proof.

## Run locally

Serve the repository over HTTP rather than opening `index.html` with `file://`:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in a browser.

## Historical wording

Historical v0.03–v0.06 documents are preserved. Some use stronger phrases such as `sheet degree`, `map degree`, or `degree multiplicativity`. The current canonical interpretation remains the later F05/v0.11 boundary: D², D⁴, and `(D⁴)^n` runtime fields are unformalized metadata unless stronger exact source evidence is retrieved and audited.

## Scope of v0.12

v0.12 completes **Thread 11 — UX / Exposition Layer** only if staging and canonical exact-SHA CI both pass.

It adds no theorem, no `W` implementation, no genuine D⁴ sheet renderer, no covering/étale/fiber renderer, no cyclotomic/torsion/collision implementation, no camera system, no geometric zoom, and no publication deployment.

Detailed exposition contract:

```text
docs/UX_EXPOSITION_self_similar_cy_visualizer_v0_12.md
```

After Thread 11 is sealed, the natural roadmap milestone is **Thread 12 — Publication Checkpoint**.

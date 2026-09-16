# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.10 — Performance and Infinite-Navigation Audit

This repository is a minimal static HTML/CSS/vanilla-JavaScript application for the Self-Similar Calabi–Yau Visualizer. v0.10 audits the scaling frontier of the existing structural engine, distinguishes retained semantic state from leaks, verifies deep finite navigation semantics, and adds only the JavaScript safe-integer guards justified by the audit.

No recursion representation rewrite was justified by the measurements.

## Canonical mathematical core

\[
X = W^{-1}(\lambda),
\qquad
X_n = (P_D^n)^{-1}(X),
\qquad
P_D(z_1,\ldots,z_4) = (z_1^D,\ldots,z_4^D).
\]

The scene is loaded from `data/system.json`, validated by `scene-spec.js`, and passed through the base, one-step, recursive, zoom, sheet/branch-organization, and arithmetic-overlay layers.

## Preserved runtime contracts

The canonical mathematical inputs remain only:

```text
D
lambda
kappa
```

`requestedDepth` is a request parameter. `P_D` still comes only from the structured `coordinate_power` declaration.

`scene-spec.js` remains the sole runtime source of:

```text
scene.derived.metricScale = D^2
scene.derived.sheetDegree = D^4
```

The concrete representation of `W` remains:

```text
unresolved
```

Accordingly:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
```

The v0.06 recursion engine remains the only operation that can add structural levels. v0.07 zoom remains focus/navigation metadata only. v0.08 sheet/branch organization remains aggregate structural metadata only. v0.09 arithmetic overlays remain symbolic/provenance-aware annotations only.

The following boundaries remain explicit:

```text
zoom != recursive materialization
sheet organization != recursive materialization
arithmetic overlay != recursive materialization
arithmetic truth != geometric realization
```

## v0.10 meaning of infinite navigation

"Infinite navigation" means only:

```text
arbitrarily continued finite structural navigation
```

It does not mean:

```text
a literal infinite in-memory tree
a browser execution guarantee for infinite time
a mathematical maximum-depth theorem
a completed infinite-scroll / infinite-zoom UX
```

For any practically handled finite stage, `expandOneLevel()` can continue the structural model by at most one level without a hard-coded small depth ceiling.

## Performance audit result

The audited recursion path uses immutable arrays. Each expansion constructs a new levels array and `buildModel()` copies/freezes the array again, so repeated expansion has a plausible superlinear array-copy cost.

This was measured rather than assumed.

Baseline GitHub Actions observation on Node `v22.23.2`, Linux x64:

```text
depth 1,000  -> 4.296 ms cumulative expansion
depth 2,500  -> 22.161 ms
depth 5,000  -> 28.474 ms
depth 10,000 -> 97.185 ms
```

At depth 10,000:

```text
retained recursive descriptors: 10,000
forced-GC retained expansion delta: 1.988 MiB
approx temporary expansion allocation: 7.953 MiB
focus creation: 0.065803 ms
sheet organization creation: 1.555229 ms
overlay creation: 0.215357 ms
```

A second run after the numerical safety guard measured 10,000 levels at `125.786 ms`, with the same retained/temporary memory observations.

These are environment-sensitive observations, not CI performance thresholds and not mathematical depth limits.

### Optimization Decision

```text
no production optimization justified
```

`recursive-lazy-expansion.js` is unchanged by v0.10.

No mutable global recursion state, linked list, chunked tree, persistent-vector library, worker architecture, cache, pruning subsystem, database, framework, Three.js, or WebGL was introduced.

The measured superlinear copying trend is documented as a future scaling frontier, not treated as an emergency rewrite trigger.

## Memory / leak boundary

The recursive model intentionally retains one structural descriptor per materialized positive depth. Retained heap growth with depth is therefore expected semantic state growth.

v0.10 distinguishes:

```text
necessary retained state
temporary allocations
discardable view/cache state
actual leak
```

No cache or pruning subsystem and no discarded recursive levels currently exist. Therefore:

```text
leak-from-discarded-levels = not_applicable
```

Real browser long-session heap/leak observation remains `not_tested`.

## Large-n numerical representation

Deep exponents remain symbolic:

```text
iterated degree: { baseDegree, exponent }
coordinate iterate: { baseParameter, towerDepth }
```

The runtime does not evaluate giant `D^n`, `D^(2n)`, or `D^(4n)` values during deep structural navigation.

The v0.10 audit identified one real JavaScript representation risk: integer-valued Numbers outside the safe-integer range can alias. The minimal safety guard is therefore:

```text
requestedDepth     -> Number.isSafeInteger(value) && value >= 0
requestedFocusDepth -> Number.isSafeInteger(value) && value >= 0
```

`Number.MAX_SAFE_INTEGER` remains valid metadata. Values above the safe-integer range are rejected.

This is an engineering/runtime representation constraint, not a mathematical depth theorem.

## Arithmetic overlay boundary

The v0.09 implemented overlays remain:

```text
coordinate_channels
coordinate_iterate_rule
```

They continue to use the sealed Lean provenance in:

```text
formal/SelfSimilarCY/CoordinatePower.lean
formal/SelfSimilarCY/CoordinatePowerIteration.lean
```

Cyclotomic refinement, torsion labels, collision classes, and `Delta_n` divisor marking remain deferred/unavailable in this visualizer layer. v0.10 adds no arithmetic theorem or geometry.

See `docs/ARITHMETIC_OVERLAYS_self_similar_cy_visualizer_v0_09.md` for the exact v0.09 evidence boundary.

## Formal verification boundary

Formal Verification F01–F06 remains sealed. v0.10 changes no Lean theorem/source file.

A green CI run means:

```text
sealed Lean formal core passes
+
runtime engineering contracts pass
```

It does not mean browser performance, all arithmetic overlay mathematics, all Calabi–Yau geometry, or the entire visualizer is formally verified.

The following remain explicitly unclaimed:

```text
deg(P_D) = D^4 as a genuine map-degree theorem
concrete D^4 sheets
covering-space or étale geometry
fiber geometry
resolved W geometry
Calabi–Yau geometry
P_D^* g_log = D^2 g_log
```

See `docs/FORMAL_HANDOFF_self_similar_cy_visualizer_v0_06.md` for the sealed formal scope.

## Rendering / browser evidence

The rendering surface remains ordinary DOM text/status output. There is no Canvas/SVG geometry scene graph, Three.js, WebGL, GPU buffer system, camera matrix, mesh system, or interactive infinite-navigation loop.

Evidence is deliberately separated:

```text
deterministic runtime contracts -> CI hard gate
Node timing/heap benchmark       -> environment-sensitive audit evidence
real browser smoke/performance   -> not_tested
```

Node performance is not presented as browser frame-time evidence.

## Run locally

Serve the repository over HTTP rather than opening `index.html` with `file://`:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in a browser.

## Verify

Deterministic runtime verification:

```bash
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
node verify_zoom_semantics_v0_07.js
node verify_sheet_branch_organization_v0_08.js
node verify_arithmetic_overlays_v0_09.js
node verify_performance_infinite_navigation_v0_10.js
```

Optional environment-sensitive benchmark:

```bash
node --expose-gc benchmark_performance_infinite_navigation_v0_10.js
```

Runtime syntax checks:

```bash
node --check scene-spec.js
node --check base-renderer.js
node --check one-step-pullback.js
node --check recursive-lazy-expansion.js
node --check zoom-semantics.js
node --check sheet-branch-organization.js
node --check arithmetic-overlays.js
node --check verify_performance_infinite_navigation_v0_10.js
node --check benchmark_performance_infinite_navigation_v0_10.js
node --check app.js
```

The v0.10 deterministic verifier covers finite stress materialization, one-level-at-a-time authority, model immutability, symbolic exponent storage, non-materializing zoom/organization/overlay behavior, Number safe-integer guards, and unresolved geometry.

The historical v0.09 verifier keeps its behavioral assertions; only its repository-version metadata assertion is generalized to accept v0.09 and later versions.

## Scope of v0.10

This version completes **Thread 09 — Performance and Infinite-Navigation Audit** only.

It does not perform Thread 10 mathematical fidelity auditing, add new arithmetic geometry, resolve `W`, materialize genuine sheets, add covering/fiber geometry, implement Three.js/WebGL/GPU rendering, add a camera/mesh system, add guided UX, or publish the project.

Detailed audit: `docs/PERFORMANCE_INFINITE_NAVIGATION_self_similar_cy_visualizer_v0_10.md`.

The next milestone is **Thread 10 — Mathematical Fidelity Audit**.

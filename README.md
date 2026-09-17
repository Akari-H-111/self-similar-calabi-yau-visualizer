# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.11 — Mathematical Fidelity Audit

This repository is a minimal static HTML/CSS/vanilla-JavaScript structural visualizer. v0.11 adds no new geometry or arithmetic feature. Its purpose is narrower: every mathematical-looking runtime field, label, overlay, and documentation claim is classified by the evidence that actually supports it.

The rule for the current repository is:

```text
runtime representation
!= mathematical theorem
!= Lean theorem
!= parent-project theorem
!= visualization convention
```

## Project-level structural statement

The repository continues to carry the project-level notation

\[
X=W^{-1}(\lambda),
\qquad
X_n=(P_D^n)^{-1}(X),
\qquad
P_D(z_1,\ldots,z_4)=(z_1^D,\ldots,z_4^D).
\]

Thread 10 does not upgrade every part of this display to a Lean theorem. In particular, the runtime representation of `W` remains exactly:

```text
unresolved
```

The sealed Lean core formalizes the coordinate-power map, its iteration law, and an abstract set-theoretic pullback tower for arbitrary `X : Set Point4`. It does not define `W` or Calabi–Yau geometry.

## Evidence discipline

v0.11 distinguishes the following statuses:

```text
formally proved        = theorem present in the sealed Lean source
runtime-verified       = deterministic repository/runtime assertion checked by Node or CI
source-backed          = exact retrieved canonical source supports the representation
representational       = runtime field or descriptor that denotes structure without realizing the mathematical object
heuristic/convention   = visualization choice without theorem status
unresolved             = intentionally not represented or not established
not tested             = potentially testable but no corresponding execution evidence exists
not available          = exact source required for a stronger claim was not retrieved in this thread
```

A single feature may have several layers. For example, the coordinate-power map has a runtime representation and deterministic runtime checks, while the same coordinatewise transformation is also formalized in Lean.

## Current mathematical fidelity boundary

### Coordinate-power map

Runtime declares a four-coordinate `coordinate_power` map with exponent parameter `D`. The sealed Lean module `formal/SelfSimilarCY/CoordinatePower.lean` defines

```lean
Point4 := Fin 4 → ℂ
coordinatePower D z i = z i ^ D
```

and proves its coordinate rule and uniqueness at that abstraction level.

### Iteration

The sealed Lean module `formal/SelfSimilarCY/CoordinatePowerIteration.lean` proves

```lean
(coordinatePower D)^[n] z i = z i ^ (D ^ n)
```

and the map-level identity

```lean
(coordinatePower D)^[n] = coordinatePower (D ^ n)
```

The runtime overlay `coordinate_iterate_rule` exposes only a symbolic exponent descriptor. It does not evaluate a huge `D^n` or construct geometric data.

### Pullback tower

`formal/SelfSimilarCY/PullbackTower.lean` defines repeated ordinary set preimages and proves

```lean
pullbackTower D X n = ((coordinatePower D)^[n]) ⁻¹' X
```

plus the corresponding `coordinatePower (D ^ n)` form.

Runtime levels are structural descriptors for this recurrence. They are not actual Lean `Set Point4` values, algebraic varieties, schemes, analytic spaces, fibers, or covering spaces.

## D² and D⁴

`scene-spec.js` deterministically derives:

```text
scene.derived.metricScale = D^2
scene.derived.sheetDegree = D^4
```

Under the current sealed formal scope these are **runtime numeric metadata**.

The repository does not claim that Lean proves:

```text
P_D^* g_log = D^2 g_log
deg(P_D) = D^4
```

Legacy runtime field names such as `metricScale`, `sheetDegree`, `mapDegree`, `mapDegreePerStep`, `iteratedDegreeExpression`, and `formalMetricScaleExpression` are retained for compatibility. Their names do not upgrade the stored values into metric, degree, covering, or sheet theorems.

The current live UI therefore labels D² and D⁴ explicitly as runtime/organization metadata, and the one-step status text explicitly states that D⁴ metadata is not a map-degree theorem in the current formal scope.

## Zoom, sheet, and branch semantics

Zoom remains structural focus/navigation only:

```text
geometricZoomApplied = false
cameraTransformApplied = false
materializationTriggered = false
```

Sheet/branch organization remains aggregate metadata only:

```text
sheetDegreeSemanticStatus = runtime_numeric_organizational_metadata
slotsEnumerated = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometryRendered = false
materializationTriggered = false
```

No concrete D⁴ sheets, covering structure, branch geometry, fiber geometry, or étale realization is claimed.

## Arithmetic overlays

Implemented and exact-source-backed:

```text
coordinate_channels
coordinate_iterate_rule
```

Their provenance is tied to the sealed Lean coordinate-power and iteration modules.

The following remain explicitly deferred/unavailable in this visualizer layer because no exact canonical mathematical source for them was retrieved into the relevant source audit:

```text
cyclotomic refinement
torsion labels / torsion loci / torsion cosets
collision classes / collision loci
Delta_n / divisor marking
pair discriminants
triple collisions
four-coordinate compatibility
positive-dimensional torsion families
```

They are not reconstructed from conversation memory and are not silently inserted into runtime data.

## W representation

`data/system.json` stores only:

```text
symbol = W
representation = unresolved
```

Consequently the renderer continues to report unresolved geometry. No points, contours, meshes, hypersurface samples, or implicit geometry are generated.

## Parent-project evidence boundary

Thread 10 attempted exact retrieval of the requested Arithmetic Self-Similar Calabi–Yau parent artifacts. Those exact artifacts were not available through the connected repository/source surfaces used by this thread.

Therefore v0.11 does **not** promote any remembered parent-project result into canonical evidence. Parent-project claims that are not independently present in the current visualizer repository are marked `not available / not source-verified in this thread`.

See `docs/MATHEMATICAL_FIDELITY_self_similar_cy_visualizer_v0_11.md` for the missing exact filenames and the complete ledger.

## Infinite-navigation and performance boundary

"Infinite navigation" retains the v0.10 operational meaning:

```text
arbitrarily continued finite structural navigation
```

The benchmark horizons `10, 100, 1000, 2500, 5000, 10000` are engineering observations, not mathematical limits and not a proof of infinite scalability.

The `Number.isSafeInteger` depth/focus guards are JavaScript representation-safety constraints, not mathematical theorems.

Real browser long-session performance and heap behavior remain:

```text
not_tested
```

## Formal verification boundary

The sealed Lean core is limited to the explicitly scoped files:

```text
formal/SelfSimilarCY/CoordinatePower.lean
formal/SelfSimilarCY/CoordinatePowerIteration.lean
formal/SelfSimilarCY/PullbackTower.lean
```

A green `formal-lean` CI job means those pinned Lean sources build, their direct compilations pass, and the placeholder gate passes.

A green `runtime-contracts` CI job means the deterministic JavaScript contracts and claim-discipline verifier pass.

A green workflow therefore means:

```text
sealed scoped Lean formal core passes
+
runtime engineering / claim-discipline contracts pass
```

It does not mean that the entire visualizer, all Calabi–Yau mathematics, browser behavior, D² metric scaling, D⁴ genuine map degree, covering geometry, or unavailable arithmetic research has been formally verified.

## Historical wording

Historical v0.03–v0.06 documents are preserved rather than rewritten. Some of them use stronger phrases such as `sheet degree`, `map degree`, or `degree multiplicativity`. The current canonical interpretation is the later F05/v0.11 boundary: the corresponding runtime D⁴ fields are unformalized numeric/organizational metadata unless and until a stronger exact mathematical source is retrieved and audited.

The v0.11 audit fixes only wording that is still live in current runtime/UI output.

## Verify

Deterministic runtime and fidelity verification:

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
```

Optional environment-sensitive benchmark:

```bash
node --expose-gc benchmark_performance_infinite_navigation_v0_10.js
```

The v0.11 verifier checks repository claim discipline. It does **not** replace mathematical proof.

## Run locally

Serve the repository over HTTP rather than opening `index.html` with `file://`:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in a browser.

## Scope of v0.11

v0.11 completes **Thread 10 — Mathematical Fidelity Audit** only.

It adds no new theorem, no `W` implementation, no genuine D⁴ sheet renderer, no covering/étale/fiber renderer, no cyclotomic/torsion/collision overlay, no Three.js/WebGL/GPU architecture, no camera system, and no publication feature.

Detailed audit:

```text
docs/MATHEMATICAL_FIDELITY_self_similar_cy_visualizer_v0_11.md
```

After Thread 10 is sealed, the roadmap may proceed to **Thread 11 — UX / Exposition Layer** without treating any unresolved mathematical item as solved.

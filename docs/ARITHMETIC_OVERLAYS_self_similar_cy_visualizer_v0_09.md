# Arithmetic Overlays Specification — v0.09

## Status

This document closes **Thread 08 — Arithmetic Overlays**.

The milestone begins with an evidence audit rather than an implementation mandate. Under the current canonical repository and sealed F01–F06 formal boundary, only arithmetic annotations with exact provenance may be enabled. Missing arithmetic research sources are deferred rather than reconstructed from memory or replaced with fabricated data.

## Canonical starting point

Thread 08 starts from canonical `main`:

```text
e257c2d3b7e52c29f30a9a7c30503fddd5297a2e
sheets: add verified v0.08 branch organization semantics
```

with sole parent:

```text
970bafa06b0af0f68a302164fc63c0d5dc460687
```

The v0.08 contracts remain authoritative:

```text
requestedDepth != materializedDepth
requestedFocusDepth != focusedDepth
expandOneLevel = sole recursive materialization authority
zoom != recursive materialization
sheet organization != recursive materialization
D^4 = runtime numeric / organizational metadata
sheetsMaterialized = false
coveringStructureClaimed = false
geometryRendered = false
```

Thread 08 adds:

```text
arithmetic overlay != recursive materialization
arithmetic truth != geometric realization
```

## Arithmetic Overlay Representability / Evidence Audit

| Roadmap candidate | Exact canonical source available to this thread? | Source/version | Runtime inputs sufficient? | Geometry required? | Formal status | Decision | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cyclotomic refinement | no | unavailable | unresolved | unresolved | not in sealed F01–F06 | deferred | No exact canonical cyclotomic artifact was available for retrieval in this thread. |
| torsion labels | no | unavailable | unresolved | unresolved | not in sealed F01–F06 | deferred | No exact canonical torsion artifact was available for retrieval in this thread. |
| collision classes | no | unavailable | unresolved | unresolved | not in sealed F01–F06 | deferred | No exact canonical collision artifact was available for retrieval in this thread. |
| `Delta_n` / divisor marking | no | unavailable | unresolved | unresolved | not in sealed F01–F06 | deferred | No exact canonical `Delta_n`/divisor artifact was available for retrieval in this thread. |
| coordinate-channel labels | yes | `formal/SelfSimilarCY/CoordinatePower.lean` blob `dcfae8a3ed99544e50ee45aa12acde63e41090c8`; `formal/SelfSimilarCY/CoordinatePowerIteration.lean` blob `4c78793d586e8ba822d4b326f09fd82dc07eaaf9`; sealed by F06 commit `ff5bcd2f134497c671b2368c372f59b5620a41ab` | yes | no | sealed Lean source/theorems | implemented | The formal core defines `Point4 := Fin 4 → ℂ`, `coordinatePower`, `coordinatePower_apply`, and the iteration theorem. |

“Unavailable” means unavailable to this thread as an exact canonical source. It is not a claim that the corresponding mathematics does not exist elsewhere.

## Evidence classification

v0.09 uses explicit evidence classes:

```text
formal_theorem
exact_source_backed_computation
source_backed_structural_representation
finite_visualization_metaphor
heuristic
unresolved_unavailable
```

Only the following are active in v0.09:

- `coordinate_channels`: `source_backed_structural_representation`, with `formal_theorem` support from `CoordinatePower.lean`;
- `coordinate_iterate_rule`: `formal_theorem`, sourced from `coordinatePower_iterate_apply` in `CoordinatePowerIteration.lean`;
- the four deferred roadmap candidates: `unresolved_unavailable`.

No v0.09 overlay is classified as an exact arithmetic computation, finite visualization metaphor, or heuristic.

## Implemented overlay family: coordinate-channel labels

The one source-backed roadmap candidate is implemented as two independently toggleable views.

### 1. `coordinate_channels`

Scope:

```text
global_system_metadata
```

Source-backed content:

```text
Point4 := Fin 4 → ℂ
coordinatePower D z i = z i ^ D
```

Runtime data is derived from the already validated scene declaration:

```text
scene.mathematics.pullbackMap.coordinateCount
scene.mathematics.pullbackMap.kind
scene.mathematics.pullbackMap.exponentParameter
```

The overlay creates four symbolic channel labels for the canonical scene, but it does not create points, fibers, sheets, torus coordinates, or geometry.

### 2. `coordinate_iterate_rule`

Scope:

```text
focused_level_metadata
```

Exact formal source:

```lean
(coordinatePower D)^[n] z i = z i ^ (D ^ n)
```

The runtime representation remains symbolic. At an already-materialized focus depth `n`, each coordinate channel receives a structured exponent expression:

```text
baseParameter = scene.mathematics.pullbackMap.exponentParameter
 towerDepth = focusedDepth
```

The module does **not** evaluate `D^n`, construct a combined map, or claim geometric scale.

If the requested focus is not materialized, this overlay returns:

```text
requestStatus = not_materialized
```

and does not call `expandOneLevel`.

## Provenance contract

Every implemented overlay carries exact source identity.

For `coordinate_channels`:

```text
artifact = formal/SelfSimilarCY/CoordinatePower.lean
sourceVersion = git-blob:dcfae8a3ed99544e50ee45aa12acde63e41090c8
formalSealCommit = ff5bcd2f134497c671b2368c372f59b5620a41ab
```

For `coordinate_iterate_rule`:

```text
artifact = formal/SelfSimilarCY/CoordinatePowerIteration.lean
sourceVersion = git-blob:4c78793d586e8ba822d4b326f09fd82dc07eaaf9
formalSealCommit = ff5bcd2f134497c671b2368c372f59b5620a41ab
```

The dedicated verifier recomputes the Git blob SHA from the repository source text and checks the theorem identities. Provenance is therefore executable repository evidence rather than an unverified prose label.

Deferred candidates carry:

```text
canonicalSource = null
sourceVersion = null
evidenceClass = unresolved_unavailable
```

They can never fall back to guessed data.

## Runtime architecture

`arithmetic-overlays.js` is an independent derived layer. Its inputs are:

```text
validated normalized scene
current recursive model
current zoom/focus model
current sheet/branch organization model
runtime overlay request ids
```

It does not validate raw scenes, compute `D^2`, compute `D^4`, read `parameters.D` as a second source, materialize recursion, or mutate upstream models.

The top-level model records:

```text
kind = arithmetic_overlays
status
requestedOverlays
implementedOverlays
deferredCandidateOverlays
availableOverlays
enabledOverlays
requestResults
overlayDescriptors
sourceArtifacts
requestedDepth
materializedDepth
requestedFocusDepth
focusedDepth
sheetOrganizationStatus
overlayStateIsViewRequest = true
recursionModified = false
zoomModified = false
sheetOrganizationModified = false
materializationTriggered = false
geometryRendered = false
formalVerificationReopened = false
```

Overlay enable/disable state is runtime view request state. It is not written into `data/system.json`, and schema version 1 remains unchanged.

## Toggle semantics

The contract supports:

```text
all disabled
one enabled
multiple independently enabled
disable after enable
deferred overlay requested
unsupported overlay requested
```

Toggling arithmetic overlays must not alter:

```text
requestedDepth
materializedDepth
requestedFocusDepth
focusedDepth
recursive levels
sheet/branch descriptors
```

An unavailable or unsupported request creates no descriptor.

## Interaction with materialized levels

`coordinate_channels` is global system metadata and does not require a materialized positive depth.

`coordinate_iterate_rule` is focused-level metadata. It is available only when `zoomModel.focusedDepth` is non-null. A not-yet-materialized focus is reported deterministically and never expanded by the overlay layer.

This is the only per-level arithmetic behavior in v0.09.

## Interaction with sheet / branch organization

The overlay layer accepts the current organization model only as an upstream consistency dependency. It does not modify organization descriptors and does not attach arithmetic annotations to fabricated sheets.

The existing v0.08 semantics remain:

```text
descriptorMode = aggregate_structural_descriptors
slotsEnumerated = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometryRendered = false
```

## Geometry and formal boundary

v0.09 preserves:

```text
W representation = unresolved
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
```

The two implemented overlays reuse already sealed Lean facts. No new theorem is introduced, no Lean source is changed, and F01–F06 remains sealed.

A future implementation of cyclotomic, torsion, collision, divisor, fiber, covering, or genuine arithmetic geometry must first retrieve and audit its exact canonical mathematical source. If it introduces a new substantive claim outside the F01–F06 boundary, it should be recorded as a future formal-reopening candidate rather than smuggled into this overlay layer.

## Rendering boundary

The initial rendering surface remains ordinary DOM text/status output. v0.09 adds no Canvas/SVG geometry, Three.js, WebGL, GPU buffers, camera/projection system, mesh generation, or physical viewport transform.

## Verification contract

`verify_arithmetic_overlays_v0_09.js` verifies at least:

- exact Git-blob provenance for both Lean source files;
- theorem identity presence in the source files;
- all-disabled, one-enabled, two-independently-enabled, and disable-after-enable behavior;
- core recursive, zoom, and organization models remain unchanged by toggles;
- deferred torsion requests return `unavailable` with no source/version and no descriptor;
- unknown overlay requests return `unsupported`;
- an unmaterialized focus makes only the focused iterate overlay `not_materialized` while the global coordinate-channel overlay remains available;
- no overlay call materializes recursion;
- explicit external `expandOneLevel` can make the focused iterate overlay available later;
- the overlay module does not recompute `D^2` or `D^4`, directly read `parameters.D`, or create another validator;
- `W = unresolved`, no sheet geometry, and no covering claim remain intact;
- application initialization remains validation-first and does not call `expandOneLevel`;
- scope guards reject Three.js/WebGL/mesh/camera/GPU/fabricated arithmetic-geometry structures.

All historical v0.03–v0.08 verifiers must remain green. The v0.08 verifier changes only its exact repository-version metadata assertion so v0.09 does not create a false regression in an unchanged v0.08 contract.

## Staging CI evidence

The v0.09 executable tree was verified through staging PR #2 at head:

```text
b84e6ef0c138b77be7ec957a5e899eebbfa7ea91
```

Workflow run:

```text
35068678136
```

Results:

```text
runtime-contracts = completed / success
formal-lean = completed / success
```

The runtime job passed all v0.03–v0.09 verifiers plus syntax checks. The formal job passed the sealed Lean build, direct compilation of `CoordinatePower.lean`, `CoordinatePowerIteration.lean`, and `PullbackTower.lean`, plus the placeholder rejection gate. No Lean theorem/source file was changed by v0.09.

## Thread 08 stopping point

\[
\boxed{\text{Arithmetic overlays are provenance-aware symbolic annotations, not guessed arithmetic geometry}}
\]

The next milestone is **Thread 09 — Performance and Infinite-Navigation Audit**. No Thread 09 implementation is included here.

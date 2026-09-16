# Sheet / Branch Organization Specification — v0.08

## Status

This document closes **Thread 07 — D^4 Sheet / Branch Organization Semantics**.

The milestone answers a deliberately narrower question than the historical roadmap wording suggests: while `W`, genuine map degree, covering structure, fibers, and concrete geometry remain unresolved or unformalized, what is the strongest truthful organization semantics supported by the current canonical repository?

## Canonical dependencies

The v0.03 scene contract remains unchanged:

\[
X=W^{-1}(\lambda),
\qquad
X_n=(P_D^n)^{-1}(X),
\qquad
P_D(z_1,\ldots,z_4)=(z_1^D,\ldots,z_4^D).
\]

Canonical mathematical inputs remain only `D`, `lambda`, and `kappa`. `requestedDepth` remains a request parameter. `D^2` and `D^4` remain validator-derived runtime values. `W.representation` remains exactly `unresolved`.

The v0.04 Base Renderer, v0.05 One-Step Pullback, v0.06 Recursive Lazy Expansion, and v0.07 Zoom Semantics contracts remain preserved.

Formal Verification F01–F06 remains sealed and is not reopened by this milestone.

## Representability audit

### A. Symbolic multiplicity

Supported.

The normalized scene already exposes:

```text
scene.derived.sheetDegree = D^4
```

This is exact runtime numeric data after validation. It may be reused as multiplicity metadata, but under the sealed formal handoff it is not a Lean-proved genuine map-degree theorem.

### B. Structural organization descriptors

Supported, with explicit limits.

For each positive structural depth that is already materialized by the v0.06 recursion engine, v0.08 may attach one aggregate descriptor that records:

```text
structural depth
source depth
nominal per-step multiplicity = scene.derived.sheetDegree
existing iteratedDegreeExpression
aggregateOnly = true
slotsEnumerated = false
sheetsMaterialized = false
geometryRendered = false
```

These are organizational descriptors only. They do not assert that the multiplicity metadata canonically enumerates geometric sheets, fibers, connected components, or covering branches.

### C. Concrete sheet objects

Not supported by current canonical knowledge.

The sealed formal handoff explicitly does not establish:

```text
deg(P_D) = D^4 as a genuine map-degree theorem
concrete D^4 sheets
covering-space structure
étale structure
torus / nonvanishing restrictions
W or a concrete hypersurface geometry
```

Therefore v0.08 does not create `D^4` concrete children, geometric sheets, fibers, branch components, or any geometry pretending to realize those concepts.

## Canonical decision

The strongest truthful implementation is:

```text
symbolic multiplicity
+
aggregate structural organization descriptors
```

not concrete sheet geometry.

The implementation intentionally creates **one descriptor per already-materialized positive structural depth**, not `D^4` descriptors per step.

This avoids two independent errors:

1. promoting numeric metadata into an unproved geometric claim;
2. treating `D^4` as an instruction to allocate a potentially large collection of objects.

## Role of `D^4`

`sheet-branch-organization.js` obtains its per-step value only from:

```text
scene.derived.sheetDegree
```

It does not read `parameters.D`, does not evaluate `D ** 4`, and does not use another degree source.

The model records:

```text
sheetDegreeSource = scene.derived.sheetDegree
sheetDegreeSemanticStatus = runtime_numeric_organizational_metadata
sheetDegreePerStep = scene.derived.sheetDegree
```

For the canonical `D = 2` scene, this value is `16`. For a validated `D = 3` scene, it is `81`.

These verifier examples establish runtime source-of-truth behavior only. They do not upgrade the value into a genuine covering-degree theorem.

## Per-step and iterated information are distinct

For each positive materialized depth `n`, the organization descriptor stores:

```text
nominalMultiplicity = sheetDegreePerStep
```

and reuses the recursive level's existing:

```text
iteratedDegreeExpression = {
  baseDegree: D^4,
  exponent: n
}
```

Thus the runtime retains a clear distinction between:

```text
per-step numeric metadata: D^4
iterated numeric expression: (D^4)^n
```

Neither is interpreted as an enumerated collection of concrete sheets.

No new arithmetic evaluation of `(D^4)^n` is introduced.

## Interaction with recursive levels

The v0.06 recursion engine remains the only materialization authority.

`sheet-branch-organization.js` consumes the current `recursiveModel.levels`. It never calls `expandOneLevel` and never creates its own recursive frontier.

Consequently:

- `materializedDepth = 0`: no positive-depth organization descriptor exists;
- `materializedDepth = 1`: exactly one aggregate descriptor exists;
- `materializedDepth = n > 1`: exactly `n` aggregate descriptors exist, one for each already-materialized positive depth.

The descriptor count follows structural depth, not `D^4`.

## Interaction with zoom semantics

The organization layer consumes the current verified v0.07 zoom model.

If `focusedDepth = 0`, the organization state reports:

```text
base_level_no_incoming_branch
```

because the base object has no incoming pullback transition.

If a positive focused depth is already materialized, the organization layer selects the corresponding existing aggregate descriptor.

If the requested focus is not materialized, the organization state reports:

```text
focus_not_materialized
focusedOrganization = null
materializationTriggered = false
```

The organization layer does not clamp the focus, expand recursion, alter `requestedDepth`, or modify the zoom model.

Therefore the v0.07 contract remains:

```text
zoom = structural focus / level navigation
zoom != recursive materialization
```

and v0.08 adds:

```text
organization view != recursive materialization
```

## Runtime model

The top-level organization model records:

```text
kind = sheet_branch_organization
descriptorMode = aggregate_structural_descriptors
sheetDegreeSource
sheetDegreeSemanticStatus
sheetDegreePerStep
requestedDepth
materializedDepth
requestedFocusDepth
focusedDepth
organizationStatus
organizationAvailable
levelOrganizations
focusedOrganization
slotsEnumerated = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometryRendered = false
materializationTriggered = false
```

Each positive-depth descriptor records:

```text
kind = aggregate_structural_branch_descriptor
depth
sourceDepth
nominalMultiplicity
sheetDegreeSource
iteratedDegreeExpression
aggregateOnly = true
slotsEnumerated = false
sheetsMaterialized = false
geometryRendered = false
```

The models are immutable.

## Architecture

### `scene-spec.js`

Unchanged. It remains the only source of `derived.sheetDegree`.

### `recursive-lazy-expansion.js`

Unchanged. It remains the only structural materialization engine.

### `zoom-semantics.js`

Unchanged. It remains a derived structural focus model and never expands recursion.

### `sheet-branch-organization.js`

New in v0.08. It has two responsibilities only:

1. derive aggregate structural organization metadata from the normalized scene, current recursive model, and current zoom model;
2. render that metadata into a DOM-like target.

It does not validate raw scenes again, compute `D^4`, expand recursion, create concrete sheet objects, or generate geometry.

### `app.js`

The initialization pipeline is:

```text
raw JSON
  -> SceneSpec.validateAndNormalizeScene
  -> BaseRenderer
  -> OneStepPullback
  -> RecursiveLazyExpansion
  -> ZoomSemantics
  -> SheetBranchOrganization
  -> visible validated scene metadata
```

Startup still focuses depth `0` and never calls `expandOneLevel`.

## Geometry and formal boundary

v0.08 preserves:

```text
W representation = unresolved
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
```

The milestone does not claim a genuine degree theorem, covering space, étale map, fiber geometry, torus restriction, Calabi–Yau geometry, or metric theorem.

No new Lean source or theorem is added. Reopening Formal Verification is not required for this structural-only contract.

A future milestone that wants genuine sheets, fibers, covering, or map-degree semantics must first establish a mathematically substantive claim and should then consider a separately scoped formal-verification reopening.

## Rendering boundary

The rendering surface remains ordinary DOM. v0.08 introduces no Canvas geometry, SVG geometry, Three.js, WebGL, GPU buffers, camera system, projection, viewport transform, mesh, or arithmetic/cyclotomic overlay.

## Verification contract

`verify_sheet_branch_organization_v0_08.js` verifies at least:

- `D = 2` reuses `scene.derived.sheetDegree = 16`;
- `D = 3` reuses `scene.derived.sheetDegree = 81`;
- the organization module contains no second `D` source and no `D^4` recomputation;
- materialized depths `0`, `1`, and `>1` produce only aggregate descriptors for already-existing positive levels;
- descriptor count follows `materializedDepth`, not `D^4`;
- existing iterated degree expressions are reused without being turned into concrete sheet counts;
- unavailable focus yields no focused organization and triggers no recursive expansion;
- explicit external recursion expansion can later be consumed by a newly derived organization model;
- `W = unresolved`, `geometryRendered = false`, `sheetsMaterialized = false`, and `coveringStructureClaimed = false` remain preserved;
- the new module does not introduce concrete geometry, sheet-object collections, Three.js, WebGL, camera/projection state, or overlays;
- application initialization remains validation-first and contains no `expandOneLevel` call.

All historical runtime verifiers must continue to pass. The v0.07 verifier changes only its exact version-metadata check so later repository versions do not falsely fail an unchanged zoom contract.

## Thread 07 stopping point

\[
\boxed{\text{D}^4\text{ is represented as aggregate runtime organization metadata, not concrete sheet geometry}}
\]

The next milestone is **Thread 08 — Arithmetic Overlays**. No Thread 08 implementation is included here.

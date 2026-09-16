# Self-Similar Calabi–Yau Visualizer

**Current version:** v0.08 — Sheet / Branch Organization Semantics

This repository is a minimal static HTML/CSS/vanilla-JavaScript application for the Self-Similar Calabi–Yau Visualizer. v0.08 adds verified **aggregate structural sheet/branch organization metadata** on top of the v0.07 structural zoom-focus model while preserving the v0.03–v0.07 runtime contracts and the sealed F01–F06 formal boundary.

## Canonical mathematical core

\[
X = W^{-1}(\lambda),
\]

\[
X_n = (P_D^n)^{-1}(X),
\]

\[
P_D(z_1,\ldots,z_4) = (z_1^D,\ldots,z_4^D).
\]

The scene is loaded from `data/system.json`, validated by `scene-spec.js`, passed through the base, one-step, recursive, and zoom layers, then consumed by `sheet-branch-organization.js` as derived structural organization state.

## Preserved canonical contracts

The v0.03 canonical mathematical inputs remain only `D`, `lambda`, and `kappa`. `requestedDepth` remains a request parameter. `P_D` still comes only from the structured `coordinate_power` declaration.

`scene-spec.js` remains the sole runtime source of the derived values:

```text
scene.derived.metricScale = D^2
scene.derived.sheetDegree = D^4
```

The concrete representation of `W` remains exactly:

```text
unresolved
```

Accordingly, the runtime still preserves:

```text
geometryRendered = false
sheetsMaterialized = false
```

The v0.06 recursion engine remains the only operation that can add structural levels, and v0.07 zoom remains structural focus/navigation only.

## v0.08 representability decision

The historical name “D^4 Sheets” is not interpreted as permission to create `D^4` genuine geometric sheets.

Under the current canonical and formal boundary, v0.08 supports:

```text
symbolic D^4 multiplicity metadata
+
aggregate structural organization descriptors
```

but not:

```text
D^4 concrete sheet objects
covering branches
fiber geometry
covering-space claims
étale claims
```

The reason is explicit: the sealed F01–F06 formal layer does not prove `deg(P_D)=D^4` as a genuine map-degree theorem and does not establish concrete sheets, covering structure, torus restrictions, or a resolved `W` geometry.

## `D^4` source of truth

`sheet-branch-organization.js` reads the per-step numeric metadata only from:

```text
scene.derived.sheetDegree
```

It does not read `parameters.D` and does not recompute `D ** 4`.

The organization model records:

```text
sheetDegreeSource = scene.derived.sheetDegree
sheetDegreeSemanticStatus = runtime_numeric_organizational_metadata
sheetDegreePerStep = D^4
```

For `D = 2`, the runtime value is `16`; for `D = 3`, it is `81`. These are verifier-backed runtime calculations, not newly formalized geometric degree claims.

## Aggregate organization, not sheet enumeration

For each already-materialized positive structural depth, v0.08 creates exactly one aggregate descriptor containing:

```text
depth
sourceDepth
nominalMultiplicity = sheetDegreePerStep
iteratedDegreeExpression
aggregateOnly = true
slotsEnumerated = false
sheetsMaterialized = false
geometryRendered = false
```

The descriptor count therefore follows `materializedDepth`, not `D^4`.

The existing recursive expression

```text
baseDegree = D^4
exponent = n
```

remains distinct from the per-step value. Neither expression is treated as a concrete number of geometric sheets.

## Interaction with zoom and recursion

The organization layer consumes the current recursive and zoom models. It does not control either one.

If focus is deeper than the current `materializedDepth`, the model returns:

```text
organizationStatus = focus_not_materialized
focusedOrganization = null
materializationTriggered = false
```

It does not call `expandOneLevel`, clamp focus, rewrite `requestedDepth`, or create another recursive frontier.

At base depth `0`, the model reports `base_level_no_incoming_branch`. At an already-materialized positive focus depth, it selects the corresponding existing aggregate descriptor.

## Formal verification boundary

Formal Verification F01–F06 remains sealed. v0.08 does not add or modify Lean theorem/source files.

A green CI run still means:

```text
sealed Lean formal core passes
+
runtime engineering contracts pass
```

It does not mean all visualizer mathematics is formally verified.

In particular, v0.08 does not claim:

```text
deg(P_D) = D^4 as a genuine map-degree theorem
concrete D^4 sheets
covering-space or étale structure
fiber geometry
W as a defined Lean hypersurface
Calabi–Yau geometry
P_D^* g_log = D^2 g_log
```

See `docs/FORMAL_HANDOFF_self_similar_cy_visualizer_v0_06.md` for the sealed claim boundary and `docs/SHEET_BRANCH_ORGANIZATION_self_similar_cy_visualizer_v0_08.md` for this milestone's representability audit.

## Rendering surface

The rendering surface remains ordinary DOM. v0.08 adds no Canvas/SVG geometry, Three.js, WebGL, GPU buffers, camera matrices, projection, physical viewport transforms, meshes, or arithmetic/cyclotomic overlays.

## Run locally

Serve the repository over HTTP rather than opening `index.html` with `file://`:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in a browser.

## Verify

```bash
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
node verify_zoom_semantics_v0_07.js
node verify_sheet_branch_organization_v0_08.js
node --check scene-spec.js
node --check base-renderer.js
node --check one-step-pullback.js
node --check recursive-lazy-expansion.js
node --check zoom-semantics.js
node --check sheet-branch-organization.js
node --check app.js
```

The v0.08 verifier covers the `D = 2` and `D = 3` source-of-truth cases, materialized depths `0`, `1`, and `>1`, available and unavailable focus states, reuse of the existing iterated-degree expression, strict separation from recursive materialization, preservation of unresolved geometry, and scope guards against concrete sheet/geometry implementations.

The historical v0.07 verifier keeps all zoom behavioral assertions. Only its exact version-metadata assertion is generalized to accept repository versions at or after v0.07.

## Scope of v0.08

This version implements **Thread 07 — D^4 Sheet / Branch Organization Semantics** only. It does not implement genuine sheets, covering spaces, fibers, arithmetic overlays, performance optimization, Three.js, WebGL, global fidelity audit, guided UX, or publication work.

The next milestone is **Thread 08 — Arithmetic Overlays**.

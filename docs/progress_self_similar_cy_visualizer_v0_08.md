# Progress — Self-Similar Calabi–Yau Visualizer v0.08

## Milestone

**Thread 07 — D^4 Sheet / Branch Organization Semantics**

Status: **implementation staged; CI seal pending**.

Full browser-engine runtime smoke testing remains explicitly `not_tested`.

## Canonical starting gate

Thread 07 began from exact `main` HEAD:

```text
970bafa06b0af0f68a302164fc63c0d5dc460687
zoom: add verified v0.07 structural focus semantics
```

with sole parent:

```text
8172da49ec363a958efdbad8e9b988a85cb417de
```

No newer competing commit was present when implementation began.

The latest v0.07 `Formal Verification` workflow run was `completed / success`, with both:

```text
formal-lean
runtime-contracts
```

successful.

## Representability audit

The canonical repository supports three increasingly strong interpretations:

### A. Symbolic multiplicity

Supported. `scene.derived.sheetDegree = D^4` is an exact validated runtime computation.

### B. Structural organization descriptors

Supported. The runtime may use `D^4` as aggregate organization metadata attached to already-materialized structural transitions, provided the descriptors are explicitly non-geometric.

### C. Concrete sheet objects

Not supported. The sealed formal handoff does not establish a genuine map-degree theorem, concrete sheets, covering-space structure, étale structure, torus restrictions, fibers, or a resolved `W` geometry.

Therefore v0.08 adopts **B**, with **A** as its numeric source, and rejects **C** as the canonical implementation for this milestone.

## Chosen contract

Created `sheet-branch-organization.js` as a small pure derived-model layer plus DOM renderer.

It consumes:

```text
validated normalized scene
current recursive model
current zoom/focus model
```

It derives:

```text
sheetDegreeSource = scene.derived.sheetDegree
sheetDegreeSemanticStatus = runtime_numeric_organizational_metadata
sheetDegreePerStep
requestedDepth
materializedDepth
requestedFocusDepth
focusedDepth
organizationStatus
levelOrganizations
focusedOrganization
slotsEnumerated = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometryRendered = false
materializationTriggered = false
```

Each positive materialized depth receives exactly one aggregate structural descriptor. The implementation does **not** allocate `D^4` child objects.

## Degree semantics

Per-step metadata and iterated metadata remain separate:

```text
per step: D^4 from scene.derived.sheetDegree
iterated: existing recursive { baseDegree: D^4, exponent: n }
```

The organization layer reuses these existing runtime fields and does not evaluate them as a concrete sheet count.

The module contains no second `parameters.D` source and no `D ** 4` calculation.

## Recursive and zoom boundaries

The organization module never calls `expandOneLevel`.

For unavailable focus:

```text
organizationStatus = focus_not_materialized
focusedOrganization = null
materializationTriggered = false
```

For base focus:

```text
organizationStatus = base_level_no_incoming_branch
```

For an available positive focus:

```text
organizationStatus = structural_organization_available
```

The module derives its view from current recursive/zoom state and does not mutate either model.

## Formal boundary

Formal Verification F01–F06 remains sealed.

v0.08 adds no Lean theorem and does not claim:

```text
deg(P_D)=D^4 as a genuine map-degree theorem
concrete D^4 sheets
covering-space structure
étale structure
fiber geometry
resolved W geometry
Calabi–Yau geometry
```

Accordingly:

```text
formalReopeningRequired = false
reopened_by_v0_08 = false
```

for this structural-only implementation.

## Files staged

Created:

- `sheet-branch-organization.js`
- `verify_sheet_branch_organization_v0_08.js`
- `docs/SHEET_BRANCH_ORGANIZATION_self_similar_cy_visualizer_v0_08.md`
- `docs/state_self_similar_cy_visualizer_v0_08.json`
- `docs/progress_self_similar_cy_visualizer_v0_08.md`

Modified:

- `README.md`
- `index.html`
- `app.js`
- `style.css`
- `data/system.json` only to advance runtime version metadata to `v0.08`
- `verify_zoom_semantics_v0_07.js` only to generalize its exact version-metadata assertion to accept versions at or after v0.07
- `.github/workflows/formal-verification.yml` to add the new runtime verifier and syntax check

Unchanged by design:

- `scene-spec.js`
- `base-renderer.js`
- `one-step-pullback.js`
- `recursive-lazy-expansion.js`
- `zoom-semantics.js`
- all sealed Lean theorem/source files

## Validation plan

The dedicated v0.08 verifier covers:

- `D = 2 -> sheetDegree = 16` source reuse;
- `D = 3 -> sheetDegree = 81` source reuse;
- no duplicated `D` lookup and no `D^4` recomputation;
- materialized depth `0`, `1`, and `>1`;
- focus at or below materialized depth;
- focus above materialized depth;
- explicit external recursive expansion followed by organization re-derivation;
- no organization-triggered recursion;
- no concrete sheets, covering claim, or geometry;
- no forbidden later rendering technologies.

The full runtime regression suite and JavaScript syntax checks are wired into the existing `runtime-contracts` job. The sealed `formal-lean` job remains unchanged.

## Validation status

### pending

- `verify_scene_spec_v0_03.js`
- `verify_base_renderer_v0_04.js`
- `verify_one_step_pullback_v0_05.js`
- `verify_recursive_lazy_expansion_v0_06.js`
- `verify_zoom_semantics_v0_07.js`
- `verify_sheet_branch_organization_v0_08.js`
- JavaScript syntax checks
- GitHub Actions `runtime-contracts`
- GitHub Actions `formal-lean`

### not_tested

- full browser-engine runtime smoke test with live network fetch and DOM observation

## Stopping point

The implementation is staged but must not be sealed until the complete CI evidence is observed and the state/progress files are updated from `pending_ci` to actual results.

The next milestone after a successful v0.08 seal is **Thread 08 — Arithmetic Overlays**. No Thread 08 implementation is included here.

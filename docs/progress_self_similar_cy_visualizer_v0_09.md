# Progress — Self-Similar Calabi–Yau Visualizer v0.09

## Milestone

**Thread 08 — Arithmetic Overlays**

Status: **completed and staging-CI verified**, with full browser-engine runtime smoke testing explicitly left `not_tested`.

## Canonical starting gate

Thread 08 began from exact `main` HEAD:

```text
e257c2d3b7e52c29f30a9a7c30503fddd5297a2e
sheets: add verified v0.08 branch organization semantics
```

with sole parent:

```text
970bafa06b0af0f68a302164fc63c0d5dc460687
```

No newer competing commit was present when implementation began. The latest canonical v0.08 `Formal Verification` workflow was `completed / success`, with both `formal-lean` and `runtime-contracts` successful.

## Evidence audit result

The five roadmap candidate families were audited before implementation.

Deferred because no exact canonical source artifact was available to this thread:

```text
cyclotomic refinement
torsion labels
collision classes
Delta_n / divisor marking
```

Implemented because exact sealed repository sources exist:

```text
coordinate-channel labels
```

The implemented family is split into two independently toggleable views:

```text
coordinate_channels
coordinate_iterate_rule
```

## Exact sources

`coordinate_channels` is backed by:

```text
formal/SelfSimilarCY/CoordinatePower.lean
blob dcfae8a3ed99544e50ee45aa12acde63e41090c8
```

which defines `Point4 := Fin 4 → ℂ`, `coordinatePower`, `coordinatePower_apply`, and `coordinatePower_unique`.

`coordinate_iterate_rule` is backed by:

```text
formal/SelfSimilarCY/CoordinatePowerIteration.lean
blob 4c78793d586e8ba822d4b326f09fd82dc07eaaf9
```

which proves `coordinatePower_iterate_apply` and `coordinatePower_iterate`.

Both belong to the F01–F06 formal line sealed at:

```text
ff5bcd2f134497c671b2368c372f59b5620a41ab
```

## Runtime implementation

Created `arithmetic-overlays.js` as a pure derived-model layer plus DOM renderer.

It consumes:

```text
validated normalized scene
current recursive model
current zoom/focus model
current sheet/branch organization model
runtime overlay request ids
```

It does not alter scene schema, validate raw input again, compute `D^2`, compute `D^4`, call `expandOneLevel`, mutate zoom, or modify sheet organization.

The two implemented overlays have different scopes:

```text
coordinate_channels       -> global_system_metadata
coordinate_iterate_rule   -> focused_level_metadata
```

The focused iterate overlay returns `not_materialized` if the requested focus is unavailable. It never expands recursion to satisfy the request.

## Provenance / evidence behavior

Each implemented descriptor contains exact source path, source version as Git blob SHA, formal seal commit, and evidence classification.

The verifier recomputes the Git blob SHA from the repository source text, so a stale provenance label fails deterministically.

Deferred candidates are registered only as unavailable audit entries:

```text
canonicalSource = null
sourceVersion = null
evidenceClass = unresolved_unavailable
```

No guessed arithmetic data is produced.

## Toggle behavior

The v0.09 contract supports and verifies:

```text
all disabled
one enabled
multiple independently enabled
disable after enable
deferred request
unsupported request
```

Overlay toggling is runtime/view state only and leaves recursive, zoom, and sheet/branch models unchanged.

## Geometry / formal boundary

Preserved:

```text
W representation = unresolved
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
```

No cyclotomic, torsion, collision, divisor, fiber, covering, or sheet geometry is fabricated.

No Lean source is modified. F01–F06 remains sealed and is not reopened by v0.09.

## Files

Created:

- `arithmetic-overlays.js`
- `verify_arithmetic_overlays_v0_09.js`
- `docs/ARITHMETIC_OVERLAYS_self_similar_cy_visualizer_v0_09.md`
- `docs/state_self_similar_cy_visualizer_v0_09.json`
- `docs/progress_self_similar_cy_visualizer_v0_09.md`

Modified:

- `README.md`
- `index.html`
- `app.js`
- `style.css`
- `data/system.json` only to advance project/runtime version metadata to `v0.09`
- `verify_sheet_branch_organization_v0_08.js` only to generalize its exact version-metadata assertion to accept versions at or after v0.08
- `.github/workflows/formal-verification.yml` to add the v0.09 verifier and syntax check

Unchanged by design:

- `scene-spec.js`
- `base-renderer.js`
- `one-step-pullback.js`
- `recursive-lazy-expansion.js`
- `zoom-semantics.js`
- `sheet-branch-organization.js`
- all sealed Lean theorem/source files

## Validation

Staging PR #2 executed the exact v0.09 executable tree at head `b84e6ef0c138b77be7ec957a5e899eebbfa7ea91` in workflow run `35068678136`. Both `runtime-contracts` and `formal-lean` completed successfully. The run executed:

```text
verify_scene_spec_v0_03.js
verify_base_renderer_v0_04.js
verify_one_step_pullback_v0_05.js
verify_recursive_lazy_expansion_v0_06.js
verify_zoom_semantics_v0_07.js
verify_sheet_branch_organization_v0_08.js
verify_arithmetic_overlays_v0_09.js
runtime JavaScript syntax checks
formal-lean sealed-core build/direct compiles/placeholder gate
```

All listed runtime verifier steps, JavaScript syntax checks, the sealed Lean build, three direct Lean module compiles, and the Lean placeholder gate passed. The later documentation-only sealing updates do not alter the executable runtime or sealed Lean sources.

Full browser-engine runtime smoke testing remains explicitly `not_tested` and is not a Thread 08 blocker.

## Stopping point after successful CI

\[
\boxed{\text{Arithmetic overlays are source-backed symbolic annotations with deterministic unavailable states}}
\]

The next milestone after canonical sealing is **Thread 09 — Performance and Infinite-Navigation Audit**. No Thread 09 work belongs here.

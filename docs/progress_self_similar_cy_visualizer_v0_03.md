# Progress — Self-Similar Calabi–Yau Visualizer v0.03

## Milestone

**Thread 02 — Mathematical Scene Specification**

Status: **completed**, subject only to the explicitly untested full browser-runtime smoke test recorded below.

## Starting-state audit

GitHub resolved `Akari-H-111/self-similar-calabi-yau-visualizer` as a private repository on default branch `main` with read/write/admin capability. The starting head was:

`3e7d5bb37db787257188552e9b182c927740d337` — `docs: align v0.02 validation state with final audit`

The repository canonical artifacts all described **v0.02 — Repository Bootstrap** and agreed that the mathematical scene schema was not yet closed. No Thread 01 work was repeated.

## Scene specification decisions

### Canonical mathematical inputs

- `D`
- `lambda`
- `kappa`

`D` is stored exactly once and must be an integer `>= 2`. `lambda` and `kappa` are finite numeric inputs in schema version 1.

### Request parameter

`initialDepth` was replaced by `request.requestedDepth`. Depth is not intrinsic to the mathematical system; it is a nonnegative-integer request for how much of the tower a later consumer should materialize.

### Coordinate-power map

`P_D` is represented structurally rather than as an arbitrary formula string:

- kind: `coordinate_power`
- coordinate count: `4`
- exponent parameter: `D`

The value of `D` is not duplicated in the map declaration.

### Base hypersurface

The scene records only the currently justified information:

- `X` is a `level_set`;
- defining function symbol is `W`;
- level parameter is `lambda`;
- concrete representation of `W` is `unresolved`.

No polynomial/expression AST was invented.

### Derived quantities

`D^2` and `D^4` are computed after validation and are not stored as independent canonical JSON inputs. For the canonical v0.03 example, `D = 2` gives:

- `D^2 = 4`
- `D^4 = 16`

## Implementation

Created:

- `scene-spec.js`
- `verify_scene_spec_v0_03.js`
- `docs/SCENE_SPEC_self_similar_cy_visualizer_v0_03.md`
- `docs/state_self_similar_cy_visualizer_v0_03.json`
- `docs/progress_self_similar_cy_visualizer_v0_03.md`

Modified:

- `data/system.json`
- `app.js`
- `index.html`
- `README.md`

Unchanged:

- `style.css`

`scene-spec.js` is deliberately pure validation/normalization logic. It is loaded by the browser before `app.js` and can also be imported by Node, allowing the verifier to test the exact same validator used by the app.

## Validation

### passed

- `data/system.json` parses as valid JSON.
- Schema version 1 required fields and exact keys are enforced.
- `D` integer/lower-bound constraints are enforced.
- `requestedDepth` nonnegative-integer constraints are enforced.
- Numeric finiteness of `lambda` and `kappa` is enforced.
- The structured `P_D` declaration is enforced.
- The unresolved `W` representation is enforced rather than guessed.
- Canonical example passes the browser-consumed validator.
- `D^2` and `D^4` are derived as `4` and `16` from `D = 2`.
- Thirteen malformed scene examples are rejected by the same validator used by `app.js`.
- `node --check scene-spec.js` passes.
- `node --check app.js` passes.
- `app.js` still performs a real `fetch("data/system.json")`.
- The fetched JSON is validated before any scene values are exposed in the data panel.
- A local static HTTP server successfully serves `index.html` and `data/system.json`.
- No renderer dependency or rendering surface was added.

### failed

- None.

### not_tested

- Full browser-runtime smoke test with a browser engine, including observing DOM state after successful validation and after a malformed-response simulation.

## Scope boundary respected

No Canvas, SVG renderer, Three.js, WebGL, base hypersurface drawing, pullback visualization, recursion, lazy expansion, zoom semantics, `D^4` sheet rendering, arithmetic overlay, camera state, GPU buffer, performance work, or publication work was implemented.

## Stopping point

\[
\boxed{\text{mathematical scene specification is explicitly defined and validated}}
\]

## Next milestone

**Thread 03 — Base Renderer**

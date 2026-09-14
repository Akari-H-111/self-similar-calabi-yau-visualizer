# Mathematical Scene Specification — v0.03

## Status

This document closes **Thread 02 — Mathematical Scene Specification**.

It defines the minimum validated data contract needed by later renderer milestones. It does not define rendering state, camera state, recursive node trees, GPU buffers, or any drawing API.

## Canonical core

The mathematical system remains

\[
X=W^{-1}(\lambda),
\qquad
X_n=(P_D^n)^{-1}(X),
\]

with

\[
P_D(z_1,\ldots,z_4)=(z_1^D,\ldots,z_4^D).
\]

The later identities

\[
P_D^*g_{\log}=D^2g_{\log},
\qquad
\deg(q_n)=D^4
\]

are represented in v0.03 only through derived quantities. They are not independent canonical inputs.

## Canonical JSON shape

`data/system.json` has five top-level fields:

- `schemaVersion`: compatibility version for this data contract;
- `project`: project identity;
- `version`: repository/project milestone version;
- `mathematics`: intrinsic mathematical scene data;
- `request`: consumer request parameters that do not change the underlying system.

Unknown fields are rejected in schema version 1. Any extension of the contract therefore requires an explicit schema decision rather than silent acceptance.

## Mathematical inputs

### `D`

`mathematics.parameters.D` is the canonical power exponent.

Constraints:

- integer;
- `D >= 2`, so the visualizer describes a nontrivial coordinate-power self-map rather than the identity or a degenerate constant map;
- the derived values `D^2` and `D^4` must remain safe JavaScript integers under the current Number-based implementation.

No separate copy of the degree is stored elsewhere.

### `lambda`

`mathematics.parameters.lambda` is the current level value in `X = W^{-1}(lambda)`.

Schema version 1 accepts finite JSON numbers only. A richer scalar encoding, including any future complex-number representation, is **unresolved** and must not be invented by this milestone.

### `kappa`

`mathematics.parameters.kappa` is retained as a canonical scalar parameter because it is already part of the project bootstrap inputs and Thread 02 explicitly requires it to be decided. Its mathematical/renderer semantics are not yet fixed by the canonical core supplied to this thread.

Schema version 1 therefore requires only that `kappa` be a finite JSON number. No derived quantity or rendering behavior may be inferred from it yet.

## Requested depth

The former bootstrap field `initialDepth` is replaced by `request.requestedDepth`.

This is deliberate: depth does not define the underlying mathematical system. It states how much of the tower a future consumer asks to materialize or display.

Constraints:

- integer;
- `requestedDepth >= 0`.

No recursive node tree is stored in v0.03.

## Structured representation of `P_D`

The map is not stored as an arbitrary source-code or formula string. Instead:

```json
{
  "kind": "coordinate_power",
  "coordinateCount": 4,
  "exponentParameter": "D"
}
```

This is enough to reconstruct

\[
(z_1,z_2,z_3,z_4)\mapsto(z_1^D,z_2^D,z_3^D,z_4^D)
\]

without duplicating the value of `D` or accepting arbitrary executable expressions.

Schema version 1 fixes `coordinateCount` to `4` and `exponentParameter` to `D` because those facts are part of the supplied canonical mathematical core.

## Base hypersurface and `W`

The available canonical information is only that

\[
X=W^{-1}(\lambda).
\]

There is not enough information in Thread 02 to define a trustworthy polynomial/expression AST for `W`. v0.03 therefore stores only:

```json
{
  "kind": "level_set",
  "definingFunction": {
    "symbol": "W",
    "representation": "unresolved"
  },
  "levelParameter": "lambda"
}
```

The validator rejects attempts to claim a concrete `W` representation under schema version 1. A later milestone may only resolve this after the mathematical source representation is explicitly specified.

## Derived quantities

The following are not persisted in `data/system.json`:

- metric scaling factor `D^2`;
- four-coordinate sheet degree `D^4`.

`scene-spec.js` computes them after the canonical inputs pass validation and exposes them in the normalized scene as:

```text
derived.metricScale = D^2
derived.sheetDegree = D^4
```

For the canonical v0.03 example with `D = 2`, these evaluate to `4` and `16`.

This avoids a duplicated source of truth and makes inconsistency between `D` and its powers impossible inside canonical JSON.

## Validation and rejection behavior

`scene-spec.js` is the browser-consumed validator. It checks:

- exact schema version;
- exact object keys for schema version 1;
- project identity;
- required fields;
- numeric finiteness;
- integer/range constraints;
- the structural identity of the coordinate-power map;
- the unresolved status of `W`;
- safe-integer exactness for derived `D^2` and `D^4`.

`app.js` fetches `data/system.json`, passes the parsed object to `SceneSpec.validateAndNormalizeScene`, and only displays scene data after validation succeeds. A malformed scene follows the visible error path and leaves the data panel hidden.

`verify_scene_spec_v0_03.js` imports the same validator used by the browser, accepts the canonical example, checks `D^2 = 4` and `D^4 = 16`, and rejects malformed examples covering missing fields, invalid types/ranges, unsupported schema versions, wrong map declarations, invented `W` representations, and unknown fields.

## Explicit unresolved items

The following remain unresolved by design:

- a concrete representation of `W`;
- complex-valued scalar encoding for `lambda` or `kappa`;
- any semantics of `kappa` beyond being a validated scalar input;
- base hypersurface geometry generation;
- rendering choices of any kind.

Resolving these requires later canonical mathematical or renderer requirements and must not be guessed here.

## Thread 02 stopping point

\[
\boxed{\text{mathematical scene specification is explicitly defined and validated}}
\]

The only next milestone is **Thread 03 — Base Renderer**.

# Thread 26 — Hybrid Structural / Geometric Navigation v0.01

## A0 read-only preflight result

Canonical parent: `a48664fb25ed5fe2a2b3ebcb0dfc217e3353df3c`, tree `00d88bdb116cb79bbad0a765ee7a8d51dd394b56`, sole parent `667c6d89b4b78fa08fa0f8de98c8e10a278a89e6`.

Thread 25 is canonical-sealed. Its exact hard cap remains 10,000 generated points, canonical geometric depth remains 1, depth 2 for the canonical 512-seed fixture remains rejected before materialization, and its truth flags remain `sheetsMaterialized=false`, `coveringStructureClaimed=false`, `geometricZoomApplied=false`.

The structural runtime exposes depth-level descriptors with independent requested/materialized/selected/focused/visible depth state. Structural selection identifies a structural level descriptor only. It does not identify a geometric point.

The geometric runtime exposes depth-indexed finite sampled geometric levels. Every geometric point carries `pointId`, `depth`, `parentId`, `ancestorSampleId`, `rootMultiIndex`, full coordinates, and projection metadata. `rootMultiIndex` is deterministic fiber-enumeration metadata only.

## Correspondence classes

### A — canonical mathematical correspondence

Supported: the shared tower-stage index `n`, the `X_n` stage label, and the coordinate-power stage governed by the same canonical `D` / `P_D` spine.

This correspondence is stage-level only. It does not create object identity between a structural node and a geometric point.

### B — deterministic implementation correspondence

Supported: reading the structural depth state from the existing interactive tower DOM contract and the geometric depth/source/projection state from the sealed Thread 25 runtime. Thread 26 may deterministically say that structural stage `n` and a materialized geometric view with source object `X_n` refer to the same tower stage.

No shared object identifier is created.

### C — presentation / UI-only correspondence

Supported: explicit user actions that navigate from a selected structural stage to an already materialized geometric stage of the same index, or select an already presentation-visible structural stage matching the current geometric depth.

These actions are navigation conveniences. They do not prove a cross-layer object map, do not trigger geometric generation, and are not geometric zoom.

### D — unsupported / forbidden correspondence

Thread 26 rejects or refuses to claim:

- structural node = geometric point;
- structural branch = root tuple;
- root tuple = sheet identity;
- structural organization multiplicity = covering sheet count;
- projected visual location = source-object identity;
- projected overlap = source self-intersection or covering multiplicity;
- selection/highlighting = geometric zoom;
- structural requested depth = geometric rendered depth.

## State model

The hybrid state keeps these domains separate:

- `representationMode`;
- structural requested/materialized/selected/focused/visible depth;
- geometric rendered depth and available materialized depths;
- selected structural level descriptor;
- optional selected geometric point metadata;
- geometric parent and ancestor X_0 provenance;
- projection view/projection rule;
- cross-layer correspondence classification;
- navigation provenance;
- protected truth flags.

The default representation mode is structural. Both underlying panels remain independently testable and rendered; Thread 26 marks one representation as the active navigation context rather than hiding or reinterpreting the other.

## Geometric point selection

A selected geometric mark may display:

- point ID;
- geometric depth;
- parent point ID;
- ancestor X_0 sample ID;
- root multi-index;
- projected-overlap count.

The UI must also state that there is no canonical structural object correspondence for that point.

## Depth independence

Changing structural depth does not change geometric rendered depth. Changing geometric depth does not change structural requested/materialized/selected depth. A cross-layer stage navigation occurs only through an explicit Thread 26 user action and only when the destination stage already exists in its own layer.

## Cap and materialization

Thread 26 does not call the geometric generation APIs. Representation switching, point selection, highlighting, structural expansion, and cross-layer stage navigation cannot bypass Thread 25's exact hard cap.

Canonical production remains:

- X_0 finite seed: 512 points;
- X_1 finite pullback: 8192 points;
- X_2 canonical full-seed request: 131072 points, rejected before generation;
- no partial fibers, no truncation, no random or fallback sampling.

## Truth boundary

Thread 26 preserves:

- `sheetsMaterialized=false`;
- `coveringStructureClaimed=false`;
- `geometricZoomApplied=false`.

Thread 25's admitted finite sampled geometry remains geometry, but Thread 26 does not promote that finite view to complete `X_n`, covering geometry, sheet materialization, or true geometric zoom.

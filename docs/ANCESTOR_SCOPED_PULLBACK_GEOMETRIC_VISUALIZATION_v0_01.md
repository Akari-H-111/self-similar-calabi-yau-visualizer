# Thread 30 — Ancestor-Scoped Geometric Visualization v0.01

## 0. Purpose

Thread 30 exposes the canonical Thread 29 ancestor-scoped runtime as a truthful browser-visible geometric panel.

Canonical parent:

```text
Thread 29 canonical seal
commit  3944d6d18ae0a0d7b55b6e1e9fe8a7653c21b37a
tree    705944b76b5c78aeb355b3029f945e2a55652399
parent  4fc98bd99af93aa7f5fdb1a7dd522040aa1e81a7
```

Thread 29 is `canonical_sealed`. Thread 30 does not change the pullback engine, projection, geometric renderer, or Thread 26 hybrid state machine.

## 1. Reuse architecture

Thread 30 reuses:

- Thread 24 deterministic admitted `X_0` sample model;
- Thread 29 `AncestorScopedPullbackRuntime`;
- Thread 25 `GeometricPullbackRenderer.createProjectedLevel`;
- Thread 25 `GeometricPullbackRenderer.renderProjectedLevel`;
- Thread 23 projection `(Re(z1), Im(z1))`.

No second root enumerator, pullback engine, projection, or SVG renderer is introduced.

## 2. Explicit generation rule

The scoped panel is idle after page load.

Changing the ancestor selector or depth selector does not generate recursive geometry. A user must activate the explicit **Render selected scope** action.

This prevents hidden scoped generation and keeps the existing global Thread 24/25 browser path unchanged.

## 3. Visible scope semantics

The panel visibly reports:

- selected canonical `X_0` ancestor ID;
- requested scoped depth;
- exact target count;
- scope-complete status;
- current rendered point count;
- representative/click-selected point provenance:
  - source point ID;
  - ancestor `X_0` sample ID;
  - declared parent ID;
  - root multi-index;
  - projected overlap count.

The status and boundary text state that the result is the complete recursive pullback of the selected finite ancestor scope through the requested depth, not complete global `X_n`.

## 4. Bounded canonical behavior

For canonical `D=2` and cap `10000`, one selected ancestor renders:

```text
depth 0 = 1
depth 1 = 16
depth 2 = 256
depth 3 = 4096
depth 4 = 65536 -> rejected before recursive generation
```

On an over-cap request, the scoped visualization is cleared and displays zero marks. No previous lower-depth marks are left behind as if they satisfied the rejected request.

## 5. Projection and overlap semantics

Thread 30 inherits the sealed Thread 23/25 `z_1` projection:

```text
z -> (Re(z1), Im(z1))
```

The renderer's `projectedPullbackPointOverlapCount` remains presentation metadata only.

Projected overlap does not establish:

- source self-intersection;
- covering multiplicity;
- sheet identity;
- connected-component identity.

## 6. Independence from global and hybrid state

Thread 30 does not mutate:

- `Thread25GeometricPullbackState`;
- structural requested/materialized depth;
- Thread 26 representation mode;
- Thread 26 stage correspondence.

The scoped section is intentionally not a `data-hybrid-panel`. Thread 31 owns any later explicit global/scoped hybrid bridge.

## 7. Truth boundary

Thread 30 may truthfully claim:

- finite geometric marks are rendered;
- complete recursive pullback is rendered over the selected admitted finite ancestor scope through an admitted depth;
- parent/ancestor/root/projection provenance is carried.

It must not claim:

- complete global `X_n`;
- genuine sheets;
- covering charts;
- analytic branch continuation;
- connected-component decomposition;
- source self-intersection from projected overlap;
- geometric zoom.

## 8. Exit verification

Thread 30 implementation candidate closes only after machine and browser verification demonstrate:

1. Thread 29 is canonical sealed;
2. the existing renderer and projection are reused byte-for-byte;
3. scoped depth 0/1/2/3 render 1/16/256/4096 marks;
4. marks retain ancestor, parent, root-index and overlap metadata;
5. control changes alone do not generate recursive geometry;
6. depth 4 produces an explicit exact over-cap refusal with zero partial marks;
7. global Thread 25 remains at its independent canonical 512/8192 path;
8. no hybrid state is implicitly changed;
9. PR-head CI, exact-main CI and Pages all succeed.

A later canonical seal is metadata-only.

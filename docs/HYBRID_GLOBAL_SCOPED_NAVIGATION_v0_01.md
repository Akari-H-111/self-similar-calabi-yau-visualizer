# Thread 31 — Hybrid Navigation II: Global / Scoped Geometry Bridge v0.01

## 0. Purpose

Thread 31 adds an explicit presentation bridge among:

- the global structural context;
- the global finite sampled geometric context;
- the ancestor-scoped finite geometric context.

Canonical parent:

```text
Thread 30 canonical seal
commit  1a5826de73d775ad818305d2b1f57c4c58d053de
tree    e6545c6d1f2b72cdb0409b1549db02bb03ed3f18
parent  d926283506a0e65dabb89be16e20882d66311b48
```

Thread 30 is `canonical_sealed`.

## 1. Additive bridge architecture

Thread 31 does not modify the sealed Thread 26 navigation semantics/runtime/config and does not modify the sealed Thread 30 scoped generation/runtime semantics.

Instead it adds a wrapper state machine with three presentation contexts:

```text
structural
global-geometric
scoped-geometric
```

The bridge reads the already-materialized Thread 26 and Thread 30 states and adds explicit context selection/highlighting only.

## 2. Depth independence

The bridge records six independent depth values when available:

- structural requested depth;
- structural materialized depth;
- structural selected depth;
- global geometric rendered depth;
- scoped requested depth control;
- scoped materialized depth, or none.

No context switch synchronizes any of them.

Switching to:

- `structural` invokes only the sealed Thread 26 structural presentation mode;
- `global-geometric` invokes only the sealed Thread 26 geometric presentation mode;
- `scoped-geometric` changes only Thread 31 presentation focus and scroll location.

Entering scoped context does not activate the Thread 30 render action.

## 3. Scoped generation boundary

The only legal scoped generation path remains Thread 30's explicit **Render selected scope** action.

Thread 31:

- does not call `AncestorScopedPullbackRuntime.materializeScopedScene`;
- does not call Thread 25 generation APIs;
- does not click `#ancestor-scoped-pullback-render`;
- does not synthesize or truncate scoped levels.

A user may enter the scoped presentation context while no scoped geometry is materialized.

## 4. Correspondence classes

Thread 31 preserves the existing A/B/C/D model.

### Class A / Class D stage support

Canonical mathematical correspondence remains limited to admitted tower-stage identity where Thread 26 already supports it.

Thread 31 does not assign Class A independently. It inherits the current Thread 26 selected-stage verdict:

- if the selected structural depth is among the materialized global geometric stages, the stage correspondence is Class A;
- if that global geometric stage is not materialized, the stage correspondence is Class D.

For example, structural selected depth 2 with global geometric availability [0, 1] is Class D even though the abstract tower index X_2 exists structurally.

### Class B

The selected scoped ancestor id is deterministic implementation provenance into the canonical Thread 24 finite sample model.

This does not mean:

- structural node = selected ancestor;
- selected ancestor = connected component;
- root tuple = sheet.

### Class C

The three-context selector, panel focus, scrolling, highlighting and back-navigation are presentation-only.

### Class D

Still forbidden:

- structural node = geometric point;
- structural branch = root tuple;
- selected ancestor = connected component;
- root tuple = sheet;
- projected location = source-object identity.

## 5. Back-navigation

Thread 31 must support explicit sequences such as:

```text
structural -> global-geometric -> scoped-geometric -> global-geometric -> structural
```

and preserve every independently controlled depth except when the user separately operates that depth's own sealed control.

## 6. Truth boundary

Thread 31 does not claim or create:

- complete global hypersurface geometry;
- sheets;
- covering charts;
- analytic branches;
- connected components;
- source self-intersection from projected overlap;
- geometric zoom.

## 7. Exit verification

Thread 31 closes only after machine and Chromium verification show:

1. Thread 30 is canonical sealed;
2. Thread 26 and Thread 30 protected authority blobs remain byte-identical;
3. three contexts are explicit and deterministic;
4. entering scoped context before a render leaves scoped geometry unmaterialized;
5. scoped selector changes remain independent and do not generate;
6. an explicit Thread 30 render may materialize scoped geometry while global and structural depths remain unchanged;
7. later structural/global depth changes do not mutate scoped materialized depth;
8. back-navigation preserves the three independent depth domains;
9. no forbidden identity or truth flag is promoted;
10. PR-head CI, exact-main CI and Pages all succeed.

A later seal changes metadata only.

## Canonical closure

The Thread 31 implementation was merged as `ce1317c3cc32fc7d8a3b9e4795949bea6680df96`, followed by the Class D repair `fde4f05270dbe3d5620dfe5b6cc630cc0f51deff` and its metadata-only seal `4aa6062d16e3340ed94248d65f2dd46ba626d973`. PR #46 was closed unmerged after the regression was found. The repair's PR-head run `35452523086` and exact-main run `35455412304` succeeded; the repair-seal exact-main run `35455874878` and Pages run `35455874404` also succeeded. This Thread 31 seal updates status metadata only. The selected-stage classification continues to delegate to Thread 26, including Class D when the corresponding global geometric stage is unavailable.

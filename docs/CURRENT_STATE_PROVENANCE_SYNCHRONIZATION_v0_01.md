# Thread 27R — Current-State Geometry / Structural Provenance Synchronization v0.01

## Purpose

Thread 27R repairs the post-Thread-26 public provenance surface discovered by the Thread 27 read-only audit. It does not add geometry, change a mathematical theorem, alter the projection contract, or create a new generation path.

The canonical parent is:

```text
commit 2c33f20a508540c3f31ba2d058f3181cc173ef2e
tree   59b45cc5659fcc7596aedaeb62af7206d6592012
parent 410d421f9dd8af8d2c398c3650f1cd66b56d3463
```

## Audit finding

Threads 24–26 establish a separate admitted geometric pipeline whose geometric surfaces report:

```text
geometryRendered = true
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
```

The legacy structural pipeline deliberately remains on `data/system.json` schema v1 with `W.representation = unresolved`. Thread 22 separately introduced `data/system.v2.json` with the admitted builtin formula `W_kappa_torus4_v1`.

The defect was not this dual-schema design. The defect was public wording that promoted the schema-v1 structural state to a repository-global present-tense claim after finite sampled geometry had been admitted.

The publication smoke test reinforced the drift by requiring the stale sentence while also requiring Thread 24–26 geometric artifacts.

## Repair rule

The repaired public contract is:

```text
legacy structural pipeline state
!=
current repository-global geometry state
```

and:

```text
finite sampled geometry rendered
!=
complete/global hypersurface rendered
!=
sheets materialized
!=
covering structure claimed
!=
geometric zoom
```

The historical v1.0-rc1 structural-only statements remain valid as historical release provenance. They are rewritten only to make their checkpoint scope explicit.

## Current authority split

### Legacy structural context

```text
data/system.json
schemaVersion = 1
W representation = unresolved
structural presentation only
```

This context continues to drive the sealed structural runtime and exposition layer.

### Admitted geometric context

```text
data/system.v2.json
schemaVersion = 2
formulaId = W_kappa_torus4_v1
Thread 24 = finite sampled X_0 projection
Thread 25 = finite sampled X_1 pullback
Thread 26 = explicit same-stage hybrid navigation
```

The geometric panels are finite sampled views. They do not claim completeness of `X_0` or `X_n`.

## Materialization and hybrid boundaries

Thread 27R preserves without modification:

```text
maxGeneratedPoints = 10000
X_0 = 512
X_1 = 8192
full canonical X_2 request = 131072
beyondCap = reject_without_partial_materialization
hybrid runtime calls geometric generation API = false
```

It also preserves the Thread 26 A/B/C/D correspondence classification. In particular, no structural node becomes a geometric point, no root tuple becomes a sheet identity, projection overlap remains projection metadata, and navigation remains distinct from geometric zoom.

## Matrix-status hygiene

The audit observed:

```text
Thread 22 matrix: AUTHORING CANDIDATE
Thread 23 matrix: IMPLEMENTED_CONTRACT_CANDIDATE
Thread 24 matrix: no explicit status field
Thread 25 matrix: canonical_sealed
Thread 26 matrix: canonical_sealed
```

Thread 27R does **not** retroactively rewrite the Thread 22–24 artifact-local fields. Those values describe the phase in which the individual artifact was authored. Their later canonical adoption is established by merged lineage, downstream consumption, exact-main CI, and the sealed Thread 25/26 chain. Rewriting them now would blur provenance rather than improve it.

The new Thread 27R matrix records that interpretation explicitly.

## Files intentionally changed

```text
index.html
README.md
.github/workflows/formal-verification.yml
docs/CURRENT_STATE_PROVENANCE_SYNCHRONIZATION_v0_01.md
docs/current_state_provenance_synchronization_matrix_v0_01.json
verify_current_state_provenance_sync_v0_01.js
```

## Production files intentionally protected

No changes are permitted in this repair to the concrete schema, projection semantics, sampler, geometric engines/runtimes, hybrid semantics/runtime, app runtime, or formal geometry core. The verifier binds representative protected files to the exact Thread 26 parent blobs.

## Verification obligations

The Thread 27R verifier checks:

1. schema-v1 `W` remains unresolved;
2. schema-v2 `W_kappa_torus4_v1` remains admitted;
3. Thread 24/25 geometric truth flags remain true only for finite sampled geometry;
4. sheet/covering/geometric-zoom flags remain false;
5. the 10,000-point cap and 512/8192/131072 cardinalities remain unchanged;
6. the hybrid runtime remains generation-free;
7. current public wording distinguishes structural and geometric contexts;
8. the stale global sentence is absent;
9. historical v1.0-rc1 provenance remains explicitly labeled historical;
10. CI itself contains the new anti-regression assertions;
11. protected runtime/formal blobs remain exact.

## Exit verdict

A green candidate establishes only that the post-hybrid provenance surface is synchronized with the already-admitted Threads 22–26 semantics.

It does not authorize sheet tracking, covering animation, continuous geometric navigation, geometric zoom, complete `X_2` materialization, or any new representation.

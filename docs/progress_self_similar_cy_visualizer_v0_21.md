# Progress — Thread 20 Mathematical / Visual Fidelity Audit II v0.21

## Starting gate

```text
main   = 874a80f7702f85996eb893690cc34e7d8869161c
tree   = d818e6a0c9aa04711fefc8f298140a0676c29f7a
Formal Verification #121 / 35329509282 = success
Pages #9 / 35329508086 = success
PR #13 = closed, merged=false
open PR = 0
v0.13 immutable = true
```

Gate 0 passed before the staging branch was created.

## Staging

```text
branch = thread20-mathematical-visual-fidelity-audit-ii-v0-21
PR #14 = draft
role = CI VEHICLE ONLY / DO NOT MERGE
```

The branch was created from the exact starting canonical commit.

## Implemented provenance work

Added:

```text
docs/visual_provenance_matrix_self_similar_cy_visualizer_v0_21.json
visual-provenance.js
verify_mathematical_visual_fidelity_v0_21.js
docs/MATHEMATICAL_VISUAL_FIDELITY_AUDIT_II_self_similar_cy_visualizer_v0_21.md
docs/state_self_similar_cy_visualizer_v0_21.json
docs/progress_self_similar_cy_visualizer_v0_21.md
```

The matrix is the durable source/non-claim ledger for admitted visual classes.

## Demonstrated repairs

### MVF-01 — visible version drift

The public eyebrow previously remained at v0.20 even though the canonical repository had sealed v0.20.1.

Thread 20 updates the page to the v0.21 Mathematical / Visual Fidelity Audit II label.

### MVF-02 — requested frontier provenance asymmetry

The sealed renderer exposes `requested_frontier_reached` in its model but emits the final requested frontier as ordinary text rather than a machine-readable frontier group.

The renderer is byte-pinned by older verifiers and is intentionally unchanged.

`visual-provenance.js` adds the missing presentation metadata after render:

```text
data-frontier-status=requested_frontier_reached
data-visual-provenance-id=frontier_requested_reached
data-evidence-class=engineering
```

### MVF-03 — centralized provenance coverage

Thread 20 adds a machine-readable provenance matrix covering structural nodes/edges/rules, D²/D⁴, D⁴ badges, arithmetic overlays, deferred candidates, virtualization/frontiers, interaction state, camera state, and W status.

## Sealed-source preservation

The v0.21 verifier pins the historical blobs for the sealed runtime/semantic/formal sources.

In particular:

```text
structural-visualization.js remains byte-identical
app.js remains byte-identical
infinite-navigation-renderer.js remains byte-identical
formal/* remains byte-identical
```

This keeps the v0.20 and v0.20.1 historical verifier contracts intact.

## Truth boundary

Still invariant:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

No geometry admission or new theorem is introduced.

## HIA preservation

Because `app.js` and `infinite-navigation-renderer.js` remain unchanged, Thread 20 does not rewrite the HIA-01 Reset-camera focus repair or the HIA-02 collapse/reveal repair.

HIA-03 remains intentionally unchanged pending direct screen-reader evidence.

## Remaining gates

```text
wire v0.21 verifier into workflow
update README / publication smoke
run staging CI
inspect failures as regressions first
optional narrow Chromium spot check if reliable execution is available
freeze final staging tree
close PR #14 unmerged
recheck main = 874a80f7702f85996eb893690cc34e7d8869161c
exact-tree replay as one child of that commit
fast-forward main
exact-main Formal Verification
exact-SHA Pages
final canonical identity audit
```

This progress artifact does not self-certify Thread 20.

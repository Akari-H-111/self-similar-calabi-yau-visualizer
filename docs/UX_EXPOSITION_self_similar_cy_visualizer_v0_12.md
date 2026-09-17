# UX / Exposition Layer — Self-Similar Calabi–Yau Visualizer v0.12

## UX problem statement

Thread 10 and Thread 10R established that the live repository is mathematically claim-disciplined, but the v0.11 page still exposes that truth mainly through engineering-oriented status blocks. A new reader must assemble several separate messages before understanding the current depth state, what D² and D⁴ mean, which facts are Lean-formalized, and which geometric objects do not exist in the current implementation.

Thread 11 therefore changes exposition, not mathematics:

```text
make existing semantics understandable
!=
invent stronger mathematics
```

The primary problems addressed are:

- no first-screen current-state summary;
- requested, materialized, and focused depth are not grouped for comparison;
- evidence classes are documented in README but not visible as a stable interface vocabulary;
- W/geometry/sheet/covering nonclaims are distributed across diagnostic messages;
- low-level diagnostics dominate the visual hierarchy;
- multiple diagnostic regions used live-status semantics even though they are not all important announcements.

## Terminology system

The v0.12 exposition vocabulary is:

| UI category | Meaning |
| --- | --- |
| Lean formalized | A definition or theorem is present in the sealed Lean core. |
| Runtime metadata | A value is validated or derived by the JavaScript runtime; theorem status does not follow. |
| Structural | Relations, depths, or organization are represented without realizing the geometry. |
| Symbolic | An expression or annotation is retained symbolically instead of expanded into geometric objects. |
| Unresolved | The current repository intentionally has no concrete representation or established result for the item. |
| Not materialized | A possible referent is not instantiated as sheets, fibers, covering geometry, or other concrete objects. |
| Engineering | An implementation, representation-safety, CI, or performance statement rather than a mathematical theorem. |

The vocabulary intentionally avoids a generic `verified` badge. Where verification is discussed, the interface distinguishes Lean formalization, runtime contracts, and engineering/CI evidence.

## Information architecture

The page now has four exposition layers before implementation diagnostics:

1. **Current state** — focused/materialized/requested depth, D, D², D⁴, structural status, geometry status, scoped formal status, navigation status, and W representation.
2. **How to read the interface** — the semantic legend above.
3. **What is established here?** — grouped provenance for Lean-formalized, runtime/structural, and unresolved/not-materialized content.
4. **Canonical structure** — project notation retained with an adjacent scope note explaining that W and Calabi–Yau geometry are not part of the sealed Lean model.

The previous runtime sections remain available under **Implementation diagnostics**. They are deliberately secondary rather than deleted, because they remain useful for engineering inspection and regression debugging.

No tooltip-only architecture is introduced. Important distinctions are visible as text and do not require hover.

## Exposition/source boundaries

`exposition-layer.js` is not a mathematical source of truth. It consumes already-validated models and is forbidden from recomputing D², D⁴, recursive expansion, sheet materialization, or geometric state.

Its current-state values come from:

```text
D                         <- scene.mathematics.parameters.D
D² runtime metadata       <- scene.derived.metricScale
D⁴ organization metadata  <- scene.derived.sheetDegree
requested/materialized     <- recursive model
focused depth              <- zoom model
geometry flags             <- existing runtime models
sheet/covering flags       <- existing organization model
W representation           <- validated scene
```

The v0.11 mathematical/runtime engine files remain byte-for-byte sealed by the v0.12 verifier:

```text
scene-spec.js
base-renderer.js
one-step-pullback.js
recursive-lazy-expansion.js
zoom-semantics.js
sheet-branch-organization.js
arithmetic-overlays.js
```

The exposition layer does not use parent-project memory as evidence. Cyclotomic, torsion, collision, and related parent-project overlays remain deferred unless exact canonical source evidence becomes available.

## Accessibility choices

Thread 11 makes the following presentation/accessibility changes:

- preserves semantic `main`, `header`, `section`, heading, list, definition-list, `details`, and `summary` elements;
- uses one concise ARIA live status region for load/error state instead of making every diagnostic output a live announcement;
- keeps important semantic categories in visible text so color is never the only carrier;
- provides visible keyboard focus styling for disclosure summaries;
- keeps diagnostics available through native keyboard-accessible disclosure widgets;
- provides a single-column narrow-viewport layout for state, legend, provenance, and scene-data grids;
- adds a reduced-motion media rule even though v0.12 introduces no animation;
- avoids hover-only title tooltips for core exposition;
- keeps mathematical symbols next to human-readable status explanations.

This is a static/contract-level accessibility audit. No claim is made that a full assistive-technology matrix or real-browser accessibility certification has been completed.

## Mathematical nonclaims

v0.12 does not claim:

```text
that the whole visualizer is formally verified
that D² is a proved metric-scaling theorem
that D⁴ is a proved map degree
that (D⁴)^n is a proved iterated map degree
that W is implemented or formalized
that a Calabi–Yau hypersurface is rendered
that genuine sheets, fibers, covering geometry, or étale structure are materialized
that structural focus is geometric zoom
that a camera transform is applied
that finite navigation renders literal infinity
that JavaScript safe-integer limits are mathematical limits
that benchmark horizons are mathematical bounds
that unavailable parent-project arithmetic has been reconstructed
```

The sealed Lean scope remains limited to the coordinate-power map, its iteration law, and the abstract set-theoretic pullback tower and closed form already present in the repository.

## Verifier scope

`verify_ux_exposition_v0_12.js` verifies semantic contracts rather than typography. It checks:

- the seven required exposition categories exist;
- current-state values reuse upstream runtime values;
- D² and D⁴ remain runtime categories;
- W and geometry remain unresolved;
- sheets and covering remain unmaterialized/unclaimed;
- zoom remains non-geometric and non-materializing;
- the v0.11 mathematical/runtime engine blobs remain unchanged;
- `exposition-layer.js` does not recompute D²/D⁴ or invoke recursive materialization;
- required semantic DOM hooks and visible category markers exist;
- only the concise loader/error surface is an ARIA live status region;
- keyboard-focus, narrow-viewport, and reduced-motion CSS hooks exist;
- the workflow runs v0.03 through v0.12 plus the existing Lean gate.

The verifier does not claim to mathematically prove UX clarity or accessibility. It checks repository contracts that support those goals.

## Changed files

The intended Thread 11 staging scope is limited to exposition, documentation, verification, and CI wiring:

```text
README.md
index.html
app.js
style.css
data/system.json
exposition-layer.js
verify_mathematical_fidelity_v0_11.js
verify_ux_exposition_v0_12.js
.github/workflows/formal-verification.yml
docs/UX_EXPOSITION_self_similar_cy_visualizer_v0_12.md
docs/state_self_similar_cy_visualizer_v0_12.json
docs/progress_self_similar_cy_visualizer_v0_12.md
```

No `formal/` source and no sealed runtime math/organization engine is intended to change.

## Residual risks

Thread 11 carries forward the Thread 10R residuals rather than treating them as bugs:

1. GitHub code-search indexing is not relied upon as proof of absence.
2. GitHub repository surfaces do not provide a branch reflog proving that a ref was never force-updated historically.
3. Legacy identifiers and historical terminology remain in earlier runtime/history artifacts and can still be misread outside the current exposition context.
4. Exact parent-project canonical sources remain unavailable to this visualizer thread, so no new parent theorem is promoted.
5. Real-browser long-session performance remains outside the sealed evidence unless separately measured.
6. Static accessibility contracts do not replace real browser, screen-reader, or user testing.

## Canonicalization policy

Thread 11 follows the established staging-only workflow. The staging branch may contain multiple work commits and a pull request used only as a CI vehicle. That pull request must remain unmerged.

If staging is fully green, the final verified tree is to be replayed as exactly one canonical child commit whose sole parent is:

```text
b77a688fed8cbc41e105900d38177e75219825d1
```

The exact-SHA canonical push CI is external sealing evidence and is not written back through a second main commit.

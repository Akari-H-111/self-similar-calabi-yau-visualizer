# Progress — Self-Similar Calabi–Yau Visualizer v0.12

## Milestone

**Thread 11 — UX / Exposition Layer**

Thread 11 starts from the exact sealed Thread 10 commit:

```text
main = b77a688fed8cbc41e105900d38177e75219825d1
message = audit: seal v0.11 mathematical fidelity
sole parent = 7f43dc1b1445e0ded12e1ea185f75230bc68cded
tree = 80e807f4d6ed868ceef9270b1d37cc0c1dbe5ed4
```

Canonical starting workflow:

```text
run = 35195693622
event = push
head_branch = main
head_sha = b77a688fed8cbc41e105900d38177e75219825d1
status = completed
conclusion = success
runtime-contracts = completed / success
formal-lean = completed / success
```

The start gate passed before implementation began.

## UX audit result

The v0.11 interface was already mathematically claim-disciplined. Its main UX weakness was that the evidence boundaries were distributed across sequential engineering-oriented status blocks.

Before v0.12, a new reader had to infer or search for:

```text
focused vs materialized vs requested depth
D² and D⁴ evidence status
what Lean actually proves
whether geometry is rendered
whether sheets/covering are materialized
whether zoom is geometric
whether W is resolved
```

The existing page also exposed several diagnostic outputs as ARIA live status regions, which was unnecessary for static inspection text.

No mathematical engine defect was found by the UX audit.

## Chosen architecture

The minimal coherent design is an exposition-only layer:

```text
validated scene + existing verified runtime models
                     |
                     v
             exposition-layer.js
                     |
                     v
current state + semantic legend + provenance/boundary explanation
```

The exposition module does not recompute canonical values and does not create a parallel mathematical model.

It reads:

```text
scene.derived.metricScale
scene.derived.sheetDegree
recursive requested/materialized depth
zoom focused depth and non-geometric flags
sheet/branch non-materialization and non-covering flags
W representation
```

The sealed runtime engine remains unchanged.

## Information hierarchy change

### Before

```text
header
canonical formulas
base renderer diagnostic
one-step diagnostic
recursive diagnostic
zoom diagnostic
sheet/branch diagnostic
overlay diagnostic
scene specification
```

### After

```text
header + explicit geometry boundary
current-state summary
semantic legend
formal/runtime/unresolved provenance panel
qualified canonical formulas
implementation diagnostics disclosure
```

The low-level diagnostics are preserved rather than deleted, but are no longer the primary explanation surface.

## Terminology policy

The stable user-facing vocabulary is:

```text
Lean formalized
Runtime metadata
Structural
Symbolic
Unresolved
Not materialized
Engineering
```

The UI does not use a generic `verified` badge that could blur Lean proof, runtime verification, and CI success.

D² remains:

```text
runtime metadata
not a sealed metric theorem
```

D⁴ remains:

```text
organization metadata
not a sealed map-degree theorem
```

Structural focus remains finite navigation metadata rather than geometric zoom.

## Mathematical fidelity preserved

Thread 11 does not modify:

```text
scene-spec.js
base-renderer.js
one-step-pullback.js
recursive-lazy-expansion.js
zoom-semantics.js
sheet-branch-organization.js
arithmetic-overlays.js
formal/
```

The v0.12 verifier pins the seven runtime engine blob SHAs from v0.11 so accidental drift fails deterministically.

The required truthfulness state remains:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
cameraTransformApplied = false
materializationTriggered = false
```

## Accessibility changes

The page keeps semantic headings and native disclosure controls, consolidates live announcements to one concise status region, adds visible focus treatment for disclosure summaries, provides single-column narrow-viewport layouts, retains visible text labels in addition to any visual styling, and adds a reduced-motion rule.

No animation is introduced.

Real browser assistive-technology testing remains `not_tested`; the current audit is source/contract-level.

## Verifier design

Thread 11 introduces:

```text
verify_ux_exposition_v0_12.js
```

The verifier is deliberately semantic rather than prose-exact. It checks category markers, runtime/UI truthfulness agreement, source reuse, absence of a second computation/materialization engine, the unchanged v0.11 engine blobs, required DOM hooks, accessibility hooks, workflow coverage, and documentation boundaries.

It does not attempt to prove subjective UX quality or mathematics through JavaScript.

The v0.11 fidelity verifier receives only forward-version / semantic wording compatibility adjustments required to run the existing claim-discipline assertions against v0.12. The mathematical boundary assertions remain in place.

## Staging CI history

Staging-only PR:

```text
PR #4
DO NOT MERGE — Thread 11 v0.12 UX / Exposition staging CI
base = main @ b77a688fed8cbc41e105900d38177e75219825d1
head = thread11-ux-exposition-v0-12
```

### Historical staging run #32

```text
run id = 35201729327
head = 5f2c09ac697f6cf50f8051771b8cbc5415b02708
runtime-contracts = failure
formal-lean = success
```

The runtime job passed v0.03 through v0.10, then failed inside `verify_mathematical_fidelity_v0_11.js` before the v0.12 verifier executed.

Failure classification:

```text
historical false-negative wording assertion
```

The README truthfully described `Number.isSafeInteger` as:

```text
JavaScript representation-safety / engineering constraints
```

while the legacy v0.11 assertion accepted only a narrower list of synonymous phrases. No runtime engine, Lean source, mathematical claim, or UX behavior failed.

Repair commit:

```text
80a2dfc44101300f2ded1938ab9af80a91c2afa8
test: accept semantic representation-safety wording in v0.11 fidelity gate
```

The repair changed only `verify_mathematical_fidelity_v0_11.js`, broadening the semantic pattern without weakening the mathematical boundary checks.

### Repaired staging run #33

```text
run id = 35202768806
head = 80a2dfc44101300f2ded1938ab9af80a91c2afa8
event = pull_request
status = completed
conclusion = success
runtime-contracts = completed / success
formal-lean = completed / success
```

The runtime job passed:

```text
v0.03 scene specification
v0.04 base renderer
v0.05 one-step pullback
v0.06 recursive lazy expansion
v0.07 zoom semantics
v0.08 sheet/branch organization
v0.09 arithmetic overlays
v0.10 performance/infinite-navigation contracts
v0.11 mathematical fidelity
v0.12 UX/exposition
JavaScript syntax checks
```

The formal job passed the pinned toolchain/dependency gate, mathlib cache restore, `lake build`, all three direct Lean compilations, and the placeholder rejection gate.

## Final staging-tree policy

This progress/state evidence update changes documentation only. Therefore the resulting final staging tree must itself receive a fresh full CI pass before canonicalization.

That final-tree staging CI is treated as external evidence and is not written back through another staging documentation commit, avoiding an infinite evidence-update loop.

Only after the final staging tree receives both jobs `completed / success` may canonicalization proceed.

## Changed-files audit

Relative to the Thread 10 canonical parent, Thread 11 changes only:

```text
.github/workflows/formal-verification.yml
README.md
app.js
data/system.json
docs/UX_EXPOSITION_self_similar_cy_visualizer_v0_12.md
docs/progress_self_similar_cy_visualizer_v0_12.md
docs/state_self_similar_cy_visualizer_v0_12.json
exposition-layer.js
index.html
style.css
verify_mathematical_fidelity_v0_11.js
verify_ux_exposition_v0_12.js
```

No file under `formal/` and none of the seven sealed mathematical/runtime organization engines is modified.

## Canonicalization policy

After final staging CI and final diff audit pass, the verified final tree is replayed as exactly one canonical child of:

```text
b77a688fed8cbc41e105900d38177e75219825d1
```

Expected canonical message:

```text
ux: seal v0.12 exposition layer
```

Then `main` is advanced by a non-force fast-forward only.

The exact-SHA canonical push CI remains external sealing evidence. No second canonical commit will be made merely to write that evidence back into state/progress files.

PR #4 must be closed unmerged after canonical exact-SHA CI succeeds.

## Residual risks

The remaining risks are deliberately carried forward rather than disguised as solved:

```text
GitHub code-search index is not relied upon for absence proofs
GitHub surface has no branch reflog proving historical absence of force updates
legacy identifiers and historical terminology remain
exact parent-project canonical sources remain unavailable to this thread
real-browser long-session performance remains outside sealed evidence
real assistive-technology testing remains not_tested
```

## Current stopping condition

Repository implementation and repaired staging CI have passed. Remaining gates are:

```text
final documentation-bearing staging tree CI
final changed-files/diff audit
single-child canonical replay
fast-forward main
canonical exact-SHA CI
close staging PR unmerged
```

Thread 11 is not sealed until all of those gates complete successfully.

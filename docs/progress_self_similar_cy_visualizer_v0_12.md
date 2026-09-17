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

## Regression plan

Staging CI must execute:

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
formal-lean
```

The v0.11 verifier receives only a forward-version compatibility adjustment needed for running its claim-discipline assertions against v0.12. Its mathematical boundary is not weakened.

## Staging and canonicalization

The work branch is:

```text
thread11-ux-exposition-v0-12
```

A staging-only PR will be used as a CI vehicle and must be marked `DO NOT MERGE`.

After staging CI and final diff audit pass, the verified final tree is to be replayed as exactly one canonical child of:

```text
b77a688fed8cbc41e105900d38177e75219825d1
```

The expected canonical commit message is:

```text
ux: seal v0.12 exposition layer
```

The exact-SHA canonical push CI remains external sealing evidence. No second commit will be made merely to write that evidence back into state/progress files.

## Current stopping condition

At the time this progress artifact is authored, implementation is staged but the following remain pending:

```text
workflow wiring
v0.11 forward-compatibility verifier adjustment
full staging regression
staging CI
final changed-files/diff audit
single-child canonical replay
fast-forward main
canonical exact-SHA CI
close staging PR unmerged
```

Thread 11 is not sealed until all of those gates complete successfully.

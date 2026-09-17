# Thread 12 Progress — Publication Checkpoint v0.13

## Status

```text
milestone: Thread 12 — Publication Checkpoint
candidate version: v0.13
sealed runtime/UI baseline: v0.12
current phase: staging implementation
thread sealed: false
```

## Starting evidence

Thread 12 starts from the v0.12 canonical seal:

```text
main: 3038cb49520743e1620032a9104d26cb92bcd49f
parent: b77a688fed8cbc41e105900d38177e75219825d1
tree: f3d5154e42cdc91b772c395945b4241e7e31980f
canonical CI: #35 / 35204008792
runtime-contracts: success
formal-lean: success
```

The starting repository had no current canonical defect requiring mathematical or runtime repair.

## User policy decisions received

The user explicitly decided:

```text
final repository visibility: public
publication audience: public
open-source intent: yes
```

The repository remains private during staging only because the publication candidate is not yet complete.

Release naming follows the repository's sequential milestone convention:

```text
v0.13 — Publication Checkpoint
```

The exact open-source license remains an explicit policy decision and has not been guessed.

## Candidate implementation scope

The v0.13 staging candidate is intentionally publication-only.

Planned/implemented repository changes:

```text
README publication/reproducibility/provenance sections
.nojekyll
verify_publication_checkpoint_v0_13.js
docs/PUBLICATION_CHECKPOINT_self_similar_cy_visualizer_v0_13.md
docs/state_self_similar_cy_visualizer_v0_13.json
docs/progress_self_similar_cy_visualizer_v0_13.md
GitHub Actions maintained-action migration
publication-static-smoke CI job
v0.13 verifier wiring
```

Explicitly unchanged:

```text
data/system.json runtime version = v0.12
index.html UI/runtime version label = v0.12
scene-spec.js
base-renderer.js
one-step-pullback.js
recursive-lazy-expansion.js
zoom-semantics.js
sheet-branch-organization.js
arithmetic-overlays.js
exposition-layer.js
app.js
formal/SelfSimilarCY/*.lean
formal/lean-toolchain
formal/lakefile.toml
formal/lake-manifest.json
```

## CI maintenance correction

The readiness audit initially identified `actions/checkout@v5` and `actions/setup-node@v5` as the immediate Node-24 migration target.

Before mutation, upstream documentation was rechecked. Current maintained usage is now:

```text
actions/checkout@v7
actions/setup-node@v7
```

The candidate therefore uses v7 rather than preserving the stale v5 assumption.

Application/runtime verification remains Node 22. Automatic package-manager caching is explicitly disabled because this repository has no package-manager workflow.

## Publication truth preservation

No publication change may alter these facts:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
cameraTransformApplied = false
materializationTriggered = false
W = unresolved
```

No new theorem, map-degree claim, covering claim, metric theorem, geometric rendering claim, or parent-project theorem promotion belongs to Thread 12.

## Reproducibility work

The publication candidate records explicit runtime and Lean reproduction commands.

A new CI job, `publication-static-smoke`, serves the repository from a clean GitHub-hosted runner and verifies the repository-relative publication paths over HTTP.

This closes the gap between "source paths look relative" and "the static tree can actually be served over HTTP" at CI level.

It does **not** close these separate evidence gaps:

```text
real-browser initialization
real-browser long-session performance
assistive-technology testing
actual GitHub Pages deployed URL
actual UI screenshot/demo media
```

## License gate

Current state:

```text
LICENSE = absent
license status = pending user selection
```

This remains blocking for final publication seal. Public visibility or source availability must not be described as a particular open-source license before the user selects one.

## Visibility / Pages gate

Current staging policy:

```text
keep repository private while candidate is incomplete
switch repository to public at publication cutover
enable GitHub Pages after public cutover
verify actual deployed URL after Pages enablement
```

`.nojekyll` is publication preparation only; its presence does not mean Pages is enabled.

## Screenshot gate

No generated image is accepted as an application screenshot.

Actual screenshot/demo media remains pending until it can be captured from the deployed or locally served current UI and checked against the truthfulness boundary.

## Canonicalization policy

If staging CI and publication gates pass:

```text
1. audit the final staging tree;
2. ensure no sealed runtime or Lean source drift occurred;
3. replay the exact verified tree as one new commit whose sole parent is 3038cb49520743e1620032a9104d26cb92bcd49f;
4. fast-forward main without force;
5. require exact-SHA canonical runtime, Lean, and static-smoke CI to pass;
6. close the staging PR unmerged;
7. perform public visibility / Pages / release actions only against the verified publication checkpoint according to the final cutover order.
```

No second canonical commit will be created merely to write external exact-SHA CI evidence back into repository state.

## Remaining blockers before Thread 12 seal

```text
[ ] explicit license selection
[ ] LICENSE artifact
[ ] staging CI green
[ ] public visibility cutover
[ ] branch governance configuration after public cutover
[ ] GitHub Pages enabled
[ ] deployed URL verified
[ ] real-browser initialization smoke
[ ] actual UI screenshot/demo captured
[ ] final tree audit
[ ] one-child canonical replay
[ ] canonical exact-SHA CI green
[ ] v0.13 tag/release created
```

## Non-blocking caveats permitted if explicitly retained

```text
real-browser long-session performance = not tested
real assistive-technology testing = not tested
parent-project exact artifacts = not source-verified in the visualizer audit
historical/staging branches = retained as history
```

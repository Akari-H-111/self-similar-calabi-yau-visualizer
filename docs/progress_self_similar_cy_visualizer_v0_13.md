# Thread 12 Progress — Publication Checkpoint v0.13

## Status

```text
milestone: Thread 12 — Publication Checkpoint
candidate version: v0.13
sealed runtime/UI baseline: v0.12
current phase: implementation-bearing staging CI passed; documentation-bearing candidate pending revalidation
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

Implemented repository changes:

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

In staging run #39, the runtime job used the v7 actions and Node 22.23.2 without the earlier Node-20 action-runtime deprecation warning or the earlier `punycode` deprecation warning.

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

## Staging CI history

Three early staging runs failed only in the new publication verifier while the pre-existing v0.03–v0.12 runtime contracts continued to pass and the static HTTP smoke already passed.

### Run #36 — historical false-negative

```text
run id: 35212321720
head: efd8b6c480fe2410ed3c6319bda9d18ca6175973
runtime v0.03–v0.12: success
v0.13 publication verifier: failure
formal-lean: success
publication-static-smoke: success
```

Failure cause: the verifier required plain `not` while the truthful README used Markdown emphasis `**not**`.

Classification:

```text
mathematical defect = false
runtime engine defect = false
Lean defect = false
static deployment defect = false
publication verifier wording false-negative = true
```

### Run #37 — historical false-negative

```text
run id: 35212450224
head: e7b684fab1ae43ad47ac65a26ccb18a9b77f7066
runtime v0.03–v0.12: success
v0.13 publication verifier: failure
formal-lean: success
publication-static-smoke: success
```

Failure cause: the verifier required D² and D⁴ publication semantics to occur in one exact phrase even though the README stated both independently and correctly.

Classification remains non-mathematical and non-runtime.

### Run #38 — historical false-negative

```text
run id: 35212620482
head: be42f5a9e50810c5637059e612ee6c162ed6c22e
runtime v0.03–v0.12: success
v0.13 publication verifier: failure
publication-static-smoke: success
```

Failure cause: the verifier required the literal phrase `DO NOT MERGE` inside the progress artifact instead of checking the actual canonicalization semantics. Its formal job is not used as seal evidence for this run.

### Run #39 — first complete green implementation-bearing candidate

```text
run id: 35212692318
head: 165d72f5c56bc5e4244d409d917b299b955de70a
status: completed / success
runtime-contracts: success
v0.03–v0.13: success
JavaScript source syntax: success
formal-lean: success
publication-static-smoke: success
```

The repaired publication verifier now checks semantic requirements rather than incidental formatting or exact-label placement.

Because this progress/state update itself changes the candidate tree, a new full documentation-bearing staging CI run is still required before the tree can be treated as final staging evidence.

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

If all publication gates pass:

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
[x] implementation-bearing staging CI green (#39)
[ ] final documentation-bearing staging CI green
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

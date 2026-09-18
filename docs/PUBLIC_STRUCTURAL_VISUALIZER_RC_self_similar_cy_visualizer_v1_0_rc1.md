# Public Structural Visualizer Release Candidate — v1.0-rc1

## Milestone

Thread 21 is the public structural visualizer release-candidate milestone defined by PLAN v0.02.

Primary target: produce the first public version whose name Visualizer is justified by an actual interactive graphical layer, with cross-browser, deployment, artifact, screenshot, and reproducibility checks.

Truth boundary: release notes must state that the graphics are structural unless and until concrete geometry is admitted later.

Exit criterion: a clean checkout works; GitHub Pages deploys; browser initialization succeeds; screenshots show the structural visualizer; CI passes on the exact release SHA; and the RC can be tagged without altering canonical history.

## Starting canonical authority

- main commit: fab790ba49cdf9e7bf511e2d2b0df4aec1941b7d
- tree: bf381e519850a136d641ff3c985fcd0b6daf6d67
- sole parent: 874a80f7702f85996eb893690cc34e7d8869161c
- Formal Verification #136 / 35338164006: success
- Pages #10 / 35338163353: success
- Thread 20 staging PR #14: closed, merged=false
- open PR count at Gate 0: 0
- immutable historical release: v0.13 -> e83ed17a5ce8e45e67ef326042a21ec51ba24222

## Release-candidate public statement

This release candidate provides an interactive structural visualizer.

The rendered graphics are structural and symbolic.

No concrete Calabi–Yau hypersurface geometry is currently rendered.

W remains unresolved.

## Frozen truth boundary

- requestedDepth = 0
- D = 2
- W = unresolved
- geometryRendered = false
- sheetsMaterialized = false
- coveringStructureClaimed = false
- geometricZoomApplied = false

D² remains runtime numeric metadata. D⁴ remains runtime numeric / organizational metadata. Neither is promoted to a new theorem in Thread 21.

## Release hardening scope

Thread 21 changes only release/publication evidence unless a demonstrated browser blocker requires more. The sealed semantic, production runtime, style, and Lean sources are expected to remain byte-identical.

RC verification includes the historical verifier chain through v0.21, the v0.19 benchmark, the v1.0-rc1 release verifier, formal Lean, static publication smoke, and a dedicated browser-rc job.

The browser-rc job uses Playwright to exercise Chromium, Firefox, and WebKit from a clean GitHub Actions checkout. It records the exact candidate commit and Git tree, checks initialization and truth flags, expands the structural tower far enough to expose a D⁴ aggregate badge, verifies symbolic arithmetic annotations and visual-provenance metadata, records console/page errors, and captures structural screenshots.

Screenshot evidence is release evidence only. It is not mathematical authority, runtime authority, geometry evidence, or accessibility certification.

## Known limitations and explicit non-claims

- no concrete representation of W
- no geometric Calabi–Yau hypersurface renderer
- no genuine sheets or covering geometry
- no geometric pullback, fiber, divisor, torsion, collision, or cyclotomic locus
- D² is not a sealed metric theorem
- D⁴ is not a sealed map-degree theorem
- deferred arithmetic geometry remains unavailable
- HIA-03 remains unresolved pending direct VoiceOver/NVDA/JAWS evidence
- no WCAG certification
- no screen-reader certification
- cross-browser claims cover only browser engines actually exercised by exact-candidate evidence
- benchmark horizons are engineering observations, not mathematical limits

## Evidence and sealing discipline

The repository state/manifest files are intentionally pre-seal historical snapshots. They do not self-certify a future tag, release, final commit, final tree, CI run, or Pages deployment.

The authoritative final identities are external Git/GitHub objects created after the final staging tree is frozen and verified. No post-seal source commit may be added merely to flip pending fields to sealed.

v0.13 remains immutable and must not be moved, replaced, deleted, or reused as the RC identity.

Thread 22 Concrete Geometry Admission Contract remains blocked.

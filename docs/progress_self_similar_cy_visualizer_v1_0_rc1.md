# Thread 21 progress — Public Structural Visualizer Release Candidate v1.0-rc1

## Gate 0

PASS against canonical main fab790ba49cdf9e7bf511e2d2b0df4aec1941b7d / tree bf381e519850a136d641ff3c985fcd0b6daf6d67.

Formal Verification #136 / 35338164006 and Pages #10 / 35338163353 were successful on the starting canonical commit. PR #14 is closed unmerged. Open PR count was zero. v0.13 remains immutable.

## Implementation boundary

Thread 21 is release hardening, not geometry admission. The initial implementation changes public/version/reproducibility documentation, the RC verifier, workflow wiring, and browser-evidence tooling only.

Expected byte-identical production boundary:

- style.css
- all production JavaScript modules including app.js and visual-provenance.js
- data/system.json
- formal/*

The v0.21 historical state artifact remains intentionally historical and non-self-certifying.

## Public drift repaired

- README verification commands now include verify_mathematical_visual_fidelity_v0_21.js.
- README literal escaped newline drift around the v0.20.1/v0.21 verifier prose is repaired.
- README Thread 19R staging wording is historical rather than current-facing.
- public RC identity is v1.0-rc1 while the immutable v0.13 checkpoint remains distinct.

## RC evidence introduced

- verify_public_structural_visualizer_rc_v1_0_rc1.js
- verify_public_structural_visualizer_browser_rc_v1_0_rc1.js
- docs/PUBLIC_STRUCTURAL_VISUALIZER_RC_self_similar_cy_visualizer_v1_0_rc1.md
- docs/release_manifest_self_similar_cy_visualizer_v1_0_rc1.json
- docs/state_self_similar_cy_visualizer_v1_0_rc1.json
- this progress artifact
- browser-rc GitHub Actions job for Chromium / Firefox / WebKit and screenshots

## Pending gates

- draft PR as CI-only vehicle
- exact candidate full regression
- browser-rc evidence and screenshot artifact
- final staging tree freeze
- close PR unmerged
- exact-tree replay as one child of fab790ba49cdf9e7bf511e2d2b0df4aec1941b7d
- exact-main Formal Verification success
- exact-SHA Pages success
- v1.0-rc1 tag and prerelease creation after canonical CI

No pending item may be converted into a claim merely because static verification is green.

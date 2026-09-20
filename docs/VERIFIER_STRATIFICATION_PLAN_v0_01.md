# Verifier stratification plan v0.01

## Purpose

Keep immutable historical release verifiers distinct from current development UI checks. This plan does not alter historical records, canonical scene data, formal artifacts, or the existing cap/admission semantics.

## Current split

- Historical verifiers retain byte-hash checks for the release or sealed checkpoint they describe.
- Current development UI changes use additive verifiers such as `verify_visual_hierarchy_maintenance_v0_01.js` and `verify_dual_mode_3d_presentation_v0_01.js`.
- The `current-ui-contracts` CI job runs these current checks independently, so an expected historical checkpoint mismatch cannot suppress their result.
- The current-main workflow leaves the retained Thread 20/21, Gate 2-C/2-D, and Thread 26 byte-pinned verifier/browser checks out of runtime execution; they remain syntax-checked and are intended for their historical checkpoints.
- Browser evidence is produced only from a clean CI checkout and is bound to `GITHUB_SHA`; a dirty local run records `workingTreeClean=false` rather than claiming an exact candidate.

## Follow-up, not part of this slice

1. Agree a successor current-development baseline and its provenance matrix.
2. Keep historical workflow steps runnable against their pinned trees or tags; do not relax their hashes to make later UI work appear historical.
3. Add an explicit historical-check dispatch or tag workflow when a maintained release-verification surface is needed.

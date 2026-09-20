# Release status

This page distinguishes immutable publication objects from the current development tree. It does not rewrite historical notes or assign a new version to `main`.

| Surface | Current meaning | Current authority |
| --- | --- | --- |
| Current development status | What the current `main` application can represent and what it does not claim. | [CURRENT_DEVELOPMENT_STATE.md](CURRENT_DEVELOPMENT_STATE.md) and current source. |
| UI current status | The capabilities and boundary text shown by the deployed static app. | `index.html`, presentation files, and browser evidence for the exact commit. |
| Historical release notes | An immutable description of a checkpoint’s scope at its exact commit. | The tag-bound GitHub Release notes. |
| Git tag | An exact historical Git object. | Tag target commit; it does not describe later `main` development. |
| GitHub Release | A publication object bound to that tag. | GitHub Release metadata and release notes. |
| Audit and formal documents | Provenance artifacts with their own time-scoped status. | Their recorded commit/blob references and current source where stated. |

## Historical checkpoints

| Checkpoint | Exact commit | GitHub object status | Scope boundary |
| --- | --- | --- | --- |
| `v0.13` | `e83ed17a5ce8e45e67ef326042a21ec51ba24222` | Existing tag and published GitHub Release. | Historical publication checkpoint. |
| `v1.0-rc1` | `f1228b270517f95984baf12678fa9bdd2be83fa9` | Release-control action tracked by [Issue #17](https://github.com/Akari-H-111/self-similar-calabi-yau-visualizer/issues/17); tag and prerelease must target this exact commit. | Historical structural visualizer release candidate: symbolic graphics, unresolved `W`, no concrete hypersurface, sheets, or covering claim. |

`v1.0-rc1` is not a label for the later sampled/global/scoped features now present on `main`. A release-control operation must create no source commit and must preserve the structural-only boundary in the release notes.

## Publication checks

Before changing a release object, re-read the tag target, GitHub Release state, exact-main CI and Pages evidence, and the historical release manifest. Do not infer current-development features from an older tag, and do not backfill a historical narrative into current source.

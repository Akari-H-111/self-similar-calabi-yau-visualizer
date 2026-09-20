# Repository guide

Start with [current development state](CURRENT_DEVELOPMENT_STATE.md), then the [formal landing page](../formal/README.md) and [Audit III](AUDIT_III_FINAL_CONSOLIDATION.md). The root [README](../README.md) is a byte-pinned historical structural release snapshot and must be read with its checkpoint date and scope.

## Canonical documentation index

| Need | Current entrypoint | Boundary |
| --- | --- | --- |
| Current state | [CURRENT_DEVELOPMENT_STATE.md](CURRENT_DEVELOPMENT_STATE.md) | Present application/source truth, not a release note. |
| Active roadmap | [Plan v0.03](PLAN_self_similar_cy_visualizer_v0_03.md) | Sealed plan history; its next-step language is time-scoped. |
| Consolidation audit | [AUDIT_III_FINAL_CONSOLIDATION.md](AUDIT_III_FINAL_CONSOLIDATION.md) | Current Thread 32 checklist and evidence. |
| Formal status | [formal landing page](../formal/README.md) and [module matrix](../formal/MODULE_STATUS.md) | Exact Lean statements only. |
| Release status | [RELEASE_STATUS.md](RELEASE_STATUS.md) | Exact tag/release objects, separate from current main. |
| Historical audits and provenance | `docs/`, `docs/recovery/`, `docs/*matrix*.json` | Preserve recorded scope and identity; do not normalize history in place. |
| Thread 27 decision debt | [retrospective receipt](THREAD27_RETROSPECTIVE_RECEIPT.md) | Documents a gap without recreating historical authority. |

| Area | Entrypoints | Role |
| --- | --- | --- |
| Static app | `index.html`, `style.css`, `app.js` | Document, presentation, schema-v1 structural boot. `index.html` declares script order. |
| Structural semantics and view | `scene-spec.js`, `recursive-lazy-expansion.js`, `interactive-pullback-tower.js`, `structural-visualization.js`, `structural-camera.js` | Descriptor, navigation, SVG, and presentation camera layers. |
| Finite geometry | `concrete-runtime-schema.js`, `laurent-evaluator.js`, `base-geometric-*`, `geometric-pullback-*`, `projection-slice-semantics.js` | Admitted schema-v2 formula, finite samples/fibers, and fixed projection. |
| Context bridge and scope | `hybrid-navigation-*`, `ancestor-scoped-pullback-*`, `hybrid-scoped-bridge-*` | Independent structural/global/scoped states; explicit scope render only. |
| Evidence and data | `visual-provenance.js`, `data/`, `docs/*matrix*.json` | Runtime fixtures, admission matrices, and evidence classes. Matrix status may be historical to its phase. |
| Machine/browser checks | root `verify_*.js`; `.github/workflows/formal-verification.yml` | Historical regression gates plus current browser and publication checks. Keep paths stable. |
| Performance | root `benchmark_*.js` | Engineering observations, not asymptotic or mathematical theorems. |
| Formal | `formal/SelfSimilarCY.lean`, `formal/SelfSimilarCY/`, `formal/lean-toolchain`, `formal/lake-manifest.json` | Pinned Lean aggregator, modules, and dependency lock. |
| Historical audit and release | `docs/`, `docs/recovery/`, tags, GitHub Releases | Sealed provenance, roadmaps, publication records. Follow document identity rather than filename recency alone. |

## Working rule

Use `node verify_*.js` only for the affected layer during a small edit; CI runs the canonical sequence. Browser scripts write evidence directories in the root when run locally. Preserve original paths of sealed JS, CSS, JSON, Lean, and verifier artifacts because source and blob pins depend on them. New navigation documents may be added without moving them.

Current-state facts, historical release wording, source-backed mathematics, Lean theorems, runtime observations, and visualization conventions have different authority. The [current-state page](CURRENT_DEVELOPMENT_STATE.md) is the short entrypoint for those distinctions.

# Audit III — final consolidation

Status: **open audit; implementation and final evidence pending**. This is a current audit record, not a retroactive change to any sealed milestone.

## Opening identity

- Starting `main`: `ce1317c3cc32fc7d8a3b9e4795949bea6680df96` (Thread 31 implementation).
- Thread 31R repair: PR #47, single-parent main commit `fde4f05270dbe3d5620dfe5b6cc630cc0f51deff`.
- Thread 31R seal: PR #48, single-parent main commit `4aa6062d16e3340ed94248d65f2dd46ba626d973`.
- Thread 31 seal: PR #49, single-parent main commit `34cd6e627d58e85b478d66d3bd517ad35d800948`, tree `b3676f0605bed8c3cd6a6e71766762b922588707`.
- Exact-main Formal Verification `35456364132`: all four jobs passed. Exact-SHA Pages `35456363327`: passed.

## Findings and work boundary

| Area | Opening evidence | Consolidation action |
| --- | --- | --- |
| Semantic authority | Thread 31R repaired a Class A claim for an unavailable global stage; structural depth 2 with global stages [0,1] is Class D. | Keep the upstream Thread 26 verdict as the only stage-class authority. No mathematical or generation changes. |
| UI truth and interaction | At 1440px the hero was about 1953px tall; at 390px about 3193px. Main controls began below those heights. | Put current capabilities and entry point first; retain historical prose under disclosure. Test state and interaction, not screenshots alone. |
| Public narrative | Root README is the Gate 2-C historical byte-pinned release snapshot (`89d62bcf111d4a3f7ad06ead47889ef2a38499b9`). Its old current-version wording is historical. | Preserve this sealed file; add a linked current-state landing document and explain the distinction in the UI and documentation index. |
| Formal truth | `formal/README.md` ends at F04, while the aggregator imports 15 modules through `LaurentImplicit`. | Audit actual modules and update the formal landing page without editing proofs or dependency pins. |
| CI truth | Four jobs already separate formal, runtime, static publication, and browser evidence, but the workflow has many historical steps. | Add navigation and limited orchestration comments; preserve every historical check and exact-SHA evidence. |
| Repository hygiene | Root contains 84 files outside docs, including 39 verifiers and two benchmarks; paths are referenced by HTML, CI, and historical blob pins. | Index the tree and ignore generated local artifacts. Do not mass-move sealed files. |
| Release truth | GitHub has `v0.13` plus the historical `v1.0-rc1` prerelease. The latter is an annotated tag dereferencing to `f1228b270517f95984baf12678fa9bdd2be83fa9`. | Keep that historical release separate from current main development state. Do not invent a current version. |

## Invariant carried into Audit III

If an upstream canonical layer already computes a semantic verdict, every downstream wrapper and presentation layer delegates that verdict. It may display or narrow the verdict only under an explicit contract; it must not independently reconstruct or strengthen it. Thread 31R's stage correspondence repair is the counterexample and regression fixture for this rule.

## Exit checklist

- [ ] Current-state UI and documentation agree with the runtime's separate structural, global finite-sample, and ancestor-scoped contexts.
- [ ] Scope generation remains explicit; context switching preserves independent depths and does not generate geometry.
- [ ] The 10,000-point preflight cap and no-partial-result refusal remain visible and verified.
- [ ] Structural nodes, projected overlaps, root tuples, and sampled points are not promoted to identities, sheets, or global completeness.
- [ ] Current formal module matrix, direct compilation, and source placeholder scan are complete.
- [x] Historical release objects point to the historical commit; current main is described as development.
- [ ] Browser state, keyboard, viewport, zoom, contrast, and reduced-motion checks pass.
- [ ] All canonical verifier jobs, static publication smoke, and exact-SHA Pages pass on the final tree.

Audit III does not grant a mathematical theorem or certify assistive technology. Thread 33 is a public preview/checkpoint decision after this checklist closes, not a feature-development mandate.

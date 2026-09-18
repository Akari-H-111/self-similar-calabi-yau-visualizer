# Progress — Thread 19R Human Interaction Remediation v0.20.1

## Starting gate

```text
main = 3b2c8e2119a44db069f77e8106145e35126ac7b1
tree = f8778b982b70703e0791a3ec6d59896ae59a6db0
Formal Verification #115 = success
Pages #8 = success
open PR = none
```

## Scope

Two browser-observed defects are being repaired before Thread 20:

1. Reset camera keyboard activation could leave focus on `body` after the Reset button disabled itself.
2. Collapse descendants could remain enabled after the presentation was already collapsed.

The lower-risk duplicated accessibility-tree gap wording is intentionally deferred pending actual screen-reader evidence.

## Implementation candidate

- `app.js`: restore camera-control focus by semantic action name, with deterministic named fallback.
- `infinite-navigation-renderer.js`: require `!presentation.collapsed` for the Collapse control to remain enabled.
- `verify_human_interaction_remediation_v0_20_1.js`: lock both contracts and sealed boundaries.
- workflow: run the new verifier and syntax check.
- README/docs: record scope and evidence discipline.

No sealed semantic/runtime/camera/formal source is modified.

## Next gates

```text
draft staging PR
v0.03-v0.20 + v0.20.1 verifier
formal-lean
publication-static-smoke
exact candidate Chromium HIA-01/HIA-02 retest
final artifact sync
exact final staging CI
close PR unmerged
recheck main
exact-tree replay
exact-main Formal Verification
exact-SHA Pages
```

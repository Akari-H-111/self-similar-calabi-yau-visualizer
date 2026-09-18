# Thread 19R — Human Interaction Remediation v0.20.1

## Scope

This is a narrowly scoped post-seal remediation before Thread 20. It repairs two defects discovered by Chromium human-interaction testing of the exact canonical v0.20 Pages artifact.

Starting canonical identity:

```text
commit = 3b2c8e2119a44db069f77e8106145e35126ac7b1
tree   = f8778b982b70703e0791a3ec6d59896ae59a6db0
Formal Verification #115 / 35325887351 = success
Pages #8 / 35325886754 = success
```

## HIA-01 — Reset camera focus loss

Observed browser behavior:

```text
keyboard activate Reset camera
-> camera resets correctly
-> Reset becomes disabled
-> Chromium focus falls to <body>
```

Repair contract:

```text
camera DOM focus
!= camera model state
!= semantic selected/focused state
```

After a native camera-button action, focus is restored using the semantic camera action name. If the activated control remains enabled, it keeps focus. If it becomes disabled, focus moves to a deterministic named enabled camera control. DOM child index and visual slot order are not authority.

No change is made to `structural-camera.js`.

## HIA-02 — stale Collapse enabled state

Observed browser behavior:

```text
collapse descendants
-> presentation.collapsed = true
-> visibleDepth = selectedDepth
-> Collapse remained enabled
-> a repeated activation emitted the same no-op transition/status
```

Repair contract:

```text
canCollapse
=
!interactionModel.presentation.collapsed
&& selectedDepth >= focusedDepth
&& selectedDepth < materializedDepth
```

The interaction controller itself is unchanged. This is only the bounded presentation control-state predicate.

## HIA-03 — duplicated virtual-gap AX wording

The prior audit found the bounded omitted-level message in both breadcrumb and level-control representations in Chromium's accessibility tree.

This is not changed in Thread 19R because there is still no direct VoiceOver/NVDA/JAWS evidence showing that the bounded duplication is materially harmful. Avoiding speculative AT-specific tuning is preferred over silently changing semantics.

## Frozen truth boundary

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
W = unresolved
```

## Frozen implementation boundary

Thread 19R must not modify:

```text
scene-spec.js
base-renderer.js
one-step-pullback.js
recursive-lazy-expansion.js
zoom-semantics.js
sheet-branch-organization.js
arithmetic-overlays.js
interactive-pullback-tower.js
structural-camera.js
structural-visualization.js
branch-organization-graphics.js
arithmetic-overlay-graphics.js
exposition-layer.js
formal/*
```

## Evidence model

Layer A is the deterministic Node verifier `verify_human_interaction_remediation_v0_20_1.js`.

Layer B must re-run Chromium against the exact candidate artifact for the two defect paths:

```text
Reset camera -> focus remains on a valid camera control
Collapse once -> Collapse becomes disabled
Reveal -> Collapse becomes available again when appropriate
```

Layer C actual screen-reader evidence remains not_tested.

## Seal authority

This file does not self-certify the remediation. Seal authority requires exact final staging tree CI, browser evidence on that exact candidate, PR closed unmerged, exact-tree replay as one child of the v0.20 canonical commit, then exact-main Formal Verification and exact-SHA Pages.

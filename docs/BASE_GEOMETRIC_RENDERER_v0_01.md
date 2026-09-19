# Base Geometric Renderer v0.01

Status: **THREAD 24 IMPLEMENTATION CONTRACT**

## 1. Milestone boundary

Thread 24 renders only the first admitted base geometric view of `X_0`. It does not render `X_1`, any finite or recursive pullback, geometric sheets, a covering, or geometric zoom.

The admitted source object is

```text
T = (C^×)^4
W_kappa(z) = z1 + z2 + z3 + z4 + kappa/(z1 z2 z3 z4)
X_0 = W_kappa^{-1}(lambda)
```

The canonical Thread 23 display contract remains unchanged:

```text
viewKind = sampled_projection
viewId = x0_z1_complex_plane_sampled_projection_v1
pi(z) = (Re(z1), Im(z1))
label = Sampled projection of X_0 onto the z_1 complex plane
```

## 2. Thread 24-A0 preflight

The canonical Thread 23 seal was revalidated before mutation:

```text
main = 8e0e360c2676f992736063cf22f71398bc3acf89
tree = 8c70222f897b005e7247254e6d9a01978bc5abb6
sole parent = 05c646151a5ec882691d6cddc76cda0a74d76068
ahead/behind/total = 1/0/1
PR #30 squash merged
PR head = 5e4b5adfb675dd5481533de46d5d8d9785e10958
Formal Verification #188 / 35423968728 = success
Formal Verification #189 / 35424152030 = success
Pages #23 / 35424151362 = success
seal receipt = 5739692489
```

All six Thread 23 artifact blobs matched their canonical receipt. No Thread 24 branch existed before the preflight.

## 3. Architecture decision

The structural runtime remains sealed and independent. Historical RC verifiers byte-seal `app.js` and `style.css`, so Thread 24 does not modify them.

The new geometric path is independent:

```text
data/system.v2.json
  -> concrete-runtime-schema.js
  -> laurent-evaluator.js
  -> base-geometric-sampler.js
  -> data/geometric-view.v1.json
  -> projection-slice-semantics.js
  -> base-geometric-renderer.js
  -> base-geometric-runtime.js
  -> SVG marks
```

The existing structural path remains:

```text
data/system.json -> sealed structural runtime -> structural SVG
```

Thus a structural pipeline truth flag can remain `geometryRendered=false` while the new geometric surface truthfully reports `geometryRendered=true` for its admitted finite sampled projection.

## 4. Renderer technology

**Selected: SVG.**

Reason: the canonical sample budget is finite and modest, while SVG gives deterministic DOM marks, source-sample IDs, semantic coordinates, accessibility hooks, and direct browser-verifier inspection. Canvas/WebGL add complexity without improving the first milestone's mathematical authority.

## 5. W evaluator

`laurent-evaluator.js` binds only to the canonical runtime registry id:

```text
W_kappa_torus4_v1
```

It evaluates exactly the runtime formula registry semantics:

```text
sum_i(z_i) + kappa / product_i(z_i)
```

It requires exactly four finite complex coordinates and rejects every zero torus coordinate, non-finite component, unknown formula id, or invalid parameter embedding.

The evaluator uses the declared parameter embedding `real_to_complex` only for the current runtime representation of `lambda` and `kappa`. Ambient sample coordinates remain complex.

## 6. Deterministic sampler route decision

### Route A: direct quadratic construction

**Selected.**

For deterministic nonzero `z1,z2,z3`, define

```text
mu = lambda - z1 - z2 - z3
c = kappa/(z1 z2 z3)
```

and solve

```text
z4^2 - mu z4 + c = 0.
```

The implementation uses the principal complex square root only to obtain the unordered quadratic root pair, then imposes a separate lexicographic `(Re, Im)` root ordering. Near-double roots are deduplicated by an explicit versioned relative-distance policy.

This is a finite sample construction, not a global parameterization theorem for `X_0`.

### Route B: deterministic grid + membership acceptance

Rejected for the first renderer because a codimension-two real level set in an ambient grid would require tolerance-thickening. The displayed cloud would then depend on an artificial neighborhood of the fiber rather than constructive points on the fiber.

### Route C: local implicit-function chart

Deferred. F14 supports neighborhood-scoped regular-level charts, but Thread 24 does not need chart dependence or a regular-point choice for its first global finite sample construction.

### Route D

No simpler source-backed construction was found in the admitted runtime/source package.

## 7. Sample domain and ordering

The sampler input domain is the finite Gaussian-rational shell pool

```text
(a + i b) / 4,
1 <= max(|a|,|b|) <= 8,
a,b integers.
```

This gives 288 nonzero complex values. Pool order is deterministic:

```text
shell ascending -> a ascending -> b ascending,
keeping only the square-shell boundary.
```

For parameter index `m`, the v0.01 selector is:

```text
z1 = pool[m]
z2 = pool[(5m + 1) mod 288]
z3 = pool[(7m + 3) mod 288]
```

The canonical parameter-triple budget is `256`; the canonical sample budget is `512`. Each triple contributes at most two lexicographically ordered validated roots. Generation terminates after the finite triple budget or sample budget.

Randomness is forbidden. No seed exists.

## 8. Numerical contract

Membership validation uses the combined tolerance

```text
|W_kappa(z) - lambda| <= atol + rtol * S
```

with

```text
version = v0.01
atol = 5e-12
rtol = 5e-12
S = max(1, |lambda|, sum_i |z_i| + |kappa/product_i(z_i)|).
```

This tolerance supports only the runtime claim that a constructed floating-point sample passes the declared numerical membership policy. It is not a formal equality theorem and does not replace the Lean/source definition of `X_0`.

The verifier checks an exact fixture, all canonical constructed samples, deliberate perturbation rejection, zero-coordinate rejection, NaN/Infinity rejection, stable ordering, and repeated-generation identity.

## 9. Projection consumption

The renderer does not hard-code an alternate projection. It validates and consumes `data/geometric-view.v1.json` through `projection-slice-semantics.js`.

For every validated sample:

```text
semantic x = Re(z1)
semantic y = Im(z1)
```

No `abs`, `arg`, log modulus, axis swap, complex rotation, or hidden slice is applied.

## 10. Presentation transform

Semantic coordinates and pixel coordinates are separate layers.

The renderer computes a uniform fit-to-viewport transform with fixed padding. The y coordinate is inverted only because SVG screen y increases downward. This is presentation state, not a new geometric projection, metric theorem, `D^2` scale, or geometric zoom.

## 11. Rendered mark semantics

One SVG circle means exactly:

> one deterministic finite sample with accepted v0.01 numerical `X_0` membership, projected by the sealed Thread 23 map to `(Re(z1), Im(z1))`.

Each mark carries:

```text
data-source-sample-id
data-semantic-x
data-semantic-y
data-projected-overlap-count
```

Different source samples may overlap in the projection. The overlap counter is display metadata only and is named `projected sample overlap count`. It is not source self-intersection, sheet count, covering multiplicity, or `D^4`.

## 12. Empty and degenerate behavior

If the sampler produces zero valid samples, the geometric panel reports an explicit empty state and `geometryRendered=false`. No fake points, placeholder mesh, procedural blob, or fallback geometry is generated.

A one-point or collapsed projection is displayed honestly with the same presentation transform rules. Non-finite intermediate arithmetic is rejected. Double roots are handled by the declared dedup policy.

## 13. Truth flags

For a nonempty validated canonical scene:

```text
geometryRendered = true
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
```

`geometryRendered=true` belongs only to the new base geometric surface. Existing structural components continue to report their own structural truth flags unchanged.

## 14. D² / D⁴ freeze

The Thread 24 evaluator, sampler, renderer, and runtime do not consume `metricScale` or `sheetDegree` and do not recompute `D^2` or `D^4`.

```text
viewport fit != D^2 metric scaling
sample count != D^4
projected overlap count != D^4
quadratic root count != sheets
```

## 15. Depth boundary

`requestedDepth` is ignored by the sample construction except for schema validation. A verifier mutates `requestedDepth` to a positive value and requires the same `X_0` samples and projection. Thread 24 therefore cannot silently become an `X_n` renderer.

## 16. Protected files

The following remain byte-identical in Thread 24:

```text
app.js
style.css
base-renderer.js
one-step-pullback.js
recursive-lazy-expansion.js
zoom-semantics.js
sheet-branch-organization.js
arithmetic-overlays.js
structural-camera.js
structural-visualization.js
concrete-runtime-schema.js
data/system.v2.json
projection-slice-semantics.js
data/geometric-view.v1.json
formal/*
```

Only `index.html` and the CI workflow need small integration changes among existing files.

## 17. Browser verification

The browser verifier requires:

```text
structural surface still visible
geometric surface visible
canonical geometric label exact
nonzero SVG sample marks
mark count = sample model count
geometryRendered=true on geometric surface
sheets/covering/geometric zoom=false
structural camera truth flags unchanged
no console/page errors
reload produces identical source-sample/semantic-coordinate metadata
screenshot artifact captured
```

Screenshot evidence is supplementary; the semantic authority is the sample model, projection descriptor, source-sample IDs, semantic mark attributes, and verifier.

## 18. Non-claims

Thread 24 does not claim:

```text
finite sample = complete X_0
projection image = X_0
projection overlap = source self-intersection
two quadratic roots = sheets
SVG fit = geometric metric or geometric zoom
X_0 renderer = X_1 renderer
geometryRendered=true = coveringStructureClaimed=true
```

Thread 25 remains the earliest legal milestone for geometric pullback visualization.

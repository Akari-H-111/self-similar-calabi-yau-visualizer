# Geometry Exploration Engine v1

Status: local implementation candidate. This document is the semantic contract
for `geometry-exploration-math.js` and `geometry-exploration-engine.js`; it
does not enlarge any source or Lean theorem.

## Formula binding and parameter domain

The engine consumes only `data/system.v2.json` through the existing schema and
Laurent evaluator:

```text
T = (C^x)^4
W_kappa(z) = z1 + z2 + z3 + z4 + kappa/(z1 z2 z3 z4)
X_0 = W_kappa^{-1}(lambda).
```

`lambda` and `kappa` remain the existing **real slice of the complex family**.
The interface chooses `lambda in [-4,4]` and `kappa in [0.1,3]`; this is a
safe interactive subdomain, not the mathematical parameter domain. The engine
does not report a smoothness theorem; the source discriminant condition stays
separate from a numerical rendering request.

## Display modes

| UI mode | Input and map | What is rendered | Not established |
| --- | --- | --- | --- |
| Declared parameter subfamily | `z1=e^(i theta), z2=e^(i phi), z3=1`; solve `z4^2-(lambda-z1-z2-1)z4+kappa/(z1z2)=0`; `theta,phi in S1`; display `pi=(Re z1, Im z1, Re z4)` | Two numerical-root-labelled, finite-resolution parameter surfaces with phase of `z4` as colour | Full `X_0`, a global parameterization, sheets, covering branches, components, smoothness, topology. `z3` is fixed; `z2` remains only as a parameter; `Im z4` is omitted from axes. |
| Phase / torus display | Existing ordered finite validated samples; display embedding from `arg z1`, `arg z2`, clipped `log |z3|` | A point display embedded in an ordinary torus | The display torus is **not** `X_0`; seam/overlap/density are display effects. |
| Finite validated sample cloud | Existing deterministic sampler; `pi=(Re z1, Im z1, Re z4)` | One mark per accepted finite numerical sample | Completeness, injectivity, source self-intersection, sheets, covering, global topology. `z2,z3,Im z4` are discarded. |
| Structural pullback | Fixed relation display, not the Laurent evaluator | Structural depth/relation graph | Geometric coordinates, points, fibers, sheets, covering or metric data. |

For each geometric mode, the renderer uniformly fits the displayed R3 values
to the camera. This affine **presentation transform is not a metric claim**;
it does not implement `D^2` scaling or geometric zoom.

The two quadratic outputs are deterministically ordered by `(Re, Im)` only.
They are solver-root labels, not “sheets.” A finite double root can collapse
the displayed root labels; this is not a source singularity claim.

## Numerical and performance discipline

The source positions are constructed with the same complex operations as
`laurent-evaluator.js`; the surface reports its maximum floating residual.
Finite-cloud modes retain the sampler's versioned membership tolerance. The
engine uses a cancellation token, a bounded eight-entry in-memory cache, a
resolution ceiling of `112 x 81` per root label, and display data only after
the full requested result is built. It does not silently replace a failure or
empty result with a procedural object.

The primary renderer is Three.js `WebGPURenderer`. It selects WebGPU when
available and has a WebGL2 backend fallback. A failed renderer shows an error
state and preserves the textual contract; it renders no substitute geometry.
The implementation uses built-in materials and renderer tone mapping rather
than a custom `ShaderMaterial`, which Three.js documents as unsupported by
WebGPURenderer.

## Assets, sources, and redistribution

No image, environment map, font, model, texture, shader snippet, or remote
asset is fetched by this engine. The star field and colours are generated from
small deterministic local code. The only rendering dependency is the already
vendored Three.js distribution at `vendor/three`, whose included `LICENSE`
states MIT / Copyright 2010–2025 Three.js Authors. It is compatible with this
repository's Apache-2.0 license; retain both notices on redistribution.

Technical references used for implementation:

- Three.js, [WebGPURenderer manual](https://threejs.org/manual/en/webgpurenderer.html): WebGPU selection, `init()`, and WebGL2 fallback.
- Three.js, [WebGPURenderer API](https://threejs.org/docs/pages/WebGPURenderer.html): renderer options and output quality defaults.
- Kranjc et al., [GPU-based visualization of domain-coloured algebraic Riemann surfaces](https://arxiv.org/abs/1507.04571): domain colour as a visual encoding rather than a claim about the underlying surface.
- Musin et al., [Synthetic construction of the Hopf fibration in a double orthogonal projection of 4-space](https://arxiv.org/abs/2003.09236): consulted for projection-labelling discipline only. This engine does **not** claim or render a Hopf fibration.

## Verification scope

`verify_geometry_exploration_engine_v1.js` checks formula binding, the exact
declared subfamily residuals, deterministic root ordering, finite sample mode,
mode wording, cache/fallback hooks, and exclusion of prohibited terminology.
`verify_geometry_exploration_engine_browser_v1.js` performs renderer/mode/
mobile smoke tests and stores screenshot evidence locally. Browser screenshots
are visual evidence, never mathematical authority.

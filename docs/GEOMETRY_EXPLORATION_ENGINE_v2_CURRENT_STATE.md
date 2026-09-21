# Geometry Exploration Engine v2 — current state

Status: local implementation, not a historical release object. This page describes current source behavior and its verification boundary. Simple and Expert mode use one geometry explorer instance with different controls.

## First-visit finite view

Simple mode opens a fixed, regular-parameter **declared two-real-parameter
slice** of `X_0`: `z₁=e^(iθ)`, `z₂=e^(iφ)`, `z₃=1`, with each ordered
numerical root of the displayed quadratic used for `z₄`. It renders a finite
mesh through `π=(Re z₁, Im z₁, Re z₄)`. This is a sampled projected slice,
not the six-real-dimensional `X₀` or a 3D Calabi–Yau object.

Selecting a validated mesh vertex (by pointer or arrow keys) and choosing
**Explore this patch** requests one bounded `9×9` source patch and one `D=2`,
depth-one inverse root tuple. The selected source record is the immutable
center of that patch: nearest-root continuation starts there and the request
is refused if two reached paths select different roots at a patch vertex.
The result has 81 parent records and 81 child records, all with deterministic
IDs, parent IDs, root tuple, coordinate-power residual, and inherited `W`
residual. The raw panels are projected displays. The optional comparison
recentres unwrapped local logarithmic coordinates and multiplies child offsets
by `D`; it reports `max |D(w′−w′₀)−(w−w₀)|`. It is a finite local coordinate
relation, not a global metric, fractal-boundary, or global self-similarity
theorem. The older finite-fibre modes remain in Expert mode.

Drag, wheel/pinch, +/−, and **Fit view** control only the visual camera or
display fit. They leave `geometricZoomApplied=false`; they do not apply a
metric theorem. The structural SVG playground and optional structural 3D
presentation camera are available from Expert mode.

## Mathematical input and qualification

The source family remains `T=(C^×)^4`, `W_κ(z)=Σ z_i+κ/(Π z_i)`, `X₀=W_κ⁻¹(λ)`, and `P_D(z)=(z_i^D)`. The UI accepts real `λ,κ` only. The discriminant indicator evaluates the source criterion `κ≠0 ∧ λ⁵=5⁵κ` using decimal rational equality for the displayed input strings. The renderer evaluates binary64 approximations of those inputs. A nonzero gap within a conservative floating uncertainty band reports `numerical-inconclusive`; unsupported decimal input also reports that state. `regular` and `singular` classify the intended displayed decimal parameters under the cited source criterion. They do not certify a displayed mesh, scheme smoothness, canonical triviality, or Calabi–Yau status. See the source and Lean scope in [Concrete Geometry Admission Contract](CONCRETE_GEOMETRY_ADMISSION_CONTRACT_v0_01.md).

The exact decimal singular witness button sets `λ=2`, `κ=0.01024`, since `2⁵=5⁵·0.01024`. It is a parameter witness, not a mesh singularity locator.

## View classes and finite pullback

| View | Runtime object | Completeness |
| --- | --- | --- |
| Declared subfamily | Two real parameters on `S¹×S¹`, with `z₃=1` and two ordered quadratic roots; projected to `(Re z₁, Im z₁, Re z₄)` | A finite resolution subfamily of `X₀`, not all of `X₀` |
| Finite cloud | Accepted deterministic `X₀` samples projected to the same three axes | Finite sample, not all of `X₀` |
| Phase torus | The finite samples mapped to a display torus | Display embedding, not source topology |
| Finite pullback projection | Complete coordinate-power fibers over the finite seed or one selected seed ancestor | Complete over that selected finite scope only |
| Local inverse-branch patch | One continuous numerical quadratic-root selection on a finite `9×9` sampled slice patch, and one named root multi-index | 81 paired records at default settings; not all roots, all patches, or global `X₁` |

No mode renders a complete six-real-dimensional `X₀` or complete global `Xₙ`. `completeX0Rendered` and `completeGlobalXnRendered` stay false. The explorer no longer displays the fixed `1,4,16` structural graph.

The pullback view calls the existing `BaseGeometricSampler`, `GeometricPullbackEngine`, and `AncestorScopedPullbackRuntime`. Every generated child retains its parent ID, four-coordinate root multi-index, parent power residual, inherited base membership residual, and ancestor sample ID. The point inspector exposes any point by its deterministic index and shows those fields with sampler/formula/map provenance. The displayed axes are a projection; overlapping marks do not imply equal source points. `D` ranges 2–4 and requested depth 0–4. For `s` admitted seed points, the exact preflight count is `s·D^(4n)`, computed with BigInt. The hard cap is 10,000. An over-cap request creates zero pullback points and reports the count and cap; the unbounded part of `Xₙ` outside the seed is never computed. At default parameters there are 512 seeds, 8192 global finite points at `D=2,n=1`, and a global `n=2` request is refused at 131072.

## Scaling and evidence

`cameraScale` is the visual OrbitControls dolly ratio. `displayNormalizationFactor` is the numeric factor used to fit projected coordinates into the viewport. For a local branch comparison, `inverseBranchScaling` records the explicit local-log rule `1/D`, while `metricScaleD2Metadata` records `D²` as informational metadata only. `localChartNormalization` means display-only recentering and multiplying child offsets by `D`. All views report `geometricZoomApplied=false`. None of these display operations is a metric theorem or a global self-similarity claim.

Local patches preflight their exact requested child count with BigInt before
generation. The current Simple request is one root tuple at depth one, so a
radius-four patch requires 81 generated child records under the 10,000 point
cap. A boundary crossing, unresolved quadratic roots, invalid/nonzero source
coordinates, path-dependent continuation, excessive residual, unsupported
depth, or cap failure refuses before any child mesh is created. If neither
WebGPU nor WebGL2 can initialize, Simple mode presents the renderer refusal in
the guide and removes the empty camera stage; it does not substitute an image.

`node verify_geometry_exploration_contract_v2.js` checks discriminant states, flags, parent/root/residual replay, and finite-fibre refusal cases. `node verify_local_branch_geometry_view_v1.js` checks center anchoring, path consistency, source records, branch replay, local-log error, cap/boundary/chart refusals, and truth flags. `node verify_geometry_exploration_engine_browser_v1.js` checks surface and keyboard selection, local comparison, camera dolly, reloading, and mobile layout. `node verify_geometry_exploration_fallback_browser_v1.js` checks the visible no-GPU refusal. `cd formal && lake build` checks the existing Lean source only; it is not a proof of this browser renderer.

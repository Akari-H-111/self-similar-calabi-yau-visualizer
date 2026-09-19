# Projection / Slice Semantics Contract v0.01

Status: **THREAD 23 CONTRACT IMPLEMENTATION**

This contract consumes the sealed Thread 22 Gate 2-D concrete non-rendering schema and defines the first mathematically honest lower-dimensional browser view. It does not evaluate W, generate samples, render geometry, materialize sheets, claim a covering, or implement geometric zoom.

## 1. Canonical preflight

Thread 23-A0 revalidated the Gate 2-D seal before mutation:

- main commit: 05c646151a5ec882691d6cddc76cda0a74d76068
- tree: e66d0f5c654b02173f6ffa0bdb25231bc7bd4739
- sole parent: 0428982cb90bbcc0cbc97349f9fd65d8a2a5c9df
- Gate 2-C -> Gate 2-D: ahead 1, behind 0, total 1
- PR #29: merged by squash to the exact main commit
- PR-head Formal Verification #186 / 35422936354: success
- exact-main Formal Verification #187 / 35423117295: success
- exact-main Pages #22 / 35423116803: success
- Issue #16: closed / completed
- receipt comment: 5739567654

Canonical Gate 2-D blobs were exact:

- concrete-runtime-schema.js: 23cc1d78afa287162107a1b9e8742d74cbf09d0d
- data/system.v2.json: 0d598560134e45bd3ed2edec62120fa45649883c
- verify_concrete_runtime_schema_admission_v0_01.js: 39c925d93919615279165eabed027170f41f3f38
- .github/workflows/formal-verification.yml: e11db63a8582ef422e79b28832c7eec1ddc3219a

No Thread 23 branch or open projection/slice PR existed at preflight.

## 2. Repository archaeology

The repository had no geometric projection, geometric slice, geometric sample generator, mesh, contour, or point-cloud semantics module.

Existing nearby concepts are intentionally distinct:

1. structural-camera.js defines a presentation-only structural viewBox. Its scale is not geometric zoom.
2. Gate 2-D parameterDomain.runtimeRepresentation = real_slice applies only to lambda and kappa. It does not constrain z_1,...,z_4 to be real.
3. F14 LaurentImplicit proves neighborhood-scoped local regular-level chart statements. Those theorems do not define a global browser projection, a global parameterization, or arbitrary slice transversality.

Therefore Thread 23 adds a new independent semantic contract instead of reusing a presentation camera or promoting a local analytic theorem.

## 3. Mathematical source object

The admitted source object is

T = (C^x)^4,

W_kappa(z_1,z_2,z_3,z_4)
= z_1 + z_2 + z_3 + z_4 + kappa/(z_1 z_2 z_3 z_4),

X_0 = W_kappa^{-1}(lambda).

The schema v2 runtime currently represents lambda and kappa on a declared real slice of the complex parameter family. This does not change the complex ambient torus.

## 4. Dimension bookkeeping

The ambient torus has complex dimension 4.

Under the admitted regular-level hypotheses, X_0 has expected complex dimension 3 and expected real dimension 6.

The selected browser display has real dimension 2.

Consequently the browser display is necessarily lower-dimensional. It is not the full X_0.

The 3-complex / 6-real dimension statement is conditional on regular-level hypotheses. The projection contract does not promote smoothness, scheme smoothness, or slice transversality.

## 5. Candidate route comparison

### Route P: projection

**Chosen.**

It is globally defined on every torus point, gives an explicit complex-to-real map, requires no branch convention, and allows information loss and many-to-one ambiguity to be stated exactly.

### Route S: slice

**Deferred.**

A slice needs machine-defined fixed-coordinate constraints plus its own regularity/transversality audit. F14 local implicit-chart slices remain local and are not promoted to a global display slice.

### Route R: real-coordinate slice

**Not chosen.**

The parameter real_slice declaration does not imply z_i in R. A real locus can be empty or have different topology from the complex fiber.

### Route L: log-modulus / phase

**Deferred.**

Log modulus is possible but discards phase information. Phase/arg views additionally require periodicity and branch-cut display conventions. No such complexity is needed for the first honest view.

### Route Q: parameterization

**Deferred.**

No global parameterization theorem is admitted. Local F14 kernel parameterizations remain neighborhood-scoped.

### Route M: finite sample semantics

**Composed with Route P.**

A future renderer may consume an ordered finite validated subset of X_0. Thread 23 defines what such a sample means but does not implement sample generation.

## 6. Selected canonical view

Machine descriptor:

data/geometric-view.v1.json

View id:

x0_z1_complex_plane_sampled_projection_v1

The selected semantic map is

pi : X_0 -> R^2,
pi(z_1,z_2,z_3,z_4) = (Re(z_1), Im(z_1)).

The canonical browser label is:

Sampled projection of X_0 onto the z_1 complex plane

A rendered point will mean:

Each displayed point is (Re(z_1), Im(z_1)) for one validated finite sample z in X_0.

A rendered point will **not** mean:

- the full X_0;
- a unique point of X_0;
- a sheet;
- a covering fiber;
- a proof of topology;
- a self-intersection of X_0 when two projected points overlap;
- a source singularity merely because display points overlap.

## 7. Complex-to-real convention

The first source coordinate is z_1.

Display coordinates are ordered as:

x = Re(z_1)
y = Im(z_1)

No implicit complex-to-real coercion is permitted.

The selected map has:

- branch convention: none;
- periodicity convention: none;
- source coordinate order fixed by the admitted Torus4 coordinate order.

Coordinates z_2, z_3, z_4 are discarded by the projection.

No injectivity or reconstruction claim is made.

## 8. Slice semantics

The selected v0.01 view is **not a slice**.

Therefore:

- slice.kind = none;
- constraints = [];
- fixedCoordinates = [].

A future slice contract must separately state every fixed coordinate/value and must not infer transversality from smoothness of X_0 alone.

## 9. Sample semantics and determinism

The semantic sample class is:

ordered finite validated subset of X_0

Thread 23 does not implement a sample generator.

Under contract v0.01:

- randomness is not allowed;
- seed policy is not applicable;
- any future generation algorithm must be deterministic;
- any future numeric membership tolerance must be explicit and versioned;
- stable ordering must be specified by the future sampler;
- completeness is never claimed.

Thus Thread 23 determinism concerns the semantic mapping from a declared ordered finite X_0 sample to the declared R^2 projection. Numerical generation belongs to Thread 24 or a separately authorized dependency.

## 10. Projection ambiguity and information loss

Different points of X_0 may map to the same display point.

Therefore:

projection overlap != source self-intersection.

The projection keeps only z_1, represented exactly by its real and imaginary parts, and discards z_2,z_3,z_4.

No inverse or reconstruction map is admitted.

## 11. Artifact classification

Future display phenomena must be classified before geometric claims are made:

- source singularity: source geometry only if independently established;
- slice singularity: not applicable to the selected no-slice route;
- projection critical value: projection artifact unless independently lifted to a source statement;
- projection overlap: projection artifact;
- display occlusion/overdraw: presentation artifact;
- sampling artifact: sampling artifact;
- branch-cut artifact: not applicable because this route has no branch;
- numerical approximation artifact: numerical artifact.

Display discontinuity or overlap must not be relabeled as source geometry without separate evidence.

## 12. D^2 / D^4 freeze

D^2 compatibility metadata remains distinct from:

- display scale;
- projection scale;
- camera scale;
- geometric zoom.

D^4 compatibility metadata remains distinct from:

- visible component count;
- projection multiplicity;
- overlap count;
- materialized sheets;
- covering degree claims.

No view descriptor may promote D^2 or D^4 metadata into these meanings.

## 13. Truth flags

Thread 23 leaves all existing geometry truth flags false:

geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false

The existence of a view contract does not mean geometry has been rendered.

## 14. Required rejection cases

The verifier rejects descriptors that imply or encode:

- full X_0 rendering;
- projection injectivity;
- complete finite sampling;
- parameter real_slice -> ambient real locus;
- projection overlap -> source self-intersection;
- a branch convention for the selected branch-free Cartesian map;
- undefined complex-to-real coercion;
- ambiguous source/display coordinate order;
- hidden fixed-coordinate constraints;
- random or unspecified sampling determinism;
- implemented sampling in Thread 23;
- any true geometry/sheet/covering/geometric-zoom flag;
- any extra unrecognized semantic field, including attempted D^2/D^4 promotion.

## 15. Formal authority boundary

Thread 23 may cite:

- formal/SelfSimilarCY/Torus4.lean
- formal/SelfSimilarCY/LaurentW.lean
- formal/SelfSimilarCY/BaseFiber.lean
- formal/SelfSimilarCY/LaurentDifferential.lean
- formal/SelfSimilarCY/LaurentImplicit.lean

The last two support regularity/local implicit-chart facts only. They are not used as a global projection theorem.

No formal file is modified.

## 16. Protected implementation boundary

Thread 23 does not modify:

- README.md
- data/system.json
- data/system.v2.json
- scene-spec.js
- concrete-runtime-schema.js
- app.js
- base-renderer.js
- one-step-pullback.js
- recursive-lazy-expansion.js
- zoom-semantics.js
- sheet-branch-organization.js
- arithmetic-overlays.js
- structural-camera.js
- structural-visualization.js
- visual-provenance.js
- formal/*

No geometric-renderer.js, sampler.js, mesh.js, contour.js, or equivalent geometry-producing module is introduced.

## 17. Authorized Thread 24 inputs

After this contract is canonically sealed, Thread 24 may consume:

1. the exact schema v2 concrete X_0 definition;
2. data/geometric-view.v1.json;
3. an ordered finite validated sample subset of X_0 produced by a separately specified deterministic numeric policy;
4. the required sampled-projection UI wording.

Thread 24 still must implement and verify the actual numerical evaluation/sampling/rendering path before geometryRendered may become true.

## 18. Exit criterion

Thread 23 closes only if:

- projection/slice semantics are deterministic;
- the human and machine contracts agree;
- rejection tests pass;
- protected files remain byte-identical;
- historical runtime/formal regression remains green;
- PR-head CI passes;
- exact-main CI and Pages pass after squash merge.

Passing Thread 23 means only:

READY FOR THREAD 24 BASE GEOMETRIC RENDERER

It does not mean a renderer or geometric scene exists.

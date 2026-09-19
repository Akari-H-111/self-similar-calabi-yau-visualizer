# Concrete Geometry Admission Contract v0.01

**Thread 22 — Gate 2-A: Admission Claim Matrix / Contract Authoring**

Status: **AUTHORING CANDIDATE**

This contract records the current concrete-geometry authority stack after the sealed F08–F14 formal extension sequence. It does not itself admit a renderer, change `data/system.json`, mutate runtime truth flags, or enlarge any Lean theorem.

## 1. Canonical baseline

```text
main commit: 6c368a3083fa1b6e6ca7c016a362df12f06304ab
tree:        d62c4b3449aab09a6f0884e28cc8561777808278
sole parent: c64443eff3eae8853cbdcae972d7e6772c10f701
Formal Verification #178 / 35416828010: success
Pages #18 / 35416827465: success
```

Gate 2-A inherits the F14 theorem boundary exactly. F14 is a local analytic regular-level / implicit-function bridge at theorem level `F14-C + local kernel parametrization`; it is not a scheme-smoothness, finite-étale, map-degree, deck-action, or global smoothness seal.

## 2. Historical snapshot rule

The F05 bridge audit and v0.21 mathematical/visual fidelity artifacts remain historical snapshots. Their old statements were correct for their sealed revisions and MUST NOT be edited to pretend F08–F14 already existed.

Current authority is recorded in this contract and the companion machine-readable matrix:

```text
docs/CONCRETE_GEOMETRY_ADMISSION_CONTRACT_v0_01.md
docs/concrete_geometry_admission_matrix_v0_01.json
```

## 3. Authority layers

Every claim is evaluated independently at five layers:

```text
source authority
Lean authority
runtime representation
renderer representation
admission wording
```

A stronger lower layer never auto-promotes a later layer.

```text
source-backed != Lean-formalized
Lean-formalized != runtime implemented
runtime implemented != renderer implemented
```

## 4. Exact defining geometry

The admitted source definition is

```text
T = (C^×)^4
W_kappa(z1,z2,z3,z4) = z1+z2+z3+z4+kappa/(z1 z2 z3 z4)
X_0 = W_kappa^{-1}(lambda)
P_D(z1,z2,z3,z4) = (z1^D,z2^D,z3^D,z4^D)
X_n = (P_D^n)^{-1}(X_0) = V_T(f_(D^n))
```

The recovered v0.02 source identity used for the defining layer is:

```text
Arithmetic_Self_Similar_Calabi_Yau_v0_02.tex
SHA-256: 55d5305d4b0325b127ea2ae04ccc50c5126ae07b778ebd9106f61e5681404047
```

The v0.02 digest above is direct authority for the historical defining layer. The stationary `f_N` reformulation and identity `f_N(P_D z)=f_(DN)(z)` belong to the recovered final-closure lineage; Gate 2-A intentionally does not misattribute those statements to the v0.02 digest. Current Lean gives exact definitions/bridges for `Torus4`, torus coordinate power, `laurentW`, `baseFiber`, stationary family, and `concreteLevel`.

Runtime does not yet implement this concrete geometry: `data/system.json` still records `W.representation = unresolved`.

## 5. Parameter-domain contract

Source and Lean use complex parameters:

```text
lambda, kappa ∈ C
```

Current schema v1 accepts finite JavaScript numbers only. Gate 2 therefore classifies the present runtime as:

```text
runtimeParameterDomain = real_slice_of_complex_family
```

This is a compatibility restriction, not a redefinition of the mathematical family. In particular, the repository MUST NOT claim that the current runtime supports arbitrary complex `lambda` or `kappa`.

## 6. Smoothness / discriminant discipline

Source-level full smooth condition:

```text
kappa = 0
OR
lambda^5 != 5^5 kappa
```

Equivalent source singular condition:

```text
kappa != 0
AND
lambda^5 = 5^5 kappa
```

The principal regime `kappa != 0` and `lambda^5 != 5^5 kappa` is a working subregime, not the set of all smooth fibers.

Current Lean establishes:

```text
critical/discriminant criterion
no torus critical point at kappa = 0
nonzero and surjective total complex differential on the regular regime
local analytic level-set chart
local kernel parametrization
```

It does NOT establish `LEAN_SCHEME_SMOOTHNESS`. Therefore the allowed wording is source-level smoothness plus precisely named Lean bridge theorems. The forbidden wording is that F12/F13/F14 by themselves prove scheme-theoretic smoothness.

## 7. D^4 contract: five separate claims

Gate 2 MUST keep at least the following claims separate:

```text
D4_numeric_expression
D4_kernel_cardinality
D4_fiber_cardinality
D4_map_degree
D4_rendered_sheets
```

Current status:

| Claim | Status |
|---|---|
| runtime `D ** 4` | runtime numeric / organizational metadata |
| kernel cardinality `D^4` | Lean-formalized for `D != 0` |
| ambient torus fiber cardinality `D^4` | Lean-formalized for `D > 0` |
| algebraic map degree `D^4` | source-proved, not currently Lean-formalized |
| rendered `D^4` sheets | not admitted / false |

The formal source files themselves explicitly state that finite kernel/fiber cardinality is not an algebraic-geometric map-degree, finite-étale, or covering-degree theorem.

## 8. Finite étale / deck-group contract

Parent source authority includes finite-étale and deck-group results. Current Lean authority includes:

```text
ker(P_D) ≃ μ_D^4-like roots-of-unity product
surjectivity of positive-exponent torus coordinate power
finite ambient torus fibers
ambient fiber cardinality D^4
```

Current Lean does NOT establish the full restricted deck-action theorem or finite-étale scheme theorem. Therefore `coveringStructureClaimed` remains false.

## 9. D^2 / metric / zoom contract

Gate 2 keeps these separate:

```text
D2_numeric_expression
D2_log_metric_theorem
D_inverse_local_branch_scaling
cameraZoom
geometricZoomApplied
```

Current runtime computes `D ** 2`. Parent source proves the logarithmic metric theorem `P_D^* g_log = D^2 g_log`. Current Lean has no corresponding metric theorem. Camera transforms remain presentation-only.

`D_inverse_local_branch_scaling` is intentionally **UNRESOLVED / NOT ADMITTED** until an explicit source/formal/runtime representation bridge is established. It must not be inferred merely from the D^2 theorem.

## 10. Source-only global geometry

Connectedness and canonical triviality remain source-backed global claims. Connectedness carries an external Oka-type theorem dependency and that dependency must remain visible in provenance. Neither claim is required to admit a first non-covering level-set runtime representation.

The phrase `affine Calabi–Yau` is permitted only when its canonical-trivial convention and non-compact/non-projective scope are explicit.

## 11. Runtime representation contract for Gate 2-B

A future concrete `W` representation should not be a LaTeX string alone. The preferred minimum contract is:

```text
stable formulaId
+ structured machine-readable expression/AST
+ provenance claimId
```

Suggested semantic form:

```text
ambientKind = algebraic_torus
coordinateCount = 4
baseField = complex
nonzeroCoordinates = true
formulaId = W_kappa_torus4_v1
runtimeParameterDomain = real_slice_of_complex_family   # until complex schema exists
baseFiber.kind = laurent_level_set
baseFiber.definingFunction = W_kappa
baseFiber.level = lambda
```

This section is a design contract only. Gate 2-A does not modify `data/system.json`.

## 12. Truth-flag transition policy

The four current flags remain false.

| Flag | Minimum evidence required before transition |
|---|---|
| `geometryRendered` | admitted concrete W runtime representation + actual geometry sampler/renderer + provenance binding + geometry verifier |
| `sheetsMaterialized` | actual semantically defined preimage/sheet objects + precise definition of one sheet + sheet verifier |
| `coveringStructureClaimed` | admitted covering/finite-étale theorem layer + runtime covering object + semantic verifier + wording separating covering from visual grouping |
| `geometricZoomApplied` | actual geometric metric/scaling implementation + provenance + metric/scaling verifier |

Neither D^4 numeric metadata nor finite fiber cardinality is sufficient to flip a sheet/covering flag. Camera motion is never sufficient to flip `geometricZoomApplied`.

## 13. Renderer boundary

Gate 2-A authorizes no mesh, contour, point cloud, marching cubes, sheet renderer, fiber renderer, covering animation, torsion/collision overlay, or Three.js/WebGL geometry.

The required sequence remains:

```text
claim matrix
→ runtime schema contract
→ provenance / transition verifier
→ non-rendering runtime admission
→ geometry-renderer feasibility
→ renderer implementation last
```

## 14. README drift

The current README contains historical release statements that correctly describe v0.21/v1.0-rc1 but can be misread as the current formal scope, especially the old three-module Lean inventory and the sentence that the Lean layer does not define W.

This contract does not rewrite README in Gate 2-A. A later documentation synchronization step SHOULD add a clearly labeled current-formal-authority section while preserving historical release wording.

## 15. Gate 2-A exit condition

Gate 2-A passes only if:

```text
the companion JSON parses
all minimum claim classes are present
source / Lean / runtime / renderer statuses remain distinct
D^4 semantics remain split
D^2 / camera / geometric zoom remain split
smoothness layers remain split
historical snapshots remain untouched
data/system.json remains untouched
Lean sources remain untouched
truth flags remain false
renderer remains structural-only
```

Until those conditions are verified, this artifact remains an authoring candidate rather than a canonical admission seal.

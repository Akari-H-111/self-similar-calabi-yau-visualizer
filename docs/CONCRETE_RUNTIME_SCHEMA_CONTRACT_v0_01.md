# Concrete Runtime Schema Contract v0.01

**Thread 22 - Gate 2-B: Concrete Runtime Schema Contract**

Status: **CONTRACT CANDIDATE**

This artifact consumes the sealed Gate 2-A authority boundary and designs a future non-rendering concrete runtime schema. It does not modify the runtime schema, evaluate the Laurent function, admit geometry rendering, or enlarge any mathematical theorem.

## 1. Canonical preflight

Gate 2-B0 revalidated the exact Gate 2-A canonical baseline:

```text
main commit: d7bc212d51e9800aa743b06a58bf69b0267c8569
tree:        c36109db4df7adc5f52385ea98a981e183c7ed26
sole parent: 6c368a3083fa1b6e6ca7c016a362df12f06304ab
message:     docs: seal Gate 2-A concrete geometry admission contract
```

F14 to Gate 2-A remains exactly one commit ahead, zero behind.

Canonical Gate 2-A artifacts:

```text
docs/CONCRETE_GEOMETRY_ADMISSION_CONTRACT_v0_01.md
blob ff859e2fc1c1648bb189cd491ab27d04532e3b83

docs/concrete_geometry_admission_matrix_v0_01.json
blob a0462a88a1c0027d898374330af6b0e719b0b654
```

Canonical receipts:

```text
PR #26 merged by squash
merge SHA d7bc212d51e9800aa743b06a58bf69b0267c8569

Formal Verification #181
run 35418769387
success

Pages build and deployment #19
run 35418769114
success

Issue #16
OPEN
```

No Gate 2-B branch or PR existed at preflight.

## 2. Current schema archaeology

Current `data/system.json` is schema version 1 and stores:

```text
project/version
parameters: D, lambda, kappa
pullbackMap: kind, coordinateCount, exponentParameter
baseHypersurface: kind, definingFunction, levelParameter
request.requestedDepth
```

The current defining function is deliberately:

```text
symbol = W
representation = unresolved
```

`scene-spec.js` is a closed validator, not an extensible object validator. It requires exact keys, supports only schema version 1, requires finite JavaScript numbers for lambda and kappa, derives D^2 and D^4, and rejects every concrete W representation.

Therefore a concrete W contract is a breaking schema change. It must not be smuggled into v1.

## 3. Consumer and verifier impact

The normalized scene is consumed by the application and structural runtime layers. Most downstream consumers depend on stable values such as:

```text
parameters.D
parameters.lambda
parameters.kappa
derived.metricScale
derived.sheetDegree
request.requestedDepth
```

Historical verifiers are intentionally stricter. Many assert one or more of:

```text
schemaVersion = 1
W representation = unresolved
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
```

This split determines the migration strategy:

```text
legacy v1 fixtures stay v1 and keep their historical meaning
new concrete runtime schema uses v2
version dispatch must not reinterpret v1
```

## 4. Schema route comparison

### Route A - minimal named formula

Store an ambient descriptor, a stable formula identifier, parameter references, base level-set descriptor, and provenance binding.

Advantages:

```text
small instance shape
low migration cost
easy validation
```

Disadvantages:

```text
formula semantics can become opaque if the identifier has no normative registry
machine inspection depends too heavily on out-of-band code
```

### Route B - canonical AST

Store formulaId plus a complete expression AST.

Advantages:

```text
generic expression representation
high inspectability
future formula extensibility
```

Disadvantages:

```text
formulaId and AST become duplicated authority
consistency verification becomes mandatory
larger migration and validation surface
more opportunities for semantically equivalent but structurally different ASTs
```

### Route C - builtin mathematical-family contract

Store one stable formulaId whose semantics are fixed by a versioned builtin registry. The runtime instance does not store a second AST. A canonical AST may be derived from the registry.

Advantages:

```text
single stored formula identity
deterministic validation
no formulaId/AST drift
small runtime instance
renderer independent
future AST generation remains possible
```

Disadvantages:

```text
new formula families require registry entries
a future generic formula language may require another schema extension
```

**Chosen route: Route C.**

## 5. Parameter route

The source and Lean family use complex lambda and kappa. Current JavaScript runtime values are finite real numbers.

Gate 2-B chooses the conservative route:

```text
sourceField = complex
runtimeRepresentation = real_slice
embedding = real_to_complex
```

The runtime is not described as supporting arbitrary complex parameters.

An explicit complex-object representation such as `{re, im}` is deferred. It would enlarge parsing, validation, numeric, equality, serialization, and rendering obligations without being required for the next non-rendering runtime admission step.

## 6. Target schema version

The future concrete runtime target is:

```text
schemaVersion = 2
```

Reason:

```text
v1 exact-key guards reject new ambient/domain fields
v1 requires W.representation = unresolved
v1 rejects schemaVersion = 2
historical v1 tests intentionally assert the unresolved boundary
```

Version 2 is therefore a clean semantic boundary rather than an in-place reinterpretation.

## 7. Minimal target instance

The proposed stored shape is:

```json
{
  "schemaVersion": 2,
  "project": "Self-Similar Calabi–Yau Visualizer",
  "version": "v0.12",
  "mathematics": {
    "parameters": {
      "D": 2,
      "lambda": 1,
      "kappa": 1
    },
    "parameterDomain": {
      "appliesTo": [
        "lambda",
        "kappa"
      ],
      "sourceField": "complex",
      "runtimeRepresentation": "real_slice",
      "embedding": "real_to_complex"
    },
    "ambient": {
      "kind": "algebraic_torus",
      "coordinateCount": 4,
      "baseField": "complex"
    },
    "pullbackMap": {
      "kind": "coordinate_power",
      "exponentParameter": "D"
    },
    "baseHypersurface": {
      "kind": "level_set",
      "definingFunction": {
        "symbol": "W",
        "representation": {
          "kind": "builtin_formula",
          "formulaId": "W_kappa_torus4_v1",
          "coefficientParameter": "kappa"
        }
      },
      "levelParameter": "lambda"
    }
  },
  "request": {
    "requestedDepth": 0
  }
}
```

Two omissions are intentional.

First, `ambient.nonzeroCoordinates` is not stored. The schema definition of `kind = algebraic_torus` already implies nonzero coordinates.

Second, `pullbackMap.coordinateCount` is not stored in v2. It is derived from the unique ambient coordinate count. A normalized compatibility field may be exposed for old consumers.

## 8. Formula identity policy

The only stored machine formula identity is:

```text
formulaId = W_kappa_torus4_v1
```

Its versioned builtin registry meaning is exactly:

```text
ambient: algebraic_torus
coordinateCount: 4
coefficientParameter: kappa
semantic expansion:
sum_i(z_i) + kappa / product_i(z_i)
```

No canonical AST is stored in the runtime instance.

If a future evaluator or verifier wants an AST, it must derive it from this registry entry. The AST is therefore a derived representation, not a second source of authority.

The presentation symbol `W` is retained for UI compatibility but does not outrank `formulaId` as machine identity.

## 9. Ambient contract

The v2 stored ambient is:

```json
{
  "kind": "algebraic_torus",
  "coordinateCount": 4,
  "baseField": "complex"
}
```

Machine semantics:

```text
algebraic_torus => coordinates are nonzero
coordinateCount = 4
baseField = complex
```

This represents the mathematical ambient without claiming that a renderer has materialized torus geometry.

Provenance claim:

```text
ambient.torus4
```

## 10. Base fiber contract

The base hypersurface remains a general level-set object:

```text
kind = level_set
defining function = W_kappa_torus4_v1
levelParameter = lambda
```

It inherits the unique `mathematics.ambient` object rather than storing another ambient copy.

This is the runtime representation of the defining relation:

```text
X_0 = W_kappa^{-1}(lambda)
```

It is not a smoothness, connectedness, finite-etale, or rendering assertion.

## 11. Parameter regime policy

Regime truth is not mutable input.

The future `system.json` must not contain fields such as:

```json
{"smooth": true}
```

Source predicates may be evaluated later by a verifier as labelled evidence:

```text
principal:
kappa != 0 AND lambda^5 != 5^5*kappa

full source smooth regime:
kappa == 0 OR lambda^5 != 5^5*kappa

source singular regime:
kappa != 0 AND lambda^5 == 5^5*kappa
```

Generic JavaScript floating-point equality must not be promoted into theorem authority. Exact fixture evaluation may be recorded only as verifier-derived evidence.

## 12. Provenance binding

Gate 2-B does not copy the Gate 2-A matrix into every runtime instance.

Instead, provenance lives in the versioned schema-contract registry:

```text
/mathematics/ambient
  -> ambient.torus4

/mathematics/parameters/lambda
  -> parameter.lambda

/mathematics/parameters/kappa
  -> parameter.kappa

/mathematics/pullbackMap
  -> map.P_D

/mathematics/baseHypersurface/definingFunction
  -> function.W_kappa

/mathematics/baseHypersurface
  -> base.X0

formulaId W_kappa_torus4_v1
  -> function.W_kappa
```

Gate 2-C must verify that every referenced claim ID exists in the sealed Gate 2-A matrix.

A provenance reference is a traceability edge. It is not a proof.

## 13. Stored, derived, evidence, and forbidden fields

### Canonical stored input

```text
schemaVersion
project
version
parameters D/lambda/kappa
parameterDomain
ambient
pullbackMap
baseHypersurface
request.requestedDepth
```

### Derived

```text
ambient nonzero-coordinate property
pullback coordinate count
D^2 numeric metadata
D^4 numeric metadata
canonical W expression AST
```

### Verifier-derived evidence

```text
provenance resolution
source-regime membership
exact fixture regime checks
```

### Historical compatibility metadata

```text
derived.metricScale
derived.sheetDegree
```

Those names may remain normalized compatibility aliases, but their semantics stay historical:

```text
metricScale = D^2 numeric metadata only
sheetDegree = D^4 numeric/organizational metadata only
```

### Not allowed

```text
stored smooth theorem flag
stored algebraic map-degree theorem field inferred from D^4
stored rendered-sheet authority inferred from D^4
geometryRendered=true caused only by concrete schema
duplicate stored AST plus formulaId authority
```

## 14. Migration rule

Migration is explicit and one-way:

```text
schema v1 unresolved representation
      |
      | explicit v1 -> v2 migration
      v
schema v2 concrete non-rendering representation
```

The migrator preserves:

```text
project
version
D
lambda
kappa
requestedDepth
```

It adds:

```text
parameterDomain
ambient
builtin W representation
```

It replaces:

```text
representation = "unresolved"
```

with the builtin formula descriptor.

It removes stored `pullbackMap.coordinateCount` because that value is uniquely derived from the ambient. A normalized compatibility field may restore it for consumers.

Historical fixtures are never auto-migrated.

## 15. Validation contract

A future v2 validator must check at least:

```text
exact version-specific object keys
D safe integer >= 2
lambda and kappa finite JavaScript numbers
explicit real-slice declaration
ambient = complex algebraic torus with 4 coordinates
pullback kind = coordinate_power
exponent parameter reference = D
formula representation kind = builtin_formula
formulaId resolves to W_kappa_torus4_v1
formula registry agrees with ambient and coordinate count
coefficient parameter reference = kappa
level parameter reference = lambda
D^2 and D^4 derived values remain safe integers
all provenance claim IDs resolve in Gate 2-A
```

The validator must not claim:

```text
scheme smoothness
finite etaleness
algebraic map degree
deck action
geometry rendering
```

## 16. Consumer compatibility

The migration should keep normalized compatibility values for existing structural consumers:

```text
parameters.D
parameters.lambda
parameters.kappa
derived.metricScale
derived.sheetDegree
request.requestedDepth
```

A version-aware schema layer may additionally derive:

```text
pullbackMap.coordinateCount = ambient.coordinateCount
```

This minimizes future Gate 2-D changes while preserving the v2 single-source policy.

Historical verifiers remain pinned to v1. They are evidence about historical releases and must not be rewritten merely to make v2 look retroactive.

## 17. D^2 and D^4 semantic freeze

Concrete W representation does not promote either numeric expression.

```text
D^4 numeric metadata
!= kernel theorem
!= fiber theorem
!= algebraic map degree
!= rendered sheets
```

```text
D^2 numeric metadata
!= logarithmic metric theorem
!= inverse-branch scaling theorem
!= geometric zoom
```

The historical normalized aliases may remain available only with these semantics frozen.

## 18. Truth flags

Gate 2-B keeps the complete truth boundary frozen:

```text
geometryRendered = false
sheetsMaterialized = false
coveringStructureClaimed = false
geometricZoomApplied = false
```

A schema that can represent W is still only a representation contract.

## 19. Gate 2-C verifier specification

Gate 2-C must verify:

```text
Gate 2-A canonical SHA/tree/artifact blobs remain exact
Formal Verification #181 and Pages #19 receipts remain valid
Issue #16 remains open until the broader gate completes

proposal JSON parses
all required Gate 2-B contract sections exist
target schemaVersion = 2
v1 semantics remain frozen

formulaId resolves to exactly one builtin registry entry
registry agrees with Torus4 and coordinateCount=4
coefficient parameter kappa exists
level parameter lambda exists
runtime real-slice declaration is explicit
no full-complex runtime support is claimed

base fiber binds admitted W plus lambda
all provenance claim IDs exist in Gate 2-A

D^2/D^4 semantics remain unchanged
all four truth flags remain false
historical v1 fixtures remain reproducible
formal/runtime/renderer/README/historical snapshots remain unchanged
```

## 20. Explicit non-changes

Gate 2-B changes documentation contract artifacts only.

It does not modify:

```text
formal/*
data/system.json
scene-spec.js
app.js
base-renderer.js
one-step-pullback.js
recursive-lazy-expansion.js
zoom-semantics.js
sheet-branch-organization.js
arithmetic-overlays.js
structural-camera.js
README.md
historical F05 audit
historical v0.21 provenance snapshot
```

It does not implement schema v2 in runtime.

It does not evaluate W.

It does not implement Gate 2-D.

It does not implement any renderer.

## 21. Gate 2-B verdict

```text
READY FOR SCHEMA VERIFIER
```

The next legal milestone is:

```text
Gate 2-C - Provenance / Schema Verification Contract
```

Gate 2-C must verify this proposal before any non-rendering runtime admission is implemented.

The controlling separation remains:

```text
representation
!= mathematical authority
!= visual realization
```

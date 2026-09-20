# Formal module status

This is the current, source-derived map of the Lean project. It is a navigation and claim-boundary document: it does not alter the sealed proofs, historical F01–F04 narratives, `lean-toolchain`, or `lake-manifest.json`.

The aggregate entry point is `SelfSimilarCY.lean`. A theorem is formalized only to the exact statement in the corresponding module. “Current source” below means the module is imported by that aggregate entry point on current `main`; it does not turn a runtime behavior, source result, or visualization convention into a Lean theorem.

| Module | Direct imports | Purpose and principal definitions/theorems | Source authority | Status / known boundary |
| --- | --- | --- | --- | --- |
| `Basic` | `Mathlib` | Pinned environment bootstrap. | Lean + pinned mathlib. | Current source; no project mathematics beyond the bootstrap. |
| `CoordinatePower` | `Basic` | `Point4`; `coordinatePower`; coordinate formula and uniqueness. | Lean source. | Formalized ambient coordinate-power definition. No torus, degree, or geometry claim. |
| `CoordinatePowerIteration` | `CoordinatePower` | Iterate-coordinate and iterate-map equalities. | Lean source. | Formalized iteration identity. It does not imply that the runtime builds the combined map. |
| `PullbackTower` | `CoordinatePowerIteration` | Set-theoretic `pullbackTower`; zero, successor, iterate-preimage, and combined-power-preimage equalities. | Lean source. | Formalized abstract set recurrence. Not a rendered or finite geometric tower. |
| `Torus4` | `CoordinatePower` | `Torus4`; embedding into `Point4`; nonzero coordinates; injectivity. | Lean source. | Formalized representation bridge, not a global geometric model. |
| `TorusCoordinatePower` | `Torus4` | Coordinate power restricted to `Torus4`; compatibility with the ambient map. | Lean source. | Formalized function and compatibility only. |
| `LaurentW` | `Torus4` | Four-coordinate Laurent expression and source-formula equality. | Lean source. | Formalized expression on `Torus4`; no global hypersurface claim. |
| `BaseFiber` | `LaurentW` | `baseFiber`; membership and preimage-singleton characterization. | Lean source. | Formalized set definition. No smoothness, connectedness, or Calabi–Yau claim. |
| `StationaryFamily` | `TorusCoordinatePower`, `BaseFiber` | Stationary Laurent member and power-map identity. | Lean source. | Formalized family identity; no finite/étale/degree claim. |
| `ConcretePullbackTower` | `StationaryFamily` | `concreteLevel`; zero-level and successor inverse-image identities. | Lean source. | Formalized set-theoretic recurrence. Explicitly not finiteness, covering, étaleness, or degree. |
| `TorusPowerKernel` | `TorusCoordinatePower`, mathlib roots of unity | Power monoid homomorphism, kernel equivalence, finite kernel and `D ^ 4` cardinality for nonzero `D`. | Lean source + pinned mathlib roots-of-unity result. | Formalized finite-set cardinality, not algebraic-geometric map degree or finite étaleness. |
| `TorusPowerFibers` | `TorusPowerKernel`, mathlib complex powers | Fiber/kernel equivalence, chosen root, surjectivity for positive `D`, finite fibers and `D ^ 4` fiber cardinality. | Lean source + pinned mathlib complex-power result. | Formalized ambient torus fiber cardinality, not sheets, covering degree, deck action, or finite étale structure. |
| `LaurentCritical` | `BaseFiber` | Coordinate slices/derivatives, critical predicate, diagonal and discriminant characterizations, no critical point on the base fiber. | Lean source. | Formalized critical algebra within its stated torus/parameter hypotheses. Not global algebraic-geometric smoothness. |
| `LaurentDifferential` | `LaurentCritical` | Ambient Laurent extension, total Fréchet differential, critical-equivalence, nonzero/surjective differential in the regular regime. | Lean source. | Formalized differential bridge. Not a scheme-theoretic Jacobian criterion. |
| `LaurentImplicit` | `LaurentDifferential`, mathlib implicit-function API | C¹/strict derivative bridge, local implicit chart, ambient-torus bridge, neighborhood-scoped regular-level reconstruction. | Lean source + pinned mathlib implicit-function API. | Formalized local analytic implicit-function statements only; no global equality, global smoothness, finite étale, canonical triviality, or Oka connectedness theorem. |

## Authority and status ledger

| Class | Current status | Examples |
| --- | --- | --- |
| **FORMALIZED** | Exact statements in the modules above compile under the pinned environment. | Coordinate-power iteration, set-theoretic pullback identities, torus-fiber cardinality, critical/differential identities, local implicit charts. |
| **SOURCE-PROVED BUT NOT FORMALIZED HERE** | May be supported by cited mathematical sources or contracts, but is not promoted to Lean authority by this repository map. | Any source-level finite-étale/deck-action discussion not present as an exact Lean theorem. |
| **EXTERNAL-THEOREM DEPENDENT** | Requires a separately stated and checked external result. | Oka-type connectedness or any imported global complex-geometric theorem. |
| **DEFERRED / NOT CLAIMED** | Deliberately outside the current formal scope. | Full algebraic-geometric smoothness, global finite étaleness, canonical triviality, full global hypersurface and visualization correctness. |

## Reproduce the formal gate

From this directory:

```bash
lake build
lake env lean SelfSimilarCY.lean
rg -nE '(^|[^[:alnum:]_])(axiom|sorry|admit)([^[:alnum:]_]|$)' SelfSimilarCY --glob '*.lean'
```

The last command is a source review aid: any match requires inspection. Project proof sources must not use `axiom`, `sorry`, or `admit` as a closure mechanism. Do not run `lake update`; the toolchain and dependency lock are part of the reproducible formal authority.

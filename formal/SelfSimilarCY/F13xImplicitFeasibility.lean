import SelfSimilarCY.LaurentDifferential
import Mathlib.Analysis.Calculus.Implicit

namespace SelfSimilarCY

open scoped BigOperators

/--
F13x feasibility helper: the ambient Laurent function is C¹ at every torus point.

This file is an archaeology/feasibility probe only. It is deliberately not imported by
`SelfSimilarCY.lean` and must not be interpreted as a canonical F14 theorem seal.
-/
theorem f13x_contDiffAt_laurentWPoint_toPoint4
    (κ : ℂ) (z : Torus4) :
    ContDiffAt ℂ 1 (laurentWPoint κ) z.toPoint4 := by
  have hprod : (∏ i, z.toPoint4 i) ≠ 0 := by
    exact Finset.prod_ne_zero_iff.mpr fun i _ => z.toPoint4_ne_zero i
  unfold laurentWPoint
  fun_prop

/--
F13x feasibility helper: upgrade the C¹ statement to the strict Fréchet derivative expected by
the pinned implicit-function API, keeping the derivative definition exactly equal to F13's
`laurentTotalDifferential`.
-/
theorem f13x_hasStrictFDerivAt_laurentWPoint_toPoint4
    (κ : ℂ) (z : Torus4) :
    HasStrictFDerivAt
      (laurentWPoint κ)
      (laurentTotalDifferential κ z)
      z.toPoint4 := by
  simpa [laurentTotalDifferential] using
    (f13x_contDiffAt_laurentWPoint_toPoint4 κ z).hasStrictFDerivAt (by simp)

/--
F13x representation bridge only: convert the already-proved functional surjectivity statement
into the range-equals-top form required by the pinned finite-dimensional implicit-function API.
-/
theorem f13x_totalDifferential_range_eq_top
    {κ : ℂ} {z : Torus4}
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    (laurentTotalDifferential κ z).range = ⊤ := by
  exact LinearMap.range_eq_top.mpr h

/--
F13x feasibility object: instantiate the pinned finite-dimensional implicit-function construction
for the ambient Laurent map at a point whose F13 total differential is surjective.

This is not a regular-value theorem, not a submanifold theorem, and not a smoothness seal.
-/
noncomputable def f13xImplicitFunction
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    ℂ → (laurentTotalDifferential κ z).ker → Point4 :=
  (f13x_hasStrictFDerivAt_laurentWPoint_toPoint4 κ z).implicitFunction
    (laurentWPoint κ)
    (laurentTotalDifferential κ z)
    (f13x_totalDifferential_range_eq_top h)

/--
F13x feasibility object: the corresponding local open partial homeomorphism supplied by pinned
mathlib. This witnesses that the ambient-kernel IFT route is API-real, without promoting the result
into canonical F14 semantics.
-/
noncomputable def f13xImplicitToOpenPartialHomeomorph
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    OpenPartialHomeomorph
      Point4
      (ℂ × (laurentTotalDifferential κ z).ker) :=
  (f13x_hasStrictFDerivAt_laurentWPoint_toPoint4 κ z).implicitToOpenPartialHomeomorph
    (laurentWPoint κ)
    (laurentTotalDifferential κ z)
    (f13x_totalDifferential_range_eq_top h)

end SelfSimilarCY

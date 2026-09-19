import SelfSimilarCY.LaurentDifferential
import Mathlib.Analysis.Calculus.Implicit

namespace SelfSimilarCY

open scoped BigOperators

/--
The ambient Laurent function is C¹ at every point coming from the concrete torus.

This is the minimum regularity bridge needed for the pinned finite-dimensional
implicit-function API. It makes no regular-level, submanifold, or scheme-smoothness claim.
-/
theorem laurentWPoint_contDiffAt
    (κ : ℂ) (z : Torus4) :
    ContDiffAt ℂ 1 (laurentWPoint κ) z.toPoint4 := by
  have hprod : (∏ i, z.toPoint4 i) ≠ 0 := by
    exact Finset.prod_ne_zero_iff.mpr fun i _ => z.toPoint4_ne_zero i
  unfold laurentWPoint
  fun_prop

/--
Strict Fréchet differentiability of the ambient Laurent function at a torus point,
using exactly the sealed F13 differential `laurentTotalDifferential`.
-/
theorem laurentWPoint_hasStrictFDerivAt
    (κ : ℂ) (z : Torus4) :
    HasStrictFDerivAt
      (laurentWPoint κ)
      (laurentTotalDifferential κ z)
      z.toPoint4 := by
  simpa [laurentTotalDifferential] using
    (laurentWPoint_contDiffAt κ z).hasStrictFDerivAt (by simp)

/--
Convert the sealed F13 functional surjectivity statement into the range-equals-top
form required by the pinned finite-dimensional implicit-function API.
-/
theorem laurentTotalDifferential_range_eq_top
    {κ : ℂ} {z : Torus4}
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    (laurentTotalDifferential κ z).range = ⊤ := by
  exact LinearMap.range_eq_top.mpr h

/--
The pinned implicit function associated to the ambient Laurent map at a torus point
with surjective sealed F13 differential.
-/
noncomputable def laurentImplicitFunction
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    ℂ → (laurentTotalDifferential κ z).ker → Point4 :=
  (laurentWPoint_hasStrictFDerivAt κ z).implicitFunction
    (laurentWPoint κ)
    (laurentTotalDifferential κ z)
    (laurentTotalDifferential_range_eq_top h)

/--
The local open partial homeomorphism supplied by pinned mathlib:
`Point4 ↔ ℂ × ker(dW_z)`.

At this stage this is only the analytic chart object. Local identification with
`baseFiber` is intentionally deferred to the next pass.
-/
noncomputable def laurentImplicitChart
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    OpenPartialHomeomorph
      Point4
      (ℂ × (laurentTotalDifferential κ z).ker) :=
  (laurentWPoint_hasStrictFDerivAt κ z).implicitToOpenPartialHomeomorph
    (laurentWPoint κ)
    (laurentTotalDifferential κ z)
    (laurentTotalDifferential_range_eq_top h)

/-- The first chart coordinate is exactly the ambient Laurent value. -/
@[simp]
theorem laurentImplicitChart_fst
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z))
    (x : Point4) :
    (laurentImplicitChart κ z h x).fst = laurentWPoint κ x := by
  simp [laurentImplicitChart]

/-- The torus base point belongs to the source of the implicit chart. -/
theorem laurentImplicitChart_base_mem_source
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    z.toPoint4 ∈ (laurentImplicitChart κ z h).source := by
  exact
    (laurentWPoint_hasStrictFDerivAt κ z).mem_implicitToOpenPartialHomeomorph_source
      (laurentTotalDifferential_range_eq_top h)

/-- The chart target contains the canonical base pair `(Wκ(z), 0)`. -/
theorem laurentImplicitChart_base_mem_target
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    (laurentWPoint κ z.toPoint4, (0 : (laurentTotalDifferential κ z).ker)) ∈
      (laurentImplicitChart κ z h).target := by
  exact
    (laurentWPoint_hasStrictFDerivAt κ z).mem_implicitToOpenPartialHomeomorph_target
      (laurentTotalDifferential_range_eq_top h)

/-- The implicit chart sends the base point to `(Wκ(z), 0)`. -/
@[simp]
theorem laurentImplicitChart_apply_base
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    laurentImplicitChart κ z h z.toPoint4 =
      (laurentWPoint κ z.toPoint4, (0 : (laurentTotalDifferential κ z).ker)) := by
  simp [laurentImplicitChart]

/-- The pinned implicit function sends the canonical base pair back to the torus base point. -/
@[simp]
theorem laurentImplicitFunction_apply_base
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    laurentImplicitFunction κ z h (laurentWPoint κ z.toPoint4)
      (0 : (laurentTotalDifferential κ z).ker) = z.toPoint4 := by
  simp [laurentImplicitFunction]

end SelfSimilarCY

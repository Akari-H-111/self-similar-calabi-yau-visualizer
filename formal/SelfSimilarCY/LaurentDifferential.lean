import SelfSimilarCY.LaurentCritical

namespace SelfSimilarCY

open scoped BigOperators

/--
The Laurent expression extended from the concrete torus to the ambient complex
coordinate space `Point4 = Fin 4 → ℂ`.

This is a derived analytic bridge.  It is intentionally defined on all of
`Point4`; differentiability statements below are made only at points coming
from `Torus4`, where every coordinate product is nonzero.
-/
noncomputable def laurentWPoint (κ : ℂ) (x : Point4) : ℂ :=
  (∑ i, x i) + κ / (∏ i, x i)

/-- On a torus point, the ambient Laurent expression is exactly the sealed `laurentW`. -/
@[simp]
theorem laurentWPoint_toPoint4 (κ : ℂ) (z : Torus4) :
    laurentWPoint κ z.toPoint4 = laurentW κ z := by
  rfl

private theorem pointProduct_ne_zero (z : Torus4) :
    (∏ i, z.toPoint4 i) ≠ 0 := by
  exact Finset.prod_ne_zero_iff.mpr fun i _ => z.toPoint4_ne_zero i

/--
The ambient Laurent expression is complex Fréchet differentiable at every point
coming from `Torus4`.
-/
theorem differentiableAt_laurentWPoint_toPoint4 (κ : ℂ) (z : Torus4) :
    DifferentiableAt ℂ (laurentWPoint κ) z.toPoint4 := by
  have hsum :
      DifferentiableAt ℂ (fun x : Point4 => ∑ i, x i) z.toPoint4 := by
    fun_prop
  have hprod :
      DifferentiableAt ℂ (fun x : Point4 => ∏ i, x i) z.toPoint4 := by
    fun_prop
  have hinv :
      DifferentiableAt ℂ (fun x : Point4 => (∏ i, x i)⁻¹) z.toPoint4 :=
    hprod.inv (pointProduct_ne_zero z)
  have hscaled :
      DifferentiableAt ℂ
        (fun x : Point4 => κ * (∏ i, x i)⁻¹)
        z.toPoint4 :=
    hinv.const_mul κ
  simpa [laurentWPoint, div_eq_mul_inv] using hsum.add hscaled

/--
The genuine total complex Fréchet derivative of the ambient Laurent expression
at the point underlying `z : Torus4`.
-/
noncomputable def laurentTotalDifferential (κ : ℂ) (z : Torus4) :
    Point4 →L[ℂ] ℂ :=
  fderiv ℂ (laurentWPoint κ) z.toPoint4

/-- The bundled total differential is the actual Fréchet derivative. -/
theorem hasFDerivAt_laurentWPoint_toPoint4 (κ : ℂ) (z : Torus4) :
    HasFDerivAt
      (laurentWPoint κ)
      (laurentTotalDifferential κ z)
      z.toPoint4 := by
  exact (differentiableAt_laurentWPoint_toPoint4 κ z).hasFDerivAt

/--
Replacing one ambient coordinate in `laurentWPoint` gives exactly the sealed
one-variable Laurent slice from F12.
-/
theorem laurentWPoint_update_eq_coordinateSlice
    (κ : ℂ) (z : Torus4) (i : Fin 4) (t : ℂ) :
    laurentWPoint κ (Function.update z.toPoint4 i t) =
      laurentCoordinateSlice κ z i t := by
  unfold laurentWPoint laurentCoordinateSlice laurentComplementSum
    laurentComplementProduct
  rw [Finset.sum_update_of_mem (Finset.mem_univ i)]
  rw [Finset.prod_update_of_mem (Finset.mem_univ i)]
  simp [Torus4.toPoint4]

/--
The total Fréchet derivative evaluated on the `i`-th standard basis direction
is exactly the genuine F12 coordinate derivative value.
-/
theorem laurentTotalDifferential_apply_single
    (κ : ℂ) (z : Torus4) (i : Fin 4) :
    laurentTotalDifferential κ z (Pi.single i (1 : ℂ)) =
      laurentCoordinateDerivativeValue κ z i := by
  have hcomp :
      HasDerivAt
        (fun t : ℂ => laurentWPoint κ (Function.update z.toPoint4 i t))
        (laurentTotalDifferential κ z (Pi.single i (1 : ℂ)))
        (z i : ℂ) := by
    simpa using
      (hasFDerivAt_laurentWPoint_toPoint4 κ z).comp_hasDerivAt
        (z i : ℂ) (hasDerivAt_update z.toPoint4 i (z i : ℂ))
  have hcomp' :
      HasDerivAt
        (laurentCoordinateSlice κ z i)
        (laurentTotalDifferential κ z (Pi.single i (1 : ℂ)))
        (z i : ℂ) := by
    simpa [laurentWPoint_update_eq_coordinateSlice κ z i] using hcomp
  exact hcomp'.unique (hasDerivAt_laurentCoordinateSlice κ z i)

/--
F12's coordinate critical predicate is equivalent to vanishing of the genuine
total complex Fréchet derivative.

This is the semantic bridge from coordinate partial derivatives to a total
differential.  It is not a scheme-theoretic Jacobian criterion.
-/
theorem isLaurentCritical_iff_totalDifferential_eq_zero
    (κ : ℂ) (z : Torus4) :
    IsLaurentCritical κ z ↔ laurentTotalDifferential κ z = 0 := by
  constructor
  · intro hcrit
    ext v
    have hv : v = ∑ i, v i • Pi.single i (1 : ℂ) := by
      funext j
      simp
    rw [hv]
    simp [laurentTotalDifferential_apply_single, hcrit]
  · intro hzero i
    have hi :=
      congrArg
        (fun L : Point4 →L[ℂ] ℂ => L (Pi.single i (1 : ℂ)))
        hzero
    simpa [laurentTotalDifferential_apply_single] using hi

/--
Principal discriminant-complement regime: the genuine total complex
differential is nonzero at every point of the base fiber.

No extra assumption `κ ≠ 0` is required.
-/
theorem laurentTotalDifferential_ne_zero_on_baseFiber
    {κ lambda : ℂ} {z : Torus4}
    (hz : z ∈ baseFiber κ lambda)
    (hdisc : lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ) :
    laurentTotalDifferential κ z ≠ 0 := by
  intro hzero
  have hcrit : IsLaurentCritical κ z :=
    (isLaurentCritical_iff_totalDifferential_eq_zero κ z).2 hzero
  exact noCriticalPointOnBaseFiber hdisc ⟨z, hz, hcrit⟩

/-- The `κ = 0` model has nonzero total differential at every torus point. -/
theorem laurentTotalDifferential_ne_zero_zero (z : Torus4) :
    laurentTotalDifferential 0 z ≠ 0 := by
  intro hzero
  exact no_laurentCritical_zero z
    ((isLaurentCritical_iff_totalDifferential_eq_zero 0 z).2 hzero)

/--
Full source-compatible regularity regime at the differential level:
`κ = 0` or failure of the discriminant equation implies nonvanishing of the
total differential on the base fiber.
-/
theorem laurentTotalDifferential_ne_zero_on_baseFiber_of_regular_regime
    {κ lambda : ℂ} {z : Torus4}
    (hz : z ∈ baseFiber κ lambda)
    (hreg : κ = 0 ∨ lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ) :
    laurentTotalDifferential κ z ≠ 0 := by
  rcases hreg with rfl | hdisc
  · exact laurentTotalDifferential_ne_zero_zero z
  · exact laurentTotalDifferential_ne_zero_on_baseFiber hz hdisc

private theorem continuousLinearMap_to_complex_surjective_of_ne_zero
    (L : Point4 →L[ℂ] ℂ) (hL : L ≠ 0) :
    Function.Surjective L := by
  have hex : ∃ v : Point4, L v ≠ 0 := by
    by_contra h
    push_neg at h
    apply hL
    ext v
    simpa using h v
  obtain ⟨v, hv⟩ := hex
  intro y
  refine ⟨(y / L v) • v, ?_⟩
  simp [hv]

/--
A nonzero total complex differential `Point4 →L[ℂ] ℂ` is surjective.
-/
theorem laurentTotalDifferential_surjective_of_ne_zero
    {κ : ℂ} {z : Torus4}
    (h : laurentTotalDifferential κ z ≠ 0) :
    Function.Surjective (laurentTotalDifferential κ z) :=
  continuousLinearMap_to_complex_surjective_of_ne_zero
    (laurentTotalDifferential κ z) h

/--
Principal discriminant-complement regime: the total complex differential is
surjective at every point of the base fiber.
-/
theorem laurentTotalDifferential_surjective_on_baseFiber
    {κ lambda : ℂ} {z : Torus4}
    (hz : z ∈ baseFiber κ lambda)
    (hdisc : lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ) :
    Function.Surjective (laurentTotalDifferential κ z) :=
  laurentTotalDifferential_surjective_of_ne_zero
    (laurentTotalDifferential_ne_zero_on_baseFiber hz hdisc)

/--
Full source-compatible regularity regime: the total complex differential is
surjective at every point of the base fiber.

This theorem deliberately stops at differential regularity.  It does not claim
a manifold regular-value theorem, a smooth submanifold theorem, or
scheme-theoretic smoothness.
-/
theorem laurentTotalDifferential_surjective_on_baseFiber_of_regular_regime
    {κ lambda : ℂ} {z : Torus4}
    (hz : z ∈ baseFiber κ lambda)
    (hreg : κ = 0 ∨ lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ) :
    Function.Surjective (laurentTotalDifferential κ z) :=
  laurentTotalDifferential_surjective_of_ne_zero
    (laurentTotalDifferential_ne_zero_on_baseFiber_of_regular_regime hz hreg)

end SelfSimilarCY

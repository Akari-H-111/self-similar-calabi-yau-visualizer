import SelfSimilarCY.BaseFiber

namespace SelfSimilarCY

open scoped BigOperators

/--
The product of the three torus coordinates other than `i`.
This is a derived helper used to expose the one-coordinate Laurent slice.
-/
def laurentComplementProduct (z : Torus4) (i : Fin 4) : ℂ :=
  ∏ j ∈ Finset.univ.erase i, (z j : ℂ)

/-- The sum of the three torus coordinates other than `i`. -/
def laurentComplementSum (z : Torus4) (i : Fin 4) : ℂ :=
  ∑ j ∈ Finset.univ.erase i, (z j : ℂ)

/--
Freeze the three coordinates other than `i` and regard the source Laurent
formula as a one-variable complex function.

This auxiliary function is defined on all of `ℂ`; the torus point itself
supplies a nonzero evaluation point.  It is used only as the analytic bridge
for the coordinate partial derivative.
-/
noncomputable def laurentCoordinateSlice (κ : ℂ) (z : Torus4) (i : Fin 4) (t : ℂ) : ℂ :=
  t + laurentComplementSum z i +
    κ * (t * laurentComplementProduct z i)⁻¹

/--
The derivative value produced directly by the one-variable derivative API.
A later theorem rewrites it into the source formula
`1 - κ / (z_i * ∏_j z_j)`.
-/
noncomputable def laurentCoordinateDerivativeValue
    (κ : ℂ) (z : Torus4) (i : Fin 4) : ℂ :=
  1 + κ *
    (-(laurentComplementProduct z i) /
      (((z i : ℂ) * laurentComplementProduct z i) ^ 2))

/--
The algebraic critical predicate is defined by the local coordinate equations,
not by the later diagonal normal form.
-/
def IsLaurentCritical (κ : ℂ) (z : Torus4) : Prop :=
  ∀ i : Fin 4, laurentCoordinateDerivativeValue κ z i = 0

private theorem laurentComplementProduct_ne_zero
    (z : Torus4) (i : Fin 4) :
    laurentComplementProduct z i ≠ 0 := by
  unfold laurentComplementProduct
  exact Finset.prod_ne_zero_iff.mpr fun j _ => (z j).ne_zero

/--
At the original torus coordinate, the frozen-coordinate slice has the same
value as the sealed `laurentW`.
-/
theorem laurentCoordinateSlice_at_coordinate
    (κ : ℂ) (z : Torus4) (i : Fin 4) :
    laurentCoordinateSlice κ z i (z i : ℂ) = laurentW κ z := by
  have hsum :=
    Finset.sum_erase_add Finset.univ (fun j : Fin 4 => (z j : ℂ))
      (Finset.mem_univ i)
  have hprod :=
    Finset.prod_erase_mul Finset.univ (fun j : Fin 4 => (z j : ℂ))
      (Finset.mem_univ i)
  rw [laurentW_apply]
  unfold laurentCoordinateSlice laurentComplementSum laurentComplementProduct
  rw [← hsum, ← hprod]
  simp only [div_eq_mul_inv]
  ring

/--
Pinned-mathlib analytic bridge: the one-coordinate Laurent slice has the
expected genuine complex derivative at the torus coordinate.
-/
theorem hasDerivAt_laurentCoordinateSlice
    (κ : ℂ) (z : Torus4) (i : Fin 4) :
    HasDerivAt
      (laurentCoordinateSlice κ z i)
      (laurentCoordinateDerivativeValue κ z i)
      (z i : ℂ) := by
  have hP : laurentComplementProduct z i ≠ 0 :=
    laurentComplementProduct_ne_zero z i
  have hzi : (z i : ℂ) ≠ 0 := (z i).ne_zero
  have hden :
      (z i : ℂ) * laurentComplementProduct z i ≠ 0 :=
    mul_ne_zero hzi hP
  have hlinear :
      HasDerivAt
        (fun t : ℂ => t + laurentComplementSum z i)
        1
        (z i : ℂ) :=
    (hasDerivAt_id' (x := (z i : ℂ))).add_const
      (laurentComplementSum z i)
  have hmul :
      HasDerivAt
        (fun t : ℂ => t * laurentComplementProduct z i)
        (laurentComplementProduct z i)
        (z i : ℂ) :=
    hasDerivAt_mul_const (x := (z i : ℂ))
      (laurentComplementProduct z i)
  have hinvRaw :
      HasDerivAt
        ((fun y : ℂ => y⁻¹) ∘
          (fun t : ℂ => t * laurentComplementProduct z i))
        (-( ((z i : ℂ) * laurentComplementProduct z i) ^ 2)⁻¹ *
          laurentComplementProduct z i)
        (z i : ℂ) :=
    HasDerivAt.comp (𝕜 := ℂ) (z i : ℂ)
      (hasDerivAt_inv hden) hmul
  have hinv :
      HasDerivAt
        (fun t : ℂ => (t * laurentComplementProduct z i)⁻¹)
        (-(laurentComplementProduct z i) /
          (((z i : ℂ) * laurentComplementProduct z i) ^ 2))
        (z i : ℂ) := by
    convert hinvRaw using 1
    · field_simp [hden]
      ring
  have hscale :
      HasDerivAt
        (fun y : ℂ => κ * y)
        κ
        (((z i : ℂ) * laurentComplementProduct z i)⁻¹) :=
    hasDerivAt_const_mul (x :=
      (((z i : ℂ) * laurentComplementProduct z i)⁻¹)) κ
  have hreciprocal :
      HasDerivAt
        (fun t : ℂ =>
          κ * (t * laurentComplementProduct z i)⁻¹)
        (κ *
          (-(laurentComplementProduct z i) /
            (((z i : ℂ) * laurentComplementProduct z i) ^ 2)))
        (z i : ℂ) := by
    simpa only [Function.comp_apply] using
      HasDerivAt.comp (𝕜 := ℂ) (z i : ℂ) hscale hinv
  change HasDerivAt
    (fun t : ℂ =>
      (t + laurentComplementSum z i) +
        κ * (t * laurentComplementProduct z i)⁻¹)
    (1 + κ *
      (-(laurentComplementProduct z i) /
        (((z i : ℂ) * laurentComplementProduct z i) ^ 2)))
    (z i : ℂ)
  exact hlinear.add hreciprocal

/--
The genuine one-coordinate derivative is algebraically identical to the
canonical source critical equation.
-/
theorem laurentCoordinateDerivativeValue_eq_source_formula
    (κ : ℂ) (z : Torus4) (i : Fin 4) :
    laurentCoordinateDerivativeValue κ z i =
      1 - κ / ((z i : ℂ) * (∏ j, (z j : ℂ))) := by
  have hP : laurentComplementProduct z i ≠ 0 :=
    laurentComplementProduct_ne_zero z i
  have hzi : (z i : ℂ) ≠ 0 := (z i).ne_zero
  have hprod :=
    Finset.prod_erase_mul Finset.univ (fun j : Fin 4 => (z j : ℂ))
      (Finset.mem_univ i)
  unfold laurentCoordinateDerivativeValue laurentComplementProduct at *
  rw [← hprod]
  field_simp [hzi, hP]
  ring

/--
Equivalent source-form critical equation in every coordinate.
-/
theorem isLaurentCritical_iff_source_equations
    (κ : ℂ) (z : Torus4) :
    IsLaurentCritical κ z ↔
      ∀ i : Fin 4,
        1 - κ / ((z i : ℂ) * (∏ j, (z j : ℂ))) = 0 := by
  unfold IsLaurentCritical
  constructor
  · intro h i
    simpa [laurentCoordinateDerivativeValue_eq_source_formula κ z i] using h i
  · intro h i
    rw [laurentCoordinateDerivativeValue_eq_source_formula]
    exact h i

/--
Each critical coordinate satisfies the common product equation
`z_i * ∏_j z_j = κ`.
-/
theorem isLaurentCritical_coordinate_product_eq
    {κ : ℂ} {z : Torus4}
    (hcrit : IsLaurentCritical κ z) (i : Fin 4) :
    (z i : ℂ) * (∏ j, (z j : ℂ)) = κ := by
  have hP : (∏ j, (z j : ℂ)) ≠ 0 :=
    Finset.prod_ne_zero_iff.mpr fun j _ => (z j).ne_zero
  have hden :
      (z i : ℂ) * (∏ j, (z j : ℂ)) ≠ 0 :=
    mul_ne_zero (z i).ne_zero hP
  have hi :
      1 - κ / ((z i : ℂ) * (∏ j, (z j : ℂ))) = 0 :=
    (isLaurentCritical_iff_source_equations κ z).1 hcrit i
  have hdiv :
      κ / ((z i : ℂ) * (∏ j, (z j : ℂ))) = 1 :=
    (sub_eq_zero.mp hi).symm
  calc
    (z i : ℂ) * (∏ j, (z j : ℂ))
        = (κ / ((z i : ℂ) * (∏ j, (z j : ℂ)))) *
            ((z i : ℂ) * (∏ j, (z j : ℂ))) := by rw [hdiv, one_mul]
    _ = κ := div_mul_cancel₀ κ hden

/-- All coordinates of a Laurent critical point are equal. -/
theorem isLaurentCritical_coord_eq
    {κ : ℂ} {z : Torus4}
    (hcrit : IsLaurentCritical κ z) (i j : Fin 4) :
    z i = z j := by
  apply Units.ext
  have hP : (∏ k, (z k : ℂ)) ≠ 0 :=
    Finset.prod_ne_zero_iff.mpr fun k _ => (z k).ne_zero
  apply mul_right_cancel₀ hP
  calc
    (z i : ℂ) * (∏ k, (z k : ℂ))
        = κ := isLaurentCritical_coordinate_product_eq hcrit i
    _ = (z j : ℂ) * (∏ k, (z k : ℂ)) :=
      (isLaurentCritical_coordinate_product_eq hcrit j).symm

/-- A critical point is the constant diagonal torus point determined by any coordinate. -/
theorem isLaurentCritical_eq_diagonal
    {κ : ℂ} {z : Torus4}
    (hcrit : IsLaurentCritical κ z) :
    z = fun _ => z 0 := by
  funext i
  exact isLaurentCritical_coord_eq hcrit i 0

/--
The diagonal coordinate of every Laurent critical point satisfies
`a^5 = κ`.
-/
theorem isLaurentCritical_pow_five_eq
    {κ : ℂ} {z : Torus4}
    (hcrit : IsLaurentCritical κ z) :
    ((z 0 : ℂ) ^ 5) = κ := by
  have h0 := isLaurentCritical_coordinate_product_eq hcrit (0 : Fin 4)
  have h1 := isLaurentCritical_coord_eq hcrit (1 : Fin 4) 0
  have h2 := isLaurentCritical_coord_eq hcrit (2 : Fin 4) 0
  have h3 := isLaurentCritical_coord_eq hcrit (3 : Fin 4) 0
  simp only [Fin.prod_univ_four] at h0
  change
    (z 0 : ℂ) *
      ((z 0 : ℂ) * (z 1 : ℂ) * (z 2 : ℂ) * (z 3 : ℂ)) = κ at h0
  rw [h1, h2, h3] at h0
  calc
    (z 0 : ℂ) ^ 5 =
        (z 0 : ℂ) *
          ((z 0 : ℂ) * (z 0 : ℂ) * (z 0 : ℂ) * (z 0 : ℂ)) := by
      ring
    _ = κ := h0

/-- The constant diagonal torus point with value `a`. -/
def diagonalTorus (a : ℂˣ) : Torus4 := fun _ => a

/--
A nonzero diagonal point with `a^5 = κ` satisfies all coordinate critical
equations.
-/
theorem isLaurentCritical_diagonal_of_pow_five_eq
    (κ : ℂ) (a : ℂˣ)
    (hpow : (a : ℂ) ^ 5 = κ) :
    IsLaurentCritical κ (diagonalTorus a) := by
  rw [isLaurentCritical_iff_source_equations]
  intro i
  simp only [diagonalTorus, Fin.prod_univ_four]
  change
    1 - κ /
      ((a : ℂ) * ((a : ℂ) * (a : ℂ) * (a : ℂ) * (a : ℂ))) = 0
  rw [← hpow]
  field_simp [a.ne_zero]
  ring

/--
At a diagonal critical point the Laurent value is `5a`.
-/
theorem laurentW_diagonal_of_pow_five_eq
    (κ : ℂ) (a : ℂˣ)
    (hpow : (a : ℂ) ^ 5 = κ) :
    laurentW κ (diagonalTorus a) = 5 * (a : ℂ) := by
  rw [laurentW_eq_source_formula]
  simp only [diagonalTorus]
  rw [← hpow]
  field_simp [a.ne_zero]
  ring

/--
Every Laurent critical point has Laurent value five times its common
coordinate.
-/
theorem laurentW_eq_five_mul_of_isLaurentCritical
    {κ : ℂ} {z : Torus4}
    (hcrit : IsLaurentCritical κ z) :
    laurentW κ z = 5 * (z 0 : ℂ) := by
  have hz : z = diagonalTorus (z 0) := by
    funext i
    exact isLaurentCritical_coord_eq hcrit i 0
  rw [hz]
  exact laurentW_diagonal_of_pow_five_eq κ (z 0)
    (isLaurentCritical_pow_five_eq hcrit)

/--
A critical point lying on the level `lambda` satisfies `lambda = 5a`.
-/
theorem level_eq_five_mul_of_isLaurentCritical
    {κ lambda : ℂ} {z : Torus4}
    (hlevel : laurentW κ z = lambda)
    (hcrit : IsLaurentCritical κ z) :
    lambda = 5 * (z 0 : ℂ) := by
  rw [← hlevel]
  exact laurentW_eq_five_mul_of_isLaurentCritical hcrit

/--
Forward critical-value discriminant equation:
a critical point on level `lambda` forces `lambda^5 = 5^5 κ`.
-/
theorem critical_on_level_implies_discriminant
    {κ lambda : ℂ} {z : Torus4}
    (hlevel : laurentW κ z = lambda)
    (hcrit : IsLaurentCritical κ z) :
    lambda ^ 5 = (5 : ℂ) ^ 5 * κ := by
  have hlambda := level_eq_five_mul_of_isLaurentCritical hlevel hcrit
  have hpow := isLaurentCritical_pow_five_eq hcrit
  rw [hlambda, mul_pow, hpow]

/-- A Laurent critical point automatically forces `κ ≠ 0`. -/
theorem kappa_ne_zero_of_isLaurentCritical
    {κ : ℂ} {z : Torus4}
    (hcrit : IsLaurentCritical κ z) :
    κ ≠ 0 := by
  rw [← isLaurentCritical_pow_five_eq hcrit]
  exact pow_ne_zero 5 (z 0).ne_zero

/-- The `κ = 0` Laurent model has no torus critical point. -/
theorem no_laurentCritical_zero (z : Torus4) :
    ¬ IsLaurentCritical 0 z := by
  intro hcrit
  exact kappa_ne_zero_of_isLaurentCritical hcrit rfl

/--
Converse in the nonzero regime: the critical-value equation constructs a
diagonal torus critical point on level `lambda`.
-/
theorem exists_critical_on_level_of_discriminant
    {κ lambda : ℂ}
    (hκ : κ ≠ 0)
    (hdisc : lambda ^ 5 = (5 : ℂ) ^ 5 * κ) :
    ∃ z : Torus4, laurentW κ z = lambda ∧ IsLaurentCritical κ z := by
  have h5 : (5 : ℂ) ≠ 0 := by norm_num
  have haPow : (lambda / 5) ^ 5 = κ := by
    rw [div_pow, hdisc]
    field_simp [h5]
  have ha0 : lambda / 5 ≠ 0 := by
    intro ha
    apply hκ
    rw [← haPow, ha]
    norm_num
  let a : ℂˣ := Units.mk0 (lambda / 5) ha0
  refine ⟨diagonalTorus a, ?_, ?_⟩
  · rw [laurentW_diagonal_of_pow_five_eq κ a]
    · change 5 * (lambda / 5) = lambda
      field_simp [h5]
    · exact haPow
  · exact isLaurentCritical_diagonal_of_pow_five_eq κ a haPow

/--
For `κ ≠ 0`, a critical point occurs on level `lambda` exactly when the
critical-value discriminant equation holds.

This is a critical-value criterion only.  It is not a scheme-theoretic
smoothness or Jacobian-criterion theorem.
-/
theorem exists_critical_on_level_iff_discriminant
    {κ lambda : ℂ}
    (hκ : κ ≠ 0) :
    (∃ z : Torus4, laurentW κ z = lambda ∧ IsLaurentCritical κ z) ↔
      lambda ^ 5 = (5 : ℂ) ^ 5 * κ := by
  constructor
  · rintro ⟨z, hlevel, hcrit⟩
    exact critical_on_level_implies_discriminant hlevel hcrit
  · intro hdisc
    exact exists_critical_on_level_of_discriminant hκ hdisc

/--
Principal-regime algebraic consequence: if the critical-value equation fails,
there is no Laurent critical point on the base fiber.

No scheme-theoretic smoothness claim is made.
-/
theorem noCriticalPointOnBaseFiber
    {κ lambda : ℂ}
    (hdisc : lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ) :
    ¬ ∃ z : Torus4, z ∈ baseFiber κ lambda ∧ IsLaurentCritical κ z := by
  rintro ⟨z, hlevel, hcrit⟩
  apply hdisc
  exact critical_on_level_implies_discriminant
    ((mem_baseFiber_iff κ lambda z).1 hlevel) hcrit

end SelfSimilarCY

import SelfSimilarCY.TorusPowerKernel
import Mathlib.Analysis.SpecialFunctions.Pow.Complex

namespace SelfSimilarCY

/-- The set-theoretic fiber of `torusCoordinatePower D` over `y`. -/
abbrev torusPowerFiber (D : ℕ) (y : Torus4) :=
  {x : Torus4 // torusCoordinatePower D x = y}

/--
Given one chosen preimage `x` of `y`, multiplication by `x` identifies
the kernel with the fiber over `y`.

This is an elementary group-theoretic fiber translation equivalence. It does
not assert covering-space, deck-group, finite étale, or map-degree structure.
-/
def torusPowerKernelEquivFiberOfPreimage
    (D : ℕ) (y x : Torus4)
    (hx : torusCoordinatePower D x = y) :
    (torusCoordinatePowerHom D).ker ≃ torusPowerFiber D y where
  toFun k :=
    ⟨k.1 * x, by
      funext i
      have hk :=
        (mem_torusCoordinatePowerKernel_iff D k.1).1 k.2 i
      have hxi := congrFun hx i
      simp only [torusCoordinatePower_apply] at hxi ⊢
      change (k.1 i * x i) ^ D = y i
      rw [mul_pow, hk, one_mul, hxi]⟩
  invFun z :=
    ⟨z.1 * x⁻¹, by
      apply (mem_torusCoordinatePowerKernel_iff D _).2
      intro i
      have hzi := congrFun z.2 i
      have hxi := congrFun hx i
      simp only [torusCoordinatePower_apply] at hzi hxi
      simp [mul_pow, hzi, hxi]⟩
  left_inv k := by
    apply Subtype.ext
    funext i
    simp
  right_inv z := by
    apply Subtype.ext
    funext i
    simp

/-- The chosen-preimage equivalence in the fiber-to-kernel orientation. -/
def torusPowerFiberEquivKernelOfPreimage
    (D : ℕ) (y x : Torus4)
    (hx : torusCoordinatePower D x = y) :
    torusPowerFiber D y ≃ (torusCoordinatePowerHom D).ker :=
  (torusPowerKernelEquivFiberOfPreimage D y x hx).symm

/--
A canonical explicit complex-unit `D`-th root, using complex powers.
The nonzero exponent hypothesis is exactly what is needed for
`Complex.cpow_nat_inv_pow`.
-/
noncomputable def complexUnitNthRoot
    (D : ℕ) (u : ℂˣ) : ℂˣ :=
  Units.mk0 ((u : ℂ) ^ ((D : ℂ)⁻¹)) <| by
    apply (Complex.cpow_ne_zero_iff).2
    exact Or.inl u.ne_zero

@[simp]
theorem complexUnitNthRoot_pow
    (D : ℕ) (hD : D ≠ 0) (u : ℂˣ) :
    complexUnitNthRoot D u ^ D = u := by
  apply Units.ext
  change (((u : ℂ) ^ ((D : ℂ)⁻¹)) ^ D) = (u : ℂ)
  exact Complex.cpow_nat_inv_pow (u : ℂ) hD

/-- Coordinatewise chosen `D`-th root of a torus point. -/
noncomputable def torusCoordinatePowerRoot
    (D : ℕ) (y : Torus4) : Torus4 :=
  fun i => complexUnitNthRoot D (y i)

@[simp]
theorem torusCoordinatePower_root
    (D : ℕ) (hD : D ≠ 0) (y : Torus4) :
    torusCoordinatePower D (torusCoordinatePowerRoot D y) = y := by
  funext i
  simp [torusCoordinatePowerRoot, torusCoordinatePower]

/-- For every positive exponent, the torus coordinate-power map is surjective. -/
theorem torusCoordinatePower_surjective
    {D : ℕ} (hD : 0 < D) :
    Function.Surjective (torusCoordinatePower D) := by
  intro y
  have hD0 : D ≠ 0 := Nat.ne_of_gt hD
  exact ⟨torusCoordinatePowerRoot D y,
    torusCoordinatePower_root D hD0 y⟩

/-- Every positive-exponent ambient torus fiber is a finite type. -/
theorem finite_torusPowerFiber
    {D : ℕ} (hD : 0 < D) (y : Torus4) :
    Finite (torusPowerFiber D y) := by
  letI : NeZero D := ⟨Nat.ne_of_gt hD⟩
  obtain ⟨x, hx⟩ := torusCoordinatePower_surjective hD y
  exact Finite.of_equiv ((torusCoordinatePowerHom D).ker)
    (torusPowerKernelEquivFiberOfPreimage D y x hx)

/--
For every positive exponent, every ambient torus fiber has exactly `D ^ 4`
points.

This is a finite-set cardinality theorem only. It does not claim an
algebraic-geometric map degree, a finite étale morphism, or a covering-space
degree.
-/
theorem natCard_torusPowerFiber
    {D : ℕ} (hD : 0 < D) (y : Torus4) :
    Nat.card (torusPowerFiber D y) = D ^ 4 := by
  letI : NeZero D := ⟨Nat.ne_of_gt hD⟩
  obtain ⟨x, hx⟩ := torusCoordinatePower_surjective hD y
  calc
    Nat.card (torusPowerFiber D y) =
        Nat.card ((torusCoordinatePowerHom D).ker) :=
      Nat.card_congr (torusPowerFiberEquivKernelOfPreimage D y x hx)
    _ = D ^ 4 := natCard_torusCoordinatePowerKernel D

end SelfSimilarCY

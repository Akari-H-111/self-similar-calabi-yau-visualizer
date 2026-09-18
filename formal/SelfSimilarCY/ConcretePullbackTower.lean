import SelfSimilarCY.StationaryFamily

namespace SelfSimilarCY

/--
The concrete level at depth `n` is the torus zero locus of the stationary
Laurent member with exponent `D^n`:

`X_n = {z ∈ T | f_(D^n)(z) = 0}`.

The source working regime has `D ≥ 2`; the set-theoretic defining identity
below is valid for every natural `D`.
-/
def concreteLevel
    (D : ℕ) (κ lambda : ℂ) (n : ℕ) : Set Torus4 :=
  {z | stationaryLaurent κ lambda (D ^ n) z = 0}

@[simp]
theorem mem_concreteLevel_iff
    (D : ℕ) (κ lambda : ℂ) (n : ℕ) (z : Torus4) :
    z ∈ concreteLevel D κ lambda n ↔
      stationaryLaurent κ lambda (D ^ n) z = 0 := Iff.rfl

/-- The depth-zero concrete level is exactly the sealed F09 base fiber. -/
@[simp]
theorem concreteLevel_zero
    (D : ℕ) (κ lambda : ℂ) :
    concreteLevel D κ lambda 0 = baseFiber κ lambda := by
  ext z
  simp [concreteLevel, baseFiber]

/--
Concrete pullback recurrence:

`X_(n+1) = (P_D^T)⁻¹(X_n)`.

This is a set-theoretic consequence of the stationary identity; it does not
assert finiteness, étaleness, covering-space structure, or degree.
-/
theorem concreteLevel_succ
    (D : ℕ) (κ lambda : ℂ) (n : ℕ) :
    concreteLevel D κ lambda n.succ =
      torusCoordinatePower D ⁻¹' concreteLevel D κ lambda n := by
  ext z
  simp only [concreteLevel, Set.mem_setOf_eq, Set.mem_preimage]
  rw [stationaryLaurent_torusCoordinatePower, pow_succ, Nat.mul_comm (D ^ n) D]

end SelfSimilarCY

import SelfSimilarCY.TorusCoordinatePower
import Mathlib.RingTheory.RootsOfUnity.Complex

namespace SelfSimilarCY

/--
The existing torus coordinate-power function, packaged as a monoid
endomorphism. This is a derived structure: its underlying function is exactly
the sealed `torusCoordinatePower D`.
-/
def torusCoordinatePowerHom (D : ℕ) : Torus4 →* Torus4 where
  toFun := torusCoordinatePower D
  map_one' := by
    funext i
    simp [torusCoordinatePower]
  map_mul' z w := by
    funext i
    simp [torusCoordinatePower, mul_pow]

@[simp]
theorem torusCoordinatePowerHom_apply (D : ℕ) (z : Torus4) :
    torusCoordinatePowerHom D z = torusCoordinatePower D z :=
  rfl

/--
Coordinatewise characterization of the kernel of `P_D`.

This theorem is valid for every natural `D`. In particular, for `D = 0`
the kernel is all of `Torus4); no finiteness statement is made here.
-/
theorem mem_torusCoordinatePowerKernel_iff (D : ℕ) (z : Torus4) :
    z ∈ (torusCoordinatePowerHom D).ker ↔
      ∀ i : Fin 4, z i ^ D = 1 := by
  rw [MonoidHom.mem_ker]
  constructor
  · intro hz i
    have hi := congrFun hz i
    simpa [torusCoordinatePowerHom, torusCoordinatePower] using hi
  · intro hz
    funext i
    simpa [torusCoordinatePowerHom, torusCoordinatePower] using hz i

/-- The four independent complex `D`-th roots-of-unity coordinates. -/
abbrev TorusRootsOfUnity4 (D : ℕ) :=
  Fin 4 → rootsOfUnity D ℂ

/--
The kernel of the four-coordinate power map is multiplicatively equivalent
to four independent copies of the complex `D`-th roots of unity.

No nonzero hypothesis on `D` is needed for this structural equivalence.
For `D = 0`, both sides are infinite.
-/
def torusPowerKernelMulEquivRootsOfUnity (D : ℕ) :
    (torusCoordinatePowerHom D).ker ≃*
      TorusRootsOfUnity4 D where
  toFun z := fun i =>
    ⟨z.1 i, (mem_rootsOfUnity D (z.1 i)).2
      ((mem_torusCoordinatePowerKernel_iff D z.1).1 z.2 i)⟩
  invFun r :=
    ⟨fun i => (r i : ℂˣ),
      (mem_torusCoordinatePowerKernel_iff D _).2 fun i =>
        (r i).2⟩
  left_inv z := by
    apply Subtype.ext
    funext i
    rfl
  right_inv r := by
    funext i
    apply Subtype.ext
    rfl
  map_mul' z w := by
    funext i
    apply Subtype.ext
    rfl

/--
For `D ≠ 0`, the kernel is genuinely finite. This explicit finite instance
prevents a bare `Nat.card` equality from obscuring the infinite `D = 0`
case.
-/
noncomputable instance torusCoordinatePowerKernelFinite
    (D : ℕ) [NeZero D] :
    Finite ((torusCoordinatePowerHom D).ker) := by
  exact Finite.of_equiv (TorusRootsOfUnity4 D)
    (torusPowerKernelMulEquivRootsOfUnity D).symm.toEquiv

/-- Exact complex roots-of-unity cardinality in the nonzero-exponent regime. -/
theorem natCard_complexRootsOfUnity (D : ℕ) [NeZero D] :
    Nat.card (rootsOfUnity D ℂ) = D :=
  Complex.card_rootsOfUnity D

/--
For `D ≠ 0`, the kernel of the four-coordinate power map has exactly
`D ^ 4` elements.

This is a finite-set cardinality theorem only. It is not a theorem about
algebraic-geometric map degree or finite étale morphisms.
-/
theorem natCard_torusCoordinatePowerKernel (D : ℕ) [NeZero D] :
    Nat.card ((torusCoordinatePowerHom D).ker) = D ^ 4 := by
  calc
    Nat.card ((torusCoordinatePowerHom D).ker) =
        Nat.card (TorusRootsOfUnity4 D) :=
      Nat.card_congr (torusPowerKernelMulEquivRootsOfUnity D).toEquiv
    _ = Nat.card (rootsOfUnity D ℂ) ^ Nat.card (Fin 4) :=
      Nat.card_fun
    _ = D ^ 4 := by
      rw [natCard_complexRootsOfUnity]
      simp

end SelfSimilarCY

import SelfSimilarCY.LaurentW

namespace SelfSimilarCY

/--
The base fiber `X₀ = W_κ⁻¹(λ)` as a subset of the concrete torus.

Both `κ` and `λ` range over all complex numbers at the defining layer.
Smoothness or principal-regime hypotheses belong to later theorem layers.
-/
def baseFiber (κ lambda : ℂ) : Set Torus4 :=
  {z | laurentW κ z = lambda}

@[simp]
theorem mem_baseFiber_iff (κ lambda : ℂ) (z : Torus4) :
    z ∈ baseFiber κ lambda ↔ laurentW κ z = lambda := Iff.rfl

/-- The set-builder definition is exactly the singleton preimage of the level value. -/
theorem baseFiber_eq_preimage_singleton (κ lambda : ℂ) :
    baseFiber κ lambda = laurentW κ ⁻¹' ({lambda} : Set ℂ) := by
  ext z
  simp [baseFiber]

end SelfSimilarCY

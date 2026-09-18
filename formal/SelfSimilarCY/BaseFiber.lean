import SelfSimilarCY.LaurentW

namespace SelfSimilarCY

/--
The base fiber `X₀ = W_κ⁻¹(λ)` as a subset of the concrete torus.

Both `κ` and `λ` range over all complex numbers at the defining layer.
Smoothness or principal-regime hypotheses belong to later theorem layers.
-/
def baseFiber (κ λ : ℂ) : Set Torus4 :=
  {z | laurentW κ z = λ}

@[simp]
theorem mem_baseFiber_iff (κ λ : ℂ) (z : Torus4) :
    z ∈ baseFiber κ λ ↔ laurentW κ z = λ := Iff.rfl

/-- The set-builder definition is exactly the singleton preimage of the level value. -/
theorem baseFiber_eq_preimage_singleton (κ λ : ℂ) :
    baseFiber κ λ = laurentW κ ⁻¹' ({λ} : Set ℂ) := by
  ext z
  simp [baseFiber]

end SelfSimilarCY

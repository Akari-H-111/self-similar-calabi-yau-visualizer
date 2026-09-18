import SelfSimilarCY.Torus4

namespace SelfSimilarCY

open scoped BigOperators

/--
The source-backed Laurent function on the four-dimensional complex torus:

`W_κ(z) = ∑ᵢ zᵢ + κ / ∏ᵢ zᵢ`.

The level parameter `λ` is intentionally not part of this definition.
No nonzero assumption on `κ` is required.
-/
def laurentW (κ : ℂ) (z : Torus4) : ℂ :=
  (∑ i, (z i : ℂ)) + κ / (∏ i, (z i : ℂ))

@[simp]
theorem laurentW_apply (κ : ℂ) (z : Torus4) :
    laurentW κ z =
      (∑ i, (z i : ℂ)) + κ / (∏ i, (z i : ℂ)) := rfl

/--
Coordinate-expanded normal form matching the canonical source formula
`z₁ + z₂ + z₃ + z₄ + κ / (z₁ z₂ z₃ z₄)`.
-/
theorem laurentW_eq_source_formula (κ : ℂ) (z : Torus4) :
    laurentW κ z =
      (z 0 : ℂ) + (z 1 : ℂ) + (z 2 : ℂ) + (z 3 : ℂ) +
        κ / ((z 0 : ℂ) * (z 1 : ℂ) * (z 2 : ℂ) * (z 3 : ℂ)) := by
  simp [laurentW, Fin.sum_univ_four, Fin.prod_univ_four]

end SelfSimilarCY

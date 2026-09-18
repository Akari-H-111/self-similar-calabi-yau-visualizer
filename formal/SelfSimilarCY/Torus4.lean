import SelfSimilarCY.CoordinatePower

namespace SelfSimilarCY

/--
The four-dimensional complex algebraic torus at the level of complex points.

Each coordinate is a unit of `ℂ`, so nonvanishing is built into the type.
This is the concrete ambient representation corresponding to
`(ℂˣ)^4 = (ℂ^×)^4` used by the source mathematics.

F08 introduces only the ambient torus and its forgetful map to the already
sealed `Point4 := Fin 4 → ℂ`. It does not define `W_kappa`, `X_0`,
map degree, étaleness, metric scaling, or connectedness.
-/
abbrev Torus4 := Fin 4 → ℂˣ

/--
Forget the unit witnesses coordinatewise and view a torus point as the
underlying four complex coordinates.
-/
def Torus4.toPoint4 (z : Torus4) : Point4 :=
  fun i => (z i : ℂ)

@[simp]
theorem Torus4.toPoint4_apply (z : Torus4) (i : Fin 4) :
    z.toPoint4 i = (z i : ℂ) := rfl

/-- Every coordinate of the underlying `Point4` of a torus point is nonzero. -/
theorem Torus4.toPoint4_ne_zero (z : Torus4) (i : Fin 4) :
    z.toPoint4 i ≠ 0 :=
  (z i).ne_zero

/-- The forgetful map from `Torus4` to `Point4` is injective. -/
theorem Torus4.toPoint4_injective : Function.Injective Torus4.toPoint4 := by
  intro z w h
  funext i
  apply Units.ext
  simpa [Torus4.toPoint4] using congrFun h i

end SelfSimilarCY

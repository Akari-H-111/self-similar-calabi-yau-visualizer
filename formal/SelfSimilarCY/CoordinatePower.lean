import SelfSimilarCY.Basic

namespace SelfSimilarCY

/--
The four complex coordinates used by the canonical coordinate-power map.

F02 intentionally records only the ambient coordinate type needed to state `P_D`.
It does not formalize `W`, `X_n`, a nonvanishing/torus condition, map degree,
metric scaling, or iteration.
-/
abbrev Point4 := Fin 4 → ℂ

/--
The canonical coordinate power map

`P_D(z₁, z₂, z₃, z₄) = (z₁^D, z₂^D, z₃^D, z₄^D)`.
-/
def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D

@[simp]
theorem coordinatePower_apply (D : ℕ) (z : Point4) (i : Fin 4) :
    coordinatePower D z i = z i ^ D := rfl

/--
`coordinatePower` is the unique map on `Point4` satisfying the canonical
coordinatewise `D`-th power rule.
-/
theorem coordinatePower_unique (D : ℕ) (f : Point4 → Point4)
    (h : ∀ z i, f z i = z i ^ D) :
    f = coordinatePower D := by
  funext z i
  simpa [coordinatePower] using h z i

end SelfSimilarCY

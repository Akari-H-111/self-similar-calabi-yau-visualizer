import SelfSimilarCY.Torus4

namespace SelfSimilarCY

/--
The coordinatewise natural-number power map on the four-dimensional complex
algebraic torus.

This is the torus-level representative of
`P_D(z₁, z₂, z₃, z₄) = (z₁^D, z₂^D, z₃^D, z₄^D)`.
No lower bound on `D` is required to define the map.
-/
def torusCoordinatePower (D : ℕ) (z : Torus4) : Torus4 :=
  fun i => z i ^ D

@[simp]
theorem torusCoordinatePower_apply (D : ℕ) (z : Torus4) (i : Fin 4) :
    torusCoordinatePower D z i = z i ^ D := rfl

/--
The torus power map is exactly compatible with the sealed `Point4`
coordinate-power map after forgetting the unit witnesses.
-/
@[simp]
theorem torusCoordinatePower_toPoint4 (D : ℕ) (z : Torus4) :
    (torusCoordinatePower D z).toPoint4 =
      coordinatePower D z.toPoint4 := by
  funext i
  simp [Torus4.toPoint4, torusCoordinatePower, coordinatePower]

end SelfSimilarCY

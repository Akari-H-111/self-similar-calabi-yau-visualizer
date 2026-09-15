import SelfSimilarCY.CoordinatePower

namespace SelfSimilarCY

/--
The `n`-fold iterate of the canonical coordinate-power map raises each
coordinate to `D ^ n`.

No lower bound on `D` is required: this is a statement about natural-number
powers and function iteration, independent of the runtime scene restriction
`D >= 2`.
-/
theorem coordinatePower_iterate_apply
    (D n : ℕ) (z : Point4) (i : Fin 4) :
    (coordinatePower D)^[n] z i = z i ^ (D ^ n) := by
  induction n generalizing z with
  | zero =>
      simp
  | succ n ih =>
      calc
        (coordinatePower D)^[n.succ] z i
            = (coordinatePower D)^[n] (coordinatePower D z) i := rfl
        _ = (coordinatePower D z i) ^ (D ^ n) := ih (coordinatePower D z)
        _ = (z i ^ D) ^ (D ^ n) := by rw [coordinatePower_apply]
        _ = z i ^ (D * D ^ n) := by rw [← pow_mul]
        _ = z i ^ (D ^ n * D) := by rw [Nat.mul_comm D (D ^ n)]
        _ = z i ^ (D ^ n.succ) := by rw [pow_succ]

/--
Map-level extensional form of `coordinatePower_iterate_apply`:

`(P_D)^[n] = P_(D^n)`.
-/
theorem coordinatePower_iterate
    (D n : ℕ) :
    (coordinatePower D)^[n] = coordinatePower (D ^ n) := by
  funext z i
  simpa only [coordinatePower_apply] using coordinatePower_iterate_apply D n z i

end SelfSimilarCY

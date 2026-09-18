import SelfSimilarCY.TorusCoordinatePower
import SelfSimilarCY.BaseFiber

namespace SelfSimilarCY

open scoped BigOperators

/--
The stationary Laurent family from the canonical source:

`f_N(z) = ∑ᵢ zᵢ^N + κ / (∏ᵢ zᵢ)^N - λ`.

The source tower uses positive exponents `N = D^n` with `D ≥ 2`, but the
defining layer is algebraically natural for every `N : ℕ`. In particular,
`N = 0` is admitted here only as a wider Lean defining-layer extension.
-/
noncomputable def stationaryLaurent
    (κ lambda : ℂ) (N : ℕ) (z : Torus4) : ℂ :=
  (∑ i, (z i : ℂ) ^ N) + κ / ((∏ i, (z i : ℂ)) ^ N) - lambda

@[simp]
theorem stationaryLaurent_apply
    (κ lambda : ℂ) (N : ℕ) (z : Torus4) :
    stationaryLaurent κ lambda N z =
      (∑ i, (z i : ℂ) ^ N) + κ / ((∏ i, (z i : ℂ)) ^ N) - lambda := rfl

/-- At exponent one, the stationary family is exactly `W_κ - λ`. -/
@[simp]
theorem stationaryLaurent_one (κ lambda : ℂ) (z : Torus4) :
    stationaryLaurent κ lambda 1 z = laurentW κ z - lambda := by
  simp [stationaryLaurent, laurentW]

/--
Core stationary identity from the canonical source:

`f_N(P_D z) = f_(D N)(z)`.

No lower bound on `D` or positivity hypothesis on `N` is needed for this
algebraic identity.
-/
theorem stationaryLaurent_torusCoordinatePower
    (κ lambda : ℂ) (N D : ℕ) (z : Torus4) :
    stationaryLaurent κ lambda N (torusCoordinatePower D z) =
      stationaryLaurent κ lambda (D * N) z := by
  change
    (∑ i, ((z i : ℂ) ^ D) ^ N) +
          κ / ((∏ i, (z i : ℂ) ^ D) ^ N) - lambda =
      (∑ i, (z i : ℂ) ^ (D * N)) +
          κ / ((∏ i, (z i : ℂ)) ^ (D * N)) - lambda
  rw [← Finset.prod_pow]
  simp only [← pow_mul]

end SelfSimilarCY

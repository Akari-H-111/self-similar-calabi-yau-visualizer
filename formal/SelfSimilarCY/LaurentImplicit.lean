import SelfSimilarCY.LaurentDifferential
import Mathlib.Analysis.Calculus.Implicit

namespace SelfSimilarCY

open scoped BigOperators Topology
open Filter

/--
The ambient Laurent function is C¹ at every point coming from the concrete torus.

This is the minimum regularity bridge needed for the pinned finite-dimensional
implicit-function API. It makes no regular-level, submanifold, or scheme-smoothness claim.
-/
theorem laurentWPoint_contDiffAt
    (κ : ℂ) (z : Torus4) :
    ContDiffAt ℂ 1 (laurentWPoint κ) z.toPoint4 := by
  have hprod : (∏ i, z.toPoint4 i) ≠ 0 := by
    exact Finset.prod_ne_zero_iff.mpr fun i _ => z.toPoint4_ne_zero i
  unfold laurentWPoint
  fun_prop

/--
Strict Fréchet differentiability of the ambient Laurent function at a torus point,
using exactly the sealed F13 differential `laurentTotalDifferential`.
-/
theorem laurentWPoint_hasStrictFDerivAt
    (κ : ℂ) (z : Torus4) :
    HasStrictFDerivAt
      (laurentWPoint κ)
      (laurentTotalDifferential κ z)
      z.toPoint4 := by
  simpa [laurentTotalDifferential] using
    (laurentWPoint_contDiffAt κ z).hasStrictFDerivAt (by simp)

/--
Convert the sealed F13 functional surjectivity statement into the range-equals-top
form required by the pinned finite-dimensional implicit-function API.
-/
theorem laurentTotalDifferential_range_eq_top
    {κ : ℂ} {z : Torus4}
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    (laurentTotalDifferential κ z).range = ⊤ := by
  exact LinearMap.range_eq_top.mpr h

/--
The pinned implicit function associated to the ambient Laurent map at a torus point
with surjective sealed F13 differential.
-/
noncomputable def laurentImplicitFunction
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    ℂ → (laurentTotalDifferential κ z).ker → Point4 :=
  (laurentWPoint_hasStrictFDerivAt κ z).implicitFunction
    (laurentWPoint κ)
    (laurentTotalDifferential κ z)
    (laurentTotalDifferential_range_eq_top h)

/--
The local open partial homeomorphism supplied by pinned mathlib:
`Point4 ↔ ℂ × ker(dW_z)`.

At this stage this is only the analytic chart object. Local identification with
`baseFiber` is intentionally deferred to the next pass.
-/
noncomputable def laurentImplicitChart
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    OpenPartialHomeomorph
      Point4
      (ℂ × (laurentTotalDifferential κ z).ker) :=
  (laurentWPoint_hasStrictFDerivAt κ z).implicitToOpenPartialHomeomorph
    (laurentWPoint κ)
    (laurentTotalDifferential κ z)
    (laurentTotalDifferential_range_eq_top h)

/-- The first chart coordinate is exactly the ambient Laurent value. -/
@[simp]
theorem laurentImplicitChart_fst
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z))
    (x : Point4) :
    (laurentImplicitChart κ z h x).fst = laurentWPoint κ x := by
  simp [laurentImplicitChart]

/-- The torus base point belongs to the source of the implicit chart. -/
theorem laurentImplicitChart_base_mem_source
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    z.toPoint4 ∈ (laurentImplicitChart κ z h).source := by
  exact
    (laurentWPoint_hasStrictFDerivAt κ z).mem_implicitToOpenPartialHomeomorph_source
      (laurentTotalDifferential_range_eq_top h)

/-- The chart target contains the canonical base pair `(Wκ(z), 0)`. -/
theorem laurentImplicitChart_base_mem_target
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    (laurentWPoint κ z.toPoint4, (0 : (laurentTotalDifferential κ z).ker)) ∈
      (laurentImplicitChart κ z h).target := by
  exact
    (laurentWPoint_hasStrictFDerivAt κ z).mem_implicitToOpenPartialHomeomorph_target
      (laurentTotalDifferential_range_eq_top h)

/-- The implicit chart sends the base point to `(Wκ(z), 0)`. -/
@[simp]
theorem laurentImplicitChart_apply_base
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    laurentImplicitChart κ z h z.toPoint4 =
      (laurentWPoint κ z.toPoint4, (0 : (laurentTotalDifferential κ z).ker)) := by
  simp [laurentImplicitChart]

/-- The pinned implicit function sends the canonical base pair back to the torus base point. -/
@[simp]
theorem laurentImplicitFunction_apply_base
    (κ : ℂ) (z : Torus4)
    (h : Function.Surjective (laurentTotalDifferential κ z)) :
    laurentImplicitFunction κ z h (laurentWPoint κ z.toPoint4)
      (0 : (laurentTotalDifferential κ z).ker) = z.toPoint4 := by
  unfold laurentImplicitFunction
  exact
    (laurentWPoint_hasStrictFDerivAt κ z).implicitFunction_apply_image
      (laurentTotalDifferential_range_eq_top h)

/--
The ambient nonzero-coordinate locus relevant to the Laurent expression.

Using the coordinate product keeps this bridge definition minimal: for a finite
product over `Fin 4`, membership is equivalent to every coordinate being
nonzero. This is a representation bridge only, not a second definition of the
torus or of the base fiber.
-/
def ambientTorusLocus : Set Point4 :=
  {x | (∏ i, x i) ≠ 0}

/-- Every concrete torus point lands in the ambient nonzero-coordinate locus. -/
theorem Torus4.toPoint4_mem_ambientTorusLocus (z : Torus4) :
    z.toPoint4 ∈ ambientTorusLocus := by
  exact Finset.prod_ne_zero_iff.mpr fun i _ => z.toPoint4_ne_zero i

/-- The ambient nonzero-coordinate locus is open in `Point4`. -/
theorem isOpen_ambientTorusLocus : IsOpen ambientTorusLocus := by
  unfold ambientTorusLocus
  exact
    (isOpen_ne : IsOpen {w : ℂ | w ≠ 0}).preimage
      (by fun_prop)

/-- The ambient torus locus is a neighborhood of every point coming from `Torus4`. -/
theorem ambientTorusLocus_mem_nhds (z : Torus4) :
    ambientTorusLocus ∈ 𝓝 z.toPoint4 :=
  isOpen_ambientTorusLocus.mem_nhds z.toPoint4_mem_ambientTorusLocus

/--
Canonical lift of an ambient point with nonzero coordinate product back to the
concrete torus. The proof argument only supplies the unit witnesses.
-/
noncomputable def pointToTorus4 (x : Point4) (hx : x ∈ ambientTorusLocus) : Torus4 :=
  fun i =>
    Units.mk0 (x i)
      (Finset.prod_ne_zero_iff.mp hx i (Finset.mem_univ i))

/-- Forgetting the canonical ambient lift returns the original point. -/
@[simp]
theorem pointToTorus4_toPoint4 (x : Point4) (hx : x ∈ ambientTorusLocus) :
    (pointToTorus4 x hx).toPoint4 = x := by
  funext i
  rfl

/-- Exact representation bridge between the ambient torus locus and `Torus4.toPoint4`. -/
theorem mem_ambientTorusLocus_iff_exists_toPoint4 (x : Point4) :
    x ∈ ambientTorusLocus ↔ ∃ z : Torus4, z.toPoint4 = x := by
  constructor
  · intro hx
    exact ⟨pointToTorus4 x hx, pointToTorus4_toPoint4 x hx⟩
  · rintro ⟨z, rfl⟩
    exact z.toPoint4_mem_ambientTorusLocus

/--
Near a concrete torus point, the ambient Laurent level equation is exactly the
existence of a lift to the concrete `baseFiber`.

This is a local representation theorem only. It makes no manifold or scheme
smoothness claim.
-/
theorem eventually_laurentWPoint_eq_iff_exists_baseFiber_lift
    (κ lambda : ℂ) (z : Torus4) :
    ∀ᶠ x in 𝓝 z.toPoint4,
      laurentWPoint κ x = lambda ↔
        ∃ w : Torus4, w ∈ baseFiber κ lambda ∧ w.toPoint4 = x := by
  filter_upwards [ambientTorusLocus_mem_nhds z] with x hx
  constructor
  · intro hlevel
    let w : Torus4 := pointToTorus4 x hx
    have hwpoint : w.toPoint4 = x := by
      simpa [w] using pointToTorus4_toPoint4 x hx
    refine ⟨w, ?_, hwpoint⟩
    change laurentW κ w = lambda
    rw [← laurentWPoint_toPoint4 κ w, hwpoint]
    exact hlevel
  · rintro ⟨w, hw, rfl⟩
    simpa [baseFiber] using hw

/--
Canonical F14 chart at a regular concrete base-fiber point, using the sealed F13
surjectivity theorem directly.
-/
noncomputable def laurentRegularImplicitChart
    (κ lambda : ℂ) (z : Torus4)
    (hz : z ∈ baseFiber κ lambda)
    (hreg : κ = 0 ∨ lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ) :
    OpenPartialHomeomorph
      Point4
      (ℂ × (laurentTotalDifferential κ z).ker) :=
  laurentImplicitChart κ z
    (laurentTotalDifferential_surjective_on_baseFiber_of_regular_regime hz hreg)

/-- The first coordinate of the regular chart remains exactly `laurentWPoint`. -/
@[simp]
theorem laurentRegularImplicitChart_fst
    (κ lambda : ℂ) (z : Torus4)
    (hz : z ∈ baseFiber κ lambda)
    (hreg : κ = 0 ∨ lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ)
    (x : Point4) :
    (laurentRegularImplicitChart κ lambda z hz hreg x).fst =
      laurentWPoint κ x := by
  simp [laurentRegularImplicitChart]

/-- The chart first-coordinate level equation is exactly the ambient Laurent level equation. -/
theorem laurentRegularImplicitChart_fst_eq_lambda_iff
    (κ lambda : ℂ) (z : Torus4)
    (hz : z ∈ baseFiber κ lambda)
    (hreg : κ = 0 ∨ lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ)
    (x : Point4) :
    (laurentRegularImplicitChart κ lambda z hz hreg x).fst = lambda ↔
      laurentWPoint κ x = lambda := by
  simp [laurentRegularImplicitChart]

/--
Local base-fiber identification in the canonical F14 chart: near the regular
base point, an ambient point is the image of a concrete base-fiber point iff
the chart's complex coordinate is fixed at `lambda`.

The second chart coordinate already has type `ker(dW_z)`, so this is precisely
the neighborhood-scoped `{lambda} × ker(dW_z)` slice statement at the level
of chart coordinates. It is not a global set equality.
-/
theorem eventually_exists_baseFiber_lift_iff_regularImplicitChart_fst_eq
    (κ lambda : ℂ) (z : Torus4)
    (hz : z ∈ baseFiber κ lambda)
    (hreg : κ = 0 ∨ lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ) :
    ∀ᶠ x in 𝓝 z.toPoint4,
      (∃ w : Torus4, w ∈ baseFiber κ lambda ∧ w.toPoint4 = x) ↔
        (laurentRegularImplicitChart κ lambda z hz hreg x).fst = lambda := by
  filter_upwards [eventually_laurentWPoint_eq_iff_exists_baseFiber_lift κ lambda z] with x hx
  rw [← hx]
  exact (laurentRegularImplicitChart_fst_eq_lambda_iff κ lambda z hz hreg x).symm

/--
Canonical implicit function at a regular concrete base-fiber point, obtained from
the same sealed F13 surjectivity theorem as `laurentRegularImplicitChart`.
-/
noncomputable def laurentRegularImplicitFunction
    (κ lambda : ℂ) (z : Torus4)
    (hz : z ∈ baseFiber κ lambda)
    (hreg : κ = 0 ∨ lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ) :
    ℂ → (laurentTotalDifferential κ z).ker → Point4 :=
  laurentImplicitFunction κ z
    (laurentTotalDifferential_surjective_on_baseFiber_of_regular_regime hz hreg)

/-- At a concrete base-fiber point the ambient Laurent value is the level parameter. -/
@[simp]
theorem laurentWPoint_eq_level_of_mem_baseFiber
    (κ lambda : ℂ) (z : Torus4)
    (hz : z ∈ baseFiber κ lambda) :
    laurentWPoint κ z.toPoint4 = lambda := by
  simpa [baseFiber] using hz

/--
Every ambient point sufficiently near the regular base point is reconstructed
from its Laurent value and its kernel coordinate in the F14 implicit chart.
-/
theorem eventually_laurentRegularImplicitFunction_reconstruct
    (κ lambda : ℂ) (z : Torus4)
    (hz : z ∈ baseFiber κ lambda)
    (hreg : κ = 0 ∨ lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ) :
    ∀ᶠ x in 𝓝 z.toPoint4,
      laurentRegularImplicitFunction κ lambda z hz hreg
          (laurentWPoint κ x)
          (laurentRegularImplicitChart κ lambda z hz hreg x).snd = x := by
  let hsurj :=
    laurentTotalDifferential_surjective_on_baseFiber_of_regular_regime hz hreg
  simpa [laurentRegularImplicitFunction, laurentRegularImplicitChart,
    laurentImplicitFunction, laurentImplicitChart, hsurj] using
    (laurentWPoint_hasStrictFDerivAt κ z).eq_implicitFunction
      (laurentTotalDifferential_range_eq_top hsurj)

/--
On the local level set, the fixed-level implicit function reconstructs every
nearby point from the kernel coordinate supplied by the chart.
-/
theorem eventually_regularLevel_reconstruct_from_kernelCoordinate
    (κ lambda : ℂ) (z : Torus4)
    (hz : z ∈ baseFiber κ lambda)
    (hreg : κ = 0 ∨ lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ) :
    ∀ᶠ x in 𝓝 z.toPoint4,
      laurentWPoint κ x = lambda →
        laurentRegularImplicitFunction κ lambda z hz hreg lambda
          (laurentRegularImplicitChart κ lambda z hz hreg x).snd = x := by
  filter_upwards
    [eventually_laurentRegularImplicitFunction_reconstruct κ lambda z hz hreg]
      with x hx hlevel
  simpa [hlevel] using hx

/--
For kernel parameters sufficiently near zero, the fixed-level implicit function
lies on the ambient Laurent level `lambda`.
-/
theorem eventually_laurentWPoint_regularImplicitFunction_eq_level
    (κ lambda : ℂ) (z : Torus4)
    (hz : z ∈ baseFiber κ lambda)
    (hreg : κ = 0 ∨ lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ) :
    ∀ᶠ y : (laurentTotalDifferential κ z).ker in 𝓝 0,
      laurentWPoint κ
          (laurentRegularImplicitFunction κ lambda z hz hreg lambda y) =
        lambda := by
  let hsurj :=
    laurentTotalDifferential_surjective_on_baseFiber_of_regular_regime hz hreg
  have hbase : laurentWPoint κ z.toPoint4 = lambda :=
    laurentWPoint_eq_level_of_mem_baseFiber κ lambda z hz
  have hmap :=
    (laurentWPoint_hasStrictFDerivAt κ z).map_implicitFunction_eq
      (laurentTotalDifferential_range_eq_top hsurj)
  have htend :
      Tendsto
        (fun y : (laurentTotalDifferential κ z).ker => (lambda, y))
        (𝓝 0)
        (𝓝 (laurentWPoint κ z.toPoint4,
          (0 : (laurentTotalDifferential κ z).ker))) := by
    simpa [hbase] using
      ((tendsto_const_nhds :
          Tendsto
            (fun _ : (laurentTotalDifferential κ z).ker => lambda)
            (𝓝 0) (𝓝 lambda)).prodMk_nhds tendsto_id)
  have hpull := htend.eventually hmap
  filter_upwards [hpull] with y hy
  simpa [laurentRegularImplicitFunction, laurentImplicitFunction, hsurj] using hy

/--
The fixed-level implicit function tends to the regular base point as the kernel
parameter tends to zero.
-/
theorem tendsto_laurentRegularImplicitFunction_level
    (κ lambda : ℂ) (z : Torus4)
    (hz : z ∈ baseFiber κ lambda)
    (hreg : κ = 0 ∨ lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ) :
    Tendsto
      (fun y : (laurentTotalDifferential κ z).ker =>
        laurentRegularImplicitFunction κ lambda z hz hreg lambda y)
      (𝓝 0)
      (𝓝 z.toPoint4) := by
  let hsurj :=
    laurentTotalDifferential_surjective_on_baseFiber_of_regular_regime hz hreg
  have hbase : laurentWPoint κ z.toPoint4 = lambda :=
    laurentWPoint_eq_level_of_mem_baseFiber κ lambda z hz
  simpa [laurentRegularImplicitFunction, laurentImplicitFunction, hsurj, hbase] using
    (laurentWPoint_hasStrictFDerivAt κ z).tendsto_implicitFunction
      (laurentTotalDifferential_range_eq_top hsurj)
      (tendsto_const_nhds :
        Tendsto
          (fun _ : (laurentTotalDifferential κ z).ker => lambda)
          (𝓝 0) (𝓝 lambda))
      tendsto_id

/--
For every sufficiently small kernel parameter, the fixed-level implicit point
has a concrete lift lying in `baseFiber κ lambda`.

Together with `eventually_regularLevel_reconstruct_from_kernelCoordinate`,
this is the two-sided local kernel parametrization needed by F14. It is still
only a local analytic statement, not a manifold or scheme smoothness theorem.
-/
theorem eventually_regularImplicitFunction_exists_baseFiber_lift
    (κ lambda : ℂ) (z : Torus4)
    (hz : z ∈ baseFiber κ lambda)
    (hreg : κ = 0 ∨ lambda ^ 5 ≠ (5 : ℂ) ^ 5 * κ) :
    ∀ᶠ y : (laurentTotalDifferential κ z).ker in 𝓝 0,
      ∃ w : Torus4,
        w ∈ baseFiber κ lambda ∧
          w.toPoint4 =
            laurentRegularImplicitFunction κ lambda z hz hreg lambda y := by
  have hlift :=
    (tendsto_laurentRegularImplicitFunction_level κ lambda z hz hreg).eventually
      (eventually_laurentWPoint_eq_iff_exists_baseFiber_lift κ lambda z)
  filter_upwards
    [hlift,
      eventually_laurentWPoint_regularImplicitFunction_eq_level κ lambda z hz hreg]
      with y hyLift hyLevel
  exact hyLift.mp hyLevel

end SelfSimilarCY

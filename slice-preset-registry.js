"use strict";

/* Two declared adapters only: the admitted Laurent slice and one canonical Fermat cross-section. */
(function attachSlicePresetRegistry(globalObject) {
  function math() {
    if (typeof module !== "undefined" && module.exports) return require("./geometry-exploration-math.js");
    if (!globalObject.GeometryExplorationMath) throw new Error("GeometryExplorationMath is required.");
    return globalObject.GeometryExplorationMath;
  }

  const PRESETS = Object.freeze({
    "laurent-balanced": Object.freeze({ id: "laurent-balanced", label: "Current family — Balanced torus", formulaFamilyId: "W_kappa_torus4_v1", parameters: Object.freeze({ lambda: 1, kappa: 1, r1: 1, r2: 1, c3Magnitude: 1, c3Argument: 0, resolution: 64 }) }),
    "laurent-open-wings": Object.freeze({ id: "laurent-open-wings", label: "Current family — Open wings", formulaFamilyId: "W_kappa_torus4_v1", parameters: Object.freeze({ lambda: 1, kappa: 0.6, r1: 1.15, r2: 0.85, c3Magnitude: 1, c3Argument: 0, resolution: 64 }) }),
    "laurent-near-critical": Object.freeze({ id: "laurent-near-critical", label: "Current family — Near critical", formulaFamilyId: "W_kappa_torus4_v1", parameters: Object.freeze({ lambda: 2, kappa: 0.0103, r1: 1, r2: 1, c3Magnitude: 1, c3Argument: 0, resolution: 64 }) }),
    "fermat-quintic": Object.freeze({ id: "fermat-quintic", label: "Familiar quintic — 25 phase patches", formulaFamilyId: "fermat_quintic_cross_section_v1", parameters: Object.freeze({ xiWindow: 1.2, resolution: 24 }), demonstrationSourceId: "fermat-k0-0-t12-x7", demonstrationRadius: 4 })
  });

  function preset(id) {
    const value = PRESETS[id];
    if (!value) throw new RangeError("Unknown declared slice preset.");
    return value;
  }

  function finite(value, name, lo, hi) {
    if (!Number.isFinite(value) || value < lo || value > hi) throw new RangeError(`${name} must be in [${lo}, ${hi}].`);
    return value;
  }

  function validateParameters(id, input = {}) {
    const selected = preset(id), values = { ...selected.parameters, ...input };
    if (selected.formulaFamilyId === "W_kappa_torus4_v1") {
      ["lambda", "kappa"].forEach((name) => finite(Number(values[name]), name, -3, 3));
      ["r1", "r2", "c3Magnitude"].forEach((name) => finite(Number(values[name]), name, 0.25, 2.5));
      finite(Number(values.c3Argument), "c3Argument", -Math.PI, Math.PI);
      finite(Number(values.resolution), "resolution", 24, 112);
    } else {
      finite(Number(values.xiWindow), "xiWindow", 0.2, 2);
      finite(Number(values.resolution), "resolution", 8, 112);
    }
    return Object.freeze({ ...values, resolution: Math.round(Number(values.resolution)) });
  }

  function changedScene(scene, parameters) {
    const copy = structuredClone(scene);
    copy.mathematics.parameters.lambda = parameters.lambda;
    copy.mathematics.parameters.kappa = parameters.kappa;
    return copy;
  }

  function sharedRecord(record, selected, parameters) {
    const sourceRecords = Object.freeze(record.branches.flatMap((branch) => branch.records));
    const defaultCandidate = record.localChartCandidates?.[0] || record.branches[0]?.records[Math.floor(record.thetaSegments / 2) * (record.phiSegments + 1) + Math.max(4, Math.min(record.phiSegments - 4, Math.round(record.phiSegments * .22)))]?.id;
    return Object.freeze({ ...record, slicePresetId: selected.id, formulaFamilyId: selected.formulaFamilyId, sourceRecords, meshBranches: record.branches,
      qualification: "regular", truthFlags: Object.freeze({ completeX0Rendered: false, completeGlobalXnRendered: false, finiteSample: true, twoParameterSlice: true, projectionApplied: true,
        formulaFamilyId: selected.formulaFamilyId, slicePresetId: selected.id, phasePatchSymmetryDisplayed: selected.id === "fermat-quintic", localInverseSimilarityCompared: false,
        globalSelfSimilarityClaimed: false, fractalBoundaryClaimed: false, geometricZoomApplied: false }),
      localChartCandidates: Object.freeze(record.localChartCandidates || [defaultCandidate]), demonstrationSourceId: selected.demonstrationSourceId || defaultCandidate,
      demonstrationRadius: selected.demonstrationRadius || 4,
      provenance: Object.freeze({ adapter: selected.formulaFamilyId, preset: selected.id, parameters, fermatSource: selected.id === "fermat-quintic" ? "Hanson 1994, CP2-94" : null }) });
  }

  const laurentAdapter = Object.freeze({
    validateParameters: (input) => validateParameters("laurent-balanced", input),
    generateSlice(scene, input) {
      const parameters = validateParameters(input.slicePresetId || "laurent-balanced", input);
      const selected = preset(input.slicePresetId || "laurent-balanced"), M = math();
      const c3 = { re: parameters.c3Magnitude * Math.cos(parameters.c3Argument), im: parameters.c3Magnitude * Math.sin(parameters.c3Argument) };
      return sharedRecord(M.declaredSlice(changedScene(scene, parameters), { thetaSegments: parameters.resolution, phiSegments: Math.max(24, Math.round(parameters.resolution * .72)), r1: parameters.r1, r2: parameters.r2, c3 }), selected, parameters);
    },
    generateLocalPatch: (scene, slice, request, options) => math().localBranchPatch(changedScene(scene, slice.provenance.parameters), slice, request, options),
    describeBoundary: (input) => `Wκ slice: z1=r1e^(iθ), z2=r2e^(iφ), z3=c3≠0; z4 is a quadratic root. 3D projection is (Re z1, Im z1, Re z4).`
  });

  const fermatAdapter = Object.freeze({
    validateParameters: (input) => validateParameters("fermat-quintic", input),
    generateSlice(_scene, input) {
      const parameters = validateParameters("fermat-quintic", input), M = math(), selected = preset("fermat-quintic");
      const resolution = Math.min(24, parameters.resolution);
      return sharedRecord(M.fermatQuinticSlice({ thetaSegments: resolution, xiSegments: Math.max(8, 2 * Math.round(resolution * .55 / 2)), xiWindow: parameters.xiWindow }), selected, parameters);
    },
    generateLocalPatch: (scene, slice, request, options) => math().localBranchPatch(scene, slice, request, options),
    describeBoundary: () => `Fermat quintic: Z0=1 and z3=z4=-1, so z1^5+z2^5=1. The 25 phase-related patches are a 2D slice, projected by (Re z1, Im z1, Re z2).`
  });

  function adapterFor(id) { return preset(id).formulaFamilyId === "fermat_quintic_cross_section_v1" ? fermatAdapter : laurentAdapter; }
  function generateSlice(scene, id, input) { return adapterFor(id).generateSlice(scene, { ...input, slicePresetId: id }); }
  function generateLocalPatch(scene, slice, request, options) {
    const adapter = adapterFor(slice.slicePresetId), result = adapter.generateLocalPatch(scene, slice, request, options);
    let suggestedEligibleSourceId = null;
    if (result.kind === "local_branch_patch_refusal" && !/cap/.test(result.reason)) {
      const selected = slice.branches[request.branch]?.records[request.vertexIndex], candidates = slice.sourceRecords
        .filter((record) => record.valid && record.coordinates.every((z) => Math.hypot(z.re, z.im) > 1e-10) && record.i >= request.radius && record.i <= slice.thetaSegments - request.radius && record.j >= request.radius && record.j <= slice.phiSegments - request.radius)
        .sort((a, b) => (Math.abs(a.i - (selected?.i ?? 0)) + Math.abs(a.j - (selected?.j ?? 0))) - (Math.abs(b.i - (selected?.i ?? 0)) + Math.abs(b.j - (selected?.j ?? 0))) || a.id.localeCompare(b.id));
      for (const candidate of candidates.slice(0, 96)) {
        const retry = adapter.generateLocalPatch(scene, slice, { ...request, branch: candidate.branch, vertexIndex: candidate.i * (slice.phiSegments + 1) + candidate.j }, options);
        if (retry.kind === "local_inverse_branch_patch") { suggestedEligibleSourceId = candidate.id; break; }
      }
    }
    return Object.freeze({ ...result, slicePresetId: slice.slicePresetId, formulaFamilyId: slice.formulaFamilyId,
      suggestedEligibleSourceId, reason: suggestedEligibleSourceId ? `${result.reason} Nearest reviewed deterministic eligible sample: ${suggestedEligibleSourceId}.` : result.reason,
      truthFlags: Object.freeze({ ...result.truthFlags, formulaFamilyId: slice.formulaFamilyId, slicePresetId: slice.slicePresetId,
        phasePatchSymmetryDisplayed: slice.formulaFamilyId === "fermat_quintic_cross_section_v1", localInverseSimilarityCompared: result.kind === "local_inverse_branch_patch",
        globalSelfSimilarityClaimed: false, fractalBoundaryClaimed: false, completeX0Rendered: false, completeGlobalXnRendered: false }) });
  }
  function describeBoundary(id, input) { return adapterFor(id).describeBoundary(validateParameters(id, input)); }

  const api = Object.freeze({ PRESETS, preset, validateParameters, generateSlice, generateLocalPatch, describeBoundary });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.SlicePresetRegistry = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

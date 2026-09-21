"use strict";

/*
 * The numerical layer for the immersive viewer.  It deliberately knows no
 * Three.js: the same declared maps are exercised by Node and the browser.
 */
(function attachGeometryExplorationMath(globalObject) {
  const FORMULA_ID = "W_kappa_torus4_v1";
  const SLICE_ID = "unit_torus_pair_z3_one_quadratic_lift_v1";
  const AMBIENT_PROJECTION_ID = "re_z1_im_z1_re_z4_v1";

  class GeometryExplorationError extends Error {
    constructor(message) { super(message); this.name = "GeometryExplorationError"; }
  }

  function evaluator() {
    if (typeof module !== "undefined" && module.exports) return require("./laurent-evaluator.js");
    if (!globalObject.LaurentEvaluator) throw new GeometryExplorationError("LaurentEvaluator is required.");
    return globalObject.LaurentEvaluator;
  }

  function sampler() {
    if (typeof module !== "undefined" && module.exports) return require("./base-geometric-sampler.js");
    if (!globalObject.BaseGeometricSampler) throw new GeometryExplorationError("BaseGeometricSampler is required.");
    return globalObject.BaseGeometricSampler;
  }

  function powerEvaluator() {
    if (typeof module !== "undefined" && module.exports) return require("./torus-power-evaluator.js");
    if (!globalObject.TorusPowerEvaluator) throw new GeometryExplorationError("TorusPowerEvaluator is required.");
    return globalObject.TorusPowerEvaluator;
  }

  function finiteInteger(value, name, minimum) {
    if (!Number.isSafeInteger(value) || value < minimum) throw new GeometryExplorationError(name + " must be an integer >= " + minimum + ".");
  }

  function phase(z) { return Math.atan2(z.im, z.re); }

  function rootPair(context, z1, z2) {
    const E = evaluator();
    const z3 = E.complex(1, 0);
    const mu = E.sub(E.sub(E.sub(context.lambda, z1), z2), z3);
    const c = E.div(context.kappa, E.mul(z1, z2));
    const d = E.sub(E.mul(mu, mu), E.scale(c, 4));
    const r = E.sqrtPrincipal(d);
    const roots = [E.scale(E.add(mu, r), 0.5), E.scale(E.sub(mu, r), 0.5)];
    return roots.sort((a, b) => a.re === b.re ? a.im - b.im : a.re - b.re);
  }

  function declaredSlice(scene, options = {}) {
    const E = evaluator();
    const thetaSegments = options.thetaSegments || 112;
    const phiSegments = options.phiSegments || 72;
    finiteInteger(thetaSegments, "thetaSegments", 8);
    finiteInteger(phiSegments, "phiSegments", 8);
    const context = E.createEvaluationContext(scene);
    if (context.formulaId !== FORMULA_ID) throw new GeometryExplorationError("Only W_kappa_torus4_v1 is admitted.");
    const branches = [0, 1].map(() => ({ positions: [], phases: [], residuals: [], valid: [], indices: [], records: [] }));
    let maxResidual = 0;

    for (let i = 0; i <= thetaSegments; i += 1) {
      const theta = (i / thetaSegments) * Math.PI * 2;
      const z1 = E.complex(Math.cos(theta), Math.sin(theta));
      for (let j = 0; j <= phiSegments; j += 1) {
        const phi = (j / phiSegments) * Math.PI * 2;
        const z2 = E.complex(Math.cos(phi), Math.sin(phi));
        const roots = rootPair(context, z1, z2);
        roots.forEach((z4, branch) => {
          const record = E.evaluateResidual(context, [z1, z2, E.complex(1, 0), z4]);
          const valid = E.abs(z4) > 1e-10 && Number.isFinite(record.residualMagnitude);
          branches[branch].positions.push(z1.re, z1.im, z4.re);
          branches[branch].phases.push((phase(z4) + Math.PI) / (2 * Math.PI));
          branches[branch].residuals.push(record.residualMagnitude);
          branches[branch].valid.push(valid);
          const residualTolerance = 1e-10 * Math.max(1, record.scaleEstimate || 1);
          branches[branch].records.push(Object.freeze({
            id: `slice-b${branch}-i${i}-j${j}`,
            branch, i, j, theta, phi, coordinates: Object.freeze([z1, z2, E.complex(1, 0), z4]),
            residualMagnitude: record.residualMagnitude, residualTolerance, valid
          }));
          maxResidual = Math.max(maxResidual, record.residualMagnitude);
        });
      }
    }
    const row = phiSegments + 1;
    branches.forEach((branch) => {
      for (let i = 0; i < thetaSegments; i += 1) for (let j = 0; j < phiSegments; j += 1) {
        const a = i * row + j, b = a + row, c = b + 1, d = a + 1;
        if (branch.valid[a] && branch.valid[b] && branch.valid[c]) branch.indices.push(a, b, c);
        if (branch.valid[a] && branch.valid[c] && branch.valid[d]) branch.indices.push(a, c, d);
      }
    });
    return Object.freeze({
      kind: "declared_parameter_subfamily",
      sliceId: SLICE_ID,
      formulaId: FORMULA_ID,
      parameterDomain: "(theta, phi) in S1 x S1; z1=exp(i theta), z2=exp(i phi), z3=1; z4 solves the displayed quadratic",
      ambientProjection: "(Re(z1), Im(z1), Re(z4))",
      ambientProjectionId: AMBIENT_PROJECTION_ID,
      fixedCoordinates: ["z3=1"],
      omittedFromDisplayAxes: ["z2 (retained as the phi parameter)", "Im(z4)"],
      rootLabels: "ordered numerical roots of the quadratic only; not sheets or covering branches",
      thetaSegments, phiSegments,
      pointCount: branches.reduce((count, branch) => count + branch.valid.filter(Boolean).length, 0),
      maxResidual,
      branches: Object.freeze(branches.map((branch) => Object.freeze({
        positions: new Float32Array(branch.positions), phases: new Float32Array(branch.phases),
        residuals: new Float64Array(branch.residuals), valid: Object.freeze(branch.valid), records: Object.freeze(branch.records),
        indices: new Uint32Array(branch.indices)
      })))
    });
  }

  function unwrapNear(angle, reference) {
    return angle + Math.round((reference - angle) / (2 * Math.PI)) * 2 * Math.PI;
  }

  function logCoordinates(coordinates, centerArguments) {
    const E = evaluator();
    return Object.freeze(E.validateCoordinates(coordinates).map((z, index) => Object.freeze({
      re: Math.log(E.abs(z)), im: unwrapNear(Math.atan2(z.im, z.re), centerArguments[index])
    })));
  }

  function expLogCoordinates(logs) {
    const E = evaluator();
    return Object.freeze(logs.map((w) => E.complex(Math.exp(w.re) * Math.cos(w.im), Math.exp(w.re) * Math.sin(w.im))));
  }

  function localDisplay(logs, centerLogs, scale = 1) {
    return Object.freeze([
      (logs[0].re - centerLogs[0].re) * scale,
      (logs[0].im - centerLogs[0].im) * scale,
      (logs[3].re - centerLogs[3].re) * scale
    ]);
  }

  function patchRefusal(reason, sourcePatchId, details = {}) {
    return Object.freeze({ kind: "local_branch_patch_refusal", formulaId: FORMULA_ID, sourcePatchId, reason, points: Object.freeze([]), ...details,
      truthFlags: Object.freeze({ completeX0Rendered: false, completeGlobalXnRendered: false, finiteSample: true,
        twoParameterSlice: true, projectionApplied: true, geometricZoomApplied: false, fractalBoundaryClaimed: false }) });
  }

  function localBranchPatch(scene, slice, request, options = {}) {
    const E = evaluator(), P = powerEvaluator();
    const branch = Number(request.branch), vertexIndex = Number(request.vertexIndex), radius = Number(request.radius ?? 4), D = P.validateD(request.D);
    const rootMultiIndex = request.rootMultiIndex || [0, 0, 0, 0];
    const sourcePatchId = `slice-local-b${branch}-v${vertexIndex}-r${radius}`;
    if (request.depth !== undefined && request.depth !== 1) return patchRefusal("Only one selected inverse-branch depth is admitted for this local comparison.", sourcePatchId, { requiredPointCount: "0", generatedPointCountOnRefusal: 0 });
    if (!slice || slice.kind !== "declared_parameter_subfamily" || !Number.isSafeInteger(branch) || !slice.branches[branch] ||
        !Number.isSafeInteger(vertexIndex) || !Number.isSafeInteger(radius) || radius < 1 ||
        !Array.isArray(rootMultiIndex) || rootMultiIndex.length !== 4 || rootMultiIndex.some((k) => !Number.isSafeInteger(k) || k < 0 || k >= D)) {
      return patchRefusal("The selected vertex, patch radius, or root tuple is invalid.", sourcePatchId);
    }
    const side = radius * 2 + 1, row = slice.phiSegments + 1;
    const requiredPointCount = BigInt(side * side);
    const cap = Number.isSafeInteger(options.cap) && options.cap > 0 ? options.cap : Number.MAX_SAFE_INTEGER;
    if (requiredPointCount > BigInt(cap)) return patchRefusal("The requested local patch exceeds its materialization cap; no child samples were generated.", sourcePatchId, { requiredPointCount: requiredPointCount.toString(), cap, generatedPointCountOnRefusal: 0 });
    const seed = slice.branches[branch].records[vertexIndex];
    if (!seed?.valid || seed.residualMagnitude > seed.residualTolerance) return patchRefusal("The selected mesh vertex is not a validated source point.", sourcePatchId, { requiredPointCount: requiredPointCount.toString(), cap, generatedPointCountOnRefusal: 0 });
    if (seed.i - radius < 0 || seed.i + radius > slice.thetaSegments || seed.j - radius < 0 || seed.j + radius > slice.phiSegments) {
      return patchRefusal("The requested patch reaches the sampled parameter boundary; choose an interior vertex.", sourcePatchId, { requiredPointCount: requiredPointCount.toString(), cap, generatedPointCountOnRefusal: 0 });
    }
    const context = E.createEvaluationContext(scene);
    const centerArguments = seed.coordinates.map((z) => Math.atan2(z.im, z.re));
    const centerLogs = logCoordinates(seed.coordinates, centerArguments);
    const argumentContinuityLimit = Number.isFinite(options.argumentContinuityLimit) && options.argumentContinuityLimit > 0 ? options.argumentContinuityLimit : Math.PI;
    const patchIndices = [];
    const candidatesByIndex = new Map();
    for (let di = -radius; di <= radius; di += 1) for (let dj = -radius; dj <= radius; dj += 1) {
      const i = seed.i + di, j = seed.j + dj, index = i * row + j;
      const candidates = slice.branches.map((candidateBranch) => candidateBranch.records[index]).filter((record) => record?.valid);
      if (candidates.length !== 2 || candidates.some((candidate) => candidate.residualMagnitude > candidate.residualTolerance)) {
        return patchRefusal("A patch vertex failed its numerical source validation.", sourcePatchId, { requiredPointCount: requiredPointCount.toString(), cap, generatedPointCountOnRefusal: 0 });
      }
      const rootSeparation = E.abs(E.sub(candidates[0].coordinates[3], candidates[1].coordinates[3]));
      const rootScale = Math.max(1, E.abs(candidates[0].coordinates[3]), E.abs(candidates[1].coordinates[3]));
      if (rootSeparation <= 1e-7 * rootScale) {
        return patchRefusal("The quadratic roots are numerically unresolved inside this patch.", sourcePatchId, { requiredPointCount: requiredPointCount.toString(), cap, generatedPointCountOnRefusal: 0 });
      }
      patchIndices.push(index);
      candidatesByIndex.set(index, candidates);
    }

    // A branch label from the global slice is not a guarantee of local continuity.
    // Start at the exact selected source record, then accept a patch only when every
    // already-reached path chooses the same nearest continuation.  This deliberately
    // refuses path-dependent/monodromy-sensitive patches instead of replacing the
    // visitor's selected center with a different quadratic root.
    const selectedByIndex = new Map([[vertexIndex, seed]]);
    const queue = [vertexIndex];
    let maxContinuationStep = 0;
    while (queue.length) {
      const currentIndex = queue.shift();
      const current = selectedByIndex.get(currentIndex);
      const i = Math.floor(currentIndex / row), j = currentIndex % row;
      for (const [neighborI, neighborJ] of [[i, j - 1], [i - 1, j], [i + 1, j], [i, j + 1]]) {
        const neighborIndex = neighborI * row + neighborJ;
        if (!candidatesByIndex.has(neighborIndex)) continue;
        const ranked = candidatesByIndex.get(neighborIndex)
          .map((record) => ({ record, distance: E.abs(E.sub(record.coordinates[3], current.coordinates[3])) }))
          .sort((a, b) => a.distance - b.distance || a.record.id.localeCompare(b.record.id));
        maxContinuationStep = Math.max(maxContinuationStep, ranked[0].distance);
        const existing = selectedByIndex.get(neighborIndex);
        if (existing) {
          if (existing.id !== ranked[0].record.id) {
            return patchRefusal("The selected local root branch is path-dependent inside this patch.", sourcePatchId, {
              requiredPointCount: requiredPointCount.toString(), cap, generatedPointCountOnRefusal: 0,
              selectedCenterId: seed.id, conflictingVertexId: existing.id, expectedVertexId: ranked[0].record.id
            });
          }
        } else {
          selectedByIndex.set(neighborIndex, ranked[0].record);
          queue.push(neighborIndex);
        }
      }
    }
    if (selectedByIndex.size !== patchIndices.length || selectedByIndex.get(vertexIndex)?.id !== seed.id) {
      return patchRefusal("The selected local root branch could not remain anchored to the requested center.", sourcePatchId, { requiredPointCount: requiredPointCount.toString(), cap, generatedPointCountOnRefusal: 0, selectedCenterId: seed.id });
    }

    const rows = [];
    let maxSourceResidualMagnitude = 0;
    for (const index of patchIndices) {
      const selected = selectedByIndex.get(index);
      const logs = logCoordinates(selected.coordinates, centerArguments);
      const i = Math.floor(index / row), j = index % row;
      const adjacent = [];
      if (j > seed.j - radius) adjacent.push(rows[rows.length - 1]);
      if (i > seed.i - radius) adjacent.push(rows[rows.length - side]);
      if (adjacent.some((neighbor) => logs.some((w, coordinate) => Math.abs(w.im - neighbor.logs[coordinate].im) > argumentContinuityLimit))) {
        return patchRefusal("The requested patch crosses the configured local argument-continuity bound.", sourcePatchId, { requiredPointCount: requiredPointCount.toString(), cap, generatedPointCountOnRefusal: 0 });
      }
      maxSourceResidualMagnitude = Math.max(maxSourceResidualMagnitude, selected.residualMagnitude);
      rows.push(Object.freeze({ ...selected, logs }));
    }
    const tolerance = options?.powerResidualTolerance;
    const children = [];
    let maxParentResidualMagnitude = 0, maxMembershipResidualMagnitude = 0, maxLocalScaleError = 0;
    for (const parent of rows) {
      const childLogs = Object.freeze(parent.logs.map((w, index) => Object.freeze({ re: w.re / D, im: (w.im + 2 * Math.PI * rootMultiIndex[index]) / D })));
      const childCoordinates = expLogCoordinates(childLogs);
      const parentRelation = P.powerResidualRecord(D, childCoordinates, parent.coordinates, tolerance);
      const membership = E.evaluateResidual(context, P.coordinatePower(D, childCoordinates));
      const childCenterLogs = Object.freeze(centerLogs.map((w, index) => Object.freeze({ re: w.re / D, im: (w.im + 2 * Math.PI * rootMultiIndex[index]) / D })));
      const comparison = childLogs.map((w, index) => Math.max(
        Math.abs(D * (w.re - childCenterLogs[index].re) - (parent.logs[index].re - centerLogs[index].re)),
        Math.abs(D * (w.im - childCenterLogs[index].im) - (parent.logs[index].im - centerLogs[index].im))
      ));
      maxLocalScaleError = Math.max(maxLocalScaleError, ...comparison);
      maxParentResidualMagnitude = Math.max(maxParentResidualMagnitude, parentRelation.maxResidualMagnitude);
      maxMembershipResidualMagnitude = Math.max(maxMembershipResidualMagnitude, membership.residualMagnitude);
      children.push(Object.freeze({
        id: `local-${parent.id}-k${rootMultiIndex.join("")}`, parentId: parent.id, rootMultiIndex: Object.freeze([...rootMultiIndex]),
        coordinates: childCoordinates, logs: childLogs, parentRelation, membershipResidualMagnitude: membership.residualMagnitude,
        rawPosition: Object.freeze([childCoordinates[0].re, childCoordinates[0].im, childCoordinates[3].re]),
        normalizedLocalPosition: localDisplay(childLogs, childCenterLogs, D)
      }));
    }
    const parentPoints = Object.freeze(rows.map((parent) => Object.freeze({
      id: parent.id, coordinates: parent.coordinates, logs: parent.logs, rawPosition: Object.freeze([parent.coordinates[0].re, parent.coordinates[0].im, parent.coordinates[3].re]),
      normalizedLocalPosition: localDisplay(parent.logs, centerLogs), residualMagnitude: parent.residualMagnitude
    })));
    const indices = [];
    for (let i = 0; i < side - 1; i += 1) for (let j = 0; j < side - 1; j += 1) {
      const a = i * side + j, b = a + side, c = b + 1, d = a + 1; indices.push(a, b, c, a, c, d);
    }
    return Object.freeze({ kind: "local_inverse_branch_patch", formulaId: FORMULA_ID, sourcePatchId, branch, selectedVertexId: seed.id,
      D, rootMultiIndex: Object.freeze([...rootMultiIndex]), side, pointCount: parentPoints.length, parentPoints, children: Object.freeze(children), indices: new Uint32Array(indices),
      chart: Object.freeze({ kind: "center_anchored_path_consistent_nearest_root_continuation_over_bounded_slice_patch", radius, centerId: seed.id,
        selectedCenterId: seed.id, argumentContinuityLimit, pathConsistencyChecked: true, maxContinuationStep }),
      preflight: Object.freeze({ requiredPointCount: requiredPointCount.toString(), cap, admitted: true, generatedPointCountOnRefusal: 0 }),
      maxSourceResidualMagnitude, maxParentResidualMagnitude, maxMembershipResidualMagnitude, maxLocalScaleError,
      truthFlags: Object.freeze({ completeX0Rendered: false, completeGlobalXnRendered: false, finiteSample: true,
        twoParameterSlice: true, projectionApplied: true, geometricZoomApplied: false, fractalBoundaryClaimed: false }) });
  }

  function finiteSampleCloud(scene, config) {
    const model = sampler().generateSamples(scene, config);
    const E = evaluator();
    const points = model.samples.map((sample) => Object.freeze({
      id: sample.sampleId,
      position: Object.freeze([sample.coordinates[0].re, sample.coordinates[0].im, sample.coordinates[3].re]),
      phase: (phase(sample.coordinates[3]) + Math.PI) / (2 * Math.PI),
      residual: sample.membership.residualMagnitude,
      source: sample
    }));
    return Object.freeze({ kind: "finite_validated_sample_cloud", formulaId: FORMULA_ID, sampleModel: model, points: Object.freeze(points), evaluator: E });
  }

  function torusEmbedding(scene, config) {
    const cloud = finiteSampleCloud(scene, config);
    const points = cloud.points.map((point) => {
      const z = point.source.coordinates;
      const a = phase(z[0]), b = phase(z[1]);
      const h = Math.max(-1.2, Math.min(1.2, Math.log(EvaluatorAbs(z[2]))));
      const R = 2.4, r = 0.82;
      return Object.freeze({ ...point, position: Object.freeze([
        (R + r * Math.cos(b)) * Math.cos(a),
        (R + r * Math.cos(b)) * Math.sin(a),
        r * Math.sin(b) + h * 0.3
      ]) });
    });
    return Object.freeze({ ...cloud, kind: "phase_torus_display_embedding", points: Object.freeze(points),
      encoding: "arg(z1), arg(z2), and clipped log|z3| embedded into a display torus; this torus is not X_0" });
  }

  function EvaluatorAbs(z) { return Math.hypot(z.re, z.im); }

  const api = Object.freeze({ FORMULA_ID, SLICE_ID, AMBIENT_PROJECTION_ID, GeometryExplorationError, declaredSlice, localBranchPatch, finiteSampleCloud, torusEmbedding });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.GeometryExplorationMath = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

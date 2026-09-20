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
    const branches = [0, 1].map(() => ({ positions: [], phases: [], residuals: [], valid: [], indices: [] }));
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
      maxResidual,
      branches: Object.freeze(branches.map((branch) => Object.freeze({
        positions: new Float32Array(branch.positions), phases: new Float32Array(branch.phases),
        residuals: new Float64Array(branch.residuals), valid: Object.freeze(branch.valid),
        indices: new Uint32Array(branch.indices)
      })))
    });
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

  const api = Object.freeze({ FORMULA_ID, SLICE_ID, AMBIENT_PROJECTION_ID, GeometryExplorationError, declaredSlice, finiteSampleCloud, torusEmbedding });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.GeometryExplorationMath = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

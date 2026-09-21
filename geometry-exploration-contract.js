"use strict";

(function attachGeometryExplorationContract(globalObject) {
  const PROJECTION_ID = "re_z1_im_z1_re_z4_v1";
  const SIMPLE_PROJECTION_ID = "fixed_linear_real8_to_r3_v1";
  const DISCRIMINANT_SOURCE = "docs/CONCRETE_GEOMETRY_ADMISSION_CONTRACT_v0_01.md#6-smoothness--discriminant-discipline";

  function dependency(name, file) {
    if (typeof module !== "undefined" && module.exports) return require(file);
    if (!globalObject[name]) throw new Error(name + " is required.");
    return globalObject[name];
  }

  function decimal(value) {
    const source = String(value);
    const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(source);
    if (!match || (match[3]?.length || 0) > 12) return null;
    const digits = match[2] + (match[3] || "");
    return { numerator: BigInt((match[1] || "") + digits), denominator: 10n ** BigInt(match[3]?.length || 0) };
  }

  function discriminant(lambda, kappa) {
    const l = decimal(lambda), k = decimal(kappa);
    const ln = Number(lambda), kn = Number(kappa);
    const evidence = { formula: "kappa != 0 and lambda^5 = 5^5 kappa", source: DISCRIMINANT_SOURCE,
      parameterDomain: "real slice of complex parameters", inputModel: "exact displayed decimal",
      rendererEncoding: "binary64 approximation", smoothnessTheoremClaimed: false };
    if (!l || !k || !Number.isFinite(ln) || !Number.isFinite(kn)) return Object.freeze({ status: "numerical-inconclusive", ...evidence });
    if (k.numerator === 0n) return Object.freeze({ status: "regular", exactDecimalEquality: false, ...evidence });
    const left = l.numerator ** 5n * k.denominator;
    const right = 3125n * k.numerator * l.denominator ** 5n;
    if (left === right) return Object.freeze({ status: "singular", exactDecimalEquality: true, ...evidence });
    const gap = Math.abs(ln ** 5 - 3125 * kn);
    const uncertainty = 1e-12 * Math.max(1, Math.abs(ln ** 5), Math.abs(3125 * kn));
    return Object.freeze({ status: gap <= uncertainty ? "numerical-inconclusive" : "regular",
      exactDecimalEquality: false, ...evidence });
  }

  function preflight(seedCount, D, depth, cap) {
    if (![seedCount, D, depth, cap].every(Number.isSafeInteger) || seedCount < 1 || D < 2 || depth < 0 || cap < 1) {
      throw new TypeError("Invalid finite pullback preflight request.");
    }
    const requiredPointCount = BigInt(seedCount) * BigInt(D) ** (4n * BigInt(depth));
    return Object.freeze({ seedCount, D, depth, requiredPointCount: requiredPointCount.toString(), cap,
      admitted: requiredPointCount <= BigInt(cap), generatedPointCountOnRefusal: 0,
      uncomputedOutsideFiniteSeed: true });
  }

  function simpleProjection(coordinates) {
    const values = coordinates.flatMap((z) => [z.re, z.im]);
    return Object.freeze([
      values[0] + 0.47 * values[2] + 0.23 * values[4] + 0.11 * values[6],
      values[1] + 0.47 * values[3] + 0.23 * values[5] + 0.11 * values[7],
      0.31 * values[0] - 0.19 * values[3] + 0.37 * values[4] - 0.29 * values[7]
    ]);
  }

  function projectedCollisionReport(points, property = "simplePosition") {
    const groups = new Map();
    points.forEach((point) => {
      const key = point[property].map((value) => Number(value).toPrecision(11)).join(":");
      groups.set(key, [...(groups.get(key) || []), point.id]);
    });
    const collisions = [...groups.values()].filter((ids) => ids.length > 1).map((ids) => Object.freeze(ids));
    return Object.freeze({ projectionId: property === "simplePosition" ? SIMPLE_PROJECTION_ID : PROJECTION_ID,
      distinctVisibleMarks: groups.size, mergedSourcePointCount: points.length - groups.size, collisions: Object.freeze(collisions) });
  }

  function project(point) {
    const z = point.coordinates;
    return Object.freeze({ id: point.pointId, parentId: point.parentId, ancestorSampleId: point.ancestorSampleId,
      rootMultiIndex: point.rootMultiIndex, parentRelation: point.parentRelation, baseMembership: point.baseMembership,
      source: point, position: Object.freeze([z[0].re, z[0].im, z[3].re]), simplePosition: simpleProjection(z),
      phase: (Math.atan2(z[3].im, z[3].re) + Math.PI) / (2 * Math.PI) });
  }

  function createPullback(scene, baseConfig, pullbackConfig, request) {
    const Sampler = dependency("BaseGeometricSampler", "./base-geometric-sampler.js");
    const Engine = dependency("GeometricPullbackEngine", "./geometric-pullback-engine.js");
    const Scoped = dependency("AncestorScopedPullbackRuntime", "./ancestor-scoped-pullback-runtime.js");
    const normalized = Engine.validateSceneAndD(scene);
    const config = Engine.validateConfig(pullbackConfig);
    const seed = Sampler.generateSamples(scene, baseConfig);
    const scope = request.scope;
    if (scope !== "finite-seed" && scope !== "one-ancestor") throw new TypeError("Unknown pullback scope.");
    const ancestorIndex = request.ancestorIndex ?? 0;
    if (scope === "one-ancestor" && (!Number.isSafeInteger(ancestorIndex) || ancestorIndex < 0 || ancestorIndex >= seed.sampleCount)) {
      throw new RangeError("Selected ancestor must belong to the finite X_0 seed.");
    }
    const selectedAncestorId = scope === "one-ancestor" ? seed.samples[ancestorIndex].sampleId : null;
    const ancestorCoordinates = scope === "one-ancestor" ? seed.samples[ancestorIndex].coordinates : null;
    const ancestorPosition = ancestorCoordinates ? Object.freeze([ancestorCoordinates[0].re, ancestorCoordinates[0].im, ancestorCoordinates[3].re]) : null;
    const count = scope === "finite-seed" ? seed.sampleCount : 1;
    const check = preflight(count, normalized.D, request.depth, config.materialization.maxGeneratedPoints);
    const common = { kind: "finite_pullback_projection", formulaId: "W_kappa_torus4_v1",
      mapId: config.mapId, D: normalized.D, depth: request.depth, scope, selectedAncestorId, ancestorCoordinates, ancestorPosition,
      projectionId: PROJECTION_ID, preflight: check, sourceSampleCount: seed.sampleCount,
      sourceSamplerId: seed.samplerId, sourceConfigVersion: seed.configVersion,
      truthFlags: Object.freeze({ completeX0Rendered: false, completeGlobalXnRendered: false,
        finiteSample: true, twoParameterSlice: false, projectionApplied: true,
        phaseDisplayEmbedding: false, structuralOnly: false,
        completeFiberOverFiniteScope: false, sheetsMaterialized: false,
        coveringStructureClaimed: false, geometricZoomApplied: false }) };
    if (!check.admitted) return Object.freeze({ ...common, kind: "pullback_preflight_refusal", points: Object.freeze([]),
      truthFlags: Object.freeze({ ...common.truthFlags, finiteSample: false, projectionApplied: false }),
      reason: `Requested finite target ${check.requiredPointCount} points exceeds cap ${check.cap}; 0 pullback points generated. The unbounded X_${request.depth} outside this finite seed was never requested or generated.` });
    const model = scope === "one-ancestor"
      ? Scoped.materializeScopedScene(scene, seed, [selectedAncestorId], request.depth, baseConfig, config).sceneModel
      : Engine.generateLevels(scene, seed, baseConfig, config, request.depth);
    const level = model.levels[request.depth];
    const points = Object.freeze(level.points.map(project));
    return Object.freeze({ ...common, points, pointCount: points.length, simpleProjectionId: SIMPLE_PROJECTION_ID,
      simpleProjectionCollisionReport: projectedCollisionReport(points),
      maxPowerResidualMagnitude: level.maxPowerResidualMagnitude,
      maxBaseMembershipResidualMagnitude: level.maxBaseMembershipResidualMagnitude,
      truthFlags: Object.freeze({ ...common.truthFlags, completeFiberOverFiniteScope: request.depth > 0 }) });
  }

  // A local inverse branch deliberately names one root tuple and one bounded
  // sampled source patch. It is not a request for the full fibre or X_n.
  function createLocalBranchPatch(scene, slice, pullbackConfig, request) {
    const MathView = dependency("GeometryExplorationMath", "./geometry-exploration-math.js");
    const Engine = dependency("GeometricPullbackEngine", "./geometric-pullback-engine.js");
    const config = Engine.validateConfig(pullbackConfig);
    return MathView.localBranchPatch(scene, slice, request || {}, {
      powerResidualTolerance: config.powerResidualTolerance,
      cap: config.materialization.maxGeneratedPoints
    });
  }

  function viewFlags(kind) {
    const finiteSample = kind === "finite_validated_sample_cloud" || kind === "phase_torus_display_embedding";
    return Object.freeze({ completeX0Rendered: false, completeGlobalXnRendered: false,
      finiteSample, twoParameterSlice: kind === "declared_parameter_subfamily",
      projectionApplied: kind === "declared_parameter_subfamily" || kind === "finite_validated_sample_cloud",
      phaseDisplayEmbedding: kind === "phase_torus_display_embedding",
      structuralOnly: false, completeFiberOverFiniteScope: false,
      sheetsMaterialized: false, coveringStructureClaimed: false, geometricZoomApplied: false });
  }

  const api = Object.freeze({ PROJECTION_ID, SIMPLE_PROJECTION_ID, discriminant, preflight, createPullback, createLocalBranchPatch, simpleProjection, projectedCollisionReport, viewFlags });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.GeometryExplorationContract = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

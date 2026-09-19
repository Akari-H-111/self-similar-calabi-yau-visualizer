"use strict";

(function attachGeometricPullbackEngine(globalObject) {
  const ENGINE_ID = "finite_sampled_geometric_pullback_v1";
  const CONFIG_VERSION = "v0.01";

  class GeometricPullbackEngineError extends Error {
    constructor(message) {
      super(message);
      this.name = "GeometricPullbackEngineError";
    }
  }
  class GeometricPullbackMaterializationLimitError extends GeometricPullbackEngineError {
    constructor(message) {
      super(message);
      this.name = "GeometricPullbackMaterializationLimitError";
    }
  }

  function runtimeSchema() {
    if (typeof module !== "undefined" && module.exports) return require("./concrete-runtime-schema.js");
    if (!globalObject.ConcreteRuntimeSchema) throw new GeometricPullbackEngineError("ConcreteRuntimeSchema is required.");
    return globalObject.ConcreteRuntimeSchema;
  }
  function evaluator() {
    if (typeof module !== "undefined" && module.exports) return require("./laurent-evaluator.js");
    if (!globalObject.LaurentEvaluator) throw new GeometricPullbackEngineError("LaurentEvaluator is required.");
    return globalObject.LaurentEvaluator;
  }
  function sampler() {
    if (typeof module !== "undefined" && module.exports) return require("./base-geometric-sampler.js");
    if (!globalObject.BaseGeometricSampler) throw new GeometricPullbackEngineError("BaseGeometricSampler is required.");
    return globalObject.BaseGeometricSampler;
  }
  function powerEvaluator() {
    if (typeof module !== "undefined" && module.exports) return require("./torus-power-evaluator.js");
    if (!globalObject.TorusPowerEvaluator) throw new GeometricPullbackEngineError("TorusPowerEvaluator is required.");
    return globalObject.TorusPowerEvaluator;
  }
  function fibers() {
    if (typeof module !== "undefined" && module.exports) return require("./geometric-pullback-fibers.js");
    if (!globalObject.GeometricPullbackFibers) throw new GeometricPullbackEngineError("GeometricPullbackFibers is required.");
    return globalObject.GeometricPullbackFibers;
  }

  function assertPlainObject(value, path) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new GeometricPullbackEngineError(path + " must be an object.");
    }
  }
  function exactKeys(value, expected, path) {
    const actual = Object.keys(value).sort();
    const target = [...expected].sort();
    if (actual.length !== target.length || actual.some((key, index) => key !== target[index])) {
      throw new GeometricPullbackEngineError(path + " has an unexpected key set.");
    }
  }
  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function validateConfig(config) {
    assertPlainObject(config, "config");
    exactKeys(config, [
      "configVersion","pullbackId","mapId","sourceSamplerId","sourceFormulaId",
      "rootEnumeration","powerResidualTolerance","rootDistinctnessTolerance",
      "materialization","truthFlags"
    ], "config");
    const F = fibers();
    const P = powerEvaluator();
    if (config.configVersion !== CONFIG_VERSION || config.pullbackId !== ENGINE_ID) {
      throw new GeometricPullbackEngineError("Unsupported Thread 25 config version or pullback id.");
    }
    if (config.mapId !== P.MAP_ID || config.sourceFormulaId !== evaluator().FORMULA_ID) {
      throw new GeometricPullbackEngineError("Pullback config provenance does not bind to the canonical map/formula.");
    }
    assertPlainObject(config.rootEnumeration, "config.rootEnumeration");
    exactKeys(config.rootEnumeration, ["argumentConvention","coordinateRootIndexOrder","multiIndexOrder","globalAnalyticBranchClaim"], "config.rootEnumeration");
    if (config.rootEnumeration.argumentConvention !== F.ARGUMENT_CONVENTION ||
        config.rootEnumeration.coordinateRootIndexOrder !== F.ROOT_INDEX_ORDER ||
        config.rootEnumeration.multiIndexOrder !== F.MULTI_INDEX_ORDER ||
        config.rootEnumeration.globalAnalyticBranchClaim !== false) {
      throw new GeometricPullbackEngineError("Root enumeration contract mismatch.");
    }
    P.validateTolerance(config.powerResidualTolerance);
    assertPlainObject(config.rootDistinctnessTolerance, "config.rootDistinctnessTolerance");
    if (config.rootDistinctnessTolerance.kind !== "relative_distance" ||
        typeof config.rootDistinctnessTolerance.value !== "number" ||
        !Number.isFinite(config.rootDistinctnessTolerance.value) ||
        config.rootDistinctnessTolerance.value <= 0) {
      throw new GeometricPullbackEngineError("Invalid root distinctness tolerance.");
    }
    assertPlainObject(config.materialization, "config.materialization");
    exactKeys(config.materialization, ["policy","maxGeneratedPoints","canonicalRenderedDepth","beyondCap"], "config.materialization");
    if (config.materialization.policy !== "exact_hard_cap" ||
        config.materialization.beyondCap !== "reject_without_partial_materialization" ||
        !Number.isSafeInteger(config.materialization.maxGeneratedPoints) ||
        config.materialization.maxGeneratedPoints <= 0 ||
        !Number.isSafeInteger(config.materialization.canonicalRenderedDepth) ||
        config.materialization.canonicalRenderedDepth < 0) {
      throw new GeometricPullbackEngineError("Invalid exact materialization policy.");
    }
    assertPlainObject(config.truthFlags, "config.truthFlags");
    exactKeys(config.truthFlags, ["geometryRendered","pullbackGeometryRendered","sheetsMaterialized","coveringStructureClaimed","geometricZoomApplied"], "config.truthFlags");
    if (config.truthFlags.geometryRendered !== true ||
        config.truthFlags.pullbackGeometryRendered !== true ||
        config.truthFlags.sheetsMaterialized !== false ||
        config.truthFlags.coveringStructureClaimed !== false ||
        config.truthFlags.geometricZoomApplied !== false) {
      throw new GeometricPullbackEngineError("Thread 25 truth flags exceed the admitted scope.");
    }
    return Object.freeze(deepClone(config));
  }

  function validateSceneAndD(scene) {
    const normalized = runtimeSchema().validateAndNormalizeV2(scene);
    if (normalized.mathematics.pullbackMap.kind !== "coordinate_power" ||
        normalized.mathematics.pullbackMap.exponentParameter !== "D") {
      throw new GeometricPullbackEngineError("Unknown P_D representation.");
    }
    const D = powerEvaluator().validateD(normalized.mathematics.parameters.D);
    return Object.freeze({ normalized, D });
  }

  function validateBaseSampleModel(scene, sampleModel, baseConfig, config) {
    const E = evaluator();
    const S = sampler();
    const validatedConfig = validateConfig(config);
    const { normalized } = validateSceneAndD(scene);
    if (!sampleModel || sampleModel.kind !== "ordered_finite_validated_subset" ||
        sampleModel.sourceObject !== "X_0" ||
        sampleModel.samplerId !== validatedConfig.sourceSamplerId ||
        sampleModel.formulaId !== validatedConfig.sourceFormulaId ||
        !Array.isArray(sampleModel.samples) ||
        sampleModel.sampleCount !== sampleModel.samples.length ||
        sampleModel.completenessClaim !== false) {
      throw new GeometricPullbackEngineError("Canonical admitted X_0 sample model is required.");
    }
    const ids = new Set();
    const sourceKeys = new Set();
    const context = E.createEvaluationContext(scene);
    for (const sample of sampleModel.samples) {
      if (!sample || typeof sample.sampleId !== "string" || ids.has(sample.sampleId)) {
        throw new GeometricPullbackEngineError("X_0 sample ids must be present and unique.");
      }
      ids.add(sample.sampleId);
      E.validateCoordinates(sample.coordinates);
      const key = fibers().coordinateKey(sample.coordinates);
      if (sourceKeys.has(key)) throw new GeometricPullbackEngineError("X_0 parent samples must be full-coordinate distinct.");
      sourceKeys.add(key);
      const membership = S.validateMembership(context, sample.coordinates, baseConfig);
      if (!membership.accepted || !sample.membership?.accepted) {
        throw new GeometricPullbackEngineError("Every X_0 pullback seed must satisfy the admitted numerical membership policy.");
      }
    }
    return Object.freeze({ normalized, sampleCount: sampleModel.sampleCount, distinctSampleCount: sourceKeys.size });
  }

  function createDepthZeroModel(scene, sampleModel, baseConfig, config) {
    const audit = validateBaseSampleModel(scene, sampleModel, baseConfig, config);
    const points = sampleModel.samples.map((sample) => Object.freeze({
      pointId: sample.sampleId,
      depth: 0,
      sourceObject: "X_0",
      ancestorSampleId: sample.sampleId,
      parentId: null,
      rootMultiIndex: null,
      coordinates: sample.coordinates,
      parentRelation: null,
      baseMembership: sample.membership
    }));
    const maxBaseMembershipResidualMagnitude = points.reduce(
      (maximum, point) => Math.max(maximum, point.baseMembership.residualMagnitude), 0
    );
    return Object.freeze({
      kind: "finite_geometric_pullback_level",
      engineId: ENGINE_ID,
      depth: 0,
      sourceObject: "X_0",
      sourceSeedCount: audit.sampleCount,
      parentPointCount: null,
      fiberCardinality: null,
      expectedPointCount: audit.sampleCount,
      pointCount: points.length,
      points: Object.freeze(points),
      maxPowerResidualMagnitude: 0,
      maxBaseMembershipResidualMagnitude,
      completeFiberOverEachMaterializedParent: null,
      sourceManifoldCompletenessClaim: false
    });
  }

  function expectedChildCount(parentPointCount, D) {
    if (!Number.isSafeInteger(parentPointCount) || parentPointCount < 0) {
      throw new GeometricPullbackEngineError("parentPointCount must be a nonnegative safe integer.");
    }
    const fiberCardinality = fibers().expectedFiberCardinality(D);
    const expected = parentPointCount * fiberCardinality;
    if (!Number.isSafeInteger(expected)) throw new GeometricPullbackEngineError("Expected pullback point count exceeds safe-integer range.");
    return Object.freeze({ fiberCardinality, expected });
  }

  function liftCoordinatesToBase(D, depth, coordinates) {
    if (!Number.isSafeInteger(depth) || depth < 0) throw new GeometricPullbackEngineError("depth must be a nonnegative safe integer.");
    let current = evaluator().validateCoordinates(coordinates);
    for (let step = 0; step < depth; step += 1) {
      current = powerEvaluator().coordinatePower(D, current);
    }
    return current;
  }

  function validateBaseMembershipAtDepth(scene, D, depth, coordinates, baseConfig) {
    const E = evaluator();
    const lifted = liftCoordinatesToBase(D, depth, coordinates);
    return sampler().validateMembership(E.createEvaluationContext(scene), lifted, baseConfig);
  }

  function generateNextLevel(scene, parentLevel, baseConfig, rawConfig) {
    const config = validateConfig(rawConfig);
    const { D } = validateSceneAndD(scene);
    if (!parentLevel || parentLevel.kind !== "finite_geometric_pullback_level" ||
        !Array.isArray(parentLevel.points) ||
        parentLevel.pointCount !== parentLevel.points.length) {
      throw new GeometricPullbackEngineError("A validated finite geometric parent level is required.");
    }
    const depth = parentLevel.depth + 1;
    const counts = expectedChildCount(parentLevel.pointCount, D);
    if (counts.expected > config.materialization.maxGeneratedPoints) {
      throw new GeometricPullbackMaterializationLimitError(
        "Exact next level requires " + String(counts.expected) +
        " points, exceeding hard cap " + String(config.materialization.maxGeneratedPoints) +
        "; partial fibers are forbidden."
      );
    }

    const F = fibers();
    const points = [];
    const sourceKeys = new Set();
    let maxPowerResidualMagnitude = 0;
    let maxBaseMembershipResidualMagnitude = 0;
    const fiberOptions = {
      rootEnumeration: config.rootEnumeration,
      powerResidualTolerance: config.powerResidualTolerance,
      rootDistinctnessTolerance: config.rootDistinctnessTolerance
    };

    for (const parent of parentLevel.points) {
      const fiber = F.enumerateCompleteFiber(parent.coordinates, D, fiberOptions);
      if (fiber.length !== counts.fiberCardinality) {
        throw new GeometricPullbackEngineError("Unexpected complete fiber cardinality.");
      }
      for (const child of fiber) {
        const rootMultiIndex = child.rootMultiIndex;
        const pointId = parent.pointId + "/d" + String(depth) + "/r[" + rootMultiIndex.join(",") + "]";
        const key = F.coordinateKey(child.coordinates);
        if (sourceKeys.has(key)) {
          throw new GeometricPullbackEngineError("Distinct parent fibers or root tuples numerically merged; silent deduplication is forbidden.");
        }
        sourceKeys.add(key);
        const baseMembership = validateBaseMembershipAtDepth(scene, D, depth, child.coordinates, baseConfig);
        if (!baseMembership.accepted) {
          throw new GeometricPullbackEngineError("Generated pullback point fails W(P_D^n(z))≈lambda under the inherited X_0 membership policy.");
        }
        maxPowerResidualMagnitude = Math.max(maxPowerResidualMagnitude, child.relation.maxResidualMagnitude);
        maxBaseMembershipResidualMagnitude = Math.max(maxBaseMembershipResidualMagnitude, baseMembership.residualMagnitude);
        points.push(Object.freeze({
          pointId,
          depth,
          sourceObject: "X_" + String(depth),
          ancestorSampleId: parent.ancestorSampleId,
          parentId: parent.pointId,
          rootMultiIndex,
          coordinates: child.coordinates,
          parentRelation: child.relation,
          baseMembership
        }));
      }
    }

    if (points.length !== counts.expected || sourceKeys.size !== counts.expected) {
      throw new GeometricPullbackEngineError("Generated pullback cardinality is not the derived complete-fiber count.");
    }
    return Object.freeze({
      kind: "finite_geometric_pullback_level",
      engineId: ENGINE_ID,
      depth,
      sourceObject: "X_" + String(depth),
      sourceSeedCount: parentLevel.sourceSeedCount,
      parentPointCount: parentLevel.pointCount,
      fiberCardinality: counts.fiberCardinality,
      expectedPointCount: counts.expected,
      pointCount: points.length,
      points: Object.freeze(points),
      maxPowerResidualMagnitude,
      maxBaseMembershipResidualMagnitude,
      completeFiberOverEachMaterializedParent: true,
      sourceManifoldCompletenessClaim: false
    });
  }

  function generateLevels(scene, sampleModel, baseConfig, rawConfig, requestedGeometricDepth) {
    const config = validateConfig(rawConfig);
    validateSceneAndD(scene);
    if (!Number.isSafeInteger(requestedGeometricDepth) || requestedGeometricDepth < 0) {
      throw new GeometricPullbackEngineError("requested geometric depth must be a nonnegative safe integer.");
    }
    const levels = [createDepthZeroModel(scene, sampleModel, baseConfig, config)];
    for (let depth = 1; depth <= requestedGeometricDepth; depth += 1) {
      levels.push(generateNextLevel(scene, levels[levels.length - 1], baseConfig, config));
    }
    return Object.freeze({
      kind: "finite_geometric_pullback_scene_model",
      engineId: ENGINE_ID,
      pullbackId: config.pullbackId,
      mapId: config.mapId,
      renderedGeometricDepth: requestedGeometricDepth,
      sourceSeedCount: levels[0].pointCount,
      levels: Object.freeze(levels),
      materialization: config.materialization,
      truthfulness: Object.freeze({ ...config.truthFlags }),
      structuralRequestedDepthConsumed: false
    });
  }

  const api = Object.freeze({
    ENGINE_ID,
    CONFIG_VERSION,
    GeometricPullbackEngineError,
    GeometricPullbackMaterializationLimitError,
    validateConfig,
    validateSceneAndD,
    validateBaseSampleModel,
    createDepthZeroModel,
    expectedChildCount,
    liftCoordinatesToBase,
    validateBaseMembershipAtDepth,
    generateNextLevel,
    generateLevels
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.GeometricPullbackEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

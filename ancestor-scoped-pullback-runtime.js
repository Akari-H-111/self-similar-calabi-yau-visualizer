"use strict";

(function attachAncestorScopedPullbackRuntime(globalObject) {
  const RUNTIME_ID = "ancestor_scoped_pullback_runtime_v1";
  const RUNTIME_VERSION = "v0.01";

  class AncestorScopedPullbackRuntimeError extends Error {
    constructor(message) {
      super(message);
      this.name = "AncestorScopedPullbackRuntimeError";
    }
  }

  class AncestorScopedPullbackMaterializationLimitError extends AncestorScopedPullbackRuntimeError {
    constructor(message) {
      super(message);
      this.name = "AncestorScopedPullbackMaterializationLimitError";
    }
  }

  function engine() {
    if (typeof module !== "undefined" && module.exports) return require("./geometric-pullback-engine.js");
    if (!globalObject.GeometricPullbackEngine) {
      throw new AncestorScopedPullbackRuntimeError("GeometricPullbackEngine is required.");
    }
    return globalObject.GeometricPullbackEngine;
  }

  function assertPositiveSafeInteger(value, path) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new AncestorScopedPullbackRuntimeError(path + " must be a positive safe integer.");
    }
  }

  function assertNonnegativeSafeInteger(value, path) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new AncestorScopedPullbackRuntimeError(path + " must be a nonnegative safe integer.");
    }
  }

  function exactScopedPointCount(selectedAncestorCount, D, requestedScopedDepth) {
    assertPositiveSafeInteger(selectedAncestorCount, "selectedAncestorCount");
    assertPositiveSafeInteger(D, "D");
    if (D < 2) throw new AncestorScopedPullbackRuntimeError("D must be at least 2.");
    assertNonnegativeSafeInteger(requestedScopedDepth, "requestedScopedDepth");
    const fiberCardinality = BigInt(D) ** 4n;
    return BigInt(selectedAncestorCount) * (fiberCardinality ** BigInt(requestedScopedDepth));
  }

  function preflightScopedRequest(selectedAncestorCount, D, requestedScopedDepth, maxGeneratedPoints) {
    assertPositiveSafeInteger(maxGeneratedPoints, "maxGeneratedPoints");
    const required = exactScopedPointCount(selectedAncestorCount, D, requestedScopedDepth);
    const cap = BigInt(maxGeneratedPoints);
    return Object.freeze({
      selectedAncestorCount,
      D,
      requestedScopedDepth,
      requiredPointCount: required.toString(),
      maxGeneratedPoints,
      admitted: required <= cap
    });
  }

  function validateCanonicalSampleMetadata(canonicalSampleModel, rawConfig) {
    const config = engine().validateConfig(rawConfig);
    if (!canonicalSampleModel ||
        canonicalSampleModel.kind !== "ordered_finite_validated_subset" ||
        canonicalSampleModel.sourceObject !== "X_0" ||
        canonicalSampleModel.samplerId !== config.sourceSamplerId ||
        canonicalSampleModel.formulaId !== config.sourceFormulaId ||
        !Array.isArray(canonicalSampleModel.samples) ||
        canonicalSampleModel.sampleCount !== canonicalSampleModel.samples.length ||
        canonicalSampleModel.sampleCount <= 0 ||
        canonicalSampleModel.completenessClaim !== false) {
      throw new AncestorScopedPullbackRuntimeError("Canonical Thread 24 finite X_0 sample metadata is required.");
    }
    const indexById = new Map();
    for (let index = 0; index < canonicalSampleModel.samples.length; index += 1) {
      const sample = canonicalSampleModel.samples[index];
      if (!sample || typeof sample.sampleId !== "string" || sample.sampleId.length === 0) {
        throw new AncestorScopedPullbackRuntimeError("Canonical sample ids must be nonempty strings.");
      }
      if (indexById.has(sample.sampleId)) {
        throw new AncestorScopedPullbackRuntimeError("Canonical sample ids must be unique.");
      }
      indexById.set(sample.sampleId, index);
    }
    return Object.freeze({ config, indexById });
  }

  function selectAncestorScopeMetadata(canonicalSampleModel, selectedAncestorIds, rawConfig) {
    const audit = validateCanonicalSampleMetadata(canonicalSampleModel, rawConfig);
    if (!Array.isArray(selectedAncestorIds) || selectedAncestorIds.length === 0) {
      throw new AncestorScopedPullbackRuntimeError("selectedAncestorIds must be a nonempty array.");
    }
    const selected = [];
    let previousIndex = -1;
    const seen = new Set();
    for (const sampleId of selectedAncestorIds) {
      if (typeof sampleId !== "string" || sampleId.length === 0 || seen.has(sampleId)) {
        throw new AncestorScopedPullbackRuntimeError("selectedAncestorIds must contain unique nonempty sample ids.");
      }
      const index = audit.indexById.get(sampleId);
      if (index === undefined) {
        throw new AncestorScopedPullbackRuntimeError("Every selected ancestor must belong to the canonical Thread 24 sample list.");
      }
      if (index <= previousIndex) {
        throw new AncestorScopedPullbackRuntimeError("Selected ancestors must preserve canonical Thread 24 source order.");
      }
      seen.add(sampleId);
      selected.push(Object.freeze({ sampleId, canonicalIndex: index }));
      previousIndex = index;
    }
    return Object.freeze({
      selectedAncestorIds: Object.freeze(selected.map((entry) => entry.sampleId)),
      canonicalIndices: Object.freeze(selected.map((entry) => entry.canonicalIndex)),
      selectedAncestorCount: selected.length,
      scopeId: "ancestor-scope-v1:" + selected.map((entry) => entry.sampleId).join("|")
    });
  }

  function createScopedSampleModel(canonicalSampleModel, scopeMetadata) {
    const samples = scopeMetadata.canonicalIndices.map((index) => canonicalSampleModel.samples[index]);
    return Object.freeze({
      ...canonicalSampleModel,
      sampleCount: samples.length,
      samples: Object.freeze(samples)
    });
  }

  function materializeScopedScene(
    scene,
    canonicalSampleModel,
    selectedAncestorIds,
    requestedScopedDepth,
    baseConfig,
    rawPullbackConfig
  ) {
    const E = engine();
    const config = E.validateConfig(rawPullbackConfig);
    const { D } = E.validateSceneAndD(scene);
    assertNonnegativeSafeInteger(requestedScopedDepth, "requestedScopedDepth");

    const scope = selectAncestorScopeMetadata(canonicalSampleModel, selectedAncestorIds, config);
    const preflight = preflightScopedRequest(
      scope.selectedAncestorCount,
      D,
      requestedScopedDepth,
      config.materialization.maxGeneratedPoints
    );

    if (!preflight.admitted) {
      throw new AncestorScopedPullbackMaterializationLimitError(
        "Ancestor-scoped target depth " + String(requestedScopedDepth) +
        " requires " + preflight.requiredPointCount +
        " points for " + String(scope.selectedAncestorCount) +
        " selected ancestor(s), exceeding hard cap " + String(preflight.maxGeneratedPoints) +
        "; scoped generation was not invoked and partial levels are forbidden."
      );
    }

    const scopedSampleModel = createScopedSampleModel(canonicalSampleModel, scope);
    const sceneModel = E.generateLevels(
      scene,
      scopedSampleModel,
      baseConfig,
      config,
      requestedScopedDepth
    );

    const materializedScopedDepths = sceneModel.levels.map((level) => level.depth);
    return Object.freeze({
      kind: "ancestor_scoped_pullback_runtime_state",
      runtimeId: RUNTIME_ID,
      runtimeVersion: RUNTIME_VERSION,
      scopeId: scope.scopeId,
      selectedAncestorIds: scope.selectedAncestorIds,
      selectedAncestorCount: scope.selectedAncestorCount,
      requestedScopedDepth,
      materializedScopedDepths: Object.freeze(materializedScopedDepths),
      requiredPointCount: preflight.requiredPointCount,
      maxGeneratedPoints: preflight.maxGeneratedPoints,
      sceneModel,
      scopeCompleteness: "complete_over_selected_ancestor_scope",
      globalCompletenessClaim: false,
      globalGeometricRenderedDepthMutated: false,
      structuralRequestedDepthConsumed: false,
      truthfulness: Object.freeze({
        completeGlobalHypersurfaceRendered: false,
        sheetsMaterialized: false,
        coveringStructureClaimed: false,
        geometricZoomApplied: false
      })
    });
  }

  const api = Object.freeze({
    RUNTIME_ID,
    RUNTIME_VERSION,
    AncestorScopedPullbackRuntimeError,
    AncestorScopedPullbackMaterializationLimitError,
    exactScopedPointCount,
    preflightScopedRequest,
    validateCanonicalSampleMetadata,
    selectAncestorScopeMetadata,
    createScopedSampleModel,
    materializeScopedScene
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.AncestorScopedPullbackRuntime = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

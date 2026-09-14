"use strict";

(function attachOneStepPullback(globalObject) {
  const ONE_STEP_DEPTH = 1;
  const UNRESOLVED_STATUS = "unresolved_pullback_geometry";

  function createOneStepPullbackModel(scene, baseModel) {
    if (!baseModel || baseModel.kind !== "base_scene") {
      throw new TypeError("One-step pullback requires a base_scene render model.");
    }

    const pullbackMap = scene.mathematics.pullbackMap;
    const parameters = scene.mathematics.parameters;
    const exponentValue = parameters[pullbackMap.exponentParameter];

    return Object.freeze({
      kind: "one_step_pullback",
      depth: ONE_STEP_DEPTH,
      relation: "inverse_image",
      sourceKind: baseModel.kind,
      pullbackMapKind: pullbackMap.kind,
      coordinateCount: pullbackMap.coordinateCount,
      exponentParameter: pullbackMap.exponentParameter,
      exponentValue,
      mapDegree: scene.derived.sheetDegree,
      baseGeometryStatus: baseModel.status,
      status: UNRESOLVED_STATUS,
      geometryRendered: false,
      sheetsMaterialized: false,
      message:
        `One-step pullback structure initialized: X_1 = P_D^{-1}(X), depth = ${String(ONE_STEP_DEPTH)}, ` +
        `map exponent = ${String(exponentValue)}, derived map degree = ${String(scene.derived.sheetDegree)}. ` +
        "Pullback geometry is not drawn because the base geometry is unresolved; no sheets are materialized."
    });
  }

  function renderOneStepPullback(scene, baseModel, target) {
    if (!target || typeof target !== "object" || !target.dataset) {
      throw new TypeError("One-step pullback target must expose a dataset object.");
    }

    const model = createOneStepPullbackModel(scene, baseModel);

    target.hidden = false;
    target.dataset.state = model.status;
    target.dataset.depth = String(model.depth);
    target.dataset.geometryRendered = String(model.geometryRendered);
    target.dataset.sheetsMaterialized = String(model.sheetsMaterialized);
    target.textContent = model.message;

    return model;
  }

  const api = Object.freeze({
    ONE_STEP_DEPTH,
    UNRESOLVED_STATUS,
    createOneStepPullbackModel,
    renderOneStepPullback
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.OneStepPullback = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

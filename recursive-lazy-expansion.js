"use strict";

(function attachRecursiveLazyExpansion(globalObject) {
  const MODEL_KIND = "recursive_lazy_expansion";
  const LEVEL_KIND = "structural_pullback_level";

  function createLevelDescriptor(template, depth) {
    return Object.freeze({
      kind: LEVEL_KIND,
      depth,
      relation: template.relation,
      sourceDepth: depth - 1,
      pullbackMapKind: template.pullbackMapKind,
      coordinateCount: template.coordinateCount,
      exponentParameter: template.exponentParameter,
      exponentValue: template.exponentValue,
      mapDegreePerStep: template.mapDegreePerStep,
      iteratedDegreeExpression: Object.freeze({
        baseDegree: template.mapDegreePerStep,
        exponent: depth
      }),
      status: template.status,
      geometryRendered: template.geometryRendered,
      sheetsMaterialized: template.sheetsMaterialized
    });
  }

  function describeState(requestedDepth, materializedDepth, expansionComplete) {
    if (requestedDepth === 0) {
      return "Recursive lazy expansion: requested depth = 0; materialized structural depth = 0. No pullback level is requested or materialized; base geometry remains unresolved.";
    }

    if (expansionComplete) {
      return `Recursive lazy expansion: requested depth = ${String(requestedDepth)}; materialized structural depth = ${String(materializedDepth)}. The requested structural frontier is complete. Geometry remains unresolved; no sheets are materialized.`;
    }

    return `Recursive lazy expansion: requested depth = ${String(requestedDepth)}; materialized structural depth = ${String(materializedDepth)}. Expansion remains lazy: one expansion call can materialize at most the next structural level. Geometry remains unresolved; no sheets are materialized.`;
  }

  function buildModel(requestedDepth, baseGeometryStatus, baseGeometryRendered, levels) {
    const frozenLevels = Object.freeze([...levels]);
    const materializedDepth = frozenLevels.length;
    const expansionComplete = materializedDepth === requestedDepth;
    const frontier = materializedDepth === 0 ? null : frozenLevels[materializedDepth - 1];

    return Object.freeze({
      kind: MODEL_KIND,
      requestedDepth,
      materializedDepth,
      expansionComplete,
      baseGeometryStatus,
      status: frontier ? frontier.status : baseGeometryStatus,
      geometryRendered: frontier ? frontier.geometryRendered : baseGeometryRendered,
      sheetsMaterialized: frontier ? frontier.sheetsMaterialized : false,
      levels: frozenLevels,
      message: describeState(requestedDepth, materializedDepth, expansionComplete)
    });
  }

  function createRecursiveLazyExpansionModel(scene, baseModel, oneStepModel) {
    if (!baseModel || baseModel.kind !== "base_scene") {
      throw new TypeError("Recursive lazy expansion requires a base_scene render model.");
    }
    if (!oneStepModel || oneStepModel.kind !== "one_step_pullback" || oneStepModel.depth !== 1) {
      throw new TypeError("Recursive lazy expansion requires the verified one-step pullback model at depth 1.");
    }

    const requestedDepth = scene.request.requestedDepth;
    const levels = [];

    if (requestedDepth >= 1) {
      levels.push(
        createLevelDescriptor(
          {
            relation: oneStepModel.relation,
            pullbackMapKind: oneStepModel.pullbackMapKind,
            coordinateCount: oneStepModel.coordinateCount,
            exponentParameter: oneStepModel.exponentParameter,
            exponentValue: oneStepModel.exponentValue,
            mapDegreePerStep: oneStepModel.mapDegree,
            status: oneStepModel.status,
            geometryRendered: oneStepModel.geometryRendered,
            sheetsMaterialized: oneStepModel.sheetsMaterialized
          },
          1
        )
      );
    }

    return buildModel(requestedDepth, baseModel.status, baseModel.geometryRendered, levels);
  }

  function expandOneLevel(model) {
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("expandOneLevel requires a recursive_lazy_expansion model.");
    }

    if (model.expansionComplete) {
      return model;
    }

    const template = model.levels[0];
    if (!template) {
      throw new TypeError("Incomplete recursive expansion is missing its verified depth-1 template.");
    }

    const nextDepth = model.materializedDepth + 1;
    const nextLevel = createLevelDescriptor(template, nextDepth);

    return buildModel(
      model.requestedDepth,
      model.baseGeometryStatus,
      false,
      [...model.levels, nextLevel]
    );
  }

  function renderRecursiveLazyExpansion(model, target) {
    if (!target || typeof target !== "object" || !target.dataset) {
      throw new TypeError("Recursive lazy expansion target must expose a dataset object.");
    }
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Recursive lazy expansion renderer requires a recursive_lazy_expansion model.");
    }

    target.hidden = false;
    target.dataset.state = model.status;
    target.dataset.requestedDepth = String(model.requestedDepth);
    target.dataset.materializedDepth = String(model.materializedDepth);
    target.dataset.expansionComplete = String(model.expansionComplete);
    target.dataset.geometryRendered = String(model.geometryRendered);
    target.dataset.sheetsMaterialized = String(model.sheetsMaterialized);
    target.textContent = model.message;

    return model;
  }

  const api = Object.freeze({
    MODEL_KIND,
    LEVEL_KIND,
    createRecursiveLazyExpansionModel,
    expandOneLevel,
    renderRecursiveLazyExpansion
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.RecursiveLazyExpansion = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

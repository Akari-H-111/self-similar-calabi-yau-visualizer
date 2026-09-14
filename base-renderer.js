"use strict";

(function attachBaseRenderer(globalObject) {
  const UNRESOLVED_STATUS = "unresolved_geometry";
  const UNSUPPORTED_STATUS = "unsupported_geometry_representation";

  function createBaseRenderModel(scene) {
    const baseHypersurface = scene.mathematics.baseHypersurface;
    const definingFunction = baseHypersurface.definingFunction;
    const levelParameter = baseHypersurface.levelParameter;
    const levelValue = scene.mathematics.parameters[levelParameter];
    const isUnresolved = definingFunction.representation === "unresolved";

    return Object.freeze({
      kind: "base_scene",
      status: isUnresolved ? UNRESOLVED_STATUS : UNSUPPORTED_STATUS,
      geometryRendered: false,
      definingFunctionSymbol: definingFunction.symbol,
      definingFunctionRepresentation: definingFunction.representation,
      levelParameter,
      levelValue,
      message: isUnresolved
        ? `Base geometry not drawn: ${definingFunction.symbol} has no concrete representation; ${levelParameter} = ${String(levelValue)}.`
        : `Base geometry not drawn: representation ${JSON.stringify(definingFunction.representation)} is not supported by this renderer.`
    });
  }

  function renderBaseScene(scene, target) {
    if (!target || typeof target !== "object" || !target.dataset) {
      throw new TypeError("Base renderer target must expose a dataset object.");
    }

    const model = createBaseRenderModel(scene);

    target.hidden = false;
    target.dataset.state = model.status;
    target.dataset.geometryRendered = String(model.geometryRendered);
    target.textContent = model.message;

    return model;
  }

  const api = Object.freeze({
    UNRESOLVED_STATUS,
    UNSUPPORTED_STATUS,
    createBaseRenderModel,
    renderBaseScene
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.BaseRenderer = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

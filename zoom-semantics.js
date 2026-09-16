"use strict";

(function attachZoomSemantics(globalObject) {
  const MODEL_KIND = "structural_zoom_focus";
  const FOCUSED_STATUS = "focused";
  const NOT_MATERIALIZED_STATUS = "not_materialized";

  function assertFocusDepth(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new TypeError("Zoom focus depth must be a nonnegative safe integer.");
    }
  }

  function describeFocus(requestedFocusDepth, focusedDepth, availableDepth, requestedDepth) {
    if (focusedDepth === null) {
      return (
        `Structural zoom focus unavailable: depth ${String(requestedFocusDepth)} is not materialized; ` +
        `available structural depth is ${String(availableDepth)} and requested target depth is ${String(requestedDepth)}. ` +
        "No recursive expansion, camera transform, or geometric zoom is triggered."
      );
    }

    return (
      `Structural zoom focus: depth ${String(focusedDepth)} is available within materialized depth ${String(availableDepth)}. ` +
      "Focus is navigation metadata only; no camera transform or geometric scaling is applied."
    );
  }

  function createZoomFocusModel(scene, recursiveModel, requestedFocusDepth = 0) {
    if (!scene || !scene.derived || !Object.hasOwn(scene.derived, "metricScale")) {
      throw new TypeError("Zoom semantics requires a validated normalized scene with derived.metricScale.");
    }
    if (!recursiveModel || recursiveModel.kind !== "recursive_lazy_expansion") {
      throw new TypeError("Zoom semantics requires a verified recursive_lazy_expansion model.");
    }

    assertFocusDepth(requestedFocusDepth);

    const availableDepth = recursiveModel.materializedDepth;
    const requestedDepth = recursiveModel.requestedDepth;
    const focusAvailable = requestedFocusDepth <= availableDepth;
    const focusedDepth = focusAvailable ? requestedFocusDepth : null;
    const formalMetricScaleExpression = focusAvailable
      ? Object.freeze({
          baseScale: scene.derived.metricScale,
          exponent: requestedFocusDepth
        })
      : null;

    return Object.freeze({
      kind: MODEL_KIND,
      requestedFocusDepth,
      focusedDepth,
      availableDepth,
      requestedDepth,
      focusStatus: focusAvailable ? FOCUSED_STATUS : NOT_MATERIALIZED_STATUS,
      focusAvailable,
      withinRequestedDepth: requestedFocusDepth <= requestedDepth,
      formalMetricScaleSource: "scene.derived.metricScale",
      formalMetricScaleExpression,
      geometricZoomApplied: false,
      cameraTransformApplied: false,
      materializationTriggered: false,
      message: describeFocus(requestedFocusDepth, focusedDepth, availableDepth, requestedDepth)
    });
  }

  function renderZoomSemantics(model, target) {
    if (!target || typeof target !== "object" || !target.dataset) {
      throw new TypeError("Zoom semantics target must expose a dataset object.");
    }
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Zoom semantics renderer requires a structural_zoom_focus model.");
    }

    target.hidden = false;
    target.dataset.state = model.focusStatus;
    target.dataset.requestedFocusDepth = String(model.requestedFocusDepth);
    target.dataset.focusedDepth = model.focusedDepth === null ? "" : String(model.focusedDepth);
    target.dataset.availableDepth = String(model.availableDepth);
    target.dataset.requestedDepth = String(model.requestedDepth);
    target.dataset.focusAvailable = String(model.focusAvailable);
    target.dataset.geometricZoomApplied = String(model.geometricZoomApplied);
    target.dataset.cameraTransformApplied = String(model.cameraTransformApplied);
    target.dataset.materializationTriggered = String(model.materializationTriggered);
    target.textContent = model.message;

    return model;
  }

  const api = Object.freeze({
    MODEL_KIND,
    FOCUSED_STATUS,
    NOT_MATERIALIZED_STATUS,
    createZoomFocusModel,
    renderZoomSemantics
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.ZoomSemantics = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

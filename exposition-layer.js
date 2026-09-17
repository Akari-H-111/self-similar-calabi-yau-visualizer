"use strict";

(function attachExpositionLayer(globalObject) {
  const MODEL_KIND = "ux_exposition";

  const SEMANTIC_CATEGORIES = Object.freeze({
    FORMALIZED: Object.freeze({ id: "formalized", label: "Lean formalized" }),
    RUNTIME: Object.freeze({ id: "runtime", label: "Runtime metadata" }),
    STRUCTURAL: Object.freeze({ id: "structural", label: "Structural" }),
    SYMBOLIC: Object.freeze({ id: "symbolic", label: "Symbolic" }),
    UNRESOLVED: Object.freeze({ id: "unresolved", label: "Unresolved" }),
    NOT_MATERIALIZED: Object.freeze({ id: "not-materialized", label: "Not materialized" }),
    ENGINEERING: Object.freeze({ id: "engineering", label: "Engineering" })
  });

  function assertCompatibleInputs(scene, baseModel, recursiveModel, zoomModel, organizationModel, overlayModel) {
    if (!scene || !scene.mathematics || !scene.derived) {
      throw new TypeError("Exposition layer requires a validated normalized scene.");
    }
    if (!baseModel || baseModel.kind !== "base_scene") {
      throw new TypeError("Exposition layer requires the verified base_scene model.");
    }
    if (!recursiveModel || recursiveModel.kind !== "recursive_lazy_expansion") {
      throw new TypeError("Exposition layer requires the verified recursive_lazy_expansion model.");
    }
    if (!zoomModel || zoomModel.kind !== "structural_zoom_focus") {
      throw new TypeError("Exposition layer requires the verified structural_zoom_focus model.");
    }
    if (!organizationModel || organizationModel.kind !== "sheet_branch_organization") {
      throw new TypeError("Exposition layer requires the verified sheet_branch_organization model.");
    }
    if (!overlayModel || overlayModel.kind !== "arithmetic_overlays") {
      throw new TypeError("Exposition layer requires the verified arithmetic_overlays model.");
    }
    if (recursiveModel.materializedDepth !== zoomModel.availableDepth) {
      throw new TypeError("Exposition layer requires recursive and zoom depth state to agree.");
    }
    if (organizationModel.materializedDepth !== recursiveModel.materializedDepth) {
      throw new TypeError("Exposition layer requires organization and recursive depth state to agree.");
    }
    if (organizationModel.focusedDepth !== zoomModel.focusedDepth) {
      throw new TypeError("Exposition layer requires organization and zoom focus state to agree.");
    }
  }

  function createExpositionModel(scene, baseModel, recursiveModel, zoomModel, organizationModel, overlayModel) {
    assertCompatibleInputs(scene, baseModel, recursiveModel, zoomModel, organizationModel, overlayModel);

    const truthfulness = Object.freeze({
      geometryRendered: Boolean(
        baseModel.geometryRendered ||
        recursiveModel.geometryRendered ||
        organizationModel.geometryRendered ||
        overlayModel.geometryRendered
      ),
      sheetsMaterialized: Boolean(recursiveModel.sheetsMaterialized || organizationModel.sheetsMaterialized),
      coveringStructureClaimed: Boolean(organizationModel.coveringStructureClaimed),
      geometricZoomApplied: Boolean(zoomModel.geometricZoomApplied),
      cameraTransformApplied: Boolean(zoomModel.cameraTransformApplied),
      materializationTriggered: Boolean(
        zoomModel.materializationTriggered ||
        organizationModel.materializationTriggered ||
        overlayModel.materializationTriggered
      )
    });

    return Object.freeze({
      kind: MODEL_KIND,
      categories: SEMANTIC_CATEGORIES,
      currentState: Object.freeze({
        focusedDepth: zoomModel.focusedDepth,
        materializedDepth: recursiveModel.materializedDepth,
        requestedDepth: recursiveModel.requestedDepth,
        D: scene.mathematics.parameters.D,
        D2: Object.freeze({
          label: "D² runtime metadata",
          value: scene.derived.metricScale,
          category: SEMANTIC_CATEGORIES.RUNTIME.id
        }),
        D4: Object.freeze({
          label: "D⁴ organization metadata",
          value: scene.derived.sheetDegree,
          category: SEMANTIC_CATEGORIES.RUNTIME.id
        }),
        structuralState: Object.freeze({
          label: recursiveModel.expansionComplete ? "Requested structural frontier complete" : "Lazy structural frontier",
          category: SEMANTIC_CATEGORIES.STRUCTURAL.id
        }),
        geometryState: Object.freeze({
          label: truthfulness.geometryRendered ? "Rendered" : "Not rendered",
          category: truthfulness.geometryRendered
            ? SEMANTIC_CATEGORIES.STRUCTURAL.id
            : SEMANTIC_CATEGORIES.UNRESOLVED.id
        }),
        formalState: Object.freeze({
          label: "Scoped Lean core available",
          category: SEMANTIC_CATEGORIES.FORMALIZED.id
        }),
        navigationState: Object.freeze({
          label: "Finite structural navigation",
          category: SEMANTIC_CATEGORIES.ENGINEERING.id
        })
      }),
      truthfulness,
      definingFunction: Object.freeze({
        symbol: scene.mathematics.baseHypersurface.definingFunction.symbol,
        representation: scene.mathematics.baseHypersurface.definingFunction.representation,
        category: SEMANTIC_CATEGORIES.UNRESOLVED.id
      }),
      formalizedScope: Object.freeze([
        "Coordinate-power map",
        "Coordinate-power iteration law",
        "Abstract set-theoretic pullback recurrence and closed form"
      ]),
      runtimeScope: Object.freeze([
        "Validated scene parameters and finite depth state",
        "D² runtime metadata and D⁴ organization metadata",
        "Truthfulness flags and provenance-aware overlay state"
      ]),
      structuralScope: Object.freeze([
        "Lazy pullback-level descriptors",
        "Aggregate sheet/branch organization descriptors",
        "Structural focus and symbolic annotations"
      ]),
      unresolvedScope: Object.freeze([
        "Concrete W representation",
        "Calabi–Yau hypersurface geometry",
        "Genuine sheets, covering geometry, metric realization, and deferred arithmetic geometry"
      ]),
      navigationExplanation:
        "Continue exploring finite structural depths on demand. This interface does not render literal infinity or apply geometric camera zoom."
    });
  }

  function requireField(target, fieldName) {
    const field = target.querySelector(`[data-exposition-field="${fieldName}"]`);
    if (!field) {
      throw new TypeError(`Exposition target is missing field ${JSON.stringify(fieldName)}.`);
    }
    return field;
  }

  function setField(target, fieldName, value, category) {
    const field = requireField(target, fieldName);
    field.textContent = String(value);
    if (category) {
      field.dataset.semanticCategory = category;
    }
  }

  function renderExpositionLayer(model, target) {
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Exposition renderer requires a ux_exposition model.");
    }
    if (!target || typeof target !== "object" || !target.dataset || typeof target.querySelector !== "function") {
      throw new TypeError("Exposition renderer target must expose dataset and querySelector.");
    }

    target.hidden = false;
    target.dataset.state = "ready";
    target.dataset.geometryRendered = String(model.truthfulness.geometryRendered);
    target.dataset.sheetsMaterialized = String(model.truthfulness.sheetsMaterialized);
    target.dataset.coveringStructureClaimed = String(model.truthfulness.coveringStructureClaimed);
    target.dataset.geometricZoomApplied = String(model.truthfulness.geometricZoomApplied);
    target.dataset.cameraTransformApplied = String(model.truthfulness.cameraTransformApplied);

    setField(
      target,
      "depth",
      model.currentState.focusedDepth === null
        ? `Unavailable focus · materialized ${String(model.currentState.materializedDepth)} · requested ${String(model.currentState.requestedDepth)}`
        : `${String(model.currentState.focusedDepth)} · materialized ${String(model.currentState.materializedDepth)} · requested ${String(model.currentState.requestedDepth)}`,
      SEMANTIC_CATEGORIES.STRUCTURAL.id
    );
    setField(target, "D", model.currentState.D, SEMANTIC_CATEGORIES.RUNTIME.id);
    setField(target, "D2", model.currentState.D2.value, model.currentState.D2.category);
    setField(target, "D4", model.currentState.D4.value, model.currentState.D4.category);
    setField(target, "structure", model.currentState.structuralState.label, model.currentState.structuralState.category);
    setField(target, "geometry", model.currentState.geometryState.label, model.currentState.geometryState.category);
    setField(target, "formal", model.currentState.formalState.label, model.currentState.formalState.category);
    setField(target, "navigation", model.currentState.navigationState.label, model.currentState.navigationState.category);
    setField(
      target,
      "W",
      `${model.definingFunction.symbol}: ${model.definingFunction.representation}`,
      model.definingFunction.category
    );

    return model;
  }

  const api = Object.freeze({
    MODEL_KIND,
    SEMANTIC_CATEGORIES,
    createExpositionModel,
    renderExpositionLayer
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.ExpositionLayer = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

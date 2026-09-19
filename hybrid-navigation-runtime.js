"use strict";

(function initializeHybridNavigationRuntime(globalObject) {
  const root = document.querySelector("#hybrid-navigation");
  const interaction = document.querySelector("#interactive-pullback-tower");
  const geometricVisualization = document.querySelector("#geometric-pullback-visualization");
  const geometricDepthSelect = document.querySelector("#geometric-pullback-depth");
  const modeButtons = Array.from(document.querySelectorAll("[data-hybrid-mode]"));
  const stageToGeometricButton = document.querySelector('[data-hybrid-action="structural-to-geometric"]');
  const stageToStructuralButton = document.querySelector('[data-hybrid-action="geometric-to-structural"]');
  const representationField = document.querySelector('[data-hybrid-field="representation"]');
  const structuralDepthField = document.querySelector('[data-hybrid-field="structural-depth"]');
  const geometricDepthField = document.querySelector('[data-hybrid-field="geometric-depth"]');
  const correspondenceField = document.querySelector('[data-hybrid-field="correspondence"]');
  const selectionField = document.querySelector("#hybrid-geometric-selection");
  const panels = Array.from(document.querySelectorAll("[data-hybrid-panel]"));

  let config = null;
  let representationMode = "structural";
  let selectedGeometricObject = null;
  let lastAction = "initialize";
  let state = null;
  let refreshQueued = false;

  async function fetchJson(path) {
    const response = await fetch(path, {cache: "no-store"});
    if (!response.ok) throw new Error(path + ": HTTP " + String(response.status));
    return response.json();
  }

  function parseRootTuple(value) {
    if (!value) return null;
    return value.split(",").map((part) => Number(part));
  }

  function structuralSnapshot() {
    return globalObject.HybridNavigationSemantics.createStructuralSnapshot({
      requestedDepth: interaction.dataset.requestedDepth,
      materializedDepth: interaction.dataset.materializedDepth,
      selectedDepth: interaction.dataset.selectedDepth,
      focusedDepth: interaction.dataset.focusedDepth,
      visibleDepth: interaction.dataset.visibleDepth
    });
  }

  function geometricSnapshot() {
    const thread25 = globalObject.Thread25GeometricPullbackState;
    if (!thread25 || !thread25.sceneModel || !thread25.projected) throw new Error("Thread 25 geometric state is not ready.");
    return globalObject.HybridNavigationSemantics.createGeometricSnapshot({
      renderedDepth: thread25.currentDepth,
      availableDepths: thread25.sceneModel.levels.map((level) => level.depth),
      sourceObject: thread25.projected.sourceObject,
      pointCount: thread25.projected.pointCount,
      viewId: thread25.projected.viewId,
      projectionMapping: thread25.pullbackView.projection.mapping,
      geometryRendered: thread25.projected.truthfulness.geometryRendered,
      sheetsMaterialized: thread25.projected.truthfulness.sheetsMaterialized,
      coveringStructureClaimed: thread25.projected.truthfulness.coveringStructureClaimed,
      geometricZoomApplied: thread25.projected.truthfulness.geometricZoomApplied
    });
  }

  function selectedPointFromMark(mark, snapshot) {
    return globalObject.HybridNavigationSemantics.createGeometricSelection({
      pointId: mark.dataset.sourcePointId,
      depth: mark.dataset.geometricDepth,
      parentId: mark.dataset.parentId,
      ancestorSampleId: mark.dataset.ancestorX0SampleId,
      rootMultiIndex: parseRootTuple(mark.dataset.rootMultiIndex),
      projectedOverlapCount: Number(mark.dataset.projectedOverlapCount)
    }, snapshot);
  }

  function markSelection() {
    for (const mark of geometricVisualization.querySelectorAll(".geometric-pullback-mark[data-hybrid-selected]")) {
      delete mark.dataset.hybridSelected;
    }
    if (!selectedGeometricObject) return;
    const escaped = typeof CSS !== "undefined" && typeof CSS.escape === "function"
      ? CSS.escape(selectedGeometricObject.pointId)
      : selectedGeometricObject.pointId.replaceAll('"', '\\"');
    const mark = geometricVisualization.querySelector('.geometric-pullback-mark[data-source-point-id="' + escaped + '"]');
    if (mark) mark.dataset.hybridSelected = "true";
  }

  function renderSelection() {
    if (!selectedGeometricObject) {
      selectionField.dataset.pointId = "";
      selectionField.dataset.parentId = "";
      selectionField.dataset.ancestorX0SampleId = "";
      selectionField.dataset.rootMultiIndex = "";
      selectionField.dataset.projectedOverlapCount = "";
      selectionField.textContent = "No geometric point selected. Stage correspondence does not create point identity.";
      return;
    }
    selectionField.dataset.pointId = selectedGeometricObject.pointId;
    selectionField.dataset.parentId = selectedGeometricObject.parentId || "";
    selectionField.dataset.ancestorX0SampleId = selectedGeometricObject.ancestorSampleId;
    selectionField.dataset.rootMultiIndex = selectedGeometricObject.rootMultiIndex ? selectedGeometricObject.rootMultiIndex.join(",") : "";
    selectionField.dataset.projectedOverlapCount = String(selectedGeometricObject.projectedOverlapCount);
    selectionField.textContent =
      "Geometric point " + selectedGeometricObject.pointId +
      " · depth " + String(selectedGeometricObject.depth) +
      " · parent " + (selectedGeometricObject.parentId || "none (X_0 seed)") +
      " · ancestor X_0 sample " + selectedGeometricObject.ancestorSampleId +
      " · root tuple " + (selectedGeometricObject.rootMultiIndex ? "[" + selectedGeometricObject.rootMultiIndex.join(",") + "]" : "none") +
      " · projected-overlap count " + String(selectedGeometricObject.projectedOverlapCount) +
      ". No canonical structural object correspondence.";
  }

  function renderState(nextState) {
    state = nextState;
    root.dataset.state = "ready";
    root.dataset.representationMode = nextState.representationMode;
    root.dataset.structuralRequestedDepth = String(nextState.structural.requestedDepth);
    root.dataset.structuralMaterializedDepth = String(nextState.structural.materializedDepth);
    root.dataset.structuralSelectedDepth = String(nextState.structural.selectedDepth);
    root.dataset.geometricRenderedDepth = String(nextState.geometric.renderedDepth);
    root.dataset.structuralGeometryRendered = "false";
    root.dataset.geometricGeometryRendered = String(nextState.geometric.geometryRendered);
    root.dataset.sheetsMaterialized = "false";
    root.dataset.coveringStructureClaimed = "false";
    root.dataset.geometricZoomApplied = "false";
    root.dataset.lastAction = nextState.navigationProvenance.lastAction;

    representationField.textContent = nextState.representationMode === "structural"
      ? "Structural representation active"
      : "Finite geometric pullback representation active";
    structuralDepthField.textContent =
      "selected " + String(nextState.structural.selectedDepth) +
      " · focused " + String(nextState.structural.focusedDepth) +
      " · materialized " + String(nextState.structural.materializedDepth) +
      " · requested " + String(nextState.structural.requestedDepth);
    geometricDepthField.textContent =
      "rendered " + String(nextState.geometric.renderedDepth) +
      " · available [" + nextState.geometric.availableDepths.join(", ") + "] · " + nextState.geometric.sourceObject;
    correspondenceField.textContent = nextState.crossLayerCorrespondence.selectedStructuralStage.message +
      " Object identity remains unsupported.";

    for (const button of modeButtons) {
      const active = button.dataset.hybridMode === nextState.representationMode;
      button.setAttribute("aria-pressed", String(active));
    }
    for (const panel of panels) {
      panel.dataset.hybridActive = String(panel.dataset.hybridPanel === nextState.representationMode);
    }

    const targetGeometricDepth = nextState.structural.selectedDepth;
    stageToGeometricButton.disabled = !nextState.geometric.availableDepths.includes(targetGeometricDepth);
    stageToGeometricButton.dataset.targetDepth = String(targetGeometricDepth);
    stageToGeometricButton.textContent = stageToGeometricButton.disabled
      ? "No materialized geometric stage for structural X_" + String(targetGeometricDepth)
      : "View geometric stage X_" + String(targetGeometricDepth);

    const targetStructuralDepth = nextState.geometric.renderedDepth;
    const structuralControl = interaction.querySelector('[data-interaction-action="select"][data-depth="' + String(targetStructuralDepth) + '"]');
    stageToStructuralButton.disabled = !structuralControl || structuralControl.disabled;
    stageToStructuralButton.dataset.targetDepth = String(targetStructuralDepth);
    stageToStructuralButton.textContent = stageToStructuralButton.disabled
      ? "Structural stage X_" + String(targetStructuralDepth) + " is not presentation-visible"
      : "Select structural stage X_" + String(targetStructuralDepth);

    renderSelection();
    markSelection();
    globalObject.Thread26HybridNavigationState = nextState;
    globalObject.dispatchEvent(new CustomEvent("thread26:hybrid-state", {detail: nextState}));
  }

  function refresh() {
    if (!config) return;
    try {
      const structural = structuralSnapshot();
      const geometric = geometricSnapshot();
      if (selectedGeometricObject && selectedGeometricObject.depth !== geometric.renderedDepth) selectedGeometricObject = null;
      renderState(globalObject.HybridNavigationSemantics.createHybridNavigationState(config, structural, geometric, {
        representationMode,
        selectedGeometricObject,
        lastAction
      }));
    } catch (error) {
      root.dataset.state = "error";
      root.textContent = "Hybrid navigation unavailable: " + error.message;
      console.error("Failed to refresh Thread 26 hybrid navigation:", error);
    }
  }

  function queueRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    queueMicrotask(() => {
      refreshQueued = false;
      refresh();
    });
  }

  function setMode(mode, action) {
    representationMode = mode;
    lastAction = action;
    refresh();
  }

  function navigateStructuralToGeometric() {
    if (!state) return;
    const depth = state.structural.selectedDepth;
    const option = Array.from(geometricDepthSelect.options).find((candidate) => Number(candidate.value) === depth);
    if (!option) return;
    geometricDepthSelect.value = String(depth);
    representationMode = "geometric";
    geometricDepthSelect.dispatchEvent(new Event("change", {bubbles: true}));
    lastAction = "explicit_structural_stage_to_geometric_stage";
    queueRefresh();
  }

  function navigateGeometricToStructural() {
    if (!state) return;
    const depth = state.geometric.renderedDepth;
    const control = interaction.querySelector('[data-interaction-action="select"][data-depth="' + String(depth) + '"]');
    if (!control || control.disabled) return;
    lastAction = "explicit_geometric_stage_to_structural_stage";
    representationMode = "structural";
    control.click();
    queueRefresh();
  }

  function selectGeometricPoint(event) {
    const mark = event.target?.closest?.(".geometric-pullback-mark");
    if (!mark || !geometricVisualization.contains(mark) || !state) return;
    try {
      selectedGeometricObject = selectedPointFromMark(mark, state.geometric);
      lastAction = "select_geometric_point";
      representationMode = "geometric";
      refresh();
    } catch (error) {
      console.error("Thread 26 geometric point selection rejected:", error);
    }
  }

  function ready() {
    return interaction?.dataset.state === "ready" &&
      geometricVisualization?.dataset.state === "ready" &&
      globalObject.Thread25GeometricPullbackState?.projected;
  }

  function waitForReady(timeoutMs = 20000) {
    if (ready()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + timeoutMs;
      const observer = new MutationObserver(() => {
        if (ready()) {
          observer.disconnect();
          resolve();
        } else if (Date.now() > deadline) {
          observer.disconnect();
          reject(new Error("Timed out waiting for structural and geometric runtimes."));
        }
      });
      observer.observe(document.documentElement, {subtree: true, childList: true, attributes: true});
      const timer = setInterval(() => {
        if (ready()) {
          clearInterval(timer);
          observer.disconnect();
          resolve();
        } else if (Date.now() > deadline) {
          clearInterval(timer);
          observer.disconnect();
          reject(new Error("Timed out waiting for structural and geometric runtimes."));
        }
      }, 100);
    });
  }

  async function initialize() {
    if (!root || !interaction || !geometricVisualization || !geometricDepthSelect ||
        !stageToGeometricButton || !stageToStructuralButton || !representationField ||
        !structuralDepthField || !geometricDepthField || !correspondenceField || !selectionField) {
      throw new Error("Thread 26 hybrid navigation DOM targets are missing.");
    }
    config = globalObject.HybridNavigationSemantics.validateConfig(await fetchJson("data/hybrid-navigation.v1.json"));
    representationMode = config.defaultRepresentationMode;
    await waitForReady();

    for (const button of modeButtons) {
      button.addEventListener("click", () => setMode(button.dataset.hybridMode, "representation_mode_switch"));
    }
    stageToGeometricButton.addEventListener("click", navigateStructuralToGeometric);
    stageToStructuralButton.addEventListener("click", navigateGeometricToStructural);
    geometricVisualization.addEventListener("click", selectGeometricPoint);
    geometricDepthSelect.addEventListener("change", () => {
      selectedGeometricObject = null;
      lastAction = "geometric_depth_changed_independently";
      queueRefresh();
    });

    const structuralObserver = new MutationObserver(queueRefresh);
    structuralObserver.observe(interaction, {attributes: true, childList: true, subtree: false});
    const geometricObserver = new MutationObserver(queueRefresh);
    geometricObserver.observe(geometricVisualization, {attributes: true, childList: true, subtree: false});
    refresh();
  }

  initialize().catch((error) => {
    console.error("Failed to initialize Thread 26 hybrid navigation:", error);
    if (root) {
      root.dataset.state = "error";
      root.textContent = "Hybrid navigation unavailable: " + error.message;
    }
  });
})(typeof globalThis !== "undefined" ? globalThis : this);

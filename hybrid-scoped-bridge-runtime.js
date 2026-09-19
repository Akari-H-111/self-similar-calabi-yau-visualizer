"use strict";

(function initializeHybridScopedBridgeRuntime(globalObject) {
  const root = document.querySelector("#hybrid-scoped-bridge");
  const thread26Root = document.querySelector("#hybrid-navigation");
  const scopedPanel = document.querySelector("#ancestor-scoped-pullback");
  const scopedVisualization = document.querySelector("#ancestor-scoped-pullback-visualization");
  const scopedAncestorSelect = document.querySelector("#ancestor-scoped-pullback-ancestor");
  const scopedDepthSelect = document.querySelector("#ancestor-scoped-pullback-depth");
  const contextButtons = Array.from(document.querySelectorAll("[data-thread31-context]"));
  const panels = Array.from(document.querySelectorAll("[data-thread31-panel]"));
  const thread26StructuralButton = document.querySelector('[data-hybrid-mode="structural"]');
  const thread26GlobalButton = document.querySelector('[data-hybrid-mode="geometric"]');
  const contextField = document.querySelector('[data-thread31-field="context"]');
  const thread26ModeField = document.querySelector('[data-thread31-field="thread26-mode"]');
  const structuralDepthField = document.querySelector('[data-thread31-field="structural-depth"]');
  const globalDepthField = document.querySelector('[data-thread31-field="global-depth"]');
  const scopedDepthField = document.querySelector('[data-thread31-field="scoped-depth"]');
  const ancestorField = document.querySelector('[data-thread31-field="ancestor"]');
  const correspondenceField = document.querySelector('[data-thread31-field="correspondence"]');

  let config = null;
  let contextMode = "structural";
  let lastAction = "initialize";
  let state = null;
  let refreshQueued = false;

  async function fetchJson(path) {
    const response = await fetch(path, {cache: "no-store"});
    if (!response.ok) throw new Error(path + ": HTTP " + String(response.status));
    return response.json();
  }

  function scopedSnapshot() {
    const thread30 = globalObject.Thread30AncestorScopedVisualizationState;
    if (!thread30) throw new Error("Thread 30 scoped visualization state is not ready.");
    const controlAncestorId = scopedAncestorSelect.value;
    const requestedScopedDepth = Number(scopedDepthSelect.value);
    const materialized = Boolean(
      thread30.scopedState &&
      scopedVisualization.dataset.state === "ready" &&
      scopedVisualization.dataset.scopeComplete === "true"
    );
    const materializedScopedDepth = materialized ? thread30.scopedState.requestedScopedDepth : null;
    const materializedAncestorId = materialized ? thread30.scopedState.selectedAncestorIds[0] : null;
    const pointCount = materialized && thread30.projected ? thread30.projected.pointCount : 0;
    return globalObject.HybridScopedBridgeSemantics.createScopedSnapshot({
      controlAncestorId,
      requestedScopedDepth,
      materialized,
      materializedScopedDepth,
      materializedAncestorId,
      pointCount,
      scopeId: materialized ? thread30.scopedState.scopeId : null,
      scopeComplete: materialized,
      lastRequestRejected: scopedVisualization.dataset.state === "over-cap",
      requiredPointCount: scopedVisualization.dataset.requiredPointCount || null,
      globalCompletenessClaim: false
    });
  }

  function thread26Snapshot() {
    const thread26 = globalObject.Thread26HybridNavigationState;
    if (!thread26) throw new Error("Thread 26 hybrid navigation state is not ready.");
    return globalObject.HybridScopedBridgeSemantics.createThread26Snapshot(thread26);
  }

  function renderState(nextState) {
    state = nextState;
    root.dataset.state = "ready";
    root.dataset.contextMode = nextState.contextMode;
    root.dataset.thread26RepresentationMode = nextState.thread26.thread26RepresentationMode;
    root.dataset.structuralRequestedDepth = String(nextState.independentDepths.structuralRequestedDepth);
    root.dataset.structuralMaterializedDepth = String(nextState.independentDepths.structuralMaterializedDepth);
    root.dataset.structuralSelectedDepth = String(nextState.independentDepths.structuralSelectedDepth);
    root.dataset.globalGeometricDepth = String(nextState.independentDepths.globalGeometricDepth);
    root.dataset.scopedRequestedDepth = String(nextState.independentDepths.scopedRequestedDepth);
    root.dataset.scopedMaterializedDepth = nextState.independentDepths.scopedMaterializedDepth === null
      ? "none" : String(nextState.independentDepths.scopedMaterializedDepth);
    root.dataset.scopedMaterialized = String(nextState.scoped.materialized);
    root.dataset.selectedAncestorId = nextState.scoped.controlAncestorId;
    root.dataset.contextSwitchTriggersScopedGeneration = "false";
    root.dataset.sheetsMaterialized = "false";
    root.dataset.coveringStructureClaimed = "false";
    root.dataset.geometricZoomApplied = "false";
    root.dataset.lastAction = nextState.navigationProvenance.lastAction;

    contextField.textContent =
      nextState.contextMode === "structural" ? "Structural context active" :
      nextState.contextMode === "global-geometric" ? "Global finite geometric context active" :
      "Ancestor-scoped geometric context active";
    thread26ModeField.textContent = nextState.thread26.thread26RepresentationMode;
    structuralDepthField.textContent =
      "selected " + String(nextState.independentDepths.structuralSelectedDepth) +
      " · materialized " + String(nextState.independentDepths.structuralMaterializedDepth) +
      " · requested " + String(nextState.independentDepths.structuralRequestedDepth);
    globalDepthField.textContent =
      "rendered " + String(nextState.independentDepths.globalGeometricDepth) +
      " · available [" + nextState.thread26.globalGeometricAvailableDepths.join(", ") + "]";
    scopedDepthField.textContent =
      "requested " + String(nextState.independentDepths.scopedRequestedDepth) +
      " · materialized " + (nextState.independentDepths.scopedMaterializedDepth === null
        ? "none" : String(nextState.independentDepths.scopedMaterializedDepth)) +
      (nextState.scoped.lastRequestRejected ? " · last request rejected" : "");
    ancestorField.textContent = nextState.scoped.materializedAncestorId
      ? nextState.scoped.controlAncestorId + " · rendered ancestor " + nextState.scoped.materializedAncestorId
      : nextState.scoped.controlAncestorId + " · no scoped geometry materialized";
    correspondenceField.textContent =
      "Stage correspondence remains limited to Thread 26's admitted stage index; scoped ancestry is deterministic provenance only. " +
      "No structural node, connected component, sheet, or source identity is created.";

    for (const button of contextButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.thread31Context === nextState.contextMode));
    }
    for (const panel of panels) {
      panel.dataset.thread31Active = String(panel.dataset.thread31Panel === nextState.contextMode);
    }

    globalObject.Thread31HybridScopedBridgeState = nextState;
    globalObject.dispatchEvent(new CustomEvent("thread31:bridge-state", {detail: nextState}));
  }

  function refresh() {
    if (!config) return;
    try {
      renderState(globalObject.HybridScopedBridgeSemantics.createBridgeState(
        config,
        thread26Snapshot(),
        scopedSnapshot(),
        {contextMode, lastAction}
      ));
    } catch (error) {
      root.dataset.state = "error";
      root.textContent = "Thread 31 bridge unavailable: " + error.message;
      console.error("Failed to refresh Thread 31 hybrid scoped bridge:", error);
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

  function setContext(mode) {
    contextMode = mode;
    lastAction = "explicit_context_switch_" + mode;
    if (mode === "structural") {
      thread26StructuralButton.click();
    } else if (mode === "global-geometric") {
      thread26GlobalButton.click();
    } else if (mode === "scoped-geometric") {
      scopedPanel.scrollIntoView({block: "start", behavior: "auto"});
    }
    queueRefresh();
  }

  function ready() {
    return thread26Root?.dataset.state === "ready" &&
      globalObject.Thread26HybridNavigationState &&
      globalObject.Thread30AncestorScopedVisualizationState &&
      scopedAncestorSelect && !scopedAncestorSelect.disabled &&
      scopedDepthSelect && !scopedDepthSelect.disabled;
  }

  function waitForReady(timeoutMs = 20000) {
    if (ready()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + timeoutMs;
      const interval = setInterval(() => {
        if (ready()) {
          clearInterval(interval);
          resolve();
        } else if (Date.now() > deadline) {
          clearInterval(interval);
          reject(new Error("Timed out waiting for Thread 26 and Thread 30 states."));
        }
      }, 100);
    });
  }

  async function initialize() {
    if (!root || !thread26Root || !scopedPanel || !scopedVisualization || !scopedAncestorSelect ||
        !scopedDepthSelect || !thread26StructuralButton || !thread26GlobalButton || !contextField ||
        !thread26ModeField || !structuralDepthField || !globalDepthField || !scopedDepthField ||
        !ancestorField || !correspondenceField || contextButtons.length !== 3) {
      throw new Error("Thread 31 bridge DOM targets are missing.");
    }
    config = globalObject.HybridScopedBridgeSemantics.validateConfig(await fetchJson("data/hybrid-scoped-bridge.v1.json"));
    contextMode = config.defaultContextMode;
    await waitForReady();

    for (const button of contextButtons) {
      button.addEventListener("click", () => setContext(button.dataset.thread31Context));
    }
    globalObject.addEventListener("thread26:hybrid-state", queueRefresh);
    scopedAncestorSelect.addEventListener("change", () => {
      lastAction = "scoped_ancestor_control_changed_independently";
      queueRefresh();
    });
    scopedDepthSelect.addEventListener("change", () => {
      lastAction = "scoped_depth_control_changed_independently";
      queueRefresh();
    });

    const scopedObserver = new MutationObserver(() => {
      lastAction = "scoped_materialization_state_changed";
      queueRefresh();
    });
    scopedObserver.observe(scopedVisualization, {attributes: true, childList: true, subtree: false});
    refresh();
  }

  initialize().catch((error) => {
    console.error("Failed to initialize Thread 31 hybrid scoped bridge:", error);
    if (root) {
      root.dataset.state = "error";
      root.textContent = "Thread 31 bridge unavailable: " + error.message;
    }
  });
})(typeof globalThis !== "undefined" ? globalThis : this);

"use strict";

(function initializeBaseGeometricRuntime(globalObject) {
  const statusElement = document.querySelector("#base-geometric-status");
  const visualizationElement = document.querySelector("#base-geometric-visualization");
  const labelElement = document.querySelector("#base-geometric-label");
  const provenanceElement = document.querySelector("#base-geometric-provenance");

  async function fetchJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(path + ": HTTP " + String(response.status));
    return response.json();
  }

  function resetFailureState() {
    visualizationElement.hidden = false;
    visualizationElement.innerHTML = "";
    visualizationElement.dataset.state = "error";
    visualizationElement.dataset.geometryRendered = "false";
    visualizationElement.dataset.sheetsMaterialized = "false";
    visualizationElement.dataset.coveringStructureClaimed = "false";
    visualizationElement.dataset.geometricZoomApplied = "false";
    visualizationElement.dataset.fallbackUsed = "false";
  }

  async function loadBaseGeometricScene() {
    try {
      const [rawScene, rawView, rawConfig] = await Promise.all([
        fetchJson("data/system.v2.json"),
        fetchJson("data/geometric-view.v1.json"),
        fetchJson("data/base-geometric-render-config.v1.json")
      ]);
      const scene = globalObject.ConcreteRuntimeSchema.validateAndNormalizeV2(rawScene);
      const viewBinding = globalObject.ProjectionSliceSemantics.validateViewAgainstScene(rawView, rawScene);
      const sampleModel = globalObject.BaseGeometricSampler.generateSamples(rawScene, rawConfig);
      const projectedScene = globalObject.BaseGeometricRenderer.createProjectedScene(rawScene, rawView, sampleModel);
      globalObject.BaseGeometricRenderer.renderBaseGeometricScene(projectedScene, visualizationElement);

      labelElement.textContent = viewBinding.view.uiWording.requiredLabel;
      statusElement.dataset.state = projectedScene.truthfulness.geometryRendered ? "ready" : "empty";
      statusElement.textContent = projectedScene.truthfulness.geometryRendered
        ? `Rendered ${sampleModel.sampleCount} deterministic validated X_0 samples. Maximum numerical residual ${sampleModel.maxResidualMagnitude.toExponential(3)}. geometryRendered=true; sheets/covering/geometric zoom remain false.`
        : "No valid X_0 samples were produced by the declared deterministic sampler. No fallback geometry was generated.";
      provenanceElement.textContent =
        `Provenance: data/system.v2.json → ${scene.mathematics.baseHypersurface.definingFunction.representation.formulaId} evaluator → ` +
        `${sampleModel.samplerId} → data/geometric-view.v1.json → (Re(z1), Im(z1)) → SVG presentation transform. ` +
        "Each mark is one validated finite sample; the finite projection is not the complete X_0.";
    } catch (error) {
      console.error("Failed to initialize Thread 24 base geometric renderer:", error);
      resetFailureState();
      labelElement.textContent = "Sampled projection of X_0 onto the z_1 complex plane";
      statusElement.dataset.state = "error";
      statusElement.textContent = "Base geometric renderer unavailable: " + error.message;
      provenanceElement.textContent = "No geometric marks were generated; invented fallback geometry is forbidden.";
    }
  }

  if (!statusElement || !visualizationElement || !labelElement || !provenanceElement) {
    throw new Error("Thread 24 geometric DOM targets are missing.");
  }
  loadBaseGeometricScene();
})(typeof globalThis !== "undefined" ? globalThis : this);

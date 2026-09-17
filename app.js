"use strict";

const statusElement = document.querySelector("#system-status");
const dataElement = document.querySelector("#system-data");
const rendererElement = document.querySelector("#base-renderer");
const pullbackElement = document.querySelector("#one-step-pullback");
const recursiveElement = document.querySelector("#recursive-lazy-expansion");
const zoomElement = document.querySelector("#zoom-semantics");
const sheetBranchElement = document.querySelector("#sheet-branch-organization");
const structuralVisualizationElement = document.querySelector("#structural-visualization");
const arithmeticOverlayElement = document.querySelector("#arithmetic-overlays");
const expositionElement = document.querySelector("#exposition-layer");

const initialArithmeticOverlayRequest = Object.freeze([
  "coordinate_channels",
  "coordinate_iterate_rule"
]);

const fields = {
  project: document.querySelector("#project-value"),
  version: document.querySelector("#version-value"),
  schemaVersion: document.querySelector("#schema-version-value"),
  D: document.querySelector("#d-value"),
  lambda: document.querySelector("#lambda-value"),
  kappa: document.querySelector("#kappa-value"),
  requestedDepth: document.querySelector("#depth-value"),
  metricScale: document.querySelector("#metric-scale-value"),
  sheetDegree: document.querySelector("#sheet-degree-value"),
  definingFunctionStatus: document.querySelector("#w-status-value")
};

function displayScene(scene) {
  const parameters = scene.mathematics.parameters;

  fields.project.textContent = scene.project;
  fields.version.textContent = scene.version;
  fields.schemaVersion.textContent = String(scene.schemaVersion);
  fields.D.textContent = String(parameters.D);
  fields.lambda.textContent = String(parameters.lambda);
  fields.kappa.textContent = String(parameters.kappa);
  fields.requestedDepth.textContent = String(scene.request.requestedDepth);
  fields.metricScale.textContent = String(scene.derived.metricScale);
  fields.sheetDegree.textContent = String(scene.derived.sheetDegree);
  fields.definingFunctionStatus.textContent = scene.mathematics.baseHypersurface.definingFunction.representation;
}

function resetRenderedState() {
  dataElement.hidden = true;
  expositionElement.hidden = true;
  delete expositionElement.dataset.state;
  delete expositionElement.dataset.geometryRendered;
  delete expositionElement.dataset.sheetsMaterialized;
  delete expositionElement.dataset.coveringStructureClaimed;
  delete expositionElement.dataset.geometricZoomApplied;
  delete expositionElement.dataset.cameraTransformApplied;
  structuralVisualizationElement.hidden = true;
  structuralVisualizationElement.innerHTML = "";
  delete structuralVisualizationElement.dataset.state;
  delete structuralVisualizationElement.dataset.representationKind;
  delete structuralVisualizationElement.dataset.structuralOnly;
  delete structuralVisualizationElement.dataset.materializedDepth;
  delete structuralVisualizationElement.dataset.focusedDepth;
  delete structuralVisualizationElement.dataset.geometryRendered;
  delete structuralVisualizationElement.dataset.sheetsMaterialized;
  delete structuralVisualizationElement.dataset.coveringStructureClaimed;
  delete structuralVisualizationElement.dataset.geometricZoomApplied;
  delete structuralVisualizationElement.dataset.cameraTransformApplied;
  delete structuralVisualizationElement.dataset.materializationTriggered;
  rendererElement.hidden = true;
  rendererElement.textContent = "";
  delete rendererElement.dataset.state;
  delete rendererElement.dataset.geometryRendered;
  pullbackElement.hidden = true;
  pullbackElement.textContent = "";
  delete pullbackElement.dataset.state;
  delete pullbackElement.dataset.depth;
  delete pullbackElement.dataset.geometryRendered;
  delete pullbackElement.dataset.sheetsMaterialized;
  recursiveElement.hidden = true;
  recursiveElement.textContent = "";
  delete recursiveElement.dataset.state;
  delete recursiveElement.dataset.requestedDepth;
  delete recursiveElement.dataset.materializedDepth;
  delete recursiveElement.dataset.expansionComplete;
  delete recursiveElement.dataset.geometryRendered;
  delete recursiveElement.dataset.sheetsMaterialized;
  zoomElement.hidden = true;
  zoomElement.textContent = "";
  delete zoomElement.dataset.state;
  delete zoomElement.dataset.requestedFocusDepth;
  delete zoomElement.dataset.focusedDepth;
  delete zoomElement.dataset.availableDepth;
  delete zoomElement.dataset.requestedDepth;
  delete zoomElement.dataset.focusAvailable;
  delete zoomElement.dataset.geometricZoomApplied;
  delete zoomElement.dataset.cameraTransformApplied;
  delete zoomElement.dataset.materializationTriggered;
  sheetBranchElement.hidden = true;
  sheetBranchElement.textContent = "";
  delete sheetBranchElement.dataset.state;
  delete sheetBranchElement.dataset.sheetDegreeSource;
  delete sheetBranchElement.dataset.sheetDegreePerStep;
  delete sheetBranchElement.dataset.materializedDepth;
  delete sheetBranchElement.dataset.focusedDepth;
  delete sheetBranchElement.dataset.sheetsMaterialized;
  delete sheetBranchElement.dataset.coveringStructureClaimed;
  delete sheetBranchElement.dataset.geometryRendered;
  delete sheetBranchElement.dataset.materializationTriggered;
  arithmeticOverlayElement.hidden = true;
  arithmeticOverlayElement.textContent = "";
  delete arithmeticOverlayElement.dataset.state;
  delete arithmeticOverlayElement.dataset.availableOverlays;
  delete arithmeticOverlayElement.dataset.enabledOverlays;
  delete arithmeticOverlayElement.dataset.materializedDepth;
  delete arithmeticOverlayElement.dataset.focusedDepth;
  delete arithmeticOverlayElement.dataset.materializationTriggered;
  delete arithmeticOverlayElement.dataset.geometryRendered;
}

async function loadSystemConfiguration() {
  try {
    const response = await fetch("data/system.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }

    const rawScene = await response.json();
    const scene = SceneSpec.validateAndNormalizeScene(rawScene);

    const baseModel = BaseRenderer.renderBaseScene(scene, rendererElement);
    const pullbackModel = OneStepPullback.renderOneStepPullback(scene, baseModel, pullbackElement);
    const recursiveModel = RecursiveLazyExpansion.createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel);
    RecursiveLazyExpansion.renderRecursiveLazyExpansion(recursiveModel, recursiveElement);
    const zoomModel = ZoomSemantics.createZoomFocusModel(scene, recursiveModel, 0);
    ZoomSemantics.renderZoomSemantics(zoomModel, zoomElement);
    const organizationModel = SheetBranchOrganization.createSheetBranchOrganizationModel(scene, recursiveModel, zoomModel);
    SheetBranchOrganization.renderSheetBranchOrganization(organizationModel, sheetBranchElement);
    const structuralVisualizationModel = StructuralVisualization.createStructuralVisualizationModel(
      scene,
      baseModel,
      recursiveModel,
      zoomModel,
      organizationModel
    );
    StructuralVisualization.renderStructuralVisualization(structuralVisualizationModel, structuralVisualizationElement);
    const arithmeticOverlayModel = ArithmeticOverlays.createArithmeticOverlayModel(scene, recursiveModel, zoomModel, organizationModel, initialArithmeticOverlayRequest);
    ArithmeticOverlays.renderArithmeticOverlays(arithmeticOverlayModel, arithmeticOverlayElement);
    const expositionModel = ExpositionLayer.createExpositionModel(
      scene,
      baseModel,
      recursiveModel,
      zoomModel,
      organizationModel,
      arithmeticOverlayModel
    );
    ExpositionLayer.renderExpositionLayer(expositionModel, expositionElement);
    displayScene(scene);
    dataElement.hidden = false;
    statusElement.dataset.state = "ready";
    statusElement.textContent = "Loaded and validated. The structural diagram is a model-derived SVG projection; geometry and sheets remain unmaterialized.";
  } catch (error) {
    console.error("Failed to load, validate, or initialize the structural scene:", error);
    resetRenderedState();
    statusElement.dataset.state = "error";
    statusElement.textContent = `Failed to load, validate, or render data/system.json: ${error.message}`;
  }
}

loadSystemConfiguration();

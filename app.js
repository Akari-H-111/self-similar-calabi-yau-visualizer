"use strict";

const statusElement = document.querySelector("#system-status");
const dataElement = document.querySelector("#system-data");
const rendererElement = document.querySelector("#base-renderer");
const pullbackElement = document.querySelector("#one-step-pullback");
const recursiveElement = document.querySelector("#recursive-lazy-expansion");
const zoomElement = document.querySelector("#zoom-semantics");
const sheetBranchElement = document.querySelector("#sheet-branch-organization");
const interactionElement = document.querySelector("#interactive-pullback-tower");
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

let canonicalScene = null;
let baseModel = null;
let pullbackModel = null;
let interactionModel = null;

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

function clearDataset(target, keys) {
  for (const key of keys) delete target.dataset[key];
}

function resetRenderedState() {
  interactionModel = null;
  canonicalScene = null;
  baseModel = null;
  pullbackModel = null;
  dataElement.hidden = true;

  expositionElement.hidden = true;
  clearDataset(expositionElement, ["state", "geometryRendered", "sheetsMaterialized", "coveringStructureClaimed", "geometricZoomApplied", "cameraTransformApplied"]);

  interactionElement.hidden = true;
  interactionElement.innerHTML = "";
  clearDataset(interactionElement, ["state", "selectedDepth", "focusedDepth", "materializedDepth", "requestedDepth", "sourceRequestedDepth", "visibleDepth", "collapsedDepth", "geometryRendered", "sheetsMaterialized", "coveringStructureClaimed", "geometricZoomApplied", "cameraTransformApplied"]);

  structuralVisualizationElement.hidden = true;
  structuralVisualizationElement.innerHTML = "";
  clearDataset(structuralVisualizationElement, ["state", "representationKind", "structuralOnly", "materializedDepth", "focusedDepth", "selectedDepth", "visibleDepth", "collapsedDepth", "geometryRendered", "sheetsMaterialized", "coveringStructureClaimed", "geometricZoomApplied", "cameraTransformApplied", "materializationTriggered"]);

  rendererElement.hidden = true;
  rendererElement.textContent = "";
  clearDataset(rendererElement, ["state", "geometryRendered"]);

  pullbackElement.hidden = true;
  pullbackElement.textContent = "";
  clearDataset(pullbackElement, ["state", "depth", "geometryRendered", "sheetsMaterialized"]);

  recursiveElement.hidden = true;
  recursiveElement.textContent = "";
  clearDataset(recursiveElement, ["state", "requestedDepth", "materializedDepth", "expansionComplete", "geometryRendered", "sheetsMaterialized"]);

  zoomElement.hidden = true;
  zoomElement.textContent = "";
  clearDataset(zoomElement, ["state", "requestedFocusDepth", "focusedDepth", "availableDepth", "requestedDepth", "focusAvailable", "geometricZoomApplied", "cameraTransformApplied", "materializationTriggered"]);

  sheetBranchElement.hidden = true;
  sheetBranchElement.textContent = "";
  clearDataset(sheetBranchElement, ["state", "sheetDegreeSource", "sheetDegreePerStep", "materializedDepth", "focusedDepth", "sheetsMaterialized", "coveringStructureClaimed", "geometryRendered", "materializationTriggered"]);

  arithmeticOverlayElement.hidden = true;
  arithmeticOverlayElement.textContent = "";
  clearDataset(arithmeticOverlayElement, ["state", "availableOverlays", "enabledOverlays", "materializedDepth", "focusedDepth", "materializationTriggered", "geometryRendered"]);
}

function renderInteractionState() {
  if (!canonicalScene || !baseModel || !pullbackModel || !interactionModel) {
    throw new TypeError("Interactive pullback rendering requires initialized canonical and interaction models.");
  }

  const scene = canonicalScene;
  const recursiveModel = interactionModel.recursiveModel;
  const zoomModel = interactionModel.zoomModel;
  const organizationModel = interactionModel.organizationModel;

  RecursiveLazyExpansion.renderRecursiveLazyExpansion(recursiveModel, recursiveElement);
  ZoomSemantics.renderZoomSemantics(zoomModel, zoomElement);
  SheetBranchOrganization.renderSheetBranchOrganization(organizationModel, sheetBranchElement);
  InteractivePullbackTower.renderInteractivePullbackTower(interactionModel, interactionElement);

  const structuralVisualizationModel = StructuralVisualization.createStructuralVisualizationModel(
    scene,
    baseModel,
    recursiveModel,
    zoomModel,
    organizationModel,
    interactionModel
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

  statusElement.dataset.state = "ready";
  statusElement.textContent = (
    `Interactive structural tower ready: selected X_${String(interactionModel.selectedDepth)}, ` +
    `focused X_${String(interactionModel.focusedDepth)}, materialized depth ${String(interactionModel.materializedDepth)}, ` +
    `interaction-requested depth ${String(interactionModel.requestedDepth)}. ` +
    "No geometric zoom, camera transform, genuine sheets, or Calabi–Yau geometry is materialized."
  );
}

function applyInteraction(action, depth = null) {
  if (!interactionModel) throw new TypeError("Interactive pullback state is not initialized.");

  switch (action) {
    case "expand-or-reveal":
      interactionModel = InteractivePullbackTower.expandOrReveal(interactionModel);
      break;
    case "collapse-selected":
      interactionModel = InteractivePullbackTower.collapseSelected(interactionModel);
      break;
    case "select":
      interactionModel = InteractivePullbackTower.selectDepth(interactionModel, depth);
      break;
    case "refocus":
      interactionModel = InteractivePullbackTower.refocusDepth(interactionModel, depth);
      break;
    default:
      throw new TypeError(`Unknown interaction action: ${String(action)}`);
  }

  renderInteractionState();
}

function handleInteractionClick(event) {
  const control = event.target?.closest?.("[data-interaction-action]");
  if (!control || !interactionElement.contains(control) || control.disabled) return;

  const action = control.dataset.interactionAction;
  const depth = Object.hasOwn(control.dataset, "depth") ? Number(control.dataset.depth) : null;

  try {
    applyInteraction(action, depth);
  } catch (error) {
    console.error("Interactive structural transition rejected:", error);
    statusElement.dataset.state = "error";
    statusElement.textContent = `Interactive structural transition rejected: ${error.message}`;
  }
}

async function loadSystemConfiguration() {
  try {
    const response = await fetch("data/system.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());

    const rawScene = await response.json();
    const scene = SceneSpec.validateAndNormalizeScene(rawScene);
    canonicalScene = scene;

    baseModel = BaseRenderer.renderBaseScene(scene, rendererElement);
    pullbackModel = OneStepPullback.renderOneStepPullback(scene, baseModel, pullbackElement);
    interactionModel = InteractivePullbackTower.createInteractivePullbackTowerModel(scene, baseModel, pullbackModel);

    renderInteractionState();
    displayScene(scene);
    dataElement.hidden = false;
  } catch (error) {
    console.error("Failed to load, validate, or initialize the interactive structural scene:", error);
    resetRenderedState();
    statusElement.dataset.state = "error";
    statusElement.textContent = `Failed to load, validate, or render data/system.json: ${error.message}`;
  }
}

interactionElement.addEventListener("click", handleInteractionClick);
loadSystemConfiguration();

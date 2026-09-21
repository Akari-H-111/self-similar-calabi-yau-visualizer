"use strict";

const statusElement = document.querySelector("#system-status");
const dataElement = document.querySelector("#system-data");
const rendererElement = document.querySelector("#base-renderer");
const pullbackElement = document.querySelector("#one-step-pullback");
const recursiveElement = document.querySelector("#recursive-lazy-expansion");
const zoomElement = document.querySelector("#zoom-semantics");
const sheetBranchElement = document.querySelector("#sheet-branch-organization");
const interactionElement = document.querySelector("#interactive-pullback-tower");
const structuralCameraElement = document.querySelector("#structural-camera");
const structuralCameraControlsElement = document.querySelector("#structural-camera-controls");
const structuralCameraStatusElement = document.querySelector("#structural-camera-status");
const arithmeticOverlayControlsElement = document.querySelector("#arithmetic-overlay-controls");
const structuralVisualizationElement = document.querySelector("#structural-visualization");
const arithmeticOverlayElement = document.querySelector("#arithmetic-overlays");
const expositionElement = document.querySelector("#exposition-layer");
const expertWorkbenchElement = document.querySelector("#expert-workbench");
const geometryExplorerElement = document.querySelector("#geometry-explorer");
const simpleExplorationElement = document.querySelector("#simple-exploration");
const simpleCanvasElement = document.querySelector("#simple-canvas");
const simpleGrowElement = document.querySelector("#simple-grow");
const simpleResetElement = document.querySelector("#simple-reset");
const simpleLayerCountElement = document.querySelector("#simple-layer-count");
const simpleFeedbackElement = document.querySelector("#simple-feedback");
const modeControls = Array.from(document.querySelectorAll("[data-ui-mode]"));
const presentationCameraElement = document.querySelector("#structural-3d-presentation");
const presentationCameraStatusElement = document.querySelector("[data-presentation-camera-status]");

const SIMPLE_MAX_DEPTH = 4;
const UI_MODE_STORAGE_KEY = "self-similar-cy-ui-mode";

const initialArithmeticOverlayRequest = Object.freeze([
  ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS,
  ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
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
let structuralCameraModel = null;
let structuralLayoutDescriptor = null;
let infiniteNavigationRenderState = null;
let arithmeticOverlayPresentationState = initialArithmeticOverlayRequest;
const activeCameraPointers = new Map();
let cameraGesture = null;
let uiMode = "simple";
let presentationCameraLoadPromise = null;

function loadPresentationCamera() {
  if (!presentationCameraElement) return Promise.resolve(null);
  if (window.Structural3DPresentation?.instance) return Promise.resolve(window.Structural3DPresentation.instance);
  if (presentationCameraLoadPromise) return presentationCameraLoadPromise;
  presentationCameraElement.dataset.state = "loading";
  presentationCameraStatusElement.textContent = "Loading the presentation-only 3D camera…";
  presentationCameraLoadPromise = import("./structural-3d-presentation.js")
    .then(({ initializeStructural3DPresentation }) => initializeStructural3DPresentation(presentationCameraElement))
    .catch((error) => {
      presentationCameraElement.dataset.state = "error";
      presentationCameraStatusElement.textContent = "The optional 3D presentation camera could not load. Structural and geometric controls remain available.";
      console.error("Failed to load the optional presentation camera:", error);
      throw error;
    });
  return presentationCameraLoadPromise;
}

function observePresentationCameraEntry() {
  if (!presentationCameraElement || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35)) return;
    observer.disconnect();
    loadPresentationCamera().catch(() => {});
  }, { threshold: [0.35] });
  observer.observe(presentationCameraElement);
}

function readUiModePreference() {
  try {
    return localStorage.getItem(UI_MODE_STORAGE_KEY) === "expert" ? "expert" : "simple";
  } catch (_) {
    return "simple";
  }
}

function setUiMode(mode, { persist = true } = {}) {
  uiMode = mode === "expert" ? "expert" : "simple";
  simpleExplorationElement.hidden = uiMode !== "expert";
  expertWorkbenchElement.hidden = uiMode !== "expert";
  presentationCameraElement.hidden = uiMode !== "expert";
  if (geometryExplorerElement) geometryExplorerElement.dataset.presentationMode = uiMode;
  for (const control of modeControls) {
    control.setAttribute("aria-pressed", String(control.dataset.uiMode === uiMode));
  }
  if (persist) {
    try { localStorage.setItem(UI_MODE_STORAGE_KEY, uiMode); } catch (_) { /* Preference is optional. */ }
  }
  window.dispatchEvent(new CustomEvent("ui-presentation-mode", { detail: uiMode }));
}

function syncSimpleCanvas() {
  if (!interactionModel) return;
  const source = getStructuralSurface();
  simpleCanvasElement.replaceChildren();
  if (source) {
    const preview = source.cloneNode(true);
    preview.setAttribute("aria-hidden", "true");
    simpleCanvasElement.append(preview);
  }
  const depth = interactionModel.presentation.visibleDepth;
  simpleLayerCountElement.value = `Layer ${String(depth)}`;
  simpleLayerCountElement.textContent = `Layer ${String(depth)}`;
  simpleGrowElement.disabled = depth >= SIMPLE_MAX_DEPTH;
  simpleFeedbackElement.textContent = depth >= SIMPLE_MAX_DEPTH
    ? "This little experiment is as big as it gets. Start over, or use Expert mode for the precise controls."
    : depth === 0
      ? "Ready to grow layer 1."
      : `You made layer ${String(depth)}. What might the next layer look like?`;
}

function resetSimpleExploration() {
  if (!canonicalScene || !baseModel || !pullbackModel) return;
  interactionModel = InteractivePullbackTower.createInteractivePullbackTowerModel(canonicalScene, baseModel, pullbackModel);
  structuralCameraModel = null;
  renderInteractionState(0);
}

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

function resetCameraGestureState() {
  activeCameraPointers.clear();
  cameraGesture = null;
  structuralVisualizationElement.dataset.cameraDragging = "false";
}

function resetRenderedState() {
  interactionModel = null;
  structuralCameraModel = null;
  structuralLayoutDescriptor = null;
  infiniteNavigationRenderState = null;
  arithmeticOverlayPresentationState = initialArithmeticOverlayRequest;
  canonicalScene = null;
  baseModel = null;
  pullbackModel = null;
  resetCameraGestureState();
  dataElement.hidden = true;

  expositionElement.hidden = true;
  clearDataset(expositionElement, ["state", "geometryRendered", "sheetsMaterialized", "coveringStructureClaimed", "geometricZoomApplied", "cameraTransformApplied"]);

  interactionElement.hidden = true;
  interactionElement.innerHTML = "";
  clearDataset(interactionElement, ["state", "selectedDepth", "focusedDepth", "materializedDepth", "requestedDepth", "sourceRequestedDepth", "visibleDepth", "collapsedDepth", "geometryRendered", "sheetsMaterialized", "coveringStructureClaimed", "geometricZoomApplied", "cameraTransformApplied", "renderVirtualized", "renderWindowStartDepth", "renderWindowEndDepth", "activeRenderedDepthCount"]);

  structuralCameraElement.hidden = true;
  clearDataset(structuralCameraElement, ["state", "cameraScale", "cameraTransformApplied", "geometricZoomApplied", "geometryRendered", "sheetsMaterialized", "coveringStructureClaimed"]);
  structuralCameraStatusElement.textContent = "";

  structuralVisualizationElement.hidden = true;
  structuralVisualizationElement.innerHTML = "";
  clearDataset(structuralVisualizationElement, ["state", "representationKind", "structuralOnly", "materializedDepth", "focusedDepth", "selectedDepth", "visibleDepth", "collapsedDepth", "geometryRendered", "sheetsMaterialized", "coveringStructureClaimed", "geometricZoomApplied", "cameraTransformApplied", "materializationTriggered", "cameraDragging", "arithmeticOverlayGraphicsState", "arithmeticOverlayGraphicsRepresentation", "arithmeticOverlayGraphicsEnabled", "arithmeticOverlayGraphicsAnnotationCount", "renderVirtualized", "renderWindowStartDepth", "renderWindowEndDepth", "activeRenderedDepthCount", "infiniteNavigationRenderer", "semanticMaterializedDepth", "presentationVisibleDepth", "virtualAnchorDepth", "presentationPoolSize", "virtualLayoutCacheEntries", "virtualLayoutCacheCapacity", "virtualLayoutCacheHits", "virtualLayoutCacheMisses", "virtualLayoutCacheEvictions"]);

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
  updateArithmeticOverlayControlState();
}

function getStructuralSurface() {
  return structuralVisualizationElement.querySelector(".structural-visualization__surface");
}

function updateCameraControlState() {
  if (!structuralCameraModel || !interactionModel) return;

  const resetControl = structuralCameraControlsElement.querySelector('[data-camera-action="reset"]');
  const fitSelectedControl = structuralCameraControlsElement.querySelector('[data-camera-action="fit-selected"]');
  const fitFocusedControl = structuralCameraControlsElement.querySelector('[data-camera-action="fit-focused"]');
  if (resetControl) resetControl.disabled = !structuralCameraModel.cameraTransformApplied;
  if (fitSelectedControl) fitSelectedControl.disabled = interactionModel.selectedDepth === null;
  if (fitFocusedControl) fitFocusedControl.disabled = interactionModel.focusedDepth === null;
}

function applyStructuralCameraState() {
  if (!structuralCameraModel || !structuralLayoutDescriptor) {
    throw new TypeError("Structural camera rendering requires initialized camera and layout state.");
  }

  const surface = getStructuralSurface();
  if (!surface) {
    throw new TypeError("Structural camera requires the current structural SVG surface.");
  }

  StructuralCamera.applyStructuralCamera(structuralCameraModel, surface);

  structuralCameraElement.hidden = false;
  structuralCameraElement.dataset.state = "ready";
  structuralCameraElement.dataset.cameraScale = String(structuralCameraModel.cameraScale);
  structuralCameraElement.dataset.cameraTransformApplied = String(structuralCameraModel.cameraTransformApplied);
  structuralCameraElement.dataset.geometricZoomApplied = "false";
  structuralCameraElement.dataset.geometryRendered = "false";
  structuralCameraElement.dataset.sheetsMaterialized = "false";
  structuralCameraElement.dataset.coveringStructureClaimed = "false";

  structuralCameraStatusElement.textContent = (
    `Camera scale ${structuralCameraModel.cameraScale.toFixed(3)}× · ` +
    `cameraTransformApplied=${String(structuralCameraModel.cameraTransformApplied)} · ` +
    "presentation-only viewport navigation · geometricZoomApplied=false."
  );
  updateCameraControlState();
}

function reconcileStructuralCamera(layoutDescriptor) {
  if (!layoutDescriptor || layoutDescriptor.kind !== StructuralVisualization.LAYOUT_KIND) {
    throw new TypeError("Structural camera reconciliation requires a structural visualization layout descriptor.");
  }

  structuralLayoutDescriptor = layoutDescriptor;
  structuralCameraModel = structuralCameraModel === null
    ? StructuralCamera.createStructuralCameraModel({
        canonicalViewBox: layoutDescriptor.canonicalViewBox,
        contentBounds: layoutDescriptor.contentBounds
      })
    : StructuralCamera.reconcileCameraExtent(
        structuralCameraModel,
        layoutDescriptor.canonicalViewBox,
        layoutDescriptor.contentBounds
      );

  applyStructuralCameraState();
}

function updateArithmeticOverlayControlState() {
  const enabled = new Set(arithmeticOverlayPresentationState);
  for (const control of arithmeticOverlayControlsElement.querySelectorAll("[data-arithmetic-overlay-id]")) {
    control.checked = enabled.has(control.dataset.arithmeticOverlayId);
  }
}

function createCurrentArithmeticOverlayModel(scene, recursiveModel, zoomModel, organizationModel) {
  if (arithmeticOverlayPresentationState === initialArithmeticOverlayRequest) {
    return ArithmeticOverlays.createArithmeticOverlayModel(scene, recursiveModel, zoomModel, organizationModel, initialArithmeticOverlayRequest);
  }
  return ArithmeticOverlays.createArithmeticOverlayModel(
    scene,
    recursiveModel,
    zoomModel,
    organizationModel,
    arithmeticOverlayPresentationState
  );
}

function renderArithmeticOverlayPresentation(scene, recursiveModel, zoomModel, organizationModel) {
  if (!scene || !baseModel || !interactionModel || !structuralLayoutDescriptor) {
    throw new TypeError("Arithmetic overlay presentation requires initialized runtime and structural layout state.");
  }

  const arithmeticOverlayModel = createCurrentArithmeticOverlayModel(
    scene,
    recursiveModel,
    zoomModel,
    organizationModel
  );

  ArithmeticOverlays.renderArithmeticOverlays(arithmeticOverlayModel, arithmeticOverlayElement);
  ArithmeticOverlayGraphics.projectArithmeticOverlayGraphics(
    arithmeticOverlayModel,
    structuralLayoutDescriptor,
    structuralVisualizationElement
  );

  const expositionModel = ExpositionLayer.createExpositionModel(
    scene,
    baseModel,
    recursiveModel,
    zoomModel,
    organizationModel,
    arithmeticOverlayModel
  );
  ExpositionLayer.renderExpositionLayer(expositionModel, expositionElement);
  updateArithmeticOverlayControlState();

  return arithmeticOverlayModel;
}

function setArithmeticOverlayPresentation(overlayId, enabled) {
  if (!initialArithmeticOverlayRequest.includes(overlayId)) {
    throw new TypeError(`Unsupported arithmetic overlay presentation id: ${String(overlayId)}`);
  }

  const enabledSet = new Set(arithmeticOverlayPresentationState);
  if (enabled) {
    enabledSet.add(overlayId);
  } else {
    enabledSet.delete(overlayId);
  }
  arithmeticOverlayPresentationState = Object.freeze(
    initialArithmeticOverlayRequest.filter((candidate) => enabledSet.has(candidate))
  );
  renderArithmeticOverlayPresentation(
    canonicalScene,
    interactionModel.recursiveModel,
    interactionModel.zoomModel,
    interactionModel.organizationModel
  );
}

function handleArithmeticOverlayToggle(event) {
  const control = event.target?.closest?.("[data-arithmetic-overlay-id]");
  if (!control || !arithmeticOverlayControlsElement.contains(control) || control.type !== "checkbox") return;

  try {
    setArithmeticOverlayPresentation(control.dataset.arithmeticOverlayId, control.checked);
    statusElement.dataset.state = "ready";
    statusElement.textContent =
      `Arithmetic overlay ${control.dataset.arithmeticOverlayId} ${control.checked ? "enabled" : "disabled"}. Structural, recursion, and camera state are unchanged.`;
  } catch (error) {
    console.error("Arithmetic overlay presentation transition rejected:", error);
    control.checked = arithmeticOverlayPresentationState.includes(control.dataset.arithmeticOverlayId);
    statusElement.dataset.state = "error";
    statusElement.textContent = `Arithmetic overlay presentation transition rejected: ${error.message}`;
  }
}

function renderInteractionState(anchorDepth = undefined) {
  if (!canonicalScene || !baseModel || !pullbackModel || !interactionModel) {
    throw new TypeError("Interactive pullback rendering requires initialized canonical and interaction models.");
  }

  const scene = canonicalScene;
  const recursiveModel = interactionModel.recursiveModel;
  const zoomModel = interactionModel.zoomModel;
  const organizationModel = interactionModel.organizationModel;
  const rendererOptions = anchorDepth === undefined ? {} : {anchorDepth};
  infiniteNavigationRenderState = InfiniteNavigationRenderer.createInfiniteNavigationRendererState(
    interactionModel,
    infiniteNavigationRenderState,
    rendererOptions
  );
  const structuralPresentationOptions = InfiniteNavigationRenderer.createStructuralPresentationOptions(infiniteNavigationRenderState);

  RecursiveLazyExpansion.renderRecursiveLazyExpansion(recursiveModel, recursiveElement);
  ZoomSemantics.renderZoomSemantics(zoomModel, zoomElement);
  SheetBranchOrganization.renderSheetBranchOrganization(organizationModel, sheetBranchElement);
  InfiniteNavigationRenderer.renderVirtualizedInteractionPresentation(
    interactionModel,
    infiniteNavigationRenderState,
    interactionElement
  );

  const structuralVisualizationModel = StructuralVisualization.createStructuralVisualizationModel(
    scene,
    baseModel,
    recursiveModel,
    zoomModel,
    organizationModel,
    interactionModel,
    structuralPresentationOptions
  );
  StructuralVisualization.renderStructuralVisualization(structuralVisualizationModel, structuralVisualizationElement);
  // Read-only handoff to the 3D presentation adapter. It carries no geometric runtime state.
  window.__structuralPresentationModel = structuralVisualizationModel;
  window.dispatchEvent(new CustomEvent("structural-presentation-model", { detail: structuralVisualizationModel }));
  reconcileStructuralCamera(StructuralVisualization.createStructuralLayoutDescriptor(structuralVisualizationModel));
  InfiniteNavigationRenderer.applyRendererStateToTarget(infiniteNavigationRenderState, structuralVisualizationElement);

  InfiniteNavigationRenderer.projectOrganizationBadges(
    sheetBranchElement,
    structuralVisualizationElement
  );
  renderArithmeticOverlayPresentation(scene, recursiveModel, zoomModel, organizationModel);
  syncSimpleCanvas();

  statusElement.dataset.state = "ready";
  statusElement.textContent = InfiniteNavigationRenderer.createInteractionAnnouncement(
    interactionModel,
    infiniteNavigationRenderState
  );
}

function applyInteraction(action, depth = null) {
  if (!interactionModel) throw new TypeError("Interactive pullback state is not initialized.");

  let nextAnchorDepth;
  switch (action) {
    case "expand-or-reveal":
      interactionModel = InteractivePullbackTower.expandOrReveal(interactionModel);
      nextAnchorDepth = interactionModel.presentation.visibleDepth;
      break;
    case "collapse-selected":
      interactionModel = InteractivePullbackTower.collapseSelected(interactionModel);
      nextAnchorDepth = interactionModel.selectedDepth;
      break;
    case "select":
      interactionModel = InteractivePullbackTower.selectDepth(interactionModel, depth);
      nextAnchorDepth = depth;
      break;
    case "refocus":
      interactionModel = InteractivePullbackTower.refocusDepth(interactionModel, depth);
      nextAnchorDepth = depth;
      break;
    default:
      throw new TypeError(`Unknown interaction action: ${String(action)}`);
  }

  renderInteractionState(nextAnchorDepth);
}

function handleInteractionClick(event) {
  const control = event.target?.closest?.("[data-interaction-action]");
  if (!control || !interactionElement.contains(control) || control.disabled) return;

  const action = control.dataset.interactionAction;
  const depth = Object.hasOwn(control.dataset, "depth") ? Number(control.dataset.depth) : null;
  const focusDescriptor = InfiniteNavigationRenderer.createInteractionFocusDescriptor(
    action,
    depth,
    interactionModel
  );

  try {
    applyInteraction(action, depth);
    InfiniteNavigationRenderer.restoreInteractionFocus(
      interactionElement,
      focusDescriptor,
      interactionModel
    );
  } catch (error) {
    console.error("Interactive structural transition rejected:", error);
    statusElement.dataset.state = "error";
    statusElement.textContent = `Interactive structural transition rejected: ${error.message}`;
  }
}

function applyCameraAction(action) {
  if (!structuralCameraModel || !structuralLayoutDescriptor || !interactionModel) {
    throw new TypeError("Structural camera state is not initialized.");
  }

  switch (action) {
    case "zoom-in":
      structuralCameraModel = StructuralCamera.zoomCamera(structuralCameraModel, 1.25);
      break;
    case "zoom-out":
      structuralCameraModel = StructuralCamera.zoomCamera(structuralCameraModel, 0.8);
      break;
    case "fit-visible":
      structuralCameraModel = StructuralCamera.fitCameraToVisibleStructure(structuralCameraModel, { padding: 0 });
      break;
    case "fit-selected":
      structuralCameraModel = StructuralCamera.fitCameraToLevel(
        structuralCameraModel,
        structuralLayoutDescriptor,
        interactionModel.selectedDepth,
        { padding: 24 }
      );
      break;
    case "fit-focused":
      structuralCameraModel = StructuralCamera.fitCameraToLevel(
        structuralCameraModel,
        structuralLayoutDescriptor,
        interactionModel.focusedDepth,
        { padding: 24 }
      );
      break;
    case "reset":
      structuralCameraModel = StructuralCamera.resetCamera(structuralCameraModel);
      break;
    default:
      throw new TypeError(`Unknown camera action: ${String(action)}`);
  }

  applyStructuralCameraState();
}

const CAMERA_FOCUS_FALLBACK_ACTIONS = Object.freeze([
  "zoom-in",
  "zoom-out",
  "fit-visible",
  "fit-selected",
  "fit-focused"
]);

function restoreCameraControlFocus(action) {
  const primary = structuralCameraControlsElement.querySelector(
    `[data-camera-action="${String(action)}"]`
  );
  if (primary && !primary.disabled && typeof primary.focus === "function") {
    primary.focus();
    return true;
  }

  for (const fallbackAction of CAMERA_FOCUS_FALLBACK_ACTIONS) {
    const fallback = structuralCameraControlsElement.querySelector(
      `[data-camera-action="${fallbackAction}"]`
    );
    if (fallback && !fallback.disabled && typeof fallback.focus === "function") {
      fallback.focus();
      return true;
    }
  }

  return false;
}

function handleCameraControlClick(event) {
  const control = event.target?.closest?.("[data-camera-action]");
  if (!control || !structuralCameraControlsElement.contains(control) || control.disabled) return;

  const action = control.dataset.cameraAction;
  try {
    applyCameraAction(action);
    restoreCameraControlFocus(action);
    statusElement.dataset.state = "ready";
    statusElement.textContent =
      `Structural camera action ${action} applied. Camera scale ${structuralCameraModel.cameraScale.toFixed(3)}×; geometric zoom remains false.`;
  } catch (error) {
    console.error("Structural camera transition rejected:", error);
    structuralCameraStatusElement.textContent = `Structural camera transition rejected: ${error.message}`;
  }
}

function clientPointToCameraWorld(camera, clientX, clientY) {
  const surface = getStructuralSurface();
  if (!surface) return null;
  const rectangle = surface.getBoundingClientRect();
  if (rectangle.width <= 0 || rectangle.height <= 0) return null;

  const viewBox = StructuralCamera.getCameraViewBox(camera);
  return Object.freeze({
    x: viewBox.x + ((clientX - rectangle.left) / rectangle.width) * viewBox.width,
    y: viewBox.y + ((clientY - rectangle.top) / rectangle.height) * viewBox.height,
    rectangle,
    viewBox
  });
}

function handleStructuralCameraWheel(event) {
  if (!structuralCameraModel) return;

  // Browser / OS accessibility zoom and ordinary page scrolling outrank the presentation camera.
  if (event.ctrlKey || event.metaKey) return;
  if (!event.altKey) return;

  const anchor = clientPointToCameraWorld(structuralCameraModel, event.clientX, event.clientY);
  if (!anchor) return;

  event.preventDefault();
  const factor = Math.exp(-event.deltaY * 0.0015);
  structuralCameraModel = StructuralCamera.zoomCamera(structuralCameraModel, factor, anchor.x, anchor.y);
  applyStructuralCameraState();
}

function pointerMidpoint(first, second) {
  return Object.freeze({
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2
  });
}

function pointerDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function beginPanGesture(pointerId, point) {
  cameraGesture = Object.freeze({
    kind: "pan",
    pointerId,
    camera: structuralCameraModel,
    startPoint: Object.freeze({ x: point.x, y: point.y })
  });
  structuralVisualizationElement.dataset.cameraDragging = "true";
}

function beginPinchGesture() {
  const points = Array.from(activeCameraPointers.values()).slice(0, 2);
  if (points.length < 2) return;
  const midpoint = pointerMidpoint(points[0], points[1]);
  const distance = pointerDistance(points[0], points[1]);
  if (distance <= 0) return;

  cameraGesture = Object.freeze({
    kind: "pinch",
    camera: structuralCameraModel,
    startMidpoint: midpoint,
    startDistance: distance
  });
  structuralVisualizationElement.dataset.cameraDragging = "true";
}

function handleStructuralCameraPointerDown(event) {
  if (!structuralCameraModel || event.button !== 0 || event.pointerType === "touch") return;
  activeCameraPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  structuralVisualizationElement.setPointerCapture?.(event.pointerId);
  event.preventDefault();

  if (activeCameraPointers.size >= 2) {
    beginPinchGesture();
  } else {
    beginPanGesture(event.pointerId, { x: event.clientX, y: event.clientY });
  }
}

function handleStructuralCameraPointerMove(event) {
  if (!structuralCameraModel || !activeCameraPointers.has(event.pointerId) || !cameraGesture) return;
  activeCameraPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  const surface = getStructuralSurface();
  if (!surface) return;
  const rectangle = surface.getBoundingClientRect();
  if (rectangle.width <= 0 || rectangle.height <= 0) return;

  event.preventDefault();

  if (cameraGesture.kind === "pan") {
    if (cameraGesture.pointerId !== event.pointerId) return;
    const startViewBox = StructuralCamera.getCameraViewBox(cameraGesture.camera);
    const deltaX = event.clientX - cameraGesture.startPoint.x;
    const deltaY = event.clientY - cameraGesture.startPoint.y;
    structuralCameraModel = StructuralCamera.panCamera(
      cameraGesture.camera,
      -(deltaX / rectangle.width) * startViewBox.width,
      -(deltaY / rectangle.height) * startViewBox.height
    );
    applyStructuralCameraState();
    return;
  }

  const points = Array.from(activeCameraPointers.values()).slice(0, 2);
  if (points.length < 2) return;
  const midpoint = pointerMidpoint(points[0], points[1]);
  const distance = pointerDistance(points[0], points[1]);
  if (distance <= 0) return;

  const anchor = clientPointToCameraWorld(
    cameraGesture.camera,
    cameraGesture.startMidpoint.x,
    cameraGesture.startMidpoint.y
  );
  if (!anchor) return;

  let nextCamera = StructuralCamera.zoomCamera(
    cameraGesture.camera,
    distance / cameraGesture.startDistance,
    anchor.x,
    anchor.y
  );
  const nextViewBox = StructuralCamera.getCameraViewBox(nextCamera);
  nextCamera = StructuralCamera.panCamera(
    nextCamera,
    -((midpoint.x - cameraGesture.startMidpoint.x) / rectangle.width) * nextViewBox.width,
    -((midpoint.y - cameraGesture.startMidpoint.y) / rectangle.height) * nextViewBox.height
  );
  structuralCameraModel = nextCamera;
  applyStructuralCameraState();
}

function handleStructuralCameraPointerEnd(event) {
  if (!activeCameraPointers.has(event.pointerId)) return;
  activeCameraPointers.delete(event.pointerId);
  structuralVisualizationElement.releasePointerCapture?.(event.pointerId);

  if (activeCameraPointers.size >= 2) {
    beginPinchGesture();
    return;
  }
  if (activeCameraPointers.size === 1) {
    const [pointerId, point] = activeCameraPointers.entries().next().value;
    beginPanGesture(pointerId, point);
    return;
  }

  cameraGesture = null;
  structuralVisualizationElement.dataset.cameraDragging = "false";
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
presentationCameraElement?.addEventListener("click", (event) => {
  const action = event.target.closest?.("[data-presentation-camera-action]")?.dataset.presentationCameraAction;
  if (action === "activate") loadPresentationCamera().catch(() => {});
});
for (const control of modeControls) {
  control.addEventListener("click", () => setUiMode(control.dataset.uiMode));
}
simpleGrowElement.addEventListener("click", () => {
  if (!interactionModel || interactionModel.presentation.visibleDepth >= SIMPLE_MAX_DEPTH) return;
  try {
    applyInteraction("expand-or-reveal");
  } catch (error) {
    console.error("Simple exploration transition rejected:", error);
    simpleFeedbackElement.textContent = `That layer could not be made: ${error.message}`;
  }
});
simpleResetElement.addEventListener("click", resetSimpleExploration);
structuralCameraControlsElement.addEventListener("click", handleCameraControlClick);
arithmeticOverlayControlsElement.addEventListener("change", handleArithmeticOverlayToggle);
structuralVisualizationElement.addEventListener("wheel", handleStructuralCameraWheel, { passive: false });
structuralVisualizationElement.addEventListener("pointerdown", handleStructuralCameraPointerDown);
structuralVisualizationElement.addEventListener("pointermove", handleStructuralCameraPointerMove);
structuralVisualizationElement.addEventListener("pointerup", handleStructuralCameraPointerEnd);
structuralVisualizationElement.addEventListener("pointercancel", handleStructuralCameraPointerEnd);
setUiMode(readUiModePreference(), { persist: false });
// The original structural playground and its optional 3D descriptor layout are
// retained for research inspection, but no longer compete with the finite
// computed view on the first visitor screen.
expertWorkbenchElement.append(simpleExplorationElement, presentationCameraElement);
observePresentationCameraEntry();
loadSystemConfiguration();

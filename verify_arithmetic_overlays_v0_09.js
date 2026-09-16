"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { SceneSpecError, validateAndNormalizeScene } = require("./scene-spec.js");
const { renderBaseScene } = require("./base-renderer.js");
const { renderOneStepPullback } = require("./one-step-pullback.js");
const {
  createRecursiveLazyExpansionModel,
  expandOneLevel,
  renderRecursiveLazyExpansion
} = require("./recursive-lazy-expansion.js");
const { createZoomFocusModel, renderZoomSemantics } = require("./zoom-semantics.js");
const {
  createSheetBranchOrganizationModel,
  renderSheetBranchOrganization
} = require("./sheet-branch-organization.js");
const {
  MODEL_KIND,
  ACTIVE_STATUS,
  IDLE_STATUS,
  UNAVAILABLE_STATUS,
  NOT_MATERIALIZED_STATUS,
  UNSUPPORTED_STATUS,
  EVIDENCE_CLASSES,
  OVERLAY_IDS,
  SOURCE_ARTIFACTS,
  createArithmeticOverlayModel,
  renderArithmeticOverlays
} = require("./arithmetic-overlays.js");

const repositoryRoot = __dirname;
const canonicalScene = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "data", "system.json"), "utf8"));
const appSource = fs.readFileSync(path.join(repositoryRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repositoryRoot, "index.html"), "utf8");
const overlaySource = fs.readFileSync(path.join(repositoryRoot, "arithmetic-overlays.js"), "utf8");
const recursiveSource = fs.readFileSync(path.join(repositoryRoot, "recursive-lazy-expansion.js"), "utf8");
const zoomSource = fs.readFileSync(path.join(repositoryRoot, "zoom-semantics.js"), "utf8");
const organizationSource = fs.readFileSync(path.join(repositoryRoot, "sheet-branch-organization.js"), "utf8");
const coordinatePowerSource = fs.readFileSync(
  path.join(repositoryRoot, "formal", "SelfSimilarCY", "CoordinatePower.lean"),
  "utf8"
);
const coordinateIterationSource = fs.readFileSync(
  path.join(repositoryRoot, "formal", "SelfSimilarCY", "CoordinatePowerIteration.lean"),
  "utf8"
);

function cloneScene(scene = canonicalScene) {
  return JSON.parse(JSON.stringify(scene));
}

function createTarget() {
  return { hidden: true, dataset: {}, textContent: "" };
}

function gitBlobSha(source) {
  const body = Buffer.from(source, "utf8");
  return crypto.createHash("sha1").update(`blob ${String(body.length)}\0`).update(body).digest("hex");
}

function initialize(rawScene, focusDepth = 0, requestedOverlayIds = []) {
  const scene = validateAndNormalizeScene(rawScene);
  const baseModel = renderBaseScene(scene, createTarget());
  const pullbackModel = renderOneStepPullback(scene, baseModel, createTarget());
  const recursiveModel = createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel);
  renderRecursiveLazyExpansion(recursiveModel, createTarget());
  const zoomModel = createZoomFocusModel(scene, recursiveModel, focusDepth);
  renderZoomSemantics(zoomModel, createTarget());
  const organizationModel = createSheetBranchOrganizationModel(scene, recursiveModel, zoomModel);
  renderSheetBranchOrganization(organizationModel, createTarget());
  const overlayTarget = createTarget();
  const overlayModel = createArithmeticOverlayModel(
    scene,
    recursiveModel,
    zoomModel,
    organizationModel,
    requestedOverlayIds
  );
  renderArithmeticOverlays(overlayModel, overlayTarget);
  return {
    scene,
    baseModel,
    pullbackModel,
    recursiveModel,
    zoomModel,
    organizationModel,
    overlayModel,
    overlayTarget
  };
}

const canonicalVersionMatch = /^v0\.(\d+)$/.exec(canonicalScene.version);
assert.ok(canonicalVersionMatch, "Repository version metadata must use v0.xx form.");
assert.ok(Number(canonicalVersionMatch[1]) >= 9, "v0.09 overlay verifier requires repository version v0.09 or later.");

assert.equal(gitBlobSha(coordinatePowerSource), SOURCE_ARTIFACTS.coordinatePower.blobSha);
assert.equal(gitBlobSha(coordinateIterationSource), SOURCE_ARTIFACTS.coordinatePowerIteration.blobSha);
assert.ok(coordinatePowerSource.includes("abbrev Point4 := Fin 4 → ℂ"));
assert.ok(coordinatePowerSource.includes("theorem coordinatePower_apply"));
assert.ok(coordinatePowerSource.includes("theorem coordinatePower_unique"));
assert.ok(coordinateIterationSource.includes("theorem coordinatePower_iterate_apply"));
assert.ok(coordinateIterationSource.includes("theorem coordinatePower_iterate"));
assert.equal(SOURCE_ARTIFACTS.coordinatePower.formalSealCommit, "ff5bcd2f134497c671b2368c372f59b5620a41ab");
assert.equal(SOURCE_ARTIFACTS.coordinatePowerIteration.formalSealCommit, "ff5bcd2f134497c671b2368c372f59b5620a41ab");

const allDisabled = initialize(canonicalScene, 0, []);
assert.equal(allDisabled.overlayModel.kind, MODEL_KIND);
assert.equal(allDisabled.overlayModel.status, IDLE_STATUS);
assert.deepEqual(allDisabled.overlayModel.enabledOverlays, []);
assert.deepEqual(allDisabled.overlayModel.overlayDescriptors, []);
assert.deepEqual([...allDisabled.overlayModel.availableOverlays].sort(), [
  OVERLAY_IDS.COORDINATE_CHANNELS,
  OVERLAY_IDS.COORDINATE_ITERATE_RULE
].sort());
assert.equal(allDisabled.overlayModel.materializationTriggered, false);
assert.equal(allDisabled.overlayModel.geometryRendered, false);
assert.equal(allDisabled.overlayModel.formalVerificationReopened, false);
assert.equal(allDisabled.overlayTarget.dataset.state, IDLE_STATUS);

const oneEnabled = initialize(canonicalScene, 0, [OVERLAY_IDS.COORDINATE_CHANNELS]);
assert.equal(oneEnabled.overlayModel.status, ACTIVE_STATUS);
assert.deepEqual(oneEnabled.overlayModel.enabledOverlays, [OVERLAY_IDS.COORDINATE_CHANNELS]);
assert.equal(oneEnabled.overlayModel.overlayDescriptors.length, 1);
const channelsDescriptor = oneEnabled.overlayModel.overlayDescriptors[0];
assert.equal(channelsDescriptor.overlayId, OVERLAY_IDS.COORDINATE_CHANNELS);
assert.equal(channelsDescriptor.scope, "global_system_metadata");
assert.equal(channelsDescriptor.evidenceClass, EVIDENCE_CLASSES.SOURCE_BACKED_STRUCTURAL_REPRESENTATION);
assert.equal(channelsDescriptor.formalSupport, EVIDENCE_CLASSES.FORMAL_THEOREM);
assert.equal(channelsDescriptor.coordinateCount, oneEnabled.scene.mathematics.pullbackMap.coordinateCount);
assert.equal(channelsDescriptor.coordinateCount, 4);
assert.equal(channelsDescriptor.mapKind, oneEnabled.scene.mathematics.pullbackMap.kind);
assert.equal(channelsDescriptor.exponentParameter, oneEnabled.scene.mathematics.pullbackMap.exponentParameter);
assert.equal(channelsDescriptor.channels.length, 4);
assert.deepEqual(channelsDescriptor.channels.map((channel) => channel.index), [0, 1, 2, 3]);
assert.deepEqual(channelsDescriptor.channels.map((channel) => channel.displayLabel), ["z_1", "z_2", "z_3", "z_4"]);
assert.equal(channelsDescriptor.canonicalSource.artifact, "formal/SelfSimilarCY/CoordinatePower.lean");
assert.equal(channelsDescriptor.canonicalSource.sourceVersion, `git-blob:${SOURCE_ARTIFACTS.coordinatePower.blobSha}`);
assert.equal(channelsDescriptor.geometryRequired, false);
assert.equal(channelsDescriptor.geometryRendered, false);

const depthOneScene = cloneScene();
depthOneScene.request.requestedDepth = 1;
const iterateEnabled = initialize(depthOneScene, 1, [OVERLAY_IDS.COORDINATE_ITERATE_RULE]);
assert.deepEqual(iterateEnabled.overlayModel.enabledOverlays, [OVERLAY_IDS.COORDINATE_ITERATE_RULE]);
const iterateDescriptor = iterateEnabled.overlayModel.overlayDescriptors[0];
assert.equal(iterateDescriptor.scope, "focused_level_metadata");
assert.equal(iterateDescriptor.evidenceClass, EVIDENCE_CLASSES.FORMAL_THEOREM);
assert.equal(iterateDescriptor.theoremIdentity, "coordinatePower_iterate_apply");
assert.equal(iterateDescriptor.focusedDepth, 1);
assert.equal(iterateDescriptor.channels.length, 4);
assert.deepEqual(iterateDescriptor.channels[0].exponentExpression, { baseParameter: "D", towerDepth: 1 });
assert.equal(iterateDescriptor.canonicalSource.artifact, "formal/SelfSimilarCY/CoordinatePowerIteration.lean");
assert.equal(iterateDescriptor.geometryRequired, false);
assert.equal(iterateDescriptor.materializationTriggered, false);

const multipleEnabled = initialize(depthOneScene, 1, [
  OVERLAY_IDS.COORDINATE_CHANNELS,
  OVERLAY_IDS.COORDINATE_ITERATE_RULE
]);
assert.equal(multipleEnabled.overlayModel.enabledOverlays.length, 2);
assert.equal(multipleEnabled.overlayModel.overlayDescriptors.length, 2);
assert.deepEqual([...multipleEnabled.overlayModel.enabledOverlays].sort(), [
  OVERLAY_IDS.COORDINATE_CHANNELS,
  OVERLAY_IDS.COORDINATE_ITERATE_RULE
].sort());

const coreBeforeToggle = JSON.stringify({
  recursive: multipleEnabled.recursiveModel,
  zoom: multipleEnabled.zoomModel,
  organization: multipleEnabled.organizationModel
});
const disabledAfterEnable = createArithmeticOverlayModel(
  multipleEnabled.scene,
  multipleEnabled.recursiveModel,
  multipleEnabled.zoomModel,
  multipleEnabled.organizationModel,
  []
);
assert.equal(disabledAfterEnable.status, IDLE_STATUS);
assert.deepEqual(disabledAfterEnable.enabledOverlays, []);
assert.deepEqual(disabledAfterEnable.overlayDescriptors, []);
assert.equal(JSON.stringify({
  recursive: multipleEnabled.recursiveModel,
  zoom: multipleEnabled.zoomModel,
  organization: multipleEnabled.organizationModel
}), coreBeforeToggle, "Overlay toggles must not mutate recursive, zoom, or sheet-organization models.");

const deferredRequest = initialize(canonicalScene, 0, [OVERLAY_IDS.TORSION_LABELS]);
assert.equal(deferredRequest.overlayModel.status, IDLE_STATUS);
assert.equal(deferredRequest.overlayModel.requestResults[0].requestStatus, UNAVAILABLE_STATUS);
assert.equal(deferredRequest.overlayModel.requestResults[0].evidenceClass, EVIDENCE_CLASSES.UNRESOLVED_UNAVAILABLE);
assert.equal(deferredRequest.overlayModel.requestResults[0].canonicalSource, null);
assert.equal(deferredRequest.overlayModel.requestResults[0].sourceVersion, null);
assert.deepEqual(deferredRequest.overlayModel.enabledOverlays, []);

const unsupportedRequest = initialize(canonicalScene, 0, ["unknown_overlay"]);
assert.equal(unsupportedRequest.overlayModel.requestResults[0].requestStatus, UNSUPPORTED_STATUS);
assert.equal(unsupportedRequest.overlayModel.requestResults[0].canonicalSource, null);
assert.deepEqual(unsupportedRequest.overlayModel.enabledOverlays, []);

const depthThreeScene = cloneScene();
depthThreeScene.request.requestedDepth = 3;
const depthThreeInitial = initialize(depthThreeScene, 1, []);
assert.equal(depthThreeInitial.recursiveModel.materializedDepth, 1);
const unavailableZoom = createZoomFocusModel(depthThreeInitial.scene, depthThreeInitial.recursiveModel, 2);
const unavailableOrganization = createSheetBranchOrganizationModel(
  depthThreeInitial.scene,
  depthThreeInitial.recursiveModel,
  unavailableZoom
);
const unavailableCoreSnapshot = JSON.stringify({
  recursive: depthThreeInitial.recursiveModel,
  zoom: unavailableZoom,
  organization: unavailableOrganization
});
const unavailableOverlay = createArithmeticOverlayModel(
  depthThreeInitial.scene,
  depthThreeInitial.recursiveModel,
  unavailableZoom,
  unavailableOrganization,
  [OVERLAY_IDS.COORDINATE_CHANNELS, OVERLAY_IDS.COORDINATE_ITERATE_RULE]
);
assert.deepEqual(unavailableOverlay.enabledOverlays, [OVERLAY_IDS.COORDINATE_CHANNELS]);
assert.equal(unavailableOverlay.requestResults[1].requestStatus, NOT_MATERIALIZED_STATUS);
assert.equal(unavailableOverlay.requestResults[1].descriptor, null);
assert.equal(unavailableOverlay.materializationTriggered, false);
assert.equal(depthThreeInitial.recursiveModel.materializedDepth, 1, "Overlay must not materialize unavailable focus.");
assert.equal(JSON.stringify({
  recursive: depthThreeInitial.recursiveModel,
  zoom: unavailableZoom,
  organization: unavailableOrganization
}), unavailableCoreSnapshot);

const expandedDepthTwo = expandOneLevel(depthThreeInitial.recursiveModel);
const depthTwoZoom = createZoomFocusModel(depthThreeInitial.scene, expandedDepthTwo, 2);
const depthTwoOrganization = createSheetBranchOrganizationModel(depthThreeInitial.scene, expandedDepthTwo, depthTwoZoom);
const depthTwoOverlay = createArithmeticOverlayModel(
  depthThreeInitial.scene,
  expandedDepthTwo,
  depthTwoZoom,
  depthTwoOrganization,
  [OVERLAY_IDS.COORDINATE_ITERATE_RULE]
);
assert.deepEqual(depthTwoOverlay.enabledOverlays, [OVERLAY_IDS.COORDINATE_ITERATE_RULE]);
assert.equal(depthTwoOverlay.overlayDescriptors[0].focusedDepth, 2);
assert.deepEqual(depthTwoOverlay.overlayDescriptors[0].channels[3].exponentExpression, { baseParameter: "D", towerDepth: 2 });

for (const deferredId of [
  OVERLAY_IDS.CYCLOTOMIC_REFINEMENT,
  OVERLAY_IDS.TORSION_LABELS,
  OVERLAY_IDS.COLLISION_CLASSES,
  OVERLAY_IDS.DELTA_N_DIVISOR
]) {
  const deferred = allDisabled.overlayModel.deferredCandidateOverlays.find((entry) => entry.overlayId === deferredId);
  assert.ok(deferred, `${deferredId} must be explicitly recorded as deferred.`);
  assert.equal(deferred.implementationStatus, "deferred");
  assert.equal(deferred.evidenceClass, EVIDENCE_CLASSES.UNRESOLVED_UNAVAILABLE);
  assert.equal(deferred.canonicalSource, null);
  assert.equal(deferred.sourceVersion, null);
}

const malformed = cloneScene();
delete malformed.mathematics.parameters.D;
const untouchedTarget = createTarget();
assert.throws(() => {
  const scene = validateAndNormalizeScene(malformed);
  const baseModel = renderBaseScene(scene, createTarget());
  const pullbackModel = renderOneStepPullback(scene, baseModel, createTarget());
  const recursiveModel = createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel);
  const zoomModel = createZoomFocusModel(scene, recursiveModel, 0);
  const organizationModel = createSheetBranchOrganizationModel(scene, recursiveModel, zoomModel);
  renderArithmeticOverlays(
    createArithmeticOverlayModel(scene, recursiveModel, zoomModel, organizationModel, [OVERLAY_IDS.COORDINATE_CHANNELS]),
    untouchedTarget
  );
}, (error) => error instanceof SceneSpecError);
assert.deepEqual(untouchedTarget, createTarget(), "Malformed scene must be rejected before arithmetic overlay target changes.");

assert.throws(
  () => createArithmeticOverlayModel(
    oneEnabled.scene,
    oneEnabled.recursiveModel,
    oneEnabled.zoomModel,
    oneEnabled.organizationModel,
    [OVERLAY_IDS.COORDINATE_CHANNELS, OVERLAY_IDS.COORDINATE_CHANNELS]
  ),
  TypeError
);

assert.equal(Object.hasOwn(canonicalScene, "overlays"), false);
assert.equal(Object.hasOwn(canonicalScene, "enabledOverlays"), false);
assert.equal(Object.hasOwn(canonicalScene, "derived"), false);
assert.equal(oneEnabled.scene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");
assert.equal(oneEnabled.baseModel.geometryRendered, false);
assert.equal(oneEnabled.pullbackModel.sheetsMaterialized, false);
assert.equal(oneEnabled.recursiveModel.sheetsMaterialized, false);
assert.equal(oneEnabled.organizationModel.sheetsMaterialized, false);
assert.equal(oneEnabled.organizationModel.coveringStructureClaimed, false);

const validationCall = "SceneSpec.validateAndNormalizeScene(rawScene)";
const recursiveCreateCall = "RecursiveLazyExpansion.createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel)";
const zoomCreateCall = "ZoomSemantics.createZoomFocusModel(scene, recursiveModel, 0)";
const organizationCreateCall = "SheetBranchOrganization.createSheetBranchOrganizationModel(scene, recursiveModel, zoomModel)";
const overlayCreateCall = "ArithmeticOverlays.createArithmeticOverlayModel(scene, recursiveModel, zoomModel, organizationModel, initialArithmeticOverlayRequest)";
const overlayRenderCall = "ArithmeticOverlays.renderArithmeticOverlays(arithmeticOverlayModel, arithmeticOverlayElement)";
assert.ok(appSource.includes('fetch("data/system.json"'));
assert.ok(appSource.indexOf(validationCall) >= 0);
assert.ok(appSource.indexOf(recursiveCreateCall) > appSource.indexOf(validationCall));
assert.ok(appSource.indexOf(zoomCreateCall) > appSource.indexOf(recursiveCreateCall));
assert.ok(appSource.indexOf(organizationCreateCall) > appSource.indexOf(zoomCreateCall));
assert.ok(appSource.indexOf(overlayCreateCall) > appSource.indexOf(organizationCreateCall));
assert.ok(appSource.indexOf(overlayRenderCall) > appSource.indexOf(overlayCreateCall));
assert.equal(appSource.includes("expandOneLevel("), false, "Application initialization must not expand recursion for arithmetic overlays.");

const organizationScript = '<script src="sheet-branch-organization.js" defer></script>';
const overlayScript = '<script src="arithmetic-overlays.js" defer></script>';
const appScript = '<script src="app.js" defer></script>';
assert.ok(indexSource.indexOf(organizationScript) >= 0);
assert.ok(indexSource.indexOf(overlayScript) > indexSource.indexOf(organizationScript));
assert.ok(indexSource.indexOf(appScript) > indexSource.indexOf(overlayScript));
assert.ok(indexSource.includes('id="arithmetic-overlays"'));

assert.equal(overlaySource.includes("validateAndNormalizeScene"), false, "Overlay layer must not create a second scene validator.");
assert.equal(overlaySource.includes("SceneSpec"), false, "Overlay layer must consume an upstream normalized scene.");
assert.equal(overlaySource.includes("parameters.D"), false, "Overlay layer must not create a second D source.");
assert.equal(overlaySource.includes("** 2"), false, "Overlay layer must not recompute D^2.");
assert.equal(overlaySource.includes("** 4"), false, "Overlay layer must not recompute D^4.");
assert.equal(overlaySource.includes("expandOneLevel"), false, "Overlay layer must not materialize recursion.");
assert.equal(recursiveSource.includes("ArithmeticOverlays"), false, "Recursive engine must remain overlay-agnostic.");
assert.equal(zoomSource.includes("ArithmeticOverlays"), false, "Zoom engine must remain overlay-agnostic.");
assert.equal(organizationSource.includes("ArithmeticOverlays"), false, "Sheet organization must remain overlay-agnostic.");

for (const forbiddenToken of [
  "sheetObjects",
  "branchObjects",
  "torsionPoints",
  "collisionPoints",
  "fabricatedPoints",
  "fiberGeometry",
  "mesh",
  "implicitSurface",
  "THREE",
  "WebGL",
  "gpuBuffer",
  "cameraMatrix",
  "projectionMatrix",
  "performanceScheduler"
]) {
  assert.equal(overlaySource.includes(forbiddenToken), false, `Arithmetic overlay layer must not contain ${forbiddenToken}.`);
}

console.log("arithmetic overlays v0.09 verification: passed");
console.log("implemented overlays: coordinate_channels + coordinate_iterate_rule");
console.log("evidence boundary: exact Lean provenance verified by git-blob SHA");
console.log("cyclotomic/torsion/collision/Delta_n candidates: unavailable and deferred without guessed data");
console.log("toggle independence and unavailable-focus no-materialization behavior: passed");
console.log("geometry remains unresolved; formal F01-F06 remains sealed");
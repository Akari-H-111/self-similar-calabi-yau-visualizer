"use strict";

const fs = require("node:fs");
const path = require("node:path");
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
  MODEL_KIND,
  DESCRIPTOR_KIND,
  AVAILABLE_STATUS,
  BASE_STATUS,
  NOT_MATERIALIZED_STATUS,
  createSheetBranchOrganizationModel,
  renderSheetBranchOrganization
} = require("./sheet-branch-organization.js");

const repositoryRoot = __dirname;
const canonicalScene = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "data", "system.json"), "utf8"));
const appSource = fs.readFileSync(path.join(repositoryRoot, "app.js"), "utf8");
const organizationSource = fs.readFileSync(path.join(repositoryRoot, "sheet-branch-organization.js"), "utf8");
const recursiveSource = fs.readFileSync(path.join(repositoryRoot, "recursive-lazy-expansion.js"), "utf8");
const zoomSource = fs.readFileSync(path.join(repositoryRoot, "zoom-semantics.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repositoryRoot, "index.html"), "utf8");

function cloneScene(scene = canonicalScene) {
  return JSON.parse(JSON.stringify(scene));
}

function createTarget() {
  return { hidden: true, dataset: {}, textContent: "" };
}

function initialize(rawScene, focusDepth = 0) {
  const scene = validateAndNormalizeScene(rawScene);
  const baseModel = renderBaseScene(scene, createTarget());
  const pullbackModel = renderOneStepPullback(scene, baseModel, createTarget());
  const recursiveModel = createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel);
  renderRecursiveLazyExpansion(recursiveModel, createTarget());
  const zoomModel = createZoomFocusModel(scene, recursiveModel, focusDepth);
  renderZoomSemantics(zoomModel, createTarget());
  const organizationTarget = createTarget();
  const organizationModel = createSheetBranchOrganizationModel(scene, recursiveModel, zoomModel);
  renderSheetBranchOrganization(organizationModel, organizationTarget);
  return { scene, baseModel, pullbackModel, recursiveModel, zoomModel, organizationModel, organizationTarget };
}

assert.equal(canonicalScene.version, "v0.08");

const baseCase = initialize(canonicalScene, 0);
assert.equal(baseCase.organizationModel.kind, MODEL_KIND);
assert.equal(baseCase.organizationModel.descriptorMode, "aggregate_structural_descriptors");
assert.equal(baseCase.organizationModel.sheetDegreeSource, "scene.derived.sheetDegree");
assert.equal(baseCase.organizationModel.sheetDegreeSemanticStatus, "runtime_numeric_organizational_metadata");
assert.equal(baseCase.organizationModel.sheetDegreePerStep, 16);
assert.equal(baseCase.organizationModel.sheetDegreePerStep, baseCase.scene.derived.sheetDegree);
assert.equal(baseCase.organizationModel.requestedDepth, 0);
assert.equal(baseCase.organizationModel.materializedDepth, 0);
assert.equal(baseCase.organizationModel.focusedDepth, 0);
assert.equal(baseCase.organizationModel.organizationStatus, BASE_STATUS);
assert.equal(baseCase.organizationModel.organizationAvailable, true);
assert.equal(baseCase.organizationModel.levelOrganizations.length, 0);
assert.equal(baseCase.organizationModel.focusedOrganization, null);
assert.equal(baseCase.organizationModel.slotsEnumerated, false);
assert.equal(baseCase.organizationModel.sheetsMaterialized, false);
assert.equal(baseCase.organizationModel.coveringStructureClaimed, false);
assert.equal(baseCase.organizationModel.geometryRendered, false);
assert.equal(baseCase.organizationModel.materializationTriggered, false);
assert.equal(baseCase.organizationTarget.dataset.sheetDegreePerStep, "16");
assert.equal(baseCase.organizationTarget.dataset.sheetsMaterialized, "false");
assert.equal(baseCase.organizationTarget.dataset.coveringStructureClaimed, "false");

const depthOneScene = cloneScene();
depthOneScene.request.requestedDepth = 1;
const depthOne = initialize(depthOneScene, 1);
assert.equal(depthOne.recursiveModel.materializedDepth, 1);
assert.equal(depthOne.organizationModel.organizationStatus, AVAILABLE_STATUS);
assert.equal(depthOne.organizationModel.levelOrganizations.length, 1);
assert.equal(depthOne.organizationModel.levelOrganizations[0].kind, DESCRIPTOR_KIND);
assert.equal(depthOne.organizationModel.levelOrganizations[0].depth, 1);
assert.equal(depthOne.organizationModel.levelOrganizations[0].sourceDepth, 0);
assert.equal(depthOne.organizationModel.levelOrganizations[0].nominalMultiplicity, 16);
assert.equal(depthOne.organizationModel.levelOrganizations[0].sheetDegreeSource, "scene.derived.sheetDegree");
assert.deepEqual(depthOne.organizationModel.levelOrganizations[0].iteratedDegreeExpression, { baseDegree: 16, exponent: 1 });
assert.equal(depthOne.organizationModel.levelOrganizations[0].aggregateOnly, true);
assert.equal(depthOne.organizationModel.levelOrganizations[0].slotsEnumerated, false);
assert.equal(depthOne.organizationModel.levelOrganizations[0].sheetsMaterialized, false);
assert.equal(depthOne.organizationModel.levelOrganizations[0].geometryRendered, false);
assert.equal(depthOne.organizationModel.focusedOrganization, depthOne.organizationModel.levelOrganizations[0]);

const depthThreeScene = cloneScene();
depthThreeScene.request.requestedDepth = 3;
const depthThreeInitial = initialize(depthThreeScene, 1);
assert.equal(depthThreeInitial.recursiveModel.materializedDepth, 1);
assert.equal(depthThreeInitial.organizationModel.levelOrganizations.length, 1);

const unavailableZoom = createZoomFocusModel(depthThreeInitial.scene, depthThreeInitial.recursiveModel, 2);
const unavailableOrganization = createSheetBranchOrganizationModel(
  depthThreeInitial.scene,
  depthThreeInitial.recursiveModel,
  unavailableZoom
);
assert.equal(unavailableOrganization.organizationStatus, NOT_MATERIALIZED_STATUS);
assert.equal(unavailableOrganization.organizationAvailable, false);
assert.equal(unavailableOrganization.focusedDepth, null);
assert.equal(unavailableOrganization.focusedOrganization, null);
assert.equal(unavailableOrganization.levelOrganizations.length, 1);
assert.equal(unavailableOrganization.materializationTriggered, false);
assert.equal(depthThreeInitial.recursiveModel.materializedDepth, 1, "Organization view must not expand recursion.");

const depthTwoRecursive = expandOneLevel(depthThreeInitial.recursiveModel);
assert.equal(depthTwoRecursive.materializedDepth, 2);
const depthTwoZoom = createZoomFocusModel(depthThreeInitial.scene, depthTwoRecursive, 2);
const depthTwoOrganization = createSheetBranchOrganizationModel(depthThreeInitial.scene, depthTwoRecursive, depthTwoZoom);
assert.equal(depthTwoOrganization.organizationStatus, AVAILABLE_STATUS);
assert.equal(depthTwoOrganization.levelOrganizations.length, 2);
assert.equal(depthTwoOrganization.focusedOrganization.depth, 2);
assert.equal(depthTwoOrganization.focusedOrganization.nominalMultiplicity, 16);
assert.deepEqual(depthTwoOrganization.focusedOrganization.iteratedDegreeExpression, { baseDegree: 16, exponent: 2 });
assert.equal(depthTwoOrganization.sheetsMaterialized, false);
assert.equal(depthTwoOrganization.coveringStructureClaimed, false);
assert.equal(depthTwoOrganization.geometryRendered, false);

const changedDScene = cloneScene();
changedDScene.mathematics.parameters.D = 3;
changedDScene.request.requestedDepth = 2;
const changedDInitial = initialize(changedDScene, 1);
assert.equal(changedDInitial.scene.derived.sheetDegree, 81);
assert.equal(changedDInitial.organizationModel.sheetDegreePerStep, 81);
assert.equal(changedDInitial.organizationModel.levelOrganizations[0].nominalMultiplicity, 81);
const changedDRecursive = expandOneLevel(changedDInitial.recursiveModel);
const changedDZoom = createZoomFocusModel(changedDInitial.scene, changedDRecursive, 2);
const changedDOrganization = createSheetBranchOrganizationModel(changedDInitial.scene, changedDRecursive, changedDZoom);
assert.equal(changedDOrganization.sheetDegreePerStep, 81);
assert.equal(changedDOrganization.levelOrganizations.length, 2);
assert.deepEqual(changedDOrganization.focusedOrganization.iteratedDegreeExpression, { baseDegree: 81, exponent: 2 });

const malformed = cloneScene();
delete malformed.mathematics.parameters.D;
const untouchedTarget = createTarget();
assert.throws(() => {
  const scene = validateAndNormalizeScene(malformed);
  const baseModel = renderBaseScene(scene, createTarget());
  const pullbackModel = renderOneStepPullback(scene, baseModel, createTarget());
  const recursiveModel = createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel);
  const zoomModel = createZoomFocusModel(scene, recursiveModel, 0);
  renderSheetBranchOrganization(createSheetBranchOrganizationModel(scene, recursiveModel, zoomModel), untouchedTarget);
}, (error) => error instanceof SceneSpecError);
assert.deepEqual(untouchedTarget, createTarget(), "Malformed scene must be rejected before organization target changes.");

const incompatibleZoom = { ...depthOne.zoomModel, availableDepth: 0 };
assert.throws(
  () => createSheetBranchOrganizationModel(depthOne.scene, depthOne.recursiveModel, incompatibleZoom),
  TypeError
);

assert.equal(Object.hasOwn(canonicalScene, "sheetBranchOrganization"), false);
assert.equal(Object.hasOwn(canonicalScene, "derived"), false);
assert.equal(baseCase.scene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");
assert.equal(baseCase.baseModel.geometryRendered, false);
assert.equal(baseCase.pullbackModel.sheetsMaterialized, false);
assert.equal(baseCase.recursiveModel.sheetsMaterialized, false);

const validationCall = "SceneSpec.validateAndNormalizeScene(rawScene)";
const recursiveCreateCall = "RecursiveLazyExpansion.createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel)";
const zoomCreateCall = "ZoomSemantics.createZoomFocusModel(scene, recursiveModel, 0)";
const organizationCreateCall = "SheetBranchOrganization.createSheetBranchOrganizationModel(scene, recursiveModel, zoomModel)";
const organizationRenderCall = "SheetBranchOrganization.renderSheetBranchOrganization(organizationModel, sheetBranchElement)";
assert.ok(appSource.includes('fetch("data/system.json"'));
assert.ok(appSource.indexOf(validationCall) >= 0);
assert.ok(appSource.indexOf(recursiveCreateCall) > appSource.indexOf(validationCall));
assert.ok(appSource.indexOf(zoomCreateCall) > appSource.indexOf(recursiveCreateCall));
assert.ok(appSource.indexOf(organizationCreateCall) > appSource.indexOf(zoomCreateCall));
assert.ok(appSource.indexOf(organizationRenderCall) > appSource.indexOf(organizationCreateCall));
assert.equal(appSource.includes("expandOneLevel("), false, "Application initialization must not expand recursion for sheet organization.");

const sceneSpecScript = '<script src="scene-spec.js" defer></script>';
const recursiveScript = '<script src="recursive-lazy-expansion.js" defer></script>';
const zoomScript = '<script src="zoom-semantics.js" defer></script>';
const organizationScript = '<script src="sheet-branch-organization.js" defer></script>';
const appScript = '<script src="app.js" defer></script>';
assert.ok(indexSource.indexOf(sceneSpecScript) >= 0);
assert.ok(indexSource.indexOf(recursiveScript) > indexSource.indexOf(sceneSpecScript));
assert.ok(indexSource.indexOf(zoomScript) > indexSource.indexOf(recursiveScript));
assert.ok(indexSource.indexOf(organizationScript) > indexSource.indexOf(zoomScript));
assert.ok(indexSource.indexOf(appScript) > indexSource.indexOf(organizationScript));
assert.ok(indexSource.includes('id="sheet-branch-organization"'));

assert.ok(organizationSource.includes("scene.derived.sheetDegree"), "D^4 runtime metadata must come from the normalized derived field.");
assert.equal(organizationSource.includes("parameters.D"), false, "Organization layer must not create a second D source.");
assert.equal(organizationSource.includes("** 4"), false, "Organization layer must not recompute D^4.");
assert.equal(organizationSource.includes("Math.pow"), false, "Organization layer must not recompute D^4 indirectly.");
assert.equal(organizationSource.includes("scene.request"), false, "Requested depth must come from the recursive model, not a second request source.");
assert.equal(organizationSource.includes("expandOneLevel"), false, "Organization layer must not materialize recursion.");
assert.equal(recursiveSource.includes("SheetBranchOrganization"), false, "Recursive engine must remain organization-agnostic.");
assert.equal(zoomSource.includes("SheetBranchOrganization"), false, "Zoom engine must remain organization-agnostic.");

for (const forbiddenToken of [
  "sheetObjects",
  "branchObjects",
  "fiberGeometry",
  "points",
  "mesh",
  "implicitSurface",
  "THREE",
  "WebGL",
  "canvas",
  "<svg",
  "cameraMatrix",
  "projectionMatrix",
  "viewportTransform"
]) {
  assert.equal(organizationSource.includes(forbiddenToken), false, `Organization layer must not contain ${forbiddenToken}.`);
}

console.log("sheet/branch organization v0.08 verification: passed");
console.log("D^4 semantics: runtime numeric/organizational metadata only; no genuine covering claim");
console.log("organization: one aggregate descriptor per already-materialized positive depth; D^4 slots are not enumerated");
console.log("requestedDepth/materializedDepth/focusedDepth separation: passed");
console.log("unavailable focus and organization views do not trigger recursion: passed");
console.log("concrete sheets and geometry remain unmaterialized: passed");

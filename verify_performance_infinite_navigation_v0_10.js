"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const rawSceneTemplate = require("./data/system.json");
const SceneSpec = require("./scene-spec.js");
const BaseRenderer = require("./base-renderer.js");
const OneStepPullback = require("./one-step-pullback.js");
const RecursiveLazyExpansion = require("./recursive-lazy-expansion.js");
const ZoomSemantics = require("./zoom-semantics.js");
const SheetBranchOrganization = require("./sheet-branch-organization.js");
const ArithmeticOverlays = require("./arithmetic-overlays.js");

const STRESS_DEPTH = 1000;
const UNSAFE_INTEGER = Number.MAX_SAFE_INTEGER + 1;

function cloneRawScene(requestedDepth) {
  const rawScene = JSON.parse(JSON.stringify(rawSceneTemplate));
  rawScene.request.requestedDepth = requestedDepth;
  return rawScene;
}

function buildInitialModels(requestedDepth) {
  const scene = SceneSpec.validateAndNormalizeScene(cloneRawScene(requestedDepth));
  const baseModel = BaseRenderer.createBaseRenderModel(scene);
  const oneStepModel = OneStepPullback.createOneStepPullbackModel(scene, baseModel);
  const recursiveModel = RecursiveLazyExpansion.createRecursiveLazyExpansionModel(scene, baseModel, oneStepModel);
  return { scene, baseModel, oneStepModel, recursiveModel };
}

assert.throws(
  () => SceneSpec.validateAndNormalizeScene(cloneRawScene(UNSAFE_INTEGER)),
  (error) => error instanceof SceneSpec.SceneSpecError,
  "requestedDepth outside Number safe-integer range must be rejected as an engineering representation guard."
);

const safeMaximumScene = SceneSpec.validateAndNormalizeScene(cloneRawScene(Number.MAX_SAFE_INTEGER));
assert.equal(safeMaximumScene.request.requestedDepth, Number.MAX_SAFE_INTEGER);
const safeMaximumBase = BaseRenderer.createBaseRenderModel(safeMaximumScene);
const safeMaximumOneStep = OneStepPullback.createOneStepPullbackModel(safeMaximumScene, safeMaximumBase);
const safeMaximumRecursive = RecursiveLazyExpansion.createRecursiveLazyExpansionModel(
  safeMaximumScene,
  safeMaximumBase,
  safeMaximumOneStep
);
assert.equal(safeMaximumRecursive.materializedDepth, 1);
assert.equal(safeMaximumRecursive.requestedDepth, Number.MAX_SAFE_INTEGER);
assert.equal(safeMaximumRecursive.expansionComplete, false);
assert.equal(safeMaximumRecursive.levels.length, 1);
assert.throws(
  () => ZoomSemantics.createZoomFocusModel(safeMaximumScene, safeMaximumRecursive, UNSAFE_INTEGER),
  TypeError,
  "unsafe focus depth must be rejected before comparison aliases can occur."
);
const safeUnmaterializedFocus = ZoomSemantics.createZoomFocusModel(
  safeMaximumScene,
  safeMaximumRecursive,
  Number.MAX_SAFE_INTEGER
);
assert.equal(safeUnmaterializedFocus.focusStatus, ZoomSemantics.NOT_MATERIALIZED_STATUS);
assert.equal(safeUnmaterializedFocus.materializationTriggered, false);
assert.equal(safeMaximumRecursive.materializedDepth, 1);

const { scene, recursiveModel: initialRecursiveModel } = buildInitialModels(STRESS_DEPTH);
let recursiveModel = initialRecursiveModel;
assert.equal(recursiveModel.materializedDepth, 1);
assert.equal(recursiveModel.levels.length, 1);
assert.equal(recursiveModel.requestedDepth, STRESS_DEPTH);
assert.equal(recursiveModel.geometryRendered, false);
assert.equal(recursiveModel.sheetsMaterialized, false);

let expansionCalls = 0;
while (!recursiveModel.expansionComplete) {
  const previousModel = recursiveModel;
  const previousDepth = previousModel.materializedDepth;
  recursiveModel = RecursiveLazyExpansion.expandOneLevel(previousModel);
  expansionCalls += 1;

  assert.equal(recursiveModel.materializedDepth, previousDepth + 1);
  assert.equal(recursiveModel.levels.length, recursiveModel.materializedDepth);
  assert.equal(previousModel.materializedDepth, previousDepth, "immutable prior model must remain unchanged.");
  assert.equal(previousModel.levels.length, previousDepth, "immutable prior levels must remain unchanged.");
  assert.equal(Object.isFrozen(recursiveModel), true);
  assert.equal(Object.isFrozen(recursiveModel.levels), true);

  const frontier = recursiveModel.levels[recursiveModel.levels.length - 1];
  assert.equal(frontier.depth, recursiveModel.materializedDepth);
  assert.equal(frontier.sourceDepth, frontier.depth - 1);
  assert.equal(frontier.mapDegreePerStep, scene.derived.sheetDegree);
  assert.deepEqual(frontier.iteratedDegreeExpression, {
    baseDegree: scene.derived.sheetDegree,
    exponent: frontier.depth
  });
  assert.equal(frontier.geometryRendered, false);
  assert.equal(frontier.sheetsMaterialized, false);
}

assert.equal(expansionCalls, STRESS_DEPTH - 1);
assert.equal(recursiveModel.materializedDepth, STRESS_DEPTH);
assert.equal(recursiveModel.levels.length, STRESS_DEPTH);
assert.equal(recursiveModel.expansionComplete, true);
assert.strictEqual(
  RecursiveLazyExpansion.expandOneLevel(recursiveModel),
  recursiveModel,
  "expanding an already-complete model must remain a deterministic no-op."
);

const recursiveSnapshot = JSON.stringify(recursiveModel);
const unavailableFocus = ZoomSemantics.createZoomFocusModel(scene, recursiveModel, STRESS_DEPTH + 1);
assert.equal(unavailableFocus.focusStatus, ZoomSemantics.NOT_MATERIALIZED_STATUS);
assert.equal(unavailableFocus.focusedDepth, null);
assert.equal(unavailableFocus.materializationTriggered, false);
assert.equal(unavailableFocus.geometricZoomApplied, false);
assert.equal(unavailableFocus.cameraTransformApplied, false);
assert.equal(JSON.stringify(recursiveModel), recursiveSnapshot);

const zoomModel = ZoomSemantics.createZoomFocusModel(scene, recursiveModel, STRESS_DEPTH);
assert.equal(zoomModel.focusStatus, ZoomSemantics.FOCUSED_STATUS);
assert.equal(zoomModel.focusedDepth, STRESS_DEPTH);
assert.equal(zoomModel.materializationTriggered, false);
assert.deepEqual(zoomModel.formalMetricScaleExpression, {
  baseScale: scene.derived.metricScale,
  exponent: STRESS_DEPTH
});

const organizationModel = SheetBranchOrganization.createSheetBranchOrganizationModel(
  scene,
  recursiveModel,
  zoomModel
);
assert.equal(organizationModel.levelOrganizations.length, STRESS_DEPTH);
assert.equal(organizationModel.materializedDepth, STRESS_DEPTH);
assert.equal(organizationModel.focusedDepth, STRESS_DEPTH);
assert.equal(organizationModel.sheetDegreeSource, "scene.derived.sheetDegree");
assert.equal(organizationModel.sheetDegreePerStep, scene.derived.sheetDegree);
assert.equal(organizationModel.slotsEnumerated, false);
assert.equal(organizationModel.sheetsMaterialized, false);
assert.equal(organizationModel.coveringStructureClaimed, false);
assert.equal(organizationModel.geometryRendered, false);
assert.equal(organizationModel.materializationTriggered, false);
assert.equal(JSON.stringify(recursiveModel), recursiveSnapshot);

const overlayModel = ArithmeticOverlays.createArithmeticOverlayModel(
  scene,
  recursiveModel,
  zoomModel,
  organizationModel,
  [
    ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS,
    ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
  ]
);
assert.equal(overlayModel.status, ArithmeticOverlays.ACTIVE_STATUS);
assert.equal(overlayModel.materializedDepth, STRESS_DEPTH);
assert.equal(overlayModel.focusedDepth, STRESS_DEPTH);
assert.equal(overlayModel.recursionModified, false);
assert.equal(overlayModel.zoomModified, false);
assert.equal(overlayModel.sheetOrganizationModified, false);
assert.equal(overlayModel.materializationTriggered, false);
assert.equal(overlayModel.geometryRendered, false);
assert.equal(overlayModel.formalVerificationReopened, false);
assert.equal(JSON.stringify(recursiveModel), recursiveSnapshot);

assert.equal(scene.mathematics.baseHypersurface.definingFunction.symbol, "W");
assert.equal(scene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");
assert.equal(recursiveModel.geometryRendered, false);
assert.equal(recursiveModel.sheetsMaterialized, false);

const productionFiles = [
  "recursive-lazy-expansion.js",
  "zoom-semantics.js",
  "sheet-branch-organization.js",
  "arithmetic-overlays.js"
];
for (const fileName of productionFiles) {
  const source = fs.readFileSync(path.join(__dirname, fileName), "utf8");
  if (fileName === "recursive-lazy-expansion.js") {
    assert.equal(
      source.includes("**"),
      false,
      "recursive depth storage must remain symbolic and must not evaluate giant D^n expressions."
    );
  }
}

console.log("performance/infinite-navigation v0.10 deterministic verification: passed");
console.log(`stress depth materialized exactly: ${String(STRESS_DEPTH)}`);
console.log("one call -> at most one new structural level: passed");
console.log("zoom/sheet organization/arithmetic overlays remain non-materializing: passed");
console.log("Number safe-integer depth/focus representation guards: passed");
console.log("symbolic deep exponent storage and unresolved geometry guards: passed");
console.log("browser runtime/performance observation: not_tested");

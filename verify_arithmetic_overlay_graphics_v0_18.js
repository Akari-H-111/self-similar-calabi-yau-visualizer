"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const repositoryRoot = __dirname;

const SceneSpec = require("./scene-spec.js");
const BaseRenderer = require("./base-renderer.js");
const OneStepPullback = require("./one-step-pullback.js");
const RecursiveLazyExpansion = require("./recursive-lazy-expansion.js");
const ZoomSemantics = require("./zoom-semantics.js");
const SheetBranchOrganization = require("./sheet-branch-organization.js");
const InteractivePullbackTower = require("./interactive-pullback-tower.js");
const StructuralVisualization = require("./structural-visualization.js");
const StructuralCamera = require("./structural-camera.js");
const ArithmeticOverlays = require("./arithmetic-overlays.js");
const BranchOrganizationGraphics = require("./branch-organization-graphics.js");
const ArithmeticOverlayGraphics = require("./arithmetic-overlay-graphics.js");

const canonicalScene = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "data", "system.json"), "utf8"));
const graphicsSource = fs.readFileSync(path.join(repositoryRoot, "arithmetic-overlay-graphics.js"), "utf8");
const overlaySource = fs.readFileSync(path.join(repositoryRoot, "arithmetic-overlays.js"), "utf8");
const structuralSource = fs.readFileSync(path.join(repositoryRoot, "structural-visualization.js"), "utf8");
const cameraSource = fs.readFileSync(path.join(repositoryRoot, "structural-camera.js"), "utf8");
const branchSource = fs.readFileSync(path.join(repositoryRoot, "branch-organization-graphics.js"), "utf8");
const appSource = fs.readFileSync(path.join(repositoryRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repositoryRoot, "index.html"), "utf8");
const styleSource = fs.readFileSync(path.join(repositoryRoot, "style.css"), "utf8");
const workflowSource = fs.readFileSync(path.join(repositoryRoot, ".github", "workflows", "formal-verification.yml"), "utf8");

function cloneScene(scene = canonicalScene) {
  return JSON.parse(JSON.stringify(scene));
}

function createTextTarget() {
  return { hidden: true, dataset: {}, textContent: "" };
}

function createFixture({
  requestedDepth = 0,
  materializedDepth = 0,
  focusedDepth = 0,
  requestedOverlayIds = []
} = {}) {
  const rawScene = cloneScene();
  rawScene.request.requestedDepth = requestedDepth;

  const scene = SceneSpec.validateAndNormalizeScene(rawScene);
  const baseModel = BaseRenderer.renderBaseScene(scene, createTextTarget());
  const pullbackModel = OneStepPullback.renderOneStepPullback(scene, baseModel, createTextTarget());
  let recursiveModel = RecursiveLazyExpansion.createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel);

  while (recursiveModel.materializedDepth < materializedDepth) {
    recursiveModel = RecursiveLazyExpansion.expandOneLevel(recursiveModel);
  }

  const zoomModel = ZoomSemantics.createZoomFocusModel(scene, recursiveModel, focusedDepth);
  const organizationModel = SheetBranchOrganization.createSheetBranchOrganizationModel(scene, recursiveModel, zoomModel);
  const structuralModel = StructuralVisualization.createStructuralVisualizationModel(
    scene,
    baseModel,
    recursiveModel,
    zoomModel,
    organizationModel
  );
  const layout = StructuralVisualization.createStructuralLayoutDescriptor(structuralModel);
  const arithmeticOverlayModel = ArithmeticOverlays.createArithmeticOverlayModel(
    scene,
    recursiveModel,
    zoomModel,
    organizationModel,
    requestedOverlayIds
  );
  const graphicsModel = ArithmeticOverlayGraphics.createArithmeticOverlayGraphicsModel(
    arithmeticOverlayModel,
    layout
  );

  return {
    scene,
    baseModel,
    pullbackModel,
    recursiveModel,
    zoomModel,
    organizationModel,
    structuralModel,
    layout,
    arithmeticOverlayModel,
    graphicsModel
  };
}

function fingerprintRuntime(fixture) {
  return JSON.stringify({
    requestedDepth: fixture.recursiveModel.requestedDepth,
    materializedDepth: fixture.recursiveModel.materializedDepth,
    levels: fixture.recursiveModel.levels,
    requestedFocusDepth: fixture.zoomModel.requestedFocusDepth,
    focusedDepth: fixture.zoomModel.focusedDepth,
    organizationStatus: fixture.organizationModel.organizationStatus,
    sheetDegreePerStep: fixture.organizationModel.sheetDegreePerStep,
    levelOrganizations: fixture.organizationModel.levelOrganizations
  });
}

function rectanglesOverlap(left, right) {
  return !(
    left.x + left.width <= right.x ||
    right.x + right.width <= left.x ||
    left.y + left.height <= right.y ||
    right.y + right.height <= left.y
  );
}

function createFakeStructuralTarget() {
  let arithmeticProjectionPresent = false;
  const surface = {
    dataset: {},
    writeCount: 0,
    lastMarkup: "",
    querySelector(selector) {
      if (selector === '[data-arithmetic-overlay-graphics="true"]' && arithmeticProjectionPresent) {
        return {
          remove() {
            arithmeticProjectionPresent = false;
          }
        };
      }
      return null;
    },
    insertAdjacentHTML(position, markup) {
      assert.equal(position, "beforeend");
      arithmeticProjectionPresent = true;
      this.writeCount += 1;
      this.lastMarkup = markup;
    }
  };

  const target = {
    dataset: {},
    querySelector(selector) {
      if (selector === "svg.structural-visualization__surface") return surface;
      return null;
    }
  };

  return {
    target,
    surface,
    projectionCount() {
      return arithmeticProjectionPresent ? 1 : 0;
    }
  };
}

function graphicsFromInteraction(interactionModel, baseModel, requestedOverlayIds) {
  const structuralModel = StructuralVisualization.createStructuralVisualizationModel(
    interactionModel.runtimeScene,
    baseModel,
    interactionModel.recursiveModel,
    interactionModel.zoomModel,
    interactionModel.organizationModel,
    interactionModel
  );
  const layout = StructuralVisualization.createStructuralLayoutDescriptor(structuralModel);
  const overlayModel = ArithmeticOverlays.createArithmeticOverlayModel(
    interactionModel.runtimeScene,
    interactionModel.recursiveModel,
    interactionModel.zoomModel,
    interactionModel.organizationModel,
    requestedOverlayIds
  );
  const graphicsModel = ArithmeticOverlayGraphics.createArithmeticOverlayGraphicsModel(overlayModel, layout);
  return { structuralModel, layout, overlayModel, graphicsModel };
}

assert.equal(canonicalScene.version, "v0.12");
assert.equal(canonicalScene.request.requestedDepth, 0);
assert.equal(canonicalScene.mathematics.parameters.D, 2);
assert.equal(canonicalScene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

assert.equal(ArithmeticOverlayGraphics.MODEL_KIND, "arithmetic_overlay_graphics");
assert.equal(
  ArithmeticOverlayGraphics.REPRESENTATION_KIND,
  "source_backed_symbolic_arithmetic_annotations"
);
assert.equal(
  ArithmeticOverlayGraphics.SOURCE_CONTRACT,
  "arithmetic_overlays_model_output"
);
assert.deepEqual(
  [...ArithmeticOverlayGraphics.SUPPORTED_OVERLAY_IDS],
  [
    ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS,
    ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
  ],
  "Graphics admission must exactly match the implemented v0.09 overlay allow-list."
);

const implementedIds = createFixture().arithmeticOverlayModel.implementedOverlays.map((entry) => entry.overlayId);
assert.deepEqual([...ArithmeticOverlayGraphics.SUPPORTED_OVERLAY_IDS], implementedIds);

const combinations = [
  [],
  [ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS],
  [ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE],
  [
    ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS,
    ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
  ]
];

for (const requestedOverlayIds of combinations) {
  const fixture = createFixture({ requestedOverlayIds });
  assert.deepEqual(fixture.graphicsModel.enabledOverlayIds, requestedOverlayIds);
  assert.deepEqual(
    fixture.graphicsModel.annotations.map((annotation) => annotation.overlayId),
    requestedOverlayIds
  );
  assert.equal(fixture.graphicsModel.annotationCount, requestedOverlayIds.length);
  assert.equal(fixture.graphicsModel.overlayStateIsPresentationOnly, true);
  assert.equal(fixture.graphicsModel.recursionModified, false);
  assert.equal(fixture.graphicsModel.focusModified, false);
  assert.equal(fixture.graphicsModel.selectionModified, false);
  assert.equal(fixture.graphicsModel.collapseModified, false);
  assert.equal(fixture.graphicsModel.cameraModified, false);
  assert.equal(fixture.graphicsModel.branchOrganizationModified, false);
  assert.deepEqual(fixture.graphicsModel.truthfulness, {
    geometryRendered: false,
    sheetsMaterialized: false,
    coveringStructureClaimed: false,
    geometricZoomApplied: false,
    materializationTriggered: false
  });
}

const both = createFixture({
  requestedOverlayIds: [
    ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS,
    ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
  ]
});
const channelsAnnotation = both.graphicsModel.annotations.find(
  (annotation) => annotation.overlayId === ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS
);
const iterateAnnotation = both.graphicsModel.annotations.find(
  (annotation) => annotation.overlayId === ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
);

assert.ok(channelsAnnotation);
assert.equal(channelsAnnotation.overlayKind, "coordinate_channel_marker");
assert.equal(channelsAnnotation.semanticScope, "global_system_metadata");
assert.equal(channelsAnnotation.attachmentTarget.kind, "system_rule_panel_edge");
assert.equal(channelsAnnotation.attachmentTarget.structuralDepth, 0);
assert.equal(channelsAnnotation.evidence.evidenceClass, "source_backed_structural_representation");
assert.equal(channelsAnnotation.evidence.formalSupport, "formal_theorem");
assert.equal(
  channelsAnnotation.evidence.canonicalSource.artifact,
  "formal/SelfSimilarCY/CoordinatePower.lean"
);
assert.deepEqual(channelsAnnotation.payload.channelLabels, ["z_1", "z_2", "z_3", "z_4"]);
assert.equal(channelsAnnotation.payload.exponentParameter, "D");
assert.ok(channelsAnnotation.x >= both.layout.rulePanel.x + both.layout.rulePanel.width);
assert.ok(
  channelsAnnotation.x + channelsAnnotation.width <=
    both.layout.canonicalViewBox.x + both.layout.canonicalViewBox.width
);

assert.ok(iterateAnnotation);
assert.equal(iterateAnnotation.overlayKind, "coordinate_iterate_rule_marker");
assert.equal(iterateAnnotation.semanticScope, "focused_level_metadata");
assert.equal(iterateAnnotation.attachmentTarget.kind, "focused_structural_level");
assert.equal(iterateAnnotation.attachmentTarget.structuralDepth, 0);
assert.equal(iterateAnnotation.evidence.evidenceClass, "formal_theorem");
assert.equal(iterateAnnotation.evidence.theoremIdentity, "coordinatePower_iterate_apply");
assert.equal(
  iterateAnnotation.evidence.canonicalSource.artifact,
  "formal/SelfSimilarCY/CoordinatePowerIteration.lean"
);
assert.deepEqual(iterateAnnotation.payload.exponentExpression, {
  baseParameter: "D",
  towerDepth: 0
});

const bothMarkup = ArithmeticOverlayGraphics.buildGraphicsMarkup(both.graphicsModel);
for (const marker of [
  'data-arithmetic-overlay-id="coordinate_channels"',
  'data-arithmetic-overlay-id="coordinate_iterate_rule"',
  'data-evidence-class="source_backed_structural_representation"',
  'data-evidence-class="formal_theorem"',
  'data-source-artifact="formal/SelfSimilarCY/CoordinatePower.lean"',
  'data-source-artifact="formal/SelfSimilarCY/CoordinatePowerIteration.lean"',
  'data-geometry-rendered="false"',
  "Source-backed symbolic arithmetic annotations"
]) {
  assert.ok(bothMarkup.includes(marker), `Markup must expose ${marker}`);
}
assert.ok(bothMarkup.includes(">structural<"));
assert.ok(bothMarkup.includes(">Lean rule<"));

const deferredIds = [
  ArithmeticOverlays.OVERLAY_IDS.CYCLOTOMIC_REFINEMENT,
  ArithmeticOverlays.OVERLAY_IDS.TORSION_LABELS,
  ArithmeticOverlays.OVERLAY_IDS.COLLISION_CLASSES,
  ArithmeticOverlays.OVERLAY_IDS.DELTA_N_DIVISOR
];
for (const overlayId of deferredIds) {
  assert.equal(ArithmeticOverlayGraphics.SUPPORTED_OVERLAY_IDS.includes(overlayId), false);
  const deferred = createFixture({ requestedOverlayIds: [overlayId] });
  assert.deepEqual(deferred.arithmeticOverlayModel.enabledOverlays, []);
  assert.equal(deferred.arithmeticOverlayModel.requestResults[0].requestStatus, ArithmeticOverlays.UNAVAILABLE_STATUS);
  assert.equal(deferred.graphicsModel.annotationCount, 0);
  assert.equal(ArithmeticOverlayGraphics.buildGraphicsMarkup(deferred.graphicsModel).includes(`data-arithmetic-overlay-id="${overlayId}"`), false);
}

const runtimeBefore = fingerprintRuntime(both);
const runtimeSnapshot = JSON.stringify({
  recursive: both.recursiveModel,
  zoom: both.zoomModel,
  organization: both.organizationModel
});
const graphicsRepeat = ArithmeticOverlayGraphics.createArithmeticOverlayGraphicsModel(
  both.arithmeticOverlayModel,
  both.layout
);
assert.equal(fingerprintRuntime(both), runtimeBefore);
assert.equal(
  JSON.stringify({
    recursive: both.recursiveModel,
    zoom: both.zoomModel,
    organization: both.organizationModel
  }),
  runtimeSnapshot
);
assert.deepEqual(graphicsRepeat, both.graphicsModel);
assert.equal(
  ArithmeticOverlayGraphics.buildGraphicsMarkup(graphicsRepeat),
  bothMarkup,
  "Same runtime input + enabled set + layout must produce identical arithmetic graphics markup."
);

let camera = StructuralCamera.createStructuralCameraModel({
  canonicalViewBox: both.layout.canonicalViewBox,
  contentBounds: both.layout.contentBounds
});
const overlayPayloadBeforeCamera = JSON.stringify(both.arithmeticOverlayModel);
const graphicsBeforeCamera = JSON.stringify(both.graphicsModel);
camera = StructuralCamera.zoomCamera(camera, 1.5);
camera = StructuralCamera.panCamera(camera, 17, 23);
assert.equal(JSON.stringify(both.arithmeticOverlayModel), overlayPayloadBeforeCamera);
assert.equal(JSON.stringify(both.graphicsModel), graphicsBeforeCamera);
assert.equal(camera.truthfulness.geometricZoomApplied, false);
assert.equal(camera.truthfulness.sheetsMaterialized, false);
assert.equal(camera.truthfulness.coveringStructureClaimed, false);

const branchGraphics = BranchOrganizationGraphics.createBranchOrganizationGraphicsModel(
  both.organizationModel,
  both.layout.levelBounds
);
for (const annotation of both.graphicsModel.annotations) {
  for (const badge of branchGraphics.badges) {
    assert.equal(
      rectanglesOverlap(annotation, badge),
      false,
      `Arithmetic annotation ${annotation.overlayId} must not overlap D4 branch badge at depth ${String(badge.targetDepth)}.`
    );
  }
}
assert.equal(
  ArithmeticOverlayGraphics.buildGraphicsMarkup(both.graphicsModel).includes("data-branch-organization-graphics"),
  false
);
assert.equal(
  BranchOrganizationGraphics.buildBadgeMarkup(branchGraphics).includes("data-arithmetic-overlay-graphics"),
  false
);

const deeper = createFixture({
  requestedDepth: 3,
  materializedDepth: 3,
  focusedDepth: 2,
  requestedOverlayIds: [
    ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS,
    ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
  ]
});
const deeperIterate = deeper.graphicsModel.annotations.find(
  (annotation) => annotation.overlayId === ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
);
assert.equal(deeperIterate.attachmentTarget.structuralDepth, 2);
assert.deepEqual(deeperIterate.payload.exponentExpression, { baseParameter: "D", towerDepth: 2 });
const focusedBounds = deeper.layout.levelBounds.find((level) => level.depth === 2);
assert.ok(focusedBounds);
assert.ok(deeperIterate.y >= focusedBounds.y);
assert.ok(deeperIterate.y + deeperIterate.height <= focusedBounds.y + focusedBounds.height);

const fakeTarget = createFakeStructuralTarget();
ArithmeticOverlayGraphics.renderArithmeticOverlayGraphics(both.graphicsModel, fakeTarget.target);
assert.equal(fakeTarget.projectionCount(), 1);
assert.equal(fakeTarget.surface.writeCount, 1);
assert.equal(fakeTarget.target.dataset.arithmeticOverlayGraphicsState, "active");
assert.equal(fakeTarget.target.dataset.arithmeticOverlayGraphicsAnnotationCount, "2");
const firstRenderedMarkup = fakeTarget.surface.lastMarkup;
ArithmeticOverlayGraphics.renderArithmeticOverlayGraphics(both.graphicsModel, fakeTarget.target);
assert.equal(fakeTarget.projectionCount(), 1, "Repeated render must replace the arithmetic graphics group instead of accumulating duplicates.");
assert.equal(fakeTarget.surface.writeCount, 2);
assert.equal(fakeTarget.surface.lastMarkup, firstRenderedMarkup);

const replacementTarget = createFakeStructuralTarget();
ArithmeticOverlayGraphics.renderArithmeticOverlayGraphics(both.graphicsModel, replacementTarget.target);
assert.equal(replacementTarget.projectionCount(), 1, "A replacement structural SVG can receive a fresh projection deterministically.");
assert.equal(replacementTarget.surface.lastMarkup, firstRenderedMarkup);

const initialScene = SceneSpec.validateAndNormalizeScene(canonicalScene);
const initialBase = BaseRenderer.renderBaseScene(initialScene, createTextTarget());
const initialPullback = OneStepPullback.renderOneStepPullback(initialScene, initialBase, createTextTarget());
let interaction = InteractivePullbackTower.createInteractivePullbackTowerModel(
  initialScene,
  initialBase,
  initialPullback
);
const persistentOverlayRequest = [
  ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS,
  ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
];

let projected = graphicsFromInteraction(interaction, initialBase, persistentOverlayRequest);
assert.deepEqual(projected.graphicsModel.enabledOverlayIds, persistentOverlayRequest);

interaction = InteractivePullbackTower.expandOrReveal(interaction);
projected = graphicsFromInteraction(interaction, initialBase, persistentOverlayRequest);
assert.deepEqual(projected.graphicsModel.enabledOverlayIds, persistentOverlayRequest);

interaction = InteractivePullbackTower.selectDepth(interaction, 1);
interaction = InteractivePullbackTower.refocusDepth(interaction, 1);
projected = graphicsFromInteraction(interaction, initialBase, persistentOverlayRequest);
assert.equal(
  projected.graphicsModel.annotations.find(
    (annotation) => annotation.overlayId === ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
  ).attachmentTarget.structuralDepth,
  1
);

interaction = InteractivePullbackTower.expandOrReveal(interaction);
interaction = InteractivePullbackTower.collapseSelected(interaction);
projected = graphicsFromInteraction(interaction, initialBase, persistentOverlayRequest);
assert.deepEqual(projected.graphicsModel.enabledOverlayIds, persistentOverlayRequest);
assert.equal(interaction.materializedDepth, 2);
assert.equal(interaction.presentation.visibleDepth, 1);

assert.equal(graphicsSource.includes("parameters.D"), false);
assert.equal(graphicsSource.includes("Math.pow"), false);
assert.equal(graphicsSource.includes("** 2"), false);
assert.equal(graphicsSource.includes("** 4"), false);
assert.equal(graphicsSource.includes("expandOneLevel"), false);
assert.equal(graphicsSource.includes("createRecursiveLazyExpansionModel"), false);
assert.equal(graphicsSource.includes("zoomCamera("), false);
assert.equal(graphicsSource.includes("panCamera("), false);
assert.equal(graphicsSource.includes("MutationObserver"), false, "v0.18 arithmetic projection must not create an observer recursion surface.");
assert.equal(graphicsSource.includes("requestAnimationFrame"), false);
assert.equal(graphicsSource.includes("setInterval"), false);
assert.equal(graphicsSource.includes("setTimeout"), false);
assert.equal(graphicsSource.includes("canvas.getContext"), false);
assert.equal(graphicsSource.includes("WebGL"), false);
assert.equal(graphicsSource.includes("THREE"), false);
assert.equal(graphicsSource.includes("mesh"), false);
assert.equal(graphicsSource.includes("fiberGeometry"), false);
assert.equal(graphicsSource.includes("sheetObjects"), false);
assert.equal(graphicsSource.includes("branchObjects"), false);

assert.equal(overlaySource.includes("ArithmeticOverlayGraphics"), false, "Sealed arithmetic semantics must remain graphics-agnostic.");
assert.equal(structuralSource.includes("ArithmeticOverlayGraphics"), false, "Sealed structural visualization must remain arithmetic-graphics agnostic.");
assert.equal(cameraSource.includes("ArithmeticOverlayGraphics"), false, "Sealed camera must remain arithmetic-graphics agnostic.");
assert.equal(branchSource.includes("ArithmeticOverlayGraphics"), false, "Sealed D4 branch graphics must remain arithmetic-graphics agnostic.");

assert.ok(appSource.includes("let arithmeticOverlayPresentationState = initialArithmeticOverlayRequest"));
assert.ok(appSource.includes("setArithmeticOverlayPresentation"));
assert.ok(appSource.includes("ArithmeticOverlayGraphics.projectArithmeticOverlayGraphics("));
assert.ok(appSource.includes('arithmeticOverlayControlsElement.addEventListener("change", handleArithmeticOverlayToggle)'));
assert.equal(appSource.includes("expandOneLevel("), false);
assert.equal(appSource.includes("scene.request.requestedDepth ="), false);
assert.equal(appSource.includes("D ** 2"), false);
assert.equal(appSource.includes("D ** 4"), false);
assert.equal(appSource.includes("Math.pow"), false);

const structuralScript = '<script src="structural-visualization.js" defer></script>';
const arithmeticSemanticsScript = '<script src="arithmetic-overlays.js" defer></script>';
const arithmeticGraphicsScript = '<script src="arithmetic-overlay-graphics.js" defer></script>';
const appScript = '<script src="app.js" defer></script>';
assert.ok(indexSource.includes(arithmeticGraphicsScript));
assert.ok(indexSource.indexOf(arithmeticGraphicsScript) > indexSource.indexOf(structuralScript));
assert.ok(indexSource.indexOf(arithmeticGraphicsScript) > indexSource.indexOf(arithmeticSemanticsScript));
assert.ok(indexSource.indexOf(arithmeticGraphicsScript) < indexSource.indexOf(appScript));
assert.ok(indexSource.includes('id="arithmetic-overlay-controls"'));
assert.ok(indexSource.includes('type="checkbox" data-arithmetic-overlay-id="coordinate_channels"'));
assert.ok(indexSource.includes('type="checkbox" data-arithmetic-overlay-id="coordinate_iterate_rule"'));
assert.ok(indexSource.includes("Source-backed structural representation"));
assert.ok(indexSource.includes("Lean formalized symbolic rule"));
assert.ok(indexSource.includes("not geometric arithmetic loci"));

assert.ok(styleSource.includes(".arithmetic-overlay-controls"));
assert.ok(styleSource.includes(".arithmetic-overlay-annotation"));
assert.ok(styleSource.includes(".arithmetic-overlay-annotation__status"));
assert.ok(styleSource.includes(".arithmetic-overlay-controls input:focus-visible"));

assert.ok(workflowSource.includes("node verify_arithmetic_overlay_graphics_v0_18.js"));
assert.ok(workflowSource.includes("node --check arithmetic-overlay-graphics.js"));
assert.ok(workflowSource.includes("node --check verify_arithmetic_overlay_graphics_v0_18.js"));
assert.ok(workflowSource.includes("arithmetic-overlay-graphics.js"));

assert.equal(canonicalScene.request.requestedDepth, 0);
assert.equal(canonicalScene.mathematics.parameters.D, 2);
assert.equal(canonicalScene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

console.log("arithmetic overlay graphics v0.18 verification: passed");
console.log("supported graphical overlays: coordinate_channels + coordinate_iterate_rule");
console.log("independent toggle matrix: 00 / 10 / 01 / 11 passed");
console.log("evidence/provenance: visible and machine-readable");
console.log("runtime/camera/branch isolation: passed");
console.log("rerender replacement and duplicate-accumulation guard: passed");
console.log("deferred cyclotomic/torsion/collision/divisor claims: remain unavailable");
console.log("geometry/sheets/covering/geometric zoom: remain false");

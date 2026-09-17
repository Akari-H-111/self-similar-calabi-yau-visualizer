"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const repositoryRoot = __dirname;

const { SceneSpecError, validateAndNormalizeScene } = require("./scene-spec.js");
const { renderBaseScene } = require("./base-renderer.js");
const { renderOneStepPullback } = require("./one-step-pullback.js");
const {
  createRecursiveLazyExpansionModel,
  expandOneLevel
} = require("./recursive-lazy-expansion.js");
const { createZoomFocusModel } = require("./zoom-semantics.js");
const { createSheetBranchOrganizationModel } = require("./sheet-branch-organization.js");
require("./interactive-pullback-tower.js");
const {
  createStructuralVisualizationModel,
  createStructuralLayoutDescriptor
} = require("./structural-visualization.js");
const {
  createStructuralCameraModel,
  zoomCamera,
  panCamera,
  reconcileCameraExtent
} = require("./structural-camera.js");
const {
  MODEL_KIND,
  REPRESENTATION_KIND,
  BADGE_KIND,
  SOURCE_CONTRACT,
  createBranchOrganizationGraphicsModel,
  buildBadgeMarkup,
  snapshotFromRenderedOrganization
} = require("./branch-organization-graphics.js");

const canonicalScene = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "data", "system.json"), "utf8"));
const branchSource = fs.readFileSync(path.join(repositoryRoot, "branch-organization-graphics.js"), "utf8");
const organizationSource = fs.readFileSync(path.join(repositoryRoot, "sheet-branch-organization.js"), "utf8");
const structuralSource = fs.readFileSync(path.join(repositoryRoot, "structural-visualization.js"), "utf8");
const cameraSource = fs.readFileSync(path.join(repositoryRoot, "structural-camera.js"), "utf8");
const interactionSource = fs.readFileSync(path.join(repositoryRoot, "interactive-pullback-tower.js"), "utf8");
const appSource = fs.readFileSync(path.join(repositoryRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repositoryRoot, "index.html"), "utf8");
const workflowSource = fs.readFileSync(path.join(repositoryRoot, ".github", "workflows", "formal-verification.yml"), "utf8");

function cloneScene(scene = canonicalScene) {
  return JSON.parse(JSON.stringify(scene));
}

function createTarget() {
  return { hidden: true, dataset: {}, textContent: "" };
}

function materializeFixture(D, depth) {
  const rawScene = cloneScene();
  rawScene.mathematics.parameters.D = D;
  rawScene.request.requestedDepth = depth;

  const scene = validateAndNormalizeScene(rawScene);
  const baseModel = renderBaseScene(scene, createTarget());
  const pullbackModel = renderOneStepPullback(scene, baseModel, createTarget());
  let recursiveModel = createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel);
  while (recursiveModel.materializedDepth < depth) {
    recursiveModel = expandOneLevel(recursiveModel);
  }
  const zoomModel = createZoomFocusModel(scene, recursiveModel, Math.min(depth, recursiveModel.materializedDepth));
  const organizationModel = createSheetBranchOrganizationModel(scene, recursiveModel, zoomModel);
  const structuralModel = createStructuralVisualizationModel(
    scene,
    baseModel,
    recursiveModel,
    zoomModel,
    organizationModel
  );
  const layout = createStructuralLayoutDescriptor(structuralModel);
  const graphicsModel = createBranchOrganizationGraphicsModel(organizationModel, layout.levelBounds);

  return {
    scene,
    baseModel,
    pullbackModel,
    recursiveModel,
    zoomModel,
    organizationModel,
    structuralModel,
    layout,
    graphicsModel
  };
}

function fingerprintRuntime(fixture) {
  return JSON.stringify({
    requestedDepth: fixture.recursiveModel.requestedDepth,
    materializedDepth: fixture.recursiveModel.materializedDepth,
    focusedDepth: fixture.zoomModel.focusedDepth,
    sheetDegreePerStep: fixture.organizationModel.sheetDegreePerStep,
    levelOrganizations: fixture.organizationModel.levelOrganizations.map((level) => ({
      depth: level.depth,
      sourceDepth: level.sourceDepth,
      nominalMultiplicity: level.nominalMultiplicity,
      aggregateOnly: level.aggregateOnly,
      slotsEnumerated: level.slotsEnumerated
    }))
  });
}

const d2 = materializeFixture(2, 1);
assert.equal(d2.scene.derived.sheetDegree, 16);
assert.equal(d2.organizationModel.sheetDegreePerStep, 16);
assert.equal(d2.graphicsModel.kind, MODEL_KIND);
assert.equal(d2.graphicsModel.representationKind, REPRESENTATION_KIND);
assert.equal(d2.graphicsModel.sourceContract, SOURCE_CONTRACT);
assert.equal(d2.graphicsModel.sheetDegreeSource, "scene.derived.sheetDegree");
assert.equal(d2.graphicsModel.sheetDegreePerStep, 16);
assert.equal(d2.graphicsModel.badgeCount, 1);
assert.equal(d2.graphicsModel.badges[0].kind, BADGE_KIND);
assert.equal(d2.graphicsModel.badges[0].multiplicity, 16);
assert.equal(d2.graphicsModel.badges[0].sourceDepth, 0);
assert.equal(d2.graphicsModel.badges[0].targetDepth, 1);
assert.equal(d2.graphicsModel.badges[0].aggregateOnly, true);
assert.equal(d2.graphicsModel.badges[0].slotsEnumerated, false);

const d2Markup = buildBadgeMarkup(d2.graphicsModel);
assert.ok(d2Markup.includes("D⁴ org"));
assert.ok(d2Markup.includes("×16"));
assert.ok(d2Markup.includes("aggregate_structural_branch_badges"));
assert.equal((d2Markup.match(/data-branch-depth=/g) ?? []).length, 1, "D=2 must use one aggregate badge, not sixteen fake objects.");

const d3 = materializeFixture(3, 2);
assert.equal(d3.scene.derived.sheetDegree, 81);
assert.equal(d3.graphicsModel.sheetDegreePerStep, 81);
assert.equal(d3.graphicsModel.badgeCount, 2);
assert.ok(buildBadgeMarkup(d3.graphicsModel).includes("×81"));

const d64 = materializeFixture(64, 1);
assert.equal(d64.scene.derived.sheetDegree, 16777216);
assert.equal(d64.graphicsModel.sheetDegreePerStep, 16777216);
assert.equal(d64.graphicsModel.badgeCount, 1);
assert.ok(buildBadgeMarkup(d64.graphicsModel).includes("×16777216"));
assert.ok(d64.graphicsModel.badgeCount < d64.graphicsModel.sheetDegreePerStep);

const d1Raw = cloneScene();
d1Raw.mathematics.parameters.D = 1;
assert.throws(
  () => validateAndNormalizeScene(d1Raw),
  (error) => error instanceof SceneSpecError && error.message.includes("safe integer >= 2")
);

for (const fixture of [d2, d3, d64]) {
  assert.equal(fixture.graphicsModel.truthfulness.geometryRendered, false);
  assert.equal(fixture.graphicsModel.truthfulness.sheetsMaterialized, false);
  assert.equal(fixture.graphicsModel.truthfulness.coveringStructureClaimed, false);
  assert.equal(fixture.graphicsModel.truthfulness.geometricZoomApplied, false);
  for (const badge of fixture.graphicsModel.badges) {
    assert.equal(badge.geometryRendered, false);
    assert.equal(badge.sheetsMaterialized, false);
    assert.equal(badge.coveringStructureClaimed, false);
  }
}

assert.ok(branchSource.includes("scene.derived.sheetDegree"));
assert.equal(branchSource.includes("parameters.D"), false);
assert.equal(branchSource.includes("** 4"), false);
assert.equal(branchSource.includes("Math.pow"), false);
assert.equal(branchSource.includes("expandOneLevel"), false);
assert.equal(branchSource.includes("createRecursiveLazyExpansionModel"), false);
assert.equal(branchSource.includes("zoomCamera("), false);
assert.equal(branchSource.includes("panCamera("), false);
assert.ok(branchSource.includes("sheetDegreePerStep"));
assert.ok(branchSource.includes("sheetDegreeSource"));

assert.ok(organizationSource.includes('sheetDegreeSource: "scene.derived.sheetDegree"'));
assert.ok(organizationSource.includes("aggregateOnly: true"));
assert.ok(organizationSource.includes("slotsEnumerated: false"));
assert.equal(organizationSource.includes("parameters.D"), false);

const deep = materializeFixture(2, 4);
assert.equal(deep.graphicsModel.sheetDegreePerStep, 16);
assert.equal(deep.graphicsModel.badgeCount, 4);
assert.equal((buildBadgeMarkup(deep.graphicsModel).match(/data-branch-depth=/g) ?? []).length, 4);
assert.equal(deep.graphicsModel.domEncoding.aggregateBadgePerVisibleTransition, true);
assert.equal(deep.graphicsModel.domEncoding.slotsEnumerated, false);
assert.equal(deep.graphicsModel.domEncoding.badgeCountDependsOnMultiplicity, false);

const beforeRuntime = fingerprintRuntime(deep);
let camera = createStructuralCameraModel({
  canonicalViewBox: deep.layout.canonicalViewBox,
  contentBounds: deep.layout.contentBounds
});
camera = zoomCamera(camera, 1.5);
camera = panCamera(camera, 12, 20);
camera = reconcileCameraExtent(camera, deep.layout.canonicalViewBox, deep.layout.contentBounds);
assert.equal(fingerprintRuntime(deep), beforeRuntime);
assert.equal(deep.graphicsModel.sheetDegreePerStep, 16);
assert.equal(camera.truthfulness.geometricZoomApplied, false);
assert.equal(camera.truthfulness.sheetsMaterialized, false);
assert.equal(camera.truthfulness.coveringStructureClaimed, false);

const interactiveScene = validateAndNormalizeScene(canonicalScene);
const interactiveBase = renderBaseScene(interactiveScene, createTarget());
const interactivePullback = renderOneStepPullback(interactiveScene, interactiveBase, createTarget());
let interaction = globalThis.InteractivePullbackTower.createInteractivePullbackTowerModel(
  interactiveScene,
  interactiveBase,
  interactivePullback
);
interaction = globalThis.InteractivePullbackTower.expandOrReveal(interaction);
interaction = globalThis.InteractivePullbackTower.expandOrReveal(interaction);
interaction = globalThis.InteractivePullbackTower.selectDepth(interaction, 0);
interaction = globalThis.InteractivePullbackTower.refocusDepth(interaction, 0);
const multiplicityBeforeCollapse = interaction.organizationModel.sheetDegreePerStep;
const levelCountBeforeCollapse = interaction.organizationModel.levelOrganizations.length;
interaction = globalThis.InteractivePullbackTower.collapseSelected(interaction);
assert.equal(interaction.organizationModel.sheetDegreePerStep, multiplicityBeforeCollapse);
assert.equal(interaction.organizationModel.levelOrganizations.length, levelCountBeforeCollapse);
assert.equal(interaction.presentation.visibleDepth, 0);

const collapsedStructural = createStructuralVisualizationModel(
  interactiveScene,
  interactiveBase,
  interaction.recursiveModel,
  interaction.zoomModel,
  interaction.organizationModel,
  interaction
);
const collapsedLayout = createStructuralLayoutDescriptor(collapsedStructural);
const collapsedGraphics = createBranchOrganizationGraphicsModel(
  interaction.organizationModel,
  collapsedLayout.levelBounds
);
assert.equal(collapsedGraphics.badgeCount, 0);
assert.equal(collapsedGraphics.sheetDegreePerStep, 16);
assert.equal(interaction.materializedDepth, 2);

const d3Repeat = materializeFixture(3, 2);
assert.deepEqual(d3Repeat.graphicsModel, d3.graphicsModel);
assert.equal(buildBadgeMarkup(d3Repeat.graphicsModel), buildBadgeMarkup(d3.graphicsModel));

const renderedSnapshot = snapshotFromRenderedOrganization({
  dataset: {
    sheetDegreeSource: "scene.derived.sheetDegree",
    sheetDegreePerStep: "16",
    materializedDepth: "2",
    sheetsMaterialized: "false",
    coveringStructureClaimed: "false",
    geometryRendered: "false"
  }
});
assert.equal(renderedSnapshot.sheetDegreePerStep, 16);
assert.equal(renderedSnapshot.materializedDepth, 2);
assert.equal(renderedSnapshot.sheetsMaterialized, false);
assert.throws(
  () => snapshotFromRenderedOrganization({
    dataset: {
      sheetDegreeSource: "scene.derived.sheetDegree",
      sheetDegreePerStep: "16",
      materializedDepth: "2",
      sheetsMaterialized: "true",
      coveringStructureClaimed: "false",
      geometryRendered: "false"
    }
  }),
  TypeError
);

assert.equal(branchSource.includes("covering map"), false);
assert.equal(branchSource.includes("map-degree theorem"), false);
assert.equal(branchSource.includes("fiberGeometry"), false);
assert.equal(branchSource.includes("THREE"), false);
assert.equal(branchSource.includes("WebGL"), false);
assert.equal(branchSource.includes("<canvas"), false);
assert.equal(structuralSource.includes("BranchOrganizationGraphics"), false, "Sealed structural visualization must not import the new branch presentation layer.");
assert.equal(cameraSource.includes("BranchOrganizationGraphics"), false, "Camera engine must remain branch-graphics agnostic.");
assert.equal(interactionSource.includes("BranchOrganizationGraphics"), false, "Interaction engine must remain branch-graphics agnostic.");

const branchScript = '<script src="branch-organization-graphics.js" defer></script>';
const structuralScript = '<script src="structural-visualization.js" defer></script>';
const cameraScript = '<script src="structural-camera.js" defer></script>';
const appScript = '<script src="app.js" defer></script>';
assert.ok(indexSource.includes(branchScript));
assert.ok(indexSource.indexOf(branchScript) > indexSource.indexOf(structuralScript));
assert.ok(indexSource.indexOf(branchScript) < indexSource.indexOf(cameraScript));
assert.ok(indexSource.indexOf(branchScript) < indexSource.indexOf(appScript));
assert.ok(indexSource.includes("D⁴ Branch Organization Graphics"));
assert.ok(indexSource.includes("aggregated multiplicity badges"));
assert.ok(indexSource.includes("16-fold structural organization"));

assert.ok(workflowSource.includes("node verify_branch_organization_graphics_v0_17.js"));
assert.ok(workflowSource.includes("node --check branch-organization-graphics.js"));
assert.ok(workflowSource.includes("node --check verify_branch_organization_graphics_v0_17.js"));
assert.ok(workflowSource.includes("branch-organization-graphics.js"));

assert.ok(appSource.includes("SheetBranchOrganization.renderSheetBranchOrganization(organizationModel, sheetBranchElement)"));
assert.ok(appSource.includes("StructuralVisualization.renderStructuralVisualization(structuralVisualizationModel, structuralVisualizationElement)"));
assert.equal(appSource.includes("BranchOrganizationGraphics"), false, "Thread 16 uses a separate presentation observer instead of coupling app state to branch graphics.");

assert.equal(canonicalScene.request.requestedDepth, 0);
assert.equal(canonicalScene.mathematics.parameters.D, 2);
assert.equal(d2.scene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

console.log("D^4 branch organization graphics v0.17 verification: passed");
console.log("D=2: exact 16-fold structural organization is encoded as one aggregate badge per visible transition");
console.log("D=3 and D=64: exact runtime multiplicity preserved without D^4 DOM enumeration");
console.log("D=1: rejected by the existing D>=2 schema boundary; no mathematical impossibility claim");
console.log("geometry/sheets/covering/geometric zoom: remain false");
console.log("camera, recursion, focus, and branch presentation domains: isolated");

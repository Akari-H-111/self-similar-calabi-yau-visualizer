"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const SceneSpec = require("./scene-spec.js");
const BaseRenderer = require("./base-renderer.js");
const OneStepPullback = require("./one-step-pullback.js");
require("./recursive-lazy-expansion.js");
require("./zoom-semantics.js");
require("./sheet-branch-organization.js");
const InteractivePullbackTower = require("./interactive-pullback-tower.js");
const InfiniteNavigationRenderer = require("./infinite-navigation-renderer.js");
const canonicalScene = require("./data/system.json");

const root = __dirname;
function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}
function gitBlobSha(source) {
  const body = Buffer.from(source, "utf8");
  return crypto.createHash("sha1").update("blob " + String(body.length) + "\0").update(body).digest("hex");
}

assert.equal(canonicalScene.request.requestedDepth, 0);
assert.equal(canonicalScene.mathematics.parameters.D, 2);
assert.equal(canonicalScene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

const sealed = {
  "scene-spec.js": "20471ef6fab0a685faee956f07a35d82e9a95ba5",
  "base-renderer.js": "fea92139c2a8514f01b9bb187f27bf0131dd4114",
  "one-step-pullback.js": "5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js": "0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js": "9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js": "cecf0f06aa23404a65a6093f705a4fe56be65029",
  "arithmetic-overlays.js": "bfc7331e07b8e12d4b14790ae5a4bc096042544c",
  "interactive-pullback-tower.js": "657262aab1db8e49e903e3e83d4a033586e2f8bd",
  "structural-camera.js": "c3934ba920be79905d631ee8a886b59527b6b65c",
  "structural-visualization.js": "ce0cfdde97d9a78b4535f4cdfcc9a73961990ab6",
  "branch-organization-graphics.js": "e5b2c31bb01a2e5cc2bf84005a7be09821b03da4",
  "arithmetic-overlay-graphics.js": "ba949f1bbf79675d1ae31998671a2719ad3a2d04",
  "exposition-layer.js": "ce6210842cf653db56f67d0a7b682be893258f8a"
};
for (const [relativePath, sha] of Object.entries(sealed)) {
  assert.equal(gitBlobSha(read(relativePath)), sha, relativePath + " must remain byte-identical in Thread 19R.");
}

const appSource = read("app.js");
assert.match(appSource, /const CAMERA_FOCUS_FALLBACK_ACTIONS = Object\.freeze/);
assert.match(appSource, /function restoreCameraControlFocus\(action\)/);
assert.ok(appSource.includes('`[data-camera-action="${String(action)}"]`'));
assert.match(appSource, /restoreCameraControlFocus\(action\)/);
assert.match(appSource, /"zoom-in",\s*"zoom-out",\s*"fit-visible",\s*"fit-selected",\s*"fit-focused"/s);
assert.doesNotMatch(appSource, /camera.*(?:children|childNodes|nth-child)/i, "Camera focus restoration must not depend on DOM index.");
assert.equal(appSource.includes("expandOneLevel("), false);

const rendererSource = read("infinite-navigation-renderer.js");
assert.match(
  rendererSource,
  /const canCollapse = \(\s*!interactionModel\.presentation\.collapsed\s*&&\s*interactionModel\.selectedDepth >= interactionModel\.focusedDepth\s*&&\s*interactionModel\.selectedDepth < interactionModel\.materializedDepth\s*\);/s
);

const scene = SceneSpec.validateAndNormalizeScene(canonicalScene);
const base = BaseRenderer.createBaseRenderModel(scene);
const oneStep = OneStepPullback.createOneStepPullbackModel(scene, base);
let interaction = InteractivePullbackTower.createInteractivePullbackTowerModel(scene, base, oneStep);
for (let index = 0; index < 24; index += 1) {
  interaction = InteractivePullbackTower.expandOrReveal(interaction);
}
interaction = InteractivePullbackTower.selectDepth(interaction, 20);
interaction = InteractivePullbackTower.refocusDepth(interaction, 20);
const retainedSemanticLevelCountBeforeCollapse = interaction.recursiveModel.levels.length;

let rendererState = InfiniteNavigationRenderer.createInfiniteNavigationRendererState(
  interaction,
  null,
  {anchorDepth: 20}
);
let target = {dataset: {}, hidden: true, innerHTML: ""};
InfiniteNavigationRenderer.renderVirtualizedInteractionPresentation(interaction, rendererState, target);
assert.match(
  target.innerHTML,
  /data-interaction-action="collapse-selected"(?! disabled)/,
  "Collapse must be enabled while descendants are visible."
);

interaction = InteractivePullbackTower.collapseSelected(interaction);
rendererState = InfiniteNavigationRenderer.createInfiniteNavigationRendererState(
  interaction,
  rendererState,
  {anchorDepth: interaction.selectedDepth}
);
target = {dataset: {}, hidden: true, innerHTML: ""};
InfiniteNavigationRenderer.renderVirtualizedInteractionPresentation(interaction, rendererState, target);
assert.match(
  target.innerHTML,
  /data-interaction-action="collapse-selected" disabled/,
  "Collapse must become disabled after descendants are already hidden."
);
assert.match(target.innerHTML, />Reveal collapsed levels<\/button>/);
assert.equal(interaction.presentation.collapsed, true);
assert.equal(interaction.presentation.visibleDepth, 20);
assert.equal(interaction.materializedDepth, 24);
assert.equal(
  interaction.recursiveModel.levels.length,
  retainedSemanticLevelCountBeforeCollapse,
  "Presentation collapse must not delete retained semantic levels."
);

for (const truth of [
  'geometryRendered = false',
  'sheetsMaterialized = false',
  'coveringStructureClaimed = false',
  'geometricZoomApplied = false',
  'W = unresolved'
]) {
  assert.ok(read("docs/HUMAN_INTERACTION_REMEDIATION_self_similar_cy_visualizer_v0_20_1.md").includes(truth));
}

const workflow = read(".github/workflows/formal-verification.yml");
assert.ok(workflow.includes("node verify_human_interaction_remediation_v0_20_1.js"));
assert.ok(workflow.includes("node --check verify_human_interaction_remediation_v0_20_1.js"));

console.log("Human interaction remediation v0.20.1 verifier: passed");
console.log("HIA-01 camera focus restoration: named-action contract present");
console.log("HIA-02 repeated collapse: disabled after collapsed presentation");
console.log("sealed semantic/camera/formal modules modified: NO");
console.log("HIA-03 duplicated virtual-gap AX text: intentionally unchanged pending real screen-reader evidence");

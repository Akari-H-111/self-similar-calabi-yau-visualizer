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

const repositoryRoot = __dirname;

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function gitBlobSha(source) {
  const body = Buffer.from(source, "utf8");
  return crypto.createHash("sha1").update("blob " + String(body.length) + "\0").update(body).digest("hex");
}

assert.equal(canonicalScene.request.requestedDepth, 0);
assert.equal(canonicalScene.mathematics.parameters.D, 2);
assert.equal(canonicalScene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

const sealedBlobs = {
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

for (const [relativePath, expectedSha] of Object.entries(sealedBlobs)) {
  assert.equal(gitBlobSha(read(relativePath)), expectedSha, relativePath + " must remain byte-identical across the v0.20 presentation audit.");
}

const scene = SceneSpec.validateAndNormalizeScene(canonicalScene);
const baseModel = BaseRenderer.createBaseRenderModel(scene);
const oneStepModel = OneStepPullback.createOneStepPullbackModel(scene, baseModel);
let interactionModel = InteractivePullbackTower.createInteractivePullbackTowerModel(scene, baseModel, oneStepModel);
for (let index = 0; index < 32; index += 1) {
  interactionModel = InteractivePullbackTower.expandOrReveal(interactionModel);
}
interactionModel = InteractivePullbackTower.selectDepth(interactionModel, 20);
interactionModel = InteractivePullbackTower.refocusDepth(interactionModel, 20);

const rendererState = InfiniteNavigationRenderer.createInfiniteNavigationRendererState(
  interactionModel,
  null,
  {anchorDepth: 20}
);
assert.ok(rendererState.activeRenderedDepthCount <= rendererState.configuredActiveBound);
assert.ok(rendererState.virtualLayoutCache.entryCount <= rendererState.virtualLayoutCache.capacity);

const beforeFocusState = {
  selectedDepth: interactionModel.selectedDepth,
  focusedDepth: interactionModel.focusedDepth,
  levelCount: interactionModel.recursiveModel.levels.length
};
const descriptor = InfiniteNavigationRenderer.createInteractionFocusDescriptor("select", 20, interactionModel);
assert.deepEqual(descriptor, {
  controlRole: "interaction-control",
  actionKind: "select",
  semanticDepth: 20
});
assert.deepEqual(
  {
    selectedDepth: interactionModel.selectedDepth,
    focusedDepth: interactionModel.focusedDepth,
    levelCount: interactionModel.recursiveModel.levels.length
  },
  beforeFocusState,
  "Creating a DOM focus descriptor must not mutate semantic state."
);

let focusedControl = null;
const controls = new Map();
function control(selector, disabled = false) {
  const candidate = {
    disabled,
    focus() {
      focusedControl = selector;
    }
  };
  controls.set(selector, candidate);
  return candidate;
}
control('[data-interaction-action="select"][data-depth="20"]');
control('[data-interaction-action="expand-or-reveal"]');
const focusTarget = {
  querySelector(selector) {
    return controls.get(selector) || null;
  }
};
assert.equal(
  InfiniteNavigationRenderer.restoreInteractionFocus(focusTarget, descriptor, interactionModel),
  true
);
assert.equal(focusedControl, '[data-interaction-action="select"][data-depth="20"]');
assert.deepEqual(
  {
    selectedDepth: interactionModel.selectedDepth,
    focusedDepth: interactionModel.focusedDepth,
    levelCount: interactionModel.recursiveModel.levels.length
  },
  beforeFocusState,
  "DOM focus restoration must not become selected/focused state authority."
);

const collapsedDescriptor = InfiniteNavigationRenderer.createInteractionFocusDescriptor(
  "collapse-selected",
  null,
  interactionModel
);
focusedControl = null;
const fallbackTarget = {
  querySelector(selector) {
    if (selector === '[data-interaction-action="collapse-selected"]') {
      return {disabled: true, focus() { throw new Error("disabled control must not be focused"); }};
    }
    if (selector === '[data-interaction-action="select"][data-depth="20"]') {
      return {disabled: false, focus() { focusedControl = selector; }};
    }
    return null;
  }
};
assert.equal(
  InfiniteNavigationRenderer.restoreInteractionFocus(fallbackTarget, collapsedDescriptor, interactionModel),
  true
);
assert.equal(focusedControl, '[data-interaction-action="select"][data-depth="20"]');

const rendererSource = read("infinite-navigation-renderer.js");
assert.doesNotMatch(rendererSource, /nth-child|childNodes\[|children\[|slotId.*focus|focus.*slotId/i, "Focus restoration must not use fragile DOM indices or presentation slot ids.");
assert.match(rendererSource, /controlRole:\s*"interaction-control"/);
assert.match(rendererSource, /actionKind/);
assert.match(rendererSource, /semanticDepth/);

const interactionTarget = {dataset: {}, hidden: true, innerHTML: ""};
InfiniteNavigationRenderer.renderVirtualizedInteractionPresentation(
  interactionModel,
  rendererState,
  interactionTarget
);
assert.equal((interactionTarget.innerHTML.match(/data-level-depth=/g) || []).length, rendererState.activeRenderedDepthCount);
assert.match(interactionTarget.innerHTML, /intermediate materialized levels omitted from the active render window/);
assert.equal(interactionTarget.innerHTML.includes('aria-hidden="true"'), false, "Virtualized interaction gaps must remain exposed as bounded text.");
assert.match(interactionTarget.innerHTML, /role="group" aria-label="Materialized structural level controls"/);
assert.doesNotMatch(interactionTarget.innerHTML, /class="interaction-transition" role="status"/);
assert.ok(rendererState.activeRenderedDepthCount <= rendererState.configuredActiveBound);
assert.equal(interactionModel.recursiveModel.levels.length, 32, "Accessibility presentation must not viewport-prune semantic levels.");

const announcement = InfiniteNavigationRenderer.createInteractionAnnouncement(interactionModel, rendererState);
assert.match(announcement, /Selected X/);
assert.match(announcement, /geometry, sheets, and geometric zoom remain unmaterialized/);

const appSource = read("app.js");
assert.match(appSource, /createInteractionFocusDescriptor/);
assert.match(appSource, /restoreInteractionFocus/);
assert.doesNotMatch(appSource, /selectedDepth\s*=.*focus|focusedDepth\s*=.*focus/i);
const wheelGuard = appSource.indexOf("if (event.ctrlKey || event.metaKey) return;");
const plainWheelGuard = appSource.indexOf("if (!event.altKey) return;");
const preventDefault = appSource.indexOf("event.preventDefault();", appSource.indexOf("function handleStructuralCameraWheel"));
assert.ok(wheelGuard >= 0 && plainWheelGuard > wheelGuard && preventDefault > plainWheelGuard, "Browser zoom and plain scrolling guards must run before camera wheel preventDefault.");
assert.match(appSource, /event\.pointerType === "touch"/);
assert.equal(appSource.includes("expandOneLevel("), false);

const indexSource = read("index.html");
assert.equal((indexSource.match(/role="status"/g) || []).length, 1, "Exactly one status live region must remain.");
assert.equal((indexSource.match(/aria-live="polite"/g) || []).length, 1, "Camera/interaction diagnostics must not create duplicate polite live regions.");
for (const marker of [
  'data-camera-action="zoom-in"',
  'data-camera-action="zoom-out"',
  'data-camera-action="fit-visible"',
  'data-camera-action="fit-selected"',
  'data-camera-action="fit-focused"',
  'data-camera-action="reset"',
  'Ctrl/Cmd + wheel is never intercepted',
  'hold Alt while wheeling'
]) {
  assert.ok(indexSource.includes(marker), "Missing camera accessibility marker: " + marker);
}

const styleSource = read("style.css");
assert.match(styleSource, /button:focus-visible/);
assert.match(styleSource, /input:focus-visible/);
assert.match(styleSource, /summary:focus-visible/);
assert.match(styleSource, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(styleSource, /@media \(forced-colors: active\)/);
assert.match(styleSource, /touch-action:\s*pan-x pan-y pinch-zoom/);
assert.match(styleSource, /overflow-x:\s*auto/);
assert.match(styleSource, /width:\s*42rem/);
assert.match(styleSource, /stroke-dasharray:\s*9 4/);
assert.match(styleSource, /stroke-width:\s*3/);

for (const forbidden of [
  /sheetObjects/,
  /fiberGeometry/,
  /coveringMap/,
  /geometric preimages/i
]) {
  assert.doesNotMatch(rendererSource, forbidden);
}

const workflowSource = read(".github/workflows/formal-verification.yml");
for (const verifierName of [
  "verify_scene_spec_v0_03.js",
  "verify_base_renderer_v0_04.js",
  "verify_one_step_pullback_v0_05.js",
  "verify_recursive_lazy_expansion_v0_06.js",
  "verify_zoom_semantics_v0_07.js",
  "verify_sheet_branch_organization_v0_08.js",
  "verify_arithmetic_overlays_v0_09.js",
  "verify_performance_infinite_navigation_v0_10.js",
  "verify_mathematical_fidelity_v0_11.js",
  "verify_ux_exposition_v0_12.js",
  "verify_publication_checkpoint_v0_13.js",
  "verify_structural_visualization_v0_14.js",
  "verify_interactive_pullback_tower_v0_15.js",
  "verify_structural_camera_zoom_v0_16.js",
  "verify_branch_organization_graphics_v0_17.js",
  "verify_arithmetic_overlay_graphics_v0_18.js",
  "verify_infinite_navigation_renderer_v0_19.js",
  "verify_visual_semantics_accessibility_v0_20.js"
]) {
  assert.ok(workflowSource.includes("node " + verifierName), "Workflow must execute " + verifierName);
}

assert.match(read("branch-organization-graphics.js"), /role="img" aria-label=/);
assert.match(read("arithmetic-overlay-graphics.js"), /role="img" aria-label=/);
assert.match(read("structural-visualization.js"), /role="img" aria-label=/);
assert.match(read("structural-visualization.js"), /<title>/);
assert.match(read("structural-visualization.js"), /<desc>/);

const truthMarkers = [
  'geometryRendered = false',
  'sheetsMaterialized = false',
  'coveringStructureClaimed = false',
  'geometricZoomApplied = false',
  'W = unresolved'
];
const contractDoc = read("docs/VISUAL_SEMANTICS_ACCESSIBILITY_self_similar_cy_visualizer_v0_20.md");
for (const marker of truthMarkers) assert.ok(contractDoc.includes(marker));
assert.match(contractDoc, /screenReaderEvidence = not_tested/);
assert.match(contractDoc, /browserZoomEvidence = not_tested/);
assert.match(contractDoc, /contrastEvidence = not_tested/);

console.log("Visual semantics & accessibility v0.20 verifier: passed");
console.log("semantic focus != DOM focus: verified by presentation contract");
console.log("focus restoration: deterministic descriptor, no DOM index / slot identity");
console.log("browser zoom modifiers: reserved before camera preventDefault");
console.log("virtualized AT gap semantics: bounded textual representation");
console.log("live region discipline: one polite status surface");
console.log("browser / assistive-technology matrix: not_tested by this static verifier");

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { SceneSpecError, validateAndNormalizeScene } = require("./scene-spec.js");
const { renderBaseScene } = require("./base-renderer.js");
const { renderOneStepPullback } = require("./one-step-pullback.js");
const {
  MODEL_KIND,
  LEVEL_KIND,
  createRecursiveLazyExpansionModel,
  expandOneLevel,
  renderRecursiveLazyExpansion
} = require("./recursive-lazy-expansion.js");

const repositoryRoot = __dirname;
const canonicalScene = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "data", "system.json"), "utf8"));
const appSource = fs.readFileSync(path.join(repositoryRoot, "app.js"), "utf8");
const recursiveSource = fs.readFileSync(path.join(repositoryRoot, "recursive-lazy-expansion.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repositoryRoot, "index.html"), "utf8");

function cloneScene(scene = canonicalScene) {
  return JSON.parse(JSON.stringify(scene));
}

function createTarget() {
  return { hidden: true, dataset: {}, textContent: "" };
}

function validateThenInitialize(rawScene, baseTarget, pullbackTarget, recursiveTarget) {
  const scene = validateAndNormalizeScene(rawScene);
  const baseModel = renderBaseScene(scene, baseTarget);
  const pullbackModel = renderOneStepPullback(scene, baseModel, pullbackTarget);
  const recursiveModel = createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel);
  renderRecursiveLazyExpansion(recursiveModel, recursiveTarget);
  return { scene, baseModel, pullbackModel, recursiveModel };
}

const versionMatch = /^v0\.(\d+)$/.exec(canonicalScene.version);
assert.ok(versionMatch, "Canonical scene version must use v0.<minor> metadata.");
assert.ok(Number(versionMatch[1]) >= 6, "Recursive verifier requires version metadata at or after v0.06.");

const canonicalBaseTarget = createTarget();
const canonicalPullbackTarget = createTarget();
const canonicalRecursiveTarget = createTarget();
const canonical = validateThenInitialize(
  canonicalScene,
  canonicalBaseTarget,
  canonicalPullbackTarget,
  canonicalRecursiveTarget
);

assert.equal(canonical.recursiveModel.kind, MODEL_KIND);
assert.equal(canonical.recursiveModel.requestedDepth, 0);
assert.equal(canonical.recursiveModel.materializedDepth, 0);
assert.equal(canonical.recursiveModel.expansionComplete, true);
assert.equal(canonical.recursiveModel.levels.length, 0);
assert.equal(canonical.recursiveModel.status, canonical.baseModel.status);
assert.equal(canonical.recursiveModel.geometryRendered, false);
assert.equal(canonical.recursiveModel.sheetsMaterialized, false);
assert.strictEqual(expandOneLevel(canonical.recursiveModel), canonical.recursiveModel, "Depth 0 request must not expand beyond its target.");
assert.equal(canonicalRecursiveTarget.dataset.requestedDepth, "0");
assert.equal(canonicalRecursiveTarget.dataset.materializedDepth, "0");
assert.equal(canonicalRecursiveTarget.dataset.expansionComplete, "true");

const depthOneScene = cloneScene();
depthOneScene.request.requestedDepth = 1;
const depthOne = validateThenInitialize(depthOneScene, createTarget(), createTarget(), createTarget());
assert.equal(depthOne.recursiveModel.requestedDepth, 1);
assert.equal(depthOne.recursiveModel.materializedDepth, 1);
assert.equal(depthOne.recursiveModel.expansionComplete, true);
assert.equal(depthOne.recursiveModel.levels.length, 1);
assert.equal(depthOne.recursiveModel.levels[0].kind, LEVEL_KIND);
assert.equal(depthOne.recursiveModel.levels[0].depth, 1);
assert.equal(depthOne.recursiveModel.levels[0].sourceDepth, 0);
assert.equal(depthOne.recursiveModel.levels[0].relation, depthOne.pullbackModel.relation);
assert.equal(depthOne.recursiveModel.levels[0].pullbackMapKind, depthOne.pullbackModel.pullbackMapKind);
assert.equal(depthOne.recursiveModel.levels[0].coordinateCount, depthOne.pullbackModel.coordinateCount);
assert.equal(depthOne.recursiveModel.levels[0].exponentParameter, depthOne.pullbackModel.exponentParameter);
assert.equal(depthOne.recursiveModel.levels[0].exponentValue, depthOne.pullbackModel.exponentValue);
assert.equal(depthOne.recursiveModel.levels[0].mapDegreePerStep, depthOne.pullbackModel.mapDegree);
assert.deepEqual(depthOne.recursiveModel.levels[0].iteratedDegreeExpression, { baseDegree: 16, exponent: 1 });
assert.equal(depthOne.recursiveModel.levels[0].geometryRendered, false);
assert.equal(depthOne.recursiveModel.levels[0].sheetsMaterialized, false);
assert.strictEqual(expandOneLevel(depthOne.recursiveModel), depthOne.recursiveModel, "Completed depth 1 request must remain capped at depth 1.");

const depthThreeScene = cloneScene();
depthThreeScene.request.requestedDepth = 3;
const depthThree = validateThenInitialize(depthThreeScene, createTarget(), createTarget(), createTarget());
assert.equal(depthThree.recursiveModel.requestedDepth, 3);
assert.equal(depthThree.recursiveModel.materializedDepth, 1, "Initialization must materialize only the verified depth-1 frontier.");
assert.equal(depthThree.recursiveModel.levels.length, 1, "requestedDepth > 1 must not eagerly materialize unrelated higher levels.");
assert.equal(depthThree.recursiveModel.expansionComplete, false);

const depthTwoFrontier = expandOneLevel(depthThree.recursiveModel);
assert.equal(depthTwoFrontier.materializedDepth, 2);
assert.equal(depthTwoFrontier.levels.length, 2, "One expansion call must add exactly one structural level.");
assert.equal(depthTwoFrontier.expansionComplete, false);
assert.equal(depthTwoFrontier.levels[1].depth, 2);
assert.equal(depthTwoFrontier.levels[1].sourceDepth, 1);
assert.deepEqual(depthTwoFrontier.levels[1].iteratedDegreeExpression, { baseDegree: 16, exponent: 2 });
assert.equal(depthThree.recursiveModel.materializedDepth, 1, "Expansion must be immutable and must not mutate the prior frontier.");

const depthThreeFrontier = expandOneLevel(depthTwoFrontier);
assert.equal(depthThreeFrontier.materializedDepth, 3);
assert.equal(depthThreeFrontier.levels.length, 3);
assert.equal(depthThreeFrontier.expansionComplete, true);
assert.equal(depthThreeFrontier.levels[2].depth, 3);
assert.equal(depthThreeFrontier.levels[2].sourceDepth, 2);
assert.deepEqual(depthThreeFrontier.levels[2].iteratedDegreeExpression, { baseDegree: 16, exponent: 3 });
assert.strictEqual(expandOneLevel(depthThreeFrontier), depthThreeFrontier, "Expansion must stop deterministically at requestedDepth.");

const changedDScene = cloneScene();
changedDScene.mathematics.parameters.D = 3;
changedDScene.request.requestedDepth = 2;
const changedD = validateThenInitialize(changedDScene, createTarget(), createTarget(), createTarget());
assert.equal(changedD.pullbackModel.exponentValue, 3);
assert.equal(changedD.pullbackModel.mapDegree, 81);
assert.equal(changedD.recursiveModel.levels[0].exponentValue, 3);
assert.equal(changedD.recursiveModel.levels[0].mapDegreePerStep, 81);
const changedDDepthTwo = expandOneLevel(changedD.recursiveModel);
assert.deepEqual(changedDDepthTwo.levels[1].iteratedDegreeExpression, { baseDegree: 81, exponent: 2 });
assert.equal(changedDDepthTwo.levels[1].sheetsMaterialized, false);

const malformed = cloneScene();
delete malformed.mathematics.parameters.D;
const malformedBaseTarget = createTarget();
const malformedPullbackTarget = createTarget();
const malformedRecursiveTarget = createTarget();
assert.throws(
  () => validateThenInitialize(malformed, malformedBaseTarget, malformedPullbackTarget, malformedRecursiveTarget),
  (error) => error instanceof SceneSpecError
);
assert.deepEqual(malformedBaseTarget, createTarget());
assert.deepEqual(malformedPullbackTarget, createTarget());
assert.deepEqual(malformedRecursiveTarget, createTarget(), "Malformed input must be rejected before recursive state changes.");

const inventedW = cloneScene();
inventedW.mathematics.baseHypersurface.definingFunction.representation = "polynomial_ast";
assert.throws(
  () => validateThenInitialize(inventedW, createTarget(), createTarget(), createTarget()),
  (error) => error instanceof SceneSpecError
);

assert.equal(Object.hasOwn(canonicalScene, "derived"), false, "D^4 must remain derived rather than persisted in canonical JSON.");
assert.equal(Object.hasOwn(canonicalScene, "recursiveExpansion"), false, "Recursive runtime state must not be persisted in canonical JSON.");
assert.equal(canonical.scene.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

const validationCall = "SceneSpec.validateAndNormalizeScene(rawScene)";
const baseRendererCall = "BaseRenderer.renderBaseScene(scene, rendererElement)";
const pullbackCall = "OneStepPullback.renderOneStepPullback(scene, baseModel, pullbackElement)";
const recursiveCreateCall = "RecursiveLazyExpansion.createRecursiveLazyExpansionModel(scene, baseModel, pullbackModel)";
const recursiveRenderCall = "RecursiveLazyExpansion.renderRecursiveLazyExpansion(recursiveModel, recursiveElement)";
assert.ok(appSource.includes('fetch("data/system.json"'), "Thread 01 JSON loading path must remain present.");
assert.ok(appSource.indexOf(validationCall) >= 0);
assert.ok(appSource.indexOf(baseRendererCall) > appSource.indexOf(validationCall));
assert.ok(appSource.indexOf(pullbackCall) > appSource.indexOf(baseRendererCall));
assert.ok(appSource.indexOf(recursiveCreateCall) > appSource.indexOf(pullbackCall));
assert.ok(appSource.indexOf(recursiveRenderCall) > appSource.indexOf(recursiveCreateCall));
assert.equal(appSource.includes("expandOneLevel("), false, "Application initialization must not eagerly expand toward requestedDepth.");

const sceneSpecScript = '<script src="scene-spec.js" defer></script>';
const baseRendererScript = '<script src="base-renderer.js" defer></script>';
const pullbackScript = '<script src="one-step-pullback.js" defer></script>';
const recursiveScript = '<script src="recursive-lazy-expansion.js" defer></script>';
const appScript = '<script src="app.js" defer></script>';
assert.ok(indexSource.indexOf(sceneSpecScript) >= 0);
assert.ok(indexSource.indexOf(baseRendererScript) > indexSource.indexOf(sceneSpecScript));
assert.ok(indexSource.indexOf(pullbackScript) > indexSource.indexOf(baseRendererScript));
assert.ok(indexSource.indexOf(recursiveScript) > indexSource.indexOf(pullbackScript));
assert.ok(indexSource.indexOf(appScript) > indexSource.indexOf(recursiveScript));
assert.ok(indexSource.includes('id="recursive-lazy-expansion"'));

assert.equal(recursiveSource.includes("validateAndNormalizeScene"), false, "Recursive layer must not create a second scene validator.");
assert.equal(recursiveSource.includes("SceneSpec"), false, "Recursive layer must consume upstream normalized data rather than importing the validator.");
assert.equal(recursiveSource.includes('"coordinate_power"'), false, "Recursive map identity must be inherited from the one-step primitive.");
assert.equal(recursiveSource.includes("parameters.D"), false, "Recursive layer must not create a second canonical D lookup.");
assert.equal(recursiveSource.includes("** 4"), false, "Recursive layer must not recompute D^4.");
assert.equal(recursiveSource.includes("derived.sheetDegree"), false, "Recursive layer must reuse the one-step degree rather than reaching around the primitive.");

for (const forbiddenToken of ["sheetObjects", "points", "mesh", "implicitSurface", "zoom", "camera", "overlay", "WebGL", "THREE", "canvas", "<svg"]) {
  assert.equal(recursiveSource.includes(forbiddenToken), false, `Recursive layer must not contain ${forbiddenToken}.`);
}

console.log("recursive lazy expansion v0.06 verification: passed");
console.log("requestedDepth semantics: depth 0, depth 1, and depth > 1 passed");
console.log("lazy frontier rule: initialization <= 1 pullback level; each expansion call adds <= 1 level");
console.log("iterated degree: structured as (D^4)^n without materializing sheet objects");
console.log("unresolved W and no-concrete-geometry guards: passed");

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { SceneSpecError, validateAndNormalizeScene } = require("./scene-spec.js");

const repositoryRoot = __dirname;
const scenePath = path.join(repositoryRoot, "data", "system.json");
const source = fs.readFileSync(scenePath, "utf8");
const canonicalScene = JSON.parse(source);

function cloneScene() {
  return JSON.parse(JSON.stringify(canonicalScene));
}

function expectRejected(name, mutate) {
  const candidate = cloneScene();
  mutate(candidate);

  assert.throws(
    () => validateAndNormalizeScene(candidate),
    (error) => error instanceof SceneSpecError,
    `${name} should be rejected with SceneSpecError.`
  );
}

const normalized = validateAndNormalizeScene(canonicalScene);
assert.equal(normalized.schemaVersion, 1);
assert.equal(normalized.mathematics.parameters.D, 2);
assert.equal(normalized.request.requestedDepth, 0);
assert.equal(normalized.derived.metricScale, 4);
assert.equal(normalized.derived.sheetDegree, 16);
assert.equal(normalized.mathematics.pullbackMap.kind, "coordinate_power");
assert.equal(normalized.mathematics.pullbackMap.coordinateCount, 4);
assert.equal(normalized.mathematics.pullbackMap.exponentParameter, "D");
assert.equal(normalized.mathematics.baseHypersurface.definingFunction.symbol, "W");
assert.equal(normalized.mathematics.baseHypersurface.definingFunction.representation, "unresolved");

expectRejected("unsupported schema version", (scene) => {
  scene.schemaVersion = 2;
});
expectRejected("missing D", (scene) => {
  delete scene.mathematics.parameters.D;
});
expectRejected("noninteger D", (scene) => {
  scene.mathematics.parameters.D = 2.5;
});
expectRejected("D below lower bound", (scene) => {
  scene.mathematics.parameters.D = 1;
});
expectRejected("D whose fourth power is not a safe integer", (scene) => {
  scene.mathematics.parameters.D = 100000;
});
expectRejected("non-numeric lambda", (scene) => {
  scene.mathematics.parameters.lambda = "1";
});
expectRejected("negative requested depth", (scene) => {
  scene.request.requestedDepth = -1;
});
expectRejected("noninteger requested depth", (scene) => {
  scene.request.requestedDepth = 0.5;
});
expectRejected("wrong pullback map kind", (scene) => {
  scene.mathematics.pullbackMap.kind = "arbitrary_function";
});
expectRejected("wrong coordinate count", (scene) => {
  scene.mathematics.pullbackMap.coordinateCount = 3;
});
expectRejected("wrong exponent parameter", (scene) => {
  scene.mathematics.pullbackMap.exponentParameter = "kappa";
});
expectRejected("invented W representation", (scene) => {
  scene.mathematics.baseHypersurface.definingFunction.representation = "polynomial_ast";
});
expectRejected("unknown top-level field", (scene) => {
  scene.renderer = {};
});

console.log("scene-spec v0.03 verification: passed");
console.log(`derived D^2 = ${normalized.derived.metricScale}`);
console.log(`derived D^4 = ${normalized.derived.sheetDegree}`);
console.log("malformed examples rejected: 13/13");

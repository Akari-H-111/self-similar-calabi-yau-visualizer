"use strict";

(function attachSceneSpec(globalObject) {
  const SUPPORTED_SCHEMA_VERSION = 1;
  const PROJECT_NAME = "Self-Similar Calabi–Yau Visualizer";

  class SceneSpecError extends Error {
    constructor(message) {
      super(message);
      this.name = "SceneSpecError";
    }
  }

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function assertPlainObject(value, path) {
    if (!isPlainObject(value)) {
      throw new SceneSpecError(`${path} must be an object.`);
    }
  }

  function assertExactKeys(value, expectedKeys, path) {
    const actualKeys = Object.keys(value).sort();
    const expected = [...expectedKeys].sort();

    if (actualKeys.length !== expected.length || actualKeys.some((key, index) => key !== expected[index])) {
      throw new SceneSpecError(`${path} must contain exactly: ${expected.join(", ")}.`);
    }
  }

  function assertNonEmptyString(value, path) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new SceneSpecError(`${path} must be a non-empty string.`);
    }
  }

  function assertFiniteNumber(value, path) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new SceneSpecError(`${path} must be a finite number.`);
    }
  }

  function assertSafeIntegerAtLeast(value, minimum, path) {
    if (!Number.isSafeInteger(value) || value < minimum) {
      throw new SceneSpecError(`${path} must be a safe integer >= ${minimum}.`);
    }
  }

  function validateAndNormalizeScene(scene) {
    assertPlainObject(scene, "scene");
    assertExactKeys(scene, ["schemaVersion", "project", "version", "mathematics", "request"], "scene");

    if (scene.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
      throw new SceneSpecError(
        `scene.schemaVersion must be ${SUPPORTED_SCHEMA_VERSION}; received ${String(scene.schemaVersion)}.`
      );
    }

    if (scene.project !== PROJECT_NAME) {
      throw new SceneSpecError(`scene.project must be ${JSON.stringify(PROJECT_NAME)}.`);
    }

    assertNonEmptyString(scene.version, "scene.version");

    assertPlainObject(scene.mathematics, "scene.mathematics");
    assertExactKeys(
      scene.mathematics,
      ["parameters", "pullbackMap", "baseHypersurface"],
      "scene.mathematics"
    );

    const { parameters, pullbackMap, baseHypersurface } = scene.mathematics;

    assertPlainObject(parameters, "scene.mathematics.parameters");
    assertExactKeys(parameters, ["D", "lambda", "kappa"], "scene.mathematics.parameters");
    assertSafeIntegerAtLeast(parameters.D, 2, "scene.mathematics.parameters.D");
    assertFiniteNumber(parameters.lambda, "scene.mathematics.parameters.lambda");
    assertFiniteNumber(parameters.kappa, "scene.mathematics.parameters.kappa");

    const metricScale = parameters.D ** 2;
    const sheetDegree = parameters.D ** 4;
    if (!Number.isSafeInteger(metricScale) || !Number.isSafeInteger(sheetDegree)) {
      throw new SceneSpecError("Derived D^2 and D^4 must remain safe integers in the current Number-based schema.");
    }

    assertPlainObject(pullbackMap, "scene.mathematics.pullbackMap");
    assertExactKeys(
      pullbackMap,
      ["kind", "coordinateCount", "exponentParameter"],
      "scene.mathematics.pullbackMap"
    );
    if (pullbackMap.kind !== "coordinate_power") {
      throw new SceneSpecError('scene.mathematics.pullbackMap.kind must be "coordinate_power".');
    }
    if (pullbackMap.coordinateCount !== 4) {
      throw new SceneSpecError("scene.mathematics.pullbackMap.coordinateCount must be 4.");
    }
    if (pullbackMap.exponentParameter !== "D") {
      throw new SceneSpecError('scene.mathematics.pullbackMap.exponentParameter must be "D".');
    }

    assertPlainObject(baseHypersurface, "scene.mathematics.baseHypersurface");
    assertExactKeys(
      baseHypersurface,
      ["kind", "definingFunction", "levelParameter"],
      "scene.mathematics.baseHypersurface"
    );
    if (baseHypersurface.kind !== "level_set") {
      throw new SceneSpecError('scene.mathematics.baseHypersurface.kind must be "level_set".');
    }
    if (baseHypersurface.levelParameter !== "lambda") {
      throw new SceneSpecError('scene.mathematics.baseHypersurface.levelParameter must be "lambda".');
    }

    assertPlainObject(baseHypersurface.definingFunction, "scene.mathematics.baseHypersurface.definingFunction");
    assertExactKeys(
      baseHypersurface.definingFunction,
      ["symbol", "representation"],
      "scene.mathematics.baseHypersurface.definingFunction"
    );
    if (baseHypersurface.definingFunction.symbol !== "W") {
      throw new SceneSpecError('scene.mathematics.baseHypersurface.definingFunction.symbol must be "W".');
    }
    if (baseHypersurface.definingFunction.representation !== "unresolved") {
      throw new SceneSpecError(
        'scene.mathematics.baseHypersurface.definingFunction.representation must remain "unresolved" in schema version 1.'
      );
    }

    assertPlainObject(scene.request, "scene.request");
    assertExactKeys(scene.request, ["requestedDepth"], "scene.request");
    assertSafeIntegerAtLeast(scene.request.requestedDepth, 0, "scene.request.requestedDepth");

    return Object.freeze({
      ...scene,
      derived: Object.freeze({
        metricScale,
        sheetDegree
      })
    });
  }

  const api = Object.freeze({
    SUPPORTED_SCHEMA_VERSION,
    SceneSpecError,
    validateAndNormalizeScene
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.SceneSpec = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

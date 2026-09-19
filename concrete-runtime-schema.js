"use strict";

(function attachConcreteRuntimeSchema(globalObject) {
  const LEGACY_SCHEMA_VERSION = 1;
  const CONCRETE_SCHEMA_VERSION = 2;
  const PROJECT_NAME = "Self-Similar Calabi–Yau Visualizer";
  const FORMULA_ID = "W_kappa_torus4_v1";
  const FULL_COMPLEX_RUNTIME_SUPPORT = false;

  const BUILTIN_FORMULA_REGISTRY = Object.freeze({
    [FORMULA_ID]: Object.freeze({
      semanticKind: "coordinate_sum_plus_scaled_reciprocal_coordinate_product",
      ambientKind: "algebraic_torus",
      coordinateCount: 4,
      coefficientParameter: "kappa",
      mathematicalExpansion: "sum_i(z_i) + kappa / product_i(z_i)",
      claimIds: Object.freeze(["function.W_kappa"])
    })
  });

  class ConcreteRuntimeSchemaError extends Error {
    constructor(message) {
      super(message);
      this.name = "ConcreteRuntimeSchemaError";
    }
  }

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function assertPlainObject(value, path) {
    if (!isPlainObject(value)) {
      throw new ConcreteRuntimeSchemaError(`${path} must be an object.`);
    }
  }

  function assertExactKeys(value, expectedKeys, path) {
    const actualKeys = Object.keys(value).sort();
    const expected = [...expectedKeys].sort();
    if (actualKeys.length !== expected.length || actualKeys.some((key, index) => key !== expected[index])) {
      throw new ConcreteRuntimeSchemaError(`${path} must contain exactly: ${expected.join(", ")}.`);
    }
  }

  function assertNonEmptyString(value, path) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new ConcreteRuntimeSchemaError(`${path} must be a non-empty string.`);
    }
  }

  function assertFiniteNumber(value, path) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new ConcreteRuntimeSchemaError(`${path} must be a finite number.`);
    }
  }

  function assertSafeIntegerAtLeast(value, minimum, path) {
    if (!Number.isSafeInteger(value) || value < minimum) {
      throw new ConcreteRuntimeSchemaError(`${path} must be a safe integer >= ${minimum}.`);
    }
  }

  function legacySceneSpec() {
    if (typeof module !== "undefined" && module.exports) {
      return require("./scene-spec.js");
    }
    if (!globalObject.SceneSpec) {
      throw new ConcreteRuntimeSchemaError("Schema v1 dispatch requires the legacy SceneSpec API.");
    }
    return globalObject.SceneSpec;
  }

  function deriveFormulaAst(formulaId) {
    const formula = BUILTIN_FORMULA_REGISTRY[formulaId];
    if (!formula) {
      throw new ConcreteRuntimeSchemaError(`Unknown builtin formulaId: ${String(formulaId)}.`);
    }

    return Object.freeze({
      kind: "sum",
      terms: Object.freeze([
        Object.freeze({
          kind: "coordinate_sum",
          coordinateCount: formula.coordinateCount
        }),
        Object.freeze({
          kind: "scaled_reciprocal_coordinate_product",
          coefficientParameter: formula.coefficientParameter,
          coordinateCount: formula.coordinateCount
        })
      ])
    });
  }

  function validateAndNormalizeV2(scene) {
    assertPlainObject(scene, "scene");
    assertExactKeys(scene, ["schemaVersion", "project", "version", "mathematics", "request"], "scene");

    if (scene.schemaVersion !== CONCRETE_SCHEMA_VERSION) {
      throw new ConcreteRuntimeSchemaError(
        `scene.schemaVersion must be ${CONCRETE_SCHEMA_VERSION} for concrete v2 validation.`
      );
    }
    if (scene.project !== PROJECT_NAME) {
      throw new ConcreteRuntimeSchemaError(`scene.project must be ${JSON.stringify(PROJECT_NAME)}.`);
    }
    assertNonEmptyString(scene.version, "scene.version");

    assertPlainObject(scene.mathematics, "scene.mathematics");
    assertExactKeys(
      scene.mathematics,
      ["parameters", "parameterDomain", "ambient", "pullbackMap", "baseHypersurface"],
      "scene.mathematics"
    );

    const { parameters, parameterDomain, ambient, pullbackMap, baseHypersurface } = scene.mathematics;

    assertPlainObject(parameters, "scene.mathematics.parameters");
    assertExactKeys(parameters, ["D", "lambda", "kappa"], "scene.mathematics.parameters");
    assertSafeIntegerAtLeast(parameters.D, 2, "scene.mathematics.parameters.D");
    assertFiniteNumber(parameters.lambda, "scene.mathematics.parameters.lambda");
    assertFiniteNumber(parameters.kappa, "scene.mathematics.parameters.kappa");

    const metricScale = parameters.D ** 2;
    const sheetDegree = parameters.D ** 4;
    if (!Number.isSafeInteger(metricScale) || !Number.isSafeInteger(sheetDegree)) {
      throw new ConcreteRuntimeSchemaError("Derived D^2 and D^4 must remain safe integers in the Number-based runtime.");
    }

    assertPlainObject(parameterDomain, "scene.mathematics.parameterDomain");
    assertExactKeys(
      parameterDomain,
      ["appliesTo", "sourceField", "runtimeRepresentation", "embedding"],
      "scene.mathematics.parameterDomain"
    );
    if (!Array.isArray(parameterDomain.appliesTo) ||
        parameterDomain.appliesTo.length !== 2 ||
        parameterDomain.appliesTo[0] !== "lambda" ||
        parameterDomain.appliesTo[1] !== "kappa") {
      throw new ConcreteRuntimeSchemaError('scene.mathematics.parameterDomain.appliesTo must be exactly ["lambda", "kappa"].');
    }
    if (parameterDomain.sourceField !== "complex") {
      throw new ConcreteRuntimeSchemaError('scene.mathematics.parameterDomain.sourceField must be "complex".');
    }
    if (parameterDomain.runtimeRepresentation !== "real_slice") {
      throw new ConcreteRuntimeSchemaError('scene.mathematics.parameterDomain.runtimeRepresentation must be "real_slice".');
    }
    if (parameterDomain.embedding !== "real_to_complex") {
      throw new ConcreteRuntimeSchemaError('scene.mathematics.parameterDomain.embedding must be "real_to_complex".');
    }

    assertPlainObject(ambient, "scene.mathematics.ambient");
    assertExactKeys(ambient, ["kind", "coordinateCount", "baseField"], "scene.mathematics.ambient");
    if (ambient.kind !== "algebraic_torus") {
      throw new ConcreteRuntimeSchemaError('scene.mathematics.ambient.kind must be "algebraic_torus".');
    }
    if (ambient.coordinateCount !== 4) {
      throw new ConcreteRuntimeSchemaError("scene.mathematics.ambient.coordinateCount must be 4.");
    }
    if (ambient.baseField !== "complex") {
      throw new ConcreteRuntimeSchemaError('scene.mathematics.ambient.baseField must be "complex".');
    }

    assertPlainObject(pullbackMap, "scene.mathematics.pullbackMap");
    assertExactKeys(pullbackMap, ["kind", "exponentParameter"], "scene.mathematics.pullbackMap");
    if (pullbackMap.kind !== "coordinate_power") {
      throw new ConcreteRuntimeSchemaError('scene.mathematics.pullbackMap.kind must be "coordinate_power".');
    }
    if (pullbackMap.exponentParameter !== "D") {
      throw new ConcreteRuntimeSchemaError('scene.mathematics.pullbackMap.exponentParameter must be "D".');
    }

    assertPlainObject(baseHypersurface, "scene.mathematics.baseHypersurface");
    assertExactKeys(
      baseHypersurface,
      ["kind", "definingFunction", "levelParameter"],
      "scene.mathematics.baseHypersurface"
    );
    if (baseHypersurface.kind !== "level_set") {
      throw new ConcreteRuntimeSchemaError('scene.mathematics.baseHypersurface.kind must be "level_set".');
    }
    if (baseHypersurface.levelParameter !== "lambda") {
      throw new ConcreteRuntimeSchemaError('scene.mathematics.baseHypersurface.levelParameter must be "lambda".');
    }

    assertPlainObject(baseHypersurface.definingFunction, "scene.mathematics.baseHypersurface.definingFunction");
    assertExactKeys(
      baseHypersurface.definingFunction,
      ["symbol", "representation"],
      "scene.mathematics.baseHypersurface.definingFunction"
    );
    if (baseHypersurface.definingFunction.symbol !== "W") {
      throw new ConcreteRuntimeSchemaError('scene.mathematics.baseHypersurface.definingFunction.symbol must be "W".');
    }

    const representation = baseHypersurface.definingFunction.representation;
    assertPlainObject(representation, "scene.mathematics.baseHypersurface.definingFunction.representation");
    assertExactKeys(
      representation,
      ["kind", "formulaId", "coefficientParameter"],
      "scene.mathematics.baseHypersurface.definingFunction.representation"
    );
    if (representation.kind !== "builtin_formula") {
      throw new ConcreteRuntimeSchemaError('definingFunction.representation.kind must be "builtin_formula".');
    }
    const formula = BUILTIN_FORMULA_REGISTRY[representation.formulaId];
    if (!formula) {
      throw new ConcreteRuntimeSchemaError(`Unknown builtin formulaId: ${String(representation.formulaId)}.`);
    }
    if (representation.formulaId !== FORMULA_ID) {
      throw new ConcreteRuntimeSchemaError(`definingFunction.representation.formulaId must be ${FORMULA_ID}.`);
    }
    if (representation.coefficientParameter !== "kappa" ||
        representation.coefficientParameter !== formula.coefficientParameter) {
      throw new ConcreteRuntimeSchemaError('definingFunction.representation.coefficientParameter must be "kappa".');
    }
    if (formula.ambientKind !== ambient.kind || formula.coordinateCount !== ambient.coordinateCount) {
      throw new ConcreteRuntimeSchemaError("Builtin formula registry metadata must agree with the declared ambient.");
    }

    assertPlainObject(scene.request, "scene.request");
    assertExactKeys(scene.request, ["requestedDepth"], "scene.request");
    assertSafeIntegerAtLeast(scene.request.requestedDepth, 0, "scene.request.requestedDepth");

    return Object.freeze({
      schemaVersion: scene.schemaVersion,
      project: scene.project,
      version: scene.version,
      mathematics: Object.freeze({
        parameters: Object.freeze({ ...parameters }),
        parameterDomain: Object.freeze({
          appliesTo: Object.freeze([...parameterDomain.appliesTo]),
          sourceField: parameterDomain.sourceField,
          runtimeRepresentation: parameterDomain.runtimeRepresentation,
          embedding: parameterDomain.embedding
        }),
        ambient: Object.freeze({
          ...ambient,
          nonzeroCoordinates: true
        }),
        pullbackMap: Object.freeze({
          ...pullbackMap,
          coordinateCount: ambient.coordinateCount
        }),
        baseHypersurface: Object.freeze({
          kind: baseHypersurface.kind,
          definingFunction: Object.freeze({
            symbol: baseHypersurface.definingFunction.symbol,
            representation: Object.freeze({ ...representation })
          }),
          levelParameter: baseHypersurface.levelParameter
        })
      }),
      request: Object.freeze({ ...scene.request }),
      derived: Object.freeze({
        metricScale,
        sheetDegree,
        definingFunctionAst: deriveFormulaAst(representation.formulaId)
      })
    });
  }

  function validateAndNormalizeScene(scene) {
    assertPlainObject(scene, "scene");
    if (scene.schemaVersion === LEGACY_SCHEMA_VERSION) {
      return legacySceneSpec().validateAndNormalizeScene(scene);
    }
    if (scene.schemaVersion === CONCRETE_SCHEMA_VERSION) {
      return validateAndNormalizeV2(scene);
    }
    throw new ConcreteRuntimeSchemaError(
      `scene.schemaVersion must be ${LEGACY_SCHEMA_VERSION} or ${CONCRETE_SCHEMA_VERSION}; received ${String(scene.schemaVersion)}.`
    );
  }

  function migrateV1ToV2(scene) {
    const normalizedV1 = legacySceneSpec().validateAndNormalizeScene(scene);
    const { parameters, baseHypersurface, pullbackMap } = normalizedV1.mathematics;

    if (baseHypersurface.definingFunction.representation !== "unresolved") {
      throw new ConcreteRuntimeSchemaError("Explicit v1 -> v2 migration requires the immutable v1 unresolved-W representation.");
    }

    return Object.freeze({
      schemaVersion: CONCRETE_SCHEMA_VERSION,
      project: normalizedV1.project,
      version: normalizedV1.version,
      mathematics: Object.freeze({
        parameters: Object.freeze({
          D: parameters.D,
          lambda: parameters.lambda,
          kappa: parameters.kappa
        }),
        parameterDomain: Object.freeze({
          appliesTo: Object.freeze(["lambda", "kappa"]),
          sourceField: "complex",
          runtimeRepresentation: "real_slice",
          embedding: "real_to_complex"
        }),
        ambient: Object.freeze({
          kind: "algebraic_torus",
          coordinateCount: pullbackMap.coordinateCount,
          baseField: "complex"
        }),
        pullbackMap: Object.freeze({
          kind: pullbackMap.kind,
          exponentParameter: pullbackMap.exponentParameter
        }),
        baseHypersurface: Object.freeze({
          kind: baseHypersurface.kind,
          definingFunction: Object.freeze({
            symbol: baseHypersurface.definingFunction.symbol,
            representation: Object.freeze({
              kind: "builtin_formula",
              formulaId: FORMULA_ID,
              coefficientParameter: "kappa"
            })
          }),
          levelParameter: baseHypersurface.levelParameter
        })
      }),
      request: Object.freeze({
        requestedDepth: normalizedV1.request.requestedDepth
      })
    });
  }

  const api = Object.freeze({
    LEGACY_SCHEMA_VERSION,
    CONCRETE_SCHEMA_VERSION,
    SUPPORTED_SCHEMA_VERSIONS: Object.freeze([LEGACY_SCHEMA_VERSION, CONCRETE_SCHEMA_VERSION]),
    PROJECT_NAME,
    FORMULA_ID,
    FULL_COMPLEX_RUNTIME_SUPPORT,
    BUILTIN_FORMULA_REGISTRY,
    ConcreteRuntimeSchemaError,
    deriveFormulaAst,
    validateAndNormalizeV2,
    validateAndNormalizeScene,
    migrateV1ToV2
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  globalObject.ConcreteRuntimeSchema = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

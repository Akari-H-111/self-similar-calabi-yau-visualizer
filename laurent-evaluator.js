"use strict";

(function attachLaurentEvaluator(globalObject) {
  const FORMULA_ID = "W_kappa_torus4_v1";
  const COORDINATE_COUNT = 4;

  class LaurentEvaluatorError extends Error {
    constructor(message) {
      super(message);
      this.name = "LaurentEvaluatorError";
    }
  }

  function runtimeSchema() {
    if (typeof module !== "undefined" && module.exports) {
      return require("./concrete-runtime-schema.js");
    }
    if (!globalObject.ConcreteRuntimeSchema) {
      throw new LaurentEvaluatorError("ConcreteRuntimeSchema is required.");
    }
    return globalObject.ConcreteRuntimeSchema;
  }

  function complex(re, im = 0) {
    if (typeof re !== "number" || !Number.isFinite(re) || typeof im !== "number" || !Number.isFinite(im)) {
      throw new LaurentEvaluatorError("Complex components must be finite numbers.");
    }
    return Object.freeze({ re, im });
  }

  function assertComplex(value, path) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new LaurentEvaluatorError(path + " must be a complex object {re, im}.");
    }
    if (typeof value.re !== "number" || !Number.isFinite(value.re) ||
        typeof value.im !== "number" || !Number.isFinite(value.im)) {
      throw new LaurentEvaluatorError(path + " must have finite numeric re/im components.");
    }
    return value;
  }

  function add(a, b) {
    assertComplex(a, "a");
    assertComplex(b, "b");
    return complex(a.re + b.re, a.im + b.im);
  }

  function sub(a, b) {
    assertComplex(a, "a");
    assertComplex(b, "b");
    return complex(a.re - b.re, a.im - b.im);
  }

  function mul(a, b) {
    assertComplex(a, "a");
    assertComplex(b, "b");
    return complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  }

  function scale(a, scalar) {
    assertComplex(a, "a");
    if (typeof scalar !== "number" || !Number.isFinite(scalar)) {
      throw new LaurentEvaluatorError("scale must be finite.");
    }
    return complex(a.re * scalar, a.im * scalar);
  }

  function abs(a) {
    assertComplex(a, "a");
    return Math.hypot(a.re, a.im);
  }

  function isZero(a) {
    return abs(a) === 0;
  }

  function div(a, b) {
    assertComplex(a, "a");
    assertComplex(b, "b");
    const denominator = b.re * b.re + b.im * b.im;
    if (denominator === 0 || !Number.isFinite(denominator)) {
      throw new LaurentEvaluatorError("Complex division requires a finite nonzero denominator.");
    }
    return complex(
      (a.re * b.re + a.im * b.im) / denominator,
      (a.im * b.re - a.re * b.im) / denominator
    );
  }

  function sqrtPrincipal(value) {
    const z = assertComplex(value, "value");
    if (z.im === 0) {
      if (z.re >= 0) return complex(Math.sqrt(z.re), 0);
      return complex(0, Math.sqrt(-z.re));
    }
    const magnitude = Math.hypot(z.re, z.im);
    const real = Math.sqrt(Math.max(0, (magnitude + z.re) / 2));
    const imaginaryMagnitude = Math.sqrt(Math.max(0, (magnitude - z.re) / 2));
    return complex(real, z.im < 0 ? -imaginaryMagnitude : imaginaryMagnitude);
  }

  function validateCoordinates(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== COORDINATE_COUNT) {
      throw new LaurentEvaluatorError("Torus4 coordinates must be an array of exactly four complex values.");
    }
    return Object.freeze(coordinates.map((coordinate, index) => {
      const z = assertComplex(coordinate, "coordinates[" + String(index) + "]");
      if (isZero(z)) {
        throw new LaurentEvaluatorError("Torus4 coordinates must be nonzero; coordinate " + String(index) + " is zero.");
      }
      return complex(z.re, z.im);
    }));
  }

  function createEvaluationContext(scene) {
    const Runtime = runtimeSchema();
    const normalized = Runtime.validateAndNormalizeV2(scene);
    const representation = normalized.mathematics.baseHypersurface.definingFunction.representation;
    const registryEntry = Runtime.BUILTIN_FORMULA_REGISTRY[representation.formulaId];
    if (!registryEntry || representation.formulaId !== FORMULA_ID || Runtime.FORMULA_ID !== FORMULA_ID) {
      throw new LaurentEvaluatorError("Evaluator only accepts the canonical W_kappa_torus4_v1 registry entry.");
    }
    if (normalized.mathematics.ambient.kind !== "algebraic_torus" ||
        normalized.mathematics.ambient.coordinateCount !== COORDINATE_COUNT ||
        normalized.mathematics.ambient.baseField !== "complex" ||
        normalized.mathematics.ambient.nonzeroCoordinates !== true) {
      throw new LaurentEvaluatorError("Evaluator requires the admitted four-coordinate complex algebraic torus.");
    }
    if (normalized.mathematics.parameterDomain.embedding !== "real_to_complex") {
      throw new LaurentEvaluatorError("Evaluator requires the declared real_to_complex parameter embedding.");
    }
    return Object.freeze({
      formulaId: FORMULA_ID,
      scene: normalized,
      kappa: complex(normalized.mathematics.parameters.kappa, 0),
      lambda: complex(normalized.mathematics.parameters.lambda, 0),
      coefficientParameter: representation.coefficientParameter,
      levelParameter: normalized.mathematics.baseHypersurface.levelParameter
    });
  }

  function evaluateW(context, coordinates) {
    if (!context || context.formulaId !== FORMULA_ID) {
      throw new LaurentEvaluatorError("A canonical Laurent evaluation context is required.");
    }
    const z = validateCoordinates(coordinates);
    let coordinateSum = complex(0, 0);
    let coordinateProduct = complex(1, 0);
    for (const coordinate of z) {
      coordinateSum = add(coordinateSum, coordinate);
      coordinateProduct = mul(coordinateProduct, coordinate);
    }
    const reciprocalTerm = div(context.kappa, coordinateProduct);
    const value = add(coordinateSum, reciprocalTerm);
    const scaleEstimate = Math.max(
      1,
      abs(context.lambda),
      z.reduce((sum, coordinate) => sum + abs(coordinate), 0) + abs(reciprocalTerm)
    );
    return Object.freeze({
      formulaId: FORMULA_ID,
      value,
      coordinateSum,
      coordinateProduct,
      reciprocalTerm,
      scaleEstimate
    });
  }

  function evaluateResidual(context, coordinates) {
    const evaluation = evaluateW(context, coordinates);
    const residual = sub(evaluation.value, context.lambda);
    return Object.freeze({
      ...evaluation,
      residual,
      residualMagnitude: abs(residual)
    });
  }

  const api = Object.freeze({
    FORMULA_ID,
    COORDINATE_COUNT,
    LaurentEvaluatorError,
    complex,
    assertComplex,
    add,
    sub,
    mul,
    scale,
    abs,
    div,
    sqrtPrincipal,
    validateCoordinates,
    createEvaluationContext,
    evaluateW,
    evaluateResidual
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.LaurentEvaluator = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

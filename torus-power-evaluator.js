"use strict";

(function attachTorusPowerEvaluator(globalObject) {
  const MAP_ID = "torus_coordinate_power_v1";
  const TOLERANCE_VERSION = "v0.01";

  class TorusPowerEvaluatorError extends Error {
    constructor(message) {
      super(message);
      this.name = "TorusPowerEvaluatorError";
    }
  }

  function evaluator() {
    if (typeof module !== "undefined" && module.exports) return require("./laurent-evaluator.js");
    if (!globalObject.LaurentEvaluator) throw new TorusPowerEvaluatorError("LaurentEvaluator is required.");
    return globalObject.LaurentEvaluator;
  }

  function validateD(D) {
    if (!Number.isSafeInteger(D) || D < 2) {
      throw new TorusPowerEvaluatorError("Thread 25 requires D to be a safe integer >= 2.");
    }
    return D;
  }

  function validateTolerance(tolerance) {
    if (!tolerance || typeof tolerance !== "object" || Array.isArray(tolerance)) {
      throw new TorusPowerEvaluatorError("power residual tolerance must be an object.");
    }
    if (tolerance.kind !== "combined_absolute_relative" || tolerance.version !== TOLERANCE_VERSION) {
      throw new TorusPowerEvaluatorError("Unsupported power residual tolerance contract.");
    }
    for (const key of ["absolute", "relative"]) {
      if (typeof tolerance[key] !== "number" || !Number.isFinite(tolerance[key]) || tolerance[key] < 0) {
        throw new TorusPowerEvaluatorError("power residual tolerance " + key + " must be finite and nonnegative.");
      }
    }
    if (tolerance.absolute === 0 && tolerance.relative === 0) {
      throw new TorusPowerEvaluatorError("Power residual tolerance cannot be identically zero.");
    }
    if (tolerance.scaleFunction !== "max(1,abs(parentCoordinate))") {
      throw new TorusPowerEvaluatorError("Unexpected power residual scale function.");
    }
    return Object.freeze({ ...tolerance });
  }

  function powComplex(value, D) {
    const E = evaluator();
    const exponent = validateD(D);
    const z = E.assertComplex(value, "value");
    let n = exponent;
    let base = E.complex(z.re, z.im);
    let result = E.complex(1, 0);
    while (n > 0) {
      if (n % 2 === 1) result = E.mul(result, base);
      n = Math.floor(n / 2);
      if (n > 0) base = E.mul(base, base);
    }
    return result;
  }

  function coordinatePower(D, coordinates) {
    const E = evaluator();
    const exponent = validateD(D);
    const z = E.validateCoordinates(coordinates);
    return Object.freeze(z.map((coordinate) => powComplex(coordinate, exponent)));
  }

  function powerResidualRecord(D, childCoordinates, parentCoordinates, rawTolerance) {
    const E = evaluator();
    const tolerance = validateTolerance(rawTolerance);
    const parent = E.validateCoordinates(parentCoordinates);
    const powered = coordinatePower(D, childCoordinates);
    const perCoordinate = powered.map((value, index) => {
      const residual = E.sub(value, parent[index]);
      const residualMagnitude = E.abs(residual);
      const scaleEstimate = Math.max(1, E.abs(parent[index]));
      const threshold = tolerance.absolute + tolerance.relative * scaleEstimate;
      return Object.freeze({
        coordinateIndex: index,
        residual,
        residualMagnitude,
        scaleEstimate,
        threshold,
        accepted: Number.isFinite(residualMagnitude) && residualMagnitude <= threshold
      });
    });
    return Object.freeze({
      mapId: MAP_ID,
      D,
      powered,
      perCoordinate: Object.freeze(perCoordinate),
      maxResidualMagnitude: Math.max(...perCoordinate.map((entry) => entry.residualMagnitude)),
      accepted: perCoordinate.every((entry) => entry.accepted),
      tolerance
    });
  }

  const api = Object.freeze({
    MAP_ID,
    TOLERANCE_VERSION,
    TorusPowerEvaluatorError,
    validateD,
    validateTolerance,
    powComplex,
    coordinatePower,
    powerResidualRecord
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.TorusPowerEvaluator = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

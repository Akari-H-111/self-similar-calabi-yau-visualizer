"use strict";

(function attachGeometricPullbackFibers(globalObject) {
  const FIBER_ENUMERATOR_ID = "coordinate_root_cartesian_fiber_v1";
  const ARGUMENT_CONVENTION = "atan2_signed_zero_normalized_principal_minus_pi_to_pi";
  const ROOT_INDEX_ORDER = "ascending_integer_k";
  const MULTI_INDEX_ORDER = "lexicographic_k1_k2_k3_k4";

  class GeometricPullbackFiberError extends Error {
    constructor(message) {
      super(message);
      this.name = "GeometricPullbackFiberError";
    }
  }

  function evaluator() {
    if (typeof module !== "undefined" && module.exports) return require("./laurent-evaluator.js");
    if (!globalObject.LaurentEvaluator) throw new GeometricPullbackFiberError("LaurentEvaluator is required.");
    return globalObject.LaurentEvaluator;
  }

  function powerEvaluator() {
    if (typeof module !== "undefined" && module.exports) return require("./torus-power-evaluator.js");
    if (!globalObject.TorusPowerEvaluator) throw new GeometricPullbackFiberError("TorusPowerEvaluator is required.");
    return globalObject.TorusPowerEvaluator;
  }

  function normalizeSignedZero(value) {
    return Object.is(value, -0) ? 0 : value;
  }

  function coordinateKey(coordinates) {
    const E = evaluator();
    const z = E.validateCoordinates(coordinates);
    return z.map((entry) =>
      String(normalizeSignedZero(entry.re)) + "," + String(normalizeSignedZero(entry.im))
    ).join("|");
  }

  function validateDistinctnessTolerance(policy) {
    if (!policy || typeof policy !== "object" || Array.isArray(policy) ||
        policy.kind !== "relative_distance" ||
        typeof policy.value !== "number" || !Number.isFinite(policy.value) || policy.value <= 0) {
      throw new GeometricPullbackFiberError("rootDistinctnessTolerance must be a positive relative_distance policy.");
    }
    return policy;
  }

  function enumerateCoordinateRoots(value, D, config) {
    const E = evaluator();
    const P = powerEvaluator();
    const exponent = P.validateD(D);
    const z = E.assertComplex(value, "parent coordinate");
    if (E.abs(z) === 0) throw new GeometricPullbackFiberError("Coordinate-root enumeration requires a nonzero Torus coordinate.");
    if (!config || config.argumentConvention !== ARGUMENT_CONVENTION ||
        config.coordinateRootIndexOrder !== ROOT_INDEX_ORDER) {
      throw new GeometricPullbackFiberError("Unsupported deterministic root enumeration convention.");
    }

    const re = normalizeSignedZero(z.re);
    const im = normalizeSignedZero(z.im);
    const radius = Math.pow(Math.hypot(re, im), 1 / exponent);
    const theta = Math.atan2(im, re);
    const roots = [];
    for (let k = 0; k < exponent; k += 1) {
      const angle = (theta + 2 * Math.PI * k) / exponent;
      roots.push(Object.freeze({
        rootIndex: k,
        value: E.complex(
          normalizeSignedZero(radius * Math.cos(angle)),
          normalizeSignedZero(radius * Math.sin(angle))
        )
      }));
    }
    return Object.freeze(roots);
  }

  function validateCoordinateRootSet(parentCoordinate, D, roots, options) {
    const E = evaluator();
    const P = powerEvaluator();
    const exponent = P.validateD(D);
    const distinctness = validateDistinctnessTolerance(options.rootDistinctnessTolerance);
    if (!Array.isArray(roots) || roots.length !== exponent) {
      throw new GeometricPullbackFiberError("A complete coordinate root set must contain exactly D roots.");
    }
    for (let k = 0; k < roots.length; k += 1) {
      const entry = roots[k];
      if (!entry || entry.rootIndex !== k) {
        throw new GeometricPullbackFiberError("Coordinate roots must retain ascending deterministic root indices.");
      }
      const powered = P.powComplex(entry.value, exponent);
      const residual = E.abs(E.sub(powered, parentCoordinate));
      const scale = Math.max(1, E.abs(parentCoordinate));
      const tolerance = P.validateTolerance(options.powerResidualTolerance);
      const threshold = tolerance.absolute + tolerance.relative * scale;
      if (!Number.isFinite(residual) || residual > threshold) {
        throw new GeometricPullbackFiberError("Coordinate root fails the declared power residual tolerance.");
      }
    }
    for (let i = 0; i < roots.length; i += 1) {
      for (let j = i + 1; j < roots.length; j += 1) {
        const distance = E.abs(E.sub(roots[i].value, roots[j].value));
        const scale = Math.max(1, E.abs(roots[i].value), E.abs(roots[j].value));
        if (distance <= distinctness.value * scale) {
          throw new GeometricPullbackFiberError("Distinct theoretical roots numerically collapsed within the rejection threshold.");
        }
      }
    }
    return true;
  }

  function expectedFiberCardinality(D) {
    const exponent = powerEvaluator().validateD(D);
    const cardinality = exponent ** 4;
    if (!Number.isSafeInteger(cardinality)) {
      throw new GeometricPullbackFiberError("D^4 exceeds JavaScript safe-integer range.");
    }
    return cardinality;
  }

  function enumerateCompleteFiber(parentCoordinates, D, options) {
    const E = evaluator();
    const P = powerEvaluator();
    const exponent = P.validateD(D);
    const parent = E.validateCoordinates(parentCoordinates);
    if (!options || !options.rootEnumeration ||
        options.rootEnumeration.multiIndexOrder !== MULTI_INDEX_ORDER) {
      throw new GeometricPullbackFiberError("Fiber enumeration requires the canonical lexicographic root multi-index order.");
    }

    const rootSets = parent.map((coordinate) =>
      enumerateCoordinateRoots(coordinate, exponent, options.rootEnumeration)
    );
    for (let i = 0; i < 4; i += 1) {
      validateCoordinateRootSet(parent[i], exponent, rootSets[i], options);
    }

    const points = [];
    for (let k1 = 0; k1 < exponent; k1 += 1) {
      for (let k2 = 0; k2 < exponent; k2 += 1) {
        for (let k3 = 0; k3 < exponent; k3 += 1) {
          for (let k4 = 0; k4 < exponent; k4 += 1) {
            const rootMultiIndex = Object.freeze([k1, k2, k3, k4]);
            const coordinates = Object.freeze([
              rootSets[0][k1].value,
              rootSets[1][k2].value,
              rootSets[2][k3].value,
              rootSets[3][k4].value
            ]);
            const relation = P.powerResidualRecord(exponent, coordinates, parent, options.powerResidualTolerance);
            if (!relation.accepted) {
              throw new GeometricPullbackFiberError("Generated child does not map back to its declared parent.");
            }
            points.push(Object.freeze({ rootMultiIndex, coordinates, relation }));
          }
        }
      }
    }
    validateCompleteFiber(parent, exponent, points, options);
    return Object.freeze(points);
  }

  function validateCompleteFiber(parentCoordinates, D, points, options) {
    const P = powerEvaluator();
    const exponent = P.validateD(D);
    const expected = expectedFiberCardinality(exponent);
    if (!Array.isArray(points) || points.length !== expected) {
      throw new GeometricPullbackFiberError("Complete fiber cardinality mismatch.");
    }
    const sourceKeys = new Set();
    let flatIndex = 0;
    for (let k1 = 0; k1 < exponent; k1 += 1) {
      for (let k2 = 0; k2 < exponent; k2 += 1) {
        for (let k3 = 0; k3 < exponent; k3 += 1) {
          for (let k4 = 0; k4 < exponent; k4 += 1) {
            const point = points[flatIndex];
            const expectedTuple = [k1, k2, k3, k4];
            if (!point || !Array.isArray(point.rootMultiIndex) ||
                point.rootMultiIndex.length !== 4 ||
                point.rootMultiIndex.some((entry, i) => entry !== expectedTuple[i])) {
              throw new GeometricPullbackFiberError("Fiber point order or root multi-index is not canonical.");
            }
            const relation = P.powerResidualRecord(exponent, point.coordinates, parentCoordinates, options.powerResidualTolerance);
            if (!relation.accepted) throw new GeometricPullbackFiberError("Fiber contains a point outside the declared parent relation.");
            const key = coordinateKey(point.coordinates);
            if (sourceKeys.has(key)) throw new GeometricPullbackFiberError("Complete fiber contains duplicate full-coordinate points.");
            sourceKeys.add(key);
            flatIndex += 1;
          }
        }
      }
    }
    return Object.freeze({ expected, distinct: sourceKeys.size, complete: true });
  }

  const api = Object.freeze({
    FIBER_ENUMERATOR_ID,
    ARGUMENT_CONVENTION,
    ROOT_INDEX_ORDER,
    MULTI_INDEX_ORDER,
    GeometricPullbackFiberError,
    coordinateKey,
    enumerateCoordinateRoots,
    validateCoordinateRootSet,
    expectedFiberCardinality,
    enumerateCompleteFiber,
    validateCompleteFiber
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.GeometricPullbackFibers = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

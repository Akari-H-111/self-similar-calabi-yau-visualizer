"use strict";

(function attachBaseGeometricSampler(globalObject) {
  const SAMPLER_KIND = "deterministic_quadratic_z4_construction";
  const CONFIG_VERSION = "v0.01";

  class BaseGeometricSamplerError extends Error {
    constructor(message) {
      super(message);
      this.name = "BaseGeometricSamplerError";
    }
  }

  function evaluator() {
    if (typeof module !== "undefined" && module.exports) return require("./laurent-evaluator.js");
    if (!globalObject.LaurentEvaluator) throw new BaseGeometricSamplerError("LaurentEvaluator is required.");
    return globalObject.LaurentEvaluator;
  }

  function assertPlainObject(value, path) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new BaseGeometricSamplerError(path + " must be an object.");
    }
  }

  function assertFinitePositive(value, path, allowZero = false) {
    if (typeof value !== "number" || !Number.isFinite(value) || (allowZero ? value < 0 : value <= 0)) {
      throw new BaseGeometricSamplerError(path + " must be a finite " + (allowZero ? "nonnegative" : "positive") + " number.");
    }
  }

  function assertSafePositiveInteger(value, path) {
    if (!Number.isSafeInteger(value) || value <= 0) throw new BaseGeometricSamplerError(path + " must be a positive safe integer.");
  }

  function validateConfig(config) {
    assertPlainObject(config, "config");
    const keys = [
      "configVersion","samplerId","sourceObject","formulaId","viewId","construction","randomnessAllowed",
      "coordinateDomain","coordinateSelection","parameterTripleBudget","sampleBudget","rootOrdering",
      "doubleRootDedup","membershipTolerance"
    ].sort();
    const actual = Object.keys(config).sort();
    if (actual.length !== keys.length || actual.some((key, i) => key !== keys[i])) {
      throw new BaseGeometricSamplerError("config has an unexpected key set.");
    }
    const E = evaluator();
    if (config.configVersion !== CONFIG_VERSION) throw new BaseGeometricSamplerError("configVersion must be v0.01.");
    if (config.sourceObject !== "X_0") throw new BaseGeometricSamplerError("sourceObject must be X_0.");
    if (config.formulaId !== E.FORMULA_ID) throw new BaseGeometricSamplerError("formulaId must bind to W_kappa_torus4_v1.");
    if (config.viewId !== "x0_z1_complex_plane_sampled_projection_v1") throw new BaseGeometricSamplerError("viewId must bind to the sealed Thread 23 view.");
    if (config.construction !== "solve_z4_quadratic_from_z1_z2_z3") throw new BaseGeometricSamplerError("Unsupported sample construction.");
    if (config.randomnessAllowed !== false) throw new BaseGeometricSamplerError("Randomness is forbidden.");

    assertPlainObject(config.coordinateDomain, "config.coordinateDomain");
    if (config.coordinateDomain.kind !== "gaussian_rational_square_shells") throw new BaseGeometricSamplerError("Unsupported coordinate domain.");
    assertSafePositiveInteger(config.coordinateDomain.denominator, "config.coordinateDomain.denominator");
    assertSafePositiveInteger(config.coordinateDomain.maxShell, "config.coordinateDomain.maxShell");

    assertPlainObject(config.coordinateSelection, "config.coordinateSelection");
    for (const key of ["z1Multiplier","z1Offset","z2Multiplier","z2Offset","z3Multiplier","z3Offset"]) {
      if (!Number.isSafeInteger(config.coordinateSelection[key])) {
        throw new BaseGeometricSamplerError("config.coordinateSelection." + key + " must be a safe integer.");
      }
    }
    if (config.coordinateSelection.z1Multiplier !== 1 || config.coordinateSelection.z1Offset !== 0) {
      throw new BaseGeometricSamplerError("v0.01 requires z1 to enumerate the lattice pool in canonical order.");
    }

    assertSafePositiveInteger(config.parameterTripleBudget, "config.parameterTripleBudget");
    assertSafePositiveInteger(config.sampleBudget, "config.sampleBudget");
    if (config.sampleBudget < config.parameterTripleBudget) {
      throw new BaseGeometricSamplerError("sampleBudget must be at least parameterTripleBudget.");
    }
    if (config.rootOrdering !== "lexicographic_real_then_imag") throw new BaseGeometricSamplerError("Unsupported root ordering.");

    assertPlainObject(config.doubleRootDedup, "config.doubleRootDedup");
    if (config.doubleRootDedup.kind !== "relative_distance") throw new BaseGeometricSamplerError("Unsupported double-root dedup policy.");
    assertFinitePositive(config.doubleRootDedup.value, "config.doubleRootDedup.value");

    assertPlainObject(config.membershipTolerance, "config.membershipTolerance");
    if (config.membershipTolerance.kind !== "combined_absolute_relative") throw new BaseGeometricSamplerError("Unsupported membership tolerance kind.");
    if (config.membershipTolerance.version !== "v0.01") throw new BaseGeometricSamplerError("membership tolerance version must be v0.01.");
    assertFinitePositive(config.membershipTolerance.absolute, "config.membershipTolerance.absolute", true);
    assertFinitePositive(config.membershipTolerance.relative, "config.membershipTolerance.relative", true);
    if (config.membershipTolerance.absolute === 0 && config.membershipTolerance.relative === 0) {
      throw new BaseGeometricSamplerError("At least one membership tolerance component must be positive.");
    }
    return Object.freeze(JSON.parse(JSON.stringify(config)));
  }

  function createGaussianRationalPool(domain) {
    const E = evaluator();
    const values = [];
    for (let shell = 1; shell <= domain.maxShell; shell += 1) {
      for (let a = -shell; a <= shell; a += 1) {
        for (let b = -shell; b <= shell; b += 1) {
          if (Math.max(Math.abs(a), Math.abs(b)) !== shell) continue;
          values.push(E.complex(a / domain.denominator, b / domain.denominator));
        }
      }
    }
    if (values.length === 0) throw new BaseGeometricSamplerError("Coordinate domain produced no nonzero values.");
    return Object.freeze(values);
  }

  function positiveModulo(value, modulus) {
    const result = value % modulus;
    return result < 0 ? result + modulus : result;
  }

  function selectCoordinate(pool, multiplier, offset, index) {
    return pool[positiveModulo(multiplier * index + offset, pool.length)];
  }

  function compareComplexLexicographically(a, b) {
    if (a.re !== b.re) return a.re < b.re ? -1 : 1;
    if (a.im !== b.im) return a.im < b.im ? -1 : 1;
    return 0;
  }

  function rootsAreEquivalent(a, b, relativeTolerance) {
    const E = evaluator();
    const distance = E.abs(E.sub(a, b));
    const scale = Math.max(1, E.abs(a), E.abs(b));
    return distance <= relativeTolerance * scale;
  }

  function solveZ4Quadratic(context, z1, z2, z3, config) {
    const E = evaluator();
    const sum123 = E.add(E.add(z1, z2), z3);
    const mu = E.sub(context.lambda, sum123);
    const product123 = E.mul(E.mul(z1, z2), z3);
    const c = E.div(context.kappa, product123);
    const discriminant = E.sub(E.mul(mu, mu), E.scale(c, 4));
    const sqrtDiscriminant = E.sqrtPrincipal(discriminant);
    const roots = [
      E.scale(E.add(mu, sqrtDiscriminant), 0.5),
      E.scale(E.sub(mu, sqrtDiscriminant), 0.5)
    ].sort(compareComplexLexicographically);
    if (rootsAreEquivalent(roots[0], roots[1], config.doubleRootDedup.value)) return Object.freeze([roots[0]]);
    return Object.freeze(roots);
  }

  function membershipThreshold(residualRecord, tolerance) {
    return tolerance.absolute + tolerance.relative * residualRecord.scaleEstimate;
  }

  function validateMembership(context, coordinates, config) {
    const E = evaluator();
    try {
      const record = E.evaluateResidual(context, coordinates);
      const threshold = membershipThreshold(record, config.membershipTolerance);
      return Object.freeze({
        accepted: Number.isFinite(record.residualMagnitude) && record.residualMagnitude <= threshold,
        residualMagnitude: record.residualMagnitude,
        threshold,
        scaleEstimate: record.scaleEstimate
      });
    } catch (error) {
      return Object.freeze({
        accepted: false,
        residualMagnitude: Number.POSITIVE_INFINITY,
        threshold: 0,
        scaleEstimate: Number.POSITIVE_INFINITY,
        error: error.message
      });
    }
  }

  function cloneCoordinates(coordinates) {
    const E = evaluator();
    return Object.freeze(coordinates.map((z) => E.complex(z.re, z.im)));
  }

  function generateSamples(scene, rawConfig) {
    const E = evaluator();
    const config = validateConfig(rawConfig);
    const context = E.createEvaluationContext(scene);
    if (context.formulaId !== config.formulaId) throw new BaseGeometricSamplerError("Sampler/config formula provenance mismatch.");
    const pool = createGaussianRationalPool(config.coordinateDomain);
    const tripleCount = Math.min(config.parameterTripleBudget, pool.length);
    const samples = [];
    let rejectedZero = 0;
    let rejectedResidual = 0;
    let doubleRootPairs = 0;
    let maxResidualMagnitude = 0;

    for (let parameterIndex = 0; parameterIndex < tripleCount && samples.length < config.sampleBudget; parameterIndex += 1) {
      const s = config.coordinateSelection;
      const z1 = selectCoordinate(pool, s.z1Multiplier, s.z1Offset, parameterIndex);
      const z2 = selectCoordinate(pool, s.z2Multiplier, s.z2Offset, parameterIndex);
      const z3 = selectCoordinate(pool, s.z3Multiplier, s.z3Offset, parameterIndex);
      const roots = solveZ4Quadratic(context, z1, z2, z3, config);
      if (roots.length === 1) doubleRootPairs += 1;

      for (let rootIndex = 0; rootIndex < roots.length && samples.length < config.sampleBudget; rootIndex += 1) {
        const z4 = roots[rootIndex];
        if (E.abs(z4) === 0) {
          rejectedZero += 1;
          continue;
        }
        const coordinates = cloneCoordinates([z1, z2, z3, z4]);
        const membership = validateMembership(context, coordinates, config);
        if (!membership.accepted) {
          rejectedResidual += 1;
          continue;
        }
        maxResidualMagnitude = Math.max(maxResidualMagnitude, membership.residualMagnitude);
        samples.push(Object.freeze({
          sampleId: "x0-p" + String(parameterIndex).padStart(4, "0") + "-r" + String(rootIndex),
          sourceObject: "X_0",
          formulaId: config.formulaId,
          parameterIndex,
          rootIndex,
          construction: config.construction,
          coordinates,
          membership
        }));
      }
    }

    return Object.freeze({
      kind: "ordered_finite_validated_subset",
      samplerKind: SAMPLER_KIND,
      samplerId: config.samplerId,
      configVersion: config.configVersion,
      sourceObject: config.sourceObject,
      formulaId: config.formulaId,
      viewId: config.viewId,
      randomnessAllowed: false,
      parameterTripleBudget: config.parameterTripleBudget,
      sampleBudget: config.sampleBudget,
      coordinatePoolSize: pool.length,
      attemptedParameterTriples: tripleCount,
      sampleCount: samples.length,
      samples: Object.freeze(samples),
      rejectionSummary: Object.freeze({ rejectedZero, rejectedResidual, doubleRootPairs }),
      membershipTolerance: config.membershipTolerance,
      maxResidualMagnitude,
      empty: samples.length === 0,
      completenessClaim: false
    });
  }

  const api = Object.freeze({
    SAMPLER_KIND,
    CONFIG_VERSION,
    BaseGeometricSamplerError,
    validateConfig,
    createGaussianRationalPool,
    solveZ4Quadratic,
    validateMembership,
    generateSamples
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.BaseGeometricSampler = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

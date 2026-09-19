"use strict";

(function attachProjectionSliceSemantics(globalObject) {
  const CONTRACT_VERSION = 1;
  const DESCRIPTOR_VERSION = "v0.01";
  const VIEW_ID = "x0_z1_complex_plane_sampled_projection_v1";
  const VIEW_KIND = "sampled_projection";
  const SOURCE_OBJECT = "X_0";
  const FORMULA_ID = "W_kappa_torus4_v1";

  class ProjectionSliceSemanticsError extends Error {
    constructor(message) {
      super(message);
      this.name = "ProjectionSliceSemanticsError";
    }
  }

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function assertPlainObject(value, path) {
    if (!isPlainObject(value)) {
      throw new ProjectionSliceSemanticsError(path + " must be an object.");
    }
  }

  function assertExactKeys(value, expectedKeys, path) {
    const actual = Object.keys(value).sort();
    const expected = [...expectedKeys].sort();
    if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
      throw new ProjectionSliceSemanticsError(path + " must contain exactly: " + expected.join(", ") + ".");
    }
  }

  function assertExactArray(value, expected, path) {
    if (!Array.isArray(value) || value.length !== expected.length ||
        value.some((entry, index) => entry !== expected[index])) {
      throw new ProjectionSliceSemanticsError(path + " must equal " + JSON.stringify(expected) + ".");
    }
  }

  function assertEmptyArray(value, path) {
    if (!Array.isArray(value) || value.length !== 0) {
      throw new ProjectionSliceSemanticsError(path + " must be an empty array.");
    }
  }

  function deepFreeze(value) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const child of Object.values(value)) deepFreeze(child);
    }
    return value;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function concreteRuntimeSchema() {
    if (typeof module !== "undefined" && module.exports) {
      return require("./concrete-runtime-schema.js");
    }
    if (!globalObject.ConcreteRuntimeSchema) {
      throw new ProjectionSliceSemanticsError("ConcreteRuntimeSchema is required to bind a view to schema v2.");
    }
    return globalObject.ConcreteRuntimeSchema;
  }

  function validateViewDescriptor(view) {
    assertPlainObject(view, "view");
    assertExactKeys(
      view,
      [
        "contractVersion",
        "descriptorVersion",
        "viewId",
        "viewKind",
        "sourceObject",
        "sourceDomain",
        "parameterBoundary",
        "display",
        "projection",
        "slice",
        "sampleSemantics",
        "ambiguity",
        "artifactPolicy",
        "uiWording",
        "truthFlags"
      ],
      "view"
    );

    if (view.contractVersion !== CONTRACT_VERSION) {
      throw new ProjectionSliceSemanticsError("view.contractVersion must be 1.");
    }
    if (view.descriptorVersion !== DESCRIPTOR_VERSION) {
      throw new ProjectionSliceSemanticsError("view.descriptorVersion must be v0.01.");
    }
    if (view.viewId !== VIEW_ID) {
      throw new ProjectionSliceSemanticsError("view.viewId must be " + VIEW_ID + ".");
    }
    if (view.viewKind !== VIEW_KIND) {
      throw new ProjectionSliceSemanticsError("view.viewKind must be sampled_projection.");
    }
    if (view.sourceObject !== SOURCE_OBJECT) {
      throw new ProjectionSliceSemanticsError("view.sourceObject must be X_0.");
    }

    assertPlainObject(view.sourceDomain, "view.sourceDomain");
    assertExactKeys(
      view.sourceDomain,
      ["ambientKind", "coordinateCount", "baseField", "formulaId", "levelParameter"],
      "view.sourceDomain"
    );
    if (view.sourceDomain.ambientKind !== "algebraic_torus" ||
        view.sourceDomain.coordinateCount !== 4 ||
        view.sourceDomain.baseField !== "complex" ||
        view.sourceDomain.formulaId !== FORMULA_ID ||
        view.sourceDomain.levelParameter !== "lambda") {
      throw new ProjectionSliceSemanticsError("view.sourceDomain must identify the admitted Torus4 W_kappa level set.");
    }

    assertPlainObject(view.parameterBoundary, "view.parameterBoundary");
    assertExactKeys(
      view.parameterBoundary,
      ["appliesTo", "sourceField", "runtimeRepresentation", "embedding", "ambientCoordinatesRestrictedToReal"],
      "view.parameterBoundary"
    );
    assertExactArray(view.parameterBoundary.appliesTo, ["lambda", "kappa"], "view.parameterBoundary.appliesTo");
    if (view.parameterBoundary.sourceField !== "complex" ||
        view.parameterBoundary.runtimeRepresentation !== "real_slice" ||
        view.parameterBoundary.embedding !== "real_to_complex") {
      throw new ProjectionSliceSemanticsError("view.parameterBoundary must preserve the Gate 2-D parameter real-slice policy.");
    }
    if (view.parameterBoundary.ambientCoordinatesRestrictedToReal !== false) {
      throw new ProjectionSliceSemanticsError("Parameter real_slice must not be promoted to a real ambient-coordinate locus.");
    }

    assertPlainObject(view.display, "view.display");
    assertExactKeys(view.display, ["dimension", "codomain", "coordinateOrder"], "view.display");
    if (view.display.dimension !== 2 || view.display.codomain !== "R^2") {
      throw new ProjectionSliceSemanticsError("view.display must target R^2 with display dimension 2.");
    }
    assertExactArray(view.display.coordinateOrder, ["x", "y"], "view.display.coordinateOrder");

    assertPlainObject(view.projection, "view.projection");
    assertExactKeys(
      view.projection,
      [
        "kind",
        "sourceCoordinate",
        "sourceIndex",
        "complexToRealMap",
        "informationDiscarded",
        "injectiveClaim",
        "branchConvention",
        "periodicity"
      ],
      "view.projection"
    );
    if (view.projection.kind !== "complex_coordinate_cartesian" ||
        view.projection.sourceCoordinate !== "z1" ||
        view.projection.sourceIndex !== 0) {
      throw new ProjectionSliceSemanticsError("The canonical projection must use coordinate z1 at source index 0.");
    }
    if (!Array.isArray(view.projection.complexToRealMap) || view.projection.complexToRealMap.length !== 2) {
      throw new ProjectionSliceSemanticsError("view.projection.complexToRealMap must define exactly two display coordinates.");
    }
    const xMap = view.projection.complexToRealMap[0];
    const yMap = view.projection.complexToRealMap[1];
    assertPlainObject(xMap, "view.projection.complexToRealMap[0]");
    assertPlainObject(yMap, "view.projection.complexToRealMap[1]");
    assertExactKeys(xMap, ["displayCoordinate", "component", "expression"], "view.projection.complexToRealMap[0]");
    assertExactKeys(yMap, ["displayCoordinate", "component", "expression"], "view.projection.complexToRealMap[1]");
    if (xMap.displayCoordinate !== "x" || xMap.component !== "real_part" || xMap.expression !== "Re(z1)" ||
        yMap.displayCoordinate !== "y" || yMap.component !== "imaginary_part" || yMap.expression !== "Im(z1)") {
      throw new ProjectionSliceSemanticsError("The complex-to-real map must be x=Re(z1), y=Im(z1).");
    }
    assertExactArray(view.projection.informationDiscarded, ["z2", "z3", "z4"], "view.projection.informationDiscarded");
    if (view.projection.injectiveClaim !== false) {
      throw new ProjectionSliceSemanticsError("The projection must not claim injectivity.");
    }
    if (view.projection.branchConvention !== "none" || view.projection.periodicity !== "none") {
      throw new ProjectionSliceSemanticsError("The selected Cartesian complex-coordinate projection has no branch or periodicity convention.");
    }

    assertPlainObject(view.slice, "view.slice");
    assertExactKeys(view.slice, ["kind", "constraints", "fixedCoordinates"], "view.slice");
    if (view.slice.kind !== "none") {
      throw new ProjectionSliceSemanticsError("The canonical v0.01 view is a projection, not a slice.");
    }
    assertEmptyArray(view.slice.constraints, "view.slice.constraints");
    assertEmptyArray(view.slice.fixedCoordinates, "view.slice.fixedCoordinates");

    assertPlainObject(view.sampleSemantics, "view.sampleSemantics");
    assertExactKeys(
      view.sampleSemantics,
      [
        "kind",
        "sourceMembership",
        "generationImplementation",
        "requiredFutureGenerationPolicy",
        "randomnessAllowed",
        "seedPolicy",
        "tolerancePolicy",
        "completenessClaim"
      ],
      "view.sampleSemantics"
    );
    if (view.sampleSemantics.kind !== "ordered_finite_validated_subset" ||
        view.sampleSemantics.sourceMembership !== "z in X_0") {
      throw new ProjectionSliceSemanticsError("Samples must be an ordered finite validated subset of X_0.");
    }
    if (view.sampleSemantics.generationImplementation !== "not_implemented_in_thread23") {
      throw new ProjectionSliceSemanticsError("Thread 23 must not claim an implemented sample generator.");
    }
    if (view.sampleSemantics.requiredFutureGenerationPolicy !== "deterministic_no_randomness" ||
        view.sampleSemantics.randomnessAllowed !== false ||
        view.sampleSemantics.seedPolicy !== "not_applicable") {
      throw new ProjectionSliceSemanticsError("Future sample generation must be deterministic and non-random under v0.01.");
    }
    if (view.sampleSemantics.tolerancePolicy !== "must_be_explicitly_versioned_if_numeric_membership_is_introduced") {
      throw new ProjectionSliceSemanticsError("A future numeric membership tolerance must be explicit and versioned.");
    }
    if (view.sampleSemantics.completenessClaim !== false) {
      throw new ProjectionSliceSemanticsError("A finite sample must not claim completeness.");
    }

    assertPlainObject(view.ambiguity, "view.ambiguity");
    assertExactKeys(view.ambiguity, ["manyToOnePossible", "projectionOverlapImpliesSourceSelfIntersection"], "view.ambiguity");
    if (view.ambiguity.manyToOnePossible !== true ||
        view.ambiguity.projectionOverlapImpliesSourceSelfIntersection !== false) {
      throw new ProjectionSliceSemanticsError("Projection ambiguity must be explicit and overlap must not imply source self-intersection.");
    }

    assertPlainObject(view.artifactPolicy, "view.artifactPolicy");
    assertExactKeys(
      view.artifactPolicy,
      [
        "sourceSingularity",
        "sliceSingularity",
        "projectionCriticalValue",
        "projectionOverlap",
        "displayOcclusion",
        "samplingArtifact",
        "branchCutArtifact",
        "numericalApproximationArtifact"
      ],
      "view.artifactPolicy"
    );
    const artifactExpected = {
      sourceSingularity: "source_geometry_only_if_independently_established",
      sliceSingularity: "not_applicable_for_selected_no_slice_route",
      projectionCriticalValue: "projection_artifact_unless_independently_lifted",
      projectionOverlap: "projection_artifact",
      displayOcclusion: "presentation_artifact",
      samplingArtifact: "sampling_artifact",
      branchCutArtifact: "not_applicable_selected_route_has_no_branch",
      numericalApproximationArtifact: "numerical_artifact"
    };
    for (const [key, expected] of Object.entries(artifactExpected)) {
      if (view.artifactPolicy[key] !== expected) {
        throw new ProjectionSliceSemanticsError("view.artifactPolicy." + key + " must equal " + expected + ".");
      }
    }

    assertPlainObject(view.uiWording, "view.uiWording");
    assertExactKeys(view.uiWording, ["requiredLabel", "pointMeaning", "fullGeometryClaimAllowed"], "view.uiWording");
    if (view.uiWording.requiredLabel !== "Sampled projection of X_0 onto the z_1 complex plane" ||
        view.uiWording.pointMeaning !== "Each displayed point is (Re(z_1), Im(z_1)) for one validated finite sample z in X_0." ||
        view.uiWording.fullGeometryClaimAllowed !== false) {
      throw new ProjectionSliceSemanticsError("UI wording must preserve sampled-projection semantics and forbid a full-geometry claim.");
    }

    assertPlainObject(view.truthFlags, "view.truthFlags");
    assertExactKeys(
      view.truthFlags,
      ["geometryRendered", "sheetsMaterialized", "coveringStructureClaimed", "geometricZoomApplied"],
      "view.truthFlags"
    );
    for (const key of ["geometryRendered", "sheetsMaterialized", "coveringStructureClaimed", "geometricZoomApplied"]) {
      if (view.truthFlags[key] !== false) {
        throw new ProjectionSliceSemanticsError("view.truthFlags." + key + " must remain false in Thread 23.");
      }
    }

    return deepFreeze(clone(view));
  }

  function validateViewAgainstScene(view, scene) {
    const validatedView = validateViewDescriptor(view);
    const Runtime = concreteRuntimeSchema();
    const normalizedScene = Runtime.validateAndNormalizeV2(scene);

    if (normalizedScene.mathematics.ambient.kind !== validatedView.sourceDomain.ambientKind ||
        normalizedScene.mathematics.ambient.coordinateCount !== validatedView.sourceDomain.coordinateCount ||
        normalizedScene.mathematics.ambient.baseField !== validatedView.sourceDomain.baseField) {
      throw new ProjectionSliceSemanticsError("View source ambient does not match the admitted schema v2 scene.");
    }

    const representation = normalizedScene.mathematics.baseHypersurface.definingFunction.representation;
    if (representation.formulaId !== validatedView.sourceDomain.formulaId ||
        normalizedScene.mathematics.baseHypersurface.levelParameter !== validatedView.sourceDomain.levelParameter) {
      throw new ProjectionSliceSemanticsError("View source fiber does not match the admitted W_kappa/lambda schema v2 scene.");
    }

    const parameterDomain = normalizedScene.mathematics.parameterDomain;
    if (parameterDomain.sourceField !== validatedView.parameterBoundary.sourceField ||
        parameterDomain.runtimeRepresentation !== validatedView.parameterBoundary.runtimeRepresentation ||
        parameterDomain.embedding !== validatedView.parameterBoundary.embedding) {
      throw new ProjectionSliceSemanticsError("View parameter boundary does not match the admitted schema v2 scene.");
    }

    return deepFreeze({
      view: validatedView,
      scene: normalizedScene,
      semanticMapping: "ordered finite validated X_0 samples -> (Re(z1), Im(z1)) in R^2"
    });
  }

  const api = Object.freeze({
    CONTRACT_VERSION,
    DESCRIPTOR_VERSION,
    VIEW_ID,
    VIEW_KIND,
    SOURCE_OBJECT,
    FORMULA_ID,
    ProjectionSliceSemanticsError,
    validateViewDescriptor,
    validateViewAgainstScene
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  globalObject.ProjectionSliceSemantics = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

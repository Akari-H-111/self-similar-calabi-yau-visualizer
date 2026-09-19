"use strict";

(function attachGeometricPullbackViewSemantics(globalObject) {
  const CONTRACT_VERSION = 1;
  const DESCRIPTOR_VERSION = "v0.01";
  const VIEW_ID = "xn_z1_complex_plane_sampled_pullback_projection_v1";
  const VIEW_KIND = "finite_sampled_pullback_projection";

  class GeometricPullbackViewSemanticsError extends Error {
    constructor(message) {
      super(message);
      this.name = "GeometricPullbackViewSemanticsError";
    }
  }

  function baseProjectionSemantics() {
    if (typeof module !== "undefined" && module.exports) return require("./projection-slice-semantics.js");
    if (!globalObject.ProjectionSliceSemantics) throw new GeometricPullbackViewSemanticsError("ProjectionSliceSemantics is required.");
    return globalObject.ProjectionSliceSemantics;
  }

  function assertObject(value, path) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new GeometricPullbackViewSemanticsError(path + " must be an object.");
    }
  }

  function exactKeys(value, expected, path) {
    const a = Object.keys(value).sort(), e = [...expected].sort();
    if (a.length !== e.length || a.some((key, index) => key !== e[index])) {
      throw new GeometricPullbackViewSemanticsError(path + " has an unexpected key set.");
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function sourceObjectForDepth(depth) {
    if (!Number.isSafeInteger(depth) || depth < 0) throw new GeometricPullbackViewSemanticsError("depth must be a nonnegative safe integer.");
    return "X_" + String(depth);
  }

  function validateDescriptor(view) {
    assertObject(view, "view");
    exactKeys(view, [
      "contractVersion","descriptorVersion","viewId","viewKind","sourceObjectPolicy",
      "inheritedProjectionFrom","projection","sampleSemantics","ambiguity","uiWording","truthFlags"
    ], "view");
    if (view.contractVersion !== CONTRACT_VERSION || view.descriptorVersion !== DESCRIPTOR_VERSION ||
        view.viewId !== VIEW_ID || view.viewKind !== VIEW_KIND) {
      throw new GeometricPullbackViewSemanticsError("Unsupported Thread 25 view descriptor.");
    }
    assertObject(view.sourceObjectPolicy, "view.sourceObjectPolicy");
    exactKeys(view.sourceObjectPolicy, ["kind","pattern","depthZero","positiveDepth"], "view.sourceObjectPolicy");
    if (view.sourceObjectPolicy.kind !== "geometric_depth_indexed" ||
        view.sourceObjectPolicy.pattern !== "X_n" ||
        view.sourceObjectPolicy.depthZero !== "X_0" ||
        view.sourceObjectPolicy.positiveDepth !== "X_n") {
      throw new GeometricPullbackViewSemanticsError("Source object policy must remain depth-indexed X_n.");
    }
    if (view.inheritedProjectionFrom !== "x0_z1_complex_plane_sampled_projection_v1") {
      throw new GeometricPullbackViewSemanticsError("Thread 25 must inherit the sealed Thread 23 z1 projection rule.");
    }
    assertObject(view.projection, "view.projection");
    exactKeys(view.projection, ["kind","sourceCoordinate","sourceIndex","mapping","informationDiscarded","injectiveClaim"], "view.projection");
    if (view.projection.kind !== "complex_coordinate_cartesian" ||
        view.projection.sourceCoordinate !== "z1" ||
        view.projection.sourceIndex !== 0 ||
        view.projection.mapping !== "(Re(z1), Im(z1))" ||
        JSON.stringify(view.projection.informationDiscarded) !== JSON.stringify(["z2","z3","z4"]) ||
        view.projection.injectiveClaim !== false) {
      throw new GeometricPullbackViewSemanticsError("Thread 25 projection must be exactly (Re(z1), Im(z1)).");
    }
    assertObject(view.sampleSemantics, "view.sampleSemantics");
    exactKeys(view.sampleSemantics, [
      "kind","inducedFrom","fiberCompleteness","sourceManifoldCompletenessClaim",
      "rootTupleMeaning","sheetIdentityClaim","projectionOverlapMeaning"
    ], "view.sampleSemantics");
    if (view.sampleSemantics.kind !== "finite_geometric_pullback_induced_from_admitted_x0_sample" ||
        view.sampleSemantics.inducedFrom !== "Thread24 ordered finite validated X_0 sample" ||
        view.sampleSemantics.fiberCompleteness !== "complete_over_each_materialized_parent" ||
        view.sampleSemantics.sourceManifoldCompletenessClaim !== false ||
        view.sampleSemantics.rootTupleMeaning !== "deterministic_fiber_enumeration_index_only" ||
        view.sampleSemantics.sheetIdentityClaim !== false ||
        view.sampleSemantics.projectionOverlapMeaning !== "projected_pullback_point_overlap_count_only") {
      throw new GeometricPullbackViewSemanticsError("Thread 25 sample semantics exceed or differ from the admitted finite-pullback scope.");
    }
    assertObject(view.ambiguity, "view.ambiguity");
    exactKeys(view.ambiguity, ["manyToOnePossible","overlapImpliesSourceSelfIntersection","overlapImpliesCoveringMultiplicity"], "view.ambiguity");
    if (view.ambiguity.manyToOnePossible !== true ||
        view.ambiguity.overlapImpliesSourceSelfIntersection !== false ||
        view.ambiguity.overlapImpliesCoveringMultiplicity !== false) {
      throw new GeometricPullbackViewSemanticsError("Projection overlap semantics must remain non-geometric.");
    }
    assertObject(view.uiWording, "view.uiWording");
    exactKeys(view.uiWording, ["depthZeroLabel","positiveDepthLabelTemplate","pointMeaning","fullGeometryClaimAllowed"], "view.uiWording");
    if (view.uiWording.fullGeometryClaimAllowed !== false) {
      throw new GeometricPullbackViewSemanticsError("Full X_n geometry claims are forbidden.");
    }
    assertObject(view.truthFlags, "view.truthFlags");
    exactKeys(view.truthFlags, ["geometryRendered","pullbackGeometryRendered","sheetsMaterialized","coveringStructureClaimed","geometricZoomApplied"], "view.truthFlags");
    if (view.truthFlags.geometryRendered !== true ||
        view.truthFlags.pullbackGeometryRendered !== true ||
        view.truthFlags.sheetsMaterialized !== false ||
        view.truthFlags.coveringStructureClaimed !== false ||
        view.truthFlags.geometricZoomApplied !== false) {
      throw new GeometricPullbackViewSemanticsError("Thread 25 view truth flags are invalid.");
    }
    return Object.freeze(clone(view));
  }

  function validateAgainstBaseView(view, baseView, scene, depth) {
    const validated = validateDescriptor(view);
    const binding = baseProjectionSemantics().validateViewAgainstScene(baseView, scene);
    const inherited = binding.view.projection;
    if (inherited.sourceCoordinate !== validated.projection.sourceCoordinate ||
        inherited.sourceIndex !== validated.projection.sourceIndex ||
        inherited.complexToRealMap[0].expression !== "Re(z1)" ||
        inherited.complexToRealMap[1].expression !== "Im(z1)") {
      throw new GeometricPullbackViewSemanticsError("Thread 25 projection drifted from the sealed Thread 23 rule.");
    }
    return Object.freeze({
      view: validated,
      sourceObject: sourceObjectForDepth(depth),
      depth,
      semanticMapping: sourceObjectForDepth(depth) + " finite pullback points -> (Re(z1), Im(z1)) in R^2"
    });
  }

  const api = Object.freeze({
    CONTRACT_VERSION,
    DESCRIPTOR_VERSION,
    VIEW_ID,
    VIEW_KIND,
    GeometricPullbackViewSemanticsError,
    sourceObjectForDepth,
    validateDescriptor,
    validateAgainstBaseView
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.GeometricPullbackViewSemantics = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

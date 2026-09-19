"use strict";

(function attachHybridNavigationSemantics(globalObject) {
  const CONTRACT_VERSION = 1;
  const DESCRIPTOR_VERSION = "v0.01";
  const NAVIGATION_ID = "hybrid_structural_geometric_navigation_v1";
  const MODES = Object.freeze(["structural", "geometric"]);
  const CLASS_A = "A_canonical_mathematical_correspondence";
  const CLASS_B = "B_deterministic_implementation_correspondence";
  const CLASS_C = "C_presentation_ui_only_correspondence";
  const CLASS_D = "D_unsupported_forbidden_correspondence";

  class HybridNavigationError extends Error {
    constructor(message) {
      super(message);
      this.name = "HybridNavigationError";
    }
  }

  function assertObject(value, path) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new HybridNavigationError(path + " must be an object.");
    }
  }

  function exactKeys(value, expected, path) {
    const actual = Object.keys(value).sort();
    const target = [...expected].sort();
    if (actual.length !== target.length || actual.some((key, index) => key !== target[index])) {
      throw new HybridNavigationError(path + " has an unexpected key set.");
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function assertDepth(value, path) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new HybridNavigationError(path + " must be a nonnegative safe integer.");
    }
    return value;
  }

  function parseDepth(value, path) {
    if (typeof value === "number") return assertDepth(value, path);
    if (typeof value !== "string" || value.trim() === "") {
      throw new HybridNavigationError(path + " must encode a nonnegative safe integer.");
    }
    return assertDepth(Number(value), path);
  }

  function assertMode(mode) {
    if (!MODES.includes(mode)) throw new HybridNavigationError("Unsupported representation mode: " + String(mode));
    return mode;
  }

  function validateConfig(config) {
    assertObject(config, "config");
    exactKeys(config, [
      "contractVersion", "descriptorVersion", "navigationId", "defaultRepresentationMode",
      "representationModes", "correspondenceClasses", "policies", "truthFlags"
    ], "config");
    if (config.contractVersion !== CONTRACT_VERSION || config.descriptorVersion !== DESCRIPTOR_VERSION ||
        config.navigationId !== NAVIGATION_ID) {
      throw new HybridNavigationError("Unsupported Thread 26 hybrid navigation descriptor.");
    }
    if (JSON.stringify(config.representationModes) !== JSON.stringify(MODES)) {
      throw new HybridNavigationError("Representation modes must be exactly structural/geometric.");
    }
    assertMode(config.defaultRepresentationMode);
    assertObject(config.correspondenceClasses, "config.correspondenceClasses");
    exactKeys(config.correspondenceClasses, ["A", "B", "C", "D"], "config.correspondenceClasses");
    if (config.correspondenceClasses.A !== CLASS_A || config.correspondenceClasses.B !== CLASS_B ||
        config.correspondenceClasses.C !== CLASS_C || config.correspondenceClasses.D !== CLASS_D) {
      throw new HybridNavigationError("Correspondence class labels drifted from the Thread 26 contract.");
    }
    assertObject(config.policies, "config.policies");
    exactKeys(config.policies, [
      "structuralDepthControlsGeometricDepth", "geometricDepthControlsStructuralDepth",
      "modeSwitchTriggersGeometricGeneration", "projectedLocationDefinesSourceIdentity",
      "structuralNodeDefinesGeometricPoint", "rootTupleDefinesSheetIdentity"
    ], "config.policies");
    for (const value of Object.values(config.policies)) {
      if (value !== false) throw new HybridNavigationError("Thread 26 policy flags must remain false.");
    }
    assertObject(config.truthFlags, "config.truthFlags");
    exactKeys(config.truthFlags, ["sheetsMaterialized", "coveringStructureClaimed", "geometricZoomApplied"], "config.truthFlags");
    if (config.truthFlags.sheetsMaterialized !== false || config.truthFlags.coveringStructureClaimed !== false ||
        config.truthFlags.geometricZoomApplied !== false) {
      throw new HybridNavigationError("Thread 26 truth flags exceed the admitted scope.");
    }
    return Object.freeze(clone(config));
  }

  function createStructuralSnapshot(raw) {
    assertObject(raw, "structural snapshot");
    const requestedDepth = parseDepth(raw.requestedDepth, "structural.requestedDepth");
    const materializedDepth = parseDepth(raw.materializedDepth, "structural.materializedDepth");
    const selectedDepth = parseDepth(raw.selectedDepth, "structural.selectedDepth");
    const focusedDepth = parseDepth(raw.focusedDepth, "structural.focusedDepth");
    const visibleDepth = parseDepth(raw.visibleDepth, "structural.visibleDepth");
    if (materializedDepth > requestedDepth || selectedDepth > materializedDepth || focusedDepth > materializedDepth || visibleDepth > materializedDepth) {
      throw new HybridNavigationError("Structural depth snapshot is internally inconsistent.");
    }
    return Object.freeze({
      representation: "structural",
      requestedDepth,
      materializedDepth,
      selectedDepth,
      focusedDepth,
      visibleDepth,
      selectedStructuralObject: Object.freeze({kind: "structural_level_descriptor", depth: selectedDepth}),
      geometryRendered: false
    });
  }

  function createGeometricSnapshot(raw) {
    assertObject(raw, "geometric snapshot");
    const renderedDepth = parseDepth(raw.renderedDepth, "geometric.renderedDepth");
    if (!Array.isArray(raw.availableDepths) || raw.availableDepths.length === 0) {
      throw new HybridNavigationError("geometric.availableDepths must be a nonempty array.");
    }
    const availableDepths = raw.availableDepths.map((depth, index) => parseDepth(depth, "geometric.availableDepths[" + String(index) + "]"));
    if (new Set(availableDepths).size !== availableDepths.length || !availableDepths.includes(renderedDepth)) {
      throw new HybridNavigationError("Geometric depth availability is inconsistent.");
    }
    if (typeof raw.sourceObject !== "string" || raw.sourceObject !== "X_" + String(renderedDepth)) {
      throw new HybridNavigationError("Geometric source object must match rendered depth.");
    }
    if (!Number.isSafeInteger(raw.pointCount) || raw.pointCount < 0) {
      throw new HybridNavigationError("geometric.pointCount must be a nonnegative safe integer.");
    }
    if (typeof raw.viewId !== "string" || raw.viewId.length === 0 || raw.projectionMapping !== "(Re(z1), Im(z1))") {
      throw new HybridNavigationError("Geometric projection provenance is invalid.");
    }
    if (raw.geometryRendered !== true || raw.sheetsMaterialized !== false || raw.coveringStructureClaimed !== false || raw.geometricZoomApplied !== false) {
      throw new HybridNavigationError("Geometric truth snapshot exceeds Thread 25 scope.");
    }
    return Object.freeze({
      representation: "geometric",
      renderedDepth,
      availableDepths: Object.freeze([...availableDepths].sort((a, b) => a - b)),
      sourceObject: raw.sourceObject,
      pointCount: raw.pointCount,
      viewId: raw.viewId,
      projectionMapping: raw.projectionMapping,
      geometryRendered: true,
      sheetsMaterialized: false,
      coveringStructureClaimed: false,
      geometricZoomApplied: false
    });
  }

  function createGeometricSelection(raw, geometricSnapshot) {
    if (raw === null) return null;
    assertObject(raw, "geometric selection");
    const depth = parseDepth(raw.depth, "geometric selection depth");
    if (depth !== geometricSnapshot.renderedDepth) {
      throw new HybridNavigationError("Selected geometric point must belong to the currently rendered geometric depth.");
    }
    for (const key of ["pointId", "ancestorSampleId"]) {
      if (typeof raw[key] !== "string" || raw[key].length === 0) throw new HybridNavigationError("geometric selection " + key + " is required.");
    }
    const parentId = raw.parentId === null || raw.parentId === "" ? null : raw.parentId;
    if (parentId !== null && typeof parentId !== "string") throw new HybridNavigationError("geometric selection parentId is invalid.");
    const rootMultiIndex = raw.rootMultiIndex === null ? null : raw.rootMultiIndex;
    if (rootMultiIndex !== null && (!Array.isArray(rootMultiIndex) || rootMultiIndex.some((value) => !Number.isSafeInteger(value) || value < 0))) {
      throw new HybridNavigationError("geometric selection rootMultiIndex is invalid.");
    }
    if (!Number.isSafeInteger(raw.projectedOverlapCount) || raw.projectedOverlapCount < 1) {
      throw new HybridNavigationError("geometric selection projectedOverlapCount must be a positive safe integer.");
    }
    return Object.freeze({
      kind: "finite_geometric_point",
      pointId: raw.pointId,
      depth,
      parentId,
      ancestorSampleId: raw.ancestorSampleId,
      rootMultiIndex: rootMultiIndex === null ? null : Object.freeze([...rootMultiIndex]),
      projectedOverlapCount: raw.projectedOverlapCount,
      canonicalStructuralCorrespondence: null,
      correspondenceClass: CLASS_D
    });
  }

  function createStageCorrespondence(structuralDepth, geometricSnapshot) {
    assertDepth(structuralDepth, "stage structuralDepth");
    const available = geometricSnapshot.availableDepths.includes(structuralDepth);
    return Object.freeze({
      class: available ? CLASS_A : CLASS_D,
      kind: available ? "tower_stage_index" : "geometric_stage_not_materialized",
      supported: available,
      depth: structuralDepth,
      structuralReference: "structural level descriptor X_" + String(structuralDepth),
      geometricReference: available ? "finite sampled geometric view of X_" + String(structuralDepth) : null,
      sourceObjectIdentityClaim: false,
      message: available
        ? "Canonical correspondence is limited to the shared tower-stage index X_" + String(structuralDepth) + "; no structural node is identified with a geometric point."
        : "No materialized geometric stage is available for structural depth " + String(structuralDepth) + "."
    });
  }

  function createObjectIdentityBoundary() {
    return Object.freeze({
      class: CLASS_D,
      supported: false,
      structuralNodeEqualsGeometricPoint: false,
      structuralBranchEqualsRootTuple: false,
      rootTupleEqualsSheet: false,
      projectedLocationDefinesSourceIdentity: false,
      message: "No canonical structural-object / geometric-point identity exists in Thread 26."
    });
  }

  function createHybridNavigationState(config, structuralSnapshot, geometricSnapshot, options = {}) {
    const validated = validateConfig(config);
    if (!structuralSnapshot || structuralSnapshot.representation !== "structural") throw new HybridNavigationError("A structural snapshot is required.");
    if (!geometricSnapshot || geometricSnapshot.representation !== "geometric") throw new HybridNavigationError("A geometric snapshot is required.");
    const representationMode = assertMode(options.representationMode ?? validated.defaultRepresentationMode);
    const selectedGeometricObject = options.selectedGeometricObject === undefined ? null : options.selectedGeometricObject;
    if (selectedGeometricObject !== null && selectedGeometricObject.depth !== geometricSnapshot.renderedDepth) {
      throw new HybridNavigationError("Selected geometric object is stale for the current rendered depth.");
    }
    const lastAction = typeof options.lastAction === "string" && options.lastAction.length > 0 ? options.lastAction : "initialize";
    return Object.freeze({
      kind: "hybrid_structural_geometric_navigation_state",
      navigationId: NAVIGATION_ID,
      representationMode,
      structural: structuralSnapshot,
      geometric: geometricSnapshot,
      selectedStructuralObject: structuralSnapshot.selectedStructuralObject,
      selectedGeometricObject,
      crossLayerCorrespondence: Object.freeze({
        selectedStructuralStage: createStageCorrespondence(structuralSnapshot.selectedDepth, geometricSnapshot),
        renderedGeometricStage: createStageCorrespondence(geometricSnapshot.renderedDepth, geometricSnapshot),
        objectIdentity: createObjectIdentityBoundary(),
        implementationBinding: Object.freeze({
          class: CLASS_B,
          structuralDepthSource: "#interactive-pullback-tower dataset",
          geometricDepthSource: "Thread25GeometricPullbackState + #geometric-pullback-visualization dataset",
          sharedIdentifierCreated: false
        }),
        presentationNavigation: Object.freeze({
          class: CLASS_C,
          explicitStageNavigationOnly: true,
          automaticDepthSynchronization: false
        })
      }),
      navigationProvenance: Object.freeze({
        lastAction,
        modeSwitchTriggersGeometricGeneration: false,
        geometricMaterializationTriggered: false,
        sheetMaterializationTriggered: false,
        geometricZoomApplied: false,
        sourceObjectIdentityCreated: false
      }),
      truthFlags: Object.freeze({
        structuralGeometryRendered: false,
        geometricGeometryRendered: geometricSnapshot.geometryRendered,
        sheetsMaterialized: false,
        coveringStructureClaimed: false,
        geometricZoomApplied: false
      })
    });
  }

  const api = Object.freeze({
    CONTRACT_VERSION,
    DESCRIPTOR_VERSION,
    NAVIGATION_ID,
    MODES,
    CLASS_A,
    CLASS_B,
    CLASS_C,
    CLASS_D,
    HybridNavigationError,
    validateConfig,
    createStructuralSnapshot,
    createGeometricSnapshot,
    createGeometricSelection,
    createStageCorrespondence,
    createHybridNavigationState
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.HybridNavigationSemantics = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

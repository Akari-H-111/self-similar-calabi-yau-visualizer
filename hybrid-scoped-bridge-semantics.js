"use strict";

(function attachHybridScopedBridgeSemantics(globalObject) {
  const CONTRACT_VERSION = 1;
  const DESCRIPTOR_VERSION = "v0.01";
  const BRIDGE_ID = "hybrid_global_scoped_navigation_v1";
  const CONTEXT_MODES = Object.freeze(["structural", "global-geometric", "scoped-geometric"]);
  const CLASS_A = "A_canonical_mathematical_correspondence";
  const CLASS_B = "B_deterministic_implementation_correspondence";
  const CLASS_C = "C_presentation_ui_only_correspondence";
  const CLASS_D = "D_unsupported_forbidden_correspondence";

  class HybridScopedBridgeError extends Error {
    constructor(message) {
      super(message);
      this.name = "HybridScopedBridgeError";
    }
  }

  function assertObject(value, path) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new HybridScopedBridgeError(path + " must be an object.");
    }
  }

  function exactKeys(value, expected, path) {
    const actual = Object.keys(value).sort();
    const target = [...expected].sort();
    if (actual.length !== target.length || actual.some((key, index) => key !== target[index])) {
      throw new HybridScopedBridgeError(path + " has an unexpected key set.");
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function assertDepth(value, path) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new HybridScopedBridgeError(path + " must be a nonnegative safe integer.");
    }
    return value;
  }

  function nullableDepth(value, path) {
    return value === null ? null : assertDepth(value, path);
  }

  function assertContextMode(mode) {
    if (!CONTEXT_MODES.includes(mode)) {
      throw new HybridScopedBridgeError("Unsupported Thread 31 context mode: " + String(mode));
    }
    return mode;
  }

  function validateConfig(config) {
    assertObject(config, "config");
    exactKeys(config, [
      "contractVersion", "descriptorVersion", "bridgeId", "defaultContextMode",
      "contextModes", "correspondenceClasses", "policies", "truthFlags"
    ], "config");
    if (config.contractVersion !== CONTRACT_VERSION || config.descriptorVersion !== DESCRIPTOR_VERSION ||
        config.bridgeId !== BRIDGE_ID) {
      throw new HybridScopedBridgeError("Unsupported Thread 31 bridge descriptor.");
    }
    if (JSON.stringify(config.contextModes) !== JSON.stringify(CONTEXT_MODES)) {
      throw new HybridScopedBridgeError("Thread 31 contexts must be exactly structural/global-geometric/scoped-geometric.");
    }
    assertContextMode(config.defaultContextMode);
    assertObject(config.correspondenceClasses, "config.correspondenceClasses");
    exactKeys(config.correspondenceClasses, ["A", "B", "C", "D"], "config.correspondenceClasses");
    if (config.correspondenceClasses.A !== CLASS_A || config.correspondenceClasses.B !== CLASS_B ||
        config.correspondenceClasses.C !== CLASS_C || config.correspondenceClasses.D !== CLASS_D) {
      throw new HybridScopedBridgeError("Thread 31 correspondence labels drifted.");
    }
    assertObject(config.policies, "config.policies");
    exactKeys(config.policies, [
      "contextSwitchTriggersScopedGeneration",
      "structuralDepthControlsGlobalGeometricDepth",
      "structuralDepthControlsScopedGeometricDepth",
      "globalGeometricDepthControlsStructuralDepth",
      "globalGeometricDepthControlsScopedGeometricDepth",
      "scopedGeometricDepthControlsStructuralDepth",
      "scopedGeometricDepthControlsGlobalGeometricDepth",
      "selectedAncestorDefinesConnectedComponent",
      "rootTupleDefinesSheetIdentity",
      "projectedLocationDefinesSourceIdentity"
    ], "config.policies");
    for (const value of Object.values(config.policies)) {
      if (value !== false) throw new HybridScopedBridgeError("All Thread 31 coupling/identity policies must remain false.");
    }
    assertObject(config.truthFlags, "config.truthFlags");
    exactKeys(config.truthFlags, ["sheetsMaterialized", "coveringStructureClaimed", "geometricZoomApplied"], "config.truthFlags");
    if (config.truthFlags.sheetsMaterialized !== false || config.truthFlags.coveringStructureClaimed !== false ||
        config.truthFlags.geometricZoomApplied !== false) {
      throw new HybridScopedBridgeError("Thread 31 truth flags exceed admitted scope.");
    }
    return Object.freeze(clone(config));
  }

  function createThread26Snapshot(raw) {
    assertObject(raw, "Thread 26 state");
    if (raw.kind !== "hybrid_structural_geometric_navigation_state") {
      throw new HybridScopedBridgeError("Thread 26 canonical navigation state is required.");
    }
    if (raw.representationMode !== "structural" && raw.representationMode !== "geometric") {
      throw new HybridScopedBridgeError("Thread 26 representation mode is invalid.");
    }
    assertObject(raw.structural, "Thread 26 structural state");
    assertObject(raw.geometric, "Thread 26 geometric state");
    const structuralRequestedDepth = assertDepth(raw.structural.requestedDepth, "structural.requestedDepth");
    const structuralMaterializedDepth = assertDepth(raw.structural.materializedDepth, "structural.materializedDepth");
    const structuralSelectedDepth = assertDepth(raw.structural.selectedDepth, "structural.selectedDepth");
    const globalGeometricDepth = assertDepth(raw.geometric.renderedDepth, "geometric.renderedDepth");
    if (!Array.isArray(raw.geometric.availableDepths) || !raw.geometric.availableDepths.includes(globalGeometricDepth)) {
      throw new HybridScopedBridgeError("Thread 26 global geometric depth availability is invalid.");
    }
    return Object.freeze({
      thread26RepresentationMode: raw.representationMode,
      structuralRequestedDepth,
      structuralMaterializedDepth,
      structuralSelectedDepth,
      globalGeometricDepth,
      globalGeometricAvailableDepths: Object.freeze([...raw.geometric.availableDepths]),
      globalGeometricSourceObject: raw.geometric.sourceObject,
      selectedGeometricPointId: raw.selectedGeometricObject ? raw.selectedGeometricObject.pointId : null,
      stageCorrespondenceClass: raw.crossLayerCorrespondence?.selectedStructuralStage?.class ?? CLASS_D,
      objectIdentityClass: raw.crossLayerCorrespondence?.objectIdentity?.class ?? CLASS_D,
      automaticDepthSynchronization: raw.crossLayerCorrespondence?.presentationNavigation?.automaticDepthSynchronization === true,
      sheetsMaterialized: raw.truthFlags?.sheetsMaterialized === true,
      coveringStructureClaimed: raw.truthFlags?.coveringStructureClaimed === true,
      geometricZoomApplied: raw.truthFlags?.geometricZoomApplied === true
    });
  }

  function createScopedSnapshot(raw) {
    assertObject(raw, "scoped state");
    const requestedScopedDepth = assertDepth(raw.requestedScopedDepth, "scoped.requestedScopedDepth");
    const materializedScopedDepth = nullableDepth(raw.materializedScopedDepth, "scoped.materializedScopedDepth");
    if (typeof raw.controlAncestorId !== "string" || raw.controlAncestorId.length === 0) {
      throw new HybridScopedBridgeError("scoped.controlAncestorId is required.");
    }
    const materializedAncestorId = raw.materializedAncestorId === null ? null : raw.materializedAncestorId;
    if (materializedAncestorId !== null && (typeof materializedAncestorId !== "string" || materializedAncestorId.length === 0)) {
      throw new HybridScopedBridgeError("scoped.materializedAncestorId is invalid.");
    }
    if (raw.materialized !== (materializedScopedDepth !== null)) {
      throw new HybridScopedBridgeError("Scoped materialization flag/depth mismatch.");
    }
    if (raw.materialized && materializedAncestorId === null) {
      throw new HybridScopedBridgeError("Materialized scoped geometry requires an ancestor id.");
    }
    if (!Number.isSafeInteger(raw.pointCount) || raw.pointCount < 0) {
      throw new HybridScopedBridgeError("scoped.pointCount must be a nonnegative safe integer.");
    }
    if (raw.materialized && raw.pointCount < 1) {
      throw new HybridScopedBridgeError("Materialized scoped geometry must contain at least one point.");
    }
    if (!raw.materialized && raw.pointCount !== 0) {
      throw new HybridScopedBridgeError("Unmaterialized scoped geometry must report zero points.");
    }
    if (raw.scopeComplete !== raw.materialized) {
      throw new HybridScopedBridgeError("scopeComplete must equal the current scoped materialization state.");
    }
    if (raw.globalCompletenessClaim !== false) {
      throw new HybridScopedBridgeError("Thread 31 must not accept a global completeness claim.");
    }
    return Object.freeze({
      controlAncestorId: raw.controlAncestorId,
      requestedScopedDepth,
      materialized: raw.materialized,
      materializedScopedDepth,
      materializedAncestorId,
      pointCount: raw.pointCount,
      scopeId: raw.scopeId === null ? null : String(raw.scopeId),
      scopeComplete: raw.scopeComplete,
      lastRequestRejected: raw.lastRequestRejected === true,
      requiredPointCount: raw.requiredPointCount === null ? null : String(raw.requiredPointCount),
      globalCompletenessClaim: false,
      sheetsMaterialized: false,
      coveringStructureClaimed: false,
      geometricZoomApplied: false
    });
  }

  function createBridgeState(config, thread26Snapshot, scopedSnapshot, options = {}) {
    const validated = validateConfig(config);
    if (!thread26Snapshot || typeof thread26Snapshot !== "object") {
      throw new HybridScopedBridgeError("A Thread 26 snapshot is required.");
    }
    if (!scopedSnapshot || typeof scopedSnapshot !== "object") {
      throw new HybridScopedBridgeError("A scoped snapshot is required.");
    }
    const contextMode = assertContextMode(options.contextMode ?? validated.defaultContextMode);
    const lastAction = typeof options.lastAction === "string" && options.lastAction.length > 0
      ? options.lastAction : "initialize";
    if (thread26Snapshot.automaticDepthSynchronization !== false) {
      throw new HybridScopedBridgeError("Thread 26 automatic depth synchronization must remain false.");
    }
    if (thread26Snapshot.sheetsMaterialized || thread26Snapshot.coveringStructureClaimed || thread26Snapshot.geometricZoomApplied) {
      throw new HybridScopedBridgeError("Thread 26 truth flags exceed the Thread 31 boundary.");
    }
    return Object.freeze({
      kind: "hybrid_global_scoped_navigation_state",
      bridgeId: BRIDGE_ID,
      contextMode,
      thread26: thread26Snapshot,
      scoped: scopedSnapshot,
      independentDepths: Object.freeze({
        structuralRequestedDepth: thread26Snapshot.structuralRequestedDepth,
        structuralMaterializedDepth: thread26Snapshot.structuralMaterializedDepth,
        structuralSelectedDepth: thread26Snapshot.structuralSelectedDepth,
        globalGeometricDepth: thread26Snapshot.globalGeometricDepth,
        scopedRequestedDepth: scopedSnapshot.requestedScopedDepth,
        scopedMaterializedDepth: scopedSnapshot.materializedScopedDepth
      }),
      correspondence: Object.freeze({
        canonicalStageIndex: Object.freeze({
          class: CLASS_A,
          supportedOnlyWhereThread26SupportsStage: true,
          structuralSelectedDepth: thread26Snapshot.structuralSelectedDepth,
          globalGeometricDepth: thread26Snapshot.globalGeometricDepth,
          sourceObjectIdentityClaim: false
        }),
        scopedAncestryBinding: Object.freeze({
          class: CLASS_B,
          selectedCanonicalAncestorId: scopedSnapshot.controlAncestorId,
          materializedAncestorId: scopedSnapshot.materializedAncestorId,
          structuralNodeEqualsSelectedAncestor: false,
          selectedAncestorEqualsConnectedComponent: false,
          rootTupleEqualsSheet: false
        }),
        contextNavigation: Object.freeze({
          class: CLASS_C,
          explicitOnly: true,
          contextSwitchTriggersScopedGeneration: false,
          automaticDepthSynchronization: false
        }),
        forbiddenIdentity: Object.freeze({
          class: CLASS_D,
          structuralNodeEqualsGeometricPoint: false,
          structuralBranchEqualsRootTuple: false,
          selectedAncestorEqualsConnectedComponent: false,
          rootTupleEqualsSheet: false,
          projectedLocationDefinesSourceIdentity: false
        })
      }),
      navigationProvenance: Object.freeze({
        lastAction,
        contextSwitchTriggersScopedGeneration: false,
        scopedGenerationTriggered: false,
        sourceObjectIdentityCreated: false,
        sheetMaterializationTriggered: false,
        geometricZoomApplied: false
      }),
      truthFlags: Object.freeze({
        completeGlobalHypersurfaceRendered: false,
        sheetsMaterialized: false,
        coveringStructureClaimed: false,
        geometricZoomApplied: false
      })
    });
  }

  const api = Object.freeze({
    CONTRACT_VERSION,
    DESCRIPTOR_VERSION,
    BRIDGE_ID,
    CONTEXT_MODES,
    CLASS_A,
    CLASS_B,
    CLASS_C,
    CLASS_D,
    HybridScopedBridgeError,
    validateConfig,
    createThread26Snapshot,
    createScopedSnapshot,
    createBridgeState
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.HybridScopedBridgeSemantics = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

"use strict";

(function attachArithmeticOverlays(globalObject) {
  const MODEL_KIND = "arithmetic_overlays";
  const ACTIVE_STATUS = "overlay_active";
  const IDLE_STATUS = "overlay_idle";
  const UNAVAILABLE_STATUS = "unavailable";
  const NOT_MATERIALIZED_STATUS = "not_materialized";
  const UNSUPPORTED_STATUS = "unsupported";

  const EVIDENCE_CLASSES = Object.freeze({
    FORMAL_THEOREM: "formal_theorem",
    EXACT_SOURCE_BACKED_COMPUTATION: "exact_source_backed_computation",
    SOURCE_BACKED_STRUCTURAL_REPRESENTATION: "source_backed_structural_representation",
    FINITE_VISUALIZATION_METAPHOR: "finite_visualization_metaphor",
    HEURISTIC: "heuristic",
    UNRESOLVED_UNAVAILABLE: "unresolved_unavailable"
  });

  const OVERLAY_IDS = Object.freeze({
    COORDINATE_CHANNELS: "coordinate_channels",
    COORDINATE_ITERATE_RULE: "coordinate_iterate_rule",
    CYCLOTOMIC_REFINEMENT: "cyclotomic_refinement",
    TORSION_LABELS: "torsion_labels",
    COLLISION_CLASSES: "collision_classes",
    DELTA_N_DIVISOR: "delta_n_divisor"
  });

  const FORMAL_SEAL_COMMIT = "ff5bcd2f134497c671b2368c372f59b5620a41ab";

  const SOURCE_ARTIFACTS = Object.freeze({
    coordinatePower: Object.freeze({
      artifact: "formal/SelfSimilarCY/CoordinatePower.lean",
      sourceVersion: "git-blob:dcfae8a3ed99544e50ee45aa12acde63e41090c8",
      blobSha: "dcfae8a3ed99544e50ee45aa12acde63e41090c8",
      formalSealCommit: FORMAL_SEAL_COMMIT,
      theoremIdentities: Object.freeze([
        "Point4",
        "coordinatePower",
        "coordinatePower_apply",
        "coordinatePower_unique"
      ])
    }),
    coordinatePowerIteration: Object.freeze({
      artifact: "formal/SelfSimilarCY/CoordinatePowerIteration.lean",
      sourceVersion: "git-blob:4c78793d586e8ba822d4b326f09fd82dc07eaaf9",
      blobSha: "4c78793d586e8ba822d4b326f09fd82dc07eaaf9",
      formalSealCommit: FORMAL_SEAL_COMMIT,
      theoremIdentities: Object.freeze([
        "coordinatePower_iterate_apply",
        "coordinatePower_iterate"
      ])
    })
  });

  const DEFERRED_CANDIDATES = Object.freeze({
    [OVERLAY_IDS.CYCLOTOMIC_REFINEMENT]: Object.freeze({
      evidenceClass: EVIDENCE_CLASSES.UNRESOLVED_UNAVAILABLE,
      reason: "No exact canonical cyclotomic source artifact was available to the Thread 08 source audit."
    }),
    [OVERLAY_IDS.TORSION_LABELS]: Object.freeze({
      evidenceClass: EVIDENCE_CLASSES.UNRESOLVED_UNAVAILABLE,
      reason: "No exact canonical torsion source artifact was available to the Thread 08 source audit."
    }),
    [OVERLAY_IDS.COLLISION_CLASSES]: Object.freeze({
      evidenceClass: EVIDENCE_CLASSES.UNRESOLVED_UNAVAILABLE,
      reason: "No exact canonical collision source artifact was available to the Thread 08 source audit."
    }),
    [OVERLAY_IDS.DELTA_N_DIVISOR]: Object.freeze({
      evidenceClass: EVIDENCE_CLASSES.UNRESOLVED_UNAVAILABLE,
      reason: "No exact canonical Delta_n/divisor source artifact was available to the Thread 08 source audit."
    })
  });

  function assertCompatibleInputs(scene, recursiveModel, zoomModel, organizationModel) {
    if (!scene || !scene.mathematics || !scene.mathematics.pullbackMap) {
      throw new TypeError("Arithmetic overlays require a validated normalized scene.");
    }
    if (!recursiveModel || recursiveModel.kind !== "recursive_lazy_expansion") {
      throw new TypeError("Arithmetic overlays require a verified recursive_lazy_expansion model.");
    }
    if (!zoomModel || zoomModel.kind !== "structural_zoom_focus") {
      throw new TypeError("Arithmetic overlays require a verified structural_zoom_focus model.");
    }
    if (!organizationModel || organizationModel.kind !== "sheet_branch_organization") {
      throw new TypeError("Arithmetic overlays require a verified sheet_branch_organization model.");
    }
    if (zoomModel.availableDepth !== recursiveModel.materializedDepth) {
      throw new TypeError("Zoom available depth must match the recursive materialized depth.");
    }
    if (organizationModel.materializedDepth !== recursiveModel.materializedDepth) {
      throw new TypeError("Sheet organization depth must match the recursive materialized depth.");
    }
    if (organizationModel.focusedDepth !== zoomModel.focusedDepth) {
      throw new TypeError("Sheet organization focus must match the zoom focus.");
    }
  }

  function assertRequestedOverlayIds(requestedOverlayIds) {
    if (!Array.isArray(requestedOverlayIds)) {
      throw new TypeError("Arithmetic overlay requests must be an array of overlay ids.");
    }

    const seen = new Set();
    for (const overlayId of requestedOverlayIds) {
      if (typeof overlayId !== "string" || overlayId.trim() === "") {
        throw new TypeError("Arithmetic overlay ids must be non-empty strings.");
      }
      if (seen.has(overlayId)) {
        throw new TypeError(`Arithmetic overlay id ${JSON.stringify(overlayId)} was requested more than once.`);
      }
      seen.add(overlayId);
    }
  }

  function createCoordinateChannelsDescriptor(scene) {
    const pullbackMap = scene.mathematics.pullbackMap;
    const channels = Object.freeze(
      Array.from({ length: pullbackMap.coordinateCount }, (_, index) =>
        Object.freeze({
          index,
          displayLabel: `z_${String(index + 1)}`,
          formalIndexDomain: "Fin 4"
        })
      )
    );

    return Object.freeze({
      overlayId: OVERLAY_IDS.COORDINATE_CHANNELS,
      scope: "global_system_metadata",
      evidenceClass: EVIDENCE_CLASSES.SOURCE_BACKED_STRUCTURAL_REPRESENTATION,
      formalSupport: EVIDENCE_CLASSES.FORMAL_THEOREM,
      canonicalSource: SOURCE_ARTIFACTS.coordinatePower,
      coordinateCountSource: "scene.mathematics.pullbackMap.coordinateCount",
      mapKindSource: "scene.mathematics.pullbackMap.kind",
      exponentParameterSource: "scene.mathematics.pullbackMap.exponentParameter",
      coordinateCount: pullbackMap.coordinateCount,
      mapKind: pullbackMap.kind,
      exponentParameter: pullbackMap.exponentParameter,
      channels,
      geometryRequired: false,
      geometryRendered: false,
      materializationTriggered: false
    });
  }

  function createCoordinateIterateRuleDescriptor(scene, zoomModel) {
    if (zoomModel.focusedDepth === null) {
      return null;
    }

    const pullbackMap = scene.mathematics.pullbackMap;
    const focusedDepth = zoomModel.focusedDepth;
    const channels = Object.freeze(
      Array.from({ length: pullbackMap.coordinateCount }, (_, index) =>
        Object.freeze({
          index,
          displayLabel: `z_${String(index + 1)}`,
          ruleKind: "coordinate_power_iterate",
          exponentExpression: Object.freeze({
            baseParameter: pullbackMap.exponentParameter,
            towerDepth: focusedDepth
          })
        })
      )
    );

    return Object.freeze({
      overlayId: OVERLAY_IDS.COORDINATE_ITERATE_RULE,
      scope: "focused_level_metadata",
      evidenceClass: EVIDENCE_CLASSES.FORMAL_THEOREM,
      canonicalSource: SOURCE_ARTIFACTS.coordinatePowerIteration,
      theoremIdentity: "coordinatePower_iterate_apply",
      focusedDepth,
      coordinateCountSource: "scene.mathematics.pullbackMap.coordinateCount",
      exponentParameterSource: "scene.mathematics.pullbackMap.exponentParameter",
      coordinateCount: pullbackMap.coordinateCount,
      exponentParameter: pullbackMap.exponentParameter,
      channels,
      requiresMaterializedFocus: true,
      geometryRequired: false,
      geometryRendered: false,
      materializationTriggered: false
    });
  }

  function createImplementedCatalog() {
    return Object.freeze([
      Object.freeze({
        overlayId: OVERLAY_IDS.COORDINATE_CHANNELS,
        candidateFamily: "coordinate_channel_labels",
        implementationStatus: "implemented",
        scope: "global_system_metadata",
        evidenceClass: EVIDENCE_CLASSES.SOURCE_BACKED_STRUCTURAL_REPRESENTATION,
        formalSupport: EVIDENCE_CLASSES.FORMAL_THEOREM,
        canonicalSource: SOURCE_ARTIFACTS.coordinatePower
      }),
      Object.freeze({
        overlayId: OVERLAY_IDS.COORDINATE_ITERATE_RULE,
        candidateFamily: "coordinate_channel_labels",
        implementationStatus: "implemented",
        scope: "focused_level_metadata",
        evidenceClass: EVIDENCE_CLASSES.FORMAL_THEOREM,
        canonicalSource: SOURCE_ARTIFACTS.coordinatePowerIteration
      })
    ]);
  }

  function createDeferredCatalog() {
    return Object.freeze(
      Object.entries(DEFERRED_CANDIDATES).map(([overlayId, metadata]) =>
        Object.freeze({
          overlayId,
          implementationStatus: "deferred",
          availability: UNAVAILABLE_STATUS,
          evidenceClass: metadata.evidenceClass,
          canonicalSource: null,
          sourceVersion: null,
          reason: metadata.reason
        })
      )
    );
  }

  function createRequestResult(overlayId, scene, zoomModel) {
    if (overlayId === OVERLAY_IDS.COORDINATE_CHANNELS) {
      return Object.freeze({
        overlayId,
        requestStatus: "enabled",
        descriptor: createCoordinateChannelsDescriptor(scene)
      });
    }

    if (overlayId === OVERLAY_IDS.COORDINATE_ITERATE_RULE) {
      const descriptor = createCoordinateIterateRuleDescriptor(scene, zoomModel);
      if (!descriptor) {
        return Object.freeze({
          overlayId,
          requestStatus: NOT_MATERIALIZED_STATUS,
          descriptor: null,
          evidenceClass: EVIDENCE_CLASSES.FORMAL_THEOREM,
          canonicalSource: SOURCE_ARTIFACTS.coordinatePowerIteration,
          reason: "Focused-level iterate annotation requires an already-materialized focus; recursion is not expanded by the overlay layer."
        });
      }
      return Object.freeze({
        overlayId,
        requestStatus: "enabled",
        descriptor
      });
    }

    if (Object.hasOwn(DEFERRED_CANDIDATES, overlayId)) {
      const metadata = DEFERRED_CANDIDATES[overlayId];
      return Object.freeze({
        overlayId,
        requestStatus: UNAVAILABLE_STATUS,
        descriptor: null,
        evidenceClass: metadata.evidenceClass,
        canonicalSource: null,
        sourceVersion: null,
        reason: metadata.reason
      });
    }

    return Object.freeze({
      overlayId,
      requestStatus: UNSUPPORTED_STATUS,
      descriptor: null,
      evidenceClass: EVIDENCE_CLASSES.UNRESOLVED_UNAVAILABLE,
      canonicalSource: null,
      sourceVersion: null,
      reason: "Overlay id is not registered by the v0.09 arithmetic overlay contract."
    });
  }

  function describeModel(enabledOverlays, requestResults, focusedDepth) {
    if (enabledOverlays.length === 0) {
      const unavailableCount = requestResults.filter((result) => result.requestStatus !== "enabled").length;
      return `Arithmetic overlays: no active overlay. ${String(unavailableCount)} requested overlay(s) are unavailable, not materialized, or unsupported. Core recursion is unchanged.`;
    }

    return (
      `Arithmetic overlays: ${String(enabledOverlays.length)} provenance-tagged overlay(s) active` +
      `${focusedDepth === null ? " with no materialized structural focus" : ` at structural focus ${String(focusedDepth)}`}. ` +
      "Annotations are symbolic/structural only; no recursion, sheet materialization, or geometry is created."
    );
  }

  function createArithmeticOverlayModel(
    scene,
    recursiveModel,
    zoomModel,
    organizationModel,
    requestedOverlayIds = []
  ) {
    assertCompatibleInputs(scene, recursiveModel, zoomModel, organizationModel);
    assertRequestedOverlayIds(requestedOverlayIds);

    const implementedOverlays = createImplementedCatalog();
    const deferredCandidateOverlays = createDeferredCatalog();
    const requestResults = Object.freeze(
      requestedOverlayIds.map((overlayId) => createRequestResult(overlayId, scene, zoomModel))
    );
    const overlayDescriptors = Object.freeze(
      requestResults.filter((result) => result.requestStatus === "enabled").map((result) => result.descriptor)
    );
    const enabledOverlays = Object.freeze(overlayDescriptors.map((descriptor) => descriptor.overlayId));
    const availableOverlays = Object.freeze(
      implementedOverlays
        .filter((overlay) => overlay.overlayId !== OVERLAY_IDS.COORDINATE_ITERATE_RULE || zoomModel.focusedDepth !== null)
        .map((overlay) => overlay.overlayId)
    );

    return Object.freeze({
      kind: MODEL_KIND,
      status: enabledOverlays.length > 0 ? ACTIVE_STATUS : IDLE_STATUS,
      requestedOverlays: Object.freeze([...requestedOverlayIds]),
      implementedOverlays,
      deferredCandidateOverlays,
      availableOverlays,
      enabledOverlays,
      requestResults,
      overlayDescriptors,
      sourceArtifacts: Object.freeze([
        SOURCE_ARTIFACTS.coordinatePower,
        SOURCE_ARTIFACTS.coordinatePowerIteration
      ]),
      requestedDepth: recursiveModel.requestedDepth,
      materializedDepth: recursiveModel.materializedDepth,
      requestedFocusDepth: zoomModel.requestedFocusDepth,
      focusedDepth: zoomModel.focusedDepth,
      sheetOrganizationStatus: organizationModel.organizationStatus,
      overlayStateIsViewRequest: true,
      recursionModified: false,
      zoomModified: false,
      sheetOrganizationModified: false,
      materializationTriggered: false,
      geometryRendered: false,
      formalVerificationReopened: false,
      message: describeModel(enabledOverlays, requestResults, zoomModel.focusedDepth)
    });
  }

  function renderArithmeticOverlays(model, target) {
    if (!target || typeof target !== "object" || !target.dataset) {
      throw new TypeError("Arithmetic overlay target must expose a dataset object.");
    }
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Arithmetic overlay renderer requires an arithmetic_overlays model.");
    }

    target.hidden = false;
    target.dataset.state = model.status;
    target.dataset.availableOverlays = model.availableOverlays.join(",");
    target.dataset.enabledOverlays = model.enabledOverlays.join(",");
    target.dataset.materializedDepth = String(model.materializedDepth);
    target.dataset.focusedDepth = model.focusedDepth === null ? "" : String(model.focusedDepth);
    target.dataset.materializationTriggered = String(model.materializationTriggered);
    target.dataset.geometryRendered = String(model.geometryRendered);
    target.textContent = model.message;

    return model;
  }

  const api = Object.freeze({
    MODEL_KIND,
    ACTIVE_STATUS,
    IDLE_STATUS,
    UNAVAILABLE_STATUS,
    NOT_MATERIALIZED_STATUS,
    UNSUPPORTED_STATUS,
    EVIDENCE_CLASSES,
    OVERLAY_IDS,
    SOURCE_ARTIFACTS,
    createArithmeticOverlayModel,
    renderArithmeticOverlays
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.ArithmeticOverlays = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

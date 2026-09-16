"use strict";

(function attachSheetBranchOrganization(globalObject) {
  const MODEL_KIND = "sheet_branch_organization";
  const DESCRIPTOR_KIND = "aggregate_structural_branch_descriptor";
  const AVAILABLE_STATUS = "structural_organization_available";
  const BASE_STATUS = "base_level_no_incoming_branch";
  const NOT_MATERIALIZED_STATUS = "focus_not_materialized";

  function assertCompatibleInputs(scene, recursiveModel, zoomModel) {
    if (!scene || !scene.derived || !Object.hasOwn(scene.derived, "sheetDegree")) {
      throw new TypeError("Sheet/branch organization requires a validated normalized scene with derived.sheetDegree.");
    }
    if (!recursiveModel || recursiveModel.kind !== "recursive_lazy_expansion") {
      throw new TypeError("Sheet/branch organization requires a verified recursive_lazy_expansion model.");
    }
    if (!zoomModel || zoomModel.kind !== "structural_zoom_focus") {
      throw new TypeError("Sheet/branch organization requires a verified structural_zoom_focus model.");
    }
    if (zoomModel.availableDepth !== recursiveModel.materializedDepth) {
      throw new TypeError("Zoom available depth must match the recursive materialized depth.");
    }
    if (zoomModel.requestedDepth !== recursiveModel.requestedDepth) {
      throw new TypeError("Zoom requested depth must match the recursive requested depth.");
    }
  }

  function createLevelOrganizationDescriptor(level, sheetDegreePerStep) {
    if (level.mapDegreePerStep !== sheetDegreePerStep) {
      throw new TypeError("Recursive level degree metadata must agree with scene.derived.sheetDegree.");
    }

    return Object.freeze({
      kind: DESCRIPTOR_KIND,
      depth: level.depth,
      sourceDepth: level.sourceDepth,
      nominalMultiplicity: sheetDegreePerStep,
      sheetDegreeSource: "scene.derived.sheetDegree",
      iteratedDegreeExpression: level.iteratedDegreeExpression,
      aggregateOnly: true,
      slotsEnumerated: false,
      sheetsMaterialized: false,
      geometryRendered: false
    });
  }

  function describeOrganization(status, focusedDepth, materializedDepth, sheetDegreePerStep) {
    if (status === NOT_MATERIALIZED_STATUS) {
      return (
        `Sheet/branch organization unavailable at requested focus: materialized structural depth is ${String(materializedDepth)}. ` +
        "No recursive expansion or sheet materialization is triggered."
      );
    }

    if (status === BASE_STATUS) {
      return (
        `Sheet/branch organization at base depth: no incoming pullback transition exists. ` +
        `Per-step D^4 runtime multiplicity metadata is ${String(sheetDegreePerStep)} for positive-depth transitions; no sheets are materialized.`
      );
    }

    return (
      `Sheet/branch organization at structural depth ${String(focusedDepth)} uses aggregate runtime multiplicity metadata ${String(sheetDegreePerStep)} per step. ` +
      "Descriptors are organizational only; no genuine sheets or geometry are materialized."
    );
  }

  function createSheetBranchOrganizationModel(scene, recursiveModel, zoomModel) {
    assertCompatibleInputs(scene, recursiveModel, zoomModel);

    const sheetDegreePerStep = scene.derived.sheetDegree;
    const levelOrganizations = Object.freeze(
      recursiveModel.levels.map((level) => createLevelOrganizationDescriptor(level, sheetDegreePerStep))
    );

    let organizationStatus;
    let focusedOrganization = null;

    if (zoomModel.focusedDepth === null) {
      organizationStatus = NOT_MATERIALIZED_STATUS;
    } else if (zoomModel.focusedDepth === 0) {
      organizationStatus = BASE_STATUS;
    } else {
      organizationStatus = AVAILABLE_STATUS;
      focusedOrganization = levelOrganizations[zoomModel.focusedDepth - 1] ?? null;
      if (!focusedOrganization || focusedOrganization.depth !== zoomModel.focusedDepth) {
        throw new TypeError("Focused organization descriptor must come from the current recursive materialized levels.");
      }
    }

    return Object.freeze({
      kind: MODEL_KIND,
      descriptorMode: "aggregate_structural_descriptors",
      sheetDegreeSource: "scene.derived.sheetDegree",
      sheetDegreeSemanticStatus: "runtime_numeric_organizational_metadata",
      sheetDegreePerStep,
      requestedDepth: recursiveModel.requestedDepth,
      materializedDepth: recursiveModel.materializedDepth,
      requestedFocusDepth: zoomModel.requestedFocusDepth,
      focusedDepth: zoomModel.focusedDepth,
      organizationStatus,
      organizationAvailable: zoomModel.focusedDepth !== null,
      levelOrganizations,
      focusedOrganization,
      slotsEnumerated: false,
      sheetsMaterialized: false,
      coveringStructureClaimed: false,
      geometryRendered: false,
      materializationTriggered: false,
      message: describeOrganization(
        organizationStatus,
        zoomModel.focusedDepth,
        recursiveModel.materializedDepth,
        sheetDegreePerStep
      )
    });
  }

  function renderSheetBranchOrganization(model, target) {
    if (!target || typeof target !== "object" || !target.dataset) {
      throw new TypeError("Sheet/branch organization target must expose a dataset object.");
    }
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Sheet/branch organization renderer requires a sheet_branch_organization model.");
    }

    target.hidden = false;
    target.dataset.state = model.organizationStatus;
    target.dataset.sheetDegreeSource = model.sheetDegreeSource;
    target.dataset.sheetDegreePerStep = String(model.sheetDegreePerStep);
    target.dataset.materializedDepth = String(model.materializedDepth);
    target.dataset.focusedDepth = model.focusedDepth === null ? "" : String(model.focusedDepth);
    target.dataset.sheetsMaterialized = String(model.sheetsMaterialized);
    target.dataset.coveringStructureClaimed = String(model.coveringStructureClaimed);
    target.dataset.geometryRendered = String(model.geometryRendered);
    target.dataset.materializationTriggered = String(model.materializationTriggered);
    target.textContent = model.message;

    return model;
  }

  const api = Object.freeze({
    MODEL_KIND,
    DESCRIPTOR_KIND,
    AVAILABLE_STATUS,
    BASE_STATUS,
    NOT_MATERIALIZED_STATUS,
    createSheetBranchOrganizationModel,
    renderSheetBranchOrganization
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.SheetBranchOrganization = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

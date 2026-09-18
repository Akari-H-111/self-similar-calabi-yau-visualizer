"use strict";

(function attachInteractivePullbackTower(globalObject) {
  const MODEL_KIND = "interactive_pullback_tower";
  const TRANSITION_KIND = "interactive_pullback_transition";

  const SUBSCRIPT_DIGITS = Object.freeze({
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉"
  });

  function formatSubscriptNumber(value) {
    return String(value)
      .split("")
      .map((digit) => SUBSCRIPT_DIGITS[digit] ?? digit)
      .join("");
  }

  function formatLevel(depth) {
    return `X${formatSubscriptNumber(depth)}`;
  }

  function assertDepth(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new TypeError(`${label} must be a nonnegative safe integer.`);
    }
  }

  function requireRuntimeApis() {
    const recursiveApi = globalObject.RecursiveLazyExpansion;
    const zoomApi = globalObject.ZoomSemantics;
    const organizationApi = globalObject.SheetBranchOrganization;

    if (!recursiveApi || typeof recursiveApi.createRecursiveLazyExpansionModel !== "function" || typeof recursiveApi.expandOneLevel !== "function") {
      throw new TypeError("Interactive pullback tower requires the sealed RecursiveLazyExpansion API.");
    }
    if (!zoomApi || typeof zoomApi.createZoomFocusModel !== "function") {
      throw new TypeError("Interactive pullback tower requires the sealed ZoomSemantics API.");
    }
    if (!organizationApi || typeof organizationApi.createSheetBranchOrganizationModel !== "function") {
      throw new TypeError("Interactive pullback tower requires the sealed SheetBranchOrganization API.");
    }

    return { recursiveApi, zoomApi, organizationApi };
  }

  function assertCanonicalInputs(scene, baseModel, oneStepModel) {
    if (!scene || !scene.request || !scene.mathematics || !scene.derived) {
      throw new TypeError("Interactive pullback tower requires a validated normalized scene.");
    }
    if (!baseModel || baseModel.kind !== "base_scene") {
      throw new TypeError("Interactive pullback tower requires the verified base_scene model.");
    }
    if (!oneStepModel || oneStepModel.kind !== "one_step_pullback" || oneStepModel.depth !== 1) {
      throw new TypeError("Interactive pullback tower requires the verified one_step_pullback model.");
    }

    assertDepth(scene.request.requestedDepth, "Canonical scene requestedDepth");

    if (scene.mathematics.baseHypersurface?.definingFunction?.representation !== "unresolved") {
      throw new TypeError("Interactive pullback tower is restricted to the unresolved-W truth boundary.");
    }
    if (baseModel.geometryRendered || oneStepModel.geometryRendered || oneStepModel.sheetsMaterialized) {
      throw new TypeError("Interactive pullback tower cannot start from geometric or sheet materialization claims.");
    }
  }

  function createInteractionScene(sourceScene, requestedDepth) {
    assertDepth(requestedDepth, "Interaction requestedDepth");

    return Object.freeze({
      ...sourceScene,
      request: Object.freeze({
        ...sourceScene.request,
        requestedDepth
      })
    });
  }

  function createTransition(action, outcome, structuralDescriptorMaterializationTriggered) {
    return Object.freeze({
      kind: TRANSITION_KIND,
      action,
      outcome,
      structuralDescriptorMaterializationTriggered: Boolean(structuralDescriptorMaterializationTriggered),
      geometricMaterializationTriggered: false,
      sheetMaterializationTriggered: false,
      geometricZoomApplied: false,
      cameraTransformApplied: false
    });
  }

  function createBreadcrumb(selectedDepth, focusedDepth, visibleDepth) {
    const terminalDepth = Math.max(selectedDepth, focusedDepth);
    const items = [];

    for (let depth = 0; depth <= terminalDepth; depth += 1) {
      items.push(Object.freeze({
        depth,
        label: formatLevel(depth),
        selected: depth === selectedDepth,
        focused: depth === focusedDepth,
        presentationVisible: depth <= visibleDepth
      }));
    }

    return Object.freeze(items);
  }

  function assertRuntimeConsistency(runtimeScene, recursiveModel, zoomModel, organizationModel) {
    if (!recursiveModel || recursiveModel.kind !== "recursive_lazy_expansion") {
      throw new TypeError("Interaction state requires a recursive_lazy_expansion model.");
    }
    if (!zoomModel || zoomModel.kind !== "structural_zoom_focus") {
      throw new TypeError("Interaction state requires a structural_zoom_focus model.");
    }
    if (!organizationModel || organizationModel.kind !== "sheet_branch_organization") {
      throw new TypeError("Interaction state requires a sheet_branch_organization model.");
    }
    if (runtimeScene.request.requestedDepth !== recursiveModel.requestedDepth) {
      throw new TypeError("Interaction request state and recursive requestedDepth must agree.");
    }
    if (recursiveModel.materializedDepth !== zoomModel.availableDepth || recursiveModel.materializedDepth !== organizationModel.materializedDepth) {
      throw new TypeError("Interaction recursive, focus, and organization materialized depths must agree.");
    }
    if (zoomModel.focusedDepth !== organizationModel.focusedDepth) {
      throw new TypeError("Interaction focus and organization focusedDepth must agree.");
    }
    if (
      recursiveModel.geometryRendered ||
      recursiveModel.sheetsMaterialized ||
      organizationModel.geometryRendered ||
      organizationModel.sheetsMaterialized ||
      organizationModel.coveringStructureClaimed ||
      zoomModel.geometricZoomApplied ||
      zoomModel.cameraTransformApplied ||
      zoomModel.materializationTriggered
    ) {
      throw new TypeError("Interaction state cannot promote geometry, sheets, covering structure, or camera/geometric zoom.");
    }
  }

  function buildState({
    sourceScene,
    baseModel,
    oneStepModel,
    runtimeScene,
    recursiveModel,
    zoomModel,
    organizationModel,
    selectedDepth,
    collapsedDepth,
    transition
  }) {
    assertRuntimeConsistency(runtimeScene, recursiveModel, zoomModel, organizationModel);
    assertDepth(selectedDepth, "Selected depth");

    if (selectedDepth > recursiveModel.materializedDepth) {
      throw new RangeError("Selected depth must already be materialized.");
    }

    if (zoomModel.focusedDepth === null) {
      throw new TypeError("Interactive pullback tower cannot retain an unmaterialized focus.");
    }

    if (collapsedDepth !== null) {
      assertDepth(collapsedDepth, "Collapsed depth");
      if (collapsedDepth > recursiveModel.materializedDepth) {
        throw new RangeError("Collapsed depth must already be materialized.");
      }
      if (collapsedDepth < selectedDepth || collapsedDepth < zoomModel.focusedDepth) {
        throw new RangeError("Presentation collapse cannot hide the active selected or focused level.");
      }
    }

    const visibleDepth = collapsedDepth === null ? recursiveModel.materializedDepth : collapsedDepth;
    const breadcrumb = createBreadcrumb(selectedDepth, zoomModel.focusedDepth, visibleDepth);

    return Object.freeze({
      kind: MODEL_KIND,
      sourceScene,
      baseModel,
      oneStepModel,
      runtimeScene,
      recursiveModel,
      zoomModel,
      organizationModel,
      sourceRequestedDepth: sourceScene.request.requestedDepth,
      requestedDepth: recursiveModel.requestedDepth,
      materializedDepth: recursiveModel.materializedDepth,
      selectedDepth,
      focusedDepth: zoomModel.focusedDepth,
      presentation: Object.freeze({
        collapsedDepth,
        visibleDepth,
        collapsed: collapsedDepth !== null,
        hiddenMaterializedLevels: recursiveModel.materializedDepth - visibleDepth
      }),
      breadcrumb,
      transition,
      truthfulness: Object.freeze({
        geometryRendered: false,
        sheetsMaterialized: false,
        coveringStructureClaimed: false,
        geometricZoomApplied: false,
        cameraTransformApplied: false,
        W: "unresolved"
      })
    });
  }

  function createInteractivePullbackTowerModel(scene, baseModel, oneStepModel) {
    assertCanonicalInputs(scene, baseModel, oneStepModel);
    const { recursiveApi, zoomApi, organizationApi } = requireRuntimeApis();
    const runtimeScene = createInteractionScene(scene, scene.request.requestedDepth);
    const recursiveModel = recursiveApi.createRecursiveLazyExpansionModel(runtimeScene, baseModel, oneStepModel);
    const zoomModel = zoomApi.createZoomFocusModel(runtimeScene, recursiveModel, 0);
    const organizationModel = organizationApi.createSheetBranchOrganizationModel(runtimeScene, recursiveModel, zoomModel);

    return buildState({
      sourceScene: scene,
      baseModel,
      oneStepModel,
      runtimeScene,
      recursiveModel,
      zoomModel,
      organizationModel,
      selectedDepth: 0,
      collapsedDepth: null,
      transition: createTransition("initialize", "ready", false)
    });
  }

  function rebuildFocusedState(state, recursiveModel, runtimeScene, focusedDepth, selectedDepth, collapsedDepth, transition) {
    const { zoomApi, organizationApi } = requireRuntimeApis();
    const zoomModel = zoomApi.createZoomFocusModel(runtimeScene, recursiveModel, focusedDepth);
    if (!zoomModel.focusAvailable || zoomModel.focusedDepth === null) {
      throw new RangeError("Requested structural focus is not materialized.");
    }
    const organizationModel = organizationApi.createSheetBranchOrganizationModel(runtimeScene, recursiveModel, zoomModel);

    return buildState({
      sourceScene: state.sourceScene,
      baseModel: state.baseModel,
      oneStepModel: state.oneStepModel,
      runtimeScene,
      recursiveModel,
      zoomModel,
      organizationModel,
      selectedDepth,
      collapsedDepth,
      transition
    });
  }

  function expandOrReveal(state) {
    if (!state || state.kind !== MODEL_KIND) {
      throw new TypeError("expandOrReveal requires an interactive_pullback_tower model.");
    }

    if (state.presentation.collapsed) {
      return rebuildFocusedState(
        state,
        state.recursiveModel,
        state.runtimeScene,
        state.focusedDepth,
        state.selectedDepth,
        null,
        createTransition("expand_or_reveal", "revealed_materialized_levels", false)
      );
    }

    const { recursiveApi } = requireRuntimeApis();
    let runtimeScene = state.runtimeScene;
    let recursiveModel = state.recursiveModel;

    if (recursiveModel.materializedDepth < recursiveModel.requestedDepth) {
      recursiveModel = recursiveApi.expandOneLevel(recursiveModel);
    } else {
      const nextRequestedDepth = recursiveModel.requestedDepth + 1;
      runtimeScene = createInteractionScene(state.sourceScene, nextRequestedDepth);
      recursiveModel = recursiveApi.createRecursiveLazyExpansionModel(runtimeScene, state.baseModel, state.oneStepModel);
      const targetMaterializedDepth = state.materializedDepth + 1;

      while (recursiveModel.materializedDepth < targetMaterializedDepth) {
        recursiveModel = recursiveApi.expandOneLevel(recursiveModel);
      }
    }

    const materialized = recursiveModel.materializedDepth > state.materializedDepth;
    if (!materialized) {
      throw new TypeError("Expand transition failed to materialize exactly the next structural level.");
    }
    if (recursiveModel.materializedDepth !== state.materializedDepth + 1) {
      throw new TypeError("Expand transition must materialize exactly one additional structural level.");
    }

    return rebuildFocusedState(
      state,
      recursiveModel,
      runtimeScene,
      state.focusedDepth,
      state.selectedDepth,
      null,
      createTransition("expand_or_reveal", "materialized_next_structural_level", true)
    );
  }

  function selectDepth(state, depth) {
    if (!state || state.kind !== MODEL_KIND) {
      throw new TypeError("selectDepth requires an interactive_pullback_tower model.");
    }
    assertDepth(depth, "Selection target depth");
    if (depth > state.presentation.visibleDepth) {
      throw new RangeError("Selection target must be materialized and presentation-visible.");
    }

    return buildState({
      sourceScene: state.sourceScene,
      baseModel: state.baseModel,
      oneStepModel: state.oneStepModel,
      runtimeScene: state.runtimeScene,
      recursiveModel: state.recursiveModel,
      zoomModel: state.zoomModel,
      organizationModel: state.organizationModel,
      selectedDepth: depth,
      collapsedDepth: state.presentation.collapsedDepth,
      transition: createTransition("select", "selection_updated", false)
    });
  }

  function refocusDepth(state, depth) {
    if (!state || state.kind !== MODEL_KIND) {
      throw new TypeError("refocusDepth requires an interactive_pullback_tower model.");
    }
    assertDepth(depth, "Focus target depth");
    if (depth > state.presentation.visibleDepth) {
      throw new RangeError("Focus target must be materialized and presentation-visible.");
    }

    return rebuildFocusedState(
      state,
      state.recursiveModel,
      state.runtimeScene,
      depth,
      state.selectedDepth,
      state.presentation.collapsedDepth,
      createTransition("refocus", "focus_updated", false)
    );
  }

  function collapseSelected(state) {
    if (!state || state.kind !== MODEL_KIND) {
      throw new TypeError("collapseSelected requires an interactive_pullback_tower model.");
    }
    if (state.selectedDepth < state.focusedDepth) {
      throw new RangeError("Refocus at or above the selected level before collapsing its descendants.");
    }
    if (state.selectedDepth >= state.materializedDepth) {
      return buildState({
        sourceScene: state.sourceScene,
        baseModel: state.baseModel,
        oneStepModel: state.oneStepModel,
        runtimeScene: state.runtimeScene,
        recursiveModel: state.recursiveModel,
        zoomModel: state.zoomModel,
        organizationModel: state.organizationModel,
        selectedDepth: state.selectedDepth,
        collapsedDepth: state.presentation.collapsedDepth,
        transition: createTransition("collapse", "no_descendants_to_hide", false)
      });
    }

    return buildState({
      sourceScene: state.sourceScene,
      baseModel: state.baseModel,
      oneStepModel: state.oneStepModel,
      runtimeScene: state.runtimeScene,
      recursiveModel: state.recursiveModel,
      zoomModel: state.zoomModel,
      organizationModel: state.organizationModel,
      selectedDepth: state.selectedDepth,
      collapsedDepth: state.selectedDepth,
      transition: createTransition("collapse", "presentation_descendants_hidden", false)
    });
  }

  function normalizePresentationRenderDepths(model, presentationOptions) {
    const renderDepths = presentationOptions?.renderDepths ?? null;
    if (renderDepths === null) return null;
    if (!Array.isArray(renderDepths) || renderDepths.length === 0) {
      throw new TypeError("Virtualized interaction rendering requires a non-empty renderDepths array.");
    }
    const normalized = Array.from(new Set(renderDepths.map((depth) => {
      assertDepth(depth, "Interaction render depth");
      if (depth > model.presentation.visibleDepth) {
        throw new RangeError("Interaction render depth must remain presentation-visible.");
      }
      return depth;
    }))).sort((left, right) => left - right);
    if (!normalized.includes(0) || !normalized.includes(model.selectedDepth) || !normalized.includes(model.focusedDepth)) {
      throw new RangeError("Virtualized interaction rendering must retain base, selected, and focused depths.");
    }
    return Object.freeze(normalized);
  }

  function buildBreadcrumbMarkup(model, presentationOptions = null) {
    const renderDepths = normalizePresentationRenderDepths(model, presentationOptions);
    const renderDepthSet = renderDepths === null ? null : new Set(renderDepths);
    const items = renderDepthSet === null
      ? model.breadcrumb
      : model.breadcrumb.filter((item) => renderDepthSet.has(item.depth));
    const markup = [];
    let previousDepth = null;

    for (const item of items) {
      if (previousDepth !== null && item.depth > previousDepth + 1) {
        markup.push(`<li class="interaction-breadcrumb__gap" aria-hidden="true">… ${String(item.depth - previousDepth - 1)} view-pruned levels …</li>`);
      }
      const annotations = [];
      if (item.selected) annotations.push("selected");
      if (item.focused) annotations.push("focused");
      const suffix = annotations.length > 0 ? ` <span>(${annotations.join(", ")})</span>` : "";
      const current = item.selected ? ' aria-current="page"' : "";
      markup.push(`<li${current}><span class="interaction-breadcrumb__level">${item.label}</span>${suffix}</li>`);
      previousDepth = item.depth;
    }
    return markup.join("");
  }

  function buildLevelControlMarkup(model, presentationOptions = null) {
    const renderDepths = normalizePresentationRenderDepths(model, presentationOptions);
    const depths = renderDepths === null
      ? Array.from({length: model.presentation.visibleDepth + 1}, (_, depth) => depth)
      : renderDepths;
    const rows = [];
    let previousDepth = null;

    for (const depth of depths) {
      if (previousDepth !== null && depth > previousDepth + 1) {
        rows.push(`<div class="interaction-level-gap" aria-hidden="true">… ${String(depth - previousDepth - 1)} materialized levels view-pruned …</div>`);
      }
      const label = formatLevel(depth);
      rows.push([
        `<div class="interaction-level-row" data-level-depth="${String(depth)}">`,
        `<span class="interaction-level-row__label">${label}</span>`,
        `<button type="button" data-interaction-action="select" data-depth="${String(depth)}" aria-pressed="${String(depth === model.selectedDepth)}">Select ${label}</button>`,
        `<button type="button" data-interaction-action="refocus" data-depth="${String(depth)}" aria-pressed="${String(depth === model.focusedDepth)}">Refocus ${label}</button>`,
        "</div>"
      ].join(""));
      previousDepth = depth;
    }
    return rows.join("");
  }

  function renderInteractivePullbackTower(model, target, presentationOptions = null) {
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Interactive pullback renderer requires an interactive_pullback_tower model.");
    }
    if (!target || typeof target !== "object" || !target.dataset || !("innerHTML" in target)) {
      throw new TypeError("Interactive pullback target must expose dataset and innerHTML.");
    }

    const expandLabel = model.presentation.collapsed ? "Reveal collapsed levels" : "Expand next level";
    const canCollapse = model.selectedDepth >= model.focusedDepth && model.selectedDepth < model.materializedDepth;
    const collapsedText = model.presentation.collapsedDepth === null ? "none" : formatLevel(model.presentation.collapsedDepth);
    const presentationRenderDepths = normalizePresentationRenderDepths(model, presentationOptions);

    target.hidden = false;
    target.dataset.state = "ready";
    target.dataset.selectedDepth = String(model.selectedDepth);
    target.dataset.focusedDepth = String(model.focusedDepth);
    target.dataset.materializedDepth = String(model.materializedDepth);
    target.dataset.requestedDepth = String(model.requestedDepth);
    target.dataset.sourceRequestedDepth = String(model.sourceRequestedDepth);
    target.dataset.visibleDepth = String(model.presentation.visibleDepth);
    target.dataset.collapsedDepth = model.presentation.collapsedDepth === null ? "" : String(model.presentation.collapsedDepth);
    target.dataset.geometryRendered = "false";
    target.dataset.sheetsMaterialized = "false";
    target.dataset.coveringStructureClaimed = "false";
    target.dataset.geometricZoomApplied = "false";
    target.dataset.cameraTransformApplied = "false";
    target.dataset.renderVirtualized = String(presentationRenderDepths !== null);
    target.dataset.renderWindowStartDepth = presentationOptions?.renderWindowStartDepth === undefined ? "" : String(presentationOptions.renderWindowStartDepth);
    target.dataset.renderWindowEndDepth = presentationOptions?.renderWindowEndDepth === undefined ? "" : String(presentationOptions.renderWindowEndDepth);
    target.dataset.activeRenderedDepthCount = String(presentationRenderDepths === null ? model.presentation.visibleDepth + 1 : presentationRenderDepths.length);

    target.innerHTML = [
      '<div class="interaction-toolbar">',
      `<button type="button" data-interaction-action="expand-or-reveal">${expandLabel}</button>`,
      `<button type="button" data-interaction-action="collapse-selected"${canCollapse ? "" : " disabled"}>Collapse descendants of selected level</button>`,
      "</div>",
      `<p class="interaction-summary">Selected ${formatLevel(model.selectedDepth)} · focused ${formatLevel(model.focusedDepth)} · materialized ${String(model.materializedDepth)} · interaction requested ${String(model.requestedDepth)} · visible ${String(model.presentation.visibleDepth)} · collapsed at ${collapsedText}</p>`,
      '<nav class="interaction-breadcrumb" aria-label="Structural pullback breadcrumb"><ol>',
      buildBreadcrumbMarkup(model, presentationOptions),
      "</ol></nav>",
      '<div class="interaction-level-controls" aria-label="Materialized structural level controls">',
      buildLevelControlMarkup(model, presentationOptions),
      "</div>",
      `<p class="interaction-transition" role="status">Last transition: ${model.transition.action} · ${model.transition.outcome} · structural descriptor materialization=${String(model.transition.structuralDescriptorMaterializationTriggered)} · geometric materialization=false · sheet materialization=false</p>`
    ].join("");

    return model;
  }

  const api = Object.freeze({
    MODEL_KIND,
    TRANSITION_KIND,
    createInteractivePullbackTowerModel,
    expandOrReveal,
    selectDepth,
    refocusDepth,
    collapseSelected,
    renderInteractivePullbackTower
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.InteractivePullbackTower = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

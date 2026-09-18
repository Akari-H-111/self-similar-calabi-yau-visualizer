"use strict";

(function attachInfiniteNavigationRenderer(globalObject) {
  const MODEL_KIND = "infinite_navigation_renderer";
  const WINDOW_KIND = "viewport_render_window";
  const POOL_KIND = "presentation_render_slot_pool";
  const DEFAULT_VIEWPORT_LEVEL_CAPACITY = 9;
  const DEFAULT_OVERSCAN_LEVELS = 2;
  const VIRTUAL_NODE_STEP = 116;

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
    return "X" + formatSubscriptNumber(depth);
  }

  function assertDepth(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new TypeError(label + " must be a nonnegative safe integer.");
    }
    return value;
  }

  function assertPositiveSafeInteger(value, label) {
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new TypeError(label + " must be a positive safe integer.");
    }
    return value;
  }

  function createPolicy(options = {}) {
    const viewportLevelCapacity = options.viewportLevelCapacity === undefined
      ? DEFAULT_VIEWPORT_LEVEL_CAPACITY
      : assertPositiveSafeInteger(options.viewportLevelCapacity, "viewportLevelCapacity");
    const overscanLevels = options.overscanLevels === undefined
      ? DEFAULT_OVERSCAN_LEVELS
      : assertDepth(options.overscanLevels, "overscanLevels");

    const configuredSpan = viewportLevelCapacity + 2 * overscanLevels;
    if (!Number.isSafeInteger(configuredSpan) || configuredSpan < 1) {
      throw new RangeError("Viewport capacity plus overscan must remain a positive safe-integer presentation span.");
    }

    return Object.freeze({
      viewportLevelCapacity,
      overscanLevels,
      configuredSpan
    });
  }

  function clampDepth(value, maximum) {
    return Math.min(maximum, Math.max(0, value));
  }

  function createSnapshot(values) {
    if (!values || typeof values !== "object") {
      throw new TypeError("Renderer snapshot must be an object.");
    }

    const semanticMaterializedDepth = assertDepth(values.semanticMaterializedDepth, "semanticMaterializedDepth");
    const presentationVisibleDepth = assertDepth(values.presentationVisibleDepth, "presentationVisibleDepth");
    if (presentationVisibleDepth > semanticMaterializedDepth) {
      throw new RangeError("presentationVisibleDepth cannot exceed semanticMaterializedDepth.");
    }

    const selectedDepth = assertDepth(values.selectedDepth, "selectedDepth");
    const focusedDepth = assertDepth(values.focusedDepth, "focusedDepth");
    if (selectedDepth > presentationVisibleDepth || focusedDepth > presentationVisibleDepth) {
      throw new RangeError("Selected/focused depth must remain presentation-visible.");
    }

    const collapsedDepth = values.collapsedDepth === null || values.collapsedDepth === undefined
      ? null
      : assertDepth(values.collapsedDepth, "collapsedDepth");
    if (collapsedDepth !== null && collapsedDepth !== presentationVisibleDepth) {
      throw new RangeError("collapsedDepth must equal presentationVisibleDepth when present.");
    }

    return Object.freeze({
      semanticMaterializedDepth,
      presentationVisibleDepth,
      selectedDepth,
      focusedDepth,
      collapsedDepth
    });
  }

  function snapshotFromInteraction(interactionModel) {
    if (!interactionModel || typeof interactionModel !== "object") {
      throw new TypeError("Infinite navigation renderer requires an interaction model.");
    }
    if (!interactionModel.presentation || typeof interactionModel.presentation !== "object") {
      throw new TypeError("Interaction model must expose presentation state.");
    }

    return createSnapshot({
      semanticMaterializedDepth: interactionModel.materializedDepth,
      presentationVisibleDepth: interactionModel.presentation.visibleDepth,
      selectedDepth: interactionModel.selectedDepth,
      focusedDepth: interactionModel.focusedDepth,
      collapsedDepth: interactionModel.presentation.collapsedDepth
    });
  }

  function contiguousWindow(snapshot, policy, anchorDepth) {
    const visibleDepth = snapshot.presentationVisibleDepth;
    const anchor = clampDepth(assertDepth(anchorDepth, "virtualAnchorDepth"), visibleDepth);
    const capacity = policy.viewportLevelCapacity;

    let coreStart = Math.max(0, anchor - Math.floor((capacity - 1) / 2));
    let coreEnd = Math.min(visibleDepth, coreStart + capacity - 1);
    coreStart = Math.max(0, coreEnd - capacity + 1);

    const windowStart = Math.max(0, coreStart - policy.overscanLevels);
    const windowEnd = Math.min(visibleDepth, coreEnd + policy.overscanLevels);

    const depths = [];
    for (let depth = windowStart; depth <= windowEnd; depth += 1) {
      depths.push(depth);
    }

    return Object.freeze({
      kind: WINDOW_KIND,
      virtualAnchorDepth: anchor,
      coreStartDepth: coreStart,
      coreEndDepth: coreEnd,
      renderWindowStartDepth: windowStart,
      renderWindowEndDepth: windowEnd,
      contiguousDepths: Object.freeze(depths)
    });
  }

  function activeDepthsForWindow(snapshot, windowDescriptor) {
    const depths = new Set(windowDescriptor.contiguousDepths);
    depths.add(0);
    depths.add(snapshot.selectedDepth);
    depths.add(snapshot.focusedDepth);
    if (snapshot.selectedDepth > 0) depths.add(snapshot.selectedDepth - 1);
    if (snapshot.focusedDepth > 0) depths.add(snapshot.focusedDepth - 1);
    return Object.freeze(Array.from(depths).sort((left, right) => left - right));
  }

  function samePolicy(left, right) {
    return Boolean(
      left &&
      right &&
      left.viewportLevelCapacity === right.viewportLevelCapacity &&
      left.overscanLevels === right.overscanLevels &&
      left.configuredSpan === right.configuredSpan
    );
  }

  function createPresentationPool(previousState, activeDepths, policy) {
    const reusablePrevious = previousState && samePolicy(previousState.policy, policy)
      ? previousState
      : null;
    const previousBindings = reusablePrevious ? reusablePrevious.presentationPool.bindings : [];
    const previousPoolSize = reusablePrevious ? reusablePrevious.presentationPool.poolSize : 0;
    const previousBySlot = new Map(previousBindings.map((binding) => [binding.slotId, binding.boundDepth]));

    const poolSize = Math.max(previousPoolSize, activeDepths.length);
    const slots = Object.freeze(Array.from({length: poolSize}, (_, index) => Object.freeze({
      slotId: "render-slot-" + String(index)
    })));

    let recycledCount = 0;
    const bindings = Object.freeze(activeDepths.map((depth, index) => {
      const slotId = "render-slot-" + String(index);
      const previousDepth = previousBySlot.has(slotId) ? previousBySlot.get(slotId) : null;
      if (previousDepth !== null && previousDepth !== depth) recycledCount += 1;
      return Object.freeze({
        slotId,
        boundDepth: depth
      });
    }));

    const releasedCount = Math.max(0, previousBindings.length - bindings.length);
    const createdCount = Math.max(0, activeDepths.length - previousPoolSize);

    return Object.freeze({
      kind: POOL_KIND,
      slots,
      bindings,
      poolSize,
      activeBindingCount: bindings.length,
      recycledCount,
      releasedCount,
      createdCount
    });
  }

  function configuredActiveBound(snapshot, policy) {
    const contiguousCapacity = snapshot.presentationVisibleDepth >= policy.configuredSpan - 1
      ? policy.configuredSpan
      : snapshot.presentationVisibleDepth + 1;
    return contiguousCapacity + 5;
  }

  function createStateFromSnapshot(snapshotInput, previousState = null, options = {}) {
    const snapshot = createSnapshot(snapshotInput);
    const policy = createPolicy(options.policy || previousState?.policy || {});
    const requestedAnchor = options.anchorDepth === undefined
      ? (previousState?.virtualAnchorDepth ?? snapshot.focusedDepth)
      : options.anchorDepth;
    const windowDescriptor = contiguousWindow(snapshot, policy, requestedAnchor);
    const activeRenderedDepths = activeDepthsForWindow(snapshot, windowDescriptor);
    const activeBound = configuredActiveBound(snapshot, policy);

    if (activeRenderedDepths.length > activeBound) {
      throw new Error("Active render set exceeded the deterministic viewport bound.");
    }

    const presentationPool = createPresentationPool(previousState, activeRenderedDepths, policy);
    if (presentationPool.poolSize > activeBound) {
      throw new Error("Presentation pool exceeded the deterministic viewport bound.");
    }

    return Object.freeze({
      kind: MODEL_KIND,
      semanticMaterializedDepth: snapshot.semanticMaterializedDepth,
      presentationVisibleDepth: snapshot.presentationVisibleDepth,
      selectedDepth: snapshot.selectedDepth,
      focusedDepth: snapshot.focusedDepth,
      collapsedDepth: snapshot.collapsedDepth,
      virtualAnchorDepth: windowDescriptor.virtualAnchorDepth,
      renderWindowStartDepth: windowDescriptor.renderWindowStartDepth,
      renderWindowEndDepth: windowDescriptor.renderWindowEndDepth,
      coreWindowStartDepth: windowDescriptor.coreStartDepth,
      coreWindowEndDepth: windowDescriptor.coreEndDepth,
      activeRenderedDepths,
      activeRenderedDepthCount: activeRenderedDepths.length,
      configuredActiveBound: activeBound,
      policy,
      presentationPool,
      truthfulness: Object.freeze({
        geometryRendered: false,
        sheetsMaterialized: false,
        coveringStructureClaimed: false,
        geometricZoomApplied: false,
        semanticMaterializationTriggered: false
      })
    });
  }

  function createInfiniteNavigationRendererState(interactionModel, previousState = null, options = {}) {
    return createStateFromSnapshot(snapshotFromInteraction(interactionModel), previousState, options);
  }

  function rebaseRendererState(state, interactionModel, depth) {
    if (!state || state.kind !== MODEL_KIND) {
      throw new TypeError("rebaseRendererState requires an infinite navigation renderer state.");
    }
    const targetDepth = assertDepth(depth, "rebase depth");
    if (targetDepth > interactionModel.presentation.visibleDepth) {
      throw new RangeError("Cannot rebase the render window beyond presentation-visible depth.");
    }
    return createInfiniteNavigationRendererState(interactionModel, state, {
      policy: state.policy,
      anchorDepth: targetDepth
    });
  }

  function createStructuralPresentationOptions(state) {
    if (!state || state.kind !== MODEL_KIND) {
      throw new TypeError("Structural presentation options require an infinite navigation renderer state.");
    }
    return Object.freeze({
      renderDepths: state.activeRenderedDepths,
      virtualAnchorDepth: state.virtualAnchorDepth,
      renderWindowStartDepth: state.renderWindowStartDepth,
      renderWindowEndDepth: state.renderWindowEndDepth
    });
  }

  function createInteractionPresentationOptions(state) {
    if (!state || state.kind !== MODEL_KIND) {
      throw new TypeError("Interaction presentation options require an infinite navigation renderer state.");
    }
    return Object.freeze({
      renderDepths: state.activeRenderedDepths,
      renderWindowStartDepth: state.renderWindowStartDepth,
      renderWindowEndDepth: state.renderWindowEndDepth
    });
  }

  function describeVirtualDepth(state, depth, nodeStep = VIRTUAL_NODE_STEP) {
    if (!state || state.kind !== MODEL_KIND) {
      throw new TypeError("Virtual depth description requires an infinite navigation renderer state.");
    }
    const targetDepth = assertDepth(depth, "virtual depth");
    const step = assertPositiveSafeInteger(nodeStep, "nodeStep");
    const relativeExact = BigInt(targetDepth) - BigInt(state.virtualAnchorDepth);
    const maximumExactRelative = BigInt(Math.floor(Number.MAX_SAFE_INTEGER / step));
    const absoluteRelative = relativeExact < 0n ? -relativeExact : relativeExact;
    const localCoordinateAvailable = absoluteRelative <= maximumExactRelative;

    return Object.freeze({
      depth: targetDepth,
      semanticMaterialized: targetDepth <= state.semanticMaterializedDepth,
      presentationVisible: targetDepth <= state.presentationVisibleDepth,
      currentlyRendered: state.activeRenderedDepths.includes(targetDepth),
      anchorDepth: state.virtualAnchorDepth,
      relativeDepthExact: relativeExact.toString(),
      localCoordinateAvailable,
      localOffset: localCoordinateAvailable ? Number(relativeExact) * step : null
    });
  }


  function renderVirtualizedInteractionPresentation(interactionModel, state, target) {
    if (!interactionModel || typeof interactionModel !== "object" || !interactionModel.presentation) {
      throw new TypeError("Virtualized interaction rendering requires the sealed interaction model.");
    }
    if (!state || state.kind !== MODEL_KIND) {
      throw new TypeError("Virtualized interaction rendering requires an infinite navigation renderer state.");
    }
    if (!target || typeof target !== "object" || !target.dataset || !("innerHTML" in target)) {
      throw new TypeError("Virtualized interaction target must expose dataset and innerHTML.");
    }
    if (
      interactionModel.materializedDepth !== state.semanticMaterializedDepth ||
      interactionModel.presentation.visibleDepth !== state.presentationVisibleDepth ||
      interactionModel.selectedDepth !== state.selectedDepth ||
      interactionModel.focusedDepth !== state.focusedDepth
    ) {
      throw new TypeError("Renderer state must match the current sealed interaction model.");
    }

    const activeDepths = state.activeRenderedDepths;
    const activeSet = new Set(activeDepths);
    const canCollapse = (
      interactionModel.selectedDepth >= interactionModel.focusedDepth &&
      interactionModel.selectedDepth < interactionModel.materializedDepth
    );
    const expandLabel = interactionModel.presentation.collapsed ? "Reveal collapsed levels" : "Expand next level";
    const collapsedText = interactionModel.presentation.collapsedDepth === null
      ? "none"
      : formatLevel(interactionModel.presentation.collapsedDepth);

    const breadcrumbMarkup = [];
    let previousBreadcrumbDepth = null;
    for (const item of interactionModel.breadcrumb.filter((candidate) => activeSet.has(candidate.depth))) {
      if (previousBreadcrumbDepth !== null && item.depth > previousBreadcrumbDepth + 1) {
        breadcrumbMarkup.push(
          '<li class="interaction-breadcrumb__gap" aria-hidden="true">… ' +
          String(item.depth - previousBreadcrumbDepth - 1) +
          " view-pruned levels …</li>"
        );
      }
      const annotations = [];
      if (item.selected) annotations.push("selected");
      if (item.focused) annotations.push("focused");
      const suffix = annotations.length > 0 ? " <span>(" + annotations.join(", ") + ")</span>" : "";
      const current = item.selected ? ' aria-current="page"' : "";
      breadcrumbMarkup.push(
        "<li" + current + '><span class="interaction-breadcrumb__level">' +
        item.label +
        "</span>" +
        suffix +
        "</li>"
      );
      previousBreadcrumbDepth = item.depth;
    }

    const levelRows = [];
    let previousDepth = null;
    for (const depth of activeDepths) {
      if (previousDepth !== null && depth > previousDepth + 1) {
        levelRows.push(
          '<div class="interaction-level-gap" aria-hidden="true">… ' +
          String(depth - previousDepth - 1) +
          " materialized levels view-pruned …</div>"
        );
      }
      const label = formatLevel(depth);
      levelRows.push([
        '<div class="interaction-level-row" data-level-depth="' + String(depth) + '">',
        '<span class="interaction-level-row__label">' + label + "</span>",
        '<button type="button" data-interaction-action="select" data-depth="' + String(depth) + '" aria-pressed="' + String(depth === interactionModel.selectedDepth) + '">Select ' + label + "</button>",
        '<button type="button" data-interaction-action="refocus" data-depth="' + String(depth) + '" aria-pressed="' + String(depth === interactionModel.focusedDepth) + '">Refocus ' + label + "</button>",
        "</div>"
      ].join(""));
      previousDepth = depth;
    }

    target.hidden = false;
    target.dataset.state = "ready";
    target.dataset.selectedDepth = String(interactionModel.selectedDepth);
    target.dataset.focusedDepth = String(interactionModel.focusedDepth);
    target.dataset.materializedDepth = String(interactionModel.materializedDepth);
    target.dataset.requestedDepth = String(interactionModel.requestedDepth);
    target.dataset.sourceRequestedDepth = String(interactionModel.sourceRequestedDepth);
    target.dataset.visibleDepth = String(interactionModel.presentation.visibleDepth);
    target.dataset.collapsedDepth = interactionModel.presentation.collapsedDepth === null
      ? ""
      : String(interactionModel.presentation.collapsedDepth);
    target.dataset.geometryRendered = "false";
    target.dataset.sheetsMaterialized = "false";
    target.dataset.coveringStructureClaimed = "false";
    target.dataset.geometricZoomApplied = "false";
    target.dataset.cameraTransformApplied = "false";
    target.dataset.renderVirtualized = "true";
    target.dataset.renderWindowStartDepth = String(state.renderWindowStartDepth);
    target.dataset.renderWindowEndDepth = String(state.renderWindowEndDepth);
    target.dataset.activeRenderedDepthCount = String(state.activeRenderedDepthCount);

    target.innerHTML = [
      '<div class="interaction-toolbar">',
      '<button type="button" data-interaction-action="expand-or-reveal">' + expandLabel + "</button>",
      '<button type="button" data-interaction-action="collapse-selected"' + (canCollapse ? "" : " disabled") + ">Collapse descendants of selected level</button>",
      "</div>",
      '<p class="interaction-summary">Selected ' + formatLevel(interactionModel.selectedDepth) +
        " · focused " + formatLevel(interactionModel.focusedDepth) +
        " · materialized " + String(interactionModel.materializedDepth) +
        " · interaction requested " + String(interactionModel.requestedDepth) +
        " · visible " + String(interactionModel.presentation.visibleDepth) +
        " · active render objects " + String(state.activeRenderedDepthCount) +
        " · collapsed at " + collapsedText + "</p>",
      '<nav class="interaction-breadcrumb" aria-label="Structural pullback breadcrumb"><ol>',
      breadcrumbMarkup.join(""),
      "</ol></nav>",
      '<div class="interaction-level-controls" aria-label="Materialized structural level controls">',
      levelRows.join(""),
      "</div>",
      '<p class="interaction-transition" role="status">Last transition: ' +
        interactionModel.transition.action +
        " · " +
        interactionModel.transition.outcome +
        " · structural descriptor materialization=" +
        String(interactionModel.transition.structuralDescriptorMaterializationTriggered) +
        " · geometric materialization=false · sheet materialization=false</p>"
    ].join("");

    return state;
  }

  function projectOrganizationBadges(organizationTarget, structuralTarget) {
    const api = globalObject.BranchOrganizationGraphics;
    if (!api || typeof api.projectRenderedOrganization !== "function") {
      throw new TypeError("Infinite navigation renderer requires the sealed BranchOrganizationGraphics projection API.");
    }
    return api.projectRenderedOrganization(organizationTarget, structuralTarget);
  }

  function applyRendererStateToTarget(state, target) {
    if (!state || state.kind !== MODEL_KIND) {
      throw new TypeError("Renderer target projection requires an infinite navigation renderer state.");
    }
    if (!target || typeof target !== "object" || !target.dataset) {
      throw new TypeError("Renderer target must expose dataset.");
    }

    target.dataset.infiniteNavigationRenderer = "v0.19";
    target.dataset.semanticMaterializedDepth = String(state.semanticMaterializedDepth);
    target.dataset.presentationVisibleDepth = String(state.presentationVisibleDepth);
    target.dataset.virtualAnchorDepth = String(state.virtualAnchorDepth);
    target.dataset.renderWindowStartDepth = String(state.renderWindowStartDepth);
    target.dataset.renderWindowEndDepth = String(state.renderWindowEndDepth);
    target.dataset.activeRenderedDepthCount = String(state.activeRenderedDepthCount);
    target.dataset.presentationPoolSize = String(state.presentationPool.poolSize);
    target.dataset.geometryRendered = "false";
    target.dataset.sheetsMaterialized = "false";
    target.dataset.coveringStructureClaimed = "false";
    target.dataset.geometricZoomApplied = "false";
    return state;
  }

  const api = Object.freeze({
    MODEL_KIND,
    WINDOW_KIND,
    POOL_KIND,
    DEFAULT_VIEWPORT_LEVEL_CAPACITY,
    DEFAULT_OVERSCAN_LEVELS,
    VIRTUAL_NODE_STEP,
    createPolicy,
    createSnapshot,
    snapshotFromInteraction,
    createStateFromSnapshot,
    createInfiniteNavigationRendererState,
    rebaseRendererState,
    createStructuralPresentationOptions,
    createInteractionPresentationOptions,
    describeVirtualDepth,
    renderVirtualizedInteractionPresentation,
    projectOrganizationBadges,
    applyRendererStateToTarget
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.InfiniteNavigationRenderer = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

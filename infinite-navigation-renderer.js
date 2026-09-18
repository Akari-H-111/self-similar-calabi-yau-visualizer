"use strict";

(function attachInfiniteNavigationRenderer(globalObject) {
  const MODEL_KIND = "infinite_navigation_renderer";
  const WINDOW_KIND = "viewport_render_window";
  const POOL_KIND = "presentation_render_slot_pool";
  const DEFAULT_VIEWPORT_LEVEL_CAPACITY = 9;
  const DEFAULT_OVERSCAN_LEVELS = 2;
  const VIRTUAL_NODE_STEP = 116;

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

    return Object.freeze({
      viewportLevelCapacity,
      overscanLevels
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
    return Object.freeze(Array.from(depths).sort((left, right) => left - right));
  }

  function samePolicy(left, right) {
    return Boolean(
      left &&
      right &&
      left.viewportLevelCapacity === right.viewportLevelCapacity &&
      left.overscanLevels === right.overscanLevels
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
    const contiguousCapacity = Math.min(
      snapshot.presentationVisibleDepth + 1,
      policy.viewportLevelCapacity + 2 * policy.overscanLevels
    );
    return contiguousCapacity + 3;
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
    applyRendererStateToTarget
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.InfiniteNavigationRenderer = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

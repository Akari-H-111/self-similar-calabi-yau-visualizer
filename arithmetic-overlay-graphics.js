"use strict";

(function attachArithmeticOverlayGraphics(globalObject) {
  const MODEL_KIND = "arithmetic_overlay_graphics";
  const REPRESENTATION_KIND = "source_backed_symbolic_arithmetic_annotations";
  const ANNOTATION_KIND = "arithmetic_overlay_annotation";
  const SOURCE_CONTRACT = "arithmetic_overlays_model_output";
  const PRESENTATION_GAP = 8;

  const SUPPORTED_OVERLAY_IDS = Object.freeze([
    "coordinate_channels",
    "coordinate_iterate_rule"
  ]);

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

  function escapeXml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  function formatChannelLabel(label) {
    return String(label).replace(/_([0-9]+)/g, (_, digits) =>
      digits
        .split("")
        .map((digit) => SUBSCRIPT_DIGITS[digit] ?? digit)
        .join("")
    );
  }

  function assertFiniteNumber(value, label) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError(`${label} must be finite.`);
    }
    return value;
  }

  function assertNonnegativeSafeInteger(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new TypeError(`${label} must be a nonnegative safe integer.`);
    }
    return value;
  }

  function normalizeRectangle(rectangle, label) {
    if (!rectangle || typeof rectangle !== "object") {
      throw new TypeError(`${label} must be a rectangle object.`);
    }
    const x = assertFiniteNumber(rectangle.x, `${label}.x`);
    const y = assertFiniteNumber(rectangle.y, `${label}.y`);
    const width = assertFiniteNumber(rectangle.width, `${label}.width`);
    const height = assertFiniteNumber(rectangle.height, `${label}.height`);
    if (width <= 0 || height <= 0) {
      throw new RangeError(`${label} width and height must be positive.`);
    }
    return Object.freeze({ x, y, width, height });
  }

  function assertLayoutDescriptor(layoutDescriptor) {
    if (!layoutDescriptor || layoutDescriptor.kind !== "structural_visualization_layout") {
      throw new TypeError("Arithmetic overlay graphics require the structural_visualization_layout descriptor.");
    }
    const canonicalViewBox = normalizeRectangle(layoutDescriptor.canonicalViewBox, "canonicalViewBox");
    if (!layoutDescriptor.rulePanel || !Array.isArray(layoutDescriptor.levelBounds)) {
      throw new TypeError("Arithmetic overlay graphics require rulePanel and levelBounds anchors.");
    }
    const rulePanel = Object.freeze({
      x: assertFiniteNumber(layoutDescriptor.rulePanel.x, "rulePanel.x"),
      width: assertFiniteNumber(layoutDescriptor.rulePanel.width, "rulePanel.width")
    });
    if (rulePanel.width <= 0) {
      throw new RangeError("rulePanel.width must be positive.");
    }
    const levelBounds = Object.freeze(layoutDescriptor.levelBounds.map((level, index) => {
      const normalized = normalizeRectangle(level, `levelBounds[${String(index)}]`);
      return Object.freeze({
        depth: assertNonnegativeSafeInteger(level.depth, `levelBounds[${String(index)}].depth`),
        ...normalized
      });
    }));
    return Object.freeze({ canonicalViewBox, rulePanel, levelBounds });
  }

  function assertArithmeticOverlayModel(model) {
    if (!model || model.kind !== "arithmetic_overlays") {
      throw new TypeError("Arithmetic overlay graphics require the sealed arithmetic_overlays model output.");
    }
    if (!Array.isArray(model.enabledOverlays) || !Array.isArray(model.overlayDescriptors)) {
      throw new TypeError("Arithmetic overlay graphics require enabledOverlays and overlayDescriptors.");
    }
    if (
      model.recursionModified !== false ||
      model.zoomModified !== false ||
      model.sheetOrganizationModified !== false ||
      model.materializationTriggered !== false ||
      model.geometryRendered !== false
    ) {
      throw new TypeError("Arithmetic overlay graphics cannot consume arithmetic state that mutates runtime semantics or geometry.");
    }

    for (const overlayId of model.enabledOverlays) {
      if (!SUPPORTED_OVERLAY_IDS.includes(overlayId)) {
        throw new TypeError(`Arithmetic overlay graphics do not admit unsupported overlay id ${JSON.stringify(overlayId)}.`);
      }
    }

    const descriptorIds = model.overlayDescriptors.map((descriptor) => descriptor?.overlayId);
    if (new Set(descriptorIds).size !== descriptorIds.length) {
      throw new TypeError("Arithmetic overlay graphics require unique enabled overlay descriptors.");
    }
    if (
      descriptorIds.length !== model.enabledOverlays.length ||
      descriptorIds.some((overlayId) => !model.enabledOverlays.includes(overlayId))
    ) {
      throw new TypeError("Arithmetic overlay descriptor ids must match the enabled arithmetic overlay set.");
    }
  }

  function evidenceFromDescriptor(descriptor) {
    const source = descriptor.canonicalSource;
    if (!source || typeof source.artifact !== "string" || typeof source.sourceVersion !== "string") {
      throw new TypeError(`Arithmetic overlay ${descriptor.overlayId} requires exact canonical source provenance.`);
    }
    return Object.freeze({
      evidenceClass: descriptor.evidenceClass,
      formalSupport: descriptor.formalSupport ?? null,
      theoremIdentity: descriptor.theoremIdentity ?? null,
      canonicalSource: Object.freeze({
        artifact: source.artifact,
        sourceVersion: source.sourceVersion,
        blobSha: source.blobSha ?? null,
        formalSealCommit: source.formalSealCommit ?? null
      })
    });
  }

  function truthfulnessFlags() {
    return Object.freeze({
      geometryRendered: false,
      sheetsMaterialized: false,
      coveringStructureClaimed: false,
      geometricZoomApplied: false,
      materializationTriggered: false
    });
  }

  function createCoordinateChannelsAnnotation(descriptor, layout) {
    if (
      descriptor.scope !== "global_system_metadata" ||
      descriptor.evidenceClass !== "source_backed_structural_representation" ||
      descriptor.formalSupport !== "formal_theorem" ||
      descriptor.geometryRendered !== false ||
      descriptor.materializationTriggered !== false ||
      !Array.isArray(descriptor.channels) ||
      descriptor.channels.length === 0
    ) {
      throw new TypeError("coordinate_channels descriptor does not satisfy the sealed v0.09 source-backed structural contract.");
    }

    const baseLevel = layout.levelBounds.find((level) => level.depth === 0);
    if (!baseLevel) {
      throw new TypeError("coordinate_channels graphics require the visible X_0 structural anchor.");
    }

    const x = layout.rulePanel.x + layout.rulePanel.width + PRESENTATION_GAP;
    const rightEdge = layout.canonicalViewBox.x + layout.canonicalViewBox.width - PRESENTATION_GAP;
    const width = Math.min(78, rightEdge - x);
    if (width < 56) {
      throw new RangeError("Structural layout has insufficient right-side space for the coordinate-channel annotation lane.");
    }
    const height = Math.min(baseLevel.height, 72);
    const labels = Object.freeze(descriptor.channels.map((channel) => {
      if (!channel || typeof channel.displayLabel !== "string") {
        throw new TypeError("coordinate_channels graphics require source descriptor channel labels.");
      }
      return channel.displayLabel;
    }));

    return Object.freeze({
      kind: ANNOTATION_KIND,
      overlayId: descriptor.overlayId,
      overlayKind: "coordinate_channel_marker",
      semanticScope: descriptor.scope,
      attachmentTarget: Object.freeze({
        kind: "system_rule_panel_edge",
        structuralDepth: 0
      }),
      evidence: evidenceFromDescriptor(descriptor),
      payload: Object.freeze({
        coordinateCount: descriptor.coordinateCount,
        mapKind: descriptor.mapKind,
        exponentParameter: descriptor.exponentParameter,
        channelLabels: labels
      }),
      display: Object.freeze({
        primary: "coords",
        secondary: labels.map(formatChannelLabel).join(" "),
        status: "structural"
      }),
      x,
      y: baseLevel.y,
      width,
      height,
      truthfulness: truthfulnessFlags()
    });
  }

  function createCoordinateIterateRuleAnnotation(descriptor, layout) {
    if (
      descriptor.scope !== "focused_level_metadata" ||
      descriptor.evidenceClass !== "formal_theorem" ||
      descriptor.theoremIdentity !== "coordinatePower_iterate_apply" ||
      descriptor.geometryRendered !== false ||
      descriptor.materializationTriggered !== false ||
      !Array.isArray(descriptor.channels) ||
      descriptor.channels.length === 0
    ) {
      throw new TypeError("coordinate_iterate_rule descriptor does not satisfy the sealed v0.09 formal symbolic contract.");
    }

    const focusedDepth = assertNonnegativeSafeInteger(descriptor.focusedDepth, "focusedDepth");
    const level = layout.levelBounds.find((candidate) => candidate.depth === focusedDepth);
    if (!level) {
      throw new TypeError("coordinate_iterate_rule graphics require a visible layout anchor for the focused structural depth.");
    }

    const firstExpression = descriptor.channels[0]?.exponentExpression;
    if (!firstExpression || typeof firstExpression.baseParameter !== "string") {
      throw new TypeError("coordinate_iterate_rule graphics require the structured exponent expression from the arithmetic overlay descriptor.");
    }
    if (firstExpression.towerDepth !== focusedDepth) {
      throw new TypeError("coordinate_iterate_rule exponent depth must agree with the focused structural depth.");
    }
    for (const channel of descriptor.channels) {
      if (
        !channel ||
        channel.ruleKind !== "coordinate_power_iterate" ||
        channel.exponentExpression?.baseParameter !== firstExpression.baseParameter ||
        channel.exponentExpression?.towerDepth !== focusedDepth
      ) {
        throw new TypeError("coordinate_iterate_rule channels must share the exact source descriptor exponent expression.");
      }
    }

    const width = Math.min(68, layout.rulePanel.x - PRESENTATION_GAP - (level.x + level.width + PRESENTATION_GAP));
    if (width < 56) {
      throw new RangeError("Structural layout has insufficient node-to-rule-panel space for the focused iterate annotation.");
    }
    const height = Math.min(64, level.height);
    const displayExponent = String(focusedDepth).length <= 4
      ? `${firstExpression.baseParameter}^${String(focusedDepth)}`
      : `${firstExpression.baseParameter}^n`;

    return Object.freeze({
      kind: ANNOTATION_KIND,
      overlayId: descriptor.overlayId,
      overlayKind: "coordinate_iterate_rule_marker",
      semanticScope: descriptor.scope,
      attachmentTarget: Object.freeze({
        kind: "focused_structural_level",
        structuralDepth: focusedDepth
      }),
      evidence: evidenceFromDescriptor(descriptor),
      payload: Object.freeze({
        focusedDepth,
        coordinateCount: descriptor.coordinateCount,
        exponentExpression: Object.freeze({
          baseParameter: firstExpression.baseParameter,
          towerDepth: focusedDepth
        })
      }),
      display: Object.freeze({
        primary: "iterate",
        secondary: displayExponent,
        status: "Lean rule"
      }),
      x: level.x + level.width + PRESENTATION_GAP,
      y: level.y + (level.height - height) / 2,
      width,
      height,
      truthfulness: truthfulnessFlags()
    });
  }

  function createArithmeticOverlayGraphicsModel(arithmeticOverlayModel, layoutDescriptor) {
    assertArithmeticOverlayModel(arithmeticOverlayModel);
    const layout = assertLayoutDescriptor(layoutDescriptor);
    const annotations = [];

    for (const descriptor of arithmeticOverlayModel.overlayDescriptors) {
      if (descriptor.overlayId === "coordinate_channels") {
        annotations.push(createCoordinateChannelsAnnotation(descriptor, layout));
        continue;
      }
      if (descriptor.overlayId === "coordinate_iterate_rule") {
        annotations.push(createCoordinateIterateRuleAnnotation(descriptor, layout));
        continue;
      }
      throw new TypeError(`No v0.18 graphical projection exists for enabled overlay ${JSON.stringify(descriptor.overlayId)}.`);
    }

    return Object.freeze({
      kind: MODEL_KIND,
      representationKind: REPRESENTATION_KIND,
      sourceContract: SOURCE_CONTRACT,
      enabledOverlayIds: Object.freeze([...arithmeticOverlayModel.enabledOverlays]),
      annotationCount: annotations.length,
      annotations: Object.freeze(annotations),
      evidenceExposed: true,
      overlayStateIsPresentationOnly: true,
      recursionModified: false,
      focusModified: false,
      selectionModified: false,
      collapseModified: false,
      cameraModified: false,
      branchOrganizationModified: false,
      truthfulness: truthfulnessFlags()
    });
  }

  function buildAnnotationMarkup(annotation) {
    const source = annotation.evidence.canonicalSource;
    const sourceVersion = source.sourceVersion ?? "";
    const evidenceClass = annotation.evidence.evidenceClass ?? "";
    const formalSupport = annotation.evidence.formalSupport ?? "";
    const theoremIdentity = annotation.evidence.theoremIdentity ?? "";
    const depth = annotation.attachmentTarget.structuralDepth;
    const exactPayload = annotation.overlayId === "coordinate_iterate_rule"
      ? `${annotation.payload.exponentExpression.baseParameter}^${String(annotation.payload.exponentExpression.towerDepth)}`
      : annotation.payload.channelLabels.join(", ");
    const ariaLabel = annotation.overlayId === "coordinate_iterate_rule"
      ? (
          `Coordinate iterate rule symbolic annotation at structural depth ${String(depth)}: exponent ${exactPayload}. ` +
          `Evidence class ${evidenceClass}; theorem ${theoremIdentity}; source ${source.artifact}. No geometry is rendered.`
        )
      : (
          `Coordinate-channel symbolic annotation: ${exactPayload}. Evidence class ${evidenceClass} with ${formalSupport} support; ` +
          `source ${source.artifact}. No geometry is rendered.`
        );

    const centerX = annotation.x + annotation.width / 2;
    const firstY = annotation.y + 18;
    const secondY = annotation.y + 39;
    const thirdY = annotation.y + Math.min(annotation.height - 7, 58);

    return [
      `<g class="arithmetic-overlay-annotation arithmetic-overlay-annotation--${escapeXml(annotation.overlayKind)}" ` +
        `data-arithmetic-overlay-id="${escapeXml(annotation.overlayId)}" ` +
        `data-overlay-kind="${escapeXml(annotation.overlayKind)}" ` +
        `data-evidence-class="${escapeXml(evidenceClass)}" ` +
        `data-formal-support="${escapeXml(formalSupport)}" ` +
        `data-theorem-identity="${escapeXml(theoremIdentity)}" ` +
        `data-source-artifact="${escapeXml(source.artifact)}" ` +
        `data-source-version="${escapeXml(sourceVersion)}" ` +
        `data-attachment-kind="${escapeXml(annotation.attachmentTarget.kind)}" ` +
        `data-attachment-depth="${String(depth)}" ` +
        `data-geometry-rendered="false" data-sheets-materialized="false" data-covering-structure-claimed="false" ` +
        `role="img" aria-label="${escapeXml(ariaLabel)}">`,
      `<title>${escapeXml(ariaLabel)}</title>`,
      `<rect x="${String(annotation.x)}" y="${String(annotation.y)}" width="${String(annotation.width)}" height="${String(annotation.height)}" rx="10" />`,
      `<text class="arithmetic-overlay-annotation__primary" x="${String(centerX)}" y="${String(firstY)}" text-anchor="middle">${escapeXml(annotation.display.primary)}</text>`,
      `<text class="arithmetic-overlay-annotation__secondary" x="${String(centerX)}" y="${String(secondY)}" text-anchor="middle">${escapeXml(annotation.display.secondary)}</text>`,
      `<text class="arithmetic-overlay-annotation__status" x="${String(centerX)}" y="${String(thirdY)}" text-anchor="middle">${escapeXml(annotation.display.status)}</text>`,
      "</g>"
    ].join("");
  }

  function buildGraphicsMarkup(model) {
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Arithmetic overlay graphics markup requires an arithmetic_overlay_graphics model.");
    }
    return [
      `<g class="arithmetic-overlay-graphics" data-arithmetic-overlay-graphics="true" data-representation-kind="${escapeXml(model.representationKind)}" data-enabled-overlays="${escapeXml(model.enabledOverlayIds.join(","))}">`,
      "<desc>Source-backed symbolic arithmetic annotations attached to the structural canvas. These markers do not materialize arithmetic loci, sheets, fibers, or Calabi–Yau geometry.</desc>",
      model.annotations.map(buildAnnotationMarkup).join(""),
      "</g>"
    ].join("");
  }

  function resolveSurface(target) {
    if (!target || typeof target !== "object") {
      throw new TypeError("Arithmetic overlay graphics require the current structural visualization target.");
    }
    if (typeof target.querySelector === "function") {
      const surface = target.querySelector("svg.structural-visualization__surface");
      if (surface) return surface;
    }
    if (typeof target.insertAdjacentHTML === "function" && target.dataset) return target;
    throw new TypeError("Arithmetic overlay graphics target must expose the current structural SVG surface.");
  }

  function clearProjectionState(target) {
    if (!target?.dataset) return;
    for (const key of [
      "arithmeticOverlayGraphicsState",
      "arithmeticOverlayGraphicsRepresentation",
      "arithmeticOverlayGraphicsEnabled",
      "arithmeticOverlayGraphicsAnnotationCount"
    ]) {
      delete target.dataset[key];
    }
  }

  function renderArithmeticOverlayGraphics(model, target) {
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Arithmetic overlay graphics renderer requires an arithmetic_overlay_graphics model.");
    }
    const surface = resolveSurface(target);
    const existing = typeof surface.querySelector === "function"
      ? surface.querySelector('[data-arithmetic-overlay-graphics="true"]')
      : null;
    existing?.remove?.();
    surface.insertAdjacentHTML("beforeend", buildGraphicsMarkup(model));

    if (target.dataset) {
      target.dataset.arithmeticOverlayGraphicsState = model.annotationCount > 0 ? "active" : "idle";
      target.dataset.arithmeticOverlayGraphicsRepresentation = model.representationKind;
      target.dataset.arithmeticOverlayGraphicsEnabled = model.enabledOverlayIds.join(",");
      target.dataset.arithmeticOverlayGraphicsAnnotationCount = String(model.annotationCount);
    }

    return model;
  }

  function projectArithmeticOverlayGraphics(arithmeticOverlayModel, layoutDescriptor, structuralTarget) {
    const model = createArithmeticOverlayGraphicsModel(arithmeticOverlayModel, layoutDescriptor);
    renderArithmeticOverlayGraphics(model, structuralTarget);
    return model;
  }

  const api = Object.freeze({
    MODEL_KIND,
    REPRESENTATION_KIND,
    ANNOTATION_KIND,
    SOURCE_CONTRACT,
    SUPPORTED_OVERLAY_IDS,
    createArithmeticOverlayGraphicsModel,
    buildGraphicsMarkup,
    renderArithmeticOverlayGraphics,
    projectArithmeticOverlayGraphics,
    clearProjectionState
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.ArithmeticOverlayGraphics = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

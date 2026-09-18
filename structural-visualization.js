"use strict";

(function attachStructuralVisualization(globalObject) {
  const MODEL_KIND = "structural_visualization";
  const REPRESENTATION_KIND = "structural_svg_diagram";
  const NODE_KIND = "structural_level_node";
  const EDGE_KIND = "structural_pullback_edge";
  const LAYOUT_KIND = "structural_visualization_layout";

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

  function escapeXml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  function assertCompatibleInputs(scene, baseModel, recursiveModel, zoomModel, organizationModel, interactionModel) {
    if (!scene || !scene.mathematics || !scene.mathematics.parameters) {
      throw new TypeError("Structural visualization requires a validated normalized scene.");
    }
    if (!baseModel || baseModel.kind !== "base_scene") {
      throw new TypeError("Structural visualization requires the verified base_scene model.");
    }
    if (!recursiveModel || recursiveModel.kind !== "recursive_lazy_expansion") {
      throw new TypeError("Structural visualization requires the verified recursive_lazy_expansion model.");
    }
    if (!zoomModel || zoomModel.kind !== "structural_zoom_focus") {
      throw new TypeError("Structural visualization requires the verified structural_zoom_focus model.");
    }
    if (!organizationModel || organizationModel.kind !== "sheet_branch_organization") {
      throw new TypeError("Structural visualization requires the verified sheet_branch_organization model.");
    }
    if (recursiveModel.materializedDepth !== zoomModel.availableDepth) {
      throw new TypeError("Structural visualization requires recursive and zoom depth state to agree.");
    }
    if (organizationModel.materializedDepth !== recursiveModel.materializedDepth) {
      throw new TypeError("Structural visualization requires organization and recursive depth state to agree.");
    }
    if (organizationModel.focusedDepth !== zoomModel.focusedDepth) {
      throw new TypeError("Structural visualization requires organization and zoom focus state to agree.");
    }

    if (interactionModel !== undefined && interactionModel !== null) {
      if (interactionModel.kind !== "interactive_pullback_tower") {
        throw new TypeError("Structural visualization interaction metadata must come from interactive_pullback_tower.");
      }
      if (
        interactionModel.materializedDepth !== recursiveModel.materializedDepth ||
        interactionModel.requestedDepth !== recursiveModel.requestedDepth ||
        interactionModel.focusedDepth !== zoomModel.focusedDepth
      ) {
        throw new TypeError("Structural visualization interaction metadata must agree with runtime model depths.");
      }
      if (interactionModel.presentation.visibleDepth > recursiveModel.materializedDepth) {
        throw new TypeError("Structural visualization cannot display beyond the materialized runtime depth.");
      }
    }

    const W = scene.mathematics.baseHypersurface?.definingFunction;
    if (!W || W.representation !== "unresolved") {
      throw new TypeError("Structural visualization is restricted to the unresolved-W truth boundary.");
    }

    if (
      baseModel.geometryRendered ||
      recursiveModel.geometryRendered ||
      recursiveModel.sheetsMaterialized ||
      organizationModel.geometryRendered ||
      organizationModel.sheetsMaterialized ||
      organizationModel.coveringStructureClaimed ||
      zoomModel.geometricZoomApplied ||
      zoomModel.cameraTransformApplied ||
      zoomModel.materializationTriggered
    ) {
      throw new TypeError("Structural visualization cannot project inputs that claim geometric or sheet materialization.");
    }
  }

  function createNode(depth, focusedDepth, selectedDepth) {
    return Object.freeze({
      kind: NODE_KIND,
      depth,
      id: `X_${String(depth)}`,
      label: `X${formatSubscriptNumber(depth)}`,
      role: depth === 0 ? "base_structural_level" : "materialized_structural_level",
      focused: focusedDepth === depth,
      selected: selectedDepth === depth,
      geometryRendered: false,
      sheetsMaterialized: false
    });
  }

  function createEdge(level) {
    return Object.freeze({
      kind: EDGE_KIND,
      sourceDepth: level.sourceDepth,
      targetDepth: level.depth,
      relation: level.relation,
      label: "P_D⁻¹",
      geometryRendered: false,
      sheetsMaterialized: false,
      coveringStructureClaimed: false
    });
  }

  function normalizePresentationRenderDepths(renderDepths, visibleDepth, selectedDepth, focusedDepth) {
    if (renderDepths === null || renderDepths === undefined) return null;
    if (!Array.isArray(renderDepths) || renderDepths.length === 0) {
      throw new TypeError("Virtualized structural rendering requires a non-empty renderDepths array.");
    }

    const normalized = Array.from(new Set(renderDepths.map((depth) => {
      if (!Number.isSafeInteger(depth) || depth < 0 || depth > visibleDepth) {
        throw new RangeError("Each structural render depth must be a presentation-visible nonnegative safe integer.");
      }
      return depth;
    }))).sort((left, right) => left - right);

    if (!normalized.includes(0)) {
      throw new RangeError("Virtualized structural rendering must retain the base structural level X_0.");
    }
    if (selectedDepth !== null && !normalized.includes(selectedDepth)) {
      throw new RangeError("Virtualized structural rendering must retain the selected depth.");
    }
    if (focusedDepth !== null && !normalized.includes(focusedDepth)) {
      throw new RangeError("Virtualized structural rendering must retain the focused depth.");
    }
    return Object.freeze(normalized);
  }

  function createStructuralVisualizationModel(scene, baseModel, recursiveModel, zoomModel, organizationModel, interactionModel = null, presentationOptions = null) {
    assertCompatibleInputs(scene, baseModel, recursiveModel, zoomModel, organizationModel, interactionModel);

    const selectedDepth = interactionModel ? interactionModel.selectedDepth : null;
    const visibleDepth = interactionModel ? interactionModel.presentation.visibleDepth : recursiveModel.materializedDepth;
    const collapsedDepth = interactionModel ? interactionModel.presentation.collapsedDepth : null;
    const visibleLevels = recursiveModel.levels.filter((level) => level.depth <= visibleDepth);
    const presentationRenderDepths = normalizePresentationRenderDepths(
      presentationOptions?.renderDepths ?? null,
      visibleDepth,
      selectedDepth,
      zoomModel.focusedDepth
    );
    const renderedDepthSet = presentationRenderDepths === null ? null : new Set(presentationRenderDepths);
    const renderedLevels = renderedDepthSet === null
      ? visibleLevels
      : visibleLevels.filter((level) => renderedDepthSet.has(level.depth));
    const includeBase = renderedDepthSet === null || renderedDepthSet.has(0);

    const nodes = Object.freeze([
      ...(includeBase ? [createNode(0, zoomModel.focusedDepth, selectedDepth)] : []),
      ...renderedLevels.map((level) => createNode(level.depth, zoomModel.focusedDepth, selectedDepth))
    ]);
    const nodeDepthSet = new Set(nodes.map((node) => node.depth));
    const edges = Object.freeze(
      renderedLevels
        .filter((level) => nodeDepthSet.has(level.sourceDepth))
        .map(createEdge)
    );

    let continuation;
    if (collapsedDepth !== null && visibleDepth < recursiveModel.materializedDepth) {
      continuation = Object.freeze({
        present: true,
        status: "presentation_collapsed",
        nextDepth: visibleDepth + 1,
        label: "materialized structural descendants hidden by presentation collapse"
      });
    } else if (recursiveModel.materializedDepth < recursiveModel.requestedDepth) {
      continuation = Object.freeze({
        present: true,
        status: "not_materialized",
        nextDepth: recursiveModel.materializedDepth + 1,
        label: "next structural level not materialized"
      });
    } else {
      continuation = Object.freeze({
        present: false,
        status: "requested_frontier_reached",
        nextDepth: null,
        label: "requested structural frontier reached"
      });
    }

    const truthfulness = Object.freeze({
      geometryRendered: false,
      sheetsMaterialized: false,
      coveringStructureClaimed: false,
      geometricZoomApplied: false,
      cameraTransformApplied: false,
      materializationTriggered: false
    });

    return Object.freeze({
      kind: MODEL_KIND,
      representationKind: REPRESENTATION_KIND,
      structuralOnly: true,
      nodes,
      edges,
      continuation,
      renderState: Object.freeze({
        virtualized: presentationRenderDepths !== null,
        renderDepths: Object.freeze(nodes.map((node) => node.depth)),
        virtualAnchorDepth: presentationOptions?.virtualAnchorDepth ?? null,
        renderWindowStartDepth: presentationOptions?.renderWindowStartDepth ?? null,
        renderWindowEndDepth: presentationOptions?.renderWindowEndDepth ?? null
      }),
      rule: Object.freeze({
        recurrence: "Xₙ = P_D⁻¹(Xₙ₋₁)",
        closedForm: "Xₙ = (P_Dⁿ)⁻¹(X)",
        coordinateMap: "P_D(z₁,…,z₄) = (z₁ᴰ,…,z₄ᴰ)"
      }),
      sceneState: Object.freeze({
        D: scene.mathematics.parameters.D,
        requestedDepth: recursiveModel.requestedDepth,
        materializedDepth: recursiveModel.materializedDepth,
        focusedDepth: zoomModel.focusedDepth,
        selectedDepth,
        visibleDepth,
        collapsedDepth,
        definingFunctionSymbol: scene.mathematics.baseHypersurface.definingFunction.symbol,
        definingFunctionRepresentation: scene.mathematics.baseHypersurface.definingFunction.representation,
        organizationSemanticStatus: organizationModel.sheetDegreeSemanticStatus
      }),
      truthfulness
    });
  }

  function createStructuralLayoutDescriptor(model) {
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Structural layout descriptor requires a structural_visualization model.");
    }

    const nodeX = 92;
    const nodeWidth = 300;
    const nodeHeight = 72;
    const firstNodeY = 128;
    const nodeStep = 116;
    const ruleX = 476;
    const ruleWidth = 390;
    const diagramWidth = 960;
    const diagramHeight = Math.max(430, firstNodeY + Math.max(1, model.nodes.length) * nodeStep + 54);
    const canonicalViewBox = Object.freeze({ x: 0, y: 0, width: diagramWidth, height: diagramHeight });

    return Object.freeze({
      kind: LAYOUT_KIND,
      canonicalViewBox,
      contentBounds: canonicalViewBox,
      nodeMetrics: Object.freeze({
        x: nodeX,
        width: nodeWidth,
        height: nodeHeight,
        firstY: firstNodeY,
        step: nodeStep
      }),
      rulePanel: Object.freeze({
        x: ruleX,
        width: ruleWidth
      }),
      virtualization: model.renderState,
      levelBounds: Object.freeze(model.nodes.map((node, index) => Object.freeze({
        depth: node.depth,
        x: nodeX,
        y: firstNodeY + index * nodeStep,
        width: nodeWidth,
        height: nodeHeight
      })))
    });
  }

  function buildSvgMarkup(model) {
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Structural visualization markup requires a structural_visualization model.");
    }

    const layout = createStructuralLayoutDescriptor(model);
    const nodeX = layout.nodeMetrics.x;
    const nodeWidth = layout.nodeMetrics.width;
    const nodeHeight = layout.nodeMetrics.height;
    const firstNodeY = layout.nodeMetrics.firstY;
    const nodeStep = layout.nodeMetrics.step;
    const ruleX = layout.rulePanel.x;
    const ruleWidth = layout.rulePanel.width;
    const diagramHeight = layout.canonicalViewBox.height;

    const nodeMarkup = model.nodes.map((node, index) => {
      const y = firstNodeY + index * nodeStep;
      const roleLabel = node.depth === 0 ? "base structural level" : "materialized structural descriptor";
      const stateClasses = `${node.focused ? " is-focused" : ""}${node.selected ? " is-selected" : ""}`;
      const annotations = [];
      if (node.selected) annotations.push("selected");
      if (node.focused) annotations.push("focused");
      const annotationText = annotations.length > 0 ? ` · ${annotations.join(" · ")}` : "";
      const previousDepth = index === 0 ? null : model.nodes[index - 1].depth;
      const gapMarkup = previousDepth !== null && node.depth > previousDepth + 1
        ? `<text class="structural-virtual-gap" x="${String(nodeX)}" y="${String(y - 18)}">… ${String(node.depth - previousDepth - 1)} materialized structural levels view-pruned …</text>`
        : "";
      return [
        gapMarkup,
        `<g class="structural-node${stateClasses}" data-structural-node-depth="${String(node.depth)}" data-selected="${String(node.selected)}" data-focused="${String(node.focused)}">`,
        `<rect x="${String(nodeX)}" y="${String(y)}" width="${String(nodeWidth)}" height="${String(nodeHeight)}" rx="18" />`,
        `<text class="structural-node__label" x="${String(nodeX + 24)}" y="${String(y + 31)}">${escapeXml(node.label)}</text>`,
        `<text class="structural-node__meta" x="${String(nodeX + 24)}" y="${String(y + 54)}">${escapeXml(roleLabel + annotationText)}</text>`,
        "</g>"
      ].join("");
    }).join("");

    const nodeIndexByDepth = new Map(model.nodes.map((node, index) => [node.depth, index]));
    const edgeMarkup = model.edges.map((edge) => {
      const sourceIndex = nodeIndexByDepth.get(edge.sourceDepth);
      const targetIndex = nodeIndexByDepth.get(edge.targetDepth);
      if (sourceIndex === undefined || targetIndex === undefined) {
        throw new RangeError("Structural edge endpoints must both be active rendered nodes.");
      }
      const sourceY = firstNodeY + sourceIndex * nodeStep + nodeHeight;
      const targetY = firstNodeY + targetIndex * nodeStep;
      const centerX = nodeX + nodeWidth / 2;
      const labelY = sourceY + (targetY - sourceY) / 2 - 6;
      return [
        `<g class="structural-edge" data-structural-edge="${String(edge.sourceDepth)}-${String(edge.targetDepth)}">`,
        `<path d="M ${String(centerX)} ${String(sourceY + 8)} L ${String(centerX)} ${String(targetY - 10)}" marker-end="url(#structural-arrow)" />`,
        `<text x="${String(centerX + 18)}" y="${String(labelY)}">${escapeXml(edge.label)} · structural relation</text>`,
        "</g>"
      ].join("");
    }).join("");

    const frontierY = firstNodeY + model.nodes.length * nodeStep;
    let frontierMarkup;
    if (!model.continuation.present) {
      frontierMarkup = `<text class="structural-frontier__text" x="${String(nodeX)}" y="${String(frontierY + 20)}">${escapeXml(model.continuation.label)}</text>`;
    } else {
      const frontierLabel = model.continuation.status === "presentation_collapsed"
        ? `X${formatSubscriptNumber(model.continuation.nextDepth)} · materialized, hidden by presentation collapse`
        : `X${formatSubscriptNumber(model.continuation.nextDepth)} · not materialized`;
      frontierMarkup = [
        `<g class="structural-frontier" data-frontier-depth="${String(model.continuation.nextDepth)}" data-frontier-status="${escapeXml(model.continuation.status)}">`,
        `<rect x="${String(nodeX)}" y="${String(frontierY)}" width="${String(nodeWidth)}" height="58" rx="16" />`,
        `<text x="${String(nodeX + 24)}" y="${String(frontierY + 35)}">${escapeXml(frontierLabel)}</text>`,
        "</g>"
      ].join("");
    }

    const focusedDepth = model.sceneState.focusedDepth === null ? "unavailable" : String(model.sceneState.focusedDepth);
    const selectedDepth = model.sceneState.selectedDepth === null ? "none" : String(model.sceneState.selectedDepth);
    const summary = `D=${String(model.sceneState.D)} · selected=${selectedDepth} · focused=${focusedDepth} · visible=${String(model.sceneState.visibleDepth)} · materialized=${String(model.sceneState.materializedDepth)} · requested=${String(model.sceneState.requestedDepth)}`;

    return [
      `<svg class="structural-visualization__surface" viewBox="0 0 960 ${String(diagramHeight)}" role="img" aria-label="Finite structural pullback diagram. Structural only; no Calabi–Yau geometry or sheets are rendered.">`,
      "<title>Finite structural pullback diagram</title>",
      "<desc>Nodes are finite structural level descriptors from the verified runtime models. Edges denote pullback relations. Selection, focus, and presentation collapse are navigation metadata. No geometric Calabi–Yau hypersurface, covering, or genuine sheets are rendered.</desc>",
      '<defs><marker id="structural-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" /></marker></defs>',
      `<text class="structural-diagram__eyebrow" x="${String(nodeX)}" y="54">STRUCTURAL PROJECTION · NOT GEOMETRY</text>`,
      `<text class="structural-diagram__summary" x="${String(nodeX)}" y="84">${escapeXml(summary)}</text>`,
      nodeMarkup,
      edgeMarkup,
      frontierMarkup,
      `<g class="structural-rule-panel">`,
      `<rect x="${String(ruleX)}" y="128" width="${String(ruleWidth)}" height="238" rx="22" />`,
      `<text class="structural-rule-panel__title" x="${String(ruleX + 28)}" y="171">Symbolic structural rule</text>`,
      `<text class="structural-rule-panel__formula" x="${String(ruleX + 28)}" y="216">${escapeXml(model.rule.recurrence)}</text>`,
      `<text class="structural-rule-panel__formula" x="${String(ruleX + 28)}" y="257">${escapeXml(model.rule.closedForm)}</text>`,
      `<text class="structural-rule-panel__formula structural-rule-panel__formula--small" x="${String(ruleX + 28)}" y="298">${escapeXml(model.rule.coordinateMap)}</text>`,
      `<text class="structural-rule-panel__meta" x="${String(ruleX + 28)}" y="337">${escapeXml(model.sceneState.definingFunctionSymbol)}: ${escapeXml(model.sceneState.definingFunctionRepresentation)} · geometryRendered=false</text>`,
      "</g>",
      `<text class="structural-diagram__boundary" x="${String(ruleX)}" y="404">D⁴ remains runtime organization metadata. No covering structure is claimed.</text>`,
      "</svg>"
    ].join("");
  }

  function renderStructuralVisualization(model, target) {
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Structural visualization renderer requires a structural_visualization model.");
    }
    if (!target || typeof target !== "object" || !target.dataset || !("innerHTML" in target)) {
      throw new TypeError("Structural visualization target must expose dataset and innerHTML.");
    }

    target.hidden = false;
    target.dataset.state = "ready";
    target.dataset.representationKind = model.representationKind;
    target.dataset.structuralOnly = String(model.structuralOnly);
    target.dataset.materializedDepth = String(model.sceneState.materializedDepth);
    target.dataset.focusedDepth = model.sceneState.focusedDepth === null ? "" : String(model.sceneState.focusedDepth);
    target.dataset.selectedDepth = model.sceneState.selectedDepth === null ? "" : String(model.sceneState.selectedDepth);
    target.dataset.visibleDepth = String(model.sceneState.visibleDepth);
    target.dataset.collapsedDepth = model.sceneState.collapsedDepth === null ? "" : String(model.sceneState.collapsedDepth);
    target.dataset.geometryRendered = String(model.truthfulness.geometryRendered);
    target.dataset.sheetsMaterialized = String(model.truthfulness.sheetsMaterialized);
    target.dataset.coveringStructureClaimed = String(model.truthfulness.coveringStructureClaimed);
    target.dataset.geometricZoomApplied = String(model.truthfulness.geometricZoomApplied);
    target.dataset.cameraTransformApplied = String(model.truthfulness.cameraTransformApplied);
    target.dataset.materializationTriggered = String(model.truthfulness.materializationTriggered);
    target.dataset.renderVirtualized = String(model.renderState.virtualized);
    target.dataset.renderWindowStartDepth = model.renderState.renderWindowStartDepth === null ? "" : String(model.renderState.renderWindowStartDepth);
    target.dataset.renderWindowEndDepth = model.renderState.renderWindowEndDepth === null ? "" : String(model.renderState.renderWindowEndDepth);
    target.dataset.activeRenderedDepthCount = String(model.renderState.renderDepths.length);
    target.innerHTML = buildSvgMarkup(model);

    return model;
  }

  const api = Object.freeze({
    MODEL_KIND,
    REPRESENTATION_KIND,
    NODE_KIND,
    EDGE_KIND,
    LAYOUT_KIND,
    createStructuralVisualizationModel,
    createStructuralLayoutDescriptor,
    buildSvgMarkup,
    renderStructuralVisualization
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.StructuralVisualization = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
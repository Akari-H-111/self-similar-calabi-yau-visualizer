"use strict";

(function attachStructuralVisualization(globalObject) {
  const MODEL_KIND = "structural_visualization";
  const REPRESENTATION_KIND = "structural_svg_diagram";
  const NODE_KIND = "structural_level_node";
  const EDGE_KIND = "structural_pullback_edge";

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

  function assertCompatibleInputs(scene, baseModel, recursiveModel, zoomModel, organizationModel) {
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

    const W = scene.mathematics.baseHypersurface?.definingFunction;
    if (!W || W.representation !== "unresolved") {
      throw new TypeError("Thread 13 structural visualization is restricted to the unresolved-W truth boundary.");
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

  function createNode(depth, focusedDepth) {
    return Object.freeze({
      kind: NODE_KIND,
      depth,
      id: `X_${String(depth)}`,
      label: `X${formatSubscriptNumber(depth)}`,
      role: depth === 0 ? "base_structural_level" : "materialized_structural_level",
      focused: focusedDepth === depth,
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

  function createStructuralVisualizationModel(scene, baseModel, recursiveModel, zoomModel, organizationModel) {
    assertCompatibleInputs(scene, baseModel, recursiveModel, zoomModel, organizationModel);

    const nodes = Object.freeze([
      createNode(0, zoomModel.focusedDepth),
      ...recursiveModel.levels.map((level) => createNode(level.depth, zoomModel.focusedDepth))
    ]);
    const edges = Object.freeze(recursiveModel.levels.map(createEdge));
    const continuation = recursiveModel.materializedDepth < recursiveModel.requestedDepth
      ? Object.freeze({
          present: true,
          nextDepth: recursiveModel.materializedDepth + 1,
          label: "next structural level not materialized"
        })
      : Object.freeze({
          present: false,
          nextDepth: null,
          label: "requested structural frontier reached"
        });

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
        definingFunctionSymbol: scene.mathematics.baseHypersurface.definingFunction.symbol,
        definingFunctionRepresentation: scene.mathematics.baseHypersurface.definingFunction.representation,
        organizationSemanticStatus: organizationModel.sheetDegreeSemanticStatus
      }),
      truthfulness
    });
  }

  function buildSvgMarkup(model) {
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Structural visualization markup requires a structural_visualization model.");
    }

    const nodeX = 92;
    const nodeWidth = 300;
    const nodeHeight = 72;
    const firstNodeY = 128;
    const nodeStep = 116;
    const ruleX = 476;
    const ruleWidth = 390;
    const diagramHeight = Math.max(430, firstNodeY + Math.max(1, model.nodes.length) * nodeStep + 54);

    const nodeMarkup = model.nodes.map((node, index) => {
      const y = firstNodeY + index * nodeStep;
      const roleLabel = node.depth === 0 ? "base structural level" : "materialized structural descriptor";
      const focusedClass = node.focused ? " is-focused" : "";
      return [
        `<g class="structural-node${focusedClass}" data-structural-node-depth="${String(node.depth)}">`,
        `<rect x="${String(nodeX)}" y="${String(y)}" width="${String(nodeWidth)}" height="${String(nodeHeight)}" rx="18" />`,
        `<text class="structural-node__label" x="${String(nodeX + 24)}" y="${String(y + 31)}">${escapeXml(node.label)}</text>`,
        `<text class="structural-node__meta" x="${String(nodeX + 24)}" y="${String(y + 54)}">${escapeXml(roleLabel)}${node.focused ? " · focused" : ""}</text>`,
        "</g>"
      ].join("");
    }).join("");

    const edgeMarkup = model.edges.map((edge, index) => {
      const sourceY = firstNodeY + index * nodeStep + nodeHeight;
      const targetY = firstNodeY + (index + 1) * nodeStep;
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
    const frontierMarkup = model.continuation.present
      ? [
          `<g class="structural-frontier" data-frontier-depth="${String(model.continuation.nextDepth)}">`,
          `<rect x="${String(nodeX)}" y="${String(frontierY)}" width="${String(nodeWidth)}" height="58" rx="16" />`,
          `<text x="${String(nodeX + 24)}" y="${String(frontierY + 35)}">X${escapeXml(formatSubscriptNumber(model.continuation.nextDepth))} · not materialized</text>`,
          "</g>"
        ].join("")
      : `<text class="structural-frontier__text" x="${String(nodeX)}" y="${String(frontierY + 20)}">${escapeXml(model.continuation.label)}</text>`;

    const focusedDepth = model.sceneState.focusedDepth === null ? "unavailable" : String(model.sceneState.focusedDepth);
    const summary = `D=${String(model.sceneState.D)} · focused=${focusedDepth} · materialized=${String(model.sceneState.materializedDepth)} · requested=${String(model.sceneState.requestedDepth)}`;

    return [
      `<svg class="structural-visualization__surface" viewBox="0 0 960 ${String(diagramHeight)}" role="img" aria-label="Finite structural pullback diagram. Structural only; no Calabi–Yau geometry or sheets are rendered.">`,
      "<title>Finite structural pullback diagram</title>",
      "<desc>Nodes are finite structural level descriptors from the verified runtime models. Edges denote pullback relations. No geometric Calabi–Yau hypersurface, covering, or genuine sheets are rendered.</desc>",
      "<defs><marker id="structural-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" /></marker></defs>",
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
    target.dataset.geometryRendered = String(model.truthfulness.geometryRendered);
    target.dataset.sheetsMaterialized = String(model.truthfulness.sheetsMaterialized);
    target.dataset.coveringStructureClaimed = String(model.truthfulness.coveringStructureClaimed);
    target.dataset.geometricZoomApplied = String(model.truthfulness.geometricZoomApplied);
    target.dataset.cameraTransformApplied = String(model.truthfulness.cameraTransformApplied);
    target.dataset.materializationTriggered = String(model.truthfulness.materializationTriggered);
    target.innerHTML = buildSvgMarkup(model);

    return model;
  }

  const api = Object.freeze({
    MODEL_KIND,
    REPRESENTATION_KIND,
    NODE_KIND,
    EDGE_KIND,
    createStructuralVisualizationModel,
    buildSvgMarkup,
    renderStructuralVisualization
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.StructuralVisualization = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

"use strict";

(function attachVisualProvenance(globalObject) {
  const VERSION = "v0.21";
  const ADAPTER_KIND = "visual_provenance_adapter";

  const EVIDENCE = Object.freeze({
    STRUCTURAL: "structural_representation",
    FORMAL_SYMBOLIC: "formal_theorem_backed_symbolic",
    SOURCE_BACKED_STRUCTURAL: "source_backed_structural_representation",
    INTERACTION: "interaction_metadata",
    VIRTUALIZATION: "presentation_virtualization",
    CAMERA: "presentation_camera_state",
    RUNTIME: "runtime_metadata",
    UNRESOLVED: "unresolved",
    NOT_MATERIALIZED: "not_materialized",
    ENGINEERING: "engineering"
  });

  function setDataset(element, values) {
    if (!element || !element.dataset) return false;
    for (const [key, value] of Object.entries(values)) {
      element.dataset[key] = String(value);
    }
    return true;
  }

  function annotateElements(root, selector, values) {
    if (!root || typeof root.querySelectorAll !== "function") return 0;
    let count = 0;
    for (const element of root.querySelectorAll(selector)) {
      if (setDataset(element, values)) count += 1;
    }
    return count;
  }

  function annotateStructuralProvenance(target, documentObject = globalObject.document) {
    if (!target || typeof target.querySelector !== "function") return null;
    const surface = target.querySelector("svg.structural-visualization__surface");
    if (!surface) return null;

    const counts = {
      nodes: 0,
      edges: 0,
      rulePanels: 0,
      virtualGaps: 0,
      frontiers: 0,
      d4Badges: 0,
      arithmeticAnnotations: 0
    };

    setDataset(surface, {
      visualProvenanceVersion: VERSION,
      visualProvenanceId: "structural_svg_surface",
      evidenceClass: EVIDENCE.STRUCTURAL,
      explicitNonClaim: "not_geometric_calabi_yau_realization"
    });

    counts.nodes = annotateElements(surface, ".structural-node", {
      visualProvenanceId: "structural_level_node",
      evidenceClass: EVIDENCE.STRUCTURAL,
      canonicalSource: "recursive-lazy-expansion.js|formal/SelfSimilarCY/PullbackTower.lean",
      explicitNonClaim: "not_rendered_manifold_or_hypersurface_copy"
    });

    if (typeof surface.querySelectorAll === "function") {
      for (const node of surface.querySelectorAll(".structural-node")) {
        if (node.dataset?.selected === "true") {
          setDataset(node, {
            selectionEvidenceClass: EVIDENCE.INTERACTION,
            selectionNonClaim: "not_distinguished_mathematical_component"
          });
        }
        if (node.dataset?.focused === "true") {
          setDataset(node, {
            focusEvidenceClass: EVIDENCE.INTERACTION,
            focusNonClaim: "not_geometric_focus_or_special_fiber"
          });
        }
      }
    }

    counts.edges = annotateElements(surface, ".structural-edge", {
      visualProvenanceId: "structural_pullback_edge",
      evidenceClass: EVIDENCE.FORMAL_SYMBOLIC,
      canonicalSource: "formal/SelfSimilarCY/PullbackTower.lean",
      explicitNonClaim: "not_literal_geometric_inverse_image_or_covering_map"
    });

    counts.rulePanels = annotateElements(surface, ".structural-rule-panel", {
      visualProvenanceId: "structural_rule_panel",
      evidenceClass: EVIDENCE.FORMAL_SYMBOLIC,
      canonicalSource: "formal/SelfSimilarCY/CoordinatePower.lean|formal/SelfSimilarCY/CoordinatePowerIteration.lean|formal/SelfSimilarCY/PullbackTower.lean",
      explicitNonClaim: "not_concrete_W_or_calabi_yau_geometry"
    });

    counts.virtualGaps = annotateElements(surface, ".structural-virtual-gap", {
      visualProvenanceId: "virtual_gap",
      evidenceClass: EVIDENCE.VIRTUALIZATION,
      canonicalSource: "infinite-navigation-renderer.js",
      explicitNonClaim: "not_missing_mathematical_levels_or_uncomputed_recursion"
    });

    if (typeof surface.querySelectorAll === "function") {
      for (const frontier of surface.querySelectorAll(".structural-frontier")) {
        const status = frontier.dataset?.frontierStatus ?? "";
        const evidenceClass = status === "view_pruned"
          ? EVIDENCE.VIRTUALIZATION
          : status === "not_materialized"
            ? EVIDENCE.NOT_MATERIALIZED
            : status === "presentation_collapsed"
              ? EVIDENCE.INTERACTION
              : EVIDENCE.ENGINEERING;
        setDataset(frontier, {
          visualProvenanceId: status ? "frontier_" + status : "frontier_unspecified",
          evidenceClass,
          explicitNonClaim: "not_geometric_nonexistence_or_end_of_mathematical_tower"
        });
        counts.frontiers += 1;
      }

      for (const frontierText of surface.querySelectorAll(".structural-frontier__text")) {
        const normalized = String(frontierText.textContent ?? "").trim().toLowerCase();
        if (normalized.includes("requested structural frontier reached")) {
          setDataset(frontierText, {
            frontierStatus: "requested_frontier_reached",
            visualProvenanceId: "frontier_requested_reached",
            evidenceClass: EVIDENCE.ENGINEERING,
            canonicalSource: "recursive-lazy-expansion.js|structural-visualization.js",
            explicitNonClaim: "not_end_of_mathematical_tower_or_literal_infinity_boundary"
          });
          counts.frontiers += 1;
        }
      }
    }

    counts.d4Badges = annotateElements(surface, ".branch-organization-badge", {
      visualProvenanceId: "d4_aggregate_badge",
      evidenceClass: EVIDENCE.SOURCE_BACKED_STRUCTURAL,
      canonicalSource: "scene.derived.sheetDegree|sheet-branch-organization.js",
      explicitNonClaim: "not_concrete_sheets_fibers_covering_or_degree_proof"
    });

    counts.arithmeticAnnotations = annotateElements(surface, ".arithmetic-overlay-annotation", {
      visualProvenanceLayer: "v0.21_passthrough",
      explicitNonClaim: "symbolic_annotation_not_geometric_locus"
    });

    const camera = documentObject?.querySelector?.("#structural-camera");
    if (camera) {
      setDataset(camera, {
        visualProvenanceId: "camera_state",
        evidenceClass: EVIDENCE.CAMERA,
        canonicalSource: "structural-camera.js",
        explicitNonClaim: "not_D2_metric_scale_or_geometric_zoom"
      });
    }

    const d2 = documentObject?.querySelector?.('[data-exposition-field="D2"]');
    if (d2) {
      setDataset(d2, {
        visualProvenanceId: "d2_runtime_metadata",
        evidenceClass: EVIDENCE.RUNTIME,
        canonicalSource: "scene-spec.js",
        explicitNonClaim: "not_sealed_metric_theorem_or_camera_scale"
      });
    }

    const d4 = documentObject?.querySelector?.('[data-exposition-field="D4"]');
    if (d4) {
      setDataset(d4, {
        visualProvenanceId: "d4_organization_metadata",
        evidenceClass: EVIDENCE.RUNTIME,
        canonicalSource: "scene-spec.js|sheet-branch-organization.js",
        explicitNonClaim: "not_genuine_map_degree_sheets_or_covering"
      });
    }

    const w = documentObject?.querySelector?.('[data-exposition-field="W"]');
    if (w) {
      setDataset(w, {
        visualProvenanceId: "w_status",
        evidenceClass: EVIDENCE.UNRESOLVED,
        canonicalSource: "data/system.json|scene-spec.js",
        explicitNonClaim: "no_placeholder_W_geometry_or_sampled_hypersurface"
      });
    }

    setDataset(target, {
      visualProvenanceState: "ready",
      visualProvenanceVersion: VERSION,
      visualProvenanceMatrix: "docs/visual_provenance_matrix_self_similar_cy_visualizer_v0_21.json"
    });

    return Object.freeze({
      kind: ADAPTER_KIND,
      version: VERSION,
      counts: Object.freeze({...counts})
    });
  }

  function attachAutomaticProvenance(options = {}) {
    const documentObject = options.documentObject ?? globalObject.document;
    const Observer = options.MutationObserverClass ?? globalObject.MutationObserver;
    if (!documentObject || typeof Observer !== "function") return null;

    const target = documentObject.querySelector?.("#structural-visualization");
    if (!target) return null;

    let scheduled = false;
    const renderCurrent = () => annotateStructuralProvenance(target, documentObject);
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      const run = () => {
        scheduled = false;
        renderCurrent();
      };
      if (typeof globalObject.queueMicrotask === "function") {
        globalObject.queueMicrotask(run);
      } else {
        Promise.resolve().then(run);
      }
    };

    const observer = new Observer(schedule);
    observer.observe(target, {childList: true, subtree: true});
    renderCurrent();

    return Object.freeze({observer, renderCurrent});
  }

  const api = Object.freeze({
    VERSION,
    ADAPTER_KIND,
    EVIDENCE,
    annotateStructuralProvenance,
    attachAutomaticProvenance
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.VisualProvenance = api;

  if (globalObject.document && typeof globalObject.MutationObserver !== "undefined") {
    globalObject.queueMicrotask?.(() => {
      attachAutomaticProvenance();
    });
  }
})(typeof globalThis !== "undefined" ? globalThis : this);

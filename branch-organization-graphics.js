"use strict";

(function attachBranchOrganizationGraphics(globalObject) {
  const MODEL_KIND = "branch_organization_graphics";
  const REPRESENTATION_KIND = "aggregate_structural_branch_badges";
  const BADGE_KIND = "structural_organization_multiplicity_badge";
  const SOURCE_CONTRACT = "sheet_branch_organization_renderer_output";

  function assertSafeMultiplicity(value) {
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new TypeError("Branch organization multiplicity must be a positive safe integer.");
    }
    return value;
  }

  function assertNonnegativeSafeInteger(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new TypeError(`${label} must be a nonnegative safe integer.`);
    }
    return value;
  }

  function normalizeOrganizationSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object") {
      throw new TypeError("Branch organization graphics require a sheet/branch organization snapshot.");
    }
    if (snapshot.sheetDegreeSource !== "scene.derived.sheetDegree") {
      throw new TypeError("Branch organization graphics require the canonical scene.derived.sheetDegree source.");
    }
    if (
      snapshot.sheetsMaterialized !== false ||
      snapshot.coveringStructureClaimed !== false ||
      snapshot.geometryRendered !== false
    ) {
      throw new TypeError("Branch organization graphics cannot consume promoted geometry, sheets, or covering claims.");
    }

    return Object.freeze({
      sheetDegreeSource: snapshot.sheetDegreeSource,
      sheetDegreePerStep: assertSafeMultiplicity(snapshot.sheetDegreePerStep),
      materializedDepth: assertNonnegativeSafeInteger(snapshot.materializedDepth, "materializedDepth"),
      sheetsMaterialized: false,
      coveringStructureClaimed: false,
      geometryRendered: false
    });
  }

  function normalizeLevelLayout(level) {
    if (!level || typeof level !== "object") {
      throw new TypeError("Branch organization level layout must be an object.");
    }
    const depth = assertNonnegativeSafeInteger(level.depth, "level.depth");
    for (const key of ["x", "y", "width", "height"]) {
      if (typeof level[key] !== "number" || !Number.isFinite(level[key])) {
        throw new TypeError(`level.${key} must be finite.`);
      }
    }
    if (level.width <= 0 || level.height <= 0) {
      throw new RangeError("Branch organization level layout width and height must be positive.");
    }
    return Object.freeze({
      depth,
      x: level.x,
      y: level.y,
      width: level.width,
      height: level.height
    });
  }

  function createBadge(sourceLevel, targetLevel, multiplicity) {
    if (targetLevel.depth !== sourceLevel.depth + 1) {
      throw new TypeError("Branch organization badge requires adjacent structural levels.");
    }

    const gapTop = sourceLevel.y + sourceLevel.height;
    const gapHeight = targetLevel.y - gapTop;
    const width = 68;
    const height = Math.max(28, Math.min(36, gapHeight - 4));
    const x = sourceLevel.x + sourceLevel.width + 8;
    const y = gapTop + Math.max(2, (gapHeight - height) / 2);

    return Object.freeze({
      kind: BADGE_KIND,
      sourceDepth: sourceLevel.depth,
      targetDepth: targetLevel.depth,
      multiplicity,
      multiplicitySource: "scene.derived.sheetDegree",
      aggregateOnly: true,
      slotsEnumerated: false,
      x,
      y,
      width,
      height,
      sheetsMaterialized: false,
      coveringStructureClaimed: false,
      geometryRendered: false
    });
  }

  function createBranchOrganizationGraphicsModel(organizationSnapshot, levelLayouts) {
    const organization = normalizeOrganizationSnapshot(organizationSnapshot);
    if (!Array.isArray(levelLayouts)) {
      throw new TypeError("Branch organization graphics require an array of visible structural level layouts.");
    }

    const normalizedLevels = levelLayouts.map(normalizeLevelLayout).sort((left, right) => left.depth - right.depth);
    const seenDepths = new Set();
    for (const level of normalizedLevels) {
      if (seenDepths.has(level.depth)) {
        throw new TypeError(`Duplicate visible structural depth ${String(level.depth)}.`);
      }
      if (level.depth > organization.materializedDepth) {
        throw new RangeError("Visible structural level cannot exceed materializedDepth.");
      }
      seenDepths.add(level.depth);
    }

    const badges = [];
    for (const target of normalizedLevels) {
      if (target.depth === 0) continue;
      const source = normalizedLevels.find((candidate) => candidate.depth === target.depth - 1);
      if (!source) continue;
      badges.push(createBadge(source, target, organization.sheetDegreePerStep));
    }

    return Object.freeze({
      kind: MODEL_KIND,
      representationKind: REPRESENTATION_KIND,
      sourceContract: SOURCE_CONTRACT,
      structuralOnly: true,
      sheetDegreeSource: organization.sheetDegreeSource,
      sheetDegreePerStep: organization.sheetDegreePerStep,
      materializedDepth: organization.materializedDepth,
      visibleLevelCount: normalizedLevels.length,
      badgeCount: badges.length,
      badges: Object.freeze(badges),
      domEncoding: Object.freeze({
        aggregateBadgePerVisibleTransition: true,
        slotsEnumerated: false,
        badgeCountDependsOnMultiplicity: false
      }),
      truthfulness: Object.freeze({
        geometryRendered: false,
        sheetsMaterialized: false,
        coveringStructureClaimed: false,
        geometricZoomApplied: false
      })
    });
  }

  function escapeXml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  function buildBadgeMarkup(model) {
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Branch organization badge markup requires a branch_organization_graphics model.");
    }

    const badgeMarkup = model.badges.map((badge) => {
      const label = `D⁴ organization multiplicity ${String(badge.multiplicity)}`;
      const ariaLabel = (
        `${label} between structural levels X_${String(badge.sourceDepth)} and X_${String(badge.targetDepth)}. ` +
        "Aggregate structural metadata only; no concrete sheets or geometry are materialized."
      );
      const centerX = badge.x + badge.width / 2;
      return [
        `<g class="branch-organization-badge" data-branch-depth="${String(badge.targetDepth)}" data-branch-multiplicity="${String(badge.multiplicity)}" role="img" aria-label="${escapeXml(ariaLabel)}">`,
        `<title>${escapeXml(ariaLabel)}</title>`,
        `<rect x="${String(badge.x)}" y="${String(badge.y)}" width="${String(badge.width)}" height="${String(badge.height)}" rx="10" fill="Canvas" stroke="currentColor" stroke-width="1.5" />`,
        `<text x="${String(centerX)}" y="${String(badge.y + 15)}" text-anchor="middle" fill="currentColor" font-size="11" font-weight="700">D⁴ org</text>`,
        `<text x="${String(centerX)}" y="${String(badge.y + 29)}" text-anchor="middle" fill="currentColor" font-size="13" font-weight="800">×${escapeXml(badge.multiplicity)}</text>`,
        "</g>"
      ].join("");
    }).join("");

    return [
      '<g class="branch-organization-graphics" data-branch-organization-graphics="true" data-representation-kind="aggregate_structural_branch_badges">',
      "<desc>D⁴ badges encode exact structural organization multiplicity as aggregate runtime metadata. They do not enumerate or materialize geometric sheets.</desc>",
      badgeMarkup,
      "</g>"
    ].join("");
  }

  function resolveSurface(target) {
    if (!target || typeof target !== "object") {
      throw new TypeError("Branch organization graphics require a structural visualization target.");
    }
    if (typeof target.querySelector === "function") {
      const surface = target.querySelector("svg.structural-visualization__surface");
      if (surface) return surface;
    }
    if (typeof target.insertAdjacentHTML === "function" && target.dataset) return target;
    throw new TypeError("Branch organization graphics target must expose the current structural SVG surface.");
  }

  function renderBranchOrganizationGraphics(model, target) {
    if (!model || model.kind !== MODEL_KIND) {
      throw new TypeError("Branch organization graphics renderer requires a branch_organization_graphics model.");
    }
    const surface = resolveSurface(target);
    const existing = typeof surface.querySelector === "function"
      ? surface.querySelector('[data-branch-organization-graphics="true"]')
      : null;
    existing?.remove?.();
    surface.insertAdjacentHTML("beforeend", buildBadgeMarkup(model));

    if (target.dataset) {
      target.dataset.branchOrganizationState = "ready";
      target.dataset.branchOrganizationRepresentation = model.representationKind;
      target.dataset.branchOrganizationMultiplicity = String(model.sheetDegreePerStep);
      target.dataset.branchOrganizationBadgeCount = String(model.badgeCount);
      target.dataset.branchOrganizationSlotsEnumerated = "false";
    }

    return model;
  }

  function snapshotFromRenderedOrganization(target) {
    if (!target || !target.dataset) {
      throw new TypeError("Rendered sheet/branch organization target must expose dataset.");
    }
    const multiplicity = Number(target.dataset.sheetDegreePerStep);
    const materializedDepth = Number(target.dataset.materializedDepth);
    return normalizeOrganizationSnapshot({
      sheetDegreeSource: target.dataset.sheetDegreeSource,
      sheetDegreePerStep: multiplicity,
      materializedDepth,
      sheetsMaterialized: target.dataset.sheetsMaterialized === "true",
      coveringStructureClaimed: target.dataset.coveringStructureClaimed === "true",
      geometryRendered: target.dataset.geometryRendered === "true"
    });
  }

  function readVisibleLevelLayouts(structuralTarget) {
    const surface = resolveSurface(structuralTarget);
    if (typeof surface.querySelectorAll !== "function") {
      throw new TypeError("Structural SVG surface must expose querySelectorAll.");
    }
    return Array.from(surface.querySelectorAll("[data-structural-node-depth]")).map((node) => {
      const rect = node.querySelector?.("rect");
      if (!rect || typeof rect.getAttribute !== "function") {
        throw new TypeError("Each visible structural node must expose its rendered rectangle.");
      }
      return {
        depth: Number(node.dataset.structuralNodeDepth),
        x: Number(rect.getAttribute("x")),
        y: Number(rect.getAttribute("y")),
        width: Number(rect.getAttribute("width")),
        height: Number(rect.getAttribute("height"))
      };
    });
  }

  function projectRenderedOrganization(organizationTarget, structuralTarget) {
    const organizationSnapshot = snapshotFromRenderedOrganization(organizationTarget);
    const levelLayouts = readVisibleLevelLayouts(structuralTarget);
    const model = createBranchOrganizationGraphicsModel(organizationSnapshot, levelLayouts);
    renderBranchOrganizationGraphics(model, structuralTarget);
    return model;
  }

  function clearProjectionState(structuralTarget) {
    if (!structuralTarget?.dataset) return;
    for (const key of [
      "branchOrganizationState",
      "branchOrganizationRepresentation",
      "branchOrganizationMultiplicity",
      "branchOrganizationBadgeCount",
      "branchOrganizationSlotsEnumerated"
    ]) {
      delete structuralTarget.dataset[key];
    }
  }

  function attachAutomaticProjection(options = {}) {
    const documentObject = options.documentObject ?? globalObject.document;
    const Observer = options.MutationObserverClass ?? globalObject.MutationObserver;
    if (!documentObject || typeof Observer !== "function") return null;

    const organizationTarget = documentObject.querySelector?.("#sheet-branch-organization");
    const structuralTarget = documentObject.querySelector?.("#structural-visualization");
    if (!organizationTarget || !structuralTarget) return null;

    const renderCurrent = () => {
      if (organizationTarget.hidden || structuralTarget.hidden) {
        clearProjectionState(structuralTarget);
        return null;
      }
      if (!structuralTarget.querySelector?.("svg.structural-visualization__surface")) {
        clearProjectionState(structuralTarget);
        return null;
      }
      try {
        return projectRenderedOrganization(organizationTarget, structuralTarget);
      } catch (error) {
        console.error("Branch organization graphics projection rejected:", error);
        structuralTarget.dataset.branchOrganizationState = "error";
        return null;
      }
    };

    const observer = new Observer(() => {
      renderCurrent();
    });
    observer.observe(structuralTarget, { childList: true });
    renderCurrent();

    return Object.freeze({ observer, renderCurrent });
  }

  const api = Object.freeze({
    MODEL_KIND,
    REPRESENTATION_KIND,
    BADGE_KIND,
    SOURCE_CONTRACT,
    createBranchOrganizationGraphicsModel,
    buildBadgeMarkup,
    renderBranchOrganizationGraphics,
    snapshotFromRenderedOrganization,
    readVisibleLevelLayouts,
    projectRenderedOrganization,
    clearProjectionState,
    attachAutomaticProjection
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.BranchOrganizationGraphics = api;

  if (globalObject.document && typeof globalObject.MutationObserver !== "undefined") {
    globalObject.queueMicrotask?.(() => {
      attachAutomaticProjection();
    });
  }
})(typeof globalThis !== "undefined" ? globalThis : this);

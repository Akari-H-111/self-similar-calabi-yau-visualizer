"use strict";

(function attachBaseGeometricRenderer(globalObject) {
  const RENDERER_KIND = "svg_sampled_projection";
  const RENDERER_VERSION = "v0.01";
  const DEFAULT_VIEWPORT = Object.freeze({ width: 760, height: 520, padding: 44 });

  class BaseGeometricRendererError extends Error {
    constructor(message) {
      super(message);
      this.name = "BaseGeometricRendererError";
    }
  }

  function projectionSemantics() {
    if (typeof module !== "undefined" && module.exports) return require("./projection-slice-semantics.js");
    if (!globalObject.ProjectionSliceSemantics) throw new BaseGeometricRendererError("ProjectionSliceSemantics is required.");
    return globalObject.ProjectionSliceSemantics;
  }

  function assertFinite(value, path) {
    if (typeof value !== "number" || !Number.isFinite(value)) throw new BaseGeometricRendererError(path + " must be finite.");
  }

  function createViewportTransform(points, viewport = DEFAULT_VIEWPORT) {
    if (!Array.isArray(points)) throw new BaseGeometricRendererError("points must be an array.");
    for (const key of ["width","height","padding"]) assertFinite(viewport[key], "viewport." + key);
    if (viewport.width <= 2 * viewport.padding || viewport.height <= 2 * viewport.padding) {
      throw new BaseGeometricRendererError("Viewport must leave positive drawable area after padding.");
    }
    if (points.length === 0) {
      return Object.freeze({
        kind: "presentation_transform",
        viewport: Object.freeze({ ...viewport }),
        semanticBounds: null,
        scale: 1,
        center: Object.freeze({ x: 0, y: 0 })
      });
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const point of points) {
      assertFinite(point.x, "point.x");
      assertFinite(point.y, "point.y");
      minX = Math.min(minX, point.x); maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y); maxY = Math.max(maxY, point.y);
    }
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const effectiveSpanX = spanX === 0 ? 1 : spanX;
    const effectiveSpanY = spanY === 0 ? 1 : spanY;
    const scale = Math.min(
      (viewport.width - 2 * viewport.padding) / effectiveSpanX,
      (viewport.height - 2 * viewport.padding) / effectiveSpanY
    );
    return Object.freeze({
      kind: "presentation_transform",
      viewport: Object.freeze({ ...viewport }),
      semanticBounds: Object.freeze({ minX, maxX, minY, maxY, spanX, spanY }),
      scale,
      center: Object.freeze({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 })
    });
  }

  function toViewport(transform, x, y) {
    assertFinite(x, "semantic x");
    assertFinite(y, "semantic y");
    const { width, height } = transform.viewport;
    return Object.freeze({
      x: width / 2 + (x - transform.center.x) * transform.scale,
      y: height / 2 - (y - transform.center.y) * transform.scale
    });
  }

  function createProjectedScene(scene, viewDescriptor, sampleModel, viewport = DEFAULT_VIEWPORT) {
    const Projection = projectionSemantics();
    const binding = Projection.validateViewAgainstScene(viewDescriptor, scene);
    const view = binding.view;
    if (!sampleModel || sampleModel.kind !== "ordered_finite_validated_subset" || !Array.isArray(sampleModel.samples)) {
      throw new BaseGeometricRendererError("A validated ordered finite X_0 sample model is required.");
    }
    if (sampleModel.sourceObject !== view.sourceObject || sampleModel.formulaId !== view.sourceDomain.formulaId || sampleModel.viewId !== view.viewId) {
      throw new BaseGeometricRendererError("Sample provenance does not match the sealed view descriptor.");
    }
    const sourceIndex = view.projection.sourceIndex;
    const semanticPoints = sampleModel.samples.map((sample) => {
      if (!sample || typeof sample.sampleId !== "string" || !sample.membership?.accepted || !Array.isArray(sample.coordinates) || sample.coordinates.length !== 4) {
        throw new BaseGeometricRendererError("Every rendered sample must carry source id, four coordinates, and accepted X_0 membership.");
      }
      const z1 = sample.coordinates[sourceIndex];
      assertFinite(z1.re, "sample z1.re");
      assertFinite(z1.im, "sample z1.im");
      return Object.freeze({
        sourceSampleId: sample.sampleId,
        x: z1.re,
        y: z1.im,
        sourceCoordinate: view.projection.sourceCoordinate,
        mapping: "(Re(z1), Im(z1))"
      });
    });

    const overlapCounts = new Map();
    for (const point of semanticPoints) {
      const key = String(point.x) + "," + String(point.y);
      overlapCounts.set(key, (overlapCounts.get(key) || 0) + 1);
    }
    const transform = createViewportTransform(semanticPoints, viewport);
    const marks = semanticPoints.map((point) => {
      const pixel = toViewport(transform, point.x, point.y);
      const key = String(point.x) + "," + String(point.y);
      return Object.freeze({
        ...point,
        viewportX: pixel.x,
        viewportY: pixel.y,
        projectedSampleOverlapCount: overlapCounts.get(key)
      });
    });
    const geometryRendered = marks.length > 0;
    return Object.freeze({
      kind: "base_geometric_projected_scene",
      rendererKind: RENDERER_KIND,
      rendererVersion: RENDERER_VERSION,
      sourceObject: "X_0",
      formulaId: view.sourceDomain.formulaId,
      viewId: view.viewId,
      viewKind: view.viewKind,
      requiredLabel: view.uiWording.requiredLabel,
      pointMeaning: view.uiWording.pointMeaning,
      semanticProjection: Object.freeze({
        sourceCoordinate: view.projection.sourceCoordinate,
        sourceIndex,
        x: view.projection.complexToRealMap[0].expression,
        y: view.projection.complexToRealMap[1].expression,
        displayCodomain: view.display.codomain
      }),
      presentationTransform: transform,
      sampleCount: sampleModel.sampleCount,
      marks: Object.freeze(marks),
      overlapPolicy: "projected_sample_overlap_count_only_not_source_self_intersection",
      completenessClaim: false,
      truthfulness: Object.freeze({
        geometryRendered,
        sheetsMaterialized: false,
        coveringStructureClaimed: false,
        geometricZoomApplied: false
      })
    });
  }

  function escapeXml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    })[character]);
  }

  function axisMarkup(model) {
    const t = model.presentationTransform;
    if (!t.semanticBounds) return "";
    const { minX, maxX, minY, maxY } = t.semanticBounds;
    let markup = "";
    if (minY <= 0 && maxY >= 0) {
      const a = toViewport(t, minX, 0), b = toViewport(t, maxX, 0);
      markup += `<line class="base-geometric-axis" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" aria-hidden="true"></line>`;
    }
    if (minX <= 0 && maxX >= 0) {
      const a = toViewport(t, 0, minY), b = toViewport(t, 0, maxY);
      markup += `<line class="base-geometric-axis" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" aria-hidden="true"></line>`;
    }
    return markup;
  }

  function buildSvgMarkup(model) {
    if (!model || model.kind !== "base_geometric_projected_scene") throw new BaseGeometricRendererError("Projected scene model is required.");
    const { width, height } = model.presentationTransform.viewport;
    const marks = model.marks.map((mark) =>
      `<circle class="base-geometric-mark" cx="${mark.viewportX}" cy="${mark.viewportY}" r="3" ` +
      `data-source-sample-id="${escapeXml(mark.sourceSampleId)}" ` +
      `data-semantic-x="${escapeXml(mark.x)}" data-semantic-y="${escapeXml(mark.y)}" ` +
      `data-projected-overlap-count="${mark.projectedSampleOverlapCount}" ` +
      `aria-label="${escapeXml(mark.sourceSampleId + ": (" + mark.x + ", " + mark.y + ")")}"></circle>`
    ).join("");
    return `<svg class="base-geometric-renderer__surface" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="base-geometric-label" ` +
      `data-renderer-kind="${RENDERER_KIND}" data-presentation-transform="fit-uniform">` +
      `<rect class="base-geometric-frame" x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" aria-hidden="true"></rect>` +
      axisMarkup(model) + marks + `</svg>`;
  }

  function renderBaseGeometricScene(model, target) {
    if (!target || typeof target !== "object") throw new BaseGeometricRendererError("A DOM-like target is required.");
    const markup = buildSvgMarkup(model);
    target.innerHTML = markup;
    target.hidden = false;
    target.dataset.state = model.truthfulness.geometryRendered ? "ready" : "empty";
    target.dataset.geometryRendered = String(model.truthfulness.geometryRendered);
    target.dataset.sheetsMaterialized = "false";
    target.dataset.coveringStructureClaimed = "false";
    target.dataset.geometricZoomApplied = "false";
    target.dataset.sourceObject = model.sourceObject;
    target.dataset.formulaId = model.formulaId;
    target.dataset.viewId = model.viewId;
    target.dataset.sampleCount = String(model.sampleCount);
    target.dataset.rendererTechnology = "svg";
    target.dataset.fallbackUsed = "false";
    return model;
  }

  const api = Object.freeze({
    RENDERER_KIND,
    RENDERER_VERSION,
    DEFAULT_VIEWPORT,
    BaseGeometricRendererError,
    createViewportTransform,
    toViewport,
    createProjectedScene,
    buildSvgMarkup,
    renderBaseGeometricScene
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalObject.BaseGeometricRenderer = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

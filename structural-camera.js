"use strict";

(function attachStructuralCamera(globalObject) {
  const MODEL_KIND = "structural_camera";
  const VIEW_KIND = "structural_camera_viewbox";
  const SCALE_SEMANTIC = "presentation_camera_scale";
  const DEFAULT_MIN_SCALE = 0.5;
  const DEFAULT_MAX_SCALE = 8;
  const EPSILON = 1e-10;

  function assertFiniteNumber(value, label) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError(`${label} must be a finite number.`);
    }
    return value;
  }

  function assertPositiveFiniteNumber(value, label) {
    assertFiniteNumber(value, label);
    if (value <= 0) {
      throw new RangeError(`${label} must be greater than zero.`);
    }
    return value;
  }

  function normalizeRectangle(value, label) {
    if (!value || typeof value !== "object") {
      throw new TypeError(`${label} must be a rectangle object.`);
    }

    const x = assertFiniteNumber(value.x, `${label}.x`);
    const y = assertFiniteNumber(value.y, `${label}.y`);
    const width = assertPositiveFiniteNumber(value.width, `${label}.width`);
    const height = assertPositiveFiniteNumber(value.height, `${label}.height`);

    return Object.freeze({ x, y, width, height });
  }

  function rectangleRight(rectangle) {
    return rectangle.x + rectangle.width;
  }

  function rectangleBottom(rectangle) {
    return rectangle.y + rectangle.height;
  }

  function containsRectangle(outer, inner) {
    return (
      inner.x >= outer.x - EPSILON &&
      inner.y >= outer.y - EPSILON &&
      rectangleRight(inner) <= rectangleRight(outer) + EPSILON &&
      rectangleBottom(inner) <= rectangleBottom(outer) + EPSILON
    );
  }

  function assertContainedRectangle(outer, inner, label) {
    if (!containsRectangle(outer, inner)) {
      throw new RangeError(`${label} must lie within the camera content bounds.`);
    }
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function approximatelyEqual(left, right) {
    return Math.abs(left - right) <= EPSILON;
  }

  function canonicalCenter(rectangle) {
    return Object.freeze({
      x: rectangle.x + rectangle.width / 2,
      y: rectangle.y + rectangle.height / 2
    });
  }

  function validateCameraModel(camera) {
    if (!camera || camera.kind !== MODEL_KIND) {
      throw new TypeError("Structural camera operation requires a structural_camera model.");
    }
    return camera;
  }

  function createTruthfulness(cameraTransformApplied) {
    return Object.freeze({
      cameraTransformApplied,
      geometricZoomApplied: false,
      geometryRendered: false,
      sheetsMaterialized: false,
      coveringStructureClaimed: false
    });
  }

  function createModel(canonicalViewBox, contentBounds, centerX, centerY, cameraScale, minScale, maxScale) {
    const canonical = normalizeRectangle(canonicalViewBox, "canonicalViewBox");
    const content = normalizeRectangle(contentBounds, "contentBounds");
    assertContainedRectangle(canonical, content, "contentBounds");

    assertPositiveFiniteNumber(minScale, "minScale");
    assertPositiveFiniteNumber(maxScale, "maxScale");
    if (minScale > 1 || maxScale < 1 || minScale > maxScale) {
      throw new RangeError("Camera scale bounds must satisfy minScale <= 1 <= maxScale.");
    }

    const scale = assertPositiveFiniteNumber(cameraScale, "cameraScale");
    if (scale < minScale - EPSILON || scale > maxScale + EPSILON) {
      throw new RangeError("cameraScale must lie within the configured camera scale bounds.");
    }

    const requestedCenterX = assertFiniteNumber(centerX, "centerX");
    const requestedCenterY = assertFiniteNumber(centerY, "centerY");
    const clampedCenterX = clamp(requestedCenterX, content.x, rectangleRight(content));
    const clampedCenterY = clamp(requestedCenterY, content.y, rectangleBottom(content));
    const center = canonicalCenter(canonical);
    const cameraTransformApplied = !(
      approximatelyEqual(scale, 1) &&
      approximatelyEqual(clampedCenterX, center.x) &&
      approximatelyEqual(clampedCenterY, center.y)
    );

    return Object.freeze({
      kind: MODEL_KIND,
      presentationOnly: true,
      scaleSemantic: SCALE_SEMANTIC,
      canonicalViewBox: canonical,
      contentBounds: content,
      centerX: clampedCenterX,
      centerY: clampedCenterY,
      cameraScale: scale,
      minScale,
      maxScale,
      cameraTransformApplied,
      truthfulness: createTruthfulness(cameraTransformApplied)
    });
  }

  function createStructuralCameraModel(options) {
    if (!options || typeof options !== "object") {
      throw new TypeError("Structural camera creation requires an options object.");
    }

    const canonicalViewBox = normalizeRectangle(options.canonicalViewBox, "canonicalViewBox");
    const contentBounds = normalizeRectangle(options.contentBounds ?? canonicalViewBox, "contentBounds");
    assertContainedRectangle(canonicalViewBox, contentBounds, "contentBounds");

    const minScale = options.minScale ?? DEFAULT_MIN_SCALE;
    const maxScale = options.maxScale ?? DEFAULT_MAX_SCALE;
    const center = canonicalCenter(canonicalViewBox);

    return createModel(
      canonicalViewBox,
      contentBounds,
      center.x,
      center.y,
      1,
      minScale,
      maxScale
    );
  }

  function getCameraViewBox(camera) {
    validateCameraModel(camera);
    const width = camera.canonicalViewBox.width / camera.cameraScale;
    const height = camera.canonicalViewBox.height / camera.cameraScale;

    return Object.freeze({
      kind: VIEW_KIND,
      x: camera.centerX - width / 2,
      y: camera.centerY - height / 2,
      width,
      height
    });
  }

  function serializeCameraViewBox(camera) {
    const viewBox = getCameraViewBox(camera);
    return `${String(viewBox.x)} ${String(viewBox.y)} ${String(viewBox.width)} ${String(viewBox.height)}`;
  }

  function panCamera(camera, deltaX, deltaY) {
    validateCameraModel(camera);
    const dx = assertFiniteNumber(deltaX, "deltaX");
    const dy = assertFiniteNumber(deltaY, "deltaY");

    return createModel(
      camera.canonicalViewBox,
      camera.contentBounds,
      camera.centerX + dx,
      camera.centerY + dy,
      camera.cameraScale,
      camera.minScale,
      camera.maxScale
    );
  }

  function zoomCamera(camera, factor, anchorX = camera?.centerX, anchorY = camera?.centerY) {
    validateCameraModel(camera);
    const zoomFactor = assertPositiveFiniteNumber(factor, "factor");
    const anchorPointX = assertFiniteNumber(anchorX, "anchorX");
    const anchorPointY = assertFiniteNumber(anchorY, "anchorY");
    const oldViewBox = getCameraViewBox(camera);
    const nextScale = clamp(camera.cameraScale * zoomFactor, camera.minScale, camera.maxScale);
    const nextWidth = camera.canonicalViewBox.width / nextScale;
    const nextHeight = camera.canonicalViewBox.height / nextScale;
    const normalizedAnchorX = (anchorPointX - oldViewBox.x) / oldViewBox.width;
    const normalizedAnchorY = (anchorPointY - oldViewBox.y) / oldViewBox.height;
    const nextX = anchorPointX - normalizedAnchorX * nextWidth;
    const nextY = anchorPointY - normalizedAnchorY * nextHeight;

    return createModel(
      camera.canonicalViewBox,
      camera.contentBounds,
      nextX + nextWidth / 2,
      nextY + nextHeight / 2,
      nextScale,
      camera.minScale,
      camera.maxScale
    );
  }

  function fitCameraToBounds(camera, bounds, options = {}) {
    validateCameraModel(camera);
    const targetBounds = normalizeRectangle(bounds, "bounds");
    assertContainedRectangle(camera.contentBounds, targetBounds, "bounds");
    const padding = options.padding ?? 24;
    assertFiniteNumber(padding, "padding");
    if (padding < 0) {
      throw new RangeError("padding must be zero or greater.");
    }

    const paddedWidth = targetBounds.width + 2 * padding;
    const paddedHeight = targetBounds.height + 2 * padding;
    const targetScale = clamp(
      Math.min(
        camera.canonicalViewBox.width / paddedWidth,
        camera.canonicalViewBox.height / paddedHeight
      ),
      camera.minScale,
      camera.maxScale
    );

    return createModel(
      camera.canonicalViewBox,
      camera.contentBounds,
      targetBounds.x + targetBounds.width / 2,
      targetBounds.y + targetBounds.height / 2,
      targetScale,
      camera.minScale,
      camera.maxScale
    );
  }

  function fitCameraToVisibleStructure(camera, options = {}) {
    validateCameraModel(camera);
    return fitCameraToBounds(camera, camera.contentBounds, options);
  }

  function fitCameraToLevel(camera, layoutDescriptor, depth, options = {}) {
    validateCameraModel(camera);
    if (!layoutDescriptor || typeof layoutDescriptor !== "object" || !Array.isArray(layoutDescriptor.levelBounds)) {
      throw new TypeError("fitCameraToLevel requires a layout descriptor with levelBounds.");
    }
    if (!Number.isInteger(depth) || depth < 0) {
      throw new RangeError("depth must be a non-negative integer.");
    }

    const level = layoutDescriptor.levelBounds.find((candidate) => candidate && candidate.depth === depth);
    if (!level) {
      throw new RangeError(`No camera layout bounds are available for structural depth ${String(depth)}.`);
    }

    return fitCameraToBounds(camera, level, options);
  }

  function reconcileCameraExtent(camera, canonicalViewBox, contentBounds = canonicalViewBox) {
    validateCameraModel(camera);
    const nextCanonical = normalizeRectangle(canonicalViewBox, "canonicalViewBox");
    const nextContent = normalizeRectangle(contentBounds, "contentBounds");
    assertContainedRectangle(nextCanonical, nextContent, "contentBounds");

    if (!camera.cameraTransformApplied) {
      return createStructuralCameraModel({
        canonicalViewBox: nextCanonical,
        contentBounds: nextContent,
        minScale: camera.minScale,
        maxScale: camera.maxScale
      });
    }

    return createModel(
      nextCanonical,
      nextContent,
      camera.centerX,
      camera.centerY,
      camera.cameraScale,
      camera.minScale,
      camera.maxScale
    );
  }

  function resetCamera(camera) {
    validateCameraModel(camera);
    return createStructuralCameraModel({
      canonicalViewBox: camera.canonicalViewBox,
      contentBounds: camera.contentBounds,
      minScale: camera.minScale,
      maxScale: camera.maxScale
    });
  }

  function resolveStructuralSurface(target) {
    if (!target || typeof target !== "object") {
      throw new TypeError("Structural camera application requires an SVG surface or structural visualization target.");
    }
    if (typeof target.setAttribute === "function" && target.dataset) return target;
    if (typeof target.querySelector !== "function") {
      throw new TypeError("Structural camera target must expose querySelector or be an SVG-like surface.");
    }
    const surface = target.querySelector("svg.structural-visualization__surface");
    if (!surface || typeof surface.setAttribute !== "function" || !surface.dataset) {
      throw new TypeError("Structural camera target does not contain a structural SVG surface.");
    }
    return surface;
  }

  function applyStructuralCamera(camera, target) {
    validateCameraModel(camera);
    const surface = resolveStructuralSurface(target);
    const serializedViewBox = serializeCameraViewBox(camera);
    const cameraState = camera.cameraTransformApplied ? "transformed" : "identity";

    surface.setAttribute("viewBox", serializedViewBox);
    surface.dataset.cameraState = cameraState;
    surface.dataset.cameraScale = String(camera.cameraScale);
    surface.dataset.cameraTransformApplied = String(camera.cameraTransformApplied);
    surface.dataset.geometricZoomApplied = "false";

    if (target !== surface && target.dataset) {
      target.dataset.cameraState = cameraState;
      target.dataset.cameraScale = String(camera.cameraScale);
      target.dataset.cameraTransformApplied = String(camera.cameraTransformApplied);
      target.dataset.geometricZoomApplied = "false";
    }

    return camera;
  }

  const api = Object.freeze({
    MODEL_KIND,
    VIEW_KIND,
    SCALE_SEMANTIC,
    DEFAULT_MIN_SCALE,
    DEFAULT_MAX_SCALE,
    createStructuralCameraModel,
    getCameraViewBox,
    serializeCameraViewBox,
    panCamera,
    zoomCamera,
    fitCameraToBounds,
    fitCameraToVisibleStructure,
    fitCameraToLevel,
    reconcileCameraExtent,
    resetCamera,
    applyStructuralCamera
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.StructuralCamera = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

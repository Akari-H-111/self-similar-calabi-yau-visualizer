"use strict";

(function attachGeometricPullbackRenderer(globalObject) {
  const RENDERER_KIND = "svg_finite_sampled_geometric_pullback_projection";
  const RENDERER_VERSION = "v0.01";

  class GeometricPullbackRendererError extends Error {
    constructor(message) { super(message); this.name = "GeometricPullbackRendererError"; }
  }

  function baseRenderer() {
    if (typeof module !== "undefined" && module.exports) return require("./base-geometric-renderer.js");
    if (!globalObject.BaseGeometricRenderer) throw new GeometricPullbackRendererError("BaseGeometricRenderer is required for the presentation transform.");
    return globalObject.BaseGeometricRenderer;
  }
  function viewSemantics() {
    if (typeof module !== "undefined" && module.exports) return require("./geometric-pullback-view-semantics.js");
    if (!globalObject.GeometricPullbackViewSemantics) throw new GeometricPullbackRendererError("GeometricPullbackViewSemantics is required.");
    return globalObject.GeometricPullbackViewSemantics;
  }
  function escapeXml(value) {
    return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
  }

  function createProjectedLevel(scene, baseView, pullbackView, level, viewport) {
    if (!level || level.kind !== "finite_geometric_pullback_level" || !Array.isArray(level.points) || level.pointCount !== level.points.length) {
      throw new GeometricPullbackRendererError("A finite geometric pullback level is required.");
    }
    const binding = viewSemantics().validateAgainstBaseView(pullbackView, baseView, scene, level.depth);
    if (binding.sourceObject !== level.sourceObject) throw new GeometricPullbackRendererError("Depth-indexed view source object does not match the geometric level.");
    const semanticPoints = level.points.map((point) => {
      if (!point || point.depth !== level.depth || point.sourceObject !== level.sourceObject || typeof point.pointId !== "string" ||
          typeof point.ancestorSampleId !== "string" || !Array.isArray(point.coordinates) || point.coordinates.length !== 4) {
        throw new GeometricPullbackRendererError("Every pullback point must retain depth, source id, ancestry, and four coordinates.");
      }
      if (level.depth > 0 && (typeof point.parentId !== "string" || !Array.isArray(point.rootMultiIndex))) {
        throw new GeometricPullbackRendererError("Positive-depth pullback points require parent id and root multi-index.");
      }
      const z1 = point.coordinates[0];
      if (!Number.isFinite(z1.re) || !Number.isFinite(z1.im)) throw new GeometricPullbackRendererError("Projected z1 coordinates must be finite.");
      return Object.freeze({sourcePointId:point.pointId,parentId:point.parentId,ancestorSampleId:point.ancestorSampleId,
        rootMultiIndex:point.rootMultiIndex,depth:point.depth,x:z1.re,y:z1.im});
    });
    const overlapCounts = new Map();
    for (const point of semanticPoints) {
      const key = String(point.x) + "," + String(point.y);
      overlapCounts.set(key, (overlapCounts.get(key) || 0) + 1);
    }
    const B = baseRenderer();
    const transform = B.createViewportTransform(semanticPoints, viewport || B.DEFAULT_VIEWPORT);
    const marks = semanticPoints.map((point) => {
      const pixel = B.toViewport(transform, point.x, point.y);
      const key = String(point.x) + "," + String(point.y);
      return Object.freeze({...point,viewportX:pixel.x,viewportY:pixel.y,projectedPullbackPointOverlapCount:overlapCounts.get(key)});
    });
    const geometryRendered = marks.length > 0;
    return Object.freeze({
      kind:"geometric_pullback_projected_level",rendererKind:RENDERER_KIND,rendererVersion:RENDERER_VERSION,
      viewId:pullbackView.viewId,depth:level.depth,sourceObject:level.sourceObject,sourceSeedCount:level.sourceSeedCount,
      pointCount:level.pointCount,fiberCardinality:level.fiberCardinality,
      completeFiberOverEachMaterializedParent:level.completeFiberOverEachMaterializedParent,sourceManifoldCompletenessClaim:false,
      presentationTransform:transform,marks:Object.freeze(marks),
      truthfulness:Object.freeze({geometryRendered,pullbackGeometryRendered:geometryRendered&&level.depth>0,
        sheetsMaterialized:false,coveringStructureClaimed:false,geometricZoomApplied:false}),
      overlapPolicy:"projected_pullback_point_overlap_count_only"
    });
  }

  function axisMarkup(model) {
    const B=baseRenderer(), t=model.presentationTransform;
    if (!t.semanticBounds) return "";
    const {minX,maxX,minY,maxY}=t.semanticBounds;
    let markup="";
    if (minY<=0 && maxY>=0) {
      const a=B.toViewport(t,minX,0), b=B.toViewport(t,maxX,0);
      markup += '<line class="geometric-pullback-axis" x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" aria-hidden="true"></line>';
    }
    if (minX<=0 && maxX>=0) {
      const a=B.toViewport(t,0,minY), b=B.toViewport(t,0,maxY);
      markup += '<line class="geometric-pullback-axis" x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" aria-hidden="true"></line>';
    }
    return markup;
  }

  function buildSvgMarkup(model) {
    if (!model || model.kind!=="geometric_pullback_projected_level") throw new GeometricPullbackRendererError("Projected pullback level model is required.");
    const {width,height}=model.presentationTransform.viewport;
    const radius=model.depth===0?3:1.65;
    const marks=model.marks.map((mark)=>{
      const tuple=mark.rootMultiIndex?mark.rootMultiIndex.join(","):"";
      const parent=mark.parentId||"";
      return '<circle class="geometric-pullback-mark" cx="'+mark.viewportX+'" cy="'+mark.viewportY+'" r="'+radius+'" '+
        'data-source-point-id="'+escapeXml(mark.sourcePointId)+'" data-parent-id="'+escapeXml(parent)+'" '+
        'data-ancestor-x0-sample-id="'+escapeXml(mark.ancestorSampleId)+'" data-geometric-depth="'+String(mark.depth)+'" '+
        'data-root-multi-index="'+escapeXml(tuple)+'" data-semantic-x="'+escapeXml(mark.x)+'" data-semantic-y="'+escapeXml(mark.y)+'" '+
        'data-projected-overlap-count="'+String(mark.projectedPullbackPointOverlapCount)+'" '+
        'aria-label="'+escapeXml(mark.sourcePointId+": ("+mark.x+", "+mark.y+")")+'"></circle>';
    }).join("");
    return '<svg class="geometric-pullback-renderer__surface" viewBox="0 0 '+width+" "+height+
      '" role="img" aria-labelledby="geometric-pullback-label" data-renderer-kind="'+RENDERER_KIND+
      '" data-geometric-depth="'+String(model.depth)+'" data-presentation-transform="fit-uniform">'+
      '<rect class="geometric-pullback-frame" x="0.5" y="0.5" width="'+(width-1)+'" height="'+(height-1)+'" aria-hidden="true"></rect>'+
      axisMarkup(model)+marks+"</svg>";
  }

  function renderProjectedLevel(model,target) {
    if (!target || typeof target!=="object") throw new GeometricPullbackRendererError("A DOM-like target is required.");
    target.innerHTML=buildSvgMarkup(model); target.hidden=false;
    target.dataset.state=model.truthfulness.geometryRendered?"ready":"empty";
    target.dataset.geometryRendered=String(model.truthfulness.geometryRendered);
    target.dataset.pullbackGeometryRendered=String(model.truthfulness.pullbackGeometryRendered);
    target.dataset.renderedGeometricDepth=String(model.depth);
    target.dataset.sheetsMaterialized="false"; target.dataset.coveringStructureClaimed="false"; target.dataset.geometricZoomApplied="false";
    target.dataset.sourceObject=model.sourceObject; target.dataset.viewId=model.viewId; target.dataset.markCount=String(model.marks.length);
    target.dataset.rendererTechnology="svg"; target.dataset.fallbackUsed="false";
    return model;
  }

  const api=Object.freeze({RENDERER_KIND,RENDERER_VERSION,GeometricPullbackRendererError,createProjectedLevel,buildSvgMarkup,renderProjectedLevel});
  if (typeof module!=="undefined" && module.exports) module.exports=api;
  globalObject.GeometricPullbackRenderer=api;
})(typeof globalThis!=="undefined"?globalThis:this);

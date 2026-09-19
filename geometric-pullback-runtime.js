"use strict";

(function initializeGeometricPullbackRuntime(globalObject) {
  const statusElement=document.querySelector("#geometric-pullback-status");
  const visualizationElement=document.querySelector("#geometric-pullback-visualization");
  const labelElement=document.querySelector("#geometric-pullback-label");
  const provenanceElement=document.querySelector("#geometric-pullback-provenance");
  const depthSelect=document.querySelector("#geometric-pullback-depth");

  async function fetchJson(path) {
    const response=await fetch(path,{cache:"no-store"});
    if (!response.ok) throw new Error(path+": HTTP "+String(response.status));
    return response.json();
  }
  function resetFailureState(message) {
    visualizationElement.hidden=false; visualizationElement.innerHTML="";
    visualizationElement.dataset.state="error"; visualizationElement.dataset.geometryRendered="false";
    visualizationElement.dataset.pullbackGeometryRendered="false"; visualizationElement.dataset.renderedGeometricDepth="none";
    visualizationElement.dataset.sheetsMaterialized="false"; visualizationElement.dataset.coveringStructureClaimed="false";
    visualizationElement.dataset.geometricZoomApplied="false"; visualizationElement.dataset.fallbackUsed="false";
    statusElement.dataset.state="error"; statusElement.textContent="Geometric pullback unavailable: "+message;
    provenanceElement.textContent="No substitute or partial-fiber geometry was generated.";
  }
  function labelFor(view,depth) {
    if (depth===0) return view.uiWording.depthZeroLabel;
    return view.uiWording.positiveDepthLabelTemplate.replace("{n}",String(depth));
  }
  function renderDepth(state,depth) {
    const level=state.sceneModel.levels[depth];
    if (!level) throw new Error("Requested geometric depth is not materialized.");
    const projected=globalObject.GeometricPullbackRenderer.createProjectedLevel(state.scene,state.baseView,state.pullbackView,level);
    globalObject.GeometricPullbackRenderer.renderProjectedLevel(projected,visualizationElement);
    labelElement.textContent=labelFor(state.pullbackView,depth);
    statusElement.dataset.state=projected.truthfulness.geometryRendered?"ready":"empty";
    statusElement.textContent=depth===0
      ? "Depth 0 reuses "+String(level.pointCount)+" deterministic admitted X_0 seed samples. This is still a finite sample, not complete X_0."
      : "Depth "+String(depth)+" renders "+String(level.pointCount)+" deterministic preimage points from "+String(level.parentPointCount)+
        " materialized parents; verified fiber cardinality "+String(level.fiberCardinality)+
        " per parent. Complete parent fibers are rendered, but this is not complete "+level.sourceObject+".";
    provenanceElement.textContent="Provenance: data/system.v2.json → canonical P_D coordinate-power map → Thread 24 admitted X_0 sampler → "+
      "complete deterministic coordinate-root fibers → verified parent relation → geometric depth "+String(depth)+
      " → Thread 25 depth-indexed z1 descriptor → (Re(z1), Im(z1)) → SVG presentation transform. "+
      "Root tuples are enumeration indices only, not sheet identities.";
    state.currentDepth=depth; state.projected=projected; globalObject.Thread25GeometricPullbackState=state;
  }

  async function loadGeometricPullbackScene() {
    try {
      const [scene,baseView,baseConfig,pullbackView,pullbackConfig]=await Promise.all([
        fetchJson("data/system.v2.json"),fetchJson("data/geometric-view.v1.json"),fetchJson("data/base-geometric-render-config.v1.json"),
        fetchJson("data/geometric-pullback-view.v1.json"),fetchJson("data/geometric-pullback-config.v1.json")
      ]);
      globalObject.GeometricPullbackEngine.validateConfig(pullbackConfig);
      globalObject.GeometricPullbackViewSemantics.validateAgainstBaseView(pullbackView,baseView,scene,0);
      const sampleModel=globalObject.BaseGeometricSampler.generateSamples(scene,baseConfig);
      const canonicalDepth=pullbackConfig.materialization.canonicalRenderedDepth;
      const sceneModel=globalObject.GeometricPullbackEngine.generateLevels(scene,sampleModel,baseConfig,pullbackConfig,canonicalDepth);
      const state={scene,baseView,baseConfig,pullbackView,pullbackConfig,sampleModel,sceneModel,currentDepth:canonicalDepth,projected:null};
      depthSelect.innerHTML="";
      for (const level of sceneModel.levels) {
        const option=document.createElement("option");
        option.value=String(level.depth); option.textContent=level.sourceObject+" · finite sampled geometry"; depthSelect.appendChild(option);
      }
      depthSelect.value=String(canonicalDepth); depthSelect.disabled=false;
      depthSelect.addEventListener("change",()=>{try{renderDepth(state,Number(depthSelect.value));}catch(error){console.error("Failed to switch Thread 25 geometric depth:",error);resetFailureState(error.message);}});
      renderDepth(state,canonicalDepth);
    } catch(error) {
      console.error("Failed to initialize Thread 25 geometric pullback renderer:",error);
      depthSelect.disabled=true; labelElement.textContent="Finite sampled geometric pullback"; resetFailureState(error.message);
    }
  }

  if (!statusElement || !visualizationElement || !labelElement || !provenanceElement || !depthSelect) throw new Error("Thread 25 geometric pullback DOM targets are missing.");
  loadGeometricPullbackScene();
})(typeof globalThis!=="undefined"?globalThis:this);

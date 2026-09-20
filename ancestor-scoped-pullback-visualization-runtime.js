"use strict";

(function initializeAncestorScopedPullbackVisualization(globalObject) {
  const statusElement=document.querySelector("#ancestor-scoped-pullback-status");
  const visualizationElement=document.querySelector("#ancestor-scoped-pullback-visualization");
  const provenanceElement=document.querySelector("#ancestor-scoped-pullback-provenance");
  const ancestorSelect=document.querySelector("#ancestor-scoped-pullback-ancestor");
  const ancestorSearch=document.querySelector("#ancestor-scoped-pullback-ancestor-search");
  const ancestorResults=document.querySelector("#ancestor-scoped-pullback-results");
  const depthSelect=document.querySelector("#ancestor-scoped-pullback-depth");
  const renderButton=document.querySelector("#ancestor-scoped-pullback-render");
  const selectedOutput=document.querySelector("#ancestor-scoped-pullback-selected");
  const inspectorElement=document.querySelector("#ancestor-scoped-pullback-inspector");

  function fetchJson(path) {
    return fetch(path,{cache:"no-store"}).then((response)=>{
      if(!response.ok) throw new Error(path+": HTTP "+String(response.status));
      return response.json();
    });
  }

  function setInspector(values) {
    const fields={
      point:"point",
      ancestor:"ancestor",
      parent:"parent",
      root:"root",
      overlap:"overlap"
    };
    for(const [key,field] of Object.entries(fields)) {
      const target=inspectorElement.querySelector('[data-scoped-inspector-field="'+field+'"]');
      if(target) target.textContent=values[key]??"—";
    }
  }

  function inspectMark(mark) {
    if(!mark) {
      setInspector({point:"No rendered point",ancestor:"—",parent:"—",root:"—",overlap:"—"});
      return;
    }
    setInspector({
      point:mark.getAttribute("data-source-point-id")||"—",
      ancestor:mark.getAttribute("data-ancestor-x0-sample-id")||"—",
      parent:mark.getAttribute("data-parent-id")||"depth 0 · no parent",
      root:mark.getAttribute("data-root-multi-index")||"depth 0 · no root index",
      overlap:mark.getAttribute("data-projected-overlap-count")||"—"
    });
  }

  function resetVisualizationDatasets(state,overCap,preflight) {
    visualizationElement.hidden=false;
    visualizationElement.innerHTML="";
    visualizationElement.dataset.state=overCap?"over-cap":"idle";
    visualizationElement.dataset.geometryRendered="false";
    visualizationElement.dataset.pullbackGeometryRendered="false";
    visualizationElement.dataset.renderedGeometricDepth="none";
    visualizationElement.dataset.sheetsMaterialized="false";
    visualizationElement.dataset.coveringStructureClaimed="false";
    visualizationElement.dataset.geometricZoomApplied="false";
    visualizationElement.dataset.fallbackUsed="false";
    visualizationElement.dataset.markCount="0";
    visualizationElement.dataset.scopeComplete="false";
    visualizationElement.dataset.globalCompletenessClaim="false";
    visualizationElement.dataset.overCapRejected=String(overCap);
    if(state) {
      visualizationElement.dataset.selectedAncestorId=state.selectedAncestorId||"";
      visualizationElement.dataset.requestedScopedDepth=String(state.requestedScopedDepth??"");
      visualizationElement.dataset.scopeId=state.scopeId||"";
    }
    if(preflight) visualizationElement.dataset.requiredPointCount=preflight.requiredPointCount;
    inspectMark(null);
  }

  function updateSelectedOutput() {
    selectedOutput.value=ancestorSelect.value||"—";
    selectedOutput.textContent=ancestorSelect.value||"—";
  }

  function renderAncestorMatches(state) {
    const query=ancestorSearch.value.trim().toLowerCase();
    const matches=state.sampleModel.samples.filter((sample)=>sample.sampleId.toLowerCase().includes(query)).slice(0,24);
    ancestorResults.replaceChildren();
    for(const sample of matches) {
      const candidate=document.createElement("button");
      candidate.type="button";
      candidate.setAttribute("role","option");
      candidate.dataset.ancestorId=sample.sampleId;
      candidate.setAttribute("aria-selected",String(sample.sampleId===ancestorSelect.value));
      candidate.textContent=sample.sampleId;
      ancestorResults.appendChild(candidate);
    }
    ancestorResults.hidden=matches.length===0;
    ancestorSearch.setAttribute("aria-expanded",String(matches.length>0));
    ancestorResults.dataset.matchCount=String(matches.length);
    ancestorResults.dataset.totalAdmittedCount=String(state.sampleModel.sampleCount);
  }

  function chooseAncestor(state,ancestorId) {
    if(!state.admittedAncestorIds.has(ancestorId)) {
      throw new Error("Selected ancestor is not in the admitted X_0 scope.");
    }
    ancestorSelect.value=ancestorId;
    ancestorSearch.value=ancestorId;
    updateSelectedOutput();
    renderAncestorMatches(state);
    ancestorSelect.dispatchEvent(new Event("change"));
  }

  function setFailure(message) {
    resetVisualizationDatasets(null,false,null);
    visualizationElement.dataset.state="error";
    statusElement.dataset.state="error";
    statusElement.textContent="Ancestor-scoped geometry unavailable: "+message;
    provenanceElement.textContent="No substitute or partial scoped geometry was generated.";
    ancestorSelect.disabled=true;
    ancestorSearch.disabled=true;
    depthSelect.disabled=true;
    renderButton.disabled=true;
  }

  function renderSelectedScope(state) {
    const selectedAncestorId=ancestorSelect.value;
    if(!state.admittedAncestorIds.has(selectedAncestorId)) {
      throw new Error("Selected ancestor is not in the admitted X_0 scope.");
    }
    const requestedScopedDepth=Number(depthSelect.value);
    updateSelectedOutput();
    const D=state.scene.mathematics.parameters.D;
    const cap=state.pullbackConfig.materialization.maxGeneratedPoints;
    const preflight=globalObject.AncestorScopedPullbackRuntime.preflightScopedRequest(
      1,D,requestedScopedDepth,cap
    );
    const requestState={selectedAncestorId,requestedScopedDepth,scopeId:"ancestor-scope-v1:"+selectedAncestorId};

    if(!preflight.admitted) {
      resetVisualizationDatasets(requestState,true,preflight);
      statusElement.dataset.state="over-cap";
      statusElement.textContent=
        "Scoped depth "+String(requestedScopedDepth)+" for "+selectedAncestorId+
        " requires exactly "+preflight.requiredPointCount+" points, exceeding the hard cap "+
        String(preflight.maxGeneratedPoints)+". The request was rejected before recursive pullback generation; zero partial marks are shown.";
      provenanceElement.textContent=
        "Scope provenance: selected admitted X_0 ancestor "+selectedAncestorId+
        ". Over-cap preflight used |A|·(D^4)^n with |A|=1 and D="+String(D)+
        ". No parent fiber, root tuple, or projected point was partially materialized.";
      state.scopedState=null;
      state.projected=null;
      state.lastPreflight=preflight;
      state.selectedAncestorId=selectedAncestorId;
      state.requestedScopedDepth=requestedScopedDepth;
      globalObject.Thread30AncestorScopedVisualizationState=state;
      return;
    }

    statusElement.dataset.state="rendering";
    statusElement.textContent="Rendering the complete admitted ancestor scope…";

    const scopedState=globalObject.AncestorScopedPullbackRuntime.materializeScopedScene(
      state.scene,state.sampleModel,[selectedAncestorId],requestedScopedDepth,
      state.baseConfig,state.pullbackConfig
    );
    const level=scopedState.sceneModel.levels[requestedScopedDepth];
    const projected=globalObject.GeometricPullbackRenderer.createProjectedLevel(
      state.scene,state.baseView,state.pullbackView,level
    );
    globalObject.GeometricPullbackRenderer.renderProjectedLevel(projected,visualizationElement);

    const surface=visualizationElement.querySelector("svg.geometric-pullback-renderer__surface");
    if(surface) {
      surface.setAttribute("aria-labelledby","ancestor-scoped-pullback-label");
      surface.dataset.scopeId=scopedState.scopeId;
    }
    visualizationElement.dataset.scopeId=scopedState.scopeId;
    visualizationElement.dataset.selectedAncestorId=selectedAncestorId;
    visualizationElement.dataset.selectedAncestorCount=String(scopedState.selectedAncestorCount);
    visualizationElement.dataset.requestedScopedDepth=String(requestedScopedDepth);
    visualizationElement.dataset.requiredPointCount=scopedState.requiredPointCount;
    visualizationElement.dataset.scopeComplete="true";
    visualizationElement.dataset.globalCompletenessClaim="false";
    visualizationElement.dataset.overCapRejected="false";

    statusElement.dataset.state="ready";
    statusElement.textContent=requestedScopedDepth===0
      ? "Scoped depth 0 renders the one selected admitted X_0 ancestor ("+selectedAncestorId+"). This is complete for the selected finite ancestor scope, not complete global X_0."
      : "Scoped depth "+String(requestedScopedDepth)+" renders "+String(level.pointCount)+
        " deterministic points: the complete recursive pullback of selected finite ancestor "+selectedAncestorId+
        " through that scoped depth. It is not complete global "+level.sourceObject+".";

    provenanceElement.textContent=
      "Scope provenance: "+selectedAncestorId+" → complete Thread 25 parent fibers → scoped depth "+
      String(requestedScopedDepth)+" → inherited Thread 23 projection (Re(z1), Im(z1)). "+
      "Each rendered mark carries source ancestor id, declared parent id, root multi-index, and projected-overlap count. "+
      "Root tuples remain enumeration metadata only; projected overlap does not imply source self-intersection or covering multiplicity.";

    inspectMark(visualizationElement.querySelector(".geometric-pullback-mark"));
    state.scopedState=scopedState;
    state.projected=projected;
    state.lastPreflight=preflight;
    state.selectedAncestorId=selectedAncestorId;
    state.requestedScopedDepth=requestedScopedDepth;
    globalObject.Thread30AncestorScopedVisualizationState=state;
  }

  async function initialize() {
    try {
      const [scene,baseView,baseConfig,pullbackView,pullbackConfig]=await Promise.all([
        fetchJson("data/system.v2.json"),
        fetchJson("data/geometric-view.v1.json"),
        fetchJson("data/base-geometric-render-config.v1.json"),
        fetchJson("data/geometric-pullback-view.v1.json"),
        fetchJson("data/geometric-pullback-config.v1.json")
      ]);
      globalObject.GeometricPullbackEngine.validateConfig(pullbackConfig);
      globalObject.GeometricPullbackViewSemantics.validateAgainstBaseView(pullbackView,baseView,scene,0);
      const sampleModel=globalObject.BaseGeometricSampler.generateSamples(scene,baseConfig);
      if(sampleModel.sampleCount===0) throw new Error("Canonical Thread 24 sample model is empty.");

      depthSelect.innerHTML="";
      for(let depth=0;depth<=4;depth+=1) {
        const option=document.createElement("option");
        option.value=String(depth);
        option.textContent="Scoped depth "+String(depth);
        depthSelect.appendChild(option);
      }
      ancestorSelect.value=sampleModel.samples[0].sampleId;
      ancestorSearch.value=ancestorSelect.value;
      depthSelect.value="3";
      updateSelectedOutput();

      const state={scene,baseView,baseConfig,pullbackView,pullbackConfig,sampleModel,admittedAncestorIds:new Set(sampleModel.samples.map((sample)=>sample.sampleId)),scopedState:null,projected:null,lastPreflight:null,selectedAncestorId:null,requestedScopedDepth:null};
      resetVisualizationDatasets(null,false,null);
      visualizationElement.hidden=true;
      ancestorSelect.disabled=false;
      ancestorSearch.disabled=false;
      depthSelect.disabled=false;
      renderButton.disabled=false;
      statusElement.dataset.state="ready";
      statusElement.textContent=
        "Ready. Choose one admitted X_0 ancestor and a scoped depth, then explicitly render. Changing controls alone does not generate recursive geometry.";
      provenanceElement.textContent=
        "No ancestor-scoped recursive geometry has been generated yet. The global Thread 24/25 panels above remain independent.";
      inspectMark(null);
      renderAncestorMatches(state);

      ancestorSelect.addEventListener("change",updateSelectedOutput);
      ancestorSearch.addEventListener("input",()=>renderAncestorMatches(state));
      ancestorSearch.addEventListener("focus",()=>renderAncestorMatches(state));
      ancestorSearch.addEventListener("keydown",(event)=>{
        if(event.key==="Escape") {
          ancestorResults.hidden=true;
          ancestorSearch.setAttribute("aria-expanded","false");
        } else if(event.key==="ArrowDown") {
          const first=ancestorResults.querySelector("button");
          if(first) { event.preventDefault(); first.focus(); }
        } else if(event.key==="Enter" && state.admittedAncestorIds.has(ancestorSearch.value.trim())) {
          event.preventDefault();
          chooseAncestor(state,ancestorSearch.value.trim());
        }
      });
      ancestorResults.addEventListener("click",(event)=>{
        const candidate=event.target.closest?.("button[data-ancestor-id]");
        if(candidate&&ancestorResults.contains(candidate)) chooseAncestor(state,candidate.dataset.ancestorId);
      });
      renderButton.addEventListener("click",()=>{
        try { renderSelectedScope(state); }
        catch(error) {
          console.error("Failed to render Thread 30 ancestor-scoped geometry:",error);
          setFailure(error.message);
        }
      });
      visualizationElement.addEventListener("click",(event)=>{
        const mark=event.target.closest?.(".geometric-pullback-mark");
        if(mark&&visualizationElement.contains(mark)) inspectMark(mark);
      });
      globalObject.Thread30AncestorScopedVisualizationState=state;
    } catch(error) {
      console.error("Failed to initialize Thread 30 ancestor-scoped visualization:",error);
      setFailure(error.message);
    }
  }

  if(!statusElement||!visualizationElement||!provenanceElement||!ancestorSelect||!depthSelect||!renderButton||!selectedOutput||!inspectorElement) {
    throw new Error("Thread 30 ancestor-scoped visualization DOM targets are missing.");
  }
  initialize();
})(typeof globalThis!=="undefined"?globalThis:this);

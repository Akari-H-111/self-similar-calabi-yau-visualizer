"use strict";

(function initializeHybridNavigationII(globalObject) {
  const root=document.querySelector("#hybrid-navigation-ii");
  const thread26Root=document.querySelector("#hybrid-navigation");
  const scopedStatus=document.querySelector("#ancestor-scoped-pullback-status");
  const scopedVisualization=document.querySelector("#ancestor-scoped-pullback-visualization");
  const modeButtons=Array.from(document.querySelectorAll("[data-hybrid-ii-mode]"));
  const panels=Array.from(document.querySelectorAll("[data-hybrid-ii-panel]"));
  const representationField=document.querySelector('[data-hybrid-ii-field="representation"]');
  const structuralDepthField=document.querySelector('[data-hybrid-ii-field="structural-depth"]');
  const globalDepthField=document.querySelector('[data-hybrid-ii-field="global-depth"]');
  const scopedDepthField=document.querySelector('[data-hybrid-ii-field="scoped-depth"]');
  const correspondenceField=document.querySelector('[data-hybrid-ii-field="correspondence"]');
  const scopeProvenanceField=document.querySelector('[data-hybrid-ii-field="scope-provenance"]');

  let config=null;
  let bridgeMode="structural";
  let returnMode="structural";
  let lastAction="initialize";
  let state=null;
  let refreshQueued=false;

  async function fetchJson(path){
    const response=await fetch(path,{cache:"no-store"});
    if(!response.ok)throw new Error(path+": HTTP "+String(response.status));
    return response.json();
  }

  function thread26Snapshot(){
    return globalObject.HybridNavigationIISemantics.createThread26Snapshot(globalObject.Thread26HybridNavigationState);
  }
  function scopedSnapshot(){
    return globalObject.HybridNavigationIISemantics.createScopedSnapshot(globalObject.Thread30AncestorScopedVisualizationState);
  }
  function formatScoped(scoped){
    if(scoped.available)return "rendered "+String(scoped.renderedDepth)+" · "+String(scoped.pointCount)+" marks · "+scoped.sourceObject;
    if(scoped.status==="over_cap_refused")return "unavailable after explicit over-cap refusal · required "+String(scoped.requiredPointCount);
    return "not rendered · use Thread 30 Render selected scope explicitly";
  }

  function renderState(nextState){
    state=nextState;
    root.dataset.state="ready";
    root.dataset.representationMode=nextState.representationMode;
    root.dataset.structuralSelectedDepth=String(nextState.structural.selectedDepth);
    root.dataset.globalGeometricDepth=String(nextState.globalGeometric.renderedDepth);
    root.dataset.scopedAvailable=String(nextState.scopedGeometric.available);
    root.dataset.scopedGeometricDepth=nextState.scopedGeometric.available?String(nextState.scopedGeometric.renderedDepth):"none";
    root.dataset.lastAction=nextState.navigationProvenance.lastAction;
    root.dataset.sheetsMaterialized="false";
    root.dataset.coveringStructureClaimed="false";
    root.dataset.geometricZoomApplied="false";
    thread26Root.dataset.thread31Mode=nextState.representationMode;

    representationField.textContent=
      nextState.representationMode==="structural"?"Global structural context active":
      nextState.representationMode==="global-geometric"?"Global finite sampled geometric context active":
      "Ancestor-scoped geometric context active";
    structuralDepthField.textContent=
      "selected "+String(nextState.structural.selectedDepth)+
      " · materialized "+String(nextState.structural.materializedDepth)+
      " · requested "+String(nextState.structural.requestedDepth);
    globalDepthField.textContent=
      "rendered "+String(nextState.globalGeometric.renderedDepth)+
      " · available ["+nextState.globalGeometric.availableDepths.join(", ")+"] · "+nextState.globalGeometric.sourceObject;
    scopedDepthField.textContent=formatScoped(nextState.scopedGeometric);

    const activeCorrespondence=
      nextState.representationMode==="scoped-geometric"
        ? nextState.correspondences.structuralScoped
        : nextState.correspondences.structuralGlobal;
    correspondenceField.textContent=activeCorrespondence.message+
      " Depths remain independent unless an existing explicit Thread 26 stage action or explicit Thread 30 render action changes its own layer.";

    scopeProvenanceField.textContent=nextState.scopedGeometric.available
      ? "Scoped provenance: ancestor "+nextState.scopedGeometric.selectedAncestorId+
        " · scope "+nextState.scopedGeometric.scopeId+
        " · complete over selected finite ancestor scope only."
      : "Scoped provenance: no currently rendered admitted scope. Switching context never invokes scoped generation.";

    for(const button of modeButtons){
      const mode=button.dataset.hybridIiMode;
      const active=mode===nextState.representationMode;
      button.setAttribute("aria-pressed",String(active));
      if(mode==="scoped-geometric")button.disabled=!nextState.scopedGeometric.available;
    }
    for(const panel of panels){
      panel.dataset.hybridIiActive=String(panel.dataset.hybridIiPanel===nextState.representationMode);
    }
    globalObject.Thread31HybridNavigationIIState=nextState;
    globalObject.dispatchEvent(new CustomEvent("thread31:hybrid-ii-state",{detail:nextState}));
  }

  function refresh(){
    if(!config)return;
    try{
      const t26=thread26Snapshot();
      const scoped=scopedSnapshot();
      if(bridgeMode==="scoped-geometric"&&!scoped.available){
        bridgeMode=returnMode;
        lastAction="scoped_context_unavailable_return_to_"+returnMode.replace("-","_");
      }
      renderState(globalObject.HybridNavigationIISemantics.createHybridNavigationIIState(config,t26,scoped,{
        representationMode:bridgeMode,returnMode,lastAction
      }));
    }catch(error){
      root.dataset.state="error";
      root.textContent="Hybrid Navigation II unavailable: "+error.message;
      console.error("Failed to refresh Thread 31 Hybrid Navigation II:",error);
    }
  }

  function queueRefresh(){
    if(refreshQueued)return;
    refreshQueued=true;
    queueMicrotask(()=>{refreshQueued=false;refresh();});
  }

  function scrollToMode(mode){
    const target=panels.find((panel)=>panel.dataset.hybridIiPanel===mode);
    target?.scrollIntoView?.({block:"start",behavior:"auto"});
  }

  function activateMode(mode){
    const scoped=scopedSnapshot();
    if(mode==="scoped-geometric"&&!scoped.available)return;
    if(mode==="structural"){
      returnMode="structural";
      const button=document.querySelector('[data-hybrid-mode="structural"]');
      if(button&&button.getAttribute("aria-pressed")!=="true")button.click();
    }else if(mode==="global-geometric"){
      returnMode="global-geometric";
      const button=document.querySelector('[data-hybrid-mode="geometric"]');
      if(button&&button.getAttribute("aria-pressed")!=="true")button.click();
    }else{
      const t26=thread26Snapshot();
      returnMode=t26.representationMode==="geometric"?"global-geometric":"structural";
    }
    bridgeMode=mode;
    lastAction="explicit_context_switch_"+mode.replace("-","_");
    refresh();
    scrollToMode(mode);
  }

  function ready(){
    return thread26Root?.dataset.state==="ready"&&
      scopedStatus?.dataset.state==="ready"&&
      globalObject.Thread26HybridNavigationState&&
      globalObject.Thread30AncestorScopedVisualizationState;
  }

  function waitForReady(timeoutMs=20000){
    if(ready())return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const deadline=Date.now()+timeoutMs;
      const observer=new MutationObserver(()=>{
        if(ready()){observer.disconnect();resolve();}
        else if(Date.now()>deadline){observer.disconnect();reject(new Error("Timed out waiting for Thread 26 and Thread 30 navigation sources."));}
      });
      observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true});
      const timer=setInterval(()=>{
        if(ready()){clearInterval(timer);observer.disconnect();resolve();}
        else if(Date.now()>deadline){clearInterval(timer);observer.disconnect();reject(new Error("Timed out waiting for Thread 26 and Thread 30 navigation sources."));}
      },100);
    });
  }

  async function initialize(){
    if(!root||!thread26Root||!scopedStatus||!scopedVisualization||
       !representationField||!structuralDepthField||!globalDepthField||!scopedDepthField||
       !correspondenceField||!scopeProvenanceField){
      throw new Error("Thread 31 Hybrid Navigation II DOM targets are missing.");
    }
    config=globalObject.HybridNavigationIISemantics.validateConfig(await fetchJson("data/hybrid-navigation-ii.v1.json"));
    bridgeMode=config.defaultRepresentationMode;
    returnMode="structural";
    await waitForReady();

    for(const button of modeButtons){
      button.addEventListener("click",()=>activateMode(button.dataset.hybridIiMode));
    }
    globalObject.addEventListener("thread26:hybrid-state",queueRefresh);
    const scopedObserver=new MutationObserver(queueRefresh);
    scopedObserver.observe(scopedVisualization,{attributes:true,childList:true,subtree:false});
    refresh();
  }

  initialize().catch((error)=>{
    console.error("Failed to initialize Thread 31 Hybrid Navigation II:",error);
    if(root){root.dataset.state="error";root.textContent="Hybrid Navigation II unavailable: "+error.message;}
  });
})(typeof globalThis!=="undefined"?globalThis:this);

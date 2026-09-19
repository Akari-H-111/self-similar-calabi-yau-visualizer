"use strict";

(function attachHybridNavigationIISemantics(globalObject) {
  const CONTRACT_VERSION=1;
  const DESCRIPTOR_VERSION="v0.01";
  const NAVIGATION_ID="hybrid_navigation_ii_global_scoped_geometry_bridge_v1";
  const MODES=Object.freeze(["structural","global-geometric","scoped-geometric"]);

  class HybridNavigationIIError extends Error {
    constructor(message){super(message);this.name="HybridNavigationIIError";}
  }

  function baseSemantics(){
    if(typeof module!=="undefined"&&module.exports)return require("./hybrid-navigation-semantics.js");
    if(!globalObject.HybridNavigationSemantics)throw new HybridNavigationIIError("HybridNavigationSemantics is required.");
    return globalObject.HybridNavigationSemantics;
  }
  function assertObject(value,path){
    if(!value||typeof value!=="object"||Array.isArray(value))throw new HybridNavigationIIError(path+" must be an object.");
  }
  function exactKeys(value,expected,path){
    const actual=Object.keys(value).sort(),target=[...expected].sort();
    if(actual.length!==target.length||actual.some((key,index)=>key!==target[index]))throw new HybridNavigationIIError(path+" has an unexpected key set.");
  }
  function clone(value){return JSON.parse(JSON.stringify(value));}
  function assertDepth(value,path){
    if(!Number.isSafeInteger(value)||value<0)throw new HybridNavigationIIError(path+" must be a nonnegative safe integer.");
    return value;
  }
  function assertMode(mode){
    if(!MODES.includes(mode))throw new HybridNavigationIIError("Unsupported Thread 31 representation mode: "+String(mode));
    return mode;
  }

  function validateConfig(config){
    assertObject(config,"config");
    exactKeys(config,["contractVersion","descriptorVersion","navigationId","defaultRepresentationMode","representationModes","dependencies","policies","truthFlags"],"config");
    if(config.contractVersion!==CONTRACT_VERSION||config.descriptorVersion!==DESCRIPTOR_VERSION||config.navigationId!==NAVIGATION_ID){
      throw new HybridNavigationIIError("Unsupported Thread 31 navigation descriptor.");
    }
    if(JSON.stringify(config.representationModes)!==JSON.stringify(MODES))throw new HybridNavigationIIError("Thread 31 representation modes drifted.");
    assertMode(config.defaultRepresentationMode);
    assertObject(config.dependencies,"config.dependencies");
    exactKeys(config.dependencies,["thread26NavigationId","thread30Milestone","explicitScopedGenerationAuthority"],"config.dependencies");
    if(config.dependencies.thread26NavigationId!=="hybrid_structural_geometric_navigation_v1"||
       config.dependencies.thread30Milestone!=="Ancestor-Scoped Geometric Visualization"||
       config.dependencies.explicitScopedGenerationAuthority!=="thread30_render_selected_scope_button"){
      throw new HybridNavigationIIError("Thread 31 dependency provenance is invalid.");
    }
    assertObject(config.policies,"config.policies");
    exactKeys(config.policies,[
      "modeSwitchTriggersGlobalGeometricGeneration","modeSwitchTriggersScopedGeometricGeneration",
      "structuralDepthControlsGlobalGeometricDepth","structuralDepthControlsScopedGeometricDepth",
      "globalGeometricDepthControlsStructuralDepth","globalGeometricDepthControlsScopedGeometricDepth",
      "scopedGeometricDepthControlsStructuralDepth","scopedGeometricDepthControlsGlobalGeometricDepth",
      "structuralNodeDefinesGeometricPoint","structuralBranchDefinesRootTuple",
      "selectedAncestorDefinesConnectedComponent","rootTupleDefinesSheetIdentity"
    ],"config.policies");
    for(const value of Object.values(config.policies)){
      if(value!==false)throw new HybridNavigationIIError("All Thread 31 navigation policies must remain false.");
    }
    assertObject(config.truthFlags,"config.truthFlags");
    exactKeys(config.truthFlags,[
      "completeGlobalHypersurfaceRendered","sheetsMaterialized","coveringStructureClaimed",
      "analyticBranchClaimed","connectedComponentClaimed","geometricZoomApplied"
    ],"config.truthFlags");
    for(const value of Object.values(config.truthFlags)){
      if(value!==false)throw new HybridNavigationIIError("Thread 31 truth flags exceed the admitted scope.");
    }
    return Object.freeze(clone(config));
  }

  function createThread26Snapshot(raw){
    assertObject(raw,"Thread 26 state");
    if(raw.kind!=="hybrid_structural_geometric_navigation_state"||raw.navigationId!=="hybrid_structural_geometric_navigation_v1"){
      throw new HybridNavigationIIError("Canonical Thread 26 navigation state is required.");
    }
    assertObject(raw.structural,"Thread 26 structural state");
    assertObject(raw.geometric,"Thread 26 geometric state");
    const structuralSelectedDepth=assertDepth(raw.structural.selectedDepth,"structural selected depth");
    const structuralRequestedDepth=assertDepth(raw.structural.requestedDepth,"structural requested depth");
    const structuralMaterializedDepth=assertDepth(raw.structural.materializedDepth,"structural materialized depth");
    const globalGeometricDepth=assertDepth(raw.geometric.renderedDepth,"global geometric depth");
    if(!Array.isArray(raw.geometric.availableDepths)||!raw.geometric.availableDepths.includes(globalGeometricDepth)){
      throw new HybridNavigationIIError("Thread 26 global geometric availability is inconsistent.");
    }
    const availableGlobalDepths=raw.geometric.availableDepths.map((depth,index)=>assertDepth(depth,"available global depth "+String(index)));
    if(raw.navigationProvenance?.geometricMaterializationTriggered!==false||
       raw.truthFlags?.sheetsMaterialized!==false||
       raw.truthFlags?.coveringStructureClaimed!==false||
       raw.truthFlags?.geometricZoomApplied!==false){
      throw new HybridNavigationIIError("Thread 26 state exceeds the navigation-only boundary.");
    }
    return Object.freeze({
      representationMode:raw.representationMode,
      structuralSelectedDepth,structuralRequestedDepth,structuralMaterializedDepth,
      globalGeometricDepth,
      availableGlobalDepths:Object.freeze([...availableGlobalDepths]),
      globalSourceObject:raw.geometric.sourceObject,
      selectedGeometricPointId:raw.selectedGeometricObject?.pointId??null
    });
  }

  function createScopedSnapshot(raw){
    if(!raw||typeof raw!=="object"){
      return Object.freeze({available:false,status:"not_ready",renderedDepth:null,pointCount:0,selectedAncestorId:null,scopeId:null,requiredPointCount:null});
    }
    const preflight=raw.lastPreflight&&typeof raw.lastPreflight==="object"?raw.lastPreflight:null;
    if(!raw.scopedState||!raw.projected){
      const overCap=preflight?.admitted===false;
      return Object.freeze({
        available:false,
        status:overCap?"over_cap_refused":"not_rendered",
        renderedDepth:null,
        pointCount:0,
        selectedAncestorId:raw.selectedAncestorId??null,
        scopeId:null,
        requiredPointCount:preflight?.requiredPointCount??null
      });
    }
    const scoped=raw.scopedState,projected=raw.projected;
    if(scoped.kind!=="ancestor_scoped_pullback_runtime_state"||
       scoped.scopeCompleteness!=="complete_over_selected_ancestor_scope"||
       scoped.globalCompletenessClaim!==false||
       scoped.truthfulness?.sheetsMaterialized!==false||
       scoped.truthfulness?.coveringStructureClaimed!==false||
       scoped.truthfulness?.geometricZoomApplied!==false){
      throw new HybridNavigationIIError("Thread 30 scoped runtime state exceeds its canonical boundary.");
    }
    const renderedDepth=assertDepth(raw.requestedScopedDepth,"scoped rendered depth");
    if(projected.depth!==renderedDepth||projected.pointCount!==projected.marks.length||projected.sourceManifoldCompletenessClaim!==false){
      throw new HybridNavigationIIError("Thread 30 projected scoped state is inconsistent.");
    }
    if(typeof raw.selectedAncestorId!=="string"||raw.selectedAncestorId.length===0||
       !Array.isArray(scoped.selectedAncestorIds)||scoped.selectedAncestorIds.length!==1||
       scoped.selectedAncestorIds[0]!==raw.selectedAncestorId){
      throw new HybridNavigationIIError("Thread 30 selected ancestor provenance is inconsistent.");
    }
    return Object.freeze({
      available:true,
      status:"rendered",
      renderedDepth,
      pointCount:projected.pointCount,
      selectedAncestorId:raw.selectedAncestorId,
      scopeId:scoped.scopeId,
      requiredPointCount:scoped.requiredPointCount,
      sourceObject:projected.sourceObject,
      projectedOverlapPolicy:projected.overlapPolicy,
      scopeCompleteness:scoped.scopeCompleteness,
      globalCompletenessClaim:false
    });
  }

  function stageCorrespondence(leftLabel,leftDepth,rightLabel,rightDepth){
    const B=baseSemantics();
    const supported=leftDepth!==null&&rightDepth!==null&&leftDepth===rightDepth;
    return Object.freeze({
      class:supported?B.CLASS_A:B.CLASS_D,
      supported,
      kind:supported?"tower_stage_index":"independent_stage_depths",
      depth:supported?leftDepth:null,
      leftReference:leftLabel+(leftDepth===null?" unavailable":" X_"+String(leftDepth)),
      rightReference:rightLabel+(rightDepth===null?" unavailable":" X_"+String(rightDepth)),
      sourceObjectIdentityClaim:false,
      message:supported
        ? "Correspondence is limited to shared tower-stage index X_"+String(leftDepth)+"; no point, branch, ancestor, component, or sheet identity is created."
        : leftLabel+" and "+rightLabel+" currently retain independent stage depths."
    });
  }

  function createHybridNavigationIIState(config,thread26Snapshot,scopedSnapshot,options={}){
    const validated=validateConfig(config);
    assertObject(thread26Snapshot,"thread26Snapshot");
    assertObject(scopedSnapshot,"scopedSnapshot");
    const representationMode=assertMode(options.representationMode??validated.defaultRepresentationMode);
    if(representationMode==="scoped-geometric"&&!scopedSnapshot.available){
      throw new HybridNavigationIIError("Scoped geometric context is unavailable until Thread 30 explicitly renders an admitted scope.");
    }
    const returnMode=options.returnMode==="global-geometric"?"global-geometric":"structural";
    const lastAction=typeof options.lastAction==="string"&&options.lastAction.length>0?options.lastAction:"initialize";
    const B=baseSemantics();
    return Object.freeze({
      kind:"hybrid_navigation_ii_global_scoped_geometry_bridge_state",
      navigationId:NAVIGATION_ID,
      representationMode,
      returnMode,
      structural:Object.freeze({
        selectedDepth:thread26Snapshot.structuralSelectedDepth,
        requestedDepth:thread26Snapshot.structuralRequestedDepth,
        materializedDepth:thread26Snapshot.structuralMaterializedDepth
      }),
      globalGeometric:Object.freeze({
        renderedDepth:thread26Snapshot.globalGeometricDepth,
        availableDepths:thread26Snapshot.availableGlobalDepths,
        sourceObject:thread26Snapshot.globalSourceObject,
        selectedPointId:thread26Snapshot.selectedGeometricPointId
      }),
      scopedGeometric:scopedSnapshot,
      correspondences:Object.freeze({
        structuralGlobal:stageCorrespondence("structural",thread26Snapshot.structuralSelectedDepth,"global finite geometry",thread26Snapshot.globalGeometricDepth),
        structuralScoped:stageCorrespondence("structural",thread26Snapshot.structuralSelectedDepth,"ancestor-scoped geometry",scopedSnapshot.available?scopedSnapshot.renderedDepth:null),
        globalScoped:stageCorrespondence("global finite geometry",thread26Snapshot.globalGeometricDepth,"ancestor-scoped geometry",scopedSnapshot.available?scopedSnapshot.renderedDepth:null),
        objectIdentity:Object.freeze({
          class:B.CLASS_D,
          supported:false,
          structuralNodeEqualsGeometricPoint:false,
          structuralBranchEqualsRootTuple:false,
          selectedAncestorEqualsConnectedComponent:false,
          rootTupleEqualsSheet:false,
          projectedLocationDefinesSourceIdentity:false
        }),
        presentationNavigation:Object.freeze({
          class:B.CLASS_C,
          explicitContextSwitchOnly:true,
          automaticStructuralGlobalDepthSynchronization:false,
          automaticStructuralScopedDepthSynchronization:false,
          automaticGlobalScopedDepthSynchronization:false
        })
      }),
      navigationProvenance:Object.freeze({
        lastAction,
        modeSwitchTriggersGlobalGeometricGeneration:false,
        modeSwitchTriggersScopedGeometricGeneration:false,
        scopedGenerationAuthority:"thread30_render_selected_scope_button",
        geometricZoomApplied:false
      }),
      truthFlags:Object.freeze({
        completeGlobalHypersurfaceRendered:false,
        sheetsMaterialized:false,
        coveringStructureClaimed:false,
        analyticBranchClaimed:false,
        connectedComponentClaimed:false,
        geometricZoomApplied:false
      })
    });
  }

  const api=Object.freeze({
    CONTRACT_VERSION,DESCRIPTOR_VERSION,NAVIGATION_ID,MODES,
    HybridNavigationIIError,validateConfig,createThread26Snapshot,createScopedSnapshot,
    stageCorrespondence,createHybridNavigationIIState
  });
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  globalObject.HybridNavigationIISemantics=api;
})(typeof globalThis!=="undefined"?globalThis:this);

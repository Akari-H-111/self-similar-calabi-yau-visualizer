"use strict";

const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");

const HybridNavigationSemantics=require("./hybrid-navigation-semantics.js");
const HybridScopedBridgeSemantics=require("./hybrid-scoped-bridge-semantics.js");
const config26=require("./data/hybrid-navigation.v1.json");
const config31=require("./data/hybrid-scoped-bridge.v1.json");
const thread30=require("./docs/ancestor_scoped_pullback_geometric_visualization_matrix_v0_01.json");
const matrix=require("./docs/hybrid_global_scoped_navigation_matrix_v0_01.json");

const root=__dirname;
function read(relativePath){return fs.readFileSync(path.join(root,relativePath),"utf8");}
function gitBlobSha(relativePath){
  const body=Buffer.from(read(relativePath),"utf8");
  const header=Buffer.from("blob "+String(body.length)+"\0","utf8");
  return crypto.createHash("sha1").update(header).update(body).digest("hex");
}

assert.equal(matrix.thread,31);
assert.equal(matrix.status,"canonical_sealed");
assert.equal(matrix.canonicalParent.commit,"1a5826de73d775ad818305d2b1f57c4c58d053de");
assert.equal(matrix.canonicalParent.tree,"e6545c6d1f2b72cdb0409b1549db02bb03ed3f18");
assert.equal(thread30.status,"canonical_sealed");
assert.equal(thread30.thread31AuthorizedOnlyAfterCanonicalSeal,true);

const validated31=HybridScopedBridgeSemantics.validateConfig(config31);
assert.deepEqual(validated31.contextModes,["structural","global-geometric","scoped-geometric"]);
assert.equal(validated31.defaultContextMode,"structural");
for(const value of Object.values(validated31.policies)) assert.equal(value,false);

const validated26=HybridNavigationSemantics.validateConfig(config26);
const structural0=HybridNavigationSemantics.createStructuralSnapshot({
  requestedDepth:0,materializedDepth:0,selectedDepth:0,focusedDepth:0,visibleDepth:0
});
const geometric1=HybridNavigationSemantics.createGeometricSnapshot({
  renderedDepth:1,
  availableDepths:[0,1],
  sourceObject:"X_1",
  pointCount:8192,
  viewId:"geometric_pullback_view_v1",
  projectionMapping:"(Re(z1), Im(z1))",
  geometryRendered:true,
  sheetsMaterialized:false,
  coveringStructureClaimed:false,
  geometricZoomApplied:false
});
const thread26State0=HybridNavigationSemantics.createHybridNavigationState(
  validated26,structural0,geometric1,{representationMode:"structural",lastAction:"initialize"}
);
const thread26Snapshot0=HybridScopedBridgeSemantics.createThread26Snapshot(thread26State0);
assert.equal(thread26Snapshot0.structuralRequestedDepth,0);
assert.equal(thread26Snapshot0.globalGeometricDepth,1);
assert.equal(thread26Snapshot0.automaticDepthSynchronization,false);

const scopedUnmaterialized=HybridScopedBridgeSemantics.createScopedSnapshot({
  controlAncestorId:"x0:000001",
  requestedScopedDepth:3,
  materialized:false,
  materializedScopedDepth:null,
  materializedAncestorId:null,
  pointCount:0,
  scopeId:null,
  scopeComplete:false,
  lastRequestRejected:false,
  requiredPointCount:null,
  globalCompletenessClaim:false
});
const initial=HybridScopedBridgeSemantics.createBridgeState(
  validated31,thread26Snapshot0,scopedUnmaterialized,{contextMode:"structural",lastAction:"initialize"}
);
assert.equal(initial.contextMode,"structural");
assert.deepEqual(initial.independentDepths,{
  structuralRequestedDepth:0,
  structuralMaterializedDepth:0,
  structuralSelectedDepth:0,
  globalGeometricDepth:1,
  scopedRequestedDepth:3,
  scopedMaterializedDepth:null
});
assert.equal(initial.navigationProvenance.contextSwitchTriggersScopedGeneration,false);
assert.equal(initial.navigationProvenance.scopedGenerationTriggered,false);
assert.equal(initial.correspondence.canonicalStageIndex.class,HybridScopedBridgeSemantics.CLASS_A);
assert.equal(initial.correspondence.canonicalStageIndex.supported,true);
assert.equal(initial.correspondence.contextNavigation.class,HybridScopedBridgeSemantics.CLASS_C);
assert.equal(initial.correspondence.forbiddenIdentity.class,HybridScopedBridgeSemantics.CLASS_D);

const scopedDepth2=HybridScopedBridgeSemantics.createScopedSnapshot({
  controlAncestorId:"x0:000001",
  requestedScopedDepth:2,
  materialized:true,
  materializedScopedDepth:2,
  materializedAncestorId:"x0:000001",
  pointCount:256,
  scopeId:"ancestor-scope-v1:x0:000001",
  scopeComplete:true,
  lastRequestRejected:false,
  requiredPointCount:"256",
  globalCompletenessClaim:false
});
const scopedContext=HybridScopedBridgeSemantics.createBridgeState(
  validated31,thread26Snapshot0,scopedDepth2,{contextMode:"scoped-geometric",lastAction:"explicit_context_switch_scoped-geometric"}
);
assert.equal(scopedContext.independentDepths.globalGeometricDepth,1);
assert.equal(scopedContext.independentDepths.scopedMaterializedDepth,2);
assert.equal(scopedContext.correspondence.scopedAncestryBinding.class,HybridScopedBridgeSemantics.CLASS_B);
assert.equal(scopedContext.correspondence.scopedAncestryBinding.selectedAncestorEqualsConnectedComponent,false);
assert.equal(scopedContext.correspondence.scopedAncestryBinding.rootTupleEqualsSheet,false);

const structural2=HybridNavigationSemantics.createStructuralSnapshot({
  requestedDepth:2,materializedDepth:2,selectedDepth:2,focusedDepth:2,visibleDepth:2
});
const thread26State2=HybridNavigationSemantics.createHybridNavigationState(
  validated26,structural2,geometric1,{representationMode:"geometric",lastAction:"representation_mode_switch"}
);
const independentStructural=HybridScopedBridgeSemantics.createBridgeState(
  validated31,
  HybridScopedBridgeSemantics.createThread26Snapshot(thread26State2),
  scopedDepth2,
  {contextMode:"scoped-geometric",lastAction:"structural_changed_independently"}
);
assert.equal(independentStructural.independentDepths.structuralRequestedDepth,2);
assert.equal(independentStructural.independentDepths.globalGeometricDepth,1);
assert.equal(independentStructural.independentDepths.scopedMaterializedDepth,2);
assert.equal(independentStructural.thread26.stageCorrespondenceClass,HybridScopedBridgeSemantics.CLASS_D);
assert.equal(independentStructural.correspondence.canonicalStageIndex.class,HybridScopedBridgeSemantics.CLASS_D);
assert.equal(independentStructural.correspondence.canonicalStageIndex.supported,false);

const geometric0=HybridNavigationSemantics.createGeometricSnapshot({
  renderedDepth:0,
  availableDepths:[0,1],
  sourceObject:"X_0",
  pointCount:512,
  viewId:"geometric_pullback_view_v1",
  projectionMapping:"(Re(z1), Im(z1))",
  geometryRendered:true,
  sheetsMaterialized:false,
  coveringStructureClaimed:false,
  geometricZoomApplied:false
});
const thread26StateGlobal0=HybridNavigationSemantics.createHybridNavigationState(
  validated26,structural2,geometric0,{representationMode:"geometric",lastAction:"geometric_depth_changed_independently"}
);
const independentGlobal=HybridScopedBridgeSemantics.createBridgeState(
  validated31,
  HybridScopedBridgeSemantics.createThread26Snapshot(thread26StateGlobal0),
  scopedDepth2,
  {contextMode:"global-geometric",lastAction:"global_changed_independently"}
);
assert.equal(independentGlobal.independentDepths.structuralRequestedDepth,2);
assert.equal(independentGlobal.independentDepths.globalGeometricDepth,0);
assert.equal(independentGlobal.independentDepths.scopedMaterializedDepth,2);
assert.equal(independentGlobal.thread26.stageCorrespondenceClass,HybridScopedBridgeSemantics.CLASS_D);
assert.equal(independentGlobal.correspondence.canonicalStageIndex.class,HybridScopedBridgeSemantics.CLASS_D);
assert.equal(independentGlobal.correspondence.canonicalStageIndex.supported,false);

const controlsChanged=HybridScopedBridgeSemantics.createScopedSnapshot({
  controlAncestorId:"x0:000002",
  requestedScopedDepth:3,
  materialized:true,
  materializedScopedDepth:2,
  materializedAncestorId:"x0:000001",
  pointCount:256,
  scopeId:"ancestor-scope-v1:x0:000001",
  scopeComplete:true,
  lastRequestRejected:false,
  requiredPointCount:"256",
  globalCompletenessClaim:false
});
assert.equal(controlsChanged.requestedScopedDepth,3);
assert.equal(controlsChanged.materializedScopedDepth,2);
assert.equal(controlsChanged.controlAncestorId,"x0:000002");
assert.equal(controlsChanged.materializedAncestorId,"x0:000001");

assert.throws(()=>HybridScopedBridgeSemantics.createScopedSnapshot({
  controlAncestorId:"x0:000001",requestedScopedDepth:2,materialized:false,materializedScopedDepth:2,
  materializedAncestorId:"x0:000001",pointCount:256,scopeId:null,scopeComplete:false,
  lastRequestRejected:false,requiredPointCount:null,globalCompletenessClaim:false
}));
assert.throws(()=>HybridScopedBridgeSemantics.createBridgeState(
  validated31,{...thread26Snapshot0,automaticDepthSynchronization:true},scopedUnmaterialized
));

const runtimeSource=read("hybrid-scoped-bridge-runtime.js");
for(const forbidden of [
  "materializeScopedScene(",
  "preflightScopedRequest(",
  "generateLevels(",
  "generateNextLevel(",
  "enumerateCompleteFiber(",
  "#ancestor-scoped-pullback-render",
  "Thread26HybridNavigationState =",
  "Thread30AncestorScopedVisualizationState =",
  "Thread25GeometricPullbackState ="
]){
  assert.equal(runtimeSource.includes(forbidden),false,"Thread 31 runtime must not contain "+forbidden);
}
assert.ok(runtimeSource.includes("thread26StructuralButton.click()"));
assert.ok(runtimeSource.includes("thread26GlobalButton.click()"));
assert.ok(runtimeSource.includes('scopedPanel.scrollIntoView'));
assert.ok(runtimeSource.includes('globalObject.addEventListener("thread26:hybrid-state"'));

const index=read("index.html");
for(const required of [
  "hybrid-scoped-bridge.css",
  "hybrid-scoped-bridge-semantics.js",
  "hybrid-scoped-bridge-runtime.js",
  'id="hybrid-scoped-bridge"',
  'data-thread31-context="structural"',
  'data-thread31-context="global-geometric"',
  'data-thread31-context="scoped-geometric"',
  'data-thread31-panel="structural"',
  'data-thread31-panel="global-geometric"',
  'data-thread31-panel="scoped-geometric"'
]){
  assert.ok(index.includes(required),"index.html missing Thread 31 wiring: "+required);
}
const scopedSectionStart=index.indexOf('<section aria-labelledby="ancestor-scoped-pullback-label"');
const scopedSectionEnd=index.indexOf("</section>",scopedSectionStart);
const scopedSection=index.slice(scopedSectionStart,scopedSectionEnd);
assert.ok(scopedSection.includes('data-thread31-panel="scoped-geometric"'));
assert.ok(!scopedSection.includes("data-hybrid-panel"),"Thread 30 scoped panel must remain outside Thread 26 data-hybrid-panel authority.");

assert.equal(matrix.depthIndependence.automaticDepthSynchronization,false);
assert.equal(matrix.correspondence.stageClassDelegatesToThread26,true);
assert.equal(matrix.correspondence.supportedCanonicalStageIndexClass,HybridScopedBridgeSemantics.CLASS_A);
assert.equal(matrix.correspondence.unsupportedCanonicalStageIndexClass,HybridScopedBridgeSemantics.CLASS_D);
assert.equal(matrix.generationBoundary.contextSwitchTriggersScopedGeneration,false);
assert.equal(matrix.generationBoundary.thread31CallsThread29Generation,false);
assert.equal(matrix.generationBoundary.thread31CallsThread25Generation,false);
assert.equal(matrix.truthFlags.sheetsMaterialized,false);
assert.equal(matrix.truthFlags.coveringStructureClaimed,false);
assert.equal(matrix.truthFlags.geometricZoomApplied,false);
assert.equal(matrix.truthFlags.selectedAncestorDefinesConnectedComponent,false);

for(const [relativePath,expected] of Object.entries(matrix.protectedBlobs)){
  assert.equal(gitBlobSha(relativePath),expected,"protected blob drift: "+relativePath);
}

console.log("Thread 31 hybrid global/scoped bridge verifier: PASS");
console.log("contexts: structural / global-geometric / scoped-geometric");
console.log("Thread 26 and Thread 30 authorities remain byte-identical");
console.log("structural, global-geometric, and scoped-geometric depths remain independent");
console.log("context switching does not trigger scoped generation");

"use strict";

const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");

const HybridNavigationSemantics=require("./hybrid-navigation-semantics.js");
const HybridScopedBridgeSemantics=require("./hybrid-scoped-bridge-semantics.js");
const config26=require("./data/hybrid-navigation.v1.json");
const config31=require("./data/hybrid-scoped-bridge.v1.json");
const repair=require("./docs/thread31r_stage_correspondence_repair_matrix_v0_01.json");
const thread31=require("./docs/hybrid_global_scoped_navigation_matrix_v0_01.json");

const root=__dirname;
function read(relativePath){return fs.readFileSync(path.join(root,relativePath),"utf8");}
function gitBlobSha(relativePath){
  const body=Buffer.from(read(relativePath),"utf8");
  const header=Buffer.from("blob "+String(body.length)+"\0","utf8");
  return crypto.createHash("sha1").update(header).update(body).digest("hex");
}

assert.equal(repair.thread,"31R");
assert.equal(repair.status,"canonical_sealed");
assert.equal(repair.canonicalParent.commit,"ce1317c3cc32fc7d8a3b9e4795949bea6680df96");
assert.equal(repair.abandonedSeal.pr,46);
assert.equal(repair.abandonedSeal.merged,false);
assert.equal(repair.repair.stageClassPolicy,"inherit_Thread26_selectedStructuralStage_class");
assert.equal(thread31.status,"canonical_sealed");
assert.equal(thread31.correspondence.stageClassDelegatesToThread26,true);

const c26=HybridNavigationSemantics.validateConfig(config26);
const c31=HybridScopedBridgeSemantics.validateConfig(config31);
const scoped=HybridScopedBridgeSemantics.createScopedSnapshot({
  controlAncestorId:"x0:repair-fixture",
  requestedScopedDepth:2,
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

function thread26State(selectedDepth,renderedDepth){
  const structural=HybridNavigationSemantics.createStructuralSnapshot({
    requestedDepth:selectedDepth,
    materializedDepth:selectedDepth,
    selectedDepth,
    focusedDepth:selectedDepth,
    visibleDepth:selectedDepth
  });
  const geometric=HybridNavigationSemantics.createGeometricSnapshot({
    renderedDepth,
    availableDepths:[0,1],
    sourceObject:renderedDepth===0?"X_0":"X_1",
    pointCount:renderedDepth===0?512:8192,
    viewId:"geometric_pullback_view_v1",
    projectionMapping:"(Re(z1), Im(z1))",
    geometryRendered:true,
    sheetsMaterialized:false,
    coveringStructureClaimed:false,
    geometricZoomApplied:false
  });
  return HybridNavigationSemantics.createHybridNavigationState(
    c26,structural,geometric,{representationMode:"geometric",lastAction:"repair_fixture"}
  );
}

const supported26=HybridScopedBridgeSemantics.createThread26Snapshot(thread26State(0,1));
assert.equal(supported26.stageCorrespondenceClass,HybridScopedBridgeSemantics.CLASS_A);
const supported31=HybridScopedBridgeSemantics.createBridgeState(
  c31,supported26,scoped,{contextMode:"global-geometric",lastAction:"repair_supported"}
);
assert.equal(supported31.correspondence.canonicalStageIndex.class,HybridScopedBridgeSemantics.CLASS_A);
assert.equal(supported31.correspondence.canonicalStageIndex.supported,true);

const unsupported26=HybridScopedBridgeSemantics.createThread26Snapshot(thread26State(2,1));
assert.equal(unsupported26.stageCorrespondenceClass,HybridScopedBridgeSemantics.CLASS_D);
const unsupported31=HybridScopedBridgeSemantics.createBridgeState(
  c31,unsupported26,scoped,{contextMode:"global-geometric",lastAction:"repair_counterexample"}
);
assert.equal(unsupported31.correspondence.canonicalStageIndex.class,HybridScopedBridgeSemantics.CLASS_D);
assert.equal(unsupported31.correspondence.canonicalStageIndex.supported,false);
assert.equal(unsupported31.independentDepths.structuralSelectedDepth,2);
assert.equal(unsupported31.independentDepths.globalGeometricDepth,1);

const unsupportedAtGlobal0=HybridScopedBridgeSemantics.createBridgeState(
  c31,
  HybridScopedBridgeSemantics.createThread26Snapshot(thread26State(2,0)),
  scoped,
  {contextMode:"global-geometric",lastAction:"repair_counterexample_global0"}
);
assert.equal(unsupportedAtGlobal0.correspondence.canonicalStageIndex.class,HybridScopedBridgeSemantics.CLASS_D);
assert.equal(unsupportedAtGlobal0.correspondence.canonicalStageIndex.supported,false);

const semanticsSource=read("hybrid-scoped-bridge-semantics.js");
assert.ok(semanticsSource.includes("class: thread26Snapshot.stageCorrespondenceClass"));
assert.ok(semanticsSource.includes("supported: thread26Snapshot.stageCorrespondenceClass === CLASS_A"));
assert.ok(!semanticsSource.includes("canonicalStageIndex: Object.freeze({\n          class: CLASS_A,"));

const runtimeSource=read("hybrid-scoped-bridge-runtime.js");
assert.ok(runtimeSource.includes("Selected structural stage has Class A"));
assert.ok(runtimeSource.includes("Selected structural stage has Class D"));
assert.ok(runtimeSource.includes("stageCorrespondence.supported"));

for(const [relativePath,expected] of Object.entries(repair.protectedBlobs)){
  assert.equal(gitBlobSha(relativePath),expected,"protected blob drift: "+relativePath);
}

for(const [relativePath,expected] of Object.entries(repair.candidateBlobs)){
  if(relativePath==="docs/hybrid_global_scoped_navigation_matrix_v0_01.json"){
    const sealed=read(relativePath);
    assert.equal((sealed.match(/"status": "canonical_sealed"/g)||[]).length,1);
    const candidate=sealed.replace('"status": "canonical_sealed"','"status": "implementation_candidate"');
    const body=Buffer.from(candidate,"utf8");
    const header=Buffer.from("blob "+String(body.length)+"\0","utf8");
    assert.equal(crypto.createHash("sha1").update(header).update(body).digest("hex"),expected,
      "Thread 31 seal changed more than status in the repair candidate matrix");
  }else{
    assert.equal(gitBlobSha(relativePath),expected,"repair candidate blob mismatch: "+relativePath);
  }
}

assert.equal(repair.preserved.automaticDepthSynchronization,false);
assert.equal(repair.preserved.contextSwitchTriggersScopedGeneration,false);
assert.equal(repair.preserved.sheetsMaterialized,false);
assert.equal(repair.preserved.coveringStructureClaimed,false);
assert.equal(repair.preserved.geometricZoomApplied,false);
assert.equal(repair.presentationAdapter.admittedAncestorSelectorMayChange,true);
assert.equal(repair.presentationAdapter.generationPathMayNotChange,true);

console.log("Thread 31R stage correspondence classification repair verifier: PASS");
console.log("selected structural stage 0 with global [0,1] -> Class A");
console.log("selected structural stage 2 with global [0,1] -> Class D");
console.log("Thread 26 / Thread 30 generation, pullback, and projection authorities remain protected");

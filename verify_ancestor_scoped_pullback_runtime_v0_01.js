"use strict";

const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");

const BaseGeometricSampler=require("./base-geometric-sampler.js");
const GeometricPullbackEngine=require("./geometric-pullback-engine.js");
const GeometricPullbackFibers=require("./geometric-pullback-fibers.js");
const AncestorScopedPullbackRuntime=require("./ancestor-scoped-pullback-runtime.js");

const scene=require("./data/system.v2.json");
const baseConfig=require("./data/base-geometric-render-config.v1.json");
const pullbackConfig=require("./data/geometric-pullback-config.v1.json");
const thread28=require("./docs/ancestor_scoped_pullback_contract_matrix_v0_01.json");
const matrix=require("./docs/ancestor_scoped_pullback_runtime_matrix_v0_01.json");

const root=__dirname;
function read(relativePath){return fs.readFileSync(path.join(root,relativePath),"utf8");}
function gitBlobSha(relativePath){
  const body=Buffer.from(read(relativePath),"utf8");
  const header=Buffer.from("blob "+String(body.length)+"\0","utf8");
  return crypto.createHash("sha1").update(header).update(body).digest("hex");
}

assert.equal(matrix.thread,29);
assert.equal(matrix.status,"canonical_sealed");
assert.equal(matrix.canonicalParent.commit,"b186705ab0bd6090c9c6ab043b69cf91b692a34b");
assert.equal(matrix.canonicalParent.tree,"1b40f39b162eed7d0a01d5a23bd2300e941f7fa8");
assert.equal(thread28.status,"canonical_sealed");
assert.equal(thread28.decision,"ADMITTED");
assert.equal(thread28.thread29AuthorizedOnlyAfterCanonicalSeal,true);

assert.equal(AncestorScopedPullbackRuntime.RUNTIME_ID,"ancestor_scoped_pullback_runtime_v1");
assert.equal(AncestorScopedPullbackRuntime.RUNTIME_VERSION,"v0.01");

const validatedConfig=GeometricPullbackEngine.validateConfig(pullbackConfig);
const D=GeometricPullbackEngine.validateSceneAndD(scene).D;
const cap=validatedConfig.materialization.maxGeneratedPoints;
assert.equal(D,2);
assert.equal(cap,10000);

assert.equal(AncestorScopedPullbackRuntime.exactScopedPointCount(1,D,0),1n);
assert.equal(AncestorScopedPullbackRuntime.exactScopedPointCount(1,D,1),16n);
assert.equal(AncestorScopedPullbackRuntime.exactScopedPointCount(1,D,2),256n);
assert.equal(AncestorScopedPullbackRuntime.exactScopedPointCount(1,D,3),4096n);
assert.equal(AncestorScopedPullbackRuntime.exactScopedPointCount(1,D,4),65536n);
assert.equal(AncestorScopedPullbackRuntime.exactScopedPointCount(2,D,3),8192n);
assert.equal(AncestorScopedPullbackRuntime.exactScopedPointCount(3,D,3),12288n);

const preOne3=AncestorScopedPullbackRuntime.preflightScopedRequest(1,D,3,cap);
const preOne4=AncestorScopedPullbackRuntime.preflightScopedRequest(1,D,4,cap);
const preTwo3=AncestorScopedPullbackRuntime.preflightScopedRequest(2,D,3,cap);
const preThree3=AncestorScopedPullbackRuntime.preflightScopedRequest(3,D,3,cap);
assert.deepEqual(preOne3,{selectedAncestorCount:1,D:2,requestedScopedDepth:3,requiredPointCount:"4096",maxGeneratedPoints:10000,admitted:true});
assert.equal(preOne4.requiredPointCount,"65536");
assert.equal(preOne4.admitted,false);
assert.equal(preTwo3.requiredPointCount,"8192");
assert.equal(preTwo3.admitted,true);
assert.equal(preThree3.requiredPointCount,"12288");
assert.equal(preThree3.admitted,false);

const canonical=BaseGeometricSampler.generateSamples(scene,baseConfig);
assert.equal(canonical.sampleCount,512);
assert.equal(canonical.completenessClaim,false);

const id0=canonical.samples[0].sampleId;
const id1=canonical.samples[1].sampleId;
const id2=canonical.samples[2].sampleId;

const scopeOne=AncestorScopedPullbackRuntime.selectAncestorScopeMetadata(canonical,[id0],pullbackConfig);
assert.equal(scopeOne.selectedAncestorCount,1);
assert.deepEqual(scopeOne.selectedAncestorIds,[id0]);
assert.deepEqual(scopeOne.canonicalIndices,[0]);
assert.equal(scopeOne.scopeId,"ancestor-scope-v1:"+id0);

const scopeTwo=AncestorScopedPullbackRuntime.selectAncestorScopeMetadata(canonical,[id0,id1],pullbackConfig);
assert.equal(scopeTwo.selectedAncestorCount,2);
assert.deepEqual(scopeTwo.selectedAncestorIds,[id0,id1]);
assert.deepEqual(scopeTwo.canonicalIndices,[0,1]);

assert.throws(()=>AncestorScopedPullbackRuntime.selectAncestorScopeMetadata(canonical,[],pullbackConfig));
assert.throws(()=>AncestorScopedPullbackRuntime.selectAncestorScopeMetadata(canonical,[id0,id0],pullbackConfig));
assert.throws(()=>AncestorScopedPullbackRuntime.selectAncestorScopeMetadata(canonical,[id1,id0],pullbackConfig));
assert.throws(()=>AncestorScopedPullbackRuntime.selectAncestorScopeMetadata(canonical,["not-a-canonical-sample"],pullbackConfig));

const one=AncestorScopedPullbackRuntime.materializeScopedScene(
  scene,canonical,[id0],3,baseConfig,pullbackConfig
);
assert.equal(one.kind,"ancestor_scoped_pullback_runtime_state");
assert.equal(one.runtimeId,AncestorScopedPullbackRuntime.RUNTIME_ID);
assert.equal(one.scopeId,"ancestor-scope-v1:"+id0);
assert.deepEqual(one.selectedAncestorIds,[id0]);
assert.equal(one.selectedAncestorCount,1);
assert.equal(one.requestedScopedDepth,3);
assert.deepEqual(one.materializedScopedDepths,[0,1,2,3]);
assert.equal(one.requiredPointCount,"4096");
assert.equal(one.maxGeneratedPoints,10000);
assert.equal(one.scopeCompleteness,"complete_over_selected_ancestor_scope");
assert.equal(one.globalCompletenessClaim,false);
assert.equal(one.globalGeometricRenderedDepthMutated,false);
assert.equal(one.structuralRequestedDepthConsumed,false);
assert.equal(one.truthfulness.completeGlobalHypersurfaceRendered,false);
assert.equal(one.truthfulness.sheetsMaterialized,false);
assert.equal(one.truthfulness.coveringStructureClaimed,false);
assert.equal(one.truthfulness.geometricZoomApplied,false);
assert.deepEqual(one.sceneModel.levels.map((level)=>level.pointCount),[1,16,256,4096]);

for(let depth=1;depth<=3;depth+=1){
  const level=one.sceneModel.levels[depth];
  assert.equal(level.completeFiberOverEachMaterializedParent,true);
  assert.equal(level.sourceManifoldCompletenessClaim,false);
  assert.equal(level.points.length,level.pointCount);
  for(const point of level.points){
    assert.equal(point.ancestorSampleId,id0);
    assert.equal(point.depth,depth);
    assert.equal(typeof point.parentId,"string");
    assert.equal(point.rootMultiIndex.length,4);
    assert.equal(point.parentRelation.accepted,true);
    assert.equal(point.baseMembership.accepted,true);
    assert.ok(point.baseMembership.residualMagnitude<=point.baseMembership.threshold);
  }
}

const two=AncestorScopedPullbackRuntime.materializeScopedScene(
  scene,canonical,[id0,id1],3,baseConfig,pullbackConfig
);
assert.equal(two.selectedAncestorCount,2);
assert.equal(two.requiredPointCount,"8192");
assert.deepEqual(two.sceneModel.levels.map((level)=>level.pointCount),[2,32,512,8192]);
assert.equal(two.sceneModel.levels[3].completeFiberOverEachMaterializedParent,true);
assert.deepEqual(
  [...new Set(two.sceneModel.levels[3].points.map((point)=>point.ancestorSampleId))].sort(),
  [id0,id1].sort()
);

for(let depth=0;depth<=3;depth+=1){
  const fromOne=one.sceneModel.levels[depth].points;
  const fromTwo=two.sceneModel.levels[depth].points.filter((point)=>point.ancestorSampleId===id0);
  assert.deepEqual(fromTwo,fromOne,"Thread 25 point identities must be scope-stable for the same ancestor/root paths.");
}

assert.throws(
  ()=>AncestorScopedPullbackRuntime.materializeScopedScene(scene,canonical,[id0],4,baseConfig,pullbackConfig),
  (error)=>error instanceof AncestorScopedPullbackRuntime.AncestorScopedPullbackMaterializationLimitError &&
    error.message.includes("65536") && error.message.includes("10000")
);
assert.throws(
  ()=>AncestorScopedPullbackRuntime.materializeScopedScene(scene,canonical,[id0,id1,id2],3,baseConfig,pullbackConfig),
  (error)=>error instanceof AncestorScopedPullbackRuntime.AncestorScopedPullbackMaterializationLimitError &&
    error.message.includes("12288") && error.message.includes("10000")
);

let poisonedCoordinateReads=0;
const poisonSample={sampleId:"poison-x0"};
Object.defineProperty(poisonSample,"coordinates",{
  enumerable:true,
  get(){poisonedCoordinateReads+=1;throw new Error("coordinates were inspected before over-cap preflight rejection");}
});
Object.defineProperty(poisonSample,"membership",{
  enumerable:true,
  get(){throw new Error("membership was inspected before over-cap preflight rejection");}
});
const poisonModel={
  kind:"ordered_finite_validated_subset",
  samplerKind:canonical.samplerKind,
  samplerId:canonical.samplerId,
  configVersion:canonical.configVersion,
  sourceObject:"X_0",
  formulaId:canonical.formulaId,
  viewId:canonical.viewId,
  randomnessAllowed:false,
  parameterTripleBudget:1,
  sampleBudget:1,
  coordinatePoolSize:1,
  attemptedParameterTriples:1,
  sampleCount:1,
  samples:[poisonSample],
  rejectionSummary:{rejectedZero:0,rejectedResidual:0,doubleRootPairs:0},
  membershipTolerance:canonical.membershipTolerance,
  maxResidualMagnitude:0,
  empty:false,
  completenessClaim:false
};
assert.throws(
  ()=>AncestorScopedPullbackRuntime.materializeScopedScene(scene,poisonModel,["poison-x0"],4,baseConfig,pullbackConfig),
  (error)=>error instanceof AncestorScopedPullbackRuntime.AncestorScopedPullbackMaterializationLimitError &&
    error.message.includes("65536")
);
assert.equal(poisonedCoordinateReads,0,"over-cap scoped request must fail before coordinate inspection / Thread 25 generation");

const globalCanonical=GeometricPullbackEngine.generateLevels(scene,canonical,baseConfig,pullbackConfig,1);
assert.deepEqual(globalCanonical.levels.map((level)=>level.pointCount),[512,8192]);
assert.equal(globalCanonical.renderedGeometricDepth,1);
assert.equal(globalCanonical.structuralRequestedDepthConsumed,false);
assert.equal(globalCanonical.truthfulness.sheetsMaterialized,false);
assert.equal(globalCanonical.truthfulness.coveringStructureClaimed,false);
assert.equal(globalCanonical.truthfulness.geometricZoomApplied,false);

const runtimeSource=read("ancestor-scoped-pullback-runtime.js");
assert.ok(!runtimeSource.includes("Math.random"));
assert.ok(!runtimeSource.includes("crypto.random"));
assert.ok(!runtimeSource.includes("enumerateCompleteFiber("),"Thread 29 must orchestrate Thread 25 rather than implement a second root/fiber enumerator.");
assert.ok(runtimeSource.includes("E.generateLevels("));
assert.ok(runtimeSource.indexOf("preflightScopedRequest(")<runtimeSource.indexOf("E.generateLevels("));

assert.equal(matrix.truthFlags.completeGlobalHypersurfaceRendered,false);
assert.equal(matrix.truthFlags.sheetsMaterialized,false);
assert.equal(matrix.truthFlags.coveringStructureClaimed,false);
assert.equal(matrix.truthFlags.geometricZoomApplied,false);
assert.equal(matrix.stateSeparation.automaticDepthSynchronization,false);
assert.equal(matrix.runtime.globalThread25StateMutated,false);

for(const [relativePath,expected] of Object.entries(matrix.protectedBlobs)){
  assert.equal(gitBlobSha(relativePath),expected,"protected blob drift: "+relativePath);
}

console.log("Thread 29 ancestor-scoped pullback runtime verifier: PASS");
console.log("Thread 28 authority: canonical_sealed / ADMITTED");
console.log("one ancestor depth 3: 4096; two ancestors depth 3: 8192");
console.log("one ancestor depth 4 and three ancestors depth 3 rejected before Thread 25 generation");
console.log("global Thread 25 path remains 512 -> 8192; no sheets/covering/geometric zoom promoted");

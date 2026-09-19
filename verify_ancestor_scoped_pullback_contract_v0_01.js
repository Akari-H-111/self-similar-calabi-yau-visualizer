"use strict";

const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");

const BaseGeometricSampler=require("./base-geometric-sampler.js");
const GeometricPullbackFibers=require("./geometric-pullback-fibers.js");
const GeometricPullbackEngine=require("./geometric-pullback-engine.js");

const scene=require("./data/system.v2.json");
const baseConfig=require("./data/base-geometric-render-config.v1.json");
const pullbackConfig=require("./data/geometric-pullback-config.v1.json");
const matrix=require("./docs/ancestor_scoped_pullback_contract_matrix_v0_01.json");

const root=__dirname;
function read(relativePath){return fs.readFileSync(path.join(root,relativePath),"utf8");}
function gitBlobSha(relativePath){
  const source=read(relativePath);
  const body=Buffer.from(source,"utf8");
  const header=Buffer.from("blob "+String(body.length)+"\0","utf8");
  return crypto.createHash("sha1").update(header).update(body).digest("hex");
}
function scopeFromCanonicalSamples(sampleModel,indices){
  assert.ok(Array.isArray(indices)&&indices.length>0,"ancestor scope must be nonempty");
  for(let i=0;i<indices.length;i+=1){
    assert.ok(Number.isSafeInteger(indices[i])&&indices[i]>=0&&indices[i]<sampleModel.samples.length);
    if(i>0) assert.ok(indices[i]>indices[i-1],"ancestor indices must be unique and preserve canonical order");
  }
  const selected=indices.map((index)=>sampleModel.samples[index]);
  return Object.freeze({...sampleModel,sampleCount:selected.length,samples:Object.freeze(selected)});
}
function exactScopedCount(seedCount,D,depth){
  assert.ok(Number.isSafeInteger(seedCount)&&seedCount>0);
  assert.ok(Number.isSafeInteger(D)&&D>=2);
  assert.ok(Number.isSafeInteger(depth)&&depth>=0);
  const fiber=BigInt(D)**4n;
  return BigInt(seedCount)*(fiber**BigInt(depth));
}
function preflight(seedCount,D,depth,cap){
  const required=exactScopedCount(seedCount,D,depth);
  return Object.freeze({
    seedCount,
    D,
    depth,
    requiredPointCount:required,
    cap:BigInt(cap),
    admitted:required<=BigInt(cap)
  });
}

assert.equal(matrix.thread,28);
assert.equal(matrix.status,"canonical_sealed");
assert.equal(matrix.decision,"ADMITTED");
assert.equal(matrix.canonicalParent.commit,"b3054826148f6f0c02091bbb800cfc2b3fc1db13");
assert.equal(matrix.canonicalParent.tree,"0165dda521f990f1a35526646f364d621bea1609");
assert.equal(matrix.productionChangesAuthorizedByThread28,false);

const validatedConfig=GeometricPullbackEngine.validateConfig(pullbackConfig);
const D=GeometricPullbackEngine.validateSceneAndD(scene).D;
const cap=validatedConfig.materialization.maxGeneratedPoints;
const fiber=GeometricPullbackFibers.expectedFiberCardinality(D);
assert.equal(D,2);
assert.equal(fiber,16);
assert.equal(cap,10000);

const canonical=BaseGeometricSampler.generateSamples(scene,baseConfig);
assert.equal(canonical.sampleCount,512);
assert.equal(canonical.completenessClaim,false);

const one=scopeFromCanonicalSamples(canonical,[0]);
assert.equal(one.sampleCount,1);
GeometricPullbackEngine.validateBaseSampleModel(scene,one,baseConfig,pullbackConfig);

const expectedOne=[1n,16n,256n,4096n,65536n];
for(let depth=0;depth<expectedOne.length;depth+=1){
  assert.equal(exactScopedCount(1,D,depth),expectedOne[depth]);
}
assert.equal(preflight(1,D,3,cap).admitted,true);
assert.equal(preflight(1,D,4,cap).admitted,false);

const oneScene=GeometricPullbackEngine.generateLevels(scene,one,baseConfig,pullbackConfig,3);
assert.deepEqual(oneScene.levels.map((level)=>level.pointCount),[1,16,256,4096]);
assert.equal(oneScene.renderedGeometricDepth,3);
assert.equal(oneScene.sourceSeedCount,1);
assert.equal(oneScene.structuralRequestedDepthConsumed,false);
for(let depth=1;depth<=3;depth+=1){
  const level=oneScene.levels[depth];
  assert.equal(level.completeFiberOverEachMaterializedParent,true);
  assert.equal(level.sourceManifoldCompletenessClaim,false);
  assert.equal(level.pointCount,Number(expectedOne[depth]));
  assert.equal(level.expectedPointCount,level.pointCount);
  assert.equal(level.points.length,level.pointCount);
  assert.equal(new Set(level.points.map((point)=>point.pointId)).size,level.pointCount);
  assert.equal(new Set(level.points.map((point)=>GeometricPullbackFibers.coordinateKey(point.coordinates))).size,level.pointCount);
  for(const point of level.points){
    assert.equal(point.ancestorSampleId,canonical.samples[0].sampleId);
    assert.equal(point.depth,depth);
    assert.equal(point.sourceObject,"X_"+String(depth));
    assert.equal(point.parentRelation.accepted,true);
    assert.equal(point.baseMembership.accepted,true);
    assert.equal(point.rootMultiIndex.length,4);
  }
}

assert.throws(
  ()=>GeometricPullbackEngine.generateNextLevel(scene,oneScene.levels[3],baseConfig,pullbackConfig),
  (error)=>error instanceof GeometricPullbackEngine.GeometricPullbackMaterializationLimitError &&
    error.message.includes("65536") && error.message.includes("10000")
);

const poisonLevel={
  kind:"finite_geometric_pullback_level",
  depth:3,
  pointCount:4096,
  points:new Array(4096),
  sourceSeedCount:1
};
assert.throws(
  ()=>GeometricPullbackEngine.generateNextLevel(scene,poisonLevel,baseConfig,pullbackConfig),
  (error)=>error instanceof GeometricPullbackEngine.GeometricPullbackMaterializationLimitError &&
    error.message.includes("65536"),
  "cap rejection must occur before any parent coordinate is inspected"
);

assert.throws(()=>scopeFromCanonicalSamples(canonical,[]));
assert.throws(()=>scopeFromCanonicalSamples(canonical,[0,0]));
assert.throws(()=>scopeFromCanonicalSamples(canonical,[1,0]));
assert.throws(()=>scopeFromCanonicalSamples(canonical,[canonical.sampleCount]));

const two=scopeFromCanonicalSamples(canonical,[0,1]);
const twoPreflight=preflight(2,D,3,cap);
assert.equal(twoPreflight.requiredPointCount,8192n);
assert.equal(twoPreflight.admitted,true);
const twoScene=GeometricPullbackEngine.generateLevels(scene,two,baseConfig,pullbackConfig,3);
assert.deepEqual(twoScene.levels.map((level)=>level.pointCount),[2,32,512,8192]);
assert.equal(twoScene.levels[3].completeFiberOverEachMaterializedParent,true);
assert.deepEqual(
  [...new Set(twoScene.levels[3].points.map((point)=>point.ancestorSampleId))].sort(),
  [canonical.samples[0].sampleId,canonical.samples[1].sampleId].sort()
);

for(let depth=0;depth<=3;depth+=1){
  const fromOne=oneScene.levels[depth].points;
  const fromTwo=twoScene.levels[depth].points.filter((point)=>point.ancestorSampleId===canonical.samples[0].sampleId);
  assert.deepEqual(fromTwo,fromOne,"same ancestor/root path must keep the same Thread 25 model point identity across scopes");
}

const threePreflight=preflight(3,D,3,cap);
assert.equal(threePreflight.requiredPointCount,12288n);
assert.equal(threePreflight.admitted,false);

const capacity={
  depth0:Math.min(canonical.sampleCount,Number(BigInt(cap)/exactScopedCount(1,D,0))),
  depth1:Math.min(canonical.sampleCount,Number(BigInt(cap)/exactScopedCount(1,D,1))),
  depth2:Math.min(canonical.sampleCount,Number(BigInt(cap)/exactScopedCount(1,D,2))),
  depth3:Math.min(canonical.sampleCount,Number(BigInt(cap)/exactScopedCount(1,D,3))),
  depth4:Math.min(canonical.sampleCount,Number(BigInt(cap)/exactScopedCount(1,D,4)))
};
assert.deepEqual(capacity,{depth0:512,depth1:512,depth2:39,depth3:2,depth4:0});

assert.equal(pullbackConfig.truthFlags.sheetsMaterialized,false);
assert.equal(pullbackConfig.truthFlags.coveringStructureClaimed,false);
assert.equal(pullbackConfig.truthFlags.geometricZoomApplied,false);
assert.equal(matrix.truthFlags.completeGlobalHypersurfaceRendered,false);
assert.equal(matrix.scope.globalComplete,false);
assert.equal(matrix.scope.connectedComponentClaim,false);
assert.equal(matrix.identity.pointIdImpliesSheetIdentity,false);
assert.equal(matrix.identity.pointIdImpliesStructuralIdentity,false);
assert.equal(matrix.depthState.automaticDepthSynchronization,false);

for(const [relativePath,expected] of Object.entries(matrix.protectedBlobs)){
  assert.equal(gitBlobSha(relativePath),expected,"protected blob drift: "+relativePath);
}

console.log("Thread 28 ancestor-scoped pullback feasibility verifier: PASS");
console.log("decision: ADMITTED");
console.log("one ancestor: 1 -> 16 -> 256 -> 4096; depth 4 requires 65536 and is rejected");
console.log("two ancestors at depth 3: 8192 admitted; three ancestors: 12288 rejected");
console.log("production pullback engine/runtime unchanged; no sheets/covering/geometric zoom promoted");

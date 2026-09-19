"use strict";

const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");

const ConcreteRuntimeSchema=require("./concrete-runtime-schema.js");
const LaurentEvaluator=require("./laurent-evaluator.js");
const BaseGeometricSampler=require("./base-geometric-sampler.js");
const TorusPowerEvaluator=require("./torus-power-evaluator.js");
const GeometricPullbackFibers=require("./geometric-pullback-fibers.js");
const GeometricPullbackEngine=require("./geometric-pullback-engine.js");
const GeometricPullbackViewSemantics=require("./geometric-pullback-view-semantics.js");
const GeometricPullbackRenderer=require("./geometric-pullback-renderer.js");

const scene=require("./data/system.v2.json");
const baseView=require("./data/geometric-view.v1.json");
const baseConfig=require("./data/base-geometric-render-config.v1.json");
const pullbackView=require("./data/geometric-pullback-view.v1.json");
const pullbackConfig=require("./data/geometric-pullback-config.v1.json");

const root=__dirname;
function read(relativePath){return fs.readFileSync(path.join(root,relativePath),"utf8");}
function gitBlobSha(source){const body=Buffer.from(source,"utf8");return crypto.createHash("sha1").update("blob "+String(body.length)+"\0").update(body).digest("hex");}
function clone(value){return JSON.parse(JSON.stringify(value));}

const normalized=ConcreteRuntimeSchema.validateAndNormalizeV2(scene);
const D=normalized.mathematics.parameters.D;
assert.equal(D,2);
assert.equal(normalized.mathematics.pullbackMap.kind,"coordinate_power");
assert.equal(GeometricPullbackEngine.validateConfig(pullbackConfig).materialization.policy,"exact_hard_cap");
assert.equal(pullbackConfig.materialization.maxGeneratedPoints,10000);
assert.equal(pullbackConfig.materialization.canonicalRenderedDepth,1);
assert.equal(pullbackConfig.truthFlags.sheetsMaterialized,false);
assert.equal(pullbackConfig.truthFlags.coveringStructureClaimed,false);
assert.equal(pullbackConfig.truthFlags.geometricZoomApplied,false);

const viewBinding=GeometricPullbackViewSemantics.validateAgainstBaseView(pullbackView,baseView,scene,1);
assert.equal(viewBinding.sourceObject,"X_1");
assert.equal(pullbackView.projection.mapping,"(Re(z1), Im(z1))");
assert.equal(pullbackView.sampleSemantics.sheetIdentityClaim,false);
assert.equal(pullbackView.ambiguity.overlapImpliesSourceSelfIntersection,false);
assert.equal(pullbackView.ambiguity.overlapImpliesCoveringMultiplicity,false);

const sampleA=BaseGeometricSampler.generateSamples(scene,baseConfig);
const sampleB=BaseGeometricSampler.generateSamples(scene,baseConfig);
assert.deepEqual(sampleB,sampleA,"Thread 24 source samples must reproduce exactly.");
assert.equal(sampleA.sampleCount,sampleA.samples.length);
assert.equal(sampleA.completenessClaim,false);

const parentKeys=new Set(sampleA.samples.map((sample)=>GeometricPullbackFibers.coordinateKey(sample.coordinates)));
assert.equal(parentKeys.size,sampleA.sampleCount,"Canonical X_0 samples must be full-coordinate distinct.");
assert.ok(sampleA.samples.some((sample)=>sample.coordinates.some((z)=>z.im!==0)),"Ambient samples must not collapse to a hidden real locus.");

const powerFixture=[
  LaurentEvaluator.complex(1,1),LaurentEvaluator.complex(-2,0.5),
  LaurentEvaluator.complex(0.75,-1.25),LaurentEvaluator.complex(-0.5,-0.25)
];
const powered=TorusPowerEvaluator.coordinatePower(D,powerFixture);
for(let i=0;i<4;i+=1){
  const expected=LaurentEvaluator.mul(powerFixture[i],powerFixture[i]);
  assert.ok(LaurentEvaluator.abs(LaurentEvaluator.sub(powered[i],expected))<1e-14);
}

const firstParent=sampleA.samples[0];
const fiberOptions={
  rootEnumeration:pullbackConfig.rootEnumeration,
  powerResidualTolerance:pullbackConfig.powerResidualTolerance,
  rootDistinctnessTolerance:pullbackConfig.rootDistinctnessTolerance
};
const firstFiber=GeometricPullbackFibers.enumerateCompleteFiber(firstParent.coordinates,D,fiberOptions);
const derivedFiberCardinality=GeometricPullbackFibers.expectedFiberCardinality(D);
assert.equal(firstFiber.length,derivedFiberCardinality);
assert.equal(new Set(firstFiber.map((point)=>GeometricPullbackFibers.coordinateKey(point.coordinates))).size,derivedFiberCardinality);
for(const child of firstFiber){
  assert.equal(child.rootMultiIndex.length,4);
  assert.equal(child.relation.accepted,true);
  for(const coordinate of child.coordinates){
    assert.ok(Number.isFinite(coordinate.re)&&Number.isFinite(coordinate.im));
    assert.notEqual(Math.hypot(coordinate.re,coordinate.im),0);
  }
}

const sceneModelA=GeometricPullbackEngine.generateLevels(scene,sampleA,baseConfig,pullbackConfig,pullbackConfig.materialization.canonicalRenderedDepth);
const sceneModelB=GeometricPullbackEngine.generateLevels(scene,sampleA,baseConfig,pullbackConfig,pullbackConfig.materialization.canonicalRenderedDepth);
assert.deepEqual(sceneModelB,sceneModelA,"Repeated pullback generation must be deterministic.");
assert.equal(sceneModelA.renderedGeometricDepth,1);
assert.equal(sceneModelA.structuralRequestedDepthConsumed,false);
assert.equal(sceneModelA.levels.length,2);

const level0=sceneModelA.levels[0], level1=sceneModelA.levels[1];
const derivedCounts=GeometricPullbackEngine.expectedChildCount(level0.pointCount,D);
assert.equal(level1.fiberCardinality,derivedCounts.fiberCardinality);
assert.equal(level1.expectedPointCount,derivedCounts.expected);
assert.equal(level1.pointCount,derivedCounts.expected);
assert.equal(level1.points.length,level1.pointCount);
assert.equal(level1.completeFiberOverEachMaterializedParent,true);
assert.equal(level1.sourceManifoldCompletenessClaim,false);
assert.equal(new Set(level1.points.map((point)=>GeometricPullbackFibers.coordinateKey(point.coordinates))).size,level1.pointCount);

for(const point of level1.points){
  assert.equal(point.depth,1);
  assert.equal(point.sourceObject,"X_1");
  assert.equal(typeof point.parentId,"string");
  assert.equal(typeof point.ancestorSampleId,"string");
  assert.equal(point.rootMultiIndex.length,4);
  assert.equal(point.parentRelation.accepted,true);
  assert.equal(point.baseMembership.accepted,true);
  assert.ok(point.baseMembership.residualMagnitude<=point.baseMembership.threshold);
}

const maximumPowerResidual=level1.maxPowerResidualMagnitude;
assert.ok(Number.isFinite(maximumPowerResidual));
assert.ok(maximumPowerResidual<1e-10);
assert.ok(level1.maxBaseMembershipResidualMagnitude<1e-9);

const projected=GeometricPullbackRenderer.createProjectedLevel(scene,baseView,pullbackView,level1);
assert.equal(projected.sourceObject,"X_1");
assert.equal(projected.depth,1);
assert.equal(projected.marks.length,level1.pointCount);
assert.equal(projected.truthfulness.geometryRendered,true);
assert.equal(projected.truthfulness.pullbackGeometryRendered,true);
assert.equal(projected.truthfulness.sheetsMaterialized,false);
assert.equal(projected.truthfulness.coveringStructureClaimed,false);
assert.equal(projected.truthfulness.geometricZoomApplied,false);
assert.equal(projected.overlapPolicy,"projected_pullback_point_overlap_count_only");
for(let i=0;i<projected.marks.length;i+=1){
  assert.equal(projected.marks[i].sourcePointId,level1.points[i].pointId);
  assert.equal(projected.marks[i].parentId,level1.points[i].parentId);
  assert.equal(projected.marks[i].ancestorSampleId,level1.points[i].ancestorSampleId);
  assert.equal(projected.marks[i].x,level1.points[i].coordinates[0].re);
  assert.equal(projected.marks[i].y,level1.points[i].coordinates[0].im);
}

const fakeTarget={innerHTML:"",hidden:true,dataset:{}};
GeometricPullbackRenderer.renderProjectedLevel(projected,fakeTarget);
assert.equal(fakeTarget.dataset.geometryRendered,"true");
assert.equal(fakeTarget.dataset.pullbackGeometryRendered,"true");
assert.equal(fakeTarget.dataset.renderedGeometricDepth,"1");
assert.equal(fakeTarget.dataset.sheetsMaterialized,"false");
assert.equal(fakeTarget.dataset.coveringStructureClaimed,"false");
assert.equal(fakeTarget.dataset.geometricZoomApplied,"false");
assert.equal(fakeTarget.dataset.rendererTechnology,"svg");
assert.equal((fakeTarget.innerHTML.match(/class="geometric-pullback-mark"/g)||[]).length,level1.pointCount);

const oneSeedModel=Object.freeze({...sampleA,sampleCount:1,samples:Object.freeze([sampleA.samples[0]])});
const depthTwoFixture=GeometricPullbackEngine.generateLevels(scene,oneSeedModel,baseConfig,pullbackConfig,2);
assert.equal(depthTwoFixture.levels[0].pointCount,1);
assert.equal(depthTwoFixture.levels[1].pointCount,derivedFiberCardinality);
assert.equal(depthTwoFixture.levels[2].pointCount,derivedFiberCardinality*derivedFiberCardinality);

assert.throws(
  ()=>GeometricPullbackEngine.generateNextLevel(scene,level1,baseConfig,pullbackConfig),
  (error)=>error instanceof GeometricPullbackEngine.GeometricPullbackMaterializationLimitError
);

const alteredDepthScene=clone(scene);
alteredDepthScene.request.requestedDepth=999;
const depthZeroOnly=GeometricPullbackEngine.generateLevels(alteredDepthScene,sampleA,baseConfig,pullbackConfig,0);
assert.equal(depthZeroOnly.renderedGeometricDepth,0);
assert.equal(depthZeroOnly.levels.length,1);
assert.equal(depthZeroOnly.structuralRequestedDepthConsumed,false);

const context=LaurentEvaluator.createEvaluationContext(scene);
const wrongParent=sampleA.samples[1];
const candidate=firstFiber[0].coordinates;
assert.equal(BaseGeometricSampler.validateMembership(context,firstParent.coordinates,baseConfig).accepted,true);
assert.equal(TorusPowerEvaluator.powerResidualRecord(D,candidate,wrongParent.coordinates,pullbackConfig.powerResidualTolerance).accepted,false,
  "A child must be bound to its declared parent, not accepted merely because a W-related point is valid.");

assert.throws(()=>GeometricPullbackFibers.validateCompleteFiber(firstParent.coordinates,D,firstFiber.slice(0,1),fiberOptions));
const missingIndexFiber=firstFiber.map((point,index)=>index===0?{...point,rootMultiIndex:null}:point);
assert.throws(()=>GeometricPullbackFibers.validateCompleteFiber(firstParent.coordinates,D,missingIndexFiber,fiberOptions));
const wrongOrderFiber=[firstFiber[1],firstFiber[0],...firstFiber.slice(2)];
assert.throws(()=>GeometricPullbackFibers.validateCompleteFiber(firstParent.coordinates,D,wrongOrderFiber,fiberOptions));

assert.throws(()=>TorusPowerEvaluator.validateD(0));
assert.throws(()=>TorusPowerEvaluator.validateD(1));
assert.throws(()=>TorusPowerEvaluator.validateD(2.5));
assert.throws(()=>TorusPowerEvaluator.validateD(Number.NaN));
assert.throws(()=>TorusPowerEvaluator.validateD(Number.POSITIVE_INFINITY));
assert.throws(()=>GeometricPullbackFibers.enumerateCoordinateRoots(LaurentEvaluator.complex(0,0),D,pullbackConfig.rootEnumeration));
assert.throws(()=>GeometricPullbackFibers.enumerateCoordinateRoots({re:Number.NaN,im:0},D,pullbackConfig.rootEnumeration));
assert.throws(()=>GeometricPullbackFibers.enumerateCoordinateRoots({re:Number.POSITIVE_INFINITY,im:0},D,pullbackConfig.rootEnumeration));

const randomConfig=clone(pullbackConfig);
randomConfig.rootEnumeration.coordinateRootIndexOrder="random";
assert.throws(()=>GeometricPullbackEngine.validateConfig(randomConfig));
const badScene=clone(scene);
badScene.mathematics.pullbackMap.kind="unknown";
assert.throws(()=>GeometricPullbackEngine.validateSceneAndD(badScene));

const protectedBlobs={
  "laurent-evaluator.js":"651f485dd43734befa119ecb91209a5beff65f20",
  "base-geometric-sampler.js":"da201c6d304c77001935763f53e26060a6599b01",
  "base-geometric-renderer.js":"99e07043efb984dba340a44ebfa0efa61721d2da",
  "base-geometric-runtime.js":"3cb23b0dc104cd7f172ad47e45435e712f07d070",
  "base-geometric-renderer.css":"bdcb3a1b4befc961848bdbe39b3603ec921cc909",
  "data/base-geometric-render-config.v1.json":"0e8a0cc0e08a617c7d0865f31a379587c43d0c36",
  "docs/BASE_GEOMETRIC_RENDERER_v0_01.md":"2468d691339cdad66bc395e801b9e6ed311d6ed5",
  "docs/base_geometric_renderer_matrix_v0_01.json":"08b2685336c24c6f6d63c4de60184b88d6653a61",
  "verify_base_geometric_renderer_v0_01.js":"56337384170ad94897affec57ffeffdb2a6191f1",
  "verify_base_geometric_renderer_browser_v0_01.js":"960f6bfe2876b6833bf197aa72a279e2a2b7569e",
  "concrete-runtime-schema.js":"23cc1d78afa287162107a1b9e8742d74cbf09d0d",
  "data/system.v2.json":"0d598560134e45bd3ed2edec62120fa45649883c",
  "projection-slice-semantics.js":"96841a5ceeaebd09155d8ade7653057b76d65104",
  "data/geometric-view.v1.json":"b3d52865c1ab7b2761581a5ddc838488bb903842",
  "formal/SelfSimilarCY/TorusCoordinatePower.lean":"f58772332d30dbf68a0815691206e7de1c02f1eb",
  "formal/SelfSimilarCY/ConcretePullbackTower.lean":"32a231cdcd50cbfbcc5f2cd5ce0f86588d2d9984",
  "formal/SelfSimilarCY/TorusPowerKernel.lean":"2ebffc127658cd6bda8464425bac1154c4fbf8c1",
  "formal/SelfSimilarCY/TorusPowerFibers.lean":"0df2e2aa373ef47653793bc2d0c3abcb79f1bd03"
};
for(const [relativePath,expected] of Object.entries(protectedBlobs)){
  assert.equal(gitBlobSha(read(relativePath)),expected,relativePath+" must remain byte-identical.");
}

for(const relativePath of [
  "torus-power-evaluator.js","geometric-pullback-fibers.js","geometric-pullback-engine.js",
  "geometric-pullback-view-semantics.js","geometric-pullback-renderer.js","geometric-pullback-runtime.js"
]){
  const source=read(relativePath);
  assert.ok(!source.includes("Math.random"),relativePath+" must not use randomness.");
  assert.ok(!source.includes("crypto.random"),relativePath+" must not use randomness.");
  assert.ok(!source.includes("metricScale"),relativePath+" must not consume D^2 structural/runtime scale metadata.");
  assert.ok(!source.includes("sheetDegree"),relativePath+" must not consume structural D^4 metadata as geometric authority.");
}

console.log("Geometric Pullback Visualization v0.01 verifier: passed");
console.log("canonical source seed count: "+String(level0.pointCount));
console.log("D: "+String(D));
console.log("derived one-parent fiber cardinality: "+String(derivedFiberCardinality));
console.log("canonical X_1 generated point count: "+String(level1.pointCount));
console.log("maximum power-map residual: "+maximumPowerResidual.toExponential(6));
console.log("maximum inherited W-membership residual at depth 1: "+level1.maxBaseMembershipResidualMagnitude.toExponential(6));
console.log("supported canonical rendered geometric depth: 1; exact hard cap: "+String(pullbackConfig.materialization.maxGeneratedPoints));
console.log("sheetsMaterialized=false; coveringStructureClaimed=false; geometricZoomApplied=false");

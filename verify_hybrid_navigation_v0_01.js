"use strict";

const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");

const HybridNavigationSemantics=require("./hybrid-navigation-semantics.js");
const GeometricPullbackEngine=require("./geometric-pullback-engine.js");
const BaseGeometricSampler=require("./base-geometric-sampler.js");

const config=require("./data/hybrid-navigation.v1.json");
const pullbackConfig=require("./data/geometric-pullback-config.v1.json");
const scene=require("./data/system.v2.json");
const baseConfig=require("./data/base-geometric-render-config.v1.json");
const matrix=require("./docs/hybrid_structural_geometric_navigation_matrix_v0_01.json");

const root=__dirname;
function read(relativePath){return fs.readFileSync(path.join(root,relativePath),"utf8");}
function gitBlobSha(source){const body=Buffer.from(source,"utf8");return crypto.createHash("sha1").update("blob "+String(body.length)+"\0").update(body).digest("hex");}

const validated=HybridNavigationSemantics.validateConfig(config);
assert.equal(validated.defaultRepresentationMode,"structural");
assert.deepEqual(validated.representationModes,["structural","geometric"]);
assert.equal(matrix.status,"canonical_sealed");
assert.equal(matrix.materialization.maxGeneratedPoints,10000);
assert.equal(matrix.materialization.beyondCap,"reject_without_partial_materialization");
assert.equal(matrix.materialization.hybridRuntimeCallsGeometricGenerationApi,false);
assert.equal(matrix.truthFlags.sheetsMaterialized,false);
assert.equal(matrix.truthFlags.coveringStructureClaimed,false);
assert.equal(matrix.truthFlags.geometricZoomApplied,false);

const structural=HybridNavigationSemantics.createStructuralSnapshot({
  requestedDepth:8,materializedDepth:5,selectedDepth:1,focusedDepth:3,visibleDepth:5
});
const geometric=HybridNavigationSemantics.createGeometricSnapshot({
  renderedDepth:1,availableDepths:[0,1],sourceObject:"X_1",pointCount:8192,
  viewId:"xn_z1_complex_plane_sampled_pullback_projection_v1",projectionMapping:"(Re(z1), Im(z1))",
  geometryRendered:true,sheetsMaterialized:false,coveringStructureClaimed:false,geometricZoomApplied:false
});
const state=HybridNavigationSemantics.createHybridNavigationState(config,structural,geometric);
assert.equal(state.representationMode,"structural");
assert.equal(state.structural.requestedDepth,8);
assert.equal(state.geometric.renderedDepth,1);
assert.equal(state.crossLayerCorrespondence.selectedStructuralStage.class,HybridNavigationSemantics.CLASS_A);
assert.equal(state.crossLayerCorrespondence.objectIdentity.class,HybridNavigationSemantics.CLASS_D);
assert.equal(state.crossLayerCorrespondence.objectIdentity.structuralNodeEqualsGeometricPoint,false);
assert.equal(state.crossLayerCorrespondence.objectIdentity.rootTupleEqualsSheet,false);
assert.equal(state.crossLayerCorrespondence.presentationNavigation.class,HybridNavigationSemantics.CLASS_C);
assert.equal(state.crossLayerCorrespondence.presentationNavigation.automaticDepthSynchronization,false);
assert.equal(state.navigationProvenance.geometricMaterializationTriggered,false);
assert.equal(state.navigationProvenance.geometricZoomApplied,false);

const deepStructural=HybridNavigationSemantics.createStructuralSnapshot({
  requestedDepth:999,materializedDepth:9,selectedDepth:9,focusedDepth:9,visibleDepth:9
});
const independentState=HybridNavigationSemantics.createHybridNavigationState(config,deepStructural,geometric,{representationMode:"geometric"});
assert.equal(independentState.structural.requestedDepth,999);
assert.equal(independentState.geometric.renderedDepth,1);
assert.equal(independentState.crossLayerCorrespondence.selectedStructuralStage.class,HybridNavigationSemantics.CLASS_D);
assert.equal(independentState.crossLayerCorrespondence.selectedStructuralStage.supported,false);

const geometricZero=HybridNavigationSemantics.createGeometricSnapshot({
  renderedDepth:0,availableDepths:[0,1],sourceObject:"X_0",pointCount:512,
  viewId:"xn_z1_complex_plane_sampled_pullback_projection_v1",projectionMapping:"(Re(z1), Im(z1))",
  geometryRendered:true,sheetsMaterialized:false,coveringStructureClaimed:false,geometricZoomApplied:false
});
const inverseIndependence=HybridNavigationSemantics.createHybridNavigationState(config,deepStructural,geometricZero);
assert.equal(inverseIndependence.structural.requestedDepth,999);
assert.equal(inverseIndependence.structural.selectedDepth,9);
assert.equal(inverseIndependence.geometric.renderedDepth,0);

const selection=HybridNavigationSemantics.createGeometricSelection({
  pointId:"x0:000001/d1/r[0,1,0,1]",depth:1,parentId:"x0:000001",ancestorSampleId:"x0:000001",
  rootMultiIndex:[0,1,0,1],projectedOverlapCount:2
},geometric);
assert.equal(selection.kind,"finite_geometric_point");
assert.equal(selection.correspondenceClass,HybridNavigationSemantics.CLASS_D);
assert.equal(selection.canonicalStructuralCorrespondence,null);
const selectedState=HybridNavigationSemantics.createHybridNavigationState(config,structural,geometric,{selectedGeometricObject:selection,lastAction:"select_geometric_point"});
assert.equal(selectedState.selectedGeometricObject.pointId,selection.pointId);
assert.equal(selectedState.navigationProvenance.sourceObjectIdentityCreated,false);
assert.throws(()=>HybridNavigationSemantics.createGeometricSelection({...selection,depth:0},geometric));

const samples=BaseGeometricSampler.generateSamples(scene,baseConfig);
const generated=GeometricPullbackEngine.generateLevels(scene,samples,baseConfig,pullbackConfig,1);
assert.equal(generated.renderedGeometricDepth,1);
assert.equal(generated.levels[0].pointCount,512);
assert.equal(generated.levels[1].pointCount,8192);
assert.equal(generated.structuralRequestedDepthConsumed,false);
assert.throws(
  ()=>GeometricPullbackEngine.generateNextLevel(scene,generated.levels[1],baseConfig,pullbackConfig),
  (error)=>error instanceof GeometricPullbackEngine.GeometricPullbackMaterializationLimitError
);

const hybridRuntime=read("hybrid-navigation-runtime.js");
for(const forbiddenCall of ["generateLevels(","generateNextLevel(","enumerateCompleteFiber(","Math.random","crypto.random"]){
  assert.equal(hybridRuntime.includes(forbiddenCall),false,"hybrid runtime must not invoke "+forbiddenCall);
}
assert.ok(hybridRuntime.includes("Thread25GeometricPullbackState"));
assert.ok(hybridRuntime.includes("data-interaction-action=\"select\""));
assert.ok(hybridRuntime.includes("No canonical structural object correspondence"));

const protectedBlobs={
  "base-renderer.js":"fea92139c2a8514f01b9bb187f27bf0131dd4114",
  "one-step-pullback.js":"5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js":"0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js":"9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js":"cecf0f06aa23404a65a6093f705a4fe56be65029",
  "interactive-pullback-tower.js":"657262aab1db8e49e903e3e83d4a033586e2f8bd",
  "app.js":"4b5767b5f5fae9fac25d042e777b150a2ef92c38",
  "projection-slice-semantics.js":"96841a5ceeaebd09155d8ade7653057b76d65104",
  "torus-power-evaluator.js":"52d11c7af5a7cd73d81afe508bed35da894c0e47",
  "geometric-pullback-fibers.js":"1285975c40c817793d8b29659373b3213bf2947f",
  "geometric-pullback-engine.js":"7e7c634b1feedc045fe7a82d477621cb293a955d",
  "geometric-pullback-view-semantics.js":"a4e49d8d458a675ac1602d929a97226b6dd1c12b",
  "geometric-pullback-renderer.js":"ea273810c186b0a56597dc9ca72c7317ce7a3d80",
  "geometric-pullback-runtime.js":"d9834da759b2485810cb73a9148d2bd87607751f",
  "data/geometric-pullback-config.v1.json":"e99d6eb2addafbb0423adaf3c9f54cd09e5fb072",
  "data/geometric-pullback-view.v1.json":"02a3a2efe65e96cb81cf75ba4842e9a36ebfc438",
  "docs/GEOMETRIC_PULLBACK_VISUALIZATION_v0_01.md":"34bc5eb0b3ae07bfb5700748e554d4baac96fccf",
  "docs/geometric_pullback_visualization_matrix_v0_01.json":"709d7f2bcfa78c4a762c5dbd17576001ba632f2e"
};
for(const [relativePath,expected] of Object.entries(protectedBlobs)){
  assert.equal(gitBlobSha(read(relativePath)),expected,relativePath+" must remain byte-identical through Thread 26.");
}

const index=read("index.html");
const workflow=read(".github/workflows/formal-verification.yml");
for(const required of ["hybrid-navigation.css","hybrid-navigation-semantics.js","hybrid-navigation-runtime.js","id=\"hybrid-navigation\"","Hybrid structural / geometric navigation"]){
  assert.ok(index.includes(required),"index.html missing Thread 26 wiring: "+required);
}
for(const required of ["node verify_hybrid_navigation_v0_01.js","node verify_hybrid_navigation_browser_v0_01.js","thread26-hybrid-navigation-browser-evidence-"]){
  assert.ok(workflow.includes(required),"workflow missing Thread 26 verification/publication wiring: "+required);
}

console.log("Hybrid Structural / Geometric Navigation v0.01 verifier: passed");
console.log("structural/geometric depth independence: preserved");
console.log("canonical geometric counts: 512 -> 8192; depth 2 remains rejected above cap 10000");
console.log("cross-layer object identity: unsupported; stage correspondence only");
console.log("sheetsMaterialized=false; coveringStructureClaimed=false; geometricZoomApplied=false");

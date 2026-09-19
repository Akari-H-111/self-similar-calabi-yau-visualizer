"use strict";

const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");

const BaseGeometricSampler=require("./base-geometric-sampler.js");
const GeometricPullbackEngine=require("./geometric-pullback-engine.js");
const GeometricPullbackRenderer=require("./geometric-pullback-renderer.js");
const AncestorScopedPullbackRuntime=require("./ancestor-scoped-pullback-runtime.js");

const scene=require("./data/system.v2.json");
const baseView=require("./data/geometric-view.v1.json");
const baseConfig=require("./data/base-geometric-render-config.v1.json");
const pullbackView=require("./data/geometric-pullback-view.v1.json");
const pullbackConfig=require("./data/geometric-pullback-config.v1.json");
const thread29=require("./docs/ancestor_scoped_pullback_runtime_matrix_v0_01.json");
const matrix=require("./docs/ancestor_scoped_pullback_geometric_visualization_matrix_v0_01.json");

const root=__dirname;
function read(relativePath){return fs.readFileSync(path.join(root,relativePath),"utf8");}
function gitBlobSha(relativePath){
  const body=Buffer.from(read(relativePath),"utf8");
  const header=Buffer.from("blob "+String(body.length)+"\0","utf8");
  return crypto.createHash("sha1").update(header).update(body).digest("hex");
}

assert.equal(matrix.thread,30);
assert.equal(matrix.status,"canonical_sealed");
assert.equal(matrix.canonicalParent.commit,"3944d6d18ae0a0d7b55b6e1e9fe8a7653c21b37a");
assert.equal(matrix.canonicalParent.tree,"705944b76b5c78aeb355b3029f945e2a55652399");
assert.equal(thread29.status,"canonical_sealed");
assert.equal(thread29.thread30AuthorizedOnlyAfterCanonicalSeal,true);

const canonical=BaseGeometricSampler.generateSamples(scene,baseConfig);
assert.equal(canonical.sampleCount,512);
const selectedAncestorId=canonical.samples[0].sampleId;
const expected=[1,16,256,4096];

for(let depth=0;depth<=3;depth+=1){
  const scoped=AncestorScopedPullbackRuntime.materializeScopedScene(
    scene,canonical,[selectedAncestorId],depth,baseConfig,pullbackConfig
  );
  const level=scoped.sceneModel.levels[depth];
  assert.equal(level.pointCount,expected[depth]);
  assert.equal(scoped.globalCompletenessClaim,false);
  assert.equal(scoped.truthfulness.sheetsMaterialized,false);
  assert.equal(scoped.truthfulness.coveringStructureClaimed,false);
  assert.equal(scoped.truthfulness.geometricZoomApplied,false);

  const projected=GeometricPullbackRenderer.createProjectedLevel(scene,baseView,pullbackView,level);
  assert.equal(projected.pointCount,expected[depth]);
  assert.equal(projected.marks.length,expected[depth]);
  assert.equal(projected.sourceManifoldCompletenessClaim,false);
  assert.equal(projected.overlapPolicy,"projected_pullback_point_overlap_count_only");
  for(const mark of projected.marks){
    assert.equal(mark.ancestorSampleId,selectedAncestorId);
    assert.equal(mark.depth,depth);
    assert.ok(Number.isInteger(mark.projectedPullbackPointOverlapCount));
    assert.ok(mark.projectedPullbackPointOverlapCount>=1);
    if(depth>0){
      assert.equal(typeof mark.parentId,"string");
      assert.equal(mark.rootMultiIndex.length,4);
    }else{
      assert.equal(mark.parentId,null);
      assert.equal(mark.rootMultiIndex,null);
    }
  }

  const target={innerHTML:"",hidden:true,dataset:{}};
  GeometricPullbackRenderer.renderProjectedLevel(projected,target);
  assert.equal(Number(target.dataset.markCount),expected[depth]);
  assert.equal((target.innerHTML.match(/class="geometric-pullback-mark"/g)||[]).length,expected[depth]);
  assert.equal(target.dataset.sheetsMaterialized,"false");
  assert.equal(target.dataset.coveringStructureClaimed,"false");
  assert.equal(target.dataset.geometricZoomApplied,"false");
}

const over=AncestorScopedPullbackRuntime.preflightScopedRequest(1,2,4,10000);
assert.equal(over.requiredPointCount,"65536");
assert.equal(over.admitted,false);
assert.throws(
  ()=>AncestorScopedPullbackRuntime.materializeScopedScene(scene,canonical,[selectedAncestorId],4,baseConfig,pullbackConfig),
  (error)=>error instanceof AncestorScopedPullbackRuntime.AncestorScopedPullbackMaterializationLimitError
);

const globalScene=GeometricPullbackEngine.generateLevels(scene,canonical,baseConfig,pullbackConfig,1);
assert.deepEqual(globalScene.levels.map((level)=>level.pointCount),[512,8192]);

const runtimeSource=read("ancestor-scoped-pullback-visualization-runtime.js");
assert.ok(runtimeSource.includes("AncestorScopedPullbackRuntime.preflightScopedRequest"));
assert.ok(runtimeSource.includes("AncestorScopedPullbackRuntime.materializeScopedScene"));
assert.ok(runtimeSource.includes("GeometricPullbackRenderer.createProjectedLevel"));
assert.ok(runtimeSource.includes("GeometricPullbackRenderer.renderProjectedLevel"));
assert.ok(runtimeSource.includes('renderButton.addEventListener("click"'));
assert.ok(!runtimeSource.includes("Math.random"));
assert.ok(!runtimeSource.includes("enumerateCompleteFiber("));
assert.ok(!runtimeSource.includes("Thread25GeometricPullbackState="));
assert.ok(!runtimeSource.includes("HybridNavigation"));

const index=read("index.html");
assert.ok(index.includes('id="ancestor-scoped-pullback"'));
assert.ok(index.includes('id="ancestor-scoped-pullback-render"'));
assert.ok(index.includes("Render selected scope"));
assert.ok(index.includes("ancestor-scoped-pullback-runtime.js"));
assert.ok(index.includes("ancestor-scoped-pullback-visualization-runtime.js"));
const sectionStart=index.indexOf('<section aria-labelledby="ancestor-scoped-pullback-label"');
const sectionEnd=index.indexOf("</section>",sectionStart);
assert.ok(sectionStart>=0&&sectionEnd>sectionStart);
const section=index.slice(sectionStart,sectionEnd);
assert.ok(!section.includes("data-hybrid-panel"));
assert.ok(section.includes("complete recursive pullback of the selected finite ancestor scope"));
assert.ok(section.includes("not the complete global"));

assert.equal(matrix.reuse.newGeometricRendererIntroduced,false);
assert.equal(matrix.reuse.newProjectionIntroduced,false);
assert.equal(matrix.interaction.selectorChangeGeneratesGeometry,false);
assert.equal(matrix.truthFlags.completeGlobalHypersurfaceRendered,false);
assert.equal(matrix.truthFlags.sheetsMaterialized,false);
assert.equal(matrix.truthFlags.coveringStructureClaimed,false);
assert.equal(matrix.truthFlags.geometricZoomApplied,false);

for(const [relativePath,expected] of Object.entries(matrix.protectedBlobs)){
  assert.equal(gitBlobSha(relativePath),expected,"protected blob drift: "+relativePath);
}

console.log("Thread 30 ancestor-scoped geometric visualization verifier: PASS");
console.log("reused Thread 29 runtime + Thread 25 renderer + Thread 23 projection");
console.log("one ancestor renders 1/16/256/4096 through scoped depth 3");
console.log("depth 4 requires 65536 and remains rejected before recursive generation");
console.log("complete global X_n / sheets / covering / geometric zoom remain unclaimed");

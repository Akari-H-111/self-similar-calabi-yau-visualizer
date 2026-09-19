"use strict";

const fs=require("node:fs");
const path=require("node:path");
const http=require("node:http");
const childProcess=require("node:child_process");
const assert=require("node:assert/strict");
const {chromium}=require("playwright");

const root=__dirname;
const artifactDir=path.join(root,"thread26-browser-artifacts");
fs.mkdirSync(artifactDir,{recursive:true});

function git(command){return childProcess.execFileSync("git",command,{cwd:root,encoding:"utf8"}).trim();}
function contentType(filePath){
  if(filePath.endsWith(".html"))return "text/html; charset=utf-8";
  if(filePath.endsWith(".js"))return "text/javascript; charset=utf-8";
  if(filePath.endsWith(".css"))return "text/css; charset=utf-8";
  if(filePath.endsWith(".json"))return "application/json; charset=utf-8";
  return "application/octet-stream";
}
function createStaticServer(){
  return http.createServer((req,res)=>{
    try{
      const url=new URL(req.url||"/","http://127.0.0.1");
      let relative=decodeURIComponent(url.pathname);
      if(relative==="/")relative="/index.html";
      relative=relative.replace(/^\/+/, "");
      const resolved=path.resolve(root,relative);
      if(!resolved.startsWith(path.resolve(root)+path.sep)&&resolved!==path.join(root,"index.html")){res.writeHead(403);res.end("forbidden");return;}
      if(!fs.existsSync(resolved)||!fs.statSync(resolved).isFile()){res.writeHead(404);res.end("not found");return;}
      res.writeHead(200,{"content-type":contentType(resolved),"cache-control":"no-store"});
      fs.createReadStream(resolved).pipe(res);
    }catch(error){res.writeHead(500);res.end(String(error));}
  });
}
function listen(server){return new Promise((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",()=>resolve(server.address()));});}
function close(server){return new Promise((resolve)=>server.close(()=>resolve()));}

async function hybridState(page){
  return page.evaluate(()=>{
    const state=window.Thread26HybridNavigationState;
    return {
      mode:state.representationMode,
      structuralRequested:state.structural.requestedDepth,
      structuralMaterialized:state.structural.materializedDepth,
      structuralSelected:state.structural.selectedDepth,
      structuralFocused:state.structural.focusedDepth,
      geometricDepth:state.geometric.renderedDepth,
      geometricAvailable:[...state.geometric.availableDepths],
      geometricSourceObject:state.geometric.sourceObject,
      selectedGeometricPoint:state.selectedGeometricObject?state.selectedGeometricObject.pointId:null,
      selectedStageClass:state.crossLayerCorrespondence.selectedStructuralStage.class,
      objectIdentityClass:state.crossLayerCorrespondence.objectIdentity.class,
      automaticDepthSynchronization:state.crossLayerCorrespondence.presentationNavigation.automaticDepthSynchronization,
      lastAction:state.navigationProvenance.lastAction,
      geometricMaterializationTriggered:state.navigationProvenance.geometricMaterializationTriggered,
      sheetsMaterialized:state.truthFlags.sheetsMaterialized,
      coveringStructureClaimed:state.truthFlags.coveringStructureClaimed,
      geometricZoomApplied:state.truthFlags.geometricZoomApplied
    };
  });
}

(async()=>{
  const consoleErrors=[],pageErrors=[];
  const server=createStaticServer(),address=await listen(server);
  const baseUrl="http://127.0.0.1:"+String(address.port)+"/";
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1100},colorScheme:"light"});
  const page=await context.newPage();
  page.on("console",(message)=>{if(message.type()==="error")consoleErrors.push(message.text());});
  page.on("pageerror",(error)=>pageErrors.push(error.message));
  let evidence;
  try{
    const response=await page.goto(baseUrl,{waitUntil:"networkidle"});
    assert.ok(response&&response.ok());
    await page.waitForFunction(()=>document.querySelector("#system-status")?.dataset.state==="ready",null,{timeout:20000});
    await page.waitForFunction(()=>document.querySelector("#geometric-pullback-status")?.dataset.state==="ready",null,{timeout:20000});
    await page.waitForFunction(()=>document.querySelector("#hybrid-navigation")?.dataset.state==="ready",null,{timeout:20000});

    assert.equal(await page.locator("#structural-visualization").isVisible(),true);
    assert.equal(await page.locator("#base-geometric-visualization").isVisible(),true);
    assert.equal(await page.locator("#geometric-pullback-visualization").isVisible(),true);

    const initial=await hybridState(page);
    assert.equal(initial.mode,"structural");
    assert.equal(initial.structuralRequested,0);
    assert.equal(initial.structuralMaterialized,0);
    assert.equal(initial.structuralSelected,0);
    assert.equal(initial.geometricDepth,1);
    assert.deepEqual(initial.geometricAvailable,[0,1]);
    assert.equal(initial.objectIdentityClass,"D_unsupported_forbidden_correspondence");
    assert.equal(initial.automaticDepthSynchronization,false);
    assert.equal(initial.geometricMaterializationTriggered,false);
    assert.equal(initial.sheetsMaterialized,false);
    assert.equal(initial.coveringStructureClaimed,false);
    assert.equal(initial.geometricZoomApplied,false);

    const thread25Before=await page.evaluate(()=>({
      levels:window.Thread25GeometricPullbackState.sceneModel.levels.length,
      cap:window.Thread25GeometricPullbackState.pullbackConfig.materialization.maxGeneratedPoints,
      depth1Count:window.Thread25GeometricPullbackState.sceneModel.levels[1].pointCount
    }));
    assert.deepEqual(thread25Before,{levels:2,cap:10000,depth1Count:8192});

    await page.locator('[data-hybrid-mode="geometric"]').click();
    await page.waitForFunction(()=>document.querySelector("#hybrid-navigation")?.dataset.representationMode==="geometric");
    let current=await hybridState(page);
    assert.equal(current.mode,"geometric");
    assert.equal(current.structuralRequested,0);
    assert.equal(current.geometricDepth,1);
    assert.equal(await page.locator('[data-hybrid-panel="geometric"][data-hybrid-active="true"]').count(),2);
    assert.equal(await page.locator('[data-hybrid-panel="structural"][data-hybrid-active="false"]').count(),1);

    await page.locator('[data-hybrid-mode="structural"]').click();
    await page.waitForFunction(()=>document.querySelector("#hybrid-navigation")?.dataset.representationMode==="structural");
    current=await hybridState(page);
    assert.equal(current.geometricDepth,1,"Mode switch must not change geometric depth.");

    const expand=page.locator('[data-interaction-action="expand-or-reveal"]');
    await expand.click();
    await page.waitForFunction(()=>document.querySelector("#interactive-pullback-tower")?.dataset.materializedDepth==="1");
    assert.equal((await hybridState(page)).geometricDepth,1,"Structural expansion must not change geometric depth.");
    await expand.click();
    await page.waitForFunction(()=>document.querySelector("#interactive-pullback-tower")?.dataset.materializedDepth==="2");
    await page.locator('[data-interaction-action="select"][data-depth="2"]').click();
    await page.waitForFunction(()=>document.querySelector("#hybrid-navigation")?.dataset.structuralSelectedDepth==="2");
    current=await hybridState(page);
    assert.equal(current.structuralRequested,2);
    assert.equal(current.structuralMaterialized,2);
    assert.equal(current.structuralSelected,2);
    assert.equal(current.geometricDepth,1);
    assert.equal(current.selectedStageClass,"D_unsupported_forbidden_correspondence");
    assert.equal(await page.locator('[data-hybrid-action="structural-to-geometric"]').isDisabled(),true);

    await page.selectOption("#geometric-pullback-depth","0");
    await page.waitForFunction(()=>document.querySelector("#hybrid-navigation")?.dataset.geometricRenderedDepth==="0");
    current=await hybridState(page);
    assert.equal(current.geometricDepth,0);
    assert.equal(current.structuralRequested,2);
    assert.equal(current.structuralMaterialized,2);
    assert.equal(current.structuralSelected,2,"Independent geometric depth change must not alter structural selection.");

    await page.locator('[data-hybrid-action="geometric-to-structural"]').click();
    await page.waitForFunction(()=>document.querySelector("#hybrid-navigation")?.dataset.structuralSelectedDepth==="0");
    current=await hybridState(page);
    assert.equal(current.mode,"structural");
    assert.equal(current.structuralSelected,0);
    assert.equal(current.structuralMaterialized,2);
    assert.equal(current.structuralRequested,2);
    assert.equal(current.geometricDepth,0);
    assert.equal(current.lastAction,"explicit_geometric_stage_to_structural_stage");

    await page.locator('[data-interaction-action="select"][data-depth="1"]').click();
    await page.waitForFunction(()=>document.querySelector("#hybrid-navigation")?.dataset.structuralSelectedDepth==="1");
    assert.equal((await hybridState(page)).geometricDepth,0);
    await page.locator('[data-hybrid-action="structural-to-geometric"]').click();
    await page.waitForFunction(()=>document.querySelector("#hybrid-navigation")?.dataset.geometricRenderedDepth==="1");
    current=await hybridState(page);
    assert.equal(current.mode,"geometric");
    assert.equal(current.structuralSelected,1);
    assert.equal(current.geometricDepth,1);
    assert.equal(current.lastAction,"explicit_structural_stage_to_geometric_stage");
    assert.equal(await page.locator(".geometric-pullback-mark").count(),8192);

    const firstMark=page.locator(".geometric-pullback-mark").first();
    await firstMark.dispatchEvent("click");
    await page.waitForFunction(()=>window.Thread26HybridNavigationState?.selectedGeometricObject!==null);
    const selected=await page.evaluate(()=>window.Thread26HybridNavigationState.selectedGeometricObject);
    assert.equal(selected.kind,"finite_geometric_point");
    assert.equal(selected.depth,1);
    assert.equal(typeof selected.pointId,"string");
    assert.equal(typeof selected.parentId,"string");
    assert.equal(typeof selected.ancestorSampleId,"string");
    assert.equal(Array.isArray(selected.rootMultiIndex),true);
    assert.equal(selected.correspondenceClass,"D_unsupported_forbidden_correspondence");
    assert.equal(selected.canonicalStructuralCorrespondence,null);
    assert.ok((await page.locator("#hybrid-geometric-selection").textContent()).includes("No canonical structural object correspondence"));
    assert.equal(await page.locator('.geometric-pullback-mark[data-hybrid-selected="true"]').count(),1);

    const thread25After=await page.evaluate(()=>({
      levels:window.Thread25GeometricPullbackState.sceneModel.levels.length,
      cap:window.Thread25GeometricPullbackState.pullbackConfig.materialization.maxGeneratedPoints,
      depth1Count:window.Thread25GeometricPullbackState.sceneModel.levels[1].pointCount,
      sheets:document.querySelector("#geometric-pullback-visualization")?.dataset.sheetsMaterialized,
      covering:document.querySelector("#geometric-pullback-visualization")?.dataset.coveringStructureClaimed,
      zoom:document.querySelector("#geometric-pullback-visualization")?.dataset.geometricZoomApplied
    }));
    assert.deepEqual(thread25After,{levels:2,cap:10000,depth1Count:8192,sheets:"false",covering:"false",zoom:"false"});

    const beforeReloadInitial=initial;
    await page.reload({waitUntil:"networkidle"});
    await page.waitForFunction(()=>document.querySelector("#hybrid-navigation")?.dataset.state==="ready",null,{timeout:20000});
    const afterReload=await hybridState(page);
    assert.equal(afterReload.mode,beforeReloadInitial.mode);
    assert.equal(afterReload.structuralRequested,beforeReloadInitial.structuralRequested);
    assert.equal(afterReload.structuralMaterialized,beforeReloadInitial.structuralMaterialized);
    assert.equal(afterReload.structuralSelected,beforeReloadInitial.structuralSelected);
    assert.equal(afterReload.geometricDepth,beforeReloadInitial.geometricDepth);
    assert.deepEqual(afterReload.geometricAvailable,beforeReloadInitial.geometricAvailable);
    assert.equal(afterReload.objectIdentityClass,beforeReloadInitial.objectIdentityClass);

    const screenshot="hybrid-navigation-thread26-chromium.png";
    await page.screenshot({path:path.join(artifactDir,screenshot),fullPage:true});
    assert.deepEqual(consoleErrors,[]);
    assert.deepEqual(pageErrors,[]);

    evidence={
      schemaVersion:1,
      evidenceKind:"thread26_hybrid_structural_geometric_navigation_browser",
      candidate:{commit:process.env.GITHUB_SHA||git(["rev-parse","HEAD"]),tree:git(["rev-parse","HEAD^{tree}"])},
      browser:{engine:"chromium",version:browser.version()},
      initialState:initial,
      exercised:{modeSwitch:true,structuralDepthIndependence:true,geometricDepthIndependence:true,explicitStageNavigationBothDirections:true,geometricPointSelection:true},
      canonicalGeometry:{sourceSeedCount:512,depth1MarkCount:8192,maxGeneratedPoints:10000,materializedLevels:2},
      truthFlags:{sheetsMaterialized:false,coveringStructureClaimed:false,geometricZoomApplied:false},
      deterministicReload:true,
      consoleErrors,pageErrors,screenshot,pass:true
    };
  }finally{
    await context.close();await browser.close();await close(server);
    if(evidence)fs.writeFileSync(path.join(artifactDir,"thread26-browser-evidence.json"),JSON.stringify(evidence,null,2)+"\n","utf8");
  }
  console.log("Thread 26 Hybrid Structural / Geometric Navigation browser verification: passed");
  console.log("structural and geometric depths remained independent except under explicit stage navigation");
  console.log("canonical X_1 rendered marks: 8192; Thread 25 materialized levels remained 2");
  console.log("object identity unsupported; sheets/covering/geometric zoom=false");
})().catch((error)=>{console.error(error);process.exitCode=1;});

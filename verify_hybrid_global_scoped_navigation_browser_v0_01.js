"use strict";

const fs=require("node:fs");
const path=require("node:path");
const http=require("node:http");
const childProcess=require("node:child_process");
const assert=require("node:assert/strict");
const {chromium}=require("playwright");

const root=__dirname;
const artifactDir=path.join(root,"thread31-browser-artifacts");
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
      if(!resolved.startsWith(path.resolve(root)+path.sep)&&resolved!==path.join(root,"index.html")){
        res.writeHead(403);res.end("forbidden");return;
      }
      if(!fs.existsSync(resolved)||!fs.statSync(resolved).isFile()){
        res.writeHead(404);res.end("not found");return;
      }
      res.writeHead(200,{"content-type":contentType(resolved),"cache-control":"no-store"});
      fs.createReadStream(resolved).pipe(res);
    }catch(error){res.writeHead(500);res.end(String(error));}
  });
}
function listen(server){return new Promise((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",()=>resolve(server.address()));});}
function close(server){return new Promise((resolve)=>server.close(()=>resolve()));}
async function chooseAncestor(page,ancestorId){
  const search=page.locator("#ancestor-scoped-pullback-ancestor-search");
  await search.fill(ancestorId);
  await page.getByRole("option",{name:ancestorId,exact:true}).click();
}

async function bridgeState(page){
  return page.evaluate(()=>{
    const state=window.Thread31HybridScopedBridgeState;
    return {
      context:state.contextMode,
      thread26Mode:state.thread26.thread26RepresentationMode,
      structuralRequested:state.independentDepths.structuralRequestedDepth,
      structuralMaterialized:state.independentDepths.structuralMaterializedDepth,
      structuralSelected:state.independentDepths.structuralSelectedDepth,
      globalDepth:state.independentDepths.globalGeometricDepth,
      scopedRequested:state.independentDepths.scopedRequestedDepth,
      scopedMaterialized:state.independentDepths.scopedMaterializedDepth,
      controlAncestor:state.scoped.controlAncestorId,
      materializedAncestor:state.scoped.materializedAncestorId,
      scopedPointCount:state.scoped.pointCount,
      scopedGenerationTriggered:state.navigationProvenance.scopedGenerationTriggered,
      automaticDepthSynchronization:state.correspondence.contextNavigation.automaticDepthSynchronization,
      stageCorrespondenceClass:state.correspondence.canonicalStageIndex.class,
      stageCorrespondenceSupported:state.correspondence.canonicalStageIndex.supported,
      forbiddenIdentityClass:state.correspondence.forbiddenIdentity.class,
      sheetsMaterialized:state.truthFlags.sheetsMaterialized,
      coveringStructureClaimed:state.truthFlags.coveringStructureClaimed,
      geometricZoomApplied:state.truthFlags.geometricZoomApplied,
      lastAction:state.navigationProvenance.lastAction
    };
  });
}

(async()=>{
  const consoleErrors=[],pageErrors=[];
  const server=createStaticServer(),address=await listen(server);
  const baseUrl="http://127.0.0.1:"+String(address.port)+"/";
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1200},colorScheme:"light"});
  const page=await context.newPage();
  page.on("console",(message)=>{if(message.type()==="error")consoleErrors.push(message.text());});
  page.on("pageerror",(error)=>pageErrors.push(error.message));
  let evidence;
  try{
    const response=await page.goto(baseUrl,{waitUntil:"networkidle"});
    assert.ok(response&&response.ok());
    await page.waitForFunction(()=>document.querySelector("#hybrid-navigation")?.dataset.state==="ready",null,{timeout:30000});
    await page.waitForFunction(()=>document.querySelector("#ancestor-scoped-pullback-status")?.dataset.state==="ready",null,{timeout:30000});
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.state==="ready",null,{timeout:30000});
    await page.locator('[data-ui-mode="expert"]').click();
    await page.locator("#expert-workbench").waitFor({state:"visible"});

    const scopedViz="#ancestor-scoped-pullback-visualization";
    let initial=await bridgeState(page);
    assert.equal(initial.context,"structural");
    assert.equal(initial.thread26Mode,"structural");
    assert.equal(initial.structuralRequested,0);
    assert.equal(initial.structuralMaterialized,0);
    assert.equal(initial.structuralSelected,0);
    assert.equal(initial.globalDepth,1);
    assert.equal(initial.scopedRequested,3);
    assert.equal(initial.scopedMaterialized,null);
    assert.equal(initial.scopedPointCount,0);
    assert.equal(initial.scopedGenerationTriggered,false);
    assert.equal(initial.automaticDepthSynchronization,false);
    assert.equal(initial.stageCorrespondenceClass,"A_canonical_mathematical_correspondence");
    assert.equal(initial.stageCorrespondenceSupported,true);
    assert.equal(initial.forbiddenIdentityClass,"D_unsupported_forbidden_correspondence");
    assert.equal(initial.sheetsMaterialized,false);
    assert.equal(initial.coveringStructureClaimed,false);
    assert.equal(initial.geometricZoomApplied,false);
    assert.equal(await page.locator(scopedViz+" .geometric-pullback-mark").count(),0);
    assert.equal(await page.locator("#geometric-pullback-visualization .geometric-pullback-mark").count(),8192);

    await page.click('[data-thread31-context="global-geometric"]');
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.contextMode==="global-geometric");
    let current=await bridgeState(page);
    assert.equal(current.thread26Mode,"geometric");
    assert.equal(current.globalDepth,1);
    assert.equal(current.structuralRequested,0);
    assert.equal(current.scopedMaterialized,null);

    await page.click('[data-thread31-context="scoped-geometric"]');
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.contextMode==="scoped-geometric");
    current=await bridgeState(page);
    assert.equal(current.thread26Mode,"geometric","Entering scoped context must not rewrite the existing Thread 26 mode.");
    assert.equal(current.scopedMaterialized,null);
    assert.equal(await page.locator(scopedViz+" .geometric-pullback-mark").count(),0,"Entering scoped context must not generate geometry.");
    const noHiddenGeneration=await page.evaluate(()=>window.Thread30AncestorScopedVisualizationState.scopedState===null);
    assert.equal(noHiddenGeneration,true);

    const [ancestor0,ancestor1]=await page.evaluate(()=>window.Thread30AncestorScopedVisualizationState.sampleModel.samples.slice(0,2).map((sample)=>sample.sampleId));
    assert.ok(ancestor0&&ancestor1&&ancestor0!==ancestor1);
    await chooseAncestor(page,ancestor0);
    await page.selectOption("#ancestor-scoped-pullback-depth","2");
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.scopedRequestedDepth==="2");
    current=await bridgeState(page);
    assert.equal(current.scopedRequested,2);
    assert.equal(current.scopedMaterialized,null);
    assert.equal(await page.locator(scopedViz+" .geometric-pullback-mark").count(),0);

    await page.click("#ancestor-scoped-pullback-render");
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.scopedMaterializedDepth==="2",null,{timeout:30000});
    current=await bridgeState(page);
    assert.equal(current.context,"scoped-geometric");
    assert.equal(current.scopedRequested,2);
    assert.equal(current.scopedMaterialized,2);
    assert.equal(current.scopedPointCount,256);
    assert.equal(current.materializedAncestor,ancestor0);
    assert.equal(current.structuralRequested,0);
    assert.equal(current.globalDepth,1);
    assert.equal(await page.locator(scopedViz+" .geometric-pullback-mark").count(),256);

    await chooseAncestor(page,ancestor1);
    await page.selectOption("#ancestor-scoped-pullback-depth","3");
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.scopedRequestedDepth==="3");
    current=await bridgeState(page);
    assert.equal(current.scopedRequested,3);
    assert.equal(current.scopedMaterialized,2,"Control changes must not rewrite the last materialized scoped depth.");
    assert.equal(current.controlAncestor,ancestor1);
    assert.equal(current.materializedAncestor,ancestor0);
    assert.equal(await page.locator(scopedViz+" .geometric-pullback-mark").count(),256);

    const expand=page.locator('[data-interaction-action="expand-or-reveal"]');
    await expand.click();
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.structuralMaterializedDepth==="1");
    await expand.click();
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.structuralMaterializedDepth==="2");
    await page.locator('[data-interaction-action="select"][data-depth="2"]').click();
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.structuralSelectedDepth==="2");
    current=await bridgeState(page);
    assert.equal(current.structuralRequested,2);
    assert.equal(current.structuralMaterialized,2);
    assert.equal(current.structuralSelected,2);
    assert.equal(current.globalDepth,1);
    assert.equal(current.scopedMaterialized,2);
    assert.equal(current.scopedRequested,3);
    assert.equal(current.stageCorrespondenceClass,"D_unsupported_forbidden_correspondence");
    assert.equal(current.stageCorrespondenceSupported,false);
    assert.ok((await page.locator('[data-thread31-field="correspondence"]').textContent()).includes("Class D"));

    await page.click('[data-thread31-context="global-geometric"]');
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.contextMode==="global-geometric");
    await page.selectOption("#geometric-pullback-depth","0");
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.globalGeometricDepth==="0");
    current=await bridgeState(page);
    assert.equal(current.thread26Mode,"geometric");
    assert.equal(current.structuralRequested,2);
    assert.equal(current.globalDepth,0);
    assert.equal(current.scopedMaterialized,2);
    assert.equal(current.scopedRequested,3);
    assert.equal(current.stageCorrespondenceClass,"D_unsupported_forbidden_correspondence");
    assert.equal(current.stageCorrespondenceSupported,false);
    assert.ok((await page.locator('[data-thread31-field="correspondence"]').textContent()).includes("Class D"));
    assert.equal(await page.locator(scopedViz+" .geometric-pullback-mark").count(),256);

    await page.click('[data-thread31-context="scoped-geometric"]');
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.contextMode==="scoped-geometric");
    current=await bridgeState(page);
    assert.equal(current.structuralRequested,2);
    assert.equal(current.globalDepth,0);
    assert.equal(current.scopedMaterialized,2);
    assert.equal(await page.locator(scopedViz+" .geometric-pullback-mark").count(),256);

    await page.click('[data-thread31-context="structural"]');
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.contextMode==="structural");
    current=await bridgeState(page);
    assert.equal(current.thread26Mode,"structural");
    assert.equal(current.structuralRequested,2);
    assert.equal(current.globalDepth,0);
    assert.equal(current.scopedMaterialized,2);

    await page.click('[data-thread31-context="global-geometric"]');
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.contextMode==="global-geometric");
    await page.click('[data-thread31-context="scoped-geometric"]');
    await page.waitForFunction(()=>document.querySelector("#hybrid-scoped-bridge")?.dataset.contextMode==="scoped-geometric");
    const backNavigation=await bridgeState(page);
    assert.equal(backNavigation.structuralRequested,2);
    assert.equal(backNavigation.globalDepth,0);
    assert.equal(backNavigation.scopedMaterialized,2);
    assert.equal(backNavigation.scopedGenerationTriggered,false);
    assert.equal(await page.locator(scopedViz+" .geometric-pullback-mark").count(),256);

    assert.equal(await page.locator('[data-thread31-panel="scoped-geometric"][data-thread31-active="true"]').count(),1);
    assert.equal(await page.locator('[data-thread31-panel="global-geometric"][data-thread31-active="true"]').count(),0);
    assert.equal(await page.locator('[data-thread31-panel="structural"][data-thread31-active="true"]').count(),0);
    assert.equal(await page.locator('#ancestor-scoped-pullback[data-hybrid-panel]').count(),0);

    const screenshot="hybrid-global-scoped-thread31-chromium.png";
    await page.screenshot({path:path.join(artifactDir,screenshot),fullPage:true});
    assert.deepEqual(consoleErrors,[]);
    assert.deepEqual(pageErrors,[]);

    evidence={
      schemaVersion:1,
      evidenceKind:"thread31_hybrid_global_scoped_navigation_browser",
      candidate:{commit:process.env.GITHUB_SHA||git(["rev-parse","HEAD"]),tree:git(["rev-parse","HEAD^{tree}"])},
      browser:{engine:"chromium",version:browser.version()},
      initialState:initial,
      finalState:backNavigation,
      exercised:{
        explicitStructuralContext:true,
        explicitGlobalGeometricContext:true,
        explicitScopedGeometricContext:true,
        scopedEntryWithoutGeneration:true,
        explicitThread30ScopedGeneration:true,
        independentStructuralDepthChange:true,
        independentGlobalDepthChange:true,
        requestedVsMaterializedScopedDepth:true,
        backNavigation:true
      },
      scopedCanonical:{materializedDepth:2,pointCount:256,materializedAncestor:ancestor0,controlAncestorAfterChange:ancestor1},
      truthFlags:{sheetsMaterialized:false,coveringStructureClaimed:false,geometricZoomApplied:false},
      consoleErrors,pageErrors,screenshot,pass:true
    };
  }finally{
    await context.close();await browser.close();await close(server);
    if(evidence) fs.writeFileSync(path.join(artifactDir,"thread31-browser-evidence.json"),JSON.stringify(evidence,null,2)+"\n","utf8");
  }
  console.log("Thread 31 Hybrid Global / Scoped Navigation browser verification: passed");
  console.log("structural/global/scoped contexts switch explicitly without hidden scoped generation");
  console.log("structural, global-geometric, and scoped-geometric depths remained independent");
  console.log("back-navigation preserved scoped materialized depth and global/structural state");
})().catch((error)=>{console.error(error);process.exitCode=1;});

"use strict";

const fs=require("node:fs");
const path=require("node:path");
const http=require("node:http");
const childProcess=require("node:child_process");
const assert=require("node:assert/strict");
const {chromium}=require("playwright");

const root=__dirname;
const artifactDir=path.join(root,"thread25-browser-artifacts");
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
async function snapshot(page){
  return page.locator(".geometric-pullback-mark").evaluateAll((marks)=>marks.map((mark)=>({
    id:mark.getAttribute("data-source-point-id"),
    parent:mark.getAttribute("data-parent-id"),
    ancestor:mark.getAttribute("data-ancestor-x0-sample-id"),
    depth:mark.getAttribute("data-geometric-depth"),
    root:mark.getAttribute("data-root-multi-index"),
    x:mark.getAttribute("data-semantic-x"),
    y:mark.getAttribute("data-semantic-y"),
    overlap:mark.getAttribute("data-projected-overlap-count")
  })));
}

(async()=>{
  const consoleErrors=[],pageErrors=[];
  const server=createStaticServer(), address=await listen(server);
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
    await page.waitForFunction(()=>document.querySelector("#base-geometric-status")?.dataset.state==="ready",null,{timeout:20000});
    await page.waitForFunction(()=>document.querySelector("#geometric-pullback-status")?.dataset.state==="ready",null,{timeout:20000});
    await page.locator('[data-ui-mode="expert"]').click();
    await page.locator("#expert-workbench").waitFor({state:"visible"});

    assert.equal(await page.locator("#structural-visualization").isVisible(),true);
    assert.equal(await page.locator("#base-geometric-visualization").isVisible(),true);
    assert.equal(await page.locator("#geometric-pullback-visualization").isVisible(),true);
    assert.equal(await page.locator("svg.geometric-pullback-renderer__surface").count(),1);

    const truth=await page.locator("#geometric-pullback-visualization").evaluate((el)=>({
      state:el.dataset.state,geometryRendered:el.dataset.geometryRendered,pullbackGeometryRendered:el.dataset.pullbackGeometryRendered,
      renderedGeometricDepth:el.dataset.renderedGeometricDepth,sheetsMaterialized:el.dataset.sheetsMaterialized,
      coveringStructureClaimed:el.dataset.coveringStructureClaimed,geometricZoomApplied:el.dataset.geometricZoomApplied,
      sourceObject:el.dataset.sourceObject,viewId:el.dataset.viewId,markCount:el.dataset.markCount,
      rendererTechnology:el.dataset.rendererTechnology,fallbackUsed:el.dataset.fallbackUsed
    }));
    assert.deepEqual(truth,{
      state:"ready",geometryRendered:"true",pullbackGeometryRendered:"true",renderedGeometricDepth:"1",
      sheetsMaterialized:"false",coveringStructureClaimed:"false",geometricZoomApplied:"false",sourceObject:"X_1",
      viewId:"xn_z1_complex_plane_sampled_pullback_projection_v1",markCount:truth.markCount,rendererTechnology:"svg",fallbackUsed:"false"
    });

    const modelSummary=await page.evaluate(()=>({
      sourceSeedCount:window.Thread25GeometricPullbackState.sceneModel.sourceSeedCount,
      D:window.Thread25GeometricPullbackState.scene.mathematics.parameters.D,
      fiberCardinality:window.Thread25GeometricPullbackState.sceneModel.levels[1].fiberCardinality,
      pointCount:window.Thread25GeometricPullbackState.sceneModel.levels[1].pointCount,
      maxPowerResidual:window.Thread25GeometricPullbackState.sceneModel.levels[1].maxPowerResidualMagnitude,
      maxBaseMembershipResidual:window.Thread25GeometricPullbackState.sceneModel.levels[1].maxBaseMembershipResidualMagnitude,
      cap:window.Thread25GeometricPullbackState.pullbackConfig.materialization.maxGeneratedPoints
    }));
    assert.equal(modelSummary.fiberCardinality,modelSummary.D**4);
    assert.equal(modelSummary.pointCount,modelSummary.sourceSeedCount*modelSummary.fiberCardinality);
    assert.equal(Number(truth.markCount),modelSummary.pointCount);
    assert.ok(modelSummary.pointCount>0);

    const marks=await page.locator(".geometric-pullback-mark").count();
    assert.equal(marks,modelSummary.pointCount);
    assert.equal(await page.locator('.geometric-pullback-mark[data-parent-id=""]').count(),0);
    assert.equal(await page.locator('.geometric-pullback-mark[data-ancestor-x0-sample-id=""]').count(),0);
    assert.equal(await page.locator('.geometric-pullback-mark[data-root-multi-index=""]').count(),0);

    const firstSnapshot=await snapshot(page);

    await page.selectOption("#geometric-pullback-depth","0");
    await page.waitForFunction(()=>document.querySelector("#geometric-pullback-visualization")?.dataset.renderedGeometricDepth==="0");
    assert.equal(await page.locator(".geometric-pullback-mark").count(),modelSummary.sourceSeedCount);
    assert.equal(await page.locator("#geometric-pullback-visualization").getAttribute("data-source-object"),"X_0");
    assert.equal(await page.locator("#geometric-pullback-visualization").getAttribute("data-pullback-geometry-rendered"),"false");

    await page.selectOption("#geometric-pullback-depth","1");
    await page.waitForFunction(()=>document.querySelector("#geometric-pullback-visualization")?.dataset.renderedGeometricDepth==="1");
    assert.equal(await page.locator(".geometric-pullback-mark").count(),modelSummary.pointCount);

    const structuralTruth=await page.locator("#structural-camera").evaluate((el)=>({
      geometryRendered:el.dataset.geometryRendered,sheetsMaterialized:el.dataset.sheetsMaterialized,
      coveringStructureClaimed:el.dataset.coveringStructureClaimed,geometricZoomApplied:el.dataset.geometricZoomApplied
    }));
    assert.deepEqual(structuralTruth,{geometryRendered:"false",sheetsMaterialized:"false",coveringStructureClaimed:"false",geometricZoomApplied:"false"});

    await page.reload({waitUntil:"networkidle"});
    await page.waitForFunction(()=>document.querySelector("#geometric-pullback-status")?.dataset.state==="ready",null,{timeout:20000});
    const secondSnapshot=await snapshot(page);
    assert.deepEqual(secondSnapshot,firstSnapshot,"Canonical Thread 25 pullback scene metadata must be deterministic across reloads.");

    const screenshot="geometric-pullback-thread25-chromium.png";
    await page.screenshot({path:path.join(artifactDir,screenshot),fullPage:true});
    assert.deepEqual(consoleErrors,[]);
    assert.deepEqual(pageErrors,[]);

    evidence={
      schemaVersion:1,evidenceKind:"thread25_geometric_pullback_browser",
      candidate:{commit:process.env.GITHUB_SHA||git(["rev-parse","HEAD"]),tree:git(["rev-parse","HEAD^{tree}"])},
      browser:{engine:"chromium",version:browser.version()},
      geometricTruth:truth,modelSummary,deterministicReload:true,consoleErrors,pageErrors,screenshot,pass:true
    };
  }finally{
    await context.close();await browser.close();await close(server);
    if(evidence)fs.writeFileSync(path.join(artifactDir,"thread25-browser-evidence.json"),JSON.stringify(evidence,null,2)+"\n","utf8");
  }
  console.log("Thread 25 Geometric Pullback browser verification: passed");
  console.log("canonical X_1 rendered marks: "+String(evidence.modelSummary.pointCount));
  console.log("geometryRendered=true; pullbackGeometryRendered=true; sheets/covering/geometric zoom=false");
})().catch((error)=>{console.error(error);process.exitCode=1;});

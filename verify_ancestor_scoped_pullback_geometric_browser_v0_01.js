"use strict";

const fs=require("node:fs");
const path=require("node:path");
const http=require("node:http");
const childProcess=require("node:child_process");
const assert=require("node:assert/strict");
const {chromium}=require("playwright");

const root=__dirname;
const artifactDir=path.join(root,"thread30-browser-artifacts");
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
    await page.waitForFunction(()=>document.querySelector("#geometric-pullback-status")?.dataset.state==="ready",null,{timeout:30000});
    await page.waitForFunction(()=>document.querySelector("#ancestor-scoped-pullback-status")?.dataset.state==="ready",null,{timeout:30000});

    const scoped="#ancestor-scoped-pullback-visualization";
    assert.equal(await page.locator(scoped+" .geometric-pullback-mark").count(),0);
    assert.equal(await page.locator(scoped+" svg").count(),0);
    assert.equal(await page.locator("#ancestor-scoped-pullback-ancestor option").count(),512);
    assert.equal(await page.locator("#ancestor-scoped-pullback-depth option").count(),5);

    const globalBefore=await page.evaluate(()=>({
      depth:window.Thread25GeometricPullbackState.currentDepth,
      globalDepth1:window.Thread25GeometricPullbackState.sceneModel.levels[1].pointCount,
      structuralRequestedDepthConsumed:window.Thread25GeometricPullbackState.sceneModel.structuralRequestedDepthConsumed
    }));
    assert.deepEqual(globalBefore,{depth:1,globalDepth1:8192,structuralRequestedDepthConsumed:false});
    assert.equal(await page.locator("#geometric-pullback-visualization .geometric-pullback-mark").count(),8192);

    const ancestor0=await page.locator("#ancestor-scoped-pullback-ancestor option").nth(0).getAttribute("value");
    const ancestor1=await page.locator("#ancestor-scoped-pullback-ancestor option").nth(1).getAttribute("value");
    assert.ok(ancestor0&&ancestor1&&ancestor0!==ancestor1);

    await page.selectOption("#ancestor-scoped-pullback-depth","0");
    await page.selectOption("#ancestor-scoped-pullback-ancestor",ancestor0);
    assert.equal(await page.locator(scoped+" .geometric-pullback-mark").count(),0,"selector changes alone must not generate scoped geometry");

    const counts={};
    for(const [depth,expected] of [[0,1],[1,16],[2,256],[3,4096]]){
      await page.selectOption("#ancestor-scoped-pullback-depth",String(depth));
      await page.click("#ancestor-scoped-pullback-render");
      await page.waitForFunction(
        ({depth})=>document.querySelector("#ancestor-scoped-pullback-visualization")?.dataset.state==="ready" &&
          document.querySelector("#ancestor-scoped-pullback-visualization")?.dataset.requestedScopedDepth===String(depth),
        {depth},{timeout:30000}
      );
      const markCount=await page.locator(scoped+" .geometric-pullback-mark").count();
      assert.equal(markCount,expected);
      counts["depth"+String(depth)]=markCount;
      assert.equal(await page.locator(scoped).getAttribute("data-scope-complete"),"true");
      assert.equal(await page.locator(scoped).getAttribute("data-global-completeness-claim"),"false");
      assert.equal(await page.locator(scoped).getAttribute("data-over-cap-rejected"),"false");
      assert.equal(await page.locator(scoped).getAttribute("data-selected-ancestor-id"),ancestor0);
      assert.equal(await page.locator("#ancestor-scoped-pullback-selected").textContent(),ancestor0);
      assert.equal(await page.locator(scoped+" svg").getAttribute("aria-labelledby"),"ancestor-scoped-pullback-label");
    }

    const firstMark=page.locator(scoped+" .geometric-pullback-mark").first();
    const firstAttrs=await firstMark.evaluate((el)=>({
      point:el.getAttribute("data-source-point-id"),
      ancestor:el.getAttribute("data-ancestor-x0-sample-id"),
      parent:el.getAttribute("data-parent-id"),
      root:el.getAttribute("data-root-multi-index"),
      overlap:el.getAttribute("data-projected-overlap-count")
    }));
    assert.equal(firstAttrs.ancestor,ancestor0);
    assert.ok(firstAttrs.point);
    assert.ok(firstAttrs.parent);
    assert.ok(firstAttrs.root);
    assert.ok(Number(firstAttrs.overlap)>=1);
    assert.equal(await page.locator('[data-scoped-inspector-field="point"]').textContent(),firstAttrs.point);
    assert.equal(await page.locator('[data-scoped-inspector-field="ancestor"]').textContent(),ancestor0);
    assert.equal(await page.locator('[data-scoped-inspector-field="parent"]').textContent(),firstAttrs.parent);
    assert.equal(await page.locator('[data-scoped-inspector-field="root"]').textContent(),firstAttrs.root);
    assert.equal(await page.locator('[data-scoped-inspector-field="overlap"]').textContent(),firstAttrs.overlap);

    await page.selectOption("#ancestor-scoped-pullback-ancestor",ancestor1);
    await page.selectOption("#ancestor-scoped-pullback-depth","1");
    assert.equal(await page.locator(scoped+" .geometric-pullback-mark").count(),4096,"changing controls must preserve the last explicit render until the next render action");
    assert.equal(await page.locator(scoped).getAttribute("data-selected-ancestor-id"),ancestor0);
    await page.click("#ancestor-scoped-pullback-render");
    await page.waitForFunction(
      ({ancestor1})=>document.querySelector("#ancestor-scoped-pullback-visualization")?.dataset.selectedAncestorId===ancestor1 &&
        document.querySelector("#ancestor-scoped-pullback-visualization")?.dataset.requestedScopedDepth==="1",
      {ancestor1},{timeout:30000}
    );
    assert.equal(await page.locator(scoped+" .geometric-pullback-mark").count(),16);

    await page.selectOption("#ancestor-scoped-pullback-ancestor",ancestor0);
    await page.selectOption("#ancestor-scoped-pullback-depth","4");
    await page.click("#ancestor-scoped-pullback-render");
    await page.waitForFunction(()=>document.querySelector("#ancestor-scoped-pullback-visualization")?.dataset.state==="over-cap",null,{timeout:30000});
    assert.equal(await page.locator(scoped+" .geometric-pullback-mark").count(),0);
    assert.equal(await page.locator(scoped+" svg").count(),0);
    assert.equal(await page.locator(scoped).getAttribute("data-over-cap-rejected"),"true");
    assert.equal(await page.locator(scoped).getAttribute("data-geometry-rendered"),"false");
    assert.equal(await page.locator(scoped).getAttribute("data-mark-count"),"0");
    assert.equal(await page.locator(scoped).getAttribute("data-required-point-count"),"65536");
    const refusal=await page.locator("#ancestor-scoped-pullback-status").textContent();
    assert.ok(refusal.includes("65536"));
    assert.ok(refusal.includes("10000"));
    assert.ok(refusal.includes("zero partial marks"));

    const globalAfter=await page.evaluate(()=>({
      depth:window.Thread25GeometricPullbackState.currentDepth,
      globalDepth1:window.Thread25GeometricPullbackState.sceneModel.levels[1].pointCount,
      structuralRequestedDepthConsumed:window.Thread25GeometricPullbackState.sceneModel.structuralRequestedDepthConsumed
    }));
    assert.deepEqual(globalAfter,globalBefore);
    assert.equal(await page.locator("#geometric-pullback-visualization .geometric-pullback-mark").count(),8192);

    const screenshot="ancestor-scoped-geometric-thread30-chromium.png";
    await page.screenshot({path:path.join(artifactDir,screenshot),fullPage:true});
    assert.deepEqual(consoleErrors,[]);
    assert.deepEqual(pageErrors,[]);

    evidence={
      schemaVersion:1,
      evidenceKind:"thread30_ancestor_scoped_geometric_visualization_browser",
      candidate:{commit:process.env.GITHUB_SHA||git(["rev-parse","HEAD"]),tree:git(["rev-parse","HEAD^{tree}"])},
      browser:{engine:"chromium",version:browser.version()},
      ancestor0,ancestor1,counts,
      overCap:{depth:4,requiredPointCount:65536,cap:10000,zeroPartialMarks:true},
      globalThread25Before:globalBefore,
      globalThread25After:globalAfter,
      consoleErrors,pageErrors,screenshot,pass:true
    };
  }finally{
    await context.close();await browser.close();await close(server);
    if(evidence)fs.writeFileSync(path.join(artifactDir,"thread30-browser-evidence.json"),JSON.stringify(evidence,null,2)+"\n","utf8");
  }
  console.log("Thread 30 ancestor-scoped geometric browser verification: passed");
  console.log("scoped marks: depth 0/1/2/3 = 1/16/256/4096");
  console.log("depth 4 refused at 65536 > 10000 with zero partial marks");
  console.log("global Thread 25 remains independent at 8192 depth-1 marks");
})().catch((error)=>{console.error(error);process.exitCode=1;});

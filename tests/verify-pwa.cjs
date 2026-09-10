"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const project=path.join(__dirname,"..");
const source=fs.readFileSync(path.join(project,"service-worker.js"),"utf8");
const tests=[],reports=[];
const test=(name,fn)=>tests.push({name,fn});
const key=value=>typeof value==="string"?value:value.url;

function worker(scope="https://example.test/Multipuls/"){
  const entries=new Map(),handlers={},requests=[];
  const runtime={entries,requests,skipped:0,claimed:0,failPut:false};
  runtime.network=async request=>{
    const url=new URL(key(request));const relative=url.pathname.slice(new URL(scope).pathname.length);
    const file=path.join(project,relative||"index.html");
    return fs.existsSync(file)?new Response(fs.readFileSync(file),{status:200}):new Response("missing",{status:404});
  };
  async function open(name){
    if(!entries.has(name))entries.set(name,new Map());
    const data=entries.get(name);
    return{
      match:async request=>data.get(key(request))?.clone(),
      put:async(request,response)=>{if(runtime.failPut)throw Error("quota");data.set(key(request),response.clone());},
      addAll:async requests=>{
        const responses=await Promise.all(requests.map(async request=>{const response=await runtime.fetch(request);if(!response.ok)throw Error("Precache failed");return response;}));
        requests.forEach((request,index)=>data.set(key(request),responses[index].clone()));
      }
    };
  }
  runtime.fetch=async(request,options)=>{requests.push({url:key(request),options,cache:request.cache});return runtime.network(request,options);};
  const self={registration:{scope},addEventListener:(type,fn)=>handlers[type]=fn,skipWaiting:async()=>runtime.skipped++,clients:{claim:async()=>runtime.claimed++}};
  const context=vm.createContext({self,caches:{open,keys:async()=>[...entries.keys()],delete:async name=>entries.delete(name)},fetch:runtime.fetch,Request,Response,URL,Set,Promise});
  vm.runInContext(source,context);runtime.constants=vm.runInContext("({CACHE,PREFIX,ENTRY,ROOT,ASSETS,VERSION})",context);
  runtime.dispatch=async(type,request)=>{
    const waits=[];let response;
    handlers[type]({request,waitUntil:promise=>waits.push(promise),respondWith:promise=>response=promise});
    const result=await response;await Promise.all(waits);return result;
  };
  runtime.navigate=url=>runtime.dispatch("fetch",{url,method:"GET",mode:"navigate"});
  runtime.asset=url=>runtime.dispatch("fetch",{url,method:"GET",mode:"cors"});
  runtime.put=async(url,text)=>{const cache=await open(runtime.constants.CACHE);await cache.put(url,new Response(text));};
  runtime.cached=async url=>(await (await open(runtime.constants.CACHE)).match(url))?.text();
  return runtime;
}

test("PWA 01 · Every shipped script and manifest parses; HTML dependencies exist at repo root",()=>{
  for(const name of ["app.js","storage.js","share.js","pwa.js","service-worker.js"])new vm.Script(fs.readFileSync(path.join(project,name),"utf8"));
  const html=fs.readFileSync(path.join(project,"index.html"),"utf8");assert(html.includes("<small>v3.4</small>"));
  for(const [,attribute,url] of html.matchAll(/\b(href|src)="([^"]+)"/g)){
    assert(url.startsWith("./"),attribute+" must be project-relative: "+url);
    const relative=new URL(url,"https://example.test/Multipuls/").pathname.slice("/Multipuls/".length);assert(fs.existsSync(path.join(project,relative)),url);
  }
  const scriptOrder=[...html.matchAll(/<script defer src="([^"]+)"/g)].map(match=>match[1]);assert.deepEqual(scriptOrder,["./storage.js?v=3.4","./app.js?v=3.4","./share.js?v=3.4","./pwa.js?v=3.4"]);
});
test("PWA 02 · Manifest has a distinct identity, valid install icons and in-scope launch paths",()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(project,"manifest.webmanifest"),"utf8"));assert.equal(manifest.display,"standalone");assert.equal(manifest.id,"/multipuls");
  for(const base of ["https://example.test/Multipuls/","https://example.test/renamed/nested/","https://example.test/"]){
    const start=new URL(manifest.start_url,base+"manifest.webmanifest"),scope=new URL(manifest.scope,base+"manifest.webmanifest");assert(start.href.startsWith(scope.href));assert.equal(start.search,"?v=3.4");
  }
  assert.deepEqual(manifest.icons.map(icon=>icon.sizes),["192x192","512x512"]);
  for(const size of [180,192,512]){const data=fs.readFileSync(path.join(project,`icons/icon-${size}.png`));assert.equal(data.readUInt32BE(16),size);assert.equal(data.readUInt32BE(20),size);}
  const styles=fs.readFileSync(path.join(project,"styles.css"),"utf8");assert(styles.includes("safe-area-inset-bottom"));assert(!/position\s*:\s*fixed|\b\d+(?:d|s|l)?vh\b/i.test(styles));
});
test("PWA 03 · First installation precaches all required files with fresh requests",async()=>{
  const w=worker();await w.dispatch("install");assert.equal(w.skipped,1);assert.equal(w.entries.get(w.constants.CACHE).size,11);assert(w.requests.every(request=>request.cache==="reload"));
  assert((await w.cached(w.constants.ENTRY)).includes("<small>v3.4</small>"));
});
test("PWA 04 · HTML navigation is network-first and saves a successful new response",async()=>{
  const w=worker();await w.put(w.constants.ENTRY,"old");w.network=async()=>new Response("new");
  const response=await w.navigate(w.constants.ROOT+"?v=3.4");assert.equal(await response.text(),"new");assert.equal(w.requests[0].options.cache,"no-store");assert.equal(await w.cached(w.constants.ENTRY),"new");
});
test("PWA 05 · Offline root and versioned launches use the cached HTML and static assets",async()=>{
  const w=worker();await w.dispatch("install");w.network=async()=>{throw Error("offline");};
  for(const url of [w.constants.ROOT,w.constants.ROOT+"?v=3",w.constants.ROOT+"?v=3.1",w.constants.ROOT+"?v=3.2",w.constants.ROOT+"?v=3.4",w.constants.ENTRY]){const response=await w.navigate(url);assert.equal(response.status,200);assert((await response.text()).includes("Multipuls"));}
  const count=w.requests.length;for(const url of w.constants.ASSETS.filter(url=>url!==w.constants.ENTRY)){const response=await w.asset(url);assert.equal(response.status,200);}assert.equal(w.requests.length,count);
});
test("PWA 06 · Server errors cannot replace a working offline page",async()=>{
  const w=worker();await w.put(w.constants.ENTRY,"working");w.network=async()=>new Response("broken",{status:503});
  const response=await w.navigate(w.constants.ROOT);assert.equal(await response.text(),"working");assert.equal(await w.cached(w.constants.ENTRY),"working");
});
test("PWA 07 · Activation deletes only older Multipuls caches within this app path",async()=>{
  const w=worker();const old=w.constants.PREFIX+"v3.2",other="multipuls:/Other/:v2";
  for(const name of [old,other,"nottraining-v15",w.constants.CACHE])w.entries.set(name,new Map());
  await w.dispatch("activate");assert(!w.entries.has(old));assert(w.entries.has(other));assert(w.entries.has("nottraining-v15"));assert(w.entries.has(w.constants.CACHE));assert.equal(w.claimed,1);
});
test("PWA 08 · Foreign URLs, other app paths, unknown routes and POST requests are untouched",async()=>{
  const w=worker();
  for(const request of [{url:"https://other.test/app.js",method:"GET",mode:"cors"},{url:"https://example.test/Nottraining/",method:"GET",mode:"navigate"},{url:w.constants.ROOT+"missing",method:"GET",mode:"navigate"},{url:w.constants.ENTRY,method:"POST",mode:"navigate"}])assert.equal(await w.dispatch("fetch",request),undefined);
  assert.equal(w.requests.length,0);
});
test("PWA 09 · Versioned script URLs have distinct cache entries during updates",async()=>{
  const w=worker();await w.dispatch("install");const previous=new URL("app.js?v=3.4",w.constants.ROOT).href,next=new URL("app.js?v=4",w.constants.ROOT).href;
  const old=await w.cached(previous);w.network=async()=>new Response("new-version-script");assert.equal(await (await w.asset(next)).text(),"new-version-script");assert.equal(await w.cached(previous),old);assert.equal(await w.cached(next),"new-version-script");
});
test("PWA 10 · Failed installation does not activate or delete the older cache",async()=>{
  const w=worker(),old=w.constants.PREFIX+"v3.2";w.entries.set(old,new Map());w.network=async()=>new Response("missing",{status:404});
  await assert.rejects(w.dispatch("install"));assert.equal(w.skipped,0);assert(w.entries.has(old));
});
test("PWA 11 · Cache-write failure still delivers the successful network page",async()=>{
  const w=worker();w.failPut=true;w.network=async()=>new Response("live");assert.equal(await (await w.navigate(w.constants.ROOT)).text(),"live");
});
test("PWA 12 · Cache and precache URLs follow the registered project subdirectory",async()=>{
  const w=worker("https://example.test/another/project/");assert(w.constants.ASSETS.every(url=>url.startsWith("https://example.test/another/project/")));assert.equal(w.constants.CACHE,"multipuls:/another/project/:v3.4");await w.dispatch("install");assert.equal(w.skipped,1);
});
test("PWA 13 · Dark page and startup hints agree with the existing theme and safe-area layout",()=>{
  const html=fs.readFileSync(path.join(project,"index.html"),"utf8"),styles=fs.readFileSync(path.join(project,"styles.css"),"utf8"),manifest=JSON.parse(fs.readFileSync(path.join(project,"manifest.webmanifest"),"utf8"));
  assert(html.includes('<meta name="color-scheme" content="dark">'));assert(html.indexOf('name="color-scheme"')<html.indexOf('rel="stylesheet"'));
  assert(html.includes('<meta name="theme-color" content="#111c1e">'));assert.equal(manifest.theme_color,"#111c1e");assert.equal(manifest.background_color,"#111c1e");
  assert.match(styles,/html\s*\{[^}]*background:\s*#111c1e/);assert.match(styles,/body\s*\{[^}]*background:\s*#111c1e/);
  assert(html.includes("viewport-fit=cover"));assert(styles.includes("safe-area-inset-bottom"));
});

(async()=>{
  for(const {name,fn} of tests){try{await fn();reports.push({name,status:"PASS"});}catch(error){reports.push({name,status:"FAIL",message:error.stack});}}
  for(const report of reports)console.log(report.status+" "+report.name+(report.message?"\n"+report.message:""));
  fs.writeFileSync(path.join(__dirname,"pwa-results.json"),JSON.stringify({version:"v3.4",method:"Static release checks and deterministic service-worker event tests with real Response/Request objects and in-memory Cache/Fetch doubles. No browser or network execution.",tests:reports},null,2));
  const failed=reports.filter(report=>report.status==="FAIL").length;console.log(`${reports.length-failed}/${reports.length} passed`);if(failed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});

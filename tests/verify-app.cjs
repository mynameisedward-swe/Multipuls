"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const cp=require("node:child_process");
const path=require("node:path");
const project=path.join(__dirname,"..");
const fragmentPath=path.join(project,"index.html");
const html=fs.readFileSync(fragmentPath,"utf8");
const source=fs.readFileSync(path.join(project,"app.js"),"utf8");
const styles=fs.readFileSync(path.join(project,"styles.css"),"utf8");
const core={module:{exports:{}}};
vm.runInNewContext(source,core);
const {Training,SafeClock,createPairs,pairWeight,choosePair,normalizeConfig,DEFAULTS,I18N,LANGUAGE_NAMES,detectLanguage}=core.module.exports;
const reports=[];
function test(name,fn) { try {fn(); reports.push({name,status:"PASS"});} catch(error) {reports.push({name,status:"FAIL",message:error.stack});} }
const asyncTests=[];
function asyncTest(name,fn){asyncTests.push({name,fn});}

// Deterministic scheduler. Archived callbacks let tests reproduce the browser's
// hardest race: a callback already queued before cancellation.
class FakeTime {
  constructor(){this.time=0;this.sequence=0;this.tasks=new Map();this.archive=[];}
  now=()=>this.time;
  schedule=(fn,delay,repeat)=>{const id=++this.sequence;this.tasks.set(id,{id,fn,due:this.time+delay,repeat});this.archive.push(fn);return id;};
  setTimeout=(fn,delay)=>this.schedule(fn,delay,0);
  setInterval=(fn,delay)=>this.schedule(fn,delay,delay);
  clearTimeout=id=>this.tasks.delete(id);
  clearInterval=id=>this.tasks.delete(id);
  advance(duration){
    const end=this.time+duration;let calls=0;
    while(true){
      const next=[...this.tasks.values()].filter(task=>task.due<=end).sort((a,b)=>a.due-b.due||a.id-b.id)[0];
      if(!next)break;
      if(++calls>100000)throw Error("Scheduler runaway");
      this.time=next.due;
      if(next.repeat)next.due+=next.repeat;else this.tasks.delete(next.id);
      next.fn();
    }
    this.time=end;
  }
}

// Minimal DOM test double, parsed from the exact delivered markup. These are
// interaction tests, not a substitute for a browser layout or iOS test.
const markup=JSON.parse(cp.execFileSync("python3",[path.join(__dirname,"parse-markup.py"),fragmentPath],{encoding:"utf8"}));
class Element {
  constructor(tag,attrs={},document){this.tagName=tag.toUpperCase();this.attributes={...attrs};this.ownerDocument=document;this.children=[];this.parentElement=null;this.listeners={};this.dataset={};this.style={};this.hidden=Object.hasOwn(attrs,"hidden");this.disabled=Object.hasOwn(attrs,"disabled");this.value=attrs.value||"";this._text="";for(const [key,value]of Object.entries(attrs))if(key.startsWith("data-"))this.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value;}
  get id(){return this.attributes.id||"";}
  set lang(value){this.attributes.lang=value;}
  get lang(){return this.attributes.lang;}
  get isConnected(){return this===this.ownerDocument.root||Boolean(this.parentElement?.isConnected);}
  get textContent(){return this._text+this.children.map(child=>child.textContent).join("");}
  set textContent(value){this.replaceChildren();this._text=String(value);}
  set className(value){this.attributes.class=value;}
  get className(){return this.attributes.class||"";}
  get firstElementChild(){return this.children[0]||null;}
  setAttribute(key,value){this.attributes[key]=String(value);}
  getAttribute(key){return this.attributes[key]??null;}
  append(...nodes){for(const node of nodes){node.parentElement=this;this.children.push(node);}}
  replaceChildren(...nodes){for(const node of this.children)node.parentElement=null;this.children=[];this._text="";this.append(...nodes);}
  find(predicate){if(predicate(this))return this;for(const child of this.children){const found=child.find(predicate);if(found)return found;}return null;}
  querySelector(selector){const match=selector.match(/^\[data-ui="([^"]+)"\]$/);if(!match)throw Error("Unsupported selector: "+selector);return this.find(node=>node.dataset.ui===match[1]);}
  querySelectorAll(selector){const match=selector.match(/^\[([^=\]]+)\]$/);if(!match)throw Error("Unsupported selector: "+selector);const nodes=[];function walk(node){if(Object.hasOwn(node.attributes,match[1]))nodes.push(node);node.children.forEach(walk);}this.children.forEach(walk);return nodes;}
  contains(node){return this===node||this.children.some(child=>child.contains(node));}
  closest(tag){return this.tagName===tag.toUpperCase()?this:this.parentElement?.closest(tag)||null;}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
  dispatch(type,props={}){const event={type,target:this,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...props};for(const fn of this.listeners[type]||[]){const result=fn(event);if(result&&typeof result.then==="function")this.ownerDocument.pending.push(result);}return event;}
  click(){if(this.disabled)return;for(let node=this;node;node=node.parentElement)if(node.hidden)throw Error("Attempted click in hidden content");this.ownerDocument.activeElement=this;this.dispatch("click");}
  focus(){this.ownerDocument.activeElement=this;}
  select(){this.selectionStart=0;this.selectionEnd=String(this.value).length;}
}
function makeApp(languages=["sv-SE"],shareAdapter=null,store=null,web=null){
  const time=new FakeTime();const doc={visibilityState:"visible",listeners:{},activeElement:null,pending:[]};
  doc.addEventListener=(type,fn)=>(doc.listeners[type]??=[]).push(fn);
  doc.emit=(type,props={})=>{const event={target:doc.activeElement||doc.root,preventDefault(){this.defaultPrevented=true;},...props};for(const fn of doc.listeners[type]||[])fn(event);return event;};
  doc.createElement=tag=>new Element(tag,{},doc);
  function build(node){const element=new Element(node.tag,node.attrs,doc);element._text=node.text||"";element.append(...node.children.map(build));return element;}
  doc.root=build(markup);doc.getElementById=id=>doc.root.find(node=>node.id===id);
  if(shareAdapter)doc.getElementById("multipuls-v3").shareMultipulsLink=shareAdapter;
  if(store)doc.getElementById("multipuls-v3").multipulsStore=store;
  const window={listeners:{},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}};
  if(web){window.location=new URL(web.href);window.localStorage=web.storage;}
  const math=Object.create(Math);let seed=12345;math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const context={document:doc,window,navigator:{languages,...(web?.navigator||{})},performance:{now:time.now},setTimeout:time.setTimeout,setInterval:time.setInterval,clearTimeout:time.clearTimeout,clearInterval:time.clearInterval,Math:math,URL};
  if(web)vm.runInNewContext(fs.readFileSync(path.join(project,"storage.js"),"utf8"),context);
  vm.runInNewContext(source,context,{timeout:5000});
  if(web)for(const name of ["share.js","pwa.js"])vm.runInNewContext(fs.readFileSync(path.join(project,name),"utf8"),context);
  const get=name=>doc.root.querySelector('[data-ui="'+name+'"]');
  const key=name=>get("keypad").children.find(button=>button.dataset.key===String(name));
  const expected=()=>{const children=get("equation").children;return Number(children[0].textContent)*Number(children[2].textContent);};
  const pairKey=()=>{const children=get("equation").children;return [Number(children[0].textContent),Number(children[2].textContent)].sort((a,b)=>a-b).join(":");};
  const answer=(value=expected(),responseMs=100)=>{time.advance(responseMs);for(const digit of String(value))key(digit).click();key("submit").click();};
  const emitWindow=(type,props={})=>(window.listeners[type]||[]).forEach(fn=>fn(props));
  const flush=async()=>{while(doc.pending.length)await Promise.all(doc.pending.splice(0));};
  return{time,doc,get,key,expected,answer,pairKey,emitWindow,flush};
}

function assertPausedView(app){
  const language=app.doc.getElementById("multipuls-v3").lang;
  assert(!app.get("game").hidden);assert(!app.get("play").hidden);
  assert(!app.get("start").hidden);assert.equal(app.get("start").textContent,I18N[language].resume);
  assert(app.get("feedback").hidden);assert(app.get("pause").hidden);assert(app.get("results").hidden);
  assert.equal(app.get("question-label").textContent,I18N[language].ready);
  assert.equal(app.get("answer").textContent,"?");assert(app.get("keypad").children.every(button=>button.disabled));
  assert.equal(app.get("question-card").dataset.result,"");assert.equal(app.get("question-card").dataset.urgent,"false");
  assert.equal(app.get("timer-fill").style.transform,"scaleX(1)");assert.equal(app.time.tasks.size,0);
}

test("V2.1 · Pause reuses the starting screen and button; only the action label changes",()=>{
  const app=makeApp();const start=app.get("start"),card=app.get("question-card"),keys=[...app.get("keypad").children];
  const appearance=()=>({label:app.get("question-label").textContent,answer:app.get("answer").textContent,
    time:app.get("time-label").textContent,fill:app.get("timer-fill").style.transform,
    playHidden:app.get("play").hidden,feedbackHidden:app.get("feedback").hidden,pauseHidden:app.get("pause").hidden,
    actionHidden:start.hidden,actionClass:start.className,parentClass:start.parentElement.className,
    result:card.dataset.result,urgent:card.dataset.urgent,disabled:keys.map(key=>key.disabled)});
  assert.equal(start.textContent,"Börja spela →");const ready=appearance();
  start.click();app.answer();app.time.advance(800);app.time.advance(4700);app.key(7).click();app.get("pause").click();
  assertPausedView(app);assert.deepEqual(appearance(),ready);
  assert.equal(app.get("start"),start);assert.equal(app.get("question-card"),card);
  assert.deepEqual(app.get("keypad").children,keys);assert.equal(start.textContent,"Fortsätt spela →");
  assert.equal(app.get("streak").textContent,"1");assert.equal(app.get("accuracy").textContent,"100%");
  app.time.advance(60000);app.key(2).click();assert.deepEqual(appearance(),ready);
  start.click();assert(start.hidden);assert.equal(app.get("time-label").textContent,"6,0 s");
  assert(!app.key(2).disabled);app.answer();assert.equal(app.get("streak").textContent,"2");
});

test("01 · All ten tables; 55 canonical pairs and 100 presentations",()=>{
  const pairs=createPairs(DEFAULTS.tables);assert.equal(pairs.length,55);assert.equal(pairs.reduce((n,p)=>n+p.variants.length,0),100);
  const app=makeApp();assert.equal(app.get("tables").children.length,10);
  assert.deepEqual(app.get("tables").children.map(button=>Number(button.dataset.table)),[1,2,3,4,5,6,7,8,9,10]);
});
test("02 · Defaults are tables 1–10, Normal 6 s, mastery 3",()=>{
  const app=makeApp();assert(app.get("tables").children.every(button=>button.getAttribute("aria-pressed")==="true"));
  assert.equal(app.get("time-label").textContent,"6,0 s");assert.equal(app.get("total").textContent,"55");
  assert.equal(app.get("pair-progress").children.length,3);assert.equal(app.time.tasks.size,0);
});
test("03 · Ten digits + backspace + submit; three-digit cap; no premature submission",()=>{
  const app=makeApp();assert.equal(app.get("keypad").children.length,12);assert.equal(app.get("keypad").children.filter(button=>/^\d$/.test(button.dataset.key)).length,10);
  app.get("start").click();assert(app.key("submit").disabled);
  for(const digit of "1234")app.key(digit).click();assert.equal(app.get("answer").textContent,"123");
  app.key("backspace").click();assert.equal(app.get("answer").textContent,"12");
  assert.equal(app.get("streak").textContent,"0");assert.equal(app.get("question-card").dataset.result,"");
});
test("04 · Settings discard unanswered question, keep all scores, and require Continue",()=>{
  const app=makeApp();app.get("start").click();app.answer();app.time.advance(800);const previous=app.pairKey();app.time.advance(2300);app.key(4).click();
  app.get("settings-toggle").click();assert(!app.get("settings").hidden);assert(app.get("game").hidden);assert.equal(app.time.tasks.size,0);
  app.time.advance(20000);app.get("close-settings").click();assert(app.get("settings").hidden);assert.equal(app.time.tasks.size,0);
  assertPausedView(app);assert.equal(app.get("streak").textContent,"1");assert.equal(app.get("accuracy").textContent,"100%");assert.equal(app.get("answer").textContent,"?");
  app.time.advance(20000);assert.equal(app.time.tasks.size,0);app.get("start").click();assert.notEqual(app.pairKey(),previous);assert.equal(app.get("time-label").textContent,"6,0 s");
  app.time.advance(5999);assert.equal(app.get("question-card").dataset.result,"");app.time.advance(1);assert.equal(app.get("question-card").dataset.result,"timeout");
});
test("05 · Table choices, 6–9 preset, all, and presentation order respect selection",()=>{
  const app=makeApp();app.get("settings-toggle").click();const seven=app.get("tables").children[6];seven.click();assert.equal(seven.getAttribute("aria-pressed"),"false");seven.click();assert.equal(seven.getAttribute("aria-pressed"),"true");
  app.get("select-hard").click();assert.equal(app.get("selection-count").textContent,"34 unika par");
  app.get("back-settings").click();assert.equal(app.get("total").textContent,"34");app.get("start").click();
  assert([6,7,8,9].includes(Number(app.get("equation").children[0].textContent)));
  app.get("settings-toggle").click();app.get("select-all").click();assert.equal(app.get("selection-count").textContent,"55 unika par");
  const onlySeven=createPairs([7]);assert.equal(onlySeven.length,10);assert(onlySeven.every(p=>p.variants.every(v=>v[0]===7)));
});
test("06 · Last active table cannot be removed; invalid empty configuration rejected",()=>{
  const app=makeApp();app.get("settings-toggle").click();for(const button of app.get("tables").children.slice(1))button.click();
  app.get("tables").children[0].click();assert.equal(app.get("tables").children[0].getAttribute("aria-pressed"),"true");assert(!app.get("table-error").hidden);
  assert.throws(()=>normalizeConfig({...DEFAULTS,tables:[]}));app.get("close-settings").click();assert.equal(app.get("total").textContent,"10");
});
test("07 · Correct answer scores once; input locks during green feedback",()=>{
  const app=makeApp();app.get("start").click();app.answer();assert.equal(app.get("feedback-title").textContent,"✓ RÄTT!");assert.equal(app.get("accuracy").textContent,"100%");assert.equal(app.get("streak").textContent,"1");
  app.key("submit").click();assert.equal(app.get("streak").textContent,"1");assert(app.get("keypad").children.every(button=>button.disabled));
  const previous=app.get("equation").textContent;app.time.advance(800);assert.notEqual(app.get("equation").textContent,previous);
});
test("08 · Wrong answer shows red + correction; updates accuracy and resets global streak",()=>{
  const app=makeApp();app.get("start").click();app.answer();app.time.advance(800);const expected=app.expected();app.answer(0);
  assert.equal(app.get("question-card").dataset.result,"wrong");assert.equal(app.get("feedback-detail").textContent,"Rätt svar: "+expected);
  assert.equal(app.get("accuracy").textContent,"50%");assert.equal(app.get("streak").textContent,"0");
});
test("09 · Timeout is wrong once, reveals answer, and advances after 1050 ms",()=>{
  const app=makeApp();app.get("start").click();const expected=app.expected();app.time.advance(6000);
  assert.equal(app.get("question-card").dataset.result,"timeout");assert.equal(app.get("accuracy").textContent,"0%");assert(app.get("feedback-detail").textContent.endsWith("= "+expected));
  app.time.advance(1049);assert.equal(app.get("question-card").dataset.result,"timeout");app.time.advance(1);assert.equal(app.get("question-card").dataset.result,"");assert.equal(app.get("time-label").textContent,"6,0 s");
});
test("10 · Three consecutive correct answers master a pair; intervening error resets it",()=>{
  const training=new Training();training.pairs=createPairs([7]).filter(pair=>pair.key==="7:8");
  function score(correct){const q=training.next();return training.score(q.id,correct?q.a*q.b:0,350);}
  score(true);score(true);assert.equal(training.pairs[0].streak,2);score(false);assert.equal(training.pairs[0].streak,0);assert(!training.complete);
  score(true);score(true);const result=score(true);assert(result.newlyMastered);assert(training.complete);assert.equal(training.next(),null);
});
test("11 · Weighted draw favours frequent/recent errors and subtly favours slow answers",()=>{
  const pairs=createPairs([7]);const hard=pairs[0],known=pairs[1];
  Object.assign(hard,{wrong:5,correct:1,lastWrongTurn:12,lastSeenTurn:12,responseTimes:[5000]});
  Object.assign(known,{correct:2,streak:2,lastSeenTurn:12,responseTimes:[500]});
  assert(pairWeight(hard,12,3,6000)>3*pairWeight(known,12,3,6000));
  assert(pairWeight({...known,responseTimes:[5000]},12,3,6000)>pairWeight(known,12,3,6000));
  let seed=83;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);let hardCount=0;
  for(let i=0;i<20000;i++)if(choosePair([hard,known],null,12,3,6000,random)===hard)hardCount++;
  assert(hardCount>16000);assert.equal(choosePair([hard,known],hard.key,12,3,6000,random).key,known.key);
});
test("12 · Cancelled and already-queued timers cannot score a subsequent question",()=>{
  const app=makeApp();app.get("start").click();const stale=[...app.time.archive];app.answer();app.time.advance(800);
  const equation=app.get("equation").textContent;const accuracy=app.get("accuracy").textContent;stale.forEach(callback=>callback());
  assert.equal(app.get("equation").textContent,equation);assert.equal(app.get("accuracy").textContent,accuracy);assert.equal(app.get("question-card").dataset.result,"");
  app.time.advance(5900);assert.equal(app.get("question-card").dataset.result,"");app.time.advance(100);assert.equal(app.get("question-card").dataset.result,"timeout");
});
test("13 · Reset clears the round and all timers; old callbacks remain inert",()=>{
  const app=makeApp();app.get("start").click();app.answer();const stale=[...app.time.archive];app.get("settings-toggle").click();app.get("reset").click();
  assert.equal(app.time.tasks.size,0);assert.equal(app.get("streak").textContent,"0");assert.equal(app.get("accuracy").textContent,"—");assert.equal(app.get("mastered").textContent,"0");assert(!app.get("start").hidden);
  stale.forEach(callback=>callback());app.time.advance(20000);assert.equal(app.get("accuracy").textContent,"—");assert.equal(app.time.tasks.size,0);
});
test("14 · Full default round: all 55 mastered after 165 correct; result metrics and replay",()=>{
  const app=makeApp();app.get("start").click();let count=0;
  while(app.get("results").hidden){
    if(++count>165)throw Error("Round failed to finish");app.answer(undefined,100);
    app.time.advance(app.get("feedback-detail").textContent.includes("bemästrad")?1000:800);
  }
  assert.equal(count,165);assert.equal(app.get("mastered").textContent,"55");assert.equal(app.get("result-questions").textContent,"165");assert.equal(app.get("result-wrong").textContent,"0");assert.equal(app.get("result-time").textContent,"0,1 s");assert.equal(app.time.tasks.size,0);
  app.get("replay").click();assert(app.get("results").hidden);assert.equal(app.get("mastered").textContent,"0");assert.equal(app.time.tasks.size,2);
});
test("15 · Every requested DOM reference and accessible ID resolves",()=>{
  const app=makeApp();const ids=new Set();function walk(node){if(node.id){assert(!ids.has(node.id));ids.add(node.id);}for(const child of node.children)walk(child);}walk(app.doc.root);
  function check(node){for(const name of ["for","aria-controls","aria-labelledby","aria-describedby"]){const id=node.getAttribute(name);if(id)for(const part of id.split(" "))assert(ids.has(part),"Missing target "+part);}for(const child of node.children)check(child);}check(app.doc.root);
});
test("16 · JavaScript parses; real page uses local files and no fixed or viewport-height layout",()=>{
  new vm.Script(source);assert(html.startsWith("<!doctype html>"));
  assert(!/\b(localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest|WebSocket)\b|navigator\.(share|clipboard|sendBeacon)/.test(source));
  assert(!/position\s*:\s*fixed|\b\d+(?:d|s|l)?vh\b/i.test(styles+source));
  assert(html.includes('./manifest.webmanifest?v=3.1"'));assert(html.includes('./app.js?v=3.1"'));
});
test("Additional · No time limit, keyboard digits/backspace/Enter, one-digit and 100 answers",()=>{
  const app=makeApp();app.get("settings-toggle").click();app.get("difficulty").value="none";app.get("difficulty").dispatch("change");app.get("back-settings").click();app.get("start").click();assert.equal(app.get("time-label").textContent,"∞");assert.equal(app.time.tasks.size,0);
  app.time.advance(60000);assert.equal(app.get("question-card").dataset.result,"");
  app.key(1).focus();app.doc.emit("keydown",{key:"9"});app.doc.emit("keydown",{key:"Backspace"});assert.equal(app.get("answer").textContent,"?");
  for(const digit of String(app.expected()))app.doc.emit("keydown",{key:digit});app.doc.emit("keydown",{key:"Enter"});assert.equal(app.get("accuracy").textContent,"100%");
  for(const factors of [[1,1],[10,10]]){const t=new Training();t.pairs=createPairs([factors[0]]).filter(p=>p.a===factors[0]&&p.b===factors[1]);const q=t.next();assert(t.score(q.id,factors[0]*factors[1],100).correct);}
});
test("Additional · Settings during feedback preserves scored answer; changed goal keeps scores",()=>{
  const app=makeApp();app.get("start").click();app.answer();app.time.advance(300);const previous=app.pairKey();
  app.get("settings-toggle").click();app.time.advance(10000);app.get("back-settings").click();assert.equal(app.time.tasks.size,0);assert.equal(app.get("accuracy").textContent,"100%");
  app.get("start").click();assert.notEqual(app.pairKey(),previous);
  app.get("settings-toggle").click();app.get("goals").children[3].click();app.get("close-settings").click();assert.equal(app.get("pair-progress").children.length,5);assert.equal(app.get("accuracy").textContent,"100%");
});
test("Additional · Hidden page pauses until explicit resume; skipped time is excluded",()=>{
  const app=makeApp();app.get("start").click();const previous=app.pairKey();app.time.advance(1250);app.doc.visibilityState="hidden";app.doc.emit("visibilitychange");assert.equal(app.time.tasks.size,0);
  app.time.advance(10000);app.doc.visibilityState="visible";app.doc.emit("visibilitychange");assert.equal(app.time.tasks.size,0);assertPausedView(app);
  app.get("start").click();assert.notEqual(app.pairKey(),previous);assert.equal(app.get("time-label").textContent,"6,0 s");app.answer(undefined,250);assert.equal(app.get("accuracy").textContent,"100%");
});
test("Additional · SafeClock clearTimeout and clearInterval; old feedback callback inert",()=>{
  const time=new FakeTime();const clock=new SafeClock(time);const results=[];
  clock.start(500,()=>results.push("old"));const stale=[...time.archive];time.advance(100);assert.equal(clock.pause(),400);assert.equal(time.tasks.size,0);
  clock.start(1000,()=>results.push("new"));stale.forEach(fn=>fn());time.advance(999);assert.equal(results.length,0);time.advance(1);assert.deepEqual(results,["new"]);assert.equal(time.tasks.size,0);
});
test("Additional · Stale score after reset rejected; question IDs never reused",()=>{
  const training=new Training();const old=training.next();training.reset();const current=training.next();assert.notEqual(old.id,current.id);assert.equal(training.score(old.id,old.a*old.b,100),null);assert.equal(training.stats.questions,0);
});

test("V2 · Manual pause discards partial input without changing attempts, streak or mastery",()=>{
  const app=makeApp();app.get("start").click();app.answer();app.time.advance(800);const old=app.pairKey();
  app.key(7).click();const stale=[...app.time.archive];app.get("pause").click();
  assertPausedView(app);assert.equal(app.get("answer").textContent,"?");assert.equal(app.get("accuracy").textContent,"100%");assert.equal(app.get("streak").textContent,"1");
  app.time.advance(120000);stale.forEach(fn=>fn());assert.equal(app.time.tasks.size,0);assert.equal(app.get("streak").textContent,"1");
  app.get("start").click();assert.notEqual(app.pairKey(),old);assert.equal(app.get("time-label").textContent,"6,0 s");
  stale.forEach(fn=>fn());assert.equal(app.get("question-card").dataset.result,"");app.answer();assert.equal(app.get("streak").textContent,"2");
});
test("V2 · Pausing during feedback keeps the result but kills the next-question callback",()=>{
  const app=makeApp();app.get("start").click();app.answer(0);const stale=[...app.time.archive];app.get("pause").click();
  assert.equal(app.get("accuracy").textContent,"0%");app.time.advance(10000);stale.forEach(fn=>fn());assert.equal(app.time.tasks.size,0);
  app.get("start").click();assert.equal(app.get("time-label").textContent,"6,0 s");assert.equal(app.get("accuracy").textContent,"0%");app.answer();assert.equal(app.get("accuracy").textContent,"50%");
});
test("V2 · Pausing the final feedback still opens complete results exactly once",()=>{
  const app=makeApp();app.get("start").click();
  for(let i=0;i<164;i++){app.answer();app.time.advance(app.get("feedback-detail").textContent.includes("bemästrad")?1000:800);}
  app.answer();assert.equal(app.get("mastered").textContent,"55");app.get("pause").click();assert.equal(app.get("start").textContent,"Fortsätt spela →");
  app.get("start").click();assert(!app.get("results").hidden);assert.equal(app.get("result-questions").textContent,"165");assert.equal(app.time.tasks.size,0);
});
test("V2 · Hidden document is detected even if a timeout callback runs before visibilitychange",()=>{
  const app=makeApp();app.get("start").click();app.time.advance(5990);app.doc.visibilityState="hidden";app.time.advance(10);
  assertPausedView(app);assert.equal(app.get("accuracy").textContent,"—");assert.equal(app.time.tasks.size,0);
  app.doc.visibilityState="visible";app.doc.emit("visibilitychange");app.emitWindow("focus");assert.equal(app.time.tasks.size,0);
});
test("V2 · blur/pagehide/pageshow preserve chosen settings and never auto-resume",()=>{
  const app=makeApp();app.get("settings-toggle").click();app.get("select-hard").click();app.get("difficulty").value="expert";app.get("difficulty").dispatch("change");app.get("language").value="en";app.get("language").dispatch("change");
  app.emitWindow("pagehide");app.time.advance(12000);app.emitWindow("pageshow",{persisted:true});assert.equal(app.get("language").value,"en");assert.equal(app.get("difficulty").value,"expert");assert.equal(app.get("selection-count").textContent,"34 unique pairs");
  app.get("close-settings").click();app.get("start").click();app.answer();app.time.advance(800);app.emitWindow("blur");assert.equal(app.time.tasks.size,0);
  app.emitWindow("focus");app.emitWindow("pageshow",{persisted:true});assert.equal(app.time.tasks.size,0);assert.equal(app.get("streak").textContent,"1");
  app.get("start").click();assert.equal(app.get("time-label").textContent,"2.5 s");
});
test("V2 · Table/time/mastery changes keep per-pair history, attempts and response times",()=>{
  const training=new Training({...DEFAULTS,tables:[7]});let q=training.next();training.score(q.id,q.a*q.b,275);const key=q.pair.key;
  const stats=JSON.stringify(training.stats);training.reconfigure({...training.config,tables:[1],difficulty:"expert",goal:5});
  training.reconfigure({...training.config,tables:[7]});const restored=training.pairs.find(pair=>pair.key===key);
  assert.equal(restored.correct,1);assert.equal(restored.streak,1);assert.equal(restored.responseTimes[0],275);assert.equal(JSON.stringify(training.stats),stats);
  assert(training.pairs.every(pair=>pair.variants.every(v=>v[0]===7)));
  restored.streak=3;training.reconfigure({...training.config,goal:3});assert(restored.mastered);training.reconfigure({...training.config,goal:4});assert(!restored.mastered);assert.equal(restored.streak,3);
});
test("V2 · All 13 reference languages have matching keys and placeholder sets",()=>{
  assert.equal(Object.keys(LANGUAGE_NAMES).length,13);const keys=Object.keys(I18N.en).sort();
  for(const language of Object.keys(LANGUAGE_NAMES)){
    assert.deepEqual(Object.keys(I18N[language]).sort(),keys);
    for(const key of keys){assert(I18N[language][key].length>0);const params=s=>[...s.matchAll(/\{([^}]+)\}/g)].map(m=>m[1]).sort();assert.deepEqual(params(I18N[language][key]),params(I18N.en[key]),language+":"+key);}
  }
  assert.equal(detectLanguage(["xx-XX","sv-SE"]),"sv");assert.equal(detectLanguage(["fr-FR"]),"fr");assert.equal(detectLanguage(["xx"]),"en");
});
test("V2 · Every language updates the actual controls and preserves round statistics",()=>{
  const app=makeApp();app.get("start").click();app.answer();app.get("settings-toggle").click();
  assert.equal(app.get("language").children.length,13);
  for(const language of Object.keys(LANGUAGE_NAMES)){
    app.get("language").value=language;app.get("language").dispatch("change");
    assert.equal(app.doc.getElementById("multipuls-v3").lang,language);assert.equal(app.get("settings-toggle").getAttribute("aria-label"),I18N[language].settings);
    assert.equal(app.get("share-toggle").getAttribute("aria-label"),I18N[language].share);assert.equal(app.get("streak").textContent,"1");assert.equal(app.time.tasks.size,0);
  }
  app.get("back-settings").click();assert.equal(app.get("start").textContent,I18N.zh.resume);app.get("start").click();app.answer();assert.equal(app.get("accuracy").textContent,"100%");
});
test("V2.2 · App Block keeps the game visible and explains native-sharing availability",()=>{
  const app=makeApp();app.get("start").click();app.answer();app.time.advance(800);app.get("share-toggle").click();
  assert.equal(app.get("share"),null);assert.equal(app.get("share-text"),null);assertPausedView(app);
  assert.equal(app.get("share-notice").textContent,I18N.sv.sharePreview);assert(!app.get("share-notice").hidden);
  assert(app.get("share-link").hidden);assert.equal(app.get("streak").textContent,"1");
  app.get("start").click();app.answer();assert.equal(app.get("streak").textContent,"2");
});
test("V2.2 · Settings toggles and sharing return to the same paused game without a submenu",()=>{
  const app=makeApp();app.get("start").click();app.doc.emit("keydown",{key:"Escape"});assertPausedView(app);
  app.get("settings-toggle").click();app.get("settings-toggle").click();assert(app.get("settings").hidden);
  app.get("settings-toggle").click();app.get("share-toggle").click();assert(app.get("settings").hidden);assert.equal(app.get("share"),null);
  app.doc.emit("keydown",{key:"Escape"});assertPausedView(app);assert.equal(app.time.tasks.size,0);
});
test("V2 · Reset keeps language and practice settings; old callbacks cannot resurrect the round",()=>{
  const app=makeApp();app.get("start").click();app.answer();const stale=[...app.time.archive];app.get("settings-toggle").click();
  app.get("language").value="de";app.get("language").dispatch("change");app.get("select-hard").click();app.get("reset").click();
  stale.forEach(fn=>fn());app.time.advance(20000);assert.equal(app.get("accuracy").textContent,"—");assert.equal(app.get("total").textContent,"34");assert.equal(app.get("start").textContent,I18N.de.start);assert.equal(app.time.tasks.size,0);
});
test("V2 · More mastery required after completion returns to Continue with the existing record",()=>{
  const app=makeApp();app.get("start").click();
  for(let i=0;i<165;i++){app.answer();app.time.advance(app.get("feedback-detail").textContent.includes("bemästrad")?1000:800);}
  app.get("settings-toggle").click();app.get("goals").children[3].click();app.get("close-settings").click();assertPausedView(app);assert.equal(app.get("accuracy").textContent,"100%");assert.equal(app.get("streak").textContent,"165");
  app.get("start").click();app.answer();assert.equal(app.get("streak").textContent,"166");
});
test("V3 · Header uses the frameless X asset and keeps its existing dimensions",()=>{
  const app=makeApp();const icon=app.get("app-icon");assert.equal(icon.tagName,"IMG");
  const src=icon.getAttribute("src");assert.equal(src,"./assets/header-x-192.png");
  assert(fs.existsSync(path.join(project,src)));
  assert.equal(icon.getAttribute("width"),"42");assert.equal(icon.getAttribute("height"),"42");
  assert.equal(icon.getAttribute("alt"),"");assert(Buffer.byteLength(html)<1000000);
});

const {appLink,createLinkSharer}=require("../share.js");
const page={href:"https://example.test/Multipuls/index.html?v=2.2#result"};
const link="https://example.test/Multipuls/";
test("V2.2 · Published link uses the current app address, excluding query, hash and index filename",()=>{
  assert.equal(appLink(page.href),link);assert.equal(appLink("https://example.test/another-app/"),"https://example.test/another-app/");
  for(const href of ["file:///app/index.html","about:srcdoc","not a URL","http://localhost:8000/app/","http://127.0.0.1/app/","https://user:password@example.test/app/"])assert.equal(appLink(href),null);
});
asyncTest("V2.2 · Native share sends exactly the app title and link; never results or settings",async()=>{
  let received;const adapter=createLinkSharer(page,{share:data=>{received=data;return Promise.resolve();}});
  const app=makeApp(["sv-SE"],adapter);app.get("start").click();app.answer();app.time.advance(800);app.get("share-toggle").click();
  assert.deepEqual(received,{title:"Multipuls",url:link});assert(!app.get("game").hidden);assert.equal(app.time.tasks.size,0);
  await app.flush();assertPausedView(app);assert(app.get("share-notice").hidden);assert.equal(app.get("streak").textContent,"1");
});
asyncTest("V2.2 · Pending native share blocks duplicate requests and resume; stale timers stay cancelled",async()=>{
  let resolve,calls=0;const adapter=createLinkSharer(page,{share:()=>{calls++;return new Promise(done=>resolve=done);}});
  const app=makeApp(["sv-SE"],adapter);app.get("start").click();app.time.advance(5000);const stale=[...app.time.archive];app.get("share-toggle").click();
  app.get("share-toggle").click();app.get("start").click();assert.equal(calls,1);assert(app.get("start").disabled);assert.equal(app.time.tasks.size,0);
  stale.forEach(fn=>fn());app.time.advance(120000);assert.equal(app.get("accuracy").textContent,"—");
  resolve();await app.flush();assertPausedView(app);assert(!app.get("start").disabled);app.get("start").click();app.answer();assert.equal(app.get("streak").textContent,"1");
});
asyncTest("V2.2 · Cancelling the native sheet does not copy a link or claim successful sharing",async()=>{
  let copied=false;const adapter=createLinkSharer(page,{share:()=>Promise.reject({name:"AbortError"}),clipboard:{writeText:()=>{copied=true;}}});
  const app=makeApp(["sv-SE"],adapter);app.get("start").click();app.get("share-toggle").click();await app.flush();
  assert(!copied);assert(app.get("share-notice").hidden);assertPausedView(app);
});
asyncTest("V2.2 · Clipboard fallback copies only the link and confirms only after success",async()=>{
  let copied,resolve;const adapter=createLinkSharer(page,{clipboard:{writeText:value=>{copied=value;return new Promise(done=>resolve=done);}}});
  const app=makeApp(["sv-SE"],adapter);app.get("share-toggle").click();assert.equal(copied,link);assert(app.get("share-notice").hidden);
  resolve();await app.flush();assert.equal(app.get("share-notice").textContent,I18N.sv.linkCopied);assert(app.get("share-link").hidden);
});
asyncTest("V2.2 · Unsupported or denied native/clipboard APIs expose only a selectable link",async()=>{
  for(const device of [{},{share:()=>Promise.reject({name:"NotAllowedError"}),clipboard:{writeText:()=>Promise.reject(new Error("denied"))}}]){
    const app=makeApp(["sv-SE"],createLinkSharer(page,device));app.get("share-toggle").click();await app.flush();
    assert.equal(app.get("share-notice").textContent,I18N.sv.copyLink);assert.equal(app.get("share-link").value,link);assert.equal(app.get("share-link").selectionEnd,link.length);
    app.get("share-link").selectionEnd=0;app.get("share-link").click();assert.equal(app.get("share-link").selectionEnd,link.length);assert.equal(app.get("share"),null);
  }
});
asyncTest("V2.2 · Unpublished files cannot share a guessed or preview URL",async()=>{
  let calls=0;const adapter=createLinkSharer({href:"file:///app/index.html"},{share:()=>{calls++;}});
  const app=makeApp(["sv-SE"],adapter);app.get("share-toggle").click();await app.flush();assert.equal(calls,0);
  assert.equal(app.get("share-notice").textContent,I18N.sv.shareUnpublished);assert(app.get("share-link").hidden);
});

const {createStore}=require("../storage.js");
function memoryStorage(){const entries=new Map();return{entries,getItem:key=>entries.has(key)?entries.get(key):null,setItem:(key,value)=>entries.set(key,String(value))};}
const sessionURL="https://example.test/Multipuls/?v=3.1";
function savedApp(memory,language=["sv-SE"]){return makeApp(language,null,createStore(memory,sessionURL));}

test("V3 · Settings survive closing before the first game and do not start a countdown",()=>{
  const memory=memoryStorage(),first=savedApp(memory);first.get("settings-toggle").click();first.get("select-hard").click();
  first.get("difficulty").value="expert";first.get("difficulty").dispatch("change");first.get("language").value="de";first.get("language").dispatch("change");first.get("goals").children[3].click();
  const second=savedApp(memory,["en-US"]);assert.equal(second.get("language").value,"de");assert.equal(second.get("difficulty").value,"expert");assert.equal(second.get("total").textContent,"34");assert.equal(second.get("pair-progress").children.length,5);
  assert.equal(second.get("start").textContent,I18N.de.start);assert.equal(second.time.tasks.size,0);assert(second.get("save-notice").hidden);
});
test("V3 · Hard close during an unanswered question restores scores but skips that question",()=>{
  const memory=memoryStorage(),first=savedApp(memory);first.get("start").click();first.answer();first.time.advance(800);const discarded=first.pairKey();first.time.advance(4800);first.key(7).click();
  const second=savedApp(memory);assertPausedView(second);assert.equal(second.get("streak").textContent,"1");assert.equal(second.get("accuracy").textContent,"100%");
  second.time.advance(60000);assert.equal(second.time.tasks.size,0);second.get("start").click();assert.notEqual(second.pairKey(),discarded);second.answer();assert.equal(second.get("streak").textContent,"2");
  const snapshot=createStore(memory,sessionURL).read();assert.equal(snapshot.training.stats.questions,2);assert.deepEqual(snapshot.training.stats.responseTimes,[100,100]);
});
test("V3 · Feedback is saved immediately; reload cannot lose or double-count a submitted answer",()=>{
  const memory=memoryStorage(),first=savedApp(memory);first.get("start").click();first.answer(0);
  const second=savedApp(memory);assertPausedView(second);assert.equal(second.get("accuracy").textContent,"0%");second.get("start").click();second.answer();
  const saved=createStore(memory,sessionURL).read();assert.equal(saved.training.stats.questions,2);assert.equal(saved.training.stats.wrong,1);assert.equal(saved.training.stats.correct,1);
});
test("V3 · Pair streaks, response times and inactive-table history round-trip faithfully",()=>{
  const training=new Training({...DEFAULTS,tables:[7]});const q=training.next();training.score(q.id,q.a*q.b,432);const key=q.pair.key;
  training.reconfigure({...training.config,tables:[1]});const saved=JSON.parse(JSON.stringify(training.snapshot()));
  const restored=new Training();restored.restore(saved);assert.equal(restored.current,null);assert.deepEqual(JSON.parse(JSON.stringify(restored.snapshot())),saved);
  restored.reconfigure({...restored.config,tables:[7]});const pair=restored.pairs.find(pair=>pair.key===key);assert.equal(pair.correct,1);assert.equal(pair.streak,1);assert.equal(pair.responseTimes[0],432);
});
test("V3 · Full completed round restores the result screen, and replay persists a fresh round",()=>{
  const memory=memoryStorage(),first=savedApp(memory);first.get("start").click();
  for(let i=0;i<165;i++){first.answer();first.time.advance(first.get("feedback-detail").textContent.includes("bemästrad")?1000:800);}
  const second=savedApp(memory);assert(!second.get("results").hidden);assert.equal(second.get("result-questions").textContent,"165");assert.equal(second.time.tasks.size,0);
  second.get("replay").click();const third=savedApp(memory);assertPausedView(third);assert.equal(third.get("mastered").textContent,"0");assert.equal(third.get("accuracy").textContent,"—");
});
test("V3 · Reset removes the previous round while preserving language and practice choices",()=>{
  const memory=memoryStorage(),first=savedApp(memory);first.get("start").click();first.answer();first.get("settings-toggle").click();first.get("select-hard").click();first.get("language").value="fr";first.get("language").dispatch("change");first.get("reset").click();
  const second=savedApp(memory);assert.equal(second.get("total").textContent,"34");assert.equal(second.get("language").value,"fr");assert.equal(second.get("streak").textContent,"0");assert.equal(second.get("start").textContent,I18N.fr.start);
});
test("V3 · Storage exceptions do not break play; an accurate warning appears",()=>{
  for(const store of [createStore(null,sessionURL),createStore({getItem:()=>null,setItem:()=>{throw Error("quota");}},sessionURL)]){
    const app=makeApp(["sv-SE"],null,store);assert(!app.get("save-notice").hidden);assert.equal(app.get("save-notice").textContent,I18N.sv.storageUnavailable);
    app.get("start").click();app.answer();assert.equal(app.get("streak").textContent,"1");
  }
});
test("V3 · Corrupt or future data is preserved until an explicit reset",()=>{
  for(const text of ["{broken",JSON.stringify({schema:99})]){
    const memory=memoryStorage(),store=createStore(memory,sessionURL);memory.setItem(store.key,text);
    const app=makeApp(["sv-SE"],null,store);assert.equal(app.get("save-notice").textContent,I18N.sv.storageInvalid);assert.equal(memory.getItem(store.key),text);
    app.get("settings-toggle").click();app.get("reset").click();assert(app.get("save-notice").hidden);assert.equal(JSON.parse(memory.getItem(store.key)).schema,1);
  }
});
test("V3 · Invalid snapshot counts are rejected atomically without damaging the live training",()=>{
  const training=new Training();const original=JSON.stringify(training.snapshot());const saved=JSON.parse(original);saved.stats.questions=4;
  assert.throws(()=>training.restore(saved));assert.equal(JSON.stringify(training.snapshot()),original);
  const memory=memoryStorage(),store=createStore(memory,sessionURL);store.write({schema:1,phase:"paused",language:"sv",training:saved});
  const app=makeApp(["sv-SE"],null,store);assert.equal(app.get("save-notice").textContent,I18N.sv.storageInvalid);assert.equal(app.get("accuracy").textContent,"—");
});
test("V3 · Session keys are stable across releases and separate applications on the same host",()=>{
  const memory=memoryStorage();const one=createStore(memory,"https://example.test/Multipuls/index.html?v=3#x");const two=createStore(memory,"https://example.test/Multipuls/?v=4");
  const notes=createStore(memory,"https://example.test/Nottraining/");assert.equal(one.key,two.key);assert.notEqual(one.key,notes.key);
  one.write({schema:1,value:7});assert.equal(two.read().value,7);assert.equal(notes.read(),null);
});

test("V3.1 · Tapping the question mark reveals the answer and records one miss, with no mastery credit",()=>{
  const memory=memoryStorage(),app=savedApp(memory),mark=app.get("answer");
  assert.equal(mark.tagName,"BUTTON");assert.equal(mark.getAttribute("type"),"button");assert(mark.disabled);
  app.get("start").click();assert(!mark.disabled);assert.equal(mark.getAttribute("aria-label"),I18N.sv.revealAnswer);
  const expected=app.expected(),key=app.pairKey();app.time.advance(250);mark.click();
  assert.equal(mark.textContent,String(expected));assert(mark.disabled);assert.equal(app.get("feedback-title").textContent,I18N.sv.answerRevealed);
  assert.equal(app.get("feedback-detail").textContent,"Rätt svar: "+expected);assert.equal(app.get("mastered").textContent,"0");
  const saved=createStore(memory,sessionURL).read().training,pair=saved.history.find(pair=>pair.key===key);
  assert.equal(saved.stats.correct,0);assert.equal(saved.stats.wrong,1);assert.equal(saved.stats.questions,1);assert.deepEqual(saved.stats.responseTimes,[250]);
  assert.equal(pair.wrong,1);assert.equal(pair.streak,0);assert(pairWeight(pair,saved.turn,3,6000)>pairWeight({...pair,wrong:0,lastWrongTurn:null},saved.turn,3,6000));
  const reopened=savedApp(memory);assertPausedView(reopened);assert.equal(reopened.get("accuracy").textContent,"0%");
});
function chooseOnly(app,table){
  for(const button of app.get("tables").children)if(Number(button.dataset.table)!==table && button.getAttribute("aria-pressed")==="true")button.click();
}
function changeFactorMode(app,mode){app.get("factor-mode").value=mode;app.get("factor-mode").dispatch("change");}
test("V3.1 · Revealing after two correct answers resets the pair streak instead of mastering it",()=>{
  const memory=memoryStorage(),app=savedApp(memory);app.get("settings-toggle").click();chooseOnly(app,7);changeFactorMode(app,"both");app.get("back-settings").click();
  app.get("start").click();app.answer(49);app.time.advance(800);app.answer(49);app.time.advance(800);app.get("answer").click();
  const saved=createStore(memory,sessionURL).read().training,pair=saved.history.find(pair=>pair.key==="7:7");
  assert.equal(saved.stats.correct,2);assert.equal(saved.stats.wrong,1);assert.equal(saved.stats.streak,0);assert.equal(pair.streak,0);assert.equal(app.get("mastered").textContent,"0");
  app.time.advance(1050);assert(app.get("results").hidden);assert.equal(app.expected(),49);
});
test("V3.1 · Repeated reveals and cancelled question callbacks cannot score twice or affect the next question",()=>{
  const memory=memoryStorage(),app=savedApp(memory);app.get("start").click();const stale=[...app.time.archive];app.time.advance(5950);app.get("answer").click();
  app.get("answer").dispatch("click");stale.forEach(callback=>callback());assert.equal(createStore(memory,sessionURL).read().training.stats.questions,1);
  app.time.advance(1050);const key=app.pairKey();stale.forEach(callback=>callback());
  assert.equal(app.pairKey(),key);assert.equal(app.get("question-card").dataset.result,"");assert.equal(app.get("time-label").textContent,"6,0 s");
  app.answer();assert.equal(createStore(memory,sessionURL).read().training.stats.questions,2);assert.equal(app.get("accuracy").textContent,"50%");
});
test("V3.1 · Reveal is unavailable while entering an answer, paused or in Settings",()=>{
  const memory=memoryStorage(),app=savedApp(memory);app.get("answer").dispatch("click");app.get("start").click();app.key(7).click();
  assert(app.get("answer").disabled);app.get("answer").dispatch("click");assert.equal(app.get("question-card").dataset.result,"");
  app.key("backspace").click();assert(!app.get("answer").disabled);app.get("pause").click();assert(app.get("answer").disabled);app.get("answer").dispatch("click");
  app.get("settings-toggle").click();app.get("answer").dispatch("click");assert.equal(createStore(memory,sessionURL).read().training.stats.questions,0);assert.equal(app.time.tasks.size,0);
});
test("V3.1 · Reveal respects the actual deadline and also works without a time limit",()=>{
  const late=makeApp();late.get("start").click();late.time.time=6000;late.get("answer").click();assert.equal(late.get("question-card").dataset.result,"timeout");assert.equal(late.get("accuracy").textContent,"0%");
  const app=makeApp();app.get("settings-toggle").click();app.get("difficulty").value="none";app.get("difficulty").dispatch("change");app.get("back-settings").click();app.get("start").click();
  const expected=app.expected();app.time.advance(60000);app.get("answer").click();assert.equal(app.get("answer").textContent,String(expected));assert.equal(app.get("feedback-title").textContent,I18N.sv.answerRevealed);
});
test("V3.1 · Combination modes cover the intended pairs and preserve the original default",()=>{
  const selected=[6,7,8,9],any=createPairs(selected),both=createPairs(selected,"both");
  assert.equal(DEFAULTS.factorMode,"any");assert.equal(normalizeConfig({tables:[7],difficulty:"normal",goal:3}).factorMode,"any");
  assert.equal(any.length,34);assert.equal(any.reduce((sum,pair)=>sum+pair.variants.length,0),40);assert(any.some(pair=>pair.key==="1:7"));
  assert.equal(both.length,10);assert.equal(both.reduce((sum,pair)=>sum+pair.variants.length,0),16);assert(both.every(pair=>pair.variants.every(([a,b])=>selected.includes(a)&&selected.includes(b))));
  assert.equal(createPairs([7],"both")[0].key,"7:7");assert.equal(createPairs([7],"both").length,1);assert.equal(createPairs(DEFAULTS.tables,"both").length,55);
  assert.throws(()=>normalizeConfig({...DEFAULTS,factorMode:"invalid"}));
});
test("V3.1 · Settings changes the active pool immediately and every generated question respects it",()=>{
  const app=makeApp();app.get("settings-toggle").click();assert.equal(app.get("factor-mode").value,"any");app.get("select-hard").click();
  assert.equal(app.get("selection-count").textContent,"34 unika par");changeFactorMode(app,"both");assert.equal(app.get("selection-count").textContent,"10 unika par");
  app.get("back-settings").click();app.get("start").click();
  for(let i=0;i<25;i++){const numbers=app.get("equation").children.filter((_,i)=>i!==1).map(element=>Number(element.textContent));assert(numbers.every(n=>[6,7,8,9].includes(n)));app.answer(0);app.time.advance(1050);}
  app.get("settings-toggle").click();changeFactorMode(app,"any");assert.equal(app.get("selection-count").textContent,"34 unika par");assert.equal(app.time.tasks.size,0);
});
test("V3.1 · Switching modes retains history for pairs temporarily excluded from practice",()=>{
  const training=new Training({...DEFAULTS,tables:[7]},()=>0);const q=training.next();assert.equal(q.pair.key,"1:7");training.score(q.id,7,275);
  const before=JSON.stringify(training.stats),pairBefore=JSON.stringify(training.snapshot().history.find(pair=>pair.key==="1:7"));
  training.reconfigure({...training.config,factorMode:"both"});assert.equal(training.pairs.length,1);assert.equal(training.pairs[0].key,"7:7");
  const restored=new Training();restored.restore(JSON.parse(JSON.stringify(training.snapshot())));restored.reconfigure({...restored.config,factorMode:"any"});
  assert.equal(JSON.stringify(restored.stats),before);assert.equal(JSON.stringify(restored.snapshot().history.find(pair=>pair.key==="1:7")),pairBefore);
});
test("V3.1 · The selected mode survives reload and reset along with the existing choices",()=>{
  const memory=memoryStorage(),first=savedApp(memory);first.get("settings-toggle").click();first.get("select-hard").click();changeFactorMode(first,"both");first.get("back-settings").click();first.get("start").click();first.answer();
  const second=savedApp(memory);assertPausedView(second);assert.equal(second.get("factor-mode").value,"both");assert.equal(second.get("total").textContent,"10");assert.equal(second.get("streak").textContent,"1");
  second.get("settings-toggle").click();second.get("reset").click();const third=savedApp(memory);assert.equal(third.get("factor-mode").value,"both");assert.equal(third.get("total").textContent,"10");assert.equal(third.get("accuracy").textContent,"—");
});
test("V3.1 · An actual v3 saved session upgrades without losing settings, statistics or pair history",()=>{
  const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,"fixtures/v3-session.json"),"utf8"));assert(!Object.hasOwn(fixture.training.config,"factorMode"));
  const memory=memoryStorage(),store=createStore(memory,sessionURL);memory.setItem(store.key,JSON.stringify(fixture));const app=savedApp(memory);
  assertPausedView(app);assert(app.get("save-notice").hidden);assert.equal(app.get("factor-mode").value,"any");assert.equal(app.get("total").textContent,"34");assert.equal(app.get("difficulty").value,"hard");
  const upgraded=store.read();assert.deepEqual(upgraded.training.stats,fixture.training.stats);assert.deepEqual(upgraded.training.history,fixture.training.history);assert.equal(upgraded.training.config.factorMode,"any");
  app.get("start").click();app.answer();assert.equal(store.read().training.stats.correct,fixture.training.stats.correct+1);
});
test("V3.1 · Both-selected practice reaches mastery and results with a single selected number",()=>{
  const app=makeApp();app.get("settings-toggle").click();chooseOnly(app,7);changeFactorMode(app,"both");app.get("back-settings").click();app.get("start").click();
  for(let i=0;i<3;i++){assert.equal(app.expected(),49);app.answer(49);app.time.advance(i===2?1000:800);}
  assert(!app.get("results").hidden);assert.equal(app.get("result-questions").textContent,"3");assert.equal(app.get("mastered").textContent,"1");assert.equal(app.time.tasks.size,0);
});
test("V3.1 · Both new controls and feedback are translated in all 13 existing languages",()=>{
  for(const language of Object.keys(LANGUAGE_NAMES)){
    const app=makeApp([language]);app.get("settings-toggle").click();const options=app.get("factor-mode").children;
    assert.equal(options[0].textContent,I18N[language].factorAny);assert.equal(options[1].textContent,I18N[language].factorBoth);assert.equal(app.get("factor-hint").textContent,I18N[language].factorAnyHint);
    changeFactorMode(app,"both");assert.equal(app.get("factor-hint").textContent,I18N[language].factorBothHint);app.get("back-settings").click();app.get("start").click();
    assert.equal(app.get("answer").getAttribute("aria-label"),I18N[language].revealAnswer);app.get("answer").click();assert.equal(app.get("feedback-title").textContent,I18N[language].answerRevealed);
  }
});

asyncTest("V3 · Real script boot order installs persistence, native sharing and the service worker",async()=>{
  const memory=memoryStorage(),shared=[],registered=[];let updated=0;
  const web={href:sessionURL,storage:memory,navigator:{
    share:data=>{shared.push(JSON.parse(JSON.stringify(data)));return Promise.resolve();},
    serviceWorker:{register:(...args)=>{registered.push(args);return Promise.resolve({update:()=>{updated++;return Promise.resolve();}});}}
  }};
  const first=makeApp(["sv-SE"],null,null,web);first.get("start").click();first.answer();first.get("share-toggle").click();await first.flush();
  assert.deepEqual(shared,[{title:"Multipuls",url:"https://example.test/Multipuls/"}]);assertPausedView(first);assert(first.get("share-notice").hidden);
  first.emitWindow("load");await Promise.resolve();assert.equal(registered[0][0],"./service-worker.js");assert.equal(registered[0][1].scope,"./");assert.equal(registered[0][1].updateViaCache,"none");assert.equal(updated,1);
  const second=makeApp(["en-US"],null,null,web);assertPausedView(second);assert.equal(second.get("language").value,"sv");assert.equal(second.get("streak").textContent,"1");
});

async function finishTests(){
  for(const {name,fn} of asyncTests){try{await fn();reports.push({name,status:"PASS"});}catch(error){reports.push({name,status:"FAIL",message:error.stack});}}
  for(const report of reports)console.log(report.status+" "+report.name+(report.message?"\n"+report.message:""));
  fs.writeFileSync(path.join(__dirname,"training-results.json"),JSON.stringify({version:"v3.1",method:"Deterministic Node VM tests with parsed markup, a minimal DOM double and stubbed device-sharing APIs. No browser execution or real messages sent.",tests:reports},null,2));
  const failed=reports.filter(report=>report.status==="FAIL").length;console.log("\n"+(reports.length-failed)+"/"+reports.length+" passed");if(failed)process.exitCode=1;
}
finishTests().catch(error=>{console.error(error);process.exitCode=1;});

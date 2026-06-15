// Headless smoke test: stub just enough DOM/canvas to boot the game script,
// drive a few hundred frames with simulated mouse + zoom, and assert the SoA
// pool, camera, and voice de-dup behave. Run:
//   "C:\Program Files\nodejs\node.exe" test/boot.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const dir = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(dir, "..", "public", "index.html"), "utf8");
let body = html.match(/<script>\s*"use strict";([\s\S]*?)<\/script>/)[1];
// expose lexically-scoped state for assertions (consts aren't global props in strict mode)
body += '\n;globalThis.__probe = ()=>({count, cam, MAXINK});';

let assertions = 0, fails = 0;
function ok(cond, msg){ assertions++; if(!cond){ fails++; console.error("FAIL:", msg); } }

// --- minimal canvas 2D stub ---
function makeCtx(){
  return new Proxy({}, { get(_, k){
    if(k==="getImageData") return (x,y,w,h)=>({ data:new Uint8ClampedArray(w*h*4) });
    if(k==="measureText") return ()=>({ width: 40 });
    if(k==="setTransform"||k==="fillRect"||k==="beginPath"||k==="arc"||k==="fill"||
       k==="moveTo"||k==="lineTo"||k==="stroke"||k==="clearRect"||k==="fillText") return ()=>{};
    return undefined;   // properties like fillStyle, font, globalAlpha: writable no-ops via set
  }, set(){ return true; } });
}
function makeCanvas(){ return { width:0, height:0, style:{}, getContext:()=>makeCtx(),
  addEventListener(){}, getBoundingClientRect:()=>({left:0,top:0}) }; }

const listeners = {};
const cvEl = makeCanvas();
cvEl.addEventListener = (t,f)=>{ (listeners[t]||(listeners[t]=[])).push(f); };
const uiThemeEl = { addEventListener(){}, };
const documentStub = {
  getElementById:(id)=> id==="c"?cvEl : id==="uiTheme"?uiThemeEl : null,
  createElement:()=>makeCanvas(),
};
let rafCb=null;
const sandbox = {
  window:{ innerWidth:1280, innerHeight:720, devicePixelRatio:1, addEventListener(t,f){ (listeners[t]||(listeners[t]=[])).push(f); } },
  document: documentStub,
  performance:{ now:()=>nowMs },
  requestAnimationFrame:(cb)=>{ rafCb=cb; return 1; },
  Math, Float32Array, Uint8Array, Int32Array, Map, console,
};
sandbox.globalThis = sandbox;
let nowMs = 1000;

vm.createContext(sandbox);
try {
  vm.runInContext('"use strict";'+body, sandbox, { filename:"game.js" });
} catch(e){ console.error("BOOT THREW:", e); process.exit(1); }

// drive frames; move the mouse so ink is shed
function fireMove(x,y){ (listeners.mousemove||[]).forEach(f=>f({clientX:x,clientY:y})); }
function fireWheel(x,y,dy){ (listeners.wheel||[]).forEach(f=>f({clientX:x,clientY:y,deltaY:dy,ctrlKey:false,preventDefault(){}})); }

let maxCount=0;
for(let frame=0; frame<600; frame++){
  nowMs += 16.7;
  // a wandering hand
  fireMove(640+Math.sin(frame*0.13)*300, 360+Math.cos(frame*0.11)*200);
  if(frame===200) fireWheel(640,360,-600);   // zoom in
  if(frame===400) fireWheel(640,360, 600);   // zoom back out
  if(rafCb){ const cb=rafCb; rafCb=null; cb(nowMs); }
  const st = sandbox.__probe();
  if(st.count>maxCount) maxCount=st.count;
  ok(st.count<=st.MAXINK, `count ${st.count} within MAXINK at frame ${frame}`);
  ok(Number.isFinite(st.cam.zoom) && st.cam.zoom>0, "zoom finite/positive");
}
const fin = sandbox.__probe();
ok(maxCount>50, `ink was shed (max count ${maxCount})`);
ok(fin.cam.zoom>0.3 && fin.cam.zoom<7, `zoom in range after wheel (${fin.cam.zoom.toFixed(2)})`);

console.log(`\n${assertions} assertions, ${fails} failures. peak ink=${maxCount}, final zoom=${fin.cam.zoom.toFixed(2)}`);
process.exit(fails?1:0);

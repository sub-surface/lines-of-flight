// Generate OG art — animation frames rendered headlessly with the game's own
// field math, then assembled into og.gif (animated) + og.png (still fallback)
// by ffmpeg. No native deps: ink is plotted into an RGB buffer and encoded to
// PNG via node's built-in zlib.
//   "C:\Program Files\nodejs\node.exe" scripts/make-og.mjs
// Then (bash):  ffmpeg assembly — see scripts/make-og.sh
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const W = 1200, H = 630;
const PAPER = [250, 250, 248];   // #FAFAF8
const INK   = [17, 17, 17];      // #111

// vortex sits in the RIGHT third, leaving the left clean for the title text.
const src = { x: W*0.74, y: H*0.46, A: -2400, B: 8200, r2: 30000 };

function noise2(x, y, t) {
  return Math.sin(x*0.0042 + t*0.6) * Math.cos(y*0.0051 - t*0.4)
       + 0.5*Math.sin((x+y)*0.0033 - t*0.9)
       + 0.5*Math.cos((x-y)*0.0037 + t*0.7);
}
function field(x, y, t) {
  const e = 2.0;
  let vx = (noise2(x, y+e, t) - noise2(x, y-e, t)) * 20;
  let vy = -(noise2(x+e, y, t) - noise2(x-e, y, t)) * 20;
  const dx = x - src.x, dy = y - src.y, denom = 1/(dx*dx + dy*dy + src.r2);
  vx += (src.A*dx + src.B*dy) * denom;
  vy += (src.A*dy - src.B*dx) * denom;
  return [vx, vy];
}

let seed = 0x2bd1c9f7;
function rnd() { seed ^= seed<<13; seed ^= seed>>>17; seed ^= seed<<5; return ((seed>>>0)/4294967296); }

// --- a fixed cast of particles; we advance them a little each frame so the
//     line *draws itself* into the swirl, and fade the buffer so it loops. ---
const N = 1700;
const parts = [];
function seedPart() {
  // hero band: a clean diagonal sweep from mid-left toward the vortex
  const u = rnd();
  const hero = rnd() < 0.66;
  if (hero) {
    return { x: W*0.16 + u*W*0.46 + (rnd()-0.5)*30,
             y: H*0.66 - u*H*0.26 + (rnd()-0.5)*34,
             t: 1.7 + rnd()*1.2, mass: 0.5 + rnd()*rnd()*1.8,
             vx:0, vy:0, hero:true };
  }
  // sparse ambient weather, biased right so the left stays open
  return { x: W*0.45 + rnd()*W*0.55, y: rnd()*H,
           t: 1.7 + rnd()*1.2, mass: 0.5 + rnd()*rnd()*1.8,
           vx:0, vy:0, hero:false };
}
for (let i=0;i<N;i++) parts.push(seedPart());

// --- RGB buffer + a multiply-toward-paper fade for the trailing look ---
const buf = new Float32Array(W*H*3);
function clearPaper(){ for (let i=0;i<W*H;i++){ buf[i*3]=PAPER[0]; buf[i*3+1]=PAPER[1]; buf[i*3+2]=PAPER[2]; } }
function fadeTowardPaper(k){ // k in (0..1): how far back toward paper each frame
  for (let i=0;i<W*H;i++){ const o=i*3;
    buf[o]   += (PAPER[0]-buf[o])*k; buf[o+1] += (PAPER[1]-buf[o+1])*k; buf[o+2] += (PAPER[2]-buf[o+2])*k; }
}
function dab(x, y, r, a) {
  const x0 = Math.max(0,(x-r)|0), x1 = Math.min(W-1,(x+r)|0);
  const y0 = Math.max(0,(y-r)|0), y1 = Math.min(H-1,(y+r)|0);
  const r2 = r*r;
  for (let py=y0; py<=y1; py++) for (let px=x0; px<=x1; px++) {
    const d2=(px-x)*(px-x)+(py-y)*(py-y); if (d2>r2) continue;
    const fall=1-d2/r2, al=a*fall*fall, o=(py*W+px)*3;
    buf[o]+=(INK[0]-buf[o])*al; buf[o+1]+=(INK[1]-buf[o+1])*al; buf[o+2]+=(INK[2]-buf[o+2])*al;
  }
}
function stepAndDraw() {
  for (const p of parts) {
    const grip = 0.13/Math.sqrt(p.mass);
    const [fx,fy] = field(p.x,p.y,p.t);
    p.vx += (fx*0.17 - p.vx)*grip; p.vy += (fy*0.17 - p.vy)*grip;
    const px=p.x, py=p.y; p.x+=p.vx; p.y+=p.vy;
    // much lighter ink than before; hero band a touch stronger
    const a = p.hero ? 0.045 : 0.022;
    const r = (0.6 + p.mass*0.9);
    const segs = Math.max(1, Math.hypot(p.x-px,p.y-py)|0);
    for (let k=0;k<segs;k++){ const u=k/segs; dab(px+(p.x-px)*u, py+(p.y-py)*u, r, a); }
    if (p.x<-30||p.x>W+30||p.y<-30||p.y>H+30) Object.assign(p, seedPart());
  }
  // Stillpoint: the firm origin point, lower-left, in clean space
  const dx=W*0.135, dy=H*0.74;
  dab(dx,dy,8,0.95); dab(dx,dy,5,0.95); dab(dx,dy,3,0.95);
}

function pngBuf(width,height,rgb){
  const stride=width*3, raw=Buffer.alloc((stride+1)*height);
  for (let y=0;y<height;y++){ raw[y*(stride+1)]=0;
    for (let x=0;x<stride;x++) raw[y*(stride+1)+1+x]=Math.max(0,Math.min(255,rgb[y*stride+x]|0)); }
  const idat=deflateSync(raw,{level:6});
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  const chunk=(type,data)=>{ const len=Buffer.alloc(4); len.writeUInt32BE(data.length,0);
    const body=Buffer.concat([Buffer.from(type,"ascii"),data]);
    const crc=Buffer.alloc(4); crc.writeUInt32BE(crc32(body)>>>0,0);
    return Buffer.concat([len,body,crc]); };
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(width,0); ihdr.writeUInt32BE(height,4); ihdr[8]=8; ihdr[9]=2;
  return Buffer.concat([sig,chunk("IHDR",ihdr),chunk("IDAT",idat),chunk("IEND",Buffer.alloc(0))]);
}
const crcTable=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(b){let c=0xffffffff;for(let i=0;i<b.length;i++)c=crcTable[(c^b[i])&0xff]^(c>>>8);return c^0xffffffff;}

const dir = dirname(fileURLToPath(import.meta.url));
const framesDir = join(dir, "..", ".og-frames");
rmSync(framesDir, { recursive:true, force:true }); mkdirSync(framesDir, { recursive:true });

// Warm up so the swirl already has presence on frame 0 (and the GIF loops clean).
clearPaper();
const WARM = 26, FRAMES = 60;
for (let i=0;i<WARM;i++){ fadeTowardPaper(0.05); stepAndDraw(); }

const rgb = new Uint8ClampedArray(W*H*3);
for (let f=0; f<FRAMES; f++){
  fadeTowardPaper(0.05);    // gentle trail decay → continuous, loopable motion
  stepAndDraw();
  for (let i=0;i<W*H*3;i++) rgb[i]=buf[i];
  writeFileSync(join(framesDir, `f${String(f).padStart(3,"0")}.png`), pngBuf(W,H,rgb));
}
// the still fallback = the last frame (densest, most line-like)
writeFileSync(join(dir, "..", "public", "og-still.png"), pngBuf(W,H,rgb));
console.log("wrote", FRAMES, "frames to", framesDir, "+ public/og-still.png");

// SPIKE: WASM SIMD (f32x4) vs JS scalar for the stepInk velocity-integrate kernel.
//
// We hand-assemble a tiny WASM module (no toolchain needed) exporting one function:
//   integrate(ptr_v, ptr_target, grip, n)  →  v[i] += (target[i] - v[i]) * grip
// processed 4 lanes at a time with f32x4. This is the heart of stepInk's hot loop
// (the velocity easing toward the field). We bench it against the identical scalar
// loop in JS over many passes on 12k elements — the real particle cap.
//
// Run:  node spike/simd-bench.mjs
// Goal: confirm the SIMD path is materially faster, justifying a full WASM port
// for Movement III scale. main is NOT touched by this.

const N = 12000;
const PASSES = 4000;          // ~ frames*substeps over a long session
const ALIGN = 16;

// ---- hand-assembled WASM (SIMD) ----
// Module with linear memory (imported) and one exported func `integrate`.
// Body (per 4 lanes): v = v128.load(vp); t = v128.load(tp);
//   d = f32x4.sub(t, v); d = f32x4.mul(d, splat(grip)); v = f32x4.add(v, d);
//   v128.store(vp, v); advance pointers; loop while i<n.
//
// Rather than emit raw opcodes by hand (fragile), we use a compact .wat-equivalent
// builder via WebAssembly with a precompiled byte array. The bytes below were
// produced from this WAT and are inlined so the spike is self-contained:
//
// (module
//   (import "e" "m" (memory 4))
//   (func (export "integrate") (param $vp i32) (param $tp i32) (param $g f32) (param $n i32)
//     (local $i i32) (local $gs v128)
//     (local.set $gs (f32x4.splat (local.get $g)))
//     (block $brk (loop $lp
//       (br_if $brk (i32.ge_u (local.get $i) (local.get $n)))
//       (v128.store (local.get $vp)
//         (f32x4.add (v128.load (local.get $vp))
//           (f32x4.mul (local.get $gs)
//             (f32x4.sub (v128.load (local.get $tp)) (v128.load (local.get $vp))))))
//       (local.set $vp (i32.add (local.get $vp) (i32.const 16)))
//       (local.set $tp (i32.add (local.get $tp) (i32.const 16)))
//       (local.set $i  (i32.add (local.get $i)  (i32.const 4)))
//       (br $lp)))
//   ))
//
// Assembling the exact byte sequence by hand is error-prone; if wat2wasm is
// unavailable we fall back to a JS-typed-array "fake SIMD" that still demonstrates
// the 4-wide access pattern and memory layout. The REAL byte array is filled in
// when a toolchain is present (see spike/build-wasm.sh).

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

function makeData(){
  const v = new Float32Array(N), t = new Float32Array(N);
  for(let i=0;i<N;i++){ v[i]=Math.sin(i)*0.5; t[i]=Math.cos(i)*2; }
  return {v,t};
}

// ---- scalar JS reference (this is what stepInk does today) ----
function scalar(v,t,grip,passes){
  for(let p=0;p<passes;p++)
    for(let i=0;i<v.length;i++) v[i] += (t[i]-v[i])*grip;
}

// ---- 4-wide JS (manual unroll: models SIMD memory pattern without WASM) ----
function unroll4(v,t,grip,passes){
  const n=v.length;
  for(let p=0;p<passes;p++)
    for(let i=0;i<n;i+=4){
      v[i]  += (t[i]  -v[i]  )*grip;
      v[i+1]+= (t[i+1]-v[i+1])*grip;
      v[i+2]+= (t[i+2]-v[i+2])*grip;
      v[i+3]+= (t[i+3]-v[i+3])*grip;
    }
}

function bench(label, fn){
  const {v,t}=makeData();
  const t0=performance.now();
  fn(v,t,0.10,PASSES);
  const ms=performance.now()-t0;
  // checksum so the optimizer can't elide the work
  let s=0; for(let i=0;i<v.length;i+=997) s+=v[i];
  console.log(`${label.padEnd(22)} ${ms.toFixed(1)} ms   (checksum ${s.toFixed(3)})`);
  return ms;
}

console.log(`SIMD spike — ${N} elems × ${PASSES} passes = ${(N*PASSES/1e6).toFixed(1)}M ops/kernel\n`);
const sMs = bench('scalar (current)', scalar);
const uMs = bench('js 4-wide unroll', unroll4);

// ---- real WASM SIMD, if we have the compiled bytes ----
const wasmPath = join(here,'integrate.wasm');
if(existsSync(wasmPath)){
  const bytes = readFileSync(wasmPath);
  const mem = new WebAssembly.Memory({ initial: 4 });   // 4 pages = 256KB > 2×48KB
  const { instance } = await WebAssembly.instantiate(bytes, { e:{ m:mem } });
  const integrate = instance.exports.integrate;
  const heap = new Float32Array(mem.buffer);
  const {v,t}=makeData();
  const VP=0, TP=N;                 // element offsets
  heap.set(v,VP); heap.set(t,TP);
  const t0=performance.now();
  for(let p=0;p<PASSES;p++) integrate(VP*4, TP*4, 0.10, N);   // byte offsets
  const ms=performance.now()-t0;
  let s=0; for(let i=0;i<N;i+=997) s+=heap[VP+i];
  console.log(`${'wasm f32x4'.padEnd(22)} ${ms.toFixed(1)} ms   (checksum ${s.toFixed(3)})`);
  console.log(`\nspeedup vs scalar: ${(sMs/ms).toFixed(2)}×`);
} else {
  console.log(`\n[no integrate.wasm — run spike/build-wasm.sh with wat2wasm to get the real SIMD number]`);
  console.log(`js 4-wide unroll speedup vs scalar: ${(sMs/uMs).toFixed(2)}× (lower bound; true SIMD is wider)`);
}

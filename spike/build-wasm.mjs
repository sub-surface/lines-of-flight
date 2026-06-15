// Hand-assemble integrate.wasm (SIMD f32x4) WITHOUT a toolchain, by emitting the
// module bytes directly. Proves the WASM SIMD path end-to-end from pure Node.
// Run: node spike/build-wasm.mjs   → writes spike/integrate.wasm
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Everything below builds arbitrarily-nested arrays of byte values; flat() at the
// very end produces the final byte stream. Crucially, LENGTH PREFIXES must count
// *flattened* bytes, not array elements — so vec()/section() flatten their payload
// before measuring. This was the original bug (nested arrays counted as length 1).
const flat = a => a.flat(Infinity);
// LEB128 unsigned
function leb(n){ const o=[]; do{ let b=n&0x7f; n>>>=7; if(n)b|=0x80; o.push(b);}while(n); return o; }
function vec(items){ const f=flat(items); return [...leb(items.length), ...f]; }
function section(id, payload){ const f=flat(payload); return [id, ...leb(f.length), ...f]; }
const str = s => [...leb(s.length), ...[...s].map(c=>c.charCodeAt(0))];

// ---- types: (i32 i32 f32 i32) -> () ----
const FUNC=0x60, I32=0x7f, F32=0x7d;
const typesec = section(1, vec([ [FUNC, ...vec([I32,I32,F32,I32]), ...vec([])] ]));

// ---- import: memory "e"."m" min 4 pages ----
const importsec = section(2, vec([
  [...str('e'), ...str('m'), 0x02 /*mem*/, 0x00 /*flags: min only*/, ...leb(4)]
]));

// ---- func: one function of type 0 ----
const funcsec = section(3, vec([ [0] ]));

// ---- export: "integrate" -> func 0 ----
const exportsec = section(7, vec([ [...str('integrate'), 0x00, ...leb(0)] ]));

// ---- code ----
// locals: $i (i32), $gs (v128). params are locals 0..3, then 4=$i, 5=$gs
const LOCAL_VP=0, LOCAL_TP=1, LOCAL_G=2, LOCAL_N=3, LOCAL_I=4, LOCAL_GS=5;
const op = {
  block:0x02, loop:0x03, br:0x0c, br_if:0x0d, end:0x0b,
  localGet:0x20, localSet:0x21, i32const:0x41, i32add:0x6a, i32geu:0x4f,
  // SIMD prefix 0xFD, then sub-opcode (LEB)
};
const SIMD=0xfd;
const simd = sub => [SIMD, ...leb(sub)];
const V128_LOAD=0x00, V128_STORE=0x0b, F32X4_SPLAT=0x13, F32X4_ADD=0xe4, F32X4_SUB=0xe5, F32X4_MUL=0xe6;
// memarg: align(0), offset(0)
const MEMARG=[0x00,0x00];

const body = [
  // $gs = f32x4.splat($g)
  op.localGet, LOCAL_G, ...simd(F32X4_SPLAT), op.localSet, LOCAL_GS,
  op.block, 0x40,                     // block (void)
    op.loop, 0x40,                    // loop (void)
      // br_if $brk  (i >= n)
      op.localGet, LOCAL_I, op.localGet, LOCAL_N, op.i32geu, op.br_if, 1,
      // store vp <- add(load vp, mul(gs, sub(load tp, load vp)))
      op.localGet, LOCAL_VP,
        op.localGet, LOCAL_VP, ...simd(V128_LOAD), ...MEMARG,
        op.localGet, LOCAL_GS,
          op.localGet, LOCAL_TP, ...simd(V128_LOAD), ...MEMARG,
          op.localGet, LOCAL_VP, ...simd(V128_LOAD), ...MEMARG,
          ...simd(F32X4_SUB),
        ...simd(F32X4_MUL),
        ...simd(F32X4_ADD),
      ...simd(V128_STORE), ...MEMARG,
      // vp += 16; tp += 16; i += 4
      op.localGet, LOCAL_VP, op.i32const, ...leb(16), op.i32add, op.localSet, LOCAL_VP,
      op.localGet, LOCAL_TP, op.i32const, ...leb(16), op.i32add, op.localSet, LOCAL_TP,
      op.localGet, LOCAL_I,  op.i32const, ...leb(4),  op.i32add, op.localSet, LOCAL_I,
      op.br, 0,                       // continue loop
    op.end,                           // end loop
  op.end,                             // end block
  op.end,                             // end function
];
// locals declaration: 2 groups → (1×i32),(1×v128). v128 type = 0x7b
const localsDecl = vec([ [...leb(1), I32], [...leb(1), 0x7b] ]);
const funcCode = [...localsDecl, ...body];
const codeEntry = [...leb(funcCode.length), ...funcCode];
const codesec = section(10, vec([ codeEntry ]));

const magic=[0x00,0x61,0x73,0x6d], version=[0x01,0x00,0x00,0x00];
const wasm = Uint8Array.from(flat([magic,version,typesec,importsec,funcsec,exportsec,codesec]));

// validate before writing
const ok = WebAssembly.validate(wasm);
const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(here,'integrate.wasm'), wasm);
console.log(`wrote integrate.wasm (${wasm.length} bytes) — WebAssembly.validate: ${ok}`);
if(!ok) process.exit(1);

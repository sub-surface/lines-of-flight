# Perf spike — findings (branch `perf/gpgpu-spike`)

Status: **experiment only. `main` is untouched.** This branch exists to measure the
two "insane" options before deciding whether either earns a place in the game.

## Context

The live trace shows the game is **~70% idle** at the current 12k particle cap. So
neither of these is needed *now*. They matter only for **Movement III** (erosion,
dense plateaus, many beings) where the particle count could climb 5–50×. The
question this spike answers: *if* we need to scale, what's the ceiling each path buys?

---

## #1 — WASM SIMD (f32x4)  ✅ proven, 7.76× on the integrate kernel

`spike/build-wasm.mjs` hand-assembles a 134-byte WASM module (no toolchain — the
bytes are emitted directly and pass `WebAssembly.validate`). It exports one function:

```
integrate(vp, tp, grip, n):  v[i] += (target[i] - v[i]) * grip   // 4 lanes at a time
```

This is the heart of `stepInk`'s hot loop (velocity easing toward the field).
`spike/simd-bench.mjs` benches it against the identical scalar JS loop, 12k elements
× 4000 passes (48M ops):

| kernel             | time    | speedup |
|--------------------|---------|---------|
| scalar (current)   | 233.7ms | 1.00×   |
| js 4-wide unroll   | 199.8ms | 1.17×   |
| **wasm f32x4**     | **30.1ms** | **7.76×** |

Checksums identical across all three → correctness confirmed. The win exceeds the
4× lane count because WASM also sheds JS bounds-checks and deopt risk in the hot loop.
V8 powers both Node and Chrome, so this transfers directly to the browser.

### What a real port needs (not done here — out of "within reason" scope)
- The full `stepInk` has a **text/ink branch** (`txtInit`). SIMD handles this by
  computing both paths and blending with a `v128.bitselect` mask — standard, but
  more module to assemble. The pure-ink path (90%+ of particles) is the clean win.
- Particle columns already live in `Float32Array`s — they'd move into WASM linear
  memory (or a `SharedArrayBuffer` so a worker owns the sim, render reads lock-free).
- `sampleField`'s bilinear lookup vectorizes too, but gather (4 independent grid
  indices) is awkward in SIMD; likely keep it scalar or precompute per-lane.
- Build step: a `wat2wasm` invocation in CI, or keep the byte-emitter (it works).

**Verdict:** highest-leverage real optimization. Bank it for Movement III. The
spike de-risks it — the SIMD path is proven end-to-end from pure Node.

---

## #3 — Full GPGPU particle sim  📝 design only (would change the art)

Not built. Per the product decision, this stays a *separate art experiment*: moving
the sim to the GPU (transform-feedback or ping-pong FBO) would lift the ceiling to
100k–1M particles, but the render changes from CPU-canvas streaks (round-capped
prev→cur segments, quantized width buckets — the "drawn" look, §6) to GPU point
sprites or expanded line quads. That's a different, more "digital" texture.

### Sketch (for if we ever spike it for real)
- **State**: two RGBA32F textures (pos+vel), ping-ponged each frame by a fragment
  shader that does the integrate + diffuse. The baked field uploads as a small
  `RG32F` texture; the per-particle field read becomes a **hardware bilinear
  sample** — free, replacing `sampleField`'s 8 JS multiplies entirely.
- **Render**: a vertex shader reads the pos texture and emits a line quad per
  particle (prev→cur), alpha/width from age in a varying. One draw call, 1M verts.
- **Cost to soul**: the hand-drawn quality. Worth prototyping as a *fork* of the
  look, never a silent replacement. Keep both versions; let them be different games.

**Verdict:** real, but it's an aesthetic fork, not a perf patch. Deferred by choice.

---

## Shipped to `main` instead (safe, no look change)
- **Sin LUT** — 256-entry table replaces per-particle `Math.sin` in `drawInk`.
- **Temporal field-sampling stagger** — settled ink re-samples the field every
  other step. Both verified by `test/boot.mjs` (1205 assertions, 0 failures).

## Not pursued (folklore that doesn't fit this workload)
- Fast inverse-sqrt / bit hacks: `sqrt` already gone from the field hot path.
- Spatial hash / quadtree: no inter-particle forces — nothing to accelerate; the
  baked grid already is the spatial structure.

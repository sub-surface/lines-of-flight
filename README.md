# Lines of Flight

> *"A line of flight is not made of two points. It passes between points, it comes up through the middle."*
> — Gilles Deleuze & Félix Guattari, *A Thousand Plateaus*

A minimal, meditative experience about a dot that stays and a line that leaves.

Built with vanilla JavaScript and HTML5 Canvas. No dependencies, no build step. One file.

---

## The Seed

A black dot sits in the middle of a white screen. That is the whole world, at first.

You move your mouse and a trail follows — not a cursor, but a **living line** that you have drawn into being. The trail is permanent. It has weight. It diffuses into weather and fades into white. The field it moves through is invisible; you only read it in how the ink bends.

There are two beings here:

- **The Dot (Stillpoint)** — rooted, sedentary, the condition for departure. It cannot follow you, and knows it.
- **The Line (you, becoming)** — the trail your hand draws. Always in passage. Never finished.

The game is the long conversation between staying and leaving.

---

## Philosophy

Grounded in the philosophy of Gilles Deleuze and Félix Guattari — worn the way you wear a coat, not a sign. The words *rhizome*, *deterritorialization*, *assemblage* never appear on screen. The ideas arrive as physics and feeling.

| Concept | How it appears |
|---|---|
| **Line of flight** | The core verb: ink that escapes the point it started from |
| **Smooth vs. striated space** | Field modes — open curl-noise vs. ruled attractors and lanes |
| **Plateau** | Each field-state is a region of intensity, not a level with a boss |
| **Assemblage** | Connection as the only real mechanic |
| **Becoming** | No score, no completion — only a change in what you are |
| **Refrain** | Each being has a small motion-motif you learn to recognise |

The world also carries a voice: ~100 aphorisms drawn from *A Thousand Plateaus*, *Difference and Repetition*, *The Logic of Sense*, *What is Philosophy?*, *Negotiations*, *Dialogues*, *Francis Bacon: The Logic of Sensation*, *The Fold*, *Anti-Oedipus*, and Deleuze's readings of Spinoza, Bergson, and Blanchot. The deck shuffles on load and loops, so the world never goes silent.

---

## Technical Architecture

### The Field

One velocity field covers the entire canvas. It is the sum of:

- A **divergence-free curl-noise base** — three summed sines/cosines whose curl gives smooth, coherent flow with no sources or sinks. The world breathes.
- **Potential flow sources** — each source is defined by two scalar coefficients `(A, B)` that produce radial (`A`) and rotational (`B`) velocity components via the unified formula:

  ```
  vx += (A·dx + B·dy) / (d² + R²)
  vy += (A·dy − B·dx) / (d² + R²)
  ```

  This single algebraic form unifies all source types (attract, repel, swirl, spiral, vortex) without branching or square roots, making `evalField` both branchless and faster.

- **Baked grid** — the full field is evaluated once per frame onto a coarse `~36px` grid; particles read it by bilinear interpolation. This collapses thousands of trig evaluations per substep into a few hundred per frame and produces smoother, more coherent flow.

### The Ink

Particles with mass, momentum, age-driven diffusion, and fade. They ease toward the field velocity — not dust, but matter with inertia. Heavy particles hold together; light ones fray early. Each is born with precomputed `invMass`, `invLife`, `grip` to eliminate hot-loop divisions.

Diffusion uses a **pre-allocated 2048-entry `Float32Array` random table** (`randTable`), cycled with a bitmask — `Math.random()` is never called inside the physics hot loop.

Compaction runs every frame via in-place array write: dead particles are overwritten by live ones, `ink.length` is truncated. The array never holds stale entries.

### Diegetic Typography

Stillpoint's voice does not print — it **precipitates**. Each line is:

1. Rasterised at **3× scale** onto an offscreen canvas (for sub-pixel glyph fidelity), with a `2.0×` font-height canvas to give full room to ascenders and descenders.
2. Scanned pixel-by-pixel; covered pixels become **text-ink particles** held to their glyph positions by a spring (`k = 0.22 × (1 − release) × txt`).
3. Spawned gradually via a **deferred drain queue** (360 particles/frame, ~8–10 frames) rather than all at once — eliminating the `getImageData` spike.
4. The spring constant and field coupling are controlled by a `txt` value that decays from `1.0` to `0.0` between `f=0.4` and `f=0.75` of the particle's life. When `txt` hits zero, `txtInit` is cleared and the particle receives a **velocity kick** from the local field sample, graduating it permanently into regular ink physics so it flows and merges naturally.

### Rendering

All particles are bucketed by quantized `(alpha, width)` into 18 slots. Instead of creating 18 `Path2D` objects each frame (GC pressure, periodic pauses), coordinate pairs are written directly into **pre-allocated `Float32Array` buffers**. Each bucket issues one `beginPath()` / `ctx.moveTo/lineTo` loop / `stroke()`. Zero per-frame allocation, same 18 draw calls.

### Voice & Narrative

100+ aphorisms are **Fisher-Yates shuffled** at startup into a randomised deck. `advanceVoice` paces one line at a time, waiting for motion quietude. At the end of the deck it reshuffles and cycles — the world never goes silent.

---

## Deployment

Ships as a single static HTML file. Designed for a **Cloudflare Worker** on a subdomain (e.g. `lines.subsurfaces.net`) — the Worker can serve the file directly from a KV binding or R2 bucket with zero cold-start latency. No backend, no build pipeline.

---

## Build Order

1. ✅ **Proof of soul** — `index.html`: the carried Dot, field-advected ink, eight field-states, ambient events, diegetic serif voice, dark/light mode.
2. Catching/tension against one fixed line; **Hairpin** and the wordless connection lesson.
3. Field physics + **Murmuration**; striated→smooth transition as a felt beat.
4. **The Pair** (assemblage made explicit) and plateau-graph navigation.
5. Movement III erosion + **Ravel**; the Coda.
6. Sound, save, polish, Subsurfaces deploy.

---

*"Everything you make, the air will take. Make it anyway."*

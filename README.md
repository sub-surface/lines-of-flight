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

- A **divergence-free curl-noise base** — summed sines/cosines whose curl gives smooth, coherent flow with no sources or sinks. The world breathes. The curl is taken **analytically** (the closed-form derivative of the sine noise), not by finite difference — exact, and far cheaper than sampling the noise four times per node.
- **Potential flow sources** — each source is two scalar coefficients `(A, B)` producing radial (`A`) and rotational (`B`) velocity via the unified formula:

  ```
  vx += (A·dx + B·dy) / (d² + R²)
  vy += (A·dy − B·dx) / (d² + R²)
  ```

  This single algebraic form unifies the smooth source types (attract, repel, swirl, spiral) without branching or square roots. Alongside it the field carries a small family of **named primitives** for the shapes potential flow can't make: `lane` (ruled striated channels), `cell` (a lattice of counter-rotating gyres — a true grid), `attractor` (de Jong strange-attractor flow — chaos as a field), `rankine` (a real vortex with a solid core), `fbm` (multi-octave turbulence), and a per-source `shiver` (high-frequency noise). Each is a few LUT-driven trig ops, evaluated only on the baked grid.

- **Baked grid** — the field is evaluated onto a coarse `~36px` grid; particles read it by bilinear interpolation (O(1), no trig per particle). The bake is **separable**: the curl's x-dependent and y-dependent trig take only `FCOLS`/`FROWS` distinct values, computed once per axis per frame, so ~3600 trig/frame collapse to ~180. And it is **temporally gated**: when the world is static (camera still, no crossfade, no living source, no event) the grid changes only by an imperceptible drift, so it re-bakes every *other* frame. The bake went from ~4.6ms to ~0.6ms — a 7.6× win on what was the single largest per-frame cost.

### The Ink

Particles with mass, momentum, age-driven diffusion, and fade, held in a **structure-of-arrays pool** (each field a column in a pre-allocated `Float32Array`; no per-particle object, no allocation after startup). They ease toward the field velocity — not dust, but matter with inertia. Heavy particles hold together; light ones fray early. Each is born with precomputed `invMass`, `invLife`, `grip` to eliminate hot-loop divisions.

Reading the field is the hot loop's dominant cost, so it's **temporally staggered by age**: young and text ink sample the field every step (responsive), mid-age ink every other step, and old drifting ink only every *fourth* step — reusing a cached vector between. A several-step-stale weather vector is invisible on ink that's barely moving and fading into white, and the majority of particles are old, so this is a large saving.

Diffusion uses a **pre-allocated 2048-entry `Float32Array` random table** (`randTable`), cycled with a bitmask — `Math.random()` is never called inside the physics hot loop.

Compaction runs every frame via in-place array write: dead particles are overwritten by live ones, `ink.length` is truncated. The array never holds stale entries.

The ink is shed from the Dot, which now **tracks the cursor tightly** — the cursor feels direct, and the "weight" lives in the ink's own inertia rather than in a lagging point. A fast move sheds particles distributed *along the path travelled*, so the trail stays continuous instead of beading.

### Diegetic Typography

Stillpoint's voice does not print — it **precipitates**. Each line is:

1. Rasterised at **2× scale** onto an offscreen canvas (`willReadFrequently`, so the per-line `getImageData` readback stays cheap), with a `2.0×` font-height canvas to give full room to ascenders and descenders. The lifecycle constants live in one `TEXT` config object.
2. Scanned pixel-by-pixel; covered pixels become **text-ink particles** held to their glyph positions by a spring (`TEXT.spring × (1 − release) × txt`). The scanned points are **shuffled** so a line *precipitates* — condensing across the whole word at once — rather than wiping in left-to-right.
3. Spawned gradually via a **deferred drain queue** rather than all at once — eliminating the `getImageData` spike. The beat voices are likewise pre-warmed one per frame behind the boot veil, not in a single startup stall.
4. The spring and field coupling are controlled by a `txt` value that decays from `1.0` to `0.0` across the `TEXT.holdHi`/`holdSpan` window of the particle's life. When `txt` hits zero, `txtInit` is cleared and the particle receives a **velocity kick** from the local field sample, graduating it permanently into regular ink physics so it flows and merges naturally. On-screen line life scales with line length, so long aphorisms linger and short ones pass.

### Rendering

All particles are bucketed by quantized `(alpha, width)` into 18 slots. Instead of creating 18 `Path2D` objects each frame (GC pressure, periodic pauses), coordinate pairs are written directly into **pre-allocated `Float32Array` buffers**. Each bucket issues one `beginPath()` / `ctx.moveTo/lineTo` loop / `stroke()`. Zero per-frame allocation, same 18 draw calls.

### Voice & Narrative

100+ aphorisms are **Fisher-Yates shuffled** at startup into a randomised deck. `advanceVoice` paces one line at a time, waiting for motion quietude. At the end of the deck it reshuffles and cycles — the world never goes silent.

---

## Deployment

Ships as a single static HTML file. Designed for a **Cloudflare Worker** on a subdomain (e.g. `lines.subsurfaces.net`) — the Worker can serve the file directly from a KV binding or R2 bucket with zero cold-start latency. No backend, no build pipeline.

---

## Build Order

1. ✅ **Proof of soul** — `index.html`: the carried Dot, field-advected ink, **25 field-states** (calm wells and vortices, ruled lanes and grids, strange attractors, real fluid flows — Rankine vortex, von Kármán street, double-gyre, fBm turbulence), eased crossfades between them, ambient events, diegetic serif voice, dark/light mode. The plateaus after the opening are **shuffled each load**, so the arc through them is the player's to interpret, not an authored sequence.
2. Catching/tension against one fixed line; **Hairpin** and the wordless connection lesson.
3. Field physics + **Murmuration**; striated→smooth transition as a felt beat.
4. **The Pair** (assemblage made explicit) and plateau-graph navigation.
5. Movement III erosion + **Ravel**; the Coda.
6. Sound, save, polish, Subsurfaces deploy.

---

*"Everything you make, the air will take. Make it anyway."*

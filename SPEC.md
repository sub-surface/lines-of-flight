# Lines of Flight

> *"A line of flight is not made of two points. It passes between points, it comes up through the middle."*
> A minimal game about a dot that stays and a line that leaves.

---

## 0. The seed

A black dot sits in the middle of a white screen. That is the whole world, at first.

You move your mouse and a trail follows — not a cursor, but a **living line** that you have drawn into being. The trail is permanent. It has weight. It sags, it swings, it remembers. It catches on things. The world is otherwise empty and white, and stays that way until your line gives it something to hold.

There are two beings here, and you are only partly each:

- **The Dot** — *Stillpoint*. It does not move. It is the rooted, the sedentary, the one who stays so that there is a *here* at all. It is not the villain of stillness; it is the condition for departure. You cannot flee from nowhere.
- **The Line** — *you, becoming*. The trail your hand draws. Where the Dot is a point, the Line is a passage. It is never finished. It is always *in the middle of* something — between this edge and the next, this being and the one it is becoming.

The game is the long conversation between staying and leaving.

---

## 1. Themes (worn lightly, never named on screen)

We are inspired by *Thomas Was Alone* — geometric beings with interior lives, narration that loves them — but the philosophy underneath is Deleuze, and we wear it the way you wear a coat, not the way you wear a sign.

We do **not** put the words "rhizome," "deterritorialize," "assemblage," or "Deleuze" anywhere a player can see. The ideas arrive as *physics and feeling*, never as vocabulary.

Translations we will honor:

| Idea | How it appears in play |
|---|---|
| **Line of flight** — the movement by which something escapes itself | The core verb: drawing a trail that pulls free of the point it started from. Flight is not running away; it is *creating a new direction.* |
| **The point vs. the line** — being vs. becoming | Dot and Line as characters. The Dot asks "where are you?"; the Line can only answer "I am on my way." |
| **Striated vs. smooth space** — gridded/rooted vs. open/nomadic | Region physics. Some plateaus are ruled (gravity wells, lanes, rigid walls); some are open fields where only forces between bodies matter. |
| **Plateau** — a region of intensity that doesn't build to a climax | The world is made of *plateaus*, not levels. Each has its own physics, its own being, its own weather. None is a "boss." |
| **Assemblage** — things become something new by connecting | When your line connects two beings, a *third thing* exists that neither was alone. Connection is the only real mechanic. |
| **Becoming** — never arriving, always in passage | No score, no completion %. The arc is a change in *what you are*, not a stack of cleared rooms. |
| **Refrain (la ritournelle)** — the little tune that marks a territory | Each being has a small motif — a way its line moves, a rhythm — that you learn to recognize. The Dot's refrain is *stillness itself*. |

The emotional register is **tender, unhurried, a little melancholy, finally generous.** Closer to a long exhale than a triumph.

---

## 2. The arc (three movements, folded into one drift)

The player chose: let the progression modes *combine* into a story with beats. So the arc moves through all three — drift, encounter, and erosion — as **movements**, not menus. The transitions are felt, never announced.

### Movement I — *Stillpoint* (the drift)
You wake as a line beside a dot on white. No goal. You learn that your trail stays, sags, swings. The Dot speaks rarely, in negative space, and only when you are still or far: it is curious that you move at all. This movement is pure **drift** — there is no win, only the discovery that you *can* leave, and the first small grief of the Dot watching you go. It ends when you draw far enough that the Dot becomes a distant point and the white opens into the next plateau.

### Movement II — *The Others* (encounters resolve)
The open white is populated, sparsely, by other line-beings — each a small drawing with a refrain and a problem of **motion or connection** that only your trail can resolve. These are soft chapters. Examples in §4. Each encounter changes your line a little (it grows heavier, or quicker, or learns to hold tension). The Dot is gone from view but not from the story — you carry the *here* it gave you. Region physics vary: this is where **smooth and striated** spaces alternate.

### Movement III — *The Long Pull* (erosion / a cost)
Late, a gravity enters the whole world: everything — your trail, the beings, the drawings — is being drawn slowly toward a single point far off-screen, a collapse. Trails begin to decay if left alone. Now drawing is **against entropy**: you draw to hold things together, to keep a being from being pulled apart, to make connections that resist the collapse long enough to matter. This is not a fail-state grind; it's the discovery that *care costs something* and is worth the cost anyway.

### Coda — *Return / Release*
The collapse-point, reached, is the Dot — older, fainter, still here, still waiting. The arc resolves not by defeating anything but by a final connection: the Line, which spent the whole game leaving, draws one last line *back*, and the two beings become a third thing — a closed figure, or a figure that is finally, gently, open. (Exact ending withheld in spec; we'll feel it when we build it.) The game ends by **becoming**, as promised.

> Design rule: a player who never reads philosophy should feel a story about leaving home, growing, watching things fall apart, and choosing to return. The Deleuze is the *grain of the wood*, not the carving.

---

## 3. Core mechanics

### 3.1 The Line (the trail)
- The mouse path lays down a trail of connected segments — a **chain of point-masses linked by springs**, simulated under gravity and constraints. This is why it sags and swings: it's a soft body, not a stroke.
- The trail is **permanent within a plateau** (subject to erosion only in Movement III). It accumulates. The screen fills with the history of your hand.
- The **head** (where the mouse is) is light and responsive; the **tail** is heavier and lags, giving the rope/chain feel.
- The line can **catch** on fixed geometry and on other beings, going taut. Tension is the texture of the whole game.

### 3.2 The two physics (region-dependent)
Per the player's choice, plateaus use **both** models, chosen to suit the being who lives there:

- **Soft mass (chain/rope).** The line has weight; segments are springs; it sags and settles. Rigid-body-ish collisions with fixed lines. Tactile, slow, meditative. Used in *striated* plateaus (rooted beings, walls, lanes).
- **Fields (forces between bodies).** Drawings emit attract/repel fields; your line bends as you draw through them; no hard collisions, only influence. Elegant, fluid. Used in *smooth* plateaus (nomadic beings, open space).
- Some plateaus **blend** or **switch**, and the switch itself is a story beat (e.g. crossing from a ruled region into open field as a moment of release).

### 3.3 Connection (the only "objective")
- Bringing your line into sustained contact between two beings (or a being and the Dot) forms an **assemblage**: a persistent link that does something *neither did alone* — opens a path, calms a frantic refrain, lets a stuck being move.
- Connection is never forced by UI. There is no "press E." You simply draw between them and *hold* until the third thing exists. The game teaches this once, wordlessly, and never again.

### 3.4 Erosion (Movement III only)
- A global slow attractor. Idle trail segments lose mass and fade. Active drawing replenishes. Beings drift toward collapse unless tethered by your lines.
- Tunable, gentle: never twitchy, never a timer on screen. The pressure is ambient.

---

## 4. The beings (characters)

Written in the spirit of *Thomas Was Alone*'s narrator-love, but sparer. Each has: a **form** (how it's drawn), a **refrain** (how it moves), a **problem**, and a **line of dialogue or two** that fades in over negative space. Names are private to us; the player may never see them.

- **Stillpoint** *(the Dot).* Form: a single filled black point. Refrain: stillness — it is the only thing in the world that does not move, and so it is how you measure all motion. Problem: it cannot follow you, and knows it. Voice: short, patient, a little wry. *"You found out you could move. I always knew you'd find out."* / *"Go on. I'll be the place you went from."*

- **Hairpin.** Form: a tight line folded back on itself, like a clamp. Refrain: it flinches — folds tighter when approached. A striated plateau being. Problem: it is holding something shut (itself). Resolution: you draw a line *through* the fold slowly enough that it learns a line can pass without prying. It unfolds into a longer, calmer curve and lets you past. *"I thought a line was a thing that cuts. You came through like water."*

- **Murmuration.** Form: a loose scatter of short dashes that drift as a flock. Refrain: collective wandering, no center. A smooth-space field being. Problem: it has no direction; it wants one but fears choosing. Resolution: you draw a single long sweep and the dashes fall in behind it — not commanded, *invited*. It becomes a current. *"I didn't know I wanted to go anywhere until something went."*

- **The Pair.** Form: two short parallel lines that never touch, locked the same distance apart. Refrain: perfect mirroring — move near one, both shift. Problem: they cannot close the gap themselves; the symmetry forbids it. Resolution: your trail, drawn between them and held taut, becomes the third thing that lets them connect *through* you rather than to each other. (The assemblage lesson, embodied.) *"We were never going to touch. We needed a between."*

- **Ravel.** Form: a dense knotted scribble. Refrain: agitation — vibrates, pulls at itself. A Movement III being, already half-eaten by the collapse. Problem: it is coming apart and over-holding at once. Resolution: you don't untie it; you draw a slack line *around* it so it can loosen without scattering. Care as holding-space, not fixing. *"You didn't pull me straight. You just stayed close while I let go a little."*

- **The Far Point.** Form: the collapse-attractor itself, finally revealed in the Coda to be Stillpoint, dimmed. Refrain: stillness again — but now everything moves *toward* it. Resolution: the Coda (§2).

> Every voice is aphoristic, image-led, never explanatory. No being ever says a feeling-word where a line-of-motion would do.

---

## 5. Telling the story through the flat screen (no UI)

- **No HUD, no menus, no pop-ups, no buttons.** Ever. Pause is the absence of motion; the game does not need a pause button because it does not punish stillness.
- **Text** appears in a warm **serif** (Georgia / "EB Garamond" feel) and **fades in and out of the whitespace** — specifically in regions of the canvas where the player's mouse and drawings are *not*. The text *avoids* you. It finds the empty quarters of the screen and writes there, softly, then fades before you can crowd it. This makes reading a spatial, dynamic act: you keep one region calm to keep a voice present, or you sweep through to dismiss it.
  - **Placement** *(implemented)*: a coarse `9×6` "occupancy" grid accumulates where ink, dot, and cursor are. Each line is placed in the lowest-scoring cell, where score = occupancy **plus an edge penalty** (keeps text off the rim — this is what fixed the old top-left default) **plus a dead-centre penalty** (the dot lives there) **minus a reward for distance from the dot** (the voice speaks away from your hand). A per-placement `jitterSeed` breaks ties so successive lines don't stack in one spot.
  - **Text is ink** *(implemented)*: the voice doesn't print — it **precipitates**. Each line is rasterised to a tiny offscreen canvas; covered pixels become ink particles **held to their glyph positions** by a spring that is strong while young (so the words are legible) and releases with age (`release = f²`), at which point the field carries the letters off as weather and they fade. The voice is the same matter as everything else — fully diegetic, no UI layer, no blend-mode trick. It reads at near-full opacity (fixing the earlier too-faded look) yet still breathes and dissolves.
  - **Dark mode** *(implemented)*: **Space** inverts brightness, easing `theme.mix` 0→1 so background and ink colours cross between paper-white/ink-black and near-black/ink-white. The world breathes between the two rather than hard-cutting. (Beats now advance on **click / arrow keys**, freeing Space for the invert.)
- **No diegetic chrome inside the world.** The only marks *in the canvas* are: the Dot, the beings, your ink, and the precipitated voice. White is not a background — it is the world's substance.
  - **One whisper of chrome** *(implemented)*: a single tiny mark in the top-right corner — a 7px dot at half opacity — is the lone deliberate exception. It is not in the world; it floats above it. On hover it reveals a minimal panel (invert · subsurfaces · about) in the same serif. It uses `mix-blend-mode: difference` so it stays legible over both the light and dark worlds without tracking the theme. Default state is just the dot: present enough to find, quiet enough to forget.
- **Field tuning** *(implemented)*: wells now pull with a **tight short-range core** (`fall²` → small orbit loops) **plus a weak constant tail** (`0.10·strength`, distance-independent) so ink that drifts far always falls back toward the well and the viewport — the attraction is universal even though the loops are small. Repulsion uses `fall²` (no tail) for a tight, clean void.
- **Sound** (later): near-silence with a single soft tone per being-refrain; the Dot's tone is a held, low, unchanging note. Optional, off by default, never required to read the story.

---

## 6. Look & feel

- Palette: paper-white `#FAFAF8`, ink-black `#111`, text grey `#3A3A38`. Beings may use one or two desaturated accents *only if earned* (we'll resist as long as we can; the game wants to stay black-and-white).
- Line quality: slightly soft, anti-aliased, with a faint weight-variation along the trail (heavier where the chain is dense/slow). It should look *drawn*, not vector-perfect.
- Motion: everything eases. Nothing snaps. Even appearance/disappearance is a fade or a settle.
- Typography: serif, generous leading, never more than ~12 words on screen at once. Text is rare and therefore weighty.

---

## 7. Technical plan

- **Single-page, dependency-free.** One HTML file, `<canvas>`, vanilla JS, `requestAnimationFrame`. No frameworks, no build step. This keeps it portable and lets it drop into the Subsurfaces site as a static worker subdomain later with zero infrastructure.
- **Physics:** the live model (see §7b) is field-advected ink, not a chain. Particles integrate with momentum toward a velocity field; fixed-step accumulator for determinism; render decoupled.
- **Performance** *(implemented — these were the real wins):*
  - **Baked field grid.** The expensive curl-noise + per-source math is evaluated once per frame onto a coarse `~36px` grid (`bakeField`); particles read it by **bilinear interpolation** (`sampleField`) — O(1), no trig, no allocation per particle. This was the dominant cost (≈20 trig ops × thousands of particles × substeps → a few hundred bakes total). It is also *more accurate*: interpolating a baked field yields smoother, coherent flow versus independent per-particle noise.
  - **Batched rendering.** Particles are bucketed by quantized (alpha, width) into ~18 `Path2D`s; each bucket is one `stroke()`. This collapses ~4500 draw calls + per-particle state changes into ~18, killing canvas call overhead. Near-still ink renders as a zero-length round-capped segment (a dot) so it shares the same batched path.
  - **No per-frame allocation.** The field out-vector is shared (`ofx/ofy`); particles precompute `invMass`, `invLife`, `grip` at birth to remove hot-loop divides/`sqrt`; the dead are removed by in-place compaction.
  - **Still designed-in for later:** spatial hash for line/field queries in dense plateaus; an offscreen "ink" canvas for settled history once trails persist across a whole plateau.
- **Structure:** a `Plateau` defines its physics mode, beings, text triggers, and transitions. The world is a small graph of plateaus. State is minimal and serializable (which plateaus visited, which assemblages formed) so a save is a few bytes — fitting for a game this light.
- **Deployment:** ships as static assets; Subsurfaces worker subdomain (e.g. `flight.subsurfaces.…`) serves the single page. No backend required for the base game.

---

## 7b. Implemented so far (the field model)

The proof-of-soul moved past the original Verlet chain to the model the player chose: **the dot is carried** (it eases to the cursor) and **sheds ink-matter** it does not keep.

- **The field.** One `fieldAt(x,y)` returns a velocity: a divergence-free **curl-noise** base (the breath of smooth space) plus a sum of **sources**, each warping space by its `kind` — `attract`, `repel`, `swirl`, `flow`, `shiver`, `spiral` (orbit+drain), `gust` (directional shove). These compose; they are faces of one field, not separate mechanics.
- **The ink.** Particles with their own **mass** (skewed small), **momentum** (they ease toward the field and overshoot — matter, not dust), **age-driven diffusion** (a sharp stroke spreads into a soft cloud → becoming-weather), and fade. Inherits a fraction of the dot's velocity, so it is *thrown*. Heavy ink holds together longer; light ink frays. Rendered as a streak when moving, a soft round mark when nearly still, with a faint living pulse.
- **Beats.** The live source-set is a **story state**: `still → well → stone → orbit → vortex → two → current → weather`. Space/→ advance, ← back; each speaks a line on entry. `two` is a counter-rotating pair — the assemblage idea as physics.
- **Events.** A sparse timer spawns **transient sources** that ramp in, live, roam, and dissolve (passing swirl, edge gust, draining sink, heartbeat). Some leave a word in the whitespace. The plateau feels inhabited even when you hold still.

## 8. Build order

1. **Proof of soul** *(done)* — `index.html`: the carried Dot, field-advected ink that diffuses into weather, eight field-states, ambient events, and `difference`-blended serif text that fades in/out of negative space. Movement I's opening, in miniature.
2. Catching/tension against one fixed line; the first being (**Hairpin**) and the wordless connection lesson.
3. Field physics + **Murmuration**; the striated→smooth transition as a felt beat.
4. **The Pair** (assemblage made explicit) and plateau-graph navigation.
5. Movement III erosion + **Ravel**; the Coda.
6. Sound, save, polish, Subsurfaces deploy.

---

*The spec is a living document. The game wants to stay small. When in doubt, remove something and add silence.*

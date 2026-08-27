# The Ridge — art audit and upgrade prompt

Reference: the night-forest concept art (navy sky, cream moon, snow-capped ranges,
hazy pine valley, camp on a rooted cliff, mossy floating rock, two coated roaches).

Build audited at commit `d5b2b24`, level 1 (`woods` theme), 1280×720 canvas.

---

## Part 1 — Audit

### Root cause behind most of the gap

The reference carries roughly **2–3× the detail density** of the build. Two settings
cause that, not the individual art:

1. `PX = 2` in `src/pixel.ts` — every world-space fill lands on a 2px grid.
2. `S = 2` in `src/sprites.ts` — a 32×36 cell sprite only has 16×18 *distinguishable*
   pixels once drawn, so a fedora becomes a blob and eyes become single dots.

Everything downstream inherits that coarseness. Fixing detail per-asset without
raising the effective resolution will keep hitting the same ceiling.

### Element-by-element

| Element | Reference | Build | Gap |
| --- | --- | --- | --- |
| Sky | Navy, dense stars at 3 brightness tiers, faint glow behind the peaks | Navy gradient, sparse single-tier stars | Add star tiers, add a low horizon glow |
| Moon | Bright cream disk, craters, soft wide bloom | Correct size and position, weak bloom, flat craters | Stronger 2-stop bloom, higher-contrast craters |
| Mountains | Jagged multi-scale ridgelines, internal rock facets, snow in finger-like tongues down gullies, haze at base | Smooth triangles, one lit edge band, snow as a clean even cap | Biggest visual gap. Needs ridge noise at 3 scales, facet planes, gullied snow |
| Valley forest | 4–5 bands, front trees large, strong mist between bands | Dense but uniform, front trees too small, mist weak | Scale up front band, vary tree size, deepen mist |
| Cliff pines | ~300–420px, trunk visible through gaps, needle spurs, 3–4 green values | ~200px, flat color bands, trunk hidden, tiers read as smooth cones | Taller, needle detail, more green steps |
| Cliff face | Varied embedded stones (3–16px), darkens toward the base, curving branched roots | Same-size beige lumps in a loose grid (gravel wallpaper), straight roots, no vertical gradient | Vary stone size and tint, add depth gradient, curve and branch roots |
| Floating rock | Irregular mass, mossy overhanging lip, lichen patches, varied fine roots | Near-perfect half-disc, flat grey-green, identical straight roots | Break the silhouette, add lichen, vary roots |
| Characters | ~55px with fedora band and curled brim, large glowing eyes, lapels, hands, cigarette wisp | Correct height, but hat/eyes/coat read as blobs | Raise sprite resolution (see root cause) |
| Tent | Light canvas, ridge pole, folded-back flap, guy lines, crates | A-frame with dark opening and pegs | Add flap, ridge pole highlight, real crates |
| Truck | Defender: roof rack, pale blue glass, round headlight, hubs, spare tire | Recognizable 4x4, thin rack, no spare | Add spare, hubs, headlight bloom |
| HUD | Gold double frame, corner ornaments, portrait, cig + clock icons, cyan bar | Matches closely | Crop portrait to head and shoulders |
| Lighting | Cool moonlight from upper right, blue rim on cliff grass and tree tiers, mist by depth | No global light direction, no rim, mist only in backdrop | Add a moonlight rim pass and depth mist |
| In-world text | None | Two dark sign boxes mid-scene | Show only near the player, or use wooden posts |

### Bugs found while auditing

- `pineTree` in `src/gfx.ts` draws a 2×(7·s) spire above the top tier. When the top
  tier is narrow the spire detaches and reads as a floating needle above the tree.
  Visible on the tall camp pine.
- `woodsNear` pines are anchored at `VIEW_H + 26`, so on tall-camera frames only bare
  trunk shows with its foliage below the viewport.

---

## Part 2 — Implementation prompt

Paste the following as a task.

> ### Task
>
> Raise the art in `The Ridge` (level 1, `woods` theme) of this Vite + TypeScript
> canvas game to match `docs/ridge-art-audit.md`'s reference: a moonlit night forest
> with snow-capped ranges, a hazy pine valley, a camp on a rooted cliff, mossy
> floating rock, and two coated roach characters.
>
> ### Hard constraints
>
> - Do not change collision, physics, or level geometry. `src/levels.ts` platform
>   and hitbox values stay as they are; prop placement may change.
> - Keep `PLAYER_W/H/SLIDE_H` in `src/const.ts` unchanged. Sprites may visually
>   overhang the hitbox.
> - `npx tsc --noEmit` must pass. The repo uses `noUnusedLocals`.
> - No new runtime dependencies and no image files. All art stays procedural canvas
>   drawing, baked once at construction like the current `bakePack` / `bakeGround`.
> - Keep pixels crisp: no `filter`, no blur, no `imageSmoothingEnabled = true`.
> - Bake anything static. Do not add per-frame loops over thousands of pixels; the
>   game must hold 60fps.
>
> ### 1. Raise effective resolution (do this first)
>
> - In `src/sprites.ts`, change the sprite cell scale `S` from `2` to `1` and grow
>   the grid to `W = 44`, `H = 56`. Redraw every pose at the new size so the
>   character is still about 60px tall on screen: fedora with a separate band and a
>   curled brim edge, two 2×2 glowing eyes with dark sockets, a coat with lapels and
>   a lighter collar, arms ending in hands, legs with knees and feet, and a
>   cigarette with a 1px ember.
> - Keep the existing `fit()` bottom-alignment so the last inked row is the feet, and
>   keep `S_PAD` in `src/render.ts` consistent with the new pad.
> - Adjust the draw scale in `drawRoach` so on-screen height stays ~60px.
> - Leave `PX = 2` for world fills, but stop routing fine detail through `prect`
>   where 1px matters: cliff stones, roots, grass, and tree needles should use
>   `ctx.fillRect` with integer coordinates.
>
> ### 2. Mountains (`mountains` in `src/gfx.ts`)
>
> - Build the ridgeline from three noise octaves (scales ~120, ~34, ~9) so the
>   silhouette is jagged rather than a smooth triangle.
> - Add internal facets: split each slope into 2–3 planes with slightly different
>   values, boundaries following a low-frequency noise so they look like rock faces.
> - Snow: instead of a uniform cap, run tongues down gullies. Snow depth should be
>   driven by a per-column noise so its lower edge is ragged, with a few streaks
>   reaching well below the main snowline.
> - Add a haze band where each range meets the one behind it.
> - Keep the moonlit edge on right-falling slopes, but keep it thin (6–12px).
>
> ### 3. Valley forest (`woodsMid` in `src/backdrop.ts`)
>
> - Scale the front band up so its trees are 70–110px tall, and widen the size
>   variance across all bands.
> - Deepen the mist between bands so each band reads lighter than the one in front.
>
> ### 4. Cliff pines (`pineTree`, `branchTier` in `src/gfx.ts`)
>
> - Make the camp pines 300–420px tall.
> - Leave gaps between tiers so the trunk shows through, and give the trunk bark
>   texture at 1px.
> - Add needle spurs along each tier's lower edge instead of a smooth diagonal.
> - Use four green values: moonlit top, mid, shadow, and a near-black underside.
> - Fix the detached spire bug: the top spire must overlap the top tier.
>
> ### 5. Cliff face (`groundFace`, `soilCap` in `src/render.ts`; `dirtTile` in `src/tiles.ts`; `boulders`, `roots` in `src/gfx.ts`)
>
> - Vary embedded stone size from 3px to 16px and tint them grey-brown, not beige.
>   Cluster them; do not distribute evenly.
> - Darken the face progressively toward the bottom so the cliff has depth.
> - Roots: curve them, let a few branch, vary length from 20px to 160px, and keep
>   them in clumps of 2–4.
> - Grass lip: add small yellow flowers and a moss overhang at the left and right
>   edges.
>
> ### 6. Floating rock (`rockIsland` in `src/render.ts`)
>
> - Break the half-disc silhouette with per-row noise so no two islands match.
> - Add lichen and moss patches on the rock sides.
> - Vary root count, length, and thickness per island; let two or three branch.
> - Keep the collision top flat and unchanged.
>
> ### 7. Lighting pass (`src/render.ts`)
>
> - Add a single moonlight direction from the upper right. Apply a 1–2px cool rim
>   highlight on the top-right edges of cliff grass, tree tiers, props, and the
>   character sprites.
> - Add a depth mist that increases with distance behind the play plane, so the
>   valley reads further away than the cliff.
> - Keep it subtle. No bloom, no scanlines, no full-screen tints.
>
> ### 8. Props and UI
>
> - Tent (`pixelTent`): folded-back flap, ridge pole highlight, guy lines, and two
>   crates as separate shapes.
> - Truck (`pixelTruck`): spare tire on the back, wheel hubs, a round headlight with
>   a small warm bloom, pale blue glass.
> - `drawSigns`: fade a sign in only when the player is within ~220px, or replace it
>   with a small wooden post plus the text above it.
> - `paintHero` portrait: crop to head and shoulders instead of the full body.
> - Fix `woodsNear` pine anchoring so bare trunks never appear without foliage.
>
> ### Acceptance
>
> Load level 1 and compare against the reference:
>
> - [ ] Mountain ridgelines are jagged, with snow in tongues and visible rock facets.
> - [ ] Valley reads as four or more depth bands with mist between them.
> - [ ] Camp pines show trunk through the branches and needle detail at tier edges.
> - [ ] Cliff face has varied clustered stone and darkens toward the base.
> - [ ] Roots curve, branch, and hang in clumps.
> - [ ] No two floating islands have the same silhouette.
> - [ ] The characters' fedora band, brim curl, eyes, lapels, and hands are all
>       individually legible at 100% zoom.
> - [ ] A single consistent moonlight direction is visible on foreground edges.
> - [ ] No detached tree spires and no bare trunks.
> - [ ] `npx tsc --noEmit` passes and the game holds 60fps.

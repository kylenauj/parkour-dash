# Pipe Roach

Pixel-art cockroach parkour. You play **Pipe Roach** — a roach-man with a cigarette — through five sewer pipes: jump, wall-kick, dash with the wings out, and **slide-dash** the low flues until you hit the street.

## Play

After a push to `main`, GitHub Pages builds the game automatically:

**https://kylenauj.github.io/parkour-dash/**

To run it on your machine:

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:43173`). **Full crawl** plays all five levels in order. You can also jump into a single pipe from the title screen.

| Action | Keys |
| --- | --- |
| Move | `A` `D` or arrow keys |
| Jump / wall kick | `Space`, `W`, or `↑` |
| Dash | `Shift` or `J` |
| Slide / drop through | `S` or `↓` |
| Slide-dash | Hold `↓` and dash on the ground |
| Talk | `E` |
| Pause | `Esc` or `P` |
| Last valve | `R` |

Walls grab you automatically. Jump while clinging to kick off. Climb shafts by zigzagging, then **jump through the grate** at the top — it is a one-way landing, not a ceiling.

## The five pipes

1. **The Gutters** — jumps, wall-kicks (grate exits), slides, a dash over the drain.
2. **The Filter** — rust, collapsing plates, timed presses, a rust stack you can actually top out.
3. **The Overflow** — currents, acid drips, an updraft shaft, triple kick.
4. **The Flues** — stay low. Slide-dash the sooty tunnels; standing will eat you.
5. **The Grate** — the exam. Kick, slide-dash, wings, daylight.

Pick crumbs, talk to the other smoking roaches, and hunt stashes for secret looks. Unlocks save in the browser. Equip them from the title screen or pause.

## Build

```bash
npm run build
npm run preview
```

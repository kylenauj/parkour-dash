# Pipe Roach

Pixel-art cockroach parkour in three sewer pipes. Play a roach-man with a cigarette, dash with the wings out, and crawl from the gutters to daylight.

## Play

After a push to `main`, GitHub Pages builds the game automatically:

**https://kylenauj.github.io/parkour-dash/**

To run it on your machine:

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:43173`). **Full crawl** plays all three levels in order. You can also jump into a single pipe from the title screen.

| Action | Keys |
| --- | --- |
| Move | `A` `D` or arrow keys |
| Jump / wall jump | `Space`, `W`, or `↑` |
| Dash | `Shift` or `J` |
| Slide / drop through | `S` or `↓` |
| Pause | `Esc` or `P` |
| Last valve | `R` |

## The three pipes

1. **The Gutters** — jumps, wall-kicks, slides, a dash over the drain, and a crumbling plate at the gate.
2. **The Filter** — rust, collapsing plates, timed presses, and tighter stacks. Do not linger.
3. **The Overflow** — currents, acid drips, an updraft shaft, and a last hop to the street grate.

Dash unfurls a burst of roach wings. Land to refresh it. Touch a vertical pipe and press jump to kick — you do not have to hold into the wall. Falls send you back to the last valve. Optional crumbs score a cleaner run.

## Build

```bash
npm run build
npm run preview
```

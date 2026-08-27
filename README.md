# Pipe Roach

Pixel-art cockroach parkour. Play a roach-man with a cigarette, smoke the rusted pipes, and dash the toxic drains.

## Play

After a push to `main`, GitHub Pages builds the game automatically:

**https://kylenauj.github.io/parkour-dash/**

To run it on your machine:

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:43173`). Click **Start run**, then use the keyboard — or the on-screen buttons on a phone.

| Action | Keys |
| --- | --- |
| Move | `A` `D` or arrow keys |
| Jump / wall jump | `Space`, `W`, or `↑` |
| Dash | `Shift` or `J` |
| Slide / drop through | `S` or `↓` |
| Pause | `Esc` or `P` |
| Last checkpoint | `R` |

## How it feels

The roach uses coyote time, jump buffering, short hops if you tap jump, automatic wall cling, a single air dash that shoots the wings out, and a slide that fits under low pipes. Touch a vertical pipe and press jump to kick to the other side — you do not have to hold into the wall. Falls send you back to the last valve. Grab optional crumbs for a cleaner score at the drain.

## Build

```bash
npm run build
npm run preview
```

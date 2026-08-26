# Skyline

A short rooftop parkour platformer you play in the browser. Sprint dusk-lit ledges, wall-jump a neon alley, slide under ducts, and dash the last gaps to the antenna.

## Play

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

The runner uses coyote time, jump buffering, short hops if you tap jump, wall slides, a single air dash, and a slide that fits under low ceilings. Falls send you back to the last lamp you tagged. Grab optional gold orbs for a cleaner score at the antenna.

## Build

```bash
npm run build
npm run preview
```

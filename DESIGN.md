# Design spec

Editorial, spec-sheet portfolio. Type, rules and alignment carry the design, not effects. Audience: new-grad SWE recruiters, so keep it technical and restrained.

## Banned (AI-template tells)
Don't reintroduce any of these:
- Blurred glow blobs, radial "aurora" gradients, masked grid backgrounds, film grain.
- Glow box-shadows or `--pink-glow`, glassmorphism (`backdrop-filter` on cards or badges).
- A centered hero with eyebrow + giant name + two pill CTAs + "Scroll" hint.
- Marquees and tickers.
- Cursor glare, 3D tilt on hover, magnetic buttons, pulsing "live" dots.
- Pill buttons (`border-radius: 999px`) and a slide-up fill on hover.
- Space Grotesk, Inter, Geist.
- Slogans: "Things I've built.", "Let's build something.", "Selected work".
- `01 / 05` counters with a trailing dash.

## Tokens
| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0b0c` | page |
| `--bg-2` | `#131315` | media frames |
| `--fg` | `#f2efe9` | primary text (warm off-white, not blue-white) |
| `--fg-2` | `#b9b4ad` | body copy |
| `--muted` | `#86817b` | metadata (≥4.5:1 on --bg) |
| `--pink` | `#ff3258` | ink only: numbers, rule accents, link underlines, hovered rows |
| `--pink-solid` | `#e5143d` | the only filled surface (focus ring / selection) |
| `--rule` | `rgba(242,239,233,.14)` | hairlines |
| `--rule-strong` | `rgba(242,239,233,.32)` | section rules |
| radius | `0`; `2px` on media frames | |

Pink never glows. It shows up as small, flat marks.

## Type
- **Display:** Archivo Variable, `font-stretch: 125%` (width axis), weight 800, tight tracking (-0.03em). The name, project titles and contact email.
- **Body:** Archivo Variable, `font-stretch: 100%`, weight 400, 17–18px, line-height 1.55, max 62ch.
- **Meta:** JetBrains Mono Variable, 12–13px, uppercase only for column labels, letter-spacing .04em.
- Scale: name `clamp(3.5rem, 12vw, 11rem)`, project title `clamp(2.2rem, 5vw, 4rem)`, section label 13px mono.

## Grid
- 12 columns, `--gutter: clamp(1rem, 4vw, 3rem)`, max width 1320px, everything left-aligned.
- Sections open with a full-width `--rule-strong` hairline, and a mono label sits on the rule (e.g. `Index`, `Contact`).

## Components
- **Nav:** a thin top bar. Left: `Sai Bhandar` in mono. Right: `Index`, `Contact` as mono links. Solid `--bg` after scrolling, with a bottom hairline and no blur.
- **Hero:** the name in expanded display type (may break onto two lines: `Sai` / `Bhandar`), then `Business + CS @ CMU` in body size. Directly below is the project index table:
  - Columns: `No.` (mono, pink) | `Project` (display, 125% width, ~1.6rem) | `What it is` (kicker) | `Stack` (first 3 tags, mono, muted). Desktop only for the last two; mobile shows No. + Project + kicker.
  - Each row is an `<a href="#slug">` separated by hairlines. On hover, the row text turns `--fg` and the number shows an arrow `→`.
- **Project:** `<article>` opening on a rule.
  - Header row: pink mono number `01`, then the title in display type. The kicker sits beneath in mono muted.
  - Two columns on desktop (5/7): the text column has the summary, then bullets as an `<ol>` of numbered notes (`1.` mono pink, bold lead-in), then a `<dl>` of `Stack`, `Award` (if any), `Links`.
  - Links: underlined text with `↗`, and the underline turns pink on hover. No pills.
  - Media column: `<figure>` with a square-cornered frame (2px radius, 1px `--rule` border, no shadow) and a `<figcaption>` in mono: `Fig. 1 — Sidequest gameplay, recorded from the WebGL build`.
  - Carousel controls: square 32px mono buttons `←` `→` plus a `1 / 3` counter, all in the caption row, not overlaid on the image.
  - The phone mock stays, but flat: a thin 1px border frame and no gradient or glow. The QR sits beside it as a plain bordered box.
- **Contact:** a mono label `Contact` on a rule. Below it the email is set in display type at large size, linked, with a pink underline on hover. Then one muted line: `Carnegie Mellon University · Pittsburgh, PA`.
- **Footer:** mono, muted: `© 2026 Sai Bhandar` · `Built with Astro` · `Back to top ↑`.

## Motion
- Transform/opacity only; no preloader and nothing that delays content.
- Rules draw in with `scaleX` 0→1 (left origin, 0.8s) as sections enter.
- Text lines and index rows fade and rise 12px, staggered 40ms.
- Video autoplays in view and pauses out of view (existing behaviour).
- `prefers-reduced-motion`: no transforms, everything visible immediately.

# Design spec

This is a light, minimalist portfolio. Type and whitespace carry the design, and there's one accent colour. It's aimed at new-grad SWE recruiters, who should be able to tell who Sai is and what Sai built within five seconds. The references behind these choices are in [docs/REFERENCES.md](docs/REFERENCES.md).

## Banned
Keep all of these out. Some are AI-template tells, some are dark-editorial leftovers.
- Glow blobs, aurora or radial gradients, masked grid backgrounds, film grain, gradient text.
- Glow box-shadows, glassmorphism (`backdrop-filter`), drop shadows on cards.
- A centered hero with eyebrow + giant name + two pill CTAs + "Scroll" hint.
- Marquees, cursor glare, 3D tilt, magnetic buttons, pulsing "live" dots.
- Pill buttons (`border-radius: 999px`), slide-up fills on hover, filled CTA buttons.
- Space Grotesk, Inter, Geist, Roboto.
- Slogans: "Things I've built.", "Let's build something.", "Selected work".
- Scroll-jacking (Lenis or other smooth-scroll libraries), scroll progress bars, side-dot indexes, parallax.
- Expanded or ultra-bold display type, and full-width heavy rules everywhere. That was the dark editorial look; this version is quieter.
- A second accent colour.

## Tokens
Every contrast ratio below was measured against `--bg`.

| Token | Value | Contrast | Use |
|---|---|---|---|
| `--bg` | `#f6f4ef` | | page (warm off-white) |
| `--surface` | `#ece9e2` | | media placeholder behind video/images |
| `--fg` | `#151412` | 16.8:1 | headings, primary text |
| `--fg-2` | `#3d3a35` | 10.3:1 | body copy |
| `--muted` | `#6b675f` | 5.1:1 | metadata, captions |
| `--accent` | `#c8102e` | 5.4:1 | project numbers, link hover and underline, focus ring, selection |
| `--rule` | `rgba(21,20,18,.12)` | | the few hairlines that remain |

`color-scheme: light`; theme-color is `#f6f4ef`.

## Type
Two families, both self-hosted through @fontsource:
- **Display:** Instrument Serif 400 (roman and italic). Used for the name, project titles and the contact email. It adds character without adding weight.
- **Text:** Archivo Variable at `font-stretch: 100%`, weights 400/500/600. Used for body copy and all UI and metadata. Numbers use `font-variant-numeric: tabular-nums`.
- JetBrains Mono is dropped, because a third family isn't minimal.

Scale:

| Role | Size | Line height | Other |
|---|---|---|---|
| Name | `clamp(2.75rem, 7vw, 4.75rem)` | 1.0 | letter-spacing -0.01em |
| Project title | `clamp(1.9rem, 4vw, 2.6rem)` | 1.05 | |
| Body | 17px | 1.65 | |
| Metadata and captions | 13–14px, Archivo 500 | | `--muted` |

## Layout
- One centered column, `max-width: 720px`, with gutter `clamp(1.25rem, 5vw, 2rem)`. Everything left-aligned.
- Vertical rhythm is multiples of 8px. Sections are separated by space (`clamp(4rem, 12vh, 7rem)`), not by rules.
- Measure is at most 65ch.

## Components
- **Nav:** static, not fixed. `Sai Bhandar` on the left, `Work` and `Contact` on the right, all text at 15px.
- **Hero:** name, then the tagline `Business + CS @ CMU` in `--fg-2`. Below that is the index: a plain `<ol>` of 5 rows. Each row is `01` (accent, tabular), the project title in Archivo 500, and the kicker in `--muted`. Only the first 2 kicker items show on mobile. Rows have no rules. On hover the title gets an accent underline.
- **Project:** an `<article>` with:
  - a small accent number `01`;
  - the title in Instrument Serif;
  - the kicker in `--muted`;
  - the media (`<figure>` with 6px radius, `--surface` background, no border or shadow, and a `figcaption` in `--muted` 13px);
  - the summary;
  - the notes as a compact `<ol>` (accent numerals, bold lead-in);
  - a `<dl>` of two or three short rows (Stack, Award, Links) with a thin top rule;
  - links as underlined text with `↗`, where the underline turns accent on hover.
  Projects are separated by space plus one `--rule` hairline.
- **Carousel controls:** `←` `1 / 3` `→` as small text buttons in the caption row, each at least 32px tall.
- **Phone mock (Lazer Shooter):** a thin `--rule` outline with no fill gradient. The QR card is a plain outlined box.
- **Contact:** the heading `Contact` in Archivo 500 `--muted`. Below it, the email in Instrument Serif at `clamp(1.75rem, 5vw, 2.75rem)`, underlined, accent on hover. Then the location line in `--muted`.
- **Footer:** one line in `--muted` 13px: `© 2026 Sai Bhandar` · `Back to top ↑`.

## Motion
- CSS transitions plus a small IntersectionObserver. GSAP, SplitText and Lenis are removed.
- Page load: the name, tagline and index rows fade in with a 4px rise, staggered 40ms, in 400ms total.
- Scroll: each project fades in once (opacity only, 500ms) as it enters.
- Video autoplays in view and pauses out of view. Carousels use native scroll-snap.
- `prefers-reduced-motion`: nothing animates, and everything is visible immediately. Without JS, everything is visible.

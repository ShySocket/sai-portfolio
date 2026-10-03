---
name: Sai Bhandar portfolio
description: B, Editorial. A broadsheet index on paper white: a huge name, true black ink rules, Schibsted Grotesk over Newsreader, one signal orange.
colors:
  paper: "#fafaf8"
  panel: "#ecece8"
  ink: "#0b0b0b"
  ink-2: "#55554f"
  rule: "#0b0b0b"
  hair: "rgba(11, 11, 11, 0.14)"
  img-edge: "rgba(11, 11, 11, 0.08)"
  accent: "#f0480e"
  accent-ink: "#b83200"
  accent-tint: "#f8d3c5"
  focus: "#f0480e"
  chart-1: "#3d3d3a"
  chart-2: "#74746f"
  chart-3: "#9b9b96"
  chart-4: "#afafaa"
  chart-5: "#c9c9c4"
typography:
  name:
    fontFamily: "Schibsted Grotesk, Schibsted Grotesk fallback: Arial, sans-serif"
    fontSize: "100cqi / 5.66 (199px at 1440, 63px at 390)"
    fontWeight: 800
    lineHeight: "0.86"
    letterSpacing: "-0.04em"
  display:
    fontFamily: "Schibsted Grotesk, Schibsted Grotesk fallback: Arial, sans-serif"
    fontSize: "clamp(40px, 4px + 10.9vw, 160px)"
    fontWeight: 800
    lineHeight: "0.9"
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Schibsted Grotesk, Schibsted Grotesk fallback: Arial, sans-serif"
    fontSize: "clamp(36px, 19.2px + 3.4vw, 64px)"
    fontWeight: 800
    lineHeight: "1"
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Schibsted Grotesk, Schibsted Grotesk fallback: Arial, sans-serif"
    fontSize: "clamp(22px, 18px + 0.4167vw, 24px)"
    fontWeight: 800
    lineHeight: "1.3333"
    letterSpacing: "-0.015em"
  lede:
    fontFamily: "Newsreader, Newsreader fallback: Times New Roman, serif"
    fontSize: "clamp(20px, 18.4px + 0.35vw, 22px)"
    fontWeight: 400
    lineHeight: "32px at 22px (1.4545)"
  body:
    fontFamily: "Newsreader, Newsreader fallback: Times New Roman, serif"
    fontSize: "clamp(18px, 17.12px + 0.2vw, 19px)"
    fontWeight: 400
    lineHeight: "30px at 19px (1.5789)"
  ui:
    fontFamily: "Schibsted Grotesk, Schibsted Grotesk fallback: Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px (32px in link rows)"
  meta:
    fontFamily: "Schibsted Grotesk, Schibsted Grotesk fallback: Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: "22px"
  code:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "0.86em"
    fontWeight: 400
rounded:
  none: "0"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
  "9": "96px"
  "10": "128px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    fontWeight: 700
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  text-link:
    textColor: "{colors.ink}"
    underline: "max(2px, 0.06em) {colors.accent}, offset 0.24em"
  text-link-hover:
    textColor: "{colors.accent-ink}"
    underline: "{colors.accent-ink}"
  play-control:
    textColor: "{colors.ink}"
    typography: "{typography.meta}"
    fontWeight: 600
    underline: "2px {colors.accent}"
    hitArea: "44px"
  contact-deck:
    typography: "{typography.title}"
    fontWeight: 600
    lineHeight: "32px"
  contact-footer:
    typography: "{typography.headline}"
    rule: "2px {colors.rule} above"
  frame:
    backgroundColor: "{colors.panel}"
    aspectRatio: "16 / 9"
    edge: "inset 1px {colors.img-edge}"
    rounded: "{rounded.none}"
  facts-row:
    label: "{typography.meta}"
    value: "{typography.ui}"
    separator: "1px {colors.hair}"
    padding: "16px 0"
  caption:
    typography: "{typography.meta}"
    textColor: "{colors.ink-2}"
    maxWidth: "552px"
    gapAbove: "12px"
  award:
    typography: "{typography.meta}"
    fontWeight: 600
    iconColor: "{colors.accent}"
    iconSize: "16px"
---

# Design System: Sai Bhandar portfolio

This file records direction B, Editorial, as frozen for v3 (picked by Sai on 2026-10-01 from the prototype in `autopilot/artifacts/sai-portfolio-v3/directions/B/`). The tokens in the frontmatter are the ones in `src/styles/global.css` `:root`, and that stylesheet is the source of truth: when the two disagree, fix this file. Slot widths and every `sizes` string come from `src/styles/slots.ts`. Product rules (audience, fixed copy, project order, performance, accessibility) live in [PRODUCT.md](PRODUCT.md); the information architecture and acceptance tests live in the v3 brief. Neither is repeated here.

## Overview

**Creative North Star: "The Broadsheet Index"**

The site is set like the front page of a broadsheet. The name runs the full measure at the top in black 800 weight, a 2px rule cuts under it, and the work follows as an index: five rows of identical shape, each a framed piece of proof on the left and its title, one claim, its techniques and its links on the right. A case study is a feature: a huge title, a full width rule, the lede beside a rail of facts, the hero, then Problem, Approach and Outcome, each opened by a rule with its head in the margin. Structure comes from ink rules and the column grid, not from boxes.

Paper white because recruiters read in daylight on laptops; true black because the type is the design; one signal orange because the page needs exactly one thing that says "this is live": the underline of every link, the focus ring, the award mark and the single filled button on a case study. Nothing moves on its own except the home row 1 loop. Everything is in place at first paint, with or without JavaScript.

**Key characteristics:**
- A name set to the measure (ink width 5.652em, sized in container units so it spans the column exactly at every width).
- One 12 column grid (8 under 1024, 4 under 640); every left edge lands on a column line, on both page types.
- Schibsted Grotesk for everything that names or labels, Newsreader for everything that is read.
- Rules, not cards: a 2px rule under the name and over the footer, 1px ink rules opening sections, hairlines between items.
- Square corners everywhere. Flat: no shadows, no gradients, no glass.

## Colors

A warm-neutral paper, near-black ink and one orange in three tones: the accent itself for graphics, a darker tone for orange text, a tint for selection.

### Primary
- **Signal Orange** (`accent`, #f0480e): graphics only. Link underlines, the focus ring (3.56:1 on paper, above the 3:1 non-text floor), the award mark, the filled button (ink label on it 5.28:1), the Play control's underline. Never text.
- **Orange Ink** (`accent-ink`, #b83200): the accent when it has to be text, such as a hovered link (5.75:1 on paper, 5.07:1 on panel).
- **Orange Tint** (`accent-tint`, #f8d3c5): `::selection` (ink on it 14.17:1).

### Neutral
- **Paper** (`paper`, #fafaf8): the page, and the browser chrome (`theme-color` is read from this token at build time by `Base.astro`).
- **Ink** (`ink`, #0b0b0b): all primary text (18.83:1 on paper), the structural rules, the button hover fill.
- **Ink 2** (`ink-2`, #55554f): Meta text: the technique line, captions, facts labels, table heads (7.18:1 on paper, 6.34:1 on panel).
- **Panel** (`panel`, #ecece8): the letterbox inside a media frame.
- **Hair** (`hair`, ink at 14%): separators between rows, facts and table rows. Decorative only (1.35:1).
- **Image edge** (`img-edge`, ink at 8%): a 1px inner edge on every frame so pale screenshots do not dissolve into the paper.
- **Chart greys** (`chart-1` to `chart-5`): data bands and series in charts, darkest to lightest. Never text.

### Named Rules
**The One Orange Rule.** The accent appears only as an underline, the focus ring, the award mark, the Play underline, the button fill and the selection tint. It never colours a heading, body text, a background area or a piece of media, and there is no second hue.

**The Ink Is the Structure Rule.** A 1px or 2px ink rule means "a new part starts here" (masthead, work index, intro, each section, footer). Between items of the same kind the separator drops to a hairline.

## Typography

**Display and interface:** Schibsted Grotesk Variable (weights 400 to 900; used at 500, 600, 700 and 800), latin subset, self-hosted through Astro's Fonts API and preloaded because it sets everything above the fold.
**Reading:** Newsreader Variable (weights 200 to 800; used at 400 and 500), the 16pt master, which is the optical size of 18 to 22px text. Latin subset, not preloaded.
**Code:** the platform monospace (`ui-monospace`, SF Mono, Menlo, Consolas), for file names and commands inside prose only.

Both faces ship one latin woff2 each (47 KB and 58 KB) with Astro's metric-matched local fallbacks (Arial at 104.5%, Times New Roman at 105.5%), so the swap does not move the layout. No italic files ship and `font-synthesis` is off: emphasis is weight (Newsreader 500), never a fake oblique.

**Character:** a newspaper pairing. The grotesk is dense and black at display sizes and plain at 15px; the serif makes the claims and prose read as sentences rather than interface.

### Hierarchy
- **Name** (Schibsted 800, line height 0.86, tracking -0.04em): `Sai Bhandar` on home only, sized `100cqi / 5.66` so its ink spans the measure (199px at 1440, 63px at 390), pulled left by its 0.018em side bearing so the ink sits on the column line.
- **Display** (800, 40 to 160px, 0.9, -0.04em): each case study's title. "Lazer Shooter", the longest, fits one line from 320 up.
- **Headline** (800, 36 to 64px, 1.0, -0.035em): home row titles, the next project title, the footer contact row.
- **Title** (800, 22 to 24px, 32px line, -0.015em): section heads. The tagline uses it at 700, the home contact column at 600.
- **Lede** (Newsreader 400, 20 to 22px, 32px line at 22): the About, every row claim, each case study lede, the next project claim.
- **Body** (Newsreader 400, 18 to 19px, 30px line): prose, at most 552px (about 60 characters). H3 is Schibsted 700 at body size.
- **UI** (Schibsted 600, 16px): text links in rows, the header, facts values (500), the button (700).
- **Meta** (Schibsted 500, 15px, 22px line, Ink 2): techniques, captions, facts labels, table heads, the award line (600, ink). Nothing on the site is smaller than 15px.

Display and headline sizes are fluid between 390 and 1440; the reading sizes move by at most 2px. Headings, captions, claims and the tagline use `text-wrap: balance`; paragraphs, list items and facts values use `pretty`. Text boxes are trimmed to cap height and baseline (`text-box: trim-both cap alphabetic`) wherever a gap is measured from ink, so the spacing scale is what the eye sees.

### Named Rules
**The 15px Floor Rule.** Meta is 15px and nothing goes below it. A label that does not fit at 15px gets shorter, not smaller.

**The No Tabular Figures Rule.** Schibsted Grotesk's `tnum` also sets the period, comma and colon on the figure width, which opens holes in "1.54 m/s" and in comma lists. Figures stay proportional everywhere.

## Layout

### Grid
| Width | Columns | Margins | Gutters | Container |
|---|---|---|---|---|
| under 640 | 4 | 16 | 16 | fluid |
| 640 to 1023 | 8 | 32 | 24 | fluid |
| 1024 and up | 12 | 48 | 24 | 1128 max (columns of 72), reached at a 1224 viewport |

Margins grow to the safe-area insets on notched phones (`viewport-fit=cover`). The grid is in px, not rem, because its slots are image widths and must not grow with text zoom; type and spacing are in rem.

### Slots and density
Every image, poster and video is drawn at or below half its native width at 1440 (density 2.0 or more on a 2x screen) and at 1.5 or more at 320, 390, 768 and 1024. The slots, from `src/styles/slots.ts`:

| Slot | Columns at 1024+ | CSS px at 1440 | Smallest source | Under 1024 |
|---|---|---|---|---|
| Wide | 4 to 12 | 840 | 1680 | full width |
| Figure (home rows) | 1 to 6 | 552 | 1104 | cols 1 to 4 of 8; full width under 640 |
| Figure (case) | 4 to 9 | 552 | 1104 | never wider than 552 |
| Detail | 3 columns, three across | 264 | 528 | a third of the column |
| Prose, captions | 4 to 9 | 552 max | | full width, 552 max |

Densities of the v3 media at 1440: Sidequest poster 3.48 in Figure and 2.29 in Wide; loop video 2.32; ReliefIQ map 3.10; Sunrise scene 2.01 (the binding case, which is why the case Figure never passes 552); GyroBlaster screen 2.03; Lazer screens 2.0 (they ship 1x, 1.5x and 2x of the width they draw at, 206 on home and 334 in the hero, from 1179 px captures).

### Home anatomy
- **Masthead:** 40px top (32 from 640, 24 under), the name, 24px to a 2px rule (16 under 640), 32px to the deck (24 under 640).
- **Deck:** from 1024, tagline and About in columns 1 to 6, the contact column (Résumé, GitHub, LinkedIn, Email) in 8 to 12 on the same 32px line grid, so Résumé sits on the tagline's baseline and each next link on an About line. From 640 to 1023 the contact row runs horizontally 24px under the About; under 640 it sets as two columns on column lines 1 and 3 (Résumé, GitHub over LinkedIn, Email), because one line does not fit every phone width and a wrap would leave one word alone.
- **Work index:** 64px under the deck (48 under 1024), a 1px ink rule, then five rows padded 48 (40 from 640, 32 under), hairlines between them. Media in columns 1 to 6, text in 8 to 12 (1 to 4 and 5 to 8 from 640; stacked under 640 with the title 24 under the media).
- **Row text:** one top aligned flow. Title cap height on the media's top edge, claim 24 under the title's baseline, techniques 16, award 8, links 24. Never pinned to the media's bottom.
- **Footer:** the section gap, then the contact row at headline size under a 2px rule, its second and last appearance. From 1024 it is one line; under 1024 it sets as two columns on the grid (column lines 1 and 3 under 640, 1 and 5 from 640), Résumé and GitHub over LinkedIn and Email, because one line does not fit and a wrap left Email alone (768) or a ragged second line (390). Under 360 two columns are narrower than LinkedIn at 36px, so it wraps as words. The columns are half-width flex items that never shrink below their word, so with wider text spacing (WCAG 1.4.12) or larger text a word that outgrows its column takes its own line instead of running into the next.

### Case study anatomy
- **Header:** the name (linking home) and the contact row on one line from 640, a 1px ink rule under; at most 73px tall.
- **Intro:** 64px (48 under 1024) to the display title, 64 (48) from its baseline to a full width ink rule. The lede (columns 4 to 10, 552 max) and the facts rail (1 to 3) both start 24 below that rule, cap height to cap height. The hero (Wide, 4 to 12) sits 48 under the lede. The rail is sticky only at 1024 wide and 720 tall or more. Under 1024 the rail sits under the lede with its own ink rule, label and value side by side (label in column 1 and value in 2 to 4 under 640, as direction B draws it at 390; label in 1 and 2 and value in 3 to 8 from 640), then the hero. Under 360 they stack, because the widest button needs more than three columns there.
- **Sections:** the section gap (96, 64 under 1024), a 1px ink rule, the head 24 below it in columns 1 to 3, the body in 4 to 12 as a subgrid: prose and Figure in 4 to 9, Wide and strips in 4 to 12. Under 1024 the head stacks 24 above the body.
- **Approach subsections:** 64 apart; H3, 12, prose, 32, figure; captions 12 under media.
- **Next project:** a section like the others with the next title at headline size, its claim 32 under (the title is a link and its underline hangs 12px below the baseline), then the "All work" link 24 under that.

### Rhythm
One spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Inside a group the steps are 4 to 16; between groups 24 to 48; between parts 64 to 96. Above a section or sub head there is at least twice the space below it.

### Fold budgets (measured on the specimen)
- 1440 by 900: name, tagline, the whole About, all four contact links, and row 1's media, title, claim, techniques and links (media bottom at 857). Five tab stops before row 1's claim.
- 390 by 844: name, tagline, About, the contact row and row 1's whole media (bottom at 718 with a 7 line About).

## Elevation & Depth

Flat. No shadows, gradients, blurs or glass. Depth is never cast; it is drawn: rules (2px ink for the page's major cuts, 1px ink for parts, hairlines between items) and the frame's 1px inner image edge. There is no z-index on the page.

### Named Rules
**The Drawn Not Cast Rule.** If something needs separating, rule it. If it needs grouping, move it closer. Never lift it with a shadow or put it in a card.

## Shapes

Every corner is square (`--radius: 0`): frames, the button, the focus ring. No pills, no rounded cards. Media frames are 16:9 (Details 9:16) and the panel shows as a letterbox when a source is not exactly that shape.

## Components

### Contact row
One component in three sizes, always in the order Résumé, GitHub, LinkedIn, Email: the deck (title role at 600, a 32px line), the case study header (UI, 24px line), the footer (headline). Each link is an inline block so its line box is its hit area.

### Work row (home)
`li.work__item` (the row padding and the hairline) around `div.work__body.grid`, the part a press scales: the frame (a link to the case study, out of the tab order and hidden from assistive tech, since the title links to the same place), then the text flow: H2 title (a link with a transparent underline that turns orange on hover, or while the media or "Case study" is hovered or pressed), the claim, the techniques line, the award, the links row ("Case study", plus Play or Watch). Row 1's loop moves on its own, so it carries the Play/Pause control 12px under its media, on the media's column line, in the figure caption's style (WCAG 2.2.2); the text column spans both lines (an auto track, then a 1fr one that a row without a caption leaves empty), so the title offset is the same in every row and every row ends 48 (40, 32) under its own content.

### Frame
A 16:9 panel with a 1px inner edge. Its picture, image or video fills it absolutely, so a video layered after its poster covers it exactly; media are `object-fit: contain`, except a still within 2% of 16:9, which fills the frame (`cover`, trimming at most 1% per edge) rather than showing hairline letterbox bars. `.frame--screens` centres phone screens at full height less 24px (16 under 1024), each drawn through a window centred on the screen when the data gives one (`Screens.view`): Lazer Shooter's 1179 by 2556 captures show their middle 1179 by 1500, which holds every control, as in the B prototype, so each screen draws 1.7 times as wide as the whole screen would. `.frame--tall` is 9:16.

### Figure and caption
A frame plus a Meta caption 12px under it, at most 552px wide, balanced. A video's caption starts with the Play control (`PlayButton.astro`), run in at the start of the first line so every caption line starts on the column line: Meta at 600 with a 2px orange underline under the word and a 44px hit area made of padding that negative margins give back, so the caption keeps its rhythm. "Play" and "Pause" share one grid cell, so the button is always as wide as "Pause" and the caption never moves when it toggles. It shows from first paint under the head's `js` class (never revealed by the late script, which would shift the caption), and not at all without JS or after a video fails, where the hero keeps its native controls.

### Facts rail
A `dl` of rows, always in the order Role, Team, When, Stack, Links; a row with no sourced value is left out rather than filled (ReliefIQ has no public link, so no Links row): label in Meta, value in UI at 500, 12px between when stacked (the same ink gap as between the value's own lines), rows 16px apart with hairlines. The Links row holds the page's only filled button and any text links. For Lazer Shooter a QR code (160px) follows, shown only to fine pointers; it overhangs empty paper on the left by its 4-module quiet zone so the code's edge sits on the column line.

### Button
One per case study, none on home: orange fill, ink label at 700, 48px tall, 24px side padding (16 from 1024 to 1099, where the rail is 214 to 233px and "Play on your phone" needs 219), square. One line at default sizes; with a larger default font it wraps inside its column, never past it. A transparent 2px border, inside the 48px, becomes its outline in forced colours. Hover (fine pointers) and press (every pointer): ink fill, paper label. Press: scale 0.97.

### Text link
Ink text, a 2px (0.06em at large sizes) orange underline 0.24em below the baseline (0.12em on headline sized links). Hover (fine pointers) and press (every pointer): Orange Ink text and underline. A link never scales.

### Award
Meta at 600 in ink with a 16px drawn medal in orange before it.

### Table
Real rows: the head in Meta over a 1px ink rule, the row labels in Newsreader, values right aligned in Schibsted 700 at lede size, hairlines between rows, the caption under the table.

### Chart
Inline SVG in the chart greys with ink for the series that matters; labels in Schibsted 500 at Meta size, in user space that no viewBox scales. The level strip labels its surfaces in place from 640 (leaders for labels that do not fit their band, laid out at build time for 576px of 15px labels, each as near its band's centre as it can sit, so neighbouring narrow bands never put two leaders side by side) and with a swatch key under 640, or wherever the chart is narrower than 38.4em of its labels (a larger default font). Its label rows sit in em under the bands, so they spread as the text grows. In forced colours, chart ink takes `CanvasText` and chart greys `GrayText`, since contrast themes keep SVG paint.

### States and browser surfaces
- Focus: a 2px orange outline offset 3px on every focusable, and on a video while any of its native controls has focus.
- Forced colours (Windows contrast themes): the system palette repaints everything but SVG paint and the flow diagram's drawn markers, so the charts and the diagram set `CanvasText` and `GrayText` themselves, and the button keeps its box through its transparent border.
- Selection: Orange Tint under ink. Caret and form accents: orange. Scrollbar: Ink 2 on paper.
- Hover lives only under `(hover: hover) and (pointer: fine)`.
- Share card and icons (`node scripts/og.mjs`, run after a token, font or title change): `public/og.jpg` is the home masthead at 1200 by 630, the name to the measure over a 2px rule, the tagline and the five titles beside the Sidequest poster, the ink centred vertically; home and Lazer Shooter share it, the other case studies use their hero frame. The favicon and touch icon are a paper "S" in Schibsted Grotesk 800 on an ink square.

### Motion
One authored moment: the home row 1 loop, muted, in view, never under reduced motion or Save-Data. Everything else answers the visitor, and nothing runs longer than 200ms:
- **Tokens.** `--ease-out` cubic-bezier(0.23, 1, 0.32, 1) for presses, the poster fade and the page morph; plain `ease` (`--ease-colour`) for colour, as hover and colour changes want. `--dur-colour` 150ms (link and underline colour, button fill), `--dur-press` 160ms (press scale), `--dur-state` 200ms (poster to video), `--dur-move` 200ms (page morph).
- **Hover** (fine pointers only): links and Play turn Orange Ink; the button fills ink; a row's title takes its orange underline when the title, the media or "Case study" is hovered (its text stays ink: orange at 64px is too loud for something seen this often).
- **Press** (every pointer): the hover colours while held, so touch gets the same answer, and no grey tap flash. Scale 0.97 on the button and Play; 0.99 on a home row's body when its media, title or "Case study" is pressed, with a fine pointer only (on a phone a finger starting a scroll on the media would make the row shimmer). Text links never scale.
- **Video** (`src/scripts/video.ts`). One intent per video (none, auto, user-play, user-pause); the label follows the intent, never media events, and swaps instantly (it answers a click or a key). The page only pauses for the system (under a quarter in view, tab hidden) and resumes what the intent still wants, so a visitor's Pause is never overridden; on home it also holds through a reload in the same session. The loop is armed after load and an idle moment, so no video byte competes with the first paint. Heroes drop their native controls with JS: the caption button or a click on the frame toggles. A video stays hidden until its first frame is on screen, then fades in over its poster in 200ms (GyroBlaster's and Sunrise's posters are later frames, so the start dissolves in instead of jumping). A failed video turns static: the poster, native controls on a hero, no button.
- **Page morph** (cross-document view transition, no router script). Between home and a case study the media frame the visitor clicked moves and scales into the case hero, and back, in 200ms on `--ease-out`; the rest of the page cuts, because crossfading two pages of 160px type only ghosts them. The inline script in `Base.astro` names only that pair (`vt-media`), and only when both ends are on screen and the arriving image is decoded; anything else, and case to case, is a plain cut, with no layout shift. Inside the moving frame there is no crossfade: the arriving picture scales from the first frame (Lazer Shooter's screens sit a fixed 24px inside frames of two sizes, so two copies would never line up). Speculation rules prerender home and the case studies on hover intent in Chrome, so the hero is decoded on click. Chrome and Safari 18.2+; other browsers navigate as before. `video.ts` is inlined by `PlayButton.astro` (no module request): an external module script on the arriving page made about half of Chrome's transitions skip.
- **Reduced motion and Save-Data.** The scales and the page morph go; colour fades and the poster fade stay, because they carry state, not movement. The loop stays on its poster with Play offered, and fetches nothing until pressed.
- No entrances, no scroll effects, no preloader, no smooth scrolling, no `will-change`, no keyframes of our own.

### Print
White ground, no video or Play control (the poster prints), the rail static, external URLs printed after their links, the footer row at title size, no row, figure or facts row split across pages.

## What this supersedes in the v3 brief

The brief was written before the direction was picked; where B differs, this file wins:
- **Type:** Funnel Display and Funnel Sans become Schibsted Grotesk and Newsreader; the ramp {56, 24, 20, 17, 14} becomes the roles above, and Meta rises from 14 to 15px. The acceptance test on computed sizes uses this ramp.
- **Colour:** the rose accent and the cool ground become Signal Orange on Paper; the rose's list of uses becomes the One Orange Rule.
- **Radii:** {0, 8} becomes 0 only.
- **Button:** 44px becomes 48px.
- **Row links:** "aligned to the bottom of the media" becomes the top aligned flow; the acceptance test "same title offset and link baseline in every row" becomes "same title offset in every row".
- **Theme:** one light theme stays (the brief's call), so there is no dark mode.
- **Row 1 loop:** "a muted loop with no transport" gets one Play/Pause text control under the media: a loop that starts on its own and runs past 5 seconds needs a pause (WCAG 2.2.2, Level A). It adds one tab stop to the 1440 fold (8, the brief's limit).
- **One authored moment:** the page morph between a home row and its case hero is a second, small one (200ms, on a click, never under reduced motion). It lives in one commit and reverts cleanly.

## Do's and Don'ts

### Do:
- **Do** put every left edge on a column line and size media by slot (`src/styles/slots.ts`), never by hand.
- **Do** keep density at 2.0 or more at 1440: a weak source gets a smaller slot or a re-capture, never an upscale.
- **Do** measure gaps from ink: trim text boxes to cap height and baseline and use the spacing scale.
- **Do** use the orange only as an underline, ring, mark, button fill or selection.
- **Do** keep row text one top aligned flow, and keep every row and every case study the same anatomy.
- **Do** keep everything visible without JavaScript and at first paint.

### Don't:
- **Don't** add a second accent, gradient text, shadows, glass, cards or rounded corners.
- **Don't** set anything under 15px, track display type tighter than -0.04em, or turn on tabular figures.
- **Don't** add eyebrows, section numbers, tag chips, middot strips or slogans ("Selected work", "Let's build something").
- **Don't** animate anything into view, scroll-jack, add a preloader, or move anything but the row 1 loop on its own.
- **Don't** pin row links to the media's bottom or let a slot draw media wider than its source allows.
- **Don't** write em or en dashes anywhere, including comments that might ship; `npm run build` fails on them.

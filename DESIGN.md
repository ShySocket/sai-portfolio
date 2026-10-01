---
name: Sai Bhandar portfolio
description: Cue. A light instrument face with ink displays cut into it; rose lights only what is live or was just pressed.
colors:
  ground: "#eceef0"
  ink: "#15171a"
  ink-2: "#4b5157"
  hover-tint: "#e1e4e7"
  on-field: "#e9ecef"
  on-field-2: "#a4abb2"
  raise: "#26292e"
  raise-hover: "#30343a"
  track: "#6b7279"
  ring-field: "rgba(233, 236, 239, 0.14)"
  rose: "#c42b5f"
  rose-press: "#a82350"
  on-rose: "#ffffff"
  selection: "#e5cbd6"
typography:
  display:
    fontFamily: "Funnel Display, Funnel Display Fallback, Arial, sans-serif"
    fontSize: "64px"
    fontWeight: 600
    lineHeight: "64px"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Funnel Display, Funnel Display Fallback, Arial, sans-serif"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: "48px"
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Funnel Sans Variable, Funnel Sans Fallback, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: "32px"
  body:
    fontFamily: "Funnel Sans Variable, Funnel Sans Fallback, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "28px"
    fontFeature: "tnum"
  label:
    fontFamily: "Funnel Sans Variable, Funnel Sans Fallback, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
    fontFeature: "tnum"
rounded:
  tick: "4px"
  mark: "1px"
  r: "10px"
spacing:
  "1": "8px"
  "2": "16px"
  "3": "24px"
  "4": "32px"
  "5": "40px"
  "6": "48px"
  "8": "64px"
  "12": "96px"
  "16": "128px"
components:
  key-play:
    backgroundColor: "{colors.rose}"
    textColor: "{colors.on-rose}"
    typography: "{typography.body}"
    rounded: "{rounded.r}"
    padding: "8px 20px 8px 24px"
    height: "48px"
  key-play-hover:
    backgroundColor: "{colors.rose-press}"
  key-watch:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.r}"
    padding: "8px 20px 8px 24px"
    height: "48px"
  key-watch-hover:
    backgroundColor: "{colors.hover-tint}"
  copy-key:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.r}"
    padding: "0 14px"
    height: "44px"
  evidence-key:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.r}"
    padding: "4px 10px"
    height: "28px"
  field:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-field}"
    rounded: "{rounded.r}"
  transport-key:
    backgroundColor: "{colors.raise}"
    textColor: "{colors.on-field}"
    rounded: "{rounded.r}"
    size: "44px"
  transport-key-hover:
    backgroundColor: "{colors.raise-hover}"
  tooltip:
    backgroundColor: "{colors.raise}"
    textColor: "{colors.on-field}"
    typography: "{typography.label}"
    rounded: "{rounded.r}"
    padding: "8px 12px"
  index-cell:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.r}"
    width: "96px"
    height: "56px"
  index-row-hover:
    backgroundColor: "{colors.hover-tint}"
---

# Design System: Sai Bhandar portfolio

This file records the shipped Cue design. The tokens in the frontmatter are the ones in `src/styles/global.css` `:root`, and that stylesheet is the source of truth: when the two disagree, fix this file. Product rules (audience, fixed copy, project order, performance, accessibility) live in [PRODUCT.md](PRODUCT.md) and are not repeated here.

## Overview

**Creative North Star: "The Instrument Face"**

The page is one light instrument face with dark displays cut into it. Light means read or press. Ink means this plays or proves: every clip, screenshot, thumbnail and played node sits in an ink field cut into the face. Rose lights only what is live or was just pressed. Every project is a loop between a press and the machine's answer, so every control answers within a frame, and every proof (a clip frame, a cue, a screen region) has its own address that lands instantly.

Density is calm and editorial: one 8px lattice, generous space between projects, text held to a reading measure, and media given the width. There is one light theme; the footage supplies the dark. Everything is opaque and in place at first paint, and nothing enters on scroll.

**Key Characteristics:**
- Light ground, ink fields, one rose accent with a fixed list of uses.
- Two families from one superfamily: Funnel Display for names, Funnel Sans for everything else.
- A fixed-cell transport on every clip, with measured cue ticks that each have an address.
- Proof pinned to coordinates: a tick in a clip, or a 1px ink outline on a screen region, with an evidence key in the note that cites it.
- Flat: no shadows, no gradients, no glass; edges are 1px rings and hairlines.

## Colors

A cool neutral face and an ink display colour, with a single rose that is rationed.

### Primary
- **Signal Rose** (`rose`): the one accent. It is used only for the Play key's fill, the progress fill while playing, the focus ring, the award glyph, the 600ms landing cue on a title's underline, the just-pressed tick mark, and the selection tint inside fields. 4.68:1 on the ground and 3.30:1 on ink.
- **Pressed Rose** (`rose-press`): the Play key's hover and press fill (white on it is 6.95:1).
- **On Rose** (`on-rose`): the Play key's label.
- **Rose Selection** (`selection`): `::selection` on the ground, ink text on it (11.84:1).

### Neutral
- **Instrument Ground** (`ground`): the page, and the browser chrome (`theme-color` is read from this token at build time).
- **Display Ink** (`ink`): all text on the ground (15.44:1), every media field, the index thumbnail cells, and the 1px edges that border the progress fill.
- **Graphite** (`ink-2`): secondary text (tags, kickers, the nav address, captions' provenance) and the 1px rings of the outlined keys (6.91:1 on the ground).
- **Hover Tint** (`hover-tint`): the fill an outlined key or an index row takes on hover and while pressed (ink on it is 14.07:1).
- **On Field** (`on-field`): text, timecodes and tick marks inside ink fields (15.14:1 on ink).
- **On Field Dim** (`on-field-2`): idle state words and the paused progress fill inside fields (7.74:1 on ink).
- **Raised Key** (`raise`, `raise-hover`): transport and cue keys and tooltips inside fields; the hover step is for fine pointers and presses.
- **Track** (`track`): the 2px unfilled rail (3.68:1 on ink).
- **Field Edge** (`ring-field`): a 1px inner edge on a dark screenshot inside a field (Lazer Shooter).

### Named Rules
**The Rationed Rose Rule.** Rose appears only in the seven uses listed under Signal Rose. It never sits on footage, never colours a heading or body text, and there is no second accent.

**The Ink Means Proof Rule.** Ink fields hold only what plays or proves: clips, screenshots, thumbnails, and the flow chips for footage in and a level out. Text and controls that are read or pressed sit on the light face.

## Typography

**Display Font:** Funnel Display 600 (with Funnel Display Fallback, Arial at size-adjust 99.7%)
**Body Font:** Funnel Sans, variable weight, used at 400, 500 and 600 (with Funnel Sans Fallback, Arial at size-adjust 101.8%)

**Character:** One superfamily in two cuts: the display cut gives the name and titles a machined, compact presence, and the sans carries body, UI and figures without changing voice. Two latin woff2 files, both preloaded; figures are tabular everywhere (timecodes never jitter).

### Hierarchy
- **Display** (600, 64/64 at 768px and up, 48/56 below, tracking -0.02em): the name. Capped by its own column (24cqi) so it never breaks mid-word with 200% text.
- **Headline** (600, 40/48 at 768px and up, 32/40 below, tracking -0.01em): project titles, capped at 17cqi. The closing email address uses the display cut at 64/64 (40/48 below 768px, 24/32 below 360px), capped at 12.5cqi.
- **Title** (Sans 500, 24/32): the tagline, one run, so "CMU" is at equal weight.
- **Body** (Sans 400, 17/28): summaries and notes, at most 58ch. Note lead-ins and the claim line under each title are 600; the Play and Watch key labels are 600 and View code 500, all at body size.
- **Label** (Sans 500, 14/20): tags, kickers, captions, timecodes, state words, tooltips, the copy key, evidence keys, nav links and the footer. The award line is 600.

Sizes step at 768px; there is no fluid type, so every line stays on the 4px sub-step. Headings use `text-wrap: balance`, paragraphs and list items `pretty`.

### Named Rules
**The Five Steps Rule.** The ramp is 64, 40, 24, 17 and 14 (with 48 and 32 as the small-screen name and title steps). A new size needs a reason that one of these cannot serve.

## Layout

- **Lattice:** 8px (`--u`), with a 4px sub-step for line heights only. Steps used: 8, 16, 24, 32, 40, 48, 64, 96, 128, all in rem.
- **Frame:** content at most 1600px, margins 16px below 768px and 32px from 768px; 12 columns with 32px gutters where a grid applies.
- **Measure:** 58ch for running text (about 72 characters of Funnel Sans at 17px).
- **Fields:** at most 1120px; the Sidequest stage at most 1152px. A well is a whole number of lattice units wide and 16:9 rounded to the lattice (cropping at most 1.8%). Below 1024px the stage and the pair's clips run edge to edge with square corners.
- **Space between projects:** 80px below 768px, 96px from 768px, 128px from 1200px. Space above a heading is always larger than space below it.
- **The band (first project):** below 1024px it stacks name, Sidequest head, stage, body (notes, then the flow) and the index. From 1024px a 12-column subgrid puts the head in a text rail beside the stage; from 1200px the name, head and body run down columns 1 to 4, with the stage in 5 to 12 and the index under it. The band's breakpoints are container widths in rem, so 200% text keeps it stacked.
- **Families after the band:** the phone entry (from 1200px: head and body in columns 1 to 6, phone and QR card in 7 to 12), the spread (from 1200px: head and body in columns 1 to 7, the spread across all 12 after the body), and the pair (from 1200px: Sunrise in 7 columns, GyroBlaster in 5, on a shared subgrid so titles, key rows and fields line up).
- **Order:** DOM, reading and focus order are the same at every width: head (title, award, claim, tags, keys), the proof, then the body (summary, notes).

## Elevation & Depth

Flat by construction. There are no shadows, gradients, blurs or glass. Depth is one step only: ink fields are cut into the light face, and raised keys sit one tone lighter than the ink around them. Edges are drawn, never cast: outlined keys carry a 1px inset ring (Graphite, Display Ink on hover), screen regions a 1px ink outline, list separators a 1px hairline border. The only z-index on the page is the tooltip's (1).

### Named Rules
**The Cut-Not-Lifted Rule.** Nothing floats above the page. If something needs separation, it is cut into the face (an ink field) or edged with a 1px ring, never shadowed.

## Shapes

One corner: a firm 10px radius on fields, wells, keys, thumbnail cells, cards and tooltips; 4px on tick hit areas and region outlines, and 1px on the 2px tick marks. A field that touches both viewport edges drops to square corners. No pills: keys are rounded rectangles. Separators in lists (kickers, caption facts, the closing location line) are drawn 1px hairlines 12px tall, never middots, and the one that would start a line is clipped away.

## Components

### Keys
Tiered by what the link proves, all at the title so they sit in the first glance.
- **Play key** (`key-play`): a live build you can play. Filled rose, white label at 600, trailing arrow glyph, 48px tall, 10px corners. Full width below 768px. Hover and press: Pressed Rose.
- **Watch key** (`key-watch`): a recording. Same size, no fill, a 1px Graphite inset ring; hover and press add the Hover Tint and darken the ring to ink, in step.
- **View code**: the source, as an underlined text link (1px underline at 40% ink, 6px offset; 2px ink on hover and press), at least 44px tall.
- **Copy email key** (`copy-key`): an outlined 44px key (48px at the close) that copies in place. Its labels (Copy email, Copied, Copy failed) share one grid cell and crossfade, so it never resizes; below 400px the nav key reads "Email". Without JS it is a mailto link.
- **Evidence key** (`evidence-key`): a 28px outlined chip under a note that names where its proof is ("Show 0:04.5 in clip"). It jumps to the address; hovering or focusing the note draws a 2px ring on what it governs (On Field inside fields, ink on the ground, never rose).

### Press, hover and focus
- Every pressable scales to 0.97 while pressed (140ms, ease-out) and also shows its hover fill or underline while pressed, so touch and reduced motion still get a colour answer. Wide surfaces (index rows, the display-size closing address) press at 0.99 so their edges move about 4px, not 14px. Under reduced motion the scale is dropped. A cue tick takes no scale; its mark turns rose instead.
- Hover fills live only under `(hover: hover) and (pointer: fine)`.
- Focus is a 2px rose outline offset 2px. Inside fields it is a ring of ink, rose and a 1px On Field edge, so it holds on footage and never touches a raised key. Focus is always instant.
- Disabled transport keys sink under a 62% ink veil drawn inside the key, so their focus ring keeps full strength.

### Fields and the transport (signature)
- **Field** (`field`): an ink panel with 10px corners holding a well (the pinned still under the video), the transport, and a caption.
- **Transport**: one 64px row of fixed cells aligned to the well: the play key (a 44px raised key whose play, pause and loading glyphs crossfade in one cell), the timecode (at least 88px), the state word (at least 120px), then the previous-cue key, the track and the next-cue key. State changes only text inside a cell, so nothing shifts; under user text spacing the readout cells grow and the track gives way. In fields under 34rem (36rem with cue keys) it becomes a 56px two-row layout with the readout above the track; under 19rem (200% text on a phone) the cells wrap into rows in DOM order. A clip that could not load drops its readout and offers its live build instead.
- **Track and cues**: a 2px Track rail with a 4px progress fill edged in ink (On Field Dim when paused, rose when playing). Each cue is a 24px tick with a 2px by 12px mark and its own address; ticks closer than 24px become unfocusable marks. A loading glyph shows only for a wait the user asked for or one that lasts past 250ms.
- **Tooltip** (`tooltip`): a raised label above its tick with the timecode in On Field Dim and the caption below. Opens after 200ms on mouse hover (instantly for 600ms after one closes), at once on keyboard focus, and at once when a cue is held by a tap, a finger on a cue key, an evidence key or a deep link; it stays inside the track and is dismissed with Esc.
- **Caption**: what is on screen in plain words, then provenance in On Field Dim as a hairline list.

### Flow
The first note's chain as an ordered list under the notes: ink chips for what plays (footage in, a level out), text steps between, 20px arrows, and parallel parts hanging from their step on a 1px hairline. Vertical by default; horizontal once the list has 52rem of its own.

### Index
The projects' own proof as an inventory, under the stage. Each row is one jump link at least 72px tall: a 96 by 56px ink cell with the thumbnail at its true aspect (`index-cell`), the underlined title at 600, the kicker as a hairline list in Graphite, the award where there is one, and a 20px kind glyph from 768px (rose for the award). Hover and press fill the row with the Hover Tint (`index-row-hover`). A narrow index (200% text) drops the cell and keeps every word.

### Phone, spread and pair
- **Phone**: the Lazer Shooter screenshot is itself the field, 256 by 552px, with a 1px Field Edge. A QR card (outlined, 160px code) sits beside it for fine pointers from 640px.
- **Spread**: ReliefIQ's three screens in an ink field with each proof region outlined in 1px ink, then those regions as crops at about 1x so their text stays at least 14px. Below 768px it runs edge to edge and pairs each screen with its crop.
- **Pair**: Sunrise and GyroBlaster side by side from 1200px, each head, field and body like every other entry.

### Navigation
A static 56px row: the name (unmarked at rest, underlined on hover and press), a Projects link, and from 768px the address as selectable text beside the copy key. Not fixed; nothing follows the scroll.

### Motion
Tokens in `:root`: one curve (`--ease-out`, cubic-bezier(0.23, 1, 0.32, 1)) for presses, tooltips and state crossfades, plain `ease` for colour; press 140ms, hover 150ms, state 150ms, tooltip 125ms, landing cue 600ms (a colour fade only), loading turn 700ms. Only transform and opacity move. Seeks, cue steps, jumps and focus are instant. The full inventory is in the polish-7c motion inventory.

### Print and forced colours
- **Print:** a white ground; fields print as 1px ink outlines with the pinned still (never the video) and the still's own timecode in place of the transport; lead keys print outlined with their URLs; the nav, copy keys and back-to-top link are dropped; heads stay with what follows and no figure, note or row is cut.
- **Forced colours:** the rail is a border and keeps CanvasText, the tick marks paint CanvasText, the progress fill and held cue Highlight; keys drawn by fills or rings get a transparent outline that the system colours, disabled keys read GrayText, and the titles' resting underline is removed.

## Do's and Don'ts

### Do:
- **Do** keep rose to its seven uses, and put every other emphasis in weight, size or an ink field.
- **Do** show a project's proof next to the sentence it backs, and give that proof an address (a tick id or a region id) with an evidence key in the note.
- **Do** keep transport cells fixed: a state change swaps text inside a cell and never moves the track or the ticks.
- **Do** give every pressable both a press scale (0.97, or 0.99 on wide surfaces) and a colour answer while pressed, gate hover fills to fine pointers, and keep focus instant.
- **Do** size type, spacing and wells on the 8px lattice and the five-step ramp.
- **Do** keep everything visible at first paint and without JS: no-JS clips fall back to native controls over the pinned still.

### Don't:
- **Don't** add a second accent colour, gradient text, glow, glass (`backdrop-filter`), drop shadows or film grain.
- **Don't** animate anything into view on scroll, fade content in on load, add parallax, scroll progress bars, smooth-scroll libraries or any other scroll-jacking.
- **Don't** use pill shapes (`border-radius: 999px`), marquees, cursor effects, 3D tilt, magnetic buttons or pulsing "live" dots.
- **Don't** use slogans ("Things I've built.", "Let's build something.", "Selected work") or decorative headings; copy comes verbatim from `src/data/projects.ts`.
- **Don't** put rose on footage or behind text larger than a key label, and don't use middots as separators: draw a hairline.
- **Don't** add a third type family or weights beyond Display 600 and Sans 400, 500 and 600.

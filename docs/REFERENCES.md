# Design references

## Cue redesign (2026-09-30 to 2026-10-01)

The current design came out of an open redesign run with three installed design skills. The process records (critique brief, directions, variant reports, judge scores, review findings) are in `~/Documents/autopilot/artifacts/sai-portfolio-redesign/`, and the side-by-side review board is the Figma file [Sai Portfolio — Redesign review](https://www.figma.com/design/JmydNmbtTweBBjk4FGxY4C).

| Source | What it contributed |
|---|---|
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (critique, audit, new-work, craft floor, polish, detector) | The critique of the light-minimal site, PRODUCT.md, the concept-seed roll (key c815bbd6) that assigned the Cue direction and dealt six challengers, the craft floor every pass was built against, and the `impeccable detect` gate. |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (design-taste-frontend, redesign-existing-projects) | The anti-template audit and the pre-flight check used by the critique, the judges and the final review. |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) (emil-design-eng, animate, review-animations, improve-animations) | The motion and interaction bar: one ease-out token set, UI motion at or under 200 ms, press feedback, hover only on fine pointers, no content hidden by motion, and the motion inventory in the 7c pass. |
| Runner-up variants `variant/screening-room` and `variant/signal-flow` | Grafted into Cue: action keys tiered by evidence type, the clip caption and provenance line, the glyph crossfade (Screening Room); the Sidequest pipeline flow, AVIF picture stills, per-clip isolation and the build-time verbatim check (Signal Flow). |

## Light minimalist direction (superseded 2026-09-30)

Collected 2026-09-26. Every URL below returned HTTP 200 on that date. What each contributes is listed; nothing was copied or installed from these sources.

| # | Reference | Borrow | Avoid |
|---|---|---|---|
| 1 | [manus.im](https://manus.im/) | Light, near-white canvas; near-black text; one short bold headline; type-weight hierarchy instead of many typefaces; accent colour reserved for the one action that matters. | The product-marketing footer and dense sign-in header; nothing to sell here. |
| 2 | [paco.me](https://paco.me/) (Paco Coursey) | Single narrow column (~640px); projects as a plain list with a title and a one-line description; hairline dividers between sections; underlined text links; lots of negative space. | Emoji bullets; the site is so sparse that media would feel foreign, and ours needs video. |
| 3 | [leerob.com](https://leerob.com/) (Lee Robinson) | Name + one-paragraph intro, then lists; generous vertical rhythm; metadata (dates) in a quieter tone on the right. | Blog-style chronology; we list projects, not posts. |
| 4 | [rauno.me](https://rauno.me/) (Rauno Freiberg) | Utilitarian light theme; restraint in colour; small, considered interaction details (copy-email feedback) instead of decorative motion. | Category navigation for many sections; we have one section. |
| 5 | [emilkowal.ski](https://emilkowal.ski/) (Emil Kowalski) | Calm light layout where motion is short and purposeful; content-first project entries. | Component-demo density. |
| 6 | [brittanychiang.com](https://brittanychiang.com/) | Clear project entries (title, one line, tech list, links) that recruiters scan fast. | Its dark navy theme and sticky two-column shell (widely cloned; reads as a template now). |
| 7 | [RyanFitzgerald/devportfolio](https://github.com/RyanFitzgerald/devportfolio) (~4.9k stars, Astro) | Proof that a config-driven single page (our `projects.ts`) is the right shape; accessible defaults. | Generic section set (about/skills/experience), which Sai declined. |
| 8 | [vinitshahdeo/portfolio](https://github.com/vinitshahdeo/portfolio) (Astro) | Perfect-Lighthouse discipline: semantic HTML, no layout shift, small JS. Our `npm run a11y` gate keeps this honest. | Tailwind utility soup; we keep plain CSS tokens. |
| 9 | [bytekai/minimal-astro-portfolio](https://github.com/bytekai/minimal-astro-portfolio) | Minimal project rows and restrained typography in Astro. | Blog/experience scaffolding. |
| 10 | [Anthropic frontend-design plugin](https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design) | Commit to a context-specific aesthetic instead of defaults. | Its "bold, high-impact effects" leaning; minimalism here means fewer effects. |
| 11 | [Anthropic cookbook: prompting for frontend aesthetics](https://github.com/anthropics/claude-cookbooks/blob/main/coding/prompting_for_frontend_aesthetics.ipynb) | Distinctive fonts (not Inter/Roboto/Space Grotesk); dominant colour + one sharp accent; one orchestrated page-load stagger beats scattered micro-interactions. | Atmospheric gradient backgrounds, which conflict with the minimal brief. |
| 12 | [Superdesign: make AI UI less generic](https://superdesign.dev/blog/how-to-make-ai-ui-look-less-generic) | Write an explicit spec (DESIGN.md) before building; specs, not adjectives. | Tooling pitch. |

## Synthesis for this site
- **Canvas:** warm off-white page, near-black text, a single pink accent used only for small marks (project numbers, link hover, focus). No second accent, no gradients.
- **Column:** narrow reading column for text (~640–680px); media may run wider than the text column on desktop so projects still feel visual.
- **Hierarchy by type alone:** one distinctive display face for the name and project titles, one text face, mono only for tiny metadata. Weight and size do the work; rules are rare.
- **Projects as entries, not cards:** number, title, one-line kicker, media, summary, notes, a compact stack/links line.
- **Motion:** one short page-load stagger and quiet fade-ins; nothing that moves on its own.

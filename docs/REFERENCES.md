# Design references (light minimalist direction)

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

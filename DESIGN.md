# GAMBIT'S GLITCH — Swiss Editorial Design System

## Loader requirements — current revision

These requirements govern the intro. The warm/gold tokens and glitch language below apply to the existing main website, not the loader.

- Reference: the supplied Olha Lazarieva screen recording and https://olhalazarieva.com/.
- Background `#f7f7f7`; text `#101010`; Sofia Sans Condensed for the ribbon/title, Spline Sans Mono for the fine orbit and percentage. Serve fonts locally through Vite.
- One compact, centred composition: a bold rotating cylindrical text band with one fine orbit around the same axis. Keep the empty space and perspective of the reference.
- Wording: `IDEAS THAT CHANGE THE WORLD ·`, `BUILD · BREAK · DEBUG · DEPLOY ·`, then `GAMBIT’S GLITCH`.
- Keep the percentage centred beneath the group. It indicates the intro sequence's progress, not downloaded bytes. Reach 100%, hold briefly, drop the band and reveal the wide title before handing off to the homepage.
- Keep the title hidden until its reveal. Loader geometry uses explicit `.gg-intro` CSS so its full-screen layout does not rely on utility classes.
- Normal visits play once per tab session; `?intro=replay` is the review override. Escape and a keyboard skip button dismiss it. Respect reduced motion and restore scrolling/focus access on completion.
- Maintain the monochrome reference. Do not add terminal logs, gold glitch flashes, extra circles or the old anomaly/protocol stage to this intro.

The renderer is an original reconstruction of the supplied reference. The retained event homepage has its own warm editorial palette.

---

This design document outlines the visual identity, token architecture, typography hierarchy, and motion principles for **Gambit’s Glitch**, inspired by Swiss editorial minimalism disrupted by controlled digital glitches.

---

## 🎨 Color System (Design Tokens)

```css
:root {
  --color-canvas: #F1EFE8;        /* Warm light main website background */
  --color-paper: #E8E3D8;         /* Secondary paper surface */
  --color-ink: #11110F;           /* Primary text & high-contrast elements */
  --color-accent: #D8971F;        /* Main Gambit Gold accent */
  --color-accent-light: #DCBC58;  /* Hover & active state highlights */
  --color-accent-dark: #735110;   /* Deep accent rules & borders */
  --color-muted: #807F7A;         /* Secondary metadata text */
  --color-line: #C5BBA7;          /* Hairline rules, grids, dividers */
  --color-error: #9C2F25;         /* Validation errors & alert statuses */
  --color-success: #465A32;       /* Successful verification statuses */
}
```

### Usage Guidelines:
- **Primary Canvas**: `#F1EFE8` provides a warm, physical paper feel across all viewports.
- **Editorial Contrast**: `#11110F` ink black used for heavy serif headlines and crisp typography.
- **Accent Accentuation**: Gambit Gold `#D8971F` reserved for primary calls to action, section flags, and active state highlights. No neon cyan/violet or bright green gradients.
- **Controlled Glitch**: Glitch effects rely on monochrome horizontal displacement, gold slice offsets, and typographic warp—never heavy RGB color separation or dark neon screens.

---

## ✒️ Typography Hierarchy

1. **Editorial Display Serif**: `Instrument Serif` / `DM Serif Display` / `Cormorant Garamond` (Google Fonts)
   - Used for monumental statements, hero quotes, and asymmetric section headers.
   - Letter-spacing: `-0.03em`, line-height: `0.95`.
2. **Clean Grotesk Sans**: `Geist` / `Space Grotesk` / `Outfit`
   - Used for navigation, body text, form controls, buttons, and subheadings.
   - Line-height: `1.6`, high legibility.
3. **Technical Monospace**: `Geist Mono` / `JetBrains Mono`
   - Used for countdowns, team IDs, dates, system status messages, section numbers (`01 / THE PROTOCOL`), and financial UTR numbers.

---

## 📐 Swiss Editorial Layout & Pacing

- **Hairline Grids**: Borders use `--color-line` (`#C5BBA7`) at 1px thickness.
- **Asymmetric Composition**: Massive sans-serif title combined with overlapping serif editorial statements.
- **Expressive Section Titles**:
  - `01 / THE PROTOCOL` (About & Philosophy)
  - `02 / CHOOSE YOUR DISRUPTION` (Themes & Tracks)
  - `03 / EXECUTION SEQUENCE` (Timeline)
  - `04 / RULES OF ENGAGEMENT` (Rules & Eligibility)
  - `05 / THE OUTCOME` (Prize Pool & Awards)
  - `06 / TRANSMIT YOUR ENTRY` (Registration & Payment)
  - `07 / SYSTEM STATUS` (Participant Pipeline Status Tracker)
- **Container Rounding**: Minimal (0px to 2px). No rounded glassmorphism cards.

---

## 🎬 Motion & Glitch Principles

- **Loading Experience**: Follow the monochrome loader requirements at the top of this file. The old gold anomaly/protocol sequence is superseded.
- **Restrained Micro-Animations**: Smooth line reveals, subtle cursor follow, and gold hover line movements.

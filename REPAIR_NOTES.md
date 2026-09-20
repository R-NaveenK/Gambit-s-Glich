# Gambit's Glitch — loader and layout repair

## What caused the broken screen

The supplied project used Tailwind utility classes throughout its templates, but did not install or configure Tailwind. Classes for fixed positioning, hidden content, alignment, spacing and responsive layouts therefore had no generated CSS. The loading title could appear before its intended reveal, and layout elements fell back to normal document flow.

The old loader also used two separated canvases and flat letter placement. It could invoke the completion callback twice on a repeat visit.

## What changed

- Added the missing Tailwind 3/PostCSS build pipeline and mapped its colours and fonts to the existing website styles.
- Rebuilt the loader as one centred canvas composition: a projected 3D text ribbon, a fine orbit, a percentage underneath, then a large masked title reveal. The palette is `#f7f7f7` and `#101010`.
- Changed the ribbon wording to `IDEAS THAT CHANGE THE WORLD` and `BUILD · BREAK · DEBUG · DEPLOY`; the title is `GAMBIT’S GLITCH`.
- Gave the loader explicit CSS independent of utility classes. The title is hidden until its scheduled reveal.
- Bundled the fonts locally, including licence notices, and removed the duplicate external font requests and unused blocking icon CDN script.
- Made completion run once, cleaned up animation/listener state, restored page interaction and scrolling after the intro, and provided replay, Escape, keyboard skip and reduced-motion behaviour.
- Repaired the mobile menu's fixed positioning: the original header's backdrop filter was confining it to the header. Added close/focus behaviour and narrower header controls.
- Adjusted the existing homepage heading at narrow widths so it remains inside the content margins at 320px.
- Updated this documentation and `DESIGN.md` so future Antigravity edits have one clear loader direction.

The loader is an original visual reconstruction from the supplied recording, not the reference site's source code. Desktop timing follows the reference's overall sequence; mobile proportions adapt to the available viewport. The percentage represents intro progress, not network bytes. The existing warm/gold homepage is retained after the monochrome intro.

## Files to review

| File | Change |
| --- | --- |
| `src/components/Loader.js` | Canvas projection, wording, timing, lifecycle and skip behaviour |
| `src/styles/loader.css` | Self-contained loader layout and responsive proportions |
| `src/styles/fonts.css` | Local font declarations |
| `src/styles/main.css` | Tailwind layers, missing shared control styles, narrow-screen fit |
| `src/components/Navbar.js` | Full-screen mobile menu and keyboard interaction |
| `src/main.js` | One loader mount and smooth-scroll/reduced-motion coordination |
| `index.html` | Removed duplicate external asset requests |
| `package.json`, `package-lock.json` | Build and font dependencies |
| `tailwind.config.js`, `postcss.config.js` | CSS pipeline configuration |
| `public/licenses/` | Font licence notices included with the build |

## Verification performed

The production build was tested with Node.js 24.19.0 and Vite 5.4.21. Browser checks used headless Chromium with the production frontend served locally.

| Check | Result |
| --- | --- |
| `npm run build` | Passed |
| Desktop, 1918 × 968 | Loader centred, fonts loaded, title hidden during loading, then revealed; scrolling and page interaction restored |
| Mobile, 390 × 844 | Loader/title fit, no horizontal page overflow, registration screen opens, menu covers the viewport and closes |
| Narrow screen, 320 × 568 | Header controls fit; homepage title fits within the content margins; menu keyboard focus and Escape work |
| Landscape resize, 844 × 390 | Counter recentres; no horizontal page overflow; keyboard skip works |
| Repeat visit | Intro is skipped without the replay query |
| Reduced motion | Intro is bypassed |
| Session storage disabled | Intro completes without trapping the visitor or throwing an error |
| Escape during intro | Overlay removed and scrolling restored |
| Registration screen smoke check | Form renders, empty required fields are invalid, success modal stays hidden |
| Runtime errors in tested paths | None |
| External font/CDN requests in desktop and mobile checks | None; fonts are bundled locally |

These are browser viewport checks, not tests on physical phones or Safari/Firefox. The accompanying video shows the desktop intro and its handoff to the existing homepage. Browser recording overhead can affect the apparent timing.

## Retained functionality and limits

All 10 existing backend source/schema files and all 12 page modules match the uploaded archive byte for byte. Registration, payment, pitch-deck, status and admin business logic were not rewritten. The event configuration is retained as supplied.

This repair did not submit registrations, send money, upload payment proofs or decks, approve payments, connect to Supabase, or audit backend security. Those workflows still need end-to-end verification in your configured environment. Existing demo admin credentials and example event/payment details must be replaced or confirmed before public launch. The earlier README's unsupported completed-test checklist has been removed.

The archive excludes `node_modules`, private `.env` files, saved registrations and uploaded participant files. It includes `.env.example`, source, the built frontend, licence notices and these instructions. Keep your original environment and data; see `START_HERE.md` before reconnecting the backend.

## References

- Visual direction: the user-supplied recording and [Olha Lazarieva](https://olhalazarieva.com/).
- Build configuration: [Tailwind CSS v3 with Vite](https://v3.tailwindcss.com/docs/guides/vite).

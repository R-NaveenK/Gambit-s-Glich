# Gambit's Glitch

A hackathon website built with HTML, CSS, vanilla JavaScript and Vite, with an existing Express backend for registration, payment proof, manual verification and pitch deck uploads.

**Start with [START_HERE.md](START_HERE.md) to open the corrected project in Antigravity.** This revision repairs the reference-style intro and the missing CSS build setup. It is a development project for local review; it has not been approved for accepting live payments.

## Run locally

In a Windows PowerShell terminal opened inside this folder:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open **http://localhost:3000/?intro=replay** to review the loader. Use the address Vite prints if port 3000 is already occupied. On macOS/Linux, use `npm` in place of `npm.cmd`.

A normal visit plays the intro once per browser tab session. The `?intro=replay` query forces a replay. Escape or the keyboard-focusable Skip introduction button skips it. A reduced-motion preference bypasses it.

The visual preview does not require the API server. To work on registration and uploads, preserve your original environment/data files and start the existing API in a second terminal:

```powershell
npm.cmd run server
```

Vite forwards `/api` and `/uploads` to the local server on port 5000. Use [START_HERE.md](START_HERE.md) before moving an existing setup.

## Build and preview

```powershell
npm.cmd run build
npm.cmd run preview
```

The production frontend is written to `dist/`. Vite's preview command previews the frontend; it is not a deployment of the Express backend.

## Project map

| Location | Purpose |
| --- | --- |
| `src/components/Loader.js` | Intro wording, 3D text renderer and animation timing |
| `src/styles/loader.css` | Loader colours, proportions and responsive layout |
| `src/styles/fonts.css` | Local font files bundled by Vite |
| `src/styles/main.css` | Existing website styles and Tailwind layers |
| `tailwind.config.js`, `postcss.config.js` | Utility CSS build setup |
| `src/config/eventConfig.js` | Event details, dates, payment information and contacts |
| `src/pages/` | Existing event and participant/admin screens |
| `server/` | Existing Express routes, storage adapter and schema |
| `DESIGN.md` | Loader-specific requirements followed by the existing website direction |
| `REPAIR_NOTES.md` | Changes, verification results and known limits |

## Event and backend setup

The uploaded project already contains example event details. Confirm the event date, fee, venue, team size, prizes, payment destination and contacts in `src/config/eventConfig.js` before sharing the site.

The existing backend supports a local JSON store and an optional Supabase adapter. Its source and schema are retained. Environment settings belong in `.env`; use `.env.example` as a field reference. Never put service role credentials in frontend JavaScript or `VITE_` variables.

This repair does not validate the backend's authentication, storage permissions or payment decisions. The original project includes default demo admin credentials, including in its login page; remove the displayed demo credentials and replace the defaults before a public launch. Payment-proof and pitch-deck storage must be reviewed for appropriate access control. The old README's blanket “all tests passed” and public-storage deployment guidance have been removed.

## Fonts and reference

The intro is an original canvas implementation based on the visual reference at [Olha Lazarieva](https://olhalazarieva.com/) and the supplied recording. Only the hackathon wording and the handoff to the retained event homepage are adapted. It is a visual reconstruction, not the reference site's source code.

Sofia Sans Condensed, Spline Sans Mono, Space Grotesk and Instrument Serif are bundled through Fontsource packages. Their licence notices are included in `public/licenses/` and copied into the production build.

# Gambit's Glitch

A high-intensity hackathon web application built with HTML, CSS, vanilla JavaScript, and Vite, featuring an Express backend for team registration, payment proof verification, status tracking, and pitch deck uploads.

## Run locally

In a terminal opened inside this folder:

```powershell
npm.cmd run dev
```

Open **http://localhost:3000** to launch the site. On macOS/Linux, use `npm` in place of `npm.cmd`.

To run the backend API server alongside the frontend, open a second terminal and run:

```powershell
npm.cmd run server
```

Vite automatically proxies `/api` and `/uploads` requests to the Express backend running on port 5000.

## Build and preview

```powershell
npm.cmd run build
npm.cmd run preview
```

The production frontend bundle is generated in the `dist/` directory.

## Project Map

| Location | Purpose |
| --- | --- |
| `src/components/` | Navbar, Footer, HeroCanvas, Countdown, and Loader components |
| `src/pages/` | Event pages (Home, About, Tracks, Timeline, Rules, Register, Payment, FAQ, etc.) |
| `src/styles/` | Global CSS styles, bundled fonts, and Tailwind layers |
| `src/config/eventConfig.js` | Central event details, dates, payment info, tracks, and rules |
| `server/` | Express backend routes, JSON data store, and database adapters |
| `tailwind.config.js`, `postcss.config.js` | CSS build and styling configuration |


## Event and backend setup

The uploaded project already contains example event details. Confirm the event date, fee, venue, team size, prizes, payment destination and contacts in `src/config/eventConfig.js` before sharing the site.

The existing backend supports a local JSON store and an optional Supabase adapter. Its source and schema are retained. Environment settings belong in `.env`; use `.env.example` as a field reference. Never put service role credentials in frontend JavaScript or `VITE_` variables.

This repair does not validate the backend's authentication, storage permissions or payment decisions. The original project includes default demo admin credentials, including in its login page; remove the displayed demo credentials and replace the defaults before a public launch. Payment-proof and pitch-deck storage must be reviewed for appropriate access control. The old README's blanket “all tests passed” and public-storage deployment guidance have been removed.

## Fonts and reference

The intro is an original canvas implementation based on the visual reference at [Olha Lazarieva](https://olhalazarieva.com/) and the supplied recording. Only the hackathon wording and the handoff to the retained event homepage are adapted. It is a visual reconstruction, not the reference site's source code.

Sofia Sans Condensed, Spline Sans Mono, Space Grotesk and Instrument Serif are bundled through Fontsource packages. Their licence notices are included in `public/licenses/` and copied into the production build.

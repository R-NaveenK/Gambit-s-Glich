# Open the corrected website

## 1. Keep your original folder

Extract this ZIP into a **new folder**. Open the extracted `gambits-glitch` folder in Antigravity. Do not delete your original website folder.

The corrected archive contains the website source and a built frontend. Dependencies, private environment values, uploaded files and saved registrations are not bundled.

## 2. Install and start

Stop the old frontend terminal with Ctrl+C so the new project can use port 3000. Open a terminal inside the new `gambits-glitch` folder and run:

```powershell
npm.cmd ci
npm.cmd run dev
```

Keep that terminal open. Open **http://localhost:3000/?intro=replay** in your browser. If Vite prints a different port, use that port with `/?intro=replay` added.

You do not need to open the SQL editor to see this loader repair. On macOS/Linux use `npm` instead of `npm.cmd`.

## 3. Check the intro

You should see a white screen, one centred group of rotating text, a percentage beneath it, then the large **GAMBIT’S GLITCH** title and a fade into your existing homepage.

The words are **IDEAS THAT CHANGE THE WORLD** and **BUILD · BREAK · DEBUG · DEPLOY**. Change them in the `COPY` object at the top of `src/components/Loader.js`.

For subsequent reviews keep `?intro=replay` in the address. Without it, the intro plays once per tab session. Escape skips it; reduced-motion settings skip the animation automatically.

## 4. Reconnect your existing backend when needed

For the loader preview, the frontend terminal is sufficient. To continue working with your existing registrations and payment setup, copy these from your original folder into the matching locations in this new folder, if they exist:

- `.env` — your local configuration.
- `server/db/data_store.json` — the existing local registration data.
- `uploads/` — existing uploaded payment proofs and pitch decks, or the custom upload directory configured in your environment.

Then run `npm.cmd run server` in a second terminal. Supabase users should retain their existing configuration. This repair does not require running database migrations or resetting any data.

## What is ready

The loader and CSS repair are ready for visual review. See `REPAIR_NOTES.md` for the checks performed. Registration, payment verification and pitch-deck code are retained, but their end-to-end backend behaviour was not tested in this repair. Confirm the event details and resolve the existing demo admin credentials before public launch.

# FlashCards

A local, browser-based multiple-choice quiz game built as a study aid and general trivia game. Runs entirely client-side — no account, no server, no internet connection required once loaded. Play through three game modes (Sudden Death, Race, Quickdraw), earn Points and persistent Coins, climb per-mode/configuration leaderboards, and spend Coins on cosmetic themes and shop items.

See [`brief.txt`](brief.txt), [`detailed-brief.txt`](detailed-brief.txt) and [`implementation-guide.md`](implementation-guide.md) for the full design/spec this project was built from.

## Requirements

- [Node.js](https://nodejs.org/) 18 LTS or later (build-time only — end users only need a browser)
- npm (bundled with Node.js)
- An evergreen browser: the last two major versions of Chrome, Edge, Firefox or Safari

## Getting started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

This starts Vite's dev server (typically at `http://localhost:5173`) and regenerates the pool manifest automatically. Open the printed URL in your browser to play.

> **The app must be served over `http://`, not opened as a `file://` URL** — browsers block/restrict `fetch()` of local files under `file://`, which would break question-pool loading.

## Building for production / local static use

```bash
npm run build
npm run preview
```

`npm run build` produces a static site in `dist/`. `npm run preview` serves that `dist/` folder locally (Vite's built-in static server) — this is still "runs entirely inside one browser", it just needs any static file server to satisfy the browser's normal HTTP security model. You can also point any other static file server at `dist/` instead.

## Other scripts

| Command                  | Purpose                                                                   |
| ------------------------ | ------------------------------------------------------------------------- |
| `npm run test`           | Run the Vitest unit test suite once                                       |
| `npm run test:watch`     | Run the unit test suite in watch mode                                     |
| `npm run typecheck`      | Type-check the whole project with `tsc --noEmit` (no build output)        |
| `npm run pools:manifest` | Regenerate `public/pools/manifest.json` from the files in `public/pools/` |

`pools:manifest` runs automatically before both `dev` and `build` (via `predev`/`prebuild`), so you normally never need to run it by hand.

## Adding your own question pools

1. Drop a new `.json` file into `public/pools/` following the schema below (see `public/pools/general-knowledge.json` for a complete example). A formal JSON Schema is in `schemas/pool.schema.json` (add `"$schema": "../../schemas/pool.schema.json"` to a pool file for editor validation).
2. Restart `npm run dev` (or rebuild) so the manifest picks up the new file.

Minimal pool file shape:

```json
{
  "poolName": "My Pool",
  "description": "Optional description shown on the Pool Selection screen.",
  "category": "Optional category (defaults to \"General\")",
  "questions": [
    {
      "id": "unique-within-this-file",
      "prompt": "Question text?",
      "difficulty": "Easy",
      "choices": ["Option A", "Option B", "Option C", "Option D"],
      "correctChoice": "Option A",
      "explanation": "Optional explanation shown after answering."
    }
  ]
}
```

Rules (enforced by the built-in validator; a malformed pool is skipped with a plain-language error shown on the Pool Selection screen, not a crash):

- `poolName` must be present and non-empty.
- At least one question.
- Each question needs a non-empty `prompt`.
- Each question needs **exactly 2 or exactly 4** `choices` (2 for yes/no or true/false style questions), all non-empty text, with no two identical.
- `correctChoice` must exactly match exactly one of that question's `choices`.
- Each question needs a unique `id` **within its own pool** file (IDs may repeat across different pool files).
- `difficulty`, if given, must be `"Easy"`, `"Medium"` or `"Hard"` (omit it to default to Medium).

`public/pools/manifest.json` is a generated build artifact — don't hand-edit it; it's safe to delete and will be regenerated.

## Game modes

- **Sudden Death** — answer as many questions correctly in a row as possible; one wrong answer (or a timeout) ends the run. Countdown per question is configurable.
- **Race** — answer as many questions correctly as possible before an overall time limit runs out. No per-question timer.
- **Quickdraw** — 3 lives, with a short configurable timer per question.

Every completed run scores Points (based on difficulty, streak, and answer speed) which convert into persistent Coins, spendable in the Shop on themes, card styles, avatars, celebration effects and sound packs. High scores are tracked per unique combination of mode + numeric setting + selected pools + difficulty filter.

## Data & privacy

All save data (settings, coins, shop purchases, high scores, last-used configuration per mode) is stored locally in your browser's IndexedDB — nothing is sent anywhere. Clearing your browser's site data for this app resets everything, equivalent to a fresh install. You can also reset High Scores, Coins & Purchases, or everything from the in-game Settings screen.

## Accessibility

The game is fully playable with mouse-only or keyboard-only navigation:

- `1`–`4` or `A`–`D` select the answer in that position
- Arrow keys move focus between answer choices; `Tab`/`Shift+Tab` for standard focus order
- `Enter`/`Space` activates the focused control
- `Escape` opens/closes Pause during gameplay, or triggers the current screen's Back action elsewhere

Settings include Reduce Motion, High Contrast, Colour-blind Friendly Mode, Silent Mode and Answer Key Hints toggles.

## Project structure

See [`implementation-guide.md`](implementation-guide.md) Section 3 for the full annotated directory layout and Section 19 for the build-order/milestone breakdown this project followed.

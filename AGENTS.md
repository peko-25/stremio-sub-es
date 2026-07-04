# AGENTS.md

## Setup
- Copy `.env.example` to `.env` or create `.env` with required keys:
  - `NVIDIA_API_KEY` (required for translation)
  - `SUBDL_API_KEY` (optional, for SubDL)
  - `OPENSUBTITLES_USER_AGENT` (optional)
- Install dependencies: `npm install`

## Running
- Start server: `node server.js` (or `npm run dev` if script exists)
- Addon runs on port from `PORT` env (default 7000)
- Access manifest at `http://127.0.0.1:<port>/manifest.json`

## Testing
- Run tests: `npm test` (or `npm test` if script exists)
- To test translation, download an English sub and trigger translation via addon flow

## Lint / Typecheck
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Run both before committing

## Debugging
- View logs in console; addon logs to stdout
- Check `cache/` for translation cache files
- Use `console.log` in addon.js for debugging

## Key Files
- `addon.js`: main logic, flow Spanish → English → translate → cache → serve
- `server.js`: Express server, routes `/subfile/:id` and `/subfile/translated-:hash`
- `providers/`: OS v3, SubDL, srtParser, translateAI
- `cache/`: stores translated SRT files (hashed)

## Critical Gotchas
- NVIDIA API key must be valid and start with `nvapi-`; otherwise translation fails with 401
- Model name must be `nvidia/riva-translate-4b-instruct-v1.1` (dot, not underscore)
- OpenSubtitles v3 uses proxy; no API key needed
- SubDL requires ZIP extraction; ensure `adm-zip` is installed
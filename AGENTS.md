# AGENTS.md

## Setup
- `.env` with `NVIDIA_API_KEY` (required), `SUBDL_API_KEY` (optional), `SUBSOURCE_API_KEY` (optional)
- `BASE_URL` env for cloud hosting (e.g. `https://tu-app.onrender.com`); defaults to `http://127.0.0.1:PORT`
- `npm install`

## Running
- `node server.js` — listen on `PORT` env or 7000
- Open `http://127.0.0.1:PORT/configure` for config UI
- No hot-reload; restart after edits

## Architecture

```
server.js          — Express 4, mounts SDK router + /configure + /subfile/:id dispatch
addon.js           — Stremio subtitle handler, creates manifest + builder
config.js          — AsyncLocalStorage per-request (mode/primary/lang/baseUrl)
providers/
  opensubtitles.js — strem.io proxy (no key, URLs direct from proxy)
  subdl.js         — SubDL API (key), ZIP extraction, URLs use config.baseUrl
  subsource.js     — Subsource API (key), ZIP extraction, URLs use config.baseUrl
  translateAI.js   — NVIDIA Riva Translate 4B, line-by-line, concurrencia 3 + 300ms delay, retry 429
  srtParser.js     — Parse/rebuild SRT
configure.html     — Landing page per SPECIFICATION.md, dark cyber theme, no frameworks
```

## URL config prefix
Config encoded in URL path: `/:mode/:primary/:lang/manifest.json`
- `mode`: `auto` | `separate`
- `primary`: `any` | `os` | `subdl` | `subsource`
- `lang`: `spa` | `lat` | `esp`
No prefix = defaults (`auto/any/spa`, backward-compatible).

## Key gotchas
- **config.js uses AsyncLocalStorage** (not a singleton) — safe for concurrent requests
- **BASE_URL**: subtitle URLs from SubDL/Subsource/translation use `config.baseUrl`; OpenSubtitles uses direct strem.io URLs (no proxy)
- **Express 4**: downgraded from 5 for stability; `stremio-addon-sdk` bundles Express 4 internally
- **NVIDIA model**: `nvidia/riva-translate-4b-instruct-v1.1` (dot, not underscore)
- **NVIDIA API key**: must start with `nvapi-`; 401 = invalid/expired
- **OpenSubtitles**: uses strem.io proxy, no user API key needed
- **SubDL/Subsource**: return ZIPs; `adm-zip` + `iconv-lite` for extraction
- **Translate cache**: `cache/` dir by MD5 hash; delete files to force retranslation
- **PowerShell**: use `npm.cmd` instead of `npm` (ExecutionPolicy restriction on this system)
- **No lint/typecheck scripts**: none configured

# AGENTS.md

## Setup
- `.env` with `NVIDIA_API_KEY` (required), `SUBDL_API_KEY` (optional), `SUBSOURCE_API_KEY` (optional)
- `npm install`

## Running
- `node server.js` — listen on `PORT` env or 7000
- Open `http://127.0.0.1:PORT/configure` for config UI
- No hot-reload; restart after edits

## Architecture

```
server.js          — Express, mounts SDK router + /configure + /subfile/:id dispatch
addon.js           — Stremio subtitle handler, creates manifest + builder
config.js          — Global config singleton (mode/primary/lang), set per-request via URL prefix
providers/
  opensubtitles.js — strem.io proxy (no key)
  subdl.js         — SubDL API (key), ZIP extraction
  subsource.js     — Subsource API (key), ZIP extraction
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
- **NVIDIA model**: `nvidia/riva-translate-4b-instruct-v1.1` (dot, not underscore)
- **NVIDIA API key**: must start with `nvapi-`; 401 = invalid/expired
- **OpenSubtitles**: uses strem.io proxy, no user API key needed (the `OPENSUBTITLES_API_KEY` env var is unused)
- **SubDL/Subsource**: return ZIPs; `adm-zip` + `iconv-lite` for extraction
- **Translate cache**: `cache/` dir by MD5 hash; delete files to force retranslation
- **PowerShell**: use `npm.cmd` instead of `npm` (ExecutionPolicy restriction on this system)
- **No lint/typecheck scripts**: none configured

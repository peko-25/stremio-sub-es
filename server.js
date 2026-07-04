require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const { getRouter } = require('stremio-addon-sdk');
const addonInterface = require('./addon');
const subdl = require('./providers/subdl');
const subsource = require('./providers/subsource');
const { runWithConfig, saveConfig, loadConfig } = require('./config');

const app = express();
const port = process.env.PORT || 7000;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${port}`;
const CACHE_DIR = path.join(__dirname, 'cache');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const path = req.originalUrl || req.path;
    console.log(`[${req.method}] ${path} ${res.statusCode} ${duration}ms`);
  });
  next();
};

const REQUIRED_ENV = ['NVIDIA_API_KEY'];
const missingVars = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingVars.length > 0) {
  console.log(`[Config] NVIDIA_API_KEY not in env — users must provide it via /configure`);
}

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

app.use(requestLogger);
app.use(express.json());

const STORED_CFG_PATTERN = /^\/cfg_([a-f0-9]{12})\/(auto|separate)\/(any|os|subdl|subsource)\/(spa|lat|esp)(\/.*)?$/;
const CONFIG_PATTERN = /^\/(auto|separate)\/(any|os|subdl|subsource)\/(spa|lat|esp)(\/.*)?$/;

app.use((req, res, next) => {
  // Check for stored config first: /cfg_<hash>/mode/primary/lang/...
  const storedMatch = req.path.match(STORED_CFG_PATTERN);
  if (storedMatch) {
    const stored = loadConfig(storedMatch[1]);
    if (stored) {
      req.url = storedMatch[5] || '/';
      runWithConfig({
        mode: storedMatch[2], primary: storedMatch[3], lang: storedMatch[4],
        baseUrl: BASE_URL,
        nvidiaKey: stored.nvidiaKey, subdlKey: stored.subdlKey, subsourceKey: stored.subsourceKey
      }, () => next());
      return;
    }
  }
  // Check for inline config: /mode/primary/lang/...
  const match = req.path.match(CONFIG_PATTERN);
  if (match) {
    req.url = match[4] || '/';
    runWithConfig({ mode: match[1], primary: match[2], lang: match[3], baseUrl: BASE_URL }, () => next());
  } else {
    runWithConfig({ baseUrl: BASE_URL }, () => next());
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/configure', (req, res) => {
  res.sendFile(path.join(__dirname, 'configure.html'));
});

app.get('/subfile/translated-:hash', asyncHandler(async (req, res) => {
  const filePath = path.join(CACHE_DIR, `${req.params.hash}.srt`);
  if (!fs.existsSync(filePath)) {
    throw new AppError('Translated subtitle not found', 404);
  }
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(fs.readFileSync(filePath, 'utf-8'));
}));

const subtitleDownloaders = {
  'subdl': subdl.downloadSubtitle,
  'subsource': subsource.downloadSubtitle
};

app.get('/subfile/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  const prefix = id.split('-')[0];
  const downloader = subtitleDownloaders[prefix];
  if (!downloader) throw new AppError('Unknown subtitle provider', 404);
  const content = await downloader(id);
  if (!content) throw new AppError('Subtitle not found', 404);
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(content);
}));

app.post('/api/config', (req, res) => {
  const { nvidiaKey, subdlKey, subsourceKey, mode, primary, lang } = req.body || {};
  if (!nvidiaKey) return res.status(400).json({ error: 'NVIDIA_API_KEY is required' });
  const id = saveConfig({ nvidiaKey, subdlKey, subsourceKey });
  const installUrl = `${BASE_URL}/cfg_${id}/${mode || 'auto'}/${primary || 'any'}/${lang || 'spa'}/manifest.json`;
  res.json({ configId: id, installUrl });
});

app.use(getRouter(addonInterface));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) console.error(`[Error] ${err.stack || err.message}`);
  res.status(statusCode).json({ error: err.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Addon running at ${BASE_URL}/manifest.json`);
  console.log(`Configure: ${BASE_URL}/configure`);
});

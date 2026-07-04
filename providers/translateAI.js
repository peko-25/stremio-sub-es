const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { parseSRT, rebuildSRT, extractTextLines, applyTranslatedLines } = require('./srtParser');

const CACHE_DIR = path.join(__dirname, '..', 'cache');
const inProgress = new Map();
const CONCURRENCY = 3;
const BATCH_DELAY = 300;

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function cacheKey(originalUrl, sourceLang, targetLang, langVariant = 'spa') {
  return crypto.createHash('md5').update(`${originalUrl}|${sourceLang}|${targetLang}|${langVariant}`).digest('hex');
}

function getCached(key) {
  const filePath = path.join(CACHE_DIR, `${key}.srt`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return null;
}

function setCached(key, content) {
  ensureCacheDir();
  const filePath = path.join(CACHE_DIR, `${key}.srt`);
  fs.writeFileSync(filePath, content, 'utf-8');
}

class TranslateError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'nvidia/riva-translate-4b-instruct-v1.1';

function getSystemPrompt(langVariant) {
  if (langVariant === 'lat') return 'en-es-us';
  if (langVariant === 'esp') return 'en-es-es';
  return 'en-es';
}

async function translateSingleLine(text, attempt = 1, langVariant = 'spa') {
  if (!process.env.NVIDIA_API_KEY) {
    throw new TranslateError('NVIDIA_API_KEY not configured', 401);
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: getSystemPrompt(langVariant) },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) {
      throw new TranslateError('NVIDIA API key is invalid or expired', 401);
    }
    if (status === 429) {
      if (attempt < 3) {
        const wait = attempt * 2000;
        console.warn(`[Translate] Rate limited, retrying in ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
        return translateSingleLine(text, attempt + 1, langVariant);
      }
      throw new TranslateError('NVIDIA API rate limit exceeded', 429);
    }
    console.error(`[Translate] API error: ${error.message}${status ? ` (${status})` : ''}`);
    throw new TranslateError(error.message, status || 500);
  }
}

async function translateSRT(originalUrl, sourceLang, targetLang, langVariant = 'spa') {
  const cKey = cacheKey(originalUrl, sourceLang, targetLang, langVariant);

  const cached = getCached(cKey);
  if (cached) {
    console.log(`[Translate] Cache hit for ${cKey.slice(0, 8)}...`);
    return cached;
  }

  if (inProgress.has(cKey)) {
    console.log(`[Translate] Translation already in progress for ${cKey.slice(0, 8)}..., waiting...`);
    return inProgress.get(cKey);
  }

  const promise = doTranslate(originalUrl, cKey, langVariant);
  inProgress.set(cKey, promise);
  try {
    return await promise;
  } finally {
    inProgress.delete(cKey);
  }
}

async function doTranslate(originalUrl, cKey, langVariant) {
  console.log(`[Translate] Downloading: ${originalUrl}`);
  const srtResponse = await axios.get(originalUrl, {
    responseType: 'text',
    timeout: 15000,
    headers: { 'User-Agent': 'StremioSubAddonES/1.0' }
  });

  const entries = parseSRT(srtResponse.data);
  if (entries.length === 0) {
    throw new Error('No valid SRT entries found');
  }

  console.log(`[Translate] ${entries.length} entries to translate`);

  const allLines = extractTextLines(entries).map(l => l.replace(/\n/g, ' '));
  const translatedLines = [];

  for (let i = 0; i < allLines.length; i += CONCURRENCY) {
    const batch = allLines.slice(i, i + CONCURRENCY);
    console.log(`[Translate] Translating lines ${i + 1}-${Math.min(i + CONCURRENCY, allLines.length)}/${allLines.length}...`);

    const results = await Promise.all(batch.map(line => translateSingleLine(line, 1, langVariant)));

    for (let j = 0; j < batch.length; j++) {
      let text = results[j];
      while (!text || !text.trim()) {
        console.warn(`[Translate] Line ${i + j + 1} empty, retrying...`);
        text = await translateSingleLine(batch[j], 1, langVariant);
      }
      translatedLines.push(text.trim());
    }

    if (i + CONCURRENCY < allLines.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY));
    }
  }

  const translatedEntries = applyTranslatedLines(entries, translatedLines);
  const result = rebuildSRT(translatedEntries);

  setCached(cKey, result);
  console.log(`[Translate] Done. Cached as ${cKey.slice(0, 8)}...`);

  return result;
}

module.exports = { translateSRT, cacheKey };
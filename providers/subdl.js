const axios = require('axios');
const AdmZip = require('adm-zip');
const iconv = require('iconv-lite');
const { getConfig } = require('../config');

const API_BASE = 'https://api.subdl.com/api/v1';

function langToSubdl(lang) {
  if (lang === 'spa' || lang === 'es') return 'ES';
  if (lang === 'eng' || lang === 'en') return 'EN';
  return lang.toUpperCase();
}

async function getSubtitles(args, lang = 'spa') {
  const { id, type } = args;
  const { subdlKey } = getConfig();
  const apiKey = subdlKey || process.env.SUBDL_API_KEY;

  if (!id || !id.startsWith('tt') || !apiKey) return [];

  try {
    const params = {
      api_key: apiKey,
      imdb_id: id,
      type: type === 'movie' ? 'movie' : 'tv',
      subs_per_page: 10,
      languages: langToSubdl(lang)
    };

    const response = await axios.get(`${API_BASE}/subtitles`, {
      params,
      timeout: 10000,
      headers: { 'User-Agent': 'StremioSubAddonES/1.0' }
    });

    if (!response.data?.subtitles?.length) return [];

    const seen = new Set();
    const baseUrl = getConfig().baseUrl;

    const langFilter = l => {
      const lc = l.toLowerCase();
      if (lang === 'spa') return lc === 'spanish' || lc === 'es' || lc === 'spa';
      if (lang === 'eng') return lc === 'english' || lc === 'en' || lc === 'eng';
      return true;
    };

    return response.data.subtitles.filter(sub => {
      if (!langFilter(sub.lang)) return false;
      if (!sub.url) return false;
      const key = sub.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(sub => {
      const sdId = sub.url.match(/\/subtitle\/(\d+)-(\d+)/);
      if (!sdId) return null;
      const fileId = `subdl-${sdId[1]}-${sdId[2]}`;
      return {
        id: `${fileId}-${lang}`,
        url: `${baseUrl}/subfile/${fileId}`,
        lang
      };
    }).filter(Boolean);
  } catch (error) {
    console.error('SubDL search error:', error.message);
    return [];
  }
}

async function downloadSubtitle(fileId) {
  const match = fileId.match(/subdl-(\d+)-(\d+)/);
  if (!match) throw new Error('Invalid file ID');

  const sdId = match[1];
  const subId = match[2];
  const { subdlKey } = getConfig();
  const apiKey = subdlKey || process.env.SUBDL_API_KEY;
  if (!apiKey) throw new Error('SUBDL_API_KEY not configured');

  const zipUrl = `https://dl.subdl.com/subtitle/${sdId}-${subId}.zip?api_key=${apiKey}`;

  const response = await axios.get(zipUrl, {
    responseType: 'arraybuffer',
    timeout: 15000,
    headers: { 'User-Agent': 'StremioSubAddonES/1.0' }
  });

  const zip = new AdmZip(Buffer.from(response.data));
  const entries = zip.getEntries();

  const srtEntry = entries.find(e =>
    e.entryName.toLowerCase().endsWith('.srt')
  );

  if (!srtEntry) throw new Error('No SRT file found in ZIP');

  let buf = srtEntry.getData();

  const hasInvalidUtf8 = (b) => {
    for (let i = 0; i < b.length; i++) {
      if (b[i] >= 0x80 && b[i] <= 0xBF) continue;
      if (b[i] >= 0xC0 && b[i] <= 0xDF) { i++; continue; }
      if (b[i] >= 0xE0 && b[i] <= 0xEF) { i += 2; continue; }
      if (b[i] >= 0xF0 && b[i] <= 0xF7) { i += 3; continue; }
      if (b[i] >= 0x80) return true;
    }
    return false;
  };

  if (!hasInvalidUtf8(buf)) {
    return iconv.decode(buf, 'utf-8');
  }

  return iconv.decode(buf, 'latin1');
}

module.exports = { getSubtitles, downloadSubtitle };
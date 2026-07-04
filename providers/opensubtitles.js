const axios = require('axios');

const API_BASE = 'https://opensubtitles-v3.strem.io/subtitles';

function getLangFilter(lang) {
  if (lang === 'spa') {
    return l => l === 'spa' || l === 'es' || l === 'spn' || l === 'ea';
  }
  if (lang === 'eng') {
    return l => l === 'eng' || l === 'en';
  }
  return () => true;
}

async function getSubtitles(args, lang = 'spa') {
  const { id, type } = args;

  if (!id || !id.startsWith('tt')) return [];

  try {
    const url = `${API_BASE}/${type}/${id}.json`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'StremioSubAddonES/1.0' }
    });

    if (!response.data?.subtitles?.length) return [];

    const seen = new Set();
    const filter = getLangFilter(lang);

    return response.data.subtitles.filter(sub => {
      const langCode = (sub.lang || '').toLowerCase();
      if (!filter(langCode)) return false;

      const key = sub.url || sub.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map((sub, i) => ({
      id: `os-${lang}-${Buffer.from(sub.url).toString('base64url').slice(0, 16)}`,
      url: sub.url,
      lang
    }));
  } catch (error) {
    console.error(`OpenSubtitles error (${lang}):`, error.message);
    return [];
  }
}

module.exports = { getSubtitles };
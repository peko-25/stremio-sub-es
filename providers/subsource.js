const axios = require('axios');
const AdmZip = require('adm-zip');
const iconv = require('iconv-lite');
const { getConfig } = require('../config');

const API_BASE = 'https://api.subsource.net/api/v1';

function langToSubsource(lang) {
  const map = { spa: 'spanish', eng: 'english' };
  return map[lang] || lang;
}

function parseId(id) {
  const parts = id.split(':');
  return {
    imdbId: parts[0],
    season: parts[1] ? parseInt(parts[1]) : undefined,
    episode: parts[2] ? parseInt(parts[2]) : undefined
  };
}

async function getSubtitles(args, lang = 'spa') {
  const { id, type } = args;
  if (!id || !id.startsWith('tt')) return [];
  if (!process.env.SUBSOURCE_API_KEY) return [];

  const { imdbId, season, episode } = parseId(id);
  const apiKey = process.env.SUBSOURCE_API_KEY;

  try {
    const searchParams = { api_key: apiKey, searchType: 'imdb', imdb: imdbId };
    if (season) searchParams.season = season;

    const searchRes = await axios.get(`${API_BASE}/movies/search`, {
      params: searchParams,
      timeout: 10000,
      headers: { 'User-Agent': 'StremioSubAddonES/1.0' }
    });

    const movies = searchRes.data?.data;
    if (!movies || !movies.length) return [];
    const movieId = movies[0].movieId;

    const targetLang = langToSubsource(lang);
    const subParams = { api_key: apiKey, language: targetLang, limit: 50, movieId };
    if (season) subParams.seasonNumber = season;
    if (episode) subParams.episodeNumber = episode;

    const subsRes = await axios.get(`${API_BASE}/subtitles`, {
      params: subParams,
      timeout: 10000,
      headers: { 'User-Agent': 'StremioSubAddonES/1.0' }
    });

    const subs = subsRes.data?.data;
    if (!subs || !subs.length) return [];

    const baseUrl = getConfig().baseUrl;

    return subs.map(sub => ({
      id: `subsource-${sub.subtitleId}`,
      url: `${baseUrl}/subfile/subsource-${sub.subtitleId}`,
      lang
    }));
  } catch (error) {
    console.error(`Subsource error (${lang}):`, error.message);
    return [];
  }
}

async function downloadSubtitle(fileId) {
  const subId = fileId.replace('subsource-', '');
  const apiKey = process.env.SUBSOURCE_API_KEY;

  const response = await axios.get(`${API_BASE}/subtitles/${subId}/download`, {
    params: { api_key: apiKey },
    responseType: 'arraybuffer',
    timeout: 15000,
    headers: { 'User-Agent': 'StremioSubAddonES/1.0' }
  });

  const zip = new AdmZip(Buffer.from(response.data));
  const entries = zip.getEntries();
  const srtEntry = entries.find(e => e.entryName.toLowerCase().endsWith('.srt'));
  if (!srtEntry) throw new Error('No SRT found in Subsource ZIP');

  const buf = srtEntry.getData();
  try {
    return buf.toString('utf-8');
  } catch {
    return iconv.decode(buf, 'latin1');
  }
}

module.exports = { getSubtitles, downloadSubtitle };

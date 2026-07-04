const { addonBuilder } = require('stremio-addon-sdk');
const opensubtitles = require('./providers/opensubtitles');
const subdl = require('./providers/subdl');
const subsource = require('./providers/subsource');
const { translateSRT, cacheKey } = require('./providers/translateAI');
const { getConfig } = require('./config');

const manifest = {
  id: 'org.misubtitulos.es.multifuente',
  version: '1.3.0',
  name: 'Subtítulos Español + AI',
  description: 'Subtítulos en español desde OpenSubtitles, SubDL y Subsource, con traducción AI vía NVIDIA',
  resources: ['subtitles'],
  types: ['movie', 'series'],
  idPrefixes: ['tt'],
  catalogs: []
};

const builder = new addonBuilder(manifest);

const PROVIDERS = [
  { key: 'os', name: 'OpenSubtitles', fn: opensubtitles.getSubtitles },
  { key: 'subdl', name: 'SubDL', fn: subdl.getSubtitles },
  { key: 'subsource', name: 'Subsource', fn: subsource.getSubtitles }
];

function getLangLabel(lang) {
  switch (lang) {
    case 'lat': return 'Latinoamérica';
    case 'esp': return 'España';
    default: return 'Español';
  }
}

async function searchAll(args, langCode) {
  return Promise.all(
    PROVIDERS.map(p =>
      p.fn(args, langCode)
        .then(subs => subs.map(s => ({ ...s, provider: p.key })))
        .catch(e => {
          console.error(`[${p.key}] Error: ${e.message}`);
          return [];
        })
    )
  ).then(arrays => arrays.flat());
}

builder.defineSubtitlesHandler(async function(args) {
  const config = getConfig();
  const { mode, primary, lang } = config;
  const langLabel = getLangLabel(lang);

  if (!args.id) return { subtitles: [] };

  try {
    const spanishSubs = await searchAll(args, 'spa');

    if (mode === 'auto') {
      if (spanishSubs.length > 0) {
        let candidates = spanishSubs;
        if (primary !== 'any') {
          const filtered = spanishSubs.filter(s => s.provider === primary);
          if (filtered.length > 0) candidates = filtered;
        }
        const sub = candidates[0];
        console.log(`[${args.id}] Auto ${sub.provider}: ${langLabel}`);
        return { subtitles: [{ id: sub.id, url: sub.url, lang: `Subtítulos ${langLabel} + AI` }] };
      }

      console.log(`[${args.id}] Sin español. Buscando inglés...`);
      const englishSubs = await searchAll(args, 'eng');
      if (englishSubs.length === 0) {
        console.log(`[${args.id}] Sin inglés`);
        return { subtitles: [] };
      }

      const bestEng = englishSubs[0];
      console.log(`[${args.id}] Traduciendo: ${bestEng.url}`);
      try {
        const content = await translateSRT(bestEng.url, 'English', 'Spanish', lang);
        const hash = cacheKey(bestEng.url, 'English', 'Spanish', lang);
        return {
          subtitles: [{
            id: `translated-${hash}`,
            url: `${config.baseUrl}/subfile/translated-${hash}`,
            lang: `Subtítulos ${langLabel} + AI`
          }]
        };
      } catch (e) {
        console.error(`[${args.id}] Traducción falló: ${e.message}`);
        return { subtitles: [{ id: `eng-${bestEng.id}`, url: bestEng.url, lang: 'eng' }] };
      }
    }

    const entries = [];

    PROVIDERS.forEach(p => {
      const subs = spanishSubs.filter(s => s.provider === p.key);
      subs.forEach(s => {
        entries.push({ id: s.id, url: s.url, lang: `Subtítulos ${langLabel} + AI` });
      });
    });

    console.log(`[${args.id}] Separate: ${entries.length} subs`);
    return { subtitles: entries };
  } catch (error) {
    console.error(`[${args.id}] Error: ${error.message}`);
    return { subtitles: [] };
  }
});

module.exports = builder.getInterface();

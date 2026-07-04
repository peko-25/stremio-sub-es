function parseSRT(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('SRT content must be a non-empty string');
  }

  const entries = [];
  const blocks = content.trim().split(/\r?\n\r?\n/);

  for (const block of blocks) {
    const lines = block.trim().split(/\r?\n/);
    if (lines.length < 3) continue;

    const index = parseInt(lines[0], 10);
    if (isNaN(index)) continue;

    const timeMatch = lines[1].match(
      /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/
    );
    if (!timeMatch) continue;

    const text = lines.slice(2).join('\n');

    entries.push({
      index,
      start: timeMatch[1].replace(',', ','),
      end: timeMatch[2].replace(',', ','),
      text,
      lines: lines.slice(2)
    });
  }

  return entries;
}

function rebuildSRT(entries) {
  return entries
    .map(e => `${e.index}\n${e.start} --> ${e.end}\n${e.text}`)
    .join('\n\n') + '\n';
}

function extractTextLines(entries) {
  return entries.map(e => e.text);
}

function applyTranslatedLines(entries, translatedLines) {
  return entries.map((entry, i) => {
    const translated = translatedLines[i];
    if (translated && translated.trim()) {
      return { ...entry, text: translated.trim(), lines: [translated.trim()] };
    }
    return entry;
  });
}

module.exports = { parseSRT, rebuildSRT, extractTextLines, applyTranslatedLines };
function findNaturalBoundary(text, start, hardEnd, minEnd) {
  const searchStart = Math.max(start, minEnd);
  const window = text.slice(searchStart, hardEnd);

  const candidates = [
    window.lastIndexOf('\n\n'),
    window.lastIndexOf('. '),
    window.lastIndexOf('? '),
    window.lastIndexOf('! '),
    window.lastIndexOf('; '),
    window.lastIndexOf(', '),
    window.lastIndexOf(' ')
  ];

  const best = Math.max(...candidates);
  if (best < 0) return hardEnd;

  const boundary = searchStart + best + 1;
  return boundary > start ? boundary : hardEnd;
}

function chunkText(input, options = {}) {
  const maxChars = Number(options.maxChars || options.chunkSize || 1200);
  const overlapChars = Number(options.overlapChars ?? options.overlap ?? 120);

  if (!Number.isInteger(maxChars) || maxChars < 100) {
    throw new Error('maxChars must be an integer >= 100');
  }
  if (!Number.isInteger(overlapChars) || overlapChars < 0 || overlapChars >= maxChars) {
    throw new Error('overlapChars must be an integer >= 0 and smaller than maxChars');
  }

  const text = String(input || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!text) return [];
  if (text.length <= maxChars) return [text];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const hardEnd = Math.min(text.length, start + maxChars);
    const minEnd = Math.min(hardEnd, start + Math.floor(maxChars * 0.6));
    const end = hardEnd === text.length
      ? hardEnd
      : findNaturalBoundary(text, start, hardEnd, minEnd);

    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);

    if (end >= text.length) break;

    let nextStart = Math.max(start + 1, end - overlapChars);
    const nextWhitespace = text.indexOf(' ', nextStart);
    if (nextWhitespace !== -1 && nextWhitespace < end) {
      nextStart = nextWhitespace + 1;
    }

    start = nextStart;
  }

  return chunks;
}

module.exports = chunkText;

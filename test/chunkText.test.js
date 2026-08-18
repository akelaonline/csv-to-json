const test = require('node:test');
const assert = require('node:assert/strict');
const chunkText = require('../utils/chunkText');

test('returns one chunk for short text', () => {
  assert.deepEqual(chunkText('Hello world.', { maxChars: 100, overlapChars: 10 }), ['Hello world.']);
});

test('splits long text without exceeding the hard chunk size', () => {
  const text = Array.from({ length: 100 }, (_, index) => `Sentence ${index} has useful content.`).join(' ');
  const chunks = chunkText(text, { maxChars: 300, overlapChars: 40 });

  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 300));
  assert.match(chunks[0], /^Sentence 0/);
});

test('rejects invalid overlap', () => {
  assert.throws(
    () => chunkText('abc', { maxChars: 100, overlapChars: 100 }),
    /smaller than maxChars/
  );
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectPng } from '../tools/check-art-assets.mjs';

function pngHeader(colourType) {
  const data = Buffer.alloc(33);
  Buffer.from('89504e470d0a1a0a', 'hex').copy(data, 0);
  data.writeUInt32BE(13, 8);
  data.write('IHDR', 12);
  data.writeUInt32BE(96, 16);
  data.writeUInt32BE(128, 20);
  data[24] = 8;
  data[25] = colourType;
  return data;
}

test('art admission gate rejects sprite PNGs without alpha', () => {
  assert.equal(inspectPng(pngHeader(6)).hasAlpha, true);
  assert.equal(inspectPng(pngHeader(2)).hasAlpha, false);
});


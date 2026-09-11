import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync(new URL('../docs/visual-review/stage-03a-visual-production-grammar/visual-production-manifest.json', import.meta.url)));
test('Stage 03A manifest represents all locked physiology categories', () => {
  assert.equal(manifest.categories.length, 12);
  assert.deepEqual(manifest.categories.map((c) => c.id.slice(0, 2)), ['01','02','03','04','05','06','07','08','09','10','11','12']);
});
test('Stage 03A preserves independent tail ownership and provenance seam', () => {
  const tail = manifest.categories.find((c) => c.id === '10_tail').traits.find((t) => t.id === 'tail_identity');
  assert.equal(tail.semantic_ownership, true);
  assert.ok(manifest.external_source_schema.classifications.includes('REFERENCE'));
  assert.ok(manifest.direction_contract.directions.includes('front_right_3q'));
});

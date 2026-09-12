import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const p = 'docs/visual-review/stage-03d-directional-hair-consistency/directional-hair-source-manifest.json';
const m = JSON.parse(fs.readFileSync(p, 'utf8'));
const ids = ['mc-hair-01-compact-offset', 'mc-hair-02-side-biased-layered'];
const dirs = ['front','front-left-3q','left','back-left-3q','back','back-right-3q','right','front-right-3q'];
test('Stage 03D direction contract', () => {
  assert.deepEqual(m.directions, dirs);
  assert.equal(m.records.filter(r => r.hair_identity_id === ids[0]).length, 8);
  assert.equal(m.records.filter(r => r.hair_identity_id === ids[1]).length, 7);
  assert.equal(m.reconciliation.missing_direction.intended_anatomical_direction, 'front-right-3q');
  assert.equal(m.reconciliation.missing_direction.status, 'pending_authoring');
  assert.ok(m.records.every(r => r.production_asset === false));
  assert.ok(m.records.every(r => r.embedded_text_trusted === false));
});

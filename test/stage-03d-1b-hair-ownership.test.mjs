import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const p='docs/visual-review/stage-03d-1b-hair-ownership-correction/corrected-ownership-manifest.json';
const m=JSON.parse(fs.readFileSync(p,'utf8'));
test('03D.1B ownership contract',()=>{assert.equal(m.hair_identity_id,'mc-hair-01-compact-offset');assert.equal(m.direction,'front');assert.deepEqual(m.ownership_classes.slice(0,2),['projecting_hair','scalp_surface_hair']);assert.equal(m.hidden_content_generated,false);assert.equal(m.hair02_work,false);assert.equal(m.other_directions_work,false);assert.ok(m.counts.projecting_hair>0);assert.ok(m.counts.scalp_surface_hair>0);});

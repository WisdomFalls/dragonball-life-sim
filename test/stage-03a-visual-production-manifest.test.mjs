import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync(new URL('../docs/visual-review/stage-03a-visual-production-grammar/visual-production-manifest.json', import.meta.url)));
const traits = manifest.categories.find((c) => c.id === '03_body_mass_density').traits;
test('Stage 03A manifest represents all locked physiology categories', () => { assert.equal(manifest.categories.length, 12); });
test('Stage 03A preserves independent tail ownership and provenance seam', () => { assert.equal(manifest.categories.find((c) => c.id === '10_tail').traits.find((t) => t.id === 'tail_identity').semantic_ownership, true); assert.ok(manifest.external_source_schema.classifications.includes('REFERENCE')); });
test('Stage 03A.1 separates biological density from derived current mass', () => {
  const density=traits.find((t)=>t.id==='biological_density_profile'), mass=traits.find((t)=>t.id==='current_body_mass');
  assert.deepEqual([density.owner,density.heritability],['BODY','inherited']); assert.deepEqual([mass.owner,mass.heritability],['CURRENT_STATE','derived']);
  for (const trait of [density,mass]) { assert.ok(!trait.classification.includes('AUTHORED_GEOMETRY')); assert.ok(!trait.classification.includes('DIRECTIONAL_COMPONENT')); assert.deepEqual(trait.presentation_tiers,[]); }
});

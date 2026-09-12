import test from 'node:test';
import assert from 'node:assert/strict';
import schema from '../external-specimen.schema.json' with { type: 'json' };

test('external specimen contract is backend-independent and quarantined', () => {
  assert.equal(schema.type, 'ExternalHairSpecimen');
  assert.deepEqual(schema.provenance_classes, [
    'original_mortal_coil', 'fan_resource_permitted', 'reference_only',
    'official_extracted', 'license_unknown'
  ]);
  assert.ok(schema.required.includes('sha256'));
  assert.ok(schema.required.includes('available_directions'));
});

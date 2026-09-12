import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const repo = path.resolve(root, '../../..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'external-specimens/manifests/xv2-hum-015-resource-hair.json')));

test('XV2 donor is schema-shaped, quarantined, and hash-stable', () => {
  assert.equal(manifest.specimen_id, 'xv2-hum-015-resource-hair');
  assert.equal(manifest.provenance_class, 'license_unknown');
  assert.equal(manifest.production_status, 'reference_only');
  assert.match(manifest.source_paths[0], /external-specimens[\\/]raw/);
  for (const file of manifest.files) {
    const bytes = fs.readFileSync(path.join(repo, file.path));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), file.sha256);
  }
  assert.equal(manifest.raw_inventory.length, 4);
});

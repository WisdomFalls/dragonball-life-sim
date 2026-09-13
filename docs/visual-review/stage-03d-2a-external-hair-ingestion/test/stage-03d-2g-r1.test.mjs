import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const p='docs/visual-review/stage-03d-2a-external-hair-ingestion/LUCEUS-EXTRACTION-REPORT.md';
test('03D.2G-R1 preserves blocked tooling verdict',()=>{const s=fs.readFileSync(p,'utf8'); assert.match(s,/BLOCKED\/UNTESTED/); assert.match(s,/UNRESOLVED/); assert.match(s,/ModuleNotFoundError/);});

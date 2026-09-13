import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path';
const d=path.resolve('docs/visual-review/stage-03d-2a-external-hair-ingestion/external-specimens/derived-reference/tryzick-board');
const ids=['hair-a-resource-hum015','tryzick-hum014','tryzick-hum015-luceus','tryzick-hum016','tryzick-hum017'];
test('03D.2F-R1 comparison board artifacts',()=>{ for(const id of ids) for(const v of ['front','front-left-3q']) assert.ok(fs.existsSync(path.join(d,`${id}-${v}.png`))); assert.ok(fs.existsSync(path.join(d,'tryzick-male-donor-front-comparison.png'))); assert.ok(fs.existsSync(path.join(d,'tryzick-male-donor-3q-comparison.png'))); });

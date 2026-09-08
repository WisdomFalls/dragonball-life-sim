import { test } from 'node:test';
import assert from 'node:assert/strict';

import { resolveAppearance } from '../src/ui/appearance.js';

test('appearance resolution uses worn bag entries instead of every owned item', () => {
  const resolved = resolveAppearance({
    appearance: { outfit: 'casual', accessories: ['headband'] },
    items: ['acc_cape', 'acc_scarf'],
    bag: [
      { id: 'acc_cape', worn: false },
      { id: 'acc_scarf', worn: true },
      { id: 'light_armour', worn: true },
    ],
  });
  assert.deepEqual(resolved.accessories.sort(), ['headband', 'scarf']);
  assert.equal(resolved.appearance.outfit, 'armour_saiyan');
});

test('appearance resolution preserves legacy item-only saves and body marks', () => {
  const resolved = resolveAppearance({
    appearance: { marking: 'scar', marks: [] },
    items: ['scouter'],
    scars: [{ mark: 'missing_eye' }],
    inAfterlife: true,
    keptBody: false,
    activeForm: 'ssj',
  });
  assert.deepEqual(resolved.marks.sort(), ['missing_eye', 'scar_cheek']);
  assert.deepEqual(resolved.accessories.sort(), ['eyepatch', 'halo', 'scouter']);
  assert.equal(resolved.form.id, 'ssj');
});

test('appearance resolution selects lore-appropriate rigs for major forms', () => {
  const ape = resolveAppearance({ raceId: 'saiyan', appearance: {} }, { form: { id: 'golden_oozaru' }, mode: 'battle' });
  const giant = resolveAppearance({ raceId: 'namekian', appearance: {} }, { form: { id: 'giant_form' }, mode: 'battle' });
  const orange = resolveAppearance({ raceId: 'namekian', appearance: {} }, { form: { id: 'orange_piccolo' }, mode: 'battle' });
  assert.deepEqual(ape.rig, { family: 'great_ape', scale: 'colossal', pose: 'beast', id: 'great_ape:colossal:beast' });
  assert.equal(giant.rig.id, 'namekian:giant:guard');
  assert.equal(orange.rig.id, 'namekian:large:ready');
});



test('asset plans keep compact sprites and sheet portraits visually identical', async () => {
  const { portraitAssetPlan } = await import('../src/ui/portrait-assets.js');
  const character = {
    raceId: 'saiyan', tail: true, activeForm: { id: 'ssj_grade3' },
    appearance: { face: 'angular', eyeShape: 'sharp', eyeColour: 'green', hairStyle: 'wild', hairColour: 'black', outfit: 'gi_blue' },
    bag: [{ id: 'scouter', worn: true }],
  };
  const sprite = portraitAssetPlan(character, { variant: 'sprite', mode: 'battle' });
  const sheet = portraitAssetPlan(character, { variant: 'sheet', mode: 'battle' });
  assert.equal(sprite.variant, 'sprite');
  assert.equal(sheet.variant, 'sheet');
  assert.deepEqual(sprite.layers, sheet.layers);
  assert.equal(sprite.rig.id, 'humanoid:large:ready');
  assert.equal(sprite.renderer, 'parametric-fallback');
  assert.ok(sprite.layers.some((entry) => entry.key === 'accessory/scouter'));
});


test('asset renderer only composes complete reviewed layer sets', async () => {
  const { renderAssetPortrait } = await import('../src/ui/portrait-assets.js');
  assert.equal(renderAssetPortrait({ renderer: 'parametric-fallback' }), null);
  const svg = renderAssetPortrait({
    renderer: 'asset', variant: 'sprite', rig: { id: 'humanoid:standard:ready' },
    layers: [],
  });
  assert.match(svg, /viewBox="0 0 96 128"/);
  assert.match(svg, /data-renderer="asset"/);
});


test('an art pack must cover every required layer before it activates', async () => {
  const { portraitAssetPlan, requiredAssetKeys, renderAssetPortrait } = await import('../src/ui/portrait-assets.js');
  const character = { raceId: 'earthling', appearance: { face: 'square', eyeShape: 'sharp', eyeColour: 'brown', hairStyle: 'cropped', hairColour: 'black', outfit: 'casual' } };
  const required = requiredAssetKeys(character);
  const incomplete = portraitAssetPlan(character, { manifest: {} });
  assert.equal(incomplete.renderer, 'parametric-fallback');
  const manifest = Object.fromEntries(required.map((key) => [key, { src: 'data:image/png;base64,approved' }]));
  const complete = portraitAssetPlan(character, { manifest });
  assert.equal(complete.renderer, 'asset');
  assert.match(renderAssetPortrait(complete, manifest), /data-slot="body"/);
});


test('every declared race resolves to a deliberate visual family', async () => {
  const { RACES } = await import('../src/data/races.js');
  const { bodyFamilyFor, HAIRLESS_RACES } = await import('../src/ui/appearance.js');
  for (const race of RACES) assert.notEqual(bodyFamilyFor(race.id), 'generated_humanoid', race.id);
  assert.equal(bodyFamilyFor('vezrin'), 'vezrin');
  assert.equal(HAIRLESS_RACES.has('vezrin'), true);
});

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

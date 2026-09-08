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

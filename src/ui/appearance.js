// Presentation-only appearance resolution.
//
// Simulation records deliberately keep birth traits, equipment, injuries and
// transformations in separate places. Renderers should never each decide how
// to combine them: this module makes one deterministic snapshot for a portrait
// or, later, an authored sprite rig.

import { getItem } from '../data/items.js';

const ITEM_ACCESSORIES = {
  scouter: 'scouter', potara: 'potara', z_sword: 'sword', power_pole: 'pole',
  championship_belt: 'belt', turtle_shell: 'shell', cyber_eye: 'cyber_eye',
};

const BODY_OUTFITS = {
  gi: 'gi_orange', armour: 'armour_saiyan', casual: 'casual',
};

function addUnique(list, value) {
  if (value && !list.includes(value)) list.push(value);
}

function markIds(character) {
  const appearance = character.appearance || {};
  const marks = (appearance.marks || []).slice();
  if (appearance.marking && appearance.marking !== 'none' && !marks.length) {
    marks.push(appearance.marking === 'scar' ? 'scar_cheek' : appearance.marking);
  }
  for (const scar of character.scars || []) addUnique(marks, scar.mark);
  return marks;
}

function visualItems(character) {
  const bag = character.bag || [];
  // A bag is authoritative once it exists. Older saves only have items, so
  // retain the previous behaviour until they are migrated into a bag.
  if (bag.length) return bag.filter((entry) => entry.worn).map((entry) => entry.id);
  return character.items || [];
}

function equip(character, marks) {
  const accessories = (character.appearance && character.appearance.accessories || []).slice();
  let outfit = character.appearance && character.appearance.outfit;

  for (const itemId of visualItems(character)) {
    const item = getItem(itemId);
    if (!item) continue;
    addUnique(accessories, item.wear || ITEM_ACCESSORIES[itemId]);
    if (item.slot === 'body' && BODY_OUTFITS[item.style]) outfit = BODY_OUTFITS[item.style];
  }
  if (character.inAfterlife && !character.keptBody) addUnique(accessories, 'halo');
  if (marks.includes('missing_eye') && !accessories.includes('cyber_eye')) addUnique(accessories, 'eyepatch');
  return { accessories, outfit };
}

/**
 * Resolve all presentation data without changing the character record. `form`
 * is allowed to be a transformation object or its id; battle passes the live
 * object while normal portraits can use activeForm from the saved character.
 */
export function resolveAppearance(character = {}, opts = {}) {
  const marks = markIds(character);
  const equipment = equip(character, marks);
  const selectedForm = opts.form === undefined ? character.activeForm : opts.form;
  const form = typeof selectedForm === 'string' ? { id: selectedForm } : selectedForm || null;
  const appearance = {
    buildShape: 'balanced', hairStyle: 'spiked', hairColour: 'black',
    eyeShape: 'sharp', eyeColour: 'black', skin: 'light', face: 'square',
    outfit: 'casual', marks: [], accessories: [],
    ...(character.appearance || {}),
    outfit: equipment.outfit || (character.appearance && character.appearance.outfit) || 'casual',
  };
  return {
    character,
    appearance,
    marks,
    accessories: equipment.accessories,
    form,
    maturityRate: opts.maturityRate ?? character.maturityRate ?? 1,
    expression: opts.expression,
    mode: opts.mode || 'profile',
  };
}

export function resolvedAccessoryIds(character, opts) {
  return resolveAppearance(character, opts).accessories;
}

export function resolvedMarkIds(character, opts) {
  return resolveAppearance(character, opts).marks;
}

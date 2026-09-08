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

// These are art-rig names rather than gameplay race labels. A pixel renderer
// needs to select a real silhouette before it selects hair or clothing: an
// ape, a giant Namekian and a Frost Demon cannot be made believable by scaling
// the same humanoid sprite.
export const BODY_FAMILIES = Object.freeze({
  saiyan: 'humanoid', halfsaiyan: 'humanoid', earthling: 'humanoid',
  android: 'humanoid', half_android: 'humanoid', tuffle: 'humanoid',
  cerealian: 'humanoid', half_cerealian: 'humanoid', shinjin: 'humanoid',
  metamoran: 'humanoid', unrecorded: 'humanoid', driftkin: 'humanoid',
  namekian: 'namekian', frostdemon: 'frost_demon', half_frostkin: 'frost_demon',
  frost_android: 'frost_demon', majin: 'majin', bioandroid: 'bioandroid',
  yardratian: 'yardratian', kryllian: 'kryllian', vezrin: 'vezrin', beast: 'beast',
});

// Hairlessness is a species fact, independent of the broader body family.
export const HAIRLESS_RACES = new Set(['namekian', 'frostdemon', 'majin', 'bioandroid', 'vezrin']);

export function bodyFamilyFor(raceId) {
  return BODY_FAMILIES[raceId] || 'generated_humanoid';
}

const FORM_RIGS = {
  golden_oozaru: { family: 'great_ape', scale: 'colossal', pose: 'beast' },
  giant_form: { family: 'namekian', scale: 'giant', pose: 'guard' },
  spirit_giant: { family: 'yardratian', scale: 'giant', pose: 'guard' },
  orange_piccolo: { family: 'namekian', scale: 'large', pose: 'ready' },
  ssj_grade3: { scale: 'large', pose: 'ready' },
  legendary_ss: { scale: 'large', pose: 'ready' },
  majin_super: { scale: 'large', pose: 'ready' },
};

const STANCE_POSES = {
  turtle: 'guard', crane: 'ready', saiyan: 'ready', namek: 'guard',
  demon: 'aggressive', formless: 'neutral', custom: 'neutral',
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

function rigFor(character, appearance, form, mode) {
  const base = bodyFamilyFor(character.raceId);
  const formRig = form && FORM_RIGS[form.id] || {};
  return {
    family: formRig.family || base,
    scale: formRig.scale || 'standard',
    pose: formRig.pose || (mode === 'battle' ? STANCE_POSES[appearance.stance] || 'ready' : 'neutral'),
    // A stable id lets authored sprite manifests target a family and form
    // without branching on every simulation field in the renderer.
    id: `${formRig.family || base}:${formRig.scale || 'standard'}:${formRig.pose || (mode === 'battle' ? STANCE_POSES[appearance.stance] || 'ready' : 'neutral')}`,
  };
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
  const mode = opts.mode || 'profile';
  return {
    character,
    appearance,
    marks,
    accessories: equipment.accessories,
    form,
    maturityRate: opts.maturityRate ?? character.maturityRate ?? 1,
    expression: opts.expression,
    mode,
    rig: rigFor(character, appearance, form, mode),
  };
}

export function resolvedAccessoryIds(character, opts) {
  return resolveAppearance(character, opts).accessories;
}

export function resolvedMarkIds(character, opts) {
  return resolveAppearance(character, opts).marks;
}


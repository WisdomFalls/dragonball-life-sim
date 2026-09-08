// Presentation-only appearance resolution.
//
// Simulation records deliberately keep birth traits, equipment, injuries and
// transformations in separate places. Renderers should never each decide how
// to combine them: this module makes one deterministic snapshot for a portrait
// or, later, an authored sprite rig.

import { getItem } from '../data/items.js';
import { ageStageFor, TRANSFORMATION_VISUAL_MAPS, visualAttachmentsFor } from '../engine/visuals.js';

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

// Versioned presentation data.  This is intentionally additive: old saves
// have only `appearance`, while newly authored characters may opt into a
// visual profile without making the simulation depend on image filenames.
export const VISUAL_PROFILE_VERSION = 1;

function distinct(values) {
  return [...new Set(values.filter(Boolean))];
}

function injuryIds(character) {
  const raw = character.injuries || character.injury || [];
  return distinct((Array.isArray(raw) ? raw : [raw]).map((injury) => (
    typeof injury === 'string' ? injury : injury.id || injury.type || injury.mark
  )));
}

/**
 * A renderer-neutral description of one character's identity.  It describes
 * *what* must remain recognisable between a 220px sheet and a 96px sprite;
 * the art manifest decides *how* that identity is drawn.  Fields deliberately
 * use ids and palette names, never generated image URLs.
 */
export function visualProfileFor(character = {}, opts = {}) {
  const resolved = resolveAppearance(character, opts);
  const a = resolved.appearance;
  const custom = a.visualProfile || {};
  const savedIdentity = character.visualIdentity || null;
  const personal = character.personalAppearance || {};
  const behavior = character.visualBehavior || null;
  const expression = opts.expression ? resolved.visualState.temporary.expression.primary : custom.expression || a.expression || resolved.visualState.temporary.expression.primary || 'neutral';
  const cybernetics = distinct([
    ...(custom.cybernetics || a.cybernetics || []),
    ...(resolved.accessories.includes('cyber_eye') ? ['cyber_eye'] : []),
  ]);
  const profileId = custom.id || a.visualProfileId || character.visualProfileId || character.id || character.name || 'generated';
  return {
    version: VISUAL_PROFILE_VERSION,
    id: String(profileId),
    rig: resolved.rig,
    identity: {
      raceId: character.raceId || 'unknown',
      bodyFamily: resolved.rig.family,
      build: custom.build || a.buildShape || 'balanced',
      skin: custom.skin || a.skin,
      face: custom.face || a.face,
      eyeShape: custom.eyeShape || a.eyeShape,
      eyeColour: custom.eyeColour || a.eyeColour,
      hairStyle: custom.hairStyle || a.hairStyle,
      hairColour: custom.hairColour || a.hairColour,
      facialHair: personal.facialHair || custom.facialHair || a.facialHair || 'none',
      speciesFeatures: distinct(custom.speciesFeatures || a.speciesFeatures || []),
    },
    styling: {
      // Worn equipment wins over a saved cosmetic preference.
      outfit: a.outfit,
      footwear: custom.footwear || a.footwear || 'default',
      accessories: resolved.accessories,
      palette: custom.palette || a.palette || 'default',
    },
    condition: {
      marks: resolved.marks,
      injuries: injuryIds(character),
      cybernetics,
    },
    pose: {
      stance: a.stance || 'formless',
      expression,
    },
    transformation: resolved.form && resolved.form.id || null,
    biologicalIdentity: savedIdentity && savedIdentity.biological || null,
    personalAppearance: personal,
    learnedBehavior: behavior,
    visualState: resolved.visualState,
  };
}

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
  return { accessories, outfit, attachments: visualAttachmentsFor(visualItems(character), {
    legacyIds: accessories, raceId: character.raceId, rigFamily: bodyFamilyFor(character.raceId),
  }) };
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
  const visualState = resolveVisualState(character, { marks, accessories: equipment.accessories, attachments: equipment.attachments, form, expression: opts.expression ?? character.expressionGuidance ?? appearance.expression, mode });
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
    visualState,
  };
}

/** Translate authoritative simulation facts into presentation facts only. */
export function resolveVisualState(character = {}, opts = {}) {
  const injuryRecords = (character.injuries || []).map((entry) => normalizeVisualInjury(typeof entry === 'string' ? { id: entry } : entry));
  const health = character.vitals && character.vitals.health;
  const healthMax = character.vitals && character.vitals.healthMax;
  const fatigue = health === undefined || !healthMax ? 'normal' : health / healthMax < 0.25 ? 'critical' : health / healthMax < 0.55 ? 'hurt' : 'normal';
  const map = opts.form && TRANSFORMATION_VISUAL_MAPS[opts.form.id] || null;
  return {
    ageStage: ageStageFor(character),
    acquired: { marks: (opts.marks || []).slice(), injuries: injuryRecords, prosthetics: injuryRecords.filter((entry) => entry.prosthetic).map((entry) => entry.prosthetic) },
    temporary: { fatigue, expression: resolveVisualExpression(opts.expression || character.expressionGuidance), afterlife: !!character.inAfterlife, formId: opts.form && opts.form.id || null, aura: map && map.overrides.aura || null },
    attachments: opts.attachments ? opts.attachments.slice() : visualAttachmentsFor([], { legacyIds: opts.accessories || [], raceId: character.raceId, rigFamily: bodyFamilyFor(character.raceId) }),
    alternateRig: map && map.rigOverride || null,
  };
}

/** Pure adapter: simulation supplies a semantic feeling; presentation selects
 * morphology. It neither calculates nor writes emotional simulation state. */
export function resolveVisualExpression(guidance) {
  if (!guidance) return { primary: 'neutral', secondary: null, intensity: 0 };
  if (typeof guidance === 'string') return { primary: guidance, secondary: null, intensity: 50 };
  return { primary: guidance.primary || 'neutral', secondary: guidance.secondary || null, intensity: Math.max(0, Math.min(100, guidance.intensity ?? 50)) };
}

function normalizeVisualInjury(entry = {}) {
  const id = entry.id || 'unknown';
  const side = entry.side || null;
  const lost = { lost_arm: 'missing_arm', lost_hand: 'missing_hand', lost_leg: 'missing_leg', lost_eye: 'missing_eye' }[id] || id;
  const sided = side && (lost.startsWith('missing_') || entry.prosthetic) ? `${lost}_${side}` : lost;
  const prosthetic = entry.prosthetic || null;
  const prostheticKey = prosthetic ? `${prosthetic}_${side || 'center'}` : null;
  return { id, side, prosthetic, assetKey: sided, prostheticKey };
}

export function resolvedAccessoryIds(character, opts) {
  return resolveAppearance(character, opts).accessories;
}

export function resolvedMarkIds(character, opts) {
  return resolveAppearance(character, opts).marks;
}


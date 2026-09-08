// Durable visual contracts. These records describe identity and learned
// behaviour only; live injuries, equipment and forms remain simulation facts
// and are resolved by the UI when a presentation is requested.

import { hashSeed } from './rng.js';
import { getRace } from '../data/races.js';
import { getItem } from '../data/items.js';

export const VISUAL_IDENTITY_VERSION = 1;
export const VISUAL_BEHAVIOR_VERSION = 1;

export const VISUAL_TRAIT_CATEGORIES = Object.freeze({
  biological: 'biological_structural', personal: 'customizable_personal',
  acquired: 'life_acquired', temporary: 'temporary_state',
});

// These starter vocabularies are contracts, not the eventual art count. Asset
// packs may add ids without a save migration as long as they retain old ids.
export const VISUAL_TOKEN_CATALOG = Object.freeze({
  face: { head: ['square_01', 'angular_01', 'round_01', 'long_01'], jaw: ['square_01', 'angular_01', 'tapered_01', 'soft_01'], eyes: ['sharp_01', 'round_01', 'narrow_01', 'wide_01'] },
  body: { frame: ['small_01', 'wiry_01', 'lean_01', 'balanced_01', 'stocky_01', 'massive_01'], posture: ['upright_01', 'relaxed_01', 'forward_01'] },
  hair: { naturalFamily: ['straight', 'coarse_spiked', 'wavy', 'curly'], palette: ['black_01', 'brown_01', 'blonde_01', 'silver_01', 'vivid_01'] },
});

const HAIRLESS = new Set(['namekian', 'frostdemon', 'majin', 'bioandroid', 'vezrin']);
const SPECIES_FEATURES = {
  namekian: ['antennae_01', 'pointed_ears_01'], frostdemon: ['headplate_01', 'tail_standard'],
  majin: ['head_tendril_01'], bioandroid: ['chitin_01'], saiyan: ['tail_standard'], halfsaiyan: ['tail_standard'],
};

const RIG_FAMILIES = {
  saiyan: 'humanoid', halfsaiyan: 'humanoid', earthling: 'humanoid', android: 'humanoid', half_android: 'humanoid', tuffle: 'humanoid', cerealian: 'humanoid', half_cerealian: 'humanoid', shinjin: 'humanoid', metamoran: 'humanoid', unrecorded: 'humanoid', driftkin: 'humanoid',
  namekian: 'namekian', frostdemon: 'frost_demon', half_frostkin: 'frost_demon', frost_android: 'frost_demon', majin: 'majin', bioandroid: 'bioandroid', yardratian: 'yardratian', kryllian: 'kryllian', vezrin: 'vezrin', beast: 'beast',
};

// A compatibility adapter for existing item ids. New item definitions may put
// the same shape under `item.visual`; both routes produce one contract.
const LEGACY_ATTACHMENT_VISUALS = Object.freeze({
  scouter: { slot: 'face', anchor: 'eye_left', layer: 'foreground_face', assetSet: 'accessory/scouter' },
  z_sword: { slot: 'weapon', anchor: 'back', layer: 'behind_body', assetSet: 'weapon/z_sword' },
  power_pole: { slot: 'weapon', anchor: 'hand_front', layer: 'foreground_hand', assetSet: 'weapon/power_pole' },
  cyber_eye: { slot: 'prosthetic', anchor: 'eye_left', layer: 'foreground_face', assetSet: 'prosthetic/mech_eye_left' },
});

const WEAR_SLOTS = Object.freeze({
  headband: ['head', 'forehead', 'foreground_head'], bandana: ['head', 'forehead', 'foreground_head'], glasses: ['face', 'eyes', 'foreground_face'], sunglasses: ['face', 'eyes', 'foreground_face'], earrings: ['ear', 'ear_left', 'foreground_face'], necklace: ['neck', 'chest', 'foreground_body'], cape: ['back', 'back', 'behind_body'], scarf: ['neck', 'neck', 'foreground_body'], wristbands: ['wrist', 'wrist_left', 'foreground_hand'], belt: ['waist', 'waist', 'foreground_body'], shell: ['back', 'back', 'behind_body'], halo: ['head', 'head_top', 'foreground_head'], eyepatch: ['face', 'eye_left', 'foreground_face'],
});

function pick(rng, values, fallback) { return rng && rng.pick ? rng.pick(values) : values[Math.abs(hashSeed(String(fallback))) % values.length]; }
function idFor(character, prefix = 'visual') { return `${prefix}:${character.id || character.canonId || character.name || hashSeed(JSON.stringify(character.appearance || {}))}:v1`; }
function baseAppearance(character) { return character.appearance || {}; }

export function visualConstraintsFor(raceId = 'unknown') {
  const hairless = HAIRLESS.has(raceId);
  return {
    raceId, hairless, bodyFamilies: [RIG_FAMILIES[raceId] || 'generated_humanoid'],
    allowedHairFamilies: hairless ? [] : VISUAL_TOKEN_CATALOG.hair.naturalFamily,
    speciesFeatures: SPECIES_FEATURES[raceId] || [],
    // A future hybrid pack supplies authored rules here; unknown pairings use
    // only explicitly shared components rather than silently mixing rigs.
    hybridPolicy: ['halfsaiyan', 'half_android', 'half_cerealian', 'half_frostkin'].includes(raceId) ? 'authored_hybrid' : 'single_species',
  };
}

/** Enforce starter token and attachment compatibility before persistence. */
export function isVisualTokenCompatible({ raceId = 'unknown', rigFamily, category, tokenId, attachment } = {}) {
  const rules = visualConstraintsFor(raceId);
  if (rigFamily && !rules.bodyFamilies.includes(rigFamily) && !['great_ape', 'giant'].includes(rigFamily)) return false;
  if (category === 'hair') return !rules.hairless && rules.allowedHairFamilies.includes(tokenId);
  if (category === 'speciesFeature') return rules.speciesFeatures.includes(tokenId);
  if (category === 'attachment') {
    const candidate = attachment || tokenId;
    return !!candidate && (!candidate.compatibleRigs || candidate.compatibleRigs.includes('*') || candidate.compatibleRigs.includes(rigFamily || rules.bodyFamilies[0]));
  }
  if (category === 'body') return VISUAL_TOKEN_CATALOG.body.frame.includes(tokenId) || VISUAL_TOKEN_CATALOG.body.posture.includes(tokenId);
  if (category === 'face') return Object.values(VISUAL_TOKEN_CATALOG.face).flat().includes(tokenId);
  if (category === 'transformationRig') return !tokenId || tokenId.startsWith(`${rules.bodyFamilies[0]}:`) || (raceId === 'saiyan' || raceId === 'halfsaiyan') && tokenId.startsWith('great_ape:') || raceId === 'namekian' && tokenId.startsWith('namekian:giant:');
  return false;
}

export function filterCompatibleVisualTokens(tokens = [], context = {}) {
  return tokens.filter((token) => isVisualTokenCompatible({ ...context, tokenId: typeof token === 'string' ? token : token.id, attachment: context.category === 'attachment' ? token : undefined }));
}

/** Normalize new and legacy item data into one renderer-facing attachment. */
export function visualAttachmentFor(itemOrId, opts = {}) {
  const item = typeof itemOrId === 'string' ? getItem(itemOrId) : itemOrId;
  const id = item && item.id || String(itemOrId || 'unknown');
  const declared = item && item.visual || {};
  const legacy = LEGACY_ATTACHMENT_VISUALS[id] || {};
  const wear = item && item.wear || opts.wear || id;
  const [slot = item && item.weaponType ? 'weapon' : 'accessory', anchor = slot, layer = 'foreground_body'] = WEAR_SLOTS[wear] || [];
  return {
    id: declared.id || id, slot: declared.slot || legacy.slot || slot, anchor: declared.anchor || legacy.anchor || anchor,
    layer: declared.layer || legacy.layer || layer, compatibleRigs: declared.compatibleRigs || legacy.compatibleRigs || ['*'],
    assetSet: declared.assetSet || legacy.assetSet || `${item && item.cat === 'weapon' ? 'weapon' : 'accessory'}/${wear}`,
    stateVariants: declared.stateVariants || legacy.stateVariants || ['intact'], state: opts.state || 'intact',
  };
}

export function visualAttachmentsFor(itemIds = [], opts = {}) {
  const ids = [...itemIds, ...(opts.legacyIds || [])];
  return [...new Map(ids.filter(Boolean).map((id) => {
    const attachment = visualAttachmentFor(id, opts);
    return [attachment.id, attachment];
  })).values()].filter((attachment) => isVisualTokenCompatible({ raceId: opts.raceId, rigFamily: opts.rigFamily, category: 'attachment', attachment }));
}

/** Generate once and persist. It deliberately excludes scars and injuries. */
export function generateVisualIdentity(character = {}, rng = null, opts = {}) {
  const a = baseAppearance(character); const raceId = opts.raceId || character.raceId || 'unknown';
  const rules = visualConstraintsFor(raceId);
  const frame = a.buildShape || pick(rng, ['small', 'wiry', 'lean', 'balanced', 'stocky', 'massive'], character.id);
  return {
    version: VISUAL_IDENTITY_VERSION, id: opts.id || idFor(character), source: opts.source || 'generated', raceId,
    biological: {
      body: { frame: `${frame}_01`, posture: 'upright_01', speciesFeatures: rules.speciesFeatures.slice() },
      face: { head: `${a.face || pick(rng, ['square', 'angular', 'round', 'long'], character.id)}_01`, jaw: pick(rng, VISUAL_TOKEN_CATALOG.face.jaw, character.id), eyes: `${a.eyeShape || 'sharp'}_01`, iris: a.eyeColour || 'black' },
      naturalHair: hairIdentity(a, rules, rng, character),
    },
  };
}

function hairIdentity(a, rules, rng, character) {
  if (rules.hairless) return { present: false, family: null, palette: null, transformationMap: `${rules.raceId}_default` };
  return { present: true, family: pick(rng, rules.allowedHairFamilies, character.id), palette: a.hairColour || pick(rng, VISUAL_TOKEN_CATALOG.hair.palette, character.id), transformationMap: `${rules.raceId}_default` };
}

export function personalAppearanceFor(character = {}) {
  const a = baseAppearance(character);
  return {
    version: 1,
    hairstyle: { family: a.hairStyle || 'spiked', front: a.hairFront || null, rear: a.hairRear || null, sideDetail: a.hairSideDetail || null, length: a.hairLength || 'standard', dye: a.hairDye || null },
    facialHair: a.facialHair || 'none', tattoos: (a.tattoos || []).slice(), piercings: (a.piercings || []).slice(), cosmeticMarks: (a.cosmeticMarks || []).slice(),
  };
}

export function initialVisualBehavior(character = {}) {
  const style = character.fightingStyle || 'martial_arts';
  const stance = baseAppearance(character).stance || 'formless';
  return { version: VISUAL_BEHAVIOR_VERSION,
    combat: { origins: [stance === 'formless' ? 'untrained' : stance], guard: stance === 'turtle' ? 'mid_compact' : 'neutral', footwork: style === 'weapons' ? 'measured' : 'balanced', dominance: 'right', aggression: 'neutral', movement: style === 'martial_arts' ? 'martial' : 'practical', weaponStyles: style === 'martial_arts' ? [] : ['basic'] },
    flight: { posture: 'forward_lean', arms: 'arms_back', acceleration: 'controlled', turn: 'standard' },
    ki: { charge: 'two_hand_center', release: 'palm_forward', control: 'stable', aura: 'contained' },
  };
}

/** Additive save migration; leaves legacy appearance as the live source. */
export function ensureVisualContracts(character = {}, opts = {}) {
  if (!character.visualIdentity) character.visualIdentity = generateVisualIdentity(character, null, opts);
  if (!character.personalAppearance) character.personalAppearance = personalAppearanceFor(character);
  if (!character.visualBehavior) character.visualBehavior = initialVisualBehavior(character);
  return character;
}

/**
 * Current saves use `visualIdentity`; semantically it is body-owned. A future
 * Person/Body model may persist it on `bodyVisualIdentity` without changing
 * presentation callers. We intentionally do not create a second saved copy.
 */
export function bodyVisualIdentityFor(body = {}, opts = {}) {
  return body.bodyVisualIdentity || body.visualIdentity || generateVisualIdentity(body, null, opts);
}

/** Person-owned, non-biological tendencies. Styling here is a preference;
 * `personalAppearance` remains the physically present haircut/grooming. */
export function personVisualProfileFor(person = {}) {
  return person.personVisualProfile || {
    id: person.personId || person.id || null,
    stylingPreferences: person.stylingPreferences || {},
  };
}

/**
 * Presentation derives movement vocabulary from simulation facts. The legacy
 * saved `visualBehavior` is a compatible cache/seed, never gameplay truth.
 */
export function deriveVisualBehavior(person = {}, opts = {}) {
  const base = person.visualBehavior || initialVisualBehavior(person);
  const techniques = person.techniques || [];
  const mentors = person.mentors || [];
  const weaponAware = base.combat.weaponStyles.length || techniques.some((id) => /sword|blade|staff|weapon/i.test(id));
  return {
    ...base,
    combat: { ...base.combat, origins: [...new Set([...(base.combat.origins || []), ...mentors.map((id) => `mentor:${id}`)])], weaponStyles: weaponAware ? base.combat.weaponStyles.length ? base.combat.weaponStyles : ['basic'] : [] },
    derivedFrom: { fightingStyle: person.fightingStyle || 'martial_arts', techniqueCount: techniques.length, mentorCount: mentors.length },
  };
}

/**
 * Pure presentation input for a future Person -> Body binding. It never gives
 * the occupant body-owner techniques, memories, or mastery.
 */
export function resolveVisualBinding({ person = {}, body = person, familiarity = 1, state = {} } = {}) {
  const bodyIdentity = bodyVisualIdentityFor(body);
  const safeFamiliarity = Math.max(0, Math.min(1, familiarity));
  return {
    personId: person.personId || person.id || null,
    bodyId: body.bodyId || body.id || null,
    bodyIdentity,
    personProfile: personVisualProfileFor(person),
    learnedBehavior: deriveVisualBehavior(person),
    familiarity: safeFamiliarity,
    execution: safeFamiliarity < 0.35 ? 'unfamiliar' : safeFamiliarity < 0.75 ? 'adapting' : 'familiar',
    state,
  };
}

// Simulation may emit these semantic fields. Presentation maps them to camera,
// animation and effects independently; no sprite/camera instructions belong
// in the simulation contract.
export const SEMANTIC_BEAT_FIELDS = Object.freeze(['sceneId', 'type', 'participants', 'actor', 'target', 'action', 'outcome', 'emotion', 'dialogue', 'technique', 'movementIntent', 'emphasis', 'pace', 'scale', 'tone', 'salience', 'stakes', 'ordering', 'branching', 'context']);

export function ageStageFor(character = {}, year = null) {
  const race = getRace(character.raceId); const age = character.age ?? (year && character.birthYear ? year - character.birthYear : 18);
  const scaled = age * (race && race.agingRate || 1);
  return scaled < 10 ? 'child' : scaled < 16 ? 'adolescent' : scaled < 30 ? 'young_adult' : scaled < 55 ? 'adult' : scaled < 75 ? 'mature' : 'elder';
}

export const TRANSFORMATION_VISUAL_MAPS = Object.freeze({
  ssj: { rigOverride: null, preserve: ['face', 'acquired', 'attachments'], overrides: { hair: 'gold', eyes: 'teal', aura: 'gold' } },
  golden_oozaru: { rigOverride: 'great_ape:colossal:beast', preserve: ['palette', 'acquired'], overrides: { fur: 'gold', aura: 'gold' } },
  giant_form: { rigOverride: 'namekian:giant:guard', preserve: ['face', 'acquired', 'attachments'], overrides: {} },
});

// A deliberately small extension hook: it weights parental authored tokens
// without claiming to be a genetics simulation.
export function generateInheritedVisualIdentity(parentA, parentB, rng, constraints = {}) {
  const a = parentA.visualIdentity || generateVisualIdentity(parentA, rng);
  const b = parentB.visualIdentity || generateVisualIdentity(parentB, rng);
  const child = { id: constraints.id || `child:${a.id}:${b.id}`, raceId: constraints.raceId || a.raceId };
  const result = generateVisualIdentity(child, rng, { source: 'inherited' });
  result.biological.body.frame = pick(rng, [a.biological.body.frame, b.biological.body.frame], child.id);
  result.biological.face.jaw = pick(rng, [a.biological.face.jaw, b.biological.face.jaw], child.id);
  result.biological.face.eyes = pick(rng, [a.biological.face.eyes, b.biological.face.eyes], child.id);
  return result;
}


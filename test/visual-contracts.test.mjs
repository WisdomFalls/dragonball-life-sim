import { test } from 'node:test';
import assert from 'node:assert/strict';

import { Rng } from '../src/engine/rng.js';
import {
  ageStageFor, ensureVisualContracts, generateInheritedVisualIdentity,
  generateVisualIdentity, initialVisualBehavior, visualAttachmentFor, visualAttachmentsFor,
  visualConstraintsFor, isVisualTokenCompatible, filterCompatibleVisualTokens, resolveVisualBinding,
} from '../src/engine/visuals.js';

test('visual identity preserves biological traits separately from acquired history', () => {
  const character = {
    id: 'aurix', raceId: 'saiyan', injuries: [{ id: 'lost_eye', side: 'left' }],
    scars: [{ mark: 'scar_brow' }], appearance: { face: 'angular', hairColour: 'black', hairStyle: 'wild' },
  };
  const identity = generateVisualIdentity(character, new Rng(4));
  assert.equal(identity.biological.face.head, 'angular_01');
  assert.equal(JSON.stringify(identity).includes('lost_eye'), false);
  assert.equal(JSON.stringify(identity).includes('scar_brow'), false);
});

test('visual contracts are additive and retain current hairstyle apart from natural hair', () => {
  const character = { id: 'style', raceId: 'earthling', fightingStyle: 'weapons', appearance: { hairStyle: 'long_tied_01', hairColour: 'brown', stance: 'turtle' } };
  ensureVisualContracts(character, { source: 'player' });
  assert.equal(character.visualIdentity.source, 'player');
  assert.equal(character.personalAppearance.hairstyle.family, 'long_tied_01');
  assert.equal(character.visualIdentity.biological.naturalHair.palette, 'brown');
  assert.equal(character.visualBehavior.combat.guard, 'mid_compact');
  assert.ok(character.visualBehavior.combat.weaponStyles.includes('basic'));
});

test('race constraints reserve species-specific morphology and future hybrid policy', () => {
  assert.equal(visualConstraintsFor('namekian').hairless, true);
  assert.ok(visualConstraintsFor('namekian').speciesFeatures.includes('antennae_01'));
  assert.equal(visualConstraintsFor('halfsaiyan').hybridPolicy, 'authored_hybrid');
});

test('heritage hook creates a related but independently persisted identity', () => {
  const rng = new Rng(88);
  const a = { id: 'a', raceId: 'saiyan', appearance: { buildShape: 'stocky', face: 'angular' } };
  const b = { id: 'b', raceId: 'earthling', appearance: { buildShape: 'lean', face: 'round' } };
  a.visualIdentity = generateVisualIdentity(a, rng); b.visualIdentity = generateVisualIdentity(b, rng);
  const child = generateInheritedVisualIdentity(a, b, rng, { id: 'child', raceId: 'halfsaiyan' });
  assert.equal(child.source, 'inherited');
  assert.ok([a.visualIdentity.biological.body.frame, b.visualIdentity.biological.body.frame].includes(child.biological.body.frame));
  assert.ok([a.visualIdentity.biological.face.jaw, b.visualIdentity.biological.face.jaw].includes(child.biological.face.jaw));
});

test('age stages use race aging rates without mutating visual identity', () => {
  const character = { raceId: 'namekian', age: 55 };
  assert.equal(ageStageFor(character), 'young_adult');
  assert.equal(initialVisualBehavior(character).version, 1);
});

test('visual state resolves acquired history and live form without copying either into identity', async () => {
  const { resolveVisualState } = await import('../src/ui/appearance.js');
  const state = resolveVisualState({
    raceId: 'saiyan', age: 24, inAfterlife: true,
    injuries: [{ id: 'lost_arm', side: 'left', prosthetic: 'mech_arm' }],
    vitals: { health: 20, healthMax: 100 }, activeForm: 'ssj',
  }, { form: { id: 'ssj' }, marks: ['scar_arm'], accessories: ['scouter'] });
  assert.deepEqual(state.acquired.marks, ['scar_arm']);
  assert.deepEqual(state.acquired.prosthetics, ['mech_arm']);
  assert.equal(state.temporary.fatigue, 'critical');
  assert.equal(state.temporary.aura, 'gold');
  assert.deepEqual(state.attachments.map((attachment) => attachment.id), ['scouter']);
});

test('attachment resolver normalizes declared and legacy item visuals', () => {
  const legacy = visualAttachmentFor('scouter');
  assert.deepEqual(legacy, { id: 'scouter', slot: 'face', anchor: 'eye_left', layer: 'foreground_face', compatibleRigs: ['*'], assetSet: 'accessory/scouter', stateVariants: ['intact'], state: 'intact' });
  const declared = visualAttachmentFor({ id: 'test_blade', cat: 'weapon', visual: { slot: 'weapon', anchor: 'hand_front', layer: 'foreground_hand', compatibleRigs: ['humanoid'], assetSet: 'weapon/test_blade', stateVariants: ['intact', 'cracked'] } }, { state: 'cracked' });
  assert.equal(declared.assetSet, 'weapon/test_blade');
  assert.equal(declared.state, 'cracked');
  assert.deepEqual(visualAttachmentsFor(['scouter'], { raceId: 'saiyan', rigFamily: 'humanoid' }).map((a) => a.id), ['scouter']);
});

test('sided injuries and prosthetics retain left/right asset keys in the layer plan', async () => {
  const { resolveVisualState } = await import('../src/ui/appearance.js');
  const { portraitAssetPlan } = await import('../src/ui/portrait-assets.js');
  const character = { raceId: 'earthling', injuries: [{ id: 'lost_arm', side: 'left', prosthetic: 'mech_arm' }, { id: 'lost_eye', side: 'right' }], appearance: {} };
  const state = resolveVisualState(character);
  assert.deepEqual(state.acquired.injuries.map((i) => [i.assetKey, i.prostheticKey]), [['missing_arm_left', 'mech_arm_left'], ['missing_eye_right', null]]);
  const keys = portraitAssetPlan(character).layers.map((layer) => layer.key);
  assert.ok(keys.includes('injury/missing_arm_left'));
  assert.ok(keys.includes('prosthetic/mech_arm_left'));
  assert.ok(keys.includes('injury/missing_eye_right'));
});

test('race compatibility rejects invalid tokens and filters attachments by rig', () => {
  assert.equal(isVisualTokenCompatible({ raceId: 'namekian', rigFamily: 'namekian', category: 'hair', tokenId: 'straight' }), false);
  assert.equal(isVisualTokenCompatible({ raceId: 'namekian', rigFamily: 'namekian', category: 'speciesFeature', tokenId: 'antennae_01' }), true);
  assert.equal(isVisualTokenCompatible({ raceId: 'earthling', rigFamily: 'humanoid', category: 'speciesFeature', tokenId: 'antennae_01' }), false);
  const attachments = filterCompatibleVisualTokens([{ id: 'tail_only', compatibleRigs: ['beast'] }, { id: 'visor', compatibleRigs: ['humanoid'] }], { raceId: 'earthling', rigFamily: 'humanoid', category: 'attachment' });
  assert.deepEqual(attachments.map((a) => a.id), ['visor']);
});

test('version 3 saves migrate visual contracts without replacing legacy appearance', async () => {
  const { deserialise } = await import('../src/engine/save.js');
  const migrated = deserialise({ v: 3, state: {
    world: {}, memory: {}, stats: {}, npcs: {},
    character: { id: 'legacy', raceId: 'earthling', age: 22, appearance: { hairStyle: 'cropped', hairColour: 'brown', face: 'round' }, vitals: {} },
  } });
  assert.equal(migrated.version, 4);
  assert.equal(migrated.character.appearance.hairStyle, 'cropped');
  assert.equal(migrated.character.personalAppearance.hairstyle.family, 'cropped');
  assert.equal(migrated.character.visualIdentity.biological.face.head, 'round_01');
});

test('person-body visual binding keeps body morphology and person behaviour separate', () => {
  const gokuBody = { id: 'body_goku', raceId: 'saiyan', appearance: { face: 'square' } };
  gokuBody.visualIdentity = generateVisualIdentity(gokuBody, new Rng(2));
  const ginyu = { id: 'person_ginyu', fightingStyle: 'weapons', techniques: ['body_change'], appearance: {} };
  const binding = resolveVisualBinding({ person: ginyu, body: gokuBody, familiarity: 0.1 });
  assert.equal(binding.bodyIdentity.raceId, 'saiyan');
  assert.equal(binding.learnedBehavior.derivedFrom.fightingStyle, 'weapons');
  assert.equal(binding.execution, 'unfamiliar');
  assert.equal(binding.learnedBehavior.derivedFrom.techniqueCount, 1);
});

test('semantic expression guidance is adapted without becoming simulation state', async () => {
  const { resolveVisualExpression } = await import('../src/ui/appearance.js');
  assert.deepEqual(resolveVisualExpression({ primary: 'affectionate_flustered', secondary: 'excited', intensity: 75 }), { primary: 'affectionate_flustered', secondary: 'excited', intensity: 75 });
  assert.deepEqual(resolveVisualExpression('furious'), { primary: 'furious', secondary: null, intensity: 50 });
});


import { test } from 'node:test';
import assert from 'node:assert/strict';

import { Rng } from '../src/engine/rng.js';
import {
  ageStageFor, ensureVisualContracts, generateInheritedVisualIdentity,
  generateVisualIdentity, initialVisualBehavior, visualConstraintsFor,
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
  assert.deepEqual(state.attachments, ['scouter']);
});


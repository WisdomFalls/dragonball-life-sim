Warning: truncated output (original token count: 34432)
Total output lines: 3369

// UI controller. Vanilla DOM, one render pass per change - the simulation is
// the interesting part, so the interface stays boring on purpose.

import {
  createGame, defaultCreation, characterSummary, currentYear, livingNpcs,
  startYear, choose, currentEvent, enterAfterlife, epitaph, beginLegacy,
  insertEvent, renarrateLast, skipRemaining, ladderStatus, nearbyForms,
  availableActions, runAction, actionOptions, Rng,
  initSampling, improviseEvent, narrateOutcome, backendName, getApiKey, setApiKey, errorCopy,
  interpretWish,
  eventsRemaining, openingLogEntry, acceptPermanentDeath,
  save, load, listSaves, clearSlot, exportString, importString,
} from '../game.js';
import { CREATABLE_RACES, getRace, sexesFor, UPBRINGINGS, TEMPERAMENTS, BODY_TYPES } from '../data/races.js';
import { PLACES, getPlace } from '../data/places.js';
import { APPEARANCE } from '../engine/state.js';
import { HAIRLESS_RACES } from './appearance.js';
import { portraitSvg, defaultAppearance, HAIR_STYLES, HAIR_COLOURS, EYE_SHAPES, EYE_COLOURS,
  SKIN_TONES, FACE_SHAPES, OUTFITS, STANCES as STANCE_LIST,
  MARK_PRESETS, ACCESSORY_PRESETS, wornAccessories, allMarks,
  npcPortrait, lifeStage } from './portrait.js';
import { eraName, worldPowerBaseline, TIMELINE } from '../data/timeline.js';
import { generateFullName } from '../data/names.js';
import { BRANCHES, TECH_BY_ID, techniquePurity, techniqueDisplayName } from '../data/techniques.js';
import { getTransformation, ladderFor } from '../data/transformations.js';
import { getCanon } from '../data/canon.js';
import { STAT_KEYS, STAT_LABELS, combatPower, powerTier, looksScore } from '../engine/stats.js';
import { strongestBeings } from '../engine/leaderboard.js';
import { relationLabel, bondScore, bondLabel, romanceLabel, dossier, knowledgeLabel } from '../engine/npc.js';
import { npcActions, runNpcAction, canVisitLiving, checkRomanceSpark } from '../engine/social.js';
import { scoreReplyLocally, applyReply, impressionLabel } from '../engine/dialogue.js';
import { judgeReply, getAiConfig, setAiConfig, backendLabel, testAiEndpoint, PRESETS } from '../engine/ai.js';
import { numberish, zeni } from '../engine/text.js';
import { inventoryOf, ensureBag, toggleWorn, sellItem, buyItem, valueHere,
  repairItem, giveItem, knownItems, npcBag, requestItem, itemSlot, findEntry } from '../engine/inventory.js';
import { currencyFor, balance, formatMoney, exchange, CURRENCIES, priceIn } from '../data/currency.js';
import { mostWantedBoard, wantedLevel } from '../engine/bounty.js';
import { newsFeed } from '../engine/news.js';
import { getItem } from '../data/items.js';
import { TRAITS, getTrait, TRAIT_KINDS } from '../data/traits.js';
import { reputationOf, homeOf, homeBonus, shipOf, SHIP_ROOM_BY_ID, SHIP_HULL_BY_ID, SHIP_COMPONENT_BY_ID, renameShip } from '../engine/settlement.js';
import { readPower, describePower, shortPower, canReadPower, hasScouter, hasKiSense } from '../engine/perception.js';
import { getRng, saveRng, findNpc } from '../engine/state.js';
import { ceilingFor, ceilingBlock, ceilingPressure, masteryLabel } from '../engine/mastery.js';
import { injuryList } from '../engine/body.js';
import { worldManifest } from '../engine/worlds.js';
import { factionsPresent } from '../data/factions.js';
import { getPlanet } from '../data/planets.js';
import { getCareer, dutiesFor } from '../data/jobs.js';
import { getKiColor } from '../data/kicolors.js';
import { startSurvival, survivalActions, survivalTurn, survivalStatus, resolveTeamWish, RULES } from '../engine/survival.js';
import { createBattle, battleActions, takeTurn, battleStatus, describeMatchup, battleAftermath, finishLethalWin, lootDefeatedNpc, killKarmaDelta, moralAlignmentOf, STANCES } from '../engine/battle.js';
import { costLabel, limitFor, usedThisYear, yearCapacity } from '../engine/economy.js';
import { ballsHeld, ballManifest, pingSquare, GRID } from '../engine/dragonballs.js';
import { resolveTrial, getMastery } from '../engine/trials.js';
import { deadPowerNow } from '../engine/events/afterlife.js';
import {
  FORMATS, createTournament, roundName, playerMatch, playerOpponent,
  resolveOtherMatches, recordPlayerResult, matchBattleSpec, bracketSummary,
  standings, payout, placementLine, describeField, settle,
} from '../engine/tournament.js';
import { playTrial } from './trialui.js';
import { setAmbienceEnabled, isAmbienceEnabled, setMood } from './ambience.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

let GAME = null;
let DRAFT = null;
let SHEET_MODE = null;
let CURRENT_SLOT = 'auto';
let AI_MODE = 'mixed';        // off | mixed | always
let AI_BUSY = false;
let PENDING_ACTION = null;
let BATTLE = null;
let BATTLE_TAB = 'strike';
let BATTLE_RETURN = null;
let TOURNEY = null;

const ERAS = [
  { year: 720, label: 'Age 720 - long before any of it' },
  { year: 733, label: 'Age 733 - the world is quiet' },
  { year: 737, label: 'Age 737 - the year Planet Vegeta falls' },
  { year: 749, label: 'Age 749 - the Red Ribbon Army rises' },
  { year: 756, label: 'Age 756 - the tournament years' },
  { year: 761, label: 'Age 761 - a Saiyan lands on Earth' },
  { year: 764, label: 'Age 764 - a boy arrives from the future' },
  { year: 767, label: 'Age 767 - the Android crisis' },
  { year: 774, label: 'Age 774 - Majin Buu is released' },
  { year: 778, label: 'Age 778 - the gods wake up' },
  { year: 780, label: 'Age 780 - the Tournament of Power' },
  { year: 790, label: 'Age 790 - the long peace' },
];

// ------------------------------------------------------------------ toast

let toastTimer = null;
function flash(message, ms = 2600) {
  const node = $('toast');
  if (!message) return;
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), ms);
}

// --------------------------------------------------------------- creation

function optionRow(container, items, selectedId, onPick) {
  container.innerHTML = '';
  for (const item of items) {
    const b = el('button', 'opt' + (item.id === selectedId ? ' on' : ''), item.name);
    b.type = 'button';
    b.addEventListener('click', () => onPick(item.id));
    container.appendChild(b);
  }
}

function fillSelect(node, values, selected, labelFn) {
  node.innerHTML = '';
  for (const v of values) {
    const o = document.createElement('option');
    o.value = typeof v === 'object' ? v.value : v;
    o.textContent = labelFn ? labelFn(v) : (typeof v === 'object' ? v.label : v);
    if (o.value === String(selected)) o.selected = true;
    node.appendChild(o);
  }
}


function swatchRow(container, list, selectedId, onPick) {
  const wrap = el('div', 'swatches');
  for (const item of list) {
    const b = el('button', 'swatch' + (item.id === selectedId ? ' on' : ''));
    b.type = 'button';
    b.style.background = item.hex;
    b.title = item.name;
    b.setAttribute('aria-label', item.name);
    b.addEventListener('click', () => onPick(item.id));
    wrap.appendChild(b);
  }
  container.appendChild(wrap);
}

function labelled(container, text) {
  container.appendChild(el('span', 'field-label', text));
}

/**
 * A form's threshold in plain words, independent of any particular life -
 * the same shape as missingRequirements() (progression.js) but without a
 * live character to compare against, since this is a reference table, not
 * a status readout. Kept in the UI layer rather than duplicated into the
 * engine: it only ever formats data that already lives on the form.
 */
function describeReq(req) {
  const parts = [];
  if (req.power) parts.push(`power level ${numberish(req.power)}`);
  if (req.parent) {
    const p = getTransformation(req.parent);
    parts.push(`already holding ${p ? p.name : req.parent}`);
  }
  for (const [k, v] of Object.entries(req.stat || {})) parts.push(`${STAT_LABELS[k] || k} ${v}+`);
  for (const f of req.flags || []) parts.push(f.replace(/_/g, ' '));
  if (req.anyFlag) parts.push(`a moment that would trigger it (${req.anyFlag.map((f) => f.replace(/_/g, ' ')).join(', ')})`);
  for (const t of req.traits || []) parts.push(t === 'tail' ? 'a tail' : t.replace(/_/g, ' '));
  for (const m of req.mentors || []) parts.push(`training under ${m.replace(/_/g, ' ')}`);
  for (const t of req.techniques || []) parts.push(t.replace(/_/g, ' '));
  if (req.age) parts.push(`age ${req.age}+`);
  if (req.custom) parts.push(req.custom.replace(/_/g, ' '));
  return parts.length ? parts.join(', ') : 'a starting form - nothing to reach for';
}

/** Every species' transformation ladder, thresholds and all - a canonical
 * table, not a status readout on any one life, so it lives off the title
 * screen and needs no character loaded to open. */
function openFormReference() {
  const { body } = sheetShell('Transformation Ladders', 'Every species, every threshold known');
  for (const race of CREATABLE_RACES) {
    const ladder = ladderFor(race.id);
    if (!ladder.length) continue;
    body.appendChild(el('div', 'group-label', race.name));
    for (const form of ladder) {
      const row = el('div', 'row');
      const main = el('div', 'row-main');
      main.appendChild(el('div', 'row-title', form.name));
      main.appendChild(el('div', 'row-note', describeReq(form.req || {})));
      row.appendChild(main);
      row.appendChild(el('div', 'row-value', 'x' + numberish(form.mult)));
      body.appendChild(row);
    }
  }
  const back = el('button', 'ghost-btn', 'Back');
  back.type = 'button';
  back.addEventListener('click', closeSheet);
  body.appendChild(back);
  openSheet('panel');
}

/**
 * The one place mortality actually gets said out loud. Natural aging and
 * old-age death (agingDecay/naturalDeathChance in stats.js) were always
 * race-differentiated under the hood - a human ages at full rate over
 * 72-96 years, an android at a twelfth of that over centuries - but
 * nothing in the UI ever told the player so, at creation or in play. The
 * mechanic existing invisibly reads the same as it not existing at all.
 */
function lifespanLine(race) {
  const [lo, hi] = race.lifespan;
  const span = `${numberish(lo)}-${numberish(hi)} years`;
  if (race.agingRate <= 0.15) {
    return `Ages so slowly it barely shows. A natural lifespan of ${span} - long enough that almost nothing dies of old age first.`;
  }
  if (race.agingRate <= 0.4) {
    return `Ages slowly. A natural lifespan of ${span}, most of it spent looking much as it started.`;
  }
  return `Ages at roughly the pace it looks like. A natural lifespan of ${span}.`;
}

function renderCreation() {
  const race = getRace(DRAFT.raceId);

  optionRow($('opt-race'), CREATABLE_RACES.map((r) => ({ id: r.id, name: r.short })), DRAFT.raceId, (id) => {
    DRAFT.raceId = id;
    if (!DRAFT.nameTouched) DRAFT.name = generateFullName(new Rng(Date.now()), id);
    renderCreation();
  });

  const card = $('race-card');
  card.innerHTML = '';
  card.appendChild(el('div', 'race-name', race.name));
  card.appendChild(el('div', 'race-blurb', race.blurb));
  card.appendChild(el('div', 'race-note', race.notes));
  card.appendChild(el('div', 'race-note', lifespanLine(race)));

  $('in-name').value = DRAFT.name;

  const era = $('in-era');
  if (!era.options.length) {
    fillSelect(era, ERAS.map((e2) => ({ value: String(e2.year), label: e2.label })), String(DRAFT.birthYear));
    era.addEventListener('change', () => { DRAFT.birthYear = Number(era.value); renderCreation(); });
  }
  era.value = String(DRAFT.birthYear);
  $('era-note').textContent =
    `${eraName(DRAFT.birthYear)}. A serious fighter of this era is around ${numberish(worldPowerBaseline(DRAFT.birthYear))}.`
    + originHint(DRAFT.raceId, DRAFT.birthYear);

  const allowedSexes = sexesFor(DRAFT.raceId);
  if (!allowedSexes.includes(DRAFT.sex)) DRAFT.sex = allowedSexes[0];
  const sexes = $('opt-sex');
  sexes.innerHTML = '';
  const SEX_LABEL = { female: 'Female', male: 'Male' };
  for (const sx of allowedSexes) {
    const b = el('button', 'opt' + (DRAFT.sex === sx ? ' on' : ''), SEX_LABEL[sx]);
    b.type = 'button';
    b.addEventListener('click', () => { DRAFT.sex = sx; renderCreation(); });
    sexes.appendChild(b);
  }

  const seed = $('in-seed');
  if (seed) seed.value = DRAFT.seed || '';
}

/** A hint about what being this species in this century usually means. */
function originHint(raceId, year) {
  if (raceId === 'saiyan' && year < 737) return ' Planet Vegeta still stands, and it will not stand for long - or, in a universe next door, Sadala never fell at all. Which one is not yours to pick.';
  if (raceId === 'saiyan' && year === 737) return ' You are born in the year Planet Vegeta falls. You will be very small when it happens - unless it is Sadala under you instead, in the universe where nothing like that ever came.';
  if (raceId === 'saiyan') return ' Your people are ash, and you were not on the planet - or your people never burned at all. Two different universes call themselves Saiyan.';
  if (raceId === 'namekian' && year < 763) return ' Namek is still there.';
  if (raceId === 'cerealian') return ' The Saiyans came to Cereal. Most of you did not survive it.';
  if (raceId === 'android' || raceId === 'bioandroid') return ' Somebody built you, and they had reasons.';
  if (raceId === 'frostdemon') return ' You are born at a power most people die chasing.';
  return '';
}

function readCreationInputs() {
  DRAFT.name = $('in-name').value.trim() || DRAFT.name;
}

function newDraft() {
  const rng = new Rng(Date.now() ^ Math.floor(Math.random() * 1e9));
  const d = defaultCreation(rng);
  d.birthYear = 737;
  d.nameTouched = false;
  d.seed = '';
  // Nothing about the body is chosen any more; createGame rolls it from the
  // species and the century.
  delete d.look;
  delete d.upbringingId;
  delete d.bodyId;
  delete d.temperamentId;
  delete d.placeId;
  return d;
}

// -------------------------------------------------------------------- HUD


/**
 * The next canon beat still ahead of this life, whatever world it lands
 * on. finishYear() (lifecycle.js) fires these the instant the year comes
 * up regardless of where the player happens to be standing - nothing ever
 * told them one was coming, so there was no way to travel for it on
 * purpose instead of just reading about it having happened somewhere else.
 */
function nextTimelineEvent(state) {
  const year = currentYear(state);
  const upcoming = TIMELINE.filter((t) => t.year >= year
    && !state.world.resolved.includes(t.id)
    && !(t.cancelIf && state.world.flags[t.cancelIf]));
  upcoming.sort((a, b) => a.year - b.year);
  return upcoming[0] || null;
}

function renderHud() {
  const s = characterSummary(GAME);
  const c = GAME.character;
  const portraitBox = $('hud-portrait');
  if (portraitBox) {
    const form = c.activeForm || (c.transformations.length ? { name: '' } : null);
    // The aura, form-tinted hair and eyes only belong to a form you are
    // actually holding right now - the everyday portrait is not a record of
    // your strongest transformation ever reached.
    portraitBox.innerHTML = portraitSvg(c, { variant: 'sprite' });
  }
  $('hud-name').textContent = c.name;
  $('hud-sub').textContent = `${c.sex === 'female' ? 'Female' : 'Male'} ${s.race} - ${s.place} - Age ${s.year}`
    + `${c.inAfterlife ? ' - OTHER WORLD' : ''}`;
  $('hud-age').innerHTML = `${c.age}<small>${c.inAfterlife ? 'dead' : 'years'}</small>`;
  $('hud-power').textContent = numberish(s.combat);
  $('hud-tier').textContent = s.tier;

  const setBar = (key, value, max) => {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    $('f-' + key).style.width = pct + '%';
    $('v-' + key).textContent = Math.round(value);
  };
  // Health has a ceiling that moves, so the number says what it is out of.
  const hMax = Math.max(1, c.vitals.healthMax || 100);
  setBar('health', c.vitals.health, hMax);
  $('v-health').textContent = hMax > 100
    ? `${Math.round(c.vitals.health)}/${Math.round(hMax)}`
    : Math.round(c.vitals.health);
  setBar('happy', c.vitals.happiness, 100);
  setBar('ki', c.vitals.ki, Math.max(1, c.vitals.kiMax));

  const pills = $('hud-pills');
  pills.innerHTML = '';
  const add = (label, value, cls) => {
    const p = el('span', 'pill' + (cls ? ' ' + cls : ''));
    p.innerHTML = `${label} <b>${value}</b>`;
    pills.appendChild(p);
  };
  const cap = yearCapacity(GAME);
  if (cap < 0.75) add('Actions this year', cap < 0.5 ? 'Few' : 'Limited', 'gold');
  // The money in your hand is the money of the world you are standing on.
  const localCur = currencyFor(getPlace(c.placeId).planet);
  add(localCur.short, Math.round(balance(c, localCur.id)).toLocaleString('en-US'));
  const rep = reputationOf(GAME);
  add('Known to', rep.reach > 999 ? numberish(rep.reach) : Math.round(rep.reach));
  add('Karma', Math.round(c.karma), c.karma > 20 ? 'good' : c.karma < -20 ? 'bad' : '');
  if (c.career) add('Job', c.career.title);
  if (c.senzu) add('Senzu', c.senzu, 'good');
  const balls = ballsHeld(GAME);
  if (balls) add('Dragon Balls', balls + '/7', 'gold');
  if (c.transformations.length) add('Forms', c.transformations.length, 'gold');
  if (GAME.legacy) add('Generation', GAME.legacy.generation);
  if (!c.inAfterlife) {
    const next = nextTimelineEvent(GAME);
    if (next) {
      const yearsAway = next.year - s.year;
      const herePlanet = getPlace(c.placeId).planet;
      const planetName = getPlanet(next.planet) ? getPlanet(next.planet).name : next.planet;
      const label = herePlanet === next.planet ? next.name : `${next.name} → ${planetName}`;
      add(label, yearsAway <= 0 ? 'Now' : `${yearsAway}y`, 'gold');
    }
  }

  // Coming back from the dead has to change the button under your thumb.
  const ageBtn = $('btn-age');
  if (ageBtn) {
    ageBtn.textContent = c.inAfterlife ? 'Another year dead' : 'Age up';
    ageBtn.classList.toggle('dead', !!c.inAfterlife);
  }
}

// ------------------------------------------------------------------- feed

function changeChips(entry) {
  return null;
}

function renderFeed() {
  const feed = $('feed');
  // #app only sets min-height, so when content overflows it is the whole
  // page that scrolls, not .feed internally (.feed's own overflow-y:auto
  // never actually engages). Clearing innerHTML collapses the page's height
  // for an instant; the browser clamps window scroll to fit the now-tiny
  // document, and that clamp never gets undone once the content grows back
  // - which is what reads as "Age Up throws me to the top of my life" if you
  // were scrolled down through old entries. Preserve both the feed's own
  // scroll (in case a layout does make it the real scroller) and the page's.
  const scroller = document.scrollingElement || document.documentElement;
  const feedNearBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight < 80;
  const pageNearBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 80;
  const priorFeedScrollTop = feed.scrollTop;
  const priorPageScrollTop = scroller.scrollTop;
  feed.innerHTML = '';
  if (!GAME.log.length) {
    feed.appendChild(el('div', 'feed-empty', 'Press Age Up to start living.'));
    return;
  }
  for (const year of GAME.log.slice(-24)) {
    if (!year.entries.length) continue;
    const block = el('div', 'year-block');
    const head = el('div', 'year-head');
    head.innerHTML = `<b>Age ${year.a…24432 tokens truncated…ions(GAME, BATTLE);
  for (const tab of BATTLE_TABS) {
    const count = actions.filter((a) => tab.kinds.includes(a.kind)).length;
    if (!count) continue;
    const b = el('button', 'btab' + (BATTLE_TAB === tab.id ? ' active' : ''), tab.label);
    b.type = 'button';
    b.addEventListener('click', () => { BATTLE_TAB = tab.id; renderBattle(); });
    tabs.appendChild(b);
  }

  const wrap = $('battle-actions');
  wrap.innerHTML = '';
  const tab = BATTLE_TABS.find((t) => t.id === BATTLE_TAB) || BATTLE_TABS[0];
  const shown = actions.filter((a) => tab.kinds.includes(a.kind));
  for (const action of shown) {
    const b = el('button', 'bact'
      + (action.kind === 'form' ? ' form-btn' : '')
      + (action.kind === 'move' ? ' escape wide' : ''));
    b.type = 'button';
    b.disabled = !!action.disabled;
    b.appendChild(el('span', 'bact-label', action.label));
    if (action.hint || action.reason) b.appendChild(el('span', 'bact-hint', action.reason || action.hint));
    b.addEventListener('click', () => battleTurn(action.id));
    wrap.appendChild(b);
  }
}

function battleTurn(actionId) {
  const rng = getRng(GAME);
  pushBattleLines(['Round ' + BATTLE.round], 'turn');
  const res = takeTurn(GAME, BATTLE, rng, actionId);
  saveRng(GAME, rng);
  pushBattleLines(res.lines);
  renderBattle();
  if (res.over) endBattle();
}

function endBattle() {
  const rng = getRng(GAME);
  // A lethal win is a decision (spare or finish them) before it is a fact -
  // defer the actual killing to whichever choice the player makes below,
  // rather than aftermath quietly deciding it before they get to choose.
  const deferKillDecision = BATTLE.outcome === 'won' && BATTLE.stakes !== 'spar' && !BATTLE.noKilling && !BATTLE.foeFled;
  const after = battleAftermath(GAME, rng, BATTLE, { deferKillDecision });
  saveRng(GAME, rng);
  if (after.lines.length) pushBattleLines(after.lines, 'big');

  const wrap = $('battle-actions');
  wrap.innerHTML = '';
  $('battle-tabs').innerHTML = '';

  const outcomeLine = BATTLE.byRingOut
    ? (BATTLE.outcome === 'won' ? 'Ring-out. You win.' : 'Ring-out. You lose.')
    : BATTLE.foeFled ? `${BATTLE.them.name} got away.`
    : {
    won: 'You win.', lost: 'You lose.', fled: 'You got out.',
    yielded: 'You yielded and they let it stand.', draw: 'Neither of you could finish it.',
  }[BATTLE.outcome] || 'It is over.';

  const done = el('button', 'bact wide');
  done.type = 'button';
  done.appendChild(el('span', 'bact-label', outcomeLine));
  done.appendChild(el('span', 'bact-hint', 'Back to your life'));
  done.addEventListener('click', () => closeBattle(after));
  wrap.appendChild(done);

  // Under tournament rules there is nothing to decide: an official is already
  // standing between you, and killing somebody ends your tournament.
  if (BATTLE.outcome === 'won' && BATTLE.noKilling) {
    pushBattleLines(['The officials are between you before you have finished the thought.'], 'big');
  }

  // Beating somebody is a decision point, not just a result - but only when
  // there is somebody left in front of you to decide about. A foe who got
  // clean away leaves nothing to spare or finish.
  if (BATTLE.outcome === 'won' && BATTLE.stakes !== 'spar' && !BATTLE.noKilling && !BATTLE.foeFled) {
    // Sparing something genuinely evil is a bigger act of mercy than
    // sparing a nobody; killing something with a real claim to being good
    // costs a lot more than killing a nobody does. Same alignment reading
    // both buttons pull from, opposite in sign.
    const alignment = moralAlignmentOf(GAME, BATTLE);

    const spare = el('button', 'bact');
    spare.type = 'button';
    spare.appendChild(el('span', 'bact-label', 'Let them live'));
    spare.addEventListener('click', () => {
      const spareGain = Math.max(3, Math.min(20, Math.round(8 + alignment * -0.15)));
      GAME.character.karma = Math.min(100, GAME.character.karma + spareGain);
      const lines = ['You leave them breathing. They will remember that, one way or the other.'];
      // Allowing a real fight to end without a death is exactly the moment
      // a spark either does or does not happen - the same check a spar
      // rolls, on somebody who was trying to kill you a minute ago instead
      // of somebody who agreed to trade blows for the afternoon.
      const foeNpcId = (BATTLE.them.ref && BATTLE.them.ref.npcId) || (BATTLE.foeRef && BATTLE.foeRef.npcId) || null;
      const foeNpc = foeNpcId && findNpc(GAME, foeNpcId);
      if (foeNpc) {
        const rng = getRng(GAME);
        const spark = checkRomanceSpark(GAME, rng, foeNpc);
        saveRng(GAME, rng);
        if (spark) lines.push(spark.text);
      }
      pushBattleLines(lines, 'big');
      spare.remove();
      const kill = document.querySelector('.bact.kill');
      if (kill) kill.remove();
    });
    wrap.appendChild(spare);

    const kill = el('button', 'bact kill danger');
    kill.type = 'button';
    kill.appendChild(el('span', 'bact-label', 'Finish them'));
    kill.addEventListener('click', () => {
      const rng = getRng(GAME);
      const karmaDelta = killKarmaDelta(GAME, BATTLE);
      const lines = [
        karmaDelta > 0
          ? 'You finish it. Whatever else that was, it was not a crime.'
          : 'You finish it. Nobody argues with the result.',
        ...finishLethalWin(GAME, rng, BATTLE),
      ];
      saveRng(GAME, rng);
      BATTLE.killed = true;
      GAME.character.karma = Math.max(-100, Math.min(100, GAME.character.karma + karmaDelta));
      pushBattleLines(lines, 'big');
      kill.remove();
      const s2 = document.querySelector('.bact:not(.wide):not(.kill)');
      if (s2) s2.remove();
      renderLootChoice();
    });
    wrap.appendChild(kill);
  }

  // Going through the body is its own decision, offered only once there is
  // actually something to go through and only after the kill is settled -
  // never bundled into "Finish them" itself.
  function renderLootChoice() {
    if (!BATTLE.lootable || !BATTLE.lootable.length) return;
    const loot = el('button', 'bact');
    loot.type = 'button';
    loot.appendChild(el('span', 'bact-label', 'Loot the body'));
    loot.appendChild(el('span', 'bact-hint', 'Take what they were carrying. Not everyone lets that go unnoticed.'));
    const leave = el('button', 'bact');
    leave.type = 'button';
    leave.appendChild(el('span', 'bact-label', 'Leave everything'));
    loot.addEventListener('click', () => {
      const rng = getRng(GAME);
      const lines = BATTLE.lootable.map((npcId) => lootDefeatedNpc(GAME, rng, npcId).text);
      saveRng(GAME, rng);
      BATTLE.lootable = [];
      pushBattleLines(lines, 'big');
      loot.remove();
      leave.remove();
    });
    leave.addEventListener('click', () => {
      pushBattleLines(['You leave it where it fell.'], 'big');
      loot.remove();
      leave.remove();
    });
    wrap.appendChild(loot);
    wrap.appendChild(leave);
  }
}

function closeBattle(after) {
  const summary = BATTLE.foeFled ? `${BATTLE.them.name} broke off and got away from you.` : {
    won: `You beat ${BATTLE.them.name}.`,
    lost: `${BATTLE.them.name} beat you.`,
    fled: `You broke off from ${BATTLE.them.name}.`,
    yielded: `You yielded to ${BATTLE.them.name}.`,
    draw: `You and ${BATTLE.them.name} could not finish it.`,
  }[BATTLE.outcome] || '';

  logLine({ kind: 'event', title: `Fight: ${BATTLE.them.name}`, text: summary, outcome: after.text || '' });

  const death = after.death;
  const battle = BATTLE;
  const handOff = BATTLE_RETURN;
  BATTLE = null;
  BATTLE_RETURN = null;
  renderHud();
  renderFeed();
  autosave();

  if (death) {
    GAME.character.alive = false;
    GAME.character.death = { cause: death, year: currentYear(GAME), age: GAME.character.age };
    showDeath();
    return;
  }
  if (GAME.character.vitals.health <= 0 && GAME.character.alive) {
    // A fight can leave you at zero; the year change decides whether that kills you.
    flash('You are barely alive. Age up and find out if you make it.');
  }
  // A fight can belong to something larger - a tournament round, say - which
  // wants control back rather than dropping you into the year.
  if (handOff) { handOff(battle, after); return; }
  showPlay();
  const next = currentEvent(GAME);
  if (next) showEvent(next);
}

/** Append an entry to the current year in the feed. */
function logLine(entry) {
  if (!GAME.log.length || GAME.log[GAME.log.length - 1].age !== GAME.character.age) {
    GAME.log.push({ year: currentYear(GAME), age: GAME.character.age, entries: [] });
  }
  GAME.log[GAME.log.length - 1].entries.push(entry);
}

// ------------------------------------------------------------------ death

function showDeath() {
  const info = epitaph(GAME);
  const node = $('epitaph');
  node.innerHTML = '';

  node.appendChild(el('div', 'epitaph-kicker', GAME.character.inAfterlife ? 'Gone for good' : 'Died'));
  node.appendChild(el('h2', 'epitaph-name', info.name));
  node.appendChild(el('div', 'epitaph-dates',
    `${info.race} - age ${info.age} - Age ${info.year} - ${info.cause}`));
  node.appendChild(el('div', 'epitaph-title', info.title));
  node.appendChild(el('div', 'score', info.score.toLocaleString('en-US')));

  const grid = el('div', 'epitaph-grid');
  const cells = [
    ['Power', numberish(info.power)], ['Fame', info.fame], ['Karma', info.karma],
    ['Techniques', info.techniques], ['Forms', info.forms], ['Children', info.children],
  ];
  for (const [label, value] of cells) {
    const box = el('div', 'stat');
    box.appendChild(el('div', 'stat-name', label));
    box.appendChild(el('div', 'stat-val', String(value)));
    grid.appendChild(box);
  }
  node.appendChild(grid);

  node.appendChild(el('div', 'group-label', 'What they are remembered for'));
  for (const line of info.highlights) node.appendChild(el('div', 'memo', line));

  if (!GAME.character.inAfterlife) {
    const b = el('button', 'primary-btn', 'Go to the Other World');
    b.type = 'button';
    b.addEventListener('click', () => {
      enterAfterlife(GAME);
      autosave();
      showPlay();
      flash('Death is a place here. Keep training.');
    });
    node.appendChild(b);
    node.appendChild(el('p', 'hint-text',
      'Dying is not the end in this setting. You can train under King Kai, fight in the Other World tournament, and be wished back if anyone down there cares enough.'));
  }

  if (!GAME.character.flags.permadeath) {
    const end = el('button', 'ghost-btn', 'Accept it. This is the end.');
    end.type = 'button';
    end.addEventListener('click', () => {
      acceptPermanentDeath(GAME);
      autosave();
      showDeath();
      flash('No wish is ever spent on this life again. It is finished, on your terms.');
    });
    node.appendChild(end);
    node.appendChild(el('p', 'hint-text',
      'This closes the door on this specific life for good - no revival, no Other World hero run. '
      + 'A living child can still be played as afterward; that is a separate choice from this one.'));
  } else {
    node.appendChild(el('p', 'hint-text',
      `${info.name}'s death was accepted as final. ${info.title}. It shaped everyone still close to them.`));
  }

  const kids = Object.values(GAME.npcs).filter((n) => n.relation === 'child' && n.alive);
  if (kids.length) {
    const b = el('button', 'ghost-btn', `Continue as ${kids[0].name}`);
    b.type = 'button';
    b.addEventListener('click', () => {
      beginLegacy(GAME);
      autosave();
      showPlay();
      flash('A new generation. The world remembers the last one.');
    });
    node.appendChild(b);
  }

  const again = el('button', 'ghost-btn', 'Start a new life');
  again.type = 'button';
  again.addEventListener('click', () => {
    clearSlot(CURRENT_SLOT);
    GAME = null;
    renderTitle();
    showScreen('title');
  });
  node.appendChild(again);

  showScreen('death');
}

// ----------------------------------------------------------------- screens

const SCREEN_MOOD = {
  title: 'calm', create: 'calm', play: 'calm',
  battle: 'battle', survival: 'battle', tourney: 'battle',
  trial: 'tense', hunt: 'tense',
  death: 'tense',
};

function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  $('screen-' + name).classList.add('active');
  setMood(SCREEN_MOOD[name] || 'calm');
}

function showPlay() {
  renderHud();
  renderFeed();
  showScreen('play');
}

function autosave() {
  save(GAME, CURRENT_SLOT);
}

// -------------------------------------------------------------------- boot

function startGame() {
  readCreationInputs();
  const seed = (DRAFT.seed || '').trim();
  GAME = createGame({
    name: DRAFT.name,
    raceId: DRAFT.raceId,
    sex: DRAFT.sex,
    upbringingId: DRAFT.upbringingId,
    temperamentId: DRAFT.temperamentId,
    bodyId: DRAFT.bodyId,
    birthYear: DRAFT.birthYear,
    placeId: DRAFT.placeId,
    look: DRAFT.look,
  }, seed || undefined);
  const rng = getRng(GAME);
  GAME.log.push(openingLogEntry(GAME, rng));
  saveRng(GAME, rng);
  autosave();
  showPlay();
  flash(`${GAME.character.name} is born on ${getPlace(GAME.character.placeId).name}.`);
}

function wire() {
  $('btn-begin').addEventListener('click', startGame);
  $('btn-back-title').addEventListener('click', () => {
    renderTitle();
    showScreen('title');
  });
  $('btn-reroll-name').addEventListener('click', () => {
    DRAFT.name = generateFullName(new Rng(Date.now() ^ Math.floor(Math.random() * 1e9)), DRAFT.raceId);
    DRAFT.nameTouched = false;
    $('in-name').value = DRAFT.name;
  });
  $('in-name').addEventListener('input', () => {
    DRAFT.nameTouched = true;
    DRAFT.name = $('in-name').value;
  });
  $('in-seed').addEventListener('input', () => { DRAFT.seed = $('in-seed').value; });

  $('btn-age').addEventListener('click', ageUp);
  $('scrim').addEventListener('click', () => { if (SHEET_MODE !== 'event') closeSheet(); });

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!GAME) return;
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const panel = btn.dataset.panel;
      if (panel === 'activities') panelActivities();
      else if (panel === 'people') panelPeople();
      else if (panel === 'power') panelPower();
      else panelRecords();
    });
  });

  document.addEventListener('keydown', (e2) => {
    if (e2.key === 'Escape' && SHEET_MODE && SHEET_MODE !== 'event') closeSheet();
  });
}

const TITLE_FEATURES = [
  'A full simulated life across the Dragon Ball timeline, year by year, or an era you pick yourself',
  'Twelve playable species plus three half-breeds, each with its own stats, ladder and look',
  'Procedural portraits: hairstyles, gear, scars and grooming that actually show up on your character',
  'Turn-based battles, brackets, and an 80-fighter, 8-universe Tournament of Power',
  'Marriage, gifts that land or miss depending on who you give them to, rivalries, and children',
  'Weapons and martial arts, chosen at creation and switchable later, side by side with ki techniques',
  'Death is not the end: train in the Other World, visit Hell, or come back for one more year',
  'A living economy - shop stock rotates by planet, and selling enough starts a trade relationship',
];

const SLOT_LABEL = { auto: 'Slot 1', a: 'Slot 2', b: 'Slot 3', c: 'Slot 4' };

function renderTitle() {
  const list = $('title-features');
  if (list) {
    list.innerHTML = '';
    for (const f of TITLE_FEATURES) list.appendChild(el('li', null, f));
  }

  const savesBox = $('title-saves');
  if (savesBox) {
    savesBox.innerHTML = '';
    for (const s of listSaves()) {
      const row = el('div', 'row');
      const main = el('div', 'row-main');
      if (s.empty) {
        main.appendChild(el('div', 'row-title', SLOT_LABEL[s.slot] || s.slot));
        main.appendChild(el('div', 'row-note', s.corrupt ? 'Unreadable save. Starting fresh here replaces it.' : 'Empty.'));
      } else {
        const race = getRace(s.raceId);
        const when = s.savedAt ? new Date(s.savedAt).toLocaleDateString() : '';
        main.appendChild(el('div', 'row-title', `${SLOT_LABEL[s.slot] || s.slot}: ${s.name}, age ${s.age}`));
        main.appendChild(el('div', 'row-note',
          `${race ? race.short : s.raceId} - ${numberish(s.power)} power - `
          + `${s.afterlife ? 'in the Other World' : s.alive ? 'alive' : 'deceased'}${when ? ` - saved ${when}` : ''}`
          + `${s.generation > 1 ? ` - generation ${s.generation}` : ''}`));
      }
      row.appendChild(main);

      const acts = el('div', 'item-acts');
      if (!s.empty) {
        const cont = el('button', 'mini', 'Continue');
        cont.type = 'button';
        cont.addEventListener('click', () => {
          const loaded = load(s.slot);
          if (!loaded || !loaded.character) { flash('Could not load that save.'); return; }
          CURRENT_SLOT = s.slot;
          GAME = loaded;
          showPlay();
        });
        acts.appendChild(cont);

        const del = el('button', 'mini', 'Delete');
        del.type = 'button';
        del.addEventListener('click', () => {
          if (!confirm(`Delete ${s.corrupt ? 'this save' : s.name + "'s save"}?`)) return;
          clearSlot(s.slot);
          renderTitle();
        });
        acts.appendChild(del);
      } else {
        const start = el('button', 'mini', 'New life');
        start.type = 'button';
        start.addEventListener('click', () => {
          CURRENT_SLOT = s.slot;
          DRAFT = newDraft();
          renderCreation();
          showScreen('create');
        });
        acts.appendChild(start);
      }
      row.appendChild(acts);
      savesBox.appendChild(row);
    }
  }

  const formRefBtn = $('btn-form-reference');
  if (formRefBtn && !formRefBtn.dataset.wired) {
    formRefBtn.dataset.wired = '1';
    formRefBtn.addEventListener('click', openFormReference);
  }

  const ambienceRow = $('opt-ambience');
  if (ambienceRow) {
    ambienceRow.innerHTML = '';
    for (const [on, label] of [[false, 'Off'], [true, 'On']]) {
      const b = el('button', 'opt' + (isAmbienceEnabled() === on ? ' on' : ''), label);
      b.type = 'button';
      b.addEventListener('click', () => {
        setAmbienceEnabled(on);
        try { localStorage.setItem('dbls.ambience', on ? '1' : '0'); } catch (e) { /* best effort */ }
        renderTitle();
      });
      ambienceRow.appendChild(b);
    }
  }
  const ambienceNote = $('ambience-note');
  if (ambienceNote) {
    ambienceNote.textContent = 'Three generated tones that shift with the moment - calm, tense, or mid-fight. '
      + 'Not a soundtrack, just a mood, and silent until you turn it on.';
  }
}

async function boot() {
  DRAFT = newDraft();
  renderCreation();
  wire();

  try {
    if (localStorage.getItem('dbls.ambience') === '1') setAmbienceEnabled(true);
  } catch (e) { /* best effort */ }

  renderTitle();
  showScreen('title');

  await initSampling();
  const note = $('create-ai-note');
  note.textContent = backendName() === 'sample'
    ? 'Claude is connected here. Events written live by the model appear alongside the generated ones.'
    : 'Runs entirely on its own generator. Add an Anthropic API key under Life to have Claude write events too.';
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();


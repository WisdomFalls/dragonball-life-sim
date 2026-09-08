// Deterministic bridge between saved appearance data and future raster sprite
// layers. This module contains no image decoding or simulation writes: it
// describes exactly which approved art files a renderer may request.

import { HAIRLESS_RACES, resolveAppearance } from './appearance.js';

export const PORTRAIT_ASSET_VERSION = 'pixel-v1';

// Every approved image is embedded into the single-file game as a data URI.
// Do not register concepts here: an entry means reviewed, transparent,
// production-ready art. The initial empty set keeps the legacy SVG live.
export const PORTRAIT_ASSET_MANIFEST = Object.freeze({});

function layer(slot, key, options = {}) {
  return { slot, key, required: options.required !== false, tint: options.tint || null };
}

function anatomyKey(resolved) {
  const { family, scale, pose } = resolved.rig;
  return `body/${family}/${scale}/${pose}`;
}

/**
 * Produce the same layer order for a compact sprite and a character-sheet
 * portrait. `variant` changes only the intended crop, never a character's
 * identity; a scouter therefore cannot vanish between screens.
 */
export function portraitAssetPlan(character = {}, opts = {}) {
  const manifest = opts.manifest || PORTRAIT_ASSET_MANIFEST;
  const resolved = resolveAppearance(character, opts);
  const a = resolved.appearance;
  const variant = opts.variant === 'sprite' ? 'sprite' : 'sheet';
  const layers = [
    layer('body', anatomyKey(resolved)),
    layer('face', `face/${resolved.rig.family}/${a.face}/${a.eyeShape}`, { tint: a.skin }),
    layer('eyes', `eyes/${a.eyeShape}/${a.eyeColour}`),
  ];

  if (!HAIRLESS_RACES.has(character.raceId)) {
    layers.push(layer('hair', `hair/${a.hairStyle}/${a.hairColour}`, { required: false }));
  }
  if (character.tail) layers.push(layer('anatomy', `tail/${resolved.rig.family}`, { required: false }));

  layers.push(
    layer('outfit-body', `outfit/${a.outfit}/body`),
    layer('outfit-legs', `outfit/${a.outfit}/legs`),
    layer('outfit-feet', `outfit/${a.outfit}/feet`),
  );

  for (const mark of resolved.marks) layers.push(layer('mark', `mark/${mark}`, { required: false }));
  for (const accessory of resolved.accessories) layers.push(layer('accessory', `accessory/${accessory}`, { required: false }));
  if (resolved.form) layers.push(layer('form', `form/${resolved.form.id}`, { required: false }));
  if (resolved.form) layers.push(layer('effect', `aura/${resolved.form.id}`, { required: false }));

  const missing = layers.filter((entry) => entry.required && !manifest[entry.key]);
  return {
    version: PORTRAIT_ASSET_VERSION,
    variant,
    rig: resolved.rig,
    layers,
    // A renderer must use all required approved files before it claims the
    // asset path. Until then it uses the existing parametric SVG faithfully.
    renderer: missing.length ? 'parametric-fallback' : 'asset',
    missing: missing.map((entry) => entry.key),
  };
}

/** Return the keys an art pack must provide before it may be activated. */
export function requiredAssetKeys(character = {}, opts = {}) {
  return portraitAssetPlan(character, opts).layers
    .filter((entry) => entry.required)
    .map((entry) => entry.key);
}

/** Compose already-approved same-canvas layers into an SVG portrait. */
export function renderAssetPortrait(plan, manifest = PORTRAIT_ASSET_MANIFEST) {
  if (plan.renderer !== 'asset') return null;
  const canvas = plan.variant === 'sprite' ? '0 0 96 128' : '0 0 220 300';
  const layers = plan.layers
    .map((entry) => ({ ...entry, asset: manifest[entry.key] }))
    .filter((entry) => entry.asset)
    .map((entry) => `<image data-slot="${entry.slot}" href="${entry.asset.src}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"/>`)
    .join('');
  return `<svg viewBox="${canvas}" width="100%" height="100%" role="img" aria-label="Character portrait" data-rig="${plan.rig.id}" data-renderer="asset" data-asset-variant="${plan.variant}" xmlns="http://www.w3.org/2000/svg">${layers}</svg>`;
}


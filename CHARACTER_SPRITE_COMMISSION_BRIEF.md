# Dragon Ball: Mortal Coil — Character Sprite Commission Brief

## Objective

Create premium, original, modular pixel-art character assets for a Dragon Ball-inspired life-simulation game. The game needs expressive, sharp anime martial-arts anatomy and strong cel-shaded forms within visible, polished pixels. It must feel at home beside classic Dragon Ball visual language while never reproducing a canon character, costume, hairstyle, face, insignia, or sprite.

## First commission: original horned humanoid alien family

This is a proof family and the visual benchmark for all later packs.

Character direction:

- turquoise skin; narrow angular face; amber eyes; subtle magenta cheek markings;
- pointed ears; two short ivory horns; a broad, swept forehead crest rather than human hair;
- dark navy sleeveless battle vest; pale-gray asymmetric wrap tunic; deep magenta sash; charcoal trousers; off-white boots;
- lean, powerful martial-artist physique; calm, guarded expression;
- distinctive design, not a canon or lookalike character.

## Visual target

- polished 16/32-bit pixel art, not chibi and not deliberately low-detail retro art;
- thick dark contours, readable silhouette, precise pixels, and three to four cel-shaded tones per material;
- angular eyes, graphic facial planes, muscular but stylized anatomy, and dramatic clothing folds;
- near-full-body, three-quarter profile frame from crest to boots;
- no AI-generated checkerboard, glow, shadow, watermark, UI, text, or baked background.

## Required deliverables

### Compact gameplay sprite

- 96 x 128 pixels, RGBA PNG, transparent background;
- neutral combat-ready three-quarter stance;
- optional second frame: guard/impact reaction;
- crisp nearest-neighbour pixels, no anti-aliased background edge.

### Character-sheet portrait

- 220 x 300 pixels, RGBA PNG, transparent background;
- same person, pose family, clothing and proportions as the compact sprite;
- full body visible with a small safe margin around crest/horns and boots.

### Layer source files

Provide an editable layered source file (Aseprite preferred; PSD acceptable) plus individual transparent RGBA PNG exports. Every layer uses the same canvas and anchor point.

1. body and species anatomy;
2. face and eyes;
3. horns, ears, crest and tail if applicable;
4. vest; wrap tunic; sash; trousers; boots;
5. optional scouter/accessory anchor;
6. optional battle-damage overlay;
7. optional aura overlay, kept separate from the body.

Do not bake clothing, aura, accessories, background or shadows into the body layer.

## Technical handoff

The renderer identifies layers by stable keys. For this first pack, provide files named using this pattern:

```
body/humanoid/standard/neutral.png
face/humanoid/angular/sharp.png
eyes/sharp/gold.png
species/horned_humanoid.png
outfit/alien_vest/body.png
outfit/alien_vest/legs.png
outfit/alien_vest/feet.png
accessory/scouter.png
mark/scar_cheek.png
aura/base_gold.png
```

The game validates transparent alpha and source images up to 1024 pixels. Supply source canvases at 4x or 8x the final pixel resolution when practical, then provide the final exports above.

## Acceptance criteria

The work is accepted when:

- compact and sheet versions are recognizably the same character;
- all exports retain real alpha transparency;
- anatomy remains readable at 96 x 128;
- layer stacking works without seams or duplicated body parts;
- no asset resembles a specific canon character;
- colours, shadows, outlines and pixels match the approved visual target;
- editable source and exported PNGs are both delivered with commercial game-use rights.

## Milestones

1. silhouette, palette and turn-around sketch approval;
2. compact sprite approval at actual 96 x 128 display size;
3. sheet portrait and layer separation approval;
4. source-file, export and integration QA.

## Future packs

After this proof family is accepted, commission packs in this order: humanoid, Namekian, Frost Demon, Majin, Bio-Android, Yardratian, Kryllian, Great Ape, then transformation-specific rigs and modular clothing/equipment sets.

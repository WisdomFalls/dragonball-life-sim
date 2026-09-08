# Character Art Direction

## Approved visual language

Character art uses polished, mid-resolution pixel art that preserves the dramatic visual grammar of Dragon Ball-inspired martial-arts animation:

- powerful, readable anatomy with broad shoulders, tapered waists, large hands and grounded legs;
- angular, expressive eyes and faces built from clear shadow planes;
- thick dark contours, selective warm rim light and three to four cel-shaded tones per material;
- hair, crests, horns, tails and other species traits designed as bold silhouettes;
- fitted battle clothing with visible folds, belts, wraps, damage and strong colour blocking;
- near-full-body, three-quarter portraits: head through boots, with a relaxed combat-ready pose.

The target is neither chibi nor low-detail retro art. Pixels must be deliberately visible while the character remains detailed enough to distinguish species, build, hair, scars, equipment and transformations at mobile-card size.

## Original-character rule

Art can use this visual language but cannot reproduce a canon character or their identifying design. Each character needs distinct facial proportions, hair or crest silhouette, costume construction, colour palette, markings and pose. Canon characters use their own separately licensed/commissioned reference pipeline; generated art must never stand in for a canon preset.

## Production asset contract

Each exported asset must be a real RGBA PNG with transparent pixels, no checkerboard baked into the image, no glow baked around its silhouette, no text and no UI. Source art remains larger than its display crop so that the export can be inspected before downscaling.

The first playable portrait frame is 220 x 300 CSS pixels and should leave a small safety margin around horns, hair and boots. Art is composed from ordered layers where the current resolver can address them:

1. body family and build silhouette;
2. face, eyes, skin markings and injuries;
3. hair, crest, horns, ears, tail and other species anatomy;
4. torso, leg, wrist, foot and headwear clothing layers;
5. equipped items and accessories;
6. form-specific rig replacement, glow, aura and battle damage.

A transformation that substantially changes mass or anatomy selects a different rig. It never scales the base humanoid portrait as a substitute for a Great Ape, giant, Orange-style Namekian, or similarly distinct form.

## Initial production families

The first reviewed family is an original turquoise horned humanoid alien: pointed ears, curved ivory horns, a narrow amber-eyed face, dark navy vest, pale wrap tunic, magenta sash, charcoal trousers and off-white boots. It defines the approved contour, shading and material treatment.

The next assets should establish the reusable base families already exposed by `src/ui/appearance.js`: humanoid, Namekian, Frost Demon, Majin, Bio-Android, Yardratian, Kryllian and Great Ape. A family gets its neutral profile pose before additional clothing, expressions, battle poses or transformations.

## Review gate

Before an art file enters the game, verify at actual portrait size that it has transparent alpha, a clean silhouette, readable eyes, stable anatomy and no accidental resemblance to a canon character. Keep generated concept art outside the shipped asset folder until it passes that review.

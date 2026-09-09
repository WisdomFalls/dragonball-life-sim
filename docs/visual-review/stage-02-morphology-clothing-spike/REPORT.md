# Stage 2 Engineering Spike #3 — Morphology × Clothing × Pose

## Scope and result

This isolated, review-only prototype tests whether a semantic humanoid rig can express meaningful body-owned morphology and two clothing cases without authoring a full-body raster for each combination. It uses the approved terms **Narrow / Moderate** and **Balanced / Moderate** as frame contexts only. It does not read, crop, derive from, alter, or register canonical master artwork.

**Verdict: YELLOW.** The resolver retains a small reusable component grammar across the tested states. Fitted upper-body clothing crosses a real compatibility boundary: Narrow and Balanced need separate fitted torso rasters. The outer garment is shareable in this limited front-facing proof. Production art should not start broad Proportions generation until one additional silhouette and occlusion review validates fitted sleeves under guard/punch.

## Review-visible package

- `index.html` is the interactive 64×64 native-grid review page.
- `prototype.js` is the deterministic resolver and Canvas compositor.
- `components/metadata.json` is the state schema, component contract, classifications, and raster count.
- `components/` contains nine transparent disposable PNG components. Canvas uses `drawImage` with integer positions and smoothing disabled.
- `test/morphology-clothing-spike.test.mjs` is the focused automated contract suite.

## State contract

`resolveMorphology(state)` accepts this closed state object:

```js
{ frame, torsoLeg, armLength, internalArm, clavicle, pelvic, pose, clothing }
```

Frames are `narrow|balanced`; torso-to-leg is `torso_leaning|balanced|leg_leaning`; arm length is `short|average|long`; internal arm is `upper_arm_dominant|balanced|forearm_dominant`; clavicle and pelvis are `compact|proportional|extended` and `narrow|proportional|broad`; pose is `neutral|guard|punch|walk`; clothing is `fitted|outer`. Unknown values fail deterministically.

The resolver reports semantic anchors, measurements, selected component identifiers, semantic pose states, and an equipment attachment. It keeps standing height fixed through torso-to-leg variation while redistributing torso length and total leg length inversely. Internal arm proportion changes elbow placement while preserving shoulder-to-wrist reach. Face anchors remain head-owned and constant in this fixed-head experiment.

## What was tested

| Requirement | Result |
| --- | --- |
| Narrow versus Balanced structural context | Separate torso and fitted-top compatibility variants; shared head, limbs, weapon, and outer garment. |
| Torso-leaning / Balanced / leg-leaning | Metadata-only hip-anchor displacement; fixed total height, with inverse torso-length and total-leg-length redistribution. |
| Short / Average / Long arms | Metadata-only shoulder-to-wrist reach. |
| Internal arm proportion | Metadata-only elbow movement at fixed total arm reach. |
| Compact / Proportional / Extended clavicles | Metadata-only shoulder anchors. |
| Narrow / Proportional / Broad pelvis | Metadata-only hip anchors. |
| Neutral / guard / punch / walk | Same semantic vocabulary; no smooth deformation, fractional scaling, rotation, or mesh skinning. |
| Fitted upper garment | Two structural compatibility rasters: Narrow and Balanced. |
| Structured outer garment | One shared raster in this front-facing proof. |
| Long-arm punch attachment | Blade resolves directly from the final `hand_right` anchor. |
| Face stability | Eye, nose, and mouth anchors stay head-owned under all tested state changes. |

## Asset-growth accounting

The test space is `2 frames × 3 torso-leg × 3 arm-length × 3 internal-arm × 3 clavicle × 3 pelvic × 4 poses × 2 clothing = 3,888` logical presentations. A naive full-body-sheet approach therefore needs **3,888 full-body rasters**.

This proof authors **9 unique PNG components**: head, shared arm, shared leg, weapon, two torso families, two fitted-top families, and one outer garment. That avoids **3,879** naive full-body variants for this state space (a 432:1 logical-presentation-to-raster ratio). The resolver deliberately records 12 component requirements: SHARED 4, METADATA_ONLY 4, STRUCTURE_SPECIFIC 2, CLOTHING_SPECIFIC 1, and STRUCTURE_X_CLOTHING 2. Metadata-only entries are zero-raster requirements, so these classifications do not equal the PNG count.

The worst observed multiplication boundary is **Structural Frame × fitted torso garment**. It is a genuine authored boundary, though not yet a `× pose` boundary in this front-facing test. Guard and punch sleeves are the next high-risk test, because occlusion could turn it into `Frame × fitted garment × pose`.

## Compatibility strategy evaluation

| Strategy | Evidence |
| --- | --- |
| Universal components | Works for head, limbs, blade, and this outer garment; fails for torso silhouette and fitted upper torso. |
| Anchor / metadata variation | Works for selected torso/leg, total arm, internal arm, clavicle, and pelvic traits in this native-grid proof. |
| Shared compatibility groups | Supported: both frames share limb/head/equipment and pose vocabulary. |
| Structure-specific components | Required for Narrow vs Balanced torso silhouette. |
| Proportion-specific components | Not required for selected dimensions at this grid; unproven at production density. |
| Hybrid | Best current conclusion. It contains the fitted-garment failure without recreating full-body combinations. |

## PC-first and limits

PC-first keeps the dependency-free Canvas/ES-module approach viable: fixed native-grid composition scales nearest-neighbor for review and can later be packaged without changing the deterministic resolver. A renderer dependency is not justified by this spike. The prototype is deliberately not a performance benchmark, a production renderer, combat implementation, clothing system, or portrait implementation.

The disposable components are too simple to prove anatomical seam quality, side-facing views, damage overlays, transformations, multiple body-fat/muscle families, female Massive, or animation interpolation. The static arm/leg raster is deliberately shared; semantic anchors and equipment move, while production needs authored pose substitution before visual approval. #5B Internal Leg Proportion remains untested: it must redistribute femur and lower-leg lengths while preserving the total leg length already resolved by #5A.

## Recommendation

Start with a hybrid grammar: shared head/face/equipment; frame-family torso components; anchor-resolved torso-to-leg, total-arm, internal-arm, clavicle, and pelvic traits; discrete authored pose substitutions; clothing compatibility groups; curated composite exceptions only when layering fails.

For the current #5 contract, torso-to-leg, total arm length, internal arm, clavicle, and pelvic breadth are **EXPERIMENTAL anchor/metadata candidates**. Fitted torso clothing is **EXPERIMENTAL structure-specific**. Internal leg, ribcage depth, neck, hand/foot, and adult head/body remain deferred for evidence. Proportions visual generation is **not yet cleared for mass production**: it is cleared only for the next controlled component/occlusion spike.

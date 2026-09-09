# Stage 2 Engineering Spike #3B — Fitted Sleeve × Pose × Structure

## Verdict: GREEN

The bounded matrix supports fitted sleeves through discrete, native-grid arm and sleeve pose parts without full-body Cartesian sprites. The actual expensive boundary is **View × fitted sleeve × pose**. It is contained as six sleeve components shared across Narrow/Balanced and Short/Average/Long. Fitted torso garments remain structure-specific. No composite exception was needed.

## Matrix and results

The exact matrix is `2 frames × 3 arm lengths × 3 poses × 3 clothing cases × 2 views = 108` logical presentations.

- Frames: Narrow, Balanced.
- Arm length: Short, Average, Long; resolved as integer semantic hand/elbow anchors with no stretch.
- Poses: Neutral, Guard, Punch; each selects authored arm and, when applicable, sleeve pose IDs.
- Clothing: sleeveless fitted torso control, fitted close sleeve, structured outer garment.
- Views: front and right-facing. Right-facing is a deliberate small directional family, not an eight-direction system.

Front-facing Guard and Punch use explicit layer profiles: rear arm/sleeve, torso, torso garment, front arm/sleeve, equipment. The resolver records the profile rather than relying on incidental paint order. Punch exposes the sleeve seam; Guard places the rear sleeve before torso and the front sleeve after torso. Long Arm + Punch resolves the blade from the final `hand_right` anchor after pose and sleeve selection.

## Asset accounting

Naive full-body authoring would require **108** rasters. This proof contains **23 authored transparent PNG components**, avoiding **85** full-body variants, a **5:1** logical-presentation-to-component ratio.

| Classification | Count | Evidence |
| --- | ---: | --- |
| Shared | 1 | weapon |
| Metadata-only | 3 | Short/Average/Long reach |
| Structure-specific | 2 | Narrow/Balanced fitted torso |
| Clothing-specific | 2 | front/right outer garment |
| View × Pose | 12 | front/right rear/front arm pose components |
| View × Clothing × Pose | 6 | fitted sleeve pose components |
| Composite exception | 0 | independent layers remained usable |

The fitted sleeve did **not** require Frame × Clothing × Pose variants in this proof. Arm length did not require new sleeve rasters. Both claims remain bounded to this native-grid, front/right-facing disposable-art test.

## Limits and recommendation

This is not proof of production-density anatomy, all frames, side directions, damage, transformations, or complete clothing catalog coverage. It does prove the formerly blocking fitted-sleeve/guard/punch boundary is containable with explicit semantic layer profiles and small view/pose families. Actual Proportions visual production may proceed under the hybrid grammar, with each new garment family reviewed for compatibility rather than pre-authoring full Cartesian sheets.

Files: `index.html`, `prototype.js`, `components/metadata.json`, `components/`, and `test/sleeve-occlusion-spike.test.mjs` are all review-visible and self-contained.

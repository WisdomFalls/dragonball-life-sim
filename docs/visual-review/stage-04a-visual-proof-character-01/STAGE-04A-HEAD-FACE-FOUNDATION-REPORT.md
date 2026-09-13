# Stage 04A — Head & Face Foundation

Stage 04A recovers the existing U7 Saiyan physiology and maps it into the current production architecture without generating new face art. Proof Character 01 is U7 Saiyan, male, Balanced frame, Balanced/#5A proportion baseline, Luceus COMPLETE natural hair with Natural Black palette, and BASE transformation state.

BODY/Visual Identity owns descriptive inherited facial morphology: cranial envelope, face/jaw/chin, brow, eyes, nose, mouth, ears, skin phenotype, congenital traits. PERSON does not own inherited anatomy. Current state owns expression, blinking and temporary swelling/marks. Acquired BODY history owns scars, burns, missing anatomy and prosthetics. Presentation owns renderer choice, lighting and pixel compression. Morphology is never labeled as personality.

The existing `src/ui/portrait.js` is an experimental SVG-generating portrait seam with reusable skull, hair, eyes, ears, expression and acquired-mark functions. `resolveAppearance`/`visualIdentity` in `src/ui/appearance.js` already separate authored appearance from live state and expose legacy face/eye fields. These seams should be generalized during 04B rather than replaced in 04A. Existing U7 body manifests and Stage 03D Luceus assets are retained as production candidates/reference evidence.

The three renderers may simplify the same identity differently: portrait preserves explicit planes and feature spacing; full-body preserves silhouette and key anchors; gameplay preserves a few semantic clusters. All use the eight character-anatomical direction vocabulary and must not assume safe mirroring for asymmetric faces.

Hair/head registration must share head origin, crown, hairline, temples, rear skull, ears, eye line, face center, jaw/chin and neck attachment anchors. Luceus evidence supplies a directional contract but is not a final U7 skull proxy. No hair deformation or new face art is authorized here.

Recommendations: portrait authoring at a larger face-readable canvas; full-body at the established source resolution; gameplay at a reduced native grid after identity is proven. Exact sizes belong to 04B/04C measurement, not universal constants.

Verdicts: `U7_HEAD_FACE_PHYSIOLOGY_RECOVERY=GREEN`; `BODY_OWNERSHIP_MODEL=GREEN`; `IDENTITY_STATE_PRESENTATION_SEPARATION=GREEN`; `PORTRAIT_FULLBODY_GAMEPLAY_MAPPING=YELLOW`; `DIRECTIONAL_FACE_CONTRACT=GREEN`; `HAIR_HEAD_REGISTRATION_CONTRACT=YELLOW`; `EXISTING_ASSET_INVENTORY=GREEN`; `EXISTING_CODE_SEAM_INVENTORY=GREEN`; `PROOF_CHARACTER_FACE_SELECTION_SPACE=GREEN`.

`HEAD_FACE_SPECIFICATION_COMPLETE=YES`; `HEAD_FACE_ASSET_COMPLETE=NO`; `READY_FOR_STAGE_04B_FACE_AUTHORING=YES`. Remaining uncertainty is the exact authored head anchor and renderer resolutions, to be measured during 04B.

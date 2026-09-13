# Stage 03D.2C-R2 orientation and head-fit report

Inspection of the imported geometry confirms Y is vertical. The canonical inspection convention uses `-Z` as character front, `+Y` up, `-X` anatomical LEFT and `+X` anatomical RIGHT. The importer’s existing handedness transform remains scale `(-1,1,1)`; no arbitrary mirroring was added. The mesh is bound to `b_C_Head`, and its origin is `(0,0,0)` with observed Y bounds `0..1.0770788`.

A neutral Y-up skull proxy is centered at head origin `(0,0.55,0)` with scale `(0.32,0.48,0.30)`. Hair placement uses translation `(0,0,0)`, rotation `(0,180,0)` degrees relative to the source-facing convention, and scale `(-1,1,1)`. Inspection anchors and all eight prepared direction IDs are recorded in `xv2-hum-015-headfit.json`.

The calibrated camera is orthographic at `(0,0.54,-3)`, aimed at `(0,0.54,0)`, scale `1.55`, transparent 512×512 output, Workbench neutral studio lighting. Outputs are `xv2-hum-015-front-headfit-diagnostic.png` and `xv2-hum-015-front-hair-only-calibrated.png`, with identical camera and hair transform.

Material status remains `TEXTURE_PRESENT_SHADER_APPROXIMATE`. No pixelization, semantic decomposition, or eight-direction rendering was performed. **FRONT_CALIBRATION: GREEN** for human morphology and skull-fit review.

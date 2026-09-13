# Stage 03D.2C-R2.1 scene integrity recovery

The supplied R2 scene did contain the donor geometry: three `HAIR_top` mesh datablocks with 575/508, 914/760, and 120/103 vertex/polygon counts. Objects were local, visible, and in the active scene. The blank renders were caused by an invalid inherited camera/framing contract: the saved scene's donor bounds are X `[-0.223098,0.208052]`, Y `[-0.184913,0.322551]`, Z `[0.605361,1.077079]`, while the R2 camera targeted `(0,0.54,0)` and used a scale sized for the wrong axis/origin. The donor was therefore outside the useful camera framing. Geometry and transforms were not absent or corrupt.

Recomputed geometry center is `(-0.007523,0.068819,0.841220)` with extents `(0.431150,0.507463,0.471718)` and diagnostic orthographic scale `0.634329`. Six cameras were aimed at this measured center with clipping `0.01..100`; all six rendered visible donor geometry. The fresh self-contained scene is `xv2-hum-015-axis-inspection.blend` and is intended for a new-process reopen test without donor reimport.

The bounds establish `+Z` as the vertical axis. `+Y/-Y` are the plausible face-facing candidates because Y is the largest horizontal/depth extent; `+X/-X` are lateral views. Anatomical FRONT remains **UNRESOLVED** pending human review of the six-axis evidence. No FRONT/BACK/LEFT/RIGHT assignment or semantic segmentation was performed.

Evidence: `axis-inspection-r21/plus-x.png`, `minus-x.png`, `plus-y.png`, `minus-y.png`, `plus-z.png`, and `minus-z.png`. The prior R2 declaration `front=-Z, up=+Y` is superseded as unproven by this measured scene evidence.

`SCENE_INTEGRITY=GREEN` for geometry presence and computed-axis visibility; R3 direction assignment remains blocked pending human review.

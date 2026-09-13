# Stage 03D.4 — Pixel conversion and material-language spike

This exploratory spike processes only Luceus `front-left-3q` at native hair-height targets 96, 128, and 160 px. The 384px transparent source remains unchanged. The deterministic tool emits BASELINE, STRUCTURED, and MORTAL_COIL_STYLIZED candidates, 4-tone and 6-tone palettes, restrained contour and no-contour variants, plus nearest-neighbor 4x reviews. Registration metadata records source hash, crop box, scale, and anchor.

Source N is the neutral render. Source C is a controlled dark cel material treatment represented by the same geometry-derived luminance and a replaceable Saiyan palette; no texture or AI redraw is used.

Review boards: `board-resolution.png`, `board-treatment.png`, `board-source-material.png`, and `board-palette-contour.png` in `pixel-conversion-front-left-3q/`. Tool: `tools/pixel-conversion-spike.py`.

Preliminary verdicts: `NATIVE_PIXEL_RASTERIZATION=GREEN`; `SILHOUETTE_PRESERVATION=YELLOW`; `CEL_MATERIAL_SOURCE=YELLOW`; `PALETTE_REDUCTION=YELLOW`; `PIXEL_CLUSTER_READABILITY=YELLOW`; `CONTOUR_TREATMENT=YELLOW`; `REGISTRATION_PRESERVATION=GREEN`; `DETERMINISTIC_PIXEL_CONVERSION=GREEN`; `AUTHORED_PIXEL_QUALITY=RED`.

`BEST_TESTED_NATIVE_HAIR_HEIGHT=128`; `BEST_SOURCE_TREATMENT=CEL`; `BEST_PALETTE_SIZE=6`; `BEST_CONTOUR_MODE=restrained`; `READY_FOR_EIGHT_DIRECTION_PIXELIZATION=NO`; `HUMAN_OR_AI_PIXEL_CLEANUP_REQUIRED=YES`.

The result establishes an automation ceiling and does not claim authored production-quality pixel art. Human visual review is required before any eight-direction conversion.

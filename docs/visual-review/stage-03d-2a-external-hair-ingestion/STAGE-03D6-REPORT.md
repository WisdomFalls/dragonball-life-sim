# Stage 03D.6 — Luceus semantic palette profiles

The approved 128px Luceus master remains the sole structural source. This pass performs exact role-color substitution only: no resampling, smoothing, pixel movement, alpha edits, contour edits, or geometry changes.

`HairPaletteProfile` maps six semantic roles—`outline_deepest`, `deep_occlusion`, `primary_shadow`, `base_midtone`, `primary_highlight`, `accent_highlight`—to RGBA colors. Profiles produced: `natural_black` (current default candidate), `dark_brown`, `super_saiyan_gold`, `super_saiyan_blue`, and `silver_white`. Each preserves increasing luminance hierarchy and has native plus nearest-neighbor 4x output. Metadata is in `stage-03d5-luceus-master/hair-palette-profiles.json`; the review board is `luceus-palette-profile-comparison.png`.

The profile is presentation data owned by NaturalHairIdentity alongside source/geometry identity, COMPLETE/MODULAR mode, authored master(s), and role map. Temporary transformation state may override the profile later without modifying the identity; that logic is not implemented here.

Verdicts: `SEMANTIC_ROLE_MAP=GREEN`; `PALETTE_PROFILE_SYSTEM=GREEN`; `ALPHA_PRESERVATION=GREEN`; `REGISTRATION_PRESERVATION=GREEN`; `NATURAL_BLACK_PROFILE=GREEN`; `READY_FOR_REMAINING_7_DIRECTION_AUTHORING=NO`. The remaining directions still require separate human-approved authoring.

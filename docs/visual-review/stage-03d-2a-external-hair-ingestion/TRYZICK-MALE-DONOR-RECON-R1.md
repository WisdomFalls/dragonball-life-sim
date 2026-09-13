# Tryzick Male Donor Visual Review Board (03D.2F-R1)

Five hair-only specimens were rendered in canonical head space using `+Z` up, `-Y` front, `+Y` back, `-X` anatomical LEFT and `+X` anatomical RIGHT. Hair A is the Resource-Hair HUM_015 scene (`hair-a-resource-hum015`); it is distinct from Tryzick HUM_015 Luceus (`tryzick-hum015-luceus`). Camera: orthographic, 384x384, transparent background, neutral Workbench lighting. Registration uses root/head-space bounds with uniform scale 1.0 and no non-uniform deformation or sculpting.

Boards: `external-specimens/derived-reference/tryzick-board/tryzick-male-donor-front-comparison.png` and `tryzick-male-donor-3q-comparison.png`. Individual renders in the same directory use stable specimen IDs.

## Advisory comparison to Hair A

- **HUM_014 Custom Large SSJ — POSSIBLE:** similar upright crown and root footprint; larger crown volume and broader rear depth; front spike grouping is distinct; one HAIR_Top mesh.
- **Tryzick HUM_015 Luceus — PROMISING:** compact radial crown with close head-space fit and comparable strand scale; frontal flow differs clearly; one HAIR_Top mesh.
- **HUM_016 Pony Tail — POOR:** root is usable but long tied-back tail dominates length and rear depth; front remains compact; `Band` accessory plus HAIR_Top.
- **HUM_017 Pony Tail Extra Spikes — POSSIBLE:** similar crown family and larger spike scale; pony-tail/band creates extra rear mass; `Band` accessory plus HAIR_Top.

All ratings are visual review advice only. No Donor C is selected in this pass. No extraction, hybrid, pixelization, or eight-direction rendering was performed.

## Native imported structure

HUM_014 and Luceus each expose one `HAIR_Top` mesh. HUM_016 and HUM_017 expose `HAIR_Top` plus a separate `Band` mesh. The imported objects were inspected without topology edits; these object boundaries are the only obvious native separations recorded here. Hair A remains the established Resource-Hair reference scene.

## Per-donor registration record

`rotation=[0,0,0]`, `translation=[0,0,0]`, `uniform_scale=1.0` for all five inspection copies; source assets already occupy the established canonical head space. This is a recorded reproducible transform, not a claim of semantic interchangeability. Source archives remain quarantined and unchanged.

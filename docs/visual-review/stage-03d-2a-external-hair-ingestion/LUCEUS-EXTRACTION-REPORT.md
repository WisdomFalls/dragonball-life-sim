# Stage 03D.2G-R1 — Luceus reproducibility correction

Donor C remains locked to `tryzick-hum015-luceus`; Hair A remains `hair-a-resource-hum015`.

The prior `RED` classification was incorrect and is superseded. The Luceus mesh was not inspected in the failed run, so the current state is:

- `LUCEUS_SINGLE_MESH_SEMANTIC_EXTRACTION = BLOCKED/UNTESTED`
- `LUCEUS_SEMANTIC_BOUNDARY = UNRESOLVED`

## Known-good path evidence

The successful 03D.2F run used Blender 2.92.0 with the derived ZIP `ProjectXIR-0.0.6-layout-corrected.zip` installed into the per-user add-ons directory `C:\Users\Wisdom\AppData\Roaming\Blender Foundation\Blender\2.92\scripts\addons`, where the display/package directory is `Project XIR`. Blender then loaded the add-on and registered `bpy.ops.xenoverse_ir.emd` before the donor import loop. The successful run was a UI/session-backed install; no self-contained fresh-process bootstrap command was preserved.

Fresh headless reproduction was attempted with the portable executable and the same derived package. It failed before import: `addon_enable(module='Project XIR')` reported `ModuleNotFoundError: No module named 'Project XIR'`; `addon_install` reported `Failed to get add-ons path` because Blender's user add-ons path already exists as an inaccessible/conflicting file-system entry. Consequently the EMD operator was absent. This is a tooling/environment failure, not geometric evidence.

No source archive or donor geometry was changed. No semantic extraction, hybrid, raster masking, or fabricated boundary was performed. A self-contained Luceus inspection scene could not be produced until a deterministic writable Blender user-scripts/add-ons location is established.

## R2 bootstrap result

A dedicated writable environment was created at C:\Users\Wisdom\Documents\Codex\Mortal Coil Tools\blender-user with config, scripts/addons, datafiles, and isolated APPDATA. The derived Project XIR package was copied unchanged into its scripts/addons directory. A bootstrap script loads the real package as importable module Project_XIR (filesystem/display name remains Project XIR), invokes its legitimate egister(), and verifies py.ops.xenoverse_ir.emd. Fresh Blender 2.92 reported the dedicated scripts/addons paths and operator availability.

Fresh Luceus conversion independently measured HAIR_Top at 2610 vertices and 2558 polygons and saved xternal-specimens/derived-reference/tryzick-hum015-luceus-inspection.blend. A second fresh process reopened the cache and accessed the same mesh counts through ordinary bpy. The scene also retains an importer-registered operator because registration state is serialized with the scene; mesh access itself does not call ProjectXIR.

PROJECTXIR_PORTABLE_BOOTSTRAP = GREEN; XV2_TO_BLEND_CONVERSION_SEAM = GREEN; semantic extraction remains READY_FOR_TEST and was not performed in this stage.


## R3 topology result

The cached scene was inspected without ProjectXIR: HAIR_Top is 2610 vertices / 2558 polygons, one material slot, 7674 UV loops, and 155 disconnected vertex-connectivity components. The many small islands are repeated strand/triangle fragments rather than clean semantic locks; component boundaries do not map reliably to frontal function. Analytical hair-only renders are preserved under xternal-specimens/derived-reference/luceus-topology/ (luceus-topology-components-front.png, luceus-topology-components-3q.png, luceus-semantic-candidate-front.png, luceus-semantic-candidate-3q.png). A front fringe cannot be defensibly identified without an arbitrary spatial cut, so the boundary remains UNSUPPORTED and the extraction verdict is genuine RED after successful topology inspection. Hybrid 02 was not created.

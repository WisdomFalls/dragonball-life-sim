# Stage 03D.2G-R1 — Luceus reproducibility correction

Donor C remains locked to `tryzick-hum015-luceus`; Hair A remains `hair-a-resource-hum015`.

The prior `RED` classification was incorrect and is superseded. The Luceus mesh was not inspected in the failed run, so the current state is:

- `LUCEUS_SINGLE_MESH_SEMANTIC_EXTRACTION = BLOCKED/UNTESTED`
- `LUCEUS_SEMANTIC_BOUNDARY = UNRESOLVED`

## Known-good path evidence

The successful 03D.2F run used Blender 2.92.0 with the derived ZIP `ProjectXIR-0.0.6-layout-corrected.zip` installed into the per-user add-ons directory `C:\Users\Wisdom\AppData\Roaming\Blender Foundation\Blender\2.92\scripts\addons`, where the display/package directory is `Project XIR`. Blender then loaded the add-on and registered `bpy.ops.xenoverse_ir.emd` before the donor import loop. The successful run was a UI/session-backed install; no self-contained fresh-process bootstrap command was preserved.

Fresh headless reproduction was attempted with the portable executable and the same derived package. It failed before import: `addon_enable(module='Project XIR')` reported `ModuleNotFoundError: No module named 'Project XIR'`; `addon_install` reported `Failed to get add-ons path` because Blender's user add-ons path already exists as an inaccessible/conflicting file-system entry. Consequently the EMD operator was absent. This is a tooling/environment failure, not geometric evidence.

No source archive or donor geometry was changed. No semantic extraction, hybrid, raster masking, or fabricated boundary was performed. A self-contained Luceus inspection scene could not be produced until a deterministic writable Blender user-scripts/add-ons location is established.

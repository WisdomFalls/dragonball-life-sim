# Stage 03D.2C import report

Blender 2.92.0 (build `02948a2cab44`), ProjectXIR 0.0.6 derived compatibility package. Activation succeeded; Pillow 9.5.0 available; EMD operator registered. No ESK was supplied. Import with `Import_ESK=False` succeeded, so ESK is not required for static geometry import, although the parser printed an expected sibling ESK path and the mesh carries one bone name: `b_C_Head`.

The donor produced one EMD model (`HAIR_top`), three mesh objects/submeshes, 1,609 vertices total, 1,371 polygons total, and 3 material slots/groups. Bounds from the EMD parser: overall min `(-0.223097, 0, -0.18491405)`, max `(0.20805, 1.0770788, 0.32254502)`. Imported object transforms are origin `(0,0,0)` and scale `(-1,1,1)`; the negative X scale is the importer's explicit handedness conversion. Source coordinates use Y as vertical in the observed bounds; forward axis and head pivot require later human review. Geometry is visibly asymmetric only by topology/material grouping; no mirroring was applied.

Material classification: `TEXTURE_PRESENT_SHADER_APPROXIMATE` for this diagnostic. The front render uses Workbench material display with transparent background; exact Xenoverse shader reproduction was not attempted. Derived artifacts are quarantined under `external-specimens/derived-reference/` and are not production assets.

The single deterministic diagnostic is `xv2-hum-015-front-diagnostic.png`, with scene `xv2-hum-015-inspection.blend`. Directional feasibility is **YELLOW**: import and front visibility work, but orientation, attachment scale, and material fidelity need human review before further directions or decomposition.

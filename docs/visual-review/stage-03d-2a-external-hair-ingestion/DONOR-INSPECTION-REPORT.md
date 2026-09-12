# Stage 03D.2B donor inspection — XV2 Resource Hair

The supplied `1536350038_Resource-Hair.zip` is quarantined under `external-specimens/raw/xv2-hum-015-resource-hair/` and is unchanged. Its SHA-256 is `e22deee9e759c977e4b704e381dbf91988f143edc0749652483c02ede314a414`.

## Inventory and roles

The archive contains exactly four files: `HUM_015_hair.emd` (66,769 bytes; `9329a8efbf8cd1721b3cea038ea5060df6fbb353b3f9d4101ae791fa3b59bcf0`), `HUM_015_hair.emb` (786,880 bytes; `411e04912c863a2f58a7ae432bf3f583446e51772e1a13d483dbca3fed9a2ae5`), `HUM_015_Hair.dyt.emb` (58,112 bytes; `3562cb2577efdef5e42cdbd982edd83247be7e6f64b3ee65c926fe30f431825a`), and `HUM_015_hair.emm` (1,220 bytes; `9c20437644dbf0584ff80c0d5d4eb5d7ce4bd1dddfff357bac5fd3b6449759cf`). No creator, URL, license, ESK, or skeleton was supplied; these remain unknown.

EMD is the model/geometry container, EMB is the texture container, DYT.EMB is the dye/color texture container, and EMM is the material-definition container. Mesh/submesh counts, material references, bounds, LODs, separate regions, and bone IDs are not claimed because no compatible parser was executed. The archive contains no ESK, so static orientation and skeleton binding remain unverified.

## ProjectXIR findings

The supplied ProjectXIR source declares Blender `(2, 92, 0)` compatibility and version `0.0.6`. Its addon exposes import paths for EMD, EMB, DYT.EMB, EMM, and ESK, and its description names Xenoverse 1/2 assets. It is therefore the most direct candidate for this donor, but direct import, material reconstruction, mesh statistics, and skeleton independence remain unverified until Blender 2.92 and the addon are run. The source includes a Pillow installer, implying a Python dependency managed inside Blender. No system software was installed.

Recommended minimum path: ProjectXIR in its declared Blender 2.92 environment, loading EMD + EMB + DYT.EMB + EMM. Blender is required for this candidate conversion path; Xenoverse itself is not expected to be required, but a matching ESK or proxy head may be needed to establish attachment and orientation. Do not use current Blender until compatibility is tested; prefer the declared version first.

## Directional feasibility

The donor supplies no directional renders. Forward axis, up axis, world origin, pivot, scale, and head attachment are not encoded in this inspection record and must be measured after import. The future eight-direction contract remains character-anatomical, orthographic, transparent, fixed-scale, deterministic, and prohibits mirroring. Geometry asymmetry is unverified.

## Semantic morphology preview

**YELLOW.** A dedicated hair EMD strongly suggests a viable source for fringe, crown, side, rear/nape, scalp, and accent classification, but separate region structure and attachment boundaries cannot be confirmed without parsing/rendering. No decomposition is authorized in 03D.2B.

## Risks and 03D.2C proposal

Risks are parser/version incompatibility, missing skeleton or attachment transform, unknown material/dye interpretation, and unknown licensing. Stage 03D.2C should: install no new system software; run the declared Blender 2.92 plus ProjectXIR in an isolated inspection workspace; import the four supplied files; capture parser logs and bounds/material/mesh counts; attach a neutral proxy head only after transform inspection; render one diagnostic front view; compare orientation against the eight-direction contract; then obtain human review before any semantic decomposition or production conversion.

# Visual Implementation Architecture

## Status vocabulary

- **PROVEN** means a repository review artifact and focused tests demonstrate the claim in a bounded prototype.
- **PLANNED** means an approved direction not yet demonstrated in implementation.
- **EXPERIMENTAL** means a bounded spike indicates promise but needs further evidence.
- **REJECTED** means the tested approach conflicts with the pixel-art or asset-growth constraints.

## Current architecture

**PROVEN — Visual Identity and deterministic presentation.** Existing identity resolution supplies a deterministic visual input; the Stage 2 spike resolvers turn explicit state into semantic components and anchors. This is evidence for a contract seam, not for a finished production renderer.

**PLANNED — BODY-owned morphology.** Structural Frame and the #5 Proportions contract belong to biological/body state. Frame remains independent of height, musculature, body fat, and power. Current visual state will resolve a presentation from that body state plus pose, clothing, equipment, and later damage/transformations.

**PROVEN — Semantic rig and anchors.** `stage-02-modular-rig-spike` and `stage-02-pixel-pose-spike` prove a semantic anchor map can parent face, limbs, clothing, and equipment. Spike #3 proves anchors can represent selected torso/leg, arm, clavicle, pelvic, and internal-arm relationships in a bounded native-grid proof.

**PROVEN — Discrete raster pose substitution.** Spikes #1 and #2 support semantic pose selection and moving hand attachments. **REJECTED — smooth skeletal deformation, mesh skinning, fractional raster scaling, and interpolation** for this pixel grammar.

**EXPERIMENTAL — Compatibility families and clothing layering.** Spike #3 shows shared components plus Narrow/Balanced torso/fitted-top variants can prevent full Cartesian sheets. It has not yet proven fitted sleeves under guard/punch, multiple angles, or high-density anatomical seams.

**PROVEN — Attachment contract.** Equipment attaches to a named semantic hand/wrist anchor after pose and proportion resolution. Spike #3 tests Long Arm + Punch directly.

**EXPERIMENTAL — Deterministic raster composition.** The review prototypes compose native PNGs at integer positions with `imageSmoothingEnabled=false`. Production should preserve this rule; production integration is not yet evidence-backed.

## Current structural-frame status

**PLANNED / documented canonical vocabulary.** Male U7 Saiyan has seven locked Moderate masters: Narrow, Compact, Balanced, Broad, Tapered, Heavy, Massive. Female has six: Narrow, Compact, Balanced, Broad, Tapered, Heavy. Female Massive / Moderate is unresolved and must not be treated as canonical. See `docs/visual-review/round-01a/masters/manifest.json` and `docs/visual-review/round-01c/ROUND-01-STRUCTURAL-FRAME-CLOSEOUT.md`.

## #5 Proportions contract

**PLANNED.** The body-owned traits are torso-to-leg ratio, internal leg, total arm, internal arm, clavicle breadth, pelvic breadth, ribcage depth, neck length/build, hand scale, foot scale, and adult head-to-body proportion. #5A redistributes torso length against total leg length at fixed standing height. #5B redistributes femur against lower-leg length while preserving the total leg length already resolved by #5A. Spike #3 samples #5A, total arm, internal arm, clavicle, and pelvis only. It does not license generic body-shape presets or tie proportions to power, attractiveness, personality, or morality.

## Production grammar implied by evidence

**EXPERIMENTAL.** Use shared head/face/equipment components; frame-family torso variants; selected anchor-resolved proportions; discrete authored pose parts; clothing compatibility groups; and curated composite exceptions where independent layers visibly fail. Do not use full-body Cartesian sprite sheets as the primary model.

## PC-first implications

**EXPERIMENTAL.** The dependency-free ES-module/Canvas prototypes are sufficient for further visual engineering. PC delivery can package this approach later, but a rendering library should be selected only after measured batching, scene, or tooling pressure. No external runtime dependency is warranted by the present evidence.

## Next evidence needed

**PLANNED.** Test fitted sleeves and outer garment occlusion through guard/punch with authored discrete pose parts; evaluate one side-facing scale; then determine whether `Structure × Clothing × Pose` requires compatibility variants or a composite exception. Only after that review should mass Proportions asset production begin.

## Review Visibility / Engineering Evidence Workflow

**PLANNED workflow.** Codex may develop isolated engineering spikes locally, but the review artifacts must live in repository review, documentation, and test paths. Before architecture approval, those artifacts are committed to a dedicated review branch and pushed to GitHub. Codex reports the repository, branch, full commit SHA, and repository-relative artifact paths. The separate architecture-review session reviews the pushed evidence; its approval does not authorize a merge or production integration, which remain separate owner decisions.

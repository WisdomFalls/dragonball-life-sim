import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const dir="docs/visual-review/stage-04b0-r3c-r1e-face-geometry-bridge/";
test("R1E records verified five-component face bridge",()=>{
 const r=JSON.parse(fs.readFileSync(dir+"xenokit-runtime-status.json"));
 assert.equal(r.executable_found,true); assert.equal(r.launch_success,true); assert.equal(r.version,"0.8.1");
 const v=JSON.parse(fs.readFileSync(dir+"face-base-view-status.json")); assert.equal(v.visible,true); assert.equal(v.components.length,5);
 const c=JSON.parse(fs.readFileSync(dir+"coherent-head-view-status.json")); assert.equal(c.common_head_coordinate_space,true); assert.equal(c.multi_angle_structural_coherence,true);
 const cap=JSON.parse(fs.readFileSync(dir+"xenokit-directional-capture-capability.json")); assert.equal(cap.classification,"MANUAL_ONLY"); assert.equal(cap.blender_remains_authoritative_directional_renderer,true);
});

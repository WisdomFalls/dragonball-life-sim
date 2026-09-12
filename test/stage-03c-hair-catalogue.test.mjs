import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const d = JSON.parse(readFileSync(new URL("../docs/visual-review/stage-03c-natural-hair-catalogue/hair-catalogue.json", import.meta.url)));

test("Founder hair catalogue contract", () => {
  assert.equal(d.owner, "BODY");
  assert.equal(d.identities.length, 5);
  assert.deepEqual(d.identities.map((x) => x.id), ["01", "02", "05", "06", "09"]);
  assert.equal(new Set(d.identities.map((x) => x.id)).size, 5);
  for (const identity of d.identities) {
    for (const field of d.required_fields) assert.ok(identity[field] !== undefined, `${identity.id} missing ${field}`);
    assert.equal(identity.owner, "BODY");
    assert.equal(identity.identity_type, "natural_hair");
    assert.equal(identity.approval_state, "review");
    assert.equal(identity.founder_set, d.founderSet);
    assert.ok(identity.canonical_front_master.endsWith("-front-master.png"));
  }
  assert.equal(d.natural_palettes.length, 4);
  assert.ok(d.approval_states.includes("review"));
});

import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeAdditionalBriefVersions,
  resolveAdditionalBriefId,
} from "../src/entities/client-side/campaign/model/campaign-content.ts";

test("Additional Brief arrays preserve backend IDs and order", () => {
  const source = [
    { _id: "brief-b", additionalBrief: "Brief B" },
    { _id: "brief-a", additionalBrief: "Brief A" },
  ];

  assert.deepEqual(normalizeAdditionalBriefVersions(source), source);
});

test("legacy Additional Brief text is materialized once at a lifecycle boundary", () => {
  let calls = 0;
  const result = normalizeAdditionalBriefVersions("Legacy brief", {
    createId: () => {
      calls += 1;
      return "legacy-brief-id";
    },
  });

  assert.deepEqual(result, [
    { _id: "legacy-brief-id", additionalBrief: "Legacy brief" },
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(normalizeAdditionalBriefVersions(""), []);
  assert.deepEqual(normalizeAdditionalBriefVersions(null), []);
});

test("Additional Brief selection preserves valid IDs and falls back safely", () => {
  const briefs = [
    { _id: "brief-a", additionalBrief: "Brief A" },
    { _id: "brief-b", additionalBrief: "Brief B" },
  ];

  assert.equal(resolveAdditionalBriefId(briefs, "brief-b"), "brief-b");
  assert.equal(resolveAdditionalBriefId(briefs, "stale"), "brief-a");
  assert.equal(resolveAdditionalBriefId(briefs, undefined), "brief-a");
  assert.equal(resolveAdditionalBriefId([], "brief-a"), undefined);
});

import assert from "node:assert/strict";
import test from "node:test";
import { getDraftDetailsForm, getDraftContentStatus, buildAiDraftPayload } from '../src/entities/client-side/campaign-draft/model/ai-campaign-draft.model.ts';

test('current note arrays can be opened and legacy notes are serialized as current variants', () => {
  assert.equal(getDraftDetailsForm({ additionalBrief: [{ _id: 'note', additionalBrief: 'Keep note' }] }).additionalBrief, 'Keep note');
  assert.equal(getDraftContentStatus({ additionalBrief: [], descriptions: [] }), 'empty');
  const payload = buildAiDraftPayload({ _id: 'draft', campaignContent: [{ _id: 'content', additionalBrief: 'Legacy note' }] }, [], false);
  assert.deepEqual(payload.campaignContent[0].additionalBrief, [{ _id: 'content', additionalBrief: 'Legacy note' }]);
});

const persistence = await import(
  "../src/widgets/ai-chat/model/ai-chat-persistence.ts"
).catch(() => ({}));
const bundles = await import(
  "../src/widgets/ai-chat/model/recommendation-bundles.ts"
).catch(() => ({}));

class MemoryStorage {
  #values = new Map();

  get length() {
    return this.#values.size;
  }

  clear() {
    this.#values.clear();
  }

  getItem(key) {
    return this.#values.get(key) ?? null;
  }

  key(index) {
    return [...this.#values.keys()][index] ?? null;
  }

  removeItem(key) {
    this.#values.delete(key);
  }

  setItem(key, value) {
    this.#values.set(key, String(value));
  }
}

const clientA = { userId: "user-a", role: "client" };
const clientB = { userId: "user-b", role: "client" };
const influencerA = { userId: "user-a", role: "influencer" };

test("chat state survives reload only for the same user and role", () => {
  assert.equal(typeof persistence.writeAiChatState, "function");
  const storage = new MemoryStorage();
  const state = { messages: [{ id: "a-message" }], conversationId: "c-a" };

  persistence.writeAiChatState(storage, clientA, state);

  assert.deepEqual(persistence.readAiChatState(storage, clientA), state);
  assert.equal(persistence.readAiChatState(storage, clientB), null);
  assert.equal(persistence.readAiChatState(storage, influencerA), null);
});

test("anonymous sessions are never persisted", () => {
  assert.equal(typeof persistence.writeAiChatState, "function");
  const storage = new MemoryStorage();

  persistence.writeAiChatState(storage, null, { messages: [{ id: "secret" }] });
  persistence.writeAiWorkspaceSurface(storage, null, "pages");

  assert.equal(storage.length, 0);
  assert.equal(persistence.readAiChatState(storage, null), null);
  assert.equal(persistence.readAiWorkspaceSurface(storage, null), null);
});

test("legacy role-only state is discarded instead of migrated", () => {
  assert.equal(typeof persistence.readAiChatState, "function");
  const storage = new MemoryStorage();
  storage.setItem("ai-chat:v3:client", JSON.stringify({ messages: [{ id: "legacy" }] }));
  storage.setItem("ai-chat:workspace-surface:client", "pages");

  assert.equal(persistence.readAiChatState(storage, clientA), null);
  assert.equal(persistence.readAiWorkspaceSurface(storage, clientA), null);
  assert.equal(storage.getItem("ai-chat:v3:client"), null);
  assert.equal(storage.getItem("ai-chat:workspace-surface:client"), null);
});

test("logout cleanup removes only the owning identity's chat data", () => {
  assert.equal(typeof persistence.clearAiChatPersistence, "function");
  const storage = new MemoryStorage();
  persistence.writeAiChatState(storage, clientA, { messages: [{ id: "a" }] });
  persistence.writeAiWorkspaceSurface(storage, clientA, "pages");
  persistence.writeAiChatState(storage, clientB, { messages: [{ id: "b" }] });

  persistence.clearAiChatPersistence(storage, clientA);

  assert.equal(persistence.readAiChatState(storage, clientA), null);
  assert.equal(persistence.readAiWorkspaceSurface(storage, clientA), null);
  assert.deepEqual(persistence.readAiChatState(storage, clientB), {
    messages: [{ id: "b" }],
  });
});

test("malformed storage and invalid tokens fail closed", () => {
  assert.equal(typeof persistence.aiChatStorageKey, "function");
  const storage = new MemoryStorage();
  storage.setItem(persistence.aiChatStorageKey(clientA), "{not-json");

  assert.equal(persistence.readAiChatState(storage, clientA), null);
  assert.equal(persistence.identityFromAccessToken("not-a-jwt"), null);
  assert.equal(persistence.identityFromAccessToken(null), null);
});

test("runtime-invalid persisted messages are discarded", () => {
  const storage = new MemoryStorage();
  storage.setItem(
    persistence.aiChatStorageKey(clientA),
    JSON.stringify({
      messages: [{ id: "broken", q: "hello", a: "", links: 7, media: [], status: "success" }],
    }),
  );

  assert.equal(
    persistence.readAiChatState(
      storage,
      clientA,
      persistence.isAiChatPersistedState,
    ),
    null,
  );
});

const candidates = [
  { accountId: "one", username: "Page One" },
  { accountId: "two", username: "Page Two" },
  { accountId: "three", username: "Page Three" },
];

test("bundle resolution returns the exact candidate references in bundle order", () => {
  assert.equal(typeof bundles.resolveRecommendationBundle, "function");
  const result = bundles.resolveRecommendationBundle(
    { id: "pair", name: "Pair", total: 125, currency: "EUR", accountIds: ["two", "one"] },
    candidates,
    new Set(),
    3,
  );

  assert.equal(result.status, "ready");
  assert.deepEqual(result.candidates, [candidates[1], candidates[0]]);
  assert.deepEqual(result.memberNames, ["Page Two", "Page One"]);
});

test("bundle resolution reports already-added, stale, and draft-cap states", () => {
  assert.equal(typeof bundles.resolveRecommendationBundle, "function");
  const alreadyAdded = bundles.resolveRecommendationBundle(
    { id: "one", name: "One", total: 50, currency: "EUR", accountIds: ["one"] },
    candidates,
    new Set(["one"]),
    1,
  );
  const stale = bundles.resolveRecommendationBundle(
    { id: "stale", name: "Stale", total: 75, currency: "EUR", accountIds: ["missing"] },
    candidates,
    new Set(),
    1,
  );
  const full = bundles.resolveRecommendationBundle(
    { id: "full", name: "Full", total: 125, currency: "EUR", accountIds: ["one", "two"] },
    candidates,
    new Set(),
    49,
  );

  assert.equal(alreadyAdded.status, "already-added");
  assert.equal(stale.status, "missing-candidates");
  assert.deepEqual(stale.missingAccountIds, ["missing"]);
  assert.equal(full.status, "over-capacity");
  assert.equal(full.remainingCapacity, 1);
});

test("first-turn search is assigned to the draft created in the response", () => {
  assert.equal(typeof bundles.resolveSearchDraftId, "function");
  const draftId = bundles.resolveSearchDraftId(undefined, [
    { label: "Open draft", kind: "campaign_draft", draftId: "new-draft" },
  ]);

  assert.equal(draftId, "new-draft");
  assert.equal(
    bundles.resolveSearchDraftId("existing-draft", [
      { label: "Open draft", kind: "campaign_draft", draftId: "new-draft" },
    ]),
    "existing-draft",
  );
});

test("machine bundle names are presented as friendly labels", () => {
  assert.equal(typeof bundles.getRecommendationBundleLabel, "function");
  assert.equal(bundles.getRecommendationBundleLabel("best_value"), "Best value");
  assert.equal(bundles.getRecommendationBundleLabel("max_reach"), "Maximum reach");
  assert.equal(bundles.getRecommendationBundleLabel("Starter mix"), "Starter mix");
});

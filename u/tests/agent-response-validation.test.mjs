import assert from 'node:assert/strict';
import test from 'node:test';
import { isAgentChatResponse, isAgentSearchOutcome } from '../src/api/agent/agent-response.validation.ts';
import { isAiChatPersistedState } from '../src/widgets/ai-chat/model/ai-chat-persistence.ts';

const search = {
  status: 'completed', page: 1, loadedCount: 1, totalExact: 1, hasMore: false,
  candidates: [{ accountId: 'a', influencerId: 'i', username: 'house', followers: 100,
    priceEUR: 10, price: 10, currency: 'EUR', socialMedia: 'instagram', profileType: 'community', musicGenres: ['House'] }],
  bundles: [{ id: 'bundle', name: 'best_value', total: 10, currency: 'EUR', accountIds: ['a'] }],
};

test('valid API and persisted search use the same nested contract', () => {
  assert.equal(isAgentChatResponse({ steps: [], reply: 'Ready', links: [], conversationId: 'c', search }), true);
  assert.equal(isAiChatPersistedState({ messages: [], recommendationsByDraft: { draft: search } }), true);
  assert.equal(isAgentSearchOutcome({ ...search, bundles: undefined }), true);
});

test('malformed nested recommendations are rejected before rendering or adding', () => {
  for (const malformed of [
    { ...search, candidates: [null] },
    { ...search, candidates: [{ ...search.candidates[0], price: NaN }] },
    { ...search, candidates: [{ ...search.candidates[0], musicGenres: 'House' }] },
    { ...search, bundles: [{ ...search.bundles[0], accountIds: [null] }] },
  ]) {
    assert.equal(isAgentSearchOutcome(malformed), false);
    assert.equal(isAiChatPersistedState({ messages: [], recommendationsByDraft: { draft: malformed } }), false);
  }
});

test('API rejects invalid reply, navigation and media payloads', () => {
  const response = { steps: [], reply: 'Ready', links: [], conversationId: 'c' };
  assert.equal(isAgentChatResponse({ ...response, reply: {} }), false);
  assert.equal(isAgentChatResponse({ ...response, links: [{ label: 'Open', path: null }] }), false);
  assert.equal(isAgentChatResponse({ ...response, media: [{ type: 'image', url: 1, alt: '' }] }), false);
});

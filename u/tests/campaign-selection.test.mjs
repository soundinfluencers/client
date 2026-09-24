import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getRecommendationCandidates,
  getRecommendedDate,
  getSelectionTotals,
  getConvertedSelectionTotal,
  includeRecommendedPages,
  mergeSearchOutcome,
} from '../src/widgets/ai-chat/model/campaign-selection.ts';

const candidate = (id, price, followers) => ({
  accountId: id, influencerId: `owner-${id}`, username: id,
  priceEUR: price, price, currency: 'EUR', followers,
  socialMedia: 'instagram', profileType: 'community', musicGenres: ['Techno'],
});
const saved = (id, price, followers, extra = {}) => ({
  socialAccountId: id, influencerId: `owner-${id}`, username: id,
  price, followers, socialMedia: 'instagram', profileType: 'community',
  isSelected: true, isAvailable: true, dateRequest: '2026-10-01', ...extra,
});
const search = (page, candidates, extra = {}) => ({
  status: 'completed', page, candidates, loadedCount: candidates.length,
  totalExact: 165, hasMore: true, nextPage: page + 1, ...extra,
});

test('the live selection includes pending choices without counting an existing page twice', () => {
  assert.deepEqual(getSelectionTotals(
    [saved('a', 50, 1000)],
    [candidate('a', 50, 1000), candidate('b', 30, 2000)],
  ), { count: 2, priceEUR: 80, followers: 3000 });
});

test('excluded and unavailable campaign pages do not inflate current totals', () => {
  assert.deepEqual(getSelectionTotals([
    saved('a', 50, 1000, { isSelected: false }),
    saved('b', 30, 2000, { isAvailable: false }),
    saved('c', 20, 3000),
  ], []), { count: 1, priceEUR: 20, followers: 3000 });
});

test('budget totals use the displayed converted row prices instead of rounding the aggregate', () => {
  const accounts = [saved('a', 1.5, 1000), saved('b', 1.5, 2000), saved('c', 1.5, 3000)];
  const candidates = ['a', 'b', 'c'].map(id => ({ ...candidate(id, 1.5, 1000), currency: 'USD', price: 2 }));
  assert.equal(getConvertedSelectionTotal(accounts, search(1, candidates, { currency: 'USD', currencyPerEUR: 1.08 }), 'USD'), 6);
  assert.equal(getConvertedSelectionTotal(accounts, undefined, 'USD'), undefined);
  assert.equal(getConvertedSelectionTotal(accounts, undefined, 'EUR'), 4.5);
});

test('the entire bundle can be selected even when some members are outside the visible batch', () => {
  const a = candidate('a', 50, 1000);
  const b = candidate('b', 30, 2000);
  assert.deepEqual(getRecommendationCandidates(search(1, [a], {
    bundles: [{ name: 'best_value', pages: [a, b], total: 80, currency: 'EUR', followers: 3000 }],
  })).map(page => page.accountId), ['a', 'b']);
});

test('adding a bundle preserves existing publishing details and re-includes excluded pages', () => {
  const accounts = [saved('a', 50, 1000, {
    isSelected: false, selectedContent: { campaignContentItemId: 'content-a' },
  })];
  const result = includeRecommendedPages(accounts,
    [candidate('a', 50, 1000), candidate('b', 30, 2000)], '2026-10-05');
  assert.equal(result.length, 2);
  assert.equal(result[0].isSelected, true);
  assert.equal(result[0].dateRequest, '2026-10-01');
  assert.deepEqual(result[0].selectedContent, { campaignContentItemId: 'content-a' });
  assert.equal(result[1].dateRequest, '2026-10-05');
  assert.equal(result[1].price, 30);
});

test('recommendations cannot re-enable unavailable pages', () => {
  const result = includeRecommendedPages(
    [saved('a', 50, 1000, { isAvailable: false, isSelected: false })],
    [candidate('a', 50, 1000)], 'ASAP',
  );
  assert.equal(result[0].isSelected, false);
});

test('brief dates survive page selection, with flexible timing defaulting to ASAP', () => {
  assert.equal(getRecommendedDate('2026-10-01'), '2026-10-01');
  assert.equal(getRecommendedDate('First week of October'), 'First week of October');
  assert.equal(getRecommendedDate('Flexible'), 'ASAP');
  assert.equal(getRecommendedDate(undefined), 'ASAP');
});

test('loading more preserves the complete bundle and deduplicates existing rows', () => {
  const a = candidate('a', 50, 1000);
  const b = candidate('b', 30, 2000);
  const bundles = [{ name: 'best_value', pages: [a, b], total: 80, currency: 'EUR', followers: 3000 }];
  const result = mergeSearchOutcome(search(1, [a], { bundles, countries: ['DE'] }), search(2, [a, b]));
  assert.equal(result.loadedCount, 2);
  assert.deepEqual(result.bundles, bundles);
  assert.deepEqual(result.countries, ['DE']);
});

test('an empty continuation retains usable pages and ends pagination', () => {
  const result = mergeSearchOutcome(search(1, [candidate('a', 50, 1000)]),
    search(2, [], { status: 'empty', hasMore: false }));
  assert.equal(result.status, 'completed');
  assert.equal(result.candidates.length, 1);
  assert.equal(result.hasMore, false);
});

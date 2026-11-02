// Structural projections of promos.service@439b56d; no HTTP/server mutations.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { InfiniteQueryObserver, QueryClient } = require('@tanstack/query-core');
const root = path.resolve(__dirname, '..');
const p = 'src/pages/influencer/promos/';
function loader(deps = {}) {
  const cache = new Map();
  const load = file => {
    if (cache.has(file)) return cache.get(file).exports;
    const m = { exports: {} }; cache.set(file, m);
    const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    const req = name => {
      if (Object.hasOwn(deps, name)) return deps[name];
      if (['react', 'react/jsx-runtime', 'zod'].includes(name)) return require(name);
      if (/\.(scss|svg|png)$/.test(name)) return name;
      const local = name.startsWith('@/') ? 'src/' + name.slice(2) : name.startsWith('@components/') ? 'src/components/' + name.slice(12) : name.startsWith('.') ? path.posix.join(path.posix.dirname(file), name) : null;
      if (local) {
        const found = [local, local + '.ts', local + '.tsx'].find(f => fs.existsSync(path.join(root, f)) && fs.statSync(path.join(root, f)).isFile());
        if (found) return load(found);
      }
      throw new Error(`Unmocked ${name} from ${file}`);
    };
    new Function('require', 'module', 'exports', code)(req, m, m.exports);
    return m.exports;
  };
  return load;
}
const id = n => n.toString(16).padStart(24, '0');
const standalone = (n, extra = {}) => ({ type: 'standalone', campaignId: id(100), addedAccountsId: id(n), campaignName: 'Saved campaign', socialMedia: 'instagram', reward: 0, createdAt: '01.11.26', confirmation: 'wait', closedStatus: 'wait', statusCampaign: 'pending', source: 'campaigns', ...extra });
const fresh = (n, extra = {}) => ({ promoType: 'standalone', campaignId: id(100), addedAccountsId: id(n), influencerId: id(200), socialAccountId: id(300), username: 'account', accountSocialMedia: 'instagram', campaignName: 'Saved campaign', isPaused: false, mainLink: 'https://example.test/second-video', description: 'Second description', additionalBrief: 'Second brief', ...extra });
const bundle = () => ({ promoType: 'bundle', campaignId: id(100), campaignBundleId: id(400), bundleId: id(500), isPaused: true, currency: 'EUR', bundleReward: 30, originalReward: 40, acceptancePolicy: 'all_or_nothing', accounts: [
  { addedAccountsId: id(2), socialAccountId: id(301), username: 'second', accountSocialMedia: 'press', bundlePosition: 1, reward: 20, description: 'Second press description', mainLink: 'https://example.test/press', additionalBrief: 'Second brief' },
  { addedAccountsId: id(1), socialAccountId: id(300), username: 'first', accountSocialMedia: 'instagram', bundlePosition: 0, reward: 10, mainLink: 'https://example.test/video', description: 'Second description' },
] });
const group = () => ({ type: 'bundle', bundleId: id(500), reward: 30, promos: [standalone(1), standalone(2, { confirmation: 'accept', closedStatus: 'wait' })].map(({ type, ...row }) => row) });
const envelope = promos => ({ data: { statusCode: 200, message: 'Success', data: { promos } } });
const dummy = () => null;
const ui = { ButtonMain: dummy, ButtonSecondary: dummy };
const hooks = { ...React, useMemo: f => f(), useCallback: f => f, useEffect: () => {}, useState: v => [typeof v === 'function' ? v() : v, () => {}], useRef: v => ({ current: v }), useSyncExternalStore: (_s, get) => get() };
function walk(node) {
  if (Array.isArray(node)) return node.flatMap(walk);
  if (!node || typeof node !== 'object') return [];
  return [node, ...walk(node.props?.children)];
}
const text = node => {
  if (Array.isArray(node)) return node.map(text).join(' ');
  if (!node || typeof node !== 'object') return String(node ?? '');
  return text(node.props?.children);
};
function harness(deps = {}) {
  const load = loader({ react: hooks, '@components/ui/buttons-fix/ButtonFix.tsx': ui, '@/components/ui/buttons-fix/ButtonFix': ui,
    '@/constants/social-medias.ts': { getSocialMediaIcon: () => '' }, '@/components': { Container: dummy, Loader: dummy, Breadcrumbs: dummy }, ...deps });
  return load;
}

test('stage 8 actual dashboard/New projections remain separate unions and preserve group members, identity, statuses and money', () => {
  const read = harness()(p + 'model/promo-read.ts');
  const raw = [standalone(1), group()]; const result = read.readDashboardPromos(raw);
  assert.equal(result.length, 2); assert.equal(result[0].socialMedia, 'instagram');
  assert.equal('accountSocialMedia' in result[0], false); assert.equal('influencerId' in result[0], false);
  assert.equal(result[1].reward, 30); assert.equal(result[1].promos.length, 2);
  assert.equal(result[1].promos[1].confirmation, 'accept'); assert.equal('campaignBundleId' in result[1], false);
  assert.deepEqual(raw, [standalone(1), group()]);
  const next = read.readDetailedPromos([fresh(1), bundle()], 'new');
  assert.equal(next[0].readKind, 'new'); assert.equal('reward' in next[0], false); assert.equal('statusCampaign' in next[0], false);
  assert.deepEqual(next[1].accounts.map(a => a.addedAccountsId), [id(1), id(2)]);
  assert.equal(next[1].campaignBundleId, id(400)); assert.notEqual(next[1].campaignBundleId, next[1].bundleId);
  assert.equal(next[1].isPaused, true); assert.equal(next[1].accounts[1].additionalBrief, 'Second brief');
  assert.equal('addedAccountsId' in next[1], false); assert.equal(read.canUsePlacementAction(next[1]), false);
});

test('stage 8 ongoing/list/pinned/completed fields stay optional; separate placements and valid selected display values survive', () => {
  const read = harness()(p + 'model/promo-read.ts');
  const rows = [1, 2].map(n => ({ campaignId: id(100), addedAccountsId: id(n), socialAccountId: id(300), accountSocialMedia: 'press', logoUrl: null, mainLink: `https://example.test/${n}`, description: `Chosen ${n}`, additionalBrief: `Brief ${n}` }));
  const list = read.readDetailedPromos(rows, 'ongoing');
  assert.equal(list.length, 2); assert.notEqual(read.detailKey(list[0]), read.detailKey(list[1]));
  for (const row of list) { assert.equal('isPaused' in row, false); assert.equal('confirmation' in row, false); assert.equal('promoType' in row, false); assert.equal('campaignBundleId' in row, false); assert.equal('selectedContent' in row, false); }
  assert.deepEqual(read.readDetailedPromos([...rows].reverse(), 'ongoing').map(read.detailKey), list.map(read.detailKey).reverse());
  const pinned = read.readDetailedPromos([{ ...rows[0], isPaused: true, confirmation: 'accept', closedStatus: 'wait', statusCampaign: 'distributing', influencerId: id(200) }], 'ongoing')[0];
  assert.equal(pinned.confirmation, 'accept'); assert.equal(read.canUsePlacementAction(pinned), false);
  const done = read.readDetailedPromos([{ campaignId: id(100), addedAccountsId: id(1), reward: 0, postLink: null }], 'close')[0];
  assert.equal(done.readKind, 'close'); assert.equal('mainLink' in done, false); assert.equal('confirmation' in done, false);
});

test('stage 8 real API adapters unwrap Axios envelopes without replacing display fields or touching mutations', async () => {
  const calls = [];
  const load = harness({ '../../api': { __esModule: true, default: { get: async (url, config) => { calls.push({ url, config }); return envelope(url.startsWith('/promos/dashboard') ? [standalone(1), group()] : [fresh(1)]); }, patch: () => assert.fail('No read may mutate') } } });
  const api = load('src/api/influencer/promos/influencer-promos.api.ts');
  const signal = new AbortController().signal;
  assert.equal((await api.getInfluencerPromos('all', 12, 1, signal))[1].promos.length, 2);
  const row = (await api.getDetailedPromo({ status: 'new', page: 1, signal }))[0];
  assert.equal(row.description, 'Second description'); assert.equal(row.additionalBrief, 'Second brief');
  assert.equal(calls[1].config.signal, signal); assert.equal(calls[1].config.params.status, 'new');
});

test('stage 8 saved EUR reward handles zero/missing/invalid without client price or FX', () => {
  const read = harness()(p + 'model/promo-read.ts');
  assert.equal(read.formatPromoReward(0), '0€'); assert.equal(read.formatPromoReward(7), '7€');
  for (const v of [null, undefined, NaN, Infinity, -1, '7', {}, []]) assert.equal(read.formatPromoReward(v), '—');
  for (const displayCurrency of ['EUR', 'USD', 'GBP']) {
    const row = read.readDashboardPromos([standalone(1, { reward: 7, displayCurrency, publicPrice: 999 })])[0];
    assert.equal(read.formatPromoReward(row.reward), '7€');
  }
});

test('stage 8 strict pinned URL contract, legacy history normalization, F5 and invalid/group links', () => {
  const calls = [], effects = [];
  let location = { pathname: '/influencer/promos/new-promos', search: '', hash: '', state: { campaignId: id(100), addedAccountsId: id(1) } };
  const load = harness({ react: { ...hooks, useEffect: f => effects.push(f) }, 'react-router-dom': { useLocation: () => location, useNavigate: () => (...args) => calls.push(args) } });
  const nav = load(p + 'model/promo-navigation.ts');
  assert.equal(nav.usePromoLocation().pin.addedAccountsId, id(1)); effects.splice(0).forEach(f => f());
  assert.equal(calls.length, 1); assert.match(calls[0][0].search, /campaignId=/); assert.deepEqual(calls[0][1].state, location.state);
  location = { ...location, search: calls[0][0].search, state: null }; nav.usePromoLocation(); effects.splice(0).forEach(f => f());
  assert.equal(calls.length, 1); assert.equal(nav.parsePromoLocation(location.search).pin.addedAccountsId, id(1));
  assert.deepEqual(nav.parsePromoLocation('', null), { invalid: false, legacy: false });
  for (const s of ['?campaignId=' + id(100), '?addedAccountsId=' + id(1), '?campaignId=bad&addedAccountsId=' + id(1), location.search + '&campaignId=' + id(100), '?bundleId=' + id(500), '?campaignBundleId=' + id(400)]) assert.equal(nav.parsePromoLocation(s, { campaignId: id(100), addedAccountsId: id(1) }).invalid, true);
});

test('stage 8 grid/table dispatch and navigation preserve placement identity; grouped entries never use a first child', () => {
  const navigation = [];
  const deps = { 'react-router-dom': { useNavigate: () => (...args) => navigation.push(args), useLocation: () => ({}) },
    '@/pages/influencer/dashboard-layout/store/useDashboardLayoutStore.ts': { useDashboardLayoutStore: () => ({ activePromosFilter: 'all' }) },
    '@/shared/ui/skeletons/card-skeleton.tsx': { CardSkeleton: dummy }, '@/shared/ui/skeletons/table-card-skeleton.tsx': { TableCardSkeleton: dummy },
    '@/pages/influencer/shared/components/empty-promo-list/EmptyPromoList.tsx': { EmptyPromosList: dummy } };
  const load = harness(deps); const read = load(p + 'model/promo-read.ts');
  const rows = read.readDashboardPromos([standalone(1), standalone(2), group()]);
  const base = 'src/pages/influencer/dashboard-layout/components/promos-list/components/';
  const grid = load(base + 'promos-grid/PromosGrid.tsx').PromosGrid({ promos: rows });
  const li = walk(grid).filter(x => x.type === 'li'); assert.equal(new Set(li.map(x => x.key)).size, 3);
  li[1].props.onClick(); assert.match(navigation[0][0], new RegExp('addedAccountsId=' + id(2))); assert.equal(li[2].props.onClick, undefined);
  const table = load(base + 'promos-table/PromosTable.tsx').PromosTable({ promos: rows });
  assert.equal(walk(table).some(x => x.type === 'td' && x.props.colSpan === 4), true);
  const Item = load(base + 'promos-table/promos-table-item/PromosTableItem.tsx').PromosTableItem;
  walk(Item({ promo: rows[0] })).find(x => x.props.onClick).props.onClick(); assert.match(navigation[1][0], new RegExp('addedAccountsId=' + id(1)));
  const Card = load(base + 'promos-grid/promos-grid-card/PromosGridCard.tsx').PromosGridCard;
  assert.match(text(Card({ promo: rows[0] })), /0€/);
  const nav = load('src/pages/influencer/dashboard-layout/components/promos-list/hooks/usePromoNavigate.ts').usePromoNavigate();
  nav('accept', 'wait', 'bad', id(1)); assert.equal(navigation.length, 2);
});

test('stage 8 gated Bundle UI is inert while isolated prepared presentations retain members, briefs, policy and single group reward', () => {
  const load = harness(); const read = load(p + 'model/promo-read.ts'); const ui = load(p + 'components/bundle-promo/BundlePromo.tsx');
  const saved = read.readDetailedPromos([bundle()], 'new')[0]; const dashboard = read.readDashboardPromos([group()])[0];
  for (const promo of [saved, dashboard]) {
    const gated = ui.BundlePromo({ promo }); assert.equal(gated.type, ui.BundleUnavailable);
    assert.equal(walk(gated).some(x => x.props?.onClick), false);
  }
  const prepared = ui.NewBundlePresentation({ promo: saved });
  assert.equal(walk(prepared).filter(x => x.type === 'section').length, 2);
  assert.match(text(prepared), /all_or_nothing/); assert.equal(walk(prepared).some(x => x.props?.value === 'Second brief'), true);
  const dash = ui.DashboardBundlePresentation({ promo: dashboard }); assert.equal(walk(dash).filter(x => x.type === 'li').length, 2);
  assert.equal((text(dash).match(/30€/g) || []).length, 1); assert.match(text(dash), /New request/); assert.match(text(dash), /Distributing/);
  assert.equal(walk(prepared).some(x => x.type === 'button' || x.props?.onAccept), false);
});

test('stage 8 detail dispatch blocks groups/member links and paused rows but keeps standalone/Offer callbacks addressed', () => {
  const calls = []; const load = harness(); const read = load(p + 'model/promo-read.ts');
  const List = load(p + 'components/promos-details-list/PromosDetailsList.tsx').PromosDetailsList;
  const data = read.readDetailedPromos([fresh(1), fresh(2, { offerId: id(600) }), bundle(), fresh(3, { campaignBundleId: id(400), bundleId: id(500) }), fresh(4, { isPaused: true })], 'new');
  const tree = List({ data, status: 'pending', onAccept: p => calls.push(p), onDecline: p => calls.push(p) });
  const cards = walk(tree).filter(x => x.props?.onAccept); assert.equal(cards.length, 3);
  cards[0].props.onAccept(); cards[1].props.onDecline(); cards[2].props.onAccept();
  assert.deepEqual(calls.map(c => [c.addedAccountsId, c.campaignResponse]), [[id(1), 'accept'], [id(2), 'decline']]);
  assert.equal(walk(tree).filter(x => x.type === 'li').length, 5);
});

test('stage 8 main missing-config guards, empty links, chosen values and completed zero reward survive real detail components', () => {
  const load = harness(); const read = load(p + 'model/promo-read.ts');
  const Card = load(p + 'components/promos-details-list/promos-details-list-card/PromosDetailsListCard.tsx').PromosDetailsListCard;
  const Row = load(p + 'components/promos-details-list/promos-details-list-card/DetailsRow.tsx').DetailsRow;
  const unknown = read.readDetailedPromos([fresh(1, { accountSocialMedia: undefined, logoUrl: null })], 'new')[0];
  assert.doesNotThrow(() => Card({ promo: unknown, status: 'pending', index: 0 }));
  for (const value of ['', ' ', null, undefined]) {
    const row = Row({ value, label: 'Link', copyable: true, linkable: true });
    assert.equal(walk(row).some(x => x.type === 'a' || x.type === 'button'), false);
  }
  const filled = Row({ value: 'https://example.test/second', label: 'Link', linkable: true });
  assert.equal(walk(filled).find(x => x.type === 'a').props.href, 'https://example.test/second');
  const selected = Card({ promo: read.readDetailedPromos([fresh(1)], 'new')[0], status: 'pending', index: 0 });
  assert.equal(walk(selected).some(x => x.props.value === 'Second description'), true);
  const complete = Card({ promo: read.readDetailedPromos([{ campaignId: id(100), addedAccountsId: id(1), accountSocialMedia: 'press', reward: 0 }], 'close')[0], status: 'completed', index: 0 });
  assert.equal(walk(complete).some(x => x.props.value === '0€'), true);
});

function queryHarness(api) {
  let options;
  const load = harness({ '@tanstack/react-query': { useInfiniteQuery: o => (options = o, o) }, '@/api/influencer/promos/influencer-promos.api': api });
  const session = load('src/shared/auth/reader-session.ts'); session.changeReaderSession(true);
  return { load, session, options: () => options };
}
test('stage 8 first-page pin inside/later/outside base pages never skips pages or truncates hasNextPage', async () => {
  for (const selected of [1, 3, 9]) {
    const calls = []; const read = harness()(p + 'model/promo-read.ts'); const all = [1,2,3,4,5].map(n => read.readDetailedPromos([fresh(n)], 'new')[0]);
    const f = queryHarness({ getDetailedPromo: async args => {
      calls.push(args); const base = all.slice((args.page - 1) * 2, args.page * 2);
      return args.campaignId ? [read.readDetailedPromos([fresh(selected)], 'new')[0], ...base.filter(x => x.addedAccountsId !== id(selected))] : base;
    } });
    const hook = f.load(p + 'hooks/useDetailedPromos.ts'); hook.useDetailedPromos({ status: 'new', campaignId: id(100), addedAccountsId: id(selected), limit: 2 });
    const options = f.options(), pages = [];
    let next = 1; while (next) { pages.push(await options.queryFn({ pageParam: next })); next = options.getNextPageParam(pages.at(-1), pages); }
    assert.deepEqual(calls.filter(c => !c.campaignId).map(c => c.page), [1,2,3]);
    assert.equal(calls.filter(c => c.campaignId).length, 1); assert.equal(pages[0].baseCount, 2);
    const merged = options.select({ pages }).promos;
    assert.equal(new Set(merged.map(x => x.addedAccountsId)).size, selected === 9 ? 6 : 5);
    assert.equal(merged[0].addedAccountsId, id(selected)); assert.equal(merged.length, selected === 9 ? 6 : 5);
  }
});

test('stage 8 empty/short base page and unavailable/invalid pin have explicit progression/errors', async () => {
  const read = harness()(p + 'model/promo-read.ts');
  for (const count of [0,1,2]) {
    const base = Array.from({ length: count }, (_, i) => read.readDetailedPromos([fresh(i + 1)], 'new')[0]);
    const f = queryHarness({ getDetailedPromo: async args => args.campaignId ? [read.readDetailedPromos([fresh(9)], 'new')[0], ...base] : base });
    const h = f.load(p + 'hooks/useDetailedPromos.ts'); h.useDetailedPromos({ status: 'new', limit: 2 });
    const page = await h.readPromoPage({ status: 'new', limit: 2, page: 1, campaignId: id(100), addedAccountsId: id(9) });
    assert.equal(page.baseCount, count); assert.equal(f.options().getNextPageParam(page, [page]), count < 2 ? undefined : 2);
  }
  let calls = 0;
  const f = queryHarness({ getDetailedPromo: async () => { calls++; return []; } }); const h = f.load(p + 'hooks/useDetailedPromos.ts');
  await assert.rejects(h.readPromoPage({ status: 'new', page: 1, campaignId: 'bad', addedAccountsId: id(1) }), /Invalid promo link/); assert.equal(calls, 0);
  await assert.rejects(h.readPromoPage({ status: 'new', page: 1, campaignId: id(100), addedAccountsId: id(1) }), /unavailable/);
});

test('stage 8 query keys/owner prevent late filter or auth data and GET Retry never invokes mutation', async () => {
  const pending = [], read = harness()(p + 'model/promo-read.ts'); let fail = false;
  const f = queryHarness({ getInfluencerPromos: async status => {
    if (fail) throw new Error('GET failure');
    return new Promise(resolve => pending.push({ status, resolve }));
  } });
  const hook = f.load(p + 'hooks/useDashboardPromos.ts'); const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  hook.useDashboardPromos('new', 12); const observer = new InfiniteQueryObserver(client, { ...f.options(), retry: false }); const unsubscribe = observer.subscribe(() => {});
  hook.useDashboardPromos('ongoing', 12); observer.setOptions({ ...f.options(), retry: false });
  assert.equal(observer.getCurrentResult().data, undefined, 'no placeholder from old filter');
  pending[1].resolve(read.readDashboardPromos([standalone(2)])); await new Promise(setImmediate);
  pending[0].resolve(read.readDashboardPromos([standalone(1)])); await new Promise(setImmediate);
  assert.equal(observer.getCurrentResult().data.pages[0][0].addedAccountsId, id(2));
  fail = true; await observer.refetch(); assert.equal(observer.getCurrentResult().isError, true);
  fail = false; const retry = observer.refetch(); pending.at(-1).resolve(read.readDashboardPromos([standalone(3)])); await retry;
  assert.equal(observer.getCurrentResult().data.pages[0][0].addedAccountsId, id(3));
  const old = f.options(); f.session.changeReaderSession(false); f.session.changeReaderSession(true);
  await assert.rejects(old.queryFn({ pageParam: 1 }), /session changed/);
  hook.useDashboardPromos('ongoing', 12); assert.notDeepEqual(f.options().queryKey, old.queryKey);
  assert.equal(f.options().placeholderData, undefined); unsubscribe(); client.clear();
});

test('stage 8 detail late base response cannot start a foreign pin read after auth change; placement keys isolate responses', async () => {
  let resolve, calls = 0;
  const f = queryHarness({ getDetailedPromo: () => { calls++; return new Promise(r => { resolve = r; }); } });
  const h = f.load(p + 'hooks/useDetailedPromos.ts'); h.useDetailedPromos({ status: 'new', campaignId: id(100), addedAccountsId: id(1) });
  const old = f.options(), read = old.queryFn({ pageParam: 1 }); f.session.changeReaderSession(false);
  resolve([]); await assert.rejects(read, /session changed/); assert.equal(calls, 1);
  f.session.changeReaderSession(true); h.useDetailedPromos({ status: 'new', campaignId: id(101), addedAccountsId: id(2) }); assert.notDeepEqual(f.options().queryKey, old.queryKey);
});

test('stage 8 active New preserves context on mount and errors expose GET-only Retry; pinned View more remains', () => {
  const navigation = [], effects = []; let retries = 0;
  const context = { pin: { campaignId: id(100), addedAccountsId: id(1) }, invalid: false };
  let query = { data: { promos: [] }, error: new Error('Read failed'), refetch: () => retries++, hasNextPage: true };
  const load = harness({ react: { ...hooks, useEffect: f => effects.push(f) }, '../model/promo-navigation': { usePromoLocation: () => context },
    '@/pages/influencer/promos/hooks/useDetailedPromos.ts': { useDetailedPromos: () => query }, './hooks/useConfirmInfluencerPromo': { useConfirmInfluencerPromo: () => ({ mutate: () => assert.fail('Retry may not mutate') }) },
    '@components/ui/modal-fix/Modal.tsx': { Modal: dummy }, 'react-router-dom': { useLocation: () => ({ pathname: '/influencer/promos/new-promos' }), useNavigate: () => (...args) => navigation.push(args) } });
  const New = load(p + 'new-promos/NewPromos.tsx').NewPromos;
  const oldWindow = global.window; global.window = { scrollTo() {} };
  try {
    const errorTree = New(); effects.splice(0).forEach(f => f()); assert.equal(navigation.length, 0);
    walk(errorTree).find(node => typeof node.props?.onRetry === 'function').props.onRetry(); assert.equal(retries, 1);
    query = { data: { promos: [harness()(p + 'model/promo-read.ts').readDetailedPromos([fresh(1)], 'new')[0]] }, hasNextPage: true, fetchNextPage: () => {}, refetch: () => retries++ };
    const tree = New(); assert.equal(walk(tree).some(x => x.props.label === 'View more' && !x.props.isDisabled), true);
  } finally { global.window = oldWindow; }
});

test('stage 8 error component calls real GET Retry and main auth refresh setter does not advance reader epoch', () => {
  let calls = 0; const load = harness();
  const ErrorView = load('src/pages/influencer/shared/components/error/Error.tsx').Error;
  const tree = ErrorView({ onRetry: () => calls++, message: 'Read error' });
  const button = walk(tree).find(x => x.props.label === 'Retry'); button.props.onClick(); assert.equal(calls, 1); assert.match(text(tree), /Read error/);
  const source = fs.readFileSync(path.join(root, 'src/contexts/AuthContext.tsx'), 'utf8');
  const setter = source.slice(source.indexOf('  const setAccessToken = useCallback'), source.indexOf('  // const setAccessToken'));
  assert.doesNotMatch(setter, /changeReaderSession/);
  assert.match(source, /const logout = useCallback\(async \(\) => \{\s*changeReaderSession\(false\)/);
  const login = fs.readFileSync(path.join(root, 'src/pages/auth/login/LoginPage.tsx'), 'utf8'); assert.match(login, /setUser\(userData\);\s*changeReaderSession\(true\)/);
  const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8'); assert.doesNotMatch(app, /InfluencerCreateBundle|path="create-bundle"/);
  assert.match(fs.readFileSync(path.join(root, 'src/shared/config/bundle-availability.ts'), 'utf8'), /BUNDLES_AVAILABLE: boolean = false/);
});

test('stage 8 group pagination uses server items and group keys never substitute catalogue identity for lifecycle identity', async () => {
  const read = harness()(p + 'model/promo-read.ts');
  const a = group(), b = { ...group(), promos: group().promos.map(row => ({ ...row, campaignId: id(101) })) };
  const dashboard = read.readDashboardPromos([a, b]);
  assert.notEqual(read.dashboardKey(dashboard[0]), read.dashboardKey(dashboard[1]));
  assert.equal(read.dashboardKey(dashboard[0]), read.dashboardKey({ ...dashboard[0], promos: [...dashboard[0].promos].reverse() }));
  const f = queryHarness({ getInfluencerPromos: async () => dashboard }); f.load(p + 'hooks/useDashboardPromos.ts').useDashboardPromos('all', 2);
  const page = await f.options().queryFn({ pageParam: 1 }); assert.equal(page.length, 2);
  assert.equal(f.options().getNextPageParam(page, [page]), 2); assert.equal(f.options().getNextPageParam([page[0]], [page]), undefined);
  const first = read.readDetailedPromos([bundle()], 'new')[0];
  const other = read.readDetailedPromos([{ ...bundle(), campaignBundleId: id(401), campaignId: id(101) }], 'new')[0];
  const merged = read.mergePromoPages([{ items: [other, first] }, { items: [first] }]);
  assert.equal(merged.length, 2); assert.equal(merged[0].accounts.length, 2);
  assert.equal(read.matchesPin(first, { campaignId: id(100), addedAccountsId: id(2) }), true);
  assert.equal(read.matchesPin(first, { campaignId: id(101), addedAccountsId: id(2) }), false);
  assert.throws(() => read.readDetailedPromos([{ ...bundle(), accounts: [bundle().accounts[0], bundle().accounts[0]] }], 'new'), /ambiguous/);
  assert.throws(() => read.readDashboardPromos([{ ...group(), promos: [] }]), /incomplete/);
});

test('stage 8 real detail QueryObserver cold transitions and reverse replies cannot publish another placement', async () => {
  const pending = [], read = harness()(p + 'model/promo-read.ts');
  const f = queryHarness({ getDetailedPromo: args => new Promise(resolve => pending.push({ args, resolve })) });
  const hook = f.load(p + 'hooks/useDetailedPromos.ts');
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  hook.useDetailedPromos({ status: 'ongoing', campaignId: id(100), addedAccountsId: id(1) });
  const observer = new InfiniteQueryObserver(client, { ...f.options(), retry: false }); const unsub = observer.subscribe(() => {});
  hook.useDetailedPromos({ status: 'close', campaignId: id(101), addedAccountsId: id(2) }); observer.setOptions({ ...f.options(), retry: false });
  assert.equal(observer.getCurrentResult().data, undefined);
  const latest = read.readDetailedPromos([{ campaignId: id(101), addedAccountsId: id(2), reward: 0 }], 'close');
  pending[1].resolve(latest); await new Promise(setImmediate);
  pending[2].resolve(latest); await new Promise(setImmediate);
  const accepted = observer.getCurrentResult().data;
  pending[0].resolve(read.readDetailedPromos([{ campaignId: id(100), addedAccountsId: id(1) }], 'ongoing'));
  await new Promise(setImmediate); assert.equal(observer.getCurrentResult().data, accepted);
  assert.equal(observer.getCurrentResult().data.promos[0].addedAccountsId, id(2));
  unsub(); client.clear();
});

test('stage 8 active ongoing/Completed readers retain pinned URLs and View more; results cannot use foreign query state', () => {
  let context = { pin: { campaignId: id(100), addedAccountsId: id(1) }, invalid: false };
  let location = { pathname: '/influencer/promos/distributing', search: '?campaignId=' + id(100) + '&addedAccountsId=' + id(1), hash: '', state: null };
  const navigation = [], requests = [], read = harness()(p + 'model/promo-read.ts');
  const row = read.readDetailedPromos([{ campaignId: id(100), addedAccountsId: id(1), username: 'account', accountSocialMedia: 'instagram', mainLink: 'https://example.test/selected', reward: 7, isPaused: false }], 'ongoing')[0];
  const load = harness({ '../model/promo-navigation': { usePromoLocation: () => context, promoSearch: pin => '?campaignId=' + pin.campaignId + '&addedAccountsId=' + pin.addedAccountsId },
    '../hooks/useDetailedPromos': { useDetailedPromos: params => (requests.push(params), { data: { promos: params.status === 'close' ? read.readDetailedPromos([{ campaignId: id(100), addedAccountsId: id(1), username: 'account', accountSocialMedia: 'instagram', reward: 7, postLink: 'https://example.test/post' }], 'close') : [row] }, hasNextPage: true, fetchNextPage() {}, refetch() {} }) },
    './components/campaign-result-form/CampaignResultForm': { CampaignResultForm: dummy },
    'react-router-dom': { useLocation: () => location, useNavigate: () => (...args) => navigation.push(args) } });
  const D = load(p + 'distributing/Distributing.tsx').Distributing;
  const C = load(p + 'completed/Completed.tsx').Completed;
  assert.equal(walk(D()).some(x => x.props?.label === 'View more' && !x.props.isDisabled), true);
  const list = walk(D()).find(x => x.props?.onSubmitResults); list.props.onSubmitResults(row);
  assert.equal(navigation[0][0].search, location.search); assert.equal(navigation[0][0].hash, '#submit');
  assert.equal(requests[0].campaignId, id(100)); assert.equal(requests[0].addedAccountsId, id(1));
  assert.equal(walk(C()).some(x => x.props?.label === 'View more'), true);
  location = { ...location, hash: '#submit', state: { campaignId: id(101), addedAccountsId: id(2), username: 'account', meta: 'instagram' } };
  assert.match(D().props.message, /Invalid promo link/);
  location = { ...location, state: { campaignId: id(100), addedAccountsId: id(1), username: 'account', meta: 'unknown' } };
  assert.match(D().props.message, /Invalid promo link/);
  context = { invalid: true }; location = { ...location, hash: '', state: null }; D(); assert.equal(requests.at(-1).enabled, false);
});

test('all active detail pages hide exhausted View more and lock an in-flight next page', () => {
  const row = harness()(p + 'model/promo-read.ts').readDetailedPromos([fresh(1)], 'new')[0];
  let query = { data: { promos: [row] }, hasNextPage: false, isFetchingNextPage: false, fetchNextPage: () => { calls++; }, refetch() {} }, calls = 0;
  const load = harness({
    '../model/promo-navigation': { usePromoLocation: () => ({ pin: { campaignId: id(100), addedAccountsId: id(1) }, invalid: false }), promoSearch: () => '' },
    '../hooks/useDetailedPromos': { useDetailedPromos: () => query },
    '@/pages/influencer/promos/hooks/useDetailedPromos.ts': { useDetailedPromos: () => query },
    './hooks/useConfirmInfluencerPromo': { useConfirmInfluencerPromo: () => ({ mutate() {}, stateFor: () => ({ isPending: false }) }) },
    './components/campaign-result-form/CampaignResultForm': { CampaignResultForm: dummy },
    '@components/ui/modal-fix/Modal.tsx': { Modal: dummy },
    'react-router-dom': { useLocation: () => ({ pathname: '/influencer/promos/new-promos', search: '', hash: '', state: null }), useNavigate: () => () => {} },
  });
  for (const [file, name] of [['new-promos/NewPromos.tsx','NewPromos'],['distributing/Distributing.tsx','Distributing'],['completed/Completed.tsx','Completed']]) {
    const Component = load(p + file)[name];
    query.hasNextPage = false; query.isFetchingNextPage = false;
    assert.equal(walk(Component()).some(n => n.props?.label === 'View more'), false);
    query.hasNextPage = true;
    const more = walk(Component()).find(n => n.props?.label === 'View more'); assert.ok(more); more.props.onClick();
    query.isFetchingNextPage = true;
    const loading = walk(Component()).find(n => n.props?.label === 'Loading...');
    assert.equal(loading.props.isDisabled, true); const before = calls; loading.props.onClick(); assert.equal(calls, before);
    if (name === 'NewPromos') {
      query.isFetchingNextPage = false; query.error = new Error('Background GET failed');
      const staleMore = walk(Component()).find(n => n.props?.label === 'View more');
      assert.equal(staleMore.props.isDisabled, true); staleMore.props.onClick(); assert.equal(calls, before);
      query.error = undefined;
    }
  }
});

test('stage 8 silent reader errors stay in keyed GET UI while ordinary API error behavior and 401 refresh remain', async () => {
  let onError, notifications = 0, refreshes = 0, replays = 0;
  const client = Object.assign(async () => { replays++; }, { interceptors: { request: { use() {}, eject() {} }, response: { use(_s, error) { onError = error; }, eject() {} } } });
  const load = loader({ axios: { __esModule: true, default: { create: () => client } }, './error.api.ts': { handleApiError: () => notifications++ },
    '../contexts/AuthContext.tsx': { tokenStorage: { get: () => 'token' } }, '@/api/refresh.manager.ts': { refreshAccessToken: async () => { refreshes++; return 'fresh'; } }, '@/shared/config/runtime-config.ts': { API_URL: 'https://example.test' } });
  load('src/api/api.ts').setupInterceptors(() => {}, () => assert.fail('No logout'));
  for (const error of [ { config: { url: '/promos/detailed', silentReadError: true }, response: { status: 403 } }, { config: { silentReadError: true } } ]) await assert.rejects(onError(error));
  assert.equal(notifications, 0);
  await assert.rejects(onError({ config: {}, response: { status: 400 } })); assert.equal(notifications, 1);
  await onError({ config: { url: '/promos/dashboard', silentReadError: true, headers: {} }, response: { status: 401 } });
  assert.equal(refreshes, 1); assert.equal(replays, 1);
});

test('New page clears consumed pin only through its success callback; mutation hook owns late auth guards', () => {
  for (const action of ['accept', 'decline']) {
    const navigation = [], writes = [], context = { pin: { campaignId: id(100), addedAccountsId: id(1) }, invalid: false };
    const read = harness()(p + 'model/promo-read.ts');
    const load = harness({ '../model/promo-navigation': { usePromoLocation: () => context },
      '@/pages/influencer/promos/hooks/useDetailedPromos.ts': { useDetailedPromos: () => ({ data: { promos: read.readDetailedPromos([fresh(1)], 'new') } }) },
      './hooks/useConfirmInfluencerPromo': { useConfirmInfluencerPromo: () => ({ mutate: (body, callbacks) => writes.push({ body, callbacks }) }) },
      '@components/ui/modal-fix/Modal.tsx': { Modal: dummy }, 'react-router-dom': { useLocation: () => ({ pathname: '/influencer/promos/new-promos', search: '?campaignId=' + id(100) + '&addedAccountsId=' + id(1), key: 'entry' }), useNavigate: () => (...args) => navigation.push(args) } });
    const New = load(p + 'new-promos/NewPromos.tsx').NewPromos; const list = walk(New()).find(x => x.props?.onAccept);
    const payload = { campaignId: id(100), addedAccountsId: id(1), username: 'account', campaignResponse: action };
    list.props[action === 'accept' ? 'onAccept' : 'onDecline'](payload);
    assert.deepEqual(writes[0].body, payload); assert.equal(navigation.length, 0, 'pending/refusal does not clear context');
    writes[0].callbacks.onSuccess(); assert.equal(navigation.length, 1); assert.equal(navigation[0][0].search, ''); assert.equal(navigation[0][1].state, null);
  }
});

test('stage 8 prepared Bundle decision and real API boundary remain gated; standalone/Offer PATCH identity is unchanged', async () => {
  const raw = { ...bundle(), isPaused: false };
  const off = harness(); const read = off(p + 'model/promo-read.ts'); const promo = read.readDetailedPromos([raw], 'new')[0];
  assert.equal(off(p + 'model/bundle-promo-decision.ts').buildBundleDecisionRequest(promo, 'accept'), null);
  // Mock gate only in an isolated pure fixture, never in the application config.
  const internal = harness({ '@/shared/config/bundle-availability': { BUNDLES_AVAILABLE: true } });
  const make = internal(p + 'model/bundle-promo-decision.ts').buildBundleDecisionRequest;
  const candidate = make(promo, 'accept');
  assert.deepEqual(candidate, { campaignId: id(100), campaignBundleId: id(400), selectedAddedAccountsIds: [id(1),id(2)], campaignResponse: 'accept' });
  assert.equal('bundleId' in candidate, false); assert.equal('addedAccountsId' in candidate, false);
  assert.equal(make({ ...promo, campaignBundleId: undefined }, 'accept'), null);
  const calls = []; const apiLoad = harness({ '../../api': { __esModule: true, default: { patch: async (...args) => calls.push(args) } } });
  const api = apiLoad('src/api/influencer/promos/influencer-promos.api.ts');
  await assert.rejects(api.conformationInfluencerPromo(candidate), /unavailable/);
  await assert.rejects(api.conformationInfluencerPromo({ campaignId: id(100), addedAccountsId: id(1), bundleId: id(500), campaignResponse: 'accept' }), /unavailable/);
  await assert.rejects(api.createInfluencerPromoReview({ campaignId: id(100), addedAccountsId: id(1), bundleId: id(500), username: 'account', data: {} }), /unavailable/);
  assert.equal(calls.length, 0);
  const body = { campaignId: id(100), addedAccountsId: id(2), username: 'account', campaignResponse: 'decline' };
  await api.conformationInfluencerPromo(body); assert.deepEqual(calls[0].slice(0, 2), ['/promos/requests', body]); assert.equal(calls[0][2].silentReadError, true);
});

// Run: node --test tests/campaign-view-regressions.test.cjs
// No test runner dependencies: transpile the real modules in memory and mock API/UI boundaries.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { create } = require('zustand');
const { QueryClient, QueryObserver } = require('@tanstack/query-core');

const root = path.resolve(__dirname, '..');
function load(file, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const mockRequire = (name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    if (name.endsWith('/campaign-content.transport') || name === './campaign-content.transport') return contentTransport;
    if (name === '@/widgets/client-side/campaign-tables/model/account-taxonomy') return taxonomy;
    if (/\.(scss|svg|png)$/.test(name)) return name;
    if (['react', 'react/jsx-runtime', 'zustand', 'zustand/middleware', 'bson'].includes(name)) return require(name);
    throw new Error(`Unmocked dependency ${name} in ${file}`);
  };
  new Function('require', 'module', 'exports', ...Object.keys(globals), code)(mockRequire, module, module.exports, ...Object.values(globals));
  return module.exports;
}

// Exercises hook dependencies/state and React element output without a browser DOM.
function hookHarness() {
  const slots = [];
  let cursor = 0;
  let effects = [];
  const changed = (old, next) => !old || !next || old.length !== next.length || old.some((value, i) => !Object.is(value, next[i]));
  const hooks = {
    ...React,
    useState(initial) {
      const i = cursor++;
      if (!slots[i]) slots[i] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[i].value, (next) => { slots[i].value = typeof next === 'function' ? next(slots[i].value) : next; }];
    },
    useRef(initial) {
      const i = cursor++;
      if (!slots[i]) slots[i] = { current: initial };
      return slots[i];
    },
    useMemo(fn, deps) {
      const i = cursor++;
      if (!slots[i] || changed(slots[i].deps, deps)) slots[i] = { value: fn(), deps };
      return slots[i].value;
    },
    useCallback(fn, deps) { return hooks.useMemo(() => fn, deps); },
    useEffect(fn, deps) {
      const i = cursor++;
      if (!slots[i] || changed(slots[i].deps, deps)) {
        const previous = slots[i];
        slots[i] = { deps };
        effects.push(() => { previous?.cleanup?.(); slots[i].cleanup = fn(); });
      }
    },
  };
  return {
    hooks,
    render: (fn) => { cursor = 0; effects = []; return fn(); },
    flush: () => { effects.forEach((fn) => fn()); effects = []; },
    unmount: () => { slots.forEach((slot) => slot?.cleanup?.()); },
  };
}

function bindStore(store) {
  return Object.assign((selector) => selector ? selector(store.getState()) : store.getState(), store);
}
const hookCreate = (initializer) => initializer ? bindStore(create(initializer)) : (fn) => bindStore(create(fn));
const contentTransport = load('src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-content.transport.ts');
const offerHelpers = load('src/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer.ts');
const offerModule = '@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer';
const totalsModule = '@/entities/client-side/campaign-creator-page/campaign-builder/model/calc-builder-total';
const totals = load('src/entities/client-side/campaign-creator-page/campaign-builder/model/calc-builder-total.ts', { './selected-offer': offerHelpers });
const common = {
  [offerModule]: offerHelpers,
  [totalsModule]: totals,
  './selected-offer': offerHelpers,
  './calc-builder-total': totals,
  zustand: { create: hookCreate },
  'zustand/middleware': { devtools: (fn) => fn },
  '@/client-side/widgets/add-influencer-build-campaign/add-to-proposal/bc-prooced': { getGroupBySocial: () => 'main' },
  '@/client-side/utils': { calcGroupPrices: () => ({ groupPrices: {} }), buildProposalPatchBody: () => ({}), pickPrice: () => 0 },
};
const accounts = (count) => Array.from({ length: count }, (_, i) => ({ _id: `p${i}`, addedAccountsId: `p${i}`, socialMedia: 'instagram', postLink: `https://example.test/post/${i}` }));
const content = [{ _id: 'content', socialMediaGroup: 'main', mainLink: 'https://example.test/video', descriptions: [] }];
const regular = (id, count = 2) => ({ campaignId: id, campaignName: `Campaign ${id}`, status: 'distributing', addedAccounts: accounts(count), campaignContent: content });
const proposal = (id, optionIndex) => ({ campaignId: id, campaignName: `Proposal ${id}`, existingOptions: [0, 1, 2], selectedOption: { optionIndex, addedAccounts: accounts(2), campaignContent: content } });

function fetchFixture() {
  const pending = [];
  const request = (kind, id, option) => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    pending.push({ kind, id, option, resolve, reject });
    return promise;
  };
  const mapper = load('src/client-side/utils/getCampaign.utils.ts');
  const { useFetchCampaign: store } = load('src/client-side/store/campaign-page/fetch-campaign.ts', {
    zustand: { create: hookCreate },
    '@/api/client/campaign/campaign.api': {
      getCampaign: (id) => request('regular', id).then((data) => ({ data })),
      getProposalCampaign: (id, option) => request('proposal', id, option).then((data) => ({ data: { data } })),
      postAddProposalOption: (id) => request('addOption', id),
    },
    '@/api/client/campaign/draft.api': { getCampaignDraft: (id) => request('draft', id) },
    '@/client-side/utils/getCampaign.utils': mapper,
  }, { console: { log() {} } });
  return { store, pending };
}

function editingStores(fetchStore) {
  const update = load('src/client-side/store/proposal-store/updateCampaign.ts', common).useUpdateCampaign;
  const dependencies = { ...common, '@/client-side/store': { useUpdateCampaign: update } };
  return {
    useFetchCampaign: fetchStore,
    useUpdateCampaign: update,
    useStrategyCampaignStore: load('src/client-side/store/strategy-store/strategy-content.ts', dependencies).useStrategyCampaignStore,
    useDraftCampaignStore: load('src/client-side/store/draft-store/draft-content.ts', dependencies).useDraftCampaignStore,
    useProposalAccountsStore: load('src/client-side/store/proposal-store/proposal-accounts.ts', dependencies).useProposalAccountsStore,
  };
}

test('late responses, errors and loading cannot replace a newer resource, option or request', async () => {
  for (const scenario of ['campaign', 'same ID', 'option', 'kind']) {
    const { store, pending } = fetchFixture();
    const first = scenario === 'option' ? store.getState().setProposalOption('A', 0) : store.getState().setCampaign('A');
    const second = scenario === 'option' ? store.getState().setProposalOption('A', 1)
      : scenario === 'kind' ? store.getState().setDraft('A') : store.getState().setCampaign(scenario === 'same ID' ? 'A' : 'B');
    const fresh = scenario === 'option' ? proposal('A', 1) : scenario === 'kind' ? { _id: 'A', addedAccounts: accounts(2), campaignContent: content } : regular(scenario === 'same ID' ? 'A' : 'B');
    pending[1].resolve(fresh);
    const accepted = await second;
    pending[0].resolve(regular('A', 1));
    assert.equal(await first, null, scenario);
    assert.equal(store.getState().data, accepted, scenario);
    assert.equal(store.getState().isLoading, false);
    assert.equal(store.getState().error, null);
  }
  const { store, pending } = fetchFixture();
  const old = store.getState().setProposalOption('A', 0);
  const current = store.getState().setProposalOption('B', 0);
  pending[0].reject(new Error('old failure'));
  assert.equal(await old, null);
  assert.equal(store.getState().isLoading, true);
  assert.equal(store.getState().error, null);
  const error = new Error('current failure');
  pending[1].reject(error);
  await current;
  assert.equal(store.getState().error, error);
  assert.equal(store.getState().requestKey, 'proposal:B:0');
  assert.equal(store.getState().isLoading, false);
});

test('successful option POST reports success without changing a newer GET loading or error', async () => {
  for (const target of ['same campaign', 'other campaign', 'failed GET']) {
    const { store, pending } = fetchFixture();
    const initial = store.getState().setProposalOption('A', 0);
    pending[0].resolve(proposal('A', 0));
    await initial;
    const write = store.getState().addProposalOption('A', false);
    const read = target === 'same campaign' ? store.getState().setProposalOption('A', 1) : store.getState().setCampaign('B');
    if (target === 'failed GET') {
      pending[2].reject(new Error('GET failed'));
      await read;
    }
    const snapshot = store.getState();
    pending[1].resolve({});
    assert.equal(await write, true, target);
    assert.equal(store.getState(), snapshot, 'old POST must not touch current loading/error/data');
    if (target !== 'failed GET') {
      assert.equal(store.getState().isLoading, true);
      pending[2].resolve(target === 'same campaign' ? proposal('A', 1) : regular('B'));
      await read;
    }
  }
});

test('add-option continuation respects current campaign, unmount and an actual POST failure', async () => {
  for (const scenario of ['same campaign', 'other campaign', 'unmounted', 'POST failure']) {
    const { store, pending } = fetchFixture();
    const initial = store.getState().setProposalOption('A', 0);
    pending[0].resolve(proposal('A', 0));
    await initial;
    const stores = editingStores(store);
    stores.useUpdateCampaign.getState().setField('content', 'mainLink', 'unsaved');
    const draft = stores.useUpdateCampaign.getState();
    const harness = hookHarness();
    const updates = [];
    const notifications = [];
    const { useCampaignPageActions } = load('src/client-side/pages/campaign/model/use-campaign-page-actions.ts', {
      react: harness.hooks,
      'react-router-dom': { useNavigate: () => () => { throw new Error('unexpected navigation'); } },
      'react-toastify': { toast: { success: (text) => notifications.push(['success', text]), error: (text) => notifications.push(['error', text]) } },
      '@/api/client/campaign/campaign.api': {}, '@/api/client/file/get-pdf': {}, '@/api/client/file/get-csv': {},
      '@/client-side/store': stores, '@/client-side/utils': common['@/client-side/utils'],
      './campaign-page.utils': load('src/client-side/pages/campaign/model/campaign-page.utils.ts'),
      '@/client-side/widgets/campaign/model/campaign-content.utils.ts': load('src/client-side/widgets/campaign/model/campaign-content.utils.ts', common),
    }, { console: { error() {} } });
    const setters = Object.fromEntries(['setActiveOption', 'setLocalExtraOptions', 'setOptionModal', 'setIsRequesting', 'setIsRequestSent', 'setIsRequestingPDF'].map((name) => [name, (value) => updates.push([name, value])]));
    const actions = harness.render(() => useCampaignPageActions({ data: store.getState().data, activeOption: 0, localExtraOptions: [], textareaValue: '', ...setters }));
    harness.flush();
    const operation = actions.onAddOption(false);
    const beforeCompletion = [...updates];
    const read = scenario === 'same campaign' ? store.getState().setProposalOption('A', 1)
      : scenario === 'other campaign' ? store.getState().setCampaign('B') : undefined;
    if (scenario === 'unmounted') harness.unmount();
    if (scenario === 'POST failure') pending[1].reject(new Error('POST failed'));
    else pending[1].resolve({});
    await new Promise(setImmediate);
    if (scenario === 'same campaign') {
      assert.equal(pending[3].id, 'A');
      assert.equal(pending[3].option, 3);
      pending[3].resolve(proposal('A', 3));
    }
    await operation;
    if (scenario === 'other campaign' || scenario === 'unmounted') {
      assert.deepEqual(updates, beforeCompletion);
      assert.deepEqual(notifications, []);
      assert.equal(stores.useUpdateCampaign.getState(), draft);
      assert.equal(pending.length, scenario === 'other campaign' ? 3 : 2, 'no stale reload');
    } else if (scenario === 'POST failure') {
      assert.deepEqual(notifications.map(([kind]) => kind), ['error']);
      assert.equal(stores.useUpdateCampaign.getState(), draft);
      assert.equal(pending.length, 2, 'failed POST must not reload or select a new option');
    } else {
      assert.deepEqual(notifications.map(([kind]) => kind), ['success']);
      assert.equal(store.getState().data.selectedOption.optionIndex, 3);
    }
    if (read) {
      pending[2].resolve(scenario === 'same campaign' ? proposal('A', 1) : regular('B'));
      await read;
    }
  }
});

test('entry revalidates the same campaign, response changes do not loop, and drafts survive', async () => {
  const { store, pending } = fetchFixture();
  const stores = editingStores(store);
  const localAccounts = [...accounts(1), { ...accounts(1)[0], _id: 'local', addedAccountsId: 'local' }];
  stores.useStrategyCampaignStore.getState().initCampaign('A', localAccounts, content);
  stores.useStrategyCampaignStore.getState().updateContentMainLink('A', 'content', 'unsaved');
  stores.useDraftCampaignStore.getState().initCampaign('A', localAccounts, content);
  stores.useProposalAccountsStore.getState().setCurrentCampaignId('A');
  stores.useProposalAccountsStore.getState().initOption(1, localAccounts, content);
  stores.useUpdateCampaign.getState().setField('content', 'taggedUser', 'unsaved');
  const before = Object.fromEntries(Object.entries(stores).filter(([key]) => key !== 'useFetchCampaign').map(([key, value]) => [key, value.getState()]));
  let session = { id: 'A', status: 'distributing' };
  let location = { key: 'entry-1' };
  const navigate = () => {};
  const harness = hookHarness();
  const { useCampaignPageBootstrap } = load('src/client-side/pages/campaign/model/use-campaign-page-bootstrap.ts', {
    react: harness.hooks,
    'react-router-dom': { useLocation: () => location, useNavigate: () => navigate },
    '@/client-side/store': stores,
    './campaign-page.utils': { parseLastCampaignSession: () => session },
  });
  const render = () => { harness.render(() => useCampaignPageBootstrap(store.getState().data)); harness.flush(); };
  render();
  assert.equal(pending.length, 1);
  pending[0].resolve(regular('A', 1));
  await new Promise(setImmediate);
  render(); render();
  assert.equal(pending.length, 1, 'no GET caused by data/init state updates');
  location = { key: 'entry-2' }; // Dashboard -> the same campaign again.
  render();
  assert.equal(pending.length, 2);
  pending[1].resolve(regular('A', 2));
  await new Promise(setImmediate);
  render();
  assert.equal(store.getState().data.addedAccounts.length, 2);
  session = { id: 'A', status: 'proposal', optionIndex: 1 };
  location = { key: 'entry-3' };
  render();
  assert.equal(pending[2].option, 1);
  pending[2].resolve(proposal('A', 1));
  await new Promise(setImmediate);
  render();
  session = { id: 'A', status: 'draft' };
  location = { key: 'entry-4' };
  render();
  assert.equal(pending[3].kind, 'draft');
  pending[3].resolve({ _id: 'A', addedAccounts: accounts(2), campaignContent: content });
  await new Promise(setImmediate);
  render();
  for (const [key, snapshot] of Object.entries(before)) assert.equal(stores[key].getState(), snapshot, `${key} retains unsaved state`);
});

test('Insights use fresh accounts while regular Strategy, proposal and draft retain local edits', () => {
  const stores = editingStores(fetchFixture().store);
  const local = [...accounts(1), { _id: 'local', addedAccountsId: 'local', socialMedia: 'instagram' }];
  stores.useStrategyCampaignStore.getState().initCampaign('A', local, content);
  stores.useDraftCampaignStore.getState().initCampaign('A', local, content);
  stores.useProposalAccountsStore.getState().initOption(1, local, content);
  stores.useUpdateCampaign.getState().setField('content', 'mainLink', 'unsaved');
  const harness = hookHarness();
  const helpers = load('src/client-side/widgets/campaign/model/campaign-content.utils.ts', common);
  const { useCampaignContentData } = load('src/client-side/widgets/campaign/model/use-campaign-content-data.ts', {
    react: harness.hooks, '@/client-side/store': stores,
    '@/client-side/hooks': { useGroupPromos: () => ({}) },
    './campaign-content.utils': helpers, '@/client-side/utils': common['@/client-side/utils'],
  }, { console: { log() {} } });
  const fresh = { ...regular('A', 3), kind: 'regular' };
  const resolved = (campaign, flag) => harness.render(() => useCampaignContentData({ campaign, view: 0, flag }));
  assert.equal(resolved(fresh, false).accounts, fresh.addedAccounts);
  assert.equal(resolved(fresh, true).accounts, local);
  assert.equal(resolved({ ...proposal('A', 1), kind: 'proposal' }, true).accounts, local);
  assert.equal(resolved({ kind: 'draft', draftId: 'A', addedAccounts: accounts(3), campaignContent: content }, true).accounts, local);
  assert.equal(resolved(fresh, true).content[0].mainLink, 'unsaved');

  const LiveViewCardInsight = () => {};
  const TableDistributingInsight = () => {};
  const { CampaignContentView } = load('src/client-side/widgets/campaign/ui/campaign-content-view.tsx', {
    react: harness.hooks,
    '../model/use-campaign-content-data': { useCampaignContentData },
    '../live-view-card/live-view': { LiveViewCard() {} },
    '../live-view-card/live-view-card-insight': { LiveViewCardInsight },
    '../tables/table-proposal': { TableProposal() {} },
    '../tables/table-strategy': { TableStrategy() {} },
    '../tables/table-draft': { TableDraft() {} },
    '../tables/table-insight': { TableDistributingInsight },
  });
  const cards = harness.render(() => CampaignContentView({ campaign: fresh, view: 0, flag: false }));
  assert.deepEqual(elements(cards).filter((node) => node.type === LiveViewCardInsight).map((node) => node.props.item), fresh.addedAccounts);
  const table = harness.render(() => CampaignContentView({ campaign: fresh, view: 1, flag: false }));
  assert.equal(elements(table).find((node) => node.type === TableDistributingInsight).props.campaign.addedAccounts, fresh.addedAccounts);
});

function elements(tree) {
  if (Array.isArray(tree)) return tree.flatMap(elements);
  if (!React.isValidElement(tree)) return [];
  return [tree, ...elements(tree.props.children)];
}

test('public flows isolate URL data, reset proposal option and expose initial/refetch errors with Retry', async () => {
  const { store, pending } = fetchFixture();
  let params = { id: 'A', type: 'instagram' };
  let query = { data: regular('A'), isLoading: false, isError: false, isFetching: false, refetch: () => { retries++; } };
  let retries = 0;
  let enabled;
  let harness = hookHarness();
  const hooks = Object.fromEntries(['useState', 'useMemo', 'useEffect'].map((name) => [name, (...args) => harness.hooks[name](...args)]));
  const UI = { Container() {}, Loader() {}, ButtonMain() {} };
  const widgets = { CampaignTablePageShare() {}, ProposalCampaignPageShare() {} };
  const OptionsSlider = () => {};
  const { CampaignSharePage } = load('src/client-side/pages/campaign-share/campaig-share-page.tsx', {
    react: { ...React, ...hooks }, '@/components': UI, 'react-router-dom': { useParams: () => params },
    '@/client-side/react-query': { useShareCampaignQuery: (_id, options) => { enabled = options.enabled; return query; } },
    '@/client-side/widgets': widgets, '@/client-side/store': { useFetchCampaign: store },
    '@/client-side/widgets/campaign-share/components/option-slider': { OptionsSlider },
    '@/client-side/ui': { Bar() {}, BarSection() {}, ToggleTables() {}, ViewAudience() {}, ViewChange() {} },
    '@/client-side/pages/campaign-share/model/campaign-campaign.helpers.ts': { getVisibleCampaignStats: () => ({}) },
  });
  let key;
  const render = () => {
    const wrapper = CampaignSharePage();
    if (key !== wrapper.key) { key = wrapper.key; harness = hookHarness(); }
    return harness.render(() => wrapper.type(wrapper.props));
  };
  store.setState({ data: { ...proposal('OTHER', 2), kind: 'proposal' }, dataKey: 'proposal:OTHER:2', requestKey: 'proposal:OTHER:2', isLoading: true, error: new Error('unrelated') });
  let tree = render(); harness.flush();
  assert.equal(enabled, true);
  assert.equal(elements(tree).find((node) => node.type === widgets.CampaignTablePageShare).props.campaign, query.data);
  assert.equal(elements(tree).some((node) => node.type === widgets.ProposalCampaignPageShare || node.props.role === 'alert'), false);
  params = { id: 'B', type: 'proposal' };
  tree = render(); harness.flush();
  assert.equal(enabled, false);
  assert.equal(tree.type, UI.Loader);
  assert.equal(pending[0].id, 'B');
  assert.equal(pending[0].option, 0);
  pending[0].resolve(proposal('B', 0));
  await new Promise(setImmediate);
  tree = render(); harness.flush();
  assert.equal(pending.length, 1, 'response does not cause another proposal GET');
  assert.equal(elements(tree).some((node) => node.type === widgets.CampaignTablePageShare), false);
  elements(tree).find((node) => node.type === OptionsSlider).props.onClickOption(2);
  tree = render(); harness.flush();
  assert.equal(tree.type, UI.Loader);
  assert.equal(pending[1].option, 2);
  params = { id: 'C', type: 'proposal' };
  render(); harness.flush();
  assert.equal(pending[2].option, 0);
  pending[2].resolve(proposal('C', 0));
  await new Promise(setImmediate);
  pending[1].resolve(proposal('B', 2));
  await new Promise(setImmediate);
  tree = render(); harness.flush();
  assert.equal(elements(tree).find((node) => node.type === widgets.ProposalCampaignPageShare).props.campaign.campaignId, 'C');
  params = { id: 'D', type: 'instagram' };
  query = { ...query, data: undefined, isError: true };
  tree = render(); harness.flush();
  assert.equal(elements(tree).some((node) => node.props.role === 'alert'), true);
  assert.equal(elements(tree).some((node) => node.type === widgets.ProposalCampaignPageShare), false);
  elements(tree).find((node) => node.type === UI.ButtonMain).props.onClick();
  assert.equal(retries, 1);
  query = { ...query, data: regular('D') };
  tree = render();
  assert.equal(elements(tree).some((node) => node.props.role === 'alert'), true);
  assert.equal(elements(tree).find((node) => node.type === widgets.CampaignTablePageShare).props.campaign.campaignId, 'D');
  elements(tree).find((node) => node.type === UI.ButtonMain).props.onClick();
  assert.equal(retries, 2);
});

test('public query revalidates each mount even with fresh cache and retains data on refresh error', async () => {
  let calls = 0;
  let fail = false;
  const { useShareCampaignQuery } = load('src/client-side/react-query/useShareCampaignQuery.ts', {
    '@tanstack/react-query': { useQuery: (options) => options },
    '@/api/client/campaign/campaign.api': { getShareLink: async () => { calls++; if (fail) throw new Error('refresh'); return { data: regular('A') }; } },
  });
  const client = new QueryClient();
  const options = useShareCampaignQuery('A', { retry: false });
  client.setQueryData(options.queryKey, regular('A', 1));
  const observer = new QueryObserver(client, options);
  let unsubscribe = observer.subscribe(() => {});
  await new Promise(setImmediate);
  assert.equal(calls, 1);
  assert.equal(observer.getCurrentResult().data.addedAccounts.length, 2);
  unsubscribe();
  unsubscribe = observer.subscribe(() => {});
  await new Promise(setImmediate);
  assert.equal(calls, 2);
  fail = true;
  await observer.refetch();
  assert.equal(observer.getCurrentResult().isError, true);
  assert.equal(observer.getCurrentResult().data.addedAccounts.length, 2);
  unsubscribe(); client.clear();
});

test('private published-post card opens the postLink displayed to the user', () => {
  const harness = hookHarness();
  const opened = [];
  const { LiveViewCardInsight } = load('src/client-side/widgets/campaign/live-view-card/live-view-card-insight.tsx', {
    react: harness.hooks, '@/constants/social-medias': { getSocialMediaIcon: () => '' },
    './preview/preview-component': { PreviewPhoto() {} }, '@/shared/ui/modal-video/ModalVideo': { ModalVideo() {} },
    './preview/preview-video-component': { VideoPreview() {} },
  }, { window: { open: (...args) => opened.push(args) }, console: { log() {} } });
  const item = { ...accounts(1)[0], taggedLink: 'https://example.test/tagged' };
  const tree = harness.render(() => LiveViewCardInsight({ item }));
  elements(tree).find((node) => node.props.className === 'live-view-cardInsight__fill-data' && node.props.onClick).props.onClick({ stopPropagation() {} });
  assert.deepEqual(opened, [[item.postLink, '_blank', 'noopener,noreferrer']]);
});

const builderModule = '@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store';
const strategyModule = '@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload';
const saveResultModule = '@/entities/client-side/campaign-draft/api/draft-save-result';
const builderTypesModule = '@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types';
const builderTypes = load('src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types.ts');
const strategyPayloads = load('src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload.ts', { './selected-offer': offerHelpers });
const draftPayloads = load('src/entities/client-side/campaign-creator-page/campaign-builder/model/build-draft-payload.ts', { './selected-offer': offerHelpers });

 // Synthetic structural example from backend code audit 547bcec7251e73239af6f4c96a97d210b52a086a.
 // NOT a captured HTTP response or a Mongo round trip.
 const draftExample = () => JSON.parse(JSON.stringify(require('./fixtures/selected-offer-draft.synthetic.json').data));
 function hydrateFixture(store, draft = draftExample()) {
   const hydration = load('src/entities/client-side/campaign-creator-page/campaign-builder/model/hydrate-campaign-builder-from-draft.ts', {
     './campaign-builder.store': { useCampaignBuilderStore: store }, './campaign-builder.types': builderTypes,
     './selected-offer': offerHelpers, './calc-builder-total': totals,
   });
   hydration.hydrateCampaignBuilderFromDraft(draft);
   return store.getState();
 }
 const contentHelpers = load('src/widgets/client-side/campaign-post-content/model/campaign-post-content.helpers.ts', {
   './campaign-post-content.constants': load('src/widgets/client-side/campaign-post-content/model/campaign-post-content.constants.ts'),
 });

 test('full synthetic GET hydration restores package display, prices, currency, context, sources and row references without cache', () => {
   const draft = draftExample(); const store = builderFixture();
   const state = hydrateFixture(store, draft);
   assert.equal(state.selectedOfferName, 'Example Instagram package');
   assert.deepEqual(state.selectedOfferPrices, { EUR: 90, USD: 97, GBP: 83 });
   assert.equal(state.selectedOfferPrice, 97); assert.equal(state.totalPrice, 124); assert.equal(state.selectedCurrency, '$');
   assert.deepEqual(state.offerCatalogContext, { platform: 'instagram', genre: 'techno' });
   assert.deepEqual(state.selectedAccounts.map((a) => a.source), ['offer', 'offer', 'manual']);
   for (let i = 0; i < 3; i++) {
     assert.equal(state.selectedAccounts[i].accountId, draft.addedAccounts[i].socialAccountId);
     assert.equal(state.selectedAccounts[i].selectionId, draft.addedAccounts[i].selectionId);
     assert.deepEqual(state.selectedAccounts[i].selectedCampaignContentItem, draft.addedAccounts[i].selectedCampaignContentItem);
   }
   assert.deepEqual(state.campaignContent, draft.campaignContent);
   for (const [code, symbol, packagePrice, total] of [['EUR', '€', 90, 115], ['USD', '$', 97, 124], ['GBP', '£', 83, 106]]) {
     store.getState().actions.setSelectedCurrency(code);
     const next = store.getState();
     assert.equal(next.selectedCurrency, symbol); assert.equal(next.selectedOfferPrice, packagePrice);
     assert.equal(next.totalPrice, total); assert.equal(totals.calcBuilderTotal({ ...next, offers: [] }), total);
     assert.equal(next.selectedAccounts[2].price, draft.addedAccounts[2].prices[code]);
     const payload = regularPayload(store, { displayCurrency: next.selectedCurrency });
     assert.equal(payload.displayCurrency, code); assert.equal(payload.campaignPrice, total);
   }
   // Source history is not reconstructed: a saved offer row is removed, not re-created as manual.
   store.getState().actions.selectOffer({ offerId: null });
   assert.deepEqual(store.getState().selectedAccounts.map((a) => a.accountId), [draft.addedAccounts[2].socialAccountId]);
 });

 test('opening another draft clears foreign display and saved membership never follows the current catalogue', () => {
   const store = builderFixture(); const draft = draftExample();
   draft.selectedOffer.currentAccountIds = ['different-current-account'];
   hydrateFixture(store, draft);
   assert.deepEqual(store.getState().selectedOfferAccountIds, draft.selectedOffer.selectedAccountIds);
   const old = { ...draftExample(), _id: 'old', selectedOffer: undefined, displayCurrency: 'EUR' };
   hydrateFixture(store, old);
   const state = store.getState();
   assert.equal(state.selectedOfferId, null); assert.equal(state.selectedOfferName, '');
   assert.equal(state.selectedOfferPrices, null); assert.equal(state.selectedOfferPrice, 0);
   assert.equal(state.selectedOfferIsAvailable, null); assert.equal(state.selectedOfferUnavailableReason, null);
   assert.equal(state.offerCatalogContext, null); assert.equal(state.selectedCurrency, '€');
 });

 test('deleted offer without title or catalogue context remains unavailable, not a free package', () => {
   const draft = draftExample(); const store = builderFixture();
   draft.selectedOffer = { offerId: draft.selectedOffer.offerId, selectedAccountIds: draft.selectedOffer.selectedAccountIds,
     currentAccountIds: [], prices: { EUR: 0, USD: 0, GBP: 0 }, isAvailable: false, unavailableReason: 'offer_not_found' };
   const state = hydrateFixture(store, draft);
   assert.equal(state.selectedOfferName, ''); assert.equal(state.offerCatalogContext, null);
   assert.deepEqual(offerHelpers.getBuilderSelectedOffer(state), {
     offerId: draft.selectedOffer.offerId, selectedAccountIds: draft.selectedOffer.selectedAccountIds,
   });
   assert.throws(() => regularPayload(store, { offerIsAvailable: state.selectedOfferIsAvailable }), offerHelpers.OfferSelectionError);
   const Selection = load('src/widgets/client-side/campaign-post-content/ui/campaign-post-content-selection.tsx', {
     '../model/campaign-post-content.helpers': contentHelpers,
     '@/utils/functions/formatFollowers.ts': { formatFollowers: String },
     '@/constants/social-medias.ts': { getSocialMediaIconPostContent: () => '' },
   }).CampaignPostContentSelection;
   const tree = Selection({ accounts: [], offerAccounts: [], manualAccounts: [], offerPrice: 0, totalPrice: 0,
     offerAvailable: false, onEditSelection() {}, currency: '$' });
   const text = JSON.stringify(tree);
   assert.ok(text.includes('Offer unavailable')); assert.equal(text.includes('Total price: 0'), false);
   draft.selectedOffer.isAvailable = true;
   hydrateFixture(store, draft);
   assert.equal(regularPayload(store, { offerIsAvailable: true }).selectedOffer.offerId, draft.selectedOffer.offerId, 'available zero package is allowed');
 });

 test('content round trip retains selection IDs, second description, brief reference and explicit null', () => {
   const store = builderFixture(); const state = hydrateFixture(store);
   const blocks = contentHelpers.buildBlocksFromCampaignContent({ accounts: state.selectedAccounts, campaignContent: state.campaignContent });
   const payload = contentHelpers.buildCampaignPostContentPayload({ campaignName: state.campaignName, campaignPrice: state.totalPrice,
     accounts: state.selectedAccounts, blocks });
   assert.equal(payload.campaignContent[0]._id, state.campaignContent[0]._id);
   assert.deepEqual(payload.campaignContent[0].descriptions, state.campaignContent[0].descriptions);
   assert.deepEqual(payload.campaignContent[0].additionalBrief, state.campaignContent[0].additionalBrief);
   for (let i = 0; i < 3; i++) {
     assert.equal(payload.addedAccounts[i].selectionId, state.selectedAccounts[i].selectionId);
     assert.deepEqual(payload.addedAccounts[i].selectedCampaignContentItem, state.selectedAccounts[i].selectedCampaignContentItem);
   }
   store.getState().actions.syncSelectedAccountsContent(payload.addedAccounts);
   for (let i = 0; i < 3; i++) assert.deepEqual(store.getState().selectedAccounts[i].selectedCampaignContentItem, state.selectedAccounts[i].selectedCampaignContentItem);
   const ordinary = regularPayload(store);
   assert.equal(ordinary.addedAccounts[2].selectedCampaignContentItem.additionalBriefId, null);
   assert.equal(ordinary.addedAccounts[1].selectedCampaignContentItem.descriptionId, state.campaignContent[0].descriptions[1]._id);
 });

 test('draft transport keeps selection rows and source bindings; ordinary transport carries only ordinary row fields and offer identity', async () => {
   const store = builderFixture(); const state = hydrateFixture(store);
   const expected = { offerId: state.selectedOfferId, selectedAccountIds: state.selectedOfferAccountIds };
   const drafts = ['addAccounts', 'addContent'].map((step) => draftPayloads.buildCampaignDraftPayload(state, step));
   drafts.push(strategyPayloads.buildStrategyDraftPayload({ campaignName: state.campaignName, accounts: state.selectedAccounts,
     content: state.campaignContent, selectedOffer: expected, displayCurrency: state.selectedCurrency }));
   for (const payload of drafts) {
     assert.deepEqual(payload.selectedOffer, expected); assert.equal(payload.displayCurrency, 'USD');
     assert.deepEqual(payload.addedAccounts.map((r) => r.selectionId), state.selectedAccounts.map((r) => r.selectionId));
     assert.deepEqual(payload.addedAccounts.map((r) => r.source), ['offer', 'offer', 'standalone']);
     assert.ok(payload.addedAccounts.slice(0, 2).every((r) => r.offerId === expected.offerId && !r.bundleId));
     assert.equal(Object.hasOwn(payload.addedAccounts[2], 'offerId'), false);
     assert.equal(Object.hasOwn(payload.addedAccounts[2], 'bundleId'), false);
     assert.ok(payload.addedAccounts.every((r) => !Object.hasOwn(r, 'selectedContent')));
   }
   const polluted = regularPayload(store, { displayCurrency: 'USD' });
   polluted.addedAccounts[0] = { ...polluted.addedAccounts[0], selectionId: 'forbidden', source: 'offer', offerId: expected.offerId };
   const calls = [];
   await checkout.submitCheckout({ context: { kind: 'builder', draftId: state.draftId }, base: polluted, paymentDetails: paymentValues,
     postCampaign: async (body) => { calls.push(['post', body]); return { status: 201, data: { statusCode: 201, message: 'Success' } }; },
     approveProposal: async () => assert.fail(), deleteDraft: async (id) => calls.push(['delete', id]), clearDraft: (id) => calls.push(['clear', id]) });
   const sent = calls[0][1];
   assert.deepEqual(sent.selectedOffer, expected); assert.equal(sent.displayCurrency, 'USD');
   for (const row of sent.addedAccounts) for (const key of ['selectionId', 'source', 'offerId', 'addedAccountsId']) assert.equal(Object.hasOwn(row, key), false);
   assert.deepEqual(calls.slice(1), [['delete', state.draftId], ['clear', state.draftId]], 'success needs no data or campaignId');
 });

 test('duplicate saved selections stay distinct with their content and block ordinary checkout', () => {
   const draft = draftExample(); const store = builderFixture();
   const second = { ...draft.addedAccounts[0], selectionId: '000000000000000000000399',
     selectedCampaignContentItem: { ...draft.addedAccounts[1].selectedCampaignContentItem } };
   draft.addedAccounts.push(second);
   hydrateFixture(store, draft);
   const state = store.getState();
   assert.equal(state.selectedAccounts.length, 4);
   const blocks = contentHelpers.buildBlocksFromCampaignContent({ accounts: state.selectedAccounts, campaignContent: state.campaignContent });
   const mapped = contentHelpers.buildCampaignPostContentPayload({ campaignName: state.campaignName, campaignPrice: state.totalPrice,
     accounts: state.selectedAccounts, blocks });
   assert.equal(mapped.addedAccounts.length, 4); assert.equal(mapped.addedAccounts[3].selectionId, second.selectionId);
   assert.deepEqual(mapped.addedAccounts[3].selectedCampaignContentItem, second.selectedCampaignContentItem);
   store.getState().actions.syncSelectedAccountsContent(mapped.addedAccounts);
   assert.deepEqual(store.getState().selectedAccounts[0].selectedCampaignContentItem, draft.addedAccounts[0].selectedCampaignContentItem);
   assert.deepEqual(store.getState().selectedAccounts[3].selectedCampaignContentItem, second.selectedCampaignContentItem);
   assert.throws(() => regularPayload(store), offerHelpers.OfferSelectionError);
 });

 test('legacy full draft uses package price, chosen currency and exact saved content references', () => {
   const fixture = paymentFixture({ path: '/client/campaign/payment', query: 'draft=own' }); const draft = draftExample();
   fixture.draft.getState().initCampaign('own', draft.addedAccounts, draft.campaignContent, {
     campaignName: draft.campaignName, selectedOffer: draft.selectedOffer, displayCurrency: draft.displayCurrency,
   });
   const payload = fixture.draft.getState().getCampaignPayload('own', 'foreign', 'bank_card');
   assert.equal(payload.campaignPrice, 124); assert.equal(payload.displayCurrency, 'USD');
   assert.deepEqual(payload.selectedOffer, { offerId: draft.selectedOffer.offerId, selectedAccountIds: draft.selectedOffer.selectedAccountIds });
   for (let i = 0; i < 3; i++) assert.deepEqual(payload.addedAccounts[i].selectedCampaignContentItem, draft.addedAccounts[i].selectedCampaignContentItem);
   assert.equal(fixture.draft.getState().getCampaignPriceBreakdown('own').currency, 'USD');
 });

test('each additional or unknown structured Offer error keeps payment data with no fallback or cleanup', async () => {
   for (const reason of ['offer_selection_invalid', 'offer_account_unavailable', 'offer_price_invalid', 'future_offer_reason']) {
     const fixture = paymentFixture({ postError: { response: { status: 400, data: { invalidOffer: { reason } } } } });
     fixture.builder.getState().actions.setDraftMeta({ draftId: 'own', draftStep: 'strategyTable' });
     const before = fixture.builder.getState(); let tree = fixture.render(); fixture.harness.flush();
     await elements(tree).find((n) => n.type === fixture.FormPayment).props.onSubmit(paymentValues);
     tree = fixture.render();
     assert.equal(fixture.builder.getState(), before);
     assert.equal(fixture.calls.filter(([kind]) => kind === 'post').length, 1);
     assert.equal(fixture.calls.some(([kind]) => kind === 'delete'), false);
     assert.ok(elements(tree).some((n) => n.type === fixture.Modal));
     assert.ok(elements(tree).some((n) => n.type === fixture.FormPayment));
     assert.deepEqual(fixture.notifications, []);
   }
 });

test('real proceed summary uses restored package maps with an empty query cache and persists the selected UI currency', () => {
  const store = builderFixture(); hydrateFixture(store);
  const harness = hookHarness(); const navigated = [];
  let selectedCurrency = { key: '€', currency: 'EUR' };
  const { useCampaignProceedSummary } = load('src/widgets/client-side/campaign-creator-page/build-campaign/model/use-campaign-proceed-summary.tsx', {
    react: harness.hooks, 'react-router-dom': { useNavigate: () => (url) => navigated.push(url) },
    '@tanstack/react-query': { useQueryClient: () => ({ getQueriesData: () => [] }) },
    [builderModule]: { useCampaignBuilderStore: store }, [totalsModule]: totals,
    '@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params': {
      useBuildCampaignParams: () => ({ selectedCurrency }),
    },
  });
  for (const [code, symbol, amount] of [['EUR', '€', 115], ['USD', '$', 124], ['GBP', '£', 106]]) {
    selectedCurrency = { key: symbol, currency: code };
    const vm = harness.render(() => useCampaignProceedSummary({})); harness.flush();
    assert.equal(vm.totalPrice, amount); assert.equal(vm.canProceed, true);
    vm.handleProceed();
    assert.equal(store.getState().totalPrice, amount); assert.equal(store.getState().selectedCurrency, symbol);
  }
  store.setState({ selectedOfferIsAvailable: false });
  const vm = harness.render(() => useCampaignProceedSummary({}));
  assert.equal(vm.canProceed, false); const count = navigated.length; vm.handleProceed(); assert.equal(navigated.length, count);
});

test('draft save errors with invalidOffer remain local and do not report success or change the campaign', async () => {
  for (const reason of ['offer_not_found', 'offer_unavailable', 'offer_membership_changed', 'account_unavailable']) {
    const store = builderFixture(); const harness = hookHarness(); const errors = []; let posts = 0;
    const before = store.getState();
    const { useSaveCampaignCreatorDraft } = load('src/pages/client-side/campaign-creator-page/model/use-save-campaign-creator-draft.ts', {
      react: harness.hooks, 'react-toastify': { toast: { success: () => assert.fail(), error: (message) => errors.push(message) } },
      '@tanstack/react-query': { useQueryClient: () => ({ invalidateQueries: async () => assert.fail() }) },
      [builderModule]: { useCampaignBuilderStore: store }, [saveResultModule]: saveResults,
      [builderTypesModule]: builderTypes, [offerModule]: offerHelpers,
      '@/entities/client-side/campaign-creator-page/campaign-builder/model/build-draft-payload': draftPayloads,
    });
    const save = async () => { posts++; throw { response: { status: 400, data: { invalidOffer: { reason } } } }; };
    let vm = harness.render(() => useSaveCampaignCreatorDraft({ postCampaignDraft: save })); vm.open();
    vm = harness.render(() => useSaveCampaignCreatorDraft({ postCampaignDraft: save })); await vm.save();
    assert.equal(posts, 1); assert.equal(store.getState(), before); assert.equal(errors.length, 1);
    assert.ok(errors[0].includes('Refresh the catalogue'));
    vm = harness.render(() => useSaveCampaignCreatorDraft({ postCampaignDraft: save })); assert.equal(vm.isOpen, true);
  }
});

const saveResults = load('src/entities/client-side/campaign-draft/api/draft-save-result.ts');
const checkout = load('src/client-side/pages/payment-campaign/checkout-context.ts', { [offerModule]: offerHelpers });
const paymentValues = { firstName: 'Client', lastName: 'Test', country: 'DE', address: 'Address', amount: 70, selectedPaymentMethod: 'bank_card', referenceNumber: 'test-reference' };

test('manual A becomes one offer selection, preserves row/content identity and never returns on deselection', () => {
  const store = builderFixture(); store.getState().actions.reset();
  const actions = store.getState().actions;
  const ref = { campaignContentItemId: 'content-A', descriptionId: 'description-2', additionalBriefId: 'brief-2' };
  actions.togglePromoCard(account('A', { price: 30, prices: { EUR: 30, USD: 32, GBP: 28 }, selectedCampaignContentItem: ref, dateRequest: 'Local date' }));
  const selectionId = store.getState().selectedAccounts[0].selectionId;
  assert.equal(store.getState().totalPrice, 30);
  actions.selectOffer({ offerId: 'pack', offerPrice: 70, accountIds: ['A'], accounts: [account('A')] });
  let state = store.getState();
  assert.equal(state.totalPrice, 70); assert.equal(state.totalPriceReady, true);
  assert.deepEqual(state.selectedPromoCardIds, []);
  assert.equal(state.selectedAccounts.length, 1);
  assert.equal(state.selectedAccounts[0].source, 'offer');
  assert.equal(state.selectedAccounts[0].selectionId, selectionId);
  assert.equal(state.selectedAccounts[0].dateRequest, 'Local date');
  assert.deepEqual(state.selectedAccounts[0].selectedCampaignContentItem, ref);
  actions.togglePromoCard(account('A', { price: 30 }));
  assert.equal(store.getState().selectedAccounts.length, 1, 'included account cannot become standalone again');
  actions.togglePromoCard(account('B', { prices: { EUR: 20, USD: 22, GBP: 18 } }));
  assert.equal(store.getState().totalPrice, 90);
  assert.deepEqual(store.getState().selectedPromoCardIds, ['B']);
  actions.selectOffer({ offerId: null });
  state = store.getState();
  assert.deepEqual(state.selectedAccounts.map((a) => a.accountId), ['B']);
  assert.deepEqual(state.selectedPromoCardIds, ['B']);
  assert.equal(state.totalPrice, 20);
});

test('changing intersecting offers preserves compatible rows and only truly independent selections', () => {
  const store = builderFixture(); store.getState().actions.reset(); const actions = store.getState().actions;
  for (const id of ['B', 'D']) actions.togglePromoCard(account(id, { price: 20 }));
  actions.selectOffer({ offerId: 'first', offerPrice: 70, accountIds: ['A', 'C'], accounts: [account('A'), account('C')] });
  const before = store.getState();
  const c = before.selectedAccounts.find((a) => a.accountId === 'C');
  const b = before.selectedAccounts.find((a) => a.accountId === 'B');
  actions.setSelectedCampaignContentItem('C', { campaignContentItemId: 'content', descriptionId: 'variant', additionalBriefId: null });
  actions.selectOffer({ offerId: 'second', offerPrice: 80, accountIds: ['B', 'C'], accounts: [account('B'), account('C')] });
  const next = store.getState();
  assert.deepEqual(next.selectedPromoCardIds, ['D']);
  assert.deepEqual(next.selectedAccounts.map((a) => a.accountId).sort(), ['B', 'C', 'D']);
  assert.equal(next.selectedAccounts.find((a) => a.accountId === 'B').selectionId, b.selectionId);
  assert.equal(next.selectedAccounts.find((a) => a.accountId === 'C').selectionId, c.selectionId);
  assert.equal(next.selectedAccounts.find((a) => a.accountId === 'C').selectedCampaignContentItem.descriptionId, 'variant');
  assert.equal(next.totalPrice, 100);
  actions.selectOffer({ offerId: null });
  assert.deepEqual(store.getState().selectedAccounts.map((a) => a.accountId), ['D']);
  assert.equal(store.getState().totalPrice, 20);
});

test('account-only currency changes update actual selection state and payload without depending on an Offer', () => {
  const store = builderFixture(); store.getState().actions.reset();
  store.getState().actions.togglePromoCard(account('B', { prices: { EUR: 20, USD: 22, GBP: 18 } }));
  const id = store.getState().selectedAccounts[0].selectionId;
  for (const [code, amount] of [['USD', 22], ['GBP', 18], ['EUR', 20]]) {
    store.getState().actions.setSelectedCurrency(code);
    const state = store.getState();
    assert.equal(state.totalPriceReady, true); assert.equal(state.totalPrice, amount);
    assert.equal(state.selectedAccounts[0].price, amount);
    assert.equal(state.selectedAccounts[0].selectionId, id);
    const payload = regularPayload(store, { displayCurrency: state.selectedCurrency });
    assert.equal(payload.campaignPrice, amount); assert.equal(payload.displayCurrency, code); assert.equal(payload.selectedOffer, null);
  }
  store.getState().actions.togglePromoCard(account('B'));
  assert.equal(store.getState().totalPrice, 0);
});


function strategyFixture(store, { save, toast = { success() {}, error() {} }, view = 0, proposalPost } = {}) {
  const harness = hookHarness(); const navigation = []; const ButtonMain = () => {}; const Bar = () => {};
  const Section = () => {}; const ViewChange = () => {}; const LiveViewCard = () => {};
  const DraftButton = load('src/components/ui/draft-button/draft-button.tsx').DraftButton;
  const useSaveProposal = proposalPost ? load('src/widgets/client-side/campaign-tables/model/use-save-proposal.ts', {
    react: harness.hooks, 'react-toastify': { toast }, [builderModule]: { useCampaignBuilderStore: store },
    [strategyModule]: strategyPayloads,
    '@/entities/client-side/campaign-strategy-page/api/save-proposal.ts': load('src/entities/client-side/campaign-strategy-page/api/save-proposal.ts', {
      '@/api/api.ts': { post: proposalPost },
    }),
  }).useSaveProposal : () => ({});
  const { CampaignStrategyPage } = load('src/pages/client-side/campaign-strategy-page/ui/campaign-strategy-page.tsx', {
    react: harness.hooks, '@/components': { ButtonMain }, 'react-router-dom': { useNavigate: () => (url) => navigation.push(url) },
    '@components/ui/modal-fix/Modal': {}, [builderModule]: { useCampaignBuilderStore: store },
    '../model/campaign-strategy.helpers': load('src/pages/client-side/campaign-strategy-page/model/campaign-strategy.helpers.ts'),
    '@/widgets/client-side/campaign-tables/ui/campaign-strategy-section': { CampaignStrategySection: Section },
    '@/features/client-side/campaign-tables/model/use-campaign-strategy-view-params': { useCampaignStrategyViewParams: () => ({ view }) },
    '@/features/client-side/campaign-tables/view-change/ui/view-change': { ViewChange }, '@/features/client-side/campaign-tables/view-audience/ui/view-audince': {},
    [strategyModule]: strategyPayloads, [offerModule]: offerHelpers, [saveResultModule]: saveResults, [builderTypesModule]: builderTypes,
    '@/widgets/client-side/campaign-tables/ui/live-view-card/ui/live-view-card': { LiveViewCard },
    '@/widgets/client-side/campaign-tables/model/use-save-proposal.ts': { useSaveProposal },
    '@/widgets/client-side/campaign-tables/model/use-proposal-share.ts': { useProposalShare: () => ({}) },
    '@/widgets/client-side/campaign-tables/ui/bar-campaigns/ui/bar.tsx': { Bar },
    '@/widgets/client-side/campaign-tables/ui/bar-campaigns/model/campaign-strategy-bar.helpers.ts': load('src/widgets/client-side/campaign-tables/ui/bar-campaigns/model/campaign-strategy-bar.helpers.ts', {
      '@/utils/functions/formatFollowers': { formatFollowers: String },
    }),
    '@/widgets/client-side/campaign-tables/ui/check-box-row/ui/checkbox.tsx': {},
    '@/entities/client-side/campaign-draft/api/campaign-draft.api.ts': { postCampaignDraft: save },
    'react-toastify': { toast },
    '@components/ui/draft-button/draft-button.tsx': { DraftButton },
  }, { console: { log() {} } });
  return { render: () => harness.render(() => CampaignStrategyPage()), harness, navigation, ButtonMain, Bar, DraftButton, Section, ViewChange, LiveViewCard };
}

test('real Remove this selection handler -> content submit -> strategy -> payment keeps current rows, content and total', async () => {
  const store = builderFixture(); const draft = draftExample();
  const extra = { ...draft.addedAccounts[2], selectionId: '000000000000000000000399',
    selectedCampaignContentItem: { ...draft.addedAccounts[1].selectedCampaignContentItem } };
  draft.addedAccounts.push(extra);
  hydrateFixture(store, draft);
  const before = store.getState();
  assert.equal(before.totalPrice, 151);
  const staleBlocks = contentHelpers.buildBlocksFromCampaignContent({ accounts: before.selectedAccounts, campaignContent: before.campaignContent });
  const stalePayload = contentHelpers.buildCampaignPostContentPayload({ campaignName: before.campaignName,
    campaignPrice: before.totalPrice, accounts: before.selectedAccounts, blocks: staleBlocks });
  const harness = hookHarness(); const navigation = []; const Page = () => {};
  const { CampaignPostContentRoute } = load('src/pages/client-side/campaign-post-content/ui/campaign-post-content-route.tsx', {
    react: harness.hooks, 'react-router-dom': { useNavigate: () => (url) => navigation.push(url), useSearchParams: () => [new URLSearchParams()] },
    '@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page.tsx': { CampaignPostContentPage: Page },
    [builderModule + '.ts']: { useCampaignBuilderStore: store },
    '@/entities/client-side/campaign/store/campaign.store': { useCampaignStore: (select) => select({ editable: null }) },
    '@/components': {}, '@/pages/client-side/campaign-post-content/model/build-proposal-accounts.ts': {},
  });
  let tree = harness.render(() => CampaignPostContentRoute());
  const remove = elements(tree).filter((n) => n.type === 'button' && n.props.children === 'Remove this selection');
  assert.equal(remove.length, 2);
  remove[0].props.onClick();
  assert.equal(store.getState().totalPrice, 124);
  assert.equal(store.getState().selectedAccounts.length, 3);
  assert.equal(store.getState().selectedAccounts.some((a) => a.selectionId === draft.addedAccounts[2].selectionId), false);
  assert.deepEqual(store.getState().selectedAccounts.find((a) => a.selectionId === extra.selectionId).selectedCampaignContentItem, extra.selectedCampaignContentItem);
  tree = harness.render(() => CampaignPostContentRoute());
  const page = elements(tree).find((n) => n.type === Page);
  assert.equal(page.props.totalPrice, 124); assert.equal(page.props.totalPriceReady, true);
  page.props.onSubmitPayload(stalePayload);
  assert.equal(store.getState().selectedAccounts.length, 3, 'old form payload cannot reintroduce a removed row');
  assert.equal(store.getState().totalPrice, 124);
  assert.deepEqual(store.getState().selectedAccounts.find((a) => a.selectionId === extra.selectionId).selectedCampaignContentItem, extra.selectedCampaignContentItem);
  assert.ok(navigation[0].includes('strategy?currency=USD'));
  const strategy = strategyFixture(store);
  tree = strategy.render();
  assert.equal(elements(tree).find((n) => n.type === strategy.Bar).props.budgetLabel, 'Budget: 124$');
  elements(tree).find((n) => n.type === strategy.ButtonMain && n.props.text === 'Proceed').props.onClick();
  assert.ok(strategy.navigation[0].includes('payment?currency=USD'));
  const payment = paymentFixture({ builder: store });
  tree = payment.render(); payment.harness.flush();
  await elements(tree).find((n) => n.type === payment.FormPayment).props.onSubmit(paymentValues);
  const sent = payment.calls.find(([kind]) => kind === 'post')[1];
  assert.equal(sent.campaignPrice, 124); assert.equal(sent.paymentDetails.amount, 124); assert.equal(sent.displayCurrency, 'USD');
  assert.equal(sent.addedAccounts.length, 3);
  assert.deepEqual(sent.addedAccounts.find((a) => a.socialAccountId === extra.socialAccountId).selectedCampaignContentItem, extra.selectedCampaignContentItem);
});

test('removing a selection cannot resurrect it through an already-built content draft-save payload', async () => {
  const store = builderFixture(); hydrateFixture(store);
  const before = store.getState();
  const staleBlocks = contentHelpers.buildBlocksFromCampaignContent({ accounts: before.selectedAccounts, campaignContent: before.campaignContent });
  const stalePayload = contentHelpers.buildCampaignPostContentPayload({ campaignName: before.campaignName, campaignPrice: before.totalPrice,
    accounts: before.selectedAccounts, blocks: staleBlocks });
  store.getState().actions.removeSelection(before.selectedAccounts[2].selectionId);
  assert.equal(store.getState().totalPrice, 97);
  const calls = []; const harness = hookHarness();
  const { useCampaignPostContentPageDraft } = load('src/pages/client-side/campaign-post-content/model/use-campaign-post-content-page-draft.ts', {
    react: harness.hooks, [offerModule]: offerHelpers, [saveResultModule]: saveResults,
    [builderModule]: { useCampaignBuilderStore: store },
    [builderTypesModule + '.ts']: builderTypes,
    'react-toastify': { toast: { success() {}, error: (message) => assert.fail(message) } },
    '@/entities/client-side/campaign-draft/api/campaign-draft.api': {
      updateCampaignDraft: async (body) => { calls.push(body); return { data: { data: { draftId: before.draftId } } }; },
    },
  });
  const vm = harness.render(() => useCampaignPostContentPageDraft({ campaignPrice: before.totalPrice, buildPayload: () => stalePayload }));
  await vm.onSaveDraft();
  assert.equal(calls.length, 1); assert.equal(calls[0].addedAccounts.length, 2);
  assert.ok(calls[0].addedAccounts.every((a) => a.selectionId !== before.selectedAccounts[2].selectionId));
});

test('EUR/USD/GBP confirmed maps reach real strategy/payment and footer without a second conversion', async () => {
  const FooterSummary = load('src/widgets/client-side/campaign-creator-page/footer-summary/footer-summary.tsx').FooterSummary;
  for (const [code, symbol, total] of [['EUR', '€', 115], ['USD', '$', 124], ['GBP', '£', 106]]) {
    const store = builderFixture(); hydrateFixture(store);
    const before = store.getState(); store.getState().actions.setSelectedCurrency(code);
    assert.equal(store.getState().selectedOfferId, before.selectedOfferId);
    assert.deepEqual(store.getState().selectedOfferAccountIds, before.selectedOfferAccountIds);
    const footer = FooterSummary({ selectedCurrency: symbol, selectedOfferId: before.selectedOfferId, selectedPromoCardIds: before.selectedPromoCardIds,
      totalPrice: store.getState().totalPrice, totalPriceReady: store.getState().totalPriceReady, canProceed: true });
    assert.ok(JSON.stringify(footer).includes(String(total) + symbol));
    const strategy = strategyFixture(store); const strategyTree = strategy.render();
    assert.equal(elements(strategyTree).find((n) => n.type === strategy.Bar).props.budgetLabel, 'Budget: ' + total + symbol);
    const payment = paymentFixture({ builder: store }); const tree = payment.render(); payment.harness.flush();
    await elements(tree).find((n) => n.type === payment.FormPayment).props.onSubmit(paymentValues);
    const sent = payment.calls.find(([kind]) => kind === 'post')[1];
    assert.equal(sent.displayCurrency, code); assert.equal(sent.campaignPrice, total); assert.equal(sent.paymentDetails.amount, total);
    assert.deepEqual(sent.selectedOffer.selectedAccountIds, before.selectedOfferAccountIds);
  }
});

test('currency params keep the current builder currency when a step returns without a query string', () => {
  const store = builderFixture(); store.getState().actions.reset(); store.getState().actions.setSelectedCurrency('GBP');
  const url = {};
  const parser = { withDefault: (value) => ({ defaultValue: value }) };
  const { useBuildCampaignParams } = load('src/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params.ts', {
    nuqs: { parseAsInteger: parser, parseAsString: parser, parseAsStringLiteral: () => parser,
      useQueryStates: (fields) => [Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, url[key] ?? value.defaultValue ?? null])),
        (values) => Object.assign(url, values)],
    },
    [builderModule]: { useCampaignBuilderStore: store }, [offerModule]: offerHelpers,
    '@/features/client-side/campaign-creator-page/build-campaign-filters/build-campaign-params.constants':
      load('src/features/client-side/campaign-creator-page/build-campaign-filters/build-campaign-params.constants.ts'),
  });
  let params = useBuildCampaignParams();
  assert.equal(params.selectedCurrencyCode, 'GBP'); assert.equal(params.selectedCurrency.key, '£');
  params.setCurrencyCode('USD');
  params = useBuildCampaignParams();
  assert.equal(params.selectedCurrencyCode, 'USD');
  assert.equal(store.getState().selectedCurrency, '$', 'the currency selector commits store currency and derived totals immediately');
});

test('a scalar account price is never relabelled when its requested currency map is missing', () => {
  const store = builderFixture(); store.getState().actions.reset();
  store.getState().actions.togglePromoCard(account('legacy-EUR', { price: 20 }));
  store.getState().actions.setSelectedCurrency('USD');
  assert.equal(store.getState().totalPriceReady, false);
  assert.equal(store.getState().selectedAccounts[0].price, undefined);
  assert.deepEqual(store.getState().selectedAccounts[0].prices, { EUR: 20 });
  store.getState().actions.setSelectedCurrency('EUR');
  assert.equal(store.getState().totalPriceReady, true);
  assert.equal(store.getState().totalPrice, 20);
});
function offerCardFixture(store, getCurrency) {
  const harness = hookHarness(); const ButtonMain = () => {};
  const { OfferCard } = load('src/widgets/client-side/campaign-creator-page/campaign-offers-slider/ui/offer-card.tsx', {
    react: harness.hooks, '@/shared/ui': { ButtonMain },
    [builderModule + '.ts']: { useCampaignBuilderStore: store }, [totalsModule]: totals,
    '@/features/client-side/campaign-creator-page/select-platform/model/use-platform-param': { usePlatformParam: () => ({ platform: 'instagram', platformKey: 'instagram' }) },
    '@/features/client-side/campaign-creator-page/select-genre/model/use-genre-param': { useGenreParam: () => ({ genre: 'techno' }) },
    '@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params': { useBuildCampaignParams: () => ({ selectedCurrency: getCurrency() }) },
  });
  return { render: (offer) => harness.render(() => OfferCard({ offer })), ButtonMain };
}

test('USD/GBP draft to a catalogue offer with only an EUR map never uses old package maps or mixes currencies', async () => {
  for (const [code, symbol] of [['USD', '$'], ['GBP', '£']]) {
    const store = builderFixture(); const draft = draftExample(); draft.displayCurrency = code;
    hydrateFixture(store, draft);
    const beforeIds = store.getState().selectedOfferAccountIds;
    const card = offerCardFixture(store, () => ({ key: symbol, currency: code }));
    const oldOffer = { id: draft.selectedOffer.offerId, title: draft.selectedOffer.title, price: 90, connectedAccounts: [] };
    assert.ok(JSON.stringify(card.render(oldOffer)).includes(code === 'USD' ? '97$' : '83£'));
    const offer = { id: 'new-package', title: 'New package', price: 70, prices: { EUR: 70 }, connectedAccounts: [account('new-member')] };
    const tree = card.render(offer);
    assert.ok(JSON.stringify(tree).includes('Price unavailable in ' + code));
    elements(tree).find((n) => n.type === card.ButtonMain).props.onClick();
    const state = store.getState();
    assert.deepEqual(state.selectedOfferPrices, { EUR: 70 });
    assert.equal(state.totalPriceReady, false);
    assert.equal(state.selectedOfferPrice, null);
    assert.deepEqual(state.selectedOfferAccountIds, ['new-member']);
    assert.notDeepEqual(state.selectedOfferAccountIds, beforeIds);
    assert.equal(state.selectedCurrency, symbol);
    assert.ok(state.selectedAccounts.some((a) => a.accountId === draft.addedAccounts[2].socialAccountId));
    const payment = paymentFixture({ builder: store });
    const page = payment.render(); payment.harness.flush();
    await elements(page).find((n) => n.type === payment.FormPayment).props.onSubmit(paymentValues);
    assert.equal(payment.calls.some(([kind]) => kind === 'post' || kind === 'delete'), false);
    store.getState().actions.setSelectedCurrency('EUR');
    assert.equal(store.getState().totalPriceReady, true);
    assert.equal(store.getState().totalPrice, 95);
    assert.equal(store.getState().selectedAccounts.find((a) => a.source === 'manual').price, 25);
  }
});

test('real account card keeps all confirmed currency prices and shows included state after Offer selection', () => {
  const store = builderFixture(); store.getState().actions.reset(); const harness = hookHarness();
  let selectedCurrency = { key: '€', currency: 'EUR' };
  const { PromoCardGrid } = load('src/widgets/client-side/campaign-creator-page/build-campaign/components/promo-card-grid.tsx', {
    react: harness.hooks, [totalsModule]: totals, [builderModule + '.ts']: { useCampaignBuilderStore: store },
    '@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params.ts': { useBuildCampaignParams: () => ({ selectedCurrency }) },
    '@/constants/social-medias': { getSocialMediaIcon: () => '' }, '@/utils/functions/formatFollowers': { formatFollowers: String },
    './genres-countries-popover': { GenresCountriesPopover() {} },
  }, { console: { log() {} } });
  const data = { ...account('A'), prices: { EUR: 30, USD: 32, GBP: 28 }, countries: [], musicGenres: [] };
  let tree = harness.render(() => PromoCardGrid({ data, isInclude: false, isSelected: false }));
  tree.props.onClick();
  assert.deepEqual(store.getState().selectedAccounts[0].prices, data.prices);
  store.getState().actions.selectOffer({ offerId: 'pack', offerPrice: 70, accountIds: ['A'], accounts: [account('A')] });
  tree = harness.render(() => PromoCardGrid({ data, isInclude: true, isSelected: false }));
  assert.ok(JSON.stringify(tree).includes('Included in your selected offer'));
  tree.props.onClick(); assert.deepEqual(store.getState().selectedPromoCardIds, []);
  selectedCurrency = { key: '$', currency: 'USD' };
  tree = harness.render(() => PromoCardGrid({ data, isInclude: true, isSelected: false }));
  assert.ok(JSON.stringify(tree).includes('32'));
});

test('successful POST plus failed draft DELETE completes actual payment and cannot POST again', async () => {
  const fixture = paymentFixture({ deleteError: new Error('cleanup failed') });
  fixture.builder.getState().actions.setDraftMeta({ draftId: 'own', draftStep: 'strategyTable' });
  let tree = fixture.render(); fixture.harness.flush();
  const submit = elements(tree).find((n) => n.type === fixture.FormPayment).props.onSubmit;
  await submit(paymentValues);
  tree = fixture.render();
  assert.equal(fixture.calls.filter(([kind]) => kind === 'post').length, 1);
  assert.deepEqual(fixture.calls.filter(([kind]) => kind === 'delete'), [['delete', 'own']]);
  assert.ok(fixture.notifications.some(([kind]) => kind === 'success'));
  assert.equal(fixture.notifications.some(([kind]) => kind === 'error'), false);
  assert.ok(JSON.stringify(tree).includes('old draft could not be removed'));
  assert.equal(elements(tree).find((n) => n.type === fixture.FormPayment).props.submitButton.props.disabled, true);
  assert.equal(elements(tree).find((n) => n.type === fixture.FormPayment).props.submitButton.props.children, 'Campaign created');
  await submit(paymentValues); // even the old callback is locked
  await elements(tree).find((n) => n.type === fixture.FormPayment).props.onSubmit(paymentValues);
  assert.equal(fixture.calls.filter(([kind]) => kind === 'post').length, 1);
  assert.equal(fixture.calls.filter(([kind]) => kind === 'delete').length, 1);
});

test('parallel payment clicks are locked before React re-render and rejected POST does not clean up or succeed', async () => {
  let resolve;
  const pending = new Promise((done) => { resolve = done; });
  const fixture = paymentFixture({ postPromise: pending });
  let tree = fixture.render(); fixture.harness.flush();
  const submit = elements(tree).find((n) => n.type === fixture.FormPayment).props.onSubmit;
  const request = submit(paymentValues);
  await submit(paymentValues);
  assert.equal(fixture.calls.filter(([kind]) => kind === 'post').length, 1);
  resolve(); await request;
  await submit(paymentValues);
  assert.equal(fixture.calls.filter(([kind]) => kind === 'post').length, 1);
  const failed = paymentFixture({ postError: new Error('POST failed') });
  failed.builder.getState().actions.setDraftMeta({ draftId: 'own', draftStep: 'strategyTable' });
  const before = failed.builder.getState();
  tree = failed.render(); failed.harness.flush();
  await elements(tree).find((n) => n.type === failed.FormPayment).props.onSubmit(paymentValues);
  assert.equal(failed.builder.getState(), before);
  assert.equal(failed.calls.some(([kind]) => kind === 'delete'), false);
  assert.equal(failed.notifications.some(([kind]) => kind === 'success'), false);
  assert.ok(failed.notifications.some(([kind]) => kind === 'error'));
});

test('bundle drafts are readable but cannot be silently serialized as standalone or submitted by this builder', () => {
  const draft = draftExample(); draft.addedAccounts[2].source = 'bundle'; draft.addedAccounts[2].bundleId = 'bundle-id';
  draft.addedBundles = [{ bundleId: 'bundle-id' }];
  const store = builderFixture(); hydrateFixture(store, draft); const state = store.getState();
  assert.equal(state.unsupportedDraftBundles, true); assert.equal(state.totalPriceReady, false);
  assert.equal(state.selectedAccounts[2].source, 'bundle');
  assert.throws(() => draftPayloads.buildCampaignDraftPayload(state, 'addAccounts'), /contains bundles/);
  assert.throws(() => regularPayload(store), /contains bundles/);
  assert.throws(() => strategyPayloads.buildStrategyDraftPayload({ accounts: state.selectedAccounts, content: [], campaignName: 'Bundle draft' }), /contains bundles/);
  assert.throws(() => offerHelpers.serializeDraftSelection(draft.addedAccounts, draft.selectedOffer), /contains bundles/);
  assert.equal(store.getState(), state);
});
const account = (id, extra = {}) => ({ accountId: id, influencerId: `owner-${id}`, socialMedia: 'instagram', username: id, profileType: 'community', ...extra });

function builderFixture() {
  const { useCampaignBuilderStore: store } = load('src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts', {
    zustand: { create: hookCreate },
    'zustand/middleware': { persist: (fn) => fn, createJSONStorage: () => ({}) },
    './selected-offer': offerHelpers, './calc-builder-total': totals,
  });
  store.getState().actions.setCampaignName('Offer campaign');
  store.getState().actions.togglePromoCard(account('a', { source: 'manual', price: 50, _id: 'row-record-a', addedAccountsId: 'row-a' }));
  store.getState().actions.selectOffer({ offerId: 'offer-1', offerName: 'Offer 70', offerPrice: 70,
    accountIds: ['a', 'b'], accounts: [account('a'), account('b')] });
  store.getState().actions.togglePromoCard(account('extra', { source: 'manual', price: 20 }));
  store.getState().actions.setTotalPrice(70);
  return store;
}

function regularPayload(store, overrides = {}) {
  const state = store.getState();
  return strategyPayloads.buildStrategyCreateCampaignPayload({ campaignName: state.campaignName,
    totalPrice: state.totalPrice, accounts: state.selectedAccounts, content: state.campaignContent,
    selectedOffer: offerHelpers.getBuilderSelectedOffer(state), paymentDetails: paymentValues, ...overrides });
}

test('ordinary payload preserves full offer membership after manual-to-offer conversion and independent accounts', () => {
  const store = builderFixture();
  assert.equal(store.getState().selectedAccounts.find((a) => a.accountId === 'a').source, 'offer');
  const payload = regularPayload(store, { selectedOffer: { offerId: 'offer-1', selectedAccountIds: ['a', 'b'], price: 999, currentAccountIds: ['changed'] } });
  assert.deepEqual(payload.selectedOffer, { offerId: 'offer-1', selectedAccountIds: ['a', 'b'] });
  assert.deepEqual(payload.addedAccounts.map((a) => a.socialAccountId).sort(), ['a', 'b', 'extra']);
  assert.equal(payload.selectedOffer.selectedAccountIds.includes('row-a'), false);
  assert.equal(Object.hasOwn(payload, 'selectedOfferSnapshot'), false);
  assert.equal(Object.hasOwn(payload.addedAccounts[0], 'selectedContent'), false);
  assert.throws(() => regularPayload(store, { accounts: [account('a'), account('extra')] }), offerHelpers.OfferSelectionError);
  assert.throws(() => regularPayload(store, { accounts: [account('a'), account('a'), account('b')] }), offerHelpers.OfferSelectionError);
  assert.throws(() => regularPayload(store, { selectedOffer: { offerId: '', selectedAccountIds: ['a'] } }), offerHelpers.OfferSelectionError);
});

test('draft serialization keeps agreed Offer row identity without mutating state, and null clears bindings', () => {
  const store = builderFixture();
  const before = store.getState();
  const addAccounts = draftPayloads.buildCampaignDraftPayload(before, builderTypes.CampaignDraftLatestStep.addAccounts);
  const strategy = strategyPayloads.buildStrategyDraftPayload({ campaignName: before.campaignName, accounts: before.selectedAccounts,
    content: [], selectedOffer: offerHelpers.getBuilderSelectedOffer(before) });
  for (const payload of [addAccounts, strategy]) {
    assert.deepEqual(payload.selectedOffer, { offerId: 'offer-1', selectedAccountIds: ['a', 'b'] });
    const row = payload.addedAccounts.find((a) => a.socialAccountId === 'a');
    assert.equal(row.source, 'offer'); assert.equal(row.offerId, 'offer-1'); assert.equal(row.selectionId, before.selectedAccounts[0].selectionId);
    assert.equal(Object.hasOwn(row, 'addedAccountsId'), false); assert.equal(Object.hasOwn(row, '_id'), false);
    assert.equal(payload.addedAccounts.find((a) => a.socialAccountId === 'extra').source, 'standalone');
  }
  assert.equal(store.getState(), before);
  store.getState().actions.selectOffer({ offerId: null });
  const cleared = draftPayloads.buildCampaignDraftPayload(store.getState(), builderTypes.CampaignDraftLatestStep.addAccounts);
  assert.equal(cleared.selectedOffer, null);
  assert.deepEqual(cleared.addedAccounts.map((a) => a.socialAccountId).sort(), ['extra']);
  assert.ok(cleared.addedAccounts.every((a) => a.source === 'standalone' && !Object.hasOwn(a, 'offerId')));
});

test('save ID comes only from confirmed Axios envelope, updates retain their ID and creates fail without one', () => {
  assert.equal(saveResults.getSavedDraftId({ data: { data: { draftId: 'draft-1' } } }, null), 'draft-1');
  assert.equal(saveResults.getSavedDraftId({ data: {} }, 'draft-1'), 'draft-1');
  assert.throws(() => saveResults.getSavedDraftId({ data: { draftId: 'wrong-level' } }, null));
  assert.throws(() => saveResults.getSavedDraftId(undefined, null));
  assert.throws(() => saveResults.getSavedDraftId({ data: { data: { draftId: 'other' } } }, 'draft-1'));
});

test('active addAccounts and addContent save handlers send server selection and record the returned ID', async () => {
  const store = builderFixture();
  const calls = [];
  const notifications = [];
  const save = async (payload) => { calls.push(payload); return { data: { data: { draftId: 'draft-1' } } }; };
  let harness = hookHarness();
  const dependencies = {
    react: harness.hooks, 'react-toastify': { toast: { success: (msg) => notifications.push(msg), error: (msg) => { throw new Error(msg); } } },
    '@tanstack/react-query': { useQueryClient: () => ({ invalidateQueries: async () => {} }) },
    [builderModule]: { useCampaignBuilderStore: store }, [saveResultModule]: saveResults,
    [builderTypesModule]: builderTypes, [offerModule]: offerHelpers,
    '@/entities/client-side/campaign-creator-page/campaign-builder/model/build-draft-payload': draftPayloads,
  };
  const { useSaveCampaignCreatorDraft } = load('src/pages/client-side/campaign-creator-page/model/use-save-campaign-creator-draft.ts', dependencies);
  let creator = harness.render(() => useSaveCampaignCreatorDraft({ postCampaignDraft: save }));
  creator.open(); creator = harness.render(() => useSaveCampaignCreatorDraft({ postCampaignDraft: save }));
  await creator.save();
  assert.equal(store.getState().draftId, 'draft-1');
  harness = hookHarness();
  const { useCampaignPostContentPageDraft } = load('src/pages/client-side/campaign-post-content/model/use-campaign-post-content-page-draft.ts', {
    ...dependencies, react: harness.hooks,
    '@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types.ts': builderTypes,
    '@/entities/client-side/campaign-draft/api/campaign-draft.api': { postCampaignDraft: save, updateCampaignDraft: save },
  });
  const contentSave = harness.render(() => useCampaignPostContentPageDraft({ campaignPrice: 70,
    buildPayload: () => ({ socialMedia: 'instagram', campaignContent: [], addedAccounts: regularPayload(store).addedAccounts }) }));
  await contentSave.onSaveDraft();
  assert.equal(store.getState().draftId, 'draft-1');
  assert.equal(calls[1].draftId, 'draft-1');
  for (const payload of calls) {
    assert.deepEqual(payload.selectedOffer, { offerId: 'offer-1', selectedAccountIds: ['a', 'b'] });
    assert.equal(payload.addedAccounts.find((a) => a.socialAccountId === 'a').source, 'offer');
    assert.equal(payload.addedAccounts.find((a) => a.socialAccountId === 'a').selectionId, store.getState().selectedAccounts[0].selectionId);
    assert.equal(payload.addedAccounts.find((a) => a.socialAccountId === 'extra').source, 'standalone');
  }
  assert.equal(notifications.length, 2);
});

test('active strategy save handler serializes offer and stores the created draft ID', async () => {
  const store = builderFixture(); const harness = hookHarness(); const calls = []; const DraftButton = () => {};
  const group = { accounts: [], items: [] };
  const { CampaignStrategyPage } = load('src/pages/client-side/campaign-strategy-page/ui/campaign-strategy-page.tsx', {
    react: harness.hooks, '@/components': {}, 'react-router-dom': { useNavigate: () => () => {} },
    '@components/ui/modal-fix/Modal': {}, [builderModule]: { useCampaignBuilderStore: store },
    '../model/campaign-strategy.helpers': { groupCampaignStrategyData: () => ({ mainCreator: group, mainCommunity: group, music: group, press: group }) },
    '@/widgets/client-side/campaign-tables/ui/campaign-strategy-section': {},
    '@/features/client-side/campaign-tables/model/use-campaign-strategy-view-params': { useCampaignStrategyViewParams: () => ({ view: 0 }) },
    '@/features/client-side/campaign-tables/view-change/ui/view-change': {}, '@/features/client-side/campaign-tables/view-audience/ui/view-audince': {},
    [strategyModule]: strategyPayloads, [offerModule]: offerHelpers, [saveResultModule]: saveResults, [builderTypesModule]: builderTypes,
    '@/widgets/client-side/campaign-tables/ui/live-view-card/ui/live-view-card': {},
    '@/widgets/client-side/campaign-tables/model/use-save-proposal.ts': { useSaveProposal: () => ({}) },
    '@/widgets/client-side/campaign-tables/model/use-proposal-share.ts': { useProposalShare: () => ({}) },
    '@/widgets/client-side/campaign-tables/ui/bar-campaigns/ui/bar.tsx': {},
    '@/widgets/client-side/campaign-tables/ui/bar-campaigns/model/campaign-strategy-bar.helpers.ts': { buildCampaignBarData: () => ({}) },
    '@/widgets/client-side/campaign-tables/ui/check-box-row/ui/checkbox.tsx': {},
    '@/entities/client-side/campaign-draft/api/campaign-draft.api.ts': { postCampaignDraft: async (payload) => { calls.push(payload); return { data: { data: { draftId: 'strategy-draft' } } }; } },
    'react-toastify': { toast: { success() {}, error(msg) { throw new Error(msg); } } },
    '@components/ui/draft-button/draft-button.tsx': { DraftButton },
  });
  const tree = harness.render(() => CampaignStrategyPage());
  await elements(tree).find((node) => node.type === DraftButton).props.onClick();
  assert.equal(store.getState().draftId, 'strategy-draft');
  assert.deepEqual(calls[0].selectedOffer, { offerId: 'offer-1', selectedAccountIds: ['a', 'b'] });
  assert.equal(calls[0].addedAccounts.find((a) => a.socialAccountId === 'a').source, 'offer');
});

test('draft hydration retains saved membership and availability, clears foreign display and never invents overlap provenance', () => {
  const store = builderFixture();
  const hydrate = load('src/entities/client-side/campaign-creator-page/campaign-builder/model/hydrate-campaign-builder-from-draft.ts', {
    './campaign-builder.store': { useCampaignBuilderStore: store }, './campaign-builder.types': builderTypes, './selected-offer': offerHelpers, './calc-builder-total': totals,
  });
  const draft = { _id: 'draft-2', step: 'strategyTable', campaignName: 'Own draft', addedAccounts: [
    { ...account('a'), accountId: undefined, socialAccountId: 'a', selectionId: 'selection-a', source: 'offer' },
    { ...account('b'), accountId: undefined, socialAccountId: 'b' }],
    selectedOffer: { offerId: 'saved-offer', selectedAccountIds: ['a', 'b'], currentAccountIds: ['changed'], isAvailable: false, unavailableReason: 'offer_membership_changed' } };
  hydrate.hydrateCampaignBuilderFromDraft(draft);
  assert.equal(store.getState().draftId, 'draft-2');
  assert.equal(store.getState().selectedOfferId, 'saved-offer');
  assert.deepEqual(store.getState().selectedOfferAccountIds, ['a', 'b']);
  assert.equal(store.getState().selectedOfferName, ''); assert.equal(store.getState().selectedOfferPrice, null);
  assert.equal(store.getState().selectedAccounts[0].source, 'offer');
  assert.equal(store.getState().selectedAccounts[0].accountId, 'a');
  assert.equal(store.getState().selectedAccounts[0].selectionId, 'selection-a');
  assert.throws(() => regularPayload(store, { offerIsAvailable: store.getState().selectedOfferIsAvailable }), offerHelpers.OfferSelectionError);
  assert.equal(store.getState().selectedOfferId, 'saved-offer');
  hydrate.hydrateCampaignBuilderFromDraft({ ...draft, _id: 'old-draft', selectedOffer: undefined });
  assert.equal(store.getState().selectedOfferId, null); assert.deepEqual(store.getState().selectedOfferAccountIds, []);
});

test('legacy mapper/store checkout keeps offer tied to its draft and validates after final filtering', () => {
  const mapper = load('src/client-side/utils/getCampaign.utils.ts');
  const proposalMapper = load('src/client-side/utils/proposalPayload.ts');
  const legacy = load('src/client-side/store/draft-store/draft-content.ts', { ...common,
    '@/client-side/utils': { ...common['@/client-side/utils'], ...proposalMapper },
  }).useDraftCampaignStore;
  const offer = { offerId: 'own-offer', selectedAccountIds: ['a', 'b'], currentAccountIds: ['a', 'b'], isAvailable: true };
  const rows = ['a', 'b', 'extra'].map((id) => ({ ...account(id), socialAccountId: id }));
  const draft = mapper.toCampaignPageModelFromDraft({ _id: 'own', campaignName: 'Own', addedAccounts: rows, campaignContent: [], selectedOffer: offer });
  const harness = hookHarness();
  const proposalState = { initOption() {}, currentCampaignId: null, setCurrentCampaignId() {}, clearAll() {} };
  const { useCampaignPageBootstrap } = load('src/client-side/pages/campaign/model/use-campaign-page-bootstrap.ts', {
    react: harness.hooks, 'react-router-dom': { useLocation: () => ({ key: 'entry' }), useNavigate: () => () => {} },
    '@/client-side/store': { useDraftCampaignStore: legacy,
      useFetchCampaign: { getState: () => ({ setDraft() {} }) },
      useProposalAccountsStore: (selector) => selector(proposalState),
      useStrategyCampaignStore: (selector) => selector({ initCampaign() {} }),
    },
    './campaign-page.utils': { parseLastCampaignSession: () => ({ id: 'own', status: 'draft' }) },
  });
  harness.render(() => useCampaignPageBootstrap(draft)); harness.flush();
  assert.equal(legacy.getState().metadataByDraftId.own.selectedOffer.offerId, 'own-offer');
  legacy.getState().initCampaign('other', [], [], { selectedOffer: { ...offer, offerId: 'other-offer' } });
  const payload = legacy.getState().getCampaignPayload('own', 'foreign name', 'bank_card');
  assert.equal(payload.campaignName, 'Own'); assert.deepEqual(payload.selectedOffer, { offerId: 'own-offer', selectedAccountIds: ['a', 'b'] });
  legacy.getState().initCampaign('own', [], [], { selectedOffer: null });
  assert.equal(legacy.getState().accountsByCampaignId.own, rows, 'no reload over local edits');
  legacy.setState({ accountsByCampaignId: { ...legacy.getState().accountsByCampaignId, own: rows.map((a) => a.socialAccountId === 'b' ? { ...a, influencerId: '' } : a) } });
  assert.throws(() => legacy.getState().getCampaignPayload('own', '', 'bank_card'), offerHelpers.OfferSelectionError);
  assert.throws(() => legacy.getState().getCampaignPayload('uninitialized', '', 'bank_card'));
});

test('checkout resolves route context without stale store IDs and rejects ambiguous links', () => {
  assert.deepEqual(checkout.resolveCheckoutContext('/client/create-campaign/content/strategy/payment', new URLSearchParams(), 'builder-draft'), { kind: 'builder', draftId: 'builder-draft' });
  assert.deepEqual(checkout.resolveCheckoutContext('/client/campaign/payment', new URLSearchParams('proposal=P&option=2'), 'stale-builder'), { kind: 'proposal', proposalId: 'P', optionIndex: 2 });
  assert.deepEqual(checkout.resolveCheckoutContext('/client/campaign/payment', new URLSearchParams('draft=D'), 'other'), { kind: 'draft', draftId: 'D' });
  assert.equal(checkout.resolveCheckoutContext('/client/campaign/payment', new URLSearchParams('draft=D&proposal=P'), null).kind, 'invalid');
  assert.equal(checkout.resolveCheckoutContext('/client/campaign/payment', new URLSearchParams(), 'stale').kind, 'invalid');
});

test('invalidOffer has no fallback, retry or cleanup; unavailable/incomplete offers never reach POST', async () => {
  const base = regularPayload(builderFixture()); const calls = [];
  const invalid = { response: { status: 400, data: { invalidOffer: { reason: 'offer_membership_changed' } } } };
  const dependencies = { base, paymentDetails: paymentValues, context: { kind: 'builder', draftId: 'own-draft' },
    postCampaign: async (payload) => { calls.push(['post', payload]); throw invalid; },
    approveProposal: async () => calls.push(['approve']), deleteDraft: async (id) => calls.push(['delete', id]), clearDraft: (id) => calls.push(['clear', id]) };
  await assert.rejects(checkout.submitCheckout(dependencies), (error) => error === invalid);
  assert.equal(calls.length, 1); assert.deepEqual(calls[0][1].selectedOffer.selectedAccountIds, ['a', 'b']);
  assert.equal(offerHelpers.isInvalidOfferError(invalid), true);
  for (const reason of ['offer_selection_invalid', 'offer_not_found', 'offer_unavailable', 'offer_membership_changed', 'offer_account_missing_or_ambiguous', 'offer_account_unavailable', 'offer_price_invalid', 'account_unavailable', 'future_offer_reason']) {
    assert.equal(offerHelpers.isInvalidOfferError({ response: { status: 400, data: { invalidOffer: { reason } } } }), true);
  }
  assert.equal(offerHelpers.isInvalidOfferError({ response: { status: 400, data: { message: 'Other validation' } } }), false);
  assert.equal(offerHelpers.isInvalidOfferError({ response: { status: 400, data: { data: { invalidOffer: { reason: 'offer_unavailable' } } } } }), false);
  assert.equal(offerHelpers.isInvalidOfferError({ selectedOffer: { unavailableReason: 'offer_not_found' } }), false);
  calls.length = 0;
  await assert.rejects(checkout.submitCheckout({ ...dependencies, offerIsAvailable: false }), offerHelpers.OfferSelectionError);
  await assert.rejects(checkout.submitCheckout({ ...dependencies, base: { ...base, addedAccounts: [] } }), offerHelpers.OfferSelectionError);
  assert.deepEqual(calls, []);
});

test('ordinary without offer, correct draft cleanup and proposal approve retain their separate contracts', async () => {
  const calls = []; const base = regularPayload(builderFixture(), { selectedOffer: null });
  const dependencies = { base: { ...base, selectedOfferSnapshot: { forbidden: true } }, paymentDetails: paymentValues,
    postCampaign: async (payload) => calls.push(['post', payload]), approveProposal: async (...args) => calls.push(['approve', ...args]),
    deleteDraft: async (id) => calls.push(['delete', id]), clearDraft: (id) => calls.push(['clear', id]) };
  await checkout.submitCheckout({ ...dependencies, context: { kind: 'builder', draftId: null } });
  assert.equal(calls.length, 1); assert.equal(calls[0][1].selectedOffer, null);
  assert.equal(Object.hasOwn(calls[0][1], 'selectedOfferSnapshot'), false);
  calls.length = 0;
  await checkout.submitCheckout({ ...dependencies, context: { kind: 'builder', draftId: 'own' } });
  assert.deepEqual(calls.slice(1), [['delete', 'own'], ['clear', 'own']]);
  calls.length = 0;
  await checkout.submitCheckout({ ...dependencies, base: { ...base, selectedOffer: {} }, offerIsAvailable: false, context: { kind: 'proposal', proposalId: 'P', optionIndex: 3 } });
  assert.deepEqual(calls, [['approve', 'P', 3, paymentValues]]);
});

test('active draft API wrappers retain AxiosResponse for the shared envelope extractor', async () => {
  const response = { status: 201, data: { statusCode: 201, data: { draftId: 'created', operation: 'created' } } };
  const calls = [];
  const api = load('src/entities/client-side/campaign-draft/api/campaign-draft.api.ts', {
    '@/api/api.ts': { post: async (...args) => { calls.push(args); return response; } },
  });
  for (const save of [api.postCampaignDraft, api.updateCampaignDraft]) {
    const result = await save({ selectedOffer: null });
    assert.equal(result, response); assert.equal(saveResults.getSavedDraftId(result, null), 'created');
  }
  assert.ok(calls.every(([url]) => url === '/campaigns/draft'));
});

function paymentFixture({ path = '/client/create-campaign/content/strategy/payment', query = '', postError = null, deleteError = null, postPromise, loadDraft, builder = builderFixture() } = {}) {
  const harness = hookHarness(); const calls = []; const notifications = []; const navigation = [];
  const session = new Map(); const params = new URLSearchParams(query); const FormPayment = () => {}; const Modal = () => {}; const OfferCatalogueReview = () => {};
  const realMapper = load('src/client-side/utils/proposalPayload.ts');
  const draft = load('src/client-side/store/draft-store/draft-content.ts', { ...common,
    '@/client-side/utils': { ...common['@/client-side/utils'], ...realMapper, pickPrice: () => ({ amount: 0 }) },
  }, { console: { log() {} } }).useDraftCampaignStore;
  const proposalStore = load('src/client-side/store/proposal-share/proposal-campaign.ts', { ...common,
    '@/client-side/utils': { ...common['@/client-side/utils'], ...realMapper },
  }).useProposalCampaignStore;
  const updates = load('src/client-side/store/proposal-store/updateCampaign.ts', common).useUpdateCampaign;
  const hydration = load('src/entities/client-side/campaign-creator-page/campaign-builder/model/hydrate-campaign-builder-from-draft.ts', {
    './campaign-builder.store': { useCampaignBuilderStore: builder }, './campaign-builder.types': builderTypes, './selected-offer': offerHelpers, './calc-builder-total': totals,
  });
  const { PaymentCampaign } = load('src/client-side/pages/payment-campaign/payment-campaign.tsx', {
    react: harness.hooks, '@/components': {},
    'react-router-dom': { useLocation: () => ({ pathname: path }), useSearchParams: () => [params], useNavigate: () => (url) => navigation.push(url) },
    '@tanstack/react-query': { useQueryClient: () => ({ invalidateQueries: async (...args) => calls.push(['invalidate', ...args]) }) },
    'react-toastify': { toast: { success: (msg) => notifications.push(['success', msg]), error: (msg) => notifications.push(['error', msg]) } },
    '@/client-side/constants/payment-campaign-tabs.inputs': {}, '@/client-side/schemas': {},
    '@/client-side/data/payment-campaign-tabs': { PAYMENT_CAMPAIGN_TABS: [] }, '@/client-side/widgets': {}, '@/client-side/client-forms': {},
    '@/client-side/store': { useDraftCampaignStore: draft, useProposalCampaignStore: proposalStore, useUpdateCampaign: updates,
      useCampaignStore: () => ({ draftId: 'foreign-legacy-id', campaignName: 'Foreign legacy' }) },
    '@/client-side/react-query': { useInvoceDetailsQuery: () => ({ data: undefined }) },
    '@components/form/form-payment.tsx': { FormPayment }, '@/shared/ui/modal-fix/Modal': { Modal },
    '@/api/client/campaign/campaign.api': {
      postCampaign: async (payload) => { calls.push(['post', payload]); if (postError) throw postError; if (postPromise) await postPromise; },
      approveProposalCampaign: async (...args) => calls.push(['approve', ...args]),
    },
    '@/api/client/campaign/draft.api': {
      deleteDraft: async (id) => { calls.push(['delete', id]); if (deleteError) throw deleteError; },
      getCampaignDraft: async (id) => { calls.push(['get', id]); return loadDraft?.(id); },
    },
    '@/client-side/utils/payment-reference': { generatePaymentReferenceNumber: () => 'reference' },
    [builderModule]: { useCampaignBuilderStore: builder }, [strategyModule]: strategyPayloads, [offerModule]: offerHelpers,
    '@/entities/client-side/campaign-creator-page/campaign-builder/model/hydrate-campaign-builder-from-draft': hydration,
    './checkout-context': checkout, './offer-catalogue-review': { OfferCatalogueReview },
  }, { sessionStorage: { getItem: (key) => session.get(key) ?? null, removeItem: (key) => session.delete(key) }, console: { error() {} } });
  const render = () => harness.render(() => PaymentCampaign());
  return { builder, draft, proposalStore, updates, calls, notifications, navigation, session, render, harness, FormPayment, Modal, OfferCatalogueReview };
}

test('payment handles invalidOffer locally, keeps the form and campaign, and never retries or deletes', async () => {
  const error = { response: { status: 400, data: { invalidOffer: { reason: 'offer_unavailable' } } } };
  const fixture = paymentFixture({ postError: error });
  fixture.builder.getState().actions.setDraftMeta({ draftId: 'own', draftStep: 'strategyTable' });
  const before = fixture.builder.getState();
  let tree = fixture.render(); fixture.harness.flush();
  await elements(tree).find((node) => node.type === fixture.FormPayment).props.onSubmit(paymentValues);
  tree = fixture.render();
  assert.equal(fixture.calls.filter(([kind]) => kind === 'post').length, 1);
  assert.equal(fixture.calls.some(([kind]) => kind === 'delete'), false);
  assert.deepEqual(fixture.notifications, []);
  assert.equal(fixture.builder.getState(), before);
  assert.ok(elements(tree).some((node) => node.type === fixture.Modal));
  assert.ok(elements(tree).some((node) => node.type === fixture.FormPayment));
  await elements(tree).find((node) => node.type === 'button' && node.props.children === 'Refresh catalogue').props.onClick();
  tree = fixture.render();
  assert.ok(elements(tree).some((node) => node.type === fixture.OfferCatalogueReview));
  assert.ok(elements(tree).some((node) => node.type === fixture.FormPayment));
  assert.equal(fixture.calls.filter(([kind]) => kind === 'post').length, 1);
});

test('payment uses proposal option payload despite stale builder and legacy IDs and does no draft cleanup', async () => {
  const fixture = paymentFixture({ path: '/client/campaign/payment', query: 'proposal=P&option=2' });
  fixture.builder.getState().actions.setDraftMeta({ draftId: 'stale-builder', draftStep: 'strategyTable' });
  fixture.session.set('proposalPaymentPayload', JSON.stringify({ campaignId: 'P', optionIndex: 2,
    payload: { campaignName: 'Saved option', campaignPrice: 83, addedAccounts: [], campaignContent: [] } }));
  const tree = fixture.render(); fixture.harness.flush();
  await elements(tree).find((node) => node.type === fixture.FormPayment).props.onSubmit(paymentValues);
  assert.equal(fixture.calls.length, 1); assert.equal(fixture.calls[0][0], 'approve');
  assert.equal(fixture.calls[0][1], 'P'); assert.equal(fixture.calls[0][2], 2); assert.equal(fixture.calls[0][3].amount, 83);
  assert.equal(fixture.builder.getState().draftId, 'stale-builder');
});

test('direct legacy payment loads only its own uninitialized draft and preserves local edits on subsequent entry', async () => {
  const offer = { offerId: 'own-offer', selectedAccountIds: ['a'], currentAccountIds: ['a'], prices: { EUR: 70, USD: 76, GBP: 64 }, isAvailable: true };
  const fixture = paymentFixture({ path: '/client/campaign/payment', query: 'draft=own', loadDraft: async () => ({
    _id: 'own', campaignName: 'Own draft', selectedOffer: offer, displayCurrency: 'EUR',
    addedAccounts: [{ ...account('a'), socialAccountId: 'a' }], campaignContent: [],
  }) });
  let tree = fixture.render(); fixture.harness.flush();
  await elements(tree).find((node) => node.type === fixture.FormPayment).props.onSubmit(paymentValues);
  assert.equal(fixture.calls.some(([kind]) => kind === 'post'), false, 'no empty fallback before load');
  await new Promise(setImmediate);
  tree = fixture.render(); fixture.harness.flush();
  assert.equal(fixture.calls.filter(([kind]) => kind === 'get').length, 1);
  fixture.draft.getState().setAccountDateRequest('own', 'a', 'Local edit');
  tree = fixture.render(); fixture.harness.flush();
  await elements(tree).find((node) => node.type === fixture.FormPayment).props.onSubmit(paymentValues);
  const sent = fixture.calls.find(([kind]) => kind === 'post')[1];
  assert.equal(sent.campaignName, 'Own draft'); assert.equal(sent.addedAccounts[0].dateRequest, 'Local edit');
  assert.deepEqual(sent.selectedOffer, { offerId: 'own-offer', selectedAccountIds: ['a'] });
  assert.deepEqual(fixture.calls.filter(([kind]) => kind === 'delete'), [['delete', 'own']]);
});

test('legacy offer review transfers this draft and its local edits into builder, not a foreign campaign', async () => {
  const fixture = paymentFixture({ path: '/client/campaign/payment', query: 'draft=own' });
  const offer = { offerId: 'own-offer', selectedAccountIds: ['a'], currentAccountIds: ['changed'], isAvailable: false };
  fixture.draft.getState().initCampaign('own', [{ ...account('a'), socialAccountId: 'a', selectionId: 'own-row', source: 'offer', dateRequest: 'Local date' }],
    [{ _id: 'local-content', socialMedia: 'instagram', socialMediaGroup: 'main', mainLink: 'before', descriptions: [] }],
    { campaignName: 'Own draft', selectedOffer: offer, displayCurrency: 'EUR' });
  fixture.updates.getState().setField('local-content', 'mainLink', 'unsaved edit');
  let tree = fixture.render(); fixture.harness.flush();
  assert.equal(fixture.calls.some(([kind]) => kind === 'get'), false, 'existing edits must not trigger GET');
  await elements(tree).find((node) => node.type === 'button' && node.props.children === 'Refresh catalogue / review offer').props.onClick();
  tree = fixture.render();
  elements(tree).find((node) => node.type === fixture.OfferCatalogueReview).props.onReviewSelection({ platform: 'instagram', genre: 'chosen-by-user' });
  const restored = fixture.builder.getState();
  assert.equal(restored.draftId, 'own'); assert.equal(restored.campaignName, 'Own draft');
  assert.equal(restored.selectedOfferId, 'own-offer'); assert.deepEqual(restored.selectedOfferAccountIds, ['a']);
  assert.equal(restored.selectedAccounts[0].dateRequest, 'Local date'); assert.equal(restored.selectedAccounts[0].selectionId, 'own-row');
  assert.equal(restored.campaignContent[0].mainLink, 'unsaved edit');
  assert.ok(fixture.navigation[0].includes('genre=chosen-by-user'));
  assert.equal(fixture.calls.some(([kind]) => kind === 'post' || kind === 'delete'), false);
});

test('catalogue invalidation fetches on mounting the real query and does not replace saved membership', async () => {
  let calls = 0;
  const { usePublishedOffersQuery } = load('src/entities/client-side/campaign-creator-page/offer/api/offer.queries.ts', {
    '@tanstack/react-query': { useQuery: (options) => options }, axios: { isAxiosError: () => false },
    './offer.api': { getPublishedOffers: async () => { calls++; return [{ id: 'offer-1', connectedAccounts: ['changed'] }]; } },
  });
  const store = builderFixture(); const client = new QueryClient();
  const options = usePublishedOffersQuery('instagram', 'chosen-genre');
  assert.equal(usePublishedOffersQuery('', '').enabled, false);
  await client.fetchQuery(options);
  await client.invalidateQueries({ queryKey: ['publishedOffers'], refetchType: 'none' });
  assert.equal(calls, 1);
  const observer = new QueryObserver(client, options); const unsubscribe = observer.subscribe(() => {});
  await new Promise(setImmediate);
  assert.equal(calls, 2); assert.deepEqual(store.getState().selectedOfferAccountIds, ['a', 'b']);
  unsubscribe(); client.clear();
});

test('proposal preparation keeps the saved option price instead of deriving it from account totals', () => {
  const harness = hookHarness(); const session = new Map(); const ButtonMain = () => {};
  const proposalStore = load('src/client-side/store/proposal-share/proposal-campaign.ts', { ...common,
    '@/client-side/utils': { buildProposalPatchBody: () => ({ addedAccounts: [], campaignContent: [] }) },
  }).useProposalCampaignStore;
  const { ProposalCampaignPageShare } = load('src/client-side/widgets/campaign-share/table-pages/proposal-page-table.tsx', {
    react: harness.hooks, '../campaign-table/table-proposal': {}, '../campaign-table/table-insight': {},
    '../live-view-card/live-view': {}, '../live-view-card/live-view-card-insight': {}, '@/components': { ButtonMain },
    '@/components/ui/modal-fix/Modal': {}, '@/api/client/campaign/campaign.api': {}, 'react-toastify': { toast: {} },
    '@/client-side/store': { useProposalCampaignStore: proposalStore, useUpdateCampaign: { getState: () => ({ patches: {} }) } },
    'react-router-dom': { useNavigate: () => () => {} }, '@/client-side/hooks': { useGroupPromos: () => ({}) },
    '../model/live-view-content.helpers': { buildLiveViewGroups: () => ({ byGroup: { main: [], music: [], press: [] } }) },
  }, { sessionStorage: { setItem: (key, value) => session.set(key, value) } });
  const tree = harness.render(() => ProposalCampaignPageShare({ campaign: { campaignId: 'P', campaignName: 'Proposal',
    selectedOption: { optionIndex: 2, price: 83, addedAccounts: [{ publicPrice: 100 }], campaignContent: [] } }, view: 1, flag: true }));
  elements(tree).find((node) => node.type === ButtonMain && node.props.text === 'Approve').props.onClick();
  assert.equal(JSON.parse(session.get('proposalPaymentPayload')).payload.campaignPrice, 83);
  assert.equal(proposalStore.getState().getProposalPayload('P', 2).campaignPrice, 83);
});

// K1–K3: NONZERO MAPS BELOW ARE SYNTHETIC, not captured rates or server totals.
// Field names parsedPrices / connectedAccounts.prices were confirmed by the user's HTTP screenshot.
const publishedOfferMappers = load('src/entities/client-side/campaign-creator-page/offer/model/offer.mappers.ts');
const catalogueOfferDto = (overrides = {}) => ({
  _id: 'new-catalogue-offer', title: 'Synthetic catalogue offer', price: 999,
  parsedPrices: { EUR: 70, USD: 76, GBP: 65 },
  connectedAccounts: [{ ...account('catalogue-A'), followers: 100, prices: { EUR: 30, USD: 34, GBP: 25 } }],
  ...overrides,
});

test('published mapper preserves package and connected-account maps, zero and genuinely missing values', () => {
  const dto = catalogueOfferDto(); const offer = publishedOfferMappers.mapPublishedOfferDto(dto);
  assert.deepEqual(offer.prices, dto.parsedPrices);
  assert.deepEqual(offer.connectedAccounts[0].prices, dto.connectedAccounts[0].prices);
  assert.notEqual(offer.prices, dto.parsedPrices);
  assert.notEqual(offer.connectedAccounts[0].prices, dto.connectedAccounts[0].prices);
  for (const invalid of [undefined, null, '0', -1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    const mapped = publishedOfferMappers.mapPublishedOfferDto(catalogueOfferDto({
      parsedPrices: { EUR: 0, USD: invalid }, connectedAccounts: [{ ...dto.connectedAccounts[0], prices: { EUR: 0, USD: invalid } }],
    }));
    assert.deepEqual(mapped.prices, { EUR: 0 });
    assert.deepEqual(mapped.connectedAccounts[0].prices, { EUR: 0 });
    assert.equal(totals.priceForCurrency(mapped.prices, 'USD'), null);
  }
  for (const absent of [null, undefined]) {
    const mapped = publishedOfferMappers.mapPublishedOfferDto(catalogueOfferDto({ parsedPrices: absent,
      connectedAccounts: [{ ...dto.connectedAccounts[0], prices: absent }] }));
    assert.deepEqual(mapped.prices, {}); assert.deepEqual(mapped.connectedAccounts[0].prices, {});
  }
});

test('real catalogue OfferCard selects converted maps in EUR/USD/GBP and consumes manual overlap without double pricing', () => {
  for (const [code, symbol, packagePrice, extraPrice] of [['EUR', '€', 70, 20], ['USD', '$', 76, 22], ['GBP', '£', 65, 18]]) {
    const store = builderFixture(); store.getState().actions.reset(); const actions = store.getState().actions;
    actions.setSelectedCurrency(code); actions.setCampaignName('Synthetic campaign');
    const ref = { campaignContentItemId: 'c', descriptionId: null, additionalBriefId: null };
    actions.setCampaignContent([{ _id: 'c', socialMedia: 'instagram', socialMediaGroup: 'main', profileType: 'community',
      mainLink: 'https://example.test/content', descriptions: [], additionalBrief: [], taggedUser: '', taggedLink: '' }]);
    actions.togglePromoCard(account('catalogue-A', { prices: { EUR: 31, USD: 35, GBP: 26 }, selectedCampaignContentItem: ref }));
    const selectionId = store.getState().selectedAccounts[0].selectionId;
    actions.togglePromoCard(account('B', { prices: { EUR: 20, USD: 22, GBP: 18 } }));
    const offer = publishedOfferMappers.mapPublishedOfferDto(catalogueOfferDto());
    const card = offerCardFixture(store, () => ({ currency: code, key: symbol }));
    const tree = card.render(offer); assert.ok(JSON.stringify(tree).includes(`${packagePrice}${symbol}`));
    elements(tree).find((n) => n.type === card.ButtonMain).props.onClick();
    const state = store.getState();
    assert.equal(state.totalPriceReady, true); assert.equal(state.totalPrice, packagePrice + extraPrice);
    assert.deepEqual(state.selectedOfferAccountIds, ['catalogue-A']); assert.deepEqual(state.selectedPromoCardIds, ['B']);
    const member = state.selectedAccounts.find((a) => a.accountId === 'catalogue-A');
    assert.equal(member.selectionId, selectionId); assert.deepEqual(member.selectedCampaignContentItem, ref);
    assert.deepEqual(member.prices, offer.connectedAccounts[0].prices); assert.equal(member.source, 'offer');
    assert.equal(state.selectedAccounts.length, 2);
    const body = regularPayload(store, { displayCurrency: state.selectedCurrency });
    assert.deepEqual(body.selectedOffer, { offerId: offer.id, selectedAccountIds: ['catalogue-A'] });
    assert.equal(body.displayCurrency, code); assert.equal(body.campaignPrice, packagePrice + extraPrice);
    actions.selectOffer({ offerId: null });
    assert.deepEqual(store.getState().selectedAccounts.map((a) => a.accountId), ['B']);
    assert.equal(store.getState().totalPrice, extraPrice);
  }
});

test('USD/GBP restored draft to a different real catalogue selection reaches summary, strategy and checkout in the same currency', async () => {
  for (const [code, symbol, packagePrice, extraPrice] of [['USD', '$', 76, 27], ['GBP', '£', 65, 23]]) {
    const store = builderFixture(); const draft = draftExample(); draft.displayCurrency = code; hydrateFixture(store, draft);
    const offer = publishedOfferMappers.mapPublishedOfferDto(catalogueOfferDto());
    const card = offerCardFixture(store, () => ({ currency: code, key: symbol }));
    elements(card.render(offer)).find((n) => n.type === card.ButtonMain).props.onClick();
    const state = store.getState();
    assert.equal(state.selectedCurrency, symbol); assert.deepEqual(state.selectedOfferPrices, offer.prices);
    assert.equal(state.totalPriceReady, true); assert.equal(state.totalPrice, packagePrice + extraPrice);
    const footer = load('src/widgets/client-side/campaign-creator-page/footer-summary/footer-summary.tsx').FooterSummary({
      selectedCurrency: symbol, selectedOfferId: state.selectedOfferId, selectedPromoCardIds: state.selectedPromoCardIds,
      totalPrice: state.totalPrice, totalPriceReady: state.totalPriceReady, canProceed: true,
    });
    assert.ok(JSON.stringify(footer).includes(`${packagePrice + extraPrice}${symbol}`));
    const strategy = strategyFixture(store); const strategyTree = strategy.render();
    assert.ok(elements(strategyTree).some((n) => n.type === strategy.Bar));
    const payment = paymentFixture({ builder: store }); const page = payment.render(); payment.harness.flush();
    await elements(page).find((n) => n.type === payment.FormPayment).props.onSubmit(paymentValues);
    const body = payment.calls.find(([kind]) => kind === 'post')[1];
    assert.equal(body.displayCurrency, code); assert.equal(body.campaignPrice, packagePrice + extraPrice);
    assert.equal(body.paymentDetails.amount, packagePrice + extraPrice);
    assert.deepEqual(body.selectedOffer, { offerId: offer.id, selectedAccountIds: ['catalogue-A'] });
    assert.ok(body.addedAccounts.some((a) => a.socialAccountId === draft.addedAccounts[2].socialAccountId));
  }
});

test('a fresh catalogue selection retains identity and uses its maps in the real summary/footer after currency changes', () => {
  const store = builderFixture(); store.getState().actions.reset(); const harness = hookHarness();
  let selectedCurrency = { currency: 'EUR', key: '€' }; const navigated = [];
  const offer = publishedOfferMappers.mapPublishedOfferDto(catalogueOfferDto());
  const card = offerCardFixture(store, () => selectedCurrency);
  elements(card.render(offer)).find((n) => n.type === card.ButtonMain).props.onClick();
  store.getState().actions.togglePromoCard(account('B', { prices: { EUR: 20, USD: 22, GBP: 18 } }));
  const member = store.getState().selectedAccounts.find((a) => a.accountId === 'catalogue-A');
  const { useCampaignProceedSummary } = load('src/widgets/client-side/campaign-creator-page/build-campaign/model/use-campaign-proceed-summary.tsx', {
    react: harness.hooks, 'react-router-dom': { useNavigate: () => (url) => navigated.push(url) },
    [builderModule]: { useCampaignBuilderStore: store }, [totalsModule]: totals,
    '@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params': {
      useBuildCampaignParams: () => ({ selectedCurrency }),
    },
  });
  const FooterSummary = load('src/widgets/client-side/campaign-creator-page/footer-summary/footer-summary.tsx').FooterSummary;
  for (const [code, symbol, total] of [['USD', '$', 98], ['GBP', '£', 83], ['EUR', '€', 90]]) {
    selectedCurrency = { currency: code, key: symbol }; store.getState().actions.setSelectedCurrency(code);
    const vm = harness.render(() => useCampaignProceedSummary({})); harness.flush();
    assert.equal(vm.canProceed, true); assert.equal(vm.totalPrice, total);
    const footer = FooterSummary({ ...vm, selectedCurrency: symbol, totalPriceReady: vm.totalPriceReady });
    assert.ok(JSON.stringify(footer).includes(`${total}${symbol}`));
    assert.ok(JSON.stringify(card.render(offer)).includes(`${offer.prices[code]}${symbol}`));
    vm.handleProceed(); assert.ok(navigated.at(-1).endsWith(`currency=${code}`));
    const state = store.getState();
    assert.equal(state.selectedOfferId, offer.id); assert.deepEqual(state.selectedOfferAccountIds, ['catalogue-A']);
    assert.equal(state.selectedAccounts.find((a) => a.accountId === member.accountId).selectionId, member.selectionId);
    const body = regularPayload(store, { displayCurrency: state.selectedCurrency });
    assert.equal(body.displayCurrency, code); assert.equal(body.campaignPrice, total);
  }
});

test('a zero-price catalogue Offer remains ready alone and with independent B in every currency', async () => {
  for (const [code, symbol, bPrice] of [['EUR', '€', 20], ['USD', '$', 22], ['GBP', '£', 18]]) {
    const store = builderFixture(); store.getState().actions.reset();
    store.getState().actions.setSelectedCurrency(code);
    const offer = publishedOfferMappers.mapPublishedOfferDto(catalogueOfferDto({ parsedPrices: { EUR: 0, USD: 0, GBP: 0 } }));
    const card = offerCardFixture(store, () => ({ currency: code, key: symbol }));
    const tree = card.render(offer); assert.ok(JSON.stringify(tree).includes(`0${symbol}`));
    elements(tree).find((n) => n.type === card.ButtonMain).props.onClick();
    assert.equal(store.getState().selectedOfferPrice, 0); assert.equal(store.getState().totalPrice, 0);
    assert.equal(store.getState().totalPriceReady, true);
    const payment = paymentFixture({ builder: store }); const page = payment.render(); payment.harness.flush();
    await elements(page).find((n) => n.type === payment.FormPayment).props.onSubmit(paymentValues);
    assert.equal(payment.calls.find(([kind]) => kind === 'post')[1].campaignPrice, 0);
    store.getState().actions.togglePromoCard(account('B', { prices: { EUR: 20, USD: 22, GBP: 18 } }));
    assert.equal(store.getState().totalPriceReady, true); assert.equal(store.getState().totalPrice, bPrice);
  }
});

test('missing, null or invalid catalogue currency stays unavailable, never scalar EUR or a previous Offer map', async () => {
  for (const [code, symbol] of [['EUR', '€'], ['USD', '$'], ['GBP', '£']]) {
    for (const invalid of [undefined, null, -1, '0']) {
      const store = builderFixture(); const draft = draftExample(); draft.displayCurrency = code; hydrateFixture(store, draft);
      const offer = publishedOfferMappers.mapPublishedOfferDto(catalogueOfferDto({ parsedPrices: { EUR: 70, USD: 76, GBP: 65, [code]: invalid } }));
      const card = offerCardFixture(store, () => ({ currency: code, key: symbol }));
      const tree = card.render(offer); assert.ok(JSON.stringify(tree).includes('Price unavailable in ' + code));
      elements(tree).find((n) => n.type === card.ButtonMain).props.onClick();
      assert.equal(store.getState().totalPriceReady, false); assert.equal(store.getState().selectedOfferPrice, null);
      assert.equal(totals.priceForCurrency(store.getState().selectedOfferPrices, code), null);
      const payment = paymentFixture({ builder: store }); const page = payment.render(); payment.harness.flush();
      await elements(page).find((n) => n.type === payment.FormPayment).props.onSubmit(paymentValues);
      assert.equal(payment.calls.some(([kind]) => kind === 'post' || kind === 'delete'), false);
    }
  }
});

function catalogueSearchFixture(vm) {
  const { BuildCampaign } = load('src/widgets/client-side/campaign-creator-page/build-campaign/ui/build-campaign.tsx', {
    [totalsModule]: totals, 'react-router-dom': { useSearchParams: () => [new URLSearchParams()] },
    '@/widgets/client-side/campaign-creator-page/build-campaign/model/use-build-campaign-view.ts': { useBuildCampaignView: () => vm },
    '@components/ui/no-array/no-data': {}, '@/constants/social-medias': { getSocialMediaIcon: () => '' },
    '@/features/client-side/campaign-creator-page/build-campaign-filters/ui/search-input.tsx': {},
    '@/features/client-side/campaign-creator-page/build-campaign-filters/ui/budget-select.tsx': {},
    '@/features/client-side/campaign-creator-page/build-campaign-filters/ui/sort-select.tsx': {},
    '@/features/client-side/campaign-creator-page/build-campaign-filters/ui/selected-filters.tsx': {},
    '@/features/client-side/campaign-creator-page/build-campaign-filters/ui/view-switch.tsx': {},
    '@/features/client-side/campaign-creator-page/build-campaign-filters/ui/filter-panel.tsx': {},
    '@/widgets/client-side/campaign-creator-page/build-campaign/components/cards-container.tsx': {},
  });
  return BuildCampaign();
}

test('real search dropdown follows EUR/USD/GBP, shows true zero and unavailable, and keeps its pick handler', () => {
  for (const [code, symbol, price] of [['EUR', '€', 25], ['USD', '$', 27], ['GBP', '£', 23]]) {
    const picked = []; const item = account('search-result', { prices: { EUR: 25, USD: 27, GBP: 23 } });
    const vm = { selectedCurrency: { currency: code, key: symbol }, isSearchMode: true, isDropdownOpen: true,
      searchResults: [item], onPickSearchItem: (a) => picked.push(a) };
    let tree = catalogueSearchFixture(vm); assert.ok(JSON.stringify(tree).includes(`${price}${symbol}`));
    elements(tree).find((n) => n.key === item.accountId && n.props.onClick).props.onClick();
    assert.deepEqual(picked, [item]);
    item.prices[code] = 0; tree = catalogueSearchFixture(vm); assert.ok(JSON.stringify(tree).includes(`0${symbol}`));
    for (const invalid of [null, undefined, -1, '0']) {
      item.prices[code] = invalid; tree = catalogueSearchFixture(vm);
      assert.ok(JSON.stringify(tree).includes('Price unavailable'));
    }
  }
});

function draftSaveFlightFixture(step) {
  const store = builderFixture(); const pending = []; const calls = []; const success = []; const errors = [];
  const api = (payload) => { calls.push(payload); return new Promise((resolve, reject) => pending.push({ resolve, reject })); };
  const toast = { success: (s) => success.push(s), error: (s) => errors.push(s) };
  if (step === 'strategy') {
    const strategy = strategyFixture(store, { save: api, toast });
    return { store, calls, pending, success, errors, render: () => {
      const button = elements(strategy.render()).find((n) => n.type === strategy.DraftButton);
      const native = strategy.DraftButton(button.props);
      return { save: button.props.onClick, isSaving: native.props.disabled, busy: native.props['aria-busy'] };
    } };
  }
  const harness = hookHarness();
  const dependencies = { react: harness.hooks, 'react-toastify': { toast },
    '@tanstack/react-query': { useQueryClient: () => ({ invalidateQueries: async () => {} }) },
    [builderModule]: { useCampaignBuilderStore: store }, [saveResultModule]: saveResults,
    [builderTypesModule]: builderTypes, [builderTypesModule + '.ts']: builderTypes, [offerModule]: offerHelpers,
    '@/entities/client-side/campaign-creator-page/campaign-builder/model/build-draft-payload': draftPayloads,
    '@/entities/client-side/campaign-draft/api/campaign-draft.api': { postCampaignDraft: api, updateCampaignDraft: api },
  };
  const hook = step === 'addAccounts'
    ? load('src/pages/client-side/campaign-creator-page/model/use-save-campaign-creator-draft.ts', dependencies).useSaveCampaignCreatorDraft
    : load('src/pages/client-side/campaign-post-content/model/use-campaign-post-content-page-draft.ts', dependencies).useCampaignPostContentPageDraft;
  const render = () => harness.render(() => hook({ postCampaignDraft: api, updateCampaignDraft: api,
    buildPayload: () => ({ socialMedia: 'instagram', campaignContent: store.getState().campaignContent, addedAccounts: regularPayload(store).addedAccounts }) }));
  render()[step === 'addAccounts' ? 'open' : 'openDraftModal']();
  return { store, calls, pending, success, errors, render: () => {
    const vm = render(); return { save: vm.save ?? vm.onSaveDraft, isSaving: vm.isSaving };
  } };
}

for (const step of ['addAccounts', 'addContent', 'strategy']) {
  test(`real ${step} save locks synchronous double calls, reuses fresh draft ID/content via the old callback and releases on failure`, async () => {
    const f = draftSaveFlightFixture(step); const old = f.render().save;
    const first = old(); const duplicate = old();
    assert.equal(f.calls.length, 1); assert.equal(f.render().isSaving, true);
    f.pending[0].resolve({ data: { data: { draftId: 'saved-id' } } }); await Promise.all([first, duplicate]);
    assert.equal(f.render().isSaving, false); assert.equal(f.store.getState().draftId, 'saved-id');
    f.store.getState().actions.togglePromoCard(account('fresh-B', { price: 25 }));
    const next = old(); assert.equal(f.calls.length, 2); assert.equal(f.calls[1].draftId, 'saved-id');
    assert.ok(f.calls[1].addedAccounts.some((a) => a.socialAccountId === 'fresh-B'));
    assert.deepEqual(f.calls[1].selectedOffer, { offerId: 'offer-1', selectedAccountIds: ['a', 'b'] });
    f.pending[1].reject(new Error('network error')); await next;
    assert.equal(f.render().isSaving, false); assert.equal(f.success.length, 1); assert.equal(f.errors.length, 1);
    const retry = old(); assert.equal(f.calls[2].draftId, 'saved-id');
    f.pending[2].resolve({ data: { data: { draftId: 'saved-id' } } }); await retry;
    assert.equal(f.render().isSaving, false); assert.equal(f.success.length, 2);
    f.store.getState().actions.selectOffer({ offerId: null });
    const clear = old(); assert.equal(f.calls[3].selectedOffer, null);
    assert.ok(f.calls[3].addedAccounts.every((row) => row.source === 'standalone' && !row.offerId));
    f.pending[3].resolve({ data: { data: { draftId: 'saved-id' } } }); await clear;
    assert.equal(f.render().isSaving, false);
  });

  test(`real ${step} create without returned draft ID is not success and releases the save lock`, async () => {
    const f = draftSaveFlightFixture(step); const save = f.render().save;
    const missing = save(); f.pending[0].resolve({ data: { data: {} } }); await missing;
    assert.equal(f.store.getState().draftId, null); assert.equal(f.success.length, 0); assert.equal(f.errors.length, 1);
    assert.equal(f.render().isSaving, false);
    const retry = save(); assert.equal(f.calls.length, 2); assert.equal(f.calls[1].draftId, undefined);
    f.pending[1].resolve({ data: { data: { draftId: 'retry-id' } } }); await retry;
    assert.equal(f.store.getState().draftId, 'retry-id'); assert.equal(f.success.length, 1);
  });
}

const taxonomyRoot = '@/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/';
const taxonomy = load('src/widgets/client-side/campaign-tables/model/account-taxonomy.ts', {
  [taxonomyRoot + 'music-genres.data']: load('src/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/music-genres.data.ts'),
  [taxonomyRoot + 'categories.data']: load('src/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/categories.data.ts'),
  [taxonomyRoot + 'creator-categories.data']: load('src/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/creator-categories.data.ts'),
});
const GenresCell = load('src/widgets/client-side/campaign-tables/ui/cells/genres-cell.tsx', { '../../model/account-taxonomy': taxonomy }).GenresCell;
const CountriesCell = load('src/widgets/client-side/campaign-tables/ui/cells/countries-cell.tsx').CountriesCell;

test('real Offer mapper -> selectOffer -> Strategy rows retains account taxonomy/countries and workflow, not Offer genre', () => {
  const dto = catalogueOfferDto({ genre: 'not_account_taxonomy', connectedAccounts: [{ ...account('catalogue-A'), followers: 100,
    countries: [{ country: 'Italy', percentage: 8.3 }, { country: 'Canada' }],
    communityMusicGenres: ['techno_hard_peak', 'future_genre'], communityThemeTopics: ['ibiza'],
    creatorMusicGenres: ['electronic_edm'], creatorContentFocus: ['music_dance'], prices: { EUR: 30, USD: 34, GBP: 25 } }] });
  const original = structuredClone(dto); const offer = publishedOfferMappers.mapPublishedOfferDto(dto);
  const store = builderFixture(); store.getState().actions.reset(); const actions = store.getState().actions;
  const ref = { campaignContentItemId: 'content', descriptionId: null, additionalBriefId: null };
  actions.togglePromoCard(account('catalogue-A', { price: 30, selectedCampaignContentItem: ref, dateRequest: 'date:2026-11-01' }));
  const selectionId = store.getState().selectedAccounts[0].selectionId;
  const card = offerCardFixture(store, () => ({ currency: 'EUR', key: '€' }));
  elements(card.render(offer)).find((n) => n.type === card.ButtonMain).props.onClick();
  const selected = store.getState().selectedAccounts[0];
  for (const field of ['countries', 'communityMusicGenres', 'communityThemeTopics', 'creatorMusicGenres', 'creatorContentFocus']) {
    assert.deepEqual(selected[field], original.connectedAccounts[0][field]);
  }
  assert.equal(selected.selectionId, selectionId); assert.deepEqual(selected.selectedCampaignContentItem, ref);
  assert.equal(selected.dateRequest, 'date:2026-11-01');
  const rows = load('src/widgets/client-side/campaign-tables/model/campaign-strategy.helpers.ts').buildStrategyRows({ accounts: [selected], items: [], group: 'main' });
  const labels = JSON.stringify(GenresCell({ row: rows[0] }));
  assert.ok(labels.includes('Hard, Peak')); assert.ok(labels.includes('Ibiza')); assert.ok(labels.includes('future_genre'));
  assert.equal(labels.includes('Dance'), false); assert.equal(labels.includes('not_account_taxonomy'), false);
  const countries = JSON.stringify(CountriesCell({ row: rows[0] }));
  assert.ok(countries.includes('Italy')); assert.ok(countries.includes('8.3%')); assert.ok(countries.includes('Canada'));
  assert.equal(countries.includes('undefined%'), false);
  actions.selectOffer({ offerId: 'incomplete-metadata', offerPrice: 80, accountIds: ['catalogue-A'], accounts: [account('catalogue-A')] });
  assert.deepEqual(store.getState().selectedAccounts[0].countries, selected.countries, 'missing fields do not erase restored metadata');
  assert.deepEqual(store.getState().selectedAccounts[0].communityMusicGenres, selected.communityMusicGenres);
  assert.deepEqual(dto, original, 'registration/API values are not rewritten to labels');
  const draftBody = draftPayloads.buildCampaignDraftPayload(store.getState(), 'addAccounts');
  assert.equal(Object.hasOwn(draftBody, 'campaignContent'), false);
  assert.deepEqual(draftBody.selectedOffer.selectedAccountIds, ['catalogue-A']);
});

test('Strategy taxonomy uses Creator/Community registration labels, raw unknown fallback and separate Countries', () => {
  const creator = account('creator', { profileType: 'creator', creatorMusicGenres: ['electronic_drum_and_bass', 'unknown_code'],
    creatorContentFocus: ['music_dance'], communityMusicGenres: ['techno_hard_peak'], communityThemeTopics: ['ibiza'] });
  const original = structuredClone(creator);
  const groups = taxonomy.getAccountTaxonomyGroups(creator);
  assert.deepEqual(groups, [
    { title: 'Music genres', items: [{ value: 'electronic_drum_and_bass', label: 'D&B' }, { value: 'unknown_code', label: 'unknown_code' }] },
    { title: 'Content focus', items: [{ value: 'music_dance', label: 'Dance' }] },
  ]);
  const tree = JSON.stringify(GenresCell({ row: { account: creator } }));
  assert.ok(tree.includes('Content focus')); assert.ok(tree.includes('Dance')); assert.ok(tree.includes('unknown_code'));
  assert.equal(tree.includes('Ibiza'), false); assert.deepEqual(creator, original);
  const legacyManual = account('manual', { genres: ['house_tech_house', 'unrecognised'], profileType: 'community' });
  const manualLabels = JSON.stringify(GenresCell({ row: { account: legacyManual } }));
  assert.ok(manualLabels.includes('Tech House')); assert.ok(manualLabels.includes('unrecognised'));
  assert.deepEqual(legacyManual.genres, ['house_tech_house', 'unrecognised']);
  const columns = load('src/widgets/client-side/campaign-tables/model/campaign-strategy.data.ts').getStrategyColumns({ group: 'main', mode: 'readonlyDate', insights: true });
  assert.ok(columns.includes('genres') && columns.includes('countries'));
  const draft = draftExample();
  Object.assign(draft.addedAccounts[0], { communityMusicGenres: ['house_tech_house'], communityThemeTopics: ['ibiza'] });
  const restored = hydrateFixture(builderFixture(), draft).selectedAccounts[0];
  assert.deepEqual(restored.communityMusicGenres, ['house_tech_house']);
  assert.deepEqual(restored.communityThemeTopics, ['ibiza']);
  assert.ok(JSON.stringify(GenresCell({ row: { account: restored } })).includes('Ibiza'));
});

test('creation Strategy stays table-only for old Live View and edit URL state, without the shared view switcher/cards', () => {
  for (const view of [1, -1, 0, 99]) {
    const fixture = strategyFixture(builderFixture(), { view }); const tree = fixture.render();
    const sections = elements(tree).filter((n) => n.type === fixture.Section);
    assert.ok(sections.length > 0); assert.ok(sections.every((n) => n.props.mode === 'readonlyDate'));
    assert.equal(elements(tree).some((n) => n.type === fixture.LiveViewCard || n.type === fixture.ViewChange), false);
  }
});

function realContentFormFixture(store, defaultCampaignContent) {
  const harness = hookHarness(); let values; let watcher;
  const form = {
    control: {}, formState: { errors: {} },
    getValues: (key) => key ? values[key] : values,
    setValue(key, value) { values[key] = value; watcher?.(values); },
    watch(callback) { watcher = callback; return { unsubscribe() { watcher = undefined; } }; },
    trigger: async () => true,
  };
  const schema = load('src/widgets/client-side/campaign-post-content/model/campaign-post-content.schema.ts', { zod: require('zod') });
  const { useCampaignPostContent } = load('src/widgets/client-side/campaign-post-content/model/use-campaign-post-content.ts', {
    react: harness.hooks, zod: require('zod'), '@hookform/resolvers/zod': { zodResolver: () => () => {} },
    'react-hook-form': { useForm: (options) => { values ??= structuredClone(options.defaultValues); return form; }, useWatch: () => values.blocks },
    './campaign-post-content.schema': schema, './campaign-post-content.helpers': contentHelpers,
    [builderModule]: { useCampaignBuilderStore: store },
  });
  const render = () => harness.render(() => useCampaignPostContent({ accounts: store.getState().selectedAccounts,
    campaignName: store.getState().campaignName, campaignPrice: store.getState().totalPrice, defaultCampaignContent }));
  let vm = render(); harness.flush();
  return { form, render, get vm() { return vm = render(); } };
}

function realContentSaveFixture(store, buildPayload) {
  const calls = []; const harness = hookHarness();
  const api = async (body) => { calls.push(structuredClone(body)); return { data: { data: { draftId: store.getState().draftId ?? 'new-content-draft' } } }; };
  const { useCampaignPostContentPageDraft } = load('src/pages/client-side/campaign-post-content/model/use-campaign-post-content-page-draft.ts', {
    react: harness.hooks, [offerModule]: offerHelpers, [saveResultModule]: saveResults,
    [builderModule]: { useCampaignBuilderStore: store }, [builderTypesModule + '.ts']: builderTypes,
    'react-toastify': { toast: { success() {}, error(message) { assert.fail(message); } } },
    '@/entities/client-side/campaign-draft/api/campaign-draft.api': { postCampaignDraft: api, updateCampaignDraft: api },
  });
  const vm = harness.render(() => useCampaignPostContentPageDraft({ buildPayload }));
  return { calls, save: vm.onSaveDraft };
}

test('fresh real content form -> builder -> actual content save emits arrays and pins IDs across saves/strategy/create', async () => {
  const store = builderFixture(); const fixture = realContentFormFixture(store);
  assert.ok(fixture.form.getValues('blocks').every((b) => !b.savedContent));
  const vm = fixture.vm; const block = fixture.form.getValues('blocks')[0];
  vm.onChangeField(block.id, 'mainLink', 'https://example.test/fresh');
  vm.onChangeField(block.id, 'additionalBrief', 'Fresh brief');
  vm.onChangeDescription(block.id, block.fields.descriptions[0].id, 'Description one');
  vm.onAddDescription(block.id);
  const secondId = fixture.form.getValues('blocks')[0].fields.descriptions[1].id;
  vm.onChangeDescription(block.id, secondId, 'Description two');
  const saveFixture = realContentSaveFixture(store, vm.buildPayload);
  await saveFixture.save(); const first = saveFixture.calls[0];
  assert.equal(first.displayCurrency, 'EUR'); assert.deepEqual(first.selectedOffer, { offerId: 'offer-1', selectedAccountIds: ['a', 'b'] });
  assert.ok(Array.isArray(first.campaignContent[0].additionalBrief));
  assert.equal(first.campaignContent[0].additionalBrief[0].additionalBrief, 'Fresh brief');
  assert.equal(first.campaignContent[0].descriptions.length, 2);
  assert.ok(first.campaignContent[0].descriptions.every((d) => d._id && typeof d.description === 'string'));
  for (const row of first.addedAccounts) {
    const item = first.campaignContent.find((c) => c._id === row.selectedCampaignContentItem.campaignContentItemId);
    assert.ok(item.descriptions.some((d) => d._id === row.selectedCampaignContentItem.descriptionId));
    assert.ok(item.additionalBrief.some((b) => b._id === row.selectedCampaignContentItem.additionalBriefId));
  }
  await saveFixture.save(); const second = saveFixture.calls[1];
  assert.equal(second.draftId, 'new-content-draft'); assert.deepEqual(second.campaignContent, first.campaignContent);
  assert.deepEqual(second.addedAccounts, first.addedAccounts);
  const payload = fixture.vm.buildPayload(); store.getState().actions.syncSelectedAccountsContent(payload.addedAccounts);
  const state = store.getState(); const strategy = strategyPayloads.buildStrategyDraftPayload({ campaignName: state.campaignName,
    accounts: state.selectedAccounts, content: state.campaignContent, selectedOffer: offerHelpers.getBuilderSelectedOffer(state) });
  assert.deepEqual(strategy.campaignContent, first.campaignContent);
  assert.deepEqual(regularPayload(store).campaignContent, first.campaignContent);
  assert.ok(fixture.form.getValues('blocks')[0].savedContent.length);
});

test('fresh empty brief is [], and loaded multiple variants/null refs survive real content saves and selective removal', async () => {
  const freshStore = builderFixture(); const fresh = realContentFormFixture(freshStore);
  const freshSave = realContentSaveFixture(freshStore, fresh.vm.buildPayload);
  await freshSave.save(); assert.deepEqual(freshSave.calls[0].campaignContent[0].additionalBrief, []);
  assert.ok(freshSave.calls[0].addedAccounts.every((a) => a.selectedCampaignContentItem.additionalBriefId === null));

  const store = builderFixture(); const draft = draftExample();
  const item = draft.campaignContent[0];
  item.additionalBrief.push({ _id: '000000000000000000000777', additionalBrief: 'Second brief variant' });
  draft.addedAccounts[0].selectedCampaignContentItem.additionalBriefId = item.additionalBrief[0]._id;
  draft.addedAccounts[1].selectedCampaignContentItem.additionalBriefId = item.additionalBrief.at(-1)._id;
  draft.addedAccounts[2].selectedCampaignContentItem = { campaignContentItemId: item._id, descriptionId: null, additionalBriefId: null };
  hydrateFixture(store, draft); const fixture = realContentFormFixture(store, store.getState().campaignContent);
  const saver = realContentSaveFixture(store, fixture.vm.buildPayload);
  await saver.save(); const body = saver.calls[0];
  assert.deepEqual(body.campaignContent[0].additionalBrief, item.additionalBrief);
  assert.deepEqual(body.campaignContent[0].descriptions, item.descriptions);
  assert.deepEqual(body.addedAccounts.map((r) => r.selectedCampaignContentItem), draft.addedAccounts.map((r) => r.selectedCampaignContentItem));
  const block = fixture.form.getValues('blocks')[0];
  fixture.vm.onChangeField(block.id, 'additionalBrief', '');
  await saver.save(); const removed = saver.calls[1];
  assert.deepEqual(removed.campaignContent[0].additionalBrief, item.additionalBrief.slice(1));
  assert.equal(removed.addedAccounts[0].selectedCampaignContentItem.additionalBriefId, null);
  assert.equal(removed.addedAccounts[1].selectedCampaignContentItem.additionalBriefId, item.additionalBrief.at(-1)._id);
  assert.deepEqual(removed.addedAccounts[2].selectedCampaignContentItem, draft.addedAccounts[2].selectedCampaignContentItem);
  await saver.save(); assert.deepEqual(saver.calls[2].campaignContent, removed.campaignContent, 'clearing the first editor must not erase a second variant on the next save');
  fixture.vm.onRemoveDescription(block.id, item.descriptions[1]._id);
  await saver.save(); assert.equal(saver.calls[3].addedAccounts[1].selectedCampaignContentItem.descriptionId, null);
  assert.equal(JSON.stringify(saver.calls).includes('[object Object]'), false);
});

test('content form grouping compares brief texts, not stringified objects, and keeps different audience variants', () => {
  const content = draftExample().campaignContent[0];
  const creator = { ...content, _id: 'creator-content', profileType: 'creator',
    additionalBrief: [{ _id: 'creator-brief', additionalBrief: 'Creator text' }] };
  const community = { ...content, profileType: 'community',
    additionalBrief: [{ _id: 'community-brief', additionalBrief: 'Community text' }] };
  const accounts = [account('creator', { profileType: 'creator' }), account('community')];
  const blocks = contentHelpers.buildBlocksFromCampaignContent({ accounts, campaignContent: [creator, community] });
  assert.equal(blocks.length, 2);
  const built = contentHelpers.buildCampaignContentFromBlocks(blocks, accounts);
  assert.deepEqual(built.find((item) => item.profileType === 'creator').additionalBrief, creator.additionalBrief);
  assert.deepEqual(built.find((item) => item.profileType === 'community').additionalBrief, community.additionalBrief);
});

test('real content save keeps brief IDs when Offer reselection reorders shared Creator/Community targets', async () => {
  const store = builderFixture();
  store.getState().actions.togglePromoCard(account('creator', { profileType: 'creator', socialMedia: 'tiktok' }));
  const form = realContentFormFixture(store);
  const block = form.form.getValues('blocks')[0];
  form.vm.onChangeField(block.id, 'additionalBrief', 'Shared text');
  await realContentSaveFixture(store, form.vm.buildPayload).save();
  store.setState({ selectedAccounts: [...store.getState().selectedAccounts].reverse() });
  const saver = realContentSaveFixture(store, form.vm.buildPayload);
  await saver.save(); await saver.save();
  assert.deepEqual(saver.calls[1].campaignContent, saver.calls[0].campaignContent);
  assert.ok(saver.calls[1].campaignContent.every((item) => item.additionalBrief.length === 1));
});

const cardPopover = load('src/widgets/client-side/campaign-creator-page/build-campaign/components/genres-countries-popover.tsx', {
  '@/hooks/global/useClickOutside': { useClickOutside() {} },
}).GenresCountriesPopover;
const promoAccountMapper = load('src/entities/client-side/campaign-creator-page/campaign-promo-account/model/promo-account.mappers.ts');
const popoverTree = (data) => cardPopover({ data, open: true, refElement: { current: null }, setOpen() {} });

test('account disclosure uses registration labels for only its profile arrays, in music-then-topics/focus order', () => {
  for (const profileType of ['creator', 'community']) {
    const dto = { ...account('card'), profileType, countries: [], prices: { EUR: 30 },
      communityMusicGenres: ['house_tech_house'], communityThemeTopics: ['ibiza', 'unknown_topic'],
      creatorMusicGenres: ['electronic_drum_and_bass'], creatorContentFocus: ['music_dance', 'unknown_focus'] };
    const original = structuredClone(dto); const data = promoAccountMapper.mapPromoAccountDto(dto);
    for (const field of ['communityMusicGenres', 'communityThemeTopics', 'creatorMusicGenres', 'creatorContentFocus']) {
      assert.deepEqual(data[field], original[field], `API mapper retains ${field}`);
    }
    const tree = popoverTree(data); const nodes = elements(tree);
    assert.deepEqual(nodes.filter((node) => node.type === 'h3').map((node) => node.props.children),
      ['Music Genre', profileType === 'creator' ? 'Content Focus' : 'Theme Topic']);
    assert.deepEqual(nodes.filter((node) => node.type === 'li').map((node) => node.props.children),
      profileType === 'creator' ? ['D&B', 'Dance', 'unknown_focus'] : ['Tech House', 'Ibiza', 'unknown_topic']);
    assert.deepEqual(dto, original, 'display cannot rewrite raw API values');
    for (const field of ['communityMusicGenres', 'communityThemeTopics', 'creatorMusicGenres', 'creatorContentFocus']) {
      assert.deepEqual(data[field], original[field], 'domain values are not replaced with labels');
    }
  }
});

test('real account grid opens secondary-only taxonomy and passes all fields; missing/empty own arrays never use opposite profile', () => {
  for (const profileType of ['creator', 'community']) {
    const harness = hookHarness(); const store = builderFixture();
    const stateBefore = store.getState();
    const { PromoCardGrid } = load('src/widgets/client-side/campaign-creator-page/build-campaign/components/promo-card-grid.tsx', {
      react: harness.hooks, [totalsModule]: totals, [builderModule + '.ts']: { useCampaignBuilderStore: store },
      '@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params.ts': {
        useBuildCampaignParams: () => ({ selectedCurrency: { key: '€', currency: 'EUR' } }) },
      '@/constants/social-medias': { getSocialMediaIcon: () => '' }, '@/utils/functions/formatFollowers': { formatFollowers: String },
      './genres-countries-popover': { GenresCountriesPopover: cardPopover },
    });
    const dto = { ...account('card'), profileType, countries: [], prices: { EUR: 30 },
      communityMusicGenres: [], communityThemeTopics: profileType === 'community' ? ['ibiza'] : ['opposite_topic'],
      creatorMusicGenres: [], creatorContentFocus: profileType === 'creator' ? ['music_dance'] : ['opposite_focus'] };
    const data = promoAccountMapper.mapPromoAccountDto(dto); const original = structuredClone(data);
    const render = () => harness.render(() => PromoCardGrid({ data, isInclude: false, isSelected: false }));
    const trigger = elements(render()).find((node) => node.type === 'div' && node.props.onClick?.length === 0 && !node.props.ref);
    assert.ok(trigger, 'secondary-only classification still enables disclosure'); trigger.props.onClick();
    const popover = elements(render()).find((node) => node.type === cardPopover);
    assert.ok(popover); assert.deepEqual(popover.props.data, data, 'four arrays/profile reach the real popover');
    assert.deepEqual(elements(popoverTree(popover.props.data)).filter((node) => node.type === 'li').map((node) => node.props.children),
      [profileType === 'creator' ? 'Dance' : 'Ibiza']);
    assert.deepEqual(elements(popoverTree(popover.props.data)).filter((node) => node.type === 'h3').map((node) => node.props.children),
      [profileType === 'creator' ? 'Content Focus' : 'Theme Topic']);
    assert.deepEqual(data, original); assert.equal(store.getState(), stateBefore, 'opening is not a selection');
    const emptyOwn = { ...data, [profileType === 'creator' ? 'creatorContentFocus' : 'communityThemeTopics']: undefined,
      musicGenres: ['legacy_combined_should_not_leak'] };
    assert.deepEqual(taxonomy.getAccountCardTaxonomy(emptyOwn).items, []);
    assert.equal(elements(popoverTree(emptyOwn)).some((node) => node.type === 'h3' || node.type === 'li'), false);
  }
});

test('catalogue table Genres preview and expanded dropdown share profile-only labels without mutating API values', () => {
  for (const profileType of ['creator', 'community']) {
    for (const secondaryOnly of [false, true]) {
      const dto = { ...account('catalogue-row'), profileType, countries: [], prices: { EUR: 30 },
        communityMusicGenres: secondaryOnly ? [] : ['house_tech_house'], communityThemeTopics: ['ibiza', 'unknown_topic'],
        creatorMusicGenres: secondaryOnly ? [] : ['electronic_drum_and_bass'], creatorContentFocus: ['music_dance', 'unknown_focus'] };
      const original = structuredClone(dto); const data = promoAccountMapper.mapPromoAccountDto(dto);
      const before = structuredClone(data); const store = builderFixture(); const stateBefore = store.getState();
      const rowHarness = hookHarness(); const tagsHarness = hookHarness();
      const { TagsDropdown } = load('src/widgets/client-side/campaign-creator-page/build-campaign/components/tags-dropdown.tsx', { react: tagsHarness.hooks });
      const { TableRowCard } = load('src/widgets/client-side/campaign-creator-page/build-campaign/components/table-row-card.tsx', {
        react: rowHarness.hooks, [totalsModule]: totals, [builderModule + '.ts']: { useCampaignBuilderStore: store },
        '@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params.ts': {
          useBuildCampaignParams: () => ({ selectedCurrency: { key: '€', currency: 'EUR' } }) },
        '@/constants/social-medias': { getSocialMediaIcon: () => '' }, '@/utils/functions/formatFollowers': { formatFollowers: String },
        '@/components': { Checkbox() {} }, './tags-dropdown': { TagsDropdown },
      });
      const row = rowHarness.render(() => TableRowCard({ data, isInclude: false, isSelected: false, isSmall: false, setIsSmall() {} }));
      const dropdown = elements(row).find((node) => node.type === TagsDropdown && node.props.placeholder === 'No genres');
      const expected = profileType === 'creator' ? ['D&B', 'Dance', 'unknown_focus'] : ['Tech House', 'Ibiza', 'unknown_topic'];
      if (secondaryOnly) expected.shift();
      assert.deepEqual(dropdown.props.items, expected);
      const renderDropdown = () => tagsHarness.render(() => TagsDropdown(dropdown.props));
      const closed = renderDropdown();
      assert.ok(elements(closed).some((node) => node.type === 'span' && node.props.title === expected[0] && node.props.children === expected[0]));
      elements(closed).find((node) => node.type === 'button').props.onClick();
      const menu = elements(renderDropdown()).find((node) => node.props.role === 'listbox');
      assert.deepEqual(elements(menu).filter((node) => node.props.title).map((node) => node.props.children), expected);
      assert.deepEqual(dto, original); assert.deepEqual(data, before); assert.equal(store.getState(), stateBefore);
    }
  }
});

test('disclosure separates profile taxonomy blocks for both/first/second/empty inputs while tables retain their contracts', () => {
  for (const profileType of ['creator', 'community']) {
    const musicField = profileType === 'creator' ? 'creatorMusicGenres' : 'communityMusicGenres';
    const secondaryField = profileType === 'creator' ? 'creatorContentFocus' : 'communityThemeTopics';
    const music = profileType === 'creator' ? ['electronic_drum_and_bass', 'unknown_music'] : ['house_tech_house', 'unknown_music'];
    const secondary = profileType === 'creator' ? ['music_dance', 'unknown_focus'] : ['ibiza', 'unknown_topic'];
    const musicLabels = profileType === 'creator' ? ['D&B', 'unknown_music'] : ['Tech House', 'unknown_music'];
    const secondaryLabels = profileType === 'creator' ? ['Dance', 'unknown_focus'] : ['Ibiza', 'unknown_topic'];
    for (const [hasMusic, hasSecondary] of [[true, true], [true, false], [false, true], [false, false]]) {
      for (const empty of [[], undefined]) {
        const data = { ...account('disclosure'), profileType, countries: [{ country: 'Italy', percentage: 8.3 }],
          communityMusicGenres: ['opposite_music'], communityThemeTopics: ['opposite_topic'],
          creatorMusicGenres: ['opposite_music'], creatorContentFocus: ['opposite_focus'],
          [musicField]: hasMusic ? music : empty, [secondaryField]: hasSecondary ? secondary : empty,
          genres: ['legacy_genre_must_not_leak'] };
        const original = structuredClone(data);
        const grouped = taxonomy.getAccountCardTaxonomyGroups(data);
        const expected = [
          ...(hasMusic ? [{ title: 'Music Genre', labels: musicLabels }] : []),
          ...(hasSecondary ? [{ title: profileType === 'creator' ? 'Content Focus' : 'Theme Topic', labels: secondaryLabels }] : []),
        ];
        assert.deepEqual(grouped.map((group) => ({ title: group.title, labels: group.items.map((item) => item.label) })), expected);
        const blocks = elements(popoverTree(data)).filter((node) => node.type === 'div' && Array.isArray(node.props.children)
          && node.props.children[0]?.type === 'h3').map((node) => ({ title: node.props.children[0].props.children,
            labels: elements(node).filter((child) => child.type === 'li').map((child) => React.Children.toArray(child.props.children).join('')) }));
        assert.deepEqual(blocks, [...expected, { title: 'Countries', labels: ['Italy 8.3%'] }]);
        const flat = taxonomy.getAccountCardTaxonomy(data);
        assert.equal(flat.title, profileType === 'creator' ? 'Content genre' : 'Music genre');
        assert.deepEqual(flat.items.map((item) => item.label), expected.flatMap((group) => group.labels), 'catalogue table remains flat');
        const strategy = taxonomy.getAccountTaxonomyGroups({ ...data, genres: [] });
        assert.deepEqual(strategy.map((group) => group.title), [
          ...(hasMusic ? ['Music genres'] : []), ...(hasSecondary ? [profileType === 'creator' ? 'Content focus' : 'Topics'] : []),
        ], 'Strategy keeps its previous titles');
        assert.deepEqual(data, original, 'render/helper cannot mutate raw values');
        assert.equal(elements(popoverTree({ ...data, countries: [] })).filter((node) => node.type === 'h3').length, expected.length);
      }
    }
  }
});

test('all filter sections toggle natively without scheduled scrolling and preserve filter callbacks/counts', () => {
  const panelHarness = hookHarness(); const sectionHarness = hookHarness(); const calls = [];
  const { FilterNode } = load('src/features/client-side/campaign-creator-page/build-campaign-filters/ui/filter-node.tsx');
  const { FilterSectionView } = load('src/features/client-side/campaign-creator-page/build-campaign-filters/ui/filter-section.tsx', {
    react: sectionHarness.hooks, './filter-node': { FilterNode },
  }, { requestAnimationFrame() { assert.fail('opening a section must not schedule scroll compensation'); } });
  const { FilterPanel } = load('src/features/client-side/campaign-creator-page/build-campaign-filters/ui/filter-panel.tsx', {
    react: panelHarness.hooks, './filter-section': { FilterSectionView }, '@components/ui/skeletons/filtre-skeleton': { FilterSkeleton() {} },
  });
  const sections = ['Social Media Platforms', 'Profile Type', 'Music Genres', 'Countries of Following', 'Additional Topics', 'Other section'].map((title, i) => ({
    id: 'section-' + i, title, methods: [], filters: [{ id: 'filter-' + i, filterName: 'Long label ' + title, count: 42, group: 'countries' }] }));
  const original = structuredClone(sections);
  const props = { sections, isSmall: false, isLoading: false, selectedIds: [], filterMethod: 'or', setFilterMethod() {}, onToggle() {}, onToggleFilter: (value) => calls.push(value) };
  const renderSection = (id) => {
    const tree = panelHarness.render(() => FilterPanel(props));
    const node = elements(tree).find((node) => node.type === FilterSectionView && node.props.section.id === id);
    const result = sectionHarness.render(() => FilterSectionView(node.props)); sectionHarness.flush(); return result;
  };
  for (const section of sections) {
    for (let cycle = 0; cycle < 2; cycle++) {
      let tree = renderSection(section.id); const button = elements(tree).find((node) => node.type === 'button');
      assert.equal(button.props.type, 'button'); assert.equal(button.props['aria-expanded'], false); button.props.onClick();
      tree = renderSection(section.id); assert.equal(elements(tree).find((node) => node.type === 'button').props['aria-expanded'], true);
      const node = elements(tree).find((node) => node.type === FilterNode);
      const input = elements(FilterNode(node.props)).find((node) => node.type === 'input');
      input.props.onChange({ target: { checked: true } });
      assert.equal(calls.at(-1).item, section.filters[0]); assert.equal(calls.at(-1).sectionFilters, section.filters);
      assert.equal(calls.at(-1).checked, true);
      elements(tree).find((node) => node.type === 'button').props.onClick();
    }
  }
  assert.deepEqual(sections, original);
});

function proposalSaveFixture({ code = 'EUR', reject = () => false } = {}) {
  const store = builderFixture(); const draft = draftExample();
  const content = draft.campaignContent[0];
  content.additionalBrief.push({ _id: '000000000000000000000888', additionalBrief: 'Second preserved brief' });
  draft.addedAccounts[0].selectedCampaignContentItem.additionalBriefId = content.additionalBrief[1]._id;
  draft.addedAccounts[1].selectedCampaignContentItem.descriptionId = null;
  draft.addedAccounts[1].selectedCampaignContentItem.additionalBriefId = null;
  hydrateFixture(store, draft); store.getState().actions.setSelectedCurrency(code);
  store.setState({ postContentDraft: { mainLink: 'https://example.test/typed', additionalBrief: 'Keep my form' } });
  const calls = []; const success = []; const errors = [];
  const page = strategyFixture(store, {
    toast: { success: (message) => success.push(message), error: (message) => errors.push(message) },
    proposalPost: async (url, payload) => {
      calls.push({ url, body: JSON.parse(JSON.stringify(payload)) });
      if (reject()) throw new Error('Proposal API rejected the request');
      return { data: { data: { campaignId: 'synthetic-proposal-id', socialMedia: 'instagram' } } };
    },
  });
  const render = () => page.render();
  const saveButton = () => elements(render()).find((node) => node.type === 'button' && node.props.children === 'Save proposal');
  const modalOpen = () => elements(render()).some((node) => node.type === 'h2' && node.props.children === 'Proposal saved');
  return { store, calls, success, errors, page, render, saveButton, modalOpen };
}

test('real Save proposal button -> handler -> builder -> API wrapper sends EUR/USD/GBP and canonical content without conversion', async () => {
  for (const [code, symbol, amount] of [['EUR', '€', 115], ['USD', '$', 124], ['GBP', '£', 106]]) {
    const f = proposalSaveFixture({ code }); const before = f.store.getState();
    const tree = f.render();
    assert.equal(elements(tree).find((node) => node.type === f.page.Bar).props.budgetLabel, `Budget: ${amount}${symbol}`);
    await f.saveButton().props.onClick();
    assert.equal(f.calls.length, 1); assert.equal(f.calls[0].url, '/proposal-system');
    const body = f.calls[0].body;
    assert.equal(body.displayCurrency, code); assert.equal(body.campaignPrice, amount);
    assert.equal(body.campaignName, before.campaignName);
    assert.deepEqual(body.campaignContent, before.campaignContent);
    assert.ok(body.campaignContent.every((item) => Array.isArray(item.descriptions) && Array.isArray(item.additionalBrief)));
    assert.deepEqual(body.addedAccounts.map((row) => row.selectedCampaignContentItem), before.selectedAccounts.map((row) => row.selectedCampaignContentItem));
    for (const row of body.addedAccounts) {
      assert.ok(row.socialAccountId); assert.equal(Object.hasOwn(row, 'addedAccountsId'), false);
      assert.equal(Object.hasOwn(row, 'selectionId'), false); assert.equal(Object.hasOwn(row, 'bundleId'), false);
      const item = body.campaignContent.find((item) => item._id === row.selectedCampaignContentItem.campaignContentItemId);
      assert.ok(row.selectedCampaignContentItem.descriptionId === null || item.descriptions.some((d) => d._id === row.selectedCampaignContentItem.descriptionId));
      assert.ok(row.selectedCampaignContentItem.additionalBriefId === null || item.additionalBrief.some((b) => b._id === row.selectedCampaignContentItem.additionalBriefId));
    }
    assert.equal(Object.hasOwn(body, 'paymentDetails'), false); assert.equal(Object.hasOwn(body, 'selectedOfferSnapshot'), false);
    assert.equal(Object.hasOwn(body, 'selectedOffer'), false, 'this save never serialized Offer metadata; do not invent row-ID semantics from a Swagger example');
    assert.deepEqual(f.errors, []); assert.equal(f.success.length, 1); assert.equal(f.modalOpen(), true);
    assert.equal(f.store.getState(), before, 'save cannot reset or mutate the campaign/form');
  }
});

test('existing Save proposal callback reads the new currency, amount and content from one current builder snapshot', async () => {
  const f = proposalSaveFixture(); const save = f.saveButton().props.onClick;
  for (const [code, symbol, amount] of [['GBP', '£', 106], ['USD', '$', 124], ['EUR', '€', 115]]) {
    f.store.getState().actions.setSelectedCurrency(code);
    f.store.getState().actions.setCampaignName('Changed immediately before save ' + code);
    const before = f.store.getState();
    await save();
    const sent = f.calls.at(-1).body;
    assert.equal(sent.displayCurrency, code); assert.equal(sent.campaignPrice, amount);
    assert.equal(sent.campaignName, before.campaignName); assert.deepEqual(sent.campaignContent, before.campaignContent);
    assert.equal(elements(f.render()).find((node) => node.type === f.page.Bar).props.budgetLabel, `Budget: ${amount}${symbol}`);
    assert.equal(f.store.getState(), before);
  }
  assert.deepEqual(f.errors, []);
});

test('Proposal rejects absent/unsupported currencies and unavailable/non-finite totals before API, without EUR fallback', async () => {
  for (const selectedCurrency of ['', undefined, null, 'CAD', 'usd']) {
    const f = proposalSaveFixture(); f.store.setState({ selectedCurrency }); const before = f.store.getState();
    await f.saveButton().props.onClick();
    assert.equal(f.calls.length, 0); assert.equal(f.success.length, 0); assert.equal(f.errors.length, 1);
    assert.equal(f.modalOpen(), false); assert.equal(f.store.getState(), before);
  }
  for (const patch of [{ totalPriceReady: false, totalPrice: 0 }, { totalPrice: NaN }, { totalPrice: Infinity }, { totalPrice: -1 }]) {
    const f = proposalSaveFixture(); f.store.setState(patch); const before = f.store.getState();
    await f.saveButton().props.onClick();
    assert.equal(f.calls.length, 0); assert.equal(f.success.length, 0); assert.equal(f.errors.length, 1);
    assert.equal(f.store.getState(), before);
  }
  for (const [displayCurrency, code] of [['EUR', 'EUR'], ['USD', 'USD'], ['GBP', 'GBP'], ['€', 'EUR'], ['$', 'USD'], ['£', 'GBP']]) {
    const body = strategyPayloads.buildStrategyProposalPayload({ campaignName: 'Zero is valid', totalPrice: 0, accounts: [], content: [], displayCurrency });
    assert.equal(body.displayCurrency, code); assert.equal(body.campaignPrice, 0);
  }
});

test('Proposal API rejection reports no false success, closes stale success modal and preserves the current form', async () => {
  let rejected = false; const f = proposalSaveFixture({ reject: () => rejected });
  const save = f.saveButton().props.onClick;
  await save(); assert.equal(f.modalOpen(), true); assert.equal(f.success.length, 1);
  rejected = true; const before = f.store.getState(); await save();
  assert.equal(f.calls.length, 2); assert.equal(f.success.length, 1); assert.equal(f.errors.length, 1);
  assert.equal(f.modalOpen(), false); assert.equal(f.store.getState(), before);
  assert.equal(f.store.getState().postContentDraft.additionalBrief, 'Keep my form');
});

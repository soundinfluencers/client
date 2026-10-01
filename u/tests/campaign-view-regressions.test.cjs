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
const common = {
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

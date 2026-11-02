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
    if (name === '@tanstack/react-query') return { useQueryClient: () => ({ invalidateQueries: async () => {} }) };
    if (name === './use-create-proposal-option' || name === '@/client-side/pages/campaign/model/use-create-proposal-option') return load('src/client-side/pages/campaign/model/use-create-proposal-option.ts', dependencies, globals);
    if (name === '../model/use-create-option-from-builder') return { useCreateOptionFromBuilder: () => ({ enabled: false, busy: false, needsRead: false, blocked: false, invalid: false }) };
    if (name === '@/client-side/utils/proposal-option-create') return load('src/client-side/utils/proposal-option-create.ts', { ...dependencies, '@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload': strategyPayloads });
    if (name.endsWith('/proposal-add-influencer-builder')) return load('src/entities/client-side/campaign-creator-page/campaign-builder/model/proposal-add-influencer-builder.ts', { './selected-offer': offerHelpers });
    if (name === './proposal-add-influencer-content-route') return { ProposalAddInfluencerContentRoute: () => {} };
    if (name === '@/client-side/pages/campaign-share/model/share-campaign-read') return load('src/client-side/pages/campaign-share/model/share-campaign-read.ts');
    if (name === '@/shared/auth/reader-session') return load('src/shared/auth/reader-session.ts', dependencies, globals);
    if (name === '@/utils/functions/formatDate') return load('src/utils/functions/formatDate.ts');
    if (name === './use-proposal-checkout') return load('src/client-side/pages/payment-campaign/use-proposal-checkout.ts', dependencies, globals);
    if (name === './proposal-checkout' || name === '@/client-side/pages/payment-campaign/proposal-checkout') return load('src/client-side/pages/payment-campaign/proposal-checkout.ts', dependencies, globals);
    if (name === './proposal-option-patch') return load('src/client-side/utils/proposal-option-patch.ts');
    if (name === '@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store') return { useCampaignBuilderStore: builderFixture() };
    if (name === '@/client-side/utils/proposal-option-patch') return load('src/client-side/utils/proposal-option-patch.ts');
    if (name === '@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer') return offerHelpers;
    if (name === './draft-occurrences') return load('src/entities/client-side/campaign-creator-page/campaign-builder/model/draft-occurrences.ts');
    if (name === '@/entities/client-side/campaign-creator-page/campaign-builder/model/build-draft-payload') return draftPayloads;
    if (name === '@/shared/config/bundle-availability') return load('src/shared/config/bundle-availability.ts');
    if (name === './campaign-builder-selection') return load('src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-selection.ts');
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

test('Proposal reader remains separate from option creation transport', () => {
  const { store } = fetchFixture(); assert.equal(store.getState().addProposalOption, undefined);
});

test('option creation dirty preflight does not post, navigate or discard current edits', async () => {
  const f = await stage3ActionsFixture(); const updates = f.stores.useUpdateCampaign;
  updates.getState().setField(f.initial.selectedOption.campaignContent[0]._id, 'mainLink', 'unsaved');
  const before = updates.getState(); assert.equal(await f.render().onAddOption(true), false);
  assert.equal(f.writes.length, 0); assert.equal(f.pending.length, 1); assert.equal(updates.getState(), before);
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
  for (const [key, snapshot] of Object.entries(before)) {
    if (key === 'useProposalAccountsStore') {
      assert.equal(stores[key].getState().accountsByOption, snapshot.accountsByOption);
      assert.equal(stores[key].getState().contentByOption, snapshot.contentByOption);
    } else assert.equal(stores[key].getState(), snapshot, key + ' retains unsaved state');
  }
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
   old.addedAccounts = old.addedAccounts.map(({ offerId, ...a }) => ({ ...a, source: 'standalone' }));
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
      '@/api/api.ts': { post: proposalPost, get: async (url) => ({ data: { data: { campaignId: 'synthetic-proposal-id', existingOptions: [0], socialMedia: 'instagram', selectedOption: { optionIndex: 0, canEdit: true, addedAccounts: [], addedBundles: [], campaignContent: [], price: store.getState().totalPrice, displayCurrency: offerHelpers.currencyCode(store.getState().selectedCurrency) } } } }) },
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
  const { CampaignPostContentDefaultRoute: CampaignPostContentRoute } = load('src/pages/client-side/campaign-post-content/ui/campaign-post-content-route.tsx', {
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
  draft.addedBundles = [{ bundleId: 'bundle-id', selectedAccountIds: [draft.addedAccounts[2].socialAccountId], currentAccountIds: [], prices: {}, originalPrices: {}, isAvailable: false }];
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
    react: harness.hooks, '@/components': {},
'react-router-dom': { useNavigate: () => () => {} },
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
  const draft = { _id: 'draft-2', step: 'strategyTable', displayCurrency: 'EUR', campaignName: 'Own draft', addedAccounts: [
    { ...account('a'), accountId: undefined, socialAccountId: 'a', selectionId: '000000000000000000000801', source: 'offer', offerId: 'saved-offer' },
    { ...account('b'), accountId: undefined, socialAccountId: 'b', selectionId: '000000000000000000000802', source: 'offer', offerId: 'saved-offer' }],
    selectedOffer: { offerId: 'saved-offer', selectedAccountIds: ['a', 'b'], currentAccountIds: ['changed'], isAvailable: false, unavailableReason: 'offer_membership_changed' } };
  hydrate.hydrateCampaignBuilderFromDraft(draft);
  assert.equal(store.getState().draftId, 'draft-2');
  assert.equal(store.getState().selectedOfferId, 'saved-offer');
  assert.deepEqual(store.getState().selectedOfferAccountIds, ['a', 'b']);
  assert.equal(store.getState().selectedOfferName, ''); assert.equal(store.getState().selectedOfferPrice, null);
  assert.equal(store.getState().selectedAccounts[0].source, 'offer');
  assert.equal(store.getState().selectedAccounts[0].accountId, 'a');
  assert.equal(store.getState().selectedAccounts[0].selectionId, '000000000000000000000801');
  assert.throws(() => regularPayload(store, { offerIsAvailable: store.getState().selectedOfferIsAvailable }), offerHelpers.OfferSelectionError);
  assert.equal(store.getState().selectedOfferId, 'saved-offer');
  hydrate.hydrateCampaignBuilderFromDraft({ ...draft, _id: 'old-draft', selectedOffer: undefined, addedAccounts: draft.addedAccounts.map(({ offerId, ...a }) => ({ ...a, source: 'standalone' })) });
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
  assert.deepEqual(checkout.resolveCheckoutContext('/client/campaign/payment', new URLSearchParams(`proposal=${checkoutProposalId}&option=2`), 'stale-builder'), { kind: 'proposal', proposalId: checkoutProposalId, optionIndex: 2 });
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
  const { amount: ignoredAmount, ...approveValues } = paymentValues;
  assert.deepEqual(calls, [['approve', 'P', 3, approveValues]]);
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

function paymentFixture({ path = '/client/create-campaign/content/strategy/payment', query = '', postError = null, deleteError = null, postPromise, loadDraft, loadProposal, approve, sessionData = new Map(), authorization = { isAuthReady: true, accessToken: 'verified-token' }, user = { role: 'client' }, builder = builderFixture() } = {}) {
  const harness = hookHarness(); const calls = []; const notifications = []; const navigation = [];
  const session = sessionData; const params = new URLSearchParams(query); const FormPayment = () => {}; const Modal = () => {}; const OfferCatalogueReview = () => {};
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
    '@/contexts/AuthContext': { useAuth: () => authorization }, '@/store/get-user': { useUser: (selector) => selector({ user }) },
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
      getProposalCampaign: async (id, index) => { calls.push(['getProposal', id, index]); return { data: { data: await loadProposal?.(id, index) } }; },
      approveProposalCampaign: async (...args) => { calls.push(['approve', ...args]); return approve?.(...args); },
    },
    '@/api/client/campaign/draft.api': {
      deleteDraft: async (id) => { calls.push(['delete', id]); if (deleteError) throw deleteError; },
      getCampaignDraft: async (id) => { calls.push(['get', id]); return loadDraft?.(id); },
    },
    '@/client-side/utils/payment-reference': { generatePaymentReferenceNumber: () => 'reference' },
    [builderModule]: { useCampaignBuilderStore: builder }, [strategyModule]: strategyPayloads, [offerModule]: offerHelpers,
    '@/entities/client-side/campaign-creator-page/campaign-builder/model/hydrate-campaign-builder-from-draft': hydration,
    './checkout-context': checkout, './offer-catalogue-review': { OfferCatalogueReview },
  }, { sessionStorage: { getItem: (key) => session.get(key) ?? null, removeItem: (key) => session.delete(key), setItem: (key, value) => session.set(key, value), get length() { return session.size; }, key: (i) => [...session.keys()][i] ?? null }, console: { error() {} } });
  const render = () => harness.render(() => PaymentCampaign());
  return { builder, draft, proposalStore, updates, calls, notifications, navigation, session, params, render, harness, FormPayment, Modal, OfferCatalogueReview };
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

test('payment reads saved Proposal despite stale builder and legacy payload and does no draft cleanup', async () => {
  const fixture = paymentFixture({ path: '/client/campaign/payment', query: `proposal=${checkoutProposalId}&option=2`, loadProposal: async () => checkoutSaved(2) });
  fixture.builder.getState().actions.setDraftMeta({ draftId: 'stale-builder', draftStep: 'strategyTable' });
  fixture.session.set('proposalPaymentPayload', JSON.stringify({ campaignId: checkoutProposalId, optionIndex: 2,
    payload: { campaignPrice: 999, displayCurrency: 'GBP' } }));
  fixture.render(); fixture.harness.flush(); await tick();
  await paymentSubmit(fixture)(paymentValues);
  const sent = fixture.calls.find(([kind]) => kind === 'approve');
  assert.equal(sent[1], checkoutProposalId); assert.equal(sent[2], 2); assert.equal(Object.hasOwn(sent[3], 'amount'), false);
  assert.equal(fixture.calls.some(([kind]) => kind === 'post' || kind === 'delete'), false);
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
  fixture.draft.getState().initCampaign('own', [{ ...account('a'), socialAccountId: 'a', selectionId: '000000000000000000000803', source: 'offer', offerId: 'own-offer', dateRequest: 'Local date' }],
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
  assert.equal(restored.selectedAccounts[0].dateRequest, 'Local date'); assert.equal(restored.selectedAccounts[0].selectionId, '000000000000000000000803');
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

test('public Proposal Approve navigates with exact identity and never reads or overwrites private edits or caches', () => {
  const harness = hookHarness(); const session = new Map(); const ButtonMain = () => {}; const navigation = [];
  let campaign = checkoutSaved(2); const warnings = [];
  const { ProposalCampaignPageShare } = load('src/client-side/widgets/campaign-share/table-pages/proposal-page-table.tsx', {
    react: harness.hooks, '../campaign-table/table-proposal': {}, '../campaign-table/table-insight': {},
    '../live-view-card/live-view': {}, '../live-view-card/live-view-card-insight': {}, '@/components': { ButtonMain },
    '@/components/ui/modal-fix/Modal': {}, '@/api/client/campaign/campaign.api': {}, 'react-toastify': { toast: { error: (msg) => warnings.push(msg) } },
    '@/client-side/store': new Proxy({}, { get: () => { throw new Error('Public entry must not read private stores'); } }),
    'react-router-dom': { useNavigate: () => (url) => navigation.push(url) }, '@/client-side/hooks': { useGroupPromos: () => ({}) },
    '../model/live-view-content.helpers': { buildLiveViewGroups: () => ({ byGroup: { main: [], music: [], press: [] } }) },
  }, { sessionStorage: { setItem: (key, value) => session.set(key, value) } });
  const render = () => { const tree = harness.render(() => ProposalCampaignPageShare({ campaign, view: 1, flag: true })); harness.flush(); return tree; };
  const click = elements(render()).find((n) => n.type === ButtonMain && n.props.text === 'Approve').props.onClick; harness.flush(); click();
  const path = `/client/campaign/payment?proposal=${checkoutProposalId}&option=2`;
  assert.deepEqual(navigation, [path]); assert.deepEqual(JSON.parse(session.get('postAuthRedirect')), { path, campaignId: checkoutProposalId, optionIndex: 2 });
  assert.equal(session.has('proposalPaymentPayload'), false);
  assert.ok(elements(render()).some((n) => n.type === ButtonMain && n.props.text === 'Approve'), 'entry does not claim approval');
  campaign = checkoutSaved(1, { id: checkoutProposalB }); render(); click(); assert.equal(navigation.length, 1, 'stale callback cannot navigate');
  const current = elements(render()).find((n) => n.type === ButtonMain && n.props.text === 'Approve').props.onClick;
  harness.unmount(); current(); assert.equal(navigation.length, 1);
  campaign = checkoutSaved(); delete campaign.selectedOption.optionIndex; render();
  elements(render()).find((n) => n.type === ButtonMain && n.props.text === 'Approve').props.onClick();
  assert.equal(warnings.length, 1); assert.equal(navigation.length, 1);
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

function realContentFormFixture(store, defaultCampaignContent, mode = 'create', accountsOverride) {
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
  const render = () => harness.render(() => useCampaignPostContent({ mode, accounts: accountsOverride ?? store.getState().selectedAccounts, defaultBlocks: store.getState().blocksDraft ?? undefined,
    campaignName: store.getState().campaignName, campaignPrice: store.getState().totalPrice, defaultCampaignContent }));
  let vm = render(); harness.flush();
  return { form, render, harness, get vm() { return vm = render(); } };
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
      return { data: { data: { campaignId: 'synthetic-proposal-id', optionIndex: 0, socialMedia: 'instagram' } } };
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
    assert.deepEqual(body.selectedOffer, { offerId: before.selectedOfferId, selectedAccountIds: before.selectedOfferAccountIds });
    assert.deepEqual(f.errors, []); assert.equal(f.success.length, 1); assert.equal(f.modalOpen(), true);
    assert.equal(f.store.getState(), before, 'save cannot reset or mutate the campaign/form');
  }
});

test('existing Save proposal callback reads the new currency, amount and content from one current builder snapshot', async () => {
  for (const [code, symbol, amount] of [['GBP', '£', 106], ['USD', '$', 124], ['EUR', '€', 115]]) {
    const f = proposalSaveFixture(); const save = f.saveButton().props.onClick;
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

test('Proposal API rejection reports no false success and preserves current form; retry after rejection can create once', async () => {
  let rejected = true; const f = proposalSaveFixture({ reject: () => rejected });
  const save = f.saveButton().props.onClick; const before = f.store.getState(); await save();
  assert.equal(f.calls.length, 1); assert.equal(f.success.length, 0); assert.equal(f.errors.length, 1); assert.equal(f.modalOpen(), false);
  rejected = false; await save(); assert.equal(f.calls.length, 2); assert.equal(f.modalOpen(), true); assert.equal(f.success.length, 1);
  await save(); assert.equal(f.calls.length, 2, 'successful creation is not posted again');
  assert.equal(f.store.getState(), before); assert.equal(before.postContentDraft.additionalBrief, 'Keep my form');
});

const selectionModel = load('src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-selection.ts');
const bundleGate = load('src/shared/config/bundle-availability.ts');
const bundleMapper = load('src/entities/client-side/campaign-creator-page/bundle/model/bundle.mappers.ts');
const bundleFixture = (id, ids) => ({ bundleId: id, influencerId: 'owner', prices: { EUR: 80, USD: 90, GBP: 70 }, originalPrices: { EUR: 100 }, followers: 100,
  createdAt: '2026-10-30', accounts: ids.map((id) => ({ ...account(id), prices: { EUR: 50, USD: 60, GBP: 40 }, logoUrl: null, followers: 10,
    profileType: 'creator', socialMedia: 'Instagram', countries: [], engagementRate: 1, averageViews: 2,
    communityMusicGenres: [], communityThemeTopics: [], creatorMusicGenres: ['techno'], creatorContentFocus: ['music'] })) });

test('composition transitions preserve placement workflow, full Offer membership and independent accounts in every currency', () => {
  for (const currency of ['EUR', 'USD', 'GBP']) {
    const store = builderFixture(); const actions = store.getState().actions; actions.reset(); actions.setSelectedCurrency(currency);
    const ref = { campaignContentItemId: 'content', descriptionId: null, additionalBriefId: 'second' };
    actions.togglePromoCard(account('a', { prices: { EUR: 10, USD: 20, GBP: 30 }, dateRequest: '2026-11-05', selectedCampaignContentItem: ref }));
    actions.togglePromoCard(account('d', { prices: { EUR: 0, USD: 0, GBP: 0 } }));
    const saved = store.getState().selectedAccounts.find((a) => a.accountId === 'a');
    actions.selectOffer({ offerId: 'ab', accountIds: ['a'], accounts: [account('a'), account('b')], offerPrices: { EUR: 70, USD: 80, GBP: 60 } });
    const selected = store.getState(); assert.deepEqual(selected.selectedOfferAccountIds, ['a', 'b']);
    const a = selected.selectedAccounts.find((a) => a.accountId === 'a');
    assert.equal(a.selectionId, saved.selectionId); assert.equal(a.dateRequest, saved.dateRequest); assert.deepEqual(a.selectedCampaignContentItem, ref);
    assert.equal(selected.totalPrice, { EUR: 70, USD: 80, GBP: 60 }[currency]); assert.equal(selected.totalPriceReady, true);
    actions.selectOffer({ offerId: null });
    assert.deepEqual(store.getState().selectedAccounts.map((a) => a.accountId), ['d']);
    assert.deepEqual(store.getState().selectedPromoCardIds, ['d']); assert.equal(store.getState().totalPrice, 0);
    actions.selectOffer({ offerId: 'ab', accounts: [account('a'), account('b')], offerPrices: { EUR: 70, USD: 80, GBP: 60 } });
    const b = store.getState().selectedAccounts.find((a) => a.accountId === 'b');
    actions.selectOffer({ offerId: 'bc', accounts: [account('b'), account('c')], offerPrices: { EUR: 50 } });
    assert.equal(store.getState().selectedAccounts.find((a) => a.accountId === 'b').selectionId, b.selectionId);
    assert.ok(store.getState().selectedAccounts.some((a) => a.accountId === 'd'));
    assert.equal(store.getState().totalPriceReady, currency === 'EUR');
    actions.selectOffer({ offerId: null }); assert.deepEqual(store.getState().selectedAccounts.map((a) => a.accountId), ['d']);
  }
});

test('saved occurrences are preserved explicitly; selectionId upserts never overwrite a sibling placement', () => {
  const store = builderFixture(); const actions = store.getState().actions; actions.reset();
  const rows = [account('a', { selectionId: 'first', source: 'manual', dateRequest: 'one', selectedCampaignContentItem: null }),
    account('a', { selectionId: 'second', source: 'manual', dateRequest: 'two', selectedCampaignContentItem: { campaignContentItemId: 'two', descriptionId: 'd' } })];
  actions.setSelectedAccounts(rows); actions.setSelectedPromoCardIds(['a']);
  actions.selectOffer({ offerId: 'offer', accounts: [account('a')], offerPrices: { EUR: 0 } });
  assert.deepEqual(store.getState().selectedAccounts.map((a) => [a.selectionId, a.dateRequest, a.selectedCampaignContentItem]), rows.map((a) => [a.selectionId, a.dateRequest, a.selectedCampaignContentItem]));
  actions.upsertSelectedAccount({ ...rows[1], dateRequest: 'changed' });
  assert.deepEqual(store.getState().selectedAccounts.map((a) => a.dateRequest), ['one', 'changed']);
  const before = store.getState(); actions.upsertSelectedAccount(account('a')); assert.equal(store.getState(), before);
  assert.throws(() => offerHelpers.serializeSelectedOffer({ offerId: 'offer', selectedAccountIds: ['a'] }, rows.map((a) => ({ socialAccountId: a.accountId, influencerId: a.influencerId, socialMedia: a.socialMedia }))));
});

test('internal Bundle snapshots, overlap membership and workflow compose without exposing a price formula', () => {
  const store = builderFixture(); store.getState().actions.reset(); const state = store.getState();
  const dto = bundleFixture('catalogue-bundle', ['a', 'b']); const bundle = bundleMapper.mapBundleDto(dto);
  assert.equal(bundle.accounts[0].socialMedia, 'instagram'); assert.equal(bundle.bundleId, 'catalogue-bundle');
  const patch = selectionModel.selectBundleFromCampaignSelection(state, bundle); assert.ok(patch);
  dto.accounts[0].creatorMusicGenres.push('changed'); bundle.accounts[0].prices.EUR = 999;
  assert.equal(patch.selectedBundles[0].accounts[0].prices.EUR, 50);
  assert.deepEqual(patch.selectedBundles[0].accounts[0].creatorMusicGenres, ['techno']);
  let current = { ...state, ...patch }; const a = current.selectedAccounts.find((a) => a.accountId === 'a');
  a.dateRequest = 'later'; a.selectedCampaignContentItem = null;
  assert.equal(selectionModel.selectBundleFromCampaignSelection(current, bundleFixture('overlap', ['b', 'c'])), null);
  current = { ...current, ...selectionModel.selectOfferFromCampaignSelection(current, { offerId: 'offer', accounts: [account('a'), account('c')], offerPrices: { EUR: 10 } }) };
  const overlap = current.selectedAccounts.find((r) => r.accountId === 'a');
  assert.equal(overlap.source, 'offer'); assert.equal(overlap.bundleId, 'catalogue-bundle'); assert.equal(overlap.selectionId, a.selectionId);
  assert.equal(overlap.dateRequest, 'later'); assert.equal(overlap.selectedCampaignContentItem, null);
  current = { ...current, ...selectionModel.selectOfferFromCampaignSelection(current, { offerId: null }) };
  assert.deepEqual(current.selectedAccounts.map((a) => a.accountId), ['a', 'b']);
  assert.ok(current.selectedAccounts.every((a) => a.source === 'bundle'));
  const removed = selectionModel.removeBundleFromCampaignSelection(current, 'catalogue-bundle'); assert.deepEqual(removed.selectedAccounts, []);
  assert.equal(selectionModel.isBundleFullyIncludedInOffer(patch.selectedBundles[0], ['a', 'b', 'c']), true);
});

test('Bundle user actions remain disabled and internal fixtures fail closed at Draft/ordinary transport', () => {
  assert.equal(bundleGate.BUNDLES_AVAILABLE, false);
  const store = builderFixture(); const before = store.getState();
  store.getState().actions.selectBundle(bundleFixture('bundle', ['a', 'b'])); store.getState().actions.removeBundle('bundle');
  assert.equal(store.getState(), before);
  const internal = selectionModel.selectBundleFromCampaignSelection(before, bundleFixture('bundle', ['x', 'y']));
  store.getState().actions.hydrateFromDraft({ ...before, ...internal });
  assert.equal(store.getState().totalPriceReady, false);
  assert.ok(Number.isNaN(totals.calcBuilderTotal(store.getState())));
  assert.ok(Number.isNaN(totals.calcBuilderTotal({ ...before, selectedBundles: [{}] })));
  assert.throws(() => offerHelpers.getBuilderSelectedOffer(store.getState()));
  assert.throws(() => offerHelpers.getBuilderSelectedOffer({ ...before, selectedBundles: [{}] }));
  // No Bundle UI/query/mutation modules are imported or registered in this stage. URL flags have no consumer.
  for (const file of ['src/App.tsx', 'src/router/routes.ts', 'src/widgets/client-side/campaign-creator-page/build-campaign/ui/build-campaign.tsx',
    'src/client-side/pages/add-influencer-build-campaign/add-influencer-build-campaign.tsx']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(source, /BundleCatalog|EmbeddedBundle|CreateBundlePage|create-bundle|catalogMode|catalogueMode/);
  }
});

// Structural fixtures for integration/main-bundles@439b56d; not recorded HTTP responses.
const occurrenceModel = load('src/entities/client-side/campaign-creator-page/campaign-builder/model/draft-occurrences.ts');
function draftGetFromRequest(body, previous) {
  return { _id: body.draftId ?? '000000000000000000000900', ...body,
    displayCurrency: body.displayCurrency, step: body.step,
    campaignContent: body.campaignContent ?? previous.campaignContent,
    selectedOffer: body.selectedOffer ? { ...previous.selectedOffer, ...body.selectedOffer } : undefined,
    addedAccounts: body.addedAccounts.map((r, i) => ({ ...previous.addedAccounts.find((p) => p.selectionId === r.selectionId), ...r,
      _id: 'new-internal-subdocument-' + i })) };
}
for (const step of ['addAccounts', 'addContent', 'strategy']) {
  test('stage 2 real ' + step + ' save -> cold structural GET -> reordered save keeps occurrence IDs, currency, Offer and draftId', async () => {
    for (const currency of ['EUR', 'USD', 'GBP']) {
      const f = draftSaveFlightFixture(step); const original = draftExample();
      original.displayCurrency = currency; original.campaignContent[0].additionalBrief.push({ _id: '000000000000000000000901', additionalBrief: 'Second brief' });
      original.addedAccounts[0].selectedCampaignContentItem.additionalBriefId = original.campaignContent[0].additionalBrief[1]._id;
      hydrateFixture(f.store, original);
      let save = f.render().save; const first = save(); assert.equal(f.calls.length, 1);
      const body = f.calls[0]; assert.equal(body.displayCurrency, currency);
      assert.deepEqual(body.selectedOffer.selectedAccountIds, original.selectedOffer.selectedAccountIds);
      assert.equal(Object.hasOwn(body, 'campaignContent'), step !== 'addAccounts');
      assert.ok(body.addedAccounts.every((r) => r.selectionId && !Object.hasOwn(r, '_id') && !Object.hasOwn(r, 'prices')));
      f.pending[0].resolve({ data: { data: { draftId: original._id } } }); await first;
      const get = draftGetFromRequest(body, original); get.addedAccounts.reverse();
      f.store.getState().actions.reset(); hydrateFixture(f.store, get);
      const second = f.render().save(); assert.equal(f.calls.length, 2); const sent = f.calls[1];
      assert.equal(sent.draftId, get._id);
      assert.deepEqual(sent.addedAccounts.map((a) => a.selectionId).sort(), body.addedAccounts.map((a) => a.selectionId).sort());
      for (const row of sent.addedAccounts) {
        const before = body.addedAccounts.find((a) => a.selectionId === row.selectionId);
        assert.equal(row.source, before.source); assert.equal(row.offerId, before.offerId); assert.equal(row.dateRequest, before.dateRequest);
        assert.deepEqual(row.selectedCampaignContentItem, before.selectedCampaignContentItem);
      }
      f.pending[1].resolve({ data: { draftId: get._id } }); await second; assert.deepEqual(f.errors, []);
    }
  });
}

test('stage 2 standalone duplicate occurrences survive real save and GET without source/account deduplication', async () => {
  const f = draftSaveFlightFixture('addAccounts'); const draft = draftExample();
  draft.selectedOffer = undefined; draft.addedAccounts = draft.addedAccounts.map(({ offerId, ...r }) => ({ ...r, source: 'standalone' }));
  draft.addedAccounts.push({ ...draft.addedAccounts[0], selectionId: '000000000000000000000902', dateRequest: 'different-date', selectedCampaignContentItem: null });
  hydrateFixture(f.store, draft); const saving = f.render().save();
  assert.equal(f.calls[0].addedAccounts.length, 4); assert.ok(f.calls[0].addedAccounts.every((a) => a.source === 'standalone'));
  f.pending[0].resolve({ data: { draftId: draft._id } }); await saving;
  const get = draftGetFromRequest(f.calls[0], draft); hydrateFixture(f.store, get);
  assert.equal(f.store.getState().selectedAccounts.length, 4);
  assert.equal(f.store.getState().selectedAccounts[3].dateRequest, 'different-date');
  assert.equal(f.store.getState().selectedAccounts[3].selectedCampaignContentItem, null);
});

test('stage 2 invalid GET is atomic; _id cannot replace selectionId; missing prices stay unknown and zero stays ready', () => {
  const store = builderFixture(); hydrateFixture(store); const before = store.getState();
  for (const mutate of [d => d.addedAccounts[0].selectionId = undefined,
    d => d.addedAccounts[1].selectionId = d.addedAccounts[0].selectionId,
    d => d.addedAccounts[0].offerId = 'foreign', d => d.displayCurrency = 'CAD',
    d => d.selectedOffer.selectedAccountIds.push('missing')]) {
    const draft = draftExample(); draft.addedAccounts[0]._id = '000000000000000000000999'; mutate(draft);
    assert.throws(() => hydrateFixture(store, draft)); assert.equal(store.getState(), before);
  }
  const draft = draftExample(); delete draft.addedAccounts[2].prices.USD; hydrateFixture(store, draft);
  assert.equal(store.getState().selectedAccounts[2].price, undefined); assert.equal(store.getState().totalPriceReady, false);
  draft.addedAccounts[2].prices.USD = 0; hydrateFixture(store, draft);
  assert.equal(store.getState().selectedAccounts[2].price, 0); assert.equal(store.getState().totalPriceReady, true);
  draft.selectedOffer.currentAccountIds = ['changed']; draft.selectedOffer.isAvailable = false; hydrateFixture(store, draft);
  assert.deepEqual(store.getState().selectedOfferAccountIds, draft.selectedOffer.selectedAccountIds);
  assert.throws(() => draftPayloads.buildCampaignDraftPayload(store.getState(), 'addAccounts'), /unavailable/);
  store.getState().actions.selectOffer({ offerId: 'replacement', accounts: draft.addedAccounts.slice(0,2).map((a) => ({ ...a, accountId: a.socialAccountId, isAvailable: undefined })), offerPrices: { EUR: 0, USD: 0, GBP: 0 } });
  assert.equal(store.getState().selectedOfferIsAvailable, true);
  assert.ok(store.getState().selectedAccounts.filter((a) => a.source === 'offer').every((a) => a.isAvailable === true));
});

test('stage 2 raw refs remain authoritative over flattened display, including server-normalized absent refs', () => {
  const store = builderFixture(); const draft = draftExample(); const content = draft.campaignContent[0];
  content.additionalBrief.push({ _id: '000000000000000000000903', additionalBrief: 'Second brief' });
  draft.addedAccounts[0].selectedCampaignContentItem.additionalBriefId = content.additionalBrief[1]._id;
  draft.addedAccounts[0].additionalBrief = 'First flattened display';
  delete draft.addedAccounts[1].selectedCampaignContentItem.additionalBriefId;
  draft.addedAccounts[2].selectedCampaignContentItem.additionalBriefId = null;
  hydrateFixture(store, draft);
  assert.equal(store.getState().selectedAccounts[0].selectedCampaignContentItem.additionalBriefId, content.additionalBrief[1]._id);
  assert.equal(Object.hasOwn(store.getState().selectedAccounts[1].selectedCampaignContentItem, 'additionalBriefId'), false);
  assert.equal(store.getState().selectedAccounts[2].selectedCampaignContentItem.additionalBriefId, null);
  const body = draftPayloads.buildCampaignDraftPayload(store.getState(), 'strategyTable');
  assert.equal(body.addedAccounts[0].selectedCampaignContentItem.additionalBriefId, content.additionalBrief[1]._id);
  assert.equal(body.addedAccounts[2].selectedCampaignContentItem.additionalBriefId, null);
});

test('stage 2 Draft open suppresses reversed responses, stale errors and continuations after unmount', async () => {
  const store = builderFixture(); const harness = hookHarness(); const pending = []; const navigation = []; const errors = []; const warnings = [];
  const getDraftDetails = (id) => new Promise((resolve, reject) => pending.push({ id, resolve, reject }));
  const { useOpenDraftAction } = load('src/features/client-side/dashboard/open-campaign-draft/model/use-open-draft-action.ts', {
    react: harness.hooks, 'react-router-dom': { useNavigate: () => (url) => navigation.push(url) },
    'react-toastify': { toast: { error: (e) => errors.push(e), warning: (w) => warnings.push(w) } },
    '@/entities/client-side/campaign-creator-page/campaign-builder/model/hydrate-campaign-builder-from-draft': { hydrateCampaignBuilderFromDraft: (d) => hydrateFixture(store, d) },
  });
  const open = harness.render(() => useOpenDraftAction({ getDraftDetails })); harness.flush();
  const a = open('A'), b = open('B'); const second = { ...draftExample(), _id: 'B', campaignName: 'B' };
  pending[1].resolve(second); await b; pending[0].resolve({ ...draftExample(), _id: 'A' }); await a;
  assert.equal(store.getState().draftId, 'B'); assert.equal(navigation.length, 1);
  const c = open('C'), d = open('D'); pending[3].resolve({ ...second, _id: 'D' }); await d;
  pending[2].reject(new Error('stale failure')); await c; assert.deepEqual(errors, []);
  const unmounted = open('E'); harness.unmount(); pending[4].resolve({ ...second, _id: 'E' }); await unmounted;
  assert.equal(store.getState().draftId, 'D'); assert.equal(navigation.length, 2);
  assert.deepEqual(warnings, []);
});

test('stage 2 internal Bundle occurrences retain separate identity, saved metadata and never reach user save', async () => {
  const f = draftSaveFlightFixture('addAccounts'); const draft = draftExample();
  draft.addedAccounts.push({ ...draft.addedAccounts[0], selectionId: '000000000000000000000904', source: 'bundle', offerId: undefined, bundleId: 'bundle' });
  draft.addedBundles = [{ bundleId: 'bundle', selectedAccountIds: [draft.addedAccounts[0].socialAccountId], currentAccountIds: ['catalogue-changed'],
    prices: { EUR: 0 }, originalPrices: {}, isAvailable: false, unavailableReason: 'bundle_membership_changed' }];
  hydrateFixture(f.store, draft); const state = f.store.getState();
  const rows = occurrenceModel.reconcileDraftSelectionRows(state.selectedAccounts, draft.selectedOffer);
  assert.equal(rows.length, 4); assert.equal(rows[3].source, 'bundle'); assert.equal(rows[3].bundleId, 'bundle');
  assert.equal(rows[3].selectionId, draft.addedAccounts[3].selectionId); assert.notEqual(rows[3].selectionId, rows[0].selectionId);
  assert.deepEqual(state.selectedBundles[0].selectedAccountIds, draft.addedBundles[0].selectedAccountIds);
  assert.equal(state.selectedBundles[0].isAvailable, false);
  await f.render().save(); assert.equal(f.calls.length, 0); assert.equal(f.errors.length, 1);
  const plain = draftExample(); hydrateFixture(f.store, plain); assert.deepEqual(f.store.getState().selectedBundles, []);
});

// Structural Proposal fixtures for integration/main-bundles@439b56d, not captured HTTP responses.
const proposalPatch = load('src/client-side/utils/proposal-option-patch.ts');
const removalDecisions = load('src/client-side/widgets/campaign/model/proposal-row-removal.ts');
const overlapDecisions = load('src/client-side/widgets/campaign/model/proposal-overlap-removal.ts');
const stage3Proposal = (id = 'A', index = 0, withOffer = true) => {
  const d = draftExample();
  const rows = d.addedAccounts.map((a, i) => ({ ...a, addedAccountsId: (401 + i).toString(16).padStart(24, '0'), selectedContent: a.selectedCampaignContentItem }));
  return { campaignId: id, campaignName: 'Proposal', socialMedia: 'instagram', existingOptions: [0, 1, 2],
    selectedOption: { optionIndex: index, canEdit: true, price: 124, displayCurrency: 'USD', pricesByCurrency: { EUR: 115, USD: 124, GBP: 106 },
      addedAccounts: rows, addedBundles: [], campaignContent: d.campaignContent,
      selectedOffer: withOffer ? { ...d.selectedOffer, selectedAddedAccountsIds: rows.slice(0, 2).map((a) => a.addedAccountsId), overlapAccountIds: [] } : null } };
};
async function stage3ActionsFixture({ withOffer = true } = {}) {
  const { store: fetch, pending } = fetchFixture(); const stores = editingStores(fetch); const initial = stage3Proposal('A', 0, withOffer);
  const first = fetch.getState().setProposalOption('A', 0); pending[0].resolve(initial); await first;
  stores.useProposalAccountsStore.getState().setCurrentCampaignId('A');
  stores.useProposalAccountsStore.getState().initOption(0, initial.selectedOption.addedAccounts, initial.selectedOption.campaignContent, { force: true, snapshot: initial.selectedOption });
  const harness = hookHarness(), writes = [], messages = [], setters = [], navigation = [], navigationOptions = []; const queryClient = new QueryClient(); const builder = builderFixture(); let active = 0;
  const api = { getProposalCampaign: (id, option) => new Promise((resolve, reject) => pending.push({ id, option, kind: 'proposal', resolve: (data) => resolve({ data: { data } }), reject })), patchAddProposalOption: async (...args) => { writes.push(['patch', ...args]); }, deleteProposalOption: async (...args) => { writes.push(['delete', ...args]); } };
  const { useCampaignPageActions } = load('src/client-side/pages/campaign/model/use-campaign-page-actions.ts', {
    react: harness.hooks, [builderModule]: { useCampaignBuilderStore: builder }, '@tanstack/react-query': {useQueryClient:()=>queryClient}, 'react-router-dom': { useNavigate: () => (url, options) => { navigation.push(url); navigationOptions.push(options); } }, 'react-toastify': { toast: { success: (x) => messages.push(['success', x]), error: (x) => messages.push(['error', x]) } },
    '@/api/client/campaign/campaign.api': api, '@/api/client/file/get-pdf': {}, '@/api/client/file/get-csv': {}, '@/client-side/store': stores,
    '@/client-side/utils': common['@/client-side/utils'], './campaign-page.utils': load('src/client-side/pages/campaign/model/campaign-page.utils.ts'),
    '@/client-side/widgets/campaign/model/campaign-content.utils.ts': load('src/client-side/widgets/campaign/model/campaign-content.utils.ts', common),
  });
  const render = (data = fetch.getState().data) => harness.render(() => useCampaignPageActions({ data, activeOption: active, localExtraOptions: [], textareaValue: '',
    setActiveOption: (n) => { active = n; setters.push(['active', n]); }, setLocalExtraOptions() {}, setOptionModal() {}, setIsRequesting(b) { setters.push(['requesting', b]); }, setIsRequestSent: (b) => setters.push(['saved', b]), setIsRequestingPDF() {} }));
  render(); harness.flush(); return { fetch, pending, stores, harness, writes, api, messages, setters, render, initial, navigation, navigationOptions, queryClient, builder, adoptServerOption() { active = fetch.getState().data?.selectedOption?.optionIndex ?? active; }, get active() { return active; } };
}

test('stage 3 initial standalone/Offer create sends current metadata, locks double click and retries only GET after POST success', async () => {
  for (const offer of [false, true]) {
    const builder = builderFixture(); hydrateFixture(builder); if (!offer) builder.getState().actions.selectOffer({ offerId: null });
    const harness = hookHarness(); const posts = [], reads = [], messages = []; let rejectRead = true;
    const { useSaveProposal } = load('src/widgets/client-side/campaign-tables/model/use-save-proposal.ts', { react: harness.hooks, [builderModule]: { useCampaignBuilderStore: builder }, [strategyModule]: strategyPayloads,
      'react-toastify': { toast: { success: (x) => messages.push(x), error() {} } },
      '@/entities/client-side/campaign-strategy-page/api/save-proposal.ts': {
        postCampaignProposal: async (body) => { posts.push(body); return { data: { statusCode: 201, message: 'Success', data: { campaignId: 'created', optionIndex: 0 } } }; },
        getSavedProposal: async (...args) => { reads.push(args); if (rejectRead) throw new Error('GET unavailable'); return { data: { data: stage3Proposal('created') } }; },
      } });
    const render = () => harness.render(() => useSaveProposal()); const save = render().saveProposal; harness.flush();
    await Promise.all([save(), save()]); assert.equal(posts.length, 1); assert.equal(reads.length, 1); assert.equal(render().campaignProposalId, 'created');
    assert.equal(render().isProposalModalOpen, false); assert.equal(render().proposalReadPending, true); assert.deepEqual(messages, []);
    assert.equal(posts[0].displayCurrency, 'USD'); assert.deepEqual(posts[0].selectedOffer, offer ? { offerId: builder.getState().selectedOfferId, selectedAccountIds: builder.getState().selectedOfferAccountIds } : null);
    assert.deepEqual(posts[0].campaignContent, builder.getState().campaignContent);
    rejectRead = false; await save(); assert.equal(posts.length, 1); assert.equal(reads.length, 2); assert.equal(render().createdProposal.selectedOption.price, 124); assert.equal(render().isProposalModalOpen, true);
    assert.ok(posts[0].addedAccounts.every((a) => !Object.hasOwn(a, 'selectionId') && !Object.hasOwn(a, 'addedAccountsId')));
  }
});

test('stage 3 real PATCH -> failed GET retains edits, offers read retry and never repeats PATCH', async () => {
  const f = await stage3ActionsFixture(); const state = f.stores.useProposalAccountsStore.getState(); const contentId = state.contentByOption[0][0]._id;
  f.stores.useUpdateCampaign.getState().setField(contentId, 'mainLink', 'https://edited.test');
  const operation = f.render().updateProposalOption(); await new Promise(setImmediate); assert.equal(f.writes.length, 1);
  const body = f.writes[0][3]; assert.equal(Object.hasOwn(body, 'campaignPrice'), false); assert.equal(Object.hasOwn(body, 'selectedOffer'), false);
  assert.deepEqual(body.addedAccounts.map((a) => a.addedAccountsId), state.accountsByOption[0].map((a) => a.addedAccountsId));
  assert.equal(body.campaignContent[0].profileType, f.initial.selectedOption.campaignContent[0].profileType ?? 'community');
  f.pending[1].reject(new Error('GET failed')); assert.equal(await operation, false);
  assert.equal(f.render().needsProposalRead, true); assert.ok(f.stores.useUpdateCampaign.getState().patches[contentId]);
  assert.equal(f.messages.some(([k]) => k === 'success'), false);
  const retry = f.render().retryProposalRead(); await new Promise(setImmediate);
  const authoritative = stage3Proposal(); authoritative.selectedOption.price = 200; authoritative.selectedOption.campaignContent[0].mainLink = 'https://edited.test';
  f.pending[2].resolve(authoritative); assert.equal(await retry, true); assert.equal(f.writes.length, 1);
  assert.equal(f.stores.useProposalAccountsStore.getState().optionSnapshotsByIndex[0].price, 200); assert.deepEqual(f.stores.useUpdateCampaign.getState().patches, {});
});

test('stage 3 explicit Offer removal keeps independent placement, snapshot and lifecycle IDs; partial membership fails', async () => {
  const f = await stage3ActionsFixture(); const store = f.stores.useProposalAccountsStore; const snapshot = store.getState().optionSnapshotsByIndex[0];
  store.getState().removeAccount(0, snapshot.addedAccounts[0].addedAccountsId);
  assert.equal(store.getState().accountsByOption[0].length, 1); assert.equal(store.getState().selectedOfferChangeByOption[0], null);
  assert.equal(snapshot.addedAccounts.length, 3, 'authoritative snapshot remains intact');
  const body = proposalPatch.buildProposalOptionPatchBody({ snapshot, accounts: store.getState().accountsByOption[0], content: store.getState().contentByOption[0], selectedOfferChange: null });
  assert.equal(body.selectedOffer, null); assert.equal(body.addedAccounts[0].addedAccountsId, snapshot.addedAccounts[2].addedAccountsId);
  assert.throws(() => proposalPatch.buildProposalOptionPatchBody({ snapshot, accounts: snapshot.addedAccounts.slice(1), content: snapshot.campaignContent }), /complete Offer/);
  store.getState().restoreOptionFromSnapshot(0); assert.equal(store.getState().accountsByOption[0].length, 3);
  assert.equal(Object.hasOwn(store.getState().selectedOfferChangeByOption, 0), false);
});

test('stage 3 active and non-active option deletion reload indexes; last option and delayed writes are guarded', async () => {
  for (const target of [0, 2]) {
    const f = await stage3ActionsFixture(); const op = f.render().onDeleteOption(target); await new Promise(setImmediate);
    assert.deepEqual(f.writes[0], ['delete', 'A', target]);
    const next = stage3Proposal('A', 0); next.existingOptions = [0, 1]; f.pending[1].resolve(next); assert.equal(await op, true);
    assert.deepEqual(f.fetch.getState().data.existingOptions, [0, 1]);
  }
  const f = await stage3ActionsFixture(); const only = { ...f.fetch.getState().data, existingOptions: [0] };
  f.api.deleteProposalOption = async () => { throw { response: { status: 403 } }; };
  assert.equal(await f.render(only).onDeleteOption(0), false); assert.equal(f.writes.length, 0);
  let release; f.api.patchAddProposalOption = async (...args) => { f.writes.push(['patch', ...args]); await new Promise((r) => release = r); };
  const pendingWrite = f.render().updateProposalOption(); await new Promise(setImmediate);
  const other = f.fetch.getState().setProposalOption('B', 1); f.pending[1].resolve(stage3Proposal('B', 1)); await other; f.render();
  release(); assert.equal(await pendingWrite, false); assert.equal(f.pending.length, 2); assert.equal(f.fetch.getState().data.campaignId, 'B');
});

test('stage 3 Bundle/overlap pure decisions preserve other coverage and block the final option; user mutation remains gated', () => {
  const data = stage3Proposal(); const snap = data.selectedOption;
  snap.addedAccounts[0].bundleId = 'bundle'; snap.addedAccounts[0].campaignBundleId = 'placed-bundle';
  snap.addedAccounts[1].bundleId = 'bundle'; snap.addedAccounts[1].campaignBundleId = 'placed-bundle';
  snap.addedBundles = [{ bundleId: 'bundle', campaignBundleId: 'placed-bundle' }];
  const decision = overlapDecisions.decideProposalOverlapRemoval({ targetAccount: snap.addedAccounts[0], accounts: snap.addedAccounts, selectedOffer: snap.selectedOffer, optionIndexes: [0] });
  assert.equal(decision.kind, 'remove_packages');
  const retained = proposalPatch.removeProposalGroup(snap, snap.addedAccounts, snap.addedAccounts[0].addedAccountsId);
  assert.equal(retained.accounts.length, 3); assert.ok(retained.accounts.slice(0, 2).every((a) => !a.bundleId && !a.campaignBundleId));
  const both = proposalPatch.removeProposalGroup(snap, snap.addedAccounts, snap.addedAccounts[0].addedAccountsId, true);
  assert.equal(both.accounts.length, 1); assert.equal(both.selectedOfferChange, null);
  const blocked = overlapDecisions.decideProposalOverlapRemoval({ targetAccount: snap.addedAccounts[0], accounts: snap.addedAccounts.slice(0,2), selectedOffer: snap.selectedOffer, optionIndexes: [0] });
  assert.equal(blocked.kind, 'block_last_option'); assert.equal(bundleGate.BUNDLES_AVAILABLE, false);
});

function stage3PageFixture(f) {
  const harness = hookHarness(); const Controls = () => {}, Modals = () => {}, Provider = () => {};
  const { CampaignPage } = load('src/client-side/pages/campaign/campaign-page.tsx', {
    react: harness.hooks, '@/components': { Container: () => {}, Loader: () => {}, ButtonMain: () => {} },
    '@/client-side/react-query': { useCopyShareLinkMutation: () => ({ isPending: false }) }, '@/client-side/ui': { Bar: () => {}, BarSection: () => {} },
    '@/client-side/store': f.stores, './ui/campaign-page-header': { CampaignPageHeader: () => {} }, './ui/campaign-page-controls': { CampaignPageControls: Controls }, './ui/campaign-page-modals': { CampaignPageModals: Modals },
    './model/use-campaign-page-bootstrap': { useCampaignPageBootstrap: (d) => d },
    './model/use-campaign-page-view': { useCampaignPageView: () => ({ optionModal: false, activeOption: f.active, view: -1, localExtraOptions: [], textareaValue: '',
      setOptionModal() {}, setActiveOption() {}, setChangeView() {}, setView() {}, setIsRequesting() {}, setIsRequestSent() {}, setIsRequestingPDF() {}, setLocalExtraOptions() {}, setFlag() {} }) },
    './model/use-campaign-page-actions': { useCampaignPageActions: () => f.render() }, './model/campaign-page.utils': load('src/client-side/pages/campaign/model/campaign-page.utils.ts'),
    '@/client-side/widgets/campaign/campaign-page-content.tsx': { CampaignPageContent: () => {} }, '@/api/client/campaign/campaign.api': { patchCampaign() {} },
    './model/proposal-actions-context': { ProposalActionsContext: { Provider } },
  });
  const render = () => harness.render(() => CampaignPage()); render(); harness.flush();
  return { harness, render, controls: () => elements(render()).find((n) => n.type === Controls).props,
    modal: () => elements(render()).find((n) => n.type === Modals)?.props };
}

test('stage 3 dirty option switch uses actual page handlers: Cancel, Leave without saving, Save failure and synchronized Save', async () => {
  for (const choice of ['cancel', 'leave', 'save-fails', 'save']) {
    const f = await stage3ActionsFixture(); const contentId = f.initial.selectedOption.campaignContent[0]._id;
    f.stores.useUpdateCampaign.getState().setField(contentId, 'mainLink', 'https://dirty.test');
    const page = stage3PageFixture(f); page.controls().onClickOption(1); assert.equal(page.modal().isDirtySwitchModalOpen, true);
    if (choice === 'cancel') { page.modal().onCloseDirtySwitchModal(); assert.equal(page.modal().isDirtySwitchModalOpen, false); assert.ok(f.stores.useUpdateCampaign.getState().patches[contentId]); assert.equal(f.pending.length, 1); continue; }
    if (choice === 'save-fails') {
      f.api.patchAddProposalOption = async () => { throw new Error('PATCH rejected'); };
      await page.modal().onSaveDirtySwitch(); assert.equal(page.modal().isDirtySwitchModalOpen, true);
      assert.ok(f.stores.useUpdateCampaign.getState().patches[contentId]); assert.equal(f.pending.length, 1); continue;
    }
    const operation = choice === 'leave' ? page.modal().onDiscardDirtySwitch() : page.modal().onSaveDirtySwitch(); await new Promise(setImmediate);
    if (choice === 'save') { assert.equal(f.writes.length, 1); f.pending[1].resolve(stage3Proposal()); await new Promise(setImmediate); }
    const last = f.pending.at(-1); assert.equal(last.option, 1); last.resolve(stage3Proposal('A', 1)); await operation;
    assert.equal(f.active, 1); assert.deepEqual(f.stores.useUpdateCampaign.getState().patches, {}); assert.equal(page.modal().isDirtySwitchModalOpen, false);
    assert.equal(f.writes.length, choice === 'save' ? 1 : 0);
  }
});

test('stage 3 actual row confirmation Cancel is inert; confirm removes full Offer or addressed standalone placement', async () => {
  for (const target of [0, 2]) {
    const f = await stage3ActionsFixture(); const store = f.stores.useProposalAccountsStore;
    const snapshot = store.getState().optionSnapshotsByIndex[0]; const harness = hookHarness(); const context = { onDeleteOption: f.render().onDeleteOption, isMutationPending: false };
    const { ActionCell } = load('src/client-side/widgets/campaign/cells/action-cells/delete-cell.tsx', {
      react: { ...harness.hooks, useContext: () => context }, '@/client-side/store': f.stores,
      '@/client-side/utils': { getAccountKey: (a) => a.addedAccountsId }, 'react-toastify': { toast: { error: (m) => assert.fail(m) } },
      '@/client-side/pages/campaign/model/proposal-actions-context': { ProposalActionsContext: {} },
      '@/components/ui/modal-fix/Modal': { Modal: () => {} }, '@/shared/ui': { ButtonMain: () => {}, ButtonSecondary: () => {} },
      '@/client-side/widgets/campaign/model/proposal-row-removal': removalDecisions,
      '@/client-side/widgets/campaign/model/proposal-overlap-removal': overlapDecisions,
    });
    const render = () => harness.render(() => ActionCell({ data: snapshot.addedAccounts[target], optionIndex: 0 }));
    const click = (name) => elements(render()).find((n) => n.type === 'button' && n.props.className === name).props.onClick({ stopPropagation() {} });
    const before = store.getState(); click('trash-action__delete');
    const confirms = elements(render()).filter((n) => n.type === 'button' && n.props.className === 'trash-action__same');
    confirms[1].props.onClick({ stopPropagation() {} }); assert.equal(store.getState().accountsByOption, before.accountsByOption);
    click('trash-action__delete'); await elements(render()).filter((n) => n.type === 'button' && n.props.className === 'trash-action__same')[0].props.onClick({ stopPropagation() {} });
    assert.equal(store.getState().accountsByOption[0].length, target === 0 ? 1 : 2);
    if (target === 0) assert.equal(store.getState().selectedOfferChangeByOption[0], null);
    else assert.ok(store.getState().accountsByOption[0].every((a) => a.addedAccountsId !== snapshot.addedAccounts[2].addedAccountsId));
    assert.equal(f.writes.length, 0, 'row confirmation changes working composition; Save performs PATCH');
  }
});


test('stage 3 option-delete modal keeps Cancel inert and stays open after failed confirmation', async () => {
  const harness = hookHarness(); const Modal = () => {}, ButtonMain = () => {}, ButtonSecondary = () => {}; let succeed = false; const calls = [];
  const { OptionsSlider } = load('src/client-side/widgets/campaign/components/option-slider.tsx', {
    react: harness.hooks, '@/components/ui/modal-fix/Modal': { Modal }, '@/shared/ui': { ButtonMain, ButtonSecondary },
  });
  const render = () => harness.render(() => OptionsSlider({ canEdit: true, optionIndexes: [0, 1], activeOption: 0, onClickOption() {}, onDeleteOption: async (id) => { calls.push(id); return succeed; } }));
  const open = () => elements(render()).find((n) => n.type === 'img' && n.props.onClick).props.onClick({ stopPropagation() {} });
  open(); elements(render()).find((n) => n.type === ButtonSecondary && n.props.text === 'Cancel').props.onClick();
  assert.equal(elements(render()).some((n) => n.type === Modal), false); assert.deepEqual(calls, []);
  open(); await elements(render()).find((n) => n.type === ButtonMain).props.onClick(); assert.equal(elements(render()).some((n) => n.type === Modal), true);
  succeed = true; await elements(render()).find((n) => n.type === ButtonMain).props.onClick(); assert.equal(elements(render()).some((n) => n.type === Modal), false); assert.deepEqual(calls, [0, 0]);
});

test('stage 3 PATCH permission and unsupported Bundle state are rejected before API; DELETE success read failure retries GET only', async () => {
  const f = await stage3ActionsFixture(); const store = f.stores.useProposalAccountsStore;
  store.getState().optionSnapshotsByIndex[0].canEdit = false;
  assert.equal(await f.render().updateProposalOption(), false); assert.equal(f.writes.length, 0);
  store.getState().optionSnapshotsByIndex[0].canEdit = true; store.getState().optionSnapshotsByIndex[0].addedBundles = [{ bundleId: 'bundle' }];
  assert.equal(await f.render().updateProposalOption(), false); assert.equal(f.writes.length, 0);
  store.getState().optionSnapshotsByIndex[0].addedBundles = [];
  const deletion = f.render().onDeleteOption(0); await new Promise(setImmediate); f.pending[1].reject(new Error('read unavailable')); assert.equal(await deletion, false);
  const retry = f.render().retryProposalRead(); await new Promise(setImmediate); const fresh = stage3Proposal(); fresh.existingOptions = [0, 1]; f.pending[2].resolve(fresh); assert.equal(await retry, true);
  assert.equal(f.writes.filter(([kind]) => kind === 'delete').length, 1); assert.equal(store.getState().currentCampaignId, 'A');
});


test('stage 3 a newer read of the same option invalidates the older write continuation', async () => {
  const f = await stage3ActionsFixture(); let release;
  f.api.patchAddProposalOption = async () => { await new Promise((r) => release = r); };
  const write = f.render().updateProposalOption(); await new Promise(setImmediate);
  const read = f.fetch.getState().setProposalOption('A', 0); f.pending[1].resolve(stage3Proposal()); await read;
  release(); assert.equal(await write, false); assert.equal(f.pending.length, 2, 'stale PATCH must not launch another GET');
  assert.equal(f.messages.some(([kind]) => kind === 'success'), false);
});

// Stage-3 review: destructive intents and known-write recovery use real page/actions handlers.
function addReviewOption(f, index, dirty = false) {
  const data = stage3Proposal('A', index); const store = f.stores.useProposalAccountsStore;
  store.getState().initOption(index, data.selectedOption.addedAccounts, data.selectedOption.campaignContent, { force: true, snapshot: data.selectedOption });
  if (dirty) store.getState().setAccountDateRequest(index, data.selectedOption.addedAccounts[0].addedAccountsId, 'unsaved-option-' + index);
  return data;
}
function reviewWriteGet(f, index) {
  const data = stage3Proposal('A', index); const write = f.writes.filter(([kind, , option]) => kind === 'patch' && option === index).at(-1);
  if (write) {
    data.selectedOption.campaignContent = write[3].campaignContent;
    data.selectedOption.addedAccounts = write[3].addedAccounts.map((row) => ({ ...data.selectedOption.addedAccounts.find((a) => a.addedAccountsId === row.addedAccountsId), ...row }));
  }
  return data;
}

test('UX delete dirty current or other options goes straight to DELETE and preserves surviving edits', async () => {
 for(const index of [0,2]) {
  const f=await stage3ActionsFixture();addReviewOption(f,1,true);addReviewOption(f,2);
  const id=f.initial.selectedOption.campaignContent[0]._id;const updates=f.stores.useUpdateCampaign;
  updates.getState().setField(id,'mainLink','https://dirty-zero.test');
  const patch=updates.getState().patches[id];const page=stage3PageFixture(f);
  const op=page.controls().onDeleteOption(index);await tick();
  assert.equal(page.modal()?.isDirtySwitchModalOpen ?? false,false);assert.deepEqual(f.writes.map(w=>w[0]),['delete']);
  const fresh=stage3Proposal();fresh.existingOptions=[0,1];f.pending[1].resolve(fresh);assert.equal(await op,true);
  if(index===0){assert.deepEqual(updates.getState().patches,{});assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[0][0].dateRequest,'unsaved-option-1');}
  else {assert.equal(updates.getState().patches[id],patch);assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[1][0].dateRequest,'unsaved-option-1');}
 }
});

test('UX dirty active option 2 survives deletion of option 0 at its new index without PATCH', async()=>{
 const f=await stage3ActionsFixture();addReviewOption(f,1);const two=addReviewOption(f,2);
 const change=f.render().onClickOption(2);await tick();f.pending.at(-1).resolve(two);await change;
 const store=f.stores.useProposalAccountsStore;const id=two.selectedOption.campaignContent[0]._id;
 store.getState().setAccountDateRequest(2,two.selectedOption.addedAccounts[0].addedAccountsId,'dirty-two');
 f.stores.useUpdateCampaign.getState().setField(id,'mainLink','https://dirty-two.test');const patch=f.stores.useUpdateCampaign.getState().patches[id];
 const op=f.render().onDeleteOption(0);await tick();
 assert.equal(store.getState().accountsByOption[1][0].dateRequest,'dirty-two');
 const fresh=structuredClone(two);fresh.selectedOption.optionIndex=1;fresh.existingOptions=[0,1];f.pending.at(-1).resolve(fresh);assert.equal(await op,true);
 assert.equal(f.active,1);assert.equal(store.getState().accountsByOption[1][0].dateRequest,'dirty-two');assert.equal(f.stores.useUpdateCampaign.getState().patches[id],patch);
 assert.deepEqual(f.writes.map(w=>w[0]),['delete']);
});

test('UX failed DELETE preserves dirty data; failed GET retains reindexed edits and recovery does not repeat DELETE', async()=>{
 const f=await stage3ActionsFixture();addReviewOption(f,1,true);addReviewOption(f,2);
 const id=f.initial.selectedOption.campaignContent[0]._id;f.stores.useUpdateCampaign.getState().setField(id,'mainLink','https://kept.test');
 f.api.deleteProposalOption=async()=>{throw {response:{status:403}};};
 assert.equal(await f.render().onDeleteOption(0),false);assert.ok(f.stores.useUpdateCampaign.getState().patches[id]);assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[1][0].dateRequest,'unsaved-option-1');
 f.api.deleteProposalOption=async(...args)=>f.writes.push(['delete',...args]);
 const op=f.render().onDeleteOption(0);await tick();f.pending.at(-1).reject(new Error('GET failed'));assert.equal(await op,false);
 assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[0][0].dateRequest,'unsaved-option-1');assert.equal(f.render().needsProposalRead,true);
 const retry=f.render().retryProposalRead();await tick();const fresh=stage3Proposal();fresh.existingOptions=[0,1];f.pending.at(-1).resolve(fresh);assert.equal(await retry,true);
 assert.equal(f.writes.length,1);assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[0][0].dateRequest,'unsaved-option-1');
});

for (const kind of ['patch', 'delete']) {
  test('review R2 ' + kind + ' success followed by displaced refetch has explicit GET-only recovery', async () => {
    const f = await stage3ActionsFixture();
    const operation = kind === 'patch' ? f.render().updateProposalOption() : f.render().onDeleteOption(2);
    await new Promise(setImmediate); assert.equal(f.writes.length, 1);
    const newer = f.fetch.getState().setProposalOption('A', 0); const newerData = stage3Proposal();
    if (kind === 'delete') newerData.existingOptions = [0, 1]; f.pending[2].resolve(newerData); await newer;
    f.pending[1].resolve(stage3Proposal()); assert.equal(await operation, false);
    assert.equal(f.render().needsProposalRead, true); assert.ok(f.render().getPendingProposalWrite());
    assert.equal(await f.render().onDeleteOption(2), false); assert.equal(f.writes.length, 1);
    const retry = f.render().retryProposalRead(); await new Promise(setImmediate); f.pending[3].resolve(newerData); assert.equal(await retry, true);
    assert.equal(f.writes.length, 1); assert.equal(f.render().needsProposalRead, false); assert.equal(f.render().getPendingProposalWrite(), null);
  });

  test('review R2 ' + kind + ' known success after newer GET starts before refetch cannot be forgotten or rewritten', async () => {
    const f = await stage3ActionsFixture(); let release;
    if (kind === 'patch') f.api.patchAddProposalOption = async (...args) => { f.writes.push(['patch', ...args]); await new Promise((r) => release = r); };
    else f.api.deleteProposalOption = async (...args) => { f.writes.push(['delete', ...args]); await new Promise((r) => release = r); };
    const operation = kind === 'patch' ? f.render().updateProposalOption() : f.render().onDeleteOption(2); await new Promise(setImmediate);
    const newer = f.fetch.getState().setProposalOption('A', 0); const fresh = stage3Proposal(); if (kind === 'delete') fresh.existingOptions = [0, 1];
    f.pending[1].resolve(fresh); await newer; release(); assert.equal(await operation, false);
    assert.equal(f.pending.length, 2); assert.equal(f.render().needsProposalRead, true);
    assert.equal(await f.render().onDeleteOption(2), false); assert.equal(f.writes.length, 1);
    const retry = f.render().retryProposalRead(); await new Promise(setImmediate); f.pending[2].resolve(fresh); assert.equal(await retry, true); assert.equal(f.writes.length, 1);
  });
}

test('UX page recovery after DELETE reads only and never opens the dirty modal', async()=>{
 const f=await stage3ActionsFixture();addReviewOption(f,2);f.stores.useUpdateCampaign.getState().setField(f.initial.selectedOption.campaignContent[0]._id,'mainLink','https://dirty.test');
 const page=stage3PageFixture(f);const deletion=page.controls().onDeleteOption(2);await tick();f.pending[1].reject(new Error('GET failed'));assert.equal(await deletion,false);
 assert.equal(page.modal().isDirtySwitchModalOpen,false);
 const button=elements(page.render()).find(n=>n.type==='button'&&n.props.children==='Retry reading option');const retry=button.props.onClick();await tick();const fresh=stage3Proposal();fresh.existingOptions=[0,1];f.pending[2].resolve(fresh);assert.equal(await retry,true);assert.equal(f.writes.length,1);
});

test('review R2 foreign campaign and unmount suppress old write/read continuations and recovery UI', async () => {
  for (const mode of ['campaign', 'unmount']) {
    const f = await stage3ActionsFixture(); const operation = f.render().updateProposalOption(); await new Promise(setImmediate);
    if (mode === 'campaign') {
      const other = f.fetch.getState().setProposalOption('B', 1); f.pending[2].resolve(stage3Proposal('B', 1)); await other; f.render(); f.harness.flush();
    } else f.harness.unmount();
    f.pending[1].resolve(stage3Proposal()); assert.equal(await operation, false);
    if (mode === 'campaign') { assert.equal(f.fetch.getState().data.campaignId, 'B'); assert.equal(f.render().needsProposalRead, false); }
    assert.equal(f.messages.some(([kind]) => kind === 'success'), false);
  }
});


test('review R1 reindex uses pre-DELETE option identities even if a published GET updates a cached target snapshot first', async () => {
  const f = await stage3ActionsFixture(); addReviewOption(f, 1); const two = addReviewOption(f, 2);
  const store = f.stores.useProposalAccountsStore;
  store.setState((s) => ({ optionSnapshotsByIndex: { ...s.optionSnapshotsByIndex, 1: { ...s.optionSnapshotsByIndex[1], price: 101 }, 2: { ...s.optionSnapshotsByIndex[2], price: 202 } } }));
  const switching = f.render().onClickOption(2); await new Promise(setImmediate); two.selectedOption.price = 202; f.pending[1].resolve(two); await switching;
  assert.equal(f.active, 2); const deletion = f.render().onDeleteOption(0); await new Promise(setImmediate);
  const fresh = stage3Proposal('A', 1); fresh.existingOptions = [0, 1]; fresh.selectedOption.price = 202;
  store.setState((s) => ({ optionSnapshotsByIndex: { ...s.optionSnapshotsByIndex, 1: fresh.selectedOption } }));
  f.pending[2].resolve(fresh); assert.equal(await deletion, true);
  assert.equal(store.getState().optionSnapshotsByIndex[0].price, 101); assert.equal(store.getState().optionSnapshotsByIndex[1].price, 202);
  assert.equal(store.getState().optionSnapshotsByIndex[0].optionIndex, 0); assert.equal(store.getState().optionSnapshotsByIndex[1].optionIndex, 1);
});


async function sharedContentEditorsFixture() {
  const f = await stage3ActionsFixture(); const zero = stage3Proposal('A', 0), one = stage3Proposal('A', 1);
  zero.selectedOption.campaignContent[0].mainLink = 'https://option-zero-A.test';
  one.selectedOption.campaignContent[0].mainLink = 'https://option-one-B.test';
  const store = f.stores.useProposalAccountsStore;
  for (const data of [zero, one]) store.getState().initOption(data.selectedOption.optionIndex, data.selectedOption.addedAccounts, data.selectedOption.campaignContent, { force: true, snapshot: data.selectedOption });
  return { ...f, zero, one, contentId: zero.selectedOption.campaignContent[0]._id };
}

test('patch ownership: active no-op A plus inactive date edit saves B and retains the active patch', async () => {
  const f = await sharedContentEditorsFixture(); const updates = f.stores.useUpdateCampaign;
  updates.getState().setField(f.contentId, 'mainLink', f.zero.selectedOption.campaignContent[0].mainLink);
  const ownPatch = updates.getState().patches[f.contentId];
  f.stores.useProposalAccountsStore.getState().setAccountDateRequest(1, f.one.selectedOption.addedAccounts[0].addedAccountsId, 'edited-date-one');
  assert.deepEqual(f.render().getDirtyProposalOptions(), [1]);
  const save = f.render().saveDirtyProposalOptions(); await new Promise(setImmediate);
  assert.equal(f.writes.length, 1); assert.equal(f.writes[0][2], 1);
  assert.equal(f.writes[0][3].campaignContent[0].mainLink, 'https://option-one-B.test');
  f.pending[1].resolve(reviewWriteGet(f, 1)); assert.equal(await save, true);
  assert.equal(updates.getState().patches[f.contentId], ownPatch, 'inactive save must not clear active editor patches with the same content ID');
});

test('patch ownership: dirty editors with identical content IDs each save their own texts', async () => {
  const f = await sharedContentEditorsFixture();
  f.stores.useUpdateCampaign.getState().setField(f.contentId, 'mainLink', 'https://new-zero-A.test');
  f.stores.useProposalAccountsStore.getState().setAccountDateRequest(1, f.one.selectedOption.addedAccounts[0].addedAccountsId, 'edited-date-one');
  assert.deepEqual(f.render().getDirtyProposalOptions(), [0, 1]);
  const save = f.render().saveDirtyProposalOptions(); await new Promise(setImmediate);
  assert.equal(f.writes[0][3].campaignContent[0].mainLink, 'https://new-zero-A.test');
  f.pending[1].resolve(reviewWriteGet(f, 0)); await new Promise(setImmediate);
  assert.equal(f.writes[1][2], 1); assert.equal(f.writes[1][3].campaignContent[0].mainLink, 'https://option-one-B.test');
  f.pending[2].resolve(reviewWriteGet(f, 1)); assert.equal(await save, true);
  assert.deepEqual(f.stores.useUpdateCampaign.getState().patches, {});
  assert.equal(f.stores.useProposalAccountsStore.getState().contentByOption[0][0].mainLink, 'https://new-zero-A.test');
  assert.equal(f.stores.useProposalAccountsStore.getState().contentByOption[1][0].mainLink, 'https://option-one-B.test');
});

test('patch ownership: completion of an inactive save neither applies nor clears new active-editor edits', async () => {
  const f = await sharedContentEditorsFixture(); const updates = f.stores.useUpdateCampaign;
  updates.getState().setField(f.contentId, 'mainLink', 'https://option-zero-A.test');
  f.stores.useProposalAccountsStore.getState().setAccountDateRequest(1, f.one.selectedOption.addedAccounts[0].addedAccountsId, 'edited-one');
  const save = f.render().saveDirtyProposalOptions(); await new Promise(setImmediate);
  updates.getState().setField(f.contentId, 'mainLink', 'https://later-zero-C.test');
  const later = updates.getState().patches[f.contentId];
  assert.equal(f.writes[0][3].campaignContent[0].mainLink, 'https://option-one-B.test');
  f.pending[1].resolve(reviewWriteGet(f, 1)); assert.equal(await save, false, 'new unsaved edits must prevent a destructive continuation');
  assert.equal(updates.getState().patches[f.contentId], later); assert.deepEqual(f.render().getDirtyProposalOptions(), [0]);
  assert.equal(f.stores.useProposalAccountsStore.getState().contentByOption[1][0].mainLink, 'https://option-one-B.test');
});

test('patch ownership: DELETE of active editor disposes its no-op patch before reindexed option B can inherit it', async () => {
  const f = await sharedContentEditorsFixture(); const updates = f.stores.useUpdateCampaign;
  updates.getState().setField(f.contentId, 'mainLink', 'https://option-zero-A.test');
  assert.deepEqual(f.render().getDirtyProposalOptions(), []);
  let successorPatch; const survivor = f.stores.useProposalAccountsStore.getState().accountsByOption[1];
  const unsubscribe = f.stores.useProposalAccountsStore.subscribe(state => { if (state.accountsByOption[0] === survivor) successorPatch = updates.getState().patches; });
  const deletion = f.render().onDeleteOption(0); await new Promise(setImmediate);
  assert.deepEqual(successorPatch, {}, 'removed-editor patches must be detached before reindex publishes its successor'); unsubscribe();
  assert.deepEqual(updates.getState().patches, {}, 'known DELETE success must detach the removed editor before its GET publishes');
  const fresh = structuredClone(f.one); fresh.selectedOption.optionIndex = 0; fresh.existingOptions = [0, 1];
  f.pending[1].resolve(fresh); assert.equal(await deletion, true);
  assert.equal(f.stores.useProposalAccountsStore.getState().contentByOption[0][0].mainLink, 'https://option-one-B.test');
  assert.deepEqual(f.render().getDirtyProposalOptions(), []); assert.deepEqual(updates.getState().patches, {});
});

test('patch ownership: switch discards source no-op patch before target GET; deleting another option keeps surviving editor ownership', async () => {
  const f = await sharedContentEditorsFixture(); const updates = f.stores.useUpdateCampaign;
  updates.getState().setField(f.contentId, 'mainLink', 'https://option-zero-A.test');
  const switching = f.render().onClickOption(1); await new Promise(setImmediate);
  assert.deepEqual(updates.getState().patches, {}, 'source patches cannot reach the target editor during its GET');
  f.pending[1].resolve(f.one); await switching;
  updates.getState().setField(f.contentId, 'mainLink', 'https://option-one-B.test');
  const survivingPatch = updates.getState().patches[f.contentId];
  const deletion = f.render().onDeleteOption(0); await new Promise(setImmediate);
  assert.equal(updates.getState().patches[f.contentId], survivingPatch, 'known DELETE of another option cannot clear the surviving editor patch');
  const fresh = structuredClone(f.one); fresh.selectedOption.optionIndex = 0; fresh.existingOptions = [0, 1];
  f.pending[2].resolve(fresh); assert.equal(await deletion, true);
  assert.equal(updates.getState().patches[f.contentId], survivingPatch);
  assert.equal(f.stores.useProposalAccountsStore.getState().contentByOption[0][0].mainLink, 'https://option-one-B.test');
});


test('patch ownership: switching to a cached dirty option preserves its own workflow without inheriting source patches', async () => {
  const f = await sharedContentEditorsFixture();
  f.stores.useUpdateCampaign.getState().setField(f.contentId, 'mainLink', 'https://option-zero-A.test');
  f.stores.useProposalAccountsStore.getState().setAccountDateRequest(1, f.one.selectedOption.addedAccounts[0].addedAccountsId, 'pending-date-one');
  const switching = f.render().onClickOption(1); await new Promise(setImmediate);
  assert.deepEqual(f.stores.useUpdateCampaign.getState().patches, {});
  f.pending[1].resolve(f.one); await switching;
  assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[1][0].dateRequest, 'pending-date-one');
  assert.equal(f.stores.useProposalAccountsStore.getState().contentByOption[1][0].mainLink, 'https://option-one-B.test');
});

// Stage 4: structural backend fixtures; real page/actions and reader, mocked API only.
const tick = () => new Promise(setImmediate);
function createdOption(index = 7) {
  const data = stage3Proposal('A', index); data.existingOptions = [0, 1, 2, index];
  data.selectedOption.addedAccounts.forEach((a, i) => a.addedAccountsId = (801 + i).toString(16).padStart(24, '0'));
  data.selectedOption.selectedOffer.selectedAddedAccountsIds = data.selectedOption.addedAccounts.slice(0, 2).map((a) => a.addedAccountsId);
  return data;
}
function acceptOptionPosts(f, identity = { campaignId: 'A', optionIndex: 7 }) {
  f.api.postAddProposalOption = async (...args) => { f.writes.push(['post', ...args]); return { data: { statusCode: 201, message: 'Success', data: identity } }; };
}
async function allowOptionCreate(f, pendingIndex = 1, parent = f.initial) {
  await tick(); assert.equal(f.pending[pendingIndex].option, parent.selectedOption.optionIndex);
  f.pending[pendingIndex].resolve(parent); await tick();
}

test('stage 4 actual clone handler sends standalone/Offer metadata, currency and canonical second-variant refs without lifecycle IDs', async () => {
  for (const withOffer of [false, true]) for (const [currency, price] of [['EUR', 115], ['USD', 124], ['GBP', 106]]) {
    const f = await stage3ActionsFixture({ withOffer }); acceptOptionPosts(f);
    const store = f.stores.useProposalAccountsStore; const snapshot = store.getState().optionSnapshotsByIndex[0];
    snapshot.price = price; snapshot.displayCurrency = currency;
    const content = snapshot.campaignContent[0];
    content.descriptions.push({ _id: '000000000000000000000413', description: 'second description' });
    content.additionalBrief.push({ _id: '000000000000000000000423', additionalBrief: 'second brief' });
    snapshot.addedAccounts[0].selectedCampaignContentItem = { campaignContentItemId: content._id, descriptionId: '000000000000000000000413', additionalBriefId: '000000000000000000000423' };
    store.getState().initOption(0, snapshot.addedAccounts, snapshot.campaignContent, { force: true, snapshot });
    f.render().beginOptionCreate(); const op = f.render().onAddOption(true); const parallel = f.render().onAddOption(true);
    assert.equal(await parallel, false); await allowOptionCreate(f);
    assert.equal(f.writes.length, 1); const body = f.writes[0][2];
    assert.equal(body.displayCurrency, currency); assert.equal(body.campaignPrice, price);
    assert.deepEqual(body.selectedOffer, withOffer ? { offerId: snapshot.selectedOffer.offerId, selectedAccountIds: snapshot.selectedOffer.selectedAccountIds } : null);
    assert.equal(body.addedAccounts.length, 3);
    for (const row of body.addedAccounts) for (const field of ['_id', 'addedAccountsId', 'selectionId', 'campaignBundleId']) assert.equal(Object.hasOwn(row, field), false);
    assert.equal(body.campaignContent[0]._id, content._id); assert.equal(body.campaignContent[0].profileType, content.profileType);
    assert.deepEqual(body.addedAccounts[0].selectedCampaignContentItem, snapshot.addedAccounts[0].selectedCampaignContentItem);
    assert.deepEqual(body.campaignContent[0].additionalBrief.at(-1), { _id: '000000000000000000000423', additionalBrief: 'second brief' });
    assert.equal(f.pending[2].option, 7, 'target comes from response, not existingOptions max');
    const fresh = createdOption(); f.pending[2].resolve(fresh); assert.equal(await op, true); assert.equal(f.active, 7);
    assert.equal(store.getState().optionSnapshotsByIndex[7].addedAccounts[0].addedAccountsId, fresh.selectedOption.addedAccounts[0].addedAccountsId);
    assert.deepEqual(store.getState().optionSnapshotsByIndex[0], snapshot);
    assert.equal(f.render().needsProposalRead, false);
  }
});

test('stage 4 POST success + failed or displaced GET exposes GET-only recovery and blocks other writes', async () => {
  for (const displaced of [false, true]) {
    const f = await stage3ActionsFixture(); acceptOptionPosts(f);
    const create = f.render().onAddOption(true); await allowOptionCreate(f);
    if (displaced) {
      const newer = f.fetch.getState().setProposalOption('A', 7); f.pending[3].resolve(createdOption()); await newer;
      f.pending[2].resolve(createdOption());
    } else f.pending[2].reject(new Error('GET unavailable'));
    assert.equal(await create, false); assert.equal(f.render().needsProposalRead, true);
    assert.equal(await f.render().onDeleteOption(2), false); assert.equal(await f.render().updateProposalOption(), false);
    const retry = f.render().retryProposalRead(); await tick(); f.pending.at(-1).resolve(createdOption());
    assert.equal(await retry, true); assert.equal(f.active, 7); assert.equal(f.writes.length, 1);
  }
});

test('stage 4 known POST success cannot be forgotten if a newer source GET starts before refetch', async () => {
  const f = await stage3ActionsFixture(); let release;
  f.api.postAddProposalOption = async (...args) => { f.writes.push(['post', ...args]); await new Promise((r) => release = r); return { data: { data: { campaignId: 'A', optionIndex: 7 } } }; };
  const create = f.render().onAddOption(true); await allowOptionCreate(f);
  const newer = f.fetch.getState().setProposalOption('A', 0); f.pending[2].resolve(f.initial); await newer;
  release(); assert.equal(await create, false); assert.equal(f.pending.length, 3); assert.equal(f.render().needsProposalRead, true);
  const retry = f.render().onAddOption(true); await tick(); f.pending[3].resolve(createdOption()); assert.equal(await retry, true);
  assert.equal(f.writes.length, 1);
});

test('stage 4 unexpected POST identity and ambiguous network outcome forbid a second POST; confirmed refusal preserves editing', async () => {
  for (const scenario of ['wrong-campaign', 'missing-index', 'network', 'refusal']) {
    const f = await stage3ActionsFixture(); const state = f.stores.useProposalAccountsStore.getState();
    const original = state.accountsByOption[0];
    if (scenario === 'network' || scenario === 'refusal') f.api.postAddProposalOption = async (...args) => { f.writes.push(['post', ...args]); throw scenario === 'network' ? new Error('network outcome unknown') : { response: { status: 400 } }; };
    else acceptOptionPosts(f, scenario === 'wrong-campaign' ? { campaignId: 'B', optionIndex: 7 } : { campaignId: 'A' });
    const create = f.render().onAddOption(true); await allowOptionCreate(f); assert.equal(await create, false);
    assert.equal(f.pending.length, 2); assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[0], original);
    assert.equal(f.render().optionCreateBlocked, scenario !== 'refusal');
    if (scenario !== 'refusal') { assert.equal(await f.render().onAddOption(true), false); assert.equal(f.writes.length, 1); }
  }
});

test('stage 4 foreign campaign/option and unmount suppress POST and GET continuations', async () => {
  for (const point of ['post', 'get']) for (const destination of ['campaign', 'option', 'unmount']) {
    const f = await stage3ActionsFixture(); let release;
    if (point === 'post') f.api.postAddProposalOption = async (...args) => { f.writes.push(['post', ...args]); await new Promise((r) => release = r); return { data: { data: { campaignId: 'A', optionIndex: 7 } } }; };
    else acceptOptionPosts(f);
    const op = f.render().onAddOption(true); await allowOptionCreate(f);
    if (destination === 'unmount') f.harness.unmount();
    else {
      const id = destination === 'campaign' ? 'B' : 'A';
      const read = f.fetch.getState().setProposalOption(id, 1); f.pending.at(-1).resolve(stage3Proposal(id, 1)); await read; f.render(); f.harness.flush();
    }
    if (point === 'post') release(); else f.pending[2].resolve(createdOption());
    assert.equal(await op, false); assert.equal(f.active, 0); assert.equal(f.messages.some(([kind]) => kind === 'success'), false);
    if (destination === 'unmount' && point === 'get') assert.equal(f.fetch.getState().data, null, 'unmounted GET cannot publish');
    if (destination !== 'unmount') { assert.equal(f.fetch.getState().data.selectedOption.optionIndex, 1); assert.equal(f.render().needsProposalRead, false); assert.equal(f.render().optionCreateBlocked, false); }
    assert.equal(f.stores.useProposalAccountsStore.getState().optionSnapshotsByIndex[7], undefined);
  }
});

test('stage 4 clone dirty modal Cancel/failed Save cannot create; Leave is explicit and Save waits PATCH/GET', async () => {
  for (const choice of ['cancel', 'save-fails', 'leave', 'save']) {
    const f = await stage3ActionsFixture(); acceptOptionPosts(f); addReviewOption(f, 1, true);
    const id = f.initial.selectedOption.campaignContent[0]._id;
    f.stores.useUpdateCampaign.getState().setField(id, 'mainLink', 'https://unsaved-source.test');
    const page = stage3PageFixture(f); await page.modal().onAddOptionYes(); assert.equal(page.modal().isDirtySwitchModalOpen, true); assert.equal(f.writes.length, 0);
    if (choice === 'cancel') { page.modal().onCloseDirtySwitchModal(); assert.equal(f.pending.length, 1); assert.ok(f.stores.useUpdateCampaign.getState().patches[id]); continue; }
    if (choice === 'save-fails') {
      f.api.patchAddProposalOption = async () => { throw new Error('Save refused'); };
      await page.modal().onSaveDirtySwitch(); assert.equal(f.writes.length, 0); assert.equal(page.modal().isDirtySwitchModalOpen, true); assert.ok(f.stores.useUpdateCampaign.getState().patches[id]); continue;
    }
    const op = choice === 'leave' ? page.modal().onDiscardDirtySwitch() : page.modal().onSaveDirtySwitch(); await tick();
    let next = 1;
    if (choice === 'save') { assert.equal(f.writes[0][0], 'patch'); f.pending[next++].resolve(reviewWriteGet(f, 0)); await tick(); }
    await allowOptionCreate(f, next++); assert.equal(f.writes.at(-1)[0], 'post');
    const expected = choice === 'save' ? 'https://unsaved-source.test' : f.initial.selectedOption.campaignContent[0].mainLink;
    assert.equal(f.writes.at(-1)[2].campaignContent[0].mainLink, expected);
    f.pending[next].resolve(createdOption()); await op;
    assert.equal(f.active, 7); assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[1][0].dateRequest, 'unsaved-option-1');
    assert.deepEqual(f.stores.useUpdateCampaign.getState().patches, {});
  }
});

test('stage 4 clone does not mix matching content IDs and preserves late source patches in the source cache', async () => {
  const f = await sharedContentEditorsFixture(); acceptOptionPosts(f);
  const state = f.stores.useProposalAccountsStore; const updates = f.stores.useUpdateCampaign;
  state.getState().setAccountDateRequest(1, f.one.selectedOption.addedAccounts[0].addedAccountsId, 'unsaved-one');
  updates.getState().setField(f.contentId, 'mainLink', 'https://option-zero-A.test'); // semantic no-op
  const create = f.render().onAddOption(true); await tick();
  updates.getState().setField(f.contentId, 'mainLink', 'https://late-source-edit.test');
  f.pending[1].resolve(f.initial); await tick();
  assert.equal(f.writes[0][2].campaignContent[0].mainLink, 'https://option-zero-A.test', 'clone uses one saved snapshot captured at intent');
  assert.deepEqual(updates.getState().patches, {});
  assert.equal(state.getState().contentByOption[0][0].mainLink, 'https://late-source-edit.test');
  f.pending[2].resolve(createdOption()); assert.equal(await create, true);
  assert.equal(state.getState().contentByOption[1][0].mainLink, 'https://option-one-B.test');
  assert.equal(state.getState().accountsByOption[1][0].dateRequest, 'unsaved-one');
  assert.equal(state.getState().contentByOption[7][0].mainLink, createdOption().selectedOption.campaignContent[0].mainLink);
});

test('stage 4 No begins a fresh option builder retaining source identity/currency without a POST or cache reset', async () => {
  const f = await stage3ActionsFixture(); addReviewOption(f, 1, true);
  const page = stage3PageFixture(f); await page.modal().onAddOptionNo();
  assert.equal(f.writes.length, 0); assert.equal(f.pending.length, 1);
  const url = new URL(f.navigation[0], 'https://fixture.test');
  assert.equal(url.pathname, '/client/create-campaign'); assert.equal(url.searchParams.get('mode'), 'proposal-option-create');
  assert.equal(url.searchParams.get('campaignId'), 'A'); assert.equal(url.searchParams.get('sourceOption'), '0'); assert.equal(url.searchParams.get('currency'), 'USD');
  assert.equal(f.builder.getState().selectedAccounts.length, 0); assert.equal(f.builder.getState().campaignName, 'Proposal');
  assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[1][0].dateRequest, 'unsaved-option-1');
});

test('stage 4 permission, incomplete Offer, invalid currency and Bundle gate reject clone before API', async () => {
  for (const scenario of ['permission', 'offer', 'currency', 'bundle', 'bundle-link']) {
    const f = await stage3ActionsFixture(); acceptOptionPosts(f); const source = f.stores.useProposalAccountsStore.getState().optionSnapshotsByIndex[0];
    if (scenario === 'permission') source.canEdit = false;
    if (scenario === 'offer') source.selectedOffer.selectedAddedAccountsIds = [];
    if (scenario === 'currency') source.displayCurrency = '';
    if (scenario === 'bundle') source.addedBundles = [{ bundleId: 'bundle' }];
    if (scenario === 'bundle-link') source.addedAccounts[0].campaignBundleId = 'placed-bundle';
    assert.equal(await f.render().onAddOption(true), false); assert.equal(f.writes.length, 0); assert.equal(f.pending.length, 1);
  }
  const f = await stage3ActionsFixture(); acceptOptionPosts(f); const create = f.render().onAddOption(true);
  const forbidden = stage3Proposal(); forbidden.selectedOption.canEdit = false;
  await allowOptionCreate(f, 1, forbidden); assert.equal(await create, false); assert.equal(f.writes.length, 0);
});

function newOptionBuilderFixture(f, currency = 'USD') {
  hydrateFixture(f.builder); f.builder.getState().actions.setSelectedCurrency(currency);
  const harness = hookHarness(), navigation = [], session = [];
  let params = new URLSearchParams('mode=proposal-option-create&campaignId=A&sourceOption=0');
  const module = load('src/pages/client-side/campaign-post-content/model/use-create-option-from-builder.ts', {
    react: harness.hooks, [builderModule]: { useCampaignBuilderStore: f.builder },
    '@/entities/client-side/campaign-creator-page/campaign-builder/model/draft-occurrences': occurrenceModel,
    'react-router-dom': { useNavigate: () => (url) => navigation.push(url) }, 'react-toastify': { toast: { error: (m) => f.messages.push(['error', m]), success: (m) => f.messages.push(['success', m]) } },
    '@/api/client/campaign/campaign.api': f.api, '@/client-side/store': f.stores,
  }, { sessionStorage: { setItem: (key, value) => session.push([key, JSON.parse(value)]) } });
  const render = () => harness.render(() => module.useCreateOptionFromBuilder(params)); render(); harness.flush();
  const payload = () => ({ addedAccounts: f.builder.getState().selectedAccounts.map((a) => ({ ...a, socialAccountId: a.accountId })), campaignContent: f.builder.getState().campaignContent });
  return { render, payload, harness, navigation, session, setParams: (next) => params = new URLSearchParams(next) };
}

test('stage 4 new builder handler creates from fresh form + store with Offer membership, currencies and stable refs', async () => {
  for (const [currency, price] of [['EUR', 115], ['USD', 124], ['GBP', 106]]) {
    const f = await stage3ActionsFixture(); acceptOptionPosts(f); addReviewOption(f, 1, true);
    const b = newOptionBuilderFixture(f, currency); const payload = b.payload();
    const reference = payload.addedAccounts[0].selectedCampaignContentItem;
    const submit = b.render().submit(payload); const double = b.render().submit(payload); await double; await allowOptionCreate(f);
    assert.equal(f.writes.length, 1); const body = f.writes[0][2]; assert.equal(body.displayCurrency, currency); assert.equal(body.campaignPrice, price);
    assert.deepEqual(body.selectedOffer, { offerId: f.builder.getState().selectedOfferId, selectedAccountIds: f.builder.getState().selectedOfferAccountIds });
    assert.deepEqual(body.addedAccounts[0].selectedCampaignContentItem, reference);
    assert.ok(body.addedAccounts.every((a) => !a.selectionId && !a.addedAccountsId));
    f.pending[2].resolve(createdOption()); await submit;
    assert.deepEqual(b.navigation, ['/client/campaign']); assert.deepEqual(b.session, [['lastCampaign', { id: 'A', status: 'proposal', optionIndex: 7 }]]);
    assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[1][0].dateRequest, 'unsaved-option-1');
  }
});

test('stage 4 builder recovery retries GET only, preserves form on refusal, and rejects stale query/unmount', async () => {
  for (const scenario of ['read-fails', 'refusal', 'scope', 'unmount']) {
    const f = await stage3ActionsFixture(); acceptOptionPosts(f); const b = newOptionBuilderFixture(f); const payload = b.payload();
    if (scenario === 'refusal') f.api.postAddProposalOption = async (...args) => { f.writes.push(['post', ...args]); throw { response: { status: 400 } }; };
    const op = b.render().submit(payload); await allowOptionCreate(f);
    if (scenario === 'refusal') { await op; assert.equal(b.render().blocked, false); assert.deepEqual(f.builder.getState().campaignContent, payload.campaignContent); continue; }
    if (scenario === 'scope') { b.setParams('mode=proposal-option-create&campaignId=A&sourceOption=1'); b.render(); }
    if (scenario === 'unmount') b.harness.unmount();
    if (scenario === 'read-fails') f.pending[2].reject(new Error('GET fails')); else f.pending[2].resolve(createdOption());
    await op;
    if (scenario === 'read-fails') {
      assert.equal(b.render().needsRead, true); const retry = b.render().submit(); await tick(); f.pending[3].resolve(createdOption()); await retry;
      assert.equal(f.writes.length, 1); assert.equal(b.navigation.length, 1);
    } else { assert.equal(b.navigation.length, 0); assert.equal(f.stores.useProposalAccountsStore.getState().optionSnapshotsByIndex[7], undefined); }
  }
});

test('stage 4 new builder rejects Bundle fixtures, unavailable/missing prices and forbidden parent before POST', async () => {
  for (const scenario of ['bundle', 'missing-price', 'unavailable-offer', 'permission', 'invalid-context']) {
    const f = await stage3ActionsFixture(); acceptOptionPosts(f); const b = newOptionBuilderFixture(f);
    if (scenario === 'bundle') f.builder.setState({ selectedBundles: [{ bundleId: 'bundle' }] });
    if (scenario === 'missing-price') f.builder.setState({ totalPriceReady: false });
    if (scenario === 'unavailable-offer') f.builder.setState({ selectedOfferIsAvailable: false });
    if (scenario === 'invalid-context') { b.setParams('mode=proposal-option-create&campaignId=A'); assert.equal(b.render().invalid, true); }
    const op = b.render().submit(b.payload()); await tick();
    if (scenario === 'permission') { const denied = stage3Proposal(); denied.selectedOption.canEdit = false; f.pending[1].resolve(denied); }
    await op; assert.equal(f.writes.length, 0);
    if (scenario !== 'permission') assert.equal(f.pending.length, 1);
  }
});

test('stage 4 active content route -> real builder submit -> POST/GET -> created option, with GET-only route recovery', async () => {
  const f = await stage3ActionsFixture(); acceptOptionPosts(f); hydrateFixture(f.builder);
  const harness = hookHarness(), navigation = []; const Page = () => {};
  const params = new URLSearchParams('mode=proposal-option-create&campaignId=A&sourceOption=0&currency=USD');
  const dependencies = {
    react: harness.hooks, 'react-router-dom': { useNavigate: () => (url) => navigation.push(url), useSearchParams: () => [params] },
    [builderModule]: { useCampaignBuilderStore: f.builder }, [builderModule + '.ts']: { useCampaignBuilderStore: f.builder },
    '@/entities/client-side/campaign/store/campaign.store': { useCampaignStore: (select) => select({ editable: null }) },
    '@/entities/client-side/campaign-creator-page/campaign-builder/model/draft-occurrences': occurrenceModel,
    '@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page.tsx': { CampaignPostContentPage: Page },
    '@/components': {}, '@/pages/client-side/campaign-post-content/model/build-proposal-accounts.ts': {},
    '@/api/client/campaign/campaign.api': f.api, '@/client-side/store': f.stores, 'react-toastify': { toast: { error() {}, success() {} } },
  };
  dependencies['../model/use-create-option-from-builder'] = load('src/pages/client-side/campaign-post-content/model/use-create-option-from-builder.ts', dependencies, { sessionStorage: { setItem() {} } });
  const { CampaignPostContentDefaultRoute: CampaignPostContentRoute } = load('src/pages/client-side/campaign-post-content/ui/campaign-post-content-route.tsx', dependencies);
  const render = () => harness.render(() => CampaignPostContentRoute()); render(); harness.flush();
  const page = elements(render()).find((n) => n.type === Page); assert.equal(page.props.submitLabel, 'Create option');
  page.props.onSubmitPayload({ campaignName: 'Proposal', addedAccounts: page.props.accounts.map((a) => ({ ...a, selectedCampaignContentItem: a.selectedCampaignContentItem })), campaignContent: f.builder.getState().campaignContent });
  await allowOptionCreate(f); assert.equal(navigation.length, 0); f.pending[2].reject(new Error('read unavailable')); await tick();
  const retry = elements(render()).find((n) => n.type === 'button' && n.props.children === 'Retry reading option'); assert.ok(retry);
  retry.props.onClick(); await tick(); f.pending[3].resolve(createdOption()); await tick();
  assert.equal(f.writes.length, 1); assert.deepEqual(navigation, ['/client/campaign']);
});

test('stage 4 creator Proceed preserves option context/currency and cannot route to initial Proposal create', () => {
  const store = builderFixture(); hydrateFixture(store); const harness = hookHarness(), navigation = [];
  const { useCampaignProceedSummary } = load('src/widgets/client-side/campaign-creator-page/build-campaign/model/use-campaign-proceed-summary.tsx', {
    react: harness.hooks, [builderModule]: { useCampaignBuilderStore: store }, [totalsModule]: totals,
    'react-router-dom': { useNavigate: () => (url) => navigation.push(url) },
    '@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params': { useBuildCampaignParams: () => ({ selectedCurrency: { key: '$', currency: 'USD' } }) },
  }, { window: { location: { search: '?mode=proposal-option-create&campaignId=A&sourceOption=2&currency=EUR' } } });
  const vm = harness.render(() => useCampaignProceedSummary({})); harness.flush(); vm.handleProceed();
  const url = new URL(navigation[0], 'https://fixture.test');
  assert.equal(url.pathname, '/client/create-campaign/content'); assert.equal(url.searchParams.get('campaignId'), 'A');
  assert.equal(url.searchParams.get('sourceOption'), '2'); assert.equal(url.searchParams.get('mode'), 'proposal-option-create'); assert.equal(url.searchParams.get('currency'), 'USD');
});

test('stage 4 builder direct entry detaches only its reader-owned patches into the original cache, never into the new body', async () => {
  const f = await sharedContentEditorsFixture(); acceptOptionPosts(f); const b = newOptionBuilderFixture(f);
  const updates = f.stores.useUpdateCampaign; updates.getState().setField(f.contentId, 'mainLink', 'https://editor-zero-unsaved.test');
  const newLink = f.builder.getState().campaignContent[0].mainLink;
  const op = b.render().submit(b.payload()); await allowOptionCreate(f);
  assert.equal(f.writes[0][2].campaignContent[0].mainLink, newLink);
  assert.equal(f.stores.useProposalAccountsStore.getState().contentByOption[0][0].mainLink, 'https://editor-zero-unsaved.test');
  assert.equal(f.stores.useProposalAccountsStore.getState().contentByOption[1][0].mainLink, 'https://option-one-B.test');
  assert.deepEqual(updates.getState().patches, {});
  f.pending[2].resolve(createdOption()); await op; assert.equal(b.navigation.length, 1);
});

test('stage 4 explicit second creation is possible after a synchronized first creation, never from an old repeat click', async () => {
  const f = await stage3ActionsFixture(); acceptOptionPosts(f);
  const op = f.render().onAddOption(true); await allowOptionCreate(f); f.pending[2].resolve(createdOption()); assert.equal(await op, true);
  const repeat = f.render().onAddOption(true); assert.equal(await repeat, false); assert.equal(f.pending.length, 3); assert.equal(f.writes.length, 1);
  assert.equal(f.render().beginOptionCreate(), true); acceptOptionPosts(f, { campaignId: 'A', optionIndex: 8 });
  const second = f.render().onAddOption(true); await allowOptionCreate(f, 3, createdOption()); assert.equal(f.writes.length, 2);
  const fresh = createdOption(8); fresh.existingOptions.push(7); f.pending[4].resolve(fresh); assert.equal(await second, true); assert.equal(f.active, 8);
});

test('stage 4 new option retains zero price and null/absent variant semantics, without changing valid second refs', async () => {
  const f = await stage3ActionsFixture(); acceptOptionPosts(f);
  const snapshot = f.stores.useProposalAccountsStore.getState().optionSnapshotsByIndex[0]; snapshot.price = 0;
  snapshot.addedAccounts[0].selectedCampaignContentItem.descriptionId = snapshot.campaignContent[0].descriptions[1]._id;
  snapshot.addedAccounts[0].selectedCampaignContentItem.additionalBriefId = null;
  delete snapshot.addedAccounts[1].selectedCampaignContentItem.additionalBriefId;
  f.stores.useProposalAccountsStore.getState().initOption(0, snapshot.addedAccounts, snapshot.campaignContent, { force: true, snapshot });
  const create = f.render().onAddOption(true); await allowOptionCreate(f);
  const body = f.writes[0][2]; assert.equal(body.campaignPrice, 0);
  assert.equal(body.addedAccounts[0].selectedCampaignContentItem.descriptionId, snapshot.campaignContent[0].descriptions[1]._id);
  assert.equal(body.addedAccounts[0].selectedCampaignContentItem.additionalBriefId, null);
  assert.equal(body.addedAccounts[1].selectedCampaignContentItem.additionalBriefId, snapshot.campaignContent[0].additionalBrief[0]._id, 'existing canonical absent-field behavior is retained');
  f.pending[2].resolve(createdOption()); assert.equal(await create, true);
});

test('stage 4 dirty No uses the same explicit Cancel/Leave/Save decision before navigating to a fresh builder', async () => {
  for (const choice of ['cancel', 'leave', 'save', 'save-fails']) {
    const f = await stage3ActionsFixture(); const id = f.initial.selectedOption.campaignContent[0]._id;
    f.stores.useUpdateCampaign.getState().setField(id, 'mainLink', 'https://dirty-before-new.test');
    addReviewOption(f, 1, true); const page = stage3PageFixture(f);
    await page.modal().onAddOptionNo(); assert.equal(page.modal().isDirtySwitchModalOpen, true); assert.equal(f.navigation.length, 0);
    if (choice === 'cancel') { page.modal().onCloseDirtySwitchModal(); assert.ok(f.stores.useUpdateCampaign.getState().patches[id]); continue; }
    if (choice === 'save-fails') {
      f.api.patchAddProposalOption = async () => { throw new Error('PATCH denied'); }; await page.modal().onSaveDirtySwitch();
      assert.equal(f.navigation.length, 0); assert.ok(f.stores.useUpdateCampaign.getState().patches[id]); continue;
    }
    const op = choice === 'leave' ? page.modal().onDiscardDirtySwitch() : page.modal().onSaveDirtySwitch(); await tick();
    if (choice === 'save') { assert.equal(f.writes[0][0], 'patch'); assert.equal(f.navigation.length, 0); f.pending[1].resolve(reviewWriteGet(f, 0)); }
    await op; assert.equal(f.navigation.length, 1); assert.equal(f.writes.filter(([kind]) => kind === 'post').length, 0);
    assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[1][0].dateRequest, 'unsaved-option-1');
  }
});

// Stage 5: real Add Influencer entry, session/content handlers and Proposal Save. Synthetic contract fixtures only.
const addBuilderModule = '@/entities/client-side/campaign-creator-page/campaign-builder/model/proposal-add-influencer-builder';
const addBuilders = load('src/entities/client-side/campaign-creator-page/campaign-builder/model/proposal-add-influencer-builder.ts', { './selected-offer': offerHelpers });
function stage5SessionFixture(f, { query, search = async () => [], offers = async () => [] } = {}) {
  const harness = hookHarness(), navigation = [], session = [], errors = [];
  let params = new URLSearchParams(query ?? new URL(f.navigation.at(-1) ?? '/?mode=add-influencer&campaignId=A&option=0&session=test-session&currency=USD', 'https://fixture.test').search);
  const dependencies = { react: harness.hooks, 'react-router-dom': { useNavigate: () => (url) => navigation.push(url), useSearchParams: () => [params] },
    '@/api/client/campaign/campaign.api': f.api, '@/client-side/store': f.stores, [builderModule]: { useCampaignBuilderStore: f.builder },
    '@/entities/client-side/campaign-creator-page/offer/api/offer.api': { getPublishedOffers: offers },
    '@/entities/client-side/campaign-creator-page/campaign-promo-account/api/promo-account.api': { searchPromoAccounts: search },
    'react-toastify': { toast: { error: (m) => errors.push(m) } }, [addBuilderModule]: addBuilders };
  const module = load('src/pages/client-side/campaign-post-content/model/use-proposal-add-influencer.ts', dependencies,
    { sessionStorage: { setItem: (key, value) => session.push([key, JSON.parse(value)]) } });
  const render = () => harness.render(() => module.useProposalAddInfluencer(params)); render(); harness.flush();
  return { harness, dependencies, module, render, navigation, session, errors, get params() { return params; }, setParams: (q) => { params = new URLSearchParams(q); } };
}
async function prepareStage5(f, options) {
  const s = stage5SessionFixture(f, options); await tick();
  f.pending.at(-1).resolve(f.initial); await tick(); s.render(); s.harness.flush(); return s;
}
function stage5NewAccount(id = 'new', socialMedia = 'instagram', overrides = {}) {
  return account(id, { influencerId: 'new-influencer', socialMedia, username: 'new-' + id, profileType: 'community', prices: { EUR: 20, USD: 22, GBP: 18 }, ...overrides });
}
const contentRouteUI = { Container() {}, Breadcrumbs() {}, Loader() {} };
function stage5ContentPage(f, s) {
  s.harness.unmount();
  const c = stage5SessionFixture(f, { query: s.params.toString() });
  const Page = () => {};
  const { ProposalAddInfluencerContentRoute } = load('src/pages/client-side/campaign-post-content/ui/proposal-add-influencer-content-route.tsx', {
    ...c.dependencies, '@/components': contentRouteUI, '@/shared/ui': { ButtonSecondary() {} }, '../model/use-proposal-add-influencer': c.module,
    '@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page': { CampaignPostContentPage: Page },
  });
  const render = () => c.harness.render(() => ProposalAddInfluencerContentRoute());
  return { ...c, render, page: () => elements(render()).find((n) => n.type === Page)?.props };
}
function patchGetWithNewIds(f) {
  const fresh = reviewWriteGet(f, 0); fresh.selectedOption.addedAccounts.forEach((a, i) => { if (!a.addedAccountsId) a.addedAccountsId = (950 + i).toString(16).padStart(24, '0'); });
  const body = f.writes.at(-1)[3];
  if (Object.hasOwn(body, 'selectedOffer')) fresh.selectedOption.selectedOffer = body.selectedOffer ? { ...body.selectedOffer, selectedAddedAccountsIds: fresh.selectedOption.addedAccounts.filter((a) => body.selectedOffer.selectedAccountIds.includes(a.socialAccountId)).map((a) => a.addedAccountsId) } : null;
  fresh.selectedOption.price = 777;
  return fresh;
}

test('stage 5 entry -> warm preparation preserves dirty workflow/topology, scoped patches, full Offer and source currency', async () => {
  for (const withOffer of [false, true]) for (const currency of ['EUR', 'USD', 'GBP']) {
    const f = await stage3ActionsFixture({ withOffer }); addReviewOption(f, 1, true); const store = f.stores.useProposalAccountsStore;
    const source = store.getState().optionSnapshotsByIndex[0]; source.displayCurrency = currency;
    const id = source.campaignContent[0]._id, row = source.addedAccounts[2];
    store.getState().setAccountDateRequest(0, row.addedAccountsId, 'unsaved-source-date');
    store.getState().setAccountSelectedContent(0, row.addedAccountsId, { ...row.selectedCampaignContentItem, descriptionId: source.campaignContent[0].descriptions[1]._id });
    f.stores.useUpdateCampaign.getState().setField(id, 'mainLink', 'https://source-dirty.test');
    assert.equal(f.render().onAddInfluencer(0), true); assert.equal(f.render().onAddInfluencer(0), false); assert.equal(f.navigation.length, 1);
    const s = await prepareStage5(f); assert.equal(s.render().ready, true); assert.equal(f.writes.length, 0);
    const b = f.builder.getState(); assert.equal(offerHelpers.currencyCode(b.selectedCurrency), currency);
    assert.equal(b.selectedAccounts.length, 3); assert.equal(b.campaignContent[0].mainLink, 'https://source-dirty.test');
    const existing = b.selectedAccounts.find((a) => a.addedAccountsId === row.addedAccountsId);
    assert.equal(existing.dateRequest, 'unsaved-source-date'); assert.equal(existing.selectedCampaignContentItem.descriptionId, source.campaignContent[0].descriptions[1]._id);
    assert.notEqual(existing.selectionId, existing.addedAccountsId); assert.equal(b.selectedOfferId, withOffer ? source.selectedOffer.offerId : null);
    if (withOffer) assert.deepEqual(b.selectedOfferAccountIds, source.selectedOffer.selectedAccountIds);
    assert.equal(store.getState().optionSnapshotsByIndex[0].campaignContent[0].mainLink, source.campaignContent[0].mainLink);
    assert.equal(store.getState().accountsByOption[1][0].dateRequest, 'unsaved-option-1'); assert.deepEqual(f.stores.useUpdateCampaign.getState().patches, {});
  }
});

test('stage 5 standalone local return -> real Save PATCH/GET preserves old IDs and accepts authoritative new IDs/total; read recovery never repeats PATCH', async () => {
  for (const failRead of [false, true]) {
    const f = await stage3ActionsFixture(); const store = f.stores.useProposalAccountsStore; addReviewOption(f, 1, true);
    f.render().onAddInfluencer(0); const s = await prepareStage5(f);
    f.builder.getState().actions.togglePromoCard(stage5NewAccount());
    const baseline = store.getState().optionSnapshotsByIndex[0]; assert.equal(s.render().plan.missingGroups.length, 0);
    assert.equal(s.render().finish(), true); assert.equal(s.render().finish(), false); assert.equal(s.navigation.length, 1); assert.equal(f.writes.length, 0);
    assert.equal(store.getState().optionSnapshotsByIndex[0], baseline);
    const added = store.getState().accountsByOption[0].at(-1); assert.equal(added.addedAccountsId, undefined); assert.equal(added.socialAccountId, 'new');
    assert.ok(added.selectedCampaignContentItem.campaignContentItemId); assert.equal(store.getState().accountsByOption[0][0].addedAccountsId, baseline.addedAccounts[0].addedAccountsId);
    const save = f.render().updateProposalOption(); await tick(); assert.equal(f.writes.length, 1); const body = f.writes[0][3];
    assert.equal(body.addedAccounts.length, 4); assert.equal(Object.hasOwn(body, 'selectedOffer'), false); assert.equal(Object.hasOwn(body, 'campaignPrice'), false);
    assert.equal(Object.hasOwn(body.addedAccounts.at(-1), 'addedAccountsId'), false); assert.equal(Object.hasOwn(body.addedAccounts.at(-1), 'selectionId'), false); assert.equal(Object.hasOwn(body.addedAccounts.at(-1), 'isNewProposalPlacement'), false);
    const fresh = patchGetWithNewIds(f);
    if (failRead) {
      f.pending.at(-1).reject(new Error('GET unavailable')); assert.equal(await save, false); assert.equal(f.render().needsProposalRead, true);
      const retry = f.render().retryProposalRead(); await tick(); f.pending.at(-1).resolve(fresh); assert.equal(await retry, true); assert.equal(f.writes.length, 1);
    } else { f.pending.at(-1).resolve(fresh); assert.equal(await save, true); }
    assert.equal(store.getState().optionSnapshotsByIndex[0].price, 777); assert.ok(store.getState().accountsByOption[0].at(-1).addedAccountsId);
    assert.equal(store.getState().accountsByOption[1][0].dateRequest, 'unsaved-option-1');
  }
});

test('stage 5 manual -> Offer retains lifecycle/date/second refs, consumes manual price once, changing/removing Offer is explicit', async () => {
  const f = await stage3ActionsFixture({ withOffer: false }); const store = f.stores.useProposalAccountsStore; const source = store.getState().optionSnapshotsByIndex[0];
  const old = source.addedAccounts[0]; store.getState().setAccountDateRequest(0, old.addedAccountsId, 'kept-date');
  store.getState().setAccountSelectedContent(0, old.addedAccountsId, { ...old.selectedCampaignContentItem, descriptionId: source.campaignContent[0].descriptions[1]._id });
  f.render().onAddInfluencer(0); const s = await prepareStage5(f); const b = f.builder;
  const a = b.getState().selectedAccounts[0];
  b.getState().actions.selectOffer({ offerId: 'replacement', accountIds: [a.accountId, 'new'], accounts: [a, stage5NewAccount()], offerName: 'Replacement', offerPrices: { EUR: 70, USD: 77, GBP: 63 }, catalogContext: { platform: 'instagram', genre: 'techno' } });
  const retained = b.getState().selectedAccounts.find((r) => r.accountId === a.accountId);
  assert.equal(retained.addedAccountsId, old.addedAccountsId); assert.equal(retained.dateRequest, 'kept-date'); assert.equal(retained.selectedCampaignContentItem.descriptionId, source.campaignContent[0].descriptions[1]._id);
  assert.equal(b.getState().selectedPromoCardIds.includes(a.accountId), false);
  const standaloneSum = b.getState().selectedAccounts.filter((r) => r.source === 'manual').reduce((sum, r) => sum + r.prices.USD, 0);
  assert.equal(b.getState().totalPrice, 77 + standaloneSum);
  assert.equal(s.render().finish(), true); assert.deepEqual(store.getState().selectedOfferChangeByOption[0], { offerId: 'replacement', selectedAccountIds: [a.accountId, 'new'] });
  assert.equal(store.getState().offerPreviewByOption[0].prices.USD, 77);
  // A new session must use this working replacement and metadata, not the old snapshot Offer.
  const s2 = await prepareStage5(f, { query: 'mode=add-influencer&campaignId=A&option=0&session=second-entry&currency=USD' }); assert.equal(s2.render().ready, true);
  assert.equal(b.getState().selectedOfferId, 'replacement'); assert.equal(b.getState().selectedOfferPrice, 77);
  b.getState().actions.selectOffer({ offerId: null }); assert.ok(!b.getState().selectedAccounts.some((r) => r.accountId === a.accountId));
  assert.equal(s2.render().finish(), true); assert.equal(store.getState().selectedOfferChangeByOption[0], null);
});

test('stage 5 existing explicit Offer null and replacement survive entry without restoring saved membership', async () => {
  const f = await stage3ActionsFixture(); const st = f.stores.useProposalAccountsStore;
  st.getState().removeAccount(0, f.initial.selectedOption.addedAccounts[0].addedAccountsId);
  assert.equal(st.getState().selectedOfferChangeByOption[0], null); f.render().onAddInfluencer(0); const s = await prepareStage5(f);
  assert.equal(f.builder.getState().selectedOfferId, null); assert.equal(f.builder.getState().selectedAccounts.length, 1);
  assert.equal(s.render().finish(), true); assert.equal(st.getState().selectedOfferChangeByOption[0], null);
});

test('stage 5 missing content uses actual content route; second variants, object briefs and removed stale form rows stay isolated', async () => {
  const f = await sharedContentEditorsFixture(); const st = f.stores.useProposalAccountsStore;
  const original = st.getState().accountsByOption[0][0], content = st.getState().contentByOption[0][0];
  st.getState().setAccountSelectedContent(0, original.addedAccountsId, { ...original.selectedCampaignContentItem, descriptionId: content.descriptions[1]._id, additionalBriefId: null });
  f.render().onAddInfluencer(0); const s = await prepareStage5(f); f.builder.getState().actions.togglePromoCard(stage5NewAccount('music', 'spotify'));
  assert.deepEqual(s.render().plan.missingGroups, ['music']);
  const c = stage5ContentPage(f, s); c.render(); c.harness.flush(); const props = c.page(); assert.equal(props.accounts.length, 1); assert.equal(props.accounts[0].socialAccountId, 'music');
  const item = { _id: '000000000000000000000991', socialMedia: 'spotify', socialMediaGroup: 'music', profileType: 'community', mainLink: 'https://new-music.test', taggedUser: '', taggedLink: '', descriptions: [{ _id: '000000000000000000000992', description: 'first' }, { _id: '000000000000000000000993', description: 'second' }], additionalBrief: [{ _id: '000000000000000000000994', additionalBrief: 'brief one' }, { _id: '000000000000000000000995', additionalBrief: 'brief two' }] };
  const payload = { campaignContent: [item], addedAccounts: [{ selectionId: props.accounts[0].selectionId, socialAccountId: 'music', selectedCampaignContentItem: { campaignContentItemId: item._id, descriptionId: item.descriptions[1]._id, additionalBriefId: item.additionalBrief[1]._id } }] };
  props.onSubmitPayload(payload); props.onSubmitPayload(payload); assert.equal(c.navigation.length, 1); assert.equal(f.writes.length, 0);
  assert.equal(st.getState().accountsByOption[0].length, 4); assert.equal(st.getState().contentByOption[0].length, 2);
  assert.equal(st.getState().accountsByOption[0].at(-1).selectedContent.additionalBriefId, item.additionalBrief[1]._id);
  assert.equal(st.getState().accountsByOption[0][0].selectedContent.descriptionId, content.descriptions[1]._id); assert.equal(st.getState().accountsByOption[0][0].selectedContent.additionalBriefId, null);
  assert.equal(st.getState().contentByOption[1][0].mainLink, 'https://option-one-B.test');
  const save = f.render().updateProposalOption(); await tick(); assert.equal(f.writes[0][3].campaignContent[1].profileType, 'community');
  assert.deepEqual(f.writes[0][3].campaignContent[1].additionalBrief, item.additionalBrief);
  f.pending.at(-1).resolve(patchGetWithNewIds(f)); assert.equal(await save, true);
});

test('stage 5 Back/Cancel and reentry do not partially apply abandoned builder composition or content', async () => {
  const f = await stage3ActionsFixture(); f.render().onAddInfluencer(0); const s = await prepareStage5(f);
  const before = f.stores.useProposalAccountsStore.getState().accountsByOption[0]; f.builder.getState().actions.togglePromoCard(stage5NewAccount('music', 'spotify'));
  const c = stage5ContentPage(f, s); c.render(); c.harness.flush(); c.page(); f.builder.setState({totalPriceReady:false});
  const back = elements(c.render()).find((n) => (n.props.text ?? n.props.children) === 'Back to selection'); back.props.onClick();
  assert.ok(c.navigation.at(-1).includes('session=')); assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[0], before);
  const cancel = elements(c.render()).find((n) => (n.props.text ?? n.props.children) === 'Cancel and return to option'); cancel.props.onClick();
  assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[0], before); assert.equal(f.builder.getState().proposalAddSession, null); assert.equal(f.writes.length, 0);
  const next = await prepareStage5(f, { query: 'mode=add-influencer&campaignId=A&option=0&session=new-session&currency=USD' });
  assert.equal(next.render().ready, true); assert.equal(f.builder.getState().selectedAccounts.some((a) => a.accountId === 'music'), false);
});

test('stage 5 cold URL loads the exact source and ignores persisted/foreign builder; bad identity/permission never mutates', async () => {
  for (const kind of ['cold', 'wrong-index', 'permission', 'invalid', 'foreign-cache']) {
    const f = await stage3ActionsFixture(); const oldBuilder = f.builder.getState().selectedAccounts;
    if (kind !== 'foreign-cache') f.stores.useProposalAccountsStore.getState().clearAll();
    const index = kind === 'invalid' ? '-1' : '2';
    const s = stage5SessionFixture(f, { query: `mode=add-influencer&campaignId=${kind === 'foreign-cache' ? 'B' : 'A'}&option=${index}&session=cold-session&currency=GBP` }); await tick();
    if (kind === 'invalid' || kind === 'foreign-cache') { assert.ok(s.render().error); assert.equal(f.pending.length, 1); assert.equal(f.builder.getState().selectedAccounts, oldBuilder); continue; }
    const parent = stage3Proposal('A', kind === 'wrong-index' ? 1 : 2); parent.selectedOption.displayCurrency = 'GBP';
    if (kind === 'permission') parent.selectedOption.canEdit = false;
    assert.equal(f.pending.at(-1).option, 2); f.pending.at(-1).resolve(parent); await tick();
    const vm = s.render(); s.harness.flush();
    if (kind === 'cold') { assert.equal(vm.ready, true); assert.equal(f.builder.getState().proposalAddSession.optionIndex, 2); assert.equal(offerHelpers.currencyCode(f.builder.getState().selectedCurrency), 'GBP'); }
    else { assert.ok(vm.error); assert.equal(f.builder.getState().selectedAccounts, oldBuilder); }
    assert.equal(f.writes.length, 0);
  }
});

test('stage 5 metadata responses never replace newer source state or foreign sessions; unmount prevents hydration/navigation', async () => {
  for (const mode of ['working-change', 'campaign', 'session', 'unmount']) {
    const f = await stage3ActionsFixture({ withOffer: false }); const st = f.stores.useProposalAccountsStore;
    st.getState().accountsByOption[0][0].prices = {}; let release;
    const s = stage5SessionFixture(f, { search: async () => new Promise((r) => release = r) }); await tick(); f.pending[1].resolve(f.initial); await tick();
    assert.ok(release);
    if (mode === 'working-change') st.getState().setAccountDateRequest(0, st.getState().accountsByOption[0][0].addedAccountsId, 'newer-source-date');
    if (mode === 'campaign') { const read = f.fetch.getState().setProposalOption('B', 1); f.pending.at(-1).resolve(stage3Proposal('B', 1)); await read; }
    if (mode === 'session') { s.setParams('mode=add-influencer&campaignId=A&option=1&session=new-context&currency=USD'); s.render(); }
    if (mode === 'unmount') s.harness.unmount();
    const before = f.builder.getState().selectedAccounts; release([]); await tick();
    assert.equal(f.builder.getState().selectedAccounts, before); assert.equal(s.navigation.length, 0); assert.equal(f.writes.length, 0);
    if (mode === 'working-change') assert.equal(st.getState().accountsByOption[0][0].dateRequest, 'newer-source-date');
  }
});

test('stage 5 Bundle, duplicate placements, unresolved patches and damaged lifecycle joins fail closed without data loss', async () => {
  for (const scenario of ['bundle', 'duplicate', 'patches', 'bad-id']) {
    const f = await stage3ActionsFixture(); const st = f.stores.useProposalAccountsStore;
    if (scenario === 'bundle') st.getState().optionSnapshotsByIndex[0].addedBundles = [{ bundleId: 'bundle' }];
    if (scenario === 'duplicate') st.getState().setAccounts(0, [...st.getState().accountsByOption[0], { ...st.getState().accountsByOption[0][0], addedAccountsId: 'separate-lifecycle-id' }]);
    if (scenario === 'patches') f.stores.useUpdateCampaign.getState().setField('foreign-content', 'mainLink', 'https://foreign.test');
    if (scenario !== 'bad-id') { const before = st.getState().accountsByOption[0]; assert.equal(f.render().onAddInfluencer(0), false); assert.equal(f.navigation.length, 0); assert.equal(st.getState().accountsByOption[0], before); continue; }
    f.render().onAddInfluencer(0); const s = await prepareStage5(f);
    const row = f.builder.getState().selectedAccounts[0]; f.builder.getState().actions.setSelectedAccounts(f.builder.getState().selectedAccounts.map((a) => a === row ? { ...a, addedAccountsId: undefined } : a));
    const before = st.getState().accountsByOption[0]; assert.equal(s.render().finish(), false); assert.equal(st.getState().accountsByOption[0], before); assert.equal(f.writes.length, 0);
  }
});

test('stage 5 zero/missing currency keys and ordinary PATCH refusal preserve ready guards and working edits', async () => {
  for (const currency of ['EUR', 'USD', 'GBP']) for (const price of [0, undefined]) {
    const f = await stage3ActionsFixture({ withOffer: false }); const st = f.stores.useProposalAccountsStore;
    st.getState().optionSnapshotsByIndex[0].displayCurrency = currency;
    st.getState().accountsByOption[0].forEach((a) => { a.prices = price === undefined ? {} : { EUR: 0, USD: 0, GBP: 0 }; });
    f.render().onAddInfluencer(0); const s = await prepareStage5(f); assert.equal(s.render().ready, true);
    assert.equal(f.builder.getState().totalPriceReady, price === 0);
    const before = st.getState().accountsByOption[0];
    assert.equal(s.render().finish(), price === 0); if (price === undefined) assert.equal(st.getState().accountsByOption[0], before);
    if (price === 0) {
      f.api.patchAddProposalOption = async () => { throw { response: { status: 400 } }; };
      const pending = st.getState().accountsByOption[0]; assert.equal(await f.render().updateProposalOption(), false); assert.equal(st.getState().accountsByOption[0], pending);
    }
    assert.equal(f.writes.length, 0);
  }
});

test('stage 5 stale content payload ignores removed rows and their orphan blocks; same account reselect is an explicit new placement', async () => {
  const f = await stage3ActionsFixture(); f.render().onAddInfluencer(0); const s = await prepareStage5(f); const b = f.builder;
  b.getState().actions.togglePromoCard(stage5NewAccount('removed', 'spotify')); const removed = b.getState().selectedAccounts.at(-1);
  b.getState().actions.togglePromoCard(stage5NewAccount('removed', 'spotify'));
  const item = { _id: 'orphan-content', socialMedia: 'spotify', socialMediaGroup: 'music', descriptions: [{ _id: 'orphan-description', description: 'orphan' }], additionalBrief: [] };
  assert.equal(s.render().finish({ campaignContent: [item], addedAccounts: [{ selectionId: removed.selectionId, socialAccountId: 'removed', selectedCampaignContentItem: { campaignContentItemId: item._id, descriptionId: 'orphan-description' } }] }), true);
  assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[0].length, 3); assert.equal(f.stores.useProposalAccountsStore.getState().contentByOption[0].length, 1);
  const next = await prepareStage5(f, { query: 'mode=add-influencer&campaignId=A&option=0&session=reselect&currency=USD' });
  const old = b.getState().selectedAccounts[0]; b.getState().actions.selectOffer({ offerId: null });
  b.getState().actions.togglePromoCard({ ...stage5NewAccount(old.accountId), influencerId: old.influencerId });
  assert.equal(next.render().finish(), true); const newPlacement = f.stores.useProposalAccountsStore.getState().accountsByOption[0].find((a) => a.socialAccountId === old.accountId);
  assert.equal(newPlacement.addedAccountsId, undefined); assert.equal(newPlacement.isNewProposalPlacement, true);
});

test('stage 5 actual table entry carries campaign/option/currency and delegates owner guards; pending/canEdit block entry', async () => {
  const f = await stage3ActionsFixture(), harness = hookHarness(); const Link = () => {}; let pending = false;
  const { TableProposal } = load('src/client-side/widgets/campaign/tables/table-proposal.tsx', {
    react: { ...harness.hooks, useContext: () => ({ onAddInfluencer: f.render().onAddInfluencer, isMutationPending: pending }) },
    'react-router-dom': { Link }, '@/client-side/pages/campaign/model/proposal-actions-context': { ProposalActionsContext: {} },
    '@/client-side/store': f.stores, '../card-table/table-card-proposal': { TableCard: () => {} },
    '@/client-side/data/table-campaign.data': { getTableColumnWidths: () => ({}), getTitle: () => 'Network' },
    '@/client-side/hooks': { useFollowersSort: (rows) => ({ sortedNetworks: rows, toggleFollowersSort() {} }) },
    '@/client-side/utils': { getAccountKey: (r) => r.addedAccountsId, getColumns: () => ['network'] },
  });
  const render = (canEdit = true) => harness.render(() => TableProposal({ items: f.initial.selectedOption.campaignContent, networks: f.initial.selectedOption.addedAccounts, totalPrice: 124, changeView: false, group: 'main', canEdit, optionIndex: 0, title: 'Proposal' }));
  assert.equal(elements(render(false)).some((n) => n.type === Link), false);
  pending = true; let link = elements(render()).find((n) => n.type === Link); link.props.onClick({ preventDefault() {} }); assert.equal(f.navigation.length, 0);
  pending = false; link = elements(render()).find((n) => n.type === Link); const url = new URL(link.props.to, 'https://fixture.test');
  assert.equal(url.searchParams.get('campaignId'), 'A'); assert.equal(url.searchParams.get('option'), '0'); assert.equal(url.searchParams.get('currency'), 'USD');
  link.props.onClick({ preventDefault() {} }); assert.equal(f.navigation.length, 1);
});

test('stage 5 real creator Proceed preserves session and Offer pricing in the source currency despite a foreign currency query', async () => {
  const f = await stage3ActionsFixture(); f.render().onAddInfluencer(0); await prepareStage5(f);
  const harness = hookHarness(), nav = [];
  const { useCampaignProceedSummary } = load('src/widgets/client-side/campaign-creator-page/build-campaign/model/use-campaign-proceed-summary.tsx', {
    react: harness.hooks, 'react-router-dom': { useNavigate: () => (url) => nav.push(url) }, [builderModule]: { useCampaignBuilderStore: f.builder }, [totalsModule]: totals,
    '@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params': { useBuildCampaignParams: () => ({ selectedCurrency: { key: '£', currency: 'GBP' } }) },
  });
  const vm = harness.render(() => useCampaignProceedSummary({ mode: 'add-influencer', optionIndex: 0 })); harness.flush();
  assert.equal(vm.totalPrice, 124); assert.equal(vm.selectedCurrency.currency, 'USD'); assert.equal(vm.canProceed, true); vm.handleProceed();
  const url = new URL(nav[0], 'https://fixture.test'); assert.equal(url.pathname, '/client/create-campaign/content'); assert.equal(url.searchParams.get('campaignId'), 'A');
  assert.equal(url.searchParams.get('session'), f.builder.getState().proposalAddSession.sessionId); assert.equal(url.searchParams.get('currency'), 'USD');
});

test('stage 5 content route skips content UI only when all new placements can reuse compatible content, and applies once', async () => {
  const f = await stage3ActionsFixture(); f.render().onAddInfluencer(0); const s = await prepareStage5(f);
  f.builder.getState().actions.togglePromoCard(stage5NewAccount()); const c = stage5ContentPage(f, s);
  c.render(); c.harness.flush(); c.render(); c.harness.flush(); c.render(); c.harness.flush();
  assert.equal(c.page(), undefined); assert.equal(c.navigation.length, 1); assert.equal(f.writes.length, 0);
  assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[0].length, 4);
  assert.equal(f.stores.useProposalAccountsStore.getState().contentByOption[0].length, 1);
});

test('stage 5 current profile type determines new content need; old second selections and canonical nullable refs survive untouched', async () => {
  const f = await stage3ActionsFixture(); const source = f.stores.useProposalAccountsStore.getState().accountsByOption[0][0];
  const ref = { ...source.selectedCampaignContentItem, descriptionId: null }; delete ref.additionalBriefId;
  f.stores.useProposalAccountsStore.getState().setAccountSelectedContent(0, source.addedAccountsId, ref);
  f.render().onAddInfluencer(0); const s = await prepareStage5(f);
  f.builder.getState().actions.togglePromoCard(stage5NewAccount('creator', 'instagram', { profileType: 'creator' }));
  assert.deepEqual(s.render().plan.missingGroups, ['main'], 'community content must not be assigned to a creator by first-match fallback');
  assert.deepEqual(f.builder.getState().selectedAccounts[0].selectedCampaignContentItem, ref);
  assert.equal(s.render().finish(), false); assert.equal(f.writes.length, 0);
});

test('stage 5 changed/deleted catalogue Offer preserves saved membership, remains unavailable, and can be explicitly removed', async () => {
  const f = await stage3ActionsFixture(); const st = f.stores.useProposalAccountsStore, saved = st.getState().optionSnapshotsByIndex[0].selectedOffer;
  delete saved.prices; saved.currency = 'EUR'; saved.clientPrice = 90; saved.socialMedia = 'instagram'; saved.genre = 'techno';
  f.render().onAddInfluencer(0); const s = await prepareStage5(f, { offers: async () => [{ id: saved.offerId, prices: { EUR: 90, USD: 97, GBP: 83 }, connectedAccounts: [{ accountId: 'catalogue-replaced-member' }] }] });
  assert.equal(s.render().ready, true); assert.deepEqual(f.builder.getState().selectedOfferAccountIds, saved.selectedAccountIds);
  assert.equal(f.builder.getState().selectedOfferIsAvailable, false); assert.equal(s.render().finish(), false); assert.equal(f.writes.length, 0);
  f.builder.getState().actions.selectOffer({ offerId: null }); assert.equal(s.render().finish(), true); assert.equal(st.getState().selectedOfferChangeByOption[0], null);
});

test('stage 5 completion refuses a newer source reader or patches, keeps all data and never patches on return', async () => {
  for (const mode of ['reader', 'patches']) {
    const f = await stage3ActionsFixture(); f.render().onAddInfluencer(0); const s = await prepareStage5(f);
    f.builder.getState().actions.togglePromoCard(stage5NewAccount()); const before = f.stores.useProposalAccountsStore.getState().accountsByOption[0];
    if (mode === 'reader') { const read = f.fetch.getState().setProposalOption('A', 0); f.pending.at(-1).resolve(f.initial); await read; }
    else f.stores.useUpdateCampaign.getState().setField(f.initial.selectedOption.campaignContent[0]._id, 'mainLink', 'https://late-editor.test');
    assert.equal(s.render().finish(), false); assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[0], before); assert.equal(f.writes.length, 0); assert.equal(s.navigation.length, 0);
  }
});

test('stage 5 cold context without session is canonicalized once; same-session continuation preserves builder edits without another GET', async () => {
  const f = await stage3ActionsFixture(); const s = stage5SessionFixture(f, { query: 'mode=add-influencer&campaignId=A&option=0&currency=GBP' });
  await tick(); f.pending[1].resolve(f.initial); await tick(); s.render(); s.harness.flush();
  const url = new URL(s.navigation.at(-1), 'https://fixture.test'); assert.equal(url.searchParams.get('currency'), 'USD'); assert.ok(url.searchParams.get('session'));
  s.setParams(url.search); s.render(); s.harness.flush(); await tick(); assert.equal(s.render().ready, true);
  f.builder.getState().actions.togglePromoCard(stage5NewAccount());
  const resumed = stage5SessionFixture(f, { query: url.search }); resumed.render(); resumed.harness.flush();
  assert.equal(resumed.render().ready, true); assert.ok(f.builder.getState().selectedAccounts.some((r) => r.accountId === 'new')); assert.equal(f.pending.length, 2);
});

test('stage 5 active route dispatches Add Influencer away from the old alternate store path', () => {
  const target = () => {}, harness = hookHarness();
  const { CampaignPostContentRoute } = load('src/pages/client-side/campaign-post-content/ui/campaign-post-content-route.tsx', {
    react: harness.hooks, 'react-router-dom': { useSearchParams: () => [new URLSearchParams('mode=add-influencer&campaignId=A&option=0&session=s')], useNavigate() {} },
    './proposal-add-influencer-content-route': { ProposalAddInfluencerContentRoute: target },
    '@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page.tsx': {}, [builderModule + '.ts']: {}, '@/components': {},
  });
  assert.equal(harness.render(() => CampaignPostContentRoute()).type, target);
});

test('stage 5 real content editor callbacks cannot overwrite a new session or mutate after unmount', async () => {
  for (const mode of ['session', 'unmount']) {
    const f = await stage3ActionsFixture(); f.render().onAddInfluencer(0); await prepareStage5(f);
    const form = realContentFormFixture(f.builder, f.builder.getState().campaignContent, 'add-influencer'); const oldSubmit = form.vm.buildPayload;
    if (mode === 'unmount') form.harness.unmount();
    else f.builder.setState({ proposalAddSession: { ...f.builder.getState().proposalAddSession, sessionId: 'different-session' } });
    const before = f.builder.getState().campaignContent;
    assert.throws(() => oldSubmit(), /no longer owns/); form.form.setValue('campaignName', 'late form name');
    assert.equal(f.builder.getState().campaignContent, before); assert.notEqual(f.builder.getState().campaignName, 'late form name');
  }
});

test('stage 5 working Offer preview follows surviving option reindex and authoritative refresh clears only its own preview', async () => {
  const f = await stage3ActionsFixture(); addReviewOption(f, 1); addReviewOption(f, 2); const st = f.stores.useProposalAccountsStore;
  st.setState({ offerPreviewByOption: { 0: { offerId: 'zero-preview' }, 2: { offerId: 'surviving-preview' } } });
  const op = f.render().onDeleteOption(1); await tick(); const fresh = stage3Proposal(); fresh.existingOptions = [0, 1]; f.pending[1].resolve(fresh); assert.equal(await op, true);
  assert.equal(st.getState().offerPreviewByOption[1].offerId, 'surviving-preview'); assert.equal(st.getState().offerPreviewByOption[2], undefined);
  assert.equal(st.getState().offerPreviewByOption[0], undefined);
});

test('stage 5 stale hidden form rows cannot change existing references or add orphan content, and late Cancel/Back cannot navigate a foreign reader', async () => {
  const f = await stage3ActionsFixture(); const st = f.stores.useProposalAccountsStore, ref = f.initial.selectedOption.addedAccounts[0].selectedCampaignContentItem;
  f.render().onAddInfluencer(0); const s = await prepareStage5(f); const old = f.builder.getState().selectedAccounts[0];
  const orphan = { _id: 'hidden-orphan', socialMedia: 'instagram', socialMediaGroup: 'main', descriptions: [{ _id: 'hidden-description', description: 'hidden' }], additionalBrief: [] };
  assert.equal(s.render().finish({ campaignContent: [orphan], addedAccounts: [{ selectionId: old.selectionId, socialAccountId: old.accountId, selectedCampaignContentItem: { campaignContentItemId: orphan._id, descriptionId: 'hidden-description' } }] }), true);
  assert.deepEqual(st.getState().accountsByOption[0][0].selectedContent, ref); assert.equal(st.getState().contentByOption[0].length, 1);
  const next = await prepareStage5(f, { query: 'mode=add-influencer&campaignId=A&option=0&session=cancel-owner&currency=USD' });
  const foreign = f.fetch.getState().setProposalOption('B', 1); f.pending.at(-1).resolve(stage3Proposal('B', 1)); await foreign;
  next.render().backToSelection(); next.render().cancel(); assert.equal(next.navigation.length, 0); assert.equal(f.writes.length, 0);
});

test('stage 5 actual row confirmation removes a pending standalone by local occurrence and a pending replacement Offer as a complete group', async () => {
  for (const grouped of [false, true]) {
    const f = await stage3ActionsFixture(); f.render().onAddInfluencer(0); const s = await prepareStage5(f);
    const b = f.builder;
    if (grouped) {
      const a = b.getState().selectedAccounts[0]; b.getState().actions.selectOffer({ offerId: 'pending-offer', accountIds: [a.accountId, 'new'], accounts: [a, stage5NewAccount()], offerPrices: { EUR: 70, USD: 77, GBP: 63 } });
    } else b.getState().actions.togglePromoCard(stage5NewAccount());
    assert.equal(s.render().finish(), true);
    const store = f.stores.useProposalAccountsStore, row = store.getState().accountsByOption[0].find((a) => a.socialAccountId === 'new');
    const keys = load('src/client-side/utils/get-id.ts'); assert.ok(keys.getAccountKey(row).startsWith('selection:')); assert.equal(row.addedAccountsId, undefined);
    store.getState().setAccountDateRequest(0, keys.getAccountKey(row), 'pending-local-date');
    assert.equal(store.getState().accountsByOption[0].find((a) => a.socialAccountId === 'new').dateRequest, 'pending-local-date');
    const harness = hookHarness(); const { ActionCell } = load('src/client-side/widgets/campaign/cells/action-cells/delete-cell.tsx', {
      react: { ...harness.hooks, useContext: () => ({ isMutationPending: false }) }, '@/client-side/store': f.stores,
      '@/client-side/utils': keys, 'react-toastify': { toast: { error: (m) => assert.fail(m) } },
      '@/client-side/pages/campaign/model/proposal-actions-context': { ProposalActionsContext: {} },
      '@/components/ui/modal-fix/Modal': { Modal: () => {} }, '@/shared/ui': { ButtonMain: () => {}, ButtonSecondary: () => {} },
      '@/client-side/widgets/campaign/model/proposal-row-removal': removalDecisions, '@/client-side/widgets/campaign/model/proposal-overlap-removal': overlapDecisions,
    });
    const render = () => harness.render(() => ActionCell({ data: row, optionIndex: 0 }));
    const click = () => elements(render()).find((n) => n.type === 'button' && n.props.className === 'trash-action__delete').props.onClick({ stopPropagation() {} });
    const before = store.getState().accountsByOption[0]; click();
    elements(render()).filter((n) => n.type === 'button' && n.props.className === 'trash-action__same')[1].props.onClick({ stopPropagation() {} });
    assert.equal(store.getState().accountsByOption[0], before);
    click(); await elements(render()).filter((n) => n.type === 'button' && n.props.className === 'trash-action__same')[0].props.onClick({ stopPropagation() {} });
    assert.equal(store.getState().accountsByOption[0].length, grouped ? 1 : 3); if (grouped) assert.equal(store.getState().selectedOfferChangeByOption[0], null);
    assert.equal(f.writes.length, 0); assert.equal(store.getState().optionSnapshotsByIndex[0].addedAccounts.length, 3);
  }
});

test('stage 5 direct content URL with unavailable prices shows a review path rather than an endless returning state', async () => {
  const f = await stage3ActionsFixture({ withOffer: false }); f.stores.useProposalAccountsStore.getState().accountsByOption[0].forEach((a) => a.prices = {});
  f.render().onAddInfluencer(0); const s = await prepareStage5(f); assert.equal(f.builder.getState().totalPriceReady, false);
  const c = stage5ContentPage(f, s); c.render(); c.harness.flush(); c.render(); c.harness.flush();
  const tree = c.render(); assert.ok(elements(tree).some((n) => n.props.role === 'alert'));
  assert.ok(elements(tree).some((n) => (n.props.text ?? n.props.children) === 'Back to selection')); assert.equal(c.navigation.length, 0); assert.equal(f.writes.length, 0);
});

test('stage 5 an option change before builder preparation cannot revive the old entry intent', async () => {
  const f = await stage3ActionsFixture(); f.render().onAddInfluencer(0);
  const other = f.fetch.getState().setProposalOption('A', 1); f.pending[1].resolve(stage3Proposal('A', 1)); await other;
  const before = f.builder.getState().selectedAccounts; const s = stage5SessionFixture(f); await tick();
  assert.match(s.render().error, /active option changed/); assert.equal(f.builder.getState().selectedAccounts, before); assert.equal(f.pending.length, 2); assert.equal(f.writes.length, 0);
});

// Stage-5 review: membership equality must include placement identity, not just catalogue IDs.
function reviewSameOfferCatalogue(snapshot, offerId = snapshot.selectedOffer.offerId) {
  const offer = snapshot.selectedOffer;
  return { offerId, accountIds: [...offer.selectedAccountIds], offerName: 'Catalogue Offer',
    offerPrices: { ...offer.prices }, catalogContext: { platform: 'instagram', genre: 'techno' },
    accounts: offer.selectedAccountIds.map((id) => {
      const row = snapshot.addedAccounts.find((a) => a.socialAccountId === id);
      return { accountId: id, influencerId: row.influencerId, socialMedia: row.socialMedia, username: row.username,
        profileType: row.profileType, prices: { ...row.prices }, followers: row.followers };
    }) };
}

test('stage 5 review saved Offer -> remove -> reselect same catalogue Offer -> local Apply -> PATCH/GET creates new lifecycle membership', async () => {
  for (const failedRead of [false, true]) {
    const f = await stage3ActionsFixture(); addReviewOption(f, 1, true); const store = f.stores.useProposalAccountsStore;
    const snapshot = store.getState().optionSnapshotsByIndex[0], baseline = structuredClone(snapshot);
    const catalogue = reviewSameOfferCatalogue(snapshot), oldIds = [...snapshot.selectedOffer.selectedAddedAccountsIds];
    const independent = snapshot.addedAccounts.find((a) => !snapshot.selectedOffer.selectedAccountIds.includes(a.socialAccountId));
    const secondRef = { ...independent.selectedCampaignContentItem, descriptionId: snapshot.campaignContent[0].descriptions[1]._id };
    store.getState().setAccountDateRequest(0, independent.addedAccountsId, 'independent-unsaved-date');
    store.getState().setAccountSelectedContent(0, independent.addedAccountsId, secondRef);
    assert.equal(f.render().onAddInfluencer(0), true); const s = await prepareStage5(f); const builder = f.builder;
    const firstSelections = builder.getState().selectedAccounts.filter((a) => a.source === 'offer').map((a) => a.selectionId);
    builder.getState().actions.selectOffer({ offerId: null });
    assert.deepEqual(builder.getState().selectedAccounts.map((a) => a.accountId), [independent.socialAccountId]);
    builder.getState().actions.selectOffer(catalogue);
    const staged = builder.getState().selectedAccounts.filter((a) => a.source === 'offer');
    assert.equal(staged.length, 2); assert.ok(staged.every((a) => !a.addedAccountsId && !firstSelections.includes(a.selectionId)));
    // These are explicit current choices on the new occurrences, not restored historical row identities.
    for (const row of staged) builder.getState().actions.setSelectedCampaignContentItem(row.accountId, secondRef);
    assert.equal(s.render().finish(), true, s.errors.join('; '));
    assert.equal(f.writes.length, 0); assert.equal(s.navigation.length, 1);
    const working = store.getState().accountsByOption[0];
    assert.equal(working.length, 3); assert.deepEqual(working.filter((a) => a.source === 'manual').map((a) => a.socialAccountId), [independent.socialAccountId]);
    assert.deepEqual(store.getState().selectedOfferChangeByOption[0], { offerId: catalogue.offerId, selectedAccountIds: catalogue.accountIds });
    assert.ok(working.filter((a) => catalogue.accountIds.includes(a.socialAccountId)).every((a) => !a.addedAccountsId && a.isNewProposalPlacement && a.selectedCampaignContentItem.descriptionId === secondRef.descriptionId));
    const survivor = working.find((a) => a.addedAccountsId === independent.addedAccountsId);
    assert.equal(survivor.dateRequest, 'independent-unsaved-date'); assert.deepEqual(survivor.selectedCampaignContentItem, secondRef);
    assert.deepEqual(store.getState().optionSnapshotsByIndex[0], baseline, 'local Apply must not change authoritative snapshot');
    assert.deepEqual(store.getState().contentByOption[0], baseline.campaignContent);
    const save = f.render().updateProposalOption(); await tick();
    assert.equal(f.writes.length, 1); const body = f.writes[0][3];
    assert.deepEqual(body.selectedOffer, { offerId: catalogue.offerId, selectedAccountIds: catalogue.accountIds });
    assert.equal(Object.hasOwn(body.selectedOffer, 'selectedAddedAccountsIds'), false);
    assert.ok(body.addedAccounts.filter((a) => catalogue.accountIds.includes(a.socialAccountId)).every((a) => !Object.hasOwn(a, 'addedAccountsId')));
    assert.equal(body.addedAccounts.find((a) => a.socialAccountId === independent.socialAccountId).addedAccountsId, independent.addedAccountsId);
    assert.equal(Object.hasOwn(body, 'campaignPrice'), false);
    const fresh = patchGetWithNewIds(f);
    assert.ok(fresh.selectedOption.selectedOffer.selectedAddedAccountsIds.every((id) => !oldIds.includes(id)));
    if (failedRead) {
      f.pending.at(-1).reject(new Error('GET unavailable after successful replacement')); assert.equal(await save, false);
      assert.equal(f.render().needsProposalRead, true); assert.deepEqual(store.getState().optionSnapshotsByIndex[0], baseline);
      const retry = f.render().retryProposalRead(); await tick(); f.pending.at(-1).resolve(fresh); assert.equal(await retry, true); assert.equal(f.writes.length, 1);
    } else { f.pending.at(-1).resolve(fresh); assert.equal(await save, true); }
    assert.deepEqual(store.getState().optionSnapshotsByIndex[0].selectedOffer.selectedAddedAccountsIds, fresh.selectedOption.selectedOffer.selectedAddedAccountsIds);
    assert.ok(store.getState().accountsByOption[0].filter((a) => catalogue.accountIds.includes(a.socialAccountId)).every((a) => a.addedAccountsId && !oldIds.includes(a.addedAccountsId)));
    assert.equal(store.getState().accountsByOption[1][0].dateRequest, 'unsaved-option-1');
  }
});

test('stage 5 review retained Offer placements keep omission across reorder and content/date edits', async () => {
  const f = await stage3ActionsFixture(); const store = f.stores.useProposalAccountsStore, snapshot = store.getState().optionSnapshotsByIndex[0];
  f.render().onAddInfluencer(0); const s = await prepareStage5(f); const builder = f.builder;
  const member = builder.getState().selectedAccounts.find((a) => a.source === 'offer');
  const ref = { ...member.selectedCampaignContentItem, descriptionId: snapshot.campaignContent[0].descriptions[1]._id };
  builder.getState().actions.setAccountDateRequest(member.accountId, 'retained-date');
  builder.getState().actions.setSelectedCampaignContentItem(member.accountId, ref);
  builder.getState().actions.setSelectedAccounts([...builder.getState().selectedAccounts].reverse());
  assert.equal(s.render().finish(), true); assert.equal(Object.hasOwn(store.getState().selectedOfferChangeByOption, 0), false);
  const save = f.render().updateProposalOption(); await tick(); const body = f.writes[0][3];
  assert.equal(Object.hasOwn(body, 'selectedOffer'), false); assert.deepEqual(body.addedAccounts.map((a) => a.addedAccountsId).sort(), snapshot.addedAccounts.map((a) => a.addedAccountsId).sort());
  assert.deepEqual(body.addedAccounts.find((a) => a.addedAccountsId === member.addedAccountsId).selectedCampaignContentItem, ref);
  f.pending.at(-1).resolve(patchGetWithNewIds(f)); assert.equal(await save, true);
  assert.deepEqual(store.getState().optionSnapshotsByIndex[0].selectedOffer.selectedAddedAccountsIds, snapshot.selectedOffer.selectedAddedAccountsIds);
});

test('stage 5 review a real working Offer replacement preserves valid links only while its placements survive', async () => {
  for (const linkedFixture of [false, true]) for (const action of ['keep', 'reselect', 'different', 'remove']) {
    const f = await stage3ActionsFixture(); const store = f.stores.useProposalAccountsStore, snapshot = store.getState().optionSnapshotsByIndex[0];
    const firstCatalogue = reviewSameOfferCatalogue(snapshot, 'working-offer');
    f.render().onAddInfluencer(0); const first = await prepareStage5(f);
    f.builder.getState().actions.selectOffer(firstCatalogue); assert.equal(first.render().finish(), true);
    assert.deepEqual(store.getState().selectedOfferChangeByOption[0], { offerId: firstCatalogue.offerId, selectedAccountIds: firstCatalogue.accountIds });
    if (linkedFixture) {
      // Optional lifecycle links in an already-valid working change. The change itself came from real selection/Apply.
      store.setState({ selectedOfferChangeByOption: { ...store.getState().selectedOfferChangeByOption, 0: { ...store.getState().selectedOfferChangeByOption[0], selectedAddedAccountsIds: [...snapshot.selectedOffer.selectedAddedAccountsIds] } } });
    }
    const existingChange = store.getState().selectedOfferChangeByOption[0];
    const s = await prepareStage5(f, { query: `mode=add-influencer&campaignId=A&option=0&session=review-${action}-${linkedFixture}&currency=USD` });
    assert.equal(s.render().ready, true, s.render().error);
    if (action === 'reselect') { f.builder.getState().actions.selectOffer({ offerId: null }); f.builder.getState().actions.selectOffer(firstCatalogue); }
    if (action === 'different') f.builder.getState().actions.selectOffer(reviewSameOfferCatalogue(snapshot, 'another-offer'));
    if (action === 'remove') f.builder.getState().actions.selectOffer({ offerId: null });
    assert.equal(s.render().finish(), true, s.errors.join('; '));
    const change = store.getState().selectedOfferChangeByOption[0];
    if (action === 'keep') assert.equal(change, existingChange);
    else if (action === 'remove') { assert.equal(change, null); assert.equal(store.getState().accountsByOption[0].length, 1); }
    else {
      assert.deepEqual(change, { offerId: action === 'reselect' ? 'working-offer' : 'another-offer', selectedAccountIds: firstCatalogue.accountIds });
      assert.equal(Object.hasOwn(change, 'selectedAddedAccountsIds'), false, 'replacement must not retain stale lifecycle membership');
    }
    const save = f.render().updateProposalOption(); await tick(); const body = f.writes[0][3]; assert.deepEqual(body.selectedOffer, change);
    if (action === 'reselect') assert.ok(body.addedAccounts.filter((a) => firstCatalogue.accountIds.includes(a.socialAccountId)).every((a) => !a.addedAccountsId));
    if (action === 'keep' || action === 'different') assert.ok(body.addedAccounts.every((a) => a.addedAccountsId));
    f.pending.at(-1).resolve(patchGetWithNewIds(f)); assert.equal(await save, true);
  }
});

test('stage 5 review Cancel after same Offer reselection keeps the original working rows and snapshot', async () => {
  const f = await stage3ActionsFixture(); const store = f.stores.useProposalAccountsStore, snapshot = store.getState().optionSnapshotsByIndex[0];
  const independent = snapshot.addedAccounts.at(-1);
  store.getState().setAccountDateRequest(0, independent.addedAccountsId, 'keep-independent-edit');
  const original = store.getState().accountsByOption[0], saved = structuredClone(snapshot);
  f.render().onAddInfluencer(0); const s = await prepareStage5(f);
  f.builder.getState().actions.selectOffer({ offerId: null }); f.builder.getState().actions.selectOffer(reviewSameOfferCatalogue(snapshot));
  s.render().cancel(); assert.equal(s.navigation.length, 1); assert.equal(f.writes.length, 0);
  assert.equal(store.getState().accountsByOption[0], original); assert.deepEqual(store.getState().optionSnapshotsByIndex[0], saved);
  assert.equal(Object.hasOwn(store.getState().selectedOfferChangeByOption, 0), false); assert.equal(f.builder.getState().proposalAddSession, null);
});

test('stage 5 review partial saved Offer remains invalid; equal catalogue IDs do not bypass full membership validation', async () => {
  const f = await stage3ActionsFixture(); const store = f.stores.useProposalAccountsStore;
  f.render().onAddInfluencer(0); const s = await prepareStage5(f);
  const before = store.getState().accountsByOption[0], member = f.builder.getState().selectedAccounts.find((a) => a.source === 'offer');
  f.builder.getState().actions.removeSelection(member.selectionId);
  assert.equal(s.render().finish(), false); assert.equal(store.getState().accountsByOption[0], before); assert.equal(f.writes.length, 0);
  assert.ok(s.errors.length); assert.equal(Object.hasOwn(store.getState().selectedOfferChangeByOption, 0), false);
});


// Stage 6: structural fixtures of the pinned DTO/envelope, not recorded HTTP responses.
const checkoutProposalId = 'a10000000000000000000001';
const checkoutProposalB = 'b20000000000000000000002';
function checkoutSaved(index = 0, { id = checkoutProposalId, currency = 'EUR', price = 83, offer = true } = {}) {
  const saved = proposal(id, index);
  saved.campaignName = 'Saved payment option';
  Object.assign(saved.selectedOption, {
    price, displayCurrency: currency, canEdit: false, addedBundles: [],
    campaignContent: [{ _id: 'c', socialMedia: 'instagram', socialMediaGroup: 'main', profileType: 'creator', mainLink: 'saved-link',
      descriptions: [{ _id: 'd1', description: 'one' }, { _id: 'd2', description: 'two' }],
      additionalBrief: [{ _id: 'b1', additionalBrief: 'one' }, { _id: 'b2', additionalBrief: 'two' }] }],
    addedAccounts: ['a', 'b'].map((id) => ({ addedAccountsId: `life-${id}`, socialAccountId: id,
      influencerId: `inf-${id}`, socialMedia: 'instagram', username: id, dateRequest: '2026-12-01',
      selectedContent: { campaignContentItemId: 'c', descriptionId: 'd2', additionalBriefId: 'b2' } })),
  });
  if (offer) saved.selectedOption.selectedOffer = { campaignOfferId: 'life-offer', offerId: 'catalogue-offer', title: 'Saved Offer',
    selectedAccountIds: ['a', 'b'], selectedAddedAccountsIds: ['life-a', 'life-b'], overlapAccountIds: [] };
  return saved;
}
const paymentSubmit = (fixture) => elements(fixture.render()).find((node) => node.type === fixture.FormPayment).props.onSubmit;
const paymentText = (fixture) => JSON.stringify(fixture.render());
async function readyProposalPayment(options = {}) {
  const fixture = paymentFixture({ path: '/client/campaign/payment', query: `proposal=${checkoutProposalId}&option=0`,
    loadProposal: async (id, index) => checkoutSaved(index, { id }), ...options });
  fixture.render(); fixture.harness.flush(); await tick(); return fixture;
}
function deferredPayment() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }

test('Proposal checkout strict URLs never default to option zero or accept ambiguous indices/IDs', async () => {
  for (const query of [`proposal=${checkoutProposalId}`, `proposal=${checkoutProposalId}&option=`,
    `proposal=${checkoutProposalId}&option=00`, `proposal=${checkoutProposalId}&option=1e0`, `proposal=${checkoutProposalId}&option=-1`,
    `proposal=${checkoutProposalId}&option=1.0`, `proposal=${checkoutProposalId}&option=9007199254740992`,
    `proposal=${checkoutProposalId}&option=0&option=1`, `proposal=${checkoutProposalId}&proposal=${checkoutProposalB}&option=0`,
    `proposal=garbage&option=0`, `proposal=${checkoutProposalId}&option=0&draft=other`]) {
    const f = paymentFixture({ path: '/client/campaign/payment', query }); f.render(); f.harness.flush();
    await paymentSubmit(f)(paymentValues); assert.equal(f.calls.length, 0, query);
  }
});

test('cold saved standalone/Offer payment uses authoritative EUR/USD/GBP and real zero without cache/FX/private patches', async () => {
  for (const offer of [false, true]) for (const [currency, price, symbol] of [['EUR', 83, '\u20ac'], ['USD', 91, '$'], ['GBP', 0, '\u00a3']]) {
    const saved = checkoutSaved(0, { currency, price, offer });
    const f = await readyProposalPayment({ loadProposal: async () => saved });
    const patches = f.updates.getState(); f.updates.getState().setField('c', 'mainLink', 'unrelated private edit');
    const before = f.updates.getState(); const builderBefore = f.builder.getState();
    f.session.set('proposalPaymentPayload', JSON.stringify({ payload: { campaignPrice: 999, displayCurrency: 'GBP' } }));
    assert.ok(elements(f.render()).some((n) => n.type === 'p' && Array.isArray(n.props.children) && n.props.children[0] === symbol && n.props.children[1] === price), currency);
    if (offer) assert.ok(paymentText(f).includes('Saved Offer'));
    assert.equal(elements(f.render()).find((n) => n.type === f.FormPayment).props.submitButton.props.disabled, false, 'canEdit=false is not an approve permission');
    await paymentSubmit(f)({ ...paymentValues, amount: 999, selectedOfferSnapshot: { fake: true } });
    const sent = f.calls.find(([kind]) => kind === 'approve'); assert.ok(sent);
    assert.deepEqual(Object.keys(sent[3]).sort(), ['address', 'company', 'country', 'firstName', 'lastName', 'referenceNumber', 'selectedPaymentMethod', 'vatNumber']);
    assert.equal(f.calls.some(([kind]) => ['post', 'delete'].includes(kind)), false);
    assert.equal(f.updates.getState(), before); assert.equal(f.builder.getState(), builderBefore);
    assert.notEqual(before, patches); assert.equal(saved.selectedOption.addedAccounts[0].selectedContent.descriptionId, 'd2');
  }
});

test('Proposal missing/invalid amount or currency, malformed GET identity and Bundles block approval before API', async () => {
  for (const mutate of [s => delete s.selectedOption.price, s => s.selectedOption.price = null,
    s => s.selectedOption.price = -1, s => s.selectedOption.price = '83', s => s.selectedOption.price = NaN,
    s => s.selectedOption.displayCurrency = 'CAD', s => s.campaignId = checkoutProposalB,
    s => s.selectedOption.optionIndex = 1, s => s.selectedOption.addedBundles = [{ campaignBundleId: 'bundle' }],
    s => s.selectedOption.addedAccounts[0].campaignBundleId = 'bundle', s => s.selectedOption.addedAccounts[0].bundleId = 'catalogue-bundle']) {
    const saved = checkoutSaved(); mutate(saved);
    const f = await readyProposalPayment({ loadProposal: async () => saved });
    await paymentSubmit(f)(paymentValues);
    assert.equal(f.calls.some(([kind]) => kind === 'approve'), false);
    assert.equal(elements(f.render()).find((n) => n.type === f.FormPayment).props.submitButton.props.disabled, true);
    assert.ok(paymentText(f).includes('Retry reading saved option'));
  }
});

test('Proposal read error retries only the requested GET and preserves the payment form', async () => {
  let fail = true;
  const f = await readyProposalPayment({ loadProposal: async () => { if (fail) throw new Error('read failed'); return checkoutSaved(); } });
  const form = elements(f.render()).find((n) => n.type === f.FormPayment);
  await form.props.onSubmit(paymentValues); assert.equal(f.calls.filter(([kind]) => kind === 'approve').length, 0);
  fail = false; await elements(f.render()).find((n) => n.type === 'button' && n.props.children === 'Retry reading saved option').props.onClick();
  await tick(); assert.equal(elements(f.render()).find((n) => n.type === f.FormPayment).props.submitButton.props.disabled, false);
  assert.equal(f.calls.filter(([kind]) => kind === 'getProposal').length, 2);
});

test('Proposal approval revalidation updates changed composition/price/refs and requires a new explicit click', async () => {
  for (const mutate of [s => s.selectedOption.price = 102, s => s.selectedOption.addedAccounts.reverse(),
    s => s.selectedOption.addedAccounts[0].addedAccountsId = 'reindexed-placement',
    s => s.selectedOption.campaignContent[0].mainLink = 'changed content',
    s => s.selectedOption.addedAccounts[0].selectedContent.descriptionId = 'd1']) {
    let saved = checkoutSaved(); const f = await readyProposalPayment({ loadProposal: async () => structuredClone(saved) });
    saved = structuredClone(saved); mutate(saved);
    await paymentSubmit(f)(paymentValues); assert.equal(f.calls.some(([k]) => k === 'approve'), false);
    assert.ok(paymentText(f).includes('The saved option changed'));
    await paymentSubmit(f)(paymentValues); assert.equal(f.calls.filter(([k]) => k === 'approve').length, 1);
  }
});

test('double click and old callbacks cannot repeat a successful void approve; no post-success GET/cleanup required', async () => {
  const write = deferredPayment(); let reads = 0;
  const f = await readyProposalPayment({ loadProposal: async () => { if (++reads > 2) throw new Error('consumed Proposal no longer readable'); return checkoutSaved(); }, approve: () => write.promise });
  const submit = paymentSubmit(f); const first = submit(paymentValues); const second = submit(paymentValues);
  await tick(); assert.equal(f.calls.filter(([k]) => k === 'approve').length, 1); write.resolve(undefined); await Promise.all([first, second]);
  await submit(paymentValues); await paymentSubmit(f)(paymentValues);
  assert.equal(reads, 2); assert.ok(paymentText(f).includes('Proposal approved')); assert.ok(paymentText(f).includes('Go to dashboard'));
  assert.equal(f.calls.filter(([k]) => k === 'approve').length, 1); assert.equal(f.calls.some(([k]) => ['post', 'delete'].includes(k)), false);
  assert.equal(JSON.parse(f.session.get(`proposalApprove:${checkoutProposalId}`)).status, 'completed');
});

test('confirmed approval refusal preserves the form and requires GET before a new user confirmation', async () => {
  for (const status of [400, 401, 403, 404, 409, 422]) {
    let fail = true;
    const f = await readyProposalPayment({ approve: async () => { if (fail) throw { response: { status } }; } });
    await paymentSubmit(f)(paymentValues); assert.ok(paymentText(f).includes('Approval was rejected'));
    await paymentSubmit(f)(paymentValues); assert.equal(f.calls.filter(([k]) => k === 'approve').length, 1);
    fail = false; await elements(f.render()).find((n) => n.type === 'button' && n.props.children === 'Retry reading saved option').props.onClick(); await tick();
    assert.equal(f.calls.filter(([k]) => k === 'approve').length, 1, 'read never retries the write or changes index');
    await paymentSubmit(f)(paymentValues); assert.equal(f.calls.filter(([k]) => k === 'approve').length, 2);
    assert.ok(f.calls.filter(([k]) => k === 'approve').every((call) => call[2] === 0));
  }
});

test('timeout/network/5xx approval outcome is visible and blocked without destructive retry, including URL return', async () => {
  for (const error of [new Error('network disconnected'), { code: 'ECONNABORTED' }, { response: { status: 408 } }, { response: { status: 500 } }]) {
    const f = await readyProposalPayment({ approve: async () => { throw error; } });
    const submit = paymentSubmit(f); await submit(paymentValues);
    assert.ok(paymentText(f).includes('outcome is unknown')); await submit(paymentValues); await paymentSubmit(f)(paymentValues);
    f.params.set('option', '1'); f.render(); f.harness.flush(); await tick();
    f.params.set('option', '0'); f.render(); f.harness.flush(); await tick();
    await paymentSubmit(f)(paymentValues);
    assert.equal(f.calls.filter(([k]) => k === 'approve').length, 1);
    assert.ok(paymentText(f).includes('outcome is unknown'));
  }
});

test('Proposal read A to B / option zero to one drops late success/error and old submit callbacks', async () => {
  for (const mode of ['campaign', 'option', 'unmount', 'old-error']) {
    const old = deferredPayment();
    const f = paymentFixture({ path: '/client/campaign/payment', query: `proposal=${checkoutProposalId}&option=0`,
      loadProposal: (id, index) => id === checkoutProposalId && index === 0 ? old.promise : Promise.resolve(checkoutSaved(index, { id })) });
    f.render(); f.harness.flush(); const oldSubmit = paymentSubmit(f);
    if (mode === 'campaign' || mode === 'old-error') f.params.set('proposal', checkoutProposalB);
    if (mode === 'option') f.params.set('option', '1');
    if (mode === 'unmount') f.harness.unmount(); else { f.render(); f.harness.flush(); await tick(); }
    if (mode === 'old-error') old.reject(new Error('OLD ERROR')); else old.resolve(checkoutSaved()); await tick();
    await oldSubmit(paymentValues); assert.equal(f.calls.some(([k]) => k === 'approve'), false);
    if (mode !== 'unmount') { assert.equal(paymentText(f).includes('OLD ERROR'), false); await paymentSubmit(f)(paymentValues); assert.equal(f.calls.filter(([k]) => k === 'approve').length, 1); }
  }
});

test('late approve success/failure/preflight after campaign/option change or unmount belongs only to original context', async () => {
  for (const outcome of ['success', 'failure', 'preflight']) for (const change of ['campaign', 'option', 'unmount']) {
    const late = deferredPayment(); let reads = 0;
    const f = await readyProposalPayment({ loadProposal: async (id, index) => {
      if (++reads === 2 && outcome === 'preflight') return late.promise;
      return checkoutSaved(index, { id });
    }, approve: () => late.promise });
    const submit = paymentSubmit(f); const pending = submit(paymentValues); await tick();
    if (change === 'campaign') f.params.set('proposal', checkoutProposalB);
    if (change === 'option') f.params.set('option', '1');
    if (change === 'unmount') f.harness.unmount(); else { f.render(); f.harness.flush(); await tick(); }
    if (outcome === 'failure') late.reject(new Error('late disconnected')); else late.resolve(outcome === 'preflight' ? checkoutSaved() : undefined);
    await pending; await submit(paymentValues);
    assert.equal(f.calls.filter(([k]) => k === 'approve').length, outcome === 'preflight' ? 0 : 1);
    assert.equal(f.navigation.length, 0); assert.equal(f.notifications.length, 0);
    if (change === 'campaign' || outcome === 'preflight') { assert.equal(paymentText(f).includes('outcome is unknown'), false); assert.equal(paymentText(f).includes('Proposal approved successfully'), false); }
    if (change === 'option' && outcome !== 'preflight') { await paymentSubmit(f)(paymentValues); assert.equal(f.calls.filter(([k]) => k === 'approve').length, 1); }
  }
});

test('authenticated client/admin permission is distinct from canEdit and URL flags cannot grant approve', async () => {
  for (const [authorization, user] of [[{ isAuthReady: false, accessToken: 'x' }, { role: 'client' }],
    [{ isAuthReady: true, accessToken: null }, { role: 'client' }], [{ isAuthReady: true, accessToken: 'x' }, { role: 'influencer' }]]) {
    const f = await readyProposalPayment({ authorization, user }); await paymentSubmit(f)(paymentValues);
    assert.equal(f.calls.some(([k]) => k === 'approve'), false);
  }
});

test('approve API wrapper is a DTO allowlist with exact campaign/index and accepts empty successful response', async () => {
  const calls = [];
  const api = load('src/api/client/campaign/campaign.api.ts', { '../../api.ts': { post: async (...args) => { calls.push(args); return { status: 201, data: { statusCode: 201, message: 'Success' } }; } } });
  await api.approveProposalCampaign(checkoutProposalId, 2, { ...paymentValues, amount: 999, campaignPrice: 999,
    selectedOfferSnapshot: { fake: true }, addedAccounts: ['fake'], campaignContent: ['fake'], userId: 'fake', poNumber: 'PO' });
  assert.equal(calls[0][0], `/proposal-system/approve/${checkoutProposalId}`); assert.deepEqual(calls[0][2], { params: { optionIndex: 2 } });
  assert.deepEqual(calls[0][1], { firstName: 'Client', lastName: 'Test', country: 'DE', address: 'Address',
    referenceNumber: 'test-reference', selectedPaymentMethod: 'bank_card', poNumber: 'PO' });
});


test('existing LoginPage continuation keeps the exact Proposal payment route after authentication', async () => {
  const harness = hookHarness(); const Form = () => {}; const navigation = []; const calls = [];
  const path = `/client/campaign/payment?proposal=${checkoutProposalId}&option=2`;
  const session = new Map([['postAuthRedirect', JSON.stringify({ path, campaignId: checkoutProposalId, optionIndex: 2 })]]);
  const { LoginPage } = load('src/pages/auth/login/LoginPage.tsx', {
    react: harness.hooks, 'react-router-dom': { Link: () => {}, useNavigate: () => (...args) => navigation.push(args) },
    '@/contexts/AuthContext.tsx': { useAuth: () => ({ setAccessToken: (token) => calls.push(['token', token]) }) },
    '@/store/get-user/index.ts': { useUser: () => ({ role: 'client', setUser: (user) => calls.push(['user', user]) }) },
    '@/api/auth/auth.api.ts': { loginApi: async () => ({ accessToken: 'token' }), getMe: async () => ({ role: 'client' }) },
    '@/api/error.api.ts': { handleApiError: () => assert.fail('unexpected login error') },
    '@/components/ui/buttons-fix/ButtonFix.tsx': {}, '@/pages/auth/login/validation/login.schema.ts': {},
    '@/components': { Form }, '@components/ui/base-masked-password-input/BaseMaskedPasswordInput.tsx': {},
  }, { sessionStorage: { getItem: (key) => session.get(key) ?? null, removeItem: (key) => session.delete(key) }, console: { log() {} } });
  const tree = harness.render(() => LoginPage());
  await elements(tree).find((n) => n.type === Form).props.onSubmit({ email: 'fixture@example.test', password: 'mock' });
  assert.deepEqual(navigation, [[path, { replace: true }]]); assert.equal(calls.length, 2);
  const f = await readyProposalPayment({ query: path.split('?')[1], loadProposal: async (id, index) => checkoutSaved(index, { id }) });
  assert.deepEqual(f.calls[0], ['getProposal', checkoutProposalId, 2]);
});

test('Proposal completed/pending receipts survive F5 without another write or invented read recovery', async () => {
  for (const receipt of ['completed', 'pending']) {
    const sessionData = new Map([[`proposalApprove:${checkoutProposalId}`, JSON.stringify({ attemptId: 'persisted', optionIndex: 0, status: receipt })]]);
    const f = await readyProposalPayment({ sessionData }); await paymentSubmit(f)(paymentValues);
    assert.equal(f.calls.length, 0); assert.ok(paymentText(f).includes(receipt === 'completed' ? 'Proposal approval completed' : 'Approval of this Proposal is pending'));
    assert.equal(elements(f.render()).find((n) => n.type === f.FormPayment).props.submitButton.props.disabled, true);
  }
});

test('same-option keyed reader accepts only the latest retry; stale responses cannot reenable an old summary', async () => {
  let count = 0; const reads = [deferredPayment(), deferredPayment()];
  const f = await readyProposalPayment({ loadProposal: async () => { if (!count++) throw new Error('initial GET refused'); return reads[count - 2].promise; } });
  const retry = elements(f.render()).find((n) => n.type === 'button' && n.props.children === 'Retry reading saved option').props.onClick;
  retry(); retry();
  const fresh = checkoutSaved(0, { currency: 'GBP', price: 44 }); reads[1].resolve(fresh); await tick();
  reads[0].resolve(checkoutSaved(0, { currency: 'EUR', price: 1000 })); await tick();
  assert.ok(elements(f.render()).some((n) => n.type === 'p' && Array.isArray(n.props.children) && n.props.children[1] === 44));
});

test('failed pre-approve GET never mutates, and a 409 followed by reindex refresh requires an updated user confirmation', async () => {
  let reads = 0;
  const f = await readyProposalPayment({ loadProposal: async () => { if (++reads === 2) throw new Error('preflight read failed'); return checkoutSaved(); } });
  await paymentSubmit(f)(paymentValues); assert.equal(f.calls.some(([k]) => k === 'approve'), false);
  assert.ok(paymentText(f).includes('preflight read failed'));
  let reject = true; let saved = checkoutSaved();
  const g = await readyProposalPayment({ loadProposal: async () => structuredClone(saved), approve: async () => { if (reject) throw { response: { status: 409 } }; } });
  await paymentSubmit(g)(paymentValues); saved = checkoutSaved(0, { price: 60 }); saved.selectedOption.addedAccounts[0].addedAccountsId = 'replacement-after-reindex';
  await elements(g.render()).find((n) => n.type === 'button' && n.props.children === 'Retry reading saved option').props.onClick(); await tick();
  assert.equal(g.calls.filter(([k]) => k === 'approve').length, 1);
  assert.ok(elements(g.render()).some((n) => n.type === 'p' && Array.isArray(n.props.children) && n.props.children[1] === 60));
  reject = false; await paymentSubmit(g)(paymentValues);
  assert.equal(g.calls.filter(([k]) => k === 'approve').length, 2); assert.ok(g.calls.filter(([k]) => k === 'approve').every((call) => call[2] === 0));
});

test('URL session change before preflight finishes forbids the old approve continuation', async () => {
  const late = deferredPayment(); let reads = 0;
  const f = await readyProposalPayment({ loadProposal: async () => ++reads === 2 ? late.promise : checkoutSaved() });
  const submit = paymentSubmit(f); const pending = submit(paymentValues); await tick();
  f.params.set('review', 'new-session'); f.render(); f.harness.flush(); await tick();
  late.resolve(checkoutSaved()); await pending; await submit(paymentValues);
  assert.equal(f.calls.some(([k]) => k === 'approve'), false);
  assert.equal(elements(f.render()).find((n) => n.type === f.FormPayment).props.submitButton.props.disabled, false);
});


const approveCalls = (...fixtures) => fixtures.flatMap((f) => f.calls.filter(([kind]) => kind === 'approve'));
const proposalReceipt = (session, id = checkoutProposalId) => JSON.parse(session.get(`proposalApprove:${id}`) ?? 'null');
async function changePaymentOption(f, option) {
  f.params.set('option', String(option)); f.render(); f.harness.flush(); await tick();
}

test('stage 6 review pending approve consumes the Proposal lock across another option and URL session', async () => {
  const post = deferredPayment(); const f = await readyProposalPayment({ approve: () => post.promise });
  const pending = paymentSubmit(f)(paymentValues); await tick();
  assert.equal(approveCalls(f).length, 1); const receipt = proposalReceipt(f.session);
  assert.equal(receipt.status, 'pending'); assert.equal(receipt.optionIndex, 0); assert.ok(receipt.attemptId);
  await changePaymentOption(f, 1); await paymentSubmit(f)(paymentValues);
  f.params.set('review', 'another-location'); f.render(); f.harness.flush(); await tick(); await paymentSubmit(f)(paymentValues);
  assert.equal(approveCalls(f).length, 1); assert.equal(proposalReceipt(f.session).attemptId, receipt.attemptId);
  assert.equal(elements(f.render()).find((n) => n.type === f.FormPayment).props.submitButton.props.disabled, true);
  post.resolve(); await pending; assert.equal(proposalReceipt(f.session).status, 'completed');
  assert.equal(paymentText(f).includes('Proposal approved successfully'), false, 'old option continuation does not publish into new reader');
  await paymentSubmit(f)(paymentValues); assert.equal(approveCalls(f).length, 1);
});

test('stage 6 review timeout/network/5xx block actual approve from a different option, including remount/F5', async () => {
  for (const error of [new Error('network'), { code: 'ECONNABORTED' }, { response: { status: 408 } }, { response: { status: 500 } }]) {
    const sessionData = new Map(); const f = await readyProposalPayment({ sessionData, approve: async () => { throw error; } });
    await paymentSubmit(f)(paymentValues); assert.equal(proposalReceipt(sessionData).status, 'uncertain');
    await changePaymentOption(f, 1); await paymentSubmit(f)(paymentValues);
    f.harness.unmount();
    const restored = await readyProposalPayment({ sessionData, query: `proposal=${checkoutProposalId}&option=2` });
    await paymentSubmit(restored)(paymentValues);
    assert.equal(approveCalls(f, restored).length, 1); assert.ok(paymentText(restored).includes('outcome is unknown'));
  }
});

test('stage 6 review completed approve blocks every option and a pending POST remains blocked after remount', async () => {
  for (const completed of [true, false]) {
    const sessionData = new Map(); const post = deferredPayment();
    const f = await readyProposalPayment({ sessionData, approve: () => completed ? Promise.resolve() : post.promise });
    const first = paymentSubmit(f)(paymentValues); await tick();
    if (completed) await first;
    f.harness.unmount();
    const restored = await readyProposalPayment({ sessionData, query: `proposal=${checkoutProposalId}&option=1` });
    await paymentSubmit(restored)(paymentValues); await changePaymentOption(restored, 2); await paymentSubmit(restored)(paymentValues);
    assert.equal(approveCalls(f, restored).length, 1);
    assert.equal(elements(restored.render()).find((n) => n.type === restored.FormPayment).props.submitButton.props.disabled, true);
    post.resolve(); await first;
    assert.equal(proposalReceipt(sessionData).status, 'completed'); await paymentSubmit(restored)(paymentValues);
    assert.equal(approveCalls(f, restored).length, 1);
  }
});

test('stage 6 review parallel preflights of prepared options share one synchronous campaign claim and send one POST', async () => {
  for (const winner of [0, 1]) {
    const sessionData = new Map(); const preflights = [deferredPayment(), deferredPayment()]; const post = deferredPayment();
    const fixtures = [];
    for (const option of [0, 1]) {
      let reads = 0;
      fixtures.push(await readyProposalPayment({ sessionData, query: `proposal=${checkoutProposalId}&option=${option}`,
        loadProposal: async () => ++reads === 1 ? checkoutSaved(option) : preflights[option].promise,
        approve: () => post.promise }));
    }
    const pending = fixtures.map((f) => paymentSubmit(f)(paymentValues)); await tick();
    assert.equal(approveCalls(...fixtures).length, 0);
    preflights[winner].resolve(checkoutSaved(winner)); await tick();
    preflights[1 - winner].resolve(checkoutSaved(1 - winner)); await tick();
    assert.equal(approveCalls(...fixtures).length, 1); assert.equal(approveCalls(...fixtures)[0][2], winner);
    assert.equal(proposalReceipt(sessionData).optionIndex, winner);
    post.resolve(); await Promise.all(pending); assert.equal(proposalReceipt(sessionData).status, 'completed');
    await Promise.all(fixtures.map((f) => paymentSubmit(f)(paymentValues))); assert.equal(approveCalls(...fixtures).length, 1);
  }
});

test('stage 6 review a receipt claimed after ready state blocks even an old submit handler before its POST', async () => {
  const sessionData = new Map(); const stale = await readyProposalPayment({ sessionData, query: `proposal=${checkoutProposalId}&option=1` });
  const staleSubmit = paymentSubmit(stale); const post = deferredPayment();
  const owner = await readyProposalPayment({ sessionData, approve: () => post.promise });
  const pending = paymentSubmit(owner)(paymentValues); await tick();
  await staleSubmit(paymentValues);
  assert.equal(approveCalls(stale, owner).length, 1);
  assert.equal(stale.calls.filter(([kind]) => kind === 'getProposal').length, 1, 'stale ready state cannot even start a new preflight');
  assert.equal(elements(stale.render()).find((n) => n.type === stale.FormPayment).props.submitButton.props.disabled, true);
  post.resolve(); await pending;
});

test('stage 6 review confirmed refusal releases only its attempt and another option needs GET then explicit confirmation', async () => {
  const sessionData = new Map(); const firstPost = deferredPayment();
  const owner = await readyProposalPayment({ sessionData, approve: () => firstPost.promise });
  const first = paymentSubmit(owner)(paymentValues); await tick(); const firstId = proposalReceipt(sessionData).attemptId;
  const other = await readyProposalPayment({ sessionData, query: `proposal=${checkoutProposalId}&option=1` });
  await paymentSubmit(other)(paymentValues); assert.equal(approveCalls(owner, other).length, 1);
  firstPost.reject({ response: { status: 403 } }); await first;
  assert.equal(proposalReceipt(sessionData), null); assert.ok(paymentText(owner).includes('Approval was rejected'));
  // Clearing the campaign lock is not a confirmation and does not revive old ready data.
  await paymentSubmit(other)(paymentValues); assert.equal(approveCalls(owner, other).length, 1);
  await elements(other.render()).find((n) => n.type === 'button' && n.props.children === 'Retry reading saved option').props.onClick(); await tick();
  assert.equal(approveCalls(owner, other).length, 1);
  await paymentSubmit(other)(paymentValues); assert.equal(approveCalls(owner, other).length, 2);
  const receipt = proposalReceipt(sessionData); assert.equal(receipt.status, 'completed'); assert.equal(receipt.optionIndex, 1); assert.notEqual(receipt.attemptId, firstId);
  await paymentSubmit(owner)(paymentValues); assert.equal(approveCalls(owner, other).length, 2);
});

test('stage 6 review late response cannot remove or overwrite a receipt belonging to another attempt', async () => {
  for (const outcome of ['success', 'refusal', 'unknown']) {
    const post = deferredPayment(); const f = await readyProposalPayment({ approve: () => post.promise });
    const pending = paymentSubmit(f)(paymentValues); await tick();
    const old = proposalReceipt(f.session);
    // Structural storage fixture for fencing: simulate a newer receipt, never a second allowed POST.
    const newer = { attemptId: 'another-attempt', optionIndex: 1, status: 'pending' };
    f.session.set(`proposalApprove:${checkoutProposalId}`, JSON.stringify(newer));
    await changePaymentOption(f, 1); await paymentSubmit(f)(paymentValues);
    if (outcome === 'success') post.resolve(); else post.reject(outcome === 'refusal' ? { response: { status: 403 } } : new Error('late network'));
    await pending;
    assert.deepEqual(proposalReceipt(f.session), newer); assert.notEqual(old.attemptId, newer.attemptId);
    assert.equal(approveCalls(f).length, 1); assert.equal(paymentText(f).includes('Proposal approved successfully'), false);
  }
});

test('stage 6 review a different Proposal can approve while the first is pending and late outcomes stay campaign-owned', async () => {
  for (const outcome of ['success', 'refusal', 'unknown']) {
    const sessionData = new Map(); const posts = [deferredPayment(), deferredPayment()];
    const a = await readyProposalPayment({ sessionData, approve: () => posts[0].promise });
    const b = await readyProposalPayment({ sessionData, query: `proposal=${checkoutProposalB}&option=1`, approve: () => posts[1].promise });
    const pendingA = paymentSubmit(a)(paymentValues); await tick(); const pendingB = paymentSubmit(b)(paymentValues); await tick();
    assert.equal(approveCalls(a, b).length, 2); assert.deepEqual(approveCalls(a, b).map((call) => call[1]), [checkoutProposalId, checkoutProposalB]);
    const bReceipt = sessionData.get(`proposalApprove:${checkoutProposalB}`);
    a.harness.unmount();
    if (outcome === 'success') posts[0].resolve(); else posts[0].reject(outcome === 'refusal' ? { response: { status: 403 } } : new Error('late network'));
    await pendingA;
    assert.equal(sessionData.get(`proposalApprove:${checkoutProposalB}`), bReceipt);
    assert.equal(proposalReceipt(sessionData)?.status ?? null, outcome === 'success' ? 'completed' : outcome === 'unknown' ? 'uncertain' : null);
    assert.equal(paymentText(b).includes('Proposal approved successfully'), false);
    posts[1].resolve(); await pendingB; assert.equal(proposalReceipt(sessionData, checkoutProposalB).status, 'completed');
    await paymentSubmit(b)(paymentValues); assert.equal(approveCalls(a, b).length, 2);
  }
});

test('stage 6 review older option-scoped pending/unknown/completed receipts cannot bypass campaign blocking after F5', async () => {
  for (const marker of ['pending', 'uncertain', 'completed']) {
    const sessionData = new Map([[`proposalApprove:${checkoutProposalId}:0`, marker]]);
    const f = await readyProposalPayment({ sessionData, query: `proposal=${checkoutProposalId}&option=1` });
    await paymentSubmit(f)(paymentValues);
    assert.equal(approveCalls(f).length, 0); assert.equal(f.calls.filter(([kind]) => kind === 'getProposal').length, 0);
    assert.equal(elements(f.render()).find((n) => n.type === f.FormPayment).props.submitButton.props.disabled, true);
  }
});


// Stage 7: raw /share uses placement _id (no private addedAccountsId/group snapshots).
const shareRead = load('src/client-side/pages/campaign-share/model/share-campaign-read.ts');
function rawShareExample(overrides = {}) {
  return {
    campaignId: 'ordinary-share', campaignName: 'Public saved campaign', status: 'pending', socialMedia: 'multipromo',
    price: 83, displayCurrency: 'GBP', creationDate: '04.02.26', totalFollowers: 300, totalImpressions: 200,
    cpm: 9.87, isPriceHidden: false, isCpmAndResultHidden: false,
    campaignContent: [
      { _id: 'content-one', socialMedia: 'instagram', socialMediaGroup: 'main', mainLink: 'https://example.test/one',
        descriptions: [{ _id: 'desc-one', description: 'description-one' }], additionalBrief: [{ _id: 'brief-one', additionalBrief: 'brief-one' }] },
      { _id: 'content-two', socialMedia: 'instagram', socialMediaGroup: 'main', profileType: 'creator', mainLink: 'https://example.test/two',
        descriptions: [{ _id: 'desc-two-a', description: 'description-two-a' }, { _id: 'desc-two-b', description: 'description-two-b' }],
        additionalBrief: [{ _id: 'brief-two-a', additionalBrief: 'brief-two-a' }, { _id: 'brief-two-b', additionalBrief: 'brief-two-b' }] },
    ],
    addedAccounts: [
      { _id: 'placement-one', accountId: 'social-same', socialAccountId: 'social-same', influencerId: 'influencer', socialMedia: 'instagram', username: 'same', publicPrice: 40, followers: 100,
        dateRequest: 'BEFORE:2026-12-01', selectedContent: { campaignContentItemId: 'content-one', descriptionId: 'desc-one', additionalBriefId: 'brief-one' },
        selectedContentItem: { _id: 'content-one', description: 'description-one', additionalBrief: 'brief-one' } },
      { _id: 'placement-two', accountId: 'social-same', socialAccountId: 'social-same', influencerId: 'influencer', socialMedia: 'instagram', username: 'same', publicPrice: 60, followers: 200,
        dateRequest: 'AFTER:2026-12-02', selectedContent: { campaignContentItemId: 'content-two', descriptionId: 'desc-two-b', additionalBriefId: 'brief-two-b' },
        selectedContentItem: { _id: 'content-two', description: 'description-two-b', additionalBrief: 'brief-two-b' } },
    ], ...overrides,
  };
}
function shareProposalExample(currency = 'GBP', price = 83) {
  const raw = rawShareExample();
  return { kind: 'proposal', campaignId: checkoutProposalId, campaignName: 'Saved Proposal', existingOptions: [0, 1],
    // Deliberately stale top-level money must never override selectedOption.
    price: 999, displayCurrency: 'EUR', selectedOption: { optionIndex: 0, price, displayCurrency: currency, canEdit: true,
      campaignContent: raw.campaignContent, addedBundles: [], selectedOffer: { offerId: 'offer', selectedAccountIds: ['social-same'], selectedAddedAccountsIds: ['placement-one'] },
      addedAccounts: raw.addedAccounts.map((row) => ({ ...row, addedAccountsId: row._id })) } };
}
function shareText(tree) {
  if (Array.isArray(tree)) return tree.map(shareText).join('');
  if (React.isValidElement(tree)) return shareText(tree.props.children);
  return typeof tree === 'string' || typeof tree === 'number' ? String(tree) : '';
}
function shareComponentFixture(kind) {
  const harness = hookHarness(); const mutations = []; const Row = () => {}; const Link = () => {}; const ButtonMain = () => {};
  const sort = load('src/client-side/hooks/use-followers-sort.ts', { react: harness.hooks });
  const groups = load('src/client-side/hooks/useGroupPromos.ts', { react: harness.hooks });
  const tableData = load('src/client-side/data/table-campaign.data.ts');
  const utils = { ...load('src/client-side/utils/getColumns.ts'), getAccountKey: (row) => row.addedAccountsId,
    getResultCPM: () => 'actual-hidden-result', calcGroupPrices: () => { mutations.push('legacy-price-calculation'); return { totalPublicPrice: 777 }; } };
  const legacy = { offer: {}, promoCard: [{ followers: 999 }], campaignContent: ['private'] };
  const stores = { useCampaignStore: () => legacy, useDraftCampaignStore: (selector) => selector({ getCampaignPrice: () => { mutations.push('legacy-draft-price'); return 777; } }),
    useProposalAccountsStore: (selector) => selector({ setAccountDateRequest: () => mutations.push('date mutation'), recentlyAddedKeysByOption: {} }) };
  const deps = {
    'react-toastify': { toast: { error: () => {}, success: () => {} } },
    react: harness.hooks, '@/client-side/hooks': { ...sort, ...groups }, '@/client-side/data/table-campaign.data': tableData,
    '@/client-side/utils': utils, '@/client-side/store': stores, 'react-router-dom': { Link, useNavigate: () => () => mutations.push('navigation') },
    '@/components': { ButtonMain }, '@/components/ui/modal-fix/Modal': { Modal: () => {} },
    '@/api/client/campaign/campaign.api': { postCampaignRequest: () => mutations.push('request edit') },
    '@/utils/functions/formatFollowers': { formatFollowers: (value) => String(value) },
    '@/shared/functions/formatCurrency.ts': load('src/shared/functions/formatCurrency.ts'),
    '@/client-side/pages/campaign-strategy/model/campaign-strategy.helpers.ts': load('src/client-side/pages/campaign-strategy/model/campaign-strategy.helpers.ts'),
    '@/client-side/widgets/campaign/components/eye-hide/eye-hide.tsx': { EyeHide: () => {} },
    '../card-table/table-card-strategy': { TableCard: Row }, '../card-table/table-card-proposal': { TableCard: Row }, '../card-table/table-card-insight': { TableCard: Row },
    '../campaign-table/table-proposal': { TableProposal: Row }, '../campaign-table/table-insight': { TableDistributingInsight: Row },
    '../live-view-card/live-view': { LiveViewCard: () => mutations.push('card mounted') },
    '../live-view-card/live-view-card-insight': { LiveViewCardInsight: () => mutations.push('card mounted') },
    '../model/live-view-content.helpers': load('src/client-side/widgets/campaign-share/model/live-view-content.helpers.ts'),
  };
  let Component;
  if (kind === 'bar') Component = load('src/client-side/ui/bar-table/bar.tsx', deps, { console: { log() {} } }).Bar;
  else if (kind === 'section') Component = load('src/client-side/ui/bar-table/bar-section.tsx', deps).BarSection;
  else if (kind === 'page') Component = load('src/client-side/widgets/campaign-share/table-pages/proposal-page-table.tsx', deps).ProposalCampaignPageShare;
  else Component = load(`src/client-side/widgets/campaign-share/campaign-table/table-${kind}.tsx`, deps, { console: { log() {} } })[kind === 'strategy' ? 'TableStrategy' : kind === 'proposal' ? 'TableProposal' : 'TableDistributingInsight'];
  const render = (props) => { const tree = harness.render(() => Component(props)); harness.flush(); return tree; };
  return { render, harness, mutations, Row, Link, ButtonMain, deps };
}
const shareTableProps = (campaign) => ({ campaign, items: campaign.campaignContent, networks: campaign.addedAccounts,
  totalPrice: campaign.price, displayCurrency: campaign.displayCurrency, group: 'main', canEdit: false, changeView: false, optionIndex: 0, title: 'Strategy' });
const shareStats = { postsCount: 2, videosCount: 2, visibleAccounts: [], visibleContent: [] };

test('stage 7 actual public query adapter preserves raw placement identity, all refs and optional fields without invented groups', async () => {
  const raw = rawShareExample(); const before = structuredClone(raw);
  const { useShareCampaignQuery } = load('src/client-side/react-query/useShareCampaignQuery.ts', {
    '@tanstack/react-query': { useQuery: (opts) => opts }, '@/api/client/campaign/campaign.api': { getShareLink: async () => ({ statusCode: 200, data: raw }) },
  });
  const saved = await useShareCampaignQuery(raw.campaignId).queryFn();
  assert.deepEqual(saved.addedAccounts.map((row) => row.addedAccountsId), ['placement-one', 'placement-two']);
  assert.deepEqual(raw, before); assert.notEqual(saved, raw);
  saved.addedAccounts.forEach((row, i) => { assert.equal(row._id, raw.addedAccounts[i]._id); assert.equal(row.selectedContent, raw.addedAccounts[i].selectedContent); });
  assert.equal(saved.campaignContent, raw.campaignContent); assert.equal(Object.hasOwn(saved, 'selectedOffer'), false); assert.equal(Object.hasOwn(saved, 'addedBundles'), false);
  assert.equal(saved.addedAccounts[1].selectedContent.additionalBriefId, 'brief-two-b');
});

test('stage 7 ordinary Strategy and Insights keep two placements of one social account, unique keys and reorder/sort/refetch ownership', () => {
  for (const kind of ['strategy', 'insight']) {
    const f = shareComponentFixture(kind); let campaign = shareRead.toPublicShareCampaign(rawShareExample());
    const render = () => f.render(kind === 'strategy' ? shareTableProps(campaign) : { campaign });
    const rows = (tree) => elements(tree).filter((node) => node.type === f.Row);
    let tree = render(); assert.equal(rows(tree).length, 2); assert.deepEqual(rows(tree).map((r) => r.key), ['placement:placement-one', 'placement:placement-two']);
    const initial = Object.fromEntries(rows(tree).map((r) => [r.key, structuredClone(r.props.data)]));
    const sortButton = elements(tree).find((n) => n.type === 'button' && n.props.title === 'Sort desc'); sortButton.props.onClick(); tree = render();
    assert.equal(rows(tree)[0].props.data.addedAccountsId, 'placement-two');
    const fresh = rawShareExample(); fresh.addedAccounts.reverse(); campaign = shareRead.toPublicShareCampaign(fresh); tree = render();
    for (const row of rows(tree)) { assert.deepEqual(row.props.data.selectedContent, initial[row.key].selectedContent); assert.equal(row.props.data.dateRequest, initial[row.key].dateRequest); }
    assert.deepEqual(f.mutations, []);
  }
});

test('stage 7 Proposal Strategy has placement keys through sorting/refetch and keeps complete saved rows without account dedupe', () => {
  const f = shareComponentFixture('proposal'); let saved = shareProposalExample().selectedOption;
  const render = () => f.render({ ...shareTableProps({ ...saved, campaignContent: saved.campaignContent }), networks: saved.addedAccounts });
  let tree = render(); const rows = (t) => elements(t).filter((n) => n.type === f.Row);
  assert.equal(rows(tree).length, 2); assert.equal(new Set(rows(tree).map((r) => r.key)).size, 2);
  elements(tree).find((n) => n.type === 'button' && n.props.title === 'Sort asc').props.onClick();
  saved = structuredClone(saved); saved.addedAccounts.reverse(); tree = render();
  assert.ok(rows(tree).every((r) => r.key === `placement:${r.props.data.addedAccountsId}`));
  assert.equal(rows(tree).find((r) => r.props.data.addedAccountsId === 'placement-two').props.data.selectedContent.descriptionId, 'desc-two-b');
  assert.equal(elements(tree).some((n) => n.type === f.Link), false);
});

test('stage 7 missing or duplicate lifecycle IDs retain all rows with UI-only positional fallback, never fabricated lifecycle IDs', () => {
  const raw = rawShareExample(); raw.addedAccounts.forEach((r) => { delete r._id; r.selectionId = 'draft-is-not-lifecycle'; });
  const saved = shareRead.toPublicShareCampaign(raw);
  assert.ok(saved.addedAccounts.every((r) => !r.addedAccountsId));
  for (const rows of [saved.addedAccounts, raw.addedAccounts.map((r) => ({ ...r, _id: 'duplicate-life' }))]) {
    const keyed = shareRead.sharePlacementRows(rows); assert.equal(keyed.length, 2); assert.equal(new Set(keyed.map((r) => r.key)).size, 2);
    assert.ok(keyed.every((r) => r.key.startsWith('unidentified:')));
  }
});

test('stage 7 Proposal header, every existing platform footer and Insights use saved EUR/USD/GBP without FX or private fallback', () => {
  for (const [currency, symbol] of [['EUR', '\u20ac'], ['USD', '$'], ['GBP', '\u00a3']]) {
    const campaign = shareProposalExample(currency, 83); const bar = shareComponentFixture('bar');
    const header = shareText(bar.render({ campaign, visibleStats: shareStats, readOnlyShare: true }));
    assert.ok(header.includes(`Budget: 83${symbol}`)); assert.equal(header.includes('999'), false); assert.deepEqual(bar.mutations, []);
    const page = shareComponentFixture('page');
    // Preserve campaign-total semantics for all existing groups: each footer uses the saved total.
    campaign.selectedOption.campaignContent.push({ _id: 'music', socialMedia: 'spotify', socialMediaGroup: 'music' }, { _id: 'press', socialMedia: 'press', socialMediaGroup: 'press' });
    const tree = page.render({ campaign, view: 1, flag: true, changeView: false });
    const tables = elements(tree).filter((n) => n.type === page.Row); assert.equal(tables.length, 3);
    for (const table of tables) {
      assert.equal(table.props.totalPrice, 83); assert.equal(table.props.displayCurrency, currency); assert.equal(table.props.canEdit, false);
      const footer = shareComponentFixture('proposal'); assert.ok(shareText(footer.render(table.props)).includes(`Price: 83${symbol}`));
    }
    const insight = shareComponentFixture('insight'); assert.ok(shareText(insight.render({ campaign })).includes(`83${symbol}`));
  }
});

test('stage 7 zero and unknown totals never become row sums or coerced zero; invalid option currency never falls back to top-level EUR', () => {
  for (const amount of [0, undefined, null, NaN, Infinity, -1, '83', '', {}]) for (const proposalMode of [false, true]) {
    const campaign = proposalMode ? shareProposalExample('USD', amount) : rawShareExample({ price: amount, displayCurrency: 'USD' });
    if (proposalMode) campaign.selectedOption.price = amount;
    const expected = amount === 0 ? '0$' : '\u2014';
    const bar = shareComponentFixture('bar'); assert.ok(shareText(bar.render({ campaign, visibleStats: shareStats, readOnlyShare: true })).includes(`Budget: ${expected}`));
    const insight = shareComponentFixture('insight'); const shown = shareText(insight.render({ campaign })); assert.ok(shown.includes(`price: ${expected}`)); assert.equal(shown.includes('100$'), false);
    const footer = shareComponentFixture(proposalMode ? 'proposal' : 'strategy');
    const saved = proposalMode ? campaign.selectedOption : campaign; assert.ok(shareText(footer.render(shareTableProps(saved))).includes(`Price: ${expected}`));
    if (!proposalMode) { const section = shareComponentFixture('section'); assert.ok(shareText(section.render({ campaign, readOnlyShare: true })).includes(`Budget: ${expected}`)); }
  }
  for (const currency of [undefined, null, '', 'CAD', 'usd']) {
    const campaign = shareProposalExample(currency, 83); campaign.selectedOption.displayCurrency = currency;
    const f = shareComponentFixture('bar'); const text = shareText(f.render({ campaign, visibleStats: shareStats, readOnlyShare: true }));
    assert.ok(text.includes('Budget: \u2014')); assert.equal(text.includes('83\u20ac'), false);
  }
});

test('stage 7 hidden price/CPM/result remain hidden in Share header/footer/Insights while private visibility callbacks keep their behavior', () => {
  const campaign = rawShareExample({ isPriceHidden: true, isCpmAndResultHidden: true });
  for (const kind of ['bar', 'section', 'strategy', 'insight']) {
    const f = shareComponentFixture(kind); const props = kind === 'strategy' ? shareTableProps(campaign) : { campaign, visibleStats: shareStats, readOnlyShare: true };
    const text = shareText(f.render(props)); assert.equal(text.includes('83'), false); assert.equal(text.includes('9.87'), false); assert.equal(text.includes('actual-hidden-result'), false);
  }
  const proposal = shareProposalExample(); proposal.isPriceHidden = true;
  const f = shareComponentFixture('proposal'); assert.equal(shareText(f.render({ ...shareTableProps(proposal.selectedOption), isPriceHidden: true })).includes('83'), false);
  const section = shareComponentFixture('section'); const updates = [];
  const tree = section.render({ campaign, canToggleVisibility: true, onVisibilityChange: (next) => updates.push(next) });
  const eyes = elements(tree).filter((n) => n.props.onToggle && typeof n.type === 'function'); assert.equal(eyes.length, 2); eyes[0].props.onToggle();
  assert.deepEqual(updates, [{ isPriceHidden: false, isCpmAndResultHidden: true }]);
});

test('stage 7 press descriptions safely render absent/null/empty without links and keep selected second populated URL normalization', () => {
  const f = hookHarness(); const Link = () => {};
  const Description = load('src/client-side/widgets/campaign-share/cells/strategy/description-cell.tsx', { react: f.hooks, 'react-router-dom': { Link }, '@/components/table-ui/dropdowns-table': {} }).DescriptionCell.type;
  const render = (descriptions, selectedPd = 0) => f.render(() => Description({ group: 'press', platformItems: [{ descriptions }], selectedContent: 0, selectedPd }));
  for (const value of [undefined, null, [], [{}], [{ description: null }], [{ description: '' }], [{ description: '  ' }]]) {
    const tree = render(value); assert.equal(elements(tree).some((n) => n.type === Link), false); assert.equal(shareText(tree), '\u2014');
  }
  for (const [value, normalized] of [['example.test/second', 'https://example.test/second'], ['http://example.test/second', 'http://example.test/second']]) {
    const tree = render([{ description: 'first' }, { description: value }], 1); assert.equal(elements(tree).find((n) => n.type === Link).props.to, normalized); assert.equal(shareText(tree), value);
  }
});

test('stage 7 Submitted reads real ordinary date, rejects invalid/calendar-overflow dates and never invents a Proposal timestamp; private Bar stays compatible', () => {
  for (const kind of ['bar', 'section']) {
    const f = shareComponentFixture(kind); const base = rawShareExample();
    const render = (campaign) => shareText(f.render({ campaign, visibleStats: shareStats, readOnlyShare: true }));
    assert.ok(render(base).includes('Feb 4, 2026'));
    assert.ok(render({ ...base, creationDate: undefined, createdAt: '2026-03-12T12:00:00Z' }).includes('Mar 12, 2026'));
    for (const creationDate of [undefined, null, '', 'bad-date', '31.02.26', '2026-02-30', '2026-13-01', 0]) {
      assert.ok(render({ ...base, creationDate }).includes('Submitted: \u2014'));
    }
    assert.ok(render(shareProposalExample()).includes('Submitted: \u2014'));
  }
  const privateBar = shareComponentFixture('bar');
  const text = shareText(privateBar.render({ campaign: { kind: 'draft', draftId: 'own', price: 0, displayCurrency: 'USD', createdAt: '2026-03-12T12:00:00Z' }, visibleStats: shareStats }));
  assert.ok(text.includes('Budget: 777$')); assert.ok(text.includes('Mar 12, 2026')); assert.ok(privateBar.mutations.includes('legacy-draft-price'));
});


function shareRowFixture(kind) {
  const harness = hookHarness(); const writes = []; const cells = {};
  for (const [file, exported] of [['network', 'NetworkCell'], ['followers', 'FollowersCell'], ['date', 'DateCell'], ['content', 'ContentCell'],
    ['description', 'DescriptionCell'], ['extra-fields-cells', 'ExtraFieldsCells'], ['countries', 'CountriesCell'], ['genres', 'GenresCell']]) {
    cells[`../cells/strategy/${file.endsWith('cells') ? file : `${file}-cell`}`] = { [exported]: exported };
  }
  const { TableCard } = load(`src/client-side/widgets/campaign-share/card-table/table-card-${kind}.tsx`, {
    react: harness.hooks, ...cells, '@/client-side/data/table-campaign.data': { ReqData: ['ASAP'] },
    '@/client-side/utils': { getAccountKey: (r) => r.addedAccountsId },
    '@/client-side/store': { useProposalAccountsStore: (selector) => selector({ recentlyAddedKeysByOption: {}, setAccountDateRequest: () => writes.push('write') }) },
  });
  const render = (data, items) => {
    const run = () => harness.render(() => TableCard.type({ data, items, group: 'main', columns: ['network','followers'], rowKey: data.addedAccountsId, activeDropdown: null, canEdit: false, changeView: false }));
    run(); harness.flush(); return run();
  };
  return { render, writes };
}

test('stage 7 real saved rows preserve independent dates and second content/description/brief through keyed reorder/refetch', () => {
  const ExtraFields = load('src/client-side/widgets/campaign-share/cells/strategy/extra-fields-cells.tsx', { react: { ...React, useMemo: (fn) => fn(), useCallback: (fn) => fn }, 'react-router-dom': { Link: 'a' } }).ExtraFieldsCells.type;
  for (const kind of ['strategy', 'proposal']) {
    const instances = new Map(); let raw = rawShareExample();
    for (const round of [0, 1]) {
      if (round) { raw = structuredClone(raw); raw.addedAccounts.reverse(); }
      const saved = shareRead.toPublicShareCampaign(raw);
      for (const { row, key } of shareRead.sharePlacementRows(saved.addedAccounts)) {
        if (!instances.has(key)) instances.set(key, shareRowFixture(kind));
        const fixture = instances.get(key); const tree = fixture.render(row, saved.campaignContent);
        const date = elements(tree).find((n) => n.type === 'DateCell'); assert.equal(date.props.canEdit, false);
        const which = row._id === 'placement-two' ? 1 : 0;
        assert.equal(date.props.selectedDate, which ? 'AFTER' : 'BEFORE'); assert.equal(date.props.customDate, which ? '2026-12-02' : '2026-12-01');
        const selected = elements(tree).find((n) => n.type === 'ContentCell'); const description = elements(tree).find((n) => n.type === 'DescriptionCell');
        assert.equal(selected.props.selectedContent, which); assert.equal(description.props.selectedPd, which);
        const extra = elements(tree).find((n) => n.type === 'ExtraFieldsCells'); const briefText = shareText(ExtraFields(extra.props));
        assert.ok(briefText.includes(which ? 'brief-two-b' : 'brief-one')); assert.deepEqual(fixture.writes, []);
      }
    }
  }
});

test('stage 7 raw public query cold loads and keyed refetches preserve placement rows after reversed responses and refresh errors', async () => {
  const reads = [];
  const { useShareCampaignQuery } = load('src/client-side/react-query/useShareCampaignQuery.ts', {
    '@tanstack/react-query': { useQuery: (opts) => opts }, '@/api/client/campaign/campaign.api': { getShareLink: (id) => {
      const request = deferredPayment(); reads.push({ id, ...request }); return request.promise.then((raw) => ({ statusCode: 200, data: raw }));
    } },
  });
  const client = new QueryClient(); const observer = new QueryObserver(client, useShareCampaignQuery('A', { retry: false })); const stop = observer.subscribe(() => {}); await tick();
  observer.setOptions(useShareCampaignQuery('B', { retry: false })); await tick();
  reads[1].resolve(rawShareExample({ campaignId: 'B' })); await tick(); reads[0].resolve(rawShareExample({ campaignId: 'A' })); await tick();
  assert.equal(observer.getCurrentResult().data.campaignId, 'B'); assert.equal(observer.getCurrentResult().data.addedAccounts.length, 2);
  const refetch = observer.refetch(); await tick(); reads[2].reject(new Error('refresh refused')); await refetch;
  assert.equal(observer.getCurrentResult().isError, true); assert.equal(observer.getCurrentResult().data.campaignId, 'B');
  const retry = observer.refetch(); await tick(); const fresh = rawShareExample({ campaignId: 'B' }); fresh.addedAccounts.reverse(); reads[3].resolve(fresh); await retry;
  assert.deepEqual(observer.getCurrentResult().data.addedAccounts.map((r) => r.addedAccountsId), ['placement-two','placement-one']);
  stop(); client.clear();
});

test('stage 7 active Share keeps table-only controls, exact option reads and read-only summary props; sorting/preview do not expose editing actions', async () => {
  const { store, pending } = fetchFixture(); let params = { id: checkoutProposalId, type: 'proposal' }; let harness = hookHarness(); let key;
  const hooks = Object.fromEntries(['useState','useMemo','useEffect'].map((name) => [name, (...args) => harness.hooks[name](...args)]));
  const UI = { Container() {}, Loader() {}, ButtonMain() {} }; const widgets = { CampaignTablePageShare() {}, ProposalCampaignPageShare() {} };
  const controls = { Bar() {}, BarSection() {}, ToggleTables() {}, ViewChange() {} }; const OptionsSlider = () => {};
  const { CampaignSharePage } = load('src/client-side/pages/campaign-share/campaig-share-page.tsx', {
    react: { ...React, ...hooks }, '@/components': UI, 'react-router-dom': { useParams: () => params },
    '@/client-side/react-query': { useShareCampaignQuery: () => ({ data: shareRead.toPublicShareCampaign(rawShareExample()), isLoading: false }) },
    '@/client-side/widgets': widgets, '@/client-side/store': { useFetchCampaign: store }, '@/client-side/ui': controls,
    '@/client-side/widgets/campaign-share/components/option-slider': { OptionsSlider },
    '@/client-side/pages/campaign-share/model/campaign-campaign.helpers.ts': { getVisibleCampaignStats: () => shareStats },
  });
  const render = () => { const wrapper = CampaignSharePage(); if (key !== wrapper.key) { key = wrapper.key; harness = hookHarness(); } const tree = harness.render(() => wrapper.type(wrapper.props)); harness.flush(); return tree; };
  render(); const dto = shareProposalExample(); pending[0].resolve({ campaignId: dto.campaignId, campaignName: dto.campaignName, socialMedia: 'multipromo', existingOptions: dto.existingOptions, selectedOption: dto.selectedOption }); await tick();
  let tree = render(); assert.equal(elements(tree).find((n) => n.type === controls.Bar).props.readOnlyShare, true);
  const page = shareComponentFixture('page');
  for (const label of ['Campaign Strategy','Campaign Insights','Advanced Insights']) {
    elements(tree).find((n) => n.type === 'button' && n.props.children === label).props.onClick(); tree = render();
    const props = elements(tree).find((n) => n.type === widgets.ProposalCampaignPageShare).props;
    assert.equal(props.view, 1); const inner = page.render(props);
    assert.equal(elements(inner).some((n) => n.type === 'textarea'), false); assert.equal(shareText(inner).includes('Request edit'), false);
    assert.ok(elements(inner).filter((n) => n.type === page.Row).every((n) => n.props.canEdit === false || n.props.campaign));
  }
  assert.deepEqual(page.mutations, []); assert.equal(pending.length, 1);
  elements(tree).find((n) => n.type === OptionsSlider).props.onClickOption(1); tree = render(); assert.equal(tree.type, UI.Loader); assert.equal(pending[1].option, 1);
  pending[1].resolve({ campaignId: dto.campaignId, existingOptions: [0,1], selectedOption: { ...dto.selectedOption, optionIndex: 1 } }); await tick(); render();
  params = { id: 'ordinary-share', type: 'instagram' }; tree = render();
  assert.equal(elements(tree).find((n) => n.type === controls.Bar).props.readOnlyShare, true);
  assert.equal(elements(tree).find((n) => n.type === widgets.CampaignTablePageShare).props.view, 1);
  const mode = elements(tree).find((n) => n.type === controls.ViewChange); assert.equal(mode.props.isProposal, false);
  const { ViewChange } = load('src/client-side/ui/view-change/view-change.tsx', { react: React });
  assert.equal(elements(ViewChange(mode.props)).some((n) => n.props.role === 'button'), false);
  const previewHarness = hookHarness(); const Modal = () => {}; let edits = 0;
  const Content = load('src/client-side/widgets/campaign-share/cells/strategy/content-cell.tsx', {
    react: previewHarness.hooks, '@/components/table-ui/dropdowns-table': {}, '@/components/ui/modal-fix/Modal': { Modal },
  }, { console: { log() {} } }).ContentCell.type;
  const previewProps = { group: 'main', platformItems: rawShareExample().campaignContent, selectedContent: 1, setSelectedContent: () => edits++, setSelectedPd: () => edits++ };
  let preview = previewHarness.render(() => Content(previewProps)); elements(preview).find((n) => n.type === 'span' && n.props.className === 'eye').props.onClick({ stopPropagation() {} });
  preview = previewHarness.render(() => Content(previewProps)); assert.equal(elements(preview).find((n) => n.type === 'input').props.readOnly, true); assert.equal(edits, 0);
});


test('manual fixes private Bar uses the current saved option money including zero and invalid currency', () => {
  const f = shareComponentFixture('bar');
  for (const [code, symbol] of [['USD','$'],['EUR','\u20ac'],['GBP','\u00a3']]) for (const price of [837,0]) {
    const campaign = { kind:'proposal', price:999, displayCurrency:'EUR', selectedOption:{ price, displayCurrency:code, addedAccounts:[], campaignContent:[] } };
    assert.ok(shareText(f.render({campaign, visibleStats:shareStats})).includes(`Budget: ${price}${symbol}`));
  }
  for (const selectedOption of [{price:null,displayCurrency:'USD'},{price:837},{price:NaN,displayCurrency:'GBP'}]) {
    assert.ok(shareText(f.render({campaign:{kind:'proposal',price:999,displayCurrency:'EUR',selectedOption},visibleStats:shareStats})).includes('Budget: \u2014'));
  }
});

test('manual fixes completed clone then live server-driven option renders release navigation lock', async () => {
  const f=await stage3ActionsFixture(); acceptOptionPosts(f);
  f.render().beginOptionCreate(); const create=f.render().onAddOption(true); await allowOptionCreate(f);
  f.pending[2].resolve(createdOption()); assert.equal(await create,true);
  const unsubscribe=f.fetch.subscribe((state)=>{if(state.data){f.adoptServerOption();f.render();}});
  for(const index of [0,7,0,7]) {
    const op=f.render().onClickOption(index); await tick();
    const dto=index===7?createdOption():stage3Proposal(); f.pending.at(-1).resolve(dto); await op;
    assert.equal(f.active,index); assert.deepEqual(f.setters.filter(x=>x[0]==='requesting').at(-1),['requesting',false]);
    assert.equal(f.render().needsProposalRead,false);
  }
  assert.equal(f.render().onAddInfluencer(7),true);
  acceptOptionPosts(f,{campaignId:'A',optionIndex:8}); assert.equal(f.render().beginOptionCreate(),true); const again=f.render().onAddOption(true); await tick();
  f.pending.at(-1).resolve(createdOption()); await tick(); f.pending.at(-1).resolve(createdOption(8)); await again;
  assert.equal(f.writes.filter(w=>w[0]==='post').length,2); unsubscribe();
});

test('manual fixes last option explicit confirmation, Cancel and permission; deletion is terminal after campaign absence is confirmed', async () => {
  const h=hookHarness(), Modal=()=>{}, ButtonMain=()=>{}, ButtonSecondary=()=>{}; let calls=0;
  const {OptionsSlider}=load('src/client-side/widgets/campaign/components/option-slider.tsx',{react:h.hooks,'@/components/ui/modal-fix/Modal':{Modal},'@/shared/ui':{ButtonMain,ButtonSecondary}});
  const render=(canEdit=true)=>h.render(()=>OptionsSlider({canEdit,optionIndexes:[0],activeOption:0,onClickOption(){},onDeleteOption:async()=>{calls++;return true;}}));
  assert.equal(elements(render(false)).some(n=>n.type==='img'&&n.props.onClick),false);
  elements(render()).find(n=>n.type==='img'&&n.props.onClick).props.onClick({stopPropagation(){}});
  assert.match(shareText(render()),/entire Proposal/);
  elements(render()).find(n=>n.props.text==='Cancel').props.onClick(); assert.equal(calls,0);
  elements(render()).find(n=>n.type==='img'&&n.props.onClick).props.onClick({stopPropagation(){}});
  await elements(render()).find(n=>n.props.text==='Delete').props.onClick(); assert.equal(calls,1);
  const f=await stage3ActionsFixture(); const only={...f.initial,kind:'proposal',existingOptions:[0]};
  f.builder.setState({proposalAddSession:{campaignId:'A'}});
  const deleting=f.render(only).onDeleteOption(0); await tick();
  f.pending.at(-1).reject({response:{status:404,data:{message:'Proposal campaign not found'}}});
  assert.equal(await deleting,true);
  assert.equal(f.builder.getState().proposalAddSession,null); assert.equal(f.writes.length,1); assert.equal(f.pending.length,2);
  assert.equal(f.fetch.getState().data,null); assert.equal(f.stores.useProposalAccountsStore.getState().currentCampaignId,null);
  assert.equal(f.navigation.at(-1),'/client'); assert.equal(await f.render(only).onDeleteOption(0),false);
  assert.equal(await f.fetch.getState().setProposalOption('A',0),null); assert.equal(f.pending.length,2);
  const other=f.fetch.getState().setProposalOption('B',0); assert.equal(await f.fetch.getState().setProposalOption('A',0),null);
  f.pending.at(-1).resolve(stage3Proposal('B',0)); assert.equal((await other).campaignId,'B'); assert.equal(f.fetch.getState().isLoading,false);
});

test('manual fixes deletion invalidates late GET and unknown deletion cannot be repeated', async()=>{
  const f=await stage3ActionsFixture(); const late=f.fetch.getState().setProposalOption('A',0);
  const only={...f.initial,kind:'proposal',existingOptions:[0]};
  f.builder.setState({proposalAddSession:{campaignId:'A'}});
  const deleting=f.render(only).onDeleteOption(0); await tick();
  f.pending.at(-1).reject({response:{status:404,data:{message:'Proposal campaign not found'}}});
  assert.equal(await deleting,true);
  assert.equal(f.builder.getState().proposalAddSession,null);
  f.pending[1].resolve(f.initial); assert.equal(await late,null); assert.equal(f.fetch.getState().data,null);
  const u=await stage3ActionsFixture(); u.api.deleteProposalOption=async()=>{u.writes.push(['delete']);throw new Error('timeout');};
  assert.equal(await u.render().onDeleteOption(2),false); assert.equal(u.render().needsProposalRead,true);
  assert.equal(await u.render().onDeleteOption(2),false); assert.equal(await u.render().retryProposalRead(),false);assert.equal(u.writes.length,1);
});


test('manual fixes Add Influencer catalogue wrapper has no cancel control and retains session hook', () => {
  const file='src/pages/client-side/campaign-creator-page/ui/campaign-creator-page.tsx';
  const deps=Object.fromEntries(ts.preProcessFile(fs.readFileSync(path.join(root,file),'utf8')).importedFiles.map(i=>[i.fileName,{}]));
  let paramsSeen;
  Object.assign(deps,{react:React,'react-router-dom':{useSearchParams:()=>[new URLSearchParams('mode=add-influencer&campaignId=A&option=0')]},
    '@/pages/client-side/campaign-post-content/model/use-proposal-add-influencer':{useProposalAddInfluencer:params=>{paramsSeen=params;return {requested:true,ready:true,cancel(){assert.fail('No cancel handler invoked');}};}}});
  const tree=load(file,deps).CampaignCreatorPage();
  assert.equal(elements(tree).some(n=>n.type==='button'),false); assert.equal(paramsSeen.get('campaignId'),'A'); assert.equal(paramsSeen.get('option'),'0');
});


test('delete review stale single-option UI does not tombstone a surviving Proposal', async()=>{
 const f=await stage3ActionsFixture();const only={...f.initial,kind:'proposal',existingOptions:[0]};
 const op=f.render(only).onDeleteOption(0);await tick();assert.deepEqual(f.writes[0],['delete','A',0]);
 const saved=stage3Proposal('A',0);saved.existingOptions=[0];saved.selectedOption.addedAccounts[0].addedAccountsId='surviving-server-placement';
 f.pending.at(-1).resolve(saved);assert.equal(await op,true);assert.equal(f.navigation.length,0);
 assert.equal(f.messages.some(([,m])=>m==='Proposal deleted successfully!'),false);
 assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[0][0].addedAccountsId,'surviving-server-placement');
 const reread=f.fetch.getState().setProposalOption('A',0);await tick();f.pending.at(-1).resolve(saved);assert.equal((await reread).campaignId,'A');
});

test('delete review stale multiple-options UI recognizes actual campaign removal and completes once',async()=>{
 const f=await stage3ActionsFixture();const op=f.render().onDeleteOption(0);await tick();
 f.pending.at(-1).reject({response:{status:404,data:{message:'Proposal campaign not found'}}});assert.equal(await op,true);
 assert.equal(f.navigation.at(-1),'/client');assert.equal(f.fetch.getState().data,null);
 assert.equal(await f.fetch.getState().setProposalOption('A',0),null);assert.equal(f.writes.length,1);
});

test('delete review failed control GET preserves known write and retries only reads; option 404 is not campaign proof',async()=>{
 for(const deleted of [false,true]){
  const f=await stage3ActionsFixture();const op=f.render().onDeleteOption(2);await tick();
  f.pending.at(-1).reject({response:{status:503,data:{message:'Read unavailable'}}});assert.equal(await op,false);
  assert.equal(f.render().needsProposalRead,true);assert.equal(f.navigation.length,0);assert.equal(f.stores.useProposalAccountsStore.getState().currentCampaignId,'A');
  assert.equal(await f.render().onDeleteOption(2),false);const retry=f.render().retryProposalRead();await tick();
  if(deleted)f.pending.at(-1).reject({response:{status:404,data:{message:'Proposal campaign not found'}}});
  else f.pending.at(-1).resolve({...stage3Proposal('A',0),existingOptions:[0,1]});
  assert.equal(await retry,true);assert.equal(f.writes.length,1);assert.equal(f.render().needsProposalRead,false);
 }
 const f=await stage3ActionsFixture();
 // Active option 2 makes the predicted post-delete target 1; server already has only index 0.
 const move=f.render().onClickOption(2);await tick();f.pending.at(-1).resolve(stage3Proposal('A',2));await move;
 const unsubscribe=f.fetch.subscribe(state=>{if(state.data){f.adoptServerOption();f.render();}});
 const op=f.render().onDeleteOption(2);await tick();assert.equal(f.pending.at(-1).option,1);
 f.pending.at(-1).reject({response:{status:404,data:{message:'Selected proposal campaign option not found'}}});await tick();assert.equal(f.pending.at(-1).option,0);
 f.pending.at(-1).resolve({...stage3Proposal('A',0),existingOptions:[0]});assert.equal(await op,true);assert.equal(f.navigation.length,0);assert.equal(f.active,0);
 assert.deepEqual(f.setters.filter(x=>x[0]==='requesting').at(-1),['requesting',false]);unsubscribe();
});


test('UX Proposal Content uses the ordinary Container and navigation region; loading is Loader, errors keep controls',()=>{
 const h=hookHarness(), UI={Container(){},Breadcrumbs(){},Loader(){}}, Page=()=>{}, Secondary=()=>{};const builder=builderFixture();
 builder.setState({totalPrice:22,totalPriceReady:true,selectedCurrency:'$',campaignName:'Saved title',blocksDraft:[{id:'kept-block'}]});
 let submitted;let add={ready:false,error:'',plan:{missingGroups:['main'],accounts:[{accountId:'new',source:'manual',selectionId:'occurrence-new'}]},session:{sessionId:'session-kept'},finish:p=>{submitted=p;return true;},backToSelection(){},cancel(){}};
 const {ProposalAddInfluencerContentRoute:Route}=load('src/pages/client-side/campaign-post-content/ui/proposal-add-influencer-content-route.tsx',{
  react:h.hooks,'react-router-dom':{useSearchParams:()=>[new URLSearchParams()]},'@/components':UI,'@/shared/ui':{ButtonSecondary:Secondary},
  '../model/use-proposal-add-influencer':{useProposalAddInfluencer:()=>add},[builderModule]:{useCampaignBuilderStore:builder},
  '@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page':{CampaignPostContentPage:Page}});
 const render=()=>h.render(()=>Route());assert.equal(render().type,UI.Loader);
 add={...add,error:'Permission denied'};assert.ok(elements(render()).find(n=>n.props.role==='alert'));
 add={...add,error:'',ready:true};let tree=render();assert.equal(tree.type,UI.Container);
 assert.equal(elements(tree).filter(n=>n.type===UI.Breadcrumbs).length,1);assert.equal(elements(tree).filter(n=>n.type===Secondary).length,0);
 assert.equal(elements(tree).some(n=>n.type==='button'),false);
 const page=elements(tree).find(n=>n.type===Page);assert.equal(page.props.currency,'$');assert.equal(page.props.defaultCampaignName,'Saved title');assert.equal(page.props.accounts[0].selectionId,'occurrence-new');assert.equal(page.props.accounts[0].socialAccountId,'new');
 const payload={campaignContent:[{_id:'kept-content'}],addedAccounts:[]};page.props.onSubmitPayload(payload);assert.equal(submitted,payload);
 builder.setState({totalPriceReady:false});tree=render();assert.ok(elements(tree).find(n=>n.props.role==='alert'));assert.equal(elements(tree).some(n=>n.type===UI.Loader),false);assert.equal(elements(tree).filter(n=>n.type===Secondary).length,2);
});

test('UX new-option Content uses Loader only for progress and keeps form mounted during background submit',()=>{
 const h=hookHarness(), UI={Container(){},Breadcrumbs(){},Loader(){}},Page=()=>{},builder=builderFixture();hydrateFixture(builder);
 let state={enabled:true,busy:false,finalizing:true,invalid:false,blocked:false,needsRead:false,submit(){}};
 const {CampaignPostContentDefaultRoute:Route}=load('src/pages/client-side/campaign-post-content/ui/campaign-post-content-route.tsx',{
  react:h.hooks,'react-router-dom':{useNavigate:()=>()=>{},useSearchParams:()=>[new URLSearchParams()]},'@/components':UI,
  '../model/use-create-option-from-builder':{useCreateOptionFromBuilder:()=>state},[builderModule+'.ts']:{useCampaignBuilderStore:builder},
  '@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page.tsx':{CampaignPostContentPage:Page}});
 const render=()=>h.render(()=>Route());assert.equal(render().type,UI.Loader);
 state={...state,finalizing:false,blocked:true};assert.equal(render().props.role,'alert');
 state={...state,blocked:false,needsRead:true};assert.ok(elements(render()).find(n=>n.props.children==='Retry reading option'));
 state={...state,needsRead:true,busy:true};assert.equal(elements(render()).some(n=>n.props.role==='alert'),false);assert.ok(elements(render()).find(n=>n.type===Page));state={...state,needsRead:false,busy:true};const tree=render();assert.equal(tree.type,UI.Container);assert.ok(elements(tree).find(n=>n.type===Page));assert.ok(elements(tree).find(n=>n.type===UI.Loader));assert.ok(elements(tree).find(n=>n.props.inert===true));
});

test('UX dirty delete confirmation Cancel leaves patches and every option unchanged without mutation',async()=>{
 const f=await stage3ActionsFixture();addReviewOption(f,1,true);
 const updates=f.stores.useUpdateCampaign;updates.getState().setField(f.initial.selectedOption.campaignContent[0]._id,'mainLink','https://cancel-keeps.test');
 const before=f.stores.useProposalAccountsStore.getState();const patches=updates.getState().patches;
 const h=hookHarness(),Main=()=>{},Secondary=()=>{};const {OptionsSlider}=load('src/client-side/widgets/campaign/components/option-slider.tsx',{react:h.hooks,'@/components/ui/modal-fix/Modal':{Modal(){}},'@/shared/ui':{ButtonMain:Main,ButtonSecondary:Secondary}});
 const page=stage3PageFixture(f);const render=()=>h.render(()=>OptionsSlider({canEdit:true,optionIndexes:[0,1],activeOption:0,onClickOption(){},onDeleteOption:page.controls().onDeleteOption}));
 elements(render()).find(n=>n.type==='img'&&n.props.onClick).props.onClick({stopPropagation(){}});elements(render()).find(n=>n.props.text==='Cancel').props.onClick();
 assert.equal(f.writes.length,0);assert.equal(updates.getState().patches,patches);assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption,before.accountsByOption);
});


test('UX Add Influencer catalogue uses the shared Loader and keeps permission errors explicit',()=>{
 const file='src/pages/client-side/campaign-creator-page/ui/campaign-creator-page.tsx';
 const deps=Object.fromEntries(ts.preProcessFile(fs.readFileSync(path.join(root,file),'utf8')).importedFiles.map(i=>[i.fileName,{}]));
 const Loader=()=>{},Container=()=>{},Breadcrumbs=()=>{},Link=()=>{};let state={requested:true,ready:false,error:''};
 Object.assign(deps,{react:React,'@/components':{Loader,Container,Breadcrumbs},'react-router-dom':{Link,useSearchParams:()=>[new URLSearchParams('mode=add-influencer')]},
 '@/pages/client-side/campaign-post-content/model/use-proposal-add-influencer':{useProposalAddInfluencer:()=>state}});
 const {CampaignCreatorPage:Page}=load(file,deps);assert.equal(Page().type,Loader);
 state={...state,error:'Unavailable option'};assert.equal(Page().type,Container);assert.ok(elements(Page()).find(n=>n.props.role==='alert'));assert.equal(elements(Page()).find(n=>n.type===Link).props.to,'/client');
 state={...state,error:'',ready:true};assert.equal(elements(Page()).some(n=>n.type==='button'),false);
});


test('UX existing Summary Edit Selection preserves Proposal session, composition and form across catalogue/Content',async()=>{
 const f=await stage3ActionsFixture();f.render().onAddInfluencer(0);const s=await prepareStage5(f);
 f.builder.getState().actions.togglePromoCard(stage5NewAccount('music','spotify'));
 const c=stage5ContentPage(f,s);c.render();c.harness.flush();const routeProps=c.page();
 const form=realContentFormFixture(f.builder,undefined,'add-influencer',routeProps.accounts);
 const block=form.form.getValues('blocks')[0];form.vm.onChangeField(block.id,'additionalBrief','Keep this entered brief');
 const accounts=f.builder.getState().selectedAccounts,offer=f.builder.getState().selectedOfferId;
 const params=new URLSearchParams(s.params);params.set('platform','instagram');params.set('genre','techno');
 const ph=hookHarness(),nav=[],Selection=()=>{};form.form.handleSubmit=cb=>()=>cb(form.form.getValues());
 const {CampaignPostContentPage:Page}=load('src/widgets/client-side/campaign-post-content/ui/campaign-post-content-page.tsx',{
  react:ph.hooks,'react-router-dom':{useNavigate:()=>url=>nav.push(url)},'react-hook-form':{FormProvider:()=>{}},
  '@components/ui/draft-button/draft-button.tsx':{DraftButton(){}},'@/shared/ui/modal-fix/Modal':{Modal(){}},'@/shared/ui':{ButtonMain(){},ButtonSecondary(){}},
  '@/constants/social-medias':{getSocialMediaIconPostContent:()=>''},'../model/use-campaign-post-content':{useCampaignPostContent:()=>form.vm},
  './campaign-post-content-block':{CampaignPostContentBlockView(){}},'./campaign-post-content-selection':{CampaignPostContentSelection:Selection},
  '@/pages/client-side/campaign-post-content/model/use-campaign-post-content-page-draft':{useCampaignPostContentPageDraft:()=>({})},[builderModule]:{useCampaignBuilderStore:f.builder}
 },{window:{location:{search:'?'+params}}});
 const tree=ph.render(()=>Page(routeProps));const summary=elements(tree).find(n=>n.type===Selection);assert.ok(summary);
 const RealSelection=load('src/widgets/client-side/campaign-post-content/ui/campaign-post-content-selection.tsx',{
  react:React,'../model/campaign-post-content.helpers':contentHelpers,'@/utils/functions/formatFollowers.ts':{formatFollowers:v=>String(v)},'@/constants/social-medias.ts':{getSocialMediaIconPostContent:()=>''}
 }).CampaignPostContentSelection;
 elements(RealSelection(summary.props)).find(n=>n.type==='button'&&String(n.props.children).trim()==='Edit Selection').props.onClick();
 const next=new URL(nav[0],'https://fixture.test');assert.equal(next.pathname,'/client/create-campaign');
 for(const key of ['campaignId','option','session','currency','mode','platform','genre'])assert.equal(next.searchParams.get(key),params.get(key));
 assert.equal(f.builder.getState().selectedAccounts,accounts);assert.equal(f.builder.getState().selectedOfferId,offer);
 const saved=f.builder.getState().blocksDraft;assert.equal(saved[0].fields.additionalBrief,'Keep this entered brief');form.harness.unmount();c.harness.unmount();
 const catalogue=stage5SessionFixture(f,{query:next.searchParams.toString()});await tick();catalogue.render();catalogue.harness.flush();assert.equal(catalogue.render().ready,true);assert.equal(f.builder.getState().blocksDraft,saved);
 const again=stage5ContentPage(f,catalogue);again.render();again.harness.flush();const props=again.page();assert.equal(props.defaultBlocks,saved);
 const reloaded=realContentFormFixture(f.builder,undefined,'add-influencer',props.accounts);assert.equal(reloaded.form.getValues('blocks')[0].fields.additionalBrief,'Keep this entered brief');
 for(const block of reloaded.form.getValues('blocks'))for(const description of block.fields.descriptions)if(!description.value.trim())reloaded.vm.onChangeDescription(block.id,description.id,'Filled new track title');
 props.onSubmitPayload(reloaded.vm.buildPayload());assert.equal(f.writes.length,0);assert.equal(again.navigation.at(-1),'/client/campaign');
 const save=f.render().updateProposalOption();await tick();assert.equal(f.writes[0][0],'patch');f.pending.at(-1).resolve(patchGetWithNewIds(f));assert.equal(await save,true);
});


function configuredClientRoutes() {
 const file='src/router/routes.ts';const deps=Object.fromEntries(ts.preProcessFile(fs.readFileSync(path.join(root,file),'utf8')).importedFiles.map(i=>[i.fileName,{}]));
 const Dashboard=()=>{},Details=()=>{};deps['@/pages/client-side/dashboard']={DashboardPage:Dashboard};deps['@/client-side/index.ts']={CampaignPage:Details};
 return {routes:load(file,deps).routes,Dashboard,Details};
}
test('delete navigation uses actual dashboard route and query key; invalid old path can consume a stored details redirect',async()=>{
 const {routes,Dashboard,Details}=configuredClientRoutes();const {matchRoutes}=require('react-router-dom');
 assert.equal(matchRoutes(routes,'/client').at(-1).route.component,Dashboard);assert.equal(matchRoutes(routes,'/client/campaign').at(-1).route.component,Details);assert.equal(matchRoutes(routes,'/client/dashboard'),null);
 const f=await stage3ActionsFixture();const query=load('src/entities/client-side/dashboard/api/campaign.queries.ts',{'@tanstack/react-query':{useInfiniteQuery:o=>o},'./campaign.api':{getCampaigns(){}}}).useInfiniteCampaignsQuery('all');
 f.queryClient.setQueryData(query.queryKey,{pages:[],pageParams:[]});
 const op=f.render().onDeleteOption(0);await tick();f.pending.at(-1).reject({response:{status:404,data:{message:'Proposal campaign not found'}}});assert.equal(await op,true);
 const destination=f.navigation.at(-1);assert.equal(matchRoutes(routes,destination).at(-1).route.component,Dashboard);assert.deepEqual(f.navigationOptions.at(-1),{replace:true});assert.equal(f.queryClient.getQueryState(query.queryKey).isInvalidated,true);
 const Navigate=()=>{};let cleared=false;const {PublicRoute}=load('src/router/components/PublicRoute.tsx',{'react-router-dom':{Navigate,useLocation:()=>({pathname:'/auth',search:''})},'../../contexts/AuthContext':{useAuth:()=>({accessToken:'fixture',isAuthReady:true})},'@/store/get-user':{useUser:()=>({user:{role:'client'}})},'@/shared/ui':{Loader(){}},'@/utils/functions/getPostAuthRedirect.ts':{getPostAuthRedirect:()=>'/client/campaign',clearPostAuthRedirect:()=>{cleared=true;}}});
 const redirect=PublicRoute({children:null});assert.equal(redirect.props.to,'/client/campaign');assert.equal(cleared,true);
});

test('delete navigation ActionCell and Proposal selectors return stable repeated snapshots after clear and missing option',async()=>{
 const f=await stage3ActionsFixture();const store=f.stores.useProposalAccountsStore;
 let checks=0;const checked=selector=>{const state=store.getState(),value=selector(state);for(let i=0;i<3;i++){assert.ok(Object.is(value,selector(state)),'Uncached selector snapshot');checks++;}return value;};
 const h=hookHarness();const {ActionCell}=load('src/client-side/widgets/campaign/cells/action-cells/delete-cell.tsx',{
  react:{...h.hooks,useContext:()=>({isMutationPending:false})},'@/client-side/store':{...f.stores,useProposalAccountsStore:checked},'@/client-side/utils':load('src/client-side/utils/get-id.ts'),'react-toastify':{toast:{error(){}}},
  '@/client-side/pages/campaign/model/proposal-actions-context':{ProposalActionsContext:{}},'@/components/ui/modal-fix/Modal':{Modal(){}},'@/shared/ui':{ButtonMain(){},ButtonSecondary(){}},
  '@/client-side/widgets/campaign/model/proposal-row-removal':removalDecisions,'@/client-side/widgets/campaign/model/proposal-overlap-removal':overlapDecisions});
 const render=optionIndex=>h.render(()=>ActionCell({data:f.initial.selectedOption.addedAccounts[0],optionIndex}));render(0);h.flush();
 const unsubscribe=store.subscribe(()=>render(0));store.getState().clearAll();render(0);render(99);unsubscribe();assert.ok(checks>50);
 const th=hookHarness();const {TableProposal}=load('src/client-side/widgets/campaign/tables/table-proposal.tsx',{react:{...th.hooks,useContext:()=>({})},'@/client-side/store':{useProposalAccountsStore:checked},'react-router-dom':{Link(){}},'../card-table/table-card-proposal':{TableCard(){}},'@/client-side/pages/campaign/model/proposal-actions-context':{ProposalActionsContext:{}},'@/client-side/data/table-campaign.data':{getTableColumnWidths:()=>({}),getTitle:()=>''},'@/client-side/hooks':{useFollowersSort:rows=>({sortedNetworks:rows,toggleFollowersSort(){}})},'@/client-side/utils':{getAccountKey:a=>a.addedAccountsId,getColumns:()=>[]}});
 th.render(()=>TableProposal({optionIndex:0,group:'main'}));
 const ph=hookHarness();const {ProposalCampaignPage}=load('src/client-side/widgets/campaign/table-pages/proposal-page-table.tsx',{react:ph.hooks,'@/client-side/store':{...f.stores,useProposalAccountsStore:checked},'@/client-side/hooks':{useGroupPromos:()=>({mainPromos:[],musicPromos:[],otherPromos:[]})},'../tables/table-proposal':{TableProposal(){}},'../live-view-card/live-view':{LiveViewCard(){}},'../live-view-card/live-view-card-insight':{LiveViewCardInsight(){}},'@/client-side/ui':{Bar(){}},'@/client-side/utils':{calcGroupPrices:()=>({groupPrices:{}})}});
 f.fetch.getState().forgetProposal('A');ph.render(()=>ProposalCampaignPage({campaign:{...f.initial,kind:'proposal'},view:-1}));ph.flush();assert.equal(store.getState().accountsByOption[0],undefined);
});

test('delete navigation tombstone prevents stale bootstrap hydration and redirects deleted details to real dashboard',async()=>{
 const f=await stage3ActionsFixture();const h=hookHarness(),nav=[];
 const {useCampaignPageBootstrap}=load('src/client-side/pages/campaign/model/use-campaign-page-bootstrap.ts',{react:h.hooks,'react-router-dom':{useLocation:()=>({key:'old-details'}),useNavigate:()=> (url,opts)=>nav.push([url,opts])},'@/client-side/store':f.stores,'./campaign-page.utils':{parseLastCampaignSession:()=>({id:'A',status:'proposal',optionIndex:0})}});
 const stale={...f.initial,kind:'proposal'};h.render(()=>useCampaignPageBootstrap(stale));
 f.fetch.getState().forgetProposal('A');f.stores.useProposalAccountsStore.getState().clearAll();h.flush();
 assert.equal(f.stores.useProposalAccountsStore.getState().accountsByOption[0],undefined);h.render(()=>useCampaignPageBootstrap(stale));
 const next=hookHarness();const again=load('src/client-side/pages/campaign/model/use-campaign-page-bootstrap.ts',{react:next.hooks,'react-router-dom':{useLocation:()=>({key:'back'}),useNavigate:()=> (url,opts)=>nav.push([url,opts])},'@/client-side/store':f.stores,'./campaign-page.utils':{parseLastCampaignSession:()=>({id:'A',status:'proposal',optionIndex:0})}}).useCampaignPageBootstrap;
 assert.equal(next.render(()=>again(stale)),null);next.flush();assert.deepEqual(nav.at(-1),['/client',{replace:true}]);assert.equal(f.pending.length,1);
});

test('delete navigation clears only related references and recovery links point to configured dashboard',async()=>{
 const previous=global.sessionStorage;
 try {
  for(const redirect of [{path:'/client/campaign'}, {path:'/client/campaign/payment?proposal=A&option=0'}, {path:'/client/campaign',campaignId:'B'}]){
   const data=new Map([['lastCampaign',JSON.stringify({id:'A',status:'proposal'})],['postAuthRedirect',JSON.stringify(redirect)]]);global.sessionStorage={getItem:k=>data.get(k)??null,removeItem:k=>data.delete(k)};
   const f=await stage3ActionsFixture();const op=f.render().onDeleteOption(0);await tick();f.pending.at(-1).reject({response:{status:404,data:{message:'Proposal campaign not found'}}});await op;
   assert.equal(data.has('lastCampaign'),false);assert.equal(data.has('postAuthRedirect'),redirect.campaignId==='B');
  }
  const f=await stage3ActionsFixture();f.api.deleteProposalOption=async()=>{throw new Error('unknown outcome');};await f.render().onDeleteOption(0);
  const page=stage3PageFixture(f);const links=elements(page.render()).filter(n=>n.type==='a'&&n.props.children==='Review dashboard');assert.ok(links.length);const {routes,Dashboard}=configuredClientRoutes();
  for(const link of links)assert.equal(require('react-router-dom').matchRoutes(routes,link.props.href).at(-1).route.component,Dashboard);
 }finally{global.sessionStorage=previous;}
});


// Structural pinned-backend fixtures, not captured HTTP responses.
test('test-deploy initial Proposal creation invalidates dashboard even when GET fails; retry only reads',async()=>{
 const client=new QueryClient();for(const status of ['proposal','ongoing','completed'])client.setQueryData(['dashboard-campaigns',status],{pages:[{campaigns:['cached']}],pageParams:[1]});client.setQueryData(['unrelated'],42);
 const b=builderFixture();hydrateFixture(b);const h=hookHarness();let posts=0,reads=0,fail=true;
 const Hook=load('src/widgets/client-side/campaign-tables/model/use-save-proposal.ts',{
 react:h.hooks,'@tanstack/react-query':{useQueryClient:()=>client},[builderModule]:{useCampaignBuilderStore:b},[strategyModule]:strategyPayloads,'react-toastify':{toast:{success(){},error(){}}},
 '@/entities/client-side/campaign-strategy-page/api/save-proposal.ts':{postCampaignProposal:async()=>{posts++;return{data:{data:{campaignId:'new',optionIndex:0}}};},getSavedProposal:async()=>{reads++;for(const status of ['proposal','ongoing','completed'])assert.equal(client.getQueryState(['dashboard-campaigns',status]).isInvalidated,true);if(fail)throw Error('read failed');return{data:{data:stage3Proposal('new')}};}}}).useSaveProposal;
 const render=()=>h.render(()=>Hook());render();h.flush();await render().saveProposal();assert.equal(render().proposalReadPending,true);assert.equal(posts,1);assert.equal(client.getQueryState(['unrelated']).isInvalidated,false);
 fail=false;await render().saveProposal();assert.equal(posts,1);assert.equal(reads,2);assert.equal(render().isProposalModalOpen,true);
 let lists=0;const observer=new QueryObserver(client,{queryKey:['dashboard-campaigns','proposal'],queryFn:async()=>{lists++;return{pages:[{campaigns:['new']}],pageParams:[1]};}});const unsubscribe=observer.subscribe(()=>{});await tick();assert.equal(lists,1);unsubscribe();client.clear();
});

test('test-deploy Advanced Insights Genres joins profile-specific arrays and safely labels unknown values',()=>{
 const Cell=load('src/client-side/widgets/campaign/cells/strategy/genres-cell.tsx').GenresCell;
 for(const data of [{profileType:'community',communityMusicGenres:['techno'],communityThemeTopics:['future-topic']},{profileType:'creator',creatorMusicGenres:['techno'],creatorContentFocus:['future-focus']},{profileType:'community',communityThemeTopics:['future-topic']},{profileType:'creator',creatorContentFocus:['future-focus']}]){
  const before=structuredClone(data);const expected=taxonomy.getAccountTaxonomyGroups(data).flatMap(g=>g.items).map(i=>i.label);
  assert.deepEqual(elements(Cell({data})).filter(n=>n.type==='li').map(n=>n.props.children),expected);assert.deepEqual(data,before);assert.ok(expected.length);
 }
});

function proposalContentCellFixture(f,key){
 const h=hookHarness(),errors=[],Main=()=>{},Secondary=()=>{};const s=f.stores.useProposalAccountsStore.getState(),row=s.accountsByOption[0].find(r=>r.addedAccountsId===key);
 const file='src/client-side/widgets/campaign/cells/editable-cells/content-edit-cell.tsx';const deps=Object.fromEntries(ts.preProcessFile(fs.readFileSync(path.join(root,file),'utf8')).importedFiles.map(i=>[i.fileName,{}]));
 Object.assign(deps,{react:{...h.hooks,memo:fn=>fn},'react-toastify':{toast:{error:e=>errors.push(e)}},'@/client-side/store':f.stores,'@/components':{ButtonMain:Main,ButtonSecondary:Secondary},'@/shared/ui/dropdowns/dropdowns-table':{Dropdown(){}},'@/shared/ui/modal-fix/Modal':{Modal(){}}});
 const Cell=load(file,deps).ContentCellEdit;
 const render=()=>h.render(()=>Cell({optionIndex:0,accountKey:key,selectedItem:s.contentByOption[0][0],socialMedia:row.socialMedia,group:'main',platformItems:s.contentByOption[0],selectedContent:0,isOpen:true,onClose(){},setSelectedPd(){},setSelectedContent(){throw Error('stale index setter must not run');}}));
 render();h.flush();return{render,errors,create(link){elements(render()).find(n=>n.props.className==='add-video').props.onClick();elements(render()).find(n=>n.type==='input'&&n.props.placeholder==='Paste video link...').props.onChange({target:{value:link}});elements(render()).find(n=>n.type===Main&&n.props.text==='Create').props.onClick();}};
}

test('test-deploy real Content dropdown assigns stable blank content atomically, then Save and Add Influencer use current refs',async()=>{
 const f=await stage3ActionsFixture();addReviewOption(f,1,true);const store=f.stores.useProposalAccountsStore;
 const before=store.getState(),snapshot=before.optionSnapshotsByIndex[0],other=before.accountsByOption[0][1],otherOption=before.contentByOption[1];
 const row=before.accountsByOption[0][0],ref=other.selectedCampaignContentItem;
 const cell=proposalContentCellFixture(f,row.addedAccountsId);let publications=0;
 const unsub=store.subscribe(s=>{publications++;const r=s.accountsByOption[0][0];assert.ok(s.contentByOption[0].find(c=>c._id===r.selectedCampaignContentItem.campaignContentItemId));});
 cell.create('https://example.test/new-video');unsub();assert.equal(publications,1);assert.deepEqual(cell.errors,[]);
 const after=store.getState(),item=after.contentByOption[0].at(-1),selected=after.accountsByOption[0][0].selectedCampaignContentItem;
 assert.match(item._id,/^[a-f0-9]{24}$/);assert.match(item.descriptions[0]._id,/^[a-f0-9]{24}$/);assert.equal(selected.campaignContentItemId,item._id);assert.equal(selected.descriptionId,item.descriptions[0]._id);
 assert.equal(item.mainLink,'https://example.test/new-video');assert.equal(item.taggedLink,'');assert.equal(item.taggedUser,'');assert.deepEqual(item.additionalBrief,[]);assert.deepEqual(item.descriptions,[{_id:selected.descriptionId,description:''}]);assert.equal(Object.hasOwn(selected,'additionalBriefId'),false);
 assert.equal(after.accountsByOption[0][1],other);assert.equal(after.accountsByOption[0][1].selectedCampaignContentItem,ref);assert.equal(after.contentByOption[1],otherOption);assert.equal(after.optionSnapshotsByIndex[0],snapshot);
 proposalDescriptionFixture(f,row.addedAccountsId).edit(0,'Filled original description');
 const save=f.render().updateProposalOption();await tick();const body=f.writes[0][3];assert.deepEqual(body.addedAccounts[0].selectedCampaignContentItem,selected);assert.equal(body.campaignContent.at(-1).descriptions[0].description,'Filled original description');
 f.pending.at(-1).resolve(reviewWriteGet(f,0));assert.equal(await save,true);
 assert.equal(f.render().onAddInfluencer(0),true);const add=await prepareStage5(f);assert.equal(add.render().ready,true);assert.equal(add.render().error,'');
 assert.equal(f.builder.getState().selectedAccounts[0].selectedCampaignContentItem.campaignContentItemId,item._id);
});

test('test-deploy invalid target/profile creation leaves content unchanged; blank input does not assign missing refs',async()=>{
 const f=await stage3ActionsFixture();const store=f.stores.useProposalAccountsStore;const before=store.getState();const row=before.accountsByOption[0][0],source=before.contentByOption[0][0];
 assert.throws(()=>store.getState().addContentForSocial(0,row.socialMedia,{mainLink:'new'},source._id,'missing'),/placement changed/);assert.equal(store.getState(),before);
 const cell=proposalContentCellFixture(f,row.addedAccountsId);cell.create(' ');assert.equal(store.getState(),before);
 store.setState({accountsByOption:{0:before.accountsByOption[0].map((r,i)=>i===0?{...r,profileType:'creator'}:r)}});
 const incompatible=store.getState();assert.throws(()=>incompatible.addContentForSocial(0,row.socialMedia,{mainLink:'new'},source._id,row.addedAccountsId),/profile/);assert.equal(store.getState(),incompatible);assert.equal(store.getState().accountsByOption[0][1],before.accountsByOption[0][1]);
});

test('test-deploy final standalone/whole Offer removal blocks empty option regardless of option count; never dispatches DELETE',async()=>{
 for(const offer of [false,true])for(const indexes of [[0],[0,1]]){
  const raw=stage3Proposal(),rows=offer?raw.selectedOption.addedAccounts.slice(0,2):raw.selectedOption.addedAccounts.slice(2);
  const decision=removalDecisions.decideProposalRowRemoval({targetAccount:rows[0],accounts:rows,selectedOffer:offer?raw.selectedOption.selectedOffer:null,optionIndexes:indexes});assert.equal(decision.kind,'block_last_option');let blocked=0;
  await removalDecisions.executeProposalRowRemovalDecision(decision,{onKeepOption(){throw Error('cannot empty option');},onDeleteOption(){throw Error('implicit DELETE forbidden');},onBlockLastOption(){blocked++;}});assert.equal(blocked,1);
 }
 const f=await stage3ActionsFixture();const s=f.stores.useProposalAccountsStore.getState();assert.throws(()=>proposalPatch.buildProposalOptionPatchBody({snapshot:s.optionSnapshotsByIndex[0],accounts:[],content:s.contentByOption[0],selectedOfferChange:null}),/at least one placement/);
 const decision=removalDecisions.decideProposalRowRemoval({targetAccount:s.accountsByOption[0][0],accounts:s.accountsByOption[0],selectedOffer:s.optionSnapshotsByIndex[0].selectedOffer,optionIndexes:[0]});assert.equal(decision.kind,'keep_option');assert.equal(decision.removalKind,'offer');assert.equal(decision.remainingAccountsCount,1);
});


function proposalDescriptionFixture(f,key){
 const tableH=hookHarness(),editorH=hookHarness(),ev={preventDefault(){},stopPropagation(){}};
 const editorFile='src/client-side/widgets/campaign/cells/editable-cells/descritpion-edit-cell.tsx';
 const Editor=load(editorFile,{react:{...editorH.hooks,memo:fn=>fn},'@/components/table-ui/dropdowns-table':{Dropdown(){}},'@/client-side/store':f.stores},{window:{setTimeout:fn=>{fn();return 1;},clearTimeout(){}},crypto:require('node:crypto').webcrypto}).DescriptionCellEdit;
 const tableFile='src/client-side/widgets/campaign/card-table/table-card-proposal.tsx';
 const deps=Object.fromEntries(ts.preProcessFile(fs.readFileSync(path.join(root,tableFile),'utf8')).importedFiles.map(i=>[i.fileName,{}]));
 Object.assign(deps,{react:{...tableH.hooks,memo:fn=>fn},'@/client-side/store':f.stores,'@/client-side/utils':load('src/client-side/utils/get-id.ts'),
 '../cells/editable-cells/descritpion-edit-cell':{DescriptionCellEdit:Editor}});
 const Table=load(tableFile,deps).TableCard;
 const props=()=>{const s=f.stores.useProposalAccountsStore.getState();const tree=tableH.render(()=>Table({data:s.accountsByOption[0].find(r=>r.addedAccountsId===key),rowKey:key,changeView:false,group:'main',items:s.contentByOption[0],canEdit:true,optionIndex:0,columns:[],onCloseDropdown(){},onToggleDropdown(){}}));tableH.flush();return elements(tree).find(n=>n.type===Editor).props;};
 const render=()=>editorH.render(()=>Editor({...props(),isOpen:true}));render();editorH.flush();
 const rows=()=>elements(render()).filter(n=>n.type==='li'&&n.props.className==='desc-li');
 return{render,rows,edit(i,text){rows()[i].props.onDoubleClick(ev);elements(render()).find(n=>n.type==='input'&&!n.props.placeholder).props.onChange({target:{value:text}});elements(render()).find(n=>n.type==='input'&&!n.props.placeholder).props.onBlur();},
 add(text){elements(render()).find(n=>n.props.className==='add-desc').props.onClick(ev);elements(render()).find(n=>n.type==='input'&&n.props.placeholder).props.onChange({target:{value:text}});elements(render()).find(n=>n.type==='input'&&n.props.placeholder).props.onKeyDown({...ev,key:'Enter'});},
 remove(i){elements(rows()[i]).find(n=>n.type==='img'&&n.props.className==='trash').props.onClick(ev);elements(elements(rows()[i]).find(n=>n.props.className==='confirm-delete')).find(n=>n.type==='img').props.onClick(ev);}};
}

test('description Save validates all serialized variants by content ID; second selection does not hide empty first',async()=>{
 const f=await stage3ActionsFixture();addReviewOption(f,1,true);const store=f.stores.useProposalAccountsStore;
 const before=store.getState(),otherRows=before.accountsByOption[1],otherContent=before.contentByOption[1],neighbor=before.accountsByOption[0][1],snapshot=before.optionSnapshotsByIndex[0];
 const key=before.accountsByOption[0][0].addedAccountsId;proposalContentCellFixture(f,key).create('https://example.test/second-description');
 const created=store.getState().contentByOption[0].at(-1),first=created.descriptions[0]._id;const editor=proposalDescriptionFixture(f,key);
 editor.add('Chosen second text');const patched=f.stores.useUpdateCampaign.getState().patches[created._id].descriptions;
 assert.equal(patched.length,2);assert.deepEqual(patched[0],{_id:first,description:''});assert.equal(patched[1].description,'Chosen second text');
 assert.equal(store.getState().accountsByOption[0][0].selectedCampaignContentItem.descriptionId,patched[1]._id);
 assert.equal(await f.render().updateProposalOption(),false);assert.equal(f.writes.length,0);
 assert.match(f.messages.at(-1)[1],new RegExp('content ID '+created._id));assert.match(f.messages.at(-1)[1],/Video 2.*description 1 is empty.*Fill it in or delete/);
 assert.deepEqual(f.stores.useUpdateCampaign.getState().patches[created._id].descriptions,patched);assert.equal(store.getState().optionSnapshotsByIndex[0],snapshot);
 assert.equal(store.getState().accountsByOption[0][1],neighbor);assert.equal(store.getState().accountsByOption[1],otherRows);assert.equal(store.getState().contentByOption[1],otherContent);
 editor.remove(0);const selected=store.getState().accountsByOption[0][0].selectedCampaignContentItem;assert.equal(selected.descriptionId,patched[1]._id);
 const save=f.render().updateProposalOption();await tick();assert.equal(f.writes.length,1);const transported=f.writes[0][3].campaignContent.find(c=>c._id===created._id);
 assert.deepEqual(transported.descriptions,[patched[1]]);assert.equal(f.writes[0][3].addedAccounts[0].selectedCampaignContentItem.descriptionId,patched[1]._id);
 f.pending.at(-1).resolve(reviewWriteGet(f,0));assert.equal(await save,true);assert.equal(f.render().onAddInfluencer(0),true);const s=await prepareStage5(f);assert.equal(s.render().ready,true);
});

test('description preflight checks unselected content and uses platform/profile-local label, not global array index',async()=>{
 const f=await stage3ActionsFixture();const store=f.stores.useProposalAccountsStore,s=store.getState();const key=s.accountsByOption[0][0].addedAccountsId;
 const base=s.contentByOption[0][0];store.setState({contentByOption:{0:[base,{...structuredClone(base),_id:'000000000000000000000977',profileType:'creator'}]}});
 proposalContentCellFixture(f,key).create('https://example.test/content-at-index-two');const created=store.getState().contentByOption[0][2];
 proposalDescriptionFixture(f,key).edit(0,'Edited original text');
 assert.deepEqual(f.stores.useUpdateCampaign.getState().patches[created._id].descriptions,[{_id:created.descriptions[0]._id,description:'Edited original text'}]);
 const body=proposalPatch.buildProposalOptionPatchBody({snapshot:s.optionSnapshotsByIndex[0],accounts:store.getState().accountsByOption[0],content:store.getState().contentByOption[0],patches:f.stores.useUpdateCampaign.getState().patches});
 assert.equal(body.campaignContent[2]._id,created._id);assert.equal(body.campaignContent[2].descriptions[0].description,'Edited original text');proposalPatch.assertProposalPatchDescriptions(body.campaignContent);
 // A second unused blank variant is still transmitted and must be fixed explicitly.
 const editor=proposalDescriptionFixture(f,key);editor.add('Selected third text');const patches=f.stores.useUpdateCampaign.getState().patches;
 const texts=patches[created._id].descriptions;f.stores.useUpdateCampaign.getState().setDescriptions(created._id,[{...texts[0],description:'   '},texts[1]]);
 assert.equal(await f.render().updateProposalOption(),false);assert.equal(f.writes.length,0);assert.match(f.messages.at(-1)[1],/Video 2.*description 1 is empty/);
 // Both normal Save and batch Save use the same final payload check.
 assert.equal(await f.render().saveDirtyProposalOptions(),false);assert.equal(f.writes.length,0);
 assert.equal(store.getState().accountsByOption[0][0].selectedCampaignContentItem.descriptionId,texts[1]._id);
});

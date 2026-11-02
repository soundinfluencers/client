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

const tick = () => new Promise(setImmediate);
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
function reactHarness() {
  let cursor = 0, effects = []; const slots = [];
  const changed = (a, b) => !a || !b || a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]));
  const react = { ...React,
    useState(initial) { const n = cursor++; if (!slots[n]) slots[n] = { value: typeof initial === 'function' ? initial() : initial }; return [slots[n].value, next => { slots[n].value = typeof next === 'function' ? next(slots[n].value) : next; }]; },
    useRef(initial) { const n = cursor++; if (!slots[n]) slots[n] = { current: initial }; return slots[n]; },
    useMemo(fn, deps) { const n = cursor++; if (!slots[n] || changed(slots[n].deps, deps)) slots[n] = { value: fn(), deps }; return slots[n].value; },
    useEffect(fn, deps) { const n = cursor++; if (!slots[n] || changed(slots[n].deps, deps)) { const previous = slots[n]; slots[n] = { deps }; effects.push(() => { previous?.cleanup?.(); slots[n].cleanup = fn(); }); } },
    useSyncExternalStore(_subscribe, get) { return get(); },
  };
  react.useCallback = (fn, deps) => react.useMemo(() => fn, deps);
  return { react, render(fn) { cursor = 0; effects = []; const value = fn(); effects.splice(0).forEach(f => f()); return value; }, unmount() { slots.forEach(s => s?.cleanup?.()); } };
}
const validResults = extra => ({ postLink: 'https://example.test/post', datePost: '01/11/2026', screenshotUrl: 'https://example.test/saved.png', impressions: 100, like: 0, comments: 0, shares: 0, saves: 0, ...extra });
const failure = code => ({ response: { status: code, data: { message: `HTTP ${code}` } } });

function writeFixture({ gate = false, existing, ownerSource } = {}) {
  const h = reactHarness(), cache = new QueryClient(), calls = { reads: [], decisions: [], completions: [], balance: [], patched: [], invalidations: [], navigations: [], errors: [], successes: [], mutationOptions: [] };
  let owner = ownerSource?.owner() ?? { epoch: 1, active: true }, user = { firstName: 'Same name', role: 'influencer', balance: 1, logoUrl: 'current-logo' };
  let location = { key: 'page-A', pathname: '/influencer/promos/distributing', search: '?campaignId=' + id(100) + '&addedAccountsId=' + id(1), hash: '#submit' };
  const api = {
    detailed: async args => {
      calls.reads.push(args); const n = parseInt(args.addedAccountsId ?? id(1), 16);
      if (args.status === 'new') return [read.readDetailedPromos([fresh(n, { campaignId: args.campaignId ?? id(100) })], 'new')[0]];
      return read.readDetailedPromos([{ campaignId: args.campaignId ?? id(100), addedAccountsId: id(n), username: 'account', accountSocialMedia: 'instagram', isPaused: false, confirmation: 'accept', closedStatus: args.status === 'close' ? 'close' : 'wait', statusCampaign: 'distributing', reward: 99 }], args.status);
    },
    decision: async body => { calls.decisions.push(body); },
    completion: async (body, context) => { calls.completions.push({ body, context }); return 99; },
    readBalance: async () => { calls.balance.push(true); return 10; },
    sync: async () => {}, invalidate: async () => {},
  };
  const deps = { react: h.react, '@/shared/config/bundle-availability': { BUNDLES_AVAILABLE: gate },
    '@/shared/auth/reader-session': { getReaderSession: () => ownerSource?.owner() ?? owner, useReaderSession: () => ownerSource?.owner() ?? owner },
    'react-router-dom': { useLocation: () => location, useNavigate: () => (...args) => calls.navigations.push(args) },
    '@tanstack/react-query': { useMutation: options => {
      calls.mutationOptions.push(options);
      const value = h.react.useRef({ isPending: false, variables: undefined });
      return { ...value.current, mutateAsync: async variables => {
        value.current = { isPending: true, variables }; let data, error;
        try { data = await options.mutationFn(variables); await options.onSuccess?.(data, variables); return data; }
        catch (e) { error = e; await options.onError?.(e, variables); throw e; }
        finally { await options.onSettled?.(data, error, variables); value.current.isPending = false; }
      } };
    }, useQueryClient: () => ({ cancelQueries: f => cache.cancelQueries(f), setQueriesData: (f,u) => cache.setQueriesData(f,u), getQueriesData: f => cache.getQueriesData(f), getQueryData: k => cache.getQueryData(k), setQueryData: (k,v) => cache.setQueryData(k,v), invalidateQueries: async args => { calls.invalidations.push(args); await api.invalidate(); }, refetchQueries: async args => { calls.invalidations.push(args); await api.sync(); } }) },
    '@components/form/render-fields/FormFields.tsx': { FormFields: dummy },
    '@/api/influencer/promos/influencer-promos.api': { createInfluencerPromoReview: (body, group) => api.completion(body, group), conformationInfluencerPromo: body => api.decision(body) },
    '@/api/error.api': { handleApiError: error => calls.errors.push(error) },
    '@/api/error.api.ts': { handleApiError: error => calls.errors.push(error) },
    'react-toastify': { toast: { success: text => calls.successes.push(text) } },
    '@/store/get-user': { useUser: { getState: () => ({ user, patchUser: patch => { user = { ...user, ...patch }; calls.patched.push(user); } }) } },
    '@components/ui/modal-fix/Modal.tsx': { Modal: dummy },
    '@/pages/influencer/promos/hooks/useDetailedPromos.ts': { useDetailedPromos: args => ({ data: { promos: read.readDetailedPromos([fresh(parseInt(args.addedAccountsId ?? id(1), 16), { campaignId: args.campaignId ?? id(100) })], 'new') }, refetch() {} }) },
  };
  const load = harness(deps); const read = load(p + 'model/promo-read.ts');
  const runtime = existing ?? load(p + 'model/promo-write.ts').createPromoWrites({ session: () => ownerSource?.owner() ?? owner, detailed: a => api.detailed(a), decision: b => api.decision(b), completion: (b, g) => api.completion(b, g), readBalance: () => api.readBalance(), patchBalance: balance => { user = { ...user, balance }; calls.patched.push(user); } });
  deps['../model/promo-write-runtime'] = { promoWrites: runtime };
  // harness copies dependencies: its loader observes this stable forwarded object.
  const bound = harness({ ...deps, '../model/promo-write-runtime': { promoWrites: runtime } });
  const confirm = bound(p + 'new-promos/hooks/useConfirmInfluencerPromo.ts').useConfirmInfluencerPromo;
  const completion = bound(p + 'distributing/components/campaign-result-form/model/use-promo-completion.ts').usePromoCompletion;
  let state = { campaignId: id(100), addedAccountsId: id(1), username: 'old-history-name', meta: 'instagram' };
  return { h, cache, calls, api, runtime, load: bound, read,
    owner: () => owner, user: () => user, setUser: next => { user = next; },
    switchUser() { owner = { epoch: owner.epoch + 1, active: true }; user = { firstName: 'Same name', role: 'influencer', balance: 500, logoUrl: 'new-logo' }; },
    move(next = {}) { location = { ...location, key: 'page-B', ...next }; },
    state: () => state, setState(next) { state = { ...state, ...next }; },
    decision: () => h.render(() => confirm()),
    completion: () => h.render(() => completion(state, () => calls.navigations.push('success'))),
    form() { const Component = bound(p + 'distributing/components/campaign-result-form/CampaignResultForm.tsx').CampaignResultForm; return h.render(() => Component({ submitState: state })); },
    newPage() { const Component = bound(p + 'new-promos/NewPromos.tsx').NewPromos; return h.render(() => Component()); },
  };
}
const request = n => ({ campaignId: id(100), addedAccountsId: id(n), username: 'history', campaignResponse: 'accept' });

test('direct New mutation locks only its placement and chosen action; void PATCH success precedes failed background reads', async () => {
  const f = writeFixture(), wait = deferred(); let modal = 0;
  f.api.decision = async body => { f.calls.decisions.push(body); return wait.promise; };
  f.api.sync = async () => { throw failure(503); };
  const hook = f.decision(), pending = hook.mutate(request(1), { onSuccess: () => modal++ });
  await hook.mutate({ ...request(1), campaignResponse: 'decline' });
  assert.equal(f.calls.decisions.length, 1); assert.equal(f.calls.reads.length, 0);
  assert.deepEqual(f.decision().stateFor(request(1)), { isPending: true, variables: request(1) });
  assert.equal(f.decision().stateFor(request(2)).isPending, false);
  wait.resolve(); await pending; await tick();
  assert.equal(modal, 1); assert.equal(f.calls.errors.length, 0); assert.equal(f.calls.decisions.length, 1);
  assert.equal(f.decision().stateFor(request(1)).isPending, false); assert.equal(f.runtime.all().length, 0);
  assert.equal(f.calls.mutationOptions.every(options => options.retry === false), true);
});

test('direct New mutation preserves cache on PATCH error and unlocks an explicit subsequent action without GET recovery', async () => {
  for (const error of [failure(400),failure(403),failure(409),failure(500),new Error('Timeout')]) {
    const f = writeFixture(); let success = 0;
    const key = ['detailedPromos','new',null,null,12,1], data = { pages: [{ items: [fresh(1),fresh(2)], baseCount: 2 }], pageParams: [1] };
    f.cache.setQueryData(key, data);
    f.api.decision = async body => { f.calls.decisions.push(body); throw error; };
    await f.decision().mutate(request(1), { onSuccess: () => success++ }); await tick();
    assert.equal(f.calls.decisions.length, 1); assert.equal(f.calls.reads.length, 0); assert.equal(success, 0);
    assert.deepEqual(f.calls.errors, [error]); assert.deepEqual(f.cache.getQueryData(key), data);
    assert.equal(f.decision().stateFor(request(1)).isPending, false);
    f.api.decision = async body => { f.calls.decisions.push(body); };
    await f.decision().mutate({ ...request(1), campaignResponse: 'decline' }, { onSuccess: () => success++ });
    assert.equal(success, 1); assert.deepEqual(f.cache.getQueryData(key).pages[0].items.map(row => row.addedAccountsId), [id(2)]);
  }
});

test('direct New hook owns page/auth/unmount results without page-level duplicated guards', async () => {
  for (const transition of ['page','auth','unmount']) for (const outcome of ['success','error']) {
    const f = writeFixture(), wait = deferred(); let modal = 0;
    f.api.decision = async body => { f.calls.decisions.push(body); return wait.promise; };
    const pending = f.decision().mutate(request(1), { onSuccess: () => modal++ });
    if (transition === 'page') { f.move(); f.decision(); }
    if (transition === 'auth') { f.switchUser(); f.decision(); }
    if (transition === 'unmount') f.h.unmount();
    if (outcome === 'success') wait.resolve(); else wait.reject(failure(500));
    await pending;
    assert.equal(modal, 0); assert.equal(f.calls.errors.length, 0);
    assert.equal(f.calls.invalidations.length, outcome === 'success' && transition !== 'auth' ? 2 : 0);
  }
});

test('concurrent New cards keep independent pending indicators and exact Offer placement identities', async () => {
  const f = writeFixture(), requests = [];
  f.api.decision = async body => { const wait = deferred(); requests.push({ body, ...wait }); return wait.promise; };
  const first = f.decision().mutate(request(1)), second = f.decision().mutate({ ...request(2), campaignResponse: 'decline' });
  assert.equal(requests.length, 2);
  assert.equal(f.decision().stateFor(request(1)).variables.campaignResponse, 'accept');
  assert.equal(f.decision().stateFor(request(2)).variables.campaignResponse, 'decline');
  requests[1].resolve(); await second; assert.equal(f.decision().stateFor(request(1)).isPending, true);
  requests[0].resolve(); await first; assert.equal(f.decision().stateFor(request(1)).isPending, false);
  assert.deepEqual(requests.map(row => row.body.addedAccountsId), [id(1),id(2)]);
});

test('New internal URL change does not unlock an already pending placement or leave its next context stuck', async () => {
  const f = writeFixture(), wait = deferred(); let success = 0;
  f.api.decision = async body => { f.calls.decisions.push(body); return wait.promise; };
  const pending = f.decision().mutate(request(1), { onSuccess: () => success++ });
  f.move({ search: '' });
  assert.equal(f.decision().stateFor(request(1)).isPending, true);
  await f.decision().mutate({ ...request(1), campaignResponse: 'decline' }); assert.equal(f.calls.decisions.length, 1);
  wait.resolve(); await pending;
  assert.equal(success, 0); assert.equal(f.decision().stateFor(request(1)).isPending, false);
});

test('confirmed New cache removal preserves infinite pages, baseCount, separate placements, groups and foreign epochs', async () => {
  const client = new QueryClient(), load = harness();
  const remove = load(p + 'new-promos/hooks/remove-confirmed-new-promo.ts').removeConfirmedNewPromo;
  const pinned = ['detailedPromos','new',id(100),id(99),12,1], unpinned = ['detailedPromos','new',null,null,12,1];
  const rows = [fresh(99), ...Array.from({ length: 12 }, (_, n) => fresh(n + 1))];
  const data = { pages: [{ items: rows, baseCount: 12 }, { items: [fresh(13),bundle()], baseCount: 2 }], pageParams: [1,2] };
  client.setQueryData(pinned, data); client.setQueryData([...unpinned.slice(0,-1),2], data);
  remove(client, request(99), 1);
  const saved = client.getQueryData(pinned), seeded = client.getQueryData(unpinned);
  assert.deepEqual(saved.pageParams, [1,2]); assert.equal(saved.pages[0].baseCount, 12); assert.equal(saved.pages[0].items.length, 12);
  assert.deepEqual(seeded, saved); assert.equal(client.getQueryData([...unpinned.slice(0,-1),2]).pages[0].items.length, 13);
  remove(client, request(1), 1);
  assert.equal(client.getQueryData(unpinned).pages[0].items.some(row => row.addedAccountsId === id(2)), true);
  assert.equal(client.getQueryData(unpinned).pages[1].items.some(row => row.campaignBundleId === id(400)), true);
  remove(client, { campaignId: id(100), campaignBundleId: id(400), selectedAddedAccountsIds: [id(1),id(2)], campaignResponse: 'decline' }, 1);
  assert.equal(client.getQueryData(unpinned).pages[1].items.length, 1);
  assert.equal(client.getQueryData(unpinned).pages[0].items.some(row => row.addedAccountsId === id(2)), true);
  const late = deferred();
  const oldRead = client.fetchQuery({ queryKey: unpinned, queryFn: () => late.promise }).catch(() => {});
  remove(client, request(2), 1); late.resolve(data); await oldRead; await tick();
  assert.equal(client.getQueryData(unpinned).pages[0].items.some(row => row.addedAccountsId === id(2)), false);
  client.clear();
});

test('main-style completion sends exact history placement once without initial/preflight/synchronization GET', async () => {
  const f = writeFixture(), pending = deferred();
  f.api.completion = async (body, context) => { f.calls.completions.push({ body, context }); return pending.promise; };
  const hook = f.completion(); assert.equal(hook.isPending, false); assert.equal(f.calls.reads.length, 0);
  const first = hook.submit(validResults()); await hook.submit(validResults());
  assert.equal(f.calls.completions.length, 1); assert.equal(f.completion().isPending, true);
  assert.deepEqual(Object.keys(f.calls.completions[0].body).sort(), ['addedAccountsId','campaignId','data','username']);
  assert.equal(f.calls.completions[0].body.addedAccountsId, id(1)); assert.equal(f.calls.completions[0].body.username, 'old-history-name');
  assert.equal(f.calls.completions[0].context, undefined);
  f.setUser({ ...f.user(), logoUrl: 'changed-while-writing' }); pending.resolve(0); await first;
  assert.equal(f.user().balance, 0); assert.equal(f.user().logoUrl, 'changed-while-writing');
  assert.equal(f.calls.navigations.length, 1); assert.equal(f.calls.successes.length, 1);
  assert.equal(f.calls.reads.length, 0); assert.equal(f.calls.balance.length, 0); assert.equal(f.runtime.all().length, 0);
  assert.equal(f.calls.mutationOptions.every(o => o.retry === false), true);
  const invalidation = f.calls.invalidations[0]; assert.equal(invalidation.refetchType, 'none');
  for (const key of [['promos','all',12,1],['detailedPromos','ongoing',id(100),id(1),12,1]]) assert.equal(invalidation.predicate({ queryKey: key }), true);
  assert.equal(invalidation.predicate({ queryKey: ['promos','all',12,2] }), false);
  assert.equal(invalidation.predicate({ queryKey: ['clientCampaigns',1] }), false);
  await f.completion().submit(validResults()); assert.equal(f.calls.completions.length, 1);
});

test('main-style completion reports PATCH refusal/500/network normally, without automatic retry or recovery GET', async () => {
  for (const error of [failure(400),failure(403),failure(409),failure(500),new Error('Network timeout')]) {
    const f = writeFixture(); f.api.completion = async body => { f.calls.completions.push(body); throw error; };
    await f.completion().submit(validResults()); await tick();
    assert.deepEqual(f.calls.errors, [error]); assert.equal(f.calls.completions.length, 1);
    assert.equal(f.calls.successes.length, 0); assert.equal(f.calls.navigations.length, 0);
    assert.equal(f.calls.reads.length, 0); assert.equal(f.calls.balance.length, 0); assert.equal(f.completion().isPending, false);
    f.api.completion = async body => { f.calls.completions.push(body); return 10; };
    await f.completion().submit(validResults()); assert.equal(f.calls.completions.length, 2); assert.equal(f.calls.navigations.length, 1);
  }
});

test('main-style completion never waits for list reads and skips invalid balance without rejecting HTTP success', async () => {
  for (const value of [0, 10, undefined, null, '10', NaN, Infinity, -1]) {
    const f = writeFixture(); f.api.completion = async body => { f.calls.completions.push(body); return value; };
    f.api.invalidate = async () => { throw new Error('List GET failed'); };
    await f.completion().submit(validResults()); await tick();
    assert.equal(f.calls.completions.length, 1); assert.equal(f.calls.navigations.length, 1); assert.equal(f.calls.successes.length, 1);
    assert.equal(f.calls.errors.length, 0); assert.equal(f.calls.balance.length, 0);
    assert.equal(f.user().balance, typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 1);
  }
});

test('main-style form success clears placement query/hash/state and shows no completion-controller feedback', async () => {
  const f = writeFixture(), tree = f.form();
  assert.equal(walk(tree).some(n => n.props?.record || n.props?.onRetry), false);
  assert.equal(walk(tree).find(n => n.props?.label === 'Submit').props.isDisabled, false);
  const form = walk(tree).find(n => n.props?.schema && n.props?.onSubmit);
  await form.props.onSubmit(validResults());
  assert.deepEqual(f.calls.navigations[0], [{ pathname: '/influencer/promos/distributing', search: '', hash: '' }, { replace: true, state: null }]);
});

test('stage 9 independent Offer placements of one social account are addressed separately', async () => {
  const f = writeFixture(), hook = f.decision();
  await Promise.all([hook.mutate(request(1)), hook.mutate(request(2))]);
  assert.deepEqual(f.calls.decisions.map(b => b.addedAccountsId).sort(), [id(1),id(2)]);
  assert.equal(f.calls.decisions.every(b => !('socialAccountId' in b) && !('selectedOffer' in b)), true);
});

test('retained controller internals: reversed completion responses and superseded auth/me reads cannot roll back balance', async () => {
  const f = writeFixture(), target = n => ({ kind: 'placement', campaignId: id(100), addedAccountsId: id(n) });
  const post = [], reads = [];
  f.api.completion = async body => { const d = deferred(); post.push({ body, ...d }); return d.promise; };
  f.api.readBalance = async () => { const d = deferred(); reads.push(d); return d.promise; };
  const exec = n => f.runtime.execute({ kind: 'completion', target: target(n), scope: 'form-' + n, live: () => true, syncQueries: async () => {}, body: row => f.load(p + 'model/promo-result-transport.ts').buildPromoResultBody({ campaignId: row.campaignId, addedAccountsId: row.addedAccountsId, username: row.username }, row.accountSocialMedia, validResults()) });
  const first = exec(1); await tick(); post[0].resolve(10); await tick(); assert.equal(reads.length, 1);
  const second = exec(2); await tick(); post[1].resolve(20); await tick(); assert.equal(reads.length, 2);
  f.setUser({ ...f.user(), logoUrl: 'changed-during-request' });
  reads[1].resolve(20); await second; reads[0].resolve(10); await first;
  assert.equal(f.user().balance, 20); assert.equal(f.user().logoUrl, 'changed-during-request'); assert.equal(f.calls.patched.length, 1);
  assert.equal(f.runtime.get('completion', target(1)).phase, 'success'); assert.equal(f.runtime.get('completion', target(1)).needsRead, true);
});

test('retained controller internals: a completion still writing prevents publication until a fresh balance read after settlement', async () => {
  const f = writeFixture(), post = [];
  f.api.completion = async body => { const d = deferred(); post.push(d); return d.promise; };
  const exec = n => f.runtime.execute({ kind: 'completion', target: { kind: 'placement', campaignId: id(100), addedAccountsId: id(n) }, scope: String(n), live: () => true, syncQueries: async () => {}, body: () => ({}) });
  const a = exec(1), b = exec(2); await tick(); post[1].resolve(20); await b;
  assert.equal(f.calls.patched.length, 0); assert.equal(f.calls.balance.length, 0);
  post[0].resolve(10); await a; assert.equal(f.user().balance, 10); assert.equal(f.calls.patched.length, 1);
});

test('stage 9 foreign page, unmount or same-name next auth session cannot receive completion balance/navigation', async () => {
  for (const scenario of ['page','unmount','auth']) {
    const f = writeFixture(), wait = deferred(); f.completion(); await tick();
    f.api.completion = async body => { f.calls.completions.push({ body }); return wait.promise; };
    const promise = f.completion().submit(validResults()); await tick();
    if (scenario === 'page') { f.move({ search: '?campaignId=' + id(101) }); f.setState({ campaignId: id(101) }); f.completion(); }
    if (scenario === 'auth') { f.switchUser(); f.completion(); }
    if (scenario === 'unmount') f.h.unmount();
    wait.resolve(0); await promise; assert.equal(f.calls.patched.length, 0); assert.equal(f.calls.navigations.length, 0);
    if (scenario === 'auth') assert.equal(f.user().balance, 500);
  }
});

test('stage 9 result platform requirements, counters and actual API allowlist exclude money/topology/meta', async () => {
  const load = harness(), build = load(p + 'model/promo-result-transport.ts'); const identity = { campaignId: id(100), addedAccountsId: id(1), username: 'account' };
  const body = build.buildPromoResultBody(identity, 'instagram', validResults({ amount: 999, reward: 100, selectedOfferSnapshot: {}, meta: 'press' }));
  assert.deepEqual(Object.keys(body).sort(), ['addedAccountsId','campaignId','data','username']); assert.equal('reward' in body.data, false);
  for (const value of [1.5, NaN, Infinity, -1, '1']) assert.throws(() => build.buildPromoResultBody(identity, 'instagram', validResults({ impressions: value })));
  assert.throws(() => build.buildPromoResultBody(identity, 'unknown', validResults()), /unsupported/);
  assert.throws(() => build.buildPromoResultBody(identity, 'multipromo', validResults()), /unsupported/);
  assert.throws(() => build.buildPromoResultBody(identity, 'instagram', { screenshotUrl: 'https://example.test/s.png', postLink: 'https://example.test/p', impressions: 1, like: 1 }));
  assert.equal(build.buildPromoResultBody(identity, 'spotify', { rating: 1.5, screenshotUrl: 'https://example.test/s.png', saves: 0 }).data.rating, 1.5);
  assert.equal(build.buildPromoResultBody(identity, 'soundcloud', { screenshotUrl: 'https://example.test/s.png' }).data.screenshotUrl, 'https://example.test/s.png');
  assert.equal(build.buildPromoResultBody(identity, 'press', { postLink: 'example.test/press' }).data.postLink, 'https://example.test/press');
  for (const platform of ['youtube','facebook','tiktok']) assert.doesNotThrow(() => build.buildPromoResultBody(identity, platform, validResults({ favorites: 0 })));
  const calls = [], apiLoad = harness({ '../../api': { __esModule: true, default: { patch: async (...args) => { calls.push(args); return { data: { data: { balance: 0 } } }; }, get: async () => ({ data: { data: { balance: 0 } } }) } } });
  const api = apiLoad('src/api/influencer/promos/influencer-promos.api.ts');
  assert.equal(await api.createInfluencerPromoReview({ ...body, amount: 500, displayCurrency: 'GBP', data: { ...body.data, reward: 999 } }), 0);
  assert.equal(calls[0][0], '/promos'); assert.equal('amount' in calls[0][1], false); assert.equal('reward' in calls[0][1].data, false);
  assert.equal(await api.readInfluencerBalance(), 0);
});

test('stage 9 screenshot consumer validates documented defaults, preserves prior URL, and supports same-file retry/Retry-After', async () => {
  const load = harness(), screenshot = load(p + 'distributing/components/campaign-result-form/model/promo-screenshot.ts');
  let now = 1000, url = 'https://example.test/previous.png', uploaded = 0, fail = true;
  const file = { name: 's.png', type: 'image/png', size: 10 };
  const consumer = screenshot.createPromoScreenshot({ live: () => true, now: () => now, changed() {}, apply: next => { url = next; }, upload: async same => { assert.equal(same, file); uploaded++; if (fail) throw { response: { status: 429, headers: { 'retry-after': '2' } } }; return 'https://example.test/new.png'; } });
  for (const type of ['image/gif','image/svg+xml','application/pdf']) await consumer.select({ ...file, type });
  await consumer.select({ ...file, size: 10 * 1024 * 1024 + 1 }); assert.equal(uploaded, 0); assert.equal(url, 'https://example.test/previous.png');
  for (const type of ['image/jpeg','image/png','image/webp']) assert.doesNotThrow(() => screenshot.validatePromoScreenshot({ ...file, type }));
  await consumer.select(file); assert.equal(url, 'https://example.test/previous.png'); assert.equal(consumer.state().retryAt, 3000);
  await consumer.retry(); assert.equal(uploaded, 1); now = 3001; fail = false; await consumer.retry();
  assert.equal(uploaded, 2); assert.equal(url, 'https://example.test/new.png');
  assert.equal(screenshot.retryAfterUntil({ 'retry-after': new Date(5000).toUTCString() }, 1000), 5000);
  for (const raw of ['garbage','-1','Infinity',[], '99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999']) assert.equal(screenshot.retryAfterUntil({ 'retry-after': raw }, 1000), 0);
});

test('stage 9 screenshot failures/reset/new-file/unmount/auth invalidate late uploads, with no server delete', async () => {
  const screenshot = harness()(p + 'distributing/components/campaign-result-form/model/promo-screenshot.ts');
  for (const code of [400,413,415,429,503,504,502]) {
    let value = 'old'; const c = screenshot.createPromoScreenshot({ live: () => true, changed() {}, apply: v => { value = v; }, upload: async () => { throw failure(code); } });
    await c.select({ type: 'image/webp', size: 1 }); assert.equal(value, 'old'); assert.ok(c.state().error.length);
  }
  for (const scenario of ['replace','remove','unmount','auth']) {
    const pending = [], applied = []; let live = true;
    const c = screenshot.createPromoScreenshot({ live: () => live, changed() {}, apply: v => applied.push(v), upload: async (file, signal) => { const d = deferred(); pending.push({ file, signal, ...d }); return d.promise; } });
    const file = { type: 'image/jpeg', size: 1 }; const first = c.select(file); await c.select(file); assert.equal(pending.length, 1);
    if (scenario === 'replace') { const second = c.select({ type: 'image/png', size: 2 }); pending[1].resolve('https://example.test/new'); await second; }
    if (scenario === 'remove') c.remove();
    if (scenario === 'unmount' || scenario === 'auth') { live = false; c.dispose(); }
    pending[0].resolve('https://example.test/old'); await first;
    assert.equal(applied.includes('https://example.test/old'), false); assert.equal(pending[0].signal.aborted, true);
    assert.deepEqual(applied, scenario === 'replace' ? ['https://example.test/new'] : scenario === 'remove' ? [null] : []);
  }
});

test('Bundle decisions keep frozen membership; isolated member submission remains placement-addressed', async () => {
  const f = writeFixture({ gate: true }), b = f.read.readDetailedPromos([{ ...bundle(), isPaused: false }], 'new')[0];
  const base = f.api.detailed;
  f.api.detailed = async args => args.status === 'new' ? [b] : (await base(args)).map(row => ({ ...row, bundleId: b.bundleId, campaignBundleId: b.campaignBundleId }));
  await f.decision().confirmBundle(b, 'accept');
  assert.deepEqual(f.calls.decisions[0], { campaignId: id(100), campaignBundleId: id(400), selectedAddedAccountsIds: [id(1),id(2)], campaignResponse: 'accept' });
  const context = { campaignId: id(100), campaignBundleId: id(400), bundleId: id(500), memberIds: [id(1),id(2)], policy: 'all_or_nothing' };
  const result = writeFixture({ gate: true }); result.setState({ bundleContext: context });
  await result.completion().submit(validResults());
  assert.equal(result.calls.completions.length, 1); assert.equal(result.calls.completions[0].body.addedAccountsId, id(1)); assert.deepEqual(result.calls.completions[0].context, context); assert.equal('bundleId' in result.calls.completions[0].body, false);
  assert.equal(result.user().balance, 99); // server PATCH balance; no local reward sum or auth/me dependency
  assert.equal(result.calls.balance.length, 0);

});

test('stage 9 production Bundle gate and standalone bridge checks block handlers/API before mutation', async () => {
  const f = writeFixture(), b = f.read.readDetailedPromos([{ ...bundle(), isPaused: false }], 'new')[0];
  await f.decision().confirmBundle(b, 'accept'); assert.equal(f.calls.reads.length, 0); assert.equal(f.calls.decisions.length, 0);
  const context = { campaignId: id(100), campaignBundleId: id(400), bundleId: id(500), memberIds: [id(1),id(2)], policy: 'all_or_nothing' };
  const result = writeFixture(); result.setState({ bundleContext: context }); await result.completion().submit(validResults()); assert.equal(result.calls.completions.length, 0);
});

test('stage 9 prepared Bundle member entry uses explicit group identity and reports missing backend dependencies', () => {
  const gate = { '@/shared/config/bundle-availability': { BUNDLES_AVAILABLE: true } };
  const load = harness(gate), read = load(p + 'model/promo-read.ts');
  const group = read.readDetailedPromos([{ ...bundle(), isPaused: false }], 'new')[0];
  const member = read.readDetailedPromos([{ campaignId: id(100), addedAccountsId: id(2), username: 'member', accountSocialMedia: 'press', isPaused: false, confirmation: 'accept', closedStatus: 'wait', bundleId: id(500), campaignBundleId: id(400) }], 'ongoing')[0];
  const entry = load(p + 'components/bundle-promo/BundleMemberResultsEntry.tsx');
  const state = entry.prepareBundleMemberResults(member, group); assert.equal(state.addedAccountsId, id(2)); assert.equal(state.bundleContext.campaignBundleId, id(400));
  assert.throws(() => entry.prepareBundleMemberResults({ ...member, campaignBundleId: undefined }, group), /identity/);
  assert.match(text(entry.BundleMemberResultsEntry({ member, onOpen() {} })), /require/);
  let opened; const button = entry.BundleMemberResultsEntry({ member, group, onOpen: s => { opened = s; } }); button.props.onClick(); assert.equal(opened.addedAccountsId, id(2));
  const off = harness()(p + 'components/bundle-promo/BundleMemberResultsEntry.tsx'); assert.match(text(off.BundleMemberResultsEntry({ member, group, onOpen() { assert.fail(); } })), /unavailable/);
});

test('stage 9 real screenshot input resets the same-file value and owns changes; API posts one field with signal', async () => {
  const h = reactHarness(), pending = [], applied = [], owner = { epoch: 1, active: true };
  const load = harness({ react: h.react, 'react-hook-form': { useFormContext: () => ({ control: {} }), useController: () => ({ field: { value: 'https://example.test/old.png', onChange: v => applied.push(v) }, fieldState: {} }) },
    '@/api/upload/upload-image.api': { uploadImageApi: (file, options) => { const d = deferred(); pending.push({ file, signal: options.signal, ...d }); return d.promise; } }, '@/api/error.api.ts': { handleApiError() { assert.fail(); } } });
  const Component = load('src/components/ui/image-upload/ImageUpload.tsx').ImageUpload;
  const createController = load(p + 'distributing/components/campaign-result-form/model/promo-screenshot.ts').createPromoScreenshot;
  let contextKey = 'form-A', busy = false;
  const render = () => h.render(() => Component({ name: 'screenshotUrl', label: 'Screenshot', placeholder: 'Attach the screenshot', size: 'large', uploadOptions: { contextKey, isCurrent: () => true, createController, accept: 'image/jpeg,image/png,image/webp', onPendingChange: v => { busy = v; } } }));
  const input = walk(render()).find(n => n.type === 'input'); const target = { value: 'same-file', files: [{ type: 'image/png', size: 1 }] };
  input.props.onChange({ target }); assert.equal(target.value, ''); assert.equal(busy, true); assert.equal(input.props.accept, 'image/jpeg,image/png,image/webp');
  contextKey = 'form-B'; render(); pending[0].resolve('https://example.test/late.png'); await tick(); assert.equal(applied.length, 0);
  const calls = [], api = harness({ '../../api': { __esModule: true, default: { post: async (...args) => { calls.push(args); return { data: { statusCode: 201, data: 'https://example.test/new.png' } }; } } } })('src/api/influencer/promos/influencer-promos.api.ts');
  const file = new File(['x'], 's.png', { type: 'image/png' }), signal = new AbortController().signal;
  const ownsUpload = () => true;
  assert.equal(await api.uploadPromoScreenshot(file, signal, ownsUpload), 'https://example.test/new.png');
  assert.equal(calls[0][0], '/file'); assert.deepEqual([...calls[0][1].keys()], ['file']); assert.equal(calls[0][2].signal, signal);
  assert.equal(calls[0][2].isCurrentRequest, ownsUpload);
  h.unmount();
});

test('stage 9 result form blocks submission synchronously while its screenshot consumer is uploading', async () => {
  const f = writeFixture(); f.form(); await tick(); const tree = f.form();
  const form = walk(tree).find(n => n.props?.schema && n.props?.onSubmit);
  const fields = walk(tree).find(n => n.props?.imageUploadOptions);
  assert.equal(walk(tree).some(n => n.type === 'fieldset'), false);
  assert.equal(fields.props.renderFile, undefined);
  fields.props.imageUploadOptions.onPendingChange(true); await form.props.onSubmit(validResults()); assert.equal(f.calls.completions.length, 0);
  fields.props.imageUploadOptions.onPendingChange(false); await form.props.onSubmit(validResults()); assert.equal(f.calls.completions.length, 1);
});

test('stage 9 owned API refresh never replays an old mutation or replaces/logs out a new auth session', async () => {
  for (const outcome of ['success','failure','already-foreign']) {
    let handler, live = outcome !== 'already-foreign', replays = 0, updates = 0, logouts = 0, refreshes = 0;
    const wait = deferred();
    const client = Object.assign(async () => { replays++; }, { interceptors: { request: { use() {}, eject() {} }, response: { use(_s, error) { handler = error; }, eject() {} } } });
    const load = loader({ axios: { __esModule: true, default: { create: () => client } }, './error.api.ts': { handleApiError() { assert.fail('Owned errors stay scoped'); } },
      '../contexts/AuthContext.tsx': { tokenStorage: { get: () => 'token' } }, '@/api/refresh.manager.ts': { refreshAccessToken: async set => { refreshes++; const token = await wait.promise; set(token); return token; } }, '@/shared/config/runtime-config.ts': { API_URL: 'https://example.test' } });
    load('src/api/api.ts').setupInterceptors(() => updates++, () => logouts++);
    const pending = handler({ config: { url: '/promos', headers: {}, silentReadError: true, isCurrentRequest: () => live }, response: { status: 401 } });
    live = false;
    if (outcome === 'failure') wait.reject(new Error('Refresh failed')); else wait.resolve('old-token');
    await assert.rejects(pending); assert.equal(replays, 0); assert.equal(updates, 0); assert.equal(logouts, 0);
    assert.equal(refreshes, outcome === 'already-foreign' ? 0 : 1);
  }
});

test('restored ImageUpload keeps the default consumer and opts owned results into the same multipart API', async () => {
  const calls = [], applied = [], h = reactHarness();
  const load = loader({ react: h.react, 'react-hook-form': { useFormContext: () => ({ control: {} }), useController: () => ({ field: { value: null, onChange: v => applied.push(v) }, fieldState: {} }) },
    '@/api/error.api.ts': { handleApiError() { assert.fail(); } },
    '../api': { __esModule: true, default: { post: async (...args) => { calls.push(args); return { data: { data: 'https://example.test/default.png' } }; } } },
    '@components/ui/small-loader/SmallLoader.tsx': { SmallLoader: dummy },
  });
  const Component = load('src/components/ui/image-upload/ImageUpload.tsx').ImageUpload;
  const tree = h.render(() => Component({ name: 'screenshotUrl', label: 'Screenshots insights*', placeholder: 'Attach the screenshot', size: 'large' }));
  const input = walk(tree).find(n => n.type === 'input');
  assert.equal(input.props.hidden, true); assert.equal(input.props.accept, 'image/*');
  const file = new File(['x'], 'original.png', { type: 'image/png' });
  await input.props.onChange({ target: { files: [file], value: 'file' } });
  assert.deepEqual(applied, ['https://example.test/default.png']);
  assert.equal(calls[0][0], '/file'); assert.deepEqual([...calls[0][1].keys()], ['file']);
  assert.equal(calls[0][2].signal, undefined); assert.equal(calls[0][2].isCurrentRequest, undefined);
  assert.equal(calls[0][2].headers['Content-Type'], 'multipart/form-data');
});

test('retained controller internals: failed Completed reads do not weaken reverse-order completion and balance revision guards', async () => {
  const f = writeFixture(), base = f.api.detailed, posts = [], reads = []; let listReads = 0;
  f.api.detailed = args => args.status === 'close' ? Promise.reject(failure(503)) : base(args);
  f.api.completion = async () => { const d = deferred(); posts.push(d); return d.promise; };
  f.api.readBalance = async () => { const d = deferred(); reads.push(d); return d.promise; };
  const target = n => ({ kind: 'placement', campaignId: id(100), addedAccountsId: id(n) });
  const exec = n => f.runtime.execute({ kind: 'completion', target: target(n), scope: String(n), live: () => true, syncQueries: async () => { listReads++; }, body: () => ({}) });
  const a = exec(1); await tick(); posts[0].resolve(10); await tick();
  const b = exec(2); await tick(); posts[1].resolve(20); await tick();
  assert.equal(reads.length, 2); reads[1].resolve(20); await b; reads[0].resolve(10); await a;
  assert.equal(f.user().balance, 20); assert.equal(f.calls.patched.length, 1); assert.equal(listReads, 2);
  const first = f.runtime.get('completion', target(1)), second = f.runtime.get('completion', target(2));
  assert.equal(first.phase, 'success'); assert.equal(second.phase, 'success'); assert.equal(first.needsRead, true); assert.equal(second.needsRead, true);
  assert.match(first.message, /Promo details:.*Balance: Balance reading was superseded/);
  assert.match(second.message, /Promo details:/);
});

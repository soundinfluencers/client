/* Start Vite on 127.0.0.1:4186 first. API calls are intercepted; no live campaign is changed. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const serverRequire = createRequire(path.resolve(__dirname, '../../../SoundInfluencers-server/package.json'));
const puppeteer = serverRequire('puppeteer');
const base = process.env.CAMPAIGN_TEST_URL || 'http://127.0.0.1:4186';
const draftId = '650000000000000000000001';
const fixture = () => ({ _id: draftId, revision: 1, campaignName: 'October track campaign', step: 'addAccounts', socialMedia: 'instagram',
  brief: { budget: 1500, budgetCurrency: 'EUR', campaignGoal: 'Promote a new track', genre: 'Techno', platforms: ['instagram'], countries: ['DE', 'FR'], dateRequest: '2026-10-01' },
  addedAccounts: [], campaignContent: [] });
const pages = Array.from({ length: 10 }, (_, index) => ({
  accountId: `6500000000000000000000${String(index + 10).padStart(2, '0')}`,
  influencerId: `6600000000000000000000${String(index + 10).padStart(2, '0')}`,
  username: `Techno Page ${index + 1}`, followers: (index + 1) * 1000,
  priceEUR: 50, price: 50, currency: 'EUR', socialMedia: 'instagram', profileType: 'community', musicGenres: ['Techno'], countryShare: 28,
}));
const outcome = { status: 'completed', page: 1, loadedCount: 5, totalExact: 165, hasMore: true, nextPage: 2,
  request: { socialMedias: ['instagram'], musicGenres: ['Techno'], countries: ['DE', 'FR'], totalBudget: 1500, budgetCurrency: 'EUR' },
  candidates: pages.slice(0, 5), countries: ['DE', 'FR'], currency: 'EUR', currencyPerEUR: 1,
  bundles: [{ id: 'test-bundle', accountIds: pages.map(p => p.accountId), name: 'best_value', pages, total: 500, currency: 'EUR', followers: 55000 }] };
const clickText = async (page, text) => {
  const handle = await page.waitForSelector(`::-p-text(${text})`);
  await handle.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await handle.click();
};
const hasText = async (page, text) => {
  try { return await page.waitForFunction((value) => document.body.innerText.includes(value), {}, text); }
  catch (error) {
    console.error('Missing text:', text, await page.evaluate(() => ({ text: document.body.innerText.slice(-3200), checkboxes: [...document.querySelectorAll('input[type="checkbox"]')].map(el => ({ label: el.getAttribute('aria-label'), checked: el.checked })) })));
    throw error;
  }
};

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1360, height: 1100 });
    let draft = fixture();
    let failSearch = false;
    let failSave = false;
    let searchCalls = 0;
    let chatCalls = 0;
    const searchRequests = [];
    let writesStarted = 0;
    let writesInFlight = 0;
    let writeDelay = 180;
    const saves = [];
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.evaluateOnNewDocument((id) => {
      sessionStorage.setItem('ai-chat:v4:660000000000000000000001:client', JSON.stringify({ role: 'client', activeDraftId: id,
        messages: [{ id: 'welcome', q: '', a: '<p>Complete your brief.</p>', links: [], media: [], status: 'success', assistantOnly: true }] }));
      sessionStorage.setItem('ai-chat:workspace-surface:v2:660000000000000000000001:client', 'brief');
    }, draftId);
    await page.setRequestInterception(true);
    page.on('request', async request => {
      const url = new URL(request.url());
      if (!url.pathname.startsWith('/__campaign-test-api')) return request.continue();
      const route = url.pathname.replace('/__campaign-test-api', '');
      const method = request.method();
      const body = request.postData() ? JSON.parse(request.postData()) : {};
      let data;
      let status = 200;
      if (route === '/auth/refresh') data = { accessToken: 'fixture.' + Buffer.from(JSON.stringify({ sub: '660000000000000000000001', role: 'client' })).toString('base64url') + '.fixture' };
      else if (route === '/auth/me') data = { firstName: 'Fixture', role: 'client', balance: 0, logoUrl: null };
      else if (route === `/campaigns/draft/${draftId}` && method === 'GET') data = draft;
      else if (route === `/campaigns/draft/${draftId}/brief`) {
        draft = { ...draft, brief: body.brief, campaignName: body.campaignName, revision: draft.revision + 1 };
        data = { revision: draft.revision };
      } else if (route === '/campaigns/draft' && method === 'POST') {
        writesStarted += 1;
        writesInFlight += 1;
        await new Promise(resolve => setTimeout(resolve, writeDelay));
        if (failSave) { status = 500; data = {}; }
        else {
          assert.equal(body.revision, draft.revision, 'saves must use the latest revision');
          // The real GET enriches stored account references from the roster.
          const addedAccounts = body.addedAccounts.map(account => {
            const roster = pages.find(page => page.accountId === account.socialAccountId);
            return { username: roster.username, followers: roster.followers, price: roster.priceEUR,
              isAvailable: true, ...account };
          });
          draft = { ...draft, ...body, addedAccounts, _id: draftId, revision: draft.revision + 1 };
          saves.push(structuredClone(draft));
          data = { revision: draft.revision };
        }
        writesInFlight -= 1;
      } else if (route === '/profile/filters') data = { filterArr: [] };
      else if (route === '/agent/recommendations') {
        searchCalls += 1;
        searchRequests.push(body);
        const requestedBudget = draft.brief.budget;
        await new Promise(resolve => setTimeout(resolve, requestedBudget === 800 ? 1800 : 500));
        if (failSearch) { status = 503; data = {}; }
        else data = { conversationId: body.conversationId, draftId, search: requestedBudget === 1
          ? { ...outcome, status: 'empty', totalExact: 0, candidates: [], bundles: [], hasMore: false, nextPage: undefined }
          : requestedBudget === 800 || requestedBudget === 600
          ? { ...outcome, totalExact: requestedBudget / 10 }
          : body.page === 2
          ? { ...outcome, page: 2, candidates: pages.slice(5), loadedCount: 5, nextPage: 3 }
          : outcome };
      } else if (route === '/agent/chat') {
        chatCalls += 1;
        // All model calls are unavailable: search, pagination and retry must still work.
        status = 503; data = {};
      } else throw new Error(`Unexpected fixture API: ${method} ${route}`);
      await request.respond({ status, contentType: 'application/json', body: JSON.stringify({ data }) });
    });
    await page.goto(`${base}/tests/fixtures/campaign-workspace.html`, { waitUntil: 'networkidle0' });
    await clickText(page, 'Save & find pages');
    await hasText(page, 'Finding matching pages…');
    await hasText(page, '165 matching pages');
    assert.equal(await page.$eval('h2', el => el.textContent), 'Pages and dates');
    assert.equal(searchCalls, 1);
    assert.equal(chatCalls, 0, 'saving a complete brief must not call the LLM');
    failSearch = true;
    await clickText(page, 'Load more pages');
    await hasText(page, 'Page search did not complete');
    await hasText(page, '165 matching pages · 5 loaded');
    failSearch = false;
    await clickText(page, 'Retry search');
    await hasText(page, '10 loaded');
    assert.equal(searchRequests.at(-1).page, 2);
    assert.deepEqual(searchRequests.at(-1).request, outcome.request);
    assert.equal(chatCalls, 0, 'pagination must not call the LLM');
    console.log('PASS: direct search and pagination/retry work with unavailable AI and preserve existing results');
    await clickText(page, 'View all 10 pages');
    await hasText(page, 'Techno Page 10');
    await clickText(page, 'Include these 10 pages');
    await hasText(page, '10 pages · €500.00');
    await hasText(page, '€1,000.00 remaining');
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Next: add content' && !b.disabled));
    await clickText(page, 'Next: add content');
    await hasText(page, 'Publishing content');
    assert.equal(draft.addedAccounts.length, 10);
    assert.ok(draft.addedAccounts.every(account => account.dateRequest === '2026-10-01'));
    console.log('PASS: save brief → visible search → full 10-page bundle → live budget → saved content transition with brief date');

    await page.click('button[aria-label^="Pages and dates"]');
    await page.waitForSelector('input[aria-label="Include Techno Page 1"]');
    await page.click('input[aria-label="Include Techno Page 1"]');
    await hasText(page, '9 pages · €450.00');
    await page.waitForFunction(() => document.body.innerText.includes('Saved'));
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Next: add content' && !b.disabled));
    await clickText(page, 'Next: add content');
    await hasText(page, 'Publishing content');
    assert.equal(draft.addedAccounts.filter(a => a.isSelected !== false).length, 9);
    console.log('PASS: deselection immediately updates totals and is saved before navigation');

    await page.click('button[aria-label^="Campaign brief"]');
    await hasText(page, 'Save & find pages');
    failSearch = true;
    await clickText(page, 'Save & find pages');
    await hasText(page, 'Page search did not complete');
    assert.equal(draft.brief.campaignGoal, 'Promote a new track');
    failSearch = false;
    await clickText(page, 'Retry search');
    await hasText(page, '165 matching pages');
    console.log('PASS: search failure leaves saved brief and selection intact; retry restores recommendations');

    failSave = true;
    await page.click('input[aria-label="Include Techno Page 1"]');
    await hasText(page, '10 pages · €500');
    await clickText(page, 'Next: add content');
    await hasText(page, 'Changes could not be saved');
    assert.equal(await page.$eval('h2', el => el.textContent), 'Pages and dates');
    failSave = false;
    await clickText(page, 'Next: add content');
    await hasText(page, 'Publishing content');
    assert.equal(draft.addedAccounts.filter(a => a.isSelected !== false).length, 10);
    console.log('PASS: failed selection save blocks navigation and can be retried without losing choices');

    await page.click('button[aria-label^="Pages and dates"]');
    await hasText(page, '165 matching pages');
    const beforeWrites = writesStarted;
    await page.click('input[aria-label="Include Techno Page 1"]');
    const writeDeadline = Date.now() + 5000;
    while (writesStarted === beforeWrites && Date.now() < writeDeadline) await new Promise(resolve => setTimeout(resolve, 10));
    assert.ok(writesStarted > beforeWrites, 'first selection save started');
    await page.click('input[aria-label="Include Techno Page 2"]');
    await hasText(page, '8 pages · €400');
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Next: add content' && !b.disabled));
    await clickText(page, 'Next: add content');
    await hasText(page, 'Publishing content');
    assert.equal(draft.addedAccounts.filter(a => a.isSelected !== false).length, 8);
    console.log('PASS: an earlier save response cannot overwrite a newer selection made in flight');
    await page.click('button[aria-label^="Pages and dates"]');
    await hasText(page, '165 matching pages');
    const revertWrites = writesStarted;
    writeDelay = 1000;
    await page.click('input[aria-label="Include Techno Page 1"]');
    const revertDeadline = Date.now() + 5000;
    while (writesStarted === revertWrites && Date.now() < revertDeadline) await new Promise(resolve => setTimeout(resolve, 10));
    assert.ok(writesStarted > revertWrites);
    await page.click('input[aria-label="Include Techno Page 1"]');
    await page.click('button[aria-label^="Publishing details"]');
    await hasText(page, 'Publishing content');
    const finishDeadline = Date.now() + 5000;
    while (writesInFlight && Date.now() < finishDeadline) await new Promise(resolve => setTimeout(resolve, 10));
    assert.equal(draft.addedAccounts.filter(a => a.isSelected !== false).length, 8,
      'reverting to the previous saved value must wait for and undo the in-flight write');
    console.log('PASS: reverting a selection during save is persisted before switching sections');
    writeDelay = 180;
    await page.click('button[aria-label^="Pages and dates"]');
    await hasText(page, '165 matching pages');
    const saveBudget = async budget => {
      await page.click('button[aria-label^="Campaign brief"]');
      await page.waitForSelector('input[type="number"]');
      await page.click('input[type="number"]', { clickCount: 3 });
      await page.keyboard.press('Backspace');
      await page.type('input[type="number"]', String(budget));
      await clickText(page, 'Save & find pages');
      await hasText(page, 'Finding matching pages…');
    };
    await saveBudget(800);
    await saveBudget(600);
    await hasText(page, '60 matching pages');
    await new Promise(resolve => setTimeout(resolve, 2000));
    assert.ok((await page.evaluate(() => document.body.innerText)).includes('60 matching pages'));
    assert.ok(!(await page.evaluate(() => document.body.innerText)).includes('80 matching pages'));
    assert.equal(draft.brief.budget, 600);
    assert.equal(draft.addedAccounts.filter(a => a.isSelected !== false).length, 8);
    console.log('PASS: a slow old search cannot overwrite results after the client changes the brief');
    await saveBudget(1);
    await hasText(page, 'No matching pages found');
    await hasText(page, 'Adjust brief');
    assert.equal(draft.addedAccounts.filter(a => a.isSelected !== false).length, 8);
    await saveBudget(1500);
    await hasText(page, '165 matching pages');
    console.log('PASS: empty results retain the draft and offer a concrete next action');
    const outputDir = process.env.CAMPAIGN_SCREENSHOT_DIR;
    if (outputDir) {
      fs.mkdirSync(outputDir, { recursive: true });
      await page.evaluate(() => document.querySelectorAll('.Toastify__close-button').forEach(button => button.click()));
      await page.waitForFunction(() => document.querySelectorAll('.Toastify__toast').length === 0);
      await page.screenshot({ path: path.join(outputDir, 'campaign-pages-desktop.png'), fullPage: true });
      await page.setViewport({ width: 390, height: 844 });
      await page.screenshot({ path: path.join(outputDir, 'campaign-pages-mobile.png'), fullPage: true });
    }
    assert.deepEqual(errors, []);
    console.log(`PASS: no browser runtime errors; ${saves.length} verified saves`);
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });

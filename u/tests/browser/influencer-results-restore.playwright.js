// Run with the Playwright browser-code tool against local Vite on port 5179.
// Real React Compiler/RHF/ImageUpload/mutation; all HTTP boundaries intercepted.
async page => {
  const origin = 'http://127.0.0.1:5179', screenshotUrl = 'https://screens.example.test/screen.png';
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==', 'base64');
  const id = n => n.toString(16).padStart(24, '0');
  const checks = [], calls = [], errors = [];
  const check = (value, label) => { if (!value) throw new Error(label); checks.push(label); };
  page.on('pageerror', error => errors.push(error.message));
  const module = await (await page.request.get(origin + '/src/pages/influencer/promos/hooks/usePromoWrite.ts')).text();
  const hash = module.match(/react-query\.js\?v=([a-f\d]+)/)[1];
  let platform, listFail, patchFail, uploadFail, holdPatch, holdUpload, balance = 0, uploadUrl = screenshotUrl;
  const gate = () => { let release; const promise = new Promise(r => { release = r; }); return { promise, release }; };
  await page.unrouteAll();
  await page.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.href.startsWith(screenshotUrl)) return route.fulfill({ contentType: 'image/png', body: png });
    if (url.origin !== origin) return route.abort();
    if (url.pathname === '/__results') return route.fulfill({ contentType: 'text/html', body: `<!doctype html><html><head><script>window.RUNTIME_CONFIG={PUBLIC_API_URL:'${origin}/__fixture_api'};</script><script type="module">import R from '/@react-refresh';R.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;</script></head><body><div id="root"></div><script type="module" src="/__results-entry.js"></script></body></html>` });
    if (url.pathname === '/__results-entry.js') return route.fulfill({ contentType: 'application/javascript', body: `
      import React from '/node_modules/.vite/deps/react.js?v=${hash}';
      import ReactDOM from '/node_modules/.vite/deps/react-dom_client.js?v=${hash}';
      import {BrowserRouter,useLocation,useNavigate} from '/node_modules/.vite/deps/react-router-dom.js?v=${hash}';
      import {QueryClient,QueryClientProvider} from '/node_modules/.vite/deps/@tanstack_react-query.js?v=${hash}';
      import {ToastContainer} from '/node_modules/.vite/deps/react-toastify.js?v=${hash}';
      import '/node_modules/react-toastify/dist/ReactToastify.css';
      import {CampaignResultForm} from '/src/pages/influencer/promos/distributing/components/campaign-result-form/CampaignResultForm.tsx';
      import {useDetailedPromos} from '/src/pages/influencer/promos/hooks/useDetailedPromos.ts';
      import {changeReaderSession,getReaderSession} from '/src/shared/auth/reader-session.ts';
      import {useUser} from '/src/store/get-user/index.ts';import '/src/styles/_base.scss';
      changeReaderSession(true);window.users=useUser;
      useUser.setState({user:{firstName:'Fixture',role:'influencer',balance:1,logoUrl:'keep-logo'}});
      const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:3,retryDelay:10}}});window.client=client;
      for(const key of [['promos','all',12,getReaderSession().epoch],['detailedPromos','ongoing','${id(100)}','${id(1)}',12,getReaderSession().epoch],['promos','all',12,999],['clientCampaigns']])client.setQueryData(key,[]);
      function ListPage(){const read=useDetailedPromos({status:'ongoing'});return React.createElement('div',null,React.createElement('h1',{'data-testid':'promos'},'Promos'),read.error&&React.createElement('p',{role:'alert'},'List GET failed'));}
      function TestPage(){
        const [state,setState]=React.useState({campaignId:'${id(100)}',addedAccountsId:'${id(1)}',username:'account',meta:'${platform}'});
        const [mounted,setMounted]=React.useState(true),location=useLocation(),navigate=useNavigate();
        window.controls={setState,setMounted,changeReaderSession,navigate};
        if(location.pathname!=='/__results')return React.createElement(ListPage);
        return React.createElement('main',{style:{maxWidth:800,margin:'0 auto',padding:24}},mounted&&React.createElement(CampaignResultForm,{key:state.campaignId+state.addedAccountsId,submitState:state}));
      }
      ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(QueryClientProvider,{client},React.createElement(BrowserRouter,null,React.createElement(React.Fragment,null,React.createElement(ToastContainer,{autoClose:false}),React.createElement(TestPage)))));
    ` });
    if (!url.pathname.startsWith('/__fixture_api')) return route.continue();
    const call = { path: url.pathname, query: Object.fromEntries(url.searchParams), method: request.method(), body: request.method() === 'PATCH' ? request.postDataJSON() : undefined };
    calls.push(call);
    const fail = (code, message = 'Fixture HTTP ' + code) => route.fulfill({ status: code, json: { message }, headers: { 'Retry-After': '0' } });
    let data;
    if (url.pathname.endsWith('/promos/detailed')) { if (listFail) return fail(503); data = { promos: [] }; }
    else if (url.pathname.endsWith('/auth/me')) throw new Error('Submit must not read auth/me');
    else if (url.pathname.endsWith('/file')) { const wait=holdUpload,value=uploadUrl; if(wait)await wait.promise;if(uploadFail)return fail(413);data=value; }
    else if (url.pathname.endsWith('/promos') && request.method() === 'PATCH') { const wait=holdPatch;if(wait)await wait.promise;if(patchFail)return fail(patchFail,patchFail===500?'E11000 duplicate key error paymenthistorycells':'Fixture HTTP '+patchFail);data={balance}; }
    else throw new Error('Unexpected API request: ' + request.url());
    return route.fulfill({ json: { statusCode: 200, message: 'Success', data } });
  });
  const patchCount = () => calls.filter(c => c.method === 'PATCH').length;
  const submit = () => page.locator('button[type=submit]');
  const open = async (meta='youtube',options={}) => {
    platform=meta;listFail=options.listFail;patchFail=options.patchFail;uploadFail=false;holdPatch=undefined;holdUpload=undefined;balance=options.balance===undefined?0:options.balance;uploadUrl=screenshotUrl;calls.length=0;
    await page.goto(origin+'/__results?campaignId='+id(100)+'&addedAccountsId='+id(1)+'#submit');await submit().waitFor();
  };
  const file=()=>page.locator('input[type=file]').setInputFiles({name:'screen.png',mimeType:'image/png',buffer:png});
  const fill=async()=>{
    const link=page.locator('[name=postLink]');if(await link.count())await link.fill('https://example.test/post');
    const date=page.getByPlaceholder('Enter date post dd/mm/yyyy');if(await date.count())await date.fill('01/11/2026');
    for(const name of ['impressions','like','comments','shares','saves','favorites']){const input=page.locator('[name='+name+']');if(await input.count())await input.fill('10');}
    if(platform==='spotify')await page.locator('.star-rating-field__star').first().click();
    if(await page.locator('input[type=file]').count()){await file();await page.locator('.image-input__image--large').waitFor();}
  };
  await open();
  check(await submit().isEnabled()&&calls.length===0,'ready form has no initial inspect GET or controller feedback');
  check(await page.locator('fieldset').count()===0&&await page.locator('input[type=file][hidden]').count()===1,'original form and ImageUpload retained');
  await submit().click();await page.waitForTimeout(50);check(patchCount()===0,'real RHF schema retains required-field validation');
  await fill();const pending=gate();holdPatch=pending;
  await submit().evaluate(el=>{el.click();el.click();});await page.getByRole('button',{name:'Submitting...'}).waitFor();
  check(patchCount()===1&&await submit().isDisabled(),'double click sends one PATCH with pending Submit lock');
  check(calls.filter(c=>c.method==='GET').length===0,'no additional GET preflight');
  const body=calls.find(c=>c.method==='PATCH').body;
  check(body.campaignId===id(100)&&body.addedAccountsId===id(1)&&body.data.screenshotUrl===screenshotUrl&&!('amount'in body)&&!('meta'in body),'actual DTO keeps lifecycle placement and screenshot URL without money/meta');
  pending.release();await page.locator('[data-testid=promos]').waitFor();
  check(page.url()===origin+'/influencer/promos/distributing'&&await page.evaluate(()=>window.history.state.usr===null),'success clears placement query/hash/state and returns to Distributing');
  check(await page.evaluate(()=>window.users.getState().user.balance===0&&window.users.getState().user.logoUrl==='keep-logo'),'PATCH balance zero updates only balance');
  const cached=await page.evaluate(()=>window.client.getQueryCache().getAll().map(q=>({key:q.queryKey,stale:q.state.isInvalidated})));
  check(cached.some(q=>q.key[0]==='promos'&&q.key.at(-1)===1&&q.stale)&&cached.some(q=>q.key[0]==='detailedPromos'&&q.key[2]!==null&&q.stale),'real dashboard and pinned detail query keys invalidated');
  check(cached.filter(q=>q.key[0]==='clientCampaigns'||q.key.at(-1)===999).every(q=>!q.stale),'unrelated/private and foreign auth query keys preserved');
  await open('youtube',{patchFail:500});await fill();await submit().click();
  await page.getByRole('alert').filter({hasText:'E11000 duplicate key error paymenthistorycells'}).waitFor();await page.waitForTimeout(100);
  check(patchCount()===1&&await submit().isEnabled()&&!page.url().includes('/distributing'),'server 500 stays a normal visible error; no automatic mutation retry');
  check(await page.locator('[name=postLink]').inputValue()==='https://example.test/post'&&await page.locator('.image-input__image--large').getAttribute('src')===screenshotUrl,'PATCH failure preserves fields and screenshot');
  check(calls.filter(c=>c.method==='GET').length===0&&await page.getByRole('button',{name:/Retry reading/}).count()===0,'failure does not launch recovery GET or permanent unknown UI');
  patchFail=undefined;await submit().click();await page.locator('[data-testid=promos]').waitFor();check(patchCount()===2,'only a new explicit Submit repeats the mutation after error');
  await open('youtube',{listFail:true,balance:null});await fill();await submit().click();await page.locator('[data-testid=promos]').waitFor();
  await page.getByRole('alert').filter({hasText:'List GET failed'}).waitFor();
  check(patchCount()===1&&page.url()===origin+'/influencer/promos/distributing','failed subsequent list GET does not hold form or repeat PATCH');
  check(!calls.some(c=>c.path.endsWith('/auth/me')||c.query.status==='close')&&await page.evaluate(()=>window.users.getState().user.balance===1),'invalid balance does not require auth/me or Completed synchronization');
  for(const meta of ['press','soundcloud','spotify','instagram','facebook','tiktok']){
    await open(meta);await fill();await submit().click();await page.locator('[data-testid=promos]').waitFor();
    check(patchCount()===1,meta+' existing platform form submits');
    if(meta==='press')check(!('screenshotUrl'in calls.find(c=>c.method==='PATCH').body.data),'Press has no screenshot requirement');
  }
  await open('press');await page.evaluate(next=>window.controls.setState(next),{campaignId:id(100),addedAccountsId:id(2),socialAccountId:id(300),username:'offer-member',meta:'press',source:'offer',offerId:id(400)});
  await fill();await submit().click();await page.locator('[data-testid=promos]').waitFor();
  check(calls.find(c=>c.method==='PATCH').body.addedAccountsId===id(2)&&!('bundleId'in calls.find(c=>c.method==='PATCH').body),'Offer member submits independently without Bundle context or social ID substitution');
  await open();await fill();const upload=gate();holdUpload=upload;await file();await page.waitForTimeout(40);
  check(await submit().isDisabled(),'Submit blocked during upload');await page.locator('form').evaluate(el=>el.requestSubmit());await page.waitForTimeout(50);check(patchCount()===0,'upload ref blocks programmatic duplicate Submit');
  holdUpload=undefined;upload.release();await page.locator('.image-input__image--large').waitFor();
  for(const transition of ['placement','auth','unmount']){
    await open();await fill();const wait=gate();holdPatch=wait;await submit().click();await page.getByRole('button',{name:'Submitting...'}).waitFor();
    await page.evaluate(([transition,next])=>{if(transition==='placement')window.controls.setState(next);if(transition==='auth')window.controls.changeReaderSession(true);if(transition==='unmount')window.controls.setMounted(false);},[transition,{campaignId:id(101),addedAccountsId:id(2),username:'next',meta:'youtube'}]);
    holdPatch=undefined;wait.release();await page.waitForTimeout(100);
    check(patchCount()===1&&page.url().includes('/__results'),'late '+transition+' completion cannot navigate foreign context');
    check(await page.evaluate(()=>window.users.getState().user.balance===1),'late '+transition+' completion cannot patch foreign balance');
  }
  check(errors.length===0,'no React/browser errors');
  return {passed:checks.length,checks,apiBoundary:'all HTTP uploads/completions and list reads intercepted; no real mutations'};
}

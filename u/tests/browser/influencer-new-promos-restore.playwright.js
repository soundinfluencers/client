// Real New/Distributing/Completed, React Compiler and QueryClient. All API mocked.
async page => {
 const origin='http://127.0.0.1:5179',id=n=>n.toString(16).padStart(24,'0');
 const checks=[],calls=[],errors=[];const check=(v,m)=>{if(!v)throw new Error(m);checks.push(m);};
 page.on('pageerror',e=>errors.push(e.message));
 const module=await(await page.request.get(origin+'/src/pages/influencer/promos/hooks/useDetailedPromos.ts')).text();
 const hash=module.match(/react-query\.js\?v=([a-f\d]+)/)[1];
 const gate=()=>{let release;const promise=new Promise(r=>{release=r;});return{promise,release};};
 let sources,patchWait,backgroundWait,nextWait,patchFail,backgroundFail,writes=0;
 const row=(n,status='new')=>({...(status==='new'?{promoType:'standalone'}:{}),campaignId:id(100),addedAccountsId:id(n),socialAccountId:id(300),username:'account'+n,accountSocialMedia:'press',campaignName:'Promo '+n,isPaused:false,description:'Chosen second description '+n,additionalBrief:'Chosen second brief '+n,mainLink:'https://example.test/selected/'+n,dateRequest:'01/11/2026',clientName:'Fixture client',createdAt:'01.11.26',...(status==='new'?{}:{reward:0,postLink:'https://example.test/post/'+n})});
 await page.unrouteAll({behavior:'ignoreErrors'});
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());if(url.origin!==origin)return route.abort();
  if(req.isNavigationRequest()&&url.pathname.startsWith('/influencer/promos/'))return route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><script>window.RUNTIME_CONFIG={PUBLIC_API_URL:'${origin}/__fixture_api'};</script><script type="module">import R from '/@react-refresh';R.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;</script></head><body><div id="root"></div><script type="module" src="/__new-entry.js"></script></body></html>`});
  if(url.pathname==='/__new-entry.js')return route.fulfill({contentType:'application/javascript',body:`
   import React from '/node_modules/.vite/deps/react.js?v=${hash}';import ReactDOM from '/node_modules/.vite/deps/react-dom_client.js?v=${hash}';
   import {BrowserRouter,useLocation,useNavigate} from '/node_modules/.vite/deps/react-router-dom.js?v=${hash}';
   import {QueryClient,QueryClientProvider} from '/node_modules/.vite/deps/@tanstack_react-query.js?v=${hash}';
   import {ToastContainer} from '/node_modules/.vite/deps/react-toastify.js?v=${hash}';import '/node_modules/react-toastify/dist/ReactToastify.css';
   import {NewPromos} from '/src/pages/influencer/promos/new-promos/NewPromos.tsx';
   import {Distributing} from '/src/pages/influencer/promos/distributing/Distributing.tsx';import {Completed} from '/src/pages/influencer/promos/completed/Completed.tsx';
   import {changeReaderSession} from '/src/shared/auth/reader-session.ts';import {useUser} from '/src/store/get-user/index.ts';import '/src/styles/_base.scss';
   changeReaderSession(true);useUser.setState({user:{firstName:'Fixture',role:'influencer',balance:1}});
   const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:3,retryDelay:10}}});window.client=client;
   function Shell(){const location=useLocation(),navigate=useNavigate();const[visible,setVisible]=React.useState(true);window.controls={navigate,changeReaderSession,setVisible};return visible?React.createElement(location.pathname.endsWith('new-promos')?NewPromos:location.pathname.endsWith('completed')?Completed:Distributing):React.createElement('p',null,'Detached');}
   ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(QueryClientProvider,{client},React.createElement(BrowserRouter,null,React.createElement(React.Fragment,null,React.createElement(ToastContainer,{autoClose:false}),React.createElement(Shell)))));
  `});
  if(!url.pathname.startsWith('/__fixture_api'))return route.continue();
  const call={path:url.pathname,method:req.method(),query:Object.fromEntries(url.searchParams),body:req.method()==='PATCH'?req.postDataJSON():undefined};calls.push(call);
  const fail=(status,message)=>route.fulfill({status,json:{message:message||'Fixture HTTP '+status}});
  if(url.pathname.endsWith('/promos/requests')){
   const wait=patchWait;if(wait)await wait.promise;if(patchFail)return fail(patchFail);
   const body=call.body;sources.new=sources.new.filter(r=>!(r.campaignId===body.campaignId&&r.addedAccountsId===body.addedAccountsId));writes++;
   return route.fulfill({json:{statusCode:200,message:'Success'}});
  }
  if(url.pathname.endsWith('/promos/detailed')){
   const status=url.searchParams.get('status'),index=Number(url.searchParams.get('page')),limit=Number(url.searchParams.get('limit'));
   const wait=index>1?nextWait:writes?backgroundWait:undefined;if(wait)await wait.promise;if(writes&&backgroundFail)return fail(503);
   const source=sources[status],base=source.slice((index-1)*limit,index*limit);let promos=base;
   if(url.searchParams.has('campaignId')){
    const pin=source.find(r=>r.addedAccountsId===url.searchParams.get('addedAccountsId'))||(url.searchParams.get('addedAccountsId')===id(99)?row(99,status):undefined);
    if(!pin)return fail(404,'Consumed New pin');promos=[pin,...base.filter(r=>r.addedAccountsId!==pin.addedAccountsId)];
   }
   return route.fulfill({json:{statusCode:200,data:{promos}}});
  }
  throw new Error('Unexpected API '+req.url());
 });
 const patchCount=()=>calls.filter(c=>c.method==='PATCH').length;
 const cards=()=>page.locator('.promos-details-list-card');const card=n=>cards().filter({has:page.locator('.promos-details-list-card__body-header > span').filter({hasText:new RegExp('^Promo '+n+'$')})});
 const open=async(name='new-promos',count=2,pin,grouped=false)=>{
  sources=Object.fromEntries(['new','ongoing','close'].map(status=>[status,Array.from({length:count},(_,n)=>row(n+1,status))]));
  patchWait=undefined;backgroundWait=undefined;nextWait=undefined;patchFail=undefined;backgroundFail=false;writes=0;calls.length=0;
  if(grouped)sources.new=[{promoType:'bundle',campaignId:id(100),campaignBundleId:id(400),bundleId:id(500),campaignName:'Frozen group',isPaused:false,acceptancePolicy:'all_or_nothing',accounts:[{addedAccountsId:id(1),username:'member1'},{addedAccountsId:id(2),username:'member2'}]},{...row(3),campaignBundleId:id(400),bundleId:id(500)}];
  await page.goto(origin+'/influencer/promos/'+name+(pin?'?campaignId='+id(100)+'&addedAccountsId='+id(pin):''));
  if(grouped)await page.getByText('Bundle promos are currently unavailable.').first().waitFor();else await cards().first().waitFor();
 };
 for(const action of ['accept','decline']){
  await open();const wait=gate();patchWait=wait;const first=card(1),chosen=first.getByRole('button',{name:action==='accept'?'Accept promo':'Decline'});
  const before=calls.length;await chosen.evaluate(el=>{el.click();el.click();});await first.getByRole('button',{name:'Processing...'}).waitFor();
  check(await cards().count()===2&&patchCount()===1,'delayed '+action+' preserves cards and posts once');
  check(await first.getByRole('button').evaluateAll(buttons=>buttons.every(b=>b.disabled)),'both buttons locked for '+action);
  check(await first.getByRole('button',{name:action==='accept'?'Decline':'Accept promo'}).innerText().then(text=>text.toLowerCase())===(action==='accept'?'decline':'accept promo')&&await card(2).getByRole('button',{name:'Accept promo'}).isEnabled(),'only chosen '+action+' button shows processing');
  check(calls.length===before+1&&await page.getByText(/Processing promo|outcome|Retry reading/).count()===0,'no '+action+' preflight or textual controller status');
  backgroundWait=gate();wait.release();const title=action==='accept'?'Congratulations!':'Promo Declined';await page.getByRole('heading',{name:title,exact:true}).waitFor();
  check(await cards().count()===1&&await card(2).isVisible(),'confirmed '+action+' removes only exact placement before background GET');
  check(await page.getByRole('dialog').isVisible(),'success '+action+' modal does not wait for held GET');
  backgroundFail=true;backgroundWait.release();await page.getByRole('heading',{name:'Service temporarily unavailable'}).waitFor();
  check(await card(2).isVisible()&&await page.getByRole('dialog').isVisible()&&patchCount()===1,'failed background GET preserves '+action+' success and remaining card');
 }
 await open();patchFail=500;await card(1).getByRole('button',{name:'Accept promo'}).click();await page.getByRole('alert').filter({hasText:'Fixture HTTP 500'}).waitFor();
 check(await cards().count()===2&&await card(1).getByRole('button',{name:'Accept promo'}).isEnabled()&&await card(1).getByRole('button',{name:'Decline'}).isEnabled(),'PATCH failure keeps card and unlocks actions');
 await page.waitForTimeout(80);check(patchCount()===1&&await page.getByRole('dialog').count()===0,'PATCH failure has no automatic retry or success modal');
 patchFail=undefined;await card(1).getByRole('button',{name:'Decline'}).click();await page.getByRole('heading',{name:'Promo Declined',exact:true}).waitFor();check(patchCount()===2,'explicit subsequent Decline is allowed');
 for(const action of ['accept','decline']){
  await open('new-promos',1,1);backgroundWait=gate();
  await card(1).getByRole('button',{name:action==='accept'?'Accept promo':'Decline'}).click();await page.getByRole('heading',{name:action==='accept'?'Congratulations!':'Promo Declined',exact:true}).waitFor();
  check(await cards().count()===0&&await page.getByRole('dialog').isVisible(),'last pinned '+action+' card cannot hide modal');
  check(new URL(page.url()).search===''&&await page.evaluate(()=>window.history.state.usr===null),'successful '+action+' clears consumed pin');
  check(calls.filter(c=>c.method==='GET'&&c.query.addedAccountsId===id(1)).length===1,'consumed '+action+' New pin is not refetched');
  backgroundFail=true;backgroundWait.release();await page.getByRole('heading',{name:'Service temporarily unavailable'}).waitFor();check(await page.getByRole('dialog').isVisible(),'last-card '+action+' success survives failed list GET');
 }
 for(const name of ['new-promos','distributing','completed']){
  await open(name,2);check(await page.getByRole('button',{name:'View more',exact:true}).count()===0,name+' hides View more for short page');
  await open(name,2,99);await page.getByText('Promo 99',{exact:true}).waitFor();check(await cards().count()===3&&await page.getByRole('button',{name:'View more',exact:true}).count()===0,name+' pin does not fabricate continuation');
  await open(name,14,99);const next=gate();nextWait=next;await page.getByText('Promo 99',{exact:true}).waitFor();
  await page.getByRole('button',{name:'View more',exact:true}).evaluate(el=>{el.click();el.click();});await page.getByRole('button',{name:'Loading...',exact:true}).waitFor();
  check(await page.getByRole('button',{name:'Loading...',exact:true}).isDisabled()&&calls.filter(c=>c.query.page==='2').length===1,name+' next-page loading is visible and locked');
  nextWait=undefined;next.release();await page.getByText('Promo 14',{exact:true}).waitFor();
  check(await cards().count()===15&&await page.getByRole('button',{name:'View more',exact:true}).count()===0,name+' keeps unique pin and all pages, then hides View more');
  await open(name,12,99);await page.getByText('Promo 99',{exact:true}).waitFor();await page.getByRole('button',{name:'View more',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.custom-button[disabled]'));
  await page.getByRole('button',{name:'View more',exact:true}).waitFor({state:'detached'});
  check(await cards().count()===13&&calls.some(c=>c.query.page==='2'),name+' full final page learns end only from next empty server page');
 }
 for(const transition of ['auth','unmount','page']){
  await open();const pending=gate();patchWait=pending;await card(1).getByRole('button',{name:'Accept promo'}).click();await card(1).getByRole('button',{name:'Processing...'}).waitFor();
  await page.evaluate(transition=>{if(transition==='auth')window.controls.changeReaderSession(true);if(transition==='unmount')window.controls.setVisible(false);if(transition==='page')window.controls.navigate('/influencer/promos/completed');},transition);
  pending.release();await page.waitForTimeout(100);check(await page.getByRole('dialog').count()===0,'late '+transition+' response cannot show foreign success');
 }
 await open('new-promos',14);backgroundFail=true;
 await card(1).getByRole('button',{name:'Accept promo'}).click();await page.getByRole('heading',{name:'Congratulations!',exact:true}).waitFor();
 await page.getByRole('heading',{name:'Service temporarily unavailable'}).waitFor();await page.getByRole('button',{name:'Ok',exact:true}).click();
 check(await page.getByRole('button',{name:'View more',exact:true}).isDisabled(),'failed New refresh requires read Retry before advancing stale page offsets');
 backgroundFail=false;await page.getByRole('button',{name:'Retry',exact:true}).click();await page.getByText('Promo 13',{exact:true}).waitFor();
 await page.getByRole('button',{name:'View more',exact:true}).click();await page.getByText('Promo 14',{exact:true}).waitFor();
 check(await cards().count()===13&&patchCount()===1,'read Retry restores base page before View more without lost placement or repeated PATCH');
 await open('new-promos',2,undefined,true);
 check(await page.getByText('Bundle promos are currently unavailable.').count()===2&&await page.getByRole('button',{name:/Accept|Decline/}).count()===0&&patchCount()===0,'gate=false keeps group and linked member out of standalone actions');
 calls.length=0;await page.goto(origin+'/influencer/promos/new-promos?campaignBundleId='+id(400));await page.getByRole('heading',{name:'Service temporarily unavailable'}).waitFor();
 check(calls.length===0&&await page.getByRole('button',{name:/Accept|Decline/}).count()===0,'direct group query cannot enable actions or reader');
 check(errors.length===0,'no React page errors');return{passed:checks.length,checks,apiBoundary:'all GET/PATCH intercepted; no real Accept/Decline'};
}

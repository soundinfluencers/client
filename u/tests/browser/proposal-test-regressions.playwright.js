// Real Proposal page, Strategy save and Add Influencer readers; React Compiler via Vite.
// All HTTP API requests intercepted. Structural fixtures for pinned backend, not captured traffic.
async page => {
 const origin='http://127.0.0.1:5179',id=n=>n.toString(16).padStart(24,'0'),campaignId=id(700);
 const checks=[],calls=[],errors=[],check=(v,m)=>{if(!v)throw Error(m);checks.push(m);};
 page.on('pageerror',e=>errors.push(e.message));
 const source=await(await page.request.get(origin+'/src/widgets/client-side/campaign-tables/model/use-save-proposal.ts')).text();
 const hash=source.match(/react-query\.js\?v=([a-f\d]+)/)[1];
 const watchPending=()=>page.evaluate(()=>{window.pendingMessages=[];window.pendingObserver=new MutationObserver(()=>{for(const n of document.querySelectorAll('[role=alert]'))if(!n.closest('.Toastify')&&/write succeeded|reading is incomplete|synchronization is incomplete/i.test(n.textContent))window.pendingMessages.push(n.textContent);});window.pendingObserver.observe(document.getElementById('root'),{subtree:true,childList:true,characterData:true});});
 const stopPending=()=>page.evaluate(()=>{window.pendingObserver.disconnect();return window.pendingMessages;});
 const gate=()=>{let release;const promise=new Promise(r=>release=r);return{promise,release};};
 const content=(n=1)=>({_id:id(100+n),socialMedia:'instagram',socialMediaGroup:'main',profileType:'community',mainLink:'https://example.test/video/'+n,taggedLink:'https://example.test/tag',taggedUser:'@old',descriptions:[{_id:id(200+n*10),description:'First description'},{_id:id(201+n*10),description:'Second description'}],additionalBrief:[{_id:id(300+n*10),additionalBrief:'First brief'},{_id:id(301+n*10),additionalBrief:'Second brief'}]});
 const row=(n,profile='community')=>({addedAccountsId:id(400+n),socialAccountId:id(500+n),accountId:id(500+n),influencerId:id(600+n),socialMedia:'instagram',username:'Fixture '+n,profileType:profile,communityMusicGenres:['techno'],communityThemeTopics:['future-topic'],creatorMusicGenres:['techno'],creatorContentFocus:['future-focus'],dateRequest:'ASAP',followers:1000,logoUrl:'',price:50,prices:{EUR:50,USD:60,GBP:40},selectedContent:{campaignContentItemId:id(101),descriptionId:id(211),additionalBriefId:id(311)}});
 let options,readWait,createdWait,readFail=false,listCount=0,created=false;
 const reset=()=>{options=[0,1].map(optionIndex=>({optionIndex,canEdit:true,price:optionIndex?0:837,displayCurrency:optionIndex?'GBP':'USD',pricesByCurrency:{EUR:750,USD:837,GBP:625},addedAccounts:[row(1),row(2)],campaignContent:[content()],selectedOffer:null,addedBundles:[]}));readWait=undefined;readFail=false;created=false;};reset();
 const payload=index=>({campaignId,campaignName:'Fixture Proposal',socialMedia:'instagram',existingOptions:options.map(o=>o.optionIndex),selectedOption:structuredClone(options[index])});
 const html=`<!doctype html><html><head><script>window.RUNTIME_CONFIG={PUBLIC_API_URL:'${origin}/__fixture_api'};</script><script type="module">import R from '/@react-refresh';R.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;</script></head><body><div id="root"></div><script type="module" src="/__proposal-entry.js"></script></body></html>`;
 await page.unrouteAll({behavior:'ignoreErrors'});
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());if(url.origin!==origin)return route.abort();
  if(req.isNavigationRequest()&&url.pathname.startsWith('/client'))return route.fulfill({contentType:'text/html',body:html});
  if(url.pathname==='/__proposal-entry.js')return route.fulfill({contentType:'application/javascript',body:`
   import React from '/node_modules/.vite/deps/react.js?v=${hash}';import ReactDOM from '/node_modules/.vite/deps/react-dom_client.js?v=${hash}';
   import {NuqsAdapter} from '/node_modules/.vite/deps/nuqs_adapters_react-router_v6.js?v=${hash}';
   import {BrowserRouter,useLocation,useNavigate} from '/node_modules/.vite/deps/react-router-dom.js?v=${hash}';
   import {QueryClient,QueryClientProvider} from '/node_modules/.vite/deps/@tanstack_react-query.js?v=${hash}';
   import {ToastContainer} from '/node_modules/.vite/deps/react-toastify.js?v=${hash}';import '/node_modules/react-toastify/dist/ReactToastify.css';
   import {CampaignPage} from '/src/client-side/pages/campaign/campaign-page.tsx';
   import {CampaignStrategyPage} from '/src/pages/client-side/campaign-strategy-page/ui/campaign-strategy-page.tsx';
   import {CampaignPostContentRoute} from '/src/pages/client-side/campaign-post-content/ui/campaign-post-content-route.tsx';
   import {CampaignCreatorPage} from '/src/pages/client-side/campaign-creator-page/ui/campaign-creator-page.tsx';
   import {useInfiniteCampaignsQuery} from '/src/entities/client-side/dashboard/api/campaign.queries.ts';
   import {useFetchCampaign,useProposalAccountsStore,useUpdateCampaign} from '/src/client-side/store/index.ts';
   import {useCampaignBuilderStore} from '/src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts';
   import {useUser} from '/src/store/get-user/index.ts';import '/src/styles/_base.scss';
   useUser.setState({user:{firstName:'Fixture',role:'client'}});sessionStorage.setItem('lastCampaign',JSON.stringify({id:'${campaignId}',status:'proposal',optionIndex:0}));
   const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});
   client.setQueryData(['dashboard-campaigns','proposal'],{pages:[{items:[],hasMore:false}],pageParams:[1]});
   function Dashboard(){const query=useInfiniteCampaignsQuery('proposal');return React.createElement('p',null,'Dashboard '+(query.data?.pages.flatMap(p=>p.items).map(p=>p.campaignName).join(',')??''));}
   function Shell(){const location=useLocation(),navigate=useNavigate();window.controls={navigate,client,useFetchCampaign,useProposalAccountsStore,useUpdateCampaign,useCampaignBuilderStore};
    return location.pathname==='/client/campaign'?React.createElement(CampaignPage):location.pathname==='/client/strategy-fixture'?React.createElement(CampaignStrategyPage):location.pathname==='/client/create-campaign/content'?React.createElement(CampaignPostContentRoute):location.pathname==='/client/create-campaign'?React.createElement(CampaignCreatorPage):React.createElement(Dashboard);}
   ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(QueryClientProvider,{client},React.createElement(BrowserRouter,null,React.createElement(NuqsAdapter,null,React.createElement(React.Fragment,null,React.createElement(ToastContainer,{autoClose:false}),React.createElement(Shell))))));
  `});
  if(!url.pathname.startsWith('/__fixture_api'))return route.continue();
  const call={method:req.method(),path:url.pathname,query:Object.fromEntries(url.searchParams),body:['POST','PATCH','DELETE'].includes(req.method())?req.postDataJSON():undefined};calls.push(call);
  const wrap=data=>route.fulfill({json:{statusCode:200,data}});
  if(url.pathname==='/__fixture_api/proposal-system'&&req.method()==='POST'){
   const b=call.body;created=true;const index=url.searchParams.has('campaignId')?options.length:0;const added={optionIndex:index,canEdit:true,price:b.campaignPrice,displayCurrency:b.displayCurrency,campaignContent:b.campaignContent,addedAccounts:b.addedAccounts.map((r,i)=>({...r,addedAccountsId:id(401+i)})),selectedOffer:b.selectedOffer??null,addedBundles:[]};if(index)options.push(added);else options=[added];if(createdWait)readWait=createdWait;return wrap({campaignId,optionIndex:index,socialMedia:'instagram'});
  }
  if(url.pathname==='/__fixture_api/proposal-system/'+campaignId){
   const index=Number(url.searchParams.get('optionIndex')??0);
   if(req.method()==='PATCH'){const b=call.body;options[index]={...options[index],campaignContent:b.campaignContent,addedAccounts:b.addedAccounts,...(Object.hasOwn(b,'selectedOffer')?{selectedOffer:b.selectedOffer}:{})};return route.fulfill({json:{statusCode:200}});}
   if(req.method()==='GET'){const wait=readWait;if(wait)await wait.promise;if(readFail)return route.fulfill({status:503,json:{message:'Fixture read failed'}});return wrap(payload(index));}
  }
  if(url.pathname==='/__fixture_api/campaigns'){listCount++;return wrap({campaigns:created?[{_id:campaignId,campaignName:'Fresh created Proposal',status:'proposal',price:0,displayCurrency:'USD',creationDate:'2026-11-01'}]:[]});}
  if(url.pathname==='/__fixture_api/profile/filters')return wrap({filterArr:[]});
  if(url.pathname.includes('/offers/published/'))return wrap([]);
  if(url.pathname.includes('/profile/social-account/'))return wrap({accounts:[],total:0});
  if(url.pathname.includes('/social-account/categories')||url.pathname.includes('/genres'))return wrap([]);
  throw Error('Unexpected fixture API '+req.method()+' '+url.pathname);
 });
 await page.goto(origin+'/client/campaign');await page.locator('.content-cell-static').first().waitFor();
 check(await page.locator('.tableBase__row, tbody tr').count()>=2,'cold Proposal GET renders placements');
 await page.locator('.ViewAudience__btn').click();
 check(await page.locator('.chips').filter({hasText:'future-topic'}).count()>=2,'Advanced Insights combines topic-only compatible taxonomy with music');
 await page.locator('.ViewAudience__btn').click();
 await page.locator('.content-cell-static').first().click();await page.locator('.add-video').first().click();await page.getByPlaceholder('Paste video link...').fill('https://example.test/new-video');await page.getByRole('button',{name:'Create',exact:true}).click();
 await page.locator('.content-cell-static').first().getByText('Video 2',{exact:true}).waitFor();
 const composition=await page.evaluate(()=>{const s=window.controls.useProposalAccountsStore.getState();return{rows:s.accountsByOption[0],content:s.contentByOption[0],snapshot:s.optionSnapshotsByIndex[0]};});
 check(composition.rows[0].selectedCampaignContentItem.campaignContentItemId===composition.content.at(-1)._id&&composition.rows[1].selectedContent.campaignContentItemId===composition.content[0]._id,'real dropdown assigns new content only to originating placement');
 check(composition.content.at(-1).descriptions[0].description===''&&composition.content.at(-1).taggedUser===''&&composition.content.at(-1).additionalBrief.length===0,'new content has genuine blank description and absent optional brief ref');
 check(composition.rows[1].selectedContent.descriptionId===id(211)&&composition.rows[1].selectedContent.additionalBriefId===id(311),'neighbor retains selected second description and brief');

 // Edit the initial empty variant through the real description dropdown, not a store setter.
 const descriptionCell=()=>page.locator('tbody tr').filter({has:page.locator('.content-cell-static')}).first().locator('td').filter({has:page.locator('p.hidden-text.desc')});
 await descriptionCell().locator('p.hidden-text.desc').click();await page.locator('li.desc-li').first().dblclick();await page.locator('input.edit-desc').fill('Filled original description');await page.locator('input.edit-desc').press('Enter');
 await page.locator('li.desc-li').first().getByText('Filled original description',{exact:true}).waitFor();
 await page.locator('.campaignBase__title').first().click();
 check(await page.evaluate(({contentId,descriptionId})=>{const c=window.controls,s=c.useProposalAccountsStore.getState();const raw=s.contentByOption[0].find(item=>item._id===contentId);const patch=c.useUpdateCampaign.getState().patches[contentId];return raw.descriptions[0].description===''&&patch.descriptions[0]._id===descriptionId&&patch.descriptions[0].description==='Filled original description';},{contentId:composition.content.at(-1)._id,descriptionId:composition.content.at(-1).descriptions[0]._id}),'editing first variant keeps original ID and text in active scoped patch');
 let wait=gate();readWait=wait;await watchPending();
 await page.locator('.campaignBase__title-request.save').click();
 await page.waitForFunction(()=>document.querySelector('[inert]')!==null);
 await page.waitForTimeout(100);
 check(await page.locator('[class*=loader__bar]').count()===9&&await page.locator('p[role=alert]').filter({hasText:/write succeeded|synchronization is incomplete/i}).count()===0&&await page.getByRole('button',{name:'Retry reading option'}).count()===0,'normal PATCH-to-GET uses Loader without recovery flash');
 check((await stopPending()).length===0,'MutationObserver detects no recovery flash during normal write read');
 readFail=true;wait.release();await page.getByRole('button',{name:'Retry reading option'}).waitFor();const patchCount=calls.filter(c=>c.method==='PATCH').length;
 readFail=false;readWait=undefined;await page.getByRole('button',{name:'Retry reading option'}).click();await page.getByRole('button',{name:'Retry reading option'}).waitFor({state:'detached'});
 check(calls.filter(c=>c.method==='PATCH').length===patchCount,'failed authoritative GET recovers by GET only');
 check(calls.find(c=>c.method==='PATCH').body.addedAccounts[0].selectedCampaignContentItem.campaignContentItemId===composition.content.at(-1)._id&&calls.find(c=>c.method==='PATCH').body.campaignContent.at(-1).descriptions[0].description==='Filled original description','Save transport retains stable content and edited description IDs/text');
 await page.locator('.Toastify__close-button').evaluateAll(buttons=>buttons.forEach(b=>b.click()));
 wait=gate();readWait=wait;await watchPending();await page.locator('.option-list li').filter({hasText:'Option 2'}).click();await page.waitForTimeout(100);
 check(await page.locator('p[role=alert]').filter({hasText:/write succeeded|synchronization is incomplete/i}).count()===0,'normal option switch has no technical recovery text');
 readWait=undefined;wait.release();await page.getByText('Option 2 is already selected',{exact:true}).waitFor();check((await stopPending()).length===0,'MutationObserver detects no recovery flash throughout option switch');await page.locator('.option-list li').filter({hasText:'Option 1'}).click();await page.getByText('Option 1 is already selected',{exact:true}).waitFor();
 await page.getByText('Add Influencer',{exact:false}).first().click();await page.waitForURL('**/client/create-campaign?**');await page.waitForTimeout(300);
 check(await page.getByRole('alert').filter({hasText:/Selected content is missing/}).count()===0,'Add Influencer accepts freshly created content instead of a missing reference');
 check(await page.evaluate(()=>window.controls.useCampaignBuilderStore.getState().selectedAccounts[0]?.selectedCampaignContentItem?.campaignContentItemId)===composition.content.at(-1)._id,'builder preparation keeps selected new content');



 // A selected second variant never makes an unselected empty first variant valid.
 reset();await page.goto(origin+'/client/campaign');await page.locator('.content-cell-static').first().waitFor();
 await page.locator('.content-cell-static').first().click();await page.locator('.add-video').first().click();await page.getByPlaceholder('Paste video link...').fill('https://example.test/second-variant');await page.getByRole('button',{name:'Create',exact:true}).click();
 await descriptionCell().locator('p.hidden-text.desc').click();await page.getByText('Add new post description',{exact:true}).click();await page.getByPlaceholder('New post description...').fill('Chosen second text');await page.getByPlaceholder('New post description...').press('Enter');
 await descriptionCell().locator('p.hidden-text.desc').getByText('Chosen second text',{exact:true}).waitFor();
 const selectedSecond=await page.evaluate(()=>{const c=window.controls,s=c.useProposalAccountsStore.getState(),row=s.accountsByOption[0][0],item=s.contentByOption[0].at(-1);return{item,row,patch:c.useUpdateCampaign.getState().patches[item._id]};});
 const beforeBlocked=calls.filter(c=>c.method==='PATCH').length;await page.locator('.campaignBase__title-request.save').click();
 await page.getByText(new RegExp('content ID '+selectedSecond.item._id+'.*description 1 is empty')).waitFor();
 check(calls.filter(c=>c.method==='PATCH').length===beforeBlocked&&selectedSecond.patch.descriptions[0].description===''&&selectedSecond.row.selectedCampaignContentItem.descriptionId===selectedSecond.patch.descriptions[1]._id,'selected second text with empty first blocks PATCH and names exact content ID');
 await descriptionCell().locator('p.hidden-text.desc').click();await page.locator('li.desc-li').first().locator('.trash').click();await page.locator('li.desc-li').first().locator('.confirm-delete img').first().click();
 const afterRemove=await page.evaluate(()=>window.controls.useProposalAccountsStore.getState().accountsByOption[0][0].selectedCampaignContentItem);
 check(afterRemove.descriptionId===selectedSecond.patch.descriptions[1]._id,'deleting empty first keeps selected second reference');
 await page.locator('.campaignBase__title-request.save').click();await page.locator('.campaignBase__title-request.save').getByText('Saved',{exact:true}).waitFor();
 const sent=calls.filter(c=>c.method==='PATCH').at(-1).body;check(sent.campaignContent.at(-1).descriptions.length===1&&sent.campaignContent.at(-1).descriptions[0]._id===selectedSecond.patch.descriptions[1]._id&&sent.campaignContent.at(-1).descriptions[0].description==='Chosen second text','real delete-variant handler then Save sends only actual remaining description');
 // Creating an option uses the same pending/recovery boundary without another POST.
 reset();await page.goto(origin+'/client/campaign');await page.locator('.content-cell-static').first().waitFor();
 createdWait=gate();await watchPending();await page.getByText('Create additional proposal option',{exact:true}).click();
 const clonePosts=calls.filter(c=>c.method==='POST'&&c.path.endsWith('/proposal-system')).length;
 await page.getByRole('button',{name:'Yes',exact:true}).evaluate(el=>{el.click();el.click();});
 await page.waitForFunction(()=>window.controls.useFetchCampaign.getState().requestKey.endsWith(':2'));
 check(await page.locator('[class*=loader__bar]').count()===9&&await page.getByRole('button',{name:'Retry reading option'}).count()===0,'normal clone POST-to-GET uses Loader and hides recovery');
 createdWait.release();createdWait=undefined;readWait=undefined;await page.getByText('Option 3 is already selected',{exact:true}).waitFor();check((await stopPending()).length===0,'MutationObserver detects no recovery flash throughout clone');
 check(calls.filter(c=>c.method==='POST'&&c.path.endsWith('/proposal-system')).length===clonePosts+1,'clone double click sends one POST');
 await page.locator('.option-list li').filter({hasText:'Option 1'}).click();await page.getByText('Option 1 is already selected',{exact:true}).waitFor();
 await page.locator('.option-list li').filter({hasText:'Option 3'}).click();await page.getByText('Option 3 is already selected',{exact:true}).waitFor();
 check(await page.getByText('Add Influencer',{exact:false}).first().isVisible(),'completed clone permits normal option switches and Add Influencer');

 reset();await page.goto(origin+'/client/campaign');await page.locator('.content-cell-static').first().waitFor();
 await page.evaluate(({rows,content,campaignId})=>{const c=window.controls;c.useCampaignBuilderStore.getState().actions.reset();c.useCampaignBuilderStore.setState({campaignName:'New option from builder',selectedCurrency:'$',totalPrice:120,totalPriceReady:true,campaignContent:content,selectedAccounts:rows.map(r=>({...r,source:'manual',selectedCampaignContentItem:r.selectedContent}))});c.navigate('/client/create-campaign/content?mode=proposal-option-create&campaignId='+campaignId+'&sourceOption=0&currency=USD');},{rows:options[0].addedAccounts,content:options[0].campaignContent,campaignId});
 createdWait=gate();await page.getByRole('button',{name:'Create option',exact:true}).click();
 await page.waitForFunction(()=>window.controls.useFetchCampaign.getState().requestKey.endsWith(':2'));
 check(await page.locator('[class*=loader__bar]').count()===9&&await page.getByRole('button',{name:'Retry reading option'}).count()===0&&await page.locator('form').count()===1,'builder Content preserves form with Loader during normal created-option GET');
 readFail=true;createdWait.release();createdWait=undefined;await page.getByRole('button',{name:'Retry reading option'}).waitFor();
 const optionPosts=calls.filter(c=>c.method==='POST'&&c.path.endsWith('/proposal-system')).length;readFail=false;readWait=undefined;
 await page.getByRole('button',{name:'Retry reading option'}).click();await page.waitForURL('**/client/campaign');await page.getByText('Option 3 is already selected',{exact:true}).waitFor();
 check(calls.filter(c=>c.method==='POST'&&c.path.endsWith('/proposal-system')).length===optionPosts,'builder failed GET exposes real recovery and repeats only GET');
 // Full creator taxonomy, including only the second array. Keep disclosure blocks untouched.
 reset();options[0].addedAccounts=options[0].addedAccounts.map((r,i)=>({...r,profileType:i?'creator':'community',communityMusicGenres:[],creatorMusicGenres:[],communityThemeTopics:['ibiza'],creatorContentFocus:['music_dance']}));options[0].campaignContent.push({...content(2),profileType:'creator'});options[0].addedAccounts[1].selectedContent={campaignContentItemId:id(102),descriptionId:id(221),additionalBriefId:id(321)};
 await page.goto(origin+'/client/campaign');await page.locator('.content-cell-static').first().waitFor();await page.locator('.ViewAudience__btn').click();
 check(await page.locator('.chips').filter({hasText:'Ibiza'}).count()===1&&await page.locator('.chips').filter({hasText:'Dance'}).count()===1,'actual Advanced Insights renders normalized second-array-only community and creator labels');
 // The only Offer cannot be removed into a publicly invalid empty option.
 reset();options=options.slice(0,1);options[0].selectedOffer={offerId:id(900),selectedAccountIds:options[0].addedAccounts.map(r=>r.socialAccountId),selectedAddedAccountsIds:options[0].addedAccounts.map(r=>r.addedAccountsId)};
 await page.goto(origin+'/client/campaign');await page.locator('.trash-action__delete').first().waitFor();const mutations=calls.filter(c=>c.method==='PATCH'||c.method==='DELETE').length;
 await page.locator('.trash-action__delete').first().click();
 await page.getByText('Add another placement before removing this selection. A Proposal option cannot be saved without placements.',{exact:true}).waitFor();
 check(await page.locator('.trash-action__delete').count()===2&&calls.filter(c=>c.method==='PATCH'||c.method==='DELETE').length===mutations,'final whole Offer blocked without implicit option DELETE or partial removal');
 check(await page.getByText('Add Influencer',{exact:false}).first().isVisible()&&await page.locator('.option-list li img').count()===1,'Add Influencer and explicit final-option X remain available');
 // The active Strategy save hook marks the actual dashboard cache stale. Closing or Edit
 // can both return to a reader that fetches the new list without F5.
 for(const destination of ['close','edit']){
  reset();await page.evaluate(({rows,content})=>{const c=window.controls;c.useCampaignBuilderStore.getState().actions.reset();c.useCampaignBuilderStore.setState({campaignName:'Fresh created Proposal',selectedCurrency:'$',totalPrice:120,totalPriceReady:true,campaignContent:content,selectedAccounts:rows.map(r=>({...r,source:'manual',selectedCampaignContentItem:r.selectedContent}))});c.client.setQueryData(['dashboard-campaigns','proposal'],{pages:[{items:[],hasMore:false}],pageParams:[1]});c.navigate('/client/strategy-fixture');},{rows:options[0].addedAccounts,content:options[0].campaignContent});
  const beforePosts=calls.filter(c=>c.method==='POST'&&c.path.endsWith('/proposal-system')).length,beforeList=listCount;
  await page.getByRole('button',{name:'Save proposal',exact:true}).click();await page.getByRole('heading',{name:'Proposal saved',exact:true}).waitFor();
  check(await page.evaluate(()=>window.controls.client.getQueryState(['dashboard-campaigns','proposal']).isInvalidated),'successful initial POST invalidates dashboard before '+destination);
  if(destination==='close')await page.locator('.modal').click({position:{x:2,y:2}});
  else{await page.getByRole('button',{name:'Edit proposal',exact:true}).click();await page.waitForURL('**/client/campaign');await page.locator('.content-cell-static').first().waitFor();await page.evaluate(()=>window.controls.navigate('/client'));}
  await page.getByText('Dashboard Fresh created Proposal',{exact:true}).waitFor();
  check(listCount===beforeList+1&&calls.filter(c=>c.method==='POST'&&c.path.endsWith('/proposal-system')).length===beforePosts+1,'return through '+destination+' refetches dashboard with one POST and no reload');
 }
 check(errors.length===0,'React Compiler page has no runtime errors: '+JSON.stringify(errors));
 return{passed:checks.length,checks,requestCount:calls.length,patches:calls.filter(c=>c.method==='PATCH').length,posts:calls.filter(c=>c.method==='POST'&&c.path.endsWith('/proposal-system')).length,errors,listCount};
}

// Actual cells/readers and Payment with React Compiler; no real API mutations.
async page=>{
 const origin='http://127.0.0.1:5179',id='000000000000000000000700',checks=[],errors=[],calls=[];const check=(v,m)=>{if(!v)throw Error(m);checks.push(m)};page.on('pageerror',e=>errors.push(e.message));
 const hash=(await(await page.request.get(origin+'/src/client-side/pages/payment-campaign/payment-campaign.tsx')).text()).match(/react-query\.js\?v=([a-f\d]+)/)[1];
 let fail=false,releaseRead,readWait;
 const accounts=['community','creator'].map((profileType,i)=>({_id:'placement'+i,addedAccountsId:'placement'+i,socialAccountId:'account'+i,profileType,socialMedia:'instagram',username:'account'+i,communityMusicGenres:['techno'],communityThemeTopics:['ibiza','unknown-topic'],creatorMusicGenres:['techno'],creatorContentFocus:['music_dance','unknown-focus'],countries:[{country:'United Kingdom of Great Britain and Northern Ireland',percentage:37.85},{country:'Democratic Republic of the Congo',percentage:12.34}],selectedContent:null}));
 const saved={campaignId:id,campaignName:'Fixture',socialMedia:'instagram',existingOptions:[0,1],selectedOption:{optionIndex:1,canEdit:false,price:837,displayCurrency:'USD',addedAccounts:accounts,campaignContent:[],addedBundles:[],selectedOffer:null}};
 await page.route('**/*',async route=>{const r=route.request(),u=new URL(r.url());if(u.origin!==origin)return route.abort();
 if(r.isNavigationRequest())return route.fulfill({contentType:'text/html',body:`<html><head><script>window.RUNTIME_CONFIG={PUBLIC_API_URL:'${origin}/__api'};</script><script type="module">import R from '/@react-refresh';R.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;</script></head><body><div id="root"></div><script type="module" src="/__entry.js"></script></body></html>`});
 if(u.pathname==='/src/client-side/utils/payment-reference.ts')return route.fulfill({contentType:'application/javascript',body:"export const generatePaymentReferenceNumber=()=> 'FIXTURE';"});
 if(u.pathname==='/__entry.js')return route.fulfill({contentType:'application/javascript',body:`
 import React from '/node_modules/.vite/deps/react.js?v=${hash}';import ReactDOM from '/node_modules/.vite/deps/react-dom_client.js?v=${hash}';import {BrowserRouter} from '/node_modules/.vite/deps/react-router-dom.js?v=${hash}';import{QueryClient,QueryClientProvider,useQuery}from'/node_modules/.vite/deps/@tanstack_react-query.js?v=${hash}';
 import {AuthProvider}from'/src/contexts/AuthContext.tsx';import{PaymentCampaign}from'/src/client-side/pages/payment-campaign/payment-campaign.tsx';import{HistoricalPayment}from'/tests/browser/fixtures/payment-rescue-551dfc76.tsx';
 import{GenresCell}from'/src/client-side/widgets/campaign-share/cells/strategy/genres-cell.tsx';import{CountriesCell}from'/src/client-side/widgets/campaign-share/cells/strategy/countries-cell.tsx';import{toPublicShareCampaign}from'/src/client-side/pages/campaign-share/model/share-campaign-read.ts';import{toCampaignPageModelFromProposal}from'/src/client-side/utils/getCampaign.utils.ts';import $api from'/src/api/api.ts';import '/src/client-side/styles-table/table-base.scss';import '/src/styles/_base.scss';
 const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});
 function Share(){const q=useQuery({queryKey:['fixture-share',location.search],queryFn:async()=>{const res=await $api.get('/share-fixture'+location.search);return location.search.includes('proposal')?toCampaignPageModelFromProposal(res.data.data).selectedOption.addedAccounts:toPublicShareCampaign(res.data.data).addedAccounts;}});return React.createElement('table',{className:'tableBase',style:{width:'100%',tableLayout:'fixed'}},React.createElement('tbody',null,q.data?.map(row=>React.createElement('tr',{key:row.addedAccountsId},React.createElement(GenresCell,{data:row}),React.createElement(CountriesCell,{data:row})))));}
 ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(QueryClientProvider,{client},React.createElement(BrowserRouter,null,React.createElement(AuthProvider,null,location.pathname==='/share'?React.createElement(Share):location.pathname==='/historical'?React.createElement(HistoricalPayment):React.createElement(PaymentCampaign)))));
 `});
 if(!u.pathname.startsWith('/__api'))return route.continue();calls.push({path:u.pathname,method:r.method(),query:Object.fromEntries(u.searchParams)});const wrap=data=>route.fulfill({json:{statusCode:200,data}});
 if(u.pathname.endsWith('/auth/refresh'))return wrap({accessToken:'fixture'});if(u.pathname.endsWith('/auth/me'))return wrap({role:'client',firstName:'Fixture',lastName:'Client'});
 if(u.pathname.endsWith('/profile/invoice-details'))return wrap({firstName:'Fixture',lastName:'Client',address:'Address',country:'Germany',company:'',vatNumber:''});
 if(u.pathname.endsWith('/share-fixture'))return wrap(u.searchParams.has('proposal')?saved:{campaignName:'Fixture',addedAccounts:accounts});
 if(u.pathname.endsWith('/proposal-system/'+id)){if(r.method()!=='GET')throw Error('Unexpected mutation');if(readWait)await readWait;if(fail)return route.fulfill({status:503,json:{message:'Fixture read failed'}});return wrap(saved);}
 throw Error('Unexpected API '+r.method()+' '+u.pathname);
 });

 const rects=()=>page.locator('.payment-campaign__width,.payment-campaign__invoice,.payment-campaign__form .ul-bar').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return{x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}}));
 for(const width of [1280,390])for(const tab of ['Bank Card','PayPal','Bank Transfer']){
  await page.setViewportSize({width,height:900});readWait=new Promise(r=>releaseRead=r);
  await page.goto(origin+'/client/campaign/payment?proposal='+id+'&option=1');await page.locator('.payment-campaign__confirmation--loading').waitFor();
  await page.locator('.ul-bar li').filter({hasText:tab}).click();const loading=await rects();
  check(await page.locator('[class*=loader__bar]').count()===9,'native Loader during '+tab+' '+width);
  check(await page.locator('.base-confirmations').evaluate(n=>getComputedStyle(n).visibility==='hidden'),'confirmation reserves geometry invisibly '+tab+' '+width);
  releaseRead();readWait=null;await page.locator('.payment-campaign__confirmation--loading').waitFor({state:'detached'});const ready=await rects();
  check(JSON.stringify(loading)===JSON.stringify(ready),'stable pending-to-ready layout '+tab+' '+width+' '+JSON.stringify({loading,ready}));
  await page.locator('.ul-bar li').filter({hasText:'Bank Card'}).click();await page.locator('.ul-bar li').filter({hasText:'PayPal'}).click();await page.locator('.ul-bar li').filter({hasText:'Bank Transfer'}).click();
  check(await page.locator('.payment-campaign__width').evaluate(n=>n.scrollWidth<=n.clientWidth+1),'tabs remain within form '+width);
 }
 for(const width of [1280,390]){await page.setViewportSize({width,height:900});await page.goto(origin+'/client/campaign/payment?proposal='+id+'&option=1');await page.getByText(/837/).first().waitFor();check(await page.locator('.payment-campaign__width').evaluate(n=>n.scrollWidth<=n.clientWidth+1),'normal entry '+width);}
 check(errors.length===0,'no React errors '+JSON.stringify(errors));check(!calls.some(c=>c.method!=='GET'&&!c.path.endsWith('/auth/refresh')),'no business mutations');return{passed:checks.length,checks};
}

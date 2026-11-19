const {chromium,expect}=require('../frontend/node_modules/@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const out=path.resolve(__dirname,'youtube-proof');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1100,height:1100},serviceWorkers:'block'});
 const page=await context.newPage();
 let rule={enabled:false,privacy_level:'public'};
 const channel={id:'demo-channel',provider:'youtube',external_account_id:'demo-channel',display_name:'Demo channel',username:null,status:'active',avatar_url:null,metadata:{}};
 await page.route('**/api/**',async route=>{
  const u=new URL(route.request().url());let json={};
  if(u.pathname==='/api/auth/get-session')json={session:{id:'demo-session',userId:'demo-user',expiresAt:'2099-01-01T00:00:00Z'},user:{id:'demo-user',name:'Demo creator',email:'demo@example.com',emailVerified:true}};
  else if(u.pathname==='/api/social/providers')json={enabled:true,can_schedule:true,providers:[{provider:'youtube',display_name:'YouTube Shorts',configured:true,supported_privacy_levels:['public','unlisted','private']}]};
  else if(u.pathname==='/api/social/connections')json={connections:[{...channel,metadata:{youtube_automation:rule}}]};
  else if(u.pathname.endsWith('/automation')){rule=route.request().postDataJSON();json={automation:rule};}
  else if(u.pathname==='/api/social/posts')json={posts:[]};
  else if(u.pathname==='/api/announcements')json={announcements:[]};
  else if(u.pathname.includes('billing-summary'))json={monetization_enabled:false};
  else if(u.pathname.includes('feature-tours'))json={completed:['welcome']};
  return route.fulfill({json});
 });
 await page.goto('http://localhost:3107/settings/social');
 const heading=page.getByRole('heading',{name:'Automatic YouTube uploads'});
 await heading.waitFor({timeout:90000});await heading.scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(out,'automatic-uploads-off.png')});
 await page.getByRole('checkbox',{name:'Automatically upload new clips to this channel'}).check();
 await expect(page.getByLabel('YouTube visibility')).toHaveValue('public');
 await page.getByRole('button',{name:'Save automatic uploads'}).click();
 await expect(page.getByRole('checkbox',{name:'Automatically upload new clips to this channel'})).toBeChecked();
 await expect(page.getByText('Automatic upload settings saved.')).toBeVisible();
 await page.screenshot({path:path.join(out,'automatic-uploads-public.png')});
 await page.setViewportSize({width:390,height:844});await heading.scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(out,'automatic-uploads-mobile.png')});
 if(!await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth))throw Error('Mobile horizontal overflow');
 await Promise.race([(async()=>{await context.close();await browser.close();})(),new Promise(resolve=>setTimeout(resolve,10000))]);
 console.log('Browser proof captured; explicit public opt-in, saved feedback, and mobile layout verified');process.exit(0);
})().catch(e=>{console.error(e.message);process.exit(1)});



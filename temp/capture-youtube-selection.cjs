const {chromium,expect}=require('../frontend/node_modules/@playwright/test');
const path=require('node:path');const fs=require('node:fs');
(async()=>{
 const out=path.resolve(__dirname,'youtube-selection-proof');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1100,height:1100},recordVideo:{dir:out,size:{width:1100,height:1100}}});
 const page=await context.newPage();let posted=[];
 const clips=['An older clip worth sharing','A newly generated highlight','Keep this one for later'].map((title,index)=>({id:`demo-clip-${index}`,task_id:`demo-task-${index}`,clip_order:index+1,hook_title:title,text:'A useful idea from this conversation, ready to share with your audience.',duration:30+index*5,source_title:index?'Today’s generation':'Previous generation',created_at:index?'2026-11-19T00:00:00Z':'2026-10-01T00:00:00Z',post_status:null}));
 await page.route('**/api/**',async route=>{
  const u=new URL(route.request().url());let json={};
  if(u.pathname==='/api/auth/get-session')json={session:{id:'demo-session',userId:'demo-user',expiresAt:'2099-01-01T00:00:00Z'},user:{id:'demo-user',name:'Demo creator',email:'demo@example.com',emailVerified:true}};
  else if(u.pathname==='/api/social/providers')json={enabled:true,providers:[{provider:'youtube',display_name:'YouTube Shorts',configured:true,supported_privacy_levels:['public','private','unlisted']}]};
  else if(u.pathname==='/api/social/connections')json={connections:[{id:'demo-channel',provider:'youtube',display_name:'Demo channel',status:'active',metadata:{}}]};
  else if(u.pathname==='/api/social/clips')json={clips,next_cursor:null};
  else if(u.pathname==='/api/social/posts')json={posts:[]};
  else if(u.pathname==='/api/social/youtube/selected'){const b=route.request().postDataJSON();posted.push(b);json={post:{id:`demo-post-${posted.length}`,status:'queued',privacy_level:b.privacy_level}};}
  else if(u.pathname==='/api/announcements')json={announcements:[]};
  else if(u.pathname.includes('billing-summary'))json={monetization_enabled:false};
  return route.fulfill({json});
 });
 await page.goto('http://localhost:3107/settings/social');
 const heading=page.getByRole('heading',{name:'Publish your clips to YouTube'});await heading.waitFor({timeout:90000});
 await heading.scrollIntoViewIfNeeded();
 await page.getByRole('checkbox',{name:/An older clip worth sharing/}).check();
 await page.getByRole('checkbox',{name:/A newly generated highlight/}).check();
 await expect(page.getByRole('button',{name:'Publish 2 selected clips publicly'})).toBeEnabled();
 await page.screenshot({path:path.join(out,'selected-old-and-new.png')});
 await page.getByRole('button',{name:'Publish 2 selected clips publicly'}).click();
 await expect(page.getByText(/2 of 2 clips ready/)).toBeVisible();
 if(posted.length!==2||posted.some(p=>p.privacy_level!=='public'))throw Error('Incorrect selected posts');
 await page.screenshot({path:path.join(out,'uploads-queued.png')});
 await page.setViewportSize({width:390,height:844});await heading.scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});
 if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))throw Error('Mobile overflow');
 console.log('UI checks passed; finalizing video');await context.close();console.log('Video finalized');await browser.close();
 console.log('PASS: old/new clip selection, only selected public uploads, per-clip queue state, mobile layout');process.exit(0);
})().catch(e=>{console.error(e.message);process.exit(1)});


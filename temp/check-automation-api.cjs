const {randomUUID,randomBytes}=require('node:crypto');
const {PrismaClient}=require('../frontend/src/generated/prisma');
const db=new PrismaClient();
const email=`automation-check-${randomUUID()}@example.com`;
const id=randomUUID();const origin='http://localhost:3107';let uid;
(async()=>{
 const signup=await fetch(`${origin}/api/auth/sign-up/email`,{method:'POST',headers:{'content-type':'application/json',origin},body:JSON.stringify({name:'Demo creator',email,password:randomBytes(24).toString('base64url')})});
 if(!signup.ok)throw Error(`Demo sign-up HTTP ${signup.status}`);
 const data=await signup.json();uid=data.user.id;
 const cookie=signup.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
 await db.$executeRawUnsafe("INSERT INTO social_accounts(id,user_id,provider,external_account_id,display_name,access_token_encrypted,status,metadata) VALUES($1,$2,'youtube',$3,'Demo channel','synthetic-not-a-token','active','{}'::jsonb)",id,uid,`demo-${id}`);
 for(const enabled of [true,false]){
  const response=await fetch(`${origin}/api/social/connections/${id}/automation`,{method:'PUT',headers:{cookie,origin,'content-type':'application/json'},body:JSON.stringify({enabled,privacy_level:'public'})});
  if(!response.ok)throw Error(`Save automation HTTP ${response.status}`);
  const result=await response.json();if(result.automation.enabled!==enabled)throw Error('Saved state mismatch');
 }
 const connections=await fetch(`${origin}/api/social/connections`,{headers:{cookie,origin}});
 const listed=await connections.json();if(!listed.connections.some(c=>c.id===id&&c.metadata.youtube_automation.enabled===false))throw Error('Persisted setting missing');
 console.log('PASS: authenticated frontend proxy, enable public automation, disable, persisted channel settings');
})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(async()=>{await db.user.deleteMany({where:{email}});await db.$disconnect();console.log('Synthetic API fixtures removed');});

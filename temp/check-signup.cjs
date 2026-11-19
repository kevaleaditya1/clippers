const {randomUUID,randomBytes}=require('node:crypto');
const {PrismaClient}=require('../frontend/src/generated/prisma');
const db=new PrismaClient();
const email=`setup-check-${randomUUID()}@example.com`;
const password=randomBytes(24).toString('base64url');
const origin='http://localhost:3107';
async function request(path,body){
 const r=await fetch(`${origin}/api/auth/${path}`,{method:'POST',headers:{'content-type':'application/json',origin},body:JSON.stringify(body)});
 console.log(`${path}: HTTP ${r.status}`);
 if(!r.ok)throw Error(`Authentication check failed at ${path}`);
 return r;
}
(async()=>{
 await request('sign-up/email',{name:'Setup Demo',email,password});
 const signedIn=await request('sign-in/email',{email,password});
 const cookie=signedIn.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
 const session=await fetch(`${origin}/api/auth/get-session`,{headers:{cookie,origin}});
 const data=await session.json();
 if(!session.ok||data?.user?.email!==email)throw Error('Authenticated session check failed');
 console.log('Authenticated session verified');
})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(async()=>{
 await db.user.deleteMany({where:{email}});
 console.log('Temporary demo account removed');
 await db.$disconnect();
});

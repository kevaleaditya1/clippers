const {Prisma,PrismaClient}=require('../frontend/src/generated/prisma');
const db=new PrismaClient();
(async()=>{
 const columns=await db.$queryRawUnsafe("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public'");
 const actual=new Set(columns.map(c=>`${c.table_name}.${c.column_name}`));
 const missing=[];
 for(const model of Prisma.dmmf.datamodel.models){
  const table=model.dbName||model.name;
  for(const field of model.fields.filter(f=>f.kind!=='object')){
   const column=field.dbName||field.name;
   if(!actual.has(`${table}.${column}`))missing.push(`${table}.${column}`);
  }
 }
 console.log(JSON.stringify({missingColumns:missing},null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>db.$disconnect());

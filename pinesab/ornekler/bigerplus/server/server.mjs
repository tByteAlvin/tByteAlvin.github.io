import http from 'node:http';
import {mkdir, readFile, writeFile, rename} from 'node:fs/promises';
import path from 'node:path';
import {randomBytes,randomUUID,createHash,timingSafeEqual} from 'node:crypto';

const PORT=Number(process.env.PORT||8080);
const DATA_DIR=path.resolve(process.env.DATA_DIR||path.join(process.cwd(),'private_data'));
const FILE=path.join(DATA_DIR,'messages-and-bookings.json');
const SECRET=process.env.ADMIN_SECRET||'';
const ORIGINS=(process.env.ALLOWED_ORIGINS||'https://tbytealvin.github.io').split(',').map(x=>x.trim()).filter(Boolean);
const BRANDS=new Set(['velora-motors','aurevia-otel','mira-sac-studyosu','bordo-barber','mora-mutfak','arelia-mucevher','nove-fitness','katman-mimarlik','aurelia-cove','mira-noir']);
if(SECRET.length<24){console.error('ADMIN_SECRET must be at least 24 characters.');process.exit(1)}
await mkdir(DATA_DIR,{recursive:true,mode:0o700});
let db={appointments:[],threads:[]};
try{const existing=JSON.parse(await readFile(FILE,'utf8'));if(Array.isArray(existing.appointments)&&Array.isArray(existing.threads))db=existing}catch(e){if(e.code!=='ENOENT')throw e}
let lock=Promise.resolve(),lastCleanup=Date.now();
const hits=new Map();
function rate(ip){const now=Date.now();if(now-lastCleanup>120000){for(const [k,v]of hits)if(v.expires<now)hits.delete(k);lastCleanup=now}const v=hits.get(ip)||{num:0,expires:now+60000};if(now>v.expires){v.num=0;v.expires=now+60000}v.num++;hits.set(ip,v);return v.num<=22}
function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(JSON.stringify(body))}
function safe(v,max=160){return typeof v==='string'?v.trim().slice(0,max):''}
function validPhone(v){return /^[+()0-9 \-]{8,24}$/.test(v)}
function auth(req){const x=req.headers.authorization||'',t=x.startsWith('Bearer ')?x.slice(7):'';const a=Buffer.from(t),b=Buffer.from(SECRET);return a.length===b.length&&timingSafeEqual(a,b)}
async function body(req){let raw='',total=0;for await(const c of req){total+=c.length;if(total>12000)throw Error('Body too large');raw+=c}try{return JSON.parse(raw)}catch{throw Error('Invalid JSON')}}
function persist(fn){const result=lock.then(async()=>{const output=fn();const tmp=FILE+'.'+randomUUID()+'.tmp';await writeFile(tmp,JSON.stringify(db),{encoding:'utf8',mode:0o600});await rename(tmp,FILE);return output});lock=result.then(()=>{},()=>{});return result}
function tokenHash(s){return createHash('sha256').update(String(s)).digest('hex')}
function hasToken(req,thread){const h=safe(req.headers['x-thread-token'],140);const x=Buffer.from(tokenHash(h)),y=Buffer.from(thread.tokenHash);return x.length===y.length&&timingSafeEqual(x,y)}
const app=http.createServer(async(req,res)=>{
const origin=req.headers.origin||'';const allowed=ORIGINS.includes(origin);
if(allowed){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, X-Thread-Token');res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, OPTIONS')}
if(req.method==='OPTIONS'){res.writeHead(allowed?204:403);return res.end()}
if(origin&&!allowed)return json(res,403,{error:'Origin not allowed'});
if(req.url==='/health')return json(res,200,{ok:true});
const url=new URL(req.url,'http://localhost'),p=url.pathname.split('/').filter(Boolean);
if(p[0]!=='api'||!BRANDS.has(p[1]))return json(res,404,{error:'Unknown route'});
const brand=p[1],ip=req.socket.remoteAddress||'unknown';
try{
if(req.method==='POST'&&!rate(ip))return json(res,429,{error:'Too many requests'});
if(p[2]==='appointments'&&p.length===3&&req.method==='POST'){
 const d=await body(req),name=safe(d.name,100),phone=safe(d.phone,30),date=safe(d.date,10),time=safe(d.time,5),service=safe(d.service,110),notes=safe(d.notes,900),email=safe(d.email,150);
 if(name.length<2||!validPhone(phone)||!date.match(/^\d{4}-\d{2}-\d{2}$/)||!time.match(/^([01]\d|2[0-3]):[0-5]\d$/)||service.length<2)return json(res,422,{error:'Name, phone, date, time and service are required'});
 const day=new Date(date+'T00:00:00Z');if(!Number.isFinite(day.getTime())||day.toISOString().slice(0,10)!==date)return json(res,422,{error:'Invalid date'});
 const rec={id:randomUUID(),brand,name,phone,date,time,service,notes,email,status:'new',createdAt:new Date().toISOString()};
 await persist(()=>db.appointments.push(rec));return json(res,201,{ok:true,request:{id:rec.id,status:'pending',createdAt:rec.createdAt},message:'Your request was received, but the appointment has not been confirmed'});
}
if(p[2]==='threads'&&p.length===3&&req.method==='POST'){
 const d=await body(req),name=safe(d.name,100),contact=safe(d.contact,150),msg=safe(d.message,1600);
 if(name.length<2||contact.length<5||msg.length<3)return json(res,422,{error:'Name, contact and message are required'});
 const token=randomBytes(32).toString('hex'),record={id:randomUUID(),brand,name,contact,tokenHash:tokenHash(token),status:'new',createdAt:new Date().toISOString(),messages:[{id:randomUUID(),author:'visitor',text:msg,at:new Date().toISOString()}]};
 await persist(()=>db.threads.push(record));return json(res,201,{ok:true,id:record.id,accessToken:token});
}
if(p[2]==='threads'&&p.length>=4&&p[3]!=='admin'){
 const record=db.threads.find(x=>x.brand===brand&&x.id===p[3]);if(!record||!hasToken(req,record))return json(res,404,{error:'Thread not found'});
 if(req.method==='GET'&&p.length===4)return json(res,200,{id:record.id,name:record.name,status:record.status,messages:record.messages});
 if(req.method==='POST'&&p[4]==='reply'){const d=await body(req),msg=safe(d.message,1600);if(msg.length<1)return json(res,422,{error:'Message required'});await persist(()=>{record.messages.push({id:randomUUID(),author:'visitor',text:msg,at:new Date().toISOString()});record.status='waiting'});return json(res,201,{ok:true})}
}
if(p[2]==='admin'){
 if(!auth(req))return json(res,401,{error:'Admin authorization required'});
 if(req.method==='GET'&&p.length===4&&p[3]==='dashboard')return json(res,200,{appointments:db.appointments.filter(x=>x.brand===brand).slice(-250).reverse(),threads:db.threads.filter(x=>x.brand===brand).slice(-250).reverse().map(({tokenHash,...x})=>x)});
 if(req.method==='PATCH'&&p[3]==='appointments'&&p.length===5){const v=db.appointments.find(x=>x.brand===brand&&x.id===p[4]);if(!v)return json(res,404,{error:'Not found'});const d=await body(req);if(!['new','contacted','confirmed','cancelled','completed'].includes(d.status))return json(res,422,{error:'Invalid status'});await persist(()=>{v.status=d.status});return json(res,200,{ok:true})}
 if(req.method==='POST'&&p[3]==='threads'&&p[5]==='reply'&&p.length===6){const v=db.threads.find(x=>x.brand===brand&&x.id===p[4]);if(!v)return json(res,404,{error:'Not found'});const d=await body(req),msg=safe(d.message,1600);if(!msg)return json(res,422,{error:'Message required'});await persist(()=>{v.messages.push({id:randomUUID(),author:'admin',text:msg,at:new Date().toISOString()});v.status='replied'});return json(res,201,{ok:true})}
 }
return json(res,404,{error:'Unknown route'});
}catch(e){return json(res,e.message==='Body too large'?413:400,{error:e.message==='Invalid JSON'?'Invalid JSON':'Request could not be processed'})}
});
app.listen(PORT,'0.0.0.0',()=>console.log('BigerPlus API listening on '+PORT));

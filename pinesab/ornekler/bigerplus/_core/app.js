
'use strict';
(()=>{
const S=window.PS_CONFIG||{},slug=S.slug||'demo',api=(S.apiBase||'').replace(/\/$/,'');
const $=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)];
const demoKey='PS_DEMO_'+slug,langKey='PS_LANG_'+slug,contentKey='PS_CONTENT_'+slug,threadKey='PS_THREAD_'+slug;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let lang='tr',dict={},sound=false,audioCtx,thread=null;
const originalMarkup=new WeakMap();
function get(k){try{return localStorage.getItem(k)}catch{return null}}
function set(k,v){try{localStorage.setItem(k,v);return true}catch{return false}}
function state(){try{const d=JSON.parse(get(demoKey)||'{}');return {appointments:d.appointments||[],threads:d.threads||[]}}catch{return {appointments:[],threads:[]}}}
function save(s){return set(demoKey,JSON.stringify(s))}
const guid=()=>crypto.randomUUID?.()||'demo-'+Date.now()+'-'+Math.random().toString(36).slice(2);
function t(key,def){const v=key.split('.').reduce((o,p)=>o?.[p],dict);return typeof v==='string'?v:def||key}
function guess(){const stored=get(langKey);if(['tr','en','de'].includes(stored))return stored;let zone='';try{zone=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch{}if(zone==='Europe/Istanbul')return 'tr';if(['Europe/Berlin','Europe/Vienna','Europe/Zurich'].includes(zone))return 'de';const n=(navigator.languages?.[0]||navigator.language||'').toLowerCase();return n.startsWith('tr')?'tr':n.startsWith('de')?'de':'en'}
async function locale(code,remember=false){if(!['tr','en','de'].includes(code))code='tr';let d={};try{const r=await fetch('locales/'+code+'.json');if(!r.ok)throw Error('Language unavailable');d=await r.json()}catch{if(code!=='tr')return locale('tr',remember)}dict=d;lang=code;document.documentElement.lang=code;if(remember)set(langKey,code);
for(const el of all('[data-content]')){if(!originalMarkup.has(el))originalMarkup.set(el,el.innerHTML);else el.innerHTML=originalMarkup.get(el)}
for(const e of all('[data-t]')){const v=t(e.dataset.t,null);if(v!==e.dataset.t)e.textContent=v}
for(const e of all('[data-t-placeholder]')){const v=t(e.dataset.tPlaceholder,null);if(v!==e.dataset.tPlaceholder)e.setAttribute('placeholder',v)}
for(const e of all('[data-lang]'))e.value=code;
applyContent();
}
function applyContent(){let d;try{d=JSON.parse(get(contentKey)||'{}')}catch{return}if(!d)return;for(const e of all('[data-content]')){const v=d[lang]?.[e.dataset.content];if(typeof v==='string'&&v)e.textContent=v}
if(/^#[0-9a-f]{6}$/i.test(d.accent||''))document.documentElement.style.setProperty('--accent',d.accent);
if(/^data:image\/(png|jpeg|webp);base64,/.test(d.logo||''))for(const im of all('[data-brand-logo]'))im.src=d.logo;
if(d.photos&&typeof d.photos==='object')for(const im of all('[data-slot]')){const src=d.photos[im.dataset.slot];if(typeof src==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(src)){im.src=src;im.dataset.custom='true';im.removeAttribute('data-remote')}}
}
function beep(){if(!sound)return;try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain(),now=audioCtx.currentTime;o.type='sine';o.frequency.setValueAtTime(420,now);o.frequency.exponentialRampToValueAtTime(650,now+.10);g.gain.setValueAtTime(.026,now);g.gain.exponentialRampToValueAtTime(.001,now+.15);o.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+.16)}catch{}}
function navigation(){
const overlay=$('#menuOverlay'),toggle=$('#menuToggle'),close=$('#closeOverlay');
function show(value){overlay?.classList.toggle('open',value);overlay?.setAttribute('aria-hidden',String(!value));toggle?.setAttribute('aria-expanded',String(value));document.body.classList.toggle('nav-open',value);if(value)beep()}
toggle?.addEventListener('click',()=>show(!overlay?.classList.contains('open')));close?.addEventListener('click',()=>show(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape')show(false)});
for(const e of all('[data-lang]'))e.addEventListener('change',ev=>{locale(ev.target.value,true);beep()});
const snd=$('#soundToggle');snd?.addEventListener('click',()=>{sound=!sound;snd.setAttribute('aria-pressed',String(sound));snd.textContent=sound?'♫ ON':'♪ OFF';if(sound)beep()});
for(const a of all('a[href]'))a.addEventListener('click',e=>{const h=a.getAttribute('href')||'';if(reduced||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.target||/^(#|mailto:|tel:|https?:|\/\/)/i.test(h))return;const u=new URL(a.href);if(u.origin!==location.origin||!u.pathname.endsWith('.html'))return;e.preventDefault();beep();$('#routeWipe')?.classList.add('active');setTimeout(()=>location.assign(a.href),550)});
}
function motion(){
if(!reduced&&'IntersectionObserver'in window){const io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}},{threshold:.07,rootMargin:'0px 0px 90px 0px'});for(const e of all('[data-reveal]'))io.observe(e)}else for(const e of all('[data-reveal]'))e.classList.add('visible');
if(!reduced&&matchMedia('(pointer:fine)').matches){const glow=$('#cursorGlow');addEventListener('pointermove',e=>{if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';glow.style.opacity='1'}},{passive:true});
for(const el of all('[data-tilt]')){el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(900px) rotateX('+(-y*7)+'deg) rotateY('+(x*8)+'deg)'});el.addEventListener('pointerleave',()=>el.style.transform='')}}
let busy=false;addEventListener('scroll',()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;const p=$('#scrollProgress');if(p)p.style.transform='scaleX('+(max>0?scrollY/max:0)+')';if(!reduced)for(const el of all('[data-parallax]')){const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)el.style.transform='translateY('+((innerHeight/2-r.top-r.height/2)*.045)+'px) scale(1.045)'}busy=false})},{passive:true});
}
function images(){const load=e=>{const u=e.dataset.remote;if(!u||e.dataset.custom==='true')return;const p=new Image();p.onload=()=>{if(e.dataset.custom==='true')return;e.src=u;e.removeAttribute('data-remote')};p.onerror=()=>{e.removeAttribute('data-remote');e.dataset.fallback='true'};p.src=u};
const io='IntersectionObserver'in window?new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){load(e.target);io.unobserve(e.target)}},{rootMargin:'360px'}):null;for(const e of all('img[data-remote]')){if(io&&e.loading==='lazy')io.observe(e);else load(e)}}
async function post(endpoint,data){const r=await fetch(api+'/api/'+slug+'/'+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const d=await r.json().catch(()=>({error:'Network error'}));if(!r.ok)throw Error(d.error||'Server error');return d}
function fields(f){return Object.fromEntries([...new FormData(f)].map(([k,v])=>[k,String(v).trim()]))}
function booking(){
const f=$('#bookingForm');if(!f)return;const date=f.querySelector('[name=date]');if(date){const d=new Date();date.min=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
f.addEventListener('submit',async e=>{e.preventDefault();const d=fields(f),status=$('#bookingStatus'),b=f.querySelector('[type=submit]');if(!d.name||!d.phone||!d.date||!d.time||!d.service)return;
b.disabled=true;status.textContent=t('status.sending','Gönderiliyor...');try{if(api){await post('appointments',d);status.textContent=t('status.bookingReal','Talep sisteme alındı; henüz onaylanmadı.')}else{const s=state();s.appointments.push({id:guid(),...d,status:'demo',createdAt:new Date().toISOString()});save(s);status.textContent=t('status.bookingDemo','DEMO: Yalnızca bu tarayıcıya kaydedildi. İşletmeye gönderilmedi.')}status.className='form-status ok';f.reset()}catch(err){status.textContent=t('status.error','İşlem başarısız.')+' '+err.message;status.className='form-status error'}finally{b.disabled=false}});
}
function chat(){
const panel=$('#chatPanel'),launch=$('#chatLaunch'),close=$('#chatClose'),newForm=$('#chatStart'),reply=$('#chatReply'),status=$('#chatStatus');if(!panel)return;
const info=s=>status.textContent=s;
function showThread(v){thread=v;$('#chatNew').hidden=!!v;$('#chatOngoing').hidden=!v;if(v)refresh()}
async function refresh(){if(!thread)return;try{let list;if(api){const r=await fetch(api+'/api/'+slug+'/threads/'+thread.id,{headers:{'X-Thread-Token':thread.token}});if(!r.ok)throw Error('Thread unavailable');list=(await r.json()).messages}else{const x=state().threads.find(x=>x.id===thread.id);if(!x)throw Error('Demo thread not found');list=x.messages}const box=$('#chatBubbles');box.replaceChildren();for(const m of list){const b=document.createElement('div');b.className='bubble '+(m.author==='admin'?'admin':'visitor');b.textContent=m.text;box.append(b)}box.scrollTop=box.scrollHeight;info(api?t('chat.connected','Sunucu bağlantısı açık'):t('chat.demo','DEMO: Yalnızca bu tarayıcıda'))}catch(e){info(t('status.error','Hata')+': '+e.message)}}
for(const x of all('[data-open-chat]'))if(x!==launch)x.addEventListener('click',()=>launch.click());
launch.addEventListener('click',()=>{const active=!panel.classList.contains('open');panel.classList.toggle('open',active);if(active){beep();try{showThread(JSON.parse(sessionStorage.getItem(threadKey)||'null'))}catch{showThread(null)}}});close?.addEventListener('click',()=>panel.classList.remove('open'));
newForm?.addEventListener('submit',async e=>{e.preventDefault();const d=fields(newForm);info(t('status.sending','Gönderiliyor...'));try{let id,token;if(api){const r=await post('threads',d);id=r.id;token=r.accessToken}else{const s=state();id=guid();token='demo';s.threads.push({id,name:d.name,contact:d.contact,createdAt:new Date().toISOString(),status:'demo',messages:[{author:'visitor',text:d.message,at:new Date().toISOString()}]});save(s)}const v={id,token};sessionStorage.setItem(threadKey,JSON.stringify(v));newForm.reset();showThread(v)}catch(e){info(t('status.error','Gönderilemedi')+': '+e.message)}});
reply?.addEventListener('submit',async e=>{e.preventDefault();if(!thread)return;const message=String(new FormData(reply).get('message')||'').trim();if(!message)return;try{if(api){const r=await fetch(api+'/api/'+slug+'/threads/'+thread.id+'/reply',{method:'POST',headers:{'Content-Type':'application/json','X-Thread-Token':thread.token},body:JSON.stringify({message})});if(!r.ok)throw Error('Message failed')}else{const s=state(),v=s.threads.find(x=>x.id===thread.id);if(v){v.messages.push({author:'visitor',text:message,at:new Date().toISOString()});save(s)}}reply.reset();refresh()}catch(e){info(e.message)}});
$('#chatRefresh')?.addEventListener('click',refresh);
setInterval(()=>{if(api&&panel.classList.contains('open')&&thread)refresh()},20000);
}
function extras(){for(const b of all('[data-gallery-next]'))b.addEventListener('click',()=>{const row=$('#galleryRail');row?.scrollBy({left:row.clientWidth*.75,behavior:'smooth'});beep()});for(const b of all('[data-gallery-prev]'))b.addEventListener('click',()=>$('#galleryRail')?.scrollBy({left:-$('#galleryRail').clientWidth*.75,behavior:'smooth'}));
for(const b of all('[data-filter]'))b.addEventListener('click',()=>{for(const x of all('[data-filter]'))x.classList.toggle('active',x===b);for(const c of all('[data-filter-item]'))c.hidden=b.dataset.filter!=='all'&&c.dataset.filterItem!==b.dataset.filter});
}
function init(){navigation();motion();images();booking();chat();extras();locale(guess())}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

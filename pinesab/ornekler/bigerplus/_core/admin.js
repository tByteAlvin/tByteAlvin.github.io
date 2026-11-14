
'use strict';
(()=>{
const S=window.PS_CONFIG||{},slug=S.slug,api=String(S.apiBase||'').replace(/\/$/,'');
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
const demoKey='PS_DEMO_'+slug,contentKey='PS_CONTENT_'+slug;
let secret='',appointments=[],threads=[],activeThread=null,content={},contentLang='tr';
function get(k){try{return localStorage.getItem(k)}catch{return null}}
function set(k,v){try{localStorage.setItem(k,v);return true}catch{return false}}
function demo(){try{const d=JSON.parse(get(demoKey)||'{}');return {appointments:d.appointments||[],threads:d.threads||[]}}catch{return {appointments:[],threads:[]}}}
function notify(s,ok=false){$('#status').textContent=s;$('#status').classList.toggle('ok',ok)}
function element(tag,txt,cls){const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;if(cls)e.className=cls;return e}
function add(p,...e){p.append(...e);return p}
function show(id){for(const b of all('[data-tab]'))b.classList.toggle('active',b.dataset.tab===id);for(const s of all('[data-section]'))s.classList.toggle('visible',s.dataset.section===id);$('#sectionName').textContent={appointments:'Randevular',threads:'Mesaj Kutusu',content:'İçerik Stüdyosu'}[id]||'Panel'}
for(const b of all('[data-tab]'))b.addEventListener('click',()=>show(b.dataset.tab));
function authHeaders(){return {Authorization:'Bearer '+secret,'Content-Type':'application/json'}}
async function call(method,payload,route){const r=await fetch(api+'/api/'+slug+'/admin/'+route,{method,headers:authHeaders(),body:payload?JSON.stringify(payload):undefined});const d=await r.json().catch(()=>({error:'Network error'}));if(!r.ok)throw Error(d.error||'Server error');return d}
async function refresh(){try{if(api){if(!secret){notify('Canlı sunucu için yönetici parolasını girin.');return}const r=await call('GET',null,'dashboard');appointments=r.appointments;threads=r.threads;notify('Canlı sunucu kayıtları getirildi.',true)}else{const d=demo();appointments=d.appointments;threads=d.threads;notify('DEMO: yalnızca bu tarayıcının kayıtları görüntüleniyor.',true)}render()}catch(e){notify('Bağlantı hatası: '+e.message)}}
$('#adminLogin').addEventListener('click',()=>{secret=$('#adminPassword').value;$('#adminPassword').value='';refresh()});
$('#refreshBtn').addEventListener('click',refresh);
$('#apiNotice').textContent=api?'CANLI API yapılandırılmış. Şifreyi girip giriş yaptığında bu sunucudaki kayıtları yönetebilirsin.':'DEMO MODU: Randevular ve mesajlar yalnızca bu tarayıcıda tutulur. Başka ziyaretçilerin bilgileri bu panele gelmez.';
$('#apiLogin').hidden=!api;
function render(){renderStats();renderAppointments();renderThreads()}
function renderStats(){$('#countBookings').textContent=appointments.length;$('#countThreads').textContent=threads.length;$('#countPending').textContent=appointments.filter(x=>x.status==='new'||x.status==='demo').length}
function renderAppointments(){const target=$('#appointmentsList');target.replaceChildren();if(!appointments.length){target.append(element('div','Henüz randevu talebi yok.','empty'));return}
for(const r of appointments){const box=element('article',null,'record'),top=element('div',null,'record-top'),heading=element('div'),h=element('h3',r.name+' · '+r.service),meta=element('div',null,'meta'),info=element('p',r.date+'  '+r.time+' · '+r.phone+' · '+(r.email||'')),note=element('p',r.notes||'Not eklenmedi.'),actions=element('div',null,'toolbar'),select=element('select');
heading.append(h,info);top.append(heading,element('span',r.status||'new','badge'));
for(const opt of [['new','Yeni'],['contacted','İletişime geçildi'],['confirmed','Onaylandı'],['cancelled','İptal'],['completed','Tamamlandı']]){const o=element('option',opt[1]);o.value=opt[0];if(r.status===opt[0])o.selected=true;select.append(o)}
const save=element('button','Durumu kaydet','btn');save.addEventListener('click',async()=>{try{if(api)await call('PATCH',{status:select.value},'appointments/'+r.id);else{const d=demo(),item=d.appointments.find(x=>x.id===r.id);if(item)item.status=select.value;set(demoKey,JSON.stringify(d))}await refresh()}catch(e){notify(e.message)}});
actions.append(select,save);box.append(top,note,actions);target.append(box)}
}
function renderThreads(){const target=$('#threadsList');target.replaceChildren();if(!threads.length){target.append(element('div','Henüz mesaj yok.','empty'));return}
for(const r of threads){const box=element('article',null,'record'),top=element('div',null,'record-top'),head=element('div'),h=element('h3',r.name),info=element('p',r.contact+' · '+r.createdAt),bubbles=element('div',null,'bubbles'),reply=element('textarea'),send=element('button','Yanıtı gönder','btn primary');head.append(h,info);top.append(head,element('span',r.status||'new','badge'));for(const m of r.messages||[])bubbles.append(element('div',m.text,'bubble '+(m.author==='admin'?'admin':'visitor')));reply.placeholder='Yanıtınızı yazın...';send.addEventListener('click',async()=>{const msg=reply.value.trim();if(!msg)return;try{if(api)await call('POST',{message:msg},'threads/'+r.id+'/reply');else{const d=demo(),x=d.threads.find(x=>x.id===r.id);if(x){x.messages.push({author:'admin',text:msg,at:new Date().toISOString()});x.status='replied';set(demoKey,JSON.stringify(d))}}await refresh()}catch(e){notify(e.message)}});box.append(top,bubbles,reply,send);target.append(box)}
}
try{content=JSON.parse(get(contentKey)||'{}')}catch{content={}}
const ids=['heroTitle','heroLead','cta','storyTitle','storyBody'];
const cLang=$('#contentLanguage');cLang.addEventListener('change',()=>{contentLang=cLang.value;populate()});
function populate(){for(const id of ids)$('#edit_'+id).value=content[contentLang]?.[id]||'';$('#editAccent').value=content.accent||S.accent||'#bff179'}
$('#saveContent').addEventListener('click',()=>{content[contentLang]??={};for(const id of ids)content[contentLang][id]=$('#edit_'+id).value;content.accent=$('#editAccent').value;set(contentKey,JSON.stringify(content));notify('İçerik bu tarayıcıya kaydedildi. Diğer ziyaretçilere yayımlanmadı.',true)});
$('#resetContent').addEventListener('click',()=>{if(!confirm('Yerel içerik değişiklikleri temizlensin mi?'))return;content={};localStorage.removeItem(contentKey);populate();notify('Örnek site içerikleri varsayılana döndü.',true)});
$('#exportContent').addEventListener('click',()=>{const b=new Blob([JSON.stringify({site:slug,content},null,2)],{type:'application/json'}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=slug+'-icerik.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
$('#exportInbox').addEventListener('click',()=>{const b=new Blob([JSON.stringify({appointments,threads},null,2)],{type:'application/json'}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=slug+'-kayitlar.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
$('#clearDemo').addEventListener('click',()=>{if(api)return;if(!confirm('Bu tarayıcıdaki tüm demo randevu ve mesaj kayıtları silinsin mi?'))return;localStorage.removeItem(demoKey);refresh()});
async function photo(input){const f=input.files?.[0];if(!f||!['image/png','image/jpeg','image/webp'].includes(f.type))return;const im=new Image(),url=URL.createObjectURL(f);im.onload=()=>{const c=document.createElement('canvas'),k=Math.min(1,400/Math.max(im.width,im.height));c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));c.getContext('2d').drawImage(im,0,0,c.width,c.height);content.logo=c.toDataURL('image/png');set(contentKey,JSON.stringify(content));notify('Logo bu tarayıcıya kaydedildi.',true);URL.revokeObjectURL(url)};im.src=url}
$('#logoUpload').addEventListener('change',e=>photo(e.target));
populate();show('appointments');refresh();
})();

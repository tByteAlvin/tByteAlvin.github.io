
'use strict';
(()=>{
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const site=window.BIG_SITE||{},pages=window.BIG_PAGES||[];
 const key='PINESAB_BIG_V1_'+(site.slug||'unknown');
 const frame=$('#preview'),pagesEl=$('#pageSelect'),list=$('#elements'),status=$('#status');
 let saved={},draft={},history=[],future=[],currentKey=null,page='index.html',drag=null;
 const clone=o=>JSON.parse(JSON.stringify(o||{}));
 try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}draft=clone(saved);
 function notice(msg,ok){status.textContent=msg;status.classList.toggle('success',!!ok)}
 function snapshot(){history.push(clone(draft));if(history.length>40)history.shift();future=[]}
 function doc(){return frame.contentDocument}
 function el(){return currentKey?doc()?.querySelector('[data-edit="'+CSS.escape(currentKey)+'"]'):null}
 function draw(){try{frame.contentWindow.BigRuntime?.apply(draft)}catch(e){}renderItems();select(currentKey,false);drawGlobal()}
 function mutate(fn){snapshot();fn();draw();notice('Değişiklik henüz kaydedilmedi.')}
 pages.forEach(p=>{const o=document.createElement('option');o.value=p.file;o.textContent=p.title;pagesEl.append(o)});
 function changePage(v){page=v;currentKey=null;frame.src=v}
 pagesEl.addEventListener('change',()=>changePage(pagesEl.value));
 $('#desktopBtn').addEventListener('click',()=>$('#frameShell').classList.remove('mobile'));
 $('#mobileBtn').addEventListener('click',()=>$('#frameShell').classList.add('mobile'));
 function renderItems(){const d=doc();if(!d)return;list.replaceChildren();for(const item of d.querySelectorAll('[data-edit]')){const b=document.createElement('button');b.className='edit-item';b.type='button';b.dataset.key=item.dataset.edit;b.textContent=item.dataset.edit+' · '+item.textContent.slice(0,44);b.addEventListener('click',()=>select(item.dataset.edit,true));list.append(b)}}
 function select(k,scroll){const d=doc();if(!d)return;for(const x of d.querySelectorAll('[data-edit]'))x.style.outline='';currentKey=k;const e=el();$('#selectedEditor').hidden=!e;$$('.edit-item').forEach(b=>b.classList.toggle('current',!!e&&b.dataset.key===k));if(!e){$('#selectedTitle').textContent='Öğe seçilmedi';return}if(scroll)e.scrollIntoView({block:'center',behavior:'smooth'});e.style.outline='2px dashed #bff56e';$('#selectedTitle').textContent=k;const p=draft.styles?.[k]||{};$('#editText').value=draft.text?.[k]??e.textContent;$('#posX').value=Number(p.x)||0;$('#posY').value=Number(p.y)||0;$('#fontSize').value=Number(p.size)||parseInt(frame.contentWindow.getComputedStyle(e).fontSize)||28;$('#align').value=p.align||'left';$('#textColor').value=p.color||'#ffffff';const a=e.closest('a[data-link]')||e.querySelector('a[data-link]');$('#linkBlock').hidden=!a;$('#editLink').dataset.key=a?.dataset.link||'';$('#editLink').value=a?(draft.links?.[a.dataset.link]||a.getAttribute('href')):''}
 function addHooks(){const d=doc();if(!d)return;for(const e of d.querySelectorAll('[data-edit]')){
 e.title='Tıklayıp seçin; sürükleyerek taşıyın';
 e.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();select(e.dataset.edit,false)},true);
 e.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();const k=e.dataset.edit,p=draft.styles?.[k]||{};select(k,false);drag={key:k,x:event.clientX,y:event.clientY,ox:Number(p.x)||0,oy:Number(p.y)||0,moved:false};try{e.setPointerCapture(event.pointerId)}catch{}},true);
 e.addEventListener('pointermove',event=>{if(!drag||drag.key!==e.dataset.edit)return;const x=Math.round(drag.ox+event.clientX-drag.x),y=Math.round(drag.oy+event.clientY-drag.y);drag.moved=true;e.style.transform='translate('+x+'px,'+y+'px)';$('#posX').value=x;$('#posY').value=y},true);
 e.addEventListener('pointerup',()=>{if(drag?.moved&&drag.key===e.dataset.edit){const x=Number($('#posX').value),y=Number($('#posY').value),k=drag.key;mutate(()=>{draft.styles??={};draft.styles[k]={...(draft.styles[k]||{}),x,y}})}drag=null},true);
 }
 for(const a of d.querySelectorAll('a'))a.addEventListener('click',event=>{event.preventDefault();if(a.closest('[data-edit]'))return;const h=a.getAttribute('href');if(pages.some(p=>p.file===h)){pagesEl.value=h;changePage(h)}},true);
 }
 frame.addEventListener('load',()=>{currentKey=null;draw();addHooks();fillImages();notice('Sayfa açıldı. Metne tıklayarak veya sürükleyerek düzenleyin.')});
 $('#editText').addEventListener('change',e=>{const k=currentKey;if(!k)return;mutate(()=>{draft.text??={};draft.text[k]=e.target.value})});
 function editStyle(prop,v){if(!currentKey)return;const k=currentKey;mutate(()=>{draft.styles??={};draft.styles[k]={...(draft.styles[k]||{}),[prop]:v}})}
 for(const [id,prop] of [['posX','x'],['posY','y'],['fontSize','size'],['align','align'],['textColor','color']])$('#'+id).addEventListener('change',e=>editStyle(prop,prop==='align'||prop==='color'?e.target.value:Number(e.target.value)));
 const safe=v=>/^(https?:\/\/|mailto:|tel:|[a-z0-9._/-]+\.html(?:[?#].*)?|#[a-z0-9-]+$)/i.test(v)&&!v.startsWith('//');
 $('#editLink').addEventListener('change',e=>{const k=e.target.dataset.key,v=e.target.value.trim();if(!k)return;if(!safe(v)){notice('Güvenli HTTPS bağlantısı, mailto:, tel: veya yerel .html girin.');return}mutate(()=>{draft.links??={};draft.links[k]=v})});
 function drawGlobal(){for(const k of ['accent','bg','ink','surface'])$('#global_'+k).value=draft.globals?.[k]||site.palette?.[k]||'#777777';$('#global_font').value=draft.globals?.font||'DM Sans'}
 for(const k of ['accent','bg','ink','surface'])$('#global_'+k).addEventListener('change',e=>mutate(()=>{draft.globals??={};draft.globals[k]=e.target.value}));
 $('#global_font').addEventListener('change',e=>mutate(()=>{draft.globals??={};draft.globals.font=e.target.value}));
 async function compress(file,max=1400){if(!file)return null;if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Yalnızca JPG, PNG veya WebP kullan.');return await new Promise((resolve,reject)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{const ratio=Math.min(1,max/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*ratio)),h=Math.max(1,Math.round(im.height*ratio)),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(im,0,0,w,h);URL.revokeObjectURL(u);resolve(canvas.toDataURL('image/jpeg',.72))};im.onerror=()=>{URL.revokeObjectURL(u);reject(Error('Görsel açılamadı'))};im.src=u})}
 const slots=$('#imageSlot');function fillImages(){slots.replaceChildren();for(const im of doc()?.querySelectorAll('[data-image]')||[]){const o=document.createElement('option');o.value=im.dataset.image;o.textContent=im.dataset.image;slots.append(o)}}
 async function upload(input,slot,max){try{const url=await compress(input.files?.[0],max);if(!url)return;const name=slot||slots.value;if(!name){notice('Sayfada fotoğraf alanı bulunamadı.');return}mutate(()=>{draft.images??={};draft.images[name]=url});notice('Görsel eklendi. Kaydetmeyi unutma.')}catch(e){notice(e.message)}}
 $('#photoInput').addEventListener('change',e=>upload(e.target,null,1400));
 $('#logoInput').addEventListener('change',e=>upload(e.target,'logo',512));
 $('#faviconInput').addEventListener('change',e=>upload(e.target,'favicon',256));
 $('#saveBtn').addEventListener('click',()=>{try{localStorage.setItem(key,JSON.stringify(draft));saved=clone(draft);notice('Tarayıcıda kaydedildi. GitHub canlı sitesine otomatik gönderilmedi.',true)}catch(e){notice('Yerel depolama dolu. Daha küçük fotoğraf dene veya JSON dışa aktar.')}});
 $('#undoBtn').addEventListener('click',()=>{if(!history.length)return;future.push(clone(draft));draft=history.pop();draw();notice('Son değişiklik geri alındı.')});
 $('#redoBtn').addEventListener('click',()=>{if(!future.length)return;history.push(clone(draft));draft=future.pop();draw();notice('Değişiklik yeniden yapıldı.')});
 $('#resetPageBtn').addEventListener('click',()=>{if(!confirm('Bu sayfanın düzenlemeleri sıfırlansın mı?'))return;const stem=page.replace('.html','')+'.';mutate(()=>{for(const kind of ['text','styles','links','images'])if(draft[kind])for(const k of Object.keys(draft[kind]))if(k.startsWith(stem))delete draft[kind][k]});notice('Sayfa temizlendi. Kaydetmeyi unutma.')});
 $('#resetBtn').addEventListener('click',()=>{if(!confirm('Tüm site ilk haline dönsün mü?'))return;snapshot();draft={};saved={};try{localStorage.removeItem(key)}catch{}changePage(page);notice('Tüm yerel değişiklikler kaldırıldı.',true)});
 $('#exportBtn').addEventListener('click',()=>{const file=new Blob([JSON.stringify({version:1,site:site.slug,exported:new Date().toISOString(),settings:draft},null,2)],{type:'application/json'}),u=URL.createObjectURL(file),a=document.createElement('a');a.href=u;a.download=site.slug+'-big-ayarlar.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);notice('Ayarlar JSON dosyası indirildi.')});
 $('#importInput').addEventListener('change',async e=>{try{const file=e.target.files?.[0];if(!file)return;const obj=JSON.parse(await file.text());if(obj.site!==site.slug||!obj.settings||typeof obj.settings!=='object')throw Error('JSON dosyası bu siteye ait değil.');mutate(()=>{draft=obj.settings});notice('Ayarlar içe aktarıldı, kaydetmelisin.')}catch(e){notice(e.message)}});
 $('#openPage').addEventListener('click',()=>window.open(page,'_blank','noopener'));
 drawGlobal();changePage(page);
})();


'use strict';
(()=>{
 const q=(s,r=document)=>r.querySelector(s), all=(s,r=document)=>[...r.querySelectorAll(s)];
 const slug=document.body?.dataset.site||'unknown',key='PINESAB_BIG_V1_'+slug;
 let data={};try{data=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}
 const initial={text:{},links:{},images:{},logos:[],favicons:[]};
 for(const el of all('[data-edit]'))initial.text[el.dataset.edit]=el.innerHTML;
 for(const el of all('[data-link]'))initial.links[el.dataset.link]=el.getAttribute('href');
 for(const el of all('[data-image]'))initial.images[el.dataset.image]={src:el.getAttribute('src'),photo:el.getAttribute('data-photo')};
 for(const el of all('[data-logo]'))initial.logos.push([el,el.getAttribute('src')]);
 for(const el of all('[data-favicon]'))initial.favicons.push([el,el.getAttribute('href')]);
 const valid=s=>typeof s==='string'&&/^(https?:\/\/|mailto:|tel:|[a-z0-9._/-]+\.html(?:[?#].*)?|#[a-z0-9-]+$)/i.test(s)&&!s.startsWith('//');
 function apply(v){
 data=v||{};const text=data.text||{},styles=data.styles||{},links=data.links||{},images=data.images||{},g=data.globals||{};
 for(const el of all('[data-edit]')){
   const k=el.dataset.edit,p=styles[k]||{};
   if(Object.prototype.hasOwnProperty.call(text,k))el.textContent=String(text[k]);else if(el.innerHTML!==initial.text[k])el.innerHTML=initial.text[k];
   el.style.transform='translate('+(Number(p.x)||0)+'px,'+(Number(p.y)||0)+'px)';
   el.style.textAlign=['left','right','center'].includes(p.align)?p.align:'';
   el.style.fontSize=p.size?Math.max(10,Math.min(150,Number(p.size)))+'px':'';
   el.style.color=/^#[0-9a-f]{6}$/i.test(p.color||'')?p.color:'';
   el.style.backgroundColor=/^#[0-9a-f]{6}$/i.test(p.bg||'')?p.bg:'';
 }
 for(const el of all('[data-link]')){const s=links[el.dataset.link];if(valid(s))el.setAttribute('href',s);else if(initial.links[el.dataset.link])el.setAttribute('href',initial.links[el.dataset.link])}
 for(const el of all('[data-image]')){const src=images[el.dataset.image];if(typeof src==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(src)){el.src=src;el.removeAttribute('data-photo');el.dataset.editedSrc='yes'}else if(el.dataset.editedSrc==='yes'){const orig=initial.images[el.dataset.image];el.setAttribute('src',orig.src);if(orig.photo)el.setAttribute('data-photo',orig.photo);delete el.dataset.editedSrc}}
 for(const [el,src] of initial.logos)el.src=images.logo||src;
 for(const [el,src] of initial.favicons)el.href=images.favicon||src;
 for(const k of ['accent','bg','ink','surface']){if(/^#[0-9a-f]{6}$/i.test(g[k]||''))document.documentElement.style.setProperty('--'+k,g[k]);else document.documentElement.style.removeProperty('--'+k)}
 if(['DM Sans','Space Grotesk','Manrope','Syne','Playfair Display'].includes(g.font)){document.documentElement.style.setProperty('--font','"'+g.font+'",sans-serif');document.documentElement.style.setProperty('--display','"'+g.font+'",sans-serif');}
 else {document.documentElement.style.removeProperty('--font');document.documentElement.style.removeProperty('--display')}
 }
 window.BigRuntime={apply,storageKey:key};apply(data);
 const menu=q('#menuToggle'),nav=q('#navLinks');menu?.addEventListener('click',()=>{const opened=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(opened));menu.textContent=opened?'KAPAT ✕':'MENÜ ☰'});
 for(const a of all('.nav-links a'))a.addEventListener('click',()=>{nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false')});
 const header=q('#header');let ticking=false;
 addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{header?.classList.toggle('is-scrolled',scrollY>30);ticking=false})},{passive:true});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!reduced&&'IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.08});all('[data-reveal]').forEach(x=>io.observe(x))}
 else all('[data-reveal]').forEach(x=>x.classList.add('visible'));
 if(!reduced&&matchMedia('(pointer:fine)').matches)for(const el of all('.magnetic')){el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform='translate('+((e.clientX-r.left-r.width/2)/14)+'px,'+((e.clientY-r.top-r.height/2)/14)+'px)'});el.addEventListener('mouseleave',()=>el.style.transform='')}
 const lazy='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){load(e.target);lazy.unobserve(e.target)}}),{rootMargin:'400px'}):null;
 function load(img){if(!img.dataset.photo||(data.images||{})[img.dataset.image])return;const u=img.dataset.photo,probe=new Image();probe.onload=()=>{img.src=u;img.removeAttribute('data-photo')};probe.onerror=()=>{img.removeAttribute('data-photo');img.dataset.photoFailed='true'};probe.src=u}
 for(const img of all('img[data-photo]')){if(lazy&&img.loading==='lazy')lazy.observe(img);else load(img)}
})();

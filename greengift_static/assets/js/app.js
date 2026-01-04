/* GreenGift Static - v1
   - Loads site data from assets/data/site.json
   - Simple auth mock with localStorage
   - Basic filtering for brands
*/
const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => [...el.querySelectorAll(q)];

const store = {
  get(key, fallback=null){
    try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch{ return fallback; }
  },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); },
  del(key){ localStorage.removeItem(key); }
};

function toast(title, msg){
  const t = $("#toast");
  if(!t) return;
  $(".t", t).textContent = title;
  $(".m", t).textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove("show"), 3600);
}

async function loadData(){
  const res = await fetch("assets/data/site.json", {cache:"no-store"});
  return await res.json();
}

function setActiveNav(){
  const path = location.pathname.split("/").pop() || "index.html";
  $$(".navlinks a").forEach(a=>{
    const href = (a.getAttribute("href")||"").split("/").pop();
    if(href === path) a.classList.add("active");
  });
}

function wireMobileNav(){
  const nav = $(".nav");
  const btn = $("#mobileToggle");
  if(!nav || !btn) return;
  btn.addEventListener("click", ()=>{
    nav.classList.toggle("open");
  });
  document.addEventListener("click",(e)=>{
    if(!nav.contains(e.target)) nav.classList.remove("open");
  });
}

function renderHeader(settings){
  $$(".brandName").forEach(el=>el.textContent = settings.brand);
}

function renderHero(settings){
  const h1 = $("#heroTitle");
  const sub = $("#heroSub");
  const cta = $("#heroCta");
  if(h1) h1.innerHTML = settings.tagline.replace("Doğa Dostu", "<span>Doğa Dostu</span>");
  if(sub) sub.textContent = settings.subtag;
  if(cta){
    cta.textContent = settings.ctaPrimary;
    cta.setAttribute("href", settings.ctaPrimaryHref);
  }
  const stats = $("#stats");
  if(stats){
    stats.innerHTML = "";
    settings.stats.forEach((s, i)=>{
      const div = document.createElement("div");
      div.className = "stat " + (i===0 ? "gold" : (i===1 ? "green" : ""));
      div.innerHTML = `<div class="v">${s.value}</div><div class="l">${s.label}</div>`;
      stats.appendChild(div);
    });
  }
}

function iconSvg(name){
  const common = (p)=>`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${p}</svg>`;
  if(name==="cube") return common(`<path d="M12 2l9 5-9 5-9-5 9-5z" stroke="currentColor" stroke-width="2"/><path d="M3 7v10l9 5 9-5V7" stroke="currentColor" stroke-width="2"/>`);
  if(name==="qrcode") return common(`<path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm12 8v-6m0 0h6m-6 0h-2m8 0v6m0-6h-2m-4 2h2m-2 4h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`);
  if(name==="megaphone") return common(`<path d="M4 11v2a2 2 0 0 0 2 2h1l3 4h2l-1-4h2l7-3V8l-7-3H6a2 2 0 0 0-2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
  if(name==="hand") return common(`<path d="M8 13V6a1 1 0 0 1 2 0v6m0-4a1 1 0 0 1 2 0v4m0-3a1 1 0 0 1 2 0v6m0-4a1 1 0 0 1 2 0v5c0 3-2 6-6 6H10c-3 0-5-2-5-5v-3a1 1 0 0 1 2 0v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
  if(name==="tree") return common(`<path d="M12 2c3 2 5 5 5 8a5 5 0 0 1-10 0c0-3 2-6 5-8z" stroke="currentColor" stroke-width="2"/><path d="M12 12v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 22h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`);
  return common(`<path d="M12 2v20M2 12h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`);
}

function renderHowItWorks(){
  const wrap = $("#howGrid");
  if(!wrap) return;
  const items = [
    {icon:"megaphone", title:"1. Reklam Verin", desc:"Markanız premium karton kutuların üzerine basılır."},
    {icon:"hand", title:"2. Ücretsiz Dağıtım", desc:"AVM, festival ve kampüslerde sular ücretsiz dağıtılır."},
    {icon:"tree", title:"3. Doğayı Yeşertin", desc:"Reklam gelirinin belirli bir yüzdesi ile fidan dikilir."}
  ];
  wrap.innerHTML = "";
  items.forEach(it=>{
    const div = document.createElement("div");
    div.className = "card lift";
    div.innerHTML = `<div class="icon">${iconSvg(it.icon)}</div><h3>${it.title}</h3><p>${it.desc}</p>`;
    wrap.appendChild(div);
  });
}

function renderProducts(products){
  const grid = $("#productGrid");
  if(!grid) return;
  grid.innerHTML = "";
  products.forEach(p=>{
    const div = document.createElement("div");
    div.className = "card lift";
    div.innerHTML = `<div class="icon">${iconSvg(p.icon)}</div><h3>${p.title}</h3><p>${p.desc}</p>`;
    grid.appendChild(div);
  });
}

function renderPackages(packages){
  const grid = $("#packageGrid");
  if(!grid) return;
  grid.innerHTML = "";
  packages.forEach(p=>{
    const div = document.createElement("div");
    div.className = "package" + (p.featured ? " featured" : "");
    div.innerHTML = `
      ${p.badge ? `<div class="badgeTop">${p.badge}</div>` : ``}
      <h3>${p.name}</h3>
      <div class="sub">${p.subtitle}</div>
      <ul class="ul">${p.items.map(i=>`<li>${i}</li>`).join("")}</ul>
      <div class="actions">
        <a class="btn ${p.featured ? "primary" : "ghost"}" href="teklif-al.html?paket=${encodeURIComponent(p.name)}">Teklif Al</a>
      </div>`;
    grid.appendChild(div);
  });
}

function renderBrands(brands){
  const grid = $("#brandGrid");
  if(!grid) return;

  const q = ($("#brandSearch")?.value || "").trim().toLowerCase();
  const cat = $("#brandCategory")?.value || "all";

  const filtered = brands.filter(b=>{
    const matchQ = !q || b.name.toLowerCase().includes(q);
    const matchC = (cat==="all") || (b.category===cat);
    return matchQ && matchC;
  });

  grid.innerHTML = "";
  filtered.forEach(b=>{
    const div = document.createElement("a");
    div.className = "brand-card";
    div.href = b.site || "#";
    div.target = "_blank";
    div.rel = "noopener";
    div.innerHTML = `
      <div class="img">
        <img src="${b.logo}" alt="${b.name}">
      </div>
      <div class="meta">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
          <div class="name">${b.name}</div>
          ${b.featured ? `<span class="pill">ÖNE ÇIKAN</span>` : ``}
        </div>
        <div class="cat">${b.category}</div>
      </div>`;
    grid.appendChild(div);
  });

  const count = $("#brandCount");
  if(count) count.textContent = `${filtered.length} marka`;
}

function wireBrandFilters(brands){
  const s = $("#brandSearch");
  const c = $("#brandCategory");
  const b = $("#brandBtn");
  if(s) s.addEventListener("input", ()=>renderBrands(brands));
  if(c) c.addEventListener("change", ()=>renderBrands(brands));
  if(b) b.addEventListener("click", (e)=>{ e.preventDefault(); renderBrands(brands); });
}

function setContact(settings){
  const a = $("#addr"); if(a) a.textContent = settings.address;
  const e = $("#mail"); if(e) e.textContent = settings.email;
  const p = $("#phone"); if(p) p.textContent = settings.phone;
}

function auth(){
  const user = store.get("gg_user", null);
  $$(".authOnly").forEach(el=>el.style.display = user ? "" : "none");
  $$(".guestOnly").forEach(el=>el.style.display = user ? "none" : "");
  const name = $("#userName");
  if(name) name.textContent = user?.name || "—";
  const sum = $("#donationSum");
  if(sum){
    const donations = store.get("gg_donations", []);
    const total = donations.reduce((a, d)=>a + (Number(d.amount)||0), 0);
    sum.textContent = total.toLocaleString("tr-TR");
  }
  const list = $("#donationList");
  if(list){
    const donations = store.get("gg_donations", []).slice().reverse().slice(0,10);
    list.innerHTML = donations.length
      ? donations.map(d=>`<div class="notice"><b>${Number(d.amount).toLocaleString("tr-TR")} TL</b> • ${new Date(d.at).toLocaleString("tr-TR")}<div style="margin-top:6px">${(d.note||"").replace(/</g,"&lt;")}</div></div>`).join("")
      : `<div class="notice">Henüz bağış yok. İlk bağışı sen yap 😄</div>`;
  }
}

function wireLogin(){
  const f = $("#loginForm"); if(!f) return;
  f.addEventListener("submit",(e)=>{
    e.preventDefault();
    const email = $("#email").value.trim();
    const pass = $("#password").value;
    if(!email || !pass) return toast("Eksik bilgi", "E-posta ve şifre gerekli.");
    // mock: accept any email/pass (for demo)
    store.set("gg_user", {email, name: email.split("@")[0]});
    toast("Giriş başarılı", "Demo mod: Panel sayfasına yönlendiriliyorsun.");
    setTimeout(()=>location.href="panel.html", 650);
  });
}

function wireRegister(){
  const f = $("#registerForm"); if(!f) return;
  f.addEventListener("submit",(e)=>{
    e.preventDefault();
    const name = $("#name").value.trim();
    const email = $("#email").value.trim();
    const phone = $("#phone").value.trim();
    const pass = $("#password").value;
    if(!name || !email || !pass) return toast("Eksik bilgi", "Ad Soyad, e-posta ve şifre gerekli.");
    store.set("gg_user", {email, name, phone});
    toast("Kayıt başarılı", "Demo mod: Panel sayfasına yönlendiriliyorsun.");
    setTimeout(()=>location.href="panel.html", 650);
  });
}

function wireLogout(){
  const btn = $("#logoutBtn"); if(!btn) return;
  btn.addEventListener("click", ()=>{
    store.del("gg_user");
    toast("Çıkış yapıldı", "Görüşürüz.");
    setTimeout(()=>location.href="index.html", 550);
  });
}

function wireDonation(){
  const f = $("#donateForm"); if(!f) return;
  f.addEventListener("submit",(e)=>{
    e.preventDefault();
    const user = store.get("gg_user", null);
    if(!user) return toast("Giriş gerekli", "Bağış yapmak için giriş yapmalısın.");
    const amount = Number($("#amount").value);
    const note = ($("#note").value||"").trim();
    if(!amount || amount<=0) return toast("Geçersiz tutar", "Lütfen pozitif bir tutar gir.");
    const donations = store.get("gg_donations", []);
    donations.push({amount, note, at: Date.now()});
    store.set("gg_donations", donations);
    toast("Teşekkürler 💚", "Bağışın demo olarak kaydedildi.");
    f.reset();
    auth();
  });
  $$(".quickAmount").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      $("#amount").value = btn.dataset.amount;
      $("#amount").focus();
    });
  });
}

function wireOffer(){
  const f = $("#offerForm"); if(!f) return;
  const params = new URLSearchParams(location.search);
  const paket = params.get("paket");
  if(paket && $("#paket")) $("#paket").value = paket;

  f.addEventListener("submit",(e)=>{
    e.preventDefault();
    const payload = {
      paket: $("#paket").value.trim(),
      name: $("#name").value.trim(),
      phone: $("#phone").value.trim(),
      email: $("#email").value.trim(),
      msg: ($("#msg").value||"").trim(),
      at: Date.now()
    };
    if(!payload.name || !payload.email) return toast("Eksik bilgi", "Ad Soyad ve e-posta gerekli.");
    const offers = store.get("gg_offers", []);
    offers.push(payload);
    store.set("gg_offers", offers);
    toast("Teklif alındı", "Demo mod: Form verin kaydedildi. Gerçekte mail/CRM’e bağlarız.");
    f.reset();
  });
}

async function init(){
  wireMobileNav();
  setActiveNav();

  const data = await loadData();
  renderHeader(data.settings);

  // Page-specific renders
  if($("#heroTitle")) renderHero(data.settings);
  if($("#howGrid")) renderHowItWorks();
  if($("#productGrid")) renderProducts(data.products);
  if($("#packageGrid")) renderPackages(data.packages);
  if($("#brandGrid")){
    // fill categories
    const cats = [...new Set(data.brands.map(b=>b.category))].sort();
    const sel = $("#brandCategory");
    if(sel){
      sel.innerHTML = `<option value="all">Tüm Kategoriler</option>` + cats.map(c=>`<option value="${c}">${c}</option>`).join("");
    }
    wireBrandFilters(data.brands);
    renderBrands(data.brands);
  }
  if($("#addr")) setContact(data.settings);

  // auth
  auth();
  wireLogin();
  wireRegister();
  wireLogout();
  wireDonation();
  wireOffer();
}

document.addEventListener("DOMContentLoaded", init);

// -------- helpers
const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

// -------- year
$("#year").textContent = new Date().getFullYear();

// -------- tabs
const tabs = $$(".tab");
const panels = $$(".panel");

function applyPanels(name){
  panels.forEach(p => {
    const isOn = (p.dataset.panel === name);
    p.hidden = !isOn;
    p.classList.toggle("active", isOn);
  });
  tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
}
function openTab(name){
  applyPanels(name);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
tabs.forEach(t => t.addEventListener("click", () => openTab(t.dataset.tab)));
$$("[data-jump]").forEach(btn => btn.addEventListener("click", () => openTab(btn.dataset.jump)));
applyPanels("startups");

// -------- language
let content = null;
let lang = "en";

function setLang(newLang){
  lang = newLang;
  localStorage.setItem("site_lang", lang);

  const sw = $("#langSwitch");
  sw.classList.toggle("on", lang === "tr");
  $("#langLeft").classList.toggle("muted", lang === "tr");
  $("#langRight").classList.toggle("muted", lang !== "tr");

  const dict = content?.[lang] || {};
  $$("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if(dict[key]) el.textContent = dict[key];
  });

  const search = $("#searchInput");
  if(search) search.placeholder = (lang === "tr") ? "Projelerde ara..." : "Search projects...";

  const cmdInput = $("#cmdInput");
  if(cmdInput){
    cmdInput.placeholder = (lang === "tr")
      ? "Komut yaz… (örn: Startups, Projects, GreenGift)"
      : "Type a command… (e.g., Startups, Projects, GreenGift)";
  }

  renderTimeline();
  renderProjects();
  renderCreds();
  renderCmdItems();
}

$("#langSwitch").addEventListener("click", () => {
  setLang(lang === "en" ? "tr" : "en");
});

async function loadContent(){
  const res = await fetch("content.json", { cache: "no-store" });
  content = await res.json();
  const saved = localStorage.getItem("site_lang");
  if(saved === "tr" || saved === "en") lang = saved;
  setLang(lang);
}
loadContent();

// -------- roadmap
const roadmapData = [
  {
    year: "2026",
    en: [
      "Publish 50+ GitHub projects (minimum).",
      "Summer: take physical steps for GreenGift (pilot distribution, partners)."
    ],
    tr: [
      "GitHub’a en az 50+ proje yüklemek.",
      "Yaz tatili: GreenGift için fiziksel adımlar (pilot dağıtım, partnerlik)."
    ]
  },
  {
    year: "2027",
    en: [
      "Turn GreenGift into a real company.",
      "Publish 100+ GitHub projects."
    ],
    tr: [
      "GreenGift’i şirket haline getirmek.",
      "GitHub’a en az 100+ proje yüklemek."
    ]
  },
  {
    year: "2028",
    en: [
      "Master software fundamentals deeply.",
      "English: reach C1.",
      "Creative modding/design: pipelines + configs + foundations.",
      "German A2, French/Russian A1."
    ],
    tr: [
      "Yazılımı köküne kadar öğrenmek.",
      "İngilizce: C1.",
      "Modding/tasarım: pipeline + config + temel seviye.",
      "Almanca A2, Fransızca/Rusça A1."
    ]
  },
  {
    year: "2029",
    en: [
      "Build defense industry companies in the USA (UAVs, robot dogs, humanoids).",
      "FR/DE/RU: B2–C1. IT: A2. More languages: A1–A2."
    ],
    tr: [
      "ABD’de savunma sanayi şirketleri kurmak (İHA, robot köpek, humanoid).",
      "FR/DE/RU: B2–C1. İtalyanca: A2. Diğer diller: A1–A2."
    ]
  },
  {
    year: "2040+",
    en: [
      "Expand space tourism and develop new rocket models.",
      "Build large-scale space colony systems."
    ],
    tr: [
      "Uzay turizmini büyütmek ve yeni roket modelleri geliştirmek.",
      "Büyük ölçekli uzay kolonileri kurmak."
    ]
  }
];

function renderTimeline(){
  const tl = $("#timeline");
  if(!tl) return;
  tl.innerHTML = "";

  roadmapData.forEach(item => {
    const card = document.createElement("div");
    card.className = "year-card";

    const left = document.createElement("div");
    left.className = "year-badge";
    left.textContent = item.year;

    const ul = document.createElement("ul");
    ul.className = "year-items";
    const lines = (lang === "tr") ? item.tr : item.en;
    lines.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });

    card.appendChild(left);
    card.appendChild(ul);
    tl.appendChild(card);
  });

  const m = $("#metricProjects");
  if(m) m.textContent = "2026: 50+ / 2027: 100+";
}
renderTimeline();

// -------- modal
const modal = $("#modal");
const modalTitle = $(".modal-title");
const modalText = $(".modal-text");
const modalActions = $(".modal-actions");

function showModal(title, text, links=[]){
  modalTitle.textContent = title;
  modalText.textContent = text;
  modalActions.innerHTML = "";

  links.forEach(l => {
    const a = document.createElement("a");
    a.className = "btn ghost";
    a.href = l.href;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = l.label;
    modalActions.appendChild(a);
  });

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}
$(".modal-backdrop").addEventListener("click", closeModal);
$(".modal-close").addEventListener("click", closeModal);

// GreenGift full modal
$("#openGG")?.addEventListener("click", () => {
  const title = "GreenGift";
  const textEN =
`We distribute free drinks in eco-friendly carton packaging.
Each box is both a drink and an advertising space bought by brands.

Street-level distribution creates real visibility.
Distributors introduce the brand, collect quick feedback (surveys), and create measurable contact.

Revenue: packaging ads + distribution volume + reporting layer (QR + survey).
Impact: part of profit is committed to social projects (tree planting, support for leukemia patients, help for homeless people).

Goal: reduce plastic consumption, create youth employment, and connect brands with a sustainable advertising model.`;

  const textTR =
`Çevre dostu karton kutularda ücretsiz içecek dağıtıyoruz.
Her kutu hem bir içecek hem de markaların satın aldığı bir reklam alanı.

Sokak dağıtımı gerçek görünürlük sağlar.
Dağıtımcılarımız markayı tanıtır, kısa anketlerle geri bildirim toplar ve ölçülebilir temas yaratır.

Gelir: ambalaj reklamları + dağıtım hacmi + raporlama katmanı (QR + anket).
Etki: kârın bir kısmı sosyal projelere gider (fidan, lösemi hastalarına destek, evsizlere yardım).

Amaç: plastik tüketimini azaltmak, gençlere istihdam sağlamak ve markaları sürdürülebilir reklam modeliyle buluşturmak.`;

  showModal(title, lang === "tr" ? textTR : textEN, [
    { label: lang === "tr" ? "Partnerlik için mail" : "Email for partnership", href: "mailto:rolexgrond@gmail.com" }
  ]);
});

// -------- projects
let projects = [];
let activeTag = "All";
let query = "";

async function loadProjects(){
  try{
    const res = await fetch("projects.json", { cache: "no-store" });
    projects = await res.json();
  }catch{
    projects = [];
  }
  renderFilters();
  renderProjects();
  renderCmdItems();
}
loadProjects();

function uniqTags(){
  const set = new Set();
  projects.forEach(p => (p.tags || []).forEach(t => set.add(t)));
  return ["All", ...Array.from(set).sort()];
}

function renderFilters(){
  const el = $("#filters");
  if(!el) return;
  el.innerHTML = "";
  uniqTags().forEach(tag => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "filter" + (tag === activeTag ? " active" : "");
    b.textContent = tag;
    b.addEventListener("click", () => {
      activeTag = tag;
      renderFilters();
      renderProjects();
    });
    el.appendChild(b);
  });
}

function matchProject(p){
  const q = query.trim().toLowerCase();
  const byTag = (activeTag === "All") || (p.tags || []).includes(activeTag);
  const bySearch = !q || (
    (p.title || "").toLowerCase().includes(q) ||
    (p.desc || "").toLowerCase().includes(q) ||
    (p.tags || []).join(" ").toLowerCase().includes(q)
  );
  return byTag && bySearch;
}

function openProjectModal(p){
  const title = p.title || "Project";
  const text =
`${p.desc || ""}

${lang === "tr" ? "Etiketler" : "Tags"}: ${(p.tags || []).join(", ")}
${lang === "tr" ? "Durum" : "Status"}: ${p.status || ""} • ${lang === "tr" ? "Yıl" : "Year"}: ${p.year || ""}`;
  const links = [];
  if(p.repo) links.push({ label: "Repo", href: p.repo });
  showModal(title, text, links);
}

function renderProjects(){
  const grid = $("#projectGrid");
  if(!grid) return;
  grid.innerHTML = "";

  const list = projects.filter(matchProject);
  if(list.length === 0){
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `<h3>${lang === "tr" ? "Sonuç yok" : "No results"}</h3>
      <p class="muted">${lang === "tr" ? "Filtreyi değiştir veya aramayı temizle." : "Try changing filters or clearing search."}</p>`;
    grid.appendChild(empty);
    return;
  }

  list.forEach(p => {
    const card = document.createElement("article");
    card.className = "card project";
    card.innerHTML = `
      <h3>${p.title || "Untitled"}</h3>
      <p>${p.desc || ""}</p>
      <div class="tag-row">${(p.tags || []).slice(0,4).map(t => `<span class="tag">${t}</span>`).join("")}</div>
      <div class="tag-row">
        <span class="tag">${p.year || ""}</span>
        <span class="tag">${p.status || ""}</span>
      </div>
    `;
    card.addEventListener("click", () => openProjectModal(p));
    grid.appendChild(card);
  });
}

$("#searchInput")?.addEventListener("input", (e) => {
  query = e.target.value || "";
  renderProjects();
});
$("#clearSearch")?.addEventListener("click", () => {
  query = "";
  $("#searchInput").value = "";
  renderProjects();
});

// -------- credentials
let creds = [];

async function loadCreds(){
  try{
    const res = await fetch("credentials.json", { cache: "no-store" });
    creds = await res.json();
  }catch{
    creds = [];
  }
  renderCreds();
  renderCmdItems();
}
loadCreds();

function renderCreds(){
  const grid = $("#credGrid");
  if(!grid) return;
  grid.innerHTML = "";

  if(creds.length === 0){
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `<h3>${lang === "tr" ? "Henüz eklenmedi" : "Nothing yet"}</h3>
      <p class="muted">${lang === "tr" ? "İlk yarışma/sertifika eklendiğinde burada görünecek." : "This will populate as soon as items are added."}</p>`;
    grid.appendChild(empty);
    return;
  }

  creds
    .sort((a,b) => (b.year||0) - (a.year||0))
    .forEach(c => {
      const card = document.createElement("article");
      card.className = "card project";
      card.innerHTML = `
        <h3>${c.title || "Item"}</h3>
        <p>${c.desc || ""}</p>
        <div class="tag-row">
          <span class="tag">${c.type || "Credential"}</span>
          <span class="tag">${c.year || ""}</span>
          ${c.proof ? `<span class="tag">Proof</span>` : ``}
        </div>
      `;
      card.addEventListener("click", () => {
        const links = [];
        if(c.proof) links.push({ label: "Proof", href: c.proof });
        showModal(c.title || "Credential", c.desc || "", links);
      });
      grid.appendChild(card);
    });
}

// -------- command palette
const cmd = $("#cmd");
const cmdInput = $("#cmdInput");
const cmdList = $("#cmdList");
let cmdItems = [];

function buildCmdItems(){
  cmdItems = [
    { title: "Startups", sub: "Open startups panel", action: () => openTab("startups") },
    { title: "Build Lab", sub: "Open projects gallery", action: () => openTab("buildlab") },
    { title: "Roadmap", sub: "Open yearly roadmap", action: () => openTab("roadmap") },
    { title: "Credentials", sub: "Competitions and certificates", action: () => openTab("credentials") },
    { title: "Skills", sub: "Open skills & languages", action: () => openTab("skills") },
    { title: "Contact", sub: "Open contact panel", action: () => openTab("contact") },
    { title: "Open: GreenGift", sub: "Show full case in modal", action: () => $("#openGG").click() },
    { title: "Projects: Search", sub: "Jump to search in Build Lab", action: () => { openTab("buildlab"); $("#searchInput")?.focus(); } }
  ];

  projects.slice(0, 10).forEach(p => {
    cmdItems.push({
      title: `Project: ${p.title}`,
      sub: (p.tags || []).join(" • "),
      action: () => { openTab("buildlab"); openProjectModal(p); }
    });
  });

  creds.slice(0, 8).forEach(c => {
    cmdItems.push({
      title: `Credential: ${c.title}`,
      sub: `${c.type || "Credential"} • ${c.year || ""}`,
      action: () => { openTab("credentials"); showModal(c.title || "Credential", c.desc || "", c.proof ? [{label:"Proof", href:c.proof}] : []); }
    });
  });
}

function renderCmdItems(filter=""){
  buildCmdItems();
  const q = filter.trim().toLowerCase();
  const list = !q ? cmdItems : cmdItems.filter(i =>
    i.title.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q)
  );

  cmdList.innerHTML = "";
  list.slice(0, 14).forEach(item => {
    const row = document.createElement("div");
    row.className = "cmd-item";
    row.innerHTML = `<span class="cmd-title">${item.title}</span><span class="cmd-sub">${item.sub}</span>`;
    row.addEventListener("click", () => { item.action(); closeCmd(); });
    cmdList.appendChild(row);
  });

  if(list.length === 0){
    const row = document.createElement("div");
    row.className = "cmd-item";
    row.innerHTML = `<span class="cmd-title">${lang === "tr" ? "Komut yok" : "No commands"}</span>
                     <span class="cmd-sub">${lang === "tr" ? "Farklı bir şey yaz." : "Try a different query."}</span>`;
    cmdList.appendChild(row);
  }
}

function openCmd(){
  cmd.classList.add("show");
  cmd.setAttribute("aria-hidden", "false");
  cmdInput.value = "";
  renderCmdItems("");
  cmdInput.focus();
}
function closeCmd(){
  cmd.classList.remove("show");
  cmd.setAttribute("aria-hidden", "true");
}

$(".cmd-backdrop").addEventListener("click", closeCmd);
$("#cmdHint")?.addEventListener("click", openCmd);

window.addEventListener("keydown", (e) => {
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  const mod = isMac ? e.metaKey : e.ctrlKey;
  if(mod && e.key.toLowerCase() === "k"){
    e.preventDefault();
    openCmd();
  }
  if(e.key === "Escape"){
    closeCmd();
    closeModal();
  }
});

cmdInput.addEventListener("input", (e) => renderCmdItems(e.target.value || ""));

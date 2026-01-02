// -------- helpers
const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

// -------- year
$("#year").textContent = new Date().getFullYear();

// -------- cursor glow follow
const glow = $(".cursor-glow");
window.addEventListener("mousemove", (e) => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

// -------- top progress
const progress = $(".top-progress");
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  progress.style.width = scrolled + "%";
});

// -------- magnetic elements
function attachMagnetic(){
  $$(".magnetic").forEach((el) => {
    let rect = null;
    el.addEventListener("mouseenter", () => (rect = el.getBoundingClientRect()));
    el.addEventListener("mousemove", (e) => {
      if(!rect) return;
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const mx = clamp(x * 0.12, -10, 10);
      const my = clamp(y * 0.12, -10, 10);
      el.style.transform = `translate(${mx}px, ${my}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0px,0px)";
    });
  });
}
attachMagnetic();

// -------- tabs (panels)
const tabs = $$(".tab");
const panels = $$(".panel");
function openTab(name){
  tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  panels.forEach(p => p.classList.toggle("active", p.dataset.panel === name));

  // reset scroll slightly for better feel
  window.scrollTo({ top: 0, behavior: "smooth" });
}
tabs.forEach(t => t.addEventListener("click", () => openTab(t.dataset.tab)));

$$("[data-jump]").forEach(btn => {
  btn.addEventListener("click", () => openTab(btn.dataset.jump));
});

// -------- language system
let content = null;
let lang = "en"; // default EN

function setLang(newLang){
  lang = newLang;
  localStorage.setItem("site_lang", lang);

  // switch UI
  const sw = $("#langSwitch");
  sw.classList.toggle("on", lang === "tr");
  $("#langLeft").classList.toggle("muted", lang === "tr");
  $("#langRight").classList.toggle("muted", lang !== "tr");

  // translate
  const dict = content?.[lang] || {};
  $$("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if(dict[key]) el.textContent = dict[key];
  });

  // placeholders (search, cmd)
  const search = $("#searchInput");
  if(search){
    search.placeholder = (lang === "tr") ? "Projelerde ara..." : "Search projects...";
  }
  const cmdInput = $("#cmdInput");
  if(cmdInput){
    cmdInput.placeholder = (lang === "tr")
      ? "Komut yaz… (örn: 'Startups', 'Projects', 'GreenGift')"
      : "Type a command… (e.g., 'Startups', 'Projects', 'GreenGift')";
  }

  // rerender dynamic
  renderTimeline();
  renderProjects();
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

// -------- roadmap (data here, later we can move to roadmap.json)
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
    card.className = "year-card card";

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

  // update metric
  const m = $("#metricProjects");
  if(m) m.textContent = (lang === "tr") ? "2026: 50+ / 2027: 100+" : "2026: 50+ / 2027: 100+";
}
renderTimeline();

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
  renderProjects();
  renderFilters();
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
    b.className = "filter";
    if(tag === activeTag) b.classList.add("active");
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

function renderProjects(){
  const grid = $("#projectGrid");
  if(!grid) return;
  grid.innerHTML = "";

  const list = projects.filter(matchProject);
  if(list.length === 0){
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `<h3>${lang === "tr" ? "Sonuç yok" : "No results"}</h3><p class="muted">${lang === "tr" ? "Filtreyi değiştir veya aramayı temizle." : "Try changing filters or clearing search."}</p>`;
    grid.appendChild(empty);
    return;
  }

  list.forEach(p => {
    const card = document.createElement("article");
    card.className = "card project magnetic";
    card.dataset.pid = p.id;

    const h = document.createElement("h3");
    h.textContent = p.title || "Untitled";

    const d = document.createElement("p");
    d.textContent = p.desc || "";

    const tags = document.createElement("div");
    tags.className = "tag-row";
    (p.tags || []).slice(0,4).forEach(t => {
      const s = document.createElement("span");
      s.className = "tag";
      s.textContent = t;
      tags.appendChild(s);
    });

    const meta = document.createElement("div");
    meta.className = "tag-row";
    const y = document.createElement("span");
    y.className = "tag";
    y.textContent = String(p.year || "");
    const st = document.createElement("span");
    st.className = "tag";
    st.textContent = p.status || "";
    meta.appendChild(y);
    meta.appendChild(st);

    card.appendChild(h);
    card.appendChild(d);
    card.appendChild(tags);
    card.appendChild(meta);

    card.addEventListener("click", () => openProjectModal(p));
    grid.appendChild(card);
  });

  attachMagnetic();
}

// search
$("#searchInput")?.addEventListener("input", (e) => {
  query = e.target.value || "";
  renderProjects();
});
$("#clearSearch")?.addEventListener("click", () => {
  query = "";
  $("#searchInput").value = "";
  renderProjects();
});

// -------- modal (projects + GreenGift case)
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
    a.className = "btn ghost magnetic";
    a.href = l.href;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = l.label;
    modalActions.appendChild(a);
  });

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  attachMagnetic();
}

function closeModal(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}
$(".modal-backdrop").addEventListener("click", closeModal);
$(".modal-close").addEventListener("click", closeModal);
window.addEventListener("keydown", (e) => { if(e.key === "Escape") { closeModal(); closeCmd(); } });

function openProjectModal(p){
  const title = p.title || "Project";
  const text = `${p.desc || ""}\n\n${lang === "tr" ? "Etiketler:" : "Tags:"} ${(p.tags || []).join(", ")}\n${lang === "tr" ? "Durum:" : "Status:"} ${p.status || ""} • ${lang === "tr" ? "Yıl:" : "Year:"} ${p.year || ""}`;
  const links = [];
  if(p.repo) links.push({ label: (lang === "tr" ? "Repo" : "Repo"), href: p.repo });
  showModal(title, text, links);
}

// GreenGift case modal (full investor-ish text)
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

// -------- command palette (Ctrl+K)
const cmd = $("#cmd");
const cmdInput = $("#cmdInput");
const cmdList = $("#cmdList");

let cmdItems = [];
function buildCmdItems(){
  cmdItems = [
    { title: "Startups", sub: "Open startups panel", action: () => openTab("startups") },
    { title: "Build Lab", sub: "Open projects gallery", action: () => openTab("buildlab") },
    { title: "Roadmap", sub: "Open yearly roadmap", action: () => openTab("roadmap") },
    { title: "Skills", sub: "Open skills & languages", action: () => openTab("skills") },
    { title: "Contact", sub: "Open contact panel", action: () => openTab("contact") },
    { title: "Open: GreenGift", sub: "Show full case in modal", action: () => $("#openGG").click() },
    { title: "Projects: Search", sub: "Jump to search in Build Lab", action: () => { openTab("buildlab"); $("#searchInput")?.focus(); } }
  ];

  // add projects quick-open
  projects.slice(0, 12).forEach(p => {
    cmdItems.push({
      title: `Project: ${p.title}`,
      sub: (p.tags || []).join(" • "),
      action: () => { openTab("buildlab"); openProjectModal(p); }
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
  list.slice(0, 12).forEach(item => {
    const row = document.createElement("div");
    row.className = "cmd-item";
    row.innerHTML = `<span class="cmd-title">${item.title}</span><span class="cmd-sub">${item.sub}</span>`;
    row.addEventListener("click", () => { item.action(); closeCmd(); });
    cmdList.appendChild(row);
  });

  if(list.length === 0){
    const row = document.createElement("div");
    row.className = "cmd-item";
    row.innerHTML = `<span class="cmd-title">${lang === "tr" ? "Komut yok" : "No commands"}</span><span class="cmd-sub">${lang === "tr" ? "Farklı bir şey yaz." : "Try a different query."}</span>`;
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
function closeCmdSafe(){ if(cmd.classList.contains("show")) closeCmd(); }

function closeCmdHandler(e){
  if(e.target.classList.contains("cmd-backdrop")) closeCmd();
}
$(".cmd-backdrop").addEventListener("click", closeCmdHandler);

window.addEventListener("keydown", (e) => {
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  const mod = isMac ? e.metaKey : e.ctrlKey;
  if(mod && e.key.toLowerCase() === "k"){
    e.preventDefault();
    openCmd();
  }
});

cmdInput.addEventListener("input", (e) => renderCmdItems(e.target.value || ""));

// button hint
$("#cmdHint")?.addEventListener("click", () => openCmd());

// -------- done

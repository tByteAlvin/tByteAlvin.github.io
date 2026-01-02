// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Cursor glow follow
const glow = document.querySelector(".cursor-glow");
window.addEventListener("mousemove", (e) => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

// Top progress
const progress = document.querySelector(".top-progress");
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  progress.style.width = scrolled + "%";
});

// Magnetic elements
const magnetics = document.querySelectorAll(".magnetic");
magnetics.forEach((el) => {
  let rect;
  el.addEventListener("mouseenter", () => (rect = el.getBoundingClientRect()));
  el.addEventListener("mousemove", (e) => {
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });
  el.addEventListener("mouseleave", () => {
    el.style.transform = "translate(0px,0px)";
  });
});

// Typewriter (simple, clean)
const typeEl = document.querySelector(".type");
const words = typeEl.dataset.words.split("|");
let wi = 0, ci = 0, deleting = false;

function tick(){
  const w = words[wi];
  if(!deleting){
    ci++;
    typeEl.textContent = w.slice(0, ci);
    if(ci === w.length){
      deleting = true;
      setTimeout(tick, 1200);
      return;
    }
  } else {
    ci--;
    typeEl.textContent = w.slice(0, ci);
    if(ci === 0){
      deleting = false;
      wi = (wi + 1) % words.length;
    }
  }
  setTimeout(tick, deleting ? 35 : 55);
}
tick();

// Modal content
const modal = document.getElementById("modal");
const modalTitle = document.querySelector(".modal-title");
const modalText = document.querySelector(".modal-text");
const modalActions = document.querySelector(".modal-actions");

const data = {
  p1: {
    title: "Portfolio V1",
    text: "Bu site. Minimal siyah-beyaz tasarım, GSAP animasyonlar, magnetic UI. Sonraki sürümde: command palette + project filters.",
    links: [
      { label: "GitHub Repo", href: "https://github.com/tByteAlvin" }
    ]
  },
  p2: {
    title: "Mini AI Experiment",
    text: "Basit bir ML deneyi: veri, eğitim, sonuçlar ve kısa açıklama. Demo sayfası + rapor formatı.",
    links: []
  },
  p3: {
    title: "Automation Tool",
    text: "Dosya düzenleyici / küçük otomasyon aracı. Hedef: gerçek hayatta işe yarayan bir araç olarak yayınlamak.",
    links: []
  }
};

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", () => {
    const id = card.dataset.modal;
    const item = data[id];
    modalTitle.textContent = item.title;
    modalText.textContent = item.text;
    modalActions.innerHTML = "";

    item.links.forEach((l) => {
      const a = document.createElement("a");
      a.className = "btn ghost magnetic";
      a.target = "_blank";
      a.rel = "noreferrer";
      a.href = l.href;
      a.textContent = l.label;
      modalActions.appendChild(a);
    });

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    gsap.fromTo(".modal-card", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" });
  });
});

function closeModal(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}
document.querySelector(".modal-backdrop").addEventListener("click", closeModal);
document.querySelector(".modal-close").addEventListener("click", closeModal);
window.addEventListener("keydown", (e) => { if(e.key === "Escape") closeModal(); });

// GSAP entry + scroll reveals
gsap.registerPlugin(ScrollTrigger);

gsap.from(".kicker", { y: 10, opacity: 0, duration: 0.5, ease: "power2.out" });
gsap.from(".reveal", { y: 18, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.05 });
gsap.from(".cta", { y: 10, opacity: 0, duration: 0.6, delay: 0.1, ease: "power2.out" });

gsap.utils.toArray(".section").forEach((sec) => {
  gsap.from(sec, {
    scrollTrigger: { trigger: sec, start: "top 85%" },
    y: 18,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out"
  });
});

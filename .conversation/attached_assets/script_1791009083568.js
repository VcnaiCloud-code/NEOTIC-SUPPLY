const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

document.addEventListener("mousemove", e => {
  const g = $(".cursor-glow");
  if (g) { g.style.left = e.clientX + "px"; g.style.top = e.clientY + "px"; }
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
}, {threshold:.12});
$$(".reveal").forEach(el => observer.observe(el));

let cart = 0;
$$(".add").forEach(btn => btn.addEventListener("click", e => {
  cart++;
  $("#cartCount").textContent = cart;
  const product = e.currentTarget.closest(".product").dataset.product;
  showToast(product + " — agregado");
}));

function showToast(msg){
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(()=>t.classList.remove("show"),1800);
}

const chars = [
  ["NEOTIC","Disciplina dentro del caos. El personaje que lleva la visión de la marca.","01 / 04","center"],
  ["RICK","El rebelde. Energía impredecible y actitud sin filtros.","02 / 04","14% 18%"],
  ["MORTY","El soñador. Curioso, extraño y siempre listo para el siguiente drop.","03 / 04","60% 18%"],
  ["CHAOS","La energía de la calle. Color, ruido y cero reglas.","04 / 04","88% 56%"]
];
let char = 0;
function renderChar(){
  const c = chars[char];
  $("#charName").textContent=c[0]; $("#charDesc").textContent=c[1]; $("#charIndex").textContent=c[2];
  $(".char-image").style.backgroundPosition=c[3];
}
$("#nextChar").onclick=()=>{char=(char+1)%chars.length;renderChar()};
$("#prevChar").onclick=()=>{char=(char-1+chars.length)%chars.length;renderChar()};

$("#exploreBtn").onclick=()=>showToast("El universo NEOTIC se está desbloqueando...");

$("#cartBtn").onclick=()=>showToast(cart ? `Tu bolsa tiene ${cart} producto(s)` : "Tu bolsa está vacía");
$("#searchBtn").onclick=()=>showToast("Búsqueda NEOTIC próximamente");

const target = new Date();
target.setDate(target.getDate()+5); target.setHours(target.getHours()+12);
function countdown(){
  const d=Math.max(0,target-new Date());
  const days=Math.floor(d/86400000), hrs=Math.floor(d/3600000)%24, mins=Math.floor(d/60000)%60, secs=Math.floor(d/1000)%60;
  $("#days").textContent=String(days).padStart(2,"0");
  $("#hours").textContent=String(hrs).padStart(2,"0");
  $("#mins").textContent=String(mins).padStart(2,"0");
  $("#secs").textContent=String(secs).padStart(2,"0");
}
countdown(); setInterval(countdown,1000);

$(".menu-btn").onclick=()=>{
  const nav=$(".links");
  const open=nav.style.display==="flex";
  nav.style.display=open?"none":"flex";
  if(!open){nav.style.position="absolute";nav.style.top="72px";nav.style.left="0";nav.style.right="0";nav.style.padding="25px";nav.style.background="#080909";nav.style.flexDirection="column";}
};

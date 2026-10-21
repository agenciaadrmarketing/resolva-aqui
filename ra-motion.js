// ra-motion.js: animações de entrada e de hover do site inteiro, num só lugar.
// Hierarquia: títulos sobem por máscara; textos e listas sobem levemente em sequência; imagens entram com leve zoom-out.
// Só esconde o que está ABAIXO da dobra no carregamento (nada pisca, LCP intacto). Com prefers-reduced-motion nada é animado.
// O hero continua com o GSAP próprio da home; o rodapé tem a animação dele.
(() => {
  if (window.__raMotion) return; window.__raMotion = true;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = `
@media (prefers-reduced-motion: no-preference){
  .rv{transition:opacity .55s cubic-bezier(.2,.7,.3,1) var(--rv-d,0ms),transform .6s cubic-bezier(.2,.7,.3,1) var(--rv-d,0ms)}
  .rv.rv-wait{will-change:opacity,transform}
  .rv.rv-up.rv-wait{opacity:0;transform:translate3d(0,16px,0)}
  .rv.rv-title.rv-wait{opacity:0;transform:translate3d(0,20px,0)}
  .rv.rv-img.rv-wait{opacity:0;transform:scale(1.03)}
  .rv.rv-side.rv-wait{opacity:0;transform:translateX(-18px)}
  main figure{overflow:hidden;border-radius:14px}
  main figure img{transition:transform .9s cubic-bezier(.2,.7,.3,1),filter .6s ease}
  main figure:hover img{transform:scale(1.035)}
  main article{transition:transform .35s cubic-bezier(.2,.7,.3,1),box-shadow .35s ease}
  main article:hover{transform:translateY(-3px)}
  #resolver li{transition:transform .4s cubic-bezier(.2,.7,.3,1),box-shadow .4s ease}
  #resolver li:hover{transform:translateY(-6px);box-shadow:0 24px 40px -24px rgba(6,32,63,.55)}
  main dl>div{transition:background-color .25s ease,padding-left .3s cubic-bezier(.2,.7,.3,1)}
  main dl>div:hover{padding-left:8px}
  main ul li a,main ol li a{transition:color .2s ease,transform .3s cubic-bezier(.2,.7,.3,1)}
  main ul li a:hover,main ol li a:hover{transform:translateX(3px)}
  main [role=tab]{transition:color .25s ease,border-color .25s ease,background-color .25s ease,transform .2s ease}
  main [role=tab]:active{transform:scale(.97)}
  main a[href]:not([role]):active,main button:not([role]):active{transform:translateY(1px)}
  main input,main textarea{transition:border-color .2s ease,box-shadow .2s ease}
  main input:focus,main textarea:focus{border-color:#0A2E5D !important;box-shadow:0 0 0 4px rgba(245,124,0,.18)}
  main [aria-pressed]{transition:background-color .2s ease,border-color .2s ease,color .2s ease,transform .2s cubic-bezier(.34,1.56,.64,1)}
  main [aria-pressed]:hover{transform:translateY(-1px)}
  main [aria-pressed]:active{transform:scale(.96)}
}`;
  const RESP = `

/* mobile: textos principais centralizados (listas, formulários e FAQ continuam alinhados à esquerda) */
@media (max-width:640px){
  main section h1, main section h2,
  main section h1 + p, main section h2 + p,
  main section :is(div,header):has(> h2) > p,
  main section :is(div,header):has(> h1) > p{text-align:center !important;margin-left:auto !important;margin-right:auto !important}
  main section :is(div):has(> h2):not(:has(> ul,> ol,> dl,> form)){align-items:center !important;justify-content:center !important}
  main section :is(div):has(> h2) > div:has(> p):not(:has(ul,ol,dl,form,h3)){align-items:center !important;text-align:center !important;margin-left:auto !important;margin-right:auto !important}
  main section :is(div):has(> h2) > a,
  main section :is(div):has(> h1) > a,
  main section :is(div):has(> h2) > div:has(> a):not(:has(ul,ol,h3)),
  main section :is(div):has(> h1) > div:has(> a):not(:has(ul,ol,h3)){align-self:center !important;margin-left:auto !important;margin-right:auto !important;justify-content:center !important}
  main section :is(div):has(> h2) > a, main section :is(div):has(> h1) > a{display:flex !important;width:fit-content}
  #topo h1 [data-hl]{text-align:center}
  #topo div:has(> h1){text-align:center;margin-left:auto;margin-right:auto}
  #topo div:has(> a[href="#contato"]){justify-content:center !important}
  #topo div:has(> span + span){justify-content:center !important;text-align:center}
  main section nav ol{justify-content:center}
}

/* responsividade global */
@media (pointer:coarse){
  main nav ol a{display:inline-flex;align-items:center;min-height:44px}
  main div > a[href]:not([style*="min-height"]),main li > a[href]:not([style*="min-height"]){display:inline-flex;align-items:center;min-height:44px}
}
@media (max-width:420px){
  [role=dialog] form{padding:18px 14px !important}
  [role=dialog] ol[aria-label="Etapas"] span{font-size:11.5px !important}
}
@media (min-width:641px) and (max-width:1024px){
  main section h2{font-size:clamp(2.2rem,5vw,3rem) !important}
}
@media (orientation:landscape) and (max-height:500px){
  #topo{min-height:auto !important}
}

html,body{overflow-x:clip}
img,video,iframe,canvas{max-width:100%}
h1,h2,h3{overflow-wrap:break-word;-webkit-hyphens:auto;hyphens:auto}
h1,h2{text-wrap:balance}
p{text-wrap:pretty}
@media (max-width:640px){
  main section h2 br{display:none}
  main section h2{letter-spacing:-.035em !important}
  main [role=tablist]{justify-content:flex-start !important;flex-wrap:nowrap !important;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding-bottom:4px;margin-left:calc(var(--gut,20px)*-1);margin-right:calc(var(--gut,20px)*-1);padding-left:var(--gut,20px);padding-right:var(--gut,20px)}
  main [role=tablist]::-webkit-scrollbar{display:none}
  main [role=tablist] > *{flex:none}
  main form{padding:22px 18px !important}
  main fieldset legend{font-size:1.35rem !important}
}
@media (max-width:380px){
  main section h1{font-size:2.55rem !important}
  main section h2{font-size:2.1rem !important}
}
@media (min-width:1600px){
  main section{--gut:clamp(48px,4vw,80px)}
}
@media (hover:none){
  main figure:hover img,main article:hover,#resolver li:hover{transform:none !important}
}
`;
  const st = document.createElement("style"); st.id = "ra-motion"; st.textContent = css + RESP; document.head.appendChild(st);
  if (reduce || typeof IntersectionObserver === "undefined") return;

  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove("rv-wait"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  const below = (el) => { const r = el.getBoundingClientRect(); return r.top > window.innerHeight * 0.92; };
  const tag = (el, kind, delay) => {
    if (!el || el.classList.contains("rv") || el.closest("#topo") || el.closest("[aria-hidden='true']") || el.closest("footer")) return;
    el.classList.add("rv", kind);
    if (delay) el.style.setProperty("--rv-d", delay + "ms");
    if (below(el)) { el.classList.add("rv-wait"); io.observe(el); }
  };

  const scan = () => {
    document.querySelectorAll("main section").forEach((sec) => {
      if (sec.id === "topo") return;
      sec.querySelectorAll("h1, h2").forEach((h) => tag(h, "rv-title", 0));
      sec.querySelectorAll("h2 + p, h2 ~ div > p, h1 + p").forEach((p, i) => tag(p, "rv-up", 120 + i * 60));
      sec.querySelectorAll("ul, ol, dl").forEach((list) => {
        if (list.closest("nav") || list.closest("form")) return;
        Array.from(list.children).forEach((li, i) => { if (/^(LI|DIV)$/.test(li.tagName)) tag(li, "rv-up", Math.min(i * 55, 330)); });
      });
      sec.querySelectorAll("figure").forEach((f) => tag(f, "rv-img", 0));
      sec.querySelectorAll("article").forEach((a, i) => tag(a, "rv-up", Math.min(i * 90, 360)));
      sec.querySelectorAll("form, [role=tablist], [role=tabpanel]").forEach((f) => tag(f, "rv-up", 140));
      sec.querySelectorAll("mapa-pa").forEach((m) => tag(m, "rv-img", 120));
    });
  };
  // espera o conteúdo montar (DCs filhos, sc-for) e reescaneia o que chegar depois
  const start = () => { scan(); let q = 0; const mo = new MutationObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; scan(); }); }); mo.observe(document.body, { childList: true, subtree: true }); setTimeout(() => mo.disconnect(), 8000); };
  if (document.readyState === "complete") setTimeout(start, 150); else window.addEventListener("load", () => setTimeout(start, 150));
  // segurança: nada fica escondido se algo falhar
  setTimeout(() => document.querySelectorAll(".rv-wait").forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < window.innerHeight) el.classList.remove("rv-wait"); }), 4000);
})();

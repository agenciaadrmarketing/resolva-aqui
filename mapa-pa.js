// <mapa-pa> — mapa do Pará com malha oficial do IBGE pré-gerada (mapa-pa-geo.js), sem D3 nem chamadas externas. Adaptado do <mapa-sp> para a Resolva Aqui.
(() => {
  const BASE = ["Belém", -48.49, -1.46];
  const POLOS = [
    ["Castanhal", -47.92, -1.30, 0], ["Abaetetuba", -48.88, -1.72, 0], ["Bragança", -46.77, -1.05, 0],
    ["Paragominas", -47.35, -2.99, 1], ["Tucuruí", -49.67, -3.77, 1], ["Marabá", -49.12, -5.37, 1],
    ["Parauapebas", -49.90, -6.07, 1], ["Redenção", -50.03, -8.03, 1], ["Altamira", -52.21, -3.20, 1],
    ["Santarém", -54.71, -2.44, 1], ["Itaituba", -55.98, -4.28, 1], ["Breves", -50.48, -1.68, 1], ["Conceição do Araguaia", -49.26, -8.26, 0], ["São Félix do Xingu", -51.99, -6.64, 1], ["Oriximiná", -55.86, -1.77, 1], ["Cametá", -49.50, -2.24, 0], ["Capanema", -47.18, -1.20, 0]
  ];
  const CIDADES = [
    ["Ananindeua", -48.37, -1.37], ["Marituba", -48.34, -1.36], ["Castanhal", -47.92, -1.30],
    ["Barcarena", -48.62, -1.51], ["Abaetetuba", -48.88, -1.72], ["Bragança", -46.77, -1.05],
    ["Capanema", -47.18, -1.20], ["Soure", -48.52, -0.72], ["Breves", -50.48, -1.68],
    ["Cametá", -49.50, -2.24], ["Paragominas", -47.35, -2.99], ["Tailândia", -48.95, -2.95],
    ["Tucuruí", -49.67, -3.77], ["Marabá", -49.12, -5.37], ["Parauapebas", -49.90, -6.07],
    ["Redenção", -50.03, -8.03], ["Conceição do Araguaia", -49.26, -8.26], ["São Félix do Xingu", -51.99, -6.64],
    ["Altamira", -52.21, -3.20], ["Santarém", -54.71, -2.44], ["Monte Alegre", -54.07, -2.00],
    ["Óbidos", -55.52, -1.90], ["Oriximiná", -55.86, -1.77], ["Itaituba", -55.98, -4.28]
  ];


  class MapaPA extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `
        <style>
          :host{display:block;position:relative;width:100%;aspect-ratio:1.18/1;font-family:inherit;}
          .halo{position:absolute;left:8%;top:10%;width:84%;height:80%;border-radius:50%;background:radial-gradient(circle at 70% 30%,rgba(245,124,0,0.14),transparent 60%),radial-gradient(circle at 45% 55%,rgba(10,46,93,0.12),transparent 70%);filter:blur(34px);pointer-events:none;}
          svg{position:relative;width:100%;height:100%;display:block;overflow:visible;}
          #contorno{fill:none;stroke:#0A2E5D;stroke-width:1.6;stroke-linejoin:round;stroke-dasharray:var(--len);stroke-dashoffset:var(--len);animation:tracar 2.4s cubic-bezier(.16,.84,.44,1) .15s forwards;}
          #massa{opacity:0;animation:surgir 1.4s ease 1s forwards;}
          #mun path{fill:none;stroke:rgba(255,255,255,0.11);stroke-width:0.5;stroke-linejoin:round;vector-effect:non-scaling-stroke;}
          #mun{opacity:0;animation:surgir 1.4s ease 1.4s forwards;}
          .cid{opacity:0;animation:surgir .6s ease forwards;}
          .dest{opacity:0;animation:surgir .7s ease 2.2s forwards;}
          .pulso{transform-box:fill-box;transform-origin:center;animation:pulsar 3.2s ease-out infinite;}
          .rot{font-size:17px;font-weight:600;fill:#0A2E5D;letter-spacing:-0.01em;}
          .rota{fill:none;stroke:#F57C00;stroke-width:0.9;stroke-linecap:round;stroke-dasharray:var(--l);stroke-dashoffset:var(--l);opacity:.9;animation:tracar 1.6s cubic-bezier(.3,.7,.3,1) forwards;}
          .rota-f{fill:none;stroke:#FFB366;stroke-width:1;stroke-linecap:round;stroke-dasharray:1.5 6;opacity:0;animation:surgir .6s ease forwards;}
          .polo{opacity:0;animation:surgir .5s ease forwards;}
          .anel{transform-box:fill-box;transform-origin:center;animation:pulsar 3.6s ease-out infinite;}
          .rot3{font-size:13.5px;font-weight:600;fill:#FFFFFF;letter-spacing:0.01em;paint-order:stroke;stroke:#0A2E5D;stroke-width:3px;stroke-linejoin:round;}
          .rot2{font-size:11.5px;font-weight:600;fill:#B85C00;letter-spacing:0.08em;text-transform:uppercase;}
          :host([tema=escuro]) #contorno{stroke:rgba(255,255,255,.55);}
          :host([tema=escuro]) .rot{fill:#FFFFFF;}
          :host([tema=escuro]) .rot2{fill:#FF9433;}
          :host([tema=escuro]) .halo{background:radial-gradient(circle at 70% 30%,rgba(245,124,0,0.22),transparent 60%),radial-gradient(circle at 45% 55%,rgba(255,255,255,0.08),transparent 70%);}
          :host(:not([data-visto])) svg *{animation-play-state:paused !important;}
          @keyframes tracar{to{stroke-dashoffset:0;}}
          @keyframes surgir{to{opacity:1;}}
          @keyframes pulsar{0%{transform:scale(1);opacity:.6;}70%{transform:scale(3.6);opacity:0;}100%{transform:scale(3.6);opacity:0;}}
          @media(prefers-reduced-motion:reduce){#contorno,#massa,#mun,.cid,.dest,.rota,.rota-f,.polo{animation:none;stroke-dashoffset:0;opacity:1;}.pulso,.anel{animation:none;opacity:0;}.rota{opacity:0;}}
        </style>
        <div class="halo"></div>
        <svg viewBox="0 0 640 540" role="img" aria-label="Mapa do Pará: Belém como base do atendimento presencial, com rotas para cidades do interior atendidas"></svg>`;
      this._svg = root.querySelector("svg");
      this._tentativas = 0;
      this._garantir();
      this._io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) this._garantir(); }, { rootMargin: "300px" });
      this._io.observe(this);
      this._vio = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { this.setAttribute("data-visto", ""); this._vio.disconnect(); } }, { threshold: 0.3 });
      this._vio.observe(this);
    }

    disconnectedCallback() {
      if (this._io) this._io.disconnect();
      if (this._vio) this._vio.disconnect();
      clearTimeout(this._retry);
    }

    async _garantir() {
      if (this._ok || this._rodando) return;
      this._rodando = true;
      const ok = await this.desenhar();
      this._rodando = false;
      if (ok) { this._ok = true; if (this._io) this._io.disconnect(); return; }
      if (this._tentativas < 4) {
        const espera = 800 * Math.pow(2, this._tentativas);
        this._tentativas += 1;
        clearTimeout(this._retry);
        this._retry = setTimeout(() => this._garantir(), espera);
      }
    }

    async desenhar() {
      try {
        const G = window.MAPA_PA_GEO;
        if (!G) throw new Error("geometria do Pará não carregada");

        const W = 640, H = 540, pad = 24;
        const proj = ([lo, la]) => [G.k * lo * Math.PI / 180 + G.tx, -G.k * Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360)) + G.ty];
        const d = G.estado;
        const ns = "http://www.w3.org/2000/svg";
        const svg = this._svg;

        svg.innerHTML =
          '<defs>' +
            '<linearGradient id="grad" x1="0" y1="0" x2="0.8" y2="1">' +
              '<stop offset="0%" stop-color="#2C5A96"/><stop offset="55%" stop-color="#0A2E5D"/><stop offset="100%" stop-color="#06203F"/>' +
            '</linearGradient>' +
            '<filter id="sombra" x="-20%" y="-20%" width="140%" height="140%">' +
              '<feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#06203F" flood-opacity="0.28"/>' +
            '</filter>' +
            '<clipPath id="clipPA"><path d="' + d + '"/></clipPath>' +
          '</defs>' +
          '<g id="massa" filter="url(#sombra)"><path d="' + d + '" fill="url(#grad)"/></g>' +
          '<g id="mun" clip-path="url(#clipPA)"></g>' +
          '<path id="contorno" d="' + d + '"/>';

        const alvo = svg.querySelector("#mun");
        if (alvo) alvo.innerHTML = '<path d="' + G.municipios + '"/>';

        const contorno = svg.querySelector("#contorno");
        contorno.style.setProperty("--len", Math.ceil(contorno.getTotalLength()));

        const gc = document.createElementNS(ns, "g");
        CIDADES.forEach(([nome, lng, lat], i) => {
          const p = proj([lng, lat]);
          if (!p) return;
          const c = document.createElementNS(ns, "circle");
          c.setAttribute("cx", p[0]); c.setAttribute("cy", p[1]); c.setAttribute("r", 2.4);
          c.setAttribute("fill", "rgba(255,255,255,0.6)");
          c.setAttribute("class", "cid");
          c.style.animationDelay = (1.5 + (i % 20) * 0.05) + "s";
          const t = document.createElementNS(ns, "title"); t.textContent = nome; c.appendChild(t);
          gc.appendChild(c);
        });
        svg.appendChild(gc);

        const bp = proj([BASE[1], BASE[2]]);
        const gr = document.createElementNS(ns, "g");
        POLOS.forEach(([nome, lng, lat, rot], i) => {
          const p = proj([lng, lat]);
          if (!p) return;
          const dx = p[0] - bp[0], dy = p[1] - bp[1], dist = Math.hypot(dx, dy) || 1;
          const k = Math.min(0.28, 40 / dist + 0.12);
          const cx = (bp[0] + p[0]) / 2 + dy * k, cy = (bp[1] + p[1]) / 2 - dx * k;
          const dPath = "M" + bp[0] + " " + bp[1] + " Q" + cx + " " + cy + " " + p[0] + " " + p[1];
          const delay = 1.6 + i * 0.08;
          const a = document.createElementNS(ns, "path");
          a.setAttribute("d", dPath); a.setAttribute("class", "rota");
          a.style.animationDelay = delay + "s";
          gr.appendChild(a);
          const len = Math.ceil(a.getTotalLength ? 0 : 0);
          const f = document.createElementNS(ns, "path");
          f.setAttribute("d", dPath); f.setAttribute("class", "rota-f");
          f.style.animationDelay = (delay + 1.6) + "s";
          gr.appendChild(f);
          const gp = document.createElementNS(ns, "g");
          gp.setAttribute("class", "polo");
          gp.style.animationDelay = (delay + 0.9) + "s";
          const right = p[0] < bp[0] - 60 || p[0] < 200;
          gp.innerHTML =
            '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" fill="#F57C00" class="anel" style="animation-delay:' + (delay + 1) + 's"/>' +
            '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="#F57C00" stroke="#FFFFFF" stroke-width="1"><title>' + nome + ' — interior atendido</title></circle>' +
            (false ? '<text x="' + (p[0] + (right ? 9 : -9)) + '" y="' + (p[1] + 4) + '" class="rot3" text-anchor="' + (right ? "start" : "end") + '">' + nome + '</text>' : "");
          gr.appendChild(gp);
        });
        svg.appendChild(gr);
        gr.querySelectorAll(".rota").forEach((a) => {
          const l = Math.ceil(a.getTotalLength());
          a.style.setProperty("--l", l);
          a.addEventListener("animationend", () => { a.style.transition = "opacity .8s"; a.style.opacity = "0.55"; }, { once: true });
        });
        const g = document.createElementNS(ns, "g");
        g.setAttribute("class", "dest");
        g.innerHTML =
          '<circle cx="' + bp[0] + '" cy="' + bp[1] + '" r="7" fill="#F57C00" class="pulso"/>' +
          '<circle cx="' + bp[0] + '" cy="' + bp[1] + '" r="7.5" fill="#F57C00" stroke="#FFFFFF" stroke-width="2"><title>Belém — base do atendimento presencial</title></circle>' +
          '<line x1="' + (bp[0] + 7) + '" y1="' + (bp[1] - 8) + '" x2="' + (bp[0] + 40) + '" y2="' + (bp[1] - 60) + '" stroke="#0A2E5D" stroke-opacity="0.5" stroke-width="1"/>' +
          '<text x="' + (bp[0] + 46) + '" y="' + (bp[1] - 84) + '" class="rot2">Base</text>' +
          '<text x="' + (bp[0] + 46) + '" y="' + (bp[1] - 64) + '" class="rot">Belém</text>';
        svg.appendChild(g);

        return true;
      } catch (e) {
        return false;
      }
    }
  }
  if (!customElements.get("mapa-pa")) customElements.define("mapa-pa", MapaPA);
})();

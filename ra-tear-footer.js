// <ra-tear-footer>: rodapé "cartaz rasgado" (adaptado do Pushpin Tear Footer), em JS puro, sem React/npm.
// Folha azul-marinho com navegação, presa por um pino laranja e rasgada sobre o papel onde a marca está impressa.
// Ao entrar na tela: os elementos montam, o pino cai e a folha rasga a partir dele. Clicar no pino rasga uma nova borda.
// Respeita prefers-reduced-motion (sem animação, já rasgado). Todo texto e link é HTML real.
(() => {
  const RIDGE_N = 84, START = 1.06, FLAPS = 6;
  const clamp01 = (v) => (Number.isFinite(v) ? (v < 0 ? 0 : v > 1 ? 1 : v) : 0);
  function rng(seed) {
    let a = (Number.isFinite(seed) ? Math.floor(seed) : 0) >>> 0;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const XS = (() => { const r = rng(911), o = []; for (let i = 0; i < RIDGE_N; i++) { const u = i / (RIDGE_N - 1); const j = i > 0 && i < RIDGE_N - 1 ? (r() - 0.5) * (0.8 / RIDGE_N) : 0; o.push(-0.02 + u * 1.04 + j); } return o; })();
  const ridgeFloor = (x) => { const d = Math.abs(x - 0.5); return d < 0.13 ? 0.5 : d < 0.25 ? 0.53 : 0.58; };
  function makeTear(seed) {
    const r = rng(seed), ph = [r() * 6.283, r() * 6.283, r() * 6.283], ys = [], rim = [], lag = [];
    for (let i = 0; i < RIDGE_N; i++) {
      const x = XS[i], d = Math.min(1, Math.abs(x - 0.5) * 2);
      const base = 0.54 + 0.24 * Math.pow(d, 1.35);
      const wander = (0.022 * Math.sin(x * 7 + ph[0]) + 0.016 * Math.sin(x * 13 + ph[1]) + 0.01 * Math.sin(x * 29 + ph[2])) * (0.45 + 0.55 * d);
      const jag = (r() - 0.5) * 0.022 * (r() < 0.16 ? 2.3 : 1);
      ys.push(Math.min(0.84, Math.max(ridgeFloor(x), base + wander + jag)));
      rim.push(1.2 + r() * 3.6);
      lag.push(Math.min(0.48, d * 0.4 + 0.04 + 0.03 * Math.sin(x * 23 + ph[1]) + r() * 0.012));
    }
    const slots = [0.05, 0.19, 0.33, 0.67, 0.81, 0.95], up = r() < 0.5 ? [2, 4] : [1, 3];
    const flaps = slots.map((slot, k) => {
      const x = slot + (r() - 0.5) * 0.05, span = 3 + Math.floor(r() * 5);
      const at = Math.max(0, Math.min(RIDGE_N - 1 - span, Math.round(x * (RIDGE_N - 1))));
      const dir = up.includes(k) ? -1 : 1, outer = k === 0 || k === slots.length - 1;
      const len = dir < 0 ? 0.022 + r() * 0.022 : outer ? 0.085 + r() * 0.04 : 0.045 + r() * 0.05;
      return { at, span, len, skew: (r() - 0.5) * 1.1, dir, jag: [r() - 0.5, r() - 0.5, r() - 0.5, r() - 0.5] };
    });
    return { ys, rim, lag, flaps };
  }
  const easeTear = (t) => { const x = clamp01(t); if (x === 0 || x === 1) return x; return 1 + 1.9 * Math.pow(x - 1, 3) + 0.9 * Math.pow(x - 1, 2); };
  const easeInOut = (t) => { const x = clamp01(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const introYs = (T, t) => T.ys.map((y, i) => START + (y - START) * easeTear((t - T.lag[i]) / 0.5));
  const morphYs = (from, T, t) => T.ys.map((y, i) => { const a = from[i] ?? y; return a + (y - a) * easeInOut((t - T.lag[i] * 0.6) / 0.6); });
  const flapOpen = (T, f, t) => easeTear((t - T.lag[f.at] - 0.18) / 0.32);
  function flapPoly(ys, f, W, H, open) {
    const b = Math.min(ys.length - 1, f.at + f.span), top = [];
    for (let k = f.at; k <= b; k++) top.push([XS[k] * W, ys[k] * H]);
    const A = top[0], B = top[top.length - 1], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
    const L = f.len * H * Math.max(0, open), tip = [mx + f.skew * L, my + f.dir * L];
    const side = (P, Q, j0, j1) => { const dx = Q[0] - P[0], dy = Q[1] - P[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
      return [[P[0] + dx / 3 + nx * j0 * 0.22 * L, P[1] + dy / 3 + ny * j0 * 0.22 * L], [P[0] + (dx * 2) / 3 + nx * j1 * 0.22 * L, P[1] + (dy * 2) / 3 + ny * j1 * 0.22 * L]]; };
    return [...top, ...side(B, tip, f.jag[0], f.jag[1]), tip, ...side(tip, A, f.jag[2], f.jag[3])];
  }
  const n1 = (v) => Math.round(v * 10) / 10;
  const polyD = (p) => (p.length ? "M" + p.map((q) => n1(q[0]) + " " + n1(q[1])).join("L") + "Z" : "");
  const sheetD = (ys, W, H, off) => { let d = "M-20 -20L" + (W + 20) + " -20"; for (let i = ys.length - 1; i >= 0; i--) d += "L" + n1(XS[i] * W) + " " + n1(ys[i] * H - (off ? off[i] : 0)); return d + "Z"; };
  function mixHex(a, b, t) {
    const p = (h) => { const s = h.replace("#", ""); const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s.padEnd(6, "0").slice(0, 6); return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) || 0); };
    const x = p(a), y = p(b), k = clamp01(t);
    return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join("");
  }

  const SHEET = "#0A2E5D", PAPER = "#F7F6F2", PIN = "#F57C00", INK = "#FFFFFF", PINK = "#0A2E5D";
  const NS = "http://www.w3.org/2000/svg";
  const ic = {
    up: '<path d="M6 14.5 12 8.5l6 6"/>',
    copy: '<path d="M13.5 4.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5v-6.5"/><circle cx="18.5" cy="5.5" r="2.3"/>',
    chat: '<path d="M12 3.5c-4.7 0-8.5 3.3-8.5 7.5 0 2.2 1 4.1 2.7 5.5v3.8l3.4-2c.8.2 1.6.3 2.4.3 4.7 0 8.5-3.4 8.5-7.6S16.7 3.5 12 3.5z"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/>',
    shield: '<path d="M12 3.5 5.5 6v5.2c0 4 2.8 7.4 6.5 9.3 3.7-1.9 6.5-5.3 6.5-9.3V6z"/><path d="m9.3 12 1.9 1.9 3.6-3.7"/>',
    arrow: '<path d="M5 12h13M13 6.5 18.5 12 13 17.5"/>'
  };
  const svgI = (n) => '<svg viewBox="0 0 24 24" class="t-ico" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ic[n] + "</svg>";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function pinSVG(id) {
    const hi = mixHex(PIN, "#ffffff", 0.55), mid = PIN, lo = mixHex(PIN, "#000000", 0.35), deep = mixHex(PIN, "#000000", 0.6);
    const side = (g) => '<linearGradient id="' + g + '" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="' + lo + '"/><stop offset=".24" stop-color="' + mid + '"/><stop offset=".4" stop-color="' + hi + '"/><stop offset=".58" stop-color="' + mid + '"/><stop offset="1" stop-color="' + deep + '"/></linearGradient>';
    return '<svg viewBox="0 0 100 200" class="t-pin-svg" aria-hidden="true"><defs>' + side(id + "s") +
      '<radialGradient id="' + id + 't" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="' + hi + '"/><stop offset=".55" stop-color="' + mid + '"/><stop offset="1" stop-color="' + lo + '"/></radialGradient>' +
      '<linearGradient id="' + id + 'n" x1="0" x2="1"><stop offset="0" stop-color="#5b616b"/><stop offset=".4" stop-color="#f4f5f7"/><stop offset=".7" stop-color="#a3a9b2"/><stop offset="1" stop-color="#4a4f57"/></linearGradient>' +
      '<filter id="' + id + 'b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter></defs>' +
      '<path d="M48.3 112h3.4l-.7 76-1 4-1-4z" fill="url(#' + id + 'n)"/><ellipse cx="50" cy="191.5" rx="3.2" ry="1.1" fill="#0b1a33" opacity=".35"/>' +
      '<path d="M28 103v6.5a22 7 0 0 0 44 0V103z" fill="url(#' + id + 's)"/><ellipse cx="50" cy="103" rx="22" ry="7" fill="url(#' + id + 't)"/>' +
      '<path d="M41.5 38c1.6 16 4.6 26 3 36-1.8 10-13 19-14.6 29h40.2c-1.6-10-12.8-19-14.6-29-1.6-10 1.4-20 3-36z" fill="url(#' + id + 's)"/>' +
      '<path d="M16 22v14a34 13 0 0 0 68 0V22z" fill="url(#' + id + 's)"/><ellipse cx="50" cy="22" rx="34" ry="13" fill="url(#' + id + 't)"/>' +
      '<ellipse cx="50" cy="22" rx="33" ry="12.3" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width=".8"/>' +
      '<ellipse cx="37" cy="17.5" rx="12" ry="4" fill="#fff" opacity=".7" filter="url(#' + id + 'b)"/>' +
      '<path d="M45 50c.8 8 1.6 14 .8 22" stroke="#fff" stroke-opacity=".45" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
  }

  const CSS =
    ":host{display:block}" +
    ".t{position:relative;overflow:hidden;container-type:size;height:max(680px,100svh);max-height:980px;background:" + SHEET + ";color:" + INK + ";font-family:'General Sans',system-ui,sans-serif;isolation:isolate;-webkit-font-smoothing:antialiased;--ease:cubic-bezier(.22,1,.36,1);--fs:max(14px,1.9cqmin)}" +
    ".t *,.t *::before,.t *::after{box-sizing:border-box}" +
    ".t a{color:inherit;text-decoration:none}.t button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer}" +
    ".t :focus-visible{outline:2px solid #FF9433;outline-offset:4px;border-radius:4px}" +
    ".stage{position:absolute;left:0;top:0;display:block;pointer-events:none;z-index:0}" +
    ".t.hit .sheet-g{animation:hit .32s cubic-bezier(.3,.7,.4,1)}" +
    ".t-ico{width:1.3em;height:1.3em;display:block;flex:none}" +
    ".z{position:absolute;z-index:2}" +
    ".h{transition:opacity .6s var(--ease),translate .7s var(--ease);transition-delay:calc(var(--i,0)*45ms)}" +
    ".t:not(.s1) .h{opacity:0;translate:0 10px}" +
    ".p{transition:opacity .7s var(--ease),translate .8s var(--ease);transition-delay:calc(480ms + var(--i,0)*70ms)}" +
    ".t:not(.s3) .p{opacity:0;translate:0 14px;transition-delay:0s}" +
    ".top{left:0;right:0;top:9%;transform:translateY(-50%);display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 max(24px,7%);font-size:var(--fs)}" +
    ".row{display:flex;align-items:center;gap:10px}" +
    ".ib{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;transition:transform .35s var(--ease),background-color .25s}" +
    ".ib:hover{transform:translateY(-2px);background:rgba(255,255,255,.12)}" +
    ".lead{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:max(15px,2.3cqmin);font-weight:500;letter-spacing:-.01em;white-space:nowrap}" +
    ".lead b{color:#FF9433;font-weight:600}" +
    ".mail{display:flex;align-items:center;gap:.6em;min-height:44px;padding:0 .2em;transition:transform .35s var(--ease)}" +
    ".mail:hover{transform:translateY(-2px)}" +
    ".mail span{background:linear-gradient(currentColor,currentColor) 0 100%/0 1px no-repeat;transition:background-size .4s var(--ease)}.mail:hover span{background-size:100% 1px}" +
    ".toast{position:absolute;top:calc(100% + .4em);right:0;font-size:13px;white-space:nowrap;padding:.35em .8em;border-radius:99px;background:#fff;color:" + SHEET + ";opacity:0;transform:translateY(-4px);transition:opacity .25s,transform .35s var(--ease);pointer-events:none}.toast.on{opacity:1;transform:none}" +
    ".cta{left:50%;top:21%;transform:translateX(-50%);display:grid;justify-items:center;gap:14px;text-align:center}" +
    ".cta-q{font-size:max(24px,4.6cqmin);font-weight:600;letter-spacing:-.04em;line-height:1.02;white-space:nowrap}" +
    ".cta-q span{color:#FF9433}" +
    ".btn{display:inline-flex;align-items:center;gap:.7em;min-height:52px;padding:0 1.5em;border-radius:10px;background:#F57C00;color:" + SHEET + ";font-weight:600;font-size:max(15px,2cqmin);transition:background .2s}" +
    ".btn:hover{background:#FF9433}.btn .t-ico{transition:transform .2s}.btn:hover .t-ico{transform:translateX(4px)}" +
    ".flank{top:13.5%;transform:translate(-50%,-50%);font-size:max(12px,1.6cqmin);letter-spacing:.08em;white-space:nowrap;text-transform:uppercase;color:rgba(255,255,255,.78)}" +
    ".clock{font-variant-numeric:tabular-nums}.clock i{font-style:normal;animation:blink 2s steps(1) infinite}" +
    ".status{left:50%;top:41%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:.6em;font-size:max(14px,1.9cqmin);white-space:nowrap;color:rgba(255,255,255,.9)}" +
    ".live{position:relative;width:.5em;height:.5em;border-radius:50%;background:#F57C00}" +
    ".live::after{content:'';position:absolute;inset:0;border-radius:50%;border:1.5px solid #F57C00;animation:ping 2.2s var(--ease) infinite}" +
    ".col{top:24%;display:grid;gap:2px;font-size:var(--fs)}" +
    ".col.l{left:max(24px,8%);justify-items:start}.col.r{right:max(24px,8%);justify-items:end;text-align:right}" +
    ".col h3{margin:0 0 6px;font-size:max(13px,1.6cqmin);font-weight:600;color:#FF9433;letter-spacing:0}" +
    ".col ul{margin:0;padding:0;list-style:none;display:grid;justify-items:inherit}" +
    ".col li a{display:inline-flex;align-items:center;min-height:36px;color:rgba(255,255,255,.9);transition:transform .35s var(--ease),color .2s}" +
    ".col.l li a:hover{transform:translateX(4px);color:#fff}.col.r li a:hover{transform:translateX(-4px);color:#fff}" +
    ".pin{position:absolute;z-index:3;left:50%;top:60%;width:max(46px,8.4cqmin);height:max(92px,16.8cqmin);transform:translate(-50%,-100%);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}" +
    ".tilt{position:absolute;inset:0;transform-origin:50% 100%;transform:rotate(calc(5deg + var(--tilt,0deg)));transition:transform .7s var(--ease)}" +
    ".drop,.body{position:absolute;inset:0;transform-origin:50% 100%}.body{transition:transform .32s var(--ease)}" +
    ".t-pin-svg{position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible}" +
    ".shadow{position:absolute;right:50%;bottom:-.5%;width:150%;height:24%;transform-origin:100% 50%;transform:rotate(16deg);transition:transform .45s var(--ease),opacity .45s}" +
    ".shadow::before{content:'';position:absolute;top:50%;right:0;width:100%;height:24%;border-radius:50%;transform:translateY(-50%);background:linear-gradient(90deg,transparent,rgba(6,32,63,.3) 60%,rgba(6,32,63,.5));filter:blur(2px)}" +
    ".t:not(.s2) .pin{opacity:0;pointer-events:none}" +
    ".t.s2 .drop{animation:drop .62s cubic-bezier(.5,0,.75,0) both}" +
    ".t.s2 .shadow{animation:shade .62s cubic-bezier(.5,0,.75,0) both}" +
    ".pin:hover .body{transform:translateY(-3%)}" +
    ".pin[data-pin=lift] .body{transform:translateY(-22%) rotate(-10deg);transition-duration:.3s}" +
    ".pin[data-pin=lift] .shadow{transform:rotate(16deg) translateX(-26%) scale(1.25);opacity:.55}" +
    ".pin[data-pin=stab] .body{animation:stab .42s cubic-bezier(.55,0,.8,.2) both}" +
    ".brand{left:50%;top:64%;transform:translateX(-50%);display:grid;justify-items:center;gap:6px;color:" + PINK + "}" +
    ".eye{font-size:max(14px,1.9cqmin);font-weight:500;color:#3B4651}" +
    ".logo{display:block;width:min(78cqw,max(300px,62cqmin));height:auto;transition:transform 1s var(--ease) .5s,opacity .8s var(--ease) .5s}" +
    ".t:not(.s3) .logo{transform:translateY(30%);opacity:0;transition-delay:0s}" +
    ".foot{left:0;right:0;bottom:4%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 24px;padding:0 max(24px,8%);font-size:max(13px,1.7cqmin);color:#3B4651}" +
    ".foot a{display:inline-flex;align-items:center;gap:.4em;min-height:40px;color:" + PINK + "}.foot a:hover{text-decoration:underline;text-underline-offset:.2em}" +
    ".foot-l{display:flex;flex-wrap:wrap;gap:4px 24px}" +
    "@container (max-width: 420px){.cta-q{font-size:26px}.col{font-size:14px}.col li a{min-height:34px}.status span{white-space:normal;text-align:center;max-width:30ch}.status{white-space:normal}.foot{font-size:12.5px}}" +
    "@container (max-width: 760px){" +
    ".top{top:6%}.lead,.flank,.mail span{display:none}" +
    ".cta{top:12%}.cta-q{white-space:normal;max-width:14ch}" +
    ".col{top:31%}.col.l{left:24px}.col.r{right:24px}.col li:nth-child(n+4){display:none}" +
    ".status{top:49%;font-size:13px}" +
    ".pin{top:65%}.brand{top:68%}" +
    ".foot{bottom:2.5%;justify-content:center;text-align:center}.foot-l{justify-content:center}" +
    "}" +
    "@keyframes hit{0%{transform:translateY(0)}30%{transform:translateY(2px)}60%{transform:translateY(-.5px)}100%{transform:translateY(0)}}" +
    "@keyframes drop{0%{transform:translateY(-62cqh) rotate(-28deg) scale(1.5);opacity:0}25%{opacity:1}80%{transform:translateY(0) rotate(3deg) scale(1)}90%{transform:scale(1.04,.95)}100%{transform:none;opacity:1}}" +
    "@keyframes shade{0%{transform:rotate(16deg) translateX(-60%) scale(2.4);opacity:0}80%,100%{transform:rotate(16deg);opacity:1}}" +
    "@keyframes stab{0%{transform:translateY(-22%) rotate(-10deg)}70%{transform:translateY(1.5%) rotate(1deg)}100%{transform:none}}" +
    "@keyframes blink{0%{opacity:1}50%{opacity:.25}}" +
    "@keyframes ping{0%{transform:scale(1);opacity:.9}80%,100%{transform:scale(2.6);opacity:0}}" +
    "@media (prefers-reduced-motion: reduce){.t *,.t *::before,.t *::after{animation:none!important;transition-duration:.01s!important;transition-delay:0s!important}}";

  class RaTearFooter extends HTMLElement {
    connectedCallback() {
      if (this._on) return; this._on = true;
      const c = window.raContato ? window.raContato() : { hasWhats: false, hasEmail: false };
      const id = "tf" + Math.random().toString(36).slice(2, 8);
      this._id = id;
      const flapBase = mixHex(PAPER, "#ffffff", 0.35);
      const L = (h, t) => '<li><a href="' + h + '">' + t + "</a></li>";
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = "<style>" + CSS + "</style>" +
        '<footer class="t" part="footer">' +
        '<svg class="stage" aria-hidden="true"><defs>' +
          '<radialGradient id="' + id + 'v" cx=".5" cy=".8" r=".75"><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#06203F" stop-opacity=".08"/></radialGradient>' +
          '<linearGradient id="' + id + 'l" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000c22" stop-opacity=".18"/></linearGradient>' +
          '<pattern id="' + id + 'g" width="160" height="160" patternUnits="userSpaceOnUse"><image class="grain" width="160" height="160"/></pattern>' +
          '<filter id="' + id + 'd" x="-5%" y="-5%" width="110%" height="120%"><feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#06203F" flood-opacity=".32"/></filter>' +
          '<filter id="' + id + 'f" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="-2" dy="4" stdDeviation="4" flood-color="#06203F" flood-opacity=".26"/></filter>' +
          Array.from({ length: FLAPS * 2 }, (_, k) => '<linearGradient id="' + id + "fg" + k + '" class="fg" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="' + mixHex(flapBase, "#1c2a44", 0.34) + '"/><stop offset=".5" stop-color="' + mixHex(flapBase, "#1c2a44", 0.08) + '"/><stop offset="1" stop-color="#ffffff"/></linearGradient>').join("") +
          '<path id="' + id + 's" class="sheetp"/></defs>' +
          '<rect width="100%" height="100%" fill="' + PAPER + '"/>' +
          '<rect width="100%" height="100%" fill="url(#' + id + 'v)" style="mix-blend-mode:multiply"/>' +
          '<rect width="100%" height="100%" fill="url(#' + id + 'g)" opacity=".28"/>' +
          '<g class="sheet-g" filter="url(#' + id + 'd)"><path class="rim" fill="' + mixHex(flapBase, "#ffffff", 0.6) + '"/><use href="#' + id + 's" fill="' + SHEET + '"/></g>' +
          '<use href="#' + id + 's" fill="url(#' + id + 'l)"/>' +
          '<use href="#' + id + 's" fill="url(#' + id + 'g)" opacity=".35"/>' +
          '<g filter="url(#' + id + 'f)">' + Array.from({ length: FLAPS * 2 }, (_, k) => '<path class="flap" fill="url(#' + id + "fg" + k + ')"/>').join("") + "</g>" +
        "</svg>" +
        '<div class="z top">' +
          '<div class="row h" style="--i:0"><button type="button" class="ib up" aria-label="Voltar ao topo" title="Voltar ao topo">' + svgI("up") + "</button>" +
            (c.hasWhats ? '<a class="ib" href="' + esc(c.whatsHref) + '" target="_blank" rel="noopener" data-track="whatsapp_click" aria-label="WhatsApp" title="WhatsApp">' + svgI("chat") + "</a>" : "") +
            (c.hasEmail ? '<a class="ib" href="' + esc(c.emailHref) + '" data-track="email_click" aria-label="E-mail" title="E-mail">' + svgI("mail") + "</a>" : "") +
          "</div>" +
          '<span class="lead h" style="--i:1">Resolva <b>Aqui</b></span>' +
          '<div class="h" style="--i:2;position:relative">' +
            (c.hasEmail ? '<button type="button" class="mail copy" aria-label="Copiar ' + esc(c.email) + '"><span>' + esc(c.email) + "</span>" + svgI("copy") + '</button><span class="toast" role="status" aria-live="polite"></span>'
              : '<a class="mail" href="politica-de-privacidade.dc.html"><span>Privacidade</span>' + svgI("shield") + "</a>") +
          "</div>" +
        "</div>" +
        '<span class="z flank h" style="--i:3;left:24%">Belém · Pará</span>' +
        '<span class="z flank h" style="--i:3;left:76%" title="Horário de Belém"><span class="clock">Belém --<i aria-hidden="true">:</i>--</span></span>' +
        '<div class="z cta h" style="--i:4"><p class="cta-q" style="margin:0">Tem algo para <span>resolver aqui?</span></p>' +
          '<a class="btn" href="contato.dc.html#formulario" data-track="cta_rodape">Explicar minha demanda ' + svgI("arrow") + "</a></div>" +
        '<nav class="z col l h" style="--i:5" aria-label="Páginas"><h3>Páginas</h3><ul>' + L("index.dc.html", "Início") + L("servicos.dc.html", "Serviços") + L("area-de-atuacao.dc.html", "Área de atuação") + L("sobre.dc.html", "Sobre") + L("contato.dc.html", "Contato") + "</ul></nav>" +
        '<nav class="z col r h" style="--i:6" aria-label="Serviços"><h3>Serviços</h3><ul>' + L("servicos.dc.html#apoio-administrativo", "Apoio administrativo") + L("servicos.dc.html#apoio-operacional", "Apoio operacional") + L("servicos.dc.html#busca-e-captacao", "Fornecedores e locais") + L("servicos.dc.html#eventos-e-apoio-local", "Apoio a eventos") + "</ul></nav>" +
        '<span class="z status h" style="--i:7"><i class="live" aria-hidden="true"></i><span>Presencial em Belém e no Pará · remoto para qualquer estado</span></span>' +
        '<button type="button" class="pin" data-pin="idle" aria-label="Rasgar de novo" title="Puxe o pino"><span class="shadow" aria-hidden="true"></span><span class="tilt"><span class="drop"><span class="body">' + pinSVG(id + "p") + "</span></span></span></button>" +
        '<div class="z brand"><span class="eye p" style="--i:0">Apoio local para empresas</span>' +
          '<a href="index.dc.html" aria-label="Resolva Aqui, página inicial"><img class="logo" src="assets/logo-resolva-aqui.webp" alt="Resolva Aqui" width="430" height="144" loading="lazy" decoding="async"></a></div>' +
        '<div class="z foot"><span class="p" style="--i:3">© ' + new Date().getFullYear() + " Resolva Aqui</span>" +
          '<span class="foot-l p" style="--i:4"><a href="politica-de-privacidade.dc.html">' + svgI("shield") + 'Política de privacidade</a><a href="contato.dc.html">Contato</a></span></div>' +
        "</footer>";

      const $ = (s) => root.querySelector(s);
      this.t = $(".t"); this.svg = $(".stage"); this.sheet = $(".sheetp"); this.rimEl = $(".rim");
      this.flaps = Array.from(root.querySelectorAll(".flap")); this.grads = Array.from(root.querySelectorAll(".fg"));
      this.pinEl = $(".pin");
      this.still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.s = { W: 0, H: 0, tear: makeTear(11), prev: null, from: [], ys: [], mode: "wait", t0: 0, dur: 1, raf: 0, px: -1e4, py: -1e4, lift: new Array(FLAPS).fill(0), busy: false, seed: 11 };
      this.timers = [];
      // grão
      try {
        const cv = document.createElement("canvas"); cv.width = cv.height = 160; const g = cv.getContext("2d"); const img = g.createImageData(160, 160); const r = rng(42);
        for (let i = 0; i < img.data.length; i += 4) { const v = r() < 0.5 ? 0 : 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = Math.floor(r() * 46); }
        g.putImageData(img, 0, 0); $(".grain").setAttribute("href", cv.toDataURL());
      } catch (e) {}
      // relógio de Belém
      const clock = $(".clock");
      let fmt; try { fmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "America/Belem" }); } catch (e) { fmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
      const tick = () => { const p = fmt.format(new Date()).split(":"); clock.innerHTML = "Belém " + p[0] + '<i aria-hidden="true">:</i>' + (p[1] || ""); };
      tick(); this._clock = setInterval(tick, 10000);
      // ações
      $(".up").addEventListener("click", () => window.scrollTo({ top: 0, behavior: this.still ? "auto" : "smooth" }));
      const copy = $(".copy");
      if (copy) copy.addEventListener("click", () => {
        const toast = $(".toast"); const show = (m) => { toast.textContent = m; toast.classList.add("on"); this.later(() => toast.classList.remove("on"), 1600); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(c.email).then(() => show("E-mail copiado"), () => show(c.email)); else show(c.email);
      });
      root.addEventListener("click", (e) => { const a = e.target.closest && e.target.closest("[data-track]"); if (a && window.raTrack) window.raTrack(a.getAttribute("data-track"), { destino: a.getAttribute("href") || "" }); });
      this.pinEl.addEventListener("click", () => this.repin());
      this.t.addEventListener("pointermove", (e) => {
        if (this.still) return; const r = this.t.getBoundingClientRect();
        this.s.px = e.clientX - r.left; this.s.py = e.clientY - r.top;
        this.pinEl.style.setProperty("--tilt", Math.max(-9, Math.min(9, (this.s.px / r.width - 0.5) * 18)).toFixed(2) + "deg"); this.kick();
      });
      this.t.addEventListener("pointerleave", () => { this.s.px = this.s.py = -1e4; this.pinEl.style.setProperty("--tilt", "0deg"); this.kick(); });
      this.ro = new ResizeObserver(() => {
        this.s.W = this.t.clientWidth; this.s.H = this.t.clientHeight;
        this.svg.setAttribute("width", this.s.W); this.svg.setAttribute("height", this.s.H); this.svg.setAttribute("viewBox", "0 0 " + this.s.W + " " + this.s.H);
        this.kick();
      });
      this.ro.observe(this.t);
      this.io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { this.open(); this.io.disconnect(); } }, { threshold: 0.22 });
      this.io.observe(this.t);
    }
    later(fn, ms) { this.timers.push(setTimeout(fn, ms)); }
    kick() { if (!this.s.raf) this.s.raf = requestAnimationFrame((n) => this.frame(n)); }
    open() {
      const s = this.s, t = this.t;
      if (this.still) { t.classList.add("s1", "s2", "s3"); s.mode = "rest"; return this.kick(); }
      t.classList.add("s1");
      this.later(() => t.classList.add("s2"), 640);
      this.later(() => { t.classList.add("hit", "s3"); s.mode = "intro"; s.t0 = performance.now(); s.dur = 1550; this.kick(); }, 1140);
      this.later(() => t.classList.remove("hit"), 1480);
    }
    repin() {
      const s = this.s;
      if (s.busy || !this.t.classList.contains("s3")) return;
      const next = s.seed + 1;
      const swap = () => { s.seed = next; s.prev = s.tear; s.from = s.ys.length ? s.ys : s.tear.ys; s.tear = makeTear(next); };
      if (this.still) { swap(); s.prev = null; s.mode = "rest"; return this.kick(); }
      s.busy = true; this.pinEl.dataset.pin = "lift";
      this.later(() => { swap(); s.mode = "morph"; s.t0 = performance.now(); s.dur = 1150; this.kick(); }, 300);
      this.later(() => (this.pinEl.dataset.pin = "stab"), 1280);
      this.later(() => { this.pinEl.dataset.pin = "idle"; s.busy = false; }, 1720);
    }
    frame(now) {
      const s = this.s; s.raf = 0;
      const { W, H, tear } = s; if (!W || !H) return;
      let busy = false, ys;
      const open = new Array(FLAPS).fill(1), openOld = new Array(FLAPS).fill(0);
      if (s.mode === "wait") { ys = tear.ys.map(() => START); open.fill(0); }
      else if (s.mode === "intro") { const p = (now - s.t0) / s.dur; ys = introYs(tear, Math.min(1, p)); tear.flaps.forEach((f, k) => (open[k] = flapOpen(tear, f, Math.min(1, p)))); if (p >= 1) s.mode = "rest"; else busy = true; }
      else if (s.mode === "morph") { const p = (now - s.t0) / s.dur; ys = morphYs(s.from, tear, Math.min(1, p)); open.fill(easeTear((p - 0.5) / 0.5)); openOld.fill(1 - easeInOut(p / 0.35)); if (p >= 1) s.mode = "rest"; else busy = true; }
      else ys = tear.ys;
      s.ys = ys;
      tear.flaps.forEach((f, k) => {
        const b = Math.min(ys.length - 1, f.at + f.span), mx = ((XS[f.at] + XS[b]) / 2) * W, my = ((ys[f.at] + ys[b]) / 2) * H;
        const target = this.still ? 0 : clamp01(1 - Math.hypot(s.px - mx, s.py - my) / (0.2 * Math.max(W, 520)));
        s.lift[k] += (target - s.lift[k]) * 0.14; if (Math.abs(target - s.lift[k]) > 0.003) busy = true;
        open[k] *= 1 + 0.32 * s.lift[k];
      });
      this.sheet.setAttribute("d", sheetD(ys, W, H, tear.rim));
      this.rimEl.setAttribute("d", sheetD(ys, W, H));
      const draw = (k, f, o) => {
        const el = this.flaps[k], g = this.grads[k]; if (!el || !g) return;
        if (!f || o < 0.01) return el.setAttribute("d", "");
        const pts = flapPoly(ys, f, W, H, o); el.setAttribute("d", polyD(pts));
        const b = Math.min(ys.length - 1, f.at + f.span), tip = pts[f.span + 3];
        g.setAttribute("x1", ((XS[f.at] + XS[b]) / 2) * W); g.setAttribute("y1", ((ys[f.at] + ys[b]) / 2) * H); g.setAttribute("x2", tip[0]); g.setAttribute("y2", tip[1]);
      };
      for (let k = 0; k < FLAPS; k++) { draw(k, tear.flaps[k], open[k]); draw(FLAPS + k, s.prev && s.prev.flaps[k], openOld[k]); }
      if (busy) this.kick();
    }
    disconnectedCallback() {
      clearInterval(this._clock); this.timers.forEach(clearTimeout);
      if (this.ro) this.ro.disconnect(); if (this.io) this.io.disconnect();
      if (this.s) cancelAnimationFrame(this.s.raf);
    }
  }
  if (!customElements.get("ra-tear-footer")) customElements.define("ra-tear-footer", RaTearFooter);
})();

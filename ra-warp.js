// <ra-warp> — fundo animado (Paper Shaders · Warp) em JS puro, sem React/Tailwind/npm.
// Atributos: colors="#hex,#hex,..." shape="checks|stripes|edge" proportion softness distortion swirl swirl-iterations shape-scale speed
// Pausa fora da tela, fica estático com prefers-reduced-motion e cai para um fundo sólido se o WebGL/CDN falhar.
(() => {
  const SRC = "https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.76/+esm";
  let lib = null;
  const load = () => lib || (lib = import(SRC));
  const hex = (h) => {
    const m = /^#?([\da-f]{6})$/i.exec(String(h).trim());
    if (!m) return [0, 0, 0, 1];
    const n = parseInt(m[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
  };
  const SHAPES = { checks: 0, stripes: 1, edge: 2 };
  const LITE = !!((navigator.connection && navigator.connection.saveData) || (navigator.hardwareConcurrency || 8) <= 4 || matchMedia("(max-width: 640px), (pointer: coarse)").matches);

  class RaWarp extends HTMLElement {
    connectedCallback() {
      if (this._init) return;
      this._init = true;
      const cols = (this.getAttribute("colors") || "#06203F,#0A2E5D").split(",");
      this.style.display = "block";
      this.style.position = this.style.position || "absolute";
      this.style.inset = this.style.inset || "0";
      this.style.background = "linear-gradient(135deg," + cols.join(",") + ")";
      this._reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this._speed = this._reduce ? 0 : parseFloat(this.getAttribute("speed") || "0.5");
      this._io = new IntersectionObserver((es) => {
        const vis = es.some((e) => e.isIntersecting);
        if (vis && !this._mount && !this._loading && !LITE) this._start(cols);
        if (this._mount && this._mount.setSpeed) this._mount.setSpeed(vis ? this._speed : 0);
      }, { rootMargin: "200px" });
      this._io.observe(this);
    }

    async _start(cols) {
      this._loading = true;
      try {
        const L = await load();
        const n = (a, d) => { const v = parseFloat(this.getAttribute(a)); return Number.isFinite(v) ? v : d; };
        const u = {
          u_colors: cols.map(hex), u_colorsCount: cols.length,
          u_proportion: n("proportion", 0.4), u_softness: n("softness", 1),
          u_shape: (L.WarpPatterns && L.WarpPatterns[this.getAttribute("shape") || "checks"]) ?? SHAPES[this.getAttribute("shape") || "checks"] ?? 0,
          u_shapeScale: n("shape-scale", 0.1), u_distortion: n("distortion", 0.2),
          u_swirl: n("swirl", 0.8), u_swirlIterations: n("swirl-iterations", 10),
          u_fit: 0, u_scale: 1, u_rotation: 0, u_originX: 0.5, u_originY: 0.5, u_offsetX: 0, u_offsetY: 0, u_worldWidth: 0, u_worldHeight: 0
        };
        if (L.getShaderNoiseTexture) u.u_noiseTexture = L.getShaderNoiseTexture();
        this._mount = new L.ShaderMount(this, L.warpFragmentShader, u, undefined, this._speed, 0, 1, 420 * 320);
        if (this._mount.setSpeed) this._mount.setSpeed(this._speed);
      } catch (e) {
        console.warn("[ra-warp] shader indisponível, usando fundo estático.", e);
      }
      this._loading = false;
    }

    disconnectedCallback() {
      if (this._io) this._io.disconnect();
      if (this._mount && this._mount.dispose) this._mount.dispose();
      this._mount = null; this._init = false;
    }
  }
  if (!customElements.get("ra-warp")) customElements.define("ra-warp", RaWarp);
})();

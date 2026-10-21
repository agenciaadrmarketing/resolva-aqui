// <ra-metal>: aro metálico animado (só a borda; a face fica laranja sólida) (shader do Metallic Button, adaptado à marca) aplicada ao botão filho.
// O canvas é inserido DENTRO do botão, atrás do texto; o <ra-metal> usa display: contents (não altera o layout).
// Velocidade: repouso 0.6, hover 1, clique 2.4 + ondulação. Pausa fora da tela. Estático com prefers-reduced-motion.
// Sem WebGL2: o botão mantém o fundo laranja original.
(() => {
  const VS = `#version 300 es
precision mediump float;
layout(location = 0) in vec4 a_position;
uniform vec2 u_resolution;uniform float u_pixelRatio;uniform float u_originX;uniform float u_originY;uniform float u_worldWidth;uniform float u_worldHeight;uniform float u_fit;uniform float u_scale;uniform float u_rotation;uniform float u_offsetX;uniform float u_offsetY;
out vec2 v_objectUV;out vec2 v_responsiveUV;out vec2 v_responsiveBoxGivenSize;
vec3 getBoxSize(float boxRatio,vec2 givenBoxSize){vec2 box=vec2(0.);box.x=boxRatio*min(givenBoxSize.x/boxRatio,givenBoxSize.y);float noFitBoxWidth=box.x;if(u_fit==1.){box.x=boxRatio*min(u_resolution.x/boxRatio,u_resolution.y);}else if(u_fit==2.){box.x=boxRatio*max(u_resolution.x/boxRatio,u_resolution.y);}box.y=box.x/boxRatio;return vec3(box,noFitBoxWidth);}
void main(){gl_Position=a_position;vec2 uv=gl_Position.xy*.5;vec2 boxOrigin=vec2(.5-u_originX,u_originY-.5);vec2 givenBoxSize=vec2(u_worldWidth,u_worldHeight);givenBoxSize=max(givenBoxSize,vec2(1.))*u_pixelRatio;float r=u_rotation*3.14159265358979323846/180.;mat2 graphicRotation=mat2(cos(r),sin(r),-sin(r),cos(r));vec2 graphicOffset=vec2(-u_offsetX,u_offsetY);float fixedRatio=1.;vec2 fixedRatioBoxGivenSize=vec2((u_worldWidth==0.)?u_resolution.x:givenBoxSize.x,(u_worldHeight==0.)?u_resolution.y:givenBoxSize.y);vec2 objectBoxSize=getBoxSize(fixedRatio,fixedRatioBoxGivenSize).xy;vec2 objectWorldScale=u_resolution.xy/objectBoxSize;v_objectUV=uv;v_objectUV*=objectWorldScale;v_objectUV+=boxOrigin*(objectWorldScale-1.);v_objectUV+=graphicOffset;v_objectUV/=u_scale;v_objectUV=graphicRotation*v_objectUV;v_responsiveBoxGivenSize=vec2((u_worldWidth==0.)?u_resolution.x:givenBoxSize.x,(u_worldHeight==0.)?u_resolution.y:givenBoxSize.y);float responsiveRatio=v_responsiveBoxGivenSize.x/v_responsiveBoxGivenSize.y;vec2 responsiveBoxSize=getBoxSize(responsiveRatio,v_responsiveBoxGivenSize).xy;vec2 responsiveBoxScale=u_resolution.xy/responsiveBoxSize;v_responsiveUV=uv;v_responsiveUV*=responsiveBoxScale;v_responsiveUV+=boxOrigin*(responsiveBoxScale-1.);v_responsiveUV+=graphicOffset;v_responsiveUV/=u_scale;v_responsiveUV.x*=responsiveRatio;v_responsiveUV=graphicRotation*v_responsiveUV;v_responsiveUV.x/=responsiveRatio;}`;
  const FS = `#version 300 es
precision mediump float;
uniform vec2 u_resolution;uniform float u_time;uniform vec4 u_colorBack;uniform vec4 u_colorTint;uniform float u_softness;uniform float u_repetition;uniform float u_shiftRed;uniform float u_shiftBlue;uniform float u_distortion;uniform float u_contour;uniform float u_angle;
in vec2 v_objectUV;in vec2 v_responsiveUV;in vec2 v_responsiveBoxGivenSize;out vec4 fragColor;
#define PI 3.14159265358979323846
vec2 rotate(vec2 uv,float th){return mat2(cos(th),sin(th),-sin(th),cos(th))*uv;}
vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1;i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}
float getColorChanges(float c1,float c2,float stripe_p,vec3 w,float blur,float bump,float tint){float ch=mix(c2,c1,smoothstep(.0,2.*blur,stripe_p));float border=w[0];ch=mix(ch,c2,smoothstep(border,border+2.*blur,stripe_p));border=w[0]+.4*(1.-bump)*w[1];ch=mix(ch,c1,smoothstep(border,border+2.*blur,stripe_p));border=w[0]+.5*(1.-bump)*w[1];ch=mix(ch,c2,smoothstep(border,border+2.*blur,stripe_p));border=w[0]+w[1];ch=mix(ch,c1,smoothstep(border,border+2.*blur,stripe_p));float gradient_t=(stripe_p-w[0]-w[1])/w[2];float gradient=mix(c1,c2,smoothstep(0.,1.,gradient_t));ch=mix(ch,gradient,smoothstep(border,border+.5*blur,stripe_p));ch=mix(ch,1.-min(1.,(1.-ch)/max(tint,0.0001)),u_colorTint.a);return ch;}
void main(){const float firstFrameOffset=2.8;float t=.3*(u_time+firstFrameOffset);vec2 uv=v_objectUV+.5;uv.y=1.-uv.y;float cycleWidth=u_repetition;float edge=0.;vec2 rotatedUV=uv-vec2(.5);float angle=(-u_angle+70.)*PI/180.;float cosA=cos(angle);float sinA=sin(angle);rotatedUV=vec2(rotatedUV.x*cosA-rotatedUV.y*sinA,rotatedUV.x*sinA+rotatedUV.y*cosA)+vec2(.5);vec2 shapeUV=uv-.5;shapeUV*=.67;edge=pow(clamp(3.*length(shapeUV),0.,1.),18.);edge=mix(smoothstep(.9-2.*fwidth(edge),.9,edge),edge,smoothstep(0.0,0.4,u_contour));float opacity=1.-smoothstep(.9-2.*fwidth(edge),.9,edge);edge=1.2*edge;float diagBLtoTR=rotatedUV.x-rotatedUV.y;float diagTLtoBR=rotatedUV.x+rotatedUV.y;vec3 color=vec3(0.);vec3 color1=vec3(.98,0.98,1.);vec3 color2=vec3(.1,.1,.1+.1*smoothstep(.7,1.3,diagTLtoBR));vec2 grad_uv=uv-.5;float dist=length(grad_uv+vec2(0.,.2*diagBLtoTR));grad_uv=rotate(grad_uv,(.25-.2*diagBLtoTR)*PI);float direction=grad_uv.x;float bump=pow(1.8*dist,1.2);bump=1.-bump;bump*=pow(uv.y,.3);float thin_strip_1_ratio=.12/cycleWidth*(1.-.4*bump);float thin_strip_2_ratio=.07/cycleWidth*(1.+.4*bump);float wide_strip_ratio=(1.-thin_strip_1_ratio-thin_strip_2_ratio);float thin_strip_1_width=cycleWidth*thin_strip_1_ratio;float thin_strip_2_width=cycleWidth*thin_strip_2_ratio;float noise=snoise(uv-t);edge+=(1.-edge)*u_distortion*noise;direction+=diagBLtoTR;float contour=0.;direction-=2.*noise*diagBLtoTR*(smoothstep(0.,1.,edge)*(1.0-smoothstep(0.,1.,edge)));direction*=mix(1.,1.-edge,smoothstep(.5,1.,u_contour));direction-=1.7*edge*smoothstep(.5,1.,u_contour);direction+=.2*pow(u_contour,4.)*(1.0-smoothstep(0.,1.,edge));bump*=clamp(pow(uv.y,.1),.3,1.);direction*=(.1+(1.1-edge)*bump);direction*=(.4+.6*(1.0-smoothstep(.5,1.,edge)));direction+=.18*(smoothstep(.1,.2,uv.y)*(1.0-smoothstep(.2,.4,uv.y)));direction+=.03*(smoothstep(.1,.2,1.-uv.y)*(1.0-smoothstep(.2,.4,1.-uv.y)));direction*=(.5+.5*pow(uv.y,2.));direction*=cycleWidth;direction-=t;float colorDispersion=(1.-bump);colorDispersion=clamp(colorDispersion,0.,1.);float dispersionRed=colorDispersion;dispersionRed+=.03*bump*noise;dispersionRed+=5.*(smoothstep(-.1,.2,uv.y)*(1.0-smoothstep(.1,.5,uv.y)))*(smoothstep(.4,.6,bump)*(1.0-smoothstep(.4,1.,bump)));dispersionRed-=diagBLtoTR;float dispersionBlue=colorDispersion;dispersionBlue*=1.3;dispersionBlue+=(smoothstep(0.,.4,uv.y)*(1.0-smoothstep(.1,.8,uv.y)))*(smoothstep(.4,.6,bump)*(1.0-smoothstep(.4,.8,bump)));dispersionBlue-=.2*edge;dispersionRed*=(u_shiftRed/20.);dispersionBlue*=(u_shiftBlue/20.);float blur=u_softness/15.+.3*contour;vec3 w=vec3(thin_strip_1_width,thin_strip_2_width,wide_strip_ratio);w[1]-=.02*smoothstep(.0,1.,edge+bump);float stripe_r=fract(direction+dispersionRed);float r=getColorChanges(color1.r,color2.r,stripe_r,w,blur+fwidth(stripe_r),bump,u_colorTint.r);float stripe_g=fract(direction);float g=getColorChanges(color1.g,color2.g,stripe_g,w,blur+fwidth(stripe_g),bump,u_colorTint.g);float stripe_b=fract(direction-dispersionBlue);float b=getColorChanges(color1.b,color2.b,stripe_b,w,blur+fwidth(stripe_b),bump,u_colorTint.b);color=vec3(r,g,b);color*=opacity;vec3 bgColor=u_colorBack.rgb*u_colorBack.a;color=color+bgColor*(1.-opacity);opacity=opacity+u_colorBack.a*(1.-opacity);color+=1./256.*(fract(sin(dot(.014*gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453123)-.5);fragColor=vec4(color,opacity);}`;

  const rgba = (hex) => { let h = hex.replace("#", ""); if (h.length === 6) h += "ff"; const n = parseInt(h, 16); return [((n >> 24) & 255) / 255, ((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
  const mk = (gl, type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; } return s; };

  const LITE = !!((navigator.connection && navigator.connection.saveData) || (navigator.hardwareConcurrency || 8) <= 4 || matchMedia("(max-width: 640px), (pointer: coarse)").matches);
  if (!document.getElementById("ra-metal-kf")) {
    const st = document.createElement("style"); st.id = "ra-metal-kf";
    st.textContent = "@keyframes ra-metal-ripple{0%{transform:translate(-50%,-50%) scale(0);opacity:.6}100%{transform:translate(-50%,-50%) scale(5);opacity:0}}";
    document.head.appendChild(st);
  }

  class RaMetal extends HTMLElement {
    connectedCallback() {
      if (this._on) return;
      this.style.display = "contents";
      const btn = this.querySelector("a,button");
      if (!btn) return;
      this._on = true; this.btn = btn;
      const bs = btn.style;
      bs.position = "relative"; bs.isolation = "isolate"; bs.overflow = "hidden"; bs.color = "#FFFFFF";
      bs.textShadow = "0 1px 2px rgba(6,32,63,.55)";
      this.rest = "0 0 0 1px rgba(122,52,0,.55), 0 20px 12px -8px rgba(6,32,63,.10), 0 9px 9px -4px rgba(6,32,63,.16), 0 2px 5px rgba(6,32,63,.18)";
      this.hov = "0 0 0 1px rgba(122,52,0,.65), 0 12px 8px -6px rgba(6,32,63,.12), 0 6px 6px -3px rgba(6,32,63,.18), 0 1px 2px rgba(6,32,63,.22)";
      bs.boxShadow = this.rest;
      bs.transition = (bs.transition ? bs.transition + ", " : "") + "box-shadow 150ms ease, transform 500ms cubic-bezier(.34,1.56,.64,1)";
      this.layer = document.createElement("span");
      this.layer.setAttribute("aria-hidden", "true");
      this.layer.style.cssText = "position:absolute;inset:0;z-index:-1;pointer-events:none;border-radius:inherit;overflow:hidden;background:linear-gradient(180deg,#F57C00,#D86400)";
      // face sólida por cima do shader: o metal aparece só como aro de 3px
      this.face = document.createElement("span");
      this.face.style.cssText = "position:absolute;inset:3px;border-radius:inherit;background:linear-gradient(180deg,#F57C00 0%,#E86F00 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),inset 0 -2px 0 rgba(6,32,63,.18)";
      this.layer.appendChild(this.face);
      btn.prepend(this.layer);
      this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.idle = this.reduced || LITE ? 0 : 0.6; this.speed = this.idle; this.frame = 0; this.last = performance.now(); this.raf = 0; this.inView = true;
      btn.addEventListener("pointerenter", () => { this.setSpeed(1); bs.boxShadow = this.hov; });
      btn.addEventListener("pointerleave", () => { this.setSpeed(this.idle); bs.boxShadow = this.rest; bs.transform = ""; });
      btn.addEventListener("pointerdown", () => { bs.transform = "translateY(1px) scale(.98)"; bs.boxShadow = "0 0 0 1px rgba(122,52,0,.7), 0 1px 2px rgba(6,32,63,.3), inset 0 2px 4px rgba(0,0,0,.25)"; });
      btn.addEventListener("pointerup", () => { bs.transform = ""; bs.boxShadow = this.hov; });
      btn.addEventListener("click", (e) => {
        if (this.reduced) return;
        this.setSpeed(2.4); clearTimeout(this._ct); this._ct = setTimeout(() => this.setSpeed(btn.matches(":hover") && !LITE ? 1 : this.idle), 300);
        const r = btn.getBoundingClientRect(), rp = document.createElement("span");
        rp.setAttribute("aria-hidden", "true");
        rp.style.cssText = "position:absolute;z-index:0;width:24px;height:24px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(255,255,255,.45) 0%,rgba(255,255,255,0) 70%);animation:ra-metal-ripple .6s ease-out forwards;left:" + (e.clientX - r.left) + "px;top:" + (e.clientY - r.top) + "px";
        btn.appendChild(rp); setTimeout(() => rp.remove(), 650);
      });
      this.io = new IntersectionObserver(([en]) => { this.inView = en.isIntersecting; if (this.inView) { if (!this.gl && !this.failed) this.init(); this.kick(); } }, { rootMargin: "100px" });
      this.io.observe(btn);
    }
    init() {
      const c = document.createElement("canvas");
      c.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
      const gl = c.getContext("webgl2", { antialias: true, premultipliedAlpha: true, alpha: true });
      if (!gl) { this.failed = true; return; }
      const v = mk(gl, gl.VERTEX_SHADER, VS), f = mk(gl, gl.FRAGMENT_SHADER, FS);
      if (!v || !f) { this.failed = true; return; }
      const p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { this.failed = true; return; }
      gl.useProgram(p);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const L = (n) => gl.getUniformLocation(p, n);
      gl.uniform4fv(L("u_colorBack"), rgba("#C85A00"));
      gl.uniform4fv(L("u_colorTint"), rgba("#F57C00"));
      [["u_repetition", 4], ["u_softness", 0.5], ["u_angle", 45], ["u_distortion", 0], ["u_shiftRed", 0.3], ["u_shiftBlue", 0.3], ["u_contour", 0], ["u_scale", 8], ["u_fit", 1], ["u_rotation", 0], ["u_offsetX", 0.1], ["u_offsetY", -0.1], ["u_originX", 0.5], ["u_originY", 0.5], ["u_worldWidth", 0], ["u_worldHeight", 0]].forEach(([n, x]) => gl.uniform1f(L(n), x));
      this.gl = gl; this.uTime = L("u_time"); this.uRes = L("u_resolution"); this.uPR = L("u_pixelRatio"); this.c = c;
      this.layer.prepend(c);
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this.layer);
      this.resize();
    }
    resize() {
      if (!this.gl) return;
      const w = this.layer.clientWidth, h = this.layer.clientHeight; if (!w || !h) return;
      const s = Math.min(1.5, Math.max(1, devicePixelRatio || 1));
      this.c.width = Math.round(w * s); this.c.height = Math.round(h * s);
      this.gl.viewport(0, 0, this.c.width, this.c.height);
      this.gl.uniform2f(this.uRes, this.c.width, this.c.height); this.gl.uniform1f(this.uPR, s);
      this.draw(performance.now());
    }
    draw(now) {
      this.raf = 0; const gl = this.gl; if (!gl) return;
      const dt = now - this.last; this.last = now;
      if (this.speed && this.inView) this.frame += dt * this.speed;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(this.uTime, this.frame * 1e-3);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (this.speed && this.inView) this.raf = requestAnimationFrame((t) => this.draw(t));
    }
    kick() { if (this.gl && !this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame((t) => this.draw(t)); } }
    setSpeed(s) { if (this.reduced) return; this.speed = s; if (s) this.kick(); else if (this.gl) this.draw(performance.now()); }
    disconnectedCallback() {
      cancelAnimationFrame(this.raf); clearTimeout(this._ct);
      if (this.io) this.io.disconnect(); if (this.ro) this.ro.disconnect();
      const ext = this.gl && this.gl.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext();
      if (this.layer) this.layer.remove();
      this.gl = null; this._on = false;
    }
  }
  if (!customElements.get("ra-metal")) customElements.define("ra-metal", RaMetal);
})();

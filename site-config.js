// Configuração única do site. Preencher aqui (vale para todas as páginas).
// [VALIDAR COM CLIENTE] todos os campos.
window.RA_CONFIG = {
  leadEndpoint: "",   // URL /exec do Google Apps Script (backend/google-apps-script/README.md)
  whatsapp: "",       // com DDI e DDD, só números: 5591900000000
  emailPublico: ""    // e-mail exibido no rodapé
};

// Medição: eventos vão para dataLayer (pronto para GTM/GA4). Nenhum script de terceiro é carregado aqui.
window.dataLayer = window.dataLayer || [];
window.raTrack = function (evento, params) {
  try { window.dataLayer.push(Object.assign({ event: evento, pagina: location.pathname }, params || {})); } catch (e) {}
};
document.addEventListener("click", function (e) {
  var a = e.target && e.target.closest ? e.target.closest("[data-track]") : null;
  if (a) window.raTrack(a.getAttribute("data-track"), { destino: a.getAttribute("href") || "" });
}, true);

// Atribuição do lead (primeira página da sessão, referrer, UTM). Fica só na sessão do navegador.
(function () {
  try {
    if (sessionStorage.getItem("ra_attr")) return;
    var u = new URL(location.href), o = { landing: location.pathname, referrer: (document.referrer || "").slice(0, 300) };
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(function (k) { var v = u.searchParams.get(k); if (v) o[k] = v.slice(0, 100); });
    sessionStorage.setItem("ra_attr", JSON.stringify(o));
  } catch (e) {}
})();

window.RA_WA_MSG = "Olá! Encontrei a Resolva Aqui pelo site e gostaria de explicar uma demanda.";
window.raContato = function () {
  var c = window.RA_CONFIG || {}, wa = String(c.whatsapp || "").replace(/\D/g, ""), em = String(c.emailPublico || "").trim();
  return {
    hasWhats: wa.length >= 12,
    whatsHref: "https://wa.me/" + wa + "?text=" + encodeURIComponent(window.RA_WA_MSG),
    hasEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em), email: em, emailHref: "mailto:" + em,
    endpoint: String(c.leadEndpoint || "").trim()
  };
};

/**
 * Resolva Aqui — recebimento de leads do formulário do site.
 * Armazena cada lead em uma planilha Google (aba "Leads") e envia e-mail de aviso à responsável.
 *
 * Configuração (Projeto > Configurações > Propriedades do script):
 *   NOTIFY_EMAIL  e-mail que recebe o aviso de novo lead          [VALIDAR COM CLIENTE]
 *   SHEET_ID      ID da planilha (trecho da URL entre /d/ e /edit)
 *
 * Publicar: Implantar > Nova implantação > App da Web
 *   Executar como: Eu | Quem pode acessar: Qualquer pessoa
 * Copie a URL /exec e cole na prop `leadEndpoint` do index.dc.html (ou na build de produção).
 * Nenhum segredo fica no frontend: a URL só aceita POST e valida o conteúdo aqui.
 */

const COLUNAS = ["Recebido em", "Tipo", "Descrição", "Local", "Cidade", "Prazo", "Nome", "WhatsApp", "E-mail", "Empresa", "Página do envio", "Seção", "Página de entrada", "Referrer", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const LIMITE = { descricao: 3000, curto: 200 };

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // Anti-spam: honeypot preenchido ou envio rápido demais → aceita silenciosamente sem gravar.
    if (d.site || Number(d.tempoNoForm) < 3) return json_({ ok: true });

    const lead = {
      tipo: corta_(d.tipo, LIMITE.curto),
      descricao: corta_(d.descricao, LIMITE.descricao),
      local: corta_(d.local, LIMITE.curto),
      cidade: corta_(d.cidade, LIMITE.curto),
      prazo: corta_(d.prazo, LIMITE.curto),
      nome: corta_(d.nome, LIMITE.curto),
      whatsapp: corta_(d.whatsapp, 40),
      email: corta_(d.email, LIMITE.curto),
      empresa: corta_(d.empresa, LIMITE.curto),
      pagina: corta_(d.pagina, 300),
      origem: corta_(d.origem, 60),
      landing: corta_(d.landing, 300),
      referrer: corta_(d.referrer, 300),
      utm_source: corta_(d.utm_source, 100), utm_medium: corta_(d.utm_medium, 100), utm_campaign: corta_(d.utm_campaign, 100), utm_term: corta_(d.utm_term, 100), utm_content: corta_(d.utm_content, 100)
    };

    const erros = [];
    if (!lead.descricao) erros.push("descricao");
    if (!lead.local) erros.push("local");
    if (!lead.nome) erros.push("nome");
    if (lead.whatsapp.replace(/\D/g, "").length < 10) erros.push("whatsapp");
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) erros.push("email");
    if (erros.length) return json_({ ok: false, erro: "validacao", campos: erros });

    // Limite simples: no máximo 5 envios por número a cada 10 minutos.
    const cache = CacheService.getScriptCache();
    const chave = "w" + lead.whatsapp.replace(/\D/g, "");
    const n = Number(cache.get(chave) || 0);
    if (n >= 5) return json_({ ok: false, erro: "limite" });
    cache.put(chave, String(n + 1), 600);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const aba = planilha_();
      aba.appendRow([new Date(), lead.tipo, lead.descricao, lead.local, lead.cidade, lead.prazo,
        lead.nome, "'" + lead.whatsapp, lead.email, lead.empresa, lead.pagina, lead.origem, lead.landing, lead.referrer,
        lead.utm_source, lead.utm_medium, lead.utm_campaign, lead.utm_term, lead.utm_content]);
    } finally {
      lock.releaseLock();
    }

    avisar_(lead);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, erro: "interno" });
  }
}

function doGet() {
  return json_({ ok: true, servico: "resolva-aqui-leads" });
}

function planilha_() {
  const id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  const ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  let aba = ss.getSheetByName("Leads");
  if (!aba) { aba = ss.insertSheet("Leads"); aba.appendRow(COLUNAS); aba.setFrozenRows(1); }
  return aba;
}

function avisar_(l) {
  const para = PropertiesService.getScriptProperties().getProperty("NOTIFY_EMAIL");
  if (!para) return;
  const wa = l.whatsapp.replace(/\D/g, "");
  const corpo = [
    "Nova demanda recebida pelo site.", "",
    "Tipo: " + (l.tipo || "—"),
    "Local: " + l.local + (l.cidade ? " — " + l.cidade : ""),
    "Prazo: " + (l.prazo || "—"), "",
    "Descrição:", l.descricao, "",
    "Nome: " + l.nome,
    "WhatsApp: " + l.whatsapp + (wa ? "  (https://wa.me/" + (wa.length <= 11 ? "55" + wa : wa) + ")" : ""),
    "E-mail: " + (l.email || "—"),
    "Empresa: " + (l.empresa || "—"), "",
    "Enviado em: " + (l.pagina || "—") + (l.landing ? " · entrada: " + l.landing : "") + (l.utm_source ? " · utm: " + l.utm_source + "/" + l.utm_medium : "")
  ].join("\n");
  MailApp.sendEmail({ to: para, subject: "Nova demanda: " + (l.tipo || "site") + " — " + l.nome, body: corpo, replyTo: l.email || undefined });
}

function corta_(v, max) { return String(v == null ? "" : v).trim().slice(0, max); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

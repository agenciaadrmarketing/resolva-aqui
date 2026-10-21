# Leads — Google Apps Script

**Por que esta arquitetura:** sem servidor para manter, sem custo, sem chave privada no frontend. O lead fica numa planilha (histórico, filtro, exportação) e a responsável recebe um e-mail a cada envio. Funciona com hospedagem estática (GitHub Pages, Hostinger).

## Configurar (≈10 min)

1. Crie uma planilha Google "Resolva Aqui — Leads".
2. Extensões → Apps Script. Cole `Code.gs`.
3. Configurações do projeto → Propriedades do script:
   - `NOTIFY_EMAIL` = e-mail da responsável
   - `SHEET_ID` = opcional se o script estiver vinculado à planilha
4. Implantar → Nova implantação → App da Web → Executar como **Eu**, acesso **Qualquer pessoa**. Autorize.
5. Copie a URL que termina em `/exec`.
6. Em `site-config.js`, preencha `leadEndpoint` com essa URL. Vale para todos os formulários (Home e Contato).

## Contrato

`POST` com corpo JSON (Content-Type `text/plain`, evita preflight CORS):

```
{ tipo, descricao, local, cidade, prazo, nome, whatsapp, email, empresa,
  pagina, origem, landing, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
  enviadoEm, tempoNoForm, site }
```

Resposta: `{ "ok": true }` ou `{ "ok": false, "erro": "validacao" | "limite" | "interno" }`.
O site só mostra "Recebemos sua demanda" quando recebe `ok: true`.

## Testar

- Abrir a URL `/exec` no navegador deve retornar `{"ok":true,"servico":"resolva-aqui-leads"}`.
- Enviar o formulário → nova linha na aba **Leads** + e-mail.
- Sem `leadEndpoint` configurado, o formulário mostra erro (não finge sucesso).

## Alternativas se a cliente preferir

- **Supabase**: tabela `leads` com RLS permitindo apenas `insert` via anon key + Edge Function para e-mail.
- **PHP na Hostinger**: endpoint `lead.php` gravando em MySQL e enviando por SMTP autenticado.
Trocar de backend exige apenas mudar `leadEndpoint`, desde que o retorno siga o contrato acima.

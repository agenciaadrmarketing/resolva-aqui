# Resolva Aqui — pacote do site

Abra `index.dc.html` num servidor local (ex.: `npx serve .` ou Live Server do VS Code). Com duplo clique (file://) os componentes não carregam.

## Antes de publicar
1. `site-config.js`: preencher `leadEndpoint` (URL do Google Apps Script), `whatsapp` (5591…) e `emailPublico`.
2. Backend de leads: `backend/google-apps-script/README.md`.
3. `deploy/`: trocar DOMINIO em robots.txt, sitemap.xml e .htaccess.
4. Imagens: validar licenças em `assets/CREDITOS-IMAGENS.csv`; baixar as fotos do Wikimedia Commons e servir localmente.
5. Os `.dc.html` são a versão de design/preview. Para produção, gerar HTML estático (DESIGN.md → Produção).

## Estrutura
- Páginas: index, servicos, area-de-atuacao, sobre, contato, politica-de-privacidade, 404
- Componentes: SiteHeader, SiteFooter, LeadForm, Timeline, ExitPopup
- Scripts: site-config.js, ra-motion.js (animações + responsividade), ra-metal.js (botões), ra-warp.js (cards), ra-tear-footer.js (rodapé), mapa-pa.js + mapa-pa-geo.js, support.js (runtime de preview)
- Documentação: DESIGN.md, SEO-PLANO.md, ENTREGA.md

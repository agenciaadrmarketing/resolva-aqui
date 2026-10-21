# Resolva Aqui — Plano de SEO em 3 fases

Uma estratégia, um domínio. A Home constrói a entidade; Serviços capturam intenção comercial; Área de atuação contextualiza o local; Conteúdos constroem autoridade. Toda URL precisa responder a uma necessidade real.

Território: **empresa que precisa resolver algo em Belém ou no Pará sem ter equipe local.**

## Status
- **Fase 1: implementada** (preview `.dc.html`), aguardando domínio e build.
- **Fase 2: planejada**, bloqueada pela confirmação da lista oficial de serviços. Por enquanto as frentes vivem como âncoras em `/servicos/#…`.
- **Fase 3: planejada**, depende de dados do Search Console e de conhecimento real da equipe.

---

## Fase 1: fundação

| URL | Arquivo de preview | Title | H1 | Intenção |
|---|---|---|---|---|
| `/` | index.dc.html | Resolva Aqui \| Apoio operacional e administrativo em Belém | Tem algo para resolver no Pará? Resolva Aqui. | Marca + apoio local B2B |
| `/servicos/` | servicos.dc.html | Serviços de apoio para empresas em Belém \| Resolva Aqui | Serviços de apoio operacional e administrativo em Belém | Comercial amplo, hub |
| `/area-de-atuacao/` | area-de-atuacao.dc.html | Apoio local para empresas em Belém e no Pará \| Resolva Aqui | Apoio local para empresas em Belém e no Pará | Local + "empresa de fora" |
| `/sobre/` | sobre.dc.html | Sobre a Resolva Aqui \| Apoio local para empresas em Belém | Sobre a Resolva Aqui | Entidade / confiança |
| `/contato/` | contato.dc.html | Contato \| Explique sua demanda à Resolva Aqui | Explique o que precisa ser resolvido | Conversão |
| `/politica-de-privacidade/` | politica-de-privacidade.dc.html | Política de privacidade \| Resolva Aqui | Política de privacidade | Confiança / LGPD |
| 404 | 404.dc.html | Página não encontrada \| Resolva Aqui (noindex) | — | Recuperação |

**Schema:** Home = Organization + WebSite + FAQPage (espelha o FAQ visível). Internas = BreadcrumbList. Sem LocalBusiness: não há endereço aberto ao público confirmado.
**Técnico:** title/description únicos, canonical por página, robots meta, OG/Twitter, favicon, manifest, `lang="pt-BR"`, breadcrumb visual + JSON-LD, `deploy/robots.txt`, `deploy/sitemap.xml`, `deploy/.htaccess` (HTTPS, barra final, 404, cache, slot para 301).
**Interlinking:** Home → Serviços, Área, Sobre, Contato (header, seções, footer). Serviços → Área, Sobre, Contato (+ `?tipo=` pré-selecionando o formulário). Área → âncoras de serviço + Contato. Sobre → Serviços, Área, Contato. Contato → as 4 frentes + Área. Footer em todas: páginas, frentes e privacidade.

**Na build de produção:** transformar canonical e `item` do BreadcrumbList em URLs absolutas; adicionar og:url, og:image (1200×630), twitter:image e `url`/`logo` no Organization e no WebSite.

---

## Grupos de intenção (clusters, sem volume assumido)

1. **Institucional:** Resolva Aqui, Resolva Aqui Belém, Resolva Aqui Pará, empresa de apoio em Belém → `/`, `/sobre/`
2. **Comercial:** apoio operacional em Belém, apoio administrativo em Belém, apoio local para empresas em Belém → `/`, `/servicos/`, `/area-de-atuacao/`
3. **Serviços:** busca de fornecedores, visita técnica, eventos, digitalização de documentos, busca de local, busca de profissionais → Fase 2
4. **Problema / long tail:** "preciso de alguém em Belém para acompanhar uma visita", "empresa de fora do Pará precisa de apoio em Belém" → `/area-de-atuacao/` agora, guias na Fase 3

Regra anti-canibalização: uma intenção, uma URL. A Home não aprofunda serviço; o hub não repete a Home; a página de serviço não repete o hub.

---

## Fase 2: páginas de serviço (publicar só o que a cliente confirmar)

Template: breadcrumb → hero → problema → quando contratar → o que pode ser feito → como funciona → atendimento em Belém/Pará → o que o cliente recebe → relacionados → FAQ própria → CTA própria. Mesmo design system, texto 100% próprio.

| URL | Intenção | Keyword principal | Secundárias | Title | H1 | Links internos | CTA |
|---|---|---|---|---|---|---|---|
| /servicos/apoio-operacional/ | Contratar presença local | apoio operacional em Belém | apoio presencial para empresas, alguém no local | Apoio operacional para empresas em Belém \| Resolva Aqui | Apoio operacional para empresas em Belém e no Pará | visitas-tecnicas, busca-de-fornecedores, area-de-atuacao, contato | Preciso de alguém no local |
| /servicos/visitas-tecnicas/ | Equipe de fora precisa de alguém na visita | acompanhamento de visita técnica em Belém | visita técnica Belém, acompanhar visita | Acompanhamento de visitas técnicas em Belém \| Resolva Aqui | Acompanhamento de visitas técnicas em Belém | apoio-operacional, busca-de-fornecedores, area-de-atuacao/belem, guia checklist, contato | Preciso de apoio nessa visita |
| /servicos/busca-de-fornecedores/ | Encontrar e comparar fornecedor local | busca de fornecedores em Belém | cotação local, fornecedor Belém | Busca de fornecedores em Belém \| Resolva Aqui | Busca de fornecedores em Belém para empresas | apoio-operacional, apoio-a-eventos, area-de-atuacao, contato | Solicitar busca de fornecedores |
| /servicos/apoio-a-eventos/ | Apoio operacional no evento | apoio para eventos em Belém | montagem, logística de evento Belém | Apoio operacional para eventos em Belém \| Resolva Aqui | Apoio operacional para eventos em Belém | busca-de-fornecedores, busca-de-locais, contato | Preciso de apoio no meu evento |
| /servicos/digitalizacao-de-documentos/ | Organizar e digitalizar acervo | digitalização de documentos em Belém | organização de documentos, arquivo físico | Digitalização e organização de documentos em Belém \| Resolva Aqui | Digitalização e organização de documentos em Belém | apoio-administrativo, contato | Solicitar análise do acervo |
| /servicos/apoio-administrativo/ | Tarefa administrativa pontual | apoio administrativo em Belém | serviços administrativos para empresas | Apoio administrativo para empresas em Belém \| Resolva Aqui | Apoio administrativo para empresas em Belém | digitalizacao-de-documentos, contato | Preciso de apoio administrativo |
| /servicos/busca-de-locais/ | Encontrar espaço/imóvel | busca de local em Belém | espaço para evento, imóvel comercial | Busca de locais e espaços em Belém \| Resolva Aqui | Busca de locais em Belém para empresas | apoio-a-eventos, visitas-tecnicas, contato | Solicitar busca de local |
| /servicos/busca-de-profissionais/ | Encontrar profissional com referência | busca de profissionais em Belém | profissional de confiança Belém | Busca de profissionais em Belém \| Resolva Aqui | Busca de profissionais em Belém | busca-de-fornecedores, contato | Solicitar busca de profissional |

Ao publicar cada página: Service schema (provider Organization, areaServed real), BreadcrumbList de 3 níveis, entrada no sitemap, link no hub, no footer e na Home (seção Serviços). As âncoras atuais `/servicos/#…` viram links para as páginas.

---

## Fase 3: autoridade local e conteúdo

- **/area-de-atuacao/belem/**: só com fotos reais, demandas comuns, logística e FAQ própria. Não é a Home com "Belém".
- **Outras cidades**: só com atendimento confirmado, demanda e conteúdo realmente diferentes. Proibido doorway.
- **/conteudos/** (hub). Clusters → página de serviço correspondente:
  - Apoio operacional: "O que informar antes de contratar apoio presencial em outra cidade"
  - Fornecedores: "Como organizar uma busca de fornecedores em Belém estando em outro estado"
  - Visitas: "Checklist para uma visita técnica acompanhada à distância"
  - Eventos: "O que verificar antes da montagem de um evento em Belém"
  - Documentos: "Como preparar um arquivo físico para digitalização"
  Base: o que a equipe realmente pede, vê e aprende. Schema Article com autor real.
- **Google Business Profile**: só se elegível como empresa de área de serviço. Nome real, categoria real, área de serviço real, sem endereço residencial público.
- **NAP** consistente: nome, telefone, site.

---

## Medição

`site-config.js` envia eventos para `dataLayer` (pronto para GTM/GA4, nenhum terceiro carregado ainda):
`cta_hero`, `cta_header`, `cta_menu`, `cta_barra_mobile`, `cta_servico`, `cta_*_final`, `demanda_escolhida`, `form_inicio`, `lead_enviado`, `lead_erro`, `whatsapp_click`, `email_click`.
Cada lead grava: página do envio, seção, página de entrada, referrer e UTMs (sessionStorage, só na sessão).

**Search Console** (após o domínio): verificar a propriedade de domínio, enviar o sitemap, inspecionar as 6 URLs. Acompanhar todo mês: impressões, cliques, CTR, posição, queries, páginas, indexação, Core Web Vitals e visibilidade em recursos de IA quando houver. Nova página só quando os dados mostrarem query, demanda ou problema.

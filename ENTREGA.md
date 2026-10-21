# Entrega — revisão Resolva Aqui

Arquivo principal: `index.dc.html` (o original segue intacto em `uploads/`).

## 1. Mantido
Arquitetura da home, hero com foto das Docas (`<picture>` AVIF/WebP, fetchpriority high, sem lazy), copy do hero, "Quando você precisa de alguém aqui" com contexto no hover e pré-preenchimento do formulário, processo 01–04 com rota GSAP, serviços em tabs/accordion, "Alguém no local, quando o local importa", mapa SVG local do Pará, prova de processo, situações ilustrativas, FAQ em accordion, paleta navy + laranja, General Sans, title/description/OG/Organization.

## 2. Alterado
- Wordmark: "i" real com o pin sobre o pingo (antes era "ı" sem ponto).
- Hero: scrim mais leve no desktop (a foto aparece), scrim vertical no mobile, legenda "Estação das Docas, Belém"; H1 entra por linhas (não por palavra) e nunca fica oculto aguardando a CDN.
- Formulário: 3 → 2 etapas (demanda + local juntos; contato), envio real via `fetch`, estados enviando/erro/sucesso, validação de nome/WhatsApp/e-mail junto ao campo, foco no primeiro erro, honeypot, `inputMode`/`autocomplete`.
- Copy B2B: removida a contradição "atendemos empresas sediadas no Pará" (Sobre e FAQ); nova pergunta "Minha empresa não é do Pará. Vocês atendem?".
- Situações: sem aspas e sem numeração, com aviso explícito "Não são relatos de clientes" (antes pareciam depoimentos).
- Prova de processo: 01/02/03 → Antes / Durante / No final.
- Sobre: o image-slot vazio virou uma ficha tipográfica (Atende / Formato / Contato / Entrega). A prop `fotoSobre` coloca a foto real quando ela existir.
- Footer: componente JSX (React + Babel no navegador) virou HTML nativo, mais leve, mantendo o wordmark grande cortado.
- Mapa: a animação só começa quando o mapa entra na tela (antes rodava fora da vista).
- Acessibilidade: tabs com role/aria-selected, FAQ com aria-controls/region, menu fecha com Esc e rótulo Abrir/Fechar, progressbar, `aria-current` nas etapas, headings h3 nos accordions.

## 3. Removido
- Iframe do Google Maps (não há endereço aberto ao público; era um terceiro pesado e redundante com o mapa do Pará).
- Eyebrows: Reconhece alguma?, Como funciona, Serviços, Área de atuação, O que você recebe, Exemplos, Sobre a Resolva Aqui, Dúvidas, Contato.
- Numeração decorativa (demandas, serviços, regiões, número gigante no painel, situações). Mantida só no processo.
- Reveal `.rv` em todas as seções e o IntersectionObserver dele; o `setInterval` de scroll; a faixa em caixa alta no rodapé do hero.
- `image-slot.js`, `beam-wordmark-footer.jsx` e o peso 700 da fonte.

## 4. Problemas técnicos encontrados
- O formulário não enviava nada (`enviado = true`). Corrigido.
- `gsap.from` no H1 podia deixar o título preso fora do lugar em remontagem ou com rAF pausado. Trocado por `fromTo` + `revert()` e uma rede de segurança.
- O footer obrigava o Babel Standalone a compilar JSX no navegador.
- Validação aceitava WhatsApp com 8 dígitos (sem DDD).
- O mapa animava fora da tela.

## 5. UI/UX
Menos ruído (labels e numeração), uma hierarquia de motion clara, formulário mais curto com estados reais, foto do hero mais presente, copy coerente com o público de fora do Pará.

## 6. SEO
twitter:title/description, robots meta, favicon SVG, theme-color, FAQPage JSON-LD (espelha o FAQ visível), H1 único e h2/h3 coerentes, `deploy/robots.txt` e `deploy/sitemap.xml`. Ficam pendentes de domínio: canonical, og:url, og:image, twitter:image, WebSite schema, url/logo/contato no Organization.

## 7. Performance
Sem iframe do Maps, sem Babel/JSX, sem image-slot, um peso de fonte a menos, sem observer de reveal nem polling de scroll. O LCP (foto do hero) não mudou: preload AVIF + fetchpriority. Medição de Lighthouse fica para a build de produção, porque o runtime de preview distorce os números.

## 8. Integração de leads
Pronta no frontend; **falta ativar**. Backend escolhido: Google Apps Script (`backend/google-apps-script/`), que grava na planilha e manda e-mail para a responsável. Não há segredo no frontend e há validação, honeypot e limite por número. Basta publicar o script e colar a URL em `leadEndpoint`. Sem essa URL o formulário mostra erro, não um sucesso falso.

## 9. Dependências
GSAP 3.13 + ScrollTrigger (CDN, só hero e processo), General Sans (Fontshare), mapa local. Lenis, Embla, Floating UI, MapLibre, Barba e D3 não entraram por falta de necessidade.

## 10. Pendências da cliente
- WhatsApp oficial (com DDI, ex. 5591…)
- E-mail público e e-mail que recebe os leads
- Confirmar Google Sheets + e-mail como forma de receber leads
- Domínio definitivo
- Redes sociais, se houver
- Foto real da responsável ou de uma atividade
- Dados empresariais que podem ser publicados (razão social/CNPJ, se desejado)
- Confirmar os serviços atuais, sobretudo passeios náuticos, guia com transporte e mobilização de contratos
- Confirmar as regiões atendidas: interior do Pará (quais polos), outros estados do Norte, remoto
- Confirmar que atendem empresas de fora do Pará (premissa da nova copy)

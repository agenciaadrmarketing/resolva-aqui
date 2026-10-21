# Resolva Aqui — DESIGN.md

Fonte de verdade para continuar o projeto em outras conversas. Leia antes de alterar `index.dc.html`.

## Marca
- Nome público: **Resolva Aqui**. O nome antigo (Somos Ajuda) não aparece em lugar nenhum.
- Posicionamento: apoio local + execução + organização + presença + resolução, para empresas (B2B). Não é turismo, marketplace nem "faz tudo".
- Wordmark: "Resolva" navy, "Aqui" laranja. O **i é a letra normal**; o pin de geolocalização é sobreposto exatamente sobre o pingo (cobre-o). Contorno do pin na cor do fundo. Peso 600. Em fundo escuro: "Resolva" #1F4A80, pin branco.
- Logo ilustrativa antiga (arara, açaí, barco): não usar no site. Regionalidade entra por fotografia, mapa, rotas e linguagem.

## Cores
| Token | Hex | Uso |
|---|---|---|
| navy | #0A2E5D | texto de títulos, seções escuras |
| navy-deep | #06203F | hero, footer, ficha Sobre |
| navy-2 | #2C4A73 | apoio |
| orange | #F57C00 | botões (texto navy), destaques em fundo escuro |
| orange-hover | #FF9433 | hover de botão |
| orange-display | #E06A00 | wordmark, setas em fundo claro |
| orange-ink | #B85500 | texto laranja em fundo claro (contraste AA) |
| paper / paper-2 / sky | #FFFFFF / #F7F6F2 / #EBF4F8 | fundos alternados |
| ink / ink-2 / ink-3 | #16212C / #3B4651 / #5B6570 | texto |
| line | #E2E0D9 | divisórias |

Botão = laranja com texto **navy** (não trocar por branco: contraste insuficiente).

## Tipografia
- General Sans (Fontshare), pesos 400/500/600. Produção: self-host WOFF2 só desses pesos, `font-display: swap`.
- H1 clamp(2.9rem, 7.4vw, 6.8rem), lh .95, tracking -0.055em. H2 clamp(2.5rem, 4.4vw, 3.8rem), lh 1, tracking -0.045em. Corpo 17.5px, lh 1.6.
- Caixa alta só em um lugar: a linha superior do hero ("Apoio local para empresas · Belém · Pará").

## Grid e espaço
- Container 1280px, gutter clamp(20px, 4vw, 48px), padding de seção clamp(80px, 10vw, 144px).
- Seções em duas colunas (5/7 ou 6/5) no desktop; empilham abaixo de 1000px. Breakpoints de comportamento: 780 (accordion de serviços, barra fixa de CTA), 820 (processo horizontal), 1080 (menu hambúrguer).

## Componentes
- Listas editoriais com divisórias finas, não cards. Exceção: card navy de destaque em Situações.
- Serviços: tabs (desktop) / accordion (mobile). 4 frentes fixas.
- FAQ: accordion, linha inteira clicável, `aria-controls`.
- Formulário: 2 etapas (demanda → contato), labels visíveis, erro junto ao campo, dados preservados em erro, sucesso só após `ok:true` do backend.
- Mapa do Pará: SVG local (`mapa-pa.js` + `mapa-pa-geo.js`, malha IBGE pré-gerada). Belém em laranja. Sem D3, sem tiles, sem Google Maps.

## Motion (hierarquia)
1. CSS: hover, foco, botões, setas (translateX 4px), accordion.
2. GSAP: só (a) entrada do H1 por linhas + leve zoom da foto do hero, (b) rota laranja do processo com scrub.
3. Mapa: animação CSS própria, iniciada ao entrar na tela.
4. Nada mais aparece com fade-up. Sem Lenis, sem SplitText por caractere.
- `prefers-reduced-motion: reduce` desliga tudo; nenhum conteúdo depende de animação. O H1 nunca é escondido esperando a CDN do GSAP.

## Imagem
- Hero: Estação das Docas, `<picture>` AVIF → WebP, `fetchpriority="high"`, sem lazy, width/height. Nunca voltar para PNG nem background CSS.
- Demais imagens: `loading="lazy" decoding="async"` + dimensões.
- Não inventar fotos institucionais. Sem foto real, a seção Sobre usa a ficha tipográfica (prop `fotoSobre` troca pela foto quando existir).

## Voz
- Clareza > criatividade. Frases curtas, verbo na frente, foco na necessidade do cliente ("Encontrar um fornecedor", não "Captação estratégica").
- Proibido: soluções 360°, excelência, parceiro estratégico, inovação, expertise.
- Exemplos são sempre marcados como ilustrativos. Sem depoimentos, números, clientes ou logos inventados.

## Regras anti-template
- Sem eyebrow acima de H2 que já se explica.
- Numeração só onde há sequência (processo 01–04).
- Sem pills decorativas, gradientes chamativos, cards repetidos, borda lateral colorida.
- Toda seção precisa justificar sua existência pela narrativa: necessidade → processo → serviços → onde → garantias → exemplos → quem → dúvidas → contato.

## Props configuráveis (index.dc.html)
`leadEndpoint`, `whatsapp` (com DDI: 5591…), `emailPublico`, `fotoSobre`, `fotoSobreAlt`, `heroVideo`.

## Produção (GitHub/Hostinger)
O `.dc.html` é a versão de design/preview (runtime React no navegador). Para produção:
- Exportar HTML estático (o footer já é HTML nativo; não há mais JSX/Babel).
- Interações (menu, tabs, accordion, FAQ, formulário) em JS vanilla ou build Vite/React pré-compilado. Sem Babel Standalone.
- GSAP + ScrollTrigger self-host ou `defer`; carregar só se usados.
- Preencher no `<head>`: canonical, og:url, og:image (1200×630 JPG), twitter:image, WebSite schema, url/logo/telephone/email no Organization.
- Copiar `deploy/robots.txt` e `deploy/sitemap.xml` com o domínio.
- Medir LCP/CLS/INP com Lighthouse/PageSpeed antes e depois.

# Reference — Craft micro-SaaS (vitrine + player)

Complemento de [`SKILL.md`](SKILL.md). Use ao polishar **vitrine** (`/estudar`) ou **player** (`AvantLessonPlayer`).  
Objetivo: área logada com disciplina de produto (Stripe/Linear/Vercel) **sem** apagar o diferencial cyber do reverso.

**Rule operacional:** [`.cursor/rules/avant-ui-visual.mdc`](../../../.cursor/rules/avant-ui-visual.mdc) (triggers + checklist §6) · cópia: [`docs/cursor/avant-ui-visual.mdc`](../../../docs/cursor/avant-ui-visual.mdc).

## Ordem de polish

1. Vitrine — cards + toolbar + estados  
2. Player — shell editorial (enunciado/alternativas/feedback)  
3. Handoff enunciado → NeuroSlides (cyber intacto)  
4. Depois: dashboard/analytics, landing (só tokens)

---

## Público TE — por que o craft não é só estética

O usuário do AVANT é **Técnico em Enfermagem estudando para concurso**, não um founder avaliando SaaS. Isso muda o que "craft" significa na prática (fontes: NursingCE redesign, healthcare UX guides, LPs de curso TE — ver pesquisa da sessão).

| Contexto real | Consequência de design |
|---------------|-------------------------|
| Estuda em **micro-sessões** (intervalo de plantão, 10–15 min) | Card fechado deve ser **escaneável em segundos**; nada de ler 3 métricas antes de agir |
| Acessa **majoritariamente no celular**, muitas vezes cansado | Alvos ≥44px sem exceção; carga cognitiva mínima; linguagem calma |
| Quer **retomar exatamente de onde parou** | "Continuar" / "Retomar estudo" é feature clínica, não CTA de marketing — sempre visível e óbvio |
| Decide **confiar** com base em cargo/banca/edital, não em estética premiada | Prova de progresso real > ilustração; identidade "para Técnico" > "app bonito genérico" |
| Cor de alerta em contexto de saúde = **urgência real** | Amber/danger só quando há ação de risco de fato — não decorar todo card com pendência |

**Tradução em regra:** o mesmo princípio "monocromático + 1 acento" que serve Stripe/Linear aqui existe para **reduzir carga cognitiva de alguém cansado no celular**, não para parecer "premium". Ao decidir entre um layout mais denso (informativo) e um mais limpo (menos decisão), **preferir limpo** — é assim que NursingCE/Florence (apps de CE para enfermeiros) resolveram queda de conclusão.

**Benchmark ampliado:** além de Gran/Estratégia/QConcursos (light genérico), o padrão de UX de produtos de CE para enfermeiros (NursingCE, Florence/APNA) valida: quick resume, progresso automático, filtro por tempo/pendência, mobile-first não-decorativo.

---

## Vitrine `/estudar`

### Arquivos

| Peça | Path |
|------|------|
| Orquestrador | `components/vitrine/VitrineClient.tsx` |
| Header | `VitrinePageHeader.tsx` |
| Toolbar / filtros | `VitrineToolbar.tsx`, `VitrineQuickFilters.tsx` |
| Card de assunto | `VitrineSubjectCard.tsx` |
| Continuar estudo | `VitrineResumeCard.tsx` |
| Progresso | `VitrineProgressRing.tsx` |
| Lista / sheet / paginação | `VitrineQuestaoList.tsx`, `VitrineSubjectSheet.tsx`, `VitrinePaginationBar.tsx` |
| Stats | `VitrineCatalogStatsStrip.tsx`, `VitrineCatalogStatsSkeleton.tsx` |
| Motion | `components/vitrine/vitrineMotion.ts` |

### Regras

| Regra | Critério |
|-------|----------|
| Hierarquia | Um H1 de página; toolbar sticky sem segundo título competindo |
| Densidade | Card: título + meta + progresso + **1** CTA (`Iniciar` / `Continuar` / `Revisar`) |
| Grid | `1` / `md:2` / `xl:3` colunas — nunca 4 se truncar título |
| Progresso | Sempre legível sem expandir (ring ou barra ≥4px) |
| Acento | Verde `--color-brand` `#8fe020` só em CTA/foco/ativo; slate no resto |
| Filtros | Chip ativo óbvio; hit target ≥44×44px |
| Stats | Compactos no topo; não empurrar o catálogo com KPI hero |
| Motion | Entrada leve nos cards; sem loop decorativo na lista |
| Ícone por assunto (público TE) | Cor por tópico (`getTopicAccent`) só no **expandido/sheet**; card **fechado** usa chip neutro slate — scan rápido sem rainbow |
| Meta do card fechado | **Uma linha**: `N questões · P%`; NeuroSlides e "para estudar" só no expandido |
| Cor de urgência | Amber/warning só em estado real de risco (ex. filtro Pendentes ativo); não em todo card com progresso parcial |
| CTA do card | ≥44px também no **desktop** — público acessa via mobile e desktop com a mesma expectativa de alvo |

### Estados obrigatórios

| Estado | Comportamento |
|--------|----------------|
| Loading | Skeleton (`VitrineCatalogStatsSkeleton` ou equivalente no grid) — não tela em branco |
| Empty catálogo | Mensagem clara + CTA de recuperação se existir |
| Zero filtro | “Nenhum assunto com este filtro” + limpar filtros |
| Prefetch | Respeitar `VITRINE_PREFETCH_DATA_ATTR` / hooks existentes — não inventar loading paralelo |

### Checklist ship — vitrine

- [ ] 1440 e 375: sem overflow horizontal; `pb-safe` / `pt-safe` ok  
- [ ] Contraste AA em título, meta e texto secundário  
- [ ] CTA do card: um só, label canônico, brand editorial  
- [ ] Progresso visível no card fechado  
- [ ] Toolbar + quick filters usáveis no polegar (mobile)  
- [ ] Skeleton / empty / zero-filtro cobertos  
- [ ] Sem terceira cor decorativa no grid  
- [ ] Sem card-dentro-de-card desnecessário  

---

## Player (enunciado + gabarito shell)

### Arquivos

| Peça | Path |
|------|------|
| Player | `components/lesson/AvantLessonPlayer.tsx` |
| Alternativas editorial | `.btn-option-editorial` (`app/globals.css`) |
| Feedback | `.card-success-editorial` / equivalents success-danger |
| Zoom leitura | `ReadableTextZoom*` |
| Reverso | `NeuroSlide`, zoom/swipe de estudo reverso |

### Regras — shell editorial

| Regra | Critério |
|-------|----------|
| Produto no centro | Enunciado + opções dominam; chrome (nav, zoom) secundário |
| CTA por passo | Um primário (ex. confirmar / continuar); secundário texto/ghost |
| Alternativas | Hover + `focus-visible` + selected + disabled claros |
| Feedback | Borda **e** fundo semântico success/danger — nunca só cor de texto |
| Tipografia | Hierarquia estável: instrução > opções > meta; não misturar 4 tamanhos |
| Motion | 200–300ms no feedback; respeitar `useReducedMotion` |

### Regras — handoff cyber

| Regra | Critério |
|-------|----------|
| Reverso | Fullscreen cyber (`#010409`); tokens editoriais **fora** dos slides |
| Contraste | Transição clara → escuro intencional (não “suavizar” o lab) |
| Moldes | Não forçar `template` / `layout_variant`; `meta.subtopico` + ramo L3 |
| Gesto | `logic_flow` novo com `reveal_mode: "tap"` |

### Checklist ship — player

- [ ] 1440 e 375: enunciado legível; alternativas ≥44px de toque  
- [ ] Focus ring visível no teclado  
- [ ] Feedback acerto/erro com fundo/borda  
- [ ] Um CTA primário por estado (`pergunta` / `gabarito` / entrada no estudo)  
- [ ] Reverso permanece cyber (cyan/neon, sem `#8fe020` nos slides)  
- [ ] Reduced motion não quebra fluxo  
- [ ] Sem overflow no mobile com zoom de leitura  

---

## Princípios traduzidos (Stripe / Linear / Vercel → AVANT)

| Princípio | Fazer | Evitar |
|-----------|-------|--------|
| Headline clara | Título de assunto / instrução sem adjetivo vazio | “Reimaginado”, badges decorativos em massa |
| Um acento | Verde editorial ou cyan cyber | Gradientes multi-cor no card |
| Prova no produto | Progresso real, status da questão, preview NeuroSlide | Ilustração stock |
| Microestados | hover / focus / disabled / skeleton | Só estado “default” |
| Whitespace | Respiro entre header, toolbar e grid | Empilhar 5 blocos acima do catálogo |
| Performance | Motion local; listas sem parallax | Animar cada card em loop |

---

## Anti-padrões craft (extras)

- Linearizar o AVANT inteiro (tirar cyber do reverso)  
- KPI hero na vitrine que empurra assuntos para baixo da dobra  
- Três botões iguais (`Iniciar` + `Ver` + `Detalhes`) no mesmo card  
- Feedback só com `text-green-600` / `text-red-600`  
- Skeleton genérico cinza sem respeitar `.card-elevated` / raio editorial  
- Glassmorphism na vitrine light  
- Copiar landing copy para labels de UI do app  

---

## Formato de resposta ao polishar

**[DECISÃO]** — superfície (vitrine|player) + princípio micro-SaaS aplicado + o que supera (Gran/QConcursos/Estudei).

**[CÓDIGO]** — arquivos em `components/vitrine/*` ou `AvantLessonPlayer` / `globals.css` apenas.

**[VERIFICAÇÃO]** — checklist desta página (marcar mentalmente os itens da superfície tocada).

---

## Dashboard / analytics (prioridade 3)

Após vitrine + player. Reutilizar tokens editoriais (`--color-brand`, `.card-elevated`, `.btn-editorial-*`); sem indigo/cyan na área logada. Nav ativa: `MenuNavIconChip` + `--color-nav-active-bar`. Checklist mínimo: um H1 por rota, cards com um CTA, estados empty/loading, `pb-safe` no mobile.

---

## Fora de escopo deste reference

| Tema | Onde |
|------|------|
| Moldes NeuroSlides / metáfora visual | `avant-neuroslides-visual` |
| Conteúdo JSON / golden | `avant-json-template` |
| Estrutura + copy + CRO da LP | [`docs/auditoria-visual-v2/LANDING-AVANT-v3.md`](../../auditoria-visual-v2/LANDING-AVANT-v3.md) |
| Ebook HTML offline | `ebook-enfermagem-premium` |

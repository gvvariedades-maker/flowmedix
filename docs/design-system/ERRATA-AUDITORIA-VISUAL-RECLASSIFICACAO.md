# Errata — Reclassificação de auditoria visual (decisão × defeito)

**Data:** 2026-08-11
**SHA de referência:** `f5ee914eacfd2de66553e87de45676314290b2d5`
**ADR:** [`../DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md`](../DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md)
**Matriz:** [`VISUAL-MIGRATION-v3-to-v4.md`](VISUAL-MIGRATION-v3-to-v4.md)

Esta errata **não apaga** relatórios ou capturas anteriores em `docs/auditoria-visual-v2/`. Ela reclassifica achados à luz do desfecho **A** (implementação confirmada no código).

## Reclassificação

| Achado | Classificação atual |
| ------ | ------------------- |
| Mudança da identidade de marca verde → laranja `#F26522` (app editorial) | **Decisão intencional** (PR #90 / #91) — anteriormente subdocumentada vs Direction v3 |
| NeuroSlides do player em pele clara (Opção B) em vez de Cyber fullscreen | **Decisão intencional** (código: `AvantLessonPlayer` + `slideSurface` + `toEditorialTheme`) — docs/skills atrasados eram o problema |
| Documentação/skills ordenando Cyber no reverso após a mudança de código | **Dívida documental** (corrigida pelo pacote v4 nesta branch) — não é regressão de produto |
| Captura de Progresso/desempenho exibindo login | **Defeito técnico real** (auth/rota) — **não** corrigido nesta tarefa |
| Possível flash preto antes da hidratação | **Risco técnico** a validar — **não** corrigido nesta tarefa; comentário obsoleto em `globals.css` permanece (runtime fora de escopo) |
| Assets verdes residuais de **marca** | **Pendência somente se ainda existirem** nos arquivos atuais — não presumir; favicon/PWA = `NAO_CONFIRMADO` na matriz até inventário |
| Verde `#16a34a` / `#00ff88` como success | **Canônico / legado semântico** — **não** é identidade de marca |

## Relatório original

Se um relatório de auditoria único com esses achados existir sob outro nome nesta árvore, preserve-o e linke esta errata. Se não for localizado como arquivo único, esta errata + ADR + matriz são a fonte da reclassificação.

## Fora de escopo desta tarefa

Redesign, restore Cyber/verde de marca, correção de Playwright auth, correção de flash, alteração de player/runtime, commit/PR.

## Evidência de PRs (revisão corretiva 2026-08-11)

| PR | Título | mergedAt | Merge commit | Natureza |
|----|--------|----------|--------------|----------|
| #90 | feat(ui): rebrand editorial verde → laranja #F26522 | 2026-08-09 | `2e0045d4` | **Rebrand** marca |
| #91 | feat(ui): AVANT preto, enf laranja e badge Pro brand | 2026-08-09 | `eb7fd73c` | **Lockup** / brand mark |
| #93 | feat(ui): editorial premium no dashboard e vitrine | 2026-08-10 | `bf1760f2` (head `7ad1ed65`) | **Editorial Premium** (hierarquia UI; não troca de hex) |
| #94 | feat(desempenho): hub analítico… | 2026-08-11 | `dda1d1d7` / `f5ee914e` | **Não** rebrand — desempenho/vitrine por acerto |

Divergência resolvida: não atribuir Editorial Premium ao #90/#91 nem ao #94; usar **#93** + SHA `7ad1ed65`.

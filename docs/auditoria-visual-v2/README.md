# Auditoria Visual AVANT v2

Benchmark de interfaces para definir um design system **editorial premium** — confiável, moderno e **exclusivo** — sem alterar lógica, fluxos ou funcionalidades do produto.

**Baseline atual:** Cyber Clinical v1 (`#010409`, cyan neon, glassmorphism). Rollback: tag Git `avant/cyber-clinical-v1` — ver [`docs/design-archive/cyber-clinical-v1/README.md`](../design-archive/cyber-clinical-v1/README.md).

**Escopo:** cores, tipografia, espaçamento, componentes, landing, dashboard, shell do player.  
**Fora do escopo:** APIs, cache, RLS, JSON de questões, Estudo Reverso, simulados (lógica).

---

## Como usar

1. Leia o [roster de plataformas](./ROSTER.md) e a ordem sugerida.
2. Para cada referência: duplique [`plataformas/_TEMPLATE-ficha.md`](./plataformas/_TEMPLATE-ficha.md) e preencha.
3. Salve screenshots em [`screenshots/`](./screenshots/) seguindo a convenção de nomes.
4. Registre notas 1–5 em [`scores/scorecard.csv`](./scores/scorecard.csv).
5. Ao concluir as 15 referências + AVANT baseline: preencha [`relatorio/RELATORIO-EXECUTIVO.md`](./relatorio/RELATORIO-EXECUTIVO.md).
6. Aprove tokens em [`tokens/AVANT-EDITORIAL-V2-DRAFT.md`](./tokens/AVANT-EDITORIAL-V2-DRAFT.md) antes de implementar em `app/globals.css`.

---

## Estrutura da pasta

```
auditoria-visual-v2/
├── README.md                 ← este arquivo
├── ROSTER.md                 ← lista de plataformas e ordem
├── CHECKLIST.md              ← critério de “auditoria pronta”
├── plataformas/
│   ├── _TEMPLATE-ficha.md
│   ├── B0-gabarita-enfermagem.md   ← pré-preenchida (LP)
│   ├── C1-estudei.md               ← stub com notas da LP
│   ├── D1-avant-baseline.md        ← stub AVANT atual
│   └── …
├── scores/
│   └── scorecard.csv
├── relatorio/
│   └── RELATORIO-EXECUTIVO.md      ← template a preencher
├── tokens/
│   └── AVANT-EDITORIAL-V2-DRAFT.md
└── screenshots/
    └── README.md                   ← convenção de arquivos
```

---

## As 8 telhas (+ extras AVANT)

| ID | Tela | Desktop | Mobile (375px) |
|----|------|---------|----------------|
| T1 | Landing / home | ✓ | ✓ |
| T2 | Login / cadastro | ✓ | ✓ |
| T3 | Vitrine / busca | ✓ | ✓ |
| T4 | Card de questão (lista) | ✓ | ✓ |
| T5 | Player de questão | ✓ | ✓ |
| T6 | Feedback pós-resposta | ✓ | ✓ |
| T7 | Dashboard / plano | ✓ | ✓ |
| T8 | Conta / configurações | ✓ | ✓ |
| T9 | NeuroSlides (4 tipos) | — | só AVANT |
| T10 | Simulado em andamento | — | só AVANT |
| T11 | Caderno (lista + detalhe) | — | só AVANT |

---

## Critérios (score 1–5)

| Código | Critério |
|--------|----------|
| L | Legibilidade |
| H | Hierarquia |
| D | Densidade |
| C | Confiança |
| M | Mobile |
| I | Identidade |
| A | Acessibilidade (contraste) |
| P | Performance visual (peso de blur/animação) |
| E | Emoção de compra (LP) |
| X | Exclusividade |

Peso sugerido na síntese: **L, H, D, C, M** (área logada 2×) · **E, I, C** (landing 2×).

---

## Ordem sugerida de execução

1. **D1** — AVANT atual (baseline)
2. **B0** — [Gabarita Enfermagem](https://gabaritaenfermagem.com.br/) (nicho + IA)
3. **C1** — [Estudei](https://estudei.com.br/) (LP referência)
4. **A1** — QConcursos (padrão mercado)
5. Demais entradas do roster

---

## Pós-auditoria (implementação visual)

| Fase | Alvo | Arquivos principais |
|------|------|---------------------|
| 1 | Tokens | `app/globals.css`, `tailwind.config.ts` |
| 2 | Shell + vitrine | `DashboardShell.tsx`, `VitrineClient.tsx` |
| 3 | Player + simulados | `AvantLessonPlayer.tsx`, simulados, cadernos |
| 4 | Aquisição | `LandingHome.tsx`, register, e-mails |
| 5 | Hardcodes | substituir `bg-[#010409]` por tokens semânticos |

Criar tag `avant/editorial-v2` antes do primeiro commit de rebrand.

---

## Primeira captura (2026-06-10)

- LPs **Gabarita**, **Estudei**, **QConcursos** — screenshots + branding Firecrawl
- Comparativo: [`COMPARATIVO-LP.md`](./COMPARATIVO-LP.md)
- JSON branding: [`branding/`](./branding/)

## Baseline AVANT D1 (2026-06-10) — concluído

- **26 PNG** em [`screenshots/avant-baseline/`](./screenshots/avant-baseline/)
- Script: `e2e/audit-visual-baseline.spec.ts` (Playwright + `E2E_DASHBOARD_BYPASS`)
- Ficha: [`plataformas/D1-avant-baseline.md`](./plataformas/D1-avant-baseline.md)
- **Exceções documentadas:** T4 (card) embutido em T3 vitrine; T10 runner omitido (seed E2E instável no dev) — capturado `/simulados/novo` como setup
- **Scorecard D1** preenchido em `scores/scorecard.csv` (T1 + T-app)

## Gabarita B0 — progresso app

- T2 login (`/auth`) capturado — `e2e/audit-visual-external.spec.ts`
- T3–T10 área logada: script pronto — definir `GABARITA_AUDIT_EMAIL` + `GABARITA_AUDIT_PASSWORD` em `.env.local` e rodar `-g "Gabarita.*logado"`
- Mapa funcional: `plataformas/B0-gabarita-funcional.md` + comparativo AVANT `B0-gabarita-comparativo-funcional.md`
- Player T5: `e2e/helpers/gabaritaAuditPlayer.ts` — `/practice` → Legislação Pública → questão
- Rotas reais: `/practice`, `/dashboard`, `/error-log`, `/mock-exam`, `/profile`, `/performance`, …

## Estudei C1 — pricing `#assineja` (2026-06-10)

- [estudei.com.br/#assineja](https://estudei.com.br/#assineja) — bloco plano anual + checklist inclusões
- Screenshots: `screenshots/estudei/T1-assineja-*.png`, `T1-app-preview-*.png` (mockups dashboard)

## QConcursos A1 — vitrine T3 (2026-06-10)

- Script: `e2e/audit-visual-external.spec.ts` + helpers `qconcursosAuditAuth.ts`, `qconcursosAuditVitrine.ts`
- **Público:** T2 login + T3 vitrine visitante (sem credenciais)
- **Logado:** `QCONCURSOS_AUDIT_EMAIL` + `QCONCURSOS_AUDIT_PASSWORD` em `.env.local`
- Saída: `screenshots/qconcursos/T3-vitrine-*.png`, `T5-player-*.png`, `map-*-desktop.png` (30+ rotas)
- Mapa: [`A1-qconcursos-funcional.md`](./plataformas/A1-qconcursos-funcional.md) · [`A1-qconcursos-player.md`](./plataformas/A1-qconcursos-player.md) · comparativo AVANT
- Ficha: [`plataformas/A1-qconcursos.md`](./plataformas/A1-qconcursos.md)

## ENFrente B4 (2026-06-10)

- [enfrenteenfermagem.com.br](https://enfrenteenfermagem.com.br/) — infoproduto (cursos + e-books), não app de questões
- T1 LP capturada — `screenshots/enfrente-enfermagem/`
- Ficha: [`plataformas/B4-enfrente.md`](./plataformas/B4-enfrente.md) — **contraste negativo** (evitar estética “oferta relâmpago”)

---

## Perguntas em aberto (decidir na síntese)

- [ ] Tema padrão: claro, escuro ou ambos (toggle)?
- [ ] Landing rebrand junto com app ou em fase separada?
- [ ] NeuroSlides: manter cores por subtópico ou unificar paleta editorial?

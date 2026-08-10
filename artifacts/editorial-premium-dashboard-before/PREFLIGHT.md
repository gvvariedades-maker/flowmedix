# Pré-voo — Editorial Premium Dashboard

Registrado em: 2026-08-10

## Git

| Campo | Valor |
|-------|--------|
| Branch | `ui/editorial-premium-dashboard` |
| HEAD | `85b267fe` (`feat(ui): AVANT preto, enf laranja e badge Pro brand`) |
| Worktree | `D:/AVANT` (mesmo worktree; WIP relacionado mantido) |
| Origem | criado a partir de `visual/lockup-avant-preto-enf-laranja` |

### Decisão de worktree

WIP local **relacionado** ao plano (vitrine, `PlanStatusCard`, `DashboardShell`, `globals.css`, score-card, etc.) — não foi aberto worktree limpo separado. Branch nova no lugar para não perder o delta "já pronto".

### Status ao criar a branch

~105 paths modificados/untracked no working tree (rebrand/editorial + artefatos). Sem commit neste pré-voo.

## Capturas before — CONCLUÍDAS

Diretório: `artifacts/editorial-premium-dashboard-before/`

Comando:
```bash
PLAYWRIGHT_SKIP_WEBSERVER=true npx playwright test e2e/capture-editorial-premium-before.spec.ts --project=chromium --workers=1
```
(dev local com `E2E_*_BYPASS=true` em `http://localhost:3000`)

| Arquivo | Rota | Viewport | Tamanho |
|---------|------|----------|---------|
| `estudar-enfermagem-390x844.png` | `/estudar?disciplina=enfermagem` | 390×844 | ~65 KB |
| `estudar-enfermagem-1366x768.png` | `/estudar?disciplina=enfermagem` | 1366×768 | ~115 KB |
| `progresso-390x844.png` | `/progresso` | 390×844 | ~89 KB |
| `progresso-1366x768.png` | `/progresso` | 1366×768 | ~40 KB |
| `desempenho-simulados-390x844.png` | `/desempenho/simulados` | 390×844 | ~62 KB |
| `desempenho-simulados-1366x768.png` | `/desempenho/simulados` | 1366×768 | ~99 KB |

Resultado Playwright: **6 passed**.

### Auth / dados

- Auth: `E2E_DASHBOARD_BYPASS` (convenção audit-visual / capture-t3).
- Vitrine: seed E2E com `disciplina=enfermagem` (título "Estudo Reverso E2E", cards Urgências E2E).
- `/desempenho/simulados`: shell editorial + KPIs em loading (`...`) sob bypass.
- `/progresso`: página **sem** stub E2E próprio — captura mostra shell/skeletons (desktop mais "vazio"/escuro). Baseline visual útil; conteúdo KPI real fica para validação after com sessão de aluno.

**Gate do plano** (dados reais em `/estudar?disciplina=enfermagem` sem bypass) permanece para evidências after.

## Spec

`e2e/capture-editorial-premium-before.spec.ts`

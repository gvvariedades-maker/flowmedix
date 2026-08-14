# Relatório final — Meu Desempenho (TEC adaptado) V1

Branch: `feat/desempenho-tec-adaptado-v1` · SHA das capturas: `f5ee914e` · Data: 2026-08-11

Spec: [`PROMPT_DESEMPENHO_TEC_ADAPTADO.md`](PROMPT_DESEMPENHO_TEC_ADAPTADO.md) · Contrato de métricas: [`DESEMPENHO_METRICAS.md`](DESEMPENHO_METRICAS.md)

> As capturas ficam em `artifacts/desempenho-v1/<sha>/` (pasta não versionada). Este relatório é a cópia versionada das 12 seções exigidas na §13 do mestre.

---

## 1. Veredito

**Concluído com bloqueios operacionais conhecidos** — todos fora do que o Agent pode fechar:

| Item | Estado |
|------|--------|
| Entregas 1–4 (dados, shell/Estudo, Simulados/Atividade, regressão) | Concluídas |
| Cadernos (seleção → wizard estrito) | Concluídas (V1.1) |
| Migration `historico_questoes.respondida` | **COMPROVADO NESTA AUDITORIA POR SELECT DE METADADOS** (projeto `ozgouenqrofnvgrlgfwd`) — coluna + RPC já em produção; **não** reaplicar |
| Smoke RLS com secrets reais | Não executado — SKIPPED ≠ PASS |
| Deploy / escrita remota / commit / PR | Não executados |

Nenhum gate obrigatório está em falha por causa desta entrega.

## 2. Baseline (delta honesto)

| Gate | Baseline (`artifacts/_gate-*.log`) | Agora |
|------|------------------------------------|-------|
| `check:ship` | 362 suítes / 3300 testes PASS | 378 suítes / 3424 testes PASS (3 skipped) |
| `build` | PASS | PASS |
| `e2e/desempenho.spec.ts` | 3 falhas (contrato antigo: tabs e labels) | 32/32 PASS (chromium + Mobile Chrome) |
| `e2e/simulados.spec.ts` | 2 falhas | Bloco de desempenho PASS; runner com flakiness de `next dev` (§8) |

Nenhuma falha preexistente foi "consertada para verde" fora do escopo.

## 3. Resultado observável

- Estudo abre em **amostra → estado → próxima ação → confiança**: filtros, placar, `Próximos focos`, `Panorama por áreas`, `Panorama por tipo de conteúdo`, evolução, questões recentes.
- Todo percentual vem com **fração** (`71% · 30/42`) e **nível de confiança**; abaixo de 5 questões não há tom conclusivo nem ranking.
- `Panorama por áreas` é hierarquia progressiva (área fechada → assuntos em um toque; "Ver mapa completo" abre tudo) — sem tabela de largura mínima.
- CTA principal curto e contextual: **"Testar em outra questão"**, com o nome do assunto fora do botão.
- Reset promete exatamente o que apaga: "Zerar desempenho de estudo", declarando que Simulados permanecem.
- Simulados: acerto **ponderado por questões**, tendência só com ≥ 4 pontos, comparação contra **Últimos 12 meses**.
- Atividade: datas em Brasília, células do heatmap informativas (não simulam botão), diálogo destrutivo acessível.
- UI sem jargão interno: nada de `upsert`, `ledger` ou `Evidence Engine`.

## 4. Arquivos alterados (delta desta entrega)

### Domínio e contratos

| Arquivo | Mudança |
|---------|---------|
| `lib/desempenho/confidence.ts` (novo) | escala 0 / 1–2 / 3–4 / 5–9 / 10+ com `canRank`, `canDiagnose`, `conclusiveTone` |
| `lib/desempenho/periodo.ts` (novo) | dia civil de Brasília e intervalo `[início, fim)`; `7d` = hoje + 6 |
| `lib/desempenho/filtersHref.ts` (novo) | URL como fonte de verdade dos filtros + contador de ativos |
| `lib/desempenho/types.ts` | `confidenceId`, `errosSemReverso`, `periodoResumo`, `loadState`, `truncated`; `DESEMPENHO_PERIODOS` client-safe |
| `lib/desempenho/studyPerformance.ts` | prioridade determinística dos focos, TZ Brasília, `loadState`, confiança propagada |
| `lib/desempenho/attemptSeries.ts` | ledger lê os mais recentes primeiro e reordena em memória; truncamento explícito |
| `lib/desempenho/taxonomiaEnfermagem.ts` | rótulo sem alegar incidência em prova |
| `lib/simulado/analyticsSummary.ts` | média e tempo **ponderados por questão**; piso de amostra 5 nos padrões de erro |
| `lib/simulado/types.ts` · `app/api/simulado/analytics/route.ts` | expõem `questoes_concluidas` / `acertos_concluidos` (amostra da média) |
| `app/api/zerar-desempenho/route.ts` | escopo declarado no payload (`cleared` / `preserved`); 500 não invalida cache |

### UI

| Arquivo | Mudança |
|---------|---------|
| `components/dashboard/desempenho/DesempenhoHubShell.tsx` (novo) | shell único das 3 rotas |
| `DesempenhoNav.tsx` (novo, substitui `DesempenhoTabs`) | `<nav>` + links + `aria-current="page"` |
| `AreaHierarchy.tsx` (novo, substitui `DomainMapTable`) | hierarquia progressiva sem `min-w` |
| `DesempenhoFiltros.tsx` (novo) | painel no desktop, disclosure com contador no mobile |
| `DesempenhoEstudoDashboard.tsx` · `NextPracticeCard.tsx` · `RiskRadar.tsx` · `AttemptEvolutionCard.tsx` · `RecentAttemptsList.tsx` · `formatDesempenho.ts` | ordem, CTA curto, confiança, microcopy honesta |
| `components/simulados/SimuladosAnalyticsDashboard.tsx` | filtros ponta a ponta, skeleton, erro com retry, tendência honesta, `Últimos 12 meses` |
| `components/dashboard/performance/zerar-desempenho-dialog.tsx` | foco preso, `Escape`, overlay, `prefers-reduced-motion` |
| `components/dashboard/performance/contribution-heatmap.tsx` | data de Brasília, célula informativa, `aria` corrigido |
| `app/(dashboard)/(authenticated)/desempenho/{page,simulados/page,atividade/page}.tsx` | shell compartilhado, `error ≠ empty`, seed E2E de atividade |

### Documentação e ferramentas

`docs/PROMPT_DESEMPENHO_TEC_ADAPTADO.md`, `docs/DESEMPENHO_METRICAS.md`, este relatório, `scripts/capture-desempenho-hub.ts`, `e2e/capture-desempenho-hub.spec.ts`, `package.json` (`capture:desempenho-hub`).

Nenhum arquivo de conteúdo pedagógico (handcraft, goldens, NeuroSlides) foi tocado.

## 5. Contratos de métricas

Formalizados em [`DESEMPENHO_METRICAS.md`](DESEMPENHO_METRICAS.md): fonte, unidade, fórmula, timezone, amostra mínima e limite por métrica.

| Regra | Onde vive |
|-------|-----------|
| Confiança por amostra (0 → 10+) | `lib/desempenho/confidence.ts` |
| Dia civil de Brasília + `[início, fim)` | `lib/desempenho/periodo.ts` |
| Focos: erro sem revisão → acerto baixo (amostra ok) → cobertura baixa | `lib/desempenho/studyPerformance.ts` |
| Acerto de simulado ponderado por questões | `lib/simulado/analyticsSummary.ts` |
| Reset = só `historico_questoes` | `app/api/zerar-desempenho/route.ts` |

## 6. Responsividade e acessibilidade

- `scrollWidth === clientWidth` do documento em 320 / 360 / 412 px em Estudo (com mapa completo aberto e filtros expandidos) e em 320 px em Simulados e Atividade.
- Navegação por links com `aria-current="page"`; sem `role="tablist"`.
- Expansão da hierarquia por teclado, anunciando `aria-expanded`.
- Diálogo destrutivo: `aria-modal`, foco inicial em "Cancelar", foco preso, `Escape` fecha, foco devolvido ao gatilho.
- Alvos de toque `min-h-11` (≥ 44 px) em filtros, CTAs e chips.
- Heatmap e diálogo respeitam `prefers-reduced-motion`.

## 7. Testes executados

| Gate | Resultado |
|------|-----------|
| `npm run check:ship` | PASS — 378 suítes, 3424 testes, 3 skipped |
| `npm run build` | PASS |
| `npx playwright test e2e/desempenho.spec.ts --project=chromium --project="Mobile Chrome"` | PASS — 32/32 |
| `npm run capture:desempenho-hub` | PASS — 7 capturas |
| `npx playwright test e2e/simulados.spec.ts` (bloco de desempenho) | PASS após alinhar o teste ao novo rótulo |

Testes novos: `confidence`, `periodo`, `filtersHref`, `zerar-desempenho` (API), `DesempenhoNav`, `DesempenhoFiltros`, `SimuladosAnalyticsDashboard`, `zerar-desempenho-dialog`, `contribution-heatmap`; ajustes em `studyPerformance`, `attemptSeries`, `simulado-analytics-summary` e nos dashboards de Estudo/Atividade.

## 8. Gates não executados ou instáveis

| Item | Estado | Motivo |
|------|--------|--------|
| Smoke RLS com secrets reais | **SKIPPED** | exige credenciais de produção (zona vermelha) |
| `e2e/simulados.spec.ts` — `runner retoma sessão em andamento` | **Flaky em `next dev`** | falhou por timeout de navegação / `ECONNREFUSED` e passou isolado na sequência; não toca código de desempenho |
| Perf baseline | Não executado | fora do escopo desta entrega |

## 9. Zona de risco

| Zona | O que houve |
|------|-------------|
| Verde | UI do hub no design system existente, helpers puros, testes |
| Amarela | `app/api/simulado/analytics` (campos novos de amostra) e `app/api/zerar-desempenho` (payload de escopo) — contratos aditivos, sem mudança de permissão |
| Vermelha | **Nada executado**: `lib/cache.ts`, RLS, service role, Stripe e migrations intocados |

## 10. Banco e produção

- Coluna `public.historico_questoes.respondida`: **COMPROVADO NESTA AUDITORIA POR SELECT DE METADADOS** (`boolean NOT NULL DEFAULT true`). Contagens agregadas na inspeção: 836 total · 836 `true` · 0 `false`. Nenhuma escrita.
- RPC `get_vitrine_page`: **COMPROVADO** — definição contém `FILTER (WHERE hq.respondida)`.
- Arquivo de migration permanece em `supabase/migrations/20260811120000_historico_questoes_respondida.sql` como histórico; **não** reaplique.
- Nenhuma escrita remota, deploy, commit ou PR nesta entrega de produto.
- O painel já trata `respondida` no agregador (`studyPerformance`); placeholders não entram no %.

## 11. Evidências

`artifacts/desempenho-v1/f5ee914e/` (390×844 e 1440×900, `fullPage`):

| Arquivo | Cena |
|---------|------|
| `estudo-mobile.png` · `estudo-desktop.png` | Estudo com dados |
| `estudo-amostra-insuficiente-mobile.png` | recorte de 7 dias (amostra baixa) |
| `simulados-mobile.png` · `simulados-desktop.png` | Simulados |
| `atividade-mobile.png` · `atividade-desktop.png` | Atividade |

Reproduzir: `npm run capture:desempenho-hub` (usa o SHA atual ou `DESEMPENHO_CAPTURE_SHA`).

## 12. V1.1 — Cadernos a partir do desempenho (entregue)

Fluxo: marcar assuntos na hierarquia → barra contextual → wizard em **modo estrito**.

| Peça | Papel |
|------|-------|
| [`AreaHierarchy.tsx`](../components/dashboard/desempenho/AreaHierarchy.tsx) | checkbox por assunto; teto de 6 assuntos bloqueia o 7º em vez de truncar depois |
| [`DesempenhoSelecaoBar.tsx`](../components/dashboard/desempenho/DesempenhoSelecaoBar.tsx) | barra acima da bottom nav: contagem, "Limpar", "Criar caderno" (alvos ≥ 44 px) |
| [`lib/cadernos/desempenhoSelecao.ts`](../lib/cadernos/desempenhoSelecao.ts) | ponte em `sessionStorage` (só títulos; contagem resolvida no wizard) |
| [`lib/cadernos/templates.ts`](../lib/cadernos/templates.ts) | `QuickAddPreset.origem` / `.strict` + `buildDesempenhoPreset`; `pickWizardBatchModulos` filtra o pool pela seleção |
| [`cadernos/novo/page.tsx`](<../app/(dashboard)/(authenticated)/cadernos/novo/page.tsx>) · [`NovoCadernoClient.tsx`](../components/dashboard/cadernos/NovoCadernoClient.tsx) | `?origem=desempenho` consome a seleção, mostra o lote real e limpa o storage após criar |

Honestidade do modo estrito:

- O lote **nunca** é completado com assunto fora da seleção — inclusive quando a banca do edital não casa (melhor lote vazio que caderno errado).
- Seleção perdida (aba nova / storage limpo) → alerta "Não encontramos os assuntos selecionados" + link de volta; CTA desabilitado.
- Assunto sem questão liberada → "Nenhuma questão liberada nesses assuntos"; CTA desabilitado, sem chamada à API.

Gates da V1.1: `npm run check:ship` PASS (381 suítes, 3442 testes, 3 skipped — delta de +3 suítes e +18 testes vs. V1) · `e2e/desempenho.spec.ts` chromium + Mobile Chrome PASS, incluindo a barra em 390 px e overflow 320–412. Testes novos: `desempenhoSelecao`, `AreaHierarchy.selecao`, `NovoCadernoClient.desempenho`, mais casos de modo estrito em `templates`. Firefox/WebKit continuam falhando por browser não instalado no ambiente (baseline, não regressão).

## 13. Pendências

1. **Humano / zona vermelha:** smoke RLS com secrets reais + deploy — [`DESEMPENHO_V1_OPS_HANDOFF.md`](DESEMPENHO_V1_OPS_HANDOFF.md). A coluna `respondida` e a RPC **já estão** em produção (SELECT de metadados); não reaplique a migration.
2. **Estabilidade de E2E:** o runner de simulado é flaky em `next dev`; avaliar rodar essa suíte contra build de produção no CI.
3. **Commit / PR:** não criados — aguardando pedido explícito.
4. **Cobertura E2E do wizard estrito:** `/cadernos/novo` não tem bypass de E2E (redireciona ao login); coberto por teste de componente (inclui defesa em profundidade no handler).
5. **Integridade por título:** o modo estrito usa `titulo_aula` (mesma chave da vitrine). Sem ID estável separado — risco residual de homônimo/renome; não alegar integridade forte.

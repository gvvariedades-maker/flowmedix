# Checklist de rollout — Evidence Engine Fase 1

> Checklist operacional item-a-item para times de plantão/ops durante o rollout da Fase 1 (Lotes 1–10). Limiares numéricos e regra de go/no-go completa: [`artifacts/evidence-fase1-operational-plan.md`](../artifacts/evidence-fase1-operational-plan.md). Spec: [`SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md`](SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md). ADR: [`DECISAO_EVIDENCE_ENGINE.md`](DECISAO_EVIDENCE_ENGINE.md) §27.

## Antes de ligar `EE_V1_INSTRUMENTATION=true` em qualquer ambiente

- [ ] `npx jest --testPathPattern=lib/evidence --no-coverage` verde
- [ ] Migração da tabela `evidence_attempt_events` aplicada no ambiente (ver `supabase/migrations/`)
- [ ] `EE_V1_INTERNAL_EMAILS` configurado com a allowlist correta do ambiente (equipe interna)
- [ ] `npm run reconcile:evidence-events -- --dry-run` executa sem erro contra o ambiente (mesmo com stream vazio)
- [ ] Bloco "Status de aprovação" do plano operacional revisado (não precisa estar aprovado ainda para a Etapa 0/1 — mas precisa existir e ser conhecido pelo time)

## Etapa 1 — Coorte interna (ligado)

- [ ] `EE_V1_INSTRUMENTATION=true` no ambiente
- [ ] Confirmar no navegador/app que `GET /api/aluno/evidence-cohort` retorna `{ instrumentation: true, conviction_ui: true }` para um e-mail da allowlist
- [ ] Confirmar que `conviction_ui: false` para um e-mail fora da allowlist (mesmo com `instrumentation: true`)
- [ ] Registrar data de início da janela de observação (usada para os limiares em `artifacts/evidence-fase1-operational-plan.md` §1)
- [ ] Rodar `npm run reconcile:evidence-events -- --dry-run` diariamente durante a janela; guardar os relatórios JSON gerados em `artifacts/`
- [ ] Ao fim da janela (7–14 dias): comparar métricas medidas com os limiares propostos em `artifacts/evidence-fase1-operational-plan.md` §2
- [ ] Se algum limiar **P0** (seção 2 do plano) foi violado: seguir rollback imediato (`EE_V1_INSTRUMENTATION=false`) e investigar antes de religar
- [ ] Se limiares OK: preencher/atualizar o bloco "Status de aprovação" do plano operacional com aprovador + data + link do baseline

## Etapa 2 — Usuários de teste

- [ ] Decisão registrada: UI de convicção mantém restrita à Etapa 1, ou expande para Etapa 2 (documentar no changelog do plano operacional)
- [ ] Repetir a mesma janela de observação e comparação de limiares da Etapa 1, medindo separadamente
- [ ] Confirmar que eventos desta etapa têm `is_internal` correto conforme decisão tomada

## Etapa 3 — Coorte técnica ampliada

- [ ] Confirmar que a coorte desta etapa está **fora** do sampling frame do RCT-1 (ADR §18)
- [ ] Limiares da seção 2 do plano operacional estáveis por 2 janelas consecutivas
- [ ] Aprovação humana registrada nesta etapa no plano operacional

## Rotina de reconciliação (todas as etapas)

- [ ] `npm run reconcile:evidence-events -- --dry-run` roda sem exceções
- [ ] Nenhum `outcome_mismatch` (P1) sem investigação aberta — nunca corrigir o evento canônico existente silenciosamente
- [ ] `unresolved_after_job` dentro do limiar; casos com mais de 48h investigados individualmente
- [ ] Backfill (`--apply`) só executado após revisão humana do relatório `--dry-run` correspondente

## Encerrando a Fase 1 (transição para Fase 2)

- [ ] Todos os itens do checklist de go/no-go em `artifacts/evidence-fase1-operational-plan.md` §6 marcados
- [ ] `docs/EVIDENCE_OPS_METRICS.md` revisado — métricas em produção correspondem ao documentado
- [ ] Nenhuma pendência P0 aberta relacionada ao Evidence Engine
- [ ] Decisão de avançar para Fase 2 registrada por humano responsável (mesma governança do plano operacional)

## Rollback rápido (qualquer etapa, a qualquer momento)

1. Definir `EE_V1_INSTRUMENTATION=false` no ambiente afetado.
2. Confirmar que o player/simulado voltam ao fluxo de confirmação legado (sem `ConvictionSelector`, sem chamada a `/api/aluno/evidence-cohort` bloqueando o fluxo).
3. **Não** apagar eventos já persistidos em `evidence_attempt_events` (append-only).
4. Registrar o motivo do rollback no changelog de `artifacts/evidence-fase1-operational-plan.md`.
5. Reabrir a Etapa correspondente somente após causa raiz corrigida e validada em ambiente de teste.

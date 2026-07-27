# Evidence Engine — Fase 5: FSRS + RCT-2 (gated)

**Status:** foundation code, **hard-gated**. Nenhuma função de atualização FSRS executa sem `rct1UpliftConfirmed === true` explícito. Nenhum agendador FSRS está em produção.

Complementa: [`DECISAO_EVIDENCE_ENGINE.md`](DECISAO_EVIDENCE_ENGINE.md) §12–§13, §25 (Fase 5), §27, §29 · [`EVIDENCE_FASE4_RCT1.md`](EVIDENCE_FASE4_RCT1.md).

---

## 1. Pré-condição inegociável

> "Uplift positivo na Fase 4 autoriza testar o FSRS; não comprova que ele supera os intervalos fixos." (ADR §25)

Toda função de atualização de estado FSRS em `lib/evidence/fsrsSkill.ts` e toda métrica de retenção em `lib/evidence/rct2.ts` recebe `rct1UpliftConfirmed: boolean` e **lança** `EvidenceEngineGateError` se o valor não for `true`. Não há modo silencioso (no-op) — preferimos falha explícita a mascarar wiring indevido antes do go/no-go do RCT-1.

## 2. T1 nunca atualiza FSRS (§13)

`updateFsrsSkillState()` só aceita `context: 'scheduled_review'` e exige `reviewed_before_explanation: true`. Qualquer outro contexto (incluindo `immediate_transfer` / T1) é rejeitado com erro explícito. Isso implementa o invariante:

> "Transferência imediata (T1) atualiza aquisição/nível T1; não atualiza retenção FSRS como revisão futura." (ADR §6, §13)

## 3. RCT-2 — desenho (§25)

| Braço | Agendamento |
|---|---|
| `control_fixed_intervals` | Evidence Engine V1 + intervalos fixos conservadores |
| `treatment_fsrs` | Evidence Engine V1 + FSRS por `user_id × skill_id` |

Invariantes implementados/documentados em `lib/evidence/rct2.ts`:

- Novo `experiment_id` — `assignRct2Arm()` nunca reaproveita o `arm_assignment_id` do RCT-1 (chama `computeArmAssignmentId()` de `rct1.ts` com o `experiment_id` do RCT-2).
- Randomização novamente por usuário.
- Ambos os braços recebem a mesma experiência de convicção e T1 — `resolveSchedulingPolicy()` só decide o agendador, nunca a UI.
- Métricas comparam retenção/eficiência, **nunca** engajamento (cliques, tempo no app, conclusão de slides) — `computeRetentionPerMinuteStudiedStub()` e `computeReviewsPerConsolidatedSkillStub()` são stubs aritméticos simples, gated, com cálculo final na spec operacional.

## 4. Pergunta científica (§25)

> O FSRS por competência aumenta a retenção inédita por minuto estudado quando comparado aos intervalos fixos do Evidence Engine V1?

## 5. Proibições explícitas desta fase

- Não remover o parâmetro `rct1UpliftConfirmed` de nenhuma função nova adicionada a este módulo.
- Não implementar FSRS "real" (biblioteca + hiperparâmetros) sem revisão humana — decisão adiada (ADR §29).
- Não usar T1 como evidência de retenção em nenhuma métrica do RCT-2.
- Não comparar engajamento como métrica de decisão do RCT-2.

## 6. Testes

`__tests__/lib/evidence/fsrsSkill.test.ts` — gate lança sem `rct1UpliftConfirmed`; contexto/timing inválido é rejeitado mesmo com gate satisfeito; update válido é determinístico.

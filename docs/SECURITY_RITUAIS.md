# Rituais contínuos de segurança — AVANT

> **Hub:** [`SECURITY_ENG_AVANT.md`](SECURITY_ENG_AVANT.md) · Barra: [`SECURITY_SCORECARD.md`](SECURITY_SCORECARD.md) (#13 pentest) · Threat: [`SECURITY_THREAT_MODEL.md`](SECURITY_THREAT_MODEL.md) · IR: [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md)  
> Escopo: app eng (auth / RLS / Stripe / admin). **Não** handcraft / PNSP.

Cadência do programa de segurança fortificada (Fase 5). Manutenção Supabase (max-rows, advisors, crons) continua em [`SUPABASE_MAINTENANCE.md`](SUPABASE_MAINTENANCE.md) — este doc cobre **só** o trilho segurança além do gate.

---

## Cadência

| Ritmo | O quê | Evidência |
|-------|--------|-----------|
| **Mensal** | 1 domínio de [`ENG_AUDITORIA_POR_RISCO.md`](ENG_AUDITORIA_POR_RISCO.md) §2 **+** `npm run smoke:rls` remoto | Tabela [Log mensal](#log-mensal) abaixo |
| **Trimestral** | Revisar STRIDE dos **4 fluxos** em [`SECURITY_THREAT_MODEL.md`](SECURITY_THREAT_MODEL.md) | Tabela [Log trimestral](#log-trimestral) + diff no threat se gap novo |
| **Sob demanda / ≥1× ciclo** | [Pentest focado](#pentest-focado) (1–2 dias) | Issues P0/P1 remedadas → scorecard **#13 PASS** |

Rodar junto com o mensal/trimestral de Supabase quando fizer sentido (mesmo dia), sem fundir checklists.

---

## Mensal — domínio + smoke RLS

**Regra:** um domínio por mês (não “repo inteiro”). Rotacionar:

| Mês (ciclo) | Domínio | Arquivos âncora |
|-------------|---------|-----------------|
| 1 | Auth / sessão | `proxy.ts`, `lib/supabase/server-auth.ts` |
| 2 | Cache / catálogo | `lib/cache.ts` |
| 3 | RLS / secrets | policies + `lib/env.ts` + inventário |
| 4 | Stripe / webhooks | `app/api/pagamentos/**`, `lib/stripe/**` |
| 5 | Player / vitrine (amostra) | player + rotas aluno |
| 6+ | Repetir ciclo 1→5 | — |

**Passos (≤2 h):**

1. Checklist humano do domínio em [`ENG_AUDITORIA_POR_RISCO.md`](ENG_AUDITORIA_POR_RISCO.md) §2 — marcar ✅ / ⚠️ / ❌.
2. Smoke RLS remoto (staging ou prod de leitura):

```bash
npm run validate:env
npm run smoke:rls
```

   Opcional: SQL companion [`supabase/scripts/rls_performance_smoke.sql`](../supabase/scripts/rls_performance_smoke.sql). CI com secrets `SMOKE_*` não substitui olhada humana pós-migration.
3. Achados → issue GitHub (severidade P0/P1/P2 alinhada ao [IR](SECURITY_INCIDENT_RUNBOOK.md)).
4. Anti-padrão **2×** → gate em `scripts/check-architecture-patterns.ts` ([`ENG_CONVERSA.md`](ENG_CONVERSA.md) § Loop).
5. Preencher [Log mensal](#log-mensal).

---

## Trimestral — threat model

1. Reabrir [`SECURITY_THREAT_MODEL.md`](SECURITY_THREAT_MODEL.md) (login, admin, checkout, webhooks).
2. Para cada fluxo: controles ainda válidos? Gaps residuais viraram PASS no scorecard ou issues abertas?
3. Atualizar coluna “Gap residual” se algo mudou (código, ops, pentest).
4. Opcional no mesmo trimestre: paper drill do [IR](SECURITY_INCIDENT_RUNBOOK.md) se #12 ainda aberto ou >6 meses desde o último.
5. Preencher [Log trimestral](#log-trimestral).

---

## Pentest focado

**Objetivo:** 1–2 dias (externo ou eng dedicado) — **não** SOC2 / WAF / varredura genérica.

### Escopo (só isto)

| Superfície | O que testar |
|------------|--------------|
| Auth / sessão | Bypass de cookie/JWT; refresh race; acesso a rota protegida sem sessão |
| Admin | JWT de aluno em `/api/admin/**` → 403; elevação via flag client |
| Stripe | Checkout price tampering; webhook sem assinatura / replay de `event.id`; fulfill sem pagamento |
| RLS leak | Anon/aluno A lê linhas de aluno B (`historico_questoes`, matrículas); service role só server |

**Fora de escopo neste ritual:** fuzzing de UI, conteúdo pedagógico, infra física, supply chain npm (já no scorecard #9 / Dependabot).

### Saída obrigatória

1. Issues no GitHub com label `security` + severidade P0/P1/P2.
2. Remediação: P0/P1 **fechados** (ou aceitos com mitigação documentada no scorecard).
3. Reincidência 2× → novo gate (`check-architecture-patterns.ts`) + linha no changelog de [`ENG_CONVERSA.md`](ENG_CONVERSA.md).
4. Marcar scorecard **#13 PASS** com data + link do relatório / issues.

### Critério #13 PASS

| Critério | Sim/não |
|----------|---------|
| Pentest no escopo acima executado (data no log) | |
| Zero P0/P1 abertos **ou** cada um com mitigação + issue linkada | |
| P2 agenda ou aceito explícito | |

Sem evidência → **#13 FAIL** (gap ops; não falha `npm run build`).

---

## Log mensal

| Data | Domínio | Smoke RLS | Achados (issue / nota) | Feito por |
|------|---------|-----------|------------------------|-----------|
| _YYYY-MM-DD_ | _auth / cache / …_ | ☐ ok / ☐ falha | | |

## Log trimestral

| Data | Threat revisado | Gaps novos / fechados | Paper drill? | Feito por |
|------|-----------------|------------------------|--------------|-----------|
| _YYYY-MM-DD_ | ☐ 4 fluxos | | ☐ sim / ☐ n/a | |

## Log pentest (scorecard #13)

| Data | Executor | Relatório / issues | P0/P1 abertos? | #13 |
|------|----------|--------------------|----------------|-----|
| _YYYY-MM-DD_ | _interno / vendor_ | _URL_ | ☐ 0 / ☐ lista | ☐ PASS |

---

## Links

| Doc | Uso |
|-----|-----|
| [`ENG_AUDITORIA_POR_RISCO.md`](ENG_AUDITORIA_POR_RISCO.md) | Checklist por domínio (mensal) |
| [`SECURITY_THREAT_MODEL.md`](SECURITY_THREAT_MODEL.md) | STRIDE 4 fluxos (trimestral) |
| [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md) | Contém / rotaciona / drill |
| [`SUPABASE_MAINTENANCE.md`](SUPABASE_MAINTENANCE.md) | Mensal/trimestral infra Supabase (paralelo) |
| [`DEPLOY.md`](DEPLOY.md) | Secrets `SMOKE_*`, ops prod |

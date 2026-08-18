# Auditoria pré-commit — Meu Desempenho TEC adaptado (V1 + V1.1)

Data: 2026-08-12 · Branch: `feat/desempenho-tec-adaptado-v1`  
Prompt: [`PROMPT_DESEMPENHO_AUDITORIA_PRE_COMMIT.md`](PROMPT_DESEMPENHO_AUDITORIA_PRE_COMMIT.md)

---

## 1. Veredito

**`APROVADO_PARA_COMMIT_E_PR — NÃO APROVADO PARA DEPLOY`**

O delta de desempenho (E1–E4 + V1.1) está coerente, com P0/P1 do escopo fechados na Fase B, gates locais verdes e evidências rastreadas ao digest do WIP. Deploy continua proibido: smoke RLS não executado (SKIPPED ≠ PASS).

Autorização restante: humano pode **commit + PR**; **não** deploy até `npm run smoke:rls` PASS em ambiente seguro.

---

## 2. Contexto Git comprovado

| Campo | Valor |
|-------|--------|
| Repositório | `D:/AVANT` |
| Worktree | principal |
| Branch | `feat/desempenho-tec-adaptado-v1` |
| Base ref (delta desta feature) | `HEAD` (working tree vs tip) |
| Base SHA / HEAD SHA | `f5ee914eacfd2de66553e87de45676314290b2d5` |
| Dirty | **true** — todo o delta TEC ainda uncommitted |
| Digest do delta | `2327d348` → pasta `precommit-f5ee914e-2327d348` |
| `origin/main` | tip à frente; merge-base com HEAD = este SHA |

---

## 3. Escopo real

- **~36** paths modificados/apagados vs HEAD + **~20** untracked de código/docs/testes do hub (mais artefatos).
- Escopo justificado: domínio desempenho, UI hub, Cadernos V1.1, APIs zerar/analytics, testes, docs, capture tooling.
- **FORA_DO_ESCOPO (não commitar):** `artifacts/_gate-*.log`, `_migration_*`, `_prompt-mestre-*`, `artifacts/fase5-build.log`.
- Marca: `MARCA_EDITORIAL_LARANJA_CANONICA` — tokens `--color-brand*`; verde só success.

---

## 4. Achados

| ID | Sev | Evidência | Correção/decisão | Estado |
|----|-----|-----------|------------------|--------|
| A1 | P1 | Docs diziam migration não comprovada; SELECT prova coluna+RPC | Relatório + ops reconciliados | **CORRIGIDO** |
| A2 | P1 | Handler sem early-return em `selecaoPerdida` / loading | Guards no handler + CTA; testes com clique forçado | **CORRIGIDO** |
| A3 | P1 | Capturas sem digest do dirty tree | `precommit-f5ee914e-2327d348/` + 7 PNGs + manifest | **CORRIGIDO** |
| A4 | P2 | Identidade estrita por `titulo_aula` | Sem ID estável sem arquitetura; risco residual explícito | Aberto (dívida) |
| A5 | Obs | Artefatos `_gate-*` untracked | Não incluir no commit | Hygiene |
| A6 | Obs | E2E wizard sem auth bypass | Jest cobre API-zero; `E2E_WIZARD_BLOQUEADO_POR_AUTENTICACAO` | Aceito |
| A7 | Obs | Env `E2E_DASHBOARD_BYPASS` após capture quebrou `vitrine` no ship | Limpar env antes de `check:ship` | Documentado |

Nenhum P0 aberto no delta.

---

## 5. Auditoria das métricas

| Área | Resultado |
|------|-----------|
| Confiança | Contrato único; testes 0,1,2,3,4,5,9,10; &lt;5 sem rank/tom |
| Período/TZ | Brasília + `[start, endExclusive)`; `7d` = 7 datas civis |
| Placar/focos | Dedup por slug; `respondida !== false`; ordem erro→acerto→cobertura |
| Simulados | Médias ponderadas; tendência ≥4; “Últimos 12 meses” |
| Atividade | Heatmap Brasília; células informativas; reset honesto |
| Truncamento | Ledger recent-first + flag explícita |

---

## 6. V1.1 Cadernos

| Item | Estado |
|------|--------|
| Identidade | `titulo_aula` (mesma chave da vitrine) |
| Risco homônimo | Residual (A4) — não alegar integridade forte |
| Modo estrito | `pickWizardBatchModulos` filtra pool antes do fill |
| Bloqueios | seleção perdida / sem questões / loading |
| API zero nos bloqueios | Handler + testes com CTA forçado |
| Limpeza storage | Só após `items` OK |
| E2E wizard | Bloqueado por auth — Jest suficiente para commit |

---

## 7. Segurança, banco e RLS

**SELECT (2026-08-12), projeto `ozgouenqrofnvgrlgfwd`, nenhuma escrita:**

- `respondida`: `boolean NOT NULL DEFAULT true`
- Agregados: 836 / 836 true / 0 false
- `get_vitrine_page`: `rpc_atualizada = true`

**Reset:** bearer + `user.id`; só `historico_questoes`; payload `cleared`/`preserved`.

**Smoke RLS:** **SKIPPED** — não executado (script atinge projeto do `.env` com anon/service role). ≠ PASS.

---

## 8. Design system e UX

- Autoridade: `PROMPT_DESEMPENHO_TEC_ADAPTADO.md`, `CLAUDE.md` §3, `DESIGNER_FRONT_AVANT.md`
- Conclusão: **`MARCA_EDITORIAL_LARANJA_CANONICA`**
- Overflow: E2E 320/360/412 PASS
- A11y: nav `aria-current`, dialog modal, alvos ≥44px, reduced-motion
- Evidências: `artifacts/desempenho-v1/precommit-f5ee914e-2327d348/` (+ `manifest.json`)

---

## 9. Alterações desta auditoria (Fase B)

| Arquivo | Mudança | Teste |
|---------|---------|-------|
| `NovoCadernoClient.tsx` | Guards loading/`selecaoPerdida` no handler + disabled | `NovoCadernoClient.desempenho.test.tsx` |
| Idem test | Clique forçado com `disabled` removido | API não chamada |
| `DESEMPENHO_TEC_ADAPTADO_V1_RELATORIO.md` | respondida COMPROVADO | — |
| `DESEMPENHO_V1_OPS_HANDOFF.md` | Não reaplicar; smoke/deploy | — |
| `artifacts/.../precommit-*/` | Manifest + 7 capturas | Playwright capture |

---

## 10. Gates executados

| Comando | Resultado | Observação |
|---------|-----------|------------|
| Jest escopo desempenho/cadernos | PASS 147 | Inclui A2 |
| `typecheck` | PASS | Limpar `.next/types` se webServer Playwright corromper |
| `lint` | PASS | |
| `check:architecture` | PASS | |
| `check:ship` | PASS 381 / 3442 / 3 skipped | Limpar `E2E_DASHBOARD_BYPASS` do shell antes |
| Playwright `e2e/desempenho.spec.ts` chromium+Mobile Chrome | PASS 34/34 | |
| Capture hub | PASS 7/7 | pasta precommit |
| `smoke:rls` | **SKIPPED** | humano |
| Firefox/WebKit | NÃO EXECUTADO | browser indisponível |

**Três skipped (não do delta desempenho):**

1. `__tests__/lib/catalogMigration/curativosA4Minimo.test.ts` — `it.skip` sem sample questions  
2. `__tests__/lib/neurocanvas/g04ManifestConflictL1.test.ts` — skip sem catálogo completo  
3. `__tests__/lib/neurocanvas/g04UnresolvedPartition.test.ts` — idem  

---

## 11. Pendências e riscos residuais

| Tipo | Item |
|------|------|
| Bloqueia commit/PR | Nenhum (deste escopo) |
| Bloqueia deploy | Smoke RLS SKIPPED |
| Dívida fora do delta | A4 títulos; E2E wizard auth; flaky runner simulados em `next dev` |
| Decisão humana | Commit/PR quando quiser; rotacionar token MCP se exposto |

---

## 12. Próximo passo recomendado

1. Revisar diff (excluir `artifacts/_gate-*` etc.).
2. `git add` só paths do hub/docs/testes de desempenho.
3. Commit + PR sob pedido explícito.
4. Humano: `npm run smoke:rls` → só então deploy.
5. Não reaplique migration `respondida`.

---

**Nenhum commit, push, PR, deploy, migration ou escrita no banco foi realizado.**

# Runbook — Monitoramento contínuo de qualidade (pós-venda)

Operação **após** o pacote estar em `production_status: production_ready`. Complementa o ship gate em [`DECISAO_QUALITY_HIBRIDA.md`](DECISAO_QUALITY_HIBRIDA.md).

**Pré-requisito:** subtópico já promovido com `audit:subtopico-quality --promote`. Para a **primeira** promoção, use [`QUALITY_VENDAVEL_CONVERSA.md`](QUALITY_VENDAVEL_CONVERSA.md).

---

## 1. Quando usar

| Situação | Comando |
|----------|---------|
| Pacote recém-promovido (baseline) | `audit:subtopico-health -- --subtopico="..."` |
| Rotina diária / nightly CI | `audit:subtopico-health -- --all-production-ready` |
| Após reparo de P0/P1 | `audit:subtopico-health -- --subtopico="..." --recover` |
| Pacote em `blocked` | repair → health PASS → `--recover` |

**Não usar** `audit:subtopico-quality --promote` de forma rotineira pós-venda — só na 1ª promoção ou re-ship excepcional documentado.

---

## 2. Fluxo diário (ops)

```text
┌─────────────────────────────────────────────────────────────┐
│  Manhã: triagem P0/P1 (RUNBOOK_ERROR_REPORT_TRIAGE)        │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  audit:subtopico-health --all-production-ready              │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
              ┌─────────────┴─────────────┐
              ▼                           ▼
         health PASS                  should_block
    streak++ no registry          production_status: blocked
              │                           │
              │                           ▼
              │                    handcraft repair
              │                           │
              │                           ▼
              │              audit:subtopico-health --recover
              └───────────────────────────┘
```

### Checklist diário

- [ ] Fila P0 = 0 itens com idade > 4h (triagem)
- [ ] Fila P1 revisada (idade > 24h)
- [ ] `audit:subtopico-health --all-production-ready` (ou por pacote flagship)
- [ ] Pacotes `blocked`: owner atribuído + ETA de repair
- [ ] Após correção: `--recover` + confirmar `health_streak_days` reiniciado

---

## 3. Comandos

```bash
# Um subtópico (default: grava registry + artifact)
npm run audit:subtopico-health -- --subtopico="Enfermagem em Central de Material e Esterilização (CME)"

# Todos production_ready + blocked
npm run audit:subtopico-health -- --all-production-ready

# Após reparo confirmado
npm run audit:subtopico-health -- --subtopico="..." --recover

# Só relatório, sem gravar registry
npm run audit:subtopico-health -- --subtopico="..." --write-registry=false
# alias: --no-write-registry
```

### Artefatos

| Caminho | Conteúdo |
|---------|----------|
| `artifacts/subtopico-health/<pacote>/YYYY-MM-DD.json` | Snapshot diário |
| `artifacts/subtopico-health/<pacote>/latest.json` | Último audit |

### Exit codes

| Código | Significado |
|--------|-------------|
| 0 | Health PASS; streak atualizado |
| 1 | `blocked` ou alertas críticos (P0 stale, SLO violado) |

---

## 4. Critérios de health (`evaluateContinuousHealth`)

Estende `evaluateContentHealth` com regras pós-venda:

| Métrica | Limite | Efeito |
|---------|--------|--------|
| `open_p0` stale (> 24h em `novo`/`triagem`) | > 0 | **`should_block: true`** |
| `open_p0` recente | > 0 | alerta; não bloqueia |
| `open_p1` | > `slo.open_p1_max` (default 2) | alerta |
| `report_rate_pct` | ≥ 2,0% com sessions ≥ 100 | alerta |
| `report_rate_pct` | warming (sessions < 100) | não bloqueia por taxa |

Configuração por pacote: `quality.slo.p0_block_after_hours` (default **24**).

Código: [`lib/catalogMigration/contentHealth.ts`](../lib/catalogMigration/contentHealth.ts), [`lib/catalogMigration/continuousQuality.ts`](../lib/catalogMigration/continuousQuality.ts).

---

## 5. Transição `blocked` ↔ `production_ready`

### Entrar em `blocked`

Automático quando `audit:subtopico-health` detecta P0 stale:

- `production_status` → `blocked`
- `quality.continuous.last_blocked_at` = hoje
- `quality.continuous.last_blocked_reason` = resumo (ex.: "2 P0 > 24h: slug-a, slug-b")
- `health_streak_days` → 0

### Sair de `blocked` (`--recover`)

1. Resolver todos os P0 stale (handcraft repair — ver §6).
2. Marcar reportes `resolvido` no painel admin.
3. Rodar:
   ```bash
   npm run audit:subtopico-health -- --subtopico="..." --recover
   ```
4. Se health PASS → `production_status: production_ready`; limpa `last_blocked_*`.

> **`blocked` não é demote:** handcraft permanece no Supabase; `status: applied` inalterado.

---

## 6. Handcraft repair (resumo)

Detalhe completo: [`RUNBOOK_ERROR_REPORT_TRIAGE.md`](RUNBOOK_ERROR_REPORT_TRIAGE.md) §5.

1. Localizar JSON: `data/catalog-migration/<pacote>-gNN/questions/<slug>.json`
2. Corrigir + validar:
   ```bash
   npm run audit:questao-readiness -- --file=...
   npm run audit:slug-alignment -- --slug=<slug> --strict
   ```
3. Apply: `npm run catalog:apply-lote -- --lote=<lote> --apply`
4. Resolver reportes no admin.
5. `audit:subtopico-health --recover`

Para regressão L2 nos top slugs, o health audit pode re-lintar alignment nos 3 slugs com mais reportes.

---

## 7. Registry (`quality.continuous`)

Após cada health audit com `--write-registry` (default):

```json
{
  "continuous": {
    "enabled": true,
    "last_audit_at": "2026-06-29T08:00:00.000Z",
    "last_audit_pass": true,
    "health_streak_days": 5,
    "last_blocked_at": null,
    "last_blocked_reason": null
  }
}
```

| Campo | Significado |
|-------|-------------|
| `health_streak_days` | Dias consecutivos com `last_audit_pass: true` |
| `last_audit_pass` | Resultado do último health |
| `last_blocked_*` | Preenchido quando entrou em `blocked` |

---

## 8. Admin e API

| Superfície | O que mostra |
|------------|--------------|
| `GET /api/admin/subtopico-quality?all=1` | `can_sell`, `continuous`, `content_health` |
| `SubtopicoQualityHealthPanel` | badge `blocked`, streak, `last_blocked_reason` |

`can_sell` usa `canSell()` de `shipGate.ts` — `false` quando `blocked`.

---

## 9. CI (nightly)

Job opcional em [`.github/workflows/quality-layers.yml`](../.github/workflows/quality-layers.yml):

```yaml
- run: npm run audit:subtopico-health -- --all-production-ready || true
```

`continue-on-error: true` até piloto estável; upload de `artifacts/subtopico-health/`.

---

## 10. Escalação

| Situação | Ação |
|----------|------|
| P0 > 24h em flagship | `blocked` automático; owner + repair same-day |
| 3+ P1 no mesmo slug em 7d | Repair + elevar prioridade; revisar `danger_zone` |
| Health PASS mas aluno ainda reporta | Capture `questao-review` + alignment strict no slug |
| Regressão visual (L3) | `e2e/visual-mold-regression` no branch afetado |

---

## 11. Relação com outras camadas

| Camada | Ship (`--promote`) | Continuous (health) |
|--------|-------------------|----------------------|
| L1–L2b | obrigatório | opcional (top 3 slugs) |
| L3 | obrigatório (strict) | não re-roda por padrão |
| L5 P0 | qualquer aberto bloqueia | stale > 24h bloqueia |
| L6 | obrigatório | não re-roda por padrão |

Ver [`QUALITY_LAYERS_MODEL.md`](QUALITY_LAYERS_MODEL.md) §7.

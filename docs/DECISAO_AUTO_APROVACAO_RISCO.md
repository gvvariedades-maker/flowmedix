# ADR — Auto-aprovação por risco

**Data:** 2026-07-11  
**Status:** vigente (opt-in por pacote)  
**Escopo:** handcraft golden-v1 / apply de lotes no catálogo AVANT (~5.180 questões)

Complementa: [`DECISAO_QUALITY_HIBRIDA.md`](DECISAO_QUALITY_HIBRIDA.md) · [`QUALITY_LAYERS_MODEL.md`](QUALITY_LAYERS_MODEL.md) · [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md)

---

## Decisão

O AVANT adota **auto-aprovação por risco** para revisão A4 (piloto humano):

- O agente **detecta e classifica** 100% das questões (`scoreQuestaoRisk`).
- O humano revisa **só onde o custo do erro é alto** (dose/conduta crítica, fonte fraca, divergência prova×guideline).
- Pacotes ligam o gate com `auto_approval.enabled` + `riskApprovalGate` no apply.

**Não** substitui corretude clínica factual: número crítico continua exigindo assinatura humana (`a4_reviewer` sem prefixo `agent:`).

---

## Modelo

| `risk_tier` | `approval_mode` | Amostra humana |
|-------------|-----------------|----------------|
| `baixo` | `auto` | 5% |
| `medio` | `auto_conditional` | 20% |
| `alto` | `human_required` | 100% |

### Fatores críticos → `alto`

- `numeric_claim_critical` — mg/mL/UI/mmHg/bpm/°C/proporção (ex. 30:2)
- `family_high_stakes` — `calc`, `protocolo`+número, ou subtópico alto risco + dose
- `source_tier_b_on_number` — número só com fonte tier B
- `exam_vs_current_divergence` — prova ≠ guideline atual

### Fatores médios → `medio`

- `numeric_claim_soft` — %, tempo, escore
- `source_covers_gap` — número sem `sources[].covers`
- `subtopic_immature` — pacote ≠ `production_ready`
- `branch_novel` / `residual_pedagogy_warn`

---

## Contrato JSON

```jsonc
"meta": {
  "efficacy_contract": {
    "risk_tier": "alto",
    "approval_mode": "human_required",
    "risk_factors": ["numeric_claim_critical"],
    "a4_reviewed": true,
    "a4_reviewer": "PC",           // humano — NÃO "agent:…"
    "auto_approved_at": null,
    "sampled": false
  }
}
```

Em risco baixo/médio o agente pode preencher via `buildEfficacyContractFromRisk` (`a4_reviewer: "agent:golden-v2"`).  
Em risco alto **não** auto-assina — `assertApprovalGate` bloqueia apply.

---

## Implementação

| Peça | Arquivo |
|------|---------|
| Score + gate | [`lib/catalogMigration/riskScoring.ts`](../lib/catalogMigration/riskScoring.ts) |
| Schema Zod | `EfficacyContractSchema` em [`lib/validations.ts`](../lib/validations.ts) |
| Readiness A4 | [`lib/catalogMigration/auditQuestaoReadiness.ts`](../lib/catalogMigration/auditQuestaoReadiness.ts) → `result.risk` |
| Write / apply | [`lib/questaoSpec/validateQuestaoForWrite.ts`](../lib/questaoSpec/validateQuestaoForWrite.ts) · [`lib/catalogMigration/applyLote.ts`](../lib/catalogMigration/applyLote.ts) |
| Registry | `RegistryPacote.auto_approval` em [`handcraftRegistry.ts`](../lib/catalogMigration/handcraftRegistry.ts) |

### Opt-in

```bash
# Score sempre reporta no readiness (info/warn)
npm run audit:questao-readiness -- --file=...

# Apply com gate (quando pacote tiver auto_approval.enabled)
# riskApprovalGate: true no applyLoteToSupabase / CLI
```

`auto_approval.enabled` default **false** no registry até o subtópico ter histórico limpo (`report_rate` / health).

---

## Kill-switch

1. `auto_approval.enabled: false` no pacote → força `human_required`.
2. `report_rate` > `downgrade_on_report_rate_pct` → desligar auto + aumentar amostra (ops via `audit:subtopico-health`).
3. P0 stale → `production_status: blocked` (já existente) + desligar auto.

---

## O que NÃO muda

- Trilho handcraft por slug ([`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md))
- `content_standard: golden-v1` nos JSON (barra de conteúdo)
- Ship `production_ready` (L1–L6)

---

## Rollout sugerido

1. Ligar scoring (já ativo no readiness) — observar distribuição baixo/médio/alto
2. Pilotar 1 pacote `production_ready` estável (ex. História da Enfermagem) com `auto_approval.enabled: true` + `riskApprovalGate`
3. Expandir para Vias / Sinais Vitais com amostragem
4. **Punção / História:** protocolo A4-mínimo com whitelist (`docs/PROTOCOLO_A4_MINIMO.md`) — core genérico + `stamp:a4-minimo`
5. Manter Imunização / Urgências / Cálculo com humano em dose até calibração

---
name: avant-golden-anchor-bootstrap
description: >-
  Bootstrap de golden âncoras de estilo (examples/) antes do g01. Use quando o
  usuário enviar Criar âncoras:, Âncoras faltantes:, Antes do g01:, ou quando
  audit:golden-anchor-gate = block / goldens_needed > 0. Agente na frente:
  handcrafta âncoras; não inicia handcraft em massa sem gate pass. Encadeia
  avant-classify-family + avant-golden-anchor-handcraft. Não escreve lotes gNN.
---
> **Cópia versionada (fonte Git).** Edite aqui; sincronize o runtime com `npm run sync:skills`. Exceção Elias: versionada direto em `.cursor/skills/professor-elias-santana-metodo/`. Ver `docs/SKILLS_GOVERNANCE.md`.

# Bootstrap de golden âncoras — agente na frente

**Missão:** para cada ramo forte **sem** golden em `examples/`, o agente **cria** 1 âncora de estilo (`questao-premium-*.json`) com barra 10/10. Só depois libera `g01`.

**Não é** handcraft de lote. Para escrever slides de um slug do catálogo, use `avant-golden-anchor-handcraft`.

**Proibido:** `ai:generate` · `catalog:upgrade-premium` · iniciar `g01` com `audit:golden-anchor-gate` = `block` · declarar âncora pronta sem `[READY]` strict-v2.

---

## Triggers

```text
Criar âncoras: <Subtópico canônico>
Âncoras faltantes: <Subtópico canônico>
Antes do g01: <Subtópico canônico>
```

Também ativar quando `Pipeline completo:` / `Handcraft:` encontrar `goldens_needed > 0` ou gate `block`.

---

## Passo 0 — Gate (obrigatório)

```bash
npm run audit:golden-anchor-gate -- --subtopico="<Nome canônico exato>"
# opcional: fila Markdown para o agente
npm run anchor:brief -- --subtopico="<Nome canônico exato>"
```

| `gate` | Ação |
|--------|------|
| `pass` | Liberado — seguir `Handcraft:` / Fase 1 |
| `warn` | Handcraft permitido; listar avisos (ex.: `absorver` só com fallback de família) |
| `block` | **Parar** — criar âncoras abaixo; não exportar/handcraftar lote `g01` |

Sem cluster report: rodar `cluster:<pacote>` (ou `Mapeamento L3:`) antes. Bypass só com `--skip-golden-anchor-gate` documentado como emergência.

Artefato: `artifacts/golden-anchor-gate-<pacote_prefix>.json`.

---

## Fluxo (1 âncora por ramo faltante)

Ordem fixa — **agente produz**; script só verifica.

```text
1. Ler missing[] do gate / anchor:brief
2. sample_slugs[0] → export real (não inventar enunciado)
3. avant-classify-family → meta.family
4. Copiar examples/_TEMPLATE-golden-v1.json
5. avant-golden-anchor-handcraft → 4 slides (logic_flow primeiro)
6. Salvar examples/questao-premium-<banca>-<pacote>-<branch_id>.json
7. audit:questao-readiness --file=<path> --strict-v2-pedagogy → [READY]
8. Registrar: GOLDEN_BY_CLUSTER + *-golden-anchors.json (se existir) + anchor_glob
9. Próximo ramo; no fim: re-rodar audit:golden-anchor-gate
```

### Skills encadeadas

| Passo | Skill |
|-------|--------|
| Family | `avant-classify-family` |
| Slides | `avant-golden-anchor-handcraft` + `avant-json-template` |
| Tom TE | `professor-para-concurso` |
| Tom PT | `professor-lingua-portuguesa-concurso` (+ Elias se morfossintaxe) |
| Brief L3 (ramo forte) | `brief-enfermagem` / `brief-lingua-portuguesa` — se ainda não houver `artifacts/l3-brief-*` |

---

## Quem exige âncora própria

Contrato: `lib/catalogMigration/clusterReportContract.ts` + `GOLDEN_HANDCRAFT_MODEL.md` § ramo.

| Decisão cluster | Exige `examples/` próprio? |
|-----------------|----------------------------|
| `novo_ramo` | **Sim** — 1 golden + preferencialmente brief 4/4 |
| `coberto` | Já tem — só validar arquivo no disco |
| `absorver` | Não obrigatório — fallback `FAMILY_GOLDEN_FILE` → `warn` |
| `cauda_longa` | Não |

**Não** usar fallback de família (`FAMILY_GOLDEN_FILE` / âncora de outro subtópico) para fechar `novo_ramo`.

---

## Checklist por âncora (antes do próximo ramo)

- [ ] Arquivo em `examples/questao-premium-*.json`
- [ ] `meta.content_standard: "golden-v1"`
- [ ] `meta.family` + `meta.subtopico` canônico
- [ ] `meta.pedagogical_branch` se ramo L3
- [ ] 4 slides planos, ordem v2; `logic_flow` com `reveal_mode: "tap"`
- [ ] `danger_zone.items[].correct` distintos
- [ ] `meta.sources[]` tier A/B quando houver claim normativo
- [ ] `[READY]` com `--strict-v2-pedagogy`
- [ ] Entrada no cluster (`GOLDEN_BY_CLUSTER` / `has_golden`) e registry se aplicável

---

## Relatório ao usuário

```text
| ramo / cluster | sample_slug | examples/… | READY | gate |
```

Encerrar só com `gate=pass` (ou `warn` + `handcraft_allowed=true` e lista explícita do que ficou em fallback).

**Próximo passo típico:** `Handcraft: <subtópico>` ou retomar `Pipeline completo:` Fase 1.

---

## Referências

| Doc / código | Uso |
|--------------|-----|
| `docs/GOLDEN_HANDCRAFT_MODEL.md` § Fase 1 — Golden âncora | Procedimento canônico |
| `docs/GOLDEN_CONTENT_STANDARD.md` | Contrato L2 |
| `docs/PIPELINE_COMPLETO_CONVERSA.md` | Fase 0.5 âncoras |
| `lib/catalogMigration/goldenAnchorGate.ts` | Gate pass/warn/block |
| `examples/_TEMPLATE-golden-v1.json` | Template |
| Skill `avant-golden-anchor-handcraft` | Escrever slides da âncora |

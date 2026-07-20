# Ramo forte — referência rápida (agente + humano)

**1 página.** Fonte única para limiar, decisão, paths e comandos. Runbooks completos linkados no fim — **não duplicar** regras longas aqui.

**Política (2026-07-02+):** molde legado no repo **não** dispensa brief. `ok_existente` (legado) → tratar como `molde_redesign`.

---

## O que é ramo forte

Ramo pedagógico (`pedagogical_branch` / cluster) com volume:

```text
count >= max(5, ceil(total_slugs * 0.10))
```

Ou seja: **≥5 slugs** **ou** **≥10%** do subtópico — o que for maior.

| Termo | Significado |
|-------|-------------|
| **Ramo forte** | Volume acima do limiar + erro tipicamente espacial → exige **Fase 3b** (brief 4/4) |
| **Cauda longa** | Volume abaixo do limiar → `ok_generico`, sem brief formal |
| **Fase 3b** | Brief 4/4 por ramo forte, antes de handcraft em massa ou React |

---

## Árvore de decisão (copiar mentalmente)

```text
1. Pegadinha = só texto × texto E compare/rows/tap bastam?
   SIM → ok_generico (Modo A handcraft; sem novo l3-brief)
   NÃO ↓

2. count >= max(5, ceil(total * 0.10))?
   NÃO → ok_generico (cauda longa)
   SIM ↓

3. Erro espacial / sequencial / categorial / numérico estruturado?
   NÃO → ok_generico SE teste espacial 3/3 (documentar no relatório)
   SIM ↓

4. Molde legado wired no repo?
   SIM → molde_redesign
   NÃO → molde_inedito
   → Modo B: brief 4/4 obrigatório
```

### Teste espacial 3/3 (rebaixar ramo forte → genérico)

Documentar as três respostas no relatório L3. Só rebaixa se **todas** forem **sim**:

1. A pegadinha **não** é espacial (só texto × texto)?
2. O padrão aparece em **<5 questões** **e** **<10%** do subtópico?
3. `compare` + `correct` (e `rows` / `tap`) já ensinam sem UI bespoke?

---

## Decisões L3

| Decisão | Quando | Próximo passo |
|---------|--------|---------------|
| `ok_generico` | Cauda longa ou teste 3/3 | Handcraft com layouts genéricos (Modo A) |
| `molde_redesign` | Ramo forte + molde legado | Fase 3b → `VARIANT_MOLDS` §3 |
| `molde_inedito` | Ramo forte sem molde adequado | Fase 3b → `VARIANT_MOLDS` §3 |
| `ramo_novo` | Falta `pedagogical_branch` no mapa | `BRANCH_DESIGN_MAP` + backfill; se forte → `molde_inedito` |

---

## Paths canônicos (artefatos)

| Artefato | Path |
|----------|------|
| Cluster report | `artifacts/<pacote_prefix>-topic-cluster-report.json` |
| Auditoria L3 | `artifacts/l3-mold-gap-audit.json` + `.md` |
| **Brief 4/4** | `artifacts/l3-brief-<pacote_prefix>-<branch_id>.md` |
| Índice de briefs (se existir) | `registry.l3_brief_index` ou `artifacts/l3-brief-<pacote_prefix>-INDEX.md` |

**Exemplos:** `l3-brief-saude-adolescente-adolescente_etica_sigilo.md` · `l3-brief-lingua-portuguesa-pt_crase.md`

---

## Resolver pacote (passo 0)

1. Nome canônico → [`data/catalog-migration/handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json) (`CLAUDE.md` §9; PT = card `meta.subtopico`, fora dos 41 TE).
2. Anotar: `pacote_prefix`, `total_slugs`, `cluster_command`, `cluster_report`, `handcraft_playbook`, `l3_brief_index`.
3. Playbook: `data/catalog-migration/handcraft-playbooks/<pacote_prefix>.json` (ou `_default.json`).

```bash
npm run handcraft:brief -- --subtopico="<Nome canônico exato>"
```

---

## Comandos por fase

| Fase | Comando |
|------|---------|
| **0** Escopo | `npm run handcraft:brief -- --subtopico="..."` |
| **0** Export (se manifest velho) | `npm run catalog:export-lote -- --lote=<pacote>-completo --subtopico="..." --limit=10000` |
| **1** Cluster | `npm run cluster:<pacote_prefix>` — ver tabela abaixo ou `cluster_command` no registry |
| **2** Auditoria L3 | `npm run audit:l3-mold-gap -- --from-supabase --subtopico="..."` |
| **3b** Brief | `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` §3 (versão **completa**) + skill `brief-enfermagem` (TE) ou `brief-lingua-portuguesa` (PT) |

**Cluster scripts no repo** (`package.json`):

| `pacote_prefix` | Comando |
|-----------------|---------|
| `perioperatoria` | `npm run cluster:perioperatoria` |
| `saude-mental` | `npm run cluster:saude-mental` |
| `cme` | `npm run cluster:cme` |
| `processamento` | `npm run cluster:processamento` |
| `bacterianas` | `npm run cluster:bacterianas` |
| `seguranca-do-paciente` | `npm run cluster:seguranca-do-paciente` |
| `farmacodinamica-e-farmacocinetica` | `npm run cluster:farmacodinamica` |
| `calculo-de-administracao-de-medicamentos-e-infusoes` | `npm run cluster:calculo-de-administracao-de-medicamentos-e-infusoes` |
| `imunizacao` | `npm run cluster:imunizacao` |
| `vias-de-administracao` | `npm run cluster:vias-de-administracao` |
| `respiratorio-cronico` | `npm run cluster:respiratorio-cronico` |
| `sinais-vitais` | `npm run cluster:sinais-vitais` |
| `urgencias-e-emergencias` | `npm run cluster:urgencias-e-emergencias` |
| `enfermagem-do-trabalho` | `npm run cluster:enfermagem-do-trabalho` |
| `processo-de-enfermagem` | `npm run cluster:processo-de-enfermagem` |
| `cuidados-na-administracao-de-medicamentos` | `npm run cluster:cuidados-na-administracao-de-medicamentos` |
| `saude-da-crianca` | `npm run cluster:saude-da-crianca` |
| `curativos-e-manejo-de-feridas` | `npm run cluster:curativos-e-manejo-de-feridas` |
| `lingua-portuguesa` | `npm run cluster:lingua-portuguesa` |

Sem script: criar `scripts/cluster-<pacote_prefix>-topics.ts` (padrão `cluster-perioperatoria-topics.ts`).

---

## Checklist conversa `Mapeamento L3:`

```text
[ ] F0 — registry + handcraft:brief; pacote_prefix e total_slugs confirmados
[ ] F1 — cluster report + tabela cluster × % × branch_id
[ ] F2 — audit:l3-mold-gap cruzado com cluster
[ ] F3 — tabela ramo × decisão L3 × próximo passo
[ ] F3b — 1× l3-brief-<pacote>-<branch>.md por molde_redesign | molde_inedito
      GATE brief: metáfora 4/4 · 4 layout_variant · contrato JSON · DoD §9
[ ] F4 (opcional) — l3MoldGapCatalog + BRANCH_DESIGN_MAP (só se pedido)
```

**Proibido nesta conversa:** `apply-lote --apply`, handcraft em massa, React sem `Implementar molde: …`.

---

## Modos da skill brief (eficiência)

| Modo | Quando | Grava `l3-brief-*.md`? |
|------|--------|-------------------------|
| **A** | Handcraft slug a slug; cauda longa; ok_generico | Não (salvo pedido explícito) |
| **B** | `molde_redesign` \| `molde_inedito`; trigger `Brief TE:` / `Brief PT:` | Sim — GATE Fase 3b |

| Domínio | Skill |
|---------|-------|
| 41 subtópicos TE | `.cursor/skills/brief-enfermagem/SKILL.md` + [`reference-pacotes.md`](../.cursor/skills/brief-enfermagem/reference-pacotes.md) |
| Língua Portuguesa | `.cursor/skills/brief-lingua-portuguesa/SKILL.md` + [`reference-ramos.md`](../.cursor/skills/brief-lingua-portuguesa/reference-ramos.md) |

---

## Triggers (próximo passo)

**Anexos obrigatórios** em toda conversa L3 / brief / pipeline:

```text
@docs/RAMO_FORTE_QUICK_REF.md
@docs/L3_MAPEAMENTO_CONVERSA.md
@data/catalog-migration/handcraft-registry.json
@.cursor/skills/brief-enfermagem/SKILL.md   # PT: brief-lingua-portuguesa
```

| Objetivo | Escreva |
|----------|---------|
| Diagnóstico L3 | `Mapeamento L3: <subtópico>` |
| Brief de um ramo | `Brief TE: <branch_id>` ou `Brief PT: <branch_id>` |
| Handcraft | `Handcraft: <subtópico>` |
| Pipeline inteiro | `Pipeline completo: <subtópico>` |
| React do molde | `Implementar molde: <branch_id>` (após brief aprovado) |

---

## Docs completos (não substituir este arquivo)

| Doc | Uso |
|-----|-----|
| [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) | Runbook Fases 0–4 + entregáveis |
| [`L3_BRIEF_TEMPLATE.md`](L3_BRIEF_TEMPLATE.md) | Brief mínimo 1 página (muitos ramos) |
| [`artifacts/l3-brief-FLAGSHIP-INDEX.md`](../artifacts/l3-brief-FLAGSHIP-INDEX.md) | 3 briefs flagship para calibração |
| [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) | Corpo do brief 4/4 (§3 completa) |
| [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) §2 | Critério espacial expandido · §3 React |
| [`PACOTE_PREMIUM_CHECKLIST.md`](PACOTE_PREMIUM_CHECKLIST.md) | Qualidade por ramos · rollout pacote |
| [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) | GATE handcraft ramos fortes |
| [`PIPELINE_COMPLETO_CONVERSA.md`](PIPELINE_COMPLETO_CONVERSA.md) | Pré-requisito L3 antes da Fase 1 |
| Rule | `.cursor/rules/l3-mapeamento.mdc` |

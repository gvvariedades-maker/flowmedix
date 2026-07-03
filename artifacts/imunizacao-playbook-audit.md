# Auditoria pedagógica — Playbook Imunização

Gerado em: 2026-07-02  
Fontes: `artifacts/imunizacao-topic-cluster-report.json` · `artifacts/l3-mold-gap-audit.md` · `data/catalog-migration/handcraft-playbooks/imunizacao.json` · `data/catalog-migration/imunizacao-golden-anchors.json`

## Resumo executivo

| Métrica | Valor |
|---------|-------|
| Slugs no catálogo | 575 |
| Handcraft aplicado | 1/575 (`in_progress`) |
| Clusters pedagógicos (cluster report) | 12 |
| Ramos no playbook (antes) | 3 |
| Ramos propostos | 4 (+ `imunizacao_cadeia_frio`) |
| Âncoras golden existentes | 6 (registry 6/6 READY) |
| Âncoras golden faltando (P0) | 0 |
| Slugs com mismatch L3 (audit) | 553 |

**Diagnóstico:** o playbook tinha clusters **agregados demais** e o ramo `imunizacao_generico` absorvia **~35%** do catálogo (cadeia de frio + EXCETO + C/E + técnica) sem âncoras dedicadas. Calendário (47% do volume) compartilha um ramo com moldes distintos para infantil vs adolescente/adulto — aceitável com **2ª âncora** P0.

---

## Cluster report × playbook (antes)

| Cluster (report) | Slugs | % | Ramo proposto | Âncora | Playbook (antes) |
|------------------|-------|---|---------------|--------|------------------|
| Calendário — adolescente/adulto/idoso | 137 | 23,8% | `imunizacao_calendario` | ❌ | Agrupado em “calendário infantil” |
| Calendário — infantil | 135 | 23,5% | `imunizacao_calendario` | ✅ Fundatec 3m | Parcial |
| Cadeia de frio / SI-PNI | 68 | 11,8% | `imunizacao_cadeia_frio` **novo** | ❌ | Caía em “gestante/HPV/cadeia…” |
| HPV / campanhas | 46 | 8,0% | `imunizacao_calendario` | ❌ | Lumped |
| INCORRETA / EXCETO | 42 | 7,3% | `imunizacao_generico` | ❌ | Lumped |
| Default | 41 | 7,1% | `imunizacao_generico` | — | — |
| Gestante / puérpera | 40 | 7,0% | `imunizacao_calendario` | ❌ | Lumped |
| Certo ou errado | 28 | 4,9% | `imunizacao_generico` | — | — |
| V/F intervalos PNI | 18 | 3,1% | `imunizacao_vf_intervalos` | ✅ CPCON | OK |
| Técnica / sala vacinação | 11 | 1,9% | `imunizacao_generico` | ✅ DECORP via | OK (âncora existe) |
| Conceito imunobiológico | 8 | 1,4% | `imunizacao_generico` | — | — |
| Contraindicações / EA | 1 | 0,2% | `imunizacao_generico` | — | cauda longa |

---

## Ramos — decisão L3

| Ramo | Slugs est. | Decisão | Pacote L3 | Próximo passo |
|------|------------|---------|-----------|---------------|
| `imunizacao_calendario` | ~358 (62%) | `molde_redesign` | vaccine-timeline · pni-calendar-board · pni-calendar-elimination-tap · calendar-mismatch | Handcraft lotes calendário g07+ |
| `imunizacao_vf_intervalos` | ~18 (3%) | `ok_existente` | pni-rules-deck · pni-interval-matrix · pni-vf-juggle-tap · pni-trap-chips | Manter CPCON; escalar lote V/F |
| `imunizacao_cadeia_frio` | ~68 (12%) | `molde_redesign` | cold-chain-hub · pni-temperature-rail · pni-cold-chain-tap · temperature-mismatch | Handcraft g02+ · piloto [`spot-check-imunizacao-cadeia-frio.html`](spot-check-imunizacao-cadeia-frio.html) |
| `imunizacao_generico` | ~131 (23%) | `ok_generico` | morphological · reference_table · tap · compare | Âncora DECORP (via SCR) OK; EXCETO/C/E sem âncora dedicada — P2 |

**Não abrir ramo `imunizacao_exceto` agora:** 42 slugs (7,3%) — `compare` genérico + danger semântico basta; reavaliar se `--strict-v2-pedagogy` falhar em massa.

---

## Âncoras golden — status

| ID registry | Arquivo | Ramo | [READY] | Prioridade |
|-------------|---------|------|---------|------------|
| `vf_intervalos_pni` | `questao-premium-cpcon-imunizacao-intervalos-vf.json` | `imunizacao_vf_intervalos` | READY | — |
| `calendario_infantil` | `questao-premium-fundatec-meningococica-3meses.json` | `imunizacao_calendario` | READY | — |
| `calendario_adolescente_adulto` | `questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json` | `imunizacao_calendario` | READY | — |
| `via_scr_subcutanea` | `questao-premium-decorp-imunizacao-triplice-viral-via.json` | `imunizacao_generico` | READY | — |
| `cadeia_frio_pni` | `questao-premium-ameosc-imunizacao-vf-cadeia-frio.json` | `imunizacao_cadeia_frio` | READY | — |
| `cadeia_frio_temperatura` | `questao-premium-avancasp-imunizacao-rede-frio-temperatura.json` | `imunizacao_cadeia_frio` | READY | — |

---

## Gaps no playbook (corrigidos nesta auditoria)

1. **`clusters[]`** alinhados ao cluster report (12 entradas com volume).
2. **Ramo `imunizacao_cadeia_frio`** adicionado em `pedagogicalBranch.ts` + playbook.
3. **`modes.subtopico_handcraft`** com `first_lote: imunizacao-g01` e `after_handcraft` incluindo `patch-pedagogical-branch`.
4. **`slug_selection`** detalhado por cluster/ramo.
5. **`guideline`** referenciado (`lib/guidelines/pniCalendario.ts`).

---

## Pipeline recomendado (1º lote piloto)

```bash
npm run handcraft:brief -- --subtopico="Imunização"
# P0: handcraft âncoras faltantes (cadeia frio + calendário adulto) antes de escalar g01
npm run catalog:export-lote -- --lote=imunizacao-completo --subtopico="Imunização" --limit=10000
# Handcraft → data/catalog-migration/imunizacao-g01/questions/*.json
npm run validate:goldens -- --lote=imunizacao-g01 --strict
npm run audit:questao-readiness -- --lote=imunizacao-g01
npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico="Imunização" --only-premium --apply
```

**Ordem sugerida do piloto g01 (8 slugs):**

1. `decorp-enfermagem-vias-de-administracao-1776056357082-0` — já reparado
2. `ameosc-enfermagem-processo-de-enfermagem-1780005791580-3` — âncora cadeia frio V/F ✅
3. `avancasp-enfermagem-processo-de-enfermagem-1780011872350-6` — âncora cadeia frio 2–8 °C ✅
4. `adm-tec-enfermagem-imunizacao-1779563986606-5` — âncora calendário adulto ✅
5. `amauc-enfermagem-imunizacao-1779572227744-8` — V/F intervalos
6. `adm-tec-enfermagem-imunizacao-1777103244679-1` — calendário infantil
7. `agirh-enfermagem-imunizacao-1779564113760-0` — EXCETO (generico)
8. `cebraspe-cespe-enfermagem-imunizacao-1777103230085-8` — C/E (generico)
9. `ameosc-enfermagem-imunizacao-1779572207173-9` — técnica sala

---

## Referências

- Playbook atualizado: `data/catalog-migration/handcraft-playbooks/imunizacao.json`
- Registry âncoras: `data/catalog-migration/imunizacao-golden-anchors.json`
- Cluster script: `scripts/cluster-imunizacao-topics.ts`
- Runbook L3: `docs/L3_MAPEAMENTO_CONVERSA.md`

---

## Fechamento playbook (2026-07-02)

Gaps de metadados do documento **resolvidos** — playbook operacional pronto para escalar lotes.

| Gap | Resolução |
|-----|-----------|
| `anchor_glob` desatualizado | Sincronizado em `imunizacao.json`, `handcraft-meta.json` e `handcraft-registry.json` (5 âncoras) |
| `clusters[]` stale (P0 pendente) | Rótulos atualizados — ADM&TEC catch-up + AMEOSC cadeia frio |
| `slug_selection` stale | Prioriza escala g07+ pós-âncoras P0; EXCETO/C/E marcado P2 |
| Ramo ADM&TEC inconsistente | `imunizacao_calendario` em golden, example, repair-lote e handcraft-meta |
| Âncoras sem [READY] | **6/6 READY** — `audit:questao-readiness` 2026-07-02; registro em `imunizacao-golden-anchors.json` → `anchors_readiness` |
| Pacote L3 cadeia frio | `cold-chain-hub` · `pni-temperature-rail` · `pni-cold-chain-tap` · `temperature-mismatch` — React + piloto 2026-07-02 |
| CPCON `numeric_fact_mismatch` | Entrada `oral-oral-15d` em `lib/guidelines/pni.ts` + `pedagogical_branch` declarado |
| Fundatec `l3_branch_undeclared` | `pedagogical_branch: imunizacao_calendario` no example |
| EXCETO/C/E sem âncora | **P2 deliberado** — `deliberate_gaps.exceto_ce_sem_ancora` no registry de âncoras |

**Pendente fora do escopo do playbook:** handcraft catálogo 43/575 (`in_progress`); patch L3 em massa no Supabase.

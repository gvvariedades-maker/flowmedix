# NeuroCanvas — clusters de blockers (baseline determinística)

Gerado em: 2026-07-28T00:45:41.866Z

Blockers: **339** · Clusters: **104**

## Partição exaustiva de slugs

| Categoria | Count |
|-----------|------:|
| singleton_disk | 2206 |
| duplicate_byte_identical | 100 |
| duplicate_semantic_identical | 137 |
| duplicate_divergent_resolved | 2869 |
| duplicate_divergent_unresolved | 339 |
| duplicate_invalid | 0 |
| other | 0 |

**Reconciliação:** 5312 + 339 + 0 = 5651

Partição exaustiva: baseline + unresolved + invalid = slugs em disco. Contagem 4.974 era execução anterior (pré-correção BOM UTF-8); atual: 4.975.

**Grupos divergentes:** 3208 = 2869 resolvidos + 339 unresolved

Relatório anterior citava 2.758 resolvidos; reexecução: 2.759. Total 3.435 = 2.759 + 676 (sem grupo omitido).

## Severidade S0–S4

- **S0**: 0
- **S1**: 74
- **S2**: 260
- **S3**: 5
- **S4**: 0

Divergência de gabarito detectada: **sim**

## Top clusters (cobertura acumulada)

| cluster_id | count | cum% | severity | evidence |
|------------|------:|-----:|----------|----------|
| calculo-de-administracao-de-medicamentos-e-infusoes-completo | 35 | 10.3% | S1 | sem_manifest_documentado |
| cuidados-na-administracao-de-medicamentos-repair-lote-01↔pro | 26 | 18% | S2 | sem_manifest_documentado |
| biosseg-itu-scan↔infeccoes-biosseguranca-completo+2|S2|ev=no | 16 | 22.7% | S2 | sem_manifest_documentado |
| coleta-lote-01↔processo-de-enfermagem-completo+1|S2|ev=none | 15 | 27.1% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-lote-06+2|S | 15 | 31.6% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-e-manejo-de | 14 | 35.7% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-lote-02+3|S | 10 | 38.6% | S2 | sem_manifest_documentado |
| instalacao-e-manejo-de-sondas-repair-lote-01↔processo-de-enf | 10 | 41.6% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-lote-04+2|S | 9 | 44.2% | S2 | sem_manifest_documentado |
| cuidados-na-administracao-de-medicamentos-repair-lote-02↔pro | 9 | 46.9% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-e-manejo-de | 9 | 49.6% | S2 | sem_manifest_documentado |
| calculo-de-administracao-de-medicamentos-e-infusoes-completo | 8 | 51.9% | S1 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-lote-05+2|S | 7 | 54% | S2 | sem_manifest_documentado |
| infeccoes-sexualmente-transmissiveis-ists-repair-lote-01↔pro | 6 | 55.8% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔processo-de-enfermage | 5 | 57.2% | S1 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-e-manejo-de | 5 | 58.7% | S2 | sem_manifest_documentado |
| puncao-titulo-cleanup-20↔seguranca-do-paciente-completo+1|S2 | 5 | 60.2% | S2 | sem_manifest_documentado |
| promocao-a-saude-e-prevencao-de-agravos-completo↔promocao-a- | 5 | 61.7% | S1 | sem_manifest_documentado |
| calculo-de-administracao-de-medicamentos-e-infusoes-completo | 5 | 63.1% | S1 | sem_manifest_documentado |
| promocao-a-saude-e-prevencao-de-agravos-completo↔promocao-a- | 4 | 64.3% | S1 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-e-manejo-de | 4 | 65.5% | S2 | sem_manifest_documentado |
| cuidados-na-administracao-de-medicamentos-completo↔cuidados- | 3 | 66.4% | S2 | sem_manifest_documentado |
| coleta-de-exames-laboratoriais-repair-lote-01↔processo-de-en | 3 | 67.3% | S2 | sem_manifest_documentado |
| processo-de-enfermagem-completo↔processo-de-enfermagem-lote- | 3 | 68.1% | S2 | sem_manifest_documentado |
| processo-de-enfermagem-completo↔processo-de-enfermagem-lote- | 3 | 69% | S2 | sem_manifest_documentado |

## Campos divergentes mais frequentes

| field | count | kind |
|-------|------:|------|
| meta.subtopico | 164 | pedagogical |
| reverse_study_slides[0].meta.subtopico | 164 | visual_only |
| reverse_study_slides[1].meta.subtopico | 164 | visual_only |
| reverse_study_slides[2].meta.subtopico | 164 | visual_only |
| reverse_study_slides[3].meta.subtopico | 158 | visual_only |
| reverse_study_slides[0].footer_rule | 93 | visual_only |
| reverse_study_slides[0].items.length | 91 | pedagogical |
| reverse_study_slides[1].steps[1] | 88 | pedagogical |
| reverse_study_slides[3].content | 87 | pedagogical |
| reverse_study_slides[2].content | 78 | pedagogical |
| reverse_study_slides[2].footer_rule | 78 | visual_only |
| reverse_study_slides[2].subject | 78 | visual_only |
| reverse_study_slides[1].steps[8] | 46 | pedagogical |
| reverse_study_slides[2].rows | 46 | pedagogical |
| reverse_study_slides[2].slide_title | 45 | visual_only |
| reverse_study_slides[0].slide_title | 44 | visual_only |
| reverse_study_slides[1].footer_rule | 44 | visual_only |
| reverse_study_slides[1].steps[7] | 41 | pedagogical |
| reverse_study_slides[1].steps[2] | 38 | pedagogical |
| reverse_study_slides[1].steps[5] | 38 | pedagogical |
| reverse_study_slides[3].footer_rule | 38 | visual_only |
| reverse_study_slides[1].slide_title | 37 | visual_only |
| reverse_study_slides[1].steps[3] | 37 | pedagogical |
| reverse_study_slides[3].chip_label | 37 | visual_only |
| reverse_study_slides[0].chip_label | 36 | visual_only |

## Potencial de resolução por contrato

| cluster | slugs | risco | contrato necessário |
|---------|------:|-------|---------------------|
| calculo-de-administracao-de-medicamentos | 35 | low | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| cuidados-na-administracao-de-medicamento | 26 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| biosseg-itu-scan↔infeccoes-biosseguranca | 16 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| coleta-lote-01↔processo-de-enfermagem-co | 15 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| curativos-e-manejo-de-feridas-completo↔c | 15 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| curativos-e-manejo-de-feridas-completo↔c | 14 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| curativos-e-manejo-de-feridas-completo↔c | 10 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| instalacao-e-manejo-de-sondas-repair-lot | 10 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| curativos-e-manejo-de-feridas-completo↔c | 9 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| cuidados-na-administracao-de-medicamento | 9 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| curativos-e-manejo-de-feridas-completo↔c | 9 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| calculo-de-administracao-de-medicamentos | 8 | low | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| curativos-e-manejo-de-feridas-completo↔c | 7 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| infeccoes-sexualmente-transmissiveis-ist | 6 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| curativos-e-manejo-de-feridas-completo↔p | 5 | low | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |

Decisões de contrato estimadas (mínimo): **104** (uma por cluster).

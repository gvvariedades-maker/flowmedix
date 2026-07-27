# NeuroCanvas — clusters de blockers (baseline determinística)

Gerado em: 2026-07-27T19:25:04.963Z

Blockers: **347** · Clusters: **111**

## Partição exaustiva de slugs

| Categoria | Count |
|-----------|------:|
| singleton_disk | 2206 |
| duplicate_byte_identical | 98 |
| duplicate_semantic_identical | 131 |
| duplicate_divergent_resolved | 2869 |
| duplicate_divergent_unresolved | 347 |
| duplicate_invalid | 0 |
| other | 0 |

**Reconciliação:** 5304 + 347 + 0 = 5651

Partição exaustiva: baseline + unresolved + invalid = slugs em disco. Contagem 4.974 era execução anterior (pré-correção BOM UTF-8); atual: 4.975.

**Grupos divergentes:** 3216 = 2869 resolvidos + 347 unresolved

Relatório anterior citava 2.758 resolvidos; reexecução: 2.759. Total 3.435 = 2.759 + 676 (sem grupo omitido).

## Severidade S0–S4

- **S0**: 0
- **S1**: 74
- **S2**: 266
- **S3**: 7
- **S4**: 0

Divergência de gabarito detectada: **sim**

## Top clusters (cobertura acumulada)

| cluster_id | count | cum% | severity | evidence |
|------------|------:|-----:|----------|----------|
| calculo-de-administracao-de-medicamentos-e-infusoes-completo | 35 | 10.1% | S1 | sem_manifest_documentado |
| cuidados-na-administracao-de-medicamentos-repair-lote-01↔pro | 26 | 17.6% | S2 | sem_manifest_documentado |
| biosseg-itu-scan↔infeccoes-biosseguranca-completo+2|S2|ev=no | 16 | 22.2% | S2 | sem_manifest_documentado |
| coleta-lote-01↔processo-de-enfermagem-completo+1|S2|ev=none | 15 | 26.5% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-lote-06+2|S | 15 | 30.8% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-e-manejo-de | 14 | 34.9% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-lote-02+3|S | 10 | 37.8% | S2 | sem_manifest_documentado |
| instalacao-e-manejo-de-sondas-repair-lote-01↔processo-de-enf | 10 | 40.6% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-lote-04+2|S | 9 | 43.2% | S2 | sem_manifest_documentado |
| cuidados-na-administracao-de-medicamentos-repair-lote-02↔pro | 9 | 45.8% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-e-manejo-de | 9 | 48.4% | S2 | sem_manifest_documentado |
| calculo-de-administracao-de-medicamentos-e-infusoes-completo | 8 | 50.7% | S1 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-lote-05+2|S | 7 | 52.7% | S2 | sem_manifest_documentado |
| infeccoes-sexualmente-transmissiveis-ists-repair-lote-01↔pro | 6 | 54.5% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔processo-de-enfermage | 5 | 55.9% | S1 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-e-manejo-de | 5 | 57.3% | S2 | sem_manifest_documentado |
| puncao-titulo-cleanup-20↔seguranca-do-paciente-completo+1|S2 | 5 | 58.8% | S2 | sem_manifest_documentado |
| promocao-a-saude-e-prevencao-de-agravos-completo↔promocao-a- | 5 | 60.2% | S1 | sem_manifest_documentado |
| calculo-de-administracao-de-medicamentos-e-infusoes-completo | 5 | 61.7% | S1 | sem_manifest_documentado |
| promocao-a-saude-e-prevencao-de-agravos-completo↔promocao-a- | 4 | 62.8% | S1 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-e-manejo-de | 4 | 64% | S2 | sem_manifest_documentado |
| cuidados-na-administracao-de-medicamentos-completo↔cuidados- | 3 | 64.8% | S2 | sem_manifest_documentado |
| coleta-de-exames-laboratoriais-repair-lote-01↔processo-de-en | 3 | 65.7% | S2 | sem_manifest_documentado |
| processo-de-enfermagem-completo↔processo-de-enfermagem-lote- | 3 | 66.6% | S2 | sem_manifest_documentado |
| processo-de-enfermagem-completo↔processo-de-enfermagem-lote- | 3 | 67.4% | S2 | sem_manifest_documentado |

## Campos divergentes mais frequentes

| field | count | kind |
|-------|------:|------|
| meta.subtopico | 168 | pedagogical |
| reverse_study_slides[0].meta.subtopico | 168 | visual_only |
| reverse_study_slides[1].meta.subtopico | 168 | visual_only |
| reverse_study_slides[2].meta.subtopico | 168 | visual_only |
| reverse_study_slides[3].meta.subtopico | 161 | visual_only |
| reverse_study_slides[0].footer_rule | 101 | visual_only |
| reverse_study_slides[0].items.length | 97 | pedagogical |
| reverse_study_slides[3].content | 95 | pedagogical |
| reverse_study_slides[1].steps[1] | 91 | pedagogical |
| reverse_study_slides[2].content | 86 | pedagogical |
| reverse_study_slides[2].footer_rule | 86 | visual_only |
| reverse_study_slides[2].subject | 81 | visual_only |
| reverse_study_slides[1].footer_rule | 52 | visual_only |
| reverse_study_slides[2].slide_title | 52 | visual_only |
| reverse_study_slides[0].slide_title | 51 | visual_only |
| reverse_study_slides[2].rows | 50 | pedagogical |
| reverse_study_slides[1].steps[8] | 46 | pedagogical |
| reverse_study_slides[3].footer_rule | 46 | visual_only |
| reverse_study_slides[1].steps[7] | 42 | pedagogical |
| reverse_study_slides[1].steps[2] | 41 | pedagogical |
| reverse_study_slides[1].steps[5] | 41 | pedagogical |
| reverse_study_slides[1].slide_title | 40 | visual_only |
| reverse_study_slides[1].steps[3] | 40 | pedagogical |
| reverse_study_slides[1].steps[0] | 39 | pedagogical |
| reverse_study_slides[3].chip_label | 39 | visual_only |

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

Decisões de contrato estimadas (mínimo): **111** (uma por cluster).

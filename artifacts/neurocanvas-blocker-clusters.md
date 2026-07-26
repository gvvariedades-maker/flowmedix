# NeuroCanvas — clusters de blockers (baseline determinística)

Gerado em: 2026-07-26T08:13:24.284Z

Blockers: **676** · Clusters: **301**

## Partição exaustiva de slugs

| Categoria | Count |
|-----------|------:|
| singleton_disk | 1991 |
| duplicate_byte_identical | 94 |
| duplicate_semantic_identical | 131 |
| duplicate_divergent_resolved | 2759 |
| duplicate_divergent_unresolved | 676 |
| duplicate_invalid | 0 |
| other | 0 |

**Reconciliação:** 4975 + 676 + 0 = 5651

Partição exaustiva: baseline + unresolved + invalid = slugs em disco. Contagem 4.974 era execução anterior (pré-correção BOM UTF-8); atual: 4.975.

**Grupos divergentes:** 3435 = 2759 resolvidos + 676 unresolved

Relatório anterior citava 2.758 resolvidos; reexecução: 2.759. Total 3.435 = 2.759 + 676 (sem grupo omitido).

## Severidade S0–S4

- **S0**: 0
- **S1**: 255
- **S2**: 346
- **S3**: 75
- **S4**: 0

Divergência de gabarito detectada: **sim**

## Top clusters (cobertura acumulada)

| cluster_id | count | cum% | severity | evidence |
|------------|------:|-----:|----------|----------|
| coleta-lote-01↔exames-laboratoriais-lote-01|S1|ev=none | 34 | 5% | S1 | sem_manifest_documentado |
| coleta-lote-01↔exames-complementares-lote-01+1|S1|ev=none | 20 | 8% | S1 | sem_manifest_documentado |
| biosseg-itu-scan↔infeccoes-biosseguranca-completo+1|S2|ev=no | 18 | 10.7% | S2 | sem_manifest_documentado |
| coleta-lote-01↔exames-complementares-lote-01|S1|ev=none | 15 | 12.9% | S1 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-lote-06+1|S | 15 | 15.1% | S2 | sem_manifest_documentado |
| coleta-lote-01↔exames-laboratoriais-lote-02|S1|ev=none | 14 | 17.2% | S1 | sem_manifest_documentado |
| nutricao-aplicada-a-enfermagem-lote-01↔taxonomy-agent-pendin | 13 | 19.1% | S1 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-lote-02+2|S | 10 | 20.6% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-lote-04+1|S | 9 | 21.9% | S2 | sem_manifest_documentado |
| coleta-lote-01↔exames-laboratoriais-lote-01+1|S1|ev=none | 9 | 23.2% | S1 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-lote-02↔curativos-lote-05|S2|e | 9 | 24.6% | S2 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-lote-03↔curativos-lote-06|S2|e | 9 | 25.9% | S2 | sem_manifest_documentado |
| calculo-de-administracao-de-medicamentos-e-infusoes-completo | 8 | 27.1% | S1 | sem_manifest_documentado |
| calculo-de-administracao-de-medicamentos-e-infusoes-completo | 8 | 28.3% | S1 | sem_manifest_documentado |
| curativos-e-manejo-de-feridas-completo↔curativos-lote-05+1|S | 8 | 29.4% | S2 | sem_manifest_documentado |
| puncao-builder-lote-04↔puncao-venosa-e-cuidados-com-catetere | 7 | 30.5% | S3 | sem_manifest_documentado |
| nocoes-de-fisiologia-lote-01↔sinais-vitais-completo+1|S2|ev= | 6 | 31.4% | S2 | sem_manifest_documentado |
| puncao-builder-lote-04↔puncao-venosa-e-cuidados-com-catetere | 6 | 32.2% | S3 | sem_manifest_documentado |
| dtrans-mescladas-g01↔outras-doencas-e-questoes-mescladas-tra | 6 | 33.1% | S2 | sem_manifest_documentado |
| puncao-builder-lote-04↔puncao-venosa-e-cuidados-com-catetere | 6 | 34% | S3 | sem_manifest_documentado |
| nocoes-de-fisiologia-lote-01↔taxonomy-agent-deep+1|S1|ev=non | 6 | 34.9% | S1 | sem_manifest_documentado |
| oxigenoterapia-e-cuidados-respiratorios-lote-03↔sinais-vitai | 6 | 35.8% | S2 | sem_manifest_documentado |
| puncao-builder-lote-04↔puncao-builder-pilot+3|S2|ev=none | 5 | 36.5% | S2 | sem_manifest_documentado |
| puncao-titulo-cleanup-20↔seguranca-do-paciente-lote-01|S2|ev | 5 | 37.3% | S2 | sem_manifest_documentado |
| puncao-builder-lote-04↔puncao-venosa-e-cuidados-com-catetere | 5 | 38% | S3 | sem_manifest_documentado |

## Campos divergentes mais frequentes

| field | count | kind |
|-------|------:|------|
| meta.subtopico | 427 | pedagogical |
| reverse_study_slides[0].meta.subtopico | 427 | visual_only |
| reverse_study_slides[1].meta.subtopico | 427 | visual_only |
| reverse_study_slides[2].meta.subtopico | 427 | visual_only |
| reverse_study_slides[3].meta.subtopico | 419 | visual_only |
| reverse_study_slides[0].footer_rule | 328 | visual_only |
| reverse_study_slides[3].content | 319 | pedagogical |
| reverse_study_slides[0].items.length | 316 | pedagogical |
| reverse_study_slides[2].content | 313 | pedagogical |
| reverse_study_slides[2].footer_rule | 313 | visual_only |
| reverse_study_slides[1].footer_rule | 272 | visual_only |
| reverse_study_slides[0].slide_title | 271 | visual_only |
| reverse_study_slides[2].slide_title | 263 | visual_only |
| reverse_study_slides[3].footer_rule | 261 | visual_only |
| reverse_study_slides[1].slide_title | 216 | visual_only |
| reverse_study_slides[2].subject | 213 | visual_only |
| reverse_study_slides[3].chip_label | 212 | visual_only |
| reverse_study_slides[1].steps[1] | 195 | pedagogical |
| reverse_study_slides[0].chip_label | 186 | visual_only |
| reverse_study_slides[3].slide_title | 184 | visual_only |
| reverse_study_slides[3].items.length | 168 | pedagogical |
| reverse_study_slides[2].rows | 141 | pedagogical |
| reverse_study_slides[1].steps.length | 132 | pedagogical |
| reverse_study_slides[2].rows.length | 120 | pedagogical |
| reverse_study_slides[1].steps[3] | 115 | pedagogical |

## Potencial de resolução por contrato

| cluster | slugs | risco | contrato necessário |
|---------|------:|-------|---------------------|
| coleta-lote-01↔exames-laboratoriais-lote | 34 | low | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| coleta-lote-01↔exames-complementares-lot | 20 | low | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| biosseg-itu-scan↔infeccoes-biosseguranca | 18 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| coleta-lote-01↔exames-complementares-lot | 15 | low | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| curativos-e-manejo-de-feridas-completo↔c | 15 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| coleta-lote-01↔exames-laboratoriais-lote | 14 | low | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| nutricao-aplicada-a-enfermagem-lote-01↔t | 13 | low | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| curativos-e-manejo-de-feridas-completo↔c | 10 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| curativos-e-manejo-de-feridas-completo↔c | 9 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| coleta-lote-01↔exames-laboratoriais-lote | 9 | low | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| curativos-e-manejo-de-feridas-lote-02↔cu | 9 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| curativos-e-manejo-de-feridas-lote-03↔cu | 9 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| calculo-de-administracao-de-medicamentos | 8 | low | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| calculo-de-administracao-de-medicamentos | 8 | low | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |
| curativos-e-manejo-de-feridas-completo↔c | 8 | medium | Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook |

Decisões de contrato estimadas (mínimo): **301** (uma por cluster).

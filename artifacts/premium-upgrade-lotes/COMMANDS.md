# Lotes premium — repair (Supabase)

Gerado em: 2026-06-20T11:54:54.683Z

Total: **1450** questões → **57** lotes (até 50 slugs/lote)

## Fluxo por lote

```bash
npm run catalog:export-lote -- --lote=<lote> --from-manifest=artifacts/premium-upgrade-lotes/<prefix>/repair-lote-NN-manifest.json
npm run catalog:upgrade-premium -- --lote=<lote> --write --force
npm run catalog:apply-lote -- --lote=<lote> --apply
```

## Quick wins (builder dedicado)

### Urgências e Emergências — `urgencias-e-emergencias-repair-lote-01` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=urgencias-e-emergencias-repair-lote-01 --from-manifest=artifacts/premium-upgrade-lotes/urgencias-e-emergencias/repair-lote-01-manifest.json
npm run catalog:upgrade-premium -- --lote=urgencias-e-emergencias-repair-lote-01 --write --force
npm run catalog:apply-lote -- --lote=urgencias-e-emergencias-repair-lote-01 --apply
```

### Urgências e Emergências — `urgencias-e-emergencias-repair-lote-02` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=urgencias-e-emergencias-repair-lote-02 --from-manifest=artifacts/premium-upgrade-lotes/urgencias-e-emergencias/repair-lote-02-manifest.json
npm run catalog:upgrade-premium -- --lote=urgencias-e-emergencias-repair-lote-02 --write --force
npm run catalog:apply-lote -- --lote=urgencias-e-emergencias-repair-lote-02 --apply
```

### Urgências e Emergências — `urgencias-e-emergencias-repair-lote-03` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=urgencias-e-emergencias-repair-lote-03 --from-manifest=artifacts/premium-upgrade-lotes/urgencias-e-emergencias/repair-lote-03-manifest.json
npm run catalog:upgrade-premium -- --lote=urgencias-e-emergencias-repair-lote-03 --write --force
npm run catalog:apply-lote -- --lote=urgencias-e-emergencias-repair-lote-03 --apply
```

### Urgências e Emergências — `urgencias-e-emergencias-repair-lote-04` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=urgencias-e-emergencias-repair-lote-04 --from-manifest=artifacts/premium-upgrade-lotes/urgencias-e-emergencias/repair-lote-04-manifest.json
npm run catalog:upgrade-premium -- --lote=urgencias-e-emergencias-repair-lote-04 --write --force
npm run catalog:apply-lote -- --lote=urgencias-e-emergencias-repair-lote-04 --apply
```

### Urgências e Emergências — `urgencias-e-emergencias-repair-lote-05` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=urgencias-e-emergencias-repair-lote-05 --from-manifest=artifacts/premium-upgrade-lotes/urgencias-e-emergencias/repair-lote-05-manifest.json
npm run catalog:upgrade-premium -- --lote=urgencias-e-emergencias-repair-lote-05 --write --force
npm run catalog:apply-lote -- --lote=urgencias-e-emergencias-repair-lote-05 --apply
```

### Urgências e Emergências — `urgencias-e-emergencias-repair-lote-06` (6 slugs)

```bash
npm run catalog:export-lote -- --lote=urgencias-e-emergencias-repair-lote-06 --from-manifest=artifacts/premium-upgrade-lotes/urgencias-e-emergencias/repair-lote-06-manifest.json
npm run catalog:upgrade-premium -- --lote=urgencias-e-emergencias-repair-lote-06 --write --force
npm run catalog:apply-lote -- --lote=urgencias-e-emergencias-repair-lote-06 --apply
```

### Oxigenoterapia e Cuidados Respiratórios — `oxigenoterapia-e-cuidados-respiratorios-repair-lote-01` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=oxigenoterapia-e-cuidados-respiratorios-repair-lote-01 --from-manifest=artifacts/premium-upgrade-lotes/oxigenoterapia-e-cuidados-respiratorios/repair-lote-01-manifest.json
npm run catalog:upgrade-premium -- --lote=oxigenoterapia-e-cuidados-respiratorios-repair-lote-01 --write --force
npm run catalog:apply-lote -- --lote=oxigenoterapia-e-cuidados-respiratorios-repair-lote-01 --apply
```

### Oxigenoterapia e Cuidados Respiratórios — `oxigenoterapia-e-cuidados-respiratorios-repair-lote-02` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=oxigenoterapia-e-cuidados-respiratorios-repair-lote-02 --from-manifest=artifacts/premium-upgrade-lotes/oxigenoterapia-e-cuidados-respiratorios/repair-lote-02-manifest.json
npm run catalog:upgrade-premium -- --lote=oxigenoterapia-e-cuidados-respiratorios-repair-lote-02 --write --force
npm run catalog:apply-lote -- --lote=oxigenoterapia-e-cuidados-respiratorios-repair-lote-02 --apply
```

### Oxigenoterapia e Cuidados Respiratórios — `oxigenoterapia-e-cuidados-respiratorios-repair-lote-03` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=oxigenoterapia-e-cuidados-respiratorios-repair-lote-03 --from-manifest=artifacts/premium-upgrade-lotes/oxigenoterapia-e-cuidados-respiratorios/repair-lote-03-manifest.json
npm run catalog:upgrade-premium -- --lote=oxigenoterapia-e-cuidados-respiratorios-repair-lote-03 --write --force
npm run catalog:apply-lote -- --lote=oxigenoterapia-e-cuidados-respiratorios-repair-lote-03 --apply
```

### Oxigenoterapia e Cuidados Respiratórios — `oxigenoterapia-e-cuidados-respiratorios-repair-lote-04` (5 slugs)

```bash
npm run catalog:export-lote -- --lote=oxigenoterapia-e-cuidados-respiratorios-repair-lote-04 --from-manifest=artifacts/premium-upgrade-lotes/oxigenoterapia-e-cuidados-respiratorios/repair-lote-04-manifest.json
npm run catalog:upgrade-premium -- --lote=oxigenoterapia-e-cuidados-respiratorios-repair-lote-04 --write --force
npm run catalog:apply-lote -- --lote=oxigenoterapia-e-cuidados-respiratorios-repair-lote-04 --apply
```

### Processo de Enfermagem — `processo-de-enfermagem-repair-lote-01` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=processo-de-enfermagem-repair-lote-01 --from-manifest=artifacts/premium-upgrade-lotes/processo-de-enfermagem/repair-lote-01-manifest.json
npm run catalog:upgrade-premium -- --lote=processo-de-enfermagem-repair-lote-01 --write --force
npm run catalog:apply-lote -- --lote=processo-de-enfermagem-repair-lote-01 --apply
```

### Processo de Enfermagem — `processo-de-enfermagem-repair-lote-02` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=processo-de-enfermagem-repair-lote-02 --from-manifest=artifacts/premium-upgrade-lotes/processo-de-enfermagem/repair-lote-02-manifest.json
npm run catalog:upgrade-premium -- --lote=processo-de-enfermagem-repair-lote-02 --write --force
npm run catalog:apply-lote -- --lote=processo-de-enfermagem-repair-lote-02 --apply
```

### Processo de Enfermagem — `processo-de-enfermagem-repair-lote-03` (17 slugs)

```bash
npm run catalog:export-lote -- --lote=processo-de-enfermagem-repair-lote-03 --from-manifest=artifacts/premium-upgrade-lotes/processo-de-enfermagem/repair-lote-03-manifest.json
npm run catalog:upgrade-premium -- --lote=processo-de-enfermagem-repair-lote-03 --write --force
npm run catalog:apply-lote -- --lote=processo-de-enfermagem-repair-lote-03 --apply
```

### Verificação de Sinais Vitais — `verificacao-de-sinais-vitais-repair-lote-01` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=verificacao-de-sinais-vitais-repair-lote-01 --from-manifest=artifacts/premium-upgrade-lotes/verificacao-de-sinais-vitais/repair-lote-01-manifest.json
npm run catalog:upgrade-premium -- --lote=verificacao-de-sinais-vitais-repair-lote-01 --write --force
npm run catalog:apply-lote -- --lote=verificacao-de-sinais-vitais-repair-lote-01 --apply
```

### Verificação de Sinais Vitais — `verificacao-de-sinais-vitais-repair-lote-02` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=verificacao-de-sinais-vitais-repair-lote-02 --from-manifest=artifacts/premium-upgrade-lotes/verificacao-de-sinais-vitais/repair-lote-02-manifest.json
npm run catalog:upgrade-premium -- --lote=verificacao-de-sinais-vitais-repair-lote-02 --write --force
npm run catalog:apply-lote -- --lote=verificacao-de-sinais-vitais-repair-lote-02 --apply
```

### Verificação de Sinais Vitais — `verificacao-de-sinais-vitais-repair-lote-03` (13 slugs)

```bash
npm run catalog:export-lote -- --lote=verificacao-de-sinais-vitais-repair-lote-03 --from-manifest=artifacts/premium-upgrade-lotes/verificacao-de-sinais-vitais/repair-lote-03-manifest.json
npm run catalog:upgrade-premium -- --lote=verificacao-de-sinais-vitais-repair-lote-03 --write --force
npm run catalog:apply-lote -- --lote=verificacao-de-sinais-vitais-repair-lote-03 --apply
```

### Cálculo de Administração de Medicamentos e Infusões — `calculo-de-administracao-de-medicamentos-e-infusoes-repair-lote-01` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-repair-lote-01 --from-manifest=artifacts/premium-upgrade-lotes/calculo-de-administracao-de-medicamentos-e-infusoes/repair-lote-01-manifest.json
npm run catalog:upgrade-premium -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-repair-lote-01 --write --force
npm run catalog:apply-lote -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-repair-lote-01 --apply
```

### Cálculo de Administração de Medicamentos e Infusões — `calculo-de-administracao-de-medicamentos-e-infusoes-repair-lote-02` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-repair-lote-02 --from-manifest=artifacts/premium-upgrade-lotes/calculo-de-administracao-de-medicamentos-e-infusoes/repair-lote-02-manifest.json
npm run catalog:upgrade-premium -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-repair-lote-02 --write --force
npm run catalog:apply-lote -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-repair-lote-02 --apply
```

### Cálculo de Administração de Medicamentos e Infusões — `calculo-de-administracao-de-medicamentos-e-infusoes-repair-lote-03` (9 slugs)

```bash
npm run catalog:export-lote -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-repair-lote-03 --from-manifest=artifacts/premium-upgrade-lotes/calculo-de-administracao-de-medicamentos-e-infusoes/repair-lote-03-manifest.json
npm run catalog:upgrade-premium -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-repair-lote-03 --write --force
npm run catalog:apply-lote -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-repair-lote-03 --apply
```

### Imunização — `imunizacao-repair-lote-01` (50 slugs)

```bash
npm run catalog:export-lote -- --lote=imunizacao-repair-lote-01 --from-manifest=artifacts/premium-upgrade-lotes/imunizacao/repair-lote-01-manifest.json
npm run catalog:upgrade-premium -- --lote=imunizacao-repair-lote-01 --write --force
npm run catalog:apply-lote -- --lote=imunizacao-repair-lote-01 --apply
```

### Imunização — `imunizacao-repair-lote-02` (25 slugs)

```bash
npm run catalog:export-lote -- --lote=imunizacao-repair-lote-02 --from-manifest=artifacts/premium-upgrade-lotes/imunizacao/repair-lote-02-manifest.json
npm run catalog:upgrade-premium -- --lote=imunizacao-repair-lote-02 --write --force
npm run catalog:apply-lote -- --lote=imunizacao-repair-lote-02 --apply
```

### Vias de Administração — `vias-de-administracao-repair-lote-01` (22 slugs)

```bash
npm run catalog:export-lote -- --lote=vias-de-administracao-repair-lote-01 --from-manifest=artifacts/premium-upgrade-lotes/vias-de-administracao/repair-lote-01-manifest.json
npm run catalog:upgrade-premium -- --lote=vias-de-administracao-repair-lote-01 --write --force
npm run catalog:apply-lote -- --lote=vias-de-administracao-repair-lote-01 --apply
```

### Infecções Sexualmente Transmissíveis (ISTs) — `infeccoes-sexualmente-transmissiveis-ists-repair-lote-01` (20 slugs)

```bash
npm run catalog:export-lote -- --lote=infeccoes-sexualmente-transmissiveis-ists-repair-lote-01 --from-manifest=artifacts/premium-upgrade-lotes/infeccoes-sexualmente-transmissiveis-ists/repair-lote-01-manifest.json
npm run catalog:upgrade-premium -- --lote=infeccoes-sexualmente-transmissiveis-ists-repair-lote-01 --write --force
npm run catalog:apply-lote -- --lote=infeccoes-sexualmente-transmissiveis-ists-repair-lote-01 --apply
```

### Instalação e Manejo de Sondas — `instalacao-e-manejo-de-sondas-repair-lote-01` (19 slugs)

```bash
npm run catalog:export-lote -- --lote=instalacao-e-manejo-de-sondas-repair-lote-01 --from-manifest=artifacts/premium-upgrade-lotes/instalacao-e-manejo-de-sondas/repair-lote-01-manifest.json
npm run catalog:upgrade-premium -- --lote=instalacao-e-manejo-de-sondas-repair-lote-01 --write --force
npm run catalog:apply-lote -- --lote=instalacao-e-manejo-de-sondas-repair-lote-01 --apply
```

### Curativos e Manejo de Feridas — `curativos-e-manejo-de-feridas-repair-lote-01` (13 slugs)

```bash
npm run catalog:export-lote -- --lote=curativos-e-manejo-de-feridas-repair-lote-01 --from-manifest=artifacts/premium-upgrade-lotes/curativos-e-manejo-de-feridas/repair-lote-01-manifest.json
npm run catalog:upgrade-premium -- --lote=curativos-e-manejo-de-feridas-repair-lote-01 --write --force
npm run catalog:apply-lote -- --lote=curativos-e-manejo-de-feridas-repair-lote-01 --apply
```

### Coleta de Exames Laboratoriais — `coleta-de-exames-laboratoriais-repair-lote-01` (11 slugs)

```bash
npm run catalog:export-lote -- --lote=coleta-de-exames-laboratoriais-repair-lote-01 --from-manifest=artifacts/premium-upgrade-lotes/coleta-de-exames-laboratoriais/repair-lote-01-manifest.json
npm run catalog:upgrade-premium -- --lote=coleta-de-exames-laboratoriais-repair-lote-01 --write --force
npm run catalog:apply-lote -- --lote=coleta-de-exames-laboratoriais-repair-lote-01 --apply
```

### Punção Venosa e Cuidados com Cateteres — `puncao-venosa-e-cuidados-com-cateteres-repair-lote-01` (1 slugs)

```bash
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-repair-lote-01 --from-manifest=artifacts/premium-upgrade-lotes/puncao-venosa-e-cuidados-com-cateteres/repair-lote-01-manifest.json
npm run catalog:upgrade-premium -- --lote=puncao-venosa-e-cuidados-com-cateteres-repair-lote-01 --write --force
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-repair-lote-01 --apply
```

## Todos os subtópicos

| Subtópico | Slugs | Lotes | Builder |
|-----------|------:|------:|---------|
| Urgências e Emergências | 256 | 6 | upgradePremiumUrgencias |
| Oxigenoterapia e Cuidados Respiratórios | 155 | 4 | upgradePremiumOxigenoterapia |
| Processo de Enfermagem | 117 | 3 | upgradePremiumSae |
| Verificação de Sinais Vitais | 113 | 3 | upgradePremiumSinais |
| Cálculo de Administração de Medicamentos e Infusões | 109 | 3 | upgradePremiumCalculo |
| Imunização | 75 | 2 | upgradePremiumImunizacao |
| Cuidados na Administração de Medicamentos | 66 | 2 | — |
| Saúde da Mulher | 46 | 1 | — |
| Mobilização e Posicionamento do Paciente | 45 | 1 | — |
| Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis | 39 | 1 | — |
| Medidas de Prevenção e Precaução de Contato | 38 | 1 | — |
| Atenção Básica / Saúde da Família | 25 | 1 | — |
| Saúde da Criança | 23 | 1 | — |
| Segurança do Paciente | 23 | 1 | — |
| Vias de Administração | 22 | 1 | upgradePremiumVias |
| Procedimentos Diversos | 22 | 1 | — |
| Enfermagem em Central de Material e Esterilização (CME) | 21 | 1 | — |
| Infecções Sexualmente Transmissíveis (ISTs) | 20 | 1 | upgradePremiumIsts |
| Instalação e Manejo de Sondas | 19 | 1 | upgradePremiumSondas |
| Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.) | 17 | 1 | — |
| Epidemiologia e Vigilância Epidemiológica | 17 | 1 | — |
| Promoção à Saúde e Prevenção de Agravos | 15 | 1 | — |
| Enfermagem do Trabalho | 15 | 1 | — |
| Infecções no Contexto da Biossegurança | 14 | 1 | — |
| Saúde Mental | 13 | 1 | — |
| Noções de Fisiologia | 13 | 1 | — |
| Curativos e Manejo de Feridas | 13 | 1 | upgradePremiumCurativos |
| Assistência Perioperatória (Inclui SRPA) | 12 | 1 | — |
| Doenças Parasitárias e Zoonoses | 12 | 1 | — |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | 11 | 1 | — |
| Coleta de Exames Laboratoriais | 11 | 1 | upgradePremiumColeta |
| Farmacodinâmica e Farmacocinética | 11 | 1 | — |
| Processamento de Artigos e Produtos de Saúde | 10 | 1 | — |
| Feridas e Queimaduras | 10 | 1 | — |
| Doenças Respiratórias Crônicas (Asma, DPOC) | 6 | 1 | — |
| Enfermagem em Centro Cirúrgico | 5 | 1 | — |
| Noções de Anatomia | 5 | 1 | — |
| Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis | 3 | 1 | — |
| Punção Venosa e Cuidados com Cateteres | 1 | 1 | upgradePremiumPuncao |
| Saúde do Adolescente | 1 | 1 | — |
| História da Enfermagem | 1 | 1 | — |
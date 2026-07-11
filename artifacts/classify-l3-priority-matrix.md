# Matriz Classify × L3 — 41 subtópicos

Gerado em: 2026-07-08T18:27:24.846Z

## Resumo executivo

| Métrica | Valor |
|---------|-------|
| Slugs na vitrine (soma titulo_aula) | 5178 |
| Catch-all (titulo_aula em bucket catch-all) | 116 |
| Classify **obrigatório** antes de L3 | 1 subtópicos |
| Classify **recomendado** (drenar mis-tags) | 1 subtópicos |
| production_ready | 15/41 |
| Sem pacote no registry | 24 |
| Com registry mas sem cluster_report | 6 |
| Prateleiras vazias (0 slugs) | 3 |

## Catch-all buckets com slugs (Classify prioritário)

| Subtópico | Slugs catch-all | Classify | Motivo |
|-----------|-----------------|----------|--------|
| Processo de Enfermagem | 51 | obrigatorio | 51 slugs em bucket catch-all — inferir para subtópico específico antes de L3/handcraft |
| Segurança do Paciente | 64 | recomendado | 64 slugs ainda no rótulo catch-all — drenar mis-tags antes de escalar handcraft |

## Matriz completa (41 subtópicos)

| Subtópico | Slugs | Onda | Status | %HC | Classify | L3 map | Cluster | Briefs | Próximo trigger |
|-----------|-------|------|--------|-----|----------|--------|---------|--------|-----------------|
| História da Enfermagem | 20 | done | production_ready | 100% | nao | não | não | 0 | audit:subtopico-health (ou repair Slug:) |
| Noções de Anatomia | 124 | B | none | — | nao | não | não | 0 | Mapeamento L3: Noções de Anatomia → Pipeline completo: Noções de Anatomia |
| Noções de Fisiologia | 113 | B | none | — | nao | não | não | 0 | Mapeamento L3: Noções de Fisiologia → Pipeline completo: Noções de Fisiologia |
| Processo de Enfermagem | 51 | A | none | — | obrigatorio | não | não | 0 | Classify: Processo de Enfermagem → Mapeamento L3: Processo de Enfermagem |
| Farmacodinâmica e Farmacocinética | 13 | done | production_ready | 100% | nao | sim | sim | 1 | audit:subtopico-health (ou repair Slug:) |
| Cálculo de Administração de Medicamentos e Infusões | 122 | B | none | — | nao | sim | não | 0 | Mapeamento L3: Cálculo de Administração de Medicamentos e Infusões → Pipeline completo: Cálculo de Administração de Medicamentos e Infusões |
| Vias de Administração | 208 | done | production_ready | 100% | nao | sim | sim | 1 | audit:subtopico-health (ou repair Slug:) |
| Cuidados na Administração de Medicamentos | 246 | B | none | — | nao | não | não | 0 | Mapeamento L3: Cuidados na Administração de Medicamentos → Pipeline completo: Cuidados na Administração de Medicamentos |
| Verificação de Sinais Vitais | 507 | done | production_ready | 100% | nao | não | sim | 3 | audit:subtopico-health (ou repair Slug:) |
| Instalação e Manejo de Sondas | 181 | B | none | — | nao | sim | não | 0 | Mapeamento L3: Instalação e Manejo de Sondas → Pipeline completo: Instalação e Manejo de Sondas |
| Oxigenoterapia e Cuidados Respiratórios | 184 | B | none | — | nao | não | não | 0 | Mapeamento L3: Oxigenoterapia e Cuidados Respiratórios → Pipeline completo: Oxigenoterapia e Cuidados Respiratórios |
| Curativos e Manejo de Feridas | 140 | A | none | — | nao | não | não | 0 | Mapeamento L3: Curativos e Manejo de Feridas → Pipeline completo: Curativos e Manejo de Feridas |
| Punção Venosa e Cuidados com Cateteres | 132 | A | none | — | nao | não | não | 0 | Mapeamento L3: Punção Venosa e Cuidados com Cateteres → Pipeline completo: Punção Venosa e Cuidados com Cateteres |
| Coleta de Exames Laboratoriais | 190 | B | none | — | nao | não | não | 0 | Mapeamento L3: Coleta de Exames Laboratoriais → Pipeline completo: Coleta de Exames Laboratoriais |
| Mobilização e Posicionamento do Paciente | 124 | B | none | — | nao | não | não | 0 | Mapeamento L3: Mobilização e Posicionamento do Paciente → Pipeline completo: Mobilização e Posicionamento do Paciente |
| Procedimentos Diversos | 0 | C | none | — | nao | não | não | 0 | Mapeamento L3: Procedimentos Diversos → Pipeline completo: Procedimentos Diversos |
| Feridas e Queimaduras | 27 | done | production_ready | 100% | nao | não | não | 0 | audit:subtopico-health (ou repair Slug:) |
| Processamento de Artigos e Produtos de Saúde | 18 | done | production_ready | 100% | nao | não | não | 0 | audit:subtopico-health (ou repair Slug:) |
| Enfermagem em Central de Material e Esterilização (CME) | 35 | done | production_ready | 100% | nao | sim | sim | 0 | audit:subtopico-health (ou repair Slug:) |
| Medidas de Prevenção e Precaução de Contato | 79 | B | none | — | nao | não | não | 0 | Mapeamento L3: Medidas de Prevenção e Precaução de Contato → Pipeline completo: Medidas de Prevenção e Precaução de Contato |
| Infecções no Contexto da Biossegurança | 55 | done | production_ready | 100% | nao | sim | não | 0 | audit:subtopico-health (ou repair Slug:) |
| Segurança do Paciente | 64 | done | production_ready | 100% | recomendado | sim | sim | 0 | audit:subtopico-health (ou repair Slug:) |
| Epidemiologia e Vigilância Epidemiológica | 231 | B | none | — | nao | não | não | 0 | Mapeamento L3: Epidemiologia e Vigilância Epidemiológica → Pipeline completo: Epidemiologia e Vigilância Epidemiológica |
| Promoção à Saúde e Prevenção de Agravos | 176 | B | none | — | nao | não | não | 0 | Mapeamento L3: Promoção à Saúde e Prevenção de Agravos → Pipeline completo: Promoção à Saúde e Prevenção de Agravos |
| Imunização | 575 | A | none | 10.3% | nao | sim | sim | 3 | Mapeamento L3: Imunização (se briefs incompletos) → Pipeline completo: Imunização |
| Atenção Básica / Saúde da Família | 173 | B | none | — | nao | não | não | 0 | Mapeamento L3: Atenção Básica / Saúde da Família → Pipeline completo: Atenção Básica / Saúde da Família |
| Infecções Sexualmente Transmissíveis (ISTs) | 158 | B | none | — | nao | não | não | 0 | Mapeamento L3: Infecções Sexualmente Transmissíveis (ISTs) → Pipeline completo: Infecções Sexualmente Transmissíveis (ISTs) |
| Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.) | 133 | B | none | — | nao | não | não | 0 | Mapeamento L3: Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.) → Pipeline completo: Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.) |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | 51 | done | production_ready | 100% | nao | sim | sim | 0 | audit:subtopico-health (ou repair Slug:) |
| Doenças Parasitárias e Zoonoses | 75 | B | none | — | nao | não | não | 0 | Mapeamento L3: Doenças Parasitárias e Zoonoses → Pipeline completo: Doenças Parasitárias e Zoonoses |
| Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis | 0 | B | none | — | nao | não | não | 0 | Mapeamento L3: Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis → Pipeline completo: Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis |
| Questões Mescladas e Outras Doenças Agudas | 0 | B | none | — | nao | não | não | 0 | Mapeamento L3: Questões Mescladas e Outras Doenças Agudas → Pipeline completo: Questões Mescladas e Outras Doenças Agudas |
| Doenças Respiratórias Crônicas (Asma, DPOC) | 10 | done | production_ready | 100% | nao | sim | sim | 1 | audit:subtopico-health (ou repair Slug:) |
| Assistência Perioperatória (Inclui SRPA) | 68 | done | production_ready | 100% | nao | sim | sim | 0 | audit:subtopico-health (ou repair Slug:) |
| Enfermagem em Centro Cirúrgico | 123 | B | none | — | nao | não | não | 0 | Mapeamento L3: Enfermagem em Centro Cirúrgico → Pipeline completo: Enfermagem em Centro Cirúrgico |
| Urgências e Emergências | 340 | A | none | 27.4% | nao | sim | sim | 4 | Mapeamento L3: Urgências e Emergências (se briefs incompletos) → Pipeline completo: Urgências e Emergências |
| Enfermagem do Trabalho | 33 | done | production_ready | 100% | nao | não | não | 0 | audit:subtopico-health (ou repair Slug:) |
| Saúde Mental | 37 | done | production_ready | 100% | nao | sim | sim | 0 | audit:subtopico-health (ou repair Slug:) |
| Saúde da Criança | 82 | B | none | — | nao | não | não | 0 | Mapeamento L3: Saúde da Criança → Pipeline completo: Saúde da Criança |
| Saúde do Adolescente | 16 | done | production_ready | 100% | nao | sim | não | 0 | audit:subtopico-health (ou repair Slug:) |
| Saúde da Mulher | 263 | B | none | — | nao | não | não | 0 | Mapeamento L3: Saúde da Mulher → Pipeline completo: Saúde da Mulher |

## Ordem sugerida (próximos 10)

1. **Processo de Enfermagem** (51 slugs) — Classify: Processo de Enfermagem → Mapeamento L3: Processo de Enfermagem
2. **Imunização** (575 slugs) — Mapeamento L3: Imunização (se briefs incompletos) → Pipeline completo: Imunização
3. **Urgências e Emergências** (340 slugs) — Mapeamento L3: Urgências e Emergências (se briefs incompletos) → Pipeline completo: Urgências e Emergências
4. **Saúde da Mulher** (263 slugs) — Mapeamento L3: Saúde da Mulher → Pipeline completo: Saúde da Mulher
5. **Cuidados na Administração de Medicamentos** (246 slugs) — Mapeamento L3: Cuidados na Administração de Medicamentos → Pipeline completo: Cuidados na Administração de Medicamentos
6. **Epidemiologia e Vigilância Epidemiológica** (231 slugs) — Mapeamento L3: Epidemiologia e Vigilância Epidemiológica → Pipeline completo: Epidemiologia e Vigilância Epidemiológica
7. **Coleta de Exames Laboratoriais** (190 slugs) — Mapeamento L3: Coleta de Exames Laboratoriais → Pipeline completo: Coleta de Exames Laboratoriais
8. **Oxigenoterapia e Cuidados Respiratórios** (184 slugs) — Mapeamento L3: Oxigenoterapia e Cuidados Respiratórios → Pipeline completo: Oxigenoterapia e Cuidados Respiratórios
9. **Instalação e Manejo de Sondas** (181 slugs) — Mapeamento L3: Instalação e Manejo de Sondas → Pipeline completo: Instalação e Manejo de Sondas
10. **Promoção à Saúde e Prevenção de Agravos** (176 slugs) — Mapeamento L3: Promoção à Saúde e Prevenção de Agravos → Pipeline completo: Promoção à Saúde e Prevenção de Agravos
# NeuroCanvas — análise de duplicatas

Gerado em: 2026-07-26T07:50:27.796Z

## Resumo

| Métrica | Valor |
|---------|------:|
| Arquivos totais | 14145 |
| Slugs únicos | 5651 |
| Grupos duplicados (≥2 arquivos) | 3660 |
| Arquivos em grupos duplicados | 12154 |
| Slugs singleton | 1991 |
| Grupos byte-identical | 94 |
| Grupos semantic-identical | 131 |
| Grupos divergentes | 3435 |
| Grupos inválidos | 0 |
| Slugs divergentes (conteúdo) | 3434 |
| Slugs não resolvidos (blocker) | 676 |
| Grupos divergentes resolvidos por manifest | 2758 |

## dedupe_schema

Versão: **1**

### Campos incluídos

- meta.banca
- meta.topico
- meta.subtopico
- meta.family
- meta.pedagogical_branch
- meta.content_standard
- question_data.instruction
- question_data.text_fragment
- question_data.options[].id
- question_data.options[].text
- question_data.options[].is_correct
- reverse_study_slides (ou study_slides → normalizado)

### Campos removidos

- id
- meta.header_line
- meta.ano
- meta.orgao
- meta.prova
- meta.content_review
- meta.sources
- question_data.figures
- slide.template
- slide.layout_variant
- slide.theme_id
- slide.chip_label
- slide.slide_title
- slide.footer_rule
- slide.subject
- demais chaves meta/UI não listadas em fields_included

### Normalização

- JSON.parse do arquivo bruto
- reverse_study_slides ?? study_slides
- normalizeReverseStudySlide por slide
- sortReverseStudySlides (ordem canônica concept_map → logic_flow → golden_rule → danger_zone)
- options ordenadas por id lexicográfico
- canonicalJson (chaves lexicográficas recursivas + strings NFC)
- SHA-256 hex minúsculo

Algoritmo: `sha256_hex(utf8_bytes(canonical_json(normalizeQuestionForComparison(raw))))`

## Impacto estimado (divergentes)

| slides | 60806 campos distintos |
| meta | 5904 campos distintos |
| question_data/resolver | 660 campos distintos |

## Precedência canônica proposta

- 1. slug listado em manifest.slugs[] de lote *-completo referenciado em handcraft-registry.json.
- 2. slug listado em manifest.slugs[] de lote gNN com manifest.parent apontando para completo do registry.
- 3. slug listado em manifest.slugs[] de lote gNN com lote-meta.parent apontando para completo do registry.
- 4. Cópias byte/semantic idênticas: preferir path documentado acima; senão singleton efetivo.
- 5. Conteúdo divergente SEM evidência documentada única → não escolher; marcar unresolved.
- PROIBIDO: gNN “mais recente”, ordem lexicográfica ou heurística de filesystem como autoridade.

## Amostra divergências

### idib-enfermagem-acidente-vascular-cerebral-avc-1778934918280-1

- paths: 3
- fields: meta.subtopico, reverse_study_slides[0].meta.subtopico, reverse_study_slides[1].meta.subtopico, reverse_study_slides[2].meta.subtopico, reverse_study_slides[3].meta.subtopico

### avancasp-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103796215-3

- paths: 3
- fields: n/d

### cebraspe-cespe-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103801993-1

- paths: 3
- fields: n/d

### cebraspe-cespe-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103801993-2

- paths: 3
- fields: n/d

### cebraspe-cespe-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103801993-3

- paths: 3
- fields: n/d

### cebraspe-cespe-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103801993-4

- paths: 3
- fields: n/d

### cebraspe-cespe-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103837493-0

- paths: 3
- fields: n/d

### cetrede-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103796215-1

- paths: 3
- fields: meta.subtopico, reverse_study_slides[0].meta.subtopico, reverse_study_slides[1].meta.subtopico, reverse_study_slides[2].meta.subtopico, reverse_study_slides[3].meta.subtopico

### cogeps-unioeste-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103796215-4

- paths: 3
- fields: n/d

### cogeps-unioeste-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103920995-3

- paths: 3
- fields: n/d

### consulplan-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103789613-1

- paths: 3
- fields: n/d

### fgv-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103796215-2

- paths: 3
- fields: n/d

### furb-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103789613-7

- paths: 3
- fields: n/d

### fuvest-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103789613-6

- paths: 2
- fields: meta.subtopico, reverse_study_slides[0].meta.subtopico, reverse_study_slides[1].meta.subtopico, reverse_study_slides[2].meta.subtopico, reverse_study_slides[3].meta.subtopico

### ibade-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103789613-8

- paths: 3
- fields: n/d


## Limitações

- dedupe_schema_version: 1
- Comparação semântica conforme dedupe_schema (campos incluídos/removidos no JSON).
- Divergência sem evidência documentada única → unresolved; slug fora da baseline e da coorte.
- gNN sem manifest.parent/registry NÃO vence por recência ou ordem de filesystem.

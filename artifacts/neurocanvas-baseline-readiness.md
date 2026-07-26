# NeuroCanvas — baseline determinística e readiness (Fase 0)

Gerado em: 2026-07-26T08:17:37.256Z

## Veredito: **NOT READY**

Blockers (676):

- slug adm-tec-enfermagem-atencao-basica-saude-da-familia-1778968156152-3: slug sem cópia listada em manifest/registry/contrato documentado
- slug adm-tec-enfermagem-exames-complementares-1779563668619-6: slug sem cópia listada em manifest/registry/contrato documentado
- slug adm-tec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340191984-7: slug sem cópia listada em manifest/registry/contrato documentado
- slug agirh-enfermagem-exames-laboratoriais-1779563631609-4: slug sem cópia listada em manifest/registry/contrato documentado
- slug agirh-enfermagem-nocoes-de-anatomia-1775448514037-0: slug sem cópia listada em manifest/registry/contrato documentado
- slug amauc-enfermagem-exames-laboratoriais-1779563631609-2: slug sem cópia listada em manifest/registry/contrato documentado
- slug amauc-enfermagem-exames-laboratoriais-1779563631609-3: slug sem cópia listada em manifest/registry/contrato documentado
- slug amauc-enfermagem-processo-de-enfermagem-1780001440222-5: slug sem cópia listada em manifest/registry/contrato documentado
- slug amauc-enfermagem-processo-de-enfermagem-1780001440222-8: slug sem cópia listada em manifest/registry/contrato documentado
- slug amauc-enfermagem-processo-de-enfermagem-1780001440222-9: slug sem cópia listada em manifest/registry/contrato documentado
- slug amauc-enfermagem-processo-de-enfermagem-1780001517858-2: slug sem cópia listada em manifest/registry/contrato documentado
- slug amauc-enfermagem-processo-de-enfermagem-1780001517858-6: slug sem cópia listada em manifest/registry/contrato documentado
- slug amauc-enfermagem-processo-de-enfermagem-1780001517858-7: slug sem cópia listada em manifest/registry/contrato documentado
- slug amauc-enfermagem-processo-de-enfermagem-1780002441285-8: slug sem cópia listada em manifest/registry/contrato documentado
- slug amauc-enfermagem-processo-de-enfermagem-1780006486032-8: slug sem cópia listada em manifest/registry/contrato documentado
- slug amauc-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562693149-9: slug sem cópia listada em manifest/registry/contrato documentado
- slug amauc-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562705224-5: slug sem cópia listada em manifest/registry/contrato documentado
- slug ameosc-enfermagem-cuidados-na-administracao-de-medicamentos-1778969554207-3: slug sem cópia listada em manifest/registry/contrato documentado
- slug ameosc-enfermagem-curativos-e-manejo-de-feridas-1779340191984-6: slug sem cópia listada em manifest/registry/contrato documentado
- slug ameosc-enfermagem-curativos-e-manejo-de-feridas-1779344813448-6: slug sem cópia listada em manifest/registry/contrato documentado


## 1. Confiabilidade da baseline

- Modo seleção: **canonical**
- dedupe_schema_version: **1**
- Baseline materialmente afetada: **sim**
- Slugs na baseline resolvida: 4975 (não confundir com catálogo final)
- Duplicatas ignoradas: 8494
- Slugs com conteúdo divergente entre cópias: 3435
- Slugs não resolvidos (blocker): 676

## 2. Análise de duplicatas

Ver também: `artifacts/neurocanvas-blocker-clusters.md` · `artifacts/neurocanvas-baseline-impact.md`

| Grupos duplicados | 3660 |
| byte-identical | 94 |
| semantic-identical | 131 |
| divergentes | 3435 |

## 3. Precedência canônica (somente documentada)

- 1. slug listado em manifest.slugs[] de lote *-completo referenciado em handcraft-registry.json.
- 2. slug listado em manifest.slugs[] de lote gNN com manifest.parent apontando para completo do registry.
- 3. slug listado em manifest.slugs[] de lote gNN com lote-meta.parent apontando para completo do registry.
- 4. Cópias byte/semantic idênticas: preferir path documentado acima; senão singleton efetivo.
- 5. Conteúdo divergente SEM evidência documentada única → não escolher; marcar unresolved.
- PROIBIDO: gNN “mais recente”, ordem lexicográfica ou heurística de filesystem como autoridade.

Lotes *-completo no registry: 35

## 3b. dedupe_schema

Versão: **1** · Algoritmo: `sha256_hex(utf8_bytes(canonical_json(normalizeQuestionForComparison(raw))))`

Campos incluídos:
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

Campos removidos:
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

Normalização:
- JSON.parse do arquivo bruto
- reverse_study_slides ?? study_slides
- normalizeReverseStudySlide por slide
- sortReverseStudySlides (ordem canônica concept_map → logic_flow → golden_rule → danger_zone)
- options ordenadas por id lexicográfico
- canonicalJson (chaves lexicográficas recursivas + strings NFC)
- SHA-256 hex minúsculo

## 4. Comparação baseline anterior → determinística

### Catálogo

- Baseline de catálogo **reproduzida** (métricas principais idênticas).

### Resolver

- Resolver baseline **reproduzida** (bespoke/family/generic idênticos).

## 5. Readiness A/B/C (catálogo completo)

Ver `artifacts/neurocanvas-audit-report-data.json` para breakdown global.

## 6. Genéricos (decision=generic_semantic)

| Grade | Count |
|-------|------:|
| A | 1907 |
| B | 11 |
| C | 57 |
| **Total** | **1975** |

### Por tipo (genéricos)

| type | A | B | C |
|------|--:|--:|--:|
| concept_map | 751 | 11 | 0 |
| golden_rule | 1156 | 0 | 57 |

### Top subtopicos (genéricos)

- Epidemiologia e Vigilância Epidemiológica: 382
- Urgências e Emergências: 165
- Atenção Básica / Saúde da Família: 138
- Curativos e Manejo de Feridas: 126
- Imunização: 100
- Segurança do Paciente: 98
- Classes de palavras: 93
- Noções de Anatomia: 88
- Promoção à Saúde e Prevenção de Agravos: 77
- Saúde da Mulher: 66
- Vias de Administração: 66
- Sinônimos, antônimos e polissemia: 63

## 7. Coorte piloto

- Pilotos: 41 · Controles: 41

## 8. Paridade Supabase live

- **Não executada** — sem comparação read-only configurada nesta sessão (limitação documentada).

## 9. Casts typecheck (lib/neurocanvas/*)

| arquivo | cast | justificativa |
|---------|------|---------------|
| lib/neurocanvas/catalogAudit.ts | `as { type?: string }[]` | normalizeReverseStudySlide retorna Record; sortReverseStudySlides exige type opcional. |
| lib/neurocanvas/resolverAudit.ts | `as { type?: string }[]` | Mesmo narrowing pós-normalização de slides. |
| lib/neurocanvas/resolverAudit.ts | `as MoldAffinitySlide & { layout_variant?: string; ... }[]` | Slides normalizados alimentam moldAffinity + resolveSlidePresentation. |
| lib/neurocanvas/resolverAudit.ts | `as never (familyId / branch)` | resolveQuestionFamilyId e getLayoutVariantForBranch usam unions fechadas do domínio. |

- `as any`: **não encontrado**
- `as unknown as`: **não encontrado**

## 10. Confirmações

- NeuroCanvas runtime: **não implementado**
- Player/resolver produção: **não alterados**
- Commit/push/PR/deploy/Supabase write: **não executados**

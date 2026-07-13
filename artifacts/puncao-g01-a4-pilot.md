# A4 piloto — puncao-venosa-e-cuidados-com-cateteres-g01

**Data:** 2026-07-11 (atualizado com Potter 11ª ed. + captures L4)  
**Revisor:** agent (piloto estruturado pós-handcraft v2)  
**Lote:** `puncao-venosa-e-cuidados-com-cateteres-g01` · ramo `puncao_flebite`

## Slugs piloto (amostra 3/8 + âncora)

| Slug | Tema | Veredito A4 |
|------|------|-------------|
| `avancasp-…1779340254185-7` | Âncora — pareamento complicações (êmbolos) | OK — didática fiel ao gabarito literal |
| `avancasp-…1779340270805-4` | Infiltração × flebite | OK — trilho claro, pegadinhas por letra |
| `facape-…1779340191984-5` | Conduta na flebite | OK — sequência suspender/retirar/comunicar/registrar |
| `fau-…1779562711132-5` | Nome popular “flebite” = infiltração | OK com ressalva — `exam_vs_current` documentado; risco alto |

## Checklist por slug piloto

### Infiltração (AVANÇASP …0805-4)

- Enunciado legível após limpeza PDF (`da agulha`).
- `logic_flow` tap guia eliminação D→C→A/B sem spoiler prévio.
- `danger_zone` distingue flebite, hematoma, esclerose, abscesso com `correct` únicos.
- **Piloto player:** aluno entende mecanismo → infiltração.

### Conduta flebite (FACAPE …1984-5)

- Distratores B/C/E ensinam erro de manter infusão/cateter.
- `golden_rule` com protocolo em 4 passos memorizável.
- **Piloto player:** conduta completa na letra A — comunicação + prontuário.

### FAU popular (…1132-5)

- Tensão técnico × coloquial explícita em slides e `exam_vs_current`.
- Risco `alto` / `human_required` — revisão humana recomendada antes de escalar lote.
- **Piloto player:** aluno não elimina A por “flebite técnica”.

## Melhorias aplicadas nesta rodada

1. Limpeza de artefatos PDF em `question_data` (8 slugs).
2. Fontes tier A/B via `buildPuncaoSourcesForSlug` + `enrich:puncao-guideline-meta` (Anvisa + **Potter 11ª ed. 2024** + COFEN 358 quando cabível).
3. COSEAC …6126-1 reescrita com mnemônico HE-FITE (anti-duplicata).
4. `exam_vs_current` na FAU popular.
5. Captures L4 na âncora + checklist L6 15/15 (`e2e/capture-questao-review.spec.ts` — navegação tap nos moldes `puncao_flebite`).

## Pendências humanas (opcional)

- Revisão clínica da questão FAU (gabarito popular vs norma) — risco `alto/human_required`; assinar `meta.efficacy_contract` com `a4_reviewer` humano.
- Piloto real no `/estudar/[slug]` por revisor com assinatura `a4_reviewer` (não `agent:`).

# L3 Brief INDEX — Língua Portuguesa

| Campo | Valor |
|-------|--------|
| pacote_prefix | lingua-portuguesa |
| modulo_nome | Língua Portuguesa |
| total_questoes | 671 (fonte PDF; handcraft pendente) |
| study_cards | 17 (titulo_aula) |
| ramo_forte | >=10% do pacote ou >=5 slugs no ramo após handcraft |
| Cluster | artifacts/lingua-portuguesa-topic-cluster-report.json |
| Playbook | data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json |
| Classificação | docs/LINGUA_PORTUGUESA_CLASSIFICACAO.md |
| Metáforas | .cursor/skills/brief-lingua-portuguesa/reference-metaforas.md |
| Skill brief | .cursor/skills/brief-lingua-portuguesa/SKILL.md |

**Status L3:** cluster feito · brief `pt_crase` **PASS** (2026-07-17) · demais ramos fortes pendentes · audit l3-mold-gap pendente.

## Decisão por card (preliminar)

| Card | Qtd | branch | L3 |
|------|-----|--------|-----|
| Tipologia e gêneros textuais | 57 | pt_tipologia | ok_generico |
| Coesão, coerência e conectivos | 35 | pt_coesao_conectivos | ok_generico |
| Classes de palavras | 93 | pt_classes_palavras | ok_generico (split card) |
| Verbos — tempos, modos e vozes | 45 | pt_verbos | ok_generico |
| Pronomes e colocação pronominal | 68 | pt_pronomes_colocacao | molde_redesign pt-clitic-rail |
| Frase, oração e período | 4 | pt_frase_periodo | merge |
| Sujeito e predicado | 14 | pt_sujeito_predicado | ok_generico |
| Termos da oração | 31 | pt_termos_oracao | molde_redesign pt-term-matrix |
| Orações coordenadas e subordinadas | 38 | pt_oracoes_subordinadas | molde_redesign pt-period-rail |
| Sintaxe — questões mescladas | 8 | pt_sintaxe_mesclada | audit |
| Concordância verbal e nominal | 45 | pt_concordancia | molde_redesign pt-subject-focus |
| Regência verbal e nominal | 32 | pt_regencia | molde_redesign pt-regency-arrow |
| Crase | 45 | pt_crase | molde_redesign · **brief PASS** `l3-brief-lingua-portuguesa-pt_crase.md` · pt-crase-funnel P0 |
| Pontuação | 48 | pt_pontuacao | molde_redesign |
| Sinônimos, antônimos e polissemia | 63 | pt_sinonimos_polissemia | ok_generico |
| Denotação, conotação e figuras | 33 | pt_denotacao_conotacao | ok_generico |
| Vocábulo que e partícula se | 12 | pt_vocabulo_que_se | ok_generico |
| EXCETO transversal | — | pt_exceto_incorreta | molde_redesign pt-exceto-arena |

## Ordem brief 4/4

1. pt_crase ✅
2. pt_pronomes_colocacao
3. pt_pontuacao
4. pt_termos_oracao
5. pt_exceto_incorreta
6. pt_oracoes_subordinadas


## Galeria visual (piloto)

Índice: \rtifacts/l3-visual-gallery-lingua-portuguesa-index.md\  
Playbook: \pedagogical_branches[].visual_gallery\ (ramo \pt_crase\ = **pending** até handcraft Q506 + capture).

## Briefs gerados

| branch_id | Arquivo | Âncora | Status |
|-----------|---------|--------|--------|
| pt_crase | `artifacts/l3-brief-lingua-portuguesa-pt_crase.md` | Q506 VUNESP Itatiba Trânsito 2025 (gab. C) | PASS Fase 3b — React pendente |

**Próximo brief sugerido:** `pt_pronomes_colocacao` (ordem P0 do índice).

**Próximo conteúdo:** `Handcraft: Língua Portuguesa` — âncora 506 / `pt_crase` (slots alinhados ao brief).

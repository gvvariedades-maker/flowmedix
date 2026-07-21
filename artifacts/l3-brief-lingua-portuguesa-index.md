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

**Status L3:** cluster feito → brief pt_crase **PASS** (2026-07-17) → brief pt_pronomes_colocacao **PASS** (2026-07-19) → brief pt_pontuacao **PASS** (2026-07-20) → brief pt_termos_oracao **PASS** (2026-07-20) → demais ramos fortes pendentes → audit l3-mold-gap pendente.

## Decisão por card (preliminar)

| Card | Qtd | branch | L3 |
|------|-----|--------|-----|
| Tipologia e gêneros textuais | 57 | pt_tipologia | ok_generico |
| Coesão, coerência e conectivos | 35 | pt_coesao_conectivos | ok_generico |
| Classes de palavras | 93 | pt_classes_palavras | ok_generico (split card) |
| Verbos — tempos, modos e vozes | 45 | pt_verbos | ok_generico |
| Pronomes e colocação pronominal | 68 | pt_termos_oracao | artifacts/l3-brief-lingua-portuguesa-pt_termos_oracao.md | Q326 tec 3789304 — VUNESP SJRP 2026 (gab. E) | PASS Fase 3b → React pt-term-matrix pendente |
| pt_pronomes_colocacao | molde_redesign → **brief PASS** l3-brief-lingua-portuguesa-pt_pronomes_colocacao.md → pt-clitic-rail P0 |
| Frase, oração e período | 4 | pt_frase_periodo | merge |
| Sujeito e predicado | 14 | pt_sujeito_predicado | ok_generico |
| Termos da oração | 31 | pt_termos_oracao | molde_redesign → **brief PASS** l3-brief-lingua-portuguesa-pt_termos_oracao.md → pt-term-matrix |
| Orações coordenadas e subordinadas | 38 | pt_oracoes_subordinadas | molde_redesign pt-period-rail |
| Sintaxe — questões mescladas | 8 | pt_sintaxe_mesclada | audit |
| Concordância verbal e nominal | 45 | pt_concordancia | molde_redesign pt-subject-focus |
| Regência verbal e nominal | 32 | pt_regencia | molde_redesign pt-regency-arrow |
| Crase | 45 | pt_crase | molde_redesign → **brief PASS** l3-brief-lingua-portuguesa-pt_crase.md → pt-crase-funnel P0 |
| Pontuação | 48 | pt_pontuacao | molde_redesign → **brief PASS** l3-brief-lingua-portuguesa-pt_pontuacao.md → pt-comma-rail P0 |
| Sinônimos, antônimos e polissemia | 63 | pt_sinonimos_polissemia | ok_generico |
| Denotação, conotação e figuras | 33 | pt_denotacao_conotacao | ok_generico |
| Vocábulo que e partícula se | 12 | pt_vocabulo_que_se | ok_generico |
| EXCETO transversal | — | pt_exceto_incorreta | molde_redesign pt-exceto-arena |

## Ordem brief 4/4

1. pt_crase ✓
2. pt_pronomes_colocacao ✓
3. pt_pontuacao ✓
4. pt_termos_oracao ✓
5. pt_exceto_incorreta
6. pt_oracoes_subordinadas


## Galeria visual (piloto)

Índice: \rtifacts/l3-visual-gallery-lingua-portuguesa-index.md\  
Playbook: \pedagogical_branches[].visual_gallery\ (ramo \pt_crase\ = **pending** até handcraft Q506 + capture).

## Briefs gerados

| branch_id | Arquivo | Âncora | Status |
|-----------|---------|--------|--------|
| pt_crase | rtifacts/l3-brief-lingua-portuguesa-pt_crase.md | Q506 / tec 3607076 Osasco (gab. C) — âncoras golden ready | PASS Fase 3b → React pt-crase-funnel ready |
| pt_pontuacao | rtifacts/l3-brief-lingua-portuguesa-pt_pontuacao.md | Q399 tec 3839712 — AVANÇASP Potim 2026 (gab. B) — React **READY** | PASS Fase 3b → React pt-comma-rail pendente |
| pt_termos_oracao | artifacts/l3-brief-lingua-portuguesa-pt_termos_oracao.md | Q326 tec 3789304 — VUNESP SJRP 2026 (gab. E) | PASS Fase 3b → React pt-term-matrix pendente |
| pt_pronomes_colocacao | rtifacts/l3-brief-lingua-portuguesa-pt_pronomes_colocacao.md | Q178 tec 3999766 — colocacao-trilho.json (gab. A) | PASS Fase 3b → ancora golden READY → React pt-clitic-rail **READY** |

**Próximo brief sugerido:** pt_exceto_incorreta (ordem P0 do índice).

**Âncora colocação:** READY em examples/questao-premium-vunesp-portugues-colocacao-trilho.json; React pt-clitic-rail **READY**. **Âncora pontuação:** READY em examples/questao-premium-avancasp-portugues-pontuacao-vocativo-rita.json. **Âncora termos:** brief PASS — handcraft Q326 / golden questao-premium-vunesp-portugues-termos-matrix-folhetos.json pendente.

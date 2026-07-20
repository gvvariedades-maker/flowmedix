# Referência — Ramos L3 × decisão (Língua Portuguesa)

Complemento de `brief-lingua-portuguesa`. Fonte: playbook `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json`.  
Se o playbook divergir, **vence o playbook**.

---

## Como usar

1. Classificar a questão → `branch_id` (coluna abaixo).
2. Se `molde_redesign` / `molde_inedito` → **Modo B** (brief 4/4) antes de escalar o ramo.
3. Se `ok_generico` → **Modo A** (metáfora em [`reference-metaforas.md`](reference-metaforas.md); sem `artifacts/l3-brief-*` obrigatório).
4. `audit` → classificar pelo enunciado no handcraft (não brief genérico).

---

## Tabela canônica

| `branch_id` | Quando (gatilho) | Decisão L3 | Bespoke target | Brief arquivo |
|-------------|------------------|------------|----------------|---------------|
| `pt_crase` | a/à, testes de crase, locuções femininas | `molde_redesign` | `pt-crase-funnel` | `artifacts/l3-brief-lingua-portuguesa-pt_crase.md` |
| `pt_pronomes_colocacao` | próclise, ênclise, mesóclise | `molde_redesign` | `pt-clitic-rail` | `…-pt_pronomes_colocacao.md` |
| `pt_pontuacao` | vírgula, sujeito\|verbo, aposto, restritiva | `molde_redesign` | `pt-comma-rail` | `artifacts/l3-brief-lingua-portuguesa-pt_pontuacao.md` |
| `pt_termos_oracao` | adjunto, complemento, aposto, vocativo… | `molde_redesign` | `pt-term-matrix` | `artifacts/l3-brief-lingua-portuguesa-pt_termos_oracao.md` |
| `pt_exceto_incorreta` | comando EXCETO / INCORRETA (qualquer eixo) | `molde_redesign` | `pt-exceto-arena` | `…-pt_exceto_incorreta.md` |
| `pt_oracoes_subordinadas` | coord./subord., reduzidas | `molde_redesign` | `pt-period-rail` | `…-pt_oracoes_subordinadas.md` |
| `pt_concordancia` | núcleo do sujeito, casos especiais | `molde_redesign` | `pt-subject-focus` | `…-pt_concordancia.md` |
| `pt_regencia` | prep. exigida, sentidos do verbo | `molde_redesign` | `pt-regency-arrow` | `…-pt_regencia.md` |
| `pt_tipologia` | gêneros / tipologia / função do texto | `ok_generico` | — (text-zones se text_fragment dominar) | dispensado |
| `pt_coesao_conectivos` | coesão, anáfora, conectivos | `ok_generico` | — | dispensado |
| `pt_classes_palavras` | classes, formação de palavras | `ok_generico` | — | dispensado |
| `pt_verbos` | tempos, modos, vozes | `ok_generico` | — | dispensado |
| `pt_sinonimos_polissemia` | sinônimos, polissemia, parônimos | `ok_generico` | — | dispensado |
| `pt_denotacao_conotacao` | denotação, conotação, figuras | `ok_generico` | — | dispensado |
| `pt_vocabulo_que_se` | vocábulo *que*, partícula *se* | `ok_generico` | — | dispensado |
| `pt_sintaxe_mesclada` | sintaxe mesclada | `audit` | classificar no handcraft | — |

---

## Card vitrine → ramo (atalho)

| `meta.subtopico` (card) | Ramo típico |
|-------------------------|-------------|
| Crase | `pt_crase` |
| Pronomes e colocação pronominal | `pt_pronomes_colocacao` |
| Pontuação | `pt_pontuacao` |
| Termos da oração | `pt_termos_oracao` |
| Orações coordenadas e subordinadas | `pt_oracoes_subordinadas` |
| Concordância verbal e nominal | `pt_concordancia` |
| Regência verbal e nominal | `pt_regencia` |
| Tipologia e gêneros textuais | `pt_tipologia` |
| Coesão, coerência e conectivos | `pt_coesao_conectivos` |
| Classes de palavras | `pt_classes_palavras` |
| Verbos — tempos, modos e vozes | `pt_verbos` |
| Sinônimos, antônimos e polissemia | `pt_sinonimos_polissemia` |
| Denotação, conotação e figuras de linguagem | `pt_denotacao_conotacao` |
| Vocábulo "que" e partícula "se" | `pt_vocabulo_que_se` |
| Sintaxe — questões mescladas | `pt_sintaxe_mesclada` |

**EXCETO/INCORRETA:** preferir `pt_exceto_incorreta` **e** metáfora do eixo gramatical (ex.: crase + arena).

Interpretação (se card/eixo existir no lote): metáfora **zonas do texto** (`pt-text-zones`); brief formal só se virar ramo forte no cluster.

---

## Por que `ok_generico` dispensa brief em arquivo

Brief formal existe para **contrato de molde React espacial**.  
Se `compare` + `rows` + `tap` já ensinam a pegadinha → Modo A basta (metáfora na skill, sem `artifacts/l3-brief-*`).

Ver skill § Decisão rápida e `docs/L3_MAPEAMENTO_CONVERSA.md` Fase 3b.

---

## Índice de briefs

```text
artifacts/l3-brief-lingua-portuguesa-index.md
artifacts/l3-brief-lingua-portuguesa-<branch_id>.md
```

1 brief por **ramo forte** cobre todos os slugs daquele ramo (ex.: 45 crases → 1 arquivo `pt_crase`).

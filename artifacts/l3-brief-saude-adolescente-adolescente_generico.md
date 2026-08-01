# L3 Brief — Saúde do Adolescente / adolescente_generico (Onda 2)

**Status:** `molde_redesign` → reusa pacote glanceable (EXCETO/diretrizes em board)  
**Metáfora 4/4:** pilares do tema × manter norma × isolar EXCETO × compare  
**Erro espacial:** misturar **diretriz MS** com conduta genérica / marcar todas as letras com o mesmo "gabarito"  
**Orçamento de clique:** EXCETO → 0 taps (isolate-board)  
**Gerado / atualizado:** 2026-08-01 (Onda 2)

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Saúde do Adolescente |
| `pacote_prefix` | `saude-adolescente` |
| `branch_id` | `adolescente_generico` |
| Família | mista (`conceito` · `legis` · `certo_errado` · EXCETO) |
| Decisão L3 | `molde_redesign` (reuso `ADOLESCENTE_GLANCEABLE_MOLD`) |

**Papel:** cauda longa (promoção, bucal, diretrizes, EXCETO sem âncora de sigilo/Z/violência/puberdade/mental).

---

## Pacote L3 — reuso ética glanceable

| # player | `type` | `layout_variant` | Uso |
|---------:|--------|------------------|-----|
| 1 | `concept_map` | `adolescent-care-pillars-deck` | 3+ pilares do tema (promoção, AB, política) |
| 2 | `logic_flow` | `adolescent-exceto-isolate-board` | EXCETO: keep × exception |
| 3 | `golden_rule` | `adolescent-speak-barrier-board` | Norma MS em chip+corpo |
| 4 | `danger_zone` | `adolescent-exceto-compare` | Pegadinhas por letra |

Se o enunciado ancora outro ramo, **reclassificar** no handcraft (não forçar genérico).

| Sinal | Ramo correto |
|-------|--------------|
| escuta, sigilo, gravidez | `adolescente_etica_sigilo` |
| escore Z, Caderneta IMC | `adolescente_antropometria` |
| puberdade, Tanner | `adolescente_desenvolvimento` |
| anorexia, depressão, imagem | `adolescente_saude_mental` |
| violência, indicadores, rede | `adolescente_violencia_protecao` |

---

## Anti-padrões

| Proibido | Motivo |
|----------|--------|
| Inventar molde React "genérico-2" | Heterogeneidade = handcraft + board |
| Usar curtain/weave/consent | Legado ética |
| Spoiler de letra em concept/golden | Estudo reverso |

---

## Gate / DoD

- [x] Fallback `adolescente_generico` + glanceable no mapa
- [x] Catalog gap: EXCETO/promoção → `ok_existente` pacote ética v2
- [x] Sem cluster novo sem Fase 1b

**Status:** Onda 2 — genérico deixa de ser morphological/vertical; usa board glanceable compartilhado.

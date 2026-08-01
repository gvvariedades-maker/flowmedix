# L3 Brief — Saúde do Adolescente / adolescente_desenvolvimento (Onda 2)

**Status:** `molde_redesign` → reusa pacote glanceable (PillarDeck + isolate; **sem** timeline nova)  
**Metáfora 4/4:** marcos × ordem × atraso × não inverter Tanner  
**Erro espacial:** a banca **inverte marcos** (idade × evento) ou confunde atraso com normalidade  
**Orçamento de clique:** glanceable board; tap só se funil ≤3 (hoje = board)  
**Gerado / atualizado:** 2026-08-01 (Onda 2)

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Saúde do Adolescente |
| `pacote_prefix` | `saude-adolescente` |
| `branch_id` | `adolescente_desenvolvimento` |
| Família | `conceito` · `certo_errado` |
| Decisão L3 | `molde_redesign` (reuso `ADOLESCENTE_GLANCEABLE_MOLD`) |
| Âncora amostra | `nao-informado-geral-saude-do-adolescente-1777104229064-0` |

---

## Pacote L3 — reuso (gesto não divergiu o bastante para ID novo)

| # player | `type` | `layout_variant` | Metáfora |
|---------:|--------|------------------|----------|
| 1 | `concept_map` | `adolescent-care-pillars-deck` | 3 pilares/marcos (ex. meninas · meninos · atraso) |
| 2 | `logic_flow` | `adolescent-exceto-isolate-board` | Keep ordem correta × exception invertida |
| 3 | `golden_rule` | `adolescent-speak-barrier-board` | Chip marco × corpo (idade/evento) |
| 4 | `danger_zone` | `adolescent-exceto-compare` | Distrator = marco vizinho errado |

**Por que não `adolescent-puberty-timeline`:** Onda 2 prioriza reuso; timeline só se ≥5 slugs **e** erro espacial de estação vizinha persistir após handcraft no board.

**Guards:** moldes v1 de sigilo (curtain/weave/consent) **bloqueados** neste ramo; trilho Z só com escore Z.

---

## Slots / gatilhos

```text
concept_map: puberdade, Tanner, menarca, espermarquia, atraso, metamorfose física
logic_flow: eliminar afirmação invertida → marcar gabarito
golden_rule.rows: idade × marco (sem spoiler de letra)
danger_zone: correct explica por que o distrator parece certo
```

---

## Gate / DoD

- [x] Wiring glanceable no mapa de ramo
- [x] Affinity aceita corpus puberal no pacote glanceable
- [x] Affinity rejeita privacy-curtain neste ramo
- [ ] Timeline bespoke — condicional (≥5 + gesto diverge)

**Status:** Onda 2 glanceable em produção de mapa; conteúdo continua handcraft.

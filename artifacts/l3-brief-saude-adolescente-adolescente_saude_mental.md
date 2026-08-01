# L3 Brief — Saúde do Adolescente / adolescente_saude_mental (Onda 2)

**Status:** `molde_redesign` → reusa pacote glanceable ética (sem IDs novos)  
**Metáfora 4/4:** acolher × vincular × encaminhar × não punir  
**Erro espacial:** a banca troca **acolhimento/vínculo** por restrição punitiva, estigma ou papel invertido da equipe  
**Orçamento de clique:** board glanceable (0 taps) + compare  
**Gerado / atualizado:** 2026-08-01 (Onda 2 — NEUROSLIDES_VISUAL_STRATEGY)

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Saúde do Adolescente |
| `pacote_prefix` | `saude-adolescente` |
| `branch_id` | `adolescente_saude_mental` |
| Família | `conceito` · `protocolo` · `certo_errado` |
| Decisão L3 | `molde_redesign` (reuso `ADOLESCENTE_GLANCEABLE_MOLD`) |
| Âncoras amostra | `fau-unicentro-*9064-3` · `cpcon-uepb-*6385-1` · `idecan-*6701-8` |

**Inferência:** anorexia/bulimia com IMC no enunciado → este ramo (não antropometria Z).

---

## Pacote L3 (4× `layout_variant`) — reuso ética v2

| # player | `type` | `layout_variant` | Metáfora (1 frase) |
|---------:|--------|------------------|---------------------|
| 1 | `concept_map` | `adolescent-care-pillars-deck` | Pilares: acolhimento · vínculo · sinais de alerta |
| 2 | `logic_flow` | `adolescent-exceto-isolate-board` | Keep (acolher) × exception (punir/estigmatizar) |
| 3 | `golden_rule` | `adolescent-speak-barrier-board` | Como falar / conduzir × o que afasta |
| 4 | `danger_zone` | `adolescent-exceto-compare` | Distrator parece "firmeza"; `correct` restaura acolhimento |

Mesmo limiar **acolher×afastar** da violência/ética — conteúdo clínico muda; gesto espacial não.

---

## Slots / gatilhos

```text
concept_map: acolhimento, vínculo, anorexia, bulimia, imagem corporal, depressão, ansiedade, CAPS
logic_flow: EXCETO conduta punitiva → keep acolher → exception restringir/punir → gabarito
golden_rule.rows: critérios / encaminhamento MS-SBM — sem "Gabarito letra X"
danger_zone: correct único; EXCETO = só gabarito aponta a exceção
```

**Slug `amauc` obesidade/comorbidades (sem Z):** candidato a este ramo — glanceable ok; trilho Z bloqueado.

---

## Anti-padrões

| Proibido | Motivo |
|----------|--------|
| `adolescent-growth-z-rail` sem escore Z | Affinity |
| Curtain/weave/consent (v1) | Legado só ética |
| Reciclar `correct` | Gate L2 |
| Escala PHQ/GAD inventada no React | JSON alimenta tudo |

---

## Gate / DoD Onda 2

- [x] Metáfora acolher×afastar 4/4
- [x] Reuso variants ética (sem React novo)
- [x] `BRANCH_DESIGN_MAP` + affinity ramo mental
- [x] Testes Jest atualizados
- [ ] Reclassificar `amauc-*` se ainda em genérico/antropometria (ops handcraft)

**Não** criar `adolescent-mental-risk-ladder` até volume ≥5 **e** gesto de escada diverge do board atual.

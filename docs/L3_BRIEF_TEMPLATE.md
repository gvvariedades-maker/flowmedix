# Template mínimo — Brief L3 (Fase 3b)

**1 página.** Para pacotes com muitos ramos — expandir com [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) §3 (versão completa) quando o ramo for flagship ou molde inédito.

**Calibração:** [`artifacts/l3-brief-saude-adolescente-adolescente_etica_sigilo.md`](../artifacts/l3-brief-saude-adolescente-adolescente_etica_sigilo.md) · [`artifacts/l3-brief-vias-de-administracao-via_vf_absorcao.md`](../artifacts/l3-brief-vias-de-administracao-via_vf_absorcao.md) · [`artifacts/l3-brief-lingua-portuguesa-pt_crase.md`](../artifacts/l3-brief-lingua-portuguesa-pt_crase.md)

**Ordem do player (v2):** `concept_map` → `logic_flow` → `golden_rule` → `danger_zone` — ver [`lib/reverseStudySlideOrder.ts`](../lib/reverseStudySlideOrder.ts).

---

## Cabeçalho

| Campo | Valor |
|-------|-------|
| Subtópico canônico | … |
| `pacote_prefix` | … |
| `branch_id` | … |
| Família | `vf` \| `certo_errado` \| `protocolo` \| `calc` \| `legis` \| `conceito` \| `text_fragment` |
| Decisão L3 | `molde_redesign` \| `molde_inedito` |
| Âncora | `examples/…` ou slug + enunciado |
| Erro espacial (1 frase) | … |

**Metáfora única 4/4:** …

---

## Pacote L3 (4× `layout_variant`)

| # player | `type` | `layout_variant` | Metáfora (1 frase) |
|---------:|--------|------------------|---------------------|
| 1 | `concept_map` | `<tema>-<conceito>-<formato>` | … |
| 2 | `logic_flow` | … | … |
| 3 | `golden_rule` | … | … |
| 4 | `danger_zone` | … | … |

---

## Slots por slide (resumo)

### 1 · `concept_map` — `<layout_variant>`

| Slot | Papel | Exemplo `label` | Gatilhos em `detail` |
|------|-------|-----------------|----------------------|
| … | terreno | … | … |

**Gesto:** … → **Estado final:** …

### 2 · `logic_flow` — `<layout_variant>`

`reveal_mode: "tap"` · N passos

| Passo | Decisão |
|-------|---------|
| 1 | … |

### 3 · `golden_rule` — `<layout_variant>`

| `rows[].label` | `value` (≤110c) |
|----------------|-----------------|
| … | … |

### 4 · `danger_zone` — `<layout_variant>`

| `label` | Erro | `correct` (único) |
|---------|------|-------------------|
| Letra X | … | … |

**Par concept_map ↔ danger_zone:** …

---

## Contrato JSON (palavras-gatilho)

```text
concept_map.items[].detail: sigilo, escuta, privacidade, autonomia, …
logic_flow.steps: eliminar A → … → gabarito
golden_rule.rows: norma MS/COFEN sem "Gabarito letra X"
danger_zone.items[].correct: 1 frase por distrator — sem repetir
```

---

## Gate Fase 3b

- [ ] Metáfora única 4/4
- [ ] 4× `layout_variant` nomeados (`<tema>-<conceito>-<formato>`)
- [ ] Erro espacial em 1 frase
- [ ] Contrato JSON + gatilhos por slot
- [ ] Wire: gesto inicial → final (cada slide)
- [ ] Par concept_map ↔ danger_zone
- [ ] DoD: 375px legível · 0 hardcode de gabarito no React · ≤7 slots/tela
- [ ] Path: `artifacts/l3-brief-<pacote_prefix>-<branch_id>.md`

**Próximo passo:** `Handcraft:` âncora **ou** `Implementar molde: <branch_id>` (só com pedido explícito).

# Brief L3 — Coleta de Exames Laboratoriais / coleta_hemocultura

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Coleta de Exames Laboratoriais |
| `pacote_prefix` | coleta-de-exames-laboratoriais |
| `branch_id` | coleta_hemocultura |
| Família | `protocolo` · `vf` |
| Decisão L3 | `molde_redesign` (ship: `COLETA_GENERIC_DESIGN` até Implementar molde) |
| `bespoke_target` | `coleta-hemoculture-aseptic-rings` |
| Âncora | hemocultura, antissepsia, frascos aeróbio/anaeróbio (cluster) |
| Erro espacial (1 frase) | Pula **antissepsia em anéis** ou confunde **volume** / **contaminação** × bacteremia |

**Metáfora única 4/4:** **Anéis assépticos** concêntricos — fricção clorexidina → alcoílico → secar → punção sem repalpagem → volume por frasco → par aeróbio/anaeróbio.

> **Handcraft hoje:** sequência em `logic_flow` tap + `golden_rule.rows`; compare para contaminação.

---

## Pacote L3 (4× `layout_variant`)

| # player | `type` | `layout_variant` (futuro) | Metáfora (1 frase) |
|---------:|--------|------------------------------|---------------------|
| 1 | `concept_map` | `coleta-hemoculture-aseptic-rings` | Anéis de antissepsia expandindo |
| 2 | `logic_flow` | `coleta-hemoculture-rings-tap` | Avançar anel a anel |
| 3 | `golden_rule` | `coleta-hemoculture-protocol-table` | Volume, frascos, tempo |
| 4 | `danger_zone` | `coleta-hemoculture-break-sterility` | Quebra de esterilidade × sequência certa |

---

## Slots por slide (resumo)

### 1 · `concept_map` — `coleta-hemoculture-aseptic-rings`

| Slot | Papel | Exemplo `label` | Gatilhos em `detail` |
|------|-------|-------------------|------------------------|
| Anel 1 | antissepsia | Clorexidina alcoólica | fricção, tempo de contato |
| Anel 2 | secagem | Secar completamente | não soprar, não palpar |
| Punção | técnica | Sem repalpagem | uma entrada, vacutainer |
| Volume | quantidade | mL por frasco | adulto/pediátrico conforme protocolo |
| Par de frascos | aeróbio/anaeróbio | Dois frascos | ordem de coleta |
| Contaminação | pegadinha | Pele / flora | falso positivo |

**Gesto:** fechar anéis antes da punção → **Estado final:** sequência asséptica internalizada.

### 2 · `logic_flow` — `coleta-hemoculture-rings-tap`

`reveal_mode: "tap"` · 5–7 passos

| Passo | Decisão |
|-------|---------|
| 1 | Indicação: febre, suspeita séptica? |
| 2 | Antissepsia completa (2 anéis + secar)? |
| 3 | Volume adequado por frasco? |
| 4 | Coletar aeróbio + anaeróbio quando pedido? |
| 5 | Eliminar repalpagem / palpar após antissepsia |
| 6 | Gabarito + “contaminação ≠ bacteremia” |

### 3 · `golden_rule` — `coleta-hemoculture-protocol-table`

| `rows[].label` | `value` (≤110c) |
|----------------|-------------------|
| Antissepsia | Clorexidina 0,5–2% + alcoólico; secar antes da punção |
| Repalpagem | Evitar após antissepsia — quebra esterilidade |
| Volume | Conforme fabricante (ex. 8–10 mL adulto — validar fonte) |
| Frascos | Aeróbio + anaeróbio quando indicado |
| Contaminação | Flora de pele → falso positivo; técnica rigorosa |
| Transporte | Temperatura ambiente/incubação conforme lab |

### 4 · `danger_zone` — `coleta-hemoculture-break-sterility`

| `label` | Erro | `correct` (único) |
|---------|------|-------------------|
| Letra A | Palpar após antissepsia | Conduta correta A |
| Letra B | Volume insuficiente / frasco único | Conduta correta B |
| Letra C | Não secar antisepsia | Conduta correta C |
| Letra D | Gabarito | Sequência asséptica correta |
| Letra E | Confunde contaminação com infecção | Conduta correta E |

**Par concept_map ↔ danger_zone:** anéis no mapa; danger = **quebra** de esterilidade.

---

## Contrato JSON (palavras-gatilho)

```text
concept_map.items[].detail: hemocultura, clorexidina, aeróbio, anaeróbio, volume, contaminação
logic_flow.steps: indicação → anéis → volume → frascos → gabarito
golden_rule.rows: protocolo hemocultura — fonte tier A/B
danger_zone.items[].correct: técnica errada vs correta — sem repetir
```

---

## Gate Fase 3b

- [x] Metáfora única 4/4 (anéis assépticos)
- [x] 4× `layout_variant` nomeados
- [x] Erro espacial documentado
- [x] Par concept_map ↔ danger_zone

**Próximo passo:** `Handcraft:` lote hemocultura **ou** `Implementar molde: coleta_hemocultura`.

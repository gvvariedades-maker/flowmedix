# Brief L3 — Coleta de Exames Laboratoriais / coleta_tecnica_venosa

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Coleta de Exames Laboratoriais |
| `pacote_prefix` | coleta-de-exames-laboratoriais |
| `branch_id` | coleta_tecnica_venosa |
| Família | `vf` · `protocolo` · `certo_errado` |
| Decisão L3 | `molde_redesign` (ship: `COLETA_GENERIC_DESIGN` até Implementar molde) |
| `bespoke_target` | `coleta-venous-preanalytic-rail` |
| Âncora | `examples/questao-premium-cpcon-coleta-amostras-vf.json` |
| Erro espacial (1 frase) | Mistura **técnica de punção**, **hemólise**, **transporte** e **descarte de resíduos** num único julgamento |

**Metáfora única 4/4:** **Trilho pré-analítico venoso** — estações: identificação → garrote → antissepsia → punção (mediana) → ordem de tubos → homogeneização → transporte → descarte.

> **Handcraft hoje:** âncora CPCON já usa genérico teal; respeitar slots do trilho nos 4 slides.

---

## Pacote L3 (4× `layout_variant`)

| # player | `type` | `layout_variant` (futuro) | Metáfora (1 frase) |
|---------:|--------|------------------------------|---------------------|
| 1 | `concept_map` | `coleta-venous-preanalytic-rail` | Estações do trilho venoso |
| 2 | `logic_flow` | `coleta-venous-rail-tap` | Parar em cada estação; eliminar V/F |
| 3 | `golden_rule` | `coleta-preanalytic-table` | Checklist pré-analítico |
| 4 | `danger_zone` | `coleta-venous-wrong-station` | Estação errada × estação certa |

---

## Slots por slide (resumo)

### 1 · `concept_map` — `coleta-venous-preanalytic-rail`

| Slot | Papel | Exemplo `label` | Gatilhos em `detail` |
|------|-------|-------------------|------------------------|
| Identificação | segurança | Dupla checagem | pulseira, tubo, pedido |
| Garrote | técnica | Tempo limitado | 1–2 min, palpar veia |
| Mediana cubital | sítio | Veia preferida | calibre, estabilidade |
| Hemólise | qualidade | Evitar trauma | agulha fina, homogeneização suave |
| Transporte | temperatura | 2–8°C quando indicado | refrigeração, prazo |
| Resíduos | biossegurança | Segregar | perfurocortante ≠ infectante |

**Gesto:** percorrer trilho → **Estado final:** estações relevantes ao enunciado marcadas.

### 2 · `logic_flow` — `coleta-venous-rail-tap`

`reveal_mode: "tap"` · 6–8 passos (V/F I–II–III quando aplicável)

| Passo | Decisão |
|-------|---------|
| 1 | Julgar I (sítio venoso / técnica) |
| 2 | Julgar II (transporte / temperatura) |
| 3 | Julgar III (resíduos / biossegurança) |
| 4 | Eliminar combinações que misturam estações |
| 5 | Combinar afirmativas corretas |
| 6 | Gabarito |

### 3 · `golden_rule` — `coleta-preanalytic-table`

| `rows[].label` | `value` (≤110c) |
|----------------|-------------------|
| Veia preferida | Mediana cubital quando possível |
| Garrote | Máx. ~1–2 min; retirar após entrar sangue |
| Hemólise | Evitar trauma; não agitar vigorosamente |
| Transporte frio | 2–8°C quando exame exige refrigeração |
| Resíduos | Perfurocortante em caixa amarela — segregado |
| Pré-analítica | Maioria dos erros ocorre antes da análise |

### 4 · `danger_zone` — `coleta-venous-wrong-station`

| `label` | Erro | `correct` (único) |
|---------|------|-------------------|
| Letra A | Mistura transporte com punção | Conduta correta A |
| Letra B | Resíduos no mesmo recipiente (III) | Conduta correta B |
| Letra C | Garrote / hemólise ignorados | Conduta correta C |
| Letra D | Gabarito (I e II) | Mediana + refrigeração corretas |
| Letra E | Afirmativa absoluta falsa | Conduta correta E |

**Par concept_map ↔ danger_zone:** trilho no mapa; danger = parar na **estação errada**.

---

## Contrato JSON (palavras-gatilho)

```text
concept_map.items[].detail: mediana, garrote, hemólise, 2°C, 8°C, perfurocortante, identificação
logic_flow.steps: I → II → III → combinar → gabarito (tap)
golden_rule.rows: pré-analítica — sem "Gabarito letra X"
danger_zone.items[].correct: 1 frase por distrator (estação errada)
```

---

## Gate Fase 3b

- [x] Metáfora única 4/4 (trilho venoso)
- [x] 4× `layout_variant` nomeados
- [x] Âncora CPCON referenciada
- [x] Par concept_map ↔ danger_zone

**Próximo passo:** `Handcraft:` lote técnica venosa **ou** `Implementar molde: coleta_tecnica_venosa`.

# Brief L3 — Coleta de Exames Laboratoriais / coleta_tubos_ordem

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Coleta de Exames Laboratoriais |
| `pacote_prefix` | coleta-de-exames-laboratoriais |
| `branch_id` | coleta_tubos_ordem |
| Família | `protocolo` · `vf` · `conceito` |
| Decisão L3 | `molde_redesign` (ship: `COLETA_GENERIC_DESIGN` até Implementar molde) |
| `bespoke_target` | `coleta-tube-rail` |
| Âncora | tubos EDTA/citrato/heparina, ordem de coleta, cores ISO/CLSI (cluster) |
| Erro espacial (1 frase) | Inverte **ordem de coleta** ou associa **aditivo/cor errada** ao exame |

**Metáfora única 4/4:** **Trilho de tubos** — vagões em sequência fixa (cultura → citrato → sérico → heparina → EDTA → glicose/fluoreto), cada cor = aditivo + exames permitidos.

> **Handcraft hoje:** `reference_table` para cores/aditivos; `compare` para pegadinhas de ordem. React: `Implementar molde: coleta_tubos_ordem`.

---

## Pacote L3 (4× `layout_variant`)

| # player | `type` | `layout_variant` (futuro) | Metáfora (1 frase) |
|---------:|--------|------------------------------|---------------------|
| 1 | `concept_map` | `coleta-tube-rail` | Vagões coloridos no trilho CLSI |
| 2 | `logic_flow` | `coleta-tube-rail-tap` | Avançar vagão a vagão; eliminar ordem errada |
| 3 | `golden_rule` | `coleta-tube-order-table` | Tabela cor · aditivo · exame · ordem |
| 4 | `danger_zone` | `coleta-tube-derail` | Descarrilamento (ordem/aditivo) × trilho certo |

---

## Slots por slide (resumo)

### 1 · `concept_map` — `coleta-tube-rail`

| Slot | Papel | Exemplo `label` | Gatilhos em `detail` |
|------|-------|-------------------|------------------------|
| Vermelho / gel | aditivo | Sem anticoagulante | bioquímica, sorologia, imunologia |
| Azul / citrato | ordem | Coagulação | TP/TTPA, fibrinogênio |
| Verde / heparina | aditivo | Plasma | gases, eletrólitos (protocolo) |
| Roxo / EDTA | aditivo | Hemograma | contagem, morfologia |
| Cinza / fluoreto | aditivo | Glicemia | inibe glicólise |
| Cultura | prioridade | Primeiro tubo | hemocultura / bacteriana quando aplicável |

**Gesto:** ler exame pedido → achar **vagão** → **Estado final:** ordem + aditivo corretos.

### 2 · `logic_flow` — `coleta-tube-rail-tap`

`reveal_mode: "tap"` · 5–7 passos

| Passo | Decisão |
|-------|---------|
| 1 | Exame pedido → qual aditivo/cor? |
| 2 | Posição na ordem de coleta (cultura/citrato primeiro?) |
| 3 | Tubo único vs múltiplos — qual esvaziar antes? |
| 4 | Eliminar alternativa que inverte citrato × EDTA |
| 5 | Eliminar “misturar aditivos” ou reutilizar agulha |
| 6 | Gabarito + regra de transferência |

### 3 · `golden_rule` — `coleta-tube-order-table`

| `rows[].label` | `value` (≤110c) |
|----------------|-------------------|
| Ordem típica | Cultura → citrato → sérico → heparina → EDTA → oxalato/fluoreto |
| EDTA roxo | Hemograma; não coagulação plena |
| Citrato azul | Coagulação; proporção sangue:anticoagulante |
| Soro vermelho | Bioquímica/sorologia sem anticoagulante |
| Fluoreto cinza | Glicemia; inibir glicólise |
| Pegadinha | EDTA antes de citrato contamina TP/TTPA |

Fonte: manual laboratorial / CLSI — registrar `meta.sources` tier A/B no handcraft.

### 4 · `danger_zone` — `coleta-tube-derail`

| `label` | Erro | `correct` (único) |
|---------|------|-------------------|
| Letra A | Cor/aditivo trocado | Conduta correta A |
| Letra B | Ordem invertida (EDTA antes de citrato) | Conduta correta B |
| Letra C | Tubo errado para hemograma | Conduta correta C |
| Letra D | Gabarito | Sequência/aditivo corretos |
| Letra E | Reutilização / homogeneização errada | Conduta correta E |

**Par concept_map ↔ danger_zone:** trilho no mapa; danger = **descarrilamento** vs **vagão certo**.

---

## Contrato JSON (palavras-gatilho)

```text
concept_map.items[].detail: EDTA, citrato, heparina, soro, fluoreto, ordem, cor, hemocultura
logic_flow.steps: exame → aditivo → ordem → eliminar → gabarito
golden_rule.rows: cor · aditivo · exame — sem spoiler de letra
danger_zone.items[].correct: justificar distrator (ordem/aditivo), não repetir
```

---

## Gate Fase 3b

- [x] Metáfora única 4/4 (trilho de tubos)
- [x] 4× `layout_variant` nomeados
- [x] Erro espacial em 1 frase
- [x] Contrato JSON + gatilhos
- [x] Par concept_map ↔ danger_zone
- [x] DoD: 375px · ≤7 slots/tela

**Próximo passo:** `Handcraft:` lote tubos **ou** `Implementar molde: coleta_tubos_ordem`.

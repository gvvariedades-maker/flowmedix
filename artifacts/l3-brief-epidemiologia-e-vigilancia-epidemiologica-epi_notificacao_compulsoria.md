# BRIEF DE VARIANTES — Epidemiologia / epi_notificacao_compulsoria

**Gerado:** 2026-08-01  
**Política:** `molde_inedito` (sem molde wired no repo)  
**Família:** `conceito` · `protocolo` · `legis` (lista Portaria) · `certo_errado` (EXCETO)  
**Template:** `lime` (t09)  
**Âncora (export):** `adm-tec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563778577-5`  
**Cluster:** Notificação compulsória / SINAN / lista nacional (~76–78 slugs, ~35%)

---

## Cabeçalho

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Epidemiologia e Vigilância Epidemiológica |
| `pacote_prefix` | epidemiologia-e-vigilancia-epidemiologica |
| `branch_id` | epi_notificacao_compulsoria |
| Família | conceito / legis |
| Decisão L3 | molde_inedito |
| Âncora | Lista Nacional — notificação **imediata** (Botulismo) vs semanal/outros |
| Erro espacial (1 frase) | Aluno coloca na lista **imediata** um agravo de notificação **semanal** (ou não compulsório). |

**Metáfora única 4/4:** **Lista-trap** — dois canais (imediata 24h × semanal) + SINAN como tubo de entrada → eliminação por canal → arena do agravo no canal errado.

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Enunciado | Qual item consta na Lista Nacional de Doenças de Notificação Compulsória **Imediata**? |
| Gabarito | A — Botulismo |
| Distratores | Dengue (semanal/outro regime), Asma (não compulsória), Esquistossomose (semanal) |

**Por que bespoke (não só `compare` genérico):**

1. Erro é **categorial/espacial** — dois canais de prazo na mesma lista nacional.
2. Distratores misturam agravos de **outro canal** ou fora da lista.
3. Volume dominante do pacote (~35%).
4. `compare` texto×texto não fixa o **mapa imediata × semanal × SINAN**.

---

## Pacote L3 (4× `layout_variant`)

| # player | `type` | `layout_variant` | Metáfora (1 frase) |
|---------:|--------|------------------|---------------------|
| 1 | `concept_map` | `epi-lista-canais` | Dois canais (imediata / semanal) + SINAN como entrada |
| 2 | `logic_flow` | `epi-lista-tap` | Tap: ler “imediata?” → eliminar canal errado → gabarito |
| 3 | `golden_rule` | `epi-lista-board` | Tabela: prazo × exemplos MS (sem “Gabarito letra X”) |
| 4 | `danger_zone` | `epi-lista-trap` | Agravo no canal errado × canal correto |

---

## Slots por slide

### 1 · `concept_map` — `epi-lista-canais`

| Slot | Papel | Exemplo label | Gatilhos |
|------|-------|---------------|----------|
| 1 | Canal A | Notificação imediata (24h) | imediata, 24 horas, Portaria |
| 2 | Canal B | Notificação semanal | semanal, lista nacional |
| 3 | Sistema | SINAN | SINAN, ficha, agravo |
| 4 | Fora | Não compulsório | asma, agravo fora da lista |
| 5 | Pegadinha | Dengue ≠ imediata | dengue, semanal |

**Gesto:** toque no canal → destaca prazo. **Estado final:** dois canais + SINAN visíveis.

### 2 · `logic_flow` — `epi-lista-tap`

`reveal_mode: "tap"`

| Passo | Decisão |
|-------|---------|
| 1 | A prova pede lista **imediata** ou semanal? |
| 2 | Eliminar agravos fora da lista / não compulsórios |
| 3 | Eliminar agravos do **outro** canal |
| 4 | Gabarito = agravo do canal pedido (ex.: Botulismo) |

### 3 · `golden_rule` — `epi-lista-board`

| `rows[].label` | `value` |
|----------------|---------|
| Imediata | Comunicar à autoridade em até 24h (ex.: botulismo, sarampo, raiva…) |
| Semanal | Regime semanal conforme Portaria vigente |
| SINAN | Sistema de Informação de Agravos de Notificação |
| Fonte | Guia de Vigilância / Portaria lista nacional |

### 4 · `danger_zone` — `epi-lista-trap`

| `label` | Erro | `correct` |
|---------|------|-----------|
| Letra B | Dengue como imediata | Dengue segue regime da lista (não confundir com imediata desta prova) |
| Letra C | Asma compulsória | Asma não integra lista nacional de notificação compulsória |
| Letra D | Esquistossomose imediata | Esquistossomose não é o item de notificação imediata cobrado |

**Par concept_map ↔ danger_zone:** canais do mapa = slots da trap (agravo no canal errado).

---

## Contrato JSON

```text
concept_map.items[].detail: imediata, semanal, SINAN, lista nacional, 24h
logic_flow.steps: canal pedido → eliminar fora → eliminar outro canal → gabarito
golden_rule.rows: prazo/exemplos MS — sem "Gabarito letra X"
danger_zone.items[].correct: 1 frase por distrator — única
meta.pedagogical_branch: epi_notificacao_compulsoria
```

## DoD / handoff

- Handcraft: layouts genéricos (`morphological` · `cards` · `reference_table` · `compare`) **respeitando** metáfora lista-trap até React.
- React: só com `Implementar molde: epi_notificacao_compulsoria` → `VARIANT_MOLDS` §3.
- Âncora golden: criar `examples/questao-premium-*-epidemiologia-notificacao-*.json` antes do g01 se gate exigir.

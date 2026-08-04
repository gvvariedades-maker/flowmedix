# Pré-Onda 3 — Catálogo print → gesto → primitivo → slide

**Data:** 2026-08-03  
**Regra:** inspiração ≠ cópia. Sem 3D, watermark, @handle, carrossel N/M, 1 variant por print.  
**Kit:** `components/slides/primitives/` · skill `avant-neuroslides-visual` · [`docs/NEUROSLIDES_VISUAL_STRATEGY.md`](../docs/NEUROSLIDES_VISUAL_STRATEGY.md)

## Glossário (não confundir)

| Nome | Significado |
|------|-------------|
| **Onda 3 (estratégia visual)** | Já entregue: Imunização EXCETO + calendário `LabelBodyRow` |
| **Onda 3 Fábrica 20** | Nota-10 visual nos 10 pacotes já `production_ready` (Mulher → … → Trabalho) |

---

## Famílias de mercado → AVANT

| # | Print / família | Gesto | Primitivo(s) | Slide type | Preferência | Molde novo? |
|---|-----------------|-------|--------------|------------|-------------|-------------|
| 1 | XABCDE (letra em círculo + conduta) | Trilho de protocolo | `ProtocolRailRow` + `BoardChrome` | concept / logic ≤3 | rail glanceable; tap só se ordem de prova | **Não** — `urgencias-xabcde-rail` |
| 2 | Calendário PNI (idade × vacinas) | Chip + corpo | `LabelBodyRow` + `CategoryStrip` | golden_rule | glanceable; partir >7 linhas | **Não** — `pni-calendar-board` |
| 3 | SUS I–V / lista indexada + ícone | Lista normativa | `ProtocolRailRow` ou `LabelBodyRow` | concept_map / golden | ≤5–7 por tela | Só se ≥5 no ramo **e** gesto novo |
| 4 | Manchester / classificação de risco (cor = urgência) | Cor = categoria / polarity | `CategoryStrip` + `PolarityPanel` (tones rose→sky) | concept / danger | glanceable 0 taps | Só se ramo forte sem board |
| 5 | Mapa mental 3 colunas / NIC–NOC / pilares | Deck / três pilares | `PillarDeck` | concept_map | glanceable | Reusar ética glanceable / SoftLens |
| 6 | RAPS / rede (hub + lista) | Núcleo + lista | `PillarDeck` ou items `concept_map` + `footer_rule` | concept_map | ≤7 slots; sem mascote | **Não** clonar hub cartoon |
| 7 | Fluxo RN / zigzag roadmap | Funil / sequência | `logic_flow` tap ≤3 **ou** board | logic_flow | enxugar steps; não PNG fluxograma | Só gesto espacial novo |
| 8 | Asma / protocolo empilhado + tabela gravidade | Callout + tabela | `AlertCallout` + `CriticalNumber` + `LabelBodyRow` / `rows` | golden_rule | glanceable | Compor SoftLens / reference_table |
| 9 | Normotermia / benefícios ↑↓ | Número + polaridade | `CriticalNumber` + `PolarityPanel` / `LabelBodyRow` | golden / concept | 0–1 tap | **Não** |
| 10 | Higiene das mãos + "Atenção!" | Procedimento + alerta | `AlertCallout` + `TwoColumnBoard` ou 2× `LabelBodyRow` | golden_rule | glanceable | **Não** |
| 11 | Sinais vitais grade 2×3 | Deck / cards | `PillarDeck` ou `concept_map` ≤6 | concept_map | partir se densos | **Não** — genérico morph/grid |
| 12 | ADPIE / etapas SAE | Sequência mnemônica | `ProtocolRailRow` (A–E) ou `PillarDeck` | concept_map | glanceable | Reusar; Processo já tem moldes |
| 13 | Vigilância 1–6 passos | Timeline / rail | `ProtocolRailRow` | concept / logic ≤3 | ≤3 taps se funil | Reusar rail |
| 14 | Doenças respiratórias multi-card + tabela O₂ | Categoria + tabela | `CategoryStrip` + `LabelBodyRow` / `rows` | concept + golden | 1 doença/slide ou rows | Reusar resp. crônicas |
| 15 | Padrões respiratórios (onda → nome → def) | Glossário chip+corpo | `LabelBodyRow` + tone | golden_rule | glanceable; ≤7 | **Não** |
| 16 | Pontuação / glossário PT (símbolo + função) | Chip + corpo | `LabelBodyRow` / SoftLens | golden_rule | PT: moldes crase existentes | Fora TE Onda 3 |
| 17 | Ranking / chevron score | Lista ranqueada | `ProtocolRailRow` badge=letra/nº | concept (raro TE) | preferir rail protocolo | Evitar estética ranking comercial |
| 18 | Pneumo 20 / esquema idade×dose | Chip + corpo | `LabelBodyRow` | golden_rule | = calendário PNI | **Não** |

---

## Descartar (não viram molde)

| Padrão no print | Motivo |
|-----------------|--------|
| Bebê/mascote 3D, cérebro cartoon | Estética sem gesto novo |
| @handle, likes, carrossel N/M, watermark | Chrome de feed |
| Poster 10–18 cards numa arte | Estoura ≤7 slots |
| Pastel Instagram no shell Cyber | Skin errada |
| Conteúdo clínico/legal errado "bonito" | Guideline/prova mandam |
| 1 React variant por print | Proibido pela estratégia |

---

## Regra reusar vs Implementar molde

| Situação | Ação |
|----------|------|
| Gesto ∈ tabela acima e molde/primitivo já no mapa do ramo | **Reusar** + handcraft JSON + Modo A/V |
| Pacote `production_ready`, só polish glanceable | Design visual + captures/galeria; **sem** React novo |
| Gesto espacial **novo** **ou** ≥5 questões no ramo forte sem board adequado | Brief 4/4 → Design visual → **Implementar molde:** → wire + Jest/Playwright |
| Cauda longa / pegadinha só textual | `ok_generico` 3/3 no brief; genérico premium |

---

## DoD Onda 3 Fábrica (PASS por pacote)

```text
□ Glossário respeitado (não reabrir Strategy Onda 3 Imu como se fosse Fábrica)
□ 1 gesto nomeado por ramo forte (ou ok_generico documentado)
□ Tradução print → primitivo registrada (esta tabela ou brief)
□ ≤7 slots / tela; orçamento de clique da família
□ 0 hardcode gabarito/letra no TSX
□ Skin editorial cards; sem feed chrome
□ Evidência visual: Playwright do pacote OU captures âncora (visual_gallery / questao-review)
□ artifacts/<pacote_prefix>-nota10-report.md (barra visual verde)
□ Molde React novo só com Implementar molde: + justificativa gesto|volume
□ Sem ai:generate / sem 1 variant por print / sem promote rotineiro
```

## Ordem Fábrica Onda 3

Mulher → Processo → Curativos → Imunização → Vias → Punção → Peri → CME → Mental → Trabalho

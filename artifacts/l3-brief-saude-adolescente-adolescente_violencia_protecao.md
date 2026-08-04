# L3 Brief — Saúde do Adolescente / adolescente_violencia_protecao (Onda 2)

**Status:** `molde_redesign` → reusa pacote glanceable ética (sem IDs novos)  
**Metáfora 4/4:** acolher × proteger × notificar × não revitimizar  
**Erro espacial:** a banca troca **acolhimento + rede** por omissão, punição ou "sigilo absoluto" que impede proteção  
**Orçamento de clique:** board glanceable (0 taps no logic) + compare aberto  
**Gerado / atualizado:** 2026-08-01 (Onda 2 — NEUROSLIDES_VISUAL_STRATEGY)

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Saúde do Adolescente |
| `pacote_prefix` | `saude-adolescente` |
| `branch_id` | `adolescente_violencia_protecao` |
| Família | `protocolo` · `legis` · `certo_errado` |
| Decisão L3 | `molde_redesign` (reuso `ADOLESCENTE_GLANCEABLE_MOLD`) |
| Âncoras amostra | `funcern-*9064-1` · `cpcon-uepb-*7068-6` |

---

## Pacote L3 (4× `layout_variant`) — reuso ética v2

| # player | `type` | `layout_variant` | Metáfora (1 frase) |
|---------:|--------|------------------|---------------------|
| 1 | `concept_map` | `adolescent-care-pillars-deck` | 3 pilares: acolher · proteger · notificar |
| 2 | `logic_flow` | `adolescent-exceto-isolate-board` | Manter rede × exceção (omissão / revitimização) — **0 taps** |
| 3 | `golden_rule` | `adolescent-speak-barrier-board` | Falar/acolher × barreira (não culpabilizar / não omitir) |
| 4 | `danger_zone` | `adolescent-exceto-compare` | Cada letra: conduta correta × pegadinha |

**Sem** novos React IDs — gesto = mesmo limiar acolher×afastar da ética; conteúdo JSON muda o significado dos slots.

---

## Slots / gatilhos

```text
concept_map: acolhimento, rede, Conselho Tutelar, CREAS, SINAN, ECA, sem revitimização
logic_flow.steps: comando EXCETO → keep (proteger/notificar) → exception (omitir/punir) → gabarito
golden_rule.rows: lei/fluxo (ECA, SINAN, PNAISN) — chip "acolher" vs "barreira"
danger_zone.items[].correct: único por distrator — nunca colar gabarito em todas as letras
```

**Par concept ↔ danger:** pilares da rede no slide 1; slide 4 instancia o ator/etapa errada por letra.

---

## Anti-padrões

| Proibido | Motivo |
|----------|--------|
| Moldes v1 curtain/weave/consent neste ramo | Só `adolescente_etica_sigilo` |
| Trilho Z / PNI | Drift de ramo |
| Gabarito nos slides 1–2 | Spoiler |
| 5+ taps no logic | Orçamento EXCETO = board |

---

## Gate Fase 3b / DoD Onda 2

- [x] Metáfora única 4/4 (acolher×proteger)
- [x] 4× `layout_variant` nomeados (reuso ética)
- [x] Wiring `BRANCH_DESIGN_MAP` → `ADOLESCENTE_GLANCEABLE_MOLD`
- [x] Affinity: ramo `adolescente_violencia_protecao` + corpus proteção
- [x] Jest mold / pedagogicalBranch / l3MoldGap
- [ ] Playwright visual-mold-regression (opcional flagship — sob pedido)

**Próximo:** handcraft com slots de rede; **não** inventar variant React nova.

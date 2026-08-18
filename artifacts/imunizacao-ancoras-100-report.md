# Imunização — Âncoras 100% (Fase 2)

**Subtópico:** Imunização  
**Pacote:** `imunizacao`  
**Fechado em:** 2026-08-05  
**Status:** **100% — base liberada** para handcraft em massa / Fábrica visual em **nova conversa**

> Não confundir com `applied` (handcraft no DB) nem `production_ready` (vendável). Este relatório cobre só **âncoras golden** + Glance OS / barra G2.

---

## Tabela final

| branch | âncora(s) | READY | visual_bar | aprovado_humano | spoiler_livre | Glance OS |
|--------|-----------|-------|------------|-----------------|---------------|-----------|
| `imunizacao_vf_intervalos` | CPCON intervalos VF | yes | pass | 2026-08-04 | yes | board V/F · deck herói · trap chips |
| `imunizacao_calendario` | Fundatec Men C @ 3m | yes | pass | 2026-08-04 | yes | timeline · calendar board 0 taps · arena |
| `imunizacao_calendario` (catch-up) | ADM&TEC cartão perdido | yes | pass | 2026-08-04 | yes | board 0 taps · armadilha vertical |
| `imunizacao_cadeia_frio` | AMEOSC VF sala/rede | yes | pass | 2026-08-04 | yes | hub SALA/REDE · board 0 taps |
| `imunizacao_cadeia_frio` (catch-up) | AVANÇASP 2–8 °C | yes | pass | 2026-08-04 | yes | faixa 2–8 · anti-0°C falso |
| `imunizacao_exceto` | Agirh INCORRETA / antibiótico | yes | pass | 2026-08-04 | yes | command-hub · rule-board · isolate · compare |
| `imunizacao_generico` | DECORP SCR via SC | yes | pass | 2026-08-05 | yes | route-hub · isolate 0 taps · trap arena 0 taps |

**Ramos L3:** 5/5 com `ancoras_100_status: approved`  
**Âncoras (piloto + catch-up):** 7/7 aprovadas

---

## Moldes novos / elevados nesta onda

| Molde | Tipo | Ramo |
|-------|------|------|
| `pni-exceto-command-hub` | concept_map | `imunizacao_exceto` |
| `pni-exceto-rule-board` | golden_rule | `imunizacao_exceto` |
| `pni-exceto-isolate-board` | logic_flow | `imunizacao_exceto` |
| `pni-exceto-compare` | danger_zone | `imunizacao_exceto` |
| `pni-via-route-hub` | concept_map | `imunizacao_generico` |
| `pni-via-isolate-board` | logic_flow (0 taps) | `imunizacao_generico` |
| `pni-via-trap-arena` | danger_zone (0 taps) | `imunizacao_generico` |

Inferência: via de administração no comando → `imunizacao_generico` (não calendário só por idade).

---

## Artefatos

| Artefato | Path |
|----------|------|
| Playbook | `data/catalog-migration/handcraft-playbooks/imunizacao.json` |
| Visual anchors | `data/catalog-migration/visual-anchors.json` |
| Mapa gestos | `artifacts/glance-os-imunizacao-MAPA-8-GESTOS.md` |
| Goldens | `examples/questao-premium-*-imunizacao-*.json` (+ DECORP / Fundatec / ADM&TEC / AMEOSC / AVANÇASP / Agirh) |

---

## Próximo passo (nova conversa)

1. **Handcraft:** `Handcraft: Imunização gNN` — ou pipeline de qualidade se já `applied` 100%
2. **Fábrica visual G2 (opcional):** `Fábrica visual G2: SUBTÓPICO: Imunização`
3. **Não** segundo `--promote` rotineiro se já `production_ready`

**Declaração:** Âncoras do subtópico **Imunização**: **100%** — base liberada para handcraft em massa em conversa futura.

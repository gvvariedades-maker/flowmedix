# BRIEF DE VARIANTES — Saúde do Adolescente / adolescente_saude_mental

**Gerado:** 2026-07-13  
**Política:** `ok_generico` (3 slugs — 18,75%)  
**Família:** `conceito` · `protocolo` · `certo_errado`  
**Template:** `sky` (t08)  
**Âncoras amostra:** `fau-unicentro-…9064-3` · `cpcon-uepb-…6385-1` · `idecan-…6701-8`  
**Pacote atual:** `ADOLESCENTE_GENERIC_DESIGN`

---

## 0. Erro pedagógico típico

Transtorno alimentar, imagem corporal, depressão/ansiedade na adolescência: confundir **conduta de acolhimento** com restrição alimentar punitiva, ou inverter papel da equipe (médico × enfermagem × família).

**Inferência reforçada (2026-07-13):** anorexia/bulimia com IMC no enunciado → `adolescente_saude_mental` (não antropometria Z).

**Decisão L3:** compare + tabela bastam — pegadinha é **conduta/ética**, não faixa numérica.

---

## 1. Pacote atual (implementado)

| Slide | Layout | Função semântica |
|-------|--------|------------------|
| `concept_map` | `morphological` | Rede de cuidado (acolhimento, vínculo, sinais de alerta) |
| `golden_rule` | `reference_table` | Critérios, sinais, encaminhamento, MS/SBM |
| `logic_flow` | `vertical` + `tap` | Raciocínio clínico-ético passo a passo |
| `danger_zone` | `compare` | Cada distrator: por que parece certo × conduta correta |

**Slug `amauc` obesidade/comorbidades:** candidato a este ramo (sem Z no enunciado) — evita trilho antropometria.

---

## 2. Conteúdo handcraft (L2)

- `danger_zone.items[].correct` **único** por alternativa (gate anti-reciclagem).
- EXCETO: distrator explica conduta correta; só gabarito aponta exceção.
- Sem vocabulário de sigilo forte → **não** forçar moldes `adolescent-*`.

---

## 3. Bespoke futuro (condicional)

**Trigger:** ≥5 slugs com padrão de erro **escalar** (ex. confundir gravidade em escala PHQ/GAD, ou estágios de risco suicida).

**Metáfora proposta:** `adolescent-mental-risk-ladder` — degraus de risco / semáforo acolhimento → encaminhamento; danger_zone posiciona distrator no degrau errado.

**Até lá:** genérico premium + `pedagogical_branch` explícito.

---

## 4. Anti-padrões

| Proibido | Motivo |
|----------|--------|
| `adolescent-growth-z-rail` sem escore Z | Affinity rejeita |
| Cortinas de sigilo em tema puramente clínico | 0 slots / drift |
| Reciclar `correct` entre letras | Gate L2 |

---

## 5. DoD

- [x] Ramo inferido + mapa genérico
- [x] 3/3 slugs handcraft no cluster saúde mental
- [ ] Reclassificar `amauc-…9064-5` → `adolescente_saude_mental` (recomendado)
- [ ] Bespoke — aguardar volume

**Status:** genérico premium em produção.

# BRIEF DE VARIANTES — História da Enfermagem / historia_nightingale

**Gerado:** 2026-07-14  
**Política:** `ok_generico`  
**Família:** `vf` · `legis` · `conceito` (marcos, cronologia)  
**Template:** `amber` (t04)  
**Âncora:** `examples/questao-premium-cpcon-historia-enfermagem-nightingale.json`  
**Cluster:** Nightingale / pioneiras / SUS / legislação — **~7 slugs** (35%)

---

## 0. Erro reproduzível

O aluno **confunde cronologia** (enfermagem só pós-SUS), **mistura Ana Néri × Eulália Paiva**, ou atribui Código de Ética ao COREN em vez do COFEN.

**Pacote:** `bridge` no concept_map conecta marcos; `golden_rule.rows` para datas/leis; `logic_flow` tap; `danger_zone` compare.

---

## 1. Slots L2

| Slide | Layout | Função |
|-------|--------|--------|
| `concept_map` | `bridge` | Pilares temporais (Nightingale → Brasil → SUS) |
| `golden_rule` | `reference_table` | Marcos, leis 7.498/86, pioneiras |
| `logic_flow` | `vertical` + `tap` | Eliminação V/F ou sequência cronológica |
| `danger_zone` | `compare` | Pegadinha SUS-only, COREN×COFEN |

**Proibido:** vocabulário de humanização/PNH sem reclassificar para `historia_humanizacao`.

---

## 2. Inferência

`inferHistoriaBranch` → `historia_nightingale` quando Nightingale, pioneiras, Lei 7.498 ou saúde pública histórica no corpus.

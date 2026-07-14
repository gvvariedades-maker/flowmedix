# BRIEF DE VARIANTES — Farmacodinâmica e Farmacocinética / farmaco_generico

**Gerado:** 2026-07-13  
**Política:** `ok_generico` (6 slugs — 46–54%)  
**Família:** mista (`conceito` · `certo_errado` · lacuna · EXCETO)  
**Template:** `purple` (t13)  
**Âncoras amostra:** `cetrede-…8997293-3` · `instituto-aocp-…3950945-2` · `objetiva-…3853014-1` · `idecan-…2122855-7`  
**Pacote atual:** `FARMACO_GENERIC_MOLD`

---

## 0. Papel do ramo

**Cauda longa heterogênea:** conceitos ADME isolados, meia-vida/biodisponibilidade, classes farmacológicas sem protocolo EV, EXCETO genérico, temas que **não** ancoram V/F I–II–III nem administração clínica monitorada.

**Princípio:** sem metáfora visual única — o pacote semântico genérico premium é o design correto.

---

## 1. Pacote atual (implementado)

| Slide | Layout | Função semântica |
|-------|--------|------------------|
| `concept_map` | `morphological` | 3–4 pilares do tema (cinética, dinâmica, parâmetro) |
| `golden_rule` | `center` ou `rows` → `reference_table` | Decore / definições de prova |
| `logic_flow` | `vertical` + `reveal_mode: tap` | Eliminação MCQ ou sequência conceitual |
| `danger_zone` | `compare` + `correct[]` | Pegadinha por alternativa |

**Inferência:** fallback quando `inferFarmacoBranch` não detecta V/F PK/PD nem protocolo clínico EV.

---

## 2. Padrões de conteúdo (L2)

| Padrão | Handcraft |
|--------|-----------|
| Lacuna / definição | `golden_rule.rows` com termo × definição |
| Meia-vida / biodisponibilidade | concept_map com `Clock` / `Pill`; danger com distrator numérico |
| EXCETO / INCORRETA | Cada distrator = conduta correta; só gabarito = exceção |
| Classe farmacológica (MCQ) | logic_flow tap; sem rail ADME |

---

## 3. Quando **não** usar este ramo

Reclassificar no handcraft se o enunciado ancora:

| Sinal | Ramo correto |
|-------|--------------|
| I/II/III, ADME, meia-vida 50% vs 100% | `farmaco_pk_pd_vf` |
| omeprazol EV, infusão, diluição, pH, antibiótico UTI | `farmaco_clinico_protocolo` |
| `family: vf` com 2+ hits PK/PD | `farmaco_pk_pd_vf` |
| `family: protocolo` + caso clínico EV | `farmaco_clinico_protocolo` |

```bash
npm run catalog:patch-pedagogical-branch -- --lote=farmacodinamica-e-farmacocinetica-completo --reconcile-branch --dry-run
```

---

## 4. Clusters absorvidos (Fase 1)

| Cluster temático | Slugs | Destino |
|------------------|-------|---------|
| Default — sem âncora temática | 2 | `farmaco_generico` |
| Conceito — farmacocinética (ADME) | 2 | `farmaco_generico` (revisar V/F → `farmaco_pk_pd_vf`) |
| Conceito — meia-vida e concentração | 1 | `farmaco_generico` |
| INCORRETA / EXCETO | 1 | `farmaco_generico` |
| Conceito — farmacodinâmica clínica (opioides) | 1 | reclassificar → `farmaco_clinico_protocolo` se protocolo |

---

## 5. Bespoke futuro

**Não planejado** para o ramo genérico. Novos clusters fortes (≥5 slugs) devem virar ramo dedicado na Fase 1b antes de molde inédito.

---

## 6. DoD

- [x] Fallback `farmaco_generico` em `pedagogicalBranch.ts`
- [x] 6 slugs com branch declarado no catálogo
- [x] Genérico não conflita com guards bespoke ADME / clínico
- [x] `danger_zone.items[].correct` único por letra

**Status:** genérico premium em produção — **não** promover a bespoke sem novo cluster ≥5 slugs.

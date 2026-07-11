# BRIEF DE VARIANTES — Saúde da Mulher / mulher_puerperio

**Gerado:** 2026-07-10  
**Política:** `ok_generico` + âncora golden L2 (volume 9 slugs — abaixo de limiar bespoke 10%)  
**Família:** `conceito` + `certo_errado`  
**Template:** `pink` (t14) — compartilhado com mama/lactação  
**Volume:** 9 slugs · 3,4% do subtópico

**Âncora:** `examples/questao-premium-ms-saude-mulher-puerperio-consulta.json`

**Erro reproduzível:** aluno confunde **30 × 42 dias** (consulta puerpério), **visita domiciliar** (1ª semana vs após 42 dias), **AM exclusivo 6 meses**, e **escopo holístico** (direitos previdenciários fazem parte do cuidado).

**Decisão L3:** pacote bespoke `mulher-puerperio-*` — linha 0–42 dias + board MS + tap-flow + trap arena.

---

## 1. Metáfora do pacote

**“Linha 0–42 dias → tabela MS puerpério → tap-flow eliminação → arena 30 dias errado.”**

---

## 2. Slides (layouts genéricos)

| Slide | Layout | Conteúdo |
|-------|--------|----------|
| `concept_map` | `morphological` | Marcos temporais + pegadinha 30 dias |
| `golden_rule` | `reference_table` | Consulta 42d · visita 1ª semana · AM 6m |
| `logic_flow` | `vertical` + `tap` | Eliminar B/C/D/E por marco |
| `danger_zone` | `compare` | Cada distrator erra um marco |

---

## 3. Gates handcraft

```bash
npm run audit:questao-readiness -- --file=<path> --strict-v3-pedagogy
```

Códigos: `mulher_danger_mirror` · `puerperio_30_dias` · `numeric_fact_mismatch` (evitar “7º dia” sem fonte).

# BRIEF DE VARIANTES — Saúde da Mulher / mulher_planejamento

**Gerado:** 2026-07-10  
**Política:** `ok_generico` + âncora golden L2 (volume 7 slugs)  
**Família:** `vf` (I–V) + `conceito` MCQ  
**Template:** `pink` (t14)  
**Volume:** 7 slugs · 2,7% do subtópico

**Âncora:** `examples/questao-premium-cpcon-saude-mulher-planejamento-vf.json`  
**Slug real:** `cpcon-uepb-enfermagem-saude-da-mulher-1777104329543-5`

**Erro reproduzível:** classificar **anticoncepcional oral** como comportamental; omitir **tabelinha** ou **temperatura basal**; confundir **barreira/hormonal/LARC**.

**Decisão L3:** pacote bespoke `mulher-planejamento-*` — espectro categorias + board + VF tap-flow + trap arena.

---

## 1. Metáfora do pacote

**“Categorias contraceptivas → tabela MS → tap-flow VF → arena oral ≠ comportamental.”**

---

## 2. Slides (layouts genéricos)

| Slide | Layout | Conteúdo |
|-------|--------|----------|
| `concept_map` | `morphological` | Comando + pegadinha I (oral hormonal) |
| `golden_rule` | `reference_table` | Comportamentais · hormonais · barreira · LARC |
| `logic_flow` | `vertical` + `tap` | Julgar I–V → E (II–V sem I) |
| `danger_zone` | `compare` | Cada letra erra por incluir I ou omitir II/III |

---

## 3. Gates handcraft

```bash
npm run audit:questao-readiness -- --file=<path> --strict-v3-pedagogy
```

Códigos: `planejamento_oral_comportamental` · `mulher_logic_elimination` (VF).

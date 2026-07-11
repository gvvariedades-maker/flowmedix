# BRIEF DE VARIANTES — Saúde da Mulher / mulher_mama

**Gerado:** 2026-07-08  
**Política:** `molde_inedito` (limiar exato 10,6% = 28 slugs)  
**Família:** `conceito` (96% MCQ)  
**Template:** `pink` (t14)  
**Volume:** 28 slugs · 10,6% do subtópico

**Âncora:** `data/catalog-migration/saude-da-mulher-completo/questions/vunesp-enfermagem-saude-da-mulher-1777104408379-6.json`

**Erro reproduzível:** aluno confunde **idade de início da mamografia** (50 vs 40 anos conforme guideline), **periodicidade bienal**, e **autoexame vs rastreio populacional** (mamografia é padrão-ouro populacional — INCA).

**Por que bespoke (teste espacial — 3× não):**

1. Erro **espacial** — posicionar **40 · 50 · bienal** na régua etária (não só texto).
2. Volume no limiar (28) mas padrão homogêneo em 27/28 slugs.
3. Compartilha metáfora “rastreio” com colo, mas **faixas e órgão diferentes** → pacote irmão, não reuso literal.

---

## 1. Metáfora do pacote

**“Espectro mama 40–69 → painel mamografia INCA → tap-flow → arena idade/periodicidade errada.”**

Skin compartilhada com `mulher_papanicolau` (régua etária), ícone mama distinto, sem misturar colo uterino no mesmo slide.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `mulher-mammography-spectrum`
- **Componente proposto:** `MulherMammographySpectrumConceptMap.tsx`

**Wire:**

```text
 40        50══════════69
           ↑ rastreio bienal (INCA)
 autoexame = conscientização (não substitui mamografia)
```

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `mulher-mama-board`
- **Componente proposto:** `GoldenRuleMulherMamaBoard.tsx`

**Rows:** `Início 50 anos` · `Periodicidade bienal` · `Mamografia padrão-ouro` · `Autoexame complementar` · pegadinhas 40 anos / anual universal

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `mulher-mama-tap-flow`
- **`reveal_mode`:** `tap`

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `mulher-mama-trap-arena`
- **`bullet_style`:** `x_icon`
- **Par:** distrator na idade errada da régua mama.

---

## 6. DoD §9

- [ ] Metáfora 4/4 coerente com rastreio (irmão papanicolau, ícone mama)
- [ ] 4× `layout_variant` distintos do ramo colo
- [ ] 375px; 0 hardcode; `correct` únicos

**Nota:** se piloto humano mostrar overlap alto com `mulher_papanicolau`, considerar **fusão** em ramo `mulher_rastreio_oncologico` na Fase 4 — por ora manter separado pela densidade de pegadinhas distintas.

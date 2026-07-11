# BRIEF DE VARIANTES — Cuidados na Administração de Medicamentos / cam_alto_risco

**Gerado:** 2026-07-10  
**Política:** `molde_inedito` (ramo forte sem pacote bespoke anterior)  
**Família:** `conceito` | `protocolo` (MCQ técnica — insulina, heparina, conferência dupla)  
**Template:** `amber` (alerta alto risco)  
**Âncora primária:** `examples/questao-premium-fepese-cuidados-insulina-alto-risco.json`  
**Cluster:** Alto risco / conferência dupla · 19 slugs · 10,3% · `sample_slugs[0]`: `fepese-enfermagem-cuidados-na-administracao-de-medicamentos-1778969248953-2`

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | FEPESE — Pref B Camboriú / SAMU 2023 |
| Tipo | MCQ caso clínico — insulina regular + NPH (alto risco) |
| Gabarito | E — aguardar 10 s antes de retirar a agulha |

**Erro reproduzível (1 frase):** o aluno confunde técnica da insulina (homogeneizar NPH, não massagear, mistura na mesma seringa quando prescrito) ou ignora que insulina exige conferência dupla e cuidados SC específicos.

**Por que bespoke (não `compare` genérico):**

1. O erro é **sequencial técnico** — dupla checagem → técnica SC → eliminar letras A–D por regra específica.
2. Alto risco pede **trilho duplo** (2 profissionais + classe medicamentosa), não parágrafo único.
3. Padrão em **19 questões** (≥ limiar 5 / 10%).
4. `compare` não ancora chips de pegadinha (massagear, NPH×regular, homogeneizar, 10 s).

---

## 1. Metáfora do pacote

**“Dupla checagem em cadeia → painel protocolo alto risco → escada de eliminação letra a letra → arena de pegadinhas técnicas.”**

Universo visual: **amber + teal** — `ShieldAlert`, badges `ALTO RISCO`, chips `NPH`, `massagear`, `10s`, ícones `Syringe`, `Users`.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `cam-high-risk-duo-deck`
- **Componente:** `CamHighRiskDuoDeckConceptMap.tsx`

**Wire:** deck 2×2 — dupla checagem · insulina NPH/regular · técnica SC · pegadinha banca.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `cam-high-risk-protocol-board`
- **Componente:** `GoldenRuleCamHighRiskProtocolBoard.tsx`

**Rows:** lista alto risco · passos dupla checagem · técnica insulina (homogeneizar NPH, rotação, 10 s).

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `cam-alto-risco-elimination-tap`
- **`reveal_mode`:** `tap`
- **Componente:** `LogicFlowCamAltoRiscoEliminationTap.tsx`

**Parser:** `Eliminar letra`, `Confirmar letra`, `Fixação` — escada tap (não V/F juggle).

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `cam-high-risk-trap-arena`
- **`bullet_style`:** `x_icon`
- **Componente:** `DangerZoneCamHighRiskTrapArena.tsx`

**Chips:** `massagear`, `NPH`, `homogeneizar`, `seringa separada`, `10 segundos`.

---

## 6. Contrato de inferência

| Molde | Gatilhos |
|-------|----------|
| `cam-high-risk-duo-deck` | `inferHighRiskCategory`: dupla_checagem, insulina, heparina, tecnica_sc |
| `cam-high-risk-protocol-board` | `inferHighRiskRowBadge`: ALERTA em alto risco / dupla checagem |
| `cam-alto-risco-elimination-tap` | `/Eliminar letra/`, `/Confirmar letra/` |
| `cam-high-risk-trap-arena` | `inferHighRiskTrapSlots`: massagear, NPH, homogeneizar, 10s |

---

## 7. Definition of Done (GATE Fase 3b)

- [x] Metáfora única 4/4 (dupla checagem + eliminação MCQ)
- [x] 4× `layout_variant` documentados
- [x] Contrato JSON + palavras-gatilho
- [x] Par conceito-perigo (técnica insulina ↔ letras A–D)
- [x] `reveal_mode: "tap"` · `bullet_style: "x_icon"`

**Próximo:** handcraft lote g01 ramo `cam_alto_risco`.

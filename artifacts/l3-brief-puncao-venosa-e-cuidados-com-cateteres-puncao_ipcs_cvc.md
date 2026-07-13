# BRIEF DE VARIANTES — Punção Venosa e Cuidados com Cateteres / puncao_ipcs_cvc

**Gerado:** 2026-07-11  
**Política:** `molde_redesign` (legado IPCS 4/4 no repo — restringir ao ramo)  
**Família:** `protocolo` / `conceito`  
**Template:** `indigo` (t01)  
**Âncora:** `examples/questao-premium-admtec-puncao-venosa-cateteres.json`  
**Cluster:** Prevenção de IPCS no CVC + Acesso venoso central (~6 slugs)  
**`sample_slugs[0]`:** `adm-tec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340191984-7`

## Pacote 4/4 (redesign do legado)

| Slide | `layout_variant` atual | `layout_variant` redesign |
|-------|------------------------|---------------------------|
| concept_map | `morphing-timeline` | `iv-bundle-orbit` |
| golden_rule | `iv-bundle-mesh-reveal` | `iv-bundle-mesh-reveal` (slots formalizados) |
| logic_flow | `iv-care-soft-stack` | `iv-bundle-tap-flow` |
| danger_zone | `catheter-danger-arena` | `iv-bundle-break-trap` |

**Componentes legados:** `IvCareOrbitConceptMap`, `GoldenRule` (iv-bundle), stack, arena — **redesign brief** antes de escalar.

---

## 0. Questão âncora

**Erro reproduzível:** quebrar barreira máxima, trocar curativo em prazo errado, confundir bundle IPCS com cuidado de punção periférica.

**Por que redesign:** moldes existem mas estão aplicados a **todo** o subtópico via `SUBTOPIC_DESIGN_MAP` — política 2026-07-02 exige brief formal + uso **somente** neste ramo.

**Gate drift:** vocabulário `bundle`, `barreira estéril máxima`, `corrente sanguínea`, `CVC` **só** quando enunciado ancorar IPCS/CVC.

---

## 1. Metáfora

**“Órbita do bundle IPCS → mesh dos 5 elementos → stack de cuidados com tap → arena de quebra de barreira.”**

---

## 2. Slide 1 — `concept_map` (`iv-bundle-orbit`)

Nós: higiene das mãos · barreira máxima · antissepsia clorexidina · curativo transparente · revisão diária do sítio.

---

## 3. Slide 2 — `golden_rule` (`iv-bundle-mesh-reveal`)

`rows[]` dos itens do bundle + prazos de curativo. Mesh reveal no tap (manter interação legada, documentar slots).

---

## 4. Slide 3 — `logic_flow` (`iv-bundle-tap-flow`)

Substituir `iv-care-soft-stack` por fluxo `tap` explícito: identificar item do bundle → julgar conduta → gabarito → fixação.

---

## 5. Slide 4 — `danger_zone` (`iv-bundle-break-trap`)

Pegadinhas: curativo úmido, troca fora do prazo, barreira quebrada, punção sem assepsia completa. Par com órbita do concept.

---

## 6. Migração L3

1. Remover pacote IPCS do `SUBTOPIC_DESIGN_MAP` global de Punção
2. Registrar `puncao_ipcs_cvc` em `BRANCH_DESIGN_MAP` com pacote acima
3. Backfill `meta.pedagogical_branch` só em slugs do cluster CVC/IPCS

---

## 7. DoD

- [x] Pacote IPCS **não** resolve em flebite/jelco/EXCETO (regressão visual)
- [x] Brief aprovado + componentes redesenhados ou slots documentados
- [x] `detectSlideTopicDrift` passa em slugs não-CVC

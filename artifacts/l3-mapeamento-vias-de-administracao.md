# Mapeamento L3 — Vias de Administração

**Gerado:** 2026-07-03  
**Subtópico:** Vias de Administração (canônico)  
**Pacote:** `vias-de-administracao` · **~235 slugs** (cluster report) · **251** no manifest completo  
**Fontes:** `artifacts/vias-de-administracao-topic-cluster-report.json` · `handcraft-playbooks/vias-de-administracao.json` · `data/catalog-migration/vias-golden-anchors.json`

---

## Fase 0 — Escopo

| Campo | Valor |
|-------|-------|
| `pacote_prefix` | `vias-de-administracao` |
| `total_slugs` | 251 (manifest) · 235 (cluster report filtrado) |
| Cluster script | `npm run cluster:vias-de-administracao` |
| Goldens em `examples/` | **5/5 READY** (`vias-golden-anchors.json`) |

---

## Fase 3 — Decisão por ramo (Passo 6)

| Ramo (`pedagogical_branch`) | Slugs (cluster) | % | Decisão L3 | Pacote atual | Pacote ideal | Brief 4/4 | Próximo passo |
|-----------------------------|-----------------|---|------------|--------------|--------------|-----------|---------------|
| `via_vf_absorcao` | ~214 | ~91% | **`molde_redesign`** | bespoke 4/4 **implementado** | `absorption-speed-rail` · `via-reference-board` · `via-vf-juggle-tap` · `route-trap` | **Feito** → [`l3-brief-vias-de-administracao-via_vf_absorcao.md`](l3-brief-vias-de-administracao-via_vf_absorcao.md) | Handcraft `g01+` (P0) |
| `via_tecnica_admin` | 68 | 28,9% | **`ok_generico` (P1)** | morphological · banner · cards · compare | genérico até volume justificar bespoke | **Não** — decisão 6.1: manter genérico no g02+ técnica | Lote dedicado pós-P0; brief bespoke **opcional** se `audit:subtopico-quality` apontar drift |
| `via_generico` | ~52 | cauda | **`ok_generico`** | morphological · center · vertical · compare | genérico | — | EXCETO/INCORRETA + perfis sem cluster |

> **Nota volume:** `via_tecnica_admin` é ramo forte (≥10%), mas **não** entra em `molde_redesign` neste ciclo — handcraft P0 foca absorção (`g01`). Técnica IM usa molde genérico com âncora CPCON até revisão P1.

### Cauda longa (`ok_generico`)

| Cluster | Slugs | Motivo |
|---------|-------|--------|
| Perfis de via | 25 | sem cluster absorção/técnica claro |
| Default — sem âncora | 11 | absorver em `via_generico` |
| Certo ou errado | 8 | &lt;10% isolado |
| 1ª passagem hepática | 3 | absorvido em `via_vf_absorcao` no handcraft |

### Goldens âncora (5/5 READY)

| Ramo | Arquivo `examples/` |
|------|---------------------|
| `via_vf_absorcao` (CORRETA) | `questao-premium-consulpam-vias-absorcao-oral.json` |
| `via_vf_absorcao` (indicação SC) | `questao-premium-vunesp-via-subcutanea.json` |
| `via_tecnica_admin` (V/F IM) | `questao-premium-cpcon-vias-im-vf.json` |
| `via_generico` (INCORRETA) | `questao-premium-cetrede-vias-injetaveis-incorreta.json` |
| `via_generico` (EXCETO) | `questao-premium-avancasp-vias-sublingual-exceto.json` |

---

## Passo 6 — Estado dos moldes

| Item | Status |
|------|--------|
| React bespoke `via_vf_absorcao` | ✅ `AbsorptionSpeedRailConceptMap`, `GoldenRuleViaReferenceBoard`, `LogicFlowViaVfJuggleTap`, `DangerZoneRouteTrap` |
| Wiring `NeuroSlide.tsx` / `pedagogicalBranch.ts` | ✅ `VIA_VF_MOLD` em `BRANCH_DESIGN_MAP` |
| `inferViaBranch` — V/F técnica IM → `via_tecnica_admin` | ✅ (EXCETO primeiro; `hasIii && tecnicaScore ≥ 1`) |
| E2E visual | `npm run test:e2e:visual-molds -- --grep="Vias"` |
| `via_tecnica_admin` bespoke | ⏸ **P1 opcional** — não implementar sem brief 4/4 (`VARIANT_MOLDS.md` §3) |

---

## Ordem sugerida de execução

1. ~~`via_vf_absorcao` — brief 4/4 + React~~ ✅  
2. Handcraft `vias-de-administracao-g01` (8 slugs P0 absorção)  
3. `test:e2e:visual-molds -- --grep="Vias"` antes de `audit:subtopico-quality --promote`  
4. Lote `via_tecnica_admin` (68 slugs) com molde genérico  
5. Cauda `via_generico` — compare semântico  

---

*Referências:* [`docs/VARIANT_MOLDS.md`](../docs/VARIANT_MOLDS.md) · [`docs/MOLD_AFFINITY_RESOLVER.md`](../docs/MOLD_AFFINITY_RESOLVER.md) · [`data/catalog-migration/visual-anchors.json`](../data/catalog-migration/visual-anchors.json)

# Promoção à Saúde e Prevenção de Agravos — Índice L3 (Mapeamento 2026-07-20)

**Subtópico:** Promoção à Saúde e Prevenção de Agravos  
**Pacote:** `promocao-a-saude-e-prevencao-de-agravos` · **110 slugs** (manifest completo)  
**Taxonomia:** `closed` (2026-07-20) · **Handcraft:** g01 applied (8/110)

---

## Fase 0 — Baseline

| Campo | Valor |
|-------|-------|
| Manifest | `data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-completo/manifest.json` |
| Export | 110/110 Supabase (2026-07-20) |
| Cluster | `npm run cluster:promocao` |
| Relatório | `artifacts/promocao-a-saude-e-prevencao-de-agravos-topic-cluster-report.json` |
| L3 gap (escopo) | `artifacts/l3-mold-gap-audit-promocao-a-saude-e-prevencao-de-agravos.json` |
| Guideline L2b | `lib/guidelines/promocaoSaude.ts` |
| Playbook | `data/catalog-migration/handcraft-playbooks/promocao-a-saude-e-prevencao-de-agravos.json` |

---

## Fase 1 — Cluster (110 slugs · threshold ramo forte = 11)

### Por ramo pedagógico

| `branch_id` | Slugs | % | Decisão L3 | Brief 4/4 |
|-------------|------:|--:|------------|-----------|
| `promocao_generico` | 57 | 51,8% | `cauda_longa` / `ok_generico` | — (sem Fase 3b) |
| `promocao_educacao_prevencao` | 46 | 41,8% | `ok_generico` | — (teste 3/3 abaixo) |
| `promocao_principios_direitos` | 6 | 5,5% | `ok_generico` | — |
| `promocao_art4_composicao` | 1 | 0,9% | `molde_redesign` | [art4](l3-brief-promocao-a-saude-e-prevencao-de-agravos-promocao_art4_composicao.md) |

**Drift:** 7 slugs (4 imunização · 2 sinais vitais · 1 idoso) — reparar `meta.subtopico` ou excluir do manifest.

### Top clusters temáticos

| Cluster | Slugs | % |
|---------|------:|--:|
| Conceito geral (catch-all heurística v1) | 50 | 45,5% |
| Educação em saúde / AB | 17 | 15,5% |
| Promoção × prevenção × proteção × recuperação | 17 | 15,5% |
| Determinantes sociais | 12 | 10,9% |
| Imunização (drift) | 4 | 3,6% |
| V/F legislação sanitária | 3 | 2,7% |
| Art. 4º composição SUS | 1 | 0,9% |

> **Correção vs. estimativa inicial:** Art. 4º **não** domina o pacote (~1%, não 40–60%). O volume real é **educação/prevenção + catch-all**.

---

## Fase 2 — Auditoria L3

```bash
npm run audit:l3-mold-gap -- --from-supabase --subtopico="Promoção à Saúde e Prevenção de Agravos"
```

- Moldes legados no repo → **não** `ok_existente`; política 2026-07-02 = `molde_redesign` quando ramo forte.
- Pacote Promoção **sem** entrada dedicada em `l3MoldGapCatalog.ts` — decisão via playbook + cluster.

---

## Fase 3 — Síntese de decisão

| Ramo | Volume | `l3_decision` | Pacote L3 | Próximo passo |
|------|--------|---------------|-----------|---------------|
| `promocao_art4_composicao` | 1 (+ piloto) | `molde_redesign` | `sus-art4-orbit` · `center` · `cards` · `scope-trap` | Handcraft por slug Art. 4º · E2E Playwright |
| `promocao_educacao_prevencao` | 46 | `ok_generico` | morphological · reference_table · tap · compare | Handcraft Modo A (g02+ por cluster) |
| `promocao_principios_direitos` | 6 | `ok_generico` | idem | Handcraft Modo A |
| `promocao_generico` | 57 | `cauda_longa` | genérico premium · fallback visual `sus-art4-orbit` | Refinar heurística cluster v2 |

### Teste espacial 3/3 — `promocao_educacao_prevencao` (rebaixa de bespoke)

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Pegadinha é só texto × texto? | **Sim** — determinantes, MEV, campanhas, C/E |
| 2 | Padrão espacial exclusivo em ≥11 slugs? | **Não** — temas heterogêneos |
| 3 | `compare` + `rows` + tap já ensinam? | **Sim** |

→ **Manter `ok_generico`** — sem brief 4/4 novo nem molde inédito.

### Ramos fortes L3 (Fase 3b obrigatória)

**Apenas 1:** `promocao_art4_composicao` (molde bespoke **já wired** + brief formal).

---

## Fase 3b — Briefs

| Ramo | Arquivo | Status |
|------|---------|--------|
| `promocao_art4_composicao` | [l3-brief-promocao-a-saude-e-prevencao-de-agravos-promocao_art4_composicao.md](l3-brief-promocao-a-saude-e-prevencao-de-agravos-promocao_art4_composicao.md) | **4/4** · gate OK · E2E pendente |
| Demais ramos | — | `ok_generico` / cauda longa — **dispensam** Fase 3b |

---

## Código e testes

| Área | Arquivo |
|------|---------|
| SUBTOPIC_DESIGN_MAP | `components/slides/core/themeGenerator.ts` |
| Molde Art. 4º | `docs/VARIANT_MOLDS.md` · `sus-art4-orbit` + `scope-trap` |
| Regressão Jest | `__tests__/slidePresentationSubtopicMold.test.ts` |
| Regressão E2E | **pendente** — `e2e/visual-mold-regression.spec.ts` |
| Golden piloto | `examples/questao-premium-sus-lei-8080-cesgranrio.json` |
| Cluster script | `scripts/cluster-promocao-a-saude-e-prevencao-de-agravos-topics.ts` |

---

## Ordem de execução handcraft (pós-L3)

1. ~~`Handcraft: … g01`~~ — applied 8/110 (piloto misto)
2. **g02** — educação em saúde + determinantes (~34 slugs candidatos)
3. **g03+** — princípios SUS / V-F / EXCETO (volume baixo)
4. Refinar `inferTopic()` no cluster (reduzir catch-all 50)
5. E2E Playwright + `audit:subtopico-quality --promote`

---

## Próximos triggers

| Objetivo | Comando |
|----------|---------|
| Continuar handcraft | `Handcraft: Promoção à Saúde e Prevenção de Agravos g02` |
| E2E molde Art. 4º | `Implementar molde: promocao_art4_composicao` |
| Pipeline vendável | `Pipeline completo: Promoção à Saúde e Prevenção de Agravos` |

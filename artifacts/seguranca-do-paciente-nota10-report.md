# Segurança do Paciente — relatório nota-10 (paridade Adolescente + L3 bespoke)

Atualizado: 2026-07-15 (verificação pipeline completa)

## Tabela de paridade

| Critério | Saúde do Adolescente | Segurança do Paciente | Paridade |
|----------|----------------------|----------------------|----------|
| Slugs handcraft applied | 16/16 | 59/59 | ✅ |
| Ramos fortes temáticos (≥6 slugs) | 2 | 3 | ✅ proporcional |
| **Bespoke React 4/4 (ramos fortes temáticos)** | **2/2** (ética, Z) | **3/3** (identificação, quedas, eventos) | ✅ |
| ok_generico com teste 3/3 | 4 | 2 (`sp_metas_internacionais` cauda 3; `sp_generico` drift — compare texto, sem pegadinha espacial) | ✅ |
| molde_inedito\|redesign pendente | 0 | 0 | ✅ |
| Brief INDEX + Fase 3b por ramo | sim | sim (`artifacts/l3-brief-seguranca-do-paciente-INDEX.md` + 3 bespoke) | ✅ |
| visual-anchors 1/ramo | 6 | 5/5 (`data/catalog-migration/visual-anchors.json`) | ✅ |
| Playwright L3 PASS | 13/13 | 12/12 (chromium desktop+mobile-375) | ✅ |
| A4 100% stamped | 16/16 | 59/59 (`a4_reviewed:true`) | ✅ |
| A4 humano substantivo (sem quota fake) | 3 | 5 `sampled:true` (~8,5% médio) | ✅ |
| Branch reconcile 0 mismatch | sim | 3 exceções documentadas (metas âncora) | ✅ |
| Apply Supabase 100% | 16/16 | 59/59 (g01–g04) | ✅ |
| Relatório nota-10 | sim | sim | ✅ |

**Escala MÉDIO (59 slugs):** L6 agent em todos `g*` + L6 humano 1 âncora por ramo forte temático.

## Resumo executivo

| applied | bespoke 4/4 ramos fortes | ok_generico 3/3 | A4 100% | A4 humano | Playwright | L6+captures | apply | production_ready | paridade | blockers |
|---------|--------------------------|-----------------|---------|-----------|------------|-------------|-------|------------------|----------|----------|
| 59/59 | 3/3 | 2 caudas | 59/59 | 5 sampled | 12/12 PASS | 4/4 g* pass + 4 PNG | 59/59 | sim | ✅ proporcional | — |

## Ramos L3 (59 slugs, threshold forte = 6)

| branch | slugs | decisão L3 | molde |
|--------|-------|------------|-------|
| sp_identificacao | 8 | molde_redesign → implementado | bespoke NSP 4/4 |
| sp_prevencao_quedas | 14 | molde_inedito → implementado | bespoke NSP 4/4 |
| sp_eventos_adversos | 13 | molde_inedito → implementado | bespoke NSP 4/4 |
| sp_metas_internacionais | 3 | ok_generico (cauda <6) | reference_table + compare |
| sp_generico | 21 | ok_generico (drift heterogêneo; pegadinha texto×texto) | morphological + compare |

## A4-mínimo

- Agente: `agent:seguranca-paciente-a4-minimo-v1`
- Protocolo: `docs/PROTOCOLO_A4_MINIMO_SEGURANCA_PACIENTE.md`
- Guideline: `lib/guidelines/segurancaPaciente.ts`
- Amostra humano substantiva (sem padding): ibade, facet, vunesp-7, omni, instituto-verbena-auditoria

## L6 âncoras por ramo forte

| Ramo | Slug âncora | L6 status |
|------|-------------|-----------|
| sp_identificacao | idecan-enfermagem-seguranca-do-paciente-1778712220716-5 | pass |
| sp_prevencao_quedas | vunesp-enfermagem-seguranca-do-paciente-1777102821787-7 | pass |
| sp_eventos_adversos | fcm-enfermagem-seguranca-do-paciente-1779563443877-3 | pass |
| sp_metas_internacionais | instituto-access-enfermagem-seguranca-do-paciente-1777102742836-2 | pass |

## Exceções documentadas (branch reconcile)

3 slugs `sp_metas_internacionais` mantêm ramo **declarado** (handcraft âncora) apesar de inferência priorizar identificação/quedas no corpus misto: instituto-access, instituto-verbena-2742836-1, vunesp-8133-2. Apply g04 com `--no-reconcile-branch`.

## Verificação desta sessão (2026-07-15)

1. `handcraft:brief` + `audit:l3-mold-gap` — pacote_prefix `seguranca-do-paciente`, 59 slugs
2. `validate:goldens --strict` g01–g04 — 59/59 PASS
3. `catalog:preflight --strict-v2-pedagogy` g01–g04 — 59/59 PASS
4. `audit:handcraft-dod` — 59/59 PASS
5. `audit:slug-alignment --strict` + `audit:numeric-factcheck` — 59/59 PASS
6. Playwright `--grep "Segurança do Paciente"` — 12/12 chromium PASS
7. L6 `audit:anchor-review --record-pass` g01–g04 — 4/4 pass
8. `catalog:apply-lote --dry-run` + `--apply` g01–g04 — 59/59 OK
9. `audit:subtopico-quality --promote` — `production_ready=true`, L1–L6 PASS

## Comandos de evidência

```bash
npm run audit:subtopico-quality -- --subtopico="Segurança do Paciente"
npx playwright test e2e/visual-mold-regression.spec.ts --grep "Segurança do Paciente"
npm run catalog:preflight -- --lote=seguranca-do-paciente-g04 --strict-v2-pedagogy
```

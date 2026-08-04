# Relatório nota-10 — saude-da-mulher

| Campo | Valor |
|-------|--------|
| Subtópico | Saúde da Mulher |
| pacote_prefix | saude-da-mulher |
| total_slugs | 246 |
| Programa | Fábrica 20 TE — Onda 3 nota-10 visual |
| Atualizado em | 2026-08-03 |

---

## Scorecard

| Critério | Meta | Atual | OK |
|----------|------|-------|----|
| applied / total | 100% | 246/246 | ✅ |
| status registry | applied | applied | ✅ |
| production_status | production_ready | production_ready | ✅ |
| Bespoke 4/4 ramos fortes | 6 ramos | 6 moldes 4/4 wired (reuso; sem React novo) | ✅ |
| ok_generico 3/3 | documentado | `mulher_generico` SoftLens/compare | ✅ |
| Âncoras | READY | prenatal VF `[READY]` strict-v2 | ✅ |
| A4-mínimo | N/A Onda 3 | N/A | ✅ |
| Playwright L3 | PASS ou captures | **BLOCKED** — `/dev/slide-mold-review` timeout local | ❌ |
| L6 + captures | escala grande | `visual_gallery=pending` até PNG | ⚠️ |
| Apply Supabase | 100% | já applied (P0 letter Onda 2) | ✅ |
| Barra conteúdo | verde | production_ready + âncora READY | ✅ |
| Barra visual | verde | Design visual + INDEX; evidência e2e pendente | ⚠️ |

---

## Print → primitivo (Onda 3)

| branch | Gesto | Primário | Molde (reuso) |
|--------|-------|----------|---------------|
| prenatal | Trilho gestacional | ProtocolRailRow / LabelBodyRow | mulher-*-prenatal* |
| parto | Deck fases PNH | PillarDeck | mulher-labor-* |
| papanicolau / mama | Espectro etário | CategoryStrip + LabelBodyRow | screening/mammography-* |
| puerperio | Linha 0–42 | ProtocolRailRow | mulher-puerperio-* |
| planejamento | Categorias | PillarDeck | contraception-* |
| generico | Genérico | SoftLens | morph / table / compare |

Refs: `artifacts/l3-brief-saude-da-mulher-INDEX.md` · `artifacts/l3-design-visual-saude-da-mulher-onda3.md` · Camada 7 strategy.

---

## Blockers

| ID | Descrição | Próximo passo |
|----|-----------|---------------|
| B1 | Playwright L3 timeout em `page.goto(/dev/slide-mold-review?branch=mulher_prenatal)` | Com `npm run dev` saudável: `npx playwright test e2e/visual-mold-regression.spec.ts --grep "Saúde da Mulher" --project=chromium` → PNGs + `visual_gallery=ready` |
| B2 | Variants Mulher ainda não compõem `primitives/` | P1 refator (sem mudar IDs de layout_variant) |

---

## Fechamento

```text
| applied | bespoke 4/4 | ok_generico | A4 | Playwright | L6 | production_ready | conteúdo | visual | blockers |
| 246/246 | 6/6 reuso | ok | N/A | blocked | pending captures | production_ready | verde | amarelo | B1 e2e / B2 primitives |
```

**Ship nota-10 visual:** parcial — documentação Camada 7 OK; evidência PNG/Playwright = re-run humano/agente com server OK.

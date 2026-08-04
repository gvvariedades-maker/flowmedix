# Design visual — Saúde da Mulher (Onda 3)

**Gesto pacote:** 6 metáforas já nomeadas nos briefs (trilho gestacional, fases parto, espectro rastreio, puerpério, contracepção).  
**Regra:** inspiração ≠ cópia; reusar moldes; sem React novo.

| branch | Erro espacial | Primários | Interação |
|--------|---------------|-----------|-----------|
| prenatal | trimestre/exame/consulta errados | rail + LabelBodyRow | tap ≤3 no logic |
| parto | fase/PNH vs conduta invasiva | PillarDeck + PolarityPanel | tap no labor flow |
| papanicolau / mama | faixa etária / intervalo | CategoryStrip + LabelBodyRow | board glanceable |
| puerperio | dia 0–42 / lactação | ProtocolRailRow | timeline |
| planejamento | categoria método | PillarDeck | spectrum |
| generico | texto×texto | SoftLens/compare | ok_generico |

DoD: `docs/NEUROSLIDES_VISUAL_STRATEGY.md` Camada 7.


## Fábrica G2 (2026-08-04)

`visual_bar: pass` — 18 variants compõem `primitives/`. Domínio (rails etários/fases) preservado. Evidência Playwright: ver `saude-da-mulher-nota10-report.md` B1.


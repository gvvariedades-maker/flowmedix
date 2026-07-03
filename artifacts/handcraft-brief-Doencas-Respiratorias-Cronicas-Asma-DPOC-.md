# Handcraft briefing — Doenças Respiratórias Crônicas (Asma, DPOC)

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — reparo/atualização L3 em slugs premium
- Seleção: Supabase: meta.pedagogical_branch ausente OU npm run audit:questao-readiness --from-supabase retorna FAIL
- **Primeiro lote:** `respiratorio-cronico-repair-l3-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `respiratorio-cronico` |
| status | applied (10/10 slugs) |
| manifest | `data/catalog-migration/respiratorio-cronico-completo/manifest.json` |
| lote_pattern | `respiratorio-cronico-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-respiratorio-*.json` |
| guideline | `lib/guidelines/respiratorioCronico.ts` |
| handcraft_meta | `data/catalog-migration/respiratorio-cronico-completo/handcraft-meta.json` |

**Padrão de lotes repair:** `respiratorio-cronico-repair-l3-g{NN}` · 1º lote: `respiratorio-cronico-repair-l3-g01`

## Ramos L3 (pedagogical_branch)

  - **respiratorio_vf_asma_dpoc** — I/II/III, semiologia respiratória V/F, afirmativas asma/DPOC · respiratorio-* bespoke (duel-deck, spo2-board, vf-juggle, trap-arena)
    Âncoras: examples/questao-premium-fgv-respiratorio-peak-flow-zonas-vf.json, examples/questao-premium-cebraspe-respiratorio-dpoc-exacerbacao-vf.json
  - **respiratorio_dpoc_oxigenio** — SpO₂, O₂ titulado, alvo 88–92%, Venturi, DPOC descompensada · bespoke spo2-reference-board + trap-arena
    Âncoras: examples/questao-premium-cpcon-dpoc-oxigenoterapia-alvo-vf.json
  - **respiratorio_asma_crise** — EXCETO, crise asmática, broncoespasmo, sibilância · genérico morphological · banner · cards · compare
    Âncoras: examples/questao-premium-vunesp-respiratorio-crise-asmatica-exceto.json
  - **respiratorio_tecnica_inalador** — MDI, espaçador, peak flow, corticoide inalatório, técnica · genérico + golden_rule rows
    Âncoras: examples/questao-premium-idecan-respiratorio-espacador-inalador-conceito.json, examples/questao-premium-idecan-respiratorio-corticoide-inalatorio-conceito.json
  - **respiratorio_generico** — Demais — sem fit claro nos ramos acima · genérico morphological · center · vertical · compare

## Clusters

- Espaçador e inalador — técnica MDI
- Oximetria de pulso / SpO₂
- O₂ titulado na DPOC (APS/emergência)
- Dispositivos de oxigenoterapia (Venturi)
- Asma na APS — educação terapêutica
- Espirometria VEF1/CVF
- Semiologia pediátrica — sibilos
- Semiologia respiratória V/F
- DPOC na UBS — papel do técnico

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=respiratorio-cronico-completo --subtopico="Doenças Respiratórias Crônicas (Asma, DPOC)" --limit=10000
# Handcraft → data/catalog-migration/respiratorio-cronico-repair-l3-g01/questions/*.json
npm run audit:questao-readiness -- --lote=respiratorio-cronico-repair-l3-g01
npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico="Doenças Respiratórias Crônicas (Asma, DPOC)" --only-premium --apply
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug
- A4 (piloto `/estudar/[slug]`) — usuário

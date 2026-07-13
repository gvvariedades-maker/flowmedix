# Legacy — pipeline builder / reclass (pré handcraft)

Arquivado em **2026-07**. Não usar em produção nova.

| Trilho ativo | Este diretório |
|--------------|----------------|
| Handcraft golden-v1 por slug | `upgradePremium*.ts` (builders híbridos) |
| `catalog:apply-lote` + scripts handcraft | `catalog-migration-upgrade-premium.ts` |
| `catalog:reclassify-subtopico` + `reclassifySubtopico.ts` | `scripts/reclass-*-inferences.ts` (lotes históricos) |

## Conteúdo

- **`catalog-migration/`** — `upgradePremiumHybrid`, builders dedicados por subtópico, router.
- **`scripts/`** — CLI de upgrade híbrido, geração de lotes, spot-checks legados.
- **`scripts/reclass/`** — inferências agente por onda/faixa (geram `artifacts/reclass/`).
- **`__tests__/catalog-migration/`** — testes Jest dos builders (`@/legacy/catalog-migration/…`); **permanecem na suíte** (`npm test`).

## O que permanece ativo fora de `legacy/`

- `lib/catalogMigration/premiumStubMarkers.ts` — gate anti-stub (`premiumGate`, auditorias).
- `lib/catalogMigration/reclassifySubtopico.ts` — taxonomia operacional.
- `npm run catalog:reclassify-subtopico` — CLI de reclassify.

## Comandos (somente manutenção histórica)

```bash
npm run catalog:upgrade-premium -- --lote=<lote> --dry-run
npx tsx legacy/scripts/reclass/reclass-faixa-a-anatomia-inferences.ts
```

Ver [`docs/DECISAO_TRILHO_A_UNICO.md`](../docs/DECISAO_TRILHO_A_UNICO.md).

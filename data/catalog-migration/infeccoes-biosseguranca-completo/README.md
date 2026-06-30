# Infecções no Contexto da Biossegurança — handcraft golden-v1

**Subtópico:** Infecções no Contexto da Biossegurança  
**Modo:** Handcraft total (25 slugs path canônico)  
**Status:** **applied** + **VENDÁVEL** (`production_ready` 2026-06-30) — g01–g04 — **25/25** slugs

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs no manifest | 25 (`manifest.json` — filtro slug-path) |
| Lotes previstos | g01 (8) · g02 (8) · g03 (8) · g04 (1) |
| Ramos L3 | `biosseg_iras_itu_cateter` · `biosseg_generico` |
| Âncora ITU/EXCETO | `examples/questao-premium-idib-umirim-itu-cateter-exceto.json` |
| Âncora IRAS V/F | `examples/questao-premium-fepese-infeccoes-biosseguranca-iras-vf.json` |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Taxonomia

O Supabase lista 55 questões com `titulo_aula` deste subtópico; ~30 são drift (processo de enfermagem, sondas, segurança do paciente, etc.). O pacote handcraft cobre **25 slugs** cujo `modulo_slug` contém `infeccoes-no-contexto-da-biosseguranca`. Slides ensinam **cada card da prova** — conteúdo ancorado no enunciado.

## Pipeline por lote

```bash
npm run catalog:export-lote -- --lote=infeccoes-biosseguranca-g01 --slugs=...
# handcraft: data/catalog-migration/infeccoes-biosseguranca-g01/questions/<slug>.json
npm run validate:goldens -- --lote=infeccoes-biosseguranca-g01 --strict
npm run audit:questao-readiness -- --lote=infeccoes-biosseguranca-g01
npm run catalog:apply-lote -- --lote=infeccoes-biosseguranca-g01 --dry-run
# apply só quando pedido:
npm run catalog:apply-lote -- --lote=infeccoes-biosseguranca-g01 --apply
```

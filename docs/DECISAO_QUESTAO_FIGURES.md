# ADR — Figuras no enunciado (`question_data.figures[]`)

**Status:** aceito · **Data:** 2026-07-20

## Contexto

Questões de prova (tirinha, charge, cartaz, figura tipográfica) referenciam material visual que o player não exibia. Publicar sem asset ou transcrição fiel quebra a experiência do aluno.

## Decisão

1. **Campo tipado** `question_data.figures[]` + `figure_policy` (`required` | `transcribed`).
2. **Storage:** bucket público Supabase `questao-figures/` — WebP, path `{tec_id}/f1.webp`, máx. 512 KB.
3. **Anti-padrão:** não usar `<img>` solto em `text_fragment` como caminho principal.
4. **Gate:** `detectMissingFigure` → `l2_missing_figure` (error com `--strict-v2-pedagogy` / preflight).
5. **Player:** ordem `figures[]` → `text_fragment` → `instruction` → `options`.
6. **Skills:** estender `avant-json-template` + `avant-golden-anchor-handcraft` (sem skill dedicada no dia 1).

## Políticas

| `figure_policy` | Quando | Exige |
|-----------------|--------|-------|
| `required` | Charge/tirinha só legível em raster | `figures[]` ≥ 1, URL allowlist Supabase |
| `transcribed` | Tipografia/cartaz legível no PDF | `text_fragment` ≥ 20 chars úteis |
| *(omitido)* | Enunciado sem referência visual | — |

## Consequências

- CLI: `npm run figures:upload`, `figures:audit`, `figures:backfill-pt`, `figures:patch-classes`.
- PT: inventário `--disciplina=portugues`; gate ampliado (HQ, quadrinho, sequência N-ésimo quadro, stub handcraft).
- Migration: `supabase/migrations/20260720120000_questao_figures_bucket.sql`.
- Backfill inicial: Classes de palavras (7–8 slugs `needs_figure`).

## Referências

- `docs/GOLDEN_CONTENT_STANDARD.md` § Figuras
- `lib/catalogMigration/figureContract.ts`
- `lib/questaoFigures.ts`

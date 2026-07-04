# imunizacao-g70 — handcraft_ready

**Subtópico:** Imunização · **Prioridade:** P1 pós-calendário (cadeia de frio + EXCETO + certo/errado)  
**Status:** `handcraft_ready` — 8/8 [READY] · pendente apply

## Slugs

| Slug | Banca | Cluster | Gabarito |
|------|-------|---------|----------|
| `selecon-enfermagem-imunizacao-1779564001927-5` | Selecon | Cadeia de frio | A |
| `selecon-enfermagem-imunizacao-1779564001927-6` | Selecon | Cadeia de frio* | C |
| `unesc-enfermagem-imunizacao-1779563975447-3` | Unesc | Cadeia de frio (V/F) | E |
| `unifil-enfermagem-imunizacao-1779564006577-9` | Unifil | Cadeia de frio | D |
| `legalle-enfermagem-processo-de-enfermagem-1780010579953-8` | Legalle | EXCETO | A |
| `legalle-enfermagem-processo-de-enfermagem-1780010917301-1` | Legalle | EXCETO (INCORRETA) | B |
| `igeduc-enfermagem-imunizacao-1779564035545-1` | Igeduc | Certo ou errado | A |
| `igeduc-enfermagem-imunizacao-1779564035545-2` | Igeduc | Certo ou errado | A |

\* selecon-6: conteúdo contraindicações — ramo `imunizacao_calendario`.

## Validação

- `audit:questao-readiness --strict-v2-pedagogy` — 8/8 [READY]
- `validate:goldens --strict` — 8/8
- `audit:slug-alignment --strict` — 8/8
- `audit:numeric-factcheck` — 8/8

## Workflow

```bash
npm run plan:imunizacao-g70
npm run catalog:export-lote -- --lote=imunizacao-g70 --from-manifest=data/catalog-migration/imunizacao-g70/manifest.json
npm run audit:questao-readiness -- --lote=imunizacao-g70 --strict-v2-pedagogy
npm run validate:goldens -- --strict --lote=imunizacao-g70
```
